/**
 * Base Alpha + — Router tRPC
 * Gestisce checkout Stripe per i 3 piani: Weekly (€199), Monthly (€299), Quarterly (€499)
 * Webhook: /api/stripe/base-alpha/webhook
 */
import Stripe from "stripe";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { BASE_ALPHA_PLANS, type BaseAlphaPlanId } from "../baseAlphaProducts";

// ── Stripe client ─────────────────────────────────────────────────────────────
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

// ── Router ────────────────────────────────────────────────────────────────────
export const baseAlphaRouter = router({
  /**
   * Restituisce i piani con prezzi (usato dalla UI)
   */
  getPlans: publicProcedure.query(() => {
    return Object.values(BASE_ALPHA_PLANS).map((p) => ({
      id: p.id,
      name: p.name,
      badge: p.badge,
      freq: p.freq,
      priceLabel: p.priceLabel,
      priceSubLabel: p.priceSubLabel,
      highlight: p.highlight,
      features: [...p.features],
    }));
  }),

  /**
   * Crea una Stripe Checkout Session per il piano selezionato
   * Richiede autenticazione
   */
  createCheckout: protectedProcedure
    .input(z.object({
      planId: z.enum(["weekly", "monthly", "quarterly"]),
      origin: z.string().url(),
    }))
    .mutation(async ({ input, ctx }) => {
      const plan = BASE_ALPHA_PLANS[input.planId as BaseAlphaPlanId];
      if (!plan) throw new TRPCError({ code: "BAD_REQUEST", message: "Piano non valido" });

      const stripe = getStripe();

      // Crea o recupera il customer Stripe
      let customerId: string | undefined;
      try {
        const customers = await stripe.customers.list({ email: ctx.user.email ?? undefined, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id ?? undefined;
        } else {
          const customer = await stripe.customers.create({
            email: ctx.user.email ?? undefined,
            name: ctx.user.name ?? undefined,
            metadata: { userId: String(ctx.user.id), source: "base_alpha_plus" },
          });
          customerId = customer.id;
        }
      } catch (_) {
        // Continua senza customer pre-creato
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ...(customerId ? { customer: customerId } : { customer_email: ctx.user.email ?? undefined }),

        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${input.origin}/base-alpha?checkout=success&plan=${plan.id}`,
        cancel_url: `${input.origin}/base-alpha?checkout=cancelled`,
        // @ts-ignore - session.url può essere null ma gestiamo lato client
        client_reference_id: String(ctx.user.id),
        metadata: {
          user_id: String(ctx.user.id),
          customer_email: ctx.user.email,
          customer_name: ctx.user.name,
          plan_id: plan.id,
          plan_name: plan.name,
          source: "base_alpha_plus",
        },
        subscription_data: {
          metadata: {
            user_id: String(ctx.user.id),
            plan_id: plan.id,
            source: "base_alpha_plus",
          },
        },
      });

      return { checkoutUrl: session.url };
    }),
});
