// Script per avviare lo scraping DEALROOM manualmente
import { refreshDealroomNewsFromRSS } from "../server/rssNewsScheduler.js";

console.log("[SCRAPING] Avvio scraping DEALROOM...");
try {
  await refreshDealroomNewsFromRSS();
  console.log("[SCRAPING] Completato con successo!");
} catch (e: any) {
  console.error("[SCRAPING] Errore:", e.message);
  process.exit(1);
}
process.exit(0);
