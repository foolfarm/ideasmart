/**
 * Script per inviare manualmente la preview newsletter PPV
 * Usa la stessa funzione del cron job delle 14:30
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Esegui tramite tsx per supportare TypeScript
import { execSync } from 'child_process';

const script = `
import { sendPpvNewsletterPreview } from './server/ppvEditorialScheduler.js';
await sendPpvNewsletterPreview();
`;

// Usa tsx per eseguire il codice TypeScript direttamente
const tsxScript = path.join(__dirname, '..', 'node_modules', '.bin', 'tsx');
const tempFile = path.join(__dirname, '_temp_ppv_preview.ts');

import { writeFileSync, unlinkSync } from 'fs';

const tsContent = `
import { sendPpvNewsletterPreview } from '../server/ppvEditorialScheduler';

(async () => {
  console.log('[Manual Preview] Avvio invio preview newsletter PPV...');
  await sendPpvNewsletterPreview();
  console.log('[Manual Preview] Completato.');
  process.exit(0);
})().catch(err => {
  console.error('[Manual Preview] Errore:', err);
  process.exit(1);
});
`;

writeFileSync(tempFile, tsContent);

try {
  execSync(`${tsxScript} ${tempFile}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} finally {
  try { unlinkSync(tempFile); } catch {}
}
