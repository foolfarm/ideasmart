/**
 * seed-osservatorio.mjs
 * Popola la tabella osservatorio_articles con gli editoriali di Andrea Cinelli
 * degli ultimi 30 giorni presi dalla tabella daily_editorial.
 */
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // 1. Leggi gli editoriali di aprile 2026 (ultimi 30 giorni)
  const [editorials] = await conn.execute(`
    SELECT id, dateLabel, title, subtitle, section, imageUrl
    FROM daily_editorial
    WHERE dateLabel LIKE '2026-04-%'
    ORDER BY dateLabel DESC
    LIMIT 30
  `);

  console.log(`Trovati ${editorials.length} editoriali da importare.`);

  // 2. Svuota la tabella per evitare duplicati (fresh seed)
  await conn.execute("DELETE FROM osservatorio_articles WHERE 1=1");
  console.log("Tabella osservatorio_articles svuotata.");

  // 3. Inserisci ogni editoriale come articolo dell'Osservatorio
  let inserted = 0;
  for (const ed of editorials) {
    // Costruisci l'URL dell'articolo interno ProofPress
    const section = ed.section || "ai";
    const articleUrl = `https://proofpress.ai/${section}/editoriale/${ed.id}`;

    // Normalizza la data in formato YYYY-MM-DD
    let dateLabel = ed.dateLabel;
    if (dateLabel && dateLabel.includes("-")) {
      const parts = dateLabel.split("-");
      if (parts[0].length === 2) {
        // formato DD-MM-YYYY → YYYY-MM-DD
        dateLabel = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Tag basati sulla sezione
    const tagMap = {
      ai: "AI, Intelligenza Artificiale, Business",
      startup: "Startup, Venture Capital, Innovation",
      dealroom: "Dealroom, M&A, Investment",
    };
    const tags = tagMap[section] || "Tech, Innovation";

    await conn.execute(
      `INSERT INTO osservatorio_articles 
       (dateLabel, title, excerpt, articleUrl, publication, imageUrl, tags, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        dateLabel,
        ed.title,
        ed.subtitle || null,
        articleUrl,
        "ProofPress Magazine",
        ed.imageUrl || null,
        tags,
      ]
    );
    inserted++;
    console.log(`  ✓ [${dateLabel}] ${ed.title.substring(0, 60)}...`);
  }

  console.log(`\n✅ Inseriti ${inserted} articoli nella tabella osservatorio_articles.`);
  await conn.end();
}

main().catch((err) => {
  console.error("❌ Errore:", err.message);
  process.exit(1);
});
