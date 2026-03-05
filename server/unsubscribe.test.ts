import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock del modulo db per isolare il test
vi.mock("./db", () => ({
  unsubscribeByToken: vi.fn(),
  getSubscriberByToken: vi.fn(),
  addSubscriber: vi.fn(),
  getAllSubscribers: vi.fn(),
  getActiveSubscribers: vi.fn(),
  unsubscribeEmail: vi.fn(),
  deleteSubscriber: vi.fn(),
  createNewsletterSend: vi.fn(),
  getNewsletterHistory: vi.fn(),
  ensureUnsubscribeTokens: vi.fn(),
  generateUnsubscribeToken: vi.fn(() => "abc123def456abc123def456abc123def456abc123def456abc123def456abc1"),
}));

vi.mock("./newsletterScheduler", () => ({
  sendWeeklyNewsletter: vi.fn(),
}));

vi.mock("./email", () => ({
  sendEmail: vi.fn(),
  buildWeeklyNewsletterHtml: vi.fn(() => "<html>test</html>"),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

import { unsubscribeByToken, getSubscriberByToken } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("newsletter.unsubscribeByToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disiscrizione con token valido restituisce successo", async () => {
    vi.mocked(unsubscribeByToken).mockResolvedValue({
      success: true,
      email: "test@example.com",
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.newsletter.unsubscribeByToken({
      token: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    });

    expect(result.success).toBe(true);
    expect(result.email).toBe("test@example.com");
  });

  it("token non valido lancia errore BAD_REQUEST", async () => {
    vi.mocked(unsubscribeByToken).mockResolvedValue({
      success: false,
      error: "Token non valido o già utilizzato",
    });

    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.newsletter.unsubscribeByToken({
        token: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
      })
    ).rejects.toThrow("Token non valido o già utilizzato");
  });
});

describe("newsletter.getByToken", () => {
  it("restituisce email e status per token valido", async () => {
    vi.mocked(getSubscriberByToken).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      status: "active",
      source: "import_csv",
      unsubscribeToken: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
      createdAt: new Date(),
      unsubscribedAt: null,
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.newsletter.getByToken({
      token: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    });

    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.status).toBe("active");
  });

  it("restituisce null per token inesistente", async () => {
    vi.mocked(getSubscriberByToken).mockResolvedValue(null);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.newsletter.getByToken({
      token: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
    });

    expect(result).toBeNull();
  });
});
