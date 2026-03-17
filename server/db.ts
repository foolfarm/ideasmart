import { eq, desc, count, and, or, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, InsertSubscriber, InsertNewsItem,
  subscribers, newsletterSends, users, newsItems, newsRefreshLog,
  dailyEditorial, startupOfDay,
  InsertDailyEditorial, InsertStartupOfDay,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Subscribers ─────────────────────────────────────────────────────────────
// Genera un token univoco per la disiscrizione
export function generateUnsubscribeToken(): string {
  return randomBytes(32).toString("hex");
}

export async function addSubscriber(data: { email: string; name?: string; source?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(subscribers).where(eq(subscribers.email, data.email)).limit(1);
  if (existing.length > 0) {
    if (existing[0].status === "unsubscribed") {
      // Genera un nuovo token se non ne ha uno
      const token = existing[0].unsubscribeToken ?? generateUnsubscribeToken();
      await db.update(subscribers)
        .set({ status: "active", unsubscribedAt: null, unsubscribeToken: token })
        .where(eq(subscribers.email, data.email));
      return { resubscribed: true };
    }
    return { alreadySubscribed: true };
  }

  const token = generateUnsubscribeToken();
  const insert: InsertSubscriber = {
    email: data.email,
    name: data.name ?? null,
    source: data.source ?? "website",
    status: "active",
    unsubscribeToken: token,
  };
  await db.insert(subscribers).values(insert);
  return { success: true };
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).orderBy(subscribers.subscribedAt);
}

export async function getActiveSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).where(eq(subscribers.status, "active"));
}

export async function getActiveSubscriberCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(subscribers).where(eq(subscribers.status, "active"));
  return result[0]?.count ?? 0;
}

/**
 * Restituisce gli iscritti attivi filtrati per newsletter:
 * - 'ai4business': iscritti a AI4Business News o a entrambe
 * - 'itsmusic': iscritti a ITsMusic o a entrambe
 */
export async function getActiveSubscribersByNewsletter(newsletter: 'ai4business' | 'itsmusic') {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).where(
    and(
      eq(subscribers.status, "active"),
      or(
        eq(subscribers.newsletter, newsletter),
        eq(subscribers.newsletter, "both")
      )
    )
  );
}

export async function unsubscribeEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(subscribers.email, email));
}

// Disiscrivi tramite token (GDPR-compliant, nessun login richiesto)
export async function unsubscribeByToken(token: string): Promise<{ success: boolean; email?: string; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database non disponibile" };

  const result = await db.select().from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1);

  if (result.length === 0) {
    return { success: false, error: "Token non valido o già utilizzato" };
  }

  const subscriber = result[0];
  if (subscriber.status === "unsubscribed") {
    return { success: true, email: subscriber.email }; // già disiscritta
  }

  await db.update(subscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(subscribers.unsubscribeToken, token));

  return { success: true, email: subscriber.email };
}

// Recupera un iscritto tramite token (per mostrare l'email nella pagina di conferma)
export async function getSubscriberByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Assegna token a iscritti esistenti che non ne hanno uno (migrazione)
export async function ensureUnsubscribeTokens() {
  const db = await getDb();
  if (!db) return;
  const all = await db.select().from(subscribers).where(eq(subscribers.status, "active"));
  for (const sub of all) {
    if (!sub.unsubscribeToken) {
      await db.update(subscribers)
        .set({ unsubscribeToken: generateUnsubscribeToken() })
        .where(eq(subscribers.id, sub.id));
    }
  }
}

export async function deleteSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(subscribers).where(eq(subscribers.id, id));
}

// ── Newsletter Sends ─────────────────────────────────────────────────────────
export async function createNewsletterSend(data: { subject: string; htmlContent: string; recipientCount: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(newsletterSends).values({
    subject: data.subject,
    htmlContent: data.htmlContent,
    recipientCount: data.recipientCount,
    status: "sent",
    sentAt: new Date(),
  });
}

export async function getNewsletterHistory() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: newsletterSends.id,
    subject: newsletterSends.subject,
    recipientCount: newsletterSends.recipientCount,
    status: newsletterSends.status,
    sentAt: newsletterSends.sentAt,
    createdAt: newsletterSends.createdAt,
  }).from(newsletterSends).orderBy(newsletterSends.createdAt);
}

