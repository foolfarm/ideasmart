/**
 * Pubblica il post LinkedIn per la Guida Definitiva Fasteer
 * con il banner quadrato 1:1 generato
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Carica le variabili d'ambiente
import { config } from 'dotenv';
config({ path: '/home/ubuntu/ideasmart/.env' });

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_AUTHOR_URN = process.env.LINKEDIN_AUTHOR_URN;

const BANNER_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/fasteer_guida_definitiva_banner-Vn45h2fx6kUeqj85uQPZwt.png';
const ARTICLE_URL = 'https://proofpress.ai';

const POST_TEXT = `Il debito tecnico costa $2.41 trilioni l'anno alle aziende americane.

Non è un problema IT. È un freno strutturale alla competitività: erode dal 10% al 20% del budget tecnologico, rallenta i team di sviluppo del 42% e blocca l'innovazione proprio quando il mercato accelera.

La riscrittura manuale tramite System Integrator richiede 3-5 anni e costa tra €5 e €15 milioni per milione di righe di codice. Il fai-da-te con LLM generici fallisce nel 70% dei casi per mancanza di contesto architetturale.

Fasteer ha costruito la risposta industriale: una catena di montaggio agentica che scansiona l'intera codebase, mappa le dipendenze, genera un PRD approvato dal CTO e traduce il codice con unit test automatici. Il motore FRIO abbatte i costi di inferenza dell'87% instradando l'85% dei task su modelli open-source locali.

Il mercato della Legacy Modernization vale $24.98 miliardi oggi e crescerà fino a $67.91 miliardi entro il 2031 (CAGR 19.86%). Chi modernizza ora cattura il vantaggio competitivo. Chi aspetta paga il costo del ritardo.

La Guida Definitiva al Codice Legacy è disponibile gratuitamente: dati, benchmark e roadmap operativa per CTO e CEO.

Leggi l'analisi completa su Proof Press → https://proofpress.ai`;

async function uploadImageToLinkedIn(uploadUrl, imageUrl, token) {
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) {
    console.error('[LinkedIn] ❌ Impossibile scaricare immagine:', imgResponse.status);
    return false;
  }
  const imgBuffer = await imgResponse.arrayBuffer();
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'image/png',
    },
    body: imgBuffer,
  });
  return uploadResponse.ok || uploadResponse.status === 201;
}

async function registerLinkedInImageUpload(token, authorUrn) {
  const response = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: authorUrn,
        serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
      },
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    console.error('[LinkedIn] ❌ Errore registrazione upload:', err);
    return null;
  }
  const data = await response.json();
  return {
    uploadUrl: data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
    asset: data.value.asset,
  };
}

async function publishPost() {
  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_AUTHOR_URN) {
    console.error('[LinkedIn] ❌ Credenziali mancanti');
    process.exit(1);
  }

  console.log('[LinkedIn] 🖼️ Avvio upload immagine...');
  const uploadInfo = await registerLinkedInImageUpload(LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN);
  if (!uploadInfo) {
    console.error('[LinkedIn] ❌ Registrazione upload fallita');
    process.exit(1);
  }

  const uploaded = await uploadImageToLinkedIn(uploadInfo.uploadUrl, BANNER_URL, LINKEDIN_ACCESS_TOKEN);
  if (!uploaded) {
    console.error('[LinkedIn] ❌ Upload immagine fallito');
    process.exit(1);
  }
  console.log('[LinkedIn] ✅ Immagine caricata:', uploadInfo.asset);

  // Attendi che LinkedIn processi l'asset
  await new Promise(r => setTimeout(r, 3000));

  const postBody = {
    author: LINKEDIN_AUTHOR_URN,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: POST_TEXT },
        shareMediaCategory: 'IMAGE',
        media: [{
          status: 'READY',
          description: { text: 'La Guida Definitiva al Codice Legacy — Fasteer' },
          media: uploadInfo.asset,
          title: { text: 'La Guida Definitiva al Codice Legacy' },
        }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postBody),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('[LinkedIn] ❌ Errore pubblicazione:', response.status, err);
    process.exit(1);
  }

  const result = await response.json();
  const postId = result.id || response.headers.get('x-restli-id') || 'N/A';
  console.log('[LinkedIn] ✅ Post pubblicato! ID:', postId);
  return postId;
}

publishPost().catch(err => {
  console.error('[LinkedIn] ❌ Errore fatale:', err);
  process.exit(1);
});
