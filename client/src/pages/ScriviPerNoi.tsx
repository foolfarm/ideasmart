/*
 * PROOFPRESS — Landing Page "Scrivi per Noi"
 * Pitch editoriale completo per attrarre collaboratori e giornalisti
 * Layout: coerente con il resto del sito (LeftSidebar + SharedPageHeader + BreakingNewsTicker)
 * Palette: white bg, #0a0a0a text, #ff5500 orange accent
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border mb-6"
      style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: SF }}
    >
      {children}
    </span>
  );
}

// ─── Dati ─────────────────────────────────────────────────────────────────────
const WHY_ITEMS = [
  {
    icon: "🔬",
    title: "Giornalismo verificato al 100%",
    body: "Ogni articolo pubblicato su ProofPress è certificato dalla nostra tecnologia Verify: hash crittografico immutabile, confronto multi-fonte AI, trust score in tempo reale. Scrivi con la certezza che il tuo lavoro è blindato contro manipolazioni e fake news.",
  },
  {
    icon: "🤖",
    title: "AI come copilota, non sostituto",
    body: "La nostra piattaforma agentica con 12 agenti specializzati lavora per te: ricerca, sintesi, fact-checking, SEO. Tu porti la firma, la visione e il punto di vista. L'AI amplifica la tua voce, non la sostituisce.",
  },
  {
    icon: "📈",
    title: "Audience di decision maker",
    body: "12.000+ lettori tra CEO, CTO, founder, investitori e manager C-level. Non scrivi per il grande pubblico generico: scrivi per chi decide, investe e costruisce il futuro dell'economia digitale italiana.",
  },
  {
    icon: "🌐",
    title: "Distribuzione multicanale",
    body: "I tuoi articoli vengono distribuiti automaticamente su newsletter, social, aggregatori e partner editoriali. ProofPress amplifica ogni contenuto su tutti i canali rilevanti per il tuo target.",
  },
  {
    icon: "💡",
    title: "Redazione del futuro, oggi",
    body: "Sei parte di un esperimento editoriale unico in Europa: la prima testata di AI Journalism certificato. Non stai scrivendo per un magazine tradizionale — stai costruendo il modello del giornalismo del prossimo decennio.",
  },
  {
    icon: "🤝",
    title: "Community di innovatori",
    body: "Entra in una rete di giornalisti, analisti, imprenditori e accademici che condividono la stessa visione: informazione di qualità, verificata, accessibile. Collaborazioni, co-autorship e progetti editoriali condivisi.",
  },
];

const FORMATS = [
  { name: "Analisi & Deep Dive", desc: "1.500–3.000 parole. Approfondimenti su trend, tecnologie e strategie con dati e fonti verificate.", tag: "Settimanale" },
  { name: "News Commentary", desc: "600–900 parole. Il tuo punto di vista autorevole su notizie rilevanti del giorno.", tag: "Quotidiano" },
  { name: "Rubrica Fissa", desc: "Colonna editoriale con cadenza settimanale o bisettimanale. Il tuo brand personale su ProofPress.", tag: "Continuativo" },
  { name: "Reportage & Inchieste", desc: "Giornalismo investigativo su AI, startup, venture capital e trasformazione digitale.", tag: "Su proposta" },
  { name: "Interview & Profile", desc: "Interviste a founder, investor e innovatori. Formato Q&A o narrativo.", tag: "Su proposta" },
  { name: "Newsletter Curata", desc: "Selezione settimanale dei contenuti più rilevanti per una vertical specifica.", tag: "Settimanale" },
];

const PROFILES = [
  { emoji: "📰", label: "Giornalisti professionisti", desc: "Con esperienza in tech, economia, finanza o innovazione" },
  { emoji: "🎓", label: "Accademici & Ricercatori", desc: "AI, economia digitale, scienze sociali, management" },
  { emoji: "🚀", label: "Founder & Imprenditori", desc: "Con storie da raccontare e insight da condividere" },
  { emoji: "💼", label: "Manager & C-Level", desc: "Esperti di settore con visione strategica" },
  { emoji: "🔍", label: "Analisti & Consulenti", desc: "Specializzati in mercati, tecnologia o investimenti" },
  { emoji: "✍️", label: "Autori & Saggisti", desc: "Con focus su innovazione, futuro del lavoro, AI" },
];

const STEPS = [
  { num: "01", title: "Candidatura", desc: "Compila il form con il tuo profilo, area di expertise e un esempio del tuo lavoro (articolo, post, paper)." },
  { num: "02", title: "Colloquio editoriale", desc: "Un editor ProofPress ti contatta entro 48 ore per un briefing di 30 minuti: allineamento su tono, target e formati." },
  { num: "03", title: "Articolo di prova", desc: "Scrivi un pezzo di prova su un tema concordato. Ricevi feedback dettagliato dalla redazione." },
  { num: "04", title: "Onboarding & pubblicazione", desc: "Accedi alla piattaforma ProofPress, al toolkit AI e alla community. Il tuo primo articolo va live." },
];

// ─── Form di candidatura inline ───────────────────────────────────────────────
function CandidaturaForm() {
  const [values, setValues] = useState({ nome: "", email: "", linkedin: "", expertise: "", bio: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const notifyOwner = trpc.system.notifyOwner.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await notifyOwner.mutateAsync({
        title: `[Candidatura Collaboratore] ${values.nome}`,
        content: `Nome: ${values.nome}\nEmail: ${values.email}\nLinkedIn: ${values.linkedin}\nExpertise: ${values.expertise}\n\nBio:\n${values.bio}`,
      });
      setSubmitted(true);
    } catch {
      toast.error("Impossibile inviare la candidatura. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(10,10,10,0.04)",
    border: "1px solid rgba(10,10,10,0.12)",
    fontFamily: SF,
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-8">
        <div className="text-5xl mb-6">✅</div>
        <h3 className="text-2xl font-black text-[#0a0a0a] mb-3" style={{ fontFamily: SF }}>
          Candidatura ricevuta!
        </h3>
        <p className="text-[#0a0a0a]/60 max-w-md mx-auto" style={{ fontFamily: SF }}>
          Ti contatteremo entro 48 ore all'indirizzo email indicato per un briefing editoriale.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/60 mb-2" style={{ fontFamily: SF }}>
            Nome e Cognome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.nome}
            onChange={(e) => setValues({ ...values, nome: e.target.value })}
            placeholder="Andrea Cinelli"
            required
            className="w-full px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#0a0a0a]/30 outline-none transition-all"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/60 mb-2" style={{ fontFamily: SF }}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            placeholder="andrea@email.com"
            required
            className="w-full px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#0a0a0a]/30 outline-none transition-all"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/60 mb-2" style={{ fontFamily: SF }}>
          Profilo LinkedIn o portfolio
        </label>
        <input
          type="text"
          value={values.linkedin}
          onChange={(e) => setValues({ ...values, linkedin: e.target.value })}
          placeholder="https://linkedin.com/in/..."
          className="w-full px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#0a0a0a]/30 outline-none transition-all"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/60 mb-2" style={{ fontFamily: SF }}>
          Area di expertise <span className="text-red-500">*</span>
        </label>
        <select
          value={values.expertise}
          onChange={(e) => setValues({ ...values, expertise: e.target.value })}
          required
          className="w-full px-4 py-3 text-sm outline-none transition-all appearance-none"
          style={{ ...inputStyle, color: values.expertise ? "#0a0a0a" : "rgba(10,10,10,0.4)" }}
        >
          <option value="" disabled>Seleziona area</option>
          <option value="AI & Machine Learning">AI & Machine Learning</option>
          <option value="Startup & Venture Capital">Startup & Venture Capital</option>
          <option value="Tecnologia & Innovazione">Tecnologia & Innovazione</option>
          <option value="Business & Strategy">Business & Strategy</option>
          <option value="Finanza & Investimenti">Finanza & Investimenti</option>
          <option value="Giornalismo & Media">Giornalismo & Media</option>
          <option value="Altro">Altro</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/60 mb-2" style={{ fontFamily: SF }}>
          Presentati brevemente <span className="text-red-500">*</span>
        </label>
        <textarea
          value={values.bio}
          onChange={(e) => setValues({ ...values, bio: e.target.value })}
          placeholder="Chi sei, cosa scrivi, perché vuoi scrivere su ProofPress. Includi un link a un tuo articolo o lavoro recente..."
          required
          rows={5}
          className="w-full px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#0a0a0a]/30 outline-none transition-all resize-none"
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-sm font-bold text-white uppercase tracking-wide transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: ORANGE, fontFamily: SF }}
      >
        {loading ? "Invio in corso..." : "Invia la tua candidatura →"}
      </button>

      <p className="text-center text-xs text-[#0a0a0a]/40" style={{ fontFamily: SF }}>
        Risposta garantita entro 48 ore. Nessun impegno fino all'onboarding.
      </p>
    </form>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function ScriviPerNoi() {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Scrivi per ProofPress — Entra nel nuovo giornalismo"
          description="Cerchiamo collaboratori, giornalisti e analisti pronti a cambiare il mondo. Scrivi per la prima testata di AI Journalism certificato in Italia. Candidati ora."
          canonical="https://proofpress.ai/scrivi-per-noi"
          ogSiteName="Proof Press"
        />
        <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: SF }}>
          <SharedPageHeader />
          {/* ── HERO ── */}
          <section className="pt-16 pb-20 px-5 md:px-8" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-xs text-[#0a0a0a]/40" style={{ fontFamily: SF }}>
                <Link href="/"><span className="hover:text-[#0a0a0a]/70 transition-colors cursor-pointer">Home</span></Link>
                <span>/</span>
                <span className="text-[#0a0a0a]/70">Scrivi per Noi</span>
              </div>

              <Label>Redazione aperta · Cerchiamo collaboratori</Label>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1
                    className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                    style={{ fontFamily: SF }}
                  >
                    Vuoi scrivere su ProofPress ed entrare nel{" "}
                    <span style={{ color: ORANGE }}>nuovo giornalismo?</span>
                  </h1>
                  <p className="text-lg text-[#0a0a0a]/65 leading-relaxed mb-8" style={{ fontFamily: SF }}>
                    Cerchiamo collaboratori e penne pronte a cambiare il mondo. AI, startup, venture capital, tecnologia: 
                    scrivi per la prima testata di AI Journalism certificato in Italia e raggiungi 12.000+ decision maker ogni giorno.
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-8 mb-8">
                    <div>
                      <div className="text-2xl font-black text-[#0a0a0a]" style={{ fontFamily: SF }}>12.000+</div>
                      <div className="text-[10px] text-[#0a0a0a]/40 uppercase tracking-widest">lettori attivi</div>
                    </div>
                    <div className="w-px h-10 bg-[#0a0a0a]/10" />
                    <div>
                      <div className="text-2xl font-black text-[#0a0a0a]" style={{ fontFamily: SF }}>4.000+</div>
                      <div className="text-[10px] text-[#0a0a0a]/40 uppercase tracking-widest">fonti monitorate</div>
                    </div>
                    <div className="w-px h-10 bg-[#0a0a0a]/10" />
                    <div>
                      <div className="text-2xl font-black" style={{ color: ORANGE, fontFamily: SF }}>100%</div>
                      <div className="text-[10px] text-[#0a0a0a]/40 uppercase tracking-widest">verificato</div>
                    </div>
                  </div>

                  <a href="#candidatura">
                    <span
                      className="inline-block text-sm font-bold uppercase tracking-wide px-8 py-4 transition-all hover:opacity-90 cursor-pointer"
                      style={{ background: ORANGE, color: "#ffffff", fontFamily: SF }}
                    >
                      Candidati ora →
                    </span>
                  </a>
                </div>

                {/* Right: manifesto card */}
                <div
                  className="p-8"
                  style={{ background: "#0a0a0a", border: `1px solid ${ORANGE}30` }}
                >
                  <div style={{ height: "3px", background: ORANGE, marginBottom: "24px" }} />
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
                    style={{ color: ORANGE, fontFamily: SF }}
                  >
                    Il nostro manifesto
                  </p>
                  <blockquote
                    className="text-lg font-black text-white leading-snug mb-6"
                    style={{ fontFamily: SF }}
                  >
                    "L'informazione non è mai stata così potente — e mai così a rischio. ProofPress nasce per restituire al giornalismo la sua funzione originaria: dire la verità, verificarla, e renderla accessibile a chi decide."
                  </blockquote>
                  <p className="text-sm text-white/50" style={{ fontFamily: SF }}>
                    — Andrea Cinelli, Fondatore ProofPress
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── CHI SIAMO ── */}
          <section className="py-20 px-5 md:px-8" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto">
              <Label>Chi è ProofPress</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2
                    className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-tight mb-6"
                    style={{ fontFamily: SF }}
                  >
                    La prima testata di AI Journalism certificato in Italia
                  </h2>
                  <div className="space-y-4 text-[#0a0a0a]/65 leading-relaxed" style={{ fontFamily: SF }}>
                    <p>
                      ProofPress non è un magazine tradizionale. È una piattaforma editoriale agentica: 12 agenti AI specializzati lavorano 24/7 per raccogliere, analizzare e verificare informazioni da 4.000+ fonti globali.
                    </p>
                    <p>
                      Ogni contenuto pubblicato passa attraverso la tecnologia <strong className="text-[#0a0a0a]">ProofPress Verify</strong>: un protocollo di validazione crittografica che certifica l'accuratezza fattuale, la coerenza multi-fonte e l'assenza di manipolazioni. Il risultato viene sigillato con hash SHA-256 immutabile.
                    </p>
                    <p>
                      Il risultato: un magazine che i decision maker possono leggere con la certezza che ogni dato è verificato, ogni fonte è tracciabile, ogni affermazione è difendibile.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Fondato", value: "2024" },
                    { label: "Sede", value: "Italia · Operatività globale" },
                    { label: "Tecnologia", value: "Piattaforma agentica proprietaria" },
                    { label: "Certificazione", value: "ProofPress Verify (hash crittografico)" },
                    { label: "Target", value: "CEO, CTO, Founder, Investor, Manager" },
                    { label: "Distribuzione", value: "Web, Newsletter, Social, Partner" },
                    { label: "Agenti AI", value: "12 agenti specializzati" },
                    { label: "Fonti monitorate", value: "4.000+ in tempo reale" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#0a0a0a]/8">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/40" style={{ fontFamily: SF }}>{item.label}</span>
                      <span className="text-sm font-semibold text-[#0a0a0a]" style={{ fontFamily: SF }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── PERCHÉ SCRIVERE ── */}
          <section className="py-20 px-5 md:px-8" style={{ background: "#fafafa" }}>
            <div className="max-w-5xl mx-auto">
              <Label>Perché scrivere su ProofPress</Label>
              <h2
                className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-tight mb-12 max-w-2xl"
                style={{ fontFamily: SF }}
              >
                6 ragioni per cui questa è la testata giusta per te
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {WHY_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="p-6"
                    style={{ background: "#ffffff", border: "1px solid rgba(10,10,10,0.08)" }}
                  >
                    <div className="text-2xl mb-4">{item.icon}</div>
                    <h3 className="text-base font-black text-[#0a0a0a] mb-3" style={{ fontFamily: SF }}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#0a0a0a]/60 leading-relaxed" style={{ fontFamily: SF }}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ── FORMATI ── */}
          <section className="py-20 px-5 md:px-8" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto">
              <Label>Formati editoriali</Label>
              <h2
                className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-tight mb-12 max-w-2xl"
                style={{ fontFamily: SF }}
              >
                Scegli il formato più adatto alla tua voce
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FORMATS.map((fmt, i) => (
                  <div
                    key={i}
                    className="flex gap-5 p-5"
                    style={{ border: "1px solid rgba(10,10,10,0.08)" }}
                  >
                    <div
                      className="w-0.5 flex-shrink-0 self-stretch"
                      style={{ background: ORANGE }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-black text-[#0a0a0a]" style={{ fontFamily: SF }}>
                          {fmt.name}
                        </h3>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5"
                          style={{ background: `${ORANGE}12`, color: ORANGE, fontFamily: SF }}
                        >
                          {fmt.tag}
                        </span>
                      </div>
                      <p className="text-sm text-[#0a0a0a]/55 leading-relaxed" style={{ fontFamily: SF }}>
                        {fmt.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ── CHI CERCHIAMO ── */}
          <section className="py-20 px-5 md:px-8" style={{ background: "#fafafa" }}>
            <div className="max-w-5xl mx-auto">
              <Label>Chi cerchiamo</Label>
              <h2
                className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-tight mb-12 max-w-2xl"
                style={{ fontFamily: SF }}
              >
                Profili che stiamo cercando attivamente
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {PROFILES.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5"
                    style={{ background: "#ffffff", border: "1px solid rgba(10,10,10,0.08)" }}
                  >
                    <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                    <div>
                      <h3 className="text-sm font-black text-[#0a0a0a] mb-1" style={{ fontFamily: SF }}>
                        {p.label}
                      </h3>
                      <p className="text-xs text-[#0a0a0a]/55" style={{ fontFamily: SF }}>
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Requisiti */}
              <div
                className="p-8"
                style={{ background: "#0a0a0a" }}
              >
                <div style={{ height: "3px", background: ORANGE, marginBottom: "20px" }} />
                <h3 className="text-lg font-black text-white mb-6" style={{ fontFamily: SF }}>
                  Cosa chiediamo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Capacità di scrittura chiara, precisa e orientata ai dati",
                    "Expertise verificabile in almeno una vertical (AI, startup, finanza, tech)",
                    "Rispetto delle scadenze editoriali concordate",
                    "Disponibilità a seguire le linee guida editoriali ProofPress",
                    "Apertura alla collaborazione con la piattaforma AI (non è richiesta expertise tecnica)",
                    "Profilo professionale verificabile (LinkedIn, portfolio, pubblicazioni)",
                  ].map((req, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span style={{ color: ORANGE, fontWeight: 700, flexShrink: 0 }}>→</span>
                      <p className="text-sm text-white/70" style={{ fontFamily: SF }}>{req}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── PROCESSO ── */}
          <section className="py-20 px-5 md:px-8" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto">
              <Label>Come funziona</Label>
              <h2
                className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-tight mb-12 max-w-2xl"
                style={{ fontFamily: SF }}
              >
                Dal form alla prima pubblicazione in 4 passi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STEPS.map((step, i) => (
                  <div key={i} className="relative">
                    {i < STEPS.length - 1 && (
                      <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-[#0a0a0a]/10 z-0" style={{ width: "calc(100% - 24px)", left: "calc(100% - 12px)" }} />
                    )}
                    <div className="relative z-10">
                      <div
                        className="text-3xl font-black mb-4"
                        style={{ color: ORANGE, fontFamily: SF }}
                      >
                        {step.num}
                      </div>
                      <h3 className="text-base font-black text-[#0a0a0a] mb-2" style={{ fontFamily: SF }}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#0a0a0a]/55 leading-relaxed" style={{ fontFamily: SF }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ── FORM CANDIDATURA ── */}
          <section id="candidatura" className="py-20 px-5 md:px-8" style={{ background: "#fafafa" }}>
            <div className="max-w-3xl mx-auto">
              <Label>Candidatura</Label>
              <h2
                className="text-3xl md:text-4xl font-black text-[#0a0a0a] leading-tight mb-4"
                style={{ fontFamily: SF }}
              >
                Pronto a cambiare il giornalismo?
              </h2>
              <p className="text-lg text-[#0a0a0a]/60 mb-10" style={{ fontFamily: SF }}>
                Compila il form. Ti risponderemo entro 48 ore con un briefing editoriale personalizzato.
              </p>

              <div
                className="p-8 md:p-10"
                style={{ background: "#ffffff", border: "1px solid rgba(10,10,10,0.08)" }}
              >
                <CandidaturaForm />
              </div>

              <p className="text-center text-sm text-[#0a0a0a]/40 mt-6" style={{ fontFamily: SF }}>
                Preferisci scrivere direttamente?{" "}
                <Link href="/contatti">
                  <span className="font-semibold cursor-pointer" style={{ color: ORANGE }}>
                    Vai alla pagina Contatti →
                  </span>
                </Link>
              </p>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
