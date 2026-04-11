/**
 * Pagina /pubblicita — Advertise on Proof Press
 * Promuove gli spazi pubblicitari su newsletter (6.000+ iscritti) e sito (100.000+ visite/mese)
 */

export default function PubblicitaPage() {
  return (
    <main
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "72px 24px 64px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-block",
              background: "#ff5500",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            Pubblicità
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "20px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Raggiungi i decision maker<br />
            <span style={{ color: "#ff5500" }}>dell'AI e del business</span>
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              maxWidth: "600px",
              margin: "0 auto 32px",
            }}
          >
            Proof Press è il media di riferimento per imprenditori, manager e investitori
            che vogliono capire come l'intelligenza artificiale sta ridisegnando il business.
            Ogni inserzione raggiunge un pubblico qualificato, attivo e in crescita.
          </p>
          <a
            href="mailto:info@proofpress.ai?subject=Richiesta%20informazioni%20pubblicit%C3%A0"
            style={{
              display: "inline-block",
              background: "#ff5500",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            Richiedi il media kit →
          </a>
        </div>
      </section>

      {/* ── NUMERI ───────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ff5500",
              marginBottom: "32px",
              textAlign: "center",
            }}
          >
            I nostri numeri
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              { num: "100.000+", label: "Visite mensili al sito", sub: "Lettori unici qualificati" },
              { num: "6.000+",   label: "Iscritti alla newsletter", sub: "Trisettimanale (lun/mer/ven)" },
              { num: "45%",      label: "Open rate medio", sub: "Oltre 2× la media di settore" },
              { num: "8 min",    label: "Tempo medio di lettura", sub: "Alta attenzione e coinvolgimento" },
            ].map((stat) => (
              <div
                key={stat.num}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "28px 24px",
                  textAlign: "center",
                  border: "1px solid rgba(26,26,26,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "#1a1a1a",
                    letterSpacing: "-0.03em",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                    marginBottom: "6px",
                  }}
                >
                  {stat.num}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(26,26,26,0.5)" }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIENCE ─────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Chi legge Proof Press
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(26,26,26,0.6)", marginBottom: "32px", lineHeight: 1.6 }}>
            Il nostro pubblico è composto da professionisti che prendono decisioni strategiche
            ogni giorno e cercano informazione affidabile sull'AI e sull'innovazione.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              { icon: "🏢", title: "C-Level e Manager", desc: "CEO, CTO, CMO e direttori di aziende italiane e internazionali che adottano l'AI nei processi aziendali." },
              { icon: "💼", title: "Investitori e VC", desc: "Business angel, venture capitalist e family office alla ricerca delle prossime opportunità nell'ecosistema AI." },
              { icon: "🚀", title: "Founder e Startupper", desc: "Imprenditori che costruiscono prodotti e servizi basati sull'intelligenza artificiale." },
              { icon: "🎓", title: "Professionisti e Consulenti", desc: "Avvocati, commercialisti, consulenti e professionisti che devono aggiornarsi sull'impatto dell'AI nel loro settore." },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid rgba(26,26,26,0.08)",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    marginBottom: "8px",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(26,26,26,0.6)", lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMATI ──────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Formati pubblicitari disponibili
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(26,26,26,0.6)", marginBottom: "36px", lineHeight: 1.6 }}>
            Ogni formato è progettato per integrarsi naturalmente con i contenuti editoriali
            e massimizzare l'attenzione del lettore senza essere invasivo.
          </p>

          {/* Newsletter */}
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "#ff5500",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: "4px",
                }}
              >
                Newsletter
              </div>
              <span style={{ fontSize: "13px", color: "rgba(26,26,26,0.5)" }}>
                Proof Press Daily · lunedì, mercoledì, venerdì
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  name: "Sponsor principale",
                  desc: "Logo + headline + testo (max 80 parole) + CTA nella parte alta della newsletter. Massima visibilità garantita.",
                  badge: "Top placement",
                },
                {
                  name: "Sponsor secondario",
                  desc: "Blocco testuale con logo nella parte centrale della newsletter. Ideale per brand awareness e lead generation.",
                  badge: "Mid placement",
                },
                {
                  name: "Native content",
                  desc: "Articolo editoriale sponsorizzato scritto dal team Proof Press con il tuo brief. Distribuito come contenuto della newsletter.",
                  badge: "Contenuto nativo",
                },
              ].map((fmt) => (
                <div
                  key={fmt.name}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(26,26,26,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(26,26,26,0.4)",
                      marginBottom: "8px",
                    }}
                  >
                    {fmt.badge}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                    }}
                  >
                    {fmt.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(26,26,26,0.6)", lineHeight: 1.5 }}>
                    {fmt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sito */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "#1a1a1a",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: "4px",
                }}
              >
                Sito Web
              </div>
              <span style={{ fontSize: "13px", color: "rgba(26,26,26,0.5)" }}>
                proofpress.ai · 100.000+ visite/mese
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  name: "Banner header (300×250)",
                  desc: "Due posizioni disponibili nell'header del sito, visibili su ogni pagina. Alta frequenza di esposizione.",
                  badge: "Header",
                },
                {
                  name: "Banner sidebar",
                  desc: "Posizione fissa nella sidebar sinistra, sempre visibile durante la navigazione. Ideale per campagne continuative.",
                  badge: "Sidebar",
                },
                {
                  name: "Articolo sponsorizzato",
                  desc: "Contenuto editoriale con il tuo brand pubblicato sul sito, indicizzato su Google e distribuito nella newsletter.",
                  badge: "Contenuto",
                },
              ].map((fmt) => (
                <div
                  key={fmt.name}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(26,26,26,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(26,26,26,0.4)",
                      marginBottom: "8px",
                    }}
                  >
                    {fmt.badge}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                    }}
                  >
                    {fmt.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(26,26,26,0.6)", lineHeight: 1.5 }}>
                    {fmt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ───────────────────────────────────────────── */}
      <section
        style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Pronto a raggiungere il tuo pubblico?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}
          >
            Scrivici per ricevere il media kit completo con tariffe, disponibilità e
            case study. Risponderemo entro 24 ore lavorative.
          </p>
          <a
            href="mailto:info@proofpress.ai?subject=Richiesta%20media%20kit%20Proof%20Press"
            style={{
              display: "inline-block",
              background: "#ff5500",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              padding: "16px 40px",
              borderRadius: "8px",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            Scrivi a info@proofpress.ai →
          </a>
        </div>
      </section>
    </main>
  );
}
