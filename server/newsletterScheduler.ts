/**
 * IDEASMART Newsletter Scheduler
 * ─────────────────────────────────────────────────────────────────────────────
 * Routine automatica settimanale:
 *   - Ogni LUNEDÌ alle 09:00 (ora italiana)
 *   - Genera 32 notizie distribuite tra i 7 canali IDEASMART tramite LLM
 *   - Costruisce la newsletter con il template dark ufficiale IDEASMART
 *   - Invia a tutti gli iscritti attivi nel database
 *   - Registra l'invio nella tabella newsletter_sends
 *
 * Canali coperti: AI4Business, Startup, Musica, Finance & Markets,
 *                 Health & Biotech, Sport & Business, Lifestyle & Luxury
 */

import { invokeLLM } from "./_core/llm";
import { sendEmail, buildMonthlyNewsletterHtml, buildFullNewsletterHtml } from "./email";
import { getActiveSubscribers, createNewsletterSend } from "./db";
import { notifyOwner } from "./_core/notification";

// ─── Configurazione ──────────────────────────────────────────────────────────

/** Controlla ogni ora se è lunedì mattina (09:00-09:59 ora italiana) */
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 ora

/** Chiave in memoria per evitare doppi invii nella stessa settimana */
let lastSentWeek: string | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getItalianTime(): Date {
  // Converte l'orario UTC in ora italiana (UTC+1 in inverno, UTC+2 in estate)
  const now = new Date();
  const italianOffset = getItalianOffset(now);
  return new Date(now.getTime() + italianOffset * 60 * 60 * 1000);
}

function getItalianOffset(date: Date): number {
  // Calcola se siamo in ora legale italiana (ultima domenica di marzo → ultima domenica di ottobre)
  const year = date.getUTCFullYear();
  const lastSundayMarch = getLastSunday(year, 2); // marzo = mese 2 (0-indexed)
  const lastSundayOctober = getLastSunday(year, 9); // ottobre = mese 9
  return date >= lastSundayMarch && date < lastSundayOctober ? 2 : 1;
}

function getLastSunday(year: number, month: number): Date {
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const dayOfWeek = lastDay.getUTCDay();
  const lastSunday = new Date(lastDay);
  lastSunday.setUTCDate(lastDay.getUTCDate() - dayOfWeek);
  lastSunday.setUTCHours(1, 0, 0, 0); // 01:00 UTC = 02:00/03:00 ora italiana
  return lastSunday;
}

