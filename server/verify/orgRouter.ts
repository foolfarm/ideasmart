/**
 * ProofPress Verify SaaS — Org Router
 *
 * Gestione organizzazioni clienti B2B (editori).
 * Tutte le procedure richiedono ruolo "admin".
 *
 * Namespace isolato: nessuna dipendenza con il magazine.
 */
import { z } from "zod";
import { eq, desc, and, isNotNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  verifyOrganizations,
  verifySubscriptions,
  newsItems,
  type InsertVerifyOrganization,
} from "../../drizzle/schema";

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 128);
}

function planToArticlesLimit(plan: string): number {
  switch (plan) {
    case "essential":    return 100;
    case "premiere":     return 300;
    case "professional": return 500;
    case "custom":       return -1;
    default:             return 100;
  }
}

function planToSeats(plan: string): number {
  switch (plan) {
    case "essential":    return 2;
    case "premiere":     return 5;
    case "professional": return 10;
    case "custom":       return 999;
    default:             return 2;
  }
}

function planToPrice(plan: string): number {
  switch (plan) {
    case "essential":    return 49000;
    case "premiere":     return 99000;
    case "professional": return 147000;
    case "custom":       return 0;
    default:             return 49000;
  }
}

function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori." });
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

export const verifyOrgRouter = router({
  /**
   * [ADMIN] Lista tutte le organizzazioni
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });
    return db.select().from(verifyOrganizations).orderBy(desc(verifyOrganizations.createdAt));
  }),

  /**
   * [ADMIN] Dettaglio singola organizzazione con subscription
   */
  get: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      const [org] = await db
        .select()
        .from(verifyOrganizations)
        .where(eq(verifyOrganizations.id, input.id))
        .limit(1);
      if (!org) throw new TRPCError({ code: "NOT_FOUND", message: "Organizzazione non trovata." });

      const [sub] = await db
        .select()
        .from(verifySubscriptions)
        .where(
          and(
            eq(verifySubscriptions.organizationId, input.id),
            eq(verifySubscriptions.status, "active")
          )
        )
        .limit(1);

      return { org, subscription: sub ?? null };
    }),

  /**
   * [ADMIN] Crea una nuova organizzazione con trial di 14 giorni
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        contactEmail: z.string().email(),
        contactName: z.string().max(255).optional(),
        domain: z.string().max(255).optional(),
        plan: z.enum(["essential", "premiere", "professional", "custom"]).default("essential"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      const slug = slugify(input.name);

      const [existing] = await db
        .select({ id: verifyOrganizations.id })
        .from(verifyOrganizations)
        .where(eq(verifyOrganizations.slug, slug))
        .limit(1);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Esiste già un'organizzazione con slug "${slug}".`,
        });
      }

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      const insertData: InsertVerifyOrganization = {
        slug,
        name: input.name,
        contactEmail: input.contactEmail,
        contactName: input.contactName ?? null,
        domain: input.domain ?? null,
        plan: input.plan,
        status: "trial",
        notes: input.notes ?? null,
        trialEndsAt,
      };

      const [result] = await db.insert(verifyOrganizations).values(insertData).$returningId();
      const orgId = result.id;

      const now = new Date();
      const periodEnd = new Date(trialEndsAt);
      await db.insert(verifySubscriptions).values({
        organizationId: orgId,
        plan: input.plan,
        articlesLimit: planToArticlesLimit(input.plan),
        journalistSeats: planToSeats(input.plan),
        articlesUsed: 0,
        periodStart: now,
        periodEnd,
        priceMonthly: planToPrice(input.plan),
        currency: "EUR",
        status: "trial",
      });

      return { id: orgId, slug, message: "Organizzazione creata con trial di 14 giorni." };
    }),

  /**
   * [ADMIN] Aggiorna piano o stato di un'organizzazione
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        plan: z.enum(["essential", "premiere", "professional", "custom"]).optional(),
        status: z.enum(["trial", "active", "suspended", "cancelled"]).optional(),
        notes: z.string().optional(),
        stripeCustomerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      const { id, ...updates } = input;
      const patch: Record<string, unknown> = {};
      if (updates.plan !== undefined) patch.plan = updates.plan;
      if (updates.status !== undefined) patch.status = updates.status;
      if (updates.notes !== undefined) patch.notes = updates.notes;
      if (updates.stripeCustomerId !== undefined) patch.stripeCustomerId = updates.stripeCustomerId;

      if (Object.keys(patch).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nessun campo da aggiornare." });
      }

      await db
        .update(verifyOrganizations)
        .set(patch)
        .where(eq(verifyOrganizations.id, id));

      return { success: true };
    }),

  /**
   * [ADMIN] Registro certificazioni IPFS — lista articoli verificati con CID Pinata
   */
  listCertifications: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(200).default(100),
      offset: z.number().min(0).default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      const limit = input?.limit ?? 100;
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
          section: newsItems.section,
        })
        .from(newsItems)
        .where(isNotNull(newsItems.verifyReport))
        .orderBy(desc(newsItems.ipfsPinnedAt))
        .limit(limit)
        .offset(offset);

      const [[totalRow]] = await db.execute(
        sql`SELECT COUNT(*) as total FROM news_items WHERE verifyReport IS NOT NULL`
      ) as any;
      const [[pinnedRow]] = await db.execute(
        sql`SELECT COUNT(*) as pinned FROM news_items WHERE ipfsCid IS NOT NULL`
      ) as any;

      return {
        rows,
        total: Number(totalRow.total),
        pinned: Number(pinnedRow.pinned),
        pending: Number(totalRow.total) - Number(pinnedRow.pinned),
      };
    }),

  /**
   * [ADMIN] Statistiche aggregate
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

    const orgs = await db.select().from(verifyOrganizations);
    const byPlan: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const org of orgs) {
      byPlan[org.plan] = (byPlan[org.plan] ?? 0) + 1;
      byStatus[org.status] = (byStatus[org.status] ?? 0) + 1;
    }

    return { total: orgs.length, byPlan, byStatus };
  }),
});
