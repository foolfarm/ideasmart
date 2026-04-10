/**
 * promoNewsletter.ts — Newsletter "Proof Press Promo" 
 * ─────────────────────────────────────────────────────────────────────────────
 * Newsletter promozionale inviata il martedì e giovedì.
 * Ogni settimana promuove un prodotto/servizio specifico.
 * 
 * Prima campagna (questa settimana): ideasmart.forum — Prompt Library €39
 * 
 * Struttura:
 *   A. Header (logo Proof Press + "Edizione Speciale")
 *   B. Hero promozionale (headline + immagine prodotto)
 *   C. Corpo: value proposition + 3 benefit chiave
 *   D. Sezione "Cosa include" (lista feature)
 *   E. Testimonianze / social proof
 *   F. CTA principale (bottone acquisto)
 *   G. FAQ rapida (2-3 domande)
 *   H. Footer Proof Press
 */

import { sendEmail } from "./email";
import { getActiveSubscribers } from "./db";
import { notifyOwner } from "./_core/notification";

// ─── Config ─────────────────────────────────────────────────────────────────
const BASE_URL = "https://proofpress.ai";
const TEST_EMAILS = ["ac@acinelli.com"];

// ─── Campagna corrente ───────────────────────────────────────────────────────
export interface PromoCampaign {
  subject: string;
  preheader: string;
  badgeLabel: string;       // es. "EDIZIONE SPECIALE"
  headline: string;         // titolo principale H1
  subheadline: string;      // sottotitolo
  heroImageUrl: string;     // immagine hero 640x320
  heroImageAlt: string;
  intro: string;            // paragrafo introduttivo
  benefits: Array<{
    icon: string;           // emoji
    title: string;
    description: string;
  }>;
  features: Array<{
    label: string;
    value: string;
  }>;
  ctaUrl: string;
  ctaText: string;
  ctaSubtext: string;       // es. "Acquisto singolo · Nessun abbonamento"
  price: string;            // es. "€39"
  faq: Array<{
    question: string;
    answer: string;
  }>;
  footerNote: string;       // nota finale
}

