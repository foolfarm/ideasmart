/**
 * Script manuale per pubblicare il Punto del Giorno (slot morning 10:00)
 * su LinkedIn quando il post automatico non è uscito.
 * Uso: npx tsx scripts/publishMorningPost.ts
 */
import { config } from "dotenv";
config({ path: ".env" });

import { publishLinkedInPost } from "../server/linkedinPublisher";

async function main() {
  console.log("🚀 Pubblicazione manuale Punto del Giorno (slot morning)...");
  console.log(`📅 Data: ${new Date().toLocaleDateString("it-IT", { timeZone: "Europe/Rome", weekday: "long", year: "numeric", month: "long", day: "numeric" })}`);
  console.log("");

  try {
    const result = await publishLinkedInPost("morning", true); // force=true bypassa il controllo idempotenza
    
    console.log("\n📊 RISULTATO:");
    console.log(`✅ Post pubblicati: ${result.published}`);
    console.log(`❌ Errori: ${result.errors.length}`);
    
    if (result.posts.length > 0) {
      console.log("\n📝 Dettaglio post:");
      result.posts.forEach(p => {
        const status = p.success ? "✅" : "❌";
        console.log(`  ${status} [${p.section}] ${p.title}`);
        if (p.postId) console.log(`     LinkedIn ID: ${p.postId}`);
        if (p.error) console.log(`     Errore: ${p.error}`);
      });
    }
    
    if (result.errors.length > 0) {
      console.log("\n⚠️ Errori:");
      result.errors.forEach(e => console.log(`  - ${e}`));
    }
    
  } catch (err) {
    console.error("❌ Errore fatale:", err);
    process.exit(1);
  }
}

main().then(() => {
  console.log("\n✅ Script completato.");
  process.exit(0);
}).catch(err => {
  console.error("❌ Errore:", err);
  process.exit(1);
});
