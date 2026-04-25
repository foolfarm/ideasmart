/**
 * backfill_translations.ts
 * Script one-shot per tradurre retroattivamente tutti gli articoli IT→EN.
 * Eseguire con: pnpm tsx server/backfill_translations.ts
 */

import "dotenv/config";
import { translatePendingArticles } from "./articleTranslator";

async function main() {
  console.log("[Backfill] Avvio traduzione retroattiva IT→EN...");
  
  let totalSuccess = 0;
  let totalFailed = 0;
  let batch = 0;
  
  while (true) {
    batch++;
    console.log(`[Backfill] Batch ${batch}...`);
    const { success, failed } = await translatePendingArticles(10);
    totalSuccess += success;
    totalFailed += failed;
    
    if (success === 0 && failed === 0) {
      console.log("[Backfill] Nessun articolo pendente — completato!");
      break;
    }
    
    // Pausa tra batch per rispettare rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`[Backfill] ✅ Completato: ${totalSuccess} tradotti, ${totalFailed} falliti`);
  process.exit(0);
}

main().catch(err => {
  console.error("[Backfill] Errore fatale:", err);
  process.exit(1);
});
