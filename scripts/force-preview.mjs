/**
 * Script per forzare l'invio della preview newsletter bypassando il guard giornaliero.
 * Uso: npx tsx scripts/force-preview.mjs
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL mancante"); process.exit(1); }

// 1. Rimuovi i record di oggi dal DB per bypassare il guard DB-level
const conn = await mysql.createConnection(DB_URL);
const db = drizzle(conn);

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayStr = today.toISOString().slice(0, 10);

console.log(`[ForcePreview] Rimozione record newsletter_sends di oggi (${todayStr})...`);
await conn.execute(
  `DELETE FROM newsletter_sends WHERE created_at >= ? AND status IN ('pending','approved','sending','sent')`,
  [today]
);
console.log("[ForcePreview] Record rimossi. Avvio preview...");

// 2. Importa e chiama sendUnifiedPreview
const { sendUnifiedPreview } = await import("../server/unifiedNewsletter.js");
const result = await sendUnifiedPreview();
console.log("[ForcePreview] Risultato:", JSON.stringify(result, null, 2));

await conn.end();
process.exit(0);
