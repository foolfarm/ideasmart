/**
 * Invia la newsletter di oggi per approvazione ad ac@acinelli.com
 * Include il blocco Amazon Deals aggiornato
 */
import 'dotenv/config';
import { sendUnifiedPreview } from '../server/unifiedNewsletter.ts';

console.log('📧 Invio newsletter di oggi per approvazione...');
try {
  const result = await sendUnifiedPreview();
  if (result.success) {
    console.log('✅ Newsletter inviata con successo!');
    console.log('📋 Oggetto:', result.subject);
    console.log('📊 Statistiche contenuto:');
    console.log('   AI:', result.stats.ai, 'notizie');
    console.log('   Startup:', result.stats.startup, 'notizie');
    console.log('   Dealroom:', result.stats.dealroom, 'notizie');
    console.log('   Breaking:', result.stats.breaking, 'notizie');
    console.log('   Research:', result.stats.research, 'notizie');
  } else {
    console.error('❌ Errore:', result.error);
  }
} catch (err) {
  console.error('❌ Errore fatale:', err.message);
}
