/**
 * Script di scraping immediato — eseguito una volta per popolare il DB
 * con notizie reali da tutte le 177 fonti RSS
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Imposta le variabili d'ambiente necessarie
process.env.NODE_ENV = 'development';

// Carica dotenv
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: '/home/ubuntu/ideasmart/.env' });
} catch (e) {}

// Importa e esegui lo scraping
async function main() {
  console.log('🚀 Avvio scraping RSS immediato...');
  
  try {
    // Usa tsx per eseguire TypeScript direttamente
    const { execSync } = require('child_process');
    
    const script = `
import { refreshAllRssNews } from './server/rssNewsScheduler.ts';
console.log('Avvio refresh RSS...');
try {
  await refreshAllRssNews();
  console.log('✅ Scraping completato!');
} catch (err) {
  console.error('❌ Errore:', err.message);
}
process.exit(0);
`;
    
    require('fs').writeFileSync('/tmp/scrape_runner.ts', script);
    
    console.log('Esecuzione scraping via tsx...');
    execSync('cd /home/ubuntu/ideasmart && npx tsx /tmp/scrape_runner.ts', {
      stdio: 'inherit',
      timeout: 300000, // 5 minuti
    });
  } catch (err) {
    console.error('Errore:', err.message);
    process.exit(1);
  }
}

main();
