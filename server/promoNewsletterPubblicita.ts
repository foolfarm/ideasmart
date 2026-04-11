/**
 * Newsletter Promozionale C) Pubblicità su ProofPress
 * Invio: lunedì, mercoledì, venerdì alle 18:00 CET
 * Target: tutta la mailing list
 * Obiettivo: promuovere gli spazi pubblicitari su proofpress.ai e nella newsletter
 * Design: Apple-style — SF Francisco, sfondo bianco/grigio chiaro, layout ampio
 */

import { getDb, getActiveSubscribers } from "./db";
import { sendEmail } from "./email";

// ─── Guard anti-duplicati DB-based ─────────────────────────────────────────
async function hasAlreadySentPubblicitaTodayDB(): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { newsletterSends } = await import("../drizzle/schema");
  const { and, gte, lte, like, eq } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) return false;

  const existing = await db
    .select()
    .from(newsletterSends)
    .where(
      and(
        like(newsletterSends.subject, `%Pubblicità%ProofPress%`),
        eq(newsletterSends.status, "sent"),
        gte(newsletterSends.createdAt, todayStart),
        lte(newsletterSends.createdAt, todayEnd)
      )
    )
    .limit(1);

  return existing.length > 0 && (existing[0].recipientCount ?? 0) > 0;
}

// ─── Varianti di oggetto per rotazione ─────────────────────────────────────
const SUBJECT_VARIANTS = [
  "Pubblicità su ProofPress — Raggiungi 6.000+ decision maker dell'AI e del business.",
  "Pubblicità su ProofPress — 45% open rate. Il tuo brand davanti ai decision maker giusti.",
  "Pubblicità su ProofPress — 100.000 visite/mese. Hai il tuo spazio qui?",
];

function getSubjectVariant(): string {
  const day = new Date().getDay();
  if (day === 1) return SUBJECT_VARIANTS[0];
  if (day === 3) return SUBJECT_VARIANTS[1];
  return SUBJECT_VARIANTS[2];
}

