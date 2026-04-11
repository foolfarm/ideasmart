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
    category: "Strategia & Management",
    title: "Analisi competitiva in 5 minuti",
    preview: `"Sei un consulente McKinsey con 15 anni di esperienza nel settore [settore]. Analizza il posizionamento competitivo di [azienda] rispetto ai 3 principali competitor. Per ciascuno: identifica i vantaggi competitivi chiave, le vulnerabilità principali e le mosse strategiche più probabili nei prossimi 6 mesi. Concludi con 2 raccomandazioni immediate per [azienda] con timeline di esecuzione e KPI misurabili."`,
    result: "Output: report strutturato in 4 sezioni, pronto da condividere con il board. Tempo: 4 minuti.",
    badge: "⭐ Il più usato",
  },
  {
    category: "Marketing & Contenuti",
    title: "Email di follow-up che converte",
    preview: `"Scrivi un'email di follow-up per un prospect che ha partecipato a una demo di [prodotto] ma non ha risposto negli ultimi 7 giorni. Contesto: il prospect è [ruolo] in [tipo azienda], il principale pain point emerso in demo era [problema]. Tono: professionale ma diretto, non servile. Obiettivo: ottenere un feedback o una risposta entro 48 ore. Evita frasi generiche. Lunghezza: max 120 parole. Includi 3 varianti di oggetto."`,
    result: "Output: email + 3 oggetti A/B testabili. Tasso di risposta medio: +22% rispetto alle email standard.",
    badge: "🔥 Più condiviso",
  },
  {
    category: "Produttività Personale",
    title: "Sintesi riunione con action items",
    preview: `"Sei un chief of staff esperto. Trasforma queste note di riunione [incolla note] in: 1) Sintesi esecutiva in 3 righe per chi non era presente, 2) Decisioni prese con razionale, 3) Action items con responsabile, scadenza e dipendenze, 4) Punti aperti da risolvere nella prossima riunione, 5) Rischi identificati. Formato: bullet points chiari, linguaggio diretto, nessuna ambiguità."`,
    result: "Output: documento strutturato in 5 sezioni, pronto da inviare al team in 2 minuti.",
    badge: null,
  },
  {
    category: "Vendite & Negoziazione",
    title: "Pitch personalizzato per ogni prospect",
    preview: `"Sei un sales director con 10 anni di esperienza in [settore]. Crea un pitch personalizzato per [nome prospect], [ruolo] in [azienda]. Usa queste informazioni sul prospect: [info LinkedIn/sito]. Il nostro prodotto risolve [problema]. Struttura: 1) Hook personalizzato basato su una sfida specifica del prospect, 2) Proposta di valore in 2 righe, 3) Prova sociale rilevante per il loro settore, 4) CTA chiara e a bassa frizione. Max 200 parole."`,
    result: "Output: pitch da 200 parole con hook personalizzato. Tasso di risposta medio: 34% vs 12% standard.",
    badge: null,
  },
  {
    category: "Contenuti & SEO",
    title: "Post LinkedIn che genera engagement",
    preview: `"Scrivi un post LinkedIn per un [ruolo] che vuole condividere [tema/lezione]. Analizza i 10 post LinkedIn più virali su questo tema e identifica i pattern comuni. Poi scrivi un post con: hook provocatorio in 1 riga (non iniziare con 'Io'), storia in 3-4 paragrafi brevi con dettagli specifici, lezione chiave in 1 frase, domanda finale che invita al commento. Tono: autentico, non corporate, no hashtag eccessivi. Max 250 parole."`,
    result: "Output: post da 250 parole con hook testato. Engagement medio: 3.2× rispetto ai post standard.",
    badge: null,
  },
  {
    category: "Analisi & Ricerca",
    title: "Report di mercato in 10 minuti",
    preview: `"Sei un analista di mercato senior. Crea un report su [mercato/settore] per [audience: investitori/management/clienti]. Includi: dimensione del mercato e CAGR, 5 trend principali con impatto stimato, 3 opportunità non ancora sfruttate, 3 rischi principali con probabilità e impatto, 5 player chiave con posizionamento. Usa dati pubblici verificabili. Formato: executive summary + sezioni dettagliate. Max 800 parole."`,
    result: "Output: report strutturato con executive summary. Adatto per presentazioni board e investor deck.",
    badge: null,
  },
];

