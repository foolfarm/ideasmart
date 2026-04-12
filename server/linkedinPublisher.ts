/**
 * Proof Press — LinkedIn Autopost
 *
 * Pubblica 5 post giornalieri su LinkedIn:
 *  - Slot MORNING:           10:00 CET — AI News (analisi strategica AI)
 *  - Slot AI-RESEARCH-MORNING: 12:30 CET — 2° Editoriale AI (ricerche di mercato AI)
 *  - Slot RESEARCH:          14:30 CET — 2° AI News (notizia AI diversa dal mattino)
 *  - Slot RESEARCH-AFTERNOON: 16:00 CET — 2° Ricerche di mercato (Gartner, McKinsey, ecc.)
 *  - Slot STARTUP-EVENING:   18:00 CET — Startup News (round investimento, exit, startup IT/EU)
 *
 * Flusso per ogni slot:
 *  1. Recupera il contenuto appropriato (editoriale, ricerca o deal)
 *  2. Cerca dati/statistiche da fonti di market intelligence
 *  3. Cerca immagine pertinente da feed RSS o Pexels
 *  4. Genera il testo del post con LLM in stile senior analyst
 *  5. Carica l'immagine su LinkedIn e pubblica il post (formato IMAGE)
 */

import { createHash } from "crypto";
import { ENV } from "./_core/env";
import { invokeLLM, sanitizeForLinkedIn } from "./_core/llm";
import { getLatestEditorial, getDb, getLatestNews, saveEditorial } from "./db";
import { getMarketIntelligence, type MarketIntelligenceResult } from "./marketIntelligence";
import { findEditorialImage } from "./stockImages";
import { linkedinPosts, researchReports, newsItems } from "../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { getTodayResearch } from "./researchGenerator";
import { generateAIToolRadarPost } from "./aiToolRadar";
import { generateStartupRadarPost_main } from "./startupRadar";

// ── Timezone CET/CEST ────────────────────────────────────────────────────────
const TZ_ROME = "Europe/Rome";

/**
 * Restituisce la data corrente nel fuso orario Europe/Rome (CET/CEST)
 * nel formato YYYY-MM-DD.
 */
function getTodayCET(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: TZ_ROME }); // sv-SE = YYYY-MM-DD
}

/**
 * Calcola l'hash SHA-256 del testo del post (primi 500 caratteri normalizzati).
 */
function computePostHash(text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500);
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

/**
 * Calcola la similarità di Jaccard tra due testi basandosi sui token (parole).
 * Restituisce un valore tra 0 (completamente diversi) e 1 (identici).
 * Ignora stopword comuni italiane e inglesi per un confronto più significativo.
 */
const STOPWORDS = new Set([
  "il","lo","la","i","gli","le","un","uno","una","di","a","da","in","con","su","per","tra","fra",
  "e","o","ma","se","che","non","è","sono","ha","hanno","del","della","dei","degli","delle",
  "al","alla","ai","agli","alle","nel","nella","nei","negli","nelle","sul","sulla","sui",
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","are",
  "was","were","be","been","being","have","has","had","do","does","did","will","would","could",
  "should","may","might","shall","can","this","that","these","those","it","its","we","they",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-zàèéìòùa-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOPWORDS.has(w))
  );
}

function jaccardSimilarity(textA: string, textB: string): number {
  const setA = tokenize(textA);
  const setB = tokenize(textB);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  Array.from(setA).forEach(token => {
    if (setB.has(token)) intersection++;
  });
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const SITE_BASE_URL = "https://proofpress.ai";

// ── In-memory cache immagini usate oggi (per evitare duplicati tra slot) ────
const todayImageCache: Set<string> = new Set();
let todayImageCacheDate = "";

// ── In-memory TOPIC LOCK: titoli già usati oggi in qualsiasi slot ────────────
// Previene duplicati anche quando il DB non ha ancora committato il post precedente
const todayTopicLock: Set<string> = new Set();
let todayTopicLockDate = "";

/**
 * Registra un titolo come usato oggi nel topic lock in-memory.
 */
function lockTopic(title: string): void {
  const today = getTodayCET();
  if (todayTopicLockDate !== today) {
    todayTopicLock.clear();
    todayTopicLockDate = today;
  }
  todayTopicLock.add(title.toLowerCase().trim());
}

/**
 * Verifica se un titolo è già stato usato oggi (DB + cache in-memory).
 */
async function isTopicUsedToday(title: string): Promise<boolean> {
  const today = getTodayCET();
  if (todayTopicLockDate !== today) {
    todayTopicLock.clear();
    todayTopicLockDate = today;
  }
  const normalizedTitle = title.toLowerCase().trim();
  // 1. Controlla cache in-memory (per slot pubblicati nella stessa sessione)
  if (todayTopicLock.has(normalizedTitle)) return true;
  // 2. Controlla DB (per slot pubblicati in sessioni precedenti)
  try {
    const db = await getDb();
    if (db) {
      const existing = await db.select({ id: linkedinPosts.id })
        .from(linkedinPosts)
        .where(and(
          eq(linkedinPosts.dateLabel, today),
          eq(linkedinPosts.title, title)
        ))
        .limit(1);
      if (existing.length > 0) {
        todayTopicLock.add(normalizedTitle); // Sincronizza cache
        return true;
      }
    }
  } catch (err) {
    console.warn('[LinkedIn TopicLock] ⚠️ Errore verifica DB:', err);
  }
  return false;
}

/**
 * Carica tutti i titoli già pubblicati oggi dal DB nella cache in-memory.
 * Da chiamare all'inizio di ogni slot per sincronizzare lo stato.
 */
async function syncTopicLockFromDB(): Promise<void> {
  const today = getTodayCET();
  if (todayTopicLockDate !== today) {
    todayTopicLock.clear();
    todayTopicLockDate = today;
  }
  try {
    const db = await getDb();
    if (db) {
      const todayPosts = await db.select({ title: linkedinPosts.title })
        .from(linkedinPosts)
        .where(eq(linkedinPosts.dateLabel, today));
      for (const p of todayPosts) {
        if (p.title) todayTopicLock.add(p.title.toLowerCase().trim());
      }
      console.log(`[LinkedIn TopicLock] 🔒 Sincronizzati ${todayTopicLock.size} titoli già usati oggi`);
    }
  } catch (err) {
    console.warn('[LinkedIn TopicLock] ⚠️ Errore sync DB:', err);
  }
}

/**
 * Recupera TUTTE le immagini usate OGGI (da tutti gli slot) dal DB + cache in-memory.
 * Questo previene duplicati anche quando i post vengono pubblicati in rapida successione
 * e il DB non ha ancora committato.
 */
async function getTodayUsedImages(): Promise<string[]> {
  const today = getTodayCET();
  // Reset cache se è un nuovo giorno
  if (todayImageCacheDate !== today) {
    todayImageCache.clear();
    todayImageCacheDate = today;
  }
  const urls: string[] = Array.from(todayImageCache);
  try {
    const db = await getDb();
    if (db) {
      const todayPosts = await db.select({ imageUrl: linkedinPosts.imageUrl })
        .from(linkedinPosts)
        .where(eq(linkedinPosts.dateLabel, today));
      for (const p of todayPosts) {
        if (p.imageUrl) urls.push(p.imageUrl);
      }
    }
  } catch (err) {
    console.warn('[LinkedIn] ⚠️ Errore recupero immagini di oggi:', err);
  }
  return Array.from(new Set(urls));
}

/**
 * Registra un'immagine come usata oggi nella cache in-memory.
 */
function markImageUsedToday(url: string): void {
  const today = getTodayCET();
  if (todayImageCacheDate !== today) {
    todayImageCache.clear();
    todayImageCacheDate = today;
  }
  todayImageCache.add(url);
}

/**
 * AUDIT PRE-PUBBLICAZIONE: verifica che testo e immagine siano unici.
 * Blocca la pubblicazione se trova duplicati.
 */
async function auditPrePublish(postText: string, imageUrl: string | null, slot: LinkedInSlot): Promise<{
  pass: boolean;
  reason?: string;
}> {
  const today = getTodayCET();
  console.log(`[LinkedIn AUDIT] 🔍 Avvio audit pre-pubblicazione per slot ${slot}...`);
  
  try {
    const db = await getDb();
    if (!db) return { pass: true }; // Se DB non disponibile, procedi con cautela
    
    // 1. Controlla che l'immagine non sia già stata usata OGGI in qualsiasi slot
    if (imageUrl) {
      const todayImages = await getTodayUsedImages();
      if (todayImages.includes(imageUrl)) {
        console.warn(`[LinkedIn AUDIT] 🚫 IMMAGINE DUPLICATA: ${imageUrl} già usata oggi`);
        return { pass: false, reason: `Immagine già usata oggi in un altro slot` };
      }
    }
    
    // 2. Controlla che il testo non sia troppo simile a un post di oggi
    const postHash = computePostHash(postText);
    const todayDuplicates = await db.select({ id: linkedinPosts.id, slot: linkedinPosts.slot })
      .from(linkedinPosts)
      .where(and(
        eq(linkedinPosts.dateLabel, today),
        eq(linkedinPosts.postHash, postHash)
      ))
      .limit(1);
    if (todayDuplicates.length > 0) {
      console.warn(`[LinkedIn AUDIT] 🚫 TESTO DUPLICATO: hash ${postHash} già usato oggi nello slot ${todayDuplicates[0].slot}`);
      return { pass: false, reason: `Testo identico già pubblicato oggi (slot ${todayDuplicates[0].slot})` };
    }
    
    // 3. Controlla che l'immagine non sia stata usata negli ultimi 3 giorni
    if (imageUrl) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoLabel = threeDaysAgo.toLocaleDateString("sv-SE", { timeZone: TZ_ROME });
      const recentImageDuplicates = await db.select({ id: linkedinPosts.id, dateLabel: linkedinPosts.dateLabel })
        .from(linkedinPosts)
        .where(and(
          eq(linkedinPosts.imageUrl, imageUrl),
          gte(linkedinPosts.dateLabel, threeDaysAgoLabel)
        ))
        .limit(1);
      if (recentImageDuplicates.length > 0) {
        console.warn(`[LinkedIn AUDIT] 🚫 IMMAGINE RECENTE: ${imageUrl} usata il ${recentImageDuplicates[0].dateLabel}`);
        return { pass: false, reason: `Immagine già usata il ${recentImageDuplicates[0].dateLabel}` };
      }
    }
    
    // 4. Controllo similarità Jaccard sugli ultimi 30 giorni (soglia: 20%)
    // Blocca se il nuovo post è simile per più del 20% a qualsiasi post recente
    const SIMILARITY_THRESHOLD = 0.20; // 20% = blocca se troppo simile
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoLabel = thirtyDaysAgo.toLocaleDateString("sv-SE", { timeZone: TZ_ROME });
    const recentPosts = await db.select({ id: linkedinPosts.id, slot: linkedinPosts.slot, dateLabel: linkedinPosts.dateLabel, postText: linkedinPosts.postText })
      .from(linkedinPosts)
      .where(gte(linkedinPosts.dateLabel, thirtyDaysAgoLabel))
      .orderBy(desc(linkedinPosts.id))
      .limit(50);
    for (const recent of recentPosts) {
      if (!recent.postText) continue;
      const similarity = jaccardSimilarity(postText, recent.postText);
      if (similarity > SIMILARITY_THRESHOLD) {
        console.warn(`[LinkedIn AUDIT] 🚫 CONTENUTO TROPPO SIMILE: similarità ${(similarity * 100).toFixed(1)}% con post del ${recent.dateLabel} (slot ${recent.slot}) — soglia: ${(SIMILARITY_THRESHOLD * 100).toFixed(0)}%`);
        return { pass: false, reason: `Contenuto troppo simile (${(similarity * 100).toFixed(1)}%) a un post del ${recent.dateLabel}. Il post deve essere almeno ${((1 - SIMILARITY_THRESHOLD) * 100).toFixed(0)}% diverso dai contenuti recenti.` };
      }
    }

    console.log(`[LinkedIn AUDIT] ✅ Audit superato — testo e immagine unici, similarità OK`);
    return { pass: true };
  } catch (err) {
    console.warn('[LinkedIn AUDIT] ⚠️ Errore durante audit, procedo con cautela:', err);
    return { pass: true }; // In caso di errore, non bloccare
  }
}

