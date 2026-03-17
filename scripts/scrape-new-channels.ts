/**
 * Script per avviare lo scraping RSS dei 4 nuovi canali:
 * News Italia, Motori, Tennis, Basket
 * Eseguire con: npx tsx scripts/scrape-new-channels.ts
 */
import {
  refreshNewsGeneraliFromRSS,
  refreshMotoriNewsFromRSS,
  refreshTennisNewsFromRSS,
  refreshBasketNewsFromRSS,
} from "../server/rssNewsScheduler";

async function main() {
  console.log("🚀 Avvio scraping nuovi canali...\n");

  try {
    console.log("📰 [1/4] News Italia...");
    await refreshNewsGeneraliFromRSS();
    console.log("✅ News Italia completato\n");
  } catch (err: unknown) {
    console.error("❌ News Italia fallito:", (err as Error).message);
  }

  try {
    console.log("🚗 [2/4] Motori...");
    await refreshMotoriNewsFromRSS();
    console.log("✅ Motori completato\n");
  } catch (err: unknown) {
    console.error("❌ Motori fallito:", (err as Error).message);
  }

  try {
    console.log("🎾 [3/4] Tennis...");
    await refreshTennisNewsFromRSS();
    console.log("✅ Tennis completato\n");
  } catch (err: unknown) {
    console.error("❌ Tennis fallito:", (err as Error).message);
  }

  try {
    console.log("🏀 [4/4] Basket...");
    await refreshBasketNewsFromRSS();
    console.log("✅ Basket completato\n");
  } catch (err: unknown) {
    console.error("❌ Basket fallito:", (err as Error).message);
  }

  console.log("🎉 Scraping completato per tutti i nuovi canali!");
  process.exit(0);
}

main();
