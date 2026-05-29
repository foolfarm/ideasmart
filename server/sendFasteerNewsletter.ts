/**
 * ProofPress Special — Fasteer: La Guida Definitiva alla Modernizzazione del Codice Legacy
 * Versione 2.0 — Stile elegante, meno testo, più selling, banner ufficiale al centro
 */

import { sendEmail } from "./email";
import { getActiveSubscribers } from "./db";
import { sendWithWarmup } from "./newsletterWarmup";
import { notifyOwner } from "./_core/notification";

const BANNER_UFFICIALE = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/banners/fasteer_guida_definitiva_ufficiale.png";
const UTM = "utm_source=newsletter&utm_medium=email&utm_campaign=proofpress-special";
const REPORT_URL = `https://fasteer.ai/report?${UTM}`;

// ─── Design tokens ────────────────────────────────────────────────────────────
const DARK = "#0a0f1e";
const ACCENT = "#cc0000";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const F_SERIF = "Georgia, 'Times New Roman', serif";
const F_SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

function buildFasteerHtml(): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const dateStrCap = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ProofPress Special — Fasteer: La Guida Definitiva al Codice Legacy</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:${F_SANS};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;">
<tr><td align="center" style="padding:24px 16px;">

<!-- WRAPPER -->
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#0a0f1e;">

  <!-- HEADER -->
  <tr>
    <td style="padding:28px 0 20px;text-align:center;border-bottom:1px solid #1e2a3a;">
      <p style="margin:0 0 4px;font-family:${F_SANS};font-size:10px;letter-spacing:4px;color:#4b5563;text-transform:uppercase;">PROOFPRESS MAGAZINE</p>
      <h1 style="margin:0;font-family:${F_SERIF};font-size:34px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">ProofPress</h1>
      <p style="margin:6px 0 0;font-family:${F_SANS};font-size:10px;letter-spacing:4px;color:${ACCENT};text-transform:uppercase;font-weight:600;">SPECIAL EDITION</p>
    </td>
  </tr>

  <!-- DATE BAR -->
  <tr>
    <td style="padding:12px 0;text-align:center;">
      <p style="margin:0;font-family:${F_SANS};font-size:11px;color:#4b5563;letter-spacing:1px;">
        ${dateStrCap}
      </p>
    </td>
  </tr>

  <!-- EYEBROW -->
  <tr>
    <td style="padding:20px 0 0;text-align:center;">
      <p style="margin:0;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;">ProofPress presenta</p>
    </td>
  </tr>

  <!-- BANNER UFFICIALE — full width, cliccabile -->
  <tr>
    <td style="padding:16px 0 0;">
      <a href="${REPORT_URL}" style="display:block;text-decoration:none;">
        <img src="${BANNER_UFFICIALE}"
          alt="La Guida Definitiva alla Modernizzazione del Codice Legacy — Fasteer"
          width="620"
          style="display:block;width:100%;max-width:620px;height:auto;border-radius:4px;" />
      </a>
    </td>
  </tr>

  <!-- HEADLINE -->
  <tr>
    <td style="padding:32px 0 8px;text-align:center;">
      <h2 style="margin:0 0 12px;font-family:${F_SERIF};font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
        Il Codice Legacy Costa alle Aziende<br/><span style="color:${ACCENT};">$2.41 Trilioni l'Anno.</span>
      </h2>
      <p style="margin:0;font-family:${F_SANS};font-size:15px;color:#9ca3af;line-height:1.6;max-width:480px;margin:0 auto;">
        Fasteer ha scritto la guida operativa che mancava al mercato.<br/>
        Scaricala gratis. Leggi in 20 minuti. Agisci domani.
      </p>
    </td>
  </tr>

  <!-- STAT BAR — 3 numeri -->
  <tr>
    <td style="padding:28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e2a3a;border-radius:4px;overflow:hidden;">
        <tr>
          <td width="33%" style="text-align:center;padding:20px 8px;border-right:1px solid #1e2a3a;">
            <p style="margin:0;font-family:${F_SERIF};font-size:30px;font-weight:700;color:${ACCENT};">$2.41T</p>
            <p style="margin:6px 0 0;font-family:${F_SANS};font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Debito tecnico annuo</p>
          </td>
          <td width="33%" style="text-align:center;padding:20px 8px;border-right:1px solid #1e2a3a;">
            <p style="margin:0;font-family:${F_SERIF};font-size:30px;font-weight:700;color:${ACCENT};">-87%</p>
            <p style="margin:6px 0 0;font-family:${F_SANS};font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Costi inferenza con FRIO</p>
          </td>
          <td width="33%" style="text-align:center;padding:20px 8px;">
            <p style="margin:0;font-family:${F_SERIF};font-size:30px;font-weight:700;color:${ACCENT};">90gg</p>
            <p style="margin:6px 0 0;font-family:${F_SANS};font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Modernizzazione completa</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- COSA TROVI NELLA GUIDA — 4 bullet concisi -->
  <tr>
    <td style="padding:0 0 28px;">
      <p style="margin:0 0 16px;font-family:${F_SANS};font-size:10px;letter-spacing:3px;color:#4b5563;text-transform:uppercase;">Cosa trovi nella guida</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 12px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="24" style="vertical-align:top;padding-top:2px;">
                  <div style="width:6px;height:6px;background:${ACCENT};border-radius:50%;margin-top:5px;"></div>
                </td>
                <td>
                  <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#e5e7eb;line-height:1.5;">
                    <strong style="color:#ffffff;">Il vero costo del legacy</strong> — quanto stai perdendo ogni anno senza saperlo
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="24" style="vertical-align:top;padding-top:2px;">
                  <div style="width:6px;height:6px;background:${ACCENT};border-radius:50%;margin-top:5px;"></div>
                </td>
                <td>
                  <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#e5e7eb;line-height:1.5;">
                    <strong style="color:#ffffff;">La roadmap in 5 fasi</strong> — da assessment a go-live in 90 giorni
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="24" style="vertical-align:top;padding-top:2px;">
                  <div style="width:6px;height:6px;background:${ACCENT};border-radius:50%;margin-top:5px;"></div>
                </td>
                <td>
                  <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#e5e7eb;line-height:1.5;">
                    <strong style="color:#ffffff;">ROI calcolato</strong> — benchmark reali su costi, tempi e risparmio
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="24" style="vertical-align:top;padding-top:2px;">
                  <div style="width:6px;height:6px;background:${ACCENT};border-radius:50%;margin-top:5px;"></div>
                </td>
                <td>
                  <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#e5e7eb;line-height:1.5;">
                    <strong style="color:#ffffff;">Sicurezza e compliance</strong> — architettura On-Premise, GDPR + ISO 27001
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA PRINCIPALE — grande, centrato -->
  <tr>
    <td style="padding:0 0 40px;text-align:center;">
      <a href="${REPORT_URL}"
        style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${F_SANS};font-size:15px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:18px 48px;border-radius:2px;">
        SCARICA GRATIS LA GUIDA →
      </a>
      <p style="margin:12px 0 0;font-family:${F_SANS};font-size:11px;color:#4b5563;">
        fasteer.ai/report &nbsp;·&nbsp; Gratuito, nessuna registrazione richiesta
      </p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0;"><div style="height:1px;background:#1e2a3a;"></div></td></tr>

  <!-- FOOTER PROOFPRESS -->
  <tr>
    <td style="padding:24px 0;text-align:center;">
      <p style="margin:0 0 4px;font-family:${F_SERIF};font-size:16px;font-weight:700;color:#ffffff;">ProofPress</p>
      <p style="margin:0 0 12px;font-family:${F_SANS};font-size:10px;color:#4b5563;letter-spacing:2px;text-transform:uppercase;">Il Primo Sito di Informazione con Notizie Certificate</p>
      <p style="margin:0;font-family:${F_SANS};font-size:11px;color:#374151;line-height:1.6;">
        Hai ricevuto questa email perché sei iscritto alla newsletter ProofPress.<br/>
        <a href="https://proofpress.ai/unsubscribe" style="color:#6b7280;">Cancella iscrizione</a>
      </p>
    </td>
  </tr>

