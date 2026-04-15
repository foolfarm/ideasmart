/**
 * Invio massivo newsletter Prompt Collection 2026
 * a tutti gli iscritti attivi (status='active')
 * Mittente: ProofPress Business <noreply@proofpress.biz>
 * Batch: 50 email per chiamata API, pausa 1s tra batch
 */
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
config();

const FROM_EMAIL = "noreply@proofpress.biz";
const FROM_NAME = "ProofPress Business";
const SUBJECT = "99 prompt curati per lavorare meglio con l'AI";
const BASE_UNSUB_URL = "https://proofpress.ai/unsubscribe";
const TEMPLATE_PATH = "/home/ubuntu/upload/prompt-collection-newsletter-template.html";
const BATCH_SIZE = 50;
const PAUSE_MS = 1000;

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) { console.error("SENDGRID_API_KEY non trovata"); process.exit(1); }

// Legge il template originale
const baseHtml = readFileSync(TEMPLATE_PATH, "utf-8");

// Sostituisce il footer placeholder con il footer reale
function buildHtml(email, token) {
  const unsubUrl = token
    ? `${BASE_UNSUB_URL}?token=${token}`
    : `${BASE_UNSUB_URL}?email=${encodeURIComponent(email)}`;

  return baseHtml.replace(
    `Email promozionale template · Personalizzabile con logo, oggetto, preheader e CTA. <br />\n                Link principale: <a href="https://promptcollection2026.com/" target="_blank" style="color:#6d6558; text-decoration:underline;">promptcollection2026.com</a>`,
    `Hai ricevuto questa email perché sei iscritto alla newsletter di ProofPress.<br/>
                <a href="${unsubUrl}" style="color:#6d6558; text-decoration:underline;">Annulla iscrizione</a>
                &nbsp;&middot;&nbsp;
                <a href="https://proofpress.ai/privacy" style="color:#6d6558; text-decoration:underline;">Privacy Policy</a><br/><br/>
                ProofPress Business · noreply@proofpress.biz`
  );
}

async function sendBatch(recipients) {
  const personalizations = recipients.map(r => ({
    to: [{ email: r.email, name: r.name || undefined }],
  }));

  // Invia ogni email individualmente per avere link disiscrizione personalizzato
  const promises = recipients.map(async (r) => {
    const html = buildHtml(r.email, r.unsubscribeToken);
    const body = {
      personalizations: [{ to: [{ email: r.email }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      reply_to: { email: FROM_EMAIL, name: FROM_NAME },
      subject: SUBJECT,
      content: [{ type: "text/html", value: html }],
      tracking_settings: {
        click_tracking: { enable: false },
        open_tracking: { enable: true }
      },
      headers: {
        "List-Unsubscribe": `<${BASE_UNSUB_URL}?email=${encodeURIComponent(r.email)}>, <mailto:newsletter@proofpress.biz?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
      }
    };

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    return { email: r.email, ok: res.status === 202, status: res.status };
  });

  return Promise.all(promises);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main
const conn = await createConnection(process.env.DATABASE_URL);
const [subscribers] = await conn.execute(
  "SELECT email, name, unsubscribeToken FROM subscribers WHERE status = 'active' ORDER BY id ASC"
);
await conn.end();

console.log(`📧 Avvio invio massivo a ${subscribers.length} iscritti attivi`);
console.log(`   Mittente: ${FROM_NAME} <${FROM_EMAIL}>`);
console.log(`   Oggetto: ${SUBJECT}`);
console.log(`   Batch size: ${BATCH_SIZE} · Pausa: ${PAUSE_MS}ms`);
console.log('─'.repeat(60));

let sent = 0;
let errors = 0;
const startTime = Date.now();

for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
  const batch = subscribers.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(subscribers.length / BATCH_SIZE);

  process.stdout.write(`Batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, subscribers.length)})... `);

  try {
    const results = await sendBatch(batch);
    const batchSent = results.filter(r => r.ok).length;
    const batchErrors = results.filter(r => !r.ok).length;
    sent += batchSent;
    errors += batchErrors;

    if (batchErrors > 0) {
      const failed = results.filter(r => !r.ok).map(r => `${r.email}(${r.status})`).join(', ');
      console.log(`✓ ${batchSent} ok, ✗ ${batchErrors} errori: ${failed}`);
    } else {
      console.log(`✓ ${batchSent} ok`);
    }
  } catch (err) {
    console.log(`✗ Errore batch: ${err.message}`);
    errors += batch.length;
  }

  // Pausa tra batch (tranne l'ultimo)
  if (i + BATCH_SIZE < subscribers.length) {
    await sleep(PAUSE_MS);
  }
}

const elapsed = Math.round((Date.now() - startTime) / 1000);
console.log('─'.repeat(60));
console.log(`✅ Invio completato in ${elapsed}s`);
console.log(`   Inviate: ${sent} · Errori: ${errors} · Totale: ${subscribers.length}`);
