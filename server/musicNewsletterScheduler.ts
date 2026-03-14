/**
 * ITsMusic Newsletter Scheduler
 * ─────────────────────────────────────────────────────────────────────────────
 * Newsletter settimanale dedicata a Rock, Indie e AI Music.
 * Inviata ogni lunedì e venerdì alle 10:00 CET agli iscritti ITsMusic.
 */

import { invokeLLM } from "./_core/llm";
import { sendEmail } from "./email";
import { getActiveSubscribersByNewsletter, createNewsletterSend } from "./db";
import { notifyOwner } from "./_core/notification";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Generazione notizie musicali ─────────────────────────────────────────────

interface MusicNewsItem {
  category: string;
  title: string;
  summary: string;
  url: string;
  source: string;
}

async function generateWeeklyMusicNews(dateRange: string): Promise<MusicNewsItem[]> {
  console.log(`[MusicNewsletterScheduler] Generating music news for week: ${dateRange}`);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Sei il redattore capo di ITsMusic, la newsletter italiana dedicata a Rock, Indie e AI Music.
Scrivi in italiano con tono editoriale appassionato e autorevole. Rispondi SOLO con JSON valido.`,
      },
      {
        role: "user",
        content: `Genera esattamente 20 notizie musicali reali e significative della settimana (${dateRange}).

Criteri editoriali:
- Focus su Rock, Indie Rock, Alternative, Post-Rock, Indie Pop e AI Music
- Includi almeno 4 notizie su artisti italiani o europei
- Includi almeno 3 notizie su nuove uscite discografiche (album, EP, singoli)
- Includi almeno 2 notizie su tour e concerti
- Includi almeno 2 notizie su AI applicata alla musica (generazione, produzione, distribuzione)
- Includi almeno 1 notizia su label indipendenti
- Includi almeno 1 notizia su streaming e industria musicale
- Includi almeno 1 notizia su festival o eventi
- Tono editoriale, appassionato, non promozionale

Categorie disponibili: "Nuove Uscite", "Tour & Concerti", "Rock & Alternative", "Indie Rock", "Indie Pop", "Post-Rock", "AI & Musica", "Industria Musicale", "Label Indipendenti", "Streaming & Digital", "Festival & Live", "Artisti Italiani", "Artisti Emergenti", "Interviste & Storie", "Tecnologia Musicale"

Rispondi con JSON: {"items":[{"category":"...","title":"...","summary":"...","url":"...","source":"..."}]}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "music_news_items",
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
  return (parsed.items || []).slice(0, 20) as MusicNewsItem[];
}

// ─── Build HTML Newsletter ITsMusic ──────────────────────────────────────────

