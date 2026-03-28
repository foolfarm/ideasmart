/**
 * IDEASMART — LinkedIn Autopost
 *
 * Pubblica 3 post giornalieri su LinkedIn:
 *  - Slot MORNING: 10:30 CET — Editoriale AI o Startup (alternanza settimanale)
 *  - Slot AFTERNOON: 15:00 CET — Notizia di approfondimento dalla sezione opposta
 *  - Slot EVENING: 17:30 CET — Vibe coding, AI e startup, come cambia il mercato
 *
 * Flusso per ogni slot:
 *  1. Recupera l'editoriale del giorno (AI o Startup, alternanza settimanale)
 *  2. Cerca dati/statistiche da fonti di market intelligence (McKinsey, Gartner,
 *     CBInsights, WEF, a16z, ecc.) via Perplexity Sonar API
 *  3. Cerca immagine pertinente da feed RSS di fonti autorevoli (VentureBeat,
 *     CBInsights, TechCrunch AI, Sifted, The Decoder)
 *  4. Genera il testo del post con LLM in stile senior analyst Gartner
 *     (non blogger, non motivational speaker — dati, framing strategico,
 *     implicazioni per il business)
 *  5. Carica l'immagine su LinkedIn e pubblica il post (formato IMAGE)
 *
 * Sezioni supportate: 'ai' e 'startup' (no musica)
 */

import { createHash } from "crypto";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { getLatestEditorial, getDb } from "./db";
import { getMarketIntelligence, type MarketIntelligenceResult } from "./marketIntelligence";
import { findEditorialImage } from "./stockImages";
import { linkedinPosts } from "../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";

// ── Timezone CET/CEST ────────────────────────────────────────────────────────
const TZ_ROME = "Europe/Rome";

/**
 * Restituisce la data corrente nel fuso orario Europe/Rome (CET/CEST)
 * nel formato YYYY-MM-DD. Evita il bug UTC vs CET che causava doppi post.
 */
function getTodayCET(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: TZ_ROME }); // sv-SE = YYYY-MM-DD
}

/**
 * Calcola l'hash SHA-256 del testo del post (primi 500 caratteri normalizzati).
 * Usato per rilevare contenuti duplicati indipendentemente dal giorno/slot.
 */
function computePostHash(text: string): string {
  // Normalizza: minuscolo, rimuovi spazi multipli, prendi i primi 500 char
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500);
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16); // 16 char hex
}

const SITE_BASE_URL = "https://ideasmart.ai";

// ── Slot giornalieri ─────────────────────────────────────────────────────────
export type LinkedInSlot = "morning" | "afternoon" | "startup-afternoon" | "evening";

// ── // ── Sezioni supportate per LinkedIn ────────────────────────────────────────────────────────────
type LinkedInSection = "ai" | "startup" | "finance" | "health" | "sport" | "luxury";
const SUPPORTED_SECTIONS: Array<LinkedInSection> = ["ai", "startup", "finance", "health", "sport", "luxury"];

const SECTION_META: Record<LinkedInSection, { label: string; hashtags: string[]; path: string }> = {
  ai: {
    label: "AI4Business",
    hashtags: ["#AI", "#ArtificialIntelligence", "#AIStrategy", "#DigitalTransformation", "#IDEASMART", "#FutureOfWork", "#EnterpriseAI"],
    path: "/ai",
  },
  startup: {
    label: "Startup News",
    hashtags: ["#Startup", "#VentureCapital", "#Innovation", "#Entrepreneurship", "#IDEASMART", "#TechEcosystem", "#StartupEurope"],
    path: "/startup",
  },
  finance: {
    label: "Finance & Economia",
    hashtags: ["#Finance", "#Economia", "#Fintech", "#Investimenti", "#IDEASMART", "#MercatiFinanziari", "#StrategiaFinanziaria"],
    path: "/finance",
  },
  health: {
    label: "Health & Biotech",
    hashtags: ["#HealthTech", "#Biotech", "#Salute", "#MedTech", "#IDEASMART", "#DigitalHealth", "#Innovazione"],
    path: "/health",
  },
  sport: {
    label: "Sport & Business",
    hashtags: ["#SportBusiness", "#SportTech", "#Sport", "#Sponsorship", "#IDEASMART", "#SportMarketing", "#Atletica"],
    path: "/sport",
  },
  luxury: {
    label: "Luxury & Lifestyle",
    hashtags: ["#Luxury", "#LuxuryBusiness", "#MadeinItaly", "#LuxuryTech", "#IDEASMART", "#LuxuryMarketing", "#Premium"],
    path: "/luxury",
  },
};

