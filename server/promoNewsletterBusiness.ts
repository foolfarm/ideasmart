/**
 * Newsletter Promozionale A) ProofPress Business
 * Invio: martedì, venerdì, sabato alle 15:00 CET
 * Target: tutta la mailing list
 * Oggetto: alternato tra Creator, Editori, Aziende (rotazione per giorno della settimana)
 */

import { getDb, getActiveSubscribers } from "./db";
import { sendEmail } from "./email";

// ─── Guard anti-duplicati DB-based ─────────────────────────────────────────
async function hasAlreadySentBusinessTodayDB(variant: string): Promise<boolean> {
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
        like(newsletterSends.subject, `%ProofPress Business%${variant}%`),
        eq(newsletterSends.status, "sent"),
        gte(newsletterSends.createdAt, todayStart),
        lte(newsletterSends.createdAt, todayEnd)
      )
    )
    .limit(1);

  return existing.length > 0 && (existing[0].recipientCount ?? 0) > 0;
}

// ─── Determina la variante in base al giorno della settimana ───────────────
// martedì (2) → Creator, venerdì (5) → Editori, sabato (6) → Aziende
export function getBusinessVariant(dayOfWeek?: number): "creator" | "editori" | "aziende" {
  const day = dayOfWeek ?? new Date().getDay();
  if (day === 2) return "creator";
  if (day === 5) return "editori";
  return "aziende"; // sabato e fallback
}