function getWeekKey(date: Date): string {
  // Restituisce la chiave settimana nel formato "YYYY-WW" (anno-settimana)
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

function getIssueNumber(date: Date): string {
  return String(date.getMonth() + 1).padStart(2, "0");
}

function getDateRange(date: Date): string {
  const weekAgo = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  return `${weekAgo.toLocaleDateString("it-IT")} - ${date.toLocaleDateString("it-IT")}`;
}

// ─── Generazione notizie AI ───────────────────────────────────────────────────

interface NewsItem {
  category: string;
  title: string;
  summary: string;
  url: string;
  source: string;
}

async function generateWeeklyNews(dateRange: string): Promise<NewsItem[]> {
  console.log(`[NewsletterScheduler] Generating news for week: ${dateRange}`);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Sei il redattore capo di IDEASMART, la newsletter italiana di tecnologia e innovazione AI per il business. 
Scrivi in italiano con tono editoriale autorevole. Rispondi SOLO con JSON valido.`,
      },
      {
        role: "user",
        content: `Genera esattamente 32 notizie reali e significative della settimana (${dateRange}), distribuite tra i 7 canali editoriali di IDEASMART.

Criteri editoriali:
- Privilegia notizie con impatto concreto sul business e sull'ecosistema startup
- Includi almeno 4 notizie sull'ecosistema italiano/europeo
- Includi almeno 2 notizie su finanziamenti o acquisizioni AI
- Includi almeno 2 notizie su nuovi modelli o aggiornamenti AI
- Includi almeno 1 notizia su startup italiane
- Includi almeno 1 notizia su regolamentazione AI (EU AI Act)
- Includi almeno 3 notizie su Finance & Markets (mercati, macro, BCE, M&A)
- Includi almeno 3 notizie su Health & Biotech (farmaceutica, biotech, AI in medicina, longevità)
- Includi almeno 3 notizie su Sport & Business (business dello sport, deal, valutazioni club, sponsorship)
- Includi almeno 3 notizie su Lifestyle & Luxury (lusso, made in Italy, brand, mercato del lusso)
- Tono editoriale autorevole, non promozionale
- Distribuisci le categorie in modo equilibrato tra i 7 canali

Categorie disponibili: "Modelli Generativi", "AI Agentiva", "Big Tech", "Startup & Funding", "AI & Hardware", "Robot & AI Fisica", "AI & Startup Italiane", "Ricerca & Innovazione", "AI & Lavoro", "AI & Sicurezza", "AI & Difesa", "Internazionalizzazione", "Regolamentazione AI", "Finance & Markets", "Macro & BCE", "M&A & Deal", "Health & Biotech", "AI in Medicina", "Longevità & Wellness", "Sport Business", "Deal Sportivi", "Valutazioni Club", "Luxury & Made in Italy", "Brand Strategy", "Mercato del Lusso", "Musica & Business"

Rispondi con JSON: {"items":[{"category":"...","title":"...","summary":"...","url":"...","source":"..."}]}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "news_items",
        strict: true,
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  title: { type: "string" },
                  summary: { type: "string" },
                  url: { type: "string" },
                  source: { type: "string" },
                },
                required: ["category", "title", "summary", "url", "source"],
                additionalProperties: false,
              },
            },
          },
          required: ["items"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content as string;
  const parsed = JSON.parse(content);
  return (parsed.items || []).slice(0, 32) as NewsItem[];
}

// ─── Invio newsletter settimanale ─────────────────────────────────────────────

export async function sendWeeklyNewsletter(): Promise<{
  success: boolean;
  recipientCount: number;
  newsCount: number;
  subject: string;
  error?: string;
}> {
  const now = new Date();
  const monthLabel = getMonthLabel(now);
  const issueNumber = getIssueNumber(now);
  const dateRange = getDateRange(now);
  const weekKey = getWeekKey(now);

  console.log(`[NewsletterScheduler] Starting weekly send for ${weekKey}...`);

  try {
    // 1. Recupera iscritti attivi
    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      console.warn("[NewsletterScheduler] No active subscribers found, skipping send");
      return { success: false, recipientCount: 0, newsCount: 0, subject: "", error: "Nessun iscritto attivo" };
    }

    console.log(`[NewsletterScheduler] Found ${subscribers.length} active subscribers`);

    // 2. Genera notizie AI aggiornate
    const news = await generateWeeklyNews(dateRange);
    console.log(`[NewsletterScheduler] Generated ${news.length} news items`);

    // 3. Costruisce HTML con il template dark ufficiale
    const subject = `IDEASMART — 7 Canali · AI · Finance · Health · Sport · Luxury · N° ${issueNumber} · ${monthLabel}`;
    const BASE_URL = "https://ideasmart.ai";

    // 4. Invia individualmente con link unsubscribe personalizzato per ogni iscritto
    //    (necessario per GDPR: ogni iscritto deve avere il proprio token univoco)
    const BATCH_SIZE = 50; // SendGrid personalizations limit per request
    let totalSent = 0;
    let sendError: string | undefined;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      // Costruisce personalizations con link unsubscribe e pixel tracking univoco per ogni iscritto
      const personalizations = batch.map((sub) => {
        const unsubUrl = sub.unsubscribeToken
          ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/unsubscribe`;
        const trackingPixelUrl = sub.unsubscribeToken
          ? `${BASE_URL}/api/track/open?sid=${sub.unsubscribeToken}&cid=${monthLabel}&sub=${encodeURIComponent(subject)}`
          : undefined;
        const html = buildMonthlyNewsletterHtml({
          month: monthLabel,
          issueNumber,
          news,
          unsubscribeUrl: unsubUrl,
        });
        return { email: sub.email, html };
      });

      // Invia ogni email del batch individualmente (per link personalizzati)
      for (const p of personalizations) {
        const result = await sendEmail({ to: p.email, subject, html: p.html });
        if (result.success) {
          totalSent++;
        } else {
          sendError = result.error;
          console.error(`[NewsletterScheduler] Error sending to ${p.email}:`, result.error);
          // Non interrompere: continua con gli altri iscritti
        }
      }

      // Salva HTML di esempio (primo iscritto del primo batch) per il log
      if (i === 0) {
        const sampleHtml = buildMonthlyNewsletterHtml({ month: monthLabel, issueNumber, news });
        // Registra l'invio nel DB con l'HTML di esempio
        await createNewsletterSend({ subject, htmlContent: sampleHtml, recipientCount: 0 });
      }

      if (i % 200 === 0 && i > 0) {
        console.log(`[NewsletterScheduler] Progress: ${totalSent}/${subscribers.length} sent`);
      }
    }

    // Aggiorna il conteggio nel DB
    const htmlContent = buildMonthlyNewsletterHtml({ month: monthLabel, issueNumber, news });

    // 5. Registra l'invio nel DB
    await createNewsletterSend({
      subject,
      htmlContent,
      recipientCount: totalSent,
    });

    // 6. Aggiorna la chiave settimana in memoria
    lastSentWeek = weekKey;

    // 7. Notifica l'owner
    await notifyOwner({
      title: `📧 Newsletter IDEASMART inviata — ${monthLabel}`,
      content: `Newsletter settimanale inviata con successo a ${totalSent} iscritti. Notizie: ${news.length}. Settimana: ${dateRange}.`,
    });

    console.log(`[NewsletterScheduler] ✅ Weekly newsletter sent to ${totalSent}/${subscribers.length} subscribers`);

    return {
      success: !sendError,
      recipientCount: totalSent,
      newsCount: news.length,
      subject,
      error: sendError,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[NewsletterScheduler] ❌ Send failed:", msg);

    // Notifica l'owner dell'errore
    try {
      await notifyOwner({
        title: `❌ Errore invio newsletter IDEASMART — ${monthLabel}`,
        content: `Errore durante l'invio automatico della newsletter settimanale: ${msg}`,
      });
    } catch {}

    return { success: false, recipientCount: 0, newsCount: 0, subject: "", error: msg };
  }
}

