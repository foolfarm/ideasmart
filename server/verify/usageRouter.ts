/**
 * ProofPress Verify SaaS — Usage Router
 *
 * Gestione dei contatori di consumo mensile per ogni organizzazione.
 * Traccia articoli verificati vs limite del piano.
 * Espone procedure per incrementare il contatore e resettarlo a inizio periodo.
 */
import { z } from "zod";
import { eq, and, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  verifySubscriptions,
  verifyOrganizations,
} from "../../drizzle/schema";

function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accesso riservato agli amministratori." });
  }
}

// ── Funzione pubblica per incrementare il contatore (usata da publicApi.ts) ──

export async function incrementArticleUsage(organizationId: number): Promise<{
  allowed: boolean;
  articlesUsed: number;
  articlesLimit: number;
}> {
  const db = await getDb();
  if (!db) return { allowed: false, articlesUsed: 0, articlesLimit: 0 };

  const now = new Date();

  const [sub] = await db
    .select()
    .from(verifySubscriptions)
    .where(
      and(
        eq(verifySubscriptions.organizationId, organizationId),
        eq(verifySubscriptions.status, "active"),
        lte(verifySubscriptions.periodStart, now),
        gte(verifySubscriptions.periodEnd, now)
      )
    )
    .limit(1);

  if (!sub) {
    // Prova anche con status trial
    const [trialSub] = await db
      .select()
      .from(verifySubscriptions)
      .where(
        and(
          eq(verifySubscriptions.organizationId, organizationId),
          eq(verifySubscriptions.status, "trial"),
          lte(verifySubscriptions.periodStart, now),
          gte(verifySubscriptions.periodEnd, now)
        )
      )
      .limit(1);

    if (!trialSub) return { allowed: false, articlesUsed: 0, articlesLimit: 0 };

    // Verifica limite (articlesLimit = -1 significa illimitato)
    if (trialSub.articlesLimit !== -1 && trialSub.articlesUsed >= trialSub.articlesLimit) {
      return { allowed: false, articlesUsed: trialSub.articlesUsed, articlesLimit: trialSub.articlesLimit };
    }

    await db
      .update(verifySubscriptions)
      .set({ articlesUsed: trialSub.articlesUsed + 1 })
      .where(eq(verifySubscriptions.id, trialSub.id));

    return {
      allowed: true,
      articlesUsed: trialSub.articlesUsed + 1,
      articlesLimit: trialSub.articlesLimit,
    };
  }

  if (sub.articlesLimit !== -1 && sub.articlesUsed >= sub.articlesLimit) {
    return { allowed: false, articlesUsed: sub.articlesUsed, articlesLimit: sub.articlesLimit };
  }

  await db
    .update(verifySubscriptions)
    .set({ articlesUsed: sub.articlesUsed + 1 })
    .where(eq(verifySubscriptions.id, sub.id));

  return {
    allowed: true,
    articlesUsed: sub.articlesUsed + 1,
    articlesLimit: sub.articlesLimit,
  };
}

// ── Router ────────────────────────────────────────────────────────────────────

export const verifyUsageRouter = router({
  /**
   * [ADMIN] Consumo corrente di un'organizzazione
   */
  get: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      const now = new Date();
      const [sub] = await db
        .select()
        .from(verifySubscriptions)
        .where(
          and(
            eq(verifySubscriptions.organizationId, input.organizationId),
            lte(verifySubscriptions.periodStart, now),
            gte(verifySubscriptions.periodEnd, now)
          )
        )
        .limit(1);

      if (!sub) return null;

      const percentUsed =
        sub.articlesLimit === -1
          ? 0
          : Math.round((sub.articlesUsed / sub.articlesLimit) * 100);

      return {
        plan: sub.plan,
        articlesUsed: sub.articlesUsed,
        articlesLimit: sub.articlesLimit,
        percentUsed,
        periodStart: sub.periodStart,
        periodEnd: sub.periodEnd,
        status: sub.status,
        daysRemaining: Math.max(
          0,
          Math.ceil((sub.periodEnd.getTime() - now.getTime()) / 86400_000)
        ),
      };
    }),

  /**
   * [ADMIN] Panoramica consumo di tutte le organizzazioni attive
   */
  overview: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user.role);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

    const now = new Date();
    const subs = await db
      .select({
        organizationId: verifySubscriptions.organizationId,
        orgName: verifyOrganizations.name,
        plan: verifySubscriptions.plan,
        articlesUsed: verifySubscriptions.articlesUsed,
        articlesLimit: verifySubscriptions.articlesLimit,
        status: verifySubscriptions.status,
        periodEnd: verifySubscriptions.periodEnd,
      })
      .from(verifySubscriptions)
      .innerJoin(
        verifyOrganizations,
        eq(verifySubscriptions.organizationId, verifyOrganizations.id)
      )
      .where(
        and(
          lte(verifySubscriptions.periodStart, now),
          gte(verifySubscriptions.periodEnd, now)
        )
      );

    return subs.map((s) => ({
      ...s,
      percentUsed:
        s.articlesLimit === -1
          ? 0
          : Math.round((s.articlesUsed / s.articlesLimit) * 100),
    }));
  }),

  /**
   * [ADMIN] Reset manuale del contatore (inizio nuovo periodo)
   */
  reset: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        newPeriodDays: z.number().int().min(1).max(365).default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB non disponibile." });

      const now = new Date();
      const newPeriodEnd = new Date(now.getTime() + input.newPeriodDays * 86400_000);

      await db
        .update(verifySubscriptions)
        .set({
          articlesUsed: 0,
          periodStart: now,
          periodEnd: newPeriodEnd,
        })
        .where(eq(verifySubscriptions.id, input.subscriptionId));

      return { success: true, message: "Contatore resettato per il nuovo periodo." };
    }),
});
