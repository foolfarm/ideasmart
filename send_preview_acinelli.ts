// Script temporaneo: invia preview newsletter a ac@acinelli.com
import "dotenv/config";
import { sendUnifiedPreview } from "./server/unifiedNewsletter";

async function main() {
  console.log("[Preview] Invio newsletter preview a ac@acinelli.com...");
  try {
    await sendUnifiedPreview("ac@acinelli.com", true);
    console.log("[Preview] ✅ Email inviata con successo a ac@acinelli.com");
  } catch (err) {
    console.error("[Preview] ❌ Errore:", err);
    process.exit(1);
  }
}

main();
