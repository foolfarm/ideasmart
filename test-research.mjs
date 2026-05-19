// Test Research Generator
import { generateDailyResearch } from './server/researchGenerator.ts';

console.log('[Test] Avvio generazione Research...');
const result = await generateDailyResearch();
console.log('[Test] Risultato:', JSON.stringify(result));
process.exit(0);