// ─── Template HTML — Apple Style ──────────────────────────────────────────
export function buildPubblicitaHtml(): string {
  const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`;
  const BG = `#f5f5f7`;
  const CARD_BG = `#ffffff`;
  const TEXT_PRIMARY = `#1d1d1f`;
  const TEXT_SECONDARY = `#6e6e73`;
  const TEXT_TERTIARY = `#86868b`;
  const ACCENT = `#0071e3`;
  const BORDER = `#d2d2d7`;
  const LIGHT_BG = `#f5f5f7`;

  // ── Testimonial da advertiser ────────────────────────────────────────────
  const TESTIMONIALS = [
    {
      quote: "Abbiamo lanciato la campagna di lunedì. Mercoledì avevamo già 3 richieste di demo qualificate. Il pubblico di ProofPress è esattamente il nostro target.",
      author: "Marketing Director, software house B2B",
      detail: "Campagna newsletter · Top placement · Settembre 2025",
    },
    {
      quote: "L'open rate del 45% non è un numero — è una promessa. Ogni euro investito qui raggiunge qualcuno che sta davvero leggendo, non scrollando.",
      author: "CMO, startup fintech",
      detail: "Campagna banner sito + newsletter · Ottobre 2025",
    },
    {
      quote: "Il native content che ha scritto il team ProofPress era così ben integrato che i lettori lo hanno condiviso come un articolo editoriale. CTR del 8.4%.",
      author: "Head of Growth, SaaS HR",
      detail: "Articolo sponsorizzato · Novembre 2025",
    },
  ];

  // ── Profili del pubblico ─────────────────────────────────────────────────
  const AUDIENCE = [
    { title: "C-Level & Manager", desc: "CEO, CTO, CMO e direttori che adottano l'AI nei processi aziendali. Prendono decisioni di acquisto.", pct: "38%" },
    { title: "Founder & Startupper", desc: "Imprenditori che costruiscono prodotti e servizi basati sull'intelligenza artificiale.", pct: "29%" },
    { title: "Investitori & VC", desc: "Business angel, venture capitalist e family office alla ricerca di opportunità nell'ecosistema AI.", pct: "18%" },
    { title: "Professionisti", desc: "Consulenti, avvocati, commercialisti che si aggiornano sull'impatto dell'AI nel loro settore.", pct: "15%" },
  ];

  const testimonialCards = TESTIMONIALS.map(t => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
          <div style="font-family:${FONT};font-size:15px;color:${TEXT_PRIMARY};line-height:1.65;margin-bottom:16px;">"${t.quote}"</div>
          <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};">${t.author}</div>
          <div style="font-family:${FONT};font-size:12px;color:${TEXT_TERTIARY};margin-top:2px;">${t.detail}</div>
        </div>
      </td>
    </tr>
  `).join("");

  const audienceCards = AUDIENCE.map(a => `
    <tr>
      <td style="padding:0 0 12px 0;">
        <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:top;">
                <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">${a.title}</div>
                <div style="font-family:${FONT};font-size:13px;color:${TEXT_SECONDARY};line-height:1.5;">${a.desc}</div>
              </td>
              <td align="right" style="vertical-align:top;padding-left:16px;white-space:nowrap;">
                <div style="font-family:${FONT};font-size:20px;font-weight:700;color:${ACCENT};">${a.pct}</div>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pubblicità su ProofPress — Raggiungi i decision maker</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:${CARD_BG};padding:24px 32px;border-radius:16px 16px 0 0;border-bottom:1px solid ${BORDER};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:${FONT};font-size:20px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">ProofPress</div>
            <div style="font-family:${FONT};font-size:11px;color:${TEXT_TERTIARY};margin-top:2px;letter-spacing:0.3px;">Media Kit & Pubblicità</div>
          </td>
          <td align="right">
            <div style="display:inline-block;background:${ACCENT}1a;color:${ACCENT};font-family:${FONT};font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">Opportunità ADV</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:${CARD_BG};padding:48px 32px 40px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Pubblicità su ProofPress</div>
      <h1 style="margin:0 0 16px;font-family:${FONT};font-size:36px;font-weight:700;color:${TEXT_PRIMARY};line-height:1.15;letter-spacing:-0.5px;">Raggiungi i decision maker<br>dell'AI e del business.</h1>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:17px;color:${TEXT_SECONDARY};line-height:1.55;">ProofPress è il media di riferimento per imprenditori, manager e investitori che vogliono capire come l'intelligenza artificiale sta ridisegnando il business.</p>
      <p style="margin:0 0 32px;font-family:${FONT};font-size:15px;color:${TEXT_SECONDARY};line-height:1.7;">Il tuo brand davanti al pubblico giusto, nel momento giusto. Non su un feed che scorre — in una newsletter che viene letta.</p>
      <a href="https://proofpress.ai/pubblicita?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;padding:13px 24px;border-radius:980px;text-decoration:none;">Richiedi il media kit →</a>
    </td>
  </tr>

  <!-- NUMERI -->
  <tr>
    <td style="background:${LIGHT_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:24px;">I numeri di ProofPress</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:0 6px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:26px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.5px;">100K+</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};margin-top:4px;">Visite mensili</div>
            </div>
          </td>
          <td align="center" style="padding:0 6px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:26px;font-weight:700;color:${ACCENT};letter-spacing:-0.5px;">6.000+</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};margin-top:4px;">Iscritti newsletter</div>
            </div>
          </td>
          <td align="center" style="padding:0 6px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:26px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.5px;">45%</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};margin-top:4px;">Open rate medio</div>
            </div>
          </td>
          <td align="center" style="padding:0 6px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:26px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.5px;">8 min</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};margin-top:4px;">Tempo medio lettura</div>
            </div>
          </td>
        </tr>
      </table>
      <div style="margin-top:16px;text-align:center;">
        <div style="font-family:${FONT};font-size:12px;color:${TEXT_TERTIARY};">Open rate 2× la media di settore · Pubblico qualificato e attivo</div>
      </div>
    </td>
  </tr>

  <!-- CHI LEGGE -->
  <tr>
    <td style="background:${CARD_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Il pubblico</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Chi legge ProofPress ogni giorno.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${audienceCards}
      </table>
    </td>
  </tr>

  <!-- FORMATI -->
  <tr>
    <td style="background:${LIGHT_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Formati disponibili</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Scegli il formato giusto per il tuo obiettivo.</h2>

      <!-- Newsletter -->
      <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;margin-bottom:16px;">
        <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${ACCENT};letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;">Newsletter · 6.000+ iscritti · lun/mer/ven</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="vertical-align:top;padding-right:8px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Top placement</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Logo + headline + testo (max 80 parole) + CTA nella parte alta. Massima visibilità.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding:0 8px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Mid placement</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Blocco testuale con logo nella parte centrale. Ideale per brand awareness.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding-left:8px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Native content</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Articolo sponsorizzato scritto dal team ProofPress con il tuo brief.</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Sito -->
      <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
        <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${ACCENT};letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;">Sito web · proofpress.ai · 100.000+ visite/mese</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="vertical-align:top;padding-right:8px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Banner header</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Due posizioni nell'header, visibili su ogni pagina. Alta frequenza di esposizione.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding:0 8px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Banner sidebar</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Posizione fissa nella sidebar, sempre visibile durante la navigazione.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding-left:8px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Articolo sponsorizzato</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Contenuto editoriale con il tuo brand, indicizzato su Google.</div>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>

  <!-- TESTIMONIAL -->
  <tr>
    <td style="background:${CARD_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Chi ha già investito</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Risultati reali dai nostri advertiser.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${testimonialCards}
      </table>
    </td>
  </tr>

  <!-- CTA FINALE -->
  <tr>
    <td style="background:${TEXT_PRIMARY};padding:48px 32px;border-radius:0 0 16px 16px;text-align:center;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Inizia oggi</div>
      <h2 style="margin:0 0 12px;font-family:${FONT};font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Pronto a raggiungere il tuo pubblico?</h2>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:15px;color:rgba(255,255,255,0.6);line-height:1.6;">Scrivici per ricevere il media kit completo con tariffe, disponibilità e case study. Risponderemo entro 24 ore lavorative.</p>
      <a href="https://proofpress.ai/pubblicita?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="display:inline-block;background:#ffffff;color:${TEXT_PRIMARY};font-family:${FONT};font-size:15px;font-weight:600;padding:14px 28px;border-radius:980px;text-decoration:none;margin-bottom:16px;">Richiedi il media kit →</a>
      <div style="margin-top:8px;">
        <a href="mailto:info@proofpress.ai?subject=Richiesta%20media%20kit%20ProofPress" style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.5);text-decoration:none;">Scrivi a info@proofpress.ai</a>
      </div>
    </td>
  </tr>

  <!-- SPACER -->
  <tr><td style="height:24px;"></td></tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:0 8px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:${FONT};font-size:12px;color:${TEXT_TERTIARY};">
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:${TEXT_TERTIARY};text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:${TEXT_TERTIARY};text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:${TEXT_TERTIARY};text-decoration:none;">Startup</a>
            </div>
          </td>
          <td align="right">
            <div style="font-family:${FONT};font-size:11px;color:${TEXT_TERTIARY};">
              Hai ricevuto questa email perché sei iscritto a ProofPress.<br>
              <a href="https://proofpress.ai/unsubscribe?email={{email}}" style="color:${TEXT_TERTIARY};">Disiscriviti</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr><td style="height:32px;"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Funzione di invio ─────────────────────────────────────────────────────
