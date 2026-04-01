/**
 * IDEASMART — Image Auto-Generation Helper
 *
 * Genera automaticamente immagini editoriali per ogni tipo di contenuto
 * (news, editoriale, startup, reportage, analisi di mercato) al momento
 * della creazione, senza intervento umano.
 *
 * AGGIORNAMENTO 1 Apr 2026: usa Pexels (gratuito) invece di AI generation
 * per ridurre il consumo di crediti (~58 immagini AI/giorno eliminate).
 */

import {
  findNewsImage,
  findStockImage,
  findStartupImage,
  findReportageImage,
  findMarketAnalysisImage,
} from "./stockImages";

/**
 * Genera un'immagine per una notizia AI (via Pexels)
 */
export async function genImageForNews(title: string, category: string): Promise<string | null> {
  try {
    const url = await findNewsImage(title, category);
    if (url) {
      console.log(`[ImageAutoGen] ✅ Pexels news image found for: "${title.slice(0, 60)}..."`);
    }
    return url;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to find news image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per l'editoriale giornaliero (via Pexels)
 */
export async function genImageForEditorial(title: string, keyTrend: string): Promise<string | null> {
  try {
    const url = await findStockImage(title, "Modelli Generativi", keyTrend);
    if (url) {
      console.log(`[ImageAutoGen] ✅ Pexels editorial image found for: "${title.slice(0, 60)}..."`);
    }
    return url;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to find editorial image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per la startup del giorno (via Pexels)
 */
export async function genImageForStartup(name: string, category: string, tagline: string): Promise<string | null> {
  try {
    const url = await findStartupImage(name, category, tagline);
    if (url) {
      console.log(`[ImageAutoGen] ✅ Pexels startup image found for: "${name}"`);
    }
    return url;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to find startup image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per un reportage settimanale (via Pexels)
 */
export async function genImageForReportage(startupName: string, headline: string, category: string): Promise<string | null> {
  try {
    const url = await findReportageImage(startupName, headline, category);
    if (url) {
      console.log(`[ImageAutoGen] ✅ Pexels reportage image found for: "${startupName}"`);
    }
    return url;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to find reportage image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per un'analisi di mercato (via Pexels)
 */
export async function genImageForMarketAnalysis(title: string, category: string, source: string): Promise<string | null> {
  try {
    const url = await findMarketAnalysisImage(title, category, source);
    if (url) {
      console.log(`[ImageAutoGen] ✅ Pexels market analysis image found for: "${title.slice(0, 60)}..."`);
    }
    return url;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to find market analysis image:", err);
    return null;
  }
}
