/**
 * Script di recupero: invia la newsletter BUONGIORNO del 15 maggio 2026
 * ai subscriber che NON l'hanno ricevuta (invio parziale interrotto).
 * 
 * Il record del 15 maggio è stato corretto a 'failed' nel DB,
 * quindi sendMorningNewsletterToAll() permetterà un nuovo invio.
 */
import { sendMorningNewsletterToAll } from "../server/unifiedNewsletter";

async function main() {
  console.log("🔄 Avvio invio newsletter di recupero BUONGIORNO del 15 maggio 2026...");
  console.log("📋 Target: iscritti attivi che non hanno ricevuto la newsletter di ieri");
  
  try {
    const result = await sendMorningNewsletterToAll();
    
    if (result.success) {
      console.log(`✅ Newsletter di recupero inviata con successo!`);
      console.log(`   Destinatari: ${result.recipientCount}`);
      console.log(`   Oggetto: ${result.subject}`);
    } else {
      console.error(`❌ Errore invio recupero: ${result.error}`);
    }
  } catch (err) {
    console.error("❌ Errore critico:", err);
    process.exit(1);
  }
}

main().then(() => {
  console.log("✅ Script completato");
  process.exit(0);
}).catch(err => {
  console.error("❌ Script fallito:", err);
  process.exit(1);
});
