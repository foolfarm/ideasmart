import { getDb } from './server/db';
import { newsletterSends } from './drizzle/schema';
import { gte, desc } from 'drizzle-orm';

const db = await getDb();
const rows = await db.select({
  id: newsletterSends.id,
  newsletterType: newsletterSends.newsletterType,
  subject: newsletterSends.subject,
  sendDate: newsletterSends.sendDate,
  recipientCount: newsletterSends.recipientCount,
  sentCount: newsletterSends.sentCount,
  failedCount: newsletterSends.failedCount,
  status: newsletterSends.status,
  sentAt: newsletterSends.sentAt,
}).from(newsletterSends)
  .where(gte(newsletterSends.sendDate, '2026-05-28'))
  .orderBy(desc(newsletterSends.sendDate))
  .limit(20);

for (const r of rows) {
  console.log(`${r.sendDate} | ${r.newsletterType} | "${r.subject?.substring(0,60)}" | dest: ${r.recipientCount} | status: ${r.status} | sentAt: ${r.sentAt}`);
}
process.exit(0);
