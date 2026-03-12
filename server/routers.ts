import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { sendEmail, buildWeeklyNewsletterHtml } from "./email";
import { sendWeeklyNewsletter } from "./newsletterScheduler";
import {
  addSubscriber,
  getAllSubscribers,
  getActiveSubscribers,
  unsubscribeEmail,
  unsubscribeByToken,
  getSubscriberByToken,
  deleteSubscriber,
  createNewsletterSend,
  getNewsletterHistory,
  ensureUnsubscribeTokens,
  getLatestNews,
  getNewsRefreshHistory,
} from "./db";
import { generateLatestAINews, saveNewsToDb } from "./newsScheduler";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ── News (public) ──────────────────────────────────────────────────────────────────────────────────
  news: router({
    getLatest: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
      .query(async ({ input }) => {
        const items = await getLatestNews(input.limit);
        return items.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          sourceName: item.sourceName ?? "",
          sourceUrl: item.sourceUrl ?? "#",
          publishedAt: item.publishedAt ?? "",
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
        return result;
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

    // Trigger invio automatico immediato (usa il template dark ufficiale)
    triggerWeeklyNewsletter: adminProcedure.mutation(async () => {
      const result = await sendWeeklyNewsletter();
      if (!result.success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error ?? "Errore invio newsletter" });
      }
      return result;
    }),

    // Send weekly newsletter to all active subscribers (legacy - usa buildWeeklyNewsletterHtml)
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
  }),
});

export type AppRouter = typeof appRouter;
