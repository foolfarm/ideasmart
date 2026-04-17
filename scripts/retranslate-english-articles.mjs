/**
 * Script one-shot: identifica articoli con titolo/summary in inglese nel DB
 * e li ritraducono in italiano via LLM (batch da 10 alla volta).
 * Usa il modello LLM interno di ProofPress.
 */
import { createConnection } from 'mysql2/promise';

const BATCH_SIZE = 8;
// Usa Anthropic direttamente (disponibile come BYOK)
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const FORGE_URL = (process.env.BUILT_IN_FORGE_API_URL || 'https://forge.manus.im').replace(/\/$/, '') + '/v1/chat/completions';
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;

// Rileva se un testo è prevalentemente in inglese
function isEnglish(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  // Parole funzione inglesi tipiche
  const englishWords = [' the ', ' and ', ' for ', ' with ', ' from ', ' into ', ' that ', ' this ', ' will ', ' has ', ' have ', ' its ', ' are ', ' was ', ' were ', ' been ', ' being ', ' raises ', ' launches ', ' bags ', ' secures ', ' unveils ', ' acquires ', ' partners ', ' expands ', ' closes ', ' hires ', ' appoints ', ' warns ', ' plans ', ' eyes ', ' targets ', ' surges ', ' falls ', ' cuts ', ' doubles ', ' triples ', ' builds ', ' finds ', ' shows ', ' hits ', ' tops ', ' beats ', ' gains ', ' grows '];
  const italianWords = [' il ', ' la ', ' le ', ' gli ', ' un ', ' una ', ' del ', ' della ', ' dei ', ' delle ', ' che ', ' con ', ' per ', ' una ', ' nel ', ' nella ', ' nei ', ' nelle ', ' non ', ' si ', ' di ', ' da ', ' in ', ' su ', ' tra ', ' fra ', ' come ', ' ma ', ' anche ', ' più ', ' già '];
  
  let enScore = 0;
  let itScore = 0;
  for (const w of englishWords) if (lower.includes(w)) enScore++;
  for (const w of italianWords) if (lower.includes(w)) itScore++;
  
  // Considera inglese se ha più parole inglesi che italiane e almeno 2 match inglesi
  return enScore >= 2 && enScore > itScore;
}

async function translateBatch(articles) {
  const systemPrompt = `Sei un traduttore editoriale per ProofPress, magazine italiano su AI, startup e venture capital.
Ricevi un array JSON di articoli con id, title e summary in inglese.
Traduci title e summary in italiano professionale, mantenendo:
- Nomi propri, sigle (AI, VC, IPO, SaaS, CEO, etc.) invariati
- Numeri, percentuali e valute invariati
- Tono editoriale autorevole
- Summary max 300 caratteri
Rispondi SOLO con un array JSON valido: [{"id": N, "title": "...", "summary": "..."}]`;

  const userContent = JSON.stringify(articles.map(a => ({ id: a.id, title: a.title, summary: a.summary?.slice(0, 400) || '' })));

  let content = '';

  // Prova prima con Anthropic diretto
  if (ANTHROPIC_KEY) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      }),
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    content = data.content?.[0]?.text || '';
  } else {
    // Fallback: Forge API (OpenAI-compatible)
    const res = await fetch(FORGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FORGE_KEY}` },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        max_tokens: 4000
      }),
      signal: AbortSignal.timeout(60000)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Forge error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    content = data.choices?.[0]?.message?.content || '';
  }

  // Estrai JSON dall'output
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`JSON non trovato nell'output LLM: ${content.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL);
  
  try {
    // Recupera articoli candidati (ultimi 30 giorni)
    const [allRows] = await conn.execute(`
      SELECT id, title, summary, sourceName
      FROM news_items
      ORDER BY publishedAt DESC
      LIMIT 500
    `);

    // Filtra quelli realmente in inglese
    const englishArticles = allRows.filter(r => isEnglish(r.title) || isEnglish(r.summary));
    console.log(`\n📊 Articoli totali analizzati: ${allRows.length}`);
    console.log(`🇬🇧 Articoli in inglese identificati: ${englishArticles.length}`);
    
    if (englishArticles.length === 0) {
      console.log('✅ Nessun articolo in inglese trovato. DB già pulito.');
      return;
    }

    console.log('\nPrimi 10 da tradurre:');
    englishArticles.slice(0, 10).forEach(a => console.log(`  [${a.id}] ${a.title.slice(0, 80)}`));

    let translated = 0;
    let errors = 0;

    // Processa in batch
    for (let i = 0; i < englishArticles.length; i += BATCH_SIZE) {
      const batch = englishArticles.slice(i, i + BATCH_SIZE);
      console.log(`\n🔄 Batch ${Math.floor(i/BATCH_SIZE)+1}/${Math.ceil(englishArticles.length/BATCH_SIZE)} (${batch.length} articoli)...`);
      
      try {
        const translations = await translateBatch(batch);
        
        for (const t of translations) {
          if (!t.id || !t.title) continue;
          await conn.execute(
            'UPDATE news_items SET title = ?, summary = ? WHERE id = ?',
            [t.title.slice(0, 500), t.summary?.slice(0, 800) || '', t.id]
          );
          console.log(`  ✅ [${t.id}] ${t.title.slice(0, 70)}`);
          translated++;
        }
        
        // Pausa tra batch per non sovraccaricare l'LLM
        if (i + BATCH_SIZE < englishArticles.length) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (batchErr) {
        console.error(`  ❌ Batch fallito:`, batchErr.message);
        errors++;
        // Continua con il prossimo batch
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    console.log(`\n✅ Ritraduzione completata: ${translated} articoli tradotti, ${errors} batch falliti`);
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
