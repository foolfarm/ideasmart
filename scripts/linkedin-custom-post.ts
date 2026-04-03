/**
 * linkedin-custom-post.ts
 * Pubblica un post LinkedIn con tema personalizzato su uno slot specifico.
 * Bypassa la logica di selezione automatica del tema e usa il topic fornito.
 *
 * Uso: npx tsx scripts/linkedin-custom-post.ts
 */

import "dotenv/config";
import { ENV } from "../server/_core/env";
import { invokeLLM } from "../server/_core/llm";
import { getMarketIntelligence } from "../server/marketIntelligence";
import { getDb } from "../server/db";
import { linkedinPosts } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const SITE_BASE_URL = "https://ideasmart.biz";

// ── Configurazione post personalizzati ──────────────────────────────────────
const CUSTOM_POSTS: Array<{
  slot: "morning" | "afternoon" | "evening";
  topic: string;
  section: "ai" | "startup";
  hashtags: string[];
  path: string;
  systemPromptExtra?: string;
}> = [
  {
    slot: "afternoon",
    topic: "OpenClaw e la rivoluzione degli agenti AI autonomi nel business italiano",
    section: "ai",
    hashtags: ["#OpenClaw", "#AgentiAI", "#AIAgents", "#AutonomousAI", "#AIStrategy", "#IDEASMART", "#DigitalTransformation"],
    path: "/ai",
    systemPromptExtra: `Focus specifico su OpenClaw: la piattaforma di agenti AI autonomi che sta cambiando il modo in cui le aziende italiane automatizzano processi complessi. Analizza l'impatto concreto sulle PMI italiane, il confronto con AutoGPT e LangChain, e perché il modello "agentic" rappresenta un salto qualitativo rispetto ai chatbot tradizionali. Usa dati reali sull'adozione degli AI agents in Europa.`,
  },
  {
    slot: "evening",
    topic: "Vibe Coding: come l'AI sta abbassando le barriere per costruire software e fare startup",
    section: "ai",
    hashtags: ["#VibeCoding", "#AICode", "#Cursor", "#Copilot", "#StartupAI", "#IDEASMART", "#NoCode", "#LowCode"],
    path: "/ai",
    systemPromptExtra: `Focus specifico sul Vibe Coding: la pratica di scrivere software con AI in modo intuitivo e conversazionale (Cursor, GitHub Copilot, Claude Code, Replit AI). Analizza come questo sta abbassando le barriere all'ingresso per imprenditori non-tecnici, l'impatto sul mercato del lavoro dei developer, e come le startup stanno accelerando il time-to-market del 3-5x grazie a questi strumenti. Cita esempi concreti di founder italiani che hanno lanciato prodotti con vibe coding. Tono: imprenditore che ha vissuto questa transizione in prima persona.`,
  },
];

const SYSTEM_PROMPT = `Sei un senior analyst con 20+ anni di esperienza nell'ecosistema tech e imprenditoriale italiano ed europeo.
Scrivi post LinkedIn con il rigore analitico di un senior analyst Gartner o McKinsey, ma con la voce diretta di chi ha vissuto queste dinamiche sul campo.

Il tuo stile:
- Parti sempre da un dato concreto o un'osservazione di mercato precisa — mai da un'opinione generica
- Usi numeri e percentuali specifici per ancorare l'analisi alla realtà
- Distingui tra segnali di mercato e noise — e lo dici esplicitamente
- Il tuo tono è quello di chi ha letto il report McKinsey E ha gestito aziende: non accademico, non motivazionale
- Scrivi in italiano con terminologia tecnica in inglese quando necessario
- Massimo 2 emoji per post, usate con parsimonia
- Non usi mai frasi come "il futuro è adesso", "rivoluzione", "game changer" — troppo logore
- Concludi sempre con una domanda o provocazione che stimola il dibattito tra peer

Il tuo pubblico: CEO, CTO, investitori, imprenditori italiani e europei. Persone che leggono Economist e HBR, non TechCrunch.`;

