/**
 * Script per generare le prime notizie Startup nel DB
 * Usa direttamente le funzioni del startupScheduler
 */
import "dotenv/config";
import { generateStartupNews, generateStartupEditorial, generateStartupOfWeek, generateStartupReportage, generateStartupMarketAnalysis } from "../server/startupScheduler";

async function main() {
  console.log("🚀 Avvio generazione contenuti Startup News...\n");

  try {
    console.log("📰 [1/5] Generando 20 notizie startup...");
    await generateStartupNews();
    console.log("✅ Notizie generate!\n");
  } catch (e) {
    console.error("❌ Errore notizie:", e);
  }

  try {
    console.log("✍️  [2/5] Generando editoriale startup...");
    await generateStartupEditorial();
    console.log("✅ Editoriale generato!\n");
  } catch (e) {
    console.error("❌ Errore editoriale:", e);
  }

  try {
    console.log("🏆 [3/5] Generando startup della settimana...");
    await generateStartupOfWeek();
    console.log("✅ Startup della settimana generata!\n");
  } catch (e) {
    console.error("❌ Errore startup settimana:", e);
  }

  try {
    console.log("📊 [4/5] Generando reportage startup...");
    await generateStartupReportage();
    console.log("✅ Reportage generato!\n");
  } catch (e) {
    console.error("❌ Errore reportage:", e);
  }

  try {
    console.log("📈 [5/5] Generando analisi di mercato startup...");
    await generateStartupMarketAnalysis();
    console.log("✅ Analisi di mercato generata!\n");
  } catch (e) {
    console.error("❌ Errore analisi mercato:", e);
  }

  console.log("🎉 Generazione completata!");
  process.exit(0);
}

main().catch(e => {
  console.error("Errore fatale:", e);
  process.exit(1);
});
