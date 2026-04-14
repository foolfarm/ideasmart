/**
 * Invia la newsletter promo Prompt Collection 2026 a tutti gli iscritti attivi nel DB.
 * Usa mysql2 e dotenv già installati nel progetto.
 * Mittente standard: IdeaSmart - Idee per il Business <noreply@ideasmart.ai>
 */
import { readFileSync } from "fs";
import { createConnection } from "mysql2/promise";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config({ quiet: true });

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const PROMO_FROM_EMAIL = "noreply@ideasmart.ai";
const PROMO_FROM_NAME  = "IdeaSmart - Idee per il Business";
const SUBJECT = "Prompt Collection 2026 - 99 prompt per avvocati, commercialisti e studenti - €39";
const TEMPLATE_PATH = "/home/ubuntu/newsletter_promptcollection2026_apple.html";

if (!SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY non trovata");
  process.exit(1);
}

// Parse DATABASE_URL: mysql://user:pass@host:port/db
function parseDbUrl(url) {
  // Rimuove parametri query (?ssl=...) prima del parsing
  const cleanUrl = url.split('?')[0];
  const m = cleanUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+):?(\d+)?\/(.+)/);
  if (!m) throw new Error("DATABASE_URL formato non valido");
  return {
    user: m[1],
    password: m[2],
    host: m[3],
    port: m[4] ? parseInt(m[4]) : 3306,
    database: m[5],
    ssl: { rejectUnauthorized: false }
  };
}

async function getRecipients(conn) {
  try {
    const [rows] = await conn.execute(
      "SELECT email, name FROM newsletter_subscribers WHERE active = 1 LIMIT 10000"
    );
    return rows;
  } catch (e) {
    console.warn("[WARN] Tabella newsletter_subscribers non trovata:", e.message);
    return [];
  }
}

async function sendBatch(recipients, htmlContent) {
  const payload = {
    personalizations: [{
      to: recipients.map(r => ({ email: r.email, name: r.name || "" })),
      subject: SUBJECT
    }],
    from: { email: PROMO_FROM_EMAIL, name: PROMO_FROM_NAME },
    reply_to: { email: PROMO_FROM_EMAIL, name: PROMO_FROM_NAME },
    content: [{ type: "text/html", value: htmlContent }]
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return res.status;
}

async function main() {
  const htmlContent = readFileSync(TEMPLATE_PATH, "utf-8");
  const dbConfig = parseDbUrl(DATABASE_URL);
  
  console.log("🔌 Connessione al database...");
  const conn = await createConnection(dbConfig);
  
  const recipients = await getRecipients(conn);
  await conn.end();

  if (recipients.length === 0) {
    console.log("⚠️  Nessun iscritto attivo trovato nel DB. Invio solo a ac@acinelli.com come fallback.");
    recipients.push({ email: "ac@acinelli.com", name: "Andrea Cinelli" });
  }

  console.log(`📧 Trovati ${recipients.length} iscritti attivi`);

  const BATCH_SIZE = 1000;
  let sent = 0;
  let errors = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    const status = await sendBatch(batch, htmlContent);
    
    if (status === 202 || status === 200) {
      sent += batch.length;
      console.log(`  ✅ Batch ${Math.floor(i/BATCH_SIZE)+1}: ${batch.length} email inviate (status ${status})`);
    } else {
      errors += batch.length;
      console.log(`  ❌ Batch ${Math.floor(i/BATCH_SIZE)+1}: errore status ${status}`);
    }
  }

  console.log(`\n✅ COMPLETATO`);
  console.log(`   Inviate: ${sent} | Errori: ${errors}`);
  console.log(`   Mittente: ${PROMO_FROM_NAME} <${PROMO_FROM_EMAIL}>`);
  console.log(`   Template: Apple-style Prompt Collection 2026`);
}

main().catch(e => {
  console.error("❌ Errore fatale:", e.message);
  process.exit(1);
});
