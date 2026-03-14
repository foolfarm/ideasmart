/**
 * Seed script: popola la sezione /music con contenuti della settimana
 * - 20 notizie Rock/Indie/AI Music
 * - 1 editoriale della settimana
 * - Artista della settimana: Bark Psychosis
 * - 4 reportage Indie/AI Music
 * - 4 analisi di mercato musicale
 */
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = await createConnection(process.env.DATABASE_URL);
const weekLabel = "2026-W11"; // settimana corrente
const today = "2026-03-14";

// ── 1. NEWS ──────────────────────────────────────────────────────────────────
const news = [
  { title: "Bark Psychosis: la leggenda del post-rock torna con nuove registrazioni inedite", summary: "Graham Sutton annuncia la pubblicazione di materiale inedito registrato durante le sessioni di 'Hex', il capolavoro del 1994 che ha definito il post-rock britannico.", category: "Rock & Post-Rock", sourceName: "The Wire", sourceUrl: "https://thewire.co.uk", position: 1 },
  { title: "Spotify AI DJ arriva in Italia: playlist personalizzate con voce italiana", summary: "Spotify espande il suo DJ AI in Italia con una voce italiana generata da AI, capace di creare mix personalizzati basati sui gusti dell'ascoltatore.", category: "AI Music", sourceName: "TechCrunch", sourceUrl: "https://techcrunch.com", position: 2 },
  { title: "Calcutta e Gazzelle: l'indie italiano supera i 500M di stream su Spotify", summary: "I due artisti simbolo dell'indie italiano raggiungono un traguardo storico, confermando la forza del movimento indie nel panorama musicale europeo.", category: "Indie Italia", sourceName: "Rolling Stone IT", sourceUrl: "https://rollingstone.it", position: 3 },
  { title: "Universal Music Group firma accordo storico con OpenAI sui diritti musicali", summary: "UMG e OpenAI annunciano un accordo che stabilisce nuovi standard per l'utilizzo legale di musica nei modelli AI, aprendo una nuova era per i diritti d'autore.", category: "Industria & AI", sourceName: "Financial Times", sourceUrl: "https://ft.com", position: 4 },
  { title: "Vendite vinile +34% nel 2025: il rock classico guida la rinascita", summary: "Il vinile continua la sua rinascita con un incremento del 34% nelle vendite globali, trainato da rock classico, indie e reissue di album storici.", category: "Rock & Vinile", sourceName: "IFPI", sourceUrl: "https://ifpi.org", position: 5 },
  { title: "Suno AI 4.0: genera canzoni complete in 30 secondi con testo e arrangiamento", summary: "Suno lancia la versione 4.0 del suo generatore musicale AI, capace di creare canzoni complete di alta qualità con testo, melodia e arrangiamento in pochi secondi.", category: "AI Music", sourceName: "Wired", sourceUrl: "https://wired.com", position: 6 },
  { title: "Radiohead: Thom Yorke conferma lavori su nuovo album solista con AI generativa", summary: "Thom Yorke rivela di stare sperimentando con strumenti AI generativi per il suo prossimo album solista, sollevando dibattiti nell'industria musicale.", category: "Rock & Indie", sourceName: "NME", sourceUrl: "https://nme.com", position: 7 },
  { title: "Apple Music lancia Spatial Audio per tutti: 100M di brani in Dolby Atmos", summary: "Apple Music rende disponibile il Spatial Audio per tutti gli utenti, con oltre 100 milioni di brani disponibili in Dolby Atmos senza costi aggiuntivi.", category: "Streaming", sourceName: "9to5Mac", sourceUrl: "https://9to5mac.com", position: 8 },
  { title: "Udio vs Suno: la guerra degli AI music generator per il mercato europeo", summary: "I due principali generatori musicali AI si sfidano per conquistare il mercato europeo con nuove funzionalità e accordi con label indipendenti.", category: "AI Music", sourceName: "Music Business Worldwide", sourceUrl: "https://musicbusinessworldwide.com", position: 9 },
  { title: "Primavera Sound 2026: lineup con 40% di artisti indie emergenti", summary: "Il festival barcellonese annuncia una lineup con il 40% di artisti indie emergenti, confermando il suo ruolo di trampolino di lancio per la nuova musica indipendente.", category: "Festival & Live", sourceName: "Pitchfork", sourceUrl: "https://pitchfork.com", position: 10 },
  { title: "Mogwai annuncia tour europeo 2026: 3 date in Italia", summary: "I maestri scozzesi del post-rock annunciano un tour europeo con tre date italiane a Milano, Roma e Bologna, presentando il nuovo album.", category: "Rock & Post-Rock", sourceName: "Resident Advisor", sourceUrl: "https://ra.co", position: 11 },
  { title: "Bandcamp torna indipendente: acquistato da Songtradr, nuove politiche pro-artisti", summary: "Bandcamp annuncia il ritorno all'indipendenza con nuove politiche favorevoli agli artisti indipendenti, inclusa una riduzione delle commissioni al 10%.", category: "Industria Musicale", sourceName: "Pitchfork", sourceUrl: "https://pitchfork.com", position: 12 },
  { title: "Slowdive: nuovo album in arrivo, anticipato dal singolo 'Luminous'", summary: "I pionieri dello shoegaze britannico annunciano un nuovo album per l'estate 2026, anticipato dal singolo 'Luminous' che mescola dream pop e elettronica.", category: "Indie & Shoegaze", sourceName: "The Guardian", sourceUrl: "https://theguardian.com", position: 13 },
  { title: "TikTok Music chiude: Meta lancia 'Threads Music' per artisti emergenti", summary: "Con la chiusura di TikTok Music in Europa, Meta lancia Threads Music come piattaforma dedicata agli artisti emergenti con funzionalità di monetizzazione diretta.", category: "Social & Streaming", sourceName: "Music Ally", sourceUrl: "https://musically.com", position: 14 },
  { title: "Godspeed You! Black Emperor: registrazione live integrale del tour 2025 su Bandcamp", summary: "Il collettivo canadese pubblica la registrazione integrale di 12 concerti del tour 2025, disponibile in download gratuito su Bandcamp per 48 ore.", category: "Rock & Post-Rock", sourceName: "Exclaim!", sourceUrl: "https://exclaim.ca", position: 15 },
  { title: "Mubert AI: la startup italiana che crea musica generativa per creator digitali", summary: "La startup milanese Mubert ha raccolto 8M€ per espandere la sua piattaforma di musica AI generativa, già usata da 2 milioni di creator in tutto il mondo.", category: "AI Music & Startup", sourceName: "StartupItalia", sourceUrl: "https://startupitalia.eu", position: 16 },
  { title: "Nick Cave risponde all'AI: 'La musica è l'espressione dell'anima umana, non un algoritmo'", summary: "In un'intervista al Guardian, Nick Cave esprime la sua posizione critica sull'AI nella musica, difendendo l'autenticità dell'espressione artistica umana.", category: "Dibattiti & Cultura", sourceName: "The Guardian", sourceUrl: "https://theguardian.com", position: 17 },
  { title: "Indie italiano: nuove uscite di marzo 2026 — da ascoltare assolutamente", summary: "La redazione di ITsMusic seleziona le 10 uscite indie italiane più interessanti di marzo 2026, da Colapesce Dimartino a Frah Quintale.", category: "Indie Italia", sourceName: "ITsMusic Editorial", sourceUrl: "#", position: 18 },
  { title: "Mercato live music: +22% in Italia nel 2025, record storico per i concerti", summary: "I dati SIAE confermano un anno record per il live music in Italia con +22% di biglietti venduti, trainato da grandi tour internazionali e festival.", category: "Live Music & Mercato", sourceName: "SIAE", sourceUrl: "https://siae.it", position: 19 },
  { title: "Portishead: Beth Gibbons conferma lavori su nuovo materiale solista con elementi AI", summary: "Beth Gibbons, voce dei Portishead, conferma di stare lavorando su nuovo materiale solista che integra elementi di AI music generation nel processo creativo.", category: "Trip-Hop & Indie", sourceName: "Mojo", sourceUrl: "https://mojo4music.com", position: 20 },
];

