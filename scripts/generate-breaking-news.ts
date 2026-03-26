import "dotenv/config";
import { generateBreakingNews } from "../server/breakingNewsGenerator";

async function main() {
  console.log("🔴 Generazione Breaking News manuale...");
  try {
    const result = await generateBreakingNews();
    console.log("✅ Risultato:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Errore:", err);
  }
  process.exit(0);
}

main();
