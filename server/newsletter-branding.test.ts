import { describe, it, expect } from "vitest";
import { buildFullNewsletterHtml } from "./email";

describe("Newsletter — nuovo design allineato al sito", () => {
  const baseOpts = {
    dateLabel: "lunedì 30 marzo 2026",
    news: [
      { title: "Test News 1", summary: "Summary 1", category: "AI Generativa" },
      { title: "Test News 2", summary: "Summary 2", category: "Startup & Funding" },
    ],
    reportages: [],
    analyses: [],
    researches: [
      { id: 1, title: "Research 1", summary: "Summary", category: "ai_trends", source: "Gartner", isResearchOfDay: true },
    ],
    unsubscribeUrl: "https://ideasmart.biz/unsubscribe",
    isTest: true,
  };

  it("Usa font system-ui / SF Pro (non Georgia/serif)", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    // Font stack SF Pro / system-ui
    expect(html).toContain("-apple-system");
    expect(html).toContain("system-ui");
    // Non deve usare il vecchio font Georgia come font principale del body
    expect(html).not.toMatch(/body style="[^"]*font-family:[^"]*Georgia/);
  });

  it("Header IDEASMART grande in nero su sfondo bianco (come il sito)", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    // IDEASMART in nero (#1a1a1a) su sfondo bianco
    expect(html).toContain("font-size:48px");
    expect(html).toContain("color:#1a1a1a");
    // Sottotitolo del sito
    expect(html).toContain("Intelligence Quotidiana su AI, Startup e Venture Capital");
  });

  it("Barra canali con tab (AI NEWS, STARTUP NEWS, RICERCHE, DEALROOM)", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    expect(html).toContain("AI NEWS</a>");
    expect(html).toContain("STARTUP NEWS</a>");
    expect(html).toContain("RICERCHE</a>");
    expect(html).toContain("DEALROOM</a>");
  });

  it("Badge VERIFY — 400+ fonti certificate", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    expect(html).toContain("VERIFY");
    expect(html).toContain("400 fonti");
    expect(html).toContain("Informazioni certificate");
  });

  it("AI News: badge canale e sottotitolo corretti", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
      frequencyLabel: "Ogni lunedì · Intelligenza Artificiale per il Business",
    });

    expect(html).toContain("AI NEWS");
    expect(html).toContain("Intelligenza Artificiale per il Business");
    expect(html).toContain("EMAIL DI PROVA");
  });

  it("Startup News: badge canale e sottotitolo corretti", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "Startup News",
      frequencyLabel: "Ogni mercoledì · Startup, Innovazione e Venture Capital",
    });

    expect(html).toContain("STARTUP NEWS");
    expect(html).toContain("Startup, Innovazione e Venture Capital");
  });

  it("DEALROOM News: badge canale e sottotitolo corretti", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "DEALROOM News",
      frequencyLabel: "Ogni venerdì · Round, Funding, VC, M&A",
    });

    expect(html).toContain("DEALROOM");
    expect(html).toContain("Round, Funding, VC, M&amp;A");
  });

  it("Banner promo con sfondo nero e CTA bianco", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    // Banner promo con sfondo nero
    expect(html).toContain("background:#1a1a1a");
    // CTA "Iscriviti ora"
    expect(html).toContain("Iscriviti ora");
  });

  it("Footer con GDPR e link gestione canali", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    expect(html).toContain("GDPR");
    expect(html).toContain("Gestisci canali");
    expect(html).toContain("Annulla iscrizione");
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("ideasmart.biz");
  });

  it("Sezione ricerche con badge nero e stile chiaro (non dark)", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    // Ricerche del Giorno presente
    expect(html).toContain("Ricerche del Giorno");
    expect(html).toContain("IDEASMART RESEARCH");
    // Badge categoria in nero su bianco
    expect(html).toContain("AI TRENDS");
    // Link alla ricerca
    expect(html).toContain("LEGGI LA RICERCA COMPLETA");
  });

  it("Senza channelName: usa tema AI News come default", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
    });

    // Deve comunque avere il design del sito
    expect(html).toContain("IDEASMART");
    expect(html).toContain("Intelligence Quotidiana");
  });

  it("Barra inferiore nera (non teal)", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
    });

    // Bottom bar nero
    expect(html).toContain("background:#1a1a1a;padding:0;height:3px");
  });
});
