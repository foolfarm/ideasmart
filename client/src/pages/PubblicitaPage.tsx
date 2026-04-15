/**
 * Pagina /pubblicita — Listino Pubblicitario ProofPress 2026
 * Design: Apple-style · Sfondo bianco ghiaccio · Palette monocromatica
 */
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";
import LeftSidebar from "@/components/LeftSidebar";

// ─── Design tokens Apple-style ────────────────────────────────────────────────
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

const BG        = "#f5f5f7";   // bianco ghiaccio Apple
const BG_CARD   = "#ffffff";
const BG_DARK   = "#1d1d1f";   // nero Apple
const TEXT_PRI  = "#1d1d1f";
const TEXT_SEC  = "#6e6e73";
const TEXT_TER  = "#aeaeb2";
const BORDER    = "#d2d2d7";
const BORDER_LT = "#e8e8ed";

// ─── Componenti base ──────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block",
      background: BG_DARK, color: "#fff",
      fontSize: "10px", fontWeight: 600,
      padding: "3px 9px", borderRadius: "20px",
      fontFamily: SF, letterSpacing: "0.3px",
    }}>{label}</span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", color: TEXT_SEC,
      fontFamily: SF, marginBottom: "12px",
    }}>{children}</p>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: BORDER_LT, margin: "0" }} />;
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
  {
    code: "W1", name: "Manchette Header Sinistra",
    desc: "A sinistra del logo, above the fold, tutte le pagine",
    format: "300 × 250 px",
    prices: { giorno: "75", settimana: "350", mese: "1.200", trimestre: "3.000" },
  },
  {
    code: "W2", name: "Manchette Header Destra",
    desc: "A destra del logo, above the fold, tutte le pagine",
    format: "300 × 250 px",
    prices: { giorno: "75", settimana: "350", mese: "1.200", trimestre: "3.000" },
  },
  {
    code: "W1+2", name: "Doppia Manchette",
    desc: "Header domination — massima brand awareness",
    format: "2 × 300 × 250 px",
    prices: { giorno: "120", settimana: "580", mese: "2.000", trimestre: "5.000" },
  },
  {
    code: "W3", name: "Sidebar Destra",
    desc: "Fissa durante lo scroll, tutte le pagine",
    format: "300 × 250 px",
    prices: { giorno: "50", settimana: "250", mese: "900", trimestre: "2.200" },
  },
  {
    code: "W4", name: "Banner Orizzontale",
    desc: "Full-width sotto la sezione Research, alto impatto",
    format: "728 × 90 / 970 × 250 px",
    prices: { giorno: "80", settimana: "400", mese: "1.400", trimestre: "3.500" },
  },
];

const NL_SLOTS = [
  {
    code: "NL-1", name: "Sponsor of the Day",
    desc: "Prima posizione — logo, headline, testo, CTA. Prima cosa che il lettore vede.",
    format: "Logo 200 × 50 + HTML",
    prices: { singolo: "350", quattro: "1.200", dodici: "3.200" },
  },
  {
    code: "NL-2", name: "Consigliato",
    desc: "Product placement — immagine prodotto, titolo, prezzo, link. Stile raccomandazione editoriale.",
    format: "Immagine 200 × 200 + HTML",
    prices: { singolo: "250", quattro: "850", dodici: "2.200" },
  },
  {
    code: "NL-3", name: "Sponsor Secondario",
    desc: "Posizione centrale — logo, testo breve, link. Tra Research e Dealroom.",
    format: "Logo 200 × 50 + HTML",
    prices: { singolo: "180", quattro: "620", dodici: "1.600" },
  },
  {
    code: "NL-4", name: "Articolo Sponsorizzato",
    desc: "Contenuto nativo scritto dal team ProofPress su brief. Pubblicato sul sito (indicizzato Google) e in newsletter.",
    format: "500 – 800 parole + immagine",
    prices: { singolo: "600", quattro: "2.000", dodici: "5.000" },
  },
  {
    code: "NL-5", name: "Footer Sponsor",
    desc: "Ultima posizione — banner o logo con link. Brand awareness continuativa a basso costo.",
    format: "600 × 100 px o logo",
    prices: { singolo: "120", quattro: "400", dodici: "1.000" },
  },
];