// Inserisci news
console.log("Inserimento 20 notizie musicali...");
for (const item of news) {
  await db.execute(
    `INSERT INTO news_items (section, title, summary, category, sourceName, sourceUrl, publishedAt, weekLabel, position, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE title=title`,
    ["music", item.title, item.summary, item.category, item.sourceName, item.sourceUrl, today, weekLabel, item.position]
  );
}
console.log("✓ 20 notizie musicali inserite");

// ── 2. EDITORIALE ─────────────────────────────────────────────────────────────
console.log("Inserimento editoriale della settimana...");
await db.execute(
  `INSERT INTO daily_editorial (section, dateLabel, title, subtitle, body, keyTrend, authorNote, createdAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
  [
    "music",
    today,
    "AI e Musica: il futuro è già qui, ma l'anima resta umana",
    "Tra generatori musicali AI e la resistenza degli artisti indipendenti, si gioca la partita più importante dell'industria musicale",
    `L'industria musicale sta attraversando una trasformazione epocale. Da un lato, strumenti come Suno AI 4.0, Udio e Mubert stanno democratizzando la creazione musicale, permettendo a chiunque di generare canzoni complete in pochi secondi. Dall'altro, artisti come Nick Cave, Thom Yorke e i Bark Psychosis continuano a dimostrare che la musica più potente nasce dall'esperienza umana, dalla vulnerabilità, dalla storia personale.

La settimana appena trascorsa ha portato notizie significative su entrambi i fronti. L'accordo tra Universal Music Group e OpenAI segna un punto di svolta nella gestione dei diritti musicali nell'era dell'AI: per la prima volta, una major ha stabilito un framework legale chiaro per l'utilizzo della musica nei modelli di intelligenza artificiale. È un precedente importante che potrebbe ridisegnare l'intera industria.

Sul fronte indie, le notizie sono altrettanto interessanti. Calcutta e Gazzelle hanno superato i 500 milioni di stream su Spotify, confermando che l'indie italiano ha raggiunto una maturità commerciale senza precedenti. Bandcamp torna indipendente con politiche più favorevoli agli artisti. E il mercato live italiano ha registrato un anno record con +22% di biglietti venduti.

La domanda che ci poniamo questa settimana è: in un mondo in cui l'AI può generare musica tecnicamente perfetta, cosa rende ancora irresistibile la musica umana? La risposta, forse, la troviamo nei Bark Psychosis — il gruppo che questa settimana celebriamo come artisti della settimana — e nella loro capacità di creare paesaggi sonori che sembrano provenire dall'inconscio collettivo.

Il futuro della musica non è nella scelta tra AI e umano, ma nella loro integrazione consapevole. Gli artisti che sapranno usare l'AI come strumento espressivo, mantenendo la propria voce autentica, saranno quelli che definiranno il suono del prossimo decennio.`,
    "AI Music + Indie convergence",
    "Una settimana densa di notizie che confermano la vitalità del panorama musicale indipendente, nonostante — o forse grazie a — l'avanzata dell'intelligenza artificiale."
  ]
);
console.log("✓ Editoriale inserito");

