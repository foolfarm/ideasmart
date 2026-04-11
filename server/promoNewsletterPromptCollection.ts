/**
 * Newsletter Promozionale B) Prompt Collection 2026
 * Invio: lunedì, mercoledì, giovedì alle 15:00 CET
 * Target: tutta la mailing list
 * Prodotto: "Prompt da usare davvero nel lavoro quotidiano" — 39€
 * Design: Apple-style — SF Francisco, sfondo bianco/grigio chiaro, layout ampio
 */

import { getDb, getActiveSubscribers } from "./db";
import { sendEmail } from "./email";

// ─── Guard anti-duplicati DB-based ─────────────────────────────────────────
async function hasAlreadySentPromptTodayDB(): Promise<boolean> {
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
        like(newsletterSends.subject, `%Prompt Collection%`),
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
  "Prompt Collection 2026 — I prompt che i professionisti usano davvero ogni giorno.",
  "Prompt Collection 2026 — Smetti di perdere tempo con prompt che non funzionano.",
  "Prompt Collection 2026 — 39€ per trasformare come usi l'AI nel lavoro.",
];

function getSubjectVariant(): string {
  const day = new Date().getDay();
  if (day === 1) return SUBJECT_VARIANTS[0];
  if (day === 3) return SUBJECT_VARIANTS[1];
  return SUBJECT_VARIANTS[2];
}

// ─── Esempi di prompt dalla collezione ─────────────────────────────────────
const PROMPT_EXAMPLES = [
  {
    category: "Strategia",
    title: "Analisi competitiva in 5 minuti",
    preview: `"Sei un consulente McKinsey. Analizza il posizionamento competitivo di [azienda] rispetto ai principali competitor nel mercato [settore]. Identifica i 3 vantaggi competitivi chiave, le 3 vulnerabilità principali e proponi 2 mosse strategiche immediate con timeline di esecuzione..."`,
    result: "Output: report strutturato in 3 sezioni, pronto da condividere con il board.",
  },
  {
    category: "Marketing",
    title: "Email di follow-up che converte",
    preview: `"Scrivi un'email di follow-up per un prospect che ha partecipato a una demo ma non ha risposto negli ultimi 7 giorni. Tono: professionale ma diretto. Obiettivo: ottenere un feedback o una risposta entro 48 ore. Evita frasi generiche come 'spero che tu stia bene'..."`,
    result: "Output: email di 120 parole con oggetto A/B testato e CTA chiara.",
  },
  {
    category: "Produttività",
    title: "Sintesi riunione con action items",
    preview: `"Sei un chief of staff esperto. Trasforma queste note di riunione [incolla note] in: 1) Sintesi esecutiva in 3 righe, 2) Decisioni prese, 3) Action items con responsabile e scadenza, 4) Punti aperti da risolvere. Formato: bullet points chiari..."`,
    result: "Output: documento strutturato in 4 sezioni, pronto da inviare al team.",
  },
  {
    category: "Contenuti",
    title: "Post LinkedIn che genera engagement",
    preview: `"Scrivi un post LinkedIn per un CEO che vuole condividere una lezione appresa da un fallimento recente. Struttura: hook provocatorio (1 riga), storia in 3-4 paragrafi brevi, lezione chiave, domanda finale per il commento. Tono: autentico, non corporate..."`,
    result: "Output: post da 250 parole con hook testato su 1.000+ post analizzati.",
  },
];

// ─── Testimonial ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Ho usato il prompt per l'analisi competitiva prima di un board meeting. Il CEO mi ha chiesto chi aveva preparato il report. L'aveva fatto l'AI in 4 minuti.",
    author: "F.M., Strategy Manager",
    detail: "Azienda manifatturiera · 200 dipendenti",
  },
  {
    quote: "Il prompt per le email di follow-up ha aumentato il mio tasso di risposta dal 12% al 34%. Non cambierei nulla.",
    author: "G.T., Account Executive",
    detail: "SaaS B2B · Milano",
  },
  {
    quote: "Uso la Collezione ogni giorno. Non per tutto — ma per il 20% dei task che mi rubava l'80% del tempo.",
    author: "A.C., Consulente di management",
    detail: "Freelance · 15 anni di esperienza",
  },
];