// ── News Items ───────────────────────────────────────────────────────────────
export async function getLatestNews(limit = 20, section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsItems)
    .where(eq(newsItems.section, section))
    .orderBy(desc(newsItems.createdAt), newsItems.position)
    .limit(limit);
}

export async function replaceAllNews(items: Array<{
  title: string;
  summary: string;
  category: string;
  sourceUrl?: string;
  sourceName?: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all existing news
  await db.delete(newsItems);

  // Insert new items
  const today = new Date();
  const dayLabel = today.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  const inserts: InsertNewsItem[] = items.map((item, i) => ({
    title: item.title,
    summary: item.summary,
    category: item.category,
    source: item.sourceName ?? null,
    url: item.sourceUrl ?? null,
    publishedAt: dayLabel,
    weekLabel: dayLabel,
    position: i,
  }));

  await db.insert(newsItems).values(inserts);
  return inserts.length;
}

export async function logNewsRefresh(data: { weekLabel: string; itemCount: number; status: "success" | "failed"; error?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(newsRefreshLog).values({
    weekLabel: data.weekLabel,
    itemCount: data.itemCount,
    status: data.status,
    error: data.error ?? null,
  });
}

export async function getNewsRefreshHistory() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsRefreshLog).orderBy(desc(newsRefreshLog.createdAt)).limit(10);
}

