import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/ubuntu/ideasmart/.env' });

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const today = new Date().toISOString().split('T')[0];

console.log('Oggi:', today);
console.log('Ora UTC:', new Date().toISOString());
console.log('Ora CET:', new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
console.log('---');

// Ultimi 5 invii newsletter
const [rows] = await conn.execute(
  'SELECT id, subject, sent_at, created_at, recipient_count, status FROM newsletter_sends ORDER BY created_at DESC LIMIT 8'
);

if (rows.length === 0) {
  console.log('Nessun invio trovato nella tabella newsletter_sends');
} else {
  rows.forEach(r => {
    console.log(
      (r.sent_at || r.created_at)?.toISOString?.() || 'N/A',
      '|', r.status,
      '|', r.recipient_count, 'dest',
      '|', (r.subject || '').substring(0, 70)
    );
  });
}

// Controlla anche la preview di oggi
console.log('\n--- Preview invii ---');
const [preview] = await conn.execute(
  'SELECT id, subject, preview_sent_at, send_scheduled_at, status FROM newsletter_sends ORDER BY created_at DESC LIMIT 5'
);
preview.forEach(r => {
  console.log(
    'preview:', r.preview_sent_at?.toISOString?.() || 'N/A',
    '| scheduled:', r.send_scheduled_at?.toISOString?.() || 'N/A',
    '| status:', r.status,
    '|', (r.subject || '').substring(0, 50)
  );
});

await conn.end();
