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

  const productDescriptions: Record<string, { tagline: string; bullets: string[]; cta: string }> = {
    "ProofPress Verify™": {
      tagline: "Il protocollo che certifica ogni contenuto digitale con hash SHA-256 su IPFS.",
      bullets: [
        "669 certificati live — verificabili da chiunque, per sempre",
        "Trust Score A–F calcolato su 4.000+ fonti globali e 4 motori AI",
        "Zero fake: ogni claim fattuale è corroborato e ancorato su blockchain",
        "Funziona per email, notizie, documenti, prodotti e curriculum"
      ],
      cta: "INIZIA GRATIS →"
    },
    "News Verify": {
      tagline: "Certifica ogni articolo claim per claim. Badge trust grade A–F visibile ai lettori.",
      bullets: [
        "Prova IPFS immutabile per ogni articolo pubblicato",
        "Badge embeddabile su sito e newsletter",
        "Differenziati dalla disinformazione con credibilità misurabile",
        "Pensato per redazioni, freelance e brand media"
      ],
      cta: "SCOPRI NEWS VERIFY →"
    },
    "Info Verify": {
      tagline: "Certifica comunicati stampa, report ESG e documenti IR con prova crittografica.",
      bullets: [
        "Prova che il documento non è stato alterato dopo la firma",
        "Compliance-ready per Investor Relations e ESG reporting",
        "Hash SHA-256 + IPFS: verificabile senza ProofPress",
        "Pensato per PR & Comms, Compliance e IR"
      ],
      cta: "SCOPRI INFO VERIFY →"
    },
    "Email Verify": {
      tagline: "Certifica newsletter e comunicazioni finanziarie via BCC. Zero integrazione tecnica.",
      bullets: [
        "Funziona con qualsiasi client email — nessuna modifica tecnica",
        "Certificazione automatica via BCC in ogni invio",
        "Prova crittografica di autenticità per comunicazioni regolatorio",
        "Pensato per newsletter, finanza e compliance email"
      ],
      cta: "SCOPRI EMAIL VERIFY →"
    },
    "CV Verify": {
      tagline: "Certifica il tuo curriculum con hash SHA-256 e notarizzazione IPFS.",
      bullets: [
        "Il numero PP-XXXXXXXX è la tua prova di autenticità verso i recruiter",
        "Verificabile su LinkedIn e da qualsiasi HR",
        "Immutabile: nessuno può alterare il tuo CV certificato",
        "Pensato per candidati, recruiter e HR manager"
      ],
      cta: "CERTIFICA IL TUO CV →"
    },
    "Product Verify": {
      tagline: "Certifica claim di prodotto: ingredienti, sostenibilità, certificazioni.",
      bullets: [
        "Prova crittografica che i claim non sono stati alterati",
        "ESG e sostenibilità: compliance verificabile dai consumatori",
        "Pensato per FMCG, sostenibilità e compliance",
        "Badge verificabile su packaging e sito"
      ],
      cta: "SCOPRI PRODUCT VERIFY →"
    }
  };

  const desc = productDescriptions[page.product] ?? productDescriptions["ProofPress Verify™"];

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ProofPress Verify™ — ${page.product}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr>
    <td style="background:#0a0f1e;padding:24px 32px;text-align:center;">
      <p style="margin:0;color:#00e5c8;font-size:11px;letter-spacing:2px;text-transform:uppercase;">ProofPress Magazine · ${dateFormatted}</p>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">Oggi su ProofPress Verify™</h1>
    </td>
  </tr>

  <!-- HERO IMAGE -->
  <tr>
    <td style="padding:0;">
      <img src="${page.heroImageUrl}" alt="${page.product}" width="600" style="display:block;width:100%;max-width:600px;" />
    </td>
  </tr>

  <!-- PRODOTTO -->
  <tr>
    <td style="padding:32px 32px 16px;">
      <p style="margin:0 0 4px;color:#ff5500;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">PROOFPRESS VERIFY™ · PRODOTTO DEL GIORNO</p>
      <h2 style="margin:0 0 12px;color:#0a0f1e;font-size:28px;font-weight:800;line-height:1.2;">${page.product}</h2>
      <p style="margin:0 0 24px;color:#444;font-size:16px;line-height:1.6;">${desc.tagline}</p>

      <!-- BULLETS -->
      <table cellpadding="0" cellspacing="0" width="100%">
        ${desc.bullets.map(b => `
        <tr>
          <td style="padding:6px 0;vertical-align:top;">
            <span style="color:#00e5c8;font-size:16px;font-weight:700;margin-right:8px;">✓</span>
            <span style="color:#333;font-size:14px;">${b}</span>
          </td>
        </tr>`).join("")}
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="padding:24px 32px 32px;text-align:center;">
      <a href="${page.url}" style="display:inline-block;background:#ff5500;color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:1px;">${desc.cta}</a>
      <p style="margin:16px 0 0;color:#888;font-size:12px;">Certificazione gratuita · Nessuna carta di credito</p>
    </td>
  </tr>

  <!-- SEPARATOR -->
  <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;" /></td></tr>

  <!-- FOOTER PROOFPRESS -->
  <tr>
    <td style="padding:20px 32px;text-align:center;">
      <p style="margin:0 0 4px;color:#888;font-size:12px;">Questo messaggio è stato inviato da <strong>ProofPress Magazine</strong></p>
      <p style="margin:0;color:#888;font-size:12px;">
        <a href="https://proofpress.ai" style="color:#00e5c8;text-decoration:none;">proofpress.ai</a> ·
        <a href="https://proofpressverify.com" style="color:#00e5c8;text-decoration:none;">proofpressverify.com</a>
      </p>
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
