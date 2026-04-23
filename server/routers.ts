import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminRouter as adminToolsRouter } from "./routers/adminRouter";
import { journalistRouter, journalistAdminRouter } from "./routers/journalist";
import { bannersRouter } from "./routers/banners";
import { amazonDealsRouter } from "./routers/amazonDeals";
import { siteAuthRouter } from "./routers/siteAuth";
import { accountRouter } from "./routers/account";
import { channelsRouter } from "./routers/channels";
import { cached, invalidateAll, getCacheStats, CACHE_KEYS, DEFAULT_TTL_MS, EDITORIAL_TTL_MS, TTL_SECTION_COUNT_MS, TTL_SUBSCRIBER_COUNT_MS, TTL_PUNTO_DEL_GIORNO_MS, TTL_LLM_WIDGET_MS, TTL_EDITORIAL_MS, invalidateSection } from "./cache";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sendEmail, buildWelcomeEmailHtml, buildFullNewsletterHtml } from "./email";
import { publishLinkedInPost, publishDailyLinkedInPosts } from "./linkedinPublisher";

import {
  addSubscriber,
  saveToolSubmission,
  getToolSubmissions,
  getApprovedToolsForDate,
  updateToolSubmissionStatus,
  saveNewsletterFeedback,
  getNewsletterFeedbacks,
  getActiveOpenSourceTools,
  saveOpenSourceTool,
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
} from "./db";
import { generateLatestAINews, saveNewsToDb } from "./newsScheduler";
import { generateStartupNews, generateStartupEditorial, generateStartupOfWeek, generateStartupReportage, generateStartupMarketAnalysis } from "./startupScheduler";
import { generateDailyEditorial, generateStartupOfDay } from "./dailyContentScheduler";
import { generateWeeklyReportage } from "./weeklyReportageScheduler";
import { generateMarketAnalysis } from "./marketAnalysisScheduler";
import { getLatestWeeklyReportage, getLatestMarketAnalysis, getGradeAArticles, getTrustDistribution } from "./db";
import { generateImage } from "./_core/imageGeneration";
import { getDb as getDbInstance } from "./db";
import { newsItems as newsItemsTable, weeklyReportage as weeklyReportageTable, marketAnalysis as marketAnalysisTable, dailyEditorial as dailyEditorialTable, startupOfDay as startupOfDayTable, articleComments as articleCommentsTable, contentAudit as contentAuditTable } from "../drizzle/schema";
import { eq, isNull, isNotNull, and, desc, count, gte, sql } from "drizzle-orm";
import { runBatchAudit, auditNewsItem, auditMarketAnalysis, getAuditResults, runFullAudit, auditReportage } from "./auditContent";
import { getSchedulerStatus, runScheduledAudit } from "./auditScheduler";
import { getActiveBreakingNews, generateBreakingNews } from "./breakingNewsGenerator";
import { generateDailyResearch, getTodayResearch, getResearchOfDay } from "./researchGenerator";
import { researchReports, techEvents, siteUsers, dealflowPicks, toolSubmissions as toolSubmissionsTable, newsletterFeedback as newsletterFeedbackTable, openSourceTools as openSourceToolsTable } from "../drizzle/schema";
import { aggregateEvents } from "./eventsAggregator";
import { verifyOrgRouter } from "./verify/orgRouter";
import { verifyApiKeyRouter } from "./verify/apiKeyRouter";
import { verifyUsageRouter } from "./verify/usageRouter";
import { verifyClientRouter } from "./verify/clientRouter";
import { verifyStripeRouter } from "./verify/stripeVerify";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori" });
  }
  return next({ ctx });
});

