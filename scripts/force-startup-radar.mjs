import 'dotenv/config';
import { publishLinkedInPost } from '../server/linkedinPublisher.ts';

console.log("[Script] Forzatura post LinkedIn Startup Radar EU/IT...");

try {
  const result = await publishLinkedInPost("startup-afternoon", true);
  console.log("[Script] Risultato:", JSON.stringify(result, null, 2));
  if (result.published > 0) {
    console.log("[Script] ✅ Post Startup Radar pubblicato con successo!");
  } else {
    console.log("[Script] ❌ Post non pubblicato:", result.errors);
  }
} catch (err) {
  console.error("[Script] Errore:", err);
}

process.exit(0);
