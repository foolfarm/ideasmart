/**
 * schedulerManager.test.ts — Test per gli scheduler IDEASMART
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock delle dipendenze ────────────────────────────────────────────────────

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
  },
}));

vi.mock("./rssNewsScheduler", () => ({
  refreshAINewsFromRSS: vi.fn().mockResolvedValue(undefined),
  refreshMusicNewsFromRSS: vi.fn().mockResolvedValue(undefined),
  refreshStartupNewsFromRSS: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./dailyContentScheduler", () => ({
  runDailyContentRefresh: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./weeklyReportageScheduler", () => ({
  generateWeeklyReportage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./marketAnalysisScheduler", () => ({
  generateMarketAnalysis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./newsletterScheduler", () => ({
  sendWeeklyNewsletter: vi.fn().mockResolvedValue({ success: true, recipientCount: 100, newsCount: 20, subject: "Test" }),
}));

vi.mock("./musicScheduler", () => ({
  generateMusicEditorial: vi.fn().mockResolvedValue(undefined),
  generateArtistOfWeek: vi.fn().mockResolvedValue(undefined),
  generateMusicReportage: vi.fn().mockResolvedValue(undefined),
  generateMusicMarketAnalysis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./musicNewsletterScheduler", () => ({
  sendItsMusicNewsletter: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./startupScheduler", () => ({
  generateStartupEditorial: vi.fn().mockResolvedValue(undefined),
  generateStartupOfWeek: vi.fn().mockResolvedValue(undefined),
  generateStartupReportage: vi.fn().mockResolvedValue(undefined),
  generateStartupMarketAnalysis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./newsletterTestSender", () => ({
  sendTestNewsletter: vi.fn().mockResolvedValue({ success: true, subject: "[TEST] IDEASMART", newsCount: 10 }),
}));

vi.mock("./nightlyAuditScheduler", () => ({
  runNightlyAudit: vi.fn().mockResolvedValue(undefined),
}));

// ─── Test ─────────────────────────────────────────────────────────────────────

describe("schedulerManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dovrebbe importare startAllSchedulers senza errori", async () => {
    const { startAllSchedulers } = await import("./schedulerManager");
    expect(typeof startAllSchedulers).toBe("function");
  });

  it("dovrebbe registrare 15 cron job quando avviato", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    // 15 scheduler: 12 contenuti + 1 audit + 1 test newsletter + 1 newsletter massiva
    expect(cron.default.schedule).toHaveBeenCalledTimes(15);
  });

  it("dovrebbe usare il fuso orario Europe/Rome per tutti i cron job", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    for (const call of calls) {
      expect(call[2]).toEqual({ timezone: "Europe/Rome" });
    }
  });

  it("dovrebbe programmare la newsletter di test alle 08:30 il lunedì", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const testNewsletterCall = calls.find(c => c[0] === "30 8 * * 1");
    expect(testNewsletterCall).toBeDefined();
  });

  it("dovrebbe programmare la newsletter massiva alle 09:30 il lunedì", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const massiveNewsletterCall = calls.find(c => c[0] === "30 9 * * 1");
    expect(massiveNewsletterCall).toBeDefined();
  });

  it("dovrebbe programmare l'audit notturno alle 02:00 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const auditCall = calls.find(c => c[0] === "0 2 * * *");
    expect(auditCall).toBeDefined();
  });

  it("dovrebbe programmare lo scraping RSS AI alle 00:00 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const rssAiCall = calls.find(c => c[0] === "0 0 * * *");
    expect(rssAiCall).toBeDefined();
  });

  it("NON dovrebbe programmare newsletter il venerdì (rimosso)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // Verifica che non ci sia nessun cron con "* * 5" (venerdì) per la newsletter
    const fridayNewsletterCall = calls.find(c => 
      typeof c[0] === "string" && c[0].includes("* * 5") && !c[0].includes("1,5")
    );
    expect(fridayNewsletterCall).toBeUndefined();
    // Verifica che non ci sia il vecchio "0 10 * * 1,5"
    const oldNewsletterCall = calls.find(c => c[0] === "0 10 * * 1,5");
    expect(oldNewsletterCall).toBeUndefined();
  });
});

// ─── Test nightlyAuditScheduler ───────────────────────────────────────────────

describe("nightlyAuditScheduler", () => {
  it("dovrebbe importare runNightlyAudit senza errori", async () => {
    const { runNightlyAudit } = await import("./nightlyAuditScheduler");
    expect(typeof runNightlyAudit).toBe("function");
  });
});

// ─── Test newsletterTestSender ────────────────────────────────────────────────

describe("newsletterTestSender", () => {
  it("dovrebbe importare sendTestNewsletter senza errori", async () => {
    const { sendTestNewsletter } = await import("./newsletterTestSender");
    expect(typeof sendTestNewsletter).toBe("function");
  });
});