// ── Daily Editorial ──────────────────────────────────────────────────────────────────────────────────
export async function getLatestEditorial(section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dailyEditorial)
    .where(eq(dailyEditorial.section, section))
    .orderBy(desc(dailyEditorial.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTodayEditorial(dateLabel: string, section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dailyEditorial)
    .where(and(eq(dailyEditorial.dateLabel, dateLabel), eq(dailyEditorial.section, section)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function saveEditorial(data: InsertDailyEditorial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dailyEditorial).values(data);
}

// ── Startup of the Day ──────────────────────────────────────────────────────────────────────────────
export async function getLatestStartupOfDay(section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(startupOfDay)
    .where(eq(startupOfDay.section, section))
    .orderBy(desc(startupOfDay.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTodayStartup(dateLabel: string, section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(startupOfDay)
    .where(and(eq(startupOfDay.dateLabel, dateLabel), eq(startupOfDay.section, section)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function saveStartupOfDay(data: InsertStartupOfDay) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(startupOfDay).values(data);
}

// ── Weekly Reportage ─────────────────────────────────────────────────────────
import { weeklyReportage, InsertWeeklyReportage, marketAnalysis, InsertMarketAnalysis } from "../drizzle/schema";

export async function getLatestWeeklyReportage(section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return [];
  // Prende i 4 reportage della settimana più recente per la sezione specificata
  const latest = await db.select().from(weeklyReportage)
    .where(eq(weeklyReportage.section, section))
    .orderBy(desc(weeklyReportage.createdAt))
    .limit(1);
  if (latest.length === 0) return [];
  const weekLabel = latest[0].weekLabel;
  return db.select().from(weeklyReportage)
    .where(and(eq(weeklyReportage.weekLabel, weekLabel), eq(weeklyReportage.section, section)))
    .orderBy(weeklyReportage.position);
}

export async function saveWeeklyReportage(items: InsertWeeklyReportage[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(weeklyReportage).values(items);
}

export async function deleteReportageByWeek(weekLabel: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(weeklyReportage).where(eq(weeklyReportage.weekLabel, weekLabel));
}

// ── Market Analysis ─────────────────────────────────────────────────────────────────────────────────────────────
export async function getLatestMarketAnalysis(section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return [];
  const latest = await db.select({ weekLabel: marketAnalysis.weekLabel })
    .from(marketAnalysis)
    .where(eq(marketAnalysis.section, section))
    .orderBy(desc(marketAnalysis.createdAt))
    .limit(1);
  if (latest.length === 0) return [];
  const weekLabel = latest[0].weekLabel;
  return db.select().from(marketAnalysis)
    .where(and(eq(marketAnalysis.weekLabel, weekLabel), eq(marketAnalysis.section, section)))
    .orderBy(marketAnalysis.position);
}

export async function saveMarketAnalysis(items: InsertMarketAnalysis[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(marketAnalysis).values(items);
}

export async function deleteMarketAnalysisByWeek(weekLabel: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(marketAnalysis).where(eq(marketAnalysis.weekLabel, weekLabel));
}

// ── Notification Preferences ─────────────────────────────────────────────────
import { notificationPreferences } from "../drizzle/schema";

export async function upsertNotificationPreference(data: {
  email: string;
  name?: string;
  notifyNews?: boolean;
  notifyEditorial?: boolean;
  notifyStartup?: boolean;
  notifyReportage?: boolean;
  notifyMarket?: boolean;
  frequency?: "daily" | "weekly" | "realtime";
  categories?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.email, data.email))
    .limit(1);

  const categoriesJson = data.categories ? JSON.stringify(data.categories) : null;
  const prefsToken = randomBytes(32).toString("hex");

  if (existing.length > 0) {
    await db.update(notificationPreferences)
      .set({
        name: data.name ?? existing[0].name,
        notifyNews: data.notifyNews ?? existing[0].notifyNews,
        notifyEditorial: data.notifyEditorial ?? existing[0].notifyEditorial,
        notifyStartup: data.notifyStartup ?? existing[0].notifyStartup,
        notifyReportage: data.notifyReportage ?? existing[0].notifyReportage,
        notifyMarket: data.notifyMarket ?? existing[0].notifyMarket,
        frequency: data.frequency ?? existing[0].frequency,
        categories: categoriesJson ?? existing[0].categories,
      })
      .where(eq(notificationPreferences.email, data.email));
    return existing[0];
  } else {
    await db.insert(notificationPreferences).values({
      email: data.email,
      name: data.name,
      notifyNews: data.notifyNews ?? true,
      notifyEditorial: data.notifyEditorial ?? true,
      notifyStartup: data.notifyStartup ?? true,
      notifyReportage: data.notifyReportage ?? false,
      notifyMarket: data.notifyMarket ?? false,
      frequency: data.frequency ?? "daily",
      categories: categoriesJson,
      prefsToken,
      isActive: true,
    });
    const created = await db.select().from(notificationPreferences)
      .where(eq(notificationPreferences.email, data.email))
      .limit(1);
    return created[0];
  }
}

export async function getNotificationPreferenceByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.prefsToken, token))
    .limit(1);
  return result[0] ?? null;
}

export async function getNotificationPreferenceByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.email, email))
    .limit(1);
  return result[0] ?? null;
}

export async function updateNotificationPreferenceByToken(token: string, data: {
  notifyNews?: boolean;
  notifyEditorial?: boolean;
  notifyStartup?: boolean;
  notifyReportage?: boolean;
  notifyMarket?: boolean;
  frequency?: "daily" | "weekly" | "realtime";
  categories?: string[];
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const categoriesJson = data.categories ? JSON.stringify(data.categories) : undefined;
  await db.update(notificationPreferences)
    .set({
      ...(data.notifyNews !== undefined && { notifyNews: data.notifyNews }),
      ...(data.notifyEditorial !== undefined && { notifyEditorial: data.notifyEditorial }),
      ...(data.notifyStartup !== undefined && { notifyStartup: data.notifyStartup }),
      ...(data.notifyReportage !== undefined && { notifyReportage: data.notifyReportage }),
      ...(data.notifyMarket !== undefined && { notifyMarket: data.notifyMarket }),
      ...(data.frequency !== undefined && { frequency: data.frequency }),
      ...(categoriesJson !== undefined && { categories: categoriesJson }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })
    .where(eq(notificationPreferences.prefsToken, token));
}

export async function getAllActiveNotificationPreferences() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.isActive, true));
}

// Recupera un iscritto tramite email
export async function getSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// ── Newsletter Performance Tracking ──────────────────────────────────────────

/** Statistiche aggregate per ogni campagna newsletter */
export async function getNewsletterCampaignStats() {
  const db = await getDb();
  if (!db) return [];
  const sends = await db.select().from(newsletterSends).orderBy(newsletterSends.sentAt);
  return sends.map(s => ({
    id: s.id,
    subject: s.subject,
    sentAt: s.sentAt,
    recipientCount: s.recipientCount ?? 0,
    openedCount: s.openedCount ?? 0,
    openRate: s.recipientCount && s.recipientCount > 0
      ? Math.round(((s.openedCount ?? 0) / s.recipientCount) * 100)
      : 0,
  }));
}

/** Lista iscritti con dati di tracking (aperture, ultima apertura, stato) */
export async function getSubscribersWithTracking() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    id: subscribers.id,
    email: subscribers.email,
    name: subscribers.name,
    status: subscribers.status,
    subscribedAt: subscribers.subscribedAt,
    unsubscribedAt: subscribers.unsubscribedAt,
    totalSent: subscribers.totalSent,
    totalOpened: subscribers.totalOpened,
    lastSentAt: subscribers.lastSentAt,
    lastOpenedAt: subscribers.lastOpenedAt,
    channels: subscribers.channels,
  }).from(subscribers).orderBy(subscribers.subscribedAt);

  // Parsa i canali da JSON string a array
  return rows.map(row => ({
    ...row,
    parsedChannels: parseChannels(row.channels ?? null),
  }));
}

