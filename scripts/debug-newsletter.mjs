import 'dotenv/config';
import mysql from 'mysql2/promise';

async function check() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Check if startup data exists
  const [rows] = await conn.query('SELECT section, COUNT(*) as cnt FROM news_items GROUP BY section');
  console.log('Sections:', JSON.stringify(rows));
  
  // Try the exact query that fails
  try {
    const [result] = await conn.query(
      'SELECT id, section, title, summary, category, sourceName, sourceUrl, publishedAt, weekLabel, position, imageUrl, videoUrl, viewCount, lastViewedAt, createdAt FROM news_items WHERE section = ? ORDER BY createdAt DESC, position LIMIT ?',
      ['startup', 5]
    );
    console.log('Startup query OK, rows:', result.length);
    if (result.length > 0) {
      console.log('First row:', JSON.stringify(result[0], null, 2));
    }
  } catch (e) {
    console.error('Startup query FAILED:', e.message);
  }

  // Check table structure
  try {
    const [cols] = await conn.query('SHOW COLUMNS FROM news_items');
    console.log('\nTable columns:');
    for (const col of cols) {
      console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? 'default=' + col.Default : ''}`);
    }
  } catch (e) {
    console.error('SHOW COLUMNS FAILED:', e.message);
  }

  await conn.end();
}
check().catch(console.error);
