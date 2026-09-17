import { describe, expect, it } from "vitest";
import { buildNewsletterOperationalStatus } from "./newsletterControl";

describe("buildNewsletterOperationalStatus", () => {
  it("exposes a conservative manual operating mode when automations are paused", () => {
    const result = buildNewsletterOperationalStatus({
      automationsPaused: true,
      sendGridConfigured: true,
      subscribers: [
        { status: "active" },
        { status: "active" },
        { status: "unsubscribed" },
      ],
    });

    expect(result).toEqual({
      automationsPaused: true,
      sendGridConfigured: true,
      activeSubscribers: 2,
      unsubscribeProtection: true,
      trackingAvailable: true,
      massSendEnabled: false,
    });
  });

  it("does not expose a mass-send capability when provider configuration is absent", () => {
    const result = buildNewsletterOperationalStatus({
      automationsPaused: false,
      sendGridConfigured: false,
      subscribers: [{ status: "unsubscribed" }],
    });

    expect(result.activeSubscribers).toBe(0);
    expect(result.sendGridConfigured).toBe(false);
    expect(result.massSendEnabled).toBe(false);
  });
});
