/**
 * Script one-shot: rigenera l'editoriale del giorno con Claude/stile Andrea Cinelli
 * e pubblica un post LinkedIn dedicato all'editoriale.
 *
 * Uso: npx tsx server/rigenera-editoriale.ts
 */
import "dotenv/config";
import { generateDailyEditorial } from "./dailyContentScheduler";
import { saveEditorial } from "./db";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { linkedinPosts } from "../drizzle/schema";

async function postEditorialeLinkedIn(editorial: {
  title: string;
  subtitle?: string | null;
  body: string;
  keyTrend?: string | null;
  authorNote?: string | null;
}) {
  const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
  const LINKEDIN_AUTHOR_URN = process.env.LINKEDIN_AUTHOR_URN;

  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_AUTHOR_URN) {
    console.error("[LinkedIn] Credenziali non configurate — skip pubblicazione");
    return null;
  }

  // Genera il testo del post LinkedIn a partire dall'editoriale
  const prompt = `Sei Andrea Cinelli, direttore editoriale di ProofPress Magazine.
Hai scritto questo editoriale:

TITOLO: ${editorial.title}
SOTTOTITOLO: ${editorial.subtitle ?? ""}
BODY: ${editorial.body.slice(0, 1200)}
NOTA FINALE: ${editorial.authorNote ?? ""}

Scrivi un post LinkedIn di massimo 1800 caratteri che:
1. Apra con una frase-hook potente (dato, domanda retorica o affermazione provocatoria)
2. Sintetizzi i 2-3 insight chiave dell'editoriale in forma di lista o paragrafi brevi
3. Concluda con una riflessione netta, senza etichette come "Takeaway" o "In sintesi"
4. Termini SEMPRE con: "Leggi l'analisi completa su Proof Press → https://proofpress.ai"
5. Aggiunga 4-5 hashtag rilevanti in fondo

Stile: autorevole, data-driven, frasi brevi, registro executive. Tono da builder, non da consulente.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Sei Andrea Cinelli. Scrivi post LinkedIn in italiano, stile executive e data-driven. Rispondi solo con il testo del post, senza prefissi o spiegazioni." },
      { role: "user", content: prompt },
    ],
  });

  const postText = response.choices?.[0]?.message?.content ?? "";
  if (!postText) {
    console.error("[LinkedIn] Testo post vuoto — skip");
    return null;
  }

  console.log("\n📝 TESTO POST LINKEDIN EDITORIALE:\n");
  console.log(postText);
  console.log("\n" + "─".repeat(60));

  // Pubblica su LinkedIn
  const body = {
    author: LINKEDIN_AUTHOR_URN,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: postText },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[LinkedIn] Errore pubblicazione:", err);
    return null;
  }

  const data = await res.json() as { id?: string };
  const postId = data.id ?? "";
  const linkedinUrl = postId
    ? `https://www.linkedin.com/feed/update/${postId}/`
    : null;

  console.log("[LinkedIn] ✅ Post editoriale pubblicato:", linkedinUrl);

  // Salva nel DB
  const db = await getDb();
  if (!db) { console.error("[DB] Connessione non disponibile"); return linkedinUrl; }
  const postTextStr = typeof postText === "string" ? postText : "";
  await db.insert(linkedinPosts).values({
    slot: "morning" as const,
    section: "ai" as const,
    dateLabel: new Date().toISOString().slice(0, 10),
    postText: postTextStr,
    linkedinUrl,
    title: editorial.title,
    hashtags: postTextStr.match(/#\w+/g)?.join(" ") ?? null,
    imageUrl: null,
  });

  return linkedinUrl;
}

async function main() {
  console.log("🔄 Rigenerazione editoriale del giorno con Claude/stile Andrea Cinelli...\n");

  // 1. Genera l'editoriale
  const editorial = await generateDailyEditorial();
  console.log("✅ Editoriale generato:");
  console.log("   Titolo:", editorial.title);
  console.log("   Sottotitolo:", editorial.subtitle);
  console.log("   Key Trend:", editorial.keyTrend);
  console.log("   Body (preview):", editorial.body.slice(0, 200) + "...");

  // 2. Salva nel DB (sovrascrive quello di oggi)
  await saveEditorial(editorial);
  console.log("\n✅ Editoriale salvato nel DB\n");

  // 3. Pubblica su LinkedIn
  console.log("📤 Pubblicazione su LinkedIn...");
  const linkedinUrl = await postEditorialeLinkedIn(editorial);

  if (linkedinUrl) {
    console.log("\n🎉 COMPLETATO!");
    console.log("   Editoriale: visibile nella Home di ProofPress");
    console.log("   LinkedIn:", linkedinUrl);
  } else {
    console.log("\n⚠️  Editoriale salvato ma LinkedIn non pubblicato (controlla le credenziali)");
  }

  process.exit(0);
}

main().catch(e => {
  console.error("❌ Errore:", e);
  process.exit(1);
});
