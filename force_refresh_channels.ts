/**
 * Script di refresh manuale immediato dei canali principali
 * Eseguire con: cd /home/ubuntu/ideasmart && npx tsx force_refresh_channels.ts
 */
import "dotenv/config";
import { refreshAINewsFromRSS, refreshStartupNewsFromRSS, refreshDealroomNewsFromRSS } from "./server/rssNewsScheduler";

async function main() {
  console.log("🔄 Avvio refresh manuale immediato di tutti i canali principali...\n");

  // 1. AI News
  console.log("📡 [1/3] Refresh AI News...");
  try {
    await refreshAINewsFromRSS();
    console.log("✅ AI News: refresh completato\n");
  } catch (err) {
    console.error("❌ AI News: errore:", err, "\n");
  }

  // Pausa tra i refresh
  await new Promise(r => setTimeout(r, 10_000));

  // 2. Startup News
  console.log("📡 [2/3] Refresh Startup News...");
  try {
    await refreshStartupNewsFromRSS();
    console.log("✅ Startup News: refresh completato\n");
  } catch (err) {
    console.error("❌ Startup News: errore:", err, "\n");
  }

  // Pausa tra i refresh
  await new Promise(r => setTimeout(r, 10_000));

  // 3. DEALROOM
  console.log("📡 [3/3] Refresh DEALROOM...");
  try {
    await refreshDealroomNewsFromRSS();
    console.log("✅ DEALROOM: refresh completato\n");
  } catch (err) {
    console.error("❌ DEALROOM: errore:", err, "\n");
  }

  console.log("🏁 Refresh manuale completato per tutti i canali principali.");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Errore fatale:", err);
  process.exit(1);
});
