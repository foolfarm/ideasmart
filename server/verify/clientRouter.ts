/**
 * ProofPress Verify SaaS — Client Router
 *
 * Procedure per il cliente (editore) autenticato che accede alla propria dashboard.
 * Ogni utente vede solo i dati della propria organizzazione.
 *
 * Namespace isolato: nessuna dipendenza con il magazine.
 */
import { z } from "zod";
import { eq, and, desc, gte, lte, sql, isNotNull } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  verifyOrganizations,
  verifyApiKeys,
  verifySubscriptions,
  newsItems,
  type InsertVerifyApiKey,
  type InsertVerifyOrganization,
} from "../../drizzle/schema";


// ── Helpers ───────────────────────────────────────────────────────────────────
const KEY_PREFIX = "ppv_live_";
function generateRawKey(): string {
  return KEY_PREFIX + randomBytes(32).toString("hex");
}
function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Trova l'organizzazione associata all'utente corrente (via contactEmail).
 * Restituisce null se l'utente non ha ancora un'organizzazione.
 */
  async function getOrgForUser(userEmail: string | null | undefined) {
  if (!userEmail) return null;
  const db = await getDb();
  if (!db) return null;
  const [org] = await db
    .select()
    .from(verifyOrganizations)
    .where(eq(verifyOrganizations.contactEmail, userEmail))
    .limit(1);
  return org ?? null;
}

