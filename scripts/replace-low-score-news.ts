/**
 * Script per sostituire automaticamente le notizie con audit score < 40
 * Usa tsx per importare i file TypeScript direttamente
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, and, desc } from 'drizzle-orm';
import { newsItems, contentAudit } from '../drizzle/schema';
import { invokeLLM } from '../server/_core/llm';

const connection = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

async function getLowScoreNews(section: 'ai' | 'music') {
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

  const auditMap = new Map<number, { coherenceScore: number | null; status: string; auditNote: string | null }>();
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
  }));
}

async function runReplacement(section: 'ai' | 'music') {
  const sectionLabel = section === 'ai'
    ? 'intelligenza artificiale, startup e business'
    : 'musica rock, indie e industria musicale';
  const sectionName = section === 'ai' ? 'AI4Business' : 'ITsMusic';

  console.log(`\n[Replace] === Sezione: ${sectionName} ===`);

  const lowScoreNews = await getLowScoreNews(section);
  console.log(`[Replace] Trovate ${lowScoreNews.length} notizie da sostituire`);

  if (lowScoreNews.length === 0) {
    console.log('[Replace] Nessuna notizia da sostituire.');
    return 0;
  }

  let replaced = 0;
  for (const news of lowScoreNews) {
    try {
      console.log(`[Replace] Sostituendo: "${news.title.substring(0, 70)}..." (score: ${news.auditScore ?? 'N/A'}, status: ${news.auditStatus})`);

      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'Sei un giornalista editoriale italiano specializzato. Genera sempre contenuti accurati e verificabili. Rispondi solo con JSON valido.',
          },
          {
            role: 'user',
            content: `Sei un giornalista specializzato in ${sectionLabel}. Genera una notizia originale e rilevante per la categoria "${news.category}". La notizia deve essere attuale (2025-2026), accurata e citare una fonte reale (testata giornalistica esistente come TechCrunch, Wired, Il Sole 24 Ore, Rolling Stone, etc.). Rispondi SOLO con JSON valido.`,
          },
        ],
        response_format: {
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
                sourceUrl: { type: 'string', description: 'URL della homepage della fonte (es. https://techcrunch.com)' },
              },
              required: ['title', 'summary', 'category', 'sourceName', 'sourceUrl'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.log(`[Replace] Nessun contenuto generato per notizia ${news.id}`);
        continue;
      }

      const newContent = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

      await db.update(newsItems)
        .set({
          title: newContent.title,
          summary: newContent.summary,
          category: newContent.category,
          sourceUrl: newContent.sourceUrl ?? null,
          sourceName: newContent.sourceName ?? null,
        })
        .where(eq(newsItems.id, news.id));

      replaced++;
      console.log(`[Replace] ✓ Sostituita: "${newContent.title.substring(0, 70)}..."`);

      // Pausa tra le richieste
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err: any) {
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
await connection.end();
process.exit(0);
