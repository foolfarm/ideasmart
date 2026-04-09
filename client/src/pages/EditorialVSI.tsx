/**
 * EditorialVSI — Editoriale: Venture Studio Index
 * Stile: prima pagina di giornale (bianco carta, inchiostro, SF Pro)
 * Basato sulla ricerca del Venture Studio Forum (Matthew Burris, Jul 2025)
 */
import { Link } from "wouter";
import { ArrowLeft, Calendar, TrendingUp, ExternalLink, BarChart3, Factory, Users, DollarSign, Target } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/vsi_hero_4987fe70.jpg";

const fontSans = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const fontSerif = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif";

/* ─── Dati strutturati ─── */
const STUDIO_TYPES = [
  {
    name: "Deep Tech Focus",
    icon: <Target className="w-5 h-5" />,
    desc: "Tecnologie frontier con rischio tecnico elevato ma upside straordinario. Biotech, quantum computing, materiali avanzati. Timeline: 8-12+ anni per l'exit.",
    color: "#7c3aed"
  },
  {
    name: "Venture-Return Focus",
    icon: <TrendingUp className="w-5 h-5" />,
    desc: "Tech consolidate applicate a grandi mercati con innovazione di business model. Focus su market timing e crescita rapida. Timeline: 5-8 anni.",
    color: "#0a7ea4"
  },
  {
    name: "PE-Focused Approach",
    icon: <DollarSign className="w-5 h-5" />,
    desc: "Aziende costruite per acquisizione strategica. Gap identificati in verticali consolidati, percorsi di exit prevedibili. Timeline: 3-5 anni.",
    color: "#059669"
  },
  {
    name: "Cashflow Focus",
    icon: <BarChart3 className="w-5 h-5" />,
    desc: "Profittabilità sostenibile e distribuzioni regolari. Mercati consolidati, modelli di business provati, eccellenza esecutiva. Servizi e digital commerce.",
    color: "#d97706"
  }
];

const BUILDING_APPROACHES = [
  { name: "Founder Studio", desc: "Genera idee internamente, valida, poi recluta CEO esterni per guidare le aziende." },
  { name: "Co-Founder Studio", desc: "Collabora con imprenditori dall'inizio, condividendo responsabilità di fondazione." },
  { name: "Late Co-Founder Studio", desc: "Si unisce a venture early-stage già validate per accelerarne la crescita." },
  { name: "Refounder Studio", desc: "Acquisisce asset, tecnologie o aziende underperforming e le reinventa con nuovi team." }
];

const VSI_DIMENSIONS = [
  { num: "01", title: "Strategy Type", desc: "Classificazione per approccio alla creazione di valore e profilo di rischio" },
  { num: "02", title: "Company Building", desc: "Modalità di coinvolgimento nel processo di costruzione dell'azienda" },
  { num: "03", title: "Core Capabilities", desc: "Valutazione delle competenze: Entrepreneur, Operator, Investor" },
  { num: "04", title: "Economic Structure", desc: "Struttura economica: fee, equity, modelli di compensazione" },
  { num: "05", title: "Performance Metrics", desc: "Track record, benchmarking e metriche di performance" }
];

