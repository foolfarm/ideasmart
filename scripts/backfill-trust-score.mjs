/**
 * Backfill Trust Score per tutti i news_items con verifyHash IS NOT NULL
 * e trustGrade IS NULL.
 * Eseguire una sola volta: node scripts/backfill-trust-score.mjs
 */
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

// Replica della logica computeTrustGrade (non importiamo TS direttamente)
function computeTrustGrade(input) {
  let score = 0;
  const breakdown = { cryptoCert: 0, ipfsArchive: 0, sourceAttribution: 0, contentRichness: 0, aiVerifyReport: 0 };

  if (input.verifyHash && input.verifyHash.length === 64) { breakdown.cryptoCert = 40; score += 40; }
  if (input.ipfsCid && input.ipfsCid.length > 10) { breakdown.ipfsArchive = 25; score += 25; }
  if (input.sourceName && input.sourceName.trim().length > 0) { breakdown.sourceAttribution += 8; score += 8; }
  if (input.sourceUrl && input.sourceUrl.trim().length > 0) { breakdown.sourceAttribution += 7; score += 7; }

  const contentText = input.body || input.summary || '';
  const contentLen = contentText.trim().length;
  if (contentLen >= 800) { breakdown.contentRichness = 15; score += 15; }
  else if (contentLen >= 400) { breakdown.contentRichness = 10; score += 10; }
  else if (contentLen >= 150) { breakdown.contentRichness = 6; score += 6; }
  else if (contentLen >= 50) { breakdown.contentRichness = 3; score += 3; }

  if (input.verifyReport && typeof input.verifyReport === 'object') { breakdown.aiVerifyReport = 5; score += 5; }

  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 35) grade = 'D';
  else grade = 'F';

  return { score, grade, breakdown };
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Recupera tutti gli articoli con verifyHash ma senza trustGrade
  const [rows] = await conn.execute(
    'SELECT id, verifyHash, ipfsCid, sourceName, sourceUrl, summary, verifyReport FROM news_items WHERE verifyHash IS NOT NULL AND trustGrade IS NULL'
  );
  
  console.log(`Trovati ${rows.length} articoli da aggiornare`);
  
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  let updated = 0;
  
  for (const row of rows) {
    const result = computeTrustGrade({
      verifyHash: row.verifyHash,
      ipfsCid: row.ipfsCid,
      sourceName: row.sourceName,
      sourceUrl: row.sourceUrl,
      summary: row.summary,
      verifyReport: row.verifyReport,
    });
    
    await conn.execute(
      'UPDATE news_items SET trustScore = ?, trustGrade = ? WHERE id = ?',
      [result.score / 100, result.grade, row.id]
    );
    
    gradeCounts[result.grade]++;
    updated++;
    console.log(`  [${result.grade}] id=${row.id} score=${result.score} (crypto:${result.breakdown.cryptoCert} ipfs:${result.breakdown.ipfsArchive} src:${result.breakdown.sourceAttribution} content:${result.breakdown.contentRichness} report:${result.breakdown.aiVerifyReport})`);
  }
  
  console.log('\n=== Backfill completato ===');
  console.log(`Aggiornati: ${updated} articoli`);
  console.log('Distribuzione grade:', gradeCounts);
  
  await conn.end();
}

main().catch(err => { console.error(err); process.exit(1); });
