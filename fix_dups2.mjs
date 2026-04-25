import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';
config();

const conn = await createConnection(process.env.DATABASE_URL);

const [rows] = await conn.execute(
  'SELECT id, title, section, dateLabel, createdAt FROM daily_editorial ORDER BY createdAt DESC LIMIT 100'
);
console.log('Totale record:', rows.length);

// Raggruppa per titolo normalizzato
const byNorm = new Map();
for (const r of rows) {
  const key = r.title.trim().toLowerCase();
  if (!byNorm.has(key)) byNorm.set(key, []);
  byNorm.get(key).push({ id: r.id, section: r.section, date: r.dateLabel });
}

const dups = [...byNorm.entries()].filter(([k, arr]) => arr.length > 1);
console.log('Gruppi duplicati (normalizzati):', dups.length);

let deleted = 0;
for (const [k, arr] of dups) {
  // Tieni il primo (più recente, ORDER BY createdAt DESC), elimina gli altri
  const toDelete = arr.slice(1).map(a => a.id);
  console.log(`  Tengo ID ${arr[0].id}, elimino [${toDelete.join(',')}] | ${k.substring(0, 60)}`);
  if (toDelete.length > 0) {
    const ph = toDelete.map(() => '?').join(',');
    await conn.execute(`DELETE FROM daily_editorial WHERE id IN (${ph})`, toDelete);
    deleted += toDelete.length;
  }
}

const [[after]] = await conn.execute('SELECT COUNT(*) as tot FROM daily_editorial');
console.log(`\nEliminati: ${deleted} record`);
console.log(`Articoli rimasti: ${after.tot}`);

await conn.end();
