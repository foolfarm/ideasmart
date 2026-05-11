/**
 * Pagina di iscrizione alla newsletter "Buongiorno ProofPress"
 * URL: /buongiorno
 * Design: editoriale chiaro, stesso stile del banner (crema/oro/nero)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";

const BANNER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/banner-buongiorno-proofpress-GHcwMp3QeVwvrwxhmqE3p9.png";

export default function BuongiornoNewsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError("");
    },
    onError: (err) => {
      setError(err.message || "Errore durante l'iscrizione. Riprova.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Inserisci la tua email per iscriverti.");
      return;
    }
    setError("");
    subscribe.mutate({
      email: email.trim(),
      name: name.trim() || undefined,
      source: "website",
    });
  };

  return (
    <>
      <SEOHead
        title="Buongiorno ProofPress — La newsletter delle 8:30"
        description="Notizie esclusive pre-mercato, informazioni 100% certificate e segnali per decidere meglio. Ogni mattina alle 8:30."
      />

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f9f6ef 0%, #f0ebe0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}>

        {/* Logo / back link */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontSize: 13,
              color: "#888",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>← ProofPress Magazine</span>
          </a>
        </div>

        <div style={{
          maxWidth: 480,
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          border: "1px solid #e8e0d0",
        }}>

          {/* Banner immagine */}
          <img
            src={BANNER_URL}
            alt="Buongiorno ProofPress"
            style={{ width: "100%", display: "block" }}
          />

          {/* Form iscrizione */}
          <div style={{ padding: "32px 28px 28px" }}>
            {!submitted ? (
              <>
                <h2 style={{
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#0a0a0a",
                  margin: "0 0 8px",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                }}>
                  Iscriviti gratis
                </h2>
                <p style={{
                  fontSize: 14,
                  color: "#555",
                  margin: "0 0 24px",
                  lineHeight: 1.6,
                }}>
                  Ogni mattina alle <strong>8:30</strong> ricevi le notizie più importanti del giorno — selezionate, certificate e pronte per le tue decisioni.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Nome (opzionale) */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#888",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}>
                      Nome (opzionale)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Il tuo nome"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid #e0d8cc",
                        borderRadius: 8,
                        fontSize: 15,
                        color: "#1a1a1a",
                        background: "#faf8f4",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#c8a84b")}
                      onBlur={e => (e.target.style.borderColor = "#e0d8cc")}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#888",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="la.tua@email.com"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid #e0d8cc",
                        borderRadius: 8,
                        fontSize: 15,
                        color: "#1a1a1a",
                        background: "#faf8f4",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#c8a84b")}
                      onBlur={e => (e.target.style.borderColor = "#e0d8cc")}
                    />
                  </div>

                  {/* Errore */}
                  {error && (
                    <p style={{
                      fontSize: 13,
                      color: "#c0392b",
                      margin: "0 0 14px",
                      padding: "8px 12px",
                      background: "#fdf0ee",
                      borderRadius: 6,
                      border: "1px solid #f5c6c0",
                    }}>
                      {error}
                    </p>
                  )}

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={subscribe.isPending}
                    style={{
                      width: "100%",
                      padding: "13px 20px",
                      background: subscribe.isPending
                        ? "#ccc"
                        : "linear-gradient(135deg, #c8a84b 0%, #d4b85a 100%)",
                      color: "#1a1a1a",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                      cursor: subscribe.isPending ? "not-allowed" : "pointer",
                      transition: "opacity 0.2s, transform 0.1s",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                    }}
                    onMouseEnter={e => { if (!subscribe.isPending) (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                  >
                    {subscribe.isPending ? "Iscrizione in corso..." : "Iscriviti gratis →"}
                  </button>

                  {/* Privacy note */}
                  <p style={{
                    fontSize: 11,
                    color: "#aaa",
                    textAlign: "center",
                    margin: "14px 0 0",
                    lineHeight: 1.5,
                  }}>
                    Nessuno spam. Cancellati in qualsiasi momento con un click.
                    <br />Leggi la nostra <a href="/privacy" style={{ color: "#c8a84b", textDecoration: "none" }}>Privacy Policy</a>.
                  </p>
                </form>
              </>
            ) : (
              /* Stato di successo */
              <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                <div style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, #c8a84b 0%, #d4b85a 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: 28,
                }}>
                  ☀️
                </div>
                <h2 style={{
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#0a0a0a",
                  margin: "0 0 10px",
                  letterSpacing: "-0.03em",
                }}>
                  Benvenuto a bordo!
                </h2>
                <p style={{
                  fontSize: 15,
                  color: "#555",
                  margin: "0 0 24px",
                  lineHeight: 1.6,
                }}>
                  Da domani mattina alle <strong>8:30</strong> troverai <strong>Buongiorno ProofPress</strong> nella tua casella — notizie certificate, pronte per le tue decisioni.
                </p>
                <a
                  href="/"
                  style={{
                    display: "inline-block",
                    padding: "11px 24px",
                    background: "#1a1a1a",
                    color: "#c8a84b",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  Torna alla Home →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 28,
          fontSize: 12,
          color: "#aaa",
          textAlign: "center",
          maxWidth: 360,
          lineHeight: 1.6,
        }}>
          ProofPress Magazine · Il primo magazine con redazione agentica e informazioni 100% certificate.
        </p>
      </div>
    </>
  );
}
