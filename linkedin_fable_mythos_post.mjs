import { config } from 'dotenv';
config();

const LI_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const AUTHOR_URN = process.env.LINKEDIN_AUTHOR_URN;

// ─── TESTO DEL POST ───────────────────────────────────────────────────────────
const postText = `Ieri il governo degli Stati Uniti ha ordinato ad Anthropic di sospendere immediatamente l'accesso a Fable 5 e Mythos 5 per tutti i cittadini stranieri, ovunque nel mondo. Nessuna motivazione tecnica credibile. Nessun processo trasparente. Un ordine esecutivo, firmato alle 17:21 ora di Washington.

Anthropic ha obbedito nel giro di ore.

Questo è il punto che molti in Europa continuano a non voler vedere.

Non si tratta di sicurezza nazionale americana. Si tratta di qualcosa di molto più semplice e molto più pericoloso: chi controlla l'infrastruttura AI controlla l'accesso alla conoscenza, alla produttività, alla competitività industriale. E oggi quell'infrastruttura è americana al 100%.

Fable 5 e Mythos 5 sono i modelli AI più avanzati mai rilasciati. Centinaia di milioni di utenti, aziende, ospedali, università, studi legali, governi li usavano ogni giorno. Con un ordine esecutivo, tutto spento. Per tutti. Senza preavviso.

Anthropic stessa ha dichiarato di non essere d'accordo con la decisione. Ma ha obbedito lo stesso. Perché non poteva fare altrimenti.

Ora la domanda che ogni CEO, ogni ministro, ogni board europeo dovrebbe porsi è questa: se domani lo stesso ordine arrivasse per i modelli che alimentano i vostri processi critici, cosa fareste?

L'Europa ha una scelta davanti a sé. Non è la scelta tra destra e sinistra, tra sovranismo e globalismo, tra patriottismo e cosmopolitismo. Queste sono categorie del XX secolo che non hanno più senso nel contesto dell'AI.

La scelta reale è tra due scenari:

Il primo: l'Europa rimane frammentata in 27 mercati nazionali, 27 politiche industriali diverse, 27 approcci regolatori incompatibili. In questo scenario non diventiamo una colonia americana. Diventiamo qualcosa di peggio: una dipendenza strutturale, dove la nostra capacità di competere, innovare e decidere è subordinata a ordini esecutivi che partono da Washington senza nemmeno doverci consultare.

Il secondo: l'Europa costruisce una vera federazione tecnologica. Non un'unione di bandiere e inni, ma un'unione di capacità computazionale, di dati, di investimento in ricerca fondamentale, di standard industriali comuni. Un'Europa che può rispondere a un ordine come quello di ieri con una propria infrastruttura AI sovrana, con modelli europei, con cloud europeo, con chip europei.

Non è utopia. È sopravvivenza industriale.

Il problema non è Donald Trump. Il problema è che qualsiasi presidente americano, di qualsiasi colore politico, ha oggi il potere legale di spegnere l'accesso europeo all'AI con una firma. E noi non abbiamo nulla con cui rispondere.

I nazionalismi europei non ci salveranno. L'Italia da sola non può costruire un modello AI frontier. La Francia da sola non può. La Germania da sola non può. Ma un'Europa unita, con il PIL aggregato più grande del mondo, con le migliori università di ricerca, con una tradizione industriale senza pari, potrebbe farlo.

La finestra si sta chiudendo. Ogni anno che passa senza una strategia AI federale europea è un anno in cui il gap si allarga, le dipendenze si consolidano, e la possibilità di recupero si riduce.

Fable 5 è stato spento ieri. Oggi è un modello AI. Domani potrebbe essere un sistema di pagamento, una rete energetica, un'infrastruttura sanitaria.

Il momento di scegliere è adesso.

#AI #Europa #Sovranità #Federalismo #Anthropic #FuturoEuropeo #IntelligenzaArtificiale #Geopolitica`;

console.log('=== POST LINKEDIN — ANTEPRIMA ===\n');
console.log(postText);
console.log('\n=== LUNGHEZZA:', postText.length, 'caratteri ===\n');

// ─── PUBBLICAZIONE ────────────────────────────────────────────────────────────
const payload = {
  author: AUTHOR_URN,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: postText
      },
      shareMediaCategory: 'NONE'
    }
  },
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
  }
};

console.log('Pubblicazione in corso...');

const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LI_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
  },
  body: JSON.stringify(payload)
});

const responseText = await res.text();
console.log('HTTP Status:', res.status, res.statusText);

if (res.ok) {
  let data;
  try { data = JSON.parse(responseText); } catch { data = responseText; }
  const postId = res.headers.get('x-restli-id') || data?.id || 'unknown';
  console.log('✅ POST PUBBLICATO CON SUCCESSO');
  console.log('Post ID:', postId);
  if (postId && postId !== 'unknown') {
    const url = postId.startsWith('urn:li:') 
      ? `https://www.linkedin.com/feed/update/${postId}/`
      : `https://www.linkedin.com/feed/update/urn:li:ugcPost:${postId}/`;
    console.log('URL:', url);
  }
} else {
  console.log('❌ ERRORE PUBBLICAZIONE:');
  console.log(responseText.substring(0, 500));
}
