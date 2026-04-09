/**
 * Proof Press — Market Intelligence Module
 *
 * Cerca dati, statistiche e insight da fonti di market intelligence autorevoli
 * (McKinsey, Gartner, CBInsights, WEF, a16z, Deloitte, PwC, ecc.)
 * pertinenti al tema dell'editoriale del giorno.
 *
 * Usa Perplexity Sonar API (web-grounded) per trovare dati aggiornati
 * con citazioni da fonti primarie.
 *
 * Output:
 *  - stats: array di statistiche con fonte e anno
 *  - insight: sintesi analitica in stile Gartner
 *  - imageUrl: immagine da fonte autorevole (se disponibile)
 *  - sources: fonti citate
 */

export interface MarketStat {
  value: string;       // es. "$150B", "67%", "3.4x"
  description: string; // es. "mercato AI globale entro 2030"
  source: string;      // es. "McKinsey Global Institute, 2025"
  year: string;        // es. "2025"
}

export interface MarketIntelligenceResult {
  stats: MarketStat[];
  insight: string;      // Sintesi analitica in 2-3 frasi
  keyFinding: string;   // Il dato più impattante in 1 frase
  sources: string[];    // Fonti citate
  imageUrl?: string;    // Immagine da fonte autorevole (opzionale)
}

// ── Fonti autorevoli per sezione ─────────────────────────────────────────────

const AI_INTELLIGENCE_SOURCES = [
  "McKinsey Global Institute",
  "Gartner",
  "IDC",
  "Goldman Sachs Research",
  "Stanford AI Index",
  "World Economic Forum",
  "Deloitte AI Institute",
  "PwC AI Analysis",
  "BCG Henderson Institute",
  "CB Insights",
  "a16z",
  "MIT Technology Review",
  "OECD AI Policy Observatory",
];

const STARTUP_INTELLIGENCE_SOURCES = [
  "CB Insights",
  "Crunchbase",
  "PitchBook",
  "Startup Genome",
  "Dealroom",
  "KPMG Venture Pulse",
  "McKinsey",
  "Sequoia Capital",
  "a16z",
  "Sifted",
  "EU Startup Monitor",
  "Italian Tech Alliance",
];

// ── Ricerca dati via Perplexity Sonar API ────────────────────────────────────

async function searchMarketData(
  topic: string,
  section: "ai" | "startup"
): Promise<MarketIntelligenceResult | null> {
  const sonarApiKey = process.env.SONAR_API_KEY;
  if (!sonarApiKey) {
    console.warn("[MarketIntel] SONAR_API_KEY non configurata");
    return null;
  }

  const sources = section === "ai" ? AI_INTELLIGENCE_SOURCES : STARTUP_INTELLIGENCE_SOURCES;
  const sourceList = sources.slice(0, 8).join(", ");

  const systemPrompt = `Sei un senior analyst di market intelligence specializzato in ${section === "ai" ? "AI e tecnologia" : "startup e venture capital"}.
Il tuo compito è trovare dati, statistiche e insight REALI e VERIFICABILI da fonti autorevoli.
Rispondi SEMPRE in formato JSON valido, senza markdown.`;

  const userPrompt = `Trova 3-4 statistiche chiave e insight di mercato sul tema: "${topic}"

Cerca dati recenti (2024-2026) da fonti come: ${sourceList}

Rispondi con questo JSON esatto:
{
  "stats": [
    {
      "value": "valore numerico (es. $150B, 67%, 3.4x)",
      "description": "cosa misura questo dato (max 80 caratteri)",
      "source": "Nome fonte, Anno",
      "year": "2024 o 2025 o 2026"
    }
  ],
  "insight": "Sintesi analitica in 2-3 frasi che collegano i dati a implicazioni strategiche per il business italiano. Tono da senior analyst, non da giornalista.",
  "keyFinding": "Il dato più sorprendente o strategicamente rilevante in 1 frase (max 120 caratteri)",
  "sources": ["Fonte 1", "Fonte 2", "Fonte 3"]
}

REGOLE:
- Usa SOLO dati reali e verificabili, mai inventati
- Preferisci dati con impatto sul mercato italiano/europeo
- Il keyFinding deve essere un numero o percentuale specifica
- Massimo 4 stats`;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sonarApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.warn(`[MarketIntel] Perplexity API error: ${response.status}`);
      return null;
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    // Estrai JSON dalla risposta (potrebbe avere testo extra)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("[MarketIntel] Nessun JSON trovato nella risposta Perplexity");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as MarketIntelligenceResult;

    // Validazione minima
    if (!parsed.stats || !Array.isArray(parsed.stats) || parsed.stats.length === 0) {
      console.warn("[MarketIntel] Stats mancanti o vuote");
      return null;
    }

    console.log(`[MarketIntel] ✅ Trovate ${parsed.stats.length} statistiche per "${topic.slice(0, 50)}"`);
    return parsed;

  } catch (err) {
    console.warn("[MarketIntel] Errore ricerca dati:", err);
    return null;
  }
}

// ── Cerca immagine da fonti market intelligence via RSS ──────────────────────

