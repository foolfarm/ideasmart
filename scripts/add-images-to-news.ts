/**
 * Script per aggiungere immagini Pexels alle notizie senza imageUrl
 * Eseguire con: npx tsx scripts/add-images-to-news.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { getDb } from '../server/db';
import { newsItems as newsItemsTable } from '../drizzle/schema';
import { findNewsImage } from '../server/stockImages';
import { eq, isNull, or } from 'drizzle-orm';

async function main() {
  console.log('[ImageBatch] Avvio aggiornamento immagini notizie...');
  
  const db = await getDb();
  if (!db) {
    console.error('[ImageBatch] Errore: DB non disponibile');
    process.exit(1);
  }

  // Recupera tutte le notizie senza immagine
  const newsWithoutImages = await db
    .select({
      id: newsItemsTable.id,
      title: newsItemsTable.title,
      category: newsItemsTable.category,
      section: newsItemsTable.section,
    })
    .from(newsItemsTable)
    .where(isNull(newsItemsTable.imageUrl));

  console.log(`[ImageBatch] Trovate ${newsWithoutImages.length} notizie senza immagine`);

  let updated = 0;
  let failed = 0;

  for (const item of newsWithoutImages) {
    try {
      const imageUrl = await findNewsImage(item.title, item.category);
      if (imageUrl) {
        await db
          .update(newsItemsTable)
          .set({ imageUrl })
          .where(eq(newsItemsTable.id, item.id));
        updated++;
        console.log(`[ImageBatch] ✓ ${updated}. [${item.section}/${item.category}] ${item.title.slice(0, 50)}...`);
      } else {
        failed++;
        console.log(`[ImageBatch] ✗ Nessuna immagine trovata per: ${item.title.slice(0, 50)}...`);
      }
      // Rate limiting: 200 req/ora = max 3 req/sec
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      failed++;
      console.error(`[ImageBatch] Errore per ID ${item.id}:`, err);
    }
  }

  console.log(`\n[ImageBatch] Completato: ${updated} aggiornate, ${failed} fallite su ${newsWithoutImages.length} totali`);
  process.exit(0);
}

main();
