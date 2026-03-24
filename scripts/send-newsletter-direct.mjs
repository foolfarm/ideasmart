/**
 * send-newsletter-direct.mjs
 * Invia manualmente la newsletter AI4Business di oggi a tutti gli iscritti.
 * Chiama direttamente la funzione server senza passare per HTTP (evita timeout).
 * Uso: node scripts/send-newsletter-direct.mjs
 */

// Carica le variabili d'ambiente
import { config } from "dotenv";
config();

// Imposta le variabili necessarie
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL non disponibile");
  process.exit(1);
}

console.log("📧 Invio newsletter AI4Business — avvio diretto...");
console.log("🗄️  Database:", process.env.DATABASE_URL ? "✅ disponibile" : "❌ mancante");

// Importa e chiama direttamente la funzione
const { sendChannelNewsletterManual } = await import("../server/dailyChannelNewsletter.js");

console.log("🚀 Avvio invio massivo canale 'ai'...");
console.log("⏳ Attendere (può richiedere diversi minuti per migliaia di iscritti)...\n");

const startTime = Date.now();
const result = await sendChannelNewsletterManual("ai", false);
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