const MARKET_INTEL_RSS_FEEDS = [
  // Fonti con immagini di alta qualità e pertinenza
  { url: "https://venturebeat.com/category/ai/feed", name: "VentureBeat AI" },
  { url: "https://singularityhub.com/feed", name: "Singularity Hub" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed", name: "TechCrunch AI" },
  { url: "https://techcrunch.com/category/startups/feed", name: "TechCrunch Startups" },
  { url: "https://the-decoder.com/feed", name: "The Decoder" },
  { url: "https://www.cbinsights.com/research/feed", name: "CB Insights" },
  { url: "https://sifted.eu/feed", name: "Sifted" },
];

interface RSSItem {
  title: string;
  imageUrl: string;
  link: string;
  source: string;
}

async function fetchRSSWithImages(feedUrl: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const items: RSSItem[] = [];

    // Parse items con regex
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    for (const itemXml of itemMatches.slice(0, 10)) {
      // Titolo
      const titleMatch = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const title = titleMatch ? titleMatch[1].trim().replace(/&amp;/g, "&").replace(/&#\d+;/g, "") : "";

      // Link
      const linkMatch = itemXml.match(/<link[^>]*>([^<]+)<\/link>/) ||
                        itemXml.match(/<guid[^>]*>([^<]+)<\/guid>/);
      const link = linkMatch ? linkMatch[1].trim() : "";

      // Immagine: cerca in media:content, enclosure, og:image, img src
      const imgPatterns = [
        /url=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp))[^"']*/i,
        /<enclosure[^>]*url=["'](https?:\/\/[^"']+)[^"']*/i,
        /<media:thumbnail[^>]*url=["'](https?:\/\/[^"']+)[^"']*/i,
      ];

      let imageUrl = "";
      for (const pattern of imgPatterns) {
        const match = itemXml.match(pattern);
        if (match && match[1] && !match[1].includes("pixel") && !match[1].includes("1x1")) {
          imageUrl = match[1];
          break;
        }
      }

      if (title && imageUrl) {
        items.push({ title, imageUrl, link, source: sourceName });
      }
    }

    return items;
  } catch {
    return [];
  }
}

// Calcola rilevanza tra titolo RSS e topic editoriale
function computeRelevanceScore(itemTitle: string, topic: string): number {
  const topicWords = topic.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);

  const titleLower = itemTitle.toLowerCase();
  let score = 0;

  for (const word of topicWords) {
    if (titleLower.includes(word)) score += 2;
  }

  // Bonus per keyword ad alto valore
  const highValueKeywords = ["ai", "artificial intelligence", "startup", "funding", "venture", "market", "growth", "data", "enterprise", "automation", "agent"];
  for (const kw of highValueKeywords) {
    if (titleLower.includes(kw)) score += 1;
  }

  return score;
}

async function findMarketIntelligenceImage(
  topic: string,
  section: "ai" | "startup"
): Promise<{ imageUrl: string; source: string; title: string } | null> {
  // Seleziona feed pertinenti per sezione
  const feeds = section === "startup"
    ? MARKET_INTEL_RSS_FEEDS.filter(f => f.name.includes("Startup") || f.name.includes("Sifted") || f.name.includes("CB") || f.name.includes("TechCrunch"))
    : MARKET_INTEL_RSS_FEEDS.filter(f => f.name.includes("AI") || f.name.includes("Singularity") || f.name.includes("Decoder") || f.name.includes("CB"));

  // Fetch in parallelo
  const allItemsArrays = await Promise.all(
    feeds.map(f => fetchRSSWithImages(f.url, f.name))
  );
  const allItems = allItemsArrays.flat();

  if (allItems.length === 0) return null;

  // Ordina per rilevanza
  const scored = allItems
    .map(item => ({ ...item, score: computeRelevanceScore(item.title, topic) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best && best.score > 0) {
    console.log(`[MarketIntel] 🖼️ Immagine trovata da ${best.source}: "${best.title.slice(0, 60)}" (score: ${best.score})`);
    return { imageUrl: best.imageUrl, source: best.source, title: best.title };
  }

  // Fallback: prima immagine disponibile
  const fallback = allItems[0];
  if (fallback) {
    console.log(`[MarketIntel] 🖼️ Immagine fallback da ${fallback.source}`);
    return { imageUrl: fallback.imageUrl, source: fallback.source, title: fallback.title };
  }

  return null;
}

// ── API pubblica ─────────────────────────────────────────────────────────────

/**
 * Raccoglie dati di market intelligence e immagine pertinente per un topic.
 * Usato da linkedinPublisher.ts per arricchire i post con dati reali.
 */
export async function getMarketIntelligence(
  topic: string,
  section: "ai" | "startup"
): Promise<{
  data: MarketIntelligenceResult | null;
  image: { imageUrl: string; source: string; title: string } | null;
}> {
  console.log(`[MarketIntel] 🔍 Ricerca dati per: "${topic.slice(0, 60)}" (${section})`);

  // Esegui in parallelo: dati Perplexity + immagine RSS
  const [data, image] = await Promise.all([
    searchMarketData(topic, section),
    findMarketIntelligenceImage(topic, section),
  ]);

  return { data, image };
}
