// Script per triggerare manualmente l'invio della newsletter delle 11
// Eseguire con: node --loader tsx/esm trigger_newsletter.mjs
// oppure: npx tsx trigger_newsletter.mjs

import { sendUnifiedNewsletterToAll } from './server/unifiedNewsletter.ts';

console.log('[SEND] Avvio invio newsletter Proof Press Daily...');
try {
  const result = await sendUnifiedNewsletterToAll();
  console.log('[SEND] Risultato:', JSON.stringify(result, null, 2));
  if (result.success) {
    console.log(`[SEND] ✅ Newsletter inviata a ${result.recipientCount} iscritti`);
  } else {
    console.log(`[SEND] ❌ Invio fallito: ${result.error}`);
  }
} catch (e) {
  console.error('[SEND] Errore:', e.message);
  console.error(e.stack);
}
process.exit(0);
