// Script per inserire il banner Base Alpha+ nel DB
// Eseguire con: cd /home/ubuntu/ideasmart && npx tsx scripts/insert_banner.ts
import { getDb } from "../server/db";
import { banners } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) { console.error("DB non disponibile"); process.exit(1); }

  await db.insert(banners).values({
    name: "Base Alpha + — Top Tech Observatory",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp",
    imageKey: null,
    clickUrl: "https://proofpress.ai/base-alpha",
    slot: "all",
    weight: 8,
    active: true,
    startsAt: null,
    endsAt: null,
    sortOrder: 1,
  });

  console.log("✅ Banner 'Base Alpha +' inserito con successo");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
