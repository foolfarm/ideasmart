/**
 * Test end-to-end ProofPress Verify:
 * 1. Prende il primo articolo non certificato dal DB
 * 2. Lo certifica via API PPV
 * 3. Salva i dati nel DB
 * 4. Rilegge dal DB e verifica che i dati siano stati salvati
 */
import { getDb } from '/home/ubuntu/ideasmart/server/db';
import { newsItems } from '/home/ubuntu/ideasmart/drizzle/schema';
import { isNull, eq, isNotNull, desc } from 'drizzle-orm';

const PPV_API_KEY = 'ppv_9aabe475925174e346d4ed1ad548085e';
const PPV_BASE_URL = 'https://proofpressverify.com/api/v1';

async function certifyArticle(article: { id: number; title: string; summary: string | null; sourceUrl: string | null }) {
  console.log(`\n[PPV] Certifico articolo ID=${article.id}: "${article.title.substring(0, 60)}..."`);
  
  const body = {
    product_type: 'news_verify',
    title: article.title,
    content: article.summary ?? article.title,
    source_url: article.sourceUrl ?? undefined,
  };

  const startTime = Date.now();
  const res = await fetch(`${PPV_BASE_URL}/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PPV_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[PPV] Risposta HTTP: ${res.status} in ${elapsed}s`);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PPV API error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  
  console.log('\n=== RISPOSTA API PPV ===');
  console.log('Document ID:', data.document_id);
  console.log('Hash SHA-256:', data.hash);
  console.log('IPFS CID:', data.ipfs_cid);
  console.log('IPFS URL:', data.ipfs_url);
  console.log('Trust Score:', data.report?.trust_score?.overall);
  console.log('Trust Grade:', data.report?.trust_score?.grade);
  console.log('Claims analizzati:', data.report?.claims?.length ?? 0);
  console.log('Factcheck hits:', data.report?.factcheck_hits?.length ?? 0);
  console.log('Processing time:', data.report?.processing_time_seconds, 'sec');
  
  // Mostra i factcheck hits
  if (data.report?.factcheck_hits?.length > 0) {
    console.log('\n--- FACTCHECK HITS ---');
    data.report.factcheck_hits.forEach((hit: any) => {
      console.log(`  Claim ${hit.claim_id}: ${hit.rating} (${hit.publisher})`);
      console.log(`  URL: ${hit.url}`);
    });
  }

  return data;
}

async function main() {
  console.log('=== TEST END-TO-END ProofPress Verify ===\n');
  
  const db = await getDb();
  if (!db) {
    console.error('DB non disponibile');
    process.exit(1);
  }

  // Prende il primo articolo non certificato
  const [article] = await db.select({
    id: newsItems.id,
    title: newsItems.title,
    summary: newsItems.summary,
    sourceUrl: newsItems.sourceUrl,
    category: newsItems.category,
  }).from(newsItems)
    .where(isNull(newsItems.ppvHash))
    .limit(1);

  if (!article) {
    console.log('Nessun articolo da certificare nel DB.');
    process.exit(0);
  }

  console.log(`Articolo selezionato: ID=${article.id}, categoria=${article.category}`);
  console.log(`Titolo: ${article.title}`);
  console.log(`Source URL: ${article.sourceUrl ?? '(nessuno)'}`);

  // Certifica via API
  const ppvData = await certifyArticle(article);

  // Salva nel DB
  console.log('\n[DB] Salvo i dati PPV nel database...');
  await db.update(newsItems).set({
    ppvHash: ppvData.hash,
    ppvDocumentId: ppvData.document_id,
    ppvIpfsCid: ppvData.ipfs_cid,
    ppvIpfsUrl: ppvData.ipfs_url,
    ppvTrustScore: ppvData.report?.trust_score?.overall,
    ppvTrustGrade: ppvData.report?.trust_score?.grade,
    ppvCertifiedAt: new Date(),
    ppvReport: ppvData.report,
  }).where(eq(newsItems.id, article.id));

  // Rilegge dal DB per verifica
  const [saved] = await db.select({
    id: newsItems.id,
    ppvHash: newsItems.ppvHash,
    ppvDocumentId: newsItems.ppvDocumentId,
    ppvTrustGrade: newsItems.ppvTrustGrade,
    ppvTrustScore: newsItems.ppvTrustScore,
    ppvIpfsUrl: newsItems.ppvIpfsUrl,
    ppvCertifiedAt: newsItems.ppvCertifiedAt,
  }).from(newsItems).where(eq(newsItems.id, article.id));

  console.log('\n=== VERIFICA SALVATAGGIO DB ===');
  console.log('Hash salvato:', saved?.ppvHash ?? 'MANCANTE ❌');
  console.log('Document ID salvato:', saved?.ppvDocumentId ?? 'MANCANTE ❌');
  console.log('Trust Grade salvato:', saved?.ppvTrustGrade ?? 'MANCANTE ❌');
  console.log('Trust Score salvato:', saved?.ppvTrustScore ?? 'MANCANTE ❌');
  console.log('IPFS URL salvato:', saved?.ppvIpfsUrl ?? 'MANCANTE ❌');
  console.log('Certificato il:', saved?.ppvCertifiedAt ?? 'MANCANTE ❌');

  // Statistiche finali
  const [{ cnt: certCount }] = await db.select({ cnt: (await import('drizzle-orm')).count() }).from(newsItems).where(isNotNull(newsItems.ppvHash));
  const [{ cnt: uncertCount }] = await db.select({ cnt: (await import('drizzle-orm')).count() }).from(newsItems).where(isNull(newsItems.ppvHash));

  console.log('\n=== STATISTICHE DB AGGIORNATE ===');
  console.log(`Certificati: ${certCount} | Non certificati: ${uncertCount}`);

  const allOk = saved?.ppvHash && saved?.ppvDocumentId && saved?.ppvTrustGrade && saved?.ppvIpfsUrl;
  console.log('\n' + (allOk ? '✅ TEST SUPERATO — certificazione end-to-end funzionante' : '❌ TEST FALLITO — alcuni campi mancanti nel DB'));

  process.exit(0);
}

main().catch(e => {
  console.error('Errore:', e);
  process.exit(1);
});
