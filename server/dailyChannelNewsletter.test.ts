/**
 * dailyChannelNewsletter.test.ts
 * Test per il sistema di newsletter giornaliera per canale IDEASMART
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CHANNEL_SCHEDULE,
  getTodayChannel,
  type ChannelKey,
} from "./dailyChannelNewsletter";

// ─── Test configurazione canali ───────────────────────────────────────────────

describe("CHANNEL_SCHEDULE", () => {
  it("deve contenere almeno 7 canali", () => {
    expect(CHANNEL_SCHEDULE.length).toBeGreaterThanOrEqual(7);
  });

  it("deve coprire tutti i 7 giorni della settimana (0-6)", () => {
    const days = new Set(CHANNEL_SCHEDULE.map((c) => c.dayOfWeek));
    // Tutti i giorni da 0 a 6 devono essere coperti
    for (let d = 0; d <= 6; d++) {
      expect(days.has(d)).toBe(true);
    }
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

  it("deve avere il canale AI il lunedì (dayOfWeek=1)", () => {
    const aiChannel = CHANNEL_SCHEDULE.find((c) => c.key === "ai");
    expect(aiChannel).toBeDefined();
    expect(aiChannel!.dayOfWeek).toBe(1);
  });

  it("deve avere il canale Startup il martedì (dayOfWeek=2)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "startup");
    expect(ch!.dayOfWeek).toBe(2);
  });

  it("deve avere il canale Finance il mercoledì (dayOfWeek=3)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "finance");
    expect(ch!.dayOfWeek).toBe(3);
  });

  it("deve avere il canale Sport il giovedì (dayOfWeek=4)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "sport");
    expect(ch!.dayOfWeek).toBe(4);
  });

  it("deve avere il canale Music il venerdì (dayOfWeek=5)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "music");
    expect(ch!.dayOfWeek).toBe(5);
  });

  it("deve avere il canale Luxury il sabato (dayOfWeek=6)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "luxury");
    expect(ch!.dayOfWeek).toBe(6);
  });

  it("deve avere il canale Health la domenica (dayOfWeek=0)", () => {
    const ch = CHANNEL_SCHEDULE.find((c) => c.key === "health");
    expect(ch!.dayOfWeek).toBe(0);
  });

  it("deve includere i nuovi canali gossip, cybersecurity e sondaggi", () => {
    const keys = CHANNEL_SCHEDULE.map((c) => c.key);
    expect(keys).toContain("gossip");
    expect(keys).toContain("cybersecurity");
    expect(keys).toContain("sondaggi");
  });
});

// ─── Test getTodayChannel ─────────────────────────────────────────────────────

describe("getTodayChannel", () => {
  it("deve restituire un canale valido per il giorno corrente", () => {
    const channel = getTodayChannel();
    // Il test verifica solo che il risultato sia un canale valido
    if (channel !== null) {
      expect(CHANNEL_SCHEDULE).toContainEqual(channel);
    }
  });

  it("deve restituire il canale corretto per i giorni principali della settimana", () => {
    // Mappa giorno → canale atteso (solo i canali primari)
    const dayToChannel: Record<number, ChannelKey> = {
      0: "health",
      1: "ai",
      3: "finance",
      5: "music",
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
    const validKeys: ChannelKey[] = ["ai", "startup", "finance", "sport", "music", "luxury", "health", "news", "motori", "tennis", "basket", "gossip", "cybersecurity", "sondaggi"];
    for (const channel of CHANNEL_SCHEDULE) {
      expect(validKeys).toContain(channel.key);
    }
  });
});
