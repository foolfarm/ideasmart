import { createRequire } from 'module';
import { register } from 'node:module';

// Carica dotenv
import 'dotenv/config';

// Importa direttamente la funzione
const { sendUnifiedPreview } = await import('./server/unifiedNewsletter.ts');

console.log('[Preview] Invio newsletter preview a ac@acinelli.com...');
try {
  const result = await sendUnifiedPreview(true);
  console.log('[Preview] Risultato:', JSON.stringify(result, null, 2));
} catch (err) {
  console.error('[Preview] Errore:', err.message);
}
process.exit(0);
