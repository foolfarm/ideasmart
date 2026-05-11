/**
 * Pagina di iscrizione alla newsletter "Buongiorno ProofPress"
 * URL: /buongiorno
 * Design: editoriale chiaro, stesso stile del banner (crema/oro/nero)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";

const BANNER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/banner-buongiorno-proofpress-GHcwMp3QeVwvrwxhmqE3p9.png";

const VANTAGGI = [
  {
    emoji: "☀️",
    titolo: "Ogni mattina alle 8:30",
    desc: "Le notizie più rilevanti del giorno ti aspettano prima che inizi la tua giornata lavorativa. Nessun rumore, solo segnale.",
  },
  {
    emoji: "🔐",
    titolo: "Informazioni 100% certificate",
    desc: "Ogni notizia è verificata con ProofPress Verify™ — hash SHA-256 su IPFS. Sai sempre che stai leggendo informazioni autentiche.",
  },
  {
    emoji: "📈",
    titolo: "Segnali pre-mercato esclusivi",
    desc: "Analisi di round di investimento, exit, trend tecnologici e movimenti di mercato prima che diventino mainstream.",
  },
  {
    emoji: "🎯",
    titolo: "Curata per decision maker",
    desc: "Selezionata da una redazione agentica AI per CEO, investitori, founder e manager che devono decidere velocemente e bene.",
  },
];

const PREVIEW_ITEMS = [
  { cat: "AI NEWS", titolo: "ChatGPT 5.5 Pro raggiunge livello PhD in matematica", fonte: "TechCrunch" },
  { cat: "STARTUP", titolo: "Startup italiana raccoglie €12M per piattaforma B2B", fonte: "Il Sole 24 Ore" },
  { cat: "FUNDING", titolo: "Sequoia Capital: nuovo fondo da $2.5B per AI verticale", fonte: "Bloomberg" },
  { cat: "TECH", titolo: "La Cina abbandona i modelli generici: pivot verso verticali", fonte: "The Decoder" },
];

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
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}>

        {/* ── Header navigazione ── */}
        <div style={{
          borderBottom: "1px solid #e8e0d0",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
        }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'Space Grotesk', -apple-system, sans-serif",
              fontSize: 18,
              fontWeight: 900,
              color: "#0a0a0a",
              letterSpacing: "-0.04em",
            }}>ProofPress</span>
            <span style={{
              fontSize: 10,
              color: "#888",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>Magazine</span>
          </a>
          <a href="/" style={{
            fontSize: 12,
            color: "#888",
            textDecoration: "none",
            fontWeight: 600,
          }}>← Torna alla Home</a>
        </div>

        {/* ── Layout principale ── */}
        <div style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "48px 20px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "start",
        }}
        className="buongiorno-grid"
        >

          {/* ── Colonna sinistra: info + vantaggi + anteprima ── */}
          <div>
            {/* Banner immagine */}
            <img
              src={BANNER_URL}
              alt="Buongiorno ProofPress"
              style={{
                width: "100%",
                borderRadius: 16,
                boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
                display: "block",
                marginBottom: 32,
              }}
            />

            {/* Vantaggi */}
            <h3 style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#c8a84b",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "0 0 16px",
            }}>Perché iscriversi</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
              {VANTAGGI.map((v) => (
                <div key={v.titolo} style={{
                  display: "flex",
                  gap: 14,
                  padding: "14px 16px",
                  background: "#fff",
                  borderRadius: 10,
                  border: "1px solid #e8e0d0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{v.emoji}</span>
                  <div>
                    <p style={{
                      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                      fontSize: 14,
                      fontWeight: 800,
                      color: "#0a0a0a",
                      margin: "0 0 4px",
                      letterSpacing: "-0.02em",
                    }}>{v.titolo}</p>
                    <p style={{
                      fontSize: 13,
                      color: "#666",
                      margin: 0,
                      lineHeight: 1.5,
                    }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Anteprima newsletter */}
            <h3 style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#c8a84b",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}>Anteprima di oggi</h3>

            <div style={{
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #e8e0d0",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}>
              {/* Header anteprima */}
              <div style={{
                background: "#1a1a1a",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{
                  color: "#c8a84b",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>☀️ Buongiorno ProofPress</span>
                <span style={{ color: "#666", fontSize: 10 }}>Oggi · 8:30</span>
              </div>
              {/* Notizie anteprima */}
              {PREVIEW_ITEMS.map((item, i) => (
                <div key={i} style={{
                  padding: "10px 16px",
                  borderBottom: i < PREVIEW_ITEMS.length - 1 ? "1px solid #f0ebe0" : "none",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}>
                  <span style={{
                    background: "#1a1a1a",
                    color: "#c8a84b",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: 3,
                    flexShrink: 0,
                    marginTop: 2,
                  }}>{item.cat}</span>
                  <div>
                    <p style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#0a0a0a",
                      margin: "0 0 2px",
                      lineHeight: 1.4,
                    }}>{item.titolo}</p>
                    <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>{item.fonte}</p>
                  </div>
                </div>
              ))}
              <div style={{
                padding: "8px 16px",
                background: "#faf8f4",
                borderTop: "1px solid #e8e0d0",
                textAlign: "center",
              }}>
                <span style={{ fontSize: 10, color: "#aaa" }}>+ altre 16 notizie certificate ogni mattina</span>
              </div>
            </div>
          </div>

          {/* ── Colonna destra: form iscrizione ── */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              border: "1px solid #e8e0d0",
            }}>
              {/* Header form */}
              <div style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
                padding: "24px 28px 20px",
              }}>
                <p style={{
                  fontSize: 11,
                  color: "#c8a84b",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: "0 0 8px",
                }}>Newsletter gratuita</p>
                <h2 style={{
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#fff",
                  margin: "0 0 6px",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                }}>Buongiorno ProofPress</h2>
                <p style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  margin: 0,
                  lineHeight: 1.5,
                }}>Ogni mattina alle 8:30 — notizie certificate, pronte per le tue decisioni.</p>
              </div>

              {/* Body form */}
              <div style={{ padding: "28px 28px 24px" }}>
                {!submitted ? (
                  <>
                    {/* Statistiche social proof */}
                    <div style={{
                      display: "flex",
                      gap: 20,
                      marginBottom: 24,
                      padding: "12px 16px",
                      background: "#faf8f4",
                      borderRadius: 8,
                      border: "1px solid #e8e0d0",
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color: "#0a0a0a", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>6.000+</p>
                        <p style={{ fontSize: 10, color: "#888", margin: 0 }}>iscritti</p>
                      </div>
                      <div style={{ width: 1, background: "#e8e0d0" }} />
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color: "#0a0a0a", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>8:30</p>
                        <p style={{ fontSize: 10, color: "#888", margin: 0 }}>ogni mattina</p>
                      </div>
                      <div style={{ width: 1, background: "#e8e0d0" }} />
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color: "#c8a84b", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>100%</p>
                        <p style={{ fontSize: 10, color: "#888", margin: 0 }}>certificate</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Nome */}
                      <div style={{ marginBottom: 14 }}>
                        <label style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#888",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}>Nome (opzionale)</label>
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
                        }}>Email *</label>
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
                        }}>{error}</p>
                      )}

                      {/* CTA */}
                      <button
                        type="submit"
                        disabled={subscribe.isPending}
                        style={{
                          width: "100%",
                          padding: "14px 20px",
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
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                        }}
                        onMouseEnter={e => { if (!subscribe.isPending) (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                      >
                        {subscribe.isPending ? "Iscrizione in corso..." : "☀️ Iscriviti gratis →"}
                      </button>

                      <p style={{
                        fontSize: 11,
                        color: "#aaa",
                        textAlign: "center",
                        margin: "14px 0 0",
                        lineHeight: 1.5,
                      }}>
                        Nessuno spam. Cancellati in qualsiasi momento con un click.
                        <br />
                        <a href="/privacy" style={{ color: "#c8a84b", textDecoration: "none" }}>Privacy Policy</a>
                      </p>
                    </form>
                  </>
                ) : (
                  /* Stato di successo */
                  <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      background: "linear-gradient(135deg, #c8a84b 0%, #d4b85a 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      fontSize: 32,
                    }}>☀️</div>
                    <h2 style={{
                      fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#0a0a0a",
                      margin: "0 0 10px",
                      letterSpacing: "-0.03em",
                    }}>Benvenuto a bordo!</h2>
                    <p style={{
                      fontSize: 14,
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
                        padding: "12px 24px",
                        background: "#1a1a1a",
                        color: "#c8a84b",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                      }}
                    >Torna alla Home →</a>
                  </div>
                )}
              </div>
            </div>

            {/* Nota certificazione */}
            <div style={{
              marginTop: 16,
              padding: "12px 16px",
              background: "rgba(200,168,75,0.08)",
              borderRadius: 8,
              border: "1px solid rgba(200,168,75,0.25)",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔐</span>
              <p style={{
                fontSize: 11,
                color: "#666",
                margin: 0,
                lineHeight: 1.5,
              }}>
                Ogni notizia è certificata con <strong style={{ color: "#0a0a0a" }}>ProofPress Verify™</strong> — hash SHA-256 su IPFS. La tua fonte di informazione è immutabile e verificabile.
              </p>
            </div>
          </div>
        </div>

        {/* ── Responsive: stack su mobile ── */}
        <style>{`
          @media (max-width: 768px) {
            .buongiorno-grid {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}
