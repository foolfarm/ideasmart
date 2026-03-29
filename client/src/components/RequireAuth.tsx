/**
 * RequireAuth — wrapper per proteggere le pagine articolo
 * Se l'utente non è autenticato (cookie sessione assente/scaduto),
 * mostra un paywall con CTA a /registrati e /accedi.
 * Se autenticato, renderizza i children normalmente.
 */
import { Link } from "wouter";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SharedPageHeader from "@/components/SharedPageHeader";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Mostra solo il paywall senza bloccare la pagina (per articoli con preview) */
  overlay?: boolean;
}

export default function RequireAuth({ children, overlay = false }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useSiteAuth();

  // Durante il caricamento mostra uno skeleton neutro
  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin" />
      </div>
    );
  }

  // Utente autenticato → mostra il contenuto
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Utente non autenticato → paywall
  const returnTo = encodeURIComponent(window.location.pathname);

  const paywall = (
    <div
      className="border border-[#1a1a1a]/15 bg-[#faf8f3] p-8 text-center max-w-[520px] mx-auto my-8"
      style={{ fontFamily: SF }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.2em] mb-4"
        style={{ color: "rgba(26,26,26,0.4)" }}
      >
        Contenuto riservato agli iscritti
      </p>
      <div style={{ height: "2px", background: "#1a1a1a", marginBottom: "24px" }} />
      <h2
        className="text-xl font-black mb-3"
        style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em", color: "#1a1a1a" }}
      >
        Registrati gratis per leggere
      </h2>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(26,26,26,0.6)" }}>
        Accedi a tutte le analisi, ricerche e news su AI, Startup e Venture Capital.
        La registrazione è gratuita e richiede meno di un minuto.
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

  if (overlay) {
    // Mostra il contenuto con un fade + paywall sovrapposto
    return (
      <div className="relative">
        <div className="pointer-events-none select-none" style={{ maxHeight: "320px", overflow: "hidden", maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}>
          {children}
        </div>
        {paywall}
      </div>
    );
  }

  // Full-block paywall con testata per una migliore UX
  return (
    <div className="min-h-screen" style={{ background: "#faf8f3" }}>
      <SharedPageHeader />
      <div className="py-8">{paywall}</div>
    </div>
  );
}
