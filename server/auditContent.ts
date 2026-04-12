/**
 * auditContent.ts — Routine di audit per la coerenza dei contenuti
 *
 * Verifica che il titolo e il sommario di ogni notizia/analisi/reportage
 * corrispondano effettivamente al contenuto della pagina di destinazione (sourceUrl).
 *
 * Flusso:
 * 1. Fetch della pagina di destinazione (con timeout)
 * 2. Estrazione del testo visibile (strip HTML)
 * 3. Verifica LLM: il contenuto della pagina parla dello stesso argomento del titolo?
 * 4. Salvataggio del risultato in content_audit
 */

import { getDb } from "./db";
import { contentAudit, newsItems, marketAnalysis, weeklyReportage } from "../drizzle/schema";
import { invokeLLMFast, stripJsonBackticks } from "./_core/llm";
import { eq, and, isNotNull, desc } from "drizzle-orm";

// ── Configurazione ─────────────────────────────────────────────────────────
const FETCH_TIMEOUT_MS = 10_000;
const MAX_TEXT_LENGTH = 3000; // caratteri estratti dalla pagina per il LLM
const USER_AGENT = "Mozilla/5.0 (compatible; Proof Press-AuditBot/1.0; +https://www.ideasmart.biz)";

// ── Estrazione testo da HTML ───────────────────────────────────────────────
function extractTextFromHtml(html: string): string {
  // Rimuove script, style, nav, footer, header
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
    // Converte tag di paragrafo in newline
    .replace(/<\/?(p|h[1-6]|li|br|div|section|article)[^>]*>/gi, "\n")
    // Rimuove tutti i tag HTML rimanenti
    .replace(/<[^>]+>/g, " ")
    // Decodifica entità HTML comuni
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Normalizza spazi e newline
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3}/g, "\n\n")
    .trim();

  return text.slice(0, MAX_TEXT_LENGTH);
}

// ── Fetch pagina con timeout ───────────────────────────────────────────────
export async function fetchPageText(url: string): Promise<{
  text: string;
  httpStatus: number;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        text: "",
        httpStatus: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const html = await response.text();
    const text = extractTextFromHtml(html);

    return { text, httpStatus: response.status };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return { text: "", httpStatus: 0, error: "Timeout: pagina non raggiungibile entro 10s" };
    }
    return { text: "", httpStatus: 0, error: `Errore fetch: ${err.message}` };
  }
}

// ── Verifica coerenza con LLM ─────────────────────────────────────────────
export async function checkCoherence(params: {
  publishedTitle: string;
  publishedSummary: string;
  pageText: string;
  url: string;
}): Promise<{
  score: number;        // 0-100
  status: "ok" | "warning" | "error";
  note: string;
}> {
  const { publishedTitle, publishedSummary, pageText, url } = params;

  if (!pageText || pageText.length < 50) {
    return {
      score: 0,
      status: "error",
      note: "Testo estratto dalla pagina insufficiente per la verifica."
    };
  }

  const prompt = `Sei un editor giornalistico che verifica la coerenza tra i contenuti pubblicati e le fonti originali.

CONTENUTO PUBBLICATO:
Titolo: "${publishedTitle}"
Sommario: "${publishedSummary}"
URL fonte: ${url}

TESTO ESTRATTO DALLA PAGINA DI DESTINAZIONE (primi ${MAX_TEXT_LENGTH} caratteri):
---
${pageText}
---

COMPITO:
1. Verifica se il testo estratto dalla pagina parla dello stesso argomento del titolo e sommario pubblicati.
2. Assegna un punteggio di coerenza da 0 a 100:
   - 80-100: Coerente (la pagina tratta lo stesso argomento del titolo)
   - 50-79: Parzialmente coerente (la pagina è correlata ma non identica)
   - 20-49: Poco coerente (la pagina tratta un argomento diverso)
   - 0-19: Non coerente (la pagina non ha nulla a che fare con il titolo)
3. Scrivi una nota breve (max 150 caratteri) che spiega il risultato.

Rispondi SOLO con JSON valido in questo formato:
{"score": <numero 0-100>, "note": "<spiegazione breve>"}`;

  try {
    const response = await invokeLLMFast({
      messages: [
        { role: "system" as const, content: "Sei un editor giornalistico preciso. Rispondi sempre e solo con JSON valido." },
        { role: "user" as const, content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "coherence_check",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: { type: "number", description: "Punteggio di coerenza 0-100" },
              note: { type: "string", description: "Spiegazione breve del risultato" }
            },
            required: ["score", "note"],
            additionalProperties: false
          }
        }
      }
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("LLM non ha restituito contenuto");
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

    const parsed = JSON.parse(stripJsonBackticks(content));
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const note = String(parsed.note || "").slice(0, 500);

    let status: "ok" | "warning" | "error";
    if (score >= 70) status = "ok";
    else if (score >= 40) status = "warning";
    else status = "error";

    return { score, status, note };
  } catch (err: any) {
    return {
      score: 0,
      status: "error",
      note: `Errore verifica LLM: ${err.message?.slice(0, 100)}`
    };
  }
}

