/**
 * Newsletter Promozionale A) ProofPress Business
 * Invio: martedì, venerdì, sabato alle 15:00 CET
 * Target: tutta la mailing list
 * Oggetto: alternato tra Creator, Editori, Aziende (rotazione per giorno della settimana)
 * Design: Apple-style — SF Francisco, sfondo bianco/grigio chiaro, layout ampio
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
export function getBusinessVariant(dayOfWeek?: number): "creator" | "editori" | "aziende" {
  const day = dayOfWeek ?? new Date().getDay();
  if (day === 2) return "creator";
  if (day === 5) return "editori";
  return "aziende";
}

// ─── Template HTML — Apple Style ──────────────────────────────────────────
export function buildBusinessNewsletterHtml(variant: "creator" | "editori" | "aziende"): string {

  // ── Stile comune Apple ──────────────────────────────────────────────────
  const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`;
  const BG = `#f5f5f7`;
  const CARD_BG = `#ffffff`;
  const TEXT_PRIMARY = `#1d1d1f`;
  const TEXT_SECONDARY = `#6e6e73`;
  const TEXT_TERTIARY = `#86868b`;
  const ACCENT = `#0071e3`;
  const BORDER = `#d2d2d7`;
  const LIGHT_BG = `#f5f5f7`;

  const configs = {
    creator: {
      tag: "Per Creator & Giornalisti",
      tagColor: ACCENT,
      headline: "La tua testata.\nLa tua firma.\nZero redazione.",
      subheadline: "Hai il talento. Non hai le 16 ore al giorno per gestire tutto il resto.",
      intro: `Monitorare le fonti richiede 2 ore al giorno. Scrivere un pezzo decente altre 2. Verificare i dati, formattare, pubblicare, distribuire, gestire la newsletter — altre 3. Moltiplica per 5 giorni e hai un lavoro full-time che produce 5 articoli al giorno.\n\nProofPress ti dà il team che non puoi assumere.`,
      stats: [
        { value: "4.000+", label: "Fonti monitorate 24/7" },
        { value: "15×", label: "Articoli al giorno con 1 persona" },
        { value: "100%", label: "Contenuti certificati" },
      ],
      howItWorks: [
        { step: "1", title: "Monitora", desc: "4.000+ fonti analizzate ogni ora. Solo le notizie rilevanti per il tuo settore, filtrate per rilevanza e qualità." },
        { step: "2", title: "Verifica", desc: "Confronto multi-fonte automatico. L'AI misura coerenza e affidabilità di ogni informazione prima di pubblicarla." },
        { step: "3", title: "Pubblica", desc: "Ogni contenuto riceve il badge ProofPress Verify. Newsletter, sito e social — tutto automatico con la tua firma." },
      ],
      testimonials: [
        {
          quote: "Prima impiegavo 4 ore al giorno a raccogliere notizie e scrivere. Oggi impiego 25 minuti per revisionare e pubblicare. Il resto lo fa ProofPress, con la mia firma.",
          author: "M.R., giornalista freelance specializzato in AI",
          detail: "Newsletter da 2.400 iscritti · Milano"
        },
        {
          quote: "Ho lanciato la mia newsletter in 3 giorni. Senza ProofPress ci avrei messo 3 mesi solo per impostare il flusso editoriale.",
          author: "L.B., creator tech",
          detail: "1.800 iscritti in 60 giorni · Roma"
        },
      ],
      caseTitle: "Come funziona nella pratica",
      caseDesc: `Marco è un giornalista freelance specializzato in AI e startup. Prima di ProofPress: 4 ore al giorno per raccogliere, scrivere e distribuire. Oggi: 25 minuti per revisionare il materiale già pronto, approvare e pubblicare. La newsletter ha raggiunto 2.400 iscritti in 4 mesi con un open rate del 48%.`,
      ctaText: "Scopri il piano Creator",
      ctaUrl: "https://proofpress.ai/offerta?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_creator",
      altCtaText: "Guarda la demo",
      altCtaUrl: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_creator",
      subjectVariants: [
        "ProofPress Business — La tua testata AI. La tua firma. Zero redazione.",
        "ProofPress per Creator — Pubblica 15 articoli al giorno con 1 persona.",
        "ProofPress Creator — Smetti di perdere 4 ore al giorno a raccogliere notizie.",
      ],
    },
    editori: {
      tag: "Per Testate & Editori",
      tagColor: `#34c759`,
      headline: "Redazione AI autonoma.\n24/7. Certificata.",
      subheadline: "Il tuo CMS aggiornato ogni ora. Con badge di verifica visibile ai lettori.",
      intro: `Le testate che non adottano l'AI oggi rischiano di perdere rilevanza domani. ProofPress offre una redazione AI autonoma che produce e certifica contenuti 24/7, si integra direttamente nel tuo CMS e aggiunge il badge ProofPress Verify su ogni articolo.\n\nNon sostituisce i tuoi giornalisti. Li amplifica.`,
      stats: [
        { value: "4.000+", label: "Fonti in tempo reale" },
        { value: "24/7", label: "Produzione automatica" },
        { value: "+34%", label: "Tempo medio di lettura" },
      ],
      howItWorks: [
        { step: "1", title: "Integrazione CMS", desc: "Connessione diretta al tuo CMS (WordPress, Ghost, custom). Articoli pubblicati automaticamente con il tuo template." },
        { step: "2", title: "Certificazione", desc: "Ogni articolo riceve un hash crittografico ProofPress Verify. Il badge è visibile ai lettori — segnale di affidabilità." },
        { step: "3", title: "Amplificazione", desc: "Il tuo team si concentra su inchieste e interviste. L'AI gestisce il flusso quotidiano di notizie certificate." },
      ],
      testimonials: [
        {
          quote: "Pubblichiamo 20 notizie certificate al giorno senza aver aumentato l'organico. Il badge ProofPress Verify ha cambiato come i lettori percepiscono la nostra affidabilità.",
          author: "Direttore editoriale, testata B2B finanza e startup",
          detail: "45.000 lettori mensili · Nord Italia"
        },
        {
          quote: "Il tempo medio di lettura è aumentato del 34% da quando abbiamo introdotto il badge di certificazione. I lettori si fidano di più dei contenuti verificati.",
          author: "Head of Digital, media group",
          detail: "Newsletter da 12.000 iscritti"
        },
      ],
      caseTitle: "Un caso reale",
      caseDesc: `Una testata B2B specializzata in finanza e startup ha integrato ProofPress nel proprio CMS. Oggi pubblica 20 notizie certificate al giorno senza aumentare l'organico. Il badge ProofPress Verify ha aumentato il tempo medio di lettura del 34% e il tasso di ritorno dei lettori del 22%.`,
      ctaText: "Scopri il piano Editore",
      ctaUrl: "https://proofpress.ai/offerta?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_editori",
      altCtaText: "Guarda la demo",
      altCtaUrl: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_editori",
      subjectVariants: [
        "ProofPress per Editori — Redazione AI autonoma. 24/7. Certificata.",
        "ProofPress Business — 20 notizie certificate al giorno senza aumentare l'organico.",
        "ProofPress Editori — Il badge che aumenta la fiducia dei tuoi lettori.",
      ],
    },
    aziende: {
      tag: "Per Aziende & Corporate",
      tagColor: `#ff9f0a`,
      headline: "Intelligence certificata\nper decisioni più rapide.",
      subheadline: "Newsroom interno branded. Report IR, competitor e market intelligence.",
      intro: `I C-level che prendono decisioni strategiche sull'AI hanno bisogno di informazioni verificate, non di rumore. ProofPress costruisce il tuo newsroom interno: un flusso continuo di intelligence certificata su competitor, mercato, trend AI e venture capital — tutto con il tuo brand.`,
      stats: [
        { value: "100%", label: "Contenuti certificati" },
        { value: "4.000+", label: "Fonti per la tua industry" },
        { value: "1", label: "Persona per gestire tutto" },
      ],
      howItWorks: [
        { step: "1", title: "Intelligence competitiva", desc: "Monitora i movimenti dei tuoi competitor in tempo reale. Alert automatici su funding, lanci di prodotto e assunzioni chiave." },
        { step: "2", title: "Content marketing", desc: "Pubblica contenuti certificati sul tuo sito e nei tuoi canali. Il badge ProofPress Verify aumenta la credibilità del tuo brand." },
        { step: "3", title: "Report IR", desc: "Genera report automatici per investor relations con dati verificati. Briefing mattutino per il CEO ogni giorno alle 8:00." },
      ],
      testimonials: [
        {
          quote: "Ogni mattina il CEO riceve un briefing certificato su AI, competitor e mercato. Ha ridotto il tempo di lettura delle news da 45 minuti a 10 minuti, con informazioni più accurate.",
          author: "Chief of Staff, scaleup SaaS B2B",
          detail: "50 dipendenti · Seed round completato"
        },
        {
          quote: "Il team marketing pubblica 3 articoli certificati al giorno sul blog aziendale. Il traffico organico è cresciuto del 180% in 6 mesi senza aumentare il budget.",
          author: "CMO, azienda fintech",
          detail: "Serie A · 120 dipendenti"
        },
      ],
      caseTitle: "Come lo usano le aziende",
      caseDesc: `Una scaleup SaaS B2B usa ProofPress per il proprio newsroom interno. Il CEO riceve ogni mattina un briefing certificato su AI, competitor e mercato. Il team marketing pubblica 3 articoli certificati al giorno sul blog aziendale senza aumentare il budget. Risultato: +180% traffico organico in 6 mesi.`,
      ctaText: "Scopri il piano Azienda",
      ctaUrl: "https://proofpress.ai/offerta?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_aziende",
      altCtaText: "Guarda la demo",
      altCtaUrl: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_aziende",
      subjectVariants: [
        "ProofPress Business — Intelligence certificata per decisioni più rapide.",
        "ProofPress per Aziende — Il tuo newsroom interno. Branded. Certificato.",
        "ProofPress Corporate — +180% traffico organico in 6 mesi con 1 persona.",
      ],
    },
  };

  const c = configs[variant];

  // ── Genera le card "Come funziona" ──────────────────────────────────────
  const howItWorksCards = c.howItWorks.map(h => `
    <td width="33%" style="vertical-align:top;padding:0 8px;">
      <div style="background:${LIGHT_BG};border-radius:12px;padding:20px;height:100%;">
        <div style="width:32px;height:32px;background:${c.tagColor};border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-family:${FONT};font-size:14px;font-weight:700;color:#fff;">${h.step}</span>
        </div>
        <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:8px;">${h.title}</div>
        <div style="font-family:${FONT};font-size:13px;color:${TEXT_SECONDARY};line-height:1.6;">${h.desc}</div>
      </div>
    </td>
  `).join("");

  // ── Genera i testimonial ─────────────────────────────────────────────────
  const testimonialCards = c.testimonials.map(t => `
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

  // ── Genera le stat cards ─────────────────────────────────────────────────
  const statCards = c.stats.map(s => `
    <td align="center" style="padding:0 8px;">
      <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:20px 16px;">
        <div style="font-family:${FONT};font-size:28px;font-weight:700;color:${c.tagColor};letter-spacing:-0.5px;">${s.value}</div>
        <div style="font-family:${FONT};font-size:12px;color:${TEXT_SECONDARY};margin-top:4px;">${s.label}</div>
      </div>
    </td>
  `).join("");

  // ── Headline con a capo ──────────────────────────────────────────────────
  const headlineHtml = c.headline.split("\n").join("<br>");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProofPress Business — ${c.tag}</title>
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
            <div style="font-family:${FONT};font-size:11px;color:${TEXT_TERTIARY};margin-top:2px;letter-spacing:0.3px;">AI Journalism Certificato</div>
          </td>
          <td align="right">
            <div style="display:inline-block;background:${c.tagColor}1a;color:${c.tagColor};font-family:${FONT};font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">${c.tag}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:${CARD_BG};padding:48px 32px 40px;">
      <h1 style="margin:0 0 16px;font-family:${FONT};font-size:36px;font-weight:700;color:${TEXT_PRIMARY};line-height:1.15;letter-spacing:-0.5px;">${headlineHtml}</h1>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:17px;color:${TEXT_SECONDARY};line-height:1.55;">${c.subheadline}</p>
      <p style="margin:0 0 32px;font-family:${FONT};font-size:15px;color:${TEXT_SECONDARY};line-height:1.7;">${c.intro.replace(/\n\n/g, '</p><p style="margin:16px 0 0;font-family:' + FONT + ';font-size:15px;color:' + TEXT_SECONDARY + ';line-height:1.7;">')}</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px;">
            <a href="${c.ctaUrl}" style="display:inline-block;background:${ACCENT};color:#fff;font-family:${FONT};font-size:15px;font-weight:600;padding:13px 24px;border-radius:980px;text-decoration:none;">${c.ctaText}</a>
          </td>
          <td>
            <a href="${c.altCtaUrl}" style="display:inline-block;background:transparent;color:${ACCENT};font-family:${FONT};font-size:15px;font-weight:500;padding:13px 0;text-decoration:none;">${c.altCtaText} →</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- STATS -->
  <tr>
    <td style="background:${LIGHT_BG};padding:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>${statCards}</tr>
      </table>
    </td>
  </tr>

  <!-- COME FUNZIONA -->
  <tr>
    <td style="background:${CARD_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Come funziona</div>
      <h2 style="margin:0 0 28px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Tre passi. Zero complessità.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>${howItWorksCards}</tr>
      </table>
    </td>
  </tr>

  <!-- CASO D'USO -->
  <tr>
    <td style="background:${LIGHT_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">${c.caseTitle}</div>
      <h2 style="margin:0 0 20px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Un esempio reale.</h2>
      <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
        <p style="margin:0;font-family:${FONT};font-size:15px;color:${TEXT_SECONDARY};line-height:1.7;">${c.caseDesc}</p>
      </div>
    </td>
  </tr>

  <!-- TESTIMONIAL -->
  <tr>
    <td style="background:${CARD_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Cosa dicono</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Chi lo usa ogni giorno.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${testimonialCards}
      </table>
    </td>
  </tr>

  <!-- FAQ -->
  <tr>
    <td style="background:${LIGHT_BG};padding:40px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${TEXT_TERTIARY};letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Domande frequenti</div>
      <h2 style="margin:0 0 28px;font-family:${FONT};font-size:24px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">Tre dubbi. Tre risposte dirette.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:16px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:8px;">"Il costo è giustificato per una piccola realtà?"</div>
              <p style="margin:0;font-family:${FONT};font-size:14px;color:${TEXT_SECONDARY};line-height:1.65;">Un giornalista freelance spende in media 2-3 ore al giorno solo nel monitoraggio delle fonti. ProofPress riduce questo tempo a meno di 20 minuti. A 39€/mese, il costo è inferiore a quello di un'ora di lavoro — e il tempo recuperato si trasforma direttamente in più contenuti pubblicati e più ricavi.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;">
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:8px;">"Quanto tempo richiede l'integrazione con il mio workflow?"</div>
              <p style="margin:0;font-family:${FONT};font-size:14px;color:${TEXT_SECONDARY};line-height:1.65;">Setup completo in meno di 10 minuti: crei un account, imposti i tuoi canali tematici e ProofPress inizia immediatamente a filtrare le notizie rilevanti. Non c'è nessun codice da scrivere, nessun plugin da installare. Chi ha già un sito WordPress o Ghost può collegarlo direttamente dalla dashboard.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${TEXT_PRIMARY};margin-bottom:8px;">"I contenuti generati dall'AI sono davvero affidabili?"</div>
              <p style="margin:0;font-family:${FONT};font-size:14px;color:${TEXT_SECONDARY};line-height:1.65;">ProofPress non pubblica contenuti non verificati. Ogni notizia passa attraverso il sistema ProofPress Verify: confronto multi-fonte, rilevamento di incoerenze e assegnazione di un hash di certificazione. Il tuo nome appare solo su contenuti che hanno superato questo processo — e ogni lettore può verificarlo in tempo reale con un click.</p>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA FINALE -->
  <tr>
    <td style="background:${TEXT_PRIMARY};padding:48px 32px;border-radius:0 0 16px 16px;text-align:center;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Inizia oggi</div>
      <h2 style="margin:0 0 12px;font-family:${FONT};font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Prova ProofPress gratuitamente.</h2>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:15px;color:rgba(255,255,255,0.6);line-height:1.6;">Nessuna carta di credito. Setup in 10 minuti.</p>
      <a href="${c.ctaUrl}" style="display:inline-block;background:#ffffff;color:${TEXT_PRIMARY};font-family:${FONT};font-size:15px;font-weight:600;padding:14px 28px;border-radius:980px;text-decoration:none;margin-bottom:16px;">${c.ctaText} →</a>
      <div style="margin-top:16px;">
        <a href="${c.altCtaUrl}" style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.5);text-decoration:none;">${c.altCtaText}</a>
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
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:${TEXT_TERTIARY};text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:${TEXT_TERTIARY};text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:${TEXT_TERTIARY};text-decoration:none;">Startup</a>
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
export async function sendBusinessNewsletterToAll(): Promise<void> {
  const variant = getBusinessVariant();
  const alreadySent = await hasAlreadySentBusinessTodayDB(variant);
  if (alreadySent) {
    console.log(`[BusinessNewsletter] Guard: già inviata oggi (${variant}). Skip.`);
    try {
      await sendEmail({
        to: "ac@acinelli.com",
        subject: `[ProofPress] ⚠️ Newsletter Business (${variant}) bloccata — già inviata oggi`,
        html: `<p>Il guard anti-duplicati ha bloccato un secondo invio della newsletter Business (${variant}) in data ${new Date().toLocaleDateString("it-IT")}.</p>`,
      });
    } catch (e) {
      console.error("[BusinessNewsletter] Errore invio alert email:", e);
    }
    return;
  }

  const c = {
    creator: {
      subjectVariants: [
        "ProofPress Business — La tua testata AI. La tua firma. Zero redazione.",
        "ProofPress per Creator — Pubblica 15 articoli al giorno con 1 persona.",
        "ProofPress Creator — Smetti di perdere 4 ore al giorno a raccogliere notizie.",
      ],
    },
    editori: {
      subjectVariants: [
        "ProofPress per Editori — Redazione AI autonoma. 24/7. Certificata.",
        "ProofPress Business — 20 notizie certificate al giorno senza aumentare l'organico.",
        "ProofPress Editori — Il badge che aumenta la fiducia dei tuoi lettori.",
      ],
    },
    aziende: {
      subjectVariants: [
        "ProofPress Business — Intelligence certificata per decisioni più rapide.",
        "ProofPress per Aziende — Il tuo newsroom interno. Branded. Certificato.",
        "ProofPress Corporate — +180% traffico organico in 6 mesi con 1 persona.",
      ],
    },
  };

  const dayOfWeek = new Date().getDay();
  const subjectIndex = [1, 3, 5, 6].indexOf(dayOfWeek) % 3;
  const subject = c[variant].subjectVariants[subjectIndex >= 0 ? subjectIndex : 0];
  const html = buildBusinessNewsletterHtml(variant);

  const subscribers = await getActiveSubscribers();
  if (!subscribers || subscribers.length === 0) {
    console.log("[BusinessNewsletter] Nessun iscritto attivo trovato. Skip.");
    return;
  }

  console.log(`[BusinessNewsletter] Invio a ${subscribers.length} iscritti (variante: ${variant})...`);

  const { newsletterSends } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) { console.error("[BusinessNewsletter] DB non disponibile"); return; }

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

  if (sendId) {
    const { eq } = await import("drizzle-orm");
    const db2 = await getDb();
    if (db2) {
      await db2.update(newsletterSends)
        .set({ status: "sent", recipientCount: sent })
        .where(eq(newsletterSends.id, sendId));
    }
  }

  console.log(`[BusinessNewsletter] ✅ Completato. Inviati ${sent} messaggi.`);
}
