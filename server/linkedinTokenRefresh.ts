/**
 * LinkedIn Token Auto-Refresh
 *
 * Gestisce il rinnovo automatico del token LinkedIn usando il refresh token.
 * Il token di accesso scade ogni ~2 mesi; il refresh token dura ~1 anno.
 *
 * Flusso:
 *  1. Controlla la scadenza del token corrente tramite la data nota
 *  2. Se mancano < 7 giorni, chiama /oauth/v2/accessToken con grant_type=refresh_token
 *  3. Aggiorna le variabili d'ambiente in runtime (per il processo corrente)
 *  4. Notifica il proprietario via notifica interna
 */

import { notifyOwner } from "./_core/notification";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID ?? "77jt9gsmcs92s6";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET ?? "WPL_AP1.n0ViE1j1pimoNr0E";

// Token scade il ~16 luglio 2026 (1784108934 UTC)
// Calcolato da: 1778924931 (creazione) + 5184000 (2 mesi in secondi)
export const TOKEN_EXPIRY_UTC = 1784108934;

export interface LinkedInTokenStatus {
  isValid: boolean;
  expiresAt: Date;
  daysUntilExpiry: number;
  needsRefresh: boolean;
  warningLevel: "ok" | "warning" | "critical" | "expired";
}

/**
 * Calcola lo stato del token LinkedIn basandosi sulla data di scadenza nota.
 */
export function getLinkedInTokenStatus(): LinkedInTokenStatus {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(TOKEN_EXPIRY_UTC * 1000);
  const secondsUntilExpiry = TOKEN_EXPIRY_UTC - now;
  const daysUntilExpiry = Math.max(0, Math.floor(secondsUntilExpiry / 86400));

  const isValid = secondsUntilExpiry > 0;
  const needsRefresh = daysUntilExpiry < 7;

  let warningLevel: "ok" | "warning" | "critical" | "expired" = "ok";
  if (!isValid) warningLevel = "expired";
  else if (daysUntilExpiry < 7) warningLevel = "critical";
  else if (daysUntilExpiry < 14) warningLevel = "warning";

  return { isValid, expiresAt, daysUntilExpiry, needsRefresh, warningLevel };
}

/**
 * Tenta di rinnovare il token LinkedIn usando il refresh token.
 * Richiede LINKEDIN_REFRESH_TOKEN nell'ambiente.
 */
export async function refreshLinkedInToken(): Promise<{
  success: boolean;
  newAccessToken?: string;
  newRefreshToken?: string;
  expiresIn?: number;
  error?: string;
}> {
  const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;

  if (!refreshToken) {
    return { success: false, error: "LINKEDIN_REFRESH_TOKEN non configurato" };
  }

  try {
    console.log("[LinkedIn Token] 🔄 Avvio refresh token LinkedIn...");

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    });

    const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok || data.error) {
      const errorMsg = `LinkedIn token refresh fallito: ${data.error_description ?? data.error ?? response.status}`;
      console.error(`[LinkedIn Token] ❌ ${errorMsg}`);
      await notifyOwner({
        title: "⚠️ LinkedIn Token Refresh FALLITO",
        content: `Il rinnovo automatico del token LinkedIn ha fallito.\n\nErrore: ${errorMsg}\n\nAzione richiesta: rinnova manualmente il token su https://developer.linkedin.com/apps/77jt9gsmcs92s6/auth e aggiorna LINKEDIN_ACCESS_TOKEN nei Secrets.`,
      });
      return { success: false, error: errorMsg };
    }

    const newAccessToken = data.access_token as string;
    const newRefreshToken = data.refresh_token as string | undefined;
    const expiresIn = data.expires_in as number;

    // Aggiorna il token in runtime per il processo corrente
    process.env.LINKEDIN_ACCESS_TOKEN = newAccessToken;
    if (newRefreshToken) {
      process.env.LINKEDIN_REFRESH_TOKEN = newRefreshToken;
    }

    console.log(
      `[LinkedIn Token] ✅ Token rinnovato. Scade in ${expiresIn}s (~${Math.floor(expiresIn / 86400)} giorni)`
    );

    await notifyOwner({
      title: "✅ LinkedIn Token Rinnovato Automaticamente",
      content: `Il token LinkedIn è stato rinnovato con successo.\n\n⚠️ AZIONE RICHIESTA: Aggiorna manualmente il secret LINKEDIN_ACCESS_TOKEN nel pannello Settings → Secrets con il nuovo valore:\n\n${newAccessToken.slice(0, 50)}...\n\nScadenza: ${Math.floor(expiresIn / 86400)} giorni da ora.`,
    });

    return { success: true, newAccessToken, newRefreshToken, expiresIn };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[LinkedIn Token] ❌ Errore refresh: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Controlla lo stato del token e avvia il refresh automatico se necessario.
 * Da chiamare all'avvio del server e ogni 24h.
 */
export async function checkAndRefreshLinkedInToken(): Promise<void> {
  const status = getLinkedInTokenStatus();

  if (status.warningLevel === "expired") {
    console.error("[LinkedIn Token] ❌ Token SCADUTO! Pubblicazione LinkedIn non funzionerà.");
    await notifyOwner({
      title: "🚨 LinkedIn Token SCADUTO",
      content: `Il token LinkedIn è scaduto il ${status.expiresAt.toLocaleDateString("it-IT")}.\n\nAzione urgente: genera un nuovo token su https://developer.linkedin.com/apps/77jt9gsmcs92s6/auth e aggiorna LINKEDIN_ACCESS_TOKEN nei Secrets.`,
    });
    return;
  }

  if (status.warningLevel === "critical") {
    console.warn(
      `[LinkedIn Token] ⚠️ Token scade tra ${status.daysUntilExpiry} giorni. Avvio refresh automatico...`
    );
    await refreshLinkedInToken();
    return;
  }

  if (status.warningLevel === "warning") {
    console.warn(`[LinkedIn Token] ⚠️ Token scade tra ${status.daysUntilExpiry} giorni. Notifica inviata.`);
    await notifyOwner({
      title: `⚠️ LinkedIn Token scade tra ${status.daysUntilExpiry} giorni`,
      content: `Il token LinkedIn scade il ${status.expiresAt.toLocaleDateString("it-IT")}.\n\nRinnova il token su https://developer.linkedin.com/apps/77jt9gsmcs92s6/auth entro ${status.daysUntilExpiry} giorni per evitare interruzioni nella pubblicazione automatica.`,
    });
    return;
  }

  console.log(
    `[LinkedIn Token] ✅ Token valido — scade tra ${status.daysUntilExpiry} giorni (${status.expiresAt.toLocaleDateString("it-IT")})`
  );
}
