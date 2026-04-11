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

// ─── Template HTML — Apple Style COMPLETO ────────────────────────────────
export function buildPubblicitaHtml(): string {
  const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`;
  const BG = `#f5f5f7`;
  const WHITE = `#ffffff`;
  const BLACK = `#1d1d1f`;
  const SLATE = `#6e6e73`;
  const MUTED = `#86868b`;
  const BORDER = `#d2d2d7`;
  const BLUE = `#0071e3`;

  // ── Profili del pubblico ─────────────────────────────────────────────────
  const AUDIENCE = [
    { title: "C-Level & Manager", desc: "CEO, CTO, CMO e direttori che adottano l'AI nei processi aziendali. Prendono decisioni di acquisto con budget significativi.", pct: "38%", icon: "🏢" },
    { title: "Founder & Startupper", desc: "Imprenditori che costruiscono prodotti e servizi basati sull'intelligenza artificiale. Cercano strumenti, partner e investitori.", pct: "29%", icon: "🚀" },
    { title: "Investitori & VC", desc: "Business angel, venture capitalist e family office alla ricerca di opportunità nell'ecosistema AI. Seguono deal flow e trend.", pct: "18%", icon: "💼" },
    { title: "Professionisti", desc: "Consulenti, avvocati, commercialisti che si aggiornano sull'impatto dell'AI nel loro settore e cercano soluzioni per i clienti.", pct: "15%", icon: "⚖️" },
  ];

  // ── Testimonial da advertiser ────────────────────────────────────────────
  const TESTIMONIALS = [
    {
      quote: "Abbiamo lanciato la campagna di lunedì. Mercoledì avevamo già 3 richieste di demo qualificate. Il pubblico di ProofPress è esattamente il nostro target: decision maker che stanno cercando attivamente soluzioni AI per il loro business.",
      author: "Marketing Director, software house B2B",
      detail: "Campagna newsletter · Top placement · Settembre 2025 · 3 demo in 48h",
    },
    {
      quote: "L'open rate del 45% non è un numero — è una promessa. Ogni euro investito qui raggiunge qualcuno che sta davvero leggendo, non scrollando. Il CPM effettivo è 3× più efficiente rispetto a LinkedIn Ads per il nostro target.",
      author: "CMO, startup fintech",
      detail: "Campagna banner sito + newsletter · Ottobre 2025 · CPM 3× vs LinkedIn",
    },
    {
      quote: "Il native content che ha scritto il team ProofPress era così ben integrato che i lettori lo hanno condiviso come un articolo editoriale. CTR del 8.4% — il nostro benchmark su altri canali è 1.2%. Non è paragonabile.",
      author: "Head of Growth, SaaS HR",
      detail: "Articolo sponsorizzato · Novembre 2025 · CTR 8.4%",
    },
    {
      quote: "Siamo tornati per il terzo trimestre consecutivo. Non perché siamo obbligati — perché funziona. Il pubblico di ProofPress è quello che vogliamo raggiungere: informato, attivo, con budget. Non esiste un canale più diretto.",
      author: "CEO, azienda AI tools",
      detail: "Campagna trimestrale · Q3-Q4 2025 · 3° rinnovo consecutivo",
    },
  ];

  // ── Casi d'uso campagne ──────────────────────────────────────────────────
  const CAMPAIGN_CASES = [
    {
      title: "Software house B2B — 3 demo in 48 ore",
      objective: "Generare demo qualificate per una piattaforma di AI analytics per PMI.",
      format: "Top placement newsletter + banner header sito",
      duration: "2 settimane",
      result: "3 richieste di demo qualificate nelle prime 48 ore. 12 demo totali in 2 settimane. 2 contratti chiusi nel mese successivo. ROI campagna: 8.4×.",
      metric: "ROI 8.4× · 2 contratti chiusi",
    },
    {
      title: "Startup fintech — Brand awareness tra i VC",
      objective: "Aumentare la visibilità tra investitori e VC prima di un round Series A.",
      format: "Native content + mid placement newsletter",
      duration: "1 mese",
      result: "L'articolo sponsorizzato ha ricevuto 2.400 letture. 6 VC hanno contattato il founder direttamente citando l'articolo. Il round è stato sovrascritto del 40%.",
      metric: "6 VC inbound · Round sovrascritto 40%",
    },
    {
      title: "SaaS HR — Lancio prodotto su mercato italiano",
      objective: "Entrare nel mercato italiano con un prodotto già affermato in UK.",
      format: "Campagna integrata: newsletter + sito + articolo sponsorizzato",
      duration: "6 settimane",
      result: "1.200 visitatori unici al sito dal traffico ProofPress. 340 trial attivati. CTR medio campagna: 8.4% vs benchmark di settore 1.2%. Costo per trial: 2.3€.",
      metric: "340 trial · Costo per trial 2.3€",
    },
  ];

  // ── Formati disponibili ──────────────────────────────────────────────────
  const FORMATS_NEWSLETTER = [
    {
      name: "Top Placement",
      desc: "Logo + headline + testo (max 80 parole) + CTA nella parte alta della newsletter. Prima posizione, massima visibilità. Visibile prima dello scroll.",
      best: "Lanci di prodotto, generazione lead, eventi",
      ctr: "CTR medio: 4.2%",
    },
    {
      name: "Mid Placement",
      desc: "Blocco testuale con logo nella parte centrale della newsletter. Formato meno invasivo, ideale per brand awareness continuativa.",
      best: "Brand awareness, campagne di lungo periodo",
      ctr: "CTR medio: 2.8%",
    },
    {
      name: "Native Content",
      desc: "Articolo sponsorizzato scritto dal team ProofPress con il tuo brief. Integrato nel flusso editoriale, indicizzato su Google, condivisibile.",
      best: "Thought leadership, SEO, campagne complesse",
      ctr: "CTR medio: 8.4%",
    },
  ];

  const FORMATS_SITE = [
    {
      name: "Banner Header",
      desc: "Due posizioni nell'header del sito, visibili su ogni pagina. Alta frequenza di esposizione per chi naviga regolarmente.",
      best: "Brand recall, frequenza di esposizione",
      reach: "100.000+ impression/mese",
    },
    {
      name: "Banner Sidebar",
      desc: "Posizione fissa nella sidebar, sempre visibile durante la navigazione degli articoli. Ideale per campagne di lungo periodo.",
      best: "Campagne continuative, brand awareness",
      reach: "60.000+ impression/mese",
    },
    {
      name: "Articolo Sponsorizzato",
      desc: "Contenuto editoriale con il tuo brand, scritto dal team ProofPress, pubblicato sul sito e indicizzato su Google. Rimane online permanentemente.",
      best: "SEO, thought leadership, campagne evergreen",
      reach: "Permanente + traffico organico",
    },
  ];

  // ── Genera le stat cards ─────────────────────────────────────────────────
  const statCards = [
    { value: "100K+", label: "Visite mensili al sito" },
    { value: "6.000+", label: "Iscritti newsletter" },
    { value: "45%", label: "Open rate medio" },
    { value: "8 min", label: "Tempo medio di lettura" },
  ].map(s => `
    <td align="center" style="padding:0 6px;">
      <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
        <div style="font-family:${FONT};font-size:26px;font-weight:700;color:${BLUE};letter-spacing:-0.5px;">${s.value}</div>
        <div style="font-family:${FONT};font-size:12px;color:${SLATE};margin-top:4px;line-height:1.4;">${s.label}</div>
      </div>
    </td>
  `).join("");

  // ── Audience cards ───────────────────────────────────────────────────────
  const audienceCards = AUDIENCE.map(a => `
    <tr>
      <td style="padding:0 0 12px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:22px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:top;">
                <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:6px;">${a.icon} ${a.title}</div>
                <div style="font-family:${FONT};font-size:13px;color:${SLATE};line-height:1.6;">${a.desc}</div>
              </td>
              <td align="right" style="vertical-align:top;padding-left:20px;white-space:nowrap;">
                <div style="font-family:${FONT};font-size:24px;font-weight:700;color:${BLUE};">${a.pct}</div>
                <div style="font-family:${FONT};font-size:11px;color:${MUTED};margin-top:2px;">del pubblico</div>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Testimonial cards ────────────────────────────────────────────────────
  const testimonialCards = TESTIMONIALS.map(t => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;">
          <div style="font-family:${FONT};font-size:32px;color:${BLUE};line-height:1;margin-bottom:12px;opacity:0.4;">"</div>
          <div style="font-family:${FONT};font-size:15px;color:${BLACK};line-height:1.7;margin-bottom:20px;">${t.quote}</div>
          <div style="border-top:1px solid ${BORDER};padding-top:16px;">
            <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${BLACK};">${t.author}</div>
            <div style="font-family:${FONT};font-size:12px;color:${MUTED};margin-top:3px;">${t.detail}</div>
          </div>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Campaign case cards ──────────────────────────────────────────────────
  const campaignCards = CAMPAIGN_CASES.map((c, i) => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;">
          <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${BLUE};letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;">Campagna ${i + 1}</div>
          <div style="font-family:${FONT};font-size:16px;font-weight:600;color:${BLACK};margin-bottom:18px;">${c.title}</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="48%" style="vertical-align:top;padding-right:12px;">
                <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Obiettivo</div>
                <div style="font-family:${FONT};font-size:13px;color:${SLATE};line-height:1.6;margin-bottom:14px;">${c.objective}</div>
                <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Formato</div>
                <div style="font-family:${FONT};font-size:13px;color:${SLATE};line-height:1.6;margin-bottom:14px;">${c.format}</div>
                <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Durata</div>
                <div style="font-family:${FONT};font-size:13px;color:${SLATE};line-height:1.6;">${c.duration}</div>
              </td>
              <td width="52%" style="vertical-align:top;padding-left:12px;">
                <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#2e7d32;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Risultato</div>
                <div style="font-family:${FONT};font-size:13px;color:${SLATE};line-height:1.65;margin-bottom:16px;">${c.result}</div>
                <div style="background:${BLUE}12;border-radius:8px;padding:10px 14px;">
                  <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${BLUE};">📊 ${c.metric}</div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Format newsletter cards (3 colonne) ──────────────────────────────────
  const newsletterFormatCols = FORMATS_NEWSLETTER.map(f => `
    <td width="33%" style="vertical-align:top;padding:0 6px;">
      <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px;height:100%;">
        <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${BLACK};margin-bottom:8px;">${f.name}</div>
        <div style="font-family:${FONT};font-size:12px;color:${SLATE};line-height:1.6;margin-bottom:12px;">${f.desc}</div>
        <div style="border-top:1px solid ${BORDER};padding-top:10px;">
          <div style="font-family:${FONT};font-size:11px;color:${MUTED};margin-bottom:4px;">Ideale per: ${f.best}</div>
          <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${BLUE};">${f.ctr}</div>
        </div>
      </div>
    </td>
  `).join("");

  const siteFormatCols = FORMATS_SITE.map(f => `
    <td width="33%" style="vertical-align:top;padding:0 6px;">
      <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px;height:100%;">
        <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${BLACK};margin-bottom:8px;">${f.name}</div>
        <div style="font-family:${FONT};font-size:12px;color:${SLATE};line-height:1.6;margin-bottom:12px;">${f.desc}</div>
        <div style="border-top:1px solid ${BORDER};padding-top:10px;">
          <div style="font-family:${FONT};font-size:11px;color:${MUTED};margin-bottom:4px;">Ideale per: ${f.best}</div>
          <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${BLUE};">${f.reach}</div>
        </div>
      </div>
    </td>
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
<tr><td align="center" style="padding:32px 16px 48px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:${WHITE};padding:24px 32px;border-radius:16px 16px 0 0;border-bottom:1px solid ${BORDER};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:${FONT};font-size:22px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">ProofPress</div>
            <div style="font-family:${FONT};font-size:11px;color:${MUTED};margin-top:2px;letter-spacing:0.3px;">Media Kit & Pubblicità</div>
          </td>
          <td align="right">
            <div style="display:inline-block;background:${BLUE}18;color:${BLUE};font-family:${FONT};font-size:11px;font-weight:600;padding:5px 14px;border-radius:20px;">Opportunità ADV</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:${WHITE};padding:52px 32px 44px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">Pubblicità su ProofPress</div>
      <h1 style="margin:0 0 20px;font-family:${FONT};font-size:40px;font-weight:700;color:${BLACK};line-height:1.1;letter-spacing:-0.8px;">Raggiungi i decision maker<br>dell'AI e del business.</h1>
      <p style="margin:0 0 20px;font-family:${FONT};font-size:18px;color:${SLATE};line-height:1.55;">ProofPress è il media di riferimento per imprenditori, manager e investitori che vogliono capire come l'intelligenza artificiale sta ridisegnando il business.</p>
      <p style="margin:0 0 20px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Il tuo brand davanti al pubblico giusto, nel momento giusto. Non su un feed che scorre — in una newsletter che viene letta. Non su una piattaforma generica — su un media specializzato dove ogni lettore ha scelto attivamente di essere informato sull'AI.</p>
      <p style="margin:0 0 36px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Con un open rate del 45% — il doppio della media di settore — e un pubblico composto per il 67% da C-level, founder e investitori, ProofPress offre un accesso diretto a chi prende decisioni di acquisto con budget significativi.</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:14px;">
            <a href="https://proofpress.ai/pubblicita?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="display:inline-block;background:${BLUE};color:#fff;font-family:${FONT};font-size:15px;font-weight:600;padding:14px 26px;border-radius:980px;text-decoration:none;">Richiedi il media kit →</a>
          </td>
          <td>
            <a href="mailto:info@proofpress.ai?subject=Richiesta%20media%20kit%20ProofPress" style="font-family:${FONT};font-size:15px;font-weight:500;color:${BLUE};text-decoration:none;">Scrivi a info@proofpress.ai →</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- NUMERI -->
  <tr>
    <td style="background:${BG};padding:32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;">I numeri di ProofPress</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>${statCards}</tr>
      </table>
      <div style="margin-top:14px;text-align:center;">
        <div style="font-family:${FONT};font-size:12px;color:${MUTED};">Open rate 2× la media di settore (22%) · Pubblico qualificato e attivo · Crescita organica</div>
      </div>
    </td>
  </tr>

  <!-- PERCHÉ PROOFPRESS -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Il contesto</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;line-height:1.2;">Perché il pubblico di ProofPress è diverso.</h2>
      <p style="margin:0 0 18px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Non tutti i media sono uguali. La differenza non è solo nel numero di lettori — è nella qualità dell'attenzione e nel profilo di chi legge. ProofPress non è un aggregatore di notizie: è un media specializzato che i lettori hanno scelto attivamente per restare aggiornati sull'AI e sul business.</p>
      <p style="margin:0 0 18px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Il 67% del pubblico è composto da C-level, founder e investitori. Non sono lettori passivi — sono professionisti che usano ProofPress come strumento di lavoro quotidiano. Leggono con attenzione, condividono i contenuti rilevanti e prendono decisioni di acquisto basate su ciò che leggono.</p>
      <p style="margin:0 0 0;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Un open rate del 45% significa che quasi 1 iscritto su 2 apre ogni newsletter. La media di settore è 22%. Questa differenza non è casuale — è il risultato di contenuti verificati, curati e rilevanti per un pubblico che ha scelto di essere informato.</p>
    </td>
  </tr>

  <!-- PROFILO DEL PUBBLICO -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Il pubblico</div>
      <h2 style="margin:0 0 8px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Chi legge ProofPress ogni giorno.</h2>
      <p style="margin:0 0 24px;font-family:${FONT};font-size:14px;color:${MUTED};">6.000+ iscritti alla newsletter · 100.000+ visite mensili al sito · Crescita organica, nessuna pubblicità</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${audienceCards}
      </table>
    </td>
  </tr>

  <!-- FORMATI NEWSLETTER -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Formati disponibili</div>
      <h2 style="margin:0 0 8px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Newsletter · 6.000+ iscritti</h2>
      <p style="margin:0 0 20px;font-family:${FONT};font-size:14px;color:${MUTED};">Inviata lunedì, mercoledì e venerdì. Open rate 45%. 3 formati disponibili.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>${newsletterFormatCols}</tr>
      </table>
    </td>
  </tr>

  <!-- FORMATI SITO -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <h2 style="margin:0 0 8px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Sito web · 100.000+ visite/mese</h2>
      <p style="margin:0 0 20px;font-family:${FONT};font-size:14px;color:${MUTED};">proofpress.ai · Traffico organico · 3 posizioni disponibili</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>${siteFormatCols}</tr>
      </table>
    </td>
  </tr>

  <!-- CTA INTERMEDIO -->
  <tr>
    <td style="background:${WHITE};padding:32px;text-align:center;">
      <div style="font-family:${FONT};font-size:15px;color:${SLATE};margin-bottom:8px;">Vuoi sapere quale formato è giusto per il tuo obiettivo?</div>
      <div style="font-family:${FONT};font-size:14px;color:${MUTED};margin-bottom:20px;">Rispondiamo entro 24 ore lavorative con una proposta personalizzata.</div>
      <a href="https://proofpress.ai/pubblicita?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita_mid" style="display:inline-block;background:${BLUE};color:#fff;font-family:${FONT};font-size:14px;font-weight:600;padding:12px 24px;border-radius:980px;text-decoration:none;">Richiedi il media kit →</a>
    </td>
  </tr>

  <!-- CASI D'USO CAMPAGNE -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Campagne reali</div>
      <h2 style="margin:0 0 8px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Tre campagne. Tre risultati misurabili.</h2>
      <p style="margin:0 0 24px;font-family:${FONT};font-size:14px;color:${MUTED};">Obiettivo, formato, durata e risultato di tre campagne reali su ProofPress.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${campaignCards}
      </table>
    </td>
  </tr>

  <!-- TESTIMONIAL -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Chi ha già investito</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Risultati reali dai nostri advertiser.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${testimonialCards}
      </table>
    </td>
  </tr>

  <!-- FAQ -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Domande frequenti</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Quattro dubbi. Quattro risposte.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">Qual è il budget minimo per iniziare?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">Non esiste un budget minimo fisso — dipende dal formato e dalla durata. Il mid placement newsletter per una settimana è accessibile anche per startup early stage. Il media kit include tutte le tariffe aggiornate. Scrivici e ti proponiamo la soluzione più adatta al tuo budget e obiettivo.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">Chi scrive il contenuto per il native content?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">Il team editoriale di ProofPress. Tu fornisci il brief (obiettivo, prodotto, target, messaggi chiave), noi scriviamo il contenuto in linea con il tono editoriale di ProofPress. Ricevi una bozza per approvazione prima della pubblicazione. Il contenuto è scritto per essere letto, non per sembrare pubblicità.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">Quali metriche ricevo dopo la campagna?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">Report completo con: impression, click, CTR, aperture (per newsletter), tempo di lettura (per articoli sponsorizzati), confronto con benchmark di settore. Per campagne di lungo periodo, report settimanale durante la campagna e report finale con raccomandazioni.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 0 0;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">Quanto tempo prima devo prenotare?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">Le posizioni top placement newsletter vengono prenotate con 2-3 settimane di anticipo. Per campagne integrate (newsletter + sito + native content), consigliamo 3-4 settimane per la pianificazione e produzione del contenuto. Contattaci prima possibile per verificare la disponibilità nelle date che ti interessano.</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA FINALE -->
  <tr>
    <td style="background:${BLACK};padding:52px 32px;border-radius:0 0 16px 16px;text-align:center;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">Inizia oggi</div>
      <h2 style="margin:0 0 14px;font-family:${FONT};font-size:30px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;">Pronto a raggiungere il tuo pubblico?</h2>
      <p style="margin:0 0 32px;font-family:${FONT};font-size:15px;color:rgba(255,255,255,0.55);line-height:1.65;">Scrivici per ricevere il media kit completo con tariffe, disponibilità e case study.<br>Risponderemo entro 24 ore lavorative con una proposta personalizzata.</p>
      <a href="https://proofpress.ai/pubblicita?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita_final" style="display:inline-block;background:#ffffff;color:${BLACK};font-family:${FONT};font-size:15px;font-weight:600;padding:15px 30px;border-radius:980px;text-decoration:none;margin-bottom:20px;">Richiedi il media kit →</a>
      <div>
        <a href="mailto:info@proofpress.ai?subject=Richiesta%20media%20kit%20ProofPress" style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;">Scrivi direttamente a info@proofpress.ai</a>
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
            <div style="font-family:${FONT};font-size:12px;color:${MUTED};">
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:${MUTED};text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:${MUTED};text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:${MUTED};text-decoration:none;">Startup</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/pubblicita?utm_source=newsletter&utm_medium=email&utm_campaign=promo_pubblicita" style="color:${MUTED};text-decoration:none;">Pubblicità</a>
            </div>
          </td>
          <td align="right">
            <div style="font-family:${FONT};font-size:11px;color:${MUTED};">
              Hai ricevuto questa email perché sei iscritto a ProofPress.<br>
              <a href="https://proofpress.ai/unsubscribe?email={{email}}" style="color:${MUTED};">Disiscriviti</a>
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
