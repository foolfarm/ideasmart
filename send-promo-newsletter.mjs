import "dotenv/config";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || "info@ideasmart.ai";
const fromName = process.env.SENDGRID_FROM_NAME || "Ideasmart Daily";
const DATABASE_URL = process.env.DATABASE_URL;

if (!apiKey) { console.error("SENDGRID_API_KEY non configurata"); process.exit(1); }
if (!DATABASE_URL) { console.error("DATABASE_URL non configurata"); process.exit(1); }

// ── Connessione DB per recuperare iscritti ──
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(DATABASE_URL);

const [rows] = await conn.execute(
  "SELECT email, unsubscribeToken FROM subscribers WHERE status = 'active'"
);
await conn.end();

const subscribers = rows.map(r => ({ email: r.email, token: r.unsubscribeToken }));
console.log(`📧 Trovati ${subscribers.length} iscritti attivi alla newsletter`);

if (subscribers.length === 0) {
  console.log("Nessun iscritto attivo. Esco.");
  process.exit(0);
}

// ── Destinatario test (se passato come argomento) ──
const testEmail = process.argv[2];
const isTest = !!testEmail;

if (isTest) {
  console.log(`🧪 MODALITÀ TEST — invio solo a: ${testEmail}`);
} else {
  console.log(`📤 INVIO MASSIVO a ${subscribers.length} iscritti`);
}

// ── Template HTML Newsletter Promozionale ──
const year = new Date().getFullYear();
const baseUrl = "https://ideasmart.ai";

function buildPromoHtml(unsubscribeUrl) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>La tua redazione agentica — Ideasmart</title>
</head>
<body style="margin:0;padding:0;background-color:#ede8de;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<!-- WRAPPER -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ede8de;">
<tr><td align="center" style="padding:20px 0;">

