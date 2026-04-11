/**
 * Newsletter Promozionale A) ProofPress Business
 * Invio: martedì, venerdì, sabato alle 15:00 CET
 * Target: tutta la mailing list
 * Oggetto: alternato tra Creator, Editori, Aziende (rotazione per giorno della settimana)
 * Design: Apple-style — SF Francisco, sfondo bianco/grigio chiaro, layout ampio
 */

import { getDb, getActiveSubscribers } from "./db";
import { sendEmail } from "./email";

// ─── Guard anti-duplicati DB-based ─────────────────────────────────────────
async function hasAlreadySentBusinessTodayDB(variant: string): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { newsletterSends } = await import("../drizzle/schema");
  const { and, gte, lte, like, eq } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) return false;
  const existing = await db
    .select()
    .from(newsletterSends)
    .where(
      and(
        like(newsletterSends.subject, `%ProofPress Business%${variant}%`),
        eq(newsletterSends.status, "sent"),
        gte(newsletterSends.createdAt, todayStart),
        lte(newsletterSends.createdAt, todayEnd)
      )
    )
    .limit(1);

  return existing.length > 0 && (existing[0].recipientCount ?? 0) > 0;
}

// ─── Determina la variante in base al giorno della settimana ───────────────
export function getBusinessVariant(dayOfWeek?: number): "creator" | "editori" | "aziende" {
  const day = dayOfWeek ?? new Date().getDay();
  if (day === 2) return "creator";
  if (day === 5) return "editori";
  return "aziende";
}

