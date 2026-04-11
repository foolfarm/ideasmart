/**
 * Newsletter Promozionale C) Pubblicità su ProofPress
 * Invio: lunedì, mercoledì, venerdì alle 18:00 CET
 * Target: tutta la mailing list
 * Obiettivo: promuovere gli spazi pubblicitari su proofpress.ai e nella newsletter
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
  if (day === 1) return SUBJECT_VARIANTS[0]; // lunedì
  if (day === 3) return SUBJECT_VARIANTS[1]; // mercoledì
  return SUBJECT_VARIANTS[2];               // venerdì
}

// ─── Template HTML ─────────────────────────────────────────────────────────
export function buildPubblicitaHtml(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pubblicità su ProofPress — Raggiungi i decision maker</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Georgia',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;">
<tr><td align="center" style="padding:24px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:#000;padding:28px 36px;border-radius:4px 4px 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:'Georgia',serif;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">ProofPress</div>
            <div style="font-size:10px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-top:2px;">MEDIA KIT & PUBBLICITÀ</div>
          </td>
          <td align="right">
            <div style="font-size:10px;color:#ff5500;letter-spacing:2px;text-transform:uppercase;font-weight:700;">ADV</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:#fff;padding:40px 36px 32px;">
      <div style="display:inline-block;background:#ff5500;color:#fff;font-size:10px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:2px;text-transform:uppercase;margin-bottom:20px;">OPPORTUNITÀ PUBBLICITARIA</div>
      <h1 style="margin:0 0 16px;font-family:'Georgia',serif;font-size:30px;font-weight:700;color:#0a0f1e;line-height:1.2;">Raggiungi i decision maker<br>dell'AI e del business.</h1>
      <p style="margin:0;font-size:15px;color:#555;line-height:1.7;">ProofPress è il media di riferimento per imprenditori, manager e investitori che vogliono capire come l'intelligenza artificiale sta ridisegnando il business. Il tuo brand davanti al pubblico giusto, nel momento giusto.</p>
    </td>
  </tr>

  <!-- NUMERI -->
  <tr>
    <td style="background:#0a0f1e;padding:32px 36px;">
      <div style="font-size:11px;color:#ff5500;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;font-weight:700;">I NOSTRI NUMERI</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:0 6px 16px;">
            <div style="font-size:32px;font-weight:700;color:#fff;font-family:'Georgia',serif;">100.000+</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Visite mensili</div>
          </td>
          <td align="center" style="padding:0 6px 16px;">
            <div style="font-size:32px;font-weight:700;color:#00e5c8;font-family:'Georgia',serif;">6.000+</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Iscritti newsletter</div>
          </td>
          <td align="center" style="padding:0 6px 16px;">
            <div style="font-size:32px;font-weight:700;color:#ff5500;font-family:'Georgia',serif;">45%</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Open rate medio</div>
          </td>
          <td align="center" style="padding:0 6px 16px;">
            <div style="font-size:32px;font-weight:700;color:#fff;font-family:'Georgia',serif;">8 min</div>
            <div style="font-size:11px;color:#888;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">Tempo medio lettura</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:8px;font-size:12px;color:#555;text-align:center;">Open rate 2× la media di settore · Pubblico qualificato e attivo</div>
    </td>
  </tr>

  <!-- CHI LEGGE -->
  <tr>
    <td style="background:#fff;padding:32px 36px;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#0a0f1e;letter-spacing:2px;text-transform:uppercase;border-bottom:2px solid #ff5500;padding-bottom:8px;display:inline-block;">Chi legge ProofPress</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="vertical-align:top;padding-right:12px;">
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;margin-bottom:12px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">C-LEVEL & MANAGER</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">CEO, CTO, CMO e direttori che adottano l'AI nei processi aziendali. Prendono decisioni di acquisto.</div>
            </div>
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">FOUNDER & STARTUPPER</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">Imprenditori che costruiscono prodotti e servizi basati sull'intelligenza artificiale.</div>
            </div>
          </td>
          <td width="4%"></td>
          <td width="48%" style="vertical-align:top;padding-left:12px;">
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;margin-bottom:12px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">INVESTITORI & VC</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">Business angel, venture capitalist e family office alla ricerca di opportunità nell'ecosistema AI.</div>
            </div>
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">PROFESSIONISTI</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">Consulenti, avvocati, commercialisti che si aggiornano sull'impatto dell'AI nel loro settore.</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FORMATI -->
  <tr>
    <td style="background:#f5f0e8;padding:32px 36px;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#0a0f1e;letter-spacing:2px;text-transform:uppercase;">Formati disponibili</h2>

      <!-- Newsletter -->
      <div style="background:#fff;border-radius:4px;padding:20px;margin-bottom:12px;border-left:3px solid #00e5c8;">
        <div style="font-size:10px;color:#00e5c8;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">NEWSLETTER · 6.000+ iscritti · lun/mer/ven</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="vertical-align:top;padding-right:8px;">
              <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Top placement</div>
              <div style="font-size:12px;color:#666;line-height:1.5;">Logo + headline + testo (max 80 parole) + CTA nella parte alta. Massima visibilità.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding:0 8px;">
              <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Mid placement</div>
              <div style="font-size:12px;color:#666;line-height:1.5;">Blocco testuale con logo nella parte centrale. Ideale per brand awareness.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding-left:8px;">
              <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Native content</div>
              <div style="font-size:12px;color:#666;line-height:1.5;">Articolo sponsorizzato scritto dal team ProofPress con il tuo brief.</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Sito -->
      <div style="background:#fff;border-radius:4px;padding:20px;border-left:3px solid #ff5500;">
        <div style="font-size:10px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">SITO WEB · proofpress.ai · 100.000+ visite/mese</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="vertical-align:top;padding-right:8px;">
              <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Banner header</div>
              <div style="font-size:12px;color:#666;line-height:1.5;">Due posizioni nell'header, visibili su ogni pagina. Alta frequenza di esposizione.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding:0 8px;">
              <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Banner sidebar</div>
              <div style="font-size:12px;color:#666;line-height:1.5;">Posizione fissa nella sidebar, sempre visibile durante la navigazione.</div>
            </td>
            <td width="33%" style="vertical-align:top;padding-left:8px;">
              <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Articolo sponsorizzato</div>
              <div style="font-size:12px;color:#666;line-height:1.5;">Contenuto editoriale con il tuo brand, indicizzato su Google.</div>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#fff;padding:36px;text-align:center;">
      <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0a0f1e;font-family:'Georgia',serif;">Pronto a raggiungere il tuo pubblico?</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">Scrivici per ricevere il media kit completo con tariffe, disponibilità e case study.<br>Risponderemo entro 24 ore lavorative.</p>
      <a href="https://proofpress.ai/pubblicita?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="display:inline-block;background:#ff5500;color:#fff;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:3px;text-decoration:none;margin-bottom:12px;">Richiedi il media kit →</a>
      <br>
      <a href="mailto:info@proofpress.ai?subject=Richiesta%20media%20kit%20ProofPress&utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="display:inline-block;color:#0a0f1e;font-size:13px;text-decoration:underline;margin-top:8px;">Scrivi a info@proofpress.ai →</a>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#0a0f1e;padding:24px 36px;border-radius:0 0 4px 4px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:12px;color:#666;">
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:#888;text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:#888;text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:#888;text-decoration:none;">Startup</a>
            </div>
          </td>
          <td align="right">
            <div style="font-size:11px;color:#555;">
              Hai ricevuto questa email perché sei iscritto a ProofPress.<br>
              <a href="https://proofpress.ai/unsubscribe?email={{email}}" style="color:#555;">Disiscriviti</a>
            </div>
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
