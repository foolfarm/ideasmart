/**
 * Pubblica post LinkedIn con immagine mappa salari Eurostat
 */
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const AUTHOR_URN = process.env.LINKEDIN_AUTHOR_URN;
const IMAGE_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/99304667/rHrjCzSApdeLgzMg.jpeg";

const POST_TEXT = `La mappa che nessuno vuole leggere davvero.

Italia: 20.000–29.999 € netti annui (PPP).
Media UE: 38.950 €.
Francia e Germania: oltre 40.000 €.
Paesi nordici: oltre 60.000 €.

Non è una notizia. È la fotografia di un fallimento sistemico che dura da trent'anni.

Il problema non sono i salari. Sono i lavori.

Un paese che costruisce la propria economia su turismo, ristorazione e commercio al dettaglio non può pagare salari alti. Non perché non voglia. Perché quei settori non producono abbastanza valore aggiunto per farlo. È aritmetica, non politica.

Dal 2000 al 2024, i salari reali italiani sono cresciuti dello 0%.
Germania: +34%. Francia: +31%. Svezia: +53%.

Nel 2024, gli espatriati giovani italiani sono aumentati del 47,9% in un solo anno. Dal 2011 al 2024 sono partiti 630.000 giovani tra i 18 e i 34 anni.

Non scappano perché non amano l'Italia. Scappano perché il mercato parla chiaro.

C'è però un dato che distorce tutto: l'evasione fiscale.

La mappa Eurostat misura i salari dichiarati. L'economia sommersa italiana vale tra il 10% e il 12% del PIL — circa 180-200 miliardi l'anno non censiti. L'evasione è un sussidio occulto al basso valore aggiunto: permette a settori inefficienti di sopravvivere pagando meno di quanto dovrebbero, tenendo i salari formali bassi e rendendo il paese meno competitivo per chi vuole costruire qualcosa di legale e scalabile.

Il circolo vizioso:
Basso valore aggiunto → bassi salari formali → fuga dei talenti → meno innovazione → ancora più dipendenza dal basso valore aggiunto.

I giovani che se ne vanno non sono il problema. Sono il sintomo.

Il problema è che abbiamo costruito un paese in cui la scelta razionale per un talento è andarsene.

Finché non cambia il modello produttivo, non cambierà nient'altro.

Fonte: Eurostat / Corriere della Sera

#Italia #Salari #FugaCervelli #PoliticaIndustriale #Economia #Lavoro #Innovazione #ValoreAggiunto`;

async function uploadImageToLinkedIn(imageUrl) {
  // Step 1: Register upload
  const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: AUTHOR_URN,
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }]
      }
    })
  });

  if (!registerRes.ok) {
    const err = await registerRes.text();
    throw new Error(`Register upload failed: ${registerRes.status} ${err}`);
  }

  const registerData = await registerRes.json();
  const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const assetUrn = registerData.value.asset;

  console.log(`[LinkedIn] Asset URN: ${assetUrn}`);
  console.log(`[LinkedIn] Upload URL: ${uploadUrl}`);

  // Step 2: Download image from CDN
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`);
  const imgBuffer = await imgRes.arrayBuffer();

  // Step 3: Upload image binary
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'image/jpeg',
    },
    body: imgBuffer
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Image upload failed: ${uploadRes.status} ${err}`);
  }

  console.log(`[LinkedIn] Immagine caricata con successo`);
  return assetUrn;
}

async function publishPost() {
  console.log('[LinkedIn] Caricamento immagine mappa Eurostat...');
  const assetUrn = await uploadImageToLinkedIn(IMAGE_URL);

  // Attendi qualche secondo per il processing
  await new Promise(r => setTimeout(r, 3000));

  console.log('[LinkedIn] Pubblicazione post...');
  const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: AUTHOR_URN,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: POST_TEXT
          },
          shareMediaCategory: 'IMAGE',
          media: [{
            status: 'READY',
            description: { text: 'La mappa dei salari in Europa — Eurostat 2025' },
            media: assetUrn,
            title: { text: 'Salari in Europa: il confronto sul costo della vita' }
          }]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });

  if (!postRes.ok) {
    const err = await postRes.text();
    throw new Error(`Post publication failed: ${postRes.status} ${err}`);
  }

  const postData = await postRes.json();
  console.log(`[LinkedIn] ✅ Post pubblicato con successo!`);
  console.log(`[LinkedIn] Post ID: ${postData.id}`);
  return postData.id;
}

publishPost().catch(err => {
  console.error('[LinkedIn] ❌ Errore:', err.message);
  process.exit(1);
});
