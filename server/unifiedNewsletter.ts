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
 * REGOLA FONDAMENTALE: TUTTI i link puntano a proofpress.ai, MAI alle fonti esterne. (Unica eccezione: promptcollection2026.com per Prompt Collection)
 */

import { sendEmail } from "./email";
import { sendWithWarmup } from "./newsletterWarmup";
import {
  getLatestNews,
  getActiveSubscribers,
  createNewsletterSend,
  updateNewsletterSendRecipientCount,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { getTodayResearch } from "./researchGenerator";
import { schedulePostSendReport } from "./newsletterPostSendReport";
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
  banners as bannersTable,
} from "../drizzle/schema";
import { eq, desc, and, sql, gte, gt, lt, inArray } from "drizzle-orm";
import { newsletterSends as newsletterSendsTable } from "../drizzle/schema";

// ─── Config ─────────────────────────────────────────────────────────────────

const BASE_URL = "https://proofpress.ai";
const FORUM_URL = "https://promptcollection2026.com"; // Unica eccezione: Prompt Collection
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
  verifyHash?: string | null;
}

interface BreakingItem {
  id: string | number;
  newsItemId?: number | null; // ID della notizia collegata in newsItems (per link diretto)
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

interface BannerData {
  id: number;
  name: string;
  imageUrl: string;
  clickUrl: string;
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

/**
 * Seleziona 2 banner attivi con rotazione deterministica giornaliera.
 * Selezione: dayOfYear % n.banners per il primo, (dayOfYear + 1) % n.banners per il secondo.
 * Preferisce banner con slot 'all', 'horizontal' o 'both' (adatti alla newsletter).
 */
async function getNewsletterBanners(): Promise<BannerData[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Recupera tutti i banner attivi, ordinati per peso desc
  const allBanners = await db
    .select({
      id: bannersTable.id,
      name: bannersTable.name,
      imageUrl: bannersTable.imageUrl,
      clickUrl: bannersTable.clickUrl,
      slot: bannersTable.slot,
      weight: bannersTable.weight,
    })
    .from(bannersTable)
    .where(eq(bannersTable.active, true))
    .orderBy(desc(bannersTable.weight), bannersTable.sortOrder);

  if (allBanners.length === 0) return [];

  // Rotazione deterministica: selezione basata sul giorno dell'anno
  const idx1 = dayOfYear % allBanners.length;
  const idx2 = (dayOfYear + 1) % allBanners.length;

  const selected: BannerData[] = [];
  const b1 = allBanners[idx1];
  if (b1) selected.push({ id: b1.id, name: b1.name, imageUrl: b1.imageUrl, clickUrl: b1.clickUrl });

  // Secondo banner diverso dal primo
  if (allBanners.length > 1) {
    const b2 = allBanners[idx2 === idx1 ? (idx1 + 1) % allBanners.length : idx2];
    if (b2) selected.push({ id: b2.id, name: b2.name, imageUrl: b2.imageUrl, clickUrl: b2.clickUrl });
  }

  return selected;
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
    // REGOLA: includiamo solo notizie con ID numerico valido (esistenti sul sito)
    aiNews: aiNews
      .filter((n: any) => n.id != null && typeof n.id === 'number')
      .map((n: any) => ({
        id: n.id,
        section: "ai",
        title: n.title,
        summary: n.summary,
        category: n.category,
        sourceName: n.sourceName ?? null,
        sourceUrl: n.sourceUrl ?? null,
        verifyHash: n.verifyHash ?? null,
      })) as NewsItem[],
    startupNews: startupNews
      .filter((n: any) => n.id != null && typeof n.id === 'number')
      .map((n: any) => ({
        id: n.id,
        section: "startup",
        title: n.title,
        summary: n.summary,
        category: n.category,
        sourceName: n.sourceName ?? null,
        sourceUrl: n.sourceUrl ?? null,
        verifyHash: n.verifyHash ?? null,
      })) as NewsItem[],
    dealroomNews: dealroomNews
      .filter((n: any) => n.id != null && typeof n.id === 'number')
      .map((n: any) => ({
        id: n.id,
        section: "dealroom",
        title: n.title,
        summary: n.summary,
        category: n.category,
        sourceName: n.sourceName ?? null,
        sourceUrl: n.sourceUrl ?? null,
        verifyHash: n.verifyHash ?? null,
      })) as NewsItem[],
    breakingItems: breakingItems.map((b: any) => ({
      id: b.id,
      newsItemId: b.newsItemId ?? null, // ID della notizia collegata in newsItems (per link diretto)
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
  heroImageUrl?: string | null;
  channelImages?: Record<string, string | null>;
  newsletterBanners?: BannerData[];
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
    heroImageUrl,
    channelImages,
    newsletterBanners,
  } = opts;

  // ── Design Tokens v4 (Apple Style — SF Francisco) ──
  const F_SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
  const F_SANS  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
  const BG      = "#f5f5f7";   // grigio Apple — mai sfondo scuro
  const WHITE   = "#ffffff";
  const BLACK   = "#1d1d1f";   // Apple text primary
  const SLATE   = "#6e6e73";   // Apple text secondary
  const MUTED   = "#86868b";   // Apple text tertiary
  const BORDER  = "#d2d2d7";   // Apple separator
  const ACCENT  = "#d94f3d";   // rosso Proof Press — solo per CTA
  const ACCENT_DARK = "#b83c2c";
  const GRAY_DARK   = "#1d1d1f";
  const AMAZON_ORANGE = "#FF9900";

  // ── Select 5-6 strongest channels for today ──
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
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
  // REGOLA: tutti i link devono puntare a proofpress.ai/canale/{id} — MAI alla fonte esterna
  function getBestItemForChannel(chKey: string): { title: string; summary: string; url: string; category: string } | null {
    const chItems = channelContents[chKey];
    if (chItems && chItems.length > 0) {
      const item = chItems[0];
      const chDef = ALL_CHANNELS_V2.find(c => c.key === chKey);
      // Usa sempre link interno a proofpress.ai — con ID articolo se disponibile
      const internalUrl = item.id
        ? `${BASE_URL}${chDef?.slug || `/${chKey}`}/${item.id}`
        : `${BASE_URL}${chDef?.slug || `/${chKey}`}`;
      return {
        title: item.title,
        summary: item.subtitle || item.body.slice(0, 160) + "...",
        url: internalUrl,
        category: item.category || chDef?.label || chKey.toUpperCase(),
      };
    }
    if (chKey === "startup" && startupNews.length > 0) {
      const n = startupNews[0];
      return { title: n.title, summary: n.summary.slice(0, 160), url: n.id ? `${BASE_URL}/startup/news/${n.id}` : `${BASE_URL}/startup`, category: n.category };
    }
    if (chKey === "dealroom" && dealroomNews.length > 0) {
      const n = dealroomNews[0];
      return { title: n.title, summary: n.summary.slice(0, 160), url: n.id ? `${BASE_URL}/dealroom/news/${n.id}` : `${BASE_URL}/dealroom`, category: n.category };
    }
    if (chKey === "research" && researches.length > 0) {
      const r = researches[0];
      return { title: r.title, summary: r.summary.slice(0, 160), url: r.id ? `${BASE_URL}/research/${r.id}` : `${BASE_URL}/research`, category: r.category };
    }
    return null;
  }

  // ── Pexels image URL helper ──
  function pexelsUrl(id: string | number, w: number, h: number): string {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
  }

  // ── Fallback Pexels IDs per tema ──
  const FALLBACK_PEXELS: Record<string, string> = {
    ai:        "8386440",  // neural network visualization
    startup:   "3184292",  // business team meeting
    research:  "2280571",  // laboratory science
    dealroom:  "3184465",  // boardroom deal
    default:   "3861969",  // technology abstract
  };

  // ═══════════════════════════════════════════════════════════════
  // BLOCK A: HEADER
  // ═══════════════════════════════════════════════════════════════
  const headerHtml = `
    ${isTest ? `<tr><td style="background:${ACCENT};padding:10px 20px;text-align:center;border-radius:8px 8px 0 0;">
      <span style="font-size:11px;font-weight:700;color:#ffffff;font-family:${F_SANS};text-transform:uppercase;letter-spacing:0.12em;">⚠️ BOZZA — In attesa di approvazione</span>
    </td></tr>` : ""}
    <tr>
      <td style="background:${WHITE};padding:32px 32px 24px;text-align:center;${isTest ? "" : "border-radius:8px 8px 0 0;"}border-bottom:2px solid ${BLACK};">
        <div style="text-align:right;margin-bottom:16px;">
          <a href="${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=header_browser" style="font-size:11px;color:${MUTED};text-decoration:none;font-family:${F_SANS};">Leggi nel browser →</a>
        </div>
        <div style="font-size:52px;font-weight:900;color:${BLACK};font-family:${F_SERIF};line-height:1;letter-spacing:-0.02em;margin-bottom:4px;">AI4Business News</div>
        <div style="font-size:13px;font-weight:400;color:${MUTED};font-family:${F_SANS};margin-bottom:14px;">by ProofPress</div>
        <div style="width:40px;height:2px;background:${ACCENT};margin:0 auto 14px;"></div>
        <div style="font-size:12px;font-weight:600;color:${GRAY_DARK};font-family:${F_SANS};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;">Notizie di Innovazione, Investimenti e Tecnologia Esclusive</div>
        <div style="font-size:11px;font-weight:400;color:${MUTED};font-family:${F_SANS};margin-bottom:14px;">100% Verificate con &nbsp;<a href="${BASE_URL}/proofpress-verify?utm_source=newsletter&utm_medium=email&utm_campaign=header_payoff" style="color:${ACCENT};text-decoration:none;font-weight:600;">tecnologia ProofPress Verify</a></div>
        <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};line-height:1.5;">
          ${dateLabel} &nbsp;·&nbsp; N° ${issueNumber} &nbsp;·&nbsp; <strong style="color:${BLACK};">${subscriberCount.toLocaleString("it-IT")} lettori</strong>
        </div>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>`;

  // ═══════════════════════════════════════════════════════════════
  // BLOCK B: ANNUNCIO REBRAND (primi numeri)
  // ═══════════════════════════════════════════════════════════════
  const showRebrand = issueNumber <= 30; // mostra per i primi 30 numeri
  const rebrandHtml = showRebrand ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};border-left:4px solid ${BLACK};">
          <tr>
            <td style="padding:20px 24px;">
              <div style="font-size:10px;font-weight:700;color:${GRAY_DARK};letter-spacing:0.18em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">NOVITÀ</div>
              <div style="font-size:20px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:8px;">Ideasmart diventa Proof Press.</div>
              <div style="font-size:14px;color:${SLATE};font-family:${F_SANS};line-height:1.7;margin-bottom:16px;">La rivoluzione della notizia: certificata, automatizzata, vera. No fakes, more news vere per basare le vostre decisioni.</div>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${ACCENT};border-radius:980px;padding:11px 22px;">
                    <a href="${BASE_URL}/proofpress-verify?utm_source=newsletter&utm_medium=email&utm_campaign=rebrand" style="font-size:12px;font-weight:600;color:${WHITE};text-decoration:none;font-family:${F_SANS};">Scopri la ProofPress Verify Technology →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>` : "";

  // ═══════════════════════════════════════════════════════════════
  // BLOCK C: HERO — Notizia di Apertura
  // ═══════════════════════════════════════════════════════════════
  // Hero: preferisce breaking news, altrimenti prima notizia AI (solo con ID valido)
  const heroAiItem = aiNews[0] && aiNews[0].id ? aiNews[0] : null;
  const heroItem = breakingItems[0] || (heroAiItem ? { ...heroAiItem, id: String(heroAiItem.id) } : null);

  // Funzione helper: costruisce il link corretto per l'hero
  // - Breaking news: usa newsItemId se disponibile (link a notizia reale), altrimenti /ai
  // - NewsItem: usa sempre /ai/news/{id}
  function buildHeroUrl(item: BreakingItem | NewsItem | null, campaign: string): string {
    if (!item) return `${BASE_URL}/ai`;
    const isBreaking = 'breakingReason' in item;
    if (isBreaking) {
      const breakingItem = item as BreakingItem;
      if (breakingItem.newsItemId && typeof breakingItem.newsItemId === 'number') {
        return `${BASE_URL}/ai/news/${breakingItem.newsItemId}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}`;
      }
      // Breaking senza newsItemId collegato: link alla sezione AI
      return `${BASE_URL}/ai?utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}`;
    }
    // NewsItem normale: link diretto
    const newsItem = item as NewsItem;
    return `${BASE_URL}/ai/news/${newsItem.id}?utm_source=newsletter&utm_medium=email&utm_campaign=${campaign}`;
  }
  const heroImgUrl = heroImageUrl || pexelsUrl(FALLBACK_PEXELS.ai, 640, 300);
  // ProofPress Verify badge: usa l'hash reale SHA-256 dal DB (primi 16 char), oppure genera uno sintetico
  const heroVerifyHash = heroItem && 'verifyHash' in heroItem && (heroItem as any).verifyHash
    ? `PP-${((heroItem as any).verifyHash as string).slice(0, 16).toUpperCase()}`
    : heroItem ? `PP-${Math.abs(heroItem.title.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 99999).toString().padStart(5, "0")}` : "PP-00000";
  const verifyHash = heroVerifyHash;
  const heroHtml = heroItem ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:0;">
              <img src="${heroImgUrl}" width="600" style="width:100%;max-width:600px;height:280px;object-fit:cover;display:block;" alt="${heroItem.title}" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 22px;">
              <div style="display:inline-block;background:${ACCENT};color:${WHITE};font-size:10px;font-weight:700;padding:4px 10px;border-radius:3px;letter-spacing:0.1em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:14px;">
                ${heroItem.section ? heroItem.section.toUpperCase().replace(/_/g, " ") : "NOTIZIA DEL GIORNO"}
              </div>
              <div style="font-size:28px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:12px;">
                <a href="${buildHeroUrl(heroItem, 'hero')}" style="color:${BLACK};text-decoration:none;">${heroItem.title}</a>
              </div>
              ${heroItem.summary ? `<div style="font-size:15px;color:${SLATE};font-family:${F_SANS};line-height:1.75;margin-bottom:18px;">${heroItem.summary.slice(0, 280)}${heroItem.summary.length > 280 ? "..." : ""}</div>` : ""}
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:${ACCENT};border-radius:980px;padding:12px 24px;">
                          <a href="${buildHeroUrl(heroItem, 'hero_cta')}" style="font-size:13px;font-weight:600;color:${WHITE};text-decoration:none;font-family:${F_SANS};">Leggi su ProofPress →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align:right;vertical-align:middle;">
                    <span style="font-size:10px;color:${MUTED};font-weight:600;font-family:${F_SANS};letter-spacing:0.04em;">✓ PROOFPRESS VERIFY &nbsp;·&nbsp; ${verifyHash}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>` : "";

