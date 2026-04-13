// Script per inserire il post McKinsey Agentic AI nel database linkedin_posts
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL non disponibile');
  process.exit(1);
}

console.log('Connessione al database...');

const connection = await mysql.createConnection(DATABASE_URL);

const POST_TEXT = `L'illusione della democratizzazione AI sta creando una nuova stratificazione industriale più profonda di quella digitale.

Il dato McKinsey è brutale nella sua chiarezza: il 79% delle organizzazioni usa generative AI, ma solo il 5.5% ne estrae valore reale. Non è un problema di adozione — è un problema di architettura. Il gap tra chi ha ChatGPT nei workflow e chi sta costruendo sistemi agentic si sta trasformando in un abisso competitivo.

I numeri raccontano una storia precisa. Nel product development, il 73% delle aziende non usa AI agents. Punto. Gli high performers — quel 5.5% che genera ROI — sono 5 volte più propensi a investire oltre il 20% del budget digitale in AI e 3.6 volte più determinati a perseguire cambiamento trasformativo, non incrementale. La differenza non è tecnologica. È strategica.

McKinsey individua tre fondamenta: data foundation solida, operating model ridisegnato, governance AI. Tradotto: non puoi far scalare agenti autonomi su dati frammentati, con un'organizzazione progettata per l'era dei fogli Excel e senza qualcuno che risponda quando l'agente sbaglia.

La lettura è questa: stiamo entrando in un'era dove l'accesso all'AI è universale ma la capacità di farla funzionare è elitaria. Chi oggi sta costruendo le fondamenta — non comprando licenze, ma ripensando governance e data layer — tra tre anni avrà un vantaggio strutturale irrecuperabile.

Il 79% che "usa l'AI" si sta preparando a competere, o a diventare irrilevante con efficienza?

Fonte McKinsey: https://www.mckinsey.com/capabilities/mckinsey-technology/our-insights/building-the-foundations-for-agentic-ai-at-scale

Leggi l'analisi completa su Proof Press → https://proofpress.ai

#AgenticAI #AI #Innovation #Leadership #DigitalTransformation`;

const postHash = crypto.createHash('sha256').update(POST_TEXT).digest('hex');
const dateLabel = '2026-04-13';
const linkedinUrl = 'https://www.linkedin.com/feed/update/urn:li:share:7449469163254747136/';
const imageUrl = 'https://images.pexels.com/photos/8566464/pexels-photo-8566464.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';
const title = 'Agentic AI: il 5.5% che genera ROI vs il 79% che usa ChatGPT';

// Prima controlla se esiste già un record per questo slot/data
const [existing] = await connection.execute(
  'SELECT id FROM linkedin_posts WHERE dateLabel = ? AND slot = ?',
  [dateLabel, 'research']
);

console.log('Record esistenti per research/2026-04-13:', existing.length);

if (existing.length > 0) {
  // Aggiorna il record esistente
  await connection.execute(
    `UPDATE linkedin_posts SET 
      postText = ?, linkedinUrl = ?, title = ?, section = 'ai',
      imageUrl = ?, hashtags = ?, postHash = ?
    WHERE dateLabel = ? AND slot = ?`,
    [POST_TEXT, linkedinUrl, title, imageUrl, '#AgenticAI #AI #Innovation #Leadership #DigitalTransformation', postHash, dateLabel, 'research']
  );
  console.log('✅ Record aggiornato');
} else {
  // Inserisci nuovo record — usa slot 'research' per il post editoriale
  await connection.execute(
    `INSERT INTO linkedin_posts (dateLabel, slot, postText, linkedinUrl, title, section, imageUrl, hashtags, postHash, createdAt)
     VALUES (?, 'research', ?, ?, ?, 'ai', ?, ?, ?, NOW())`,
    [dateLabel, POST_TEXT, linkedinUrl, title, imageUrl, '#AgenticAI #AI #Innovation #Leadership #DigitalTransformation', postHash]
  );
  console.log('✅ Record inserito');
}

// Verifica
const [rows] = await connection.execute(
  'SELECT id, dateLabel, slot, title, linkedinUrl FROM linkedin_posts WHERE dateLabel = ? ORDER BY createdAt DESC LIMIT 5',
  [dateLabel]
);
console.log('\nPost del 2026-04-13 nel DB:');
rows.forEach(r => console.log(`  [${r.id}] ${r.slot} | ${r.title} | ${r.linkedinUrl?.substring(0,60)}`));

await connection.end();
console.log('\nDone.');
