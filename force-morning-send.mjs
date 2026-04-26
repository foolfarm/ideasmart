/**
 * Script di emergenza: forza l'invio della newsletter BUONGIORNO
 * Usa direttamente sendMorningNewsletterToAll bypassando il server HTTP
 * Eseguire con: node force-morning-send.mjs
 */
import "dotenv/config";

console.log("[ForceSend] Avvio invio forzato newsletter BUONGIORNO...");
console.log("[ForceSend] DATABASE_URL:", process.env.DATABASE_URL ? "✅ presente" : "❌ mancante");
console.log("[ForceSend] SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ presente" : "❌ mancante");

try {
  const { sendMorningNewsletterToAll } = await import("./server/unifiedNewsletter.js");
  console.log("[ForceSend] Funzione caricata, avvio invio...");
  const result = await sendMorningNewsletterToAll();
  console.log("[ForceSend] Risultato:", JSON.stringify(result, null, 2));
  if (result.success && result.recipientCount > 0) {
    console.log(`[ForceSend] ✅ Newsletter inviata a ${result.recipientCount} destinatari`);
  } else {
    console.error("[ForceSend] ❌ Invio fallito o bloccato:", result.error || "recipientCount=0");
  }
} catch (err) {
  console.error("[ForceSend] ❌ Errore critico:", err.message);
  console.error(err.stack);
}
process.exit(0);