// ─── Campagna attiva: ideasmart.forum Prompt Library ────────────────────────
export const CURRENT_CAMPAIGN: PromoCampaign = {
  subject: "Stai usando l'AI come si deve? Questi 99 prompt cambiano tutto.",
  preheader: "Manager, freelance, marketer, founder: i prompt che usano i professionisti veri. €39 una volta sola.",
  badgeLabel: "OFFERTA LIMITATA",
  headline: "L'AI che usi ogni giorno potrebbe fare 10 volte di più.",
  subheadline: "99 prompt selezionati da professionisti reali — non da tutorial YouTube. Organizzati, ricercabili, pronti all'uso.",
  heroImageUrl: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=640&h=320&fit=crop",
  heroImageAlt: "Prompt Library — Proof Press",
  intro: "La maggior parte delle persone usa ChatGPT come un motore di ricerca glorificato. Scrive \"dimmi come fare X\", ottiene una risposta generica, rimane delusa. Il problema non è l'AI — è il prompt. Con i prompt giusti, lo stesso strumento diventa un consulente strategico, un copywriter senior, un analista finanziario. La Prompt Library di Proof Press raccoglie i 99 prompt che fanno davvero la differenza: testati, classificati, con istruzioni d'uso.",
  benefits: [
    {
      icon: "👔",
      title: "Per manager e dirigenti",
      description: "\"Analizza questo report trimestrale e identificami i 3 rischi principali con piano d'azione concreto\" — trasforma 2 ore di analisi in 10 minuti di lavoro ad alto valore."
    },
    {
      icon: "🚀",
      title: "Per founder e imprenditori",
      description: "\"Sei un esperto di go-to-market B2B SaaS. Costruisci una strategia di lancio per [prodotto] con budget €5.000\" — output concreto e strutturato, non teoria generica."
    },
    {
      icon: "✍️",
      title: "Per marketer e content creator",
      description: "\"Scrivi 5 subject line email per [prodotto] usando la formula AIDA, tono professionale ma diretto, max 50 caratteri\" — risultati in 30 secondi invece di 30 minuti."
    },
    {
      icon: "💼",
      title: "Per consulenti e freelance",
      description: "\"Sei un consulente senior. Analizza questo brief del cliente e identificami le domande che non ha fatto ma che determinano il successo del progetto\" — il prompt che impressiona i clienti."
    },
    {
      icon: "📚",
      title: "Metodo + fonti ufficiali",
      description: "La collezione integra pratiche ufficiali di OpenAI, Anthropic, Claude Code e Perplexity. Non opinioni, ma standard testati da chi usa l'AI ogni giorno."
    },
    {
      icon: "💾",
      title: "Libreria online + PDF scaricabile",
      description: "Accedi alla libreria ricercabile da qualsiasi device e scarica il PDF completo per averlo sempre con te, anche offline."
    }
  ],
  features: [
    { label: "Prompt in archivio", value: "99" },
    { label: "Macro-sezioni tematiche", value: "5" },
    { label: "Fonti metodologiche", value: "4" },
    { label: "Formato", value: "Libreria + PDF" },
    { label: "Accesso", value: "Permanente" },
    { label: "Prezzo", value: "€39 una tantum" }
  ],
  ctaUrl: "https://ideasmart.forum/",
  ctaText: "🔓 Accedi subito per €39 →",
  ctaSubtext: "Pagamento unico · Nessun abbonamento · Accesso permanente · PDF incluso",
  price: "€39",
  faq: [
    {
      question: "È un abbonamento?",
      answer: "No. Paghi €39 una sola volta e ottieni accesso permanente alla libreria online e al PDF scaricabile. Nessun rinnovo, nessuna sorpresa."
    },
    {
      question: "Cosa ricevo esattamente?",
      answer: "Accesso immediato all'area membri con 99 prompt ricercabili per categoria, filtrabili per uso professionale, più il PDF completo da scaricare e conservare."
    },
    {
      question: "Funziona con ChatGPT, Claude e Gemini?",
      answer: "Sì. Tutti i prompt sono compatibili con i principali modelli LLM: ChatGPT (GPT-4o), Claude 3.5, Gemini 1.5 Pro, Perplexity. Puoi usarli subito senza modifiche."
    },
    {
      question: "E se non mi serve?",
      answer: "Se usi l'AI nel lavoro almeno una volta a settimana, ti serve. Se non sei soddisfatto entro 7 giorni, ti rimborsiamo."
    }
  ],
  footerNote: "Stai ricevendo questa email perché sei iscritto alla newsletter di ProofPress."
};

