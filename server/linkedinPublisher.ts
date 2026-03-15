/**
 * IDEASMART — LinkedIn Auto-Publisher
 * ─────────────────────────────────────────────────────────────────────────────
 * Pubblica automaticamente le 3 notizie più importanti del giorno su LinkedIn.
 *
 * Strategia di selezione top 3:
 *  - 1 notizia dalla sezione AI (posizione 1)
 *  - 1 notizia dalla sezione Music (posizione 1)
 *  - 1 notizia dalla sezione Startup (posizione 1)
 *
 * Formato del post LinkedIn:
 *  - Testo con emoji sezione + titolo + sommario + CTA verso IDEASMART
 *  - Link preview ARTICLE con immagine della notizia
 *  - URL di destinazione: pagina sezione su ideasmart.ai
 *  - Hashtag tematici
 *
 * Token LinkedIn: scade ogni 2 mesi — aggiornare manualmente in Secrets.
 */

import { ENV } from "./_core/env";
import { getLatestNews } from "./db";

const LINKEDIN_API_URL = "https://api.linkedin.com/v2/ugcPosts";

// Emoji e hashtag per sezione
const SECTION_META: Record<string, { emoji: string; hashtags: string[]; label: string }> = {
  ai: {
    emoji: "🤖",
    label: "AI4Business",
    hashtags: ["#AI", "#ArtificialIntelligence", "#Tech", "#Innovation", "#IDEASMART"],
  },
  music: {
    emoji: "🎵",
    label: "ITsMusic",
    hashtags: ["#Music", "#MusicIndustry", "#ITsMusic", "#IDEASMART"],
  },
  startup: {
    emoji: "🚀",
    label: "Startup News",
    hashtags: ["#Startup", "#Innovation", "#Entrepreneurship", "#Business", "#IDEASMART"],
  },
};

// URL base del sito e percorsi per sezione
const SITE_BASE_URL = "https://ideasmart.ai";
const SECTION_PATHS: Record<string, string> = {
  ai: "/ai",
  music: "/music",
  startup: "/startup",
};

/**
 * Pubblica un singolo post su LinkedIn con link preview e immagine.
 * Usa shareMediaCategory: "ARTICLE" per mostrare il link preview con immagine.
 */
