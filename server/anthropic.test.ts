/**
 * Test di validazione integrazione Anthropic Claude
 * Verifica che ANTHROPIC_API_KEY sia configurata e che invokeLLM usi Claude.
 */

import { describe, it, expect } from "vitest";
import "dotenv/config";

describe("Anthropic Claude integration", () => {
  it("ANTHROPIC_API_KEY deve essere configurata", () => {
    const key = process.env.ANTHROPIC_API_KEY;
    expect(key, "ANTHROPIC_API_KEY non trovata — inseriscila in Settings → Secrets").toBeTruthy();
    expect(key!.startsWith("sk-ant-"), "La chiave deve iniziare con 'sk-ant-'").toBe(true);
  });

  it("invokeLLM deve rispondere con Claude e restituire testo", async () => {
    const { invokeLLM } = await import("./_core/llm");

    const result = await invokeLLM({
      messages: [
        { role: "system", content: "Sei un assistente conciso." },
        { role: "user", content: "Rispondi solo con la parola: OK" },
      ],
    });

    expect(result).toBeDefined();
    expect(result.choices).toHaveLength(1);
    expect(result.model).toContain("claude");

    const content = result.choices[0].message.content;
    expect(typeof content).toBe("string");
    expect((content as string).length).toBeGreaterThan(0);

    console.log(`[Test] Provider: ${result.model} | Risposta: "${content}"`);
  }, 30_000);
});
