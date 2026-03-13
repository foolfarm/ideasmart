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
<title>AI4Business News by IDEASMART · N° ${issueNumber} · ${month}</title>
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
            AI4Business News · by IDEASMART
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
        <span style="font-size:42px;font-weight:900;color:#ffffff;letter-spacing:-2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">AI4Business </span><span style="font-size:42px;font-weight:900;color:#00e5c8;letter-spacing:-2px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">News</span>
      </div>
      <br>
      <span style="font-size:12px;color:rgba(255,255,255,0.55);letter-spacing:0.15em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">by <strong style="color:#ffffff;">IDEA</strong><strong style="color:#00e5c8;">SMART</strong></span>
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
        <strong style="color:#ffffff;">AI4Business News</strong> è il quotidiano di tecnologia e innovazione che ogni giorno analizza, testa e seleziona le realtà più promettenti dell'ecosistema AI per il business. La nostra redazione porta alla luce le soluzioni che stanno ridefinendo il modo di lavorare, investire e crescere.
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
        &copy; 2026 <strong style="color:rgba(255,255,255,0.40);">AI4Business News</strong> &mdash; by IDEASMART &middot; Startup di Tecnologia &amp; Innovazione
      </p>
      <p style="font-size:11px;color:rgba(255,255,255,0.18);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-align:center;line-height:1.6;">
        Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter AI4Business News by IDEASMART.<br>
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

