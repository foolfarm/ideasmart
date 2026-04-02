import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminRouter as adminToolsRouter } from "./routers/adminRouter";
import { siteAuthRouter } from "./routers/siteAuth";
import { accountRouter } from "./routers/account";
import { cached, invalidateAll, getCacheStats, CACHE_KEYS, DEFAULT_TTL_MS, EDITORIAL_TTL_MS, TTL_SECTION_COUNT_MS, TTL_SUBSCRIBER_COUNT_MS, TTL_PUNTO_DEL_GIORNO_MS, TTL_LLM_WIDGET_MS, TTL_EDITORIAL_MS, invalidateSection } from "./cache";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sendEmail, buildWeeklyNewsletterHtml, buildWelcomeEmailHtml, buildFullNewsletterHtml } from "./email";
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
import { getLatestWeeklyReportage, getLatestMarketAnalysis } from "./db";
import { generateImage } from "./_core/imageGeneration";
import { getDb as getDbInstance } from "./db";
import { newsItems as newsItemsTable, weeklyReportage as weeklyReportageTable, marketAnalysis as marketAnalysisTable, dailyEditorial as dailyEditorialTable, startupOfDay as startupOfDayTable, articleComments as articleCommentsTable, contentAudit as contentAuditTable } from "../drizzle/schema";
import { eq, isNull, and, desc, count, gte, sql } from "drizzle-orm";
import { runBatchAudit, auditNewsItem, auditMarketAnalysis, getAuditResults, runFullAudit, auditReportage } from "./auditContent";
import { getSchedulerStatus, runScheduledAudit } from "./auditScheduler";
import { getActiveBreakingNews, generateBreakingNews } from "./breakingNewsGenerator";
import { generateDailyResearch, getTodayResearch, getResearchOfDay } from "./researchGenerator";
import { researchReports, techEvents, siteUsers, dealflowPicks, toolSubmissions as toolSubmissionsTable, newsletterFeedback as newsletterFeedbackTable, openSourceTools as openSourceToolsTable } from "../drizzle/schema";
import { aggregateEvents } from "./eventsAggregator";

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
  siteAuth: siteAuthRouter,
  account: accountRouter,

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
            const { eq: eqOp } = await import('drizzle-orm');
            // Prendi i post di oggi (tutti e 3 gli slot: morning, afternoon, evening)
            // Se oggi non ci sono post, prendi quelli di ieri
            const todayLabel = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayLabel = yesterdayDate.toISOString().split('T')[0];

            let posts = await db.select().from(linkedinPostsTable)
              .where(eqOp(linkedinPostsTable.dateLabel, todayLabel))
              .orderBy(linkedinPostsTable.slot)
              .limit(3);

            // Fallback a ieri se oggi non ci sono ancora post
            if (posts.length === 0) {
              posts = await db.select().from(linkedinPostsTable)
                .where(eqOp(linkedinPostsTable.dateLabel, yesterdayLabel))
                .orderBy(linkedinPostsTable.slot)
                .limit(3);
            }

            // Deduplicazione per slot: tieni solo un post per slot (il più recente)
            const slotMap = new Map<string, typeof posts[0]>();
            for (const post of posts) {
              const slot = (post as any).slot ?? 'morning';
              if (!slotMap.has(slot)) slotMap.set(slot, post);
            }
            const dedupedPosts = Array.from(slotMap.values());

            return dedupedPosts.map(post => ({
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

    // Archivio editoriali dell'autore (per pagina /andrea-cinelli)
    getAuthorPosts: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(30) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 30;
        const db = await getDbInstance();
        if (!db) return [];
        const { linkedinPosts: linkedinPostsTable } = await import('../drizzle/schema');
        const { desc: descOp, eq: eqOp } = await import('drizzle-orm');
        const posts = await db.select().from(linkedinPostsTable)
          .where(eqOp(linkedinPostsTable.slot, 'morning'))
          .orderBy(descOp(linkedinPostsTable.createdAt))
          .limit(limit);
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

    // ── IDEASMART Research ──────────────────────────────────────────────────
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
        return cached(
          'research:ofDay',
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
              category: report.category,
              region: report.region,
              dateLabel: report.dateLabel,
              viewCount: report.viewCount,
              createdAt: report.createdAt,
            };
          },
          1000 * 60 * 30
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
              channels: input.channels as any,
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
      return { success: result.success, channel: "unificata", subject: "IDEASMART Newsletter Unificata", newsCount: (result.stats?.ai ?? 0) + (result.stats?.startup ?? 0) + (result.stats?.dealroom ?? 0), error: result.error };
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
      return { success: result.success, channel: "unificata", recipientCount: result.recipientCount, newsCount: 0, subject: "IDEASMART Newsletter Unificata", error: result.error };
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
        slot: z.enum(["morning", "afternoon", "startup-afternoon", "research", "dealroom", "ai-tool-radar"]).default("morning"),
        force: z.boolean().default(true),
      }).optional())
      .mutation(async ({ input }) => {
        const slot = input?.slot ?? "morning";
        const force = input?.force ?? true;
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
  }),

  // ── System Health & Trigger Manuale Scraping ──────────────────────────────────────
  health: router({
    // Restituisce lo stato di salute di tutte le sezioni: ultima notizia, count oggi, timestamp
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

  // ── IdeaSmart Business — Demo Request ────────────────────────────────────
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
        const subject = `🚀 Nuova richiesta demo IdeaSmart Business — ${input.name}`;
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
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Ciao <strong>${input.name}</strong>, abbiamo ricevuto la tua richiesta di demo per IdeaSmart Business. Ti contatteremo entro <strong>24 ore</strong> per schedulare una call gratuita di 30 minuti.</p>
              <a href="https://ideasmart.ai/business" style="display: inline-block; background: #ff5500; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">Scopri IdeaSmart Business →</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">IDEASMART · info@ideasmart.ai · <a href="https://ideasmart.ai" style="color: #00e5c8;">ideasmart.ai</a></p>
          </div>
        `;
        await sendEmail({ to: input.email, subject: `La tua demo IdeaSmart Business è confermata — ti ricontatteremo presto`, html: htmlConfirm });
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
              <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 900; letter-spacing: 2px;">IDEASMART</h1>
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
        await sendEmail({ to: "info@ideasmart.ai", subject, html: htmlAdmin });

        // Email conferma al richiedente
        const htmlConfirm = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f0e8; padding: 32px;">
            <div style="background: #1a1a1a; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 900; letter-spacing: 2px;">IDEASMART</h1>
            </div>
            <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">\u2713</div>
              <h2 style="color: #1a1a1a; font-size: 22px; margin: 0 0 12px; font-weight: 900;">Richiesta ricevuta!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px;">Ciao <strong>${input.name}</strong>, abbiamo ricevuto la tua richiesta di demo. Ti contatteremo entro <strong>24 ore</strong> per mostrarti come lanciare il tuo giornale con IdeaSmart.</p>
              <a href="https://ideasmart.ai/offertacommerciale" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 15px;">Scopri di pi\u00f9 \u2192</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">IDEASMART \u00B7 info@ideasmart.ai \u00B7 <a href=\"https://ideasmart.ai\" style=\"color: #dc2626;\">ideasmart.ai</a></p>
          </div>
        `;
        await sendEmail({ to: input.email, subject: `La tua demo IdeaSmart \u00E8 confermata \u2014 ti ricontatteremo presto`, html: htmlConfirm });

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
});

export type AppRouter = typeof appRouter;

