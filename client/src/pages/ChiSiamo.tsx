/**
 * IDEASMART — Landing Page di Vendita
 * Piattaforma di giornalismo agentico.
 * Stile: Stripe / Notion — pulito, diretto, moderno.
 * Palette: bianco (#ffffff), nero (#0a0a0a), crema (#f5f0e8), accento rosso (#dc2626).
 */
import { useRef, useState } from "react";
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

/* ── FAQ Data ── */
const FAQ_ITEMS = [
  {
    q: "Come funziona la piattaforma Ideasmart?",
    a: "Ideasmart è una redazione digitale composta da agenti AI specializzati che lavorano come un team editoriale. Analizzano oltre 4.000 fonti certificate ogni giorno, verificano le notizie con la tecnologia proprietaria Verify, scrivono articoli editoriali e li distribuiscono automaticamente sui canali tematici configurati."
  },
  {
    q: "Cos'è la tecnologia Verify?",
    a: "Verify è un protocollo di validazione e certificazione agentica delle notizie. Attraverso un sistema AI di confronto multi-fonte, analizza ogni contenuto, ne misura affidabilità, coerenza fattuale e obiettività, e genera un Verification Report strutturato. Il report viene poi sigillato con un hash crittografico immutabile, che ne garantisce tracciabilità, trasparenza e verificabilità nel tempo, secondo una logica di notarizzazione ispirata al Web3. Ogni notizia è così certificata e non alterabile."
  },
  {
    q: "Quali sono i modelli di redazione disponibili?",
    a: "Offriamo 4 piani: Mini (4 agenti, 1 canale, €2.500 setup + €500/mese), Medium (8 agenti, 3 canali + newsletter, €5.000 setup + €750/mese), Maxi (12 agenti, 6 canali + newsletter + distribuzione avanzata, €7.500 setup + €900/mese) e Custom (su misura). In alternativa al canone mensile, puoi scegliere il revenue share al 20% sui ricavi generati. Nessun costo nascosto."
  },
  {
    q: "Quanto tempo serve per lanciare una testata?",
    a: "Il setup completo richiede pochi giorni. Include la configurazione della piattaforma, la personalizzazione editoriale, il setup delle fonti e il training degli agenti AI sulla tua linea editoriale. Dopo il lancio, la redazione è operativa 24/7."
  },
  {
    q: "Posso personalizzare lo stile editoriale?",
    a: "Assolutamente. Puoi definire il tono (neutrale, opinionated, tecnico, divulgativo), il linguaggio, il posizionamento della testata e persino insegnare alla piattaforma a scrivere come te. Gli agenti AI si adattano alla tua linea editoriale."
  },
  {
    q: "Quante fonti vengono monitorate?",
    a: "Oltre 4.000 fonti certificate a livello globale, monitorate continuamente. Le fonti vengono selezionate e validate dal nostro team, e puoi aggiungere fonti specifiche per il tuo settore."
  },
  {
    q: "Serve un team editoriale per gestire la piattaforma?",
    a: "No. Il modello Mini funziona anche con una sola persona. La piattaforma gestisce autonomamente l'intero flusso editoriale: raccolta notizie, verifica, scrittura, pubblicazione e distribuzione. Tu mantieni il controllo sulla linea editoriale e sulla strategia."
  },
  {
    q: "Per chi è pensata la piattaforma?",
    a: "Per editori digitali, giornalisti indipendenti, media company e creator che vogliono lanciare una nuova testata o automatizzare una esistente. Ideale per chi vuole produrre contenuti editoriali in modo scalabile e profittevole, anche su verticali specifici (AI, startup, finanza, sport, ecc.)."
  },
  {
    q: "Come funziona il revenue share?",
    a: "Guadagniamo solo quando cresci. Il 20% viene calcolato sui ricavi effettivamente generati dalla testata (abbonamenti, pubblicità, sponsorizzazioni). Scegli il revenue share al posto del canone mensile: paghi solo il setup una tantum e poi cresciamo insieme. Nessun costo fisso mensile, nessun rischio."
  },
  {
    q: "Come posso iniziare?",
    a: "Prenota una demo per vedere la piattaforma in azione e discutere il modello più adatto alle tue esigenze. Puoi scriverci a info@ideasmart.ai o prenotare direttamente dal sito."
  },
];