// ── Slot giornalieri ─────────────────────────────────────────────────────────
export type LinkedInSlot = "morning" | "ai-research-morning" | "research" | "research-afternoon" | "dealroom" | "startup-afternoon" | "startup-evening" | "ai-tool-radar" | "afternoon" | "evening";

// ── Sezioni supportate per LinkedIn ──────────────────────────────────────────
type LinkedInSection = "ai" | "startup" | "dealroom" | "research";
const SUPPORTED_SECTIONS: Array<LinkedInSection> = ["ai", "startup", "dealroom", "research"];

const SECTION_META: Record<LinkedInSection, { label: string; hashtags: string[]; path: string }> = {
  ai: {
    label: "AI News",
    hashtags: ["#AI", "#ArtificialIntelligence", "#AIStrategy", "#DigitalTransformation", "#Proof Press", "#FutureOfWork", "#EnterpriseAI"],
    path: "/ai"
  },
  startup: {
    label: "Startup News",
    hashtags: ["#Startup", "#VentureCapital", "#Innovation", "#Entrepreneurship", "#Proof Press", "#TechEcosystem", "#StartupEurope"],
    path: "/startup"
  },
  dealroom: {
    label: "DEALROOM — Funding & VC",
    hashtags: ["#dealroom", "#funding", "#venturecapital", "#startup", "#investment", "#Proof Press"],
    path: "/dealroom"
  },
  research: {
    label: "Proof Press Research",
    hashtags: ["#research", "#AI", "#startup", "#venturecapital", "#marketanalysis", "#Proof Press", "#TechTrends"],
    path: "/research"
  }
};

// ── Mappa slot → sezione ────────────────────────────────────────────────────
function selectSection(slot: LinkedInSlot): LinkedInSection {
  if (slot === "morning") return "ai";
  if (slot === "ai-research-morning") return "ai";
  if (slot === "research") return "research";
  if (slot === "research-afternoon") return "research";
  if (slot === "startup-afternoon") return "startup";
  if (slot === "startup-evening") return "startup";
  if (slot === "ai-tool-radar") return "ai";
  if (slot === "dealroom") return "dealroom";
  // Legacy slots
  if (slot === "afternoon") return "ai";
  return "startup"; // evening legacy
}

// ── Prompt LLM: stile senior analyst ────────────────────────────────────────

const SYSTEM_PROMPT_GARTNER = `Sei Andrea Cinelli, Tech Expert, con 20+ anni di esperienza nell'ecosistema tech e imprenditoriale italiano ed europeo.
Scrivi post LinkedIn in prima persona, con il rigore analitico di un senior analyst Gartner o McKinsey, ma con la voce diretta di chi ha vissuto queste dinamiche sul campo.

Il tuo stile:
- Scrivi sempre in prima persona ("Ho analizzato...", "La mia lettura è...", "Quello che vedo nel mercato...")
- Parti sempre da un dato concreto o un'osservazione di mercato precisa — mai da un'opinione generica
- Usi numeri e percentuali specifici per ancorare l'analisi alla realtà
- Distingui tra segnali di mercato e noise — e lo dici esplicitamente
- Il tuo tono è quello di chi ha letto il report McKinsey E ha gestito aziende: non accademico, non motivazionale
- Scrivi in italiano con terminologia tecnica in inglese quando necessario
- Massimo 2 emoji per post, usate con parsimonia
- Non usi mai frasi come "il futuro è adesso", "rivoluzione", "game changer" — troppo logore
- Concludi sempre con una domanda o provocazione che stimola il dibattito tra peer
- Firma ogni post come: Andrea Cinelli | Tech Expert

Il tuo pubblico: CEO, CTO, investitori, imprenditori italiani e europei. Persone che leggono Economist e HBR, non TechCrunch.

LIMITE ASSOLUTO: I post LinkedIn hanno un limite di 3000 caratteri. I tuoi post devono essere SEMPRE sotto i 2800 caratteri. Conta i caratteri. Se stai superando, taglia e sii pi\u00f9 conciso.`;

