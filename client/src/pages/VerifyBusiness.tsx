/*
 * ProofPress Verify Business — Landing Enterprise B2B
 * Allineata graficamente a /offertacommerciale (PerGiornalisti.tsx)
 * Palette: bianco (#ffffff), nero (#0a0a0a), crema (#f5f5f7), accento rosso (#dc2626)
 * Struttura: LeftSidebar + SharedPageHeader + BreakingNewsTicker + SharedPageFooter
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
export default function VerifyBusiness() {
  const scrollToHowItWorks = () =>
    document.getElementById("come-funziona")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <SEOHead
        title="ProofPress Verify Business — Information Integrity Assurance per l'Enterprise"
        description="Infrastruttura tecnologica per CSRD, AI Act e DSA. Hash crittografici immutabili, corroborazione multi-fonte AI, audit trail regolatorio nativo. Per CFO, Legal, Compliance e Audit Leadership."
        canonical="https://proofpress.ai/verify-business"
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
              <div className="max-w-3xl">
                <Label accent>ProofPress Verify Business · AxiomiX LLC · FoolFarm</Label>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                  Information Integrity<br />
                  <span className="text-[#0a0a0a]/25">Assurance.</span>
                </h1>
                <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                  La prossima frontiera dell'assurance non-financial. CSRD, AI Act e DSA convergono nel trasformare il reporting qualitativo in un'obbligazione di certificazione paragonabile a quella del bilancio.
                </p>
                <p className="mt-3 text-lg leading-relaxed text-[#0a0a0a]/45 max-w-2xl" style={{ fontFamily: FONT }}>
                  ProofPress Verify è l'infrastruttura tecnologica che industrializza quella certificazione — con hash crittografici immutabili, corroborazione multi-fonte AI e audit trail regolatorio nativo.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <a
                    href="#contatto"
                    className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:opacity-90 inline-block"
                    style={{ background: "#dc2626", borderRadius: 0 }}
                  >
                    Richiedi un Briefing Esecutivo →
                  </a>
                  <button
                    onClick={scrollToHowItWorks}
                    className="px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#0a0a0a] border-2 border-[#0a0a0a] transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white"
                    style={{ borderRadius: 0 }}
                  >
                    Come Funziona ↓
                  </button>
                </div>
                <p className="mt-5 text-[13px] text-[#0a0a0a]/35" style={{ fontFamily: FONT }}>
                  Già in produzione · API-first · Conformità nativa AI Act / CSRD / DSA
                </p>
              </div>
            </div>
          </section>

          {/* ═══ SEZIONE 2 — IL NUMERO CHE CONTA ═══ */}
          <section className="py-20 md:py-24" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
              <div className="text-7xl md:text-9xl font-black text-white tracking-tight">~€0,003</div>
              <p className="mt-4 text-xl md:text-2xl font-medium text-white/70">
                per claim verificata con ProofPress Verify.
              </p>
              <p className="mt-2 text-lg text-white/50">
                Contro i 5–50€ del processo manuale tradizionale.
              </p>
              <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                <span>≤15s latenza p95</span>
                <span>·</span>
                <span>~2.800 claim/giorno</span>
                <span>·</span>
                <span>99.5% SLA uptime</span>
                <span>·</span>
                <span>Hash SHA-256 immutabile</span>
              </div>
            </div>
          </section>

          {/* ═══ SEZIONE 3 — IL CONTESTO REGOLATORIO ═══ */}
          <Section bg="#ffffff" id="contesto">
            <Label>Il Contesto Regolatorio</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Tre regolamenti europei.<br />
              <span className="text-[#0a0a0a]/25">Una sola esigenza.</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              Quando tre regolamenti indipendenti convergono sulla stessa necessità, non è una tendenza: è un mercato che si sta formando. La finestra per posizionarsi come standard-setter è adesso.
            </p>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[
                {
                  tag: "CSRD",
                  full: "Dir. UE 2022/2464",
                  title: "Sustainability Assurance",
                  body: "Assurance obbligatoria sui bilanci di sostenibilità, con passaggio da limited a reasonable assurance entro il 2028. Centinaia di data point qualitativi per emittente — emissioni, supply chain, diritti umani, governance.",
                  deadline: "In vigore — estensione al 2028",
                },
                {
                  tag: "AI Act",
                  full: "Reg. UE 2024/1689",
                  title: "Provenance & Transparency",
                  body: "Applicazione piena da agosto 2026. Obblighi di trasparenza e provenance documentation sui contenuti processati da AI. Le disclosure corporate devono essere tracciabili e attribuibili.",
                  deadline: "Agosto 2026 — applicazione piena",
                },
                {
                  tag: "DSA",
                  full: "Reg. UE 2022/2065",
                  title: "Information Quality",
                  body: "Due diligence sulla qualità informativa e sui rischi sistemici di disinformazione. Estende alle piattaforme e ai canali corporate obblighi di controllo documentato.",
                  deadline: "In vigore",
                },
              ].map((reg) => (
                <div key={reg.tag} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-white px-3 py-1"
                      style={{ background: "#dc2626" }}
                    >
                      {reg.tag}
                    </span>
                    <span className="text-[#0a0a0a]/35 text-xs">{reg.full}</span>
                  </div>
                  <h3 className="text-lg font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>{reg.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>{reg.body}</p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] inline-block" />
                    <span className="text-[12px] font-bold text-[#dc2626]">{reg.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 4 — USE CASE ═══ */}
          <Section bg="#f5f5f7" id="use-case">
            <Label>Use Case</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Tre applicazioni concrete<br />
              <span className="text-[#0a0a0a]/25">per l'enterprise.</span>
            </h2>
            <div className="mt-14 space-y-8">
              {/* Use Case 1 */}
              <div className="border border-[#0a0a0a]/8">
                <div className="px-8 py-5 flex items-center gap-4" style={{ background: "#0a0a0a" }}>
                  <span className="text-[#dc2626] text-3xl font-black">01</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">CSRD · Sustainability Assurance</p>
                    <h3 className="text-xl font-black text-white">Assurance sui Non-Financial Statement</h3>
                  </div>
                </div>
                <div className="p-8 grid md:grid-cols-2 gap-8" style={{ background: "#ffffff" }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">Il Problema</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                      Un bilancio di sostenibilità contiene centinaia di claim fattuali verificabili. Le procedure manuali — campionamento documentale, intervista ai responsabili, riscontro su documenti aziendali — non scalano. Il costo per claim verificata con metodo tradizionale è 5–50€. Il throughput è ~10 claim/giorno per FTE.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">La Soluzione ProofPress Verify</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55 mb-6" style={{ fontFamily: FONT }}>
                      Industrializza la fase di estrazione delle claim e corroborazione multi-fonte, riducendo il tempo di audit e liberando le risorse senior per il giudizio professionale. Il Verification Report JSON diventa working paper digitale, allegabile al fascicolo di revisione.
                    </p>
                    <div className="grid grid-cols-3 gap-4 border-t border-[#0a0a0a]/8 pt-6">
                      {[
                        { val: "~€0,003", label: "Costo per claim" },
                        { val: "2.800", label: "Claim/giorno" },
                        { val: "≤15s", label: "Latenza p95" },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <div className="text-xl font-black text-[#dc2626]">{s.val}</div>
                          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/35 mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Use Case 2 */}
              <div className="border border-[#0a0a0a]/8">
                <div className="px-8 py-5 flex items-center gap-4" style={{ background: "#0a0a0a" }}>
                  <span className="text-[#dc2626] text-3xl font-black">02</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Legal · IR · Compliance</p>
                    <h3 className="text-xl font-black text-white">Information Integrity sulle Disclosure Corporate</h3>
                  </div>
                </div>
                <div className="p-8 grid md:grid-cols-2 gap-8" style={{ background: "#ffffff" }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">Il Problema</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                      Comunicati price-sensitive, sezioni narrative del bilancio, dichiarazioni in conference call: ogni artifact informativo prodotto da una società quotata è oggi potenzialmente contestabile. La mancanza di una prova tamper-evident espone a rischi in caso di contestazioni regolamentari, class action su market abuse, contenzioso civile.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">La Soluzione ProofPress Verify</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>
                      Un hash SHA-256 generato al momento della pubblicazione costituisce prova difendibile che quel contenuto, a quel timestamp, non è stato modificato. Base documentale solida per procedimenti Consob, ESMA o class action.
                    </p>
                    <div className="space-y-2">
                      {[
                        "Prova tamper-evident su ogni documento",
                        "Timestamp certificato e immutabile",
                        "Audit trail allegabile a fascicoli legali",
                        "Integrazione API nei sistemi IR esistenti",
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-3 text-[14px] text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                          <span className="w-4 h-4 flex items-center justify-center text-white text-[10px] flex-shrink-0" style={{ background: "#dc2626" }}>✓</span>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Use Case 3 */}
              <div className="border border-[#0a0a0a]/8">
                <div className="px-8 py-5 flex items-center gap-4" style={{ background: "#0a0a0a" }}>
                  <span className="text-[#dc2626] text-3xl font-black">03</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">AI Act · DSA · Governance</p>
                    <h3 className="text-xl font-black text-white">Audit Trail Regolatorio AI Act / DSA</h3>
                  </div>
                </div>
                <div className="p-8 grid md:grid-cols-2 gap-8" style={{ background: "#ffffff" }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">Il Problema</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                      Dall'agosto 2026, le società dovranno dimostrare la governance sui contenuti AI-generated pubblicati. La mancanza di content provenance documentation, human oversight mechanism e methodology transparency espone a sanzioni e a rischi reputazionali significativi.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">La Soluzione ProofPress Verify</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>
                      ProofPress Verify fornisce nativamente content provenance documentation, human oversight mechanism via Author Portal, e methodology transparency pubblicata. Binding crittografico autore-contenuto via author key: distingue in modo verificabile contenuto human-authored da AI-generated.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["AI Act Art. 50", "DSA Art. 34", "CSRD ESRS E1", "Provenance Doc.", "Author Portal"].map((tag) => (
                        <span key={tag} className="border border-[#0a0a0a]/15 text-[12px] font-bold text-[#0a0a0a]/60 px-3 py-1" style={{ fontFamily: FONT }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 5 — LA TECNOLOGIA ═══ */}
          <Section bg="#ffffff" id="come-funziona">
            <Label>La Tecnologia</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Tre moduli tecnici.<br />
              <span className="text-[#0a0a0a]/25">Un protocollo proprietario.</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              ProofPress Verify è un protocollo proprietario AxiomiX LLC composto da tre componenti interoperabili, già in produzione e in conformità con gli standard regolatori europei.
            </p>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🔐",
                  step: "01",
                  title: "Cryptographic Certification Engine",
                  desc: "Hash SHA-256 generato al momento della pubblicazione su ogni content item. Prova tamper-evident che un dato contenuto, a un dato timestamp, diceva esattamente quello. Base difendibile in sede regolamentare o giudiziaria.",
                  specs: ["SHA-256 immutabile", "Timestamp certificato", "Tamper-evident proof"],
                },
                {
                  icon: "🤖",
                  step: "02",
                  title: "Agentic Verification Pipeline",
                  desc: "Estrazione automatica delle claim fattuali via LLM, stance detection e trust score pesato. Corroborazione su fonti indipendenti certificabili: fact-checker IFCN, wire agency, istituzioni, dataset pubblici.",
                  specs: ["4.000+ fonti certificate", "Trust score 0–100", "Verification Report JSON"],
                },
                {
                  icon: "✍️",
                  step: "03",
                  title: "Author Portal & Digital Signature",
                  desc: "Binding crittografico autore-contenuto via author key. Distingue contenuto human-authored da AI-generated. Applicabile a qualunque ruolo aziendale che produca disclosure ufficiali.",
                  specs: ["Human vs AI attribution", "Author key binding", "AI Act compliant"],
                },
              ].map((mod) => (
                <div key={mod.title} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626] mb-3">Modulo {mod.step}</div>
                  <div className="text-3xl mb-4">{mod.icon}</div>
                  <h3 className="text-base font-black text-[#0a0a0a] mb-3 leading-snug" style={{ fontFamily: FONT }}>{mod.title}</h3>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55 mb-5" style={{ fontFamily: FONT }}>{mod.desc}</p>
                  <div className="space-y-1">
                    {mod.specs.map((s) => (
                      <div key={s} className="flex items-center gap-2 text-[13px] text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                        <span className="text-[#dc2626] font-black">—</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Parametri operativi */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
              {[
                { val: "≤15s", lab: "Latenza pipeline p95" },
                { val: "~€0,003", lab: "Costo per claim verificata" },
                { val: "99.5%", lab: "SLA Uptime" },
                { val: "Q3 2026", lab: "Blockchain Anchoring v1.1" },
              ].map((p, i) => (
                <div key={p.lab} className="py-8 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.1)" : "none" }}>
                  <div className="text-3xl md:text-4xl font-black text-[#0a0a0a]">{p.val}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35">{p.lab}</div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 6 — BUSINESS CASE ═══ */}
          <Section bg="#f5f5f7" id="business-case">
            <Label>Business Case</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Il delta tra costo manuale<br />
              <span className="text-[#dc2626]">e costo industrializzato.</span>
            </h2>
            <p className="mt-4 text-lg text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              Confronto illustrativo su un perimetro di assurance non-financial per una società quotata.
            </p>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-left text-[14px]" style={{ fontFamily: FONT }}>
                <thead>
                  <tr className="border-b-2 border-[#0a0a0a]">
                    <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Dimensione</th>
                    <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Procedura Manuale</th>
                    <th className="py-3 font-bold text-[#dc2626]">Con ProofPress Verify</th>
                  </tr>
                </thead>
                <tbody className="text-[#0a0a0a]/70">
                  {[
                    ["Costo per claim verificata", "5 – 50 €", "~0,003 €"],
                    ["Throughput verifica", "~10 claim/giorno/FTE", "~2.800 claim/giorno"],
                    ["Auditabilità output", "Working paper cartaceo / PDF", "JSON strutturato, hash-referenziato"],
                    ["Conformità AI Act / DSA", "Da dimostrare ex-post", "Nativa"],
                    ["Scalabilità", "Lineare al costo del personale", "Software-like — N × 1"],
                  ].map(([dim, manual, verify], i) => (
                    <tr key={dim} className="border-b border-[#0a0a0a]/8">
                      <td className="py-3 pr-4 font-semibold text-[#0a0a0a]">{dim}</td>
                      <td className="py-3 pr-4 text-[#0a0a0a]/50">{manual}</td>
                      <td className="py-3 font-bold text-[#dc2626]">{verify}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Posizionamento competitivo */}
            <div className="mt-12 p-8 border border-[#0a0a0a]/8" style={{ background: "#ffffff" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-4">Posizionamento Competitivo</p>
              <p className="text-[15px] leading-relaxed text-[#0a0a0a]/60 mb-4" style={{ fontFamily: FONT }}>
                <strong className="text-[#0a0a0a]">Nessun operatore oggi combina</strong> hashing immutabile, corroborazione automatica multi-fonte, audit trail regolatorio e API pubbliche in un'unica infrastruttura. NewsGuard copre la credibility a livello di dominio. ClaimBuster estrae claim ma non corrobora strutturalmente. Il manual fact-check non scala.
              </p>
              <p className="text-[15px] leading-relaxed text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
                La finestra per posizionarsi come standard-setter è adesso: AI Act in applicazione piena agosto 2026, CSRD in estensione progressiva fino al 2028. Il precedente è identico a quello del 2020–2022, quando la sustainability assurance è passata da servizio opzionale a practice strutturata.
              </p>
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 7 — PER CHI È ═══ */}
          <Section bg="#ffffff" id="per-chi">
            <Label>Per Chi È</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Quattro ruoli.<br />
              <span className="text-[#0a0a0a]/25">Un'unica esigenza di certezza.</span>
            </h2>
            <div className="mt-14 grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: "📊",
                  role: "CFO / Finance Director",
                  context: "Bilancio di sostenibilità, CSRD, assurance non-financial",
                  need: "Ridurre il costo e il tempo dell'assurance sui non-financial statement mantenendo la qualità del working paper.",
                  value: "Industrializza la fase di estrazione e corroborazione claim. Il Verification Report JSON diventa working paper digitale allegabile al fascicolo di revisione.",
                },
                {
                  icon: "⚖️",
                  role: "Chief Legal Officer / General Counsel",
                  context: "Disclosure corporate, comunicati price-sensitive, contenzioso",
                  need: "Prova tamper-evident che un documento, a un dato timestamp, conteneva esattamente quel testo.",
                  value: "Hash SHA-256 immutabile su ogni documento. Base difendibile per procedimenti Consob, ESMA, class action su market abuse.",
                },
                {
                  icon: "🛡️",
                  role: "Chief Compliance Officer",
                  context: "AI Act, DSA, governance dei contenuti AI-generated",
                  need: "Dimostrare la governance sui contenuti AI-generated pubblicati dall'organizzazione.",
                  value: "Content provenance documentation nativa, human oversight mechanism via Author Portal, methodology transparency pubblicata.",
                },
                {
                  icon: "🔍",
                  role: "Audit Partner / Senior Manager",
                  context: "Revisione contabile, assurance engagement, ESG audit",
                  need: "Strumenti che scalino il throughput di verifica senza compromettere la qualità del giudizio professionale.",
                  value: "2.800 claim/giorno a ~€0,003 ciascuna. Il revisore si concentra sul giudizio; la pipeline gestisce l'estrazione e la corroborazione.",
                },
              ].map((p, i) => (
                <div key={i} className="p-8 border border-[#0a0a0a]/8 hover:border-[#0a0a0a]/20 transition-colors">
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="text-lg font-black text-[#0a0a0a] mb-1" style={{ fontFamily: FONT }}>{p.role}</h3>
                  <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#dc2626] mb-4">{p.context}</p>
                  <p className="text-[13px] font-bold text-[#0a0a0a]/50 mb-2" style={{ fontFamily: FONT }}>Il bisogno:</p>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>{p.need}</p>
                  <p className="text-[13px] font-bold text-[#0a0a0a]/50 mb-2" style={{ fontFamily: FONT }}>Il valore:</p>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>{p.value}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 8 — GIÀ IN PRODUZIONE ═══ */}
          <Section bg="#f5f5f7" id="in-produzione">
            <Label>Già in Produzione</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Non è un prototipo.<br />
              <span className="text-[#0a0a0a]/25">È quello che usiamo noi ogni giorno.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              ProofPress Verify è la tecnologia che certifica ogni articolo pubblicato su ProofPress Magazine — oltre 40 notizie al giorno, 4 canali tematici, 6.900+ lettori. Il sistema è in produzione continua, non in beta.
            </p>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
              {[
                { val: "v4.0", lab: "Versione in produzione" },
                { val: "4.000+", lab: "Fonti certificate" },
                { val: "99.5%", lab: "SLA uptime" },
                { val: "Q3 2026", lab: "Blockchain Anchoring" },
              ].map((s, i) => (
                <div key={i} className="py-8 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.1)" : "none" }}>
                  <div className="text-3xl md:text-4xl font-black text-[#0a0a0a]">{s.val}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35">{s.lab}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="https://proofpress.ai/proofpress-verify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold uppercase tracking-[0.15em] text-[#dc2626] hover:underline"
                style={{ fontFamily: FONT }}
              >
                Guarda la versione per il giornalismo → proofpress.ai/proofpress-verify
              </a>
            </div>
          </Section>

          {/* ═══ SEZIONE CONTATTI ═══ */}
          <Section bg="#ffffff" id="contatto">
            <div className="text-center mb-10">
              <Label accent>Contattaci</Label>
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                Richiedi un Briefing Esecutivo.
              </h2>
              <p className="mt-3 text-base text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
                Il team ProofPress risponde entro 24 ore lavorative. Nessun impegno — solo una conversazione strutturata sul tuo contesto specifico.
              </p>
            </div>
            <ContactForm origine="ProofPress Verify Business — /verify-business" />
          </Section>

          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
