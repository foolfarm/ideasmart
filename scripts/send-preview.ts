/**
 * Script per inviare la preview newsletter Proof Press v3
 * Eseguire con: npx tsx scripts/send-preview.ts
 */
import * as dotenv from "dotenv";
dotenv.config();

import { sendUnifiedPreview } from "../server/unifiedNewsletter";

console.log("[Preview] Invio newsletter Proof Press v3 a info@proofpress.ai...");

try {
  const result = await sendUnifiedPreview();
  console.log("[Preview] Risultato:", JSON.stringify(result, null, 2));
} catch (err: any) {
  console.error("[Preview] Errore:", err.message);
  process.exit(1);
}