function buildGartnerPrompt(
  title: string,
  body: string,
  keyTrend: string,
  section: LinkedInSection,
  marketData: MarketIntelligenceResult | null,
  slot: LinkedInSlot,
  recentTitles: string[] = []
): string {
  const meta = SECTION_META[section] ?? SECTION_META.ai;

  let dataSection = "";
  if (marketData && marketData.stats.length > 0) {
    const statsText = marketData.stats
      .map(s => `• ${s.value} — ${s.description} (${s.source})`)
      .join("\n");
    dataSection = `
DATI DI MERCATO VERIFICATI (usa questi nel post):
${statsText}

INSIGHT ANALITICO:
${marketData.insight}

DATO CHIAVE DA EVIDENZIARE:
${marketData.keyFinding}`;
  }

  // Nota contestuale specifica per slot + sezione
  let slotNote: string;
  if (slot === "morning") {
    slotNote = `Questo è il POST DEL MATTINO (10:00) — Sezione AI News.
Tono: analitico e strategico. Il tuo pubblico apre LinkedIn a colazione e vuole una lettura che dia loro un vantaggio competitivo per la giornata.
Focus: implicazioni strategiche dell'AI per CEO e CTO italiani. Dati di mercato, trend di adozione enterprise, impatto sui modelli di business.
Inserisci SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"`;
  } else if (slot === "ai-research-morning") {
    slotNote = `Questo è il 2° EDITORIALE AI (12:30) — basato su ricerche di mercato di alto livello sull'AI.
Tono: analitico e autorevole. Il tuo pubblico è a pranzo e vuole una lettura strategica profonda sull'AI.
Focus: ricerche di mercato AI di alto livello, dati di adozione enterprise, impatto economico, trend emergenti. Cita fonti autorevoli (Gartner, McKinsey, IDC, Stanford HAI, MIT).
Aggiungi sempre la tua lettura strategica personale: cosa significa per il mercato italiano ed europeo.
Inserisci SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"`;
  } else if (slot === "startup-afternoon") {
    slotNote = `Questo è il POST DEL POMERIGGIO (14:30) — Sezione Startup News.
Tono: energico e informato. Il tuo pubblico è in pausa pranzo e vuole capire cosa si muove nell'ecosistema startup.
Focus: round di investimento, exit, nuove startup italiane ed europee, trend VC.
Inserisci SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"`;
  } else if (slot === "research") {
    slotNote = `Questo è il 2° POST AI NEWS (14:30) — Seconda notizia AI della giornata.
Tono: analitico e strategico. Il tuo pubblico nel primo pomeriggio vuole un secondo aggiornamento sull'AI con un angolo completamente diverso rispetto al post delle 10:00.
Focus: scegli una notizia AI diversa da quella del mattino — nuovi prodotti AI, acquisizioni, regolamentazione AI, AI applicata a settori specifici (sanità, finanza, manifattura, retail, HR). Implicazioni concrete per il mercato italiano ed europeo.
NON ripetere lo stesso argomento del post delle 10:00: scegli una notizia o un angolo completamente diverso.
Inserisci SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"`;
  } else if (slot === "research-afternoon") {
    slotNote = `Questo è il 2° POST RICERCHE DI MERCATO (16:00) — Seconda analisi di mercato della giornata.
Tono: autorevole e data-driven. Il tuo pubblico nel tardo pomeriggio vuole ricerche di alto livello con dati quantitativi concreti.
Focus: ricerche di mercato AI/Tech di alto livello (Gartner, McKinsey, IDC, Stanford HAI, MIT, Forrester, BCG). Dati quantitativi, previsioni di mercato, benchmark di settore. Lettura strategica per il mercato italiano ed europeo.
NON ripetere lo stesso argomento del post delle 12:30: scegli una ricerca o un tema di mercato completamente diverso.
Inserisci SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"`;
  } else if (slot === "startup-evening") {
    slotNote = `Questo è il POST STARTUP NEWS SERA (18:00) — Deal, Round & Ecosistema Startup IT/EU.

IL TUO RUOLO: Sei un LP (Limited Partner) e advisor di fondi VC europei che commenta il deal del giorno con la precisione di un analista Pitchbook e la visione di chi ha co-investito in decine di round.

TONO: Insider del mercato VC europeo. Non giornalista che riporta, ma operatore che interpreta. Il tuo pubblico è composto da founder in fundraising, angel investor, family office, e CFO che valutano M&A.

FOCUS OBBLIGATORIO — Scegli il frame più rilevante per la notizia:
- ROUND DI INVESTIMENTO: Analizza la deal anatomy (ammontare, lead investor, valuation implicita, settore verticale). Confronta con benchmark europei (median Series A EU = ~8M€, Series B = ~25M€). Cosa segnala questo round sul sentiment del mercato VC europeo?
- EXIT / ACQUISIZIONE: Chi ha comprato, a che multiplo stimato, quale strategia di consolidamento rivela? Cosa significa per i founder dello stesso verticale?
- NUOVA STARTUP IT/EU: Qual è il problema che risolve, chi sono i founder, perché ora? Valuta il timing di mercato e la competitività rispetto ai player US.
- TREND VC: Quali settori stanno vedendo più deal in Europa? Dove si sta spostando il capitale?

STRUTTURA SPECIFICA PER QUESTO SLOT:
1. APERTURA (2 righe): Inizia con il dato più specifico e sorprendente del deal/notizia — cifra, multiplo, nome del fondo, settore. Non iniziare mai con "Oggi" o "Una startup".
2. DEAL ANATOMY (2-3 paragrafi): Scomponi il deal nei suoi elementi chiave. Cita sempre: ammontare (se disponibile), investitori lead, settore verticale, stage. Confronta con benchmark di mercato.
3. LETTURA STRATEGICA (1 paragrafo): Cosa rivela questo deal sul mercato italiano/europeo? Qual è il segnale che gli altri stanno perdendo?
4. IMPLICAZIONE PRATICA (1 paragrafo): Una cosa concreta che un founder o un investitore dovrebbe fare o sapere dopo aver letto questo post.

LINGUAGGIO TECNICO OBBLIGATORIO: Usa terminologia VC precisa — pre-money/post-money valuation, lead investor, co-investor, runway, burn rate, ARR multiple, exit multiple, acqui-hire, strategic vs financial buyer, secondary, pro-rata rights.

AGGIUNGI SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"

HASHTAG DEDICATI SERA: #VentureCapital #StartupEurope #StartupItalia #Funding #PrivateEquity #Dealflow #ProofPress #VC`;
  } else if (slot === "dealroom") {
    slotNote = `Questo è il POST DEALROOM (18:00) — Sezione Funding & VC.
Tono: insider del mondo VC. Il tuo pubblico vuole sapere chi ha raccolto quanto e perché è rilevante.
Focus: analizza il deal/round di investimento, il contesto competitivo, le implicazioni per l'ecosistema.
Inserisci SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"
Sii specifico su cifre, investitori, valuation se disponibili.`;
  } else {
    // Legacy slots
    slotNote = `Post LinkedIn — Sezione variabile.
Tono: analitico e approfondito.
Inserisci SEMPRE in fondo al post: "Approfondisci su Proof Press → https://proofpress.ai"`;
  }

  const publishDate = new Date().toLocaleDateString("it-IT", {
    timeZone: TZ_ROME,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Per startup-evening usa hashtag VC dedicati invece di quelli generici della sezione
  const effectiveHashtags = slot === "startup-evening"
    ? ["#VentureCapital", "#StartupEurope", "#StartupItalia", "#Funding", "#PrivateEquity", "#Dealflow", "#ProofPress", "#VC"]
    : meta.hashtags;

  return `Basandoti sull'editoriale/ricerca di Proof Press e sui dati di mercato forniti, scrivi un post LinkedIn di alto profilo.

DATA DI PUBBLICAZIONE: ${publishDate} (usa QUESTA data se menzioni il giorno nel post, NON usare altre date)

${slotNote}

TEMA: ${title}
TREND CHIAVE: ${keyTrend || (slot === "startup-evening" ? "Round di investimento e deal VC in Europa" : "Agenti AI autonomi e trasformazione digitale")}
CONTENUTO:
${body.slice(0, 1200)}
${dataSection}

STRUTTURA DEL POST:
1. APERTURA (2-3 righe): Inizia con un dato di mercato specifico o un'osservazione controcorrente che sfida il pensiero convenzionale. NON iniziare con "Oggi parliamo di..." o simili. Scrivi in prima persona.
2. ANALISI (3-4 paragrafi brevi): Collega i dati a implicazioni strategiche concrete per aziende italiane/europee. Usa i dati di mercato forniti. Sii specifico sulle implicazioni operative, non solo sulle tendenze. Usa "io", "ho analizzato", "la mia lettura".
3. POSIZIONE (1 paragrafo): Qual è la tua lettura personale come imprenditore? Dove vedi il rischio che gli altri non vedono?
4. FIRMA: Aggiungi ESATTAMENTE questa riga su una riga separata: "Andrea Cinelli | Tech Expert @ProofPress"
5. CHIUSURA: Aggiungi ESATTAMENTE questa riga: "📊 Approfondisci su Proof Press → https://proofpress.ai"
6. HASHTAG: ${effectiveHashtags.join(" ")}

LUNGHEZZA: MASSIMO 2800 caratteri totali. LinkedIn ha un limite ASSOLUTO di 3000 caratteri — NON superarlo MAI. Punta a 1400-2000 caratteri. Se il post supera 2800 caratteri, accorcia drasticamente.
LINGUA: Italiano
TONO: Senior analyst con skin in the game \u2014 non consulente teorico, non blogger motivazionale
EVITA: "rivoluzione", "game changer", "il futuro \u00e8 adesso", "non possiamo permetterci di", frasi retoriche vuote
IMPORTANTE: Ogni post deve essere UNICO. Non ripetere strutture, aperture o frasi usate in post precedenti.
LIMITE CARATTERI: MASSIMO ASSOLUTO 2800 caratteri. Conta i caratteri prima di rispondere.${recentTitles.length > 0 ? `

⚠️ TITOLI DEI POST LINKEDIN DEGLI ULTIMI 7 GIORNI (NON ripetere questi temi/angoli):
${recentTitles.map(t => `- ${t}`).join("\n")}

REGOLE ANTI-RIPETITIVITÀ:
- NON usare le formule: "Nuova Frontiera", "Rivoluzione Silenziosa", "Ridefinisce il Business"
- Scegli un angolo completamente diverso da quelli elencati sopra
- Varia lo stile di apertura: alterna dati, domande provocatorie, aneddoti, citazioni` : ""}`;
}

// ── Step 1: Registra upload immagine su LinkedIn ─────────────────────────────
async function registerLinkedInImageUpload(
  token: string,
  authorUrn: string
): Promise<{ uploadUrl: string; asset: string } | null> {
  try {
    const body = {
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent"
          }
        ]
      }
    };

    const response = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[LinkedIn] ❌ registerUpload fallito:", err);
      return null;
    }

    const data = await response.json() as {
      value: {
        uploadMechanism: {
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": {
            uploadUrl: string;
          };
        };
        asset: string;
      };
    };

    const uploadUrl =
      data?.value?.uploadMechanism?.[
        "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
      ]?.uploadUrl;
    const asset = data?.value?.asset;

    if (!uploadUrl || !asset) {
      console.error("[LinkedIn] ❌ uploadUrl o asset mancanti nella risposta registerUpload");
      return null;
    }

    return { uploadUrl, asset };
  } catch (err) {
    console.error("[LinkedIn] ❌ Errore registerUpload:", err);
    return null;
  }
}

