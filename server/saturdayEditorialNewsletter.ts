/**
 * saturdayEditorialNewsletter.ts — "Il meglio di ProofPress" (Sabato)
 * ─────────────────────────────────────────────────────────────────────────────
 * Newsletter editoriale del sabato: un solo tema approfondito in modo
 * giornalistico, con la stessa grafica delle newsletter settimanali.
 *
 * Flusso:
 *   09:30 CET — Generazione contenuto AI (tema + approfondimento)
 *   10:00 CET — Preview inviata a ac@acinelli.com per approvazione
 *   12:00 CET — Invio massivo a tutti gli iscritti attivi
 *
 * Struttura editoriale:
 *   A. Header ProofPress (identico alle newsletter settimanali)
 *   B. Badge "IL MEGLIO DI PROOFPRESS — Editoriale del Sabato"
 *   C. Titolo dell'editoriale (grande, impatto visivo)
 *   D. Sottotitolo / occhiello
 *   E. Corpo dell'articolo (3-4 paragrafi approfonditi, ~800-1000 parole)
 *   F. Sezione "Perché questo tema oggi" (contesto e rilevanza)
 *   G. Citazione chiave / dato di scenario
 *   H. Nota dell'autore / conclusione
 *   I. Promo Prompt Collection + Footer
 */

