/**
 * unifiedNewsletter.ts — Newsletter "Proof Press Daily" v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout editoriale ispirato ad AI4Business, con il DNA Proof Press.
 * Struttura a 9 blocchi:
 *   A. Header (logo, payoff, data, contatore lettori)
 *   B. Hero — Notizia del Giorno (da Breaking News)
 *   C. Consigliato #1 (Amazon affiliate, posizione premium)
 *   D. Sezioni tematiche — 5-6 canali a rotazione
 *   E. Startup del Giorno (spotlight con AI Score)
 *   F. Prompt Collection — blocco fisso €39
 *   G. Sezione Eventi (3-4 prossimi eventi)
 *   H. Quick Links — "Anche oggi su Proof Press"
 *   I. Consigliato #2 + Footer + ProofPress badge
 *
 * REGOLA FONDAMENTALE: TUTTI i link puntano a ideasmart.biz, MAI alle fonti esterne.
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
  toolSubmissions,
  openSourceTools,
  channelContent,
  startupOfDay,
  techEvents,
} from "../drizzle/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";

// ─── Config ─────────────────────────────────────────────────────────────────

const BASE_URL = "https://ideasmart.biz";
const FORUM_URL = "https://ideasmart.forum";
const TEST_EMAILS = ["ac@acinelli.com"];

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
  features: string | null;
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

interface ChannelItem {
  id: number;
  channel: string;
  title: string;
  subtitle: string | null;
  body: string;
  category: string | null;
  actionItem: string | null;
  promptText: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
}

interface StartupOfDayItem {
  id: number;
  name: string;
  tagline: string;
  description: string;
  category: string;
  country: string | null;
  funding: string | null;
  aiScore: number | null;
  websiteUrl: string | null;
  imageUrl: string | null;
}

interface EventItem {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  eventUrl: string | null;
  startAt: Date;
  category: string;
  isOnline: boolean;
  isFree: boolean;
  organizer: string | null;
}

// ─── Channel Definitions ────────────────────────────────────────────────────

const NEWSLETTER_CHANNELS = [
  { key: "copy-paste-ai", label: "PROMPT AI", title: "Prompt del Giorno", emoji: "📋" },
  { key: "make-money-with-ai", label: "FARE SOLDI", title: "Opportunità di Guadagno", emoji: "💰" },
  { key: "automate-with-ai", label: "USE CASE AI", title: "Workflow & Automazioni", emoji: "⚡" },
  { key: "daily-ai-tools", label: "AI TOOLS", title: "Strumenti AI del Giorno", emoji: "🛠️" },
  { key: "verified-ai-news", label: "AI RADAR", title: "News Verificate", emoji: "📡" },
  { key: "ai-opportunities", label: "AI INVEST", title: "Opportunità di Investimento", emoji: "📈" },
] as const;

/** 10 canali tematici per la newsletter v2 */
const ALL_CHANNELS_V2 = [
  { key: "ai",                slug: "/ai",                label: "Breaking News",        emoji: "⚡", color: "#dc2626" },
  { key: "startup",           slug: "/startup",           label: "Startup & Venture",    emoji: "🚀", color: "#7c3aed" },
  { key: "research",          slug: "/research",          label: "Research",             emoji: "🔬", color: "#0066cc" },
  { key: "dealroom",          slug: "/dealroom",          label: "Dealroom",             emoji: "💼", color: "#059669" },
  { key: "verified-ai-news",  slug: "/verified-ai-news",  label: "Radar (Verified)",     emoji: "📡", color: "#dc2626" },
  { key: "make-money-with-ai",slug: "/make-money-with-ai",label: "Make Money with AI",   emoji: "💰", color: "#d97706" },
  { key: "copy-paste-ai",     slug: "/copy-paste-ai",     label: "Prompt Library",       emoji: "📋", color: "#7c3aed" },
  { key: "daily-ai-tools",    slug: "/daily-ai-tools",    label: "Nuovi Tools",          emoji: "🛠️", color: "#2563eb" },
  { key: "automate-with-ai",  slug: "/automate-with-ai",  label: "Casi d'uso",           emoji: "⚙️", color: "#d97706" },
  { key: "ai-opportunities",  slug: "/ai-opportunities",  label: "Opportunità",          emoji: "📈", color: "#0d6e3f" },
];

// ─── Data Fetchers ──────────────────────────────────────────────────────────

