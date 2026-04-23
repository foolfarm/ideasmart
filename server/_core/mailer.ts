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
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || ENV.sendgridFromEmail || "info@proofpress.ai";
  const _noreplyEmail = "noreply@proofpress.ai"; // fallback per reply_to
  const fromName = process.env.SENDGRID_FROM_NAME || ENV.sendgridFromName || "ProofPress.AI";
  const replyTo = "noreply@proofpress.ai";

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
    reply_to: { email: replyTo, name: fromName },
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
  <title>Sei a un passo da Proof Press</title>
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
              <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#1a1a1a;">Proof Press</h1>
            </td>
          </tr>
          <!-- Hero scuro -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Conferma registrazione</p>
              <h2 style="margin:0 0 12px;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;line-height:1.2;">Sei a un passo da Proof Press.</h2>
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
                      Conferma e accedi a Proof Press →
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
                © ${new Date().getFullYear()} Proof Press · AI · Startup · Venture Capital · <a href="https://proofpress.ai/privacy" style="color:rgba(26,26,26,0.35);">Privacy</a>
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
    subject: "Sei a un passo da Proof Press — conferma la tua email",
    html,
    text: `Ciao ${username},\n\nSei a un passo da Proof Press!\n\nClicca e conferma: potrai goderti ogni giorno notizie fresche da oltre 4.000 fonti su AI, Startup e Venture Capital — completamente gratis.\n\nConferma qui:\n${verifyUrl}\n\nIl link è valido per 24 ore. Se non hai richiesto la registrazione, ignora questa email.\n\n— Proof Press`,
  });
}

/** Invia email di benvenuto dopo la verifica dell'account */
export async function sendWelcomeEmail({
  to,
  username,
}: {
  to: string;
  username: string;
}): Promise<void> {
  const year = new Date().getFullYear();
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto su Proof Press</title>
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
              <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#1a1a1a;">Proof Press</h1>
            </td>
          </tr>
          <!-- Hero scuro -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Benvenuto</p>
              <h2 style="margin:0 0 12px;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;line-height:1.2;">Ciao ${username}, sei dentro.</h2>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.65);">Il tuo account Proof Press e attivo. Da oggi hai accesso completo a tutte le notizie, ricerche e analisi su AI, Startup e Venture Capital.</p>
            </td>
          </tr>
          <!-- Sezioni disponibili -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 20px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(26,26,26,0.4);">Cosa trovi su Proof Press</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(26,26,26,0.08);">
                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,26,26,0.4);">AI NEWS</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;">Le ultime notizie su intelligenza artificiale, LLM e agenti AI — aggiornate ogni ora.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(26,26,26,0.08);">
                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,26,26,0.4);">STARTUP NEWS</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;">Funding, founder stories ed ecosistema startup italiano ed europeo.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(26,26,26,0.08);">
                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,26,26,0.4);">DEALROOM</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;">Round, seed, Series A/B e investimenti VC — focus su Italia, Europa e mercati globali.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(26,26,26,0.4);">RICERCHE</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#1a1a1a;">Analisi approfondite su trend, mercati e tecnologie — nuove ricerche ogni giorno.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1a1a1a;padding:14px 28px;">
                    <a href="https://proofpress.ai" style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Leggi le ultime notizie &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:rgba(26,26,26,0.5);">
                Riceverai la nostra newsletter ogni lunedi, mercoledi e venerdi con le notizie piu importanti.<br>
                Puoi gestire le tue preferenze in qualsiasi momento dalla <a href="https://proofpress.ai/account" style="color:#1a1a1a;">pagina account</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(26,26,26,0.08);background:#faf8f3;">
              <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.35);">
                &copy; ${year} Proof Press &middot; AI &middot; Startup &middot; Venture Capital &middot; <a href="https://proofpress.ai/privacy" style="color:rgba(26,26,26,0.35);">Privacy</a>
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
    subject: `Benvenuto su Proof Press, ${username} — sei dentro`,
    html,
    text: `Ciao ${username},\n\nIl tuo account Proof Press e attivo!\n\nDa oggi hai accesso a:\n- AI NEWS: ultime notizie su intelligenza artificiale, LLM e agenti AI\n- STARTUP NEWS: funding, founder stories ed ecosistema startup\n- DEALROOM: round, seed, Series A/B e investimenti VC\n- RICERCHE: analisi approfondite su trend e mercati\n\nLeggi le ultime notizie: https://proofpress.ai\n\nRiceverai la newsletter ogni lunedi, mercoledi e venerdi.\nGestisci le preferenze: https://proofpress.ai/account\n\n— Proof Press`,
  });
}

