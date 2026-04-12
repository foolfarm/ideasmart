/**
 * Script di test: genera un post LinkedIn e un editoriale
 * usando Claude con lo stile Andrea Cinelli.
 * Eseguire con: npx tsx server/test-claude-style.ts
 */

import "dotenv/config";
import { invokeLLM } from "./_core/llm";

const RESEARCH_CONTEXT = `
Stanford HAI — AI Index Report 2025 (pubblicato aprile 2025):
- Il 78% delle aziende Fortune 500 ha integrato almeno un sistema AI in produzione nel 2024 (era 55% nel 2022).
- Il costo di addestramento di un modello frontier è sceso del 99,7% in 5 anni: GPT-3 costava $4,6M nel 2020, un modello equivalente oggi costa meno di $14.000.
- Il 40% dei CEO dichiara che l'AI ha già sostituito almeno una funzione aziendale intera (non solo task).
- Il gap di produttività tra aziende AI-native e aziende tradizionali è cresciuto del 34% YoY.
- L'Europa investe 3x meno degli USA in AI enterprise: $8,3B vs $25,2B nel 2024.
- I settori con maggiore penetrazione AI: financial services (89%), healthcare (71%), manufacturing (68%).
- Il 62% dei CHRO prevede di ridurre il personale amministrativo del 20-30% entro il 2026.
`;

async function main() {
  console.log("=".repeat(60));
  console.log("TEST CLAUDE — Stile Andrea Cinelli");
  console.log("=".repeat(60));

  // ── POST LINKEDIN ─────────────────────────────────────────────
  console.log("\n📌 GENERAZIONE POST LINKEDIN...\n");

  const linkedinResult = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Sei Andrea Cinelli, imprenditore seriale, fondatore di FoolFarm e autore di ricerche su AI e innovazione.
Scrivi un post LinkedIn professionale basato sui dati della ricerca fornita.
Il post deve:
- Iniziare con un dato sorprendente o una domanda provocatoria (NON con "Oggi" o "Ho letto")
- Avere 3-4 paragrafi brevi con insight strategici
- Includere almeno 3 dati numerici concreti dalla ricerca
- Chiudersi con un takeaway netto per il board
- Terminare con: "Leggi l'analisi completa su Proof Press → https://proofpress.ai"
- Aggiungere 5-7 hashtag rilevanti (#AI #Innovation #Strategy #Leadership ecc.)
- Non superare i 2800 caratteri totali
- Usare emoji con parsimonia (max 3-4, solo dove aggiungono valore)`,
      },
      {
        role: "user",
        content: `Scrivi un post LinkedIn sulla seguente ricerca:\n\n${RESEARCH_CONTEXT}`,
      },
    ],
  });

  const linkedinPost = linkedinResult.choices[0].message.content as string;
  console.log("─".repeat(60));
  console.log("POST LINKEDIN:");
  console.log("─".repeat(60));
  console.log(linkedinPost);
  console.log("─".repeat(60));
  console.log(`Lunghezza: ${linkedinPost.length} caratteri | Modello: ${linkedinResult.model}`);

  // ── EDITORIALE HOME ───────────────────────────────────────────
  console.log("\n\n📰 GENERAZIONE EDITORIALE HOME PAGE...\n");

  const editorialResult = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Sei Andrea Cinelli, autore dell'editoriale quotidiano di Proof Press Magazine.
Scrivi un editoriale per la home page del magazine basato sui dati della ricerca fornita.
Il pezzo deve:
- Avere un titolo editoriale forte e diretto (max 12 parole)
- Un sottotitolo descrittivo (max 20 parole)
- Un corpo di 4-5 paragrafi: apertura con dato-shock, analisi strategica, implicazioni per le aziende italiane/europee, rischi e opportunità, conclusione con direzione chiara
- Tono: editoriale autorevole, non accademico — come un op-ed del Financial Times
- Lunghezza totale: 600-800 parole
- Includere almeno 4 dati numerici dalla ricerca
- Chiudersi con una "Linea di fondo" in grassetto: una frase sola che sintetizza la tesi`,
      },
      {
        role: "user",
        content: `Scrivi l'editoriale basato su questa ricerca:\n\n${RESEARCH_CONTEXT}`,
      },
    ],
  });

  const editorial = editorialResult.choices[0].message.content as string;
  console.log("─".repeat(60));
  console.log("EDITORIALE HOME PAGE:");
  console.log("─".repeat(60));
  console.log(editorial);
  console.log("─".repeat(60));
  console.log(`Lunghezza: ${editorial.length} caratteri | Modello: ${editorialResult.model}`);
}

main().catch(console.error);
