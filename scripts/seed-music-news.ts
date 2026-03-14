/**
 * Script per generare 20 notizie ITsMusic nel DB
 * Eseguire con: npx tsx scripts/seed-music-news.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { invokeLLM } from '../server/_core/llm';
import { getDb } from '../server/db';
import { newsItems as newsItemsTable } from '../drizzle/schema';

const MUSIC_CATEGORIES = [
  'Rock & Indie', 'AI Music', 'Industria Musicale', 'Tour & Live',
  'Artisti Emergenti', 'Streaming & Digital', 'Vinile & Fisico',
  'Produzione Musicale', 'Diritti & Copyright', 'Festival & Concerti'
];

async function generateMusicNews(): Promise<Array<{
  title: string;
  summary: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
}>> {
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `Sei un giornalista musicale esperto di rock, indie, musica italiana e industria musicale. 
Genera 20 notizie originali, credibili e attuali (marzo 2026) sul mondo della musica.
Le notizie devono coprire: rock, indie italiano, AI nella musica, industria musicale, artisti emergenti, streaming, vinile, festival.
Ogni notizia deve avere un titolo accattivante e un sommario di 2-3 frasi.
Usa fonti credibili come Rolling Stone, Billboard, NME, Il Manifesto, Rockol, Wired Music.`
      },
      {
        role: 'user',
        content: `Genera esattamente 20 notizie musicali per il canale ITsMusic di IDEASMART.
Rispondi SOLO con un JSON array valido con questa struttura:
[
  {
    "title": "Titolo della notizia",
    "summary": "Sommario di 2-3 frasi descrittive e informative.",
    "category": "Una delle categorie: Rock & Indie, AI Music, Industria Musicale, Tour & Live, Artisti Emergenti, Streaming & Digital, Vinile & Fisico, Produzione Musicale, Diritti & Copyright, Festival & Concerti",
    "sourceName": "Nome fonte credibile",
    "sourceUrl": "https://url-fonte-reale.com"
  }
]
Genera esattamente 20 notizie. Varia le categorie. Includi artisti italiani (Calcutta, Gazzelle, Maneskin, Salmo, Cosmo, Frah Quintale) e internazionali.`
      }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'music_news_list',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            news: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  summary: { type: 'string' },
                  category: { type: 'string' },
                  sourceName: { type: 'string' },
                  sourceUrl: { type: 'string' }
                },
                required: ['title', 'summary', 'category', 'sourceName', 'sourceUrl'],
                additionalProperties: false
              }
            }
          },
          required: ['news'],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
  return parsed.news;
}

async function main() {
  console.log('[MusicSeed] Generazione 20 notizie ITsMusic...');
  
  const db = await getDb();
  if (!db) {
    console.error('[MusicSeed] Errore: DB non disponibile');
    process.exit(1);
  }

  try {
    const newsItems = await generateMusicNews();
    console.log(`[MusicSeed] Generati ${newsItems.length} articoli dall'AI`);

    const now = new Date().toISOString().slice(0, 10);
    let inserted = 0;

    for (const item of newsItems) {
      try {
        await db.insert(newsItemsTable).values({
          title: item.title,
          summary: item.summary,
          category: item.category,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          section: 'music',
          publishedAt: now,
          weekLabel: `Settimana del ${now}`,
          position: inserted + 1,
          imageUrl: null,
        });
        inserted++;
        console.log(`[MusicSeed] ✓ ${inserted}. ${item.title.slice(0, 60)}...`);
      } catch (err) {
        console.error(`[MusicSeed] ✗ Errore inserimento: ${item.title}`, err);
      }
    }

    console.log(`\n[MusicSeed] Completato: ${inserted}/${newsItems.length} notizie inserite nel DB`);
  } catch (err) {
    console.error('[MusicSeed] Errore generazione:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();