/** Invia email di notifica approvazione articolo al giornalista */
export async function sendArticleApprovedEmail({
  to,
  journalistName,
  articleTitle,
  articleUrl,
}: {
  to: string;
  journalistName: string;
  articleTitle: string;
  articleUrl: string;
}): Promise<void> {
  const year = new Date().getFullYear();
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Articolo approvato — ProofPress</title>
</head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid rgba(26,26,26,0.1);">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:2px solid #1a1a1a;">
              <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(26,26,26,0.4);">Portale Giornalisti ProofPress</p>
              <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#1a1a1a;">Proof Press</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#059669;padding:32px 40px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);">✅ Articolo approvato</p>
              <h2 style="margin:0 0 12px;font-size:24px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;line-height:1.3;">Il tuo articolo è stato pubblicato su ProofPress!</h2>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.85);">La redazione ha approvato e pubblicato il tuo articolo con bollino PP-Verify. È ora visibile su proofpress.ai.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:13px;color:rgba(26,26,26,0.6);">Ciao <strong style="color:#1a1a1a;">${journalistName}</strong>,</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:rgba(26,26,26,0.75);">Il tuo articolo <strong style="color:#1a1a1a;">"${articleTitle}"</strong> è stato approvato dalla redazione ProofPress ed è ora online, certificato con il bollino PP-Verify.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#1a1a1a;">
                    <a href="${articleUrl}" style="display:inline-block;padding:14px 32px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Leggi il tuo articolo →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:rgba(26,26,26,0.4);">Puoi accedere al portale giornalisti per scrivere nuovi articoli: <a href="https://proofpress.ai/journalist-portal" style="color:#1a1a1a;">proofpress.ai/journalist-portal</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(26,26,26,0.08);background:#faf8f3;">
              <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.35);">
                &copy; ${year} Proof Press &middot; <a href="https://proofpress.ai/privacy" style="color:rgba(26,26,26,0.35);">Privacy</a>
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
    subject: `✅ Articolo approvato — "${articleTitle}" è online su ProofPress`,
    html,
    text: `Ciao ${journalistName},\n\nOttima notizia! Il tuo articolo "${articleTitle}" è stato approvato dalla redazione ProofPress ed è ora online con bollino PP-Verify.\n\nLeggilo qui: ${articleUrl}\n\nContinua a scrivere dal portale: https://proofpress.ai/journalist-portal\n\n— Redazione ProofPress`,
  });
}

/** Invia email di notifica rifiuto articolo al giornalista */
export async function sendArticleRejectedEmail({
  to,
  journalistName,
  articleTitle,
  reviewNotes,
  portalUrl,
}: {
  to: string;
  journalistName: string;
  articleTitle: string;
  reviewNotes: string;
  portalUrl: string;
}): Promise<void> {
  const year = new Date().getFullYear();
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Articolo in revisione — ProofPress</title>
</head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid rgba(26,26,26,0.1);">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:2px solid #1a1a1a;">
              <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(26,26,26,0.4);">Portale Giornalisti ProofPress</p>
              <h1 style="margin:8px 0 0;font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#1a1a1a;">Proof Press</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#dc2626;padding:32px 40px;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Revisione necessaria</p>
              <h2 style="margin:0 0 12px;font-size:24px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;line-height:1.3;">Il tuo articolo richiede alcune modifiche</h2>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.85);">La redazione ha esaminato il tuo articolo e ha alcune note per te. Puoi modificarlo e reinviarlo.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:13px;color:rgba(26,26,26,0.6);">Ciao <strong style="color:#1a1a1a;">${journalistName}</strong>,</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:rgba(26,26,26,0.75);">Il tuo articolo <strong style="color:#1a1a1a;">"${articleTitle}"</strong> è stato esaminato dalla redazione. Ecco le note:</p>
              <div style="background:#fef2f2;border-left:3px solid #dc2626;padding:16px 20px;margin:0 0 24px;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#1a1a1a;">${reviewNotes}</p>
              </div>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:rgba(26,26,26,0.75);">Apporta le modifiche suggerite e reinvia l'articolo dalla sezione "Rifiutati" del portale.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#1a1a1a;">
                    <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Vai al portale e modifica →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:rgba(26,26,26,0.4);">Per domande, rispondi a questa email o contatta la redazione.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(26,26,26,0.08);background:#faf8f3;">
              <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(26,26,26,0.35);">
                &copy; ${year} Proof Press &middot; <a href="https://proofpress.ai/privacy" style="color:rgba(26,26,26,0.35);">Privacy</a>
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
    subject: `Revisione necessaria — "${articleTitle}" su ProofPress`,
    html,
    text: `Ciao ${journalistName},\n\nIl tuo articolo "${articleTitle}" è stato esaminato dalla redazione ProofPress.\n\nNote della redazione:\n${reviewNotes}\n\nApporta le modifiche suggerite e reinvia dal portale: ${portalUrl}\n\nPer domande, rispondi a questa email.\n\n— Redazione ProofPress`,
  });
}

