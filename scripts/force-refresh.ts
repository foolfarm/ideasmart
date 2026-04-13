/**
 * Script di refresh forzato — traduce tutte le notizie in italiano
 * Eseguire con: npx tsx scripts/force-refresh.ts
 */
import "dotenv/config";
import { refreshAINewsFromRSS, refreshStartupNewsFromRSS, refreshDealroomNewsFromRSS } from "../server/rssNewsScheduler";

async function main() {
  console.log("=== REFRESH FORZATO — Traduzione in italiano ===\n");

  console.log("[1/3] Refresh notizie AI...");
  await refreshAINewsFromRSS();
  console.log("[1/3] ✓ AI completato\n");

  console.log("[2/3] Refresh notizie Startup...");
  await refreshStartupNewsFromRSS();
  console.log("[2/3] ✓ Startup completato\n");

  console.log("[3/3] Refresh notizie Dealroom...");
  await refreshDealroomNewsFromRSS();
  console.log("[3/3] ✓ Dealroom completato\n");

  console.log("=== REFRESH COMPLETATO ===");
  process.exit(0);
}

main().catch(err => {
  console.error("Errore durante il refresh:", err);
  process.exit(1);
});
