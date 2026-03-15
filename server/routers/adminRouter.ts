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
import { refreshAINewsFromRSS, refreshMusicNewsFromRSS, refreshStartupNewsFromRSS, refreshAllNewsFromRSS } from "../rssNewsScheduler";
import { getDb } from "../db";
import { newsItems } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

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
      section: z.enum(["ai", "music", "startup", "all"]).default("all"),
    }))
    .mutation(async ({ input }) => {
      console.log(`[AdminRouter] Avvio fix sourceUrl per sezione: ${input.section}`);
      try {
        const result = await fixAllSourceUrls({
          section: input.section === "all" ? undefined : input.section,
          batchSize: 10,
          delayMs: 300,
        });
        return {
          success: true,
          ...result,
          message: `Fix completato: ${result.fixed} URL corretti su ${result.total} notizie`,
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Errore durante il fix: ${(err as Error).message}`,
        });
      }
    }),

  /**
   * Trigger manuale scraping RSS per una o tutte le sezioni.
   */
  triggerRssScraping: adminProcedure
    .input(z.object({
      section: z.enum(["ai", "music", "startup", "all"]).default("all"),
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
          music: refreshMusicNewsFromRSS,
          startup: refreshStartupNewsFromRSS,
        };
        const scraper = scrapers[input.section];
        if (scraper) setImmediate(() => scraper().catch(console.error));
        return { success: true, message: `Scraping RSS avviato in background per sezione: ${input.section}` };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Errore: ${(err as Error).message}`,
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

      const sections = ["ai", "music", "startup"] as const;
      const stats: Record<string, { total: number; homepageUrls: number; specificUrls: number; missingUrls: number }> = {};

      for (const section of sections) {
        const rows = await db.select({
          sourceUrl: newsItems.sourceUrl,
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
          missingUrls,
        };
      }

      return stats;
    }),
});