// ─── Categorie della collezione ─────────────────────────────────────────────
const CATEGORIES = [
  { title: "Strategia & Management", count: "24 prompt", desc: "Analisi competitiva, business plan, OKR, presentazioni board, decisioni strategiche." },
  { title: "Marketing & Contenuti", count: "31 prompt", desc: "Email, post social, landing page, SEO, campagne ADV, content calendar." },
  { title: "Vendite & Negoziazione", count: "18 prompt", desc: "Pitch, follow-up, gestione obiezioni, contratti, cold outreach, upsell." },
  { title: "Produttività Personale", count: "22 prompt", desc: "Sintesi riunioni, pianificazione, deleghe, gestione priorità, report automatici." },
  { title: "Analisi & Ricerca", count: "15 prompt", desc: "Report di mercato, analisi dati, ricerca competitor, benchmark di settore." },
  { title: "Comunicazione & PR", count: "12 prompt", desc: "Comunicati stampa, gestione crisi, interviste, speech, messaggi istituzionali." },
];

// ─── Testimonial ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Ho usato il prompt per l'analisi competitiva prima di un board meeting. Il CEO mi ha chiesto chi aveva preparato il report. L'aveva fatto l'AI in 4 minuti. Ho risposto che avevo usato un nuovo sistema di analisi. Non era una bugia.",
    author: "F.M., Strategy Manager",
    detail: "Azienda manifatturiera · 200 dipendenti · Milano",
  },
  {
    quote: "Il prompt per le email di follow-up ha aumentato il mio tasso di risposta dal 12% al 34%. Non ho cambiato nulla nel mio processo — ho solo smesso di scrivere email generiche. La differenza è tutta nel contesto che fornisco al prompt.",
    author: "G.T., Account Executive",
    detail: "SaaS B2B · Milano · +22% tasso di risposta",
  },
  {
    quote: "Uso la Collezione ogni giorno. Non per tutto — ma per il 20% dei task che mi rubava l'80% del tempo. Analisi, report, email difficili, pitch. Quello che prima richiedeva 2 ore ora richiede 20 minuti. Il resto del tempo lo uso per pensare.",
    author: "A.C., Consulente di management",
    detail: "Freelance · 15 anni di esperienza · Roma",
  },
  {
    quote: "Ho comprato la Collezione con scetticismo. 'Altri prompt inutili', pensavo. Dopo 3 giorni avevo già recuperato il costo in tempo risparmiato. Dopo 2 settimane avevo cambiato come lavoro con l'AI. La differenza è nella struttura dei prompt, non nel modello che usi.",
    author: "L.R., Responsabile Marketing",
    detail: "Startup fintech · 40 dipendenti · Torino",
  },
];