// ── Router ────────────────────────────────────────────────────────────────────
export const verifyClientRouter = router({
  /**
   * Restituisce il profilo completo dell'organizzazione + subscription attiva.
   * Se l'utente non ha ancora un'organizzazione, restituisce null.
   */
  myOrg: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    if (!ctx.user.email) return null;
    const [org] = await db
      .select()
      .from(verifyOrganizations)
      .where(eq(verifyOrganizations.contactEmail, ctx.user.email))
      .limit(1);

    if (!org) return null;

    const now = new Date();
    const [sub] = await db
      .select()
      .from(verifySubscriptions)
      .where(
        and(
          eq(verifySubscriptions.organizationId, org.id),
          lte(verifySubscriptions.periodStart, now),
          gte(verifySubscriptions.periodEnd, now)
        )
      )
      .orderBy(desc(verifySubscriptions.createdAt))
      .limit(1);

    const percentUsed =
      sub && sub.articlesLimit !== -1
        ? Math.round((sub.articlesUsed / sub.articlesLimit) * 100)
        : 0;

    const daysRemaining = sub
      ? Math.max(0, Math.ceil((sub.periodEnd.getTime() - now.getTime()) / 86400_000))
      : 0;

    return {
      org,
      subscription: sub ?? null,
      usage: sub
        ? {
            articlesUsed: sub.articlesUsed,
            articlesLimit: sub.articlesLimit,
            percentUsed,
            daysRemaining,
            periodStart: sub.periodStart,
            periodEnd: sub.periodEnd,
            status: sub.status,
            plan: sub.plan,
          }
        : null,
    };
  }),

  /**
   * Lista le API key dell'organizzazione dell'utente corrente.
   * Non espone keyHash — solo il prefisso e i metadati.
   */
  myApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const org = await getOrgForUser(ctx.user.email);
    if (!org) return [];

    return db
      .select({
        id: verifyApiKeys.id,
        keyPrefix: verifyApiKeys.keyPrefix,
        label: verifyApiKeys.label,
        canVerify: verifyApiKeys.canVerify,
        canReadReports: verifyApiKeys.canReadReports,
        rateLimit: verifyApiKeys.rateLimit,
        isActive: verifyApiKeys.isActive,
        lastUsedAt: verifyApiKeys.lastUsedAt,
        expiresAt: verifyApiKeys.expiresAt,
        createdAt: verifyApiKeys.createdAt,
        revokedAt: verifyApiKeys.revokedAt,
      })
      .from(verifyApiKeys)
      .where(eq(verifyApiKeys.organizationId, org.id))
      .orderBy(desc(verifyApiKeys.createdAt));
  }),

  /**
   * Genera una nuova API key per l'organizzazione dell'utente.
   * La chiave raw viene restituita UNA SOLA VOLTA.
   */
  createApiKey: protectedProcedure
    .input(
      z.object({
        label: z.string().max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const org = await getOrgForUser(ctx.user.email);
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organizzazione non trovata." });

      // Controlla che la subscription sia attiva o in trial
      const now = new Date();
      const [sub] = await db
        .select({ status: verifySubscriptions.status })
        .from(verifySubscriptions)
        .where(
          and(
            eq(verifySubscriptions.organizationId, org.id),
            lte(verifySubscriptions.periodStart, now),
            gte(verifySubscriptions.periodEnd, now)
          )
        )
        .limit(1);

      if (!sub || (sub.status !== "active" && sub.status !== "trial")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nessuna subscription attiva. Attiva un piano per generare chiavi API.",
        });
      }

      const rawKey = generateRawKey();
      const keyHash = hashKey(rawKey);
      const keyPrefix = rawKey.slice(0, 16) + "...";

      const insertData: InsertVerifyApiKey = {
        organizationId: org.id,
        keyPrefix,
        keyHash,
        label: input.label ?? null,
        canVerify: true,
        canReadReports: true,
        canManageOrg: false,
        rateLimit: 100,
        isActive: true,
      };

      const [result] = await db.insert(verifyApiKeys).values(insertData).$returningId();

      return {
        id: result.id,
        rawKey, // ⚠️ mostrata UNA SOLA VOLTA
        keyPrefix,
        message: "Chiave API generata. Salvala subito: non sarà più visibile.",
      };
    }),

  /**
   * Revoca una API key dell'organizzazione dell'utente.
   */
  revokeApiKey: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const org = await getOrgForUser(ctx.user.email);
      if (!org) throw new TRPCError({ code: "NOT_FOUND" });

      // Verifica che la chiave appartenga all'organizzazione dell'utente
      const [key] = await db
        .select({ id: verifyApiKeys.id, organizationId: verifyApiKeys.organizationId })
        .from(verifyApiKeys)
        .where(eq(verifyApiKeys.id, input.id))
        .limit(1);

      if (!key || key.organizationId !== org.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Chiave non trovata o non autorizzata." });
      }

      await db
        .update(verifyApiKeys)
        .set({ isActive: false, revokedAt: new Date() })
        .where(eq(verifyApiKeys.id, input.id));

      return { success: true };
    }),

  /**
   * Registra una nuova organizzazione e avvia il trial di 14 giorni.
   * Usato dall'onboarding self-service.
   */
  registerTrial: protectedProcedure
    .input(
      z.object({
        orgName: z.string().min(2).max(255),
        domain: z.string().max(255).optional(),
        plan: z.enum(["essential", "premiere", "professional"]).default("essential"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Controlla se esiste già un'organizzazione per questa email
      const existing = await getOrgForUser(ctx.user.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Hai già un'organizzazione registrata.",
        });
      }

      const slug = input.orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 128);

      const planLimits: Record<string, { articles: number; seats: number; price: number }> = {
        essential:    { articles: 100, seats: 2,  price: 49000 },
        premiere:     { articles: 300, seats: 5,  price: 99000 },
        professional: { articles: 500, seats: 10, price: 147000 },
      };
      const limits = planLimits[input.plan];

      // Crea organizzazione
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 14 * 86400_000);

      const orgData: InsertVerifyOrganization = {
        name: input.orgName,
        slug,
        contactEmail: ctx.user.email ?? "",
        contactName: ctx.user.name ?? undefined,
        domain: input.domain ?? undefined,
        plan: input.plan,
        status: "trial",
        trialEndsAt: trialEnd,
      };
      const [orgResult] = await db.insert(verifyOrganizations).values(orgData).$returningId();

      // Crea subscription trial 14 giorni

      await db.insert(verifySubscriptions).values({
        organizationId: orgResult.id,
        plan: input.plan,
        articlesLimit: limits.articles,
        articlesUsed: 0,
        periodStart: now,
        periodEnd: trialEnd,
        priceMonthly: limits.price,
        currency: "EUR",
        status: "trial",
      });

      // Genera prima API key automaticamente
      const rawKey = generateRawKey();
      const keyHash = hashKey(rawKey);
      const keyPrefix = rawKey.slice(0, 16) + "...";

      await db.insert(verifyApiKeys).values({
        organizationId: orgResult.id,
        keyPrefix,
        keyHash,
        label: "Chiave principale",
        canVerify: true,
        canReadReports: true,
        canManageOrg: false,
        rateLimit: limits.articles,
        isActive: true,
      });

      return {
        organizationId: orgResult.id,
        rawKey, // ⚠️ mostrata UNA SOLA VOLTA
        trialEndsAt: trialEnd,
        plan: input.plan,
        message: `Trial di 14 giorni attivato. Salva la tua API key: non sarà più visibile.`,
      };
    }),

  /**
   * Storico verifiche dell'organizzazione — articoli con verifyHash e report.
   * Paginato, ordinato per data decrescente.
   */
  myVerifications: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const org = await getOrgForUser(ctx.user.email);
      if (!org) return { rows: [], total: 0 };

      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;

      const rows = await db
        .select({
          id: newsItems.id,
          title: newsItems.title,
          verifyHash: newsItems.verifyHash,
          trustScore: newsItems.trustScore,
          trustGrade: newsItems.trustGrade,
          ipfsCid: newsItems.ipfsCid,
          ipfsUrl: newsItems.ipfsUrl,
          ipfsPinnedAt: newsItems.ipfsPinnedAt,
          publishedAt: newsItems.publishedAt,
          sourceUrl: newsItems.sourceUrl,
          sourceName: newsItems.sourceName,
          section: newsItems.section,
        })
        .from(newsItems)
        .where(isNotNull(newsItems.verifyReport))
        .orderBy(desc(newsItems.ipfsPinnedAt))
        .limit(limit)
        .offset(offset);

      const [[countRow]] = await db.execute(
        sql`SELECT COUNT(*) as total FROM news_items WHERE verifyReport IS NOT NULL`
      ) as any;

      return { rows, total: Number(countRow.total) };
    }),

  /**
   * Analytics dell'organizzazione — distribuzione TrustGrade, trend mensile,
   * totale certificazioni IPFS, articoli per sezione.
   */
  myAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const org = await getOrgForUser(ctx.user.email);
    if (!org) return null;

    // Distribuzione TrustGrade
    const [[gradeA], [gradeB], [gradeC], [gradeD], [gradeF]] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as n FROM news_items WHERE trustGrade = 'A' AND verifyReport IS NOT NULL`) as any,
      db.execute(sql`SELECT COUNT(*) as n FROM news_items WHERE trustGrade = 'B' AND verifyReport IS NOT NULL`) as any,
      db.execute(sql`SELECT COUNT(*) as n FROM news_items WHERE trustGrade = 'C' AND verifyReport IS NOT NULL`) as any,
      db.execute(sql`SELECT COUNT(*) as n FROM news_items WHERE trustGrade = 'D' AND verifyReport IS NOT NULL`) as any,
      db.execute(sql`SELECT COUNT(*) as n FROM news_items WHERE trustGrade = 'F' AND verifyReport IS NOT NULL`) as any,
    ]);

    // Totali
    const [[totalVerified]] = await db.execute(
      sql`SELECT COUNT(*) as total FROM news_items WHERE verifyReport IS NOT NULL`
    ) as any;
    const [[totalIpfs]] = await db.execute(
      sql`SELECT COUNT(*) as total FROM news_items WHERE ipfsCid IS NOT NULL`
    ) as any;

    // Ultimi 6 mesi — verifiche per mese
    const [monthlyRows] = await db.execute(
      sql`SELECT DATE_FORMAT(ipfsPinnedAt, '%Y-%m') as month, COUNT(*) as count
          FROM news_items
          WHERE ipfsPinnedAt IS NOT NULL
          GROUP BY month
          ORDER BY month DESC
          LIMIT 6`
    ) as any;

    // Top 5 sezioni per numero di articoli verificati
    const [sectionRows] = await db.execute(
      sql`SELECT section, COUNT(*) as count
          FROM news_items
          WHERE verifyReport IS NOT NULL
          GROUP BY section
          ORDER BY count DESC
          LIMIT 5`
    ) as any;

    return {
      gradeDistribution: {
        A: Number(gradeA[0]?.n ?? 0),
        B: Number(gradeB[0]?.n ?? 0),
        C: Number(gradeC[0]?.n ?? 0),
        D: Number(gradeD[0]?.n ?? 0),
        F: Number(gradeF[0]?.n ?? 0),
      },
      totalVerified: Number(totalVerified?.total ?? 0),
      totalIpfs: Number(totalIpfs?.total ?? 0),
      monthlyTrend: Array.isArray(monthlyRows)
        ? monthlyRows.map((r: any) => ({ month: r.month as string, count: Number(r.count) }))
        : [],
      topSections: Array.isArray(sectionRows)
        ? sectionRows.map((r: any) => ({ section: r.section as string, count: Number(r.count) }))
        : [],
    };
  }),
});
