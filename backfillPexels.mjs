/**
 * Backfill immagini Pexels per tutti gli articoli esistenti nel DB
 * Sostituisce le immagini AI generate con immagini stock gratuite
 */
import { config } from 'dotenv';
config();

import mysql from 'mysql2/promise';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
  console.error('PEXELS_API_KEY not set');
  process.exit(1);
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ── Keyword mapping per categoria ────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  "AI & Hardware": ["computer chip technology", "semiconductor processor", "GPU technology"],
  "AI & Startup": ["startup office technology", "tech innovation team", "entrepreneur digital"],
  "Startup & Funding": ["investment funding startup", "venture capital business", "startup growth"],
  "AI & Fintech": ["fintech digital banking", "financial technology", "digital finance"],
  "AI & Salute": ["medical technology healthcare", "digital health", "hospital technology"],
  "AI & Lavoro": ["future work technology", "remote work digital", "workplace innovation"],
  "AI & Difesa": ["cybersecurity network", "digital security technology", "data protection"],
  "AI & Energia": ["renewable energy technology", "smart grid solar", "green technology"],
  "AI & Mobilità": ["autonomous vehicle technology", "electric car", "smart transportation"],
  "AI & Educazione": ["online education technology", "e-learning digital", "student technology"],
  "AI & Agricoltura": ["precision agriculture drone", "smart farming technology", "agricultural innovation"],
  "Modelli Generativi": ["artificial intelligence neural", "machine learning data", "deep learning"],
  "AI Agentiva": ["robot automation AI", "autonomous system technology", "digital agent"],
  "Big Tech": ["technology company office", "big tech innovation", "silicon valley"],
  "Startup & Funding": ["startup investment funding", "venture capital", "business growth"],
  "AI & Startup Italiane": ["startup italy technology", "italian innovation", "tech startup"],
  "Robot & AI Fisica": ["robot automation factory", "industrial robot", "robotics technology"],
  "Ricerca & Innovazione": ["research laboratory science", "innovation lab technology", "scientific research"],
  "Regolamentazione AI": ["law regulation technology", "policy digital", "compliance technology"],
  "AI & Sicurezza": ["cybersecurity protection", "data security network", "digital defense"],
  "Internazionalizzazione": ["global business technology", "international trade digital", "world market"],
  "Cybersecurity": ["cybersecurity hacker protection", "network security", "data breach"],
  "Cloud & Edge": ["cloud computing server", "data center technology", "cloud infrastructure"],
  "Robotica": ["robot technology automation", "industrial robot arm", "robotic system"],
  "default": ["artificial intelligence technology", "innovation digital future", "technology business"],
};

