/**
 * Script di import mailing list CSV nel database subscribers IDEASMART
 * Uso: node import-subscribers.mjs
 */
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const CSV_PATH = "/home/ubuntu/upload/mailing_list_completa.valids.csv";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL non trovato nelle variabili d'ambiente");
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log("✅ Connessione al database stabilita");

  // Leggi il CSV
  const emails = [];
  const rl = createInterface({
    input: createReadStream(CSV_PATH),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.toLowerCase().startsWith("email")) continue; // skip header
    const parts = trimmed.split(",");
    const email = parts[0]?.trim().toLowerCase();
    const status = parts[1]?.trim().toLowerCase();
    if (email && status === "valid" && email.includes("@")) {
      emails.push(email);
    }
  }

  console.log(`📋 Email valide trovate nel CSV: ${emails.length}`);

  // Import a batch di 100 per evitare timeout
  const BATCH_SIZE = 100;
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    for (const email of batch) {
      try {
        await connection.execute(
          `INSERT IGNORE INTO subscribers (email, name, status, source, subscribedAt)
           VALUES (?, NULL, 'active', 'import_csv', NOW())`,
          [email]
        );
        imported++;
      } catch (err) {
        // Duplicate key = già presente
        if (err.code === "ER_DUP_ENTRY") {
          skipped++;
        } else {
          console.error(`❌ Errore per ${email}:`, err.message);
          errors++;
        }
      }
    }
    const progress = Math.min(i + BATCH_SIZE, emails.length);
    process.stdout.write(`\r⏳ Progresso: ${progress}/${emails.length} (${Math.round(progress/emails.length*100)}%)`);
  }

  console.log("\n");
  console.log("═══════════════════════════════════════");
  console.log("📊 RISULTATO IMPORT");
  console.log("═══════════════════════════════════════");
  console.log(`✅ Importate con successo: ${imported}`);
  console.log(`⚠️  Già presenti (skip):   ${skipped}`);
  console.log(`❌ Errori:                 ${errors}`);
  console.log("═══════════════════════════════════════");

  // Verifica totale nel DB
  const [rows] = await connection.execute(
    "SELECT COUNT(*) as total FROM subscribers WHERE status = 'active'"
  );
  console.log(`📬 Totale iscritti attivi nel DB: ${rows[0].total}`);

  await connection.end();
  console.log("✅ Import completato!");
}

main().catch((err) => {
  console.error("❌ Errore fatale:", err);
  process.exit(1);
});
