/**
 * load-amazon-deals.mjs
 * Carica i link Amazon nel DB amazon_daily_deals con scraping metadati.
 * Usa round-robin sulle date future per la schedulazione automatica.
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL mancante"); process.exit(1); }

// ─── Link Amazon da caricare ──────────────────────────────────────────────────
const AMAZON_LINKS = [
  "https://amzn.to/41YLwpw",
  "https://amzn.to/3OCBvLA",
  "https://amzn.to/3O0e6nj",
  "https://amzn.to/4mqPSit",
  "https://amzn.to/4t2Gowx",
  "https://amzn.to/47YViLT",
  "https://amzn.to/4edwFik",
  "https://amzn.to/4mvUSmk",
];

// ─── Scraping metadati Amazon ─────────────────────────────────────────────────
async function scrapeAmazon(url) {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    const html = await resp.text();
    const finalUrl = resp.url;

    // Titolo
    let title = "";
    const titleM = html.match(/<span[^>]*id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
    if (titleM) title = titleM[1].replace(/<[^>]+>/g, "").trim().slice(0, 200);
    if (!title) {
      const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
      if (ogTitle) title = ogTitle[1].trim().slice(0, 200);
    }
    if (!title) {
      const pageTitle = html.match(/<title>([^<]+)<\/title>/i);
      if (pageTitle) title = pageTitle[1].replace(" : Amazon.it", "").replace(" - Amazon.it", "").trim().slice(0, 200);
    }

    // Immagine
    let imageUrl = "";
    const imgM = html.match(/"hiRes":"(https:[^"]+)"/);
    if (imgM) imageUrl = imgM[1];
    if (!imageUrl) {
      const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      if (ogImg) imageUrl = ogImg[1];
    }
    if (!imageUrl) {
      const landImg = html.match(/id="landingImage"[^>]*src="([^"]+)"/i);
      if (landImg) imageUrl = landImg[1];
    }

    // Prezzo
    let price = "";
    const priceM = html.match(/<span[^>]*class="[^"]*a-price-whole[^"]*"[^>]*>([^<]+)<\/span>/i);
    if (priceM) {
      const cents = html.match(/<span[^>]*class="[^"]*a-price-fraction[^"]*"[^>]*>([^<]+)<\/span>/i);
      price = `€${priceM[1].trim()}${cents ? "," + cents[1].trim() : ""}`;
    }
    if (!price) {
      const priceAlt = html.match(/class="[^"]*priceblock[^"]*"[^>]*>([^<]+)</i);
      if (priceAlt) price = priceAlt[1].trim();
    }

    // Rating
    let rating = "";
    const ratingM = html.match(/([0-9],[0-9])\s*su\s*5\s*stelle/i) || html.match(/([0-9]\.[0-9])\s*out of\s*5/i);
    if (ratingM) rating = ratingM[1];

    // Review count
    let reviewCount = "";
    const reviewM = html.match(/([0-9.,]+)\s*recensioni/i) || html.match(/([0-9.,]+)\s*ratings/i);
    if (reviewM) reviewCount = reviewM[1];

    // Categoria
    let category = "Amazon";
    const catM = html.match(/<span[^>]*class="[^"]*nav-a-content[^"]*"[^>]*>([^<]+)<\/span>/i);
    if (catM) category = catM[1].trim().slice(0, 50);

    // Descrizione breve
    let description = title ? `Prodotto selezionato su Amazon.it — ${title.slice(0, 80)}` : "Offerta selezionata su Amazon.it";
    const featM = html.match(/<div[^>]*id="feature-bullets"[^>]*>([\s\S]*?)<\/div>/i);
    if (featM) {
      const bullets = featM[1].match(/<span[^>]*class="[^"]*a-list-item[^"]*"[^>]*>([\s\S]*?)<\/span>/gi);
      if (bullets && bullets.length > 0) {
        const firstBullet = bullets[0].replace(/<[^>]+>/g, "").trim();
        if (firstBullet.length > 10) description = firstBullet.slice(0, 150);
      }
    }

    return { title: title || "Offerta Amazon", description, price, imageUrl, rating, reviewCount, category, finalUrl };
  } catch (e) {
    console.error(`  Scraping error for ${url}: ${e.message}`);
    return { title: "Offerta Amazon", description: "Offerta selezionata su Amazon.it", price: "", imageUrl: "", rating: "", reviewCount: "", category: "Amazon", finalUrl: url };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log("✅ Connesso al DB");

  // Verifica deal già presenti
  const [existing] = await conn.execute("SELECT affiliateUrl FROM amazon_daily_deals");
  const existingUrls = new Set(existing.map(r => r.affiliateUrl));
  console.log(`Deal già presenti: ${existingUrls.size}`);

  const today = new Date();
  let dayOffset = 0;

  for (const url of AMAZON_LINKS) {
    if (existingUrls.has(url)) {
      console.log(`  ⏭ Skip (già presente): ${url}`);
      continue;
    }

    console.log(`\n📦 Scraping: ${url}`);
    const meta = await scrapeAmazon(url);
    console.log(`  Titolo: ${meta.title.slice(0, 60)}...`);
    console.log(`  Prezzo: ${meta.price || "N/D"}`);
    console.log(`  Immagine: ${meta.imageUrl ? "✅" : "❌"}`);
    console.log(`  Rating: ${meta.rating || "N/D"}`);

    // Schedulazione: oggi + offset round-robin
    const schedDate = new Date(today);
    schedDate.setDate(today.getDate() + dayOffset);
    const scheduledDate = schedDate.toISOString().split("T")[0];
    dayOffset++;

    await conn.execute(
      `INSERT INTO amazon_daily_deals 
       (title, description, price, imageUrl, rating, reviewCount, affiliateUrl, category, scheduledDate, active, clickCount, scrapingStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 'done', NOW(), NOW())`,
      [
        meta.title,
        meta.description,
        meta.price,
        meta.imageUrl,
        meta.rating,
        meta.reviewCount,
        url,
        meta.category,
        scheduledDate,
      ]
    );
    console.log(`  ✅ Inserito nel DB (schedulato: ${scheduledDate})`);

    // Pausa per non sovraccaricare Amazon
    await new Promise(r => setTimeout(r, 1500));
  }

  await conn.end();
  console.log("\n🎉 Tutti i deal caricati nel DB!");
}

main().catch(e => { console.error(e); process.exit(1); });
