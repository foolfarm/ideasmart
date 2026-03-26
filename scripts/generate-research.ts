import { generateDailyResearch } from "../server/researchGenerator";

async function main() {
  console.log("🔬 Generazione ricerche IDEASMART Research...");
  const result = await generateDailyResearch();
  console.log("Risultato:", JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(e => { console.error("Errore:", e); process.exit(1); });