export async function sendPubblicitaNewsletterToAll(): Promise<void> {
  const alreadySent = await hasAlreadySentPubblicitaTodayDB();
  if (alreadySent) {
    console.log("[PubblicitaNewsletter] Guard: già inviata oggi. Skip.");
    try {
      await sendEmail({
        to: "ac@acinelli.com",
        subject: `[ProofPress] ⚠️ Newsletter Pubblicità bloccata — già inviata oggi`,
        html: `<p>Il guard anti-duplicati ha bloccato un secondo invio della newsletter Pubblicità in data ${new Date().toLocaleDateString("it-IT")}.</p>`,
      });
    } catch (e) {
      console.error("[PubblicitaNewsletter] Errore invio alert email:", e);
    }
    return;
  }

  const subject = getSubjectVariant();
  const html = buildPubblicitaHtml();

  const subscribers = await getActiveSubscribers();
  if (!subscribers || subscribers.length === 0) {
    console.log("[PubblicitaNewsletter] Nessun iscritto attivo trovato. Skip.");
    return;
  }

  console.log(`[PubblicitaNewsletter] Invio a ${subscribers.length} iscritti...`);

  const { newsletterSends } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) { console.error("[PubblicitaNewsletter] DB non disponibile"); return; }

  const [sendRecord] = await db.insert(newsletterSends).values({
    subject,
    htmlContent: html,
    status: "sending",
    recipientCount: 0,
    openedCount: 0,
    createdAt: new Date(),
  }).$returningId();

  const sendId = sendRecord?.id;
  let sent = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(sub =>
        sendEmail({
          to: sub.email,
          subject,
          html: html.replace("{{email}}", encodeURIComponent(sub.email)),
        })
      )
    );
    sent += batch.length;
    console.log(`[PubblicitaNewsletter] Inviati ${sent}/${subscribers.length}...`);
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  if (sendId) {
    const { eq } = await import("drizzle-orm");
    const db2 = await getDb();
    if (db2) {
      await db2.update(newsletterSends)
        .set({ status: "sent", recipientCount: sent })
        .where(eq(newsletterSends.id, sendId));
    }
  }

  console.log(`[PubblicitaNewsletter] ✅ Completato. Inviati ${sent} messaggi.`);
}