export const appRouter = router({
  banners: bannersRouter,
  system: systemRouter,
  adminTools: adminToolsRouter,
  amazonDeals: amazonDealsRouter,
  siteAuth: siteAuthRouter,
  account: accountRouter,
  channels: channelsRouter,
  // ── ProofPress Verify SaaS — B2B Layer (namespace isolato) ─────────────────
  verifyOrg: verifyOrgRouter,
  verifyApiKey: verifyApiKeyRouter,
  verifyUsage: verifyUsageRouter,
  verifyClient: verifyClientRouter,
  verifyStripe: verifyStripeRouter,
  journalist: journalistRouter,
  journalistAdmin: journalistAdminRouter,

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
      .input(z.object({ section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
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
        }, TTL_EDITORIAL_MS);
      }),
  }),

  // ── Weekly Reportage (public) ─────────────────────────────────────────────────────────────────────────────────────────────
  reportage: router({
    getLatestWeek: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
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
        }, TTL_EDITORIAL_MS);
      }),
  }),

  // ── Editorial (public) ──────────────────────────────────────────────────────────────────────────────────
  editorial: router({
    getLatest: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
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
        }, TTL_EDITORIAL_MS);
      }),
    getAll: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(60) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 60;
        return cached(`editorial:all:${limit}`, async () => {
          const db = await getDbInstance();
          if (!db) return [];
          const items = await db.select({
            id: dailyEditorialTable.id,
            dateLabel: dailyEditorialTable.dateLabel,
            title: dailyEditorialTable.title,
            subtitle: dailyEditorialTable.subtitle,
            keyTrend: dailyEditorialTable.keyTrend,
            section: dailyEditorialTable.section,
            imageUrl: dailyEditorialTable.imageUrl,
            authorNote: dailyEditorialTable.authorNote,
            createdAt: dailyEditorialTable.createdAt,
          }).from(dailyEditorialTable)
            .orderBy(desc(dailyEditorialTable.createdAt))
            .limit(limit);
          return items;
        }, EDITORIAL_TTL_MS);
      }),
  }),

  // ── Startup of the Day (public) ─────────────────────────────────────────────────────────────────────────────
  startupOfDay: router({
    getLatest: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
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
        }, TTL_EDITORIAL_MS);
      }),
  }),

  // ── News (public) ──────────────────────────────────────────────────────────────────────────────────
  news: router({
    getLatest: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20), section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
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
          verifyHash: item.verifyHash ?? null,
          trustGrade: (item as Record<string, unknown>).trustGrade as string | null ?? null,
          trustScore: (item as Record<string, unknown>).trustScore as number | null ?? null,
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

    // Articoli con Trust Score Grade A (massima certificazione) — o i migliori Grade B come fallback
    getGradeA: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(12).default(6) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 6;
        return cached(
          `news:gradeA:${limit}`,
          () => getGradeAArticles(limit),
          DEFAULT_TTL_MS
        );
      }),
    // Distribuzione Trust Score per widget sidebar
    getTrustDistribution: publicProcedure.query(async () => {
      return cached(
        'news:trustDistribution',
        () => getTrustDistribution(),
        DEFAULT_TTL_MS
      );
    }),
    // Statistiche filtro audit per la dashboard admin
    getFilterStats: adminProcedure
      .input(z.object({ section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
      .query(async ({ input }) => {
        return countFilteredNews(input.section);
      }),

    // Recupera notizie con score < 40 per revisione/sostituzione
    getLowScore: adminProcedure
      .input(z.object({ section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
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
              verifyHash: item.verifyHash ?? null,
              trustGrade: item.trustGrade ?? null,
              trustScore: item.trustScore ?? null,
              verifyReport: item.verifyReport ?? null,
              ipfsCid: item.ipfsCid ?? null,
              ipfsUrl: item.ipfsUrl ?? null,
            };
          },
          TTL_EDITORIAL_MS // 20 min: articolo stabile
        );
      }),

    // Recupera notizie correlate per sezione/categoria
    getRelated: publicProcedure
      .input(z.object({
        id: z.number(),
        section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai'),
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
        section: z.enum(['all', 'ai', 'startup', 'dealroom', 'research']).default('all'),
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

    // Punto del Giorno: recupera il post LinkedIn più recente (autore: Andrea Cinelli)
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
              slot: (post as any).slot ?? 'morning',
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

    // Punto del Giorno (doppio): recupera ENTRAMBI i post LinkedIn di oggi (mattino + pomeriggio)
    getPuntoDelGiornoAll: publicProcedure
      .query(async () => {
        return cached(
          CACHE_KEYS.PUNTO_DEL_GIORNO + '_all',
          async () => {
            const db = await getDbInstance();
            if (!db) return [];
            const { linkedinPosts: linkedinPostsTable } = await import('../drizzle/schema');
            const { eq: eqOp, desc: descOp } = await import('drizzle-orm');

            // Prendi l'ultimo post morning pubblicato (il più recente in assoluto)
            // Questo garantisce che il Punto del Giorno si aggiorni sempre
            // all'ultimo articolo pubblicato su LinkedIn
            const posts = await db.select().from(linkedinPostsTable)
              .where(eqOp(linkedinPostsTable.slot, 'morning'))
              .orderBy(descOp(linkedinPostsTable.createdAt))
              .limit(1);

            return posts.map(post => ({
              id: post.id,
              dateLabel: post.dateLabel,
              slot: (post as any).slot ?? 'morning',
              postText: post.postText,
              linkedinUrl: post.linkedinUrl ?? null,
              title: post.title ?? null,
              section: post.section,
              imageUrl: post.imageUrl ?? null,
              hashtags: post.hashtags ?? null,
              createdAt: post.createdAt,
            }));
          },
          EDITORIAL_TTL_MS
        );
      }),

    // Deep Dive: secondo post LinkedIn del giorno (slot ai-research-morning), diverso dal Punto del Giorno
    getDeepDivePost: publicProcedure
      .query(async () => {
        return cached(
          'news:deepDivePost',
          async () => {
            const db = await getDbInstance();
            if (!db) return null;
            const { linkedinPosts: linkedinPostsTable } = await import('../drizzle/schema');
            const { eq: eqOp, desc: descOp } = await import('drizzle-orm');
            // Prima prendi il titolo del Punto del Giorno (slot morning) per escluderlo
            const morningPosts = await db.select({ title: linkedinPostsTable.title })
              .from(linkedinPostsTable)
              .where(eqOp(linkedinPostsTable.slot, 'morning'))
              .orderBy(descOp(linkedinPostsTable.createdAt))
              .limit(1);
            const morningTitle = morningPosts[0]?.title ?? '';
            // Prendi i post ai-research-morning piu' recenti
            const posts = await db.select().from(linkedinPostsTable)
              .where(eqOp(linkedinPostsTable.slot, 'ai-research-morning'))
              .orderBy(descOp(linkedinPostsTable.createdAt))
              .limit(5);
            // Filtra per titolo diverso dal Punto del Giorno
            const deepDive = posts.find(p => p.title !== morningTitle) ?? posts[0] ?? null;
            if (!deepDive) return null;
            return {
              id: deepDive.id,
              dateLabel: deepDive.dateLabel,
              slot: (deepDive as any).slot ?? 'ai-research-morning',
              postText: deepDive.postText,
              linkedinUrl: deepDive.linkedinUrl ?? null,
              title: deepDive.title ?? null,
              section: deepDive.section,
              imageUrl: deepDive.imageUrl ?? null,
              hashtags: deepDive.hashtags ?? null,
              createdAt: deepDive.createdAt,
            };
          },
          EDITORIAL_TTL_MS
        );
      }),

    // Archivio editoriali dell'autore (per pagina /andrea-cinelli)
    getAuthorPosts: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(30) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 30;
        const db = await getDbInstance();
        if (!db) return [];
        const { linkedinPosts: linkedinPostsTable } = await import('../drizzle/schema');
        const { desc: descOp } = await import('drizzle-orm');
        // Recupera tutti gli slot (non solo morning) per mostrare tutti i post dell'autore
        const posts = await db.select().from(linkedinPostsTable)
          .orderBy(descOp(linkedinPostsTable.createdAt))
          .limit(limit * 3); // Recupera più post per compensare deduplicazione per titolo
        // Deduplicazione per titolo: mostra solo il post più recente per ogni titolo univoco
        const seenTitles = new Set<string>();
        const deduplicated = posts.filter(post => {
          const key = (post.title ?? post.postText.substring(0, 80)).toLowerCase().trim();
          if (seenTitles.has(key)) return false;
          seenTitles.add(key);
          return true;
        }).slice(0, limit);
        return deduplicated.map(post => ({
          id: post.id,
          dateLabel: post.dateLabel,
          slot: (post as any).slot ?? 'morning',
          postText: post.postText,
          linkedinUrl: post.linkedinUrl ?? null,
          title: post.title ?? null,
          section: post.section,
          imageUrl: post.imageUrl ?? null,
          hashtags: post.hashtags ?? null,
          createdAt: post.createdAt,
        }));
      }),

    // Breaking news attive (selezionate ogni ora dall'AI)
    getBreakingNews: publicProcedure
      .query(async () => {
        return cached(
          'news:breakingNews',
          async () => {
            const items = await getActiveBreakingNews();
            return items.map(item => ({
              id: item.id,
              title: item.title,
              summary: item.summary,
              sourceUrl: item.sourceUrl,
              sourceName: item.sourceName,
              section: item.section,
              urgencyScore: item.urgencyScore,
              breakingReason: item.breakingReason ?? '',
              publishedAt: item.publishedAt ?? '',
              createdAt: item.createdAt,
            }));
          },
          1000 * 60 * 5 // 5 minuti di cache
        );
      }),

    // Top articoli della settimana: ordinati per viewCount degli ultimi 7 giorni
    getTopArticlesWeekly: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
      .query(async ({ input }) => {
        return cached(
          `news:topWeekly:${input.limit}`,
          async () => {
            const db = await getDbInstance();
            if (!db) return [];
            // Prendi i più visti della settimana (ultimi 7 giorni)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const items = await db.select().from(newsItemsTable)
              .where(gte(newsItemsTable.createdAt, sevenDaysAgo))
              .orderBy(desc(newsItemsTable.viewCount), desc(newsItemsTable.createdAt))
              .limit(input.limit);
            // Se non ci sono abbastanza articoli con views, completa con i più recenti
            if (items.length < input.limit) {
              const recentItems = await db.select().from(newsItemsTable)
                .orderBy(desc(newsItemsTable.createdAt))
                .limit(input.limit);
              const existingIds = new Set(items.map(i => i.id));
              const extra = recentItems.filter(i => !existingIds.has(i.id));
              items.push(...extra.slice(0, input.limit - items.length));
            }
            return items.slice(0, input.limit).map((item, idx) => ({
              id: item.id,
              rank: idx + 1,
              title: item.title,
              summary: item.summary,
              category: item.category,
              section: item.section,
              sourceName: item.sourceName ?? '',
              sourceUrl: item.sourceUrl ?? '#',
              publishedAt: item.publishedAt ?? '',
              imageUrl: item.imageUrl ?? null,
              viewCount: item.viewCount ?? 0,
            }));
          },
          1000 * 60 * 15 // 15 minuti di cache
        );
      }),

    // Traccia una visualizzazione articolo (incrementa viewCount)
    trackView: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return { ok: false };
        try {
          await db.update(newsItemsTable)
            .set({
              viewCount: sql`${newsItemsTable.viewCount} + 1`,
              lastViewedAt: new Date(),
            })
            .where(eq(newsItemsTable.id, input.id));
          // La cache top weekly si aggiornerà automaticamente alla scadenza (15 min)
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }),

    // ── Proof Press Research ──────────────────────────────────────────────────
    getResearchReports: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
      .query(async ({ input }) => {
        return cached(
          `research:today:${input.limit}`,
          async () => {
            const reports = await getTodayResearch();
            return reports.slice(0, input.limit).map(r => ({
              id: r.id,
              title: r.title,
              summary: r.summary,
              keyFindings: (() => { try { return JSON.parse(r.keyFindings); } catch { return []; } })(),
              source: r.source,
              sourceUrl: r.sourceUrl ?? null,
              category: r.category,
              region: r.region,
              dateLabel: r.dateLabel,
              isResearchOfDay: r.isResearchOfDay,
              imageUrl: r.imageUrl ?? null,
              viewCount: r.viewCount,
              createdAt: r.createdAt,
            }));
          },
          1000 * 60 * 30
        );
      }),

    getResearchByCategory: publicProcedure
      .input(z.object({ category: z.string(), limit: z.number().min(1).max(20).default(10) }))
      .query(async ({ input }) => {
        return cached(
          `research:category:${input.category}:${input.limit}`,
          async () => {
            const reports = await getTodayResearch();
            return reports
              .filter(r => r.category === input.category)
              .slice(0, input.limit)
              .map(r => ({
                id: r.id,
                title: r.title,
                summary: r.summary,
                keyFindings: (() => { try { return JSON.parse(r.keyFindings); } catch { return []; } })(),
                source: r.source,
                sourceUrl: r.sourceUrl ?? null,
                category: r.category,
                region: r.region,
                dateLabel: r.dateLabel,
                isResearchOfDay: r.isResearchOfDay,
                imageUrl: r.imageUrl ?? null,
                viewCount: r.viewCount,
                createdAt: r.createdAt,
              }));
          },
          1000 * 60 * 30
        );
      }),
    getResearchOfDay: publicProcedure
      .query(async () => {
        // Chiave cache con ora CET: cambia ogni ora, garantendo la rotazione della research
        const hourCET = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })).getHours();
        const cacheKey = `research:ofDay:h${hourCET}`;
        return cached(
          cacheKey,
          async () => {
            const report = await getResearchOfDay();
            if (!report) return null;
            return {
              id: report.id,
              title: report.title,
              summary: report.summary,
              keyFindings: (() => { try { return JSON.parse(report.keyFindings); } catch { return []; } })(),
              source: report.source,
              sourceUrl: report.sourceUrl ?? null,
              imageUrl: report.imageUrl ?? null,
              category: report.category,
              region: report.region,
              dateLabel: report.dateLabel,
              viewCount: report.viewCount,
              createdAt: report.createdAt,
            };
          },
          1000 * 60 * 60 // TTL 60 min: allineato alla rotazione oraria
        );
      }),

    trackResearchView: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return { ok: false };
        try {
          await db.update(researchReports)
            .set({ viewCount: sql`${researchReports.viewCount} + 1` })
            .where(eq(researchReports.id, input.id));
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }),

    // Recupera una singola ricerca per ID (per la pagina dettaglio /research/:id)
    getResearchById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return cached(
          `research:byId:${input.id}`,
          async () => {
            const db = await getDbInstance();
            if (!db) return null;
            const rows = await db.select().from(researchReports)
              .where(eq(researchReports.id, input.id))
              .limit(1);
            if (!rows.length) return null;
            const r = rows[0];
            return {
              id: r.id,
              title: r.title,
              summary: r.summary,
              keyFindings: (() => { try { return JSON.parse(r.keyFindings); } catch { return []; } })() as string[],
              source: r.source,
              sourceUrl: r.sourceUrl ?? null,
              category: r.category,
              region: r.region,
              dateLabel: r.dateLabel,
              isResearchOfDay: r.isResearchOfDay,
              imageUrl: r.imageUrl ?? null,
              viewCount: r.viewCount,
              createdAt: r.createdAt,
            };
          },
          1000 * 60 * 60 // 1 ora
        );
      }),

    // Sostituisce automaticamente le notizie con score < 40 con contenuto AI
    replaceAllLowScore: adminProcedure
      .input(z.object({ section: z.enum(['ai', 'startup', 'dealroom', 'research']).default('ai') }))
      .mutation(async ({ input }) => {
        const lowScoreNews = await getLowScoreNews(input.section);
        if (lowScoreNews.length === 0) return { replaced: 0, message: 'Nessuna notizia da sostituire' };

        const sectionLabel = input.section === 'ai' ? 'intelligenza artificiale e business' : 'startup e innovazione';
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
    // Verifica hash VERIFY — cerca un articolo per hash SHA-256
    lookupByHash: publicProcedure
      .input(z.object({ hash: z.string().min(8).max(128) }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return null;
        const rows = await db
          .select({
            id: newsItemsTable.id,
            title: newsItemsTable.title,
            summary: newsItemsTable.summary,
            category: newsItemsTable.category,
            weekLabel: newsItemsTable.weekLabel,
            sourceName: newsItemsTable.sourceName,
            sourceUrl: newsItemsTable.sourceUrl,
            section: newsItemsTable.section,
            publishedAt: newsItemsTable.publishedAt,
            verifyHash: newsItemsTable.verifyHash,
            ipfsCid: newsItemsTable.ipfsCid,
            ipfsUrl: newsItemsTable.ipfsUrl,
            ipfsPinnedAt: newsItemsTable.ipfsPinnedAt,
            trustScore: newsItemsTable.trustScore,
            trustGrade: newsItemsTable.trustGrade,
            verifyReport: newsItemsTable.verifyReport,
          })
          .from(newsItemsTable)
          .where(eq(newsItemsTable.verifyHash, input.hash))
          .limit(1);
        if (!rows.length) return null;
        const r = rows[0];
        return {
          id: r.id,
          title: r.title,
          summary: r.summary,
          category: r.category,
          weekLabel: r.weekLabel,
          sourceName: r.sourceName,
          sourceUrl: r.sourceUrl ?? null,
          section: r.section,
          publishedAt: r.publishedAt,
          verifyHash: r.verifyHash ?? null,
          ipfsCid: r.ipfsCid ?? null,
          ipfsUrl: r.ipfsUrl ?? null,
          ipfsPinnedAt: r.ipfsPinnedAt ?? null,
          trustScore: r.trustScore ?? null,
          trustGrade: r.trustGrade ?? null,
          verifyReport: r.verifyReport ?? null,
        };
      }),

    // Cerca articolo per CID IPFS — usato dalla pagina /verify/:cid quando il parametro è un CID IPFS
    lookupByCid: publicProcedure
      .input(z.object({ cid: z.string().min(10).max(200) }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return null;
        const rows = await db
          .select({
            id: newsItemsTable.id,
            title: newsItemsTable.title,
            summary: newsItemsTable.summary,
            category: newsItemsTable.category,
            weekLabel: newsItemsTable.weekLabel,
            sourceName: newsItemsTable.sourceName,
            sourceUrl: newsItemsTable.sourceUrl,
            section: newsItemsTable.section,
            publishedAt: newsItemsTable.publishedAt,
            verifyHash: newsItemsTable.verifyHash,
            ipfsCid: newsItemsTable.ipfsCid,
            ipfsUrl: newsItemsTable.ipfsUrl,
            ipfsPinnedAt: newsItemsTable.ipfsPinnedAt,
            trustScore: newsItemsTable.trustScore,
            trustGrade: newsItemsTable.trustGrade,
            verifyReport: newsItemsTable.verifyReport,
          })
          .from(newsItemsTable)
          .where(eq(newsItemsTable.ipfsCid, input.cid))
          .limit(1);
        if (!rows.length) return null;
        const r = rows[0];
        return {
          id: r.id,
          title: r.title,
          summary: r.summary,
          category: r.category,
          weekLabel: r.weekLabel,
          sourceName: r.sourceName,
          sourceUrl: r.sourceUrl ?? null,
          section: r.section,
          publishedAt: r.publishedAt,
          verifyHash: r.verifyHash ?? null,
          ipfsCid: r.ipfsCid ?? null,
          ipfsUrl: r.ipfsUrl ?? null,
          ipfsPinnedAt: r.ipfsPinnedAt ?? null,
          trustScore: r.trustScore ?? null,
          trustGrade: r.trustGrade ?? null,
          verifyReport: r.verifyReport ?? null,
        };
      }),

    // Ancora un articolo su IPFS via Pinata — restituisce CID e URL gateway
    pinToIPFS: publicProcedure
      .input(z.object({ hash: z.string().min(8).max(128) }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB non disponibile' });

        // Recupera l'articolo
        const rows = await db
          .select()
          .from(newsItemsTable)
          .where(eq(newsItemsTable.verifyHash, input.hash))
          .limit(1);
        if (!rows.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'Articolo non trovato' });
        const article = rows[0];

        // Se già pinnato, restituisce i dati esistenti
        if (article.ipfsCid && article.ipfsUrl) {
          return { cid: article.ipfsCid, ipfsUrl: article.ipfsUrl, alreadyPinned: true };
        }

        // Pinna su IPFS via Pinata
        const { pinVerificationReport } = await import('./pinata.js');
        const { cid, ipfsUrl } = await pinVerificationReport({
          verifyHash: article.verifyHash!,
          article: {
            id: article.id,
            title: article.title,
            summary: article.summary,
            section: article.section,
            sourceName: article.sourceName,
            sourceUrl: article.sourceUrl,
            publishedAt: article.publishedAt,
            category: article.category,
            weekLabel: article.weekLabel,
          },
        });

        // Ricalcola trustScore ora che IPFS è disponibile
        const { upgradeTrustGradeAfterIpfs } = await import('./trustScore.js');
        const upgraded = upgradeTrustGradeAfterIpfs({
          verifyHash: article.verifyHash!,
          ipfsCid: cid,
          sourceName: article.sourceName,
          sourceUrl: article.sourceUrl,
          summary: article.summary,
        });

        // Salva CID, URL e trustScore aggiornato nel DB
        await db
          .update(newsItemsTable)
          .set({
            ipfsCid: cid,
            ipfsUrl: ipfsUrl,
            ipfsPinnedAt: new Date(),
            trustScore: upgraded.score / 100,
            trustGrade: upgraded.grade,
          })
          .where(eq(newsItemsTable.id, article.id));

        console.log(`[pinToIPFS] ⛓ Trust upgraded →${upgraded.grade} (${upgraded.score}/100) post-IPFS: ${article.title.substring(0, 50)}`);
        return { cid, ipfsUrl, alreadyPinned: false, trustGrade: upgraded.grade, trustScore: upgraded.score };
      }),

    // Proxy server-side per caricare un Verification Report da IPFS — bypassa il CORS
    fetchIPFSReport: publicProcedure
      .input(z.object({ cid: z.string().min(10).max(200) }))
      .query(async ({ input }) => {
        const gateways = [
          `https://gateway.pinata.cloud/ipfs/${input.cid}`,
          `https://ipfs.io/ipfs/${input.cid}`,
          `https://cloudflare-ipfs.com/ipfs/${input.cid}`,
        ];
        let lastError = '';
        for (const url of gateways) {
          try {
            const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!res.ok) { lastError = `HTTP ${res.status} from ${url}`; continue; }
            const data = await res.json();
            if (!data.protocol || !String(data.protocol).startsWith('ProofPress-Verify')) {
              throw new TRPCError({ code: 'BAD_REQUEST', message: 'Il file non è un Verification Report ProofPress valido' });
            }
            return data as Record<string, unknown>;
          } catch (err: unknown) {
            if (err instanceof TRPCError) throw err;
            lastError = err instanceof Error ? err.message : String(err);
          }
        }
        throw new TRPCError({ code: 'NOT_FOUND', message: `Impossibile caricare il report da IPFS: ${lastError}` });
      }),

    // Contatore articoli certificati su IPFS — usato nella homepage come proof point
    getIPFSCount: publicProcedure.query(async () => {
      return cached(
        'news:ipfs_count',
        async () => {
          const db = await getDbInstance();
          if (!db) return { count: 0 };
          const rows = await db
            .select({ cnt: count() })
            .from(newsItemsTable)
            .where(isNotNull(newsItemsTable.ipfsCid));
          return { count: rows[0]?.cnt ?? 0 };
        },
        5 * 60 * 1000 // 5 minuti
      );
    }),

    // ── Verify Engine: pipeline completa (claim extraction + corroboration + trust score + IPFS) ──
    runFullVerify: publicProcedure
      .input(z.object({ hash: z.string().length(64) }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB non disponibile' });

        const rows = await db
          .select({
            id: newsItemsTable.id,
            title: newsItemsTable.title,
            summary: newsItemsTable.summary,
            sourceUrl: newsItemsTable.sourceUrl,
            verifyHash: newsItemsTable.verifyHash,
            trustScore: newsItemsTable.trustScore,
            trustGrade: newsItemsTable.trustGrade,
            section: newsItemsTable.section,
            sourceName: newsItemsTable.sourceName,
            publishedAt: newsItemsTable.publishedAt,
            category: newsItemsTable.category,
            weekLabel: newsItemsTable.weekLabel,
            verifyReport: newsItemsTable.verifyReport,
          })
          .from(newsItemsTable)
          .where(eq(newsItemsTable.verifyHash, input.hash))
          .limit(1);

        const article = rows[0];
        if (!article) throw new TRPCError({ code: 'NOT_FOUND', message: 'Articolo non trovato' });
        if (!article.verifyHash) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Hash non presente' });

        // Se già verificato, restituisce i dati salvati
        if (article.trustScore !== null && article.trustGrade !== null && article.verifyReport !== null) {
          const existing = await db
            .select({ verifyReport: newsItemsTable.verifyReport })
            .from(newsItemsTable)
            .where(eq(newsItemsTable.verifyHash, input.hash))
            .limit(1);
          return {
            status: 'cached' as const,
            trustScore: article.trustScore,
            trustGrade: article.trustGrade,
            report: existing[0]?.verifyReport ?? null,
          };
        }

        // Esegui pipeline verify
        const { runVerifyPipeline } = await import('./verifyEngine.js');
        const { corroborateClaims } = await import('./corroborator.js');

        const report = await runVerifyPipeline({
          articleId: article.id,
          title: article.title,
          summary: article.summary,
          sourceUrl: article.sourceUrl,
          verifyHash: article.verifyHash,
          corroborationFn: corroborateClaims,
        });

        // Salva risultati nel DB
        await db
          .update(newsItemsTable)
          .set({
            verifyReport: report as unknown as Record<string, unknown>,
            trustScore: report.trust_score.overall,
            trustGrade: report.trust_score.grade,
          })
          .where(eq(newsItemsTable.verifyHash, input.hash));

        // Aggiorna IPFS con il report arricchito (se già pinnato, skippa)
        try {
          const ipfsRows = await db
            .select({ ipfsCid: newsItemsTable.ipfsCid })
            .from(newsItemsTable)
            .where(eq(newsItemsTable.verifyHash, input.hash))
            .limit(1);

          if (!ipfsRows[0]?.ipfsCid) {
            const { pinVerificationReport } = await import('./pinata.js');
            const { cid, ipfsUrl } = await pinVerificationReport({
              verifyHash: article.verifyHash,
              article: {
                id: article.id,
                title: article.title,
                summary: article.summary,
                section: article.section,
                sourceName: article.sourceName ?? null,
                sourceUrl: article.sourceUrl ?? null,
                publishedAt: article.publishedAt ?? null,
                category: article.category,
                weekLabel: article.weekLabel,
              },
            });
            // Ricalcola trustScore ora che IPFS è disponibile
            const { upgradeTrustGradeAfterIpfs } = await import('./trustScore.js');
            const upgradedVE = upgradeTrustGradeAfterIpfs({
              verifyHash: article.verifyHash,
              ipfsCid: cid,
              sourceName: article.sourceName ?? null,
              sourceUrl: article.sourceUrl ?? null,
              summary: article.summary,
            });
            await db
              .update(newsItemsTable)
              .set({
                ipfsCid: cid,
                ipfsUrl: ipfsUrl,
                ipfsPinnedAt: new Date(),
                trustScore: upgradedVE.score / 100,
                trustGrade: upgradedVE.grade,
              })
              .where(eq(newsItemsTable.verifyHash, input.hash));
            console.log(`[VerifyEngine] ⛓ Trust upgraded →${upgradedVE.grade} post-IPFS: ${article.title.substring(0, 50)}`);
          }
        } catch (ipfsErr) {
          console.warn('[VerifyEngine] IPFS pinning fallito (non bloccante):', ipfsErr);
        }

        return {
          status: 'completed' as const,
          trustScore: report.trust_score.overall,
          trustGrade: report.trust_score.grade,
          report,
        };
      }),

    // Restituisce il Verification Report salvato per un articolo
    getVerifyReport: publicProcedure
      .input(z.object({ hash: z.string().length(64) }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return null;
        const rows = await db
          .select({
            verifyReport: newsItemsTable.verifyReport,
            trustScore: newsItemsTable.trustScore,
            trustGrade: newsItemsTable.trustGrade,
            ipfsCid: newsItemsTable.ipfsCid,
            ipfsUrl: newsItemsTable.ipfsUrl,
          })
          .from(newsItemsTable)
          .where(eq(newsItemsTable.verifyHash, input.hash))
          .limit(1);
        return rows[0] ?? null;
      }),

    // Stato rapido del verify per un articolo (senza caricare il report completo)
    getVerifyStatus: publicProcedure
      .input(z.object({ hash: z.string().length(64) }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return null;
        const rows = await db
          .select({
            trustScore: newsItemsTable.trustScore,
            trustGrade: newsItemsTable.trustGrade,
            ipfsCid: newsItemsTable.ipfsCid,
          })
          .from(newsItemsTable)
          .where(eq(newsItemsTable.verifyHash, input.hash))
          .limit(1);
        const r = rows[0];
        if (!r) return null;
        return {
          verified: r.trustScore !== null,
          trustScore: r.trustScore ?? null,
          trustGrade: r.trustGrade ?? null,
          ipfsCid: r.ipfsCid ?? null,
        };
      }),

    // Contatore notizie per sezione — usato dal SectionNav per mostrare badge live
    getSectionCounts: publicProcedure.query(async () => {
      return cached(
        'news:section_counts',
        async () => {
          const db = await getDbInstance();
          if (!db) return {} as Record<string, number>;
          const sections = ['ai', 'startup', 'dealroom'] as const;
          const results = await Promise.all(
            sections.map(async (section) => {
              const rows = await db.select({ cnt: count() }).from(newsItemsTable)
                .where(eq(newsItemsTable.section, section));
              return [section, rows[0]?.cnt ?? 0] as const;
            })
          );
          // Aggiunge il conteggio delle ricerche giornaliere
          const researchRows = await db.select({ cnt: count() }).from(researchReports);
          const researchCount = researchRows[0]?.cnt ?? 0;
          return { ...Object.fromEntries(results), research: researchCount } as Record<string, number>;
        },
        TTL_SECTION_COUNT_MS // 5 minuti: badge nav
      );
    }),
    // ── Demo pubblica: hash SHA-256 + claim extraction + TrustGrade (nessun salvataggio nel DB) ──
    verifyDemo: publicProcedure
      .input(z.object({
        text: z.string().min(50, 'Testo troppo breve (min 50 caratteri)').max(10000, 'Testo troppo lungo (max 10.000 caratteri)'),
        title: z.string().min(3).max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const crypto = await import('crypto');
        // 1. Hash SHA-256 del contenuto
        const contentToHash = `${input.title ?? ''}\n${input.text}`.trim();
        const sha256 = crypto.createHash('sha256').update(contentToHash, 'utf8').digest('hex');
        // 2. Estrazione claim via LLM
        let claims: Array<{ claim_id: string; text: string; type: string; verifiable: boolean }> = [];
        let trustGrade = 'C';
        let trustScore = 0.55;
        let processingMs = 0;
        try {
          const t0 = Date.now();
          const llmRes = await invokeLLM({
            messages: [
              { role: 'system', content: 'Sei un fact-checker AI. Estrai i claim fattuali verificabili dal testo. Rispondi SOLO con JSON valido, nessun testo aggiuntivo.' },
              { role: 'user', content: `Testo da analizzare:\n\n${input.text.substring(0, 3000)}\n\nEstrai al massimo 5 claim fattuali verificabili. Formato JSON:\n{"claims":[{"claim_id":"c1","text":"...","type":"statistic|factual_event|quote|prediction","verifiable":true}]}` },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'claims_extraction',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    claims: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          claim_id: { type: 'string' },
                          text: { type: 'string' },
                          type: { type: 'string' },
                          verifiable: { type: 'boolean' },
                        },
                        required: ['claim_id', 'text', 'type', 'verifiable'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['claims'],
                  additionalProperties: false,
                },
              },
            },
          });
          processingMs = Date.now() - t0;
          const rawContent = llmRes?.choices?.[0]?.message?.content ?? '{"claims":[]}';
          const parsed = JSON.parse(typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent));
          claims = parsed.claims ?? [];
          // 3. TrustScore semplificato basato su criteri strutturali
          let score = 0;
          if (sha256) score += 40;
          if (input.title && input.title.length > 10) score += 8;
          if (input.text.length > 800) score += 15;
          if (claims.length > 0) score += 5;
          if (claims.filter((c) => c.verifiable).length >= 2) score += 12;
          // Normalizza 0-1
          trustScore = Math.min(score, 100) / 100;
          // Grade
          if (trustScore >= 0.85) trustGrade = 'A';
          else if (trustScore >= 0.70) trustGrade = 'B';
          else if (trustScore >= 0.55) trustGrade = 'C';
          else if (trustScore >= 0.35) trustGrade = 'D';
          else trustGrade = 'F';
        } catch (err) {
          console.error('[verifyDemo] LLM error:', err);
          // Fallback: solo hash, grade F
          trustGrade = 'F';
          trustScore = 0.15;
        }
        return {
          sha256,
          trustGrade,
          trustScore: Math.round(trustScore * 100),
          claims,
          processingMs,
          charCount: input.text.length,
          wordCount: input.text.trim().split(/\s+/).length,
          timestamp: new Date().toISOString(),
          breakdown: {
            hash: 40,
            title: input.title && input.title.length > 10 ? 8 : 0,
            richContent: input.text.length > 800 ? 15 : 0,
            claimsExtracted: claims.length > 0 ? 5 : 0,
            verifiableClaims: claims.filter((c) => c.verifiable).length >= 2 ? 12 : 0,
            ipfs: 0, // non disponibile in demo
          },
        };
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
          source: z.enum(["website", "article_wall", "newsletter", "referral", "social", "api"]).optional().default("website"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await addSubscriber({
          email: input.email,
          name: input.name,
          source: input.source ?? "website",
        });

        // Invia email di benvenuto solo ai nuovi iscritti (non a chi è già iscritto)
        if ((result as any).success || (result as any).resubscribed) {
          try {
            // Recupera il token di disiscrizione per il link GDPR nell'email
            const baseUrl = `https://proofpress.ai`;
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
              subject: "Benvenuto in Proof Press — Iscrizione confermata ✓",
              html,
            });
          } catch (emailErr) {
            // Non bloccare l'iscrizione se l'email fallisce
            console.error("[Newsletter] Errore invio email benvenuto:", emailErr);
          }
        }

        return result;
      }),

    // Conta iscritti attivi (pubblico, per social proof) — cachato 1 ora
    getActiveCount: publicProcedure.query(async () => {
      return cached(
        CACHE_KEYS.SUBSCRIBER_COUNT,
        () => getActiveSubscriberCount(),
        TTL_SUBSCRIBER_COUNT_MS
      );
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
        channels: z.array(z.enum(['ai', 'startup', 'dealroom', 'research'])).min(1, 'Seleziona almeno un canale'),
      }))
      .mutation(async ({ input }) => {
        const { updateSubscriberChannelsByToken } = await import('./db');
        const result = await updateSubscriberChannelsByToken(input.token, input.channels as any);
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
        channels: z.array(z.enum(['ai', 'startup', 'dealroom', 'research'])).optional(),
      }))
      .mutation(async ({ input }) => {
        const { addSubscriberWithChannels } = await import('./db');
        const result = await addSubscriberWithChannels({
          email: input.email,
          name: input.name,
          source: 'website',
          channels: input.channels as any,
        });

        if ((result as any).success || (result as any).resubscribed) {
          try {
            const baseUrl = 'https://proofpress.ai';
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
              channels: input.channels as any,
            });

            await sendEmail({
              to: input.email,
              subject: 'Benvenuto in Proof Press — Iscrizione confermata ✓',
              html,
            });
          } catch (emailErr) {
            console.error('[Newsletter] Errore invio email benvenuto:', emailErr);
          }
        }

        return result;
      }),
    // Recupera una newsletter per ID (per visualizzazione nel browser)
    getById: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB non disponibile' });
        const { newsletterSends: nlSends } = await import('../drizzle/schema');
        const rows = await db
          .select({
            id: nlSends.id,
            subject: nlSends.subject,
            htmlContent: nlSends.htmlContent,
            sentAt: nlSends.sentAt,
            createdAt: nlSends.createdAt,
            status: nlSends.status,
            section: nlSends.section,
          })
          .from(nlSends)
          .where(eq(nlSends.id, input.id))
          .limit(1);
        if (!rows.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'Newsletter non trovata' });
        return rows[0];
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

    // Nuovi iscritti siteUsers nelle ultime 24 ore
    getNewSiteUsers: adminProcedure.query(async () => {
      const db = await getDbInstance();
      if (!db) return { newUsers: [], newCount: 0, totalCount: 0 };
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newUsers = await db
        .select({
          id: siteUsers.id,
          username: siteUsers.username,
          email: siteUsers.email,
          emailVerified: siteUsers.emailVerified,
          createdAt: siteUsers.createdAt,
        })
        .from(siteUsers)
        .where(gte(siteUsers.createdAt, since))
        .orderBy(desc(siteUsers.createdAt));
      const totalUsers = await db.select({ count: count() }).from(siteUsers);
      return {
        newUsers,
        newCount: newUsers.length,
        totalCount: totalUsers[0]?.count ?? 0,
      };
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

    // Test send to a single email — usa il nuovo template unificato ProofPress
    sendTestEmail: adminProcedure
      .input(z.object({ to: z.string().email() }))
      .mutation(async ({ input }) => {
        // [LEGACY RIMOSSO] Il vecchio template IDEASMART/buildWeeklyNewsletterHtml è stato eliminato.
        // Usa sendUnifiedPreview dalla newsletter unificata ProofPress.
        const { sendUnifiedPreview } = await import("./unifiedNewsletter");
        const result = await sendUnifiedPreview();
        if (!result.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "Errore invio email di test" });
        }
        return {
          success: true,
          to: input.to,
          subject: result.subject ?? "ProofPress Daily — Preview",
          newsCount: 0,
          week: new Date().toLocaleDateString("it-IT"),
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
          editorial: editorial ? { ...editorial, id: editorial.id, section: editorial.section } : null,
          startup: startup ? { ...startup, id: startup.id, section: startup.section } : null,
          news: news.map(n => ({
            id: n.id,
            section: n.section,
            title: n.title,
            summary: n.summary,
            category: n.category,
            sourceName: n.sourceName,
            sourceUrl: n.sourceUrl,
          })),
          reportages: reportages.map(r => ({
            id: r.id,
            section: r.section,
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
            id: a.id,
            section: a.section,
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

        const subject = `[PROVA] AI News — ${dateLabel} | ${news.length} news, ${reportages.length} reportage`;

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






    // ── Refresh TUTTI i canali RSS ────────────────────────────────────────────────────────
    refreshAllRSSChannels: adminProcedure.mutation(async () => {
      const { refreshAllNewsFromRSS } = await import("./rssNewsScheduler");
      // Avvia in background per non bloccare la risposta
      refreshAllNewsFromRSS().catch(err => console.error("[Admin] Errore refreshAllRSS:", err));
      return { success: true, message: "Refresh di tutti i canali avviato in background" };
    }),

    // ── Newsletter Giornaliera per Canale — Preview (07:00 CET) ─────────────────────────
    // [DEPRECATO] Reindirizza alla newsletter unificata
    sendDailyChannelPreview: adminProcedure.mutation(async () => {
      const { sendUnifiedPreview } = await import("./unifiedNewsletter");
      const result = await sendUnifiedPreview();
      return { success: result.success, channel: "unificata", subject: "Proof Press Newsletter Unificata", newsCount: (result.stats?.ai ?? 0) + (result.stats?.startup ?? 0) + (result.stats?.dealroom ?? 0), error: result.error };
    }),

    // ── Newsletter Giornaliera per Canale — Invio Massivo ────────────────────────────────
    sendChannelNewsletter: adminProcedure
      .input(z.object({
        channelKey: z.enum(["ai", "startup", "dealroom"]),
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

    // ── Newsletter Test a Email Specifico ───────────────────────────────────────────
    sendChannelTestToEmail: adminProcedure
      .input(z.object({
        channelKey: z.enum(["ai", "startup", "dealroom"]),
        toEmail: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { sendChannelTestToEmail } = await import("./dailyChannelNewsletter");
        const result = await sendChannelTestToEmail(input.channelKey, input.toEmail);
        return result;
      }),

    // ── Approva e Invia Newsletter del Giorno (invio massivo manuale) ────────────────
    // [DEPRECATO] Reindirizza alla newsletter unificata
    approveAndSendNewsletter: adminProcedure.mutation(async () => {
      const { sendUnifiedNewsletterToAll } = await import("./unifiedNewsletter");
      const result = await sendUnifiedNewsletterToAll();
      return { success: result.success, channel: "unificata", recipientCount: result.recipientCount, newsCount: 0, subject: "Proof Press Newsletter Unificata", error: result.error };
    }),

    // ── Newsletter Unificata — Preview ────────────────────────────────────────────────
    sendUnifiedPreview: adminProcedure.mutation(async () => {
      const { sendUnifiedPreview } = await import("./unifiedNewsletter");
      const result = await sendUnifiedPreview();
      return result;
    }),

    // ── Newsletter Unificata — Test a Email Specifico ────────────────────────────────
    sendUnifiedTestToEmail: adminProcedure
      .input(z.object({ toEmail: z.string().email() }))
      .mutation(async ({ input }) => {
        const { sendUnifiedTestToEmail } = await import("./unifiedNewsletter");
        const result = await sendUnifiedTestToEmail(input.toEmail);
        return result;
      }),

    // ── Newsletter Unificata — Invio Massivo ────────────────────────────────────────
    sendUnifiedNewsletterToAll: adminProcedure.mutation(async () => {
      const { sendUnifiedNewsletterToAll } = await import("./unifiedNewsletter");
      const result = await sendUnifiedNewsletterToAll();
      return result;
    }),

    // ── Amazon Daily Deal — CRUD ─────────────────────────────────────────────────────
    getAmazonDeals: adminProcedure.query(async () => {
      const db = await getDbInstance();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const { amazonDailyDeals } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return db.select().from(amazonDailyDeals).orderBy(desc(amazonDailyDeals.scheduledDate)).limit(30);
    }),

    createAmazonDeal: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        price: z.string().min(1),
        affiliateUrl: z.string().url(),
        imageUrl: z.string().optional(),
        rating: z.string().optional(),
        reviewCount: z.string().optional(),
        category: z.string().optional(),
        scheduledDate: z.string().min(8),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { amazonDailyDeals } = await import("../drizzle/schema");
        const [result] = await db.insert(amazonDailyDeals).values({
          title: input.title,
          description: input.description,
          price: input.price,
          affiliateUrl: input.affiliateUrl,
          imageUrl: input.imageUrl ?? null,
          rating: input.rating ?? null,
          reviewCount: input.reviewCount ?? null,
          category: input.category ?? null,
          scheduledDate: input.scheduledDate,
          active: input.active,
        });
        return { success: true, id: result.insertId };
      }),

    updateAmazonDeal: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        affiliateUrl: z.string().url().optional(),
        imageUrl: z.string().optional(),
        rating: z.string().optional(),
        reviewCount: z.string().optional(),
        category: z.string().optional(),
        scheduledDate: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { amazonDailyDeals } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const { id, ...updates } = input;
        const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
        if (Object.keys(cleanUpdates).length === 0) return { success: true };
        await db.update(amazonDailyDeals).set(cleanUpdates).where(eq(amazonDailyDeals.id, id));
        return { success: true };
      }),

    deleteAmazonDeal: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { amazonDailyDeals } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.delete(amazonDailyDeals).where(eq(amazonDailyDeals.id, input.id));
        return { success: true };
      }),

    // ── Sponsor Newsletter CRUD ────────────────────────────────────────────────────────
    listSponsors: adminProcedure.query(async () => {
      const db = await getDbInstance();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const { newsletterSponsors } = await import("../drizzle/schema");
      const { desc } = await import("drizzle-orm");
      return db.select().from(newsletterSponsors).orderBy(desc(newsletterSponsors.createdAt));
    }),

    createSponsor: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        headline: z.string().min(1),
        description: z.string().min(1),
        url: z.string().url(),
        imageUrl: z.string().optional(),
        features: z.string().optional(), // JSON array string
        ctaText: z.string().default("Scopri di più →"),
        placement: z.enum(["primary", "spotlight"]).default("primary"),
        weight: z.number().int().min(1).default(1),
        active: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { newsletterSponsors } = await import("../drizzle/schema");
        const [result] = await db.insert(newsletterSponsors).values({
          name: input.name,
          headline: input.headline,
          description: input.description,
          url: input.url,
          imageUrl: input.imageUrl ?? null,
          features: input.features ?? null,
          ctaText: input.ctaText,
          placement: input.placement,
          weight: input.weight,
          active: input.active,
        });
        return { success: true, id: result.insertId };
      }),

    updateSponsor: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        headline: z.string().optional(),
        description: z.string().optional(),
        url: z.string().optional(),
        imageUrl: z.string().optional(),
        features: z.string().optional(),
        ctaText: z.string().optional(),
        placement: z.enum(["primary", "spotlight"]).optional(),
        weight: z.number().int().min(1).optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { newsletterSponsors } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const { id, ...updates } = input;
        const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
        if (Object.keys(cleanUpdates).length === 0) return { success: true };
        await db.update(newsletterSponsors).set(cleanUpdates).where(eq(newsletterSponsors.id, id));
        return { success: true };
      }),

    deleteSponsor: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { newsletterSponsors } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.delete(newsletterSponsors).where(eq(newsletterSponsors.id, input.id));
        return { success: true };
      }),

    // ── LinkedIn Autopost manuale ────────────────────────────────────────────────────────
    publishLinkedIn: adminProcedure
      .input(z.object({
        slot: z.enum(["morning", "afternoon", "startup-afternoon", "startup-evening", "research", "research-afternoon", "ai-research-morning", "dealroom", "ai-tool-radar", "en-evening-news", "en-ai-research", "en-research", "en-research-late"]).default("morning"),
        force: z.boolean().default(false),
      }).optional())
      .mutation(async ({ input }) => {
        const slot = input?.slot ?? "morning";
        const force = input?.force ?? false;
        console.log(`[AdminRouter] Avvio pubblicazione manuale LinkedIn \u2014 slot: ${slot}, force: ${force}`);
        const result = await publishLinkedInPost(slot as any, force);
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
          message: `${result.published}/${result.posts.length} post pubblicati su LinkedIn (slot: ${slot})`,
        };
      }),

    // ── Inserimento manuale post LinkedIn nel DB ─────────────────────────────────────
    insertLinkedinPost: adminProcedure
      .input(z.object({
        postText: z.string().min(10),
        title: z.string().min(1),
        linkedinUrl: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
        hashtags: z.string().optional(),
        section: z.enum(["ai", "startup", "finance", "health", "sport", "luxury", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi", "dealroom", "research", "music"]).default("ai"),
        slot: z.enum(["morning", "ai-research-morning", "research", "research-afternoon", "startup-afternoon", "startup-evening", "afternoon", "evening", "dealroom", "ai-tool-radar"]).default("morning"),
        dateLabel: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { linkedinPosts: linkedinPostsTable } = await import('../drizzle/schema');
        const crypto = await import('crypto');
        const postHash = crypto.createHash('sha256').update(input.postText).digest('hex');
        // Usa la data di oggi se non specificata
        const dateLabel = input.dateLabel ?? new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
        await db.insert(linkedinPostsTable)
          .values({
            dateLabel,
            slot: input.slot as any,
            postText: input.postText,
            linkedinUrl: input.linkedinUrl ?? null,
            title: input.title,
            section: input.section as any,
            imageUrl: input.imageUrl ?? null,
            hashtags: input.hashtags ?? null,
            postHash,
          })
          .onDuplicateKeyUpdate({
            set: {
              postText: input.postText,
              linkedinUrl: input.linkedinUrl ?? null,
              title: input.title,
              imageUrl: input.imageUrl ?? null,
              hashtags: input.hashtags ?? null,
              postHash,
            }
          });
        return { success: true, message: `Post "${input.title}" inserito nel DB per il ${dateLabel}` };
      }),
  }),
  // ── Report Ripetitività Editoriali ──────────────────────────────────────────────
  editorialReport: router({
    getRepetitionReport: adminProcedure
      .input(z.object({ days: z.number().min(7).max(90).default(14) }).optional())
      .query(async ({ input }) => {
        const days = input?.days ?? 14;
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });

        const { dailyEditorial: editorialTable, linkedinPosts: liPostsTable } = await import("../drizzle/schema");
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        const sinceLabel = sinceDate.toISOString().slice(0, 10);

        // Recupera editoriali recenti
        const editorials = await db.select({
          id: editorialTable.id,
          title: editorialTable.title,
          dateLabel: editorialTable.dateLabel,
          keyTrend: editorialTable.keyTrend,
        }).from(editorialTable)
          .where(gte(editorialTable.dateLabel, sinceLabel))
          .orderBy(desc(editorialTable.createdAt));

        // Recupera post LinkedIn morning recenti
        const liPosts = await db.select({
          id: liPostsTable.id,
          title: liPostsTable.title,
          dateLabel: liPostsTable.dateLabel,
          slot: liPostsTable.slot,
        }).from(liPostsTable)
          .where(and(
            gte(liPostsTable.dateLabel, sinceLabel),
            eq(liPostsTable.slot, "morning" as any)
          ))
          .orderBy(desc(liPostsTable.createdAt));

        // Analisi similarità titoli (Jaccard semplificato)
        function tokenize(s: string): Set<string> {
          return new Set(s.toLowerCase().replace(/[^a-zà-ü0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2));
        }
        function jaccard(a: Set<string>, b: Set<string>): number {
          const inter = Array.from(a).filter(x => b.has(x));
          const union = new Set(Array.from(a).concat(Array.from(b)));
          return union.size === 0 ? 0 : inter.length / union.size;
        }

        // Trova coppie simili (>0.6 Jaccard)
        const allTitles = editorials.map(e => ({ source: "editorial" as const, ...e }));
        const similarPairs: Array<{ title1: string; date1: string; title2: string; date2: string; similarity: number }> = [];
        for (let i = 0; i < allTitles.length; i++) {
          const tokensI = tokenize(allTitles[i].title);
          for (let j = i + 1; j < allTitles.length; j++) {
            const sim = jaccard(tokensI, tokenize(allTitles[j].title));
            if (sim > 0.6) {
              similarPairs.push({
                title1: allTitles[i].title,
                date1: allTitles[i].dateLabel,
                title2: allTitles[j].title,
                date2: allTitles[j].dateLabel,
                similarity: Math.round(sim * 100),
              });
            }
          }
        }

        // Conta formule abusate
        const BANNED_PHRASES = ["nuova frontiera", "rivoluzione silenziosa", "ridefinisce il business", "ridisegna il lavoro", "game changer"];
        const phraseCount: Record<string, number> = {};
        for (const phrase of BANNED_PHRASES) phraseCount[phrase] = 0;
        for (const e of editorials) {
          const lower = e.title.toLowerCase();
          for (const phrase of BANNED_PHRASES) {
            if (lower.includes(phrase)) phraseCount[phrase]++;
          }
        }

        // Trend/keyTrend più usati
        const trendCount: Record<string, number> = {};
        for (const e of editorials) {
          const trend = (e.keyTrend ?? "sconosciuto").toLowerCase();
          trendCount[trend] = (trendCount[trend] ?? 0) + 1;
        }
        const topTrends = Object.entries(trendCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([trend, count]) => ({ trend, count }));

        // Score di diversità (0-100)
        const uniqueTitles = new Set(editorials.map(e => e.title.toLowerCase())).size;
        const diversityScore = editorials.length > 0
          ? Math.round((uniqueTitles / editorials.length) * 100)
          : 100;

        return {
          period: `${sinceLabel} → oggi`,
          totalEditorials: editorials.length,
          uniqueTitles,
          diversityScore,
          similarPairs: similarPairs.sort((a, b) => b.similarity - a.similarity).slice(0, 20),
          bannedPhrases: Object.entries(phraseCount).filter(([, c]) => c > 0).map(([phrase, count]) => ({ phrase, count })),
          topTrends,
          linkedinMorningPosts: liPosts.length,
          editorials: editorials.map(e => ({ title: e.title, date: e.dateLabel, keyTrend: e.keyTrend })),
        };
      }),
  }),

  // ── System Health & Trigger Manuale Scraping ──────────────────────────────────────────
  health: router({  // Restituisce lo stato di salute di tutte le sezioni: ultima notizia, count oggi, timestamp
    getSystemHealth: adminProcedure.query(async () => {
      const db = await getDbInstance();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const { newsItems } = await import("../drizzle/schema");
      const { eq, desc, sql: sqlExpr, and, gte } = await import("drizzle-orm");

      const SECTIONS = [
        { key: "ai", label: "AI News", icon: "🤖" },
        { key: "startup", label: "Startup News", icon: "🚀" },
        { key: "dealroom", label: "DEALROOM", icon: "💰" },
      ] as const;

      // Inizio giornata odierna (UTC)
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      const sectionStats = await Promise.all(
        SECTIONS.map(async (s) => {
          const [latest] = await db
            .select({ title: newsItems.title, createdAt: newsItems.createdAt, publishedAt: newsItems.publishedAt })
            .from(newsItems)
            .where(eq(newsItems.section, s.key))
            .orderBy(desc(newsItems.createdAt))
            .limit(1);

          const [countRow] = await db
            .select({ count: sqlExpr<number>`count(*)` })
            .from(newsItems)
            .where(and(
              eq(newsItems.section, s.key),
              gte(newsItems.createdAt, todayStart)
            ));

          const [totalRow] = await db
            .select({ count: sqlExpr<number>`count(*)` })
            .from(newsItems)
            .where(eq(newsItems.section, s.key));

          return {
            key: s.key,
            label: s.label,
            icon: s.icon,
            latestTitle: latest?.title ?? null,
            latestCreatedAt: latest?.createdAt ?? null,
            latestPublishedAt: latest?.publishedAt ?? null,
            todayCount: Number(countRow?.count ?? 0),
            totalCount: Number(totalRow?.count ?? 0),
          };
        })
      );

      return {
        sections: sectionStats,
        serverTime: new Date(),
        uptime: process.uptime(),
      };
    }),

    // Trigger manuale scraping per una sezione specifica
    triggerSectionScraping: adminProcedure
      .input(z.object({
        section: z.enum(["ai", "startup", "dealroom", "all"]),
      }))
      .mutation(async ({ input }) => {
        const { section } = input;
        console.log(`[Admin] Trigger manuale scraping sezione: ${section}`);

        const {
          refreshAINewsFromRSS,
          refreshStartupNewsFromRSS,
          refreshDealroomNewsFromRSS,
          refreshAllNewsFromRSS,
        } = await import("./rssNewsScheduler");

        const scraperMap: Record<string, () => Promise<void>> = {
          ai: refreshAINewsFromRSS,
          startup: refreshStartupNewsFromRSS,
          dealroom: refreshDealroomNewsFromRSS,
        };

        if (section === "all") {
          // Avvia tutti in background
          refreshAllNewsFromRSS().catch(err => console.error("[Admin] Errore refreshAll:", err));
          return { success: true, message: "Scraping di tutti i canali avviato in background" };
        }

        const scraper = scraperMap[section];
        if (!scraper) throw new TRPCError({ code: "BAD_REQUEST", message: `Sezione non supportata: ${section}` });

        // Avvia in background per non bloccare la risposta HTTP
        scraper().catch(err => console.error(`[Admin] Errore scraping ${section}:`, err));
        return { success: true, message: `Scraping ${section} avviato in background` };
      }),
  }),

  // ── Comments (public) ──────────────────────────────────────────────────────────────
  comments: router({
    // Aggiungi un commento a un articolo
    add: publicProcedure
      .input(z.object({
        section: z.enum(["ai", "startup"]),
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
        section: z.enum(["ai", "startup"]),
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
        section: z.enum(["ai", "startup"]).optional(),
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
        section: z.enum(["ai", "startup"]).optional(),
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
        section: z.enum(["ai", "startup"]).optional(),
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
              <a href="https://proofpress.ai/advertise" style="display: inline-block; background: #ff5500; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">Esplora i formati →</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">Proof Press · info@proofpress.ai · <a href="https://proofpress.ai" style="color: #00e5c8;">proofpress.ai</a></p>
          </div>
        `;

        await sendEmail({
          to: input.email,
          subject: `Abbiamo ricevuto la tua richiesta — Proof Press`,
          html: confirmHtml,
        });

        return { success: true };
      }),
  }),

  // ── Proof Press Business — Demo Request ────────────────────────────────────
  business: router({
    requestDemo: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome obbligatorio"),
        email: z.string().email("Email non valida"),
        role: z.string().min(1, "Ruolo obbligatorio"),
        sectors: z.array(z.string()).min(1, "Seleziona almeno un settore"),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const sectorsStr = input.sectors.join(", ");
        const subject = `🚀 Nuova richiesta demo Proof Press Business — ${input.name}`;
        const htmlAdmin = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px;">
            <div style="background: #0a0f1e; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="color: #00e5c8; font-size: 22px; margin: 0; font-weight: 900;">IDEA<span style="color: #ffffff;">SMART</span> <span style="color: #ff5500; font-size: 14px; letter-spacing: 2px;">BUSINESS</span></h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0 0; letter-spacing: 2px;">NUOVA RICHIESTA DEMO</p>
            </div>
            <div style="background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #9ca3af; font-size: 13px; width: 140px;">Nome</td><td style="padding: 10px 0; color: #111827; font-size: 15px; font-weight: 600;">${input.name}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Email</td><td style="padding: 10px 0;"><a href="mailto:${input.email}" style="color: #00e5c8; font-size: 15px;">${input.email}</a></td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Ruolo</td><td style="padding: 10px 0; color: #111827; font-size: 15px;">${input.role}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Settori</td><td style="padding: 10px 0; color: #111827; font-size: 15px;">${sectorsStr}</td></tr>
                ${input.message ? `<tr><td style="padding: 10px 0; color: #9ca3af; font-size: 13px; vertical-align: top;">Note</td><td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.6;">${input.message}</td></tr>` : ""}
              </table>
            </div>
            <div style="margin-top: 20px; padding: 16px; background: #fff3ee; border-radius: 8px; border-left: 3px solid #ff5500;">
              <p style="color: #ff5500; font-size: 13px; font-weight: 700; margin: 0 0 4px;">Azione richiesta</p>
              <p style="color: #4b5563; font-size: 13px; margin: 0;">Rispondere entro 24 ore a <strong>${input.email}</strong> per schedulare la demo.</p>
            </div>
          </div>
        `;
        await sendEmail({ to: "ac@acinelli.com", subject, html: htmlAdmin });
        const htmlConfirm = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 32px;">
            <div style="background: #0a0f1e; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
              <h1 style="color: #00e5c8; font-size: 24px; margin: 0; font-weight: 900;">IDEA<span style="color: #ffffff;">SMART</span> <span style="color: #ff5500; font-size: 14px;">BUSINESS</span></h1>
            </div>
            <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
              <h2 style="color: #0a0f1e; font-size: 22px; margin: 0 0 12px; font-weight: 900;">Richiesta ricevuta!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Ciao <strong>${input.name}</strong>, abbiamo ricevuto la tua richiesta di demo per Proof Press Business. Ti contatteremo entro <strong>24 ore</strong> per schedulare una call gratuita di 30 minuti.</p>
              <a href="https://proofpress.ai/business" style="display: inline-block; background: #ff5500; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">Scopri Proof Press Business →</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">Proof Press · info@proofpress.ai · <a href="https://proofpress.ai" style="color: #00e5c8;">proofpress.ai</a></p>
          </div>
        `;
        await sendEmail({ to: input.email, subject: `La tua demo Proof Press Business è confermata — ti ricontatteremo presto`, html: htmlConfirm });
        return { success: true };
      }),
  }),

  // ── Demo Request (Per Giornalisti) ──────────────────────────────────────
  demoRequest: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome obbligatorio"),
        email: z.string().email("Email non valida"),
        profileType: z.enum(["giornalista_freelance", "editore_digitale", "creator_analista", "media_company", "altro"]),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Salva nel DB
        const { demoRequests } = await import("../drizzle/schema");
        const db = await getDbInstance();
        if (!db) throw new Error("Database non disponibile");
        await db.insert(demoRequests).values({
          name: input.name,
          email: input.email,
          profileType: input.profileType,
          message: input.message || null,
          notified: true,
        });

        const profileLabels: Record<string, string> = {
          giornalista_freelance: "Giornalista / Freelance",
          editore_digitale: "Editore digitale",
          creator_analista: "Creator / Analista",
          media_company: "Media company",
          altro: "Altro",
        };
        const profileLabel = profileLabels[input.profileType] || input.profileType;

        // Email notifica admin
        const subject = `\uD83D\uDCF0 Nuova richiesta demo Per Giornalisti — ${input.name}`;
        const htmlAdmin = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 32px;">
            <div style="background: #1a1a1a; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 900; letter-spacing: 2px;">Proof Press</h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0 0; letter-spacing: 2px;">NUOVA RICHIESTA DEMO — PER GIORNALISTI</p>
            </div>
            <div style="background: #ffffff; border-radius: 12px; padding: 28px; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #9ca3af; font-size: 13px; width: 140px;">Nome</td><td style="padding: 10px 0; color: #111827; font-size: 15px; font-weight: 600;">${input.name}</td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Email</td><td style="padding: 10px 0;"><a href="mailto:${input.email}" style="color: #dc2626; font-size: 15px;">${input.email}</a></td></tr>
                <tr style="border-bottom: 1px solid #f3f4f6;"><td style="padding: 10px 0; color: #9ca3af; font-size: 13px;">Profilo</td><td style="padding: 10px 0; color: #111827; font-size: 15px;">${profileLabel}</td></tr>
                ${input.message ? `<tr><td style="padding: 10px 0; color: #9ca3af; font-size: 13px; vertical-align: top;">Messaggio</td><td style="padding: 10px 0; color: #374151; font-size: 14px; line-height: 1.6;">${input.message}</td></tr>` : ""}
              </table>
            </div>
            <div style="margin-top: 20px; padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 3px solid #dc2626;">
              <p style="color: #dc2626; font-size: 13px; font-weight: 700; margin: 0 0 4px;">Azione richiesta</p>
              <p style="color: #4b5563; font-size: 13px; margin: 0;">Rispondere entro 24 ore a <strong>${input.email}</strong> per schedulare la demo.</p>
            </div>
          </div>
        `;
        await sendEmail({ to: "info@proofpress.ai", subject, html: htmlAdmin });

        // Email conferma al richiedente
        const htmlConfirm = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 32px;">
            <div style="background: #1a1a1a; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 900; letter-spacing: 2px;">Proof Press</h1>
            </div>
            <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">\u2713</div>
              <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 12px; font-weight: 900;">Richiesta ricevuta!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Ciao <strong>${input.name}</strong>, abbiamo ricevuto la tua richiesta di demo. Ti contatteremo entro <strong>24 ore</strong> per mostrarti come lanciare il tuo giornale con Proof Press.</p>
              <a href="https://proofpress.ai/offertacommerciale" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">Scopri di pi\u00f9 \u2192</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">Proof Press \u00B7 info@proofpress.ai \u00B7 <a href=\"https://proofpress.ai\" style=\"color: #dc2626;\">ideasmart.biz</a></p>
          </div>
        `;
        await sendEmail({ to: input.email, subject: `La tua demo Proof Press \u00E8 confermata \u2014 ti ricontatteremo presto`, html: htmlConfirm });

        return { success: true };
      }),
  }),

  // ── Events ────────────────────────────────────────────────────────────────
  events: router({
    // Recupera i prossimi N eventi tech/AI/startup (default 6, max 20)
    getUpcoming: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(20).default(6),
        category: z.enum(["ai", "startup", "vc", "tech", "innovation", "other", "all"]).default("all"),
      }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return [];
        const now = new Date();
        const { gte: gteOp, asc } = await import("drizzle-orm");
        const conditions = [gteOp(techEvents.startAt, now)];
        if (input.category !== "all") {
          const { eq: eqOp } = await import("drizzle-orm");
          conditions.push(eqOp(techEvents.category, input.category));
        }
        const { and: andOp } = await import("drizzle-orm");
        const rows = await db
          .select()
          .from(techEvents)
          .where(andOp(...conditions))
          .orderBy(asc(techEvents.startAt))
          .limit(input.limit);
        return rows;
      }),

    // Trigger manuale aggregazione (solo admin)
    triggerAggregation: adminProcedure
      .mutation(async () => {
        const result = await aggregateEvents();
        return result;
      }),
  }),

  // ── AI Dealflow ──────────────────────────────────────────────────────────
  dealflow: router({
    // Lista date disponibili
    dates: publicProcedure.query(async () => {
      const db = await getDbInstance();
      if (!db) return [];
      const rows = await db
        .selectDistinct({ publishDate: dealflowPicks.publishDate })
        .from(dealflowPicks)
        .orderBy(desc(dealflowPicks.publishDate))
        .limit(30);
      return rows.map((r: { publishDate: string }) => r.publishDate);
    }),

    // Pick per data
    byDate: publicProcedure
      .input(z.object({ date: z.string().optional() }))
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return [];
        const targetDate = input.date || new Date().toISOString().slice(0, 10);
        const rows = await db
          .select()
          .from(dealflowPicks)
          .where(eq(dealflowPicks.publishDate, targetDate))
          .orderBy(dealflowPicks.rank);
        return rows;
      }),
  }),

  // ── Tool Submissions (public) ──────────────────────────────────────────────
  toolSubmissions: router({
    submit: publicProcedure
      .input(z.object({
        toolName: z.string().min(1).max(255),
        toolUrl: z.string().url(),
        description: z.string().max(1000).optional(),
        submitterEmail: z.string().email().optional(),
        submitterName: z.string().max(255).optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await saveToolSubmission(input);
        return { success: true, id };
      }),

    // Admin: lista tutte le submissions
    list: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getToolSubmissions(input?.status);
      }),

    // Admin: approva/rifiuta/feature un tool
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "featured"]),
        featuredDate: z.string().optional(),
        emoji: z.string().optional(),
        shortDescription: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateToolSubmissionStatus(input.id, input.status, input.featuredDate, input.emoji, input.shortDescription);
        return { success: true };
      }),

    // Public: tools featured per oggi (per la newsletter)
    getFeatured: publicProcedure
      .input(z.object({ date: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const date = input?.date || new Date().toISOString().slice(0, 10);
        return getApprovedToolsForDate(date);
      }),
  }),

  // ── Newsletter Feedback (public) ──────────────────────────────────────────
  newsletterFeedback: router({
    submit: publicProcedure
      .input(z.object({
        rating: z.enum(["great", "good", "meh", "bad"]),
        comment: z.string().max(2000).optional(),
        email: z.string().email().optional(),
        newsletterDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await saveNewsletterFeedback(input);
        return { success: true, id };
      }),

    // Admin: lista tutti i feedback
    list: adminProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getNewsletterFeedbacks(input?.limit ?? 50);
      }),
  }),

  // ── Open Source AI Tools (admin managed) ──────────────────────────────────
  openSourceTools: router({
    getActive: publicProcedure
      .input(z.object({ date: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getActiveOpenSourceTools(input?.date);
      }),

    // Admin: aggiungi un tool open source
    add: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        repoUrl: z.string().url(),
        stars: z.number().optional(),
        category: z.string().optional(),
        emoji: z.string().optional(),
        featuredDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await saveOpenSourceTool(input);
        return { success: true, id };
      }),
  }),
  // ── Chi Siamo — Modulo Contattaci ─────────────────────────────────────────────
  contactUs: router({
    send: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome obbligatorio (min 2 caratteri)"),
        email: z.string().email("Email non valida"),
        subject: z.string().min(3, "Oggetto obbligatorio"),
        message: z.string().min(10, "Messaggio troppo breve (min 10 caratteri)"),
      }))
      .mutation(async ({ input }) => {
        const { sendEmail } = await import("./email");
      const adminHtml = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f3ef;padding:32px;">
          <div style="background:#1a1a1a;padding:20px 24px;border-radius:8px;margin-bottom:24px;">
            <p style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-0.02em;">Proof Press</p>
            <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:4px 0 0;letter-spacing:0.12em;text-transform:uppercase;">Nuovo messaggio da Chi Siamo</p>
          </div>
          <div style="background:#fff;border-radius:8px;padding:28px;border:1px solid rgba(26,26,26,0.1);">
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #f0ece4;">
                <td style="padding:10px 0;color:#888;font-size:13px;width:120px;">Nome</td>
                <td style="padding:10px 0;color:#1a1a1a;font-size:15px;font-weight:600;">${input.name}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0ece4;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Email</td>
                <td style="padding:10px 0;"><a href="mailto:${input.email}" style="color:#d94f3d;font-size:15px;">${input.email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #f0ece4;">
                <td style="padding:10px 0;color:#888;font-size:13px;">Oggetto</td>
                <td style="padding:10px 0;color:#1a1a1a;font-size:15px;">${input.subject}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#888;font-size:13px;vertical-align:top;">Messaggio</td>
                <td style="padding:10px 0;color:#374151;font-size:14px;line-height:1.7;">${input.message.replace(/\n/g, '<br>')}</td>
              </tr>
            </table>
          </div>
          <p style="color:#aaa;font-size:12px;text-align:center;margin-top:20px;">Proof Press &middot; info@proofpress.ai</p>
        </div>
      `;

      await sendEmail({
        to: "info@proofpress.ai",
        subject: `📬 Contatto da Chi Siamo: ${input.subject} — ${input.name}`,
        html: adminHtml,
      });

      // Conferma all'utente
      const confirmHtml = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f3ef;padding:32px;">
          <div style="background:#1a1a1a;padding:20px 24px;border-radius:8px;margin-bottom:24px;text-align:center;">
            <p style="color:#fff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.02em;">ProofPress</p>
            <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:4px 0 0;letter-spacing:0.12em;text-transform:uppercase;">Per chi vuole capire l'innovazione prima degli altri</p>
          </div>
          <div style="background:#fff;border-radius:8px;padding:32px;border:1px solid rgba(26,26,26,0.1);text-align:center;">
            <div style="font-size:40px;margin-bottom:16px;">✓</div>
            <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 12px;font-weight:900;">Messaggio ricevuto!</h2>
            <p style="color:#555;font-size:16px;line-height:1.7;margin:0 0 24px;">Ciao <strong>${input.name}</strong>, abbiamo ricevuto il tuo messaggio. Ti risponderemo entro <strong>24 ore</strong> all'indirizzo <strong>${input.email}</strong>.</p>
            <a href="https://proofpress.ai" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:4px;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:0.05em;">Torna a Proof Press →</a>
          </div>
          <p style="color:#aaa;font-size:12px;text-align:center;margin-top:20px;">Proof Press &middot; <a href="https://proofpress.ai" style="color:#d94f3d;">proofpress.ai</a></p>
        </div>
      `;

      await sendEmail({
        to: input.email,
        subject: `Abbiamo ricevuto il tuo messaggio — Proof Press`,
        html: confirmHtml,
      });

      return { success: true };
    }),
  }),

  offerta: router({
    submitLead: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome obbligatorio"),
        email: z.string().email("Email non valida"),
        role: z.string().min(2, "Ruolo obbligatorio"),
        org: z.string().optional(),
        message: z.string().optional(),
        source: z.enum(["creator", "editori", "aziende"]),
      }))
      .mutation(async ({ input }) => {
        // Salva il lead nel DB
        try {
          const db = await getDbInstance();
          if (db) {
            const { offertaLeads: offertaLeadsTable } = await import('../drizzle/schema');
            await db.insert(offertaLeadsTable).values({
              source: input.source,
              name: input.name,
              email: input.email,
              role: input.role,
              org: input.org ?? null,
              message: input.message ?? null,
              status: 'new',
            });
          }
        } catch (dbErr) {
          console.error('[offerta.submitLead] Errore salvataggio DB:', dbErr);
          // Non blocca l'invio email
        }
        const sourceLabel = { creator: "Creator & Giornalisti", editori: "Testate & Editori", aziende: "Aziende & Corporate" }[input.source];
        const adminHtml = `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f3ef;padding:32px;">
            <div style="background:#1a1a1a;padding:20px 24px;border-radius:8px;margin-bottom:24px;">
              <p style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-0.02em;">ProofPress</p>
              <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:4px 0 0;letter-spacing:0.12em;text-transform:uppercase;">Nuova richiesta offerta \u2014 ${sourceLabel}</p>
            </div>
            <div style="background:#fff;border-radius:8px;padding:28px;border:1px solid rgba(26,26,26,0.1);">
              <table style="width:100%;border-collapse:collapse;">
                <tr style="border-bottom:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;font-size:13px;width:120px;">Nome</td><td style="padding:10px 0;color:#1a1a1a;font-size:15px;font-weight:600;">${input.name}</td></tr>
                <tr style="border-bottom:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;font-size:13px;">Email</td><td style="padding:10px 0;"><a href="mailto:${input.email}" style="color:#d94f3d;font-size:15px;">${input.email}</a></td></tr>
                <tr style="border-bottom:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;font-size:13px;">Ruolo</td><td style="padding:10px 0;color:#1a1a1a;font-size:15px;">${input.role}</td></tr>
                <tr style="border-bottom:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;font-size:13px;">Sezione</td><td style="padding:10px 0;color:#ff5500;font-size:15px;font-weight:700;">${sourceLabel}</td></tr>
                ${input.org ? `<tr style="border-bottom:1px solid #f0ece4;"><td style="padding:10px 0;color:#888;font-size:13px;">Azienda/Testata</td><td style="padding:10px 0;color:#1a1a1a;font-size:15px;font-weight:600;">${input.org}</td></tr>` : ''}
                ${input.message ? `<tr><td style="padding:10px 0;color:#888;font-size:13px;vertical-align:top;">Messaggio</td><td style="padding:10px 0;color:#374151;font-size:14px;line-height:1.7;">${input.message.replace(/\n/g, '<br>')}</td></tr>` : ''}
              </table>
            </div>
            <p style="color:#aaa;font-size:12px;text-align:center;margin-top:20px;">ProofPress \u00b7 info@proofpress.ai</p>
          </div>
        `;
        await sendEmail({
          to: "info@proofpress.ai",
          subject: `\ud83c\udfaf Nuova richiesta [${sourceLabel}]: ${input.name} \u2014 ${input.email}`,
          html: adminHtml,
        });
        const confirmHtml = `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f3ef;padding:32px;">
            <div style="background:#1a1a1a;padding:20px 24px;border-radius:8px;margin-bottom:24px;text-align:center;">
              <p style="color:#fff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.02em;">ProofPress</p>
              <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:4px 0 0;letter-spacing:0.12em;text-transform:uppercase;">Per chi vuole capire l'innovazione prima degli altri</p>
            </div>
            <div style="background:#fff;border-radius:8px;padding:32px;border:1px solid rgba(26,26,26,0.1);text-align:center;">
              <div style="font-size:40px;margin-bottom:16px;">\u2713</div>
              <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 12px;font-weight:900;">Richiesta ricevuta!</h2>
              <p style="color:#555;font-size:16px;line-height:1.7;margin:0 0 24px;">Ciao <strong>${input.name}</strong>, abbiamo ricevuto la tua richiesta per <strong>${sourceLabel}</strong>. Ti contatteremo entro <strong>24 ore</strong> all'indirizzo <strong>${input.email}</strong>.</p>
              <a href="https://proofpress.ai" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:4px;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:0.05em;">Torna a ProofPress \u2192</a>
            </div>
            <p style="color:#aaa;font-size:12px;text-align:center;margin-top:20px;">ProofPress \u00b7 <a href="https://proofpress.ai" style="color:#d94f3d;">proofpress.ai</a></p>
          </div>
        `;
        await sendEmail({
          to: input.email,
          subject: `Abbiamo ricevuto la tua richiesta \u2014 ProofPress`,
          html: confirmHtml,
        });
        return { success: true };
      }),

    // Recupera tutti i lead (admin only)
    getLeads: adminProcedure
      .input(z.object({
        source: z.enum(["creator", "editori", "aziende"]).optional(),
        status: z.enum(["new", "contacted", "closed"]).optional(),
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) return { leads: [], total: 0 };
        const { offertaLeads: offertaLeadsTable } = await import('../drizzle/schema');
        const { desc: descOp, eq: eqOp, and: andOp, count: countOp } = await import('drizzle-orm');
        
        const conditions = [];
        if (input?.source) conditions.push(eqOp(offertaLeadsTable.source, input.source));
        if (input?.status) conditions.push(eqOp(offertaLeadsTable.status, input.status));
        
        const whereClause = conditions.length > 0 ? andOp(...conditions as [any, ...any[]]) : undefined;
        
        const [countResult] = await db
          .select({ cnt: countOp() })
          .from(offertaLeadsTable)
          .where(whereClause);
        
        const leads = await db
          .select()
          .from(offertaLeadsTable)
          .where(whereClause)
          .orderBy(descOp(offertaLeadsTable.createdAt))
          .limit(input?.limit ?? 100)
          .offset(input?.offset ?? 0);
        
        return { leads, total: countResult?.cnt ?? 0 };
      }),

    // Aggiorna lo stato di un lead (admin only)
    updateLeadStatus: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(["new", "contacted", "closed"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDbInstance();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
        const { offertaLeads: offertaLeadsTable } = await import('../drizzle/schema');
        const { eq: eqOp } = await import('drizzle-orm');
        await db.update(offertaLeadsTable)
          .set({ status: input.status })
          .where(eqOp(offertaLeadsTable.id, input.id));
        return { success: true };
      }),
  }),

  // ── Investor interest form ─────────────────────────────────────────────────
  investor: router({
    submitInterest: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const html = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;padding:32px;border-radius:12px;">
            <div style="border-bottom:1px solid rgba(232,201,122,0.2);padding-bottom:20px;margin-bottom:24px;">
              <p style="color:#e8c97a;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 4px;">ProofPress · Investor Relations</p>
              <p style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">Nuovo interesse investitore</p>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;width:100px;">Nome</td><td style="padding:10px 0;color:#ffffff;font-size:15px;font-weight:600;">${input.name}</td></tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;">Email</td><td style="padding:10px 0;"><a href="mailto:${input.email}" style="color:#e8c97a;font-size:15px;text-decoration:none;">${input.email}</a></td></tr>
              ${input.message ? `<tr><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;vertical-align:top;">Messaggio</td><td style="padding:10px 0;color:rgba(255,255,255,0.8);font-size:14px;line-height:1.7;">${input.message.replace(/\n/g, '<br>')}</td></tr>` : ''}
            </table>
            <div style="margin-top:24px;padding:16px;background:rgba(232,201,122,0.08);border:1px solid rgba(232,201,122,0.2);border-radius:8px;">
              <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0;">Ricevuto il ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} · proofpress.ai/investor</p>
            </div>
          </div>`;
        try {
          await sendEmail({
            to: 'ac@acinelli.com',
            subject: `🔒 Investor Interest: ${input.name} (${input.email})`,
            html,
          });
        } catch (err) {
          console.error('[investor.submitInterest] Errore invio email:', err);
        }
        return { success: true };
      }),
  }),

  // ─── PUBBLICITA ──────────────────────────────────────────────────────────────
  pubblicita: router({
    sendContact: publicProcedure
      .input(z.object({
        nome:      z.string().min(2).max(100),
        email:     z.string().email(),
        azienda:   z.string().max(200).optional(),
        budget:    z.string().max(100).optional(),
        brief:     z.string().max(2000).optional(),
        pacchetto: z.string().max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        const now = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

        const htmlAdmin = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f7;padding:32px;border-radius:12px;">
            <div style="background:#1d1d1f;padding:24px 28px;border-radius:10px;margin-bottom:24px;">
              <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">ProofPress &middot; Richiesta Pubblicitaria</p>
              <p style="color:#ffffff;font-size:20px;font-weight:700;margin:0;">Nuovo contatto inserzionista</p>
            </div>
            <table style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e8e8ed;">
              <tr style="border-bottom:1px solid #e8e8ed;"><td style="padding:14px 20px;color:#6e6e73;font-size:13px;width:110px;">Nome</td><td style="padding:14px 20px;color:#1d1d1f;font-size:15px;font-weight:600;">${input.nome}</td></tr>
              <tr style="border-bottom:1px solid #e8e8ed;"><td style="padding:14px 20px;color:#6e6e73;font-size:13px;">Email</td><td style="padding:14px 20px;"><a href="mailto:${input.email}" style="color:#1d1d1f;">${input.email}</a></td></tr>
              ${input.azienda ? `<tr style="border-bottom:1px solid #e8e8ed;"><td style="padding:14px 20px;color:#6e6e73;font-size:13px;">Azienda</td><td style="padding:14px 20px;color:#1d1d1f;font-size:15px;">${input.azienda}</td></tr>` : ''}
              ${input.pacchetto ? `<tr style="border-bottom:1px solid #e8e8ed;"><td style="padding:14px 20px;color:#6e6e73;font-size:13px;">Pacchetto</td><td style="padding:14px 20px;color:#1d1d1f;font-size:15px;font-weight:600;">${input.pacchetto}</td></tr>` : ''}
              ${input.budget ? `<tr style="border-bottom:1px solid #e8e8ed;"><td style="padding:14px 20px;color:#6e6e73;font-size:13px;">Budget</td><td style="padding:14px 20px;color:#1d1d1f;font-size:15px;">${input.budget}</td></tr>` : ''}
              ${input.brief ? `<tr><td style="padding:14px 20px;color:#6e6e73;font-size:13px;vertical-align:top;">Brief</td><td style="padding:14px 20px;color:#1d1d1f;font-size:14px;line-height:1.7;">${input.brief.replace(/\n/g, '<br>')}</td></tr>` : ''}
            </table>
            <p style="color:#aeaeb2;font-size:12px;margin-top:20px;text-align:center;">Ricevuto il ${now} &middot; proofpress.ai/pubblicita</p>
          </div>`;

        const htmlConfirm = `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f7;padding:32px;border-radius:12px;">
            <div style="background:#1d1d1f;padding:24px 28px;border-radius:10px;margin-bottom:24px;">
              <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">ProofPress Magazine</p>
              <p style="color:#ffffff;font-size:20px;font-weight:700;margin:0;">Abbiamo ricevuto la tua richiesta</p>
            </div>
            <p style="color:#1d1d1f;font-size:16px;line-height:1.6;">Ciao ${input.nome},</p>
            <p style="color:#1d1d1f;font-size:15px;line-height:1.7;">Grazie per averci contattato. Il team ProofPress ha ricevuto la tua richiesta pubblicitaria e ti risponder&agrave; entro <strong>24 ore lavorative</strong>.</p>
            <p style="color:#6e6e73;font-size:14px;line-height:1.7;">Nel frattempo puoi consultare il listino completo su <a href="https://proofpress.ai/pubblicita" style="color:#1d1d1f;">proofpress.ai/pubblicita</a>.</p>
            <p style="color:#aeaeb2;font-size:12px;margin-top:32px;">ProofPress Magazine &middot; pubblicita@proofpress.ai</p>
          </div>`;

        try {
          await sendEmail({
            to: 'ac@acinelli.com',
            subject: `Nuovo inserzionista: ${input.nome} (${input.email})`,
            html: htmlAdmin,
          });
          await sendEmail({
            to: input.email,
            subject: 'Abbiamo ricevuto la tua richiesta \u2014 ProofPress Magazine',
            html: htmlConfirm,
          });
        } catch (err) {
          console.error('[pubblicita.sendContact] Errore invio email:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Errore invio. Riprova o scrivi a pubblicita@proofpress.ai' });
        }
        return { success: true };
      }),
  }),

  // ── Contact form generico (chi-siamo, proofpress-verify, ecc.) ────────────
  contact: router({
    send: publicProcedure
      .input(z.object({
        nome: z.string().min(2, 'Nome obbligatorio'),
        email: z.string().email('Email non valida'),
        azienda: z.string().optional(),
        ruolo: z.string().optional(),
        messaggio: z.string().min(10, 'Messaggio troppo breve'),
        origine: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const htmlAdmin = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#0a0a0a;border-bottom:2px solid #0a0a0a;padding-bottom:12px">Nuova richiesta di contatto — ${input.origine ?? 'ProofPress'}</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;width:140px">Nome</td><td style="padding:8px">${input.nome}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${input.email}">${input.email}</a></td></tr>
              ${input.azienda ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Azienda</td><td style="padding:8px">${input.azienda}</td></tr>` : ''}
              ${input.ruolo ? `<tr><td style="padding:8px;font-weight:bold">Ruolo</td><td style="padding:8px">${input.ruolo}</td></tr>` : ''}
              ${input.origine ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Pagina</td><td style="padding:8px">${input.origine}</td></tr>` : ''}
            </table>
            <h3 style="margin-top:20px;color:#0a0a0a">Messaggio</h3>
            <div style="background:#f9f9f9;border-left:4px solid #0a0a0a;padding:16px;border-radius:4px">${input.messaggio.replace(/\n/g, '<br>')}</div>
          </div>`;
        const htmlConfirm = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#0a0a0a">Grazie per averci scritto, ${input.nome}.</h2>
            <p style="color:#444">Abbiamo ricevuto la tua richiesta e ti risponderemo entro 24 ore lavorative.</p>
            <p style="color:#888;font-size:13px">Il team ProofPress</p>
          </div>`;
        try {
          await sendEmail({ to: 'info@proofpress.ai', subject: `Nuova richiesta: ${input.nome} — ${input.origine ?? 'ProofPress'}`, html: htmlAdmin });
          await sendEmail({ to: input.email, subject: 'Abbiamo ricevuto la tua richiesta — ProofPress', html: htmlConfirm });
        } catch (err) {
          console.error('[contact.send] Errore invio email:', err);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Errore invio. Riprova o scrivi a info@proofpress.ai' });
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
