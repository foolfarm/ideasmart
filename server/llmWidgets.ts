/**
 * IDEASMART — LLM Widget Generators
 *
 * Funzioni standalone per generare i dati dei widget basati su LLM:
 * - computeBarometro(): estrae intenzioni di voto dalle notizie sondaggi
 * - computeThreatAlert(): estrae minacce cyber dalle notizie cybersecurity
 *
 * Queste funzioni sono usate sia nelle tRPC procedures (routers.ts)
 * sia nel warm-up della cache all'avvio del server (index.ts).
 */
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import type { newsItems } from "../drizzle/schema";
type NewsItem = typeof newsItems.$inferSelect;
import { newsItems as newsItemsTable } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ─── Barometro Politico ───────────────────────────────────────────────────────

export async function computeBarometro(): Promise<object | null> {
  const db = await getDb();
  if (!db) return null;

  const items = await db.select().from(newsItemsTable)
    .where(eq(newsItemsTable.section, 'sondaggi'))
    .orderBy(desc(newsItemsTable.createdAt))
    .limit(30);

  if (!items.length) return null;

  const newsText = items.map((n: NewsItem) =>
    `TITOLO: ${n.title}\nSOMMARIO: ${n.summary}\nFONTE: ${n.sourceName ?? ''}\nDATA: ${n.publishedAt ?? ''}`
  ).join('\n\n---\n\n');

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `Sei un analista politico italiano esperto di sondaggi. Analizza le notizie fornite ed estrai i dati sulle intenzioni di voto dei partiti italiani. Se non ci sono dati percentuali espliciti, stima le tendenze basandoti sul contesto. Restituisci SEMPRE dati per i principali partiti italiani (FdI, PD, M5S, Lega, FI, AVS, Az/IV, altri). I valori devono sommare a circa 100%.`
      },
      {
        role: 'user',
        content: `Analizza queste notizie sui sondaggi italiani ed estrai/stima le intenzioni di voto per i principali partiti:\n\n${newsText}\n\nRestituisci i dati in formato JSON con i partiti e le loro percentuali. Includi anche la fonte e la data del sondaggio più recente trovato.`
      }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'barometro_politico',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            partiti: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  nome: { type: 'string', description: 'Nome del partito (abbreviazione)' },
                  nomeCompleto: { type: 'string', description: 'Nome completo del partito' },
                  percentuale: { type: 'number', description: 'Percentuale intenzioni di voto (0-100)' },
                  colore: { type: 'string', description: 'Colore hex del partito (es. #1a3a6e per FdI)' },
                  variazione: { type: 'number', description: 'Variazione rispetto al sondaggio precedente (positivo = crescita)' },
                },
                required: ['nome', 'nomeCompleto', 'percentuale', 'colore', 'variazione'],
                additionalProperties: false,
              }
            },
            fonte: { type: 'string', description: 'Nome istituto sondaggistico' },
            data: { type: 'string', description: 'Data del sondaggio (gg/mm/aaaa)' },
            nota: { type: 'string', description: 'Nota metodologica o contesto breve' },
          },
          required: ['partiti', 'fonte', 'data', 'nota'],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
}

// ─── Threat Alert ─────────────────────────────────────────────────────────────

export async function computeThreatAlert(): Promise<object | null> {
  const db = await getDb();
  if (!db) return null;

  const items = await db.select().from(newsItemsTable)
    .where(eq(newsItemsTable.section, 'cybersecurity'))
    .orderBy(desc(newsItemsTable.createdAt))
    .limit(40);

  if (!items.length) return null;

  const newsText = items.map((n: NewsItem) =>
    `TITOLO: ${n.title}\nSOMMARIO: ${n.summary}\nFONTE: ${n.sourceName ?? ''}\nDATA: ${n.publishedAt ?? ''}`
  ).join('\n\n---\n\n');

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `Sei un analista di cybersecurity italiano esperto di threat intelligence. Analizza le notizie fornite ed estrai le principali minacce cyber della settimana in Italia e nel mondo. Identifica ransomware, phishing, vulnerabilità critiche, data breach e attacchi APT. Restituisci sempre 5-7 minacce ordinate per gravità.`
      },
      {
        role: 'user',
        content: `Analizza queste notizie cybersecurity ed estrai le principali minacce della settimana:\n\n${newsText}\n\nRestituisci i dati in formato JSON con le minacce, il livello di rischio e le raccomandazioni.`
      }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'threat_alert',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            minacce: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipo: { type: 'string', description: 'Tipo di minaccia (Ransomware, Phishing, Vulnerabilità, Data Breach, APT, DDoS, altro)' },
                  nome: { type: 'string', description: 'Nome o identificativo della minaccia' },
                  descrizione: { type: 'string', description: 'Descrizione breve della minaccia (max 120 caratteri)' },
                  livelloRischio: { type: 'string', description: 'Livello di rischio: CRITICO, ALTO, MEDIO, BASSO' },
                  settoreColpito: { type: 'string', description: 'Settore principalmente colpito (PA, Finance, Healthcare, Industria, Privati, ecc.)' },
                  fonte: { type: 'string', description: 'Fonte della notizia (CERT-AGID, ACN, Cybersecurity360, ecc.)' },
                },
                required: ['tipo', 'nome', 'descrizione', 'livelloRischio', 'settoreColpito', 'fonte'],
                additionalProperties: false,
              }
            },
            aggiornato: { type: 'string', description: 'Data aggiornamento (gg/mm/aaaa)' },
            sommario: { type: 'string', description: 'Sommario del panorama delle minacce della settimana (max 200 caratteri)' },
          },
          required: ['minacce', 'aggiornato', 'sommario'],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
}