// ── sendDemoLinkEmail — invia link demo ProofPress Verify ─────────────────────
export async function sendDemoLinkEmail(params: {
  to: string;
  shareUrl: string;
  sha256?: string;
  trustGrade?: string;
  trustScore?: number;
  contentTitle?: string;
  senderName?: string;
}): Promise<void> {
  const { to, shareUrl, sha256, trustGrade, trustScore, contentTitle, senderName } = params;

  const gradeColors: Record<string, string> = {
    A: "#00e5c8", B: "#4ade80", C: "#facc15", D: "#fb923c", F: "#f87171",
  };
  const gradeColor = gradeColors[trustGrade ?? ""] ?? "#00e5c8";
  const gradeLabel = trustGrade ? `TrustGrade <strong style="color:${gradeColor}">${trustGrade}</strong> · Score ${trustScore ?? "—"}/100` : "";

  const html = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#0d1530;border-radius:16px;border:1px solid rgba(0,229,200,0.2);overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0f1e 0%,#0d1530 100%);padding:28px 32px;border-bottom:1px solid rgba(0,229,200,0.15);">
            <span style="font-size:1.1rem;font-weight:700;color:#00e5c8;letter-spacing:-0.01em;">⛓️ ProofPress <span style="color:#ffffff;font-weight:400;">Verify</span></span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:0.8rem;font-weight:700;color:rgba(226,232,240,0.4);text-transform:uppercase;letter-spacing:0.08em;">Demo Pipeline Verify</p>
            <h1 style="margin:0 0 16px;font-size:1.5rem;font-weight:800;color:#ffffff;line-height:1.2;">${senderName ? senderName + " ha condiviso con te" : "Qualcuno ha condiviso con te"} un'analisi ProofPress Verify</h1>
            ${contentTitle ? `<p style="margin:0 0 20px;font-size:0.95rem;color:rgba(226,232,240,0.7);line-height:1.6;"><strong style="color:#e2e8f0;">Contenuto analizzato:</strong> ${contentTitle}</p>` : ""}
            ${gradeLabel ? `<div style="display:inline-block;background:rgba(0,229,200,0.08);border:1px solid rgba(0,229,200,0.25);border-radius:8px;padding:10px 18px;margin-bottom:24px;font-size:0.9rem;color:#e2e8f0;">${gradeLabel}</div>` : ""}
            ${sha256 ? `<p style="margin:0 0 8px;font-size:0.72rem;font-weight:700;color:rgba(226,232,240,0.4);text-transform:uppercase;letter-spacing:0.08em;">🔐 Hash SHA-256</p><code style="display:block;font-family:'Courier New',monospace;font-size:0.75rem;color:#00e5c8;word-break:break-all;background:rgba(0,229,200,0.05);border:1px solid rgba(0,229,200,0.15);border-radius:8px;padding:12px 14px;margin-bottom:24px;">${sha256}</code>` : ""}
            <a href="${shareUrl}" style="display:inline-block;background:linear-gradient(135deg,#00897b 0%,#00b09b 100%);border-radius:10px;padding:13px 28px;font-size:0.95rem;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">⚡ Apri la Demo →</a>
            <p style="margin:24px 0 0;font-size:0.8rem;color:rgba(226,232,240,0.35);line-height:1.6;">Questa demo è pubblica e non richiede login. I risultati non vengono salvati nel database.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:0.75rem;color:rgba(226,232,240,0.3);">ProofPress Verify · Il protocollo di certificazione giornalistica AI-native · <a href="https://proofpress.ai/proofpress-verify" style="color:#00e5c8;text-decoration:none;">proofpress.ai</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${senderName ?? "Qualcuno"} ha condiviso un'analisi ProofPress Verify con te.\n\n${contentTitle ? `Contenuto: ${contentTitle}\n` : ""}${trustGrade ? `TrustGrade: ${trustGrade} · Score: ${trustScore ?? "—"}/100\n` : ""}${sha256 ? `Hash SHA-256: ${sha256}\n` : ""}\nApri la demo: ${shareUrl}\n\n---\nProofPress Verify · proofpress.ai`;

  await sendEmail({
    to,
    subject: `${senderName ?? "Un utente"} ha condiviso un'analisi ProofPress Verify`,
    html,
    text,
  });
}