</table>
<!-- END WRAPPER -->

</td></tr>
</table>
</body>
</html>`;
}

async function sendFasteerNewsletterTest(): Promise<void> {
  const subject = `ProofPress presenta: La Guida Definitiva al Codice Legacy — Scarica Gratis`;
  const html = buildFasteerHtml();
  const TEST_EMAIL = "ac@acinelli.com";
  const BASE_URL = "https://proofpress.ai";
  console.log(`[FasteerNewsletter] Invio test a ${TEST_EMAIL}...`);
  const result = await sendEmail({
    sender: 'daily',
    to: TEST_EMAIL,
    subject,
    html,
    listUnsubscribeUrl: `${BASE_URL}/unsubscribe`,
  });
  if (result.success) {
    console.log(`[FasteerNewsletter] ✅ Test inviato a ${TEST_EMAIL}`);
  } else {
    console.error(`[FasteerNewsletter] ❌ Errore invio test:`, result.error);
  }
}

export async function sendFasteerNewsletterAll(): Promise<void> {
  const subject = `ProofPress presenta: La Guida Definitiva al Codice Legacy — Scarica Gratis`;
  const html = buildFasteerHtml();
  const BASE_URL = "https://proofpress.ai";

  console.log(`[FasteerNewsletter] Recupero iscritti attivi...`);
  const subscribers = await getActiveSubscribers();
  if (!subscribers || subscribers.length === 0) {
    console.log(`[FasteerNewsletter] Nessun iscritto attivo trovato.`);
    return;
  }
  console.log(`[FasteerNewsletter] Invio a ${subscribers.length} iscritti...`);

  const result = await sendWithWarmup(
    subscribers,
    async (sub: { email: string }) => {
      return sendEmail({
        sender: 'daily',
        to: sub.email,
        subject,
        html,
        listUnsubscribeUrl: `${BASE_URL}/unsubscribe`,
      });
    },
    '[FasteerNewsletter]'
  );

  console.log(`[FasteerNewsletter] ✅ Invio completato: ${result.totalSent} inviati, ${result.totalErrors} falliti`);

  await notifyOwner({
    title: `Newsletter Fasteer Special inviata`,
    content: `Inviata a ${result.totalSent} iscritti. Falliti: ${result.totalErrors}.`,
  });
}

// ─── Entry point CLI ──────────────────────────────────────────────────────────
const mode = process.argv[2];
if (mode === 'test') {
  sendFasteerNewsletterTest().catch(console.error);
} else if (mode === 'all') {
  sendFasteerNewsletterAll().catch(console.error);
} else {
  console.log('Usage: npx tsx sendFasteerNewsletter.ts [test|all]');
}
