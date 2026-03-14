/**
 * Script per sostituire automaticamente le notizie con audit score < 40
 * Esegue la stessa logica di news.replaceAllLowScore ma direttamente sul DB
 */
import { createRequire } from 'module';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '..', '.env') });

const require = createRequire(import.meta.url);

// Carica le dipendenze necessarie
const { drizzle } = await import('drizzle-orm/mysql2');
const { eq, and, desc } = await import('drizzle-orm');

const db = drizzle(process.env.DATABASE_URL);

// Importa schema
const { newsItems, contentAudit } = await import('../drizzle/schema.js');

async function getLowScoreNews(section) {
  const allNews = await db.select().from(newsItems)
    .where(eq(newsItems.section, section))
    .orderBy(desc(newsItems.createdAt));

  const audits = await db.select({
    contentId: contentAudit.contentId,
    coherenceScore: contentAudit.coherenceScore,
    status: contentAudit.status,
    auditNote: contentAudit.auditNote,
  }).from(contentAudit)
    .where(and(
      eq(contentAudit.contentType, 'news'),
      eq(contentAudit.section, section)
    ))
    .orderBy(desc(contentAudit.auditedAt));

  const auditMap = new Map();
  for (const audit of audits) {
    if (!auditMap.has(audit.contentId)) {
      auditMap.set(audit.contentId, {
        coherenceScore: audit.coherenceScore,
        status: audit.status,
        auditNote: audit.auditNote,
      });
    }
  }

  return allNews.filter(news => {
    const audit = auditMap.get(news.id);
    if (!audit) return false;
    return audit.status === 'unreachable' || (audit.coherenceScore !== null && audit.coherenceScore < 40);
  }).map(news => ({
    ...news,
    auditScore: auditMap.get(news.id)?.coherenceScore ?? null,
    auditStatus: auditMap.get(news.id)?.status ?? 'pending',
    auditNote: auditMap.get(news.id)?.auditNote ?? null,
  }));
}

async function callLLM(messages, responseFormat) {
  const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      response_format: responseFormat,
    }),
  });
  if (!response.ok) throw new Error(`LLM error: ${response.status}`);
  return response.json();
}

async function replaceNewsItem(id, newContent) {
  await db.update(newsItems)
    .set({
      title: newContent.title,
      summary: newContent.summary,
      category: newContent.category,
      sourceUrl: newContent.sourceUrl ?? null,
      sourceName: newContent.sourceName ?? null,
    })
    .where(eq(newsItems.id, id));
}

async function runReplacement(section) {
  const sectionLabel = section === 'ai' ? 'intelligenza artificiale e business' : 'musica rock, indie e industria musicale';
  console.log(`\n[Replace] Sezione: ${section === 'ai' ? 'AI4Business' : 'ITsMusic'}`);

  const lowScoreNews = await getLowScoreNews(section);
  console.log(`[Replace] Trovate ${lowScoreNews.length} notizie da sostituire`);

  if (lowScoreNews.length === 0) {
    console.log('[Replace] Nessuna notizia da sostituire.');
    return 0;
  }

  let replaced = 0;
  for (const news of lowScoreNews) {
    try {
      console.log(`[Replace] Sostituendo: "${news.title.substring(0, 60)}..." (score: ${news.auditScore ?? 'N/A'}, status: ${news.auditStatus})`);

      const response = await callLLM([
        {
          role: 'system',
          content: 'Sei un giornalista editoriale italiano specializzato. Genera sempre contenuti accurati e verificabili. Rispondi solo con JSON valido.',
        },
        {
          role: 'user',
          content: `Sei un giornalista specializzato in ${sectionLabel}. Genera una notizia originale e verificabile per sostituire questa notizia che ha avuto problemi di coerenza con la fonte originale.

Notizia originale (da sostituire): "${news.title}"
Categoria: ${news.category}

Genera una notizia diversa, attuale e rilevante per la stessa categoria. La notizia deve avere un URL di fonte reale e verificabile (non inventato). Rispondi SOLO con JSON valido.`,
        },
      ], {
        type: 'json_schema',
        json_schema: {
          name: 'news_replacement',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Titolo della notizia (max 120 caratteri)' },
              summary: { type: 'string', description: 'Sommario della notizia (2-3 frasi, max 300 caratteri)' },
              category: { type: 'string', description: 'Categoria della notizia' },
              sourceName: { type: 'string', description: 'Nome della fonte (es. TechCrunch, Wired, Rolling Stone)' },
              sourceUrl: { type: 'string', description: 'URL della fonte originale (URL reale e verificabile)' },
            },
            required: ['title', 'summary', 'category', 'sourceName', 'sourceUrl'],
            additionalProperties: false,
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.log(`[Replace] Nessun contenuto generato per notizia ${news.id}`);
        continue;
      }

      const newContent = JSON.parse(content);
      await replaceNewsItem(news.id, newContent);
      replaced++;
      console.log(`[Replace] ✓ Sostituita: "${newContent.title.substring(0, 60)}..."`);

      // Pausa tra le richieste per non sovraccaricare l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`[Replace] ✗ Errore notizia ${news.id}:`, err.message);
    }
  }

  console.log(`[Replace] Completato: ${replaced}/${lowScoreNews.length} notizie sostituite`);
  return replaced;
}

// Esegui per entrambe le sezioni
console.log('=== Sostituzione automatica notizie non coerenti ===');
const aiReplaced = await runReplacement('ai');
const musicReplaced = await runReplacement('music');
console.log(`\n=== TOTALE: ${aiReplaced + musicReplaced} notizie sostituite ===`);
process.exit(0);
