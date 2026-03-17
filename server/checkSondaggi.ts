import { getDb } from "./db";
import { newsItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) { console.log("DB non disponibile"); process.exit(1); }

  const rows = await db.select({
    title: newsItems.title,
    category: newsItems.category,
    sourceName: newsItems.sourceName,
  }).from(newsItems).where(eq(newsItems.section, "sondaggi")).limit(20);

  console.log(`\n📊 Notizie Sondaggi nel DB: ${rows.length}\n`);
  rows.forEach((r, i) => {
    console.log(`${i + 1}. [${r.category}] ${r.title}\n   Fonte: ${r.sourceName}\n`);
  });
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
