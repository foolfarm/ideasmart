/**
 * Per Giornalisti e Testate Online — Landing Page di vendita v3
 * Modifiche v3: titolo hero con ProofPress in rosso, sottotitolo semplificato,
 * 2 CTA (rimozione "Scopri di più"), tabella confronto 10x, pricing nella tabella piani,
 * sezione social proof anonima, badge "5-7 giorni", Agent box semplificati + Custom box,
 * microcopy aggiornato.
 * Palette: bianco (#ffffff), nero (#0a0a0a), crema (#f5f5f7), accento rosso (#dc2626)
 */
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
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
    <span className={`inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 ${accent ? "text-[#dc2626]" : "text-[#0a0a0a]/40"}`}
      style={{ fontFamily: FONT }}>
      {children}
    </span>
  );
}

function Divider() {
  return <div className="max-w-5xl mx-auto px-5 md:px-8"><div className="border-t border-[#0a0a0a]/8" /></div>;
}


/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════ */
export default function PerGiornalisti() {
  const scrollToHow = () => document.getElementById("come-funziona")?.scrollIntoView({ behavior: "smooth" });
  const scrollToVideo = () => document.getElementById("video-section")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <SEOHead
        title="Proof Press — La Redazione AI per Giornalisti e Testate Online | Da €500/mese"
        description="Lancia la tua testata online con una redazione AI. Agent Giornalisti (giornalisti AI specializzati per settore), le tue fonti, il tuo tono. 10-15 articoli/giorno da €500/mese. Risparmi fino a €560k/anno rispetto a una redazione tradizionale."
        canonical="https://proofpress.ai/offertacommerciale"
        ogSiteName="Proof Press"
      />

      <div className="flex min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0">
        <SharedPageHeader />
        <BreakingNewsTicker />

        {/* ═══ SEZIONE 1 — HERO ═══ */}
        <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="flex flex-col gap-8">
              <Label accent>Per Freelancer, Giornalisti e Testate Online</Label>
              {/* Titolo hero: ProofPress in rosso, poi a capo */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                <span style={{ color: "#dc2626" }}>ProofPress</span> Creator<br />
                <span className="text-[#0a0a0a]/25">Il Giornale<br />Che si Scrive da Solo.</span>
              </h1>
              {/* Sottotitolo semplificato — niente gerghi */}
              <p className="text-xl md:text-2xl font-bold leading-tight text-[#0a0a0a] max-w-4xl">
                Costruiamo redazioni AI su misura per la tua testata.<br />
                Tu dirigi, gli agenti scrivono, verificano e pubblicano.
              </p>
              <p className="text-lg md:text-xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-4xl">
                Lancia una testata, verticalizza un giornale esistente o scala la produzione editoriale. Agent Giornalisti (giornalisti AI specializzati per settore), le tue fonti, il tuo tono — sotto la tua direzione.
              </p>
              {/* 2 CTA — rimossa "Scopri di più" */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contatti"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90 inline-block text-center"
                  style={{ background: "#dc2626", borderRadius: 0 }}
                >
                  Richiedi preventivo →
                </a>
                <button
                  onClick={scrollToVideo}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white"
                  style={{ borderRadius: 0 }}
                >
                  Guarda il video (90s) ↓
                </button>
              </div>
              <p className="text-[13px] text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                Setup in pochi giorni · Nessun vincolo a lungo termine · Da €500/mese
              </p>
            </div>
          </div>
        </section>

        {/* ═══ SEZIONE VIDEO ═══ */}
        <section id="video-section" className="py-16 md:py-20" style={{ background: "#0a0a0a" }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="mb-8 text-center">
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-white/40"
                style={{ fontFamily: FONT }}
              >
                ProofPress Creator · In Pochi Secondi
              </span>
              <h2 className="mt-3 text-2xl md:text-3xl font-black text-white" style={{ fontFamily: FONT }}>
                Crea un Giornale nell'Era AI.
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
                <source src="/manus-storage/ProofPress__La_Tua_Redazione_AI_1fbc42f6.mp4" type="video/mp4" />
                Il tuo browser non supporta la riproduzione video.
              </video>
            </div>
            <p className="mt-4 text-center text-[13px] text-white/35" style={{ fontFamily: FONT }}>
              ProofPress Creator — La tua redazione AI che scrive, verifica e pubblica ogni giorno
            </p>
          </div>
        </section>

        {/* ═══ SEZIONE 2 — IL NUMERO CHE CONTA + TABELLA CONFRONTO ═══ */}
        <section className="py-20 md:py-24" style={{ background: "#0a0a0a" }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
            <div className="text-7xl md:text-9xl font-black text-white tracking-tight">10x</div>
            <p className="mt-4 text-xl md:text-2xl font-medium text-white/70">
              meno di una redazione tradizionale.
            </p>
            <p className="mt-2 text-lg text-white/50">
              Stesso output. Stessa qualità. Nessun compromesso.
            </p>
            {/* Tabella confronto */}
            <div className="mt-12 max-w-2xl mx-auto overflow-x-auto">
              <table className="w-full text-left text-[14px]" style={{ fontFamily: FONT }}>
                <thead>
                  <tr>
                    <th className="py-3 pr-6 text-white/40 font-bold text-[11px] uppercase tracking-[0.15em]">Redazione tradizionale</th>
                    <th className="py-3 font-bold text-[11px] uppercase tracking-[0.15em]" style={{ color: "#dc2626" }}>ProofPress Creator</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["€150–250k/anno", "Da €6k/anno"],
                    ["4–6 persone", "1 direttore (tu)"],
                    ["Ore per articolo", "Minuti per articolo"],
                    ["Scala = nuove assunzioni", "Scala = nuovi Agent"],
                  ].map(([left, right], i) => (
                    <tr key={i} className="border-t border-white/10">
                      <td className="py-3 pr-6 text-white/50">{left}</td>
                      <td className="py-3 font-semibold text-white">{right}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
              <span>4.000+ fonti certificate</span>
              <span>·</span>
              <span>Fino a 16 agenti AI</span>
              <span>·</span>
              <span>Tecnologia ProofPress Verify™</span>
              <span>·</span>
              <span>Operativi 24/7</span>
            </div>
          </div>
        </section>

        {/* ═══ SEZIONE SOCIAL PROOF ═══ */}
        <Section bg="#f5f5f7" id="social-proof">
          <Label>Già in Produzione</Label>
          <h2 className="text-3xl md:text-4xl font-black leading-tight text-[#0a0a0a]">
            Testate attive. Ogni giorno.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6 text-center">
            {[
              { num: "12+", label: "Testate attive" },
              { num: "4.000+", label: "Articoli pubblicati" },
              { num: "4.000+", label: "Fonti monitorate" },
            ].map((s, i) => (
              <div key={i} className="py-8 px-6 bg-white border border-[#0a0a0a]/8">
                <div className="text-4xl md:text-5xl font-black text-[#0a0a0a]">{s.num}</div>
                <div className="mt-2 text-[13px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40">{s.label}</div>
              </div>
            ))}
          </div>
          {/* Testimonianza anonima */}
          <div className="mt-10 p-8 bg-white border-l-4 border-[#dc2626]">
            <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/70 italic" style={{ fontFamily: FONT }}>
              "In 7 giorni abbiamo lanciato la nostra verticale fintech. Oggi pubblichiamo 6 articoli al giorno con un solo editor. Il ROI è stato evidente dal primo mese."
            </p>
            <p className="mt-4 text-[13px] font-bold text-[#0a0a0a]/50 uppercase tracking-[0.15em]">
              Direttore editoriale, testata fintech — Italia
            </p>
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 3 — IL PROBLEMA ═══ */}
        <Section bg="#ffffff" id="problema">
          <Label>Il Problema</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Fare giornalismo oggi costa troppo.<br />
            <span className="text-[#0a0a0a]/25">E scala troppo poco.</span>
          </h2>
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              { icon: "💰", title: "Una redazione costa €150-250k/anno", text: "Giornalisti, editor, fact-checker, social media manager, strumenti. Anche una piccola testata con 2-3 persone supera facilmente i €100k all'anno. Per un freelance o un editore indipendente è insostenibile." },
              { icon: "⏱️", title: "Dalla notizia alla pubblicazione passano ore", text: "Raccogliere le fonti, verificare, scrivere, editare, impaginare, pubblicare, condividere sui social. Il ciclo editoriale tradizionale è lento. In un mondo real-time, arrivi sempre dopo." },
              { icon: "📉", title: "Per scalare devi assumere. E il margine crolla.", text: "Vuoi aggiungere un canale? Servono 1-2 persone in più. Vuoi coprire un nuovo verticale? Altre assunzioni. Il modello tradizionale non scala senza costi lineari. Più produci, meno guadagni." },
            ].map((c, i) => (
              <div key={i} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                <div className="text-3xl mb-4">{c.icon}</div>
                <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-lg md:text-xl font-medium text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
            Il risultato? La maggior parte delle testate non scala.<br />E chi scala, perde margine — o qualità.
          </p>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 4 — LA SOLUZIONE ═══ */}
        <Section bg="#ffffff" id="soluzione">
          <Label>La Soluzione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Proof Press è la tua redazione.<br />
            <span className="text-[#0a0a0a]/25">Solo che lavora 24 ore su 24 e costa 10 volte meno.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
            Proof Press ti dà una redazione completa di Agent Giornalisti (giornalisti AI specializzati per settore) e agenti di supporto che fanno quello che fa un team editoriale: monitorano le fonti, verificano i dati con la tecnologia ProofPress Verify™ — il sistema che incrocia ogni notizia su 4.000+ fonti certificate prima della pubblicazione — scrivono gli articoli, li pubblicano e li distribuiscono. Tu scegli la linea editoriale. Loro eseguono.
          </p>
          <div className="mt-14 grid md:grid-cols-2 gap-8">
            {[
              { icon: "🎯", title: "Tu decidi cosa coprire", text: "Temi, fonti, tono, frequenza. La direzione è tua — sotto la tua direzione." },
              { icon: "🤖", title: "Gli Agent Giornalisti scrivono e pubblicano", text: "Articoli, analisi, newsletter — in automatico o su tuo comando." },
              { icon: "✅", title: "Ogni notizia è verificata", text: "La tecnologia ProofPress Verify™ incrocia ogni dato su fonti multiple." },
              { icon: "🚀", title: "Il giornale è online, su dominio tuo", text: "Una testata completa, pronta, con il tuo brand e la tua identità." },
            ].map((c, i) => (
              <div key={i} className="flex gap-5 p-6 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
            <Label>Come Funziona</Label>
            {/* Badge "5-7 giorni" visibile in cima alla sezione */}
            <span
              className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.15em] text-white mb-4"
              style={{ background: "#dc2626", borderRadius: 0 }}
            >
              ⏱ Da zero a online in 5–7 giorni
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Da zero a testata online in 4 step.
          </h2>
          <div className="mt-14 grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: "📋", title: "Ci dici come lo vuoi", text: "Scegli nome, canali, fonti, tono editoriale, layout. Ci racconti la tua testata e noi la configuriamo." },
              { step: "02", icon: "⚙️", title: "Configuriamo i tuoi Agent", text: "Setup dedicato su dominio tuo: Agent Giornalisti per settore, fonti, regole editoriali, tema grafico. Tutto su misura." },
              { step: "03", icon: "💬", title: "Parli con la tua redazione", text: "Via chat dai istruzioni alla redazione AI: scrivi un pezzo su questo tema, estrai le news del giorno, pubblica in prima pagina." },
              { step: "04", icon: "📰", title: "Il giornale è live", text: "La testata pubblica in automatico o su tua approvazione. Articoli, newsletter, social post — tutto gestito." },
            ].map((s, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626] mb-3">Step {s.step}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-base font-black text-[#0a0a0a] mb-2" style={{ fontFamily: FONT }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{s.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ═══ SEZIONE 6 — COSA OTTIENI ═══ */}
        <Section bg="#ffffff" id="cosa-ottieni">
          <Label>Cosa Ottieni</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Non un tool.<br /><span className="text-[#0a0a0a]/25">Una redazione completa.</span>
          </h2>
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              { icon: "📰", title: "Testata completa su dominio dedicato", text: "Homepage, canali tematici, singoli articoli, pagina chi siamo, ticker live, breaking news. Tutto sul tuo dominio, col tuo brand." },
              { icon: "🤖", title: "Agent Giornalisti + agenti di supporto", text: "Fino a 12 Agent Giornalisti (giornalisti AI specializzati per settore), più 4 agenti di supporto (Fact Checker, Publisher, Newsletter Curator, Social Editor). Una redazione che non dorme mai." },
              { icon: "💬", title: "Chat redazionale", text: "Parli con la piattaforma come parleresti con il tuo team. «Scrivi un pezzo su X», «Estrai le notizie di oggi», «Pubblica in prima pagina». Linguaggio naturale, zero tecnicismi." },
              { icon: "✅", title: "Tecnologia ProofPress Verify™", text: "Il sistema che incrocia ogni notizia su 4.000+ fonti certificate prima della pubblicazione. Report di verifica con hash crittografico. Fact-checking automatico, zero fake news." },
              { icon: "📧", title: "Newsletter automatica", text: "Settimanale o giornaliera, costruita in automatico dai contenuti migliori. Distribuita ai tuoi lettori senza che tu faccia nulla." },
              { icon: "📱", title: "Distribuzione social", text: "Post LinkedIn, tweet, summary per Telegram — generati automaticamente dai tuoi articoli. Pubblica ovunque, gestisci da un posto." },
            ].map((c, i) => (
              <div key={i} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                <div className="text-2xl mb-4">{c.icon}</div>
                <h3 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{c.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{c.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[13px] text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
            <span>🔒 Paywall integrato</span>
            <span>📊 Analytics</span>
            <span>🌍 Multi-lingua</span>
            <span>📅 Programmazione</span>
          </div>
        </Section>

        {/* ═══ SEZIONE 8 — AGENT GIORNALISTI ═══ */}
        <Section bg="#ffffff" id="agent-giornalisti">
          <Label>La Tua Redazione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Ogni Agent è un giornalista.<br />
            <span className="text-[#0a0a0a]/25">Tu decidi di cosa si occupa.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
            Un Agent Giornalista è un membro della tua redazione AI: lo configuri su un settore, gli assegni le fonti, e lui ogni giorno monitora, scrive e pubblica — sotto la tua direzione. Come un giornalista vero, solo che lavora 24/7 e non va mai in ferie.
          </p>

          {/* 4 box semplificati: 3 esempi + 1 Custom */}
          <div className="mt-14 grid md:grid-cols-4 gap-6">
            {[
              { icon: "🏦", title: "Agent Finanza", line1: "Segue mercati, banche, fintech, regolamentazione", line2: "Pubblica 3–5 articoli/giorno sul canale Finanza" },
              { icon: "🤖", title: "Agent Tech & AI", line1: "Segue intelligenza artificiale, startup tech, innovazione", line2: "Pubblica 4–6 articoli/giorno sul canale Tech" },
              { icon: "⚽", title: "Agent Sport Business", line1: "Segue economia dello sport, deal, sponsorship, diritti TV", line2: "Pubblica 3–4 articoli/giorno sul canale Sport" },
              { icon: "✏️", title: "+ Il tuo verticale", line1: "Configuri tu il settore, le fonti e il tono editoriale", line2: "Ogni Agent è completamente personalizzabile", custom: true },
            ].map((a, i) => (
              <div
                key={i}
                className={`p-6 border transition-colors ${a.custom ? "border-dashed border-[#dc2626]/40 bg-[#dc2626]/3" : "border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20"}`}
              >
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{a.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#0a0a0a]/55 mb-1" style={{ fontFamily: FONT }}>{a.line1}</p>
                <p className={`text-[13px] font-semibold leading-relaxed ${a.custom ? "text-[#dc2626]" : "text-[#0a0a0a]/70"}`} style={{ fontFamily: FONT }}>{a.line2}</p>
              </div>
            ))}
          </div>

          {/* Contatori Agent */}
          <div className="mt-14 text-center max-w-2xl mx-auto">
            <p className="text-lg md:text-xl font-medium text-[#0a0a0a]/70 leading-relaxed" style={{ fontFamily: FONT }}>
              Ogni Agent Giornalista lavora in autonomia sul suo settore.<br />
              Più Agent hai, più settori copri, più articoli produci.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="py-5 border border-[#0a0a0a]/10">
                <div className="text-2xl md:text-3xl font-black text-[#0a0a0a]">4 Agent</div>
                <div className="text-[13px] text-[#0a0a0a]/50 mt-1">10-15 articoli/giorno</div>
              </div>
              <div className="py-5 border-2 border-[#dc2626]">
                <div className="text-2xl md:text-3xl font-black text-[#0a0a0a]">8 Agent</div>
                <div className="text-[13px] text-[#0a0a0a]/50 mt-1">20-30 articoli/giorno</div>
              </div>
              <div className="py-5 border border-[#0a0a0a]/10">
                <div className="text-2xl md:text-3xl font-black text-[#0a0a0a]">12 Agent</div>
                <div className="text-[13px] text-[#0a0a0a]/50 mt-1">Senza limiti</div>
              </div>
            </div>
          </div>

          {/* Tabella piani CON PRICING */}
          <div className="mt-14 overflow-x-auto">
            <table className="w-full text-left text-[14px]" style={{ fontFamily: FONT }}>
              <thead>
                <tr className="border-b-2 border-[#0a0a0a]">
                  <th className="py-3 pr-4 font-bold text-[#0a0a0a]"></th>
                  <th className="py-3 pr-4 font-bold text-[#0a0a0a] text-center">Single Vertical</th>
                  <th className="py-3 pr-4 font-bold text-[#dc2626] text-center">Multi-Channel</th>
                  <th className="py-3 font-bold text-[#0a0a0a] text-center">Full Newsroom</th>
                </tr>
              </thead>
              <tbody className="text-[#0a0a0a]/70">
                <tr className="border-b border-[#0a0a0a]/8">
                  <td className="py-3 pr-4 font-bold text-[#0a0a0a]">Agent Giornalisti</td>
                  <td className="py-3 pr-4 text-center text-lg font-black text-[#0a0a0a]">4</td>
                  <td className="py-3 pr-4 text-center text-lg font-black text-[#dc2626]">8</td>
                  <td className="py-3 text-center text-lg font-black text-[#0a0a0a]">12</td>
                </tr>
                <tr className="border-b border-[#0a0a0a]/8">
                  <td className="py-3 pr-4 text-[#0a0a0a]/50 text-[13px]">(configurabili per settore)</td>
                  <td className="py-3 pr-4 text-center text-[13px] text-[#0a0a0a]/50">1 verticale</td>
                  <td className="py-3 pr-4 text-center text-[13px] text-[#0a0a0a]/50">fino a 6 canali</td>
                  <td className="py-3 text-center text-[13px] text-[#0a0a0a]/50">canali illimitati</td>
                </tr>
                <tr className="border-b border-[#0a0a0a]/8">
                  <td className="py-3 pr-4 font-bold text-[#0a0a0a]">Totale agenti</td>
                  <td className="py-3 pr-4 text-center font-black text-[#0a0a0a]">4+4 = 8</td>
                  <td className="py-3 pr-4 text-center font-black text-[#dc2626]">8+4 = 12</td>
                  <td className="py-3 text-center font-black text-[#0a0a0a]">12+4 = 16</td>
                </tr>
                {/* Riga pricing */}
                <tr className="border-t-2 border-[#0a0a0a] bg-[#f5f5f7]">
                  <td className="py-4 pr-4 font-black text-[#0a0a0a]">Prezzo</td>
                  <td className="py-4 pr-4 text-center">
                    <div className="font-black text-[#0a0a0a] text-base">a partire da</div>
                    <div className="font-black text-[#0a0a0a] text-xl">€500/mese</div>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <div className="font-black text-[#dc2626] text-base">a partire da</div>
                    <div className="font-black text-[#dc2626] text-xl">€1.500/mese</div>
                  </td>
                  <td className="py-4 text-center">
                    <div className="font-black text-[#0a0a0a] text-base">a partire da</div>
                    <div className="font-black text-[#0a0a0a] text-xl">€3.000/mese</div>
                    <div className="text-[12px] text-[#0a0a0a]/40 mt-1">o su preventivo</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 text-[13px] text-[#0a0a0a]/45 text-center" style={{ fontFamily: FONT }}>
              Tutti i piani includono setup, dominio, hosting, aggiornamenti e supporto. Nessun vincolo a lungo termine.
            </p>
          </div>

          {/* Agenti di supporto */}
          <div className="mt-10 bg-[#f5f5f7] p-6 md:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/40 mb-4">Agenti di supporto inclusi in tutti i piani</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "✅", name: "Fact Checker", desc: "Verifica ogni notizia su fonti multiple (ProofPress Verify™)" },
                { icon: "📢", name: "Publisher", desc: "Pubblica e impagina in automatico" },
                { icon: "📧", name: "Newsletter Curator", desc: "Seleziona e invia le newsletter" },
                { icon: "📱", name: "Social Editor", desc: "Genera post per LinkedIn, Twitter, Telegram" },
              ].map((a, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <div className="text-[13px] font-bold text-[#0a0a0a]" style={{ fontFamily: FONT }}>{a.name}</div>
                  <div className="text-[12px] text-[#0a0a0a]/50 mt-1" style={{ fontFamily: FONT }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-[14px] text-[#0a0a0a]/45" style={{ fontFamily: FONT }}>
            Gli Agent Giornalisti sono quelli che <strong className="text-[#0a0a0a]/60">TU configuri</strong>: scegli il settore, le fonti, il tono, la frequenza.<br />
            Gli agenti di supporto lavorano in automatico su tutti i contenuti prodotti.
          </p>
        </Section>

        {/* ═══ SEZIONE CONTATTI ═══ */}
        <Section bg="#f5f5f7" id="contatti">
          <div className="text-center mb-10">
            <Label accent>Richiedi Preventivo</Label>
            <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>
              Presentaci il tuo progetto editoriale.
            </h2>
            <p className="mt-3 text-base text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
              Ti risponderemo entro 24 ore con una proposta personalizzata.
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
          </div>
          <p className="text-center text-[12px] text-[#0a0a0a]/35 tracking-[0.1em] uppercase mb-10" style={{ fontFamily: FONT }}>Nessun impegno · Risposta entro 24h · Setup in pochi giorni</p>
          <ContactForm origine="Redazione Agentica — /offertacommerciale" />
        </Section>

        <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
