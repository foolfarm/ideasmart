import { describe, it, expect } from "vitest";
import { buildFullNewsletterHtml } from "./email";

describe("Newsletter branding per canale", () => {
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
    unsubscribeUrl: "https://ideasmart.ai/unsubscribe",
    isTest: true,
  };

  it("AI News: header con sfondo navy e accento teal", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "AI News",
      frequencyLabel: "Ogni lunedì · Intelligenza Artificiale per il Business",
    });

    // Header sfondo navy scuro (#0a1628)
    expect(html).toContain("background:#0a1628");
    // Accento teal (#00b4a0)
    expect(html).toContain("color:#00b4a0");
    // Badge canale
    expect(html).toContain("AI News");
    // Sottotitolo specifico
    expect(html).toContain("Intelligenza Artificiale per il Business");
    // Banner test
    expect(html).toContain("EMAIL DI PROVA");
  });

  it("Startup News: header con sfondo scuro e accento arancio", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "Startup News",
      frequencyLabel: "Ogni mercoledì · Startup, Innovazione e Venture Capital",
    });

    // Header sfondo scuro (#1a0800)
    expect(html).toContain("background:#1a0800");
    // Accento arancio (#e84f00)
    expect(html).toContain("color:#e84f00");
    // Badge canale
    expect(html).toContain("Startup News");
    // Sottotitolo specifico
    expect(html).toContain("Startup, Innovazione e Venture Capital");
  });

  it("DEALROOM News: header con sfondo nero e accento gold", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
      channelName: "DEALROOM News",
      frequencyLabel: "Ogni venerdì · Round, Funding, VC, M&A",
    });

    // Header sfondo nero (#0f0f0f)
    expect(html).toContain("background:#0f0f0f");
    // Accento gold (#c8a200)
    expect(html).toContain("color:#c8a200");
    // Badge canale
    expect(html).toContain("DEALROOM News");
    // Sottotitolo specifico
    expect(html).toContain("Round, Funding, VC, M&amp;A");
  });

  it("Senza channelName: usa tema AI News come default", () => {
    const html = buildFullNewsletterHtml({
      ...baseOpts,
    });

    // Deve usare il tema AI News come default
    expect(html).toContain("background:#0a1628");
    expect(html).toContain("color:#00b4a0");
  });

  it("Ogni canale ha una barra accento colorata", () => {
    const aiHtml = buildFullNewsletterHtml({ ...baseOpts, channelName: "AI News" });
    const startupHtml = buildFullNewsletterHtml({ ...baseOpts, channelName: "Startup News" });
    const dealroomHtml = buildFullNewsletterHtml({ ...baseOpts, channelName: "DEALROOM News" });

    // Barra accento teal per AI
    expect(aiHtml).toContain("height:4px;background:#00b4a0");
    // Barra accento arancio per Startup
    expect(startupHtml).toContain("height:4px;background:#e84f00");
    // Barra accento gold per DEALROOM
    expect(dealroomHtml).toContain("height:4px;background:#c8a200");
  });
});
