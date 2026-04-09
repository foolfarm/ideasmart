/**
 * Script one-shot: invia la preview della newsletter Proof Press Promo
 * a ac@acinelli.com usando la campagna corrente (Prompt Library €39).
 * 
 * Usa fetch nativo (Node 18+) e l'API SendGrid v3 direttamente.
 * Esecuzione: node scripts/sendPromoPreviewNow.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Carica .env manualmente
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env non trovato, usa variabili d'ambiente di sistema
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "info@proofpress.ai";
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || "ProofPress.AI — AI-Verified Intelligence. Every Day.";

if (!SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY non trovata nelle variabili d'ambiente");
  process.exit(1);
}

// ─── Campagna corrente ───────────────────────────────────────────────────────
const campaign = {
  subject: "Stai usando l'AI come si deve? Questi 99 prompt cambiano tutto.",
  preheader: "Manager, freelance, marketer, founder: i prompt che usano i professionisti veri. €39 una volta sola.",
  badgeLabel: "OFFERTA LIMITATA",
  headline: "L'AI che usi ogni giorno potrebbe fare 10 volte di più.",
  subheadline: "99 prompt selezionati da professionisti reali — non da tutorial YouTube. Organizzati, ricercabili, pronti all'uso.",
  heroImageUrl: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=640&h=320&fit=crop",
  ctaUrl: "https://ideasmart.forum/",
  ctaText: "🔓 Accedi subito per €39 →",
  ctaSubtext: "Pagamento unico · Nessun abbonamento · Accesso permanente · PDF incluso",
  price: "€39",
};

const today = new Date();
const dateLabel = today.toLocaleDateString("it-IT", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
}).replace(/^\w/, c => c.toUpperCase());

// ─── HTML ────────────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${campaign.subject}</title>
  <style>
    body { margin:0; padding:0; background:#f0ece4; font-family:'Helvetica Neue',Arial,sans-serif; }
    a { color:#d94f3d; text-decoration:none; }
    @media only screen and (max-width:640px) {
      .container { width:100% !important; }
      .hero-img { height:200px !important; }
      .cta-btn { font-size:16px !important; padding:16px 24px !important; }
    }
  </style>
</head>
<body>
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${campaign.preheader}&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;&nbsp;&#8204;</div>

<table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f0ece4">
<tr><td align="center" style="padding:24px 16px 0;">
<table class="container" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;">

  <!-- HEADER -->
  <tr>
    <td style="background:#1a1a1a;padding:28px 32px;border-radius:12px 12px 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin:0;font-family:'Georgia',serif;font-size:26px;font-weight:700;color:#f5f3ef;letter-spacing:-0.5px;">Proof Press</p>
            <p style="margin:2px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">by Ideasmart</p>
          </td>
          <td align="right" valign="middle">
            <span style="background:#d94f3d;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:4px;">${campaign.badgeLabel}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:12px;">
            <p style="margin:8px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#666;letter-spacing:0.5px;">${dateLabel} &middot; Edizione Speciale</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO IMAGE -->
  <tr>
    <td style="background:#fff;padding:0;">
      <a href="${campaign.ctaUrl}">
        <img src="${campaign.heroImageUrl}" alt="Prompt Library" width="640" class="hero-img"
          style="display:block;width:100%;height:280px;object-fit:cover;border:none;">
      </a>
    </td>
  </tr>

  <!-- HEADLINE -->
  <tr>
    <td style="background:#fff;padding:36px 40px 24px;">
      <h1 style="margin:0 0 12px;font-family:'Georgia',serif;font-size:30px;font-weight:700;color:#1a1a1a;line-height:1.2;letter-spacing:-0.5px;">${campaign.headline}</h1>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;color:#555;line-height:1.6;">${campaign.subheadline}</p>
    </td>
  </tr>

  <!-- INTRO -->
  <tr>
    <td style="background:#fff;padding:0 40px 32px;">
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">
        La maggior parte delle persone usa ChatGPT come un motore di ricerca glorificato. Scrive <em>"dimmi come fare X"</em>, ottiene una risposta generica, rimane delusa. Il problema non &egrave; l'AI &mdash; <strong>&egrave; il prompt</strong>. Con i prompt giusti, lo stesso strumento diventa un consulente strategico, un copywriter senior, un analista finanziario.
      </p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr><td style="background:#fff;padding:0 40px;"><hr style="border:none;border-top:1px solid #e8e4dc;margin:0;"></td></tr>

  <!-- A CHI SERVE -->
  <tr>
    <td style="background:#fff;padding:32px 40px;">
      <p style="margin:0 0 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d94f3d;">A CHI SERVE</p>
      
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
        <tr>
          <td width="48" valign="top" style="padding-right:16px;">
            <div style="width:44px;height:44px;background:#1a1a1a;border-radius:8px;text-align:center;line-height:44px;font-size:22px;">&#128084;</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:16px;font-weight:700;color:#1a1a1a;">Per manager e dirigenti</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;">
              <em>"Analizza questo report trimestrale e identificami i 3 rischi principali con piano d'azione concreto"</em> &mdash; trasforma 2 ore di analisi in 10 minuti di lavoro ad alto valore.
            </p>
          </td>
        </tr>
      </table>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
        <tr>
          <td width="48" valign="top" style="padding-right:16px;">
            <div style="width:44px;height:44px;background:#1a1a1a;border-radius:8px;text-align:center;line-height:44px;font-size:22px;">&#128640;</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:16px;font-weight:700;color:#1a1a1a;">Per founder e imprenditori</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;">
              <em>"Sei un esperto di go-to-market B2B SaaS. Costruisci una strategia di lancio per [prodotto] con budget &euro;5.000"</em> &mdash; output concreto e strutturato, non teoria generica.
            </p>
          </td>
        </tr>
      </table>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
        <tr>
          <td width="48" valign="top" style="padding-right:16px;">
            <div style="width:44px;height:44px;background:#1a1a1a;border-radius:8px;text-align:center;line-height:44px;font-size:22px;">&#9997;&#65039;</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:16px;font-weight:700;color:#1a1a1a;">Per marketer e content creator</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;">
              <em>"Scrivi 5 subject line email per [prodotto] usando la formula AIDA, tono professionale ma diretto, max 50 caratteri"</em> &mdash; risultati in 30 secondi invece di 30 minuti.
            </p>
          </td>
        </tr>
      </table>

      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="48" valign="top" style="padding-right:16px;">
            <div style="width:44px;height:44px;background:#1a1a1a;border-radius:8px;text-align:center;line-height:44px;font-size:22px;">&#128188;</div>
          </td>
          <td valign="top">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:16px;font-weight:700;color:#1a1a1a;">Per consulenti e freelance</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;">
              <em>"Sei un consulente senior. Analizza questo brief del cliente e identificami le domande che non ha fatto ma che determinano il successo del progetto"</em> &mdash; il prompt che impressiona i clienti.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PRIMA / DOPO -->
  <tr>
    <td style="background:#f5f3ef;padding:32px 40px;">
      <p style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d94f3d;">PRIMA / DOPO</p>
      
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e8e4dc;border-radius:8px;overflow:hidden;background:#fff;">
        <tr>
          <td width="50%" valign="top" style="padding:20px;border-right:1px solid #e8e4dc;">
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#bbb;">&#10007; Prompt generico</p>
            <p style="margin:0;font-family:'Georgia',serif;font-size:13px;color:#999;font-style:italic;line-height:1.5;">"Scrivi un'email di follow-up al cliente"</p>
          </td>
          <td width="50%" valign="top" style="padding:20px;background:#fff8f7;">
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#d94f3d;">&#10003; Dalla Prompt Library</p>
            <p style="margin:0;font-family:'Georgia',serif;font-size:13px;color:#1a1a1a;font-style:italic;line-height:1.55;">"Sei un sales coach esperto in B2B enterprise. Scrivi un'email di follow-up per un prospect che ha visto la demo ma non ha risposto da 5 giorni. Tono: diretto ma non aggressivo. Includi un hook di apertura, un riferimento specifico alla demo e una CTA chiara. Max 150 parole."</p>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="background:#1a1a1a;padding:10px 20px;">
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;color:#f5f3ef;">&#10003; Tasso di risposta stimato: +40%</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- STATS -->
  <tr>
    <td style="background:#fff;padding:32px 40px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e8e4dc;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="text-align:center;padding:20px 8px;border-right:1px solid #e8e4dc;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:28px;font-weight:700;color:#1a1a1a;">99</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Prompt professionali</p>
          </td>
          <td style="text-align:center;padding:20px 8px;border-right:1px solid #e8e4dc;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:28px;font-weight:700;color:#1a1a1a;">6</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Categorie tematiche</p>
          </td>
          <td style="text-align:center;padding:20px 8px;border-right:1px solid #e8e4dc;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:28px;font-weight:700;color:#1a1a1a;">&infin;</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Accesso permanente</p>
          </td>
          <td style="text-align:center;padding:20px 8px;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:28px;font-weight:700;color:#d94f3d;">&euro;39</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Una tantum</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#1a1a1a;padding:40px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center">
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#888;letter-spacing:1px;text-transform:uppercase;">Smetti di sperimentare. Inizia a produrre.</p>
            <h2 style="margin:0 0 24px;font-family:'Georgia',serif;font-size:28px;font-weight:700;color:#f5f3ef;line-height:1.2;">99 prompt. &euro;39. Accesso permanente.</h2>
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:16px;">
              <tr>
                <td style="background:#d94f3d;border-radius:6px;">
                  <a href="${campaign.ctaUrl}" class="cta-btn" style="display:inline-block;background:#d94f3d;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:700;padding:18px 40px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;">${campaign.ctaText}</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#666;">${campaign.ctaSubtext}</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#555;">&#128274; Garanzia soddisfatti o rimborsati 30 giorni</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FAQ -->
  <tr>
    <td style="background:#f5f3ef;padding:32px 40px;">
      <p style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d94f3d;">DOMANDE FREQUENTI</p>
      
      <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:15px;font-weight:700;color:#1a1a1a;">È un abbonamento?</p>
      <p style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;border-bottom:1px solid #e8e4dc;padding-bottom:16px;">No. Paghi &euro;39 una sola volta e ottieni accesso permanente alla libreria online e al PDF scaricabile. Nessun rinnovo, nessuna sorpresa.</p>
      
      <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:15px;font-weight:700;color:#1a1a1a;">Funziona con ChatGPT, Claude e Gemini?</p>
      <p style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;border-bottom:1px solid #e8e4dc;padding-bottom:16px;">S&igrave;. Tutti i prompt sono compatibili con i principali modelli LLM: ChatGPT (GPT-4o), Claude 3.5, Gemini 1.5 Pro, Perplexity. Puoi usarli subito senza modifiche.</p>
      
      <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:15px;font-weight:700;color:#1a1a1a;">E se non sono soddisfatto?</p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;">Garanzia soddisfatti o rimborsati 30 giorni. Basta una email a <a href="mailto:info@proofpress.ai" style="color:#d94f3d;">info@proofpress.ai</a>.</p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#1a1a1a;padding:28px 32px;border-radius:0 0 12px 12px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:18px;font-weight:700;color:#f5f3ef;">Proof Press</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#666;letter-spacing:1px;text-transform:uppercase;">by Ideasmart &middot; AI-Verified Intelligence</p>
          </td>
          <td align="right" valign="middle">
            <a href="https://proofpress.ai" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#888;">proofpress.ai</a>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:16px;border-top:1px solid #333;">
            <p style="margin:8px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#555;line-height:1.6;">
              Stai ricevendo questa email perch&eacute; sei iscritto alla newsletter di Proof Press by Ideasmart.<br>
              <a href="https://proofpress.ai/unsubscribe" style="color:#888;">Annulla iscrizione</a> &middot; 
              <a href="https://proofpress.ai/privacy" style="color:#888;">Privacy Policy</a>
            </p>
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

// ─── Invio via SendGrid API v3 ────────────────────────────────────────────────
const body = {
  personalizations: [{ to: [{ email: "ac@acinelli.com" }] }],
  from: {
    email: SENDGRID_FROM_EMAIL,
    name: SENDGRID_FROM_NAME,
  },
  reply_to: { email: "noreply@proofpress.ai" },
  subject: `[PREVIEW PROMO] ${campaign.subject}`,
  content: [{ type: "text/html", value: html }],
};

try {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 202) {
    console.log(`✅ Preview newsletter promo inviata a ac@acinelli.com`);
    console.log(`   Oggetto: [PREVIEW PROMO] ${campaign.subject}`);
    console.log(`   From: ${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`);
  } else {
    const errorText = await response.text();
    console.error(`❌ SendGrid error ${response.status}:`, errorText);
    process.exit(1);
  }
} catch (err) {
  console.error("❌ Errore di rete:", err.message);
  process.exit(1);
}
