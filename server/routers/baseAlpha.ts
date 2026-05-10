/**
 * Base Alpha + — Router tRPC
 * Gestisce checkout Stripe per i 3 piani: Weekly Brief (€199), Weekly Intelligence (€299), Weekly Deep Dive (€499)
 * Webhook: /api/stripe/base-alpha-webhook
 */
import Stripe from "stripe";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { BASE_ALPHA_PLANS, type BaseAlphaPlanId } from "../baseAlphaProducts";

// ── Stripe client ─────────────────────────────────────────────────────────────
function getStripe(): Stripe {
  const key = process.env.FOOLFARM_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
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
   * Crea una Stripe Checkout Session per il piano selezionato.
   * Accessibile senza autenticazione: Stripe gestisce l'identità nel proprio checkout.
   * L'email è opzionale — se fornita viene pre-compilata nel form Stripe.
   */
  createCheckout: publicProcedure
    .input(z.object({
      planId: z.enum(["weekly-brief", "weekly-intelligence", "weekly-deep-dive"]),
      origin: z.string().url(),
      customerEmail: z.string().email().optional(),
      customerName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const plan = BASE_ALPHA_PLANS[input.planId as BaseAlphaPlanId];
      if (!plan) throw new TRPCError({ code: "BAD_REQUEST", message: "Piano non valido" });

      const stripe = getStripe();

      // Se abbiamo l'email, proviamo a recuperare o creare il customer
      let customerId: string | undefined;
      if (input.customerEmail) {
        try {
          const customers = await stripe.customers.list({
            email: input.customerEmail,
            limit: 1,
          });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          } else {
            const customer = await stripe.customers.create({
              email: input.customerEmail,
              name: input.customerName,
              metadata: { source: "base_alpha_plus" },
            });
            customerId = customer.id;
          }
        } catch (_) {
          // Continua senza customer pre-creato — Stripe chiederà l'email nel checkout
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        ...(customerId
          ? { customer: customerId }
          : input.customerEmail
            ? { customer_email: input.customerEmail }
            : {}),
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${input.origin}/abbonamenti?checkout=success&plan=${plan.id}`,
        cancel_url: `${input.origin}/base-alpha?checkout=cancelled`,
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          source: "base_alpha_plus",
        },
        subscription_data: {
          metadata: {
            plan_id: plan.id,
            source: "base_alpha_plus",
          },
        },
      });

      return { checkoutUrl: session.url };
    }),
});
