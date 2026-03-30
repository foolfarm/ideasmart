/**
 * Admin Router — IDEASMART
 * Procedure protette per operazioni amministrative:
 * - Fix immediato sourceUrl nel DB
 * - Trigger manuale scraping RSS
 * - Stato audit
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { fixAllSourceUrls } from "../urlAuditFix";
import { publishDailyLinkedInPosts } from "../linkedinPublisher";
import { refreshAINewsFromRSS, refreshStartupNewsFromRSS, refreshDealroomNewsFromRSS, refreshAllNewsFromRSS } from "../rssNewsScheduler";
import { getDb } from "../db";
import { newsItems, sourceReports } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { fetchAllSendgridStats } from "../sendgridStats";

// Middleware admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo gli admin possono eseguire questa operazione" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Fix immediato: corregge tutti i sourceUrl nel DB che non sono homepage.
   * Può richiedere diversi minuti per l'intero DB.
   */
  fixSourceUrls: adminProcedure
    .input(z.object({
      section: z.enum(["ai", "startup", "dealroom", "all"]).default("all")
    }))
    .mutation(async ({ input }) => {
      console.log(`[AdminRouter] Avvio fix sourceUrl per sezione: ${input.section}`);
      try {
        const result = await fixAllSourceUrls({
          section: input.section === "all" ? undefined : input.section,
          batchSize: 10,
          delayMs: 300
        });
        return {
          success: true,
          ...result,
          message: `Fix completato: ${result.fixed} URL corretti su ${result.total} notizie`
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Errore durante il fix: ${(err as Error).message}`
        });
      }
    }),

  /**
   * Trigger manuale scraping RSS per una o tutte le sezioni.
   */
  triggerRssScraping: adminProcedure
    .input(z.object({
      section: z.enum(["ai", "startup", "dealroom", "all"]).default("all")
    }))
    .mutation(async ({ input }) => {
      console.log(`[AdminRouter] Trigger manuale scraping RSS: ${input.section}`);
      try {
        if (input.section === "all") {
          // Esegui in background per non bloccare la risposta
          setImmediate(() => refreshAllNewsFromRSS().catch(console.error));
          return { success: true, message: "Scraping RSS avviato in background per tutte le sezioni" };
        }

        const scrapers: Record<string, () => Promise<void>> = {
          ai: refreshAINewsFromRSS,
          startup: refreshStartupNewsFromRSS,
          dealroom: refreshDealroomNewsFromRSS
        };
        const scraper = scrapers[input.section];
        if (scraper) setImmediate(() => scraper().catch(console.error));
        return { success: true, message: `Scraping RSS avviato in background per sezione: ${input.section}` };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Errore: ${(err as Error).message}`
        });
      }
    }),

  /**
   * Statistiche sulle notizie nel DB e stato dei sourceUrl.
   */
  newsStats: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });

      const sections = ["ai", "startup", "dealroom"] as const;
      const stats: Record<string, { total: number; homepageUrls: number; specificUrls: number; missingUrls: number }> = {};

      for (const section of sections) {
        const rows = await db.select({
          sourceUrl: newsItems.sourceUrl
        }).from(newsItems).where(eq(newsItems.section, section));

        let homepageUrls = 0, specificUrls = 0, missingUrls = 0;
        for (const row of rows) {
          const url = row.sourceUrl || "";
          if (!url || url === "#") {
            missingUrls++;
          } else {
            try {
              const parsed = new URL(url);
              if (parsed.pathname === "/" || parsed.pathname === "") {
                homepageUrls++;
              } else {
                specificUrls++;
              }
            } catch {
              missingUrls++;
            }
          }
        }

        stats[section] = {
          total: rows.length,
          homepageUrls,
          specificUrls,
          missingUrls
        };
      }

      return stats;
    }),

  /**
   * Segnalazione utente: fonte errata su un articolo.
   */
  reportSource: protectedProcedure
    .input(z.object({
      section: z.enum(["ai", "startup", "dealroom"]),
      articleType: z.enum(["news", "editorial", "startup", "reportage", "analysis"]),
      articleId: z.number().int().positive(),
      reportedUrl: z.string().max(1000).optional(),
      reason: z.enum(["not_found", "wrong_content", "broken_link", "spam", "other"]),
      note: z.string().max(500).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const ipHash = ctx.user?.openId ? ctx.user.openId.slice(0, 16) : "anon";
      await db.insert(sourceReports).values({
        section: input.section,
        articleType: input.articleType,
        articleId: input.articleId,
        reportedUrl: input.reportedUrl,
        reason: input.reason,
        note: input.note,
        ipHash,
        status: "pending"
      });
      return { success: true, message: "Segnalazione ricevuta. Grazie per il contributo!" };
    }),

  /**
   * Lista segnalazioni (solo admin).
   */
  getSourceReports: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "reviewed", "resolved", "all"]).default("pending"),
      limit: z.number().int().min(1).max(100).default(50)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      const rows = await db.select().from(sourceReports).orderBy(desc(sourceReports.createdAt)).limit(input.limit);
      if (input.status !== "all") {
        return rows.filter(r => r.status === input.status);
      }
      return rows;
    }),

  /**
   * Aggiorna stato di una segnalazione (solo admin).
   */
  updateReportStatus: adminProcedure
    .input(z.object({
      reportId: z.number().int().positive(),
      status: z.enum(["pending", "reviewed", "resolved"]),
      adminNote: z.string().max(500).optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });
      await db.update(sourceReports)
        .set({
          status: input.status,
          adminNote: input.adminNote,
          resolvedAt: input.status === "resolved" ? new Date() : undefined
        })
        .where(eq(sourceReports.id, input.reportId));
      return { success: true };
    }),

  /**
   * Recupera le statistiche SendGrid degli ultimi N giorni.
   * Include global stats, unsubscribes, bounces e spam reports.
   */
  getSendgridStats: adminProcedure
    .input(z.object({
      days: z.number().int().min(1).max(90).default(30)
    }))
    .query(async ({ input }) => {
      try {
        const result = await fetchAllSendgridStats(input.days);
        return { success: true, data: result };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Errore recupero statistiche SendGrid"
        });
      }
    }),

  /**
   * Pubblica manualmente le top 3 notizie del giorno su LinkedIn.
   * Utile per test e per pubblicazioni straordinarie fuori orario.
   */
  publishLinkedIn: adminProcedure
    .mutation(async () => {
      console.log("[AdminRouter] Avvio pubblicazione manuale LinkedIn...");
      try {
        const result = await publishDailyLinkedInPosts();
        return {
          success: result.published > 0,
          published: result.published,
          total: result.posts.length,
          errors: result.errors,
          posts: result.posts.map(p => ({
            section: p.section,
            title: p.title.slice(0, 80),
            success: p.success,
            postId: p.postId,
            error: p.error
          })),
          message: `${result.published}/${result.posts.length} post pubblicati su LinkedIn`
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Errore pubblicazione LinkedIn"
        });
      }
    })
});
