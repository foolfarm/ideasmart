/**
 * newsletterWarmup.ts
 * Invio newsletter senza limiti — warm-up IP completato e rimosso.
 *
 * Strategia: invio diretto a TUTTI gli iscritti attivi, nessun limite artificiale.
 * Batch da 200 con 2 secondi di pausa tra batch (rate limiting base SendGrid).
 *
 * Warm-up rimosso il 2026-04-24 per decisione editoriale.
 * Il dominio proofpress.ai è già autenticato e warm-up completato.
 */

// Configurazione fissa: nessun limite, batch da 200, 2s di pausa tra batch
const FULL_SEND_CONFIG = {
  maxRecipients: Infinity,
  batchSize: 200,
  delayMs: 2 * 1000, // 2 secondi tra batch (rate limiting base)
  phase: "full-send (nessun limite)",
};

export interface WarmupConfig {
  maxRecipients: number;
  batchSize: number;
  delayMs: number;
  phase: string;
}

/**
 * Restituisce sempre la configurazione full-send senza limiti.
 * Il parametro activeSubscriberCount è mantenuto per compatibilità ma ignorato.
 */
export function getWarmupConfig(_activeSubscriberCount?: number): WarmupConfig {
  return FULL_SEND_CONFIG;
}

/**
 * Helper: pausa asincrona
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Invia email in batch a TUTTI gli iscritti senza limiti di warm-up.
 *
 * @param subscribers - Lista completa degli iscritti
 * @param sendFn - Funzione che invia una singola email, restituisce { success: boolean }
 * @param logPrefix - Prefisso per i log (es. "[UnifiedNewsletter]")
 * @returns { totalSent, totalErrors, limited, config }
 */
export async function sendWithWarmup<T extends { email: string }>(
  subscribers: T[],
  sendFn: (sub: T) => Promise<{ success: boolean; error?: string }>,
  logPrefix = "[Newsletter]"
): Promise<{ totalSent: number; totalErrors: number; limited: boolean; config: WarmupConfig }> {
  const config = FULL_SEND_CONFIG;

  console.log(
    `${logPrefix} 📤 Invio a TUTTI i ${subscribers.length} iscritti attivi [${config.phase}] — batch: ${config.batchSize}, delay: ${config.delayMs / 1000}s`
  );

  let totalSent = 0;
  let totalErrors = 0;
  let batchNum = 0;

  for (let i = 0; i < subscribers.length; i += config.batchSize) {
    const batch = subscribers.slice(i, i + config.batchSize);
    batchNum++;

    for (const sub of batch) {
      const result = await sendFn(sub);
      if (result.success) {
        totalSent++;
      } else {
        totalErrors++;
        console.error(`${logPrefix} Errore invio a ${sub.email}:`, result.error);
      }
    }

    const progress = Math.min(i + config.batchSize, subscribers.length);
    console.log(`${logPrefix} Batch ${batchNum}: ${progress}/${subscribers.length} (✓${totalSent} ✗${totalErrors})`);

    // Delay tra batch (non dopo l'ultimo)
    if (i + config.batchSize < subscribers.length) {
      await sleep(config.delayMs);
    }
  }

  console.log(`${logPrefix} ✅ Completato: ${totalSent} inviati, ${totalErrors} errori [${config.phase}]`);
  return { totalSent, totalErrors, limited: false, config };
}
