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

// Recupera tutti gli iscritti attivi alla newsletter
const [rows] = await conn.execute(
  "SELECT email FROM subscribers WHERE status = 'active'"
);
await conn.end();

const subscribers = rows.map(r => r.email);
console.log(`📧 Trovati ${subscribers.length} iscritti attivi alla newsletter`);

if (subscribers.length === 0) {
  console.log("Nessun iscritto attivo. Esco.");
  process.exit(0);
}

// ── Destinatario test (se passato come argomento) ──
const testEmail = process.argv[2];
const recipients = testEmail ? [testEmail] : subscribers;
const isTest = !!testEmail;

if (isTest) {
  console.log(`🧪 MODALITÀ TEST — invio solo a: ${testEmail}`);
} else {
  console.log(`📤 INVIO MASSIVO a ${recipients.length} iscritti`);
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
<title>Lancia il tuo giornale con l'AI — Ideasmart</title>
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
    <td style="background:#0a0a0a;padding:40px 32px;">
      <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.35);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Offerta speciale</p>
      <h1 style="margin:0 0 16px;font-size:32px;font-weight:900;letter-spacing:-0.02em;color:#ffffff;line-height:1.15;font-family:Georgia,'Times New Roman',serif;">
        Il primo giornale che funziona anche senza una redazione.
      </h1>
      <p style="margin:0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.6);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Costruisci e scala una testata con l'AI agentica. Oltre <strong style="color:#ffffff;">4.000 fonti certificate</strong>, una redazione di <strong style="color:#ffffff;">8 agenti AI specializzati</strong> e la tecnologia proprietaria <strong style="color:#00b4a0;">VERIFY</strong> per contenuti sempre verificati.
      </p>
    </td>
  </tr>

  <!-- COME FUNZIONA -->
  <tr>
    <td style="padding:28px 32px 24px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="margin:0 0 16px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Come funziona</p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <strong style="color:#0a1628;">Tu porti la linea editoriale.</strong> Decidi il tono, il posizionamento, i temi. La direzione resta tua.<br><br>
        <strong style="color:#0a1628;">La piattaforma fa il resto.</strong> Raccolta notizie, verifica sulle fonti, scrittura editoriale, pubblicazione e distribuzione. Tutto automatico, 24/7.
      </p>
    </td>
  </tr>

  <!-- 8 AGENTI AI -->
  <tr>
    <td style="padding:24px 32px;background:#f5f0e8;border-bottom:1px solid #d8d0c0;">
      <p style="margin:0 0 16px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; 8 agenti AI specializzati</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>01</strong> Market Scout &mdash; <span style="color:#6b7280;">4.000+ fonti/giorno</span></p>
          </td>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>02</strong> Data Verifier &mdash; <span style="color:#6b7280;">Incrocio fonti</span></p>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>03</strong> Research Writer &mdash; <span style="color:#6b7280;">Articoli strutturati</span></p>
          </td>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>04</strong> Senior Analyst &mdash; <span style="color:#6b7280;">Analisi mercato</span></p>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>05</strong> Fact Checker &mdash; <span style="color:#6b7280;">Verifica fonti</span></p>
          </td>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>06</strong> Publisher &mdash; <span style="color:#6b7280;">Distribuzione auto</span></p>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>07</strong> Social Editor &mdash; <span style="color:#6b7280;">Key insight social</span></p>
          </td>
          <td width="50%" style="padding:6px 0;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><strong>08</strong> Newsletter Curator &mdash; <span style="color:#6b7280;">Invio newsletter</span></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PIANI -->
  <tr>
    <td style="padding:28px 32px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="margin:0 0 20px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Scegli la tua redazione</p>

      <!-- MINI -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td style="padding:16px;border:1px solid #e8e0d0;background:#f9f7f4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">MINI</span>
                </td>
                <td align="right">
                  <span style="font-size:24px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">&euro;2.500</span>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;font-size:12px;color:#6b7280;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">4 agenti AI &middot; 1 canale tematico &middot; Setup fonti e training editoriale</p>
          </td>
        </tr>
      </table>

      <!-- MEDIUM — evidenziato -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td style="padding:16px;border:2px solid #0a1628;background:#f5f0e8;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">MEDIUM</span>
                  <span style="font-size:8px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;background:#dc2626;padding:2px 6px;margin-left:8px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">PI&Ugrave; SCELTO</span>
                </td>
                <td align="right">
                  <span style="font-size:24px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">&euro;5.000</span>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;font-size:12px;color:#6b7280;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">8 agenti AI &middot; 3 canali tematici &middot; Newsletter automatica &middot; Setup e training</p>
          </td>
        </tr>
      </table>

      <!-- MAXI -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td style="padding:16px;border:1px solid #e8e0d0;background:#f9f7f4;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">MAXI</span>
                </td>
                <td align="right">
                  <span style="font-size:24px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">&euro;7.500</span>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;font-size:12px;color:#6b7280;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">12 agenti AI &middot; 6 canali tematici &middot; Newsletter automatica &middot; Setup e training</p>
          </td>
        </tr>
      </table>

      <!-- CUSTOM -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:16px;background:#0a0a0a;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.4);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">CUSTOM</span>
                </td>
                <td align="right">
                  <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">Parliamone</span>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.5);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Agenti e canali su misura &middot; Integrazioni personalizzate &middot; SLA dedicato</p>
          </td>
        </tr>
      </table>

      <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;text-align:center;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Tutti i piani: setup piattaforma + personalizzazione editoriale + training AI &middot; Revenue share 30%
      </p>
    </td>
  </tr>

  <!-- PROVA SOCIALE -->
  <tr>
    <td style="padding:24px 32px;background:#f5f0e8;border-bottom:1px solid #d8d0c0;">
      <p style="margin:0 0 12px;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Gi&agrave; in produzione</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <strong style="color:#0a1628;">IDEASMART</strong> stessa &egrave; la prova: una testata con 3 canali tematici, oltre <strong style="color:#0a1628;">6.900 lettori</strong>, 20+ ricerche originali al giorno, newsletter trisettimanale e post LinkedIn automatici. <strong style="color:#0a1628;">Tutto gestito dalla piattaforma, con un team di 1 persona.</strong>
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="25%" align="center" style="padding:8px 0;">
            <span style="font-size:22px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">6.900+</span><br>
            <span style="font-size:8px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Lettori</span>
          </td>
          <td width="25%" align="center" style="padding:8px 0;">
            <span style="font-size:22px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">3</span><br>
            <span style="font-size:8px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Canali</span>
          </td>
          <td width="25%" align="center" style="padding:8px 0;">
            <span style="font-size:22px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">20+</span><br>
            <span style="font-size:8px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Ricerche/giorno</span>
          </td>
          <td width="25%" align="center" style="padding:8px 0;">
            <span style="font-size:22px;font-weight:900;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">1</span><br>
            <span style="font-size:8px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Persona</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#0a0a0a;padding:36px 32px;text-align:center;">
      <h2 style="margin:0 0 12px;font-size:24px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
        Il giornalismo sta cambiando.<br>
        <span style="color:rgba(255,255,255,0.3);">Puoi guidarlo o subirlo.</span>
      </h2>
      <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.5);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Prenota una demo e scopri come lanciare la tua testata agentica in pochi giorni.
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="background:#ffffff;padding:14px 32px;">
            <a href="mailto:info@ideasmart.ai?subject=Demo%20Piattaforma%20Giornalismo%20Agentico" style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#0a0a0a;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              Prenota una demo &rarr;
            </a>
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0" style="margin:12px auto 0;">
        <tr>
          <td style="border:1px solid rgba(255,255,255,0.3);padding:12px 28px;">
            <a href="${baseUrl}/chi-siamo" style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              Scopri tutti i dettagli
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:20px 0 0;font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.2);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        Setup in pochi giorni &middot; Nessun vincolo &middot; Revenue share
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:20px 32px;background:#f5f0e8;border-top:1px solid #d8d0c0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            &copy; ${year} IDEASMART &middot; AI &middot; Startup &middot; Venture Capital
          </td>
          <td align="right" style="font-size:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Disiscriviti</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Invio ──
