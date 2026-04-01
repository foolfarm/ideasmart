/**
 * unifiedNewsletter.ts — Newsletter Unica IDEASMART
 * ─────────────────────────────────────────────────────────────────────────────
 * Una sola newsletter quotidiana (Lun/Mer/Ven) con tutte le rubriche:
 *   - Breaking News
 *   - AI News (top 5)
 *   - Startup News (top 5)
 *   - Dealroom (top 5)
 *   - Editoriale IdeaSmart
 *   - Ricerca del Giorno
 *
 * Ispirata allo stile "There's an AI for That":
 *   - Cover pulita con data + titolo + "Leggi online"
 *   - Sezioni con label colorata + titolo grande + contenuti
 *   - Bordo laterale rosso per sponsor
 *   - Card bianche su sfondo grigio chiaro
 */

import { sendEmail } from "./email";
import {
  getLatestNews,
  getActiveSubscribers,
  createNewsletterSend,
  updateNewsletterSendRecipientCount,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { getTodayResearch } from "./researchGenerator";
import { getDb } from "./db";
import { breakingNews as breakingNewsTable } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ─── Config ─────────────────────────────────────────────────────────────────

const BASE_URL = "https://ideasmart.ai";
const TEST_EMAIL = "ac@acinelli.com";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NewsItem {
  id?: number | null;
  section?: string | null;
  title: string;
  summary: string;
  category: string;
  sourceName?: string | null;
  sourceUrl?: string | null;
}

interface BreakingItem {
  id: string;
  title: string;
  summary: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  section: string | null;
  breakingReason: string | null;
}

interface ResearchItem {
  id?: number | null;
  title: string;
  summary: string;
  category: string;
  source: string;
  sourceUrl?: string | null;
  isResearchOfDay?: boolean | null;
}

// ─── Data Collection ────────────────────────────────────────────────────────

async function collectAllContent() {
  const db = await getDb();
  if (!db) throw new Error("Database non disponibile");

  const [aiNews, startupNews, dealroomNews, breakingItems, todayResearches] = await Promise.all([
    getLatestNews(5, "ai"),
    getLatestNews(5, "startup"),
    getLatestNews(5, "dealroom"),
    db.select().from(breakingNewsTable)
      .where(eq(breakingNewsTable.isActive, true))
      .orderBy(desc(breakingNewsTable.urgencyScore), desc(breakingNewsTable.createdAt))
      .limit(5),
    getTodayResearch(),
  ]);

  return {
    aiNews: aiNews.map((n: any) => ({
      id: n.id ?? null,
      section: "ai",
      title: n.title,
      summary: n.summary,
      category: n.category,
      sourceName: n.sourceName ?? null,
      sourceUrl: n.sourceUrl ?? null,
    })) as NewsItem[],
    startupNews: startupNews.map((n: any) => ({
      id: n.id ?? null,
      section: "startup",
      title: n.title,
      summary: n.summary,
      category: n.category,
      sourceName: n.sourceName ?? null,
      sourceUrl: n.sourceUrl ?? null,
    })) as NewsItem[],
    dealroomNews: dealroomNews.map((n: any) => ({
      id: n.id ?? null,
      section: "dealroom",
      title: n.title,
      summary: n.summary,
      category: n.category,
      sourceName: n.sourceName ?? null,
      sourceUrl: n.sourceUrl ?? null,
    })) as NewsItem[],
    breakingItems: breakingItems.map((b: any) => ({
      id: b.id,
      title: b.title,
      summary: b.summary,
      sourceUrl: b.sourceUrl,
      sourceName: b.sourceName,
      section: b.section,
      breakingReason: b.breakingReason,
    })) as BreakingItem[],
    researches: [
      ...todayResearches.filter((r: any) => r.isResearchOfDay),
      ...todayResearches.filter((r: any) => !r.isResearchOfDay),
    ].slice(0, 5).map((r: any) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      category: r.category,
      source: r.source,
      sourceUrl: r.sourceUrl ?? null,
      isResearchOfDay: r.isResearchOfDay,
    })) as ResearchItem[],
  };
}

// ─── HTML Template Builder ──────────────────────────────────────────────────

