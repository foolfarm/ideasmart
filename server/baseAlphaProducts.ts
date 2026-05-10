/**
 * Base Alpha + — Prodotti e Prezzi Stripe
 * Aggiornato il 10/05/2026 — 3 tier Weekly (Brief / Intelligence / Deep Dive)
 * Account Stripe: acct_1THUSk8CvMSliYUF
 *
 * Prodotti Stripe riutilizzati (stessi priceId, nomi aggiornati via API):
 *  - Weekly Brief        → prod_UTJ3r1yoErZAfU  (€199/mese)
 *  - Weekly Intelligence → prod_UTJ337B8MMjPN0  (€299/mese, ex Monthly Intelligence)
 *  - Weekly Deep Dive    → prod_UTJ3kfxhdKwCZB  (€499/mese, ex Quarterly Deep Dive)
 */

export const BASE_ALPHA_PLANS = {
  "weekly-brief": {
    id: "weekly-brief",
    name: "Weekly Brief",
    badge: "ENTRY",
    freq: "Settimanale · 1 settore",
    priceLabel: "€199",
    priceSubLabel: "/mese",
    priceMonthly: 19900, // centesimi
    stripePriceId: "price_1TUMRU8CvMSliYUFLHE18MpI",
    stripeProductId: "prod_UTJ3r1yoErZAfU",
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
    stripePriceId: "price_1TUMRX8CvMSliYUFzO6KbSt8",
    stripeProductId: "prod_UTJ337B8MMjPN0",
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
    stripePriceId: "price_1TUMRa8CvMSliYUFk7jWZjpg",
    stripeProductId: "prod_UTJ3kfxhdKwCZB",
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
