import { generateDailyResearch } from "./server/researchGenerator.js";

console.log("🔍 Avvio generazione Research del giorno...");
try {
  const result = await generateDailyResearch();
  console.log(`✅ Research completata: ${result?.generated ?? 0} ricerche generate`);
  process.exit(0);
} catch (err) {
  console.error("❌ Errore:", err.message);
  process.exit(1);
}