// ─── EMAIL DI BENVENUTO ISCRIZIONE NEWSLETTER ────────────────────────────────
export function buildWelcomeEmailHtml(opts: {
  name?: string;
  unsubscribeUrl?: string;
}): string {
  const { name, unsubscribeUrl } = opts;
  const baseUrl = `https://ideasmart.ai`;
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;
  const greeting = name ? `Ciao ${name},` : "Ciao,";

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto in AI4Business News</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fa;padding:32px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- TOP BAR -->
        <tr>
          <td style="background:#0a0f1e;padding:10px 32px;">
            <span style="font-size:10px;color:#00b4a0;letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; AI4Business News &mdash; by IDEASMART</span>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0f1e 0%,#1a2540 100%);padding:40px 32px 36px;text-align:center;">
            <div style="font-size:36px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.1;margin-bottom:8px;">
              AI4Business <span style="color:#00b4a0;">News</span>
            </div>
            <div style="font-size:14px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:24px;">by IDEASMART</div>
            <div style="display:inline-block;background:#00b4a0;border-radius:50px;padding:8px 20px;">
              <span style="font-size:12px;font-weight:700;color:#0a0f1e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.08em;">&#10003; Iscrizione Confermata</span>
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:36px 32px 28px;">
            <p style="font-size:18px;font-weight:700;color:#1a1f2e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">${greeting}</p>
            <p style="font-size:15px;line-height:1.75;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 20px;">
              Benvenuto in <strong style="color:#1a1f2e;">AI4Business News</strong> — il quotidiano italiano sull'intelligenza artificiale per il business.
            </p>
            <p style="font-size:15px;line-height:1.75;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 28px;">
              Ogni giorno riceverai le notizie più rilevanti sull'AI, le startup italiane più promettenti, editoriali esclusivi e analisi di mercato da fonti come CB Insights, Sifted e TechCrunch.
            </p>

            <!-- WHAT TO EXPECT -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f9fc;border-radius:12px;padding:24px;margin-bottom:28px;">
              <tr>
                <td style="padding:0 0 16px;">
                  <span style="font-size:11px;font-weight:700;color:#00b4a0;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Cosa riceverai</span>
                </td>
              </tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9679;&nbsp; <strong style="color:#1a1f2e;">20+ news AI</strong> aggiornate ogni giorno</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9679;&nbsp; <strong style="color:#1a1f2e;">Editoriale quotidiano</strong> sui trend AI più importanti</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9679;&nbsp; <strong style="color:#1a1f2e;">Startup del Giorno</strong> — la migliore startup AI italiana</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9679;&nbsp; <strong style="color:#1a1f2e;">Reportage settimanali</strong> sulle startup AI italiane</td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9679;&nbsp; <strong style="color:#1a1f2e;">Analisi di mercato</strong> da CB Insights, Sifted e altri</td></tr>
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px;">
              <tr>
                <td style="background:#00b4a0;border-radius:10px;padding:14px 32px;">
                  <a href="${baseUrl}" style="font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi le ultime news &rarr;</a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
              Hai domande? Scrivi a <a href="mailto:ac@foolfarm.com" style="color:#00b4a0;text-decoration:none;">ac@foolfarm.com</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 32px 28px;background:#f8f9fc;border-top:1px solid #e2e5ed;">
            <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;text-align:center;">
              &copy; 2026 <strong>AI4Business News</strong> &mdash; by IDEASMART &middot; Startup di Tecnologia &amp; Innovazione
            </p>
            <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
              Hai ricevuto questa email perch&eacute; ti sei iscritto su <a href="${baseUrl}" style="color:#00b4a0;text-decoration:none;">ideasmart.ai</a>.&nbsp;
              <a href="${unsubLink}" style="color:#e84f00;text-decoration:underline;">Annulla iscrizione</a>
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

// ─── NEWSLETTER COMPLETA (news + editoriale + startup + reportage + analisi) ──
export function buildFullNewsletterHtml(opts: {
  dateLabel: string;
  editorial?: { title: string; subtitle?: string | null; body: string; keyTrend?: string | null; authorNote?: string | null } | null;
  startup?: { name: string; tagline: string; description: string; category: string; funding?: string | null; whyToday: string; websiteUrl?: string | null; aiScore?: number | null } | null;
  news: Array<{ title: string; summary: string; category: string; sourceName?: string | null; sourceUrl?: string | null }>;
  reportages: Array<{ startupName: string; category: string; headline: string; subheadline?: string | null; bodyText: string; quote?: string | null; stat1Value?: string | null; stat1Label?: string | null; stat2Value?: string | null; stat2Label?: string | null; stat3Value?: string | null; stat3Label?: string | null; websiteUrl?: string | null; ctaLabel?: string | null; ctaUrl?: string | null }>;
  analyses: Array<{ title: string; category: string; summary: string; source: string; dataPoint1?: string | null; dataPoint2?: string | null; dataPoint3?: string | null; keyInsight?: string | null; italyRelevance?: string | null }>;
  unsubscribeUrl?: string;
  isTest?: boolean;
}): string {
  const { dateLabel, editorial, startup, news, reportages, analyses, unsubscribeUrl, isTest } = opts;
  const baseUrl = `https://ideasmart.ai`;
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;

  // Colori brand
  const TEAL = "#00b4a0";
  const NAVY = "#0a0f1e";
  const ORANGE = "#e84f00";
  const BLUE = "#1a56db";

  const catColors: Record<string, string> = {
    "Modelli Generativi": TEAL, "AI Generativa": TEAL, "AI Agentiva": TEAL,
    "Robot & AI Fisica": TEAL, "AI & Startup Italiane": TEAL,
    "AI & Hardware": BLUE, "Big Tech": BLUE, "Internazionalizzazione": BLUE,
    "AI & Difesa": ORANGE, "Startup & Funding": ORANGE, "Ricerca & Innovazione": ORANGE,
    "Regolamentazione AI": "#f39c12", "AI & Lavoro": "#8b5cf6",
    "AI & Salute": "#10b981", "AI & Finanza": BLUE,
  };
  const getColor = (cat: string) => catColors[cat] ?? TEAL;

  // ── Sezione news ──
  const newsHtml = news.map((item, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const color = getColor(item.category);
    return `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="32" valign="top" style="padding-right:12px;">
            <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${num}</span>
          </td>
          <td valign="top">
            <span style="display:inline-block;font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:4px;">${item.category}</span><br>
            <span style="font-size:14px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${item.title}</span><br>
            <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">${item.summary}</span>
            ${item.sourceName ? `<br><span style="font-size:11px;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Fonte: ${item.sourceUrl ? `<a href="${item.sourceUrl}" style="color:${color};text-decoration:none;">${item.sourceName}</a>` : item.sourceName}</span>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }).join("");

  // ── Sezione reportage ──
  const reportageHtml = reportages.map((rep, idx) => {
    const accentColors = [TEAL, ORANGE, BLUE, "#8b5cf6"];
    const color = accentColors[idx % 4];
    const statsHtml = [
      rep.stat1Value && rep.stat1Label ? `<td width="30%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat1Value}</div><div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat1Label}</div></td>` : "",
      rep.stat2Value && rep.stat2Label ? `<td width="4%"></td><td width="30%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat2Value}</div><div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat2Label}</div></td>` : "",
      rep.stat3Value && rep.stat3Label ? `<td width="4%"></td><td width="30%" align="center" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px 8px;border:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat3Value}</div><div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat3Label}</div></td>` : "",
    ].filter(Boolean).join("");

    return `
  <!-- REPORTAGE ${idx + 1}: ${rep.startupName} -->
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:10px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">0${idx + 1} &mdash;</span>&nbsp;
            <span style="font-size:10px;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">${rep.category}</span>
          </td>
        </tr>
        <tr>
          <td style="background:rgba(${color === TEAL ? "0,180,160" : color === ORANGE ? "232,79,0" : color === BLUE ? "26,86,219" : "139,92,246"},0.06);border-bottom:3px solid ${color};padding:14px 32px;">
            <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${rep.headline}</span>
            ${rep.subheadline ? `<br><span style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.subheadline}</span>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px 28px;background:#0a0f1e;">
      <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">${rep.bodyText.replace(/\n/g, "<br>")}</p>
      ${rep.quote ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr><td style="border-left:3px solid ${color};padding:10px 16px;background:rgba(255,255,255,0.03);border-radius:0 6px 6px 0;"><span style="font-size:13px;font-style:italic;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"${rep.quote}"</span></td></tr></table>` : ""}
      ${statsHtml ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;"><tr>${statsHtml}</tr></table>` : ""}
      ${rep.websiteUrl || rep.ctaUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${color};border-radius:8px;padding:12px 24px;"><a href="${rep.ctaUrl || rep.websiteUrl}" target="_blank" style="font-size:13px;font-weight:700;color:${color === ORANGE ? "#ffffff" : NAVY};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.ctaLabel || "Scopri di più"} &rarr;</a></td></tr></table>` : ""}
    </td>
  </tr>`;
  }).join("");

  // ── Sezione analisi di mercato ──
  const analysesHtml = analyses.map((a, idx) => {
    const accentColors = [TEAL, BLUE, ORANGE, "#8b5cf6"];
    const color = accentColors[idx % 4];
    return `
  <tr>
    <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:0 0 8px;">
            <span style="font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${a.category}</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.30);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &mdash; ${a.source}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 8px;">
            <span style="font-size:15px;font-weight:800;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.4;">${a.title}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 10px;">
            <span style="font-size:13px;line-height:1.65;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${a.summary}</span>
          </td>
        </tr>
        ${(a.dataPoint1 || a.dataPoint2 || a.dataPoint3) ? `<tr><td style="padding:8px 0;"><table cellpadding="0" cellspacing="0" border="0"><tr>${[a.dataPoint1, a.dataPoint2, a.dataPoint3].filter(Boolean).map(dp => `<td style="padding:4px 12px 4px 0;"><span style="font-size:12px;font-weight:700;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; ${dp}</span></td>`).join("")}</tr></table></td></tr>` : ""}
        ${a.keyInsight ? `<tr><td style="padding:8px 0 0;"><span style="font-size:12px;font-style:italic;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">"${a.keyInsight}"</span></td></tr>` : ""}
      </table>
    </td>
  </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI4Business News — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background:#040810;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#040810;padding:20px 0 40px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#0a0f1e;border-radius:4px;overflow:hidden;">

        ${isTest ? `<!-- TEST BANNER -->
        <tr><td style="background:#e84f00;padding:8px 32px;text-align:center;"><span style="font-size:11px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.1em;">&#9888; EMAIL DI PROVA — Non inviare agli iscritti</span></td></tr>` : ""}

        <!-- TOP BAR -->
        <tr>
          <td style="background:#040810;padding:10px 32px;">
            <span style="font-size:10px;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; AI4Business News &mdash; by IDEASMART &mdash; ${dateLabel}</span>
          </td>
        </tr>

        <!-- LOGO / HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,${NAVY} 0%,#1a2540 100%);padding:36px 32px 28px;">
            <div style="font-size:32px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.1;margin-bottom:4px;">
              AI4Business <span style="color:${TEAL};">News</span>
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:16px;">by IDEASMART &mdash; Il Quotidiano AI Italiano</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              In questa edizione: <strong style="color:#ffffff;">${news.length} news AI</strong> &middot; <strong style="color:#ffffff;">${reportages.length} reportage</strong> &middot; <strong style="color:#ffffff;">${analyses.length} analisi di mercato</strong>${editorial ? " &middot; <strong style=\"color:#ffffff;\">Editoriale</strong>" : ""}${startup ? " &middot; <strong style=\"color:#ffffff;\">Startup del Giorno</strong>" : ""}
            </div>
          </td>
        </tr>

        ${editorial ? `
        <!-- EDITORIALE -->
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                  <span style="font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">EDITORIALE &mdash;</span>&nbsp;
                  <span style="font-size:10px;color:${TEAL};letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi del Giorno</span>
                </td>
              </tr>
              <tr>
                <td style="background:rgba(0,180,160,0.06);border-bottom:3px solid ${TEAL};padding:14px 32px;">
                  <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${editorial.title}</span>
                  ${editorial.subtitle ? `<br><span style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${editorial.subtitle}</span>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px;background:#0a0f1e;">
            ${editorial.keyTrend ? `<p style="font-size:12px;font-weight:700;color:${TEAL};text-transform:uppercase;letter-spacing:0.08em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;">&#9670; Trend del giorno: ${editorial.keyTrend}</p>` : ""}
            <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">${editorial.body.replace(/\n/g, "<br>")}</p>
            ${editorial.authorNote ? `<p style="font-size:13px;font-style:italic;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;">${editorial.authorNote}</p>` : ""}
          </td>
        </tr>` : ""}

        ${startup ? `
        <!-- STARTUP DEL GIORNO -->
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#060a14;padding:10px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                  <span style="font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">STARTUP DEL GIORNO &mdash;</span>&nbsp;
                  <span style="font-size:10px;color:${ORANGE};letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.category}</span>
                </td>
              </tr>
              <tr>
                <td style="background:rgba(232,79,0,0.06);border-bottom:3px solid ${ORANGE};padding:14px 32px;">
                  <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.3;">${startup.name}</span>
                  <br><span style="font-size:13px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.tagline}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 28px;background:#0a0f1e;">
            <p style="font-size:14px;line-height:1.75;color:rgba(255,255,255,0.70);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;">${startup.description}</p>
            <p style="font-size:13px;font-weight:600;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Perché oggi?</p>
            <p style="font-size:13px;line-height:1.65;color:rgba(255,255,255,0.60);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">${startup.whyToday}</p>
            ${startup.funding ? `<p style="font-size:12px;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">&#9632; Funding: <strong>${startup.funding}</strong></p>` : ""}
            ${startup.aiScore ? `<p style="font-size:12px;color:rgba(255,255,255,0.40);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;">AI Score: <strong style="color:${ORANGE};">${startup.aiScore}/100</strong></p>` : ""}
            ${startup.websiteUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${ORANGE};border-radius:8px;padding:12px 24px;"><a href="${startup.websiteUrl}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita il sito &rarr;</a></td></tr></table>` : ""}
          </td>
        </tr>` : ""}

        <!-- REPORTAGE SETTIMANALI -->
        ${reportages.length > 0 ? `
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#040810;padding:14px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                  <span style="font-size:10px;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Reportage Startup AI Italiane</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${reportageHtml}` : ""}

        <!-- NEWS AI -->
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#040810;padding:14px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                  <span style="font-size:10px;color:${TEAL};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Le ${news.length} Notizie AI del Giorno</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;background:#060a14;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${newsHtml}
            </table>
          </td>
        </tr>

        <!-- ANALISI DI MERCATO -->
        ${analyses.length > 0 ? `
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#040810;padding:14px 32px;border-top:1px solid rgba(255,255,255,0.06);">
                  <span style="font-size:10px;color:${BLUE};letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Analisi di Mercato AI</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;background:#060a14;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${analysesHtml}
            </table>
          </td>
        </tr>` : ""}

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:32px;background:linear-gradient(135deg,#060a14,${NAVY});border-top:1px solid rgba(255,255,255,0.06);">
            <p style="font-size:18px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;">Leggi tutte le news sul sito<br><span style="color:${TEAL};">AI4Business News</span></p>
            <p style="font-size:13px;color:rgba(255,255,255,0.45);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 20px;">Aggiornato ogni giorno con le notizie AI più rilevanti per il business italiano.</p>
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td style="background:${TEAL};border-radius:8px;padding:14px 32px;">
                  <a href="${baseUrl}" style="font-size:14px;font-weight:700;color:${NAVY};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Vai al sito &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:28px 32px 32px;background:#040810;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="font-size:11px;color:rgba(255,255,255,0.25);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-align:center;">
              &copy; 2026 <strong style="color:rgba(255,255,255,0.40);">AI4Business News</strong> &mdash; by IDEASMART &middot; Startup di Tecnologia &amp; Innovazione
            </p>
            <p style="font-size:11px;color:rgba(255,255,255,0.18);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-align:center;line-height:1.6;">
              Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter AI4Business News by IDEASMART.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px;">
              <tr><td style="border-top:1px solid rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="font-size:11px;color:rgba(255,255,255,0.20);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
              <a href="${unsubLink}" style="color:#ff5500;text-decoration:underline;font-weight:600;">Annulla iscrizione</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}" style="color:rgba(255,255,255,0.30);text-decoration:underline;">Visita il sito</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:ac@foolfarm.com" style="color:rgba(255,255,255,0.30);text-decoration:underline;">Contattaci</a>
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