async function getLatestChannelContent(channelKey: string, limit: number = 3): Promise<ChannelItem[]> {
  const db = await getDb();
  if (!db) return [];

  const items = await db
    .select()
    .from(channelContent)
    .where(
      and(
        eq(channelContent.channel, channelKey as any),
        eq(channelContent.status, "published")
      )
    )
    .orderBy(desc(channelContent.publishDate), channelContent.position)
    .limit(limit);

  return items.map((i) => ({
    id: i.id,
    channel: i.channel,
    title: i.title,
    subtitle: i.subtitle,
    body: i.body,
    category: i.category,
    actionItem: i.actionItem,
    promptText: i.promptText,
    sourceName: i.sourceName,
    sourceUrl: i.sourceUrl,
  }));
}

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

async function getTodayAmazonDeals(): Promise<AmazonDealData[]> {
  const db = await getDb();
  if (!db) return [];

  const today = new Date().toISOString().split("T")[0];
  let deals = await db
    .select()
    .from(amazonDailyDeals)
    .where(
      and(
        eq(amazonDailyDeals.scheduledDate, today),
        eq(amazonDailyDeals.active, true)
      )
    )
    .orderBy(desc(amazonDailyDeals.createdAt))
    .limit(2);

  if (deals.length === 0) {
    deals = await db
      .select()
      .from(amazonDailyDeals)
      .where(eq(amazonDailyDeals.active, true))
      .orderBy(desc(amazonDailyDeals.scheduledDate))
      .limit(2);
  }

  return deals.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    price: d.price,
    affiliateUrl: d.affiliateUrl,
    imageUrl: d.imageUrl,
    rating: d.rating,
    reviewCount: d.reviewCount,
    category: d.category,
  }));
}

async function getTodayStartup(): Promise<StartupOfDayItem | null> {
  const db = await getDb();
  if (!db) return null;

  const today = new Date().toISOString().split("T")[0];
  let items = await db
    .select()
    .from(startupOfDay)
    .where(eq(startupOfDay.dateLabel, today))
    .limit(1);

  if (items.length === 0) {
    items = await db
      .select()
      .from(startupOfDay)
      .orderBy(desc(startupOfDay.createdAt))
      .limit(1);
  }

  if (items.length === 0) return null;
  const s = items[0];
  return {
    id: s.id,
    name: s.name,
    tagline: s.tagline,
    description: s.description,
    category: s.category,
    country: s.country,
    funding: s.funding,
    aiScore: s.aiScore,
    websiteUrl: s.websiteUrl,
    imageUrl: s.imageUrl,
  };
}

async function getUpcomingEvents(limit: number = 4): Promise<EventItem[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const items = await db
    .select()
    .from(techEvents)
    .where(gte(techEvents.startAt, now))
    .orderBy(techEvents.startAt)
    .limit(limit);

  return items.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    eventUrl: e.eventUrl,
    startAt: e.startAt,
    category: e.category,
    isOnline: e.isOnline,
    isFree: e.isFree,
    organizer: e.organizer,
  }));
}

// ─── Deduplication helpers ──────────────────────────────────────────────────

function titleFingerprint(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 8)
    .join(" ");
}

function sourceHashtag(sourceName: string | null | undefined): string {
  if (!sourceName) return "";
  return sourceName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

function deduplicateNews<T extends { title: string; sourceName?: string | null }>(items: T[], maxPerSource = 1): T[] {
  const seenTitles = new Set<string>();
  const sourceCount = new Map<string, number>();
  const result: T[] = [];

  for (const item of items) {
    const fp = titleFingerprint(item.title);
    const src = sourceHashtag(item.sourceName);

    if (seenTitles.has(fp)) continue;
    if (src && (sourceCount.get(src) ?? 0) >= maxPerSource) continue;

    seenTitles.add(fp);
    if (src) sourceCount.set(src, (sourceCount.get(src) ?? 0) + 1);
    result.push(item);
  }

  return result;
}

// ─── Data Collection ────────────────────────────────────────────────────────

async function collectAllContent() {
  const db = await getDb();
  if (!db) throw new Error("Database non disponibile");

  const [aiNewsRaw, startupNewsRaw, dealroomNewsRaw, breakingItemsRaw, todayResearches] =
    await Promise.all([
      getLatestNews(12, "ai"),
      getLatestNews(12, "startup"),
      getLatestNews(12, "dealroom"),
      db
        .select()
        .from(breakingNewsTable)
        .where(eq(breakingNewsTable.isActive, true))
        .orderBy(
          desc(breakingNewsTable.urgencyScore),
          desc(breakingNewsTable.createdAt)
        )
        .limit(15),
      getTodayResearch(),
    ]);

  const aiNews = deduplicateNews(aiNewsRaw, 1).slice(0, 10);
  const startupNews = deduplicateNews(startupNewsRaw, 1).slice(0, 10);
  const dealroomNews = deduplicateNews(dealroomNewsRaw, 1).slice(0, 10);
  const breakingItems = deduplicateNews(breakingItemsRaw, 1).slice(0, 5);

  const channelContents: Record<string, ChannelItem[]> = {};
  await Promise.all(
    NEWSLETTER_CHANNELS.map(async (ch) => {
      channelContents[ch.key] = await getLatestChannelContent(ch.key, 10);
    })
  );

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
      .slice(0, 10)
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        category: r.category,
        source: r.source,
        sourceUrl: r.sourceUrl ?? null,
        isResearchOfDay: r.isResearchOfDay,
      })) as ResearchItem[],
    channelContents,
  };
}

