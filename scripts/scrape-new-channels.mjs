/**
 * Script per avviare lo scraping RSS dei 4 nuovi canali:
 * News Italia, Motori, Tennis, Basket
 */
import { createRequire } from "module";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Usa tsx per il transpile TypeScript
register("tsx/esm", pathToFileURL("./"));

const { refreshNewsGeneraliFromRSS, refreshMotoriNewsFromRSS, refreshTennisNewsFromRSS, refreshBasketNewsFromRSS } =
  await import("./server/rssNewsScheduler.ts");

console.log("🚀 Avvio scraping nuovi canali...\n");

try {
  console.log("📰 [1/4] News Italia...");
  await refreshNewsGeneraliFromRSS();
  console.log("✅ News Italia completato\n");
} catch (err) {
  console.error("❌ News Italia fallito:", err.message);
}

try {
  console.log("🚗 [2/4] Motori...");
  await refreshMotoriNewsFromRSS();
  console.log("✅ Motori completato\n");
} catch (err) {
  console.error("❌ Motori fallito:", err.message);
}

try {
  console.log("🎾 [3/4] Tennis...");
  await refreshTennisNewsFromRSS();
  console.log("✅ Tennis completato\n");
} catch (err) {
  console.error("❌ Tennis fallito:", err.message);
}

try {
  console.log("🏀 [4/4] Basket...");
  await refreshBasketNewsFromRSS();
  console.log("✅ Basket completato\n");
} catch (err) {
  console.error("❌ Basket fallito:", err.message);
}

console.log("🎉 Scraping completato per tutti i nuovi canali!");
process.exit(0);