export default function EditorialVSI() {
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <>
      <SEOHead
        title="Venture Studio Index: il Framework che Cambia le Regole della Due Diligence | Proof Press"
        description="IRR medio del 60% vs 33% del VC tradizionale. Il Venture Studio Index introduce uno standard Morningstar-like per valutare i Venture Studio."
        canonical="/editoriale/venture-studio-index"
      />

      <div className="min-h-screen bg-[#f9f6f0]" style={{ fontFamily: fontSans }}>
        {/* ─── Testata ─── */}
        <header className="border-b-2 border-[#1a1a1a] bg-[#f9f6f0]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[#1a1a1a] tracking-tight" style={{ fontFamily: fontSerif }}>
              Proof Press
            </Link>
            <span className="font-mono text-xs text-[#1a1a1a]/50 tracking-widest uppercase">{today}</span>
          </div>
          <div className="border-t border-[#1a1a1a]/20">
            <div className="max-w-4xl mx-auto px-4 py-1 flex gap-6">
              <Link href="/startup" className="font-mono text-xs tracking-widest uppercase py-1 hover:opacity-70 transition-opacity text-[#1a1a1a]">Startup News</Link>
              <Link href="/ricerche" className="font-mono text-xs tracking-widest uppercase py-1 hover:opacity-70 transition-opacity text-[#1a1a1a]">Ricerche</Link>
              <Link href="/dealroom" className="font-mono text-xs tracking-widest uppercase py-1 hover:opacity-70 transition-opacity text-[#1a1a1a]">Dealroom</Link>
            </div>
          </div>
        </header>

        {/* ─── Breadcrumb ─── */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/startup" className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity text-[#0a7ea4]">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono tracking-widest uppercase text-xs">Torna a Startup News</span>
          </Link>
        </div>

        {/* ─── Articolo ─── */}
        <article className="max-w-4xl mx-auto px-4 pb-16">
          {/* Label */}
          <div className="mb-4">
            <span className="font-mono text-xs tracking-widest uppercase px-2 py-1 border border-[#d62828] text-[#d62828]">
              Analisi Proof Press
            </span>
          </div>

          {/* Titolo */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] leading-tight mb-4" style={{ fontFamily: fontSerif }}>
            Venture Studio Index: il Framework che Cambia le Regole della Due Diligence
          </h1>

          {/* Sottotitolo */}
          <p className="text-xl text-[#1a1a1a]/70 italic mb-6 leading-relaxed" style={{ fontFamily: fontSerif }}>
            Con un IRR medio del 60% contro il 33% del top-quartile VC, i Venture Studio sono l'asset class più performante dell'early-stage. Ma fino ad oggi mancava uno standard per valutarli. Il Venture Studio Index colma questo gap.
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-4 border-b border-[#1a1a1a]/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <span className="text-white text-xs font-bold" style={{ fontFamily: fontSans }}>AL</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]" style={{ fontFamily: fontSerif }}>Adrian Lenice</p>
                <p className="font-mono text-xs text-[#1a1a1a]/50 tracking-widest uppercase">Direttore Editoriale</p>
              </div>
            </div>
            <div className="w-px h-8 bg-[#1a1a1a]/20 hidden sm:block" />
            <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/60">
              <Calendar className="w-4 h-4" />
              <span className="font-mono">2026-03-31</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#0a7ea4]">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono text-xs tracking-widest uppercase">Trend: Venture Studio & Company Building</span>
            </div>
          </div>

          {/* Hero Image */}
          <figure className="mb-8">
            <img src={HERO_IMG} alt="The Venture Building Process" loading="lazy" decoding="async" className="w-full h-64 md:h-96 object-cover" />
            <figcaption className="font-mono text-xs text-[#1a1a1a]/40 mt-2 tracking-wide">
              Il processo di Venture Building — dalla validazione all'exit. Fonte: Next Big Thing AG
            </figcaption>
          </figure>

          {/* ─── Corpo dell'articolo ─── */}
          <div className="space-y-6">
            {/* Intro */}
            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              L'emergere dei Venture Studio rappresenta una delle innovazioni strutturali più significative nella creazione di aziende early-stage dall'ascesa degli acceleratori un decennio fa. Con dati che indicano un IRR netto medio del 60% rispetto al 33% del top-quartile del venture capital tradizionale, questi creatori sistematici di aziende stanno attirando crescente attenzione da investitori istituzionali, family office e high-net-worth individuals.
            </p>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              Eppure, nonostante questa sovraperformance, gli investitori affrontano una complessità significativa nel valutare queste entità ibride che combinano funzioni imprenditoriali, operative e di investimento tradizionalmente separate nell'ecosistema startup. È in questo contesto che il <strong>Venture Studio Forum</strong> ha pubblicato il <strong>Venture Studio Index (VSI)</strong>, un framework di due diligence completo progettato per portare una standardizzazione "alla Morningstar" nella valutazione dei Venture Studio.
            </p>

            {/* Callout dato chiave */}
            <div className="bg-[#1a1a1a] text-white p-8 my-8">
              <div className="flex items-center gap-4 mb-4">
                <BarChart3 className="w-8 h-8 text-[#d62828]" />
                <span className="font-mono text-xs tracking-widest uppercase text-white/60">Il dato chiave</span>
              </div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl md:text-6xl font-bold" style={{ fontFamily: fontSerif }}>60%</span>
                <span className="text-lg text-white/60">IRR netto medio dei Venture Studio</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-white/50" style={{ fontFamily: fontSerif }}>33%</span>
                <span className="text-lg text-white/40">IRR del top-quartile VC tradizionale</span>
              </div>
              <p className="mt-4 text-sm text-white/50 font-mono">Quasi il doppio della performance. Fonte: Venture Studio Forum, 2025</p>
            </div>

            {/* Perché serve un framework */}
            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-10 mb-4" style={{ fontFamily: fontSerif }}>
              Perché serve un framework standardizzato
            </h2>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              Per gli investitori istituzionali, i Venture Studio rappresentano un modello fondamentalmente diverso rispetto al venture capital tradizionale. Mentre la maggior parte delle VC firm funziona principalmente come allocatore di capitale verso startup guidate da founder, i Venture Studio creano attivamente, costruiscono e scalano aziende utilizzando processi sistematici e risorse condivise.
            </p>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              Come nota il Vault Fund nel suo Company Creator Insights Report 2023: <em>"Molte strutture diverse possono generare performance solide, e sebbene la maggior parte degli investitori non sia a proprio agio con le holding company, queste possono essere lucrative per i limited partner e dovrebbero essere considerate un investimento di livello istituzionale."</em>
            </p>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              Questa variazione crea sfide concrete per gli allocatori: complessità strutturale (strutture legali ed economiche diverse), opacità economica (costi reali oscurati da fee complesse), difficoltà di attribuzione della performance, ostacoli al benchmarking e problemi di allineamento strategico.
            </p>

            {/* Le 5 dimensioni */}
            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-10 mb-4" style={{ fontFamily: fontSerif }}>
              Le 5 dimensioni del Venture Studio Index
            </h2>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85 mb-6" style={{ fontFamily: fontSans }}>
              Il VSI affronta queste sfide fornendo un approccio sistematico per valutare i Venture Studio su cinque dimensioni essenziali, ciascuna contenente metriche specifiche e criteri di valutazione che impattano direttamente sui risultati di performance.
            </p>

            <div className="space-y-4 mb-8">
              {VSI_DIMENSIONS.map((d) => (
                <div key={d.num} className="flex gap-4 items-start border-b border-[#1a1a1a]/10 pb-4">
                  <span className="font-mono text-2xl font-bold text-[#d62828] shrink-0">{d.num}</span>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a] text-lg" style={{ fontFamily: fontSerif }}>{d.title}</h3>
                    <p className="text-[#1a1a1a]/70 text-base">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4 categorie di studio */}
            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-10 mb-4" style={{ fontFamily: fontSerif }}>
              Le 4 categorie strategiche
            </h2>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85 mb-6" style={{ fontFamily: fontSans }}>
              La prima dimensione del VSI classifica gli studio in base al loro approccio fondamentale alla creazione di valore. Questa categorizzazione impatta direttamente sulle decisioni di costruzione del portafoglio e sul benchmarking appropriato.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {STUDIO_TYPES.map((st) => (
                <div key={st.name} className="border border-[#1a1a1a]/15 p-5 hover:border-[#1a1a1a]/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2" style={{ color: st.color }}>
                    {st.icon}
                    <h3 className="font-bold text-base" style={{ fontFamily: fontSerif }}>{st.name}</h3>
                  </div>
                  <p className="text-sm text-[#1a1a1a]/70 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* Approcci al Company Building */}
            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-10 mb-4" style={{ fontFamily: fontSerif }}>
              4 approcci al Company Building
            </h2>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85 mb-6" style={{ fontFamily: fontSans }}>
              La seconda dimensione valuta come gli studio si coinvolgono nel processo di costruzione dell'azienda — un fattore critico per valutare le loro capability e il potenziale di valore aggiunto.
            </p>

            <div className="space-y-3 mb-8">
              {BUILDING_APPROACHES.map((ba, i) => (
                <div key={ba.name} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a]" style={{ fontFamily: fontSerif }}>{ba.name}</h3>
                    <p className="text-sm text-[#1a1a1a]/70">{ba.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Core Capabilities */}
            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-10 mb-4" style={{ fontFamily: fontSerif }}>
              Il triangolo delle competenze: Entrepreneur, Operator, Investor
            </h2>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              La terza dimensione valuta le capability di uno studio su tre ruoli fondamentali che impattano sui tassi di successo, il potenziale di creazione di valore e i ritorni economici.
            </p>

            <div className="bg-[#f0ece4] p-6 my-6 border-l-4 border-[#0a7ea4]">
              <div className="flex items-center gap-2 mb-3">
                <Factory className="w-5 h-5 text-[#0a7ea4]" />
                <span className="font-mono text-xs tracking-widest uppercase text-[#0a7ea4]">KPI chiave per dimensione</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-bold text-[#1a1a1a] mb-1">Entrepreneur</p>
                  <p className="text-[#1a1a1a]/70">Idea conversion rate, time to market, time to revenue, qualità del founding team</p>
                </div>
                <div>
                  <p className="font-bold text-[#1a1a1a] mb-1">Operator</p>
                  <p className="text-[#1a1a1a]/70">Resource efficiency, team load ratio, time to scale, expertise di dominio</p>
                </div>
                <div>
                  <p className="font-bold text-[#1a1a1a] mb-1">Investor</p>
                  <p className="text-[#1a1a1a]/70">Capital efficiency, equity value per dollar invested, struttura economica</p>
                </div>
              </div>
            </div>

            {/* Implicazioni per l'Italia */}
            <h2 className="text-2xl font-bold text-[#1a1a1a] mt-10 mb-4" style={{ fontFamily: fontSerif }}>
              Cosa significa per l'ecosistema italiano
            </h2>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              Il modello Venture Studio sta guadagnando trazione anche in Italia, dove l'ecosistema startup è tradizionalmente caratterizzato da frammentazione, scarsità di capitale early-stage e un gap significativo tra ricerca accademica e commercializzazione. Framework come il VSI possono accelerare la maturazione dell'ecosistema italiano in tre modi.
            </p>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              Primo, offrendo agli investitori istituzionali italiani — storicamente cauti verso il venture — uno strumento di valutazione standardizzato che riduce l'incertezza. Secondo, aiutando i Venture Studio italiani emergenti a posizionarsi in modo chiaro rispetto ai benchmark internazionali. Terzo, facilitando il dialogo tra corporate italiane, family office e studio, creando un linguaggio comune per la collaborazione.
            </p>

            <p className="text-lg leading-relaxed text-[#1a1a1a]/85" style={{ fontFamily: fontSans }}>
              La domanda non è più "se" investire nei Venture Studio, ma "come" selezionare quelli giusti. Il VSI fornisce finalmente gli strumenti per rispondere.
            </p>

            {/* Nota dell'autore */}
            <blockquote className="mt-10 border-l-4 border-[#d62828] pl-6 py-2">
              <p className="text-base italic text-[#1a1a1a]/70 leading-relaxed" style={{ fontFamily: fontSerif }}>
                Questa analisi è basata sulla ricerca "The Venture Studio Index" pubblicata dal Venture Studio Forum (Matthew Burris, luglio 2025). Il VSI rappresenta il primo tentativo sistematico di standardizzare la valutazione dei Venture Studio come asset class. Per la ricerca completa, consultare la fonte originale.
              </p>
            </blockquote>

            {/* Link alla fonte */}
            <div className="mt-8 p-6 border-2 border-[#1a1a1a]/20 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-[#0a7ea4]" />
                <span className="font-mono text-xs tracking-widest uppercase text-[#0a7ea4]">Fonte originale</span>
              </div>
              <a
                href="https://newsletter.venturestudioforum.org/p/the-venture-studio-index"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-[#1a1a1a] hover:text-[#0a7ea4] transition-colors underline decoration-[#0a7ea4]/30 hover:decoration-[#0a7ea4]"
                style={{ fontFamily: fontSerif }}
              >
                The Venture Studio Index — Venture Studio Forum
              </a>
              <p className="text-sm text-[#1a1a1a]/50 mt-1 font-mono">Di Matthew Burris · Luglio 2025</p>
            </div>
          </div>

          {/* ─── Footer articolo ─── */}
          <div className="mt-12 pt-6 border-t border-[#1a1a1a]/20">
            {/* Condividi su LinkedIn */}
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent("Venture Studio Index: IRR medio 60% vs 33% del VC tradizionale. Il primo framework standardizzato per valutare i Venture Studio — Analisi Proof Press");
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank', 'width=600,height=600');
                }}
                className="inline-flex items-center gap-3 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ background: '#0A66C2', color: '#fff', fontFamily: fontSans }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Condividi su LinkedIn
              </button>
            </div>
            <div className="flex items-center justify-between">
              <Link href="/startup" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity text-[#0a7ea4]">
                <ArrowLeft className="w-4 h-4" />
                Torna a Startup News
              </Link>
              <Link href="/" className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors font-mono tracking-widest uppercase text-xs">
                Proof Press Home
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