// ── Audit di una singola notizia ───────────────────────────────────────────
export async function auditNewsItem(newsId: number): Promise<{
  status: string;
  score: number | null;
  note: string;
}> {
  const db = await getDb();
  if (!db) return { status: "error", score: null, note: "Database non disponibile" };

  const [item] = await db
    .select()
    .from(newsItems)
    .where(eq(newsItems.id, newsId))
    .limit(1);

  if (!item) return { status: "error", score: null, note: "Notizia non trovata" };
  if (!item.sourceUrl) return { status: "error", score: null, note: "Nessun URL fonte disponibile" };

  const { text, httpStatus, error } = await fetchPageText(item.sourceUrl);

  if (error && !text) {
    await db.insert(contentAudit).values({
      contentType: "news",
      contentId: newsId,
      sourceUrl: item.sourceUrl,
      publishedTitle: item.title,
      publishedSummary: item.summary,
      status: "unreachable",
      coherenceScore: null,
      auditNote: error,
      extractedText: null,
      httpStatus,
      section: item.section
    });
    return { status: "unreachable", score: null, note: error };
  }

  const { score, status, note } = await checkCoherence({
    publishedTitle: item.title,
    publishedSummary: item.summary,
    pageText: text,
    url: item.sourceUrl
  });

  await db.insert(contentAudit).values({
    contentType: "news",
    contentId: newsId,
    sourceUrl: item.sourceUrl,
    publishedTitle: item.title,
    publishedSummary: item.summary,
    status,
    coherenceScore: score,
    auditNote: note,
    extractedText: text.slice(0, 2000),
    httpStatus,
    section: item.section
  });

  return { status, score, note };
}

// ── Audit di un'analisi di mercato ─────────────────────────────────────────
export async function auditMarketAnalysis(analysisId: number): Promise<{
  status: string;
  score: number | null;
  note: string;
}> {
  const db = await getDb();
  if (!db) return { status: "error", score: null, note: "Database non disponibile" };

  const [item] = await db
    .select()
    .from(marketAnalysis)
    .where(eq(marketAnalysis.id, analysisId))
    .limit(1);

  if (!item) return { status: "error", score: null, note: "Analisi non trovata" };
  if (!item.sourceUrl) return { status: "error", score: null, note: "Nessun URL fonte disponibile" };

  const { text, httpStatus, error } = await fetchPageText(item.sourceUrl);

  if (error && !text) {
    await db.insert(contentAudit).values({
      contentType: "analysis",
      contentId: analysisId,
      sourceUrl: item.sourceUrl,
      publishedTitle: item.title,
      publishedSummary: item.summary,
      status: "unreachable",
      coherenceScore: null,
      auditNote: error,
      extractedText: null,
      httpStatus,
      section: item.section
    });
    return { status: "unreachable", score: null, note: error };
  }

  const { score, status, note } = await checkCoherence({
    publishedTitle: item.title,
    publishedSummary: item.summary,
    pageText: text,
    url: item.sourceUrl
  });

  await db.insert(contentAudit).values({
    contentType: "analysis",
    contentId: analysisId,
    sourceUrl: item.sourceUrl,
    publishedTitle: item.title,
    publishedSummary: item.summary,
    status,
    coherenceScore: score,
    auditNote: note,
    extractedText: text.slice(0, 2000),
    httpStatus,
    section: item.section
  });

  return { status, score, note };
}