// ─── Template HTML — Apple Style ──────────────────────────────────────────
export function buildPromptCollectionHtml(): string {
  const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`;
  const BG = `#f5f5f7`;
  const CARD_BG = `#ffffff`;
  const TEXT_PRIMARY = `#1d1d1f`;
  const TEXT_SECONDARY = `#6e6e73`;
  const TEXT_TERTIARY = `#86868b`;
  const ACCENT = `#ff9f0a`;
  const ACCENT_DARK = `#e8890a`;
  const BORDER = `#d2d2d7`;
  const LIGHT_BG = `#f5f5f7`;

  const promptCards = PROMPT_EXAMPLES.map(p => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
          <div style="display:inline-block;background:${ACCENT}1a;color:${ACCENT_DARK};font-family:${FONT};font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin-bottom:12px;">${p.category}</div>
          <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:10px;">${p.title}</div>
          <div style="font-family:${FONT};font-size:13px;color:${TEXT_SECONDARY};line-height:1.65;margin-bottom:12px;font-style:italic;">${p.preview}</div>
          <div style="background:${LIGHT_BG};border-radius:8px;padding:10px 14px;">
            <div style="font-family:${FONT};font-size:12px;color:${TEXT_TERTIARY};">${p.result}</div>
          </div>
        </div>
      </td>
    </tr>
  `).join("");

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

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prompt Collection 2026 — ProofPress</title>
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
            <div style="font-family:${FONT};font-size:11px;color:${TEXT_TERTIARY};margin-top:2px;letter-spacing:0.3px;">Collezione Prompt 2026</div>
          </td>
          <td align="right">
            <div style="display:inline-block;background:${ACCENT}1a;color:${ACCENT_DARK};font-family:${FONT};font-size:13px;font-weight:700;padding:5px 14px;border-radius:20px;">39€</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:${CARD_BG};padding:48px 32px 40px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Nuova uscita 2026</div>
      <h1 style="margin:0 0 16px;font-family:${FONT};font-size:36px;font-weight:700;color:${TEXT_PRIMARY};line-height:1.15;letter-spacing:-0.5px;">Prompt da usare davvero<br>nel lavoro quotidiano.</h1>
      <p style="margin:0 0 24px;font-family:${FONT};font-size:17px;color:${TEXT_SECONDARY};line-height:1.55;">Non una raccolta teorica. Non i soliti "scrivi un'email professionale". Questi sono i prompt che funzionano davvero — testati su casi reali, scritti da chi usa l'AI ogni giorno per lavoro.</p>
      <p style="margin:0 0 32px;font-family:${FONT};font-size:15px;color:${TEXT_SECONDARY};line-height:1.7;">Il problema con i prompt che trovi online? Sono generici. Funzionano in demo, non nella realtà. I prompt della Collezione 2026 sono diversi: ogni prompt è strutturato con contesto, ruolo, vincoli e formato di output. Funzionano perché sono stati scritti partendo da problemi reali.</p>
      <a href="https://promptcollection2026.com/?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection" style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;padding:13px 24px;border-radius:980px;text-decoration:none;">Acquista ora — 39€ →</a>
    </td>
  </tr>

  <!-- COSA INCLUDE -->
  <tr>
    <td style="background:${LIGHT_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Cosa include</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Tutto quello che ti serve per lavorare meglio con l'AI.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="vertical-align:top;padding-right:8px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:16px;margin-bottom:12px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Strategia & Management</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Analisi competitiva, business plan, OKR, presentazioni board.</div>
            </div>
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:16px;margin-bottom:12px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Marketing & Contenuti</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Email, post social, landing page, SEO, campagne ADV.</div>
            </div>
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:16px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Vendite & Negoziazione</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Pitch, follow-up, obiezioni, contratti, cold outreach.</div>
            </div>
          </td>
          <td width="4%"></td>
          <td width="48%" style="vertical-align:top;padding-left:8px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:16px;margin-bottom:12px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Produttività Personale</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Sintesi riunioni, to-do, gestione email, prioritizzazione.</div>
            </div>
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:16px;margin-bottom:12px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">Analisi & Finanza</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Report finanziari, forecast, analisi dati, due diligence.</div>
            </div>
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:16px;">
              <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:4px;">HR & Recruiting</div>
              <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};line-height:1.5;">Job description, colloqui, feedback, onboarding, review.</div>
            </div>
          </td>
        </tr>
      </table>
      <div style="margin-top:16px;text-align:center;">
        <div style="font-family:${FONT};font-size:12px;color:${TEXT_TERTIARY};">+ Aggiornamenti gratuiti per tutto il 2026</div>
      </div>
    </td>
  </tr>

  <!-- ESEMPI DALLA COLLEZIONE -->
  <tr>
    <td style="background:${CARD_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">4 esempi dalla collezione</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Vedi come funzionano.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${promptCards}
      </table>
    </td>
  </tr>

  <!-- TESTIMONIAL -->
  <tr>
    <td style="background:${LIGHT_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Chi l'ha già acquistata</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Risultati reali.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${testimonialCards}
      </table>
    </td>
  </tr>

  <!-- PREZZO E CTA FINALE -->
  <tr>
    <td style="background:${TEXT_PRIMARY};padding:48px 32px;border-radius:0 0 16px 16px;text-align:center;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Prezzo di lancio</div>
      <div style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.4);text-decoration:line-through;margin-bottom:4px;">Valore stimato: 149€</div>
      <div style="font-family:${FONT};font-size:48px;font-weight:700;color:${ACCENT};letter-spacing:-1px;line-height:1;">39€</div>
      <div style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.5);margin:8px 0 28px;">Pagamento unico · Accesso immediato · Aggiornamenti 2026 inclusi</div>
      <a href="https://promptcollection2026.com/?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection" style="display:inline-block;background:#ffffff;color:${TEXT_PRIMARY};font-family:${FONT};font-size:15px;font-weight:600;padding:14px 28px;border-radius:980px;text-decoration:none;">Acquista la Collezione 2026 →</a>
      <div style="margin-top:16px;">
        <a href="https://promptcollection2026.com/?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection" style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;">promptcollection2026.com</a>
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
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:${TEXT_TERTIARY};text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:${TEXT_TERTIARY};text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:${TEXT_TERTIARY};text-decoration:none;">Startup</a>
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
export async function sendPromptCollectionNewsletterToAll(): Promise<void> {
  const alreadySent = await hasAlreadySentPromptTodayDB();
  if (alreadySent) {
    console.log("[PromptNewsletter] Guard: già inviata oggi. Skip.");
    try {
      await sendEmail({
        to: "ac@acinelli.com",
        subject: `[ProofPress] ⚠️ Newsletter Prompt Collection bloccata — già inviata oggi`,
        html: `<p>Il guard anti-duplicati ha bloccato un secondo invio della newsletter Prompt Collection in data ${new Date().toLocaleDateString("it-IT")}.</p>`,
      });
    } catch (e) {
      console.error("[PromptNewsletter] Errore invio alert email:", e);
    }
    return;
  }

  const subject = getSubjectVariant();
  const html = buildPromptCollectionHtml();

  const subscribers = await getActiveSubscribers();
  if (!subscribers || subscribers.length === 0) {
    console.log("[PromptNewsletter] Nessun iscritto attivo trovato. Skip.");
    return;
  }

  console.log(`[PromptNewsletter] Invio a ${subscribers.length} iscritti...`);

  const { newsletterSends } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) { console.error("[PromptNewsletter] DB non disponibile"); return; }

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
    console.log(`[PromptNewsletter] Inviati ${sent}/${subscribers.length}...`);
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

  console.log(`[PromptNewsletter] ✅ Completato. Inviati ${sent} messaggi.`);
}
