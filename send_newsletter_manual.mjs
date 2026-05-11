// Script per invio manuale newsletter - da eseguire con: npx tsx send_newsletter_manual.mjs
import * as dotenv from 'dotenv';
dotenv.config();

const { sendMorningNewsletterToAll } = await import('./server/unifiedNewsletter.ts');
console.log('[MANUAL] Avvio invio newsletter BUONGIORNO 11 maggio 2026...');
const result = await sendMorningNewsletterToAll();
console.log('[MANUAL] Risultato:', JSON.stringify({
  success: result.success,
  recipientCount: result.recipientCount,
  subject: result.subject,
  error: result.error
}, null, 2));
process.exit(0);