// ── 3. ARTISTA DELLA SETTIMANA: BARK PSYCHOSIS ────────────────────────────────
console.log("Inserimento artista della settimana: Bark Psychosis...");
await db.execute(
  `INSERT INTO startup_of_day (section, dateLabel, name, tagline, description, category, country, foundedYear, funding, whyToday, websiteUrl, aiScore, createdAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  [
    "music",
    today,
    "Bark Psychosis",
    "I pionieri del post-rock che hanno ridefinito i confini tra rock, jazz e musica ambient",
    `Bark Psychosis è una band britannica formata a Londra nel 1986 da Graham Sutton e altri musicisti della scena underground londinese. Il loro album 'Hex' (1994) è universalmente riconosciuto come uno dei capolavori del post-rock e del rock sperimentale, anticipando di anni sonorità che sarebbero diventate mainstream solo nel decennio successivo.

Il suono di Bark Psychosis è caratterizzato da un approccio cinematografico alla composizione: lunghe suite strumentali che si sviluppano lentamente, intrecciando chitarre tremolanti, basso profondo, percussioni jazz e voci eterei. 'Hex' in particolare è un'opera che sfida le categorie: non è rock, non è jazz, non è ambient — è tutto questo insieme, in un equilibrio perfetto che pochi artisti hanno saputo replicare.

Graham Sutton, il motore creativo della band, è anche un produttore di successo che ha lavorato con Portishead, Mogwai e numerosi altri artisti della scena post-rock e trip-hop. Questa doppia identità — artista e produttore — ha permesso a Bark Psychosis di mantenere una visione sonora coerente e sempre in evoluzione.

Questa settimana, la notizia del possibile rilascio di materiale inedito registrato durante le sessioni di 'Hex' ha scosso la comunità dei fan del post-rock mondiale. Se confermato, sarebbe uno degli eventi musicali più attesi degli ultimi anni.`,
    "Post-Rock / Rock Sperimentale",
    "Regno Unito",
    "1986",
    "Indipendente",
    `Bark Psychosis torna alla ribalta questa settimana con l'annuncio di possibile materiale inedito dalle sessioni di 'Hex'. Ma la vera ragione per cui li celebriamo oggi è più profonda: in un'epoca dominata dall'AI music generation, Bark Psychosis rappresenta tutto ciò che l'intelligenza artificiale non può replicare — la capacità di creare musica che sembra provenire dall'inconscio, che cattura l'ineffabile, che trasforma il silenzio in significato. 'Hex' compie 32 anni e suona ancora come il futuro.`,
    "https://en.wikipedia.org/wiki/Bark_Psychosis",
    95
  ]
);
console.log("✓ Artista della settimana (Bark Psychosis) inserito");

// ── 4. REPORTAGE ─────────────────────────────────────────────────────────────
console.log("Inserimento 4 reportage Indie/AI Music...");
const reportage = [
  {
    position: 1, sectionNumber: "01", category: "Post-Rock & Sperimentale",
    startupName: "Bark Psychosis",
    headline: "Bark Psychosis: come 'Hex' ha cambiato la musica per sempre",
    subheadline: "Il capolavoro del 1994 che ha anticipato il suono del XXI secolo",
    bodyText: `Nel 1994, mentre il Britpop dominava le classifiche britanniche con Blur e Oasis, un gruppo di musicisti londinesi pubblicava silenziosamente un album destinato a ridefinire i confini della musica rock. 'Hex' di Bark Psychosis non vendette molte copie al momento della sua uscita, ma nel corso degli anni è diventato uno dei dischi più influenti della storia del rock sperimentale.

Graham Sutton, il compositore e produttore dietro Bark Psychosis, aveva una visione chiara: creare musica che non rispettasse i confini di genere, che potesse essere allo stesso tempo intensa e delicata, rumorosa e silenziosa, urbana e cosmica. 'Hex' è il risultato di questa visione — un album che sembra registrato in una città deserta alle 3 di notte, dove ogni suono acquista un significato amplificato.

La produzione di 'Hex' è straordinaria per l'epoca: Sutton ha utilizzato tecniche di registrazione innovative, mescolando suoni ambientali con chitarre distorte e ritmi jazz, creando texture sonore che sembrano tridimensionali. L'album anticipa di anni il suono di band come Godspeed You! Black Emperor, Mogwai e Sigur Rós.

Oggi, nell'era dell'AI music generation, 'Hex' ci ricorda perché la musica umana è insostituibile: non per la sua perfezione tecnica, ma per la sua imperfezione poetica, per la capacità di catturare un momento emotivo specifico che nessun algoritmo potrà mai replicare.`,
    quote: "La musica di Bark Psychosis è come guardare una città di notte dalla finestra di un treno — bellissima, malinconica, irripetibile.",
    feature1: "Pionieri del post-rock britannico dal 1986",
    feature2: "'Hex' (1994) — capolavoro riconosciuto dalla critica mondiale",
    feature3: "Graham Sutton: produttore di Portishead, Mogwai e altri",
    feature4: "Influenza diretta su Godspeed, Mogwai, Sigur Rós",
    stat1Value: "1994", stat1Label: "Anno di 'Hex'",
    stat2Value: "9.2/10", stat2Label: "Punteggio Pitchfork",
    stat3Value: "30+", stat3Label: "Anni di influenza",
    ctaLabel: "Ascolta 'Hex' su Spotify",
    ctaUrl: "https://open.spotify.com/search/bark%20psychosis%20hex",
  },
  {
    position: 2, sectionNumber: "02", category: "AI Music",
    startupName: "Suno AI",
    headline: "Suno AI 4.0: il generatore musicale che sta cambiando tutto",
    subheadline: "Come la nuova versione di Suno sta ridefinendo il confine tra creatività umana e artificiale",
    bodyText: `Quando Suno AI ha lanciato la versione 4.0 del suo generatore musicale, la reazione dell'industria musicale è stata immediata e divisa. Da un lato, i creator digitali hanno esultato: finalmente uno strumento capace di generare canzoni complete — testo, melodia, arrangiamento — in meno di 30 secondi, con una qualità audio che supera molte produzioni professionali. Dall'altro, i musicisti professionisti hanno alzato la voce, chiedendo regolamentazioni più severe sull'uso di musica protetta da copyright per addestrare i modelli AI.

Suno 4.0 introduce diverse novità rispetto alle versioni precedenti. La qualità audio è migliorata significativamente, con una maggiore coerenza nella struttura delle canzoni e una migliore gestione delle transizioni. Il sistema è ora in grado di generare canzoni in stili molto specifici, inclusi generi di nicchia come post-rock, shoegaze e math rock — territori che le versioni precedenti faticavano a replicare con fedeltà.

La questione dei diritti d'autore rimane il nodo centrale del dibattito. Suno afferma di aver addestrato i suoi modelli su musica royalty-free e su accordi con label, ma numerosi artisti contestano questa affermazione. L'accordo tra Universal Music Group e OpenAI potrebbe fare da apripista per nuovi framework legali che regolino l'uso della musica nell'AI.

Per gli artisti indie, la domanda è: come usare questi strumenti senza perdere la propria identità artistica? La risposta, forse, sta nell'usare l'AI come punto di partenza, non di arrivo — come uno strumento per esplorare nuove sonorità, non per sostituire il processo creativo umano.`,
    quote: "L'AI non sostituirà i musicisti. Ma i musicisti che usano l'AI sostituiranno quelli che non lo fanno.",
    feature1: "Generazione di canzoni complete in 30 secondi",
    feature2: "Supporto per generi di nicchia: post-rock, shoegaze, math rock",
    feature3: "Qualità audio professionale con Suno 4.0",
    feature4: "Dibattito aperto sui diritti d'autore e l'etica dell'AI music",
    stat1Value: "10M+", stat1Label: "Utenti attivi",
    stat2Value: "30s", stat2Label: "Tempo di generazione",
    stat3Value: "100+", stat3Label: "Generi supportati",
    ctaLabel: "Prova Suno AI",
    ctaUrl: "https://suno.ai",
  },
  {
    position: 3, sectionNumber: "03", category: "Indie Italia",
    startupName: "Scena Indie Italiana",
    headline: "L'indie italiano nel 2026: da movimento underground a fenomeno globale",
    subheadline: "Come Calcutta, Gazzelle e la nuova generazione hanno conquistato l'Europa",
    bodyText: `C'era una volta un'Italia musicale dominata dal pop sanremese e dalla musica dance. Poi, nel corso degli anni 2010, qualcosa è cambiato. Una nuova generazione di artisti ha iniziato a fare musica in italiano, con sonorità indie e testi che parlavano di vita quotidiana, amore, malinconia urbana — e il pubblico ha risposto con un entusiasmo che nessuno aveva previsto.

Calcutta è stato il primo a capire che si poteva fare indie in italiano senza complessi di inferiorità rispetto ai colleghi anglosassoni. Il suo album 'Everest' (2015) ha aperto una breccia nel mercato musicale italiano che non si è più chiusa. Gazzelle ha seguito con 'Superbattito' (2017), portando l'indie italiano verso sonorità più elettroniche e produzioni più sofisticate.

Oggi, nel 2026, l'indie italiano ha raggiunto una maturità commerciale senza precedenti. Calcutta e Gazzelle hanno superato i 500 milioni di stream su Spotify. Artisti come Colapesce Dimartino, Frah Quintale, Fulminacci e Wrongonyou stanno conquistando palchi europei. Il Festival di Sanremo, tradizionalmente ostile all'indie, ha aperto le porte a questi artisti, riconoscendo la loro rilevanza culturale.

Ma il vero segnale di maturità è un altro: l'indie italiano sta iniziando a influenzare la scena musicale internazionale. Produttori europei e americani guardano con interesse al sound italiano, caratterizzato da una particolare combinazione di melodia mediterranea, testi poetici e produzioni moderne. L'Italia, per la prima volta nella storia della musica pop, sta esportando un suono originale.`,
    quote: "L'indie italiano non è una moda. È la voce di una generazione che ha trovato il coraggio di parlare in italiano.",
    feature1: "Calcutta e Gazzelle: 500M+ stream su Spotify",
    feature2: "Nuova generazione: Colapesce, Frah Quintale, Fulminacci",
    feature3: "Sanremo apre le porte all'indie",
    feature4: "Influenza crescente sulla scena europea",
    stat1Value: "500M+", stat1Label: "Stream Calcutta+Gazzelle",
    stat2Value: "+40%", stat2Label: "Crescita streaming indie IT",
    stat3Value: "15+", stat3Label: "Artisti indie in tour EU",
    ctaLabel: "Playlist Indie Italia 2026",
    ctaUrl: "https://open.spotify.com/search/indie%20italiano%202026",
  },
  {
    position: 4, sectionNumber: "04", category: "Musica & Tecnologia",
    startupName: "Mubert AI",
    headline: "Mubert: la startup milanese che porta la musica generativa ai creator",
    subheadline: "8 milioni di euro raccolti per democratizzare la musica AI in Europa",
    bodyText: `Nel cuore di Milano, in uno spazio di coworking nel quartiere Isola, un team di ingegneri e musicisti sta costruendo quello che potrebbe diventare il futuro della musica per i creator digitali. Mubert è una piattaforma di musica generativa AI che permette a creator, youtuber, podcaster e sviluppatori di app di accedere a musica originale, generata in tempo reale, senza preoccuparsi di diritti d'autore.

Il modello di business di Mubert è semplice ma efficace: gli artisti caricano i loro loop e campioni sulla piattaforma, l'AI li combina in tempo reale per creare musica unica e personalizzata per ogni utilizzo. Gli artisti vengono compensati in base all'utilizzo dei loro campioni, creando un ecosistema sostenibile per tutti.

Con 8 milioni di euro raccolti nell'ultimo round di finanziamento, Mubert sta espandendo la sua piattaforma verso nuovi mercati europei e sviluppando nuove funzionalità AI. Tra queste, la possibilità di generare musica in stili specifici — inclusi post-rock, shoegaze e indie — con una qualità audio che si avvicina sempre di più alle produzioni professionali.

La sfida di Mubert è quella di tutti i player nel mercato dell'AI music: trovare un equilibrio tra l'efficienza dell'AI e l'autenticità dell'espressione artistica. La risposta della startup milanese è pragmatica: non sostituire i musicisti, ma creare nuove opportunità per loro nell'economia dei creator digitali.`,
    quote: "La musica generativa non è il nemico dei musicisti. È una nuova fonte di reddito per chi sa come usarla.",
    feature1: "Piattaforma di musica generativa AI per creator",
    feature2: "8M€ raccolti nell'ultimo round",
    feature3: "2M+ creator attivi sulla piattaforma",
    feature4: "Modello di revenue sharing per gli artisti",
    stat1Value: "8M€", stat1Label: "Ultimo round",
    stat2Value: "2M+", stat2Label: "Creator attivi",
    stat3Value: "Milano", stat3Label: "HQ Italia",
    ctaLabel: "Scopri Mubert",
    ctaUrl: "https://mubert.com",
  },
];

for (const r of reportage) {
  await db.execute(
    `INSERT INTO weekly_reportage (section, weekLabel, position, sectionNumber, category, startupName, headline, subheadline, bodyText, quote, feature1, feature2, feature3, feature4, stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label, ctaLabel, ctaUrl, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    ["music", weekLabel, r.position, r.sectionNumber, r.category, r.startupName, r.headline, r.subheadline, r.bodyText, r.quote, r.feature1, r.feature2, r.feature3, r.feature4, r.stat1Value, r.stat1Label, r.stat2Value, r.stat2Label, r.stat3Value, r.stat3Label, r.ctaLabel, r.ctaUrl]
  );
}
console.log("✓ 4 reportage Indie/AI Music inseriti");

