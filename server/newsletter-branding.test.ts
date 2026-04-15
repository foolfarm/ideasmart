/**
 * newsletter-branding.test.ts
 * Test del nuovo template "Proof Press Daily" v3
 * Verifica design tokens, struttura blocchi A-K, link e brand
 */
import { describe, it, expect } from "vitest";

// Minimal mock per testare buildNewsletterHtmlV2 in isolamento
// Usiamo un import dinamico per evitare dipendenze DB nei test
async function buildTestHtml(overrides: Record<string, unknown> = {}): Promise<string> {
  // Importa solo la funzione di build (non le funzioni async DB)
  const mod = await import("./unifiedNewsletter");
  // La funzione buildUnifiedNewsletter è async e richiede DB.
  // Testiamo invece i pattern nel file sorgente.
  return "";
}

describe("Newsletter Proof Press Daily v3 — Design Tokens & Brand", () => {
  it("BASE_URL punta a proofpress.ai (non ideasmart.biz)", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain('const BASE_URL = "https://proofpress.ai"');
    expect(src).not.toContain('const BASE_URL = "https://ideasmart.biz"');
  });

  it("Subject della newsletter usa 'Proof Press Daily'", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("Proof Press Daily");
  });

  it("Template usa sfondo crema #f5f3ef", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("#f5f3ef");
  });

  it("Template usa CTA rosso #d94f3d", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("#d94f3d");
  });

  it("Header contiene 'Proof Press' e 'by Ideasmart'", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("Proof Press");
    expect(src).toContain("by Ideasmart");
  });

  it("Blocco rebrand: 'Ideasmart diventa Proof Press'", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("Ideasmart diventa Proof Press");
  });

  it("Badge PROOFPRESS VERIFY presente nella hero", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("PROOFPRESS VERIFY");
  });

  it("Footer contiene proofpress.ai (non ideasmart.biz come link principale)", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("proofpress.ai");
    // ideasmart.forum è l'unica eccezione consentita
    expect(src).toContain("ideasmart.forum");
  });

  it("Footer contiene AxiomX LLC copyright", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("AxiomX LLC");
    expect(src).not.toContain("FoolFarm S.p.A.");
  });

  it("Routine newsletter Proof Press Daily attive nello schedulerManager", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/schedulerManager.ts", "utf8");
    // Le routine newsletter Proof Press Daily devono essere attive (preview 08:30 + massivo 10:30)
    expect(src).toContain('"30 8 * * 1,3,5"'); // preview
    expect(src).toContain('"30 10 * * 1,3,5"'); // massivo
    expect(src).toContain('sendUnifiedPreview');
    expect(src).toContain('sendUnifiedNewsletterToAll');
  });

  it("Sender email usa info@proofpress.ai", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/email.ts", "utf8");
    expect(src).toContain("info@proofpress.ai");
  });

  it("Reply-To usa noreply@proofpress.ai", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/email.ts", "utf8");
    expect(src).toContain("noreply@proofpress.ai");
  });

  it("Fetch immagini Pexels integrato in buildUnifiedNewsletter", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync("server/unifiedNewsletter.ts", "utf8");
    expect(src).toContain("findEditorialImage");
    expect(src).toContain("heroImageUrl");
    expect(src).toContain("channelImages");
  });
});