const PACKAGES = [
  {
    tier: "Starter",
    subtitle: "Visibility",
    price: "1.800",
    period: "al mese",
    items: [
      "1 Manchette header (W1 o W2)",
      "4 invii NL-3 Sponsor Secondario",
      "4 invii NL-5 Footer Sponsor",
      "Report settimanale",
    ],
    saving: "Risparmio di € 520 rispetto ai prezzi singoli",
    featured: false,
  },
  {
    tier: "Growth",
    subtitle: "Domination",
    price: "4.200",
    period: "al mese",
    items: [
      "Doppia Manchette (W1 + W2)",
      "Banner Orizzontale (W4)",
      "4 invii NL-1 Sponsor of the Day",
      "4 invii NL-2 Consigliato",
      "1 Articolo Sponsorizzato NL-4",
      "Report mensile + call di ottimizzazione",
    ],
    saving: "Risparmio di € 1.800 rispetto ai prezzi singoli",
    featured: true,
    badge: "Più scelto",
  },
  {
    tier: "Enterprise",
    subtitle: "Takeover",
    price: "6.500",
    period: "al mese",
    items: [
      "Tutti gli spazi sito (W1 – W4)",
      "12 invii NL-1 Sponsor of the Day",
      "12 invii NL-2 Consigliato",
      "12 invii NL-3 Sponsor Secondario",
      "2 Articoli Sponsorizzati NL-4",
      "12 invii NL-5 Footer Sponsor",
      "Priorità esclusiva nella rotazione",
      "Report bisettimanale + call dedicata",
    ],
    saving: "Risparmio di € 4.200 rispetto ai prezzi singoli",
    featured: false,
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

// ─── Pagina ───────────────────────────────────────────────────────────────────

export default function PubblicitaPage() {
  return (
    <>
      <SEOHead
        title="Pubblicità — Listino 2026 | ProofPress Magazine"
        description="Raggiungi 100.000+ lettori al mese su proofpress.ai e 6.651 iscritti alla newsletter. 9 spazi pubblicitari premium: manchette, sidebar, banner, newsletter sponsorizzata."
        canonical="https://proofpress.ai/pubblicita"
        ogSiteName="ProofPress"
      />
      <div className="flex min-h-screen" style={{ background: BG }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SharedPageHeader />

          <main style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px 96px", fontFamily: SF }}>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Listino Pubblicitario 2026 · Tutti i prezzi IVA esclusa</SectionLabel>
              <h1 style={{
                fontFamily: SF_DISPLAY, fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.05,
                letterSpacing: "-0.02em", color: TEXT_PRI,
                marginBottom: "20px",
              }}>
                Pubblicizza su ProofPress.
              </h1>
              <p style={{
                fontSize: "clamp(17px, 2.5vw, 21px)", color: TEXT_SEC,
                lineHeight: 1.55, maxWidth: "620px", marginBottom: "36px",
              }}>
                Raggiungi decision maker, founder e manager dell'innovazione italiana.
                9 spazi premium tra sito web e newsletter quotidiana.
              </p>
              <a
                href="mailto:pubblicita@proofpress.ai"
                style={{
                  display: "inline-block",
                  background: BG_DARK, color: "#fff",
                  padding: "14px 28px", borderRadius: "980px",
                  fontWeight: 600, fontSize: "15px",
                  textDecoration: "none", letterSpacing: "-0.01em",
                }}
              >
                Contattaci per un preventivo
              </a>
            </div>

            {/* ── METRICHE ─────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Audience</SectionLabel>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1px", background: BORDER_LT,
                border: `1px solid ${BORDER_LT}`, borderRadius: "18px",
                overflow: "hidden",
              }}>
                {METRICS.map((m) => (
                  <div key={m.label} style={{ background: BG_CARD, padding: "28px 20px" }}>
                    <div style={{
                      fontFamily: SF_DISPLAY, fontSize: "clamp(22px, 3vw, 32px)",
                      fontWeight: 700, color: TEXT_PRI, letterSpacing: "-0.02em",
                      marginBottom: "6px",
                    }}>{m.value}</div>
                    <div style={{ fontSize: "13px", color: TEXT_SEC, lineHeight: 1.4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SPAZI SITO WEB ───────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Spazi Sito Web · proofpress.ai</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>
                4 posizioni premium
              </h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>
                Visibili su tutte le pagine del sito, con rotazione ogni 15 secondi.
              </p>

              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                {/* Header tabella */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 90px 90px 90px 90px",
                  padding: "12px 24px",
                  background: BG,
                  borderBottom: `1px solid ${BORDER_LT}`,
                }}>
                  {["Posizione", "Formato", "1 Giorno", "1 Settimana", "1 Mese", "Trimestre"].map((h, i) => (
                    <div key={h} style={{
                      fontSize: "11px", fontWeight: 600,
                      color: TEXT_SEC, textAlign: i === 0 ? "left" : "right",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                    }}>{h}</div>
                  ))}
                </div>

                {WEB_SLOTS.map((row, i) => (
                  <div key={row.code}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px 90px 90px 90px 90px",
                      padding: "20px 24px",
                      alignItems: "center",
                    }}>
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
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>
                5 posizioni nella newsletter
              </h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "28px" }}>
                3 invii a settimana · 6.651 iscritti · 45% open rate · circa 3.000 aperture per invio.
              </p>

              <div style={{ background: BG_CARD, borderRadius: "18px", border: `1px solid ${BORDER_LT}`, overflow: "hidden" }}>
                {/* Header tabella */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 130px 100px 100px 100px",
                  padding: "12px 24px",
                  background: BG,
                  borderBottom: `1px solid ${BORDER_LT}`,
                }}>
                  {["Posizione", "Formato", "Singolo invio", "4 invii", "12 invii"].map((h, i) => (
                    <div key={h} style={{
                      fontSize: "11px", fontWeight: 600,
                      color: TEXT_SEC, textAlign: i === 0 ? "left" : "right",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                    }}>{h}</div>
                  ))}
                </div>

                {NL_SLOTS.map((row, i) => (
                  <div key={row.code}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 130px 100px 100px 100px",
                      padding: "20px 24px",
                      alignItems: "center",
                    }}>
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
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "8px" }}>
                Massimizza reach e frequenza
              </h2>
              <p style={{ fontSize: "15px", color: TEXT_SEC, marginBottom: "32px" }}>
                Tutti i pacchetti includono supporto creativo completo del team ProofPress.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.tier}
                    style={{
                      background: pkg.featured ? BG_DARK : BG_CARD,
                      border: `1px solid ${pkg.featured ? BG_DARK : BORDER_LT}`,
                      borderRadius: "18px",
                      padding: "32px 28px",
                      position: "relative",
                      color: pkg.featured ? "#fff" : TEXT_PRI,
                    }}
                  >
                    {pkg.featured && (pkg as any).badge && (
                      <div style={{
                        position: "absolute", top: "20px", right: "20px",
                        background: "rgba(255,255,255,0.15)",
                        color: "#fff", fontSize: "11px", fontWeight: 600,
                        padding: "4px 12px", borderRadius: "20px",
                        letterSpacing: "0.03em",
                      }}>{(pkg as any).badge}</div>
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

                    <div style={{
                      fontSize: "12px", color: pkg.featured ? "rgba(255,255,255,0.45)" : TEXT_TER,
                      marginBottom: "20px", lineHeight: 1.5,
                    }}>{pkg.saving}</div>

                    <a
                      href="mailto:pubblicita@proofpress.ai"
                      style={{
                        display: "block", textAlign: "center",
                        background: pkg.featured ? "#fff" : BG_DARK,
                        color: pkg.featured ? BG_DARK : "#fff",
                        padding: "13px 20px", borderRadius: "980px",
                        fontWeight: 600, fontSize: "14px",
                        textDecoration: "none", letterSpacing: "-0.01em",
                      }}
                    >
                      Contattaci
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CONDIZIONI ───────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Condizioni operative</SectionLabel>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "28px", fontWeight: 700, letterSpacing: "-0.015em", color: TEXT_PRI, marginBottom: "28px" }}>
                Come funziona
              </h2>

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

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <div style={{
              background: BG_DARK, borderRadius: "24px",
              padding: "64px 48px", textAlign: "center",
              color: "#fff",
            }}>
              <SectionLabel>Parliamo della tua campagna</SectionLabel>
              <h2 style={{
                fontFamily: SF_DISPLAY, fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: 700, letterSpacing: "-0.02em",
                lineHeight: 1.1, marginBottom: "16px",
              }}>
                Vuoi raggiungere i decision maker<br />dell'innovazione italiana?
              </h2>
              <p style={{
                fontSize: "17px", color: "rgba(255,255,255,0.6)",
                maxWidth: "520px", margin: "0 auto 36px",
                lineHeight: 1.55,
              }}>
                Scrivici con il tuo brief e il budget. Il team risponde entro 24 ore lavorative
                e ti affianca dalla strategia alla messa online.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
                <a
                  href="mailto:pubblicita@proofpress.ai"
                  style={{
                    display: "inline-block",
                    background: "#fff", color: BG_DARK,
                    padding: "14px 28px", borderRadius: "980px",
                    fontWeight: 600, fontSize: "15px",
                    textDecoration: "none", letterSpacing: "-0.01em",
                  }}
                >
                  Scrivici ora
                </a>
                <a
                  href="https://calendly.com/proofpress/pubblicita"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    padding: "14px 28px", borderRadius: "980px",
                    fontWeight: 600, fontSize: "15px",
                    textDecoration: "none", letterSpacing: "-0.01em",
                  }}
                >
                  Prenota una call
                </a>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", fontFamily: SF }}>
                pubblicita@proofpress.ai
              </p>
            </div>

          </main>
          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
