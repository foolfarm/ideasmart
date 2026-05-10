/**
 * ProofPress Creator — Prodotti e Prezzi Stripe
 * Dual-mode: seleziona automaticamente test o live in base alla STRIPE_SECRET_KEY
 *
 * TEST (sk_test_51THUSk... — account FoolFarm sandbox):
 *  - Starter   → prod_UUe8q99rq4Phpq  price_1TVeqf8CvMSliYUFZVTZDl9R  (€199/mese)
 *  - Publisher → prod_UUe8wmELhNaDAL  price_1TVeqh8CvMSliYUF91KzTI5K  (€449/mese)
 *  - Gold      → prod_UUe9uWTGK4VR1U  price_1TVeqi8CvMSliYUFoQ7IZXVQ  (€899/mese)
 *
 * LIVE (sk_org_live_... — account proofpress):
 *  - Starter   → prod_UUdmDVofzqrKdN  price_1TVeUYKyMu3K72gZaPCXOh6u  (€199/mese)
 *  - Publisher → prod_UUdmqJJtsNO5MB  price_1TVeUhKyMu3K72gZXVJSIhyC  (€449/mese)
 *  - Gold      → prod_UUdm1fz2lGAedz  price_1TVeUpKyMu3K72gZ4AAOXFwg  (€899/mese)
 */

const isLive = (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live") ||
               (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_org_live");

const PRICES = {
  starter: {
    priceId: isLive ? "price_1TVeUYKyMu3K72gZaPCXOh6u" : "price_1TVeqf8CvMSliYUFZVTZDl9R",
    productId: isLive ? "prod_UUdmDVofzqrKdN" : "prod_UUe8q99rq4Phpq",
  },
  publisher: {
    priceId: isLive ? "price_1TVeUhKyMu3K72gZXVJSIhyC" : "price_1TVeqh8CvMSliYUF91KzTI5K",
    productId: isLive ? "prod_UUdmqJJtsNO5MB" : "prod_UUe8wmELhNaDAL",
  },
  gold: {
    priceId: isLive ? "price_1TVeUpKyMu3K72gZ4AAOXFwg" : "price_1TVeqi8CvMSliYUFoQ7IZXVQ",
    productId: isLive ? "prod_UUdm1fz2lGAedz" : "prod_UUe9uWTGK4VR1U",
  },
};

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
    stripePriceId: PRICES.starter.priceId,
    stripeProductId: PRICES.starter.productId,
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
    stripePriceId: PRICES.publisher.priceId,
    stripeProductId: PRICES.publisher.productId,
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
    stripePriceId: PRICES.gold.priceId,
    stripeProductId: PRICES.gold.productId,
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