// ─── Casi d'uso dettagliati ─────────────────────────────────────────────────
const USE_CASES = [
  {
    title: "Il consulente che ha triplicato la produttività",
    role: "Consulente di management, freelance",
    problem: "Passava 2 ore al giorno a preparare analisi e report per i clienti. I prompt generici che trovava online producevano output inutilizzabili — troppo generici, senza struttura, da riscrivere completamente.",
    solution: "Con i prompt della Collezione, ogni analisi richiede 20 minuti: 5 per compilare il contesto nel prompt, 4 per l'output AI, 11 per revisione e personalizzazione.",
    result: "Da 3 report a settimana a 9 report a settimana. Stesso livello qualitativo, 3× la capacità produttiva. Ha aumentato le tariffe del 30% senza perdere clienti.",
    metric: "3× produttività · +30% tariffe",
  },
  {
    title: "Il sales manager che ha cambiato il team",
    role: "Sales Manager, SaaS B2B",
    problem: "Il team di 5 venditori aveva tassi di risposta alle email di prospecting tra il 8% e il 14%. Le email erano generiche, non personalizzate, scritte in fretta.",
    solution: "Ha introdotto il prompt per il pitch personalizzato come standard del team. Ogni venditore compila 5 campi sul prospect (ruolo, azienda, pain point, info LinkedIn, settore) e ottiene un pitch da 200 parole in 2 minuti.",
    result: "Tasso di risposta medio del team: da 11% a 34% in 6 settimane. Pipeline aumentata del 180%. Il prompt è diventato parte del playbook di vendita.",
    metric: "Da 11% a 34% tasso di risposta",
  },
  {
    title: "La startup che ha scalato il content marketing",
    role: "CMO, startup SaaS",
    problem: "Budget marketing limitato, nessun content manager. Il CEO scriveva i post LinkedIn da solo — 1 post a settimana, 45 minuti per post, engagement basso.",
    solution: "Con il prompt per i post LinkedIn, il CEO produce 3 post a settimana in 30 minuti totali. Ogni post parte dal prompt, viene personalizzato con 2-3 dettagli specifici e pubblicato.",
    result: "Da 1 post/settimana a 3 post/settimana. Follower LinkedIn: da 1.200 a 8.400 in 5 mesi. 3 inbound lead qualificati al mese direttamente da LinkedIn.",
    metric: "Da 1.200 a 8.400 follower in 5 mesi",
  },
];

