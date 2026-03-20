/**
 * Script per pubblicare manualmente il post LinkedIn di oggi (slot morning, force=true)
 * Uso: node scripts/publishLinkedInNow.mjs [morning|afternoon]
 */
import { config } from "dotenv";
config();

// Carica le variabili d'ambiente dal file .env
const slot = process.argv[2] ?? "morning";
console.log(`[ManualPublish] Avvio pubblicazione manuale LinkedIn — slot: ${slot}`);

// Import dinamico del publisher
const { publishLinkedInPost } = await import("../server/linkedinPublisher.ts");

const result = await publishLinkedInPost(slot, true);
console.log("[ManualPublish] Risultato:", JSON.stringify(result, null, 2));

if (result.published > 0) {
  console.log("[ManualPublish] ✅ Post pubblicato con successo!");
} else {
  console.error("[ManualPublish] ❌ Pubblicazione fallita:", result.errors);
  process.exit(1);
}
