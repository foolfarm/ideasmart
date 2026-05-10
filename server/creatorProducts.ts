/**
 * ProofPress Creator — Prodotti e Prezzi Stripe LIVE
 * Aggiornato il 10/05/2026 — 3 tier: Starter / Publisher / Gold
 * Account Stripe: live (livemode: true)
 *
 * Prodotti Stripe live:
 *  - Starter   → prod_UUclVWL9kq962f  price_1TVdVcQQVoHT3i87dulfL8wG  (€199/mese)
 *  - Publisher → prod_UUclBVy9uyAuOB  price_1TVdVmQQVoHT3i87ZCgPW0zC  (€449/mese)
 *  - Gold      → prod_UUcl7VD2FkDgxp  price_1TVdVyQQVoHT3i87tVsDAhpK  (€899/mese)
 */
export const CREATOR_PLANS = {
  starter: {
    id: "creator_starter",
    name: "ProofPress Creator Starter",
    badge: "STARTER",
    tagline: "Valida il tuo primo verticale",
    target: "Creator, consulenti, PMI che vogliono testare il modello editoriale AI.",
    priceLabel: "€199",
    priceSubLabel: "/mese",
    priceMonthly: 19900,
    stripePriceId: "price_1TVdVcQQVoHT3i87dulfL8wG",
    stripeProductId: "prod_UUclVWL9kq962f",
    highlight: false,
    verticali: 1,
    articoliMese: 30,
    features: [
      "1 verticale tematico",
      "Setup editoriale (fonti + redazione agentica)",
      "Setup sul tuo dominio",
      "Pubblicazione automatica",
      "Dashboard analytics",
      "Supporto onboarding",
      "Fino a 30 articoli/mese",
    ],
  },
  publisher: {
    id: "creator_publisher",
    name: "ProofPress Creator Publisher",
    badge: "MOST POPULAR",
    tagline: "Costruisci un giornale AI multi-verticale",
    target: "Brand, agenzie, editori indipendenti che vogliono presidiare più temi correlati.",
    priceLabel: "€449",
    priceSubLabel: "/mese",
    priceMonthly: 44900,
    stripePriceId: "price_1TVdVmQQVoHT3i87ZCgPW0zC",
    stripeProductId: "prod_UUclBVy9uyAuOB",
    highlight: true,
    verticali: 3,
    articoliMese: 120,
    features: [
      "Tutto Starter, più:",
      "3 verticali tematici",
      "Cross-linking automatico tra verticali (SEO topical authority)",
      "SEO Engine avanzato (keyword clustering, schema markup)",
      "Scheduling editoriale (pubblicazione per fascia oraria)",
      "A/B testing su headline e meta description",
      "Dashboard analytics avanzata",
      "Sistema di rotazione banner integrato (monetizzazione diretta)",
      "Fino a 120 articoli/mese",
      "Supporto prioritario",
    ],
  },
  gold: {
    id: "creator_gold",
    name: "ProofPress Creator Gold",
    badge: "PREMIUM",
    tagline: "La redazione AI completa",
    target: "Editori verticali, corporate communication, performance marketing.",
    priceLabel: "€899",
    priceSubLabel: "/mese",
    priceMonthly: 89900,
    stripePriceId: "price_1TVdVyQQVoHT3i87tVsDAhpK",
    stripeProductId: "prod_UUcl7VD2FkDgxp",
    highlight: false,
    verticali: 6,
    articoliMese: 1200,
    features: [
      "Tutto Publisher, più:",
      "6 verticali tematici",
      "Newsletter automation (digest per verticale, segmentazione)",
      "Fino a 1.200 articoli/mese",
    ],
  },
} as const;
export type CreatorPlanId = keyof typeof CREATOR_PLANS;
