/**
 * Test end-to-end del flusso ProofPress Verify API
 * 1. Crea organizzazione di test nel DB
 * 2. Crea subscription trial
 * 3. Genera API key
 * 4. Chiama GET /api/verify/status
 * 5. Chiama POST /api/verify/article con un articolo esistente
 * 6. Chiama GET /api/verify/report/:hash
 * 7. Pulisce i dati di test
 */
import mysql from "mysql2/promise";
import crypto from "crypto";
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";
const KEY_PREFIX_LEN = 16;
const KEY_TOTAL_LEN = 48;

function generateRawKey() {
  return "ppv_live_" + crypto.randomBytes(20).toString("hex");
}

function hashKey(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("✅ DB connesso");

  // 1. Crea organizzazione di test
  const [orgResult] = await conn.execute(
    `INSERT INTO verify_organizations (name, slug, contactEmail, contactName, plan, status, trialEndsAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      "TEST_ORG_DEBUG",
      "test-org-debug-" + Date.now(),
      "test@proofpress.ai",
      "Test Debug",
      "essential",
      "trial",
      new Date(Date.now() + 14 * 86400_000),
    ]
  );
  const orgId = orgResult.insertId;
  console.log(`✅ Organizzazione creata: ID=${orgId}`);

  // 2. Crea subscription trial
  const now = new Date();
  const periodEnd = new Date(Date.now() + 14 * 86400_000);
  await conn.execute(
    `INSERT INTO verify_subscriptions (organizationId, plan, articlesLimit, articlesUsed, periodStart, periodEnd, priceMonthly, currency, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [orgId, "essential", 100, 0, now, periodEnd, 49000, "EUR", "trial"]
  );
  console.log("✅ Subscription trial creata");

  // 3. Genera API key
  const rawKey = generateRawKey();
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, KEY_PREFIX_LEN) + "...";
  await conn.execute(
    `INSERT INTO verify_api_keys (organizationId, keyPrefix, keyHash, label, canVerify, canReadReports, canManageOrg, rateLimit, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [orgId, keyPrefix, keyHash, "Test Key", true, true, false, 100, true]
  );
  console.log(`✅ API key generata: ${keyPrefix}`);
  console.log(`   Raw key: ${rawKey}`);

  // 4. Test GET /api/verify/status
  console.log("\n--- TEST: GET /api/verify/status ---");
  const statusRes = await fetch(`${BASE_URL}/api/verify/status`, {
    headers: { Authorization: `Bearer ${rawKey}` },
  });
  const statusData = await statusRes.json();
  if (statusRes.ok) {
    console.log("✅ Status OK:", JSON.stringify(statusData, null, 2));
  } else {
    console.error("❌ Status FAIL:", statusData);
  }

  // 5. Prendi un articolo con verifyHash dal DB
  const [articles] = await conn.execute(
    `SELECT id, title, verifyHash, sourceUrl, trustScore, trustGrade FROM news_items WHERE verifyHash IS NOT NULL LIMIT 1`
  );
  if (articles.length === 0) {
    console.error("❌ Nessun articolo con verifyHash trovato nel DB. Impossibile testare POST /api/verify/article.");
  } else {
    const article = articles[0];
    console.log(`\n--- TEST: POST /api/verify/article ---`);
    console.log(`   Articolo: "${article.title}" (hash: ${article.verifyHash.slice(0, 16)}...)`);
    console.log(`   TrustScore esistente: ${article.trustScore} (${article.trustGrade})`);

    const verifyRes = await fetch(`${BASE_URL}/api/verify/article`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${rawKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hash: article.verifyHash }),
    });
    const verifyData = await verifyRes.json();
    if (verifyRes.ok) {
      console.log("✅ Verify OK:");
      console.log(`   Status: ${verifyData.status}`);
      console.log(`   TrustScore: ${verifyData.trustScore} (${verifyData.trustGrade})`);
      console.log(`   Usage: ${verifyData.usage?.articlesUsed}/${verifyData.usage?.articlesLimit}`);
    } else {
      console.error("❌ Verify FAIL:", verifyData);
    }

    // 6. Test GET /api/verify/report/:hash
    console.log(`\n--- TEST: GET /api/verify/report/:hash ---`);
    const reportRes = await fetch(`${BASE_URL}/api/verify/report/${article.verifyHash}`, {
      headers: { Authorization: `Bearer ${rawKey}` },
    });
    const reportData = await reportRes.json();
    if (reportRes.ok) {
      console.log("✅ Report OK:");
      console.log(`   Title: ${reportData.article?.title}`);
      console.log(`   Grade: ${reportData.trustGrade}`);
      console.log(`   Report keys: ${reportData.report ? Object.keys(reportData.report).join(", ") : "null"}`);
    } else {
      console.error("❌ Report FAIL:", reportData);
    }
  }

  // 7. Test con chiave non valida
  console.log("\n--- TEST: Chiave API non valida ---");
  const badRes = await fetch(`${BASE_URL}/api/verify/status`, {
    headers: { Authorization: "Bearer ppv_live_INVALIDKEY12345" },
  });
  const badData = await badRes.json();
  if (badRes.status === 401) {
    console.log("✅ Chiave non valida → 401 UNAUTHORIZED (corretto)");
  } else {
    console.error("❌ Atteso 401, ricevuto:", badRes.status, badData);
  }

  // 8. Test senza chiave
  console.log("\n--- TEST: Nessuna chiave API ---");
  const noKeyRes = await fetch(`${BASE_URL}/api/verify/status`);
  if (noKeyRes.status === 401) {
    console.log("✅ Nessuna chiave → 401 UNAUTHORIZED (corretto)");
  } else {
    console.error("❌ Atteso 401, ricevuto:", noKeyRes.status);
  }

  // 9. Cleanup dati di test
  await conn.execute(`DELETE FROM verify_api_keys WHERE organizationId = ?`, [orgId]);
  await conn.execute(`DELETE FROM verify_subscriptions WHERE organizationId = ?`, [orgId]);
  await conn.execute(`DELETE FROM verify_organizations WHERE id = ?`, [orgId]);
  console.log("\n✅ Dati di test rimossi");

  await conn.end();
  console.log("\n=== AUDIT COMPLETO ===");
}

run().catch((err) => {
  console.error("❌ Errore fatale:", err.message);
  process.exit(1);
});
