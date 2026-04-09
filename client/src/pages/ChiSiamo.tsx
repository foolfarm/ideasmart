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
import LeftSidebar from "@/components/LeftSidebar";
import { trpc } from "@/lib/trpc";

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

/* ── Esempi Agent Giornalisti ── */
const AGENT_EXAMPLES = [
  {
    icon: "🏦",
    name: 'Agent "Finanza"',
    segue: "mercati, banche, fintech, regolamentazione",
    fonti: "Il Sole 24 Ore, FT, Reuters, BCE, Consob",
    output: "3-5 articoli/giorno sul canale Finanza",
    tone: "formale, dati-driven, analisi tecnica",
  },
  {
    icon: "🤖",
    name: 'Agent "Tech & AI"',
    segue: "intelligenza artificiale, startup tech, innovazione",
    fonti: "TechCrunch, Wired, Agenda Digitale, The Verge",
    output: "4-6 articoli/giorno sul canale Tech",
    tone: "informale, accessibile, orientato al business",
  },
  {
    icon: "⚽",
    name: 'Agent "Sport Business"',
    segue: "economia dello sport, deal, sponsorship, diritti TV",
    fonti: "SportEconomy, Calcio e Finanza, ESPN Business",
    output: "3-4 articoli/giorno sul canale Sport",
    tone: "colloquiale, dati e numeri, analisi dei deal",
  },
];

