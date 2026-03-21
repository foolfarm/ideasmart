import { boolean, float, index, uniqueIndex, int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  // Newsletter a cui è iscritto: 'ai4business' | 'itsmusic' | 'both'
  newsletter: mysqlEnum("newsletter", ["ai4business", "itsmusic", "startup", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "both"]).default("ai4business").notNull(),
  source: varchar("source", { length: 64 }).default("website").notNull(),
  unsubscribeToken: varchar("unsubscribeToken", { length: 128 }).unique(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  // Canali tematici scelti dall'iscritto (JSON array): ["ai","startup","finance","health","sport","luxury","music"]
  // null = tutti i canali (comportamento legacy per iscritti pre-preferenze)
  channels: text("channels"),
  // Tracking aperture email
  totalSent: int("totalSent").default(0).notNull(),
  totalOpened: int("totalOpened").default(0).notNull(),
  lastSentAt: timestamp("lastSentAt"),
  lastOpenedAt: timestamp("lastOpenedAt"),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

// ── Email Opens (log aperture per pixel tracking 1x1) ──────────────────────
export const emailOpens = mysqlTable("email_opens", {
  id: int("id").autoincrement().primaryKey(),
  subscriberEmail: varchar("subscriberEmail", { length: 320 }).notNull(),
  campaignId: varchar("campaignId", { length: 128 }).notNull(),
  campaignSubject: varchar("campaignSubject", { length: 500 }),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  userAgent: varchar("userAgent", { length: 500 }),
  ipAddress: varchar("ipAddress", { length: 64 }),
});

export type EmailOpen = typeof emailOpens.$inferSelect;

// ── Newsletter Send Log ─────────────────────────────────────────────────────
export const newsletterSends = mysqlTable("newsletter_sends", {
  id: int("id").autoincrement().primaryKey(),
  // Sezione newsletter: 'ai4business' o 'itsmusic'
  section: mysqlEnum("section", ["ai4business", "itsmusic", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai4business").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  htmlContent: mediumtext("htmlContent").notNull(),
  recipientCount: int("recipientCount").default(0).notNull(),
  openedCount: int("openedCount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed"]).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSend = typeof newsletterSends.$inferSelect;

// ── News Items (aggiornate ogni giorno via AI) ──────────────────────────────
export const newsItems = mysqlTable("news_items", {
  id: int("id").autoincrement().primaryKey(),
  // Sezione editoriale: 'ai' = AI4Business News, 'music' = ITsMusic, 'startup' = Startup News
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  sourceName: varchar("sourceName", { length: 255 }),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  publishedAt: varchar("publishedAt", { length: 50 }),
  weekLabel: varchar("weekLabel", { length: 50 }).notNull(),
  position: int("position").default(0).notNull(),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  videoUrl: varchar("videoUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  // Indice su section: tutte le query filtrano per sezione (getLatest, getAll, ecc.)
  sectionIdx: index("idx_news_section").on(t.section),
  // Indice composto section+position: ottimizza ORDER BY position nelle query per sezione
  sectionPositionIdx: index("idx_news_section_position").on(t.section, t.position),
}));

export type NewsItem = typeof newsItems.$inferSelect;
export type InsertNewsItem = typeof newsItems.$inferInsert;

// ── Content Audit Log ───────────────────────────────────────────────────────
// Tiene traccia dei controlli di coerenza tra contenuto pubblicato e pagina di destinazione
export const contentAudit = mysqlTable("content_audit", {
  id: int("id").autoincrement().primaryKey(),
  // Tipo di contenuto auditato
  contentType: mysqlEnum("contentType", ["news", "analysis", "reportage", "startup"]).notNull(),
  contentId: int("contentId").notNull(),
  // URL verificato
  sourceUrl: varchar("sourceUrl", { length: 1000 }).notNull(),
  // Titolo del contenuto pubblicato
  publishedTitle: varchar("publishedTitle", { length: 500 }).notNull(),
  // Sommario del contenuto pubblicato
  publishedSummary: text("publishedSummary"),
  // Stato dell'audit
  status: mysqlEnum("status", ["pending", "ok", "warning", "error", "unreachable"]).default("pending").notNull(),
  // Punteggio di coerenza 0-100 (100 = perfettamente coerente)
  coherenceScore: float("coherenceScore"),
  // Note dell'audit (spiegazione del problema se status != ok)
  auditNote: text("auditNote"),
  // Testo estratto dalla pagina di destinazione (primi 2000 char)
  extractedText: text("extractedText"),
  // HTTP status code della pagina di destinazione
  httpStatus: int("httpStatus"),
  // Sezione editoriale
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  auditedAt: timestamp("auditedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentAudit = typeof contentAudit.$inferSelect;
export type InsertContentAudit = typeof contentAudit.$inferInsert;

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

// ── Daily Editorial (generato ogni giorno via AI) ───────────────────────────
export const dailyEditorial = mysqlTable("daily_editorial", {
  id: int("id").autoincrement().primaryKey(),
  // Sezione editoriale: 'ai' = AI4Business News, 'music' = ITsMusic, 'startup' = Startup News
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  dateLabel: varchar("dateLabel", { length: 20 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  body: text("body").notNull(),
  keyTrend: varchar("keyTrend", { length: 255 }),
  authorNote: text("authorNote"),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyEditorial = typeof dailyEditorial.$inferSelect;
export type InsertDailyEditorial = typeof dailyEditorial.$inferInsert;

// ── Startup of the Day / Artist of the Day ──────────────────────────────────
// Usato per 'ai' (startup) e 'music' (artista del giorno)
export const startupOfDay = mysqlTable("startup_of_day", {
  id: int("id").autoincrement().primaryKey(),
  //   // Sezione: 'ai' = Startup del giorno, 'music' = Artista del giorno, 'startup' = Startup della settimana
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  dateLabel: varchar("dateLabel", { length: 20 }),
  name: varchar("name", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 500 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).default("Italia"),
  foundedYear: varchar("foundedYear", { length: 10 }),
  funding: varchar("funding", { length: 255 }),
  whyToday: text("whyToday").notNull(),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  aiScore: int("aiScore").default(0),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StartupOfDay = typeof startupOfDay.$inferSelect;
export type InsertStartupOfDay = typeof startupOfDay.$inferInsert;

// ── Weekly Reportage ────────────────────────────────────────────────────────
export const weeklyReportage = mysqlTable("weekly_reportage", {
  id: int("id").autoincrement().primaryKey(),
  // Sezione: 'ai' = Reportage startup AI, 'music' = Reportage musica, 'startup' = Reportage Startup News
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  weekLabel: varchar("weekLabel", { length: 20 }).notNull(),
  position: int("position").default(0).notNull(),
  sectionNumber: varchar("sectionNumber", { length: 10 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  startupName: varchar("startupName", { length: 255 }).notNull(),
  headline: varchar("headline", { length: 500 }).notNull(),
  subheadline: varchar("subheadline", { length: 500 }),
  bodyText: text("bodyText").notNull(),
  quote: text("quote"),
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
  imageUrl: varchar("imageUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyReportage = typeof weeklyReportage.$inferSelect;
export type InsertWeeklyReportage = typeof weeklyReportage.$inferInsert;

// ── Market Analysis ─────────────────────────────────────────────────────────
export const marketAnalysis = mysqlTable("market_analysis", {
  id: int("id").autoincrement().primaryKey(),
  // Sezione: 'ai' = Analisi mercato AI, 'music' = Analisi mercato musicale, 'startup' = Analisi mercato startup
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  weekLabel: varchar("weekLabel", { length: 20 }).notNull(),
  position: int("position").default(0).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  summary: text("summary").notNull(),
  keyInsight: text("keyInsight"),
  dataPoint1: varchar("dataPoint1", { length: 255 }),
  dataPoint2: varchar("dataPoint2", { length: 255 }),
  dataPoint3: varchar("dataPoint3", { length: 255 }),
  marketSize: varchar("marketSize", { length: 100 }),
  growthRate: varchar("growthRate", { length: 200 }),
  italyRelevance: text("italyRelevance"),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketAnalysis = typeof marketAnalysis.$inferSelect;
export type InsertMarketAnalysis = typeof marketAnalysis.$inferInsert;

// ── Notification Preferences ────────────────────────────────────────────────
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  notifyNews: boolean("notifyNews").default(true).notNull(),
  notifyEditorial: boolean("notifyEditorial").default(true).notNull(),
  notifyStartup: boolean("notifyStartup").default(true).notNull(),
  notifyReportage: boolean("notifyReportage").default(false).notNull(),
  notifyMarket: boolean("notifyMarket").default(false).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "realtime"]).default("daily").notNull(),
  categories: text("categories"),
  prefsToken: varchar("prefsToken", { length: 128 }).unique(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

// ── Article Comments ──────────────────────────────────────────────────
export const articleComments = mysqlTable("article_comments", {
  id: int("id").autoincrement().primaryKey(),
  // Sezione: 'ai', 'music' o 'startup'
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  // Tipo articolo: 'news', 'editorial', 'startup', 'reportage', 'analysis'
  articleType: mysqlEnum("articleType", ["news", "editorial", "startup", "reportage", "analysis"]).notNull(),
  articleId: int("articleId").notNull(),
  // Autore (anonimo o con nome)
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  content: text("content").notNull(),
  // Moderazione: i commenti sono approvati automaticamente (true) o richiedono revisione
  approved: boolean("approved").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArticleComment = typeof articleComments.$inferSelect;
export type InsertArticleComment = typeof articleComments.$inferInsert;

// ── Source Reports (feedback utenti su fonti errate) ─────────────────────────
export const sourceReports = mysqlTable("source_reports", {
  id: int("id").autoincrement().primaryKey(),
  // Sezione: 'ai', 'music' o 'startup'
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).notNull(),
  // Tipo articolo
  articleType: mysqlEnum("articleType", ["news", "editorial", "startup", "reportage", "analysis"]).notNull(),
  articleId: int("articleId").notNull(),
  // URL segnalato come errato
  reportedUrl: varchar("reportedUrl", { length: 1000 }),
  // Motivo della segnalazione
  reason: mysqlEnum("reason", ["not_found", "wrong_content", "broken_link", "spam", "other"]).notNull(),
  // Nota opzionale dell'utente
  note: varchar("note", { length: 500 }),
  // IP anonimizzato per prevenire spam
  ipHash: varchar("ipHash", { length: 64 }),
  // Stato: pending → reviewed → resolved
  status: mysqlEnum("status", ["pending", "reviewed", "resolved"]).default("pending").notNull(),
  // Admin note (visibile solo in admin)
  adminNote: varchar("adminNote", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});
export type SourceReport = typeof sourceReports.$inferSelect;
export type InsertSourceReport = typeof sourceReports.$inferInsert;

// ── LinkedIn Posts (Punto del Giorno) ──────────────────────────────────────
// Ogni giorno il publisher LinkedIn salva il post pubblicato per mostrarlo
// nella sezione "Punto del Giorno" della Home di Ideasmart.
export const linkedinPosts = mysqlTable("linkedin_posts", {
  id: int("id").autoincrement().primaryKey(),
  // Data del post (YYYY-MM-DD)
  dateLabel: varchar("dateLabel", { length: 20 }).notNull(),
  // Slot del post: morning (10:30 CET), afternoon (15:00 CET) o evening (17:30 CET)
  slot: mysqlEnum("slot", ["morning", "afternoon", "evening"]).default("morning").notNull(),
  // Testo completo del post LinkedIn
  postText: text("postText").notNull(),
  // URL del post LinkedIn (es. https://www.linkedin.com/posts/...)
  linkedinUrl: varchar("linkedinUrl", { length: 1000 }),
  // Titolo editoriale estratto (prima riga o generato)
  title: varchar("title", { length: 500 }),
  // Sezione tematica del post (ai, startup, ecc.)
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"]).default("ai").notNull(),
  // Immagine allegata al post
  imageUrl: varchar("imageUrl", { length: 1000 }),
  // Hashtag estratti dal post
  hashtags: varchar("hashtags", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // UNIQUE constraint data+slot: garantisce un solo post per slot per giorno (idempotenza)
  dateSlotUniq: uniqueIndex("uq_linkedin_date_slot").on(table.dateLabel, table.slot),
}));

export type LinkedinPost = typeof linkedinPosts.$inferSelect;
export type InsertLinkedinPost = typeof linkedinPosts.$inferInsert;

// ── Barometro Snapshots (Storico Intenzioni di Voto) ──────────────────────
// Ogni giorno lo scheduler salva uno snapshot del barometro politico
// per consentire la visualizzazione del grafico storico a 4 settimane.
export const barometroSnapshots = mysqlTable("barometro_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  // Data dello snapshot (YYYY-MM-DD) — un record per giorno per partito
  dateLabel: varchar("dateLabel", { length: 20 }).notNull(),
  // Nome abbreviato del partito (es. FdI, PD, M5S)
  partito: varchar("partito", { length: 50 }).notNull(),
  // Nome completo del partito
  partitoNome: varchar("partitoNome", { length: 200 }),
  // Percentuale intenzione di voto
  percentuale: float("percentuale").notNull(),
  // Colore del partito (hex)
  colore: varchar("colore", { length: 20 }),
  // Fonte del sondaggio
  fonte: varchar("fonte", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BarometroSnapshot = typeof barometroSnapshots.$inferSelect;
export type InsertBarometroSnapshot = typeof barometroSnapshots.$inferInsert;
