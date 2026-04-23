/**
 * pinIpfsBackfill.mjs
 * Pinna su IPFS via Pinata tutti gli articoli con verifyReport ma senza ipfsCid.
 * Salva ipfsCid, ipfsUrl e ipfsPinnedAt nel DB per ogni articolo.
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY_DOMAIN = process.env.PINATA_GATEWAY_DOMAIN || 'brown-characteristic-louse-309.mypinata.cloud';
const PINATA_GATEWAY_KEY = process.env.PINATA_GATEWAY_KEY || '';
const PINATA_GATEWAY = `https://${PINATA_GATEWAY_DOMAIN}/ipfs`;

if (!PINATA_JWT) {
  console.error('❌ PINATA_JWT non trovato nelle variabili d\'ambiente');
  process.exit(1);
}

async function pinToPinata(verifyReport, articleTitle, verifyHash) {
  const payload = {
    pinataContent: verifyReport,
    pinataMetadata: {
      name: `ProofPress-Verify-${verifyHash.slice(0, 16)}`,
      keyvalues: {
        articleTitle: articleTitle?.slice(0, 100) || 'Unknown',
        verifyHash: verifyHash,
        pinnedBy: 'ProofPress-Verify-Engine',
        pinnedAt: new Date().toISOString(),
      }
    },
    pinataOptions: { cidVersion: 1 }
  };

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    cid: data.IpfsHash,
    url: `${PINATA_GATEWAY}/${data.IpfsHash}${PINATA_GATEWAY_KEY ? '?pinataGatewayToken=' + PINATA_GATEWAY_KEY : ''}`
  };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('✅ DB connesso');

  const [articles] = await conn.execute(
    'SELECT id, title, verifyHash, verifyReport FROM news_items WHERE verifyReport IS NOT NULL AND ipfsCid IS NULL ORDER BY id ASC'
  );

  console.log(`📋 Articoli da pinnare: ${articles.length}`);
  if (articles.length === 0) {
    console.log('✅ Nessun articolo da pinnare — tutto già su IPFS!');
    await conn.end();
    return;
  }

  let successi = 0;
  let falliti = 0;

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const titleShort = (art.title || '').slice(0, 60);
    console.log(`\n[${i + 1}/${articles.length}] ID=${art.id} — ${titleShort}...`);
    console.log(`   Hash: ${art.verifyHash?.slice(0, 16)}...`);

    try {
      // Parsare il verifyReport (è JSON stringa nel DB)
      let reportObj;
      try {
        reportObj = typeof art.verifyReport === 'string'
          ? JSON.parse(art.verifyReport)
          : art.verifyReport;
      } catch {
        reportObj = { raw: art.verifyReport };
      }

      const { cid, url } = await pinToPinata(reportObj, art.title, art.verifyHash);

      // Aggiornare il DB
      await conn.execute(
        'UPDATE news_items SET ipfsCid = ?, ipfsUrl = ?, ipfsPinnedAt = NOW() WHERE id = ?',
        [cid, url, art.id]
      );

      console.log(`   ✅ Pinnato — CID: ${cid.slice(0, 20)}...`);
      console.log(`   🔗 URL: ${url}`);
      successi++;
    } catch (err) {
      console.error(`   ❌ Errore: ${err.message}`);
      falliti++;
    }

    // Pausa per rispettare i rate limit Pinata
    if (i < articles.length - 1) {
      process.stdout.write('   ⏳ Pausa 3s... ');
      await sleep(3000);
      console.log('OK');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 PINNING IPFS COMPLETATO');
  console.log(`   ✅ Successi: ${successi}/${articles.length}`);
  console.log(`   ❌ Falliti:  ${falliti}/${articles.length}`);

  // Verifica finale
  const [[{ tot }]] = await conn.execute(
    'SELECT COUNT(*) as tot FROM news_items WHERE verifyReport IS NOT NULL AND ipfsCid IS NULL'
  );
  console.log(`📦 Articoli ancora senza IPFS: ${tot}`);

  await conn.end();
}

main().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
