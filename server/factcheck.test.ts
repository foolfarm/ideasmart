/**
 * Test: Google Fact Check Tools API key validation
 * Verifica che la chiave GOOGLE_FACTCHECK_API_KEY sia valida
 * e che la Fact Check Tools API risponda correttamente.
 */
import { describe, it, expect } from "vitest";

describe("Google Fact Check API", () => {
  it("should have GOOGLE_FACTCHECK_API_KEY configured", () => {
    const key = process.env.GOOGLE_FACTCHECK_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^AIza/); // tutte le API key Google iniziano con AIza
  });

  it("should return valid response from Fact Check Tools API", async () => {
    const apiKey = process.env.GOOGLE_FACTCHECK_API_KEY;
    if (!apiKey) {
      console.warn("GOOGLE_FACTCHECK_API_KEY non configurata — test saltato");
      return;
    }

    const url = new URL("https://factchecktools.googleapis.com/v1alpha1/claims:search");
    url.searchParams.set("query", "climate change");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("pageSize", "1");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status).toBe(200);
    const data = await response.json() as { claims?: unknown[] };
    // La risposta può avere 0 claim (query senza risultati) ma deve essere un oggetto valido
    expect(typeof data).toBe("object");
  }, 15_000);
});
