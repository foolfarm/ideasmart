/**
 * Script di emergenza: forza il refresh di tutte le sezioni che non hanno notizie di oggi
 * Eseguire con: node scripts/force-refresh-today.mjs
 */
import { execSync } from "child_process";
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const TODAY = new Date().toISOString().slice(0, 10);

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL);
  
  // Controlla quali sezioni mancano
  const [rows] = await conn.execute(
    `SELECT section, COUNT(*) as cnt FROM news_items WHERE weekLabel = ? GROUP BY section`,
    [TODAY]
  );
  
  const present = new Set(rows.map(r => r.section));
  const allSections = ["ai","music","startup","finance","health","sport","luxury","news","motori","tennis","basket","gossip","cybersecurity","sondaggi"];
  const missing = allSections.filter(s => !present.has(s) || rows.find(r => r.section === s)?.cnt < 10);
  
  console.log(`[ForceRefresh] Data: ${TODAY}`);
  console.log(`[ForceRefresh] Sezioni presenti: ${[...present].join(", ")}`);
  console.log(`[ForceRefresh] Sezioni da aggiornare: ${missing.join(", ")}`);
  
  await conn.end();
  
  if (missing.length === 0) {
    console.log("[ForceRefresh] ✅ Tutte le sezioni sono già aggiornate.");
    return;
  }
  
  console.log("[ForceRefresh] 🚀 Avvio refresh via API admin...");
}

main().catch(console.error);
