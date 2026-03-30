/**
 * dailyChannelNewsletter.test.ts
 * Test per il sistema di newsletter giornaliera per canale IDEASMART
 * Aggiornato per la nuova struttura a 3 canali: AI News (Lun), Startup News (Mer), DEALROOM (Ven)
 */

import { describe, it, expect } from "vitest";
import {
  CHANNEL_SCHEDULE,
  getTodayChannel,
  type ChannelKey,
} from "./dailyChannelNewsletter";

// ─── Test configurazione canali ───────────────────────────────────────────────

describe("CHANNEL_SCHEDULE", () => {
  it("deve contenere esattamente 3 canali (AI, Startup, DEALROOM)", () => {
    expect(CHANNEL_SCHEDULE.length).toBe(3);
  });

  it("deve coprire lunedì (1), mercoledì (3) e venerdì (5)", () => {
    const days = new Set(CHANNEL_SCHEDULE.map((c) => c.dayOfWeek));
    expect(days.has(1)).toBe(true); // Lunedì
    expect(days.has(3)).toBe(true); // Mercoledì
    expect(days.has(5)).toBe(true); // Venerdì
  });

  it("deve avere chiavi canale univoche", () => {
    const keys = CHANNEL_SCHEDULE.map((c) => c.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(CHANNEL_SCHEDULE.length);
  });

  it("deve avere tutti i campi obbligatori per ogni canale", () => {
    for (const channel of CHANNEL_SCHEDULE) {
      expect(channel.key).toBeTruthy();
      expect(channel.name).toBeTruthy();
      expect(channel.shortName).toBeTruthy();
      expect(channel.siteSection).toBeTruthy();
      expect(channel.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(channel.tagline).toBeTruthy();
      expect(channel.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(channel.dayOfWeek).toBeLessThanOrEqual(6);
    }
  });

  it("deve avere il canale AI News il lunedì (dayOfWeek=1)", () => {
    const aiChannel = CHANNEL_SCHEDULE.find((c) => c.key === "ai");
    expect(aiChannel).toBeDefined();
    expect(aiChannel!.dayOfWeek).toBe(1);
    expect(aiChannel!.name).toBe("AI News");
  });

  it("deve avere il canale Startup News il mercoledì (dayOfWeek=3)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "startup");
    expect(ch).toBeDefined();
    expect(ch!.dayOfWeek).toBe(3);
    expect(ch!.name).toBe("Startup News");
  });

  it("deve avere il canale DEALROOM il venerdì (dayOfWeek=5)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "dealroom");
    expect(ch).toBeDefined();
    expect(ch!.dayOfWeek).toBe(5);
    expect(ch!.name).toBe("DEALROOM News");
  });

  it("deve includere solo i canali ai, startup e dealroom", () => {
    const keys = CHANNEL_SCHEDULE.map((c) => c.key);
    expect(keys).toContain("ai");
    expect(keys).toContain("startup");
    expect(keys).toContain("dealroom");
    expect(keys.length).toBe(3);
  });
});

// ─── Test getTodayChannel ─────────────────────────────────────────────────────

describe("getTodayChannel", () => {
  it("deve restituire un canale valido o null per il giorno corrente", () => {
    const channel = getTodayChannel();
    // Il test verifica solo che il risultato sia un canale valido o null
    if (channel !== null) {
      expect(CHANNEL_SCHEDULE).toContainEqual(channel);
    }
  });

  it("i canali devono corrispondere ai giorni attesi", () => {
    // Mappa giorno → canale atteso
    const dayToChannel: Record<number, ChannelKey> = {
      1: "ai",       // Lunedì
      3: "startup",  // Mercoledì
      5: "dealroom", // Venerdì
    };

    for (const [dayStr, expectedKey] of Object.entries(dayToChannel)) {
      const day = Number(dayStr);
      const channel = CHANNEL_SCHEDULE.find((c) => c.dayOfWeek === day && c.key === expectedKey);
      expect(channel).toBeDefined();
      expect(channel!.key).toBe(expectedKey);
    }
  });
});

// ─── Test struttura newsletter ────────────────────────────────────────────────

describe("Struttura newsletter giornaliera", () => {
  it("ogni canale deve avere un colore accento valido", () => {
    for (const channel of CHANNEL_SCHEDULE) {
      expect(channel.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("ogni canale deve avere una sezione sito valida", () => {
    for (const channel of CHANNEL_SCHEDULE) {
      expect(channel.siteSection).toMatch(/^\/[a-z]+$/);
    }
  });

  it("le chiavi canale devono corrispondere ai valori attesi", () => {
    const validKeys: ChannelKey[] = ["ai", "startup", "dealroom"];
    for (const channel of CHANNEL_SCHEDULE) {
      expect(validKeys).toContain(channel.key);
    }
  });
});
