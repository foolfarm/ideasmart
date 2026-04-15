/**
 * Pagina /pubblicita — Listino Pubblicitario ProofPress 2026
 * Design: Apple-style · Sfondo bianco ghiaccio · Palette monocromatica
 * Form di contatto integrato via tRPC (no mailto)
 */
import { useState } from "react";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";
import LeftSidebar from "@/components/LeftSidebar";
import { trpc } from "@/lib/trpc";

// ─── Design tokens Apple-style ────────────────────────────────────────────────
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

const BG        = "#f5f5f7";
const BG_CARD   = "#ffffff";
const BG_DARK   = "#1d1d1f";
const TEXT_PRI  = "#1d1d1f";
const TEXT_SEC  = "#6e6e73";
const TEXT_TER  = "#aeaeb2";
const BORDER    = "#d2d2d7";
const BORDER_LT = "#e8e8ed";

// ─── Componenti base ──────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block", background: BG_DARK, color: "#fff",
      fontSize: "10px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px",
      fontFamily: SF, letterSpacing: "0.3px",
    }}>{label}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", color: TEXT_SEC, fontFamily: SF, marginBottom: "12px",
    }}>{children}</p>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: BORDER_LT }} />;
}

// ─── Form di contatto ─────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  "Meno di € 500 / mese",
  "€ 500 – 2.000 / mese",
  "€ 2.000 – 5.000 / mese",
  "Oltre € 5.000 / mese",
  "Campagna una tantum",
];

const PACCHETTO_OPTIONS = [
  "Spazio sito web (W1–W4)",
  "Newsletter (NL-1 – NL-5)",
  "Pacchetto Starter — Visibility",
  "Pacchetto Growth — Domination",
  "Pacchetto Enterprise — Takeover",
  "Non lo so ancora, voglio un preventivo",
];

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%", boxSizing: "border-box",
    padding: "12px 14px", borderRadius: "10px",
    border: `1.5px solid ${focused ? BG_DARK : BORDER}`,
    background: BG_CARD, color: TEXT_PRI,
    fontSize: "15px", fontFamily: SF,
    outline: "none", transition: "border-color 0.15s",
  };
}

