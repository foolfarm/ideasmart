/**
 * Channel Ingestor — RSS + AI Agent per generare contenuti per i nuovi canali
 *
 * Pipeline:
 * 1. Fetch RSS feeds configurati per ogni canale
 * 2. Estrai titoli, link, descrizioni
 * 3. Passa all'AI agent per trasformare in contenuto strutturato
 * 4. Salva nel DB (channel_content)
 */

import { getDb } from "./db";
import { channelContent, rssFeedSources, rssIngestLog } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { invokeLLMFast, stripJsonBackticks } from "./_core/llm";
import { findStockImage } from "./stockImages";
import { certifyWithPpv } from "./proofpressVerifyClient";

// ── RSS Parser (lightweight, no external dep) ──────────────────────────────
async function fetchRssFeed(url: string): Promise<Array<{ title: string; link: string; description: string; pubDate?: string }>> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Proof Press/1.0 RSS Reader" },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRssXml(xml);
  } catch (err: any) {
    console.error(`[ChannelIngestor] RSS fetch error for ${url}: ${err.message}`);
    return [];
  }
}

function parseRssXml(xml: string): Array<{ title: string; link: string; description: string; pubDate?: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate?: string }> = [];
  // Match <item> or <entry> blocks
  const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractLink(block);
    const description = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content");
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated");
    if (title) {
      items.push({
        title: stripHtml(title).slice(0, 500),
        link: link || "",
        description: stripHtml(description || "").slice(0, 1000),
        pubDate,
      });
    }
  }
  return items.slice(0, 20); // Max 20 per feed
}

function extractTag(block: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(block);
  if (cdataMatch) return cdataMatch[1].trim();
  // Handle normal tags
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = regex.exec(block);
  return m ? m[1].trim() : "";
}