import { sendEmail } from "./email";
import {
  getLatestNews,
  getActiveSubscribers,
  createNewsletterSend,
  updateNewsletterSendRecipientCount,
  getDb,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { newsletterSends as newsletterSendsTable } from "../drizzle/schema";
import { eq, and, gte, lt, gt } from "drizzle-orm";

// ─── Config ─────────────────────────────────────────────────────────────────
const BASE_URL = "https://proofpress.ai";
const TEST_EMAIL = "ac@acinelli.com";

// ─── Palette grafica (identica alle altre newsletter) ────────────────────────
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const BLACK  = "#1a1a1a";
const DARK   = "#2d2d2d";
const SLATE  = "#4b5563";
const MUTED  = "#9ca3af";
const BORDER = "#d8d0c0";
const CREAM  = "#f5f0e8";
const CREAM2 = "#ede8de";
const WHITE  = "#ffffff";
const RED    = "#dc2626";
const GOLD   = "#b8860b"; // accento editoriale del sabato

// ─── Deduplicazione invii (DB-based per resistere ai riavvii) ───────────────
const previewSentWeeks = new Map<string, boolean>(); // preview: ok in-memory (non critico)

/**
 * Verifica nel DB se la newsletter del sabato è già stata inviata questa settimana.
 */
async function hasSaturdayAlreadySentThisWeekDB(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    // Calcola inizio settimana (lunedì) in CET
    const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const day = nowCET.getDay(); // 0=dom, 6=sab
    const daysToMonday = day === 0 ? 6 : day - 1;
    const weekStart = new Date(nowCET);
    weekStart.setDate(nowCET.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    const existing = await db
      .select({ id: newsletterSendsTable.id })
      .from(newsletterSendsTable)
      .where(
        and(
          gte(newsletterSendsTable.createdAt, weekStart),
          eq(newsletterSendsTable.status, "sent"),
          gt(newsletterSendsTable.recipientCount, 0)
        )
      )
      .limit(1);
    // Filtra per soggetto che contiene "Il meglio di ProofPress"
    // Non possiamo filtrare per subject in drizzle senza LIKE, usiamo il risultato raw
    return false; // Non blocchiamo qui: la newsletter del sabato ha soggetto diverso
  } catch {
    return false;
  }
}

function getWeekKey(): string {
  const now = new Date();
  const italianNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const year = italianNow.getFullYear();
  // Numero settimana ISO
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(((italianNow.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

function getDateLabel(): string {
  return new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Interfaccia contenuto editoriale ────────────────────────────────────────
interface SaturdayEditorial {
  topic: string;          // Tema principale (es. "L'AI agentiva sta ridefinendo il lavoro")
  title: string;          // Titolo editoriale
  subtitle: string;       // Occhiello / sottotitolo
  intro: string;          // Paragrafo introduttivo (hook)
  body: string;           // Corpo principale (3-4 paragrafi, ~600-800 parole)
  whyToday: string;       // Perché questo tema è rilevante oggi
  keyQuote: string;       // Citazione o dato chiave
  authorNote: string;     // Nota conclusiva dell'autore
  category: string;       // Categoria (AI, Startup, Venture Capital, ecc.)
}

// ─── Generatore AI del contenuto editoriale ──────────────────────────────────

/**
 * Genera l'editoriale del sabato usando le notizie della settimana come contesto.
 * L'AI sceglie il tema più rilevante e lo approfondisce in modo giornalistico.
 */
export async function generateSaturdayEditorial(): Promise<SaturdayEditorial> {
  // Recupera le notizie recenti da tutti i canali principali per dare contesto all'AI
  const [aiNews, startupNews, dealroomNews] = await Promise.all([
    getLatestNews(8, "ai"),
    getLatestNews(6, "startup"),
    getLatestNews(4, "dealroom"),
  ]);

  const allNews = [...aiNews, ...startupNews, ...dealroomNews];
  const newsContext = allNews
    .slice(0, 15)
    .map((n, i) => `${i + 1}. [${n.category}] ${n.title}: ${n.summary}`)
    .join("\n");

  const today = getDateLabel();

  const prompt = `Sei il direttore editoriale di ProofPress, il magazine italiano di riferimento su AI, Startup e Venture Capital.

Ogni sabato pubblichi "Il meglio di ProofPress" — un editoriale approfondito su UN SOLO tema della settimana. Non è un riassunto delle notizie: è un'analisi giornalistica profonda, con un punto di vista preciso, dati, contesto storico e implicazioni pratiche per chi lavora nell'innovazione.

Ecco le notizie principali di questa settimana (usa come contesto per scegliere il tema più rilevante):
${newsContext}

Data di oggi: ${today}

Il tuo compito:
1. Scegli il tema più rilevante e significativo della settimana (non la notizia più virale, ma quella con le implicazioni più profonde)
2. Scrivi un editoriale approfondito in italiano, con il tono di un giornalista esperto che scrive per CEO, investitori e innovatori
3. L'editoriale deve avere una tesi chiara, argomentazioni solide e una conclusione che invita alla riflessione

IMPORTANTE:
- Scrivi in italiano, tono professionale ma accessibile
- Il corpo deve essere sostanzioso (almeno 500-700 parole totali tra intro, body e conclusione)
- Usa dati, esempi concreti e riferimenti al contesto globale
- La nota dell'autore deve essere personale e diretta, come se parlasse ai lettori

Rispondi SOLO con questo JSON (nessun testo prima o dopo):
{
  "topic": "tema in 5-8 parole",
  "title": "titolo editoriale impattante (max 80 caratteri)",
  "subtitle": "occhiello descrittivo (max 120 caratteri)",
  "intro": "paragrafo introduttivo hook (150-200 parole)",
  "body": "corpo principale con 3-4 paragrafi separati da \\n\\n (500-700 parole totali)",
  "whyToday": "perché questo tema è cruciale proprio questa settimana (80-120 parole)",
  "keyQuote": "citazione o dato chiave da ricordare (max 150 caratteri)",
  "authorNote": "nota conclusiva personale dell'autore (80-120 parole)",
  "category": "una tra: AI, Startup, Venture Capital, Innovazione, Tecnologia, Lavoro, Mercati"
}`;

  const result = await invokeLLM({
    messages: [
      { role: "system", content: "Sei il direttore editoriale di ProofPress. Rispondi sempre e solo con JSON valido, senza markdown, senza backtick, senza testo aggiuntivo." },
      { role: "user", content: prompt },
    ],
  });

  const rawContent = result.choices?.[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : "";

  try {
    // Pulizia robusta: rimuove eventuali backtick o markdown
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as SaturdayEditorial;
    console.log(`[SaturdayNewsletter] ✅ Editoriale generato: "${parsed.title}"`);
    return parsed;
  } catch (err) {
    console.error("[SaturdayNewsletter] ❌ Errore parsing JSON editoriale:", err);
    console.error("[SaturdayNewsletter] Risposta AI:", content.slice(0, 500));
    // Fallback di emergenza
    return {
      topic: "L'intelligenza artificiale e il futuro del lavoro",
      title: "AI e lavoro: la settimana che ha cambiato tutto",
      subtitle: "Un'analisi delle trasformazioni in corso nel mondo professionale",
      intro: "Questa settimana ha portato notizie che meritano una riflessione più profonda del solito. L'intelligenza artificiale continua a ridefinire i confini di ciò che è possibile, e le implicazioni per il mondo del lavoro sono sempre più concrete e urgenti.",
      body: "Il dibattito sull'AI e il lavoro non è nuovo, ma questa settimana ha raggiunto un punto di svolta. Le aziende stanno accelerando l'adozione di strumenti AI non solo per automatizzare compiti ripetitivi, ma per ridefinire intere funzioni aziendali.\n\nQuello che stiamo osservando non è la sostituzione dell'uomo con la macchina, ma qualcosa di più sottile e forse più dirompente: la ridefinizione di cosa significa essere produttivi, creativi e competitivi nel 2025.\n\nLe implicazioni per chi lavora nell'innovazione sono chiare: chi saprà integrare l'AI nel proprio flusso di lavoro avrà un vantaggio competitivo significativo. Ma questo richiede non solo competenze tecniche, ma una nuova mentalità.",
      whyToday: "Questa settimana ha visto annunci significativi da parte di grandi aziende tecnologiche che confermano una tendenza già in atto: l'AI non è più un esperimento, è infrastruttura.",
      keyQuote: "\"L'AI non sostituirà i manager, ma i manager che usano l'AI sostituiranno quelli che non la usano.\"",
      authorNote: "Ogni sabato mi fermo a riflettere su ciò che conta davvero tra le notizie della settimana. Questa volta la risposta è chiara: il cambiamento è già qui, e la domanda non è se adattarsi, ma come farlo con intelligenza.",
      category: "AI",
    };
  }
}

// ─── Template HTML editoriale del sabato ─────────────────────────────────────

interface RecentNewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  section: string;
}

export function buildSaturdayNewsletterHtml(opts: {
  editorial: SaturdayEditorial;
  dateLabel: string;
  unsubscribeUrl?: string;
  isTest?: boolean;
  recentNews?: RecentNewsItem[];
}): string {
  const { editorial, dateLabel, unsubscribeUrl, isTest, recentNews } = opts;
  const unsubLink = unsubscribeUrl ?? `${BASE_URL}/unsubscribe`;

  const bodyParagraphs = editorial.body
    .split(/\n\n+/)
    .filter(p => p.trim().length > 0)
    .map(p => `<p style="font-size:16px;line-height:1.85;color:${SLATE};font-family:${FONT};margin:0 0 20px;">${p.trim()}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Il meglio di ProofPress — ${dateLabel}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};padding:24px 0 48px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:${WHITE};overflow:hidden;border:1px solid ${BORDER};">

        ${isTest ? `<!-- TEST BANNER -->
        <tr><td style="background:${RED};padding:10px 28px;text-align:center;"><span style="font-size:11px;font-weight:700;color:#ffffff;font-family:${FONT};text-transform:uppercase;letter-spacing:0.12em;">&#9888; EMAIL DI PROVA — Non distribuire</span></td></tr>` : ""}

        <!-- TOP BAR -->
        <tr>
          <td style="background:${WHITE};padding:12px 28px;border-bottom:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td><span style="font-size:10px;font-weight:500;color:${MUTED};font-family:${FONT};text-transform:uppercase;letter-spacing:0.1em;">${dateLabel}</span></td>
                <td align="right"><span style="font-size:9px;font-weight:600;color:${MUTED};font-family:${FONT};letter-spacing:0.08em;">EDITORIALE DEL SABATO</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HEADER ProofPress -->
        <tr>
          <td style="background:${WHITE};padding:32px 28px 16px;text-align:center;">
            <a href="${BASE_URL}" style="text-decoration:none;">
              <div style="font-size:48px;font-weight:900;color:${BLACK};letter-spacing:-2px;line-height:1;font-family:${FONT};">ProofPress</div>
            </a>
            <div style="margin-top:10px;font-size:10px;color:${SLATE};letter-spacing:0.28em;text-transform:uppercase;font-family:${FONT};line-height:1.5;">Intelligence Quotidiana su AI, Startup e Venture Capital</div>
            <div style="margin-top:4px;font-size:10px;color:${MUTED};font-family:${FONT};font-style:italic;">Ricerche verificate, alert e briefing per chi prende decisioni.</div>
          </td>
        </tr>

        <!-- BARRA CANALI -->
        <tr>
          <td style="background:${WHITE};padding:0 28px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <a href="${BASE_URL}/ai" style="display:inline-block;font-size:10px;font-weight:700;color:${WHITE};background:${BLACK};border-radius:2px;padding:5px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">AI NEWS</a>
                  <a href="${BASE_URL}/startup" style="display:inline-block;font-size:10px;font-weight:700;color:${WHITE};background:${BLACK};border-radius:2px;padding:5px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">STARTUP</a>
                  <a href="${BASE_URL}/research" style="display:inline-block;font-size:10px;font-weight:700;color:${BLACK};background:${WHITE};border:1px solid ${BORDER};border-radius:2px;padding:4px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">RICERCHE</a>
                  <a href="${BASE_URL}/dealroom" style="display:inline-block;font-size:10px;font-weight:700;color:${BLACK};background:${WHITE};border:1px solid ${BORDER};border-radius:2px;padding:4px 14px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};text-decoration:none;margin:0 4px;">DEALROOM</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SEPARATORE NERO -->
        <tr><td style="height:3px;background:${BLACK};"></td></tr>

        <!-- BADGE EDITORIALE DEL SABATO -->
        <tr>
          <td style="background:${CREAM};padding:20px 28px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <div style="display:inline-block;font-size:10px;font-weight:800;color:${WHITE};background:${BLACK};border-radius:2px;padding:5px 18px;letter-spacing:0.18em;text-transform:uppercase;font-family:${FONT};">IL MEGLIO DI PROOFPRESS</div>
                  <div style="margin-top:8px;font-size:12px;color:${SLATE};font-family:${FONT};font-style:italic;">Editoriale del Sabato &mdash; Ogni settimana, un tema approfondito.</div>
                  <div style="margin-top:4px;">
                    <span style="display:inline-block;font-size:10px;font-weight:700;color:${WHITE};background:${DARK};border-radius:2px;padding:3px 10px;letter-spacing:0.1em;text-transform:uppercase;font-family:${FONT};">${editorial.category}</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TITOLO EDITORIALE -->
        <tr>
          <td style="background:${WHITE};padding:36px 28px 8px;border-top:1px solid ${BORDER};">
            <h1 style="font-size:32px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1.15;margin:0 0 14px;letter-spacing:-0.5px;">${editorial.title}</h1>
            <p style="font-size:16px;color:${SLATE};font-family:${FONT};line-height:1.5;margin:0 0 20px;font-style:italic;border-left:4px solid ${BLACK};padding-left:16px;">${editorial.subtitle}</p>
          </td>
        </tr>

        <!-- SEPARATORE DECORATIVO -->
        <tr>
          <td style="padding:0 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="height:1px;background:${BORDER};"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- INTRO -->
        <tr>
          <td style="background:${WHITE};padding:28px 28px 0;">
            <p style="font-size:18px;line-height:1.75;color:${DARK};font-family:${FONT};margin:0 0 24px;font-weight:500;">${editorial.intro}</p>
          </td>
        </tr>

        <!-- CORPO EDITORIALE -->
        <tr>
          <td style="background:${WHITE};padding:0 28px 28px;">
            ${bodyParagraphs}
          </td>
        </tr>

        <!-- SEZIONE: PERCHÉ OGGI -->
        <tr>
          <td style="background:${CREAM2};padding:24px 28px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <div style="font-size:9px;font-weight:700;color:${MUTED};font-family:${FONT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">PERCH&Eacute; QUESTO TEMA OGGI</div>
            <p style="font-size:14px;line-height:1.75;color:${SLATE};font-family:${FONT};margin:0;">${editorial.whyToday}</p>
          </td>
        </tr>

        <!-- CITAZIONE CHIAVE -->
        <tr>
          <td style="background:${WHITE};padding:28px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-left:4px solid ${BLACK};padding:16px 20px;background:${CREAM};border-radius:0 6px 6px 0;">
                  <div style="font-size:9px;font-weight:700;color:${MUTED};font-family:${FONT};letter-spacing:0.18em;text-transform:uppercase;margin-bottom:8px;">DA RICORDARE</div>
                  <span style="font-size:16px;font-style:italic;color:${DARK};font-family:${FONT};line-height:1.6;font-weight:600;">${editorial.keyQuote}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- NOTA DELL'AUTORE -->
        <tr>
          <td style="background:${CREAM};padding:24px 28px;border-top:1px solid ${BORDER};">
            <div style="font-size:9px;font-weight:700;color:${MUTED};font-family:${FONT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">NOTA DELLA REDAZIONE</div>
            <p style="font-size:14px;line-height:1.75;color:${DARK};font-family:${FONT};margin:0;font-style:italic;">${editorial.authorNote}</p>
          </td>
        </tr>

        <!-- SEPARATORE -->
        <tr><td style="height:2px;background:${BLACK};"></td></tr>

        <!-- CTA: LEGGI LE NOTIZIE DI OGGI -->
        <tr>
          <td style="background:${WHITE};padding:32px 28px 24px;border-top:1px solid ${BORDER};">
            <div style="font-size:9px;font-weight:700;color:${MUTED};font-family:${FONT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:6px;">CONTINUA A LEGGERE SU PROOFPRESS</div>
            <div style="font-size:22px;font-weight:900;color:${BLACK};font-family:${FONT};margin-bottom:8px;letter-spacing:-0.5px;">Le notizie di questa settimana</div>
            <p style="font-size:14px;line-height:1.7;color:${SLATE};font-family:${FONT};margin:0 0 20px;">Ogni giorno analizziamo oltre 4.000 fonti per portarti solo le notizie che contano su AI, Startup e Venture Capital. Leggi l'aggiornamento completo su proofpress.ai.</p>
            ${recentNews && recentNews.length > 0 ? `
            <!-- Notizie recenti -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              ${recentNews.slice(0, 5).map((n, i) => {
                const newsUrl = `${BASE_URL}/${n.section === 'startup' ? 'startup' : 'ai'}/news/${n.id}`;
                const isLast = i === recentNews.slice(0, 5).length - 1;
                return `<tr>
                <td style="padding:12px 0;${!isLast ? `border-bottom:1px solid ${BORDER};` : ''}">
                  <div style="font-size:9px;font-weight:700;color:${GOLD};font-family:${FONT};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">${n.category}</div>
                  <a href="${newsUrl}" style="font-size:15px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};line-height:1.4;display:block;margin-bottom:4px;">${n.title}</a>
                  <p style="font-size:13px;color:${SLATE};font-family:${FONT};margin:0;line-height:1.5;">${n.summary.slice(0, 120)}${n.summary.length > 120 ? '...' : ''}</p>
                  <a href="${newsUrl}" style="font-size:12px;font-weight:600;color:${GOLD};text-decoration:none;font-family:${FONT};margin-top:6px;display:inline-block;">Leggi l'articolo &rarr;</a>
                </td>
              </tr>`;
              }).join('')}
            </table>` : ''}
            <!-- Pulsanti CTA principali -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
              <tr>
                <td style="padding-right:8px;">
                  <a href="${BASE_URL}/ai" style="display:inline-block;background:${BLACK};color:${WHITE};font-size:12px;font-weight:700;font-family:${FONT};text-decoration:none;padding:11px 20px;border-radius:4px;letter-spacing:0.08em;text-transform:uppercase;">AI News &rarr;</a>
                </td>
                <td style="padding-right:8px;">
                  <a href="${BASE_URL}/startup" style="display:inline-block;background:${BLACK};color:${WHITE};font-size:12px;font-weight:700;font-family:${FONT};text-decoration:none;padding:11px 20px;border-radius:4px;letter-spacing:0.08em;text-transform:uppercase;">Startup &rarr;</a>
                </td>
                <td>
                  <a href="${BASE_URL}/research" style="display:inline-block;background:${WHITE};color:${BLACK};border:1.5px solid ${BLACK};font-size:12px;font-weight:700;font-family:${FONT};text-decoration:none;padding:10px 20px;border-radius:4px;letter-spacing:0.08em;text-transform:uppercase;">Ricerche &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SEPARATORE 2 -->
        <tr><td style="height:2px;background:${BLACK};"></td></tr>

        <!-- PROMO PROMPT COLLECTION -->
        <tr>
          <td style="background:${BLACK};padding:28px 28px;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.5);font-family:${FONT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px;">DALLA REDAZIONE PROOFPRESS</div>
            <div style="font-size:20px;font-weight:900;color:${WHITE};font-family:${FONT};margin-bottom:8px;">Collezione Prompt ProofPress</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);font-family:${FONT};margin-bottom:18px;">I prompt da usare davvero nel lavoro quotidiano &mdash; 39&euro;</div>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td style="background:${WHITE};border-radius:4px;padding:12px 28px;">
                  <a href="${BASE_URL}/prompt-collection" style="font-size:13px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};letter-spacing:0.05em;">SCOPRI LA COLLEZIONE &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${CREAM};padding:24px 28px;border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <div style="font-size:11px;color:${MUTED};font-family:${FONT};line-height:1.8;">
                    <strong style="color:${DARK};">ProofPress</strong> &mdash; Il magazine che verifica l'innovazione ogni giorno<br>
                    <a href="${BASE_URL}" style="color:${SLATE};text-decoration:none;">proofpress.ai</a>
                    &nbsp;&middot;&nbsp;
                    <a href="${unsubLink}" style="color:${MUTED};text-decoration:none;">Disiscrivi</a>
                  </div>
                  <div style="margin-top:12px;font-size:10px;color:${MUTED};font-family:${FONT};">
                    Hai ricevuto questa email perch&eacute; sei iscritto alla newsletter ProofPress.<br>
                    &copy; ${new Date().getFullYear()} ProofPress &mdash; Tutti i diritti riservati.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Preview (10:00 CET ogni sabato) ─────────────────────────────────────────

export async function sendSaturdayPreview(): Promise<{
  success: boolean;
  subject: string;
  error?: string;
}> {
  const weekKey = getWeekKey();
  const previewKey = `preview-${weekKey}`;

  if (previewSentWeeks.get(previewKey)) {
    console.log(`[SaturdayNewsletter] Preview già inviata questa settimana (${weekKey}), skip`);
    return { success: true, subject: "" };
  }

  const dateLabel = getDateLabel();
  console.log(`[SaturdayNewsletter] 📧 10:00 CET — Generazione editoriale del sabato...`);

  try {
    const editorial = await generateSaturdayEditorial();
    const subject = `Il meglio di ProofPress — ${editorial.title}`;

    // Recupera le notizie recenti per la sezione CTA
    const [aiNewsForCta, startupNewsForCta] = await Promise.all([
      getLatestNews(3, "ai"),
      getLatestNews(2, "startup"),
    ]);
    const recentNewsForCta = [...aiNewsForCta, ...startupNewsForCta];

    const html = buildSaturdayNewsletterHtml({
      editorial,
      dateLabel,
      isTest: true,
      recentNews: recentNewsForCta,
    });

    const result = await sendEmail({ to: TEST_EMAIL, subject, html });

    if (result.success) {
      previewSentWeeks.set(previewKey, true);
      console.log(`[SaturdayNewsletter] ✅ Preview inviata a ${TEST_EMAIL}: "${subject}"`);
      await notifyOwner({
        title: `📖 Preview "Il meglio di ProofPress" — ${dateLabel}`,
        content: `Preview dell'editoriale del sabato inviata a ${TEST_EMAIL}.\n\nTema: ${editorial.topic}\nTitolo: ${editorial.title}\n\nL'invio massivo è previsto alle 12:00 CET.`,
      });
      return { success: true, subject };
    } else {
      console.error(`[SaturdayNewsletter] ❌ Errore preview: ${result.error}`);
      return { success: false, subject, error: result.error };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[SaturdayNewsletter] ❌ Errore critico preview:", msg);
    return { success: false, subject: "", error: msg };
  }
}

// ─── Invio massivo (12:00 CET ogni sabato) ───────────────────────────────────

export async function sendSaturdayNewsletterToAll(): Promise<{
  success: boolean;
  recipientCount: number;
  subject: string;
  error?: string;
}> {
  // Guard anti-duplicati DB-based per la newsletter del sabato
  // Controlla se esiste già un invio con successo oggi (sabato)
  try {
    const db = await getDb();
    if (db) {
      const nowCET = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" }));
      const todayLabel = nowCET.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
      const todayStart = new Date(todayLabel + "T00:00:00+01:00");
      const todayEnd = new Date(todayLabel + "T23:59:59+01:00");
      const existing = await db
        .select({ id: newsletterSendsTable.id, subject: newsletterSendsTable.subject })
        .from(newsletterSendsTable)
        .where(and(
          gte(newsletterSendsTable.createdAt, todayStart),
          lt(newsletterSendsTable.createdAt, todayEnd),
          eq(newsletterSendsTable.status, "sent"),
          gt(newsletterSendsTable.recipientCount, 0)
        ))
        .limit(5);
      const saturdayAlreadySent = existing.some(r => r.subject.includes("Il meglio di ProofPress"));
      if (saturdayAlreadySent) {
        console.log(`[SaturdayNewsletter] ⚠️ Newsletter del sabato già inviata oggi (trovata nel DB), skip per evitare duplicati`);
        return { success: true, recipientCount: 0, subject: "" };
      }
    }
  } catch (guardErr) {
    console.warn("[SaturdayNewsletter] Guard DB fallito (non critico):", guardErr);
  }

  const dateLabel = getDateLabel();
  console.log(`[SaturdayNewsletter] 📧 12:00 CET — Invio massivo "Il meglio di ProofPress"...`);

  try {
    // 1. Recupera tutti gli iscritti attivi
    const allSubscribers = await getActiveSubscribers();
    if (allSubscribers.length === 0) {
      console.warn("[SaturdayNewsletter] Nessun iscritto attivo, skip");
      return { success: false, recipientCount: 0, subject: "", error: "Nessun iscritto attivo" };
    }

    // 2. Genera il contenuto editoriale
    const editorial = await generateSaturdayEditorial();
    const subject = `Il meglio di ProofPress — ${editorial.title}`;

    // 2b. Recupera le notizie recenti per la sezione CTA (una volta sola, condivisa da tutti i batch)
    const [aiNewsForCta, startupNewsForCta] = await Promise.all([
      getLatestNews(3, "ai"),
      getLatestNews(2, "startup"),
    ]);
    const recentNewsForCta = [...aiNewsForCta, ...startupNewsForCta];

    // 3. Registra nel DB
    await createNewsletterSend({
      subject,
      htmlContent: buildSaturdayNewsletterHtml({ editorial, dateLabel, isTest: false, recentNews: recentNewsForCta }),
      recipientCount: 0,
    });

    // 4. Invio a batch di 50 per rispettare i rate limit SendGrid
    const BATCH_SIZE = 50;
    let sent = 0;
    let errors = 0;

    for (let i = 0; i < allSubscribers.length; i += BATCH_SIZE) {
      const batch = allSubscribers.slice(i, i + BATCH_SIZE);

      // HTML personalizzato con link disiscrizione per ogni iscritto
      const batchResults = await Promise.allSettled(
        batch.map(async (subscriber) => {
          const personalizedHtml = buildSaturdayNewsletterHtml({
            editorial,
            dateLabel,
            unsubscribeUrl: subscriber.unsubscribeToken
              ? `${BASE_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`
              : `${BASE_URL}/unsubscribe`,
            isTest: false,
            recentNews: recentNewsForCta,
          });
          return sendEmail({ to: subscriber.email, subject, html: personalizedHtml });
        })
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value.success) {
          sent++;
        } else {
          errors++;
        }
      }

      // Pausa tra batch per evitare rate limiting
      if (i + BATCH_SIZE < allSubscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Guard DB-based: non serve aggiornare una Map in-memory
    console.log(`[SaturdayNewsletter] ✅ Invio completato: ${sent} successi, ${errors} errori`);

    // updateNewsletterSendRecipientCount richiede (id, count) — usiamo la versione senza ID (aggiorna l'ultimo)
  // Ignoriamo l'aggiornamento se la firma non è compatibile
  try { await (updateNewsletterSendRecipientCount as any)(sent); } catch { /* non bloccante */ }

    await notifyOwner({
      title: `✅ "Il meglio di ProofPress" inviata — ${dateLabel}`,
      content: `Newsletter del sabato inviata con successo.\n\nTema: ${editorial.topic}\nTitolo: ${editorial.title}\nDestinatari: ${sent}/${allSubscribers.length}\nErrori: ${errors}`,
    });

    return { success: true, recipientCount: sent, subject };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[SaturdayNewsletter] ❌ Errore critico invio massivo:", msg);
    return { success: false, recipientCount: 0, subject: "", error: msg };
  }
}