<!-- CONTAINER -->
<table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background-color:#f5f0e8;border-radius:4px;overflow:hidden;border:1px solid #d8d0c0;">

  <!-- TOP BAR -->
  <tr>
    <td style="background-color:#0a1628;padding:10px 32px;border-bottom:2px solid #00b4a0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:10px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.12em;text-transform:uppercase;">
            PIATTAFORMA DI GIORNALISMO AGENTICO
          </td>
          <td align="right" style="font-size:10px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;">
            Marzo ${year}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HEADER / LOGO -->
  <tr>
    <td align="center" style="padding:36px 32px 28px;background:#f5f0e8;border-bottom:1px solid #d8d0c0;">
      <div style="margin-bottom:6px;">
        <span style="font-size:52px;font-weight:700;color:#0a1628;letter-spacing:-2px;font-family:Georgia,'Times New Roman',serif;">IDEA</span><span style="font-size:52px;font-weight:700;color:#00b4a0;letter-spacing:-2px;font-family:Georgia,'Times New Roman',serif;">SMART</span>
      </div>
      <div style="font-size:10px;color:#6b7280;letter-spacing:0.22em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:16px;">LA PRIMA PIATTAFORMA DI GIORNALISMO AGENTICO</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:4px;">
        <tr><td style="border-top:2px solid #00b4a0;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:1px solid #d8d0c0;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
    </td>
  </tr>

  <!-- HERO SCURO -->
  <tr>
    <td style="background:#0a0a0a;padding:44px 32px;">
      <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.35);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Il futuro dell'editoria</p>
      <h1 style="margin:0 0 20px;font-size:30px;font-weight:900;letter-spacing:-0.02em;color:#ffffff;line-height:1.2;font-family:Georgia,'Times New Roman',serif;">
        E se potessi lanciare il tuo giornale domani mattina?
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.65);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Con IdeaSmart puoi creare una <strong style="color:#ffffff;">redazione agentica completa</strong>: 8 agenti AI che lavorano 24/7, raccolgono notizie da oltre <strong style="color:#ffffff;">4.000 fonti certificate</strong>, scrivono articoli, verificano ogni dato e pubblicano automaticamente &mdash; newsletter, sito, social. <strong style="color:#00b4a0;">Tu decidi la linea editoriale. L'AI fa tutto il resto.</strong>
      </p>
    </td>
  </tr>

  <!-- CHI LO STA GIÀ FACENDO -->
  <tr>
    <td style="padding:28px 32px 24px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="margin:0 0 16px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; IdeaSmart in numeri</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="25%" align="center" style="padding:12px 4px;">
            <div style="font-size:28px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">6.900+</div>
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:4px;">Lettori attivi</div>
          </td>
          <td width="25%" align="center" style="padding:12px 4px;">
            <div style="font-size:28px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">14</div>
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:4px;">Canali tematici</div>
          </td>
          <td width="25%" align="center" style="padding:12px 4px;">
            <div style="font-size:28px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">20+</div>
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:4px;">Ricerche al giorno</div>
          </td>
          <td width="25%" align="center" style="padding:12px 4px;">
            <div style="font-size:28px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">450+</div>
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:4px;">Fonti monitorate</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- COSA PUOI FARE -->
  <tr>
    <td style="padding:28px 32px;background:#f5f0e8;border-bottom:1px solid #d8d0c0;">
      <p style="margin:0 0 20px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Cosa puoi costruire con IdeaSmart</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr>
          <td style="padding:16px;background:#ffffff;border:1px solid #e8e0d0;border-radius:4px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#128240; Il tuo giornale verticale</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              Scegli il settore &mdash; AI, fintech, biotech, real estate, sport &mdash; e lancia una testata specializzata. La piattaforma genera notizie, editoriali, ricerche e newsletter ogni giorno, automaticamente.
            </p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr>
          <td style="padding:16px;background:#ffffff;border:1px solid #e8e0d0;border-radius:4px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#128200; Intelligence per il tuo business</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              Monitora competitor, trend di mercato, round di investimento e M&A. Ricevi briefing quotidiani personalizzati con dati verificati e analisi pronte per il board.
            </p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:16px;background:#ffffff;border:1px solid #e8e0d0;border-radius:4px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#128231; Newsletter che si scrivono da sole</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              Costruisci un'audience con newsletter professionali generate, verificate e inviate automaticamente. Con distribuzione multi-canale: email, sito web, LinkedIn.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- 8 AGENTI AI -->
  <tr>
    <td style="padding:28px 32px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="margin:0 0 16px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; La tua redazione: 8 agenti AI specializzati</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">01</strong> &nbsp;Market Scout &mdash; <span style="color:#6b7280;">4.000+ fonti/giorno</span></p>
          </td>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">02</strong> &nbsp;Data Verifier &mdash; <span style="color:#6b7280;">Incrocio multi-fonte</span></p>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">03</strong> &nbsp;Research Writer &mdash; <span style="color:#6b7280;">Articoli strutturati</span></p>
          </td>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">04</strong> &nbsp;Senior Analyst &mdash; <span style="color:#6b7280;">Analisi di mercato</span></p>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">05</strong> &nbsp;Fact Checker &mdash; <span style="color:#6b7280;">Verifica e VERIFY&trade;</span></p>
          </td>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">06</strong> &nbsp;Publisher &mdash; <span style="color:#6b7280;">Distribuzione automatica</span></p>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">07</strong> &nbsp;Social Editor &mdash; <span style="color:#6b7280;">Post LinkedIn e social</span></p>
          </td>
          <td width="50%" style="padding:8px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong style="color:#00b4a0;">08</strong> &nbsp;Newsletter Curator &mdash; <span style="color:#6b7280;">Invio automatico</span></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- VERIFY -->
  <tr>
    <td style="padding:24px 32px;background:#0a1628;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p style="margin:0 0 8px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Tecnologia proprietaria</p>
            <p style="margin:0 0 12px;font-size:22px;font-weight:900;color:#00b4a0;font-family:Georgia,'Times New Roman',serif;">VERIFY&trade;</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.65);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              Ogni notizia viene analizzata da un protocollo di validazione agentica multi-fonte. Il sistema misura affidabilit&agrave;, coerenza fattuale e obiettivit&agrave;, genera un <strong style="color:#ffffff;">Verification Report</strong> e lo sigilla con un <strong style="color:#ffffff;">hash crittografico immutabile</strong> &mdash; tracciabile e verificabile nel tempo.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA PRINCIPALE -->
  <tr>
    <td align="center" style="padding:36px 32px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">
        Pronto a lanciare la tua testata?
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Prenota una demo gratuita e scopri come costruire il tuo giornale con l'AI.
      </p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="background:#0a1628;border-radius:4px;">
            <a href="mailto:info@ideasmart.ai?subject=Demo%20IdeaSmart%20%E2%80%94%20Redazione%20Agentica&body=Ciao%2C%20vorrei%20prenotare%20una%20demo%20per%20scoprire%20come%20creare%20la%20mia%20redazione%20agentica%20con%20IdeaSmart." style="display:inline-block;padding:14px 36px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              Prenota una demo &rarr;
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        oppure <a href="${baseUrl}/chi-siamo" style="color:#00b4a0;text-decoration:underline;">scopri tutti i dettagli</a>
      </p>
    </td>
  </tr>

  <!-- SOCIAL PROOF -->
  <tr>
    <td style="padding:24px 32px;background:#f5f0e8;border-bottom:1px solid #d8d0c0;">
      <p style="margin:0;font-size:13px;line-height:1.7;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-align:center;font-style:italic;">
        &ldquo;IdeaSmart dimostra che una sola persona, con la giusta tecnologia, pu&ograve; gestire una testata che normalmente richiederebbe una redazione di 10 giornalisti.&rdquo;
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-align:center;">
        &mdash; 6.900+ lettori attivi &middot; 3 newsletter settimanali &middot; 1 persona nel team
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:20px 32px;background:#0a1628;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:11px;color:rgba(255,255,255,0.4);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            &copy; ${year} IdeaSmart &middot; AI &middot; Startup &middot; Venture Capital
          </td>
          <td align="right" style="font-size:11px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <a href="${baseUrl}" style="color:rgba(255,255,255,0.4);text-decoration:none;">ideasmart.ai</a>
          </td>
        </tr>
      </table>
      ${unsubscribeUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
        <tr>
          <td align="center" style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <a href="${unsubscribeUrl}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">Disiscriviti dalla newsletter</a>
          </td>
        </tr>
      </table>` : ''}
    </td>
  </tr>

</table>
<!-- /CONTAINER -->

</td></tr>
</table>
<!-- /WRAPPER -->

</body>
</html>`;
}

// ── Invio con SendGrid ──
const BATCH_SIZE = 100;
const DELAY_MS = 1500;

async function sendViaApi(to, html) {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject: "Lancia il tuo giornale con l'AI — IdeaSmart",
      content: [{ type: "text/html", value: html }],
    }),
  });
  return res.status >= 200 && res.status < 300;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

if (isTest) {
  const html = buildPromoHtml("");
  const ok = await sendViaApi(testEmail, html);
  console.log(ok ? `✅ Test inviato a ${testEmail}` : `❌ Errore invio a ${testEmail}`);
} else {
  let sent = 0, errors = 0;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    for (const sub of batch) {
      const unsubUrl = sub.token ? `${baseUrl}/api/unsubscribe?token=${sub.token}` : "";
      const html = buildPromoHtml(unsubUrl);
      const ok = await sendViaApi(sub.email, html);
      if (ok) sent++; else errors++;
    }
    console.log(`📤 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${sent} inviati, ${errors} errori`);
    if (i + BATCH_SIZE < subscribers.length) await sleep(DELAY_MS);
  }
  console.log(`\n✅ Invio completato: ${sent} inviati, ${errors} errori su ${subscribers.length} totali`);
}
