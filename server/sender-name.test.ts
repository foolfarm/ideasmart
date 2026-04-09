import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("SENDGRID sender configuration", () => {
  it("email.ts should use 'ProofPress.AI' as default sender name", () => {
    const emailTs = readFileSync(join(__dirname, "email.ts"), "utf-8");
    expect(emailTs).toContain('"ProofPress.AI"');
    expect(emailTs).toContain('"info@proofpress.ai"');
    expect(emailTs).toContain('"noreply@proofpress.ai"');
    expect(emailTs).toContain("reply_to");
  });

  it("mailer.ts should use 'ProofPress.AI' as sender name", () => {
    const mailerTs = readFileSync(join(__dirname, "_core/mailer.ts"), "utf-8");
    expect(mailerTs).toContain('"ProofPress.AI"');
    expect(mailerTs).toContain('"info@proofpress.ai"');
    expect(mailerTs).toContain('"noreply@proofpress.ai"');
    expect(mailerTs).toContain("reply_to");
  });
});
