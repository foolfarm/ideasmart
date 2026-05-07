/**
 * ProofPress Creator — Prodotti e Prezzi Stripe
 * Creati il 07/05/2026 nell'account Stripe del server (acct_1THUSk8CvMSliYUF)
 * Basic €199/mese | Plus €299/mese | Gold €399/mese
 */
export const CREATOR_PLANS = {
  basic: {
    id: "creator_basic",
    name: "ProofPress Creator Basic",
    badge: "STARTER",
    tagline: "Lancia il tuo primo verticale",
    priceLabel: "€199",
    priceSubLabel: "/mese",
    priceMonthly: 19900, // centesimi
    stripePriceId: "price_1TUN288CvMSliYUFOzcoi4Pd",
    stripeProductId: "prod_UTJf8OJdoAqnMS",
    highlight: false,
    verticali: 1,
    features: [
      "1 Verticale Tematico",
      "Articoli giornalieri certificati ProofPress Verify™",
      "Pubblicazione automatica",
      "Newsletter settimanale",
      "Dashboard analytics",
      "Supporto onboarding",
    ],
  },
  plus: {
    id: "creator_plus",
    name: "ProofPress Creator Plus",
    badge: "MOST POPULAR",
    tagline: "Scala su 3 settori chiave",
    priceLabel: "€299",
    priceSubLabel: "/mese",
    priceMonthly: 29900,
    stripePriceId: "price_1TUN2E8CvMSliYUFx8m7YMyI",
    stripeProductId: "prod_UTJfYXz2FnNrDT",
    highlight: true,
    verticali: 3,
    features: [
      "3 Verticali Tematici",
      "Articoli giornalieri certificati ProofPress Verify™",
      "Pubblicazione automatica multi-verticale",
      "Newsletter settimanale per verticale",
      "Dashboard analytics avanzata",
      "Post social generati automaticamente",
      "Supporto prioritario",
    ],
  },
  gold: {
    id: "creator_gold",
    name: "ProofPress Creator Gold",
    badge: "PREMIUM",
    tagline: "La redazione AI completa",
    priceLabel: "€399",
    priceSubLabel: "/mese",
    priceMonthly: 39900,
    stripePriceId: "price_1TUN2J8CvMSliYUFgPcPfsgw",
    stripeProductId: "prod_UTJf2kr0zGT2op",
    highlight: false,
    verticali: 6,
    features: [
      "6 Verticali Tematici",
      "Articoli giornalieri certificati ProofPress Verify™",
      "Pubblicazione automatica multi-verticale",
      "Newsletter settimanale per verticale",
      "Dashboard analytics enterprise",
      "Post social generati automaticamente",
      "Report mensile di performance editoriale",
      "Account manager dedicato",
      "Accesso API ProofPress",
    ],
  },
} as const;

export type CreatorPlanId = keyof typeof CREATOR_PLANS;
