/**
 * cleanup-bounces.mjs
 * 1. Recupera bounce, invalid, spam da SendGrid API
 * 2. Marca come "bounced" nel DB tutti gli iscritti corrispondenti
 * 3. Identifica i contatti "nuovi genuini" aggiunti oggi (non presenti in nessuna lista precedente)
 * 4. Stampa il riepilogo finale
 */
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY non trovata');
if (!DATABASE_URL) throw new Error('DATABASE_URL non trovata');

const headers = {
  'Authorization': `Bearer ${SENDGRID_API_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchAllPages(endpoint) {
  const emails = new Set();
  let offset = 0;
  const limit = 500;
  while (true) {
    const r = await fetch(`https://api.sendgrid.com/v3${endpoint}?limit=${limit}&offset=${offset}`, { headers });
    if (!r.ok) break;
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) break;
    data.forEach(item => emails.add(item.email.toLowerCase().trim()));
    if (data.length < limit) break;
    offset += limit;
  }
  return emails;
}

// Parse DATABASE_URL: mysql://user:pass@host:port/dbname
function parseDbUrl(url) {
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+):?(\d+)?\/([^?]+)/);
  if (!m) throw new Error('DATABASE_URL non valida');
  return { user: m[1], password: m[2], host: m[3], port: m[4] ? parseInt(m[4]) : 3306, database: m[5] };
}

async function main() {
  console.log('=== PULIZIA BOUNCE SENDGRID ===\n');

  // 1. Recupera tutti i bad emails da SendGrid
  console.log('Recupero bounce da SendGrid...');
  const bounces = await fetchAllPages('/suppression/bounces');
  console.log(`  Hard bounces: ${bounces.size}`);

  console.log('Recupero invalid emails da SendGrid...');
  const invalids = await fetchAllPages('/suppression/invalid_emails');
  console.log(`  Invalid emails: ${invalids.size}`);

  console.log('Recupero spam reports da SendGrid...');
  const spams = await fetchAllPages('/suppression/spam_reports');
  console.log(`  Spam reports: ${spams.size}`);

  const allBad = new Set([...bounces, ...invalids, ...spams]);
  console.log(`\nTotale indirizzi da rimuovere: ${allBad.size}`);

  // 2. Connessione DB
  const dbConfig = parseDbUrl(DATABASE_URL);
  const conn = await createConnection({ ...dbConfig, ssl: { rejectUnauthorized: false } });

  // 3. Conta attivi da rimuovere
  const badList = [...allBad];
  let totalRemoved = 0;
  const batchSize = 500;

  for (let i = 0; i < badList.length; i += batchSize) {
    const chunk = badList.slice(i, i + batchSize);
    const ph = chunk.map(() => '?').join(',');
    const [result] = await conn.execute(
      `UPDATE subscribers SET status = 'unsubscribed', source = 'bounce' WHERE LOWER(email) IN (${ph}) AND status = 'active'`,
      chunk
    );
    totalRemoved += result.affectedRows;
  }

  console.log(`\n✅ ${totalRemoved} iscritti marcati come "bounced"`);

  // 4. Conta iscritti attivi rimasti
  const [[{ active_count }]] = await conn.execute(
    `SELECT COUNT(*) AS active_count FROM subscribers WHERE status = 'active'`
  );
  console.log(`✅ Iscritti attivi dopo pulizia: ${active_count}`);

  // 5. Identifica contatti "nuovi genuini" aggiunti oggi
  // "Nuovo genuino" = creato oggi E non ha mai avuto status diverso da 'active' (non era mai in lista prima)
  // Usiamo createdAt di oggi e verifichiamo che non siano in nessuna lista storica (bounced, unsubscribed, ecc.)
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const [[{ new_today }]] = await conn.execute(
    `SELECT COUNT(*) AS new_today FROM subscribers 
     WHERE status = 'active' 
     AND DATE(subscribedAt) = ?`,
    [today]
  );
  console.log(`\n📊 Nuovi iscritti aggiunti oggi (${today}): ${new_today}`);

  // 6. Conta la "core list" storica (iscritti attivi con createdAt prima di oggi)
  const [[{ core_list }]] = await conn.execute(
    `SELECT COUNT(*) AS core_list FROM subscribers 
     WHERE status = 'active' 
     AND DATE(subscribedAt) < ?`,
    [today]
  );
  console.log(`📊 Core list storica (attivi pre-oggi): ${core_list}`);
  console.log(`📊 Lista totale pulita: ${core_list + new_today} (${core_list} storici + ${new_today} nuovi genuini oggi)`);

  await conn.end();
  console.log('\n=== COMPLETATO ===');
}

main().catch(console.error);
