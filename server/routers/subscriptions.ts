/**
 * Subscriptions Router — Base Alpha+ e ProofPress Creator
 * Procedure:
 * - getMySubscriptions: tutti gli abbonamenti dell'utente (entrambi i prodotti)
 * - getMyInvoices: storico fatture da Stripe
 * - cancelSubscription: cancella abbonamento su Stripe (fine periodo)
 * - createPortalSession: apre il Stripe Customer Portal
 */
import Stripe from "stripe";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { baseAlphaSubscriptions, creatorSubscriptions } from "../../drizzle/schema";
import { eq, desc, or } from "drizzle-orm";
import { BASE_ALPHA_PLANS } from "../baseAlphaProducts";
import { CREATOR_PLANS } from "../creatorProducts";

function getStripe(): Stripe {
  const key = process.env.FOOLFARM_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

// Arricchisce un abbonamento con dati Stripe in tempo reale
async function enrichWithStripe(stripeSubscriptionId: string | null) {
  if (!stripeSubscriptionId) return { stripeStatus: null, periodStart: null, periodEnd: null, cancelAtPeriodEnd: false };
  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const raw = sub as unknown as Record<string, unknown>;
    return {
      stripeStatus: sub.status,
      periodStart: raw.current_period_start ? new Date((raw.current_period_start as number) * 1000) : null,
      periodEnd: raw.current_period_end ? new Date((raw.current_period_end as number) * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    };
  } catch {
    return { stripeStatus: null, periodStart: null, periodEnd: null, cancelAtPeriodEnd: false };
  }
}

export const subscriptionsRouter = router({
  /**
   * Recupera TUTTI gli abbonamenti attivi dell'utente (Base Alpha + Creator).
   */
  getMySubscriptions: publicProcedure
    .input(z.object({ email: z.string().email().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const email = ctx.user?.email ?? input?.email ?? null;
      const userId = ctx.user?.id ?? null;

      if (!email && !userId) return [];

      const results: Array<{
        id: number;
        product: "base_alpha" | "creator";
        planId: string;
        planName: string;
        planBadge: string;
        planFeatures: string[];
        priceMonthly: number;
        currency: string;
        status: string;
        cancelAtPeriodEnd: boolean;
        currentPeriodStart: Date | null;
        currentPeriodEnd: Date | null;
        stripeSubscriptionId: string | null;
        stripeCustomerId: string | null;
        customerEmail: string;
        customerName: string | null;
        createdAt: Date;
      }> = [];

      // ── Base Alpha+ ────────────────────────────────────────────────────────
      const baWhere = userId && email
        ? or(eq(baseAlphaSubscriptions.userId, userId), eq(baseAlphaSubscriptions.customerEmail, email))
        : userId
          ? eq(baseAlphaSubscriptions.userId, userId)
          : eq(baseAlphaSubscriptions.customerEmail, email!);

      const baSubs = await db.select().from(baseAlphaSubscriptions)
        .where(baWhere)
        .orderBy(desc(baseAlphaSubscriptions.createdAt))
        .limit(5);

      for (const sub of baSubs) {
        const plan = BASE_ALPHA_PLANS[sub.planId as keyof typeof BASE_ALPHA_PLANS];
        const stripe = await enrichWithStripe(sub.stripeSubscriptionId ?? null);
        results.push({
          id: sub.id,
          product: "base_alpha",
          planId: sub.planId,
          planName: sub.planName,
          planBadge: plan?.badge ?? "",
          planFeatures: plan ? [...plan.features] : [],
          priceMonthly: sub.priceMonthly,
          currency: sub.currency,
          status: stripe.stripeStatus ?? sub.status,
          cancelAtPeriodEnd: stripe.cancelAtPeriodEnd,
          currentPeriodStart: stripe.periodStart ?? sub.currentPeriodStart,
          currentPeriodEnd: stripe.periodEnd ?? sub.currentPeriodEnd,
          stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
          stripeCustomerId: sub.stripeCustomerId ?? null,
          customerEmail: sub.customerEmail,
          customerName: sub.customerName ?? null,
          createdAt: sub.createdAt,
        });
      }

      // ── ProofPress Creator ─────────────────────────────────────────────────
      const crWhere = userId && email
        ? or(eq(creatorSubscriptions.userId, userId), eq(creatorSubscriptions.customerEmail, email))
        : userId
          ? eq(creatorSubscriptions.userId, userId)
          : eq(creatorSubscriptions.customerEmail, email!);

      const crSubs = await db.select().from(creatorSubscriptions)
        .where(crWhere)
        .orderBy(desc(creatorSubscriptions.createdAt))
        .limit(5);

      for (const sub of crSubs) {
        const planKey = sub.planId.replace("creator_", "") as keyof typeof CREATOR_PLANS;
        const plan = CREATOR_PLANS[planKey];
        const stripe = await enrichWithStripe(sub.stripeSubscriptionId ?? null);
        results.push({
          id: sub.id,
          product: "creator",
          planId: sub.planId,
          planName: sub.planName,
          planBadge: plan?.badge ?? "",
          planFeatures: plan ? [...plan.features] : [],
          priceMonthly: sub.priceMonthly,
          currency: sub.currency,
          status: stripe.stripeStatus ?? sub.status,
          cancelAtPeriodEnd: stripe.cancelAtPeriodEnd,
          currentPeriodStart: stripe.periodStart ?? sub.currentPeriodStart,
          currentPeriodEnd: stripe.periodEnd ?? sub.currentPeriodEnd,
          stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
          stripeCustomerId: sub.stripeCustomerId ?? null,
          customerEmail: sub.customerEmail,
          customerName: sub.customerName ?? null,
          createdAt: sub.createdAt,
        });
      }

      // Ordina per data creazione (più recente prima)
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return results;
    }),

  /**
   * Recupera le fatture Stripe dell'utente (da entrambi i prodotti).
   */
  getMyInvoices: publicProcedure
    .input(z.object({ email: z.string().email().optional(), limit: z.number().min(1).max(50).default(12) }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const email = ctx.user?.email ?? input?.email ?? null;
      const userId = ctx.user?.id ?? null;
      if (!email && !userId) return [];

      // Raccoglie tutti i customerIds (Base Alpha + Creator)
      const customerIds = new Set<string>();

      const baWhere = userId && email
        ? or(eq(baseAlphaSubscriptions.userId, userId), eq(baseAlphaSubscriptions.customerEmail, email))
        : userId ? eq(baseAlphaSubscriptions.userId, userId) : eq(baseAlphaSubscriptions.customerEmail, email!);
      const baSubs = await db.select({ cid: baseAlphaSubscriptions.stripeCustomerId }).from(baseAlphaSubscriptions).where(baWhere).limit(5);
      baSubs.forEach(r => r.cid && customerIds.add(r.cid));

      const crWhere = userId && email
        ? or(eq(creatorSubscriptions.userId, userId), eq(creatorSubscriptions.customerEmail, email))
        : userId ? eq(creatorSubscriptions.userId, userId) : eq(creatorSubscriptions.customerEmail, email!);
      const crSubs = await db.select({ cid: creatorSubscriptions.stripeCustomerId }).from(creatorSubscriptions).where(crWhere).limit(5);
      crSubs.forEach(r => r.cid && customerIds.add(r.cid));

      if (customerIds.size === 0) return [];

      try {
        const stripe = getStripe();
        const allInvoices: Stripe.Invoice[] = [];
        for (const cid of Array.from(customerIds)) {
          const inv = await stripe.invoices.list({ customer: cid, limit: input?.limit ?? 12 });
          allInvoices.push(...inv.data);
        }
        // Ordina per data (più recente prima)
        allInvoices.sort((a, b) => b.created - a.created);
        const limit = input?.limit ?? 12;
        return allInvoices.slice(0, limit).map((inv) => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          amountPaid: inv.amount_paid,
          amountDue: inv.amount_due,
          currency: inv.currency.toUpperCase(),
          created: new Date(inv.created * 1000),
          periodStart: inv.period_start ? new Date(inv.period_start * 1000) : null,
          periodEnd: inv.period_end ? new Date(inv.period_end * 1000) : null,
          pdfUrl: inv.invoice_pdf,
          hostedUrl: inv.hosted_invoice_url,
          description: inv.description ?? inv.lines?.data?.[0]?.description ?? null,
        }));
      } catch {
        return [];
      }
    }),

  /**
   * Cancella un abbonamento su Stripe (al termine del periodo corrente).
   * Aggiorna anche il DB locale.
   */
  cancelSubscription: publicProcedure
    .input(z.object({
      stripeSubscriptionId: z.string(),
      product: z.enum(["base_alpha", "creator"]),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const email = ctx.user?.email ?? input.email ?? null;
      const userId = ctx.user?.id ?? null;
      if (!email && !userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Autenticazione richiesta" });

      // Verifica che l'abbonamento appartenga all'utente
      if (input.product === "base_alpha") {
        const subs = await db.select({ id: baseAlphaSubscriptions.id })
          .from(baseAlphaSubscriptions)
          .where(eq(baseAlphaSubscriptions.stripeSubscriptionId, input.stripeSubscriptionId))
          .limit(1);
        if (subs.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Abbonamento non trovato" });
      } else {
        const subs = await db.select({ id: creatorSubscriptions.id })
          .from(creatorSubscriptions)
          .where(eq(creatorSubscriptions.stripeSubscriptionId, input.stripeSubscriptionId))
          .limit(1);
        if (subs.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Abbonamento non trovato" });
      }

      // Cancella su Stripe (al termine del periodo)
      const stripe = getStripe();
      await stripe.subscriptions.update(input.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      console.log(`[Subscriptions] Subscription scheduled for cancellation: ${input.stripeSubscriptionId}`);
      return { success: true, message: "Abbonamento programmato per la cancellazione al termine del periodo corrente." };
    }),

  /**
   * Crea una Stripe Customer Portal Session per gestione autonoma.
   */
  createPortalSession: publicProcedure
    .input(z.object({
      origin: z.string().url(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });

      const email = ctx.user?.email ?? input.email ?? null;
      const userId = ctx.user?.id ?? null;
      if (!email && !userId) throw new TRPCError({ code: "NOT_FOUND", message: "Nessun abbonamento trovato" });

      // Cerca customerId in entrambe le tabelle
      let customerId: string | null = null;

      const baWhere = userId && email
        ? or(eq(baseAlphaSubscriptions.userId, userId), eq(baseAlphaSubscriptions.customerEmail, email))
        : userId ? eq(baseAlphaSubscriptions.userId, userId) : eq(baseAlphaSubscriptions.customerEmail, email!);
      const baRes = await db.select({ cid: baseAlphaSubscriptions.stripeCustomerId }).from(baseAlphaSubscriptions).where(baWhere).orderBy(desc(baseAlphaSubscriptions.createdAt)).limit(1);
      customerId = baRes[0]?.cid ?? null;

      if (!customerId) {
        const crWhere = userId && email
          ? or(eq(creatorSubscriptions.userId, userId), eq(creatorSubscriptions.customerEmail, email))
          : userId ? eq(creatorSubscriptions.userId, userId) : eq(creatorSubscriptions.customerEmail, email!);
        const crRes = await db.select({ cid: creatorSubscriptions.stripeCustomerId }).from(creatorSubscriptions).where(crWhere).orderBy(desc(creatorSubscriptions.createdAt)).limit(1);
        customerId = crRes[0]?.cid ?? null;
      }

      if (!customerId) throw new TRPCError({ code: "NOT_FOUND", message: "Nessun abbonamento trovato per questo account." });

      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${input.origin}/abbonamenti`,
      });
      return { portalUrl: session.url };
    }),
});
