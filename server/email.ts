import { ENV } from "./_core/env";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  // Usa ac@foolfarm.com come mittente verificato (newsletter@ideasmart.it non ancora verificato su SendGrid)
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "ac@foolfarm.com";
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

// ─── TEMPLATE DARK UFFICIALE IDEASMART ────────────────────────────────────────
// Stile: sfondo navy #0a0f1e, accenti ciano #00e5c8, blu #0066ff, arancio #ff5500
// Struttura: Top bar → Logo → Editoriale → Indice → 4 Startup → News AI → CTA → Footer

export function buildMonthlyNewsletterHtml(opts: {
  month: string;         // es. "Marzo 2026"
  issueNumber: string;   // es. "03"
  news: Array<{
    category: string;
    title: string;
    summary: string;
    url?: string;
    source?: string;
  }>;
  unsubscribeUrl?: string; // URL personalizzato per disiscrizione (con token)
}): string {
  const { month, issueNumber, news, unsubscribeUrl } = opts;
  const baseUrl = process.env.VITE_APP_ID ? `https://ideasmart.ai` : `https://ideasmart.manus.space`;
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;

  // Colori per le categorie news
  const categoryColors: Record<string, string> = {
    "Modelli Generativi": "#00e5c8",
    "AI Generativa": "#00e5c8",
    "AI Agentiva": "#00e5c8",
    "Robot & AI Fisica": "#00e5c8",
    "AI & Startup Italiane": "#00e5c8",
    "AI & Hardware": "#0066ff",
    "Big Tech": "#0066ff",
    "Internazionalizzazione": "#0066ff",
    "AI & Difesa": "#ff5500",
    "Startup & Funding": "#ff5500",
    "Ricerca & Innovazione": "#ff5500",
    "Mercato": "#ff5500",
    "Regolamentazione": "#f39c12",
    "default": "#00e5c8",
  };

  // Genera le righe news
  const newsItemsHtml = news.slice(0, 20).map((item, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const color = categoryColors[item.category] ?? categoryColors["default"];
    const bgColor = `${color}1e`; // ~12% opacity
    const titleEl = item.url
      ? `<a href="${item.url}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">${item.title}</a>`
      : `<span style="font-size:13px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">${item.title}</span>`;
    const sourceEl = item.source ? ` &mdash; <em>${item.source}</em>` : "";
    const isLast = idx === Math.min(news.length, 20) - 1;

    return `
        <tr>
          <td style="padding:10px 0;${isLast ? "" : "border-bottom:1px solid rgba(255,255,255,0.05);"}">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="28" style="vertical-align:top;padding-top:2px;">
                  <span style="font-size:10px;color:rgba(255,255,255,0.20);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${num}</span>
                </td>
                <td>
                  <span style="font-size:10px;background:${bgColor};color:${color};padding:2px 8px;border-radius:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${item.category}</span><br>
                  ${titleEl}<br>
                  <span style="font-size:12px;color:rgba(255,255,255,0.40);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${item.summary}${sourceEl}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>IDEASMART — AI for Business · N° ${issueNumber} · ${month}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f1e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<!-- WRAPPER -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0f1e;">
<tr><td align="center" style="padding:20px 0;">

<!-- CONTAINER -->
<table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background-color:#0d1220;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

  <!-- TOP BAR -->
  <tr>
    <td style="background-color:#060a14;padding:10px 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:11px;color:rgba(255,255,255,0.35);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">
            Direttore: Redazione IDEASMART
          </td>
          <td align="right" style="font-size:11px;color:rgba(255,255,255,0.35);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">
            ${month} · N° ${issueNumber}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HEADER / LOGO -->
  <tr>
    <td align="center" style="padding:40px 32px 32px;background:linear-gradient(180deg,#060a14 0%,#0d1220 100%);">
      <div style="display:inline-block;margin-bottom:12px;">
        <span style="font-size:42px;font-weight:900;color:#ffffff;letter-spacing:-2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">IDEA</span><span style="font-size:42px;font-weight:900;color:#00e5c8;letter-spacing:-2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">SMART</span>
      </div>
      <br>
      <span style="font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:0.25em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">L'Analisi Mensile &nbsp;·&nbsp; AI for Business</span>
      <br><br>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="background:rgba(0,229,200,0.08);border:1px solid rgba(0,229,200,0.25);border-radius:20px;padding:6px 16px;">
            <span style="font-size:10px;color:#00e5c8;letter-spacing:0.12em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9679; Osservatorio sull'Innovazione AI Italiana</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- EDITORIALE -->
  <tr>
    <td style="padding:0 32px 32px;">
      <p style="font-size:15px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        <strong style="color:#ffffff;">IDEASMART</strong> è la startup italiana di tecnologia e innovazione che ogni mese analizza, testa e seleziona le realtà più promettenti dell'ecosistema AI per il business. In questo numero abbiamo esaminato quattro realtà che stanno ridefinendo il modo di lavorare, investire e comunicare.
      </p>
      <p style="font-size:15px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;">
        Da <strong style="color:#ffffff;">FoolTalent</strong>, che porta l'AI nel recruiting, a <strong style="color:#ffffff;">FoolShare</strong>, la data room più avanzata del mercato. Da <strong style="color:#ffffff;">Fragmentalis</strong>, con la sua comunicazione quantum-resistant brevettata, a <strong style="color:#ffffff;">PollCast</strong>, che trasforma l'intelligenza collettiva in market intelligence.
      </p>
    </td>
  </tr>

  <!-- INDICE -->
  <tr>
    <td style="padding:0 32px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:rgba(255,255,255,0.30);letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; In questo numero</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">01 &mdash;</span>&nbsp;
                  <span style="font-size:10px;color:#00e5c8;letter-spacing:0.08em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Reportage</span>&nbsp;&nbsp;
                  <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">FoolTalent: l'AI che scova i talenti prima degli altri</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">02 &mdash;</span>&nbsp;
                  <span style="font-size:10px;color:#0066ff;letter-spacing:0.08em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi</span>&nbsp;&nbsp;
                  <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">FoolShare: la fortezza digitale per i dati che contano</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">03 &mdash;</span>&nbsp;
                  <span style="font-size:10px;color:#00e5c8;letter-spacing:0.08em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Inchiesta</span>&nbsp;&nbsp;
                  <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Fragmentalis: la comunicazione a prova di spia</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;">
                  <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">04 &mdash;</span>&nbsp;
                  <span style="font-size:10px;color:#ff5500;letter-spacing:0.08em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Focus</span>&nbsp;&nbsp;
                  <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">PollCast: l'intelligenza collettiva che prevede i trend</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ─── 01 FOOLTALENT ─────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">01 &mdash;</span>&nbsp;
            <span style="font-size:10px;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Reportage · AI Recruiting</span>
          </td>
        </tr>
        <tr>
          <td style="background:rgba(0,229,200,0.07);border-bottom:3px solid #00e5c8;padding:14px 32px;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">FoolTalent: l'AI che scova i talenti prima degli altri.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px 32px;">
      <p style="font-size:13px;font-weight:600;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Come una startup milanese sta rivoluzionando il recruiting con l'AI.</p>
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.65);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        Il problema del recruiting nelle startup italiane è sempre lo stesso: troppo tempo perso a leggere CV irrilevanti, troppo poco a parlare con i candidati giusti. <strong style="color:#ffffff;">FoolTalent</strong> ha deciso di affrontarlo con un approccio radicalmente diverso: la sua AI non filtra per parole chiave, ma analizza ogni candidatura in profondità e assegna un punteggio di compatibilità reale.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
        <tr>
          <td style="border-left:3px solid #00e5c8;padding:10px 16px;background:rgba(0,229,200,0.05);border-radius:0 6px 6px 0;">
            <span style="font-size:13px;font-style:italic;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"L'AI non sostituisce il recruiter. Lo libera dal rumore, così può concentrarsi sul segnale."</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00e5c8;font-weight:700;">&#10003;</span>&nbsp; Valutazione AI con punteggio percentuale di compatibilità per ogni candidatura</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00e5c8;font-weight:700;">&#10003;</span>&nbsp; Shortlist intelligente: solo i profili più compatibili, ordinati per rilevanza</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00e5c8;font-weight:700;">&#10003;</span>&nbsp; Database talenti con ricerca avanzata per competenze, settore ed esperienza</td></tr>
        <tr><td style="padding:7px 0;font-size:13px;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00e5c8;font-weight:700;">&#10003;</span>&nbsp; Dashboard analytics con trend candidature in tempo reale</td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#00e5c8;border-radius:8px;padding:12px 24px;">
            <a href="https://fooltalent.com" target="_blank" style="font-size:13px;font-weight:700;color:#0a0f1e;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.03em;">Scopri FoolTalent &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://fooltalent.com" target="_blank" style="font-size:13px;color:rgba(255,255,255,0.50);text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Vedi gli annunci &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ─── 02 FOOLSHARE ──────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">02 &mdash;</span>&nbsp;
            <span style="font-size:10px;color:#0066ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Analisi · Data Room &amp; Fundraising</span>
          </td>
        </tr>
        <tr>
          <td style="background:rgba(0,102,255,0.07);border-bottom:3px solid #0066ff;padding:14px 32px;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">FoolShare: la fortezza digitale per i dati che contano.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px 32px;background:#080c18;">
      <p style="font-size:13px;font-weight:600;color:#0066ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">La piattaforma che unisce data room sicure, NDA digitali e fundraising OS.</p>
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.65);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        La condivisione di documenti sensibili è il tallone d'Achille di molte aziende. <strong style="color:#ffffff;">FoolShare</strong> risponde con una piattaforma che non si limita a "proteggere" i documenti, ma li trasforma in uno strumento di intelligence: ogni link condiviso è tracciabile — chi lo ha aperto, per quanti minuti, quante volte, da quale città.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
        <tr>
          <td style="border-left:3px solid #0066ff;padding:10px 16px;background:rgba(0,102,255,0.05);border-radius:0 6px 6px 0;">
            <span style="font-size:13px;font-style:italic;color:#0066ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"Non è solo una data room. È un sistema operativo per il fundraising. La differenza è sostanziale."</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(0,102,255,0.06);border:1px solid rgba(0,102,255,0.15);border-radius:8px;margin-bottom:20px;">
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <span style="color:#0066ff;font-weight:700;">&#127873; Prova gratuita 7 giorni</span> — nessuna carta di credito richiesta.<br>
            Piani da <strong style="color:#ffffff;">€49/mese</strong> (Premium) · <strong style="color:#ffffff;">€99/mese</strong> (Project Room + Fundraising OS)
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#0066ff;border-radius:8px;padding:12px 24px;">
            <a href="https://foolshare.xyz" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Inizia gratis &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://foolshare.xyz" target="_blank" style="font-size:13px;color:rgba(255,255,255,0.50);text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Scopri i piani &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ─── 03 FRAGMENTALIS ────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#040810;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">03 &mdash;</span>&nbsp;
            <span style="font-size:10px;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Inchiesta · Cybersecurity &amp; Comunicazione</span>
          </td>
        </tr>
        <tr>
          <td style="background:linear-gradient(135deg,rgba(0,6,110,0.4),rgba(0,229,200,0.06));border-bottom:3px solid #00e5c8;padding:14px 32px;">
            <span style="font-size:20px;font-weight:900;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">Fragmentalis: la comunicazione a prova di spia (e di computer quantistici).</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px 32px;background:#060a14;">
      <p style="font-size:13px;font-weight:600;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Tecnologia brevettata IT/EU/USA che rende matematicamente impossibile intercettare le comunicazioni.</p>
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.65);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        Mentre tutti parlano di crittografia end-to-end, <strong style="color:#ffffff;">Fragmentalis</strong> ha già spostato il campo di gioco nel futuro. La sua tecnologia brevettata "polverizza" i dati — li frammenta su nodi distribuiti, rendendo matematicamente impossibile ricostruirli. Il prodotto di punta, <strong style="color:#ffffff;">StreamSafer Communicator</strong>, è già usato da CDA aziendali, studi legali e istituzioni finanziarie.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
        <tr>
          <td style="border-left:3px solid #00e5c8;padding:10px 16px;background:rgba(0,229,200,0.04);border-radius:0 6px 6px 0;">
            <span style="font-size:13px;font-style:italic;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"Non esiste un server centrale. I dati vengono polverizzati. Per ricostruirli, bisognerebbe accedere a tutti i nodi contemporaneamente. Matematicamente impossibile."</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td width="33%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:24px;font-weight:900;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">0</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Server centrale</div>
          </td>
          <td width="4%"></td>
          <td width="33%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:24px;font-weight:900;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">100%</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Controllo dati</div>
          </td>
          <td width="4%"></td>
          <td width="26%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:24px;font-weight:900;color:#00e5c8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">3</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Brevetti IT/EU/US</div>
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#00e5c8;border-radius:8px;padding:12px 24px;">
            <a href="https://fragmentalis.com" target="_blank" style="font-size:13px;font-weight:700;color:#0a0f1e;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Richiedi Demo &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://fragmentalis.com" target="_blank" style="font-size:13px;color:rgba(255,255,255,0.50);text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Scopri StreamSafer &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ─── 04 POLLCAST ───────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">04 &mdash;</span>&nbsp;
            <span style="font-size:10px;color:#ff5500;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Focus · Market Intelligence</span>
          </td>
        </tr>
        <tr>
          <td style="background:rgba(255,85,0,0.06);border-bottom:3px solid #ff5500;padding:14px 32px;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">PollCast: l'intelligenza collettiva che prevede i trend di mercato.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px 32px;">
      <p style="font-size:13px;font-weight:600;color:#ff5500;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">La piattaforma gratuita che trasforma le previsioni della community in market intelligence.</p>
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.65);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        E se le previsioni di mercato non fossero più un'esclusiva per pochi analisti? <strong style="color:#ffffff;">PollCast</strong> ha lanciato una piattaforma gratuita dove chiunque può creare e votare previsioni su qualsiasi tema — business, tech, sport, politica o trend di mercato. I risultati aggregati, su migliaia di voti, tendono a essere sorprendentemente accurati.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr><td style="padding:4px 0;font-size:12px;color:rgba(255,255,255,0.50);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; <strong style="color:#ff5500;">Crypto</strong> &nbsp; Bitcoin supererà i $200k entro il 2026? &nbsp;<strong style="color:#ff5500;">61% Sì</strong> (511 voti)</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:rgba(255,255,255,0.50);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; <strong style="color:#ff5500;">Tech</strong> &nbsp; ChatGPT-5 sarà rilasciato entro giugno 2026? &nbsp;<strong style="color:#ff5500;">75% Sì</strong> (370 voti)</td></tr>
        <tr><td style="padding:4px 0;font-size:12px;color:rgba(255,255,255,0.50);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; <strong style="color:#ff5500;">Economia</strong> &nbsp; Tesla raggiungerà i $500 per azione? &nbsp;<strong style="color:#ff5500;">57% Sì</strong> (412 voti)</td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#ff5500;border-radius:8px;padding:12px 24px;">
            <a href="https://pollcast.online" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Vota le previsioni &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://pollcast.online" target="_blank" style="font-size:13px;color:rgba(255,255,255,0.50);text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Crea una previsione &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ─── ULTIME NEWS AI ────────────────────────────────────────────────── -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#040810;padding:14px 32px;border-top:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:#00e5c8;letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Ultime News AI &mdash; ${month}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 32px 32px;background:#060a14;">
      <p style="font-size:13px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">I 10 eventi AI più significativi della settimana</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${newsItemsHtml}
      </table>
    </td>
  </tr>

  <!-- NEWSLETTER CTA -->
  <tr>
    <td align="center" style="padding:32px;background:linear-gradient(135deg,#060a14,#0a0f1e);border-top:1px solid rgba(255,255,255,0.06);">
      <p style="font-size:18px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Ricevi l'analisi mensile<br><span style="color:#00e5c8;">direttamente nella tua inbox.</span></p>
      <p style="font-size:13px;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 20px;">Ogni mese selezioniamo le 4 startup AI più promettenti per il business italiano.</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="background:#00e5c8;border-radius:8px;padding:14px 32px;">
            <a href="https://ideasmart.ai" style="font-size:14px;font-weight:700;color:#0a0f1e;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Abbonati gratis &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:28px 32px 32px;background:#040810;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="font-size:11px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-align:center;">
        &copy; 2026 <strong style="color:rgba(255,255,255,0.40);">IDEASMART</strong> &mdash; Startup di Tecnologia &amp; Innovazione &middot; AI for Business
      </p>
      <p style="font-size:11px;color:rgba(255,255,255,0.18);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-align:center;line-height:1.6;">
        Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter IDEASMART.<br>
        Sede legale: Italia &middot; P.IVA in corso di registrazione &middot; <a href="${baseUrl}/privacy" style="color:rgba(255,255,255,0.30);text-decoration:underline;">Privacy Policy</a>
      </p>
      <!-- Separatore -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px;">
        <tr><td style="border-top:1px solid rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
      <!-- Link disiscrizione GDPR -->
      <p style="font-size:11px;color:rgba(255,255,255,0.20);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
        <a href="${unsubLink}" style="color:#ff5500;text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">Annulla iscrizione</a>
        &nbsp;&middot;&nbsp;
        <a href="${baseUrl}" style="color:rgba(255,255,255,0.30);text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita il sito</a>
        &nbsp;&middot;&nbsp;
        <a href="${baseUrl}/privacy" style="color:rgba(255,255,255,0.30);text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Privacy Policy</a>
      </p>
      <p style="font-size:10px;color:rgba(255,255,255,0.12);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:10px 0 0;text-align:center;">
        Ai sensi del Regolamento UE 2016/679 (GDPR), hai il diritto di annullare l&rsquo;iscrizione in qualsiasi momento.
      </p>
    </td>
  </tr>

</table>
<!-- END CONTAINER -->

</td></tr>
</table>
<!-- END WRAPPER -->

</body>
</html>`;
}

// Alias per compatibilità con il codice esistente (newsletter settimanale)
export function buildWeeklyNewsletterHtml(newsData: {
  week: string;
  news: Array<{ id: number; category: string; title: string; description: string; impact: string }>;
}): string {
  return buildMonthlyNewsletterHtml({
    month: newsData.week,
    issueNumber: new Date().getMonth().toString().padStart(2, "0"),
    news: newsData.news.map(n => ({
      category: n.category,
      title: n.title,
      summary: n.description,
    })),
  });
}
