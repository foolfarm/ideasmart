/**
 * Proof Press — AI Tool Radar
 *
 * Scrapa feed RSS da Product Hunt, Hacker News, GitHub Trending,
 * VentureBeat AI, MarkTechPost, Hugging Face Blog per trovare
 * i 10 tool AI più innovativi del giorno.
 *
 * Usa LLM per filtrare, selezionare e curare i tool con opinione
 * (stile "curation + opinione", non semplice lista).
 *
 * Output: post LinkedIn nel format "🚀 10 nuovi tool AI scoperti oggi"
 *
 * Fonti RSS:
 *  - Product Hunt (daily launches)
 *  - Hacker News (front page)
 *  - GitHub Trending (atom feed)
 *  - VentureBeat AI
 *  - MarkTechPost
 *  - Hugging Face Blog
 *  - OpenAI News
 *  - Google AI Blog
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { linkedinPosts } from "../drizzle/schema";
import { eq, and, gte, desc } from "drizzle-orm";

// ── RSS Feed URLs ────────────────────────────────────────────────────────────
const AI_TOOL_FEEDS = [
  { name: "Product Hunt", url: "https://www.producthunt.com/feed", priority: 1 },
  { name: "Hacker News", url: "https://hnrss.org/frontpage", priority: 2 },
  { name: "GitHub Trending", url: "https://github.com/trending.atom", priority: 2 },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", priority: 3 },
  { name: "MarkTechPost", url: "https://www.marktechpost.com/feed/", priority: 2 },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", priority: 3 },
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml", priority: 3 },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", priority: 3 },
];

// ── Tipi ─────────────────────────────────────────────────────────────────────
interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

interface AITool {
  name: string;
  description: string;
  whyInteresting: string;
  verdict: "da testare subito" | "interessante" | "da monitorare" | "clone → skip";
  source: string;
  link: string;
}

// ── Parse RSS XML semplice ───────────────────────────────────────────────────
function parseRSSItems(xml: string, sourceName: string): RSSItem[] {
  const items: RSSItem[] = [];

  // Supporta sia <item> (RSS 2.0) che <entry> (Atom)
  const isAtom = xml.includes("<feed") && xml.includes("<entry>");

  if (isAtom) {
    // Atom feed
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
      const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ||
                   entry.match(/<link[^>]*href="([^"]*)"[^>]*>/)?.[1] || "";
      const summary = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";
      const content = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";
      const updated = entry.match(/<updated>([\s\S]*?)<\/updated>/)?.[1]?.trim() || "";

      if (title) {
        items.push({
          title,
          link,
          description: (summary || content).slice(0, 500),
          pubDate: updated,
          source: sourceName,
        });
      }
    }
  } else {
    // RSS 2.0
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
      const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
      const desc = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";

      if (title) {
        items.push({
          title,
          link,
          description: desc.slice(0, 500),
          pubDate,
          source: sourceName,
        });
      }
    }
  }

  return items;
}

// ── Fetch tutti i feed RSS ───────────────────────────────────────────────────
async function fetchAllFeeds(): Promise<RSSItem[]> {
  const allItems: RSSItem[] = [];

  const results = await Promise.allSettled(
    AI_TOOL_FEEDS.map(async (feed) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(feed.url, {
          signal: controller.signal,
          headers: { "User-Agent": "Proof Press-AIToolRadar/1.0" },
        });
        clearTimeout(timeout);

        if (!res.ok) {
          console.warn(`[AIToolRadar] ⚠️ Feed ${feed.name}: HTTP ${res.status}`);
          return [];
        }

        const xml = await res.text();
        const items = parseRSSItems(xml, feed.name);
        console.log(`[AIToolRadar] ✅ ${feed.name}: ${items.length} items`);
        return items;
      } catch (err) {
        console.warn(`[AIToolRadar] ❌ Feed ${feed.name} fallito:`, (err as Error).message);
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  return allItems;
}

// ── Filtra solo le ultime 24h ────────────────────────────────────────────────
function filterRecent(items: RSSItem[], hoursBack = 48): RSSItem[] {
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;

  return items.filter((item) => {
    if (!item.pubDate) return true; // Se non ha data, includi per sicurezza
    const d = new Date(item.pubDate).getTime();
    return !isNaN(d) ? d > cutoff : true;
  });
}

// ── Usa LLM per selezionare i 10 tool più interessanti ──────────────────────
async function selectTopTools(items: RSSItem[]): Promise<AITool[]> {
  // Prepara il testo con tutti gli item
  const itemsText = items
    .slice(0, 80) // Max 80 item per non superare il contesto
    .map((item, i) => `[${i + 1}] ${item.source} | ${item.title}\n    ${item.description.slice(0, 200)}\n    Link: ${item.link}`)
    .join("\n\n");

  const systemPrompt = `Sei un curatore esperto di tool AI e prodotti tech innovativi.
Il tuo compito è selezionare i 10 tool/prodotti AI più interessanti e innovativi da una lista di articoli RSS.

CRITERI DI SELEZIONE (in ordine di priorità):
1. Tool AI nuovi e innovativi (non cloni di prodotti esistenti)
2. Prodotti con un use case chiaro e pratico
3. Open source o con tier gratuito (preferenza)
4. Rilevanza per professionisti tech, CEO, CTO, imprenditori
5. Novità: preferisci prodotti lanciati nelle ultime 24-48h

CRITERI DI ESCLUSIONE:
- Notizie generiche sull'AI (non tool specifici)
- Articoli di opinione o editoriali
- Prodotti già molto noti (ChatGPT, Copilot, Midjourney — a meno che non abbiano un update significativo)
- Cloni evidenti di prodotti esistenti

Per ogni tool selezionato, fornisci:
- name: nome del tool/prodotto
- description: cosa fa in 1 riga (max 15 parole)
- whyInteresting: perché è interessante (use case reale, 1-2 frasi)
- verdict: uno tra "da testare subito", "interessante", "da monitorare", "clone → skip"
- source: da quale feed proviene
- link: URL dell'articolo/prodotto

Rispondi SOLO con un array JSON valido di 10 oggetti. Nessun altro testo.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Ecco ${items.length} articoli dalle ultime 48h. Seleziona i 10 tool AI più interessanti:\n\n${itemsText}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ai_tools_selection",
        strict: true,
        schema: {
          type: "object",
          properties: {
            tools: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  whyInteresting: { type: "string" },
                  verdict: { type: "string" },
                  source: { type: "string" },
                  link: { type: "string" },
                },
                required: ["name", "description", "whyInteresting", "verdict", "source", "link"],
                additionalProperties: false,
              },
            },
          },
          required: ["tools"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) return [];
    const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    const parsed = JSON.parse(content);
    return (parsed.tools || []).slice(0, 10);
  } catch (err) {
    console.error("[AIToolRadar] ❌ Errore parsing risposta LLM:", err);
    return [];
  }
}

// ── Genera il testo del post LinkedIn ────────────────────────────────────────
async function generateToolRadarPost(tools: AITool[]): Promise<string> {
  const toolsList = tools
    .map((t, i) => `${i + 1}. ${t.name} — ${t.description}\n   Perché: ${t.whyInteresting}\n   Verdetto: ${t.verdict}\n   Link: ${t.link}`)
    .join("\n\n");

  const systemPrompt = `Sei Andrea Cinelli, Tech Expert. Scrivi un post LinkedIn "AI Radar by Proof Press".

REGOLE FERREE:
- MASSIMO 2800 caratteri TOTALI. LinkedIn taglia a 3000, quindi stai sotto 2800!
- Per ogni tool: 1 riga nome+descrizione (max 10 parole), 1 riga verdetto BREVE (max 12 parole)
- NESSUN paragrafo introduttivo lungo. Vai dritto alla lista.
- Tono: insider tech, diretto, tagliente
- Italiano con termini tech in inglese
- Max 2 emoji in tutto il post
- NO bold (**), NO formattazione markdown

Per ogni tool DEVI includere il LINK DIRETTO al tool o all'articolo.

FORMATO ESATTO:
10 nuovi tool AI scoperti oggi

1. Nome \u2014 cosa fa in max 10 parole
Verdetto: frase secca (max 12 parole)
Link: URL diretto

[ripeti per tutte 10]

Trend: 1 frase su cosa emerge (max 2 righe)

Segui \u2192 proofpress.ai
#AI #AITools #Proof Press

Andrea Cinelli | Tech Expert | proofpress.ai

RICORDA: MASSIMO 2800 CARATTERI TOTALI. Sii brevissimo.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Ecco i 10 tool selezionati per oggi:\n\n${toolsList}\n\nGenera il post LinkedIn nel format AI Radar.` },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent) return "";
  let text = typeof rawContent === 'string' ? rawContent.trim() : "";
  // Troncamento di sicurezza: LinkedIn ha un limite di 3000 caratteri
  if (text.length > 2950) {
    console.warn(`[AIToolRadar] \u26a0\ufe0f Post troppo lungo (${text.length} chars), tronco a 2950`);
    const cutPoint = text.lastIndexOf('\n', 2950);
    text = text.slice(0, cutPoint > 2000 ? cutPoint : 2950);
    if (!text.includes('proofpress.ai')) {
      text += '\n\nAndrea Cinelli | Tech Expert | proofpress.ai';
    }
  }
  return text;
}

// \u2500\u2500 Funzione principale: genera il post AI Tool Radar───────────────────────
export async function generateAIToolRadarPost(): Promise<{
  success: boolean;
  postText: string;
  toolCount: number;
  feedsScraped: number;
  error?: string;
}> {
  console.log("[AIToolRadar] 🚀 Avvio generazione AI Tool Radar...");

  // 1. Fetch tutti i feed RSS
  const allItems = await fetchAllFeeds();
  console.log(`[AIToolRadar] 📥 Totale items raccolti: ${allItems.length}`);

  if (allItems.length === 0) {
    return { success: false, postText: "", toolCount: 0, feedsScraped: 0, error: "Nessun feed RSS disponibile" };
  }

  // 2. Filtra solo le ultime 48h
  const recentItems = filterRecent(allItems, 48);
  console.log(`[AIToolRadar] 🕐 Items ultimi 48h: ${recentItems.length}`);

  if (recentItems.length < 5) {
    console.warn("[AIToolRadar] ⚠️ Pochi items recenti, uso tutti gli items disponibili");
  }

  const itemsToProcess = recentItems.length >= 5 ? recentItems : allItems;

  // 3. Usa LLM per selezionare i 10 tool migliori
  console.log("[AIToolRadar] 🤖 Selezione AI dei 10 tool migliori...");
  const topTools = await selectTopTools(itemsToProcess);
  console.log(`[AIToolRadar] ✅ Tool selezionati: ${topTools.length}`);

  if (topTools.length === 0) {
    return { success: false, postText: "", toolCount: 0, feedsScraped: AI_TOOL_FEEDS.length, error: "LLM non ha selezionato nessun tool" };
  }

  // 4. Genera il post LinkedIn
  console.log("[AIToolRadar] ✍️ Generazione post LinkedIn...");
  const postText = await generateToolRadarPost(topTools);

  if (!postText) {
    return { success: false, postText: "", toolCount: topTools.length, feedsScraped: AI_TOOL_FEEDS.length, error: "LLM non ha generato il post" };
  }

  console.log(`[AIToolRadar] ✅ Post generato (${postText.length} caratteri, ${topTools.length} tool)`);

  return {
    success: true,
    postText,
    toolCount: topTools.length,
    feedsScraped: AI_TOOL_FEEDS.length,
  };
}
