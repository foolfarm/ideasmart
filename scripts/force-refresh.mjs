/**
 * Script di refresh forzato — traduce tutte le notizie in italiano
 * Eseguire con: node scripts/force-refresh.mjs
 */
import { config } from "dotenv";
config();

// Importa le funzioni di refresh direttamente
const { refreshAINewsFromRSS } = await import("../server/rssNewsScheduler.ts").catch(() =>
  import("../server/rssNewsScheduler.js")
);
const { refreshStartupNewsFromRSS } = await import("../server/startupScheduler.ts").catch(() =>
  import("../server/startupScheduler.js")
);
const { refreshDealroomNewsFromRSS } = await import("../server/dealroomScheduler.ts").catch(() =>
  import("../server/dealroomScheduler.js")
);

console.log("=== REFRESH FORZATO — Traduzione in italiano ===");

console.log("\n[1/3] Refresh notizie AI...");
await refreshAINewsFromRSS();
console.log("[1/3] ✓ AI completato");

console.log("\n[2/3] Refresh notizie Startup...");
await refreshStartupNewsFromRSS();
console.log("[2/3] ✓ Startup completato");

console.log("\n[3/3] Refresh notizie Dealroom...");
await refreshDealroomNewsFromRSS();
console.log("[3/3] ✓ Dealroom completato");

console.log("\n=== REFRESH COMPLETATO ===");
process.exit(0);
