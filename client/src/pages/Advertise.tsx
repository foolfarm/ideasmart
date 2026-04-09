/**
 * Proof Press — Advertising / Media Kit
 * Layout editoriale coerente con le pagine sezione del sito.
 * Palette: bianco carta (#faf8f3), inchiostro (#1a1a1a), accento teal (#1a1a1a).
 * Tipografia: SF Pro Display (titoli), SF Pro Text (corpo) — sistema Apple.
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

const ACCENT = "#1a1a1a";
const ACCENT_LIGHT = "#e6f4f1";
const INK = "#1a1a1a";
const ORANGE = "#2a2a2a";

function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-4" : "border-t"} border-[#1a1a1a]`} />;
}
function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/15" />;
}
function SectionBadge({ label, color = ACCENT, bg = ACCENT_LIGHT }: { label: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
      style={{ background: bg, color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {label}
    </span>
  );
}

// ─── Dati ────────────────────────────────────────────────────────────────────

const AUDIENCE_STATS = [
  { value: "5.400+", label: "Iscritti newsletter" }, // sostituito dinamicamente nel JSX
  { value: "8.000+", label: "Visitatori unici/mese" },
  { value: "42%", label: "Open rate newsletter" },
  { value: "4,2 min", label: "Tempo medio sul sito" },
  { value: "78%", label: "Professionisti B2B" },
  { value: "100%", label: "Audience italiana" }
];

const AUDIENCE_PROFILES = [
  { role: "CTO / CIO", pct: "28%" },
  { role: "Founder / CEO", pct: "24%" },
  { role: "Product Manager", pct: "18%" },
  { role: "Investitori / VC", pct: "14%" },
  { role: "Consulenti AI", pct: "16%" }
];

const FORMATS = [
  {
    tag: "Massima visibilità",
    name: "Banner Hero",
    placement: "Homepage — Above the fold",
    size: "Full-width · 1200×200px",
    price: "€1.500 / settimana",
    impressions: "~8.000 impressioni/sett.",
    ctr: "CTR medio: 2,8%",
    features: ["Logo + headline + CTA", "Link diretto al tuo sito", "Visibile su desktop e mobile", "Report settimanale incluso"],
    highlight: true,
  },
  {
    tag: "Alto engagement",
    name: "Newsletter Sponsorizzata",
    placement: "Newsletter settimanale",
    size: "Blocco nativo · 600px wide",
    price: "€900 / invio",
    impressions: "~5.400 destinatari",
    ctr: "Open rate: 42%",
    features: ["Formato nativo editoriale", "Logo + testo + CTA", "Link tracciato", "Report aperture incluso"],
    highlight: false,
  },
  {
    tag: "Content marketing",
    name: "Startup del Giorno Sponsorizzata",
    placement: "Homepage — Sezione Startup del Giorno",
    size: "Card full-width con badge 'Sponsorizzato'",
    price: "€750 / giorno",
    impressions: "~1.200 visualizzazioni/giorno",
    ctr: "Engagement: 4,1%",
    features: ["Recensione editoriale completa", "AI Score personalizzato", "Link sito + LinkedIn", "Badge 'Sponsorizzato' trasparente"],
    highlight: false,
  },
  {
    tag: "Brand awareness",
    name: "Reportage Branded",
    placement: "Homepage — Sezione Reportage",
    size: "Card editoriale completa",
    price: "€1.200 / settimana",
    impressions: "~5.000 visualizzazioni/sett.",
    ctr: "Tempo medio lettura: 2m 40s",
    features: ["500+ parole editoriali", "Statistiche e dati inclusi", "Quote in evidenza", "Online per 7 giorni"],
    highlight: false,
  },
  {
    tag: "Thought leadership",
    name: "Analisi di Mercato Sponsorizzata",
    placement: "Homepage — Sezione Analisi di Mercato",
    size: "Card analisi con logo fonte",
    price: "€600 / settimana",
    impressions: "~3.000 visualizzazioni/sett.",
    ctr: "Download rate: 3,5%",
    features: ["Fonte brandizzata con logo", "Sintesi editoriale inclusa", "Link al documento originale", "Online per 7 giorni"],
    highlight: false,
  }
];

// ─── Hook count-up ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setCount(Math.round(eased * target));
      if (elapsed < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return count;
}

// ─── Blocco Live Readers ─────────────────────────────────────────────────────
function LiveReadersBlock({ count }: { count: number }) {
  const animated = useCountUp(count, 1400);
  return (
    <div
      className="flex items-center gap-6 py-5 px-6 my-6"
      style={{
        background: "#f0faf7",
        borderLeft: `4px solid #1a1a1a`,
      }}
    >
      {/* Pallino pulsante */}
      <div className="relative flex-shrink-0">
        <span
          className="absolute inline-flex h-4 w-4 rounded-full opacity-75 animate-ping"
          style={{ background: "#1a1a1a" }}
        />
        <span
          className="relative inline-flex rounded-full h-4 w-4"
          style={{ background: "#1a1a1a" }}
        />
      </div>
      {/* Numero */}
      <div>
        <div
          className="text-4xl font-black leading-none"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: "#1a1a1a" }}
        >
          {animated.toLocaleString("it-IT")}
        </div>
        <div
          className="mt-1 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif", color: "rgba(26,26,46,0.5)" }}
        >
          Lettori attivi iscritti alla newsletter
        </div>
      </div>
      {/* Testo descrittivo */}
      <div
        className="hidden md:block ml-auto text-sm leading-relaxed max-w-xs"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif", color: "rgba(26,26,46,0.65)" }}
      >
        Professionisti B2B italiani che ricevono ogni settimana le analisi di Proof Press.
        <strong style={{ color: "#1a1a1a" }}> Dato aggiornato in tempo reale.</strong>
      </div>
    </div>
  );
}

