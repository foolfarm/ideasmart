/**
 * Script per generare le prime 20 notizie Startup nel DB
 * Usa il startupScheduler per generare notizie, editoriale, startup del giorno, reportage e analisi
 */
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const BUILT_IN_FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const BUILT_IN_FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;

async function invokeLLM(messages) {
  const response = await fetch(`${BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BUILT_IN_FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      messages,
      max_tokens: 4000,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM error: ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function findPexelsImage(query) {
  if (!PEXELS_API_KEY) return null;
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(3, data.photos.length));
      return data.photos[idx].src.large;
    }
  } catch (e) {
    console.error("Pexels error:", e.message);
  }
  return null;
}

function getStartupImageQuery(title, category) {
  const musicKeywords = ["startup", "business", "entrepreneur", "office", "team", "technology", "innovation"];
  const catMap = {
    "Fintech": "fintech banking technology",
    "HealthTech": "health medical technology startup",
    "EdTech": "education technology learning",
    "GreenTech": "sustainable energy green technology",
    "AI Startup": "artificial intelligence startup office",
    "E-commerce": "ecommerce shopping technology",
    "SaaS": "software team office startup",
    "Biotech": "biotech laboratory research",
    "Mobility": "electric vehicle mobility startup",
    "FoodTech": "food technology restaurant startup",
  };
  const catQuery = catMap[category] || "startup business entrepreneur";
  // Extract keywords from title
  const titleWords = title.split(" ").filter(w => w.length > 4).slice(0, 2).join(" ");
  return `${catQuery} ${titleWords}`.trim();
}

async function generateStartupNews(db) {
  console.log("🚀 Generando 20 notizie Startup...");
  
  const today = new Date().toISOString().split("T")[0];
  
  const prompt = `Sei il direttore editoriale di IDEASMART Startup News, la testata italiana dedicata all'ecosistema startup.
  
Genera ESATTAMENTE 20 notizie sulle startup più interessanti e rilevanti degli ultimi giorni (italiane e internazionali).
Ogni notizia deve essere vera, recente e verificabile.

Rispondi SOLO con un array JSON valido, senza testo aggiuntivo:
[
  {
    "title": "Titolo della notizia (max 80 caratteri)",
    "summary": "Sommario dettagliato di 3-4 frasi che spiega il fatto, il contesto e l'impatto per l'ecosistema startup italiano.",
    "category": "Una di: Fintech|HealthTech|EdTech|GreenTech|AI Startup|E-commerce|SaaS|Biotech|Mobility|FoodTech|Funding|Acquisizioni|IPO|Regolamentazione",
    "sourceUrl": "URL dell'articolo originale (fonte autorevole: TechCrunch, Wired, Il Sole 24 Ore, StartupItalia, Forbes, etc.)",
    "sourceName": "Nome della fonte (es. TechCrunch)"
  }
]

Focus su: round di finanziamento, acquisizioni, nuove startup italiane, trend del mercato, tecnologie emergenti, storie di successo.`;

  let newsItems = [];
  try {
    const response = await invokeLLM([
      { role: "system", content: "Sei un esperto di startup e innovazione. Rispondi SOLO con JSON valido." },
      { role: "user", content: prompt }
    ]);
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      newsItems = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Errore generazione notizie:", e.message);
    return;
  }

  console.log(`✅ Generate ${newsItems.length} notizie. Aggiungo immagini Pexels...`);

  let inserted = 0;
  for (const item of newsItems.slice(0, 20)) {
    try {
      const imageQuery = getStartupImageQuery(item.title, item.category);
      const imageUrl = await findPexelsImage(imageQuery);
      
      await db.execute(
        `INSERT INTO news_items (title, summary, category, sourceName, sourceUrl, imageUrl, section, publishedAt, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 'startup', NOW(), NOW())`,
        [item.title, item.summary, item.category, item.sourceName, item.sourceUrl, imageUrl]
      );
      inserted++;
      console.log(`  ✅ [${inserted}] ${item.title.substring(0, 60)}... (img: ${imageUrl ? "✓" : "✗"})`);
      
      // Piccola pausa per non sovraccaricare Pexels
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`  ❌ Errore inserimento: ${e.message}`);
    }
  }
  
  console.log(`\n📰 ${inserted}/20 notizie Startup inserite nel DB`);
}

async function generateStartupEditorial(db) {
  console.log("\n✍️  Generando editoriale Startup...");
  
  const today = new Date().toISOString().split("T")[0];
  
  // Controlla se esiste già un editoriale per oggi
  const [existing] = await db.execute(
    "SELECT id FROM editorial_content WHERE section = 'startup' AND DATE(created_at) = ?",
    [today]
  );
  if (existing.length > 0) {
    console.log("  ℹ️  Editoriale già presente per oggi");
    return;
  }

  const prompt = `Sei il direttore editoriale di IDEASMART Startup News.

Scrivi un editoriale del giorno sull'ecosistema startup italiano e internazionale.
Deve essere autorevole, con una tesi chiara e dati concreti.

Rispondi SOLO con JSON:
{
  "title": "Titolo editoriale (max 80 caratteri)",
  "subtitle": "Sottotitolo (max 120 caratteri)",
  "content": "Testo dell'editoriale in markdown (600-800 parole). Usa ## per i sottotitoli. Includi dati, trend e prospettive.",
  "author": "Andrea Ceccherini, Direttore IDEASMART",
  "category": "Editoriale"
}`;

  try {
    const response = await invokeLLM([
      { role: "system", content: "Sei un esperto di startup. Rispondi SOLO con JSON valido." },
      { role: "user", content: prompt }
    ]);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;
    const editorial = JSON.parse(jsonMatch[0]);
    
    const imageUrl = await findPexelsImage("startup entrepreneur business meeting");
    
    await db.execute(
      `INSERT INTO editorial_content (title, subtitle, content, author, category, image_url, section, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'startup', NOW())`,
      [editorial.title, editorial.subtitle, editorial.content, editorial.author, editorial.category, imageUrl]
    );
    console.log(`  ✅ Editoriale: ${editorial.title}`);
  } catch (e) {
    console.error("  ❌ Errore editoriale:", e.message);
  }
}

async function generateStartupOfDay(db) {
  console.log("\n🏆 Generando Startup del Giorno...");
  
  const today = new Date().toISOString().split("T")[0];
  
  const [existing] = await db.execute(
    "SELECT id FROM startup_of_day WHERE date_label = ?",
    [today]
  );
  if (existing.length > 0) {
    console.log("  ℹ️  Startup del giorno già presente per oggi");
    return;
  }

  const prompt = `Sei il curatore di IDEASMART Startup News.

Scegli una startup italiana o internazionale particolarmente interessante da presentare oggi.
Deve essere una startup reale, verificabile, con una storia interessante.

Rispondi SOLO con JSON:
{
  "name": "Nome della startup",
  "tagline": "Slogan o descrizione breve (max 100 caratteri)",
  "description": "Descrizione dettagliata (300-400 parole) con storia, prodotto, mercato, funding e prospettive",
  "founded": "Anno di fondazione",
  "country": "Paese (es. Italia, USA, UK)",
  "sector": "Settore (es. Fintech, HealthTech, AI)",
  "funding": "Funding totale raccolto (es. €5M, $50M, Non divulgato)",
  "website": "URL del sito web"
}`;

  try {
    const response = await invokeLLM([
      { role: "system", content: "Sei un esperto di startup. Rispondi SOLO con JSON valido." },
      { role: "user", content: prompt }
    ]);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;
    const startup = JSON.parse(jsonMatch[0]);
    
    const imageUrl = await findPexelsImage(`${startup.sector} startup office team`);
    
    await db.execute(
      `INSERT INTO startup_of_day (name, tagline, description, founded, country, sector, funding, website, image_url, date_label, section, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'startup', NOW())`,
      [startup.name, startup.tagline, startup.description, startup.founded, startup.country, startup.sector, startup.funding, startup.website, imageUrl, today]
    );
    console.log(`  ✅ Startup del giorno: ${startup.name}`);
  } catch (e) {
    console.error("  ❌ Errore startup del giorno:", e.message);
  }
}

async function generateStartupReportage(db) {
  console.log("\n📋 Generando Reportage Startup...");

  const [existing] = await db.execute(
    "SELECT id FROM weekly_reportage WHERE section = 'startup' AND DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
  );
  if (existing.length > 0) {
    console.log("  ℹ️  Reportage già presente per questa settimana");
    return;
  }

  const prompt = `Sei il giornalista senior di IDEASMART Startup News.

Scrivi un reportage approfondito su un tema caldo dell'ecosistema startup italiano o internazionale.

Rispondi SOLO con JSON:
{
  "title": "Titolo del reportage (max 90 caratteri)",
  "subtitle": "Sottotitolo (max 150 caratteri)",
  "content": "Testo del reportage in markdown (800-1000 parole). Usa ## per i sottotitoli. Includi dati, interviste simulate, casi studio.",
  "author": "Redazione IDEASMART",
  "category": "Reportage",
  "readTime": 8
}`;

  try {
    const response = await invokeLLM([
      { role: "system", content: "Sei un giornalista esperto di startup. Rispondi SOLO con JSON valido." },
      { role: "user", content: prompt }
    ]);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;
    const reportage = JSON.parse(jsonMatch[0]);
    
    const imageUrl = await findPexelsImage("startup ecosystem innovation hub");
    
    await db.execute(
      `INSERT INTO weekly_reportage (title, subtitle, content, author, category, image_url, read_time, section, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'startup', NOW())`,
      [reportage.title, reportage.subtitle, reportage.content, reportage.author, reportage.category, imageUrl, reportage.readTime || 8]
    );
    console.log(`  ✅ Reportage: ${reportage.title}`);
  } catch (e) {
    console.error("  ❌ Errore reportage:", e.message);
  }
}

async function generateMarketAnalysis(db) {
  console.log("\n📊 Generando Analisi di Mercato Startup...");

  const [existing] = await db.execute(
    "SELECT id FROM market_analysis WHERE section = 'startup' AND DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
  );
  if (existing.length > 0) {
    console.log("  ℹ️  Analisi già presente per questa settimana");
    return;
  }

  const prompt = `Sei l'analista di mercato di IDEASMART Startup News.

Scrivi un'analisi di mercato approfondita su un trend dell'ecosistema startup.

Rispondi SOLO con JSON:
{
  "title": "Titolo dell'analisi (max 90 caratteri)",
  "subtitle": "Sottotitolo (max 150 caratteri)",
  "content": "Testo dell'analisi in markdown (700-900 parole). Usa ## per i sottotitoli. Includi dati di mercato, proiezioni, confronti internazionali.",
  "author": "Team Analisi IDEASMART",
  "category": "Analisi di Mercato",
  "readTime": 7
}`;

  try {
    const response = await invokeLLM([
      { role: "system", content: "Sei un analista di mercato esperto di startup. Rispondi SOLO con JSON valido." },
      { role: "user", content: prompt }
    ]);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;
    const analysis = JSON.parse(jsonMatch[0]);
    
    const imageUrl = await findPexelsImage("market analysis data chart business");
    
    await db.execute(
      `INSERT INTO market_analysis (title, subtitle, content, author, category, image_url, read_time, section, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'startup', NOW())`,
      [analysis.title, analysis.subtitle, analysis.content, analysis.author, analysis.category, imageUrl, analysis.readTime || 7]
    );
    console.log(`  ✅ Analisi: ${analysis.title}`);
  } catch (e) {
    console.error("  ❌ Errore analisi:", e.message);
  }
}

async function main() {
  const db = await createConnection(process.env.DATABASE_URL);
  
  try {
    await generateStartupNews(db);
    await generateStartupEditorial(db);
    await generateStartupOfDay(db);
    await generateStartupReportage(db);
    await generateMarketAnalysis(db);
    
    console.log("\n🎉 Sezione Startup News popolata con successo!");
  } finally {
    await db.end();
  }
}

main().catch(console.error);
