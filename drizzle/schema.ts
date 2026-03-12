import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Newsletter Subscribers ──────────────────────────────────────────────────
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  source: varchar("source", { length: 64 }).default("website").notNull(),
  unsubscribeToken: varchar("unsubscribeToken", { length: 128 }).unique(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

// ── Newsletter Send Log ─────────────────────────────────────────────────────
export const newsletterSends = mysqlTable("newsletter_sends", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 500 }).notNull(),
  htmlContent: text("htmlContent").notNull(),
  recipientCount: int("recipientCount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed"]).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSend = typeof newsletterSends.$inferSelect;

// ── News Items (aggiornate ogni giorno via AI) ────────────────────────────────────────────
export const newsItems = mysqlTable("news_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  sourceName: varchar("sourceName", { length: 255 }),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  publishedAt: varchar("publishedAt", { length: 50 }),
  weekLabel: varchar("weekLabel", { length: 50 }).notNull(),
  position: int("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = typeof newsItems.$inferInsert;

// ── News Refresh Log ────────────────────────────────────────────────────────
export const newsRefreshLog = mysqlTable("news_refresh_log", {
  id: int("id").autoincrement().primaryKey(),
  weekLabel: varchar("weekLabel", { length: 50 }).notNull(),
  itemCount: int("itemCount").default(0).notNull(),
  status: mysqlEnum("status", ["success", "failed"]).default("success").notNull(),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsRefreshLog = typeof newsRefreshLog.$inferSelect;

// ── Daily Editorial (generato ogni giorno via AI) ────────────────────────────
export const dailyEditorial = mysqlTable("daily_editorial", {
  id: int("id").autoincrement().primaryKey(),
  dateLabel: varchar("dateLabel", { length: 20 }).notNull(), // es. "2026-03-12"
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  body: text("body").notNull(),           // testo completo dell'editoriale
  keyTrend: varchar("keyTrend", { length: 255 }), // trend principale del giorno
  authorNote: text("authorNote"),          // nota finale del "direttore"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyEditorial = typeof dailyEditorial.$inferSelect;
export type InsertDailyEditorial = typeof dailyEditorial.$inferInsert;

// ── Startup of the Day (identificata ogni giorno via AI + ricerca web) ───────
export const startupOfDay = mysqlTable("startup_of_day", {
  id: int("id").autoincrement().primaryKey(),
  dateLabel: varchar("dateLabel", { length: 20 }).notNull(), // es. "2026-03-12"
  name: varchar("name", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 500 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).default("Italia"),
  foundedYear: varchar("foundedYear", { length: 10 }),
  funding: varchar("funding", { length: 255 }),  // es. "Series A — €5M"
  whyToday: text("whyToday").notNull(),           // perché è rilevante oggi
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  aiScore: int("aiScore").default(0),             // punteggio AI 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StartupOfDay = typeof startupOfDay.$inferSelect;
export type InsertStartupOfDay = typeof startupOfDay.$inferInsert;

// ── Weekly Reportage (4 reportage su startup AI italiane, generati ogni lunedì alle 00:00) ──
export const weeklyReportage = mysqlTable("weekly_reportage", {
  id: int("id").autoincrement().primaryKey(),
  weekLabel: varchar("weekLabel", { length: 20 }).notNull(), // es. "2026-W11"
  position: int("position").default(0).notNull(),           // 1-4
  sectionNumber: varchar("sectionNumber", { length: 10 }).notNull(), // es. "01"
  category: varchar("category", { length: 100 }).notNull(),  // es. "Reportage · AI Recruiting"
  startupName: varchar("startupName", { length: 255 }).notNull(),
  headline: varchar("headline", { length: 500 }).notNull(),  // titolo principale
  subheadline: varchar("subheadline", { length: 500 }),       // sottotitolo
  bodyText: text("bodyText").notNull(),                       // testo principale (2 paragrafi)
  quote: text("quote"),                                       // citazione in evidenza
  feature1: varchar("feature1", { length: 500 }),
  feature2: varchar("feature2", { length: 500 }),
  feature3: varchar("feature3", { length: 500 }),
  feature4: varchar("feature4", { length: 500 }),
  stat1Value: varchar("stat1Value", { length: 50 }),
  stat1Label: varchar("stat1Label", { length: 100 }),
  stat2Value: varchar("stat2Value", { length: 50 }),
  stat2Label: varchar("stat2Label", { length: 100 }),
  stat3Value: varchar("stat3Value", { length: 50 }),
  stat3Label: varchar("stat3Label", { length: 100 }),
  ctaLabel: varchar("ctaLabel", { length: 100 }),
  ctaUrl: varchar("ctaUrl", { length: 500 }),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyReportage = typeof weeklyReportage.$inferSelect;
export type InsertWeeklyReportage = typeof weeklyReportage.$inferInsert;

// ── Market Analysis (4 analisi di mercato AI, aggiornate ogni 7 giorni) ──────
export const marketAnalysis = mysqlTable("market_analysis", {
  id: int("id").autoincrement().primaryKey(),
  weekLabel: varchar("weekLabel", { length: 20 }).notNull(),   // es. "2026-W11"
  position: int("position").default(0).notNull(),              // 1-4
  source: varchar("source", { length: 255 }).notNull(),        // es. "CB Insights"
  sourceUrl: varchar("sourceUrl", { length: 1000 }),           // link originale
  category: varchar("category", { length: 100 }).notNull(),    // es. "AI & Fintech"
  title: varchar("title", { length: 500 }).notNull(),          // titolo analisi
  subtitle: varchar("subtitle", { length: 500 }),              // sottotitolo
  summary: text("summary").notNull(),                          // sintesi (3-4 paragrafi)
  keyInsight: text("keyInsight"),                              // insight principale
  dataPoint1: varchar("dataPoint1", { length: 255 }),          // dato chiave 1
  dataPoint2: varchar("dataPoint2", { length: 255 }),          // dato chiave 2
  dataPoint3: varchar("dataPoint3", { length: 255 }),          // dato chiave 3
  marketSize: varchar("marketSize", { length: 100 }),          // dimensione mercato
  growthRate: varchar("growthRate", { length: 50 }),           // tasso crescita
  italyRelevance: text("italyRelevance"),                      // rilevanza per l'Italia
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketAnalysis = typeof marketAnalysis.$inferSelect;
export type InsertMarketAnalysis = typeof marketAnalysis.$inferInsert;

// ── (placeholder rimosso) ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
