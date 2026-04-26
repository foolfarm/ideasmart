/**
 * Script di emergenza: forza l'invio della newsletter BUONGIORNO
 * Eseguire con: npx tsx force-morning-send.ts
 */
import "dotenv/config";
import { sendMorningNewsletterToAll } from "./server/unifiedNewsletter";

async function main() {
  console.log("[ForceSend] Avvio invio forzato newsletter BUONGIORNO...");
  console.log("[ForceSend] DATABASE_URL:", process.env.DATABASE_URL ? "✅ presente" : "❌ mancante");
  console.log("[ForceSend] SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ presente" : "❌ mancante");

  try {
    const result = await sendMorningNewsletterToAll();
    console.log("[ForceSend] Risultato:", JSON.stringify(result, null, 2));
    if (result.success && result.recipientCount > 0) {
      console.log(`[ForceSend] ✅ Newsletter inviata a ${result.recipientCount} destinatari`);
    } else {
      console.error("[ForceSend] ❌ Invio fallito o bloccato:", result.error || "recipientCount=0");
    }
  } catch (err: any) {
    console.error("[ForceSend] ❌ Errore critico:", err.message);
  }
  process.exit(0);
}

main();