const BATCH_SIZE = 50; // SendGrid max 1000 personalizations, usiamo 50 per batch
const subject = "Lancia il tuo giornale con l'AI agentica — Ideasmart";

let sent = 0;
let errors = 0;

for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
  const batch = recipients.slice(i, i + BATCH_SIZE);

  const personalizations = batch.map(email => ({
    to: [{ email }],
    // Ogni destinatario ha il proprio link di disiscrizione
  }));

  const unsubscribeUrl = `${baseUrl}/unsubscribe`;
  const html = buildPromoHtml(unsubscribeUrl);

  const body = {
    personalizations,
    from: { email: fromEmail, name: fromName },
    subject,
    content: [
      { type: "text/plain", value: `Il primo giornale che funziona anche senza una redazione. Costruisci e scala una testata con l'AI agentica. 4.000+ fonti certificate, 8 agenti AI specializzati, tecnologia VERIFY. Piani da €2.500. Prenota una demo: info@ideasmart.ai. Scopri di più: ${baseUrl}/chi-siamo` },
      { type: "text/html", value: html }
    ]
  };

  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (res.status === 202) {
      sent += batch.length;
      console.log(`✅ Batch ${Math.floor(i/BATCH_SIZE)+1}: ${batch.length} email inviate (totale: ${sent})`);
    } else {
      const err = await res.text();
      errors += batch.length;
      console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE)+1} errore ${res.status}:`, err);
    }
  } catch (err) {
    errors += batch.length;
    console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE)+1} errore rete:`, err.message);
  }

  // Pausa tra i batch per rispettare i rate limit SendGrid
  if (i + BATCH_SIZE < recipients.length) {
    await new Promise(r => setTimeout(r, 1000));
  }
}

console.log(`\n📊 Riepilogo: ${sent} inviate, ${errors} errori su ${recipients.length} totali`);
