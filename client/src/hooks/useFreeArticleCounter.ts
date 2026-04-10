/**
 * useFreeArticleCounter
 * Gestisce il contatore di articoli gratuiti per utenti non registrati.
 * - Limite: 4 articoli al mese
 * - Persistenza: localStorage (chiave "pp_free_reads")
 * - Reset: automatico ogni mese di calendario
 * - Struttura localStorage: { count: number, month: "YYYY-MM", readIds: string[] }
 */

const STORAGE_KEY = "pp_free_reads";
const FREE_LIMIT = 4;

interface FreeReadsData {
  count: number;
  month: string; // formato "YYYY-MM"
  readIds: string[]; // IDs articoli già letti (per non contare lo stesso 2 volte)
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function loadData(): FreeReadsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, month: getCurrentMonth(), readIds: [] };
    const parsed: FreeReadsData = JSON.parse(raw);
    // Reset mensile automatico
    if (parsed.month !== getCurrentMonth()) {
      return { count: 0, month: getCurrentMonth(), readIds: [] };
    }
    return parsed;
  } catch {
    return { count: 0, month: getCurrentMonth(), readIds: [] };
  }
}

function saveData(data: FreeReadsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage non disponibile (es. Safari Private) — ignora silenziosamente
  }
}

/**
 * Registra la lettura di un articolo.
 * Restituisce true se l'accesso è consentito (entro il limite),
 * false se il limite è stato superato.
 * @param articleId - ID univoco dell'articolo (es. "ai-news-123")
 */
export function recordArticleRead(articleId: string): boolean {
  const data = loadData();

  // Articolo già letto questo mese → non contare di nuovo
  if (data.readIds.includes(articleId)) {
    return true;
  }

  // Limite superato → blocca
  if (data.count >= FREE_LIMIT) {
    return false;
  }

  // Registra la lettura
  data.count += 1;
  data.readIds.push(articleId);
  saveData(data);
  return true;
}

/**
 * Controlla se l'utente ha ancora articoli gratuiti disponibili
 * SENZA registrare una nuova lettura.
 */
export function canReadFree(articleId?: string): boolean {
  const data = loadData();
  if (articleId && data.readIds.includes(articleId)) return true;
  return data.count < FREE_LIMIT;
}

/**
 * Restituisce quanti articoli gratuiti rimangono questo mese.
 */
export function getFreeReadsRemaining(): number {
  const data = loadData();
  return Math.max(0, FREE_LIMIT - data.count);
}

/**
 * Restituisce il numero totale di articoli letti questo mese.
 */
export function getFreeReadsCount(): number {
  return loadData().count;
}

export { FREE_LIMIT };
