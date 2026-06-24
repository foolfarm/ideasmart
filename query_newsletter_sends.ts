import { getDb } from './server/db';
import { newsletterSends } from './drizzle/schema';
import { gte, desc } from 'drizzle-orm';

const db = await getDb();
const rows = await db.select().from(newsletterSends)
  .where(gte(newsletterSends.sendDate, '2026-05-28'))
  .orderBy(desc(newsletterSends.sendDate))
  .limit(20);

console.log(JSON.stringify(rows, null, 2));
process.exit(0);
