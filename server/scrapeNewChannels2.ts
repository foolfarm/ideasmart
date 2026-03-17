/**
 * Script di scraping iniziale per i 4 canali mancanti:
 * News Italia, Motori, Tennis, Basket
 */
import { refreshNewsGeneraliFromRSS, refreshMotoriNewsFromRSS, refreshTennisNewsFromRSS, refreshBasketNewsFromRSS } from "./rssNewsScheduler";

async function main() {
  console.log("🚀 Avvio scraping iniziale per News Italia, Motori, Tennis, Basket...\n");

  console.log("📰 [1/4] Scraping News Italia...");
  try {
    await refreshNewsGeneraliFromRSS();
    console.log("✅ News Italia completato\n");
  } catch (err) {
    console.error("❌ News Italia fallito:", err);
  }

  console.log("🚗 [2/4] Scraping Motori...");
  try {
    await refreshMotoriNewsFromRSS();
    console.log("✅ Motori completato\n");
  } catch (err) {
    console.error("❌ Motori fallito:", err);
  }

  console.log("🎾 [3/4] Scraping Tennis...");
  try {
    await refreshTennisNewsFromRSS();
    console.log("✅ Tennis completato\n");
  } catch (err) {
    console.error("❌ Tennis fallito:", err);
  }

  console.log("🏀 [4/4] Scraping Basket...");
  try {
    await refreshBasketNewsFromRSS();
    console.log("✅ Basket completato\n");
  } catch (err) {
    console.error("❌ Basket fallito:", err);
  }

  console.log("🎉 Scraping iniziale completato per tutti i 4 canali!");
  process.exit(0);
}

main().catch(err => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