/** Aggiorna openedCount nella tabella newsletter_sends per una campagna */
export async function incrementCampaignOpenCount(campaignId: string) {
  const db = await getDb();
  if (!db) return;
  // campaignId corrisponde al campo 'subject' nella tabella newsletter_sends
  // Usiamo sql per incrementare atomicamente
  const { sql: sqlHelper } = await import("drizzle-orm");
  await db.update(newsletterSends)
    .set({ openedCount: sqlHelper`${newsletterSends.openedCount} + 1` })
    .where(sqlHelper`${newsletterSends.subject} LIKE ${`%${campaignId}%`}`);
}

// ── Audit-filtered News Queries ─────────────────────────────────────────────
import { contentAudit } from "../drizzle/schema";

/**
 * Recupera le notizie filtrando quelle con audit score < 40.
 * Se una notizia ha un audit recente con score < 40, viene esclusa.
 * Le notizie senza audit (non ancora verificate) vengono incluse.
 */
export async function getLatestNewsFiltered(limit = 20, section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return [];

  // Recupera tutte le notizie della sezione
  const allNews = await db.select().from(newsItems)
    .where(eq(newsItems.section, section))
    .orderBy(desc(newsItems.createdAt), newsItems.position)
    .limit(limit * 2); // prende più notizie per compensare quelle filtrate

  if (allNews.length === 0) return [];

  // Recupera gli audit più recenti per ogni notizia
  const newsIds = allNews.map(n => n.id);
  const audits = await db.select({
    contentId: contentAudit.contentId,
    coherenceScore: contentAudit.coherenceScore,
    status: contentAudit.status,
  }).from(contentAudit)
    .where(and(
      eq(contentAudit.contentType, 'news'),
      eq(contentAudit.section, section)
    ))
    .orderBy(desc(contentAudit.auditedAt));

  // Mappa: contentId -> audit più recente
  const auditMap = new Map<number, { coherenceScore: number | null; status: string }>();
  for (const audit of audits) {
    if (!auditMap.has(audit.contentId)) {
      auditMap.set(audit.contentId, { coherenceScore: audit.coherenceScore, status: audit.status });
    }
  }

  // Filtra le notizie con qualità molto bassa.
  // NOTA IMPORTANTE: le notizie generate dall'AI usano URL di testate giornalistiche (homepage)
  // come sourceUrl, non URL di articoli specifici. L'audit verifica la coerenza tra il testo
  // della homepage e il titolo della notizia, ottenendo score basso anche per notizie valide.
  // Per questo motivo, il filtro usa solo status 'ok' come criterio positivo:
  // - Se non c'è audit → includi (notizia nuova, non ancora verificata)
  // - Se l'audit ha status 'ok' con score >= 60 → includi (verificata positivamente)
  // - Se l'audit ha status 'error' con score 0 → includi comunque (audit inaffidabile su homepage)
  // - Solo se score < 10 E status non è 'ok' → escludi (contenuto palesemente errato)
  const filtered = allNews.filter(news => {
    const audit = auditMap.get(news.id);
    if (!audit) return true; // nessun audit → includi
    if (audit.status === 'ok') return true; // verificata positivamente → includi
    // Escludi solo se score è esplicitamente molto basso (< 10) — indica contenuto palesemente errato
    if (audit.coherenceScore !== null && audit.coherenceScore < 10 && audit.status !== 'error') return false;
    return true; // in tutti gli altri casi → includi
  });

  return filtered.slice(0, limit);
}

