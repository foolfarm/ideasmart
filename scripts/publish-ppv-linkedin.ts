/**
 * Script per pubblicare manualmente l'articolo editoriale PPV su LinkedIn
 * Usa la funzione publishToLinkedIn già esistente nel progetto
 */
import { publishToLinkedIn } from "../server/linkedinPublisher";
import { getDb } from "../server/db";
import { linkedinPosts } from "../drizzle/schema";

const ARTICLE_TITLE = "ProofPress Verify: certificazione crittografica per contenuti digitali verificabili";
const ARTICLE_SUMMARY = `Il 59% delle persone non distingue notizie vere da false. Meno dell'1% dei documenti digitali ha una verifica di integrità. Zero standard esistono per autenticare un'email. Questi tre dati disegnano un vuoto infrastrutturale che costa miliardi in trust erosion, litigation e inefficienza operativa.

ProofPress Verify risponde con un protocollo di certificazione crittografica: ogni contenuto riceve un numero PP univoco ancorato su IPFS tramite hash SHA-256. Il sistema analizza ogni claim fattuale con quattro motori AI paralleli, incrocia oltre 4.000 fonti globali e assegna un Trust Score da 0 a 100 con grade da A a F. Ad oggi conta 669 certificati attivi.

Il meccanismo è semplice: l'utente carica il contenuto, il sistema lo scompone in claim verificabili, li valida contro database strutturati e fonti giornalistiche, genera un certificato immutabile. Il tutto in pochi secondi. L'hash IPFS garantisce che il contenuto non sia alterabile post-certificazione, trasformando ogni documento in un asset tracciabile e difendibile.

I casi d'uso sono enterprise-grade: email contrattuali certificate per ridurre dispute legali, curriculum con claim verificati per HR automation, comunicati stampa con fact-checking preventivo per media relation, documentazione tecnica con integrità garantita per compliance. Ogni certificato è pubblicamente verificabile via URL, trasformando la trasparenza da vincolo a leva competitiva.

Il vantaggio rispetto a blockchain tradizionali è duplice: IPFS offre storage distribuito senza costi di gas, i quattro motori AI riducono il rischio di allucinazioni incrociate. Il limite è strutturale: il Trust Score dipende dalla qualità delle fonti indicizzate. Settori verticali o lingue minoritarie potrebbero avere copertura insufficiente.

Il pricing freemium abbassa la barriera d'ingresso, ma il vero ROI emerge in contesti dove il costo del trust breach supera il costo della certificazione: legal, finance, healthcare, public sector. La scalabilità è già testata con 669 certificati, ma l'adozione di massa richiede integrazione API con CRM, CMS, email client.

Chi opera in settori ad alto contenuto informativo deve valutare ProofPress Verify come infrastruttura difensiva: non elimina la disinformazione, ma rende il costo della falsificazione misurabile e il valore della verifica monetizzabile.

Leggi l'analisi completa su Proof Press → https://proofpress.ai`;

const ARTICLE_URL = "https://proofpress.ai";
// Immagine Pexels blockchain/tecnologia
const IMAGE_URL = "https://images.pexels.com/photos/9588213/pexels-photo-9588213.jpeg?auto=compress&cs=tinysrgb&w=1200";

(async () => {
  console.log("[PPV LinkedIn] Pubblicazione articolo editoriale su LinkedIn...");
  console.log(`[PPV LinkedIn] Titolo: ${ARTICLE_TITLE}`);

  const result = await publishToLinkedIn(
    ARTICLE_SUMMARY,
    ARTICLE_URL,
    IMAGE_URL,
    ARTICLE_TITLE,
    ARTICLE_SUMMARY.slice(0, 256)
  );

  if (result.success) {
    console.log(`[PPV LinkedIn] ✅ Pubblicato! Post ID: ${result.postId}`);

    // Salva nel DB come post LinkedIn per tracciabilità
    try {
      const db = await getDb();
      if (db) {
        const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
        await db.insert(linkedinPosts).values({
          dateLabel: today,
          slot: "ai-research-morning" as any,
          section: "ppv-editorial",
          title: ARTICLE_TITLE,
          postText: ARTICLE_SUMMARY,
          imageUrl: IMAGE_URL,
          linkedinUrl: result.postId ? `https://www.linkedin.com/feed/update/${result.postId}` : null,
          status: "published",
        }).onDuplicateKeyUpdate({ set: { linkedinUrl: result.postId ? `https://www.linkedin.com/feed/update/${result.postId}` : null } });
        console.log("[PPV LinkedIn] ✅ Salvato nel DB");
      }
    } catch (dbErr) {
      console.warn("[PPV LinkedIn] ⚠️ Errore salvataggio DB (non critico):", dbErr);
    }
  } else {
    console.error(`[PPV LinkedIn] ❌ Errore: ${result.error}`);
    process.exit(1);
  }

  process.exit(0);
})().catch(err => {
  console.error("[PPV LinkedIn] ❌ Errore fatale:", err);
  process.exit(1);
});
