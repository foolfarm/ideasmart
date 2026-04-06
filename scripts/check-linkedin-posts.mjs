import { config } from 'dotenv';
config();

import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await conn.execute(
  'SELECT id, slot, title, dateLabel, linkedinUrl, createdAt FROM linkedin_posts ORDER BY createdAt DESC LIMIT 10'
);

console.log('Ultimi 10 post LinkedIn nel DB:');
for (const r of rows) {
  console.log(`[${r.dateLabel}] slot=${r.slot} | ${(r.title || '').substring(0, 70)} | url=${r.linkedinUrl ? 'SI' : 'NO'}`);
}

await conn.end();
process.exit(0);
