/**
 * PPV Editorial Scheduler
 * ─────────────────────────────────────────────────────────────────────────────
 * Genera ogni giorno (lun 11 – ven 15 maggio 2026):
 *   • 16:30 CET — Articolo editoriale firmato Andrea Cinelli su ProofPressVerify
 *   • 14:30 CET — Preview newsletter promozionale a ac@acinelli.com
 *   • 17:30 CET — Newsletter promozionale agli iscritti attivi
 *
 * Calendario pagine:
 *   11 mag (lun) → Home     https://proofpressverify.com/
 *   12 mag (mar) → News     https://proofpressverify.com/news
 *   13 mag (mer) → Info     https://proofpressverify.com/info
 *   14 mag (gio) → Email    https://proofpressverify.com/email
 *   15 mag (ven) → CV       https://proofpressverify.com/cv-verify
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { newsItems } from "../drizzle/schema";
import { sendEmail } from "./email";
import { getActiveSubscribers } from "./db";
import crypto from "crypto";

// ─── Calendario PPV ──────────────────────────────────────────────────────────

interface PpvPage {
  date: string;           // YYYY-MM-DD
  url: string;
  product: string;        // nome prodotto
  heroImageUrl: string;   // CDN URL immagine hero
  context: string;        // testo di contesto per il LLM
}

const PPV_CALENDAR: PpvPage[] = [
  {
    date: "2026-05-11",
    url: "https://proofpressverify.com/",
    product: "ProofPress Verify™",
    heroImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ppv_hero_home_9707dcb8.webp",
    context: `ProofPress Verify™ è un protocollo di certificazione crittografica che assegna a ogni contenuto digitale (email, notizie, documenti, prodotti, curriculum) un numero PP univoco ancorato su IPFS tramite hash SHA-256. Il sistema analizza ogni claim fattuale con 4 motori AI, incrocia oltre 4.000 fonti globali e assegna un Trust Score da 0 a 100 con grade A–F. Attualmente conta 669 certificati live. Dati chiave: il 59% delle persone non distingue notizie vere da false; meno dell'1% dei documenti ha una verifica di integrità; zero standard esistono per autenticare un'email. Il servizio è gratuito per iniziare. URL: https://proofpressverify.com/`,
  },
  {
    date: "2026-05-12",
    url: "https://proofpressverify.com/news",
    product: "News Verify",
    heroImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ppv_hero_home_9707dcb8.webp",
    context: `News Verify è il prodotto di ProofPress Verify™ dedicato all'editoria. Certifica ogni articolo claim per claim con badge trust grade A–F visibile ai lettori e prova IPFS immutabile. Pensato per redazioni, freelance e brand media che vogliono differenziarsi con informazioni verificabili. Il badge è embeddabile su sito e newsletter. URL: https://proofpressverify.com/news`,
  },
  {
    date: "2026-05-13",
    url: "https://proofpressverify.com/info",
    product: "Info Verify",
    heroImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ppv_hero_home_9707dcb8.webp",
    context: `Info Verify è il prodotto di ProofPress Verify™ per comunicati stampa, report ESG e documenti IR. Fornisce prova crittografica che il documento non è stato alterato dopo la certificazione. Rivolto a PR & Comms, Compliance e Investor Relations. URL: https://proofpressverify.com/info`,
  },
  {
    date: "2026-05-14",
    url: "https://proofpressverify.com/email",
    product: "Email Verify",
    heroImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ppv_hero_home_9707dcb8.webp",
    context: `Email Verify è il prodotto di ProofPress Verify™ per certificare newsletter e comunicazioni finanziarie via BCC. Zero integrazione tecnica: funziona con qualsiasi client email. Pensato per newsletter, comunicazioni finanziarie e regolatorio. URL: https://proofpressverify.com/email`,
  },
  {
    date: "2026-05-15",
    url: "https://proofpressverify.com/cv-verify",
    product: "CV Verify",
    heroImageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ppv_hero_home_9707dcb8.webp",
    context: `CV Verify è il prodotto di ProofPress Verify™ per certificare il curriculum con hash SHA-256 e notarizzazione IPFS. Il numero PP-XXXXXXXX è la prova di autenticità verso recruiter e HR. Pensato per candidati, recruiter, HR e profili LinkedIn. URL: https://proofpressverify.com/cv-verify`,
  },
];

// ─── Utility: pagina del giorno ───────────────────────────────────────────────

export function getTodayPpvPage(): PpvPage | null {
  const today = new Date();
  const tz = "Europe/Rome";
  const dateStr = today.toLocaleDateString("sv-SE", { timeZone: tz }); // YYYY-MM-DD
  return PPV_CALENDAR.find(p => p.date === dateStr) ?? null;
}

// ─── Generazione articolo editoriale ─────────────────────────────────────────

export async function generatePpvEditorial(): Promise<{ success: boolean; articleId?: number; title?: string; error?: string }> {
  const page = getTodayPpvPage();
  if (!page) {
    console.log("[PPV Editorial] Nessuna pagina programmata per oggi.");
    return { success: false, error: "Nessuna pagina programmata per oggi" };
  }

  console.log(`[PPV Editorial] Generazione articolo per ${page.product} (${page.date})...`);

  const prompt = `Sei Andrea Cinelli: imprenditore seriale con 30+ anni di esperienza nel digitale, co-fondatore di Libero.it, pioniere mobile in Vodafone e Telecom Italia, fondatore di 12+ venture AI, membro Advisory Board Deloitte, professore di AI al Sole 24 Ore Business School. Scrivi un articolo giornalistico autorevole e oggettivo su ${page.product} (${page.url}).

CONTESTO DEL SERVIZIO:
${page.context}

ISTRUZIONI STILE:
- Tono: autorevole, data-driven, orientato all'execution — per interlocutori C-level
- Inizia citando direttamente il tema con un dato o un'evidenza concreta, mai con "Ho analizzato..."
- Frasi brevi, linguaggio semplice ma preciso
- Analisi oggettiva da esperto: benefici reali, casi d'uso concreti, implicazioni di business
- Non è uno spoiler né una pubblicità: è una recensione tecnica e strategica
- Includi: contesto di mercato, come funziona il servizio, a chi serve, vantaggi competitivi, limitazioni oneste
- Chiudi con un takeaway strategico netto per chi deve decidere se adottarlo
- Massimo 2500 caratteri
- NO asterischi per formattazione
- Scrivi come un essere umano, non come un'AI

Rispondi con un JSON con questi campi:
{
  "title": "titolo dell'articolo (max 100 caratteri)",
  "summary": "testo completo dell'articolo (max 2500 caratteri)",
  "category": "categoria (es: AI TOOLS, TECNOLOGIA, INNOVAZIONE)"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Sei un giornalista esperto di tecnologia e AI. Rispondi SOLO con JSON valido, senza markdown." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ppv_article",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              category: { type: "string" }
            },
            required: ["title", "summary", "category"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("Risposta LLM vuota");

    // Pulisce eventuali backtick markdown (```json ... ```) dalla risposta
    let rawContent = typeof content === "string" ? content : JSON.stringify(content);
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const article = JSON.parse(rawContent);

    // Calcola hash per verifica
    const verifyHash = crypto.createHash("sha256")
      .update(`${article.title}|${article.summary}|${page.url}`)
      .digest("hex");

    const db = await getDb();
    if (!db) throw new Error("DB non disponibile");

    const today = new Date();
    const dayLabel = today.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });

    const [result] = await db.insert(newsItems).values({
      section: "ai",
      title: article.title,
      summary: article.summary,
      category: article.category,
      sourceName: "Andrea Cinelli — ProofPress Magazine",
      sourceUrl: page.url,
      publishedAt: dayLabel,
      weekLabel: dayLabel,
      position: 0,
      imageUrl: page.heroImageUrl,
      verifyHash,
    });

    const insertId = (result as any).insertId;
    console.log(`[PPV Editorial] ✅ Articolo inserito — ID: ${insertId}, Titolo: ${article.title}`);
    return { success: true, articleId: insertId, title: article.title };

  } catch (err) {
    console.error("[PPV Editorial] ❌ Errore generazione:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Generazione HTML newsletter promozionale ─────────────────────────────────

export function buildPpvNewsletterHtml(page: PpvPage): string {
  const dateFormatted = new Date(page.date + "T12:00:00Z").toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  // Immagini Pexels per ogni prodotto (URL stabili, no scadenza)
  const productImages: Record<string, { hero: string; mid: string; bottom: string }> = {
    "ProofPress Verify™": {
      hero: "https://images.pexels.com/photos/9588213/pexels-photo-9588213.jpeg?auto=compress&cs=tinysrgb&w=600",
      mid: "https://images.pexels.com/photos/4160060/pexels-photo-4160060.jpeg?auto=compress&cs=tinysrgb&w=600",
      bottom: "https://images.pexels.com/photos/7887800/pexels-photo-7887800.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    "News Verify": {
      hero: "https://images.pexels.com/photos/4160060/pexels-photo-4160060.jpeg?auto=compress&cs=tinysrgb&w=600",
      mid: "https://images.pexels.com/photos/3989901/pexels-photo-3989901.jpeg?auto=compress&cs=tinysrgb&w=600",
      bottom: "https://images.pexels.com/photos/9577224/pexels-photo-9577224.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    "Info Verify": {
      hero: "https://images.pexels.com/photos/29614944/pexels-photo-29614944.jpeg?auto=compress&cs=tinysrgb&w=600",
      mid: "https://images.pexels.com/photos/7947854/pexels-photo-7947854.jpeg?auto=compress&cs=tinysrgb&w=600",
      bottom: "https://images.pexels.com/photos/9588213/pexels-photo-9588213.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    "Email Verify": {
      hero: "https://images.pexels.com/photos/7821764/pexels-photo-7821764.jpeg?auto=compress&cs=tinysrgb&w=600",
      mid: "https://images.pexels.com/photos/2882555/pexels-photo-2882555.jpeg?auto=compress&cs=tinysrgb&w=600",
      bottom: "https://images.pexels.com/photos/30885916/pexels-photo-30885916.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    "CV Verify": {
      hero: "https://images.pexels.com/photos/590044/pexels-photo-590044.jpeg?auto=compress&cs=tinysrgb&w=600",
      mid: "https://images.pexels.com/photos/5989931/pexels-photo-5989931.jpeg?auto=compress&cs=tinysrgb&w=600",
      bottom: "https://images.pexels.com/photos/5989943/pexels-photo-5989943.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    "Product Verify": {
      hero: "https://images.pexels.com/photos/37466061/pexels-photo-37466061.jpeg?auto=compress&cs=tinysrgb&w=600",
      mid: "https://images.pexels.com/photos/5953835/pexels-photo-5953835.jpeg?auto=compress&cs=tinysrgb&w=600",
      bottom: "https://images.pexels.com/photos/36522029/pexels-photo-36522029.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  };

  const imgs = productImages[page.product] ?? productImages["ProofPress Verify™"];

  // Contenuti dettagliati per ogni pagina PPV — basati sui contenuti reali del sito
  interface ProductContent {
    tagline: string;
    intro: string;
    stats: Array<{ value: string; label: string }>;
    howItWorks: Array<{ step: string; title: string; desc: string }>;
    features: Array<{ icon: string; title: string; desc: string }>;
    targets: Array<{ icon: string; title: string; desc: string }>;
    testimonial?: { initials: string; name: string; role: string; text: string };
    pricing?: string;
    cta: string;
    ctaUrl: string;
  }

  const productContents: Record<string, ProductContent> = {
    "ProofPress Verify™": {
      tagline: "Il protocollo che certifica ogni contenuto digitale con hash SHA-256 su IPFS.",
      intro: "In un'epoca in cui il 59% delle persone non distingue notizie vere da false e l'AI genera contenuti in secondi, ProofPress Verify™ è il protocollo che risponde con crittografia. Ogni contenuto — email, notizie, documenti, prodotti, curriculum — riceve un numero PP univoco ancorato su IPFS tramite hash SHA-256. Immutabile. Verificabile da chiunque. Per sempre.",
      stats: [
        { value: "669", label: "Certificati live" },
        { value: "4.000+", label: "Fonti globali" },
        { value: "4", label: "Motori AI" },
        { value: "A–F", label: "Trust Score" }
      ],
      howItWorks: [
        { step: "01", title: "Carica il contenuto", desc: "Testo, PDF, email o URL. Il sistema parte immediatamente." },
        { step: "02", title: "Analisi AI multi-fonte", desc: "4 motori AI incrociano 4.000+ fonti globali in tempo reale." },
        { step: "03", title: "Trust Score A–F", desc: "Score 0–100 con breakdown per ogni dimensione di verifica." },
        { step: "04", title: "Certificato IPFS", desc: "Hash SHA-256 + CID IPFS. Verificabile indipendentemente da ProofPress." }
      ],
      features: [
        { icon: "🔐", title: "Hash SHA-256 + IPFS", desc: "Impronta digitale immutabile archiviata su IPFS. Verificabile da chiunque, per sempre." },
        { icon: "🤖", title: "4 Motori AI", desc: "Analisi multi-fonte con Claude AI, Perplexity, DuckDuckGo e SerpAPI." },
        { icon: "📊", title: "Trust Score A–F", desc: "Score 0–100 con breakdown per dimensione: Integrity, Evidence, Credibility, Materiality." },
        { icon: "🏷️", title: "Badge Embeddabile", desc: "Badge di certificazione per sito, newsletter, email e packaging." }
      ],
      targets: [
        { icon: "📰", title: "Redazioni e giornalisti", desc: "Certifica ogni articolo e distinguiti dalla disinformazione." },
        { icon: "🏢", title: "Aziende e PR", desc: "Certifica comunicati, report ESG e documenti IR." },
        { icon: "💼", title: "Professionisti", desc: "Certifica CV, email e documenti con prova crittografica." }
      ],
      cta: "INIZIA GRATIS — 10 CERTIFICAZIONI",
      ctaUrl: "https://proofpressverify.com"
    },
    "News Verify": {
      tagline: "Ogni notizia. Certificata. Con hash SHA-256 + IECM 3-Layer.",
      intro: "Il 59% delle persone non distingue notizie vere da false. Le redazioni che non certificano i propri contenuti rischiano di essere indistinguibili dalla disinformazione. News Verify è la risposta: certifica ogni articolo claim per claim con un badge trust grade A–F visibile ai lettori e una prova IPFS immutabile. Non è un fact-checker — è una prova crittografica che il contenuto è identico all'originale.",
      stats: [
        { value: "669", label: "Certificati live" },
        { value: "4.000+", label: "Fonti globali" },
        { value: "A–F", label: "Trust Grade" },
        { value: "IPFS", label: "Prova immutabile" }
      ],
      howItWorks: [
        { step: "01", title: "Upload articolo", desc: "Testo o URL. Batch fino a 50 articoli via API." },
        { step: "02", title: "IECM 3-Layer", desc: "Integrity · Evidence · Credibility · Materiality: 4 dimensioni per ogni articolo." },
        { step: "03", title: "Trust Score", desc: "Score 0–100 con breakdown per dimensione e grade A–F." },
        { step: "04", title: "Certificato IPFS", desc: "Hash SHA-256 + CID IPFS + watermark PDF. Verificabile indipendentemente." }
      ],
      features: [
        { icon: "🛡️", title: "IECM 3-Layer Analysis", desc: "Integrity, Evidence, Credibility, Materiality: 4 dimensioni per ogni contenuto." },
        { icon: "📄", title: "Watermark PDF", desc: "Documento restituito con watermark che include hash e QR code di verifica." },
        { icon: "⚡", title: "Batch Upload", desc: "Fino a 50 articoli in una sola chiamata API. Ideale per redazioni ad alto volume." },
        { icon: "🔗", title: "Badge Embeddabile", desc: "Badge di certificazione per sito, newsletter e social. Visibile ai lettori." }
      ],
      targets: [
        { icon: "📰", title: "Redazioni e testate", desc: "Certifica ogni articolo e differenziati dalla disinformazione con credibilità misurabile." },
        { icon: "✍️", title: "Freelance e blogger", desc: "Il badge trust grade è il tuo biglietto da visita professionale." },
        { icon: "📣", title: "Agenzie PR e brand media", desc: "Certifica comunicati e contenuti branded prima della distribuzione." }
      ],
      cta: "INIZIA GRATIS — 10 CERTIFICAZIONI",
      ctaUrl: "https://proofpressverify.com/news"
    },
    "Info Verify": {
      tagline: "Ogni documento aziendale. Certificato. Con prova crittografica di integrità.",
      intro: "Meno dell'1% dei documenti aziendali ha una verifica di integrità crittografica. Zero standard esistono per certificare che un comunicato stampa non è stato alterato. Il costo reputazionale di un report finanziario modificato è incalcolabile. Info Verify risolve questo problema: certifica comunicati stampa, report ESG e documenti IR con hash SHA-256 su IPFS e analisi IECM a 3 layer. Prova crittografica che il documento è identico all'originale.",
      stats: [
        { value: "<1%", label: "Documenti con verifica crittografica" },
        { value: "0", label: "Standard per certificare comunicati" },
        { value: "50", label: "Documenti per batch API" },
        { value: "IPFS", label: "Archiviazione immutabile" }
      ],
      howItWorks: [
        { step: "01", title: "Upload documento", desc: "PDF, DOCX o testo. Batch fino a 50 via API." },
        { step: "02", title: "IECM 3-Layer", desc: "Integrity · Evidence · Credibility · Materiality per ogni documento." },
        { step: "03", title: "Trust Score", desc: "Score 0–100 con breakdown per dimensione." },
        { step: "04", title: "Certificato IPFS", desc: "Hash SHA-256 + CID IPFS + watermark PDF con QR code di verifica." }
      ],
      features: [
        { icon: "📄", title: "Watermark PDF", desc: "Documento restituito con watermark che include hash e QR code di verifica." },
        { icon: "⚡", title: "Batch Upload", desc: "Fino a 50 documenti in una sola chiamata API. Ideale per report periodici." },
        { icon: "🔗", title: "IPFS Anchoring", desc: "Report JSON su IPFS. CID verificabile indipendentemente da ProofPress." },
        { icon: "🔔", title: "Webhook Notifiche", desc: "Notifica POST al tuo endpoint ad ogni certificato emesso o verificato." }
      ],
      targets: [
        { icon: "📊", title: "Investor Relations", desc: "Certifica report finanziari ed earnings release. Prova di integrità per analisti e investitori." },
        { icon: "🏛️", title: "PR & Comunicazione", desc: "Certifica comunicati prima della distribuzione. Prova che il contenuto non è stato alterato." },
        { icon: "✅", title: "Compliance & Legal", desc: "Certifica documenti ESG e policy aziendali. Audit trail crittografico per ogni versione." }
      ],
      cta: "INIZIA GRATIS — 10 CERTIFICAZIONI",
      ctaUrl: "https://proofpressverify.com/info"
    },
    "Email Verify": {
      tagline: "Ogni email. Certificata. Con un semplice BCC automatico.",
      intro: "Il 100% delle email può essere alterata in transito senza che nessuno se ne accorga. Zero standard verificabili esistono per garantire l'integrità di un'email ricevuta. Email Verify risolve questo problema con un approccio radicale nella sua semplicità: aggiungi un BCC dedicato a ogni invio e il sistema certifica automaticamente ogni email con hash SHA-256 su IPFS. Zero integrazione tecnica. Funziona con Gmail, Outlook, Mailchimp, HubSpot, Salesforce.",
      stats: [
        { value: "0", label: "Standard per integrità email" },
        { value: "100%", label: "Email alterabili in transito" },
        { value: "BCC", label: "Zero integrazione tecnica" },
        { value: "IPFS", label: "Prova permanente" }
      ],
      howItWorks: [
        { step: "01", title: "Provisioning BCC", desc: "Ricevi il tuo indirizzo BCC dedicato: certify-{slug}@mail.proofpressverify.com" },
        { step: "02", title: "Invia con BCC", desc: "Aggiungi il BCC a ogni invio. Zero modifiche al workflow esistente." },
        { step: "03", title: "Certificazione auto", desc: "Il sistema riceve la copia, la certifica SHA-256 e la archivia su IPFS." },
        { step: "04", title: "Codice PP-", desc: "Ricevi email di conferma con hash e link al certificato verificabile." }
      ],
      features: [
        { icon: "✉️", title: "BCC Automatico", desc: "Funziona con Gmail, Outlook, Mailchimp, HubSpot, Salesforce. Nessuna modifica al workflow." },
        { icon: "🔐", title: "Hash SHA-256 + IPFS", desc: "Impronta digitale immutabile archiviata su IPFS. Verificabile da chiunque, per sempre." },
        { icon: "🏷️", title: "Badge Embeddabile", desc: "Badge di certificazione per firma email o landing page newsletter." },
        { icon: "📊", title: "Inbox BCC Dashboard", desc: "Tutte le email certificate in un unico posto. Filtri per data, mittente, status." }
      ],
      targets: [
        { icon: "📧", title: "Newsletter & Creator", desc: "I tuoi iscritti verificano che il contenuto ricevuto è autentico e non alterato." },
        { icon: "💼", title: "Comunicazioni Finanziarie", desc: "Certifica earnings release e comunicazioni agli azionisti. Prova di integrità per regolatori." },
        { icon: "⚖️", title: "Comunicazioni Legali", desc: "Certifica notifiche di compliance e documenti contrattuali inviati via email." }
      ],
      cta: "INIZIA GRATIS — 10 CERTIFICAZIONI",
      ctaUrl: "https://proofpressverify.com/email"
    },
    "CV Verify": {
      tagline: "Il tuo CV. Certificato. Indiscutibile. Il numero PP sul CV è la garanzia.",
      intro: "L'85% dei recruiter ha ricevuto CV con informazioni false o esagerate. Con l'AI, bastano 6 minuti per creare un CV credibile con esperienze inventate. Zero strumenti esistono per verificare in modo indipendente che un CV non sia stato alterato. CV Verify risolve questo problema: certifica ogni claim del curriculum con Claude AI, Perplexity e SerpAPI su 24+ fonti, e rilascia un numero PP-XXXXXXXX ancorato su IPFS. Permanente. Verificabile da qualsiasi recruiter.",
      stats: [
        { value: "85%", label: "Recruiter con CV falsi ricevuti" },
        { value: "6 min", label: "Per creare CV falso con AI" },
        { value: "24", label: "Fonti consultate per certificato" },
        { value: "€29", label: "Pagamento unico, permanente" }
      ],
      howItWorks: [
        { step: "01", title: "Inserisci il CV", desc: "Incolla il testo. La pipeline parte immediatamente." },
        { step: "02", title: "AI Claim Extraction", desc: "Claude AI estrae ruoli, aziende, titoli, certificazioni e achievement." },
        { step: "03", title: "Fact-check multi-fonte", desc: "Perplexity, DuckDuckGo e SerpAPI verificano ogni claim su fonti reali." },
        { step: "04", title: "Certificato PP + IPFS", desc: "Report notarizzato su IPFS. Ricevi il numero PP-XXXXXXXX da inserire nel CV." }
      ],
      features: [
        { icon: "💼", title: "Verifica esperienze", desc: "Ruoli, aziende, anni di esperienza verificati su fonti pubbliche." },
        { icon: "🎓", title: "Titoli di studio", desc: "Università, lauree, master verificati su database accademici." },
        { icon: "📜", title: "Certificazioni", desc: "AWS, Google, PMP, CFA e altre certificazioni verificate alla fonte." },
        { icon: "🔗", title: "Profilo LinkedIn", desc: "Consistenza tra CV e profilo LinkedIn verificata automaticamente." }
      ],
      targets: [
        { icon: "👔", title: "Candidati senior", desc: "Il numero PP-XXXXXXXX è la tua prova di autenticità verso recruiter e HR." },
        { icon: "🔍", title: "Recruiter e HR", desc: "Quando vedi un numero PP, sai già che puoi passare alla fase successiva." },
        { icon: "🏆", title: "Profili C-level", desc: "Per i ruoli C-level, la certificazione ProofPress è quasi uno standard." }
      ],
      testimonial: {
        initials: "SR",
        name: "Sara R.",
        role: "Head of Talent · Scale-up Tech",
        text: "Quando vedo un numero PP, so già che posso passare alla fase successiva. È diventato un segnale di serietà professionale."
      },
      pricing: "€29 · Pagamento unico · Certificato permanente su IPFS · Non scade mai",
      cta: "CERTIFICA IL TUO CV — €29",
      ctaUrl: "https://proofpressverify.com/cv-verify"
    },
    "Product Verify": {
      tagline: "Il tuo prodotto. Certificato. AI verifica ogni claim marketing su 5 fonti indipendenti.",
      intro: "Le multe AGCM per greenwashing e claim non supportati superano i €10M in media. Il 67% dei consumatori smette di acquistare un brand dopo claim falsi. Ma i brand con badge di verifica terza parte registrano un conversion rate 3 volte superiore. Product Verify certifica ogni claim marketing — ingredienti, sostenibilità, certificazioni — con Claude AI su 5 fonti indipendenti (Open Food Facts, EFSA, Perplexity, DuckDuckGo, SerpAPI) e rilascia un certificato crittografico immutabile su IPFS con badge embeddabile su sito e packaging.",
      stats: [
        { value: "€10M+", label: "Multa media AGCM greenwashing" },
        { value: "67%", label: "Consumatori che abbandonano brand con claim falsi" },
        { value: "3×", label: "Conversion rate con badge verifica" },
        { value: "€29", label: "Pagamento unico, badge incluso" }
      ],
      howItWorks: [
        { step: "01", title: "Inserisci il prodotto", desc: "Nome, categoria, claim marketing e lista ingredienti." },
        { step: "02", title: "AI Claim Extraction", desc: "Claude AI estrae ingredienti, certificazioni, claim di efficacia e ambientali." },
        { step: "03", title: "Verifica multi-fonte", desc: "Open Food Facts, EFSA, Perplexity, DuckDuckGo e SerpAPI verificano ogni claim." },
        { step: "04", title: "Certificato PP + IPFS", desc: "Report su IPFS. Numero PP + badge HTML embeddabile su sito e packaging." }
      ],
      features: [
        { icon: "🛒", title: "E-commerce & Retail", desc: "Conversion rate più alto con claim verificati da terze parti." },
        { icon: "🌿", title: "Food & Beverage", desc: "Verifica 'biologico', 'senza glutine', 'vegan'. Open Food Facts + EFSA." },
        { icon: "💄", title: "Cosmetici & Beauty", desc: "Certifica INCI, 'cruelty-free', 'ipoallergenico'. Database EWG." },
        { icon: "🌱", title: "Sostenibilità & ESG", desc: "Certifica carbon neutral, packaging riciclabile, filiera sostenibile." }
      ],
      targets: [
        { icon: "🏭", title: "Brand FMCG", desc: "Ogni nuovo prodotto certificato prima del lancio. Costo irrisorio vs rischio multa AGCM." },
        { icon: "💻", title: "E-commerce", desc: "Il badge ProofPress aumenta il conversion rate. +23% in 3 mesi per un beauty brand." },
        { icon: "🌍", title: "Brand ESG", desc: "Certifica carbon neutral e packaging riciclabile. Compliance EU Green Claims Directive." }
      ],
      testimonial: {
        initials: "CS",
        name: "Chiara S.",
        role: "Head of Compliance · Beauty Brand",
        text: "Il badge ProofPress sul nostro e-commerce ha aumentato il conversion rate del 23% in 3 mesi."
      },
      pricing: "€29 · Pagamento unico · Certificato permanente su IPFS · Badge embeddabile incluso",
      cta: "CERTIFICA IL TUO PRODOTTO — €29",
      ctaUrl: "https://proofpressverify.com/product-verify"
    }
  };

  const desc = productContents[page.product] ?? productContents["ProofPress Verify™"];

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProofPress Verify™ — ${page.product}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

  <!-- HEADER PROOFPRESS -->
  <tr>
    <td style="background:#0a0f1e;padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td><p style="margin:0;color:#00e5c8;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">ProofPress Magazine · ${dateFormatted}</p></td>
          <td align="right"><a href="https://proofpress.ai" style="color:#888;font-size:11px;text-decoration:none;">proofpress.ai</a></td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SALUTO PRINCIPALE -->
  <tr>
    <td style="background:linear-gradient(135deg,#0a0f1e 0%,#1a2540 100%);padding:40px 32px 32px;text-align:center;">
      <h1 style="margin:0 0 8px;color:#ffffff;font-size:36px;font-weight:900;letter-spacing:-1px;line-height:1;">BUON POMERIGGIO</h1>
      <p style="margin:0 0 24px;color:#00e5c8;font-size:18px;font-weight:600;letter-spacing:1px;">La redazione di ProofPress consiglia</p>
      <div style="display:inline-block;background:rgba(255,85,0,0.15);border:1px solid #ff5500;border-radius:20px;padding:6px 16px;">
        <p style="margin:0;color:#ff5500;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">OGGI: ${page.product}</p>
      </div>
    </td>
  </tr>

  <!-- HERO IMAGE (Pexels) -->
  <tr>
    <td style="padding:0;">
      <img src="${imgs.hero}" alt="${page.product}" width="600" style="display:block;width:100%;max-width:600px;height:280px;object-fit:cover;" />
    </td>
  </tr>

  <!-- INTRO -->
  <tr>
    <td style="padding:32px 32px 16px;">
      <p style="margin:0 0 8px;color:#ff5500;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">PROOFPRESS VERIFY™ · PRODOTTO DEL GIORNO</p>
      <h2 style="margin:0 0 12px;color:#0a0f1e;font-size:28px;font-weight:800;line-height:1.2;">${page.product}</h2>
      <p style="margin:0 0 12px;color:#333;font-size:15px;font-weight:600;line-height:1.5;">${desc.tagline}</p>
      <p style="margin:0;color:#555;font-size:14px;line-height:1.7;">${desc.intro}</p>
    </td>
  </tr>

  <!-- STATS -->
  <tr>
    <td style="padding:16px 32px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;overflow:hidden;">
        <tr>
          ${desc.stats.map(s => `
          <td style="padding:16px;text-align:center;border-right:1px solid #e9ecef;">
            <p style="margin:0 0 4px;color:#ff5500;font-size:20px;font-weight:900;">${s.value}</p>
            <p style="margin:0;color:#666;font-size:11px;line-height:1.3;">${s.label}</p>
          </td>`).join("")}
        </tr>
      </table>
    </td>
  </tr>

  <!-- SEZIONE 1: COME FUNZIONA (testo sinistra + immagine destra) -->
  <tr>
    <td style="padding:0 32px 24px;">
      <p style="margin:0 0 16px;color:#0a0f1e;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #00e5c8;padding-bottom:8px;">COME FUNZIONA</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;width:300px;padding-right:16px;">
            ${desc.howItWorks.map(h => `
            <table cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
              <tr>
                <td style="vertical-align:top;width:32px;">
                  <div style="background:#0a0f1e;color:#00e5c8;font-size:10px;font-weight:900;width:26px;height:26px;border-radius:50%;text-align:center;line-height:26px;">${h.step}</div>
                </td>
                <td style="padding-left:8px;vertical-align:top;">
                  <p style="margin:0 0 2px;color:#0a0f1e;font-size:13px;font-weight:700;">${h.title}</p>
                  <p style="margin:0;color:#666;font-size:12px;line-height:1.5;">${h.desc}</p>
                </td>
              </tr>
            </table>`).join("")}
          </td>
          <td style="vertical-align:top;width:268px;">
            <img src="${imgs.mid}" alt="Come funziona ${page.product}" width="268" style="display:block;width:100%;border-radius:8px;object-fit:cover;height:220px;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SEZIONE 2: FUNZIONALITÀ (immagine sinistra + testo destra) -->
  <tr>
    <td style="padding:0 32px 24px;background:#fafafa;">
      <p style="margin:0 0 16px;color:#0a0f1e;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #00e5c8;padding-bottom:8px;">FUNZIONALITÀ CHIAVE</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;width:200px;padding-right:16px;">
            <img src="${imgs.bottom}" alt="Funzionalità ${page.product}" width="200" style="display:block;width:100%;border-radius:8px;object-fit:cover;height:200px;" />
          </td>
          <td style="vertical-align:top;">
            ${desc.features.map(f => `
            <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
              <tr>
                <td style="vertical-align:top;font-size:16px;width:24px;">${f.icon}</td>
                <td style="padding-left:6px;vertical-align:top;">
                  <p style="margin:0 0 2px;color:#0a0f1e;font-size:12px;font-weight:700;">${f.title}</p>
                  <p style="margin:0;color:#666;font-size:11px;line-height:1.4;">${f.desc}</p>
                </td>
              </tr>
            </table>`).join("")}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PER CHI -->
  <tr>
    <td style="padding:16px 32px 24px;">
      <p style="margin:0 0 16px;color:#0a0f1e;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #00e5c8;padding-bottom:8px;">PER CHI È</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${desc.targets.map(t => `
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:32px;font-size:18px;">${t.icon}</td>
          <td style="padding:8px 0 8px 8px;vertical-align:top;border-bottom:1px solid #f0f0f0;">
            <p style="margin:0 0 2px;color:#0a0f1e;font-size:13px;font-weight:700;">${t.title}</p>
            <p style="margin:0;color:#666;font-size:12px;line-height:1.5;">${t.desc}</p>
          </td>
        </tr>`).join("")}
      </table>
    </td>
  </tr>

  ${desc.testimonial ? `
  <!-- TESTIMONIANZA -->
  <tr>
    <td style="padding:0 32px 24px;">
      <div style="background:#f0f9ff;border-left:4px solid #00e5c8;border-radius:0 8px 8px 0;padding:16px 20px;">
        <p style="margin:0 0 12px;color:#333;font-size:14px;font-style:italic;line-height:1.6;">&ldquo;${desc.testimonial.text}&rdquo;</p>
        <p style="margin:0;color:#0a0f1e;font-size:12px;font-weight:700;">${desc.testimonial.name} <span style="color:#888;font-weight:400;">— ${desc.testimonial.role}</span></p>
      </div>
    </td>
  </tr>` : ""}

  ${desc.pricing ? `
  <!-- PRICING -->
  <tr>
    <td style="padding:0 32px 24px;">
      <div style="background:linear-gradient(135deg,#0a0f1e,#1a2540);border-radius:8px;padding:16px 20px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:14px;font-weight:600;">${desc.pricing}</p>
      </div>
    </td>
  </tr>` : ""}

  <!-- CTA FINALE -->
  <tr>
    <td style="padding:8px 32px 0;background:linear-gradient(135deg,#0a0f1e 0%,#1a2540 100%);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:32px;text-align:center;">
            <p style="margin:0 0 8px;color:#00e5c8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">PROVA GRATIS OGGI</p>
            <h3 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;">Certifica il tuo primo contenuto<br/>in meno di 60 secondi</h3>
            <p style="margin:0 0 24px;color:#aab;font-size:13px;line-height:1.6;">10 certificazioni gratuite · Nessuna carta di credito · Risultato immediato</p>
            <a href="${desc.ctaUrl}" style="display:inline-block;background:#ff5500;color:#ffffff;font-size:16px;font-weight:800;padding:18px 40px;border-radius:8px;text-decoration:none;letter-spacing:1px;">${desc.cta} →</a>
            <p style="margin:16px 0 0;color:#666;font-size:11px;">Vai su <a href="${desc.ctaUrl}" style="color:#00e5c8;text-decoration:none;">${desc.ctaUrl.replace('https://', '')}</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SEPARATOR -->
  <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;" /></td></tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:20px 32px;text-align:center;">
      <p style="margin:0 0 6px;color:#888;font-size:12px;">Questo messaggio è stato inviato da <strong>ProofPress Magazine</strong></p>
      <p style="margin:0 0 6px;color:#888;font-size:12px;">
        <a href="https://proofpress.ai" style="color:#00e5c8;text-decoration:none;">proofpress.ai</a> ·
        <a href="https://proofpressverify.com" style="color:#00e5c8;text-decoration:none;">proofpressverify.com</a>
      </p>
      <p style="margin:0;color:#bbb;font-size:11px;">Hai ricevuto questa email perché sei iscritto alla newsletter di ProofPress.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Invio newsletter preview (14:30) ────────────────────────────────────────

export async function sendPpvNewsletterPreview(): Promise<void> {
  const page = getTodayPpvPage();
  if (!page) {
    console.log("[PPV Newsletter] Nessuna pagina programmata per oggi — skip preview.");
    return;
  }

  console.log(`[PPV Newsletter] Invio preview a ac@acinelli.com per ${page.product}...`);
  const html = buildPpvNewsletterHtml(page);
  const subject = `[PREVIEW] ProofPress Verify™ — ${page.product} · ${new Date().toLocaleDateString("it-IT")}`;

  try {
    await sendEmail({
      to: "ac@acinelli.com",
      subject,
      html,
      sender: "promo"
    });
    console.log(`[PPV Newsletter] ✅ Preview inviata a ac@acinelli.com`);
  } catch (err) {
    console.error("[PPV Newsletter] ❌ Errore invio preview:", err);
  }
}

// ─── Invio newsletter agli iscritti (17:30) ───────────────────────────────────

export async function sendPpvNewsletterToAll(): Promise<void> {
  const page = getTodayPpvPage();
  if (!page) {
    console.log("[PPV Newsletter] Nessuna pagina programmata per oggi — skip invio.");
    return;
  }

  console.log(`[PPV Newsletter] Invio newsletter a tutti gli iscritti per ${page.product}...`);
  const html = buildPpvNewsletterHtml(page);
  const subject = `ProofPress Verify™ — ${page.product}: come funziona e perché conta`;

  try {
    const subs = await getActiveSubscribers();
    console.log(`[PPV Newsletter] Invio a ${subs.length} iscritti attivi...`);
    let sent = 0;
    let errors = 0;
    // Invio in batch da 50
    const BATCH = 50;
    for (let i = 0; i < subs.length; i += BATCH) {
      const batch = subs.slice(i, i + BATCH).map(s => s.email);
      const result = await sendEmail({
        to: batch,
        subject,
        html,
        sender: "promo"
      });
      if (result.success) sent += batch.length;
      else errors += batch.length;
    }
    console.log(`[PPV Newsletter] ✅ Inviata a ${sent} iscritti, ${errors} errori`);
  } catch (err) {
    console.error("[PPV Newsletter] ❌ Errore newsletter:", err);
  }
}