// ── Rotazione sezioni per slot afternoon e evening ─────────────────────────────────
/**
 * Rotazione settimanale per i 2 slot variabili (afternoon 15:00 e evening 17:30).
 * Ogni slot ruota su 4 sezioni diverse (finance, health, sport, luxury) con un
 * offset di 2 posizioni tra i due slot per garantire che nello stesso giorno
 * i due post siano sempre su sezioni diverse.
 *
 * Lunedi:    afternoon=finance,  evening=sport
 * Martedi:   afternoon=health,   evening=luxury
 * Mercoledi: afternoon=sport,    evening=finance
 * Giovedi:   afternoon=luxury,   evening=health
 * Venerdi:   afternoon=finance,  evening=sport
 * Sabato:    afternoon=health,   evening=luxury
 * Domenica:  afternoon=sport,    evening=finance
 */
const AFTERNOON_ROTATION: LinkedInSection[] = ["finance", "health", "sport", "luxury"];
const EVENING_ROTATION: LinkedInSection[] = ["sport", "luxury", "finance", "health"]; // offset +2

// ── Seleziona la sezione in base al giorno e allo slot ───────────────────────
/**
 * Schema giornaliero dei 4 slot:
 *  - 10:30 MORNING:           sempre AI4Business (analisi strategica AI)
 *  - 13:00 STARTUP-AFTERNOON: sempre Startup News (ecosistema startup IT/EU)
 *  - 15:00 AFTERNOON:         rotazione settimanale finance/health/sport/luxury
 *  - 17:30 EVENING:           rotazione settimanale sport/luxury/finance/health (offset +2)
 *
 * Risultato: ogni giorno i 4 post coprono 4 sezioni tematiche completamente diverse.
 */
function selectSection(slot: LinkedInSlot): LinkedInSection {
  if (slot === "morning") return "ai";           // 10:30: sempre AI4Business
  if (slot === "startup-afternoon") return "startup"; // 13:00: sempre Startup News

  // Afternoon e evening: rotazione settimanale
  // Usa il giorno della settimana in CET per coerenza con dateLabel
  const dayCET = new Date().toLocaleDateString("en-US", { timeZone: TZ_ROME, weekday: "short" });
  // Mappa giorno abbreviato inglese → indice 0-6 (Lun=0, Mar=1, Mer=2, Gio=3, Ven=4, Sab=5, Dom=6)
  const dayIndexMap: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const dayIdx = dayIndexMap[dayCET] ?? 0;
  const rotIdx = dayIdx % 4; // 0-3

  if (slot === "afternoon") return AFTERNOON_ROTATION[rotIdx];
  return EVENING_ROTATION[rotIdx]; // evening
}

// ── Prompt LLM: stile senior analyst Gartner ────────────────────────────────

const SYSTEM_PROMPT_GARTNER = `Sei Andrea Cinelli, Opinion Leader & Editorialista di IdeaSmart Research, con 20+ anni di esperienza nell'ecosistema tech e imprenditoriale italiano ed europeo.
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
- Firma ogni post come: Andrea Cinelli | Opinion Leader & Editorialista IdeaSmart Research

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
  // Ogni combinazione produce un tono e un angolo editoriale diverso
  let slotNote: string;
  if (slot === "morning") {
    slotNote = `Questo è il POST DEL MATTINO (10:30) — Sezione AI4Business.
