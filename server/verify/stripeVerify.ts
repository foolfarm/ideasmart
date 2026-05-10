/**
 * ProofPress Verify SaaS — Stripe Integration
 *
 * Gestisce il checkout Stripe per i 4 piani Verify:
 *   Essential     — 100 articoli/mese  — €490/mese
 *   Premiere      — 300 articoli/mese  — €990/mese
 *   Professional  — 500 articoli/mese  — €1.470/mese
 *   Custom        — illimitato         — su preventivo (contatto diretto)
 *
 * Webhook: /api/stripe/verify/webhook
 *   - checkout.session.completed → attiva subscription
 *   - customer.subscription.deleted → cancella subscription
 *   - invoice.payment_failed → sospende subscription
 */

import Stripe from "stripe";
import { z } from "zod";
import { eq, and, lte, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  verifyOrganizations,
  verifySubscriptions,
  type InsertVerifySubscription,
} from "../../drizzle/schema";

// ── Stripe client ─────────────────────────────────────────────────────────────
function getStripe(): Stripe {
  const key = process.env.FOOLFARM_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

// ── Piani Verify — prezzi in centesimi di euro ────────────────────────────────
export const VERIFY_PLANS = {
  essential: {
    name: "Essential",
    description: "100 articoli verificati al mese. Ideale per testate piccole e blog.",
    priceMonthly: 49000, // €490 in centesimi
    articlesLimit: 100,
    journalistSeats: 2,
    features: [
      "100 articoli/mese",
      "2 account giornalista",
      "Verification Report PDF",
      "Hash crittografico immutabile",
      "API REST (ppv_live_...)",
      "Dashboard analytics base",
    ],
  },
  premiere: {
    name: "Premiere",
    description: "300 articoli verificati al mese. Per redazioni medie e agenzie stampa.",
    priceMonthly: 99000, // €990 in centesimi
    articlesLimit: 300,
    journalistSeats: 5,
    features: [
      "300 articoli/mese",
      "5 account giornalista",
      "Verification Report PDF",
      "Hash crittografico immutabile",
      "API REST (ppv_live_...)",
      "Dashboard analytics avanzata",
      "Badge ProofPress Verified sul sito",
      "Supporto email prioritario",
    ],
  },
  professional: {
    name: "Professional",
    description: "500 articoli verificati al mese. Per grandi testate e gruppi editoriali.",
    priceMonthly: 147000, // €1.470 in centesimi
    articlesLimit: 500,
    journalistSeats: 10,
    features: [
      "500 articoli/mese",
      "10 account giornalista",
      "Verification Report PDF",
      "Hash crittografico immutabile",
      "API REST (ppv_live_...)",
      "Dashboard analytics avanzata",
      "Badge ProofPress Verified sul sito",
      "White-label report opzionale",
      "Supporto dedicato (Slack/email)",
      "SLA 99.5% uptime",
    ],
  },
} as const;

export type VerifyPlanKey = keyof typeof VERIFY_PLANS;

// ── Helper: trova o crea un'organizzazione per l'utente ───────────────────────
async function getOrCreateOrg(email: string, name: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  const [existing] = await db
    .select()
    .from(verifyOrganizations)
    .where(eq(verifyOrganizations.contactEmail, email))
    .limit(1);

  if (existing) return existing;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 128);

  const [result] = await db
    .insert(verifyOrganizations)
    .values({
      name,
      slug,
      contactEmail: email,
      plan: "essential",
      status: "trial",
    })
    .$returningId();

  const [org] = await db
    .select()
    .from(verifyOrganizations)
    .where(eq(verifyOrganizations.id, result.id))
    .limit(1);

  return org;
}

