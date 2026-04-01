import 'dotenv/config';
import { sendUnifiedNewsletterToAll } from '../server/unifiedNewsletter.ts';

console.log('[INVIO MASSIVO] Invio newsletter unificata a tutti gli iscritti...');
const result = await sendUnifiedNewsletterToAll();
console.log('[INVIO MASSIVO] Risultato:', JSON.stringify(result, null, 2));
if (result.success) {
  console.log(`[INVIO MASSIVO] ✅ Newsletter inviata con successo a ${result.recipientCount} iscritti`);
} else {
  console.error(`[INVIO MASSIVO] ❌ ERRORE: ${result.error}`);
}
process.exit(0);