/* ── FAQ Accordion Item ── */
function FaqItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-[#0a0a0a]/8">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left transition-colors hover:opacity-70"
        style={{ fontFamily: FONT }}
      >
        <span className="text-base md:text-lg font-bold text-[#0a0a0a] pr-8">{question}</span>
        <span
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xl font-light text-[#0a0a0a]/40 transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? '300px' : '0', opacity: isOpen ? 1 : 0 }}
      >
        <p className="pb-6 text-sm md:text-base leading-relaxed text-[#0a0a0a]/55 max-w-3xl">{answer}</p>
      </div>
    </div>
  );
}

/* ── FAQ Accordion wrapper ── */
function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="border-t border-[#0a0a0a]/8">
      {FAQ_ITEMS.map((item, i) => (
        <FaqItem
          key={i}
          question={item.q}
          answer={item.a}
          isOpen={openIndex === i}
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}

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
            <span className="text-white/30">È AI + certificazione.</span>
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-white/20">
            <span className="text-[10px] font-black tracking-[0.3em] text-white/60">POWERED BY</span>
            <span className="text-lg font-black text-white tracking-wider">VERIFY</span>
          </div>
          <p className="mt-8 text-lg leading-relaxed text-white/50 max-w-2xl">
            Verify è un protocollo di validazione e certificazione agentica delle notizie. Attraverso un sistema AI di confronto multi-fonte, analizza ogni contenuto, ne misura affidabilità, coerenza fattuale e obiettività, e genera un Verification Report con gli esiti dell'analisi.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-white/50 max-w-2xl">
            Il report viene quindi sigillato attraverso un <strong className="text-white/80">hash crittografico immutabile</strong>, che ne garantisce tracciabilità, trasparenza e verificabilità nel tempo, secondo una logica di notarizzazione ispirata al Web3.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Analisi multi-fonte", desc: "Ogni notizia viene confrontata con fonti multiple per misurare affidabilità e coerenza fattuale." },
              { title: "Verification Report", desc: "Per ogni contenuto viene generato un report strutturato con esiti, criteri di analisi e punteggio di oggettività." },
              { title: "Hash crittografico", desc: "Il report viene sigillato con un hash immutabile: non alterabile e verificabile in qualsiasi momento." },
              { title: "Notarizzazione Web3", desc: "Tracciabilità, trasparenza e verificabilità nel tempo secondo una logica ispirata alla blockchain." },
            ].map((v, i) => (
              <div key={i} className="border-t border-white/15 pt-6">
                <h3 className="text-base font-bold text-white">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/40">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 border border-white/10 p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Come funziona</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                "L'AI analizza il contenuto confrontandolo con fonti certificate",
                "Genera un Verification Report con affidabilità, bias e coerenza",
                "Sigilla il report con hash crittografico immutabile",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-white/30 font-bold text-lg">{`0${i + 1}`}</span>
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
            MODELLO — 3 PIANI + CUSTOM
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="pricing">
          <Label>Modello</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Scegli la tua redazione.<br />
            <span className="text-[#0a0a0a]/25">Scala quando vuoi.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/55 max-w-2xl">
            Tre configurazioni pronte, più un piano su misura. Setup una tantum + canone mensile contenuto. Oppure scegli il revenue share: paghi solo quando cresci.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#0a0a0a]">
            {/* MINI */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-[#0a0a0a]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/30">Mini</span>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-black text-[#0a0a0a]">€2.500</span>
                <span className="text-sm font-bold text-[#0a0a0a]/40 ml-1">una tantum</span>
              </div>
              <div className="mt-1">
                <span className="text-xl font-black text-[#0a0a0a]">+ €500</span>
                <span className="text-sm text-[#0a0a0a]/50">/mese</span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">4 agenti AI</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">1 canale</strong> tematico</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70">Setup fonti e training editoriale</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#0a0a0a]/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/30 mb-1">Costo annuo</p>
                <p className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">€8.500</strong>/anno</p>
              </div>
              <p className="mt-4 text-xs text-[#0a0a0a]/35">Ideale per lanciare un vertical media o una rubrica personale.</p>
            </div>

            {/* MEDIUM — evidenziato */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-[#0a0a0a] relative" style={{ background: '#f5f0e8' }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#dc2626' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/30">Medium</span>
              <span className="ml-3 text-[9px] font-black uppercase tracking-[0.15em] text-white px-2 py-0.5" style={{ background: '#dc2626' }}>Più scelto</span>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-black text-[#0a0a0a]">€5.000</span>
                <span className="text-sm font-bold text-[#0a0a0a]/40 ml-1">una tantum</span>
              </div>
              <div className="mt-1">
                <span className="text-xl font-black text-[#0a0a0a]">+ €750</span>
                <span className="text-sm text-[#0a0a0a]/50">/mese</span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">8 agenti AI</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">3 canali</strong> tematici</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">Gestione newsletter</strong> automatica</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70">Setup fonti e training editoriale</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#0a0a0a]/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/30 mb-1">Costo annuo</p>
                <p className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">€14.000</strong>/anno</p>
              </div>
              <p className="mt-4 text-xs text-[#0a0a0a]/35">La configurazione completa per una testata multi-canale con distribuzione automatica.</p>
            </div>

            {/* MAXI */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-[#0a0a0a]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/30">Maxi</span>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-black text-[#0a0a0a]">€7.500</span>
                <span className="text-sm font-bold text-[#0a0a0a]/40 ml-1">una tantum</span>
              </div>
              <div className="mt-1">
                <span className="text-xl font-black text-[#0a0a0a]">+ €900</span>
                <span className="text-sm text-[#0a0a0a]/50">/mese</span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">12 agenti AI</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">6 canali</strong> tematici</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">Newsletter</strong> automatica</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-[#0a0a0a]/70">Setup fonti e training editoriale</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-[#0a0a0a]/10">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/30 mb-1">Costo annuo</p>
                <p className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">€18.300</strong>/anno</p>
              </div>
              <p className="mt-4 text-xs text-[#0a0a0a]/35">Per media company e redazioni che vogliono massima copertura e automazione.</p>
            </div>

            {/* CUSTOM */}
            <div className="p-8" style={{ background: '#0a0a0a' }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Custom</span>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-black text-white">Parliamone</span>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-white font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-white/60">Agenti e canali <strong className="text-white">su misura</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-white/60">Integrazioni <strong className="text-white">personalizzate</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-white font-bold text-sm mt-0.5">→</span>
                  <span className="text-sm text-white/60">SLA e supporto <strong className="text-white">dedicato</strong></span>
                </div>
              </div>
              <a
                href="mailto:info@ideasmart.ai?subject=Piano Custom Piattaforma Ideasmart"
                className="mt-6 inline-block px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[#0a0a0a] transition-all duration-200 hover:opacity-90"
                style={{ background: '#ffffff' }}
              >
                Contattaci →
              </a>
            </div>
          </div>

          {/* ALTERNATIVA REVENUE SHARE */}
          <div className="mt-10 border-2 border-dashed border-[#0a0a0a]/20 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/30">Alternativa</span>
                <h3 className="mt-2 text-2xl md:text-3xl font-black text-[#0a0a0a] leading-tight">
                  Preferisci il revenue share?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#0a0a0a]/55">
                  Al posto del canone mensile, puoi scegliere il modello <strong className="text-[#0a0a0a]">revenue share al 20%</strong> sui ricavi generati dalla testata. Paghi solo il setup una tantum e poi cresciamo insieme: noi guadagniamo solo quando guadagni tu. Nessun costo fisso mensile, nessun rischio.
                </p>
              </div>
              <div className="flex-shrink-0 text-center md:text-right">
                <div className="text-5xl md:text-6xl font-black text-[#0a0a0a]">20%</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35 mt-1">Revenue share</div>
                <div className="text-xs text-[#0a0a0a]/40 mt-2">Solo setup una tantum<br />+ 20% sui ricavi effettivi</div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#0a0a0a]/40">
            Tutti i piani includono: configurazione piattaforma, personalizzazione editoriale, setup fonti e training AI.
          </p>

          {/* CONFRONTO CON REDAZIONE TRADIZIONALE */}
          <div className="mt-16">
            <Label>Confronto</Label>
            <h3 className="text-2xl md:text-4xl font-black leading-tight text-[#0a0a0a] mb-4">
              Fino a 10 volte meno<br />
              <span className="text-[#0a0a0a]/25">di una redazione tradizionale.</span>
            </h3>
            <p className="text-base leading-relaxed text-[#0a0a0a]/50 max-w-2xl mb-10">
              Una redazione tradizionale con giornalisti, editor, fact-checker e social media manager costa tra €80.000 e €180.000 all'anno. Con Ideasmart ottieni lo stesso output a una frazione del costo.
            </p>

            {/* Tabella confronto */}
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #0a0a0a' }}>
                    <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40" style={{ fontFamily: FONT }}>Voce di costo</th>
                    <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 text-right" style={{ fontFamily: FONT }}>Redazione tradizionale</th>
                    <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 text-right" style={{ fontFamily: FONT }}>Ideasmart Medium</th>
                    <th className="py-4 pl-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#dc2626]/70 text-right" style={{ fontFamily: FONT }}>Risparmio</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { voce: "Giornalisti (2-3 FTE)", trad: "€60.000 — €90.000", idea: "Incluso", saving: "100%" },
                    { voce: "Editor / Caporedattore", trad: "€35.000 — €50.000", idea: "Incluso", saving: "100%" },
                    { voce: "Fact-checker", trad: "€25.000 — €35.000", idea: "Incluso (Verify)", saving: "100%" },
                    { voce: "Social media manager", trad: "€20.000 — €30.000", idea: "Incluso", saving: "100%" },
                    { voce: "Strumenti e software", trad: "€5.000 — €10.000", idea: "Incluso", saving: "100%" },
                    { voce: "Newsletter e distribuzione", trad: "€3.000 — €8.000", idea: "Incluso", saving: "100%" },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
                      <td className="py-3 pr-4 text-sm font-bold text-[#0a0a0a]">{row.voce}</td>
                      <td className="py-3 px-4 text-sm text-[#0a0a0a]/50 text-right">{row.trad}</td>
                      <td className="py-3 px-4 text-sm text-[#0a0a0a]/70 text-right font-bold">{row.idea}</td>
                      <td className="py-3 pl-4 text-sm font-black text-right" style={{ color: '#dc2626' }}>{row.saving}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #0a0a0a' }}>
                    <td className="py-4 pr-4 text-base font-black text-[#0a0a0a]">Totale annuo</td>
                    <td className="py-4 px-4 text-base font-black text-[#0a0a0a]/50 text-right">€148.000 — €223.000</td>
                    <td className="py-4 px-4 text-base font-black text-[#0a0a0a] text-right">€14.000</td>
                    <td className="py-4 pl-4 text-base font-black text-right" style={{ color: '#dc2626' }}>fino a 16x meno</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-10 p-8 border-l-4 border-[#0a0a0a]" style={{ background: 'rgba(10,10,10,0.04)' }}>
              <p className="text-xl md:text-2xl font-bold leading-snug text-[#0a0a0a]">
                Una redazione di 3 canali costa oltre €150.000/anno.<br />
                <span className="text-[#0a0a0a]/40">Con Ideasmart, da €8.500/anno. Stesso output, 10x meno.</span>
              </p>
            </div>
          </div>
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
            FAQ
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="faq">
          <Label>Domande frequenti</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a] mb-4">
            Tutto quello che devi sapere.
          </h2>
          <p className="text-base text-[#0a0a0a]/45 max-w-2xl mb-10">
            Le risposte alle domande più comuni sulla piattaforma, i modelli di redazione e la tecnologia Verify.
          </p>
          <FaqAccordion />
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
