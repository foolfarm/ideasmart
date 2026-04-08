/**
 * unifiedNewsletter.ts — Newsletter Unica IDEASMART
 * ─────────────────────────────────────────────────────────────────────────────
 * Una sola newsletter (Lun/Mer/Ven) con struttura a 7 blocchi:
 *   1. Cover + data + "Leggi online"
 *   2. Anticipazione 20 notizie con link interni a ideasmart.biz
 *   3. Sponsor Primario (promozione Prompt Ideasmart)
 *   4. Breaking News (fino a 5, urgency score, link interni)
 *   5. Canale a rotazione (13 canali, fino a 10 notizie, link interni)
 *   6. Amazon Deal del Giorno
 *   7. Footer + unsubscribe GDPR
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
} from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// ─── Config ─────────────────────────────────────────────────────────────────

const BASE_URL = "https://ideasmart.biz";
const TEST_EMAIL = "ac@acinelli.com";
const TEST_EMAILS = ["ac@acinelli.com"]; // Preview solo ad Andrea Cinelli

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

// ─── Channel Content Item ────────────────────────────────────────────────

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

const NEWSLETTER_CHANNELS = [
  { key: "copy-paste-ai", label: "PROMPT AI", title: "Prompt del Giorno", emoji: "\uD83D\uDCCB" },
  { key: "make-money-with-ai", label: "FARE SOLDI", title: "Opportunit\u00E0 di Guadagno", emoji: "\uD83D\uDCB0" },
  { key: "automate-with-ai", label: "USE CASE AI", title: "Workflow & Automazioni", emoji: "\u26A1" },
  { key: "daily-ai-tools", label: "AI TOOLS", title: "Strumenti AI del Giorno", emoji: "\uD83D\uDEE0\uFE0F" },
  { key: "verified-ai-news", label: "AI RADAR", title: "News Verificate", emoji: "\uD83D\uDCE1" },
  { key: "ai-opportunities", label: "AI INVEST", title: "Opportunit\u00E0 di Investimento", emoji: "\uD83D\uDCC8" },
] as const;

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

async function getTodayAmazonDeals(): Promise<AmazonDealData[]> {
  const db = await getDb();
  if (!db) return [];

  const today = new Date().toISOString().slice(0, 10);

  const todayDeals = await db
    .select()
    .from(amazonDailyDeals)
    .where(
      and(
        eq(amazonDailyDeals.scheduledDate, today),
        eq(amazonDailyDeals.active, true)
      )
    )
    .limit(2);

  if (todayDeals.length > 0) {
    return todayDeals.map((d) => ({
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

  const latestDeals = await db
    .select()
    .from(amazonDailyDeals)
    .where(eq(amazonDailyDeals.active, true))
    .orderBy(desc(amazonDailyDeals.scheduledDate))
    .limit(2);

  return latestDeals.map((d) => ({
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

// ─── Approved Tool Submissions for Newsletter ──────────────────────────────

async function getApprovedToolsForNewsletter(): Promise<{ name: string; url: string; description: string; emoji?: string }[]> {
  const db = await getDb();
  if (!db) return [];

  const today = new Date().toISOString().slice(0, 10);

  const tools = await db
    .select()
    .from(toolSubmissions)
    .where(
      and(
        eq(toolSubmissions.status, "approved"),
        eq(toolSubmissions.featuredDate, today)
      )
    )
    .limit(8);

  return tools.map((t) => ({
    name: t.toolName,
    url: t.toolUrl,
    description: t.shortDescription || t.description || "",
    emoji: t.emoji ?? undefined,
  }));
}

// ─── Open Source Tools for Newsletter ───────────────────────────────────────

async function getOpenSourceToolsForNewsletter(): Promise<{ name: string; url: string; description: string; stars: number | null; language: string | null }[]> {
  const db = await getDb();
  if (!db) return [];

  const today = new Date().toISOString().slice(0, 10);

  let tools = await db
    .select()
    .from(openSourceTools)
    .where(
      and(
        eq(openSourceTools.active, true),
        eq(openSourceTools.featuredDate, today)
      )
    )
    .limit(5);

  if (tools.length === 0) {
    tools = await db
      .select()
      .from(openSourceTools)
      .where(eq(openSourceTools.active, true))
      .orderBy(desc(openSourceTools.createdAt))
      .limit(5);
  }

  return tools.map((t) => ({
    name: t.name,
    url: t.repoUrl,
    description: t.description,
    stars: t.stars,
    language: t.category,
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

  // Fetch contenuti dei canali (fino a 10 per canale per il canale del giorno)
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

// ─── HTML Template Builder ──────────────────────────────────────────────────

interface ToolItem {
  name: string;
  url: string;
  description: string;
  emoji?: string;
}

interface OSToolItem {
  name: string;
  url: string;
  description: string;
  stars: number | null;
  language: string | null;
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

// ─── 13 canali per la rotazione ─────────────────────────────────────────────
const ALL_CHANNELS = [
  { key: "ai",                label: "AI NEWS",           title: "Le Notizie AI del Giorno",       emoji: "🤖", color: "#1a1a1a", path: "/ai",                isSection: true  },
  { key: "copy-paste-ai",     label: "PROMPT AI",         title: "Prompt del Giorno",              emoji: "📋", color: "#7c3aed", path: "/copy-paste-ai",     isSection: false },
  { key: "automate-with-ai",  label: "USE CASE AI",       title: "Workflow & Automazioni",         emoji: "⚡", color: "#d97706", path: "/automate-with-ai",  isSection: false },
  { key: "make-money-with-ai",label: "FARE SOLDI",        title: "Opportunità di Guadagno",        emoji: "💰", color: "#059669", path: "/make-money-with-ai",isSection: false },
  { key: "daily-ai-tools",    label: "AI TOOLS",          title: "Strumenti AI del Giorno",        emoji: "🛠️", color: "#2563eb", path: "/daily-ai-tools",    isSection: false },
  { key: "verified-ai-news",  label: "PROOFPRESS VERIFY", title: "News Verificate",                emoji: "📡", color: "#dc2626", path: "/verified-ai-news",  isSection: false },
  { key: "ai-opportunities",  label: "AI INVEST",         title: "Opportunità di Investimento",    emoji: "📈", color: "#0d6e3f", path: "/ai-opportunities",  isSection: false },
  { key: "research",          label: "AI RESEARCH",       title: "Ricerche & Analisi AI",          emoji: "🔬", color: "#0066cc", path: "/research",          isSection: true  },
  { key: "dealroom",          label: "AI VENTURE",        title: "Deal & Funding",                 emoji: "💼", color: "#7c3aed", path: "/dealroom",          isSection: true  },
  { key: "ai-invest",         label: "AI INVEST",         title: "Investimenti AI",                emoji: "🏛️", color: "#0d6e3f", path: "/ai-invest",         isSection: false },
  { key: "startup",           label: "AI STARTUP NEWS",   title: "Startup da Tenere d'Occhio",     emoji: "🚀", color: "#ea580c", path: "/startup",           isSection: true  },
  { key: "dealflow",          label: "AI DEALFLOW",       title: "Round, Funding & M&A",           emoji: "🏦", color: "#0891b2", path: "/dealflow",          isSection: false },
  { key: "ai-radar",          label: "AI RADAR",          title: "Radar Notizie Verificate",       emoji: "📡", color: "#dc2626", path: "/ai-radar",          isSection: false },
];

function buildUnifiedNewsletterHtml(opts: {
  dateLabel: string;
  aiNews: NewsItem[];
  startupNews: NewsItem[];
  dealroomNews: NewsItem[];
  breakingItems: BreakingItem[];
  researches: ResearchItem[];
  primarySponsor: SponsorData | null;
  spotlightSponsor: SponsorData | null;
  amazonDeals: AmazonDealData[];
  approvedTools: ToolItem[];
  osTools: OSToolItem[];
  channelContents: Record<string, ChannelItem[]>;
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
    amazonDeals,
    channelContents,
    unsubscribeUrl,
    isTest,
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
  const ACCENT = "#e84c30";
  const AMAZON_ORANGE = "#FF9900";

  // ── Rotazione canale del giorno (13 canali) ──
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const todayChannel = ALL_CHANNELS[dayOfYear % ALL_CHANNELS.length];

  // ══════════════════════════════════════════════════════════════════
  // BLOCCO 2: Anticipazione 20 notizie — TUTTI I LINK INTERNI
  // ══════════════════════════════════════════════════════════════════
  interface BulletItem { title: string; url: string; emoji: string; label: string; }
  const bulletItems: BulletItem[] = [];

  // Breaking news (max 5) — link interni
  const breakingEmojis = ["🔴", "⚡", "🚨", "🔥", "⚠️"];
  breakingItems.slice(0, 5).forEach((b, i) => {
    const url = b.id ? `${BASE_URL}/ai/news/${b.id}` : `${BASE_URL}/ai`;
    bulletItems.push({ title: b.title, url, emoji: breakingEmojis[i % breakingEmojis.length], label: "BREAKING" });
  });

  // AI News (max 4) — link interni
  aiNews.slice(0, 4).forEach((n, i) => {
    const url = n.id ? `${BASE_URL}/ai/news/${n.id}` : `${BASE_URL}/ai`;
    bulletItems.push({ title: n.title, url, emoji: ["🤖","💡","🔍","🌐"][i % 4], label: "AI NEWS" });
  });

  // Startup News (max 3) — link interni
  startupNews.slice(0, 3).forEach((n, i) => {
    const url = n.id ? `${BASE_URL}/startup/news/${n.id}` : `${BASE_URL}/startup`;
    bulletItems.push({ title: n.title, url, emoji: ["🚀","💼","🏢"][i % 3], label: "STARTUP" });
  });

  // Dealroom (max 3) — link interni
  dealroomNews.slice(0, 3).forEach((n, i) => {
    const url = n.id ? `${BASE_URL}/dealroom/news/${n.id}` : `${BASE_URL}/dealroom`;
    bulletItems.push({ title: n.title, url, emoji: ["💰","📈","🤝"][i % 3], label: "DEAL" });
  });

  // Research (max 2) — link interni
  researches.slice(0, 2).forEach((r) => {
    const url = r.id ? `${BASE_URL}/research/${r.id}` : `${BASE_URL}/research`;
    bulletItems.push({ title: r.title, url, emoji: "🔬", label: "RESEARCH" });
  });

  // Canali (fino a completare 20) — link interni
  const channelOrder = ["copy-paste-ai","make-money-with-ai","automate-with-ai","daily-ai-tools","verified-ai-news","ai-opportunities"];
  for (const chKey of channelOrder) {
    if (bulletItems.length >= 20) break;
    const chItems = channelContents[chKey] || [];
    const chMeta = ALL_CHANNELS.find(c => c.key === chKey);
    if (chItems.length > 0 && chMeta) {
      bulletItems.push({
        title: chItems[0].title,
        url: `${BASE_URL}${chMeta.path}`,
        emoji: chMeta.emoji,
        label: chMeta.label,
      });
    }
  }

  const bulletHtml = bulletItems.slice(0, 20).map((item) => `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid ${BORDER};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="70" style="vertical-align:top;padding-top:2px;">
              <span style="font-size:10px;font-weight:700;color:${WHITE};background:${BLACK};border-radius:3px;padding:2px 6px;letter-spacing:0.06em;text-transform:uppercase;font-family:${F};white-space:nowrap;">${item.label}</span>
            </td>
            <td style="vertical-align:top;padding-left:10px;">
              <a href="${item.url}" style="font-size:14px;font-weight:600;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.4;">${item.emoji} ${item.title}</a>
              <div style="margin-top:2px;"><a href="${item.url}" style="font-size:11px;color:${ACCENT};font-family:${F};text-decoration:none;font-weight:600;">Approfondisci su Ideasmart →</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  // ══════════════════════════════════════════════════════════════════
  // BLOCCO 4: Breaking News (fino a 5, link interni)
  // ══════════════════════════════════════════════════════════════════
  function buildBreakingNewsBlock(): string {
    if (breakingItems.length === 0) return "";

    const itemsHtml = breakingItems.slice(0, 5).map((b, idx) => {
      const url = b.id ? `${BASE_URL}/ai/news/${b.id}` : `${BASE_URL}/ai`;
      return `
        <tr>
          <td style="padding:14px 24px;${idx < Math.min(breakingItems.length, 5) - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
            <a href="${url}" style="font-size:15px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:6px;">${breakingEmojis[idx % breakingEmojis.length]} ${b.title}</a>
            ${b.summary ? `<div style="font-size:13px;color:${SLATE};font-family:${F};line-height:1.6;">${b.summary.slice(0, 200)}${b.summary.length > 200 ? "…" : ""}</div>` : ""}
            ${b.sourceName ? `<div style="margin-top:6px;font-size:11px;color:${MUTED};font-family:${F};">Fonte: <strong>${b.sourceName}</strong></div>` : ""}
            <div style="margin-top:6px;"><a href="${url}" style="font-size:12px;color:${ACCENT};font-family:${F};text-decoration:none;font-weight:600;">Leggi su Ideasmart →</a></div>
          </td>
        </tr>`;
    }).join("");

    return `
      <!-- BLOCCO 4: BREAKING NEWS -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};border-left:4px solid ${RED};">
            <tr>
              <td style="padding:20px 24px 12px;">
                <div style="font-size:11px;font-weight:800;color:${RED};text-transform:uppercase;letter-spacing:0.1em;font-family:${F};margin-bottom:4px;">⚡ BREAKING NEWS</div>
                <div style="font-size:24px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.2;">Ultime Notizie</div>
              </td>
            </tr>
            ${itemsHtml}
            <tr>
              <td style="padding:12px 24px 20px;">
                <a href="${BASE_URL}/ai" style="font-size:13px;font-weight:700;color:${RED};text-decoration:none;font-family:${F};">Tutte le Breaking News →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  // ══════════════════════════════════════════════════════════════════
  // BLOCCO 5: Canale del Giorno (rotazione 13 canali, fino a 10 notizie)
  // ══════════════════════════════════════════════════════════════════
  function buildChannelOfDay(): string {
    const ch = todayChannel;
    const color = ch.color;
    let itemsHtml = "";

    if (ch.isSection) {
      let sectionItems: NewsItem[] = [];
      if (ch.key === "ai") sectionItems = aiNews;
      else if (ch.key === "startup") sectionItems = startupNews;
      else if (ch.key === "dealroom") sectionItems = dealroomNews;
      else if (ch.key === "research") {
        // Per research usa researches
        itemsHtml = researches.slice(0, 10).map((r, idx) => {
          const url = r.id ? `${BASE_URL}/research/${r.id}` : `${BASE_URL}/research`;
          return `
            <tr>
              <td style="padding:14px 24px;${idx < Math.min(researches.length, 10) - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
                <a href="${url}" style="font-size:15px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:6px;">${ch.emoji} ${r.title}</a>
                <div style="font-size:13px;color:${SLATE};font-family:${F};line-height:1.6;">${r.summary.slice(0, 200)}${r.summary.length > 200 ? "…" : ""}</div>
                <div style="margin-top:6px;"><a href="${url}" style="font-size:12px;color:${ACCENT};font-family:${F};text-decoration:none;font-weight:600;">Leggi su Ideasmart →</a></div>
              </td>
            </tr>`;
        }).join("");
      }

      if (!itemsHtml && sectionItems.length > 0) {
        itemsHtml = sectionItems.slice(0, 10).map((n, idx) => {
          // LINK INTERNI — mai alle fonti esterne
          const url = n.id ? `${BASE_URL}${ch.path}/news/${n.id}` : `${BASE_URL}${ch.path}`;
          return `
            <tr>
              <td style="padding:14px 24px;${idx < Math.min(sectionItems.length, 10) - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
                <a href="${url}" style="font-size:15px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:6px;">${ch.emoji} ${n.title}</a>
                <div style="font-size:13px;color:${SLATE};font-family:${F};line-height:1.6;">${n.summary.slice(0, 200)}${n.summary.length > 200 ? "…" : ""}</div>
                ${n.sourceName ? `<div style="margin-top:6px;font-size:11px;color:${MUTED};font-family:${F};">Fonte: <strong>${n.sourceName}</strong></div>` : ""}
                <div style="margin-top:6px;"><a href="${url}" style="font-size:12px;color:${ACCENT};font-family:${F};text-decoration:none;font-weight:600;">Leggi su Ideasmart →</a></div>
              </td>
            </tr>`;
        }).join("");
      }
    } else {
      // Usa il channelContent
      const chItems = channelContents[ch.key] || [];
      if (chItems.length === 0) {
        // Fallback: usa AI news con link interni
        itemsHtml = aiNews.slice(0, 5).map((n, idx) => {
          const url = n.id ? `${BASE_URL}/ai/news/${n.id}` : `${BASE_URL}/ai`;
          return `
            <tr>
              <td style="padding:14px 24px;${idx < 4 ? `border-bottom:1px solid ${BORDER};` : ""}">
                <a href="${url}" style="font-size:15px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:6px;">${ch.emoji} ${n.title}</a>
                <div style="font-size:13px;color:${SLATE};font-family:${F};line-height:1.6;">${n.summary.slice(0, 200)}…</div>
                <div style="margin-top:6px;"><a href="${url}" style="font-size:12px;color:${ACCENT};font-family:${F};text-decoration:none;font-weight:600;">Leggi su Ideasmart →</a></div>
              </td>
            </tr>`;
        }).join("");
      } else {
        itemsHtml = chItems.slice(0, 10).map((item, idx) => {
          const summary = item.body ? item.body.replace(/[#*_`\[\]]/g, "").slice(0, 200) + (item.body.length > 200 ? "…" : "") : (item.subtitle || "");
          return `
            <tr>
              <td style="padding:14px 24px;${idx < Math.min(chItems.length, 10) - 1 ? `border-bottom:1px solid ${BORDER};` : ""}">
                ${item.category ? `<div style="margin-bottom:6px;"><span style="font-size:10px;font-weight:700;color:${WHITE};background:${color};border-radius:3px;padding:2px 8px;letter-spacing:0.08em;text-transform:uppercase;font-family:${F};">${item.category}</span></div>` : ""}
                <a href="${BASE_URL}${ch.path}" style="font-size:15px;font-weight:700;color:${BLACK};font-family:${F};text-decoration:none;line-height:1.35;display:block;margin-bottom:6px;">${ch.emoji} ${item.title}</a>
                <div style="font-size:13px;color:${SLATE};font-family:${F};line-height:1.6;">${summary}</div>
                ${item.actionItem ? `<div style="margin-top:8px;padding:8px 12px;background:#f0fdf4;border-radius:6px;border-left:3px solid #22c55e;"><div style="font-size:11px;font-weight:700;color:#166534;font-family:${F};margin-bottom:3px;">COSA FARE ORA</div><div style="font-size:12px;color:#15803d;font-family:${F};line-height:1.5;">${item.actionItem.slice(0, 150)}${item.actionItem.length > 150 ? "…" : ""}</div></div>` : ""}
                ${item.promptText ? `<div style="margin-top:8px;padding:8px 12px;background:#f5f3ff;border-radius:6px;border-left:3px solid #7c3aed;font-size:12px;color:#5b21b6;font-family:monospace;line-height:1.5;">${item.promptText.slice(0, 300)}${item.promptText.length > 300 ? "…" : ""}</div>` : ""}
                <div style="margin-top:6px;"><a href="${BASE_URL}${ch.path}" style="font-size:12px;color:${ACCENT};font-family:${F};text-decoration:none;font-weight:600;">Leggi su Ideasmart →</a></div>
              </td>
            </tr>`;
        }).join("");
      }
    }

    return `
      <!-- BLOCCO 5: CANALE DEL GIORNO: ${ch.label} -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};border-left:4px solid ${color};">
            <tr>
              <td style="padding:20px 24px 12px;">
                <div style="font-size:11px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:0.1em;font-family:${F};margin-bottom:4px;">📅 CANALE DEL GIORNO — ${ch.label}</div>
                <div style="font-size:24px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.2;">${ch.emoji} ${ch.title}</div>
              </td>
            </tr>
            ${itemsHtml}
            <tr>
              <td style="padding:12px 24px 20px;">
                <a href="${BASE_URL}${ch.path}" style="font-size:13px;font-weight:700;color:${color};text-decoration:none;font-family:${F};">Vai al canale ${ch.label} su Ideasmart →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  // ══════════════════════════════════════════════════════════════════
  // BLOCCO 6: Amazon Deal del Giorno
  // ══════════════════════════════════════════════════════════════════
  function buildAmazonDealBlock(): string {
    const partners = [
      { name: "Amazon Prime", headline: "Prova gratis Amazon Prime", description: "Spedizioni illimitate gratuite, accesso a Prime Video, Amazon Music, Prime Reading e molto altro. Prova gratuita per 30 giorni.", url: "http://www.amazon.it/provaprime?tag=andyiltosca00-21", ctaText: "PROVA GRATIS 30 GIORNI →", emoji: "📦" },
      { name: "Prime Video", headline: "Scopri Prime Video", description: "Film, serie TV, documentari e contenuti originali Amazon. Guarda ovunque, su qualsiasi dispositivo. Incluso con Amazon Prime.", url: "https://www.primevideo.com/?&tag=andyiltosca00-21", ctaText: "GUARDA ORA →", emoji: "🎬" },
      { name: "Amazon Music Unlimited", headline: "Ascolta senza limiti con Amazon Music", description: "Oltre 100 milioni di brani in HD, podcast e playlist personalizzate. Audio spaziale e qualità Ultra HD inclusi.", url: "https://www.amazon.it/music/unlimited?tag=andyiltosca00-21", ctaText: "PROVA AMAZON MUSIC →", emoji: "🎧" },
      { name: "Kindle Unlimited", headline: "Leggi senza limiti con Kindle Unlimited", description: "Accesso illimitato a oltre 2 milioni di eBook, migliaia di audiolibri e riviste. Leggi su qualsiasi dispositivo, ovunque.", url: "https://www.amazon.it/kindle-dbs/hz/signup?tag=andyiltosca00-21", ctaText: "PROVA GRATIS →", emoji: "📚" },
      { name: "Amazon Business", headline: "Amazon Business per la tua azienda", description: "Prezzi esclusivi, fatturazione semplificata e accesso a milioni di prodotti business. Perfetto per PMI e professionisti.", url: "https://www.amazon.it/business?tag=andyiltosca00-21", ctaText: "SCOPRI AMAZON BUSINESS →", emoji: "🏢" },
      { name: "Audible", headline: "Audible — Ascolta il meglio della narrativa", description: "Oltre 500.000 audiolibri, podcast originali e contenuti esclusivi. Il primo mese è gratuito.", url: "https://www.audible.it/?tag=andyiltosca00-21", ctaText: "PROVA GRATIS 30 GIORNI →", emoji: "🎙️" },
      { name: "Amazon Wedding", headline: "Lista Nozze su Amazon", description: "Crea la tua lista nozze su Amazon: migliaia di prodotti, spedizione gratuita per gli invitati e un bonus del 20% sui regali non acquistati.", url: "http://www.amazon.it/wedding?tag=andyiltosca00-21", ctaText: "CREA LA TUA LISTA →", emoji: "💍" },
    ];
    const todayPartner = partners[dayOfYear % partners.length];
    const utmUrl = `${todayPartner.url}${todayPartner.url.includes("?") ? "&" : "?"}utm_source=ideasmart_newsletter&utm_medium=email&utm_campaign=amazon_deal`;

    // Se ci sono deal dal DB, mostra quelli
    if (amazonDeals.length > 0) {
      const deal = amazonDeals[0];
      const dealUtmUrl = `${deal.affiliateUrl}${deal.affiliateUrl.includes("?") ? "&" : "?"}utm_source=ideasmart_newsletter&utm_medium=email&utm_campaign=amazon_deal`;
      return `
        <!-- BLOCCO 6: AMAZON DEAL DEL GIORNO -->
        <tr>
          <td style="padding:0 20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:12px;overflow:hidden;border-left:4px solid ${AMAZON_ORANGE};border-top:1px solid ${BORDER};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
              <tr>
                <td style="padding:20px 24px 0;">
                  <div style="font-size:11px;font-weight:700;color:${AMAZON_ORANGE};text-transform:uppercase;letter-spacing:0.12em;font-family:${F};margin-bottom:4px;">🏷️ AMAZON DEAL DEL GIORNO</div>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 24px 0;">
                  <div style="font-size:22px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.25;">📦 ${deal.title}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 24px 0;">
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.7;">${deal.description}</div>
                  <div style="margin-top:8px;font-size:20px;font-weight:800;color:${AMAZON_ORANGE};font-family:${F};">${deal.price}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px 22px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:${AMAZON_ORANGE};border-radius:8px;padding:14px 32px;">
                        <a href="${dealUtmUrl}" target="_blank" style="font-size:15px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${F};letter-spacing:0.02em;">SCOPRI L'OFFERTA →</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }

    // Fallback: partner Amazon rotante
    return `
      <!-- BLOCCO 6: AMAZON DEAL DEL GIORNO (fallback partner) -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:12px;overflow:hidden;border-left:4px solid ${AMAZON_ORANGE};border-top:1px solid ${BORDER};border-right:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <tr>
              <td style="padding:20px 24px 0;">
                <div style="font-size:11px;font-weight:700;color:${AMAZON_ORANGE};text-transform:uppercase;letter-spacing:0.12em;font-family:${F};margin-bottom:4px;">🏷️ AMAZON DEAL DEL GIORNO</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 0;">
                <div style="font-size:22px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.25;">${todayPartner.emoji} ${todayPartner.headline}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px 0;">
                <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.7;">${todayPartner.description}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px 22px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${AMAZON_ORANGE};border-radius:8px;padding:14px 32px;">
                      <a href="${utmUrl}" target="_blank" style="font-size:15px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${F};letter-spacing:0.02em;">${todayPartner.ctaText}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  // ══════════════════════════════════════════════════════════════════
  // BLOCCO 3: Sponsor Primario — Promozione Prompt Ideasmart
  // ══════════════════════════════════════════════════════════════════
  function buildPromptPromoBlock(): string {
    return `
      <!-- BLOCCO 3: SPONSOR — COLLEZIONE PROMPT IDEASMART -->
      <tr>
        <td style="padding:0 20px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BLACK};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 24px;">
                <div style="font-size:11px;font-weight:700;color:${ACCENT};letter-spacing:0.2em;text-transform:uppercase;font-family:${F};margin-bottom:10px;">📋 COLLEZIONE ESCLUSIVA</div>
                <div style="font-size:24px;font-weight:800;color:${WHITE};font-family:${F};line-height:1.25;margin-bottom:12px;">I Migliori Prompt AI per il Business</div>
                <div style="font-size:14px;color:#d1d5db;font-family:${F};line-height:1.7;margin-bottom:8px;">Oltre <strong style="color:${WHITE};">500 prompt</strong> pronti da usare per marketing, vendite, HR, finanza e operations. Testati e ottimizzati per ChatGPT, Claude e Gemini.</div>
                <div style="font-size:14px;color:#d1d5db;font-family:${F};line-height:1.7;margin-bottom:20px;">Ogni giorno nella sezione <strong style="color:${WHITE};">PROMPT AI</strong> trovi nuovi prompt gratuiti. La collezione completa è disponibile su IDEASMART.</div>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${WHITE};border-radius:6px;padding:14px 32px;">
                      <a href="${BASE_URL}/copy-paste-ai?utm_source=newsletter&utm_medium=email&utm_campaign=prompt_promo" style="font-size:14px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${F};">Esplora i Prompt su Ideasmart →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }

  // ══════════════════════════════════════════════════════════════════
  // ASSEMBLE: 7 blocchi
  // ══════════════════════════════════════════════════════════════════
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
          <span style="font-size:11px;font-weight:700;color:#ffffff;font-family:${F};text-transform:uppercase;letter-spacing:0.12em;">⚠️ EMAIL DI PROVA — Non distribuire</span>
        </td></tr>` : ""}

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- BLOCCO 1: COVER — Titolo + Data + Leggi online         -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <tr>
          <td style="background:${WHITE};padding:32px 24px 24px;text-align:center;${isTest ? "" : "border-radius:8px 8px 0 0;"}border-bottom:3px solid ${BLACK};">
            <div style="font-size:11px;color:${MUTED};font-family:${F};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">${dateLabel} &nbsp;|&nbsp; <a href="${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=header" style="color:${RED};text-decoration:none;font-weight:600;">Leggi online</a></div>
            <div style="font-size:52px;font-weight:900;color:${BLACK};font-family:${F};line-height:1;letter-spacing:-0.02em;">IDEASMART</div>
            <div style="width:48px;height:3px;background:${RED};margin:8px auto 12px;"></div>
            <div style="font-size:13px;color:${MUTED};font-family:${F};line-height:1.5;">Il tuo sistema operativo sull'AI &nbsp;·&nbsp; Notizie verificate, analisi esclusive e i deal che contano</div>
          </td>
        </tr>

        <!-- Spacer -->
        <tr><td style="height:16px;background:${BG};"></td></tr>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- BLOCCO 2: ANTICIPAZIONE 20 NOTIZIE (link interni)     -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:0 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:28px 24px 8px;">
                  <div style="font-size:20px;font-weight:800;color:${BLACK};font-family:${F};line-height:1.3;margin-bottom:8px;">Buongiorno!</div>
                  <div style="font-size:15px;color:${DARK};font-family:${F};line-height:1.7;margin-bottom:16px;">
                    Bentornato alla newsletter di <strong style="color:${BLACK};">IDEASMART</strong> — il tuo briefing su AI, Startup e Venture Capital. Notizie verificate, analisi esclusive e i deal che contano, direttamente nella tua inbox.
                  </div>
                  <div style="font-size:15px;font-weight:700;color:${BLACK};font-family:${F};margin-bottom:14px;">Ecco cosa trovi nell'edizione di oggi:</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${bulletHtml}
                  </table>
                  <div style="margin-top:20px;text-align:center;">
                    <a href="${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=intro_cta" style="display:inline-block;padding:12px 28px;background:${BLACK};color:${WHITE};font-size:13px;font-weight:700;text-decoration:none;border-radius:6px;font-family:${F};letter-spacing:0.05em;">Leggi tutte le notizie su IDEASMART →</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Spacer -->
        <tr><td style="height:16px;background:${BG};"></td></tr>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- BLOCCO 3: SPONSOR — PROMOZIONE PROMPT IDEASMART        -->
        <!-- ═══════════════════════════════════════════════════════ -->
        ${buildPromptPromoBlock()}

        <!-- Spacer -->
        <tr><td style="height:4px;background:${BG};"></td></tr>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- BLOCCO 4: BREAKING NEWS (fino a 5, link interni)       -->
        <!-- ═══════════════════════════════════════════════════════ -->
        ${buildBreakingNewsBlock()}

        <!-- Spacer -->
        <tr><td style="height:4px;background:${BG};"></td></tr>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- BLOCCO 5: CANALE DEL GIORNO (rotazione 13 canali)      -->
        <!-- ═══════════════════════════════════════════════════════ -->
        ${buildChannelOfDay()}

        <!-- Spacer -->
        <tr><td style="height:4px;background:${BG};"></td></tr>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- BLOCCO 6: AMAZON DEAL DEL GIORNO                       -->
        <!-- ═══════════════════════════════════════════════════════ -->
        ${buildAmazonDealBlock()}

        <!-- Spacer -->
        <tr><td style="height:4px;background:${BG};"></td></tr>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- BLOCCO 7: FOOTER + UNSUBSCRIBE GDPR                    -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <tr>
          <td style="padding:0 20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
              <tr>
                <td style="padding:20px;text-align:center;">
                  <div style="font-size:12px;font-weight:700;color:${BLACK};font-family:${F};margin-bottom:6px;">IDEASMART — Intelligence Quotidiana · © 2026</div>
                  <div style="font-size:11px;color:${MUTED};font-family:${F};line-height:1.7;margin-bottom:12px;">
                    Hai ricevuto questa email perché sei iscritto alla newsletter IDEASMART.<br>
                    Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
                  </div>
                  <div style="border-top:1px solid ${BORDER};padding-top:12px;">
                    <a href="${BASE_URL}/preferenze-newsletter" style="font-size:11px;color:${BLACK};text-decoration:underline;font-weight:600;font-family:${F};">Gestisci preferenze</a>
                    <span style="color:${MUTED};margin:0 8px;">·</span>
                    <a href="${unsubscribeUrl}" style="font-size:11px;color:${RED};text-decoration:underline;font-weight:600;font-family:${F};">Annulla iscrizione</a>
                    <span style="color:${MUTED};margin:0 8px;">·</span>
                    <a href="${BASE_URL}/privacy" style="font-size:11px;color:${MUTED};text-decoration:underline;font-family:${F};">Privacy</a>
                    <span style="color:${MUTED};margin:0 8px;">·</span>
                    <a href="${BASE_URL}" style="font-size:11px;color:${BLACK};text-decoration:none;font-weight:600;font-family:${F};">ideasmart.biz</a>
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

// ─── Build & Send Functions ─────────────────────────────────────────────────

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

  const [primarySponsor, spotlightSponsor, amazonDeals, approvedTools, osTools] = await Promise.all([
    getActiveSponsor("primary"),
    getActiveSponsor("spotlight"),
    getTodayAmazonDeals(),
    getApprovedToolsForNewsletter(),
    getOpenSourceToolsForNewsletter(),
  ]);

  console.log(`[UnifiedNewsletter] Contenuti raccolti:`);
  console.log(`  AI News: ${content.aiNews.length}`);
  console.log(`  Startup News: ${content.startupNews.length}`);
  console.log(`  Dealroom: ${content.dealroomNews.length}`);
  console.log(`  Breaking: ${content.breakingItems.length}`);
  console.log(`  Ricerche: ${content.researches.length}`);
  console.log(`  Amazon Deals: ${amazonDeals.length}`);
  for (const ch of NEWSLETTER_CHANNELS) {
    console.log(`  ${ch.label}: ${content.channelContents[ch.key]?.length ?? 0}`);
  }

  // Calcola canale del giorno per il log
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const todayChannel = ALL_CHANNELS[dayOfYear % ALL_CHANNELS.length];
  console.log(`  Canale del giorno: ${todayChannel.label} (${todayChannel.key})`);

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
    amazonDeals,
    approvedTools,
    osTools,
    channelContents: content.channelContents,
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
        title: `\uD83D\uDC41\uFE0F Preview newsletter IDEASMART \u2014 ${new Date().toLocaleDateString("it-IT")}`,
        content: `Preview newsletter unificata inviata a ${TEST_EMAILS.join(", ")}.\n\nContenuti: ${stats.ai} AI + ${stats.startup} Startup + ${stats.dealroom} Dealroom + ${stats.breaking} Breaking + ${stats.research} Ricerche.\nNuovi canali: ${channelStats}`,
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