async function searchPexels(query, orientation = 'landscape') {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}&size=medium`;
    const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
    if (!res.ok) return null;
    const data = await res.json();
    const photos = data.photos || [];
    if (photos.length === 0) return null;
    const idx = Math.floor(Math.random() * Math.min(photos.length, 5));
    return photos[idx].src.large;
  } catch {
    return null;
  }
}

function extractKeywords(title) {
  const stopWords = new Set(['il','la','lo','le','gli','i','un','una','uno','di','da','in','con','su','per','tra','fra','e','o','ma','che','è','ha','si','non','del','della','dello','dei','degli','delle','al','allo','alla','ai','agli','alle','nel','nella','nei','the','a','an','of','in','on','at','to','for','and','or','but','with','by','from','as','is','are','lancia','presenta','annuncia','svela','investe','raccoglie','chiude','vince','nuovo','nuova']);
  const translations = { 'intelligenza':'artificial intelligence','artificiale':'AI','startup':'startup','tecnologia':'technology','digitale':'digital','robot':'robot','salute':'healthcare','sanità':'healthcare','energia':'energy','sicurezza':'security','finanza':'finance','banca':'banking','agricoltura':'agriculture','lavoro':'work','educazione':'education','mobilità':'mobility','difesa':'defense','chip':'microchip','cloud':'cloud computing','dati':'data','algoritmo':'algorithm','modello':'machine learning','europa':'europe','italia':'italy','mercato':'market','investimento':'investment','crescita':'growth' };
  const words = title.toLowerCase().replace(/[^\w\s]/g,' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w)).slice(0, 4);
  return words.map(w => translations[w] || w).join(' ') || 'technology innovation';
}

async function findImage(title, category) {
  // 1. Parole chiave dal titolo
  const kw1 = extractKeywords(title) + ' technology';
  let url = await searchPexels(kw1);
  if (url) return url;

  // 2. Parole chiave dalla categoria
  const catKws = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS['default'];
  const kw2 = catKws[Math.floor(Math.random() * catKws.length)];
  url = await searchPexels(kw2);
  if (url) return url;

  // 3. Fallback generico
  return await searchPexels('artificial intelligence technology business');
}

// ── Backfill news ─────────────────────────────────────────────────────────────
console.log('\n[Backfill] Starting Pexels image backfill...\n');

const [newsRows] = await conn.execute('SELECT id, title, category FROM news_items ORDER BY id');
console.log(`[Backfill] Found ${newsRows.length} news items`);

let newsUpdated = 0;
for (const row of newsRows) {
  const url = await findImage(row.title, row.category);
  if (url) {
    await conn.execute('UPDATE news_items SET imageUrl = ? WHERE id = ?', [url, row.id]);
    newsUpdated++;
    console.log(`  ✓ News ${row.id}: ${row.title.slice(0, 45)}...`);
  } else {
    console.log(`  ✗ News ${row.id}: no image found`);
  }
  // Rate limiting: max 200 req/ora = ~3.3/min, aspettiamo 400ms tra richieste
  await new Promise(r => setTimeout(r, 400));
}
console.log(`[Backfill] News: ${newsUpdated}/${newsRows.length} updated\n`);

// ── Backfill editoriale ───────────────────────────────────────────────────────
const [editRows] = await conn.execute('SELECT id, title FROM daily_editorial ORDER BY id');
console.log(`[Backfill] Found ${editRows.length} editorial items`);

let editUpdated = 0;
for (const row of editRows) {
  const url = await findImage(row.title, 'Modelli Generativi');
  if (url) {
    await conn.execute('UPDATE daily_editorial SET imageUrl = ? WHERE id = ?', [url, row.id]);
    editUpdated++;
    console.log(`  ✓ Editorial ${row.id}: ${row.title.slice(0, 45)}...`);
  }
  await new Promise(r => setTimeout(r, 400));
}
console.log(`[Backfill] Editorial: ${editUpdated}/${editRows.length} updated\n`);

// ── Backfill startup ──────────────────────────────────────────────────────────
const [startupRows] = await conn.execute('SELECT id, name, category, tagline FROM startup_of_day ORDER BY id');
console.log(`[Backfill] Found ${startupRows.length} startup items`);

let startupUpdated = 0;
for (const row of startupRows) {
  const url = await findImage(`${row.name} ${row.tagline}`, 'AI & Startup');
  if (url) {
    await conn.execute('UPDATE startup_of_day SET imageUrl = ? WHERE id = ?', [url, row.id]);
    startupUpdated++;
    console.log(`  ✓ Startup ${row.id}: ${row.name}`);
  }
  await new Promise(r => setTimeout(r, 400));
}
console.log(`[Backfill] Startup: ${startupUpdated}/${startupRows.length} updated\n`);

// ── Backfill reportage ────────────────────────────────────────────────────────
const [repRows] = await conn.execute('SELECT id, startupName, headline, category FROM weekly_reportage ORDER BY id');
console.log(`[Backfill] Found ${repRows.length} reportage items`);

let repUpdated = 0;
for (const row of repRows) {
  const url = await findImage(row.headline || row.startupName, row.category || 'AI & Startup');
  if (url) {
    await conn.execute('UPDATE weekly_reportage SET imageUrl = ? WHERE id = ?', [url, row.id]);
    repUpdated++;
    console.log(`  ✓ Reportage ${row.id}: ${row.startupName}`);
  }
  await new Promise(r => setTimeout(r, 400));
}
console.log(`[Backfill] Reportage: ${repUpdated}/${repRows.length} updated\n`);

// ── Backfill analisi di mercato ───────────────────────────────────────────────
const [mktRows] = await conn.execute('SELECT id, title, category, source FROM market_analysis ORDER BY id');
console.log(`[Backfill] Found ${mktRows.length} market analysis items`);

let mktUpdated = 0;
for (const row of mktRows) {
  const url = await findImage(row.title, row.category || 'Modelli Generativi');
  if (url) {
    await conn.execute('UPDATE market_analysis SET imageUrl = ? WHERE id = ?', [url, row.id]);
    mktUpdated++;
    console.log(`  ✓ Market ${row.id}: ${row.title.slice(0, 45)}...`);
  }
  await new Promise(r => setTimeout(r, 400));
}
console.log(`[Backfill] Market Analysis: ${mktUpdated}/${mktRows.length} updated\n`);

await conn.end();

console.log('═══════════════════════════════════════════');
console.log(`[Backfill] COMPLETED`);
console.log(`  News:            ${newsUpdated}/${newsRows.length}`);
console.log(`  Editorial:       ${editUpdated}/${editRows.length}`);
console.log(`  Startup:         ${startupUpdated}/${startupRows.length}`);
console.log(`  Reportage:       ${repUpdated}/${repRows.length}`);
console.log(`  Market Analysis: ${mktUpdated}/${mktRows.length}`);
console.log('═══════════════════════════════════════════');
