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
  const fromName = "IDEASMART";

  if (!apiKey) {
    console.warn("[Mailer] SENDGRID_API_KEY non configurata — email non inviata a", to);
    console.log("[Mailer] Subject:", subject);
    return;
  }

  // SendGrid richiede: text/plain PRIMA di text/html
  const content: Array<{ type: string; value: string }> = [];
  if (text) content.push({ type: "text/plain", value: text });
  content.push({ type: "text/html", value: html });

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: fromEmail, name: fromName },
    subject,
    content,
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
  <title>Sei a un passo da IDEASMART</title>
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
          <!-- Hero scuro -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Conferma registrazione</p>
              <h2 style="margin:0 0 12px;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;line-height:1.2;">Sei a un passo da IDEASMART.</h2>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);">Clicca e conferma: potrai goderti ogni giorno notizie fresche da oltre <strong style="color:#ffffff;">4.000 fonti</strong> su AI, Startup e Venture Capital — completamente gratis.</p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 20px;font-size:15px;color:rgba(26,26,26,0.7);">Ciao <strong style="color:#1a1a1a;">${username}</strong>, ci siamo quasi. Un solo click e il tuo account è attivo.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#1a1a1a;">
                    <a href="${verifyUrl}" style="display:inline-block;padding:16px 40px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Conferma e accedi a IDEASMART →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:rgba(26,26,26,0.4);">
                Il link è valido per 24 ore. Se non hai richiesto la registrazione, ignora questa email.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(26,26,26,0.3);word-break:break-all;">
                ${verifyUrl}
              </p>
            </td>
          </tr>
          <!-- Cosa ti aspetta -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(26,26,26,0.08);padding-top:24px;">
                <tr>
                  <td style="padding-top:20px;">
                    <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(26,26,26,0.4);">Cosa ti aspetta</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="33%" style="padding-right:12px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1a1a1a;">4.000+</p>
                          <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.45);">Fonti monitorate</p>
                        </td>
                        <td width="33%" style="padding-right:12px;vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1a1a1a;">24/7</p>
                          <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.45);">Aggiornamento</p>
                        </td>
                        <td width="33%" style="vertical-align:top;">
                          <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1a1a1a;">€0</p>
                          <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.45);">Completamente gratis</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(26,26,26,0.08);background:#faf8f3;">
              <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.35);">
                © ${new Date().getFullYear()} IDEASMART · AI · Startup · Venture Capital · <a href="https://ideasmart.ai/privacy" style="color:rgba(26,26,26,0.35);">Privacy</a>
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
    subject: "Sei a un passo da IDEASMART — conferma la tua email",
    html,
    text: `Ciao ${username},\n\nSei a un passo da IDEASMART!\n\nClicca e conferma: potrai goderti ogni giorno notizie fresche da oltre 4.000 fonti su AI, Startup e Venture Capital — completamente gratis.\n\nConferma qui:\n${verifyUrl}\n\nIl link è valido per 24 ore. Se non hai richiesto la registrazione, ignora questa email.\n\n— IDEASMART`,
  });
}
