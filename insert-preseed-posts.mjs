/**
 * Script per inserire i 3 post pre-seed di Andrea Cinelli nel DB
 * Pubblicati manualmente su LinkedIn il 4 marzo 2026
 * Eseguire con: node insert-preseed-posts.mjs
 */
import { createConnection } from "mysql2/promise";
import { createHash } from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL non trovata");
  process.exit(1);
}

const IMAGE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/preseed_linkedin_post_9918efc0.jpg";
const DATE_LABEL = "2026-03-04";

const posts = [
  {
    slot: "morning",
    section: "startup",
    title: "Il Paradosso del Pre-Seed in Italia: Perché i Fondatori Italiani Sono Penalizzati",
    postText: `Il Paradosso del Pre-Seed in Italia: Perché i Fondatori Italiani Sono Penalizzati

Quando Mike Markkula investì 250.000 dollari in Apple nel 1977, non stava solo finanziando un'idea. Stava scommettendo su due ragazzi in un garage con una visione rivoluzionaria.

Oggi, in Italia, quella stessa scommessa sarebbe quasi impossibile.

Il problema non è la mancanza di talento — i fondatori italiani sono tra i più brillanti d'Europa. Il problema è strutturale: il mercato pre-seed italiano è ancora in fase embrionale.

📊 I numeri parlano chiaro:
• USA: ticket medio pre-seed $500K-$2M
• UK: ticket medio pre-seed £200K-£500K  
• Italia: ticket medio pre-seed €50K-€150K

Questa differenza non riflette solo disponibilità di capitale — riflette una cultura del rischio completamente diversa.

In Silicon Valley, il fallimento è un badge d'onore. In Italia, è ancora uno stigma.

Il risultato? I migliori fondatori italiani vanno a raccogliere capitale a Londra, Berlino o New York. E l'ecosistema italiano perde i suoi asset più preziosi.

La soluzione non è semplice, ma inizia con un cambiamento culturale: dobbiamo imparare a celebrare chi ci prova, non solo chi riesce.

Cosa ne pensate? L'ecosistema italiano sta migliorando o siamo ancora indietro?

Leggi l'analisi completa su ProofPress → https://proofpress.ai

@ProofPress #startup #venturecapital #preseed #ecosistema #italia #AI`,
    linkedinUrl: "https://www.linkedin.com/posts/cinellia/",
    hashtags: "#startup #venturecapital #preseed #ecosistema #italia #AI",
    imageUrl: IMAGE_URL,
  },
  {
    slot: "startup-afternoon",
    section: "startup",
    title: "Pre-Seed Gap: Il Confronto Italia vs USA/UK",
    postText: `Pre-Seed Gap: Il Confronto Italia vs USA/UK

Ho analizzato i dati degli ultimi 12 mesi sugli investimenti pre-seed nei tre principali ecosistemi.

Il divario è più profondo di quanto pensassi.

🇺🇸 USA (Silicon Valley):
• Ticket medio: $750K
• Valutazione media: $5-8M
• Tempo medio raccolta: 3-6 mesi
• % fondatori con exit precedente: 45%

🇬🇧 UK (Londra):
• Ticket medio: £350K
• Valutazione media: £2-4M
• Tempo medio raccolta: 4-8 mesi
• % fondatori con exit precedente: 28%

🇮🇹 Italia:
• Ticket medio: €80K
• Valutazione media: €500K-1M
• Tempo medio raccolta: 8-18 mesi
• % fondatori con exit precedente: 12%

Il dato più preoccupante? Il tempo.

Un fondatore italiano passa in media 12 mesi a raccogliere il pre-seed. Un fondatore americano ne impiega 4.

Quei 8 mesi in più non sono solo tempo perso — sono 8 mesi in cui il mercato si muove, i competitor crescono e la finestra di opportunità si chiude.

La buona notizia: ci sono segnali di cambiamento. CDP Venture Capital, alcuni family office e nuovi angel network stanno iniziando a muoversi più velocemente.

Ma dobbiamo fare di più.

Leggi l'analisi completa su ProofPress → https://proofpress.ai

@ProofPress #startup #venturecapital #preseed #italia #investimenti`,
    linkedinUrl: "https://www.linkedin.com/posts/cinellia/",
    hashtags: "#startup #venturecapital #preseed #italia #investimenti",
    imageUrl: IMAGE_URL,
  },
  {
    slot: "research",
    section: "startup",
    title: "Come Risolvere il Pre-Seed Gap Italiano: 3 Proposte Concrete",
    postText: `Come Risolvere il Pre-Seed Gap Italiano: 3 Proposte Concrete

Dopo aver analizzato il problema, è il momento di parlare di soluzioni.

Ho identificato 3 interventi che potrebbero fare la differenza:

1️⃣ SCOUT NETWORK ISTITUZIONALE
Creare una rete di scout universitari e aziendali finanziata da CDP e grandi corporate per identificare talenti prima che vadano all'estero.

Modello: Y Combinator Scout Program, ma con focus Italia.

2️⃣ MATCHING FUND PRE-SEED
Ogni euro investito da angel italiani in startup italiane viene raddoppiato da un fondo pubblico.

Questo abbassa il rischio percepito e attira più capitale privato nel segmento più rischioso.

3️⃣ FAST-TRACK VISA + INCENTIVI FISCALI
Semplificare i visti per fondatori stranieri che vogliono costruire in Italia + detrazioni fiscali al 50% per investimenti pre-seed.

Obiettivo: rendere l'Italia la destinazione più attrattiva d'Europa per le startup early-stage.

Non è fantascienza — è quello che hanno fatto Israele negli anni '90 e l'Estonia negli anni 2000.

Il capitale c'è. La burocrazia è il vero ostacolo.

Qual è la vostra proposta per sbloccare il pre-seed italiano?

Leggi l'analisi completa su ProofPress → https://proofpress.ai

@ProofPress #startup #venturecapital #preseed #italia #policy #ecosistema`,
    linkedinUrl: "https://www.linkedin.com/posts/cinellia/",
    hashtags: "#startup #venturecapital #preseed #italia #policy #ecosistema",
    imageUrl: IMAGE_URL,
  },
];

async function main() {
  const conn = await createConnection(DB_URL);
  
  try {
    for (const post of posts) {
      const hash = createHash("sha256").update(post.postText).digest("hex");
      
      // Controlla se esiste già (per idempotenza)
      const [existing] = await conn.execute(
        "SELECT id FROM linkedin_posts WHERE dateLabel = ? AND slot = ?",
        [DATE_LABEL, post.slot]
      );
      
      if (existing.length > 0) {
        console.log(`⚠️  Post già esistente per slot ${post.slot} — skip`);
        continue;
      }
      
      await conn.execute(
        `INSERT INTO linkedin_posts 
         (dateLabel, slot, postText, linkedinUrl, title, section, imageUrl, hashtags, postHash, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DATE_LABEL,
          post.slot,
          post.postText,
          post.linkedinUrl,
          post.title,
          post.section,
          post.imageUrl,
          post.hashtags,
          hash,
          new Date("2026-03-04T10:30:00Z"),
        ]
      );
      
      console.log(`✅ Inserito post: ${post.title.substring(0, 50)}...`);
    }
    
    console.log("\n✅ Tutti i post pre-seed inseriti nel DB");
  } catch (err) {
    console.error("Errore:", err);
  } finally {
    await conn.end();
  }
}

main();
