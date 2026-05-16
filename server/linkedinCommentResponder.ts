/**
 * LinkedIn Comment Auto-Responder
 *
 * Ogni 2 ore esegue il polling dei commenti sui post LinkedIn recenti
 * (ultimi 7 giorni) e risponde automaticamente con un testo generato dall'AI.
 *
 * Flusso:
 *  1. Recupera i post LinkedIn recenti dal DB (ultimi 7 giorni)
 *  2. Per ogni post, chiama l'API LinkedIn per ottenere i commenti
 *  3. Filtra i commenti già risposti (tabella linkedin_comment_replies)
 *  4. Per ogni nuovo commento, genera una risposta con LLM
 *  5. Pubblica la risposta su LinkedIn via API
 *  6. Salva la risposta nel DB per evitare duplicati
 *
 * Limitazioni LinkedIn API:
 *  - L'endpoint commenti richiede scope w_member_social
 *  - Polling ogni 2 ore per rispettare i rate limit
 *  - Massimo 5 risposte per ciclo per evitare spam
 */

import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { linkedinCommentReplies, linkedinPosts } from "../drizzle/schema";
import { eq, gte, desc, and } from "drizzle-orm";

const LINKEDIN_API = "https://api.linkedin.com";
const AUTHOR_URN = ENV.linkedinAuthorUrn; // urn:li:person:T2CjsXZQ59
const MAX_REPLIES_PER_CYCLE = 5;

