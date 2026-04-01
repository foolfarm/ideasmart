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
 * Sponsor dinamici da database con rotazione automatica:
 *   - "primary" = Sponsor del Giorno (in alto, dopo intro)
 *   - "spotlight" = Today's Spotlight (a metà, tra Startup e Dealroom)
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
import {
  breakingNews as breakingNewsTable,
  newsletterSponsors,
  amazonDailyDeals,
} from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

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

interface SponsorData {
  id: number;
  name: string;
  headline: string;
  description: string;
  url: string;
  imageUrl: string | null;
  features: string | null; // JSON array
  ctaText: string;
  placement: "primary" | "spotlight";
}

interface AmazonDealData {
  id: number;
  title: string;
  description: string;
  price: string;
  affiliateUrl: string;
  imageUrl: string | null;
  rating: string | null;
  reviewCount: string | null;
  category: string | null;
}

// ─── Sponsor Selection (weighted rotation) ─────────────────────────────────

async function getActiveSponsor(
  placement: "primary" | "spotlight"
): Promise<SponsorData | null> {
  const db = await getDb();
  if (!db) return null;

  const sponsors = await db
    .select()
    .from(newsletterSponsors)
    .where(
      and(
        eq(newsletterSponsors.placement, placement),
        eq(newsletterSponsors.active, true)
      )
    )
    .orderBy(
      // Weighted rotation: least recently sent + highest weight first
      desc(newsletterSponsors.weight),
      sql`${newsletterSponsors.lastSentAt} IS NULL DESC`,
      newsletterSponsors.sendCount
    )
    .limit(1);

  if (sponsors.length === 0) return null;

  const s = sponsors[0];
  return {
    id: s.id,
    name: s.name,
    headline: s.headline,
    description: s.description,
    url: s.url,
    imageUrl: s.imageUrl,
    features: s.features,
    ctaText: s.ctaText,
    placement: s.placement as "primary" | "spotlight",
  };
}

async function markSponsorSent(sponsorId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(newsletterSponsors)
    .set({
      sendCount: sql`${newsletterSponsors.sendCount} + 1`,
      lastSentAt: new Date(),
    })
    .where(eq(newsletterSponsors.id, sponsorId));
}

// ─── Amazon Deal Selection ────────────────────────────────────────────────

async function getTodayAmazonDeal(): Promise<AmazonDealData | null> {
  const db = await getDb();
  if (!db) return null;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Prima prova a trovare un deal programmato per oggi
  const todayDeals = await db
    .select()
    .from(amazonDailyDeals)
    .where(
      and(
        eq(amazonDailyDeals.scheduledDate, today),
        eq(amazonDailyDeals.active, true)
      )
    )
    .limit(1);

  if (todayDeals.length > 0) {
    const d = todayDeals[0];
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price,
      affiliateUrl: d.affiliateUrl,
      imageUrl: d.imageUrl,
      rating: d.rating,
      reviewCount: d.reviewCount,
      category: d.category,
    };
  }

  // Fallback: ultimo deal attivo
  const latestDeals = await db
    .select()
    .from(amazonDailyDeals)
    .where(eq(amazonDailyDeals.active, true))
    .orderBy(desc(amazonDailyDeals.scheduledDate))
    .limit(1);

  if (latestDeals.length > 0) {
    const d = latestDeals[0];
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      price: d.price,
      affiliateUrl: d.affiliateUrl,
      imageUrl: d.imageUrl,
      rating: d.rating,
      reviewCount: d.reviewCount,
      category: d.category,
    };
  }

  return null;
}

// ─── Data Collection ────────────────────────────────────────────────────────

