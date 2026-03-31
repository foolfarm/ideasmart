/**
 * Per Giornalisti, Freelancer e Giornali Online
 * Pagina commerciale — presenta l'offerta IdeaSmart
 * Stile: coerente con Chi Siamo (Stripe/Notion — pulito, diretto, moderno)
 * Palette: bianco (#ffffff), nero (#0a0a0a), crema (#f5f0e8), accento rosso (#dc2626)
 */
import { useRef } from "react";
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

export default function PerGiornalisti() {
  const demoRef = useRef<HTMLDivElement>(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <SEOHead
        title="Per Giornalisti, Freelancer e Giornali Online — IdeaSmart"
        description="Lancia il tuo giornale con l'AI agentica. Una redazione completa di 8 agenti AI, tecnologia Verify, 4.000+ fonti certificate. Setup in pochi giorni, anche con 1 sola persona."
        canonical="https://ideasmart.ai/per-giornalisti"
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
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626] mb-6" style={{ fontFamily: FONT }}>
                Per Giornalisti, Freelancer e Giornali Online
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                Il tuo giornale.<br />
                La tua firma.<br />
                <span className="text-[#0a0a0a]/25">La nostra tecnologia.</span>
              </h1>
              <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                Lancia una testata digitale professionale in pochi giorni, anche da solo. La piattaforma di giornalismo agentico che lavora per te, 24 ore su 24.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToDemo}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: "#0a0a0a", borderRadius: "0" }}
                >
                  Prenota una demo gratuita →
                </button>
                <a
                  href="/chi-siamo"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white text-center"
                  style={{ borderRadius: "0" }}
                >
                  Scopri la piattaforma
                </a>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
              {[
                { val: "4.000+", lab: "Fonti certificate" },
                { val: "8", lab: "Agenti AI" },
                { val: "24/7", lab: "Operativo" },
                { val: "1", lab: "Persona basta" },
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
            SEI UN GIORNALISTA?
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#f5f0e8" id="giornalisti">
          <Label>Sei un giornalista o freelancer?</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Smetti di scrivere tutto da solo.<br />
            <span className="text-[#0a0a0a]/25">Inizia a dirigere.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/55 max-w-2xl">
            Hai le competenze, il network, la visione editoriale. Ma il tempo non basta mai. Con IdeaSmart, la tua esperienza diventa il motore di una testata che produce contenuti verificati 24 ore su 24.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Tu definisci la linea editoriale",
                desc: "Tono, posizionamento, temi, fonti prioritarie. La direzione resta tua. Sempre."
              },
              {
                num: "02",
                title: "8 agenti AI lavorano per te",
                desc: "Market Scout, Data Verifier, Research Writer, Fact Checker, Publisher, Social Editor, Newsletter Curator e Senior Analyst. Un team completo."
              },
              {
                num: "03",
                title: "Pubblica e monetizza",
                desc: "Contenuti editoriali pronti per il tuo sito, newsletter e social. Ogni giorno, senza sforzo."
              },
            ].map((item, i) => (
              <div key={i} className="border-t-2 border-[#0a0a0a] pt-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#0a0a0a]/20">{item.num}</span>
                <h3 className="mt-2 text-xl font-bold text-[#0a0a0a]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#0a0a0a]/50">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 p-8 border-l-4 border-[#0a0a0a]" style={{ background: "rgba(10,10,10,0.04)" }}>
            <p className="text-xl md:text-2xl font-bold leading-snug text-[#0a0a0a]">
              "Ho lanciato una testata verticale sull'AI in 5 giorni.<br />
              <span className="text-[#0a0a0a]/40">Oggi ha 6.900 lettori. Il team? Solo io."</span>
            </p>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            HAI UN GIORNALE ONLINE?
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="giornali">
          <Label>Hai un giornale online?</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Riduci i costi.<br />
            <span className="text-[#0a0a0a]/25">Moltiplica i contenuti.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/55 max-w-2xl">
            Una redazione tradizionale costa centinaia di migliaia di euro all'anno. Con IdeaSmart integri l'AI agentica nella tua redazione esistente: più contenuti, meno overhead, stessa qualità.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#0a0a0a]/10">
            {[
              { icon: "⚡", title: "Produzione 10x", desc: "Da 3-5 articoli al giorno a 30+. Ogni contenuto verificato, ottimizzato SEO e pronto per la pubblicazione." },
              { icon: "💰", title: "Costi ridotti fino a 16x", desc: "Una redazione AI costa una frazione di una tradizionale. Nessun stipendio, nessun turnover, nessuna malattia." },
              { icon: "🎯", title: "Qualità costante", desc: "Niente bias, niente stanchezza. Ogni articolo passa attraverso il protocollo Verify di certificazione agentica." },
              { icon: "📊", title: "Vertical illimitati", desc: "AI, startup, finanza, sport, tech, salute. Apri nuovi canali tematici senza assumere specialisti." },
            ].map((p, i) => (
              <div key={i} className="p-8"
                style={{
                  borderRight: i % 2 === 0 ? "1px solid rgba(10,10,10,0.1)" : "none",
                  borderBottom: i < 2 ? "1px solid rgba(10,10,10,0.1)" : "none",
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="text-lg font-bold text-[#0a0a0a]">{p.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-[#0a0a0a]/50">{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            COME FUNZIONA
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#0a0a0a" id="come-funziona">
          <Label><span className="text-white/30">Come funziona</span></Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
            Dal setup al primo articolo<br />
            <span className="text-white/30">in pochi giorni.</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-0 border border-white/10">
            {[
              { step: "01", title: "Briefing", desc: "Definisci la tua linea editoriale, il tono, i temi e le fonti prioritarie." },
              { step: "02", title: "Setup", desc: "Configuriamo la piattaforma, le fonti e gli agenti AI sulla tua identità editoriale." },
              { step: "03", title: "Lancio", desc: "La redazione AI inizia a produrre: raccolta, verifica, scrittura, pubblicazione." },
              { step: "04", title: "Crescita", desc: "Monitora, ottimizza e scala. Aggiungi canali, newsletter, social. Senza limiti." },
            ].map((s, i) => (
              <div key={i} className="p-6"
                style={{
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none",
                }}>
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/20">{s.step}</span>
                <h3 className="mt-3 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/40">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex-shrink-0 w-1 h-16 bg-white/20" />
            <div>
              <p className="text-lg font-bold text-white">Tecnologia Verify inclusa.</p>
              <p className="mt-1 text-sm text-white/40">Ogni notizia viene analizzata, verificata e certificata con hash crittografico immutabile. Tracciabilità e trasparenza garantite.</p>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            MODELLI DI COLLABORAZIONE
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="modelli">
          <Label>Modelli di collaborazione</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Due strade.<br />
            <span className="text-[#0a0a0a]/25">Scegli quella giusta per te.</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Canone */}
            <div className="border-2 border-[#0a0a0a] p-8">
              <span className="inline-block text-[9px] font-black tracking-[0.2em] text-[#0a0a0a]/25 mb-4">OPZIONE A</span>
              <h3 className="text-2xl font-black text-[#0a0a0a]">Setup + Canone mensile</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#0a0a0a]/55">
                Un investimento iniziale per il setup della piattaforma, più un canone mensile fisso e prevedibile. Ideale per chi vuole budget certi e controllo totale.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Setup personalizzato in pochi giorni",
                  "Canone mensile fisso e trasparente",
                  "Nessun costo nascosto",
                  "Scalabile: aggiungi agenti e canali quando vuoi",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#0a0a0a] font-bold text-sm mt-0.5">→</span>
                    <p className="text-sm text-[#0a0a0a]/60">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Share */}
            <div className="border-2 border-[#dc2626] p-8 relative">
              <span className="absolute top-0 right-0 bg-[#dc2626] text-white text-[9px] font-black tracking-[0.2em] px-4 py-2">ZERO RISCHIO</span>
              <span className="inline-block text-[9px] font-black tracking-[0.2em] text-[#0a0a0a]/25 mb-4">OPZIONE B</span>
              <h3 className="text-2xl font-black text-[#0a0a0a]">Revenue Share 20%</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#0a0a0a]/55">
                Paghi solo il setup iniziale. Nessun canone mensile. Guadagniamo solo quando cresci: il 20% dei ricavi generati dalla testata.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Solo setup iniziale, zero canone mensile",
                  "Guadagniamo solo se guadagni tu",
                  "20% sui ricavi effettivi (ads, abbonamenti, sponsor)",
                  "Allineamento totale degli interessi",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#dc2626] font-bold text-sm mt-0.5">→</span>
                    <p className="text-sm text-[#0a0a0a]/60">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-base font-bold text-[#0a0a0a]/50">
            In entrambi i casi: setup in pochi giorni, supporto dedicato, tecnologia Verify inclusa.
          </p>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            CONFRONTO CON REDAZIONE TRADIZIONALE
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#f5f0e8" id="confronto">
          <Label>Il confronto</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Redazione tradizionale<br />
            <span className="text-[#0a0a0a]/25">vs. IdeaSmart.</span>
          </h2>

          <div className="mt-14 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: FONT }}>
              <thead>
                <tr>
                  <th className="py-4 pr-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35 border-b-2 border-[#0a0a0a]" style={{ width: "40%" }}></th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35 border-b-2 border-[#0a0a0a] text-center">Redazione tradizionale</th>
                  <th className="py-4 pl-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a] border-b-2 border-[#0a0a0a] text-center">IdeaSmart</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: "Team necessario", trad: "5-10 persone", smart: "1 persona" },
                  { metric: "Costo annuale", trad: "€150.000 — €250.000", smart: "Da €6.000/anno" },
                  { metric: "Articoli al giorno", trad: "3-5", smart: "30+" },
                  { metric: "Operatività", trad: "8 ore/giorno", smart: "24/7" },
                  { metric: "Verifica fonti", trad: "Manuale, soggettiva", smart: "AI + hash crittografico" },
                  { metric: "Tempo di setup", trad: "Mesi", smart: "Pochi giorni" },
                  { metric: "Scalabilità", trad: "Lineare (assumi)", smart: "Esponenziale (aggiungi canali)" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-[#0a0a0a]/8">
                    <td className="py-4 pr-6 text-sm font-bold text-[#0a0a0a]">{row.metric}</td>
                    <td className="py-4 px-6 text-sm text-[#0a0a0a]/40 text-center">{row.trad}</td>
                    <td className="py-4 pl-6 text-sm font-bold text-[#0a0a0a] text-center">{row.smart}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            PER CHI È
        ═══════════════════════════════════════════════════════════════════ */}
        <Section id="per-chi">
          <Label>Per chi è</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Se ti riconosci in uno di questi profili,<br />
            <span className="text-[#0a0a0a]/25">IdeaSmart è per te.</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#0a0a0a]/10">
            {[
              { title: "Giornalista freelance", desc: "Vuoi lanciare la tua testata senza dipendere da una redazione. Hai le competenze, ti manca la scala." },
              { title: "Editore digitale", desc: "Gestisci un giornale online e vuoi ridurre i costi editoriali senza sacrificare la qualità." },
              { title: "Creator / Analista", desc: "Hai un'audience e vuoi trasformare le tue competenze in una rubrica scalabile e monetizzabile." },
              { title: "Media company", desc: "Vuoi aprire nuovi verticali o automatizzare la produzione di contenuti su larga scala." },
            ].map((p, i) => (
              <div key={i} className="p-6"
                style={{
                  borderRight: (i % 4 !== 3) ? "1px solid rgba(10,10,10,0.1)" : "none",
                }}>
                <h3 className="text-base font-bold text-[#0a0a0a]">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#0a0a0a]/50">{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            PROVA SOCIALE
        ═══════════════════════════════════════════════════════════════════ */}
        <Section bg="#f5f0e8" id="prova-sociale">
          <Label>IdeaSmart oggi</Label>
          <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
            Numeri reali.<br />
            <span className="text-[#0a0a0a]/25">Una persona nel team.</span>
          </h2>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
            {[
              { val: "6.900+", lab: "Lettori attivi" },
              { val: "3", lab: "Canali tematici" },
              { val: "20+", lab: "Ricerche al giorno" },
              { val: "450+", lab: "Fonti monitorate" },
            ].map((s, i) => (
              <div key={i} className="py-8 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.1)" : "none" }}>
                <div className="text-4xl md:text-5xl font-black text-[#0a0a0a]">{s.val}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35">{s.lab}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-8 border-l-4 border-[#0a0a0a]" style={{ background: "rgba(10,10,10,0.04)" }}>
            <p className="text-lg leading-relaxed text-[#0a0a0a]/70">
              IdeaSmart nasce come esperimento: <strong className="text-[#0a0a0a]">un giornale gestito da una sola persona con l'AI agentica</strong>. Oggi produce oltre 30 articoli verificati al giorno, 20+ ricerche, 3 newsletter settimanali e post LinkedIn quotidiani. Tutto automatico. Tutto certificato con Verify.
            </p>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            CTA FINALE — PRENOTA DEMO
        ═══════════════════════════════════════════════════════════════════ */}
        <section ref={demoRef} id="demo" className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
          <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
              Pronto a lanciare<br />il tuo giornale?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/50 max-w-xl mx-auto">
              Prenota una demo gratuita. Ti mostriamo come funziona la piattaforma, configuriamo insieme la tua linea editoriale e ti accompagniamo fino al lancio.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@ideasmart.ai?subject=Richiesta%20demo%20IdeaSmart"
                className="px-10 py-5 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] transition-all duration-200 hover:opacity-90 inline-block"
                style={{ background: "#ffffff", borderRadius: "0" }}
              >
                Prenota una demo gratuita →
              </a>
              <a
                href="mailto:info@ideasmart.ai?subject=Informazioni%20IdeaSmart"
                className="px-10 py-5 text-sm font-bold uppercase tracking-[0.15em] text-white border-2 border-white/30 transition-all duration-200 hover:bg-white hover:text-[#0a0a0a] inline-block"
                style={{ borderRadius: "0" }}
              >
                Scrivici
              </a>
            </div>
            <p className="mt-8 text-sm text-white/30">
              info@ideasmart.ai — Setup in pochi giorni — Nessun impegno
            </p>
          </div>
        </section>

        <SharedPageFooter />
      </div>
    </>
  );
}
