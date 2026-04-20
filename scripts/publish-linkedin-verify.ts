/**
 * Pubblica il post su LinkedIn su ProofPress Verify con immagine e link all'articolo.
 */
import "dotenv/config";
import { publishToLinkedIn } from "../server/linkedinPublisher";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { linkedinPosts } from "../drizzle/schema";

const IMAGE_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/99304667/tUFLFYeiOtDRjVdv.jpg";
const ARTICLE_URL = "https://proofpress.ai";

const postText = `Quando l'informazione diventa verificabile per legge matematica.

C'è un problema strutturale nel giornalismo digitale: non sappiamo se quello che leggiamo è stato verificato, quando è stato scritto, e se il contenuto è stato modificato dopo la pubblicazione.

ProofPress Verify affronta questo problema con un'infrastruttura crittografica, non con un badge editoriale.

Quattro passaggi automatici, meno di 15 secondi per articolo.

Ogni contenuto riceve un'impronta digitale SHA-256 immutabile. Un modello AI estrae le affermazioni verificabili. Ogni claim viene confrontata con fonti indipendenti, pesate per credibilità e indipendenza. Il risultato è un Trust Score da A a F, ancorato su IPFS: un identificatore pubblico e permanente che chiunque può verificare, per sempre.

Costo: meno di un centesimo per articolo.

La differenza con lo standard C2PA di Adobe è concettuale, non tecnica. Il C2PA certifica la provenienza del file — chi lo ha creato e con quale strumento. ProofPress Verify certifica se quello che è scritto regge al confronto con la realtà documentata. Sono domande diverse. Entrambe necessarie.

Il giornalismo ha sempre verificato prima di pubblicare. Questo sistema verifica dopo, in modo continuo, con prova crittografica pubblica. Quando la fiducia diventa misurabile, diventa monetizzabile.

È lo stesso salto che HTTPS ha fatto per la sicurezza del web.

Leggi l'analisi completa su Proof Press → https://proofpress.ai

#ProofPress #Giornalismo #AI #TrustLayer #MediaTech #Innovazione #FactChecking #ContentAuthenticity #C2PA #IPFS`;

console.log("[LinkedIn] 🚀 Pubblicazione post ProofPress Verify...");

const result = await publishToLinkedIn(
  postText,
  ARTICLE_URL,
  IMAGE_URL,
  "Quando l'informazione diventa verificabile per legge matematica",
  "ProofPress Verify: il protocollo che trasforma la fiducia nel giornalismo digitale da opinione a dato crittografico"
);

if (result.success) {
  const linkedinUrl = result.postId?.startsWith('urn:li:')
    ? `https://www.linkedin.com/feed/update/${result.postId}/`
    : `https://www.linkedin.com/feed/update/urn:li:ugcPost:${result.postId}/`;

  console.log("[LinkedIn] ✅ Post pubblicato con successo!");
  console.log("[LinkedIn] 🔗 URL:", linkedinUrl);

  // Salva nel DB
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(conn);
    await db.insert(linkedinPosts).values({
      slot: "morning",
      section: "news",
      dateLabel: new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" }),
      title: "Quando l'informazione diventa verificabile per legge matematica",
      postText,
      imageUrl: IMAGE_URL,
      linkedinUrl,
      published: true,
    });
    await conn.end();
    console.log("[LinkedIn] 💾 Post salvato nel DB");
  } catch (e) {
    console.warn("[LinkedIn] ⚠️ Errore salvataggio DB:", e);
  }
} else {
  console.error("[LinkedIn] ❌ Errore:", result.error);
  process.exit(1);
}

process.exit(0);
