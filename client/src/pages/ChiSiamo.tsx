/**
 * IDEASMART — Landing Page di Vendita
 * Piattaforma di giornalismo agentico.
 * Stile: Stripe / Notion — pulito, diretto, moderno.
 * Palette: bianco (#ffffff), nero (#0a0a0a), crema (#f5f0e8), accento rosso (#dc2626).
 */
import { useRef } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ── Sezione wrapper ── */
function Section({ children, className = "", bg = "transparent", id }: { children: React.ReactNode; className?: string; bg?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

/* ── Label piccola ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-4"
      style={{ fontFamily: FONT }}>
      {children}
    </span>
  );
}

/* ── Divider sottile ── */
function Divider() {
  return <div className="max-w-5xl mx-auto px-5 md:px-8"><div className="border-t border-[#0a0a0a]/8" /></div>;
}

/* ── Dati agenti ── */
const AGENTS = [
  { name: "Market Scout", desc: "Monitora 4.000+ fonti globali ogni giorno", num: "01" },
  { name: "Data Verifier", desc: "Incrocia e valida i dati da fonti multiple", num: "02" },
  { name: "Research Writer", desc: "Produce articoli strutturati e ottimizzati", num: "03" },
  { name: "Senior Analyst", desc: "Genera analisi di mercato approfondite", num: "04" },
  { name: "Fact Checker", desc: "Verifica ogni affermazione sulle fonti originali", num: "05" },
  { name: "Publisher", desc: "Pubblica e distribuisce i contenuti automaticamente", num: "06" },
  { name: "Social Editor", desc: "Sintetizza i key insight per i social media", num: "07" },
  { name: "Newsletter Curator", desc: "Seleziona e invia le newsletter ai lettori", num: "08" },
];

export default function ChiSiamo() {
  const demoRef = useRef<HTMLDivElement>(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SEOHead
        title="Ideasmart — Piattaforma di Giornalismo Agentico"
        description="Il primo giornale che funziona anche senza una redazione. Costruisci e scala una testata con l'AI agentica. Oltre 4.000 fonti certificate, 8 agenti AI specializzati."
        canonical="https://ideasmart.ai/chi-siamo"
        ogSiteName="IDEASMART"
      />

      <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>

        <SharedPageHeader />
        <BreakingNewsTicker />

        {/* ═══════════════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                Il primo giornale<br />
                che funziona anche<br />
                <span className="text-[#0a0a0a]/25">senza una redazione.</span>
              </h1>
              <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                Costruisci e scala una testata con l'AI agentica.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#0a0a0a]/45 max-w-xl">
                Oltre 4.000 fonti certificate. Una redazione di 8 agenti AI. Un solo obiettivo: informazione più veloce, oggettiva e scalabile.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToDemo}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: "#0a0a0a", borderRadius: "0" }}
                >
                  Lancia il tuo giornale →
                </button>
                <button
                  onClick={scrollToDemo}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white"
                  style={{ borderRadius: "0" }}
                >
                  Richiedi una demo
                </button>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
              {[
                { val: "4.000+", lab: "Fonti certificate" },
                { val: "8", lab: "Agenti AI specializzati" },
                { val: "100%", lab: "Contenuti verificati" },
                { val: "24/7", lab: "Operatività continua" },
              ].map((s, i) => (
                <div key={i} className="py-6 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.1)" : "none" }}>
                  <div className="text-3xl md:text-4xl font-black text-[#0a0a0a]">{s.val}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35">{s.lab}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            IL PROBLEMA
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#f5f0e8" id="problema">
          <Label>Il problema</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Oggi fare giornalismo<br />è inefficiente.
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { icon: "€", title: "Costi editoriali alti", desc: "Stipendi, collaboratori, strumenti. Una redazione tradizionale costa centinaia di migliaia di euro all'anno." },
              { icon: "⏱", title: "Produzione lenta", desc: "Dalla notizia alla pubblicazione passano ore. In un mondo real-time, è troppo." },
              { icon: "👥", title: "Dipendenza da grandi team", desc: "Servono giornalisti, editor, fact-checker, social media manager. Scalare significa assumere." },
              { icon: "⚖️", title: "Bias e qualità incostante", desc: "L'errore umano, la stanchezza, le opinioni personali. La qualità oscilla, la fiducia cala." },
            ].map((p, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-xl font-black border-2 border-[#0a0a0a] text-[#0a0a0a]">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0a0a0a]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#0a0a0a]/55">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-14 p-8 border-l-4 border-[#0a0a0a]" style={{ background: "rgba(10,10,10,0.04)" }}>
            <p className="text-xl md:text-2xl font-bold leading-snug text-[#0a0a0a]">
              Il risultato? La maggior parte delle testate non scala.<br />
              <span className="text-[#0a0a0a]/40">E chi scala, perde qualità.</span>
            </p>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            LA SOLUZIONE
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="soluzione">
          <Label>La soluzione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Ideasmart è la prima piattaforma<br />
            <span className="text-[#0a0a0a]/25">di giornalismo agentico.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/55 max-w-2xl">
            Una redazione completa, composta da 8 agenti AI specializzati, che lavorano insieme come un vero team editoriale.
          </p>

          {/* Grid agenti */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#0a0a0a]/10">
            {AGENTS.map((a, i) => (
              <div key={i} className="p-6 relative"
                style={{
                  borderRight: (i % 4 !== 3) ? "1px solid rgba(10,10,10,0.1)" : "none",
                  borderBottom: i < 4 ? "1px solid rgba(10,10,10,0.1)" : "none",
                }}>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#0a0a0a]/20">{a.num}</span>
                <h3 className="mt-2 text-base font-bold text-[#0a0a0a]">{a.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0a0a0a]/50">{a.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-1 h-full bg-[#0a0a0a]" />
              <div>
                <p className="text-lg font-bold text-[#0a0a0a]">Tu porti la linea editoriale.</p>
                <p className="mt-1 text-sm text-[#0a0a0a]/50">Decidi il tono, il posizionamento, i temi. La direzione resta tua.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-1 h-full bg-[#0a0a0a]" />
              <div>
                <p className="text-lg font-bold text-[#0a0a0a]">La piattaforma fa il resto.</p>
                <p className="mt-1 text-sm text-[#0a0a0a]/50">Raccolta, verifica, scrittura, pubblicazione, distribuzione. Tutto automatico.</p>
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            TECNOLOGIA VERIFY
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#0a0a0a" id="verify">
          <Label><span className="text-white/30">Tecnologia proprietaria</span></Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
            Non è solo AI.<br />
            <span className="text-white/30">È AI + verifica.</span>
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-white/20">
            <span className="text-[10px] font-black tracking-[0.3em] text-white/60">POWERED BY</span>
            <span className="text-lg font-black text-white tracking-wider">VERIFY</span>
          </div>
          <p className="mt-8 text-lg leading-relaxed text-white/50 max-w-2xl">
            Con Verify, ogni contenuto viene validato sulle fonti, bilanciato per oggettività e ottimizzato per tono e stile. Non pubblichiamo nulla che non sia verificato.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Validato sulle fonti", desc: "Ogni dato viene incrociato con le fonti originali. Se non è verificabile, non viene pubblicato." },
              { title: "Bilanciato per oggettività", desc: "L'algoritmo analizza il bias del contenuto e lo bilancia automaticamente per garantire neutralità." },
              { title: "Ottimizzato per tono e stile", desc: "Puoi insegnare alla piattaforma a scrivere come te. Il tuo stile editoriale, replicato su scala." },
            ].map((v, i) => (
              <div key={i} className="border-t border-white/15 pt-6">
                <h3 className="text-base font-bold text-white">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/40">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 border border-white/10 p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Puoi decidere</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                "Quanto essere neutrale o opinionated",
                "Il linguaggio editoriale della testata",
                "Il posizionamento e il tono di voce",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-white/30 font-bold text-lg">→</span>
                  <p className="text-base text-white/70">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            COSA PUOI FARE
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="use-cases">
          <Label>Cosa puoi fare</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Un'unica piattaforma,<br />infinite possibilità.
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0a0a0a]/10">
            {[
              { title: "Lanciare una nuova testata digitale", desc: "Parti da zero e vai live in pochi giorni. La piattaforma gestisce tutto: dalla raccolta notizie alla distribuzione.", badge: "NEW" },
              { title: "Automatizzare un giornale esistente", desc: "Integra la piattaforma nella tua redazione. Riduci i costi, aumenta la produzione, mantieni la qualità.", badge: "SCALE" },
              { title: "Creare vertical media", desc: "AI, startup, finanza, sport, tech. Qualsiasi verticale, con fonti specializzate e tono dedicato.", badge: "VERTICAL" },
              { title: "Aprire una rubrica personale scalabile", desc: "Sei un giornalista, un analista, un creator? Lancia la tua rubrica e lascia che la piattaforma la alimenti.", badge: "SOLO" },
            ].map((u, i) => (
              <div key={i} className="p-8"
                style={{
                  borderRight: i % 2 === 0 ? "1px solid rgba(10,10,10,0.1)" : "none",
                  borderBottom: i < 2 ? "1px solid rgba(10,10,10,0.1)" : "none",
                }}>
                <span className="inline-block text-[9px] font-black tracking-[0.2em] text-[#0a0a0a]/25 mb-3">{u.badge}</span>
                <h3 className="text-xl font-bold text-[#0a0a0a]">{u.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#0a0a0a]/50">{u.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-base font-bold text-[#0a0a0a]/60">
            Anche con 1 solo giornalista.
          </p>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            PER CHI È
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#f5f0e8" id="target">
          <Label>Per chi è</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Per chi vuole produrre contenuti<br />
            <span className="text-[#0a0a0a]/25">in modo scalabile e profittevole.</span>
          </h2>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { title: "Editori digitali", desc: "Riduci i costi, aumenta la produzione. Scala senza assumere." },
              { title: "Giornalisti indipendenti", desc: "Lancia la tua testata. Scrivi la linea editoriale, il resto lo fa la piattaforma." },
              { title: "Media company", desc: "Integra l'AI agentica nella tua redazione. Più contenuti, meno overhead." },
              { title: "Creator e analisti", desc: "Trasforma le tue competenze in una rubrica scalabile e monetizzabile." },
            ].map((t, i) => (
              <div key={i} className="p-6 text-center"
                style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.08)" : "none" }}>
                <div className="w-14 h-14 mx-auto flex items-center justify-center text-2xl font-black border-2 border-[#0a0a0a] text-[#0a0a0a] mb-4">
                  {["ED", "GI", "MC", "CR"][i]}
                </div>
                <h3 className="text-base font-bold text-[#0a0a0a]">{t.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#0a0a0a]/50">{t.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            MODELLO
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="pricing">
          <Label>Modello</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Setup semplice.<br />
            <span className="text-[#0a0a0a]/25">Crescita condivisa.</span>
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0a0a0a]">
            <div className="p-10 border-b md:border-b-0 md:border-r border-[#0a0a0a]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/30">Setup iniziale</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-black text-[#0a0a0a]">€5.000</span>
                <span className="text-base text-[#0a0a0a]/40">una tantum</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#0a0a0a]/50">
                Configurazione della piattaforma, personalizzazione editoriale, setup fonti e training degli agenti AI sulla tua linea editoriale.
              </p>
            </div>
            <div className="p-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/30">Revenue share</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-black text-[#0a0a0a]">30%</span>
                <span className="text-base text-[#0a0a0a]/40">sui ricavi generati</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#0a0a0a]/50">
                Nessun costo nascosto. Nessun canone mensile. Guadagniamo quando cresci. Il nostro successo dipende dal tuo.
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-sm font-bold text-[#0a0a0a]/40">
            Nessun costo nascosto. Guadagniamo quando cresci.
          </p>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            PROVA SOCIALE
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#f5f0e8" id="social-proof">
          <Label>Già in produzione</Label>
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-black leading-tight text-[#0a0a0a]">
              Già utilizzato da team editoriali che producono contenuti ogni giorno con strutture minime.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#0a0a0a]/50">
              IDEASMART stessa è la prova: una testata con 3 canali tematici (AI News, Startup News, DEALROOM), oltre 6.900 lettori, 20+ ricerche originali al giorno, newsletter trisettimanale e post LinkedIn automatici. Tutto gestito dalla piattaforma, con un team editoriale di 1 persona.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { val: "6.900+", lab: "Lettori attivi" },
                { val: "3", lab: "Canali tematici" },
                { val: "20+", lab: "Ricerche/giorno" },
                { val: "1", lab: "Persona nel team" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-[#0a0a0a]">{s.val}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35">{s.lab}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            CTA FINALE
        ═══════════════════════════════════════════════════════════════════ */}
        <section ref={demoRef} id="demo" className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
          <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
              Il giornalismo sta cambiando.<br />
              <span className="text-white/30">Puoi guidarlo o subirlo.</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto">
              Prenota una demo e scopri come lanciare la tua testata agentica in pochi giorni.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@ideasmart.ai?subject=Demo Piattaforma Giornalismo Agentico"
                className="px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] transition-all duration-200 hover:opacity-90"
                style={{ background: "#ffffff", borderRadius: "0" }}
              >
                Prenota una demo →
              </a>
              <a
                href="mailto:info@ideasmart.ai?subject=Informazioni Piattaforma Ideasmart"
                className="px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white border-2 border-white/30 transition-all duration-200 hover:border-white hover:bg-white hover:text-[#0a0a0a]"
                style={{ borderRadius: "0" }}
              >
                Parla con noi
              </a>
            </div>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Setup in pochi giorni · Nessun vincolo · Revenue share
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="max-w-6xl mx-auto px-4">
          <SharedPageFooter />
        </div>

      </div>
    </>
  );
}
