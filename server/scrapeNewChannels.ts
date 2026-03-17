/**
 * Script di scraping immediato per i 3 nuovi canali.
 * Eseguire con: npx tsx server/scrapeNewChannels.ts
 */
import { refreshGossipNewsFromRSS, refreshCybersecurityNewsFromRSS, refreshSondaggiNewsFromRSS } from "./rssNewsScheduler";

async function main() {
  console.log("🚀 Avvio scraping per i 3 nuovi canali...\n");

  // Gossip
  try {
    console.log("📰 [1/3] Business Gossip...");
    await refreshGossipNewsFromRSS();
    console.log("✅ Gossip completato\n");
  } catch (err) {
    console.error("❌ Gossip fallito:", (err as Error).message, "\n");
  }

  await new Promise(r => setTimeout(r, 10_000));

  // Cybersecurity
  try {
    console.log("🔐 [2/3] Cybersecurity...");
    await refreshCybersecurityNewsFromRSS();
    console.log("✅ Cybersecurity completato\n");
  } catch (err) {
    console.error("❌ Cybersecurity fallito:", (err as Error).message, "\n");
  }

  await new Promise(r => setTimeout(r, 10_000));

  // Sondaggi
  try {
    console.log("📊 [3/3] Sondaggi...");
    await refreshSondaggiNewsFromRSS();
    console.log("✅ Sondaggi completato\n");
  } catch (err) {
    console.error("❌ Sondaggi fallito:", (err as Error).message, "\n");
  }

  console.log("🎉 Scraping completato per tutti i nuovi canali!");
  process.exit(0);
}

main().catch(err => {
  console.error("Errore fatale:", err);
  process.exit(1);
});
