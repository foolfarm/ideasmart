/**
 * Script per pubblicare manualmente il post LinkedIn di oggi
 * Uso: npx tsx scripts/triggerLinkedIn.ts [morning|afternoon]
 */
import { publishLinkedInPost, type LinkedInSlot } from "../server/linkedinPublisher";

const slotArg = process.argv[2] as LinkedInSlot | undefined;
const slot: LinkedInSlot = slotArg === "afternoon" ? "afternoon" : "morning";

console.log(`\n[ManualPublish] ═══════════════════════════════════════`);
console.log(`[ManualPublish] Pubblicazione manuale LinkedIn`);
console.log(`[ManualPublish] Slot: ${slot === "morning" ? "MATTINO (10:30)" : "POMERIGGIO (15:00)"}`);
console.log(`[ManualPublish] Force: true (bypass idempotenza)`);
console.log(`[ManualPublish] Data: ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}`);
console.log(`[ManualPublish] ═══════════════════════════════════════\n`);

const result = await publishLinkedInPost(slot, true);

console.log(`\n[ManualPublish] ═══════════════════════════════════════`);
console.log(`[ManualPublish] RISULTATO:`);
console.log(`[ManualPublish]   Pubblicati: ${result.published}`);
console.log(`[ManualPublish]   Errori: ${result.errors.length}`);
if (result.errors.length > 0) {
  result.errors.forEach(e => console.error(`[ManualPublish]   ❌ ${e}`));
}
if (result.posts.length > 0) {
  result.posts.forEach(p => {
    console.log(`[ManualPublish]   Post: ${p.section} — "${p.title.slice(0, 60)}"`);
    console.log(`[ManualPublish]   Successo: ${p.success ? "✅" : "❌"}`);
    if (p.postId) console.log(`[ManualPublish]   Post ID: ${p.postId}`);
    if (p.error) console.error(`[ManualPublish]   Errore: ${p.error}`);
  });
}
console.log(`[ManualPublish] ═══════════════════════════════════════\n`);

if (result.published > 0) {
  console.log("[ManualPublish] ✅ Post pubblicato con successo su LinkedIn!");
} else {
  console.error("[ManualPublish] ❌ Pubblicazione fallita");
  process.exit(1);
}
