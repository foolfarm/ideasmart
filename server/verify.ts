/**
 * PROOFPRESS VERIFY — Sistema di certificazione articoli
 *
 * Ogni articolo pubblicato riceve un hash SHA-256 univoco generato da:
 *   title + summary + sourceUrl + createdAt (ISO string)
 *
 * L'hash viene mostrato sotto ogni articolo come:
 *   VERIFY HASH #<prime 16 cifre hex>
 *
 * Questo garantisce tracciabilità, trasparenza e verificabilità nel tempo,
 * ispirandosi alla notarizzazione del Web3.
 */
import { createHash } from "crypto";

/**
 * Genera un hash SHA-256 per un articolo.
 * @param title - Titolo dell'articolo
 * @param summary - Sommario dell'articolo
 * @param sourceUrl - URL sorgente (opzionale)
 * @param createdAt - Data di creazione (ISO string o Date)
 * @returns Hash SHA-256 completo (64 caratteri hex)
 */
export function generateVerifyHash(
  title: string,
  summary: string,
  sourceUrl?: string | null,
  createdAt?: Date | string | null
): string {
  const payload = [
    title.trim(),
    summary.trim(),
    sourceUrl?.trim() ?? "",
    createdAt ? new Date(createdAt).toISOString() : "",
  ].join("|");

  return createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Formatta l'hash per la visualizzazione pubblica.
 * Mostra solo i primi 16 caratteri hex per leggibilità.
 * @param hash - Hash SHA-256 completo (64 caratteri)
 * @returns Stringa formattata "#xxxxxxxxxxxxxxxx"
 */
export function formatVerifyHash(hash: string): string {
  return `#${hash.substring(0, 16).toUpperCase()}`;
}
