/**
 * backfillVerifyReport.mjs
 * Job one-shot: riesegue la pipeline Verify per tutti gli articoli con
 * trustScore IS NOT NULL AND verifyReport IS NULL AND verifyHash IS NOT NULL
 *
 * Eseguire con: node scripts/backfillVerifyReport.mjs
 * Il server deve essere attivo su localhost:3000
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const TRPC_URL = 'http://localhost:3000/api/trpc/news.runFullVerify';
const DELAY_MS = 4000; // 4 secondi tra un articolo e l'altro

async function verifyArticle(hash) {
  const response = await fetch(TRPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: { hash } }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`JSON non valido: ${text.slice(0, 200)}`);
  }

  if (data?.error) {
    const msg = data.error?.json?.message ?? JSON.stringify(data.error).slice(0, 200);
    throw new Error(`tRPC error: ${msg}`);
  }

  const result = data?.result?.data?.json ?? data?.result?.data;
  if (!result) throw new Error(`Risposta vuota: ${text.slice(0, 200)}`);
  return result;
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('✅ DB connesso');

  const [articles] = await conn.execute(
    `SELECT id, title, verifyHash, trustScore, trustGrade
     FROM news_items
     WHERE trustScore IS NOT NULL
       AND verifyReport IS NULL
       AND verifyHash IS NOT NULL
     ORDER BY id ASC`
  );
  await conn.end();

  console.log(`📋 Articoli da backfillare: ${articles.length}`);
  if (articles.length === 0) {
    console.log('✅ Nessun articolo da backfillare. Uscita.');
    return;
  }

  let success = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const title = article.title?.slice(0, 55) ?? '(no title)';
    console.log(`\n[${i + 1}/${articles.length}] ID=${article.id} — ${title}...`);
    console.log(`   Hash: ${article.verifyHash?.slice(0, 16)}... | Score: ${article.trustScore} (${article.trustGrade})`);

    try {
      const result = await verifyArticle(article.verifyHash);
      console.log(`   ✅ OK — Status: ${result.status} | Score: ${result.trustScore ?? result.report?.trust_score?.overall} (${result.trustGrade ?? result.report?.trust_score?.grade})`);
      success++;
    } catch (err) {
      console.error(`   ❌ Errore: ${err.message}`);
      failed++;
      errors.push({ id: article.id, title: title, error: err.message });
    }

    if (i < articles.length - 1) {
      process.stdout.write(`   ⏳ Pausa ${DELAY_MS / 1000}s...`);
      await new Promise(r => setTimeout(r, DELAY_MS));
      process.stdout.write(' OK\n');
    }
  }

  // ─── Report finale ──────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 BACKFILL COMPLETATO');
  console.log(`   ✅ Successi: ${success}/${articles.length}`);
  console.log(`   ❌ Falliti:  ${failed}/${articles.length}`);

  if (errors.length > 0) {
    console.log('\n⚠️  Articoli falliti:');
    errors.forEach(e => console.log(`   - ID ${e.id}: ${e.title} → ${e.error}`));
  }

  // Verifica finale nel DB
  const conn2 = await mysql.createConnection(process.env.DATABASE_URL);
  const [remaining] = await conn2.execute(
    'SELECT COUNT(*) as n FROM news_items WHERE trustScore IS NOT NULL AND verifyReport IS NULL AND verifyHash IS NOT NULL'
  );
  console.log(`\n📦 Articoli ancora senza verifyReport: ${remaining[0].n}`);
  await conn2.end();
}

main().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
