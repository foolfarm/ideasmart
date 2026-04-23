import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function main() {
  const dbInstance = await db;
  if (!dbInstance) { console.log('DB non disponibile'); process.exit(1); }
  
  const rows = await dbInstance.execute(
    sql`SELECT id, status, subject, DATE(createdAt) as date, sentAt, recipientCount 
        FROM newsletter_sends 
        WHERE DATE(createdAt) = CURDATE() 
        ORDER BY createdAt DESC LIMIT 3`
  );
  
  console.log('=== Record newsletter oggi ===');
  const data = (rows as any)[0] ?? rows;
  const list = Array.isArray(data) ? data : [data];
  for (const r of list) {
    console.log(JSON.stringify(r));
  }
  
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