  // ═══════════════════════════════════════════════════════════════
  // BLOCK D: CONSIGLIATO #1 (Amazon, posizione premium)
  // ═══════════════════════════════════════════════════════════════
  const deal1 = amazonDeals[0];
  const consigliatoHtml1 = deal1 ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};border-left:4px solid ${AMAZON_ORANGE};">
          <tr>
            <td style="padding:18px 22px;">
              <div style="font-size:10px;font-weight:700;color:${AMAZON_ORANGE};letter-spacing:0.18em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">CONSIGLIATO</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${deal1.imageUrl ? `<td width="90" style="vertical-align:top;padding-right:16px;">
                    <a href="${deal1.affiliateUrl}" style="text-decoration:none;"><img src="${deal1.imageUrl}" width="90" height="90" style="border-radius:6px;display:block;object-fit:cover;" alt="${deal1.title}"></a>
                  </td>` : ""}
                  <td style="vertical-align:top;">
                    <div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F_SANS};line-height:1.35;margin-bottom:5px;">
                      <a href="${deal1.affiliateUrl}" style="color:${BLACK};text-decoration:none;">${deal1.title}</a>
                    </div>
                    <div style="font-size:13px;color:${SLATE};font-family:${F_SANS};line-height:1.6;margin-bottom:8px;">${deal1.description.slice(0, 130)}</div>
                    <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};">Amazon.it${deal1.price ? ` · <strong style="color:${BLACK};">${deal1.price}</strong>` : ""}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>` : "";

  // ═══════════════════════════════════════════════════════════════
  // BLOCK E: SEZIONI TEMATICHE — 5 canali a rotazione
  // ═══════════════════════════════════════════════════════════════
  let channelBlocksHtml = "";
  for (const ch of mainChannels) {
    const item = getBestItemForChannel(ch.key);
    if (!item) continue;
    const chImgUrl = (channelImages && channelImages[ch.key]) || pexelsUrl(FALLBACK_PEXELS[ch.key] || FALLBACK_PEXELS.default, 640, 200);
    channelBlocksHtml += `
    <tr>
      <td style="padding:0 20px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:0;">
              <img src="${chImgUrl}" width="600" style="width:100%;max-width:600px;height:180px;object-fit:cover;display:block;" alt="${item.title}" />
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 18px;">
              <div style="display:inline-block;background:${ch.color};color:${WHITE};font-size:10px;font-weight:700;padding:3px 9px;border-radius:3px;letter-spacing:0.08em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">
                ${ch.emoji} ${ch.label}
              </div>
              <div style="font-size:21px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.35;margin-bottom:8px;">
                <a href="${item.url}?utm_source=newsletter&utm_medium=email&utm_campaign=channel_${ch.key}" style="color:${BLACK};text-decoration:none;">${item.title}</a>
              </div>
              <div style="font-size:14px;color:${SLATE};font-family:${F_SANS};line-height:1.7;margin-bottom:14px;">${item.summary}</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td><a href="${item.url}?utm_source=newsletter&utm_medium=email&utm_campaign=channel_${ch.key}_cta" style="font-size:11px;font-weight:700;color:${ACCENT};text-decoration:none;font-family:${F_SANS};letter-spacing:0.05em;text-transform:uppercase;">LEGGI SUBITO →</a></td>
                  <td style="text-align:right;"><span style="font-size:9px;color:${MUTED};font-family:${F_SANS};letter-spacing:0.04em;">✓ PROOFPRESS VERIFY</span></td>
                </tr>
              </table>
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
  // BLOCK F: STARTUP DEL GIORNO
  // ═══════════════════════════════════════════════════════════════
  const startup = opts.startupOfDay;
  const startupHtml = startup ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:22px 26px;">
              <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.18em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:12px;">🚀 STARTUP DEL GIORNO</div>
              <div style="font-size:24px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:4px;">${startup.name}</div>
              <div style="font-size:14px;color:${ACCENT};font-family:${F_SANS};font-weight:600;margin-bottom:10px;">${startup.tagline}</div>
              <div style="font-size:13px;color:${SLATE};font-family:${F_SANS};line-height:1.7;margin-bottom:14px;">${startup.description.slice(0, 220)}${startup.description.length > 220 ? "..." : ""}</div>
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding-right:20px;">
                    <span style="font-size:10px;color:${MUTED};font-family:${F_SANS};text-transform:uppercase;letter-spacing:0.08em;">Categoria</span><br>
                    <span style="font-size:12px;font-weight:600;color:${BLACK};font-family:${F_SANS};">${startup.category}</span>
                  </td>
                  ${startup.country ? `<td style="padding-right:20px;">
                    <span style="font-size:10px;color:${MUTED};font-family:${F_SANS};text-transform:uppercase;letter-spacing:0.08em;">Paese</span><br>
                    <span style="font-size:12px;font-weight:600;color:${BLACK};font-family:${F_SANS};">${startup.country}</span>
                  </td>` : ""}
                  ${startup.funding ? `<td style="padding-right:20px;">
                    <span style="font-size:10px;color:${MUTED};font-family:${F_SANS};text-transform:uppercase;letter-spacing:0.08em;">Funding</span><br>
                    <span style="font-size:12px;font-weight:600;color:${BLACK};font-family:${F_SANS};">${startup.funding}</span>
                  </td>` : ""}
                  ${startup.aiScore ? `<td>
                    <span style="font-size:10px;color:${MUTED};font-family:${F_SANS};text-transform:uppercase;letter-spacing:0.08em;">AI Score</span><br>
                    <span style="font-size:16px;font-weight:800;color:${ACCENT};font-family:${F_SANS};">${startup.aiScore}/100</span>
                  </td>` : ""}
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${ACCENT};border-radius:980px;padding:11px 22px;">
                    <a href="${BASE_URL}/ai/spotlight/${startup.id}?utm_source=newsletter&utm_medium=email&utm_campaign=startup_day" style="font-size:13px;font-weight:600;color:${WHITE};text-decoration:none;font-family:${F_SANS};">Scopri la startup →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>` : "";

  // ═══════════════════════════════════════════════════════════════
  // BLOCK G: PROMO PROMPT COLLECTION — Blocco fisso
  // ═══════════════════════════════════════════════════════════════
  const promptPromoHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};border-left:4px solid ${ACCENT};">
          <tr>
            <td style="padding:24px 26px;">
              <div style="font-size:10px;font-weight:700;color:${ACCENT};letter-spacing:0.18em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">📋 COLLEZIONE PROOF PRESS</div>
              <div style="font-size:22px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:10px;">La collezione Proof Press di prompt da usare davvero nel lavoro quotidiano.</div>
              <div style="font-size:14px;color:${SLATE};font-family:${F_SANS};line-height:1.7;margin-bottom:6px;">Un funnel semplice e concreto: arrivi dalla newsletter, acquisti a <strong style="color:${BLACK};">39€</strong> e ottieni accesso alla libreria ricercabile con il PDF completo incluso.</div>
              <div style="font-size:13px;color:${MUTED};font-family:${F_SANS};line-height:1.6;margin-bottom:20px;">
                ✓ 99 prompt selezionati &nbsp;·&nbsp; ✓ Libreria ricercabile &nbsp;·&nbsp; ✓ PDF incluso<br>
                Carriera · Produttività · Business · Ricerca · Benessere
              </div>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${ACCENT};border-radius:980px;padding:12px 26px;">
                    <a href="${FORUM_URL}/?utm_source=newsletter&utm_medium=email&utm_campaign=prompt_collection" style="font-size:13px;font-weight:600;color:${WHITE};text-decoration:none;font-family:${F_SANS};">Scopri la Collezione →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>`;

    // ═════════════════════════════════════════════════════════════
  // BLOCK G2: BANNER PUBBLICITARI — Rotazione giornaliera (2 banner)
  // I link usano /api/nl/b/:id per tracciare i click dalla newsletter
  // ═════════════════════════════
  const bannerHtml1 = newsletterBanners && newsletterBanners[0] ? `
    <tr>
      <td style="padding:0 20px;">
        <a href="${BASE_URL}/api/nl/b/${newsletterBanners[0].id}" style="display:block;text-decoration:none;">
          <img src="${newsletterBanners[0].imageUrl}" alt="${newsletterBanners[0].name}" width="600" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px;border:1px solid ${BORDER};" />
        </a>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>` : "";

  const bannerHtml2 = newsletterBanners && newsletterBanners[1] ? `
    <tr>
      <td style="padding:0 20px;">
        <a href="${BASE_URL}/api/nl/b/${newsletterBanners[1].id}" style="display:block;text-decoration:none;">
          <img src="${newsletterBanners[1].imageUrl}" alt="${newsletterBanners[1].name}" width="600" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px;border:1px solid ${BORDER};" />
        </a>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>` : "";

  // ═════════════════════════════════════════════════════════════
  // BLOCK H: ISCRIZIONE GRATUITA — Blocco fisso
  // ═════════════════════════════════════════════════════════════
  const iscrizioneHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};border-left:4px solid ${BLACK};">
          <tr>
            <td style="padding:22px 26px;">
              <div style="font-size:10px;font-weight:700;color:${GRAY_DARK};letter-spacing:0.18em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">PROOF PRESS</div>
              <div style="font-size:22px;font-weight:700;color:${BLACK};font-family:${F_SERIF};line-height:1.3;margin-bottom:8px;">Ogni giorno 400 news, ricerche e notizie gratis.</div>
              <div style="font-size:14px;color:${SLATE};font-family:${F_SANS};line-height:1.7;margin-bottom:18px;">AI, Startup e Venture Capital — aggiornato ogni giorno.</div>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${BLACK};border-radius:980px;padding:12px 26px;">
                    <a href="${BASE_URL}/registrati?utm_source=newsletter&utm_medium=email&utm_campaign=iscrizione" style="font-size:13px;font-weight:600;color:${WHITE};text-decoration:none;font-family:${F_SANS};">Iscriviti gratis →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>`;

  // ═══════════════════════════════════════════════════════════════
  // BLOCK I: SEZIONE EVENTI
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
          <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="52" style="vertical-align:top;">
                  <div style="background:${ACCENT};border-radius:6px;padding:6px 0;text-align:center;width:46px;">
                    <div style="font-size:17px;font-weight:800;color:${WHITE};font-family:${F_SANS};line-height:1;">${d.day}</div>
                    <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.85);font-family:${F_SANS};letter-spacing:0.1em;">${d.month}</div>
                  </div>
                </td>
                <td style="vertical-align:top;padding-left:14px;">
                  <div style="font-size:14px;font-weight:600;color:${BLACK};font-family:${F_SANS};line-height:1.35;margin-bottom:3px;">
                    <a href="${evUrl}" style="color:${BLACK};text-decoration:none;">${ev.title}</a>
                  </div>
                  <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};">${typeLabel}${ev.isFree ? " · Gratuito" : ""}</div>
                </td>
                <td width="80" style="vertical-align:middle;text-align:right;">
                  <a href="${evUrl}" style="font-size:11px;font-weight:700;color:${ACCENT};text-decoration:none;font-family:${F_SANS};letter-spacing:0.04em;text-transform:uppercase;">ISCRIVITI →</a>
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
            <td style="padding:22px 26px;">
              <div style="font-size:10px;font-weight:700;color:${GRAY_DARK};letter-spacing:0.15em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:16px;">📅 PROSSIMI EVENTI</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${eventRows}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOCK J: QUICK LINKS — "Anche oggi su Proof Press"
  // ═══════════════════════════════════════════════════════════════
  let quickLinksHtml = "";
  const quickItems: { emoji: string; label: string; title: string; url: string; verifyHash?: string | null }[] = [];
  for (const ch of quickLinkChannels) {
    const item = getBestItemForChannel(ch.key);
    if (item) {
      quickItems.push({ emoji: ch.emoji, label: ch.label, title: item.title, url: item.url });
    }
  }
  // Solo notizie AI con ID valido (esistenti sul sito)
  for (const n of aiNews.slice(1, 4)) {
    if (quickItems.length >= 6) break;
    if (!n.id) continue; // salta notizie senza ID
    quickItems.push({
      emoji: "🤖",
      label: "AI NEWS",
      title: n.title,
      url: `${BASE_URL}/ai/news/${n.id}`,
      verifyHash: n.verifyHash ?? null,
    });
  }
  if (quickItems.length > 0) {
    const rows = quickItems.slice(0, 6).map((q) => {
      const shortHash = q.verifyHash ? q.verifyHash.slice(0, 16).toUpperCase() : null;
      return `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid ${BORDER};">
          <a href="${q.url}?utm_source=newsletter&utm_medium=email&utm_campaign=quicklink" style="text-decoration:none;display:block;">
            <span style="font-size:11px;color:${MUTED};font-family:${F_SANS};font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${q.emoji} ${q.label}</span>
            <span style="font-size:13px;color:${BLACK};font-family:${F_SANS};font-weight:500;margin-left:6px;">${q.title}</span>
            ${shortHash ? `<div style="font-size:9px;color:${MUTED};font-family:${F_SANS};margin-top:3px;letter-spacing:0.04em;">✓ PROOFPRESS VERIFY &nbsp;·&nbsp; PP-${shortHash}</div>` : ""}
          </a>
        </td>
      </tr>`;
    }).join("");
    quickLinksHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:20px 26px;">
              <div style="font-size:10px;font-weight:700;color:${GRAY_DARK};letter-spacing:0.15em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:14px;">ANCHE OGGI SU PROOF PRESS</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${rows}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOCK J2: PROOF PRESS RESEARCH — Box ricerche del giorno
  // ═══════════════════════════════════════════════════════════════
  let researchBoxHtml = "";
  if (researches.length > 0) {
    const topResearches = researches.slice(0, 3);
    const researchRows = topResearches.map((r, i) => {
      const researchUrl = r.id
        ? `${BASE_URL}/research/${r.id}?utm_source=newsletter&utm_medium=email&utm_campaign=research_box`
        : `${BASE_URL}/research?utm_source=newsletter&utm_medium=email&utm_campaign=research_box`;
      const isLast = i === topResearches.length - 1;
      return `
      <tr>
        <td style="padding:${i === 0 ? '0' : '12px'} 0 12px;${!isLast ? `border-bottom:1px solid #e5e7eb;` : ''}">
          <a href="${researchUrl}" style="text-decoration:none;display:block;">
            ${r.isResearchOfDay
              ? `<div style="display:inline-block;font-size:9px;font-weight:700;color:#ffffff;background:#0066cc;border-radius:3px;padding:2px 7px;letter-spacing:0.08em;text-transform:uppercase;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:6px;">RICERCA DEL GIORNO</div>`
              : `<div style="font-size:10px;font-weight:600;color:#0066cc;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:4px;">${r.category || 'RESEARCH'}</div>`
            }
            <div style="font-size:14px;font-weight:700;color:#111827;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;margin-bottom:4px;">${r.title}</div>
            <div style="font-size:12px;color:#6b7280;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;">${r.summary ? r.summary.slice(0, 120) + '...' : ''}</div>
          </a>
        </td>
      </tr>`;
    }).join("");
    researchBoxHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #d2d2d7;border-left:4px solid #0071e3;">
          <tr>
            <td style="padding:20px 26px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:14px;border-bottom:1px solid #d2d2d7;">
                    <span style="font-size:10px;font-weight:700;color:#0071e3;letter-spacing:0.18em;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;">🔬 PROOF PRESS RESEARCH</span>
                    <span style="float:right;">
                      <a href="${BASE_URL}/research?utm_source=newsletter&utm_medium=email&utm_campaign=research_all" style="font-size:10px;color:#86868b;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;">Tutte le ricerche →</a>
                    </span>
                  </td>
                </tr>
                ${researchRows}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:#f5f5f7;"></td></tr>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOCK J2: CTA — LEGGI LE NOTIZIE DI OGGI SU PROOFPRESS
  // ═══════════════════════════════════════════════════════════════
  const ctaNewsItems = [...aiNews.slice(0, 3), ...startupNews.slice(0, 2)];
  const ctaSectionHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:24px 26px 20px;">
              <div style="font-size:10px;font-weight:700;color:${MUTED};font-family:${F_SANS};letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px;">CONTINUA A LEGGERE SU PROOFPRESS</div>
              <div style="font-size:22px;font-weight:900;color:${BLACK};font-family:${F_SERIF};margin-bottom:8px;letter-spacing:-0.5px;">Le notizie di oggi</div>
              <p style="font-size:13px;line-height:1.7;color:${SLATE};font-family:${F_SANS};margin:0 0 18px;">Ogni giorno analizziamo oltre 4.000 fonti per portarti solo le notizie che contano su AI, Startup e Venture Capital. Leggi l'aggiornamento completo su proofpress.ai.</p>
              ${ctaNewsItems.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                ${ctaNewsItems.map((n, i) => {
                  const newsUrl = `${BASE_URL}/${(n as any).section === 'startup' ? 'startup' : 'ai'}/news/${n.id}`;
                  const isLast = i === ctaNewsItems.length - 1;
                  return `<tr>
                    <td style="padding:10px 0;${!isLast ? `border-bottom:1px solid ${BORDER};` : ''}">
                      <div style="font-size:9px;font-weight:700;color:${ACCENT};font-family:${F_SANS};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:3px;">${n.category}</div>
                      <a href="${newsUrl}" style="font-size:14px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${F_SANS};line-height:1.4;display:block;margin-bottom:3px;">${n.title}</a>
                      <a href="${newsUrl}" style="font-size:11px;font-weight:600;color:${ACCENT};text-decoration:none;font-family:${F_SANS};">Leggi l'articolo →</a>
                    </td>
                  </tr>`;
                }).join('')}
              </table>` : ''}
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="${BASE_URL}/ai?utm_source=newsletter&utm_medium=email&utm_campaign=cta_section" style="display:inline-block;background:${BLACK};color:${WHITE};font-size:11px;font-weight:700;font-family:${F_SANS};text-decoration:none;padding:10px 18px;border-radius:980px;letter-spacing:0.04em;">AI News →</a>
                  </td>
                  <td style="padding-right:8px;">
                    <a href="${BASE_URL}/startup?utm_source=newsletter&utm_medium=email&utm_campaign=cta_section" style="display:inline-block;background:${BLACK};color:${WHITE};font-size:11px;font-weight:700;font-family:${F_SANS};text-decoration:none;padding:10px 18px;border-radius:980px;letter-spacing:0.04em;">Startup →</a>
                  </td>
                  <td>
                    <a href="${BASE_URL}/research?utm_source=newsletter&utm_medium=email&utm_campaign=cta_section" style="display:inline-block;background:${WHITE};color:${BLACK};border:1.5px solid ${BORDER};font-size:11px;font-weight:700;font-family:${F_SANS};text-decoration:none;padding:9px 18px;border-radius:980px;letter-spacing:0.04em;">Ricerche →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>`;

  // ═══════════════════════════════════════════════════════════════
  // BLOCK K: CONSIGLIATO #2 + FOOTER
  // ═══════════════════════════════════════════════════════════════
  const deal2 = amazonDeals[1];
  const consigliatoHtml2 = deal2 ? `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};border-left:4px solid ${AMAZON_ORANGE};">
          <tr>
            <td style="padding:18px 22px;">
              <div style="font-size:10px;font-weight:700;color:${AMAZON_ORANGE};letter-spacing:0.18em;text-transform:uppercase;font-family:${F_SANS};margin-bottom:10px;">CONSIGLIATO</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${deal2.imageUrl ? `<td width="90" style="vertical-align:top;padding-right:16px;">
                    <a href="${deal2.affiliateUrl}" style="text-decoration:none;"><img src="${deal2.imageUrl}" width="90" height="90" style="border-radius:6px;display:block;object-fit:cover;" alt="${deal2.title}"></a>
                  </td>` : ""}
                  <td style="vertical-align:top;">
                    <div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${F_SANS};line-height:1.35;margin-bottom:5px;">
                      <a href="${deal2.affiliateUrl}" style="color:${BLACK};text-decoration:none;">${deal2.title}</a>
                    </div>
                    <div style="font-size:13px;color:${SLATE};font-family:${F_SANS};line-height:1.6;margin-bottom:8px;">${deal2.description.slice(0, 130)}</div>
                    <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};">Amazon.it${deal2.price ? ` · <strong style="color:${BLACK};">${deal2.price}</strong>` : ""}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:20px;background:${BG};"></td></tr>` : "";

  const footerHtml = `
    <tr>
      <td style="padding:0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="padding:28px 26px;text-align:center;">
              <div style="font-size:28px;font-weight:900;color:${BLACK};font-family:${F_SERIF};letter-spacing:-0.01em;margin-bottom:3px;">ProofPress</div>
              <div style="font-size:12px;color:${MUTED};font-family:${F_SANS};margin-bottom:4px;">Per chi vuole capire l'innovazione prima degli altri</div>
              <div style="font-size:10px;font-weight:600;color:${GRAY_DARK};font-family:${F_SANS};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:18px;">La prima redazione giornalistica agentica con informazione certificata</div>
              <div style="margin-bottom:14px;">
                <a href="https://x.com/proofpress_ai" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};margin:0 10px;">X / Twitter</a>
                <span style="color:${MUTED};">·</span>
                <a href="https://www.linkedin.com/company/proofpress" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};margin:0 10px;">LinkedIn</a>
              </div>
              <div style="margin-bottom:16px;">
                <a href="${BASE_URL}" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};">proofpress.ai</a>
                <span style="color:${MUTED};margin:0 8px;">·</span>
                <a href="${FORUM_URL}" style="font-size:12px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F_SANS};">Prompt Collection</a>
              </div>
              <div style="border-top:1px solid ${BORDER};padding-top:16px;margin-top:4px;">
                <div style="font-size:11px;color:${MUTED};font-family:${F_SANS};line-height:1.8;margin-bottom:12px;">
                  Hai ricevuto questa email perché sei iscritto alla newsletter Proof Press.<br>
                  Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
                </div>
                <a href="${BASE_URL}/preferenze-newsletter" style="font-size:11px;color:${BLACK};text-decoration:underline;font-weight:600;font-family:${F_SANS};">Gestisci preferenze</a>
                <span style="color:${MUTED};margin:0 8px;">·</span>
                <a href="${unsubscribeUrl}" style="font-size:11px;color:${ACCENT};text-decoration:underline;font-weight:600;font-family:${F_SANS};">Cancella iscrizione</a>
              </div>
              <div style="margin-top:16px;padding-top:12px;border-top:1px solid ${BORDER};">
                <div style="font-size:10px;color:${MUTED};font-family:${F_SANS};margin-bottom:4px;">© 2026 Proof Press · Un progetto <a href="https://proofpress.ai/chi-siamo" style="color:${MUTED};text-decoration:underline;">AxiomX LLC</a> · USA</div>
                <div style="font-size:10px;color:${ACCENT};font-weight:700;font-family:${F_SANS};letter-spacing:0.06em;">✓ PROOFPRESS VERIFY TECHNOLOGY</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:32px;"></td></tr>`;

  // ═══════════════════════════════════════════════════════════════
  // ASSEMBLE
  // ═══════════════════════════════════════════════════════════════
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI4Business News by ProofPress — ${dateLabel}</title>
  <!--[if mso]><style>table{border-collapse:collapse;}td{font-family:Helvetica,Arial,sans-serif;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${F_SANS};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:24px 0 48px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;">
        ${headerHtml}
        ${rebrandHtml}
        ${heroHtml}
        ${consigliatoHtml1}
        ${channelBlocksHtml}
        ${startupHtml}
        ${promptPromoHtml}
        ${bannerHtml1}
        ${iscrizioneHtml}
        ${eventsHtml}
        ${quickLinksHtml}
        ${researchBoxHtml}
        ${ctaSectionHtml}
        ${consigliatoHtml2}
        ${bannerHtml2}
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

  const [primarySponsor, spotlightSponsor, amazonDeals, startupDay, events, newsletterBanners] = await Promise.all([
    getActiveSponsor("primary"),
    getActiveSponsor("spotlight"),
    getTodayAmazonDeals(),
    getTodayStartup(),
    getUpcomingEvents(4),
    getNewsletterBanners(),
  ]);

  console.log(`  Banner newsletter: ${newsletterBanners.length} (${newsletterBanners.map(b => b.name).join(", ")})`);

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

  // ── Fetch immagini Pexels per hero e canali principali ──
  const PEXELS_QUERIES: Record<string, string> = {
    ai: "artificial intelligence circuit board",
    startup: "startup office business meeting",
    research: "scientific research laboratory innovation",
    dealroom: "business boardroom investment",
    "verified-ai-news": "data verification technology",
    "make-money-with-ai": "finance technology trading",
    "copy-paste-ai": "productivity workspace laptop",
    "daily-ai-tools": "technology tools digital",
    "automate-with-ai": "automation workflow robot",
    "ai-opportunities": "career opportunity growth",
  };
  let heroImageUrl: string | null = null;
  const channelImages: Record<string, string | null> = {};
  try {
    const { findEditorialImage } = await import("./stockImages");
    const heroItem = content.breakingItems[0] || content.aiNews[0];
    if (heroItem) {
      heroImageUrl = await findEditorialImage(heroItem.title, "breaking news ai", "ai").catch(() => null);
    }
    for (const ch of ALL_CHANNELS_V2.slice(1, 6)) {
      const section = (ch.key === "startup" || ch.key === "dealroom") ? "startup" : "ai";
      channelImages[ch.key] = await findEditorialImage(
        PEXELS_QUERIES[ch.key] || ch.label, ch.key, section
      ).catch(() => null);
    }
  } catch (e) {
    console.warn("[Newsletter] Pexels fetch skipped:", e);
  }

  const subject = `AI4Business News by ProofPress — ${dateLabel}`;

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
    heroImageUrl,
    channelImages,
    newsletterBanners,
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

// NOTA: il guard in-memory è stato sostituito con un controllo DB-based
// per resistere ai riavvii del server (il guard in-memory si azzera ad ogni restart).
const testSentDays = new Map<string, boolean>();

/**
 * Verifica nel DB se la newsletter unificata è già stata inviata oggi con successo.
 * Usa la data CET (Europe/Rome) per evitare problemi di fuso orario.
 */
async function hasAlreadySentTodayDB(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    // Calcola inizio giornata in CET
    const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const todayLabel = nowCET.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" }); // YYYY-MM-DD
    const todayStart = new Date(todayLabel + "T00:00:00+01:00");
    const todayEnd = new Date(todayLabel + "T23:59:59+01:00");
    const existing = await db
      .select({ id: newsletterSendsTable.id, recipientCount: newsletterSendsTable.recipientCount })
      .from(newsletterSendsTable)
      .where(
        and(
          gte(newsletterSendsTable.createdAt, todayStart),
          lt(newsletterSendsTable.createdAt, todayEnd),
          eq(newsletterSendsTable.status, "sent"),
          gt(newsletterSendsTable.recipientCount, 0)
        )
      )
      .limit(1);
    return existing.length > 0;
  } catch {
    return false;
  }
}

