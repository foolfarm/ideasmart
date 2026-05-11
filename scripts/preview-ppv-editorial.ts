/**
 * Script per generare una preview dell'articolo editoriale PPV
 * Genera il testo senza pubblicarlo sul DB né su LinkedIn
 */
import { invokeLLM } from "../server/_core/llm";
import { getTodayPpvPage } from "./ppvEditorialScheduler-helper";

// Replica il calendario PPV direttamente qui per evitare dipendenze circolari
const PPV_CALENDAR = [
  {
    date: "2026-05-11",
    url: "https://proofpressverify.com/",
    product: "ProofPress Verify™",
    context: `ProofPress Verify™ è un protocollo di certificazione crittografica che assegna a ogni contenuto digitale (email, notizie, documenti, prodotti, curriculum) un numero PP univoco ancorato su IPFS tramite hash SHA-256. Il sistema analizza ogni claim fattuale con 4 motori AI, incrocia oltre 4.000 fonti globali e assegna un Trust Score da 0 a 100 con grade A–F. Attualmente conta 669 certificati live. Dati chiave: il 59% delle persone non distingue notizie vere da false; meno dell'1% dei documenti ha una verifica di integrità; zero standard esistono per autenticare un'email. Il servizio è gratuito per iniziare. URL: https://proofpressverify.com/`,
  },
  {
    date: "2026-05-12",
    url: "https://proofpressverify.com/news",
    product: "News Verify",
    context: `News Verify è il prodotto di ProofPress Verify™ dedicato all'editoria. Certifica ogni articolo claim per claim con badge trust grade A–F visibile ai lettori e prova IPFS immutabile. Pensato per redazioni, freelance e brand media che vogliono differenziarsi con informazioni verificabili. Il badge è embeddabile su sito e newsletter. URL: https://proofpressverify.com/news`,
  },
  {
    date: "2026-05-13",
    url: "https://proofpressverify.com/info",
    product: "Info Verify",
    context: `Info Verify è il prodotto di ProofPress Verify™ per comunicati stampa, report ESG e documenti IR. Fornisce prova crittografica che il documento non è stato alterato dopo la certificazione. Rivolto a PR & Comms, Compliance e Investor Relations. URL: https://proofpressverify.com/info`,
  },
  {
    date: "2026-05-14",
    url: "https://proofpressverify.com/email",
    product: "Email Verify",
    context: `Email Verify è il prodotto di ProofPress Verify™ per certificare newsletter e comunicazioni finanziarie via BCC. Zero integrazione tecnica: funziona con qualsiasi client email. Pensato per newsletter, comunicazioni finanziarie e regolatorio. URL: https://proofpressverify.com/email`,
  },
  {
    date: "2026-05-15",
    url: "https://proofpressverify.com/cv-verify",
    product: "CV Verify",
    context: `CV Verify è il prodotto di ProofPress Verify™ per certificare il curriculum con hash SHA-256 e notarizzazione IPFS. Il numero PP-XXXXXXXX è la prova di autenticità verso recruiter e HR. Pensato per candidati, recruiter, HR e profili LinkedIn. URL: https://proofpressverify.com/cv-verify`,
  },
];

(async () => {
  // Trova la pagina di oggi
  const tz = "Europe/Rome";
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: tz });
  const page = PPV_CALENDAR.find(p => p.date === today);

  if (!page) {
    console.log(`[Preview] Nessuna pagina PPV programmata per oggi (${today})`);
    console.log("[Preview] Uso ProofPress Verify™ come fallback per la preview...");
    // Usa il primo come fallback per la preview
  }

  const p = page ?? PPV_CALENDAR[0];

  console.log(`\n[Preview] Generazione articolo editoriale per: ${p.product}\n`);

  const prompt = `Sei Andrea Cinelli: imprenditore seriale con 30+ anni di esperienza nel digitale, co-fondatore di Libero.it, pioniere mobile in Vodafone e Telecom Italia, fondatore di 12+ venture AI, membro Advisory Board Deloitte, professore di AI al Sole 24 Ore Business School. Scrivi un articolo giornalistico autorevole e oggettivo su ${p.product} (${p.url}).

CONTESTO DEL SERVIZIO:
${p.context}

ISTRUZIONI STILE:
- Tono: autorevole, data-driven, orientato all'execution — per interlocutori C-level
- Inizia citando direttamente il tema con un dato o un'evidenza concreta, mai con "Ho analizzato..."
- Frasi brevi, linguaggio semplice ma preciso
- Analisi oggettiva da esperto: benefici reali, casi d'uso concreti, implicazioni di business
- Non è uno spoiler né una pubblicità: è una recensione tecnica e strategica
- Includi: contesto di mercato, come funziona il servizio, a chi serve, vantaggi competitivi, limitazioni oneste
- Chiudi con un takeaway strategico netto per chi deve decidere se adottarlo
- Massimo 2500 caratteri
- NO asterischi per formattazione
- Scrivi come un essere umano, non come un'AI

Rispondi con un JSON con questi campi:
{
  "title": "titolo dell'articolo (max 100 caratteri)",
  "summary": "testo completo dell'articolo (max 2500 caratteri)",
  "category": "categoria (es: AI TOOLS, TECNOLOGIA, INNOVAZIONE)"
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Sei un giornalista esperto di tecnologia e AI. Rispondi SOLO con JSON valido, senza markdown." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ppv_article",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            category: { type: "string" }
          },
          required: ["title", "summary", "category"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Risposta LLM vuota");

  let rawContent = typeof content === "string" ? content : JSON.stringify(content);
  rawContent = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const article = JSON.parse(rawContent);

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("PREVIEW ARTICOLO EDITORIALE — LINKEDIN");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`\nTITOLO: ${article.title}`);
  console.log(`CATEGORIA: ${article.category}`);
  console.log(`PRODOTTO: ${p.product}`);
  console.log(`URL: ${p.url}`);
  console.log("\n───────────────────────────────────────────────────────────────");
  console.log("TESTO ARTICOLO:");
  console.log("───────────────────────────────────────────────────────────────\n");
  console.log(article.summary);
  console.log("\n───────────────────────────────────────────────────────────────");
  console.log(`\nLeggi l'analisi completa su Proof Press → https://proofpress.ai`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Salva anche su file per riferimento
  const fs = await import("fs");
  const output = {
    generatedAt: new Date().toISOString(),
    product: p.product,
    url: p.url,
    title: article.title,
    category: article.category,
    summary: article.summary,
    linkedinPost: `${article.title}\n\n${article.summary}\n\nLeggi l'analisi completa su Proof Press → https://proofpress.ai`
  };
  fs.writeFileSync("/tmp/ppv-editorial-preview.json", JSON.stringify(output, null, 2));
  console.log("[Preview] Salvato in /tmp/ppv-editorial-preview.json");

  process.exit(0);
})().catch(err => {
  console.error("[Preview] Errore:", err);
  process.exit(1);
});
