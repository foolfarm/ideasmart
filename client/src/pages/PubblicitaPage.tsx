/**
 * Pagina /pubblicita — Media Kit ProofPress 2026
 * Design: Apple-style · Sfondo bianco ghiaccio · Palette monocromatica
 * Miglioramenti: Audience Profile, Logo Wall Beta, CPM equivalente,
 *   Audience Guarantee, Brand Safety, Branded Content separato,
 *   Promo Primavera 2026, allineamento "9 spazi", tracking detail
 */
import { useState } from "react";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";
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
const ACCENT    = "#00c896";

// ─── Componenti base ──────────────────────────────────────────────────────────

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: "inline-block",
      background: color || BG_DARK,
      color: "#fff",
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
  "Branded Content / Articolo Sponsorizzato",
  "Pacchetto Visibility",
  "Pacchetto Domination",
  "Pacchetto Takeover",
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
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>Nome *</label>
          <input name="nome" value={form.nome} onChange={handleChange}
            onFocus={() => setFocused("nome")} onBlur={() => setFocused(null)}
            placeholder="Mario Rossi" style={inputStyle(focused === "nome")} required />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
            placeholder="mario@azienda.it" style={inputStyle(focused === "email")} required />
        </div>
      </div>
      <div style={{ marginBottom: "14px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>Azienda</label>
        <input name="azienda" value={form.azienda} onChange={handleChange}
          onFocus={() => setFocused("azienda")} onBlur={() => setFocused(null)}
          placeholder="Nome azienda o brand" style={inputStyle(focused === "azienda")} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>Pacchetto di interesse</label>
          <select name="pacchetto" value={form.pacchetto} onChange={handleChange}
            onFocus={() => setFocused("pacchetto")} onBlur={() => setFocused(null)}
            style={{ ...inputStyle(focused === "pacchetto"), appearance: "none" as const }}>
            <option value="">Seleziona...</option>
            {PACCHETTO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>Budget mensile</label>
          <select name="budget" value={form.budget} onChange={handleChange}
            onFocus={() => setFocused("budget")} onBlur={() => setFocused(null)}
            style={{ ...inputStyle(focused === "budget"), appearance: "none" as const }}>
            <option value="">Seleziona...</option>
            {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: TEXT_PRI, marginBottom: "6px" }}>Brief (opzionale)</label>
        <textarea name="brief" value={form.brief} onChange={handleChange}
          onFocus={() => setFocused("brief")} onBlur={() => setFocused(null)}
          placeholder="Descrivi brevemente il prodotto o servizio da promuovere, il target e gli obiettivi della campagna..."
          rows={4} style={{ ...inputStyle(focused === "brief"), resize: "vertical" as const, lineHeight: 1.6 }} />
      </div>
      {error && (
        <div style={{ background: "#fff2f2", border: "1px solid #ffd0d0", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "14px", color: "#c00", lineHeight: 1.5 }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={mutation.isPending} style={{
        width: "100%", background: BG_DARK, color: "#fff", border: "none",
        padding: "15px 24px", borderRadius: "980px", fontWeight: 600, fontSize: "16px",
        fontFamily: SF, cursor: mutation.isPending ? "not-allowed" : "pointer",
        opacity: mutation.isPending ? 0.7 : 1, transition: "opacity 0.15s", letterSpacing: "-0.01em",
      }}>
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
  { value: "~3.000", label: "Aperture per invio" },
  { value: "3×",    label: "Invii a settimana" },
];

// Audience Profile dettagliato
const AUDIENCE_ROLES = [
  { role: "CEO / Founder / Co-founder", pct: "34%" },
  { role: "Head of Innovation / CTO", pct: "18%" },
  { role: "Marketing Director / CMO", pct: "14%" },
  { role: "Investor / VC / Business Angel", pct: "12%" },
  { role: "Product Manager / Strategy", pct: "10%" },
  { role: "Altri ruoli C-level e senior", pct: "12%" },
];

const AUDIENCE_SECTORS = [
  { sector: "Tech & Software", pct: "28%" },
  { sector: "Finance & VC", pct: "21%" },
  { sector: "Pharma & Digital Health", pct: "13%" },
  { sector: "Energy & CleanTech", pct: "10%" },
  { sector: "Retail & E-commerce", pct: "9%" },
  { sector: "Altri settori", pct: "19%" },
];

const AUDIENCE_GEO = [
  { city: "Milano", pct: "38%" },
  { city: "Roma", pct: "19%" },
  { city: "Torino", pct: "8%" },
  { city: "Bologna / Emilia", pct: "7%" },
  { city: "Resto d'Italia", pct: "28%" },
];

// Spazi sito web (4 posizioni + combo)
const WEB_SLOTS = [
  { code: "W1", name: "Manchette Header Sinistra", desc: "A sinistra del logo, above the fold, tutte le pagine", format: "300 × 250 px", prices: { giorno: "75", settimana: "350", mese: "1.200", trimestre: "3.000" }, cpm: "€ 12" },
  { code: "W2", name: "Manchette Header Destra", desc: "A destra del logo, above the fold, tutte le pagine", format: "300 × 250 px", prices: { giorno: "75", settimana: "350", mese: "1.200", trimestre: "3.000" }, cpm: "€ 12" },
  { code: "W1+2", name: "Doppia Manchette", desc: "Header domination — massima brand awareness (combo W1 + W2)", format: "2 × 300 × 250 px", prices: { giorno: "120", settimana: "580", mese: "2.000", trimestre: "5.000" }, cpm: "€ 10" },
  { code: "W3", name: "Sidebar Destra", desc: "Fissa durante lo scroll, tutte le pagine", format: "300 × 250 px", prices: { giorno: "50", settimana: "250", mese: "900", trimestre: "2.200" }, cpm: "€ 9" },
  { code: "W4", name: "Banner Orizzontale", desc: "Full-width sotto la sezione Research, alto impatto. Desktop: 970×250 (billboard). Mobile/tablet: 728×90 (leaderboard).", format: "970×250 (desktop) / 728×90 (mobile)", prices: { giorno: "80", settimana: "400", mese: "1.400", trimestre: "3.500" }, cpm: "€ 14" },
];

// Spazi newsletter (4 banner + 1 branded content separato)
const NL_SLOTS = [
  { code: "NL-1", name: "Sponsor of the Day", desc: "Prima posizione — logo, headline, testo, CTA. Prima cosa che il lettore vede.", format: "Logo 200 × 50 + HTML", prices: { singolo: "350", quattro: "1.200", dodici: "3.200" }, cpm: "€ 117" },
  { code: "NL-2", name: "Consigliato", desc: "Product placement — immagine prodotto, titolo, prezzo, link. Stile raccomandazione editoriale.", format: "Immagine 200 × 200 + HTML", prices: { singolo: "250", quattro: "850", dodici: "2.200" }, cpm: "€ 83" },
  { code: "NL-3", name: "Sponsor Secondario", desc: "Posizione centrale — logo, testo breve, link. Tra Research e Dealroom.", format: "Logo 200 × 50 + HTML", prices: { singolo: "180", quattro: "620", dodici: "1.600" }, cpm: "€ 60" },
  { code: "NL-5", name: "Footer Sponsor", desc: "Ultima posizione — banner o logo con link. Brand awareness continuativa a basso costo.", format: "600 × 100 px o logo", prices: { singolo: "120", quattro: "400", dodici: "1.000" }, cpm: "€ 40" },
];

const PACKAGES = [
  {
    tier: "Visibility", price: "1.800", period: "al mese",
    items: ["1 Manchette header (W1 o W2)", "4 invii NL-3 Sponsor Secondario", "4 invii NL-5 Footer Sponsor", "Report settimanale"],
    saving: "Risparmio di € 520 rispetto ai prezzi singoli", featured: false, badge: "",
    pacchetto: "Pacchetto Visibility",
  },
  {
    tier: "Domination", price: "4.200", period: "al mese",
    items: ["Doppia Manchette (W1 + W2)", "Banner Orizzontale (W4)", "4 invii NL-1 Sponsor of the Day", "4 invii NL-2 Consigliato", "Report mensile + call di ottimizzazione"],
    saving: "Risparmio di € 1.800 rispetto ai prezzi singoli", featured: true, badge: "Più scelto",
    pacchetto: "Pacchetto Domination",
  },
  {
    tier: "Takeover", price: "6.500", period: "al mese",
    items: ["Tutti gli spazi sito (W1 – W4)", "12 invii NL-1 Sponsor of the Day", "12 invii NL-2 Consigliato", "12 invii NL-3 Sponsor Secondario", "12 invii NL-5 Footer Sponsor", "Priorità esclusiva nella rotazione", "Report bisettimanale + call dedicata"],
    saving: "Risparmio di € 4.200 rispetto ai prezzi singoli", featured: false, badge: "",
    pacchetto: "Pacchetto Takeover",
  },
];

const CONDITIONS = [
  ["Pagamento", "Esclusivamente tramite Stripe — carta di credito, bonifico SEPA, addebito diretto. Pagamento anticipato per acquisti singoli. Fatturazione a 30 giorni per pacchetti trimestrali."],
  ["Supporto creativo", "Il team ProofPress affianca il cliente nella realizzazione di tutte le creatività: banner, loghi, testi, immagini prodotto. Incluso nel prezzo, senza costi aggiuntivi."],
  ["Processo", "Contatta il team → definizione campagna → produzione creatività → approvazione → pagamento → messa online entro 48 ore lavorative."],
  ["Formati sito", "JPG, PNG, GIF animata, WebP — massimo 500 KB. Desktop: 970×250 (W4 billboard) o 300×250 (W1/W2/W3). Mobile: 728×90 (W4 leaderboard). Newsletter: logo 200 × 50 (PNG/SVG), immagine prodotto 200 × 200 (JPG/PNG), banner footer 600 × 100."],
  ["Rotazione sito", "Cambio ogni 15 secondi con transizione fade. I pacchetti Takeover hanno priorità di rotazione esclusiva; Domination ha priorità alta; Visibility ruota in pari peso con gli altri banner attivi."],
  ["Trasparenza", "Label Pubblicità / Sponsor sempre visibile su ogni spazio, come previsto dalla normativa italiana."],
  ["Tracking", "Dashboard accessibile al cliente con impression, click e CTR per spazio, aggiornata ogni 24 ore. Export CSV disponibile. Parametri UTM preconfigurati per integrazione con GA4. Newsletter: aperture, click, CTR per invio, disponibili entro 48 ore dall'invio."],
  ["Audience Guarantee", "Stimiamo per ogni spazio sito un minimo di 80.000 impression/mese (W1/W2/W3) e 20.000 impression/mese (W4), basato sulla media degli ultimi 90 giorni. In caso di scostamento superiore al 20%, il team valuta un'estensione gratuita della campagna."],
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
        title="Pubblicità — Media Kit 2026 | ProofPress Magazine"
        description="Raggiungi 100.000+ lettori al mese su proofpress.ai e 6.651 iscritti alla newsletter. 9 spazi pubblicitari premium per decision maker e innovatori italiani."
        canonical="https://proofpress.ai/pubblicita"
        ogSiteName="ProofPress"
      />
      <div className="flex min-h-screen" style={{ background: BG }}>
        
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SharedPageHeader />

          <main style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px 96px", fontFamily: SF }}>

            {/* ── BANNER PROMO PRIMAVERA ────────────────────────────────────── */}
            <div style={{
              background: "linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 100%)",
              borderRadius: "16px", padding: "20px 28px", marginBottom: "40px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-20px", right: "120px", fontSize: "60px", opacity: 0.08, userSelect: "none" }}>🌿</div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{
                  background: "#ff5500", color: "#fff", fontWeight: 800,
                  fontSize: "13px", padding: "6px 14px", borderRadius: "980px",
                  letterSpacing: "0.02em", fontFamily: SF, flexShrink: 0,
                }}>🌿 PROMO PRIMAVERA 2026</div>
                <div>
                  <div style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "20px", color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    Sconto 30% su tutti gli spazi
                  </div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "3px" }}>
                    Usa il coupon <span style={{ fontWeight: 700, color: "#ff5500", fontFamily: "'SF Mono', 'JetBrains Mono', monospace", background: "rgba(255,85,0,0.15)", padding: "2px 8px", borderRadius: "6px" }}>PRIMAVERA26</span> al momento del contatto · Valido fino al 30 aprile 2026
                  </div>
                </div>
              </div>
              <button onClick={() => scrollToForm()} style={{
                background: "#ff5500", color: "#fff", border: "none",
                padding: "12px 24px", borderRadius: "980px",
                fontWeight: 700, fontSize: "14px", cursor: "pointer",
                fontFamily: SF, letterSpacing: "-0.01em", flexShrink: 0,
              }}>
                Approfitta ora
              </button>
            </div>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Media Kit 2026 · Tutti i prezzi IVA esclusa</SectionLabel>
              <h1 style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: TEXT_PRI, marginBottom: "20px" }}>
                Pubblicizza su ProofPress.
              </h1>
              <p style={{ fontSize: "clamp(17px, 2.5vw, 21px)", color: TEXT_SEC, lineHeight: 1.55, maxWidth: "620px", marginBottom: "36px" }}>
                Raggiungi decision maker, founder e manager dell'innovazione italiana.
                9 spazi premium tra sito web e newsletter quotidiana.
              </p>
              <button onClick={() => scrollToForm()} style={{
                display: "inline-block", background: BG_DARK, color: "#fff",
                padding: "14px 28px", borderRadius: "980px", fontWeight: 600,
                fontSize: "15px", border: "none", cursor: "pointer", letterSpacing: "-0.01em",
              }}>
                Richiedi un preventivo
              </button>
            </div>

            {/* ── METRICHE ─────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Audience — Numeri chiave</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1px", background: BORDER_LT, border: `1px solid ${BORDER_LT}`, borderRadius: "18px", overflow: "hidden", marginBottom: "32px" }}>
                {METRICS.map((m) => (
                  <div key={m.label} style={{ background: BG_CARD, padding: "28px 20px" }}>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: TEXT_PRI, letterSpacing: "-0.02em", marginBottom: "6px" }}>{m.value}</div>
                    <div style={{ fontSize: "13px", color: TEXT_SEC, lineHeight: 1.4 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Audience Profile */}
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "28px 32px" }}>
                <div style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "17px", color: TEXT_PRI, marginBottom: "4px" }}>Chi sono i nostri lettori</div>
                <div style={{ fontSize: "13px", color: TEXT_SEC, marginBottom: "24px" }}>Profilazione basata su dati di registrazione, survey e analisi comportamentale · Aggiornamento Q1 2026</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                  {/* Ruoli */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_SEC, marginBottom: "12px" }}>Top ruoli</div>
                    {AUDIENCE_ROLES.map(r => (
                      <div key={r.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "8px" }}>
                        <div style={{ fontSize: "12px", color: TEXT_PRI, lineHeight: 1.3, flex: 1 }}>{r.role}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: ACCENT, flexShrink: 0 }}>{r.pct}</div>
                      </div>
                    ))}
                  </div>
                  {/* Settori */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_SEC, marginBottom: "12px" }}>Top settori</div>
                    {AUDIENCE_SECTORS.map(s => (
                      <div key={s.sector} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "8px" }}>
                        <div style={{ fontSize: "12px", color: TEXT_PRI, lineHeight: 1.3, flex: 1 }}>{s.sector}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: ACCENT, flexShrink: 0 }}>{s.pct}</div>
                      </div>
                    ))}
                  </div>
                  {/* Geo + B2B */}
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_SEC, marginBottom: "12px" }}>Distribuzione geografica</div>
                    {AUDIENCE_GEO.map(g => (
                      <div key={g.city} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", gap: "8px" }}>
                        <div style={{ fontSize: "12px", color: TEXT_PRI, lineHeight: 1.3, flex: 1 }}>{g.city}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: ACCENT, flexShrink: 0 }}>{g.pct}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${BORDER_LT}` }}>
                      <div style={{ fontSize: "12px", color: TEXT_SEC }}>
                        <strong style={{ color: TEXT_PRI }}>87% B2B</strong> · 13% B2C<br />
                        <strong style={{ color: TEXT_PRI }}>62%</strong> ruolo decisionale diretto
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── LOGO WALL / BETA PROGRAM ─────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Brand già presenti</SectionLabel>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <div style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "17px", color: TEXT_PRI, marginBottom: "8px" }}>
                      Stiamo aprendo gli spazi a un numero limitato di brand pilota.
                    </div>
                    <div style={{ fontSize: "14px", color: TEXT_SEC, lineHeight: 1.6, marginBottom: "16px" }}>
                      ProofPress è in fase di lancio commerciale. Stiamo selezionando i primi <strong>10 brand partner</strong> che entreranno come inserzionisti fondatori — con visibilità esclusiva, tariffe di lancio e priorità di posizionamento per i prossimi 12 mesi.
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["Tariffe di lancio garantite", "Priorità di rotazione", "Co-branding editoriale", "Report mensile dedicato"].map(b => (
                        <span key={b} style={{ background: BG, border: `1px solid ${BORDER_LT}`, borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, color: TEXT_PRI }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: BG, borderRadius: "12px", padding: "20px 24px", minWidth: "200px", textAlign: "center" }}>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "32px", fontWeight: 700, color: TEXT_PRI, letterSpacing: "-0.02em" }}>10</div>
                    <div style={{ fontSize: "13px", color: TEXT_SEC, marginBottom: "8px" }}>slot brand pilota disponibili</div>
                    <div style={{ fontSize: "11px", color: TEXT_TER }}>Contattaci per verificare la disponibilità nel tuo settore</div>
                  </div>
                </div>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                {/* SITO WEB */}
                <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "24px", overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT_SEC, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>
                    Sito Web — 4 posizioni + 1 combo
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gridTemplateRows: "auto auto auto", gap: "6px" }}>
                    <div style={{ border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "12px 8px", textAlign: "center", position: "relative", minHeight: "80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W1</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Manchette SX</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER, marginTop: "2px" }}>300×250</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €75/g</div>
                    </div>
                    <div style={{ background: BG_DARK, borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "90px" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "13px", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>ProofPress<br/><span style={{ fontSize: "8px", fontWeight: 400, opacity: 0.5 }}>MAGAZINE</span></div>
                    </div>
                    <div style={{ border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "12px 8px", textAlign: "center", position: "relative", minHeight: "80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W2</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Manchette DX</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER, marginTop: "2px" }}>300×250</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €75/g</div>
                    </div>
                    <div style={{ gridColumn: "1 / 3", background: BG, borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60px" }}>
                      <span style={{ fontSize: "11px", color: TEXT_TER }}>Editoriale</span>
                    </div>
                    <div style={{ border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "10px 8px", textAlign: "center", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W3</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Sidebar DX</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER, marginTop: "2px" }}>300×250</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €50/g</div>
                    </div>
                    <div style={{ gridColumn: "1 / 4", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.06)", padding: "14px", textAlign: "center", position: "relative" }}>
                      <span style={{ position: "absolute", top: "-9px", left: "8px", background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "3px" }}>W4</span>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#00a07a" }}>Banner · 970×250 desktop / 728×90 mobile</div>
                      <div style={{ fontSize: "10px", color: "#00a07a", fontWeight: 600, marginTop: "4px" }}>da €80/g</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "12px", padding: "10px 12px", background: BG, borderRadius: "8px", fontSize: "11px", color: TEXT_SEC }}>
                    <strong>W1+W2 Doppia Manchette</strong> — combo header domination, disponibile come prodotto unico a tariffa ridotta.
                  </div>
                </div>

                {/* NEWSLETTER */}
                <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "24px", overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT_SEC, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3l5 4 5-4M1 3v7h10V3H1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    Newsletter Daily — 4 spazi banner
                  </div>
                  <div style={{ border: `1px solid ${BORDER_LT}`, borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
                    <div style={{ padding: "14px 16px", textAlign: "center", borderBottom: `1px solid ${BORDER_LT}` }}>
                      <div style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: "18px", color: TEXT_PRI, marginBottom: "2px" }}>ProofPress</div>
                      <div style={{ fontSize: "10px", color: TEXT_TER }}>Per chi vuole capire l'innovazione prima degli altri</div>
                      <div style={{ fontSize: "9px", color: TEXT_TER, marginTop: "2px" }}>N° 30 · <strong>6.651 lettori</strong></div>
                    </div>
                    <div style={{ margin: "8px", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.05)", padding: "10px 12px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>NL-1</span>
                        <span style={{ background: BG_DARK, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>€350/invio</span>
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_PRI, textAlign: "center" }}>SPONSOR OF THE DAY</div>
                      <div style={{ fontSize: "9px", color: TEXT_SEC, textAlign: "center", marginTop: "2px" }}>Logo + headline + testo + CTA · Top placement</div>
                    </div>
                    <div style={{ padding: "8px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", color: TEXT_TER, textTransform: "uppercase", marginBottom: "6px" }}>Breaking + Startup</div>
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", marginBottom: "4px" }} />
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", marginBottom: "4px", width: "80%" }} />
                    </div>
                    <div style={{ margin: "8px", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.05)", padding: "10px 12px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>NL-2</span>
                        <span style={{ background: BG_DARK, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>€250/invio</span>
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_PRI, textAlign: "center" }}>CONSIGLIATO</div>
                      <div style={{ fontSize: "9px", color: TEXT_SEC, textAlign: "center", marginTop: "2px" }}>Prodotto/servizio · Immagine + titolo + prezzo + link</div>
                    </div>
                    <div style={{ padding: "8px 12px" }}>
                      <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.08em", color: TEXT_TER, textTransform: "uppercase", marginBottom: "6px" }}>Research del giorno</div>
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", marginBottom: "4px" }} />
                      <div style={{ height: "8px", background: BG, borderRadius: "4px", width: "70%" }} />
                    </div>
                    <div style={{ margin: "8px", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.05)", padding: "10px 12px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>NL-3</span>
                        <span style={{ background: BG_DARK, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>€180/invio</span>
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_PRI, textAlign: "center" }}>SPONSOR SECONDARIO</div>
                      <div style={{ fontSize: "9px", color: TEXT_SEC, textAlign: "center", marginTop: "2px" }}>Logo + testo breve + link · Mid placement</div>
                    </div>
                    <div style={{ margin: "8px", border: "2px dashed #00c896", borderRadius: "8px", background: "rgba(0,200,150,0.05)", padding: "8px 12px", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ background: "#00c896", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>NL-5</span>
                        <span style={{ background: BG_DARK, color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "3px" }}>€120/invio</span>
                      </div>
                      <div style={{ fontSize: "9px", color: TEXT_SEC, textAlign: "center", marginTop: "4px" }}>Footer Sponsor · Logo + link</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SPAZI SITO WEB ────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Spazi Sito Web · proofpress.ai</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>4 posizioni premium</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>Visibili su tutte le pagine del sito, con rotazione ogni 15 secondi. La Doppia Manchette (W1+W2) è acquistabile come combo a tariffa ridotta.</p>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 90px 90px 90px 90px 70px", padding: "12px 24px", background: BG, borderBottom: `1px solid ${BORDER_LT}` }}>
                  {["Posizione", "Formato", "1 Giorno", "1 Settimana", "1 Mese", "Trimestre", "CPM eq."].map((h, i) => (
                    <div key={h} style={{ fontSize: "11px", fontWeight: 600, color: TEXT_SEC, textAlign: i === 0 ? "left" : "right", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {WEB_SLOTS.map((row, i) => (
                  <div key={row.code}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 90px 90px 90px 90px 70px", padding: "20px 24px", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                          <Tag label={row.code} color={row.code === "W1+2" ? "#6e6e73" : undefined} />
                          <span style={{ fontWeight: 600, fontSize: "15px", color: TEXT_PRI }}>{row.name}</span>
                        </div>
                        <p style={{ fontSize: "13px", color: TEXT_SEC, margin: 0 }}>{row.desc}</p>
                      </div>
                      <div style={{ fontSize: "12px", color: TEXT_TER, textAlign: "right" }}>{row.format}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.giorno}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.settimana}</div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.mese}</div>
                      <div style={{ fontSize: "14px", color: TEXT_PRI, textAlign: "right" }}>€ {row.prices.trimestre}</div>
                      <div style={{ fontSize: "12px", color: ACCENT, fontWeight: 600, textAlign: "right" }}>{row.cpm}</div>
                    </div>
                    {i < WEB_SLOTS.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: TEXT_TER, marginTop: "10px", lineHeight: 1.5 }}>
                * CPM equivalente calcolato su impression medie mensili degli ultimi 90 giorni. Permette il confronto con altri publisher su base programmatic.
              </p>
            </div>

            {/* ── SPAZI NEWSLETTER ─────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Spazi Newsletter Daily</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>4 posizioni banner nella newsletter</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>3 invii a settimana · 6.651 iscritti · 45% open rate · circa 3.000 aperture per invio.</p>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 100px 100px 70px", padding: "12px 24px", background: BG, borderBottom: `1px solid ${BORDER_LT}` }}>
                  {["Posizione", "Formato", "Singolo invio", "4 invii", "12 invii", "CPM eq."].map((h, i) => (
                    <div key={h} style={{ fontSize: "11px", fontWeight: 600, color: TEXT_SEC, textAlign: i === 0 ? "left" : "right", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {NL_SLOTS.map((row, i) => (
                  <div key={row.code}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 100px 100px 100px 70px", padding: "20px 24px", alignItems: "center" }}>
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
                      <div style={{ fontSize: "12px", color: ACCENT, fontWeight: 600, textAlign: "right" }}>{row.cpm}</div>
                    </div>
                    {i < NL_SLOTS.length - 1 && <Divider />}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: TEXT_TER, marginTop: "10px", lineHeight: 1.5 }}>
                * CPM equivalente calcolato su ~3.000 aperture medie per invio. La newsletter ha un CPM effettivo significativamente superiore al sito per la qualità del profilo lettore.
              </p>
            </div>

            {/* ── BRANDED CONTENT ──────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Branded Content · Formato premium</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>Articolo Sponsorizzato</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>Il formato pubblicitario con il ROI più alto. Contenuto nativo scritto dal team ProofPress su brief dell'inserzionista, pubblicato sul sito e distribuito in newsletter.</p>
              <div style={{ background: BG_DARK, borderRadius: "18px", padding: "32px 36px", color: "#fff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>NL-4 · Branded Content</div>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "22px", fontWeight: 700, marginBottom: "16px", lineHeight: 1.2 }}>Articolo Sponsorizzato</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        "500 – 800 parole scritte dal team ProofPress",
                        "Pubblicato sul sito con label Sponsor",
                        "Distribuito in newsletter nella stessa settimana",
                        "SEO-ottimizzato con link follow al sito del cliente",
                        "Immagine di copertina inclusa",
                        "Approvazione bozza prima della pubblicazione",
                      ].map((item, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
                            <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.15)" />
                            <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>Tariffe</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                      {[
                        { label: "Singolo articolo", price: "€ 600" },
                        { label: "4 articoli (mensile)", price: "€ 2.000", note: "–17%" },
                        { label: "12 articoli (trimestrale)", price: "€ 5.000", note: "–31%" },
                      ].map(t => (
                        <div key={t.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.08)", borderRadius: "10px" }}>
                          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>{t.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {t.note && <span style={{ fontSize: "11px", background: ACCENT, color: "#fff", padding: "2px 7px", borderRadius: "6px", fontWeight: 600 }}>{t.note}</span>}
                            <span style={{ fontSize: "16px", fontWeight: 700 }}>{t.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => scrollToForm("Branded Content / Articolo Sponsorizzato")} style={{
                      display: "block", width: "100%", textAlign: "center",
                      background: "#fff", color: BG_DARK, padding: "13px 20px",
                      borderRadius: "980px", fontWeight: 600, fontSize: "14px",
                      border: "none", cursor: "pointer", letterSpacing: "-0.01em",
                    }}>
                      Richiedi un preventivo Branded Content
                    </button>
                  </div>
                </div>
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
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "16px" }}>{pkg.tier}</div>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "40px", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "4px" }}>€ {pkg.price}</div>
                    <div style={{ fontSize: "14px", color: pkg.featured ? "rgba(255,255,255,0.5)" : TEXT_SEC, marginBottom: "24px" }}>{pkg.period}</div>
                    <div style={{ height: "1px", background: pkg.featured ? "rgba(255,255,255,0.12)" : BORDER_LT, marginBottom: "24px" }} />
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {pkg.items.map((item, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
                            <circle cx="8" cy="8" r="8" fill={pkg.featured ? "rgba(255,255,255,0.15)" : "#e8e8ed"} />
                            <path d="M5 8l2 2 4-4" stroke={pkg.featured ? "#fff" : TEXT_PRI} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ color: pkg.featured ? "rgba(255,255,255,0.8)" : TEXT_SEC, lineHeight: 1.5 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontSize: "12px", color: pkg.featured ? "rgba(255,255,255,0.45)" : TEXT_TER, marginBottom: "20px", lineHeight: 1.5 }}>{pkg.saving}</div>
                    <button onClick={() => scrollToForm(pkg.pacchetto)} style={{
                      display: "block", width: "100%", textAlign: "center",
                      background: pkg.featured ? "#fff" : BG_DARK,
                      color: pkg.featured ? BG_DARK : "#fff",
                      padding: "13px 20px", borderRadius: "980px", fontWeight: 600,
                      fontSize: "14px", border: "none", cursor: "pointer", letterSpacing: "-0.01em",
                    }}>
                      Contattaci
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── BRAND SAFETY ─────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Brand Safety · Linea editoriale</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>Cosa accettiamo. Cosa no.</h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>ProofPress vende informazione 100% verificata. La stessa standard si applica agli inserzionisti.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e8f8f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="#00a07a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: TEXT_PRI }}>Accettiamo</div>
                  </div>
                  {["Tech, SaaS, AI, software B2B", "Finance regolamentata (banche, fondi, assicurazioni)", "Pharma e dispositivi medici con claim approvati", "Formazione, eventi, conferenze", "E-commerce e retail premium", "Startup e scale-up con prodotto verificabile", "Consulenza e servizi professionali"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", color: TEXT_SEC }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4l6 6M10 4l-6 6" stroke="#c00" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: TEXT_PRI }}>Non accettiamo</div>
                  </div>
                  {["Gambling e scommesse", "Finanza ad alto rischio non regolamentata (es. CFD, forex non autorizzato)", "Criptovalute e token non regolamentati", "Contenuti polarizzanti o politicamente orientati", "Claim medici non approvati o pseudoscienza", "Contenuti in contrasto con la linea editoriale ProofPress"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "13px", color: TEXT_SEC }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c00", flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${BORDER_LT}`, fontSize: "12px", color: TEXT_TER, lineHeight: 1.5 }}>
                    In caso di dubbio, il team ProofPress valuta ogni richiesta singolarmente. Contattaci prima di inviare il brief.
                  </div>
                </div>
              </div>
            </div>

            {/* ── CONDIZIONI ───────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Condizioni operative</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "28px" }}>Come funziona</h2>
              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                {CONDITIONS.map(([label, text], i) => (
                  <div key={label}>
                    <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "180px 1fr", gap: "16px", alignItems: "start" }}>
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