// ─── Cron job settimanale ─────────────────────────────────────────────────────

/**
 * Controlla se è il momento di inviare la newsletter:
 * - Lunedì (dayOfWeek === 1)
 * - Tra le 09:00 e le 09:59 ora italiana
 * - Non ancora inviata questa settimana
 */
function shouldSendNow(): boolean {
  const italianNow = getItalianTime();
  const dayOfWeek = italianNow.getDay(); // 0=domenica, 1=lunedì, ...
  const hour = italianNow.getHours();
  const weekKey = getWeekKey(italianNow);

  const isMonday = dayOfWeek === 1;
  const isSendHour = hour === 9; // 09:00-09:59
  const notYetSentThisWeek = lastSentWeek !== weekKey;

  if (isMonday && isSendHour && notYetSentThisWeek) {
    console.log(`[NewsletterScheduler] ⏰ It's Monday 09:xx Italian time — triggering weekly send (week: ${weekKey})`);
    return true;
  }

  return false;
}

/**
 * Avvia il cron job settimanale.
 * Controlla ogni ora se è il momento di inviare.
 * L'invio avviene automaticamente ogni lunedì alle 09:00 ora italiana.
 */
export function startNewsletterScheduler(): void {
  console.log("[NewsletterScheduler] Started — checks every hour, sends every Monday at 09:00 Italian time");

  // Controlla subito all'avvio (per il caso in cui il server si riavvii di lunedì mattina)
  setTimeout(async () => {
    if (shouldSendNow()) {
      await sendWeeklyNewsletter();
    }
  }, 10_000); // Attendi 10 secondi dopo l'avvio

  // Poi controlla ogni ora
  setInterval(async () => {
    if (shouldSendNow()) {
      await sendWeeklyNewsletter();
    }
  }, CHECK_INTERVAL_MS);
}
