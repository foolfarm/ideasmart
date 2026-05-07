/**
 * Base Alpha + — Prodotti e Prezzi Stripe
 * Creati il 07/05/2026 via MCP Stripe
 */

export const BASE_ALPHA_PLANS = {
  weekly: {
    id: "weekly",
    name: "Weekly Brief",
    badge: "ENTRY",
    freq: "Settimanale",
    priceLabel: "€199",
    priceSubLabel: "/mese",
    priceMonthly: 19900, // centesimi
    stripePriceId: "price_1TUM9eQQVoHT3i87NHxq9nPg",
    stripeProductId: "prod_UTIkZPX7V5iWuq",
    highlight: false,
    features: [
      "1 settore verticale",
      "Report settimanale certificato PPV",
      "Top 10 segnali pre-pubblici",
      "Trend analysis + Key takeaway",
      "Archivio 3 mesi",
    ],
  },
  monthly: {
    id: "monthly",
    name: "Monthly Intelligence",
    badge: "MOST POPULAR",
    freq: "Mensile",
    priceLabel: "€299",
    priceSubLabel: "/mese",
    priceMonthly: 29900,
    stripePriceId: "price_1TUM9lQQVoHT3i87LGdZ9Fms",
    stripeProductId: "prod_UTIkcgE6rBwyRG",
    highlight: true,
    features: [
      "2 settori verticali",
      "Report mensile certificato PPV",
      "Analisi pre-pubblica 4.000+ fonti",
      "Mappa attori & deal flow",
      "Outlook strategico 90 giorni",
      "Archivio 12 mesi",
      "1 call di briefing mensile",
    ],
  },
  quarterly: {
    id: "quarterly",
    name: "Quarterly Deep Dive",
    badge: "PREMIUM",
    freq: "Trimestrale",
    priceLabel: "€499",
    priceSubLabel: "/mese",
    priceMonthly: 49900,
    stripePriceId: "price_1TUM9rQQVoHT3i87DgTbN3vP",
    stripeProductId: "prod_UTIlGU7WREADmx",
    highlight: false,
    features: [
      "Settori verticali illimitati",
      "Report trimestrale certificato PPV",
      "Ricerca pre-pubblica dedicata",
      "Benchmark competitivo personalizzato",
      "Scenari strategici + raccomandazioni",
      "Archivio completo",
      "Sessioni di briefing dedicate",
      "Accesso diretto al team di analisti",
    ],
  },
} as const;

export type BaseAlphaPlanId = keyof typeof BASE_ALPHA_PLANS;