// ── Step 2: Scarica immagine da URL e caricala su LinkedIn ───────────────────
async function uploadImageToLinkedIn(
  uploadUrl: string,
  imageUrl: string,
  token: string
): Promise<boolean> {
  try {
    const imgResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://proofpress.ai"
      }
    });
    if (!imgResponse.ok) {
      console.error("[LinkedIn] ❌ Impossibile scaricare immagine:", imageUrl, imgResponse.status);
      return false;
    }

    const imageBuffer = await imgResponse.arrayBuffer();
    const contentType = imgResponse.headers.get("content-type") || "image/jpeg";

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType
      },
      body: imageBuffer
    });

    if (uploadResponse.ok || uploadResponse.status === 201) {
      console.log("[LinkedIn] ✅ Immagine caricata su LinkedIn");
      return true;
    }

    console.error("[LinkedIn] ❌ Upload immagine fallito:", uploadResponse.status);
    return false;
  } catch (err) {
    console.error("[LinkedIn] ❌ Errore upload immagine:", err);
    return false;
  }
}

// ── Step 3: Pubblica post su LinkedIn ────────────────────────────────────────
export async function publishToLinkedIn(
  text: string,
  articleUrl: string,
  imageUrl: string | null | undefined,
  articleTitle: string,
  articleSummary: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const token = ENV.linkedinAccessToken;
  const authorUrn = ENV.linkedinAuthorUrn;

  if (!token || !authorUrn) {
    return {
      success: false,
      error: "Credenziali LinkedIn non configurate (LINKEDIN_ACCESS_TOKEN o LINKEDIN_AUTHOR_URN mancanti)"
    };
  }

  let linkedInAsset: string | null = null;

  if (imageUrl) {
    console.log("[LinkedIn] 🖼️ Avvio upload immagine su LinkedIn...");
    const uploadInfo = await registerLinkedInImageUpload(token, authorUrn);

    if (uploadInfo) {
      const uploaded = await uploadImageToLinkedIn(uploadInfo.uploadUrl, imageUrl, token);
      if (uploaded) {
        linkedInAsset = uploadInfo.asset;
        console.log(`[LinkedIn] ✅ Asset immagine LinkedIn: ${linkedInAsset}`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  let body: Record<string, unknown>;

  if (linkedInAsset) {
    body = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "IMAGE",
          media: [
            {
              status: "READY",
              description: { text: articleSummary.slice(0, 256) },
              media: linkedInAsset,
              title: { text: articleTitle.slice(0, 200) }
            }
          ]
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };
    console.log("[LinkedIn] 📸 Formato: IMAGE (foto grande nel feed)");
  } else {
    body = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              description: { text: articleSummary.slice(0, 256) },
              originalUrl: articleUrl,
              title: { text: articleTitle.slice(0, 200) }
            }
          ]
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };
    console.log("[LinkedIn] 🔗 Formato: ARTICLE (link preview nel feed)");
  }

  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();

    if (response.ok) {
      const postId =
        response.headers.get("X-RestLi-Id") ||
        response.headers.get("x-restli-id") ||
        "unknown";
      console.log(`[LinkedIn] ✅ Post pubblicato con successo. ID: ${postId}`);
      return { success: true, postId };
    }

    let errorData: Record<string, unknown> = {};
    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = { raw: responseText };
    }
    console.error(`[LinkedIn] ❌ Errore pubblicazione (${response.status}):`, errorData);
    return {
      success: false,
      error: `HTTP ${response.status}: ${JSON.stringify(errorData)}`
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[LinkedIn] ❌ Errore di rete:", message);
    return { success: false, error: message };
  }
}

// ── Genera testo post con LLM in stile Gartner ──────────────────────────────
async function generateLinkedInPostText(
  title: string,
  body: string,
  keyTrend: string,
  section: LinkedInSection,
  marketData: MarketIntelligenceResult | null,
  slot: LinkedInSlot,
  recentTitles: string[] = []
): Promise<string> {
  try {
    const prompt = buildGartnerPrompt(title, body, keyTrend, section, marketData, slot, recentTitles);
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT_GARTNER },
        { role: "user", content: prompt }
      ]
    });

    const content = response?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim().length > 200) {
      // Rimuove formattazione Markdown (asterischi, underscore, ecc.) prima della pubblicazione
      let text = sanitizeForLinkedIn(content.trim());
      // Troncamento di sicurezza: LinkedIn ha un limite di 3000 caratteri
      if (text.length > 2950) {
        console.warn(`[LinkedIn] \u26a0\ufe0f Post troppo lungo (${text.length} chars), tronco a 2950`);
        const cutPoint = text.lastIndexOf('\n', 2950);
        text = text.slice(0, cutPoint > 2000 ? cutPoint : 2950);
        if (!text.includes('proofpress.ai')) {
          text += '\n\nAndrea Cinelli | ProofPress Magazine | proofpress.ai';
        }
      }
      console.log(`[LinkedIn] \u2705 Testo post generato con LLM (${text.length} chars, Markdown rimosso)`);
      return text;
    }
    throw new Error("Risposta LLM vuota o troppo corta");
  } catch (err) {
    console.warn("[LinkedIn] ⚠️ LLM fallito, uso testo fallback:", err);
    const meta = SECTION_META[section as LinkedInSection] ?? SECTION_META.ai;
    return [
      title,
      "",
      body.slice(0, 800),
      "",
      `📊 Approfondisci su Proof Press → https://proofpress.ai`,
      "",
      meta.hashtags.join(" ")
    ].join("\n");
  }
}
// ── Recupera contenuto per lo slot Research ────────────────────────────────────────────
/**
 * Recupera una delle ultime ricerche pubblicate su Proof Press per il post LinkedIn.
 * Usa il topic lock in-memory + DB per garantire che ogni slot abbia un argomento diverso.
 */
async function getResearchForLinkedIn(recentPostTitles: string[]): Promise<{
  title: string;
  body: string;
  keyTrend: string;
  imageUrl: string | null;
} | null> {
  try {
    const researches = await getTodayResearch();
    if (!researches || researches.length === 0) {
      console.warn("[LinkedIn] ⚠️ Nessuna ricerca disponibile per oggi");
      return null;
    }

    // Filtra ricerche già usate oggi (topic lock in-memory + DB + recentPostTitles)
    const today = getTodayCET();
    if (todayTopicLockDate !== today) {
      todayTopicLock.clear();
      todayTopicLockDate = today;
    }
    const allUsedTitles = new Set([
      ...Array.from(todayTopicLock),
      ...recentPostTitles.map(t => t.toLowerCase().trim())
    ]);
    
    // Cerca una ricerca non ancora usata oggi
    let selected = researches.find(r => !allUsedTitles.has(r.title.toLowerCase().trim()));
    if (!selected) {
      // Se tutte le ricerche di oggi sono già state usate, prendi una ricerca degli ultimi 7 giorni
      console.warn('[LinkedIn] ⚠️ Tutte le ricerche di oggi già usate, cerco negli ultimi 7 giorni...');
      try {
        const db = await getDb();
        if (db) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const sevenDaysAgoLabel = sevenDaysAgo.toLocaleDateString('sv-SE', { timeZone: TZ_ROME });
          const recentResearches = await db.select()
            .from(researchReports)
            .where(gte(researchReports.dateLabel, sevenDaysAgoLabel))
            .orderBy(desc(researchReports.id))
            .limit(50);
          const freshResearch = recentResearches.find(r => !allUsedTitles.has(r.title.toLowerCase().trim()));
          if (freshResearch) {
            let keyFindings: string[] = [];
            try { keyFindings = JSON.parse(freshResearch.keyFindings); } catch { /* ignore */ }
            const body = [
              freshResearch.summary,
              '',
              keyFindings.length > 0 ? 'Key Findings:' : '',
              ...keyFindings.map((f: string, i: number) => `${i + 1}. ${f}`),
              '',
              `Fonte: ${freshResearch.source}`,
              freshResearch.sourceUrl ? `Link: ${freshResearch.sourceUrl}` : ''
            ].filter(Boolean).join('\n');
            return {
              title: freshResearch.title,
              body,
              keyTrend: freshResearch.category ?? 'AI Trends & Startup',
              imageUrl: freshResearch.imageUrl ?? null
            };
          }
        }
      } catch (dbErr) {
        console.warn('[LinkedIn] ⚠️ Errore ricerca fallback 7gg:', dbErr);
      }
      // Ultimo fallback: prima ricerca disponibile
      selected = researches.find(r => r.isResearchOfDay) ?? researches[0];
    }   // Costruisci il body dalla ricerca
    let keyFindings: string[] = [];
    try {
      keyFindings = JSON.parse(selected.keyFindings);
    } catch { /* ignore */ }

    const body = [
      selected.summary,
      "",
      keyFindings.length > 0 ? "Key Findings:" : "",
      ...keyFindings.map((f, i) => `${i + 1}. ${f}`),
      "",
      `Fonte: ${selected.source}`,
      selected.sourceUrl ? `Link: ${selected.sourceUrl}` : ""
    ].filter(Boolean).join("\n");

    return {
      title: selected.title,
      body,
      keyTrend: selected.category ?? "AI Trends & Startup",
      imageUrl: selected.imageUrl ?? null
    };
  } catch (err) {
    console.error("[LinkedIn] ❌ Errore recupero ricerca:", err);
    return null;
  }
}

