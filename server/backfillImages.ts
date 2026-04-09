/**
 * Proof Press — Backfill Images
 *
 * Script eseguito una volta all'avvio del server per generare
 * immagini AI per tutti gli articoli esistenti che non ne hanno una.
 *
 * Viene chiamato da server/index.ts dopo l'avvio degli scheduler.
 * Non blocca l'avvio: usa setTimeout per partire dopo 30 secondi.
 */

import { getDb } from "./db";
import {
  newsItems,
  dailyEditorial,
  startupOfDay,
  weeklyReportage,
  marketAnalysis,
} from "../drizzle/schema";
import { isNull, eq } from "drizzle-orm";
import {
  genImageForNews,
  genImageForEditorial,
  genImageForStartup,
  genImageForReportage,
  genImageForMarketAnalysis,
} from "./imageAutoGen";

const DELAY_BETWEEN_MS = 2000; // 2 secondi tra ogni generazione per non sovraccaricare

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfillNewsImages(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const items = await db.select().from(newsItems).where(isNull(newsItems.imageUrl)).limit(20);
  if (items.length === 0) {
    console.log("[BackfillImages] News: tutte le immagini già presenti");
    return;
  }
  console.log(`[BackfillImages] News: generazione immagini per ${items.length} articoli...`);
  for (const item of items) {
    const url = await genImageForNews(item.title, item.category);
    if (url) {
      await db.update(newsItems).set({ imageUrl: url }).where(eq(newsItems.id, item.id));
      console.log(`[BackfillImages] News ✓ "${item.title.slice(0, 50)}"`);
    }
    await sleep(DELAY_BETWEEN_MS);
  }
}

async function backfillEditorialImages(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const items = await db.select().from(dailyEditorial).where(isNull(dailyEditorial.imageUrl)).limit(5);
  if (items.length === 0) {
    console.log("[BackfillImages] Editoriale: tutte le immagini già presenti");
    return;
  }
  console.log(`[BackfillImages] Editoriale: generazione immagini per ${items.length} articoli...`);
  for (const item of items) {
    const url = await genImageForEditorial(item.title, item.keyTrend ?? "AI Innovation");
    if (url) {
      await db.update(dailyEditorial).set({ imageUrl: url }).where(eq(dailyEditorial.id, item.id));
      console.log(`[BackfillImages] Editoriale ✓ "${item.title.slice(0, 50)}"`);
    }
    await sleep(DELAY_BETWEEN_MS);
  }
}

async function backfillStartupImages(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const items = await db.select().from(startupOfDay).where(isNull(startupOfDay.imageUrl)).limit(5);
  if (items.length === 0) {
    console.log("[BackfillImages] Startup: tutte le immagini già presenti");
    return;
  }
  console.log(`[BackfillImages] Startup: generazione immagini per ${items.length} startup...`);
  for (const item of items) {
    const url = await genImageForStartup(item.name, item.category, item.tagline ?? "");
    if (url) {
      await db.update(startupOfDay).set({ imageUrl: url }).where(eq(startupOfDay.id, item.id));
      console.log(`[BackfillImages] Startup ✓ "${item.name}"`);
    }
    await sleep(DELAY_BETWEEN_MS);
  }
}

async function backfillReportageImages(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const items = await db.select().from(weeklyReportage).where(isNull(weeklyReportage.imageUrl)).limit(8);
  if (items.length === 0) {
    console.log("[BackfillImages] Reportage: tutte le immagini già presenti");
    return;
  }
  console.log(`[BackfillImages] Reportage: generazione immagini per ${items.length} reportage...`);
  for (const item of items) {
    const url = await genImageForReportage(item.startupName, item.headline, item.category);
    if (url) {
      await db.update(weeklyReportage).set({ imageUrl: url }).where(eq(weeklyReportage.id, item.id));
      console.log(`[BackfillImages] Reportage ✓ "${item.startupName}"`);
    }
    await sleep(DELAY_BETWEEN_MS);
  }
}

async function backfillMarketAnalysisImages(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  const items = await db.select().from(marketAnalysis).where(isNull(marketAnalysis.imageUrl)).limit(8);
  if (items.length === 0) {
    console.log("[BackfillImages] Analisi: tutte le immagini già presenti");
    return;
  }
  console.log(`[BackfillImages] Analisi: generazione immagini per ${items.length} analisi...`);
  for (const item of items) {
    const url = await genImageForMarketAnalysis(item.title, item.category, item.source);
    if (url) {
      await db.update(marketAnalysis).set({ imageUrl: url }).where(eq(marketAnalysis.id, item.id));
      console.log(`[BackfillImages] Analisi ✓ "${item.title.slice(0, 50)}"`);
    }
    await sleep(DELAY_BETWEEN_MS);
  }
}

/**
 * Esegue il backfill di tutte le immagini mancanti.
 * Viene chiamato in background all'avvio del server.
 */
export async function runImageBackfill(): Promise<void> {
  console.log("[BackfillImages] Avvio backfill immagini articoli esistenti...");
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[BackfillImages] Database non disponibile, backfill saltato");
      return;
    }

    await backfillNewsImages(db);
    await backfillEditorialImages(db);
    await backfillStartupImages(db);
    await backfillReportageImages(db);
    await backfillMarketAnalysisImages(db);

    console.log("[BackfillImages] ✅ Backfill completato con successo");
  } catch (err) {
    console.error("[BackfillImages] ❌ Errore durante il backfill:", err);
  }
}

/**
 * Avvia il backfill in background dopo 30 secondi dall'avvio del server.
 * Non blocca l'avvio del server.
 */
export function scheduleImageBackfill(): void {
  console.log("[BackfillImages] Backfill schedulato tra 30 secondi...");
  setTimeout(() => {
    runImageBackfill().catch(console.error);
  }, 30_000);
}
