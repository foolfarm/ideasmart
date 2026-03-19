/**
 * Script di scraping manuale per aggiornare tutte le sezioni ferme.
 * Eseguire con: npx tsx scripts/manualScrapeAll.ts
 */
import 'dotenv/config';
import {
  refreshNewsGeneraliFromRSS,
  refreshHealthNewsFromRSS,
  refreshSportNewsFromRSS,
  refreshLuxuryNewsFromRSS,
  refreshMotoriNewsFromRSS,
  refreshTennisNewsFromRSS,
  refreshBasketNewsFromRSS,
  refreshCybersecurityNewsFromRSS,
  refreshSondaggiNewsFromRSS,
} from '../server/rssNewsScheduler';

const sections = [
  { name: 'News Italia', fn: refreshNewsGeneraliFromRSS },
  { name: 'Health', fn: refreshHealthNewsFromRSS },
  { name: 'Sport', fn: refreshSportNewsFromRSS },
  { name: 'Luxury', fn: refreshLuxuryNewsFromRSS },
  { name: 'Motori', fn: refreshMotoriNewsFromRSS },
  { name: 'Tennis', fn: refreshTennisNewsFromRSS },
  { name: 'Basket', fn: refreshBasketNewsFromRSS },
  { name: 'Cybersecurity', fn: refreshCybersecurityNewsFromRSS },
  { name: 'Sondaggi', fn: refreshSondaggiNewsFromRSS },
];

async function main() {
  console.log('🚀 Avvio scraping manuale di tutte le sezioni ferme...\n');
  for (const { name, fn } of sections) {
    try {
      console.log(`⏳ Scraping ${name}...`);
      await fn();
      console.log(`✅ ${name} aggiornato\n`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Errore ${name}: ${msg}\n`);
    }
  }
  console.log('✅ Scraping manuale completato!');
  process.exit(0);
}

main();