// ─── Template HTML — Apple Style COMPLETO ────────────────────────────────
export function buildBusinessNewsletterHtml(variant: "creator" | "editori" | "aziende"): string {

  const FONT = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`;
  const BG = `#f5f5f7`;
  const WHITE = `#ffffff`;
  const BLACK = `#1d1d1f`;
  const SLATE = `#6e6e73`;
  const MUTED = `#86868b`;
  const BORDER = `#d2d2d7`;
  const BLUE = `#0071e3`;
  const GREEN = `#34c759`;
  const ORANGE = `#ff9f0a`;

  const configs = {
    creator: {
      tag: "Per Creator & Giornalisti",
      tagColor: BLUE,
      accentHex: BLUE,
      headline: "La tua testata.\nLa tua firma.\nZero redazione.",
      subheadline: "Hai il talento. Non hai le 16 ore al giorno per gestire tutto il resto.",
      problemTitle: "Il problema che nessuno ti dice",
      problemBody: `Fare giornalismo o content creation nel 2025 non è mai stato così difficile — non per mancanza di talento, ma per mancanza di tempo. Monitorare le fonti richiede 2 ore al giorno. Scrivere un pezzo decente altre 2. Verificare i dati, formattare, pubblicare, distribuire, gestire la newsletter — altre 3. Moltiplica per 5 giorni e hai un lavoro full-time che produce 5 articoli.

Il paradosso è questo: più sei bravo, più ti viene chiesto. E più ti viene chiesto, meno tempo hai per fare il lavoro bene. I creator che crescono non sono quelli che lavorano di più — sono quelli che hanno trovato un sistema.

ProofPress è quel sistema. Non un tool in più da imparare. Non un'altra app da gestire. Una redazione AI autonoma che lavora mentre tu dormi, viaggi o pensi alla prossima storia che vale davvero la pena raccontare.`,
      beforeAfter: [
        { before: "4 ore al giorno per raccogliere notizie da 50+ fonti", after: "20 minuti per revisionare e approvare ciò che l'AI ha già selezionato" },
        { before: "1 articolo al giorno, se tutto va bene", after: "15 contenuti certificati pubblicati ogni giorno con la tua firma" },
        { before: "Newsletter manuale: 3 ore ogni invio", after: "Newsletter automatica: 10 minuti di revisione, poi parte da sola" },
        { before: "Nessun sistema di verifica — ti fidi delle fonti e speri", after: "Badge ProofPress Verify su ogni contenuto — i lettori vedono che è certificato" },
      ],
      stats: [
        { value: "4.000+", label: "Fonti monitorate 24/7" },
        { value: "15×", label: "Contenuti al giorno con 1 persona" },
        { value: "48%", label: "Open rate medio newsletter" },
        { value: "100%", label: "Contenuti certificati ProofPress Verify" },
      ],
      howItWorks: [
        { step: "01", title: "Monitora", desc: "4.000+ fonti analizzate ogni ora. Notizie filtrate per rilevanza, qualità e coerenza con il tuo settore. Nessun rumore, solo segnale." },
        { step: "02", title: "Verifica", desc: "Confronto multi-fonte automatico. L'AI misura coerenza e affidabilità di ogni informazione. Solo i contenuti che superano il controllo ricevono il badge." },
        { step: "03", title: "Genera", desc: "Articoli scritti in italiano, con il tuo tono editoriale. Titoli, sottotitoli, sommari e tag SEO già pronti. Tu revisioni, non riscrivi." },
        { step: "04", title: "Pubblica", desc: "Integrazione diretta con il tuo CMS, newsletter e social. Un click per approvare, tutto il resto è automatico — con il badge ProofPress Verify visibile." },
      ],
      useCases: [
        {
          title: "Newsletter di settore da zero",
          desc: "Luca, giornalista freelance specializzato in AI, ha lanciato la sua newsletter in 3 giorni. ProofPress seleziona le 10 notizie più rilevanti ogni mattina, Luca sceglie le 5 migliori, aggiunge il suo commento e pubblica. In 90 giorni: 2.400 iscritti, open rate 48%, primo sponsor a 90 giorni.",
          metric: "2.400 iscritti in 90 giorni",
        },
        {
          title: "Blog tech da 0 a 15 articoli/giorno",
          desc: "Sara gestisce da sola un blog tech su startup e venture capital. Prima: 2 articoli al giorno, 4 ore di lavoro. Oggi: 15 articoli certificati, 45 minuti di revisione. Il traffico organico è cresciuto del 240% in 6 mesi senza un euro di advertising.",
          metric: "+240% traffico organico in 6 mesi",
        },
        {
          title: "Canale LinkedIn da esperto di settore",
          desc: "Marco, consulente di management, pubblica 3 post LinkedIn al giorno su AI e business. ProofPress seleziona le notizie più rilevanti per il suo pubblico, lui aggiunge il suo punto di vista in 10 minuti. Risultato: da 800 a 12.000 follower in 8 mesi.",
          metric: "Da 800 a 12.000 follower in 8 mesi",
        },
      ],
      testimonials: [
        {
          quote: "Prima impiegavo 4 ore al giorno a raccogliere notizie e scrivere. Oggi impiego 25 minuti per revisionare e pubblicare. Il resto lo fa ProofPress, con la mia firma. La mia newsletter ha raggiunto 2.400 iscritti in 4 mesi con un open rate del 48%.",
          author: "M.R., giornalista freelance specializzato in AI",
          detail: "Newsletter da 2.400 iscritti · Milano · Open rate 48%"
        },
        {
          quote: "Ho lanciato la mia newsletter in 3 giorni. Senza ProofPress ci avrei messo 3 mesi solo per impostare il flusso editoriale. Ora pubblico ogni giorno, ho uno sponsor e guadagno dall'informazione che producevo gratis.",
          author: "L.B., creator tech",
          detail: "1.800 iscritti in 60 giorni · Roma · Primo sponsor al mese 3"
        },
        {
          quote: "Il badge ProofPress Verify ha cambiato come i miei lettori percepiscono i miei contenuti. Non sono più 'un altro blog' — sono una fonte certificata. I lettori condividono di più, si fidano di più, restano più a lungo.",
          author: "G.P., blogger specializzato in startup",
          detail: "Blog da 8.000 lettori mensili · Torino"
        },
      ],
      faq: [
        {
          q: "Devo avere competenze tecniche per usarlo?",
          a: "No. Setup completo in 10 minuti: crei un account, scegli i tuoi canali tematici e ProofPress inizia subito. Se hai già un sito WordPress, Ghost o Substack, la connessione è diretta dalla dashboard — nessun codice."
        },
        {
          q: "I contenuti sembrano davvero scritti da me?",
          a: "Sì, perché li imposti tu. Carichi il tuo stile editoriale, i tuoi esempi, il tuo tono. L'AI impara dal tuo modo di scrivere e produce contenuti coerenti con la tua voce. Tu revisioni e approvi — la firma è sempre la tua."
        },
        {
          q: "Cosa succede se una notizia è falsa o inaccurata?",
          a: "ProofPress non pubblica contenuti non verificati. Il sistema confronta ogni informazione su più fonti indipendenti e assegna un punteggio di affidabilità. Solo i contenuti che superano la soglia ricevono il badge ProofPress Verify. Se una notizia non è verificabile, non viene pubblicata."
        },
        {
          q: "Il costo è giustificato per chi inizia?",
          a: "Un giornalista freelance spende in media 2-3 ore al giorno solo nel monitoraggio delle fonti. A 39€/mese, il costo è inferiore a quello di un'ora di lavoro — e il tempo recuperato si trasforma direttamente in più contenuti, più iscritti e più ricavi."
        },
      ],
      guarantee: "Prova ProofPress gratis per 14 giorni. Nessuna carta di credito richiesta. Se non vedi risultati concreti entro 2 settimane, non ti chiediamo nulla.",
      ctaText: "Inizia gratis — 14 giorni",
      ctaUrl: "https://proofpress.ai/offerta?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_creator",
      altCtaText: "Guarda la demo (5 min)",
      altCtaUrl: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_creator",
      subjectVariants: [
        "ProofPress Business — La tua testata AI. La tua firma. Zero redazione.",
        "ProofPress per Creator — Pubblica 15 articoli al giorno con 1 persona.",
        "ProofPress Creator — Smetti di perdere 4 ore al giorno a raccogliere notizie.",
      ],
    },

    editori: {
      tag: "Per Testate & Editori",
      tagColor: GREEN,
      accentHex: GREEN,
      headline: "Redazione AI autonoma.\n24/7. Certificata.",
      subheadline: "Il tuo CMS aggiornato ogni ora. Con badge di verifica visibile ai lettori.",
      problemTitle: "Il problema che le testate non possono più ignorare",
      problemBody: `Le testate che non adottano l'AI oggi rischiano di perdere rilevanza domani. Non è una previsione — è già successo. Mentre le redazioni tradizionali producono 5 articoli al giorno con 3 giornalisti, le testate che usano ProofPress ne producono 20 con lo stesso team.

Il problema non è la qualità dei tuoi giornalisti. Il problema è il volume. I lettori si aspettano aggiornamenti in tempo reale, copertura completa, contenuti verificati. E lo si aspettano da te, non da un aggregatore anonimo.

ProofPress non sostituisce la tua redazione. La amplifica. I tuoi giornalisti si concentrano su inchieste, interviste e analisi — il lavoro che solo loro sanno fare. L'AI gestisce il flusso quotidiano di notizie certificate, con il tuo template, il tuo tono, il tuo brand.`,
      beforeAfter: [
        { before: "5 articoli al giorno con 3 giornalisti", after: "20 notizie certificate al giorno con lo stesso team" },
        { before: "Nessun sistema di verifica visibile ai lettori", after: "Badge ProofPress Verify su ogni articolo — segnale di affidabilità misurabile" },
        { before: "CMS aggiornato 2-3 volte al giorno", after: "CMS aggiornato ogni ora, 24/7, anche nei weekend" },
        { before: "I giornalisti perdono tempo su notizie di routine", after: "Il team si concentra su inchieste e contenuti ad alto valore" },
      ],
      stats: [
        { value: "20×", label: "Articoli al giorno con lo stesso team" },
        { value: "+34%", label: "Tempo medio di lettura con badge Verify" },
        { value: "+22%", label: "Tasso di ritorno dei lettori" },
        { value: "24/7", label: "Produzione automatica certificata" },
      ],
      howItWorks: [
        { step: "01", title: "Integrazione CMS", desc: "Connessione diretta al tuo CMS (WordPress, Ghost, custom API). Articoli pubblicati automaticamente con il tuo template editoriale, categorie e tag." },
        { step: "02", title: "Monitoraggio fonti", desc: "4.000+ fonti analizzate ogni ora. Solo le notizie rilevanti per il tuo settore, filtrate per qualità e coerenza con la tua linea editoriale." },
        { step: "03", title: "Certificazione", desc: "Ogni articolo riceve un hash crittografico ProofPress Verify. Il badge è visibile ai lettori — segnale tangibile di affidabilità che aumenta la fiducia." },
        { step: "04", title: "Amplificazione", desc: "Il tuo team approva, modifica o pubblica con un click. I giornalisti si concentrano su inchieste e interviste — il lavoro che crea valore reale." },
      ],
      useCases: [
        {
          title: "Testata B2B finanza e startup",
          desc: "Una testata specializzata in finanza e startup ha integrato ProofPress nel proprio CMS. Prima: 5 articoli al giorno, 3 giornalisti, aggiornamento manuale. Oggi: 20 notizie certificate al giorno, stesso team, CMS aggiornato ogni ora. Il badge ProofPress Verify ha aumentato il tempo medio di lettura del 34%.",
          metric: "+34% tempo medio di lettura",
        },
        {
          title: "Media group con 3 testate verticali",
          desc: "Un gruppo editoriale con 3 testate verticali (tech, finanza, startup) usa ProofPress per gestire il flusso di notizie su tutti e 3 i canali. Un solo editor supervisiona l'output AI di tutte e 3 le testate. Costo di produzione ridotto del 60%, qualità aumentata.",
          metric: "-60% costo di produzione",
        },
        {
          title: "Newsletter B2B da 12.000 iscritti",
          desc: "Una newsletter B2B specializzata ha integrato ProofPress per la produzione quotidiana. Il tasso di ritorno degli iscritti è aumentato del 22% da quando il badge ProofPress Verify è visibile in ogni email. Gli inserzionisti pagano il 35% in più per il posizionamento 'certificato'.",
          metric: "+35% valore spazi pubblicitari",
        },
      ],
      testimonials: [
        {
          quote: "Pubblichiamo 20 notizie certificate al giorno senza aver aumentato l'organico. Il badge ProofPress Verify ha cambiato come i lettori percepiscono la nostra affidabilità. Il tempo medio di lettura è aumentato del 34%.",
          author: "Direttore editoriale, testata B2B finanza e startup",
          detail: "45.000 lettori mensili · Nord Italia · +34% tempo di lettura"
        },
        {
          quote: "I nostri giornalisti non perdono più tempo sulle notizie di routine. Si concentrano su inchieste e analisi. La qualità del lavoro editoriale è aumentata, non diminuita. E produciamo 4 volte di più.",
          author: "Caporedattore, media group tecnologia",
          detail: "3 testate verticali · 80.000 lettori totali"
        },
        {
          quote: "Gli inserzionisti ci chiedono specificamente il posizionamento 'certificato ProofPress'. Pagano il 35% in più per associare il loro brand a contenuti verificati. Il badge non è solo credibilità — è revenue.",
          author: "Head of Digital, media group",
          detail: "Newsletter da 12.000 iscritti · +35% CPM"
        },
      ],
      faq: [
        {
          q: "Quanto tempo richiede l'integrazione con il nostro CMS?",
          a: "L'integrazione con WordPress e Ghost richiede meno di 30 minuti. Per CMS custom, forniamo API documentate e supporto tecnico dedicato. Il team di onboarding ti segue passo dopo passo nella prima settimana."
        },
        {
          q: "I contenuti AI rispettano la nostra linea editoriale?",
          a: "Sì. Nella fase di setup carichi il tuo manuale di stile, esempi di articoli, tono e vincoli editoriali. L'AI produce contenuti coerenti con la tua identità. Ogni articolo passa attraverso la tua coda di approvazione prima della pubblicazione."
        },
        {
          q: "Come funziona il badge ProofPress Verify?",
          a: "Ogni articolo riceve un hash crittografico univoco che certifica la fonte, la data di verifica e il punteggio di affidabilità. I lettori possono cliccare sul badge per vedere il dettaglio della verifica. È un segnale di trasparenza misurabile — non un'etichetta decorativa."
        },
        {
          q: "Cosa succede se l'AI pubblica qualcosa di inesatto?",
          a: "ProofPress non pubblica senza approvazione umana. Ogni contenuto passa attraverso la tua coda di revisione. Puoi impostare soglie di affidabilità: sotto un certo punteggio, l'articolo va in bozza e richiede approvazione manuale. Il controllo finale è sempre tuo."
        },
      ],
      guarantee: "Integrazione gratuita e supporto dedicato per i primi 30 giorni. Se non vedi un aumento misurabile della produzione editoriale entro il primo mese, rimborsiamo l'abbonamento.",
      ctaText: "Richiedi una demo gratuita",
      ctaUrl: "https://proofpress.ai/offerta?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_editori",
      altCtaText: "Scarica il media kit",
      altCtaUrl: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_editori",
      subjectVariants: [
        "ProofPress per Editori — Redazione AI autonoma. 24/7. Certificata.",
        "ProofPress Business — 20 notizie certificate al giorno senza aumentare l'organico.",
        "ProofPress Editori — Il badge che aumenta la fiducia dei tuoi lettori.",
      ],
    },

    aziende: {
      tag: "Per Aziende & Corporate",
      tagColor: ORANGE,
      accentHex: ORANGE,
      headline: "Intelligence certificata\nper decisioni più rapide.",
      subheadline: "Newsroom interno branded. Report IR, competitor e market intelligence.",
      problemTitle: "Il problema delle decisioni basate su informazioni sbagliate",
      problemBody: `I C-level che prendono decisioni strategiche sull'AI hanno bisogno di informazioni verificate, non di rumore. Ogni giorno il tuo team legge decine di articoli, newsletter, report — e non ha il tempo di capire cosa è verificato, cosa è speculazione e cosa è direttamente falso.

Il costo di una decisione basata su informazioni sbagliate è molto più alto del costo di un sistema che le verifica. ProofPress costruisce il tuo newsroom interno: un flusso continuo di intelligence certificata su competitor, mercato, trend AI e venture capital — tutto con il tuo brand, tutto verificato, tutto pronto per il board.

Non è un abbonamento a una newsletter. È un'infrastruttura di intelligence che lavora 24/7 per portare al tuo team solo le informazioni che contano, nel formato che serve, con la certezza che siano accurate.`,
      beforeAfter: [
        { before: "Il CEO legge 45 minuti di news ogni mattina — non tutte verificate", after: "Briefing certificato di 10 minuti ogni mattina — solo le notizie che contano" },
        { before: "Il team marketing produce 1 articolo a settimana sul blog aziendale", after: "3 articoli certificati al giorno, traffico organico +180% in 6 mesi" },
        { before: "Nessun monitoraggio sistematico dei competitor", after: "Alert automatici su funding, lanci di prodotto e assunzioni chiave dei competitor" },
        { before: "Report IR preparati manualmente in 2 giorni", after: "Report IR generati automaticamente con dati verificati in 2 ore" },
      ],
      stats: [
        { value: "+180%", label: "Traffico organico in 6 mesi" },
        { value: "10 min", label: "Briefing CEO invece di 45 min" },
        { value: "100%", label: "Contenuti certificati ProofPress Verify" },
        { value: "1", label: "Persona per gestire tutto il newsroom" },
      ],
      howItWorks: [
        { step: "01", title: "Intelligence competitiva", desc: "Monitora i movimenti dei tuoi competitor in tempo reale. Alert automatici su funding, lanci di prodotto, assunzioni chiave e cambi di strategia." },
        { step: "02", title: "Briefing esecutivo", desc: "Ogni mattina il CEO riceve un briefing certificato su AI, competitor e mercato. 10 minuti di lettura, informazioni verificate, zero rumore." },
        { step: "03", title: "Content marketing certificato", desc: "Pubblica contenuti certificati sul tuo sito e nei tuoi canali. Il badge ProofPress Verify aumenta la credibilità del tuo brand con clienti e investitori." },
        { step: "04", title: "Report IR automatici", desc: "Genera report automatici per investor relations con dati verificati. Briefing per il board, aggiornamenti per i soci, tutto con il tuo template aziendale." },
      ],
      useCases: [
        {
          title: "Scaleup SaaS B2B — Briefing CEO quotidiano",
          desc: "Una scaleup SaaS B2B con 50 dipendenti usa ProofPress per il briefing mattutino del CEO. Prima: 45 minuti di lettura di news non verificate. Oggi: 10 minuti di briefing certificato su AI, competitor e mercato. Il CEO prende decisioni più rapide con informazioni più accurate.",
          metric: "Da 45 min a 10 min di briefing quotidiano",
        },
        {
          title: "Azienda fintech — Content marketing automatico",
          desc: "Il team marketing di una fintech pubblica 3 articoli certificati al giorno sul blog aziendale usando ProofPress. Nessun aumento di budget, nessuna nuova assunzione. Risultato: +180% traffico organico in 6 mesi, +45% lead qualificati dal blog.",
          metric: "+180% traffico organico, +45% lead",
        },
        {
          title: "Gruppo industriale — Intelligence competitiva",
          desc: "Un gruppo industriale con 500 dipendenti usa ProofPress per monitorare 12 competitor in 3 mercati. Alert automatici su ogni movimento rilevante. Il team strategico riceve un report settimanale con analisi certificate. Tempo risparmiato: 8 ore/settimana per analista.",
          metric: "8 ore/settimana risparmiate per analista",
        },
      ],
      testimonials: [
        {
          quote: "Ogni mattina il CEO riceve un briefing certificato su AI, competitor e mercato. Ha ridotto il tempo di lettura delle news da 45 minuti a 10 minuti, con informazioni più accurate. Le decisioni strategiche sono migliorate — non è un'impressione, è misurabile.",
          author: "Chief of Staff, scaleup SaaS B2B",
          detail: "50 dipendenti · Seed round completato · Milano"
        },
        {
          quote: "Il team marketing pubblica 3 articoli certificati al giorno sul blog aziendale. Il traffico organico è cresciuto del 180% in 6 mesi senza aumentare il budget. I clienti ci citano come fonte autorevole — questo non aveva prezzo.",
          author: "CMO, azienda fintech",
          detail: "Serie A · 120 dipendenti · +180% traffico organico"
        },
        {
          quote: "Monitoriamo 12 competitor in 3 mercati con un solo sistema. Quando un competitor ha alzato un round, lo sapevamo 4 ore prima che uscisse sulla stampa. Questo tipo di vantaggio informativo vale molto più del costo dell'abbonamento.",
          author: "Head of Strategy, gruppo industriale",
          detail: "500 dipendenti · 3 mercati monitorati"
        },
      ],
      faq: [
        {
          q: "Come si integra con i nostri strumenti aziendali esistenti?",
          a: "ProofPress si integra con Slack, Teams, email aziendale e i principali CMS. Il briefing mattutino può essere inviato direttamente nel canale Slack del CEO. I report IR vengono generati nel formato che già usi (Word, PDF, Google Docs)."
        },
        {
          q: "I dati aziendali sono al sicuro?",
          a: "Sì. ProofPress non accede ai tuoi dati interni — monitora solo fonti pubbliche esterne. I contenuti generati sono ospitati su infrastruttura europea con crittografia end-to-end. Siamo conformi GDPR e disponibili a firmare DPA personalizzati."
        },
        {
          q: "Quante persone servono per gestire il sistema?",
          a: "Una persona, part-time. Il sistema è progettato per richiedere il minimo intervento umano: approvazione dei contenuti, configurazione degli alert, revisione dei report. La maggior parte delle aziende lo gestisce con 2-3 ore a settimana di supervisione."
        },
        {
          q: "Possiamo personalizzare il brand dei contenuti?",
          a: "Completamente. Ogni contenuto viene prodotto con il tuo template, il tuo logo, il tuo tono di voce. Il badge ProofPress Verify appare come 'Certificato da ProofPress per [Nome Azienda]'. I tuoi clienti e investitori vedono il tuo brand, non il nostro."
        },
      ],
      guarantee: "Onboarding dedicato e 30 giorni di prova gratuita per aziende. Includiamo la configurazione completa del newsroom interno e il primo report IR. Se non sei soddisfatto, rimborsiamo tutto.",
      ctaText: "Richiedi una demo aziendale",
      ctaUrl: "https://proofpress.ai/offerta?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_aziende",
      altCtaText: "Scarica il caso studio",
      altCtaUrl: "https://proofpress.ai/piattaforma?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business_aziende",
      subjectVariants: [
        "ProofPress Business — Intelligence certificata per decisioni più rapide.",
        "ProofPress per Aziende — Il tuo newsroom interno. Branded. Certificato.",
        "ProofPress Corporate — +180% traffico organico in 6 mesi con 1 persona.",
      ],
    },
  };

  const c = configs[variant];

  // ── Genera le card "Come funziona" (2 colonne) ──────────────────────────
  const howItWorksRows = [];
  for (let i = 0; i < c.howItWorks.length; i += 2) {
    const left = c.howItWorks[i];
    const right = c.howItWorks[i + 1];
    howItWorksRows.push(`
      <tr>
        <td width="48%" style="vertical-align:top;padding:0 8px 16px 0;">
          <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:24px;height:100%;">
            <div style="font-family:${FONT};font-size:22px;font-weight:700;color:${c.accentHex};margin-bottom:10px;letter-spacing:-0.5px;">${left.step}</div>
            <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:8px;">${left.title}</div>
            <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.65;">${left.desc}</div>
          </div>
        </td>
        ${right ? `<td width="48%" style="vertical-align:top;padding:0 0 16px 8px;">
          <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:24px;height:100%;">
            <div style="font-family:${FONT};font-size:22px;font-weight:700;color:${c.accentHex};margin-bottom:10px;letter-spacing:-0.5px;">${right.step}</div>
            <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:8px;">${right.title}</div>
            <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.65;">${right.desc}</div>
          </div>
        </td>` : '<td width="48%"></td>'}
      </tr>
    `);
  }

  // ── Genera le stat cards ─────────────────────────────────────────────────
  const statCards = c.stats.map(s => `
    <td align="center" style="padding:0 6px;">
      <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:20px 12px;">
        <div style="font-family:${FONT};font-size:26px;font-weight:700;color:${c.accentHex};letter-spacing:-0.5px;">${s.value}</div>
        <div style="font-family:${FONT};font-size:12px;color:${SLATE};margin-top:4px;line-height:1.4;">${s.label}</div>
      </div>
    </td>
  `).join("");

  // ── Genera i testimonial ─────────────────────────────────────────────────
  const testimonialCards = c.testimonials.map(t => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;">
          <div style="font-family:${FONT};font-size:32px;color:${c.accentHex};line-height:1;margin-bottom:12px;opacity:0.4;">"</div>
          <div style="font-family:${FONT};font-size:15px;color:${BLACK};line-height:1.7;margin-bottom:20px;">${t.quote}</div>
          <div style="border-top:1px solid ${BORDER};padding-top:16px;">
            <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${BLACK};">${t.author}</div>
            <div style="font-family:${FONT};font-size:12px;color:${MUTED};margin-top:3px;">${t.detail}</div>
          </div>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Genera i casi d'uso ──────────────────────────────────────────────────
  const useCaseCards = c.useCases.map((u, i) => `
    <tr>
      <td style="padding:0 0 16px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;">
          <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${c.accentHex};letter-spacing:0.8px;text-transform:uppercase;margin-bottom:8px;">Caso ${i + 1}</div>
          <div style="font-family:${FONT};font-size:16px;font-weight:600;color:${BLACK};margin-bottom:12px;">${u.title}</div>
          <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;margin-bottom:16px;">${u.desc}</div>
          <div style="background:${c.accentHex}12;border-radius:8px;padding:10px 16px;display:inline-block;">
            <div style="font-family:${FONT};font-size:13px;font-weight:600;color:${c.accentHex};">📊 ${u.metric}</div>
          </div>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Genera le FAQ ────────────────────────────────────────────────────────
  const faqItems = c.faq.map(f => `
    <tr>
      <td style="padding:0 0 12px 0;">
        <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:24px;">
          <div style="font-family:${FONT};font-size:15px;font-weight:600;color:${BLACK};margin-bottom:10px;">${f.q}</div>
          <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;">${f.a}</div>
        </div>
      </td>
    </tr>
  `).join("");

  // ── Genera il confronto prima/dopo ───────────────────────────────────────
  const beforeAfterRows = c.beforeAfter.map(b => `
    <tr>
      <td style="padding:0 0 10px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="48%" style="vertical-align:top;padding-right:6px;">
              <div style="background:#fff5f5;border:1px solid #ffcdd2;border-radius:8px;padding:14px 16px;">
                <div style="font-family:${FONT};font-size:10px;font-weight:600;color:#c62828;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Prima</div>
                <div style="font-family:${FONT};font-size:13px;color:#b71c1c;line-height:1.5;">${b.before}</div>
              </div>
            </td>
            <td width="4%" align="center" style="vertical-align:middle;font-size:16px;color:${MUTED};">→</td>
            <td width="48%" style="vertical-align:top;padding-left:6px;">
              <div style="background:#f0fff4;border:1px solid #c8e6c9;border-radius:8px;padding:14px 16px;">
                <div style="font-family:${FONT};font-size:10px;font-weight:600;color:#2e7d32;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Con ProofPress</div>
                <div style="font-family:${FONT};font-size:13px;color:#1b5e20;line-height:1.5;">${b.after}</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  // ── Headline con a capo ──────────────────────────────────────────────────
  const headlineHtml = c.headline.split("\n").join("<br>");

  // ── Paragrafi del problema ───────────────────────────────────────────────
  const problemParagraphs = c.problemBody
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p style="margin:0 0 18px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">${p.trim()}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProofPress Business — ${c.tag}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
<tr><td align="center" style="padding:32px 16px 48px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr>
    <td style="background:${WHITE};padding:24px 32px;border-radius:16px 16px 0 0;border-bottom:1px solid ${BORDER};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:${FONT};font-size:22px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">ProofPress</div>
            <div style="font-family:${FONT};font-size:11px;color:${MUTED};margin-top:2px;letter-spacing:0.3px;">AI Journalism Certificato</div>
          </td>
          <td align="right">
            <div style="display:inline-block;background:${c.accentHex}18;color:${c.accentHex};font-family:${FONT};font-size:11px;font-weight:600;padding:5px 14px;border-radius:20px;">${c.tag}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- HERO IMAGE -->
  <tr>
    <td style="padding:0;">
      <img src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/hero_business-Kr57PYrut5Yj3XvrqnRrxN.webp" alt="ProofPress Business" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;" />
    </td>
  </tr>
  <!-- HERO -->
  <tr>
    <td style="background:${WHITE};padding:52px 32px 44px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">ProofPress Business</div>
      <h1 style="margin:0 0 20px;font-family:${FONT};font-size:40px;font-weight:700;color:${BLACK};line-height:1.1;letter-spacing:-0.8px;">${headlineHtml}</h1>
      <p style="margin:0 0 20px;font-family:${FONT};font-size:18px;color:${SLATE};line-height:1.55;">${c.subheadline}</p>
      <p style="margin:0 0 36px;font-family:${FONT};font-size:15px;color:${SLATE};line-height:1.75;">ProofPress è la piattaforma di AI Journalism certificato che trasforma come produci, verifichi e distribuisci contenuti. Usata da creator, testate e aziende che vogliono produrre di più senza perdere qualità.</p>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:14px;">
            <a href="${c.ctaUrl}" style="display:inline-block;background:${c.accentHex};color:#fff;font-family:${FONT};font-size:15px;font-weight:600;padding:14px 26px;border-radius:980px;text-decoration:none;">${c.ctaText}</a>
          </td>
          <td>
            <a href="${c.altCtaUrl}" style="display:inline-block;color:${c.accentHex};font-family:${FONT};font-size:15px;font-weight:500;padding:14px 0;text-decoration:none;">${c.altCtaText} →</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- STATS -->
  <tr>
    <td style="background:${BG};padding:32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>${statCards}</tr>
      </table>
    </td>
  </tr>

  <!-- IL PROBLEMA -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Il contesto</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;line-height:1.2;">${c.problemTitle}</h2>
      ${problemParagraphs}
    </td>
  </tr>

  <!-- PRIMA / DOPO -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Il cambiamento</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Prima e dopo ProofPress.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${beforeAfterRows}
      </table>
    </td>
  </tr>

  <!-- COME FUNZIONA -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Come funziona</div>
      <h2 style="margin:0 0 28px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Quattro passi. Zero complessità.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${howItWorksRows.join("")}
      </table>
    </td>
  </tr>

  <!-- CTA INTERMEDIO -->
  <tr>
    <td style="background:${BG};padding:32px;text-align:center;">
      <div style="font-family:${FONT};font-size:14px;color:${SLATE};margin-bottom:16px;">Vuoi vedere come funziona nel tuo caso specifico?</div>
      <a href="${c.altCtaUrl}" style="display:inline-block;background:${WHITE};color:${BLACK};border:1.5px solid ${BORDER};font-family:${FONT};font-size:14px;font-weight:600;padding:12px 24px;border-radius:980px;text-decoration:none;">${c.altCtaText} →</a>
    </td>
  </tr>

  <!-- CASI D'USO -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Casi d'uso reali</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Chi lo usa e cosa ottiene.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${useCaseCards}
      </table>
    </td>
  </tr>

  <!-- TESTIMONIAL -->
  <tr>
    <td style="background:${BG};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Cosa dicono</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Chi lo usa ogni giorno.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${testimonialCards}
      </table>
    </td>
  </tr>

  <!-- FAQ -->
  <tr>
    <td style="background:${WHITE};padding:44px 32px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:${MUTED};letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Domande frequenti</div>
      <h2 style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:700;color:${BLACK};letter-spacing:-0.3px;">Quattro dubbi. Quattro risposte dirette.</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${faqItems}
      </table>
    </td>
  </tr>

  <!-- GARANZIA -->
  <tr>
    <td style="background:${BG};padding:32px;">
      <div style="background:${WHITE};border:1px solid ${BORDER};border-radius:12px;padding:28px;text-align:center;">
        <div style="font-family:${FONT};font-size:28px;margin-bottom:12px;">🛡️</div>
        <div style="font-family:${FONT};font-size:16px;font-weight:600;color:${BLACK};margin-bottom:10px;">La nostra garanzia</div>
        <div style="font-family:${FONT};font-size:14px;color:${SLATE};line-height:1.7;max-width:460px;margin:0 auto;">${c.guarantee}</div>
      </div>
    </td>
  </tr>

  <!-- CTA FINALE -->
  <tr>
    <td style="background:${BLACK};padding:52px 32px;border-radius:0 0 16px 16px;text-align:center;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:1px;text-transform:uppercase;margin-bottom:14px;">Inizia oggi</div>
      <h2 style="margin:0 0 14px;font-family:${FONT};font-size:30px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;">Prova ProofPress gratuitamente.</h2>
      <p style="margin:0 0 32px;font-family:${FONT};font-size:15px;color:rgba(255,255,255,0.55);line-height:1.65;">Nessuna carta di credito. Setup in 10 minuti.<br>Vedi i risultati nella prima settimana.</p>
      <a href="${c.ctaUrl}" style="display:inline-block;background:#ffffff;color:${BLACK};font-family:${FONT};font-size:15px;font-weight:600;padding:15px 30px;border-radius:980px;text-decoration:none;margin-bottom:20px;">${c.ctaText} →</a>
      <div>
        <a href="${c.altCtaUrl}" style="font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.45);text-decoration:none;">${c.altCtaText}</a>
      </div>
    </td>
  </tr>

  <!-- SPACER -->
  <tr><td style="height:24px;"></td></tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:0 8px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-family:${FONT};font-size:12px;color:${MUTED};">
              <a href="https://proofpress.ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:${MUTED};text-decoration:none;">proofpress.ai</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/ai?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:${MUTED};text-decoration:none;">AI News</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/startup?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:${MUTED};text-decoration:none;">Startup</a>
              &nbsp;·&nbsp;
              <a href="https://proofpress.ai/research?utm_source=newsletter&utm_medium=email&utm_campaign=promo_business" style="color:${MUTED};text-decoration:none;">Ricerche</a>
            </div>
          </td>
          <td align="right">
            <div style="font-family:${FONT};font-size:11px;color:${MUTED};">
              Hai ricevuto questa email perché sei iscritto a ProofPress.<br>
              <a href="https://proofpress.ai/unsubscribe?email={{email}}" style="color:${MUTED};">Disiscriviti</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr><td style="height:32px;"></td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Funzione di invio ─────────────────────────────────────────────────────
export async function sendBusinessNewsletterToAll(): Promise<void> {
  const variant = getBusinessVariant();
  const alreadySent = await hasAlreadySentBusinessTodayDB(variant);
  if (alreadySent) {
    console.log(`[BusinessNewsletter] Guard: già inviata oggi (${variant}). Skip.`);
    try {
      await sendEmail({
        to: "ac@acinelli.com",
        subject: `[ProofPress] ⚠️ Newsletter Business (${variant}) bloccata — già inviata oggi`,
        html: `<p>Il guard anti-duplicati ha bloccato un secondo invio della newsletter Business (${variant}) in data ${new Date().toLocaleDateString("it-IT")}.</p>`,
      });
    } catch (e) {
      console.error("[BusinessNewsletter] Errore invio alert email:", e);
    }
    return;
  }

  const c = {
    creator: {
      subjectVariants: [
        "ProofPress Business — La tua testata AI. La tua firma. Zero redazione.",
        "ProofPress per Creator — Pubblica 15 articoli al giorno con 1 persona.",
        "ProofPress Creator — Smetti di perdere 4 ore al giorno a raccogliere notizie.",
      ],
    },
    editori: {
      subjectVariants: [
        "ProofPress per Editori — Redazione AI autonoma. 24/7. Certificata.",
        "ProofPress Business — 20 notizie certificate al giorno senza aumentare l'organico.",
        "ProofPress Editori — Il badge che aumenta la fiducia dei tuoi lettori.",
      ],
    },
    aziende: {
      subjectVariants: [
        "ProofPress Business — Intelligence certificata per decisioni più rapide.",
        "ProofPress per Aziende — Il tuo newsroom interno. Branded. Certificato.",
        "ProofPress Corporate — +180% traffico organico in 6 mesi con 1 persona.",
      ],
    },
  };

  const dayOfWeek = new Date().getDay();
  const subjectIndex = [1, 3, 5, 6].indexOf(dayOfWeek) % 3;
  const subject = c[variant].subjectVariants[subjectIndex >= 0 ? subjectIndex : 0];
  const html = buildBusinessNewsletterHtml(variant);

  const subscribers = await getActiveSubscribers();
  if (!subscribers || subscribers.length === 0) {
    console.log("[BusinessNewsletter] Nessun iscritto attivo trovato. Skip.");
    return;
  }

  console.log(`[BusinessNewsletter] Invio a ${subscribers.length} iscritti (variante: ${variant})...`);

  const { newsletterSends } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) { console.error("[BusinessNewsletter] DB non disponibile"); return; }

  const [sendRecord] = await db.insert(newsletterSends).values({
    subject,
    htmlContent: html,
    status: "sending",
    recipientCount: 0,
    openedCount: 0,
    createdAt: new Date(),
  }).$returningId();

  const sendId = sendRecord?.id;
  let sent = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    await Promise.allSettled(
      batch.map(sub =>
        sendEmail({
          to: sub.email,
          subject,
          html: html.replace("{{email}}", encodeURIComponent(sub.email)),
        })
      )
    );
    sent += batch.length;
    console.log(`[BusinessNewsletter] Inviati ${sent}/${subscribers.length}...`);
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  if (sendId) {
    const { eq } = await import("drizzle-orm");
    const db2 = await getDb();
    if (db2) {
      await db2.update(newsletterSends)
        .set({ status: "sent", recipientCount: sent })
        .where(eq(newsletterSends.id, sendId));
    }
  }

  console.log(`[BusinessNewsletter] ✅ Completato. Inviati ${sent} messaggi.`);
}
