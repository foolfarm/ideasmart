import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const today = new Date().toISOString().split('T')[0];
console.log('Today (UTC):', today);

// Calcola oggi in CET (UTC+2 in estate)
const cetNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
const cetToday = cetNow.toISOString().split('T')[0];
console.log('Today (CET):', cetToday);

// Ultime 10 research
const [rows] = await conn.execute(
  'SELECT id, title, dateLabel, is_research_of_day, created_at FROM research_reports ORDER BY id DESC LIMIT 10'
);
console.log('\nUltime 10 research nel DB:');
rows.forEach(r => console.log(`ID:${r.id} | date:${r.dateLabel} | isROD:${r.is_research_of_day} | created:${r.created_at} | ${String(r.title).substring(0,60)}`));

// Research di oggi (UTC)
const [todayUTC] = await conn.execute(
  'SELECT COUNT(*) as cnt FROM research_reports WHERE dateLabel = ?', [today]
);
console.log(`\nResearch con dateLabel=${today} (UTC): ${todayUTC[0].cnt}`);

// Research di oggi (CET)
const [todayCET] = await conn.execute(
  'SELECT COUNT(*) as cnt FROM research_reports WHERE dateLabel = ?', [cetToday]
);
console.log(`Research con dateLabel=${cetToday} (CET): ${todayCET[0].cnt}`);

// Research con isResearchOfDay=true
const [rod] = await conn.execute(
  'SELECT id, title, dateLabel, created_at FROM research_reports WHERE is_research_of_day = 1 ORDER BY id DESC LIMIT 5'
);
console.log('\nUltime 5 con isResearchOfDay=true:');
rod.forEach(r => console.log(`ID:${r.id} | date:${r.dateLabel} | created:${r.created_at} | ${String(r.title).substring(0,60)}`));

await conn.end();
