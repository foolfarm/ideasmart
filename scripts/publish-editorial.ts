/**
 * Pubblica l'editoriale su ProofPress Verify nella Home di ProofPress.
 */
import "dotenv/config";
import { saveEditorial } from "../server/db";

const today = new Date();
const dateLabel = today.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });

const body = `C'è un problema strutturale nel giornalismo digitale che nessuno ha ancora risolto davvero: non sappiamo se quello che leggiamo è stato verificato, quando è stato scritto, e soprattutto se il contenuto è stato modificato dopo la pubblicazione.

ProofPress ci ha provato. E l'approccio è insolito: invece di aggiungere un badge editoriale — che resta un'opinione — ha costruito un'infrastruttura crittografica. Si chiama ProofPress Verify, ed è attiva su ogni articolo pubblicato.

Il meccanismo si articola in quattro passaggi automatici, completati in meno di 15 secondi per articolo.

Il primo è l'hashing. Ogni articolo riceve un'impronta digitale SHA-256 generata da titolo, contenuto, fonte e timestamp. Se anche un solo carattere viene modificato dopo la pubblicazione, l'hash cambia. È matematicamente impossibile alterare il contenuto senza che la certificazione lo rilevi.

Il secondo passaggio è l'estrazione delle claim. Un modello AI analizza il testo e isola le affermazioni verificabili: fatti, statistiche, citazioni, attribuzioni causali. Non l'intero articolo, ma i punti specifici che possono essere controllati contro fonti esterne.

Il terzo è la corroborazione multi-source. Ogni claim viene confrontata con fonti indipendenti. Il sistema assegna a ogni fonte un punteggio di credibilità basato sul dominio e misura non solo quante fonti confermano, ma quanto sono indipendenti tra loro.

Il quarto passaggio è il Trust Score e l'ancoraggio su IPFS. Il risultato è un grade da A a F. Il Verification Report completo viene poi ancorato su IPFS: un identificatore immutabile, pubblico, che non dipende da nessun server centrale. Chiunque può verificarlo in modo indipendente, per sempre.

Il costo che cambia tutto non è la sofisticazione tecnica. È il prezzo: meno di un centesimo per articolo. A quella cifra, la verifica automatica diventa scalabile per qualsiasi editore. Il giornalismo ha sempre verificato prima di pubblicare. Questo sistema verifica dopo, in modo continuo, con prova pubblica e immutabile.

Quando la fiducia diventa misurabile, diventa monetizzabile. Un articolo con Trust Grade A vale di più per gli inserzionisti, per i lettori, per i partner editoriali. La reputazione smette di essere un'impressione soggettiva e diventa un dato oggettivo, verificabile da chiunque.

È lo stesso salto che HTTPS ha fatto per la sicurezza del web. ProofPress Verify prova a fare lo stesso per l'informazione.`;

await saveEditorial({
  section: "news",
  dateLabel,
  title: "Quando l'informazione diventa verificabile per legge matematica",
  subtitle: "ProofPress Verify: il protocollo che trasforma la fiducia nel giornalismo digitale da opinione a dato crittografico",
  body,
  keyTrend: "ProofPress Verify · Certificazione AI · Trust Score · IPFS · Giornalismo digitale",
  authorNote: "Andrea Cinelli — Founder ProofPress Magazine",
  imageUrl: null,
});

console.log("[Editorial] ✅ Articolo pubblicato nella Home di ProofPress (sezione: news, data:", dateLabel, ")");
process.exit(0);