// ─── Template HTML ───────────────────────────────────────────────────────────
function buildPromoNewsletterHtml(campaign: PromoCampaign, dateLabel: string): string {
  const benefits = campaign.benefits.map(b => `
    <tr>
      <td style="padding:0 0 20px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="48" valign="top" style="padding-right:16px;">
              <div style="width:44px;height:44px;background:#1a1a1a;border-radius:8px;text-align:center;line-height:44px;font-size:22px;">${b.icon}</div>
            </td>
            <td valign="top">
              <p style="margin:0 0 4px 0;font-family:'Georgia',serif;font-size:16px;font-weight:700;color:#1a1a1a;line-height:1.3;">${b.title}</p>
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;">${b.description}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const featuresHtml = campaign.features.map(f => `
    <td style="text-align:center;padding:16px 8px;border-right:1px solid #e8e4dc;">
      <p style="margin:0 0 4px 0;font-family:'Georgia',serif;font-size:20px;font-weight:700;color:#1a1a1a;">${f.value}</p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">${f.label}</p>
    </td>
  `).join('');

  const faqHtml = campaign.faq.map(f => `
    <tr>
      <td style="padding:0 0 16px 0;border-bottom:1px solid #e8e4dc;">
        <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-size:15px;font-weight:700;color:#1a1a1a;">${f.question}</p>
        <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;line-height:1.6;">${f.answer}</p>
      </td>
    </tr>
    <tr><td style="height:16px;"></td></tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${campaign.subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin:0; padding:0; background:#f0ece4; font-family:'Helvetica Neue',Arial,sans-serif; }
    a { color:#d94f3d; text-decoration:none; }
    @media only screen and (max-width:640px) {
      .container { width:100% !important; }
      .hero-img { height:200px !important; }
      .stats-table td { display:block !important; width:100% !important; border-right:none !important; border-bottom:1px solid #e8e4dc !important; }
      .cta-btn { font-size:16px !important; padding:16px 24px !important; }
    }
  </style>
</head>
<body>
<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${campaign.preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

<table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f0ece4">
<tr><td align="center" style="padding:24px 16px 0;">

<!-- ═══ CONTAINER ═══════════════════════════════════════════════════════════ -->
<table class="container" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;">

  <!-- ── A. HEADER ──────────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#1a1a1a;padding:28px 32px;border-radius:12px 12px 0 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin:0;font-family:'Georgia',serif;font-size:26px;font-weight:700;color:#f5f3ef;letter-spacing:-0.5px;">ProofPress</p>
            <p style="margin:2px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;">La prima piattaforma di giornalismo agentico certificato per innovatori, creator, aziende ed editori</p>
          </td>
          <td align="right" valign="middle">
            <span style="background:#d94f3d;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:4px;">${campaign.badgeLabel}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:12px;border-top:1px solid #333;margin-top:12px;">
            <p style="margin:8px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#666;letter-spacing:0.5px;">${dateLabel} · Edizione Speciale</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── B. HERO ─────────────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#fff;padding:0;">
      <a href="${campaign.ctaUrl}" style="display:block;">
        <img src="${campaign.heroImageUrl}" alt="${campaign.heroImageAlt}" width="640" class="hero-img"
          style="display:block;width:100%;height:280px;object-fit:cover;border:none;">
      </a>
    </td>
  </tr>

  <!-- ── C. HEADLINE ────────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#fff;padding:36px 40px 28px;">
      <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#d94f3d;font-weight:700;letter-spacing:2px;text-transform:uppercase;">PROMPT LIBRARY · PROOF PRESS</p>
      <h1 style="margin:0 0 16px;font-family:'Georgia',serif;font-size:34px;font-weight:700;color:#1a1a1a;line-height:1.2;letter-spacing:-0.5px;">${campaign.headline}</h1>
      <p style="margin:0 0 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;color:#555;line-height:1.7;border-left:3px solid #d94f3d;padding-left:16px;">${campaign.subheadline}</p>
      <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#444;line-height:1.8;">${campaign.intro}</p>
    </td>
  </tr>

  <!-- ── Divider ─────────────────────────────────────────────────────────── -->
  <tr><td style="background:#fff;padding:0 40px;"><div style="height:1px;background:#e8e4dc;"></div></td></tr>

  <!-- ── D. STATISTICHE ─────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#fff;padding:28px 40px;">
      <table class="stats-table" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e8e4dc;border-radius:8px;overflow:hidden;">
        <tr>
          ${featuresHtml}
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── E. BENEFIT ─────────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#f5f3ef;padding:32px 40px;">
      <p style="margin:0 0 24px;font-family:'Georgia',serif;font-size:20px;font-weight:700;color:#1a1a1a;">Perché questa collezione è diversa</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${benefits}
      </table>
    </td>
  </tr>

  <!-- ── F. CTA PRINCIPALE ──────────────────────────────────────────────── -->
  <tr>
    <td style="background:#1a1a1a;padding:40px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center">
            <p style="margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;">DISPONIBILE ORA</p>
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:44px;font-weight:700;color:#f5f3ef;">${campaign.price}</p>
            <p style="margin:0 0 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#888;">Acquisto singolo · Accesso permanente · PDF incluso</p>
            <a href="${campaign.ctaUrl}" class="cta-btn"
              style="display:inline-block;background:#d94f3d;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:17px;font-weight:700;text-decoration:none;padding:18px 40px;border-radius:6px;letter-spacing:0.3px;">
              ${campaign.ctaText}
            </a>
            <p style="margin:16px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#666;">${campaign.ctaSubtext}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── G. FAQ ─────────────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#fff;padding:32px 40px;">
      <p style="margin:0 0 20px;font-family:'Georgia',serif;font-size:18px;font-weight:700;color:#1a1a1a;">Domande frequenti</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${faqHtml}
      </table>
    </td>
  </tr>

  <!-- ── CTA SECONDARIA ─────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#f5f3ef;padding:28px 40px;text-align:center;">
      <p style="margin:0 0 16px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#555;">Hai domande? Rispondi a questa email o visita la pagina del prodotto.</p>
      <a href="${campaign.ctaUrl}"
        style="display:inline-block;background:transparent;color:#1a1a1a;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border:2px solid #1a1a1a;border-radius:6px;">
        Vai alla Prompt Library →
      </a>
    </td>
  </tr>

  <!-- ── H. FOOTER ──────────────────────────────────────────────────────── -->
  <tr>
    <td style="background:#1a1a1a;padding:28px 40px;border-radius:0 0 12px 12px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:16px;font-weight:700;color:#f5f3ef;">ProofPress</p>
            <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#666;">La prima piattaforma di giornalismo agentico certificato per innovatori, creator, aziende ed editori · La prima redazione giornalistica agentica con informazione Certificata</p>
          </td>
          <td align="right" valign="middle">
            <a href="${BASE_URL}" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#888;text-decoration:none;">proofpress.ai</a>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:16px;border-top:1px solid #333;margin-top:16px;">
            <p style="margin:8px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#555;line-height:1.6;">
              ${campaign.footerNote}<br>
              <a href="${BASE_URL}/unsubscribe" style="color:#666;text-decoration:underline;">Cancella iscrizione</a> · 
              <a href="${BASE_URL}/privacy" style="color:#666;text-decoration:underline;">Privacy Policy</a> · 
              © ${new Date().getFullYear()} FoolFarm S.r.l. — Via Tortona 37, Milano
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
<!-- ═══ END CONTAINER ═══════════════════════════════════════════════════════ -->

</td></tr>
</table>
</body>
</html>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPromoDateLabel(): string {
  const now = new Date();
  const days = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const months = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// ─── Funzioni di invio ────────────────────────────────────────────────────────

/**
 * Invia la preview della newsletter promozionale all'owner per approvazione.
 */
export async function sendPromoPreview(campaign: PromoCampaign = CURRENT_CAMPAIGN): Promise<{
  success: boolean;
  subject?: string;
  error?: string;
}> {
  try {
    const dateLabel = getPromoDateLabel();
    const html = buildPromoNewsletterHtml(campaign, dateLabel);
    const subject = `[PREVIEW PROMO] ${campaign.subject}`;

    for (const email of TEST_EMAILS) {
      await sendEmail({
        to: email,
        subject,
        html,
      });
    }

    console.log(`[PromoNewsletter] ✅ Preview inviata a ${TEST_EMAILS.join(', ')}: ${subject}`);
    return { success: true, subject };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[PromoNewsletter] ❌ Errore preview:", error);
    return { success: false, error };
  }
}

/**
 * Invia la newsletter promozionale a tutti gli iscritti attivi.
 */
export async function sendPromoNewsletterToAll(campaign: PromoCampaign = CURRENT_CAMPAIGN): Promise<{
  success: boolean;
  recipientCount?: number;
  subject?: string;
  error?: string;
}> {
  try {
    const dateLabel = getPromoDateLabel();
    const html = buildPromoNewsletterHtml(campaign, dateLabel);
    const subject = campaign.subject;

    const subscribers = await getActiveSubscribers();
    if (!subscribers || subscribers.length === 0) {
      return { success: false, error: "Nessun iscritto attivo trovato" };
    }

    let sent = 0;
    const BATCH_SIZE = 50;
    const DELAY_MS = 1000;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(sub =>
          sendEmail({
            to: sub.email,
            subject,
            html,
          }).catch(err => {
            console.error(`[PromoNewsletter] ❌ Errore invio a ${sub.email}:`, err);
          })
        )
      );
      sent += batch.length;
      console.log(`[PromoNewsletter] 📧 Inviati ${sent}/${subscribers.length}...`);
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    await notifyOwner({
      title: `📧 Newsletter Promo inviata: ${subject}`,
      content: `Newsletter promozionale inviata a ${sent} iscritti.\nCampagna: ${campaign.badgeLabel}\nData: ${dateLabel}`,
    }).catch(() => {});

    console.log(`[PromoNewsletter] ✅ Newsletter promo inviata a ${sent} iscritti`);
    return { success: true, recipientCount: sent, subject };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[PromoNewsletter] ❌ Errore invio massivo:", error);
    return { success: false, error };
  }
}
