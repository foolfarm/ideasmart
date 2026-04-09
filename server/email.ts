import { ENV } from "./_core/env";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  // Mittente ufficiale ProofPress.AI
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "info@proofpress.ai";
  const fromName = process.env.SENDGRID_FROM_NAME || "ProofPress.AI";
  const replyTo = "noreply@proofpress.ai";

  if (!apiKey) {
    console.error("[Email] SENDGRID_API_KEY not set");
    return { success: false, error: "SENDGRID_API_KEY not configured" };
  }

  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];

  const body = {
    personalizations: recipients.map((email) => ({
      to: [{ email }]
    })),
    from: { email: fromEmail, name: fromName },
    reply_to: { email: replyTo, name: fromName },
    subject: opts.subject,
    content: [
      ...(opts.text ? [{ type: "text/plain", value: opts.text }] : []),
      { type: "text/html", value: opts.html }
    ]
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
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

// ─── TEMPLATE DARK UFFICIALE Proof Press ────────────────────────────────────────
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
  const baseUrl = process.env.VITE_APP_ID ? `https://ideasmart.biz` : `https://ideasmart.biz`;
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
    "default": "#00e5c8"
  };

  // Genera le righe news — stile crema/navy
  const newsItemsHtml = news.slice(0, 20).map((item, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const color = categoryColors[item.category] ?? categoryColors["default"];
    // Usa URL interno Proof Press se disponibile id e section, altrimenti usa url esterno
    const ideasmartUrl = (item.id && item.section)
      ? `${baseUrl}/${item.section}/news/${item.id}`
      : null;
    const linkUrl = ideasmartUrl ?? item.url ?? null;
    const titleEl = linkUrl
      ? `<a href="${linkUrl}" style="font-size:13px;font-weight:700;color:#0a1628;text-decoration:none;font-family:Georgia,'Times New Roman',serif;line-height:1.5;">${item.title}</a>`
      : `<span style="font-size:13px;font-weight:700;color:#0a1628;font-family:Georgia,'Times New Roman',serif;line-height:1.5;">${item.title}</span>`;
    const sourceEl = item.source
      ? ` &mdash; <em style="color:#9ca3af;">${item.source}</em>${ideasmartUrl ? ` &mdash; <a href="${ideasmartUrl}" style="font-size:10px;color:${color};text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi su Proof Press →</a>` : ""}`
      : (ideasmartUrl ? ` &mdash; <a href="${ideasmartUrl}" style="font-size:10px;color:${color};text-decoration:underline;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">Leggi su Proof Press →</a>` : "");
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
<title>Proof Press · N° ${issueNumber} · ${month}</title>
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
        <strong style="color:#0a1628;">Proof Press</strong> è la prima testata giornalistica HumanLess che ogni giorno analizza oltre 4.000 fonti su AI, Startup e Venture Capital. Ricerche verificate, alert e briefing per chi prende decisioni.
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
        E se le previsioni di mercato non fossero più un'esclusiva per pochi analisti? <strong style="color:#0a1628;">PollCast</strong> ha lanciato una piattaforma gratuita dove chiunque può creare e votare previsioni su qualsiasi tema — business, tech, politica o trend di mercato. I risultati aggregati, su migliaia di voti, tendono a essere sorprendentemente accurati.
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
            <a href="https://ideasmart.biz" style="font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">Abbonati gratis &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:24px 28px 28px;background:#f5f0e8;border-top:1px solid #d8d0c0;">
      <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 10px;text-align:center;">
        &copy; 2026 <strong style="color:#374151;">Proof Press</strong> &mdash; La Prima Testata Giornalistica HumanLess
      </p>
      <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 12px;text-align:center;line-height:1.6;">
        Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter Proof Press.<br>
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
      summary: n.description
    }))
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
  const baseUrl = `https://ideasmart.biz`;
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;
  const greeting = name ? `Ciao ${name},` : "Ciao,";

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto in Proof Press</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fa;padding:32px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- TOP BAR -->
        <tr>
          <td style="background:#0a0f1e;padding:10px 32px;">
            <span style="font-size:10px;color:#00b4a0;letter-spacing:0.15em;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">&#9670; Proof Press</span>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a0f1e 0%,#1a2540 100%);padding:40px 32px 36px;text-align:center;">
            <div style="font-size:36px;font-weight:900;color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.1;margin-bottom:8px;">
              IDEA<span style="color:#00b4a0;">SMART</span>
            </div>
            <div style="font-size:14px;color:rgba(255,255,255,0.55);font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin-bottom:24px;">by Proof Press</div>
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
              Benvenuto in <strong style="color:#1a1f2e;">Proof Press</strong> — la prima testata giornalistica HumanLess su AI, Startup e Venture Capital.
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
                      health: { label: 'Health', color: '#db2777', bg: '#fdf2f8' }
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
              Hai domande? Scrivi a <a href="mailto:info@proofpress.ai" style="color:#00b4a0;text-decoration:none;">info@proofpress.ai</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 32px 28px;background:#f8f9fc;border-top:1px solid #e2e5ed;">
            <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 8px;text-align:center;">
              &copy; 2026 <strong>Proof Press</strong> &mdash; La Prima Testata Giornalistica HumanLess
            </p>
            <p style="font-size:11px;color:#9ca3af;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;margin:0 0 6px;text-align:center;">
              Hai ricevuto questa email perch&eacute; ti sei iscritto su <a href="${baseUrl}" style="color:#00b4a0;text-decoration:none;">ideasmart.biz</a>.
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

