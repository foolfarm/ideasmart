import { config } from 'dotenv';
config();

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Data di oggi
const today = new Date().toISOString().slice(0, 10);
console.log('Data di oggi (UTC):', today);

// Verifica deal programmati per oggi
const [todayDeals] = await conn.execute(
  'SELECT id, title, scheduledDate, active, affiliateUrl FROM amazon_daily_deals WHERE scheduledDate = ? AND active = 1',
  [today]
);
console.log('\nDeal programmati per oggi:', todayDeals.length);
for (const d of todayDeals) {
  console.log(`  - [${d.scheduledDate}] ${d.title} | active=${d.active}`);
}

// Tutti i deal attivi
const [allDeals] = await conn.execute(
  'SELECT id, title, scheduledDate, active FROM amazon_daily_deals ORDER BY scheduledDate DESC LIMIT 10'
);
console.log('\nUltimi 10 deal nel DB:');
for (const d of allDeals) {
  console.log(`  - [${d.scheduledDate}] ${d.title} | active=${d.active}`);
}

await conn.end();
process.exit(0);