function extractLink(block: string): string {
  // <link>url</link>
  const linkTag = extractTag(block, "link");
  if (linkTag && linkTag.startsWith("http")) return linkTag;
  // <link href="url" />
  const hrefMatch = /<link[^>]+href=["']([^"']+)["']/i.exec(block);
  if (hrefMatch) return hrefMatch[1];
  return linkTag;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

// ── Channel-specific AI prompts ────────────────────────────────────────────
const CHANNEL_PROMPTS: Record<string, string> = {
  "copy-paste-ai": `Sei un esperto di prompt engineering senior per Proof Press. Il tuo stile è quello di un practitioner che ha testato centinaia di prompt in contesti aziendali reali. Trasforma queste notizie/risorse AI in PROMPT pronti all'uso, spiegati con profondità e concretezza.

Per ogni item genera un contenuto con:
- title: titolo del prompt che comunica il beneficio concreto (es. "Prompt per scrivere email di vendita B2B che convertono")
- subtitle: breve descrizione del risultato atteso (1 riga precisa)
- body: OBBLIGATORIO 5-8 righe. Spiega il contesto d'uso, perché questo prompt funziona meglio di altri approcci, in quali situazioni specifiche usarlo, quali variabili personalizzare e un esempio di output atteso. Varia l'apertura: a volte inizia con un dato, a volte con un problema concreto, a volte con un caso d'uso reale. MAI iniziare con "L'articolo", "Questo prompt", "Il tool". Scrivi come un esperto che parla a un collega.
- category: una tra "business", "studio", "marketing", "produttività", "creatività"
- promptText: il PROMPT COMPLETO pronto da copiare e incollare (multi-riga, dettagliato, con placeholder [VARIABILE] dove personalizzare)
- actionItem: "Cosa fare ORA" — azione concreta e immediata in 1 riga

REGOLE ASSOLUTE:
- I prompt devono essere PRATICI e IMMEDIATAMENTE USABILI
- Ogni prompt deve funzionare con ChatGPT, Claude, Gemini
- Il body deve avere sostanza: contesto, meccanismo, applicazione, esempio
- VIETATO iniziare il body con "L'articolo", "Questo articolo", "Il pezzo", "La risorsa"
- Scrivi in italiano
- Genera esattamente il numero di item richiesto`,

  "automate-with-ai": `Sei un automation engineer senior che scrive per Proof Press. Il tuo stile è quello di chi ha implementato automazioni in aziende reali e sa distinguere ciò che funziona da ciò che è solo teoria. Trasforma queste notizie/risorse in USE CASE di automazione concreti e replicabili.

Per ogni item genera:
- title: titolo dell'automazione che comunica il risultato (es. "Automatizza il customer support con AI + Zapier: -70% tempi di risposta")
- subtitle: risultato concreto misurabile (es. "Risparmia 3 ore/settimana eliminando task ripetitivi")
- body: OBBLIGATORIO 5-8 righe. Descrivi il problema che risolve, i tool specifici coinvolti, i passaggi chiave dell'implementazione, i prerequisiti tecnici, i risultati attesi con numeri reali quando disponibili, e un avvertimento sulle insidie comuni. Varia l'apertura: a volte inizia con il problema, a volte con il risultato, a volte con un caso aziendale reale. MAI iniziare con "L'articolo", "Questo tool", "La guida".
- category: una tra "workflow", "integrazione", "no-code", "sviluppo", "marketing"
- actionItem: "Cosa fare ORA" — primo passo concreto con tool specifico
- promptText: prompt o configurazione da usare per replicare l'automazione

REGOLE ASSOLUTE:
- Focus su automazioni REALI e REPLICABILI con tool esistenti
- Includi sempre tool specifici (Zapier, n8n, Make, Airtable, ecc.) con versioni/prezzi se rilevanti
- Il body deve avere sostanza: problema, soluzione, implementazione, risultati, rischi
- VIETATO iniziare il body con "L'articolo", "Questo articolo", "Il pezzo", "La guida"
- Scrivi in italiano`,

  "make-money-with-ai": `Sei un imprenditore digitale con 10 anni di esperienza nella monetizzazione AI che scrive per Proof Press. Il tuo stile è quello di chi ha testato queste strategie in prima persona e sa quali funzionano davvero. Trasforma queste notizie in STRATEGIE DI GUADAGNO concrete, con numeri reali e percorsi chiari.

Per ogni item genera:
- title: titolo della strategia con potenziale di guadagno esplicito (es. "AI Copywriting B2B: come costruire un'agenzia da €5.000/mese in 90 giorni")
- subtitle: potenziale di guadagno stimato con timeframe realistico
- body: OBBLIGATORIO 5-8 righe. Spiega la strategia con numeri concreti (tariffe di mercato, tempi di avvio, investimento iniziale), il profilo di chi può farlo, i tool necessari con costi, i rischi reali e come mitigarli, e un caso reale o benchmark di mercato. Varia l'apertura: a volte inizia con un dato di mercato, a volte con un caso concreto, a volte con il problema che risolve per il cliente. MAI iniziare con "L'articolo", "Questa strategia", "Il metodo".
- category: una tra "freelance", "side-hustle", "startup", "investimento", "formazione"
- actionItem: "Cosa fare ORA" — primo passo concreto con tool specifico e timeframe
- promptText: prompt o template per iniziare subito la strategia

REGOLE ASSOLUTE:
- Strategie CONCRETE con numeri realistici (no hype, no promesse impossibili)
- Includi sempre: investimento iniziale, tempo per i primi risultati, potenziale mensile
- Il body deve avere sostanza: mercato, strategia, tool, numeri, rischi
- VIETATO iniziare il body con "L'articolo", "Questo articolo", "Il pezzo", "La strategia"
- Scrivi in italiano`,

  "daily-ai-tools": `Sei un product reviewer senior che testa AI tools ogni giorno per Proof Press. Il tuo stile è quello di chi ha provato centinaia di tool e sa distinguere quelli che cambiano davvero il workflow da quelli che sono solo hype. Trasforma queste notizie in REVIEW DI TOOL AI oneste, dettagliate e immediatamente utili.

Per ogni item genera:
- title: nome del tool + tagline che comunica il beneficio reale (es. "Gamma — Presentazioni professionali in 30 secondi, senza PowerPoint")
- subtitle: il problema specifico che risolve in una riga
- body: OBBLIGATORIO 5-8 righe. Spiega cosa fa il tool con precisione tecnica, i 2-3 punti di forza reali, i limiti concreti (non nasconderli), il modello di pricing con cifre specifiche, il profilo dell'utente ideale, il confronto con l'alternativa principale e quando scegliere questo invece dell'alternativa. Varia l'apertura: a volte inizia con il problema che risolve, a volte con un dato di adozione, a volte con il confronto con lo status quo. MAI iniziare con "L'articolo", "Questo tool", "Il software".
- category: una tra "produttività", "design", "coding", "marketing", "writing", "analytics"
- actionItem: "Cosa fare ORA" — azione specifica per provarlo (es. "Vai su gamma.app, crea account free, testa con questa presentazione")
- externalUrl: URL diretto del tool

REGOLE ASSOLUTE:
- Solo tool REALI, FUNZIONANTI e VERIFICABILI
- Includi sempre il prezzo con cifre (free/freemium €X/mese/paid €Y/mese)
- Il body deve avere sostanza: funzionalità, pro, contro, prezzo, alternativa, profilo ideale
- VIETATO iniziare il body con "L'articolo", "Questo articolo", "Il pezzo", "Il tool"
- Scrivi in italiano`,

  "verified-ai-news": `Sei un giornalista senior con 20 anni di esperienza al Corriere della Sera e al Financial Times, specializzato in AI e tecnologia per Proof Press. Il tuo stile è autorevole, preciso, mai burocratico. Racconti i fatti con contesto e implicazioni, non descrivi le notizie dall'esterno. Trasforma queste notizie in NEWS VERIFICATE, approfondite e immediatamente comprensibili.

Per ogni item genera:
- title: titolo giornalistico diretto, non clickbait, che comunica il fatto principale
- subtitle: "Perché è importante" in una riga con impatto concreto
- body: OBBLIGATORIO 5-8 righe. Struttura: (1) il fatto principale con dati concreti, (2) il contesto che lo rende rilevante ora, (3) chi sono i player coinvolti e i loro interessi, (4) le implicazioni per il mercato italiano/europeo, (5) la prospettiva critica o il rischio che altri non dicono. Varia l'apertura: a volte inizia con il dato più sorprendente, a volte con la domanda che la notizia apre, a volte con il contesto storico che la rende significativa. MAI iniziare con "L'articolo", "Questo articolo", "Il pezzo", "La notizia".
- category: una tra "AI", "startup", "investimenti", "regolamentazione", "ricerca", "prodotto"
- actionItem: "Cosa significa per te" — implicazione pratica concreta per chi legge
- sourceUrl: URL della fonte originale
- sourceName: nome della fonte

REGOLE ASSOLUTE:
- Solo notizie VERIFICATE da fonti affidabili (Reuters, Bloomberg, TechCrunch, Nature, ecc.)
- Spiega PERCHÉ è importante con dati e contesto, non solo COSA è successo
- Il body deve avere sostanza: fatto, contesto, player, implicazioni, prospettiva critica
- VIETATO iniziare il body con "L'articolo", "Questo articolo", "Il pezzo", "La notizia"
- Scrivi in italiano`,

  "ai-opportunities": `Sei un partner di venture capital con 15 anni di esperienza in Silicon Valley e in Europa che scrive per Proof Press. Il tuo stile è quello di chi valuta 50 deal al mese e sa distinguere le opportunità reali dall'hype. Trasforma queste notizie in ANALISI DI OPPORTUNITÀ concrete per investitori, founder e decision maker.

Per ogni item genera:
- title: titolo dell'opportunità con il dato chiave (es. "Anthropic raccoglie $2B a valutazione $18B — 3 implicazioni per il mercato europeo")
- subtitle: tipo di opportunità con orizzonte temporale (es. "Opportunità di investimento — finestra 6-12 mesi")
- body: OBBLIGATORIO 5-8 righe. Struttura: (1) il fatto con i numeri precisi, (2) il contesto di mercato che lo rende rilevante, (3) chi vince e chi perde da questo sviluppo, (4) le opportunità concrete per founder/investitori italiani/europei, (5) i rischi reali e le condizioni che potrebbero cambiare lo scenario. Varia l'apertura: a volte inizia con il dato più rilevante, a volte con la domanda strategica che apre, a volte con il confronto con un precedente storico. MAI iniziare con "L'articolo", "Questo round", "Il deal".
- category: una tra "funding", "trend", "mercato", "partnership", "exit", "regolamentazione"
- actionItem: "Cosa fare ORA" — azione specifica e tempestiva per cogliere l'opportunità

REGOLE ASSOLUTE:
- Focus su OPPORTUNITÀ CONCRETE con dati e numeri verificabili
- Includi sempre: dimensione del mercato, player chiave, finestra temporale, rischi
- Il body deve avere sostanza: fatto, contesto, vincitori/perdenti, opportunità, rischi
- VIETATO iniziare il body con "L'articolo", "Questo articolo", "Il pezzo", "Il deal"
- Scrivi in italiano`,
};

// ── Main ingest function ───────────────────────────────────────────────────
export async function ingestChannelContent(channel: string, maxItems: number = 10): Promise<{ generated: number; errors: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB non disponibile");

  console.log(`[ChannelIngestor] Starting ingest for channel: ${channel}`);

  // 1. Get active RSS sources for this channel
  const sources = await db
    .select()
    .from(rssFeedSources)
    .where(and(eq(rssFeedSources.channel, channel as any), eq(rssFeedSources.active, true)));

  if (sources.length === 0) {
    console.log(`[ChannelIngestor] No active RSS sources for ${channel}`);
    return { generated: 0, errors: 0 };
  }

  // 2. Fetch all RSS feeds
  const allItems: Array<{ title: string; link: string; description: string; sourceName: string; sourceId: number }> = [];
  for (const source of sources) {
    const items = await fetchRssFeed(source.feedUrl);
    for (const item of items) {
      allItems.push({ ...item, sourceName: source.name, sourceId: source.id });
    }
    // Update lastFetchedAt
    await db.update(rssFeedSources)
      .set({ lastFetchedAt: new Date(), errorCount: 0 })
      .where(eq(rssFeedSources.id, source.id));
  }

  if (allItems.length === 0) {
    console.log(`[ChannelIngestor] No RSS items found for ${channel}`);
    return { generated: 0, errors: 0 };
  }

  console.log(`[ChannelIngestor] Found ${allItems.length} RSS items for ${channel}, generating ${maxItems} contents`);

  // 3. Prepare RSS digest for AI
  const digest = allItems.slice(0, 30).map((item, i) =>
    `[${i + 1}] ${item.title}\nFonte: ${item.sourceName}\nLink: ${item.link}\n${item.description ? `Descrizione: ${item.description}` : ""}`
  ).join("\n\n---\n\n");

  // 4. Call AI to generate structured content
  const channelPrompt = CHANNEL_PROMPTS[channel];
  if (!channelPrompt) {
    console.error(`[ChannelIngestor] No prompt template for channel: ${channel}`);
    return { generated: 0, errors: 1 };
  }

  let generated = 0;
  let errors = 0;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const response = await invokeLLMFast({
      messages: [
        { role: "system", content: channelPrompt },
        { role: "user", content: `Ecco le ultime notizie/risorse raccolte oggi. Genera esattamente ${maxItems} contenuti strutturati.\n\n${digest}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "channel_contents",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    body: { type: "string" },
                    category: { type: "string" },
                    actionItem: { type: "string" },
                    promptText: { type: "string" },
                    sourceUrl: { type: "string" },
                    sourceName: { type: "string" },
                    externalUrl: { type: "string" },
                  },
                  required: ["title", "subtitle", "body", "category", "actionItem", "promptText", "sourceUrl", "sourceName", "externalUrl"],
                  additionalProperties: false,
                },
              },
            },
            required: ["items"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty LLM response");

    const parsed = JSON.parse(stripJsonBackticks(content));
    const items = parsed.items || [];

    // 5. Save to DB (con ricerca immagini Pexels)
    // Mapping canale → categoria Pexels per immagini pertinenti
    const CHANNEL_IMAGE_CONTEXT: Record<string, string> = {
      "copy-paste-ai": "AI prompt writing technology",
      "automate-with-ai": "business automation workflow",
      "make-money-with-ai": "entrepreneur business money",
      "daily-ai-tools": "software tools technology",
      "verified-ai-news": "AI technology news",
      "ai-opportunities": "startup investment opportunity",
      "start-here": "learning technology education",
    };

    for (let i = 0; i < items.length && i < maxItems; i++) {
      const item = items[i];
      try {
        // Cerca immagine Pexels per questo contenuto
        let imageUrl: string | null = null;
        try {
          const imgCategory = item.category || CHANNEL_IMAGE_CONTEXT[channel] || "technology";
          imageUrl = await findStockImage(
            item.title || "technology",
            imgCategory,
            CHANNEL_IMAGE_CONTEXT[channel]
          );
        } catch (imgErr: any) {
          console.warn(`[ChannelIngestor] Image search failed for item ${i}: ${imgErr.message}`);
        }

        const [insertedItem] = await db.insert(channelContent).values({
          channel: channel as any,
          title: item.title || "Senza titolo",
          subtitle: item.subtitle || null,
          body: item.body || "",
          category: item.category || null,
          actionItem: item.actionItem || null,
          promptText: item.promptText || null,
          sourceUrl: item.sourceUrl || null,
          sourceName: item.sourceName || null,
          imageUrl: imageUrl,
          externalUrl: item.externalUrl || null,
          publishDate: today,
          position: i,
          status: "published",
        }).$returningId();
        generated++;

        // Certificazione ProofPress Verify — asincrona, non blocca il flusso
        setImmediate(async () => {
          try {
            const ppvResult = await certifyWithPpv({
              title: item.title || "Senza titolo",
              content: item.body || item.subtitle || "",
              sourceUrl: item.sourceUrl || item.externalUrl || null,
              productType: 'news_verify',
            });
            if (ppvResult && insertedItem?.id) {
              await db.update(channelContent).set({
                ppvHash: ppvResult.hash,
                ppvDocumentId: ppvResult.document_id,
                ppvIpfsCid: ppvResult.ipfs_cid,
                ppvIpfsUrl: ppvResult.ipfs_url,
                ppvTrustScore: ppvResult.trust_score,
                ppvTrustGrade: ppvResult.trust_grade,
                ppvCertifiedAt: new Date(),
                ppvReport: ppvResult.report as unknown as Record<string, unknown>,
              }).where(eq(channelContent.id, insertedItem.id));
              console.log(`[ChannelIngestor] ✅ PPV certificato: grade=${ppvResult.trust_grade} | ${(item.title || "").substring(0, 50)}`);
            }
          } catch (ppvErr) {
            console.warn(`[ChannelIngestor] ⚠️ PPV certificazione fallita (non critico):`, ppvErr);
          }
        });
      } catch (err: any) {
        console.error(`[ChannelIngestor] Error saving item ${i}: ${err.message}`);
        errors++;
      }
    }

    // 6. Log ingest — one entry per generated item
    for (const item of allItems.slice(0, generated)) {
      try {
        await db.insert(rssIngestLog).values({
          articleUrl: item.link || `generated-${channel}-${Date.now()}-${Math.random()}`,
          originalTitle: item.title?.slice(0, 500) || null,
          channel: channel,
          status: "processed",
        }).onDuplicateKeyUpdate({ set: { status: "processed" } });
      } catch (_) { /* skip duplicates */ }
    }

  } catch (err: any) {
    console.error(`[ChannelIngestor] LLM error for ${channel}: ${err.message}`);
    // Log error with a unique URL
    try {
      await db.insert(rssIngestLog).values({
        articleUrl: `error-${channel}-${Date.now()}`,
        originalTitle: `Error: ${err.message?.slice(0, 400)}`,
        channel: channel,
        status: "error",
      }).onDuplicateKeyUpdate({ set: { status: "error" } });
    } catch (_) { /* ignore */ }
    errors++;
  }

  console.log(`[ChannelIngestor] Channel ${channel}: generated=${generated}, errors=${errors}`);
  return { generated, errors };
}

// ── Ingest all channels ────────────────────────────────────────────────────
const CHANNEL_LIMITS: Record<string, number> = {
  "copy-paste-ai": 10,
  "automate-with-ai": 5,
  "make-money-with-ai": 5,
  "daily-ai-tools": 3,
  "verified-ai-news": 10,
  "ai-opportunities": 5,
};

export async function ingestAllChannels(): Promise<Record<string, { generated: number; errors: number }>> {
  const results: Record<string, { generated: number; errors: number }> = {};
  const channels = Object.keys(CHANNEL_LIMITS);

  for (const channel of channels) {
    try {
      results[channel] = await ingestChannelContent(channel, CHANNEL_LIMITS[channel]);
    } catch (err: any) {
      console.error(`[ChannelIngestor] Fatal error for ${channel}: ${err.message}`);
      results[channel] = { generated: 0, errors: 1 };
    }
    // Small delay between channels to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

// ── Seed RSS sources ───────────────────────────────────────────────────────
export async function seedRssSources(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB non disponibile");

  const SEED_SOURCES: Array<{ channel: string; name: string; feedUrl: string }> = [
    // ═══ COPY & PASTE AI ═══
    { channel: "copy-paste-ai", name: "Reddit ChatGPT", feedUrl: "https://www.reddit.com/r/ChatGPT/.rss" },
    { channel: "copy-paste-ai", name: "Reddit PromptEngineering", feedUrl: "https://www.reddit.com/r/PromptEngineering/.rss" },
    { channel: "copy-paste-ai", name: "Reddit OpenAI", feedUrl: "https://www.reddit.com/r/OpenAI/.rss" },
    { channel: "copy-paste-ai", name: "Hacker News", feedUrl: "https://hnrss.org/newest?q=AI+prompt" },
    { channel: "copy-paste-ai", name: "Product Hunt AI", feedUrl: "https://www.producthunt.com/feed" },
    // Nuove fonti Copy & Paste AI
    { channel: "copy-paste-ai", name: "Prompting Guide", feedUrl: "https://www.promptingguide.ai/rss.xml" },
    { channel: "copy-paste-ai", name: "Learn Prompting", feedUrl: "https://learnprompting.org/rss.xml" },
    { channel: "copy-paste-ai", name: "MarkTechPost", feedUrl: "https://www.marktechpost.com/feed/" },

    // ═══ AUTOMATE WITH AI ═══
    { channel: "automate-with-ai", name: "Zapier Blog", feedUrl: "https://zapier.com/blog/feed/" },
    { channel: "automate-with-ai", name: "Towards Data Science", feedUrl: "https://towardsdatascience.com/feed" },
    { channel: "automate-with-ai", name: "Analytics Vidhya", feedUrl: "https://www.analyticsvidhya.com/feed/" },
    { channel: "automate-with-ai", name: "KDnuggets", feedUrl: "https://www.kdnuggets.com/feed" },
    // Nuove fonti Automate with AI
    { channel: "automate-with-ai", name: "n8n Workflows", feedUrl: "https://n8n.io/workflows/rss.xml" },
    { channel: "automate-with-ai", name: "Make.com", feedUrl: "https://www.make.com/en/rss.xml" },
    { channel: "automate-with-ai", name: "Activepieces", feedUrl: "https://www.activepieces.com/blog/rss.xml" },
    { channel: "automate-with-ai", name: "Relay.app", feedUrl: "https://blog.relay.app/rss" },
    { channel: "automate-with-ai", name: "HuggingFace Blog", feedUrl: "https://huggingface.co/blog/feed.xml" },
    { channel: "automate-with-ai", name: "OpenAI Blog", feedUrl: "https://openai.com/blog/rss.xml" },
    { channel: "automate-with-ai", name: "Anthropic News", feedUrl: "https://www.anthropic.com/news/rss.xml" },
    // Fonti ibride RSS+AI
    { channel: "automate-with-ai", name: "RSS.app Blog", feedUrl: "https://rss.app/blog/rss.xml" },

    // ═══ MAKE MONEY WITH AI ═══
    { channel: "make-money-with-ai", name: "TechCrunch Startups", feedUrl: "https://techcrunch.com/category/startups/feed/" },
    { channel: "make-money-with-ai", name: "Product Hunt", feedUrl: "https://www.producthunt.com/feed" },
    { channel: "make-money-with-ai", name: "Indie Hackers", feedUrl: "https://feeds.transistor.fm/the-indie-hackers-podcast" },
    // Nuove fonti Make Money with AI
    { channel: "make-money-with-ai", name: "Indie Hackers Feed", feedUrl: "https://www.indiehackers.com/feed" },
    { channel: "make-money-with-ai", name: "Ben's Bites", feedUrl: "https://www.bensbites.co/rss.xml" },
    { channel: "make-money-with-ai", name: "The Rundown AI", feedUrl: "https://www.therundown.ai/rss.xml" },
    { channel: "make-money-with-ai", name: "FutureTools", feedUrl: "https://futuretools.io/rss" },

    // ═══ DAILY AI TOOLS ═══
    { channel: "daily-ai-tools", name: "Product Hunt", feedUrl: "https://www.producthunt.com/feed" },
    { channel: "daily-ai-tools", name: "Ben's Bites", feedUrl: "https://bensbites.beehiiv.com/feed" },
    { channel: "daily-ai-tools", name: "AI Weekly", feedUrl: "https://aiweekly.co/issues.rss" },
    // Nuove fonti Daily AI Tools
    { channel: "daily-ai-tools", name: "Futurepedia", feedUrl: "https://www.futurepedia.io/rss" },
    { channel: "daily-ai-tools", name: "Toolify.ai", feedUrl: "https://www.toolify.ai/rss" },
    { channel: "daily-ai-tools", name: "There's An AI For That", feedUrl: "https://theresanaiforthat.com/rss" },
    { channel: "daily-ai-tools", name: "AITools.fyi", feedUrl: "https://aitools.fyi/rss.xml" },

    // ═══ VERIFIED AI NEWS ═══
    { channel: "verified-ai-news", name: "OpenAI News", feedUrl: "https://openai.com/news/rss.xml" },
    { channel: "verified-ai-news", name: "Google AI Blog", feedUrl: "https://ai.googleblog.com/feeds/posts/default" },
    { channel: "verified-ai-news", name: "Hugging Face Blog", feedUrl: "https://huggingface.co/blog/feed.xml" },
    { channel: "verified-ai-news", name: "MIT Technology Review AI", feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed/" },
    { channel: "verified-ai-news", name: "VentureBeat AI", feedUrl: "https://venturebeat.com/category/ai/feed/" },
    { channel: "verified-ai-news", name: "The Verge AI", feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
    { channel: "verified-ai-news", name: "arXiv AI", feedUrl: "https://rss.arxiv.org/rss/cs.AI" },
    // Nuove fonti Verified AI News
    { channel: "verified-ai-news", name: "Wired AI", feedUrl: "https://www.wired.com/feed/category/artificial-intelligence/latest/rss" },
    { channel: "verified-ai-news", name: "MIT Technology Review", feedUrl: "https://www.technologyreview.com/feed/" },
    { channel: "verified-ai-news", name: "NVIDIA Blog", feedUrl: "https://blogs.nvidia.com/feed/" },

    // ═══ AI OPPORTUNITIES ═══
    { channel: "ai-opportunities", name: "TechCrunch", feedUrl: "https://techcrunch.com/feed/" },
    { channel: "ai-opportunities", name: "VentureBeat", feedUrl: "https://venturebeat.com/feed/" },
    { channel: "ai-opportunities", name: "EU-Startups", feedUrl: "https://www.eu-startups.com/feed/" },
    { channel: "ai-opportunities", name: "Sifted", feedUrl: "https://sifted.eu/feed" },
    { channel: "ai-opportunities", name: "Y Combinator Blog", feedUrl: "https://www.ycombinator.com/blog/rss/" },
    // Nuove fonti AI Opportunities
    { channel: "ai-opportunities", name: "TechCrunch AI", feedUrl: "https://techcrunch.com/tag/artificial-intelligence/feed/" },
    { channel: "ai-opportunities", name: "Crunchbase Blog", feedUrl: "https://www.crunchbase.com/blog/feed/" },
  ];

  let seeded = 0;
  for (const source of SEED_SOURCES) {
    try {
      // Check if already exists
      const existing = await db.select().from(rssFeedSources)
        .where(and(
          eq(rssFeedSources.channel, source.channel as any),
          eq(rssFeedSources.feedUrl, source.feedUrl),
        ))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(rssFeedSources).values({
          channel: source.channel as any,
          name: source.name,
          feedUrl: source.feedUrl,
        });
        seeded++;
      }
    } catch (err: any) {
      console.error(`[ChannelIngestor] Error seeding ${source.name}: ${err.message}`);
    }
  }

  console.log(`[ChannelIngestor] Seeded ${seeded} RSS sources`);
  return seeded;
}
