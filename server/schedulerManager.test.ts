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

vi.mock("./financeScheduler", () => ({
  generateFinanceEditorial: vi.fn().mockResolvedValue(undefined),
  generateFinanceDealOfWeek: vi.fn().mockResolvedValue(undefined),
  generateFinanceReportage: vi.fn().mockResolvedValue(undefined),
  generateFinanceMarketAnalysis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./healthScheduler", () => ({
  generateHealthEditorial: vi.fn().mockResolvedValue(undefined),
  generateHealthDealOfWeek: vi.fn().mockResolvedValue(undefined),
  generateHealthReportage: vi.fn().mockResolvedValue(undefined),
  generateHealthMarketAnalysis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./sportScheduler", () => ({
  generateSportEditorial: vi.fn().mockResolvedValue(undefined),
  generateSportDealOfWeek: vi.fn().mockResolvedValue(undefined),
  generateSportReportage: vi.fn().mockResolvedValue(undefined),
  generateSportMarketAnalysis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./luxuryScheduler", () => ({
  generateLuxuryEditorial: vi.fn().mockResolvedValue(undefined),
  generateLuxuryDealOfWeek: vi.fn().mockResolvedValue(undefined),
  generateLuxuryReportage: vi.fn().mockResolvedValue(undefined),
  generateLuxuryMarketAnalysis: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./newsletterTestSender", () => ({
  sendTestNewsletter: vi.fn().mockResolvedValue({ success: true, subject: "[TEST] IDEASMART", newsCount: 10 }),
}));

vi.mock("./linkedinPublisher", () => ({
  publishLinkedInPost: vi.fn().mockResolvedValue({ published: 1, errors: [], posts: [{ section: 'ai', title: 'Test', success: true }] }),
  publishDailyLinkedInPosts: vi.fn().mockResolvedValue({ published: 1, errors: [], posts: [{ section: 'ai', title: 'Test', success: true }] }),
  SUPPORTED_SECTIONS: ['ai', 'startup'],
}));

vi.mock("./nightlyAuditScheduler", () => ({
  runNightlyAudit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./newsletterLinkAudit", () => ({
  runNewsletterLinkAudit: vi.fn().mockResolvedValue({ okCount: 10, brokenCount: 0, internalBroken: [], shouldBlockSend: false }),
  isNewsletterBlockedByAudit: vi.fn().mockReturnValue(false),
  setNewsletterBlockedByAudit: vi.fn(),
}));

vi.mock("./db", () => ({
  saveBarometroSnapshot: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ partiti: [], fonte: 'Test' }) } }] }),
}));

vi.mock("../drizzle/schema", () => ({
  newsItems: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  desc: vi.fn(),
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

  it("dovrebbe registrare 46 cron job quando avviato", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    // 46 scheduler: 39 originali + 2 per invalidazione cache + 1 snapshot barometro + 1 audit link newsletter + 1 LinkedIn pomeriggio (15:00) + 1 LinkedIn sera (17:30) + 1 Morning Health Report (08:00)
    //   (05:30 CET invalidazione globale, 10:05 CET invalidazione Punto del Giorno, 05:45 snapshot barometro, 06:45 audit link)
    expect(cron.default.schedule).toHaveBeenCalledTimes(46);
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

  it("dovrebbe programmare la preview newsletter alle 07:00 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // La preview newsletter è programmata ogni giorno alle 07:00 CET
    const previewCall = calls.find(c => c[0] === "0 7 * * *");
    expect(previewCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn MATTINO alle 10:30 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInMorningCall = calls.find(c => c[0] === "30 10 * * *");
    expect(linkedInMorningCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn POMERIGGIO alle 15:00 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInAfternoonCall = calls.find(c => c[0] === "0 15 * * *");
    expect(linkedInAfternoonCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn SERA alle 17:30 ogni giorno (Vibe Coding / AI / Mercato)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInEveningCall = calls.find(c => c[0] === "30 17 * * *");
    expect(linkedInEveningCall).toBeDefined();
  });

  it("dovrebbe programmare il Morning Health Report alle 08:00 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const morningReportCall = calls.find(c => c[0] === "0 8 * * *");
    expect(morningReportCall).toBeDefined();
  });

  it("dovrebbe programmare la newsletter massiva alle 07:30 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // La newsletter massiva per canale è programmata ogni giorno alle 07:30 CET
    const massiveCall = calls.find(c => c[0] === "30 7 * * *");
    expect(massiveCall).toBeDefined();
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

  it("dovrebbe programmare l'audit link newsletter alle 06:45 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const auditLinkCall = calls.find(c => c[0] === "45 6 * * *");
    expect(auditLinkCall).toBeDefined();
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