/**
 * Conta le notizie filtrate (score < 40 o non raggiungibili) per una sezione.
 */
export async function countFilteredNews(section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return { total: 0, filtered: 0, visible: 0 };

  const allNews = await db.select({ id: newsItems.id }).from(newsItems)
    .where(eq(newsItems.section, section));

  const audits = await db.select({
    contentId: contentAudit.contentId,
    coherenceScore: contentAudit.coherenceScore,
    status: contentAudit.status,
  }).from(contentAudit)
    .where(and(
      eq(contentAudit.contentType, 'news'),
      eq(contentAudit.section, section)
    ))
    .orderBy(desc(contentAudit.auditedAt));

  const auditMap = new Map<number, { coherenceScore: number | null; status: string }>();
  for (const audit of audits) {
    if (!auditMap.has(audit.contentId)) {
      auditMap.set(audit.contentId, { coherenceScore: audit.coherenceScore, status: audit.status });
    }
  }

  let filteredCount = 0;
  for (const news of allNews) {
    const audit = auditMap.get(news.id);
    if (!audit) continue;
    if (audit.status === 'unreachable' || (audit.coherenceScore !== null && audit.coherenceScore < 40)) {
      filteredCount++;
    }
  }

  return {
    total: allNews.length,
    filtered: filteredCount,
    visible: allNews.length - filteredCount,
  };
}

/**
 * Sostituisce una notizia con score < 40 con un nuovo contenuto generato dall'AI.
 * Aggiorna il record esistente invece di crearne uno nuovo.
 */
export async function replaceNewsItem(id: number, newContent: {
  title: string;
  summary: string;
  category: string;
  sourceUrl?: string;
  sourceName?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(newsItems)
    .set({
      title: newContent.title,
      summary: newContent.summary,
      category: newContent.category,
      sourceUrl: newContent.sourceUrl ?? null,
      sourceName: newContent.sourceName ?? null,
    })
    .where(eq(newsItems.id, id));
}

/**
 * Recupera le notizie con audit score < 40 o non raggiungibili per una sezione.
 */
export async function getLowScoreNews(section: 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi' = 'ai') {
  const db = await getDb();
  if (!db) return [];

  const allNews = await db.select().from(newsItems)
    .where(eq(newsItems.section, section))
    .orderBy(desc(newsItems.createdAt));

  const audits = await db.select({
    contentId: contentAudit.contentId,
    coherenceScore: contentAudit.coherenceScore,
    status: contentAudit.status,
    auditNote: contentAudit.auditNote,
  }).from(contentAudit)
    .where(and(
      eq(contentAudit.contentType, 'news'),
      eq(contentAudit.section, section)
    ))
    .orderBy(desc(contentAudit.auditedAt));

  const auditMap = new Map<number, { coherenceScore: number | null; status: string; auditNote: string | null }>();
  for (const audit of audits) {
    if (!auditMap.has(audit.contentId)) {
      auditMap.set(audit.contentId, {
        coherenceScore: audit.coherenceScore,
        status: audit.status,
        auditNote: audit.auditNote,
      });
    }
  }

  return allNews
    .filter(news => {
      const audit = auditMap.get(news.id);
      if (!audit) return false;
      return audit.status === 'unreachable' || (audit.coherenceScore !== null && audit.coherenceScore < 40);
    })
    .map(news => ({
      ...news,
      auditScore: auditMap.get(news.id)?.coherenceScore ?? null,
      auditStatus: auditMap.get(news.id)?.status ?? 'pending',
      auditNote: auditMap.get(news.id)?.auditNote ?? null,
    }));
}

// ── Channel Preferences ──────────────────────────────────────────────────────

export type ChannelKey = 'ai' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'music' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi';
export const ALL_CHANNELS: ChannelKey[] = ['ai', 'startup', 'finance', 'health', 'sport', 'luxury', 'music'];

/**
 * Restituisce i canali scelti da un iscritto.
 * Se channels è null → tutti i canali (legacy, pre-preferenze).
 */
export function parseChannels(channelsJson: string | null): ChannelKey[] {
  if (!channelsJson) return [...ALL_CHANNELS];
  try {
    const parsed = JSON.parse(channelsJson);
    if (Array.isArray(parsed)) return parsed as ChannelKey[];
    return [...ALL_CHANNELS];
  } catch {
    return [...ALL_CHANNELS];
  }
}

/**
 * Aggiorna i canali scelti da un iscritto tramite token di disiscrizione.
 */
export async function updateSubscriberChannelsByToken(token: string, channels: ChannelKey[]): Promise<{ success: boolean; email?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1);
  if (existing.length === 0) return { success: false };
  await db.update(subscribers)
    .set({ channels: JSON.stringify(channels) })
    .where(eq(subscribers.unsubscribeToken, token));
  return { success: true, email: existing[0].email };
}