// ── tRPC Router ───────────────────────────────────────────────────────────────
export const verifyStripeRouter = router({
  /**
   * Crea una sessione Stripe Checkout per il piano selezionato.
   * Restituisce l'URL di checkout da aprire in nuova scheda.
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["essential", "premiere", "professional"]),
        orgName: z.string().min(2).max(255).optional(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const plan = VERIFY_PLANS[input.plan];

      // Crea o recupera l'organizzazione
      const orgName = input.orgName || ctx.user.name || ctx.user.email || "Organizzazione";
      const org = await getOrCreateOrg(ctx.user.email || "", orgName);

      // Crea o recupera il customer Stripe
      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            organizationId: String(org.id),
            userId: String(ctx.user.id),
          },
        });
        customerId = customer.id;

        const db = await getDb();
        if (db) {
          await db
            .update(verifyOrganizations)
            .set({ stripeCustomerId: customerId })
            .where(eq(verifyOrganizations.id, org.id));
        }
      }

      // Crea il prezzo on-the-fly (recurring mensile)
      const price = await stripe.prices.create({
        currency: "eur",
        unit_amount: plan.priceMonthly,
        recurring: { interval: "month" },
        product_data: {
          name: `ProofPress Verify — ${plan.name}`,
          metadata: { plan: input.plan },
        },
      });

      // Crea la sessione checkout
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        customer_email: customerId ? undefined : (ctx.user.email || undefined),
        line_items: [{ price: price.id, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${input.origin}/verify/dashboard?checkout=success&plan=${input.plan}`,
        cancel_url: `${input.origin}/verify-pricing?checkout=cancelled`,
        client_reference_id: String(ctx.user.id),
        metadata: {
          organizationId: String(org.id),
          userId: String(ctx.user.id),
          plan: input.plan,
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
        subscription_data: {
          metadata: {
            organizationId: String(org.id),
            plan: input.plan,
          },
        },
      });

      return { checkoutUrl: session.url };
    }),

  /**
   * Restituisce i piani disponibili con prezzi e features.
   */
  getPlans: protectedProcedure.query(() => {
    return Object.entries(VERIFY_PLANS).map(([key, plan]) => ({
      key,
      ...plan,
    }));
  }),

  /**
   * Stato attuale della subscription dell'organizzazione dell'utente.
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [org] = await db
      .select()
      .from(verifyOrganizations)
      .where(eq(verifyOrganizations.contactEmail, ctx.user.email || ""))
      .limit(1);

    if (!org) return { hasOrg: false, subscription: null, org: null };

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
      .limit(1);

    return {
      hasOrg: true,
      org: {
        id: org.id,
        name: org.name,
        plan: org.plan,
        status: org.status,
        trialEndsAt: org.trialEndsAt,
      },
      subscription: sub
        ? {
            plan: sub.plan,
            status: sub.status,
            articlesUsed: sub.articlesUsed,
            articlesLimit: sub.articlesLimit,
            periodEnd: sub.periodEnd,
          }
        : null,
    };
  }),
});

// ── Webhook handler (Express) ─────────────────────────────────────────────────
import type { Express, Request, Response } from "express";

export function registerVerifyStripeWebhook(app: Express) {
  // IMPORTANTE: raw body parser PRIMA di express.json() per la verifica firma
  app.post(
    "/api/stripe/verify/webhook",
    // express.raw è già applicato globalmente prima di express.json in index.ts
    async (req: Request, res: Response) => {
      const stripe = getStripe();
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.FOOLFARM_STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          (req as any).rawBody || req.body,
          sig,
          webhookSecret || ""
        );
      } catch (err) {
        console.error("[VerifyStripe] Webhook signature verification failed:", err);
        return res.status(400).json({ error: "Webhook signature invalid" });
      }

      // Test event — risponde subito per la verifica
      if (event.id.startsWith("evt_test_")) {
        console.log("[VerifyStripe] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[VerifyStripe] Webhook ricevuto: ${event.type} | ${event.id}`);

      try {
        const db = await getDb();
        if (!db) return res.status(503).json({ error: "DB non disponibile" });

        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const orgId = parseInt(session.metadata?.organizationId || "0", 10);
            const plan = (session.metadata?.plan || "essential") as VerifyPlanKey;
            const stripeSubId = session.subscription as string;

            if (!orgId || !stripeSubId) break;

            const planData = VERIFY_PLANS[plan];
            const now = new Date();
            const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            // Aggiorna organizzazione
            await db
              .update(verifyOrganizations)
              .set({ plan, status: "active", stripeCustomerId: session.customer as string })
              .where(eq(verifyOrganizations.id, orgId));

            // Crea subscription attiva
            const subData: InsertVerifySubscription = {
              organizationId: orgId,
              plan,
              articlesLimit: planData.articlesLimit,
              journalistSeats: planData.journalistSeats,
              articlesUsed: 0,
              periodStart: now,
              periodEnd,
              stripeSubscriptionId: stripeSubId,
              stripeStatus: "active",
              priceMonthly: planData.priceMonthly,
              currency: "EUR",
              status: "active",
            };
            await db.insert(verifySubscriptions).values(subData);

            console.log(`[VerifyStripe] ✅ Subscription attivata: org ${orgId} | piano ${plan}`);
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const orgId = parseInt(sub.metadata?.organizationId || "0", 10);
            if (!orgId) break;

            await db
              .update(verifyOrganizations)
              .set({ status: "cancelled" })
              .where(eq(verifyOrganizations.id, orgId));

            await db
              .update(verifySubscriptions)
              .set({ status: "cancelled", cancelledAt: new Date(), stripeStatus: "cancelled" })
              .where(eq(verifySubscriptions.stripeSubscriptionId, sub.id));

            console.log(`[VerifyStripe] ⛔ Subscription cancellata: org ${orgId}`);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const subId = (invoice as any).subscription as string;
            if (!subId) break;

            await db
              .update(verifySubscriptions)
              .set({ status: "past_due", stripeStatus: "past_due" })
              .where(eq(verifySubscriptions.stripeSubscriptionId, subId));

            console.log(`[VerifyStripe] ⚠️ Pagamento fallito per subscription: ${subId}`);
            break;
          }

          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            const subId = (invoice as any).subscription as string;
            if (!subId) break;

            // Rinnovo mensile: resetta il contatore articoli
            const now = new Date();
            const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            await db
              .update(verifySubscriptions)
              .set({
                status: "active",
                stripeStatus: "active",
                articlesUsed: 0,
                periodStart: now,
                periodEnd,
              })
              .where(eq(verifySubscriptions.stripeSubscriptionId, subId));

            console.log(`[VerifyStripe] ✅ Rinnovo mensile: subscription ${subId} | contatore reset`);
            break;
          }
        }
      } catch (err) {
        console.error("[VerifyStripe] Errore elaborazione webhook:", err);
        return res.status(500).json({ error: "Errore interno" });
      }

      return res.json({ received: true });
    }
  );

  console.log("[VerifyStripe] ✅ Webhook registrato: POST /api/stripe/verify/webhook");
}
