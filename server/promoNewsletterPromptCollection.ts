/**
 * Newsletter Promozionale B) Prompt Collection 2026
 * Invio: lunedì, mercoledì, giovedì alle 15:00 CET
 * Target: tutta la mailing list
 * Prodotto: "Prompt da usare davvero nel lavoro quotidiano" — 39€
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
  // lun(1)→0, mer(3)→1, gio(4)→2
  if (day === 1) return SUBJECT_VARIANTS[0];
  if (day === 3) return SUBJECT_VARIANTS[1];
  return SUBJECT_VARIANTS[2];
}

// ─── Esempi di prompt per il corpo della newsletter ─────────────────────────
const PROMPT_EXAMPLES = [
  {
    category: "STRATEGIA",
    title: "Analisi competitiva in 5 minuti",
    preview: "Sei un consulente McKinsey. Analizza il posizionamento competitivo di [azienda] rispetto ai principali competitor nel mercato [settore]. Identifica i 3 vantaggi competitivi chiave, le 3 vulnerabilità principali e proponi 2 mosse strategiche immediate...",
  },
  {
    category: "MARKETING",
    title: "Email di follow-up che converte",
    preview: "Scrivi un'email di follow-up per un prospect che ha partecipato a una demo ma non ha risposto negli ultimi 7 giorni. Tono: professionale ma diretto. Obiettivo: ottenere un feedback o una risposta entro 48 ore. Evita frasi generiche come 'spero che tu stia bene'...",
  },
  {
    category: "PRODUTTIVITÀ",
    title: "Sintesi riunione con action items",
    preview: "Sei un chief of staff esperto. Trasforma queste note di riunione [incolla note] in: 1) Sintesi esecutiva in 3 righe, 2) Decisioni prese, 3) Action items con responsabile e scadenza, 4) Punti aperti da risolvere. Formato: bullet points chiari...",
  },
  {
    category: "CONTENUTI",
    title: "Post LinkedIn che genera engagement",
    preview: "Scrivi un post LinkedIn per un CEO che vuole condividere una lezione appresa da un fallimento recente. Struttura: hook provocatorio (1 riga), storia in 3-4 paragrafi brevi, lezione chiave, domanda finale per il commento. Tono: autentico, non corporate...",
  },
];

// ─── Template HTML ─────────────────────────────────────────────────────────
function buildPromptCollectionHtml(): string {
  const promptRows = PROMPT_EXAMPLES.map(p => `
    <tr>
      <td style="padding:0 0 16px;">
        <div style="background:#fff;border:1px solid #e8e0d0;border-radius:4px;padding:20px;border-left:3px solid #c8a96e;">
          <div style="font-size:10px;color:#c8a96e;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">${p.category}</div>
          <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">${p.title}</div>
          <div style="font-size:13px;color:#666;line-height:1.6;font-style:italic;">"${p.preview}"</div>
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
            <div style="font-size:10px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-top:2px;">COLLEZIONE PROMPT 2026</div>
          </td>
          <td align="right">
            <div style="background:#c8a96e;color:#000;font-size:12px;font-weight:700;padding:6px 14px;border-radius:2px;letter-spacing:1px;">39€</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:#1a1a1a;padding:40px 36px 36px;">
      <div style="font-size:11px;color:#c8a96e;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">NUOVA USCITA 2026</div>
      <h1 style="margin:0 0 16px;font-family:'Georgia',serif;font-size:34px;font-weight:700;color:#fff;line-height:1.2;">Prompt da usare davvero<br>nel lavoro quotidiano.</h1>
      <p style="margin:0 0 24px;font-size:16px;color:#aaa;line-height:1.6;">Non una raccolta teorica. Non i soliti "scrivi un'email professionale". Questi sono i prompt che funzionano davvero — testati su casi reali, scritti da chi usa l'AI ogni giorno per lavoro.</p>
      <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection#prompt-collection" style="display:inline-block;background:#c8a96e;color:#000;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 28px;border-radius:3px;text-decoration:none;">Acquista ora — 39€ →</a>
    </td>
  </tr>

  <!-- PROBLEMA -->
  <tr>
    <td style="background:#fff;padding:32px 36px;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1a1a1a;font-family:'Georgia',serif;">Il problema con i prompt che trovi online</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">Sono generici. Funzionano in demo, non nella realtà. "Sei un esperto di marketing, scrivi un post" — e ottieni qualcosa che sembra scritto da un ufficio stampa degli anni '90.</p>
      <p style="margin:0;font-size:15px;color:#444;line-height:1.7;"><strong>I prompt della Collezione 2026 sono diversi.</strong> Ogni prompt è strutturato con contesto, ruolo, vincoli e formato di output. Funzionano perché sono stati scritti partendo da problemi reali — non da tutorial YouTube.</p>
    </td>
  </tr>

  <!-- ESEMPI -->
  <tr>
    <td style="background:#f5f0e8;padding:28px 36px;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;">4 esempi dalla collezione</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${promptRows}
      </table>
      <p style="margin:8px 0 0;font-size:12px;color:#999;text-align:center;">+ decine di altri prompt per vendite, finanza, HR, legale, AI automation e molto altro.</p>
    </td>
  </tr>

  <!-- COSA INCLUDE -->
  <tr>
    <td style="background:#fff;padding:32px 36px;">
      <h2 style="margin:0 0 20px;font-size:14px;font-weight:700;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;border-bottom:2px solid #c8a96e;padding-bottom:8px;display:inline-block;">Cosa include la Collezione</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="vertical-align:top;padding-right:12px;">
            <div style="font-size:13px;color:#333;line-height:1.8;">
              ✓ &nbsp;Prompt per strategia e management<br>
              ✓ &nbsp;Prompt per marketing e contenuti<br>
              ✓ &nbsp;Prompt per vendite e negoziazione<br>
              ✓ &nbsp;Prompt per produttività personale
            </div>
          </td>
          <td width="4%"></td>
          <td width="48%" style="vertical-align:top;padding-left:12px;">
            <div style="font-size:13px;color:#333;line-height:1.8;">
              ✓ &nbsp;Prompt per analisi finanziaria<br>
              ✓ &nbsp;Prompt per HR e recruiting<br>
              ✓ &nbsp;Prompt per AI automation<br>
              ✓ &nbsp;Aggiornamenti gratuiti 2026
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PREZZO E CTA -->
  <tr>
    <td style="background:#1a1a1a;padding:36px;text-align:center;">
      <div style="font-size:13px;color:#888;text-decoration:line-through;margin-bottom:4px;">Valore stimato: 149€</div>
      <div style="font-size:42px;font-weight:700;color:#c8a96e;font-family:'Georgia',serif;margin-bottom:4px;">39€</div>
      <div style="font-size:12px;color:#666;margin-bottom:24px;">Pagamento unico · Accesso immediato · Aggiornamenti inclusi</div>
      <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection#prompt-collection" style="display:inline-block;background:#c8a96e;color:#000;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:16px 36px;border-radius:3px;text-decoration:none;">Acquista la Collezione 2026 →</a>
      <div style="margin-top:16px;font-size:12px;color:#555;">Disponibile su proofpress.ai</div>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#0a0f1e;padding:24px 36px;border-radius:0 0 4px 4px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:12px;color:#666;">
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:#888;text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:#888;text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:#888;text-decoration:none;">Startup</a>
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
