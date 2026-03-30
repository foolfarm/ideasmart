import { ENV } from "./_core/env";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  // Mittente ufficiale IDEASMART — verificare info@ideasmart.ai su SendGrid Sender Authentication
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "info@ideasmart.ai";
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
    id?: number | null;
    section?: string | null;
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
    "Regolamentazione AI": "#f39c12",
    // Finance & Markets
    "Finance & Markets": "#15803d",
    "Macro & BCE": "#15803d",
    "M&A & Deal": "#22c55e",
    // Health & Biotech
    "Health & Biotech": "#0369a1",
    "AI in Medicina": "#0284c7",
    "Longevit\u00e0 & Wellness": "#38bdf8",
    // Sport & Business
    "Sport Business": "#b45309",
    "Deal Sportivi": "#d97706",
    "Valutazioni Club": "#f59e0b",
    // Lifestyle & Luxury
    "Luxury & Made in Italy": "#7c3aed",
    "Brand Strategy": "#9333ea",
    "Mercato del Lusso": "#a855f7",
    // Musica
    "Musica & Business": "#ec4899",
    "default": "#00e5c8",
  };

  // Genera le righe news — stile crema/navy
  const newsItemsHtml = news.slice(0, 20).map((item, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const color = categoryColors[item.category] ?? categoryColors["default"];
    // Usa URL interno Ideasmart se disponibile id e section, altrimenti usa url esterno
    const ideasmartUrl = (item.id && item.section)
      ? `${baseUrl}/${item.section}/news/${item.id}`
      : null;
    const linkUrl = ideasmartUrl ?? item.url ?? null;
    const titleEl = linkUrl
      ? `<a href="${linkUrl}" style="font-size:13px;font-weight:700;color:#0a1628;text-decoration:none;font-family:Georgia,'Times New Roman',serif;line-height:1.5;">${item.title}</a>`
      : `<span style="font-size:13px;font-weight:700;color:#0a1628;font-family:Georgia,'Times New Roman',serif;line-height:1.5;">${item.title}</span>`;
    const sourceEl = item.source
      ? ` &mdash; <em style="color:#9ca3af;">${item.source}</em>${ideasmartUrl ? ` &mdash; <a href="${ideasmartUrl}" style="font-size:10px;color:${color};text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi su IDEASMART →</a>` : ""}`
      : (ideasmartUrl ? ` &mdash; <a href="${ideasmartUrl}" style="font-size:10px;color:${color};text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi su IDEASMART →</a>` : "");
    const isLast = idx === Math.min(news.length, 20) - 1;
    const rowBg = idx % 2 === 0 ? "#ffffff" : "#f9f7f4";

    return `
        <tr>
          <td style="background:${rowBg};padding:10px 0;${isLast ? "" : "border-bottom:1px solid #e8e0d0;"}">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="28" style="vertical-align:top;padding-top:3px;">
                  <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${num}</span>
                </td>
                <td>
                  <span style="font-size:9px;background:${color}22;color:${color};padding:2px 8px;border-radius:10px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${item.category}</span><br>
                  ${titleEl}<br>
                  <span style="font-size:12px;color:#6b7280;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;">${item.summary}${sourceEl}</span>
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
<title>IDEASMART · N° ${issueNumber} · ${month}</title>
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
            AI &middot; STARTUP &middot; FINANCE &middot; HEALTH &middot; SPORT &middot; LUXURY &middot; MUSIC
          </td>
          <td align="right" style="font-size:10px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;">
            ${month}
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
      <div style="font-size:10px;color:#6b7280;letter-spacing:0.22em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:16px;">LA PRIMA TESTATA GIORNALISTICA HUMANLESS</div>
      <!-- Doppia linea ciano -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:4px;">
        <tr><td style="border-top:2px solid #00b4a0;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="border-top:1px solid #d8d0c0;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
    </td>
  </tr>

  <!-- EDITORIALE -->
  <tr>
    <td style="padding:20px 28px 18px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="font-size:14px;line-height:1.8;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;">
        <strong style="color:#0a1628;">IDEASMART</strong> è la prima testata giornalistica HumanLess che ogni giorno analizza oltre 4.000 fonti su AI, Startup e Venture Capital. Ricerche verificate, alert e briefing per chi prende decisioni.
      </p>
    </td>
  </tr>

  <!-- INDICE -->
  <tr>
    <td style="padding:16px 28px 20px;background:#f5f0e8;border-bottom:2px solid #d8d0c0;">
      <div style="font-size:8px;font-weight:700;color:#9ca3af;letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:12px;">&#9670; In questo numero</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #e8e0d0;">
            <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">01 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#00b4a0;letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;">Reportage</span>&nbsp;&nbsp;
            <span style="font-size:12px;color:#374151;font-family:Georgia,'Times New Roman',serif;">FoolTalent: l'AI che scova i talenti prima degli altri</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #e8e0d0;">
            <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">02 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#2563eb;letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;">Analisi</span>&nbsp;&nbsp;
            <span style="font-size:12px;color:#374151;font-family:Georgia,'Times New Roman',serif;">FoolShare: la fortezza digitale per i dati che contano</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #e8e0d0;">
            <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">03 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#00b4a0;letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;">Inchiesta</span>&nbsp;&nbsp;
            <span style="font-size:12px;color:#374151;font-family:Georgia,'Times New Roman',serif;">Fragmentalis: la comunicazione a prova di spia</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;">
            <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">04 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#f97316;letter-spacing:0.1em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;">Focus</span>&nbsp;&nbsp;
            <span style="font-size:12px;color:#374151;font-family:Georgia,'Times New Roman',serif;">PollCast: l'intelligenza collettiva che prevede i trend</span>
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
          <td style="background:#f5f0e8;padding:10px 28px;border-top:2px solid #e8e0d0;border-bottom:1px solid #e8e0d0;">
            <span style="font-size:9px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.12em;text-transform:uppercase;">01 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#00b4a0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Reportage &middot; AI Recruiting</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border-left:4px solid #00b4a0;padding:16px 28px;">
            <span style="font-size:20px;font-weight:700;color:#0a1628;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">FoolTalent: l'AI che scova i talenti prima degli altri.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 28px 28px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="font-size:11px;font-weight:700;color:#00b4a0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">Come una startup milanese sta rivoluzionando il recruiting con l'AI.</p>
      <p style="font-size:14px;line-height:1.8;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        Il problema del recruiting nelle startup italiane è sempre lo stesso: troppo tempo perso a leggere CV irrilevanti, troppo poco a parlare con i candidati giusti. <strong style="color:#0a1628;">FoolTalent</strong> ha deciso di affrontarlo con un approccio radicalmente diverso: la sua AI non filtra per parole chiave, ma analizza ogni candidatura in profondità e assegna un punteggio di compatibilità reale.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;">
        <tr>
          <td style="border-left:3px solid #00b4a0;padding:10px 16px;background:#f0faf8;">
            <span style="font-size:13px;font-style:italic;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">&ldquo;L'AI non sostituisce il recruiter. Lo libera dal rumore, così può concentrarsi sul segnale.&rdquo;</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
        <tr><td style="padding:6px 0;border-bottom:1px solid #e8e0d0;font-size:13px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00b4a0;font-weight:700;">&#10003;</span>&nbsp; Valutazione AI con punteggio percentuale di compatibilità per ogni candidatura</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e8e0d0;font-size:13px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00b4a0;font-weight:700;">&#10003;</span>&nbsp; Shortlist intelligente: solo i profili più compatibili, ordinati per rilevanza</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e8e0d0;font-size:13px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00b4a0;font-weight:700;">&#10003;</span>&nbsp; Database talenti con ricerca avanzata per competenze, settore ed esperienza</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"><span style="color:#00b4a0;font-weight:700;">&#10003;</span>&nbsp; Dashboard analytics con trend candidature in tempo reale</td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#0a1628;border-radius:3px;padding:10px 22px;">
            <a href="https://fooltalent.com" target="_blank" style="font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;text-transform:uppercase;">Scopri FoolTalent &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://fooltalent.com" target="_blank" style="font-size:13px;color:#00b4a0;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Vedi gli annunci &rarr;</a>
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
          <td style="background:#f5f0e8;padding:10px 28px;border-top:2px solid #e8e0d0;border-bottom:1px solid #e8e0d0;">
            <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.12em;text-transform:uppercase;">02 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#2563eb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Analisi · Data Room &amp; Fundraising</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border-left:4px solid #2563eb;padding:16px 28px;">
            <span style="font-size:20px;font-weight:700;color:#0a1628;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">FoolShare: la fortezza digitale per i dati che contano.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 28px 28px;background:#f9f7f4;border-bottom:1px solid #e8e0d0;">
      <p style="font-size:13px;font-weight:600;color:#2563eb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">La piattaforma che unisce data room sicure, NDA digitali e fundraising OS.</p>
      <p style="font-size:14px;line-height:1.75;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        La condivisione di documenti sensibili è il tallone d'Achille di molte aziende. <strong style="color:#0a1628;">FoolShare</strong> risponde con una piattaforma che non si limita a "proteggere" i documenti, ma li trasforma in uno strumento di intelligence: ogni link condiviso è tracciabile — chi lo ha aperto, per quanti minuti, quante volte, da quale città.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
        <tr>
          <td style="border-left:3px solid #2563eb;padding:10px 16px;background:#eff6ff;">
            <span style="font-size:13px;font-style:italic;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">&ldquo;Non è solo una data room. È un sistema operativo per il fundraising. La differenza è sostanziale."</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f4ff;border:1px solid #dbeafe;border-radius:4px;margin-bottom:18px;">
        <tr>
          <td style="padding:12px 16px;font-size:13px;color:#374151;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <span style="color:#2563eb;font-weight:700;">&#127873; Prova gratuita 7 giorni</span> — nessuna carta di credito richiesta.<br>
            Piani da <strong style="color:#0a1628;">€49/mese</strong> (Premium) · <strong style="color:#0a1628;">€99/mese</strong> (Project Room + Fundraising OS)
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#0a1628;border-radius:3px;padding:10px 22px;">
            <a href="https://foolshare.xyz" target="_blank" style="font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;text-transform:uppercase;">Inizia gratis &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://foolshare.xyz" target="_blank" style="font-size:13px;color:#2563eb;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Scopri i piani &rarr;</a>
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
            <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.12em;text-transform:uppercase;">03 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#00b4a0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Inchiesta · Cybersecurity &amp; Comunicazione</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border-left:4px solid #00b4a0;padding:16px 28px;">
            <span style="font-size:20px;font-weight:700;color:#0a1628;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">Fragmentalis: la comunicazione a prova di spia (e di computer quantistici).</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 28px 28px;background:#ffffff;border-bottom:1px solid #e8e0d0;">
      <p style="font-size:13px;font-weight:600;color:#00b4a0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">Tecnologia brevettata IT/EU/USA che rende matematicamente impossibile intercettare le comunicazioni.</p>
      <p style="font-size:14px;line-height:1.75;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        Mentre tutti parlano di crittografia end-to-end, <strong style="color:#0a1628;">Fragmentalis</strong> ha già spostato il campo di gioco nel futuro. La sua tecnologia brevettata "polverizza" i dati — li frammenta su nodi distribuiti, rendendo matematicamente impossibile ricostruirli. Il prodotto di punta, <strong style="color:#0a1628;">StreamSafer Communicator</strong>, è già usato da CDA aziendali, studi legali e istituzioni finanziarie.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
        <tr>
          <td style="border-left:3px solid #00b4a0;padding:10px 16px;background:#f0faf8;">
            <span style="font-size:13px;font-style:italic;color:#0a1628;font-family:Georgia,'Times New Roman',serif;">&ldquo;Non esiste un server centrale. I dati vengono polverizzati. Per ricostruirli, bisognerebbe accedere a tutti i nodi contemporaneamente. Matematicamente impossibile."</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td width="33%" align="center" style="background:#f5f0e8;border-radius:4px;padding:12px 8px;border:1px solid #e8e0d0;">
            <div style="font-size:24px;font-weight:700;color:#00b4a0;font-family:Georgia,'Times New Roman',serif;">0</div>
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Server centrale</div>
          </td>
          <td width="4%"></td>
          <td width="33%" align="center" style="background:#f5f0e8;border-radius:4px;padding:12px 8px;border:1px solid #e8e0d0;">
            <div style="font-size:24px;font-weight:700;color:#00b4a0;font-family:Georgia,'Times New Roman',serif;">100%</div>
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Controllo dati</div>
          </td>
          <td width="4%"></td>
          <td width="26%" align="center" style="background:#f5f0e8;border-radius:4px;padding:12px 8px;border:1px solid #e8e0d0;">
            <div style="font-size:24px;font-weight:700;color:#00b4a0;font-family:Georgia,'Times New Roman',serif;">3</div>
            <div style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Brevetti IT/EU/US</div>
          </td>
        </tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#0a1628;border-radius:3px;padding:10px 22px;">
            <a href="https://fragmentalis.com" target="_blank" style="font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;text-transform:uppercase;">Richiedi Demo &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://fragmentalis.com" target="_blank" style="font-size:13px;color:#00b4a0;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Scopri StreamSafer &rarr;</a>
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
          <td style="background:#f5f0e8;padding:10px 28px;border-top:2px solid #e8e0d0;border-bottom:1px solid #e8e0d0;">
            <span style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.12em;text-transform:uppercase;">04 &mdash;</span>&nbsp;
            <span style="font-size:9px;color:#f97316;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Focus · Market Intelligence</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border-left:4px solid #f97316;padding:16px 28px;">
            <span style="font-size:20px;font-weight:700;color:#0a1628;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">PollCast: l'intelligenza collettiva che prevede i trend di mercato.</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:20px 28px 28px;background:#f9f7f4;border-bottom:1px solid #e8e0d0;">
      <p style="font-size:11px;font-weight:700;color:#f97316;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">La piattaforma gratuita che trasforma le previsioni della community in market intelligence.</p>
      <p style="font-size:14px;line-height:1.75;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">
        E se le previsioni di mercato non fossero più un'esclusiva per pochi analisti? <strong style="color:#0a1628;">PollCast</strong> ha lanciato una piattaforma gratuita dove chiunque può creare e votare previsioni su qualsiasi tema — business, tech, sport, politica o trend di mercato. I risultati aggregati, su migliaia di voti, tendono a essere sorprendentemente accurati.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr><td style="padding:5px 0;border-bottom:1px solid #e8e0d0;font-size:12px;color:#374151;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; <strong style="color:#f97316;">Crypto</strong> &nbsp; Bitcoin supererà i $200k entro il 2026? &nbsp;<strong style="color:#f97316;">61% Sì</strong> (511 voti)</td></tr>
        <tr><td style="padding:5px 0;border-bottom:1px solid #e8e0d0;font-size:12px;color:#374151;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; <strong style="color:#f97316;">Tech</strong> &nbsp; ChatGPT-5 sarà rilasciato entro giugno 2026? &nbsp;<strong style="color:#f97316;">75% Sì</strong> (370 voti)</td></tr>
        <tr><td style="padding:5px 0;font-size:12px;color:#374151;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; <strong style="color:#f97316;">Economia</strong> &nbsp; Tesla raggiungerà i $500 per azione? &nbsp;<strong style="color:#f97316;">57% Sì</strong> (412 voti)</td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#0a1628;border-radius:3px;padding:10px 22px;">
            <a href="https://pollcast.online" target="_blank" style="font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.06em;text-transform:uppercase;">Vota le previsioni &rarr;</a>
          </td>
          <td style="padding-left:12px;">
            <a href="https://pollcast.online" target="_blank" style="font-size:13px;color:#f97316;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Crea una previsione &rarr;</a>
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
          <td style="background:#f5f0e8;padding:12px 28px;border-top:2px solid #e8e0d0;">
            <span style="font-size:10px;color:#00b4a0;letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:9px;">&#9670; Ultime News AI &mdash; ${month}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 28px 28px;background:#ffffff;">
      <p style="font-size:13px;font-weight:700;color:#0a1628;font-family:Georgia,'Times New Roman',serif;margin:0 0 16px;">I 10 eventi AI più significativi della settimana</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${newsItemsHtml}
      </table>
    </td>
  </tr>

  <!-- NEWSLETTER CTA -->
  <tr>
    <td align="center" style="padding:28px;background:#0a1628;border-top:2px solid #00b4a0;">
      <p style="font-size:18px;font-weight:700;color:#ffffff;font-family:Georgia,'Times New Roman',serif;margin:0 0 8px;">Ricevi la newsletter<br><span style="color:#00b4a0;">direttamente nella tua inbox.</span></p>
      <p style="font-size:13px;color:rgba(255,255,255,0.65);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 20px;">Ogni giorno le notizie più importanti più promettenti per il business italiano.</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="background:#00b4a0;border-radius:3px;padding:12px 28px;">
            <a href="https://ideasmart.ai" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">Abbonati gratis &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:24px 28px 28px;background:#f5f0e8;border-top:1px solid #d8d0c0;">
      <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-align:center;">
        &copy; 2026 <strong style="color:#374151;">IDEASMART</strong> &mdash; La Prima Testata Giornalistica HumanLess
      </p>
      <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-align:center;line-height:1.6;">
        Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter IDEASMART.<br>
        Sede legale: Italia &middot; P.IVA in corso di registrazione &middot; <a href="${baseUrl}/privacy" style="color:#9ca3af;text-decoration:underline;">Privacy Policy</a>
      </p>
      <!-- Separatore -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px;">
        <tr><td style="border-top:1px solid #d8d0c0;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
      <!-- Link disiscrizione GDPR -->
      <p style="font-size:11px;color:#6b7280;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
        <a href="${unsubLink}" style="color:#f97316;text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:600;">Annulla iscrizione</a>
        &nbsp;&middot;&nbsp;
        <a href="${baseUrl}" style="color:#6b7280;text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita il sito</a>
        &nbsp;&middot;&nbsp;
        <a href="${baseUrl}/privacy" style="color:#9ca3af;text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Privacy Policy</a>
      </p>
      <p style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:10px 0 0;text-align:center;">
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
  preferencesUrl?: string;
  channels?: string[];
}): string {
  const { name, unsubscribeUrl, preferencesUrl, channels } = opts;
  const baseUrl = `https://ideasmart.ai`;
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;
  const greeting = name ? `Ciao ${name},` : "Ciao,";

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto in IDEASMART</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fa;padding:32px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- TOP BAR -->
        <tr>
          <td style="background:#0a0f1e;padding:10px 32px;">
            <span style="font-size:10px;color:#00b4a0;letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; IDEASMART</span>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0f1e 0%,#1a2540 100%);padding:40px 32px 36px;text-align:center;">
            <div style="font-size:36px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.1;margin-bottom:8px;">
              IDEA<span style="color:#00b4a0;">SMART</span>
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
              Benvenuto in <strong style="color:#1a1f2e;">IDEASMART</strong> — la prima testata giornalistica HumanLess su AI, Startup e Venture Capital.
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

            <!-- CANALI SCELTI -->
            ${channels && channels.length > 0 ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0faf8;border:1px solid #b2e8e0;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td style="padding:0 0 12px;">
                  <span style="font-size:11px;font-weight:700;color:#00b4a0;text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; I tuoi canali scelti</span>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 14px;">
                  ${channels.map(ch => {
                    const info: Record<string, {label: string; color: string; bg: string}> = {
                      ai: { label: 'AI', color: '#00b4a0', bg: '#e6f9f6' },
                      startup: { label: 'Startup', color: '#e84f00', bg: '#fef0ea' },
                      finance: { label: 'Finance', color: '#2563eb', bg: '#eff6ff' },
                      sport: { label: 'Sport', color: '#16a34a', bg: '#f0fdf4' },
                      music: { label: 'Music', color: '#9333ea', bg: '#faf5ff' },
                      luxury: { label: 'Luxury', color: '#d97706', bg: '#fffbeb' },
                      health: { label: 'Health', color: '#db2777', bg: '#fdf2f8' },
                    };
                    const c = info[ch] || { label: ch, color: '#6b7280', bg: '#f9fafb' };
                    return `<span style="display:inline-block;background:${c.bg};color:${c.color};border:1px solid ${c.color}33;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:2px 4px 2px 0;">${c.label}</span>`;
                  }).join('')}
                </td>
              </tr>
              ${preferencesUrl ? `<tr><td><a href="${preferencesUrl}" style="font-size:13px;color:#00b4a0;text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Modifica i tuoi canali &rarr;</a></td></tr>` : ''}
            </table>
            ` : preferencesUrl ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0faf8;border:1px solid #b2e8e0;border-radius:12px;padding:20px;margin-bottom:24px;">
              <tr>
                <td>
                  <p style="font-size:14px;color:#1a1f2e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;"><strong>Personalizza la tua newsletter</strong></p>
                  <p style="font-size:13px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">Scegli i canali tematici che vuoi ricevere: AI, Startup, Finance, Sport, Music, Luxury, Health.</p>
                  <a href="${preferencesUrl}" style="display:inline-block;background:#00b4a0;color:#ffffff;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Scegli i tuoi canali &rarr;</a>
                </td>
              </tr>
            </table>
            ` : ''}

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px;">
              <tr>
                <td style="background:#00b4a0;border-radius:10px;padding:14px 32px;">
                  <a href="${baseUrl}" style="font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi le ultime news &rarr;</a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
              Hai domande? Scrivi a <a href="mailto:info@ideasmart.ai" style="color:#00b4a0;text-decoration:none;">info@ideasmart.ai</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 32px 28px;background:#f8f9fc;border-top:1px solid #e2e5ed;">
            <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;text-align:center;">
              &copy; 2026 <strong>IDEASMART</strong> &mdash; La Prima Testata Giornalistica HumanLess
            </p>
            <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 6px;text-align:center;">
              Hai ricevuto questa email perch&eacute; ti sei iscritto su <a href="${baseUrl}" style="color:#00b4a0;text-decoration:none;">ideasmart.ai</a>.
            </p>
            <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
              ${preferencesUrl ? `<a href="${preferencesUrl}" style="color:#00b4a0;text-decoration:underline;">Gestisci preferenze canali</a>&nbsp;&middot;&nbsp;` : ''}<a href="${unsubLink}" style="color:#e84f00;text-decoration:underline;">Annulla iscrizione</a>
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
  editorial?: { id?: number | null; section?: string | null; title: string; subtitle?: string | null; body: string; keyTrend?: string | null; authorNote?: string | null } | null;
  startup?: { id?: number | null; section?: string | null; name: string; tagline: string; description: string; category: string; funding?: string | null; whyToday: string; websiteUrl?: string | null; aiScore?: number | null } | null;
  news: Array<{ id?: number | null; section?: string | null; title: string; summary: string; category: string; sourceName?: string | null; sourceUrl?: string | null }>;
  reportages: Array<{ id?: number | null; section?: string | null; startupName: string; category: string; headline: string; subheadline?: string | null; bodyText: string; quote?: string | null; stat1Value?: string | null; stat1Label?: string | null; stat2Value?: string | null; stat2Label?: string | null; stat3Value?: string | null; stat3Label?: string | null; websiteUrl?: string | null; ctaLabel?: string | null; ctaUrl?: string | null }>;
  analyses: Array<{ id?: number | null; section?: string | null; title: string; category: string; summary: string; source: string; dataPoint1?: string | null; dataPoint2?: string | null; dataPoint3?: string | null; keyInsight?: string | null; italyRelevance?: string | null }>;
  researches?: Array<{ id?: number | null; title: string; summary: string; category: string; source: string; sourceUrl?: string | null; isResearchOfDay?: boolean | null }>;
  unsubscribeUrl?: string;
  trackingPixelUrl?: string;
  channelName?: string;
  frequencyLabel?: string;
  isTest?: boolean;
}): string {
  const { dateLabel, editorial, startup, news, reportages, analyses, researches, unsubscribeUrl, trackingPixelUrl, channelName, frequencyLabel, isTest } = opts;
  const baseUrl = `https://ideasmart.ai`;
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;

  // ── Palette brand EDITORIALE — identica alla Home page (stile giornale) ──
  const TEAL    = "#00b4a0";   // teal primario
  const TEAL_L  = "#e6f7f5";   // teal light bg
  const NAVY    = "#0a1628";   // testo primario scuro (navy profondo)
  const NAVY2   = "#1a2744";   // navy secondario
  const ORANGE  = "#e84f00";   // accento arancio
  const ORANGE_L= "#fff2ec";   // arancio light bg
  const BLUE    = "#1a56db";   // accento blu
  const BLUE_L  = "#eff4ff";   // blu light bg
  const SLATE   = "#4b5563";   // testo secondario
  const MUTED   = "#9ca3af";   // testo muted
  const BORDER  = "#d8d0c0";   // bordi caldi (stile carta)
  const CREAM   = "#f5f0e8";   // sfondo crema (identico alla Home)
  const CREAM2  = "#ede8de";   // crema più scura per sezioni alternate
  const WHITE   = "#ffffff";   // bianco puro
  const PURPLE  = "#7c3aed";   // viola
  const PURPLE_L= "#f5f3ff";   // viola light
  const GREEN   = "#059669";   // verde
  const GREEN_L = "#ecfdf5";   // verde light

  const catColors: Record<string, { text: string; bg: string }> = {
    "Modelli Generativi": { text: TEAL, bg: TEAL_L },
    "AI Generativa":      { text: TEAL, bg: TEAL_L },
    "AI Agentiva":        { text: TEAL, bg: TEAL_L },
    "Robot & AI Fisica":  { text: TEAL, bg: TEAL_L },
    "AI & Startup Italiane": { text: TEAL, bg: TEAL_L },
    "AI & Hardware":      { text: BLUE, bg: BLUE_L },
    "Big Tech":           { text: BLUE, bg: BLUE_L },
    "Internazionalizzazione": { text: BLUE, bg: BLUE_L },
    "AI & Difesa":        { text: ORANGE, bg: ORANGE_L },
    "Startup & Funding":  { text: ORANGE, bg: ORANGE_L },
    "Ricerca & Innovazione": { text: ORANGE, bg: ORANGE_L },
    "Regolamentazione AI": { text: "#b45309", bg: "#fffbeb" },
    "AI & Lavoro":        { text: PURPLE, bg: PURPLE_L },
    "AI & Salute":        { text: GREEN, bg: GREEN_L },
    "AI & Finanza":       { text: BLUE, bg: BLUE_L },
  };
  const getColor = (cat: string) => catColors[cat]?.text ?? TEAL;
  const getBg    = (cat: string) => catColors[cat]?.bg   ?? TEAL_L;

  // ── Sezione news — stile editoriale CHIARO (crema/bianco) ──
  const newsHtml = news.map((item, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const color = getColor(item.category);
    const bgPill = `${color}18`;
    const isEven = idx % 2 === 1;
    // Costruisce URL interno Ideasmart se disponibile id e section, altrimenti usa sourceUrl
    const ideasmartUrl = (item.id && item.section)
      ? `${baseUrl}/${item.section}/news/${item.id}`
      : null;
    const articleLink = ideasmartUrl ?? item.sourceUrl ?? null;
    return `
  <tr>
    <td style="padding:0;border-bottom:1px solid ${BORDER};background:${isEven ? CREAM2 : WHITE};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="52" valign="top" style="padding:16px 0 16px 20px;">
            <div style="width:32px;height:32px;border-radius:6px;background:${bgPill};display:table;">
              <div style="display:table-cell;vertical-align:middle;text-align:center;">
                <span style="font-size:11px;font-weight:900;color:${color};font-family:Georgia,'Times New Roman',serif;">${num}</span>
              </div>
            </div>
          </td>
          <td valign="top" style="padding:16px 20px 16px 10px;">
            <div style="margin-bottom:5px;">
              <span style="display:inline-block;font-size:9px;font-weight:700;color:${color};background:${bgPill};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;border-radius:3px;padding:2px 8px;">${item.category}</span>
            </div>
            ${articleLink ? `<a href="${articleLink}" style="font-size:14px;font-weight:700;color:${NAVY};font-family:Georgia,'Times New Roman',serif;line-height:1.35;margin-bottom:5px;display:block;text-decoration:none;">${item.title}</a>` : `<div style="font-size:14px;font-weight:700;color:${NAVY};font-family:Georgia,'Times New Roman',serif;line-height:1.35;margin-bottom:5px;">${item.title}</div>`}
            <div style="font-size:12px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.65;">${item.summary}</div>
            ${item.sourceName ? `<div style="margin-top:5px;"><span style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">via </span><span style="font-size:10px;color:${color};font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${item.sourceName}</span>${ideasmartUrl ? ` &mdash; <a href="${ideasmartUrl}" style="font-size:10px;color:${color};text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi su IDEASMART →</a>` : ""}</div>` : (ideasmartUrl ? `<div style="margin-top:5px;"><a href="${ideasmartUrl}" style="font-size:10px;color:${color};text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi su IDEASMART →</a></div>` : "")}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }).join("");

  // ── Sezione reportage — stile editoriale CHIARO (crema/bianco) ──
  const reportageHtml = reportages.map((rep, idx) => {
    const accentColors = [TEAL, ORANGE, BLUE, PURPLE];
    const color = accentColors[idx % 4];
    const colorBg = `${color}15`;
    const statsHtml = [
      rep.stat1Value && rep.stat1Label ? `<td width="30%" align="center" style="background:${colorBg};border-radius:8px;padding:14px 8px;border:1px solid ${BORDER};"><div style="font-size:24px;font-weight:900;color:${color};font-family:Georgia,'Times New Roman',serif;line-height:1;margin-bottom:6px;">${rep.stat1Value}</div><div style="font-size:9px;color:${SLATE};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat1Label}</div></td>` : "",
      rep.stat2Value && rep.stat2Label ? `<td width="4%"></td><td width="30%" align="center" style="background:${colorBg};border-radius:8px;padding:14px 8px;border:1px solid ${BORDER};"><div style="font-size:24px;font-weight:900;color:${color};font-family:Georgia,'Times New Roman',serif;line-height:1;margin-bottom:6px;">${rep.stat2Value}</div><div style="font-size:9px;color:${SLATE};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat2Label}</div></td>` : "",
      rep.stat3Value && rep.stat3Label ? `<td width="4%"></td><td width="30%" align="center" style="background:${colorBg};border-radius:8px;padding:14px 8px;border:1px solid ${BORDER};"><div style="font-size:24px;font-weight:900;color:${color};font-family:Georgia,'Times New Roman',serif;line-height:1;margin-bottom:6px;">${rep.stat3Value}</div><div style="font-size:9px;color:${SLATE};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.stat3Label}</div></td>` : "",
    ].filter(Boolean).join("");

    return `
  <!-- REPORTAGE ${idx + 1}: ${rep.startupName} -->
  <tr>
    <td style="padding:0;border-top:2px solid ${BORDER};background:${idx % 2 === 0 ? WHITE : CREAM};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:${CREAM2};padding:10px 28px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:8px;font-weight:700;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.18em;text-transform:uppercase;">REPORTAGE 0${idx + 1}</span>
            <span style="font-size:8px;color:${BORDER};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &mdash; </span>
            <span style="font-size:8px;font-weight:700;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.18em;text-transform:uppercase;">${rep.category}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 28px 18px;border-left:4px solid ${color};background:${idx % 2 === 0 ? WHITE : CREAM};">
            <div style="font-size:20px;font-weight:700;color:${NAVY};font-family:Georgia,'Times New Roman',serif;line-height:1.25;margin-bottom:7px;">${rep.headline}</div>
            ${rep.subheadline ? `<div style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.5;font-style:italic;">${rep.subheadline}</div>` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:${idx % 2 === 0 ? WHITE : CREAM};">
            <p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">${rep.bodyText.replace(/\n/g, "<br>")}</p>
            ${rep.quote ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0 18px;">
              <tr><td style="border-left:3px solid ${color};padding:10px 16px;background:${colorBg};border-radius:0 8px 8px 0;">
                <span style="font-size:13px;font-style:italic;color:${NAVY2};font-family:Georgia,'Times New Roman',serif;line-height:1.6;">&ldquo;${rep.quote}&rdquo;</span>
              </td></tr>
            </table>` : ""}
            ${statsHtml ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;"><tr>${statsHtml}</tr></table>` : ""}
            ${rep.id ? `
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
              <tr><td style="background:${color};border-radius:6px;padding:11px 26px;">
                <a href="${baseUrl}/${rep.section || "ai"}/reportage/${rep.id}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi il reportage completo →</a>
              </td></tr>
            </table>` : ""}
            ${rep.websiteUrl ? `
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:transparent;border:1px solid ${color};border-radius:6px;padding:10px 24px;">
                <a href="${rep.websiteUrl}" target="_blank" style="font-size:12px;font-weight:600;color:${color};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${rep.ctaLabel || "Visita il sito"} →</a>
              </td></tr>
            </table>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }).join("");

  // ── Sezione analisi di mercato — stile editoriale CHIARO card ──
  const analysesHtml = analyses.map((a, idx) => {
    const accentColors = [TEAL, BLUE, ORANGE, PURPLE];
    const color = accentColors[idx % 4];
    const colorBg = `${color}12`;
    const dataPoints = [a.dataPoint1, a.dataPoint2, a.dataPoint3].filter(Boolean);
    return `
  <tr>
    <td style="padding:0 0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:${colorBg};padding:12px 20px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:9px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.12em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${a.category}</span>
            <span style="font-size:9px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &bull; ${a.source}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px 18px;background:${WHITE};">
            <div style="font-size:15px;font-weight:700;color:${NAVY};font-family:Georgia,'Times New Roman',serif;line-height:1.35;margin-bottom:8px;">${a.title}</div>
            <div style="font-size:12px;line-height:1.7;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:${dataPoints.length > 0 ? "12px" : "0"}">${a.summary}</div>
            ${dataPoints.length > 0 ? `
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              <tr>
                ${dataPoints.map(dp => `<td style="padding:7px 10px;background:${colorBg};border-radius:4px;border:1px solid ${BORDER};"><span style="font-size:11px;font-weight:700;color:${color};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${dp}</span></td><td width="8"></td>`).join("")}
              </tr>
            </table>` : ""}
            ${a.keyInsight ? `<div style="margin-top:10px;padding:10px 14px;border-left:3px solid ${color};background:${colorBg};border-radius:0 6px 6px 0;"><span style="font-size:12px;font-style:italic;color:${NAVY2};font-family:Georgia,'Times New Roman',serif;">&ldquo;${a.keyInsight}&rdquo;</span></div>` : ""}
            ${a.id ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr><td style="background:${color};border-radius:6px;padding:10px 22px;"><a href="${baseUrl}/${a.section || "ai"}/analisi/${a.id}" target="_blank" style="font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi l'analisi completa →</a></td></tr></table>` : ""}
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
  <title>IDEASMART — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};padding:24px 0 48px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:${WHITE};overflow:hidden;border:1px solid ${BORDER};">

        ${isTest ? `<!-- TEST BANNER -->
        <tr><td style="background:${ORANGE};padding:10px 28px;text-align:center;"><span style="font-size:11px;font-weight:700;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.12em;">&#9888; EMAIL DI PROVA — Non distribuire</span></td></tr>` : ""}

        <!-- MASTHEAD GIORNALE — sfondo crema stile giornale -->
        <tr>
          <td style="background:${CREAM};padding:10px 28px;border-bottom:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:8px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.14em;text-transform:uppercase;">AI NEWS &bull; STARTUP NEWS &bull; DEALROOM &bull; RICERCHE</td>
                <td align="right" style="font-size:8px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.08em;">${dateLabel}</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- TESTATA PRINCIPALE —  Georgia serif, navy su crema -->
        <tr>
          <td align="center" style="background:${CREAM};padding:32px 28px 10px;">
            <div style="font-size:58px;font-weight:900;color:${NAVY};letter-spacing:-3px;line-height:1;font-family:Georgia,'Times New Roman',serif;">IDEA<span style="color:${TEAL};">SMART</span></div>
            <div style="font-size:9px;color:${SLATE};letter-spacing:0.28em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:8px;">La Prima Testata Giornalistica HumanLess</div>
            ${channelName ? `<div style="margin-top:10px;display:inline-block;font-size:10px;font-weight:700;color:${TEAL};background:${TEAL_L};border:1px solid ${TEAL};border-radius:20px;padding:3px 14px;letter-spacing:0.12em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${channelName}</div>` : ""}
            ${frequencyLabel ? `<div style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:7px;letter-spacing:0.05em;">${frequencyLabel}</div>` : ""}
          </td>
        </tr>
        <!-- DOPPIA LINEA STILE GIORNALE —  teal + grigio caldo -->
        <tr><td style="padding:14px 28px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:3px;background:${TEAL};"></td></tr><tr><td style="height:1px;background:${BORDER};margin-top:3px;"></td></tr></table></td></tr>
        <!-- SOMMARIO NUMERI -->
        <tr>
          <td style="background:${CREAM};padding:18px 28px 22px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:24px;">
                  <div style="font-size:28px;font-weight:900;color:${TEAL};font-family:Georgia,'Times New Roman',serif;line-height:1;">${news.length}</div>
                  <div style="font-size:8px;color:${MUTED};text-transform:uppercase;letter-spacing:0.12em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:3px;">Notizie</div>
                </td>
                ${reportages.length > 0 ? `<td style="padding-right:24px;border-left:1px solid ${BORDER};padding-left:24px;">
                  <div style="font-size:28px;font-weight:900;color:${ORANGE};font-family:Georgia,'Times New Roman',serif;line-height:1;">${reportages.length}</div>
                  <div style="font-size:8px;color:${MUTED};text-transform:uppercase;letter-spacing:0.12em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:3px;">Reportage</div>
                </td>` : ""}
                ${analyses.length > 0 ? `<td style="border-left:1px solid ${BORDER};padding-left:24px;">
                  <div style="font-size:28px;font-weight:900;color:${BLUE};font-family:Georgia,'Times New Roman',serif;line-height:1;">${analyses.length}</div>
                  <div style="font-size:8px;color:${MUTED};text-transform:uppercase;letter-spacing:0.12em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-top:3px;">Analisi</div>
                </td>` : ""}
              </tr>
            </table>
          </td>
        </tr>
        <!-- SEPARATORE CORPO -->
        <tr><td style="height:1px;background:${BORDER};"></td></tr>

        ${editorial ? `
        <!-- EDITORIALE —  sfondo crema, serif navy -->
        <tr>
          <td style="background:${CREAM};border-top:2px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM2};padding:10px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:8px;font-weight:700;color:${MUTED};letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">EDITORIALE</span>
                <span style="font-size:8px;color:${BORDER};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &mdash; </span>
                <span style="font-size:8px;font-weight:700;color:${TEAL};letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi del Giorno</span>
              </td></tr>
              <tr><td style="padding:22px 28px 18px;border-left:4px solid ${TEAL};background:${CREAM};">
                ${editorial.keyTrend ? `<div style="font-size:8px;font-weight:700;color:${TEAL};text-transform:uppercase;letter-spacing:0.14em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:10px;">&#9670; ${editorial.keyTrend}</div>` : ""}
                <div style="font-size:22px;font-weight:700;color:${NAVY};font-family:Georgia,'Times New Roman',serif;line-height:1.25;margin-bottom:7px;">${editorial.title}</div>
                ${editorial.subtitle ? `<div style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-style:italic;">${editorial.subtitle}</div>` : ""}
              </td></tr>              <tr><td style="padding:18px 28px;background:${WHITE};}">
                <p style="font-size:14px;line-height:1.85;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;">${editorial.body.replace(/\n/g, "<br>")}</p>
                ${editorial.authorNote ? `<p style="font-size:12px;font-style:italic;color:${MUTED};font-family:Georgia,'Times New Roman',serif;margin:10px 0 0;padding-top:10px;border-top:1px solid ${BORDER};">${editorial.authorNote}</p>` : ""}
                ${editorial.id ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr><td style="background:${TEAL};border-radius:6px;padding:11px 26px;"><a href="${baseUrl}/${editorial.section || "ai"}/editoriale/${editorial.id}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi l'editoriale completo →</a></td></tr></table>` : ""}
              </td></tr>
            </table>
          </td>
        </tr>` : ""}

        ${startup ? `
        <!-- STARTUP DEL GIORNO —  crema/bianco, serif navy -->
        <tr>
          <td style="background:${CREAM};border-top:2px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM2};padding:10px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:8px;font-weight:700;color:${MUTED};letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">STARTUP DEL GIORNO</span>
                <span style="font-size:8px;color:${BORDER};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;"> &mdash; </span>
                <span style="font-size:8px;font-weight:700;color:${ORANGE};letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${startup.category}</span>
              </td></tr>
              <tr><td style="padding:22px 28px 18px;border-left:4px solid ${ORANGE};background:${CREAM};">
                <div style="font-size:22px;font-weight:700;color:${NAVY};font-family:Georgia,'Times New Roman',serif;line-height:1.2;margin-bottom:5px;">${startup.name}</div>
                <div style="font-size:13px;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-style:italic;">${startup.tagline}</div>
              </td></tr>
              <tr><td style="padding:18px 28px;background:${WHITE};">
                <p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;">${startup.description}</p>
                <p style="font-size:11px;font-weight:700;color:${ORANGE};text-transform:uppercase;letter-spacing:0.1em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 5px;">Perché oggi?</p>
                <p style="font-size:13px;line-height:1.7;color:${SLATE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 14px;">${startup.whyToday}</p>
                ${startup.funding ? `<div style="margin-bottom:12px;"><span style="font-size:11px;font-weight:700;color:${ORANGE};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9632; Funding: ${startup.funding}</span></div>` : ""}
                ${startup.aiScore ? `<div style="margin-bottom:14px;"><span style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">AI Score: <strong style="color:${ORANGE};">${startup.aiScore}/100</strong></span></div>` : ""}
                ${startup.id ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;"><tr><td style="background:${ORANGE};border-radius:6px;padding:11px 26px;"><a href="${baseUrl}/${startup.section || "ai"}/spotlight/${startup.id}" target="_blank" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi l'analisi completa →</a></td></tr></table>` : ""}
                ${startup.websiteUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:transparent;border:1px solid ${ORANGE};border-radius:6px;padding:10px 24px;"><a href="${startup.websiteUrl}" target="_blank" style="font-size:12px;font-weight:600;color:${ORANGE};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Visita il sito →</a></td></tr></table>` : ""}
              </td></tr>
            </table>
          </td>
        </tr>` : ""}

        <!-- REPORTAGE —  crema/bianco -->
        ${reportages.length > 0 ? `
        <tr>
          <td style="background:${CREAM2};border-top:2px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM2};padding:12px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:8px;font-weight:700;color:${TEAL};letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Reportage Startup AI Italiane</span>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:0;background:${WHITE};"><table width="100%" cellpadding="0" cellspacing="0" border="0">${reportageHtml}</table></td></tr>` : ""}

        <!-- NEWS —  crema/bianco -->
        <tr>
          <td style="background:${CREAM2};border-top:2px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM2};padding:12px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:8px;font-weight:700;color:${TEAL};letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Le ${news.length} Notizie del Giorno</span>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:${WHITE};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${newsHtml}
            </table>
          </td>
        </tr>

        <!-- ANALISI DI MERCATO —  crema/bianco -->
        ${analyses.length > 0 ? `
        <tr>
          <td style="background:${CREAM2};border-top:2px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM2};padding:12px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:8px;font-weight:700;color:${BLUE};letter-spacing:0.18em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Analisi di Mercato</span>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 8px;background:${WHITE};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${analysesHtml}
            </table>
          </td>
        </tr>` : ""}

        ${researches && researches.length > 0 ? `
        <!-- RICERCHE DEL GIORNO — sezione teal scuro stile premium -->
        <tr>
          <td style="background:#0a1628;border-top:3px solid #00b4a0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:16px 28px 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <span style="font-size:8px;font-weight:700;color:#00b4a0;letter-spacing:0.22em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9650; IDEASMART RESEARCH</span>
                    </td>
                    <td align="right">
                      <a href="https://ideasmart.ai/research" style="font-size:8px;font-weight:700;color:#00b4a0;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.1em;">TUTTE LE RICERCHE &rarr;</a>
                    </td>
                  </tr>
                </table>
                <div style="font-size:20px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;margin-top:8px;margin-bottom:4px;">Ricerche del Giorno</div>
                <div style="font-size:10px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Analisi quotidiane su Startup, Venture Capital e AI Trends &mdash; dati dalle principali fonti di ricerca globali ed europee.</div>
              </td></tr>
            </table>
          </td>
        </tr>
        ${researches.map((r, idx) => {
          const catColors: Record<string, string> = {
            ai_trends: '#00b4a0', venture_capital: '#1a56db', startup: '#e84f00', technology: '#7c3aed', market: '#059669'
          };
          const catLabels: Record<string, string> = {
            ai_trends: 'AI TRENDS', venture_capital: 'VENTURE CAPITAL', startup: 'STARTUP', technology: 'TECNOLOGIA', market: 'MERCATI'
          };
          const color = catColors[r.category] ?? '#00b4a0';
          const catLabel = catLabels[r.category] ?? r.category.toUpperCase();
          const isRoD = r.isResearchOfDay;
          const researchUrl = r.id ? `https://ideasmart.ai/research/${r.id}` : 'https://ideasmart.ai/research';
          let keyFindings: string[] = [];
          return `
        <tr>
          <td style="background:${idx % 2 === 0 ? '#0d1f3c' : '#0a1628'};padding:16px 28px;border-top:1px solid #1a2744;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:8px;font-weight:700;color:${color};background:${color}22;border:1px solid ${color}44;border-radius:4px;padding:2px 8px;letter-spacing:0.14em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${catLabel}</span>
                  ${isRoD ? `<span style="font-size:8px;font-weight:700;color:#ff5500;background:#ff550022;border:1px solid #ff550044;border-radius:4px;padding:2px 8px;letter-spacing:0.14em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-left:6px;">&#9670; RICERCA DEL GIORNO</span>` : ''}
                </td>
                <td align="right" style="font-size:9px;color:#4b5563;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${r.source}</td>
              </tr>
              <tr><td colspan="2" style="padding-top:8px;">
                <a href="${researchUrl}" style="font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">${r.title}</a>
              </td></tr>
              <tr><td colspan="2" style="padding-top:6px;">
                <div style="font-size:12px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;">${r.summary.slice(0, 200)}${r.summary.length > 200 ? '&hellip;' : ''}</div>
              </td></tr>
              <tr><td colspan="2" style="padding-top:10px;">
                <a href="${researchUrl}" style="font-size:11px;font-weight:700;color:${color};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi la ricerca completa &rarr;</a>
              </td></tr>
            </table>
          </td>
        </tr>`;
        }).join('')}
        <tr><td style="background:#0a1628;padding:12px 28px 20px;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td style="background:#00b4a0;border-radius:6px;padding:12px 28px;">
              <a href="https://ideasmart.ai/research" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Vai a IdeaSmart Research &rarr;</a>
            </td></tr>
          </table>
        </td></tr>` : ''}

        <!-- BANNER PROMO IDEASMART — sopra il footer -->
        <tr>
          <td style="background:${NAVY};border-top:3px solid ${TEAL};padding:28px 28px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom:12px;">
                  <div style="font-size:9px;font-weight:700;color:${TEAL};letter-spacing:0.22em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:6px;">&#9670; ISCRIVITI GRATIS</div>
                  <div style="font-size:22px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;line-height:1.2;margin-bottom:8px;">Non perderti le prossime edizioni &mdash; iscriviti alla newsletter</div>
                  <div style="font-size:12px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;margin-bottom:16px;">Ricevi ogni <strong style="color:#ffffff;">luned&igrave;, mercoled&igrave; e venerd&igrave;</strong> le notizie pi&ugrave; importanti su AI, Startup, Venture Capital e Deal &amp; Funding. Oltre <strong style="color:${TEAL};">4.000 fonti</strong> monitorate ogni giorno. <strong style="color:#ffffff;">Completamente gratis.</strong></div>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:${TEAL};border-radius:6px;padding:14px 32px;">
                        <a href="${baseUrl}/#newsletter" style="font-size:14px;font-weight:700;color:#0a1628;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.02em;">Iscriviti ora &rarr;</a>
                      </td>
                      <td style="padding-left:16px;">
                        <a href="${baseUrl}/dealroom" style="font-size:12px;font-weight:600;color:${TEAL};text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">DEALROOM &rarr;</a>
                      </td>
                      <td style="padding-left:12px;">
                        <a href="${baseUrl}/ai" style="font-size:12px;font-weight:600;color:#9ca3af;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">AI News &rarr;</a>
                      </td>
                      <td style="padding-left:12px;">
                        <a href="${baseUrl}/startup" style="font-size:12px;font-weight:600;color:#9ca3af;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Startup &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER —  crema, testo navy -->
        <tr>
          <td style="background:${CREAM2};padding:24px 28px 28px;border-top:2px solid ${BORDER};">
            <p style="font-size:12px;color:${NAVY};font-family:Georgia,'Times New Roman',serif;margin:0 0 8px;text-align:center;">
              <strong>IDEA<span style="color:${TEAL};">SMART</span></strong> &mdash; La Prima Testata Giornalistica HumanLess &bull; &copy; 2026
            </p>
            <p style="font-size:10px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 16px;text-align:center;line-height:1.7;">
              Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter IDEASMART.<br>
              Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 14px;">
              <tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="font-size:11px;color:${MUTED};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0;text-align:center;">
              <a href="${baseUrl}/preferenze-newsletter" style="color:${TEAL};text-decoration:underline;font-weight:700;">Gestisci canali</a>
              &nbsp;&middot;&nbsp;
              <a href="${unsubLink}" style="color:${ORANGE};text-decoration:underline;font-weight:700;">Annulla iscrizione</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/privacy" style="color:${MUTED};text-decoration:underline;">Privacy Policy</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}" style="color:${TEAL};text-decoration:none;">ideasmart.ai</a>
            </p>
          </td>
        </tr>

        <!-- Bottom bar teal —  identica alla Home -->
        <tr><td style="background:${TEAL};padding:0;height:4px;"></td></tr>

      </table>
    </td>
  </tr>
</table>

${trackingPixelUrl ? `<!-- Tracking pixel --><img src="${trackingPixelUrl}" width="1" height="1" border="0" style="display:block;width:1px;height:1px;" alt="" />` : ''}

</body>
</html>`;
}
