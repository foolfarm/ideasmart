/**
 * Test di validazione credenziali LinkedIn
 * Verifica che LINKEDIN_ACCESS_TOKEN e LINKEDIN_AUTHOR_URN siano configurati correttamente.
 */
import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("LinkedIn credentials", () => {
  it("should have LINKEDIN_ACCESS_TOKEN configured", () => {
    expect(ENV.linkedinAccessToken).toBeTruthy();
    expect(ENV.linkedinAccessToken.length).toBeGreaterThan(10);
  });

  it("should have LINKEDIN_AUTHOR_URN configured", () => {
    expect(ENV.linkedinAuthorUrn).toBeTruthy();
    expect(ENV.linkedinAuthorUrn).toMatch(/^urn:li:(person|member|organization):/);
  });

  it("should have valid URN format for author", () => {
    const urn = ENV.linkedinAuthorUrn;
    // Accetta sia urn:li:person: che urn:li:member: che urn:li:organization:
    const validFormats = [
      /^urn:li:person:[A-Za-z0-9_-]+$/,
      /^urn:li:member:\d+$/,
      /^urn:li:organization:\d+$/,
    ];
    const isValid = validFormats.some((regex) => regex.test(urn));
    expect(isValid).toBe(true);
  });
});
