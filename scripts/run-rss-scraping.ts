/**
 * Script TypeScript per eseguire lo scraping RSS immediato.
 * Eseguire con: npx tsx scripts/run-rss-scraping.ts
 */

import "dotenv/config";
import { refreshAINewsFromRSS, refreshMusicNewsFromRSS, refreshStartupNewsFromRSS } from "../server/rssNewsScheduler";

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  IDEASMART — Scraping RSS Immediato");
  console.log("  DB pulito, ripartenza da zero con fonti reali");
  console.log("═══════════════════════════════════════════════════\n");

  const start = Date.now();

  // AI
  console.log("📡 [1/3] Scraping AI4Business...");
  try {
    await refreshAINewsFromRSS();
    console.log("✅ AI4Business completato\n");
  } catch (err) {
    console.error("❌ AI4Business fallito:", (err as Error).message, "\n");
  }

  // Pausa 15 secondi
  console.log("⏳ Pausa 15s prima di Music...");
  await new Promise(r => setTimeout(r, 15_000));

  // Music
  console.log("📡 [2/3] Scraping ITsMusic...");
  try {
    await refreshMusicNewsFromRSS();
    console.log("✅ ITsMusic completato\n");
  } catch (err) {
    console.error("❌ ITsMusic fallito:", (err as Error).message, "\n");
  }

  // Pausa 15 secondi
  console.log("⏳ Pausa 15s prima di Startup...");
  await new Promise(r => setTimeout(r, 15_000));

  // Startup
  console.log("📡 [3/3] Scraping Startup News...");
  try {
    await refreshStartupNewsFromRSS();
    console.log("✅ Startup News completato\n");
  } catch (err) {
    console.error("❌ Startup News fallito:", (err as Error).message, "\n");
  }

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log("═══════════════════════════════════════════════════");
  console.log(`  ✅ Scraping completato in ${elapsed}s`);
  console.log("═══════════════════════════════════════════════════");

  process.exit(0);
}

main().catch(err => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
