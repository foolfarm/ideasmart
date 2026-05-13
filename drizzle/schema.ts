import { boolean, float, index, uniqueIndex, int, json, mediumtext, mysqlEnum, mysqlTable, text, timestamp, tinyint, varchar } from "drizzle-orm/mysql-core";
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
  // Tipo newsletter: 'morning' = BUONGIORNO 08:30, 'ppv' = BUONPOMERIGGIO PPV 17:30
  newsletterType: mysqlEnum("newsletter_type", ["morning", "ppv"]).default("morning").notNull(),
  // Sezione newsletter: 'ai4business' o 'itsmusic'
  section: mysqlEnum("section", ["ai4business", "itsmusic", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom"]).default("ai4business").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  htmlContent: mediumtext("htmlContent").notNull(),
  recipientCount: int("recipientCount").default(0).notNull(),
  sentCount: int("sent_count").default(0).notNull(),
  failedCount: int("failed_count").default(0).notNull(),
  openedCount: int("openedCount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "sending", "sent", "failed", "approved"]).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  // Approvazione manuale obbligatoria prima dell'invio massivo
  approvalToken: varchar("approvalToken", { length: 128 }).unique(),
  approvedAt: timestamp("approvedAt"),
  approvedBy: varchar("approvedBy", { length: 255 }),
  // Lock atomico: una sola preview per giorno per tipo (YYYY-MM-DD in CET)
  // Unique index su (send_date, newsletter_type) garantisce nessun duplicato a livello DB.
  sendDate: varchar("send_date", { length: 10 }),  // es. '2026-04-21'
}, (t) => ({
  // Unique index su (send_date, newsletter_type): un solo invio per giorno per tipo
  uniqSendDateType: uniqueIndex("uq_newsletter_send_date_type").on(t.sendDate, t.newsletterType),
}));

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
  // VERIFY: hash SHA-256 univoco (titolo+summary+sourceUrl) — certifica l'articolo
  verifyHash: varchar("verifyHash", { length: 64 }),
  // IPFS/PINATA: CID del Verification Report ancorato su IPFS via Pinata
  // Formato: Qm... (CIDv0) o bafy... (CIDv1)
  ipfsCid: varchar("ipfsCid", { length: 128 }),
  // URL pubblico IPFS gateway (https://gateway.pinata.cloud/ipfs/<cid>)
  ipfsUrl: varchar("ipfsUrl", { length: 512 }),
  // Timestamp del pinning su IPFS
  ipfsPinnedAt: timestamp("ipfsPinnedAt"),
  // VERIFY ENGINE: report JSON completo (claims, corroboration, trust score)
  verifyReport: json("verifyReport"),
  // VERIFY ENGINE: trust score numerico [0.0 - 1.0]
  trustScore: float("trustScore"),
  // VERIFY ENGINE: grade (A/B/C/D/F)
  trustGrade: varchar("trustGrade", { length: 1 }),
  // TRADUZIONE EN: titolo e summary in inglese (generati automaticamente da Claude)
  titleEn: varchar("titleEn", { length: 500 }),
  summaryEn: text("summaryEn"),
  // PROOFPRESS VERIFY API ESTERNA (proofpressverify.com)
  ppvHash: varchar("ppvHash", { length: 64 }),
  ppvDocumentId: int("ppvDocumentId"),
  ppvIpfsCid: varchar("ppvIpfsCid", { length: 128 }),
  ppvIpfsUrl: varchar("ppvIpfsUrl", { length: 512 }),
  ppvTrustScore: float("ppvTrustScore"),
  ppvTrustGrade: varchar("ppvTrustGrade", { length: 1 }),
  ppvCertifiedAt: timestamp("ppvCertifiedAt"),
  ppvReport: json("ppvReport"),
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
  // Traduzione EN (generata automaticamente da Claude)
  titleEn: varchar("titleEn", { length: 500 }),
  subtitleEn: varchar("subtitleEn", { length: 500 }),
  bodyEn: mediumtext("bodyEn"),
  translatedAt: timestamp("translatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  // Unique index su titolo: previene inserimento di editoriali duplicati
  titleUniq: uniqueIndex("uq_daily_editorial_title").on(t.title),
}));

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
  // English evening slots: en-evening-news (20:00), en-ai-research (21:30), en-research (22:30), en-research-late (23:30)
  slot: mysqlEnum("slot", ["morning", "editorial", "ai-research-morning", "research", "research-afternoon", "startup-afternoon", "startup-evening", "afternoon", "evening", "dealroom", "ai-tool-radar", "en-evening-news", "en-ai-research", "en-research", "en-research-late"]).default("morning").notNull(),
  // Testo completo del post LinkedIn
  postText: text("postText").notNull(),
  // URL del post LinkedIn (es. https://www.linkedin.com/posts/...)
  linkedinUrl: varchar("linkedinUrl", { length: 1000 }),
  // Titolo editoriale estratto (prima riga o generato)
  title: varchar("title", { length: 500 }),
  // Sezione tematica del post (ai, startup, ecc.)
  section: mysqlEnum("section", ["ai", "music", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom", "research"]).default("ai").notNull(),
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
export type InsertBreakingNewsItem = typeof breakingNews.$inferInsert;;

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
  // Stato scraping metadati: pending | done | failed
  scrapingStatus: mysqlEnum("scrapingStatus", ["pending", "done", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AmazonDailyDeal = typeof amazonDailyDeals.$inferSelect;
export type InsertAmazonDailyDeal = typeof amazonDailyDeals.$inferInsert;

// ── AI Dealflow — selezioni startup giornaliere ─────────────────────────────
export const dealflowPicks = mysqlTable("dealflow_picks", {
  id: int("id").autoincrement().primaryKey(),
  publishDate: varchar("publishDate", { length: 10 }).notNull(), // YYYY-MM-DD
  rank: int("rank").notNull(), // 1-10
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"), // USP / cosa fa
  funding: varchar("funding", { length: 255 }), // es. "Series A $25M"
  valuation: varchar("valuation", { length: 255 }), // es. "$170M"
  rating: mysqlEnum("rating", ["INVEST", "INVEST+", "INVEST++"]).notNull(),
  link: text("link"), // URL startup o articolo
  source: varchar("source", { length: 128 }), // fonte RSS
  sector: varchar("sector", { length: 128 }), // es. "Cybersecurity", "HealthTech"
  country: varchar("country", { length: 64 }), // es. "Italia", "Danimarca"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DealflowPick = typeof dealflowPicks.$inferSelect;
export type InsertDealflowPick = typeof dealflowPicks.$inferInsert;


// ── AI Tool Submissions (utenti propongono il proprio tool AI) ─────────────
export const toolSubmissions = mysqlTable("tool_submissions", {
  id: int("id").autoincrement().primaryKey(),
  toolName: varchar("toolName", { length: 255 }).notNull(),
  toolUrl: text("toolUrl").notNull(),
  description: text("description"),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  submitterName: varchar("submitterName", { length: 255 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "featured"]).default("pending").notNull(),
  featuredDate: varchar("featuredDate", { length: 10 }), // YYYY-MM-DD quando è stato inserito nella newsletter
  emoji: varchar("emoji", { length: 10 }),
  shortDescription: varchar("shortDescription", { length: 500 }), // breve descrizione per la newsletter
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export type ToolSubmission = typeof toolSubmissions.$inferSelect;
export type InsertToolSubmission = typeof toolSubmissions.$inferInsert;

// ── Newsletter Feedback ────────────────────────────────────────────────────
export const newsletterFeedback = mysqlTable("newsletter_feedback", {
  id: int("id").autoincrement().primaryKey(),
  rating: mysqlEnum("rating", ["great", "good", "meh", "bad"]).notNull(),
  comment: text("comment"),
  email: varchar("email", { length: 320 }),
  newsletterDate: varchar("newsletterDate", { length: 10 }), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterFeedback = typeof newsletterFeedback.$inferSelect;
export type InsertNewsletterFeedback = typeof newsletterFeedback.$inferInsert;

// ── Open Source AI Tools (curati dalla redazione) ──────────────────────────
export const openSourceTools = mysqlTable("open_source_tools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  repoUrl: text("repoUrl").notNull(), // GitHub/GitLab URL
  stars: int("stars").default(0),
  category: varchar("category", { length: 128 }), // es. "LLM", "Computer Vision", "NLP"
  emoji: varchar("emoji", { length: 10 }),
  active: boolean("active").default(true).notNull(),
  featuredDate: varchar("featuredDate", { length: 10 }), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OpenSourceTool = typeof openSourceTools.$inferSelect;
export type InsertOpenSourceTool = typeof openSourceTools.$inferInsert;


// ══════════════════════════════════════════════════════════════════════════════
// NUOVI CANALI — RIPOSIZIONAMENTO IDEASMART (Apr 2026)
// ══════════════════════════════════════════════════════════════════════════════

// ── RSS Feed Sources (fonti configurate per ogni canale) ──────────────────────
export const rssFeedSources = mysqlTable("rss_feed_sources", {
  id: int("id").autoincrement().primaryKey(),
  // Canale di appartenenza
  channel: mysqlEnum("channel", [
    "copy-paste-ai",
    "automate-with-ai",
    "make-money-with-ai",
    "daily-ai-tools",
    "verified-ai-news",
    "ai-opportunities",
  ]).notNull(),
  // Nome della fonte (es. "Reddit ChatGPT", "Zapier Blog")
  name: varchar("name", { length: 255 }).notNull(),
  // URL del feed RSS
  feedUrl: varchar("feedUrl", { length: 1000 }).notNull(),
  // Attivo o meno
  active: boolean("active").default(true).notNull(),
  // Ultimo fetch riuscito
  lastFetchedAt: timestamp("lastFetchedAt"),
  // Contatore errori consecutivi
  errorCount: int("errorCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RssFeedSource = typeof rssFeedSources.$inferSelect;
export type InsertRssFeedSource = typeof rssFeedSources.$inferInsert;

// ── Channel Content (contenuti generati dall'AI agent per ogni canale) ────────
export const channelContent = mysqlTable("channel_content", {
  id: int("id").autoincrement().primaryKey(),
  // Canale
  channel: mysqlEnum("channel", [
    "start-here",
    "copy-paste-ai",
    "automate-with-ai",
    "make-money-with-ai",
    "daily-ai-tools",
    "verified-ai-news",
    "ai-opportunities",
  ]).notNull(),
  // Titolo (outcome-driven, max 3000 char per post)
  title: varchar("title", { length: 500 }).notNull(),
  // Sottotitolo / tagline
  subtitle: varchar("subtitle", { length: 500 }),
  // Corpo del contenuto (markdown, max 3000 char)
  body: text("body").notNull(),
  // Categoria interna (es. "business", "studio", "marketing" per Copy&Paste)
  category: varchar("category", { length: 128 }),
  // "Cosa fare ORA" — azione concreta che chiude ogni contenuto
  actionItem: text("actionItem"),
  // Prompt pronto (per Copy & Paste AI)
  promptText: text("promptText"),
  // Fonte RSS originale che ha ispirato il contenuto
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  sourceName: varchar("sourceName", { length: 255 }),
  // Immagine (CDN URL)
  imageUrl: varchar("imageUrl", { length: 1000 }),
  // Link esterno (tool URL, startup URL, ecc.)
  externalUrl: varchar("externalUrl", { length: 1000 }),
  // Data di pubblicazione (YYYY-MM-DD)
  publishDate: varchar("publishDate", { length: 10 }).notNull(),
  // Posizione nell'ordine del giorno
  position: int("position").default(0).notNull(),
  // Stato
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  // Contatore visualizzazioni
  viewCount: int("viewCount").default(0).notNull(),
  // ProofPress Verify — certificazione esterna (proofpressverify.com)
  ppvHash: varchar("ppvHash", { length: 64 }),
  ppvDocumentId: int("ppvDocumentId"),
  ppvIpfsCid: varchar("ppvIpfsCid", { length: 128 }),
  ppvIpfsUrl: varchar("ppvIpfsUrl", { length: 512 }),
  ppvTrustScore: float("ppvTrustScore"),
  ppvTrustGrade: varchar("ppvTrustGrade", { length: 1 }),
  ppvCertifiedAt: timestamp("ppvCertifiedAt"),
  ppvReport: json("ppvReport"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  channelIdx: index("idx_channel_content_channel").on(t.channel),
  channelDateIdx: index("idx_channel_content_channel_date").on(t.channel, t.publishDate),
}));

export type ChannelContent = typeof channelContent.$inferSelect;
export type InsertChannelContent = typeof channelContent.$inferInsert;

// ── RSS Ingest Log (log di ingestione per evitare duplicati) ──────────────────
export const rssIngestLog = mysqlTable("rss_ingest_log", {
  id: int("id").autoincrement().primaryKey(),
  // URL originale dell'articolo RSS (unique per evitare duplicati)
  articleUrl: varchar("articleUrl", { length: 1000 }).notNull(),
  // Titolo originale
  originalTitle: varchar("originalTitle", { length: 500 }),
  // Canale a cui è stato assegnato
  channel: varchar("channel", { length: 64 }).notNull(),
  // ID del contenuto generato (null se scartato)
  channelContentId: int("channelContentId"),
  // Stato: processed = contenuto generato, skipped = scartato dal filtro AI
  status: mysqlEnum("status", ["processed", "skipped", "error"]).default("processed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  articleUrlIdx: uniqueIndex("idx_rss_ingest_article_url").on(t.articleUrl),
}));

export type RssIngestLog = typeof rssIngestLog.$inferSelect;
export type InsertRssIngestLog = typeof rssIngestLog.$inferInsert;

// ── Offerta Leads (richieste dai form /offerta/creator, /offerta/editori, /offerta/aziende) ──
export const offertaLeads = mysqlTable("offerta_leads", {
  id: int("id").autoincrement().primaryKey(),
  // Fonte del form: 'creator', 'editori', 'aziende'
  source: mysqlEnum("source", ["creator", "editori", "aziende"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  // Azienda o testata (obbligatorio per editori/aziende)
  org: varchar("org", { length: 255 }),
  message: text("message"),
  // Stato lead: 'new' = non letto, 'contacted' = contattato, 'closed' = chiuso
  status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OffertaLead = typeof offertaLeads.$inferSelect;
export type InsertOffertaLead = typeof offertaLeads.$inferInsert;

// ── Alert Logs (storico alert di sistema: health check, diversity, ecc.) ──────
export const alertLogs = mysqlTable("alert_logs", {
  id: int("id").autoincrement().primaryKey(),
  // Tipo alert: 'health_check' | 'diversity' | 'linkedin' | 'newsletter' | 'system'
  type: mysqlEnum("type", ["health_check", "diversity", "linkedin", "newsletter", "system"]).notNull(),
  // Severità: 'critical' | 'warning' | 'info'
  severity: mysqlEnum("severity", ["critical", "warning", "info"]).default("warning").notNull(),
  // Titolo breve dell'alert
  title: varchar("title", { length: 255 }).notNull(),
  // Messaggio dettagliato
  message: text("message").notNull(),
  // Se l'email è stata inviata
  emailSent: boolean("emailSent").default(false).notNull(),
  // Se l'alert è stato letto dall'admin
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AlertLog = typeof alertLogs.$inferSelect;
export type InsertAlertLog = typeof alertLogs.$inferInsert;

// ── System Settings (key-value persistente per cooldown e configurazioni) ──────
export const systemSettings = mysqlTable("system_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SystemSetting = typeof systemSettings.$inferSelect;

// ── Banner Manchette (sistema rotazione pubblicitaria) ──────────────────────
export const banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  clickUrl: text("clickUrl").notNull(),
  // Slot: 'left' | 'right' | 'both' | 'sidebar' | 'horizontal' | 'all'
  // 'all' = manchette sx + dx + sidebar 300x250 (tutte le posizioni contemporaneamente)
  slot: mysqlEnum("slot", ["left", "right", "both", "sidebar", "horizontal", "all"]).default("both").notNull(),
  // Stato: attivo/disattivo
  active: boolean("active").default(true).notNull(),
  // Peso rotazione 1-10 (default 5)
  weight: int("weight").default(5).notNull(),
  // Scheduling opzionale
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  // Contatori aggregati (cache per performance)
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  // Click provenienti dalla newsletter (tracciamento separato)
  newsletterClicks: int("newsletterClicks").default(0).notNull(),
  // Ordinamento drag&drop
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

// ── Banner Events (tracking impression e click) ─────────────────────────────
export const bannerEvents = mysqlTable("banner_events", {
  id: int("id").autoincrement().primaryKey(),
  bannerId: int("bannerId").notNull(),
  // Tipo evento: 'impression' | 'click'
  eventType: mysqlEnum("eventType", ["impression", "click"]).notNull(),
  slot: mysqlEnum("slot", ["left", "right", "sidebar", "horizontal", "all", "newsletter"]).notNull(),
  // Sorgente: 'web' (click dal sito) | 'newsletter' (click dall'email)
  source: mysqlEnum("source", ["web", "newsletter"]).default("web").notNull(),
  userAgent: varchar("userAgent", { length: 512 }),
  referrer: varchar("referrer", { length: 512 }),
  // ID dell'invio newsletter (se source = 'newsletter')
  newsletterSendId: int("newsletterSendId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BannerEvent = typeof bannerEvents.$inferSelect;
export type InsertBannerEvent = typeof bannerEvents.$inferInsert;

// ── Banner Settings (configurazione globale rotazione) ──────────────────────
export const bannerSettings = mysqlTable("banner_settings", {
  id: int("id").autoincrement().primaryKey(),
  rotationIntervalMs: int("rotationIntervalMs").default(15000).notNull(),
  transition: mysqlEnum("transition", ["fade", "slide", "none"]).default("fade").notNull(),
  transitionDurationMs: int("transitionDurationMs").default(400).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BannerSettings = typeof bannerSettings.$inferSelect;

// ── Journalist Portal ────────────────────────────────────────────────────────
// Giornalisti accreditati con chiave di firma univoca per certificazione Verify

export const journalists = mysqlTable("journalists", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 1000 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  // Chiave pubblica univoca — inclusa nel payload SHA-256 per certificare la paternità
  journalistKey: varchar("journalistKey", { length: 64 }).notNull().unique(),
  isActive: boolean("isActive").default(true).notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).unique(),
  sessionExpiresAt: timestamp("sessionExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  totalArticles: int("totalArticles").default(0).notNull(),
  avgTrustScore: float("avgTrustScore"),
});
export type Journalist = typeof journalists.$inferSelect;
export type InsertJournalist = typeof journalists.$inferInsert;

// Articoli scritti dai giornalisti accreditati
export const journalistArticles = mysqlTable("journalist_articles", {
  id: int("id").autoincrement().primaryKey(),
  journalistId: int("journalistId").notNull().references(() => journalists.id),
  title: varchar("title", { length: 500 }).notNull(),
  body: mediumtext("body").notNull(),
  summary: text("summary"),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  // draft → review → published | rejected
  status: mysqlEnum("status", ["draft", "review", "published", "rejected"]).default("draft").notNull(),
  // Hash SHA-256 che include journalistKey — certifica autore + contenuto
  verifyHash: varchar("verifyHash", { length: 64 }),
  // Bollino pubblico: PP-J-XXXXXXXXXXXXXXXX
  verifyBadge: varchar("verifyBadge", { length: 32 }),
  verifyReport: json("verifyReport"),
  trustScore: float("trustScore"),
  trustGrade: varchar("trustGrade", { length: 1 }),
  publishedAt: timestamp("publishedAt"),
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  newsItemId: int("newsItemId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  journalistIdx: index("idx_ja_journalist").on(t.journalistId),
  statusIdx: index("idx_ja_status").on(t.status),
}));
export type JournalistArticle = typeof journalistArticles.$inferSelect;
export type InsertJournalistArticle = typeof journalistArticles.$inferInsert;

// ── ProofPress Verify SaaS — B2B Layer ───────────────────────────────────────
// Namespace isolato: verify_* — nessuna dipendenza circolare con il magazine.
// Progettato per essere estratto in repo separato nella Fase 2.

// Organizzazioni clienti (editori B2B che acquistano Verify come SaaS)
export const verifyOrganizations = mysqlTable("verify_organizations", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  plan: mysqlEnum("plan", ["essential", "premiere", "professional", "custom"]).default("essential").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  status: mysqlEnum("status", ["trial", "active", "suspended", "cancelled"]).default("trial").notNull(),
  notes: text("notes"),
  trialEndsAt: timestamp("trialEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  slugIdx: uniqueIndex("uq_verify_org_slug").on(t.slug),
  statusIdx: index("idx_verify_org_status").on(t.status),
}));
export type VerifyOrganization = typeof verifyOrganizations.$inferSelect;
export type InsertVerifyOrganization = typeof verifyOrganizations.$inferInsert;

// Chiavi API per integrazione redazionale
export const verifyApiKeys = mysqlTable("verify_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => verifyOrganizations.id),
  keyPrefix: varchar("keyPrefix", { length: 24 }).notNull(),
  keyHash: varchar("keyHash", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 128 }),
  canVerify: boolean("canVerify").default(true).notNull(),
  canReadReports: boolean("canReadReports").default(true).notNull(),
  canManageOrg: boolean("canManageOrg").default(false).notNull(),
  rateLimit: int("rateLimit").default(100).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
}, (t) => ({
  orgIdx: index("idx_verify_apikey_org").on(t.organizationId),
  hashIdx: uniqueIndex("uq_verify_apikey_hash").on(t.keyHash),
}));
export type VerifyApiKey = typeof verifyApiKeys.$inferSelect;
export type InsertVerifyApiKey = typeof verifyApiKeys.$inferInsert;

// Sottoscrizioni e consumo mensile per ogni organizzazione
export const verifySubscriptions = mysqlTable("verify_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => verifyOrganizations.id),
  plan: mysqlEnum("plan", ["essential", "premiere", "professional", "custom"]).notNull(),
  articlesLimit: int("articlesLimit").notNull(),
  journalistSeats: int("journalistSeats").default(2).notNull(),
  articlesUsed: int("articlesUsed").default(0).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeStatus: varchar("stripeStatus", { length: 64 }),
  priceMonthly: int("priceMonthly").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  status: mysqlEnum("status", ["active", "past_due", "cancelled", "trial"]).default("trial").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  orgIdx: index("idx_verify_sub_org").on(t.organizationId),
  stripeIdx: index("idx_verify_sub_stripe").on(t.stripeSubscriptionId),
  statusIdx: index("idx_verify_sub_status").on(t.status),
}));
export type VerifySubscription = typeof verifySubscriptions.$inferSelect;
export type InsertVerifySubscription = typeof verifySubscriptions.$inferInsert;

// ─── OSSERVATORIO TECH — Articoli pubblicati da Andrea Cinelli ───────────────
export const osservatorioArticles = mysqlTable("osservatorio_articles", {
  id: int("id").autoincrement().primaryKey(),
  dateLabel: varchar("dateLabel", { length: 20 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  articleUrl: varchar("articleUrl", { length: 1000 }).notNull(),
  publication: varchar("publication", { length: 255 }).default("ProofPress").notNull(),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  tags: varchar("tags", { length: 500 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  // VERIFY: hash SHA-256 (titolo+url) — certifica il contenuto al momento dell'indicizzazione
  verifyHash: varchar("verifyHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  dateLabelIdx: index("idx_osservatorio_date").on(t.dateLabel),
  sortIdx: index("idx_osservatorio_sort").on(t.sortOrder),
  titleUniq: uniqueIndex("uq_osservatorio_title").on(t.title),
}));
export type OsservatorioArticle = typeof osservatorioArticles.$inferSelect;
export type InsertOsservatorioArticle = typeof osservatorioArticles.$inferInsert;

// ── Osservatorio Tech Comments ──────────────────────────────────────────────
// Commenti dei lettori iscritti agli articoli dell'Osservatorio Tech
export const osservatorioComments = mysqlTable("osservatorio_comments", {
  id: int("id").autoincrement().primaryKey(),
  // Riferimento all'articolo commentato (osservatorio_articles.id)
  articleId: int("articleId").notNull(),
  // Autore del commento: userId (Manus OAuth) o siteUserId (registrazione nativa)
  userId: int("userId"),
  siteUserId: int("siteUserId"),
  // Nome visualizzato (denormalizzato per performance)
  authorName: varchar("authorName", { length: 255 }).notNull(),
  // Testo del commento
  body: text("body").notNull(),
  // Moderazione: pending → approved | rejected
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  articleIdx: index("idx_comments_article").on(t.articleId),
  statusIdx: index("idx_comments_status").on(t.status),
}));

export type OsservatorioComment = typeof osservatorioComments.$inferSelect;
export type InsertOsservatorioComment = typeof osservatorioComments.$inferInsert;

// ── Creator Quotes — Preventivi per ProofPress Creator ──────────────────────
// Raccoglie le richieste di preventivo dal wizard /preventivo-creator
export const creatorQuotes = mysqlTable("creator_quotes", {
  id: int("id").autoincrement().primaryKey(),
  // Tipo di progetto editoriale
  projectType: mysqlEnum("projectType", [
    "giornale_settoriale",
    "newsletter_aziendale",
    "blog_aziendale",
    "media_startup",
    "altro"
  ]).notNull(),
  // Mono o multi-settore
  sectorType: mysqlEnum("sectorType", ["mono", "multi"]).notNull(),
  // Settori di interesse (JSON array di stringhe)
  sectors: json("sectors").$type<string[]>().notNull(),
  // Numero di fonti desiderate
  sourcesCount: mysqlEnum("sourcesCount", ["fino_a_10", "10_50", "50_100", "oltre_100"]).notNull(),
  // Sistema Verify incluso
  includeVerify: tinyint("includeVerify").default(0).notNull(),
  // LLM: proprio o incluso nel servizio
  llmType: mysqlEnum("llmType", ["incluso", "proprio"]).notNull(),
  // Qualità LLM desiderata
  llmQuality: mysqlEnum("llmQuality", ["base", "medio", "top"]).notNull(),
  // Frequenza di pubblicazione
  publishFrequency: mysqlEnum("publishFrequency", ["giornaliera", "settimanale", "mensile"]).notNull(),
  // Dati di contatto
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 255 }).notNull(),
  contactCompany: varchar("contactCompany", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  // Note aggiuntive
  notes: text("notes"),
  // Status del lead
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  statusIdx: index("idx_creator_quotes_status").on(t.status),
  emailIdx: index("idx_creator_quotes_email").on(t.contactEmail),
  createdIdx: index("idx_creator_quotes_created").on(t.createdAt),
}));
export type CreatorQuote = typeof creatorQuotes.$inferSelect;
export type InsertCreatorQuote = typeof creatorQuotes.$inferInsert;

// ── Verify Quotes — Preventivi wizard /preventivo-*-verify ──────────────────
// Raccoglie le richieste di preventivo per i tre prodotti Verify
export const verifyQuotes = mysqlTable("verify_quotes", {
  id: int("id").autoincrement().primaryKey(),
  // Tipo di prodotto Verify
  productType: mysqlEnum("productType", [
    "news_verify",
    "info_verify",
    "email_verify"
  ]).notNull(),
  // ── Campi comuni ──────────────────────────────────────────────────────────
  // Numero di contenuti da verificare al mese
  volumePerMonth: mysqlEnum("volumePerMonth", [
    "fino_a_100",
    "100_1000",
    "1000_10000",
    "oltre_10000"
  ]).notNull(),
  // Integrazione desiderata
  integrationMode: mysqlEnum("integrationMode", [
    "api",
    "dashboard",
    "entrambi"
  ]).notNull(),
  // Settori di applicazione (JSON array)
  sectors: json("sectors").$type<string[]>().notNull(),
  // ── Campi specifici News Verify ────────────────────────────────────────────
  // Numero di fonti da monitorare (solo news_verify)
  sourcesCount: mysqlEnum("sourcesCount", [
    "fino_a_10", "10_50", "50_100", "oltre_100"
  ]),
  // Certificazione IPFS inclusa
  includeIpfs: tinyint("includeIpfs").default(0).notNull(),
  // ── Campi specifici Info Verify ────────────────────────────────────────────
  // Tipo di contenuto da verificare (solo info_verify)
  contentType: mysqlEnum("contentType", [
    "documenti_aziendali",
    "comunicati_stampa",
    "report_analisi",
    "contenuti_social",
    "altro"
  ]),
  // ── Campi specifici Email Verify ───────────────────────────────────────────
  // Piattaforma email (solo email_verify)
  emailPlatform: mysqlEnum("emailPlatform", [
    "sendgrid",
    "mailchimp",
    "hubspot",
    "altro",
    "non_so"
  ]),
  // Dimensione lista email
  listSize: mysqlEnum("listSize", [
    "fino_a_1000",
    "1000_10000",
    "10000_100000",
    "oltre_100000"
  ]),
  // ── Dati di contatto ──────────────────────────────────────────────────────
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 255 }).notNull(),
  contactCompany: varchar("contactCompany", { length: 255 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  notes: text("notes"),
  // Status del lead
  status: mysqlEnum("status", ["new", "contacted", "qualified", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  productIdx: index("idx_verify_quotes_product").on(t.productType),
  statusIdx: index("idx_verify_quotes_status").on(t.status),
  emailIdx: index("idx_verify_quotes_email").on(t.contactEmail),
}));
export type VerifyQuote = typeof verifyQuotes.$inferSelect;
export type InsertVerifyQuote = typeof verifyQuotes.$inferInsert;

// ── Centro Studi Leads ────────────────────────────────────────────────────────
export const centroStudiLeads = mysqlTable("centro_studi_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  role: varchar("role", { length: 255 }),
  sector: varchar("sector", { length: 128 }),
  interest: mysqlEnum("interest", ["abbonamento_report", "report_custom", "osservatorio", "informazioni"]).default("informazioni").notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "converted"]).default("new").notNull(),
  source: varchar("source", { length: 64 }).default("osservatorio-tech").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  emailIdx: index("idx_centro_studi_email").on(t.email),
  statusIdx: index("idx_centro_studi_status").on(t.status),
}));

export type CentroStudiLead = typeof centroStudiLeads.$inferSelect;
export type InsertCentroStudiLead = typeof centroStudiLeads.$inferInsert;

// ── Base Alpha + Subscriptions ────────────────────────────────────────────────
// Traccia gli abbonamenti Base Alpha+ attivati via Stripe Checkout
export const baseAlphaSubscriptions = mysqlTable("base_alpha_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).unique(),
  planId: mysqlEnum("planId", ["weekly-brief", "weekly-intelligence", "weekly-deep-dive"]).notNull(),
  planName: varchar("planName", { length: 128 }).notNull(),
  priceMonthly: int("priceMonthly").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  status: mysqlEnum("status", ["active", "past_due", "cancelled", "incomplete", "trialing"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  emailIdx: index("idx_ba_sub_email").on(t.customerEmail),
  userIdx: index("idx_ba_sub_user").on(t.userId),
  stripeSubIdx: index("idx_ba_sub_stripe").on(t.stripeSubscriptionId),
  statusIdx: index("idx_ba_sub_status").on(t.status),
}));
export type BaseAlphaSubscription = typeof baseAlphaSubscriptions.$inferSelect;
export type InsertBaseAlphaSubscription = typeof baseAlphaSubscriptions.$inferInsert;

// ─── ProofPress Creator Subscriptions ─────────────────────────────────────────
export const creatorSubscriptions = mysqlTable("creator_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).unique(),
  planId: mysqlEnum("creatorPlanId", ["creator_starter", "creator_publisher", "creator_gold"]).notNull(),
  planName: varchar("planName", { length: 128 }).notNull(),
  priceMonthly: int("priceMonthly").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  status: mysqlEnum("creatorStatus", ["active", "past_due", "cancelled", "incomplete", "trialing"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (t) => ({
  emailIdx: index("idx_cr_sub_email").on(t.customerEmail),
  userIdx: index("idx_cr_sub_user").on(t.userId),
  stripeSubIdx: index("idx_cr_sub_stripe").on(t.stripeSubscriptionId),
  statusIdx: index("idx_cr_sub_status").on(t.status),
}));
export type CreatorSubscription = typeof creatorSubscriptions.$inferSelect;
export type InsertCreatorSubscription = typeof creatorSubscriptions.$inferInsert;