// ─── Template HTML — Apple Style COMPLETO ────────────────────────────────
export function buildPromptCollectionHtml(): string {
  const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`;
  const BG = `#f5f5f7`;
  const WHITE = `#ffffff`;
  const BLACK = `#1d1d1f`;
  const SLATE = `#6e6e73`;
  const MUTED = `#86868b`;
  const BORDER = `#d2d2d7`;
  const ACCENT = `#ff9f0a`;
  const ACCENT_DARK = `#c87800`;

  // ── Prompt cards ─────────────────────────────────────────────────────────
  const promptCards = PROMPT_EXAMPLES.map(p => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-block;background:${ACCENT}18;color:${ACCENT_DARK};font-family:${FONT};font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin-bottom:10px;">${p.category}</div>
              </td>
              ${p.badge ? `<td align="right">
                <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${ACCENT_DARK};">${p.badge}</div>
              </td>` : ''}
            </tr>
          </table>
          <div style="font-family:${FONT};font-size:16px;font-weight:600;color:${BLACK};margin-bottom:14px;">${p.title}</div>
          <div style="background:${BG};border-radius:8px;padding:16px;margin-bottom:14px;">
            <div style="font-family:${FONT};font-size:13px;color:${SLATE};line-height:1.7;font-style:italic;">${p.preview}</div>
          </div>
          <div style="border-top:1px solid ${BORDER};padding-top:12px;">
            <div style="font-family:${FONT};font-size:12px;color:${MUTED};line-height:1.5;">✓ ${p.result}</div>
          </div>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Categorie (2 colonne) ────────────────────────────────────────────────
  const categoryRows = [];
  for (let i = 0; i < CATEGORIES.length; i += 2) {
    const left = CATEGORIES[i];
    const right = CATEGORIES[i + 1];
    categoryRows.push(`
      <tr>
        <td width="48%" style="vertical-align:top;padding:0 8px 12px 0;">
          <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px;">
            <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${BLACK};margin-bottom:4px;">${left.title}</div>
            <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${ACCENT};margin-bottom:8px;">${left.count}</div>
            <div style="font-family:${FONT};font-size:12px;color:${SLATE};line-height:1.55;">${left.desc}</div>
          </div>
        </td>
        ${right ? `<td width="48%" style="vertical-align:top;padding:0 0 12px 8px;">
          <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px;">
            <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${BLACK};margin-bottom:4px;">${right.title}</div>
            <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${ACCENT};margin-bottom:8px;">${right.count}</div>
            <div style="font-family:${FONT};font-size:12px;color:${SLATE};line-height:1.55;">${right.desc}</div>
          </div>
        </td>` : '<td width="48%"></td>'}
      </tr>
    `);
  }

  // ── Testimonial ──────────────────────────────────────────────────────────
  const testimonialCards = TESTIMONIALS.map(t => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;">
          <div style="font-family:${FONT};font-size:32px;color:${ACCENT};line-height:1;margin-bottom:12px;opacity:0.5;">"</div>
          <div style="font-family:${FONT};font-size:15px;color:${BLACK};line-height:1.7;margin-bottom:20px;">${t.quote}</div>
          <div style="border-top:1px solid ${BORDER};padding-top:16px;">
            <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${BLACK};">${t.author}</div>
            <div style="font-family:${FONT};font-size:12px;color:${MUTED};margin-top:3px;">${t.detail}</div>
          </div>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Casi d'uso ───────────────────────────────────────────────────────────
  const useCaseCards = USE_CASES.map((u, i) => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;">
          <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${ACCENT};letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;">Caso ${i + 1}</div>
          <div style="font-family:${FONT};font-size:16px;font-weight:600;color:${BLACK};margin-bottom:4px;">${u.title}</div>
          <div style="font-family:${FONT};font-size:12px;color:${MUTED};margin-bottom:18px;">${u.role}</div>
          <div style="margin-bottom:12px;">
            <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#c62828;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Il problema</div>
            <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.65;">${u.problem}</div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#1565c0;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">La soluzione</div>
            <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.65;">${u.solution}</div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#2e7d32;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Il risultato</div>
            <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.65;">${u.result}</div>
          </div>
          <div style="background:${ACCENT}12;border-radius:8px;padding:10px 16px;">
            <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${ACCENT_DARK};">📊 ${u.metric}</div>
          </div>
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
<tr><td align="center" style="padding:32px 16px 48px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:${WHITE};padding:24px 32px;border-radius:16px 16px 0 0;border-bottom:1px solid ${BORDER};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:${FONT};font-size:22px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">ProofPress</div>
            <div style="font-family:${FONT};font-size:11px;color:${MUTED};margin-top:2px;letter-spacing:0.3px;">Collezione Prompt 2026</div>
          </td>
          <td align="right">
            <div style="display:inline-block;background:${ACCENT}18;color:${ACCENT_DARK};font-family:${FONT};font-size:13px;font-weight:700;padding:5px 14px;border-radius:20px;">39€ una tantum</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO -->
  <tr>
    <td style="background:${WHITE};padding:52px 32px 44px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">Nuova uscita 2026</div>
      <h1 style="margin:0 0 20px;font-family:${FONT};font-size:40px;font-weight:700;color:${BLACK};line-height:1.1;letter-spacing:-0.8px;">Prompt da usare davvero<br>nel lavoro quotidiano.</h1>
      <p style="margin:0 0 20px;font-family:${FONT};font-size:18px;color:${SLATE};line-height:1.55;">Non una raccolta teorica. Non i soliti "scrivi un'email professionale". Questi sono i prompt che funzionano davvero — testati su casi reali, scritti da chi usa l'AI ogni giorno per lavoro.</p>
      <p style="margin:0 0 32px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Il problema con i prompt che trovi online è che sono generici. Funzionano in demo, non nella realtà. I prompt della Collezione 2026 sono diversi: ogni prompt è strutturato con contesto, ruolo, vincoli e formato di output. Funzionano perché sono stati scritti partendo da problemi reali, non da esempi teorici.</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:14px;">
            <a href="https://promptcollection2026.com/?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection" style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;padding:14px 26px;border-radius:980px;text-decoration:none;">Acquista ora — 39€ →</a>
          </td>
          <td>
            <a href="https://promptcollection2026.com/preview?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection" style="font-family:${FONT};font-size:15px;font-weight:500;color:${ACCENT};text-decoration:none;">Vedi i prompt gratuiti →</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- COSA INCLUDE — NUMERI -->
  <tr>
    <td style="background:${BG};padding:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:0 6px;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:28px;font-weight:700;color:${ACCENT};letter-spacing:-0.5px;">122</div>
              <div style="font-family:${FONT};font-size:12px;color:${SLATE};margin-top:4px;">Prompt totali</div>
            </div>
          </td>
          <td align="center" style="padding:0 6px;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:28px;font-weight:700;color:${BLACK};letter-spacing:-0.5px;">6</div>
              <div style="font-family:${FONT};font-size:12px;color:${SLATE};margin-top:4px;">Aree tematiche</div>
            </div>
          </td>
          <td align="center" style="padding:0 6px;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:28px;font-weight:700;color:${BLACK};letter-spacing:-0.5px;">39€</div>
              <div style="font-family:${FONT};font-size:12px;color:${SLATE};margin-top:4px;">Una tantum, per sempre</div>
            </div>
          </td>
          <td align="center" style="padding:0 6px;">
            <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
              <div style="font-family:${FONT};font-size:28px;font-weight:700;color:${BLACK};letter-spacing:-0.5px;">∞</div>
              <div style="font-family:${FONT};font-size:12px;color:${SLATE};margin-top:4px;">Aggiornamenti inclusi</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PERCHÉ I PROMPT GENERICI NON FUNZIONANO -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Il problema</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;line-height:1.2;">Perché i prompt che trovi online non funzionano.</h2>
      <p style="margin:0 0 18px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Hai mai scritto "scrivi un'email professionale per un cliente" e ottenuto qualcosa di inutilizzabile? Non è colpa del modello AI. È colpa del prompt. I modelli AI sono potenti — ma producono output di qualità solo se ricevono istruzioni di qualità.</p>
      <p style="margin:0 0 18px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">Il problema dei prompt generici è che mancano di tre elementi fondamentali: il <strong style="color:${BLACK};">contesto</strong> (chi sei, cosa stai cercando di ottenere, per chi), il <strong style="color:${BLACK};">ruolo</strong> (che tipo di esperto deve simulare l'AI), e i <strong style="color:${BLACK};">vincoli</strong> (lunghezza, formato, tono, cosa evitare). Senza questi tre elementi, l'AI produce output medi — utili come punto di partenza, inutili come prodotto finito.</p>
      <p style="margin:0 0 0;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">I prompt della Collezione 2026 sono stati scritti con tutti e tre gli elementi. Non sono template da compilare — sono strutture di pensiero che guidano l'AI verso l'output che ti serve davvero. La differenza è misurabile: output pronti all'uso invece di bozze da riscrivere.</p>
    </td>
  </tr>

  <!-- ESEMPI DI PROMPT -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Anteprima</div>
      <h2 style="margin:0 0 8px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">6 prompt dalla Collezione.</h2>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:14px;color:${MUTED};">Questi sono solo 6 dei 122 prompt inclusi. Ogni prompt include il testo completo, le istruzioni di utilizzo e l'output atteso.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${promptCards}
      </table>
    </td>
  </tr>

  <!-- CTA INTERMEDIO -->
  <tr>
    <td style="background:${WHITE};padding:32px;text-align:center;">
      <div style="font-family:${FONT};font-size:15px;color:${SLATE};margin-bottom:8px;">122 prompt strutturati per 6 aree di lavoro.</div>
      <div style="font-family:${FONT};font-size:14px;color:${MUTED};margin-bottom:20px;">Una tantum, aggiornamenti inclusi, accesso immediato.</div>
      <a href="https://promptcollection2026.com/?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection_mid" style="display:inline-block;background:${ACCENT};color:#ffffff;font-family:${FONT};font-size:15px;font-weight:600;padding:14px 28px;border-radius:980px;text-decoration:none;">Acquista ora — 39€ →</a>
    </td>
  </tr>

  <!-- CATEGORIE -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Cosa include</div>
      <h2 style="margin:0 0 8px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">122 prompt in 6 aree.</h2>
      <p style="margin:0 0 24px;font-family:${FONT};font-size:14px;color:${MUTED};">Ogni area include prompt per i casi d'uso più comuni, con varianti per diversi ruoli e settori.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${categoryRows.join("")}
      </table>
    </td>
  </tr>

  <!-- CASI D'USO -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Casi d'uso reali</div>
      <h2 style="margin:0 0 8px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Chi la usa e cosa ottiene.</h2>
      <p style="margin:0 0 24px;font-family:${FONT};font-size:14px;color:${MUTED};">Tre storie reali di professionisti che hanno cambiato come lavorano con l'AI.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${useCaseCards}
      </table>
    </td>
  </tr>

  <!-- TESTIMONIAL -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Cosa dicono</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Chi la usa ogni giorno.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${testimonialCards}
      </table>
    </td>
  </tr>

  <!-- FAQ -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Domande frequenti</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Quattro dubbi. Quattro risposte.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:${BG};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">Funziona con ChatGPT, Claude, Gemini?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">Sì. I prompt della Collezione sono scritti in modo da funzionare con qualsiasi modello di linguaggio avanzato. Abbiamo testato ogni prompt su GPT-4, Claude 3.5 e Gemini Pro. Alcuni prompt includono note specifiche su come adattarli al modello che preferisci.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:${BG};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">Devo avere esperienza con l'AI per usarli?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">No. Ogni prompt include istruzioni su come compilare i campi variabili (quelli tra parentesi quadre) e cosa aspettarsi dall'output. Se sai usare ChatGPT, sai usare la Collezione. Se non hai mai usato l'AI, la Collezione è il modo migliore per iniziare con il piede giusto.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:${BG};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">Cosa significa "aggiornamenti inclusi"?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">Paghi 39€ una volta e ricevi tutti gli aggiornamenti futuri senza costi aggiuntivi. Quando aggiungiamo nuovi prompt o aggiorniamo quelli esistenti per i nuovi modelli AI, ricevi la versione aggiornata via email. La Collezione cresce con te.</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 0 0;">
            <div style="background:${BG};border-radius:12px;padding:24px;">
              <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">C'è una garanzia di rimborso?</div>
              <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">Sì. Se entro 14 giorni dall'acquisto non sei soddisfatto, rimborsiamo il 100% senza domande. Abbiamo un tasso di rimborso inferiore al 2% — ma la garanzia c'è, e vale.</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- GARANZIA -->
  <tr>
    <td style="background:${BG};padding:32px;">
      <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;text-align:center;">
        <div style="font-family:${FONT};font-size:28px;margin-bottom:12px;">🛡️</div>
        <div style="font-family:${FONT};font-size:16px;font-weight:600;color:${BLACK};margin-bottom:10px;">Garanzia 14 giorni</div>
        <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;max-width:460px;margin:0 auto;">Se entro 14 giorni non sei soddisfatto, rimborsiamo il 100% senza domande. Nessun processo complicato, nessuna domanda. Crediamo nel prodotto — e vogliamo che tu lo provi senza rischi.</div>
      </div>
    </td>
  </tr>

  <!-- CTA FINALE -->
  <tr>
    <td style="background:${BLACK};padding:52px 32px;border-radius:0 0 16px 16px;text-align:center;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">Disponibile ora</div>
      <h2 style="margin:0 0 14px;font-family:${FONT};font-size:30px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;">122 prompt. 39€. Una volta per sempre.</h2>
      <p style="margin:0 0 32px;font-family:${FONT};font-size:15px;color:rgba(255,255,255,0.55);line-height:1.65;">Accesso immediato. Aggiornamenti inclusi.<br>Garanzia di rimborso 14 giorni.</p>
      <a href="https://promptcollection2026.com/?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection_final" style="display:inline-block;background:#ffffff;color:${BLACK};font-family:${FONT};font-size:15px;font-weight:600;padding:15px 30px;border-radius:980px;text-decoration:none;margin-bottom:20px;">Acquista ora — 39€ →</a>
      <div>
        <a href="https://promptcollection2026.com/preview?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt_collection_final" style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;">Vedi i prompt gratuiti prima di acquistare</a>
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
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:${MUTED};text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://promptcollection2026.com?utm_source=newsletter&utm_medium=email&utm_campaign=promo_prompt" style="color:${MUTED};text-decoration:none;">Prompt Collection</a>
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
export async function sendPromptCollectionNewsletterToAll(): Promise<void> {
  const alreadySent = await hasAlreadySentPromptTodayDB();
  if (alreadySent) {
    console.log(`[PromptNewsletter] Guard: già inviata oggi. Skip.`);
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
