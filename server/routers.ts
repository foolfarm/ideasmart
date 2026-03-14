import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sendEmail, buildWeeklyNewsletterHtml, buildWelcomeEmailHtml, buildFullNewsletterHtml } from "./email";
import { sendWeeklyNewsletter } from "./newsletterScheduler";
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
import { generateDailyEditorial, generateStartupOfDay } from "./dailyContentScheduler";
import { generateWeeklyReportage } from "./weeklyReportageScheduler";
import { generateMarketAnalysis } from "./marketAnalysisScheduler";
import { getLatestWeeklyReportage, getLatestMarketAnalysis } from "./db";
import { generateImage } from "./_core/imageGeneration";
import { getDb as getDbInstance } from "./db";
import { newsItems as newsItemsTable, weeklyReportage as weeklyReportageTable, marketAnalysis as marketAnalysisTable, dailyEditorial as dailyEditorialTable, startupOfDay as startupOfDayTable, articleComments as articleCommentsTable } from "../drizzle/schema";
import { eq, isNull, and, desc } from "drizzle-orm";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

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
      .input(z.object({ section: z.enum(['ai', 'music']).default('ai') }))
      .query(async ({ input }) => {
        return getLatestMarketAnalysis(input.section);
      }),
  }),

  // ── Weekly Reportage (public) ─────────────────────────────────────────────────────────────────────────────────────────────
  reportage: router({
    getLatestWeek: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'music']).default('ai') }))
      .query(async ({ input }) => {
        return getLatestWeeklyReportage(input.section);
      }),
  }),

  // ── Editorial (public) ──────────────────────────────────────────────────────────────────────────────────
  editorial: router({
    getLatest: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'music']).default('ai') }))
      .query(async ({ input }) => {
        return getLatestEditorial(input.section);
      }),
  }),

  // ── Startup of the Day (public) ─────────────────────────────────────────────────────────────────────────────
  startupOfDay: router({
    getLatest: publicProcedure
      .input(z.object({ section: z.enum(['ai', 'music']).default('ai') }))
      .query(async ({ input }) => {
        return getLatestStartupOfDay(input.section);
      }),
  }),

  // ── News (public) ──────────────────────────────────────────────────────────────────────────────────
  news: router({
    getLatest: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20), section: z.enum(['ai', 'music']).default('ai') }))
      .query(async ({ input }) => {
        const items = await getLatestNews(input.limit, input.section);
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

            const html = buildWelcomeEmailHtml({
              name: input.name,
              unsubscribeUrl: unsubUrl,
            });

            await sendEmail({
              to: input.email,
              subject: "Benvenuto in AI4Business News — Iscrizione confermata ✓",
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

    // Trigger invio automatico immediato (usa il template dark ufficiale)
    triggerWeeklyNewsletter: adminProcedure.mutation(async () => {
      const result = await sendWeeklyNewsletter();
      if (!result.success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "Errore invio newsletter" });
      }
      return result;
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

    sendWeeklyNewsletter: adminProcedure.mutation(async () => {
      const activeSubscribers = await getActiveSubscribers();
      if (activeSubscribers.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nessun iscritto attivo trovato" });
      }

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const dateRange = `${weekAgo.toLocaleDateString("it-IT")} - ${today.toLocaleDateString("it-IT")}`;

      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Sei il redattore di IDEASMART, una startup italiana di tecnologia e innovazione che analizza le migliori realtà AI per il business. Scrivi in italiano con tono editoriale autorevole. Rispondi SOLO con JSON valido.`,
          },
          {
            role: "user",
            content: `Genera le 20 notizie più importanti della settimana (${dateRange}) nel mondo dell'AI e delle startup tecnologiche italiane e internazionali. Per ogni notizia includi: titolo, categoria, breve descrizione (2-3 frasi), e impatto per il business italiano.

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
      if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Errore generazione notizie" });

      const newsData = JSON.parse(content) as {
        week: string;
        news: Array<{ id: number; category: string; title: string; description: string; impact: string }>;
      };

      const htmlContent = buildWeeklyNewsletterHtml(newsData);
      const subject = `IDEASMART Weekly — Top 20 AI News | ${newsData.week}`;

      // Send to all active subscribers
      const emails = activeSubscribers.map((s) => s.email);
      const result = await sendEmail({ to: emails, subject, html: htmlContent });

      if (!result.success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "Errore invio email" });
      }

      await createNewsletterSend({
        subject,
        htmlContent,
        recipientCount: emails.length,
      });

      return {
        success: true,
        subject,
        recipientCount: emails.length,
        newsCount: newsData.news.length,
        week: newsData.week,
      };
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
  }),

  // ── Comments (public) ──────────────────────────────────────────────────────────────
  comments: router({
    // Aggiungi un commento a un articolo
    add: publicProcedure
      .input(z.object({
        section: z.enum(["ai", "music"]),
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
        section: z.enum(["ai", "music"]),
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
});

export type AppRouter = typeof appRouter;
