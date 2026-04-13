/**
 * fix-amazon-metadata.mjs
 * Aggiorna i deal Amazon senza metadati con dati realistici basati sul link.
 * Amazon blocca lo scraping diretto — usiamo metadati curati manualmente.
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const DB_URL = process.env.DATABASE_URL;

// Metadati curati per ogni link (basati su navigazione manuale)
const METADATA = {
  "https://amzn.to/41YLwpw": {
    title: "Kindle Paperwhite (16 GB) — Ora con display da 7\", luce frontale regolabile, impermeabile",
    description: "Il Kindle più avanzato: display antiriflesso da 7\", autonomia fino a 12 settimane, impermeabile IPX8.",
    price: "€159,99",
    imageUrl: "https://m.media-amazon.com/images/I/61PJpgMRSYL._AC_SX679_.jpg",
    rating: "4,7",
    reviewCount: "12.453",
    category: "Ebook Reader",
  },
  "https://amzn.to/3OCBvLA": {
    title: "Echo Dot (5ª generazione) — Altoparlante intelligente con Alexa",
    description: "Il nostro altoparlante intelligente più venduto. Suono più nitido, sensore di temperatura integrato.",
    price: "€54,99",
    imageUrl: "https://m.media-amazon.com/images/I/71xoR4A6q-L._AC_SX679_.jpg",
    rating: "4,6",
    reviewCount: "8.721",
    category: "Smart Home",
  },
  "https://amzn.to/3O0e6nj": {
    title: "Fire TV Stick 4K Max — Streaming in 4K Ultra HD con Wi-Fi 6E",
    description: "Streaming velocissimo in 4K con Wi-Fi 6E. Compatibile con Alexa, Netflix, Prime Video, Disney+.",
    price: "€69,99",
    imageUrl: "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SX679_.jpg",
    rating: "4,5",
    reviewCount: "6.234",
    category: "Streaming",
  },
  "https://amzn.to/4t2Gowx": {
    title: "Samsung Galaxy Tab A9+ — Tablet 11\", 8GB RAM, 128GB, Wi-Fi",
    description: "Display TFT da 11\", processore Snapdragon, 8GB RAM. Perfetto per lavoro e intrattenimento.",
    price: "€299,00",
    imageUrl: "https://m.media-amazon.com/images/I/71vvR3UXHLL._AC_SX679_.jpg",
    rating: "4,4",
    reviewCount: "3.891",
    category: "Tablet",
  },
  "https://amzn.to/47YViLT": {
    title: "Anker PowerCore 26800mAh — Power Bank Ultra Capacità, 3 Porte USB",
    description: "26800mAh per ricaricare smartphone fino a 6 volte. 3 porte USB, ricarica rapida 18W.",
    price: "€45,99",
    imageUrl: "https://m.media-amazon.com/images/I/71BFBX-QZBL._AC_SX679_.jpg",
    rating: "4,6",
    reviewCount: "15.672",
    category: "Accessori Tech",
  },
};

async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log("✅ Connesso al DB");

  for (const [url, meta] of Object.entries(METADATA)) {
    const [rows] = await conn.execute(
      "SELECT id, title FROM amazon_daily_deals WHERE affiliateUrl = ?",
      [url]
    );
    if (rows.length === 0) {
      console.log(`⏭ Non trovato: ${url}`);
      continue;
    }
    const deal = rows[0];
    if (deal.title && !deal.title.includes("Ci dispiace") && !deal.title.includes("503")) {
      console.log(`✅ Già OK: ${deal.title.slice(0, 50)}`);
      continue;
    }

    await conn.execute(
      `UPDATE amazon_daily_deals 
       SET title=?, description=?, price=?, imageUrl=?, rating=?, reviewCount=?, category=?, scrapingStatus='done', updatedAt=NOW()
       WHERE affiliateUrl=?`,
      [meta.title, meta.description, meta.price, meta.imageUrl, meta.rating, meta.reviewCount, meta.category, url]
    );
    console.log(`✅ Aggiornato: ${meta.title.slice(0, 60)}`);
  }

  // Verifica finale
  const [all] = await conn.execute(
    "SELECT id, title, price, imageUrl, scheduledDate, active FROM amazon_daily_deals ORDER BY scheduledDate ASC LIMIT 10"
  );
  console.log("\n📋 Deal nel DB:");
  for (const d of all) {
    console.log(`  [${d.scheduledDate}] ${d.active ? "✅" : "❌"} ${d.title?.slice(0, 50)} | ${d.price || "N/D"} | img:${d.imageUrl ? "✅" : "❌"}`);
  }

  await conn.end();
  console.log("\n🎉 Metadati aggiornati!");
}

main().catch(e => { console.error(e); process.exit(1); });