// ── Audit batch: ultime N notizie senza audit recente ─────────────────────
export async function runBatchAudit(params: {
  section?: "ai" | "startup" | "health";
  limit?: number;
  contentType?: "news" | "analysis";
}): Promise<{
  processed: number;
  ok: number;
  warning: number;
  error: number;
  unreachable: number;
}> {
  const { section, limit = 20, contentType = "news" } = params;

  const results = { processed: 0, ok: 0, warning: 0, error: 0, unreachable: 0 };

  const db = await getDb();
  if (!db) return results;

  if (contentType === "news") {
    // Prendi le ultime notizie con sourceUrl
    const items = await db
      .select({ id: newsItems.id })
      .from(newsItems)
      .where(
        and(
          isNotNull(newsItems.sourceUrl),
          section ? eq(newsItems.section, section) : undefined
        )
      )
      .orderBy(desc(newsItems.createdAt))
      .limit(limit);

    for (const item of items) {
      const result = await auditNewsItem(item.id);
      results.processed++;
      results[result.status as keyof typeof results] = (results[result.status as keyof typeof results] || 0) + 1;
    }
  } else {
    // Analisi di mercato
    const items = await db
      .select({ id: marketAnalysis.id })
      .from(marketAnalysis)
      .where(
        and(
          isNotNull(marketAnalysis.sourceUrl),
          section ? eq(marketAnalysis.section, section) : undefined
        )
      )
      .orderBy(desc(marketAnalysis.createdAt))
      .limit(limit);

    for (const item of items) {
      const result = await auditMarketAnalysis(item.id);
      results.processed++;
      results[result.status as keyof typeof results] = (results[result.status as keyof typeof results] || 0) + 1;
    }
  }

  return results;
}

// ── Audit di un reportage settimanale ────────────────────────────────────
export async function auditReportage(reportageId: number): Promise<{
  status: string;
  score: number | null;
  note: string;
}> {
  const db = await getDb();
  if (!db) return { status: "error", score: null, note: "Database non disponibile" };

  const [item] = await db
    .select()
    .from(weeklyReportage)
    .where(eq(weeklyReportage.id, reportageId))
    .limit(1);

  if (!item) return { status: "error", score: null, note: "Reportage non trovato" };

  // Per i reportage usiamo ctaUrl o websiteUrl come fonte da verificare
  const sourceUrl = item.ctaUrl || item.websiteUrl;
  if (!sourceUrl) return { status: "error", score: null, note: "Nessun URL disponibile per questo reportage" };

  const { text, httpStatus, error } = await fetchPageText(sourceUrl);

  if (error && !text) {
    await db.insert(contentAudit).values({
      contentType: "reportage",
      contentId: reportageId,
      sourceUrl,
      publishedTitle: item.headline,
      publishedSummary: `${item.startupName}: ${item.subheadline ?? item.bodyText.slice(0, 200)}`,
      status: "unreachable",
      coherenceScore: null,
      auditNote: error,
      extractedText: null,
      httpStatus,
      section: item.section
    });
    return { status: "unreachable", score: null, note: error };
  }

  const { score, status, note } = await checkCoherence({
    publishedTitle: item.headline,
    publishedSummary: `${item.startupName} — ${item.subheadline ?? item.bodyText.slice(0, 200)}`,
    pageText: text,
    url: sourceUrl
  });

  await db.insert(contentAudit).values({
    contentType: "reportage",
    contentId: reportageId,
    sourceUrl,
    publishedTitle: item.headline,
    publishedSummary: `${item.startupName}: ${item.subheadline ?? ""}`,
    status,
    coherenceScore: score,
    auditNote: note,
    extractedText: text.slice(0, 2000),
    httpStatus,
    section: item.section
  });

  return { status, score, note };
}

