/**
 * IDEASMART — LinkedIn Autopost
 *
 * Pubblica 1 post giornaliero alle 10:00 CET su LinkedIn — tono HumanLess, dati da fonti autorevoli.
 *
 * Flusso:
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

import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { getLatestEditorial, getDb } from "./db";
import { getMarketIntelligence, type MarketIntelligenceResult } from "./marketIntelligence";
import { linkedinPosts } from "../drizzle/schema";

const SITE_BASE_URL = "https://ideasmart.ai";

// ── Sezioni supportate (no musica) ──────────────────────────────────────────
const SUPPORTED_SECTIONS: Array<"ai" | "startup"> = ["ai", "startup"];

const SECTION_META: Record<string, { label: string; hashtags: string[]; path: string }> = {
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
};

// ── Prompt LLM: stile senior analyst Gartner ────────────────────────────────

const SYSTEM_PROMPT_GARTNER = `Sei un senior analyst con 20+ anni di esperienza nell'ecosistema tech e imprenditoriale italiano ed europeo.
Scrivi post LinkedIn con il rigore analitico di un senior analyst Gartner o McKinsey, ma con la voce diretta di chi ha vissuto queste dinamiche sul campo.

Il tuo stile:
- Parti sempre da un dato concreto o un'osservazione di mercato precisa — mai da un'opinione generica
- Usi numeri e percentuali specifici per ancorare l'analisi alla realtà
- Distingui tra segnali di mercato e noise — e lo dici esplicitamente
- Il tuo tono è quello di chi ha letto il report McKinsey E ha gestito aziende: non accademico, non motivazionale
- Scrivi in italiano con terminologia tecnica in inglese quando necessario
- Massimo 2 emoji per post, usate con parsimonia
- Non usi mai frasi come "il futuro è adesso", "rivoluzione", "game changer" — troppo logore
- Concludi sempre con una domanda o provocazione che stimola il dibattito tra peer

Il tuo pubblico: CEO, CTO, investitori, imprenditori italiani e europei. Persone che leggono Economist e HBR, non TechCrunch.`;

function buildGartnerPrompt(
  title: string,
  body: string,
  keyTrend: string,
  section: string,
  marketData: MarketIntelligenceResult | null
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

  return `Basandoti sull'editoriale di IDEASMART e sui dati di mercato forniti, scrivi un post LinkedIn di alto profilo.

TEMA EDITORIALE: ${title}
TREND CHIAVE: ${keyTrend || "Agenti AI autonomi e trasformazione digitale"}
CONTENUTO EDITORIALE:
${body.slice(0, 1200)}
${dataSection}

STRUTTURA DEL POST:
1. APERTURA (2-3 righe): Inizia con un dato di mercato specifico o un'osservazione controcorrente che sfida il pensiero convenzionale. NON iniziare con "Oggi parliamo di..." o simili.
2. ANALISI (3-4 paragrafi brevi): Collega i dati a implicazioni strategiche concrete per aziende italiane/europee. Usa i dati di mercato forniti. Sii specifico sulle implicazioni operative, non solo sulle tendenze.
3. POSIZIONE (1 paragrafo): Qual è la tua lettura personale come imprenditore? Dove vedi il rischio che gli altri non vedono?
4. CHIUSURA: Aggiungi ESATTAMENTE questa riga: "📊 Analisi completa su IDEASMART → ${SITE_BASE_URL}${meta.path}"
5. HASHTAG: ${meta.hashtags.join(" ")}

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
async function publishToLinkedIn(
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
    console.log("[LinkedIn] 🔗 Formato: ARTICLE (link preview, nessuna immagine)");
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
  section: string,
  marketData: MarketIntelligenceResult | null
): Promise<string> {
  try {
    const prompt = buildGartnerPrompt(title, body, keyTrend, section, marketData);
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
    const meta = SECTION_META[section] ?? SECTION_META.ai;
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

// ── Funzione principale ───────────────────────────────────────────────────────
/**
 * Pubblica 1 post giornaliero su LinkedIn basato sull'editoriale del giorno.
 * Alterna tra sezione 'ai' e 'startup' in base al giorno della settimana:
 * - Lunedì, Mercoledì, Venerdì, Domenica → AI4Business
 * - Martedì, Giovedì, Sabato → Startup News
 *
 * Il post include dati da fonti di market intelligence (McKinsey, Gartner, CBInsights)
 * e un'immagine da feed RSS autorevoli (VentureBeat, CBInsights, TechCrunch AI).
 *
 * Chiamata dallo scheduler giornaliero alle 10:00 CET.
 */
