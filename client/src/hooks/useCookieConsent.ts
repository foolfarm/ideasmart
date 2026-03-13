/**
 * useCookieConsent — gestione consenso cookie GDPR
 * Persiste le preferenze nel localStorage con chiave "ideasmart_cookie_consent"
 */
import { useState, useEffect, useCallback } from "react";

export type CookieCategory = "necessary" | "analytics" | "advertising";

export interface CookieConsent {
  necessary: boolean;   // sempre true, non modificabile
  analytics: boolean;   // Google Analytics
  advertising: boolean; // Google AdSense
}

export interface CookieConsentState {
  consent: CookieConsent | null;  // null = non ancora scelto
  hasDecided: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (prefs: Omit<CookieConsent, "necessary">) => void;
  resetConsent: () => void;
}

const STORAGE_KEY = "ideasmart_cookie_consent";
const CONSENT_VERSION = "1"; // incrementare se cambiano le categorie

function loadConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Verifica versione — se cambia, chiedi di nuovo
    if (parsed._version !== CONSENT_VERSION) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      advertising: Boolean(parsed.advertising),
    };
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsent) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...consent, _version: CONSENT_VERSION, _savedAt: Date.now() })
  );
}

export function useCookieConsent(): CookieConsentState {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasDecided, setHasDecided] = useState(false);

  useEffect(() => {
    const stored = loadConsent();
    if (stored) {
      setConsent(stored);
      setHasDecided(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const c: CookieConsent = { necessary: true, analytics: true, advertising: true };
    saveConsent(c);
    setConsent(c);
    setHasDecided(true);
  }, []);

  const rejectAll = useCallback(() => {
    const c: CookieConsent = { necessary: true, analytics: false, advertising: false };
    saveConsent(c);
    setConsent(c);
    setHasDecided(true);
  }, []);

  const saveCustom = useCallback((prefs: Omit<CookieConsent, "necessary">) => {
    const c: CookieConsent = { necessary: true, ...prefs };
    saveConsent(c);
    setConsent(c);
    setHasDecided(true);
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
    setHasDecided(false);
  }, []);

  return { consent, hasDecided, acceptAll, rejectAll, saveCustom, resetConsent };
}
