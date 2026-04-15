/**
 * Admin Router — Proof Press
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
import { newsItems, sourceReports, healthCheckLogs, subscribers } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { getRecentAlerts, markAllAlertsRead, markAlertRead, countUnreadAlerts } from "../alertLogger";
import { fetchAllSendgridStats } from "../sendgridStats";
import { runSiteHealthCheck } from "../siteHealthCheck";
import { sendEmail, buildPromptCollectionNewsletterHtml } from "../email";

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
    }),

  /**
   * Health Check manuale: esegue immediatamente il health check del sito in produzione.
   * Utile per verifiche immediate dopo un deploy.
   */
  runHealthCheck: adminProcedure
    .mutation(async () => {
      console.log("[AdminRouter] Avvio health check manuale...");
      try {
        const report = await runSiteHealthCheck();
        return {
          success: report.allOk,
          timestamp: report.timestamp,
          totalChecks: report.checks.length,
          passedChecks: report.checks.filter(c => c.ok).length,
          failedChecks: report.checks.filter(c => !c.ok).length,
          totalTimeMs: report.totalTimeMs,
          checks: report.checks,
          message: report.allOk
            ? `\u2705 Tutti i ${report.checks.length} check OK (${report.totalTimeMs}ms)`
            : `\u26a0\ufe0f ${report.checks.filter(c => !c.ok).length}/${report.checks.length} check FALLITI`,
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Errore health check"
        });
      }
    }),

  /**
   * Storico Health Check: restituisce gli ultimi N log dal DB.
   */
  getHealthCheckHistory: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(24) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { logs: [], message: "Database non disponibile" };
        const logs = await db
          .select()
          .from(healthCheckLogs)
          .orderBy(desc(healthCheckLogs.createdAt))
          .limit(input.limit);
        return {
          logs: logs.map(l => ({
            id: l.id,
            allOk: l.allOk,
            totalChecks: l.totalChecks,
            passedChecks: l.passedChecks,
            failedChecks: l.failedChecks,
            totalTimeMs: l.totalTimeMs,
            alertSent: l.alertSent,
            failedDetails: l.failedDetails ? JSON.parse(l.failedDetails) : [],
            createdAt: l.createdAt,
          })),
          message: `Ultimi ${logs.length} health check`,
        };
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Errore recupero storico health check"
        });
      }
    }),

  /**
   * Alert Log: storico alert di sistema (health check, diversity, linkedin, ecc.)
   */
  getAlertLogs: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(200).default(100) }).optional())
    .query(async ({ input }) => {
      const alerts = await getRecentAlerts(input?.limit ?? 100);
      const unread = await countUnreadAlerts();
      return { alerts, unread };
    }),

  markAlertRead: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markAlertRead(input.id);
      return { ok: true };
    }),

  markAllAlertsRead: adminProcedure
    .mutation(async () => {
      await markAllAlertsRead();
      return { ok: true };
    }),

  /**
   * Statistiche SendGrid aggregate per la pagina Performance Newsletter.
   * Recupera direttamente dall'API SendGrid: delivered, unique_opens, open_rate, unsubscribes.
   */
  getSendgridSummary: adminProcedure
    .input(z.object({ days: z.number().int().min(1).max(365).default(90) }))
    .query(async ({ input }) => {
      try {
        const stats = await fetchAllSendgridStats(input.days);
        return {
          success: true,
          delivered: stats.totals.delivered,
          uniqueOpens: stats.totals.unique_opens,
          opens: stats.totals.opens,
          openRate: stats.totals.open_rate,
          clickRate: stats.totals.click_rate,
          bounces: stats.totals.bounces,
          unsubscribes: stats.totals.unsubscribes,
          spamReports: stats.totals.spam_reports,
          days: input.days,
          fetchedAt: stats.fetchedAt,
          // Ultimi 30 giorni per il trend
          dailyStats: stats.stats.slice(-30).map(d => ({
            date: d.date,
            delivered: d.delivered,
            uniqueOpens: d.unique_opens,
            openRate: d.open_rate,
          }))
        };
      } catch (err) {
        return {
          success: false,
          delivered: 0, uniqueOpens: 0, opens: 0, openRate: 0,
          clickRate: 0, bounces: 0, unsubscribes: 0, spamReports: 0,
          days: input.days, fetchedAt: new Date().toISOString(), dailyStats: []
        };
      }
    }),

  /**
   * Recupera utilizzo piano SendGrid (crediti email, piano, reset mensile)
   */
  getSendgridCredits: adminProcedure
    .query(async () => {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) return { success: false, error: 'API key mancante' };

      async function sgGet(path: string) {
        const res = await fetch(`https://api.sendgrid.com${path}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        return res.json();
      }

      try {
        const [credits, account] = await Promise.all([
          sgGet('/v3/user/credits'),
          sgGet('/v3/user/account'),
        ]);
        return {
          success: true,
          plan: account.type ?? 'unknown',
          reputation: account.reputation ?? 0,
          totalCredits: credits.total ?? 0,
          usedCredits: credits.used ?? 0,
          remainCredits: credits.remain ?? 0,
          overage: credits.overage ?? 0,
          lastReset: credits.last_reset ?? null,
          nextReset: credits.next_reset ?? null,
          resetFrequency: credits.reset_frequency ?? 'monthly',
          isHardLimit: credits.is_hard_limit ?? true,
          usagePercent: credits.total > 0 ? Math.round((credits.used / credits.total) * 100) : 0,
        };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      };
    }),

  /**
   * Invia la newsletter pubblicitaria Prompt Collection 2026
   * Mittente: ProofPress Business (noreply@proofpress.biz)
   */
  sendPromptCollectionNewsletter: adminProcedure
    .input(z.object({
      mode: z.enum(["test", "full"]),
      testEmail: z.string().email().optional(),
      subject: z.string().min(1).default("99 prompt curati per lavorare meglio con l'AI"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile" });

      if (input.mode === "test") {
        const email = input.testEmail || ctx.user.email;
        if (!email) throw new TRPCError({ code: "BAD_REQUEST", message: "Email di test richiesta" });
        const html = buildPromptCollectionNewsletterHtml({ unsubscribeUrl: `https://proofpress.ai/unsubscribe`, isTest: true });
        const result = await sendEmail({ sender: "promo", to: email, subject: `[TEST] ${input.subject}`, html, listUnsubscribeUrl: `https://proofpress.ai/unsubscribe` });
        return { success: result.success, sent: result.success ? 1 : 0, error: result.error };
      }

      const allSubscribers = await db
        .select({ id: subscribers.id, email: subscribers.email, unsubscribeToken: subscribers.unsubscribeToken })
        .from(subscribers)
        .where(eq(subscribers.status, "active"));

      let sent = 0;
      let errors = 0;
      const BATCH_SIZE = 50;
      for (let i = 0; i < allSubscribers.length; i += BATCH_SIZE) {
        const batch = allSubscribers.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (sub) => {
          const unsubscribeUrl = sub.unsubscribeToken
            ? `https://proofpress.ai/unsubscribe?token=${sub.unsubscribeToken}`
            : `https://proofpress.ai/unsubscribe`;
          const html = buildPromptCollectionNewsletterHtml({ unsubscribeUrl, isTest: false });
          const result = await sendEmail({ sender: "promo", to: sub.email, subject: input.subject, html, listUnsubscribeUrl: unsubscribeUrl });
          if (result.success) sent++; else errors++;
        }));
        if (i + BATCH_SIZE < allSubscribers.length) await new Promise(r => setTimeout(r, 500));
      }
      return { success: true, sent, errors, total: allSubscribers.length };
    }),
});