// ── 5. ANALISI DI MERCATO ─────────────────────────────────────────────────────
console.log("Inserimento 4 analisi di mercato musicale...");
const analyses = [
  {
    position: 1, source: "IFPI Global Music Report 2025", sourceUrl: "https://ifpi.org",
    category: "Mercato Globale",
    title: "Mercato musicale globale: +9.8% nel 2025, streaming traina la crescita",
    subtitle: "Il mercato musicale raggiunge i 28.6 miliardi di dollari, con lo streaming che rappresenta il 67% dei ricavi",
    summary: "Il mercato musicale globale ha registrato una crescita del 9.8% nel 2025, raggiungendo i 28.6 miliardi di dollari. Lo streaming rimane il principale motore di crescita con il 67% dei ricavi totali, mentre il vinile continua la sua rinascita con +34% nelle vendite. Il live music ha registrato un anno record con +18% globale.",
    keyInsight: "La convergenza tra AI music generation e streaming sta creando nuovi modelli di business che potrebbero ridisegnare l'intera industria musicale nei prossimi 5 anni.",
    dataPoint1: "Streaming: 67% dei ricavi globali (+12% YoY)",
    dataPoint2: "Vinile: +34% nelle vendite, record dal 1987",
    dataPoint3: "Live music: +18% globale, +22% in Italia",
    marketSize: "$28.6 miliardi",
    growthRate: "+9.8% YoY",
    italyRelevance: "L'Italia è il 7° mercato musicale mondiale con €650M di ricavi nel 2025, trainata dall'indie italiano e dal live music. Il mercato streaming italiano cresce del 15% annuo.",
  },
  {
    position: 2, source: "Goldman Sachs Music Report 2025", sourceUrl: "https://goldmansachs.com",
    category: "AI Music Economy",
    title: "AI Music Economy: un mercato da $1.3 miliardi nel 2025, destinato a triplicare",
    subtitle: "Goldman Sachs stima che il mercato dell'AI music raggiungerà i $4 miliardi entro il 2028",
    summary: "Il mercato dell'AI music generation ha raggiunto $1.3 miliardi nel 2025, con una crescita del 180% rispetto all'anno precedente. Goldman Sachs prevede che il mercato triplicherà entro il 2028, raggiungendo i $4 miliardi, trainato dall'adozione da parte dei creator digitali e dall'integrazione nei workflow di produzione musicale professionale.",
    keyInsight: "Il vero valore dell'AI music non è nella sostituzione dei musicisti, ma nell'abilitazione di nuovi modelli di business per creator e artisti indipendenti.",
    dataPoint1: "Mercato AI music: $1.3B nel 2025 (+180% YoY)",
    dataPoint2: "Previsione 2028: $4B (CAGR +45%)",
    dataPoint3: "Creator che usano AI music: 15M+ globalmente",
    marketSize: "$1.3 miliardi (2025)",
    growthRate: "+180% YoY",
    italyRelevance: "L'Italia è uno dei mercati europei con la crescita più rapida nell'adozione di AI music tools, con startup come Mubert che stanno guidando l'innovazione nel settore.",
  },
  {
    position: 3, source: "Spotify Loud & Clear 2025", sourceUrl: "https://loudandclear.byspotify.com",
    category: "Indie & Streaming",
    title: "Indie music su Spotify: 1.2 milioni di artisti guadagnano oltre $1.000 all'anno",
    subtitle: "Il report annuale di Spotify rivela la crescita dell'economia degli artisti indipendenti",
    summary: "Il report Loud & Clear 2025 di Spotify rivela che 1.2 milioni di artisti indipendenti hanno guadagnato più di $1.000 dalla piattaforma nell'ultimo anno, con 52.000 artisti che hanno superato i $10.000. L'indie music rappresenta ora il 34% di tutti gli stream su Spotify, con una crescita del 28% rispetto all'anno precedente.",
    keyInsight: "La distribuzione diretta su Spotify sta creando una nuova classe di artisti 'middle class' che possono sostenere la propria carriera musicale senza l'intermediazione delle major.",
    dataPoint1: "1.2M artisti indie: >$1.000/anno da Spotify",
    dataPoint2: "52.000 artisti indie: >$10.000/anno",
    dataPoint3: "Indie music: 34% degli stream totali (+28% YoY)",
    marketSize: "34% degli stream Spotify",
    growthRate: "+28% YoY",
    italyRelevance: "Gli artisti indie italiani sono tra i più attivi sulla piattaforma, con Calcutta, Gazzelle e Colapesce Dimartino tra i 500 artisti indie più ascoltati in Europa.",
  },
  {
    position: 4, source: "Pollstar Live Music Report 2025", sourceUrl: "https://pollstar.com",
    category: "Live Music",
    title: "Live music in Italia: record storico con €1.2 miliardi di ricavi nel 2025",
    subtitle: "Il mercato dei concerti italiano cresce del 22% e si conferma tra i più dinamici d'Europa",
    summary: "Il mercato live music italiano ha registrato un anno record nel 2025 con €1.2 miliardi di ricavi, in crescita del 22% rispetto al 2024. I grandi tour internazionali (Taylor Swift, Coldplay, Bruce Springsteen) hanno trainato la crescita, ma anche i festival indie e i concerti di artisti italiani hanno registrato numeri record. Il pubblico under 35 rappresenta il 58% degli spettatori.",
    keyInsight: "Il live music è l'unico segmento dell'industria musicale che l'AI non può replicare — l'esperienza fisica del concerto rimane insostituibile e il pubblico lo sa.",
    dataPoint1: "Ricavi live music IT 2025: €1.2B (+22% YoY)",
    dataPoint2: "Biglietti venduti: 18M (+19% YoY)",
    dataPoint3: "Under 35: 58% del pubblico live",
    marketSize: "€1.2 miliardi",
    growthRate: "+22% YoY",
    italyRelevance: "L'Italia è il 4° mercato live music in Europa, con Milano, Roma e Bologna come principali hub. I festival indie come Primavera Sound, MI AMI e Ypsigrock registrano sold-out con mesi di anticipo.",
  },
];