function ContactForm({ defaultPacchetto = "" }: { defaultPacchetto?: string }) {
  const [form, setForm] = useState({
    nome: "", email: "", azienda: "",
    budget: "", brief: "",
    pacchetto: defaultPacchetto,
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const mutation = trpc.pubblicita.sendContact.useMutation({
    onSuccess: () => setSent(true),
    onError: (e) => setError(e.message || "Errore. Riprova o scrivi a pubblicita@proofpress.ai"),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) {
      setError("Nome e email sono obbligatori.");
      return;
    }
    mutation.mutate({
      nome: form.nome.trim(),
      email: form.email.trim(),
      azienda: form.azienda.trim() || undefined,
      budget: form.budget || undefined,
      brief: form.brief.trim() || undefined,
      pacchetto: form.pacchetto || undefined,
    });
  }

  if (sent) {
    return (
      <div style={{
        background: BG_CARD, border: `1px solid ${BORDER_LT}`,
        borderRadius: "18px", padding: "48px 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>✓</div>
        <h3 style={{ fontFamily: SF_DISPLAY, fontSize: "22px", fontWeight: 700, color: TEXT_PRI, marginBottom: "10px" }}>
          Messaggio inviato
        </h3>
        <p style={{ fontSize: "15px", color: TEXT_SEC, lineHeight: 1.6 }}>
          Il team ProofPress ti risponderà entro <strong>24 ore lavorative</strong>.<br />
          Riceverai una conferma all'indirizzo <strong>{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>
            Nome *
          </label>
          <input
            name="nome" value={form.nome} onChange={handleChange}
            onFocus={() => setFocused("nome")} onBlur={() => setFocused(null)}
            placeholder="Mario Rossi"
            style={inputStyle(focused === "nome")}
            required
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>
            Email *
          </label>
          <input
            name="email" type="email" value={form.email} onChange={handleChange}
            onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
            placeholder="mario@azienda.it"
            style={inputStyle(focused === "email")}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>
          Azienda
        </label>
        <input
          name="azienda" value={form.azienda} onChange={handleChange}
          onFocus={() => setFocused("azienda")} onBlur={() => setFocused(null)}
          placeholder="Nome azienda o brand"
          style={inputStyle(focused === "azienda")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>
            Pacchetto di interesse
          </label>
          <select
            name="pacchetto" value={form.pacchetto} onChange={handleChange}
            onFocus={() => setFocused("pacchetto")} onBlur={() => setFocused(null)}
            style={{ ...inputStyle(focused === "pacchetto"), appearance: "none" as const }}
          >
            <option value="">Seleziona...</option>
            {PACCHETTO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>
            Budget mensile
          </label>
          <select
            name="budget" value={form.budget} onChange={handleChange}
            onFocus={() => setFocused("budget")} onBlur={() => setFocused(null)}
            style={{ ...inputStyle(focused === "budget"), appearance: "none" as const }}
          >
            <option value="">Seleziona...</option>
            {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>
          Brief (opzionale)
        </label>
        <textarea
          name="brief" value={form.brief} onChange={handleChange}
          onFocus={() => setFocused("brief")} onBlur={() => setFocused(null)}
          placeholder="Descrivi brevemente il prodotto o servizio da promuovere, il target e gli obiettivi della campagna..."
          rows={4}
          style={{ ...inputStyle(focused === "brief"), resize: "vertical" as const, lineHeight: 1.6 }}
        />
      </div>

      {error && (
        <div style={{
          background: "#fff2f2", border: "1px solid #ffd0d0", borderRadius: "10px",
          padding: "12px 16px", marginBottom: "16px",
          fontSize: "14px", color: "#c00", lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        style={{
          width: "100%", background: BG_DARK, color: "#fff",
          border: "none", padding: "15px 24px", borderRadius: "980px",
          fontWeight: 600, fontSize: "16px", fontFamily: SF,
          cursor: mutation.isPending ? "not-allowed" : "pointer",
          opacity: mutation.isPending ? 0.7 : 1,
          transition: "opacity 0.15s",
          letterSpacing: "-0.01em",
        }}
      >
        {mutation.isPending ? "Invio in corso..." : "Invia richiesta"}
      </button>

      <p style={{ fontSize: "12px", color: TEXT_TER, textAlign: "center", marginTop: "12px" }}>
        Il team risponde entro 24 ore lavorative · pubblicita@proofpress.ai
      </p>
    </form>
  );
}

// ─── Dati ─────────────────────────────────────────────────────────────────────

const METRICS = [
  { value: "100K+", label: "Visite / mese" },
  { value: "6.651", label: "Iscritti newsletter" },
  { value: "45%",   label: "Open rate" },
  { value: "~3.000",label: "Aperture per invio" },
  { value: "3×",    label: "Invii a settimana" },
];

const WEB_SLOTS = [
  { code: "W1", name: "Manchette Header Sinistra", desc: "A sinistra del logo, above the fold, tutte le pagine", format: "300 × 250 px", prices: { giorno: "75", settimana: "350", mese: "1.200", trimestre: "3.000" } },
  { code: "W2", name: "Manchette Header Destra", desc: "A destra del logo, above the fold, tutte le pagine", format: "300 × 250 px", prices: { giorno: "75", settimana: "350", mese: "1.200", trimestre: "3.000" } },
  { code: "W1+2", name: "Doppia Manchette", desc: "Header domination — massima brand awareness", format: "2 × 300 × 250 px", prices: { giorno: "120", settimana: "580", mese: "2.000", trimestre: "5.000" } },
  { code: "W3", name: "Sidebar Destra", desc: "Fissa durante lo scroll, tutte le pagine", format: "300 × 250 px", prices: { giorno: "50", settimana: "250", mese: "900", trimestre: "2.200" } },
  { code: "W4", name: "Banner Orizzontale", desc: "Full-width sotto la sezione Research, alto impatto", format: "728 × 90 / 970 × 250 px", prices: { giorno: "80", settimana: "400", mese: "1.400", trimestre: "3.500" } },
];

const NL_SLOTS = [
  { code: "NL-1", name: "Sponsor of the Day", desc: "Prima posizione — logo, headline, testo, CTA. Prima cosa che il lettore vede.", format: "Logo 200 × 50 + HTML", prices: { singolo: "350", quattro: "1.200", dodici: "3.200" } },
  { code: "NL-2", name: "Consigliato", desc: "Product placement — immagine prodotto, titolo, prezzo, link. Stile raccomandazione editoriale.", format: "Immagine 200 × 200 + HTML", prices: { singolo: "250", quattro: "850", dodici: "2.200" } },
  { code: "NL-3", name: "Sponsor Secondario", desc: "Posizione centrale — logo, testo breve, link. Tra Research e Dealroom.", format: "Logo 200 × 50 + HTML", prices: { singolo: "180", quattro: "620", dodici: "1.600" } },
  { code: "NL-4", name: "Articolo Sponsorizzato", desc: "Contenuto nativo scritto dal team ProofPress su brief. Pubblicato sul sito e in newsletter.", format: "500 – 800 parole + immagine", prices: { singolo: "600", quattro: "2.000", dodici: "5.000" } },
  { code: "NL-5", name: "Footer Sponsor", desc: "Ultima posizione — banner o logo con link. Brand awareness continuativa a basso costo.", format: "600 × 100 px o logo", prices: { singolo: "120", quattro: "400", dodici: "1.000" } },
];

const PACKAGES = [
  {
    tier: "Starter", subtitle: "Visibility", price: "1.800", period: "al mese",
    items: ["1 Manchette header (W1 o W2)", "4 invii NL-3 Sponsor Secondario", "4 invii NL-5 Footer Sponsor", "Report settimanale"],
    saving: "Risparmio di € 520 rispetto ai prezzi singoli", featured: false, badge: "",
    pacchetto: "Pacchetto Starter — Visibility",
  },
  {
    tier: "Growth", subtitle: "Domination", price: "4.200", period: "al mese",
    items: ["Doppia Manchette (W1 + W2)", "Banner Orizzontale (W4)", "4 invii NL-1 Sponsor of the Day", "4 invii NL-2 Consigliato", "1 Articolo Sponsorizzato NL-4", "Report mensile + call di ottimizzazione"],
    saving: "Risparmio di € 1.800 rispetto ai prezzi singoli", featured: true, badge: "Più scelto",
    pacchetto: "Pacchetto Growth — Domination",
  },
  {
    tier: "Enterprise", subtitle: "Takeover", price: "6.500", period: "al mese",
    items: ["Tutti gli spazi sito (W1 – W4)", "12 invii NL-1 Sponsor of the Day", "12 invii NL-2 Consigliato", "12 invii NL-3 Sponsor Secondario", "2 Articoli Sponsorizzati NL-4", "12 invii NL-5 Footer Sponsor", "Priorità esclusiva nella rotazione", "Report bisettimanale + call dedicata"],
    saving: "Risparmio di € 4.200 rispetto ai prezzi singoli", featured: false, badge: "",
    pacchetto: "Pacchetto Enterprise — Takeover",
  },
];

const CONDITIONS = [
  ["Pagamento", "Esclusivamente tramite Stripe — carta di credito, bonifico SEPA, addebito diretto. Pagamento anticipato per acquisti singoli. Fatturazione a 30 giorni per pacchetti trimestrali."],
  ["Supporto creativo", "Il team ProofPress affianca il cliente nella realizzazione di tutte le creatività: banner, loghi, testi, immagini prodotto. Incluso nel prezzo, senza costi aggiuntivi."],
  ["Processo", "Contatta il team → definizione campagna → produzione creatività → approvazione → pagamento → messa online entro 48 ore lavorative."],
  ["Formati sito", "JPG, PNG, GIF animata, WebP — massimo 500 KB. Newsletter: logo 200 × 50 (PNG/SVG), immagine prodotto 200 × 200 (JPG/PNG), banner footer 600 × 100."],
  ["Rotazione sito", "Cambio ogni 15 secondi con transizione fade. Distribuzione pesata per priorità. Newsletter: selezione manuale per invio."],
  ["Trasparenza", "Label Pubblicità / Sponsor sempre visibile su ogni spazio, come previsto dalla normativa italiana."],
  ["Tracking", "Impression, click e CTR per spazio — dashboard accessibile al cliente. Newsletter: aperture, click, CTR per invio, disponibili entro 48 ore."],
  ["Sconti durata", "–10% per contratti di 6 mesi o più · –15% per contratti di 12 mesi o più."],
  ["Rimborsi", "Rimborso integrale se il banner non viene pubblicato entro 48 ore dal pagamento. Nessun rimborso a campagna avviata."],
];

// ─── Pagina principale ────────────────────────────────────────────────────────

export default function PubblicitaPage() {
  const [selectedPacchetto, setSelectedPacchetto] = useState("");
  const [showForm, setShowForm] = useState(false);

  function scrollToForm(pacchetto = "") {
    setSelectedPacchetto(pacchetto);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      <SEOHead
        title="Pubblicità — Listino 2026 | ProofPress Magazine"
        description="Raggiungi 100.000+ lettori al mese su proofpress.ai e 6.651 iscritti alla newsletter. 9 spazi pubblicitari premium."
        canonical="https://proofpress.ai/pubblicita"
        ogSiteName="ProofPress"
      />
      <div className="flex min-h-screen" style={{ background: BG }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SharedPageHeader />

          <main style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px 96px", fontFamily: SF }}>

            {/* ── BANNER EASTER ────────────────────────────────────────────── */}
            <div style={{
              background: "linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 100%)",
              borderRadius: "16px", padding: "20px 28px", marginBottom: "40px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorazione pasquale */}
              <div style={{ position: "absolute", top: "-20px", right: "120px", fontSize: "60px", opacity: 0.08, userSelect: "none" }}>🐣</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{
                  background: "#ff5500", color: "#fff", fontWeight: 800,
                  fontSize: "13px", padding: "6px 14px", borderRadius: "980px",
                  letterSpacing: "0.02em", fontFamily: SF, flexShrink: 0,
                }}>🐣 EASTER PROMO</div>
                <div>
                  <div style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "20px", color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    Sconto 30% su tutti gli spazi
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "3px" }}>
                    Usa il coupon <span style={{ fontWeight: 700, color: "#ff5500", fontFamily: "'SF Mono', 'JetBrains Mono', monospace", background: "rgba(255,85,0,0.15)", padding: "2px 8px", borderRadius: "6px" }}>Easter</span> al momento del contatto · Valido fino al 30 aprile 2026
                  </div>
                </div>
              </div>
              <button
                onClick={() => scrollToForm()}
                style={{
                  background: "#ff5500", color: "#fff", border: "none",
                  padding: "12px 24px", borderRadius: "980px",
                  fontWeight: 700, fontSize: "14px", cursor: "pointer",
                  fontFamily: SF, letterSpacing: "-0.01em", flexShrink: 0,
                }}
              >
                Approfitta ora
              </button>
            </div>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Listino Pubblicitario 2026 · Tutti i prezzi IVA esclusa</SectionLabel>
              <h1 style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: TEXT_PRI, marginBottom: "20px" }}>
                Pubblicizza su ProofPress.
              </h1>
              <p style={{ fontSize: "clamp(17px, 2.5vw, 21px)", color: TEXT_SEC, lineHeight: 1.55, maxWidth: "620px", marginBottom: "36px" }}>
                Raggiungi decision maker, founder e manager dell'innovazione italiana.
                9 spazi premium tra sito web e newsletter quotidiana.
              </p>
              <button
                onClick={() => scrollToForm()}
                style={{ display: "inline-block", background: BG_DARK, color: "#fff", padding: "14px 28px", borderRadius: "980px", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}
              >
                Richiedi un preventivo
              </button>
            </div>

            {/* ── METRICHE ─────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Audience</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1px", background: BORDER_LT, border: `1px solid ${BORDER_LT}`, borderRadius: "18px", overflow: "hidden" }}>
                {METRICS.map((m) => (
                  <div key={m.label} style={{ background: BG_CARD, padding: "28px 20px" }}>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: TEXT_PRI, letterSpacing: "-0.02em", marginBottom: "6px" }}>{m.value}</div>
                    <div style={{ fontSize: "13px", color: TEXT_SEC, lineHeight: 1.4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SISTEMA UNIFICATO ───────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Come funziona</SectionLabel>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: BG_DARK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="white" strokeWidth="1.5"/><path d="M6 8h8M6 11h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "17px", color: TEXT_PRI, marginBottom: "4px" }}>Sistema unificato Sito + Newsletter</div>
                    <div style={{ fontSize: "14px", color: TEXT_SEC, lineHeight: 1.5 }}>
                      Tutti gli spazi pubblicitari — sito web e newsletter — pescano dallo <strong>stesso repository di banner</strong>. Il team carica le creatività una volta, il sistema distribuisce ovunque. Rotazione automatica sul sito, selezione intelligente per la newsletter.
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingTop: "16px", borderTop: `1px solid ${BORDER_LT}` }}>
                  {[
                    { icon: "📊", label: "Admin carica banner" },
                    { icon: "→", label: null },
                    { icon: "🗂️", label: "Repository unico" },
                    { icon: "→", label: null },
                    { icon: "🖥️", label: "Sito (rotazione)" },
                    { icon: "+", label: null },
                    { icon: "✉️", label: "Newsletter (scheduling)" },
                  ].map((step, i) =>
                    step.label === null ? (
                      <span key={i} style={{ fontSize: "16px", color: TEXT_TER, fontWeight: 300 }}>{step.icon}</span>
                    ) : (
                      <div key={i} style={{ background: i === 0 ? BG_DARK : BG, border: `1px solid ${i === 0 ? BG_DARK : BORDER_LT}`, borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: 600, color: i === 0 ? "#fff" : TEXT_PRI, display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{step.icon}</span> {step.label}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* ── MAPPA VISIVA SPAZI ──────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Mappa degli spazi</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>Dove appare il tuo brand</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "32px" }}>Visualizzazione delle posizioni pubblicitarie disponibili su sito e newsletter.</p>

              {/* Due colonne: Sito + Newsletter */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                {/* SITO WEB */}
                <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "24px", overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT_SEC, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>
                    Sito Web — 4 spazi in rotazione
                  </div>
                  {/* Griglia mockup homepage */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gridTemplateRows: "auto auto auto", gap: "6px" }}>
                    {/* Riga 1: W1 | Logo | W2 */}
                    <div style={{ border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "12px 8px", textAlign: "center", position: "relative", minHeight: "80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W1</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Manchette<br/>SX</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER, marginTop: "2px" }}>300×250</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €75/g</div>
                    </div>
                    <div style={{ background: BG_DARK, borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "90px" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "13px", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>ProofPress<br/><span style={{ fontSize: "8px", fontWeight: 400, opacity: 0.5 }}>MAGAZINE</span></div>
                    </div>
                    <div style={{ border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "12px 8px", textAlign: "center", position: "relative", minHeight: "80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W2</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Manchette<br/>DX</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER, marginTop: "2px" }}>300×250</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €75/g</div>
                    </div>
                    {/* Riga 2: Area editoriale | W3 */}
                    <div style={{ gridColumn: "1 / 3", background: BG, borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60px" }}>
                      <span style={{ fontSize: "11px", color: TEXT_TER }}>← Editoriale →</span>
                    </div>
                    <div style={{ border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "10px 8px", textAlign: "center", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W3</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Sidebar<br/>DX</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER, marginTop: "2px" }}>300×250</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €50/g</div>
                    </div>
                    {/* Riga 3: W4 full width */}
                    <div style={{ gridColumn: "1 / 4", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "14px", textAlign: "center", position: "relative" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W4</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Banner Orizzontale · 728×90 / 970×250</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €80/g</div>
                    </div>
                  </div>
                </div>

                {/* NEWSLETTER */}
                <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "24px", overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT_SEC, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3l5 4 5-4M1 3v7h10V3H1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    Newsletter Daily — 5 spazi vendibili
                  </div>
                  {/* Mockup newsletter */}
                  <div style={{ border: `1px solid ${BORDER_LT}`, borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
                    {/* Header newsletter */}
                    <div style={{ padding: "14px 16px", textAlign: "center", borderBottom: `1px solid ${BORDER_LT}` }}>
                      <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "18px", color: TEXT_PRI, marginBottom: "2px" }}>ProofPress</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER }}>Per chi vuole capire l’innovazione prima degli altri</div>
                      <div style={{ fontSize: "9px", color: TEXT_TER, marginTop: "2px" }}>N° 30 · <strong>6.651 lettori</strong></div>
                    </div>
                    {/* NL-1 */}
                    <div style={{ margin: "8px", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.05)", padding: "10px 12px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>NL-1 · IN VENDITA</span>
                        <span style={{ background: BG_DARK, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>€350/invio</span>
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_PRI, textAlign: "center" }}>⭐ SPONSOR OF THE DAY</div>
                      <div style={{ fontSize: "9px", color: TEXT_SEC, textAlign: "center", marginTop: "2px" }}>Logo + headline + testo (80 parole) + CTA · Top placement</div>
                    </div>
                    {/* Contenuto editoriale */}
                    <div style={{ padding: "8px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", color: TEXT_TER, textTransform: "uppercase", marginBottom: "6px" }}>Breaking + Startup</div>
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", marginBottom: "4px" }} />
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", marginBottom: "4px", width: "80%" }} />
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", width: "60%" }} />
                    </div>
                    {/* NL-2 */}
                    <div style={{ margin: "8px", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.05)", padding: "10px 12px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>NL-2 · IN VENDITA</span>
                        <span style={{ background: BG_DARK, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>€250/invio</span>
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_PRI, textAlign: "center" }}>🛒 CONSIGLIATO</div>
                      <div style={{ fontSize: "9px", color: TEXT_SEC, textAlign: "center", marginTop: "2px" }}>Prodotto/servizio consigliato · Immagine + titolo + prezzo + link</div>
                    </div>
                    {/* Research */}
                    <div style={{ padding: "8px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", color: TEXT_TER, textTransform: "uppercase", marginBottom: "6px" }}>Research del giorno</div>
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", marginBottom: "4px" }} />
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", width: "70%" }} />
                    </div>
                    {/* NL-3 */}
                    <div style={{ margin: "8px", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.05)", padding: "10px 12px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>NL-3 · IN VENDITA</span>
                        <span style={{ background: BG_DARK, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>€180/invio</span>
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_PRI, textAlign: "center" }}>🏷️ SPONSOR SECONDARIO</div>
                      <div style={{ fontSize: "9px", color: TEXT_SEC, textAlign: "center", marginTop: "2px" }}>Logo + testo breve + link · Mid placement</div>
                    </div>
                    {/* Footer newsletter */}
                    <div style={{ padding: "8px 12px", borderTop: `1px solid ${BORDER_LT}`, marginTop: "4px" }}>
                      <div style={{ fontSize: "9px", color: TEXT_TER, textAlign: "center" }}>AI News · Dealroom · Startup</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── SPAZI SITO WEB ────────────────────────────────────────────────── */}        <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Spazi Sito Web · proofpress.ai</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>4 posizioni premium</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>Visibili su tutte le pagine del sito, con rotazione ogni 15 secondi.</p>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 90px 90px 90px", padding: "12px 24px", background: BG, borderBottom: `1px solid ${BORDER_LT}` }}>
                  {["Posizione", "Formato", "1 Giorno", "1 Settimana", "1 Mese", "Trimestre"].map((h, i) => (
                    <div key={h} style={{ fontSize: "11px", fontWeight: 600, color: TEXT_SEC, textAlign: i === 0 ? "left" : "right", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {WEB_SLOTS.map((row, i) => (
                  <div key={row.code}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 90px 90px 90px 90px", padding: "20px 24px", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <Tag label={row.code} />
                          <span style={{ fontWeight: 600, fontSize: "15px", color: TEXT_PRI }}>{row.name}</span>
                        </div>
                        <p style={{ fontSize: "13px", color: TEXT_SEC, margin: 0 }}>{row.desc}</p>
                      </div>
                      <div style={{ fontSize: "12px", color: TEXT_TER, textAlign: "right" }}>{row.format}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.giorno}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.settimana}</div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.mese}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.trimestre}</div>
                    </div>
                    {i < WEB_SLOTS.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
            </div>

            {/* ── SPAZI NEWSLETTER ─────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Spazi Newsletter Daily</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>5 posizioni nella newsletter</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>3 invii a settimana · 6.651 iscritti · 45% open rate · circa 3.000 aperture per invio.</p>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 100px 100px", padding: "12px 24px", background: BG, borderBottom: `1px solid ${BORDER_LT}` }}>
                  {["Posizione", "Formato", "Singolo invio", "4 invii", "12 invii"].map((h, i) => (
                    <div key={h} style={{ fontSize: "11px", fontWeight: 600, color: TEXT_SEC, textAlign: i === 0 ? "left" : "right", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {NL_SLOTS.map((row, i) => (
                  <div key={row.code}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 100px 100px", padding: "20px 24px", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <Tag label={row.code} />
                          <span style={{ fontWeight: 600, fontSize: "15px", color: TEXT_PRI }}>{row.name}</span>
                        </div>
                        <p style={{ fontSize: "13px", color: TEXT_SEC, margin: 0 }}>{row.desc}</p>
                      </div>
                      <div style={{ fontSize: "12px", color: TEXT_TER, textAlign: "right" }}>{row.format}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.singolo}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.quattro}</div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.dodici}</div>
                    </div>
                    {i < NL_SLOTS.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
            </div>

            {/* ── PACCHETTI ────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Pacchetti combinati · Sito + Newsletter</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>Massimizza reach e frequenza</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "32px" }}>Tutti i pacchetti includono supporto creativo completo del team ProofPress.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                {PACKAGES.map((pkg) => (
                  <div key={pkg.tier} style={{ background: pkg.featured ? BG_DARK : BG_CARD, border: `1px solid ${pkg.featured ? BG_DARK : BORDER_LT}`, borderRadius: "18px", padding: "32px 28px", position: "relative", color: pkg.featured ? "#fff" : TEXT_PRI }}>
                    {pkg.featured && pkg.badge && (
                      <div style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "11px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>{pkg.badge}</div>
                    )}
                    <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: pkg.featured ? "rgba(255,255,255,0.5)" : TEXT_TER, marginBottom: "8px" }}>{pkg.tier}</div>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "16px" }}>{pkg.subtitle}</div>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "40px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "4px" }}>€ {pkg.price}</div>
                    <div style={{ fontSize: "14px", color: pkg.featured ? "rgba(255,255,255,0.5)" : TEXT_SEC, marginBottom: "24px" }}>{pkg.period}</div>
                    <div style={{ height: "1px", background: pkg.featured ? "rgba(255,255,255,0.12)" : BORDER_LT, marginBottom: "24px" }} />
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {pkg.items.map((item, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                            <circle cx="8" cy="8" r="8" fill={pkg.featured ? "rgba(255,255,255,0.15)" : "#e8e8ed"} />
                            <path d="M5 8l2 2 4-4" stroke={pkg.featured ? "#fff" : TEXT_PRI} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ color: pkg.featured ? "rgba(255,255,255,0.8)" : TEXT_SEC, lineHeight: 1.5 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontSize: "12px", color: pkg.featured ? "rgba(255,255,255,0.45)" : TEXT_TER, marginBottom: "20px", lineHeight: 1.5 }}>{pkg.saving}</div>
                    <button
                      onClick={() => scrollToForm(pkg.pacchetto)}
                      style={{ display: "block", width: "100%", textAlign: "center", background: pkg.featured ? "#fff" : BG_DARK, color: pkg.featured ? BG_DARK : "#fff", padding: "13px 20px", borderRadius: "980px", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}
                    >
                      Contattaci
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CONDIZIONI ───────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Condizioni operative</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "28px" }}>Come funziona</h2>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                {CONDITIONS.map(([label, text], i) => (
                  <div key={label}>
                    <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "160px 1fr", gap: "16px", alignItems: "start" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: TEXT_PRI }}>{label}</div>
                      <div style={{ fontSize: "14px", color: TEXT_SEC, lineHeight: 1.6 }}>{text}</div>
                    </div>
                    {i < CONDITIONS.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
            </div>

            {/* ── FORM DI CONTATTO ─────────────────────────────────────────── */}
            <div id="contact-form" style={{ marginBottom: "0" }}>
              <SectionLabel>Parliamo della tua campagna</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>
                Richiedi un preventivo
              </h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "32px", lineHeight: 1.6 }}>
                Compila il form. Il team risponde entro 24 ore lavorative e ti affianca dalla strategia alla messa online.
              </p>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "36px 32px" }}>
                <ContactForm defaultPacchetto={selectedPacchetto} key={selectedPacchetto} />
              </div>
            </div>

          </main>
          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
