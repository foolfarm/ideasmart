import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globale
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock sendEmail
vi.mock("./email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { runSiteHealthCheck } from "./siteHealthCheck";
import { sendEmail } from "./email";

describe("siteHealthCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return allOk=true when all checks pass", async () => {
    // Mock tutte le risposte come OK
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/api/trpc/news.getHomeData")) {
        return {
          status: 200,
          json: async () => ({
            result: {
              data: {
                json: {
                  ai: [{ id: 1 }, { id: 2 }],
                  startup: [{ id: 3 }],
                  dealroom: [{ id: 4 }],
                },
              },
            },
          }),
          text: async () => "mock",
        };
      }
      if (url.includes("/api/trpc/news.getBreakingNews")) {
        return {
          status: 200,
          json: async () => ({ result: { data: { json: [] } } }),
          text: async () => "mock",
        };
      }
      if (url.includes("/api/trpc/news.getResearchReports")) {
        return {
          status: 200,
          json: async () => ({
            result: { data: { json: [{ id: 1 }, { id: 2 }, { id: 3 }] } },
          }),
          text: async () => "mock",
        };
      }
      // Homepage e pagine — ritorna HTML lungo con IDEASMART
      return {
        status: 200,
        text: async () => "A".repeat(10000) + "Proof Press",
        json: async () => ({}),
      };
    });

    const report = await runSiteHealthCheck();

    expect(report.allOk).toBe(true);
    expect(report.checks.length).toBeGreaterThanOrEqual(9); // homepage + 3 API + 5 pagine
    expect(report.checks.every((c) => c.ok)).toBe(true);
    // Non deve inviare email se tutto OK
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should detect empty homepage and send alert email", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/api/trpc/")) {
        return {
          status: 200,
          json: async () => ({
            result: {
              data: {
                json: url.includes("getHomeData")
                  ? { ai: [{ id: 1 }], startup: [{ id: 2 }], dealroom: [{ id: 3 }] }
                  : [{ id: 1 }],
              },
            },
          }),
          text: async () => "mock",
        };
      }
      // Homepage troppo corta (vuota)
      return {
        status: 200,
        text: async () => "<html><body>IDEASMART</body></html>",
        json: async () => ({}),
      };
    });

    const report = await runSiteHealthCheck();

    expect(report.allOk).toBe(false);
    // Deve trovare almeno un check fallito (homepage troppo corta)
    const failed = report.checks.filter((c) => !c.ok);
    expect(failed.length).toBeGreaterThan(0);
    // Deve inviare email di alert
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect((sendEmail as any).mock.calls[0][0].subject).toContain("FALLITO");
  });

  it("should detect API failure and report it", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/api/trpc/news.getHomeData")) {
        return {
          status: 500,
          json: async () => ({ error: "Internal Server Error" }),
          text: async () => "error",
        };
      }
      if (url.includes("/api/trpc/")) {
        return {
          status: 200,
          json: async () => ({
            result: { data: { json: [{ id: 1 }] } },
          }),
          text: async () => "mock",
        };
      }
      return {
        status: 200,
        text: async () => "A".repeat(10000) + "Proof Press",
        json: async () => ({}),
      };
    });

    const report = await runSiteHealthCheck();

    expect(report.allOk).toBe(false);
    const homeDataCheck = report.checks.find((c) => c.name === "API getHomeData");
    expect(homeDataCheck?.ok).toBe(false);
    expect(homeDataCheck?.status).toBe(500);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("should detect empty sections in getHomeData", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/api/trpc/news.getHomeData")) {
        return {
          status: 200,
          json: async () => ({
            result: {
              data: {
                json: {
                  ai: [],
                  startup: [{ id: 1 }],
                  dealroom: [],
                },
              },
            },
          }),
          text: async () => "mock",
        };
      }
      if (url.includes("/api/trpc/")) {
        return {
          status: 200,
          json: async () => ({
            result: { data: { json: [{ id: 1 }] } },
          }),
          text: async () => "mock",
        };
      }
      return {
        status: 200,
        text: async () => "A".repeat(10000) + "Proof Press",
        json: async () => ({}),
      };
    });

    const report = await runSiteHealthCheck();

    expect(report.allOk).toBe(false);
    const homeDataCheck = report.checks.find((c) => c.name === "API getHomeData");
    expect(homeDataCheck?.ok).toBe(false);
    expect(homeDataCheck?.detail).toContain("Sezioni vuote");
    expect(homeDataCheck?.detail).toContain("AI");
    expect(homeDataCheck?.detail).toContain("Dealroom");
  });

  it("should handle network timeout gracefully", async () => {
    mockFetch.mockImplementation(async () => {
      throw new Error("fetch failed: timeout");
    });

    const report = await runSiteHealthCheck();

    expect(report.allOk).toBe(false);
    expect(report.checks.every((c) => !c.ok)).toBe(true);
    expect(report.checks[0].detail).toContain("timeout");
    // Deve inviare alert anche per timeout
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("should include response time for each check", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/api/trpc/news.getHomeData")) {
        return {
          status: 200,
          json: async () => ({
            result: { data: { json: { ai: [{ id: 1 }], startup: [{ id: 2 }], dealroom: [{ id: 3 }] } } },
          }),
          text: async () => "mock",
        };
      }
      if (url.includes("/api/trpc/")) {
        return {
          status: 200,
          json: async () => ({ result: { data: { json: [{ id: 1 }] } } }),
          text: async () => "mock",
        };
      }
      return {
        status: 200,
        text: async () => "A".repeat(10000) + "Proof Press",
        json: async () => ({}),
      };
    });

    const report = await runSiteHealthCheck();

    for (const check of report.checks) {
      expect(check.responseTimeMs).toBeDefined();
      expect(typeof check.responseTimeMs).toBe("number");
      expect(check.responseTimeMs).toBeGreaterThanOrEqual(0);
    }
  });
});
