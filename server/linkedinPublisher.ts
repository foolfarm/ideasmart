/**
 * IDEASMART — LinkedIn Autopost
 *
 * Pubblica 1 post giornaliero alle 10:00 CET sul profilo LinkedIn di Andrea Cinelli.
 * Il post è basato sull'editoriale AI del giorno, riscritto in stile thought leader
 * da un LLM che imita il tono di Andrea Cinelli (CEO, serial entrepreneur, AI expert).
 *
 * Struttura del post:
 *  - Hook provocatorio (1-2 righe)
 *  - Analisi editoriale (3-4 paragrafi brevi, tono diretto e autorevole)
 *  - CTA verso IDEASMART
 *  - Hashtag tematici
 *  - Immagine Pexels coerente con il tema
 *
 * Sezioni supportate: 'ai' e 'startup' (no musica)
 */

import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { getLatestEditorial } from "./db";
import { findEditorialImage, findStockImage } from "./stockImages";

const SITE_BASE_URL = "https://ideasmart.ai";

// ── Sezioni supportate (no musica) ──────────────────────────────────────────
const SUPPORTED_SECTIONS: Array<"ai" | "startup"> = ["ai", "startup"];

const SECTION_META: Record<string, { label: string; hashtags: string[]; path: string }> = {
  ai: {
    label: "AI4Business",
    hashtags: ["#AI", "#ArtificialIntelligence", "#Tech", "#Innovation", "#IDEASMART", "#FutureOfWork", "#AIBusiness"],
    path: "/ai",
  },
  startup: {
    label: "Startup News",
    hashtags: ["#Startup", "#VentureCapital", "#Innovation", "#Entrepreneurship", "#IDEASMART", "#Tech", "#Funding"],
    path: "/startup",
  },
};

// ── Prompt LLM per generare il testo del post ────────────────────────────────
const SYSTEM_PROMPT = `Sei Andrea Cinelli, CEO di FoolFarm, serial entrepreneur italiano con 20.595 follower su LinkedIn.
Il tuo stile è:
- Diretto, autorevole, mai banale
- Mescoli dati concreti con visione strategica
- Usi frasi brevi e incisive, mai accademiche
- Parli in prima persona, come se stessi condividendo una riflessione personale
- Non usi emoji in modo eccessivo (massimo 2-3 nel post intero)
- Sei provocatorio ma costruttivo
- Scrivi in italiano, con qualche termine tecnico in inglese quando necessario

Il tuo pubblico è: CEO, manager, investitori, imprenditori italiani interessati ad AI e startup.`;

const USER_PROMPT_TEMPLATE = (title: string, body: string, keyTrend: string, section: string) => {
  const meta = SECTION_META[section] ?? SECTION_META.ai;
  return `Basandoti su questo editoriale di IDEASMART, scrivi un post LinkedIn di alto profilo come se fossi Andrea Cinelli.

TITOLO EDITORIALE: ${title}
TREND CHIAVE: ${keyTrend || "AI e innovazione"}
CONTENUTO EDITORIALE:
${body.slice(0, 1500)}

ISTRUZIONI PER IL POST:
1. Inizia con un hook provocatorio o una domanda che cattura l'attenzione (1-2 righe)
2. Scrivi 3-4 paragrafi brevi (2-3 righe ciascuno) con analisi e punto di vista personale
3. Concludi con una riflessione o call-to-action
4. Aggiungi questa riga finale ESATTAMENTE così: "📰 Approfondisci su IDEASMART → ${SITE_BASE_URL}${meta.path}"
5. Poi aggiungi gli hashtag: ${meta.hashtags.join(" ")}

LUNGHEZZA: 1200-1800 caratteri totali (ottimale per LinkedIn)
LINGUA: Italiano
STILE: Thought leader, non giornalistico. Parla in prima persona.
NON includere il titolo dell'editoriale letteralmente — rielaboralo nel tuo stile.`;
};

