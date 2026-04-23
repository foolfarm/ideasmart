/**
 * Script: recalc-trust-scores.mjs
 * 
 * Ricalcola trustScore e trustGrade per tutti gli articoli in news_items
 * che hanno già ipfsCid ma trustScore basso (< 0.65) o null.
 * 
 * Eseguire con: node scripts/recalc-trust-scores.mjs
 */

import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

// ── Trust Score Engine (replica da trustScore.ts) ──────────────────────────

function computeTrustGrade(input) {
  let score = 0;
  const breakdown = {
    cryptoCert: 0,
    ipfsArchive: 0,
    sourceAttribution: 0,
    contentRichness: 0,
    aiVerifyReport: 0,
  };

  // 1. Certificazione crittografica SHA-256 (+40)
  if (input.verifyHash && input.verifyHash.length === 64) {
    breakdown.cryptoCert = 40;
    score += 40;
  }

  // 2. Archiviazione IPFS (+25)
  if (input.ipfsCid && input.ipfsCid.length > 10) {
    breakdown.ipfsArchive = 25;
    score += 25;
  }

  // 3. Fonte citata (+15: +8 sourceName, +7 sourceUrl)
  if (input.sourceName && input.sourceName.trim().length > 0) {
    breakdown.sourceAttribution += 8;
    score += 8;
  }
  if (input.sourceUrl && input.sourceUrl.trim().length > 0) {
    breakdown.sourceAttribution += 7;
    score += 7;
  }

  // 4. Ricchezza del contenuto (0-15 punti)
  const contentText = input.body || input.summary || '';
  const contentLen = contentText.trim().length;
  if (contentLen >= 800) {
    breakdown.contentRichness = 15;
    score += 15;
  } else if (contentLen >= 400) {
    breakdown.contentRichness = 10;
    score += 10;
  } else if (contentLen >= 150) {
    breakdown.contentRichness = 6;
    score += 6;
  } else if (contentLen >= 50) {
    breakdown.contentRichness = 3;
    score += 3;
  }

  // 5. Report di verifica AI (+5)
  if (input.verifyReport && typeof input.verifyReport === 'object') {
    breakdown.aiVerifyReport = 5;
    score += 5;
  }

  const grade = scoreToGrade(score);
  return { score, grade, breakdown };
}

function scoreToGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 55) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const db = await createConnection(process.env.DATABASE_URL);
  console.log('✅ Connesso al database');

  // Recupera tutti gli articoli con verifyHash
  const [rows] = await db.execute(`
    SELECT 
      id, verifyHash, ipfsCid, ipfsUrl,
      sourceName, sourceUrl, summary,
      verifyReport, trustScore, trustGrade
    FROM news_items
    WHERE verifyHash IS NOT NULL
    ORDER BY id DESC
  `);

  console.log(`📊 Trovati ${rows.length} articoli con verifyHash`);

  let updated = 0;
  let skipped = 0;
  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

  for (const row of rows) {
    const input = {
      verifyHash: row.verifyHash,
      ipfsCid: row.ipfsCid,
      sourceName: row.sourceName,
      sourceUrl: row.sourceUrl,
      summary: row.summary,
      verifyReport: row.verifyReport ? (typeof row.verifyReport === 'string' ? JSON.parse(row.verifyReport) : row.verifyReport) : null,
    };

    const { score, grade } = computeTrustGrade(input);
    const normalizedScore = Math.round(score) / 100; // scala 0-1

    // Aggiorna solo se il grade è cambiato o lo score è significativamente diverso
    const currentScore = row.trustScore ? parseFloat(row.trustScore) : 0;
    const scoreDiff = Math.abs(normalizedScore - currentScore);

    if (grade !== row.trustGrade || scoreDiff > 0.01) {
      await db.execute(
        'UPDATE news_items SET trustScore = ?, trustGrade = ? WHERE id = ?',
        [normalizedScore, grade, row.id]
      );
      console.log(`  ✓ ID ${row.id}: ${row.trustGrade ?? 'null'} → ${grade} (${currentScore.toFixed(2)} → ${normalizedScore.toFixed(2)})`);
      updated++;
    } else {
      skipped++;
    }

    gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
  }

  console.log('\n📈 Riepilogo aggiornamento:');
  console.log(`  Aggiornati: ${updated}`);
  console.log(`  Invariati:  ${skipped}`);
  console.log('\n📊 Distribuzione grade dopo ricalcolo:');
  for (const [grade, count] of Object.entries(gradeDistribution)) {
    const bar = '█'.repeat(Math.round(count / rows.length * 30));
    console.log(`  ${grade}: ${bar} ${count} (${Math.round(count / rows.length * 100)}%)`);
  }

  await db.end();
  console.log('\n✅ Completato!');
}

main().catch(err => {
  console.error('❌ Errore:', err);
  process.exit(1);
});
