import "dotenv/config";
import { refreshCybersecurityNewsFromRSS } from "./rssNewsScheduler";

async function main() {
  console.log("🔐 Avvio scraping Cybersecurity con nuove fonti italiane...");
  try {
    await refreshCybersecurityNewsFromRSS();
    console.log("✅ Cybersecurity completato!");
  } catch (err) {
    console.error("❌ Errore scraping Cybersecurity:", err);
    process.exit(1);
  }
  process.exit(0);
}

main();
