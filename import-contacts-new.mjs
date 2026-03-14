/**
 * Script di importazione nuova lista contatti
 * File: lista_contatti_email.valids.csv
 * Importa solo email con status "valid", salta i duplicati
 */

import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { randomBytes } from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const CSV_PATH = "/home/ubuntu/upload/lista_contatti_email.valids.csv";

function generateToken() {
  return randomBytes(32).toString("hex");
}

async function main() {
  const db = await createConnection(process.env.DATABASE_URL);
  console.log("✅ Connesso al database");

  // Leggi il CSV
  const csv = readFileSync(CSV_PATH, "utf-8");
  const lines = csv.trim().split("\n");
  const header = lines[0].toLowerCase();
  
  // Trova l'indice della colonna email
  const cols = header.split(",");
  const emailIdx = cols.findIndex(c => c.trim() === "email");
  const statusIdx = cols.findIndex(c => c.trim() === "email_status");
  
  console.log(`📋 Header: ${header}`);
  console.log(`📧 Colonna email: indice ${emailIdx}`);
  console.log(`✔️  Colonna status: indice ${statusIdx}`);

  // Filtra solo le email valide
  const validEmails = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(",");
    const email = parts[emailIdx]?.trim().toLowerCase();
    const status = statusIdx >= 0 ? parts[statusIdx]?.trim().toLowerCase() : "valid";
    
    if (email && (status === "valid" || statusIdx < 0)) {
      validEmails.push(email);
    }
  }

  console.log(`\n📊 Email valide trovate nel CSV: ${validEmails.length}`);

  // Conta iscritti esistenti prima dell'importazione
  const [countBefore] = await db.execute(
    "SELECT COUNT(*) as total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM subscribers"
  );
  console.log(`📊 Iscritti nel DB prima: ${countBefore[0].total} totali, ${countBefore[0].active} attivi`);

  // Importa in batch
  let added = 0;
  let skipped = 0;
  let errors = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < validEmails.length; i += BATCH_SIZE) {
    const batch = validEmails.slice(i, i + BATCH_SIZE);
    
    for (const email of batch) {
      try {
        // Controlla se esiste già
        const [existing] = await db.execute(
          "SELECT id, status FROM subscribers WHERE email = ?",
          [email]
        );

        if (existing.length > 0) {
          // Esiste già — se era unsubscribed, riattiva
          if (existing[0].status === "unsubscribed") {
            await db.execute(
              "UPDATE subscribers SET status = 'active', unsubscribed_at = NULL WHERE email = ?",
              [email]
            );
            added++;
            console.log(`  ♻️  Riattivato: ${email}`);
          } else {
            skipped++;
          }
        } else {
          // Nuovo iscritto
          const token = generateToken();
          const now = new Date();
          await db.execute(
            `INSERT INTO subscribers (email, name, status, subscribedAt, unsubscribeToken) 
             VALUES (?, ?, 'active', ?, ?)`,
            [email, null, now, token]
          );
          added++;
        }
      } catch (err) {
        errors++;
        console.error(`  ❌ Errore per ${email}:`, err.message);
      }
    }

    // Progress
    const processed = Math.min(i + BATCH_SIZE, validEmails.length);
    process.stdout.write(`\r  Progresso: ${processed}/${validEmails.length} (${added} aggiunti, ${skipped} duplicati, ${errors} errori)`);
  }

  console.log("\n");

  // Conta iscritti dopo l'importazione
  const [countAfter] = await db.execute(
    "SELECT COUNT(*) as total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active FROM subscribers"
  );

  console.log("═══════════════════════════════════════════");
  console.log("✅ IMPORTAZIONE COMPLETATA");
  console.log("═══════════════════════════════════════════");
  console.log(`📧 Email nel CSV:          ${validEmails.length}`);
  console.log(`✅ Nuovi aggiunti:          ${added}`);
  console.log(`⏭️  Duplicati saltati:       ${skipped}`);
  console.log(`❌ Errori:                  ${errors}`);
  console.log(`───────────────────────────────────────────`);
  console.log(`📊 Iscritti totali ora:     ${countAfter[0].total}`);
  console.log(`🟢 Iscritti attivi ora:     ${countAfter[0].active}`);
  console.log("═══════════════════════════════════════════");

  await db.end();
}

main().catch(err => {
  console.error("❌ Errore fatale:", err);
  process.exit(1);
});
