/*
 * PROOFPRESS — Pagina Contatti
 * 5 sezioni: Sales, Collaboratore, Pubblicizza, Demo, Generale
 * Design: coerente con il resto del sito (navy #0a0f1e, cyan #00e5c8, orange #ff5500)
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";

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
    cta: "Prenota una call",
    color: "#00e5c8",
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
    color: "#ff5500",
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
    description: "Prenota una demo live della piattaforma ProofPress: dalla generazione degli articoli alla certificazione IPFS, fino al trust score in tempo reale.",
    cta: "Prenota la demo",
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
function ContactModal({
  card,
  onClose,
}: {
  card: ContactCard;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const notifyOwner = trpc.system.notifyOwner.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const content = Object.entries(values)
        .map(([k, v]) => `**${k}**: ${v}`)
        .join("\n");
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
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10"
          style={{ background: "#0d1526" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{card.icon}</span>
            <div>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: SF }}>{card.title}</h3>
              <p className="text-xs text-white/50" style={{ fontFamily: SF }}>{card.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-white mb-2" style={{ fontFamily: SF }}>Messaggio inviato!</h4>
              <p className="text-white/60 text-sm mb-6" style={{ fontFamily: SF }}>
                Ti risponderemo entro 24 ore all'indirizzo email indicato.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: card.color === "#f59e0b" ? "#f59e0b" : card.color }}
              >
                Chiudi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {card.fields.map((field) => (
                <div key={field.name}>
                  <label
                    className="block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide"
                    style={{ fontFamily: MONO }}
                  >
                    {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={values[field.name] || ""}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 resize-none outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontFamily: SF,
                      }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={values[field.name] || ""}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      required={field.required}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all appearance-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontFamily: SF,
                        color: values[field.name] ? "white" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      <option value="" disabled style={{ background: "#0d1526" }}>{field.placeholder}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt} style={{ background: "#0d1526" }}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={values[field.name] || ""}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
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
    <div style={{ background: "#0a0f1e", minHeight: "100vh", fontFamily: SF }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "#00e5c8", fontFamily: "'JetBrains Mono', monospace" }}
          >
            ProofPress · Contatti
          </p>
          <h1
            className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
            style={{ fontFamily: SF }}
          >
            Come possiamo<br />
            <span style={{ color: "#00e5c8" }}>aiutarti?</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Scegli il tipo di contatto più adatto alla tua esigenza. Ti risponderemo entro 24 ore.
          </p>
        </div>
      </section>

      {/* Card griglia */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className="text-left rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Icon + color bar */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}
                >
                  {card.icon}
                </div>
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ background: card.color }}
                />
              </div>

              <h3
                className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors"
                style={{ fontFamily: SF }}
              >
                {card.title}
              </h3>
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: card.color, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {card.subtitle}
              </p>
              <p className="text-sm text-white/55 leading-relaxed mb-5">
                {card.description}
              </p>

              <div
                className="inline-flex items-center gap-2 text-sm font-bold transition-all group-hover:gap-3"
                style={{ color: card.color }}
              >
                {card.cta} →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Info rapide */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(0,229,200,0.05)", border: "1px solid rgba(0,229,200,0.15)" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#00e5c8", fontFamily: "'JetBrains Mono', monospace" }}
            >
              Risposta garantita
            </p>
            <h3 className="text-2xl font-black text-white mb-3" style={{ fontFamily: SF }}>
              Entro 24 ore lavorative
            </h3>
            <p className="text-white/55 text-sm max-w-lg mx-auto">
              Tutte le richieste vengono gestite dal team ProofPress. Per urgenze, indica nel messaggio la tua disponibilità e ti contatteremo in priorità.
            </p>
          </div>
        </div>
      </section>

      {/* Modale */}
      {selectedCard && (
        <ContactModal card={selectedCard} onClose={() => setActiveCard(null)} />
      )}
    </div>
  );
}
