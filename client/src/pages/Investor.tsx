/**
 * Pagina /investor — "Cerchiamo Investitori"
 * ProofPress: la prima piattaforma italiana di giornalismo agentico certificato.
 * Design: sfondo #0a0f1e (navy profondo) + accento #e8c97a (oro) + bianco
 * Tono: pitch board-level, dati concreti, CTA diretta
 */
import { useState } from "react";
import SharedPageHeader from "@/components/SharedPageHeader";
import { trpc } from "@/lib/trpc";

// ─── Dati metriche chiave ────────────────────────────────────────────────────
const METRICS = [
  { value: "6.259", label: "Iscritti newsletter attivi", note: "crescita organica, zero paid" },
  { value: "4.000+", label: "Fonti monitorate ogni giorno", note: "RSS, API, database istituzionali" },
  { value: "100%", label: "Notizie certificate con hash SHA-256", note: "protocollo ProofPress Verify" },
  { value: "24/7", label: "Pipeline agentica autonoma", note: "zero intervento umano nella produzione" },
];

// ─── Perché investire ────────────────────────────────────────────────────────
const WHY = [
  {
    icon: "📰",
    title: "Il mercato è rotto",
    body: "Il 65% degli italiani non si fida più dei media tradizionali (Reuters Institute 2024). La disinformazione costa all'economia globale 78 miliardi di dollari l'anno. ProofPress risolve il problema alla radice: ogni notizia è verificata, certificata e tracciabile.",
  },
  {
    icon: "🤖",
    title: "Tecnologia proprietaria",
    body: "La pipeline agentica ProofPress è l'unica in Italia a combinare multi-agent AI, verifica crittografica e distribuzione certificata in un unico sistema operativo. Non è un prodotto editoriale: è un'infrastruttura per l'informazione del futuro.",
  },
  {
    icon: "📈",
    title: "Traction reale",
    body: "6.259 iscritti attivi alla newsletter in meno di 6 mesi, crescita organica. Lunedì, mercoledì e venerdì: invio massivo a tutta la lista. Open rate superiore alla media di settore. Zero budget marketing.",
  },
  {
    icon: "🌍",
    title: "Mercato enorme, timing perfetto",
    body: "Il mercato globale dei media digitali vale 460 miliardi di dollari. L'AI journalism è ancora un territorio vergine: chi entra ora costruisce il moat. ProofPress è già operativa, con contenuti, utenti e tecnologia.",
  },
  {
    icon: "⚖️",
    title: "Regolatorio: vento in poppa",
    body: "L'AI Act europeo e le nuove norme sulla disinformazione premiano le piattaforme con sistemi di verifica certificata. ProofPress è già conforme e posizionata come standard di riferimento.",
  },
  {
    icon: "🏆",
    title: "Team con track record",
    body: "Fondato da Andrea Cinelli: co-fondatore di Libero.it (10M+ utenti), 2 exit, 25+ brevetti, Advisory Board Deloitte, professore di AI al Sole 24 Ore Business School. Non è la prima volta che costruiamo qualcosa che scala.",
  },
];

// ─── Use case della piattaforma ──────────────────────────────────────────────
const USE_CASES = [
  { label: "Media & Publisher", desc: "Licenza della pipeline per produrre contenuti certificati" },
  { label: "Enterprise", desc: "Intelligence certificata per decisioni C-level e board" },
  { label: "Finanza & Legal", desc: "News verification per compliance, M&A e due diligence" },
  { label: "Istituzioni", desc: "Monitoraggio disinformazione per enti pubblici e PA" },
];

// ─── Timeline ────────────────────────────────────────────────────────────────
const TIMELINE = [
  { phase: "Q2 2026", title: "Seed Round", desc: "Chiusura round pre-seed / seed. Target: 500K–1,5M €" },
  { phase: "Q3 2026", title: "Press Release & PR", desc: "Lancio ufficiale in Italia con copertura media nazionale" },
  { phase: "Q4 2026", title: "Enterprise Pilot", desc: "3 clienti enterprise in beta: media group, banca, PA" },
  { phase: "Q1 2027", title: "Espansione EU", desc: "Versioni in inglese, francese, spagnolo. Target: 50K iscritti" },
];

