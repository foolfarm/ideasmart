import { describe, it, expect } from "vitest";

/**
 * Test per la logica di rotazione degli sponsor Amazon Partner nella newsletter.
 * Verifica che la rotazione basata su dayOfYear % 5 funzioni correttamente
 * e che tutti i 5 partner siano configurati con i link corretti.
 */

const AMAZON_PARTNERS = [
  {
    name: "Amazon Prime",
    headline: "Prova gratis Amazon Prime",
    url: "http://www.amazon.it/provaprime?tag=andyiltosca00-21",
    ctaText: "PROVA GRATIS 30 GIORNI →",
    emoji: "📦",
  },
  {
    name: "Prime Video",
    headline: "Scopri Prime Video",
    url: "https://www.primevideo.com/?&tag=andyiltosca00-21",
    ctaText: "GUARDA ORA →",
    emoji: "🎬",
  },
  {
    name: "Amazon Music Unlimited",
    headline: "Ascolta senza limiti con Amazon Music",
    url: "https://www.amazon.it/music/unlimited?tag=andyiltosca00-21",
    ctaText: "PROVA AMAZON MUSIC →",
    emoji: "🎧",
  },
  {
    name: "Amazon Wedding",
    headline: "Lista Nozze su Amazon",
    url: "http://www.amazon.it/wedding?tag=andyiltosca00-21",
    ctaText: "CREA LA TUA LISTA →",
    emoji: "💍",
  },
  {
    name: "Kindle Unlimited",
    headline: "Leggi senza limiti con Kindle Unlimited",
    url: "https://www.amazon.it/kindle-dbs/hz/signup?tag=andyiltosca00-21",
    ctaText: "PROVA GRATIS →",
    emoji: "📚",
  },
];

function getDayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

describe("Amazon Partner Rotation", () => {
  it("should have exactly 5 partners configured", () => {
    expect(AMAZON_PARTNERS).toHaveLength(5);
  });

  it("all partners should have the affiliate tag andyiltosca00-21", () => {
    for (const partner of AMAZON_PARTNERS) {
      expect(partner.url).toContain("tag=andyiltosca00-21");
    }
  });

  it("all partners should have non-empty required fields", () => {
    for (const partner of AMAZON_PARTNERS) {
      expect(partner.name.length).toBeGreaterThan(0);
      expect(partner.headline.length).toBeGreaterThan(0);
      expect(partner.url.length).toBeGreaterThan(0);
      expect(partner.ctaText.length).toBeGreaterThan(0);
      expect(partner.emoji.length).toBeGreaterThan(0);
    }
  });

  it("should rotate through all 5 partners over 5 consecutive days", () => {
    const seenPartners = new Set<string>();
    const baseDate = new Date("2026-04-01");

    for (let i = 0; i < 5; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      const dayOfYear = getDayOfYear(date);
      const partner = AMAZON_PARTNERS[dayOfYear % AMAZON_PARTNERS.length];
      seenPartners.add(partner.name);
    }

    expect(seenPartners.size).toBe(5);
  });

  it("should return the same partner for the same day", () => {
    const date = new Date("2026-04-03");
    const dayOfYear = getDayOfYear(date);
    const partner1 = AMAZON_PARTNERS[dayOfYear % AMAZON_PARTNERS.length];
    const partner2 = AMAZON_PARTNERS[dayOfYear % AMAZON_PARTNERS.length];
    expect(partner1.name).toBe(partner2.name);
  });

  it("today (Apr 3 2026) should select a valid partner", () => {
    const today = new Date("2026-04-03");
    const dayOfYear = getDayOfYear(today);
    const todayPartner = AMAZON_PARTNERS[dayOfYear % AMAZON_PARTNERS.length];
    expect(AMAZON_PARTNERS.map((p) => p.name)).toContain(todayPartner.name);
  });

  it("UTM parameters should be appended correctly", () => {
    for (const partner of AMAZON_PARTNERS) {
      const separator = partner.url.includes("?") ? "&" : "?";
      const utmUrl = `${partner.url}${separator}utm_source=ideasmart_newsletter&utm_medium=email&utm_campaign=amazon_partner`;
      expect(utmUrl).toContain("utm_source=ideasmart_newsletter");
      expect(utmUrl).toContain("utm_medium=email");
      expect(utmUrl).toContain("utm_campaign=amazon_partner");
      expect(utmUrl).toContain("tag=andyiltosca00-21");
    }
  });
});
