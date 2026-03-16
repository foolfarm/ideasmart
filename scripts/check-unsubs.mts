import { getDb } from '../server/db.js';
import { subscribers } from '../drizzle/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

const db = await getDb();

// Conteggio per status
const counts = await db.select({
  status: subscribers.status,
  totale: sql<number>`COUNT(*)`.as('totale')
}).from(subscribers).groupBy(subscribers.status);

console.log('=== ISCRITTI PER STATUS ===');
for (const row of counts) {
  console.log(`  ${row.status}: ${row.totale}`);
}

// Ultime 10 disiscrizioni
const unsubs = await db.select({
  email: subscribers.email,
  unsubscribedAt: subscribers.unsubscribedAt
}).from(subscribers)
  .where(eq(subscribers.status, 'unsubscribed'))
  .orderBy(desc(subscribers.unsubscribedAt))
  .limit(10);

console.log('\n=== ULTIME DISISCRIZIONI (max 10) ===');
if (unsubs.length === 0) {
  console.log('  Nessuna disiscrizione registrata.');
} else {
  for (const u of unsubs) {
    const data = u.unsubscribedAt ? new Date(u.unsubscribedAt).toLocaleString('it-IT') : 'data non registrata';
    console.log(`  ${u.email} — ${data}`);
  }
}

// Disiscrizioni nell'ultima settimana
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const recentUnsubs = await db.select({
  totale: sql<number>`COUNT(*)`.as('totale')
}).from(subscribers)
  .where(sql`status = 'unsubscribed' AND unsubscribedAt >= ${oneWeekAgo}`);

console.log(`\n=== DISISCRIZIONI ULTIMA SETTIMANA ===`);
console.log(`  Totale: ${recentUnsubs[0]?.totale ?? 0}`);

// Disiscrizioni oggi dopo le 07:00 CET (06:00 UTC)
const today = new Date('2026-03-16T06:00:00Z');
const recentToday = await db.select({
  totale: sql<number>`COUNT(*)`.as('totale')
}).from(subscribers)
  .where(sql`status = 'unsubscribed' AND unsubscribedAt >= ${today}`);

console.log(`\n=== DISISCRIZIONI DOPO INVIO NEWSLETTER AI (07:00+ CET) ===`);
console.log(`  Totale: ${recentToday[0]?.totale ?? 0}`);

// Disiscrizioni storiche (prima di oggi)
const historical = await db.select({
  totale: sql<number>`COUNT(*)`.as('totale')
}).from(subscribers)
  .where(sql`status = 'unsubscribed' AND (unsubscribedAt IS NULL OR unsubscribedAt < ${today})`);

console.log(`\n=== DISISCRIZIONI STORICHE (prima di oggi) ===`);
console.log(`  Totale: ${historical[0]?.totale ?? 0}`);

process.exit(0);
