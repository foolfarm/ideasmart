// Script one-shot per rimuovere duplicati da daily_editorial e osservatorio_articles
// Eseguire con: npx tsx dedup-db.ts
import { getDb } from './server/db';
import { dailyEditorial, osservatorioArticles } from './drizzle/schema';
import { sql } from 'drizzle-orm';

async function dedup() {
  const db = await getDb();
  if (!db) { console.error('DB non disponibile'); process.exit(1); }

  // ── 1. Duplicati in daily_editorial ─────────────────────────────────────
  console.log('\n=== Pulizia daily_editorial ===');
  const [dupes]: any = await (db as any).execute(sql`
    SELECT title, COUNT(*) as cnt, MIN(id) as keep_id, GROUP_CONCAT(id ORDER BY id) as all_ids
    FROM daily_editorial
    GROUP BY title
    HAVING COUNT(*) > 1
  `);

  let deleted = 0;
  for (const row of dupes) {
    const ids: number[] = row.all_ids.split(',').map(Number);
    const keepId: number = row.keep_id;
    const deleteIds = ids.filter(id => id !== keepId);
    if (deleteIds.length > 0) {
      await (db as any).execute(
        sql.raw(`DELETE FROM daily_editorial WHERE id IN (${deleteIds.join(',')})`)
      );
      deleted += deleteIds.length;
      console.log(`  Rimossi ${deleteIds.length} duplicati per: "${String(row.title).substring(0, 70)}"`);
    }
  }
  console.log(`✅ Totale rimossi da daily_editorial: ${deleted}`);

  // ── 2. Duplicati in osservatorio_articles ────────────────────────────────
  console.log('\n=== Pulizia osservatorio_articles ===');
  const [dupesOss]: any = await (db as any).execute(sql`
    SELECT title, COUNT(*) as cnt, MIN(id) as keep_id, GROUP_CONCAT(id ORDER BY id) as all_ids
    FROM osservatorio_articles
    GROUP BY title
    HAVING COUNT(*) > 1
  `);

  let deletedOss = 0;
  for (const row of dupesOss) {
    const ids: number[] = row.all_ids.split(',').map(Number);
    const keepId: number = row.keep_id;
    const deleteIds = ids.filter(id => id !== keepId);
    if (deleteIds.length > 0) {
      await (db as any).execute(
        sql.raw(`DELETE FROM osservatorio_articles WHERE id IN (${deleteIds.join(',')})`)
      );
      deletedOss += deleteIds.length;
      console.log(`  Rimossi ${deleteIds.length} duplicati per: "${String(row.title).substring(0, 70)}"`);
    }
  }
  console.log(`✅ Totale rimossi da osservatorio_articles: ${deletedOss}`);

  console.log('\n✅ Pulizia completata. Ora esegui pnpm db:push per il constraint unique.');
  process.exit(0);
}

dedup().catch(err => { console.error(err); process.exit(1); });