/* ── FAQ Data ── */
const FAQ_ITEMS = [
  {
    q: "Come funziona la piattaforma Proof Press?",
    a: "Proof Press è una redazione digitale composta da agenti AI specializzati che lavorano come un team editoriale. Analizzano oltre 4.000 fonti certificate ogni giorno, verificano le notizie con la tecnologia proprietaria ProofPress Verify, scrivono articoli editoriali e li distribuiscono automaticamente sui canali tematici configurati."
  },
  {
    q: "Cos'è la tecnologia ProofPress Verify?",
    a: "ProofPress Verify è un protocollo di validazione e certificazione agentica delle notizie. Attraverso un sistema AI di confronto multi-fonte, analizza ogni contenuto, ne misura affidabilità, coerenza fattuale e obiettività, e genera un Verification Report strutturato. Il report viene poi sigillato con un hash crittografico immutabile, che ne garantisce tracciabilità, trasparenza e verificabilità nel tempo, secondo una logica di notarizzazione ispirata al Web3. Ogni notizia è così certificata e non alterabile."
  },
  {
    q: "Quali sono i modelli di redazione disponibili?",
    a: "Offriamo 4 piani: Single Vertical (4 Agent Giornalisti + 4 agenti di supporto, 1 canale, €2.500 setup + €500/mese), Multi-Channel (8 Agent Giornalisti + 4 agenti di supporto, fino a 6 canali + newsletter + paywall, €5.000 setup + €750/mese), Full Newsroom (12 Agent Giornalisti + 4 agenti di supporto, canali illimitati + analytics avanzato + account manager, €7.500 setup + €1.000/mese) e Custom/Enterprise (su misura). Per Multi-Channel e Full Newsroom è disponibile l'alternativa revenue share al 20%. Nessun costo nascosto."
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
    a: "No. Il piano Single Vertical funziona anche con una sola persona. La piattaforma gestisce autonomamente l'intero flusso editoriale: raccolta notizie, verifica, scrittura, pubblicazione e distribuzione. Tu mantieni il controllo sulla linea editoriale e sulla strategia."
  },
  {
    q: "Per chi è pensata la piattaforma?",
    a: "Per editori digitali, giornalisti indipendenti, media company e creator che vogliono lanciare una nuova testata o automatizzare una esistente. Ideale per chi vuole produrre contenuti editoriali in modo scalabile e profittevole, anche su verticali specifici (AI, startup, finanza, sport, ecc.)."
  },
  {
    q: "Come funziona il revenue share?",
    a: "Disponibile solo per Multi-Channel e Full Newsroom. Guadagniamo solo quando cresci. Il 20% viene calcolato sui ricavi effettivamente generati dalla testata (abbonamenti, pubblicità, sponsorizzazioni). Setup ridotto (€2.000 per Multi-Channel, €3.000 per Full Newsroom) + 20% dei ricavi con minimi garantiti (€300/mese Multi-Channel, €500/mese Full Newsroom). Nessun canone fisso mensile."
  },
  {
    q: "Come posso iniziare?",
    a: "Prenota una demo per vedere la piattaforma in azione e discutere il modello più adatto alle tue esigenze. Puoi scriverci a info@proofpress.ai o prenotare direttamente dal sito."
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
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
      <SEOHead
        title="Proof Press — Piattaforma di Giornalismo Agentico"
        description="Il primo giornale che funziona anche senza una redazione. Costruisci e scala una testata con l'AI agentica. Oltre 4.000 fonti certificate, 8 agenti AI specializzati."
        canonical="https://ideasmart.biz/chi-siamo"
        ogSiteName="Proof Press"
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
                <span className="text-[#0a0a0a]/25">senza una redazione</span>
              </h1>
              <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                e con notizie 100% certificate.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#0a0a0a]/55 max-w-xl">
                Costruisci e scala una testata con l'AI agentica. Offri informazione certificata e sicura basata sulla tecnologia proprietaria ProofPress Verify.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#0a0a0a]/40 max-w-xl">
                Oltre 4.000 fonti certificate. Oltre 100.000 controlli e verifiche al mese per offrirti solo informazione certificata. Una redazione di 8 agenti AI. Un solo obiettivo: informazione più veloce, oggettiva e scalabile.
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
            Oggi fare giornalismo<br />è inefficiente e le informazioni fake<br />ci stanno invadendo.
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { icon: "€", title: "Costi editoriali alti", desc: "Stipendi, collaboratori, strumenti. Una redazione tradizionale costa centinaia di migliaia di euro all'anno." },
              { icon: "⏱", title: "Produzione lenta", desc: "Dalla notizia alla pubblicazione passano ore. In un mondo real-time, è troppo." },
              { icon: "🔍", title: "Informazioni Fake", desc: "Troppe notizie e ricerche sono fake o basate su informazioni non certificate. Un sistema di fact-checker è indispensabile per offrire informazione libera e vera." },
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
              <span className="text-[#0a0a0a]/40">E chi scala, perde qualità. E le informazioni spesso non sono vere!</span>
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
            Proof Press è la prima piattaforma<br />
            <span className="text-[#0a0a0a]/25">di giornalismo agentico.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/55 max-w-2xl">
            Una redazione completa di Agent Giornalisti e agenti di supporto che fanno quello che fa un team editoriale: monitorano le fonti, verificano i dati, scrivono gli articoli, li pubblicano e li distribuiscono. Tu scegli la linea editoriale. Loro eseguono.
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
            <span className="text-lg font-black text-white tracking-wider">PROOFPRESS VERIFY</span>
          </div>
          <p className="mt-8 text-lg leading-relaxed text-white/50 max-w-2xl">
            ProofPress Verify è un protocollo di validazione e certificazione agentica delle notizie. Attraverso un sistema AI di confronto multi-fonte, analizza ogni contenuto, ne misura affidabilità, coerenza fattuale e obiettività, e genera un Verification Report con gli esiti dell’analisi.
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
            AGENT GIORNALISTI
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="agent-giornalisti">
          <Label>La tua redazione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Ogni Agent è un giornalista.<br />
            <span className="text-[#0a0a0a]/25">Tu decidi di cosa si occupa.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/55 max-w-2xl">
            Un Agent Giornalista è un membro della tua redazione AI: lo configuri su un settore, gli assegni le fonti, e lui ogni giorno monitora, scrive e pubblica. Come un giornalista vero — solo che lavora 24/7 e non va mai in ferie.
          </p>

          {/* 3 esempi Agent */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#0a0a0a]/10">
            {AGENT_EXAMPLES.map((a, i) => (
              <div key={i} className="p-8" style={{ borderRight: i < 2 ? "1px solid rgba(10,10,10,0.1)" : "none" }}>
                <span className="text-3xl">{a.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-[#0a0a0a]">{a.name}</h3>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">Segue:</strong> {a.segue}</p>
                  <p className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">Fonti:</strong> {a.fonti}</p>
                  <p className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">Output:</strong> {a.output}</p>
                  <p className="text-sm text-[#0a0a0a]/70"><strong className="text-[#0a0a0a]">Tone:</strong> {a.tone}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-base leading-relaxed text-[#0a0a0a]/55">
            Ogni Agent Giornalista lavora in autonomia sul suo settore.<br />
            Più Agent hai, più settori copri, più articoli produci.
          </p>

          {/* Contatori Agent */}
          <div className="mt-8 grid grid-cols-3 gap-0 border border-[#0a0a0a]/10 max-w-xl mx-auto">
            {[
              { num: "4 Agent", sub: "10-15 articoli/giorno" },
              { num: "8 Agent", sub: "20-30 articoli/giorno" },
              { num: "12 Agent", sub: "Senza limiti" },
            ].map((c, i) => (
              <div key={i} className="py-6 text-center" style={{ borderRight: i < 2 ? "1px solid rgba(10,10,10,0.1)" : "none", background: i === 1 ? "rgba(10,10,10,0.03)" : "transparent" }}>
                <div className="text-2xl font-black text-[#0a0a0a]">{c.num}</div>
                <div className="text-xs text-[#0a0a0a]/40 mt-1">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabella agenti per piano */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #0a0a0a' }}>
                  <th className="py-4 pr-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40" style={{ fontFamily: FONT }}></th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 text-center" style={{ fontFamily: FONT }}>Single Vertical</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-center" style={{ fontFamily: FONT, color: '#dc2626' }}>Multi-Channel</th>
                  <th className="py-4 pl-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 text-center" style={{ fontFamily: FONT }}>Full Newsroom</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
                  <td className="py-3 pr-4 text-sm font-bold text-[#0a0a0a]">Agent Giornalisti</td>
                  <td className="py-3 px-4 text-sm text-[#0a0a0a]/70 text-center">4</td>
                  <td className="py-3 px-4 text-sm font-bold text-center" style={{ color: '#dc2626' }}>8</td>
                  <td className="py-3 pl-4 text-sm text-[#0a0a0a]/70 text-center">12</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
                  <td className="py-3 pr-4 text-xs text-[#0a0a0a]/40">(configurabili per settore)</td>
                  <td className="py-3 px-4 text-xs text-[#0a0a0a]/50 text-center">1 verticale</td>
                  <td className="py-3 px-4 text-xs text-[#0a0a0a]/50 text-center">fino a 6 canali</td>
                  <td className="py-3 pl-4 text-xs text-[#0a0a0a]/50 text-center">canali illimitati</td>
                </tr>
                <tr style={{ borderTop: '2px solid #0a0a0a' }}>
                  <td className="py-4 pr-4 text-sm font-black text-[#0a0a0a]">Totale agenti</td>
                  <td className="py-4 px-4 text-sm font-black text-[#0a0a0a] text-center">4+4 = 8</td>
                  <td className="py-4 px-4 text-sm font-black text-center" style={{ color: '#dc2626' }}>8+4 = 12</td>
                  <td className="py-4 pl-4 text-sm font-black text-[#0a0a0a] text-center">12+4 = 16</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Agenti di supporto */}
          <div className="mt-10 border border-[#0a0a0a]/10 p-8" style={{ background: 'rgba(10,10,10,0.02)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/30 mb-4">Agenti di supporto inclusi in tutti i piani</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "✅", name: "Fact Checker", desc: "Verifica ogni notizia su fonti multiple (ProofPress Verify™)" },
                { icon: "📢", name: "Publisher", desc: "Pubblica e impagina in automatico" },
                { icon: "📧", name: "Newsletter Curator", desc: "Seleziona e invia le newsletter" },
                { icon: "📱", name: "Social Editor", desc: "Genera post per LinkedIn, Twitter, Telegram" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="mt-2 text-sm font-bold text-[#0a0a0a]">{s.name}</p>
                  <p className="mt-1 text-xs text-[#0a0a0a]/50">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[#0a0a0a]/45">
            Gli Agent Giornalisti sono quelli che <strong className="text-[#0a0a0a]">TU</strong> configuri: scegli il settore, le fonti, il tono, la frequenza.<br />
            Gli agenti di supporto lavorano in automatico su tutti i contenuti prodotti.
          </p>

        </Section>

        <Divider />

        {/* ═════════════════════════════════════════════════════════════════
            CTA PREZZO UNICO
        ═════════════════════════════════════════════════════════════════ */}
        <Section id="pricing">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Crea un giornale completo agentico<br />
              a partire da sole <span style={{ color: '#dc2626' }}>€499/mese</span>
            </h2>
            <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/55">
              Chiedi una demo o parla con noi.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@proofpress.ai?subject=Informazioni Piattaforma Proof Press"
                className="px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90"
                style={{ background: '#0a0a0a', borderRadius: '0' }}
              >
                Parla con noi →
              </a>
              <a
                href="https://ideasmart.technology"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90"
                style={{ background: '#dc2626', borderRadius: '0' }}
              >
                Richiedi una Demo →
              </a>
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
              Proof Press stessa è la prova: una testata con 3 canali tematici (AI News, Startup News, DEALROOM), oltre 6.900 lettori, 20+ ricerche originali al giorno, newsletter trisettimanale e post LinkedIn automatici. Tutto gestito dalla piattaforma, con un team editoriale di 1 persona.
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
            Le risposte alle domande più comuni sulla piattaforma, i modelli di redazione e la tecnologia ProofPress Verify.
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
                href="mailto:info@proofpress.ai?subject=Informazioni Piattaforma Proof Press"
                className="px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] transition-all duration-200 hover:opacity-90"
                style={{ background: "#ffffff", borderRadius: "0" }}
              >
                Parla con noi →
              </a>
              <a
                href="https://ideasmart.technology"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white border-2 border-white/30 transition-all duration-200 hover:border-white hover:bg-white hover:text-[#0a0a0a]"
                style={{ borderRadius: "0" }}
              >
                Richiedi una Demo →
              </a>
            </div>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Setup in pochi giorni · A partire da €499/mese
            </p>
          </div>
        </section>

        {/* ── Sezione Contattaci ── */}
        <section id="contattaci" style={{ background: "#f5f0e8" }} className="py-20 md:py-28">
          <div className="max-w-2xl mx-auto px-5 md:px-8">
            <ContactForm />
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="max-w-6xl mx-auto px-4">
          <SharedPageFooter />
        </div>

      </div>
      </div>
    </div>
  );
}

/* ── Componente Modulo Contattaci ── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendContact = trpc.contactUs.send.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Errore nell'invio. Riprova.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Compila tutti i campi obbligatori.");
      return;
    }
    setError(null);
    sendContact.mutate(form);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "#ffffff",
    border: "1px solid rgba(26,26,26,0.15)",
    borderRadius: "4px",
    fontSize: "15px",
    color: "#1a1a1a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    color: "rgba(26,26,26,0.5)",
    marginBottom: "6px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
        <h3 style={{ fontSize: "24px", fontWeight: 900, color: "#1a1a1a", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          Messaggio inviato!
        </h3>
        <p style={{ fontSize: "16px", color: "rgba(26,26,26,0.6)", lineHeight: 1.7 }}>
          Ti risponderemo entro 24 ore all'indirizzo <strong>{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header sezione */}
      <div style={{ marginBottom: "40px" }}>
        <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(26,26,26,0.4)", marginBottom: "12px" }}>
          Contattaci
        </span>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 900, color: "#1a1a1a", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Scrivici
        </h2>
        <p style={{ fontSize: "17px", color: "rgba(26,26,26,0.6)", lineHeight: 1.7, margin: 0 }}>
          Hai domande su Proof Press, vuoi collaborare o proporre una partnership? Compila il modulo e ti risponderemo entro 24 ore.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Nome *</label>
            <input
              type="text"
              placeholder="Il tuo nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              placeholder="la@tuaemail.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Oggetto *</label>
          <input
            type="text"
            placeholder="Di cosa vorresti parlare?"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Messaggio *</label>
          <textarea
            placeholder="Scrivi il tuo messaggio..."
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            rows={6}
            style={{ ...inputStyle, resize: "vertical" as const }}
            required
          />
        </div>

        {error && (
          <p style={{ fontSize: "13px", color: "#d94f3d", margin: 0, padding: "10px 14px", background: "rgba(217,79,61,0.08)", borderRadius: "4px", borderLeft: "3px solid #d94f3d" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sendContact.isPending}
          style={{
            padding: "14px 32px",
            background: sendContact.isPending ? "rgba(26,26,26,0.4)" : "#1a1a1a",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: sendContact.isPending ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            alignSelf: "flex-start",
          }}
        >
          {sendContact.isPending ? "Invio in corso..." : "Invia messaggio →"}
        </button>

        <p style={{ fontSize: "12px", color: "rgba(26,26,26,0.4)", margin: 0 }}>
          Oppure scrivici direttamente a{" "}
          <a href="mailto:info@proofpress.ai" style={{ color: "#d94f3d", textDecoration: "none" }}>
            info@proofpress.ai
          </a>
        </p>
      </form>
    </div>
  );
}