// ─── NEWSLETTER COMPLETA — DESIGN ALLINEATO AL SITO (v2 — Mar 2026) ──────────
// Font: SF Pro / system-ui (come il sito)
// Sfondo: crema #f5f0e8 (identico alla homepage)
// Stile: editoriale pulito, card bianche, badge neri, accento per canale
// Messaggio: 400+ fonti verificate con tecnologia Verify
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
  const baseUrl = `https://ideasmart.biz`;
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;

  // ── Font stack — SF Pro / system-ui (identico al sito) ────────────────────────
  const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const FONT_MONO = "'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace";

  // ── Palette — identica al sito ───────────────────────────────────────
  const BLACK   = "#1a1a1a";
  const DARK    = "#2d2d2d";
  const SLATE   = "#4b5563";
  const MUTED   = "#9ca3af";
  const BORDER  = "#d8d0c0";
  const CREAM   = "#f5f0e8";
  const CREAM2  = "#ede8de";
  const WHITE   = "#ffffff";
  const RED     = "#dc2626";

  // ── Accento per canale ───────────────────────────────────────────
  type ChannelTheme = {
    accent: string;
    accentLight: string;
    label: string;
    subtitle: string;
    sectionPath: string;
  };
  const CHANNEL_THEMES: Record<string, ChannelTheme> = {
    "AI News": {
      accent: "#1a1a1a",
      accentLight: "#f0f0f0",
      label: "AI NEWS",
      subtitle: "Intelligenza Artificiale per il Business",
      sectionPath: "ai",
    },
    "Startup News": {
      accent: "#1a1a1a",
      accentLight: "#f0f0f0",
      label: "STARTUP NEWS",
      subtitle: "Startup, Innovazione e Venture Capital",
      sectionPath: "startup",
    },
    "DEALROOM News": {
      accent: "#1a1a1a",
      accentLight: "#f0f0f0",
      label: "DEALROOM",
      subtitle: "Round, Funding, VC, M&amp;A",
      sectionPath: "dealroom",
    },
  };
  const theme = CHANNEL_THEMES[channelName ?? ""] ?? CHANNEL_THEMES["AI News"];

  // ── Category badge colors ────────────────────────────────────────
  const catColors: Record<string, { text: string; bg: string }> = {
    "Modelli Generativi": { text: WHITE, bg: BLACK },
    "AI Generativa":      { text: WHITE, bg: BLACK },
    "AI Agentiva":        { text: WHITE, bg: BLACK },
    "Robot & AI Fisica":  { text: WHITE, bg: BLACK },
    "AI & Startup Italiane": { text: WHITE, bg: BLACK },
    "AI & Hardware":      { text: WHITE, bg: DARK },
    "Big Tech":           { text: WHITE, bg: DARK },
    "Internazionalizzazione": { text: WHITE, bg: DARK },
    "AI & Difesa":        { text: WHITE, bg: "#374151" },
    "Startup & Funding":  { text: WHITE, bg: "#374151" },
    "Ricerca & Innovazione": { text: WHITE, bg: "#374151" },
    "Regolamentazione AI": { text: WHITE, bg: "#4b5563" },
    "AI & Lavoro":        { text: WHITE, bg: "#4b5563" },
    "AI & Salute":        { text: WHITE, bg: "#4b5563" },
    "AI & Finanza":       { text: WHITE, bg: DARK }
  };
  const getColor = (cat: string) => catColors[cat]?.text ?? WHITE;
  const getBg    = (cat: string) => catColors[cat]?.bg   ?? BLACK;

  // ── Sezione NEWS — stile sito (card bianche, badge nero, font system-ui) ──
  const newsHtml = news.map((item, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const badgeBg = getBg(item.category);
    const badgeText = getColor(item.category);
    const ideasmartUrl = (item.id && item.section)
      ? `${baseUrl}/${item.section}/news/${item.id}`
      : null;
    const articleLink = ideasmartUrl ?? item.sourceUrl ?? null;
    return `
  <tr>
    <td style="padding:0;border-bottom:1px solid ${BORDER};background:${WHITE};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" style="padding:20px 28px;">
            <div style="margin-bottom:8px;">
              <span style="display:inline-block;font-size:9px;font-weight:700;color:${badgeText};background:${badgeBg};text-transform:uppercase;letter-spacing:0.12em;font-family:${FONT};border-radius:2px;padding:3px 10px;">${item.category}</span>
            </div>
            ${articleLink ? `<a href="${articleLink}" style="font-size:16px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.35;margin-bottom:6px;display:block;text-decoration:none;">${item.title}</a>` : `<div style="font-size:16px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.35;margin-bottom:6px;">${item.title}</div>`}
            <div style="font-size:13px;color:${SLATE};font-family:${FONT};line-height:1.7;">${item.summary}</div>
            <div style="margin-top:8px;">
              ${item.sourceName ? `<span style="font-size:11px;color:${MUTED};font-family:${FONT};">Fonte: <strong style="color:${SLATE};">${item.sourceName}</strong></span>` : ""}
              ${ideasmartUrl ? `<span style="margin-left:8px;"><a href="${ideasmartUrl}" style="font-size:11px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};letter-spacing:0.02em;">LEGGI L'ARTICOLO ORIGINALE &rarr;</a></span>` : ""}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }).join("");

  // ── Sezione REPORTAGE — stile sito (card bianche, bordo sinistro nero) ──
  const reportageHtml = reportages.map((rep, idx) => {
    const statsHtml = [
      rep.stat1Value && rep.stat1Label ? `<td width="30%" align="center" style="background:${CREAM};border-radius:4px;padding:14px 8px;border:1px solid ${BORDER};"><div style="font-size:22px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1;margin-bottom:4px;">${rep.stat1Value}</div><div style="font-size:9px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;font-family:${FONT};">${rep.stat1Label}</div></td>` : "",
      rep.stat2Value && rep.stat2Label ? `<td width="4%"></td><td width="30%" align="center" style="background:${CREAM};border-radius:4px;padding:14px 8px;border:1px solid ${BORDER};"><div style="font-size:22px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1;margin-bottom:4px;">${rep.stat2Value}</div><div style="font-size:9px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;font-family:${FONT};">${rep.stat2Label}</div></td>` : "",
      rep.stat3Value && rep.stat3Label ? `<td width="4%"></td><td width="30%" align="center" style="background:${CREAM};border-radius:4px;padding:14px 8px;border:1px solid ${BORDER};"><div style="font-size:22px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1;margin-bottom:4px;">${rep.stat3Value}</div><div style="font-size:9px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;font-family:${FONT};">${rep.stat3Label}</div></td>` : ""
    ].filter(Boolean).join("");

    return `
  <!-- REPORTAGE ${idx + 1}: ${rep.startupName} -->
  <tr>
    <td style="padding:0;border-top:1px solid ${BORDER};background:${WHITE};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:${CREAM};padding:10px 28px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:9px;font-weight:700;color:${MUTED};font-family:${FONT};letter-spacing:0.18em;text-transform:uppercase;">REPORTAGE 0${idx + 1}</span>
            <span style="font-size:9px;color:${BORDER};font-family:${FONT};"> &mdash; </span>
            <span style="font-size:9px;font-weight:700;color:${BLACK};font-family:${FONT};letter-spacing:0.18em;text-transform:uppercase;">${rep.category}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 28px 18px;border-left:4px solid ${BLACK};background:${WHITE};">
            <div style="font-size:20px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.25;margin-bottom:7px;">${rep.headline}</div>
            ${rep.subheadline ? `<div style="font-size:13px;color:${SLATE};font-family:${FONT};line-height:1.5;font-style:italic;">${rep.subheadline}</div>` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:${WHITE};">
            <p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:${FONT};margin:0 0 14px;">${rep.bodyText.replace(/\n/g, "<br>")}</p>
            ${rep.quote ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0 18px;">
              <tr><td style="border-left:3px solid ${BLACK};padding:10px 16px;background:${CREAM};border-radius:0 4px 4px 0;">
                <span style="font-size:13px;font-style:italic;color:${DARK};font-family:${FONT};line-height:1.6;">&ldquo;${rep.quote}&rdquo;</span>
              </td></tr>
            </table>` : ""}
            ${statsHtml ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;"><tr>${statsHtml}</tr></table>` : ""}
            ${rep.id ? `
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
              <tr><td style="background:${BLACK};border-radius:4px;padding:11px 26px;">
                <a href="${baseUrl}/${rep.section || "ai"}/reportage/${rep.id}" target="_blank" style="font-size:13px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${FONT};">Leggi il reportage completo &rarr;</a>
              </td></tr>
            </table>` : ""}
            ${rep.websiteUrl ? `
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:transparent;border:1px solid ${BLACK};border-radius:4px;padding:10px 24px;">
                <a href="${rep.websiteUrl}" target="_blank" style="font-size:12px;font-weight:600;color:${BLACK};text-decoration:none;font-family:${FONT};">${rep.ctaLabel || "Visita il sito"} &rarr;</a>
              </td></tr>
            </table>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }).join("");

  // ── Sezione ANALISI DI MERCATO — stile sito (card con bordo) ──
  const analysesHtml = analyses.map((a, idx) => {
    const dataPoints = [a.dataPoint1, a.dataPoint2, a.dataPoint3].filter(Boolean);
    return `
  <tr>
    <td style="padding:0 0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER};border-radius:4px;overflow:hidden;">
        <tr>
          <td style="background:${CREAM};padding:12px 20px;border-bottom:1px solid ${BORDER};">
            <span style="font-size:9px;font-weight:700;color:${BLACK};text-transform:uppercase;letter-spacing:0.12em;font-family:${FONT};">${a.category}</span>
            <span style="font-size:9px;color:${MUTED};font-family:${FONT};"> &bull; ${a.source}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px 18px;background:${WHITE};">
            <div style="font-size:15px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.35;margin-bottom:8px;">${a.title}</div>
            <div style="font-size:12px;line-height:1.7;color:${SLATE};font-family:${FONT};margin-bottom:${dataPoints.length > 0 ? "12px" : "0"}">${a.summary}</div>
            ${dataPoints.length > 0 ? `
            <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              <tr>
                ${dataPoints.map(dp => `<td style="padding:7px 10px;background:${CREAM};border-radius:4px;border:1px solid ${BORDER};"><span style="font-size:11px;font-weight:700;color:${BLACK};font-family:${FONT};">${dp}</span></td><td width="8"></td>`).join("")}
              </tr>
            </table>` : ""}
            ${a.keyInsight ? `<div style="margin-top:10px;padding:10px 14px;border-left:3px solid ${BLACK};background:${CREAM};border-radius:0 4px 4px 0;"><span style="font-size:12px;font-style:italic;color:${DARK};font-family:${FONT};">&ldquo;${a.keyInsight}&rdquo;</span></div>` : ""}
            ${a.id ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;"><tr><td style="background:${BLACK};border-radius:4px;padding:10px 22px;"><a href="${baseUrl}/${a.section || "ai"}/analisi/${a.id}" target="_blank" style="font-size:12px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${FONT};">Leggi l'analisi completa &rarr;</a></td></tr></table>` : ""}
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
  <title>Proof Press — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${FONT};">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};padding:24px 0 48px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:${WHITE};overflow:hidden;border:1px solid ${BORDER};">

        ${isTest ? `<!-- TEST BANNER -->
        <tr><td style="background:${RED};padding:10px 28px;text-align:center;"><span style="font-size:11px;font-weight:700;color:#ffffff;font-family:${FONT};text-transform:uppercase;letter-spacing:0.12em;">&#9888; EMAIL DI PROVA — Non distribuire</span></td></tr>` : ""}

        <!-- TOP BAR — data + link sezioni (come il sito) -->
        <tr>
          <td style="background:${WHITE};padding:12px 28px;border-bottom:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:10px;font-weight:500;color:${MUTED};font-family:${FONT};text-transform:uppercase;letter-spacing:0.1em;">${dateLabel}</span>
                </td>
                <td align="right">
                  <span style="font-size:9px;font-weight:600;color:${MUTED};font-family:${FONT};letter-spacing:0.08em;">RESEARCH &middot; AI &middot; STARTUP &middot; VENTURE CAPITAL</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HEADER — Proof Press grande in nero (come il sito) -->
        <tr>
          <td style="background:${WHITE};padding:32px 28px 16px;text-align:center;">
            <a href="${baseUrl}" style="text-decoration:none;"><div style="font-size:48px;font-weight:900;color:${BLACK};letter-spacing:-2px;line-height:1;font-family:${FONT};">Proof Press</div></a>
            <div style="margin-top:10px;font-size:10px;color:${SLATE};letter-spacing:0.28em;text-transform:uppercase;font-family:${FONT};line-height:1.5;">Intelligence Quotidiana su AI, Startup e Venture Capital</div>
            <div style="margin-top:4px;font-size:10px;color:${MUTED};font-family:${FONT};font-style:italic;">Ricerche verificate, alert e briefing per chi prende decisioni.</div>
          </td>
        </tr>

        <!-- BARRA CANALI — tab come il sito -->
        <tr>
          <td style="background:${WHITE};padding:0 28px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <a href="${baseUrl}/ai" style="display:inline-block;font-size:10px;font-weight:700;color:${WHITE};background:${BLACK};border-radius:2px;padding:5px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">AI NEWS</a>
                  <a href="${baseUrl}/startup" style="display:inline-block;font-size:10px;font-weight:700;color:${WHITE};background:${BLACK};border-radius:2px;padding:5px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">STARTUP NEWS</a>
                  <a href="${baseUrl}/research" style="display:inline-block;font-size:10px;font-weight:700;color:${BLACK};background:${WHITE};border:1px solid ${BORDER};border-radius:2px;padding:4px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">RICERCHE</a>
                  <a href="${baseUrl}/dealroom" style="display:inline-block;font-size:10px;font-weight:700;color:${BLACK};background:${WHITE};border:1px solid ${BORDER};border-radius:2px;padding:4px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">DEALROOM</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SEPARATORE NERO -->
        <tr><td style="height:2px;background:${BLACK};"></td></tr>

        <!-- BADGE CANALE ATTIVO + VERIFY -->
        <tr>
          <td style="background:${CREAM};padding:18px 28px 14px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  ${channelName ? `<div style="display:inline-block;font-size:12px;font-weight:800;color:${WHITE};background:${BLACK};border-radius:2px;padding:5px 18px;letter-spacing:0.14em;text-transform:uppercase;font-family:${FONT};">${theme.label}</div>` : ""}
                  <div style="margin-top:6px;font-size:12px;color:${SLATE};font-family:${FONT};">${theme.subtitle}</div>
                  ${frequencyLabel ? `<div style="font-size:10px;color:${MUTED};font-family:${FONT};margin-top:4px;">${frequencyLabel}</div>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- VERIFY BADGE — 400+ fonti -->
        <tr>
          <td style="background:${CREAM};padding:0 28px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:4px;">
              <tr>
                <td style="padding:12px 20px;">
                  <div style="font-size:10px;font-weight:700;color:${BLACK};font-family:${FONT};letter-spacing:0.08em;text-transform:uppercase;">&#10003; VERIFY &mdash; Informazioni certificate</div>
                  <div style="font-size:11px;color:${SLATE};font-family:${FONT};margin-top:4px;line-height:1.5;">Oltre <strong style="color:${BLACK};">400 fonti</strong> monitorate ogni giorno con tecnologia Verify dal nostro team. Informazioni certificate e verificate.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SOMMARIO NUMERI -->
        <tr>
          <td style="background:${CREAM};padding:0 28px 16px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:24px;">
                  <div style="font-size:28px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1;">${news.length}</div>
                  <div style="font-size:8px;color:${MUTED};text-transform:uppercase;letter-spacing:0.12em;font-family:${FONT};margin-top:3px;">Notizie</div>
                </td>
                ${reportages.length > 0 ? `<td style="padding-right:24px;border-left:1px solid ${BORDER};padding-left:24px;">
                  <div style="font-size:28px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1;">${reportages.length}</div>
                  <div style="font-size:8px;color:${MUTED};text-transform:uppercase;letter-spacing:0.12em;font-family:${FONT};margin-top:3px;">Reportage</div>
                </td>` : ""}
                ${analyses.length > 0 ? `<td style="border-left:1px solid ${BORDER};padding-left:24px;">
                  <div style="font-size:28px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1;">${analyses.length}</div>
                  <div style="font-size:8px;color:${MUTED};text-transform:uppercase;letter-spacing:0.12em;font-family:${FONT};margin-top:3px;">Analisi</div>
                </td>` : ""}
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:1px;background:${BORDER};"></td></tr>

        ${editorial ? `
        <!-- EDITORIALE -->
        <tr>
          <td style="background:${WHITE};border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM};padding:10px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:9px;font-weight:700;color:${MUTED};letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">EDITORIALE</span>
                <span style="font-size:9px;color:${BORDER};font-family:${FONT};"> &mdash; </span>
                <span style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">Analisi del Giorno</span>
              </td></tr>
              <tr><td style="padding:22px 28px 18px;border-left:4px solid ${BLACK};background:${WHITE};">
                ${editorial.keyTrend ? `<div style="font-size:9px;font-weight:700;color:${BLACK};text-transform:uppercase;letter-spacing:0.14em;font-family:${FONT};margin-bottom:10px;background:${CREAM};display:inline-block;padding:3px 10px;border-radius:2px;">${editorial.keyTrend}</div>` : ""}
                <div style="font-size:22px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.25;margin-bottom:7px;">${editorial.title}</div>
                ${editorial.subtitle ? `<div style="font-size:13px;color:${SLATE};font-family:${FONT};font-style:italic;">${editorial.subtitle}</div>` : ""}
              </td></tr>
              <tr><td style="padding:18px 28px;background:${WHITE};">
                <p style="font-size:14px;line-height:1.85;color:${SLATE};font-family:${FONT};margin:0 0 10px;">${editorial.body.replace(/\n/g, "<br>")}</p>
                ${editorial.authorNote ? `<p style="font-size:12px;font-style:italic;color:${MUTED};font-family:${FONT};margin:10px 0 0;padding-top:10px;border-top:1px solid ${BORDER};">${editorial.authorNote}</p>` : ""}
                ${editorial.id ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr><td style="background:${BLACK};border-radius:4px;padding:11px 26px;"><a href="${baseUrl}/${editorial.section || "ai"}/editoriale/${editorial.id}" target="_blank" style="font-size:13px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${FONT};">Leggi l'editoriale completo &rarr;</a></td></tr></table>` : ""}
              </td></tr>
            </table>
          </td>
        </tr>` : ""}

        ${startup ? `
        <!-- STARTUP DEL GIORNO -->
        <tr>
          <td style="background:${WHITE};border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM};padding:10px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:9px;font-weight:700;color:${MUTED};letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">STARTUP DEL GIORNO</span>
                <span style="font-size:9px;color:${BORDER};font-family:${FONT};"> &mdash; </span>
                <span style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">${startup.category}</span>
              </td></tr>
              <tr><td style="padding:22px 28px 18px;border-left:4px solid ${BLACK};background:${WHITE};">
                <div style="font-size:22px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.2;margin-bottom:5px;">${startup.name}</div>
                <div style="font-size:13px;color:${SLATE};font-family:${FONT};font-style:italic;">${startup.tagline}</div>
              </td></tr>
              <tr><td style="padding:18px 28px;background:${WHITE};">
                <p style="font-size:13px;line-height:1.8;color:${SLATE};font-family:${FONT};margin:0 0 10px;">${startup.description}</p>
                <p style="font-size:11px;font-weight:700;color:${BLACK};text-transform:uppercase;letter-spacing:0.1em;font-family:${FONT};margin:0 0 5px;">Perché oggi?</p>
                <p style="font-size:13px;line-height:1.7;color:${SLATE};font-family:${FONT};margin:0 0 14px;">${startup.whyToday}</p>
                ${startup.funding ? `<div style="margin-bottom:12px;"><span style="font-size:11px;font-weight:700;color:${BLACK};font-family:${FONT};">Funding: ${startup.funding}</span></div>` : ""}
                ${startup.aiScore ? `<div style="margin-bottom:14px;"><span style="font-size:11px;color:${MUTED};font-family:${FONT};">AI Score: <strong style="color:${BLACK};">${startup.aiScore}/100</strong></span></div>` : ""}
                ${startup.id ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;"><tr><td style="background:${BLACK};border-radius:4px;padding:11px 26px;"><a href="${baseUrl}/${startup.section || "ai"}/spotlight/${startup.id}" target="_blank" style="font-size:13px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${FONT};">Leggi l'analisi completa &rarr;</a></td></tr></table>` : ""}
                ${startup.websiteUrl ? `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="background:transparent;border:1px solid ${BLACK};border-radius:4px;padding:10px 24px;"><a href="${startup.websiteUrl}" target="_blank" style="font-size:12px;font-weight:600;color:${BLACK};text-decoration:none;font-family:${FONT};">Visita il sito &rarr;</a></td></tr></table>` : ""}
              </td></tr>
            </table>
          </td>
        </tr>` : ""}

        <!-- REPORTAGE -->
        ${reportages.length > 0 ? `
        <tr>
          <td style="background:${CREAM};border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM};padding:12px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">REPORTAGE</span>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:0;background:${WHITE};"><table width="100%" cellpadding="0" cellspacing="0" border="0">${reportageHtml}</table></td></tr>` : ""}

        <!-- NOTIZIA DEL GIORNO + NEWS -->
        <tr>
          <td style="background:${CREAM};border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM};padding:12px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">NOTIZIA DEL GIORNO</span>
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

        <!-- ANALISI DI MERCATO -->
        ${analyses.length > 0 ? `
        <tr>
          <td style="background:${CREAM};border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="background:${CREAM};padding:12px 28px;border-bottom:1px solid ${BORDER};">
                <span style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">ANALISI DI MERCATO</span>
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
        <!-- RICERCHE DEL GIORNO — sfondo crema scuro -->
        <tr>
          <td style="background:${CREAM2};border-top:2px solid ${BLACK};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding:16px 28px 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <span style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.22em;text-transform:uppercase;font-family:${FONT};">Proof Press RESEARCH</span>
                    </td>
                    <td align="right">
                      <a href="https://ideasmart.biz/research" style="font-size:9px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};letter-spacing:0.1em;">TUTTE LE RICERCHE &rarr;</a>
                    </td>
                  </tr>
                </table>
                <div style="font-size:18px;font-weight:900;color:${BLACK};font-family:${FONT};margin-top:8px;margin-bottom:4px;">Ricerche del Giorno</div>
                <div style="font-size:10px;color:${SLATE};font-family:${FONT};">Analisi quotidiane su Startup, Venture Capital e AI Trends &mdash; dati dalle principali fonti di ricerca globali ed europee.</div>
              </td></tr>
            </table>
          </td>
        </tr>
        ${researches.map((r, idx) => {
          const catLabels: Record<string, string> = {
            ai_trends: 'AI TRENDS', venture_capital: 'VENTURE CAPITAL', startup: 'STARTUP', technology: 'TECNOLOGIA', market: 'MERCATI'
          };
          const catLabel = catLabels[r.category] ?? r.category.toUpperCase();
          const isRoD = r.isResearchOfDay;
          const researchUrl = r.id ? `https://ideasmart.biz/research/${r.id}` : 'https://ideasmart.biz/research';
          return `
        <tr>
          <td style="background:${idx % 2 === 0 ? WHITE : CREAM};padding:16px 28px;border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:9px;font-weight:700;color:${WHITE};background:${BLACK};border-radius:2px;padding:2px 8px;letter-spacing:0.14em;text-transform:uppercase;font-family:${FONT};">${catLabel}</span>
                  ${isRoD ? `<span style="font-size:9px;font-weight:700;color:${WHITE};background:${RED};border-radius:2px;padding:2px 8px;letter-spacing:0.14em;text-transform:uppercase;font-family:${FONT};margin-left:6px;">RICERCA DEL GIORNO</span>` : ''}
                </td>
                <td align="right" style="font-size:10px;color:${MUTED};font-family:${FONT};">${r.source}</td>
              </tr>
              <tr><td colspan="2" style="padding-top:8px;">
                <a href="${researchUrl}" style="font-size:15px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};line-height:1.3;">${r.title}</a>
              </td></tr>
              <tr><td colspan="2" style="padding-top:6px;">
                <div style="font-size:12px;color:${SLATE};font-family:${FONT};line-height:1.6;">${r.summary.slice(0, 200)}${r.summary.length > 200 ? '&hellip;' : ''}</div>
              </td></tr>
              <tr><td colspan="2" style="padding-top:10px;">
                <a href="${researchUrl}" style="font-size:11px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};letter-spacing:0.02em;">LEGGI LA RICERCA COMPLETA &rarr;</a>
              </td></tr>
            </table>
          </td>
        </tr>`;
        }).join('')}
        <tr><td style="background:${CREAM2};padding:12px 28px 20px;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td style="background:${BLACK};border-radius:4px;padding:12px 28px;">
              <a href="https://ideasmart.biz/research" style="font-size:13px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${FONT};">Vai a Proof Press Research &rarr;</a>
            </td></tr>
          </table>
        </td></tr>` : ''}

        <!-- BANNER PROMO Proof Press -->
        <tr>
          <td style="background:${BLACK};border-top:2px solid ${BLACK};padding:28px 28px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom:12px;">
                  <div style="font-size:9px;font-weight:700;color:${WHITE};letter-spacing:0.22em;text-transform:uppercase;font-family:${FONT};margin-bottom:6px;">ISCRIVITI GRATIS</div>
                  <div style="font-size:22px;font-weight:900;color:${WHITE};font-family:${FONT};line-height:1.2;margin-bottom:8px;">Non perderti le prossime edizioni</div>
                  <div style="font-size:12px;color:${MUTED};font-family:${FONT};line-height:1.6;margin-bottom:16px;">Ricevi ogni <strong style="color:${WHITE};">luned&igrave;, mercoled&igrave; e venerd&igrave;</strong> le notizie pi&ugrave; importanti su AI, Startup, Venture Capital e Deal &amp; Funding. Oltre <strong style="color:${WHITE};">400 fonti</strong> monitorate ogni giorno con tecnologia <strong style="color:${WHITE};">Verify</strong>. <strong style="color:${WHITE};">Completamente gratis.</strong></div>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:${WHITE};border-radius:4px;padding:14px 32px;">
                        <a href="${baseUrl}/#newsletter" style="font-size:14px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};letter-spacing:0.02em;">Iscriviti ora &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${CREAM};padding:24px 28px 28px;border-top:1px solid ${BORDER};">
            <p style="font-size:12px;color:${BLACK};font-family:${FONT};margin:0 0 8px;text-align:center;font-weight:700;">
              Proof Press &mdash; Notizie Quotidiane &bull; &copy; 2026
            </p>
            <p style="font-size:10px;color:${MUTED};font-family:${FONT};margin:0 0 16px;text-align:center;line-height:1.7;">
              Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter Proof Press.<br>
              Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 14px;">
              <tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="font-size:11px;color:${MUTED};font-family:${FONT};margin:0;text-align:center;">
              <a href="${baseUrl}/preferenze-newsletter" style="color:${BLACK};text-decoration:underline;font-weight:700;">Gestisci canali</a>
              &nbsp;&middot;&nbsp;
              <a href="${unsubLink}" style="color:${RED};text-decoration:underline;font-weight:700;">Annulla iscrizione</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/privacy" style="color:${MUTED};text-decoration:underline;">Privacy Policy</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}" style="color:${BLACK};text-decoration:none;font-weight:600;">ideasmart.biz</a>
            </p>
          </td>
        </tr>

        <!-- Bottom bar nero -->
        <tr><td style="background:${BLACK};padding:0;height:3px;"></td></tr>

      </table>
    </td>
  </tr>
</table>

${trackingPixelUrl ? `<!-- Tracking pixel --><img src="${trackingPixelUrl}" width="1" height="1" border="0" style="display:block;width:1px;height:1px;" alt="" />` : ''}

</body>
</html>`;
}


// ══════════════════════════════════════════════════════════════════════════════
// NEWSLETTER PROMOZIONALE — Promuove Proof Press come piattaforma
// Stile identico al sito: SF Pro, crema, nero, editoriale
// ══════════════════════════════════════════════════════════════════════════════
export function buildPromoNewsletterHtml(opts: {
  dateLabel: string;
  unsubscribeUrl?: string;
  trackingPixelUrl?: string;
  isTest?: boolean;
}): string {
  const { dateLabel, unsubscribeUrl, trackingPixelUrl, isTest } = opts;
  const baseUrl = "https://ideasmart.biz";
  const unsubLink = unsubscribeUrl ?? `${baseUrl}/unsubscribe`;

  const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const BLACK   = "#1a1a1a";
  const DARK    = "#2d2d2d";
  const SLATE   = "#4b5563";
  const MUTED   = "#9ca3af";
  const BORDER  = "#d8d0c0";
  const CREAM   = "#f5f0e8";
  const CREAM2  = "#ede8de";
  const WHITE   = "#ffffff";
  const RED     = "#dc2626";

  return `<!DOCTYPE html>
<html lang="it" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Proof Press &mdash; Il primo giornale che funziona anche senza una redazione</title>
  <style>
    body{margin:0;padding:0;background:${CREAM};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table{border-spacing:0;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
    img{border:0;display:block;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
    a{color:${BLACK};text-decoration:none;}
    @media only screen and (max-width:620px){
      .wrapper{width:100%!important;}
      .pad{padding-left:16px!important;padding-right:16px!important;}
      .hero-title{font-size:28px!important;line-height:1.15!important;}
      .hero-sub{font-size:15px!important;}
      .section-title{font-size:22px!important;}
      .grid-cell{display:block!important;width:100%!important;padding-bottom:16px!important;}
      .stat-num{font-size:28px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${CREAM};">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};">
  <tr>
    <td align="center" style="padding:0;">
      <table role="presentation" class="wrapper" width="620" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};max-width:620px;width:100%;">

        ${isTest ? `<tr><td style="background:#f59e0b;padding:8px 20px;text-align:center;">
          <span style="font-size:11px;font-weight:700;color:${BLACK};font-family:${FONT};letter-spacing:0.1em;">&#9888; EMAIL DI PROVA &mdash; NON DISTRIBUIRE</span>
        </td></tr>` : ''}

        <!-- TOP BAR -->
        <tr>
          <td style="background:${WHITE};padding:12px 28px;border-bottom:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:10px;color:${MUTED};font-family:${FONT};letter-spacing:0.12em;text-transform:uppercase;">${dateLabel}</td>
                <td align="right" style="font-size:10px;color:${MUTED};font-family:${FONT};letter-spacing:0.08em;">EDIZIONE SPECIALE</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HEADER Proof Press -->
        <tr>
          <td style="background:${WHITE};padding:28px 28px 12px;text-align:center;">
            <div style="font-size:42px;font-weight:900;color:${BLACK};font-family:${FONT};letter-spacing:-0.02em;line-height:1;">Proof Press</div>
            <div style="font-size:10px;font-weight:600;color:${SLATE};font-family:${FONT};letter-spacing:0.22em;text-transform:uppercase;margin-top:8px;">Notizie quotidiane su AI, Startup e Venture Capital</div>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td class="pad" style="background:${WHITE};padding:20px 28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="border-top:3px solid ${BLACK};padding-top:24px;">
                <div class="hero-title" style="font-size:34px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1.12;margin-bottom:16px;">Il primo giornale che funziona anche senza una redazione.</div>
                <div class="hero-sub" style="font-size:17px;color:${SLATE};font-family:${FONT};line-height:1.6;margin-bottom:20px;">Costruisci e scala una testata con l&rsquo;AI agentica. Oltre 4.000 fonti certificate. Una redazione di 8 agenti AI. Un solo obiettivo: informazione pi&ugrave; veloce, oggettiva e scalabile.</div>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${BLACK};border-radius:4px;padding:14px 32px;">
                      <a href="${baseUrl}/chi-siamo" style="font-size:14px;font-weight:700;color:${WHITE};text-decoration:none;font-family:${FONT};letter-spacing:0.02em;">Scopri come funziona &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- STATS BAR -->
        <tr>
          <td style="background:${BLACK};padding:20px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" width="25%" style="padding:8px 4px;">
                  <div class="stat-num" style="font-size:32px;font-weight:900;color:${WHITE};font-family:${FONT};">4.000+</div>
                  <div style="font-size:9px;font-weight:600;color:${MUTED};font-family:${FONT};letter-spacing:0.16em;text-transform:uppercase;margin-top:4px;">Fonti</div>
                </td>
                <td align="center" width="25%" style="padding:8px 4px;">
                  <div class="stat-num" style="font-size:32px;font-weight:900;color:${WHITE};font-family:${FONT};">8</div>
                  <div style="font-size:9px;font-weight:600;color:${MUTED};font-family:${FONT};letter-spacing:0.16em;text-transform:uppercase;margin-top:4px;">Agenti AI</div>
                </td>
                <td align="center" width="25%" style="padding:8px 4px;">
                  <div class="stat-num" style="font-size:32px;font-weight:900;color:${WHITE};font-family:${FONT};">6.900+</div>
                  <div style="font-size:9px;font-weight:600;color:${MUTED};font-family:${FONT};letter-spacing:0.16em;text-transform:uppercase;margin-top:4px;">Lettori</div>
                </td>
                <td align="center" width="25%" style="padding:8px 4px;">
                  <div class="stat-num" style="font-size:32px;font-weight:900;color:${WHITE};font-family:${FONT};">20+</div>
                  <div style="font-size:9px;font-weight:600;color:${MUTED};font-family:${FONT};letter-spacing:0.16em;text-transform:uppercase;margin-top:4px;">Ricerche/giorno</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- IL PROBLEMA -->
        <tr>
          <td class="pad" style="background:${CREAM};padding:32px 28px 24px;">
            <div style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.22em;text-transform:uppercase;font-family:${FONT};margin-bottom:8px;">IL PROBLEMA</div>
            <div class="section-title" style="font-size:26px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1.15;margin-bottom:16px;">Oggi fare giornalismo &egrave; inefficiente.</div>
          </td>
        </tr>
        <tr>
          <td class="pad" style="background:${CREAM};padding:0 28px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="grid-cell" width="50%" valign="top" style="padding:0 8px 12px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:20px;margin-bottom:8px;">&#128176;</div>
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Costi editoriali alti</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};line-height:1.5;">Redazioni costose che comprimono i margini.</div>
                    </td></tr>
                  </table>
                </td>
                <td class="grid-cell" width="50%" valign="top" style="padding:0 0 12px 8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:20px;margin-bottom:8px;">&#9201;</div>
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Produzione lenta</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};line-height:1.5;">Notizie in ritardo rispetto al mercato.</div>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="grid-cell" width="50%" valign="top" style="padding:0 8px 0 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:20px;margin-bottom:8px;">&#128101;</div>
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Dipendenza da grandi team</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};line-height:1.5;">Difficile scalare senza assumere.</div>
                    </td></tr>
                  </table>
                </td>
                <td class="grid-cell" width="50%" valign="top" style="padding:0 0 0 8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:20px;margin-bottom:8px;">&#9878;</div>
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Bias e qualit&agrave; incostante</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};line-height:1.5;">Credibilit&agrave; a rischio.</div>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
            <div style="font-size:14px;color:${SLATE};font-family:${FONT};line-height:1.6;margin-top:16px;text-align:center;font-style:italic;">La maggior parte delle testate non scala. E chi scala, perde qualit&agrave;.</div>
          </td>
        </tr>

        <!-- LA SOLUZIONE -->
        <tr>
          <td class="pad" style="background:${WHITE};padding:32px 28px;border-top:2px solid ${BLACK};">
            <div style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.22em;text-transform:uppercase;font-family:${FONT};margin-bottom:8px;">LA SOLUZIONE</div>
            <div class="section-title" style="font-size:26px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1.15;margin-bottom:16px;">Proof Press &egrave; la prima piattaforma di giornalismo agentico.</div>
            <div style="font-size:14px;color:${SLATE};font-family:${FONT};line-height:1.7;margin-bottom:20px;">Una redazione completa, composta da <strong style="color:${BLACK};">8 agenti AI specializzati</strong>, che lavorano insieme come un vero team editoriale:</div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="top" style="padding-right:12px;"><span style="font-size:16px;font-weight:900;color:${BLACK};font-family:${FONT};">01</span></td>
                      <td><span style="font-size:13px;color:${DARK};font-family:${FONT};">Analizzano oltre <strong>4.000 fonti certificate</strong> ogni giorno</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="top" style="padding-right:12px;"><span style="font-size:16px;font-weight:900;color:${BLACK};font-family:${FONT};">02</span></td>
                      <td><span style="font-size:13px;color:${DARK};font-family:${FONT};">Verificano le notizie con tecnologia <strong>Verify</strong></span></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="top" style="padding-right:12px;"><span style="font-size:16px;font-weight:900;color:${BLACK};font-family:${FONT};">03</span></td>
                      <td><span style="font-size:13px;color:${DARK};font-family:${FONT};">Scrivono e <strong>ottimizzano gli articoli</strong> per tono e stile</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td valign="top" style="padding-right:12px;"><span style="font-size:16px;font-weight:900;color:${BLACK};font-family:${FONT};">04</span></td>
                      <td><span style="font-size:13px;color:${DARK};font-family:${FONT};"><strong>Pubblicano e distribuiscono</strong> i contenuti automaticamente</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};border-radius:6px;border:1px solid ${BORDER};">
              <tr><td style="padding:20px 24px;">
                <div style="font-size:15px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.5;">Tu porti la linea editoriale.<br><span style="color:${SLATE};font-weight:400;">La piattaforma fa il resto.</span></div>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- TECNOLOGIA VERIFY -->
        <tr>
          <td class="pad" style="background:${BLACK};padding:32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td>
                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                  <tr><td style="background:${WHITE};border-radius:3px;padding:4px 12px;">
                    <span style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.16em;text-transform:uppercase;font-family:${FONT};">POWERED BY VERIFY</span>
                  </td></tr>
                </table>
                <div style="font-size:24px;font-weight:900;color:${WHITE};font-family:${FONT};line-height:1.2;margin-bottom:16px;">Non &egrave; solo AI.<br>È AI + verifica.</div>
                <div style="font-size:13px;color:${MUTED};font-family:${FONT};line-height:1.7;margin-bottom:20px;">Con Verify, ogni contenuto viene <strong style="color:${WHITE};">validato sulle fonti</strong>, <strong style="color:${WHITE};">bilanciato per oggettivit&agrave;</strong> e <strong style="color:${WHITE};">ottimizzato per tono e stile</strong>.</div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${DARK};border-radius:6px;border:1px solid #374151;">
                  <tr><td style="padding:18px 22px;">
                    <div style="font-size:12px;font-weight:700;color:${WHITE};font-family:${FONT};margin-bottom:10px;">Puoi decidere:</div>
                    <div style="font-size:12px;color:${MUTED};font-family:${FONT};line-height:1.8;">
                      &bull; Quanto essere neutrale o opinionated<br>
                      &bull; Il linguaggio editoriale<br>
                      &bull; Il posizionamento della testata<br>
                      &bull; Insegnare alla piattaforma a scrivere come te
                    </div>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- COSA PUOI FARE -->
        <tr>
          <td class="pad" style="background:${WHITE};padding:32px 28px;border-top:2px solid ${BLACK};">
            <div style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.22em;text-transform:uppercase;font-family:${FONT};margin-bottom:8px;">COSA PUOI FARE</div>
            <div class="section-title" style="font-size:22px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1.2;margin-bottom:20px;">Dalla prima testata al media empire.</div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
                  <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Lanciare una nuova testata digitale</div>
                  <div style="font-size:11px;color:${SLATE};font-family:${FONT};">Parti da zero con una redazione AI completa.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
                  <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Automatizzare un giornale esistente</div>
                  <div style="font-size:11px;color:${SLATE};font-family:${FONT};">Riduci i costi e aumenta la produzione.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
                  <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Creare vertical media</div>
                  <div style="font-size:11px;color:${SLATE};font-family:${FONT};">AI, startup, finanza, salute, tech &mdash; qualsiasi verticale.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;">
                  <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:4px;">Aprire una rubrica personale scalabile</div>
                  <div style="font-size:11px;color:${SLATE};font-family:${FONT};">Anche con 1 solo giornalista.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- PER CHI È -->
        <tr>
          <td class="pad" style="background:${CREAM};padding:28px 28px;border-top:1px solid ${BORDER};">
            <div style="font-size:9px;font-weight:700;color:${BLACK};letter-spacing:0.22em;text-transform:uppercase;font-family:${FONT};margin-bottom:8px;">PER CHI &Egrave;</div>
            <div style="font-size:14px;color:${SLATE};font-family:${FONT};line-height:1.7;margin-bottom:16px;">Chiunque voglia produrre contenuti editoriali in modo scalabile e profittevole.</div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="grid-cell" width="50%" valign="top" style="padding:0 8px 12px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};">Editori digitali</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};margin-top:4px;">Scale-up della produzione editoriale</div>
                    </td></tr>
                  </table>
                </td>
                <td class="grid-cell" width="50%" valign="top" style="padding:0 0 12px 8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};">Giornalisti indipendenti</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};margin-top:4px;">La tua voce, amplificata dall&rsquo;AI</div>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="grid-cell" width="50%" valign="top" style="padding:0 8px 0 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};">Media company</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};margin-top:4px;">Nuovi verticali a costo marginale zero</div>
                    </td></tr>
                  </table>
                </td>
                <td class="grid-cell" width="50%" valign="top" style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:6px;">
                    <tr><td style="padding:16px 18px;">
                      <div style="font-size:13px;font-weight:700;color:${BLACK};font-family:${FONT};">Creator e analisti</div>
                      <div style="font-size:11px;color:${SLATE};font-family:${FONT};margin-top:4px;">Contenuti professionali, ogni giorno</div>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA FINALE -->
        <tr>
          <td style="background:${BLACK};padding:36px 28px;border-top:2px solid ${BLACK};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="text-align:center;">
                <div style="font-size:22px;font-weight:900;color:${WHITE};font-family:${FONT};line-height:1.2;margin-bottom:12px;">Il giornalismo sta cambiando.<br>Puoi guidarlo o subirlo.</div>
                <div style="font-size:12px;color:${MUTED};font-family:${FONT};line-height:1.6;margin-bottom:24px;">Prenota una demo e scopri come lanciare la tua testata agentica in pochi giorni.</div>
                <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:12px;">
                  <tr>
                    <td style="background:${WHITE};border-radius:4px;padding:14px 32px;">
                      <a href="${baseUrl}/chi-siamo" style="font-size:14px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};letter-spacing:0.02em;">Scopri di pi&ugrave; &rarr;</a>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:12px;">
                  <a href="mailto:ac@foolfarm.com" style="font-size:12px;font-weight:600;color:${MUTED};text-decoration:underline;font-family:${FONT};">Oppure scrivici direttamente</a>
                </div>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${CREAM};padding:24px 28px 28px;border-top:1px solid ${BORDER};">
            <p style="font-size:12px;color:${BLACK};font-family:${FONT};margin:0 0 8px;text-align:center;font-weight:700;">
              Proof Press &mdash; Notizie Quotidiane &bull; &copy; 2026
            </p>
            <p style="font-size:10px;color:${MUTED};font-family:${FONT};margin:0 0 16px;text-align:center;line-height:1.7;">
              Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter Proof Press.<br>
              Ai sensi del GDPR (Reg. UE 2016/679) puoi annullare l'iscrizione in qualsiasi momento.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 14px;">
              <tr><td style="border-top:1px solid ${BORDER};font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <p style="font-size:11px;color:${MUTED};font-family:${FONT};margin:0;text-align:center;">
              <a href="${baseUrl}/ai" style="color:${BLACK};text-decoration:none;font-weight:600;">AI News</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/startup" style="color:${BLACK};text-decoration:none;font-weight:600;">Startup News</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/dealroom" style="color:${BLACK};text-decoration:none;font-weight:600;">DEALROOM</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/research" style="color:${BLACK};text-decoration:none;font-weight:600;">Ricerche</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/chi-siamo" style="color:${BLACK};text-decoration:none;font-weight:600;">Chi Siamo</a>
            </p>
            <p style="font-size:11px;color:${MUTED};font-family:${FONT};margin:12px 0 0;text-align:center;">
              <a href="${unsubLink}" style="color:${RED};text-decoration:underline;font-weight:700;">Annulla iscrizione</a>
              &nbsp;&middot;&nbsp;
              <a href="${baseUrl}/privacy" style="color:${MUTED};text-decoration:underline;">Privacy Policy</a>
            </p>
          </td>
        </tr>

        <!-- Bottom bar nero -->
        <tr><td style="background:${BLACK};padding:0;height:3px;"></td></tr>

      </table>
    </td>
  </tr>
</table>

${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" border="0" style="display:block;width:1px;height:1px;" alt="" />` : ''}

</body>
</html>`;
}
