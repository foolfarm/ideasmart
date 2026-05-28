/**
 * ProofPress Special — Fasteer: La Guida Definitiva alla Modernizzazione del Codice Legacy
 * Invia la newsletter Special Fasteer a tutti gli iscritti attivi
 */

import { sendEmail } from "./email";
import { getActiveSubscribers } from "./db";
import { sendWithWarmup } from "./newsletterWarmup";
import { notifyOwner } from "./_core/notification";

const FASTEER_HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/fasteer_hero_ff378869.jpg";

// ─── Design tokens (coerenti con ProofPress Special) ─────────────────────────
const BG = "#ffffff";
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
  <title>PROOFPRESS SPECIAL — Il Debito Tecnico che Frena la Tua Azienda</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:${F_SANS};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;">
<tr><td align="center" style="padding:24px 16px;">

<!-- WRAPPER -->
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${BG};border:1px solid ${BORDER};">

  <!-- HEADER PROOFPRESS -->
  <tr>
    <td style="background:${DARK};padding:28px 40px 20px;text-align:center;border-bottom:3px solid ${ACCENT};">
      <p style="margin:0 0 4px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;">PROOFPRESS MAGAZINE</p>
      <h1 style="margin:0;font-family:${F_SERIF};font-size:38px;font-weight:700;color:#ffffff;letter-spacing:-1px;">ProofPress</h1>
      <p style="margin:6px 0 0;font-family:${F_SANS};font-size:11px;letter-spacing:4px;color:${ACCENT};text-transform:uppercase;font-weight:600;">SPECIAL EDITION</p>
      <div style="width:40px;height:2px;background:${ACCENT};margin:14px auto 0;"></div>
    </td>
  </tr>

  <!-- DATE + ISSUE -->
  <tr>
    <td style="padding:14px 40px;text-align:center;border-bottom:1px solid ${BORDER};">
      <p style="margin:0;font-family:${F_SANS};font-size:12px;color:${MUTED};">
        ${dateStrCap} &nbsp;·&nbsp; <strong style="color:${DARK};">FASTEER REPORT</strong> &nbsp;·&nbsp; Il Debito Tecnico che Frena la Tua Azienda
      </p>
    </td>
  </tr>

  <!-- HERO IMAGE -->
  <tr>
    <td style="padding:0;">
      <img src="${FASTEER_HERO_IMG}" alt="Legacy Code Modernization" width="640"
        style="display:block;width:100%;max-width:640px;height:auto;" />
    </td>
  </tr>

  <!-- EDITORIAL INTRO -->
  <tr>
    <td style="padding:36px 40px 28px;">
      <p style="margin:0 0 6px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:${ACCENT};text-transform:uppercase;font-weight:600;">PROOFPRESS SPECIAL — REPORT ESCLUSIVO</p>
      <h2 style="margin:8px 0 18px;font-family:${F_SERIF};font-size:28px;font-weight:700;color:${DARK};line-height:1.25;">
        Il Debito Tecnico Costa $2.41 Trilioni l'Anno.<br/>L'AI Può Azzerarlo in 90 Giorni.
      </h2>
      <p style="margin:0 0 16px;font-family:${F_SANS};font-size:15px;color:#374151;line-height:1.7;">
        Il codice legacy non è un problema IT. È un freno strutturale alla competitività aziendale. Ogni anno, le aziende statunitensi bruciano <strong>$2.41 trilioni</strong> in debito tecnico — una tassa occulta che erode dal 10% al 20% del budget IT e riduce la produttività dei team di sviluppo fino al 42%.
      </p>
      <p style="margin:0 0 16px;font-family:${F_SANS};font-size:15px;color:#374151;line-height:1.7;">
        Il mercato della Legacy Modernization vale <strong>$24.98 miliardi nel 2025</strong> e crescerà fino a <strong>$67.91 miliardi entro il 2031</strong> (CAGR 19.86%). La domanda supera l'offerta. I System Integrator tradizionali non riescono a scalare. Solo l'AI può risolvere il collo di bottiglia.
      </p>
      <p style="margin:0;font-family:${F_SANS};font-size:15px;color:#374151;line-height:1.7;">
        Fasteer ha analizzato il problema e costruito una risposta industriale. Il report che segue è la sintesi dei dati più rilevanti — scarica il documento completo per la stima precisa su costi, tempi e ROI per la tua azienda.
      </p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:${BORDER};"></div></td></tr>

  <!-- KEY FINDINGS -->
  <tr>
    <td style="padding:28px 40px;">
      <p style="margin:0 0 20px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;font-weight:600;">KEY FINDINGS — FASTEER REPORT 2026</p>

      <!-- Finding 1 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="4" style="background:${ACCENT};border-radius:2px;"></td>
          <td style="padding:0 0 0 16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:12px;font-weight:700;color:${ACCENT};text-transform:uppercase;letter-spacing:1px;">IL COSTO NASCOSTO</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;">
              Mantenere sistemi legacy scritti in COBOL, RPG o vecchie versioni di Java significa operare con un freno a mano tirato. La riscrittura manuale tramite System Integrator richiede <strong>3-5 anni</strong> e costa tra <strong>€5 e €15 milioni per milione di righe di codice</strong>. Il fai-da-te con LLM generici fallisce nel 70% dei casi per mancanza di contesto architetturale.
            </p>
          </td>
        </tr>
      </table>

      <!-- Finding 2 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="4" style="background:${ACCENT};border-radius:2px;"></td>
          <td style="padding:0 0 0 16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:12px;font-weight:700;color:${ACCENT};text-transform:uppercase;letter-spacing:1px;">LA SOLUZIONE AGENTICA — FASTEER</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;">
              Fasteer non è un assistente alla scrittura. È una <strong>catena di montaggio industriale</strong>: Agent Orchestrator che scansiona l'intera codebase, mappa le dipendenze, genera un PRD approvato dal CTO, poi traduce e valida il codice con unit test automatici. Equivalenza funzionale garantita.
            </p>
          </td>
        </tr>
      </table>

      <!-- Finding 3 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="4" style="background:${ACCENT};border-radius:2px;"></td>
          <td style="padding:0 0 0 16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:12px;font-weight:700;color:${ACCENT};text-transform:uppercase;letter-spacing:1px;">FRIO — ABBATTIMENTO DEI COSTI -87%</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;">
              Il motore FRIO instrada l'<strong>85% dei task su modelli open-source locali</strong> (Qwen, DeepSeek), riservando solo il 15% più complesso alle API commerciali. Il costo di inferenza scende da <strong>$15 a $2 per milione di token (-87%)</strong>. Più usi Fasteer, meno paghi: il Super RAG memorizza le correzioni e sposta progressivamente il carico sui modelli gratuiti.
            </p>
          </td>
        </tr>
      </table>

      <!-- Finding 4 -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
        <tr>
          <td width="4" style="background:${ACCENT};border-radius:2px;"></td>
          <td style="padding:0 0 0 16px;">
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:12px;font-weight:700;color:${ACCENT};text-transform:uppercase;letter-spacing:1px;">AIDAMASK — SOVRANITÀ DEL CODICE</p>
            <p style="margin:0;font-family:${F_SANS};font-size:14px;color:#374151;line-height:1.6;">
              Il codice sorgente è l'asset più prezioso di un'azienda. AidaMask anonimizza e tokenizza nomi di variabili, logiche di business e IP proprietario prima che escano dal perimetro aziendale. Architettura <strong>On-Premise / Private Cloud</strong>, certificata <strong>GDPR + ISO 27001</strong>. L'unica soluzione accettabile per banche, assicurazioni e settori regolamentati.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:${BORDER};"></div></td></tr>

  <!-- STAT BAR -->
  <tr>
    <td style="padding:24px 40px;background:#f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="33%" style="text-align:center;padding:0 8px;">
            <p style="margin:0;font-family:${F_SERIF};font-size:28px;font-weight:700;color:${ACCENT};">$2.41T</p>
            <p style="margin:4px 0 0;font-family:${F_SANS};font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">Costo annuo debito tecnico USA</p>
          </td>
          <td width="1" style="background:${BORDER};"></td>
          <td width="33%" style="text-align:center;padding:0 8px;">
            <p style="margin:0;font-family:${F_SERIF};font-size:28px;font-weight:700;color:${ACCENT};">-87%</p>
            <p style="margin:4px 0 0;font-family:${F_SANS};font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">Riduzione costi inferenza FRIO</p>
          </td>
          <td width="1" style="background:${BORDER};"></td>
          <td width="33%" style="text-align:center;padding:0 8px;">
            <p style="margin:0;font-family:${F_SERIF};font-size:28px;font-weight:700;color:${ACCENT};">$67.9B</p>
            <p style="margin:4px 0 0;font-family:${F_SANS};font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">Mercato Legacy Mod. 2031</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="padding:0 40px;"><div style="height:1px;background:${BORDER};"></div></td></tr>

  <!-- FASTEER SPONSOR BLOCK -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${DARK};">
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 6px;font-family:${F_SANS};font-size:10px;letter-spacing:3px;color:#6b7280;text-transform:uppercase;">PARTNER SPOTLIGHT</p>
            <div style="width:32px;height:1px;background:${ACCENT};margin:0 0 20px;"></div>
            <p style="margin:0 0 4px;font-family:${F_SANS};font-size:13px;font-weight:700;color:${ACCENT};letter-spacing:2px;text-transform:uppercase;">FASTEER</p>
            <h3 style="margin:0 0 14px;font-family:${F_SERIF};font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;">
              Da Spesa ad Asset.<br/>Il Fai-da-Te è una Tassa.<br/>Fasteer è un Investimento.
            </h3>
            <p style="margin:0 0 20px;font-family:${F_SANS};font-size:14px;color:#d1d5db;line-height:1.6;">
              In 48 ore analizziamo un campione del tuo codice legacy e ti consegniamo una stima precisa di costi, tempi e ROI rispetto alle alternative tradizionali. <strong style="color:#ffffff;">Assessment gratuito, nessun impegno.</strong>
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="https://fasteer.ai/report?utm_source=newsletter&utm_medium=email&utm_campaign=proofpress-special"
                    style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${F_SANS};font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 24px;border-radius:2px;">
                    SCARICA IL REPORT COMPLETO →
                  </a>
                </td>
                <td>
                  <a href="https://fasteer.ai?utm_source=newsletter&utm_medium=email&utm_campaign=proofpress-special"
                    style="display:inline-block;border:1px solid #4b5563;color:#d1d5db;font-family:${F_SANS};font-size:13px;font-weight:600;text-decoration:none;padding:13px 20px;border-radius:2px;">
                    Prenota Assessment →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-family:${F_SANS};font-size:11px;color:#6b7280;">
              ✉ hello@fasteer.ai &nbsp;·&nbsp; www.fasteer.ai &nbsp;·&nbsp; FoolFarm S.p.A. — 2026
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PROOFPRESS VERIFY BLOCK -->
  <tr>
    <td style="padding:28px 40px;background:#f9fafb;border-top:1px solid ${BORDER};">
      <p style="margin:0 0 8px;font-family:${F_SANS};font-size:11px;letter-spacing:3px;color:${MUTED};text-transform:uppercase;font-weight:600;">PROOFPRESS VERIFY™</p>
      <p style="margin:0 0 14px;font-family:${F_SERIF};font-size:18px;font-weight:700;color:${DARK};line-height:1.3;">
        Il futuro dell'informazione è la notizia certificata.
      </p>
      <p style="margin:0 0 16px;font-family:${F_SANS};font-size:13px;color:#374151;line-height:1.6;">
        Ogni contenuto pubblicato su ProofPress porta un codice crittografico verificabile — articolo, report, comunicato aziendale, output di Agent AI. La certificazione è l'unico antidoto alla disinformazione nell'era dei modelli generativi.
      </p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:10px;">
            <a href="https://proofpressverify.com?utm_source=newsletter&utm_medium=email&utm_campaign=fasteer-special"
              style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${F_SANS};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:11px 18px;border-radius:2px;">
              Scopri come funziona →
            </a>
          </td>
          <td>
            <a href="https://proofpressverify.com?utm_source=newsletter&utm_medium=email&utm_campaign=fasteer-special#certifica"
              style="display:inline-block;border:1px solid ${BORDER};color:${DARK};font-family:${F_SANS};font-size:12px;font-weight:600;text-decoration:none;padding:10px 16px;border-radius:2px;">
              Certifica la tua informazione →
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-family:${F_SANS};font-size:11px;color:${MUTED};">
        — Adrian Lenice, Fondatore ProofPress Verify &nbsp;·&nbsp; Disponibile per aziende, editori, studi legali e Agent AI
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:${DARK};padding:24px 40px;text-align:center;border-top:3px solid ${ACCENT};">
      <p style="margin:0 0 6px;font-family:${F_SERIF};font-size:18px;font-weight:700;color:#ffffff;">ProofPress</p>
      <p style="margin:0 0 10px;font-family:${F_SANS};font-size:11px;color:#6b7280;letter-spacing:2px;text-transform:uppercase;">Il Primo Sito di Informazione con Notizie Certificate</p>
      <p style="margin:0 0 14px;">
        <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=fasteer-special"
          style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${F_SANS};font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:12px 28px;border-radius:2px;">
          Leggi tutte le notizie su ProofPress →
        </a>
      </p>
      <p style="margin:0;font-family:${F_SANS};font-size:11px;color:#4b5563;line-height:1.6;">
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
  const subject = `PROOFPRESS SPECIAL — Il Debito Tecnico che Frena la Tua Azienda: Il Report Fasteer 2026`;
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
    console.error("[FasteerNewsletter] ❌ Errore invio test:", result.error);
    throw new Error(result.error);
  }
}

