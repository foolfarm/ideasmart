import { boolean, float, index, uniqueIndex, int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

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

// ── Site Users (registrazione nativa: username + email + password) ────────────
export const siteUsers = mysqlTable("site_users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  verificationToken: varchar("verificationToken", { length: 128 }).unique(),
  verificationTokenExpiresAt: timestamp("verificationTokenExpiresAt"),
  sessionToken: varchar("sessionToken", { length: 255 }).unique(),
  sessionExpiresAt: timestamp("sessionExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  // JSON array of preferred topic keys: ["ai","startup","research","finance","health","sport"]
  topicPreferences: text("topicPreferences"),
});

export type SiteUser = typeof siteUsers.$inferSelect;
export type InsertSiteUser = typeof siteUsers.$inferInsert;

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
  section: mysqlEnum("section", ["ai4business", "itsmusic", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai4business").notNull(),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
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
  // Contatore visualizzazioni: incrementato ogni volta che un utente apre l'articolo
  viewCount: int("viewCount").default(0).notNull(),
  // Data dell'ultima visualizzazione (per calcolo trend settimanale)
  lastViewedAt: timestamp("lastViewedAt"),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
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
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).notNull(),
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
  // Slot del post: morning (10:00 CET), startup-afternoon (14:30 CET), research (17:00 CET), dealroom (18:00 CET)
  // Legacy slots mantenuti per compatibilità: afternoon, evening
  slot: mysqlEnum("slot", ["morning", "startup-afternoon", "afternoon", "evening", "research", "dealroom"]).default("morning").notNull(),
  // Testo completo del post LinkedIn
  postText: text("postText").notNull(),
  // URL del post LinkedIn (es. https://www.linkedin.com/posts/...)
  linkedinUrl: varchar("linkedinUrl", { length: 1000 }),
  // Titolo editoriale estratto (prima riga o generato)
  title: varchar("title", { length: 500 }),
  // Sezione tematica del post (ai, startup, ecc.)
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai").notNull(),
  // Immagine allegata al post
  imageUrl: varchar("imageUrl", { length: 1000 }),
  // Hashtag estratti dal post
  hashtags: varchar("hashtags", { length: 500 }),
  // Hash SHA-256 del testo del post (per deduplication contenuto)
  postHash: varchar("postHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // UNIQUE constraint data+slot: garantisce un solo post per slot per giorno (idempotenza)
  dateSlotUniq: uniqueIndex("uq_linkedin_date_slot").on(table.dateLabel, table.slot),
  // Index su postHash per ricerca rapida duplicati
  postHashIdx: index("idx_linkedin_post_hash").on(table.postHash),
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

// ── Breaking News (selezionate ogni ora via AI dalle ultime notizie) ──────────
// L'AI analizza le ultime 100 notizie da tutti i canali e seleziona le 3-5
// più urgenti/straordinarie da mostrare in cima alla homepage.
export const breakingNews = mysqlTable("breaking_news", {
  id: int("id").autoincrement().primaryKey(),
  // Titolo della notizia breaking (può essere riformulato dall'AI per enfatizzare l'urgenza)
  title: varchar("title", { length: 500 }).notNull(),
  // Sommario breve (1-2 frasi) che spiega perché è breaking
  summary: text("summary").notNull(),
  // URL dell'articolo originale
  sourceUrl: varchar("sourceUrl", { length: 1000 }).notNull(),
  // Nome della fonte (es. "Corriere della Sera", "TechCrunch")
  sourceName: varchar("sourceName", { length: 255 }).notNull(),
  // Sezione tematica di provenienza
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("news").notNull(),
  // Punteggio urgenza 1-10 assegnato dall'AI (10 = massima urgenza)
  urgencyScore: int("urgencyScore").default(5).notNull(),
  // Motivo per cui è breaking (spiegazione breve dell'AI)
  breakingReason: varchar("breakingReason", { length: 500 }),
  // Data di pubblicazione originale dell'articolo
  publishedAt: varchar("publishedAt", { length: 50 }),
  // Se la notizia è ancora attiva (false = archiviata dopo 6 ore)
  isActive: boolean("isActive").default(true).notNull(),
  // ID dell'articolo originale nella tabella news_items (per evitare duplicati)
  newsItemId: int("newsItemId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  // Indice su isActive+createdAt: ottimizza la query "ultime breaking attive"
  activeCreatedIdx: index("idx_breaking_active_created").on(t.isActive, t.createdAt),
}));

export type BreakingNewsItem = typeof breakingNews.$inferSelect;
export type InsertBreakingNewsItem = typeof breakingNews.$inferInsert;

// ── IDEASMART Research ───────────────────────────────────────────────────────
export const researchReports = mysqlTable("research_reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  summary: text("summary").notNull(),
  keyFindings: text("key_findings").notNull(), // JSON array di stringhe
  source: varchar("source", { length: 200 }).notNull(), // es. "Gartner", "CB Insights", "Statista"
  sourceUrl: varchar("source_url", { length: 1000 }),
  imageUrl: varchar("image_url", { length: 1000 }),
  category: varchar("category", { length: 100 }).notNull(), // "startup" | "venture_capital" | "ai_trends" | "technology" | "market"
  region: varchar("region", { length: 100 }).notNull().default("global"), // "global" | "europe" | "italy"
  dateLabel: varchar("date_label", { length: 10 }).notNull(), // YYYY-MM-DD
  isResearchOfDay: boolean("is_research_of_day").notNull().default(false),
  viewCount: int("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  dateIdx: index("idx_research_date").on(t.dateLabel),
  categoryIdx: index("idx_research_category").on(t.category),
  researchOfDayIdx: index("idx_research_of_day").on(t.isResearchOfDay, t.dateLabel),
}));

export type ResearchReport = typeof researchReports.$inferSelect;
export type InsertResearchReport = typeof researchReports.$inferInsert;

// ── Tech/AI Events (aggregati da Luma ICS + RSS) ────────────────────────────
// Aggiornati ogni 12 ore dallo scheduler. Mostra i prossimi eventi Tech/AI/Startup italiani.
export const techEvents = mysqlTable("tech_events", {
  id: int("id").autoincrement().primaryKey(),
  // UID univoco dell'evento (da Luma o RSS guid) — usato per deduplication
  externalUid: varchar("externalUid", { length: 500 }).notNull().unique(),
  // Fonte: 'luma' | 'rss_economyup' | 'rss_agendadigitale' | ecc.
  source: varchar("source", { length: 100 }).notNull(),
  // Titolo dell'evento
  title: varchar("title", { length: 500 }).notNull(),
  // Descrizione breve (max 500 char)
  description: text("description"),
  // Luogo (es. "Milano, Lombardia" o "Online")
  location: varchar("location", { length: 500 }),
  // URL di registrazione / pagina evento
  eventUrl: varchar("eventUrl", { length: 1000 }),
  // Data/ora inizio evento (UTC timestamp ms)
  startAt: timestamp("startAt").notNull(),
  // Data/ora fine evento (UTC timestamp ms)
  endAt: timestamp("endAt"),
  // Categoria: 'ai' | 'startup' | 'vc' | 'tech' | 'innovation'
  category: mysqlEnum("category", ["ai", "startup", "vc", "tech", "innovation", "other"]).default("tech").notNull(),
  // Organizzatore
  organizer: varchar("organizer", { length: 255 }),
  // Se è un evento online
  isOnline: boolean("isOnline").default(false).notNull(),
  // Se è gratuito
  isFree: boolean("isFree").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  // Indice su startAt: ottimizza la query "prossimi eventi futuri"
  startAtIdx: index("idx_events_start_at").on(t.startAt),
  // Indice su category+startAt: ottimizza filtro per categoria
  categoryStartIdx: index("idx_events_category_start").on(t.category, t.startAt),
}));

export type TechEvent = typeof techEvents.$inferSelect;
export type InsertTechEvent = typeof techEvents.$inferInsert;

// ── Saved Articles (lista di lettura personale per siteUsers) ─────────────────
export const savedArticles = mysqlTable("saved_articles", {
  id: int("id").autoincrement().primaryKey(),
  siteUserId: int("siteUserId").notNull(),
  // Tipo di contenuto: news | editorial | reportage | analysis | startup | research
  contentType: varchar("contentType", { length: 32 }).notNull(),
  contentId: int("contentId").notNull(),
  // Snapshot del titolo al momento del salvataggio (per mostrarlo anche se il contenuto viene rimosso)
  title: varchar("title", { length: 512 }).notNull(),
  section: varchar("section", { length: 64 }),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});

export type SavedArticle = typeof savedArticles.$inferSelect;
export type InsertSavedArticle = typeof savedArticles.$inferInsert;

// ── Health Check Logs (monitoraggio uptime produzione) ────────────────────────
export const healthCheckLogs = mysqlTable("health_check_logs", {
  id: int("id").autoincrement().primaryKey(),
  allOk: boolean("allOk").notNull(),
  totalChecks: int("totalChecks").notNull(),
  passedChecks: int("passedChecks").notNull(),
  failedChecks: int("failedChecks").notNull(),
  totalTimeMs: int("totalTimeMs").notNull(),
  // JSON stringified array dei check falliti (nome, status, dettaglio, responseTimeMs)
  failedDetails: text("failedDetails"),
  // JSON stringified array di tutti i check (per analisi storica)
  fullReport: text("fullReport"),
  alertSent: boolean("alertSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type HealthCheckLog = typeof healthCheckLogs.$inferSelect;
export type InsertHealthCheckLog = typeof healthCheckLogs.$inferInsert;

// ── Demo Requests (richieste demo dalla pagina Per Giornalisti) ─────────────
export const demoRequests = mysqlTable("demo_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  profileType: mysqlEnum("profileType", [
    "giornalista_freelance",
    "editore_digitale",
    "creator_analista",
    "media_company",
    "altro",
  ]).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "demo_done", "converted", "archived"])
    .default("new")
    .notNull(),
  notified: boolean("notified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = typeof demoRequests.$inferInsert;

// ── Newsletter Sponsors (sponsor dinamici per newsletter unificata) ──────────
export const newsletterSponsors = mysqlTable("newsletter_sponsors", {
  id: int("id").autoincrement().primaryKey(),
  // Nome dello sponsor
  name: varchar("name", { length: 255 }).notNull(),
  // Titolo visualizzato nella newsletter
  headline: varchar("headline", { length: 500 }).notNull(),
  // Descrizione breve
  description: text("description").notNull(),
  // URL del sito dello sponsor (con UTM)
  url: varchar("url", { length: 1000 }).notNull(),
  // URL dell'immagine (CDN)
  imageUrl: varchar("imageUrl", { length: 1000 }),
  // Feature list (JSON array di stringhe, es. ["Data Room con NDA", "Analytics in tempo reale"])
  features: text("features"),
  // Testo del CTA button
  ctaText: varchar("ctaText", { length: 100 }).default("Scopri di più →").notNull(),
  // Posizione nella newsletter: 'primary' = sponsor del giorno (in alto), 'spotlight' = Today's Spotlight (a metà)
  placement: mysqlEnum("placement", ["primary", "spotlight"]).default("primary").notNull(),
  // Attivo o meno
  active: boolean("active").default(true).notNull(),
  // Peso per la rotazione (più alto = più frequente)
  weight: int("weight").default(1).notNull(),
  // Contatore invii (quante volte è stato incluso nella newsletter)
  sendCount: int("sendCount").default(0).notNull(),
  // Ultimo invio
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSponsor = typeof newsletterSponsors.$inferSelect;
export type InsertNewsletterSponsor = typeof newsletterSponsors.$inferInsert;

// ── Amazon Daily Deal (promo giornaliera Amazon con link affiliato) ──────────
export const amazonDailyDeals = mysqlTable("amazon_daily_deals", {
  id: int("id").autoincrement().primaryKey(),
  // Titolo del prodotto (breve, max 200 char)
  title: varchar("title", { length: 500 }).notNull(),
  // Descrizione breve del prodotto
  description: text("description").notNull(),
  // Prezzo (stringa formattata, es. "€399.00")
  price: varchar("price", { length: 50 }).notNull(),
  // URL affiliato Amazon (amzn.to short link)
  affiliateUrl: varchar("affiliateUrl", { length: 1000 }).notNull(),
  // URL immagine prodotto (CDN)
  imageUrl: varchar("imageUrl", { length: 1000 }),
  // Valutazione (es. "4.7/5")
  rating: varchar("rating", { length: 20 }),
  // Numero recensioni
  reviewCount: varchar("reviewCount", { length: 50 }),
  // Categoria prodotto
  category: varchar("category", { length: 255 }),
  // Data per cui è programmata la promo (YYYY-MM-DD)
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(),
  // Attivo o meno
  active: boolean("active").default(true).notNull(),
  // Contatore click (quante volte è stato cliccato dalla newsletter)
  clickCount: int("clickCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AmazonDailyDeal = typeof amazonDailyDeals.$inferSelect;
export type InsertAmazonDailyDeal = typeof amazonDailyDeals.$inferInsert;
