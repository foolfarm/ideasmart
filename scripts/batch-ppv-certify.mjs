/**
 * Batch PPV Certification Script
 * Certifica gli articoli non ancora certificati tramite l'API ProofPressVerify
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PPV_API_BASE = "https://proofpressverify.com/api/v1";
const PPV_API_KEY = process.env.PPV_API_KEY;
const PPV_TIMEOUT_MS = 60_000;

async function certifyArticle(title, content, sourceUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PPV_TIMEOUT_MS);

  try {
    const body = {
      product_type: "news_verify",
      title,
      content,
      ...(sourceUrl ? { source_url: sourceUrl } : {}),
    };

    const response = await fetch(`${PPV_API_BASE}/verify`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PPV_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[PPV] API error ${response.status}: ${errText.substring(0, 200)}`);
      return null;
    }

    const data = await response.json();

    // Normalizza trust_score
    if (data.trust_score > 1) {
      data.trust_score = data.trust_score / 100;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.warn(`[PPV] ⏱ Timeout per: ${title.substring(0, 50)}`);
    } else {
      console.error(`[PPV] Errore:`, err.message);
    }
    return null;
  }
}

async function main() {
  if (!PPV_API_KEY) {
    console.error("❌ PPV_API_KEY non configurata");
    process.exit(1);
  }

  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("✅ Connesso al DB");

  // Recupera articoli senza ppvHash
  const [articles] = await conn.execute(
    `SELECT id, title, summary, sourceUrl FROM news_items 
     WHERE (ppvHash IS NULL OR ppvHash = '') 
     AND title IS NOT NULL 
     AND summary IS NOT NULL
     ORDER BY id DESC 
     LIMIT 20`
  );

  console.log(`📋 Articoli da certificare: ${articles.length}`);

  let certified = 0;
  let failed = 0;

  for (const article of articles) {
    console.log(`\n🔄 [${certified + failed + 1}/${articles.length}] Certifico: "${article.title.substring(0, 60)}..."`);

    const result = await certifyArticle(
      article.title,
      article.summary,
      article.sourceUrl
    );

    if (result) {
      // Aggiorna il DB con i dati PPV
      await conn.execute(
        `UPDATE news_items SET 
          ppvHash = ?,
          ppvDocumentId = ?,
          ppvCertifiedAt = NOW(),
          ppvTrustGrade = ?,
          ppvTrustScore = ?,
          ppvIpfsCid = ?,
          ppvIpfsUrl = ?
         WHERE id = ?`,
        [
          result.hash,
          result.document_id,
          result.trust_grade,
          result.trust_score,
          result.ipfs_cid,
          result.ipfs_url,
          article.id
        ]
      );
      certified++;
      console.log(`  ✅ Grade: ${result.trust_grade} | Score: ${result.trust_score.toFixed(2)} | Hash: ${result.hash.substring(0, 20)}...`);
    } else {
      failed++;
      console.log(`  ❌ Certificazione fallita`);
    }

    // Pausa tra le richieste per non sovraccaricare l'API
    if (certified + failed < articles.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  await conn.end();

  console.log(`\n📊 Risultato batch PPV:`);
  console.log(`  ✅ Certificati: ${certified}`);
  console.log(`  ❌ Falliti: ${failed}`);

  // Verifica totale certificati nel DB
  const conn2 = await mysql.createConnection(process.env.DATABASE_URL);
  const [countRows] = await conn2.execute(
    `SELECT COUNT(*) as total FROM news_items WHERE ppvHash IS NOT NULL AND ppvHash != ''`
  );
  console.log(`  📈 Totale certificati nel DB: ${countRows[0].total}`);
  await conn2.end();
}

main().catch(err => {
  console.error("❌ Errore fatale:", err);
  process.exit(1);
});
