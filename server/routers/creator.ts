/**
 * ProofPress Creator — Router tRPC
 * Gestisce checkout Stripe per i 3 piani: Basic (€199), Plus (€299), Gold (€399)
 * Webhook condiviso con base-alpha: /api/stripe/base-alpha-webhook
 */
import Stripe from "stripe";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { CREATOR_PLANS, type CreatorPlanId } from "../creatorProducts";

// ── Stripe client ─────────────────────────────────────────────────────────────
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

// ── Router ────────────────────────────────────────────────────────────────────
export const creatorRouter = router({
  /**
   * Restituisce i piani Creator con prezzi (usato dalla UI)
   */
  getPlans: publicProcedure.query(() => {
    return Object.values(CREATOR_PLANS).map((p) => ({
      id: p.id,
      name: p.name,
      badge: p.badge,
      tagline: p.tagline,
      priceLabel: p.priceLabel,
      priceSubLabel: p.priceSubLabel,
      highlight: p.highlight,
      verticali: p.verticali,
      features: [...p.features],
    }));
  }),

  /**
   * Crea una Stripe Checkout Session per il piano Creator selezionato.
   * Accessibile senza autenticazione: Stripe gestisce l'identità nel proprio checkout.
   */
  createCheckout: publicProcedure
    .input(z.object({
      planId: z.enum(["creator_starter", "creator_publisher", "creator_gold"]),
      origin: z.string().url(),
      customerEmail: z.string().email().optional(),
      customerName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const planKey = input.planId.replace("creator_", "") as CreatorPlanId;
      const plan = CREATOR_PLANS[planKey];
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
              metadata: { source: "proofpress_creator" },
            });
            customerId = customer.id;
          }
        } catch (_) {
          // Continua senza customer pre-creato
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
        cancel_url: `${input.origin}/offertacommerciale?checkout=cancelled`,
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          source: "proofpress_creator",
        },
        subscription_data: {
          metadata: {
            plan_id: plan.id,
            source: "proofpress_creator",
          },
        },
      });

      return { checkoutUrl: session.url };
    }),
});
