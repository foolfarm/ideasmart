/**
 * ProofPress Verify Business
 * Landing page enterprise B2B — Information Integrity Assurance
 * Target: CFO, Legal, Compliance, Audit & Assurance Leadership
 * Posizionamento: infrastruttura tecnologica per assurance non-financial (CSRD, AI Act, DSA)
 */
import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ── Design tokens (dark enterprise palette) ──────────────────────────────────
const ACCENT = "#d94f3d";

export default function VerifyBusiness() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "",
    email: "",
    phone: "",
    useCase: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Richiesta inviata — ti contatteremo entro 24 ore lavorative.");
    },
    onError: () => {
      window.location.href = `mailto:andrea.cinelli@foolfarm.com?subject=ProofPress Verify Business — ${form.company}&body=Nome: ${form.name}%0AEmail: ${form.email}%0AAzienda: ${form.company}%0ARuolo: ${form.role}%0AUse Case: ${form.useCase}%0ANote: ${form.message}`;
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      toast.error("Compila i campi obbligatori: Nome, Email e Azienda.");
      return;
    }
    submitLead.mutate({
      nome: form.name,
      email: form.email,
      azienda: form.company,
      ruolo: form.role || undefined,
      messaggio: form.useCase
        ? `Area di interesse: ${form.useCase}\n\n${form.message}`
        : form.message || "Richiesta di briefing esecutivo ProofPress Verify Business",
      origine: "ProofPress Verify Business",
    });
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a14] text-white pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block bg-[#d94f3d] text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              ProofPress Verify Business
            </span>
            <span className="text-[#6e6e73] text-xs tracking-widest uppercase">AxiomiX LLC · FoolFarm</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            Information Integrity<br />
            <span className="text-[#d94f3d]">Assurance.</span>
          </h1>
          <p className="text-xl text-[#a1a1a6] max-w-2xl leading-relaxed mb-4">
            La prossima frontiera dell'assurance non-financial. CSRD, AI Act e DSA convergono nel trasformare
            il reporting qualitativo in un'obbligazione di certificazione paragonabile a quella del bilancio.
          </p>
          <p className="text-base text-[#6e6e73] max-w-2xl leading-relaxed mb-10">
            ProofPress Verify è l'infrastruttura tecnologica che industrializza quella certificazione — con hash
            crittografici immutabili, corroborazione multi-fonte AI e audit trail regolatorio nativo.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#contatto"
              className="inline-block bg-[#d94f3d] hover:bg-[#b83c2c] text-white font-bold px-8 py-4 rounded-full text-sm tracking-wide transition-colors"
            >
              Richiedi un Briefing Esecutivo →
            </a>
            <a
              href="#come-funziona"
              className="inline-block border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-full text-sm tracking-wide transition-colors"
            >
              Come Funziona
            </a>
          </div>
        </div>
      </section>

      {/* ── REGULATORY CONTEXT ───────────────────────────────────────────── */}
      <section className="bg-[#f5f5f7] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-3">Il Contesto Regolatorio</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#1d1d1f] mb-4">
              Tre regolamenti europei.<br />Una sola esigenza.
            </h2>
            <p className="text-[#6e6e73] text-lg max-w-2xl">
              Quando tre regolamenti indipendenti convergono sulla stessa necessità, non è una tendenza: è un mercato che si sta formando.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
              <div key={reg.tag} className="bg-white rounded-2xl p-7 border border-[#e5e5e5]">
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-[#d94f3d] text-white text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full">
                    {reg.tag}
                  </span>
                  <span className="text-[#86868b] text-xs">{reg.full}</span>
                </div>
                <h3 className="text-lg font-black text-[#1d1d1f] mb-3">{reg.title}</h3>
                <p className="text-[#6e6e73] text-sm leading-relaxed mb-4">{reg.body}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d94f3d] inline-block"></span>
                  <span className="text-xs font-semibold text-[#d94f3d]">{reg.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-3">Use Case</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#1d1d1f] mb-4">
              Tre applicazioni concrete<br />per l'enterprise.
            </h2>
          </div>

          <div className="space-y-8">
            {/* Use Case 1 */}
            <div className="border border-[#e5e5e5] rounded-2xl overflow-hidden">
              <div className="bg-[#0a0a14] px-8 py-5 flex items-center gap-4">
                <span className="text-[#d94f3d] text-3xl font-black">01</span>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#6e6e73] mb-1">CSRD · Sustainability Assurance</p>
                  <h3 className="text-xl font-black text-white">Assurance sui Non-Financial Statement</h3>
                </div>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-3">Il Problema</p>
                  <p className="text-[#3d3d3d] leading-relaxed">
                    Un bilancio di sostenibilità contiene centinaia di claim fattuali verificabili. Le procedure manuali — campionamento documentale, intervista ai responsabili, riscontro su documenti aziendali — non scalano. Il costo per claim verificata con metodo tradizionale è 5–50€. Il throughput è ~10 claim/giorno per FTE.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-3">La Soluzione ProofPress Verify</p>
                  <p className="text-[#3d3d3d] leading-relaxed mb-4">
                    Industrializza la fase di estrazione delle claim e corroborazione multi-fonte, riducendo il tempo di audit e liberando le risorse senior per il giudizio professionale. Il Verification Report JSON diventa working paper digitale, allegabile al fascicolo di revisione.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "~€0,003", label: "Costo per claim" },
                      { val: "2.800", label: "Claim/giorno" },
                      { val: "≤15s", label: "Latenza p95" },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#f5f5f7] rounded-xl p-3 text-center">
                        <div className="text-lg font-black text-[#d94f3d]">{s.val}</div>
                        <div className="text-xs text-[#86868b] mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Use Case 2 */}
            <div className="border border-[#e5e5e5] rounded-2xl overflow-hidden">
              <div className="bg-[#1a0a0a] px-8 py-5 flex items-center gap-4">
                <span className="text-[#d94f3d] text-3xl font-black">02</span>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#6e6e73] mb-1">Legal · IR · Compliance</p>
                  <h3 className="text-xl font-black text-white">Information Integrity sulle Disclosure Corporate</h3>
                </div>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-3">Il Problema</p>
                  <p className="text-[#3d3d3d] leading-relaxed">
                    Comunicati price-sensitive, sezioni narrative del bilancio, dichiarazioni in conference call: ogni artifact informativo prodotto da una società quotata è oggi potenzialmente contestabile. La mancanza di una prova tamper-evident espone a rischi in caso di contestazioni regolamentari, class action su market abuse, contenzioso civile.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-3">La Soluzione ProofPress Verify</p>
                  <p className="text-[#3d3d3d] leading-relaxed mb-4">
                    Un hash SHA-256 generato al momento della pubblicazione costituisce prova difendibile che quel contenuto, a quel timestamp, non è stato modificato. Base documentale solida per procedimenti Consob, ESMA o class action. Integrazione diretta nei workflow di IR e Legal.
                  </p>
                  <div className="space-y-2">
                    {["Prova tamper-evident su ogni documento", "Timestamp certificato e immutabile", "Audit trail allegabile a fascicoli legali", "Integrazione API nei sistemi IR esistenti"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#3d3d3d]">
                        <span className="w-4 h-4 rounded-full bg-[#d94f3d] flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Use Case 3 */}
            <div className="border border-[#e5e5e5] rounded-2xl overflow-hidden">
              <div className="bg-[#0a0a14] px-8 py-5 flex items-center gap-4">
                <span className="text-[#d94f3d] text-3xl font-black">03</span>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#6e6e73] mb-1">AI Act · DSA · Governance</p>
                  <h3 className="text-xl font-black text-white">Audit Trail Regolatorio AI Act / DSA</h3>
                </div>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-3">Il Problema</p>
                  <p className="text-[#3d3d3d] leading-relaxed">
                    Dall'agosto 2026, le società dovranno dimostrare la governance sui contenuti AI-generated pubblicati. La mancanza di content provenance documentation, human oversight mechanism e methodology transparency espone a sanzioni e a rischi reputazionali significativi.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-3">La Soluzione ProofPress Verify</p>
                  <p className="text-[#3d3d3d] leading-relaxed mb-4">
                    ProofPress Verify fornisce nativamente content provenance documentation, human oversight mechanism via Author Portal, e methodology transparency pubblicata. Binding crittografico autore-contenuto via author key: distingue in modo verificabile contenuto human-authored da contenuto AI-generated.
                  </p>
                  <div className="bg-[#f5f5f7] rounded-xl p-4">
                    <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Conformità Nativa</p>
                    <div className="flex flex-wrap gap-2">
                      {["AI Act Art. 50", "DSA Art. 34", "CSRD ESRS E1", "Provenance Doc.", "Author Portal"].map((tag) => (
                        <span key={tag} className="bg-white border border-[#e5e5e5] text-xs font-semibold text-[#3d3d3d] px-3 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="come-funziona" className="bg-[#f5f5f7] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-3">La Tecnologia</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#1d1d1f] mb-4">
              Tre moduli tecnici.<br />Un protocollo proprietario.
            </h2>
            <p className="text-[#6e6e73] text-lg max-w-2xl">
              ProofPress Verify è un protocollo proprietario AxiomiX LLC composto da tre componenti interoperabili, già in produzione e in conformità con gli standard regolatori europei.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: "🔐",
                title: "Cryptographic Certification Engine",
                desc: "Hash SHA-256 generato al momento della pubblicazione su ogni content item. Prova tamper-evident che un dato contenuto, a un dato timestamp, diceva esattamente quello. Base difendibile in sede regolamentare o giudiziaria.",
                specs: ["SHA-256 immutabile", "Timestamp certificato", "Tamper-evident proof"],
              },
              {
                icon: "🤖",
                title: "Agentic Verification Pipeline",
                desc: "Estrazione automatica delle claim fattuali via LLM, stance detection e trust score pesato. Corroborazione su fonti indipendenti certificabili: fact-checker IFCN, wire agency, istituzioni, dataset pubblici (Eurostat, ISTAT, OECD).",
                specs: ["4.000+ fonti certificate", "Trust score 0–100", "Verification Report JSON"],
              },
              {
                icon: "✍️",
                title: "Author Portal & Digital Signature",
                desc: "Binding crittografico autore-contenuto via author key. Distingue contenuto human-authored da AI-generated. Applicabile a qualunque ruolo aziendale che produca disclosure ufficiali: CFO, IR, ESG manager, DPO, Legal.",
                specs: ["Human vs AI attribution", "Author key binding", "AI Act compliant"],
              },
            ].map((mod) => (
              <div key={mod.title} className="bg-white rounded-2xl p-7 border border-[#e5e5e5]">
                <div className="text-3xl mb-4">{mod.icon}</div>
                <h3 className="text-base font-black text-[#1d1d1f] mb-3 leading-snug">{mod.title}</h3>
                <p className="text-[#6e6e73] text-sm leading-relaxed mb-5">{mod.desc}</p>
                <div className="space-y-1">
                  {mod.specs.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-[#3d3d3d]">
                      <span className="text-[#d94f3d] font-black">—</span> {s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Parametri operativi */}
          <div className="bg-[#0a0a14] rounded-2xl p-8 text-white">
            <p className="text-xs font-bold tracking-widest uppercase text-[#6e6e73] mb-6">Parametri Operativi — v4.0 in Produzione</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { val: "≤15s", label: "Latenza pipeline p95" },
                { val: "~€0,003", label: "Costo per claim verificata" },
                { val: "99.5%", label: "SLA Uptime" },
                { val: "Q3 2026", label: "Blockchain Anchoring (v1.1)" },
              ].map((p) => (
                <div key={p.label}>
                  <div className="text-2xl font-black text-[#d94f3d] mb-1">{p.val}</div>
                  <div className="text-xs text-[#86868b]">{p.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BUSINESS CASE ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-3">Business Case</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#1d1d1f] mb-4">
              Il delta tra costo manuale<br />e costo industrializzato.
            </h2>
            <p className="text-[#6e6e73] text-lg max-w-2xl">
              Confronto illustrativo su un perimetro di assurance non-financial per una società quotata.
            </p>
          </div>

          <div className="overflow-x-auto mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0a0a14] text-white">
                  <th className="text-left px-6 py-4 text-sm font-bold tracking-wide rounded-tl-xl">Dimensione</th>
                  <th className="text-left px-6 py-4 text-sm font-bold tracking-wide">Procedura Manuale</th>
                  <th className="text-left px-6 py-4 text-sm font-bold tracking-wide text-[#d94f3d] rounded-tr-xl">Con ProofPress Verify</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Costo per claim verificata", "5 – 50 €", "~0,003 €"],
                  ["Throughput verifica", "~10 claim/giorno/FTE", "~2.800 claim/giorno"],
                  ["Auditabilità output", "Working paper cartaceo / PDF", "JSON strutturato, hash-referenziato"],
                  ["Conformità AI Act / DSA", "Da dimostrare ex-post", "Nativa"],
                  ["Scalabilità", "Lineare al costo del personale", "Software-like — N × 1"],
                ].map(([dim, manual, verify], i) => (
                  <tr key={dim} className={i % 2 === 0 ? "bg-[#f5f5f7]" : "bg-white"}>
                    <td className="px-6 py-4 text-sm font-semibold text-[#1d1d1f]">{dim}</td>
                    <td className="px-6 py-4 text-sm text-[#6e6e73]">{manual}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#d94f3d]">{verify}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Competitive positioning */}
          <div className="bg-[#f5f5f7] rounded-2xl p-8">
            <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-4">Posizionamento Competitivo</p>
            <p className="text-[#3d3d3d] leading-relaxed mb-4">
              <strong>Nessun operatore oggi combina</strong> hashing immutabile, corroborazione automatica multi-fonte, audit trail regolatorio e API pubbliche in un'unica infrastruttura. NewsGuard copre la credibility a livello di dominio. ClaimBuster estrae claim ma non corrobora strutturalmente. Il manual fact-check non scala.
            </p>
            <p className="text-[#3d3d3d] leading-relaxed">
              La finestra per posizionarsi come standard-setter è adesso: AI Act in applicazione piena agosto 2026, CSRD in estensione progressiva fino al 2028. Il precedente è identico a quello del 2020–2022, quando la sustainability assurance è passata da servizio opzionale a practice strutturata.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FORM ─────────────────────────────────────────────────────── */}
      <section id="contatto" className="bg-[#0a0a14] py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-3">Contatto</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Richiedi un Briefing Esecutivo
            </h2>
            <p className="text-[#a1a1a6] text-lg max-w-xl mx-auto">
              Il team ProofPress risponde entro 24 ore lavorative. Nessun impegno — solo una conversazione strutturata sul tuo contesto specifico.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#1a1a2e] border border-[#d94f3d]/30 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-black text-white mb-2">Richiesta ricevuta</h3>
              <p className="text-[#a1a1a6]">Ti contatteremo entro 24 ore lavorative per concordare un briefing.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#111122] rounded-2xl p-8 space-y-5 border border-white/10">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Nome e Cognome *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d94f3d] transition-colors placeholder-[#6e6e73]"
                    placeholder="Andrea Rossi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Azienda *</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d94f3d] transition-colors placeholder-[#6e6e73]"
                    placeholder="Società S.p.A."
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Ruolo</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d94f3d] transition-colors"
                  >
                    <option value="">Seleziona il tuo ruolo</option>
                    <option>CEO / Managing Director</option>
                    <option>CFO / Finance Director</option>
                    <option>Chief Legal Officer / General Counsel</option>
                    <option>Chief Compliance Officer</option>
                    <option>ESG / Sustainability Director</option>
                    <option>Head of Investor Relations</option>
                    <option>Chief Communication Officer</option>
                    <option>CTO / Head of Technology</option>
                    <option>Audit Partner / Senior Manager</option>
                    <option>Altro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d94f3d] transition-colors placeholder-[#6e6e73]"
                    placeholder="nome@azienda.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Area di Interesse</label>
                <select
                  value={form.useCase}
                  onChange={(e) => setForm({ ...form, useCase: e.target.value })}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d94f3d] transition-colors"
                >
                  <option value="">Seleziona il tuo caso d'uso</option>
                  <option>Assurance CSRD / Non-Financial Statement</option>
                  <option>Certificazione Disclosure Corporate (IR / Legal)</option>
                  <option>Compliance AI Act / DSA</option>
                  <option>Audit Trail Regolatorio</option>
                  <option>Integrazione in piattaforma esistente (API)</option>
                  <option>Partnership / White-label</option>
                  <option>Altro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Note aggiuntive</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d94f3d] transition-colors placeholder-[#6e6e73] resize-none"
                  placeholder="Descrivi brevemente il contesto e le tue esigenze specifiche..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#d94f3d] hover:bg-[#b83c2c] text-white font-black py-4 rounded-full text-sm tracking-wide transition-colors"
              >
                Invia Richiesta di Briefing →
              </button>
              <p className="text-center text-xs text-[#6e6e73]">
                Oppure scrivi direttamente a{" "}
                <a href="mailto:andrea.cinelli@foolfarm.com" className="text-[#d94f3d] hover:underline">
                  andrea.cinelli@foolfarm.com
                </a>
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER STRIP ─────────────────────────────────────────────────── */}
      <div className="bg-[#050508] py-6 px-4 text-center">
        <p className="text-xs text-[#6e6e73]">
          ProofPress Verify è una tecnologia del portafoglio{" "}
          <a href="https://foolfarm.com" className="text-[#d94f3d] hover:underline" target="_blank" rel="noopener noreferrer">FoolFarm</a>
          , operata da AxiomiX LLC. ·{" "}
          <Link href="/proofpress-verify" className="text-[#6e6e73] hover:text-white transition-colors">
            Versione Giornalismo →
          </Link>
        </p>
      </div>
    </div>
  );
}
