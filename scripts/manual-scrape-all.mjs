/**
 * Script di scraping manuale per aggiornare tutte le sezioni ferme.
 * Eseguire con: node scripts/manual-scrape-all.mjs
 */
import { config } from 'dotenv';
config();

// Importa le funzioni di refresh direttamente
const { 
  refreshNewsGeneraliFromRSS,
  refreshHealthNewsFromRSS,
  refreshSportNewsFromRSS,
  refreshLuxuryNewsFromRSS,
  refreshMotoriNewsFromRSS,
  refreshTennisNewsFromRSS,
  refreshBasketNewsFromRSS,
  refreshCybersecurityNewsFromRSS,
  refreshSondaggiNewsFromRSS,
  refreshAllNewsFromRSS
} = await import('../server/rssNewsScheduler.ts');

console.log('🚀 Avvio scraping manuale di tutte le sezioni...\n');

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

for (const { name, fn } of sections) {
  try {
    console.log(`⏳ Scraping ${name}...`);
    await fn();
    console.log(`✅ ${name} aggiornato\n`);
  } catch (err) {
    console.error(`❌ Errore ${name}:`, err.message, '\n');
  }
}

console.log('✅ Scraping manuale completato!');
process.exit(0);
