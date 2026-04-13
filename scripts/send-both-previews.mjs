import 'dotenv/config';
import { createConnection } from 'mysql2/promise';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TO_EMAIL = 'ac@acinelli.com';

async function sendPreview(id, html, subject, label) {
  // Aggiungi banner identificativo in cima
  const banner = `
    <div style="background:#1a1a1a;color:#fff;padding:12px 24px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:13px;text-align:center;letter-spacing:0.05em;">
      📋 <strong>PREVIEW — ${label}</strong> &nbsp;|&nbsp; ID: ${id} &nbsp;|&nbsp; Rispondi con "INVIA ${id}" o "CANCELLA ${id}"
    </div>
  `;
  const fullHtml = banner + html;

  const body = {
    personalizations: [{ to: [{ email: TO_EMAIL }] }],
    from: { email: 'noreply@proofpress.ai', name: 'ProofPress Preview' },
    subject: `[PREVIEW ${label}] ${subject}`,
    content: [{ type: 'text/html', value: fullHtml }],
    tracking_settings: { click_tracking: { enable: false } }
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (res.status === 202) {
    console.log(`✅ Preview ${label} (ID ${id}) inviata a ${TO_EMAIL}`);
  } else {
    const err = await res.text();
    console.error(`❌ Errore invio ${label}:`, res.status, err);
  }
}

const conn = await createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  'SELECT id, subject, htmlContent FROM newsletter_sends WHERE id IN (840001, 840002) ORDER BY id ASC'
);
await conn.end();

for (const row of rows) {
  const label = row.id === 840001 ? 'VERSIONE A (automatica)' : 'VERSIONE B (approvata da te)';
  await sendPreview(row.id, row.htmlContent, row.subject, label);
  // Pausa tra i due invii
  await new Promise(r => setTimeout(r, 2000));
}

console.log('\nEntrambe le preview inviate. Rispondi con quale versione inviare agli iscritti.');
process.exit(0);
