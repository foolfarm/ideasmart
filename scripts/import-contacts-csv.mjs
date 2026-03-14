/**
 * Script di importazione iscritti da contacts.valids(1).csv
 * Legge le email valide e le inserisce nel DB, saltando i duplicati.
 */
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

const CSV_PATH = '/home/ubuntu/upload/contacts.valids(1).csv';
const DATABASE_URL = process.env.DATABASE_URL;

function generateToken() {
  return randomBytes(32).toString('hex');
}

function parseCSV(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length === 0) return [];
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const emailIdx = headers.indexOf('E-mail 1 - Value');
  const statusIdx = headers.indexOf('email_status');
  const firstNameIdx = headers.indexOf('First Name');
  const lastNameIdx = headers.indexOf('Last Name');
  
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const email = (cols[emailIdx] || '').trim().replace(/^"|"$/g, '');
    const status = (cols[statusIdx] || '').trim().replace(/^"|"$/g, '');
    const firstName = firstNameIdx >= 0 ? (cols[firstNameIdx] || '').trim().replace(/^"|"$/g, '') : '';
    const lastName = lastNameIdx >= 0 ? (cols[lastNameIdx] || '').trim().replace(/^"|"$/g, '') : '';
    
    if (email && status === 'valid') {
      results.push({ email: email.toLowerCase(), firstName, lastName });
    }
  }
  return results;
}

async function main() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const conn = await createConnection(DATABASE_URL);

  // Leggi il CSV
  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  const contacts = parseCSV(csvContent);

  console.log(`Trovati ${contacts.length} contatti validi nel CSV`);

  let added = 0;
  let reactivated = 0;
  let duplicates = 0;
  let errors = 0;

  for (const { email, firstName, lastName } of contacts) {
    try {
      // Controlla se esiste già
      const [existing] = await conn.query(
        'SELECT id, status FROM subscribers WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        // Se esiste ma è unsubscribed, riattivalo
        if (existing[0].status === 'unsubscribed') {
          await conn.query(
            'UPDATE subscribers SET status = "active", updatedAt = NOW() WHERE email = ?',
            [email]
          );
          reactivated++;
        } else {
          duplicates++;
        }
        continue;
      }

      // Inserisci nuovo iscritto
      const name = [firstName, lastName].filter(Boolean).join(' ') || null;
      const token = generateToken();
      const now = new Date();

      await conn.query(
        `INSERT INTO subscribers (email, name, status, newsletter, unsubscribeToken, subscribedAt)
         VALUES (?, ?, 'active', 'ai4business', ?, ?)`,
        [email, name, token, now]
      );
      added++;
    } catch (err) {
      console.error(`  ✗ Errore per ${email}:`, err.message);
      errors++;
    }
  }

  // Conta totale iscritti attivi
  const [countResult] = await conn.query(
    'SELECT COUNT(*) as active FROM subscribers WHERE status = "active"'
  );
  const totalActive = countResult[0].active;

  await conn.end();

  console.log('\n=== RISULTATO IMPORTAZIONE ===');
  console.log(`✓ Nuovi aggiunti: ${added}`);
  console.log(`↺ Riattivati: ${reactivated}`);
  console.log(`- Duplicati saltati: ${duplicates}`);
  console.log(`✗ Errori: ${errors}`);
  console.log(`\nTotale iscritti attivi nel DB: ${totalActive.toLocaleString('it-IT')}`);
}

main().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
