/**
 * mailer.ts — invio email transazionali tramite SendGrid
 * Usato per: email di verifica account, reset password, ecc.
 */
import { ENV } from "./env";

interface SendGridPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail({ to, subject, html, text }: SendGridPayload): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY || ENV.sendgridApiKey;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || ENV.sendgridFromEmail || "noreply@ideasmart.ai";
  const fromName = process.env.SENDGRID_FROM_NAME || ENV.sendgridFromName || "IdeaSmart";

  if (!apiKey) {
    console.warn("[Mailer] SENDGRID_API_KEY non configurata — email non inviata a", to);
    console.log("[Mailer] Subject:", subject);
    return;
  }

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: fromEmail, name: fromName },
    subject,
    content: [
      { type: "text/html", value: html },
      ...(text ? [{ type: "text/plain", value: text }] : []),
    ],
  };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Mailer] SendGrid error:", res.status, err);
    throw new Error(`Email non inviata: ${res.status}`);
  }
}

/** Invia email di verifica account */
export async function sendVerificationEmail({
  to,
  username,
  verifyUrl,
}: {
  to: string;
  username: string;
  verifyUrl: string;
}): Promise<void> {
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conferma il tuo account IdeaSmart</title>
</head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid rgba(26,26,26,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:2px solid #1a1a1a;">
              <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(26,26,26,0.4);">Intelligence quotidiana su AI, Startup e Venture Capital</p>
              <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#1a1a1a;">IDEASMART</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a1a;">Ciao <strong>${username}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(26,26,26,0.75);">
                Grazie per esserti registrato a IdeaSmart. Per attivare il tuo account e iniziare a leggere tutte le analisi, ricerche e news su AI, Startup e Venture Capital, conferma la tua email cliccando il pulsante qui sotto.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#1a1a1a;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Conferma Email →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:rgba(26,26,26,0.45);">
                Il link è valido per 24 ore. Se non hai richiesto la registrazione, ignora questa email.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(26,26,26,0.35);word-break:break-all;">
                ${verifyUrl}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(26,26,26,0.08);background:#faf8f3;">
              <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.35);">
                © ${new Date().getFullYear()} IdeaSmart · AI · Startup · Venture Capital · <a href="https://ideasmart.ai/privacy" style="color:rgba(26,26,26,0.35);">Privacy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to,
    subject: "Conferma il tuo account IdeaSmart",
    html,
    text: `Ciao ${username},\n\nConferma la tua email cliccando qui:\n${verifyUrl}\n\nIl link è valido per 24 ore.\n\n— IdeaSmart`,
  });
}
