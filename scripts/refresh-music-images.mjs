/**
 * Script: refresh-music-images.mjs
 * Aggiorna le imageUrl delle notizie Music nel DB con immagini Pexels musicali.
 * Usa la stessa logica corretta di stockImages.ts (keyword musicali, non tecnologiche).
 */
import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// Mapping categorie → keyword Pexels musicali (stesso di stockImages.ts)
const CATEGORY_KEYWORDS = {
  "Rock & Indie":        ["rock concert stage", "indie band live", "rock music performance"],
  "AI Music":            ["music technology studio", "digital music production", "audio recording"],
  "Industria Musicale":  ["music industry business", "record label office", "music business"],
  "Tour & Live":         ["concert stage lights", "live music concert crowd", "music tour"],
  "Artisti Emergenti":   ["young musician performing", "emerging artist studio", "music recording"],
  "Streaming & Digital": ["music streaming headphones", "digital audio listening", "music playlist"],
  "Vinile & Fisico":     ["vinyl record turntable", "record store shelves", "vinyl music"],
  "Produzione Musicale": ["music studio mixing", "recording studio console", "music producer"],
  "Diritti & Copyright": ["music rights contract", "musician copyright", "music law"],
  "Festival & Concerti": ["music festival outdoor", "festival crowd concert", "summer concert"],
  "default":             ["music concert", "musician playing", "live music"],
};

// Keyword musicali per titolo (IT→EN)
const MUSIC_TRANSLATIONS = {
  "musica": "music", "musicale": "music", "musicali": "music",
  "concerto": "concert", "concerti": "concert stage", "tour": "music tour",
  "album": "album vinyl", "singolo": "music single", "band": "rock band",
  "artista": "musician", "artisti": "musicians", "festival": "music festival",
  "streaming": "music streaming", "vinile": "vinyl record",
  "produzione": "music production", "studio": "recording studio",
  "chitarra": "guitar", "batteria": "drums", "cantante": "singer",
  "indie": "indie music", "rock": "rock music", "punk": "punk rock",
  "pop": "pop music", "rapper": "rapper", "dj": "dj music",
  "etichetta": "record label", "royalties": "music royalties",
  "diritti": "music rights", "palco": "concert stage", "live": "live concert",
  "playlist": "music playlist", "spotify": "music streaming",
  "emergenti": "emerging musicians", "produttore": "music producer",
  "discografica": "record label", "major": "record label",
};

const STOP_WORDS = new Set([
  "il","la","lo","le","gli","i","un","una","uno","di","da","in","con","su","per",
  "tra","fra","e","o","ma","che","è","ha","si","non","del","della","dello","dei",
  "degli","delle","al","allo","alla","ai","agli","alle","nel","nella","nei",
  "the","a","an","of","on","at","to","for","and","or","but","with","by","from",
  "lancia","presenta","annuncia","svela","rilascia","investe","raccoglie",
  "nuovo","nuova","nuovi","nuove","primo","prima","verso","dopo","come",
]);

function extractMusicKeywords(title) {
  const words = title.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w)).slice(0, 4);
  const translated = words.map(w => MUSIC_TRANSLATIONS[w] || w).join(" ");
  return translated || "music";
}

async function searchPexels(query) {
  if (!PEXELS_API_KEY) return null;
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&size=medium`;
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

async function findMusicImage(title, category) {
  // 1. Keyword dal titolo + "music"
  const titleKws = extractMusicKeywords(title);
  let url = await searchPexels(`${titleKws} music`);
  
  // 2. Keyword della categoria
  if (!url) {
    const catKws = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS["default"];
    const q = catKws[Math.floor(Math.random() * catKws.length)];
    url = await searchPexels(q);
  }
  
  // 3. Fallback musicale generico
  if (!url) {
    const fallbacks = ["music concert", "live music", "musician playing", "music studio", "vinyl record"];
    url = await searchPexels(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
  }
  
  return url;
}

async function main() {
  if (!PEXELS_API_KEY) { console.error('PEXELS_API_KEY not set'); process.exit(1); }
  if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

  const conn = await createConnection(DATABASE_URL);

  // Recupera tutte le notizie Music
  const [rows] = await conn.query(
    'SELECT id, title, category, imageUrl FROM news_items WHERE section = "music" ORDER BY id DESC'
  );

  console.log(`Trovate ${rows.length} notizie Music da aggiornare`);
  
  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    console.log(`\n[${row.id}] ${row.category} — ${row.title.substring(0, 50)}...`);
    
    const imageUrl = await findMusicImage(row.title, row.category);
    
    if (imageUrl) {
      await conn.query('UPDATE news_items SET imageUrl = ? WHERE id = ?', [imageUrl, row.id]);
      console.log(`  ✓ Immagine aggiornata: ${imageUrl.substring(0, 80)}...`);
      updated++;
    } else {
      console.log(`  ✗ Nessuna immagine trovata`);
      failed++;
    }
    
    // Pausa per rispettare i rate limit Pexels (200 req/ora)
    await new Promise(r => setTimeout(r, 300));
  }

  await conn.end();

  console.log('\n=== RISULTATO ===');
  console.log(`✓ Aggiornate: ${updated}`);
  console.log(`✗ Fallite: ${failed}`);
}

main().catch(err => { console.error('Errore:', err); process.exit(1); });
