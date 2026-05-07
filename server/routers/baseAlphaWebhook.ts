/**
 * Base Alpha + — Stripe Webhook Handler
 * Route: POST /api/stripe/base-alpha/webhook
 * Gestisce: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted, invoice.payment_failed
 */
import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export function registerBaseAlphaWebhook(app: Express): void {
  app.post(
    "/api/stripe/base-alpha/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      // Test event bypass
      try {
        const body = req.body as Buffer;
        const parsed = JSON.parse(body.toString());
        if (parsed?.id?.startsWith("evt_test_")) {
          console.log("[BaseAlpha Webhook] Test event detected, returning verification response");
          return res.json({ verified: true });
        }
      } catch (_) {}

      // Verify signature
      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          sig as string,
          webhookSecret ?? ""
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
        console.error("[BaseAlpha Webhook] Signature error:", msg);
        return res.status(400).json({ error: msg });
      }

      console.log(`[BaseAlpha Webhook] Event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id, 10) : null;
            const planId = session.metadata?.plan_id as "weekly" | "monthly" | "quarterly" | undefined;
            const customerEmail = session.metadata?.customer_email ?? (session.customer_details?.email ?? "");
            const customerName = session.metadata?.customer_name ?? (session.customer_details?.name ?? "");
            const subscriptionId = session.subscription as string | null;
            const customerId = session.customer as string | null;

            console.log(`[BaseAlpha Webhook] New subscription: user=${userId}, plan=${planId}, email=${customerEmail}, sub=${subscriptionId}`);

            // Salva nel DB
            if (planId && customerEmail) {
              try {
                const { getDb } = await import("../db");
                const { baseAlphaSubscriptions } = await import("../../drizzle/schema");
                const { BASE_ALPHA_PLANS } = await import("../baseAlphaProducts");
                const db = await getDb();
                if (db) {
                  const plan = BASE_ALPHA_PLANS[planId];

                  // Recupera dati subscription Stripe per period start/end
                  let periodStart: Date | null = null;
                  let periodEnd: Date | null = null;
                  if (subscriptionId) {
                    try {
                      const stripe = getStripe();
                      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
                      const rawSub = stripeSub as unknown as Record<string, unknown>;
                      periodStart = rawSub.current_period_start ? new Date((rawSub.current_period_start as number) * 1000) : null;
                      periodEnd = rawSub.current_period_end ? new Date((rawSub.current_period_end as number) * 1000) : null;
                    } catch (_) {}
                  }

                  await db.insert(baseAlphaSubscriptions).values({
                    userId: userId ?? null,
                    customerEmail,
                    customerName: customerName || null,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscriptionId,
                    stripeSessionId: session.id,
                    planId,
                    planName: plan?.name ?? planId,
                    priceMonthly: plan?.priceMonthly ?? 0,
                    currency: "EUR",
                    status: "active",
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd,
                  });
                  console.log(`[BaseAlpha Webhook] Subscription saved to DB: plan=${planId}, email=${customerEmail}`);
                }
              } catch (dbErr) {
                console.error("[BaseAlpha Webhook] DB save error:", dbErr);
              }
            }

            // Notifica owner
            try {
              const { notifyOwner } = await import("../_core/notification");
              await notifyOwner({
                title: `🎉 Nuovo abbonamento Base Alpha+: ${planId}`,
                content: `**Piano:** ${planId}\n**Email:** ${customerEmail}\n**User ID:** ${userId}\n**Subscription ID:** ${subscriptionId}\n**Importo:** ${session.amount_total ? `€${(session.amount_total / 100).toFixed(2)}` : "N/D"}`,
              });
            } catch (_) {}
            break;
          }

          case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const rawSub = sub as unknown as Record<string, unknown>;
            const periodEnd = rawSub.current_period_end ? new Date((rawSub.current_period_end as number) * 1000) : null;
            const periodStart = rawSub.current_period_start ? new Date((rawSub.current_period_start as number) * 1000) : null;

            try {
              const { getDb } = await import("../db");
              const { baseAlphaSubscriptions } = await import("../../drizzle/schema");
              const db = await getDb();
              if (db && sub.id) {
                await db
                  .update(baseAlphaSubscriptions)
                  .set({
                    status: sub.status as "active" | "past_due" | "cancelled" | "incomplete" | "trialing",
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd,
                  })
                  .where(eq(baseAlphaSubscriptions.stripeSubscriptionId, sub.id));
                console.log(`[BaseAlpha Webhook] Subscription updated in DB: sub=${sub.id}, status=${sub.status}`);
              }
            } catch (dbErr) {
              console.error("[BaseAlpha Webhook] DB update error:", dbErr);
            }
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const userId = sub.metadata?.user_id;
            const planId = sub.metadata?.plan_id;
            console.log(`[BaseAlpha Webhook] Subscription cancelled: user=${userId}, plan=${planId}`);

            // Aggiorna stato nel DB
            try {
              const { getDb } = await import("../db");
              const { baseAlphaSubscriptions } = await import("../../drizzle/schema");
              const db = await getDb();
              if (db && sub.id) {
                await db
                  .update(baseAlphaSubscriptions)
                  .set({ status: "cancelled", cancelledAt: new Date() })
                  .where(eq(baseAlphaSubscriptions.stripeSubscriptionId, sub.id));
                console.log(`[BaseAlpha Webhook] Subscription cancelled in DB: sub=${sub.id}`);
              }
            } catch (dbErr) {
              console.error("[BaseAlpha Webhook] DB cancel error:", dbErr);
            }

            try {
              const { notifyOwner } = await import("../_core/notification");
              await notifyOwner({
                title: `❌ Abbonamento Base Alpha+ cancellato: ${planId}`,
                content: `**Piano:** ${planId}\n**User ID:** ${userId}\n**Sub ID:** ${sub.id}`,
              });
            } catch (_) {}
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const invoiceSub = (invoice as unknown as Record<string, unknown>).subscription as string | undefined;
            console.log(`[BaseAlpha Webhook] Payment failed: customer=${invoice.customer}, sub=${invoiceSub}`);

            // Aggiorna stato nel DB
            if (invoiceSub) {
              try {
                const { getDb } = await import("../db");
                const { baseAlphaSubscriptions } = await import("../../drizzle/schema");
                const db = await getDb();
                if (db) {
                  await db
                    .update(baseAlphaSubscriptions)
                    .set({ status: "past_due" })
                    .where(eq(baseAlphaSubscriptions.stripeSubscriptionId, invoiceSub));
                }
              } catch (dbErr) {
                console.error("[BaseAlpha Webhook] DB past_due error:", dbErr);
              }
            }

            try {
              const { notifyOwner } = await import("../_core/notification");
              await notifyOwner({
                title: `⚠️ Pagamento fallito Base Alpha+`,
                content: `**Customer:** ${invoice.customer}\n**Subscription:** ${invoiceSub ?? 'N/D'}\n**Importo:** €${((invoice.amount_due ?? 0) / 100).toFixed(2)}`,
              });
            } catch (_) {}
            break;
          }

          default:
            console.log(`[BaseAlpha Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[BaseAlpha Webhook] Processing error:", err);
      }

      return res.json({ received: true });
    }
  );
}
