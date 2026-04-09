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

vi.mock("./siteHealthCheck", () => ({
  runSiteHealthCheck: vi.fn().mockResolvedValue({ allOk: true, checks: [], totalTimeMs: 100, timestamp: "test" }),
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

  it("dovrebbe registrare i cron job quando avviato (newsletter Proof Press Daily attiva)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    // 33 scheduler attivi: AI, Startup, DEALROOM, Research + 5 slot LinkedIn + health check + infra + channel ingestors
    // Newsletter Proof Press Daily: preview 08:30 + massivo 10:30 (lun/mer/ven)
    const callCount = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(28); // almeno 28 job attivi
    expect(callCount).toBeLessThanOrEqual(37);    // non più di 37
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

  it("dovrebbe programmare la preview newsletter Proof Press Daily alle 08:30 (lun/mer/ven)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // La preview newsletter Proof Press Daily è programmata lun/mer/ven alle 08:30 CET
    const previewCall = calls.find(c => c[0] === "30 8 * * 1,3,5");
    expect(previewCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn MATTINO alle 10:00 ogni giorno (AI News)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInMorningCall = calls.find(c => c[0] === "0 10 * * *");
    expect(linkedInMorningCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn STARTUP alle 12:30 ogni giorno (Startup News)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInStartupCall = calls.find(c => c[0] === "30 12 * * *");
    expect(linkedInStartupCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn RICERCHE alle 14:30 ogni giorno (IdeaSmart Research)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInResearchCall = calls.find(c => c[0] === "30 14 * * *");
    expect(linkedInResearchCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn 2° EDITORIALE AI alle 12:30 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInAIResearchCall = calls.find(c => c[0] === "30 12 * * *");
    expect(linkedInAIResearchCall).toBeDefined();
  });

  it("dovrebbe programmare LinkedIn 2° RICERCHE alle 16:00 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const linkedInResearchAfternoonCall = calls.find(c => c[0] === "0 16 * * *");
    expect(linkedInResearchAfternoonCall).toBeDefined();
  });

  it("LinkedIn legacy slots (afternoon 15:00, evening 19:00) dovrebbero essere DISABILITATI", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // I vecchi cron sono commentati/disabilitati
    const linkedInAfternoonCall = calls.find(c => c[0] === "0 15 * * *");
    const linkedInOldDealroomCall = calls.find(c => c[0] === "0 19 * * *");
    expect(linkedInAfternoonCall).toBeUndefined();
    expect(linkedInOldDealroomCall).toBeUndefined();
  });

  it("dovrebbe programmare il Morning Health Report alle 08:00 ogni giorno", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    const morningReportCall = calls.find(c => c[0] === "0 8 * * *");
    expect(morningReportCall).toBeDefined();
  });

  it("la newsletter massiva alle 07:30 dovrebbe essere DISABILITATA (approvazione manuale)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // La newsletter massiva (07:30) è commentata/disabilitata — richiede approvazione manuale
    const massiveCall = calls.find(c => c[0] === "30 7 * * *");
    expect(massiveCall).toBeUndefined();
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
    const rssAiCall = calls.find(c => c[0] === "0 0 * * 1,3,5");
    expect(rssAiCall).toBeDefined();
  });

  it("audit link newsletter 06:45 rimosso (non necessario con nuovo template)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // La routine audit link newsletter è stata rimossa con il nuovo template Proof Press Daily
    const auditLinkCall = calls.find(c => c[0] === "45 6 * * *");
    expect(auditLinkCall).toBeUndefined(); // rimosso
  });

  it("dovrebbe programmare newsletter massiva Proof Press Daily alle 10:30 (lun/mer/ven)", async () => {
    const cron = await import("node-cron");
    const { startAllSchedulers } = await import("./schedulerManager");
    startAllSchedulers();
    const calls = (cron.default.schedule as ReturnType<typeof vi.fn>).mock.calls;
    // Newsletter massiva Proof Press Daily: lun/mer/ven alle 10:30 CET
    const massivoCall = calls.find(c => c[0] === "30 10 * * 1,3,5");
    expect(massivoCall).toBeDefined();
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
