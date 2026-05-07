/**
 * Base Alpha + — Subscriptions Router
 * Espone le procedure per la pagina /abbonamenti:
 * - getMySubscription: stato abbonamento dell'utente loggato (o per email)
 * - getMyInvoices: storico fatture da Stripe
 * - cancelSubscription: cancella abbonamento (fine periodo)
 * - createPortalSession: apre il Stripe Customer Portal per gestione autonoma
 */
import Stripe from "stripe";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { baseAlphaSubscriptions } from "../../drizzle/schema";
import { eq, desc, or } from "drizzle-orm";
import { BASE_ALPHA_PLANS } from "../baseAlphaProducts";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export const subscriptionsRouter = router({
  /**
   * Recupera l'abbonamento attivo dell'utente.
   * Se loggato: cerca per userId o email.
   * Se non loggato: cerca per email (passata come parametro).
   */
  getMySubscription: publicProcedure
    .input(z.object({ email: z.string().email().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      let sub = null;

      if (ctx.user) {
        // Utente loggato: cerca per userId o email
        const results = await db
          .select()
          .from(baseAlphaSubscriptions)
          .where(
            ctx.user.email
              ? or(
                  eq(baseAlphaSubscriptions.userId, ctx.user.id),
                  eq(baseAlphaSubscriptions.customerEmail, ctx.user.email)
                )
              : eq(baseAlphaSubscriptions.userId, ctx.user.id)
          )
          .orderBy(desc(baseAlphaSubscriptions.createdAt))
          .limit(1);
        sub = results[0] ?? null;
      } else if (input?.email) {
        // Non loggato: cerca per email
        const results = await db
          .select()
          .from(baseAlphaSubscriptions)
          .where(eq(baseAlphaSubscriptions.customerEmail, input.email))
          .orderBy(desc(baseAlphaSubscriptions.createdAt))
          .limit(1);
        sub = results[0] ?? null;
      }

      if (!sub) return null;

      // Arricchisci con dati Stripe in tempo reale
      let stripeStatus: string | null = null;
      let stripePeriodEnd: Date | null = null;
      let stripePeriodStart: Date | null = null;
      let cancelAtPeriodEnd = false;

      if (sub.stripeSubscriptionId) {
        try {
          const stripe = getStripe();
          const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
          stripeStatus = stripeSub.status;
          const rawSub = stripeSub as unknown as Record<string, unknown>;
          stripePeriodEnd = rawSub.current_period_end ? new Date((rawSub.current_period_end as number) * 1000) : null;
          stripePeriodStart = rawSub.current_period_start ? new Date((rawSub.current_period_start as number) * 1000) : null;
          cancelAtPeriodEnd = stripeSub.cancel_at_period_end;

          // Aggiorna il DB se lo stato è cambiato
          if (stripeStatus !== sub.status) {
            await db
              .update(baseAlphaSubscriptions)
              .set({
                status: stripeStatus as "active" | "past_due" | "cancelled" | "incomplete" | "trialing",
                currentPeriodStart: stripePeriodStart,
                currentPeriodEnd: stripePeriodEnd,
              })
              .where(eq(baseAlphaSubscriptions.id, sub.id));
          }
        } catch (_) {
          // Stripe non raggiungibile: usa dati DB
        }
      }

      const plan = BASE_ALPHA_PLANS[sub.planId as keyof typeof BASE_ALPHA_PLANS];

      return {
        id: sub.id,
        planId: sub.planId,
        planName: sub.planName,
        planBadge: plan?.badge ?? "",
        planFeatures: plan ? [...plan.features] : [],
        priceMonthly: sub.priceMonthly,
        currency: sub.currency,
        status: stripeStatus ?? sub.status,
        cancelAtPeriodEnd,
        currentPeriodStart: stripePeriodStart ?? sub.currentPeriodStart,
        currentPeriodEnd: stripePeriodEnd ?? sub.currentPeriodEnd,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        stripeCustomerId: sub.stripeCustomerId,
        customerEmail: sub.customerEmail,
        customerName: sub.customerName,
        createdAt: sub.createdAt,
      };
    }),

  /**
   * Recupera le fatture Stripe dell'utente.
   */
  getMyInvoices: publicProcedure
    .input(z.object({ email: z.string().email().optional(), limit: z.number().min(1).max(50).default(12) }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non disponibile" });
      let customerId: string | null = null;

      // Trova il customerId Stripe
      if (ctx.user) {
        const results = await db
          .select({ stripeCustomerId: baseAlphaSubscriptions.stripeCustomerId })
          .from(baseAlphaSubscriptions)
          .where(
            ctx.user.email
              ? or(
                  eq(baseAlphaSubscriptions.userId, ctx.user.id),
                  eq(baseAlphaSubscriptions.customerEmail, ctx.user.email)
                )
              : eq(baseAlphaSubscriptions.userId, ctx.user.id)
          )
          .orderBy(desc(baseAlphaSubscriptions.createdAt))
          .limit(1);
        customerId = results[0]?.stripeCustomerId ?? null;
      } else if (input?.email) {
        const results = await db
          .select({ stripeCustomerId: baseAlphaSubscriptions.stripeCustomerId })
          .from(baseAlphaSubscriptions)
          .where(eq(baseAlphaSubscriptions.customerEmail, input.email))
          .orderBy(desc(baseAlphaSubscriptions.createdAt))
          .limit(1);
        customerId = results[0]?.stripeCustomerId ?? null;
      }

      if (!customerId) return [];

      try {
        const stripe = getStripe();
        const invoices = await stripe.invoices.list({
          customer: customerId,
          limit: input?.limit ?? 12,
        });

        return invoices.data.map((inv) => ({
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
      } catch (_) {
        return [];
      }
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
      let customerId: string | null = null;

      if (ctx.user) {
        const results = await db
          .select({ stripeCustomerId: baseAlphaSubscriptions.stripeCustomerId })
          .from(baseAlphaSubscriptions)
          .where(
            ctx.user.email
              ? or(
                  eq(baseAlphaSubscriptions.userId, ctx.user.id),
                  eq(baseAlphaSubscriptions.customerEmail, ctx.user.email)
                )
              : eq(baseAlphaSubscriptions.userId, ctx.user.id)
          )
          .orderBy(desc(baseAlphaSubscriptions.createdAt))
          .limit(1);
        customerId = results[0]?.stripeCustomerId ?? null;
      } else if (input.email) {
        const results = await db
          .select({ stripeCustomerId: baseAlphaSubscriptions.stripeCustomerId })
          .from(baseAlphaSubscriptions)
          .where(eq(baseAlphaSubscriptions.customerEmail, input.email))
          .orderBy(desc(baseAlphaSubscriptions.createdAt))
          .limit(1);
        customerId = results[0]?.stripeCustomerId ?? null;
      }

      if (!customerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Nessun abbonamento trovato per questo account." });
      }

      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${input.origin}/abbonamenti`,
      });

      return { portalUrl: session.url };
    }),
});
