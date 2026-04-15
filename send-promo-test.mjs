/**
 * Script one-shot: invia il test della newsletter Prompt Collection 2026
 * usando ESATTAMENTE il template HTML originale allegato
 * Destinatario: ac@acinelli.com
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
config();

const TO = "ac@acinelli.com";
const SUBJECT = "[TEST] 99 prompt curati per lavorare meglio con l'AI";
const FROM_EMAIL = "noreply@proofpress.biz";
const FROM_NAME = "ProofPress Business";
const UNSUB_URL = "https://proofpress.ai/unsubscribe";

// Legge il template originale esattamente come fornito
let html = readFileSync("/home/ubuntu/upload/prompt-collection-newsletter-template.html", "utf-8");

// Sostituisce il footer placeholder con il footer reale con link disiscrizione
html = html.replace(
  `Email promozionale template · Personalizzabile con logo, oggetto, preheader e CTA. <br />\n                Link principale: <a href="https://promptcollection2026.com/" target="_blank" style="color:#6d6558; text-decoration:underline;">promptcollection2026.com</a>`,
  `Hai ricevuto questa email perché sei iscritto alla newsletter di ProofPress.<br/>
                <a href="${UNSUB_URL}" style="color:#6d6558; text-decoration:underline;">Annulla iscrizione</a>
                &nbsp;&middot;&nbsp;
                <a href="https://proofpress.ai/privacy" style="color:#6d6558; text-decoration:underline;">Privacy Policy</a><br/><br/>
                ProofPress Business · noreply@proofpress.biz`
);

// Aggiunge il banner TEST in cima al body
const testBanner = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f59e0b;">
  <tr><td align="center" style="padding:8px 20px;">
    <span style="font-size:11px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif;letter-spacing:0.1em;">&#9888; EMAIL DI PROVA — NON DISTRIBUIRE</span>
  </td></tr>
</table>\n`;

html = html.replace("<body ", `<body `).replace(
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4efe6;`,
  testBanner + `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4efe6;`
);

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) { console.error("SENDGRID_API_KEY non trovata"); process.exit(1); }

const body = {
  personalizations: [{ to: [{ email: TO }] }],
  from: { email: FROM_EMAIL, name: FROM_NAME },
  reply_to: { email: FROM_EMAIL, name: FROM_NAME },
  subject: SUBJECT,
  content: [{ type: "text/html", value: html }],
  tracking_settings: {
    click_tracking: { enable: false },
    open_tracking: { enable: true }
  },
  headers: {
    "List-Unsubscribe": `<${UNSUB_URL}>, <mailto:newsletter@proofpress.biz?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
  }
};

const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

if (response.status === 202) {
  console.log(`✅ Email di test inviata con successo a ${TO}`);
  console.log(`   Mittente: ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`   Oggetto: ${SUBJECT}`);
} else {
  const err = await response.text();
  console.error(`❌ Errore SendGrid ${response.status}:`, err);
  process.exit(1);
}
