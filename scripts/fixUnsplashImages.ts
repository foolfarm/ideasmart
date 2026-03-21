/**
 * Fix Unsplash Images — sostituisce le URL source.unsplash.com (deprecate/rotte)
 * con immagini Pexels valide per tutti gli articoli nel DB.
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { newsItems } from "../drizzle/schema";
import { like, sql } from "drizzle-orm";
import { findStockImage } from "../server/stockImages";

async function fixUnsplashImages() {
  console.log("[FixUnsplash] Avvio correzione immagini Unsplash rotte...");
  const db = await getDb();
  if (!db) {
    console.error("[FixUnsplash] DB non disponibile");
    process.exit(1);
  }

  // Recupera tutti gli articoli con immagini Unsplash
  const brokenArticles = await db
    .select({ id: newsItems.id, title: newsItems.title, category: newsItems.category, imageUrl: newsItems.imageUrl })
    .from(newsItems)
    .where(like(newsItems.imageUrl as any, "%source.unsplash.com%"));

  console.log(`[FixUnsplash] Trovati ${brokenArticles.length} articoli con immagini Unsplash rotte`);

  let fixed = 0;
  let failed = 0;

  for (const article of brokenArticles) {
    try {
      const newUrl = await findStockImage(article.title, article.category || "default");
      if (newUrl) {
        await db
          .update(newsItems)
          .set({ imageUrl: newUrl })
          .where(sql`id = ${article.id}`);
        fixed++;
        if (fixed % 10 === 0) {
          console.log(`[FixUnsplash] Aggiornati ${fixed}/${brokenArticles.length}...`);
        }
      } else {
        console.warn(`[FixUnsplash] Nessuna immagine trovata per: ${article.title}`);
        failed++;
      }
      // Rate limiting: max 5 req/s su Pexels
      await new Promise(r => setTimeout(r, 250));
    } catch (err) {
      console.error(`[FixUnsplash] Errore per articolo ${article.id}:`, err);
      failed++;
    }
  }

  console.log(`[FixUnsplash] Completato: ${fixed} aggiornati, ${failed} falliti`);
  process.exit(0);
}

fixUnsplashImages().catch(err => {
  console.error("[FixUnsplash] Errore fatale:", err);
  process.exit(1);
});