// ─── Fetch commenti di un post LinkedIn ──────────────────────────────────────
async function fetchPostComments(postUrn: string, token: string): Promise<Array<{
  commentUrn: string;
  commenterName: string;
  commenterUrn: string;
  text: string;
  createdAt: number;
}>> {
  try {
    // Encode URN per l'URL
    const encodedUrn = encodeURIComponent(postUrn);
    const url = `${LINKEDIN_API}/v2/socialActions/${encodedUrn}/comments?count=20&sortBy=RELEVANCE`;
    
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "LinkedIn-Version": "202501",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[CommentResponder] Fetch commenti ${postUrn}: HTTP ${res.status} — ${errText.slice(0, 200)}`);
      return [];
    }

    const data = await res.json() as any;
    const elements = data.elements || [];

    return elements
      .filter((el: any) => {
        // Escludi commenti dell'autore stesso (non rispondere ai propri commenti)
        const commenterUrn = el.actor || el.commenter || "";
        return !commenterUrn.includes("T2CjsXZQ59") && !commenterUrn.includes(AUTHOR_URN);
      })
      .map((el: any) => ({
        commentUrn: el.$URN || el.id || "",
        commenterName: el.actor?.localizedName || el.commenter?.localizedName || "Utente LinkedIn",
        commenterUrn: el.actor || el.commenter || "",
        text: el.message?.text || el.text?.text || "",
        createdAt: el.created?.time || Date.now(),
      }))
      .filter((c: any) => c.commentUrn && c.text.length > 0);
  } catch (err) {
    console.error(`[CommentResponder] Errore fetch commenti ${postUrn}:`, err);
    return [];
  }
}

// ─── Genera risposta AI al commento ──────────────────────────────────────────
async function generateReply(
  commenterName: string,
  commentText: string,
  postText: string,
): Promise<string> {
  const systemPrompt = `Sei Andrea Cinelli, imprenditore seriale, fondatore di FoolFarm e ProofPress.AI, 
professore di AI al Sole 24 Ore Business School. Rispondi ai commenti LinkedIn in modo autentico, 
diretto e umano. Tono: autorevole ma accessibile, mai robotico. 

Regole:
- Massimo 3-4 frasi
- Ringrazia brevemente se il commento è positivo, senza essere eccessivo
- Se il commento pone una domanda, rispondi in modo sostanziale ma conciso
- Se il commento è critico, rispondi con apertura e argomentazione
- Non usare asterischi o formattazione markdown
- Non iniziare con "Grazie per il tuo commento" — sii più originale
- Scrivi come un essere umano, non come un'AI
- Puoi citare proofpress.ai se pertinente, ma non in modo forzato`;

  const userPrompt = `Il mio post LinkedIn diceva:
"${postText.slice(0, 500)}"

${commenterName} ha commentato:
"${commentText}"

Scrivi una risposta breve e autentica.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const rawContent = response.choices?.[0]?.message?.content;
    const reply = typeof rawContent === "string" ? rawContent : "";
    // Rimuovi asterischi e formattazione
    return reply.replace(/\*+/g, "").replace(/#{1,6}\s/g, "").trim();
  } catch (err) {
    console.error("[CommentResponder] Errore generazione risposta AI:", err);
    return "";
  }
}

// ─── Pubblica risposta su LinkedIn ───────────────────────────────────────────
async function publishReply(
  postUrn: string,
  replyText: string,
  token: string,
): Promise<string | null> {
  try {
    const encodedUrn = encodeURIComponent(postUrn);
    const url = `${LINKEDIN_API}/v2/socialActions/${encodedUrn}/comments`;
    
    const body = {
      actor: AUTHOR_URN,
      message: {
        text: replyText,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202501",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[CommentResponder] Errore pubblicazione risposta: HTTP ${res.status} — ${errText.slice(0, 300)}`);
      return null;
    }

    // LinkedIn restituisce l'URN della risposta nell'header X-RestLi-Id
    const replyUrn = res.headers.get("x-restli-id") || res.headers.get("X-RestLi-Id") || "";
    console.log(`[CommentResponder] ✅ Risposta pubblicata: ${replyUrn}`);
    return replyUrn;
  } catch (err) {
    console.error("[CommentResponder] Errore pubblicazione risposta:", err);
    return null;
  }
}

// ─── Ciclo principale di polling e risposta ──────────────────────────────────
export async function runCommentResponderCycle(): Promise<{
  processed: number;
  replied: number;
  skipped: number;
  errors: number;
}> {
  const stats = { processed: 0, replied: 0, skipped: 0, errors: 0 };
  
  const token = ENV.linkedinAccessToken;
  if (!token) {
    console.warn("[CommentResponder] LINKEDIN_ACCESS_TOKEN non configurato — skip");
    return stats;
  }

  const db = await getDb();
  if (!db) {
    console.warn("[CommentResponder] DB non disponibile — skip");
    return stats;
  }

  // Recupera post LinkedIn degli ultimi 7 giorni con linkedinUrl
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoLabel = sevenDaysAgo.toISOString().slice(0, 10);

  const recentPosts = await db
    .select({
      id: linkedinPosts.id,
      postText: linkedinPosts.postText,
      linkedinUrl: linkedinPosts.linkedinUrl,
      dateLabel: linkedinPosts.dateLabel,
    })
    .from(linkedinPosts)
    .where(gte(linkedinPosts.dateLabel, sevenDaysAgoLabel))
    .orderBy(desc(linkedinPosts.createdAt))
    .limit(20);

  console.log(`[CommentResponder] Analisi ${recentPosts.length} post recenti...`);

  // Estrai URN del post dall'URL LinkedIn
  // URL formato: https://www.linkedin.com/posts/andreacinelli_xxx-activity-7461356234227548160-xxxx
  function extractActivityUrn(url: string | null): string | null {
    if (!url) return null;
    const match = url.match(/activity-(\d+)/);
    if (!match) return null;
    return `urn:li:activity:${match[1]}`;
  }

  let repliesThisCycle = 0;

  for (const post of recentPosts) {
    if (repliesThisCycle >= MAX_REPLIES_PER_CYCLE) {
      console.log(`[CommentResponder] Limite ${MAX_REPLIES_PER_CYCLE} risposte per ciclo raggiunto — stop`);
      break;
    }

    const postUrn = extractActivityUrn(post.linkedinUrl);
    if (!postUrn) {
      console.log(`[CommentResponder] Post ${post.id}: nessun URN estraibile da URL — skip`);
      continue;
    }

    // Fetch commenti del post
    const comments = await fetchPostComments(postUrn, token);
    console.log(`[CommentResponder] Post ${post.id} (${postUrn}): ${comments.length} commenti trovati`);

    for (const comment of comments) {
      if (repliesThisCycle >= MAX_REPLIES_PER_CYCLE) break;
      stats.processed++;

      // Verifica se abbiamo già risposto a questo commento
      const existing = await db
        .select({ id: linkedinCommentReplies.id, status: linkedinCommentReplies.status })
        .from(linkedinCommentReplies)
        .where(eq(linkedinCommentReplies.commentUrn, comment.commentUrn))
        .limit(1);

      if (existing.length > 0) {
        stats.skipped++;
        continue;
      }

      // Salva il commento come "pending" per tracciarlo
      await db.insert(linkedinCommentReplies).values({
        commentUrn: comment.commentUrn,
        postUrn,
        commenterName: comment.commenterName,
        commentText: comment.text,
        status: "pending",
      }).onDuplicateKeyUpdate({ set: { status: "pending" } });

      // Genera risposta AI
      const replyText = await generateReply(
        comment.commenterName,
        comment.text,
        post.postText,
      );

      if (!replyText) {
        await db.update(linkedinCommentReplies)
          .set({ status: "error" })
          .where(eq(linkedinCommentReplies.commentUrn, comment.commentUrn));
        stats.errors++;
        continue;
      }

      // Pubblica risposta su LinkedIn
      const replyUrn = await publishReply(postUrn, replyText, token);

      if (replyUrn) {
        await db.update(linkedinCommentReplies)
          .set({
            replyText,
            replyUrn,
            status: "replied",
            repliedAt: new Date(),
          })
          .where(eq(linkedinCommentReplies.commentUrn, comment.commentUrn));
        stats.replied++;
        repliesThisCycle++;
        console.log(`[CommentResponder] ✅ Risposto a ${comment.commenterName}: "${replyText.slice(0, 80)}..."`);
      } else {
        await db.update(linkedinCommentReplies)
          .set({ replyText, status: "error" })
          .where(eq(linkedinCommentReplies.commentUrn, comment.commentUrn));
        stats.errors++;
      }

      // Pausa tra risposte per rispettare rate limit
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`[CommentResponder] Ciclo completato: ${stats.processed} processati, ${stats.replied} risposti, ${stats.skipped} saltati, ${stats.errors} errori`);
  return stats;
}

// ─── Stats per la dashboard Admin ────────────────────────────────────────────
export async function getCommentResponderStats(): Promise<{
  totalProcessed: number;
  totalReplied: number;
  totalSkipped: number;
  totalErrors: number;
  recentReplies: Array<{
    commenterName: string;
    commentText: string;
    replyText: string;
    repliedAt: Date | null;
    status: string;
  }>;
}> {
  const db = await getDb();
  if (!db) return { totalProcessed: 0, totalReplied: 0, totalSkipped: 0, totalErrors: 0, recentReplies: [] };

  const all = await db
    .select()
    .from(linkedinCommentReplies)
    .orderBy(desc(linkedinCommentReplies.createdAt))
    .limit(100);

  const recentReplies = await db
    .select({
      commenterName: linkedinCommentReplies.commenterName,
      commentText: linkedinCommentReplies.commentText,
      replyText: linkedinCommentReplies.replyText,
      repliedAt: linkedinCommentReplies.repliedAt,
      status: linkedinCommentReplies.status,
    })
    .from(linkedinCommentReplies)
    .orderBy(desc(linkedinCommentReplies.createdAt))
    .limit(10);

  return {
    totalProcessed: all.length,
    totalReplied: all.filter((r: typeof all[0]) => r.status === "replied").length,
    totalSkipped: all.filter((r: typeof all[0]) => r.status === "skipped").length,
    totalErrors: all.filter((r: typeof all[0]) => r.status === "error").length,
    recentReplies: recentReplies.map((r: typeof recentReplies[0]) => ({
      commenterName: r.commenterName || "Sconosciuto",
      commentText: r.commentText || "",
      replyText: r.replyText || "",
      repliedAt: r.repliedAt,
      status: r.status,
    })),
  };
}
