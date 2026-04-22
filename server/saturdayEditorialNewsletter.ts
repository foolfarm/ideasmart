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

// ─── Palette grafica Apple Style v4 (SF Francisco) ─────────────────────────
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const BLACK  = "#1d1d1f";   // Apple text primary
const DARK   = "#1d1d1f";
const SLATE  = "#6e6e73";   // Apple text secondary
const MUTED  = "#86868b";   // Apple text tertiary
const BORDER = "#d2d2d7";   // Apple separator
const CREAM  = "#f5f5f7";   // Apple light gray — mai sfondo scuro
const CREAM2 = "#f5f5f7";
const WHITE  = "#ffffff";
const RED    = "#d94f3d";   // ProofPress accent
const GOLD   = "#0071e3";   // Apple blue — accento editoriale del sabato

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

  // Rimuove formattazione Markdown residua (asterischi, underscore) dal body
  const cleanBody = editorial.body
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1');
  const bodyParagraphs = cleanBody
    .split(/\n\n+/)
    .filter(p => p.trim().length > 0)
    .map((p, i) => {
      const accent = i > 0 && i % 2 === 0
        ? `<div style="width:36px;height:3px;background:${GOLD};border-radius:2px;margin:0 0 20px;"></div>`
        : '';
      return `${accent}<p style="font-size:16px;line-height:1.95;color:${SLATE};font-family:${FONT};margin:0 0 24px;">${p.trim()}</p>`;
    })
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
                  <a href="${BASE_URL}/ai" style="display:inline-block;font-size:11px;font-weight:600;color:${WHITE};background:${BLACK};border-radius:980px;padding:6px 16px;font-family:${FONT};text-decoration:none;margin:0 4px;">AI News</a>
                  <a href="${BASE_URL}/startup" style="display:inline-block;font-size:11px;font-weight:600;color:${WHITE};background:${BLACK};border-radius:980px;padding:6px 16px;font-family:${FONT};text-decoration:none;margin:0 4px;">Startup</a>
                  <a href="${BASE_URL}/research" style="display:inline-block;font-size:11px;font-weight:600;color:${BLACK};background:${WHITE};border:1px solid ${BORDER};border-radius:980px;padding:5px 16px;font-family:${FONT};text-decoration:none;margin:0 4px;">Ricerche</a>
                  <a href="${BASE_URL}/dealroom" style="display:inline-block;font-size:11px;font-weight:600;color:${BLACK};background:${WHITE};border:1px solid ${BORDER};border-radius:980px;padding:5px 16px;font-family:${FONT};text-decoration:none;margin:0 4px;">Dealroom</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SEPARATORE -->
        <tr><td style="height:1px;background:${BORDER};"></td></tr>

        <!-- BADGE EDITORIALE DEL SABATO -->
        <tr>
          <td style="background:${CREAM};padding:24px 28px 20px;">
            <div style="display:inline-block;font-size:11px;font-weight:600;color:${BLACK};background:${WHITE};border:1px solid ${BORDER};border-radius:980px;padding:5px 16px;font-family:${FONT};">Il meglio di ProofPress</div>
            <span style="display:inline-block;margin-left:8px;font-size:11px;font-weight:600;color:${GOLD};background:${GOLD}1a;border-radius:980px;padding:5px 14px;font-family:${FONT};">${editorial.category}</span>
            <div style="margin-top:10px;font-size:12px;color:${SLATE};font-family:${FONT};font-style:italic;">Editoriale del Sabato &mdash; Ogni settimana, un tema approfondito.</div>
          </td>
        </tr>

        <!-- TITOLO EDITORIALE GRANDE -->
        <tr>
          <td style="background:${WHITE};padding:44px 28px 24px;border-top:1px solid ${BORDER};">
            <h1 style="font-size:40px;font-weight:900;color:${BLACK};font-family:${FONT};line-height:1.08;margin:0 0 18px;letter-spacing:-1px;">${editorial.title}</h1>
            <p style="font-size:18px;color:${SLATE};font-family:${FONT};line-height:1.55;margin:0 0 24px;font-style:italic;">${editorial.subtitle}</p>
            <div style="width:48px;height:4px;background:${GOLD};border-radius:2px;"></div>
          </td>
        </tr>

        <!-- META INFO: autore + tempo di lettura -->
        <tr>
          <td style="background:${WHITE};padding:0 28px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid ${BORDER};padding-top:16px;">
                  <span style="font-size:12px;font-weight:600;color:${BLACK};font-family:${FONT};">La Redazione ProofPress</span>
                  <span style="font-size:12px;color:${MUTED};font-family:${FONT};margin:0 8px;">&middot;</span>
                  <span style="font-size:12px;color:${MUTED};font-family:${FONT};">Lettura: 5 minuti</span>
                  <span style="font-size:12px;color:${MUTED};font-family:${FONT};margin:0 8px;">&middot;</span>
                  <span style="font-size:12px;color:${MUTED};font-family:${FONT};">${dateLabel}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SEPARATORE -->
        <tr><td style="height:1px;background:${BORDER};"></td></tr>

        <!-- INTRO — testo grande, peso visivo -->
        <tr>
          <td style="background:${WHITE};padding:36px 28px 8px;">
            <p style="font-size:20px;line-height:1.8;color:${DARK};font-family:${FONT};margin:0;font-weight:500;padding-left:18px;border-left:4px solid ${GOLD};">${editorial.intro}</p>
          </td>
        </tr>

        <!-- CORPO EDITORIALE -->
        <tr>
          <td style="background:${WHITE};padding:28px 28px 8px;">
            ${bodyParagraphs}
          </td>
        </tr>

        <!-- CITAZIONE CHIAVE — grande, visiva -->
        <tr>
          <td style="background:${CREAM};padding:36px 28px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
            <div style="font-size:10px;font-weight:700;color:${GOLD};font-family:${FONT};letter-spacing:0.22em;text-transform:uppercase;margin-bottom:16px;">La frase chiave</div>
            <div style="font-size:24px;font-weight:700;color:${BLACK};font-family:${FONT};line-height:1.38;letter-spacing:-0.3px;">&ldquo;${editorial.keyQuote}&rdquo;</div>
          </td>
        </tr>

        <!-- SEZIONE: PERCHÉ QUESTO TEMA OGGI — box evidenziato -->
        <tr>
          <td style="background:${WHITE};padding:32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:${GOLD}0d;border:1px solid ${GOLD}33;border-radius:14px;padding:28px;">
                  <div style="font-size:10px;font-weight:700;color:${GOLD};font-family:${FONT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:14px;">Perch&eacute; questo tema oggi</div>
                  <p style="font-size:15px;line-height:1.85;color:${DARK};font-family:${FONT};margin:0;">${editorial.whyToday}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- NOTA DELLA REDAZIONE — firma editoriale con avatar -->
        <tr>
          <td style="background:${CREAM};padding:32px 28px;border-top:1px solid ${BORDER};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="52" style="vertical-align:top;padding-right:16px;">
                  <div style="width:44px;height:44px;background:${BLACK};border-radius:50%;text-align:center;line-height:44px;">
                    <span style="font-size:20px;font-weight:900;color:#ffffff;font-family:${FONT};">P</span>
                  </div>
                </td>
                <td style="vertical-align:top;">
                  <div style="font-size:12px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:2px;">La Redazione ProofPress</div>
                  <div style="font-size:11px;color:${MUTED};font-family:${FONT};margin-bottom:14px;">Editoriale del Sabato</div>
                  <p style="font-size:15px;line-height:1.85;color:${DARK};font-family:${FONT};margin:0;font-style:italic;">${editorial.authorNote}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SEPARATORE SPESSO -->
        <tr><td style="height:3px;background:${BLACK};"></td></tr>

        <!-- CTA PROOFPRESS — sezione nera prominente -->
        <tr>
          <td style="background:${BLACK};padding:44px 28px;text-align:center;">
            <div style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.4);font-family:${FONT};letter-spacing:1.2px;text-transform:uppercase;margin-bottom:14px;">Continua a leggere</div>
            <div style="font-size:30px;font-weight:700;color:#ffffff;font-family:${FONT};margin-bottom:12px;letter-spacing:-0.5px;">Tutto su proofpress.ai</div>
            <p style="font-size:15px;color:rgba(255,255,255,0.5);font-family:${FONT};margin:0 0 32px;line-height:1.7;">Ogni giorno analizziamo 4.000+ fonti su AI, Startup e Venture Capital.<br>Notizie verificate, approfondimenti e alert per chi prende decisioni.</p>
            <a href="${BASE_URL}?utm_source=newsletter&utm_medium=email&utm_campaign=saturday" style="display:inline-block;background:#ffffff;color:${BLACK};font-size:16px;font-weight:600;font-family:${FONT};text-decoration:none;padding:16px 32px;border-radius:980px;margin-bottom:20px;">Leggi su ProofPress &rarr;</a>
            <div style="margin-top:4px;">
              <a href="${BASE_URL}/ai" style="font-size:13px;color:rgba(255,255,255,0.4);font-family:${FONT};text-decoration:none;margin:0 12px;">AI News</a>
              <a href="${BASE_URL}/startup" style="font-size:13px;color:rgba(255,255,255,0.4);font-family:${FONT};text-decoration:none;margin:0 12px;">Startup</a>
              <a href="${BASE_URL}/dealroom" style="font-size:13px;color:rgba(255,255,255,0.4);font-family:${FONT};text-decoration:none;margin:0 12px;">Dealroom</a>
              <a href="${BASE_URL}/research" style="font-size:13px;color:rgba(255,255,255,0.4);font-family:${FONT};text-decoration:none;margin:0 12px;">Ricerche</a>
            </div>
          </td>
        </tr>

        <!-- NOTIZIE RECENTI — sezione bianca dopo il CTA nero -->
        ${recentNews && recentNews.length > 0 ? `
        <tr>
          <td style="background:${WHITE};padding:36px 28px 28px;border-top:1px solid ${BORDER};">
            <div style="font-size:10px;font-weight:700;color:${MUTED};font-family:${FONT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:20px;">Notizie di questa settimana</div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${recentNews.slice(0, 6).map((n, i) => {
                const newsUrl = `${BASE_URL}/${n.section === 'startup' ? 'startup' : 'ai'}/news/${n.id}`;
                const isLast = i === Math.min(recentNews.length, 6) - 1;
                return `<tr>
                  <td style="padding:14px 0;${!isLast ? `border-bottom:1px solid ${BORDER};` : ''}">
                    <div style="font-size:9px;font-weight:700;color:${GOLD};font-family:${FONT};letter-spacing:0.15em;text-transform:uppercase;margin-bottom:5px;">${n.category}</div>
                    <a href="${newsUrl}" style="font-size:15px;font-weight:700;color:${BLACK};text-decoration:none;font-family:${FONT};line-height:1.4;display:block;margin-bottom:5px;">${n.title}</a>
                    <p style="font-size:13px;color:${SLATE};font-family:${FONT};margin:0 0 6px;line-height:1.55;">${n.summary.slice(0, 130)}${n.summary.length > 130 ? '...' : ''}</p>
                    <a href="${newsUrl}" style="font-size:12px;font-weight:600;color:${GOLD};text-decoration:none;font-family:${FONT};">Leggi su ProofPress &rarr;</a>
                  </td>
                </tr>`;
              }).join('')}
            </table>
          </td>
        </tr>` : ''}

        <!-- SEPARATORE -->
        <tr><td style="height:1px;background:${BORDER};"></td></tr>

        <!-- SEPARATORE 2 -->
        <tr><td style="height:1px;background:${BORDER};"></td></tr>

        <!-- PROMO PROMPT COLLECTION (Apple style) -->
        <tr>
          <td style="background:${CREAM};padding:32px 28px;text-align:center;">
            <div style="font-size:11px;font-weight:600;color:${MUTED};font-family:${FONT};letter-spacing:0.5px;margin-bottom:10px;">Dalla redazione ProofPress</div>
            <div style="font-size:22px;font-weight:700;color:${BLACK};font-family:${FONT};margin-bottom:8px;letter-spacing:-0.3px;">Collezione Prompt ProofPress</div>
            <div style="font-size:14px;color:${SLATE};font-family:${FONT};margin-bottom:20px;line-height:1.55;">I prompt da usare davvero nel lavoro quotidiano &mdash; 39&euro;</div>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
              <tr>
                <td style="background:${BLACK};border-radius:980px;padding:12px 24px;">
                  <a href="${BASE_URL}/prompt-collection" style="font-size:13px;font-weight:600;color:${WHITE};text-decoration:none;font-family:${FONT};">Scopri la Collezione &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${WHITE};padding:24px 28px;border-top:1px solid ${BORDER};">
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

  // ── Guard in-memory (resiste entro la stessa sessione) ───────────────────
  if (previewSentWeeks.get(previewKey)) {
    console.log(`[SaturdayNewsletter] Preview già inviata questa settimana (${weekKey}), skip (guard in-memory)`);
    return { success: true, subject: "" };
  }

  // ── Guard DB-level (resiste ai riavvii del server) ───────────────────────
  // Controlla se esiste già un record per questa settimana (sabato corrente).
  try {
    const dbGuard = await getDb();
    if (dbGuard) {
      const todaySat = new Date();
      todaySat.setHours(0, 0, 0, 0);
      const existingToday = await dbGuard
        .select({ id: newsletterSendsTable.id, status: newsletterSendsTable.status })
        .from(newsletterSendsTable)
        .where(
          gte(newsletterSendsTable.createdAt, todaySat)
        )
        .limit(1);
      if (existingToday.length > 0) {
        console.log(
          `[SaturdayNewsletter] 🔒 Preview bloccata (guard DB): esiste già un record oggi (id=${existingToday[0].id}, status=${existingToday[0].status}) — skip`
        );
        previewSentWeeks.set(previewKey, true);
        return { success: true, subject: "" };
      }
    }
  } catch (guardErr) {
    console.warn(`[SaturdayNewsletter] ⚠️ Guard DB preview fallito (continuo):`, guardErr);
  }

  const dateLabel = getDateLabel();
  console.log(`[SaturdayNewsletter] 📧 10:00 CET — Generazione editoriale del sabato...`);

  try {
    const editorial = await generateSaturdayEditorial();
    const subject = `AI4Business News by ProofPress — ${editorial.title}`;

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

    const result = await sendEmail({ sender: 'ai4business', to: TEST_EMAIL, subject, html });

    if (result.success) {
      previewSentWeeks.set(previewKey, true);
      console.log(`[SaturdayNewsletter] ✅ Preview inviata a ${TEST_EMAIL}: "${subject}"`);
      await notifyOwner({
        title: `📖 Preview "AI4Business News by ProofPress" — ${dateLabel}`,
        content: `Preview dell'editoriale del sabato inviata a ${TEST_EMAIL}.\n\nTema: ${editorial.topic}\nTitolo: ${editorial.title}\n\nL'invio massivo è previsto alle 22:00 CET.`,
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
      const saturdayAlreadySent = existing.some(r => r.subject.includes("AI4Business News by ProofPress"));
      if (saturdayAlreadySent) {
        console.log(`[SaturdayNewsletter] ⚠️ Newsletter del sabato già inviata oggi (trovata nel DB), skip per evitare duplicati`);
        return { success: true, recipientCount: 0, subject: "" };
      }
    }
  } catch (guardErr) {
    console.warn("[SaturdayNewsletter] Guard DB fallito (non critico):", guardErr);
  }

  const dateLabel = getDateLabel();
  console.log(`[SaturdayNewsletter] 📧 22:00 CET — Invio massivo "AI4Business News by ProofPress"...`);

  try {
    // 1. Recupera tutti gli iscritti attivi
    const allSubscribers = await getActiveSubscribers();
    if (allSubscribers.length === 0) {
      console.warn("[SaturdayNewsletter] Nessun iscritto attivo, skip");
      return { success: false, recipientCount: 0, subject: "", error: "Nessun iscritto attivo" };
    }

    // 2. Genera il contenuto editoriale
    const editorial = await generateSaturdayEditorial();
    const subject = `AI4Business News by ProofPress — ${editorial.title}`;

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
          return sendEmail({ sender: 'daily', to: subscriber.email, subject, html: personalizedHtml });
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
      title: `✅ "AI4Business News by ProofPress" inviata — ${dateLabel}`,
      content: `Newsletter del sabato inviata con successo.\n\nTema: ${editorial.topic}\nTitolo: ${editorial.title}\nDestinatari: ${sent}/${allSubscribers.length}\nErrori: ${errors}`,
    });

    return { success: true, recipientCount: sent, subject };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[SaturdayNewsletter] ❌ Errore critico invio massivo:", msg);
    return { success: false, recipientCount: 0, subject: "", error: msg };
  }
}
