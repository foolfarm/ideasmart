/**
 * Script per pubblicare un post LinkedIn personalizzato
 * Tema: Gartner - Le aziende abbandoneranno l'AI assistiva entro 2028
 */
import { config } from "dotenv";
config();

const token = process.env.LINKEDIN_ACCESS_TOKEN;
const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

if (!token || !authorUrn) {
  console.error("❌ LINKEDIN_ACCESS_TOKEN o LINKEDIN_AUTHOR_URN non configurati");
  process.exit(1);
}

const postText = `Il Copilot è già obsoleto.

Gartner lo ha detto chiaramente il 2 aprile 2026: entro il 2028, oltre la metà delle aziende smetterà di pagare per l'AI assistiva — copilot, smart advisor, suggeritori intelligenti — e passerà a piattaforme che eseguono workflow in autonomia.

Non è un'evoluzione. È una rottura.

Il modello che stiamo lasciando: l'AI ti suggerisce, tu decidi e fai.
Il modello che arriva: l'AI ha autorità delegata per agire direttamente sui sistemi aziendali, dentro i limiti di policy e identità che tu hai definito.

Il ruolo umano non sparisce. Cambia: da esecutore a supervisore di agenti.

Gartner chiama questa figura "Agent Steward". Chi non si adatta rischia di diventare un collo di bottiglia nel proprio stesso processo.

La previsione più brutale? Entro il 2030, i software vendor che si limitano a "aggiungere AI" sopra applicazioni legacy subiranno una compressione dei margini fino all'80%.

Quello che conta non è avere AI. È controllare il contesto aziendale — identità, permessi, sistemi di record — e trasformarlo in execution authority.

Chi possiede il contesto, possiede il flusso di lavoro.

Siamo ancora in tempo per posizionarci dalla parte giusta di questo cambiamento. Ma la finestra si sta chiudendo.

👉 Leggi l'analisi completa su IDEASMART: https://ideasmart.ai

#AI #AgenticAI #Gartner #FutureOfWork #DigitalTransformation #AIStrategy #Imprenditoria`;

async function publishPost() {
  console.log("[LinkedIn] 📝 Pubblicazione post Gartner AI agenti...");
  console.log(`[LinkedIn] Lunghezza testo: ${postText.length} caratteri`);

  const body = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: postText },
        shareMediaCategory: "NONE"
      }
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify(body)
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(`❌ Errore LinkedIn API: ${response.status} ${response.statusText}`);
    console.error(responseText);
    process.exit(1);
  }

  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    result = { id: responseText };
  }

  console.log(`✅ Post pubblicato con successo!`);
  console.log(`📌 Post ID: ${result.id || result}`);
  console.log(`🔗 Vai su LinkedIn per visualizzarlo: https://www.linkedin.com/in/`);
}

publishPost().catch(console.error);
