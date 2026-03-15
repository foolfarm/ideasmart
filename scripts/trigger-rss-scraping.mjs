/**
 * Script per triggerare lo scraping RSS immediato per tutte e tre le sezioni.
 * Chiama direttamente le funzioni di scraping senza passare per HTTP.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Carica le variabili d'ambiente
import { config } from "dotenv";
config({ path: "/home/ubuntu/ideasmart/.env" });

// Usa tsx per eseguire il codice TypeScript direttamente
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

console.log("🚀 Avvio scraping RSS per tutte le sezioni...");
console.log("📋 Questo richiederà 3-5 minuti per completare.");
console.log("");

try {
  execSync(
    `cd ${projectRoot} && npx tsx scripts/run-rss-scraping.ts`,
    { stdio: "inherit", timeout: 600_000 }
  );
} catch (err) {
  console.error("❌ Errore durante lo scraping:", err.message);
  process.exit(1);
}
