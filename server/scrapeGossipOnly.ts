import "dotenv/config";
import { refreshGossipNewsFromRSS } from "./rssNewsScheduler";

async function main() {
  console.log("🗞️ Avvio scraping Business Gossip con nuove fonti italiane...");
  try {
    await refreshGossipNewsFromRSS();
    console.log("✅ Business Gossip completato!");
  } catch (err) {
    console.error("❌ Errore scraping Gossip:", err);
    process.exit(1);
  }
  process.exit(0);
}

main();
