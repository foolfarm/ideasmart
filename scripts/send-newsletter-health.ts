/**
 * send-newsletter-health.ts
 * Invia la newsletter Health & Biotech di oggi (martedì) a tutti gli iscritti.
 * Uso: npx tsx scripts/send-newsletter-health.ts
 */

import "dotenv/config";
import { sendChannelNewsletterManual } from "../server/dailyChannelNewsletter";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL non disponibile");
  process.exit(1);
}

console.log("📧 Invio newsletter Health & Biotech — martedì 25 marzo 2026");
console.log("🗄️  Database: ✅ disponibile");
console.log("🚀 Avvio invio massivo canale 'health'...");
console.log("⏳ Attendere (può richiedere diversi minuti per migliaia di iscritti)...\n");

const startTime = Date.now();
const result = await sendChannelNewsletterManual("health", false);
const elapsed = Math.round((Date.now() - startTime) / 1000);

console.log("\n" + "=".repeat(60));
if (result.success) {
  console.log(`✅ Newsletter "${result.channel}" inviata con successo!`);
  console.log(`   Destinatari: ${result.recipientCount}`);
  console.log(`   Notizie:     ${result.newsCount}`);
  console.log(`   Oggetto:     ${result.subject}`);
  console.log(`   Tempo:       ${elapsed}s`);
} else {
  console.error(`❌ Errore durante l'invio: ${result.error}`);
  console.log(`   Canale:      ${result.channel}`);
  console.log(`   Inviati:     ${result.recipientCount}`);
}
console.log("=".repeat(60));

process.exit(result.success ? 0 : 1);