// ─── Date Helpers ───────────────────────────────────────────────────────────

function getDateLabel(date: Date): string {
  const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatEventDate(date: Date): { day: string; month: string } {
  const months = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
  return { day: String(date.getDate()), month: months[date.getMonth()] };
}

// ═══════════════════════════════════════════════════════════════════════════
// HTML TEMPLATE BUILDER — Newsletter "Proof Press Daily" v2
// ═══════════════════════════════════════════════════════════════════════════

function buildNewsletterHtmlV2(opts: {
  dateLabel: string;
  issueNumber: number;
  subscriberCount: number;
  aiNews: NewsItem[];
  startupNews: NewsItem[];
  dealroomNews: NewsItem[];
  breakingItems: BreakingItem[];
  researches: ResearchItem[];
  amazonDeals: AmazonDealData[];
  channelContents: Record<string, ChannelItem[]>;
  startupOfDay: StartupOfDayItem | null;
  events: EventItem[];
  unsubscribeUrl: string;
  isTest: boolean;
}): string {
  const {
    dateLabel,
    issueNumber,
    subscriberCount,
    aiNews,
    startupNews,
    dealroomNews,
    breakingItems,
    researches,
    amazonDeals,
    channelContents,
    unsubscribeUrl,
    isTest,
  } = opts;

  // ── Design Tokens ──
  const F_SERIF = "Georgia, 'DM Serif Display', 'Times New Roman', serif";
  const F_SANS = "Helvetica, Arial, 'Segoe UI', sans-serif";
  const BG = "#f2f0eb";
  const WHITE = "#ffffff";
  const BLACK = "#1a1a1a";
  const DARK = "#2d2d2d";
  const SLATE = "#4b5563";
  const MUTED = "#9ca3af";
  const BORDER = "#e5e7eb";
  const ACCENT = "#0a7c6a";
  const RED = "#dc2626";
  const AMAZON_ORANGE = "#FF9900";
  const PROMO_BG = "#111827";

  // ── Select 5-6 strongest channels for today ──
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  // Rotate which channels are "main" vs "quick links"
  const channelPool = ALL_CHANNELS_V2.slice(1); // exclude breaking (used in hero)
  const mainChannelCount = 5;
  const startIdx = dayOfYear % channelPool.length;
  const mainChannels: typeof channelPool = [];
  const quickLinkChannels: typeof channelPool = [];

  for (let i = 0; i < channelPool.length; i++) {
    const ch = channelPool[(startIdx + i) % channelPool.length];
    if (mainChannels.length < mainChannelCount) {
      mainChannels.push(ch);
    } else {
      quickLinkChannels.push(ch);
    }
  }

  // ── Helper: get best item for a channel ──
  function getBestItemForChannel(chKey: string): { title: string; summary: string; url: string; category: string } | null {
    // Check channel content first
    const chItems = channelContents[chKey];
    if (chItems && chItems.length > 0) {
      const item = chItems[0];
      const chDef = ALL_CHANNELS_V2.find(c => c.key === chKey);
      return {
        title: item.title,
        summary: item.subtitle || item.body.slice(0, 150) + "...",
        url: `${BASE_URL}${chDef?.slug || `/${chKey}`}`,
        category: item.category || chDef?.label || chKey.toUpperCase(),
      };
    }
    // Check news sections
    if (chKey === "startup" && startupNews.length > 0) {
      const n = startupNews[0];
      return { title: n.title, summary: n.summary.slice(0, 150), url: n.id ? `${BASE_URL}/startup/news/${n.id}` : `${BASE_URL}/startup`, category: n.category };
    }
    if (chKey === "dealroom" && dealroomNews.length > 0) {
      const n = dealroomNews[0];
      return { title: n.title, summary: n.summary.slice(0, 150), url: n.id ? `${BASE_URL}/dealroom/news/${n.id}` : `${BASE_URL}/dealroom`, category: n.category };
    }
    if (chKey === "research" && researches.length > 0) {
      const r = researches[0];
      return { title: r.title, summary: r.summary.slice(0, 150), url: r.id ? `${BASE_URL}/research/${r.id}` : `${BASE_URL}/research`, category: r.category };
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOCK A: HEADER
  // ═══════════════════════════════════════════════════════════════
  const headerHtml = `
    ${isTest ? `<tr><td style="background:${RED};padding:10px 20px;text-align:center;border-radius:8px 8px 0 0;">
      <span style="font-size:11px;font-weight:700;color:#ffffff;font-family:${F_SANS};text-transform:uppercase;letter-spacing:0.12em;">⚠️ BOZZA — In attesa di approvazione</span>
    </td></tr>` : ""}
    <tr>
      <td style="background:${WHITE};padding:28px 24px 20px;text-align:center;${isTest ? "" : "border-radius:8px 8px 0 0;"}border-bottom:3px solid ${BLACK};">
        <div style="font-size:10px;color:${MUTED};font-family:${F_SANS};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">
          <a href="${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=header" style="color:${ACCENT};text-decoration:none;font-weight:600;">Leggi nel browser</a>
        </div>
        <div style="font-size:48px;font-weight:900;color:${BLACK};font-family:${F_SANS};line-height:1;letter-spacing:-0.02em;">Proof Press</div>
        <div style="font-size:13px;font-weight:600;color:${ACCENT};font-family:${F_SANS};letter-spacing:0.08em;text-transform:uppercase;margin-top:4px;">Il tuo Sistema Operativo sull'AI</div>
        <div style="width:48px;height:2px;background:${BLACK};margin:10px auto;"></div>
        <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};line-height:1.5;">
          ${dateLabel} &nbsp;·&nbsp; Numero ${issueNumber} &nbsp;·&nbsp; <strong style="color:${BLACK};">${subscriberCount.toLocaleString("it-IT")} lettori</strong>
        </div>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>`;

  // ═══════════════════════════════════════════════════════════════
  // BLOCK B: HERO — Notizia del Giorno
  // ═══════════════════════════════════════════════════════════════
  const heroItem = breakingItems[0] || (aiNews[0] ? { ...aiNews[0], id: String(aiNews[0].id) } : null);
  const heroHtml = heroItem ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:24px 24px 20px;">
              <div style="display:inline-block;background:${RED};color:${WHITE};font-size:10px;font-weight:700;padding:4px 10px;border-radius:3px;letter-spacing:0.1em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:12px;">
                ${heroItem.section ? heroItem.section.toUpperCase().replace(/_/g, " ") : "NOTIZIA DEL GIORNO"}
              </div>
              <div style="font-size:26px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:10px;">
                <a href="${BASE_URL}/ai/news/${heroItem.id}" style="color:${BLACK};text-decoration:none;">${heroItem.summary ? heroItem.title : heroItem.title}</a>
              </div>
              ${heroItem.summary ? `<div style="font-size:15px;color:${SLATE};font-family:${F_SANS};line-height:1.7;margin-bottom:14px;">${heroItem.summary.slice(0, 250)}${heroItem.summary.length > 250 ? "..." : ""}</div>` : ""}
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:${BLACK};border-radius:5px;padding:12px 24px;">
                          <a href="${BASE_URL}/ai/news/${heroItem.id}" style="font-size:13px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${F_SANS};letter-spacing:0.03em;">LEGGI SU Proof Press →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-left:14px;">
                    <span style="font-size:10px;color:${ACCENT};font-weight:600;font-family:${F_SANS};letter-spacing:0.05em;">✓ PROOFPRESS VERIFIED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>` : "";

  // ═══════════════════════════════════════════════════════════════
  // BLOCK C: CONSIGLIATO #1 (Amazon, posizione premium)
  // ═══════════════════════════════════════════════════════════════
  const deal1 = amazonDeals[0];
  const consigliatoHtml1 = deal1 ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border-left:4px solid ${AMAZON_ORANGE};border-top:1px solid ${BORDER};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
          <tr>
            <td style="padding:18px 20px;">
              <div style="font-size:10px;font-weight:700;color:${AMAZON_ORANGE};letter-spacing:0.15em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:8px;">CONSIGLIATO</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${deal1.imageUrl ? `<td width="100" style="vertical-align:top;padding-right:16px;">
                    <a href="${deal1.affiliateUrl}" style="text-decoration:none;"><img src="${deal1.imageUrl}" width="100" style="border-radius:6px;display:block;" alt="${deal1.title}"></a>
                  </td>` : ""}
                  <td style="vertical-align:top;">
                    <div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F_SANS};line-height:1.3;margin-bottom:4px;">
                      <a href="${deal1.affiliateUrl}" style="color:${BLACK};text-decoration:none;">${deal1.title}</a>
                    </div>
                    <div style="font-size:13px;color:${SLATE};font-family:${F_SANS};line-height:1.5;margin-bottom:8px;">${deal1.description.slice(0, 120)}</div>
                    <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};">Amazon.it${deal1.price ? ` · <strong style="color:${BLACK};">${deal1.price}</strong>` : ""}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>` : "";

  // ═══════════════════════════════════════════════════════════════
  // BLOCK D: SEZIONI TEMATICHE — 5 canali a rotazione
  // ═══════════════════════════════════════════════════════════════
  let channelBlocksHtml = "";
  for (const ch of mainChannels) {
    const item = getBestItemForChannel(ch.key);
    if (!item) continue;

    channelBlocksHtml += `
    <tr>
      <td style="padding:0 20px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:20px 24px;">
              <div style="display:inline-block;background:${ch.color};color:${WHITE};font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;letter-spacing:0.08em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">
                ${ch.emoji} ${ch.label}
              </div>
              <div style="font-size:20px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:8px;">
                <a href="${item.url}?utm_source=newsletter&utm_medium=email&utm_campaign=channel_${ch.key}" style="color:${BLACK};text-decoration:none;">${item.title}</a>
              </div>
              <div style="font-size:14px;color:${SLATE};font-family:${F_SANS};line-height:1.6;margin-bottom:12px;">${item.summary}</div>
              <a href="${item.url}?utm_source=newsletter&utm_medium=email&utm_campaign=channel_${ch.key}" style="font-size:12px;font-weight:700;color:${ACCENT};text-decoration:none;font-family:${F_SANS};letter-spacing:0.03em;">LEGGI SUBITO →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }
  if (channelBlocksHtml) {
    channelBlocksHtml += `<tr><td style="height:4px;background:${BG};"></td></tr>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOCK E: STARTUP DEL GIORNO
  // ═══════════════════════════════════════════════════════════════
  const startup = opts.startupOfDay;
  const startupHtml = startup ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:22px 24px;">
              <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.15em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">🚀 STARTUP DEL GIORNO</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="font-size:22px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:4px;">${startup.name}</div>
                    <div style="font-size:14px;color:${ACCENT};font-family:${F_SANS};font-weight:600;margin-bottom:8px;">${startup.tagline}</div>
                    <div style="font-size:13px;color:${SLATE};font-family:${F_SANS};line-height:1.6;margin-bottom:12px;">${startup.description.slice(0, 200)}${startup.description.length > 200 ? "..." : ""}</div>
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                      <tr>
                        <td style="padding-right:16px;">
                          <span style="font-size:11px;color:${MUTED};font-family:${F_SANS};">Categoria</span><br>
                          <span style="font-size:12px;font-weight:600;color:${BLACK};font-family:${F_SANS};">${startup.category}</span>
                        </td>
                        ${startup.country ? `<td style="padding-right:16px;">
                          <span style="font-size:11px;color:${MUTED};font-family:${F_SANS};">Paese</span><br>
                          <span style="font-size:12px;font-weight:600;color:${BLACK};font-family:${F_SANS};">${startup.country}</span>
                        </td>` : ""}
                        ${startup.funding ? `<td style="padding-right:16px;">
                          <span style="font-size:11px;color:${MUTED};font-family:${F_SANS};">Funding</span><br>
                          <span style="font-size:12px;font-weight:600;color:${BLACK};font-family:${F_SANS};">${startup.funding}</span>
                        </td>` : ""}
                        ${startup.aiScore ? `<td>
                          <span style="font-size:11px;color:${MUTED};font-family:${F_SANS};">AI Score</span><br>
                          <span style="font-size:14px;font-weight:800;color:${ACCENT};font-family:${F_SANS};">${startup.aiScore}/100</span>
                        </td>` : ""}
                      </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:${ACCENT};border-radius:5px;padding:10px 20px;">
                          <a href="${BASE_URL}/startup?utm_source=newsletter&utm_medium=email&utm_campaign=startup_day" style="font-size:12px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${F_SANS};">SCOPRI LA STARTUP →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>` : "";

  // ═══════════════════════════════════════════════════════════════
  // BLOCK F: PROMPT COLLECTION — Blocco fisso €39
  // ═══════════════════════════════════════════════════════════════
  const promptPromoHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PROMO_BG};border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px;">
              <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.2em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">📋 COLLEZIONE Proof Press</div>
              <div style="font-size:24px;font-weight:700;color:${WHITE};font-family:${F_SERIF};line-height:1.25;margin-bottom:12px;">99 Prompt da usare davvero nel lavoro</div>
              <div style="font-size:14px;color:#d1d5db;font-family:${F_SANS};line-height:1.7;margin-bottom:6px;">Non una raccolta generica, ma un <strong style="color:${WHITE};">asset operativo</strong>. 99 prompt selezionati, organizzati in 5 macro-sezioni, con libreria ricercabile e PDF incluso.</div>
              <div style="font-size:13px;color:#9ca3af;font-family:${F_SANS};line-height:1.6;margin-bottom:6px;">
                ✓ Carriera (10) &nbsp;·&nbsp; ✓ Produttività (20) &nbsp;·&nbsp; ✓ Business & Marketing (12)<br>
                ✓ Ricerca & Scrittura (27) &nbsp;·&nbsp; ✓ Benessere & Vita pratica (30)
              </div>
              <div style="font-size:13px;color:#9ca3af;font-family:${F_SANS};line-height:1.6;margin-bottom:20px;">Dal bisogno all'esecuzione in pochi secondi.</div>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${WHITE};border-radius:6px;padding:14px 28px;">
                    <a href="${FORUM_URL}/?utm_source=newsletter&utm_medium=email&utm_campaign=prompt_collection" style="font-size:14px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${F_SANS};">ACQUISTA LA COLLEZIONE — 39€ →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>`;

  // ═══════════════════════════════════════════════════════════════
  // BLOCK G: SEZIONE EVENTI
  // ═══════════════════════════════════════════════════════════════
  const events = opts.events;
  let eventsHtml = "";
  if (events.length > 0) {
    const eventRows = events.slice(0, 4).map((ev) => {
      const d = formatEventDate(ev.startAt);
      const typeLabel = ev.isOnline ? "Online" : (ev.location || "In presenza");
      const evUrl = ev.eventUrl || `${BASE_URL}/eventi`;
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="56" style="vertical-align:top;">
                  <div style="background:${ACCENT};border-radius:6px;padding:6px 0;text-align:center;width:50px;">
                    <div style="font-size:18px;font-weight:800;color:${WHITE};font-family:${F_SANS};line-height:1;">${d.day}</div>
                    <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.8);font-family:${F_SANS};letter-spacing:0.1em;">${d.month}</div>
                  </div>
                </td>
                <td style="vertical-align:top;padding-left:12px;">
                  <div style="font-size:14px;font-weight:600;color:${BLACK};font-family:${F_SANS};line-height:1.3;margin-bottom:2px;">
                    <a href="${evUrl}" style="color:${BLACK};text-decoration:none;">${ev.title}</a>
                  </div>
                  <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};">${typeLabel}${ev.isFree ? " · Gratuito" : ""}</div>
                </td>
                <td width="80" style="vertical-align:middle;text-align:right;">
                  <a href="${evUrl}" style="font-size:11px;font-weight:600;color:${ACCENT};text-decoration:none;font-family:${F_SANS};">ISCRIVITI →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }).join("");

    eventsHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:22px 24px;">
              <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.15em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:14px;">📅 PROSSIMI EVENTI</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${eventRows}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOCK H: QUICK LINKS — "Anche oggi su Proof Press"
  // ═══════════════════════════════════════════════════════════════
  let quickLinksHtml = "";
  const quickItems: { emoji: string; label: string; title: string; url: string }[] = [];

  for (const ch of quickLinkChannels) {
    const item = getBestItemForChannel(ch.key);
    if (item) {
      quickItems.push({ emoji: ch.emoji, label: ch.label, title: item.title, url: item.url });
    }
  }
  // Also add remaining breaking/ai news not used in hero
  for (const n of aiNews.slice(1, 4)) {
    if (quickItems.length >= 6) break;
    quickItems.push({
      emoji: "🤖",
      label: "AI NEWS",
      title: n.title,
      url: n.id ? `${BASE_URL}/ai/news/${n.id}` : `${BASE_URL}/ai`,
    });
  }

  if (quickItems.length > 0) {
    const rows = quickItems.slice(0, 6).map((q) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid ${BORDER};">
          <a href="${q.url}?utm_source=newsletter&utm_medium=email&utm_campaign=quicklink" style="text-decoration:none;display:block;">
            <span style="font-size:12px;color:${MUTED};font-family:${F_SANS};font-weight:600;">${q.emoji} ${q.label}</span>
            <span style="font-size:13px;color:${BLACK};font-family:${F_SANS};font-weight:500;margin-left:8px;">${q.title}</span>
          </a>
        </td>
      </tr>`).join("");

    quickLinksHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:20px 24px;">
              <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.15em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:12px;">ANCHE OGGI SU Proof Press</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${rows}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOCK I: CONSIGLIATO #2 + FOOTER
  // ═══════════════════════════════════════════════════════════════
  const deal2 = amazonDeals[1];
  const consigliatoHtml2 = deal2 ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border-left:4px solid ${AMAZON_ORANGE};border-top:1px solid ${BORDER};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
          <tr>
            <td style="padding:18px 20px;">
              <div style="font-size:10px;font-weight:700;color:${AMAZON_ORANGE};letter-spacing:0.15em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:8px;">CONSIGLIATO</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${deal2.imageUrl ? `<td width="100" style="vertical-align:top;padding-right:16px;">
                    <a href="${deal2.affiliateUrl}" style="text-decoration:none;"><img src="${deal2.imageUrl}" width="100" style="border-radius:6px;display:block;" alt="${deal2.title}"></a>
                  </td>` : ""}
                  <td style="vertical-align:top;">
                    <div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F_SANS};line-height:1.3;margin-bottom:4px;">
                      <a href="${deal2.affiliateUrl}" style="color:${BLACK};text-decoration:none;">${deal2.title}</a>
                    </div>
                    <div style="font-size:13px;color:${SLATE};font-family:${F_SANS};line-height:1.5;margin-bottom:8px;">${deal2.description.slice(0, 120)}</div>
                    <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};">Amazon.it${deal2.price ? ` · <strong style="color:${BLACK};">${deal2.price}</strong>` : ""}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:16px;background:${BG};"></td></tr>` : "";

  const footerHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:24px 24px;text-align:center;">
              <div style="font-size:24px;font-weight:900;color:${BLACK};font-family:${F_SANS};letter-spacing:-0.01em;margin-bottom:4px;">Proof Press</div>
              <div style="font-size:11px;color:${ACCENT};font-family:${F_SANS};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">Il tuo Sistema Operativo sull'AI</div>
              <div style="margin-bottom:12px;">
                <a href="https://x.com/ideasmart_ai" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};margin:0 8px;">X</a>
                <span style="color:${MUTED};">·</span>
                <a href="https://www.linkedin.com/company/ideasmart" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};margin:0 8px;">LinkedIn</a>
              </div>
              <div style="margin-bottom:12px;">
                <a href="${BASE_URL}" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};">ideasmart.biz</a>
                <span style="color:${MUTED};margin:0 6px;">·</span>
                <a href="${FORUM_URL}" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};">Prompt Collection</a>
              </div>
              <div style="border-top:1px solid ${BORDER};padding-top:14px;margin-top:4px;">
                <div style="font-size:11px;color:${MUTED};font-family:${F_SANS};line-height:1.7;margin-bottom:10px;">
                  Hai ricevuto questa email perché sei iscritto alla newsletter Proof Press.<br>
                  Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
                </div>
                <a href="${BASE_URL}/preferenze-newsletter" style="font-size:11px;color:${BLACK};text-decoration:underline;font-weight:600;font-family:${F_SANS};">Gestisci preferenze</a>
                <span style="color:${MUTED};margin:0 6px;">·</span>
                <a href="${unsubscribeUrl}" style="font-size:11px;color:${RED};text-decoration:underline;font-weight:600;font-family:${F_SANS};">Cancella iscrizione</a>
              </div>
              <div style="margin-top:14px;padding-top:10px;border-top:1px solid ${BORDER};">
                <div style="font-size:10px;color:${MUTED};font-family:${F_SANS};margin-bottom:4px;">© 2026 Proof Press · Un progetto FoolFarm S.p.A. · Milano</div>
                <div style="font-size:10px;color:${ACCENT};font-weight:600;font-family:${F_SANS};letter-spacing:0.05em;">✓ PROOFPRESS VERIFY TECHNOLOGY</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:24px;"></td></tr>`;

  // ═══════════════════════════════════════════════════════════════
  // ASSEMBLE
  // ═══════════════════════════════════════════════════════════════
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proof Press Daily — ${dateLabel}</title>
  <!--[if mso]><style>table{border-collapse:collapse;}td{font-family:Helvetica,Arial,sans-serif;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${F_SANS};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:24px 0 48px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;">
        ${headerHtml}
        ${heroHtml}
        ${consigliatoHtml1}
        ${channelBlocksHtml}
        ${startupHtml}
        ${promptPromoHtml}
        ${eventsHtml}
        ${quickLinksHtml}
        ${consigliatoHtml2}
        ${footerHtml}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// BUILD & SEND FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Calcola il numero progressivo della newsletter (giorno 1 = 17 marzo 2026) */
function getIssueNumber(): number {
  const startDate = new Date("2026-03-17");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
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
    channels: Record<string, number>;
  };
  sponsorIds: number[];
}> {
  const now = new Date();
  const dateLabel = getDateLabel(now);
  const content = await collectAllContent();

  const [primarySponsor, spotlightSponsor, amazonDeals, startupDay, events] = await Promise.all([
    getActiveSponsor("primary"),
    getActiveSponsor("spotlight"),
    getTodayAmazonDeals(),
    getTodayStartup(),
    getUpcomingEvents(4),
  ]);

  const issueNumber = getIssueNumber();
  const subscriberCount = 6651; // TODO: fetch from DB

  console.log(`[UnifiedNewsletter] Contenuti raccolti:`);
  console.log(`  AI News: ${content.aiNews.length}`);
  console.log(`  Startup News: ${content.startupNews.length}`);
  console.log(`  Dealroom: ${content.dealroomNews.length}`);
  console.log(`  Breaking: ${content.breakingItems.length}`);
  console.log(`  Ricerche: ${content.researches.length}`);
  console.log(`  Amazon Deals: ${amazonDeals.length}`);
  console.log(`  Startup del Giorno: ${startupDay ? startupDay.name : "nessuna"}`);
  console.log(`  Eventi prossimi: ${events.length}`);
  for (const ch of NEWSLETTER_CHANNELS) {
    console.log(`  ${ch.label}: ${content.channelContents[ch.key]?.length ?? 0}`);
  }

  const subject = `Proof Press Daily — ${dateLabel}`;

  const html = buildNewsletterHtmlV2({
    dateLabel,
    issueNumber,
    subscriberCount,
    aiNews: content.aiNews,
    startupNews: content.startupNews,
    dealroomNews: content.dealroomNews,
    breakingItems: content.breakingItems,
    researches: content.researches,
    amazonDeals,
    channelContents: content.channelContents,
    startupOfDay: startupDay,
    events,
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
      channels: Object.fromEntries(
        NEWSLETTER_CHANNELS.map((ch) => [ch.key, content.channelContents[ch.key]?.length ?? 0])
      ),
    },
    sponsorIds,
  };
}

// ─── Send Functions ─────────────────────────────────────────────────────────

const sentDays = new Map<string, boolean>();
const testSentDays = new Map<string, boolean>();

/**
 * Invia una preview (bozza) della newsletter a ac@acinelli.com
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

  console.log(`[UnifiedNewsletter] 📧 Preview → ${TEST_EMAILS.join(", ")}`);
  try {
    const { html, subject, stats } = await buildUnifiedNewsletter(true);
    const sendResults = await Promise.all(
      TEST_EMAILS.map(email => sendEmail({ to: email, subject, html }))
    );
    const allSuccess = sendResults.every(r => r.success);
    const result = sendResults[0];
    if (allSuccess) {
      testSentDays.set(testKey, true);
      console.log(`[UnifiedNewsletter] ✅ Preview inviata a ${TEST_EMAILS.join(", ")}`);

      const channelStats = stats.channels
        ? Object.entries(stats.channels)
            .filter(([, count]) => count > 0)
            .map(([key, count]) => `${key}: ${count}`)
            .join(", ")
        : "nessuno";

      await notifyOwner({
        title: `👁️ Bozza Proof Press Daily — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Bozza newsletter v2 inviata a ${TEST_EMAILS.join(", ")}.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.\nCanali: ${channelStats}`,
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
 * Invia la newsletter a un indirizzo email specifico (test)
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
 * Invia la newsletter a tutti gli iscritti attivi.
 * Invio massivo con link unsubscribe personalizzato (GDPR).
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

  console.log(`[UnifiedNewsletter] 📧 Invio massivo Proof Press Daily v2...`);

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

    for (const sid of sponsorIds) {
      await markSponsorSent(sid);
    }

    await notifyOwner({
      title: `📧 Proof Press Daily inviata — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Newsletter v2 inviata a ${totalSent}/${subscribers.length} iscritti.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.`,
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
        title: `❌ Errore Proof Press Daily — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Errore durante l'invio della newsletter v2: ${msg}`,
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
