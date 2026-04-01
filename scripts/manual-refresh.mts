/**
 * Script di refresh manuale dei contenuti IDEASMART
 * Uso: npx tsx scripts/manual-refresh.mts [startup|dealroom|breaking|all]
 */
import "dotenv/config";

async function main() {
  const target = process.argv[2] || "all";
  console.log(`[Manual Refresh] Target: ${target}`);

  const { refreshStartupNewsFromRSS, refreshDealroomNewsFromRSS, refreshAINewsFromRSS } = await import("../server/rssNewsScheduler");
  const { generateBreakingNews } = await import("../server/breakingNewsGenerator");

  try {
    if (target === "startup" || target === "all") {
      console.log("[Manual] → Startup News...");
      await refreshStartupNewsFromRSS();
      console.log("[Manual] ✅ Startup News completato");
    }

    if (target === "dealroom" || target === "all") {
      console.log("[Manual] → Dealroom...");
      await refreshDealroomNewsFromRSS();
      console.log("[Manual] ✅ Dealroom completato");
    }

    if (target === "ai" || target === "all") {
      console.log("[Manual] → AI News...");
      await refreshAINewsFromRSS();
      console.log("[Manual] ✅ AI News completato");
    }

    if (target === "breaking" || target === "all") {
      console.log("[Manual] → Breaking News...");
      await generateBreakingNews();
      console.log("[Manual] ✅ Breaking News completato");
    }

    console.log("[Manual] 🎉 Refresh completato con successo!");
  } catch (err) {
    console.error("[Manual] ❌ Errore:", err);
  }

  process.exit(0);
}

main();
