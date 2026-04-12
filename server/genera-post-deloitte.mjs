import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
dotenv.config();

const ANDREA_CINELLI_STYLE = `Scrivi con uno stile "Andrea Cinelli": autorevole, data-driven e orientato all'execution, pensato per interlocutori C-level e board. Parti sempre da evidenze concrete (numeri, trend, ricerche affidabili) e costruisci una tesi chiara e difendibile, evitando opinioni non supportate. Usa frasi brevi, linguaggio semplice ma preciso, con un registro executive: ogni parola deve creare valore. Trasforma i dati in insight strategici evidenziando implicazioni di business, rischi e opportunità, e collegandoli a modelli operativi e leve di crescita. Integra esempi reali, use case e riferimenti a mercato o industry per rendere il contenuto immediatamente applicabile. Mantieni un tono da builder e decision maker, non da consulente teorico: orienta sempre verso azione, impatto e scalabilità. Chiudi con un takeaway netto che sintetizzi la direzione da prendere. Obiettivo: guidare decisioni, non solo informare. IMPORTANTE: non usare mai asterischi, underscore o simboli Markdown. Niente grassetto con **. Scrivi testo pulito come se fosse pubblicato su LinkedIn direttamente.`;

const REPORT_SUMMARY = `
Deloitte Tech Trends 2026 — 17ª edizione. Titolo: "Da sperimentazione a impatto".

DATI CHIAVE:
- ChatGPT: 800 milioni di utenti settimanali (10% della popolazione mondiale)
- Solo l'11% delle organizzazioni ha agenti AI in produzione (38% in fase pilota, 35% senza strategia)
- Gartner: il 40% dei progetti agentic fallirà entro il 2027 — non per limiti tecnologici, ma perché automatizzano processi rotti invece di ridisegnarli
- I costi di inferenza AI sono crollati di 280 volte in 2 anni, ma le bollette mensili di alcune enterprise raggiungono decine di milioni di dollari
- Solo l'1% dei CIO non ha cambiamenti al modello operativo in corso
- Il 64% delle organizzazioni sta aumentando gli investimenti AI
- Le startup AI scalano da $1M a $30M di revenue 5 volte più velocemente delle SaaS
- Amazon: 1 milione di robot deployati, DeepFleet AI migliora l'efficienza del 10%
- BMW: auto che si guidano da sole nelle fabbriche
- Proiezione: 2 milioni di robot umanoidi nei luoghi di lavoro entro il 2035
- Investimento AI: 93% su tecnologia, solo 7% su persone

5 TREND IDENTIFICATI:
1. AI goes physical — convergenza AI + robotica (robot adattativi, veicoli autonomi, droni)
2. The agentic reality check — workforce silicon-based, solo 11% in produzione
3. The AI infrastructure reckoning — hybrid cloud/on-premise/edge per gestire i costi
4. The great rebuild — ricostruzione delle organizzazioni tech come AI-native
5. The AI dilemma — AI come arma e scudo nella cybersecurity

CITAZIONI CHIAVE:
- HPE CFO: "Volevamo selezionare un processo end-to-end da trasformare davvero, non solo risolvere un singolo pain point"
- Broadcom CIO: "Senza focalizzarsi su un problema di business specifico, è facile investire in AI senza ritorno"
- Western Digital CIO: "Preferiamo fallire velocemente su piccoli pilot che perdere l'onda"
- Coca-Cola CIO: da "Cosa possiamo fare?" a "Cosa dovremmo fare?" — questo è il vero shift
`;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const response = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 1500,
  system: ANDREA_CINELLI_STYLE,
  messages: [
    {
      role: "user",
      content: `Scrivi un post LinkedIn di commento al Deloitte Tech Trends 2026 basandoti sui seguenti dati del report:

${REPORT_SUMMARY}

ISTRUZIONI SPECIFICHE:
- Massimo 2800 caratteri
- Inizia con un dato o fatto concreto che colpisce, non con "Deloitte ha pubblicato..."
- Costruisci una tesi originale e difendibile, non un riassunto del report
- Aggiungi la tua lettura critica: cosa significa davvero per le aziende italiane ed europee
- Usa paragrafi brevi, niente elenchi puntati con trattini o asterischi
- Chiudi con una direzione netta e un invito alla riflessione
- Ultima riga: "Leggi l'analisi completa su ProofPress → https://proofpress.ai"
- Niente hashtag, niente asterischi, niente simboli Markdown
- Tono: builder che ha vissuto queste trasformazioni in prima persona, non analista che commenta dall'esterno`,
    },
  ],
});

const postText = response.content[0].type === "text" ? response.content[0].text : "";

// Sanitizza asterischi e Markdown residui
const cleanPost = postText
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\*([^*]+)\*/g, "$1")
  .replace(/__([^_]+)__/g, "$1")
  .replace(/_([^_]+)_/g, "$1")
  .replace(/#{1,6}\s/g, "")
  .replace(/`([^`]+)`/g, "$1");

console.log("\n=== POST LINKEDIN — DELOITTE TECH TRENDS 2026 ===\n");
console.log(cleanPost);
console.log("\n=== CARATTERI:", cleanPost.length, "===\n");
