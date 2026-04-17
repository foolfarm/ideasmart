/**
 * ProofPress Trust Score Engine
 * ─────────────────────────────
 * Calcola il grade A-F per ogni articolo in base a criteri di qualità
 * e verifica crittografica. Il punteggio è deterministico e riproducibile.
 *
 * Criteri e pesi:
 *  1. Certificazione crittografica (SHA-256 verifyHash)  → +40 punti  (obbligatorio)
 *  2. Archiviazione IPFS (ipfsCid presente)              → +25 punti
 *  3. Fonte citata (sourceName + sourceUrl)              → +15 punti
 *  4. Ricchezza del contenuto (lunghezza summary/body)   → 0-15 punti
 *  5. Report di verifica AI (verifyReport presente)      → +5  punti
 *
 * Scala:
 *  A  → 90-100  (certificato, IPFS, fonte, contenuto ricco, report AI)
 *  B  → 75-89   (certificato, IPFS, fonte, contenuto adeguato)
 *  C  → 55-74   (certificato, IPFS, fonte parziale o contenuto breve)
 *  D  → 35-54   (certificato ma senza IPFS o fonte)
 *  F  → 0-34    (non certificato)
 */

export interface TrustInput {
  verifyHash?: string | null;
  ipfsCid?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  summary?: string | null;
  body?: string | null;        // per articoli journalist_articles
  verifyReport?: unknown | null;
}

export interface TrustResult {
  score: number;   // 0-100
  grade: string;   // A | B | C | D | F
  breakdown: {
    cryptoCert: number;
    ipfsArchive: number;
    sourceAttribution: number;
    contentRichness: number;
    aiVerifyReport: number;
  };
}

/**
 * Calcola il Trust Score e il Grade per un articolo.
 * Funzione pura, nessuna chiamata DB o rete.
 */
export function computeTrustGrade(input: TrustInput): TrustResult {
  let score = 0;
  const breakdown = {
    cryptoCert: 0,
    ipfsArchive: 0,
    sourceAttribution: 0,
    contentRichness: 0,
    aiVerifyReport: 0,
  };

  // 1. Certificazione crittografica SHA-256 (+40)
  if (input.verifyHash && input.verifyHash.length === 64) {
    breakdown.cryptoCert = 40;
    score += 40;
  }

  // 2. Archiviazione IPFS (+25)
  if (input.ipfsCid && input.ipfsCid.length > 10) {
    breakdown.ipfsArchive = 25;
    score += 25;
  }

  // 3. Fonte citata (+15: +8 sourceName, +7 sourceUrl)
  if (input.sourceName && input.sourceName.trim().length > 0) {
    breakdown.sourceAttribution += 8;
    score += 8;
  }
  if (input.sourceUrl && input.sourceUrl.trim().length > 0) {
    breakdown.sourceAttribution += 7;
    score += 7;
  }

  // 4. Ricchezza del contenuto (0-15 punti)
  //    Usa body (articoli journalist) oppure summary (news_items)
  const contentText = input.body || input.summary || '';
  const contentLen = contentText.trim().length;
  if (contentLen >= 800) {
    breakdown.contentRichness = 15;
    score += 15;
  } else if (contentLen >= 400) {
    breakdown.contentRichness = 10;
    score += 10;
  } else if (contentLen >= 150) {
    breakdown.contentRichness = 6;
    score += 6;
  } else if (contentLen >= 50) {
    breakdown.contentRichness = 3;
    score += 3;
  }

  // 5. Report di verifica AI (+5)
  if (input.verifyReport && typeof input.verifyReport === 'object') {
    breakdown.aiVerifyReport = 5;
    score += 5;
  }

  // Calcolo grade
  const grade = scoreToGrade(score);

  return { score, grade, breakdown };
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 55) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

/**
 * Descrizione testuale del grade per UI
 */
export function trustGradeLabel(grade: string): string {
  switch (grade) {
    case 'A': return 'Certificazione Massima';
    case 'B': return 'Alta Affidabilità';
    case 'C': return 'Affidabilità Standard';
    case 'D': return 'Verifica Parziale';
    case 'F': return 'Non Verificato';
    default:  return 'Non Valutato';
  }
}

/**
 * Ricalcola il Trust Score dopo che il pin IPFS è stato completato con successo.
 * Aggiorna trustScore e trustGrade nel record DB passato come parametro.
 * Usato nei callback setImmediate post-pin in tutti gli scheduler.
 *
 * @param currentInput - i dati dell'articolo già salvati (con ipfsCid ora disponibile)
 * @returns il nuovo TrustResult con ipfsCid incluso
 */
export function upgradeTrustGradeAfterIpfs(
  currentInput: Omit<TrustInput, 'ipfsCid'> & { ipfsCid: string }
): TrustResult {
  return computeTrustGrade({ ...currentInput });
}

/**
 * Colore badge per grade (Tailwind class suffix)
 */
export function trustGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#00c853'; // verde brillante
    case 'B': return '#00e5c8'; // cyan ProofPress
    case 'C': return '#ff9800'; // arancione
    case 'D': return '#ff5722'; // arancione scuro
    case 'F': return '#9e9e9e'; // grigio
    default:  return '#9e9e9e';
  }
}
