/**
 * Test vitest per ProofPress Verify Client
 * Valida la chiave API PPV_API_KEY e il funzionamento del client
 */
import { describe, it, expect } from "vitest";
import { checkPpvStatus, certifyWithPpv } from "./proofpressVerifyClient";

describe("ProofPress Verify Client", () => {
  it("should connect to PPV API and return operational status", async () => {
    const status = await checkPpvStatus();
    expect(status.operational).toBe(true);
    expect(status.version).toBe("1.0.0");
    expect(status.products).toContain("news_verify");
  }, 15_000);

  it("should certify a news article and return valid response", async () => {
    const result = await certifyWithPpv({
      title: "Test: OpenAI lancia nuovo modello GPT-5",
      content: "OpenAI ha annunciato il lancio di GPT-5, il suo modello di linguaggio più avanzato. Il modello supera i benchmark precedenti del 40% e sarà disponibile tramite API dal prossimo mese.",
      sourceUrl: "https://proofpress.ai/test/gpt5",
      productType: "news_verify",
    });

    expect(result).not.toBeNull();
    if (!result) return;

    // Campi obbligatori
    expect(result.hash).toBeTruthy();
    expect(result.hash).toHaveLength(64); // SHA-256 hex
    expect(result.document_id).toBeGreaterThan(0);
    expect(result.ipfs_cid).toBeTruthy();
    expect(result.ipfs_url).toContain("ipfs");
    expect(["A", "B", "C", "D", "F"]).toContain(result.trust_grade);
    expect(result.trust_score).toBeGreaterThanOrEqual(0);
    expect(result.trust_score).toBeLessThanOrEqual(1);

    // Report
    expect(result.report).toBeTruthy();
    expect(result.report.report_id).toMatch(/^ppv-/);
    expect(result.report.article.title).toBeTruthy();
    expect(result.report.article.word_count).toBeGreaterThan(0);
  }, 30_000);
});
