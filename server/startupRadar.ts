/**
 * IDEASMART — Startup Radar EU/IT
 *
 * Scrapa feed RSS da fonti italiane ed europee per trovare
 * le 10 startup AI più investibili del giorno.
 *
 * Fonti:
 *  - StartupItalia, Italian Tech, Wired Italia (IT)
 *  - EU-Startups, Sifted, Tech.eu (EU)
 *  - Crunchbase News, VentureBeat AI, TechCrunch AI (Funding)
 *  - Product Hunt, Hugging Face (Discovery)
 *
 * Output: post LinkedIn nel format "🚀 10 startup AI europee da tenere d'occhio oggi"
 * Stile: VC insider, curation + opinione, non semplice lista
 */

import { invokeLLM } from "./_core/llm";

// ── RSS Feed URLs ────────────────────────────────────────────────────────────
const STARTUP_FEEDS = [
  // Italia
  { name: "StartupItalia", url: "https://startupitalia.eu/feed/", priority: 1 },
  { name: "Italian Tech", url: "https://www.repubblica.it/rss/tecnologia/rss2.0.xml", priority: 2 },
  { name: "Wired Italia", url: "https://www.wired.it/feed/rss", priority: 2 },
  // Europa
  { name: "EU-Startups", url: "https://www.eu-startups.com/feed/", priority: 1 },
  { name: "Sifted", url: "https://sifted.eu/feed", priority: 1 },
  { name: "Tech.eu", url: "https://tech.eu/feed/", priority: 1 },
  // Funding / VC
  { name: "Crunchbase News", url: "https://news.crunchbase.com/feed/", priority: 2 },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", priority: 2 },
  { name: "TechCrunch AI", url: "https://techcrunch.com/tag/artificial-intelligence/feed/", priority: 2 },
  // Discovery
  { name: "Product Hunt", url: "https://www.producthunt.com/feed", priority: 3 },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml", priority: 3 },
];

// ── Tipi ─────────────────────────────────────────────────────────────────────
interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

interface StartupPick {
  name: string;
  description: string;
  whyInteresting: string;
  status: string; // "early", "seed", "scaling", "tool emergente"
  source: string;
  link: string;
}

// ── Parse RSS XML ────────────────────────────────────────────────────────────
function parseRSSItems(xml: string, sourceName: string): RSSItem[] {
  const items: RSSItem[] = [];
  const isAtom = xml.includes("<feed") && xml.includes("<entry>");

  if (isAtom) {
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
        items.push({ title, link, description: (summary || content).slice(0, 500), pubDate: updated, source: sourceName });
      }
    }
  } else {
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
      const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
      const desc = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";

      if (title) {
        items.push({ title, link, description: desc.slice(0, 500), pubDate, source: sourceName });
      }
    }
  }

  return items;
}