// ── Audit completo: news + analisi + reportage ────────────────────────────
export async function runFullAudit(params: {
  section?: "ai" | "startup" | "health";
  limit?: number;
}): Promise<{
  processed: number;
  ok: number;
  warning: number;
  error: number;
  unreachable: number;
  byType: Record<string, { processed: number; ok: number; warning: number; error: number; unreachable: number }>;
}> {
  const { section, limit = 20 } = params;
  const db = await getDb();

  const totals = { processed: 0, ok: 0, warning: 0, error: 0, unreachable: 0 };
  const byType: Record<string, typeof totals> = {
    news: { processed: 0, ok: 0, warning: 0, error: 0, unreachable: 0 },
    analysis: { processed: 0, ok: 0, warning: 0, error: 0, unreachable: 0 },
    reportage: { processed: 0, ok: 0, warning: 0, error: 0, unreachable: 0 }
  };

  if (!db) return { ...totals, byType };

  // 1. Notizie
  const newsRows = await db
    .select({ id: newsItems.id })
    .from(newsItems)
    .where(and(isNotNull(newsItems.sourceUrl), section ? eq(newsItems.section, section) : undefined))
    .orderBy(desc(newsItems.createdAt))
    .limit(limit);

  for (const row of newsRows) {
    const r = await auditNewsItem(row.id);
    byType.news.processed++;
    byType.news[r.status as keyof typeof totals] = (byType.news[r.status as keyof typeof totals] || 0) + 1;
    totals.processed++;
    totals[r.status as keyof typeof totals] = (totals[r.status as keyof typeof totals] || 0) + 1;
  }

  // 2. Analisi di mercato
  const analysisRows = await db
    .select({ id: marketAnalysis.id })
    .from(marketAnalysis)
    .where(and(isNotNull(marketAnalysis.sourceUrl), section ? eq(marketAnalysis.section, section) : undefined))
    .orderBy(desc(marketAnalysis.createdAt))
    .limit(Math.ceil(limit / 2));

  for (const row of analysisRows) {
    const r = await auditMarketAnalysis(row.id);
    byType.analysis.processed++;
    byType.analysis[r.status as keyof typeof totals] = (byType.analysis[r.status as keyof typeof totals] || 0) + 1;
    totals.processed++;
    totals[r.status as keyof typeof totals] = (totals[r.status as keyof typeof totals] || 0) + 1;
  }

  // 3. Reportage settimanali
  const reportageRows = await db
    .select({ id: weeklyReportage.id })
    .from(weeklyReportage)
    .where(section ? eq(weeklyReportage.section, section) : undefined)
    .orderBy(desc(weeklyReportage.createdAt))
    .limit(Math.ceil(limit / 4));

  for (const row of reportageRows) {
    const r = await auditReportage(row.id);
    byType.reportage.processed++;
    byType.reportage[r.status as keyof typeof totals] = (byType.reportage[r.status as keyof typeof totals] || 0) + 1;
    totals.processed++;
    totals[r.status as keyof typeof totals] = (totals[r.status as keyof typeof totals] || 0) + 1;
  }

  return { ...totals, byType };
}

// ── Query risultati audit ──────────────────────────────────────────────────
export async function getAuditResults(params: {
  section?: "ai" | "startup" | "health";
  status?: "ok" | "warning" | "error" | "unreachable" | "pending";
  contentType?: "news" | "analysis" | "reportage" | "startup";
  limit?: number;
}) {
  const { section, status, contentType, limit = 50 } = params;
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (section) conditions.push(eq(contentAudit.section, section));
  if (status) conditions.push(eq(contentAudit.status, status));
  if (contentType) conditions.push(eq(contentAudit.contentType, contentType));

  return db
    .select()
    .from(contentAudit)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contentAudit.auditedAt))
    .limit(limit);
}
