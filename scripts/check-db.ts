import * as dotenv from 'dotenv';
dotenv.config();

import { createConnection } from 'mysql2/promise';

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL || '');
  
  // Conta notizie per sezione
  const [sections] = await conn.execute(
    'SELECT section, COUNT(*) as cnt, MIN(id) as min_id, MAX(id) as max_id FROM news_items GROUP BY section'
  ) as any;
  console.log('=== Notizie per sezione ===');
  console.log(JSON.stringify(sections, null, 2));

  // Mostra prime 5 notizie AI
  const [aiNews] = await conn.execute(
    "SELECT id, title, section FROM news_items WHERE section = 'ai' ORDER BY id DESC LIMIT 5"
  ) as any;
  console.log('\n=== Prime 5 notizie AI (ID più recenti) ===');
  console.log(JSON.stringify(aiNews, null, 2));

  // Mostra prime 5 notizie music
  const [musicNews] = await conn.execute(
    "SELECT id, title, section FROM news_items WHERE section = 'music' ORDER BY id DESC LIMIT 5"
  ) as any;
  console.log('\n=== Prime 5 notizie Music (ID più recenti) ===');
  console.log(JSON.stringify(musicNews, null, 2));

  await conn.end();
}

main().catch(console.error);
