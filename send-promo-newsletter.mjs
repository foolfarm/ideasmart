/**
 * Newsletter promozionale IdeaSmart — Stile Homepage
 * Font: SF Pro Display / system-ui
 * Colori: bianco #ffffff, nero #0a0a0a, crema #f5f0e8
 * Senza prezzi — focus: "crea la tua redazione agentica"
 *
 * Uso:
 *   node send-promo-newsletter.mjs                    → invio massivo a tutti gli iscritti
 *   node send-promo-newsletter.mjs test@example.com   → invio test a un singolo indirizzo
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const { DATABASE_URL, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME } = process.env;

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const BLACK = "#0a0a0a";
const CREAM = "#f5f0e8";
const WHITE = "#ffffff";
const GRAY = "#666666";
const LIGHT_BORDER = "rgba(10,10,10,0.08)";

/* ── HTML Newsletter ── */
function buildHtml() {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>IdeaSmart — Lancia il tuo giornale con l'AI</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${FONT};-webkit-font-smoothing:antialiased;">

<!-- Preheader nascosto -->
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${CREAM};">
  Il primo giornale che funziona anche senza una redazione. Scopri come lanciare la tua testata con 8 agenti AI.
</div>

<!-- Container principale -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- ═══ HEADER ═══ -->
  <tr><td style="padding:0 0 32px 0;text-align:center;">
    <div style="font-family:${FONT};font-size:28px;font-weight:900;letter-spacing:0.05em;color:${BLACK};text-transform:uppercase;">IDEASMART</div>
    <div style="margin-top:4px;font-size:9px;font-weight:700;letter-spacing:0.25em;color:${BLACK};opacity:0.35;text-transform:uppercase;">Giornalismo Agentico</div>
  </td></tr>

  <!-- ═══ HERO ═══ -->
  <tr><td style="background:${WHITE};padding:48px 40px 40px 40px;border-bottom:1px solid ${LIGHT_BORDER};">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-bottom:16px;">Per giornalisti, freelancer e giornali online</div>
    <h1 style="margin:0;font-family:${FONT};font-size:32px;font-weight:900;line-height:1.1;color:${BLACK};">
      Il primo giornale che funziona<br/>anche senza una redazione.
    </h1>
    <p style="margin:16px 0 0 0;font-size:18px;font-weight:500;line-height:1.5;color:${BLACK};opacity:0.55;">
      Costruisci e scala una testata con l'AI agentica. Tu porti la linea editoriale. La piattaforma fa il resto.
    </p>
  </td></tr>

  <!-- ═══ STATS BAR ═══ -->
  <tr><td style="background:${WHITE};padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="25%" style="padding:20px 0;text-align:center;border-right:1px solid ${LIGHT_BORDER};">
        <div style="font-size:24px;font-weight:900;color:${BLACK};">4.000+</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Fonti</div>
      </td>
      <td width="25%" style="padding:20px 0;text-align:center;border-right:1px solid ${LIGHT_BORDER};">
        <div style="font-size:24px;font-weight:900;color:${BLACK};">8</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Agenti AI</div>
      </td>
      <td width="25%" style="padding:20px 0;text-align:center;border-right:1px solid ${LIGHT_BORDER};">
        <div style="font-size:24px;font-weight:900;color:${BLACK};">100%</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Verificato</div>
      </td>
      <td width="25%" style="padding:20px 0;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:${BLACK};">24/7</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Operativo</div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- ═══ IL PROBLEMA ═══ -->
  <tr><td style="background:${CREAM};padding:40px 40px 32px 40px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-bottom:12px;">Il problema</div>
    <h2 style="margin:0;font-family:${FONT};font-size:24px;font-weight:900;line-height:1.2;color:${BLACK};">
      Oggi fare giornalismo &egrave; inefficiente.
    </h2>
    <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:${GRAY};">
      Una redazione tradizionale costa <strong style="color:${BLACK};">centinaia di migliaia di euro all'anno</strong>. Servono giornalisti, editor, fact-checker, social media manager. Dalla notizia alla pubblicazione passano ore. E la qualit&agrave; oscilla.
    </p>
    <div style="margin-top:20px;padding:16px 20px;border-left:4px solid ${BLACK};background:rgba(10,10,10,0.03);">
      <p style="margin:0;font-size:16px;font-weight:700;line-height:1.4;color:${BLACK};">
        La maggior parte delle testate non scala.<br/>
        <span style="opacity:0.35;">E chi scala, perde qualit&agrave;.</span>
      </p>
    </div>
  </td></tr>

  <!-- ═══ LA SOLUZIONE ═══ -->
  <tr><td style="background:${WHITE};padding:40px 40px 32px 40px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-bottom:12px;">La soluzione</div>
    <h2 style="margin:0;font-family:${FONT};font-size:24px;font-weight:900;line-height:1.2;color:${BLACK};">
      Una redazione completa di 8 agenti AI.
    </h2>
    <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:${GRAY};">
      Market Scout, Data Verifier, Research Writer, Senior Analyst, Fact Checker, Publisher, Social Editor, Newsletter Curator. Lavorano insieme come un vero team editoriale &mdash; 24 ore su 24, 7 giorni su 7.
    </p>

    <!-- Due colonne: Tu / La piattaforma -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr>
      <td width="48%" valign="top" style="padding-right:12px;">
        <div style="border-left:3px solid ${BLACK};padding-left:16px;">
          <p style="margin:0;font-size:15px;font-weight:700;color:${BLACK};">Tu porti la linea editoriale.</p>
          <p style="margin:4px 0 0 0;font-size:13px;color:${GRAY};">Decidi il tono, il posizionamento, i temi. La direzione resta tua.</p>
        </div>
      </td>
      <td width="4%"></td>
      <td width="48%" valign="top">
        <div style="border-left:3px solid ${BLACK};padding-left:16px;">
          <p style="margin:0;font-size:15px;font-weight:700;color:${BLACK};">La piattaforma fa il resto.</p>
          <p style="margin:4px 0 0 0;font-size:13px;color:${GRAY};">Raccolta, verifica, scrittura, pubblicazione, distribuzione. Tutto automatico.</p>
        </div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- ═══ VERIFY ═══ -->
  <tr><td style="background:${BLACK};padding:40px 40px 36px 40px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:12px;">Tecnologia proprietaria</div>
    <h2 style="margin:0;font-family:${FONT};font-size:24px;font-weight:900;line-height:1.2;color:${WHITE};">
      Non &egrave; solo AI.<br/>
      <span style="opacity:0.3;">&Egrave; AI + certificazione.</span>
    </h2>
    <div style="margin-top:12px;display:inline-block;padding:6px 14px;border:1px solid rgba(255,255,255,0.2);">
      <span style="font-size:9px;font-weight:900;letter-spacing:0.3em;color:rgba(255,255,255,0.5);">POWERED BY</span>
      <span style="font-size:15px;font-weight:900;color:${WHITE};letter-spacing:0.1em;margin-left:6px;">VERIFY</span>
    </div>
    <p style="margin:16px 0 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.5);">
      Ogni notizia viene analizzata, verificata e certificata con un <strong style="color:rgba(255,255,255,0.8);">hash crittografico immutabile</strong>. Tracciabilit&agrave;, trasparenza e verificabilit&agrave; nel tempo.
    </p>
  </td></tr>

  <!-- ═══ COSA PUOI FARE ═══ -->
  <tr><td style="background:${WHITE};padding:40px 40px 32px 40px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-bottom:12px;">Cosa puoi fare</div>
    <h2 style="margin:0;font-family:${FONT};font-size:24px;font-weight:900;line-height:1.2;color:${BLACK};">
      Un'unica piattaforma, infinite possibilit&agrave;.
    </h2>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr>
      <td width="48%" valign="top" style="padding:16px 16px 16px 0;border-bottom:1px solid ${LIGHT_BORDER};">
        <div style="font-size:8px;font-weight:900;letter-spacing:0.2em;color:${BLACK};opacity:0.2;margin-bottom:6px;">NEW</div>
        <p style="margin:0;font-size:15px;font-weight:700;color:${BLACK};">Lanciare una nuova testata digitale</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:${GRAY};">Parti da zero e vai live in pochi giorni.</p>
      </td>
      <td width="4%"></td>
      <td width="48%" valign="top" style="padding:16px 0 16px 0;border-bottom:1px solid ${LIGHT_BORDER};">
        <div style="font-size:8px;font-weight:900;letter-spacing:0.2em;color:${BLACK};opacity:0.2;margin-bottom:6px;">SCALE</div>
        <p style="margin:0;font-size:15px;font-weight:700;color:${BLACK};">Automatizzare un giornale esistente</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:${GRAY};">Riduci i costi, aumenta la produzione.</p>
      </td>
    </tr>
    <tr>
      <td width="48%" valign="top" style="padding:16px 16px 16px 0;">
        <div style="font-size:8px;font-weight:900;letter-spacing:0.2em;color:${BLACK};opacity:0.2;margin-bottom:6px;">VERTICAL</div>
        <p style="margin:0;font-size:15px;font-weight:700;color:${BLACK};">Creare vertical media</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:${GRAY};">AI, startup, finanza, sport, tech. Qualsiasi verticale.</p>
      </td>
      <td width="4%"></td>
      <td width="48%" valign="top" style="padding:16px 0 16px 0;">
        <div style="font-size:8px;font-weight:900;letter-spacing:0.2em;color:${BLACK};opacity:0.2;margin-bottom:6px;">SOLO</div>
        <p style="margin:0;font-size:15px;font-weight:700;color:${BLACK};">Aprire una rubrica personale</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:${GRAY};">Sei un giornalista? Lancia la tua rubrica scalabile.</p>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- ═══ PROVA SOCIALE ═══ -->
  <tr><td style="background:${CREAM};padding:32px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="25%" style="text-align:center;padding:12px 0;">
        <div style="font-size:28px;font-weight:900;color:${BLACK};">6.900+</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Lettori attivi</div>
      </td>
      <td width="25%" style="text-align:center;padding:12px 0;">
        <div style="font-size:28px;font-weight:900;color:${BLACK};">3</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Canali tematici</div>
      </td>
      <td width="25%" style="text-align:center;padding:12px 0;">
        <div style="font-size:28px;font-weight:900;color:${BLACK};">20+</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Ricerche/giorno</div>
      </td>
      <td width="25%" style="text-align:center;padding:12px 0;">
        <div style="font-size:28px;font-weight:900;color:${BLACK};">1</div>
        <div style="font-size:8px;font-weight:700;letter-spacing:0.15em;color:${BLACK};opacity:0.3;text-transform:uppercase;margin-top:4px;">Persona nel team</div>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- ═══ CTA FINALE ═══ -->
  <tr><td style="background:${BLACK};padding:48px 40px;text-align:center;">
    <h2 style="margin:0;font-family:${FONT};font-size:26px;font-weight:900;line-height:1.2;color:${WHITE};">
      Pronto a lanciare<br/>il tuo giornale?
    </h2>
    <p style="margin:12px 0 24px 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.5);">
      Anche con una sola persona nel team. Setup in pochi giorni.<br/>Nessun costo nascosto.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td style="padding-right:12px;">
        <a href="https://ideasmart.ai/chi-siamo#demo" style="display:inline-block;padding:14px 32px;background:${WHITE};color:${BLACK};font-family:${FONT};font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">
          Prenota una demo &rarr;
        </a>
      </td>
      <td>
        <a href="https://ideasmart.ai/per-giornalisti" style="display:inline-block;padding:14px 32px;border:2px solid rgba(255,255,255,0.3);color:${WHITE};font-family:${FONT};font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">
          Scopri l'offerta
        </a>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- ═══ FOOTER ═══ -->
  <tr><td style="padding:32px 40px;text-align:center;">
    <div style="font-family:${FONT};font-size:16px;font-weight:900;letter-spacing:0.05em;color:${BLACK};text-transform:uppercase;">IDEASMART</div>
    <p style="margin:8px 0 0 0;font-size:11px;color:${BLACK};opacity:0.3;">
      Notizie quotidiane su AI, Startup e Venture Capital
    </p>
    <p style="margin:16px 0 0 0;font-size:11px;color:${BLACK};opacity:0.3;">
      <a href="https://ideasmart.ai" style="color:${BLACK};opacity:0.5;text-decoration:underline;">ideasmart.ai</a>
      &nbsp;&middot;&nbsp;
      <a href="mailto:info@ideasmart.ai" style="color:${BLACK};opacity:0.5;text-decoration:underline;">info@ideasmart.ai</a>
    </p>
    <p style="margin:20px 0 0 0;font-size:10px;color:${BLACK};opacity:0.2;">
      Ricevi questa email perch&eacute; sei iscritto alla newsletter IdeaSmart.<br/>
      <a href="https://ideasmart.ai/api/newsletter/unsubscribe?email={{email}}" style="color:${BLACK};opacity:0.5;text-decoration:underline;">Disiscriviti</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

/* ── Invio email via SendGrid ── */
async function sendEmail(to, html) {
  const fromName = SENDGRID_FROM_NAME || "Ideasmart Daily";
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: SENDGRID_FROM_EMAIL || "info@ideasmart.ai", name: fromName },
      subject: "Lancia il tuo giornale con l'AI — anche con 1 sola persona",
      content: [{ type: "text/html", value: html.replace("{{email}}", encodeURIComponent(to)) }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid ${res.status}: ${body}`);
  }
}

/* ── Main ── */
async function main() {
  const testEmail = process.argv[2];
  const html = buildHtml();

  const conn = await mysql.createConnection(DATABASE_URL);
  const [rows] = await conn.execute(
    "SELECT email FROM subscribers WHERE status = 'active'"
  );
   console.log(`\u{1F4E7} Trovati ${rows.length} iscritti attivi alla newsletter`);

  if (testEmail) {
    console.log(`\u{1F9EA} MODALIT\u00C0 TEST \u2014 invio solo a: ${testEmail}`);
    await sendEmail(testEmail, html);
    console.log(`\u2705 Test inviato a ${testEmail}`);
  } else {
    console.log(`\u{1F680} Invio massivo a ${rows.length} iscritti...`);
    let ok = 0, fail = 0;
    for (const row of rows) {
      try {
        await sendEmail(row.email, html);
        ok++;
        if (ok % 100 === 0) console.log(`   ${ok}/${rows.length} inviati...`);
      } catch (err) {
        fail++;
         console.error(`\u274C Errore per ${row.email}: ${err.message}`);
      }
    }
    console.log(`\u2705 Completato: ${ok} inviati, ${fail} errori`);
  }

  await conn.end();
}

main().catch(console.error);