/**
 * Invia una preview (bozza) della newsletter a ac@acinelli.com
 */
export async function sendUnifiedPreview(force = false): Promise<{
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

  // ── Guard in-memory (resiste entro la stessa sessione) ───────────────────
  if (!force && testSentDays.get(testKey)) {
    console.log(
      `[UnifiedNewsletter] Preview già inviata oggi (${dayKey}), skip (guard in-memory)`
    );
    return {
      success: true,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
    };
  }
  if (force) {
    console.log(`[UnifiedNewsletter] ⚡ Force mode: bypass guard in-memory per ${dayKey}`);
    testSentDays.delete(testKey); // reset guard
  }

  //  // ── Guard DB-level (resiste ai riavvii del server) ───────────────────
  // Controlla se esiste già un record pending/approved/sending/sent per oggi.
  // Usa SQL CURDATE() in CET per evitare race condition su restart multipli ravvicinati.
  // NOTA: il guard usa DATE(createdAt) = CURDATE() lato DB (fuso orario server = UTC)
  // ma poiché la preview viene schedulata alle 14:30 UTC (= 16:30 CET) questo è corretto.
  try {
    const dbGuard = await getDb();
    if (dbGuard) {
      // Usa query SQL diretta per massima affidabilità (evita conversioni timezone JS)
      const rawGuard = await dbGuard.execute(
        sql`SELECT id, status FROM newsletter_sends 
         WHERE DATE(createdAt) = CURDATE() 
         AND status IN ('pending','approved','sending','sent') 
         LIMIT 1`
      ) as any;
      // drizzle-orm con mysql2 restituisce [rows, fields] — estraiamo le righe correttamente
      const existingToday: any[] = Array.isArray(rawGuard)
        ? (Array.isArray(rawGuard[0]) ? rawGuard[0] : rawGuard)
        : [];
      // Filtra record corrotti (id undefined) che causerebbero falsi positivi
      const validRecords = existingToday.filter((r: any) => r && r.id !== undefined && r.id !== null);
      if (!force && validRecords.length > 0) {
        console.log(
          `[UnifiedNewsletter] 🔒 Preview bloccata (guard DB): esiste già un record oggi (id=${validRecords[0].id}, status=${validRecords[0].status}) — skip`
        );
        testSentDays.set(testKey, true); // aggiorna anche il guard in-memory
        return {
          success: true,
          subject: "",
          stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
        };
      }
      if (force && validRecords.length > 0) {
        console.log(`[UnifiedNewsletter] ⚡ Force mode: guard DB bypassato (record esistente id=${validRecords[0].id})`);
      }
    }
  } catch (guardErr) {
    console.warn(`[UnifiedNewsletter] ⚠️ Guard DB preview fallito (continuo):`, guardErr);
  }

  console.log(`[UnifiedNewsletter] 📧 Preview → ${TEST_EMAILS.join(", ")}`);
  try {
    const { html, subject, stats } = await buildUnifiedNewsletter(true);

    // ── Genera token di approvazione e salva record pending nel DB ──────────
    // USA INSERT IGNORE + send_date per garantire atomicità a livello DB:
    // se esiste già un record con lo stesso (send_date, section), il DB rifiuta
    // silenziosamente l'INSERT senza errori — nessun duplicato possibile.
    const { randomBytes } = await import("crypto");
    const approvalToken = randomBytes(32).toString("hex");
    const approvalUrl = `https://proofpress.ai/api/newsletter/approve/${approvalToken}`;

    // Calcola send_date in CET (Europe/Rome) per coerenza con il fuso orario editoriale
    const sendDateCET = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" }); // YYYY-MM-DD

    const db = await getDb();
    if (db) {
      // INSERT IGNORE: se (send_date, section) già esiste, la riga viene scartata dal DB
      // senza lanciare eccezioni. Questo è il lock atomico definitivo contro i duplicati.
      const insertResult = await db.execute(
        sql`INSERT IGNORE INTO newsletter_sends 
         (subject, htmlContent, recipientCount, status, approvalToken, send_date, section, createdAt)
         VALUES (${subject}, ${html}, 0, 'pending', ${approvalToken}, ${sendDateCET}, 'ai4business', NOW())`
      ) as any;
      const inserted = insertResult?.rowsAffected ?? insertResult?.affectedRows ?? (Array.isArray(insertResult) ? (insertResult[0] as any)?.affectedRows : 0) ?? 0;
      if (inserted === 0) {
        // Un altro processo ha già inserito il record per oggi — abort silenzioso
        console.log(`[UnifiedNewsletter] 🔒 INSERT IGNORE: record per ${sendDateCET} già esistente — skip atomico`);
        testSentDays.set(testKey, true);
        return {
          success: true,
          subject: "",
          stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
        };
      }
      console.log(`[UnifiedNewsletter] 📝 Record pending salvato nel DB (send_date: ${sendDateCET}, token: ${approvalToken.slice(0, 8)}...)`);
    }

    // ── Banner di approvazione nell'email preview ────────────────────────────
    const approvalBanner = `
      <div style="background:#fff3cd;border:2px solid #ffc107;border-radius:12px;padding:20px 24px;margin:0 0 0;text-align:center;">
        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;font-weight:700;color:#856404;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">⚠️ BOZZA — In attesa di approvazione</p>
        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;color:#1d1d1f;margin:0 0 16px;">Clicca il pulsante per approvare l'invio massivo alle <strong>22:00 CET</strong> a tutti gli iscritti.</p>
        <a href="${approvalUrl}" style="display:inline-block;background:#1d1d1f;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:980px;">✅ Approva e Invia Newsletter</a>
        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;color:#856404;margin:12px 0 0;">Senza approvazione, la newsletter <strong>NON</strong> verrà inviata alle 22:00.</p>
      </div>
    `;
    // Inserisce il banner subito dopo il tag <body>
    const htmlWithApproval = html.replace(/<body([^>]*)>/, `<body$1>${approvalBanner}`);

    const sendResults = await Promise.all(
      TEST_EMAILS.map(email => sendEmail({ sender: 'daily', to: email, subject: `[BOZZA - APPROVAZIONE RICHIESTA] ${subject}`, html: htmlWithApproval }))
    );
    const allSuccess = sendResults.every(r => r.success);
    const result = sendResults[0];
    if (allSuccess) {
      testSentDays.set(testKey, true);
      console.log(`[UnifiedNewsletter] ✅ Preview inviata a ${TEST_EMAILS.join(", ")} con link approvazione`);

      const channelStats = stats.channels
        ? Object.entries(stats.channels)
            .filter(([, count]) => count > 0)
            .map(([key, count]) => `${key}: ${count}`)
            .join(", ")
        : "nessuno";

      await notifyOwner({
        title: `👁️ Bozza AI4Business News by ProofPress — ${new Date().toLocaleDateString("it-IT")} — APPROVAZIONE RICHIESTA`,
        content: `Bozza newsletter inviata a ${TEST_EMAILS.join(", ")}.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.\nCanali: ${channelStats}\n\n🔗 Approva qui: ${approvalUrl}`,
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
    const result = await sendEmail({ sender: 'daily', to: toEmail, subject, html });

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
  // ── Guard approvazione obbligatoria ─────────────────────────────────────
  // Controlla se esiste un record 'pending' approvato oggi
  const db = await getDb();
  if (db) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── RECOVERY: record 'sending' bloccati (riavvio server durante invio) ──
    // Se un record è rimasto in 'sending' da più di 30 minuti senza sentAt,
    // significa che il server si è riavviato durante l'invio.
    // Lo resettiamo a 'approved' per permettere il reinvio automatico.
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const stuckSending = await db
        .select({ id: newsletterSendsTable.id, subject: newsletterSendsTable.subject })
        .from(newsletterSendsTable)
        .where(
          and(
            eq(newsletterSendsTable.status, 'sending'),
            gte(newsletterSendsTable.createdAt, today),
            sql`${newsletterSendsTable.sentAt} IS NULL`,
            sql`${newsletterSendsTable.createdAt} < ${thirtyMinutesAgo.toISOString().replace('T', ' ').slice(0, 19)}`
          )
        )
        .limit(1);
      if (stuckSending.length > 0) {
        await db.execute(
          sql`UPDATE newsletter_sends SET status = 'approved' WHERE status = 'sending' AND sentAt IS NULL AND DATE(createdAt) = CURDATE() AND createdAt < DATE_SUB(NOW(), INTERVAL 30 MINUTE) LIMIT 1`
        );
        console.log(`[UnifiedNewsletter] 🔄 Recovery: record 'sending' bloccato (id=${stuckSending[0].id}) resettato a 'approved' — riprovo l'invio`);
        try {
          await notifyOwner({ title: '⚠️ Newsletter: recovery invio bloccato', content: `Il record "${stuckSending[0].subject}" era bloccato in stato 'sending' (riavvio server). Resettato a 'approved' — invio ripreso automaticamente.` });
        } catch {}
      }
    } catch (recoveryErr) {
      console.warn('[UnifiedNewsletter] ⚠️ Recovery sending bloccato fallito (non critico):', recoveryErr);
    }

    const pendingApproved = await db
      .select()
      .from(newsletterSendsTable)
      .where(
        and(
          eq(newsletterSendsTable.status, "approved"),
          gte(newsletterSendsTable.createdAt, today)
        )
      )
      .limit(1);

    if (pendingApproved.length === 0) {
      const now = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });
      console.log(`[UnifiedNewsletter] 🔒 Invio bloccato: nessuna approvazione ricevuta per oggi (${now})`);
      try {
        await sendEmail({
        sender: 'daily',
          to: "ac@acinelli.com",
          subject: `🔒 [ProofPress] Newsletter NON inviata — approvazione mancante (${now})`,
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px;"><h2 style="color:#1d1d1f;font-size:20px;margin:0 0 16px;">Newsletter bloccata</h2><p style="color:#3a3a3c;font-size:15px;margin:0 0 12px;">La newsletter <strong>AI4Business News by ProofPress</strong> delle 22:00 <strong>non è stata inviata</strong> perché non è stata ricevuta l'approvazione.</p><p style="color:#3a3a3c;font-size:15px;margin:0;">Controlla l'email di preview delle 19:30 e clicca il pulsante <strong>"Approva e Invia"</strong> per autorizzare l'invio.</p></div>`,
        });
      } catch {}
      return {
        success: false,
        recipientCount: 0,
        subject: "",
        stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
        error: "Invio bloccato: approvazione non ricevuta",
      };
    }

    // ── LOCK ATOMICO DB-LEVEL: approved → sending ─────────────────────────
    // Previene invii multipli anche in caso di riavvii del processo.
    // Solo il processo che riesce ad aggiornare il record procede con l'invio.
    try {
      const lockResult = await db.execute(
        sql`UPDATE newsletter_sends SET status = 'sending' WHERE status = 'approved' AND DATE(createdAt) = CURDATE() LIMIT 1`
      );
      const rowsAffected = (lockResult as any).rowsAffected ?? (lockResult as any)[0]?.affectedRows ?? 0;
      if (rowsAffected === 0) {
        console.log(`[UnifiedNewsletter] 🔒 Lock atomico: un altro processo ha già preso il lock (0 righe aggiornate) — skip`);
        return {
          success: true,
          recipientCount: 0,
          subject: "",
          stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
        };
      }
      console.log(`[UnifiedNewsletter] ✅ Lock atomico acquisito — procedo con l'invio`);
    } catch (lockErr) {
      console.error(`[UnifiedNewsletter] ⚠️ Errore lock atomico (continuo con guard standard):`, lockErr);
    }
  }

  // Guard anti-duplicati basato su DB (resiste ai riavvii del server)
  const alreadySent = await hasAlreadySentTodayDB();
  if (alreadySent) {
    const blockedAt = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });
    console.log(
      `[UnifiedNewsletter] ⚠️ Newsletter già inviata oggi (trovata nel DB con recipientCount > 0), skip per evitare duplicati`
    );
    // Alert email immediato: notifica ac@acinelli.com che il guard ha bloccato un invio duplicato
    try {
      await sendEmail({
        sender: 'daily',
        to: "ac@acinelli.com",
        subject: `⚠️ [ProofPress] Invio newsletter bloccato — duplicato rilevato (${blockedAt})`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <div style="background:#1a1a1a;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;">
              <strong style="font-size:16px;">ProofPress — Alert Anti-Duplicati</strong>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
              <p style="margin:0 0 12px;font-size:15px;color:#1a1a1a;">Il sistema ha rilevato un tentativo di invio duplicato della newsletter <strong>AI4Business News by ProofPress</strong> ed ha bloccato automaticamente l'operazione.</p>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;color:#6b7280;width:40%;">Data/Ora blocco</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1a1a1a;">${blockedAt}</td></tr>
                <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;color:#6b7280;">Motivo</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#1a1a1a;">Trovato invio già completato oggi nel DB (status=sent, recipientCount&gt;0)</td></tr>
                <tr><td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;color:#6b7280;">Azione</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#16a34a;"><strong>Invio bloccato automaticamente &#10003;</strong> — nessuna email inviata agli iscritti</td></tr>
              </table>
              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Questo alert viene inviato ogni volta che il guard anti-duplicati interviene. Se ricevi questo messaggio inaspettatamente, controlla i log dello scheduler.</p>
            </div>
          </div>
        `,
      });
      console.log(`[UnifiedNewsletter] 📧 Alert duplicato inviato a ac@acinelli.com`);
    } catch (alertErr) {
      console.error(`[UnifiedNewsletter] Errore invio alert duplicato:`, alertErr);
    }
    return {
      success: true,
      recipientCount: 0,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
    };
  }

  console.log(`[UnifiedNewsletter] 📧 Invio massivo AI4Business News by ProofPress v2...`);

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

    // ── Garantire che l'owner riceva sempre la newsletter ─────────────────────
    // ac@acinelli.com viene iniettato come destinatario fisso indipendentemente
    // dallo status nel DB (active/unsubscribed/etc.)
    const OWNER_FORCED_EMAIL = "ac@acinelli.com";
    const ownerAlreadyIn = subscribers.some(
      (s) => s.email.toLowerCase() === OWNER_FORCED_EMAIL.toLowerCase()
    );
    if (!ownerAlreadyIn) {
      subscribers.push({
        id: 90001,
        email: OWNER_FORCED_EMAIL,
        name: "Andrea Cinelli",
        status: "active",
        source: "owner",
        subscribedAt: new Date(),
        unsubscribedAt: null,
        unsubscribeToken: null,
        totalSent: 0,
        totalOpened: 0,
        lastSentAt: null,
        lastOpenedAt: null,
        newsletter: "ai4business",
        channels: null,
      } as any);
      console.log(`[UnifiedNewsletter] 🔒 Owner ${OWNER_FORCED_EMAIL} iniettato come destinatario fisso`);
    }
    // ─────────────────────────────────────────────────────────────────────────

    console.log(`[UnifiedNewsletter] ${subscribers.length} iscritti attivi`);

    const { html: baseHtml, subject, stats, sponsorIds } =
      await buildUnifiedNewsletter(false);

    const newsletterId = await createNewsletterSend({
      subject,
      htmlContent: baseHtml,
      recipientCount: 0,
    });

    // Aggiorna il link "Leggi nel browser" con l'ID reale della newsletter
    const finalBaseHtml = newsletterId
      ? baseHtml.replace(
          `${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=header_browser`,
          `${BASE_URL}/newsletter/${newsletterId}?utm_source=newsletter&utm_medium=email&utm_campaign=header_browser`
        )
      : baseHtml;

    let sendError: string | undefined;
    const warmupResult = await sendWithWarmup(
      subscribers,
      async (sub) => {
        const unsubUrl = sub.unsubscribeToken
          ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/unsubscribe`;
        const prefsUrl = sub.unsubscribeToken
          ? `${BASE_URL}/preferenze-newsletter?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/preferenze-newsletter`;
        const personalizedHtml = finalBaseHtml
          .replace(`${BASE_URL}/unsubscribe`, unsubUrl)
          .replace(`${BASE_URL}/preferenze-newsletter`, prefsUrl);
        const result = await sendEmail({
          sender: 'daily',
          to: sub.email,
          subject,
          html: personalizedHtml,
          listUnsubscribeUrl: unsubUrl,
        });
        if (!result.success) sendError = result.error;
        return result;
      },
      '[UnifiedNewsletter]'
    );
    const totalSent = warmupResult.totalSent;

    await updateNewsletterSendRecipientCount(subject, totalSent);
    // Il guard DB-based non richiede aggiornamento manuale:
    // il record in newsletter_sends con status='sent' e recipientCount>0 funge da lock.

    for (const sid of sponsorIds) {
      await markSponsorSent(sid);
    }

     await notifyOwner({
      title: `📧 AI4Business News by ProofPress inviata — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Newsletter v2 inviata a ${totalSent}/${subscribers.length} iscritti.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.`,
    });
    // ── Report post-invio a +1h ──────────────────────────────────────────────
    schedulePostSendReport({
      subject,
      recipientCount: totalSent,
      sendDate: new Date(),
      delayMs: 60 * 60 * 1000, // 1 ora
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
        title: `❌ Errore AI4Business News by ProofPress — ${new Date().toLocaleDateString("it-IT")}`,
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

/**
 * Invia la newsletter mattutina "Le News delle 8.30 di ProofPress"
 * a tutti gli iscritti attivi — SENZA approvazione richiesta.
 * Schedulata alle 08:30 CET ogni giorno tranne sabato (cron: 30 8 * * 0-5).
 */
export async function sendMorningNewsletterToAll(): Promise<{
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
  // Guard anti-duplicati DB-based: evita doppio invio in caso di riavvii
  const alreadySent = await hasAlreadySentTodayDB();
  if (alreadySent) {
    const blockedAt = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });
    console.log(`[MorningNewsletter] ⚠️ Newsletter già inviata oggi — skip (${blockedAt})`);
    return {
      success: true,
      recipientCount: 0,
      subject: "",
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
    };
  }

  const now = new Date();
  const dateLabel = getDateLabel(now);
  const MORNING_SUBJECT = `Le News delle 8.30 di ProofPress — ${dateLabel}`;

  console.log(`[MorningNewsletter] 📧 Avvio invio automatico "${MORNING_SUBJECT}"...`);

  try {
    const subscribers = await getActiveSubscribers();
    if (subscribers.length === 0) {
      return {
        success: false,
        recipientCount: 0,
        subject: MORNING_SUBJECT,
        stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
        error: "Nessun iscritto attivo",
      };
    }

    // Garantisce che ac@acinelli.com riceva sempre la newsletter
    const OWNER_FORCED_EMAIL = "ac@acinelli.com";
    const ownerAlreadyIn = subscribers.some(
      (s) => s.email.toLowerCase() === OWNER_FORCED_EMAIL.toLowerCase()
    );
    if (!ownerAlreadyIn) {
      subscribers.push({
        id: 90001,
        email: OWNER_FORCED_EMAIL,
        name: "Andrea Cinelli",
        status: "active",
        source: "owner",
        subscribedAt: new Date(),
        unsubscribedAt: null,
        unsubscribeToken: null,
        totalSent: 0,
        totalOpened: 0,
        lastSentAt: null,
        lastOpenedAt: null,
        newsletter: "ai4business",
        channels: null,
      } as any);
      console.log(`[MorningNewsletter] 🔒 Owner ${OWNER_FORCED_EMAIL} iniettato come destinatario fisso`);
    }

    console.log(`[MorningNewsletter] ${subscribers.length} iscritti attivi`);

    // Costruisce la newsletter con il titolo personalizzato
    const { html: baseHtml, stats, sponsorIds } = await buildUnifiedNewsletter(false);

    // Sovrascrive il subject con il titolo mattutino
    const subject = MORNING_SUBJECT;

    const newsletterId = await createNewsletterSend({
      subject,
      htmlContent: baseHtml,
      recipientCount: 0,
    });

    // Aggiorna il link "Leggi nel browser" con l'ID reale
    const finalBaseHtml = newsletterId
      ? baseHtml.replace(
          `${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=header_browser`,
          `${BASE_URL}/newsletter/${newsletterId}?utm_source=newsletter&utm_medium=email&utm_campaign=header_browser`
        )
      : baseHtml;

    let sendError: string | undefined;
    const warmupResult = await sendWithWarmup(
      subscribers,
      async (sub) => {
        const unsubUrl = sub.unsubscribeToken
          ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/unsubscribe`;
        const prefsUrl = sub.unsubscribeToken
          ? `${BASE_URL}/preferenze-newsletter?token=${sub.unsubscribeToken}`
          : `${BASE_URL}/preferenze-newsletter`;
        const personalizedHtml = finalBaseHtml
          .replace(`${BASE_URL}/unsubscribe`, unsubUrl)
          .replace(`${BASE_URL}/preferenze-newsletter`, prefsUrl);
        const result = await sendEmail({
          sender: 'daily',
          to: sub.email,
          subject,
          html: personalizedHtml,
          listUnsubscribeUrl: unsubUrl,
        });
        if (!result.success) sendError = result.error;
        return result;
      },
      '[MorningNewsletter]'
    );
    const totalSent = warmupResult.totalSent;

    await updateNewsletterSendRecipientCount(subject, totalSent);

    for (const sid of sponsorIds) {
      await markSponsorSent(sid);
    }

    await notifyOwner({
      title: `📧 Le News delle 8.30 di ProofPress — ${new Date().toLocaleDateString("it-IT")}`,
      content: `Newsletter mattutina inviata a ${totalSent}/${subscribers.length} iscritti.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.`,
    });

    schedulePostSendReport({
      subject,
      recipientCount: totalSent,
      sendDate: new Date(),
      delayMs: 60 * 60 * 1000, // 1 ora
    });

    console.log(`[MorningNewsletter] ✅ ${totalSent}/${subscribers.length} inviati — "${subject}"`);

    return {
      success: !sendError,
      recipientCount: totalSent,
      subject,
      stats: {
        ai: stats.ai,
        startup: stats.startup,
        dealroom: stats.dealroom,
        breaking: stats.breaking,
        research: stats.research,
      },
      error: sendError,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[MorningNewsletter] ❌ Errore critico:`, msg);

    try {
      await notifyOwner({
        title: `❌ Errore Le News delle 8.30 — ${new Date().toLocaleDateString("it-IT")}`,
        content: `Errore durante l'invio della newsletter mattutina: ${msg}`,
      });
    } catch {}

    return {
      success: false,
      recipientCount: 0,
      subject: MORNING_SUBJECT,
      stats: { ai: 0, startup: 0, dealroom: 0, breaking: 0, research: 0 },
      error: msg,
    };
  }
}
