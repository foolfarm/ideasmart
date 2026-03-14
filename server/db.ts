import { eq, desc, count } from "drizzle-orm";
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
export async function getLatestNews(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsItems)
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
export async function getLatestEditorial() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dailyEditorial)
    .orderBy(desc(dailyEditorial.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTodayEditorial(dateLabel: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(dailyEditorial)
    .where(eq(dailyEditorial.dateLabel, dateLabel))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function saveEditorial(data: InsertDailyEditorial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(dailyEditorial).values(data);
}

// ── Startup of the Day ──────────────────────────────────────────────────────────────────────────────
export async function getLatestStartupOfDay() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(startupOfDay)
    .orderBy(desc(startupOfDay.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getTodayStartup(dateLabel: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(startupOfDay)
    .where(eq(startupOfDay.dateLabel, dateLabel))
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

export async function getLatestWeeklyReportage() {
  const db = await getDb();
  if (!db) return [];
  // Prende i 4 reportage della settimana più recente
  const latest = await db.select().from(weeklyReportage)
    .orderBy(desc(weeklyReportage.createdAt))
    .limit(1);
  if (latest.length === 0) return [];
  const weekLabel = latest[0].weekLabel;
  return db.select().from(weeklyReportage)
    .where(eq(weeklyReportage.weekLabel, weekLabel))
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
export async function getLatestMarketAnalysis() {
  const db = await getDb();
  if (!db) return [];
  const latest = await db.select({ weekLabel: marketAnalysis.weekLabel })
    .from(marketAnalysis)
    .orderBy(desc(marketAnalysis.createdAt))
    .limit(1);
  if (latest.length === 0) return [];
  const weekLabel = latest[0].weekLabel;
  return db.select().from(marketAnalysis)
    .where(eq(marketAnalysis.weekLabel, weekLabel))
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
  return db.select({
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
  }).from(subscribers).orderBy(subscribers.subscribedAt);
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
