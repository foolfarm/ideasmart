/**
 * Script per eliminare l'editoriale di oggi e forzarne la rigenerazione
 * con il nuovo stile Claude/Andrea Cinelli.
 * Eseguire con: npx tsx server/reset-editorial.mjs
 */
import { getDb } from "./db.ts";
import { dailyEditorial } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";
import { generateDailyEditorial } from "./dailyContentScheduler.ts";

const today = new Date().toISOString().split("T")[0];

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("[Reset] DB non disponibile");
    process.exit(1);
  }

  // 1. Elimina l'editoriale di oggi
  await db.delete(dailyEditorial).where(eq(dailyEditorial.dateLabel, today));
  console.log(`[Reset] Editoriale del ${today} eliminato dal DB`);

  // 2. Rigenera con il nuovo stile Claude/Andrea Cinelli
  console.log("[Reset] Rigenerazione editoriale in corso (Claude Sonnet 4.5 + stile Andrea Cinelli)...");
  const result = await generateDailyEditorial();
  if (result) {
    console.log(`[Reset] ✅ Nuovo editoriale generato:`);
    console.log(`  Titolo:    ${result.title}`);
    console.log(`  Sottotit.: ${result.subtitle}`);
    console.log(`  Key trend: ${result.keyTrend}`);
    console.log(`  Sezione:   ${result.section}`);
  } else {
    console.error("[Reset] ❌ Rigenerazione fallita — controlla i log del server");
  }

  process.exit(0);
}

main().catch(err => {
  console.error("[Reset] Errore:", err.message);
  process.exit(1);
});
