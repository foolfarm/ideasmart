import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT * FROM `__drizzle_migrations` ORDER BY id DESC LIMIT 15');
console.log('Ultime migrazioni applicate:');
for (const r of rows) {
  console.log(r.id, r.hash?.substring(0, 30));
}
const [tables] = await conn.execute("SHOW TABLES LIKE 'journalist%'");
console.log('Tabelle journalist:', JSON.stringify(tables));
await conn.end();
