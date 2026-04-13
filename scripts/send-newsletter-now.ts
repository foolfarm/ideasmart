import 'dotenv/config';
import { sendUnifiedNewsletterToAll } from '../server/unifiedNewsletter';

console.log('[START] Invio newsletter ID 840002 in corso...');
const result = await sendUnifiedNewsletterToAll();
console.log('[RESULT]', JSON.stringify(result, null, 2));
process.exit(0);
