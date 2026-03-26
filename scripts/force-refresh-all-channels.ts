/**
 * force-refresh-all-channels.ts
 * Forza l'aggiornamento di tutti i 14 canali news chiamando direttamente le funzioni RSS.
 * Uso: npx tsx scripts/force-refresh-all-channels.ts
 */

import "dotenv/config";
import {
  refreshAINewsFromRSS,
  refreshStartupNewsFromRSS,
  refreshFinanceNewsFromRSS,
  refreshSportNewsFromRSS,
  refreshHealthNewsFromRSS,
  refreshMusicNewsFromRSS,
  refreshNewsGeneraliFromRSS,
  refreshMotoriNewsFromRSS,
  refreshTennisNewsFromRSS,
  refreshBasketNewsFromRSS,
  refreshGossipNewsFromRSS,
  refreshCybersecurityNewsFromRSS,
  refreshSondaggiNewsFromRSS,
  refreshLuxuryNewsFromRSS,
} from "../server/rssNewsScheduler";

const CHANNELS: { name: string; fn: () => Promise<void> }[] = [
  { name: "ai", fn: refreshAINewsFromRSS },
  { name: "startup", fn: refreshStartupNewsFromRSS },
  { name: "news", fn: refreshNewsGeneraliFromRSS },
  { name: "finance", fn: refreshFinanceNewsFromRSS },
  { name: "sport", fn: refreshSportNewsFromRSS },
  { name: "health", fn: refreshHealthNewsFromRSS },
  { name: "luxury", fn: refreshLuxuryNewsFromRSS },
  { name: "music", fn: refreshMusicNewsFromRSS },
  { name: "motori", fn: refreshMotoriNewsFromRSS },
  { name: "tennis", fn: refreshTennisNewsFromRSS },
  { name: "basket", fn: refreshBasketNewsFromRSS },
  { name: "gossip", fn: refreshGossipNewsFromRSS },
  { name: "cybersecurity", fn: refreshCybersecurityNewsFromRSS },
  { name: "sondaggi", fn: refreshSondaggiNewsFromRSS },
];

async function main() {
  console.log(`🔄 Aggiornamento forzato tutti i canali — ${new Date().toLocaleString("it-IT")}`);
  console.log(`📡 Aggiornamento ${CHANNELS.length} canali in sequenza...\n`);

  const results: { name: string; success: boolean; error?: string }[] = [];
  const startTotal = Date.now();

  for (const ch of CHANNELS) {
    const start = Date.now();
    process.stdout.write(`  ⏳ ${ch.name.padEnd(15)} → `);
    try {
      await ch.fn();
      const elapsed = Math.round((Date.now() - start) / 1000);
      console.log(`✅ OK (${elapsed}s)`);
      results.push({ name: ch.name, success: true });
    } catch (e: any) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      console.log(`❌ ERRORE (${elapsed}s): ${e.message?.slice(0, 80)}`);
      results.push({ name: ch.name, success: false, error: e.message });
    }
  }

  const totalElapsed = Math.round((Date.now() - startTotal) / 1000);
  const ok = results.filter(r => r.success).length;
  const fail = results.filter(r => !r.success).length;

  console.log(`\n${"=".repeat(55)}`);
  console.log(`✅ Aggiornati: ${ok}/${CHANNELS.length}   ⏱ Tempo totale: ${totalElapsed}s`);
  if (fail > 0) {
    console.log(`❌ Falliti:    ${fail}`);
    results.filter(r => !r.success).forEach(r => console.log(`   - ${r.name}: ${r.error?.slice(0, 80)}`));
  }
  console.log("=".repeat(55));
}

main().catch(console.error);
