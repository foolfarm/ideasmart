/*
 * ProofPress Verify Email — Landing Enterprise B2B
 * Certificazione crittografica delle comunicazioni email aziendali
 * Palette: bianco (#ffffff), nero (#0a0a0a), crema (#f5f5f7), accento rosso (#dc2626)
 * Struttura: LeftSidebar + SharedPageHeader + BreakingNewsTicker + SharedPageFooter
 * Template identico a /verify-business
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
export default function VerifyEmail() {
  const scrollToHowItWorks = () =>
    document.getElementById("come-funziona")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <SEOHead
        title="ProofPress Verify Email — Certificazione Crittografica delle Email Aziendali"
        description="Hash SHA-256 immutabile su ogni email. Prova tamper-evident per contenzioso legale, compliance GDPR e AI Act, difesa da BEC e phishing interno. Per CISO, Legal, Compliance e CFO."
        canonical="https://proofpress.ai/verify-email"
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
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              <div className="flex-1 min-w-0">
                <Label accent>Per Aziende ed Istituzioni</Label>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a]">
                  Email Integrity<br />
                  <span className="text-[#0a0a0a]/25">Certification.</span>
                </h1>
                <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed text-[#0a0a0a]/60 max-w-2xl">
                  Ogni email aziendale è un documento legale potenziale. BEC, phishing interno, repudiation e compliance AI Act convergono nel rendere la certificazione del contenuto email un'esigenza strutturale.
                </p>
                <p className="mt-3 text-lg leading-relaxed text-[#0a0a0a]/45 max-w-2xl" style={{ fontFamily: FONT }}>
                  ProofPress Verify Email applica la stessa tecnologia crittografica che certifica le notizie — hash SHA-256 immutabile, anomaly detection AI e audit trail regolatorio nativo — alle comunicazioni email della tua organizzazione.
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
                  API-first · Integrazione Microsoft 365 &amp; Google Workspace · Conformità nativa AI Act / GDPR
                </p>
              </div>{/* end flex-1 */}

            </div>{/* end flex container */}
            </div>{/* end max-w-5xl */}
          </section>

          {/* ═══ SEZIONE VIDEO ═══ */}
          <section className="py-16 md:py-20" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-8 text-center">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-white/40"
                  style={{ fontFamily: FONT }}
                >
                  ProofPress Email Verify · In 90 Secondi
                </span>
                <h2 className="mt-3 text-2xl md:text-3xl font-black text-white" style={{ fontFamily: FONT }}>
                  L’Email nell’Era AI.
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
                  <source src="/manus-storage/Certificazione_Email__La_Prova_Incontestabile_837ac8f5.mp4" type="video/mp4" />
                  Il tuo browser non supporta la riproduzione video.
                </video>
              </div>
              <p className="mt-4 text-center text-[13px] text-white/35" style={{ fontFamily: FONT }}>
                ProofPress Verify Email — Certificazione crittografica del contenuto email nell’era dell’AI
              </p>
            </div>
          </section>

          {/* ═══ SEZIONE 2 — IL NUMERO CHE CONTA ═══ */}
          <section className="py-20 md:py-24" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
              <div className="text-7xl md:text-9xl font-black text-white tracking-tight">$50B</div>
              <p className="mt-4 text-xl md:text-2xl font-medium text-white/70">
                persi ogni anno per Business Email Compromise nel mondo.
              </p>
              <p className="mt-2 text-lg text-white/50">
                Il 95% degli attacchi BEC sfrutta l'impossibilità di verificare l'integrità del contenuto email.
              </p>
              <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                <span>Hash SHA-256 immutabile</span>
                <span>·</span>
                <span>Anomaly detection AI</span>
                <span>·</span>
                <span>99.5% SLA uptime</span>
                <span>·</span>
                <span>Audit trail legale nativo</span>
              </div>
            </div>
          </section>

          {/* ═══ SEZIONE 3 — IL CONTESTO REGOLATORIO ═══ */}
          <Section bg="#ffffff" id="contesto">
            <Label>Il Contesto Regolatorio</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Tre forze convergenti.<br />
              <span className="text-[#0a0a0a]/25">Una sola risposta.</span>
            </h2>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              Regolazione, minacce cyber e contenzioso legale si muovono nella stessa direzione: le email aziendali devono essere certificabili, tracciabili e difendibili. La finestra per adeguarsi in modo proattivo è adesso.
            </p>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[
                {
                  tag: "AI Act",
                  full: "Reg. UE 2024/1689",
                  title: "Content Provenance",
                  body: "Applicazione piena agosto 2026. Le comunicazioni aziendali che incorporano output AI devono essere tracciabili e attribuibili. Ogni email che cita analisi, report o contenuti generati da AI richiede content provenance documentation.",
                  deadline: "Agosto 2026 — applicazione piena",
                },
                {
                  tag: "GDPR",
                  full: "Reg. UE 2016/679",
                  title: "Accountability & Audit Trail",
                  body: "Art. 5(2) richiede che il titolare dimostri la conformità. Le email contenenti dati personali o decisioni automatizzate devono essere documentate con audit trail verificabile. La certificazione del contenuto è prova di accountability.",
                  deadline: "In vigore — enforcement crescente",
                },
                {
                  tag: "NIS2",
                  full: "Dir. UE 2022/2555",
                  title: "Email Security & Integrity",
                  body: "Obbligo di misure tecniche per garantire l'integrità delle comunicazioni nei settori critici. La certificazione crittografica del contenuto email è una misura di sicurezza difendibile in sede di audit NIS2.",
                  deadline: "Recepita — audit in corso",
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
              Tre scenari critici<br />
              <span className="text-[#0a0a0a]/25">dove la certificazione decide.</span>
            </h2>
            <div className="mt-14 space-y-8">
              {/* Use Case 1 */}
              <div className="border border-[#0a0a0a]/8">
                <div className="px-8 py-5 flex items-center gap-4" style={{ background: "#0a0a0a" }}>
                  <span className="text-[#dc2626] text-3xl font-black">01</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Legal · M&amp;A · Board Communication</p>
                    <h3 className="text-xl font-black text-white">Prova Tamper-Evident per Contenzioso</h3>
                  </div>
                </div>
                <div className="p-8 grid md:grid-cols-2 gap-8" style={{ background: "#ffffff" }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">Il Problema</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                      In un contenzioso M&A, un procedimento Consob o una class action, la domanda è sempre la stessa: "Quella email diceva davvero così?" Senza certificazione crittografica, la risposta è una parola contro l'altra. Il costo medio di un contenzioso email-based supera i 500.000€ in discovery e perizie forensi.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">La Soluzione ProofPress Verify Email</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>
                      Hash SHA-256 generato al momento dell'invio su header + body + allegati. Il Verification Certificate è prova difendibile che quella email, a quel timestamp, conteneva esattamente quel contenuto. Allegabile direttamente al fascicolo legale.
                    </p>
                    <div className="space-y-2">
                      {[
                        "Prova tamper-evident su header + body + allegati",
                        "Timestamp certificato e immutabile",
                        "Verification Certificate allegabile a fascicoli legali",
                        "Compatibile con standard di discovery internazionale",
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

              {/* Use Case 2 */}
              <div className="border border-[#0a0a0a]/8">
                <div className="px-8 py-5 flex items-center gap-4" style={{ background: "#0a0a0a" }}>
                  <span className="text-[#dc2626] text-3xl font-black">02</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">CISO · Security · IT</p>
                    <h3 className="text-xl font-black text-white">Difesa da BEC e Phishing Interno</h3>
                  </div>
                </div>
                <div className="p-8 grid md:grid-cols-2 gap-8" style={{ background: "#ffffff" }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">Il Problema</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                      Il Business Email Compromise sfrutta l'impossibilità di distinguere un'email autentica da una contraffatta. I sistemi attuali (SPF, DKIM, DMARC) proteggono il trasporto ma non certificano l'integrità semantica del contenuto. Un attaccante può inviare un'email tecnicamente "valida" con contenuto manipolato.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">La Soluzione ProofPress Verify Email</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>
                      L'Anomaly Detection AI analizza ogni email in arrivo rispetto al profilo storico del mittente: tono, lessico, pattern di richiesta, destinatari abituali. Deviazioni significative generano alert in tempo reale prima che l'azione venga eseguita.
                    </p>
                    <div className="grid grid-cols-3 gap-4 border-t border-[#0a0a0a]/8 pt-6">
                      {[
                        { val: "&lt;2s", label: "Analisi real-time" },
                        { val: "98%", label: "Detection rate BEC" },
                        { val: "0.1%", label: "False positive rate" },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <div className="text-xl font-black text-[#dc2626]" dangerouslySetInnerHTML={{ __html: s.val }} />
                          <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0a0a0a]/35 mt-1">{s.label}</div>
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
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Compliance · AI Act · GDPR</p>
                    <h3 className="text-xl font-black text-white">Audit Trail per AI Act e GDPR</h3>
                  </div>
                </div>
                <div className="p-8 grid md:grid-cols-2 gap-8" style={{ background: "#ffffff" }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">Il Problema</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                      Dall'agosto 2026, le email che incorporano output AI devono essere tracciabili e attribuibili. Parallelamente, il GDPR richiede audit trail verificabile su ogni comunicazione che tratti dati personali o decisioni automatizzate. La mancanza di documentazione espone a sanzioni fino al 4% del fatturato globale.
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-3">La Soluzione ProofPress Verify Email</p>
                    <p className="text-[15px] leading-relaxed text-[#0a0a0a]/55 mb-4" style={{ fontFamily: FONT }}>
                      Ogni email certificata genera un Verification Certificate con: mittente verificato, timestamp immutabile, hash del contenuto, flag AI-generated/human-authored, e metadata di conformità. Pronto per audit GDPR, AI Act e NIS2 senza lavoro manuale aggiuntivo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["AI Act Art. 50", "GDPR Art. 5(2)", "NIS2 Art. 21", "Content Provenance", "Human vs AI Flag"].map((tag) => (
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
              ProofPress Verify Email estende il protocollo ProofPress Verify alle comunicazioni email aziendali — tre componenti interoperabili, integrabili via API in Microsoft 365, Google Workspace e qualsiasi mail server aziendale.
            </p>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🔐",
                  step: "01",
                  title: "Email Certification Engine",
                  desc: "Hash SHA-256 generato al momento dell'invio su header + body + allegati. Il Verification Certificate è prova tamper-evident che quella email, a quel timestamp, conteneva esattamente quel contenuto. Immutabile, non contestabile.",
                  specs: ["SHA-256 su header + body + allegati", "Timestamp certificato", "Verification Certificate JSON"],
                },
                {
                  icon: "🤖",
                  step: "02",
                  title: "Anomaly Detection AI",
                  desc: "Analisi comportamentale del mittente in tempo reale: tono, lessico, pattern di richiesta, destinatari abituali. Deviazioni significative generano alert prima che l'azione venga eseguita. Difesa proattiva da BEC e phishing interno.",
                  specs: ["Profilo comportamentale mittente", "Alert real-time &lt;2s", "98% detection rate BEC"],
                },
                {
                  icon: "✍️",
                  step: "03",
                  title: "Compliance Audit Trail",
                  desc: "Ogni email certificata genera metadata strutturati: mittente verificato, flag AI-generated/human-authored, riferimenti normativi applicabili. Dashboard di compliance pronto per audit GDPR, AI Act e NIS2 senza lavoro manuale.",
                  specs: ["Human vs AI attribution", "GDPR / AI Act / NIS2 ready", "Export per discovery legale"],
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
                        <span className="text-[#dc2626] font-black">—</span> <span dangerouslySetInnerHTML={{ __html: s }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Parametri operativi */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b border-[#0a0a0a]/10">
              {[
                { val: "&lt;2s", lab: "Latenza certificazione" },
                { val: "100K+", lab: "Email/giorno per tenant" },
                { val: "99.9%", lab: "SLA uptime" },
                { val: "API-first", lab: "Integrazione nativa" },
              ].map((s, i) => (
                <div key={i} className="py-8 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(10,10,10,0.1)" : "none" }}>
                  <div className="text-2xl md:text-3xl font-black text-[#dc2626]" dangerouslySetInnerHTML={{ __html: s.val }} />
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/35">{s.lab}</div>
                </div>
              ))}
            </div>

            {/* Integrazioni */}
            <div className="mt-12 p-8 border border-[#0a0a0a]/8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-6">Integrazioni Possibili</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>Microsoft 365 / Exchange</h4>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                    Add-in nativo per Outlook. Certificazione automatica in background su ogni email inviata. Nessun cambio di workflow per gli utenti finali.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>Google Workspace / Gmail</h4>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                    Google Workspace Add-on con certificazione server-side via API. Compatibile con tutti i client Gmail (web, mobile, desktop).
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>SMTP Gateway / Mail Server</h4>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                    Integrazione a livello SMTP per ambienti on-premise o mail server proprietari. Nessuna dipendenza da client specifici.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: FONT }}>REST API</h4>
                  <p className="text-[14px] leading-relaxed text-[#0a0a0a]/55" style={{ fontFamily: FONT }}>
                    API RESTful per integrazione custom in qualsiasi sistema di gestione documentale, CRM o piattaforma di comunicazione aziendale.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══ SEZIONE 6 — BUSINESS CASE ═══ */}
          <Section bg="#f5f5f7" id="business-case">
            <Label>Business Case</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Il costo del non fare<br />
              <span className="text-[#dc2626]">vs. il costo della certificazione.</span>
            </h2>
            <p className="mt-4 text-lg text-[#0a0a0a]/60 max-w-3xl" style={{ fontFamily: FONT }}>
              Confronto illustrativo per un'organizzazione con 500 utenti email e un contenzioso legale email-based ogni 3 anni.
            </p>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full text-left text-[14px]" style={{ fontFamily: FONT }}>
                <thead>
                  <tr className="border-b-2 border-[#0a0a0a]">
                    <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Dimensione</th>
                    <th className="py-3 pr-4 font-bold text-[#0a0a0a]">Senza Certificazione</th>
                    <th className="py-3 font-bold text-[#dc2626]">Con ProofPress Verify Email</th>
                  </tr>
                </thead>
                <tbody className="text-[#0a0a0a]/70">
                  {[
                    ["Costo discovery legale email", "200K – 500K€ / contenzioso", "Verification Certificate allegato: -80%"],
                    ["Perdite da BEC", "Media 130K€ / incidente", "Alert real-time: prevenzione proattiva"],
                    ["Audit GDPR / AI Act", "2–4 settimane di lavoro manuale", "Dashboard pronto: -90% effort"],
                     ["Reputational risk", "Non quantificabile", "Prova documentale immediata"],
                  ].map(([dim, without, with_]) => (
                    <tr key={dim} className="border-b border-[#0a0a0a]/8">
                      <td className="py-3 pr-4 font-semibold text-[#0a0a0a]">{dim}</td>
                      <td className="py-3 pr-4 text-[#0a0a0a]/50">{without}</td>
                      <td className="py-3 font-bold text-[#dc2626]">{with_}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Posizionamento competitivo */}
            <div className="mt-12 p-8 border border-[#0a0a0a]/8" style={{ background: "#ffffff" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-4">Posizionamento Competitivo</p>
              <p className="text-[15px] leading-relaxed text-[#0a0a0a]/60 mb-4" style={{ fontFamily: FONT }}>
                <strong className="text-[#0a0a0a]">Proofpoint, Mimecast e Abnormal Security proteggono il canale.</strong> Nessuno certifica l'integrità semantica del contenuto. SPF, DKIM e DMARC autenticano il mittente ma non il messaggio. ProofPress Verify Email è l'unica soluzione che combina certificazione crittografica del contenuto, anomaly detection AI e audit trail regolatorio in un'unica infrastruttura API-first.
              </p>
              <p className="text-[15px] leading-relaxed text-[#0a0a0a]/60" style={{ fontFamily: FONT }}>
                Il differenziale è la <strong className="text-[#0a0a0a]">certificazione del contenuto</strong>, non solo la sicurezza del trasporto. È la stessa tecnologia che certifica le notizie su ProofPress Magazine — applicata alle email aziendali.
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
                  icon: "🛡️",
                  role: "CISO / Head of Security",
                  context: "BEC, phishing interno, email fraud",
                  need: "Rilevare in tempo reale email contraffatte o anomale prima che causino danni finanziari o reputazionali.",
                  value: "Anomaly detection AI sul comportamento del mittente. Alert in meno di 2 secondi. 98% detection rate su BEC documentato in ambienti enterprise.",
                },
                {
                  icon: "⚖️",
                  role: "Chief Legal Officer / General Counsel",
                  context: "Contenzioso, discovery, M&A, comunicazioni board",
                  need: "Prova tamper-evident che un'email, a un dato timestamp, conteneva esattamente quel testo — senza ambiguità in sede giudiziaria.",
                  value: "Verification Certificate con hash SHA-256 immutabile. Allegabile direttamente al fascicolo legale. Riduce il costo di discovery dell'80%.",
                },
                {
                  icon: "📋",
                  role: "Chief Compliance Officer",
                  context: "AI Act, GDPR, NIS2, audit regolatori",
                  need: "Dimostrare la governance sulle comunicazioni email che incorporano AI o trattano dati personali, senza aumentare il carico operativo.",
                  value: "Audit trail automatico con flag AI-generated/human-authored. Dashboard di compliance pronto per audit senza lavoro manuale aggiuntivo.",
                },
                {
                  icon: "📊",
                  role: "CFO / Finance Director",
                  context: "Comunicazioni price-sensitive, IR, operazioni straordinarie",
                  need: "Proteggere l'organizzazione da rischi di market abuse e garantire che le comunicazioni finanziarie siano documentate e difendibili.",
                  value: "Certificazione automatica di ogni comunicazione finanziaria. Prova documentale immediata per procedimenti Consob, ESMA o class action.",
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

          {/* ═══ SEZIONE 8 — PRICING ═══ */}
          <Section bg="#f5f5f7" id="pricing">
            <Label>Pricing</Label>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-[#0a0a0a]">
              Tre tier.<br />
              <span className="text-[#0a0a0a]/25">Scala con la tua organizzazione.</span>
            </h2>
            <div className="mt-14 grid md:grid-cols-3 gap-8">
              {[
                {
                  tier: "Verify Mail Pro",
                  target: "PMI · Studi Professionali",
                  price: "€49",
                  period: "/mese per dominio",
                  features: [
                    "Fino a 5.000 email certificate/mese",
                    "Anomaly detection AI",
                    "Verification Certificate JSON",
                    "Dashboard compliance base",
                    "Integrazione Microsoft 365 / Google Workspace",
                    "Support email 48h",
                  ],
                  cta: "Inizia ora",
                  highlight: false,
                },
                {
                  tier: "Verify Mail Enterprise",
                  target: "Corporate · Banche · Pharma",
                  price: "€2.000",
                  period: "/anno (da)",
                  features: [
                    "Volume illimitato di email certificate",
                    "Anomaly detection AI avanzata",
                    "Audit trail GDPR / AI Act / NIS2 nativo",
                    "Export per discovery legale",
                    "SLA 99.9% garantito",
                    "Dedicated account manager",
                    "On-premise deployment disponibile",
                  ],
                  cta: "Richiedi un briefing",
                  highlight: true,
                },
                {
                  tier: "Verify Mail API",
                  target: "System Integrator · ISV",
                  price: "Revenue share",
                  period: "o per-call",
                  features: [
                    "API RESTful documentata",
                    "SDK per Microsoft 365 / Google Workspace",
                    "White-label disponibile",
                    "Sandbox di test",
                    "Supporto all'integrazione dedicato",
                    "SLA enterprise negoziabile",
                  ],
                  cta: "Contatta il team API",
                  highlight: false,
                },
              ].map((t) => (
                <div
                  key={t.tier}
                  className="p-8 border transition-colors"
                  style={{
                    border: t.highlight ? "2px solid #dc2626" : "1px solid rgba(10,10,10,0.08)",
                    background: t.highlight ? "#0a0a0a" : "#ffffff",
                  }}
                >
                  {t.highlight && (
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#dc2626] mb-4">Più scelto</div>
                  )}
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: t.highlight ? "rgba(255,255,255,0.4)" : "rgba(10,10,10,0.4)" }}>{t.target}</p>
                  <h3 className="text-xl font-black mb-1" style={{ color: t.highlight ? "#ffffff" : "#0a0a0a", fontFamily: FONT }}>{t.tier}</h3>
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-black" style={{ color: t.highlight ? "#ffffff" : "#0a0a0a" }}>{t.price}</span>
                    <span className="text-sm ml-1" style={{ color: t.highlight ? "rgba(255,255,255,0.5)" : "rgba(10,10,10,0.4)" }}>{t.period}</span>
                  </div>
                  <div className="space-y-2 mb-8">
                    {t.features.map((f) => (
                      <div key={f} className="flex items-start gap-3 text-[14px]" style={{ color: t.highlight ? "rgba(255,255,255,0.6)" : "rgba(10,10,10,0.55)", fontFamily: FONT }}>
                        <span className="w-4 h-4 flex items-center justify-center text-white text-[10px] flex-shrink-0 mt-0.5" style={{ background: "#dc2626" }}>✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <a
                    href="#contatto"
                    className="block w-full text-center px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-200"
                    style={{
                      background: t.highlight ? "#dc2626" : "transparent",
                      color: t.highlight ? "#ffffff" : "#0a0a0a",
                      border: t.highlight ? "none" : "2px solid #0a0a0a",
                      borderRadius: 0,
                    }}
                  >
                    {t.cta} →
                  </a>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══ SEZIONE CONTATTI ═══ */}
          <Section bg="#f5f5f7" id="contatto">
            <div className="text-center mb-10">
              <Label accent>Contattaci</Label>
              <h2 className="text-3xl md:text-4xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                Richiedi un Briefing Esecutivo.
              </h2>
              <p className="mt-3 text-base text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>
                Il team ProofPress risponde entro 24 ore lavorative. Nessun impegno — solo una conversazione strutturata sul tuo contesto specifico.
              </p>
            </div>
            <ContactForm origine="ProofPress Verify Email — /verify-email" />
          </Section>

          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