export async function sendFasteerNewsletterAll(): Promise<{ sent: number; errors: number }> {
  const subject = `PROOFPRESS SPECIAL — Il Debito Tecnico che Frena la Tua Azienda: Il Report Fasteer 2026`;
  const html = buildFasteerHtml();
  const BASE_URL = "https://proofpress.ai";

  console.log("[FasteerNewsletter] Recupero iscritti attivi...");
  const subscribers = await getActiveSubscribers();
  console.log(`[FasteerNewsletter] ${subscribers.length} iscritti attivi trovati`);

    const warmupResult = await sendWithWarmup(
    subscribers,
    async (sub) => {
      const unsubUrl = sub.unsubscribeToken
        ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
        : `${BASE_URL}/unsubscribe`;
      const personalizedHtml = html.replace(`${BASE_URL}/unsubscribe`, unsubUrl);
      return sendEmail({
        sender: 'daily',
        to: sub.email,
        subject,
        html: personalizedHtml,
        listUnsubscribeUrl: unsubUrl,
      });
    },
    '[FasteerNewsletter]'
  );
  const totalSent = warmupResult.totalSent;
  const totalErrors = warmupResult.totalErrors;
  console.log(`[FasteerNewsletter] ✅ ${totalSent}/${subscribers.length} inviati, ${totalErrors} errori`);
  await notifyOwner({
    title: `📧 ProofPress Special Fasteer inviata`,
    content: `Newsletter speciale Fasteer inviata a ${totalSent}/${subscribers.length} iscritti.`,
  });
  return { sent: totalSent, errors: totalErrors };
}

// Run diretto: npx tsx server/sendFasteerNewsletter.ts
if (process.argv[1]?.includes("sendFasteerNewsletter")) {
  const mode = process.argv[2];
  if (mode === "all") {
    sendFasteerNewsletterAll()
      .then((r) => { console.log("Done:", r); process.exit(0); })
      .catch((e) => { console.error(e); process.exit(1); });
  } else {
    sendFasteerNewsletterTest()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}
