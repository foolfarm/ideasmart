import { generateLatestAINews, saveNewsToDb } from '../server/newsScheduler.js';

async function main() {
  console.log('[Regen] Avvio rigenerazione notizie AI con nuovo prompt giornalistico...');
  const items = await generateLatestAINews();
  console.log(`[Regen] Generate ${items.length} notizie.`);
  console.log('[Regen] Primo summary:', items[0]?.summary?.slice(0, 300));
  console.log('[Regen] Secondo summary:', items[1]?.summary?.slice(0, 300));
  await saveNewsToDb(items);
  console.log('[Regen] Notizie salvate nel DB con successo.');
  process.exit(0);
}

main().catch(err => {
  console.error('[Regen] Errore:', err);
  process.exit(1);
});