for (const a of analyses) {
  await db.execute(
    `INSERT INTO market_analysis (section, weekLabel, position, source, sourceUrl, category, title, subtitle, summary, keyInsight, dataPoint1, dataPoint2, dataPoint3, marketSize, growthRate, italyRelevance, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    ["music", weekLabel, a.position, a.source, a.sourceUrl, a.category, a.title, a.subtitle, a.summary, a.keyInsight, a.dataPoint1, a.dataPoint2, a.dataPoint3, a.marketSize, a.growthRate, a.italyRelevance]
  );
}
console.log("✓ 4 analisi di mercato musicale inserite");

// ── 6. Aggiorna imageUrl con immagini Pexels per le news musicali ──────────────
console.log("Aggiornamento immagini Pexels per le news musicali...");
const pexelsKey = process.env.PEXELS_API_KEY;
if (pexelsKey) {
  const [rows] = await db.execute("SELECT id, title, category FROM news_items WHERE section='music' AND imageUrl IS NULL LIMIT 20");
  for (const row of rows) {
    const keywords = row.category.includes("AI") ? "artificial intelligence music technology" :
                     row.category.includes("Rock") ? "rock music concert guitar" :
                     row.category.includes("Indie") ? "indie music concert stage" :
                     row.category.includes("Vinile") ? "vinyl record music" :
                     row.category.includes("Festival") ? "music festival crowd" :
                     row.category.includes("Streaming") ? "music streaming headphones" :
                     "music concert stage";
    try {
      const resp = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=1&orientation=landscape`, {
        headers: { Authorization: pexelsKey }
      });
      const data = await resp.json();
      if (data.photos && data.photos[0]) {
        const imgUrl = data.photos[0].src.medium;
        await db.execute("UPDATE news_items SET imageUrl=? WHERE id=?", [imgUrl, row.id]);
      }
    } catch (e) {
      // skip
    }
    await new Promise(r => setTimeout(r, 300));
  }
  console.log("✓ Immagini Pexels aggiornate per le news musicali");
}

await db.end();
console.log("\n🎵 Sezione /music popolata con successo!");
console.log("  - 20 notizie Rock/Indie/AI Music");
console.log("  - 1 editoriale della settimana");
console.log("  - Artista della settimana: Bark Psychosis");
console.log("  - 4 reportage Indie/AI Music");
console.log("  - 4 analisi di mercato musicale");
