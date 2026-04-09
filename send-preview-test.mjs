/**
 * Script di test per inviare la preview newsletter con il nuovo template Proof Press v3
 * Eseguire con: node send-preview-test.mjs
 */
import { config } from "dotenv";
config();

// Importa dinamicamente il modulo CommonJS compilato
const { sendUnifiedPreview } = await import("./server/unifiedNewsletter.ts").catch(async () => {
  // Fallback: usa tsx per eseguire il TypeScript direttamente
  console.log("Usando tsx per eseguire il TypeScript...");
  return null;
});

if (sendUnifiedPreview) {
  console.log("Invio preview newsletter con nuovo template Proof Press v3...");
  try {
    const result = await sendUnifiedPreview();
    console.log("Risultato:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Errore:", err.message);
  }
}
