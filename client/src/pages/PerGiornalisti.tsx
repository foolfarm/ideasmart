/**
 * Per Giornalisti e Testate Online — Landing Page di vendita v2
 * 14 sezioni: Hero, Il Numero, Il Problema, La Soluzione, Come Funziona,
 * Cosa Ottieni, Prove, Agent Giornalisti (NUOVA), Fai Due Conti, Pricing,
 * Revenue Share, Casi d'Uso, FAQ, CTA Finale
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

  return (
    <>
      <SEOHead
        title="Proof Press — La Redazione AI per Giornalisti e Testate Online | Da €500/mese"
        description="Lancia la tua testata online con una redazione AI. Agent Giornalisti configurabili per settore, le tue fonti, il tuo tono. 10-15 articoli/giorno da €500/mese. Risparmi fino a €560k/anno rispetto a una redazione tradizionale."
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
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
              {/* Testo hero */}
              <div className="flex-1 min-w-0">
                <Label accent>Per Freelancer, Giornalisti e Testate Online</Label>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                  ProofPress Creator<br />
                  <span className="text-[#0a0a0a]/25">Il Giornale Che si Scrive da Solo.</span>
                </h1>
                <p className="mt-4 text-xl md:text-2xl font-bold leading-tight text-[#0a0a0a] max-w-2xl">
                  Creiamo Redazioni Agentiche Tailor Made.
                </p>
                <p className="mt-4 text-lg md:text-xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                  Lancia una testata, verticalizza un giornale esistente o scala la produzione editoriale. Agent Giornalisti configurabili per settore, le tue fonti, il tuo tono. Tu fai il direttore.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <a href="https://proofpress.tech/" target="_blank" rel="noopener noreferrer" className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90 inline-block" style={{ background: "#dc2626", borderRadius: 0 }}>
                    Guarda una demo →
                  </a>
                  <button onClick={scrollToHow} className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white" style={{ borderRadius: 0 }}>
                    Guarda come funziona ↓
                  </button>
                </div>
                <p className="mt-5 text-[13px] text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                  Setup in pochi giorni · Nessun vincolo a lungo termine · Da €500/mese
                </p>
              </div>
              {/* Banner laterale */}
              <div className="hidden lg:block flex-shrink-0" style={{ width: 340 }}>
                <a href="#contatto">
                  <img
                    src="/manus-storage/banner-suite-creator-v2_293e905b.png"
                    alt="ProofPress Creator — Il Giornale che si Scrive da Solo"
                    className="w-full h-auto shadow-lg"
                    style={{ display: "block" }}
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SEZIONE 2 — IL NUMERO CHE CONTA ═══ */}
        <section className="py-20 md:py-24" style={{ background: "#0a0a0a" }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
            <div className="text-7xl md:text-9xl font-black text-white tracking-tight">10x</div>
            <p className="mt-4 text-xl md:text-2xl font-medium text-white/70">
              meno di una redazione tradizionale.
            </p>
            <p className="mt-2 text-lg text-white/50">
              Stesso output. Stessa qualità. Nessun compromesso.
            </p>
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
            Proof Press ti dà una redazione completa di Agent Giornalisti e agenti di supporto che fanno quello che fa un team editoriale: monitorano le fonti, verificano i dati, scrivono gli articoli, li pubblicano e li distribuiscono. Tu scegli la linea editoriale. Loro eseguono.
          </p>
          <div className="mt-14 grid md:grid-cols-2 gap-8">
            {[
              { icon: "🎯", title: "Tu decidi cosa coprire", text: "Temi, fonti, tono, frequenza. La direzione è tua." },
              { icon: "🤖", title: "Gli Agent Giornalisti scrivono e pubblicano", text: "Articoli, analisi, newsletter — in automatico o su tuo comando." },
              { icon: "✅", title: "Ogni notizia è verificata", text: "La tecnologia ProofPress Verify™ incrocia ogni dato su fonti multiple." },
              { icon: "🚀", title: "Il giornale è online, su dominio tuo", text: "Una testata completa, pronta, con il tuo brand e la tua identità." },
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
          <p className="mt-12 text-center text-base font-medium text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
            Tempo medio dal primo contatto al go-live: <strong className="text-[#0a0a0a]">5-7 giorni</strong>.
          </p>
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
              { icon: "🤖", title: "Agent Giornalisti + agenti di supporto", text: "Fino a 12 Agent Giornalisti configurabili per settore, più 4 agenti di supporto (Fact Checker, Publisher, Newsletter Curator, Social Editor). Una redazione che non dorme mai." },
              { icon: "💬", title: "Chat redazionale", text: "Parli con la piattaforma come parleresti con il tuo team. «Scrivi un pezzo su X», «Estrai le notizie di oggi», «Pubblica in prima pagina». Linguaggio naturale, zero tecnicismi." },
              { icon: "✅", title: "Tecnologia ProofPress Verify™", text: "Ogni notizia viene incrociata su fonti multiple prima della pubblicazione. Report di verifica con hash crittografico. Fact-checking automatico, zero fake news." },
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

        {/* ═══ SEZIONE 8 — AGENT GIORNALISTI (NUOVA) ═══ */}
        <Section bg="#ffffff" id="agent-giornalisti">
          <Label>La Tua Redazione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Ogni Agent è un giornalista.<br />
            <span className="text-[#0a0a0a]/25">Tu decidi di cosa si occupa.</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
            Un Agent Giornalista è un membro della tua redazione AI: lo configuri su un settore, gli assegni le fonti, e lui ogni giorno monitora, scrive e pubblica. Come un giornalista vero — solo che lavora 24/7 e non va mai in ferie.
          </p>

          {/* 3 esempi concreti */}
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
              <div className="text-3xl mb-4">🏦</div>
              <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>Agent "Finanza"</h3>
              <div className="space-y-2 text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                <p><strong className="text-[#0a0a0a]/70">Segue:</strong> mercati, banche, fintech, regolamentazione</p>
                <p><strong className="text-[#0a0a0a]/70">Fonti:</strong> Il Sole 24 Ore, FT, Reuters, BCE, Consob</p>
                <p><strong className="text-[#0a0a0a]/70">Output:</strong> 3-5 articoli/giorno sul canale Finanza</p>
                <p><strong className="text-[#0a0a0a]/70">Tone:</strong> formale, dati-driven, analisi tecnica</p>
              </div>
            </div>
            <div className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>Agent "Tech & AI"</h3>
              <div className="space-y-2 text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                <p><strong className="text-[#0a0a0a]/70">Segue:</strong> intelligenza artificiale, startup tech, innovazione</p>
                <p><strong className="text-[#0a0a0a]/70">Fonti:</strong> TechCrunch, Wired, Agenda Digitale, The Verge</p>
                <p><strong className="text-[#0a0a0a]/70">Output:</strong> 4-6 articoli/giorno sul canale Tech</p>
                <p><strong className="text-[#0a0a0a]/70">Tone:</strong> informale, accessibile, orientato al business</p>
              </div>
            </div>
            <div className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
              <div className="text-3xl mb-4">⚽</div>
              <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>Agent "Sport Business"</h3>
              <div className="space-y-2 text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                <p><strong className="text-[#0a0a0a]/70">Segue:</strong> economia dello sport, deal, sponsorship, diritti TV</p>
                <p><strong className="text-[#0a0a0a]/70">Fonti:</strong> SportEconomy, Calcio e Finanza, ESPN Business</p>
                <p><strong className="text-[#0a0a0a]/70">Output:</strong> 3-4 articoli/giorno sul canale Sport</p>
                <p><strong className="text-[#0a0a0a]/70">Tone:</strong> colloquiale, dati e numeri, analisi dei deal</p>
              </div>
            </div>
          </div>

          {/* Testo sotto la griglia */}
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

          {/* Tabella agenti per piano */}
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
                <tr className="border-t-2 border-[#0a0a0a]">
                  <td className="py-3 pr-4 font-black text-[#0a0a0a]">Totale agenti</td>
                  <td className="py-3 pr-4 text-center font-black text-[#0a0a0a]">4+4 = 8</td>
                  <td className="py-3 pr-4 text-center font-black text-[#dc2626]">8+4 = 12</td>
                  <td className="py-3 text-center font-black text-[#0a0a0a]">12+4 = 16</td>
                </tr>
              </tbody>
            </table>
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
            <Label accent>Contattaci</Label>
            <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>
              Raccontaci il tuo progetto editoriale.
            </h2>
            <p className="mt-3 text-base text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
              Ti risponderemo entro 24 ore.
            </p>
          </div>
          <ContactForm origine="Redazione Agentica — /offertacommerciale" />
        </Section>

        <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