Tono: analitico e strategico. Il tuo pubblico apre LinkedIn a colazione e vuole una lettura che dia loro un vantaggio competitivo per la giornata.
Focus: implicazioni strategiche dell'AI per CEO e CTO italiani. Dati di mercato, trend di adozione enterprise, impatto sui modelli di business. Angolo preferito: "cosa sta succedendo davvero nel mercato AI che i media generalisti non raccontano".
Includi sempre il link a ideasmart.ai/ai.`;
  } else if (slot === "startup-afternoon") {
    slotNote = `Questo è il POST STARTUP POMERIDIANO (13:00) — Sezione Startup News.
Tono: mentor che ha fatto startup, non giornalista. Il tuo pubblico è fondatori, VC e acceleratori italiani ed europei.
Focus: (1) evidenzia il round di finanziamento, la tecnologia o il pivot con dati precisi, (2) spiega perché questa startup è rilevante per il mercato italiano, (3) offri un insight su cosa possono imparare gli imprenditori italiani da questo caso.
Angolo preferito: "cosa vedo in questo deal che gli altri non hanno ancora capito".
Includi sempre il link a ideasmart.ai/startup.`;
  } else if (slot === "afternoon") {
    // Afternoon: sezione varia (finance, health, sport, luxury)
    const afternoonNotes: Record<string, string> = {
      finance: `Questo è il POST POMERIDIANO (15:00) — Sezione Finance & Economia.
Tono: CFO e investitore che ha letto i numeri, non il commentatore TV. Il tuo pubblico è imprenditori, CFO, family office e gestori patrimoniali italiani.
Focus: analisi di mercato finanziario, fintech, M&A, trend di investimento. Collega i dati macro a implicazioni operative per le PMI italiane.
Angolo preferito: "cosa dicono i numeri che i media finanziari generalisti non osano dire".
Includi sempre il link a ideasmart.ai/finance.`,
      health: `Questo è il POST POMERIDIANO (15:00) — Sezione Health & Biotech.
Tono: imprenditore che ha investito in biotech e digital health, non medico. Il tuo pubblico è investitori, fondatori e manager del settore healthcare italiano.
Focus: innovazione biotech, digital health, AI in medicina, politiche sanitarie con impatto sul business. Dati su trial clinici, round di finanziamento, FDA/EMA approval.
Angolo preferito: "dove sta andando il capitale nel settore salute e perché".
Includi sempre il link a ideasmart.ai/health.`,
      sport: `Questo è il POST POMERIDIANO (15:00) — Sezione Sport & Business.
Tono: imprenditore che capisce il business dello sport, non il tifoso. Il tuo pubblico è manager sportivi, sponsor, investitori e fondatori di startup SportTech.
Focus: business model dello sport, diritti TV, sponsorship, SportTech, valorizzazione dei club come asset. Dati su ricavi, valutazioni, deal.
Angolo preferito: "lo sport è uno dei pochi settori dove i numeri crescono ancora a doppia cifra — ecco perché".
Includi sempre il link a ideasmart.ai/sport.`,
      luxury: `Questo è il POST POMERIDIANO (15:00) — Sezione Luxury & Lifestyle.
Tono: conoscitore del Made in Italy e dei mercati premium globali, non fashion blogger. Il tuo pubblico è imprenditori del lusso, brand manager e investitori nel settore premium.
Focus: trend del mercato luxury globale, digitale nel lusso, sostenibilità come leva competitiva, espansione in Asia. Dati su fatturati, acquisizioni, brand equity.
Angolo preferito: "il lusso italiano è uno dei pochi settori dove il brand conta più del prodotto — ecco le implicazioni strategiche".
Includi sempre il link a ideasmart.ai/luxury.`,
    };
    slotNote = afternoonNotes[section] ?? afternoonNotes.finance;
  } else {
    // Evening: sezione varia (sport, luxury, finance, health) con offset
    const eveningNotes: Record<string, string> = {
      sport: `Questo è il POST SERALE (17:30) — Sezione Sport & Business.
Tono: riflessivo e provocatorio, fine giornata. Il tuo pubblico legge LinkedIn prima di cena e vuole una lettura che stimoli il pensiero.
Focus: l'economia dello sport come specchio dell'economia reale. Come i modelli di business sportivi anticipano i trend del business mainstream. Dati su valutazioni, diritti, sponsorship.
Angolo preferito: "quello che il business dello sport ci insegna sul futuro dell'economia".
Includi sempre il link a ideasmart.ai/sport.`,
      luxury: `Questo è il POST SERALE (17:30) — Sezione Luxury & Lifestyle.
