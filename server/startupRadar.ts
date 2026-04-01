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
  usp: string; // unique selling proposition
  whyInteresting: string;
  status: string; // "pre-seed", "seed", "series-a", "series-b+", "scaling"
  funding: string; // es. "$2.1M pre-seed", "$170M Series C", "sconosciuto"
  valuation: string; // es. "$1B unicorno", "non disponibile"
  investRating: string; // "INVEST" | "INVEST+" | "INVEST++"
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
- description: cosa fa in 2-3 frasi (USP, cosa la rende unica, mercato target)
- usp: la unique selling proposition in 1 frase (cosa la differenzia dalla concorrenza)
- whyInteresting: insight da investitore (perch\u00e9 \u00e8 interessante per un VC, 2-3 frasi)
- status: uno tra "pre-seed", "seed", "series-a", "series-b+", "scaling"
- funding: quanto hanno raccolto o stanno raccogliendo (es. "$2.1M pre-seed", "$170M Series C"). Se non disponibile scrivi "non disponibile"
- valuation: valutazione stimata se disponibile (es. "$1B unicorno"). Se non disponibile scrivi "non disponibile"
- investRating: il tuo giudizio di investimento, UNO tra:
  * "INVEST" = opportunit\u00e0 interessante, investi con moderazione, da monitorare
  * "INVEST+" = opportunit\u00e0 concreta, investi subito con convinzione
  * "INVEST++" = opportunit\u00e0 rara, investi immediatamente, potenziale enorme
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
                  usp: { type: "string" },
                  whyInteresting: { type: "string" },
                  status: { type: "string" },
                  funding: { type: "string" },
                  valuation: { type: "string" },
                  investRating: { type: "string" },
                  source: { type: "string" },
                  link: { type: "string" },
                },
                required: ["name", "description", "usp", "whyInteresting", "status", "funding", "valuation", "investRating", "source", "link"],
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
    .map((s, i) => `${i + 1}. ${s.name} \u2014 ${s.description}\n   USP: ${s.usp}\n   Perch\u00e9 investire: ${s.whyInteresting}\n   Stato: ${s.status} | Funding: ${s.funding} | Valutazione: ${s.valuation}\n   Rating: ${s.investRating}\n   Link: ${s.link}`)
    .join("\n\n");

  const systemPrompt = `Sei Andrea Cinelli, Tech Expert e VC advisor. Scrivi un post LinkedIn "AI Dealflow Europe by IDEASMART".

REGOLE FERREE:
- MASSIMO 2800 caratteri TOTALI (LinkedIn taglia a 3000). Conta i caratteri!
- Tono: insider VC, competente, da chi ha skin in the game
- Italiano con termini tech/finance in inglese
- Max 2 emoji in tutto il post
- NO bold (**), NO formattazione markdown

Per ogni startup DEVI includere:
1. Nome e cosa fa (2 righe max, racconta la USP)
2. Dati finanziari: quanto ha raccolto, round, valutazione se disponibile
3. Rating di investimento:
   INVEST = investi con moderazione, da monitorare
   INVEST+ = investi subito, opportunit\u00e0 concreta
   INVEST++ = investi immediatamente, opportunit\u00e0 rara
4. LINK DIRETTO alla startup o all'articolo (OBBLIGATORIO per ogni startup)

FORMATO ESATTO:
AI Dealflow Europe \u2014 10 startup su cui puntare oggi

1. Nome \u2014 descrizione USP (2 righe max)
Funding: importo round | Valutazione: se disponibile
Rating: INVEST / INVEST+ / INVEST++
Link: URL diretto

[ripeti per tutte 10]

Trend: 1 insight su cosa emerge (max 2 righe)

Segui \u2192 ideasmart.ai/startup
#Startup #AI #VentureCapital #IDEASMART

Andrea Cinelli | Tech Expert | ideasmart.ai

RICORDA: MASSIMO 2800 CARATTERI TOTALI. Sii conciso ma informativo.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Ecco le 10 startup selezionate per oggi:\n\n${startupsList}\n\nGenera il post LinkedIn nel format AI Dealflow Europe.` },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent) return "";
  let text = typeof rawContent === 'string' ? rawContent.trim() : "";
  // Troncamento di sicurezza: LinkedIn ha un limite di 3000 caratteri
  if (text.length > 2950) {
    console.warn(`[StartupRadar] \u26a0\ufe0f Post troppo lungo (${text.length} chars), tronco a 2950`);
    // Tronca all'ultimo newline prima del limite per non tagliare a met\u00e0 frase
    const cutPoint = text.lastIndexOf('\n', 2950);
    text = text.slice(0, cutPoint > 2000 ? cutPoint : 2950);
    // Aggiungi firma se mancante
    if (!text.includes('ideasmart.ai')) {
      text += '\n\nAndrea Cinelli | Tech Expert | ideasmart.ai';
    }
  }
  return text;
}

// \u2500\u2500 Funzione principale─────────────────────────────────────────────────────
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
