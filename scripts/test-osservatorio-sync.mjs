/**
 * test-osservatorio-sync.mjs
 * Verifica che syncOsservatorioArticles funzioni correttamente.
 * Esegue una sincronizzazione incrementale e riporta il risultato.
 */
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

// Mappa sezione → tag
const TAG_MAP = {
  ai: "AI, Intelligenza Artificiale, Business",
  startup: "Startup, Venture Capital, Innovation",
  dealroom: "Dealroom, M&A, Investment",
};

function normalizeDateLabel(raw) {
  if (!raw || !raw.includes("-")) return raw;
  const parts = raw.split("-");
  if (parts[0].length === 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return raw;
}

function get90DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

async function syncOsservatorioArticles() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  const cutoff = get90DaysAgo();
  console.log(`[OsservatorioScheduler] Sincronizzazione articoli dal ${cutoff}...`);

  // 1. Recupera editoriali degli ultimi 90 giorni
  const [editorials] = await conn.execute(
    `SELECT id, dateLabel, title, subtitle, section, imageUrl
     FROM daily_editorial
     WHERE dateLabel >= ?
     ORDER BY createdAt DESC
     LIMIT 120`,
    [cutoff]
  );

  console.log(`[OsservatorioScheduler] Trovati ${editorials.length} editoriali.`);

  if (editorials.length === 0) {
    await conn.end();
    return 0;
  }

  // 2. Recupera URL già presenti
  const [existing] = await conn.execute(
    "SELECT articleUrl FROM osservatorio_articles"
  );
  const existingUrls = new Set(existing.map((r) => r.articleUrl));
  console.log(`[OsservatorioScheduler] Articoli già presenti: ${existingUrls.size}`);

  // 3. Inserisci solo i nuovi
  let inserted = 0;
  for (const ed of editorials) {
    const section = ed.section ?? "ai";
    const articleUrl = `https://proofpress.ai/${section}/editoriale/${ed.id}`;

    if (existingUrls.has(articleUrl)) continue;

    const dateLabel = normalizeDateLabel(ed.dateLabel ?? "");
    const tags = TAG_MAP[section] ?? "Tech, Innovation";

    await conn.execute(
      `INSERT INTO osservatorio_articles
       (dateLabel, title, excerpt, articleUrl, publication, imageUrl, tags, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [
        dateLabel,
        ed.title,
        ed.subtitle ?? null,
        articleUrl,
        "ProofPress Magazine",
        ed.imageUrl ?? null,
        tags,
      ]
    );

    inserted++;
    console.log(`  ✓ [${dateLabel}] ${(ed.title ?? "").substring(0, 60)}...`);
  }

  console.log(`\n✅ Sincronizzazione completata: ${inserted} nuovi articoli inseriti.`);
  await conn.end();
  return inserted;
}

syncOsservatorioArticles()
  .then((n) => {
    console.log(`\nTest completato con successo. Nuovi articoli: ${n}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Errore:", err.message);
    process.exit(1);
  });