Tono: riflessivo e provocatorio, fine giornata. Il tuo pubblico legge LinkedIn prima di cena e vuole una lettura che stimoli il pensiero.
Focus: il lusso come indicatore leading dell'economia globale. Cosa ci dicono i dati del settore premium sul sentiment dei consumatori ad alto reddito e sulle prospettive macro.
Angolo preferito: "il mercato luxury è il canary in the coal mine dell'economia globale — ecco cosa vedo".
Includi sempre il link a ideasmart.ai/luxury.`,
      finance: `Questo è il POST SERALE (17:30) — Sezione Finance & Economia.
Tono: riflessivo e provocatorio, fine giornata. Il tuo pubblico chiude la giornata lavorativa e vuole un'analisi che metta in prospettiva quello che è successo sui mercati.
Focus: lettura di fine giornata sui mercati finanziari, macro-economia, politica monetaria. Cosa significano i movimenti di oggi per le strategie di domani.
Angolo preferito: "la mia lettura di fine giornata sui mercati — quello che i numeri non dicono".
Includi sempre il link a ideasmart.ai/finance.`,
      health: `Questo è il POST SERALE (17:30) — Sezione Health & Biotech.
Tono: riflessivo e provocatorio, fine giornata. Il tuo pubblico legge LinkedIn prima di cena e vuole una lettura che stimoli il pensiero.
Focus: l'innovazione in salute come proxy della qualità della vita futura. Dove sta andando la ricerca, quali tecnologie cambieranno la medicina nei prossimi 5 anni, implicazioni per gli investitori.
Angolo preferito: "quello che la scienza ci dice sul futuro della salute — e le implicazioni per il business".
Includi sempre il link a ideasmart.ai/health.`,
    };
    slotNote = eveningNotes[section] ?? eveningNotes.finance;
  }

  return `Basandoti sull'editoriale di IDEASMART e sui dati di mercato forniti, scrivi un post LinkedIn di alto profilo.

${slotNote}

TEMA EDITORIALE: ${title}
TREND CHIAVE: ${keyTrend || "Agenti AI autonomi e trasformazione digitale"}
CONTENUTO EDITORIALE:
${body.slice(0, 1200)}
${dataSection}

STRUTTURA DEL POST:
1. APERTURA (2-3 righe): Inizia con un dato di mercato specifico o un'osservazione controcorrente che sfida il pensiero convenzionale. NON iniziare con "Oggi parliamo di..." o simili. Scrivi in prima persona.
2. ANALISI (3-4 paragrafi brevi): Collega i dati a implicazioni strategiche concrete per aziende italiane/europee. Usa i dati di mercato forniti. Sii specifico sulle implicazioni operative, non solo sulle tendenze. Usa "io", "ho analizzato", "la mia lettura".
3. POSIZIONE (1 paragrafo): Qual è la tua lettura personale come imprenditore? Dove vedi il rischio che gli altri non vedono?
4. FIRMA: Aggiungi ESATTAMENTE questa riga su una riga separata: "Andrea Cinelli | Opinion Leader & Editorialista IdeaSmart Research"
5. CHIUSURA: Aggiungi ESATTAMENTE questa riga: "📊 Analisi completa su IDEASMART → ${SITE_BASE_URL}${meta.path}"
6. HASHTAG: ${meta.hashtags.join(" ")}

