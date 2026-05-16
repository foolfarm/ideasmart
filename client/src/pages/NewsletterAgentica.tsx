/**
 * Newsletter Agentica — Landing Page B2B v2
 * Fix: "0h" → "8h", doppio "Più scelto", pricing con range, testimonianze etichettate,
 * occhiello hero allineato ai 4 profili reali, CTA primaria "Parla con il team",
 * uniformità icone card "Per chi è", refuso "Publbiuctà" rimosso.
 */
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ContactForm from "@/components/ContactForm";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ── Helpers ── */
function Section({ children, className = "", bg = "transparent", id }: { children: React.ReactNode; className?: string; bg?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

function Label({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 ${accent ? "text-[#dc2626]" : "text-[#0a0a0a]/40"}`}
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

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════ */
export default function NewsletterAgentica() {
  const scrollToContatti = () =>
    document.getElementById("contatti")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <SEOHead
        title="Newsletter Agentica — La tua newsletter AI-native, scritta da una redazione agentica | ProofPress"
        description="Una newsletter professionale, personalizzata, autogenerata dalla redazione agentica ProofPress. Sulle tue indicazioni, con il tuo brand, alla frequenza che scegli tu. Zero effort, massima qualità."
        canonical="https://proofpress.ai/newsletter-agentica"
        ogSiteName="Proof Press"
      />

      <div className="flex min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
        
        <div className="flex-1 min-w-0">
          <SharedPageHeader />
          {/* ═══ SEZIONE 1 — HERO ═══ */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                {/* Testo hero */}
                <div className="flex-1 min-w-0">
                  {/* FIX: occhiello allineato ai 4 profili reali della pagina */}
                  <Label accent>Per Aziende, Associazioni, Fondi e Professionisti</Label>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                    <span style={{ color: "#dc2626" }}>ProofPress</span> Newsletter<br />
                    <span className="text-[#0a0a0a]/25">La tua newsletter.</span>
                  </h1>
                  <p className="mt-4 text-xl md:text-2xl font-bold leading-tight text-[#0a0a0a] max-w-4xl">
                    Scritta da una redazione AI.
                  </p>
                  <p className="mt-4 text-lg md:text-xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-4xl">
                    Una newsletter professionale, personalizzata, autogenerata ma che scrive come te, creata da una redazione agentica ProofPress — con il tuo brand, le tue fonti, il tuo tono. Tu definisci la direzione. Gli Agent scrivono, verificano e inviano.
                  </p>
                  {/* FIX: CTA primaria "Parla con il team", demo come secondaria */}
                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={scrollToContatti}
                      className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90 inline-block"
                      style={{ background: "#dc2626", borderRadius: 0 }}
                    >
                      Parla con il team →
                    </button>
                    <a
                      href="https://proofpress.tech/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white inline-block"
                      style={{ borderRadius: 0 }}
                    >
                      Guarda una demo
                    </a>
                  </div>
                  <p className="mt-5 text-[13px] text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                    Setup in 5 giorni · Frequenza personalizzabile · 100% white-label
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* ═══ SEZIONE VIDEO ═══ */}
          <section className="py-16 md:py-20" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-8 text-center">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-white/40"
                  style={{ fontFamily: FONT }}
                >
                  ProofPress Newsletter · In pochi Secondi
                </span>
                <h2 className="mt-3 text-2xl md:text-3xl font-black text-white" style={{ fontFamily: FONT }}>
                  La Newsletter nell'Era AI.
                </h2>
              </div>
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "16/9", background: "#1a1a1a" }}
              >
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  poster=""
                  style={{ display: "block" }}
                >
                  <source src="/manus-storage/ProofPress_Newsletter_Agentica_ed1d4825.mp4" type="video/mp4" />
                  Il tuo browser non supporta la riproduzione video.
                </video>
              </div>
              <p className="mt-4 text-center text-[13px] text-white/35" style={{ fontFamily: FONT }}>
                ProofPress Newsletter Agentica — La tua newsletter professionale generata ogni giorno dall'AI
              </p>
            </div>
          </section>

          {/* ═══ SEZIONE 2 — IL NUMERO ═══ */}
          {/* FIX: "0h" → "8h" con sottotitolo corretto */}
          <section className="py-20 md:py-24" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
              <div className="text-7xl md:text-9xl font-black text-white tracking-tight">8h</div>
              <p className="mt-4 text-xl md:text-2xl font-medium text-white/70">
                di lavoro editoriale risparmiato ogni settimana.
              </p>
              <p className="mt-2 text-lg text-white/50">
                La redazione agentica fa tutto. Tu approvi — o lasci girare in automatico.
              </p>
              <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                <span>Contenuti 100% originali</span>
                <span>·</span>
                <span>Notizie certificate ProofPress Verify™</span>
                <span>·</span>
                <span>Brand tuo, dominio tuo</span>
                <span>·</span>
                <span>Frequenza su misura</span>
              </div>
            </div>
          </section>

          {/* ═══ SEZIONE 3 — IL PROBLEMA ═══ */}
          <Section bg="#ffffff" id="problema">
            <Label>Il Problema</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Una newsletter di qualità richiede tempo.<br />
              <span className="text-[#0a0a0a]/25">Che non hai.</span>
            </h2>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "⏱️",
                  title: "Ore di lavoro ogni settimana",
                  text: "Raccogliere fonti, selezionare notizie, scrivere, editare, impaginare, inviare. Una newsletter professionale richiede 4-8 ore a settimana di lavoro editoriale. Ore che potresti usare per il tuo business.",
                },
                {
                  icon: "📉",
                  title: "Qualità discontinua senza una redazione",
                  text: "Senza un team editoriale dedicato, la qualità oscilla. Si saltano settimane, i contenuti diventano generici, i lettori si disiscrivono. Una newsletter irregolare fa più danno di nessuna newsletter.",
                },
                {
                  icon: "💰",
                  title: "Un copywriter costa troppo per la frequenza",
                  text: "Un redattore freelance per una newsletter settimanale costa €800-2.000/mese. Per una quotidiana, il costo esplode. E non include fact-checking, impaginazione, gestione lista, analytics.",
                },
              ].map((c, i) => (
                <div key={i} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                  <div className="text-3xl mb-4">{c.icon}</div>
                  <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center text-lg md:text-xl font-medium text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
              Il risultato? La maggior parte delle newsletter muore entro 6 mesi.<br />
              Non per mancanza di idee — per mancanza di tempo e struttura.
            </p>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 4 — LA SOLUZIONE ═══ */}
          <Section bg="#ffffff" id="soluzione">
            <Label>La Soluzione</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Una redazione agentica che scrive per te.<br />
              <span className="text-[#0a0a0a]/25">Ogni volta. Senza eccezioni.</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              ProofPress Newsletter Agentica è una redazione AI dedicata alla tua newsletter. Non un tool di automazione, non un aggregatore di link: un sistema editoriale completo che scrive, verifica e invia ogni numero nel tuo nome.
            </p>
            <div className="mt-14 grid md:grid-cols-2 gap-8">
              {[
                { icon: "🎯", title: "Tu definisci la direzione", text: "Settori da coprire, fonti da monitorare, tono editoriale, frequenza di invio. Una volta configurata, la redazione lavora in autonomia." },
                { icon: "🤖", title: "Gli Agent scrivono ogni numero", text: "Selezione notizie, scrittura articoli, costruzione impaginazione, personalizzazione oggetto. Ogni newsletter è originale, non un aggregato di link." },
                { icon: "✅", title: "Ogni contenuto è verificato", text: "La tecnologia ProofPress Verify™ incrocia ogni notizia su fonti multiple prima dell'invio. Zero notizie false, zero errori fattuali." },
                { icon: "📧", title: "Inviata con il tuo brand", text: "Mittente personalizzato, dominio tuo, template grafico con la tua identità visiva. I tuoi lettori ricevono una newsletter che sembra scritta da te." },
              ].map((c, i) => (
                <div key={i} className="flex gap-5 p-6">
                  <div className="text-2xl shrink-0">{c.icon}</div>
                  <div>
                    <h3 className="text-base font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>{c.title}</h3>
                    <p className="mt-1 text-[15px] text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 5 — COME FUNZIONA ═══ */}
          <Section bg="#f5f5f7" id="come-funziona">
            <Label>Come Funziona</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Dal briefing al primo invio in 5 giorni.
            </h2>
            <div className="mt-14 grid md:grid-cols-4 gap-8">
              {[
                { step: "01", icon: "📋", title: "Ci racconti la tua newsletter", text: "Settori, fonti preferite, tono editoriale, frequenza, lista iscritti. Bastano 30 minuti di briefing." },
                { step: "02", icon: "⚙️", title: "Configuriamo la tua redazione", text: "Assegniamo gli Agent, impostiamo le fonti, definiamo il template grafico con il tuo brand." },
                { step: "03", icon: "✍️", title: "La redazione scrive il primo numero", text: "Ricevi una preview da approvare. Puoi modificare, chiedere riscritture, o lasciare che vada in automatico." },
                { step: "04", icon: "📬", title: "La newsletter va ai tuoi lettori", text: "Invio automatico alla frequenza scelta. Tu ricevi un report di aperture, click e crescita lista ogni settimana." },
              ].map((s, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626] mb-3">Step {s.step}</div>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="text-base font-black text-[#0a0a0a] mb-2" style={{ fontFamily: FONT }}>{s.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{s.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center text-base font-medium text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
              Tempo medio dal briefing al primo invio: <strong className="text-[#0a0a0a]">5 giorni lavorativi</strong>.
            </p>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 6 — COSA OTTIENI ═══ */}
          <Section bg="#ffffff" id="cosa-ottieni">
            <Label>Cosa Ottieni</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Non un tool di automazione.<br />
              <span className="text-[#0a0a0a]/25">Una redazione dedicata alla tua newsletter.</span>
            </h2>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[
                { icon: "✍️", title: "Contenuti originali, non aggregati", text: "Ogni articolo è scritto ex novo dagli Agent. Non una raccolta di link, non un riassunto automatico: testi originali, nel tuo tono, sulle tue fonti." },
                { icon: "✅", title: "Verifica automatica dei contenuti", text: "ProofPress Verify™ incrocia ogni notizia su fonti multiple prima dell'invio. Ogni contenuto ha un Verification Report con hash crittografico." },
                { icon: "🎨", title: "Template grafico white-label", text: "Design professionale con il tuo logo, i tuoi colori, il tuo nome mittente. I lettori vedono la tua newsletter, non ProofPress." },
                { icon: "📊", title: "Analytics settimanale", text: "Tasso di apertura, click, crescita lista, articoli più letti. Report automatico ogni settimana per monitorare le performance." },
                { icon: "⚙️", title: "Frequenza su misura", text: "Quotidiana, trisettimanale, settimanale, bisettimanale, mensile. La redazione si adatta alla tua strategia editoriale e al tuo pubblico." },
                { icon: "📋", title: "Preview e controllo editoriale", text: "Prima di ogni invio ricevi una preview. Puoi approvare, richiedere modifiche o attivare l'invio automatico senza approvazione." },
              ].map((c, i) => (
                <div key={i} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                  <div className="text-2xl mb-4">{c.icon}</div>
                  <h3 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 7 — PER CHI È ═══ */}
          {/* FIX: icona uniforme su tutte e 4 le card, testimonianze etichettate come "esempio tipico" */}
          <Section bg="#f5f5f7" id="per-chi">
            <Label>Per Chi È</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              4 profili. Una sola soluzione.
            </h2>
            <div className="mt-14 grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: "🏢",
                  title: "Aziende e brand",
                  text: "Vuoi una newsletter per i tuoi clienti, prospect o stakeholder — ma non hai una redazione interna. La newsletter diventa un canale di posizionamento e fidelizzazione, senza caricare il team marketing.",
                  tag: "NEWSLETTER B2B / POSIZIONAMENTO",
                  quote: "«I nostri clienti ci leggono ogni settimana. Il team marketing non ha toccato un editor.»",
                },
                {
                  icon: "🏛️",
                  title: "Associazioni e ordini professionali",
                  text: "I tuoi soci si aspettano aggiornamenti regolari su normative, mercato, innovazione. Una newsletter agentica copre il settore 24/7 e consegna ogni settimana un aggiornamento professionale curato.",
                  tag: "NEWSLETTER ISTITUZIONALE",
                  quote: "«I soci ora hanno una fonte di aggiornamento professionale che prima non esisteva.»",
                },
                {
                  icon: "📈",
                  title: "Fondi e investitori",
                  text: "Opportunità di investimento, startup, mercati, regolamentazione. Una newsletter verticale per i tuoi co-investor o aziende in portafoglio — curata dalla redazione agentica sulle fonti che contano per te.",
                  tag: "NEWSLETTER INVESTOR / DEAL FLOW",
                  quote: "«I nostri partner ricevono ogni lunedì una sintesi del mercato che prima richiedeva 3 ore di ricerca.»",
                },
                {
                  icon: "🎓",
                  title: "Professionisti e consulenti",
                  text: "Sei un advisor, un coach, un consulente con una community. La newsletter è il tuo canale di autorevolezza — ma scriverla ogni settimana ti toglie tempo. La redazione agentica la scrive per te, nel tuo stile.",
                  tag: "NEWSLETTER PERSONALE / COMMUNITY",
                  quote: "«La mia newsletter è cresciuta del 40% da quando è diventata settimanale e regolare.»",
                },
              ].map((c, i) => (
                <div key={i} className="bg-white p-8 border border-[#0a0a0a]/8">
                  {/* FIX: icona sempre visibile e uniforme su tutte le card */}
                  <div className="text-3xl mb-4">{c.icon}</div>
                  <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>{c.text}</p>
                  <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#dc2626] mb-3" style={{ fontFamily: FONT }}>{c.tag}</p>
                  {/* FIX: testimonianze etichettate come "esempio tipico" per onestà B2B */}
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#0a0a0a]/25 mb-1" style={{ fontFamily: FONT }}>Esempio tipico</p>
                  <p className="text-[13px] italic text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>{c.quote}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══ SEZIONE 9 — CONFRONTO COSTI ═══ */}
          <Section bg="#f5f5f7" id="confronto">
            <Label>Fai Due Conti</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Quanto costa una newsletter professionale?<br />
              <span className="text-[#dc2626]">E quanto risparmi con la redazione agentica?</span>
            </h2>
            <p className="mt-4 text-lg text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              Una newsletter settimanale di qualità richiede un copywriter, un editor, un fact-checker, un designer e una piattaforma di invio. Con ProofPress ottieni tutto questo — in automatico.
            </p>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-left text-[14px]" style={{ fontFamily: FONT }}>
                <thead>
                  <tr className="border-b-2 border-[#0a0a0a]">
                    <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Voce di costo</th>
                    <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Approccio tradizionale</th>
                    <th className="py-3 pr-4 font-bold text-[#0a0a0a]">ProofPress Newsletter</th>
                    <th className="py-3 font-bold text-[#dc2626]">Risparmio</th>
                  </tr>
                </thead>
                <tbody className="text-[#0a0a0a]/70">
                  {[
                    ["Copywriter / redattore", "€800 – €2.000/mese", "Incluso", "100%"],
                    ["Editor e revisione", "€400 – €800/mese", "Incluso", "100%"],
                    ["Verifica contenuti", "€300 – €600/mese", "Incluso (ProofPress Verify™)", "100%"],
                    ["Template design", "€500 – €1.500 una tantum", "Incluso nel setup", "100%"],
                    ["Piattaforma di invio", "€100 – €500/mese", "Incluso", "100%"],
                    ["Analytics e reportistica", "€50 – €200/mese", "Incluso", "100%"],
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-[#0a0a0a]/8">
                      <td className="py-3 pr-4">{r[0]}</td>
                      <td className="py-3 pr-4">{r[1]}</td>
                      <td className="py-3 pr-4 font-bold text-[#0a0a0a]">{r[2]}</td>
                      <td className="py-3 font-bold text-[#dc2626]">{r[3]}</td>
                    </tr>
                  ))}
                  {/* FIX: pricing con range concreto invece di "su richiesta" */}
                  <tr className="border-t-2 border-[#0a0a0a]">
                    <td className="py-3 pr-4 font-black text-[#0a0a0a]">TOTALE MENSILE</td>
                    <td className="py-3 pr-4 font-black text-[#0a0a0a]">€2.150 – €5.600/mese</td>
                    <td className="py-3 pr-4">
                      <span className="font-black text-[#dc2626]">da €290/mese*</span>
                    </td>
                    <td className="py-3 font-black text-[#dc2626]">fino a 10x</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[12px] text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>
              * Prezzo indicativo per newsletter settimanale. Il costo finale dipende da frequenza, volume lista e personalizzazioni. Richiedi un preventivo su misura.
            </p>

            <div className="mt-12 text-center">
              <p className="text-lg font-medium text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
                Il setup si ripaga al primo numero.<br />
                <strong className="text-[#0a0a0a]">Dal secondo mese il risparmio è strutturale.</strong>
              </p>
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 10 — FREQUENZE ═══ */}
          {/* FIX: rimosso doppio "Più scelto" — Quotidiana ha "MAX ENGAGEMENT", Trisettimanale ha "PIÙ SCELTO" */}
          <Section bg="#ffffff" id="frequenze">
            <Label>Frequenza e Formato</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Ogni newsletter è diversa.<br />
              <span className="text-[#0a0a0a]/25">La tua frequenza, il tuo formato.</span>
            </h2>
            <div className="mt-14 grid md:grid-cols-3 gap-6">
              {[
                {
                  freq: "Quotidiana",
                  desc: "Una newsletter ogni mattina — notizie del giorno, aggiornamenti di settore, selezione curata. Ideale per community ad alta frequenza e media company.",
                  badge: "MAX ENGAGEMENT",
                  badgeColor: "#0a0a0a",
                  highlight: false,
                },
                {
                  freq: "Trisettimanale o Settimanale",
                  desc: "Il formato più efficace per B2B e professionisti. Tre o cinque numeri a settimana con approfondimenti, analisi e selezione delle notizie più rilevanti.",
                  badge: "PIÙ SCELTO",
                  badgeColor: "#dc2626",
                  highlight: true,
                },
                {
                  freq: "Bisettimanale o Mensile",
                  desc: "Newsletter di approfondimento con analisi di scenario, trend e insight strategici. Ideale per fondi, associazioni e consulenti con un pubblico executive.",
                  badge: "EXECUTIVE FORMAT",
                  badgeColor: "#0a0a0a",
                  highlight: false,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-8 border-2 relative"
                  style={{ borderColor: f.highlight ? "#dc2626" : "rgba(10,10,10,0.1)" }}
                >
                  {f.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#dc2626] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1">
                      Più scelto
                    </div>
                  )}
                  <h3 className="text-xl font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{f.freq}</h3>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>{f.desc}</p>
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 text-white"
                    style={{ background: f.badgeColor }}
                  >
                    {f.badge}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-10 bg-[#f5f5f7] p-6 md:p-8">
              <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mb-4">Incluso in ogni configurazione</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: "🎨", name: "Template white-label", desc: "Brand tuo, colori tuoi, dominio mittente tuo" },
                  { icon: "✅", name: "Verify™ su ogni notizia", desc: "Verifica automatica pre-invio" },
                  { icon: "📊", name: "Report settimanale", desc: "Aperture, click, crescita lista" },
                  { icon: "📋", name: "Preview pre-invio", desc: "Approvi o attivi l'automatico" },
                ].map((a, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl mb-2">{a.icon}</div>
                    <div className="text-[13px] font-bold text-[#0a0a0a]" style={{ fontFamily: FONT }}>{a.name}</div>
                    <div className="text-[12px] text-[#0a0a0a]/50 mt-1" style={{ fontFamily: FONT }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 11 — CONTATTI ═══ */}
          <Section bg="#f5f5f7" id="contatti">
            <div className="text-center mb-10">
              <Label accent>Contattaci</Label>
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                Raccontaci la tua newsletter.
              </h2>
              <p className="mt-3 text-base text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
                Ti risponderemo entro 24 ore con una proposta su misura.
              </p>
            </div>
            {/* CTA preventivo */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <a href="/preventivo-creator">
                <button
                  className="inline-flex items-center justify-center text-white font-bold px-10 py-3 text-[15px] transition-opacity hover:opacity-90"
                  style={{ background: "#dc2626", borderRadius: 0 }}
                >
                  Richiedi preventivo gratuito →
                </button>
              </a>
              <a href="https://proofpress.tech/" target="_blank" rel="noopener noreferrer">
                <button
                  className="inline-flex items-center justify-center border-2 border-[#0a0a0a]/20 bg-transparent hover:bg-[#0a0a0a]/5 text-[#0a0a0a] font-bold px-10 py-3 text-[15px] transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Guarda la demo live
                </button>
              </a>
            </div>
            <p className="text-center text-[12px] text-[#0a0a0a]/35 tracking-[0.1em] uppercase mb-10" style={{ fontFamily: FONT }}>Setup in 5 giorni · Gestibile da 1 persona · Disdici quando vuoi</p>
            <ContactForm origine="Newsletter Agentica — /newsletter-agentica" />
          </Section>

          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
