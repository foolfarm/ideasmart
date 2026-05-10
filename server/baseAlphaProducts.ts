/**
 * Base Alpha + — Prodotti e Prezzi Stripe
 * Dual-mode: seleziona automaticamente test o live in base alla STRIPE_SECRET_KEY
 *
 * TEST (sk_test_51THUSk... — account FoolFarm sandbox):
 *  - Weekly Brief        → prod_UTJ3r1yoErZAfU  price_1TUMRU8CvMSliYUFLHE18MpI  (€199/mese)
 *  - Weekly Intelligence → prod_UTJ337B8MMjPN0  price_1TUMRX8CvMSliYUFzO6KbSt8  (€299/mese)
 *  - Weekly Deep Dive    → prod_UTJ3kfxhdKwCZB  price_1TUMRa8CvMSliYUFk7jWZjpg  (€499/mese)
 *
 * LIVE (sk_live_51P2GAEQ... — account FoolFarm live):
 *  - Weekly Brief        → prod_UTIkZPX7V5iWuq  price_1TUM9eQQVoHT3i87NHxq9nPg  (€199/mese)
 *  - Weekly Intelligence → prod_UTIkcgE6rBwyRG  price_1TUM9lQQVoHT3i87LGdZ9Fms  (€299/mese)
 *  - Weekly Deep Dive    → prod_UTIlGU7WREADmx  price_1TUM9rQQVoHT3i87DgTbN3vP  (€499/mese)
 */

const isLive = (process.env.FOOLFARM_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live") ||
               (process.env.FOOLFARM_STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_org_live");

const PRICES = {
  brief: {
    priceId: isLive ? "price_1TUM9eQQVoHT3i87NHxq9nPg" : "price_1TUMRU8CvMSliYUFLHE18MpI",
    productId: isLive ? "prod_UTIkZPX7V5iWuq" : "prod_UTJ3r1yoErZAfU",
  },
  intelligence: {
    priceId: isLive ? "price_1TUM9lQQVoHT3i87LGdZ9Fms" : "price_1TUMRX8CvMSliYUFzO6KbSt8",
    productId: isLive ? "prod_UTIkcgE6rBwyRG" : "prod_UTJ337B8MMjPN0",
  },
  deepdive: {
    priceId: isLive ? "price_1TUM9rQQVoHT3i87DgTbN3vP" : "price_1TUMRa8CvMSliYUFk7jWZjpg",
    productId: isLive ? "prod_UTIlGU7WREADmx" : "prod_UTJ3kfxhdKwCZB",
  },
};

export const BASE_ALPHA_PLANS = {
  "weekly-brief": {
    id: "weekly-brief",
    name: "Weekly Brief",
    badge: "ENTRY",
    freq: "Settimanale · 1 settore",
    priceLabel: "€199",
    priceSubLabel: "/mese",
    priceMonthly: 19900,
    stripePriceId: PRICES.brief.priceId,
    stripeProductId: PRICES.brief.productId,
    highlight: false,
    features: [
      "1 settore verticale a scelta",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici",
      "Trend analysis + Key takeaway",
      "Analisi pre-pubblica 4.000+ fonti",
      "Archivio 3 mesi",
    ],
  },
  "weekly-intelligence": {
    id: "weekly-intelligence",
    name: "Weekly Intelligence",
    badge: "MOST POPULAR",
    freq: "Settimanale · 2 settori",
    priceLabel: "€299",
    priceSubLabel: "/mese",
    priceMonthly: 29900,
    stripePriceId: PRICES.intelligence.priceId,
    stripeProductId: PRICES.intelligence.productId,
    highlight: true,
    features: [
      "2 settori verticali a scelta",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici per settore",
      "Trend analysis + Key takeaway",
      "Analisi pre-pubblica 4.000+ fonti",
      "Mappa attori & deal flow",
      "Archivio 6 mesi",
    ],
  },
  "weekly-deep-dive": {
    id: "weekly-deep-dive",
    name: "Weekly Deep Dive",
    badge: "PREMIUM",
    freq: "Settimanale · 3 settori",
    priceLabel: "€499",
    priceSubLabel: "/mese",
    priceMonthly: 49900,
    stripePriceId: PRICES.deepdive.priceId,
    stripeProductId: PRICES.deepdive.productId,
    highlight: false,
    features: [
      "3 settori verticali a scelta",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici per settore",
      "Trend analysis + Key takeaway",
      "Analisi pre-pubblica 4.000+ fonti",
      "Mappa attori & deal flow",
      "Outlook strategico 90 giorni",
      "Benchmark competitivo personalizzato",
      "Archivio completo",
      "1 call di briefing mensile",
    ],
  },
} as const;

export type BaseAlphaPlanId = keyof typeof BASE_ALPHA_PLANS;
