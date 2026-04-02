/**
 * Channel Ingestor — RSS + AI Agent per generare contenuti per i nuovi canali
 *
 * Pipeline:
 * 1. Fetch RSS feeds configurati per ogni canale
 * 2. Estrai titoli, link, descrizioni
 * 3. Passa all'AI agent per trasformare in contenuto strutturato
 * 4. Salva nel DB (channel_content)
 */

import { getDb } from "./db";
import { channelContent, rssFeedSources, rssIngestLog } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// ── RSS Parser (lightweight, no external dep) ──────────────────────────────
async function fetchRssFeed(url: string): Promise<Array<{ title: string; link: string; description: string; pubDate?: string }>> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "IdeaSmart/1.0 RSS Reader" },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRssXml(xml);
  } catch (err: any) {
    console.error(`[ChannelIngestor] RSS fetch error for ${url}: ${err.message}`);
    return [];
  }
}

function parseRssXml(xml: string): Array<{ title: string; link: string; description: string; pubDate?: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate?: string }> = [];
  // Match <item> or <entry> blocks
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractLink(block);
    const description = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated");
    if (title) {
      items.push({
        title: stripHtml(title).slice(0, 500),
        link: link || "",
        description: stripHtml(description || "").slice(0, 1000),
        pubDate,
      });
    }
  }
  return items.slice(0, 20); // Max 20 per feed
}

function extractTag(block: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(block);
  if (cdataMatch) return cdataMatch[1].trim();
  // Handle normal tags
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = regex.exec(block);
  return m ? m[1].trim() : "";
}