async function collectAllContent() {
  const db = await getDb();
  if (!db) throw new Error("Database non disponibile");

  const [aiNews, startupNews, dealroomNews, breakingItems, todayResearches] =
    await Promise.all([
      getLatestNews(5, "ai"),
      getLatestNews(5, "startup"),
      getLatestNews(5, "dealroom"),
      db
        .select()
        .from(breakingNewsTable)
        .where(eq(breakingNewsTable.isActive, true))
        .orderBy(
          desc(breakingNewsTable.urgencyScore),
          desc(breakingNewsTable.createdAt)
        )
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
    ]
      .slice(0, 5)
      .map((r: any) => ({
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
  primarySponsor: SponsorData | null;
  spotlightSponsor: SponsorData | null;
  amazonDeal: AmazonDealData | null;
  unsubscribeUrl: string;
  isTest: boolean;
}): string {
  const {
    dateLabel,
    aiNews,
    startupNews,
    dealroomNews,
    breakingItems,
    researches,
    primarySponsor,
    spotlightSponsor,
    amazonDeal,
    unsubscribeUrl,
    isTest,
  } = opts;

  // ── Font & Colors ─────────────────────────────────────────────────
  const F =
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
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
  if (breakingItems.length > 0)
    bulletItems.push(...breakingItems.slice(0, 3).map((b) => b.title));
  if (aiNews.length > 0) bulletItems.push(aiNews[0].title);
  if (startupNews.length > 0) bulletItems.push(startupNews[0].title);
  if (dealroomNews.length > 0) bulletItems.push(dealroomNews[0].title);

  const bulletHtml = bulletItems
    .slice(0, 6)
    .map(
      (t) =>
        `<li style="font-size:14px;color:${DARK};font-family:${F};line-height:1.6;margin-bottom:6px;">${t}</li>`
    )
    .join("");

  // ── Section builder helper ────────────────────────────────────────
  function buildSection(
    label: string,
    title: string,
    items: NewsItem[],
    _sectionKey: string
  ): string {
    if (items.length === 0) return "";

    const itemsHtml = items
      .map((item, idx) => {
        const articleUrl =
          item.id && item.section
            ? `${BASE_URL}/${item.section}/news/${item.id}`
            : item.sourceUrl ?? null;

        const emojis = [
          "📰",
          "🔍",
          "💡",
          "🚀",
          "📊",
          "🔬",
          "🤖",
          "💰",
          "🌐",
          "📈",
        ];
        const emoji = emojis[idx % emojis.length];

        return `
        <tr>
          <td style="padding:16px 24px;${idx < items.length - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
            ${
              articleUrl
                ? `<a href="${articleUrl}" style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:8px;">${emoji} ${item.title}</a>`
                : `<div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};line-height:1.35;margin-bottom:8px;">${emoji} ${item.title}</div>`
            }
            <div style="font-size:14px;color:${SLATE};font-family:${F};line-height:1.65;">${item.summary}</div>
            ${item.sourceName ? `<div style="margin-top:8px;font-size:12px;color:${MUTED};font-family:${F};">Fonte: <strong style="color:${SLATE};">${item.sourceName}</strong></div>` : ""}
          </td>
        </tr>`;
      })
      .join("");

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

    const itemsHtml = breakingItems
      .map((item, idx) => {
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
      })
      .join("");

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

    const itemsHtml = researches
      .map((r, idx) => {
        const catLabels: Record<string, string> = {
          ai_trends: "AI TRENDS",
          venture_capital: "VENTURE CAPITAL",
          startup: "STARTUP",
          technology: "TECNOLOGIA",
          market: "MERCATI",
        };
        const catLabel = catLabels[r.category] ?? r.category.toUpperCase();
        const researchUrl = r.id
          ? `${BASE_URL}/research/${r.id}`
          : `${BASE_URL}/research`;
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
      })
      .join("");

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

  // ── Dynamic Sponsor Block ─────────────────────────────────────────
  function buildSponsorBlock(
    sponsor: SponsorData | null,
    label: string
  ): string {
    if (!sponsor) return "";

    let featuresArr: string[] = [];
    try {
      featuresArr = sponsor.features ? JSON.parse(sponsor.features) : [];
    } catch {
      featuresArr = [];
    }

    // Build features grid (2x2)
    let featuresHtml = "";
    if (featuresArr.length > 0) {
      const rows: string[] = [];
      for (let i = 0; i < featuresArr.length; i += 2) {
        const left = featuresArr[i] || "";
        const right = featuresArr[i + 1] || "";
        rows.push(`
          <tr>
            <td width="50%" style="padding:6px 8px 6px 0;vertical-align:top;">
              <div style="font-size:13px;color:${DARK};font-family:${F};line-height:1.5;">${left}</div>
            </td>
            ${right ? `<td width="50%" style="padding:6px 0 6px 8px;vertical-align:top;">
              <div style="font-size:13px;color:${DARK};font-family:${F};line-height:1.5;">${right}</div>
            </td>` : `<td width="50%"></td>`}
          </tr>`);
      }
      featuresHtml = `
        <tr>
          <td style="padding:14px 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${rows.join("")}
            </table>
          </td>
        </tr>`;
    }

    return `
      <!-- ${label} — ${sponsor.name} -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:12px;overflow:hidden;border-left:4px solid ${ACCENT};border-top:1px solid ${BORDER};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <!-- Label -->
            <tr>
              <td style="padding:20px 24px 0;">
                <div style="font-size:11px;font-weight:700;color:${ACCENT};text-transform:uppercase;letter-spacing:0.12em;font-family:${F};margin-bottom:4px;">${label}</div>
              </td>
            </tr>
            <!-- Title -->
            <tr>
              <td style="padding:8px 24px 0;">
                <div style="font-size:24px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.25;">${sponsor.headline}</div>
              </td>
            </tr>
            ${sponsor.imageUrl ? `<!-- Image -->
            <tr>
              <td style="padding:16px 24px 0;">
                <a href="${sponsor.url}" target="_blank" style="text-decoration:none;">
                  <img src="${sponsor.imageUrl}" alt="${sponsor.name}" width="592" style="width:100%;max-width:592px;height:auto;border-radius:8px;display:block;border:1px solid ${BORDER};" />
                </a>
              </td>
            </tr>` : ""}
            <!-- Description -->
            <tr>
              <td style="padding:16px 24px 0;">
                <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.7;">${sponsor.description}</div>
              </td>
            </tr>
            ${featuresHtml}
            <!-- CTA -->
            <tr>
              <td style="padding:18px 24px 22px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${BLACK};border-radius:8px;padding:14px 32px;">
                      <a href="${sponsor.url}" style="font-size:15px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${F};letter-spacing:0.02em;">${sponsor.ctaText}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }  // ── Amazon Deal Block ─────────────────────────────────────────────────
  function buildAmazonDealBlock(): string {
    if (!amazonDeal) return "";

    const AMAZON_ORANGE = "#FF9900";
    const utmUrl = `${amazonDeal.affiliateUrl}${amazonDeal.affiliateUrl.includes("?") ? "&" : "?"}utm_source=ideasmart_newsletter&utm_medium=email&utm_campaign=amazon_deal`;

    const ratingHtml = amazonDeal.rating
      ? `<span style="font-size:13px;color:${AMAZON_ORANGE};font-family:${F};font-weight:700;">${amazonDeal.rating}</span>${amazonDeal.reviewCount ? ` <span style="font-size:12px;color:${MUTED};font-family:${F};">(${amazonDeal.reviewCount} recensioni)</span>` : ""}`
      : "";

    const categoryHtml = amazonDeal.category
      ? `<span style="font-size:11px;font-weight:600;color:${MUTED};font-family:${F};text-transform:uppercase;letter-spacing:0.05em;">${amazonDeal.category}</span>`
      : "";

    return `
      <!-- Amazon Deal del Giorno -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:12px;overflow:hidden;border-left:4px solid ${AMAZON_ORANGE};border-top:1px solid ${BORDER};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <!-- Label -->
            <tr>
              <td style="padding:20px 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <div style="font-size:11px;font-weight:700;color:${AMAZON_ORANGE};text-transform:uppercase;letter-spacing:0.12em;font-family:${F};margin-bottom:4px;">&#128722; Consiglio del Giorno &mdash; in collaborazione con Amazon</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Product -->
            <tr>
              <td style="padding:12px 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    ${amazonDeal.imageUrl ? `<td width="140" style="vertical-align:top;padding-right:16px;">
                      <a href="${utmUrl}" target="_blank" style="text-decoration:none;">
                        <img src="${amazonDeal.imageUrl}" alt="${amazonDeal.title}" width="130" style="width:130px;height:auto;border-radius:8px;display:block;border:1px solid ${BORDER};" />
                      </a>
                    </td>` : ""}
                    <td style="vertical-align:top;">
                      ${categoryHtml ? `<div style="margin-bottom:6px;">${categoryHtml}</div>` : ""}
                      <a href="${utmUrl}" target="_blank" style="font-size:17px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:8px;">${amazonDeal.title}</a>
                      <div style="font-size:14px;color:${SLATE};font-family:${F};line-height:1.6;margin-bottom:10px;">${amazonDeal.description}</div>
                      <div style="margin-bottom:8px;">
                        <span style="font-size:24px;font-weight:800;color:${BLACK};font-family:${F};">${amazonDeal.price}</span>
                      </div>
                      ${ratingHtml ? `<div style="margin-bottom:12px;">${ratingHtml}</div>` : ""}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- CTA -->
            <tr>
              <td style="padding:14px 24px 20px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${AMAZON_ORANGE};border-radius:8px;padding:12px 28px;">
                      <a href="${utmUrl}" target="_blank" style="font-size:14px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${F};letter-spacing:0.02em;">Scopri su Amazon &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  // ── Assemble full HTML ────────────────────────────────────────────────
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

        ${
          isTest
            ? `<!-- TEST BANNER -->
        <tr><td style="background:${RED};padding:10px 20px;text-align:center;border-radius:8px 8px 0 0;">
          <span style="font-size:11px;font-weight:700;color:#ffffff;font-family:${F};text-transform:uppercase;letter-spacing:0.12em;">&#9888; EMAIL DI PROVA — Non distribuire</span>
        </td></tr>`
            : ""
        }

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

        <!-- INTRO — Saluto + bullet list (migliorata) -->
        <tr>
          <td style="padding:0 20px 16px;padding-top:20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:28px 24px;">
                  <div style="font-size:18px;font-weight:700;color:${BLACK};font-family:${F};line-height:1.4;margin-bottom:8px;">
                    Buongiorno!
                  </div>
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.65;margin-bottom:16px;">
                    Bentornato alla newsletter di <strong style="color:${BLACK};">IDEASMART</strong> &mdash; il tuo briefing quotidiano su AI, Startup e Venture Capital. Notizie verificate, analisi esclusive e i deal che contano, direttamente nella tua inbox.
                  </div>
                  <div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F};line-height:1.4;margin-bottom:12px;">
                    Ecco cosa trovi nell&rsquo;edizione di oggi:
                  </div>
                  <ul style="margin:0;padding-left:20px;">
                    ${bulletHtml}
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BOX PROMO — By IDEASMART (stile TAAFT Prompt Pack) -->
        <tr>
          <td style="padding:0 20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:28px 24px;">
                  <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.2em;text-transform:uppercase;font-family:${F};margin-bottom:16px;">By IDEASMART</div>
                  <div style="font-size:26px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.25;margin-bottom:20px;">La tua redazione AI, pronta in 7 giorni</div>
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.65;margin-bottom:16px;">
                    Sei un giornalista, una testata online o desideri da sempre lanciare un tuo giornale?
                  </div>
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.65;margin-bottom:16px;">
                    Ogni giorno leggi queste news scritte, verificate e pubblicate da Agent Giornalisti. La stessa tecnologia pu&ograve; lavorare per la tua testata.
                  </div>
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.65;margin-bottom:16px;font-style:italic;">
                    &ldquo;Come faccio a pubblicare contenuti AI di qualit&agrave; senza una redazione?&rdquo;
                  </div>
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.65;margin-bottom:16px;">
                    Con <strong style="color:${BLACK};">IdeaSmart</strong> configuri i tuoi Agent Giornalisti, scegli settore, fonti e tono &mdash; e la redazione AI pubblica 24/7. Fact-checking automatico con tecnologia <strong style="color:${BLACK};">Verify&trade;</strong>.
                  </div>
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.65;margin-bottom:22px;">
                    3 piani: <strong style="color:${BLACK};">Single Vertical</strong> da &euro;500/mese &middot; <strong style="color:${BLACK};">Multi-Channel</strong> da &euro;750/mese &middot; <strong style="color:${BLACK};">Full Newsroom</strong> da &euro;1.000/mese. In alternativa, revenue share al 20%. Setup in 5-7 giorni.
                  </div>
                  <div>
                    <a href="${BASE_URL}/offertacommerciale?utm_source=newsletter&utm_medium=email&utm_campaign=promo_box" style="display:inline-block;padding:12px 28px;background:${BLACK};color:${WHITE};font-size:13px;font-weight:700;text-decoration:none;border-radius:6px;font-family:${F};letter-spacing:0.05em;">Scopri l&rsquo;offerta &rarr;</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${buildSponsorBlock(primarySponsor, "Sponsor del Giorno")}

        ${buildBreakingSection()}

        ${buildSection("AI News", "Intelligenza Artificiale", aiNews, "ai")}

        ${buildSection("Startup News", "Startup & Innovazione", startupNews, "startup")}

        ${buildSponsorBlock(spotlightSponsor, "Today's Spotlight")}

        ${buildSection("Dealroom", "Deal & Funding", dealroomNews, "dealroom")}

        ${buildResearchSection()}

        ${buildAmazonDealBlock()}

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
  stats: {
    ai: number;
    startup: number;
    dealroom: number;
    breaking: number;
    research: number;
  };
  sponsorIds: number[];
}> {
  const now = new Date();
  const dateLabel = getDateLabel(now);
  const content = await collectAllContent();

  // Fetch dynamic sponsors and Amazon deal from DB
  const [primarySponsor, spotlightSponsor, amazonDeal] = await Promise.all([
    getActiveSponsor("primary"),
    getActiveSponsor("spotlight"),
    getTodayAmazonDeal(),
  ]);

  console.log(`[UnifiedNewsletter] Contenuti raccolti:`);
  console.log(`  AI News: ${content.aiNews.length}`);
  console.log(`  Startup News: ${content.startupNews.length}`);
  console.log(`  Dealroom: ${content.dealroomNews.length}`);
  console.log(`  Breaking: ${content.breakingItems.length}`);
  console.log(`  Ricerche: ${content.researches.length}`);
  console.log(
    `  Sponsor primario: ${primarySponsor?.name ?? "nessuno"}`
  );
  console.log(
    `  Sponsor spotlight: ${spotlightSponsor?.name ?? "nessuno"}`
  );
  console.log(
    `  Amazon Deal: ${amazonDeal?.title ?? "nessuno"}`
  );

  const subject = `IDEASMART — ${dateLabel}`;

  const html = buildUnifiedNewsletterHtml({
    dateLabel,
    aiNews: content.aiNews,
    startupNews: content.startupNews,
    dealroomNews: content.dealroomNews,
    breakingItems: content.breakingItems,
    researches: content.researches,
    primarySponsor,
    spotlightSponsor,
    amazonDeal,
    unsubscribeUrl: `${BASE_URL}/unsubscribe`,
    isTest,
  });

  const sponsorIds: number[] = [];
  if (primarySponsor) sponsorIds.push(primarySponsor.id);
  if (spotlightSponsor) sponsorIds.push(spotlightSponsor.id);

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
    sponsorIds,
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
  stats: {
    ai: number;
    startup: number;
    dealroom: number;
    breaking: number;
    research: number;
  };
  error?: string;
}> {
  const dayKey = getDayKey(new Date());
  const testKey = `unified-test-${dayKey}`;

  if (testSentDays.get(testKey)) {
    console.log(
      `[UnifiedNewsletter] Preview già inviata oggi (${dayKey}), skip`
    );
    return {
      success: true,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
    };
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
      console.error(
        `[UnifiedNewsletter] ❌ Errore preview: ${result.error}`
      );
      return { success: false, subject, stats, error: result.error };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[UnifiedNewsletter] ❌ Errore critico preview:`, msg);
    return {
      success: false,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
      error: msg,
    };
  }
}

/**
 * Invia la newsletter unificata a un indirizzo email specifico (test)
 */
export async function sendUnifiedTestToEmail(toEmail: string): Promise<{
  success: boolean;
  subject: string;
  stats: {
    ai: number;
    startup: number;
    dealroom: number;
    breaking: number;
    research: number;
  };
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
    return {
      success: false,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
      error: msg,
    };
  }
}

/**
 * Invia la newsletter unificata a tutti gli iscritti attivi.
 * Invio massivo con link unsubscribe personalizzato (GDPR).
 * Aggiorna i contatori sponsor dopo l'invio.
 */
export async function sendUnifiedNewsletterToAll(): Promise<{
  success: boolean;
  recipientCount: number;
  subject: string;
  stats: {
    ai: number;
    startup: number;
    dealroom: number;
    breaking: number;
    research: number;
  };
  error?: string;
}> {
  const dayKey = getDayKey(new Date());

  if (sentDays.get(dayKey)) {
    console.log(
      `[UnifiedNewsletter] Newsletter già inviata oggi (${dayKey}), skip`
    );
    return {
      success: true,
      recipientCount: 0,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
    };
  }

  console.log(`[UnifiedNewsletter] 📧 Invio massivo newsletter unificata...`);

  try {
    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      return {
        success: false,
        recipientCount: 0,
        subject: "",
        stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
        error: "Nessun iscritto attivo",
      };
    }

    console.log(`[UnifiedNewsletter] ${subscribers.length} iscritti attivi`);

    const { html: baseHtml, subject, stats, sponsorIds } =
      await buildUnifiedNewsletter(false);

    await createNewsletterSend({
      subject,
      htmlContent: baseHtml,
      recipientCount: 0,
    });

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

        const result = await sendEmail({
          to: sub.email,
          subject,
          html: personalizedHtml,
        });
        if (result.success) totalSent++;
        else {
          sendError = result.error;
          console.error(
            `[UnifiedNewsletter] Errore invio a ${sub.email}:`,
            result.error
          );
        }
      }

      if (i % 200 === 0 && i > 0) {
        console.log(
          `[UnifiedNewsletter] Progresso: ${totalSent}/${subscribers.length}`
        );
      }
    }

    await updateNewsletterSendRecipientCount(subject, totalSent);
    sentDays.set(dayKey, true);

    // Update sponsor send counters
    for (const sid of sponsorIds) {
      await markSponsorSent(sid);
    }

    await notifyOwner({
      title: `📧 Newsletter IDEASMART inviata — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Newsletter unificata inviata a ${totalSent}/${subscribers.length} iscritti.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.`,
    });

    console.log(
      `[UnifiedNewsletter] ✅ ${totalSent}/${subscribers.length} inviati`
    );

    return {
      success: !sendError,
      recipientCount: totalSent,
      subject,
      stats,
      error: sendError,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[UnifiedNewsletter] ❌ Errore critico:`, msg);

    try {
      await notifyOwner({
        title: `❌ Errore newsletter IDEASMART — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Errore durante l'invio della newsletter unificata: ${msg}`,
      });
    } catch {}

    return {
      success: false,
      recipientCount: 0,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
      error: msg,
    };
  }
}