/**
 * Aggiorna i canali scelti da un iscritto tramite email (uso admin/server).
 */
export async function updateSubscriberChannelsByEmail(email: string, channels: ChannelKey[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscribers)
    .set({ channels: JSON.stringify(channels) })
    .where(eq(subscribers.email, email));
}

/**
 * Restituisce gli iscritti attivi che hanno scelto un determinato canale.
 * Gli iscritti con channels=null ricevono tutti i canali (comportamento legacy).
 */
export async function getActiveSubscribersByChannel(channel: ChannelKey) {
  const db = await getDb();
  if (!db) return [];
  const allActive = await db.select().from(subscribers).where(eq(subscribers.status, 'active'));
  return allActive.filter(sub => {
    const channels = parseChannels(sub.channels ?? null);
    return channels.includes(channel);
  });
}

/**
 * Restituisce un iscritto tramite token di disiscrizione con i suoi canali parsati.
 */
export async function getSubscriberWithChannels(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1);
  if (result.length === 0) return null;
  const sub = result[0];
  return {
    ...sub,
    parsedChannels: parseChannels(sub.channels ?? null),
  };
}

/**
 * Aggiunge un iscritto con canali specifici.
 */
export async function addSubscriberWithChannels(data: {
  email: string;
  name?: string;
  source?: string;
  channels?: ChannelKey[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(subscribers).where(eq(subscribers.email, data.email)).limit(1);
  const channelsJson = data.channels && data.channels.length > 0 ? JSON.stringify(data.channels) : null;

  if (existing.length > 0) {
    if (existing[0].status === 'unsubscribed') {
      const token = existing[0].unsubscribeToken ?? generateUnsubscribeToken();
      await db.update(subscribers)
        .set({ status: 'active', unsubscribedAt: null, unsubscribeToken: token, channels: channelsJson })
        .where(eq(subscribers.email, data.email));
      return { resubscribed: true };
    }
    // Aggiorna i canali se già iscritto
    if (channelsJson) {
      await db.update(subscribers)
        .set({ channels: channelsJson })
        .where(eq(subscribers.email, data.email));
    }
    return { alreadySubscribed: true };
  }

  const token = generateUnsubscribeToken();
  await db.insert(subscribers).values({
    email: data.email,
    name: data.name ?? null,
    source: data.source ?? 'website',
    status: 'active',
    unsubscribeToken: token,
    channels: channelsJson,
  });
  return { success: true };
}
