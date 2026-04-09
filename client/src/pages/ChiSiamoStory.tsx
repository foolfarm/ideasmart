/**
 * Pagina /chi-siamo-story — La storia di Ideasmart e Adrian Lenice
 * Design: stile editoriale chiaro, coerente con il sito Proof Press
 */

export default function ChiSiamoStory() {
  return (
    <main
      style={{
        background: "#faf8f3",
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
              marginBottom: "24px",
            }}
          >
            Chi siamo
          </div>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: "24px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Nati per fare informazione<br />
            <span style={{ color: "#ff5500" }}>che non può essere falsa.</span>
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
              maxWidth: "620px",
            }}
          >
            Ideasmart nasce da una convinzione semplice: nel mondo dell'AI, 
            chi ha accesso all'informazione giusta vince. 
            Chi si basa su notizie false o superficiali perde — e spesso non lo sa nemmeno.
          </p>
        </div>
      </section>

      {/* ── STORIA ───────────────────────────────────────────────── */}
      <section style={{ padding: "64px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ff5500",
              marginBottom: "16px",
            }}
          >
            La storia
          </div>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              marginBottom: "24px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Da una frustrazione, un'idea.
          </h2>

          <div
            style={{
              fontSize: "17px",
              color: "rgba(26,26,26,0.75)",
              lineHeight: 1.75,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <p>
              Era il 2022. Adrian Lenice, dopo anni tra startup, fondi di venture capital e grandi 
              aziende tecnologiche europee, si trovava ogni mattina a fare la stessa cosa: 
              leggere decine di newsletter, scorrere feed di LinkedIn, aprire articoli su TechCrunch, 
              Sifted, Il Sole 24 Ore — cercando di capire cosa stava davvero succedendo nell'AI.
            </p>
            <p>
              Il problema non era la mancanza di informazione. Era l'eccesso. E soprattutto, 
              era la qualità: notizie non verificate, titoli sensazionalistici, analisi superficiali 
              scritte in fretta per inseguire i trend del momento. 
              <strong style={{ color: "#1a1a1a" }}> Rumore, non segnale.</strong>
            </p>
            <p>
              Da quella frustrazione nasce Ideasmart. Non come un altro media digitale, 
              ma come un sistema editoriale completamente nuovo: una redazione agentica, 
              guidata dall'intelligenza artificiale, capace di analizzare migliaia di fonti ogni giorno, 
              selezionare le notizie rilevanti e — soprattutto — <strong style={{ color: "#1a1a1a" }}>certificarle</strong> 
              {" "}prima di pubblicarle.
            </p>
          </div>
        </div>
      </section>

      {/* ── FONDATORE ────────────────────────────────────────────── */}
      <section style={{ padding: "64px 24px", background: "#faf8f3" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "32px",
              alignItems: "start",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff5500 0%, #1a1a1a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "28px",
                fontWeight: 900,
                color: "#fff",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
              }}
            >
              AL
            </div>

            {/* Bio */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#ff5500",
                  marginBottom: "8px",
                }}
              >
                Fondatore
              </div>
              <h3
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#1a1a1a",
                  letterSpacing: "-0.02em",
                  marginBottom: "4px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                }}
              >
                Adrian Lenice
              </h3>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(26,26,26,0.5)",
                  marginBottom: "16px",
                  fontStyle: "italic",
                }}
              >
                Founder & CEO, Ideasmart · Proof Press
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "rgba(26,26,26,0.72)",
                  lineHeight: 1.7,
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <p>
                  Adrian ha trascorso oltre un decennio al crocevia tra tecnologia, media e finanza. 
                  Ha lavorato con fondi di venture capital europei, acceleratori di startup e 
                  grandi aziende tecnologiche, sviluppando una visione chiara su come l'AI stia 
                  ridisegnando ogni settore dell'economia.
                </p>
                <p>
                  Prima di fondare Ideasmart, ha contribuito a costruire e scalare prodotti digitali 
                  in Italia e in Europa, accumulando una prospettiva rara: quella di chi sa leggere 
                  i mercati, capire la tecnologia e comunicare entrambi in modo accessibile.
                </p>
                <p>
                  La sua convinzione è che <strong style={{ color: "#1a1a1a" }}>l'informazione di qualità 
                  sia un vantaggio competitivo</strong> — e che chiunque, azienda o professionista, 
                  meriti di avere accesso a notizie certificate, non a rumore digitale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOCKQUOTE ───────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 64px", background: "#faf8f3" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <blockquote
            style={{
              borderLeft: "4px solid #ff5500",
              paddingLeft: "24px",
              margin: 0,
            }}
          >
            <p
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1.5,
                fontStyle: "italic",
                marginBottom: "12px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
              }}
            >
              "Volevamo costruire il media che avremmo voluto leggere noi stessi. 
              Uno che non ci facesse perdere tempo, non ci ingannasse, 
              e ci desse ogni mattina le informazioni per prendere decisioni migliori."
            </p>
            <cite
              style={{
                fontSize: "13px",
                color: "rgba(26,26,26,0.5)",
                fontStyle: "normal",
                fontWeight: 600,
              }}
            >
              — Adrian Lenice, Fondatore di Ideasmart
            </cite>
          </blockquote>
        </div>
      </section>

      {/* ── PROOF PRESS ──────────────────────────────────────────── */}
      <section style={{ padding: "64px 24px", background: "#fff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ff5500",
              marginBottom: "16px",
            }}
          >
            Il progetto
          </div>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              marginBottom: "24px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Nasce Proof Press: il primo giornale agentico con informazione certificata.
          </h2>
          <div
            style={{
              fontSize: "17px",
              color: "rgba(26,26,26,0.75)",
              lineHeight: 1.75,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <p>
              Nel 2024, Ideasmart lancia Proof Press: una piattaforma editoriale completamente nuova, 
              costruita attorno a un sistema di agenti AI che lavorano in parallelo — 
              cercano notizie, le analizzano, le confrontano con fonti multiple, 
              le verificano e le pubblicano con un certificato di affidabilità.
            </p>
            <p>
              Ogni articolo pubblicato su Proof Press porta un <strong style={{ color: "#1a1a1a" }}>ProofPress Verify badge</strong>: 
              un hash crittografico che sigilla contenuto, fonti e criteri di analisi, 
              rendendo ogni notizia tracciabile e verificabile nel tempo. 
              Come una notarizzazione digitale del giornalismo.
            </p>
            <p>
              Il risultato: oltre <strong style={{ color: "#1a1a1a" }}>100.000 lettori al mese</strong>, 
              una newsletter trisettimanale con più di <strong style={{ color: "#1a1a1a" }}>6.000 iscritti qualificati</strong> 
              {" "}tra manager, investitori e founder, e una tecnologia che oggi offriamo 
              anche ad altri editori e aziende che vogliono costruire la propria redazione agentica.
            </p>
          </div>
        </div>
      </section>

      {/* ── NUMERI ───────────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", background: "#1a1a1a" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              { num: "2022",    label: "Anno di fondazione" },
              { num: "100k+",  label: "Lettori mensili" },
              { num: "6.000+", label: "Iscritti newsletter" },
              { num: "100%",   label: "Notizie certificate" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "#ff5500",
                    letterSpacing: "-0.03em",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                    marginBottom: "6px",
                  }}
                >
                  {s.num}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALORI ───────────────────────────────────────────────── */}
      <section style={{ padding: "64px 24px", background: "#faf8f3" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ff5500",
              marginBottom: "16px",
            }}
          >
            I nostri valori
          </div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              marginBottom: "32px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Quello in cui crediamo
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {[
              {
                icon: "🔍",
                title: "Verità prima di tutto",
                desc: "Ogni notizia che pubblichiamo è verificata da più fonti indipendenti. Non pubblichiamo mai qualcosa che non possiamo certificare. Preferiamo non uscire piuttosto che uscire con qualcosa di dubbio.",
              },
              {
                icon: "⚡",
                title: "Velocità senza sacrifici",
                desc: "L'AI ci permette di essere veloci quanto i migliori media mondiali, senza abbassare gli standard. Aggiorniamo le notizie in tempo reale, ma ogni articolo passa attraverso il nostro sistema di verifica prima di essere pubblicato.",
              },
              {
                icon: "🎯",
                title: "Rilevanza, non volume",
                desc: "Non pubblichiamo tutto. Selezioniamo le notizie che contano davvero per chi prende decisioni nel mondo dell'AI e del business. Meno rumore, più segnale.",
              },
              {
                icon: "🔓",
                title: "Trasparenza radicale",
                desc: "Ogni articolo mostra le fonti, il metodo di verifica e il badge ProofPress Verify. Il lettore può sempre controllare da dove viene l'informazione e come è stata verificata.",
              },
            ].map((v) => (
              <div
                key={v.title}
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid rgba(26,26,26,0.08)",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: "24px", flexShrink: 0, marginTop: "2px" }}>{v.icon}</div>
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#1a1a1a",
                      marginBottom: "6px",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                    }}
                  >
                    {v.title}
                  </div>
                  <div style={{ fontSize: "14px", color: "rgba(26,26,26,0.65)", lineHeight: 1.6 }}>
                    {v.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#ff5500",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "30px",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
            }}
          >
            Vuoi costruire il tuo giornale agentico?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}
          >
            Offriamo la nostra tecnologia ad editori, aziende e brand che vogliono 
            creare una redazione AI autonoma con informazione certificata.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/chi-siamo"
              style={{
                display: "inline-block",
                background: "#fff",
                color: "#ff5500",
                fontWeight: 800,
                fontSize: "15px",
                padding: "14px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Scopri l'offerta →
            </a>
            <a
              href="mailto:info@proofpress.ai"
              style={{
                display: "inline-block",
                background: "transparent",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                padding: "14px 28px",
                borderRadius: "8px",
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.5)",
                letterSpacing: "0.02em",
              }}
            >
              Scrivici
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
