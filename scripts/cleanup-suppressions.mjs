/**
 * cleanup-suppressions.mjs
 * Recupera da SendGrid la lista completa di spam reports, bounces e blocks
 * e rimuove (o disattiva) tutti quegli indirizzi dalla tabella subscribers.
 *
 * Uso: node scripts/cleanup-suppressions.mjs
 */

import "dotenv/config";
import mysql from "mysql2/promise";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY non trovata nelle env");
  process.exit(1);
}

// ── Helpers SendGrid ──────────────────────────────────────────────────────────

async function fetchAllPages(endpoint) {
  const emails = new Set();
  let offset = 0;
  const limit = 500;

  while (true) {
    const url = `https://api.sendgrid.com/v3/${endpoint}?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`❌ Errore API SendGrid [${endpoint}]: ${res.status} ${body}`);
      break;
    }

    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.result ?? []);

    if (items.length === 0) break;

    for (const item of items) {
      const email = (item.email ?? "").toLowerCase().trim();
      if (email) emails.add(email);
    }

    console.log(`  [${endpoint}] offset=${offset} → ${items.length} record (totale: ${emails.size})`);

    if (items.length < limit) break;
    offset += limit;
  }

  return emails;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 Recupero suppressions da SendGrid...\n");

  const [spamSet, bounceSet, blockSet, invalidSet, unsubSet] = await Promise.all([
    fetchAllPages("suppression/spam_reports"),
    fetchAllPages("suppression/bounces"),
    fetchAllPages("suppression/blocks"),
    fetchAllPages("suppression/invalid_emails"),
    fetchAllPages("asm/suppressions/global"),
  ]);

  const allSuppressed = new Set([
    ...spamSet,
    ...bounceSet,
    ...blockSet,
    ...invalidSet,
    ...unsubSet,
  ]);

  console.log(`\n📊 Riepilogo suppressions:`);
  console.log(`  Spam reports:   ${spamSet.size}`);
  console.log(`  Bounces:        ${bounceSet.size}`);
  console.log(`  Blocks:         ${blockSet.size}`);
  console.log(`  Invalid emails: ${invalidSet.size}`);
  console.log(`  Unsubscribed:   ${unsubSet.size}`);
  console.log(`  ─────────────────────────`);
  console.log(`  TOTALE UNICI:   ${allSuppressed.size}\n`);

  if (allSuppressed.size === 0) {
    console.log("✅ Nessuna suppression trovata. Nulla da rimuovere.");
    return;
  }

  // ── Connessione DB ──────────────────────────────────────────────────────────
  const conn = await mysql.createConnection(DATABASE_URL);

  try {
    // Conta quanti iscritti attivi corrispondono
    const emailList = [...allSuppressed];

    // MySQL ha un limite per IN clause, processiamo in batch da 500
    const BATCH = 500;
    let totalFound = 0;
    let totalRemoved = 0;

    for (let i = 0; i < emailList.length; i += BATCH) {
      const batch = emailList.slice(i, i + BATCH);
      const placeholders = batch.map(() => "?").join(",");

      // Conta prima
      const [countRows] = await conn.execute(
        `SELECT COUNT(*) as cnt FROM subscribers WHERE email IN (${placeholders}) AND status = 'active'`,
        batch
      );
      const found = countRows[0].cnt;
      totalFound += found;

      if (found > 0) {
        // Aggiorna status a 'unsubscribed' e imposta unsubscribedAt (per audit trail)
        const [result] = await conn.execute(
          `UPDATE subscribers SET status = 'unsubscribed', unsubscribedAt = NOW() WHERE email IN (${placeholders}) AND status = 'active'`,
          batch
        );
        totalRemoved += result.affectedRows;
        console.log(`  Batch ${Math.floor(i / BATCH) + 1}: trovati ${found}, rimossi ${result.affectedRows}`);
      }
    }

    console.log(`\n✅ Operazione completata:`);
    console.log(`  Iscritti attivi trovati nelle suppressions: ${totalFound}`);
    console.log(`  Iscritti disattivati (status → suppressed):  ${totalRemoved}`);

    // Verifica finale
    const [activeCount] = await conn.execute(
      `SELECT COUNT(*) as cnt FROM subscribers WHERE status = 'active'`
    );
    const [unsubCount] = await conn.execute(
      `SELECT COUNT(*) as cnt FROM subscribers WHERE status = 'unsubscribed'`
    );
    console.log(`\n📋 Stato finale DB:`);
    console.log(`  Iscritti attivi:       ${activeCount[0].cnt}`);
    console.log(`  Iscritti disiscritti:  ${unsubCount[0].cnt}`);

  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error("❌ Errore fatale:", err);
  process.exit(1);
});
