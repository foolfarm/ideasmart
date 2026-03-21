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

import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { getLatestEditorial, getDb } from "./db";
import { getMarketIntelligence, type MarketIntelligenceResult } from "./marketIntelligence";
import { linkedinPosts } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const SITE_BASE_URL = "https://ideasmart.ai";

// ── Slot giornalieri ─────────────────────────────────────────────────────────
export type LinkedInSlot = "morning" | "afternoon" | "evening";

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

// ── Seleziona la sezione in base al giorno e allo slot ───────────────────────
/**
 * Morning: AI nei giorni pari (Lun, Mer, Ven, Dom), Startup nei dispari
 * Afternoon: sezione opposta rispetto al mattino (per diversificare i contenuti)
 * Evening: sempre 'ai' (tema fisso: vibe coding / AI / startup / mercato)
 */
function selectSection(slot: LinkedInSlot): "ai" | "startup" {
  if (slot === "evening") return "ai"; // sera: sempre AI (tema vibe coding/mercato)
  const dayOfWeek = new Date().getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab
  const morningSection: "ai" | "startup" = [1, 3, 5, 0].includes(dayOfWeek) ? "ai" : "startup";
  if (slot === "morning") return morningSection;
  // Afternoon: sezione opposta
  return morningSection === "ai" ? "startup" : "ai";
}

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

  const slotNote = slot === "morning"
    ? "Questo è il POST DEL MATTINO (10:30): tono analitico e strategico, dati e implicazioni per i decision maker."
    : slot === "afternoon"
    ? "Questo è il POST DEL POMERIGGIO (15:00): tono più operativo e pratico, focus su casi d'uso concreti e takeaway immediati per i professionisti."
    : `Questo è il POST DELLA SERA (17:30): tema VIBE CODING e come l'AI sta ridefinendo il modo di costruire software, fare startup e competere nel mercato. Parla di come il vibe coding (scrivere codice con AI in modo intuitivo, senza barriere tecniche) sta abbassando le barriere all'ingresso per gli imprenditori italiani. Focus su: impatto sul mercato del lavoro tech, nuove opportunità per i non-tecnici, come le startup stanno accelerando il time-to-market con AI. Tono: imprenditore che ha vissuto questa transizione in prima persona, non teorico.`;

  return `Basandoti sull'editoriale di IDEASMART e sui dati di mercato forniti, scrivi un post LinkedIn di alto profilo.

${slotNote}

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
  section: string,
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
  const slotLabel = slot === "morning" ? "MATTINO (10:30)" : slot === "afternoon" ? "POMERIGGIO (15:00)" : "SERA (17:30)";
  console.log(`[LinkedIn] 🚀 Avvio pubblicazione slot ${slotLabel}...`);

  // ── Controllo idempotenza: evita doppi post ──────────────────────────────
  // Il controllo viene SEMPRE eseguito, anche in modalità force.
  // La modalità force bypassa solo il blocco per i cron automatici (non per i trigger manuali).
  // Il UNIQUE constraint DB (uq_linkedin_date_slot) è il secondo livello di protezione.
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
  try {
    const db = await getDb();
    if (db) {
      const existing = await db.select({ id: linkedinPosts.id })
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
          console.log(`[LinkedIn] ⏭️ Post slot ${slotLabel} già pubblicato oggi (${today}) — saltato.`);
          return { published: 0, errors: [], posts: [] };
        }
      } else if (force) {
        console.log(`[LinkedIn] ⚡ Modalità FORCE attiva per slot ${slotLabel} — nessun post esistente, procedo.`);
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
    marketData,
    slot
  );

  // 5. URL di destinazione: pagina sezione su IDEASMART
  const articleUrl = `${SITE_BASE_URL}${meta.path}`;

  // 6. Pubblica su LinkedIn
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
          })
          .onDuplicateKeyUpdate({
            set: {
              postText,
              linkedinUrl: linkedinUrl ?? null,
              title: editorial.title,
              imageUrl: imageUrl ?? null,
              hashtags,
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