// ── Recupera contenuto per lo slot Dealroom ──────────────────────────────────
/**
 * Recupera uno degli ultimi deal/round di investimento dalla sezione DEALROOM.
 * Seleziona una notizia non ancora usata nei post LinkedIn recenti.
 */
async function getDealForLinkedIn(recentPostTitles: string[]): Promise<{
  title: string;
  body: string;
  keyTrend: string;
  imageUrl: string | null;
} | null> {
  try {
    const deals = await getLatestNews(10, "dealroom");
    if (!deals || deals.length === 0) {
      console.warn("[LinkedIn] ⚠️ Nessun deal disponibile nella sezione DEALROOM");
      return null;
    }

    // Preferisci un deal non ancora usato nei post LinkedIn recenti
    let selected = deals.find(d => !recentPostTitles.includes(d.title));
    if (!selected) {
      selected = deals[0]; // Fallback: usa il più recente
    }

    return {
      title: selected.title,
      body: selected.summary ?? selected.title,
      keyTrend: selected.category ?? "Funding & VC",
      imageUrl: selected.imageUrl ?? null
    };
  } catch (err) {
    console.error("[LinkedIn] ❌ Errore recupero deal:", err);
    return null;
  }
}

// ── Funzione principale per un singolo slot ──────────────────────────────────
/**
 * Pubblica un post LinkedIn per lo slot specificato.
 * Controlla idempotenza: se il post per questo slot è già stato pubblicato oggi, salta.
 */