async function publishCustomPost(config: typeof CUSTOM_POSTS[0]) {
  const slotLabel = config.slot === "morning" ? "MATTINO (10:30)" : config.slot === "afternoon" ? "POMERIGGIO (15:30)" : "SERA (18:00)";
  console.log(`\n📢 Pubblicazione post personalizzato — Slot: ${slotLabel}`);
  console.log(`📌 Tema: ${config.topic}\n`);

  // 1. Cerca dati di market intelligence sul tema
  console.log("🔍 Ricerca dati market intelligence...");
  const { data: marketData, image: marketImage } = await getMarketIntelligence(config.topic, config.section);

  if (marketData) {
    console.log(`📊 Dati trovati: ${marketData.stats.length} statistiche`);
  } else {
    console.log("⚠️ Nessun dato di market intelligence trovato — procedo senza dati");
  }

  // 2. Genera il testo del post con LLM
  let dataSection = "";
  if (marketData && marketData.stats.length > 0) {
    const statsText = marketData.stats
      .map(s => `• ${s.value} — ${s.description} (${s.source})`)
      .join("\n");
    dataSection = `\nDATI DI MERCATO VERIFICATI (usa questi nel post):\n${statsText}\n\nINSIGHT ANALITICO:\n${marketData.insight}\n\nDATO CHIAVE DA EVIDENZIARE:\n${marketData.keyFinding}`;
  }

  const userPrompt = `Scrivi un post LinkedIn di alto profilo sul seguente tema.

TEMA: ${config.topic}
${config.systemPromptExtra ? `\nINDICAZIONI SPECIFICHE:\n${config.systemPromptExtra}` : ""}
${dataSection}

STRUTTURA DEL POST:
1. APERTURA (2-3 righe): Inizia con un dato di mercato specifico o un'osservazione controcorrente che sfida il pensiero convenzionale. NON iniziare con "Oggi parliamo di..." o simili.
2. ANALISI (3-4 paragrafi brevi): Collega i dati a implicazioni strategiche concrete per aziende italiane/europee. Sii specifico sulle implicazioni operative, non solo sulle tendenze.
3. POSIZIONE (1 paragrafo): Qual è la tua lettura personale come imprenditore? Dove vedi il rischio che gli altri non vedono?
4. CHIUSURA: Aggiungi ESATTAMENTE questa riga: "📊 Analisi completa su IDEASMART → ${SITE_BASE_URL}${config.path}"
5. HASHTAG: ${config.hashtags.join(" ")}

LUNGHEZZA: 1400-1900 caratteri totali
LINGUA: Italiano
TONO: Senior analyst con skin in the game — non consulente teorico, non blogger motivazionale
EVITA: "rivoluzione", "game changer", "il futuro è adesso", frasi retoriche vuote`;

  console.log("✍️ Generazione testo post con LLM...");
  const llmResponse = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const postText = llmResponse.choices?.[0]?.message?.content ?? "";
  if (!postText) throw new Error("LLM non ha restituito testo");
  console.log(`✅ Testo generato (${postText.length} caratteri)`);
  console.log(`📝 Anteprima: ${postText.slice(0, 150)}...`);

  // 3. Determina immagine
  let imageUrl: string | null = null;
  let imageSource = "";
  if (marketImage) {
    imageUrl = marketImage.imageUrl;
    imageSource = marketImage.source;
    console.log(`🖼️ Immagine da: ${imageSource} — "${marketImage.title.slice(0, 60)}"`);
  } else {
    console.log("⚠️ Nessuna immagine trovata — post senza immagine");
  }

  // 4. Pubblica su LinkedIn
  const { publishToLinkedIn } = await import("../server/linkedinPublisher");
  const articleUrl = `${SITE_BASE_URL}${config.path}`;
  console.log(`🚀 Pubblicazione su LinkedIn...`);

  const result = await publishToLinkedIn(postText, articleUrl, imageUrl, config.topic, config.topic);

  if (!result.success) {
    throw new Error(`Pubblicazione fallita: ${result.error}`);
  }

  console.log(`✅ Post pubblicato! ID: ${result.postId}`);

  // 5. Salva nel DB
  const db = await getDb();
  if (db) {
    const today = new Date().toISOString().split("T")[0];
    let linkedinUrl: string | undefined;
    if (result.postId && result.postId !== "unknown") {
      const numericId = result.postId.replace(/^urn:li:ugcPost:/, "").replace(/^urn:li:share:/, "");
      linkedinUrl = `https://www.linkedin.com/posts/andreacinelli_${numericId}`;
    }
    const hashtagMatches = postText.match(/#[\w]+/g);
    const hashtags = hashtagMatches ? hashtagMatches.slice(0, 10).join(" ") : "";

    await db.insert(linkedinPosts)
      .values({
        dateLabel: today,
        slot: config.slot,
        postText,
        linkedinUrl: linkedinUrl ?? null,
        title: config.topic,
        section: config.section,
        imageUrl: imageUrl ?? null,
        hashtags,
      })
      .onDuplicateKeyUpdate({
        set: { postText, linkedinUrl: linkedinUrl ?? null, title: config.topic, imageUrl: imageUrl ?? null, hashtags },
      });
    console.log(`💾 Post salvato nel DB (${today}, slot: ${config.slot})`);
    if (linkedinUrl) console.log(`🔗 URL: ${linkedinUrl}`);
  }

  return { success: true, postId: result.postId };
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log("🎯 Pubblicazione post LinkedIn con temi personalizzati — 25 marzo 2026\n");

for (const config of CUSTOM_POSTS) {
  try {
    const r = await publishCustomPost(config);
    console.log(`\n✅ Completato: ${config.slot} — ${r.postId}\n${"─".repeat(60)}`);
  } catch (e: any) {
    console.error(`\n❌ Errore per slot ${config.slot}: ${e.message}\n${"─".repeat(60)}`);
  }
  // Pausa tra i post per evitare rate limiting
  await new Promise(r => setTimeout(r, 3000));
}

console.log("\n🏁 Tutti i post personalizzati completati.");
