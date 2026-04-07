/**
 * Backfill VERIFY Hash — genera hash SHA-256 per tutti gli articoli esistenti
 * che non hanno ancora un verifyHash nel DB.
 *
 * Uso: node scripts/backfill-verify-hash.mjs
 */
import { createHash } from "crypto";
import mysql2 from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

function generateVerifyHash(title, summary, sourceUrl, createdAt) {
  const payload = [
    (title || "").trim(),
    (summary || "").trim(),
    (sourceUrl || "").trim(),
    createdAt ? new Date(createdAt).toISOString() : "",
  ].join("|");
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

async function main() {
  const conn = await mysql2.createConnection(process.env.DATABASE_URL);
  console.log("[Backfill] Connesso al DB");

  // Recupera tutti gli articoli senza hash
  const [rows] = await conn.execute(
    "SELECT id, title, summary, sourceUrl, createdAt FROM news_items WHERE verifyHash IS NULL"
  );
  console.log(`[Backfill] Trovati ${rows.length} articoli senza hash`);

  let updated = 0;
  for (const row of rows) {
    const hash = generateVerifyHash(row.title, row.summary, row.sourceUrl, row.createdAt);
    await conn.execute("UPDATE news_items SET verifyHash = ? WHERE id = ?", [hash, row.id]);
    updated++;
    if (updated % 10 === 0) {
      console.log(`[Backfill] Aggiornati ${updated}/${rows.length}...`);
    }
  }

  console.log(`[Backfill] Completato: ${updated} articoli aggiornati con hash VERIFY`);
  await conn.end();
}

main().catch((err) => {
  console.error("[Backfill] Errore:", err);
  process.exit(1);
});
