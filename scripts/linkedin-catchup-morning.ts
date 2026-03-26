/**
 * linkedin-catchup-morning.ts
 * Pubblica il post LinkedIn catch-up per lo slot mattino (10:30) del 25 marzo.
 * Uso: npx tsx scripts/linkedin-catchup-morning.ts
 */

import "dotenv/config";
import { publishLinkedInPost } from "../server/linkedinPublisher";

const today = new Date().toISOString().slice(0, 10); // "2026-03-25"

console.log(`📢 LinkedIn catch-up MATTINO — ${today}`);
console.log("⏳ Generazione e pubblicazione post...\n");

const startTime = Date.now();

try {
  // force=true per forzare anche se il post è già stato pubblicato oggi
await publishLinkedInPost("morning", true);
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n✅ Post LinkedIn MATTINO pubblicato con successo! (${elapsed}s)`);
} catch (e: any) {
  console.error(`\n❌ Errore pubblicazione LinkedIn: ${e.message}`);
  process.exit(1);
}
