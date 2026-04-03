import { describe, it, expect } from "vitest";

/**
 * Test per il middleware redirect 301 da vecchi domini a ideasmart.biz.
 * Verifica la logica di matching dei domini e la costruzione dell'URL target.
 */

const CANONICAL_HOST = "ideasmart.biz";
const OLD_HOSTS = ["ideasmart.ai", "www.ideasmart.ai", "ideasmart.manus.space", "ideasmartai-uypaon6i.manus.space"];

function getRedirectTarget(host: string, originalUrl: string, protocol = "https"): string | null {
  const cleanHost = host.replace(/:\d+$/, "").toLowerCase();
  if (OLD_HOSTS.includes(cleanHost)) {
    return `${protocol}://${CANONICAL_HOST}${originalUrl}`;
  }
  if (cleanHost === "www.ideasmart.biz") {
    return `${protocol}://${CANONICAL_HOST}${originalUrl}`;
  }
  return null; // no redirect
}

describe("redirect301", () => {
  it("should redirect ideasmart.ai to ideasmart.biz", () => {
    const target = getRedirectTarget("ideasmart.ai", "/");
    expect(target).toBe("https://ideasmart.biz/");
  });

  it("should redirect www.ideasmart.ai to ideasmart.biz", () => {
    const target = getRedirectTarget("www.ideasmart.ai", "/ai");
    expect(target).toBe("https://ideasmart.biz/ai");
  });

  it("should redirect ideasmart.manus.space to ideasmart.biz", () => {
    const target = getRedirectTarget("ideasmart.manus.space", "/startup");
    expect(target).toBe("https://ideasmart.biz/startup");
  });

  it("should redirect ideasmartai-uypaon6i.manus.space to ideasmart.biz", () => {
    const target = getRedirectTarget("ideasmartai-uypaon6i.manus.space", "/research/123");
    expect(target).toBe("https://ideasmart.biz/research/123");
  });

  it("should redirect www.ideasmart.biz to naked domain ideasmart.biz", () => {
    const target = getRedirectTarget("www.ideasmart.biz", "/dealroom");
    expect(target).toBe("https://ideasmart.biz/dealroom");
  });

  it("should preserve query strings during redirect", () => {
    const target = getRedirectTarget("ideasmart.ai", "/search?q=ai+tools&page=2");
    expect(target).toBe("https://ideasmart.biz/search?q=ai+tools&page=2");
  });

  it("should preserve hash fragments in originalUrl", () => {
    const target = getRedirectTarget("ideasmart.ai", "/about#team");
    expect(target).toBe("https://ideasmart.biz/about#team");
  });

  it("should NOT redirect ideasmart.biz (canonical domain)", () => {
    const target = getRedirectTarget("ideasmart.biz", "/");
    expect(target).toBeNull();
  });

  it("should NOT redirect localhost", () => {
    const target = getRedirectTarget("localhost:3000", "/");
    expect(target).toBeNull();
  });

  it("should strip port from host before matching", () => {
    const target = getRedirectTarget("ideasmart.ai:443", "/ai");
    expect(target).toBe("https://ideasmart.biz/ai");
  });

  it("should be case-insensitive for host matching", () => {
    const target = getRedirectTarget("IdeaSmart.AI", "/");
    expect(target).toBe("https://ideasmart.biz/");
  });
});
