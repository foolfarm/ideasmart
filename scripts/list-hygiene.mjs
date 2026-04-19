/**
 * list-hygiene.mjs
 * Recupera tutti i Global Unsubscribe da SendGrid e rimuove dal DB
 * gli iscritti corrispondenti (status = 'unsubscribed').
 *
 * Esecuzione: node scripts/list-hygiene.mjs [--dry-run]
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const DRY_RUN = process.argv.includes('--dry-run');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SENDGRID_API_KEY) { console.error('❌ SENDGRID_API_KEY mancante'); process.exit(1); }
if (!DATABASE_URL)     { console.error('❌ DATABASE_URL mancante'); process.exit(1); }

// ─── 1. Recupera tutti i Global Unsubscribe da SendGrid (paginazione) ─────────
async function fetchAllGlobalUnsubscribes() {
  const allEmails = new Set();
  let offset = 0;
  const limit = 500;

  console.log('📡 Recupero Global Unsubscribe da SendGrid...');
  while (true) {
    const url = `https://api.sendgrid.com/v3/asm/suppressions/global?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${SENDGRID_API_KEY}` }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SendGrid API error ${res.status}: ${text}`);
    }
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.suppressions ?? []);
    if (items.length === 0) break;

    for (const item of items) {
      const email = (item.email ?? item).toString().toLowerCase().trim();
      if (email) allEmails.add(email);
    }
    console.log(`  → offset ${offset}: ${items.length} record (totale: ${allEmails.size})`);
    if (items.length < limit) break;
    offset += limit;
  }

  // Recupera anche i Bounce (hard bounce = indirizzi non validi)
  console.log('📡 Recupero Bounce (hard) da SendGrid...');
  offset = 0;
  while (true) {
    const url = `https://api.sendgrid.com/v3/suppression/bounces?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${SENDGRID_API_KEY}` }
    });
    if (!res.ok) break;
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) break;
    for (const item of items) {
      const email = (item.email ?? '').toLowerCase().trim();
      if (email) allEmails.add(email);
    }
    console.log(`  → bounce offset ${offset}: ${items.length} record (totale: ${allEmails.size})`);
    if (items.length < limit) break;
    offset += limit;
  }

  // Recupera anche gli Spam Report
  console.log('📡 Recupero Spam Reports da SendGrid...');
  offset = 0;
  while (true) {
    const url = `https://api.sendgrid.com/v3/suppression/spam_reports?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${SENDGRID_API_KEY}` }
    });
    if (!res.ok) break;
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) break;
    for (const item of items) {
      const email = (item.email ?? '').toLowerCase().trim();
      if (email) allEmails.add(email);
    }
    console.log(`  → spam offset ${offset}: ${items.length} record (totale: ${allEmails.size})`);
    if (items.length < limit) break;
    offset += limit;
  }

  return allEmails;
}

// ─── 2. Confronta con il DB e rimuove ─────────────────────────────────────────
async function cleanDatabase(suppressedEmails) {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    // Recupera tutti gli iscritti attivi dal DB
    const [rows] = await conn.execute(
      "SELECT id, email FROM subscribers WHERE status = 'active'",
      []
    );
    console.log(`\n📊 Iscritti attivi nel DB: ${rows.length}`);

    const toRemove = rows.filter(r => suppressedEmails.has(r.email.toLowerCase().trim()));
    const toKeep   = rows.filter(r => !suppressedEmails.has(r.email.toLowerCase().trim()));

    console.log(`✅ Da mantenere:  ${toKeep.length}`);
    console.log(`🗑️  Da rimuovere: ${toRemove.length}`);

    if (toRemove.length === 0) {
      console.log('\n✅ Nessun iscritto da rimuovere. Lista già pulita.');
      return { removed: 0, kept: toKeep.length };
    }

    console.log('\nPrimi 20 da rimuovere:');
    for (const r of toRemove.slice(0, 20)) {
      console.log(`  - ${r.email}`);
    }
    if (toRemove.length > 20) console.log(`  ... e altri ${toRemove.length - 20}`);

    if (DRY_RUN) {
      console.log('\n⚠️  DRY RUN — nessuna modifica al DB.');
      return { removed: toRemove.length, kept: toKeep.length, dryRun: true };
    }

    // Aggiorna status a 'unsubscribed' (non cancella fisicamente per audit)
    const ids = toRemove.map(r => r.id);
    const BATCH = 500;
    let updated = 0;
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH);
      const placeholders = batch.map(() => '?').join(',');
      const [result] = await conn.execute(
        `UPDATE subscribers SET status = 'unsubscribed', unsubscribedAt = NOW() WHERE id IN (${placeholders})`,
        batch
      );
      updated += result.affectedRows;
      console.log(`  → Batch ${Math.floor(i/BATCH)+1}: ${result.affectedRows} aggiornati`);
    }

    console.log(`\n✅ Operazione completata: ${updated} iscritti marcati come 'unsubscribed'`);
    return { removed: updated, kept: toKeep.length };
  } finally {
    await conn.end();
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log(`\n=== LIST HYGIENE — ProofPress Newsletter ===`);
    console.log(`Modalità: ${DRY_RUN ? 'DRY RUN (nessuna modifica)' : 'LIVE (modifiche al DB)'}\n`);

    const suppressedEmails = await fetchAllGlobalUnsubscribes();
    console.log(`\n📋 Totale email soppresse su SendGrid: ${suppressedEmails.size}`);

    const result = await cleanDatabase(suppressedEmails);

    console.log('\n=== RIEPILOGO ===');
    console.log(`Soppresse SendGrid: ${suppressedEmails.size}`);
    console.log(`Rimosse dal DB:     ${result.removed}`);
    console.log(`Mantenute attive:   ${result.kept}`);
    if (result.dryRun) console.log('⚠️  DRY RUN — nessuna modifica applicata');
    console.log('=================\n');
  } catch (err) {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  }
})();
