/**
 * Script per forzare l'invio massivo della newsletter approvata
 * ai top 1.000 iscritti più recenti, bypassando il warmup limit.
 * Usa la stessa logica di personalizzazione di sendUnifiedNewsletterToAll.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { subscribers } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { buildUnifiedNewsletter } from "../server/unifiedNewsletter";
import { updateNewsletterSendRecipientCount } from "../server/db";
import { sendEmail } from "../server/email";
import { notifyOwner } from "../server/_core/notification";
import { schedulePostSendReport } from "../server/newsletterPostSendReport";

const BASE_URL = "https://proofpress.ai";
const DB_URL = process.env.DATABASE_URL!;
const conn = await mysql.createConnection(DB_URL);
const db = drizzle(conn);

// 1. Recupera i top 1.000 iscritti più recenti
console.log("[ForceTop1000] Recupero top 1.000 iscritti più recenti...");
const top1000 = await db
  .select()
  .from(subscribers)
  .where(eq(subscribers.status, "active"))
  .orderBy(desc(subscribers.subscribedAt))
  .limit(1000);

console.log(`[ForceTop1000] ${top1000.length} iscritti selezionati`);

// 2. Costruisci la newsletter
console.log("[ForceTop1000] Costruzione HTML newsletter...");
const { html: baseHtml, subject, stats } = await buildUnifiedNewsletter(false);
console.log(`[ForceTop1000] Soggetto: ${subject}`);
console.log(`[ForceTop1000] Stats:`, JSON.stringify(stats));

// 3. Invia in batch da 50 con delay 2s tra batch
const BATCH_SIZE = 50;
const DELAY_MS = 2000;
let sent = 0;
let errors = 0;

for (let i = 0; i < top1000.length; i += BATCH_SIZE) {
  const batch = top1000.slice(i, i + BATCH_SIZE);
  const promises = batch.map(async (sub) => {
    const unsubUrl = sub.unsubscribeToken
      ? `${BASE_URL}/unsubscribe?token=${sub.unsubscribeToken}`
      : `${BASE_URL}/unsubscribe`;
    const prefsUrl = sub.unsubscribeToken
      ? `${BASE_URL}/preferenze-newsletter?token=${sub.unsubscribeToken}`
      : `${BASE_URL}/preferenze-newsletter`;
    
    const personalizedHtml = baseHtml
      .replace(`${BASE_URL}/unsubscribe`, unsubUrl)
      .replace(`${BASE_URL}/preferenze-newsletter`, prefsUrl);

    const result = await sendEmail({
      sender: 'daily' as const,
      to: sub.email,
      subject,
      html: personalizedHtml,
      listUnsubscribeUrl: unsubUrl,
    });
    return result.success;
  });

  const results = await Promise.allSettled(promises);
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) sent++;
    else errors++;
  }

  const progress = Math.min(i + BATCH_SIZE, top1000.length);
  console.log(`[ForceTop1000] Progresso: ${progress}/${top1000.length} — inviati: ${sent}, errori: ${errors}`);

  if (i + BATCH_SIZE < top1000.length) {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }
}

// 4. Aggiorna il conteggio nel DB
await updateNewsletterSendRecipientCount(subject, sent);

// 5. Notifica owner
await notifyOwner({
  title: `📧 Proof Press Daily inviata (Top 1000) — ${new Date().toLocaleDateString("it-IT")}`,
  content: `Newsletter inviata ai 1.000 iscritti più recenti.\nInviati: ${sent}/${top1000.length} | Errori: ${errors}\n\nContenuti: ${(stats as any).ai ?? 0} AI + ${(stats as any).startup ?? 0} Startup + ${(stats as any).dealroom ?? 0} Dealroom + ${(stats as any).breaking ?? 0} Breaking + ${(stats as any).research ?? 0} Ricerche.`,
});

// 6. Schedula report post-invio a +1h
schedulePostSendReport({
  subject,
  recipientCount: sent,
  sendDate: new Date(),
  delayMs: 60 * 60 * 1000,
});

console.log(`[ForceTop1000] ✅ Completato: ${sent} inviati, ${errors} errori su ${top1000.length} destinatari`);
await conn.end();
process.exit(0);