// ── Pubblicazione su LinkedIn API ────────────────────────────────────────────
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
    return { success: false, error: "Credenziali LinkedIn non configurate (LINKEDIN_ACCESS_TOKEN o LINKEDIN_AUTHOR_URN mancanti)" };
  }

  // Corpo del post LinkedIn con link preview ARTICLE
  const body: Record<string, unknown> = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text,
        },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            description: {
              text: articleSummary.slice(0, 256),
            },
            originalUrl: articleUrl,
            title: {
              text: articleTitle.slice(0, 200),
            },
            ...(imageUrl
              ? {
                  thumbnails: [
                    {
                      resolvedUrl: imageUrl,
                    },
                  ],
                }
              : {}),
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

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

// ── Genera testo post con LLM in stile Andrea Cinelli ────────────────────────
async function generateLinkedInPostText(
  title: string,
  body: string,
  keyTrend: string,
  section: string
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_PROMPT_TEMPLATE(title, body, keyTrend, section) },
      ],
    });

    const content = response?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim().length > 100) {
      console.log("[LinkedIn] ✅ Testo post generato con LLM");
      return content.trim();
    }
    throw new Error("Risposta LLM vuota o troppo corta");
  } catch (err) {
    console.warn("[LinkedIn] ⚠️ LLM fallito, uso testo fallback:", err);
    // Fallback: testo semplice senza LLM
    const meta = SECTION_META[section] ?? SECTION_META.ai;
    return [
      `${title}`,
      "",
      body.slice(0, 800),
      "",
      `📰 Approfondisci su IDEASMART → ${SITE_BASE_URL}${meta.path}`,
      "",
      meta.hashtags.join(" "),
    ].join("\n");
  }
}

// ── Funzione principale ───────────────────────────────────────────────────────
/**
 * Pubblica 1 post giornaliero su LinkedIn basato sull'editoriale AI del giorno.
 * Alterna tra sezione 'ai' e 'startup' in base al giorno della settimana:
 * - Lunedì, Mercoledì, Venerdì, Domenica → AI4Business
 * - Martedì, Giovedì, Sabato → Startup News
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

  // 2. Genera il testo del post con LLM in stile Andrea Cinelli
  const postText = await generateLinkedInPostText(
    editorial.title,
    editorial.body,
    editorial.keyTrend ?? "",
    section
  );

  // 3. Recupera immagine: usa quella dell'editoriale o cerca su Pexels
  let imageUrl = editorial.imageUrl;
  if (!imageUrl) {
    console.log("[LinkedIn] 🖼️ Nessuna immagine nell'editoriale, cerco su Pexels...");
    try {
      imageUrl = await findEditorialImage(editorial.title, editorial.keyTrend ?? "AI innovation");
      console.log(`[LinkedIn] 🖼️ Immagine Pexels trovata: ${imageUrl ? "✅" : "❌"}`);
    } catch (err) {
      console.warn("[LinkedIn] ⚠️ Errore ricerca immagine Pexels:", err);
    }
  } else {
    console.log("[LinkedIn] 🖼️ Uso immagine dall'editoriale ✅");
  }

  // 4. URL di destinazione: pagina sezione su IDEASMART
  const articleUrl = `${SITE_BASE_URL}${meta.path}`;

  // 5. Pubblica su LinkedIn
  console.log(`[LinkedIn] 🚀 Pubblicazione post — Sezione: ${meta.label}`);
  console.log(`[LinkedIn]    Titolo editoriale: ${editorial.title.slice(0, 60)}...`);
  console.log(`[LinkedIn]    Immagine: ${imageUrl ? "✅ presente" : "❌ assente"}`);
  console.log(`[LinkedIn]    Testo post (prime 200 char): ${postText.slice(0, 200)}...`);

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
    return { published: 1, errors: [], posts };
  } else {
    console.error(`[LinkedIn] ❌ Pubblicazione fallita:`, result.error);
    return { published: 0, errors: [result.error ?? "Errore sconosciuto"], posts };
  }
}
