/**
 * Script invio newsletter promozionale IDEASMART
 * Legge il template HTML, recupera gli iscritti dal DB e invia via SendGrid
 * Uso: node scripts/send_promo_newsletter.mjs [--preview]
 *   --preview  → stampa solo il numero di iscritti e l'anteprima del subject, senza inviare
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW_MODE = process.argv.includes("--preview");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL       = process.env.SENDGRID_FROM_EMAIL || "newsletter@ideasmart.ai";
const FROM_NAME        = process.env.SENDGRID_FROM_NAME  || "IDEASMART";
const DATABASE_URL     = process.env.DATABASE_URL;

const SUBJECT = "🚀 IDEASMART è live — Il primo sito italiano di notizie su AI, Startup e Venture Capital. Gratis.";
const TEMPLATE_PATH = path.join(__dirname, "../newsletter_promo_ideasmart.html");

async function getSubscribers(db) {
  // Recupera tutti gli utenti verificati con email confermata
  const [rows] = await db.execute(
    `SELECT email, username FROM site_users WHERE email_verified = 1 ORDER BY created_at ASC`
  );
  return rows;
}

async function sendEmail(to, toName, htmlContent) {
  const personalizedHtml = htmlContent
    .replace(/{{unsubscribe_url}}/g, `https://ideasmart.ai/unsubscribe?email=${encodeURIComponent(to)}`);

  const payload = {
    personalizations: [{ to: [{ email: to, name: toName || to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: SUBJECT,
    content: [{ type: "text/html", value: personalizedHtml }],
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking: { enable: true },
    },
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${err}`);
  }
  return true;
}

async function main() {
  if (!SENDGRID_API_KEY) {
    console.error("❌ SENDGRID_API_KEY non configurata");
    process.exit(1);
  }
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL non configurata");
    process.exit(1);
  }

  const htmlContent = fs.readFileSync(TEMPLATE_PATH, "utf-8");
  console.log(`📧 Template caricato: ${TEMPLATE_PATH}`);
  console.log(`📌 Subject: ${SUBJECT}`);

  const db = await mysql.createConnection(DATABASE_URL);

  try {
    const subscribers = await getSubscribers(db);
    console.log(`👥 Iscritti verificati trovati: ${subscribers.length}`);

    if (PREVIEW_MODE) {
      console.log("\n✅ MODALITÀ ANTEPRIMA — nessuna email inviata.");
      console.log("Primi 5 destinatari:");
      subscribers.slice(0, 5).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.email} (${s.username || "—"})`);
      });
      if (subscribers.length > 5) {
        console.log(`  ... e altri ${subscribers.length - 5} iscritti`);
      }
      await db.end();
      return;
    }

    // Invio effettivo
    let sent = 0;
    let errors = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail(sub.email, sub.username, htmlContent);
        sent++;
        if (sent % 10 === 0) console.log(`  ✉️  Inviate: ${sent}/${subscribers.length}`);
        // Rate limiting: max 100 req/s SendGrid free tier
        await new Promise(r => setTimeout(r, 15));
      } catch (err) {
        errors++;
        console.error(`  ❌ Errore per ${sub.email}: ${err.message}`);
      }
    }

    console.log(`\n✅ Invio completato: ${sent} email inviate, ${errors} errori`);
  } finally {
    await db.end();
  }
}

main().catch(err => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
