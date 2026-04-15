/**
 * Pagina /pubblicita — Listino Pubblicitario ProofPress 2026
 * Contenuto basato su proofpress-rate-card-v4
 */
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";
import LeftSidebar from "@/components/LeftSidebar";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace";
const ACCENT = "#00C896";
const ACCENT_DARK = "#00A87A";
const STRIPE_COLOR = "#635BFF";
const BLACK = "#111111";
const GREY_50 = "#F9F9F9";
const GREY_200 = "#E8E8E8";
const GREY_400 = "#999999";
const GREY_600 = "#666666";
const ORANGE = "#FF8F00";
const BLUE = "#2563EB";

function PosTag({ type, label }: { type: "web" | "nl" | "native" | "product"; label: string }) {
  const bg: Record<string, string> = { web: ACCENT, nl: ACCENT, native: ORANGE, product: BLUE };
  return (
    <span style={{
      display: "inline-block", background: bg[type], color: "#fff",
      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
      fontFamily: MONO, letterSpacing: "0.5px", marginRight: "6px", flexShrink: 0, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

const WEB_SLOTS = [
  { tag: "W1", name: "Manchette Header SX", desc: "A sinistra del logo · above the fold · tutte le pagine", format: "300×250", g: "€ 75", w: "€ 350", m: "€ 1.200", q: "€ 3.000", cpm: "~€ 30" },
  { tag: "W2", name: "Manchette Header DX", desc: "A destra del logo · above the fold · tutte le pagine", format: "300×250", g: "€ 75", w: "€ 350", m: "€ 1.200", q: "€ 3.000", cpm: "~€ 30" },
  { tag: "W1+2", name: "Doppia Manchette", desc: "Header domination — massima brand awareness", format: "2× 300×250", g: "€ 120", w: "€ 580", m: "€ 2.000", q: "€ 5.000", cpm: "~€ 25" },
  { tag: "W3", name: "Sidebar Destra", desc: "Fissa durante scroll · tutte le pagine", format: "300×250", g: "€ 50", w: "€ 250", m: "€ 900", q: "€ 2.200", cpm: "~€ 22" },
  { tag: "W4", name: "Banner Orizzontale", desc: "Full-width sotto Research · alto impatto", format: "728×90 / 970×250", g: "€ 80", w: "€ 400", m: "€ 1.400", q: "€ 3.500", cpm: "~€ 35" },
];

const NL_SLOTS = [
  { tag: "NL-1", type: "nl" as const, name: "Sponsor of the Day", desc: "Top placement — Logo + headline + testo + CTA. Prima cosa che il lettore vede.", format: "Logo 200×50 + HTML", s1: "€ 350", s4: "€ 1.200", s12: "€ 3.200", cpa: "~€ 0,12" },
  { tag: "NL-2", type: "product" as const, name: "Consigliato", desc: "Product placement — Immagine prodotto + titolo + prezzo + link. Stile raccomandazione editoriale.", format: "Img 200×200 + HTML", s1: "€ 250", s4: "€ 850", s12: "€ 2.200", cpa: "~€ 0,08" },
  { tag: "NL-3", type: "nl" as const, name: "Sponsor Secondario", desc: "Mid placement — Logo + testo breve + link. Tra Research e Dealroom.", format: "Logo 200×50 + HTML", s1: "€ 180", s4: "€ 620", s12: "€ 1.600", cpa: "~€ 0,06" },
  { tag: "NL-4", type: "native" as const, name: "Articolo Sponsorizzato", desc: "Contenuto nativo scritto dal team ProofPress su brief. Sito (indicizzato Google) + newsletter.", format: "500-800 parole + immagine", s1: "€ 600", s4: "€ 2.000", s12: "€ 5.000", cpa: "~€ 0,20" },
  { tag: "NL-5", type: "nl" as const, name: "Footer Sponsor", desc: "Ultima posizione — Banner o logo + link. Per brand awareness continuativa a basso costo.", format: "600×100 o logo", s1: "€ 120", s4: "€ 400", s12: "€ 1.000", cpa: "~€ 0,04" },
];

const PACKAGES = [
  {
    name: "Starter", title: "Visibility", price: "€ 1.800", period: "/ mese",
    items: ["1 Manchette header (W1 o W2)", "4× NL-3 Sponsor Secondario", "4× NL-5 Footer Sponsor", "Report settimanale"],
    save: "Risparmi € 520 vs. singoli", featured: false, badge: "",
  },
  {
    name: "Growth", title: "Domination", price: "€ 4.200", period: "/ mese",
    items: ["Doppia Manchette (W1+W2)", "Banner Orizzontale (W4)", "4× NL-1 Sponsor of the Day", "4× NL-2 Consigliato", "1× NL-4 Articolo Sponsorizzato", "Report + call ottimizzazione"],
    save: "Risparmi € 1.800 vs. singoli", featured: true, badge: "Best value",
  },
  {
    name: "Enterprise", title: "Takeover", price: "€ 6.500", period: "/ mese",
    items: ["Tutti gli spazi sito (W1-W4)", "12× NL-1 Sponsor of the Day", "12× NL-2 Consigliato", "12× NL-3 Sponsor Secondario", "2× NL-4 Articolo Sponsorizzato", "12× NL-5 Footer Sponsor", "Priorità esclusiva rotazione", "Report + call bisettimanale"],
    save: "Risparmi € 4.200 vs. singoli", featured: false, badge: "",
  },
];

const CONDITIONS = [
  { label: "Pagamento", text: "Esclusivamente tramite Stripe (carta di credito, bonifico SEPA, addebito diretto). Pagamento anticipato per acquisti singoli. Fatturazione a 30gg per pacchetti trimestrali." },
  { label: "Supporto creativo", text: "Il team ProofPress affianca il cliente nella realizzazione di tutte le creatività necessarie (banner, loghi, testi, immagini prodotto). Incluso nel prezzo. Nessun costo aggiuntivo per la produzione grafica." },
  { label: "Processo", text: "Contatta il team → definizione campagna e spazi → il team produce o adatta le creatività → approvazione del cliente → pagamento via Stripe → messa online entro 48h." },
  { label: "Formati sito", text: "JPG, PNG, GIF animata, WebP — max 500 KB. Newsletter: logo 200×50 (PNG/SVG), immagine prodotto 200×200 (JPG/PNG), banner footer 600×100." },
  { label: "Rotazione sito", text: "Ogni 15 secondi, fade in/out, distribuzione weighted. Newsletter: selezione per invio." },
  { label: "Trasparenza", text: "Label Pubblicita / Sponsor sempre visibile (requisito legale italiano)." },
  { label: "Tracking", text: "Impression, click, CTR per spazio — dashboard accessibile al cliente. Newsletter: aperture, click, CTR per invio entro 48h." },
  { label: "Sconti durata", text: "-10% per contratti di 6 mesi o piu · -15% per 12 mesi o piu." },
  { label: "Rimborsi", text: "Rimborso integrale se il banner non viene pubblicato entro 48h dal pagamento. Nessun rimborso a campagna avviata." },
];

export default function PubblicitaPage() {
  return (
    <>
      <SEOHead
        title="Pubblicita — Listino 2026 | ProofPress Magazine"
        description="Raggiungi 100.000+ lettori/mese su proofpress.ai e 6.651 iscritti alla newsletter. 9 spazi pubblicitari premium."
        canonical="https://proofpress.ai/pubblicita"
        ogSiteName="ProofPress"
      />
      <div className="flex min-h-screen" style={{ background: "#ffffff" }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SharedPageHeader />
          <main style={{ maxWidth: "1060px", margin: "0 auto", padding: "48px 24px 80px", fontFamily: SF }}>

            {/* HEADER */}
            <div style={{ textAlign: "center", paddingBottom: "48px", borderBottom: `3px solid ${BLACK}`, marginBottom: "48px" }}>
              <div style={{ display: "inline-block", background: BLACK, color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", padding: "6px 16px", marginBottom: "20px" }}>
                Listino Pubblicitario 2026
              </div>
              <h1 style={{ fontFamily: SF_DISPLAY, fontWeight: 900, fontSize: "clamp(28px, 5vw, 42px)", lineHeight: 1.1, marginBottom: "8px", color: BLACK }}>
                Pubblicizza su ProofPress
              </h1>
              <p style={{ fontSize: "18px", color: GREY_600, marginBottom: "24px" }}>
                Raggiungi decision maker, founder e manager dell'innovazione italiana
              </p>
              <div style={{ fontFamily: MONO, fontSize: "12px", color: GREY_400, letterSpacing: "1px" }}>
                Aggiornato Aprile 2026 · Tutti i prezzi IVA esclusa
              </div>
            </div>

            {/* METRICHE */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", border: `2px solid ${BLACK}`, marginBottom: "56px", overflowX: "auto" }}>
              {[
                { v: "100K+", l: "Visite/mese" }, { v: "6.651", l: "Iscritti NL" },
                { v: "45%", l: "Open rate" }, { v: "~3.000", l: "Aperture/invio" }, { v: "3x", l: "Invii/settimana" },
              ].map((m, i) => (
                <div key={m.l} style={{ padding: "22px 16px", textAlign: "center", borderRight: i < 4 ? `1px solid ${GREY_200}` : undefined }}>
                  <div style={{ fontFamily: MONO, fontSize: "clamp(16px,2.5vw,26px)", fontWeight: 700, color: BLACK }}>{m.v}</div>
                  <div style={{ fontSize: "11px", color: GREY_600, textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>{m.l}</div>
                </div>
              ))}
            </div>

            {/* STRIPE BANNER */}
            <div style={{ background: `linear-gradient(135deg, ${STRIPE_COLOR} 0%, #8B85FF 100%)`, borderRadius: "10px", padding: "28px 32px", display: "flex", alignItems: "center", gap: "24px", marginBottom: "56px", color: "white", flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0, width: "52px", height: "52px", background: "rgba(255,255,255,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>S</div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "4px" }}>Pagamento sicuro via Stripe</h3>
                <p style={{ fontSize: "14px", opacity: 0.9, lineHeight: 1.5, margin: 0 }}>Carta di credito, bonifico SEPA, addebito diretto. Il team invia il link di pagamento dopo la conferma dell'ordine.</p>
                <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
                  {["Contattaci", "Definiamo la campagna", "Creativita + pagamento", "Online in 48h"].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600 }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LISTINO SITO WEB */}
            <div style={{ marginBottom: "56px" }}>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: BLACK }}>Spazi Sito Web</h2>
              <p style={{ fontSize: "14px", color: GREY_600, marginBottom: "28px" }}>proofpress.ai · 100K+ visite/mese · 4 posizioni premium su tutte le pagine</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ background: BLACK, color: "#fff" }}>
                      {["Posizione", "Formato", "1 Giorno", "1 Settimana", "1 Mese", "Trimestre", "CPM*"].map((h, i) => (
                        <th key={h} style={{ padding: "12px 14px", textAlign: i === 0 ? "left" : "center", fontWeight: 700, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", background: i === 4 ? "rgba(0,200,150,0.3)" : undefined }}>{h}{i === 4 ? " ★" : ""}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WEB_SLOTS.map((row, i) => (
                      <tr key={row.tag} style={{ background: i % 2 === 0 ? "#fff" : GREY_50, borderBottom: `1px solid ${GREY_200}` }}>
                        <td style={{ padding: "14px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <PosTag type="web" label={row.tag} />
                            <div>
                              <div style={{ fontWeight: 700, color: BLACK }}>{row.name}</div>
                              <div style={{ fontSize: "12px", color: GREY_600, marginTop: "2px" }}>{row.desc}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, fontSize: "12px", color: GREY_600 }}>{row.format}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, color: BLACK }}>{row.g}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, color: BLACK }}>{row.w}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, fontSize: "15px", fontWeight: 700, color: ACCENT_DARK, background: "rgba(0,200,150,0.06)" }}>{row.m}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, color: BLACK }}>{row.q}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, fontSize: "12px", color: GREY_400 }}>{row.cpm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: "12px", color: GREY_400, marginTop: "12px" }}>* CPM calcolato su 100K impression/mese stimate. ★ = prezzo piu conveniente.</p>
            </div>

            {/* LISTINO NEWSLETTER */}
            <div style={{ marginBottom: "56px" }}>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: BLACK }}>Spazi Newsletter Daily</h2>
              <p style={{ fontSize: "14px", color: GREY_600, marginBottom: "28px" }}>3 invii/settimana · 6.651 iscritti · 45% open rate · ~3.000 aperture/invio</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ background: BLACK, color: "#fff" }}>
                      {["Posizione", "Formato", "Singolo Invio", "4 Invii", "12 Invii", "Costo/Apertura"].map((h, i) => (
                        <th key={h} style={{ padding: "12px 14px", textAlign: i === 0 ? "left" : "center", fontWeight: 700, fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", background: i === 4 ? "rgba(0,200,150,0.3)" : undefined }}>{h}{i === 4 ? " ★" : ""}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {NL_SLOTS.map((row, i) => (
                      <tr key={row.tag} style={{ background: i % 2 === 0 ? "#fff" : GREY_50, borderBottom: `1px solid ${GREY_200}` }}>
                        <td style={{ padding: "14px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <PosTag type={row.type} label={row.tag} />
                            <div>
                              <div style={{ fontWeight: 700, color: BLACK }}>{row.name}</div>
                              <div style={{ fontSize: "12px", color: GREY_600, marginTop: "2px" }}>{row.desc}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, fontSize: "12px", color: GREY_600 }}>{row.format}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, color: BLACK }}>{row.s1}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, color: BLACK }}>{row.s4}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, fontSize: "15px", fontWeight: 700, color: ACCENT_DARK, background: "rgba(0,200,150,0.06)" }}>{row.s12}</td>
                        <td style={{ padding: "14px", textAlign: "center", fontFamily: MONO, fontSize: "12px", color: GREY_400 }}>{row.cpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: "12px", color: GREY_400, marginTop: "12px" }}>* Costo/Apertura calcolato su ~3.000 aperture per invio (45% di 6.651). ★ = prezzo piu conveniente.</p>
            </div>

            {/* PACCHETTI */}
            <div style={{ marginBottom: "56px" }}>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: BLACK }}>Pacchetti Combinati — Sito + Newsletter</h2>
              <p style={{ fontSize: "14px", color: GREY_600, marginBottom: "32px" }}>Massimizza reach e frequenza su entrambi i canali. Il team ti supporta nella realizzazione delle creativita.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                {PACKAGES.map((pkg) => (
                  <div key={pkg.name} style={{ border: pkg.featured ? `2px solid ${BLACK}` : `1px solid ${GREY_200}`, borderRadius: "12px", padding: "32px 28px", position: "relative", background: pkg.featured ? BLACK : "#fff", color: pkg.featured ? "#fff" : BLACK, boxShadow: pkg.featured ? "0 8px 32px rgba(0,0,0,0.15)" : "none" }}>
                    {pkg.featured && pkg.badge && (
                      <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: ACCENT, color: "#fff", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "20px", letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{pkg.badge}</div>
                    )}
                    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: pkg.featured ? ACCENT : GREY_400, marginBottom: "6px" }}>{pkg.name}</div>
                    <div style={{ fontFamily: SF_DISPLAY, fontSize: "22px", fontWeight: 900, marginBottom: "4px" }}>{pkg.title}</div>
                    <div style={{ fontFamily: MONO, fontSize: "32px", fontWeight: 700, marginBottom: "2px", color: pkg.featured ? ACCENT : BLACK }}>{pkg.price}</div>
                    <div style={{ fontSize: "13px", color: pkg.featured ? "rgba(255,255,255,0.6)" : GREY_400, marginBottom: "20px" }}>{pkg.period}</div>
                    <div style={{ height: "1px", background: pkg.featured ? "rgba(255,255,255,0.15)" : GREY_200, marginBottom: "20px" }} />
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {pkg.items.map((item, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px" }}>
                          <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0 }}>v</span>
                          <span style={{ color: pkg.featured ? "rgba(255,255,255,0.85)" : GREY_600 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: ACCENT_DARK, background: "rgba(0,200,150,0.08)", padding: "8px 12px", borderRadius: "6px", marginBottom: "20px" }}>{pkg.save}</div>
                    <a href="mailto:pubblicita@proofpress.ai" style={{ display: "block", textAlign: "center", background: pkg.featured ? ACCENT : BLACK, color: "#fff", padding: "12px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>Contattaci</a>
                  </div>
                ))}
              </div>
            </div>

            {/* CONDIZIONI */}
            <div style={{ background: GREY_50, border: `1px solid ${GREY_200}`, borderRadius: "12px", padding: "32px", marginBottom: "56px" }}>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "20px", fontWeight: 700, marginBottom: "20px", color: BLACK }}>Condizioni e note operative</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {CONDITIONS.map((c) => (
                  <div key={c.label} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, background: BLACK, color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", marginTop: "2px", fontFamily: MONO, whiteSpace: "nowrap" }}>{c.label}</span>
                    <span style={{ fontSize: "13px", color: GREY_600, lineHeight: 1.6 }}>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA FINALE */}
            <div style={{ background: BLACK, color: "#fff", borderRadius: "16px", padding: "56px 40px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: ACCENT, marginBottom: "16px" }}>
                Parliamo della tua campagna
              </div>
              <h2 style={{ fontFamily: SF_DISPLAY, fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, marginBottom: "16px", lineHeight: 1.15 }}>
                Vuoi raggiungere i decision maker<br />dell'innovazione italiana?
              </h2>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", maxWidth: "560px", margin: "0 auto 32px" }}>
                Scrivici con il tuo brief e il budget. Il team risponde entro 24h lavorative e ti affianca dalla strategia alla messa online.
              </p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
                <a href="mailto:pubblicita@proofpress.ai" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: ACCENT, color: "#fff", padding: "16px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "16px", textDecoration: "none" }}>
                  Scrivici ora
                </a>
                <a href="https://calendly.com/proofpress/pubblicita" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "16px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "16px", textDecoration: "none" }}>
                  Prenota una call
                </a>
              </div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: MONO, marginBottom: "16px" }}>
                pubblicita@proofpress.ai
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                <span style={{ color: STRIPE_COLOR, fontWeight: 700, fontSize: "16px" }}>S</span>
                Pagamento sicuro via Stripe
              </div>
            </div>

          </main>
          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
