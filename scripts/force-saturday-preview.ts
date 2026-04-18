import dotenv from 'dotenv';
dotenv.config();

import { sendSaturdayPreview } from '../server/saturdayEditorialNewsletter';

console.log('[Manual] Avvio sendSaturdayPreview...');
const result = await sendSaturdayPreview();
if (result.success) {
  console.log(`[Manual] ✅ Preview inviata: ${result.subject}`);
} else {
  console.error(`[Manual] ❌ Errore: ${result.error}`);
}
process.exit(0);
