import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const today = new Date().toISOString().slice(0, 10);

// Inserisce il secondo deal per oggi (AirPods Pro 2)
await conn.execute(
  `INSERT INTO amazon_daily_deals 
    (title, description, price, affiliateUrl, imageUrl, rating, reviewCount, category, scheduledDate, active)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
  [
    "Apple AirPods Pro (2ª gen.) con custodia MagSafe USB-C",
    "I migliori auricolari Apple con cancellazione attiva del rumore H2, audio spaziale personalizzato, resistenza all'acqua IP54 e fino a 30 ore di autonomia totale con la custodia.",
    "€249,00",
    "https://amzn.to/48s01pm",
    null,
    "4,7 ★★★★★",
    "12.400",
    "Audio & Cuffie",
    today
  ]
);
console.log(`[Deal] Secondo deal AirPods Pro inserito per ${today}`);

// Verifica i deal attivi per oggi
const [deals] = await conn.execute(
  "SELECT id, title, price, scheduledDate FROM amazon_daily_deals WHERE scheduledDate = ? ORDER BY id ASC",
  [today]
);
console.log(`\n[Deal] Deal attivi per ${today}:`);
deals.forEach((d, i) => console.log(`  [${i+1}] ${d.title} — ${d.price}`));

await conn.end();
console.log("\n✅ Done.");
