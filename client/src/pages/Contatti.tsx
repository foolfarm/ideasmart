/*
 * PROOFPRESS — Pagina Contatti
 * 5 sezioni: Sales, Collaboratore, Pubblicizza, Demo, Generale
 * Layout: coerente con il resto del sito (LeftSidebar + SharedPageHeader + BreakingNewsTicker)
 * Palette: white bg, #0a0a0a text, #ff5500 orange accent
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

// ─── Tipi ────────────────────────────────────────────────────────────────────
type ContactType = "sales" | "collaboratore" | "pubblicita" | "demo" | "generale" | null;

interface ContactCard {
  id: ContactType;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  color: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  placeholder: string;
  required: boolean;
  options?: string[];
}

// ─── Configurazione card ─────────────────────────────────────────────────────
const CARDS: ContactCard[] = [
  {
    id: "sales",
    icon: "💼",
    title: "Parla con un Sales",
    subtitle: "Per editori, aziende e testate",
    description: "Vuoi integrare ProofPress nella tua organizzazione? Un nostro account executive ti contatta entro 24 ore per una consulenza gratuita.",
    cta: "Richiedi preventivo",
    color: "#0ea5e9",
    fields: [
      { name: "nome", label: "Nome e Cognome", type: "text", placeholder: "Andrea Cinelli", required: true },
      { name: "email", label: "Email aziendale", type: "email", placeholder: "andrea@azienda.com", required: true },
      { name: "azienda", label: "Azienda / Testata", type: "text", placeholder: "Nome azienda", required: true },
      { name: "ruolo", label: "Ruolo", type: "select", placeholder: "Seleziona ruolo", required: true, options: ["CEO / Founder", "CMO / Marketing", "Editor / Direttore", "CTO / Tech", "Altro"] },
      { name: "interesse", label: "Cosa ti interessa?", type: "select", placeholder: "Seleziona area", required: true, options: ["Piattaforma ProofPress completa", "ProofPress Verify per la mia testata", "White-label per la mia azienda", "API e integrazione tecnica", "Altro"] },
      { name: "messaggio", label: "Note aggiuntive (opzionale)", type: "textarea", placeholder: "Descrivici brevemente il tuo caso d'uso...", required: false },
    ],
  },
  {
    id: "collaboratore",
    icon: "✍️",
    title: "Diventa Collaboratore",
    subtitle: "Giornalisti, autori, esperti di settore",
    description: "ProofPress cerca professionisti con expertise in AI, startup, venture capital e tecnologia. Scrivi per noi o proponi una rubrica.",
    cta: "Candidati ora",
    color: ORANGE,
    fields: [
      { name: "nome", label: "Nome e Cognome", type: "text", placeholder: "Andrea Cinelli", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "andrea@email.com", required: true },
      { name: "profilo", label: "Profilo LinkedIn o portfolio", type: "text", placeholder: "https://linkedin.com/in/...", required: false },
      { name: "expertise", label: "Area di expertise", type: "select", placeholder: "Seleziona area", required: true, options: ["AI & Machine Learning", "Startup & Venture Capital", "Tecnologia & Innovazione", "Business & Strategy", "Finanza & Investimenti", "Altro"] },
      { name: "formato", label: "Formato preferito", type: "select", placeholder: "Seleziona formato", required: true, options: ["Articoli di analisi", "Newsletter settimanale", "Rubrica fissa", "Reportage e inchieste", "Podcast / Video", "Altro"] },
      { name: "bio", label: "Presentati brevemente", type: "textarea", placeholder: "Chi sei, cosa scrivi, perché ProofPress...", required: true },
    ],
  },
  {
    id: "pubblicita",
    icon: "📣",
    title: "Pubblicizza su ProofPress",
    subtitle: "Raggiungi decision maker e innovatori",
    description: "ProofPress raggiunge CEO, CTO, founder e investitori. Scopri i formati disponibili: banner, newsletter sponsorizzata, contenuti branded.",
    cta: "Richiedi il media kit",
    color: "#f59e0b",
    fields: [
      { name: "nome", label: "Nome e Cognome", type: "text", placeholder: "Andrea Cinelli", required: true },
      { name: "email", label: "Email aziendale", type: "email", placeholder: "andrea@azienda.com", required: true },
      { name: "azienda", label: "Azienda", type: "text", placeholder: "Nome azienda", required: true },
      { name: "budget", label: "Budget mensile indicativo", type: "select", placeholder: "Seleziona range", required: false, options: ["< €500", "€500 – €2.000", "€2.000 – €5.000", "€5.000 – €10.000", "> €10.000"] },
      { name: "formato", label: "Formato di interesse", type: "select", placeholder: "Seleziona formato", required: false, options: ["Banner display", "Newsletter sponsorizzata", "Contenuto branded / native", "Pacchetto integrato", "Altro"] },
      { name: "obiettivo", label: "Obiettivo della campagna", type: "textarea", placeholder: "Brand awareness, lead generation, lancio prodotto...", required: false },
    ],
  },
  {
    id: "demo",
    icon: "🚀",
    title: "Richiedi una Demo",
    subtitle: "Vedi ProofPress in azione",
    description: "Presentaci il tuo progetto: ti risponderemo entro 24 ore con una proposta personalizzata.",
    cta: "Richiedi preventivo",
    color: "#8b5cf6",
    fields: [
      { name: "nome", label: "Nome e Cognome", type: "text", placeholder: "Andrea Cinelli", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "andrea@email.com", required: true },
      { name: "azienda", label: "Azienda (opzionale)", type: "text", placeholder: "Nome azienda", required: false },
      { name: "interesse", label: "Cosa vuoi vedere nella demo?", type: "select", placeholder: "Seleziona area", required: true, options: ["Piattaforma completa", "ProofPress Verify", "Integrazione API", "White-label", "Tutto"] },
      { name: "disponibilita", label: "Disponibilità preferita", type: "select", placeholder: "Seleziona fascia oraria", required: false, options: ["Mattina (9:00 – 12:00)", "Pomeriggio (14:00 – 17:00)", "Tarda mattina (12:00 – 14:00)", "Flessibile"] },
    ],
  },
  {
    id: "generale",
    icon: "✉️",
    title: "Contatto Generale",
    subtitle: "Per qualsiasi altra richiesta",
    description: "Hai una domanda, un feedback o una proposta che non rientra nelle categorie precedenti? Scrivici direttamente.",
    cta: "Invia messaggio",
    color: "#6b7280",
    fields: [
      { name: "nome", label: "Nome e Cognome", type: "text", placeholder: "Andrea Cinelli", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "andrea@email.com", required: true },
      { name: "oggetto", label: "Oggetto", type: "text", placeholder: "Oggetto del messaggio", required: true },
      { name: "messaggio", label: "Messaggio", type: "textarea", placeholder: "Scrivi qui il tuo messaggio...", required: true },
    ],
  },
];

// ─── Componente Form Modale ───────────────────────────────────────────────────
function ContactModal({ card, onClose }: { card: ContactCard; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const notifyOwner = trpc.system.notifyOwner.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const content = Object.entries(values).map(([k, v]) => `**${k}**: ${v}`).join("\n");
      await notifyOwner.mutateAsync({
        title: `[Contatti] ${card.title} — ${values.nome || "Anonimo"}`,
        content: `Tipo: ${card.title}\n\n${content}`,
      });
      setSubmitted(true);
    } catch {
      toast.error("Impossibile inviare il messaggio. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#ffffff", border: "1px solid rgba(10,10,10,0.12)", boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#0a0a0a]/10"
          style={{ background: "#ffffff" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{card.icon}</span>
            <div>
              <h3 className="text-base font-bold text-[#0a0a0a]" style={{ fontFamily: SF }}>{card.title}</h3>
              <p className="text-xs text-[#0a0a0a]/50" style={{ fontFamily: SF }}>{card.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#0a0a0a]/40 hover:text-[#0a0a0a] hover:bg-[#0a0a0a]/08 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-[#0a0a0a] mb-2" style={{ fontFamily: SF }}>Messaggio inviato!</h4>
              <p className="text-[#0a0a0a]/60 text-sm mb-6" style={{ fontFamily: SF }}>
                Ti risponderemo entro 24 ore all'indirizzo email indicato.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: card.color, fontFamily: SF }}
              >
                Chiudi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {card.fields.map((field) => (
                <div key={field.name}>
                  <label
                    className="block text-xs font-semibold text-[#0a0a0a]/60 mb-1.5 uppercase tracking-wide"
                    style={{ fontFamily: SF }}
                  >
                    {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={values[field.name] || ""}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#0a0a0a] placeholder-[#0a0a0a]/30 resize-none outline-none transition-all"
                      style={{
                        background: "rgba(10,10,10,0.04)",
                        border: "1px solid rgba(10,10,10,0.12)",
                        fontFamily: SF,
                      }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={values[field.name] || ""}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all appearance-none"
                      style={{
                        background: "rgba(10,10,10,0.04)",
                        border: "1px solid rgba(10,10,10,0.12)",
                        fontFamily: SF,
                        color: values[field.name] ? "#0a0a0a" : "rgba(10,10,10,0.4)",
                      }}
                    >
                      <option value="" disabled>{field.placeholder}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={values[field.name] || ""}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#0a0a0a] placeholder-[#0a0a0a]/30 outline-none transition-all"
                      style={{
                        background: "rgba(10,10,10,0.04)",
                        border: "1px solid rgba(10,10,10,0.12)",
                        fontFamily: SF,
                      }}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
                style={{ background: card.color, fontFamily: SF }}
              >
                {loading ? "Invio in corso..." : card.cta}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function Contatti() {
  const [activeCard, setActiveCard] = useState<ContactType>(null);
  const selectedCard = CARDS.find((c) => c.id === activeCard) ?? null;

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Contatti — ProofPress"
          description="Parla con il team ProofPress: sales, collaboratori, pubblicità, demo e contatto generale. Risposta garantita entro 24 ore."
          canonical="https://proofpress.ai/contatti"
          ogSiteName="Proof Press"
        />
        <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: SF }}>
          <SharedPageHeader />
          {/* Hero */}
          <section className="pt-16 pb-12 px-4 md:px-8" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-xs text-[#0a0a0a]/40" style={{ fontFamily: SF }}>
                <a href="/" className="hover:text-[#0a0a0a]/70 transition-colors">Home</a>
                <span>/</span>
                <span className="text-[#0a0a0a]/70">Contatti</span>
              </div>

              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border mb-6"
                style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: SF }}
              >
                CONTATTI
              </span>

              <div className="max-w-3xl">
                <h1
                  className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                  style={{ fontFamily: SF }}
                >
                  Come possiamo<br />
                  <span style={{ color: ORANGE }}>aiutarti?</span>
                </h1>
                <p className="text-lg text-[#0a0a0a]/60 max-w-2xl leading-relaxed" style={{ fontFamily: SF }}>
                  Scegli il tipo di contatto più adatto alla tua esigenza. Ti risponderemo entro 24 ore.
                </p>
              </div>
            </div>
          </section>

          {/* Divisore */}
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="border-t border-[#0a0a0a]/8" />
          </div>

          {/* Card griglia */}
          <section className="py-16 px-4 md:px-8" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CARDS.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setActiveCard(card.id)}
                  className="text-left p-6 transition-all duration-200 hover:shadow-md group"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(10,10,10,0.1)",
                  }}
                >
                  {/* Icon + color bar */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${card.color}12`, border: `1px solid ${card.color}28` }}
                    >
                      {card.icon}
                    </div>
                    <div
                      className="w-0.5 self-stretch rounded-full flex-shrink-0"
                      style={{ background: card.color }}
                    />
                  </div>

                  <h3
                    className="text-base font-bold text-[#0a0a0a] mb-1 transition-colors"
                    style={{ fontFamily: SF }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                    style={{ color: card.color, fontFamily: SF }}
                  >
                    {card.subtitle}
                  </p>
                  <p className="text-sm text-[#0a0a0a]/55 leading-relaxed mb-5" style={{ fontFamily: SF }}>
                    {card.description}
                  </p>

                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3"
                    style={{ color: card.color, fontFamily: SF }}
                  >
                    {card.cta} →
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Divisore */}
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="border-t border-[#0a0a0a]/8" />
          </div>

          {/* Info rapide */}
          <section className="py-16 px-4 md:px-8" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto">
              <div
                className="p-8 text-center"
                style={{ background: `${ORANGE}06`, border: `1px solid ${ORANGE}20` }}
              >
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
                  style={{ color: ORANGE, fontFamily: SF }}
                >
                  Risposta garantita
                </span>
                <h3 className="text-2xl font-black text-[#0a0a0a] mb-3" style={{ fontFamily: SF }}>
                  Entro 24 ore lavorative
                </h3>
                <p className="text-[#0a0a0a]/55 text-sm max-w-lg mx-auto" style={{ fontFamily: SF }}>
                  Tutte le richieste vengono gestite dal team ProofPress. Per urgenze, indica nel messaggio la tua disponibilità e ti contatteremo in priorità.
                </p>
              </div>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>

      {/* Modale */}
      {selectedCard && (
        <ContactModal card={selectedCard} onClose={() => setActiveCard(null)} />
      )}
    </div>
  );
}