// ─── Componente principale ────────────────────────────────────────────────────

export default function Advertise() {
  const today = useMemo(() => new Date(), []);
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    format: "",
    budget: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const { data: subscriberCount } = trpc.newsletter.getActiveCount.useQuery();

  const contactMutation = trpc.advertise.contact.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Richiesta inviata! Ti contatteremo entro 24 ore.");
    },
    onError: () => {
      toast.error("Errore nell'invio. Scrivi direttamente a info@ideasmart.biz");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.name || !formData.email) {
      toast.error("Compila i campi obbligatori: azienda, nome ed email.");
      return;
    }
    setSending(true);
    contactMutation.mutate(formData, {
      onSettled: () => setSending(false),
    });
  };

  return (
    <>
      <SEOHead
        title="Advertising — Proof Press"
        description="Raggiungi 8.000+ professionisti B2B italiani dell'AI e del business con i formati pubblicitari di Proof Press: banner, newsletter, reportage branded e analisi sponsorizzate."
        canonical="https://ideasmart.biz/advertise"
        ogSiteName="Proof Press"
      />
      <style>{`
        /* SF Pro system font — no external loading needed */
      `}</style>
      <div className="min-h-screen" style={{ background: "#faf8f3", color: INK }}>

        {/* ── TESTATA ── */}
        <header className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <Link href="/">
              <span
                className="text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 cursor-pointer uppercase tracking-widest"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                ← Proof Press
              </span>
            </Link>
            <span
              className="text-xs text-[#1a1a1a]/40 uppercase tracking-widest"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              {formatDateIT(today)}
            </span>
          </div>
          <Divider thick />
          <div className="text-center py-6">
            <SectionBadge label="Media Kit" />
            <h1
              className="mt-3 text-4xl md:text-6xl font-black tracking-tight text-[#1a1a1a]"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", letterSpacing: "-0.02em" }}
            >
              Advertising
            </h1>
            <p
              className="mt-2 text-xs uppercase tracking-[0.25em] text-[#1a1a1a]/50"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Raggiungi {subscriberCount ? `${subscriberCount.toLocaleString("it-IT")}+` : "5.400+"} professionisti B2B italiani
            </p>
          </div>
          <Divider />
        </header>

        <BreakingNewsTicker />

        {/* ── CORPO ── */}
        <main className="max-w-6xl mx-auto px-4 pb-16">

          {/* ── LIVE READERS BLOCK ── */}
          <LiveReadersBlock count={subscriberCount ?? 5400} />

          {/* ── INTRO ── */}
          <section className="py-10 grid md:grid-cols-[2fr_1fr] gap-10">
            <div>
              <SectionBadge label="Perché Proof Press" />
              <h2
                className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-[#1a1a1a]"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                La prima testata AI italiana letta dai decision maker.
              </h2>
              <div
                className="mt-5 space-y-4 text-base leading-relaxed text-[#1a1a1a]/75"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
              >
                <p>
                  Proof Press è la testata giornalistica 100% AI più letta dai professionisti italiani dell'intelligenza artificiale, del business e dell'innovazione. Ogni giorno, oltre 8.000 visitatori unici leggono le nostre analisi, notizie e reportage.
                </p>
                <p>
                  Il nostro pubblico è composto da CTO, CEO, Product Manager, investitori e consulenti AI: <strong style={{ color: INK }}>i professionisti che prendono decisioni di acquisto e investimento.</strong> Pubblicare su Proof Press significa essere presenti dove si forma l'opinione del settore.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <blockquote className="border-l-4 pl-5 py-2" style={{ borderColor: ACCENT }}>
                <p
                  className="text-xl font-bold italic leading-snug text-[#1a1a1a]"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  "Non vendiamo spazi pubblicitari. Offriamo accesso a una community di professionisti che ci legge ogni mattina."
                </p>
                <footer
                  className="mt-3 text-xs uppercase tracking-widest text-[#1a1a1a]/50"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  — Proof Press, Media Kit 2026
                </footer>
              </blockquote>
            </div>
          </section>

          <ThinDivider />

          {/* ── STATISTICHE AUDIENCE ── */}
          <section className="py-8">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-0">
              {AUDIENCE_STATS.map((s, i) => (
                <div
                  key={i}
                  className="text-center py-5 px-3"
                  style={{ borderLeft: i > 0 ? "1px solid rgba(26,26,46,0.12)" : "none" }}
                >
                  <div
                    className="text-3xl font-black"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", color: i === 0 ? ACCENT : INK }}
                  >
                    {i === 0 && subscriberCount
                      ? `${subscriberCount.toLocaleString("it-IT")}+`
                      : s.value}
                  </div>
                  <div
                    className="mt-1 text-[9px] uppercase tracking-widest text-[#1a1a1a]/45"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ThinDivider />

          {/* ── PROFILI AUDIENCE ── */}
          <section className="py-10 grid md:grid-cols-[2fr_1fr] gap-10">
            <div>
              <SectionBadge label="Chi ci legge" />
              <h2
                className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-6"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Un pubblico di professionisti B2B
              </h2>
              <div className="space-y-0">
                {AUDIENCE_PROFILES.map((p, i) => (
                  <div
                    key={p.role}
                    className="flex items-center justify-between py-4"
                    style={{ borderBottom: "1px solid rgba(26,26,46,0.10)" }}
                  >
                    <span
                      className="text-sm font-bold text-[#1a1a1a]"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {p.role}
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${parseInt(p.pct) * 2}px`,
                          background: i === 0 ? ACCENT : i === 1 ? ORANGE : "rgba(26,26,46,0.3)",
                        }}
                      />
                      <span
                        className="text-sm font-bold text-[#1a1a1a] w-10 text-right"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', serif" }}
                      >
                        {p.pct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionBadge label="Perché funziona" />
              <h2
                className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-5"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Contesto editoriale di qualità
              </h2>
              <div className="space-y-3">
                {[
                  { tag: "Native-first", desc: "I formati si integrano nel flusso editoriale senza interrompere la lettura" },
                  { tag: "Audience qualificata", desc: "Lettori abituali con alta propensione all'acquisto nel settore AI/Tech" },
                  { tag: "Trasparenza totale", desc: "Report dettagliati su impressioni, click e engagement per ogni campagna" }
                ].map((item) => (
                  <div
                    key={item.tag}
                    className="flex gap-3 py-3"
                    style={{ borderBottom: "1px solid rgba(26,26,46,0.10)" }}
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm flex-shrink-0 h-fit mt-0.5"
                      style={{ background: ACCENT_LIGHT, color: ACCENT, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {item.tag}
                    </span>
                    <p
                      className="text-sm leading-relaxed text-[#1a1a1a]/70"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <ThinDivider />

          {/* ── FORMATI ── */}
          <section className="py-10">
            <SectionBadge label="Formati disponibili" />
            <h2
              className="mt-3 text-2xl font-bold text-[#1a1a1a] mb-8"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Cinque formati per ogni obiettivo
            </h2>
            <div className="space-y-0">
              {FORMATS.map((fmt, i) => (
                <div key={fmt.name}>
                  <div
                    className="py-6 grid md:grid-cols-[1fr_auto] gap-6 items-start"
                    style={fmt.highlight ? { background: "#f0faf7", margin: "0 -1rem", padding: "1.5rem 1rem" } : {}}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <SectionBadge
                          label={fmt.tag}
                          color={fmt.highlight ? ACCENT : "rgba(26,26,46,0.45)"}
                          bg={fmt.highlight ? ACCENT_LIGHT : "rgba(26,26,46,0.06)"}
                        />
                        {fmt.highlight && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm"
                            style={{ background: ORANGE, color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                          >
                            Top
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-xl font-bold text-[#1a1a1a] mb-1"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {fmt.name}
                      </h3>
                      <p
                        className="text-xs text-[#1a1a1a]/45 mb-3"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {fmt.placement} · {fmt.size}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {fmt.features.map((f) => (
                          <span
                            key={f}
                            className="text-xs text-[#1a1a1a]/60"
                            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                          >
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className="text-2xl font-black text-[#1a1a1a]"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {fmt.price}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40 mt-1"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {fmt.impressions}
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/40"
                        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {fmt.ctr}
                      </div>
                    </div>
                  </div>
                  {i < FORMATS.length - 1 && <ThinDivider />}
                </div>
              ))}
            </div>
          </section>

          <Divider thick />

          {/* ── FORM CONTATTO ── */}
          <section className="py-10">
            <SectionBadge label="Richiedi informazioni" color={ORANGE} bg="#fff3ee" />
            <h2
              className="mt-3 text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-3"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Inizia una campagna su Proof Press
            </h2>
            <p
              className="text-base text-[#1a1a1a]/65 mb-8 max-w-xl"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
            >
              Compila il form e ti risponderemo entro 24 ore con una proposta personalizzata.
            </p>

            {submitted ? (
              <div
                className="py-10 text-center border"
                style={{ borderColor: ACCENT, background: ACCENT_LIGHT }}
              >
                <p
                  className="text-2xl font-bold text-[#1a1a1a] mb-2"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  Richiesta ricevuta.
                </p>
                <p
                  className="text-sm text-[#1a1a1a]/65"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                >
                  Ti contatteremo entro 24 ore all'indirizzo email fornito.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-0">
                {[
                  { key: "company", label: "Azienda *", placeholder: "Nome dell'azienda" },
                  { key: "name", label: "Nome e cognome *", placeholder: "Il tuo nome" },
                  { key: "email", label: "Email *", placeholder: "email@azienda.com" },
                  { key: "format", label: "Formato di interesse", placeholder: "es. Banner Hero, Newsletter..." },
                  { key: "budget", label: "Budget indicativo", placeholder: "es. €500–€2.000/mese" }
                ].map((field, i) => (
                  <div
                    key={field.key}
                    className="py-4 px-0"
                    style={{
                      borderBottom: "1px solid rgba(26,26,46,0.10)",
                      paddingRight: i % 2 === 0 ? "2rem" : "0",
                      paddingLeft: i % 2 === 1 ? "2rem" : "0",
                      borderLeft: i % 2 === 1 ? "1px solid rgba(26,26,46,0.10)" : "none",
                    }}
                  >
                    <label
                      className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[#1a1a1a]/50"
                      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.key === "email" ? "email" : "text"}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full bg-transparent border-0 border-b text-sm outline-none pb-1 text-[#1a1a1a] placeholder-[#1a1a1a]/30"
                      style={{
                        borderColor: "rgba(26,26,46,0.20)",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
                      }}
                    />
                  </div>
                ))}
                <div
                  className="py-4 md:col-span-2"
                  style={{ borderBottom: "1px solid rgba(26,26,46,0.10)" }}
                >
                  <label
                    className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-[#1a1a1a]/50"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Messaggio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Descrivi brevemente il tuo obiettivo di comunicazione..."
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full bg-transparent border-0 text-sm outline-none resize-none text-[#1a1a1a] placeholder-[#1a1a1a]/30"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
                  />
                </div>
                <div className="pt-6 md:col-span-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-80 disabled:opacity-50"
                    style={{
                      background: INK,
                      color: "#fff",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {sending ? "Invio in corso..." : "Invia richiesta →"}
                  </button>
                  <p
                    className="mt-3 text-xs text-[#1a1a1a]/40"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                  >
                    Oppure scrivi direttamente a{" "}
                    <a href="mailto:info@ideasmart.biz" style={{ color: ACCENT }}>
                      info@ideasmart.biz
                    </a>
                  </p>
                </div>
              </form>
            )}
          </section>

        </main>

        {/* ── FOOTER ── */}
        <footer
          className="border-t py-8"
          style={{ borderColor: "rgba(26,26,46,0.15)", background: "#faf8f3" }}
        >
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
              style={{ color: "rgba(26,26,46,0.35)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Proof Press — Advertising
            </p>
            <p
              className="text-xs"
              style={{ color: "rgba(26,26,46,0.25)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              © {new Date().getFullYear()} Proof Press · Tutti i diritti riservati ·{" "}
              <a href="/" style={{ color: "rgba(26,26,46,0.4)" }}>
                ideasmart.biz
              </a>
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
