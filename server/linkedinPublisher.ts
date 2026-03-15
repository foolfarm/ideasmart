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
 *  - Titolo in grassetto (emoji sezione)
 *  - Breve sommario (max 200 caratteri)
 *  - Link alla notizia originale
 *  - Hashtag tematici
 *
 * Token LinkedIn: scade ogni 2 mesi — aggiornare manualmente in Secrets.
 */

import { ENV } from "./_core/env";
import { getLatestNews } from "./db";

const LINKEDIN_API_URL = "https://api.linkedin.com/v2/ugcPosts";
const LINKEDIN_VERSION = "202503";

// Emoji e hashtag per sezione
const SECTION_META: Record<string, { emoji: string; hashtags: string[] }> = {
  ai: {
    emoji: "🤖",
    hashtags: ["#AI", "#ArtificialIntelligence", "#Tech", "#Innovation", "#IDEASMART"],
  },
  music: {
    emoji: "🎵",
    hashtags: ["#Music", "#MusicIndustry", "#ITsMusic", "#IDEASMART"],
  },
  startup: {
    emoji: "🚀",
    hashtags: ["#Startup", "#Innovation", "#Entrepreneurship", "#Business", "#IDEASMART"],
  },
};

// URL base del sito per i link alle notizie
const SITE_BASE_URL = "https://ideasmart.ai";

const SECTION_PATHS: Record<string, string> = {
  ai: "/ai",
  music: "/music",
  startup: "/startup",
};

/**
 * Pubblica un singolo post su LinkedIn tramite ugcPosts API v2.
 */
async function publishToLinkedIn(text: string): Promise<{ success: boolean; postId?: string; error?: string }> {
  const token = ENV.linkedinAccessToken;
  const authorUrn = ENV.linkedinAuthorUrn;

  if (!token || !authorUrn) {
    return { success: false, error: "LINKEDIN_ACCESS_TOKEN o LINKEDIN_AUTHOR_URN non configurati" };
  }

  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text,
        },
        shareMediaCategory: "NONE",
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
      // Successo: LinkedIn restituisce l'ID del post nell'header X-RestLi-Id
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
 */
function formatPostText(
  section: string,
  title: string,
  summary: string,
  sourceUrl?: string | null
): string {
  const meta = SECTION_META[section] ?? SECTION_META.ai;
  const sectionPath = SECTION_PATHS[section] ?? "/";
  const siteUrl = `${SITE_BASE_URL}${sectionPath}`;

  // Tronca il sommario a 200 caratteri
  const shortSummary = summary.length > 200 ? summary.slice(0, 197) + "..." : summary;

  // Costruisce il post
  const lines: string[] = [
    `${meta.emoji} ${title}`,
    "",
    shortSummary,
    "",
  ];

  if (sourceUrl) {
    lines.push(`🔗 Leggi di più: ${sourceUrl}`);
  } else {
    lines.push(`🔗 Scopri di più su IDEASMART: ${siteUrl}`);
  }

  lines.push("");
  lines.push(meta.hashtags.join(" "));

  return lines.join("\n");
}

/**
 * Recupera la notizia più importante (posizione 1) per ogni sezione.
 * Restituisce un array di max 3 notizie (una per sezione).
 */
async function getTop3News(): Promise<Array<{
  section: string;
  title: string;
  summary: string;
  sourceUrl?: string | null;
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
    const postText = formatPostText(news.section, news.title, news.summary, news.sourceUrl);

    console.log(`[LinkedIn] 📝 Pubblicazione notizia ${i + 1}/3 — Sezione: ${news.section}`);
    console.log(`[LinkedIn]    Titolo: ${news.title.slice(0, 60)}...`);

    const result = await publishToLinkedIn(postText);

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