function buildItsMusicNewsletterHtml(params: {
  month: string;
  issueNumber: string;
  news: MusicNewsItem[];
  unsubscribeUrl?: string;
}): string {
  const { month, issueNumber, news, unsubscribeUrl = "https://ideasmart.ai/unsubscribe" } = params;

  const categoryColors: Record<string, string> = {
    "Nuove Uscite": "#8b5cf6",
    "Tour & Concerti": "#ec4899",
    "Rock & Alternative": "#ef4444",
    "Indie Rock": "#f97316",
    "Indie Pop": "#a855f7",
    "Post-Rock": "#6366f1",
    "AI & Musica": "#06b6d4",
    "Industria Musicale": "#84cc16",
    "Label Indipendenti": "#f59e0b",
    "Streaming & Digital": "#10b981",
    "Festival & Live": "#e879f9",
    "Artisti Italiani": "#fb7185",
    "Artisti Emergenti": "#34d399",
    "Interviste & Storie": "#60a5fa",
    "Tecnologia Musicale": "#a78bfa",
  };

  const newsHtml = news.map((item, i) => {
    const color = categoryColors[item.category] || "#8b5cf6";
    return `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a0a2e;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-bottom:10px;">
                      <span style="display:inline-block;background:${color}20;color:${color};border:1px solid ${color}40;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">
                        ${item.category}
                      </span>
                      <span style="color:#6b7280;font-size:11px;font-family:Arial,sans-serif;margin-left:8px;">${String(i + 1).padStart(2, "0")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;">
                      <a href="${item.url}" style="color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;line-height:1.4;font-family:Arial,sans-serif;">
                        ${item.title}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:12px;">
                      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0;font-family:Arial,sans-serif;">
                        ${item.summary}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="color:#6b7280;font-size:11px;font-family:Arial,sans-serif;">Fonte: ${item.source}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ITsMusic — ${month}</title>
</head>
<body style="margin:0;padding:0;background:#0d0118;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d0118;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="padding-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:linear-gradient(135deg,#1a0a2e 0%,#0d0118 100%);border-radius:16px;border:1px solid rgba(139,92,246,0.3);overflow:hidden;">
                <tr>
                  <td style="padding:36px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="display:inline-block;background:rgba(139,92,246,0.15);color:#8b5cf6;border:1px solid rgba(139,92,246,0.3);border-radius:20px;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-family:Arial,sans-serif;">
                            🎸 ITsMusic by IDEASMART
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:16px;">
                          <h1 style="color:#ffffff;font-size:32px;font-weight:900;margin:0;line-height:1.2;font-family:Arial,sans-serif;">
                            Rock · Indie · <span style="color:#8b5cf6;">AI Music</span>
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px;">
                          <p style="color:#9ca3af;font-size:14px;margin:0;font-family:Arial,sans-serif;">
                            N° ${issueNumber} · ${month} · Le 20 notizie musicali della settimana
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- NEWS -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${newsHtml}
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#1a0a2e;border-radius:12px;border:1px solid rgba(139,92,246,0.2);">
                <tr>
                  <td style="padding:28px 32px;text-align:center;">
                    <p style="color:#8b5cf6;font-size:18px;font-weight:700;margin:0 0 8px 0;font-family:Arial,sans-serif;">
                      🎸 ITsMusic
                    </p>
                    <p style="color:#6b7280;font-size:12px;margin:0 0 16px 0;font-family:Arial,sans-serif;">
                      La newsletter italiana di Rock, Indie e AI Music by IDEASMART
                    </p>
                    <p style="margin:0;">
                      <a href="${unsubscribeUrl}" style="color:#6b7280;font-size:11px;text-decoration:underline;font-family:Arial,sans-serif;">
                        Disiscriviti da ITsMusic
                      </a>
                      &nbsp;·&nbsp;
                      <a href="https://ideasmart.ai/music" style="color:#8b5cf6;font-size:11px;text-decoration:underline;font-family:Arial,sans-serif;">
                        Visita ITsMusic
                      </a>
                      &nbsp;·&nbsp;
                      <a href="https://ideasmart.ai/ai" style="color:#00b4a0;font-size:11px;text-decoration:underline;font-family:Arial,sans-serif;">
                        AI4Business News
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Invio newsletter ITsMusic ────────────────────────────────────────────────

export async function sendItsMusicNewsletter(): Promise<{
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

  console.log(`[MusicNewsletterScheduler] Starting ITsMusic newsletter send...`);

  try {
    // 1. Recupera iscritti attivi ITsMusic
    const subscribers = await getActiveSubscribersByNewsletter("itsmusic");
    if (subscribers.length === 0) {
      console.warn("[MusicNewsletterScheduler] No active ITsMusic subscribers found, skipping send");
      return { success: false, recipientCount: 0, newsCount: 0, subject: "", error: "Nessun iscritto ITsMusic attivo" };
    }

    console.log(`[MusicNewsletterScheduler] Found ${subscribers.length} ITsMusic subscribers`);

    // 2. Genera notizie musicali
    const news = await generateWeeklyMusicNews(dateRange);
    console.log(`[MusicNewsletterScheduler] Generated ${news.length} music news items`);

    // 3. Subject
    const subject = `ITsMusic by IDEASMART — Rock · Indie · AI Music · N° ${issueNumber} · ${monthLabel}`;
    const BASE_URL = "https://ideasmart.ai";

    // 4. Invia individualmente
    const BATCH_SIZE = 50;
    let totalSent = 0;
    let sendError: string | undefined;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      for (const sub of batch) {
        const unsubUrl = sub.unsubscribeToken
          ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/unsubscribe`;

        const html = buildItsMusicNewsletterHtml({
          month: monthLabel,
          issueNumber,
          news,
          unsubscribeUrl: unsubUrl,
        });

        const result = await sendEmail({ to: sub.email, subject, html });
        if (result.success) {
          totalSent++;
        } else {
          sendError = result.error;
          console.error(`[MusicNewsletterScheduler] Error sending to ${sub.email}:`, result.error);
        }
      }

      if (i === 0) {
        const sampleHtml = buildItsMusicNewsletterHtml({ month: monthLabel, issueNumber, news });
        await createNewsletterSend({ subject, htmlContent: sampleHtml, recipientCount: 0 });
      }

      if (i % 200 === 0 && i > 0) {
        console.log(`[MusicNewsletterScheduler] Progress: ${totalSent}/${subscribers.length} sent`);
      }
    }

    // 5. Registra nel DB
    const htmlContent = buildItsMusicNewsletterHtml({ month: monthLabel, issueNumber, news });
    await createNewsletterSend({ subject, htmlContent, recipientCount: totalSent });

    // 6. Notifica owner
    await notifyOwner({
      title: `🎸 Newsletter ITsMusic inviata — ${monthLabel}`,
      content: `Newsletter ITsMusic inviata con successo a ${totalSent} iscritti. Notizie: ${news.length}. Periodo: ${dateRange}.`,
    });

    console.log(`[MusicNewsletterScheduler] ✅ ITsMusic newsletter sent to ${totalSent}/${subscribers.length} subscribers`);

    return {
      success: !sendError,
      recipientCount: totalSent,
      newsCount: news.length,
      subject,
      error: sendError,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[MusicNewsletterScheduler] ❌ Send failed:", msg);

    try {
      await notifyOwner({
        title: `❌ Errore invio newsletter ITsMusic — ${monthLabel}`,
        content: `Errore durante l'invio automatico della newsletter ITsMusic: ${msg}`,
      });
    } catch {}

    return { success: false, recipientCount: 0, newsCount: 0, subject: "", error: msg };
  }
}
