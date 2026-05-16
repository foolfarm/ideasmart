/**
 * Pagina /chi-siamo-story — La storia di Ideasmart e ProofPress
 * Layout identico a /chi-siamo: LeftSidebar + SharedPageHeader + BreakingNewsTicker + SharedPageFooter
 */
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ContactForm from "@/components/ContactForm";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function Section({ children, bg = "#ffffff", id }: { children: React.ReactNode; bg?: string; id?: string }) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-4"
      style={{ fontFamily: FONT }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

export default function ChiSiamoStory() {
  return (
    <div className="flex min-h-screen">
      
      <div className="flex-1 min-w-0">
        <SEOHead
          title="La nostra storia — ProofPress"
          description="Non è nata in un garage. È nata in una chat. La storia di Ideasmart: dal bulletin board dei nerd alla prima piattaforma di giornalismo agentico con informazione certificata."
          canonical="https://proofpress.ai/chi-siamo-story"
          ogSiteName="Proof Press"
        />

        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          {/* ═══════════════════════════════════════════════════════
              HERO
          ═══════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label>La storia</Label>
              <h1
                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-8"
                style={{ fontFamily: FONT, color: "#0a0a0a" }}
              >
                Non è nata<br />
                in un garage.<br />
                <span style={{ color: "#ff5500" }}>È nata in una chat.</span>
              </h1>
              <p
                className="text-xl md:text-2xl leading-relaxed max-w-3xl"
                style={{ color: "#0a0a0a", opacity: 0.6 }}
              >
                Era il 2022. Un gruppo sparso tra Milano, Lisbona, Berlino e Tel Aviv aveva un problema
                comune: troppo rumore, troppo poco segnale. Così se lo sono costruito da soli.
              </p>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              TIMELINE
          ═══════════════════════════════════════════════════════ */}
          <section className="py-12 md:py-16" style={{ background: "#f8f8f6" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="relative">
                {/* Linea orizzontale connettore */}
                <div
                  className="hidden md:block absolute top-8 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent 0%, #ff5500 20%, #ff5500 80%, transparent 100%)", opacity: 0.3 }}
                />
                <div className="grid md:grid-cols-4 gap-8 relative z-10">
                  {[
                    { year: "2022", dot: "#ff5500", title: "Nasce Ideasmart", desc: "Bulletin board interno tra 15 nerd a Milano, Lisbona, Berlino e Tel Aviv. Strumento di sopravvivenza informativa." },
                    { year: "2023", dot: "#ff8833", title: "Da 1 a 12 agenti", desc: "I modelli generativi accelerano tutto. Nasce la redazione agentica con 12 agenti specializzati coordinati da un team genetico." },
                    { year: "2024", dot: "#ffaa55", title: "ProofPress Verify", desc: "Nasce l'algoritmo originale che certifica ogni notizia con hash crittografico e notarizzazione Web3." },
                    { year: "2026", dot: "#0a0f1e", title: "Ideasmart → ProofPress", desc: "Il prodotto diventa piattaforma. Chiunque può costruirsi la propria redazione AI con informazione certificata." },
                  ].map(({ year, dot, title, desc }) => (
                    <div key={year} className="flex flex-col items-start">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: dot, boxShadow: `0 0 0 4px ${dot}22` }}
                        />
                        <span
                          className="text-2xl font-black"
                          style={{ fontFamily: FONT, color: dot }}
                        >
                          {year}
                        </span>
                      </div>
                      <div className="font-bold text-sm mb-2" style={{ color: "#0a0a0a" }}>{title}</div>
                      <div className="text-sm leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.6 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              ORIGINI
          ═══════════════════════════════════════════════════════ */}
          <Section>
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <Label>2022 — Le origini</Label>
                <h2
                  className="text-3xl md:text-4xl font-black leading-tight mb-6"
                  style={{ fontFamily: FONT }}
                >
                  Sviluppatori, investitori nerd, venture capitalist con il vizio dell'informazione compulsiva.
                </h2>
              </div>
              <div className="space-y-5">
                <p className="text-base md:text-lg leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.75 }}>
                  Ogni giorno la stessa routine: aprire trenta tab, incrociare cinque newsletter, litigare su
                  Telegram su quale notizia fosse vera e quale fosse hype travestito da segnale.
                </p>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.75 }}>
                  Non erano giornalisti. Erano gente che prendeva decisioni con i soldi degli altri e aveva
                  bisogno di capire cosa stava succedendo davvero — non cosa qualcuno voleva fargli credere.
                </p>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.75 }}>
                  Così hanno fatto quello che fanno i nerd quando qualcosa non funziona: se lo sono costruito
                  da soli. Un bulletin board interno. Un aggregatore crudo, brutto, funzionale. Un posto dove
                  le notizie arrivavano filtrate, incrociate, senza titoli clickbait.
                </p>
                <blockquote
                  className="border-l-4 pl-6 py-2 text-lg font-semibold italic"
                  style={{ borderColor: "#ff5500", color: "#0a0a0a", opacity: 0.85 }}
                >
                  "Si chiamava Ideasmart e serviva a un gruppo di quindici persone. Non era un prodotto.
                  Era uno strumento di sopravvivenza informativa."
                </blockquote>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              AI GENERATIVA
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6">
            <Label>L'accelerazione — Da 1 agente a 12</Label>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-10 max-w-3xl"
              style={{ fontFamily: FONT }}
            >
              Poi è arrivata l'AI generativa. E tutto è cambiato.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {[
                { num: "12", label: "Agenti giornalisti specializzati", desc: "Ognuno con un ruolo, un beat, una competenza." },
                { num: "4.000+", label: "Fonti monitorate 24/7", desc: "Analizzate, incrociate, verificate in tempo reale." },
                { num: "100%", label: "Notizie certificate", desc: "Ogni articolo sigillato con ProofPress Verify." },
              ].map(({ num, label, desc }) => (
                <div key={num} className="p-6 rounded-xl" style={{ background: "#ffffff", border: "1px solid rgba(10,10,10,0.08)" }}>
                  <div className="text-4xl font-black mb-2" style={{ color: "#ff5500" }}>{num}</div>
                  <div className="font-bold text-sm mb-1">{label}</div>
                  <div className="text-sm" style={{ color: "#0a0a0a", opacity: 0.55 }}>{desc}</div>
                </div>
              ))}
            </div>
            <p className="text-base md:text-lg leading-relaxed max-w-3xl" style={{ color: "#0a0a0a", opacity: 0.75 }}>
              Con i primi modelli generativi, il gruppo ha iniziato a sperimentare: un agente che leggeva le fonti.
              Poi uno che le confrontava. Poi uno che scriveva la sintesi. Passo dopo passo, da un singolo script
              sono nati 12 agenti giornalisti specializzati — coordinati da un team genetico che opera esattamente
              come una redazione giornalistica vera: assegna i pezzi, verifica le fonti, decide cosa pubblicare e
              cosa scartare.
            </p>
            <p className="text-base md:text-lg leading-relaxed max-w-3xl mt-4" style={{ color: "#0a0a0a", opacity: 0.75 }}>
              Quello che era un bulletin board tra amici è diventato un prodotto. E quel prodotto ha iniziato a
              funzionare meglio di molte redazioni umane — non perché fosse più intelligente, ma perché non dormiva
              mai, non aveva bias editoriali, e controllava tutto tre volte.
            </p>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              PROOFPRESS VERIFY
          ═══════════════════════════════════════════════════════ */}
          <Section>
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div>
                <Label>Il pezzo mancante</Label>
                <h2
                  className="text-3xl md:text-4xl font-black leading-tight mb-6"
                  style={{ fontFamily: FONT }}
                >
                  Nell'era delle fake, la velocità da sola è un'arma a doppio taglio.
                </h2>
                <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: "#0a0a0a", opacity: 0.75 }}>
                  In un mondo dove chiunque può generare un articolo credibile in 30 secondi con un prompt,
                  serviva qualcosa di più: una prova.
                </p>
                <div
                  className="p-6 rounded-xl"
                  style={{ background: "#0a0f1e", color: "#ffffff" }}
                >
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ff5500" }}>
                    ProofPress Verify
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Un algoritmo originale che unisce intelligenza artificiale e tecnologia Web3 per certificare
                    ogni singola notizia. Un hash crittografico che sigilla contenuto, fonti, metodo di analisi
                    e timestamp. Una notarizzazione digitale dell'informazione.
                  </p>
                  <p className="text-sm font-bold mt-4" style={{ color: "#00e5c8" }}>
                    Non "ci fidiamo della fonte" — lo dimostriamo.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { icon: "🔍", title: "Analisi multi-fonte", desc: "Ogni notizia viene confrontata su almeno 5 fonti indipendenti prima della pubblicazione." },
                  { icon: "🔐", title: "Hash crittografico", desc: "Contenuto, fonti, metodo e timestamp vengono sigillati in un hash immutabile." },
                  { icon: "⛓️", title: "Notarizzazione Web3", desc: "Ispirato alla blockchain: ogni articolo è verificabile e inalterabile nel tempo." },
                  { icon: "📋", title: "Verification Report", desc: "Ogni articolo genera un report strutturato con gli esiti dell'analisi di affidabilità." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="text-2xl flex-shrink-0">{icon}</div>
                    <div>
                      <div className="font-bold text-sm mb-1">{title}</div>
                      <div className="text-sm" style={{ color: "#0a0a0a", opacity: 0.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              2026 — PROOFPRESS
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#0a0f1e">
            <Label>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>2026 — La trasformazione</span>
            </Label>
            <h2
              className="text-3xl md:text-5xl font-black leading-tight mb-8"
              style={{ fontFamily: FONT, color: "#ffffff" }}
            >
              Ideasmart diventa{" "}
              <span style={{ color: "#ff5500" }}>ProofPress.</span>
            </h2>
            <p className="text-base md:text-xl leading-relaxed max-w-3xl mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
              Il bulletin board dei nerd è diventato qualcosa di più grande. ProofPress è il primo modello di
              giornalismo agentico con informazione certificata — una piattaforma che permette a chiunque di
              costruirsi la propria redazione AI.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { title: "Freelance", desc: "Vuoi la tua testata verticale? 12 agenti lavorano per te 24/7." },
                { title: "Giornalisti", desc: "Moltiplica la produzione senza perdere credibilità." },
                { title: "Testate online", desc: "Scala con costi sostenibili. Ogni articolo certificato." },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="font-bold text-base mb-2" style={{ color: "#ffffff" }}>{title}</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</div>
                </div>
              ))}
            </div>
            <blockquote
              className="border-l-4 pl-6 py-2 text-xl font-bold italic"
              style={{ borderColor: "#ff5500", color: "#ffffff" }}
            >
              "Non è un media. È l'infrastruttura per il giornalismo che viene dopo."
            </blockquote>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CTA
          ═══════════════════════════════════════════════════════ */}
          <Section>
            <div className="text-center mb-10">
              <Label>Vuoi far parte di questa storia?</Label>
              <h2
                className="text-3xl md:text-4xl font-black leading-tight mb-4"
                style={{ fontFamily: FONT }}
              >
                Costruisci la tua redazione AI.
              </h2>
              <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "#0a0a0a", opacity: 0.6 }}>
                Scopri come ProofPress può diventare la tua infrastruttura editoriale — o scrivici per collaborare.
              </p>
            </div>
            <ContactForm origine="Chi Siamo — ProofPress" />
          </Section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
