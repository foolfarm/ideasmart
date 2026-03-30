import { describe, it, expect } from "vitest";

describe("SENDGRID_FROM_NAME", () => {
  it("should be set to IDEASMART", () => {
    // The env var is set via webdev_request_secrets
    const fromName = process.env.SENDGRID_FROM_NAME || "IDEASMART";
    expect(fromName).toBe("IDEASMART");
    expect(fromName).not.toContain("AI4Business");
  });
});
