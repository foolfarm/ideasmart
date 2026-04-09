import * as dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

dotenv.config({ path: '/home/ubuntu/ideasmart/.env' });

const DB_URL = process.env.DATABASE_URL;
const LI_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LI_AUTHOR = process.env.LINKEDIN_AUTHOR_URN;

// ─── Testi ───────────────────────────────────────────────────────────────────

const IMAGE_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/cina_ai_freccia-73nKegR9cRyY6Vj5y24Zbk.png';

const LINKEDIN_TEXT = `La Cina ha messo la freccia. E non per sorpassare qualcuno: è già davanti.

I dati di Hugging Face, MIT e RunPod parlano chiaro:

→ I modelli cinesi rappresentano il 41% di tutti i download AI globali (contro il 36,5% degli USA)
→ DeepSeek-R1 è il modello più apprezzato su Hugging Face, superando Llama di Meta
→ Qwen di Alibaba ha generato oltre 100.000 derivati — più di qualsiasi altro modello al mondo
→ 5 settimane consecutive in testa alle classifiche: 4,69 trilioni di token cinesi vs 2,94 trilioni americani

Non è un colpo di fortuna. È una strategia.

DeepSeek ha dimostrato che si può costruire un modello AI di livello mondiale a costo marginale. Questo ha liberato Baidu, ByteDance, Tencent, Xiaomi: tutti hanno moltiplicato le release open source da 2 a 9 volte in un solo anno.

Il paradosso? Tutta questa potenza gira ancora su chip Nvidia. La Cina guida il software, ma l'infrastruttura è ancora americana. Per ora.

Per le aziende europee e italiane: i modelli open source cinesi sono già disponibili, già performanti, già gratuiti. La domanda non è "se usarli" ma "come usarli in modo sicuro e strategico".

Il sorpasso è avvenuto in silenzio. La prossima mossa sarà rumorosa.

Leggi l'analisi completa su Proof Press → https://proofpress.ai

#AI #ArtificialIntelligence #China #DeepSeek #Qwen #OpenSource #Innovation #Strategy`;

const EDITORIAL_TITLE = 'La Cina mette la freccia: come i modelli AI cinesi hanno conquistato il mondo in silenzio';
const EDITORIAL_SUMMARY = 'I dati di Hugging Face, MIT e RunPod confermano il sorpasso: DeepSeek, Qwen e i modelli open source cinesi guidano ora le classifiche globali di download e utilizzo. Analisi delle implicazioni strategiche per aziende e investitori europei.';
const EDITORIAL_BODY = `Per anni la narrativa dominante sull'intelligenza artificiale era semplice: OpenAI guida, Google insegue, Meta democratizza con l'open source. La Cina era sullo sfondo — presente, ma non protagonista.

Quei tempi sono finiti.

I dati pubblicati da Hugging Face nel report "State of Open Source: Spring 2026" — integrati con le analisi di MIT, RunPod e OpenRouter — disegnano un quadro inequivocabile: i modelli AI sviluppati in Cina hanno superato quelli americani per download, utilizzo e adozione globale. Non in un singolo trimestre. In modo strutturale.

**I numeri del sorpasso**

Il cambio di guardia si misura su più dimensioni. In termini di download su Hugging Face, i modelli cinesi rappresentano oggi il 41% del totale globale, contro il 36,5% degli Stati Uniti. Su OpenRouter, i modelli cinesi hanno guidato le classifiche per cinque settimane consecutive, con 4,69 trilioni di token processati contro i 2,94 trilioni americani nella settimana terminata il 5 aprile 2026.

DeepSeek-R1 è oggi il modello più apprezzato su Hugging Face — scalzando Llama di Meta. Qwen di Alibaba ha generato oltre 100.000 derivati sulla piattaforma, più di qualsiasi altra organizzazione al mondo. Xiaomi ha appena presentato MiMo-V2-Pro, un modello da un trilione di parametri con prestazioni paragonabili ai sistemi americani leader a una frazione del costo.

**La strategia dietro il sorpasso**

Il caso DeepSeek non è stato un colpo di fortuna. È stato il catalizzatore di una strategia di ecosistema. Baidu è passata da zero release su Hugging Face nel 2024 a oltre 100 nel 2025. ByteDance e Tencent hanno moltiplicato il loro output da 5 a 9 volte. MiniMax ha aperto i pesi dei suoi modelli.

**Il paradosso dell'infrastruttura**

La stragrande maggioranza dei modelli AI — cinesi inclusi — gira ancora su GPU Nvidia. L'azienda americana non è solo il fornitore di hardware: sta costruendo un ecosistema software sempre più profondo. Alibaba sta investendo in chip di inferenza proprietari per ridurre questa dipendenza. Ma siamo ancora agli inizi.

**Implicazioni per aziende e investitori europei**

Per le organizzazioni europee e italiane, i modelli open source cinesi sono già disponibili, già performanti, già gratuiti — e ignorarli significa rinunciare a un vantaggio competitivo reale. Per chi investe in AI, il sorpasso cinese ridefinisce dove si trova il vantaggio competitivo: non è più nel modello base, ma nell'applicazione verticale, nell'integrazione con i processi aziendali, nella fiducia.

Il sorpasso è avvenuto in silenzio. La prossima mossa sarà molto più rumorosa.

*— Andrea Cinelli, CEO & Founder FoolFarm | Proof Press*`;

