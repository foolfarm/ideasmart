import { publishLinkedInPost } from "./server/linkedinPublisher";
import { getDbInstance } from "./server/db";
import { linkedinPosts } from "./drizzle/schema";

const POST_TEXT = `Il World Economic Forum ha pubblicato un blueprint che vale la pena leggere con attenzione.

"Blueprint to Action: China's Path to AI-Powered Industry Transformation" non è un documento di geopolitica. È una mappa operativa su come si costruisce un vantaggio competitivo sistemico attraverso l'AI.

Tre dati che non si possono ignorare:

L'industria AI cinese supera i 70 miliardi di dollari di valore, con oltre 4.300 aziende attive nell'ecosistema. Nel 2025, il settore core AI ha superato 1.200 miliardi di yuan (circa 174 miliardi di dollari). Nelle fabbriche cinesi operano oggi 1,7 milioni di robot industriali — il record mondiale.

Ma il dato più rilevante non è la scala. È il metodo.

La Cina ha costruito una strategia AI in tre strati sovrapposti: infrastruttura (reti 5G, data center green, computing distribuito), governance adattiva (regolamenti che abilitano invece di bloccare, come le Interim Measures for Generative AI del 2023), e applicazione verticale per settore (manifatturiero, sanità, energia, trasporti, retail).

Il risultato: digital twin nelle fabbriche, manutenzione predittiva, diagnostica AI in sanità, gestione intelligente delle energie rinnovabili. Non sperimentazioni. Deployment a scala industriale.

Tre lezioni per chi guida aziende in Europa:

Prima. L'AI non si adotta per funzione. Si integra per filiera. La Cina ha capito che il vantaggio non viene dall'automazione di un processo, ma dalla trasformazione dell'intero ecosistema produttivo.

Seconda. La governance è un acceleratore, non un freno. Regole chiare e adattive riducono il rischio percepito e aumentano la velocità di deployment. L'Europa ha ancora molto da imparare su questo punto.

Terza. Il gap non è tecnologico. È di execution. Le tecnologie esistono. Mancano la visione sistemica, la capacità di orchestrazione e la velocità decisionale.

La domanda da portare in board non è "stiamo usando l'AI?". È "stiamo costruendo un vantaggio competitivo che duri nel tempo?"

Leggi l'analisi completa su Proof Press → https://proofpress.ai

#AI #IndustrialAI #DigitalTransformation #Manufacturing #WEF #ArtificialIntelligence #Innovation #Strategy`;

const IMAGE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/china_ai_robot_factory_2cefab97.jpg";
const TITLE = "WEF: China's Path to AI-Powered Industry Transformation";
const TODAY = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });

async function main() {
  console.log("=== Inserimento post WEF nel DB ===");
  const db = await getDbInstance();
  if (!db) { console.error("DB non disponibile"); process.exit(1); }

  const crypto = await import('crypto');
  const postHash = crypto.createHash('sha256').update(POST_TEXT).digest('hex');

  // Inserisci nel DB con slot 'research' (pomeriggio)
  await db.insert(linkedinPosts)
    .values({
      dateLabel: TODAY,
      slot: "research" as any,
      postText: POST_TEXT,
      title: TITLE,
      section: "ai" as any,
      imageUrl: IMAGE_URL,
      hashtags: "#AI #IndustrialAI #WEF #DigitalTransformation",
      postHash,
      linkedinUrl: null,
    })
    .onDuplicateKeyUpdate({
      set: {
        postText: POST_TEXT,
        title: TITLE,
        imageUrl: IMAGE_URL,
        postHash,
      }
    });

  console.log(`✅ Post inserito nel DB per ${TODAY} slot=research`);

  // Ora pubblica su LinkedIn
  console.log("\n=== Pubblicazione su LinkedIn ===");
  const result = await publishLinkedInPost("research" as any, true);
  console.log("Risultato:", JSON.stringify(result, null, 2));

  process.exit(0);
}

main().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
