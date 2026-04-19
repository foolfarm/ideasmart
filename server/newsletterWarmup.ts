/**
 * newsletterWarmup.ts
 * Configurazione e helper per il warm-up IP graduale degli invii newsletter.
 *
 * Strategia warm-up:
 * - Settimana 1-2: max 500 email/invio, delay 5 min tra macro-batch da 100
 * - Settimana 3-4: max 800 email/invio, delay 3 min tra macro-batch da 150
 * - Settimana 5+:  nessun limite (lista attuale ~2.463, invio completo)
 *
 * Il warm-up si disattiva automaticamente dopo 5 settimane dall'avvio
 * o quando la lista supera 5.000 iscritti attivi.
 */

// Data di inizio warm-up (impostata al primo deploy post-pulizia lista)
const WARMUP_START_DATE = new Date("2026-04-19T00:00:00Z");

// Configurazione per fase
const WARMUP_PHASES = [
  { weeks: 2, maxRecipients: 500, batchSize: 100, delayMs: 5 * 60 * 1000 },  // Settimane 1-2
  { weeks: 2, maxRecipients: 800, batchSize: 150, delayMs: 3 * 60 * 1000 },  // Settimane 3-4
];

// Dopo le fasi di warm-up: invio completo senza limiti artificiali
const DEFAULT_CONFIG = {
  maxRecipients: Infinity,
  batchSize: 200,
  delayMs: 2 * 1000, // 2 secondi tra batch (rate limiting base)
};

export interface WarmupConfig {
  maxRecipients: number;
  batchSize: number;
  delayMs: number;
  phase: string;
}

/**
 * Restituisce la configurazione di warm-up attuale in base alla settimana.
 */
export function getWarmupConfig(activeSubscriberCount?: number): WarmupConfig {
  // Se la lista supera 5.000, disattiva il warm-up
  if (activeSubscriberCount && activeSubscriberCount > 5000) {
    return { ...DEFAULT_CONFIG, phase: "full-send (lista > 5k)" };
  }

  const now = new Date();
  const msElapsed = now.getTime() - WARMUP_START_DATE.getTime();
  const weeksElapsed = msElapsed / (7 * 24 * 60 * 60 * 1000);

  let cumulativeWeeks = 0;
  for (const phase of WARMUP_PHASES) {
    cumulativeWeeks += phase.weeks;
    if (weeksElapsed < cumulativeWeeks) {
      const phaseNum = WARMUP_PHASES.indexOf(phase) + 1;
      return {
        maxRecipients: phase.maxRecipients,
        batchSize: phase.batchSize,
        delayMs: phase.delayMs,
        phase: `warmup-fase-${phaseNum} (settimana ${Math.floor(weeksElapsed) + 1})`,
      };
    }
  }

  // Warm-up completato
  return { ...DEFAULT_CONFIG, phase: "full-send (warm-up completato)" };
}

/**
 * Helper: pausa asincrona
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Invia email in batch con warm-up IP graduale.
 * Gestisce automaticamente il delay tra macro-batch e il limite di destinatari.
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
  const config = getWarmupConfig(subscribers.length);

  // Applica il limite di destinatari (warm-up)
  const limited = subscribers.length > config.maxRecipients;
  const targetList = limited ? subscribers.slice(0, config.maxRecipients) : subscribers;

  if (limited) {
    console.log(
      `${logPrefix} ⚠️ Warm-up attivo [${config.phase}]: invio limitato a ${config.maxRecipients}/${subscribers.length} iscritti`
    );
  } else {
    console.log(
      `${logPrefix} 📤 Invio a ${targetList.length} iscritti [${config.phase}] — batch: ${config.batchSize}, delay: ${config.delayMs / 1000}s`
    );
  }

  let totalSent = 0;
  let totalErrors = 0;
  let batchNum = 0;

  for (let i = 0; i < targetList.length; i += config.batchSize) {
    const batch = targetList.slice(i, i + config.batchSize);
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

    const progress = Math.min(i + config.batchSize, targetList.length);
    console.log(`${logPrefix} Batch ${batchNum}: ${progress}/${targetList.length} (✓${totalSent} ✗${totalErrors})`);

    // Delay tra macro-batch (non dopo l'ultimo)
    if (i + config.batchSize < targetList.length) {
      console.log(`${logPrefix} Pausa warm-up: ${config.delayMs / 1000}s…`);
      await sleep(config.delayMs);
    }
  }

  console.log(`${logPrefix} ✅ Completato: ${totalSent} inviati, ${totalErrors} errori [${config.phase}]`);
  return { totalSent, totalErrors, limited, config };
}