// ── Fetch tutti i feed RSS ───────────────────────────────────────────────────
async function fetchAllFeeds(): Promise<RSSItem[]> {
  const allItems: RSSItem[] = [];

  const results = await Promise.allSettled(
    STARTUP_FEEDS.map(async (feed) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(feed.url, {
          signal: controller.signal,
          headers: { "User-Agent": "IdeaSmart-StartupRadar/1.0" },
        });
        clearTimeout(timeout);

        if (!res.ok) {
          console.warn(`[StartupRadar] ⚠️ Feed ${feed.name}: HTTP ${res.status}`);
          return [];
        }

        const xml = await res.text();
        const items = parseRSSItems(xml, feed.name);
        console.log(`[StartupRadar] ✅ ${feed.name}: ${items.length} items`);
        return items;
      } catch (err) {
        console.warn(`[StartupRadar] ❌ Feed ${feed.name} fallito:`, (err as Error).message);
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

// ── Filtra ultime 48h ────────────────────────────────────────────────────────
function filterRecent(items: RSSItem[], hoursBack = 48): RSSItem[] {
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
  return items.filter((item) => {
    if (!item.pubDate) return true;
    const d = new Date(item.pubDate).getTime();
    return !isNaN(d) ? d > cutoff : true;
  });
}

// ── Usa LLM per selezionare le 10 startup più investibili ────────────────────
async function selectTopStartups(items: RSSItem[]): Promise<StartupPick[]> {
  const itemsText = items
    .slice(0, 80)
    .map((item, i) => `[${i + 1}] ${item.source} | ${item.title}\n    ${item.description.slice(0, 200)}\n    Link: ${item.link}`)
    .join("\n\n");

  const systemPrompt = `Agisci come un VC europeo specializzato in AI.

Analizza queste fonti RSS (startup, AI, funding, product launch).

Seleziona le 10 startup AI più interessanti emerse nelle ultime 24-48h.

Criteri di selezione:
- Europa o Italia (priorità assoluta)
- Early stage o emerging
- Forte potenziale di crescita
- Differenziazione (no cloni banali)
- Segnali di traction (se presenti)
- Se non trovi 10 startup EU/IT, completa con startup globali particolarmente rilevanti

Criteri di esclusione:
- Notizie generiche (non startup specifiche)
- Articoli di opinione
- Startup già molto note e consolidate (a meno di update significativi)
- Cloni evidenti ("clone GPT wrapper → skip")

Per ogni startup fornisci:
- name: nome della startup
- description: cosa fa in 1 riga chiara (max 15 parole)
- whyInteresting: insight da investitore (perché è interessante, 1-2 frasi)
- status: uno tra "early", "seed", "scaling", "tool emergente"
- source: da quale feed proviene
- link: URL dell'articolo

Rispondi SOLO con un JSON valido. Nessun altro testo.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Ecco ${items.length} articoli dalle ultime 48h. Seleziona le 10 startup AI EU/IT più investibili:\n\n${itemsText}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "startup_selection",
        strict: true,
        schema: {
          type: "object",
          properties: {
            startups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  whyInteresting: { type: "string" },
                  status: { type: "string" },
                  source: { type: "string" },
                  link: { type: "string" },
                },
                required: ["name", "description", "whyInteresting", "status", "source", "link"],
                additionalProperties: false,
              },
            },
          },
          required: ["startups"],
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
    return (parsed.startups || []).slice(0, 10);
  } catch (err) {
    console.error("[StartupRadar] ❌ Errore parsing risposta LLM:", err);
    return [];
  }
}

// ── Genera il testo del post LinkedIn ────────────────────────────────────────
async function generateStartupRadarPost(startups: StartupPick[]): Promise<string> {
  const startupsList = startups
    .map((s, i) => `${i + 1}. ${s.name} — ${s.description}\n   Perché: ${s.whyInteresting}\n   Stato: ${s.status}\n   Link: ${s.link}`)
    .join("\n\n");

  const systemPrompt = `Sei Andrea Cinelli, Tech Expert con 20+ anni di esperienza nell'ecosistema tech e imprenditoriale italiano ed europeo.
Scrivi un post LinkedIn nel format "AI Dealflow Europe by IDEASMART" — la tua rubrica quotidiana dove segnali le 10 startup AI europee più investibili.

STILE:
- Scrivi in prima persona, tono da insider VC, diretto e competente
- Per ogni startup: nome, cosa fa, e il tuo verdetto da investitore
- NON fare una lista piatta: fai curation + opinione
- Esempio di verdetto: "clone GPT wrapper → skip" oppure "vertical AI con wedge di mercato → interessante"
- Aggiungi un "Trend del giorno" alla fine: 1 insight macro su cosa emerge dalla selezione
- Chiudi con CTA per seguirti e visitare ideasmart.ai/startup
- Max 2-3 emoji per tutto il post
- Scrivi in italiano con termini tecnici in inglese quando necessario
- Firma: Andrea Cinelli | Tech Expert | ideasmart.ai

FORMATO:
🚀 10 startup AI europee da tenere d'occhio oggi

1. [Nome] — [cosa fa]
👉 [insight da investitore + verdetto]

...

🔥 Trend:
[la tua lettura → qui costruisci authority]

Se ti interessa questo format, seguimi → ideasmart.ai/startup

#Startup #AI #VentureCapital #IDEASMART #StartupEurope #AIInvesting

IMPORTANTE: Il post deve essere tra 1500 e 2500 caratteri. Non superare i 3000 caratteri.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Ecco le 10 startup selezionate per oggi:\n\n${startupsList}\n\nGenera il post LinkedIn nel format AI Dealflow Europe.` },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent) return "";
  return typeof rawContent === 'string' ? rawContent.trim() : "";
}

// ── Funzione principale ──────────────────────────────────────────────────────
export async function generateStartupRadarPost_main(): Promise<{
  success: boolean;
  postText: string;
  startupCount: number;
  feedsScraped: number;
  error?: string;
}> {
  console.log("[StartupRadar] 🚀 Avvio generazione Startup Radar EU/IT...");

  // 1. Fetch tutti i feed RSS
  const allItems = await fetchAllFeeds();
  console.log(`[StartupRadar] 📥 Totale items raccolti: ${allItems.length}`);

  if (allItems.length === 0) {
    return { success: false, postText: "", startupCount: 0, feedsScraped: 0, error: "Nessun feed RSS disponibile" };
  }

  // 2. Filtra ultime 48h
  const recentItems = filterRecent(allItems, 48);
  console.log(`[StartupRadar] 🕐 Items ultimi 48h: ${recentItems.length}`);

  const itemsToProcess = recentItems.length >= 5 ? recentItems : allItems;

  // 3. LLM per selezionare le 10 startup
  console.log("[StartupRadar] 🤖 Selezione AI delle 10 startup più investibili...");
  const topStartups = await selectTopStartups(itemsToProcess);
  console.log(`[StartupRadar] ✅ Startup selezionate: ${topStartups.length}`);

  if (topStartups.length === 0) {
    return { success: false, postText: "", startupCount: 0, feedsScraped: STARTUP_FEEDS.length, error: "LLM non ha selezionato nessuna startup" };
  }

  // 4. Genera il post LinkedIn
  console.log("[StartupRadar] ✍️ Generazione post LinkedIn...");
  const postText = await generateStartupRadarPost(topStartups);

  if (!postText) {
    return { success: false, postText: "", startupCount: topStartups.length, feedsScraped: STARTUP_FEEDS.length, error: "LLM non ha generato il post" };
  }

  console.log(`[StartupRadar] ✅ Post generato (${postText.length} caratteri, ${topStartups.length} startup)`);

  return {
    success: true,
    postText,
    startupCount: topStartups.length,
    feedsScraped: STARTUP_FEEDS.length,
  };
}
