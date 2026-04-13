/**
 * insert-deloitte-deepdive.mjs
 * Inserisce il post Deloitte Tech Trends 2026 come Deep Dive nella tabella daily_editorial.
 * Sostituisce l'attuale Deep Dive di oggi (agricoltura/droni) con il contenuto Deloitte.
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const DB_URL = process.env.DATABASE_URL;

const DELOITTE_EDITORIAL = {
  section: "ai",
  dateLabel: "2026-04-13",
  title: "Deloitte Tech Trends 2026: il 2026 è l'anno dello scaling",
  subtitle: "17ª edizione del report Deloitte — 72 pagine di dati su dove stanno andando le organizzazioni che vincono con l'AI.",
  body: `Il 2025 era l'anno dei proof of concept. Il 2026 è l'anno dello scaling.

Deloitte ha appena pubblicato la 17ª edizione del Tech Trends Report — 72 pagine di dati su dove stanno andando le organizzazioni che vincono con l'AI. La fase esplorativa è chiusa. Chi non è in esecuzione, è già in ritardo.

**1. L'innovazione si moltiplica, non si somma.**
GenAI ha raggiunto 100 milioni di utenti in 2 mesi. Il telefono ci ha impiegato 50 anni. Chi non ridisegna i processi dall'interno, ma si limita ad automatizzare quelli esistenti, non sta innovando: sta solo rendendo più efficiente qualcosa che andrebbe ripensato da zero.

**2. L'AI diventa fisica.**
Deloitte stima 2 milioni di robot umanoidi nei luoghi di lavoro entro il 2035. Non è fantascienza: è supply chain, logistica, manifattura avanzata. I costi scendono abbastanza velocemente da rendere l'adozione mainstream una questione di anni, non di decenni.

**3. Solo l'11% delle organizzazioni ha agenti AI in produzione.**
Il gap tra chi capisce e chi esegue si sta allargando. Le organizzazioni che vincono hanno ridisegnato i flussi di lavoro intorno a capacità agentiche, riducendo i costi AI del 280x rispetto a tre anni fa.

**4. L'infrastruttura AI è il nuovo campo di battaglia.**
I costi dei token scendono, ma la spesa totale esplode per il volume. La risposta sono architetture ibride strategiche — cloud, on-premises, edge — non soluzioni one-size-fits-all.

**5. Il CIO non è più un tech strategist. È un AI orchestratore.**
64% delle organizzazioni aumenta i budget AI. Emergono nuovi ruoli: AI collaboration designer, edge AI engineer, prompt engineer. Le organizzazioni che vincono ancorano ogni iniziativa AI a un outcome di business misurabile.

Il vantaggio competitivo non si costruisce adottando l'AI. Si costruisce ridisegnando l'organizzazione intorno all'AI.

Il 93% degli investimenti AI va sulla tecnologia. Solo il 7% sulle persone. Questo squilibrio è il vero rischio strategico del prossimo triennio. Chi ridisegna vince. Chi si limita ad adottare, sopravvive — per ora.`,
  keyTrend: "Solo l'11% delle org. ha agenti AI in produzione. Il gap esecutivo si allarga.",
  authorNote: "Il report Deloitte conferma quello che vediamo ogni giorno sul campo: la differenza non è tra chi ha l'AI e chi non ce l'ha. È tra chi ridisegna i processi intorno all'AI e chi si limita ad aggiungerla sopra. — Andrea Cinelli",
  imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/99304667/TnfzSBwmtgDEdgga.webp",
};

async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log("✅ Connesso al DB");

  // Elimina i Deep Dive duplicati di oggi (agricoltura)
  const [deleted] = await conn.execute(
    `DELETE FROM daily_editorial WHERE dateLabel IN ('13-04-2026', '2026-04-13') AND title LIKE '%Aia%'`
  );
  console.log(`🗑️  Rimossi ${deleted.affectedRows} Deep Dive duplicati (agricoltura)`);

  // Inserisce il nuovo Deep Dive Deloitte
  const [result] = await conn.execute(
    `INSERT INTO daily_editorial (section, dateLabel, title, subtitle, body, keyTrend, authorNote, imageUrl, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      DELOITTE_EDITORIAL.section,
      DELOITTE_EDITORIAL.dateLabel,
      DELOITTE_EDITORIAL.title,
      DELOITTE_EDITORIAL.subtitle,
      DELOITTE_EDITORIAL.body,
      DELOITTE_EDITORIAL.keyTrend,
      DELOITTE_EDITORIAL.authorNote,
      DELOITTE_EDITORIAL.imageUrl,
    ]
  );
  console.log(`✅ Deep Dive Deloitte inserito (id: ${result.insertId})`);

  // Verifica finale
  const [latest] = await conn.execute(
    `SELECT id, dateLabel, title, LEFT(body, 80) as preview FROM daily_editorial ORDER BY createdAt DESC LIMIT 3`
  );
  console.log("\n📋 Ultimi 3 Deep Dive:");
  for (const r of latest) {
    console.log(`  [${r.dateLabel}] id=${r.id} | ${r.title}`);
  }

  await conn.end();
  console.log("\n🎉 Deep Dive Deloitte pubblicato sul sito!");
}

main().catch(e => { console.error(e); process.exit(1); });
