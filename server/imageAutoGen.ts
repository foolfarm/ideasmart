/**
 * IDEASMART — Image Auto-Generation Helper
 *
 * Genera automaticamente immagini editoriali AI per ogni tipo di contenuto
 * (news, editoriale, startup, reportage, analisi di mercato) al momento
 * della creazione, senza intervento umano.
 *
 * Stile coerente: illustrazione editoriale tech magazine italiana,
 * palette teal/navy/orange, no testo, formato 16:9.
 */

import { generateImage } from "./_core/imageGeneration";

// Stile visivo comune a tutti i contenuti IDEASMART
const STYLE_SUFFIX =
  "Style: premium Italian tech magazine editorial illustration, " +
  "clean modern design, teal and navy color palette with orange accents, " +
  "abstract geometric shapes, no text, no letters, no words, 16:9 ratio, " +
  "high quality digital art.";

/**
 * Genera un'immagine per una notizia AI
 */
export async function genImageForNews(title: string, category: string): Promise<string | null> {
  try {
    const prompt = `Editorial illustration for an AI business news article. ` +
      `Topic: "${title}". Category: ${category}. ` +
      `Visual concept: abstract representation of ${category.toLowerCase()} technology, data flows, neural networks. ` +
      STYLE_SUFFIX;
    const { url } = await generateImage({ prompt });
    return url ?? null;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to generate news image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per l'editoriale giornaliero
 */
export async function genImageForEditorial(title: string, keyTrend: string): Promise<string | null> {
  try {
    const prompt = `Editorial illustration for a daily AI business editorial. ` +
      `Title: "${title}". Key trend: ${keyTrend}. ` +
      `Visual concept: futuristic Italian business landscape, AI transformation, executive perspective. ` +
      STYLE_SUFFIX;
    const { url } = await generateImage({ prompt });
    return url ?? null;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to generate editorial image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per la startup del giorno
 */
export async function genImageForStartup(name: string, category: string, tagline: string): Promise<string | null> {
  try {
    const prompt = `Editorial illustration for an AI startup spotlight. ` +
      `Startup: "${name}". Category: ${category}. Tagline: "${tagline}". ` +
      `Visual concept: innovative startup, ${category.toLowerCase()} technology, growth and innovation. ` +
      STYLE_SUFFIX;
    const { url } = await generateImage({ prompt });
    return url ?? null;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to generate startup image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per un reportage settimanale
 */
export async function genImageForReportage(startupName: string, headline: string, category: string): Promise<string | null> {
  try {
    const prompt = `Editorial illustration for an Italian AI startup reportage. ` +
      `Startup: "${startupName}". Headline: "${headline}". Category: ${category}. ` +
      `Visual concept: Italian tech ecosystem, ${category.toLowerCase().replace("reportage · ", "").replace("analisi · ", "").replace("inchiesta · ", "").replace("focus · ", "")} innovation. ` +
      STYLE_SUFFIX;
    const { url } = await generateImage({ prompt });
    return url ?? null;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to generate reportage image:", err);
    return null;
  }
}

/**
 * Genera un'immagine per un'analisi di mercato
 */
export async function genImageForMarketAnalysis(title: string, category: string, source: string): Promise<string | null> {
  try {
    const prompt = `Editorial illustration for a market analysis report. ` +
      `Title: "${title}". Category: ${category}. Source: ${source}. ` +
      `Visual concept: market data visualization, ${category.toLowerCase()} trends, business intelligence. ` +
      STYLE_SUFFIX;
    const { url } = await generateImage({ prompt });
    return url ?? null;
  } catch (err) {
    console.error("[ImageAutoGen] Failed to generate market analysis image:", err);
    return null;
  }
}
