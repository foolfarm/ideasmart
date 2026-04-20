/**
 * Aggiorna l'editoriale su ProofPress Verify con il confronto C2PA/Adobe.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { dailyEditorial } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const conn = await mysql.createConnection(process.env.DATABASE_URL!);
const db = drizzle(conn);

const today = new Date();
const dateLabel = today.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

const body = `C'è un problema strutturale nel giornalismo digitale che nessuno ha ancora risolto davvero: non sappiamo se quello che leggiamo è stato verificato, quando è stato scritto, e soprattutto se il contenuto è stato modificato dopo la pubblicazione.

ProofPress ci ha provato. L'approccio è insolito: invece di aggiungere un badge editoriale — che resta un'opinione — ha costruito un'infrastruttura crittografica. Si chiama ProofPress Verify, ed è attiva su ogni articolo pubblicato.

Il meccanismo si articola in quattro passaggi automatici, completati in meno di 15 secondi per articolo.

Il primo è l'hashing. Ogni articolo riceve un'impronta digitale SHA-256 generata da titolo, contenuto, fonte e timestamp. Se anche un solo carattere viene modificato dopo la pubblicazione, l'hash cambia. È matematicamente impossibile alterare il contenuto senza che la certificazione lo rilevi.

Il secondo passaggio è l'estrazione delle claim. Un modello AI analizza il testo e isola le affermazioni verificabili: fatti, statistiche, citazioni, attribuzioni causali. Non l'intero articolo, ma i punti specifici che possono essere controllati contro fonti esterne.

Il terzo è la corroborazione multi-source. Ogni claim viene confrontata con fonti indipendenti. Il sistema assegna a ogni fonte un punteggio di credibilità basato sul dominio e misura non solo quante fonti confermano, ma quanto sono indipendenti tra loro.

Il quarto passaggio è il Trust Score e l'ancoraggio su IPFS. Il risultato è un grade da A a F. Il Verification Report completo viene poi ancorato su IPFS: un identificatore immutabile, pubblico, che non dipende da nessun server centrale. Chiunque può verificarlo in modo indipendente, per sempre.

Il costo che cambia tutto non è la sofisticazione tecnica. È il prezzo: meno di un centesimo per articolo.


PROOFPRESS VERIFY VS C2PA: PERCHÉ L'APPROCCIO È DIVERSO

Esiste già uno standard industriale per la certificazione dei contenuti digitali: il C2PA (Coalition for Content Provenance and Authenticity), promosso da Adobe, Microsoft, BBC e Google attraverso la Content Authenticity Initiative. È adottato da Photoshop, Leica, Nikon e da alcune redazioni internazionali.

Il C2PA funziona incorporando metadati crittografici direttamente nel file — immagine, video o documento — al momento della creazione. Certifica l'origine: chi ha creato il contenuto, con quale strumento, quando. È pensato per rispondere alla domanda "questo è autentico?".

ProofPress Verify risponde a una domanda diversa e più difficile: "questo è vero?".

La differenza non è tecnica. È concettuale.

Il C2PA certifica la provenienza del file. Non verifica le affermazioni contenute nel testo. Un articolo creato con Photoshop e firmato digitalmente da un giornalista accreditato può contenere informazioni false: il C2PA non lo rileva, né è progettato per farlo.

ProofPress Verify, invece, analizza il contenuto semantico: estrae le claim fattuali, le confronta con fonti indipendenti, assegna un punteggio di credibilità basato sull'evidenza. Non certifica chi ha scritto l'articolo — certifica se quello che è scritto regge al confronto con la realtà documentata.

C'è un secondo punto di differenza strutturale: la dipendenza infrastrutturale. Il C2PA si basa su certificati digitali emessi da autorità centralizzate — le stesse che firmano i certificati HTTPS. Se l'autorità emittente viene compromessa, revocata o semplicemente chiude, la catena di fiducia si spezza. È un modello che funziona bene in ambienti controllati, ma ha un punto di fallimento centrale.

ProofPress Verify ancora i report su IPFS, un sistema di storage distribuito e content-addressed: il CID (Content Identifier) è derivato matematicamente dal contenuto stesso, non da un'autorità esterna. Non esiste un server da compromettere, non esiste un'azienda da cui dipendere. Il report esiste finché esiste almeno un nodo IPFS che lo replica — che è potenzialmente per sempre.

I due sistemi non sono in competizione diretta. Il C2PA è lo standard giusto per certificare immagini e video generati dall'AI, per proteggere la proprietà intellettuale dei creator, per tracciare le modifiche di un file multimediale lungo la catena di distribuzione. ProofPress Verify è lo strumento giusto per rispondere alla domanda che conta di più per il lettore: posso fidarmi di quello che sto leggendo?

Usati insieme, coprono l'intero spettro della fiducia digitale: origine del file e verità del contenuto.


Il giornalismo ha sempre verificato prima di pubblicare. Questo sistema verifica dopo, in modo continuo, con prova crittografica pubblica. Quando la fiducia diventa misurabile, diventa monetizzabile. La reputazione smette di essere un'impressione soggettiva e diventa un dato oggettivo, verificabile da chiunque.

È lo stesso salto che HTTPS ha fatto per la sicurezza del web. ProofPress Verify prova a fare lo stesso per l'informazione.`;

// Trova l'editoriale pubblicato oggi e aggiornalo
const [existing] = await db
  .select()
  .from(dailyEditorial)
  .where(eq(dailyEditorial.dateLabel, dateLabel))
  .orderBy(desc(dailyEditorial.createdAt))
  .limit(1);

if (existing) {
  await db
    .update(dailyEditorial)
    .set({ body, keyTrend: "ProofPress Verify · C2PA · Adobe CAI · Trust Score · IPFS · Giornalismo digitale" })
    .where(eq(dailyEditorial.id, existing.id));
  console.log("[Editorial] ✅ Articolo aggiornato con confronto C2PA/Adobe (ID:", existing.id, ")");
} else {
  console.log("[Editorial] ⚠️ Nessun editoriale trovato per oggi, inserisco nuovo...");
  await db.insert(dailyEditorial).values({
    section: "news",
    dateLabel,
    title: "Quando l'informazione diventa verificabile per legge matematica",
    subtitle: "ProofPress Verify: il protocollo che trasforma la fiducia nel giornalismo digitale da opinione a dato crittografico",
    body,
    keyTrend: "ProofPress Verify · C2PA · Adobe CAI · Trust Score · IPFS · Giornalismo digitale",
    authorNote: "Andrea Cinelli — Founder ProofPress Magazine",
    imageUrl: null,
  });
  console.log("[Editorial] ✅ Nuovo articolo pubblicato");
}

await conn.end();
process.exit(0);