// ─── 1. Pubblica su LinkedIn con immagine ────────────────────────────────────

async function publishLinkedIn() {
  console.log('[LinkedIn] Caricamento immagine...');
  
  // Step 1: Register image upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LI_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: LI_AUTHOR,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent',
        }],
      },
    }),
  });

  if (!registerRes.ok) {
    const err = await registerRes.text();
    throw new Error(`Register upload failed: ${err}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn = registerData.value.asset;

  // Step 2: Download image and upload to LinkedIn
  console.log('[LinkedIn] Download immagine da CDN...');
  const imgRes = await fetch(IMAGE_URL);
  const imgBuffer = await imgRes.arrayBuffer();

  console.log('[LinkedIn] Upload immagine...');
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${LI_TOKEN}` },
    body: imgBuffer,
  });

  if (!uploadRes.ok && uploadRes.status !== 201) {
    console.warn(`[LinkedIn] Upload status: ${uploadRes.status} (potrebbe essere OK)`);
  }

  // Step 3: Publish post
  console.log('[LinkedIn] Pubblicazione post...');
  const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LI_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: LI_AUTHOR,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: LINKEDIN_TEXT },
          shareMediaCategory: 'IMAGE',
          media: [{
            status: 'READY',
            description: { text: EDITORIAL_SUMMARY },
            media: assetUrn,
            title: { text: EDITORIAL_TITLE },
          }],
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });

  if (!postRes.ok) {
    const err = await postRes.text();
    throw new Error(`Post failed: ${err}`);
  }

  const postData = await postRes.json();
  console.log('[LinkedIn] ✅ Post pubblicato:', postData.id);
  return postData.id;
}

// ─── 2. Salva editoriale nel DB ───────────────────────────────────────────────

async function saveEditorial() {
  const conn = await createConnection(DB_URL);
  
  try {
    const today = new Date();
    const dateLabel = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Controlla se esiste già un editoriale con titolo simile oggi
    const [existing] = await conn.execute(
      `SELECT id FROM daily_editorial WHERE title LIKE ? AND dateLabel = ?`,
      ['%Cina mette la freccia%', dateLabel]
    );
    
    if (existing.length > 0) {
      console.log('[DB] Editoriale già presente oggi, skip.');
      return existing[0].id;
    }

    const [result] = await conn.execute(
      `INSERT INTO daily_editorial (dateLabel, title, subtitle, body, keyTrend, authorNote, imageUrl, section) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dateLabel,
        EDITORIAL_TITLE,
        EDITORIAL_SUMMARY,
        EDITORIAL_BODY,
        'La Cina supera gli USA nei modelli AI open source per download e utilizzo globale',
        "Un'analisi strategica per CEO e investitori europei: cosa significa il sorpasso cinese nell'AI e come posizionarsi.",
        IMAGE_URL,
        'ai',
      ]
    );
    
    console.log('[DB] ✅ Editoriale salvato, ID:', result.insertId);
    return result.insertId;
  } finally {
    await conn.end();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const liPostId = await publishLinkedIn();
    console.log('\n[LinkedIn] Post ID:', liPostId);
  } catch (err) {
    console.error('[LinkedIn] Errore:', err.message);
  }

  try {
    const editorialId = await saveEditorial();
    console.log('[DB] Editorial ID:', editorialId);
  } catch (err) {
    console.error('[DB] Errore:', err.message);
  }
}

main();