export async function publishLinkedInPost(
  slot: LinkedInSlot,
  force = false
): Promise<{
  published: number;
  errors: string[];
  posts: Array<{ section: string; title: string; success: boolean; postId?: string; error?: string }>;
}> {
  const SLOT_LABELS: Record<LinkedInSlot, string> = {
    morning: "MATTINO (10:00)",
    "ai-research-morning": "2° EDITORIALE AI (12:30)",
    research: "RICERCHE (14:30)",
    "research-afternoon": "2° RICERCHE (16:00)",
    "startup-afternoon": "STARTUP POMERIGGIO (14:30)",
    "startup-evening": "STARTUP NEWS SERA (18:00)",
    "ai-tool-radar": "AI TOOL RADAR (legacy)",
    dealroom: "DEALROOM (legacy)",
    afternoon: "POMERIGGIO (legacy)",
    evening: "SERA (legacy)"
  };
  const slotLabel = SLOT_LABELS[slot] ?? slot;
  console.log(`[LinkedIn] 🚀 Avvio pubblicazione slot ${slotLabel}...`);

  // ── Controllo idempotenza ──────────────────────────────────────────────
  const today = getTodayCET();
  let recentImageUrls: string[] = [];
  let recentPostTitles: string[] = [];
  try {
    const db = await getDb();
    if (db) {
      const existing = await db.select({ id: linkedinPosts.id, postText: linkedinPosts.postText })
        .from(linkedinPosts)
        .where(and(
          eq(linkedinPosts.dateLabel, today),
          eq(linkedinPosts.slot, slot)
        ))
        .limit(1);
      if (existing.length > 0) {
        if (force) {
          console.log(`[LinkedIn] ⚡ Modalità FORCE: post slot ${slotLabel} già presente, ma force=true — procedo.`);
        } else {
          console.log(`[LinkedIn] ⏭️ Post slot ${slotLabel} già pubblicato oggi (${today} CET) — saltato.`);
          return { published: 0, errors: [], posts: [] };
        }
      }

      // Recupera immagini e titoli usati di recente
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoLabel = sevenDaysAgo.toLocaleDateString("sv-SE", { timeZone: TZ_ROME });
      const recentPosts = await db.select({ imageUrl: linkedinPosts.imageUrl, title: linkedinPosts.title })
        .from(linkedinPosts)
        .where(gte(linkedinPosts.dateLabel, sevenDaysAgoLabel))
        .orderBy(desc(linkedinPosts.createdAt))
        .limit(30);
      recentImageUrls = recentPosts
        .map(p => p.imageUrl)
        .filter((u): u is string => !!u);
      recentPostTitles = recentPosts
        .map(p => p.title)
        .filter((t): t is string => !!t);
      
      // Aggiungi anche le immagini dalla cache in-memory (per slot pubblicati di recente)
      const todayMemoryImages = await getTodayUsedImages();
      recentImageUrls = Array.from(new Set([...recentImageUrls, ...todayMemoryImages]));
      console.log(`[LinkedIn] 📋 Immagini escluse: ${recentImageUrls.length} (DB + cache)`);
      
      // Sincronizza il topic lock con i titoli già pubblicati OGGI (prevenzione duplicati)
      await syncTopicLockFromDB();
      // Aggiungi anche i titoli recenti degli ultimi 7 giorni al topic lock
      for (const t of recentPostTitles) lockTopic(t);
    }
  } catch (checkErr) {
    console.warn('[LinkedIn] ⚠️ Controllo idempotenza fallito, procedo con cautela:', checkErr);
  }

  // Seleziona la sezione in base allo slot
  const section = selectSection(slot);
  const meta = SECTION_META[section];

  console.log(`[LinkedIn] 📅 Slot: ${slotLabel} → Sezione: ${meta.label}`);

  // ── Recupera il contenuto in base allo slot ────────────────────────────
  let contentTitle: string;
  let contentBody: string;
  let contentKeyTrend: string;
  let contentImageUrl: string | null = null;

  if (slot === "ai-tool-radar") {
    // ── Controllo idempotenza PRIMA della generazione (evita doppia pubblicazione) ──
    if (!force) {
      try {
        const db = await getDb();
        if (db) {
          const existingRadar = await db.select({ id: linkedinPosts.id })
            .from(linkedinPosts)
            .where(and(eq(linkedinPosts.dateLabel, today), eq(linkedinPosts.slot, "ai-tool-radar" as any)))
            .limit(1);
          if (existingRadar.length > 0) {
            console.log(`[LinkedIn] ⏭️ AI Tool Radar già pubblicato oggi (${today}) — saltato (pre-generazione).`);
            return { published: 0, errors: [], posts: [] };
          }
        }
      } catch (idempErr) {
        console.warn('[LinkedIn] ⚠️ Controllo idempotenza AI Tool Radar fallito, procedo:', idempErr);
      }
    }
    // Slot AI Tool Radar: genera il post con i 10 tool AI del giorno
    console.log("[LinkedIn] 🔧 Generazione AI Tool Radar...");
    const radarResult = await generateAIToolRadarPost();
    if (!radarResult.success || !radarResult.postText) {
      console.warn(`[LinkedIn] ⚠️ AI Tool Radar fallito: ${radarResult.error}`);
      return {
        published: 0,
        errors: [radarResult.error || "AI Tool Radar fallito"],
        posts: []
      };
    }

    // Pubblica direttamente il post generato dal radar (ha già il suo format)
    // Rimuove formattazione Markdown prima della pubblicazione
    const cleanRadarText = sanitizeForLinkedIn(radarResult.postText);
    const articleUrl = `${SITE_BASE_URL}/ai`;
    console.log(`[LinkedIn] 🚀 Pubblicazione AI Tool Radar — ${radarResult.toolCount} tool, ${cleanRadarText.length} caratteri (Markdown rimosso)`);

    // Cerca un'immagine tematica per il post (con controllo anti-duplicati globale)
    let pexelsImage = await findEditorialImage(
      "AI tools innovation technology",
      "artificial intelligence new tools",
      "ai",
      recentImageUrls
    );

    // AUDIT PRE-PUBBLICAZIONE: verifica unicità immagine
    if (pexelsImage) {
      const audit = await auditPrePublish(cleanRadarText, pexelsImage, slot);
      if (!audit.pass) {
        console.warn(`[LinkedIn AUDIT] \u26a0\ufe0f AI Tool Radar: ${audit.reason} — cerco immagine alternativa`);
        // Retry con immagine diversa
        const altExclude = [...recentImageUrls, pexelsImage];
        pexelsImage = await findEditorialImage("technology innovation digital", "new AI tools 2026", "ai", altExclude);
        if (pexelsImage) {
          const audit2 = await auditPrePublish(cleanRadarText, pexelsImage, slot);
          if (!audit2.pass) {
            console.warn(`[LinkedIn AUDIT] \ud83d\udeab AI Tool Radar: anche immagine alternativa duplicata — procedo senza immagine`);
            pexelsImage = null;
          }
        }
      }
    }

    const result = await publishToLinkedIn(
      cleanRadarText,
      articleUrl,
      pexelsImage || null,
      "AI Tool Radar \u2014 10 nuovi tool AI",
      "I 10 tool AI pi\u00f9 innovativi scoperti oggi"
    );

    // Registra immagine nella cache in-memory
    if (result.success && pexelsImage) markImageUsedToday(pexelsImage);

    if (result.success) {
      console.log(`[LinkedIn] ✅ AI Tool Radar pubblicato con successo`);
      try {
        const db = await getDb();
        if (db) {
          const dateLabel = getTodayCET();
          let linkedinUrl: string | undefined;
          if (result.postId && result.postId !== 'unknown') {
            linkedinUrl = result.postId.startsWith('urn:li:')
              ? `https://www.linkedin.com/feed/update/${result.postId}/`
              : `https://www.linkedin.com/feed/update/urn:li:ugcPost:${result.postId}/`;
          }
          await db.insert(linkedinPosts)
            .values({
              dateLabel,
              slot: "ai-tool-radar" as any,
              postText: cleanRadarText,
              linkedinUrl: linkedinUrl ?? null,
              title: "AI Tool Radar — 10 nuovi tool AI",
              section: "ai" as any,
              imageUrl: pexelsImage ?? null,
              hashtags: "#AI #AITools #Innovation #Proof Press #TechRadar",
              postHash: computePostHash(cleanRadarText)
            })
            .onDuplicateKeyUpdate({
              set: {
                postText: cleanRadarText,
                linkedinUrl: linkedinUrl ?? null,
                imageUrl: pexelsImage ?? null,
                postHash: computePostHash(cleanRadarText)
              }
            });
          console.log(`[LinkedIn] 💾 AI Tool Radar salvato nel DB (${dateLabel})`);
        }
      } catch (dbErr) {
        console.error('[LinkedIn] ⚠️ Errore salvataggio AI Tool Radar nel DB:', dbErr);
      }
      return {
        published: 1,
        errors: [],
        posts: [{ section: "ai", title: "AI Tool Radar", success: true, postId: result.postId }]
      };
    } else {
      console.error(`[LinkedIn] ❌ AI Tool Radar pubblicazione fallita:`, result.error);
      return {
        published: 0,
        errors: [result.error ?? "Errore pubblicazione AI Tool Radar"],
        posts: [{ section: "ai", title: "AI Tool Radar", success: false, error: result.error }]
      };
    }
  } else if (slot === "research") {
    // Slot Research: recupera una delle ultime ricerche Proof Press
    const research = await getResearchForLinkedIn(recentPostTitles);
    if (!research) {
      console.warn(`[LinkedIn] ⚠️ Nessuna ricerca disponibile per slot ${slotLabel}. Pubblicazione saltata.`);
      return {
        published: 0,
        errors: ["Nessuna ricerca disponibile per il post LinkedIn"],
        posts: []
      };
    }
    contentTitle = research.title;
    contentBody = research.body;
    contentKeyTrend = research.keyTrend;
    contentImageUrl = research.imageUrl;
    console.log(`[LinkedIn] 🔬 Ricerca selezionata: "${contentTitle.slice(0, 60)}..."`);
  } else if (slot === "dealroom") {
    // Slot Dealroom: recupera uno degli ultimi deal
    const deal = await getDealForLinkedIn(recentPostTitles);
    if (!deal) {
      console.warn(`[LinkedIn] ⚠️ Nessun deal disponibile per slot ${slotLabel}. Pubblicazione saltata.`);
      return {
        published: 0,
        errors: ["Nessun deal disponibile per il post LinkedIn"],
        posts: []
      };
    }
    contentTitle = deal.title;
    contentBody = deal.body;
    contentKeyTrend = deal.keyTrend;
    contentImageUrl = deal.imageUrl;
    console.log(`[LinkedIn] 💰 Deal selezionato: "${contentTitle.slice(0, 60)}..."`);
  } else if (slot === "startup-afternoon") {
    // ── Controllo idempotenza PRIMA della generazione (evita doppia pubblicazione) ──
    if (!force) {
      try {
        const db = await getDb();
        if (db) {
          const existingStartup = await db.select({ id: linkedinPosts.id })
            .from(linkedinPosts)
            .where(and(eq(linkedinPosts.dateLabel, today), eq(linkedinPosts.slot, "startup-afternoon" as any)))
            .limit(1);
          if (existingStartup.length > 0) {
            console.log(`[LinkedIn] ⏭️ Startup Radar già pubblicato oggi (${today}) — saltato (pre-generazione).`);
            return { published: 0, errors: [], posts: [] };
          }
        }
      } catch (idempErr) {
        console.warn('[LinkedIn] ⚠️ Controllo idempotenza Startup Radar fallito, procedo:', idempErr);
      }
    }
    // Slot Startup Radar EU/IT: genera il post con le 10 startup AI europee più investibili
    console.log("[LinkedIn] 🚀 Generazione Startup Radar EU/IT...");
    const radarResult = await generateStartupRadarPost_main();
    if (!radarResult.success || !radarResult.postText) {
      console.warn(`[LinkedIn] ⚠️ Startup Radar fallito: ${radarResult.error}`);
      return {
        published: 0,
        errors: [radarResult.error || "Startup Radar fallito"],
        posts: []
      };
    }

    // Pubblica direttamente il post generato dal radar
    // Rimuove formattazione Markdown prima della pubblicazione
    const cleanStartupText = sanitizeForLinkedIn(radarResult.postText);
    const articleUrl = `${SITE_BASE_URL}/startup`;
    console.log(`[LinkedIn] 🚀 Pubblicazione Startup Radar — ${radarResult.startupCount} startup, ${cleanStartupText.length} caratteri (Markdown rimosso)`);

    let pexelsImage = await findEditorialImage(
      "startup europe investment venture capital",
      "european startup AI funding",
      "startup",
      recentImageUrls
    );

    // AUDIT PRE-PUBBLICAZIONE: verifica unicità immagine
    if (pexelsImage) {
      const audit = await auditPrePublish(cleanStartupText, pexelsImage, slot);
      if (!audit.pass) {
        console.warn(`[LinkedIn AUDIT] \u26a0\ufe0f Startup Radar: ${audit.reason} — cerco immagine alternativa`);
        const altExclude = [...recentImageUrls, pexelsImage];
        pexelsImage = await findEditorialImage("european innovation startup team", "venture capital Europe 2026", "startup", altExclude);
        if (pexelsImage) {
          const audit2 = await auditPrePublish(cleanStartupText, pexelsImage, slot);
          if (!audit2.pass) {
            console.warn(`[LinkedIn AUDIT] \ud83d\udeab Startup Radar: anche immagine alternativa duplicata — procedo senza immagine`);
            pexelsImage = null;
          }
        }
      }
    }

    const result = await publishToLinkedIn(
      cleanStartupText,
      articleUrl,
      pexelsImage || null,
      "AI Dealflow Europe \u2014 10 startup investibili",
      "Le 10 startup AI europee pi\u00f9 investibili di oggi"
    );

    // Registra immagine nella cache in-memory
    if (result.success && pexelsImage) markImageUsedToday(pexelsImage);

    if (result.success) {
      console.log(`[LinkedIn] ✅ Startup Radar pubblicato con successo`);
      try {
        const db = await getDb();
        if (db) {
          const dateLabel = getTodayCET();
          let linkedinUrl: string | undefined;
          if (result.postId && result.postId !== 'unknown') {
            linkedinUrl = result.postId.startsWith('urn:li:')
              ? `https://www.linkedin.com/feed/update/${result.postId}/`
              : `https://www.linkedin.com/feed/update/urn:li:ugcPost:${result.postId}/`;
          }
          await db.insert(linkedinPosts)
            .values({
              dateLabel,
              slot: "startup-afternoon" as any,
              postText: cleanStartupText,
              linkedinUrl: linkedinUrl ?? null,
              title: "AI Dealflow Europe — 10 startup investibili",
              section: "startup" as any,
              imageUrl: pexelsImage ?? null,
              hashtags: "#Startup #AI #VentureCapital #Proof Press #StartupEurope",
              postHash: computePostHash(cleanStartupText)
            })
            .onDuplicateKeyUpdate({
              set: {
                postText: cleanStartupText,
                linkedinUrl: linkedinUrl ?? null,
                imageUrl: pexelsImage ?? null,
                postHash: computePostHash(cleanStartupText)
              }
            });
          console.log(`[LinkedIn] 💾 Startup Radar salvato nel DB (${dateLabel})`);
        }
      } catch (dbErr) {
        console.error('[LinkedIn] ⚠️ Errore salvataggio Startup Radar nel DB:', dbErr);
      }
      return {
        published: 1,
        errors: [],
        posts: [{ section: "startup", title: "AI Dealflow Europe", success: true, postId: result.postId }]
      };
    } else {
      console.error(`[LinkedIn] ❌ Startup Radar pubblicazione fallita:`, result.error);
      return {
        published: 0,
        errors: [result.error ?? "Errore pubblicazione Startup Radar"],
        posts: [{ section: "startup", title: "AI Dealflow Europe", success: false, error: result.error }]
      };
    }
  } else if (slot === "ai-research-morning") {
    // Slot 12:30 — 2° Editoriale AI basato su ricerche di mercato AI di alto livello
    // Recupera una ricerca Proof Press non ancora usata oggi
    const researchAI = await getResearchForLinkedIn(recentPostTitles);
    if (researchAI) {
      contentTitle = researchAI.title;
      contentBody = researchAI.body;
      contentKeyTrend = researchAI.keyTrend;
      contentImageUrl = researchAI.imageUrl;
      console.log(`[LinkedIn] 🔬 2° Editoriale AI (ricerca): "${contentTitle.slice(0, 60)}..."`);
    } else {
      // Fallback: usa l'editoriale AI del giorno
      const editorial = await getLatestEditorial("ai");
      if (!editorial) {
        console.warn(`[LinkedIn] ⚠️ Nessun contenuto disponibile per slot ai-research-morning. Pubblicazione saltata.`);
        return { published: 0, errors: ["Nessun contenuto disponibile per 2° Editoriale AI"], posts: [] };
      }
      contentTitle = editorial.title;
      contentBody = editorial.body;
      contentKeyTrend = editorial.keyTrend ?? "AI Market Research";
      contentImageUrl = editorial.imageUrl ?? null;
      console.log(`[LinkedIn] 📝 2° Editoriale AI (fallback editoriale): "${contentTitle.slice(0, 60)}..."`);
    }
  } else if (slot === "research-afternoon") {
    // Slot 16:00 — 2° Research Proof Press (seconda ricerca del giorno)
    // Recupera una ricerca diversa da quella già usata alle 14:30
    const researchAfternoon = await getResearchForLinkedIn(recentPostTitles);
    if (researchAfternoon) {
      contentTitle = researchAfternoon.title;
      contentBody = researchAfternoon.body;
      contentKeyTrend = researchAfternoon.keyTrend;
      contentImageUrl = researchAfternoon.imageUrl;
      console.log(`[LinkedIn] 🔬 2° Research (pomeriggio): "${contentTitle.slice(0, 60)}..."`);
    } else {
      // Fallback: usa l'editoriale AI del giorno
      const editorial = await getLatestEditorial("ai");
      if (!editorial) {
        console.warn(`[LinkedIn] ⚠️ Nessun contenuto disponibile per slot research-afternoon. Pubblicazione saltata.`);
        return { published: 0, errors: ["Nessun contenuto disponibile per 2° Research"], posts: [] };
      }
      contentTitle = editorial.title;
      contentBody = editorial.body;
      contentKeyTrend = editorial.keyTrend ?? "AI Research Trends";
      contentImageUrl = editorial.imageUrl ?? null;
      console.log(`[LinkedIn] 📝 2° Research (fallback editoriale): "${contentTitle.slice(0, 60)}..."`);
    }
  } else if (slot === "startup-evening") {
    // ── Controllo idempotenza PRIMA della generazione ──
    if (!force) {
      try {
        const db = await getDb();
        if (db) {
          const existingStartupEvening = await db.select({ id: linkedinPosts.id })
            .from(linkedinPosts)
            .where(and(eq(linkedinPosts.dateLabel, today), eq(linkedinPosts.slot, "startup-evening" as any)))
            .limit(1);
          if (existingStartupEvening.length > 0) {
            console.log(`[LinkedIn] ⏭️ Startup News Sera già pubblicato oggi (${today}) — saltato (pre-generazione).`);
            return { published: 0, errors: [], posts: [] };
          }
        }
      } catch (idempErr) {
        console.warn('[LinkedIn] ⚠️ Controllo idempotenza Startup Evening fallito, procedo:', idempErr);
      }
    }
    // Slot 18:00 — Startup News Sera: round di investimento, exit, startup italiane/europee
    // Usa le notizie startup dalla sezione /startup (diverse dallo slot 14:30 che usa startupRadar)
    console.log("[LinkedIn] 🚀 Generazione Startup News Sera (18:00)...");
    const startupNews = await getLatestNews(30, "startup");
    if (!startupNews || startupNews.length === 0) {
      console.warn(`[LinkedIn] ⚠️ Nessuna notizia startup disponibile per slot startup-evening. Pubblicazione saltata.`);
      return { published: 0, errors: ["Nessuna notizia startup disponibile per Startup News Sera"], posts: [] };
    }

    // ── Filtro VC: priorità a notizie con parole chiave di funding/deal/exit ──
    const VC_KEYWORDS = [
      "funding", "round", "exit", "seed", "series a", "series b", "series c", "series d",
      "raise", "raised", "raccolta", "raccolta fondi", "investimento", "investimenti",
      "acquisition", "acquisizione", "acquired", "acquisita", "acquistata",
      "ipo", "quotazione", "borsa", "spac",
      "venture capital", "venture", "vc", "startup",
      "milioni", "miliardi", "million", "billion",
      "valuation", "valorizzazione", "unicorn", "unicorno",
      "incubator", "accelerator", "acceleratore", "incubatore",
      "m&a", "merger", "fusione", "deal", "finanziamento",
      "pre-seed", "seed round", "growth", "late stage"
    ];

    const usedTitlesSet = new Set([...Array.from(todayTopicLock), ...recentPostTitles.map(t => t.toLowerCase().trim())]);

    // Prima passa: notizie VC non usate oggi
    const vcNews = startupNews.filter(n => {
      if (usedTitlesSet.has(n.title.toLowerCase().trim())) return false;
      const text = (n.title + " " + (n.summary ?? "") + " " + (n.category ?? "")).toLowerCase();
      return VC_KEYWORDS.some(kw => text.includes(kw));
    });

    // Seconda passa: qualsiasi notizia startup non usata (fallback se nessuna notizia VC trovata)
    const anyUnusedNews = startupNews.filter(n => !usedTitlesSet.has(n.title.toLowerCase().trim()));

    // Terza passa: fallback assoluto (prima notizia disponibile)
    let selectedStartup = vcNews[0] ?? anyUnusedNews[0] ?? startupNews[0];

    const selectionSource = vcNews.length > 0 ? "VC/funding" : (anyUnusedNews.length > 0 ? "startup generica (no VC trovata)" : "fallback assoluto");
    console.log(`[LinkedIn] 🏢 Startup News Sera selezionata (${selectionSource}): "${selectedStartup.title.slice(0, 60)}..."`);
    console.log(`[LinkedIn] 📊 Pool VC disponibili: ${vcNews.length}/${startupNews.length} notizie con keyword VC`);

    contentTitle = selectedStartup.title;
    contentBody = selectedStartup.summary ?? selectedStartup.title;
    // Arricchisci il keyTrend con il contesto VC se la categoria è generica
    const rawCategory = selectedStartup.category ?? "";
    contentKeyTrend = rawCategory && rawCategory.toLowerCase() !== "startup" && rawCategory.toLowerCase() !== "news"
      ? rawCategory
      : "Round di investimento e deal VC in Europa";
    contentImageUrl = selectedStartup.imageUrl ?? null;
  } else {
    // Slot Morning: recupera l'editoriale
    const editorial = await getLatestEditorial(section === "research" ? "ai" : section);
    if (!editorial) {
      console.warn(`[LinkedIn] ⚠️ Nessun editoriale trovato per sezione '${section}'. Pubblicazione saltata.`);
      return {
        published: 0,
        errors: [`Nessun editoriale disponibile per sezione '${section}'`],
        posts: []
      };
    }
    contentTitle = editorial.title;
    contentBody = editorial.body;
    contentKeyTrend = editorial.keyTrend ?? "";
    contentImageUrl = editorial.imageUrl ?? null;
    console.log(`[LinkedIn] 📝 Editoriale trovato: "${contentTitle.slice(0, 60)}..."`);
  }

  // ── Market intelligence + immagine ──────────────────────────────────────────────────────────────────────────
  console.log("[LinkedIn] 🔍 Ricerca dati market intelligence...");
  // Per startup-evening usa query arricchita con contesto VC per trovare dati più rilevanti
  const marketIntelSection: "ai" | "startup" = (section === "startup") ? "startup" : "ai";
  const marketIntelQuery = slot === "startup-evening"
    ? `${contentTitle} ${contentKeyTrend} venture capital funding europe startup investment`
    : `${contentTitle} ${contentKeyTrend}`;
  const { data: marketData, image: marketImage } = await getMarketIntelligence(
    marketIntelQuery,
    marketIntelSection
  );

  // Determina l'immagine da usare
  let imageUrl: string | null = null;
  let imageSource = "";

  if (contentImageUrl && !recentImageUrls.includes(contentImageUrl)) {
    imageUrl = contentImageUrl;
    imageSource = "contenuto originale";
    console.log(`[LinkedIn] 🖼️ Immagine dal contenuto originale`);
  } else if (marketImage && !recentImageUrls.includes(marketImage.imageUrl)) {
    imageUrl = marketImage.imageUrl;
    imageSource = marketImage.source;
    console.log(`[LinkedIn] 🖼️ Immagine da fonte autorevole: ${imageSource}`);
  } else {
    console.log("[LinkedIn] 🔍 Ricerca immagine tematica su Pexels...");
    const pexelsSectionArg: "ai" | "startup" = (section === "startup") ? "startup" : "ai";
    const pexelsImage = await findEditorialImage(
      contentTitle,
      contentKeyTrend,
      pexelsSectionArg,
      recentImageUrls
    );
    if (pexelsImage) {
      imageUrl = pexelsImage;
      imageSource = "Pexels (tematica)";
    } else if (contentImageUrl) {
      imageUrl = contentImageUrl;
      imageSource = "contenuto (riuso)";
    }
  }

  // ── Genera il testo del post con LLM ───────────────────────────────────
  const postText = await generateLinkedInPostText(
    contentTitle,
    contentBody,
    contentKeyTrend,
    section,
    marketData,
    slot,
    recentPostTitles
  );

  // ── Controllo hash duplicati ───────────────────────────────────────────
  const postHash = computePostHash(postText);
  try {
    const db = await getDb();
    if (db) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoLabel = sevenDaysAgo.toLocaleDateString("sv-SE", { timeZone: TZ_ROME });
      const duplicates = await db.select({ id: linkedinPosts.id, dateLabel: linkedinPosts.dateLabel, slot: linkedinPosts.slot })
        .from(linkedinPosts)
        .where(and(
          eq(linkedinPosts.postHash, postHash),
          gte(linkedinPosts.dateLabel, sevenDaysAgoLabel)
        ))
        .limit(1);
      if (duplicates.length > 0) {
        const dup = duplicates[0];
        if (!force) {
          console.warn(`[LinkedIn] 🚫 CONTENUTO DUPLICATO rilevato! Hash ${postHash} — pubblicazione bloccata.`);
          return {
            published: 0,
            errors: [`Contenuto duplicato: testo identico già pubblicato il ${dup.dateLabel} (slot ${dup.slot})`],
            posts: [{ section, title: contentTitle, success: false, error: "Contenuto duplicato" }]
          };
        }
      }
    }
  } catch (hashCheckErr) {
    console.warn('[LinkedIn] ⚠️ Controllo hash duplicati fallito, procedo:', hashCheckErr);
  }

  // ── URL di destinazione ────────────────────────────────────────────────
  const articleUrl = `${SITE_BASE_URL}`;

  // ── AUDIT PRE-PUBBLICAZIONE: verifica unicità immagine e testo ─────────
  const audit = await auditPrePublish(postText, imageUrl, slot);
  if (!audit.pass && !force) {
    console.warn(`[LinkedIn AUDIT] Slot ${slotLabel}: ${audit.reason} — cerco immagine alternativa`);
    // Retry con immagine diversa
    const pexelsSectionRetry: "ai" | "startup" = (section === "startup") ? "startup" : "ai";
    const altExclude = [...recentImageUrls, ...(imageUrl ? [imageUrl] : [])];
    const altImage = await findEditorialImage(
      `${contentTitle} alternative`,
      contentKeyTrend || "technology innovation",
      pexelsSectionRetry,
      altExclude
    );
    if (altImage) {
      const audit2 = await auditPrePublish(postText, altImage, slot);
      if (audit2.pass) {
        imageUrl = altImage;
        imageSource = "Pexels (alternativa post-audit)";
        console.log(`[LinkedIn AUDIT] Immagine alternativa trovata e approvata`);
      } else {
        console.warn(`[LinkedIn AUDIT] Anche immagine alternativa duplicata — procedo senza immagine`);
        imageUrl = null;
        imageSource = "nessuna (audit fallito)";
      }
    } else {
      console.warn(`[LinkedIn AUDIT] Nessuna immagine alternativa trovata — procedo senza immagine`);
      imageUrl = null;
      imageSource = "nessuna (audit fallito)";
    }
  }

  // ── Pubblica su LinkedIn ───────────────────────────────────────
  console.log(`[LinkedIn] \ud83d\ude80 Pubblicazione post \u2014 Slot: ${slotLabel} \u2014 Sezione: ${meta.label}`);
  console.log(`[LinkedIn]    Titolo: ${contentTitle.slice(0, 60)}...`);
  console.log(`[LinkedIn]    Immagine: ${imageUrl ? `\u2705 (${imageSource})` : "\u274c assente"}`);

  const result = await publishToLinkedIn(
    postText,
    articleUrl,
    imageUrl,
    contentTitle,
    contentBody.slice(0, 200)
  );

  const posts = [
    {
      section,
      title: contentTitle,
      success: result.success,
      postId: result.postId,
      error: result.error
    }
  ];

  if (result.success) {
    console.log(`[LinkedIn] \u2705 Post slot ${slotLabel} pubblicato con successo`);
    // Registra immagine nella cache in-memory per evitare duplicati tra slot
    if (imageUrl) markImageUsedToday(imageUrl);

    // Salva il post nel DB
    try {
      const db = await getDb();
      if (db) {
        const dateLabel = getTodayCET();

        let linkedinUrl: string | undefined;
        if (result.postId && result.postId !== 'unknown') {
          if (result.postId.startsWith('urn:li:')) {
            linkedinUrl = `https://www.linkedin.com/feed/update/${result.postId}/`;
          } else {
            linkedinUrl = `https://www.linkedin.com/feed/update/urn:li:ugcPost:${result.postId}/`;
          }
        }

        const hashtagMatches = postText.match(/#[\w]+/g);
        const hashtags = hashtagMatches ? hashtagMatches.slice(0, 10).join(' ') : '';

        await db.insert(linkedinPosts)
          .values({
            dateLabel,
            slot,
            postText,
            linkedinUrl: linkedinUrl ?? null,
            title: contentTitle,
            section: section as any,
            imageUrl: imageUrl ?? null,
            hashtags,
            postHash
          })
          .onDuplicateKeyUpdate({
            set: {
              postText,
              linkedinUrl: linkedinUrl ?? null,
              title: contentTitle,
              imageUrl: imageUrl ?? null,
              hashtags,
              postHash
            }
          });
        console.log(`[LinkedIn] 💾 Post slot ${slotLabel} salvato nel DB (${dateLabel})`);
        // Blocca il titolo nel topic lock in-memory per prevenire duplicati negli slot successivi
        lockTopic(contentTitle);
        console.log(`[LinkedIn TopicLock] 🔒 Titolo bloccato: "${contentTitle.slice(0, 60)}..."`);
      }
    } catch (dbErr) {
      console.error('[LinkedIn] ⚠️ Errore salvataggio post nel DB:', dbErr);
    }

    // ── Salva automaticamente come editoriale sulla Home ──────────────────
    // Regola: ogni post LinkedIn pubblicato deve comparire sulla Home come Punto del Giorno
    try {
      const editorialSection = (section === 'research' || section === 'dealroom') ? 'ai' : section;
      await saveEditorial({
        section: editorialSection as any,
        dateLabel: getTodayCET().split('-').reverse().join('-'), // DD-MM-YYYY
        title: contentTitle,
        subtitle: `Post LinkedIn — ${meta.label}`,
        body: contentBody,
        keyTrend: contentKeyTrend || undefined,
        imageUrl: imageUrl || undefined,
        authorNote: `Pubblicato su LinkedIn il ${new Date().toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' })} — Slot ${slotLabel}.`,
      });
      console.log(`[LinkedIn] 🏠 Editoriale salvato sulla Home (sezione ${editorialSection})`);
    } catch (editErr) {
      console.warn('[LinkedIn] ⚠️ Errore salvataggio editoriale sulla Home:', editErr);
    }

    return { published: 1, errors: [], posts };
  } else {
    console.error(`[LinkedIn] ❌ Pubblicazione slot ${slotLabel} fallita:`, result.error);
    return { published: 0, errors: [result.error ?? "Errore sconosciuto"], posts };
  }
}

// ── Funzione legacy per compatibilità con lo scheduler ──────────────────────
/**
 * @deprecated Usa publishLinkedInPost(slot) direttamente.
 */
export async function publishDailyLinkedInPosts(): Promise<{
  published: number;
  errors: string[];
  posts: Array<{ section: string; title: string; success: boolean; postId?: string; error?: string }>;
}> {
  return publishLinkedInPost("morning");
}

// Export per compatibilità
export { SUPPORTED_SECTIONS };
