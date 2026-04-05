/**
 * Script per pubblicare un post LinkedIn personalizzato
 * Tema: Alibaba Qwen3.6-Plus - nuovo record open source per AI agenti
 */
import { config } from "dotenv";
config();

const token = process.env.LINKEDIN_ACCESS_TOKEN;
const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

if (!token || !authorUrn) {
  console.error("❌ LINKEDIN_ACCESS_TOKEN o LINKEDIN_AUTHOR_URN non configurati");
  process.exit(1);
}

const postText = `Alibaba ha appena cambiato le regole del gioco nell'AI open source.

Qwen3.6-Plus è uscito il 2 aprile 2026 e i numeri parlano chiaro:

→ 61.6 su Terminal-Bench (battendo Claude Opus)
→ 57.1 su SWE-Bench (risoluzione bug su codebase reali)
→ Finestra di contesto da 1 milione di token
→ Record su STEM reasoning, multilingual e long-context extraction

Ma la cosa più interessante non è il benchmark.

È la direzione: Qwen3.6-Plus non è un modello "assistivo". È progettato per agire.

Integra ragionamento, memoria ed esecuzione in un unico sistema. Può gestire task complessi su repository reali, pianificare su orizzonti lunghi, usare tool in modo autonomo.

In pratica: è un agente, non un copilot.

Alibaba lo ha reso disponibile via API con una feature nuova — preserve_thinking — che mantiene il contesto di ragionamento tra i turni. Risultato: meno token consumati, più coerenza nelle decisioni multi-step.

Il punto che mi colpisce di più?

Mentre OpenAI e Anthropic costruiscono modelli chiusi a prezzi premium, Alibaba rilascia capacità equivalenti (o superiori in certi task) con accesso API aperto.

La competizione nell'AI non è più solo tra USA e USA.

E chi costruisce prodotti su questi modelli ha oggi accesso a potenza computazionale che 12 mesi fa era riservata a pochi.

La finestra per costruire qualcosa di rilevante con l'AI è aperta. Ma non per sempre.

👉 Segui IDEASMART per restare aggiornato su AI, startup e tech: https://ideasmart.ai

#AI #OpenSource #Qwen #Alibaba #AgenticAI #LLM #Startup #Tech #Innovazione`;

async function publishPost() {
  console.log("[LinkedIn] 📝 Pubblicazione post Qwen3.6-Plus...");
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
}

publishPost().catch(console.error);