function extractLink(block: string): string {
  // <link>url</link>
  const linkTag = extractTag(block, "link");
  if (linkTag && linkTag.startsWith("http")) return linkTag;
  // <link href="url" />
  const hrefMatch = /<link[^>]+href=["']([^"']+)["']/i.exec(block);
  if (hrefMatch) return hrefMatch[1];
  return linkTag;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

// ── Channel-specific AI prompts ────────────────────────────────────────────
const CHANNEL_PROMPTS: Record<string, string> = {
  "copy-paste-ai": `Sei un esperto di prompt engineering per IdeaSmart. Trasforma queste notizie/risorse AI in PROMPT pronti all'uso.

Per ogni item genera un contenuto con:
- title: titolo accattivante del prompt (es. "Prompt per scrivere email di vendita B2B")
- subtitle: breve descrizione di cosa fa (1 riga)
- body: spiegazione del contesto e quando usarlo (2-3 righe)
- category: una tra "business", "studio", "marketing", "produttività", "creatività"
- promptText: il PROMPT COMPLETO pronto da copiare e incollare (multi-riga, dettagliato)
- actionItem: "Cosa fare ORA" — azione concreta in 1 riga

REGOLE:
- I prompt devono essere PRATICI e IMMEDIATAMENTE USABILI
- Ogni prompt deve funzionare con ChatGPT, Claude, Gemini
- Scrivi in italiano
- Genera esattamente il numero di item richiesto`,

  "automate-with-ai": `Sei un esperto di automazione AI per IdeaSmart. Trasforma queste notizie/risorse in USE CASE di automazione reali.

Per ogni item genera:
- title: titolo dell'automazione (es. "Automatizza il customer support con AI + Zapier")
- subtitle: risultato concreto (es. "Riduci i tempi di risposta del 70%")
- body: spiegazione step-by-step dell'automazione (5-8 righe, con passaggi numerati)
- category: una tra "workflow", "integrazione", "no-code", "sviluppo", "marketing"
- actionItem: "Cosa fare ORA" — primo passo concreto
- promptText: prompt o configurazione da usare per replicare l'automazione

REGOLE:
- Focus su automazioni REALI e REPLICABILI
- Includi tool specifici (Zapier, n8n, Make, ecc.)
- Scrivi in italiano`,

  "make-money-with-ai": `Sei un esperto di monetizzazione AI per IdeaSmart. Trasforma queste notizie in STRATEGIE DI GUADAGNO con AI.

Per ogni item genera:
- title: titolo della strategia (es. "Come guadagnare €2.000/mese con AI copywriting")
- subtitle: potenziale di guadagno stimato
- body: spiegazione della strategia con numeri reali (5-8 righe)
- category: una tra "freelance", "side-hustle", "startup", "investimento", "formazione"
- actionItem: "Cosa fare ORA" — primo passo per iniziare
- promptText: prompt o template per iniziare subito

REGOLE:
- Strategie CONCRETE con numeri realistici
- Casi reali quando possibile
- Scrivi in italiano`,

  "daily-ai-tools": `Sei un reviewer di AI tools per IdeaSmart. Trasforma queste notizie in REVIEW DI TOOL AI.

Per ogni item genera:
- title: nome del tool + tagline (es. "Gamma — Presentazioni AI in 30 secondi")
- subtitle: cosa fa in una riga
- body: review completa (pro, contro, prezzo, alternativa, quando usarlo — 5-8 righe)
- category: una tra "produttività", "design", "coding", "marketing", "writing", "analytics"
- actionItem: "Cosa fare ORA" — link o azione per provarlo
- externalUrl: URL del tool

REGOLE:
- Solo tool REALI e FUNZIONANTI
- Includi sempre il prezzo (free/freemium/paid)
- Scrivi in italiano`,

  "verified-ai-news": `Sei un giornalista AI senior per IdeaSmart. Trasforma queste notizie in NEWS VERIFICATE e SPIEGATE.

Per ogni item genera:
- title: titolo della news (chiaro, non clickbait)
- subtitle: "Perché è importante" in una riga
- body: spiegazione della news con contesto e implicazioni (5-8 righe)
- category: una tra "AI", "startup", "investimenti", "regolamentazione", "ricerca", "prodotto"
- actionItem: "Cosa significa per te" — implicazione pratica
- sourceUrl: URL della fonte originale
- sourceName: nome della fonte

REGOLE:
- Solo notizie VERIFICATE da fonti affidabili
- Spiega PERCHÉ è importante, non solo COSA è successo
- Scrivi in italiano`,

  "ai-opportunities": `Sei un analista di venture capital AI per IdeaSmart. Trasforma queste notizie in OPPORTUNITÀ per investitori e founder.

Per ogni item genera:
- title: titolo dell'opportunità (es. "Anthropic raccoglie $2B — cosa significa per il mercato")
- subtitle: tipo di opportunità (investimento/partnership/mercato)
- body: analisi dell'opportunità con dati e contesto (5-8 righe)
- category: una tra "funding", "trend", "mercato", "partnership", "exit", "regolamentazione"
- actionItem: "Cosa fare ORA" — azione per cogliere l'opportunità

REGOLE:
- Focus su OPPORTUNITÀ CONCRETE
- Includi dati e numeri quando disponibili
- Scrivi in italiano`,
};

// ── Main ingest function ───────────────────────────────────────────────────
export async function ingestChannelContent(channel: string, maxItems: number = 10): Promise<{ generated: number; errors: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB non disponibile");

  console.log(`[ChannelIngestor] Starting ingest for channel: ${channel}`);

  // 1. Get active RSS sources for this channel
  const sources = await db
    .select()
    .from(rssFeedSources)
    .where(and(eq(rssFeedSources.channel, channel as any), eq(rssFeedSources.active, true)));

  if (sources.length === 0) {
    console.log(`[ChannelIngestor] No active RSS sources for ${channel}`);
    return { generated: 0, errors: 0 };
  }

  // 2. Fetch all RSS feeds
  const allItems: Array<{ title: string; link: string; description: string; sourceName: string; sourceId: number }> = [];
  for (const source of sources) {
    const items = await fetchRssFeed(source.feedUrl);
    for (const item of items) {
      allItems.push({ ...item, sourceName: source.name, sourceId: source.id });
    }
    // Update lastFetchedAt
    await db.update(rssFeedSources)
      .set({ lastFetchedAt: new Date(), errorCount: 0 })
      .where(eq(rssFeedSources.id, source.id));
  }

  if (allItems.length === 0) {
    console.log(`[ChannelIngestor] No RSS items found for ${channel}`);
    return { generated: 0, errors: 0 };
  }

  console.log(`[ChannelIngestor] Found ${allItems.length} RSS items for ${channel}, generating ${maxItems} contents`);

  // 3. Prepare RSS digest for AI
  const digest = allItems.slice(0, 30).map((item, i) =>
    `[${i + 1}] ${item.title}\nFonte: ${item.sourceName}\nLink: ${item.link}\n${item.description ? `Descrizione: ${item.description}` : ""}`
  ).join("\n\n---\n\n");

  // 4. Call AI to generate structured content
  const channelPrompt = CHANNEL_PROMPTS[channel];
  if (!channelPrompt) {
    console.error(`[ChannelIngestor] No prompt template for channel: ${channel}`);
    return { generated: 0, errors: 1 };
  }

  let generated = 0;
  let errors = 0;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: channelPrompt },
        { role: "user", content: `Ecco le ultime notizie/risorse raccolte oggi. Genera esattamente ${maxItems} contenuti strutturati.\n\n${digest}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "channel_contents",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    body: { type: "string" },
                    category: { type: "string" },
                    actionItem: { type: "string" },
                    promptText: { type: "string" },
                    sourceUrl: { type: "string" },
                    sourceName: { type: "string" },
                    externalUrl: { type: "string" },
                  },
                  required: ["title", "subtitle", "body", "category", "actionItem", "promptText", "sourceUrl", "sourceName", "externalUrl"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty LLM response");

    const parsed = JSON.parse(content as string);
    const items = parsed.items || [];

    // 5. Save to DB
    for (let i = 0; i < items.length && i < maxItems; i++) {
      const item = items[i];
      try {
        await db.insert(channelContent).values({
          channel: channel as any,
          title: item.title || "Senza titolo",
          subtitle: item.subtitle || null,
          body: item.body || "",
          category: item.category || null,
          actionItem: item.actionItem || null,
          promptText: item.promptText || null,
          sourceUrl: item.sourceUrl || null,
          sourceName: item.sourceName || null,
          externalUrl: item.externalUrl || null,
          publishDate: today,
          position: i,
          status: "published",
        });
        generated++;
      } catch (err: any) {
        console.error(`[ChannelIngestor] Error saving item ${i}: ${err.message}`);
        errors++;
      }
    }

    // 6. Log ingest — one entry per generated item
    for (const item of allItems.slice(0, generated)) {
      try {
        await db.insert(rssIngestLog).values({
          articleUrl: item.link || `generated-${channel}-${Date.now()}-${Math.random()}`,
          originalTitle: item.title?.slice(0, 500) || null,
          channel: channel,
          status: "processed",
        }).onDuplicateKeyUpdate({ set: { status: "processed" } });
      } catch (_) { /* skip duplicates */ }
    }

  } catch (err: any) {
    console.error(`[ChannelIngestor] LLM error for ${channel}: ${err.message}`);
    // Log error with a unique URL
    try {
      await db.insert(rssIngestLog).values({
        articleUrl: `error-${channel}-${Date.now()}`,
        originalTitle: `Error: ${err.message?.slice(0, 400)}`,
        channel: channel,
        status: "error",
      }).onDuplicateKeyUpdate({ set: { status: "error" } });
    } catch (_) { /* ignore */ }
    errors++;
  }

  console.log(`[ChannelIngestor] Channel ${channel}: generated=${generated}, errors=${errors}`);
  return { generated, errors };
}

// ── Ingest all channels ────────────────────────────────────────────────────
const CHANNEL_LIMITS: Record<string, number> = {
  "copy-paste-ai": 10,
  "automate-with-ai": 5,
  "make-money-with-ai": 5,
  "daily-ai-tools": 3,
  "verified-ai-news": 10,
  "ai-opportunities": 5,
};

export async function ingestAllChannels(): Promise<Record<string, { generated: number; errors: number }>> {
  const results: Record<string, { generated: number; errors: number }> = {};
  const channels = Object.keys(CHANNEL_LIMITS);

  for (const channel of channels) {
    try {
      results[channel] = await ingestChannelContent(channel, CHANNEL_LIMITS[channel]);
    } catch (err: any) {
      console.error(`[ChannelIngestor] Fatal error for ${channel}: ${err.message}`);
      results[channel] = { generated: 0, errors: 1 };
    }
    // Small delay between channels to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

// ── Seed RSS sources ───────────────────────────────────────────────────────
export async function seedRssSources(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB non disponibile");

  const SEED_SOURCES: Array<{ channel: string; name: string; feedUrl: string }> = [
    // Copy & Paste AI
    { channel: "copy-paste-ai", name: "Reddit ChatGPT", feedUrl: "https://www.reddit.com/r/ChatGPT/.rss" },
    { channel: "copy-paste-ai", name: "Reddit PromptEngineering", feedUrl: "https://www.reddit.com/r/PromptEngineering/.rss" },
    { channel: "copy-paste-ai", name: "Reddit OpenAI", feedUrl: "https://www.reddit.com/r/OpenAI/.rss" },
    { channel: "copy-paste-ai", name: "Hacker News", feedUrl: "https://hnrss.org/newest?q=AI+prompt" },
    { channel: "copy-paste-ai", name: "Product Hunt AI", feedUrl: "https://www.producthunt.com/feed" },

    // Automate with AI
    { channel: "automate-with-ai", name: "Zapier Blog", feedUrl: "https://zapier.com/blog/feed/" },
    { channel: "automate-with-ai", name: "Towards Data Science", feedUrl: "https://towardsdatascience.com/feed" },
    { channel: "automate-with-ai", name: "Analytics Vidhya", feedUrl: "https://www.analyticsvidhya.com/feed/" },
    { channel: "automate-with-ai", name: "KDnuggets", feedUrl: "https://www.kdnuggets.com/feed" },

    // Make Money with AI
    { channel: "make-money-with-ai", name: "TechCrunch Startups", feedUrl: "https://techcrunch.com/category/startups/feed/" },
    { channel: "make-money-with-ai", name: "Product Hunt", feedUrl: "https://www.producthunt.com/feed" },
    { channel: "make-money-with-ai", name: "Indie Hackers", feedUrl: "https://feeds.transistor.fm/the-indie-hackers-podcast" },

    // Daily AI Tools
    { channel: "daily-ai-tools", name: "Product Hunt", feedUrl: "https://www.producthunt.com/feed" },
    { channel: "daily-ai-tools", name: "Ben's Bites", feedUrl: "https://bensbites.beehiiv.com/feed" },
    { channel: "daily-ai-tools", name: "AI Weekly", feedUrl: "https://aiweekly.co/issues.rss" },

    // Verified AI News
    { channel: "verified-ai-news", name: "OpenAI News", feedUrl: "https://openai.com/news/rss.xml" },
    { channel: "verified-ai-news", name: "Google AI Blog", feedUrl: "https://ai.googleblog.com/feeds/posts/default" },
    { channel: "verified-ai-news", name: "Hugging Face Blog", feedUrl: "https://huggingface.co/blog/feed.xml" },
    { channel: "verified-ai-news", name: "MIT Technology Review AI", feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed/" },
    { channel: "verified-ai-news", name: "VentureBeat AI", feedUrl: "https://venturebeat.com/category/ai/feed/" },
    { channel: "verified-ai-news", name: "The Verge AI", feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
    { channel: "verified-ai-news", name: "arXiv AI", feedUrl: "https://rss.arxiv.org/rss/cs.AI" },

    // AI Opportunities
    { channel: "ai-opportunities", name: "TechCrunch", feedUrl: "https://techcrunch.com/feed/" },
    { channel: "ai-opportunities", name: "VentureBeat", feedUrl: "https://venturebeat.com/feed/" },
    { channel: "ai-opportunities", name: "EU-Startups", feedUrl: "https://www.eu-startups.com/feed/" },
    { channel: "ai-opportunities", name: "Sifted", feedUrl: "https://sifted.eu/feed" },
    { channel: "ai-opportunities", name: "Y Combinator Blog", feedUrl: "https://www.ycombinator.com/blog/rss/" },
  ];

  let seeded = 0;
  for (const source of SEED_SOURCES) {
    try {
      // Check if already exists
      const existing = await db.select().from(rssFeedSources)
        .where(and(
          eq(rssFeedSources.channel, source.channel as any),
          eq(rssFeedSources.feedUrl, source.feedUrl),
        ))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(rssFeedSources).values({
          channel: source.channel as any,
          name: source.name,
          feedUrl: source.feedUrl,
        });
        seeded++;
      }
    } catch (err: any) {
      console.error(`[ChannelIngestor] Error seeding ${source.name}: ${err.message}`);
    }
  }

  console.log(`[ChannelIngestor] Seeded ${seeded} RSS sources`);
  return seeded;
}
