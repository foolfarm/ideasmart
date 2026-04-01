/**
 * IDEASMART — LinkedIn Autopost
 *
 * Pubblica 4 post giornalieri su LinkedIn:
 *  - Slot MORNING:           10:00 CET — AI News (analisi strategica AI)
 *  - Slot STARTUP-AFTERNOON: 14:30 CET — Startup News (ecosistema startup IT/EU)
 *  - Slot RESEARCH:          17:00 CET — Ricerche IdeaSmart (ultima ricerca pubblicata)
 *  - Slot DEALROOM:          18:00 CET — Dealroom (ultimo deal/round di investimento)
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
import { invokeLLM } from "./_core/llm";
import { getLatestEditorial, getDb, getLatestNews } from "./db";
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

const SITE_BASE_URL = "https://ideasmart.ai";

// ── Slot giornalieri ─────────────────────────────────────────────────────────
export type LinkedInSlot = "morning" | "startup-afternoon" | "research" | "dealroom" | "ai-tool-radar" | "afternoon" | "evening";

// ── Sezioni supportate per LinkedIn ──────────────────────────────────────────
type LinkedInSection = "ai" | "startup" | "dealroom" | "research";
const SUPPORTED_SECTIONS: Array<LinkedInSection> = ["ai", "startup", "dealroom", "research"];

const SECTION_META: Record<LinkedInSection, { label: string; hashtags: string[]; path: string }> = {
  ai: {
    label: "AI News",
    hashtags: ["#AI", "#ArtificialIntelligence", "#AIStrategy", "#DigitalTransformation", "#IDEASMART", "#FutureOfWork", "#EnterpriseAI"],
    path: "/ai"
  },
  startup: {
    label: "Startup News",
    hashtags: ["#Startup", "#VentureCapital", "#Innovation", "#Entrepreneurship", "#IDEASMART", "#TechEcosystem", "#StartupEurope"],
    path: "/startup"
  },
  dealroom: {
    label: "DEALROOM — Funding & VC",
    hashtags: ["#dealroom", "#funding", "#venturecapital", "#startup", "#investment", "#IDEASMART"],
    path: "/dealroom"
  },
  research: {
    label: "IdeaSmart Research",
    hashtags: ["#research", "#AI", "#startup", "#venturecapital", "#marketanalysis", "#IDEASMART", "#TechTrends"],
    path: "/ricerche"
  }
};

// ── Mappa slot → sezione ────────────────────────────────────────────────────
function selectSection(slot: LinkedInSlot): LinkedInSection {
  if (slot === "morning") return "ai";
  if (slot === "startup-afternoon") return "startup";
  if (slot === "research") return "research";
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

Il tuo pubblico: CEO, CTO, investitori, imprenditori italiani e europei. Persone che leggono Economist e HBR, non TechCrunch.`;

function buildGartnerPrompt(
  title: string,
  body: string,
  keyTrend: string,
  section: LinkedInSection,
  marketData: MarketIntelligenceResult | null,
  slot: LinkedInSlot
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
Includi sempre il link a ideasmart.ai/ai.`;
  } else if (slot === "startup-afternoon") {
    slotNote = `Questo è il POST DEL POMERIGGIO (14:30) — Sezione Startup News.
Tono: energico e informato. Il tuo pubblico è in pausa pranzo e vuole capire cosa si muove nell'ecosistema startup.
Focus: round di investimento, exit, nuove startup italiane ed europee, trend VC.
Includi sempre il link a ideasmart.ai/startup.`;
  } else if (slot === "research") {
    slotNote = `Questo è il POST SULLE RICERCHE (17:00) — Sezione IdeaSmart Research.
Tono: autorevole e data-driven. Il tuo pubblico vuole insight basati su ricerche e dati concreti.
Focus: presenta i key findings della ricerca, le implicazioni per il mercato italiano/europeo, e perché questa ricerca è rilevante per decision-maker.
Invita a leggere la ricerca completa su ideasmart.ai/ricerche.
NON limitarti a riassumere: aggiungi la tua lettura strategica dei dati.`;
  } else if (slot === "dealroom") {
    slotNote = `Questo è il POST DEALROOM (18:00) — Sezione Funding & VC.
Tono: insider del mondo VC. Il tuo pubblico vuole sapere chi ha raccolto quanto e perché è rilevante.
Focus: analizza il deal/round di investimento, il contesto competitivo, le implicazioni per l'ecosistema.
Includi sempre il link a ideasmart.ai/dealroom.
Sii specifico su cifre, investitori, valuation se disponibili.`;
  } else {
    // Legacy slots
    slotNote = `Post LinkedIn — Sezione variabile.
Tono: analitico e approfondito.
Includi sempre il link a ideasmart.ai.`;
  }

  const publishDate = new Date().toLocaleDateString("it-IT", {
    timeZone: TZ_ROME,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return `Basandoti sull'editoriale/ricerca di IDEASMART e sui dati di mercato forniti, scrivi un post LinkedIn di alto profilo.

DATA DI PUBBLICAZIONE: ${publishDate} (usa QUESTA data se menzioni il giorno nel post, NON usare altre date)

${slotNote}

TEMA: ${title}
TREND CHIAVE: ${keyTrend || "Agenti AI autonomi e trasformazione digitale"}
CONTENUTO:
${body.slice(0, 1200)}
${dataSection}

STRUTTURA DEL POST:
1. APERTURA (2-3 righe): Inizia con un dato di mercato specifico o un'osservazione controcorrente che sfida il pensiero convenzionale. NON iniziare con "Oggi parliamo di..." o simili. Scrivi in prima persona.
2. ANALISI (3-4 paragrafi brevi): Collega i dati a implicazioni strategiche concrete per aziende italiane/europee. Usa i dati di mercato forniti. Sii specifico sulle implicazioni operative, non solo sulle tendenze. Usa "io", "ho analizzato", "la mia lettura".
3. POSIZIONE (1 paragrafo): Qual è la tua lettura personale come imprenditore? Dove vedi il rischio che gli altri non vedono?
4. FIRMA: Aggiungi ESATTAMENTE questa riga su una riga separata: "Andrea Cinelli | Tech Expert"
5. CHIUSURA: Aggiungi ESATTAMENTE questa riga: "📊 Analisi completa su IDEASMART → ${SITE_BASE_URL}${meta.path}"
6. HASHTAG: ${meta.hashtags.join(" ")}

LUNGHEZZA: 1400-1900 caratteri totali
LINGUA: Italiano
TONO: Senior analyst con skin in the game — non consulente teorico, non blogger motivazionale
EVITA: "rivoluzione", "game changer", "il futuro è adesso", "non possiamo permetterci di", frasi retoriche vuote
IMPORTANTE: Ogni post deve essere UNICO. Non ripetere strutture, aperture o frasi usate in post precedenti.`;
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
        "Referer": "https://ideasmart.ai"
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
  slot: LinkedInSlot
): Promise<string> {
  try {
    const prompt = buildGartnerPrompt(title, body, keyTrend, section, marketData, slot);
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT_GARTNER },
        { role: "user", content: prompt }
      ]
    });

    const content = response?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim().length > 200) {
      console.log("[LinkedIn] ✅ Testo post generato con LLM (stile Gartner)");
      return content.trim();
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
      `📊 Analisi completa su IDEASMART → ${SITE_BASE_URL}${meta.path}`,
      "",
      meta.hashtags.join(" ")
    ].join("\n");
  }
}

// ── Recupera contenuto per lo slot Research ──────────────────────────────────
/**
 * Recupera una delle ultime ricerche pubblicate su IdeaSmart per il post LinkedIn.
 * Seleziona una ricerca non ancora usata nei post LinkedIn recenti.
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

    // Preferisci una ricerca non ancora usata nei post LinkedIn recenti
    let selected = researches.find(r => !recentPostTitles.includes(r.title));
    if (!selected) {
      // Fallback: usa la ricerca del giorno o la prima disponibile
      selected = researches.find(r => r.isResearchOfDay) ?? researches[0];
    }

    // Costruisci il body dalla ricerca
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
    "startup-afternoon": "STARTUP POMERIGGIO (14:30)",
    research: "RICERCHE (17:00)",
    "ai-tool-radar": "AI TOOL RADAR (18:00)",
    dealroom: "DEALROOM (19:00)",
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
    const articleUrl = `${SITE_BASE_URL}/ai`;
    console.log(`[LinkedIn] 🚀 Pubblicazione AI Tool Radar — ${radarResult.toolCount} tool, ${radarResult.postText.length} caratteri`);

    // Cerca un'immagine tematica per il post
    const pexelsImage = await findEditorialImage(
      "AI tools innovation technology",
      "artificial intelligence new tools",
      "ai",
      recentImageUrls
    );

    const result = await publishToLinkedIn(
      radarResult.postText,
      articleUrl,
      pexelsImage || null,
      "AI Tool Radar — 10 nuovi tool AI",
      "I 10 tool AI più innovativi scoperti oggi"
    );

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
              postText: radarResult.postText,
              linkedinUrl: linkedinUrl ?? null,
              title: "AI Tool Radar — 10 nuovi tool AI",
              section: "ai" as any,
              imageUrl: pexelsImage ?? null,
              hashtags: "#AI #AITools #Innovation #IDEASMART #TechRadar",
              postHash: computePostHash(radarResult.postText)
            })
            .onDuplicateKeyUpdate({
              set: {
                postText: radarResult.postText,
                linkedinUrl: linkedinUrl ?? null,
                imageUrl: pexelsImage ?? null,
                postHash: computePostHash(radarResult.postText)
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
    // Slot Research: recupera una delle ultime ricerche IdeaSmart
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
    const articleUrl = `${SITE_BASE_URL}/startup`;
    console.log(`[LinkedIn] 🚀 Pubblicazione Startup Radar — ${radarResult.startupCount} startup, ${radarResult.postText.length} caratteri`);

    const pexelsImage = await findEditorialImage(
      "startup europe investment venture capital",
      "european startup AI funding",
      "startup",
      recentImageUrls
    );

    const result = await publishToLinkedIn(
      radarResult.postText,
      articleUrl,
      pexelsImage || null,
      "AI Dealflow Europe — 10 startup investibili",
      "Le 10 startup AI europee più investibili di oggi"
    );

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
              postText: radarResult.postText,
              linkedinUrl: linkedinUrl ?? null,
              title: "AI Dealflow Europe — 10 startup investibili",
              section: "startup" as any,
              imageUrl: pexelsImage ?? null,
              hashtags: "#Startup #AI #VentureCapital #IDEASMART #StartupEurope",
              postHash: computePostHash(radarResult.postText)
            })
            .onDuplicateKeyUpdate({
              set: {
                postText: radarResult.postText,
                linkedinUrl: linkedinUrl ?? null,
                imageUrl: pexelsImage ?? null,
                postHash: computePostHash(radarResult.postText)
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

  // ── Market intelligence + immagine ─────────────────────────────────────
  console.log("[LinkedIn] 🔍 Ricerca dati market intelligence...");
  const marketIntelSection: "ai" | "startup" = (section === "startup") ? "startup" : "ai";
  const { data: marketData, image: marketImage } = await getMarketIntelligence(
    `${contentTitle} ${contentKeyTrend}`,
    marketIntelSection
  );

  if (marketData) {
    console.log(`[LinkedIn] 📊 Dati trovati: ${marketData.stats.length} statistiche`);
  }

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
    slot
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
  const articleUrl = `${SITE_BASE_URL}${meta.path}`;

  // ── Pubblica su LinkedIn ───────────────────────────────────────────────
  console.log(`[LinkedIn] 🚀 Pubblicazione post — Slot: ${slotLabel} — Sezione: ${meta.label}`);
  console.log(`[LinkedIn]    Titolo: ${contentTitle.slice(0, 60)}...`);
  console.log(`[LinkedIn]    Immagine: ${imageUrl ? `✅ (${imageSource})` : "❌ assente"}`);

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
    console.log(`[LinkedIn] ✅ Post slot ${slotLabel} pubblicato con successo`);

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
      }
    } catch (dbErr) {
      console.error('[LinkedIn] ⚠️ Errore salvataggio post nel DB:', dbErr);
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
