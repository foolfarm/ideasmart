/**
 * Script per inviare la preview della newsletter promozionale.
 * Eseguire con: npx tsx scripts/send-promo-preview.ts
 */
import { config } from "dotenv";
config();

import { sendPromoPreview } from "../server/promoNewsletter";

async function main() {
  console.log("[Script] Invio preview newsletter promozionale...");
  const result = await sendPromoPreview();
  if (result.success) {
    console.log(`[Script] ✅ Preview inviata: "${result.subject}"`);
  } else {
    console.error(`[Script] ❌ Errore: ${result.error}`);
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("[Script] ❌ Errore critico:", err);
  process.exit(1);
});
