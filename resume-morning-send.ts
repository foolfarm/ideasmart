/**
 * Script di RIPRESA invio newsletter BUONGIORNO del 26 aprile 2026
 * - Legge le email già inviate dal log /tmp/newsletter-send.log
 * - Invia SOLO alle email rimanenti (non ancora inviate)
 * - Aggiorna il record DB 1200005 a 'sent' al completamento
 */
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const NEWSLETTER_SEND_ID = 1200005;

if (!SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY non trovata");
  process.exit(1);
}

// Leggi le email già inviate dal log
function getAlreadySentEmails(): Set<string> {
  const logPath = "/tmp/newsletter-send.log";
  const sent = new Set<string>();
  if (!fs.existsSync(logPath)) return sent;
  const lines = fs.readFileSync(logPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/Sent successfully to (.+@.+\..+)/);
    if (match) sent.add(match[1].trim().toLowerCase());
  }
  return sent;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "noreply@proofpress.ai", name: "ProofPress" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });
    return response.status === 202;
  } catch {
    return false;
  }
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL!);

  // Recupera il contenuto della newsletter dal DB
  const [sendRows] = await conn.execute(
    "SELECT subject, htmlContent FROM newsletter_sends WHERE id = ?",
    [NEWSLETTER_SEND_ID]
  ) as any;

  if (!sendRows || sendRows.length === 0) {
    console.error("Record newsletter non trovato");
    await conn.end();
    process.exit(1);
  }

  const { subject, htmlContent } = sendRows[0];
  console.log(`[Resume] Oggetto: ${subject}`);

  // Recupera tutti gli iscritti attivi
  const [subscribers] = await conn.execute(
    "SELECT email FROM newsletter_subscribers WHERE status = 'active' ORDER BY email ASC"
  ) as any;

  const allEmails: string[] = subscribers.map((s: any) => s.email.toLowerCase());
  console.log(`[Resume] Totale iscritti attivi: ${allEmails.length}`);

  // Leggi le email già inviate
  const alreadySent = getAlreadySentEmails();
  console.log(`[Resume] Già inviate (dal log): ${alreadySent.size}`);

  // Filtra solo le email rimanenti
  const remaining = allEmails.filter(e => !alreadySent.has(e));
  console.log(`[Resume] Da inviare: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log("[Resume] ✅ Tutte le email già inviate! Aggiorno il DB...");
    await conn.execute(
      "UPDATE newsletter_sends SET status = 'sent', recipientCount = ?, sentAt = NOW() WHERE id = ?",
      [alreadySent.size, NEWSLETTER_SEND_ID]
    );
    await conn.end();
    return;
  }

  // Invia in batch da 200 con delay 2s
  const BATCH_SIZE = 200;
  const DELAY_MS = 2000;
  let sent = 0;
  let errors = 0;
  const logStream = fs.createWriteStream("/tmp/newsletter-send.log", { flags: "a" });

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const total = alreadySent.size + sent + batch.length;

    const results = await Promise.allSettled(
      batch.map(email => sendEmail(email, subject, htmlContent))
    );

    let batchOk = 0;
    let batchErr = 0;
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === "fulfilled" && r.value) {
        logStream.write(`[Email] Sent successfully to ${batch[j]}\n`);
        batchOk++;
        sent++;
      } else {
        logStream.write(`[Email] FAILED to ${batch[j]}\n`);
        batchErr++;
        errors++;
      }
    }

    const totalSent = alreadySent.size + sent;
    console.log(`[Resume] Batch ${batchNum}: ${totalSent}/${alreadySent.size + remaining.length} (✓${batchOk} ✗${batchErr})`);

    if (i + BATCH_SIZE < remaining.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  logStream.end();

  const totalRecipients = alreadySent.size + sent;
  console.log(`[Resume] ✅ Completato: ${sent} nuove email inviate, ${errors} errori. Totale: ${totalRecipients}`);

  // Aggiorna il DB
  await conn.execute(
    "UPDATE newsletter_sends SET status = 'sent', recipientCount = ?, sentAt = NOW() WHERE id = ?",
    [totalRecipients, NEWSLETTER_SEND_ID]
  );
  console.log(`[Resume] ✅ DB aggiornato: status=sent, recipientCount=${totalRecipients}`);

  await conn.end();
}

main().catch(e => {
  console.error("[Resume] ❌ Errore critico:", e);
  process.exit(1);
});