LUNGHEZZA: 1400-1900 caratteri totali
LINGUA: Italiano
TONO: Senior analyst con skin in the game — non consulente teorico, non blogger motivazionale
EVITA: "rivoluzione", "game changer", "il futuro è adesso", "non possiamo permetterci di", frasi retoriche vuote`;
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
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    };

    const response = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
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
        "Referer": "https://ideasmart.ai",
      },
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
        "Content-Type": contentType,
      },
      body: imageBuffer,
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
      error: "Credenziali LinkedIn non configurate (LINKEDIN_ACCESS_TOKEN o LINKEDIN_AUTHOR_URN mancanti)",
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
        // Attendi 3 secondi per processing LinkedIn
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
              title: { text: articleTitle.slice(0, 200) },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
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
              title: { text: articleTitle.slice(0, 200) },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };
    console.log("[LinkedIn] 🔗 Formato: ARTICLE (link preview nel feed)");
  }

  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
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
      error: `HTTP ${response.status}: ${JSON.stringify(errorData)}`,
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
        { role: "user", content: prompt },
      ],
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
      meta.hashtags.join(" "),
    ].join("\n");
  }
}

// ── Funzione principale per un singolo slot ──────────────────────────────────
/**
 * Pubblica un post LinkedIn per lo slot specificato (morning o afternoon).
 * Controlla idempotenza: se il post per questo slot è già stato pubblicato oggi, salta.
 *
 * @param slot - 'morning' (10:30 CET) o 'afternoon' (15:00 CET)
 * @param force - Se true, bypassa il controllo idempotenza (per trigger manuali)
 */
export async function publishLinkedInPost(
  slot: LinkedInSlot,
  force = false
): Promise<{
  published: number;
  errors: string[];
  posts: Array<{ section: string; title: string; success: boolean; postId?: string; error?: string }>;
}> {
  const slotLabel = slot === "morning" ? "MATTINO (10:30)" : slot === "startup-afternoon" ? "STARTUP POMERIGGIO (13:00)" : slot === "afternoon" ? "POMERIGGIO (15:00)" : "SERA (17:30)";
  console.log(`[LinkedIn] 🚀 Avvio pubblicazione slot ${slotLabel}...`);

  // ── Controllo idempotenza: evita doppi post ──────────────────────────────
  // Usa la data CET (Europe/Rome) per evitare il bug UTC vs CET che causava
  // doppi post quando il server si riavviava dopo mezzanotte UTC ma prima di
  // mezzanotte CET (es. 23:00 UTC = 00:00 CET del giorno successivo).
  // Il UNIQUE constraint DB (uq_linkedin_date_slot) è il secondo livello di protezione.
  const today = getTodayCET(); // YYYY-MM-DD in CET/CEST
  let recentImageUrls: string[] = []; // Immagini usate di recente (per evitare ripetizioni)
  try {
    const db = await getDb();
    if (db) {
      // Controllo slot: esiste già un post per questo slot oggi?
      const existing = await db.select({ id: linkedinPosts.id, postText: linkedinPosts.postText })
        .from(linkedinPosts)
        .where(and(
          eq(linkedinPosts.dateLabel, today),
          eq(linkedinPosts.slot, slot)
        ))
        .limit(1);
      if (existing.length > 0) {
        if (force) {
          console.log(`[LinkedIn] ⚡ Modalità FORCE: post slot ${slotLabel} già presente nel DB (id=${existing[0].id}), ma force=true — procedo con nuovo post.`);
        } else {
          console.log(`[LinkedIn] ⏭️ Post slot ${slotLabel} già pubblicato oggi (${today} CET) — saltato.`);
          return { published: 0, errors: [], posts: [] };
        }
      } else if (force) {
        console.log(`[LinkedIn] ⚡ Modalità FORCE attiva per slot ${slotLabel} — nessun post esistente, procedo.`);
      }

      // Recupera le immagini usate negli ultimi 7 giorni per evitare ripetizioni
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoLabel = sevenDaysAgo.toLocaleDateString("sv-SE", { timeZone: TZ_ROME });
      const recentPosts = await db.select({ imageUrl: linkedinPosts.imageUrl })
        .from(linkedinPosts)
        .where(gte(linkedinPosts.dateLabel, sevenDaysAgoLabel))
        .orderBy(desc(linkedinPosts.createdAt))
        .limit(20);
      recentImageUrls = recentPosts
        .map(p => p.imageUrl)
        .filter((u): u is string => !!u);
      if (recentImageUrls.length > 0) {
        console.log(`[LinkedIn] 🖼️ Esclusione ${recentImageUrls.length} immagini usate di recente`);
      }
    }
  } catch (checkErr) {
    console.warn('[LinkedIn] ⚠️ Controllo idempotenza fallito, procedo con cautela:', checkErr);
  }

  // Seleziona la sezione in base al giorno e allo slot
  const section = selectSection(slot);
  const meta = SECTION_META[section];

  console.log(`[LinkedIn] 📅 Slot: ${slotLabel} → Sezione: ${meta.label}`);

  // 1. Recupera l'editoriale del giorno
  let editorial;
  try {
    editorial = await getLatestEditorial(section);
  } catch (err) {
    console.error("[LinkedIn] ❌ Errore recupero editoriale:", err);
    return { published: 0, errors: ["Errore recupero editoriale dal DB"], posts: [] };
  }

  if (!editorial) {
    console.warn(`[LinkedIn] ⚠️ Nessun editoriale trovato per sezione '${section}'. Pubblicazione saltata.`);
    return {
      published: 0,
      errors: [`Nessun editoriale disponibile per sezione '${section}'`],
      posts: [],
    };
  }

  console.log(`[LinkedIn] 📝 Editoriale trovato: "${editorial.title.slice(0, 60)}..."`);

  // 2. Cerca dati di market intelligence + immagine da fonti autorevoli
  console.log("[LinkedIn] 🔍 Ricerca dati market intelligence...");
  // getMarketIntelligence accetta solo 'ai' | 'startup', per le altre sezioni usiamo 'ai'
  const marketIntelSection: "ai" | "startup" = (section === "startup") ? "startup" : "ai";
  const { data: marketData, image: marketImage } = await getMarketIntelligence(
    `${editorial.title} ${editorial.keyTrend ?? ""}`,
    marketIntelSection
  );

  if (marketData) {
    console.log(`[LinkedIn] 📊 Dati trovati: ${marketData.stats.length} statistiche`);
    console.log(`[LinkedIn] 💡 Key finding: ${marketData.keyFinding?.slice(0, 80)}`);
  } else {
    console.warn("[LinkedIn] ⚠️ Nessun dato di market intelligence trovato");
  }

  // 3. Determina l'immagine da usare
  // Priorità: immagine da fonte autorevole RSS > Pexels tematica > immagine editoriale
  // In tutti i casi, si escludono le immagini usate negli ultimi 7 giorni.
  let imageUrl: string | null | undefined = null;
  let imageSource = "";

  if (marketImage && !recentImageUrls.includes(marketImage.imageUrl)) {
    // Immagine da RSS autorevole, non usata di recente
    imageUrl = marketImage.imageUrl;
    imageSource = marketImage.source;
    console.log(`[LinkedIn] 🖼️ Immagine da fonte autorevole: ${imageSource}`);
    console.log(`[LinkedIn]    "${marketImage.title.slice(0, 60)}"`);
  } else {
    // Cerca immagine tematica su Pexels, coerente col tema del post
    console.log("[LinkedIn] 🔍 Ricerca immagine tematica su Pexels...");
    // findEditorialImage accetta 'ai' | 'startup'; per le altre sezioni mappiamo a 'ai'
    const pexelsSectionArg: "ai" | "startup" = (section === "startup") ? "startup" : "ai";
    const pexelsImage = await findEditorialImage(
      editorial.title,
      editorial.keyTrend ?? "",
      pexelsSectionArg,
      recentImageUrls
    );
    if (pexelsImage) {
      imageUrl = pexelsImage;
      imageSource = "Pexels (tematica)";
      console.log(`[LinkedIn] 🖼️ Immagine tematica Pexels trovata`);
    } else if (editorial.imageUrl && !recentImageUrls.includes(editorial.imageUrl)) {
      imageUrl = editorial.imageUrl;
      imageSource = "editoriale";
      console.log("[LinkedIn] 🖼️ Uso immagine dall'editoriale (fallback)");
    } else if (editorial.imageUrl) {
      // Ultima risorsa: usa l'immagine editoriale anche se già usata
      imageUrl = editorial.imageUrl;
      imageSource = "editoriale (riuso)";
      console.log("[LinkedIn] ⚠️ Immagine editoriale già usata di recente, ma è l'unica disponibile");
    } else {
      console.warn("[LinkedIn] ⚠️ Nessuna immagine disponibile");
    }
  }

  // 4. Genera il testo del post con LLM in stile Gartner
  const postText = await generateLinkedInPostText(
    editorial.title,
    editorial.body,
    editorial.keyTrend ?? "",
    section,
    marketData,
    slot
  );

  // 5. Controllo hash duplicati: blocca se testo identico già pubblicato negli ultimi 7 giorni
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
          console.warn(`[LinkedIn] 🚫 CONTENUTO DUPLICATO rilevato! Hash ${postHash} già presente nel DB (slot ${dup.slot} del ${dup.dateLabel}) — pubblicazione bloccata.`);
          return {
            published: 0,
            errors: [`Contenuto duplicato: testo identico già pubblicato il ${dup.dateLabel} (slot ${dup.slot})`],
            posts: [{ section, title: editorial.title, success: false, error: "Contenuto duplicato" }],
          };
        } else {
          console.warn(`[LinkedIn] ⚠️ CONTENUTO DUPLICATO ma force=true: procedo comunque (hash ${postHash})`);
        }
      } else {
        console.log(`[LinkedIn] ✅ Hash contenuto unico: ${postHash}`);
      }
    }
  } catch (hashCheckErr) {
    console.warn('[LinkedIn] ⚠️ Controllo hash duplicati fallito, procedo:', hashCheckErr);
  }

  // 6. URL di destinazione: pagina sezione su IDEASMART
  const articleUrl = `${SITE_BASE_URL}${meta.path}`;

  // 7. Pubblica su LinkedIn
  console.log(`[LinkedIn] 🚀 Pubblicazione post — Slot: ${slotLabel} — Sezione: ${meta.label}`);
  console.log(`[LinkedIn]    Titolo: ${editorial.title.slice(0, 60)}...`);
  console.log(`[LinkedIn]    Immagine: ${imageUrl ? `✅ (${imageSource})` : "❌ assente"}`);
  console.log(`[LinkedIn]    Dati market intel: ${marketData ? "✅" : "❌"}`);
  console.log(`[LinkedIn]    Testo (prime 200 char): ${postText.slice(0, 200)}`);

  const result = await publishToLinkedIn(
    postText,
    articleUrl,
    imageUrl,
    editorial.title,
    editorial.subtitle ?? editorial.body.slice(0, 200)
  );

  const posts = [
    {
      section,
      title: editorial.title,
      success: result.success,
      postId: result.postId,
      error: result.error,
    },
  ];

  if (result.success) {
    console.log(`[LinkedIn] ✅ Post slot ${slotLabel} pubblicato con successo`);

    // Salva il post nel DB per la sezione "Punto del Giorno" nella Home
    try {
      const db = await getDb();
      if (db) {
        const today = new Date();
        const dateLabel = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // Costruisci URL LinkedIn dal postId
        let linkedinUrl: string | undefined;
        if (result.postId && result.postId !== 'unknown') {
          const numericId = result.postId.replace(/^urn:li:ugcPost:/, '').replace(/^urn:li:share:/, '');
          linkedinUrl = `https://www.linkedin.com/posts/andreacinelli_${numericId}`;
        }

        // Estrai hashtags dal testo del post
        const hashtagMatches = postText.match(/#[\w]+/g);
        const hashtags = hashtagMatches ? hashtagMatches.slice(0, 10).join(' ') : '';

        await db.insert(linkedinPosts)
          .values({
            dateLabel,
            slot,
            postText,
            linkedinUrl: linkedinUrl ?? null,
            title: editorial.title,
            section: section as any,
            imageUrl: imageUrl ?? null,
            hashtags,
            postHash,
          })
          .onDuplicateKeyUpdate({
            set: {
              postText,
              linkedinUrl: linkedinUrl ?? null,
              title: editorial.title,
              imageUrl: imageUrl ?? null,
              hashtags,
              postHash,
            },
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
 * Mantenuta per compatibilità con lo scheduler esistente.
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
