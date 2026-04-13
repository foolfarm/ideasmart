import 'dotenv/config';
import { sendUnifiedPreview } from '../server/unifiedNewsletter';

async function main() {
  console.log('📧 Invio newsletter preview per approvazione ad ac@acinelli.com...');
  try {
    const result = await sendUnifiedPreview();
    if (result.success) {
      console.log('✅ Newsletter inviata con successo!');
      console.log('📋 Oggetto:', result.subject);
      console.log('📊 Contenuto:');
      console.log('   AI:', result.stats.ai, 'notizie');
      console.log('   Startup:', result.stats.startup, 'notizie');
      console.log('   Dealroom:', result.stats.dealroom, 'notizie');
      console.log('   Breaking:', result.stats.breaking, 'notizie');
      console.log('   Research:', result.stats.research, 'notizie');
    } else {
      console.error('❌ Errore:', result.error);
    }
  } catch (err: any) {
    console.error('❌ Errore fatale:', err.message);
  }
  process.exit(0);
}

main();
