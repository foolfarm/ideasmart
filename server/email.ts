import { ENV } from "./_core/env";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "newsletter@ideasmart.it";
  const fromName = process.env.SENDGRID_FROM_NAME || "IDEASMART — AI for Business";

  if (!apiKey) {
    console.error("[Email] SENDGRID_API_KEY not set");
    return { success: false, error: "SENDGRID_API_KEY not configured" };
  }

  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];

  const body = {
    personalizations: recipients.map((email) => ({
      to: [{ email }],
    })),
    from: { email: fromEmail, name: fromName },
    subject: opts.subject,
    content: [
      ...(opts.text ? [{ type: "text/plain", value: opts.text }] : []),
      { type: "text/html", value: opts.html },
    ],
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 202) {
      console.log(`[Email] Sent successfully to ${recipients.join(", ")}`);
      return { success: true };
    }

    const errorText = await response.text();
    console.error(`[Email] SendGrid error ${response.status}:`, errorText);
    return { success: false, error: `SendGrid error ${response.status}: ${errorText}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Email] Network error:", msg);
    return { success: false, error: msg };
  }
}

export function buildWeeklyNewsletterHtml(newsData: {
  week: string;
  news: Array<{ id: number; category: string; title: string; description: string; impact: string }>;
}): string {
  const categoryColors: Record<string, string> = {
    "AI Generativa": "#00e5c8",
    "Startup": "#ff5500",
    "Funding": "#0066ff",
    "Prodotto": "#00e5c8",
    "Ricerca": "#9b59b6",
    "Mercato": "#ff5500",
    "Regolamentazione": "#f39c12",
    "default": "#00e5c8",
  };

  const newsItemsHtml = newsData.news
    .slice(0, 20)
    .map((item, idx) => {
      const color = categoryColors[item.category] ?? categoryColors["default"];
      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="36" style="vertical-align: top; padding-right: 12px;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${color}22; text-align: center; line-height: 28px; font-size: 11px; font-weight: 900; color: ${color}; font-family: Arial, sans-serif;">${String(idx + 1).padStart(2, "0")}</div>
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${color}; font-family: Arial, sans-serif;">${item.category}</p>
                  <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #ffffff; font-family: Arial, sans-serif; line-height: 1.3;">${item.title}</p>
                  <p style="margin: 0 0 6px 0; font-size: 13px; color: rgba(255,255,255,0.65); font-family: Arial, sans-serif; line-height: 1.5;">${item.description}</p>
                  <p style="margin: 0; font-size: 12px; color: ${color}; font-family: Arial, sans-serif;"><strong>💼 Business Impact:</strong> ${item.impact}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IDEASMART Weekly — Top 20 AI News | ${newsData.week}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0f1e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1e;">
  <tr>
    <td align="center" style="padding: 20px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

        <!-- Top bar -->
        <tr>
          <td style="background-color: #060a14; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 10px 24px; text-align: center;">
            <p style="margin: 0; font-size: 10px; color: rgba(255,255,255,0.3); font-family: Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase;">STARTUP DI TECNOLOGIA E INNOVAZIONE · AI FOR BUSINESS</p>
          </td>
        </tr>

        <!-- Logo -->
        <tr>
          <td style="background-color: #0a0f1e; padding: 32px 24px 24px; text-align: center; border-bottom: 2px solid #00e5c8;">
            <h1 style="margin: 0 0 6px 0; font-size: 44px; font-weight: 900; color: #ffffff; font-family: Arial, sans-serif; letter-spacing: -1px;">IDEA<span style="color: #00e5c8;">SMART</span></h1>
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.15em; text-transform: uppercase; font-family: Arial, sans-serif;">Weekly News · AI for Business</p>
          </td>
        </tr>

        <!-- Intro editoriale -->
        <tr>
          <td style="background-color: #0d1220; padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #00e5c8; font-family: Arial, sans-serif;">◆ Editoriale della settimana</p>
            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; font-family: Arial, sans-serif;">
              Ogni settimana la redazione di <strong style="color: #ffffff;">IDEASMART</strong> analizza e seleziona le 20 notizie più rilevanti nel mondo dell'AI e delle startup tecnologiche italiane e internazionali. Questa settimana: <strong style="color: #00e5c8;">${newsData.week}</strong>.
            </p>
          </td>
        </tr>

        <!-- Section title -->
        <tr>
          <td style="background-color: #00e5c8; padding: 10px 24px;">
            <p style="margin: 0; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #0a0f1e; font-family: Arial, sans-serif;">TOP 20 NOTIZIE AI &amp; STARTUP — ${newsData.week}</p>
          </td>
        </tr>

        <!-- News items -->
        <tr>
          <td style="background-color: #0a0f1e; padding: 8px 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${newsItemsHtml}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background-color: #0d1220; padding: 32px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: rgba(255,255,255,0.35); font-family: Arial, sans-serif; letter-spacing: 0.05em; text-transform: uppercase;">Approfondisci le startup AI del mese</p>
            <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #ffffff; font-family: Arial, sans-serif;">FoolTalent · FoolShare · Fragmentalis · PollCast</p>
            <a href="https://ideasmart.manus.space" style="display: inline-block; padding: 13px 30px; background-color: #00e5c8; color: #0a0f1e; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; font-family: Arial, sans-serif;">Vai al sito IDEASMART →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #060a14; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
            <p style="margin: 0 0 8px 0; font-size: 11px; color: rgba(255,255,255,0.25); font-family: Arial, sans-serif;">© 2026 IDEASMART — Startup di Tecnologia &amp; Innovazione. Tutti i diritti riservati.</p>
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.2); font-family: Arial, sans-serif;">
              Hai ricevuto questa email perché sei iscritto alla newsletter IDEASMART.<br>
              <a href="*|UNSUB|*" style="color: rgba(255,255,255,0.35); text-decoration: underline;">Disiscriviti</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
