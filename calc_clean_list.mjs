import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

dotenv.config({ path: '/home/ubuntu/ideasmart/.env' });

// Leggi CSV e restituisci set di email uniche
async function readCsvEmails(path) {
  const emails = new Set();
  try {
    const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
    let isFirst = true;
    let emailCol = 0;
    for await (const line of rl) {
      if (isFirst) {
        // header: trova colonna email
        const headers = line.split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        emailCol = headers.indexOf('email');
        if (emailCol === -1) emailCol = 0;
        isFirst = false;
        continue;
      }
      const cols = line.split(',');
      const email = (cols[emailCol] || '').trim().toLowerCase().replace(/"/g, '');
      if (email && email.includes('@')) emails.add(email);
    }
  } catch (e) {
    console.error(`Errore lettura ${path}:`, e.message);
  }
  return emails;
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT email FROM subscribers WHERE status = "active"');
await conn.end();

const activeEmails = new Set(rows.map(r => r.email.toLowerCase().trim()));
console.log(`Iscritti attivi nel DB: ${activeEmails.size}`);

// Carica tutti i CSV di suppression
const files = {
  'blocks':         '/home/ubuntu/upload/suppression_blocks.csv',
  'bounces':        '/home/ubuntu/upload/suppression_bounces.csv',
  'spam_reports':   '/home/ubuntu/upload/suppression_spam_reports.csv',
  'invalid_emails': '/home/ubuntu/upload/suppression_invalid_emails.csv',
};

const allSuppressed = new Set();
for (const [name, path] of Object.entries(files)) {
  const set = await readCsvEmails(path);
  const overlap = [...activeEmails].filter(e => set.has(e));
  console.log(`  ${name}: ${set.size} unici nel CSV, ${overlap.length} presenti nella lista attiva`);
  for (const e of set) allSuppressed.add(e);
}

const cleanList = [...activeEmails].filter(e => !allSuppressed.has(e));
const removed = activeEmails.size - cleanList.length;

console.log(`\n=== RIEPILOGO ===`);
console.log(`Iscritti attivi nel DB:          ${activeEmails.size}`);
console.log(`Indirizzi da sopprimere (unici): ${allSuppressed.size}`);
console.log(`Overlap (attivi da rimuovere):   ${removed}`);
console.log(`LISTA NETTA RAGGIUNGIBILE:       ${cleanList.length}`);
