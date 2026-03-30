/**
 * dailyChannelNewsletter.ts — Newsletter IDEASMART
 * ─────────────────────────────────────────────────────────────────────────────
 * Calendario newsletter:
 *
 *   Lunedì    → AI News + Ricerche del Giorno
 *   Mercoledì → Startup News + Ricerche del Giorno
 *   Venerdì   → DEALROOM News + Ricerche del Giorno
 *
 * Flusso:
 *   07:00 CET — Preview di test inviata a ac@acinelli.com per revisione
 *   Invio massivo — DISABILITATO (richiede approvazione manuale da Admin)
 *
 * Il template grafico è identico per tutti i canali (buildFullNewsletterHtml),
 * con la sezione Ricerche del Giorno e banner promo IDEASMART inclusi.
 */

import { sendEmail, buildFullNewsletterHtml, buildPromoNewsletterHtml } from "./email";
import {
  getLatestNews,
  getLatestEditorial,
  getLatestStartupOfDay,
  getLatestWeeklyReportage,
  getLatestMarketAnalysis,
  getActiveSubscribers,
  getActiveSubscribersByChannel,
  createNewsletterSend,
  updateNewsletterSendRecipientCount,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { getTodayResearch } from "./researchGenerator";

// ─── Configurazione canali ────────────────────────────────────────────────────

export type ChannelKey = "ai" | "startup" | "dealroom";

interface ChannelConfig {
  key: ChannelKey;
  name: string;           // Nome visualizzato nella newsletter
  shortName: string;      // Nome breve per il subject
  dayOfWeek: number;      // 0=domenica, 1=lunedì, ..., 6=sabato
  siteSection: string;    // Percorso URL sul sito
  accentColor: string;    // Colore accento specifico del canale
  tagline: string;        // Tagline del canale
}

export const CHANNEL_SCHEDULE: ChannelConfig[] = [
  {
    key: "ai",
    name: "AI News",
    shortName: "AI",
    dayOfWeek: 1, // Lunedì
    siteSection: "/ai",
    accentColor: "#00e5c8",
    tagline: "Intelligenza Artificiale per il Business",
  },
  {
    key: "startup",
    name: "Startup News",
    shortName: "Startup",
    dayOfWeek: 3, // Mercoledì
    siteSection: "/startup",
    accentColor: "#ff5500",
    tagline: "Startup, Innovazione e Venture Capital",
  },
  {
    key: "dealroom",
    name: "DEALROOM News",
    shortName: "DEALROOM",
    dayOfWeek: 5, // Venerdì — newsletter dedicata ai round di finanziamento e deal VC
    siteSection: "/dealroom",
    accentColor: "#0f0f0f",
    tagline: "Round, Funding, VC, M&A — i deal della settimana",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE_URL = "https://ideasmart.ai";
const TEST_EMAIL = "ac@acinelli.com";

function getDateLabel(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/** Restituisce i canali da inviare oggi in base al giorno della settimana (ora italiana) */
export function getTodayChannels(): ChannelConfig[] {
  const now = new Date();
  const italianNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const dayOfWeek = italianNow.getDay();
  const channels: ChannelConfig[] = [];
  // Canali: AI News (lunedì), Startup News (mercoledì), DEALROOM News (venerdì)
  const dayChannel = CHANNEL_SCHEDULE.find((c) => c.dayOfWeek === dayOfWeek);
  if (dayChannel) channels.push(dayChannel);
  return channels;
}

/** @deprecated Usa getTodayChannels() */
export function getTodayChannel(): ChannelConfig | null {
  const channels = getTodayChannels();
  return channels[0] ?? null;
}

/** Chiave per evitare doppi invii nello stesso giorno */
const sentDays = new Map<string, boolean>(); // dayKey → true
const testSentDays = new Map<string, boolean>(); // dayKey → true

// ─── Costruzione newsletter dal DB ───────────────────────────────────────────

export async function buildChannelNewsletter(
  channel: ChannelConfig,
  isTest: boolean
): Promise<{ html: string; subject: string; newsCount: number }> {
  const now = new Date();
  const dateLabel = getDateLabel(now);

  // Recupera contenuti dal DB per il canale specifico + ricerche del giorno
  const [news, editorial, startup, reportages, analyses, todayResearches] = await Promise.all([
    getLatestNews(12, channel.key),
    getLatestEditorial(channel.key),
    getLatestStartupOfDay(channel.key),
    getLatestWeeklyReportage(channel.key),
    getLatestMarketAnalysis(channel.key),
    getTodayResearch(),
  ]);

  console.log(`[DailyNewsletter] Contenuti per canale ${channel.name}:`);
  console.log(`[DailyNewsletter]   News: ${news.length}`);
  console.log(`[DailyNewsletter]   Editoriale: ${editorial ? editorial.title?.slice(0, 50) : "nessuno"}`);
  console.log(`[DailyNewsletter]   Startup/Featured: ${startup ? startup.name : "nessuna"}`);
  console.log(`[DailyNewsletter]   Reportage: ${reportages.length}`);
  console.log(`[DailyNewsletter]   Analisi: ${analyses.length}`);
  console.log(`[DailyNewsletter]   Ricerche: ${todayResearches.length}`);

  const dayNames = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const dayName = dayNames[channel.dayOfWeek];
  const frequencyLabel = `Ogni ${dayName} · ${channel.tagline}`;
  const subject = `IDEASMART Research — ${channel.name} · ${dateLabel}`;

  const html = buildFullNewsletterHtml({
    dateLabel,
    editorial: editorial
      ? {
          id: editorial.id,
          section: editorial.section,
          title: editorial.title,
          subtitle: editorial.subtitle ?? null,
          body: editorial.body,
          keyTrend: editorial.keyTrend ?? null,
          authorNote: editorial.authorNote ?? null,
        }
      : null,
    startup: startup
      ? {
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
        }
      : null,
    news: news.map((n) => ({
      id: n.id ?? null,
      section: channel.key,
      title: n.title,
      summary: n.summary,
      category: n.category,
      sourceName: n.sourceName ?? null,
      sourceUrl: n.sourceUrl ?? null,
    })),
    reportages: reportages.map((r) => ({
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
    analyses: analyses.map((a) => ({
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
    researches: [
      ...todayResearches.filter(r => r.isResearchOfDay),
      ...todayResearches.filter(r => !r.isResearchOfDay),
    ].slice(0, 20).map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      category: r.category,
      source: r.source,
      sourceUrl: r.sourceUrl ?? null,
      isResearchOfDay: r.isResearchOfDay,
    })),
    unsubscribeUrl: `${BASE_URL}/unsubscribe`,
    channelName: channel.name,
    frequencyLabel,
    isTest,
  });

  return { html, subject, newsCount: news.length };
}

// ─── Preview di test (07:00 CET) ─────────────────────────────────────────────

/**
 * Invia una preview della newsletter del giorno a ac@acinelli.com.
 * Permette la revisione prima dell'invio massivo alle 07:30.
 */
export async function sendDailyChannelPreview(): Promise<{
  success: boolean;
  channel: string;
  subject: string;
  error?: string;
}> {
  const channel = getTodayChannel();
  if (!channel) {
    console.log("[DailyNewsletter] Nessun canale configurato per oggi");
    return { success: false, channel: "none", subject: "" };
  }

  const dayKey = getDayKey(new Date());
  const testKey = `test-${dayKey}`;

  if (testSentDays.get(testKey)) {
    console.log(`[DailyNewsletter] Preview ${channel.name} già inviata oggi (${dayKey}), skip`);
    return { success: true, channel: channel.name, subject: "" };
  }

  console.log(`[DailyNewsletter] 📧 07:00 CET — Preview ${channel.name} → ${TEST_EMAIL}`);

  try {
    const { html, subject, newsCount } = await buildChannelNewsletter(channel, true);

    const result = await sendEmail({ to: TEST_EMAIL, subject, html });

    if (result.success) {
      testSentDays.set(testKey, true);
      console.log(`[DailyNewsletter] ✅ Preview ${channel.name} inviata a ${TEST_EMAIL}`);

      await notifyOwner({
        title: `👁️ Preview newsletter ${channel.name} — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Preview della newsletter giornaliera "${channel.name}" inviata a ${TEST_EMAIL}.\n\nContenuti: ${newsCount} notizie.\n\nL'invio massivo avverrà alle 07:30 CET.\n\nSe il contenuto non è soddisfacente, è possibile bloccare l'invio dall'Admin.`,
      });

      return { success: true, channel: channel.name, subject };
    } else {
      console.error(`[DailyNewsletter] ❌ Errore preview ${channel.name}: ${result.error}`);
      return { success: false, channel: channel.name, subject, error: result.error };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[DailyNewsletter] ❌ Errore critico preview ${channel.name}:`, msg);
    return { success: false, channel: channel.name, subject: "", error: msg };
  }
}

// ─── Invio massivo (07:30 CET) ───────────────────────────────────────────────

/**
 * Invia la newsletter del canale di oggi a tutti gli iscritti attivi.
 * Usa personalizzazioni individuali per il link di disiscrizione (GDPR).
 */
export async function sendDailyChannelNewsletter(): Promise<{
  success: boolean;
  channel: string;
  recipientCount: number;
  newsCount: number;
  subject: string;
  error?: string;
}> {
  const channel = getTodayChannel();
  if (!channel) {
    console.log("[DailyNewsletter] Nessun canale configurato per oggi");
    return { success: false, channel: "none", recipientCount: 0, newsCount: 0, subject: "" };
  }

  const dayKey = getDayKey(new Date());

  if (sentDays.get(dayKey)) {
    console.log(`[DailyNewsletter] Newsletter ${channel.name} già inviata oggi (${dayKey}), skip`);
    return { success: true, channel: channel.name, recipientCount: 0, newsCount: 0, subject: "" };
  }

  console.log(`[DailyNewsletter] 📧 07:30 CET — Invio massivo ${channel.name}...`);

  try {
    // 1. Recupera iscritti attivi che hanno scelto questo canale
    // Gli iscritti con channels=null (legacy) ricevono tutti i canali
    const subscribers = await getActiveSubscribersByChannel(channel.key as any);
    if (subscribers.length === 0) {
      console.warn(`[DailyNewsletter] Nessun iscritto per il canale ${channel.key}, skip`);
      return { success: false, channel: channel.name, recipientCount: 0, newsCount: 0, subject: "", error: `Nessun iscritto per il canale ${channel.key}` };
    }

    console.log(`[DailyNewsletter] ${subscribers.length} iscritti per il canale ${channel.key}`);

    // 2. Costruisce la newsletter (senza isTest per la versione massiva)
    const { html: sampleHtml, subject, newsCount } = await buildChannelNewsletter(channel, false);

    // 3. Registra l'invio nel DB prima di partire
    await createNewsletterSend({
      subject,
      htmlContent: sampleHtml,
      recipientCount: 0, // aggiornato dopo
    });

    // 4. Invia individualmente con link unsubscribe personalizzato (GDPR)
    const BATCH_SIZE = 50;
    let totalSent = 0;
    let sendError: string | undefined;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      for (const sub of batch) {
        const unsubUrl = sub.unsubscribeToken
          ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/unsubscribe`;
        const prefsUrl = sub.unsubscribeToken
          ? `${BASE_URL}/preferenze-newsletter?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/preferenze-newsletter`;

        const { html } = await buildChannelNewsletter(channel, false);
        // Sostituisce il link di disiscrizione generico con quello personalizzato
        let personalizedHtml = html.replace(
          `${BASE_URL}/unsubscribe`,
          unsubUrl
        );
        // Aggiunge il link preferenze canale personalizzato
        personalizedHtml = personalizedHtml.replace(
          `${BASE_URL}/preferenze-newsletter`,
          prefsUrl
        );

        const result = await sendEmail({ to: sub.email, subject, html: personalizedHtml });
        if (result.success) {
          totalSent++;
        } else {
          sendError = result.error;
          console.error(`[DailyNewsletter] Errore invio a ${sub.email}:`, result.error);
        }
      }

      if (i % 200 === 0 && i > 0) {
        console.log(`[DailyNewsletter] Progresso: ${totalSent}/${subscribers.length} inviati`);
      }
    }

    // 5. Aggiorna recipientCount nel DB con il totale reale
    await updateNewsletterSendRecipientCount(subject, totalSent);

    // 6. Marca come inviata per oggi
    sentDays.set(dayKey, true);

    // 7. Notifica owner
    await notifyOwner({
      title: `📧 Newsletter ${channel.name} inviata — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Newsletter giornaliera "${channel.name}" inviata con successo a ${totalSent}/${subscribers.length} iscritti.\n\nNotizie: ${newsCount}.\n\nCanale: ${channel.siteSection}`,
    });

    console.log(`[DailyNewsletter] ✅ ${channel.name}: ${totalSent}/${subscribers.length} inviati`);

    return {
      success: !sendError,
      channel: channel.name,
      recipientCount: totalSent,
      newsCount,
      subject,
      error: sendError,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[DailyNewsletter] ❌ Errore critico ${channel.name}:`, msg);

    try {
      await notifyOwner({
        title: `❌ Errore newsletter ${channel.name} — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Errore durante l'invio automatico della newsletter "${channel.name}": ${msg}`,
      });
    } catch {}

    return { success: false, channel: channel.name, recipientCount: 0, newsCount: 0, subject: "", error: msg };
  }
}

/**
 * Invia manualmente la newsletter di un canale specifico.
 * Usato dall'Admin per test o invii straordinari.
 */
export async function sendChannelNewsletterManual(
  channelKey: ChannelKey,
  testOnly = false
): Promise<{
  success: boolean;
  channel: string;
  recipientCount: number;
  newsCount: number;
  subject: string;
  error?: string;
}> {
  const channel = CHANNEL_SCHEDULE.find((c) => c.key === channelKey);
  if (!channel) {
    return { success: false, channel: channelKey, recipientCount: 0, newsCount: 0, subject: "", error: "Canale non trovato" };
  }

  console.log(`[DailyNewsletter] 🔧 Invio manuale ${channel.name} (test: ${testOnly})`);

  if (testOnly) {
    const { html, subject, newsCount } = await buildChannelNewsletter(channel, true);
    const result = await sendEmail({ to: TEST_EMAIL, subject, html });
    return {
      success: result.success,
      channel: channel.name,
      recipientCount: result.success ? 1 : 0,
      newsCount,
      subject,
      error: result.error,
    };
  }

  // Invio massivo manuale (stessa logica dell'automatico, senza check dayKey)
  // Filtra per canale scelto dall'iscritto (null = tutti i canali, comportamento legacy)
  const subscribers = await getActiveSubscribersByChannel(channel.key as any);
  const { html: sampleHtml, subject, newsCount } = await buildChannelNewsletter(channel, false);

  await createNewsletterSend({ subject, htmlContent: sampleHtml, recipientCount: 0 });

  let totalSent = 0;
  let sendError: string | undefined;
  const BATCH_SIZE = 50;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    for (const sub of batch) {
      const unsubUrl = sub.unsubscribeToken
        ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
        : `${BASE_URL}/unsubscribe`;
      const { html } = await buildChannelNewsletter(channel, false);
      const personalizedHtml = html.replace(`${BASE_URL}/unsubscribe`, unsubUrl);
      const result = await sendEmail({ to: sub.email, subject, html: personalizedHtml });
      if (result.success) totalSent++;
      else sendError = result.error;
    }
  }

  // Aggiorna recipientCount nel DB con il totale reale
  await updateNewsletterSendRecipientCount(subject, totalSent);

  await notifyOwner({
    title: `📧 Newsletter ${channel.name} inviata manualmente — ${new Date().toLocaleDateString("it-IT")}`,
    content: `Invio manuale "${channel.name}" completato: ${totalSent}/${subscribers.length} iscritti.`,
  });

  return {
    success: !sendError,
    channel: channel.name,
    recipientCount: totalSent,
    newsCount,
    subject,
    error: sendError,
  };
}

/**
 * Invia una newsletter di test per un canale specifico a un indirizzo email personalizzato.
 * Usato per preview e test dei template brandizzati.
 */
export async function sendChannelTestToEmail(
  channelKey: ChannelKey,
  toEmail: string
): Promise<{
  success: boolean;
  channel: string;
  subject: string;
  newsCount: number;
  error?: string;
}> {
  const channel = CHANNEL_SCHEDULE.find((c) => c.key === channelKey);
  if (!channel) {
    return { success: false, channel: channelKey, subject: "", newsCount: 0, error: "Canale non trovato" };
  }

  console.log(`[DailyNewsletter] 📧 Test ${channel.name} → ${toEmail}`);

  try {
    const { html, subject, newsCount } = await buildChannelNewsletter(channel, true);
    const result = await sendEmail({ to: toEmail, subject, html });

    if (result.success) {
      console.log(`[DailyNewsletter] ✅ Test ${channel.name} inviato a ${toEmail}`);
      return { success: true, channel: channel.name, subject, newsCount };
    } else {
      console.error(`[DailyNewsletter] ❌ Errore test ${channel.name}: ${result.error}`);
      return { success: false, channel: channel.name, subject, newsCount, error: result.error };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[DailyNewsletter] ❌ Errore critico test ${channel.name}:`, msg);
    return { success: false, channel: channel.name, subject: "", newsCount: 0, error: msg };
  }
}


/**
 * Invia la newsletter promozionale IDEASMART a tutti gli iscritti attivi.
 * Usata per promuovere la piattaforma di giornalismo agentico.
 */
export async function sendPromoNewsletterToAll(): Promise<{
  success: boolean;
  recipientCount: number;
  subject: string;
  error?: string;
}> {
  const subject = "IDEASMART — Il primo giornale che funziona anche senza una redazione.";

  console.log("[PromoNewsletter] 🚀 Inizio invio massivo newsletter promozionale...");

  try {
    // Recupera tutti gli iscritti attivi
    const allSubscribers = await getActiveSubscribers();
    console.log(`[PromoNewsletter] 📊 Iscritti attivi: ${allSubscribers.length}`);

    if (allSubscribers.length === 0) {
      return { success: false, recipientCount: 0, subject, error: "Nessun iscritto attivo" };
    }

    // Genera l'HTML base
    const dateLabel = new Date().toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const baseHtml = buildPromoNewsletterHtml({ dateLabel, isTest: false });

    // Registra l'invio nel DB
    await createNewsletterSend({ subject, htmlContent: baseHtml, recipientCount: 0 });

    let totalSent = 0;
    let sendError: string | undefined;
    const BATCH_SIZE = 50;
    const BASE_URL = process.env.VITE_APP_ID
      ? "https://ideasmart.ai"
      : "https://ideasmart.manus.space";

    for (let i = 0; i < allSubscribers.length; i += BATCH_SIZE) {
      const batch = allSubscribers.slice(i, i + BATCH_SIZE);
      for (const sub of batch) {
        const unsubUrl = sub.unsubscribeToken
          ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/unsubscribe`;
        const personalizedHtml = baseHtml
          .replace(`${BASE_URL}/unsubscribe`, unsubUrl);
        const result = await sendEmail({ to: sub.email, subject, html: personalizedHtml });
        if (result.success) totalSent++;
        else sendError = result.error;
      }
      // Log progresso ogni batch
      console.log(`[PromoNewsletter] 📤 Progresso: ${Math.min(i + BATCH_SIZE, allSubscribers.length)}/${allSubscribers.length} (inviati: ${totalSent})`);
    }

    // Aggiorna recipientCount nel DB
    await updateNewsletterSendRecipientCount(subject, totalSent);

    await notifyOwner({
      title: `📧 Newsletter PROMO IDEASMART inviata — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Invio massivo newsletter promozionale completato: ${totalSent}/${allSubscribers.length} iscritti.`,
    });

    console.log(`[PromoNewsletter] ✅ Invio completato: ${totalSent}/${allSubscribers.length}`);

    return {
      success: !sendError,
      recipientCount: totalSent,
      subject,
      error: sendError,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PromoNewsletter] ❌ Errore critico:", msg);
    return { success: false, recipientCount: 0, subject, error: msg };
  }
}
