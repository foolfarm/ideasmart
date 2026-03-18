/**
 * newsletterTestSender.ts — Newsletter di Test IDEASMART
 * ─────────────────────────────────────────────────────────────────────────────
 * Invia ogni lunedì alle 08:30 CET una newsletter di test a ac@acinelli.com
 * con i contenuti reali dal DB (notizie RSS, editoriale, startup, reportage, analisi).
 *
 * Questo consente la valutazione del contenuto prima dell'invio massivo alle 09:30.
 *
 * PRINCIPIO: La newsletter di test usa ESATTAMENTE gli stessi contenuti
 * che verranno inviati nella newsletter massiva alle 09:30.
 */

import { sendEmail, buildFullNewsletterHtml } from "./email";
import {
  getLatestNews,
  getLatestEditorial,
  getLatestStartupOfDay,
  getLatestWeeklyReportage,
  getLatestMarketAnalysis,
  createNewsletterSend,
} from "./db";
import { notifyOwner } from "./_core/notification";

// ─── Configurazione ───────────────────────────────────────────────────────────

const TEST_EMAIL = "ac@acinelli.com";
const BASE_URL = "https://ideasmart.ai";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

function getIssueNumber(date: Date): string {
  return String(date.getMonth() + 1).padStart(2, "0");
}

function getDateLabel(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Costruzione newsletter con dati reali dal DB ─────────────────────────────

async function buildNewsletterFromDb(): Promise<{
  html: string;
  subject: string;
  newsCount: number;
}> {
  const now = new Date();
  const monthLabel = getMonthLabel(now);
  const issueNumber = getIssueNumber(now);
  const dateLabel = getDateLabel(now);

  // Recupera i contenuti reali dal DB (sezione AI come principale)
  const [
    newsAI,
    editorial,
    startup,
    reportages,
    analyses,
  ] = await Promise.all([
    getLatestNews(10, "ai"),
    getLatestEditorial("ai"),
    getLatestStartupOfDay("ai"),
    getLatestWeeklyReportage("ai"),
    getLatestMarketAnalysis("ai"),
  ]);

  console.log(`[NewsletterTest] Contenuti recuperati dal DB:`);
  console.log(`[NewsletterTest]   News AI: ${newsAI.length}`);
  console.log(`[NewsletterTest]   Editoriale: ${editorial ? editorial.title?.slice(0, 50) : "nessuno"}`);
  console.log(`[NewsletterTest]   Startup: ${startup ? startup.name : "nessuna"}`);
  console.log(`[NewsletterTest]   Reportage: ${reportages.length}`);
  console.log(`[NewsletterTest]   Analisi: ${analyses.length}`);

  const subject = `[TEST] IDEASMART — AI for Business · N° ${issueNumber} · ${monthLabel}`;

  const html = buildFullNewsletterHtml({
    dateLabel,
    editorial: editorial ? {
      id: editorial.id,
      section: editorial.section,
      title: editorial.title,
      subtitle: editorial.subtitle ?? null,
      body: editorial.body,
      keyTrend: editorial.keyTrend ?? null,
      authorNote: editorial.authorNote ?? null,
    } : null,
    startup: startup ? {
      id: startup.id,
      section: startup.section,
      name: startup.name,
      tagline: startup.tagline,
      description: startup.description,
      category: startup.category,
      funding: startup.funding ?? null,
      whyToday: startup.whyToday,
      websiteUrl: startup.websiteUrl ?? null,
      aiScore: startup.aiScore ?? null,
    } : null,
    news: newsAI.map(n => ({
      id: n.id ?? null,
      section: n.section,
      title: n.title,
      summary: n.summary,
      category: n.category,
      sourceName: n.sourceName ?? null,
      sourceUrl: n.sourceUrl ?? null,
    })),
    reportages: reportages.map(r => ({
      id: r.id,
      section: r.section,
      startupName: r.startupName,
      category: r.category,
      headline: r.headline,
      subheadline: r.subheadline ?? null,
      bodyText: r.bodyText,
      quote: r.quote ?? null,
      stat1Value: r.stat1Value ?? null,
      stat1Label: r.stat1Label ?? null,
      stat2Value: r.stat2Value ?? null,
      stat2Label: r.stat2Label ?? null,
      stat3Value: r.stat3Value ?? null,
      stat3Label: r.stat3Label ?? null,
      websiteUrl: r.websiteUrl ?? null,
      ctaLabel: r.ctaLabel ?? null,
      ctaUrl: r.ctaUrl ?? null,
    })),
    analyses: analyses.map(a => ({
      id: a.id,
      section: a.section,
      title: a.title,
      category: a.category,
      summary: a.summary,
      source: a.source,
      dataPoint1: a.dataPoint1 ?? null,
      dataPoint2: a.dataPoint2 ?? null,
      dataPoint3: a.dataPoint3 ?? null,
      keyInsight: a.keyInsight ?? null,
      italyRelevance: a.italyRelevance ?? null,
    })),
    unsubscribeUrl: `${BASE_URL}/unsubscribe`,
    isTest: true,
  });

  return { html, subject, newsCount: newsAI.length };
}

// ─── Invio newsletter di test ─────────────────────────────────────────────────

export async function sendTestNewsletter(): Promise<{
  success: boolean;
  subject: string;
  newsCount: number;
  error?: string;
}> {
  console.log(`[NewsletterTest] 📧 Avvio invio newsletter di test a ${TEST_EMAIL}...`);

  try {
    const { html, subject, newsCount } = await buildNewsletterFromDb();

    const result = await sendEmail({
      to: TEST_EMAIL,
      subject,
      html,
    });

    if (result.success) {
      console.log(`[NewsletterTest] ✅ Newsletter di test inviata con successo a ${TEST_EMAIL}`);
      console.log(`[NewsletterTest]   Subject: ${subject}`);
      console.log(`[NewsletterTest]   News: ${newsCount}`);

      // Notifica owner
      await notifyOwner({
        title: `📧 Newsletter di test inviata — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Newsletter di test inviata a ${TEST_EMAIL}.\n\nContenuti: ${newsCount} notizie AI reali da RSS.\n\nL'invio massivo avverrà alle 09:30 CET.\n\nSe il contenuto non è soddisfacente, contattare il team prima delle 09:30.`,
      });

      return { success: true, subject, newsCount };
    } else {
      console.error(`[NewsletterTest] ❌ Errore invio test: ${result.error}`);
      return { success: false, subject, newsCount, error: result.error };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[NewsletterTest] ❌ Errore critico:", msg);

    try {
      await notifyOwner({
        title: `❌ Errore newsletter di test — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Errore durante l'invio della newsletter di test: ${msg}`,
      });
    } catch {}

    return { success: false, subject: "", newsCount: 0, error: msg };
  }
}
