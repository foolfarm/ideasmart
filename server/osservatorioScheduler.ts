/**
 * Proof Press — Osservatorio Tech Scheduler
 * ─────────────────────────────────────────────────────────────────────────────
 * Sincronizza ogni notte la tabella `osservatorio_articles` con i nuovi
 * editoriali di Andrea Cinelli pubblicati nella `daily_editorial`.
 *
 * Strategia: UPSERT incrementale — non cancella mai i record esistenti.
 * Usa `articleUrl` come chiave univoca per evitare duplicati.
 * Mantiene un archivio scorrevole degli ultimi 90 giorni.
 */
import { getDb } from "./db";
import { osservatorioArticles, dailyEditorial } from "../drizzle/schema";
import { desc, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

// Mappa sezione → tag
const TAG_MAP: Record<string, string> = {
  ai: "AI, Intelligenza Artificiale, Business",
  startup: "Startup, Venture Capital, Innovation",
  dealroom: "Dealroom, M&A, Investment",
};

// Normalizza dateLabel da DD-MM-YYYY a YYYY-MM-DD
function normalizeDateLabel(raw: string): string {
  if (!raw || !raw.includes("-")) return raw;
  const parts = raw.split("-");
  if (parts[0].length === 2) {
    // DD-MM-YYYY → YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return raw; // già YYYY-MM-DD
}

// Restituisce la data di 90 giorni fa in formato YYYY-MM-DD
function get90DaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d.toISOString().slice(0, 10);
}

/**
 * Sincronizza gli editoriali degli ultimi 90 giorni nell'Osservatorio Tech.
 * Aggiunge solo i nuovi articoli non ancora presenti (upsert su articleUrl).
 * Restituisce il numero di articoli inseriti.
 */
export async function syncOsservatorioArticles(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[OsservatorioScheduler] DB non disponibile — skip");
    return 0;
  }

  const cutoff = get90DaysAgo(); // es. "2026-01-25"
  console.log(`[OsservatorioScheduler] Sincronizzazione articoli dal ${cutoff}...`);

  // 1. Recupera tutti gli editoriali degli ultimi 90 giorni
  //    dateLabel è varchar YYYY-MM-DD — confronto lessicografico funziona correttamente
  const editorials = await db
    .select({
      id: dailyEditorial.id,
      dateLabel: dailyEditorial.dateLabel,
      title: dailyEditorial.title,
      subtitle: dailyEditorial.subtitle,
      section: dailyEditorial.section,
      imageUrl: dailyEditorial.imageUrl,
    })
    .from(dailyEditorial)
    .where(sql`${dailyEditorial.dateLabel} >= ${cutoff}`)
    .orderBy(desc(dailyEditorial.createdAt))
    .limit(120);

  if (editorials.length === 0) {
    console.log("[OsservatorioScheduler] Nessun editoriale trovato — skip");
    return 0;
  }

  // 2. Recupera gli URL già presenti per evitare duplicati
  const existing = await db
    .select({ articleUrl: osservatorioArticles.articleUrl })
    .from(osservatorioArticles);
  const existingUrls = new Set(existing.map((r) => r.articleUrl));

  // 3. Inserisci solo i nuovi
  let inserted = 0;
  for (const ed of editorials) {
    const section = ed.section ?? "ai";
    const articleUrl = `https://proofpress.ai/${section}/editoriale/${ed.id}`;

    if (existingUrls.has(articleUrl)) continue; // già presente

    const dateLabel = normalizeDateLabel(ed.dateLabel ?? "");
    const tags = TAG_MAP[section] ?? "Tech, Innovation";

    await db.insert(osservatorioArticles).values({
      dateLabel,
      title: ed.title,
      excerpt: ed.subtitle ?? null,
      articleUrl,
      publication: "ProofPress Magazine",
      imageUrl: ed.imageUrl ?? null,
      tags,
      sortOrder: 0,
    });

    inserted++;
    console.log(
      `[OsservatorioScheduler]   ✓ [${dateLabel}] ${(ed.title ?? "").substring(0, 60)}...`
    );
  }

  console.log(
    `[OsservatorioScheduler] ✅ Completato: ${inserted} nuovi articoli inseriti (${editorials.length} editoriali analizzati)`
  );

  // 4. Notifica owner se ci sono nuovi articoli
  if (inserted > 0) {
    try {
      await notifyOwner({
        title: `Osservatorio Tech — ${inserted} nuovi articoli aggiunti`,
        content:
          `Sincronizzazione notturna completata.\n\n` +
          `• Nuovi articoli inseriti: ${inserted}\n` +
          `• Finestra temporale: ultimi 90 giorni\n` +
          `• Editoriali analizzati: ${editorials.length}\n\n` +
          `Visualizza l'archivio su: https://proofpress.ai/osservatorio-tech`,
      });
    } catch {
      // Notifica non critica — non blocca il job
    }
  }

  return inserted;
}
