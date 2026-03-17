import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminRouter as adminToolsRouter } from "./routers/adminRouter";
import { cached, invalidateAll, getCacheStats, CACHE_KEYS, DEFAULT_TTL_MS, EDITORIAL_TTL_MS } from "./cache";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sendEmail, buildWeeklyNewsletterHtml, buildWelcomeEmailHtml, buildFullNewsletterHtml } from "./email";
import { publishDailyLinkedInPosts } from "./linkedinPublisher";
import { sendItsMusicNewsletter } from "./musicNewsletterScheduler";
import {
  addSubscriber,
  getAllSubscribers,
  getActiveSubscribers,
  getActiveSubscriberCount,
  unsubscribeEmail,
  unsubscribeByToken,
  getSubscriberByToken,
  deleteSubscriber,
  createNewsletterSend,
  getNewsletterHistory,
  ensureUnsubscribeTokens,
  getLatestNews,
  getLatestNewsFiltered,
  getHomeNewsData,
  countFilteredNews,
  getLowScoreNews,
  replaceNewsItem,
  getNewsRefreshHistory,
  getLatestEditorial,
  getLatestStartupOfDay,
  saveEditorial,
  saveStartupOfDay,
  upsertNotificationPreference,
  getNotificationPreferenceByToken,
  updateNotificationPreferenceByToken,
  getAllActiveNotificationPreferences,
  getNewsletterCampaignStats,
  getSubscribersWithTracking,
  getBarometroHistory,
  saveBarometroSnapshot,
} from "./db";
import { generateLatestAINews, saveNewsToDb } from "./newsScheduler";
import { generateStartupNews, generateStartupEditorial, generateStartupOfWeek, generateStartupReportage, generateStartupMarketAnalysis } from "./startupScheduler";
import { generateDailyEditorial, generateStartupOfDay } from "./dailyContentScheduler";
import { generateWeeklyReportage } from "./weeklyReportageScheduler";
import { generateMarketAnalysis } from "./marketAnalysisScheduler";
import { getLatestWeeklyReportage, getLatestMarketAnalysis } from "./db";
import { generateImage } from "./_core/imageGeneration";
import { getDb as getDbInstance } from "./db";
import { newsItems as newsItemsTable, weeklyReportage as weeklyReportageTable, marketAnalysis as marketAnalysisTable, dailyEditorial as dailyEditorialTable, startupOfDay as startupOfDayTable, articleComments as articleCommentsTable, contentAudit as contentAuditTable } from "../drizzle/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import { runBatchAudit, auditNewsItem, auditMarketAnalysis, getAuditResults, runFullAudit, auditReportage } from "./auditContent";
import { getSchedulerStatus, runScheduledAudit } from "./auditScheduler";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  adminTools: adminToolsRouter,

  // ── Notification Preferences (public) ─────────────────────────────────────
  notifications: router({
    // Salva o aggiorna le preferenze di notifica
    savePreferences: publicProcedure
      .input(z.object({
        email: z.string().email("Email non valida"),
        name: z.string().optional(),
        notifyNews: z.boolean().optional(),
        notifyEditorial: z.boolean().optional(),
        notifyStartup: z.boolean().optional(),
        notifyReportage: z.boolean().optional(),
        notifyMarket: z.boolean().optional(),
        frequency: z.enum(["daily", "weekly", "realtime"]).optional(),
        categories: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const pref = await upsertNotificationPreference(input);
        return {
          success: true,
          prefsToken: pref?.prefsToken ?? null,
          message: "Preferenze salvate con successo",
        };
      }),

    // Recupera le preferenze tramite token (per pagina gestione)
    getByToken: publicProcedure
      .input(z.object({ token: z.string().min(10) }))
      .query(async ({ input }) => {
        const pref = await getNotificationPreferenceByToken(input.token);
        if (!pref) return null;
        return {
          email: pref.email,
          name: pref.name,
          notifyNews: pref.notifyNews,
          notifyEditorial: pref.notifyEditorial,
          notifyStartup: pref.notifyStartup,
          notifyReportage: pref.notifyReportage,
          notifyMarket: pref.notifyMarket,
          frequency: pref.frequency,
          categories: pref.categories ? JSON.parse(pref.categories) : [],
          isActive: pref.isActive,
        };
      }),

    // Aggiorna le preferenze tramite token (senza login)
    updateByToken: publicProcedure
      .input(z.object({
        token: z.string().min(10),
        notifyNews: z.boolean().optional(),
        notifyEditorial: z.boolean().optional(),
        notifyStartup: z.boolean().optional(),
        notifyReportage: z.boolean().optional(),
        notifyMarket: z.boolean().optional(),
        frequency: z.enum(["daily", "weekly", "realtime"]).optional(),
        categories: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { token, ...data } = input;
        await updateNotificationPreferenceByToken(token, data);
        return { success: true, message: "Preferenze aggiornate" };
      }),
  }),

  // ── Market Analysis (public) ─────────────────────────────────────────────────────────────────────────────────────────────
  marketAnalysis: router({
    getLatest: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .query(async ({ input }) => {
        return cached(
          CACHE_KEYS.MARKET_LATEST(input.section),
          () => getLatestMarketAnalysis(input.section),
          EDITORIAL_TTL_MS
        );
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return cached(`market:byId:${input.id}`, async () => {
          const db = await getDbInstance();
          if (!db) return null;
          const items = await db.select().from(marketAnalysisTable).where(eq(marketAnalysisTable.id, input.id)).limit(1);
          return items[0] ?? null;
        }, 30 * 60 * 1000);
      }),
  }),

  // ── Weekly Reportage (public) ─────────────────────────────────────────────────────────────────────────────────────────────
  reportage: router({
    getLatestWeek: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .query(async ({ input }) => {
        return cached(
          CACHE_KEYS.REPORTAGE_LATEST(input.section),
          () => getLatestWeeklyReportage(input.section),
          EDITORIAL_TTL_MS
        );
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return cached(`reportage:byId:${input.id}`, async () => {
          const db = await getDbInstance();
          if (!db) return null;
          const items = await db.select().from(weeklyReportageTable).where(eq(weeklyReportageTable.id, input.id)).limit(1);
          return items[0] ?? null;
        }, 30 * 60 * 1000);
      }),
  }),

  // ── Editorial (public) ──────────────────────────────────────────────────────────────────────────────────
  editorial: router({
    getLatest: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .query(async ({ input }) => {
        return cached(
          CACHE_KEYS.EDITORIAL_LATEST(input.section),
          () => getLatestEditorial(input.section),
          EDITORIAL_TTL_MS
        );
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return cached(`editorial:byId:${input.id}`, async () => {
          const db = await getDbInstance();
          if (!db) return null;
          const items = await db.select().from(dailyEditorialTable).where(eq(dailyEditorialTable.id, input.id)).limit(1);
          return items[0] ?? null;
        }, 30 * 60 * 1000);
      }),
  }),

  // ── Startup of the Day (public) ─────────────────────────────────────────────────────────────────────────────
  startupOfDay: router({
    getLatest: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .query(async ({ input }) => {
        return cached(
          CACHE_KEYS.STARTUP_LATEST(input.section),
          () => getLatestStartupOfDay(input.section),
          EDITORIAL_TTL_MS
        );
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return cached(`startup:byId:${input.id}`, async () => {
          const db = await getDbInstance();
          if (!db) return null;
          const items = await db.select().from(startupOfDayTable).where(eq(startupOfDayTable.id, input.id)).limit(1);
          return items[0] ?? null;
        }, 30 * 60 * 1000);
      }),
  }),

  // ── News (public) ──────────────────────────────────────────────────────────────────────────────────
  news: router({
    getLatest: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20), section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .query(async ({ input }) => {
        // Usa il filtro audit: esclude notizie con score < 40 o URL non raggiungibili
        const items = await cached(
          CACHE_KEYS.NEWS_LATEST(input.section, input.limit),
          () => getLatestNewsFiltered(input.limit, input.section),
          DEFAULT_TTL_MS
        );
        return items.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          sourceName: item.sourceName ?? "",
          sourceUrl: item.sourceUrl ?? "#",
          publishedAt: item.publishedAt ?? "",
          imageUrl: item.imageUrl ?? null,
        }));
      }),

    getRefreshHistory: publicProcedure.query(async () => {
      return getNewsRefreshHistory();
    }),

    // Recupera tutte le notizie per la homepage in una singola chiamata ottimizzata
    // Evita il problema di batch tRPC troppo grandi (>68KB) che causano errore 502
    getHomeData: publicProcedure.query(async () => {
      return cached(
        CACHE_KEYS.HOME_DATA,
        () => getHomeNewsData(),
        DEFAULT_TTL_MS
      );
    }),

    // Statistiche filtro audit per la dashboard admin
    getFilterStats: adminProcedure
      .input(z.object({ section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .query(async ({ input }) => {
        return countFilteredNews(input.section);
      }),

    // Recupera notizie con score < 40 per revisione/sostituzione
    getLowScore: adminProcedure
      .input(z.object({ section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .query(async ({ input }) => {
        return getLowScoreNews(input.section);
      }),

    // Recupera una singola notizia per ID (per la pagina articolo)
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        // Cache 30 minuti — il contenuto di un articolo è stabile
        return cached(
          `news:byId:${input.id}`,
          async () => {
            const db = await getDbInstance();
            if (!db) return null;
            const items = await db.select().from(newsItemsTable)
              .where(eq(newsItemsTable.id, input.id))
              .limit(1);
            if (!items.length) return null;
            const item = items[0];
            return {
              id: item.id,
              title: item.title,
              summary: item.summary,
              category: item.category,
              sourceName: item.sourceName ?? '',
              sourceUrl: item.sourceUrl ?? '#',
              publishedAt: item.publishedAt ?? '',
              imageUrl: item.imageUrl ?? null,
              section: item.section,
            };
          },
          30 * 60 * 1000
        );
      }),

    // Recupera notizie correlate per sezione/categoria
    getRelated: publicProcedure
      .input(z.object({
        id: z.number(),
        section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai'),
        limit: z.number().min(1).max(6).default(4),
      }))
      .query(async ({ input }) => {
        // Cache 15 minuti — le correlate cambiano con i nuovi articoli
        return cached(
          CACHE_KEYS.NEWS_RELATED(input.id),
          async () => {
            const db = await getDbInstance();
            if (!db) return [];
            const items = await db.select().from(newsItemsTable)
              .where(eq(newsItemsTable.section, input.section as any))
              .orderBy(desc(newsItemsTable.createdAt))
              .limit(input.limit + 1);
            return items
              .filter((item: typeof items[0]) => item.id !== input.id)
              .slice(0, input.limit)
              .map((item: typeof items[0]) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                category: item.category,
                sourceName: item.sourceName ?? '',
                sourceUrl: item.sourceUrl ?? '#',
                publishedAt: item.publishedAt ?? '',
                imageUrl: item.imageUrl ?? null,
              }));
          },
          EDITORIAL_TTL_MS
        );
      }),

    // Recupera tutte le notizie con filtri per l'Edicola
    getAll: publicProcedure
      .input(z.object({
        section: z.enum(['all', 'ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('all'),
        category: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        limit: z.number().min(1).max(200).default(60),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return { items: [], total: 0 };
        const conditions: ReturnType<typeof eq>[] = [];
        if (input.section !== 'all') {
          conditions.push(eq(newsItemsTable.section, input.section as any));
        }
        if (input.category) {
          conditions.push(eq(newsItemsTable.category, input.category));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const [items, countResult] = await Promise.all([
          db.select().from(newsItemsTable)
            .where(whereClause)
            .orderBy(desc(newsItemsTable.createdAt))
            .limit(input.limit)
            .offset(input.offset),
          db.select({ count: newsItemsTable.id }).from(newsItemsTable).where(whereClause),
        ]);
        return {
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.category,
            section: item.section,
            sourceName: item.sourceName ?? '',
            sourceUrl: item.sourceUrl ?? '#',
            publishedAt: item.publishedAt ?? '',
            imageUrl: item.imageUrl ?? null,
          })),
          total: countResult.length,
        };
      }),

    // Punto del Giorno: recupera il post LinkedIn più recente di Andrea Cinelli
    getPuntoDelGiorno: publicProcedure
      .query(async () => {
        return cached(
          CACHE_KEYS.PUNTO_DEL_GIORNO,
          async () => {
            const db = await getDbInstance();
            if (!db) return null;
            const { linkedinPosts: linkedinPostsTable } = await import('../drizzle/schema');
            const posts = await db.select().from(linkedinPostsTable)
              .orderBy(desc(linkedinPostsTable.createdAt))
              .limit(1);
            if (!posts.length) return null;
            const post = posts[0];
            return {
              id: post.id,
              dateLabel: post.dateLabel,
              postText: post.postText,
              linkedinUrl: post.linkedinUrl ?? null,
              title: post.title ?? null,
              section: post.section,
              imageUrl: post.imageUrl ?? null,
              hashtags: post.hashtags ?? null,
              createdAt: post.createdAt,
            };
          },
          EDITORIAL_TTL_MS
        );
      }),

    // Barometro Politico: estrae intenzioni di voto dai sondaggi recenti tramite LLM
    getBarometro: publicProcedure
      .query(async () => {
        // TTL 30 minuti: la chiamata LLM è costosa, i sondaggi cambiano raramente
        return cached(
          CACHE_KEYS.BAROMETRO,
          async () => {
        const db = await getDbInstance();
        if (!db) return null;
        // Prendi le ultime 30 notizie sondaggi per trovare dati percentuali
        const items = await db.select().from(newsItemsTable)
          .where(eq(newsItemsTable.section, 'sondaggi'))
          .orderBy(desc(newsItemsTable.createdAt))
          .limit(30);
        if (!items.length) return null;

        // Costruisci testo con titoli e sommari per l'LLM
        const newsText = items.map(n => `TITOLO: ${n.title}\nSOMMARIO: ${n.summary}\nFONTE: ${n.sourceName ?? ''}\nDATA: ${n.publishedAt ?? ''}`).join('\n\n---\n\n');

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: `Sei un analista politico italiano esperto di sondaggi. Analizza le notizie fornite ed estrai i dati sulle intenzioni di voto dei partiti italiani. Se non ci sono dati percentuali espliciti, stima le tendenze basandoti sul contesto. Restituisci SEMPRE dati per i principali partiti italiani (FdI, PD, M5S, Lega, FI, AVS, Az/IV, altri). I valori devono sommare a circa 100%.`
              },
              {
                role: 'user',
                content: `Analizza queste notizie sui sondaggi italiani ed estrai/stima le intenzioni di voto per i principali partiti:\n\n${newsText}\n\nRestituisci i dati in formato JSON con i partiti e le loro percentuali. Includi anche la fonte e la data del sondaggio più recente trovato.`
              }
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'barometro_politico',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    partiti: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          nome: { type: 'string', description: 'Nome del partito (abbreviazione)' },
                          nomeCompleto: { type: 'string', description: 'Nome completo del partito' },
                          percentuale: { type: 'number', description: 'Percentuale intenzioni di voto (0-100)' },
                          colore: { type: 'string', description: 'Colore hex del partito (es. #1a3a6e per FdI)' },
                          variazione: { type: 'number', description: 'Variazione rispetto al sondaggio precedente (positivo = crescita)' },
                        },
                        required: ['nome', 'nomeCompleto', 'percentuale', 'colore', 'variazione'],
                        additionalProperties: false,
                      }
                    },
                    fonte: { type: 'string', description: 'Nome istituto sondaggistico' },
                    data: { type: 'string', description: 'Data del sondaggio (gg/mm/aaaa)' },
                    nota: { type: 'string', description: 'Nota metodologica o contesto breve' },
                  },
                  required: ['partiti', 'fonte', 'data', 'nota'],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content) return null;
          return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        } catch (err) {
          console.error('[Barometro] Errore LLM:', err);
          return null;
        }
          },
          30 * 60 * 1000 // 30 minuti
        );
      }),

    // Storico intenzioni di voto (ultimi 28 giorni)
    getBarometroHistory: publicProcedure
      .input(z.object({ days: z.number().min(7).max(90).default(28) }).optional())
      .query(async ({ input }) => {
        const days = input?.days ?? 28;
        return cached(
          `barometro_history_${days}`,
          () => getBarometroHistory(days),
          15 * 60 * 1000 // 15 minuti
        );
      }),

    getThreatAlert: publicProcedure
      .query(async () => {
        // TTL 30 minuti: la chiamata LLM è costosa, le minacce cambiano raramente
        return cached(
          CACHE_KEYS.THREAT_ALERT,
          async () => {
        const db = await getDbInstance();
        if (!db) return null;
        // Prendi le ultime 40 notizie cybersecurity per trovare minacce
        const items = await db.select().from(newsItemsTable)
          .where(eq(newsItemsTable.section, 'cybersecurity'))
          .orderBy(desc(newsItemsTable.createdAt))
          .limit(40);
        if (!items.length) return null;

        const newsText = items.map(n => `TITOLO: ${n.title}\nSOMMARIO: ${n.summary}\nFONTE: ${n.sourceName ?? ''}\nDATA: ${n.publishedAt ?? ''}`).join('\n\n---\n\n');

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: `Sei un analista di cybersecurity italiano esperto di threat intelligence. Analizza le notizie fornite ed estrai le principali minacce cyber della settimana in Italia e nel mondo. Identifica ransomware, phishing, vulnerabilità critiche, data breach e attacchi APT. Restituisci sempre 5-7 minacce ordinate per gravità.`
              },
              {
                role: 'user',
                content: `Analizza queste notizie cybersecurity ed estrai le principali minacce della settimana:\n\n${newsText}\n\nRestituisci i dati in formato JSON con le minacce, il livello di rischio e le raccomandazioni.`
              }
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'threat_alert',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    minacce: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          tipo: { type: 'string', description: 'Tipo di minaccia (Ransomware, Phishing, Vulnerabilità, Data Breach, APT, DDoS, altro)' },
                          nome: { type: 'string', description: 'Nome o identificativo della minaccia' },
                          descrizione: { type: 'string', description: 'Descrizione breve della minaccia (max 120 caratteri)' },
                          livelloRischio: { type: 'string', description: 'Livello di rischio: CRITICO, ALTO, MEDIO, BASSO' },
                          settoreColpito: { type: 'string', description: 'Settore principalmente colpito (PA, Finance, Healthcare, Industria, Privati, ecc.)' },
                          fonte: { type: 'string', description: 'Fonte della notizia (CERT-AGID, ACN, Cybersecurity360, ecc.)' },
                        },
                        required: ['tipo', 'nome', 'descrizione', 'livelloRischio', 'settoreColpito', 'fonte'],
                        additionalProperties: false,
                      }
                    },
                    aggiornato: { type: 'string', description: 'Data aggiornamento (gg/mm/aaaa)' },
                    sommario: { type: 'string', description: 'Sommario del panorama delle minacce della settimana (max 200 caratteri)' },
                  },
                  required: ['minacce', 'aggiornato', 'sommario'],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content) return null;
          return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        } catch (err) {
          console.error('[ThreatAlert] Errore LLM:', err);
          return null;
        }
          },
          30 * 60 * 1000 // 30 minuti
        );
      }),

    // Sostituisce automaticamente le notizie con score < 40 con contenuto AI
    replaceAllLowScore: adminProcedure
      .input(z.object({ section: z.enum(['ai', 'music', 'startup', 'finance', 'health', 'sport', 'luxury', 'news', 'motori', 'tennis', 'basket', 'gossip', 'cybersecurity', 'sondaggi']).default('ai') }))
      .mutation(async ({ input }) => {
        const lowScoreNews = await getLowScoreNews(input.section);
        if (lowScoreNews.length === 0) return { replaced: 0, message: 'Nessuna notizia da sostituire' };

        const sectionLabel = input.section === 'ai' ? 'intelligenza artificiale e business' : 'musica rock, indie e industria musicale';
        let replaced = 0;

        for (const news of lowScoreNews) {
          try {
            const prompt = `Sei un giornalista specializzato in ${sectionLabel}. Genera una notizia originale e verificabile per sostituire questa notizia che ha avuto problemi di coerenza con la fonte originale.

Notizia originale (da sostituire): "${news.title}"
Categoria: ${news.category}

Genera una notizia diversa, attuale e rilevante per la stessa categoria. Rispondi SOLO con JSON valido:`;

            const response = await invokeLLM({
              messages: [
                { role: 'system', content: 'Sei un giornalista editoriale italiano specializzato. Genera sempre contenuti accurati e verificabili. Rispondi solo con JSON valido.' },
                { role: 'user', content: prompt },
              ],
              response_format: {
                type: 'json_schema',
                json_schema: {
                  name: 'news_replacement',
                  strict: true,
                  schema: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: 'Titolo della notizia (max 120 caratteri)' },
                      summary: { type: 'string', description: 'Sommario della notizia (2-3 frasi, max 300 caratteri)' },
                      category: { type: 'string', description: 'Categoria della notizia' },
                      sourceName: { type: 'string', description: 'Nome della fonte (es. TechCrunch, Wired, Rolling Stone)' },
                      sourceUrl: { type: 'string', description: 'URL della fonte originale (URL reale e verificabile)' },
                    },
                    required: ['title', 'summary', 'category', 'sourceName', 'sourceUrl'],
                    additionalProperties: false,
                  },
                },
              },
            });

            const content = response.choices[0]?.message?.content;
            if (!content) continue;

            const newContent = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
            await replaceNewsItem(news.id, newContent);
            replaced++;
          } catch (err) {
            console.error(`[NewsReplace] Errore sostituzione notizia ${news.id}:`, err);
          }
        }

        return { replaced, total: lowScoreNews.length, message: `Sostituite ${replaced} notizie su ${lowScoreNews.length}` };
      }),
  }),

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Newsletter Subscription (public) ──────────────────────────────────────
  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email non valida"),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await addSubscriber({
          email: input.email,
          name: input.name,
          source: "website",
        });

        // Invia email di benvenuto solo ai nuovi iscritti (non a chi è già iscritto)
        if ((result as any).success || (result as any).resubscribed) {
          try {
            // Recupera il token di disiscrizione per il link GDPR nell'email
            const baseUrl = `https://ideasmart.ai`;
            const { getSubscriberByEmail } = await import("./db");
            const subscriber = await getSubscriberByEmail(input.email);
            const unsubToken = subscriber?.unsubscribeToken;
            const unsubUrl = unsubToken
              ? `${baseUrl}/unsubscribe?token=${unsubToken}`
              : `${baseUrl}/unsubscribe`;
            const prefsUrl = unsubToken
              ? `${baseUrl}/preferenze-newsletter?token=${unsubToken}`
              : `${baseUrl}/preferenze-newsletter`;

            const html = buildWelcomeEmailHtml({
              name: input.name,
              unsubscribeUrl: unsubUrl,
              preferencesUrl: prefsUrl,
            });

            await sendEmail({
              to: input.email,
              subject: "Benvenuto in IDEASMART — Iscrizione confermata ✓",
              html,
            });
          } catch (emailErr) {
            // Non bloccare l'iscrizione se l'email fallisce
            console.error("[Newsletter] Errore invio email benvenuto:", emailErr);
          }
        }

        return result;
      }),

    // Conta iscritti attivi (pubblico, per social proof)
    getActiveCount: publicProcedure.query(async () => {
      return getActiveSubscriberCount();
    }),

    // Disiscrizione tramite email (legacy, richiede autenticazione)
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await unsubscribeEmail(input.email);
        return { success: true };
      }),

    // Disiscrizione tramite token univoco (GDPR-compliant, nessun login richiesto)
    unsubscribeByToken: publicProcedure
      .input(z.object({ token: z.string().min(10) }))
      .mutation(async ({ input }) => {
        const result = await unsubscribeByToken(input.token);
        if (!result.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error ?? "Token non valido" });
        }
        return { success: true, email: result.email };
      }),

    // Recupera l'email associata al token (per mostrare conferma prima di disiscrizione)
    getByToken: publicProcedure
      .input(z.object({ token: z.string().min(10) }))
      .query(async ({ input }) => {
        const subscriber = await getSubscriberByToken(input.token);
        if (!subscriber) return null;
        return {
          email: subscriber.email,
          name: subscriber.name,
          status: subscriber.status,
        };
      }),

    // Recupera le preferenze canale tramite token (per pagina preferenze)
    getChannelPreferences: publicProcedure
      .input(z.object({ token: z.string().min(10) }))
      .query(async ({ input }) => {
        const { getSubscriberWithChannels } = await import('./db');
        const sub = await getSubscriberWithChannels(input.token);
        if (!sub) return null;
        return {
          email: sub.email,
          name: sub.name,
          status: sub.status,
          channels: sub.parsedChannels,
        };
      }),

    // Aggiorna le preferenze canale tramite token (GDPR-compliant, nessun login)
    updateChannelPreferences: publicProcedure
      .input(z.object({
        token: z.string().min(10),
        channels: z.array(z.enum(['ai', 'startup', 'finance', 'health', 'sport', 'luxury', 'music', 'news', 'motori', 'tennis', 'basket'])).min(1, 'Seleziona almeno un canale'),
      }))
      .mutation(async ({ input }) => {
        const { updateSubscriberChannelsByToken } = await import('./db');
        const result = await updateSubscriberChannelsByToken(input.token, input.channels);
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Token non valido o scaduto' });
        }
        return { success: true, email: result.email };
      }),

    // Iscrizione con canali specifici
    subscribeWithChannels: publicProcedure
      .input(z.object({
        email: z.string().email('Email non valida'),
        name: z.string().optional(),
        channels: z.array(z.enum(['ai', 'startup', 'finance', 'health', 'sport', 'luxury', 'music', 'news', 'motori', 'tennis', 'basket'])).optional(),
      }))
      .mutation(async ({ input }) => {
        const { addSubscriberWithChannels } = await import('./db');
        const result = await addSubscriberWithChannels({
          email: input.email,
          name: input.name,
          source: 'website',
          channels: input.channels,
        });

        if ((result as any).success || (result as any).resubscribed) {
          try {
            const baseUrl = 'https://ideasmart.ai';
            const { getSubscriberByEmail } = await import('./db');
            const subscriber = await getSubscriberByEmail(input.email);
            const unsubToken = subscriber?.unsubscribeToken;
            const unsubUrl = unsubToken
              ? `${baseUrl}/unsubscribe?token=${unsubToken}`
              : `${baseUrl}/unsubscribe`;
            const prefsUrl = unsubToken
              ? `${baseUrl}/preferenze-newsletter?token=${unsubToken}`
              : `${baseUrl}/preferenze-newsletter`;

            const html = buildWelcomeEmailHtml({
              name: input.name,
              unsubscribeUrl: unsubUrl,
              preferencesUrl: prefsUrl,
              channels: input.channels,
            });

            await sendEmail({
              to: input.email,
              subject: 'Benvenuto in IDEASMART — Iscrizione confermata ✓',
              html,
            });
          } catch (emailErr) {
            console.error('[Newsletter] Errore invio email benvenuto:', emailErr);
          }
        }

        return result;
      }),
  }),

  // ── Admin: migrazione token ────────────────────────────────────────────────
  // Assegna token a iscritti importati che non ne hanno uno
  adminMigrate: router({
    ensureTokens: adminProcedure.mutation(async () => {
      await ensureUnsubscribeTokens();
      return { success: true };
    }),
  }),

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  admin: router({
    getSubscribers: adminProcedure.query(async () => {
      return getAllSubscribers();
    }),

    deleteSubscriber: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSubscriber(input.id);
        return { success: true };
      }),

    unsubscribeSubscriber: adminProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await unsubscribeEmail(input.email);
        return { success: true };
      }),

    getNewsletterHistory: adminProcedure.query(async () => {
      return getNewsletterHistory();
    }),

    // Test send to a single email
    sendTestEmail: adminProcedure
      .input(z.object({ to: z.string().email() }))
      .mutation(async ({ input }) => {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dateRange = `${weekAgo.toLocaleDateString("it-IT")} - ${today.toLocaleDateString("it-IT")}`;

        // Generate news via LLM
        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Sei il redattore di IDEASMART, una startup italiana di tecnologia e innovazione che analizza le migliori realtà AI per il business. Scrivi in italiano con tono editoriale autorevole. Rispondi SOLO con JSON valido.`,
            },
            {
              role: "user",
              content: `Genera le 20 notizie più importanti della settimana (${dateRange}) nel mondo dell'AI e delle startup tecnologiche italiane e internazionali. Per ogni notizia includi: titolo, categoria (es. "AI Generativa", "Startup", "Funding", "Prodotto", "Ricerca"), breve descrizione (2-3 frasi), e impatto per il business italiano.

Rispondi con questo JSON:
{"week":"${dateRange}","news":[{"id":1,"category":"categoria","title":"titolo","description":"descrizione","impact":"impatto"}]}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "weekly_news",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  week: { type: "string" },
                  news: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        category: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string" },
                      },
                      required: ["id", "category", "title", "description", "impact"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["week", "news"],
                additionalProperties: false,
              },
            },
          },
        });

        const rawContent = llmResponse.choices[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : null;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Errore generazione notizie dall'AI" });

        const newsData = JSON.parse(content) as {
          week: string;
          news: Array<{ id: number; category: string; title: string; description: string; impact: string }>;
        };

        const htmlContent = buildWeeklyNewsletterHtml(newsData);
        const subject = `[TEST] IDEASMART Weekly — Top 20 AI News | ${newsData.week}`;

        const result = await sendEmail({
          to: input.to,
          subject,
          html: htmlContent,
        });

        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "Errore invio email" });
        }

        return {
          success: true,
          to: input.to,
          subject,
          newsCount: newsData.news.length,
          week: newsData.week,
        };
      }),

    // Aggiornamento manuale delle news AI
    refreshNews: adminProcedure.mutation(async () => {
      const items = await generateLatestAINews();
      await saveNewsToDb(items);
      return { success: true, count: items.length };
    }),

    // Rigenerazione manuale dell'editoriale giornaliero
    refreshEditorial: adminProcedure.mutation(async () => {
      const editorial = await generateDailyEditorial();
      await saveEditorial(editorial);
      return { success: true, title: editorial.title };
    }),

    // Rigenerazione manuale dei 4 reportage settimanali
    refreshReportage: adminProcedure.mutation(async () => {
      await generateWeeklyReportage();
      const items = await getLatestWeeklyReportage();
      return { success: true, count: items.length };
    }),

    // Rigenerazione manuale della startup del giorno
    refreshStartupOfDay: adminProcedure.mutation(async () => {
      const startup = await generateStartupOfDay();
      await saveStartupOfDay(startup);
      return { success: true, name: startup.name };
    }),

    // Rigenerazione manuale delle 4 analisi di mercato
    refreshMarketAnalysis: adminProcedure.mutation(async () => {
      await generateMarketAnalysis();
      const items = await getLatestMarketAnalysis();
      return { success: true, count: items.length };
    }),

    // Generazione manuale notizie Startup
    refreshStartupNews: adminProcedure.mutation(async () => {
      await generateStartupNews();
      return { success: true };
    }),
    // Generazione manuale contenuti Startup (editoriale, startup settimana, reportage, analisi)
    refreshStartupContent: adminProcedure.mutation(async () => {
      await generateStartupEditorial();
      await generateStartupOfWeek();
      await generateStartupReportage();
      await generateStartupMarketAnalysis();
      return { success: true };
    }),

    // Invia newsletter completa di prova (news + reportage + editoriale + startup + analisi) a una singola email
    sendFullTestNewsletter: adminProcedure
      .input(z.object({ to: z.string().email() }))
      .mutation(async ({ input }) => {
        const today = new Date();
        const dateLabel = today.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

        // Recupera tutti i dati dal DB in parallelo
        const [news, reportages, analyses, editorial, startup] = await Promise.all([
          getLatestNews(),
          getLatestWeeklyReportage(),
          getLatestMarketAnalysis(),
          getLatestEditorial(),
          getLatestStartupOfDay(),
        ]);

        const html = buildFullNewsletterHtml({
          dateLabel,
          editorial: editorial ?? null,
          startup: startup ?? null,
          news: news.map(n => ({
            title: n.title,
            summary: n.summary,
            category: n.category,
            sourceName: n.sourceName,
            sourceUrl: n.sourceUrl,
          })),
          reportages: reportages.map(r => ({
            startupName: r.startupName,
            category: r.category,
            headline: r.headline,
            subheadline: r.subheadline,
            bodyText: r.bodyText,
            quote: r.quote,
            stat1Value: r.stat1Value,
            stat1Label: r.stat1Label,
            stat2Value: r.stat2Value,
            stat2Label: r.stat2Label,
            stat3Value: r.stat3Value,
            stat3Label: r.stat3Label,
            websiteUrl: r.websiteUrl,
            ctaLabel: r.ctaLabel,
            ctaUrl: r.ctaUrl,
          })),
          analyses: analyses.map(a => ({
            title: a.title,
            category: a.category,
            summary: a.summary,
            source: a.source,
            dataPoint1: a.dataPoint1,
            dataPoint2: a.dataPoint2,
            dataPoint3: a.dataPoint3,
            keyInsight: a.keyInsight,
            italyRelevance: a.italyRelevance,
          })),
          isTest: true,
        });

        const subject = `[PROVA] AI4Business News — ${dateLabel} | ${news.length} news, ${reportages.length} reportage`;

        const result = await sendEmail({ to: input.to, subject, html });
        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "Errore invio email" });
        }

        return {
          success: true,
          to: input.to,
          subject,
          newsCount: news.length,
          reportageCount: reportages.length,
          analysesCount: analyses.length,
          hasEditorial: !!editorial,
          hasStartup: !!startup,
        };
      }),


    // Send weekly newsletter to all active subscribers (legacy - usa buildWeeklyNewsletterHtml)
    // Statistiche performance newsletter (aperture, tasso apertura per campagna)
    getNewsletterCampaignStats: adminProcedure.query(async () => {
      return getNewsletterCampaignStats();
    }),

    // Lista iscritti con dati tracking (aperture, ultima apertura, stato)
    getSubscribersWithTracking: adminProcedure.query(async () => {
      return getSubscribersWithTracking();
    }),


    // ── Generazione immagini AI per articoli ──────────────────────────────────
    generateArticleImages: adminProcedure
    .input(z.object({
      type: z.enum(["news", "reportage", "analysis", "editorial", "startup", "all"]),
      limit: z.number().default(5),
    }))
    .mutation(async ({ input }) => {
      const db = await getDbInstance();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const results: { type: string; id: number; title: string; imageUrl: string }[] = [];
      const errors: { type: string; id: number; error: string }[] = [];

      async function genImage(prompt: string): Promise<string | null> {
        try {
          const { url } = await generateImage({ prompt });
          return url ?? null;
        } catch (e: unknown) {
          return null;
        }
      }

      // News
      if (input.type === "news" || input.type === "all") {
        const items = await db.select().from(newsItemsTable).where(isNull(newsItemsTable.imageUrl)).limit(input.limit);
        for (const item of items) {
          const prompt = `Professional editorial illustration for an AI business news article. Title: "${item.title}". Category: ${item.category}. Style: modern tech magazine, clean, abstract, no text, 16:9 ratio.`;
          const url = await genImage(prompt);
          if (url) {
            await db.update(newsItemsTable).set({ imageUrl: url }).where(eq(newsItemsTable.id, item.id));
            results.push({ type: "news", id: item.id, title: item.title, imageUrl: url });
          } else {
            errors.push({ type: "news", id: item.id, error: "Generation failed" });
          }
        }
      }

      // Reportage
      if (input.type === "reportage" || input.type === "all") {
        const items = await db.select().from(weeklyReportageTable).where(isNull(weeklyReportageTable.imageUrl)).limit(input.limit);
        for (const item of items) {
          const prompt = `Professional editorial illustration for an AI startup reportage. Startup: "${item.startupName}". Headline: "${item.headline}". Category: ${item.category}. Style: modern tech magazine, clean, abstract, no text, 16:9 ratio.`;
          const url = await genImage(prompt);
          if (url) {
            await db.update(weeklyReportageTable).set({ imageUrl: url }).where(eq(weeklyReportageTable.id, item.id));
            results.push({ type: "reportage", id: item.id, title: item.headline, imageUrl: url });
          } else {
            errors.push({ type: "reportage", id: item.id, error: "Generation failed" });
          }
        }
      }

      // Market Analysis
      if (input.type === "analysis" || input.type === "all") {
        const items = await db.select().from(marketAnalysisTable).where(isNull(marketAnalysisTable.imageUrl)).limit(input.limit);
        for (const item of items) {
          const prompt = `Professional editorial illustration for a market analysis report. Title: "${item.title}". Category: ${item.category}. Style: modern business magazine, data visualization aesthetic, clean, abstract, no text, 16:9 ratio.`;
          const url = await genImage(prompt);
          if (url) {
            await db.update(marketAnalysisTable).set({ imageUrl: url }).where(eq(marketAnalysisTable.id, item.id));
            results.push({ type: "analysis", id: item.id, title: item.title, imageUrl: url });
          } else {
            errors.push({ type: "analysis", id: item.id, error: "Generation failed" });
          }
        }
      }

      // Editorial
      if (input.type === "editorial" || input.type === "all") {
        const items = await db.select().from(dailyEditorialTable).where(isNull(dailyEditorialTable.imageUrl)).limit(input.limit);
        for (const item of items) {
          const prompt = `Professional editorial illustration for an AI business editorial. Title: "${item.title}". Trend: ${item.keyTrend ?? "AI innovation"}. Style: premium Italian business magazine, editorial photography aesthetic, clean, no text, 16:9 ratio.`;
          const url = await genImage(prompt);
          if (url) {
            await db.update(dailyEditorialTable).set({ imageUrl: url }).where(eq(dailyEditorialTable.id, item.id));
            results.push({ type: "editorial", id: item.id, title: item.title, imageUrl: url });
          } else {
            errors.push({ type: "editorial", id: item.id, error: "Generation failed" });
          }
        }
      }

      // Startup
      if (input.type === "startup" || input.type === "all") {
        const items = await db.select().from(startupOfDayTable).where(isNull(startupOfDayTable.imageUrl)).limit(input.limit);
        for (const item of items) {
          const prompt = `Professional editorial illustration for an AI startup spotlight. Startup: "${item.name}". Tagline: "${item.tagline}". Category: ${item.category}. Style: modern tech startup magazine, clean, vibrant, abstract, no text, 16:9 ratio.`;
          const url = await genImage(prompt);
          if (url) {
            await db.update(startupOfDayTable).set({ imageUrl: url }).where(eq(startupOfDayTable.id, item.id));
            results.push({ type: "startup", id: item.id, title: item.name, imageUrl: url });
          } else {
            errors.push({ type: "startup", id: item.id, error: "Generation failed" });
          }
        }
      }

      return { generated: results.length, errorsCount: errors.length, results, errors };
    }),

    // ── ITsMusic Newsletter ──────────────────────────────────────────────────
    triggerItsMusicNewsletter: adminProcedure.mutation(async () => {
      const result = await sendItsMusicNewsletter();
      if (!result.success && result.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
      }
      return {
        success: result.success,
        recipientCount: result.recipientCount,
        newsCount: result.newsCount,
        subject: result.subject,
      };
    }),

    // ── Aggiornamento News Musicali ──────────────────────────────────────────
    refreshMusicNews: adminProcedure.mutation(async () => {
      const { generateMusicNews } = await import("./musicScheduler");
      const count = await generateMusicNews();
      return { count, message: `${count} notizie musicali aggiornate con successo` };
    }),
    // ── Finance & Markets ────────────────────────────────────────────────────────
    refreshFinanceAll: adminProcedure.mutation(async () => {
      const { refreshFinanceNewsFromRSS } = await import("./rssNewsScheduler");
      const { generateFinanceEditorial, generateFinanceDealOfWeek, generateFinanceReportage, generateFinanceMarketAnalysis } = await import("./financeScheduler");
      await refreshFinanceNewsFromRSS();
      await generateFinanceEditorial();
      await generateFinanceDealOfWeek();
      await generateFinanceReportage();
      await generateFinanceMarketAnalysis();
      return { success: true, message: "Finance & Markets aggiornato con successo" };
    }),
    // ── Health & Biotech ────────────────────────────────────────────────────────
    refreshHealthAll: adminProcedure.mutation(async () => {
      const { refreshHealthNewsFromRSS } = await import("./rssNewsScheduler");
      const { generateHealthEditorial, generateHealthDealOfWeek, generateHealthReportage, generateHealthMarketAnalysis } = await import("./healthScheduler");
      await refreshHealthNewsFromRSS();
      await generateHealthEditorial();
      await generateHealthDealOfWeek();
      await generateHealthReportage();
      await generateHealthMarketAnalysis();
      return { success: true, message: "Health & Biotech aggiornato con successo" };
    }),
    // ── Sport & Business ────────────────────────────────────────────────────────
    refreshSportAll: adminProcedure.mutation(async () => {
      const { refreshSportNewsFromRSS } = await import("./rssNewsScheduler");
      const { generateSportEditorial, generateSportDealOfWeek, generateSportReportage, generateSportMarketAnalysis } = await import("./sportScheduler");
      await refreshSportNewsFromRSS();
      await generateSportEditorial();
      await generateSportDealOfWeek();
      await generateSportReportage();
      await generateSportMarketAnalysis();
      return { success: true, message: "Sport & Business aggiornato con successo" };
    }),
    // ── Lifestyle & Luxury ───────────────────────────────────────────────────────
    refreshLuxuryAll: adminProcedure.mutation(async () => {
      const { refreshLuxuryNewsFromRSS } = await import("./rssNewsScheduler");
      const { generateLuxuryEditorial, generateLuxuryDealOfWeek, generateLuxuryReportage, generateLuxuryMarketAnalysis } = await import("./luxuryScheduler");
      await refreshLuxuryNewsFromRSS();
      await generateLuxuryEditorial();
      await generateLuxuryDealOfWeek();
      await generateLuxuryReportage();
      await generateLuxuryMarketAnalysis();
      return { success: true, message: "Lifestyle & Luxury aggiornato con successo" };
    }),
    // ── Refresh News Generali ────────────────────────────────────────────────────────────
    refreshNewsAll: adminProcedure.mutation(async () => {
      const { refreshNewsGeneraliFromRSS } = await import("./rssNewsScheduler");
      await refreshNewsGeneraliFromRSS();
      return { success: true, message: "News Italia aggiornate con successo" };
    }),

    // ── Refresh Motori ───────────────────────────────────────────────────────────────────
    refreshMotoriAll: adminProcedure.mutation(async () => {
      const { refreshMotoriNewsFromRSS } = await import("./rssNewsScheduler");
      await refreshMotoriNewsFromRSS();
      return { success: true, message: "Motori aggiornato con successo" };
    }),

    // ── Refresh Tennis ───────────────────────────────────────────────────────────────────
    refreshTennisAll: adminProcedure.mutation(async () => {
      const { refreshTennisNewsFromRSS } = await import("./rssNewsScheduler");
      await refreshTennisNewsFromRSS();
      return { success: true, message: "Tennis aggiornato con successo" };
    }),

    // ── Refresh Basket ───────────────────────────────────────────────────────────────────
    refreshBasketAll: adminProcedure.mutation(async () => {
      const { refreshBasketNewsFromRSS } = await import("./rssNewsScheduler");
      await refreshBasketNewsFromRSS();
      return { success: true, message: "Basket aggiornato con successo" };
    }),

    // ── Refresh TUTTI i canali RSS ────────────────────────────────────────────────────────
    refreshAllRSSChannels: adminProcedure.mutation(async () => {
      const { refreshAllNewsFromRSS } = await import("./rssNewsScheduler");
      // Avvia in background per non bloccare la risposta
      refreshAllNewsFromRSS().catch(err => console.error("[Admin] Errore refreshAllRSS:", err));
      return { success: true, message: "Refresh di tutti i canali avviato in background" };
    }),

    // ── Newsletter Giornaliera per Canale — Preview (07:00 CET) ─────────────────────────
    sendDailyChannelPreview: adminProcedure.mutation(async () => {
      const { sendDailyChannelPreview } = await import("./dailyChannelNewsletter");
      const result = await sendDailyChannelPreview();
      const { getLatestNews } = await import("./db");
      const { getTodayChannel } = await import("./dailyChannelNewsletter");
      const channel = getTodayChannel();
      const newsCount = channel ? (await getLatestNews(12, channel.key)).length : 0;
      return {
        success: result.success,
        channel: result.channel,
        subject: result.subject,
        newsCount,
        error: result.error,
      };
    }),

    // ── Newsletter Giornaliera per Canale — Invio Massivo ────────────────────────────────
    sendChannelNewsletter: adminProcedure
      .input(z.object({
        channelKey: z.enum(["ai", "startup", "finance", "sport", "music", "luxury", "health"]),
        testOnly: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const { sendChannelNewsletterManual } = await import("./dailyChannelNewsletter");
        const result = await sendChannelNewsletterManual(input.channelKey, input.testOnly);
        return {
          success: result.success,
          channel: result.channel,
          recipientCount: result.recipientCount,
          newsCount: result.newsCount,
          subject: result.subject,
          error: result.error,
        };
      }),

    // ── LinkedIn Autopost manuale ────────────────────────────────────────────────────────
    publishLinkedIn: adminProcedure.mutation(async () => {
      console.log("[AdminRouter] Avvio pubblicazione manuale LinkedIn...");
      const result = await publishDailyLinkedInPosts();
      return {
        success: result.published > 0,
        published: result.published,
        total: result.posts.length,
        errors: result.errors,
        posts: result.posts.map((p) => ({
          section: p.section,
          title: p.title.slice(0, 80),
          success: p.success,
          postId: p.postId,
          error: p.error,
        })),
        message: `${result.published}/${result.posts.length} post pubblicati su LinkedIn`,
      };
    }),
  }),

  // ── Comments (public) ──────────────────────────────────────────────────────────────
  comments: router({
    // Aggiungi un commento a un articolo
    add: publicProcedure
      .input(z.object({
        section: z.enum(["ai", "music", "startup"]),
        articleType: z.enum(["news", "editorial", "startup", "reportage", "analysis"]),
        articleId: z.number().int().positive(),
        authorName: z.string().min(2).max(100),
        authorEmail: z.string().email().optional(),
        content: z.string().min(5).max(2000),
      }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const [inserted] = await db.insert(articleCommentsTable).values({
          section: input.section,
          articleType: input.articleType,
          articleId: input.articleId,
          authorName: input.authorName,
          authorEmail: input.authorEmail ?? null,
          content: input.content,
          approved: true,
        });
        return { success: true, id: inserted.insertId };
      }),

    // Recupera i commenti approvati per un articolo
    getByArticle: publicProcedure
      .input(z.object({
        section: z.enum(["ai", "music", "startup"]),
        articleType: z.enum(["news", "editorial", "startup", "reportage", "analysis"]),
        articleId: z.number().int().positive(),
      }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return [];
        const comments = await db
          .select()
          .from(articleCommentsTable)
          .where(
            and(
              eq(articleCommentsTable.section, input.section),
              eq(articleCommentsTable.articleType, input.articleType),
              eq(articleCommentsTable.articleId, input.articleId),
              eq(articleCommentsTable.approved, true)
            )
          )
          .orderBy(desc(articleCommentsTable.createdAt))
          .limit(50);
        return comments;
      }),
  }),
  // ── Audit Contenuti (admin only) ──────────────────────────────────────────────────────
  // Verifica la coerenza tra contenuti pubblicati e pagine di destinazione
  audit: router({
    // Avvia un audit batch sulle ultime notizie
    runBatch: adminProcedure
      .input(z.object({
        section: z.enum(["ai", "music", "startup"]).optional(),
        contentType: z.enum(["news", "analysis"]).default("news"),
        limit: z.number().min(1).max(50).default(10),
      }))
      .mutation(async ({ input }) => {
        const results = await runBatchAudit({
          section: input.section,
          contentType: input.contentType,
          limit: input.limit,
        });
        return results;
      }),

    // Audit di una singola notizia
    auditSingleNews: adminProcedure
      .input(z.object({ newsId: z.number() }))
      .mutation(async ({ input }) => {
        return auditNewsItem(input.newsId);
      }),

    // Audit di una singola analisi
    auditSingleAnalysis: adminProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ input }) => {
        return auditMarketAnalysis(input.analysisId);
      }),

    // Recupera i risultati dell'audit con filtri
    getResults: adminProcedure
      .input(z.object({
        section: z.enum(["ai", "music", "startup"]).optional(),
        status: z.enum(["ok", "warning", "error", "unreachable", "pending"]).optional(),
        contentType: z.enum(["news", "analysis", "reportage", "startup"]).optional(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        return getAuditResults(input);
      }),

    // Statistiche aggregate dell'audit
    getStats: adminProcedure
      .query(async () => {
        const db = await getDbInstance();
        if (!db) return { total: 0, ok: 0, warning: 0, error: 0, unreachable: 0, pending: 0 };

        const all = await db
          .select()
          .from(contentAuditTable)
          .orderBy(desc(contentAuditTable.auditedAt))
          .limit(500);

        const stats = { total: all.length, ok: 0, warning: 0, error: 0, unreachable: 0, pending: 0 };
        for (const row of all) {
          stats[row.status as keyof typeof stats] = (stats[row.status as keyof typeof stats] || 0) + 1;
        }
        return stats;
      }),

    // Elimina un risultato di audit
    deleteResult: adminProcedure
      .input(z.object({ auditId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        await db.delete(contentAuditTable).where(eq(contentAuditTable.id, input.auditId));
        return { success: true };
      }),

    // Audit completo: news + analisi + reportage
    runFullAuditNow: adminProcedure
      .input(z.object({
        section: z.enum(["ai", "music", "startup"]).optional(),
        limit: z.number().min(1).max(50).default(20),
      }))
      .mutation(async ({ input }) => {
        const results = await runFullAudit({ section: input.section, limit: input.limit });
        return results;
      }),

    // Audit singolo reportage
    auditSingleReportage: adminProcedure
      .input(z.object({ reportageId: z.number() }))
      .mutation(async ({ input }) => {
        return auditReportage(input.reportageId);
      }),

    // Stato dello scheduler automatico
    getSchedulerStatus: adminProcedure
      .query(() => {
        return getSchedulerStatus();
      }),

    // Forza esecuzione immediata dell'audit schedulato
    triggerScheduledAudit: adminProcedure
      .mutation(async () => {
        // Esegui in background senza bloccare la risposta
        setImmediate(() => runScheduledAudit());
        return { success: true, message: "Audit avviato in background" };
      }),
  }),

  // ── Advertising / Media Kit ──────────────────────────────────────────────
  advertise: router({
    // Invio richiesta contatto inserzionista
    contact: publicProcedure
      .input(z.object({
        company: z.string().min(1, "Azienda obbligatoria"),
        name: z.string().min(1, "Nome obbligatorio"),
        email: z.string().email("Email non valida"),
        format: z.string().optional(),
        budget: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const subject = `🎯 Nuova richiesta advertising da ${input.company}`;
        const htmlBody = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px;">
            <div style="background: #0a0f1e; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="color: #00e5c8; font-size: 22px; margin: 0; font-weight: 900;">IDEA<span style="color: #ffffff;">SMART</span></h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0 0; letter-spacing: 2px;">NUOVA RICHIESTA ADVERTISING</p>
            </div>
            <div style="background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e5e7eb;">
              <h2 style="color: #0a0f1e; font-size: 20px; margin: 0 0 20px;">Dettagli richiesta</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 13px; width: 140px;">Azienda</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 15px; font-weight: 600;">${input.company}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Contatto</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 15px;">${input.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Email</td>
                  <td style="padding: 10px 0;"><a href="mailto:${input.email}" style="color: #00e5c8; font-size: 15px;">${input.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Formato</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 15px;">${input.format || "Non specificato"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Budget</td>
                  <td style="padding: 10px 0; color: #111827; font-size: 15px;">${input.budget || "Non specificato"}</td>
                </tr>
                ${input.message ? `<tr><td style="padding: 10px 0; color: #9ca3af; font-size: 13px; vertical-align: top;">Messaggio</td><td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.6;">${input.message}</td></tr>` : ""}
              </table>
            </div>
            <div style="margin-top: 20px; padding: 16px; background: #fff3ee; border-radius: 8px; border-left: 3px solid #ff5500;">
              <p style="color: #ff5500; font-size: 13px; font-weight: 700; margin: 0 0 4px;">Azione richiesta</p>
              <p style="color: #4b5563; font-size: 13px; margin: 0;">Rispondere entro 24 ore a <strong>${input.email}</strong> con una proposta personalizzata.</p>
            </div>
          </div>
        `;

        // Invia email di notifica all'admin
        await sendEmail({
          to: "ac@acinelli.com",
          subject,
          html: htmlBody,
        });

        // Invia email di conferma all'inserzionista
        const confirmHtml = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px;">
            <div style="background: #0a0f1e; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
              <h1 style="color: #00e5c8; font-size: 24px; margin: 0; font-weight: 900;">IDEA<span style="color: #ffffff;">SMART</span></h1>
              <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 6px 0 0; letter-spacing: 2px;">AI FOR BUSINESS</p>
            </div>
            <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="width: 64px; height: 64px; background: #e6faf8; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px;">✓</div>
              <h2 style="color: #0a0f1e; font-size: 22px; margin: 0 0 12px; font-weight: 900;">Richiesta ricevuta!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Ciao <strong>${input.name}</strong>, abbiamo ricevuto la tua richiesta per <strong>${input.company}</strong>. Ti risponderemo entro <strong>24 ore</strong> con una proposta personalizzata.</p>
              <a href="https://ideasmart.ai/advertise" style="display: inline-block; background: #ff5500; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">Esplora i formati →</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">IDEASMART · info@ideasmart.ai · <a href="https://ideasmart.ai" style="color: #00e5c8;">ideasmart.ai</a></p>
          </div>
        `;

        await sendEmail({
          to: input.email,
          subject: `Abbiamo ricevuto la tua richiesta — IDEASMART`,
          html: confirmHtml,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