// ─── Template HTML ─────────────────────────────────────────────────────────
export function buildBusinessNewsletterHtml(variant: "creator" | "editori" | "aziende"): string {
  const configs = {
    creator: {
      tag: "PER CREATOR & GIORNALISTI",
      headline: "La tua testata. La tua firma. Zero redazione.",
      subheadline: "Hai il talento. Non hai le 16 ore al giorno.",
      body: `Monitorare le fonti richiede 2 ore. Scrivere un pezzo decente altre 2. Verificare i dati, formattare, pubblicare, distribuire, gestire la newsletter — altre 3. Moltiplica per 5 giorni e hai un lavoro full-time che produce 5 articoli al giorno.
      <br><br>
      <strong>ProofPress ti dà il team che non puoi assumere.</strong> Un sistema agentico che analizza 4.000+ fonti ogni giorno, scrive con il tuo tono, certifica ogni contenuto con ProofPress Verify e distribuisce la tua newsletter ai tuoi lettori.`,
      stats: [
        { value: "4.000+", label: "fonti monitorate 24/7" },
        { value: "15", label: "articoli/giorno con 1 sola persona" },
        { value: "100%", label: "contenuti certificati" },
      ],
      caseUse: `<strong>Caso d'uso:</strong> Marco, giornalista freelance specializzato in AI, pubblica ogni giorno una newsletter da 2.000 iscritti. Prima di ProofPress impiegava 4 ore al giorno a raccogliere e scrivere. Oggi impiega 30 minuti per revisionare e pubblicare. Il resto lo fa l'AI, con la sua firma.`,
      ctaText: "Scopri il piano Creator →",
      ctaUrl: "https://proofpress.ai/offerta/creator?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_creator",
      altCta1Text: "Guarda la demo live",
      altCta1Url: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_creator",
    },
    editori: {
      tag: "PER TESTATE & EDITORI",
      headline: "Redazione AI autonoma. 24/7. Certificata.",
      subheadline: "Il tuo CMS aggiornato ogni ora. Con badge di verifica visibile ai lettori.",
      body: `Le testate che non adottano l'AI oggi rischiano di perdere rilevanza domani. ProofPress offre una redazione AI autonoma che produce e certifica contenuti 24/7, si integra direttamente nel tuo CMS e aggiunge il badge ProofPress Verify su ogni articolo — un segnale di affidabilità visibile ai tuoi lettori.
      <br><br>
      <strong>Non sostituisce i tuoi giornalisti. Li amplifica.</strong> Mentre l'AI gestisce il monitoraggio, la sintesi e la certificazione, il tuo team si concentra sulle inchieste, le interviste e i contenuti ad alto valore.`,
      stats: [
        { value: "4.000+", label: "fonti monitorate in tempo reale" },
        { value: "24/7", label: "produzione automatica certificata" },
        { value: "100%", label: "contenuti con ProofPress Verify" },
      ],
      caseUse: `<strong>Caso d'uso:</strong> Una testata B2B specializzata in finanza e startup ha integrato ProofPress nel proprio CMS. Oggi pubblica 20 notizie certificate al giorno senza aumentare l'organico. Il badge ProofPress Verify ha aumentato il tempo medio di lettura del 34%.`,
      ctaText: "Scopri il piano Editore →",
      ctaUrl: "https://proofpress.ai/offerta/editori?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_editori",
      altCta1Text: "Guarda la demo live",
      altCta1Url: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_editori",
    },
    aziende: {
      tag: "PER AZIENDE & CORPORATE",
      headline: "Intelligence certificata per decisioni più rapide.",
      subheadline: "Newsroom interno branded. Report IR, competitor e market intelligence.",
      body: `I C-level che prendono decisioni strategiche sull'AI hanno bisogno di informazioni verificate, non di rumore. ProofPress costruisce il tuo newsroom interno: un flusso continuo di intelligence certificata su competitor, mercato, trend AI e venture capital — tutto con il tuo brand.
      <br><br>
      <strong>Tre casi d'uso principali:</strong> (1) Intelligence competitiva — monitora i movimenti dei tuoi competitor in tempo reale. (2) Content marketing affidabile — pubblica contenuti certificati sul tuo sito e nei tuoi canali. (3) Report IR — genera report automatici per investor relations con dati verificati.`,
      stats: [
        { value: "100%", label: "contenuti certificati ProofPress Verify" },
        { value: "4.000+", label: "fonti monitorate per la tua industry" },
        { value: "1", label: "persona per gestire tutto il flusso" },
      ],
      caseUse: `<strong>Caso d'uso:</strong> Una scaleup SaaS B2B usa ProofPress per il proprio newsroom interno. Ogni mattina il CEO riceve un briefing certificato su AI, competitor e mercato. Il team marketing pubblica 3 articoli certificati al giorno sul blog aziendale senza aumentare il budget.`,
      ctaText: "Scopri il piano Azienda →",
      ctaUrl: "https://proofpress.ai/offerta/aziende?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_aziende",
      altCta1Text: "Guarda la demo live",
      altCta1Url: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_aziende",
    },
  };

  const c = configs[variant];

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProofPress Business — ${c.tag}</title>
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
            <div style="font-size:10px;color:#888;letter-spacing:3px;text-transform:uppercase;margin-top:2px;">AI JOURNALISM CERTIFICATO</div>
          </td>
          <td align="right">
            <div style="font-size:10px;color:#666;letter-spacing:2px;text-transform:uppercase;">BUSINESS</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:#fff;padding:40px 36px 32px;">
      <div style="display:inline-block;background:#ff5500;color:#fff;font-size:10px;font-weight:700;letter-spacing:2px;padding:4px 10px;border-radius:2px;text-transform:uppercase;margin-bottom:20px;">${c.tag}</div>
      <h1 style="margin:0 0 12px;font-family:'Georgia',serif;font-size:32px;font-weight:700;color:#0a0f1e;line-height:1.2;">${c.headline}</h1>
      <p style="margin:0 0 24px;font-size:18px;color:#555;font-style:italic;line-height:1.5;">${c.subheadline}</p>
      <p style="margin:0;font-size:15px;color:#333;line-height:1.7;">${c.body}</p>
    </td>
  </tr>

  <!-- STATS -->
  <tr>
    <td style="background:#0a0f1e;padding:28px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${c.stats.map(s => `
          <td align="center" style="padding:0 8px;">
            <div style="font-size:28px;font-weight:700;color:#00e5c8;font-family:'Georgia',serif;">${s.value}</div>
            <div style="font-size:11px;color:#aaa;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">${s.label}</div>
          </td>`).join("")}
        </tr>
      </table>
    </td>
  </tr>

  <!-- COME FUNZIONA -->
  <tr>
    <td style="background:#fff;padding:32px 36px;">
      <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0a0f1e;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #ff5500;padding-bottom:8px;display:inline-block;">Come funziona</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="vertical-align:top;padding-right:12px;">
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;margin-bottom:12px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">01 — MONITORA</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">4.000+ fonti analizzate ogni ora. Solo le notizie rilevanti per il tuo settore.</div>
            </div>
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">03 — CERTIFICA</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">Ogni contenuto riceve un hash crittografico ProofPress Verify. Immutabile.</div>
            </div>
          </td>
          <td width="4%"></td>
          <td width="48%" style="vertical-align:top;padding-left:12px;">
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;margin-bottom:12px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">02 — VERIFICA</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">Confronto multi-fonte automatico. L'AI misura coerenza e affidabilità.</div>
            </div>
            <div style="background:#f5f0e8;border-radius:4px;padding:16px;">
              <div style="font-size:11px;color:#ff5500;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">04 — DISTRIBUISCE</div>
              <div style="font-size:13px;color:#333;line-height:1.5;">Newsletter, CMS, social. Tutto automatico. Tu mantieni la firma e il controllo.</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CASO D'USO -->
  <tr>
    <td style="background:#f5f0e8;padding:28px 36px;border-left:4px solid #00e5c8;">
      <p style="margin:0;font-size:14px;color:#333;line-height:1.7;font-style:italic;">${c.caseUse}</p>
    </td>
  </tr>

  <!-- CTA PRINCIPALE -->
  <tr>
    <td style="background:#fff;padding:32px 36px;text-align:center;">
      <a href="${c.ctaUrl}" style="display:inline-block;background:#ff5500;color:#fff;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:14px 32px;border-radius:3px;text-decoration:none;margin-bottom:16px;">${c.ctaText}</a>
      <br>
      <a href="${c.altCta1Url}" style="display:inline-block;color:#0a0f1e;font-size:13px;text-decoration:underline;margin-top:8px;">${c.altCta1Text}</a>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#0a0f1e;padding:24px 36px;border-radius:0 0 4px 4px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:12px;color:#666;">
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:#888;text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:#888;text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:#888;text-decoration:none;">Startup</a>
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
export async function sendBusinessNewsletterToAll(variant?: "creator" | "editori" | "aziende"): Promise<void> {
  const resolvedVariant = variant ?? getBusinessVariant();

  const alreadySent = await hasAlreadySentBusinessTodayDB(resolvedVariant);
  if (alreadySent) {
    console.log(`[BusinessNewsletter] Guard: già inviata variante "${resolvedVariant}" oggi. Skip.`);
    // Alert email al proprietario
    try {
      await sendEmail({
        to: "ac@acinelli.com",
        subject: `[ProofPress] ⚠️ Newsletter Business "${resolvedVariant}" bloccata — già inviata oggi`,
        html: `<p>Il guard anti-duplicati ha bloccato un secondo invio della newsletter Business (variante: <strong>${resolvedVariant}</strong>) in data ${new Date().toLocaleDateString("it-IT")}.</p><p>Nessuna azione richiesta — il sistema funziona correttamente.</p>`,
      });
    } catch (e) {
      console.error("[BusinessNewsletter] Errore invio alert email:", e);
    }
    return;
  }

  const subjectMap = {
    creator: "ProofPress Business — La tua testata. La tua firma. Zero redazione.",
    editori: "ProofPress Business — Redazione AI autonoma 24/7 per la tua testata.",
    aziende: "ProofPress Business — Intelligence certificata per il tuo team.",
  };

  const subject = subjectMap[resolvedVariant];
  const html = buildBusinessNewsletterHtml(resolvedVariant);

  const subscribers = await getActiveSubscribers();
  if (!subscribers || subscribers.length === 0) {
    console.log("[BusinessNewsletter] Nessun iscritto attivo trovato. Skip.");
    return;
  }

  console.log(`[BusinessNewsletter] Invio variante "${resolvedVariant}" a ${subscribers.length} iscritti...`);

  // Salva record nel DB prima dell'invio
  const { newsletterSends } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) { console.error('[BusinessNewsletter] DB non disponibile'); return; }
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
    console.log(`[BusinessNewsletter] Inviati ${sent}/${subscribers.length}...`);
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Aggiorna record nel DB
  if (sendId) {
    const { eq } = await import("drizzle-orm");
    const db2 = await getDb();
    if (!db2) return;
    await db2.update(newsletterSends)
      .set({ status: "sent", recipientCount: sent })
      .where(eq(newsletterSends.id, sendId));
  }

  console.log(`[BusinessNewsletter] ✅ Completato. Inviati ${sent} messaggi (variante: ${resolvedVariant}).`);
}