async function publishToLinkedIn(
  text: string,
  articleUrl: string,
  imageUrl?: string | null,
  articleTitle?: string,
  articleDescription?: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const token = ENV.linkedinAccessToken;
  const authorUrn = ENV.linkedinAuthorUrn;

  if (!token || !authorUrn) {
    return { success: false, error: "LINKEDIN_ACCESS_TOKEN o LINKEDIN_AUTHOR_URN non configurati" };
  }

  // Costruisce il media per il link preview
  const media: Record<string, unknown>[] = [
    {
      status: "READY",
      description: {
        text: articleDescription ? articleDescription.slice(0, 200) : "",
      },
      originalUrl: articleUrl,
      title: {
        text: articleTitle ? articleTitle.slice(0, 200) : "",
      },
      ...(imageUrl
        ? {
            thumbnails: [
              {
                url: imageUrl,
              },
            ],
          }
        : {}),
    },
  ];

  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text,
        },
        shareMediaCategory: "ARTICLE",
        media,
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  try {
    const response = await fetch(LINKEDIN_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (response.status === 201) {
      const postId = response.headers.get("X-RestLi-Id") || response.headers.get("x-restli-id") || "unknown";
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

/**
 * Formatta il testo del post LinkedIn per una notizia.
 * Il link preview viene gestito separatamente tramite il campo media.
 */
function formatPostText(
  section: string,
  title: string,
  summary: string
): string {
  const meta = SECTION_META[section] ?? SECTION_META.ai;
  const sectionPath = SECTION_PATHS[section] ?? "/";
  const siteUrl = `${SITE_BASE_URL}${sectionPath}`;

  // Tronca il sommario a 250 caratteri per il corpo del post
  const shortSummary = summary.length > 250 ? summary.slice(0, 247) + "..." : summary;

  const lines: string[] = [
    `${meta.emoji} ${title}`,
    "",
    shortSummary,
    "",
    `📰 Leggi l'articolo completo su IDEASMART → ${siteUrl}`,
    "",
    meta.hashtags.join(" "),
  ];

  return lines.join("\n");
}

/**
 * Recupera la notizia più importante (posizione 1) per ogni sezione,
 * includendo imageUrl per il link preview LinkedIn.
 */
async function getTop3News(): Promise<Array<{
  section: string;
  title: string;
  summary: string;
  sourceUrl?: string | null;
  imageUrl?: string | null;
}>> {
  const sections: Array<"ai" | "music" | "startup"> = ["ai", "music", "startup"];
  const top3 = [];

  for (const section of sections) {
    try {
      const news = await getLatestNews(1, section);
      if (news.length > 0) {
        const item = news[0];
        top3.push({
          section,
          title: item.title,
          summary: item.summary,
          sourceUrl: item.sourceUrl,
          imageUrl: item.imageUrl,
        });
      }
    } catch (err) {
      console.error(`[LinkedIn] ⚠️ Impossibile recuperare notizie per sezione ${section}:`, err);
    }
  }

  return top3;
}

/**
 * Funzione principale: pubblica le 3 notizie top del giorno su LinkedIn.
 * Ogni post include:
 *  - Testo con titolo, sommario e CTA verso IDEASMART
 *  - Link preview ARTICLE con immagine della notizia
 *  - URL di destinazione: pagina sezione su ideasmart.ai
 *
 * Chiamata dallo scheduler giornaliero alle 10:00 CET.
 */
export async function publishDailyLinkedInPosts(): Promise<{
  published: number;
  errors: string[];
  posts: Array<{ section: string; title: string; success: boolean; postId?: string; error?: string }>;
}> {
  console.log("[LinkedIn] 🚀 Avvio pubblicazione giornaliera top 3 notizie...");

  const top3 = await getTop3News();

  if (top3.length === 0) {
    console.warn("[LinkedIn] ⚠️ Nessuna notizia trovata nel database. Pubblicazione saltata.");
    return { published: 0, errors: ["Nessuna notizia disponibile"], posts: [] };
  }

  const results = [];
  let published = 0;
  const errors: string[] = [];

  // Pubblica con un ritardo di 5 secondi tra un post e l'altro per evitare rate limiting
  for (let i = 0; i < top3.length; i++) {
    const news = top3[i];
    const meta = SECTION_META[news.section] ?? SECTION_META.ai;
    const sectionPath = SECTION_PATHS[news.section] ?? "/";

    // URL di destinazione: pagina sezione su IDEASMART
    const articleUrl = `${SITE_BASE_URL}${sectionPath}`;

    // Testo del post
    const postText = formatPostText(news.section, news.title, news.summary);

    console.log(`[LinkedIn] 📝 Pubblicazione notizia ${i + 1}/3 — Sezione: ${news.section} (${meta.label})`);
    console.log(`[LinkedIn]    Titolo: ${news.title.slice(0, 60)}...`);
    console.log(`[LinkedIn]    Immagine: ${news.imageUrl ? "✅ presente" : "❌ assente"}`);

    const result = await publishToLinkedIn(
      postText,
      articleUrl,
      news.imageUrl,
      news.title,
      news.summary
    );

    results.push({
      section: news.section,
      title: news.title,
      success: result.success,
      postId: result.postId,
      error: result.error,
    });

    if (result.success) {
      published++;
    } else {
      errors.push(`[${news.section}] ${result.error}`);
    }

    // Pausa tra i post (tranne dopo l'ultimo)
    if (i < top3.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.log(`[LinkedIn] ✅ Pubblicazione completata: ${published}/${top3.length} post pubblicati`);
  if (errors.length > 0) {
    console.error("[LinkedIn] ❌ Errori:", errors);
  }

  return { published, errors, posts: results };
}
