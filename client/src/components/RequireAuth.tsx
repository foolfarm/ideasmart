/**
 * RequireAuth — wrapper per proteggere le pagine articolo
 *
 * Logica metered paywall:
 * - Utente autenticato → accesso completo sempre
 * - Utente non autenticato:
 *   - Primi 4 articoli/mese → accesso libero (con banner "X rimasti")
 *   - Dal 5° articolo → paywall completo con CTA registrazione
 *
 * Il contatore è salvato in localStorage con reset mensile automatico.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SharedPageHeader from "@/components/SharedPageHeader";
import {
  recordArticleRead,
  getFreeReadsRemaining,
  FREE_LIMIT,
} from "@/hooks/useFreeArticleCounter";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

interface RequireAuthProps {
  children: React.ReactNode;
  /** ID univoco dell'articolo per il contatore (es. "ai-news-123") */
  articleId?: string;
  /** Mostra solo il paywall senza bloccare la pagina (per articoli con preview) */
  overlay?: boolean;
}

export default function RequireAuth({ children, articleId, overlay = false }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useSiteAuth();
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [remaining, setRemaining] = useState<number>(FREE_LIMIT);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      setAccessGranted(true);
      return;
    }

    // Utente non autenticato: controlla il contatore
    const id = articleId ?? window.location.pathname;
    const allowed = recordArticleRead(id);
    setAccessGranted(allowed);
    setRemaining(getFreeReadsRemaining());
  }, [isAuthenticated, isLoading, articleId]);

  // Durante il caricamento mostra uno skeleton neutro
  if (isLoading || accessGranted === null) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin" />
      </div>
    );
  }

  // Utente autenticato → mostra il contenuto senza banner
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Paywall completo (5° articolo in poi)
  const returnTo = encodeURIComponent(window.location.pathname);

  const paywall = (
    <div
      className="border border-[#1a1a1a]/15 bg-[#ffffff] p-8 text-center max-w-[520px] mx-auto my-8"
      style={{ fontFamily: SF }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.2em] mb-4"
        style={{ color: "rgba(26,26,26,0.4)" }}
      >
        Hai raggiunto il limite gratuito
      </p>
      <div style={{ height: "2px", background: "#1a1a1a", marginBottom: "24px" }} />
      <h2
        className="text-xl font-black mb-3"
        style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em", color: "#1a1a1a" }}
      >
        Hai letto i tuoi {FREE_LIMIT} articoli gratuiti del mese
      </h2>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(26,26,26,0.6)" }}>
        Registrati gratis per accesso illimitato a tutte le analisi, ricerche e news
        su AI, Startup e Venture Capital. Richiede meno di un minuto.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/registrati">
          <button
            className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
          >
            Registrati gratis →
          </button>
        </Link>
        <Link href={`/accedi?returnTo=${returnTo}`}>
          <button
            className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-[#1a1a1a]/30 hover:border-[#1a1a1a] transition-colors bg-transparent"
            style={{ color: "#1a1a1a", fontFamily: SF }}
          >
            Accedi
          </button>
        </Link>
      </div>
    </div>
  );

  // Accesso consentito (entro i 4 gratuiti) — mostra il contenuto con banner informativo
  if (accessGranted) {
    const bannerText =
      remaining === 0
        ? "Hai letto l'ultimo articolo gratuito di questo mese."
        : remaining === 1
        ? "Ti rimane 1 articolo gratuito questo mese."
        : `Ti rimangono ${remaining} articoli gratuiti questo mese.`;

    const freeBanner = (
      <div
        className="w-full py-2 px-4 text-center text-[11px] font-semibold"
        style={{
          background: "#1a1a1a",
          color: "#fff",
          fontFamily: SF,
          letterSpacing: "0.04em",
        }}
      >
        {bannerText}{" "}
        <Link href="/registrati">
          <span
            className="underline cursor-pointer hover:opacity-80"
            style={{ color: "#e5c97e" }}
          >
            Registrati gratis per accesso illimitato →
          </span>
        </Link>
      </div>
    );

    if (overlay) {
      return (
        <div className="relative">
          {freeBanner}
          {children}
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ background: "#ffffff" }}>
        <SharedPageHeader />
        {freeBanner}
        {children}
      </div>
    );
  }

  // Paywall completo
  if (overlay) {
    return (
      <div className="relative">
        <div
          className="pointer-events-none select-none"
          style={{
            maxHeight: "320px",
            overflow: "hidden",
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        >
          {children}
        </div>
        {paywall}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <SharedPageHeader />
      <div className="py-8">{paywall}</div>
    </div>
  );
}