// ─── Componente principale ───────────────────────────────────────────────────
export default function Investor() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const fontSans =
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
  const fontDisplay =
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

  const submitMutation = trpc.investor.submitInterest.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    submitMutation.mutate({ name, email, message: message || undefined });
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e", fontFamily: fontSans }}>
      <SharedPageHeader />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 60%, #0a1628 100%)",
          borderBottom: "1px solid rgba(232,201,122,0.15)",
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(232,201,122,0.12)",
              border: "1px solid rgba(232,201,122,0.3)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 32,
            }}
          >
            <span style={{ color: "#e8c97a", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              🔒 Pre-Seed Round · Apertura limitata
            </span>
          </div>

          <h1
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: "-0.02em",
            }}
          >
            Il giornalismo è rotto.
            <br />
            <span style={{ color: "#e8c97a" }}>Noi lo stiamo ricostruendo.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              maxWidth: 680,
              margin: "0 auto 40px",
            }}
          >
            ProofPress è la prima piattaforma italiana di giornalismo agentico certificato.
            Ogni notizia è verificata da AI multi-agente, sigillata con hash crittografico e
            distribuita in tempo reale. Non un media: un'infrastruttura per l'informazione del futuro.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#e8c97a",
                color: "#0a0f1e",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                letterSpacing: "0.02em",
                transition: "opacity 0.2s",
              }}
            >
              Sono interessato →
            </a>
            <a
              href="/piattaforma"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: "#ffffff",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "border-color 0.2s",
              }}
            >
              Vedi la tecnologia
            </a>
          </div>
        </div>
      </section>

      {/* ── METRICHE ──────────────────────────────────────────────────────── */}
      <section style={{ background: "#0d1428", padding: "64px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 40 }}>
            Traction attuale · Aprile 2026
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 1,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {METRICS.map((m) => (
              <div
                key={m.value}
                style={{
                  background: "#0d1428",
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: fontDisplay,
                    fontSize: "clamp(28px, 4vw, 40px)",
                    fontWeight: 700,
                    color: "#e8c97a",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {m.value}
                </div>
                <div style={{ color: "#ffffff", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERCHÉ INVESTIRE ──────────────────────────────────────────────── */}
      <section style={{ background: "#0a0f1e", padding: "80px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Perché ProofPress, perché adesso
          </h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 56, maxWidth: 560, margin: "0 auto 56px" }}>
            Sei ragioni per cui questo è il momento giusto per entrare.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {WHY.map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "28px 24px",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, marginBottom: 10, fontFamily: fontDisplay }}>
                  {item.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASE / MERCATO ────────────────────────────────────────────── */}
      <section style={{ background: "#0d1428", padding: "80px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(22px, 3.5vw, 32px)",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 48,
              letterSpacing: "-0.02em",
            }}
          >
            Chi paga per ProofPress
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {USE_CASES.map((uc) => (
              <div
                key={uc.label}
                style={{
                  background: "rgba(232,201,122,0.06)",
                  border: "1px solid rgba(232,201,122,0.15)",
                  borderRadius: 10,
                  padding: "24px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#e8c97a", fontSize: 13, fontWeight: 700, marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {uc.label}
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6 }}>
                  {uc.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ──────────────────────────────────────────────────────── */}
      <section style={{ background: "#0a0f1e", padding: "80px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(22px, 3.5vw, 32px)",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 56,
              letterSpacing: "-0.02em",
            }}
          >
            Roadmap 2026–2027
          </h2>
          <div style={{ position: "relative" }}>
            {/* Linea verticale */}
            <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: "rgba(232,201,122,0.2)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {TIMELINE.map((t, i) => (
                <div key={t.phase} style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                  {/* Dot */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: i === 0 ? "#e8c97a" : "rgba(232,201,122,0.15)",
                      border: "1px solid rgba(232,201,122,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  >
                    <span style={{ color: i === 0 ? "#0a0f1e" : "#e8c97a", fontSize: 11, fontWeight: 700 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <span style={{ color: "#e8c97a", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {t.phase}
                    </span>
                    <h3 style={{ color: "#ffffff", fontSize: 16, fontWeight: 700, margin: "4px 0 6px", fontFamily: fontDisplay }}>
                      {t.title}
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER ───────────────────────────────────────────────────────── */}
      <section style={{ background: "#0d1428", padding: "80px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #e8c97a, #c9a84c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 28,
              fontWeight: 700,
              color: "#0a0f1e",
              fontFamily: fontDisplay,
            }}
          >
            AC
          </div>
          <h2 style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
            Andrea Cinelli
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
            Co-fondatore di Libero.it (10M+ utenti, Infostrada–Olivetti Group) · Head of Mobile VAS Vodafone Global ·
            Serial entrepreneur con 2 exit · 25+ brevetti (tra cui IP alla base di SPID) ·
            Advisory Board Deloitte Central Mediterranean · Professore di AI al Sole 24 Ore Business School ·
            Keynote speaker internazionale
          </p>
          <a
            href="https://www.linkedin.com/in/andreacinelli/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#e8c97a",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            LinkedIn → linkedin.com/in/andreacinelli
          </a>
        </div>
      </section>

      {/* ── FORM CONTATTO ─────────────────────────────────────────────────── */}
      <section id="contact" style={{ background: "#0a0f1e", padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          >
            Sei interessato?
          </h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
            Scrivici. Risponde direttamente Andrea Cinelli entro 24 ore.
            Nessun pitch deck da scaricare: parliamo.
          </p>

          {submitted ? (
            <div
              style={{
                background: "rgba(232,201,122,0.1)",
                border: "1px solid rgba(232,201,122,0.3)",
                borderRadius: 12,
                padding: "40px 32px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <h3 style={{ color: "#e8c97a", fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: fontDisplay }}>
                Messaggio ricevuto
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7 }}>
                Andrea ti risponderà direttamente entro 24 ore.
                <br />
                Nel frattempo, esplora la piattaforma su{" "}
                <a href="https://proofpress.ai" style={{ color: "#e8c97a", textDecoration: "none" }}>
                  proofpress.ai
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mario Rossi"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      color: "#ffffff",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario@fund.com"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      color: "#ffffff",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Messaggio (opzionale)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sono un investitore / fondo / family office interessato a capire di più..."
                  rows={4}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    padding: "12px 14px",
                    color: "#ffffff",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: fontSans,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={submitMutation.isPending || !name || !email}
                style={{
                  background: name && email ? "#e8c97a" : "rgba(232,201,122,0.3)",
                  color: "#0a0f1e",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px 32px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: name && email ? "pointer" : "not-allowed",
                  transition: "opacity 0.2s",
                  fontFamily: fontSans,
                }}
              >
                {submitMutation.isPending ? "Invio in corso..." : "Invia il tuo interesse →"}
              </button>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>
                I tuoi dati non vengono condivisi con terze parti. Nessuna newsletter automatica.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER MINIMAL ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#060a14",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0 }}>
          © 2026 ProofPress · Agentic Certified Journalism Platform ·{" "}
          <a href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            proofpress.ai
          </a>
        </p>
      </div>
    </div>
  );
}
