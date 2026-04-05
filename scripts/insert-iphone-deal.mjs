import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const today = new Date().toISOString().slice(0, 10);

// Controlla se esiste già un deal per oggi
const [existing] = await conn.execute(
  "SELECT id FROM amazon_daily_deals WHERE scheduledDate = ? LIMIT 1",
  [today]
);

if (existing.length > 0) {
  console.log(`[Deal] Deal per ${today} già presente (id: ${existing[0].id}). Aggiorno il primo...`);
  await conn.execute(
    `UPDATE amazon_daily_deals SET 
      title = ?, description = ?, price = ?, affiliateUrl = ?, 
      imageUrl = ?, rating = ?, reviewCount = ?, category = ?, active = 1
     WHERE scheduledDate = ? LIMIT 1`,
    [
      "Apple iPhone 17 Pro 256GB — Chip A19 Pro, display 6,3\" ProMotion 120Hz",
      "Il nuovo iPhone 17 Pro con chip A19 Pro, fotocamera Pro Fusion con Center Stage, autonomia senza precedenti e display Super Retina XDR da 6,3\". Disponibile in Arancione cosmico.",
      "€1.289,00",
      "https://amzn.to/4vhSYcY",
      null,
      "4,6 ★★★★★",
      "703",
      "Smartphone & Cellulari",
      today
    ]
  );
  console.log(`[Deal] Deal aggiornato per ${today}`);
} else {
  // Inserisce il deal iPhone 17 Pro per oggi
  await conn.execute(
    `INSERT INTO amazon_daily_deals 
      (title, description, price, affiliateUrl, imageUrl, rating, reviewCount, category, scheduledDate, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      "Apple iPhone 17 Pro 256GB — Chip A19 Pro, display 6,3\" ProMotion 120Hz",
      "Il nuovo iPhone 17 Pro con chip A19 Pro, fotocamera Pro Fusion con Center Stage, autonomia senza precedenti e display Super Retina XDR da 6,3\". Disponibile in Arancione cosmico.",
      "€1.289,00",
      "https://amzn.to/4vhSYcY",
      null,
      "4,6 ★★★★★",
      "703",
      "Smartphone & Cellulari",
      today
    ]
  );
  console.log(`[Deal] Deal iPhone 17 Pro inserito per ${today}`);
}

// Verifica i deal attivi per oggi
const [deals] = await conn.execute(
  "SELECT id, title, price, scheduledDate, active FROM amazon_daily_deals WHERE scheduledDate = ? ORDER BY id ASC",
  [today]
);
console.log(`\n[Deal] Deal attivi per ${today}:`);
deals.forEach((d, i) => console.log(`  [${i+1}] ${d.title} — ${d.price}`));

await conn.end();
console.log("\n✅ Done.");
