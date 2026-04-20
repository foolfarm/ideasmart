/**
 * RequireAuth — Registration Wall per le pagine articolo di ProofPress
 *
 * Logica hard wall:
 * - Utente autenticato (siteAuth o OAuth) → accesso completo sempre
 * - Utente non autenticato → modale iscrizione newsletter inline
 *   - Inserisce email (+ nome opzionale) → iscrizione + accesso immediato
 *   - Oppure "Accedi" se già registrato
 *
 * Il modale appare sopra un'anteprima sfumata dell'articolo (fade-out).
 * Dopo l'iscrizione, il contenuto si sblocca senza reload.
 */
import { useState } from "react";
import { Link } from "wouter";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SharedPageHeader from "@/components/SharedPageHeader";
import { trpc } from "@/lib/trpc";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

interface RequireAuthProps {
  children: React.ReactNode;
  /** ID univoco dell'articolo (non più usato per il contatore, mantenuto per compatibilità) */
  articleId?: string;
  /** Mostra il wall come overlay sopra l'anteprima (default: false = pagina intera) */
  overlay?: boolean;
}

export default function RequireAuth({ children, overlay = false }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useSiteAuth();

  // Stato form iscrizione
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      // Sblocca il contenuto dopo 1.2s (mostra messaggio di conferma brevemente)
      setTimeout(() => setUnlocked(true), 1200);
    },
    onError: (err) => {
      // Se già iscritto, sblocca comunque
      if (err.message?.toLowerCase().includes("già iscritto") || err.message?.toLowerCase().includes("already")) {
        setSubmitted(true);
        setTimeout(() => setUnlocked(true), 800);
      } else {
        setError(err.message ?? "Errore durante l'iscrizione. Riprova.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }
    subscribeMutation.mutate({ email: email.trim(), name: name.trim() || undefined, source: 'article_wall' });
  };

  // Loading auth
  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin" />
      </div>
    );
  }

  // Autenticato o appena iscritto → accesso completo
  if (isAuthenticated || unlocked) {
    return <>{children}</>;
  }

  const returnTo = encodeURIComponent(window.location.pathname);

  // Modale di iscrizione
  const wall = (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,26,0.12)",
        borderRadius: "2px",
        padding: "40px 36px",
        maxWidth: "480px",
        margin: "0 auto",
        fontFamily: SF,
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "28px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(26,26,26,0.4)",
            marginBottom: "10px",
          }}
        >
          ProofPress · Accesso riservato
        </p>
        <div style={{ height: "2px", background: "#1a1a1a", marginBottom: "20px" }} />
        {submitted ? (
          <div>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
            <h2
              style={{
                fontFamily: SF_DISPLAY,
                fontSize: "20px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#1a1a1a",
                marginBottom: "8px",
              }}
            >
              Iscrizione confermata
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(26,26,26,0.6)", lineHeight: 1.5 }}>
              Benvenuto in ProofPress. Sblocco articolo in corso…
            </p>
          </div>
        ) : (
          <>
            <h2
              style={{
                fontFamily: SF_DISPLAY,
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "#1a1a1a",
                marginBottom: "10px",
                lineHeight: 1.2,
              }}
            >
              Iscriviti gratis e leggi subito
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(26,26,26,0.55)", lineHeight: 1.6 }}>
              Accesso illimitato a tutte le analisi, ricerche e news su AI, Startup e Venture Capital.
              Nessuna carta di credito. Disiscrizione in un click.
            </p>
          </>
        )}
      </div>

      {/* Form */}
      {!submitted && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="text"
            placeholder="Nome (opzionale)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              border: "1px solid rgba(26,26,26,0.18)",
              borderRadius: "2px",
              padding: "11px 14px",
              fontSize: "14px",
              fontFamily: SF,
              color: "#1a1a1a",
              outline: "none",
              background: "#fafafa",
            }}
          />
          <input
            type="email"
            placeholder="La tua email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            style={{
              border: error ? "1px solid #e53e3e" : "1px solid rgba(26,26,26,0.18)",
              borderRadius: "2px",
              padding: "11px 14px",
              fontSize: "14px",
              fontFamily: SF,
              color: "#1a1a1a",
              outline: "none",
              background: "#fafafa",
            }}
          />
          {error && (
            <p style={{ fontSize: "12px", color: "#e53e3e", margin: "0" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              padding: "13px 24px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: subscribeMutation.isPending ? "not-allowed" : "pointer",
              opacity: subscribeMutation.isPending ? 0.6 : 1,
              fontFamily: SF,
              transition: "opacity 0.15s",
            }}
          >
            {subscribeMutation.isPending ? "Iscrizione in corso…" : "Iscriviti gratis e leggi subito →"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(26,26,26,0.1)" }} />
            <span style={{ fontSize: "11px", color: "rgba(26,26,26,0.35)", fontWeight: 600 }}>oppure</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(26,26,26,0.1)" }} />
          </div>

          <Link href={`/accedi?returnTo=${returnTo}`}>
            <button
              type="button"
              style={{
                background: "transparent",
                color: "#1a1a1a",
                border: "1px solid rgba(26,26,26,0.25)",
                borderRadius: "2px",
                padding: "11px 24px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: SF,
                width: "100%",
                transition: "border-color 0.15s",
              }}
            >
              Accedi
            </button>
          </Link>

          <p style={{ fontSize: "10px", color: "rgba(26,26,26,0.35)", textAlign: "center", lineHeight: 1.5 }}>
            Iscrivendoti accetti la nostra{" "}
            <Link href="/privacy-policy">
              <span style={{ textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>
            </Link>
            . Puoi disiscriverti in qualsiasi momento.
          </p>
        </form>
      )}
    </div>
  );

  // Modalità overlay: mostra anteprima sfumata + wall sovrapposto
  if (overlay) {
    return (
      <div style={{ position: "relative" }}>
        {/* Anteprima sfumata */}
        <div
          style={{
            maxHeight: "280px",
            overflow: "hidden",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {children}
        </div>
        {/* Wall */}
        <div style={{ padding: "32px 16px 48px" }}>
          {wall}
        </div>
      </div>
    );
  }

  // Modalità pagina intera
  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <SharedPageHeader />
      <div style={{ padding: "48px 16px 80px" }}>
        {wall}
      </div>
    </div>
  );
}