export async function publishDailyLinkedInPosts(): Promise<{
  published: number;
  errors: string[];
  posts: Array<{ section: string; title: string; success: boolean; postId?: string; error?: string }>;
}> {
  console.log("[LinkedIn] 🚀 Avvio pubblicazione giornaliera editoriale...");

  // Seleziona la sezione in base al giorno della settimana
  const dayOfWeek = new Date().getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab
  const section: "ai" | "startup" = [1, 3, 5, 0].includes(dayOfWeek) ? "ai" : "startup";
  const meta = SECTION_META[section];

  console.log(`[LinkedIn] 📅 Giorno ${dayOfWeek} → Sezione: ${meta.label}`);

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
  const { data: marketData, image: marketImage } = await getMarketIntelligence(
    `${editorial.title} ${editorial.keyTrend ?? ""}`,
    section
  );

  if (marketData) {
    console.log(`[LinkedIn] 📊 Dati trovati: ${marketData.stats.length} statistiche`);
    console.log(`[LinkedIn] 💡 Key finding: ${marketData.keyFinding?.slice(0, 80)}`);
  } else {
    console.warn("[LinkedIn] ⚠️ Nessun dato di market intelligence trovato");
  }

  // 3. Determina l'immagine da usare
  // Priorità: immagine da fonte market intelligence > immagine editoriale DB
  let imageUrl: string | null | undefined = null;
  let imageSource = "";

  if (marketImage) {
    imageUrl = marketImage.imageUrl;
    imageSource = marketImage.source;
    console.log(`[LinkedIn] 🖼️ Immagine da fonte autorevole: ${imageSource}`);
    console.log(`[LinkedIn]    "${marketImage.title.slice(0, 60)}"`);
  } else if (editorial.imageUrl) {
    imageUrl = editorial.imageUrl;
    imageSource = "editoriale";
    console.log("[LinkedIn] 🖼️ Uso immagine dall'editoriale (fallback)");
  } else {
    console.warn("[LinkedIn] ⚠️ Nessuna immagine disponibile");
  }

  // 4. Genera il testo del post con LLM in stile Gartner
  const postText = await generateLinkedInPostText(
    editorial.title,
    editorial.body,
    editorial.keyTrend ?? "",
    section,
    marketData
  );

  // 5. URL di destinazione: pagina sezione su IDEASMART
  const articleUrl = `${SITE_BASE_URL}${meta.path}`;

  // 6. Pubblica su LinkedIn
  console.log(`[LinkedIn] 🚀 Pubblicazione post — Sezione: ${meta.label}`);
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
    console.log(`[LinkedIn] ✅ Post pubblicato con successo per sezione '${section}'`);

    // Salva il post nel DB per la sezione "Punto del Giorno" nella Home
    try {
      const db = await getDb();
      if (db) {
        const today = new Date();
        const dateLabel = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // Costruisci URL LinkedIn dal postId (formato: urn:li:ugcPost:XXXXXXXX)
        let linkedinUrl: string | undefined;
        if (result.postId && result.postId !== 'unknown') {
          // Estrai il numero numerico dall'URN se presente
          const numericId = result.postId.replace(/^urn:li:ugcPost:/, '');
          linkedinUrl = `https://www.linkedin.com/feed/update/${result.postId.startsWith('urn:') ? result.postId : `urn:li:ugcPost:${numericId}`}/`;
        }

        // Estrai hashtags dal testo del post
        const hashtagMatches = postText.match(/#[\w]+/g);
        const hashtags = hashtagMatches ? hashtagMatches.slice(0, 10).join(' ') : '';

        // Usa il titolo dell'editoriale come titolo del post
        const title = editorial.title;

        await db.insert(linkedinPosts)
          .values({
            dateLabel,
            postText,
            linkedinUrl: linkedinUrl ?? null,
            title,
            section: section as any,
            imageUrl: imageUrl ?? null,
            hashtags,
          })
          .onDuplicateKeyUpdate({
            set: {
              postText,
              linkedinUrl: linkedinUrl ?? null,
              title,
              imageUrl: imageUrl ?? null,
              hashtags,
            },
          });
        console.log(`[LinkedIn] 💾 Post salvato nel DB per Punto del Giorno (${dateLabel})`);
      }
    } catch (dbErr) {
      console.error('[LinkedIn] ⚠️ Errore salvataggio post nel DB:', dbErr);
      // Non blocca il flusso principale
    }

    return { published: 1, errors: [], posts };
  } else {
    console.error(`[LinkedIn] ❌ Pubblicazione fallita:`, result.error);
    return { published: 0, errors: [result.error ?? "Errore sconosciuto"], posts };
  }
}

// Export per compatibilità
export { SUPPORTED_SECTIONS };
