/**
 * stripLinkedInSignature
 *
 * Rimuove la firma LinkedIn dal testo di un post prima di visualizzarlo
 * nelle pagine web. La firma inizia con "Andrea Cinelli" (riga standalone)
 * e include tutto ciò che segue: titolo, link ProofPress/Base Alpha/Buongiorno,
 * hashtag, ecc.
 *
 * Logica:
 * 1. Taglia tutto a partire dalla prima riga che è esattamente "Andrea Cinelli"
 *    oppure inizia con "Andrea Cinelli |" o "Andrea Cinelli\n"
 * 2. Rimuove le righe di hashtag (#AI #...)
 * 3. Rimuove le righe vuote finali
 */
export function stripLinkedInSignature(text: string): string {
  if (!text) return text;

  const lines = text.split('\n');
  const signatureStartPatterns = [
    /^Andrea Cinelli\s*$/,          // riga standalone "Andrea Cinelli"
    /^Andrea Cinelli\s*\|/,         // "Andrea Cinelli | ..."
    /^Tech Editor\s*[—\-]/,         // "Tech Editor — ProofPress Magazine"
    /^📊\s*ProofPress Magazine/,    // blocco ProofPress
    /^→\s*Italian Edition/,
    /^→\s*International Edition/,
    /^🚀\s*Base Alpha/,
    /^📬\s*Buongiorno ProofPress/,
    /^→\s*lnkd\.in/,
    /^→\s*proofpress\.ai\/buongiorno/,
  ];

  let cutIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (signatureStartPatterns.some(p => p.test(l))) {
      cutIndex = i;
      break;
    }
  }

  let result = cutIndex >= 0 ? lines.slice(0, cutIndex) : lines;

  // Rimuovi righe di soli hashtag (es. "#AI #ArtificialIntelligence ...")
  result = result.filter(l => {
    const trimmed = l.trim();
    if (!trimmed) return true; // mantieni righe vuote intermedie
    // Riga di hashtag: tutti i token iniziano con #
    const tokens = trimmed.split(/\s+/);
    return !tokens.every(t => t.startsWith('#'));
  });

  // Rimuovi righe vuote finali
  while (result.length > 0 && result[result.length - 1].trim() === '') {
    result.pop();
  }

  return result.join('\n');
}