function buildUnifiedNewsletterHtml(opts: {
  dateLabel: string;
  aiNews: NewsItem[];
  startupNews: NewsItem[];
  dealroomNews: NewsItem[];
  breakingItems: BreakingItem[];
  researches: ResearchItem[];
  unsubscribeUrl: string;
  isTest: boolean;
}): string {
  const {
    dateLabel, aiNews, startupNews, dealroomNews,
    breakingItems, researches, unsubscribeUrl, isTest,
  } = opts;

  // ── Font & Colors ─────────────────────────────────────────────────
  const F = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const BG = "#f5f5f5";
  const WHITE = "#ffffff";
  const BLACK = "#1a1a1a";
  const DARK = "#2d2d2d";
  const SLATE = "#4b5563";
  const MUTED = "#9ca3af";
  const BORDER = "#e5e7eb";
  const RED = "#dc2626";
  const ACCENT = "#e84c30"; // Arancione-rosso stile TAAFT

  // ── Bullet summary ────────────────────────────────────────────────
  const bulletItems: string[] = [];
  if (breakingItems.length > 0) bulletItems.push(...breakingItems.slice(0, 3).map(b => b.title));
  if (aiNews.length > 0) bulletItems.push(aiNews[0].title);
  if (startupNews.length > 0) bulletItems.push(startupNews[0].title);
  if (dealroomNews.length > 0) bulletItems.push(dealroomNews[0].title);

  const bulletHtml = bulletItems.slice(0, 6).map(t =>
    `<li style="font-size:14px;color:${DARK};font-family:${F};line-height:1.6;margin-bottom:6px;">${t}</li>`
  ).join("");

  // ── Section builder helper ────────────────────────────────────────
  function buildSection(
    label: string,
    title: string,
    items: NewsItem[],
    sectionKey: string,
  ): string {
    if (items.length === 0) return "";

    const itemsHtml = items.map((item, idx) => {
      const articleUrl = (item.id && item.section)
        ? `${BASE_URL}/${item.section}/news/${item.id}`
        : item.sourceUrl ?? null;

      // Emoji per varietà visiva
      const emojis = ["📰", "🔍", "💡", "🚀", "📊", "🔬", "🤖", "💰", "🌐", "📈"];
      const emoji = emojis[idx % emojis.length];

      return `
        <tr>
          <td style="padding:16px 24px;${idx < items.length - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
            ${articleUrl
              ? `<a href="${articleUrl}" style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:8px;">${emoji} ${item.title}</a>`
              : `<div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};line-height:1.35;margin-bottom:8px;">${emoji} ${item.title}</div>`
            }
            <div style="font-size:14px;color:${SLATE};font-family:${F};line-height:1.65;">${item.summary}</div>
            ${item.sourceName ? `<div style="margin-top:8px;font-size:12px;color:${MUTED};font-family:${F};">Fonte: <strong style="color:${SLATE};">${item.sourceName}</strong></div>` : ""}
          </td>
        </tr>`;
    }).join("");

    return `
      <!-- ${title} -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:20px 24px 12px;">
                <div style="font-size:12px;font-weight:800;color:${ACCENT};text-transform:uppercase;letter-spacing:0.08em;font-family:${F};margin-bottom:4px;">${label}</div>
                <div style="font-size:24px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.2;">${title}</div>
              </td>
            </tr>
            ${itemsHtml}
          </table>
        </td>
      </tr>`;
  }

  // ── Breaking News section ─────────────────────────────────────────
  function buildBreakingSection(): string {
    if (breakingItems.length === 0) return "";

    const itemsHtml = breakingItems.map((item, idx) => {
      const emojis = ["🎬", "📱", "🎨", "🔥", "⚡"];
      const emoji = emojis[idx % emojis.length];
      const url = item.sourceUrl ?? `${BASE_URL}`;

      return `
        <tr>
          <td style="padding:16px 24px;${idx < breakingItems.length - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
            <a href="${url}" style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:8px;">${emoji} ${item.title}</a>
            ${item.summary ? `<div style="font-size:14px;color:${SLATE};font-family:${F};line-height:1.65;">${item.summary}</div>` : ""}
            ${item.sourceName ? `<div style="margin-top:6px;font-size:12px;color:${MUTED};font-family:${F};">Fonte: <strong style="color:${SLATE};">${item.sourceName}</strong></div>` : ""}
          </td>
        </tr>`;
    }).join("");

    return `
      <!-- Breaking News -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:20px 24px 12px;">
                <div style="font-size:12px;font-weight:800;color:${ACCENT};text-transform:uppercase;letter-spacing:0.08em;font-family:${F};margin-bottom:4px;">Breaking News</div>
                <div style="font-size:24px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.2;">Le Ultime Notizie</div>
              </td>
            </tr>
            ${itemsHtml}
          </table>
        </td>
      </tr>`;
  }

  // ── Research section ──────────────────────────────────────────────
  function buildResearchSection(): string {
    if (researches.length === 0) return "";

    const itemsHtml = researches.map((r, idx) => {
      const catLabels: Record<string, string> = {
        ai_trends: "AI TRENDS", venture_capital: "VENTURE CAPITAL",
        startup: "STARTUP", technology: "TECNOLOGIA", market: "MERCATI",
      };
      const catLabel = catLabels[r.category] ?? r.category.toUpperCase();
      const researchUrl = r.id ? `${BASE_URL}/research/${r.id}` : `${BASE_URL}/research`;
      const isRoD = r.isResearchOfDay;

      return `
        <tr>
          <td style="padding:16px 24px;${idx < researches.length - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
            <div style="margin-bottom:6px;">
              <span style="font-size:10px;font-weight:700;color:${WHITE};background:${BLACK};border-radius:3px;padding:2px 8px;letter-spacing:0.1em;text-transform:uppercase;font-family:${F};">${catLabel}</span>
              ${isRoD ? `<span style="font-size:10px;font-weight:700;color:${WHITE};background:${RED};border-radius:3px;padding:2px 8px;letter-spacing:0.1em;text-transform:uppercase;font-family:${F};margin-left:6px;">RICERCA DEL GIORNO</span>` : ""}
              <span style="font-size:11px;color:${MUTED};font-family:${F};margin-left:8px;">${r.source}</span>
            </div>
            <a href="${researchUrl}" style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:6px;">${r.title}</a>
            <div style="font-size:14px;color:${SLATE};font-family:${F};line-height:1.65;">${r.summary.slice(0, 250)}${r.summary.length > 250 ? "&hellip;" : ""}</div>
            <div style="margin-top:8px;">
              <a href="${researchUrl}" style="font-size:12px;font-weight:700;color:${ACCENT};text-decoration:none;font-family:${F};">Leggi la ricerca completa &rarr;</a>
            </div>
          </td>
        </tr>`;
    }).join("");

    return `
      <!-- Ricerche -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
            <tr>
              <td style="padding:20px 24px 12px;">
                <div style="font-size:12px;font-weight:800;color:${ACCENT};text-transform:uppercase;letter-spacing:0.08em;font-family:${F};margin-bottom:4px;">IdeaSmart Research</div>
                <div style="font-size:24px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.2;">Ricerche del Giorno</div>
              </td>
            </tr>
            ${itemsHtml}
          </table>
        </td>
      </tr>`;
  }

  // ── Sponsor — Foolshare ────────────────────────────────────────────
  function buildSponsorSection(): string {
    return `
      <!-- Sponsor — Foolshare -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border-left:4px solid ${ACCENT};border-top:1px solid ${BORDER};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <tr>
              <td style="padding:20px 24px;">
                <div style="font-size:11px;font-weight:700;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;font-family:${F};margin-bottom:8px;">Sponsor del Giorno</div>
                <div style="font-size:22px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.3;margin-bottom:12px;">Foolshare &mdash; Condividi documenti con controllo totale</div>
                <div style="font-size:14px;color:${SLATE};font-family:${F};line-height:1.65;margin-bottom:16px;">Data room sicure, NDA con firma digitale, analytics in tempo reale e fundraising OS. La piattaforma professionale per startup, investitori e professionisti che gestiscono documenti riservati.</div>
                <ul style="margin:0 0 16px 0;padding-left:18px;">
                  <li style="font-size:13px;color:${DARK};font-family:${F};line-height:1.7;margin-bottom:4px;"><strong>Data Room</strong> con NDA e firma digitale integrati</li>
                  <li style="font-size:13px;color:${DARK};font-family:${F};line-height:1.7;margin-bottom:4px;"><strong>Analytics</strong> in tempo reale: chi visualizza, per quanto e da dove</li>
                  <li style="font-size:13px;color:${DARK};font-family:${F};line-height:1.7;margin-bottom:4px;"><strong>Fundraising OS</strong> con soft commitment tracking e project room</li>
                  <li style="font-size:13px;color:${DARK};font-family:${F};line-height:1.7;"><strong>7 giorni gratis</strong> &middot; Nessuna carta di credito richiesta</li>
                </ul>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${BLACK};border-radius:6px;padding:12px 28px;">
                      <a href="https://foolshare.xyz?utm_source=ideasmart&utm_medium=newsletter&utm_campaign=sponsor" style="font-size:14px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${F};">Provalo Gratis 7 giorni &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  // ── Assemble full HTML ────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IDEASMART — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${F};">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:24px 0 48px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;">

        ${isTest ? `<!-- TEST BANNER -->
        <tr><td style="background:${RED};padding:10px 20px;text-align:center;border-radius:8px 8px 0 0;">
          <span style="font-size:11px;font-weight:700;color:#ffffff;font-family:${F};text-transform:uppercase;letter-spacing:0.12em;">&#9888; EMAIL DI PROVA — Non distribuire</span>
        </td></tr>` : ""}

        <!-- COVER — Clean header -->
        <tr>
          <td style="background:${WHITE};padding:32px 20px 24px;text-align:center;${isTest ? "" : "border-radius:8px 8px 0 0;"}border-bottom:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <span style="font-size:13px;color:${MUTED};font-family:${F};">${dateLabel}</span>
                  <span style="font-size:13px;color:${MUTED};font-family:${F};margin:0 8px;">|</span>
                  <a href="${BASE_URL}" style="font-size:13px;font-weight:600;color:${ACCENT};font-family:${F};text-decoration:underline;">Leggi online</a>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top:20px;">
                  <div style="font-size:42px;font-weight:900;color:${BLACK};letter-spacing:-1.5px;line-height:1;font-family:${F};">IDEASMART</div>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top:8px;">
                  <div style="font-size:11px;color:${SLATE};letter-spacing:0.2em;text-transform:uppercase;font-family:${F};">AI &middot; Startup &middot; Venture Capital &middot; Research</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- INTRO — Saluto + bullet list -->
        <tr>
          <td style="padding:0 20px 16px;padding-top:20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:24px;">
                  <div style="font-size:16px;color:${DARK};font-family:${F};line-height:1.6;margin-bottom:12px;">
                    Buongiorno!
                  </div>
                  <div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};line-height:1.4;margin-bottom:12px;">
                    Ecco cosa trovi nell'edizione di oggi:
                  </div>
                  <ul style="margin:0;padding-left:20px;">
                    ${bulletHtml}
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${buildSponsorSection()}

        ${buildBreakingSection()}

        ${buildSection("AI News", "Intelligenza Artificiale", aiNews, "ai")}

        ${buildSection("Startup News", "Startup & Innovazione", startupNews, "startup")}

        ${buildSection("Dealroom", "Deal & Funding", dealroomNews, "dealroom")}

        ${buildResearchSection()}

        <!-- CTA SUBSCRIBE -->
        <tr>
          <td style="padding:0 20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BLACK};border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:28px 24px;">
                  <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.2em;text-transform:uppercase;font-family:${F};margin-bottom:8px;">ISCRIVITI GRATIS</div>
                  <div style="font-size:22px;font-weight:800;color:${WHITE};font-family:${F};line-height:1.25;margin-bottom:10px;">Non perderti le prossime edizioni</div>
                  <div style="font-size:14px;color:${MUTED};font-family:${F};line-height:1.65;margin-bottom:20px;">Ricevi ogni <strong style="color:${WHITE};">lunedì, mercoledì e venerdì</strong> le notizie più importanti su AI, Startup, Venture Capital e Deal. Oltre <strong style="color:${WHITE};">400 fonti</strong> monitorate con tecnologia <strong style="color:${WHITE};">Verify</strong>.</div>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:${WHITE};border-radius:6px;padding:14px 32px;">
                        <a href="${BASE_URL}/#newsletter" style="font-size:14px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${F};">Iscriviti ora &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:24px;text-align:center;">
                  <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${F};margin-bottom:8px;">IDEASMART &mdash; Intelligence Quotidiana &bull; &copy; 2026</div>
                  <div style="font-size:11px;color:${MUTED};font-family:${F};line-height:1.7;margin-bottom:16px;">
                    Hai ricevuto questa email perché sei iscritto alla newsletter IDEASMART.<br>
                    Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
                  </div>
                  <div style="border-top:1px solid ${BORDER};padding-top:16px;">
                    <a href="${BASE_URL}/preferenze-newsletter" style="font-size:12px;color:${BLACK};text-decoration:underline;font-weight:600;font-family:${F};">Gestisci preferenze</a>
                    <span style="color:${MUTED};margin:0 8px;">&middot;</span>
                    <a href="${unsubscribeUrl}" style="font-size:12px;color:${RED};text-decoration:underline;font-weight:600;font-family:${F};">Annulla iscrizione</a>
                    <span style="color:${MUTED};margin:0 8px;">&middot;</span>
                    <a href="${BASE_URL}/privacy" style="font-size:12px;color:${MUTED};text-decoration:underline;font-family:${F};">Privacy</a>
                    <span style="color:${MUTED};margin:0 8px;">&middot;</span>
                    <a href="${BASE_URL}" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F};">ideasmart.ai</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:24px;"></td></tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

// ─── Newsletter Build ───────────────────────────────────────────────────────

function getDateLabel(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function buildUnifiedNewsletter(isTest: boolean): Promise<{
  html: string;
  subject: string;
  stats: { ai: number; startup: number; dealroom: number; breaking: number; research: number };
}> {
  const now = new Date();
  const dateLabel = getDateLabel(now);
  const content = await collectAllContent();

  console.log(`[UnifiedNewsletter] Contenuti raccolti:`);
  console.log(`  AI News: ${content.aiNews.length}`);
  console.log(`  Startup News: ${content.startupNews.length}`);
  console.log(`  Dealroom: ${content.dealroomNews.length}`);
  console.log(`  Breaking: ${content.breakingItems.length}`);
  console.log(`  Ricerche: ${content.researches.length}`);

  const subject = `IDEASMART — ${dateLabel}`;

  const html = buildUnifiedNewsletterHtml({
    dateLabel,
    aiNews: content.aiNews,
    startupNews: content.startupNews,
    dealroomNews: content.dealroomNews,
    breakingItems: content.breakingItems,
    researches: content.researches,
    unsubscribeUrl: `${BASE_URL}/unsubscribe`,
    isTest,
  });

  return {
    html,
    subject,
    stats: {
      ai: content.aiNews.length,
      startup: content.startupNews.length,
      dealroom: content.dealroomNews.length,
      breaking: content.breakingItems.length,
      research: content.researches.length,
    },
  };
}

// ─── Send Functions ─────────────────────────────────────────────────────────

const sentDays = new Map<string, boolean>();
const testSentDays = new Map<string, boolean>();

/**
 * Invia una preview della newsletter unificata a ac@acinelli.com
 */
export async function sendUnifiedPreview(): Promise<{
  success: boolean;
  subject: string;
  stats: { ai: number; startup: number; dealroom: number; breaking: number; research: number };
  error?: string;
}> {
  const dayKey = getDayKey(new Date());
  const testKey = `unified-test-${dayKey}`;

  if (testSentDays.get(testKey)) {
    console.log(`[UnifiedNewsletter] Preview già inviata oggi (${dayKey}), skip`);
    return { success: true, subject: "", stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 } };
  }

  console.log(`[UnifiedNewsletter] 📧 Preview → ${TEST_EMAIL}`);

  try {
    const { html, subject, stats } = await buildUnifiedNewsletter(true);
    const result = await sendEmail({ to: TEST_EMAIL, subject, html });

    if (result.success) {
      testSentDays.set(testKey, true);
      console.log(`[UnifiedNewsletter] ✅ Preview inviata a ${TEST_EMAIL}`);

      await notifyOwner({
        title: `👁️ Preview newsletter IDEASMART — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Preview newsletter unificata inviata a ${TEST_EMAIL}.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.`,
      });

      return { success: true, subject, stats };
    } else {
      console.error(`[UnifiedNewsletter] ❌ Errore preview: ${result.error}`);
      return { success: false, subject, stats, error: result.error };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[UnifiedNewsletter] ❌ Errore critico preview:`, msg);
    return { success: false, subject: "", stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 }, error: msg };
  }
}

/**
 * Invia la newsletter unificata a un indirizzo email specifico (test)
 */
export async function sendUnifiedTestToEmail(toEmail: string): Promise<{
  success: boolean;
  subject: string;
  stats: { ai: number; startup: number; dealroom: number; breaking: number; research: number };
  error?: string;
}> {
  console.log(`[UnifiedNewsletter] 📧 Test → ${toEmail}`);

  try {
    const { html, subject, stats } = await buildUnifiedNewsletter(true);
    const result = await sendEmail({ to: toEmail, subject, html });

    if (result.success) {
      console.log(`[UnifiedNewsletter] ✅ Test inviato a ${toEmail}`);
      return { success: true, subject, stats };
    } else {
      return { success: false, subject, stats, error: result.error };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, subject: "", stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 }, error: msg };
  }
}

/**
 * Invia la newsletter unificata a tutti gli iscritti attivi.
 * Invio massivo con link unsubscribe personalizzato (GDPR).
 */
export async function sendUnifiedNewsletterToAll(): Promise<{
  success: boolean;
  recipientCount: number;
  subject: string;
  stats: { ai: number; startup: number; dealroom: number; breaking: number; research: number };
  error?: string;
}> {
  const dayKey = getDayKey(new Date());

  if (sentDays.get(dayKey)) {
    console.log(`[UnifiedNewsletter] Newsletter già inviata oggi (${dayKey}), skip`);
    return { success: true, recipientCount: 0, subject: "", stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 } };
  }

  console.log(`[UnifiedNewsletter] 📧 Invio massivo newsletter unificata...`);

  try {
    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      return { success: false, recipientCount: 0, subject: "", stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 }, error: "Nessun iscritto attivo" };
    }

    console.log(`[UnifiedNewsletter] ${subscribers.length} iscritti attivi`);

    const { html: baseHtml, subject, stats } = await buildUnifiedNewsletter(false);

    await createNewsletterSend({ subject, htmlContent: baseHtml, recipientCount: 0 });

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

        let personalizedHtml = baseHtml
          .replace(`${BASE_URL}/unsubscribe`, unsubUrl)
          .replace(`${BASE_URL}/preferenze-newsletter`, prefsUrl);

        const result = await sendEmail({ to: sub.email, subject, html: personalizedHtml });
        if (result.success) totalSent++;
        else {
          sendError = result.error;
          console.error(`[UnifiedNewsletter] Errore invio a ${sub.email}:`, result.error);
        }
      }

      if (i % 200 === 0 && i > 0) {
        console.log(`[UnifiedNewsletter] Progresso: ${totalSent}/${subscribers.length}`);
      }
    }

    await updateNewsletterSendRecipientCount(subject, totalSent);
    sentDays.set(dayKey, true);

    await notifyOwner({
      title: `📧 Newsletter IDEASMART inviata — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Newsletter unificata inviata a ${totalSent}/${subscribers.length} iscritti.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.`,
    });

    console.log(`[UnifiedNewsletter] ✅ ${totalSent}/${subscribers.length} inviati`);

    return { success: !sendError, recipientCount: totalSent, subject, stats, error: sendError };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[UnifiedNewsletter] ❌ Errore critico:`, msg);

    try {
      await notifyOwner({
        title: `❌ Errore newsletter IDEASMART — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Errore durante l'invio della newsletter unificata: ${msg}`,
      });
    } catch {}

    return { success: false, recipientCount: 0, subject: "", stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 }, error: msg };
  }
}
