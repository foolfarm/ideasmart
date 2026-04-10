import "dotenv/config";
import { sendUnifiedNewsletterToAll } from "./server/unifiedNewsletter";

async function main() {
  console.log("🚀 Invio newsletter massiva a tutti gli iscritti...");
  const result = await sendUnifiedNewsletterToAll();
  if (result.success) {
    console.log(`✅ Newsletter inviata a ${result.recipientCount} destinatari`);
    console.log(`   Oggetto: ${result.subject}`);
  } else {
    console.error("❌ Errore:", result.error);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Errore critico:", err);
  process.exit(1);
});
