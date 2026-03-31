import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("SENDGRID_FROM_NAME", () => {
  it("email.ts should use 'Ideasmart Daily' as default sender name", () => {
    const emailTs = readFileSync(join(__dirname, "email.ts"), "utf-8");
    // Verify the fallback default is "Ideasmart Daily"
    expect(emailTs).toContain('"Ideasmart Daily"');
    expect(emailTs).not.toContain('|| "IDEASMART"');
  });

  it("mailer.ts should use 'Ideasmart Daily' as sender name", () => {
    const mailerTs = readFileSync(join(__dirname, "_core/mailer.ts"), "utf-8");
    expect(mailerTs).toContain('"Ideasmart Daily"');
    expect(mailerTs).not.toContain('"IDEASMART"');
  });
});
