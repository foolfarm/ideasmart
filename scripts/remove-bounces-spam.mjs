/**
 * remove-bounces-spam.mjs
 * Recupera da SendGrid tutti gli indirizzi in Hard Bounce e Spam Report
 * e li marca come 'unsubscribed' nel DB subscribers.
 *
 * Esecuzione: node scripts/remove-bounces-spam.mjs [--dry-run]
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const DRY_RUN = process.argv.includes('--dry-run');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SENDGRID_API_KEY) { console.error('❌ SENDGRID_API_KEY mancante'); process.exit(1); }
if (!DATABASE_URL)     { console.error('❌ DATABASE_URL mancante'); process.exit(1); }

async function fetchAll(endpoint, label) {
  const emails = new Set();
  let offset = 0;
  const limit = 500;
  console.log(`📡 Recupero ${label} da SendGrid...`);
  while (true) {
    const url = `https://api.sendgrid.com/v3/${endpoint}?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${SENDGRID_API_KEY}` } });
    if (!res.ok) { console.warn(`  ⚠️ ${label}: HTTP ${res.status}`); break; }
    const data = await res.json();
    const items = Array.isArray(data) ? data : [];
    if (items.length === 0) break;
    for (const item of items) {
      const email = (item.email ?? '').toLowerCase().trim();
      if (email) emails.add(email);
    }
    console.log(`  → offset ${offset}: ${items.length} record (totale: ${emails.size})`);
    if (items.length < limit) break;
    offset += limit;
  }
  return emails;
}

async function markUnsubscribed(conn, emails, reason) {
  if (emails.size === 0) { console.log(`  ℹ️ Nessun indirizzo ${reason} da processare`); return 0; }

  // Recupera solo gli iscritti attivi che corrispondono
  const [rows] = await conn.execute("SELECT id, email FROM subscribers WHERE status = 'active'");
  const toRemove = rows.filter(r => emails.has(r.email.toLowerCase().trim()));

  console.log(`\n📊 ${reason}: ${toRemove.length} iscritti attivi da rimuovere (su ${emails.size} totali SendGrid)`);
  if (toRemove.length === 0) return 0;

  // Mostra campione
  for (const r of toRemove.slice(0, 10)) console.log(`  - ${r.email}`);
  if (toRemove.length > 10) console.log(`  ... e altri ${toRemove.length - 10}`);

  if (DRY_RUN) { console.log('  ⚠️ DRY RUN — nessuna modifica'); return toRemove.length; }

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
  }
  console.log(`  ✅ ${updated} iscritti marcati 'unsubscribed' (${reason})`);
  return updated;
}

(async () => {
  try {
    console.log(`\n=== RIMOZIONE BOUNCE + SPAM — ProofPress Newsletter ===`);
    console.log(`Modalità: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

    const [bounces, spamReports] = await Promise.all([
      fetchAll('suppression/bounces', 'Hard Bounce'),
      fetchAll('suppression/spam_reports', 'Spam Report'),
    ]);

    const conn = await mysql.createConnection(DATABASE_URL);
    try {
      const removedBounce = await markUnsubscribed(conn, bounces, 'Hard Bounce');
      const removedSpam   = await markUnsubscribed(conn, spamReports, 'Spam Report');

      // Conteggio finale
      const [[{active}]] = await conn.execute("SELECT COUNT(*) as active FROM subscribers WHERE status='active'");

      console.log('\n=== RIEPILOGO ===');
      console.log(`Hard Bounce rimossi:  ${removedBounce}`);
      console.log(`Spam Report rimossi:  ${removedSpam}`);
      console.log(`Totale rimossi:       ${removedBounce + removedSpam}`);
      console.log(`Iscritti attivi ora:  ${active}`);
      if (DRY_RUN) console.log('⚠️  DRY RUN — nessuna modifica applicata');
      console.log('=================\n');
    } finally {
      await conn.end();
    }
  } catch (err) {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  }
})();
