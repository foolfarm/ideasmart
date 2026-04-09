/**
 * Script per inviare la preview della newsletter promozionale.
 * Eseguire con: npx tsx scripts/send-promo-preview.mjs
 */
import { config } from "dotenv";
config();

const { sendPromoPreview } = await import("../server/promoNewsletter.ts");

console.log("[Script] Invio preview newsletter promozionale...");
const result = await sendPromoPreview();

if (result.success) {
  console.log(`[Script] ✅ Preview inviata: "${result.subject}"`);
} else {
  console.error(`[Script] ❌ Errore: ${result.error}`);
  process.exit(1);
}
process.exit(0);
