/**
 * Pagina /cosa-facciamo — ProofPress
 * Riscrittura completa con 17 miglioramenti (analisi 25 Apr 2026):
 *   1.  Rimosse etichette interne "Struttura B / B.1 / B.2 / B.3"
 *   2.  Fix heading concatenati (spazi espliciti {" "})
 *   3.  Sottotitolo hero riscritto in italiano piano
 *   4.  CTA hero: una sola primaria + due secondarie testuali
 *   5.  Ridondanza eliminata: tre pilastri presentati una sola volta
 *   6.  "Per chi lavoriamo" separato da "Cosa includono i progetti"
 *   7.  Copy Editori: "al posto tuo" → "accanto al tuo team"
 *   8.  Numeri agenti allineati: "12 Agent specializzati base"
 *   9.  Stat 5 min: aggiunto "inclusa la verifica multi-fonte"
 *   10. CTA finale: una sola primaria + due link testuali secondari
 *   11. Mini-blocco "Chi siamo / il team" aggiunto
 *   12. Social proof: numeri reali (37+ articoli certificati, 4.000+ fonti, ecc.)
 *   13. Terminologia uniforme: "Agent" (unità) + "Redazione agentica" (insieme)
 *   14. Missione esplicitata sotto il titolo hero
 *   15. Anchor #cosa-offriamo sincronizzato con etichetta sezione
 *   16. SEO title migliorato + H1 unico verificato
 *   17. Testi accessibili card puliti (niente "B.x" nei label)
 */
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";
const BLUE = "#0071e3";
const GREEN = "#00c853";

/* ── Helpers ──────────────────────────────────────────────────────── */
function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ fontFamily: FONT, color: light ? "rgba(255,255,255,0.4)" : "rgba(10,10,10,0.4)" }}
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

function Section({
  children,
  bg = "#ffffff",
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) {
  return (
    <section id={id} className="py-20 md:py-28" style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

/* ── Componente principale ────────────────────────────────────────── */
export default function CosaFacciamo() {
  return (
    <div className="flex min-h-screen">
      
      <div className="flex-1 min-w-0">
        {/* #16 — SEO title migliorato */}
        <SEOHead
          title="Cosa Facciamo — Testate AI-native, Redazioni agentiche e Verifica certificata | ProofPress"
          description="ProofPress costruisce giornali, redazioni e newsletter generate da AI e verificate alla fonte. Tre prodotti integrati per Creator, Editori e Aziende."
          canonical="https://proofpress.ai/cosa-facciamo"
          ogSiteName="Proof Press"
        />
        <div
          className="min-h-screen"
          style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}
        >
          <SharedPageHeader />
          {/* ═══════════════════════════════════════════════════════
              HERO — #2 fix heading, #3 sottotitolo, #4 CTA unica, #14 missione
          ═══════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-16 md:pt-32 md:pb-24" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label>Cosa Facciamo</Label>
              {/* #16 — H1 unico */}
              <h1
                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6"
                style={{ fontFamily: FONT, color: "#0a0a0a" }}
              >
                Tre prodotti.{" "}
                <span style={{ color: ORANGE }}>Un'unica missione.</span>
              </h1>
              {/* #14 — Missione esplicitata */}
              <p
                className="text-base font-semibold mb-6 max-w-2xl"
                style={{ color: ORANGE, fontFamily: FONT }}
              >
                La nostra missione: rendere il giornalismo affidabile compatibile con la velocità dell'AI.
              </p>
              {/* #3 — Sottotitolo riscritto in italiano piano */}
              <p
                className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-12"
                style={{ color: "#0a0a0a", opacity: 0.6 }}
              >
                Costruiamo giornali, redazioni e newsletter generate da AI e verificate alla fonte.
                Tre prodotti integrati, una sola missione: rendere l'informazione veloce,
                scalabile e affidabile.
              </p>

              {/* #4 — CTA: una primaria + due secondarie testuali */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Link href="/contatti">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
                    style={{ background: ORANGE, color: "#ffffff", fontFamily: FONT }}
                  >
                    Parla con il team →
                  </span>
                </Link>
              </div>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#cosa-offriamo"
                  className="text-sm font-semibold hover:underline"
                  style={{ color: "rgba(10,10,10,0.45)", fontFamily: FONT }}
                >
                  Scopri i tre prodotti ↓
                </a>
                <span style={{ color: "rgba(10,10,10,0.2)" }}>·</span>
                <Link href="/piattaforma">
                  <span
                    className="text-sm font-semibold hover:underline cursor-pointer"
                    style={{ color: "rgba(10,10,10,0.45)", fontFamily: FONT }}
                  >
                    Piattaforma agentica →
                  </span>
                </Link>
                <span style={{ color: "rgba(10,10,10,0.2)" }}>·</span>
                <Link href="/proofpress-verify">
                  <span
                    className="text-sm font-semibold hover:underline cursor-pointer"
                    style={{ color: "rgba(10,10,10,0.45)", fontFamily: FONT }}
                  >
                    Tecnologia Verify →
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              #12 — SOCIAL PROOF: numeri reali
          ═══════════════════════════════════════════════════════ */}
          <section className="py-12" style={{ background: "#fafafa" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { num: "37+", label: "Articoli certificati pubblicati" },
                  { num: "4.000+", label: "Fonti monitorate ogni giorno" },
                  { num: "< 5 min", label: "Dal segnale all'articolo, verifica inclusa" },
                  { num: "3", label: "Testate pilota attive in Italia" },
                ].map((s) => (
                  <div key={s.label} className="text-center md:text-left">
                    <div
                      className="text-3xl md:text-4xl font-black mb-1"
                      style={{ fontFamily: FONT, color: BLUE }}
                    >
                      {s.num}
                    </div>
                    <div
                      className="text-sm leading-snug"
                      style={{ color: "#0a0a0a", opacity: 0.5, fontFamily: FONT }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              #5 — I TRE PRODOTTI (una sola volta, 3 card)
              #1 — Niente etichette B.x
              #17 — Testi accessibili puliti
          ═══════════════════════════════════════════════════════ */}
          <Section id="cosa-offriamo">
            <Label>I tre prodotti</Label>
            {/* #2 — Fix heading */}
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Offerta, Tecnologia{" "}
              <span style={{ color: ORANGE }}>e Certificazione.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Tre dimensioni distinte della proposta ProofPress: prodotti e servizi concreti,
              la Redazione agentica proprietaria e il protocollo di certificazione crittografica.
              Un unico ecosistema integrato.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Offerta */}
              <a href="#per-chi-lavoriamo" aria-label="Scopri l'offerta ProofPress">
                <div
                  className="group relative border border-[#0a0a0a]/8 rounded-2xl p-8 md:p-10 transition-all duration-200 hover:border-[#ff5500]/30 hover:shadow-lg cursor-pointer h-full"
                  style={{ background: "#fafafa" }}
                >
                  <div
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] mb-4 px-2.5 py-1 rounded-full"
                    style={{ background: ORANGE + "18", color: ORANGE, fontFamily: FONT }}
                  >
                    Prodotti &amp; Servizi
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    Giornali completi.{" "}
                    <span style={{ color: ORANGE }}>Newsroom su misura.</span>
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "rgba(10,10,10,0.6)", fontFamily: FONT }}
                  >
                    Testate digitali chiavi in mano, Newsroom AI-native, distribuzione multicanale,
                    intelligence certificata e licenze tecnologiche per Creator, Editori e Aziende.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
                    style={{ color: ORANGE, fontFamily: FONT }}
                  >
                    Scopri l'offerta <span className="text-base">→</span>
                  </div>
                </div>
              </a>

              {/* Tecnologia */}
              <Link href="/piattaforma" aria-label="Esplora la piattaforma agentica ProofPress">
                <div
                  className="group relative border border-[#0a0a0a]/8 rounded-2xl p-8 md:p-10 transition-all duration-200 hover:border-[#0071e3]/30 hover:shadow-lg cursor-pointer h-full"
                  style={{ background: "#f0f7ff" }}
                >
                  <div
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] mb-4 px-2.5 py-1 rounded-full"
                    style={{ background: BLUE + "18", color: BLUE, fontFamily: FONT }}
                  >
                    Tecnologia
                  </div>
                  {/* #2 — Fix heading, #8 — numeri allineati */}
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    12 Agent specializzati.{" "}
                    <span style={{ color: BLUE }}>4.000+ fonti. 24/7.</span>
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "rgba(10,10,10,0.6)", fontFamily: FONT }}
                  >
                    {/* #13 — Terminologia: "Redazione agentica" + "Agent" */}
                    La Redazione agentica end-to-end: dal monitoraggio delle fonti alla pubblicazione
                    certificata. Architettura modulare, scalabile, enterprise-ready.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
                    style={{ color: BLUE, fontFamily: FONT }}
                  >
                    Vai alla piattaforma <span className="text-base">→</span>
                  </div>
                </div>
              </Link>

              {/* Certificazione */}
              <Link href="/proofpress-verify" aria-label="Scopri la tecnologia Verify di ProofPress">
                <div
                  className="group relative border border-white/10 rounded-2xl p-8 md:p-10 transition-all duration-200 hover:border-[#00c853]/30 hover:shadow-lg cursor-pointer h-full"
                  style={{ background: "#0a0a0a" }}
                >
                  <div
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] mb-4 px-2.5 py-1 rounded-full"
                    style={{ background: GREEN + "25", color: GREEN, fontFamily: FONT }}
                  >
                    Certificazione
                  </div>
                  {/* #2 — Fix heading */}
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#ffffff" }}
                  >
                    La certificazione{" "}
                    <span style={{ color: GREEN }}>che non si può falsificare.</span>
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "rgba(255,255,255,0.55)", fontFamily: FONT }}
                  >
                    Protocollo SHA-256, Verification Report strutturato, compliance AI Act europeo.
                    Ogni contenuto ProofPress è verificabile nel tempo.
                  </p>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
                    style={{ color: GREEN, fontFamily: FONT }}
                  >
                    Scopri Verify <span className="text-base">→</span>
                  </div>
                </div>
              </Link>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              #6 — PER CHI LAVORIAMO (separato dai servizi)
              #7 — Copy Editori corretto
              #13 — Terminologia uniforme
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa" id="per-chi-lavoriamo">
            <Label>Per chi lavoriamo</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Tre mercati.{" "}
              <span style={{ color: ORANGE }}>Un'unica piattaforma.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Che tu sia un creator, un editore o un'azienda, ProofPress ha un modello operativo
              costruito per le tue esigenze specifiche — con prezzi, tempi e KPI definiti.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "✍️",
                  label: "Creator",
                  title: "La tua newsletter diventa una testata.",
                  desc: "Hai una community, un'expertise, una voce. ProofPress ti dà la Redazione agentica per trasformarla in un giornale digitale completo con verifica automatica dei fatti.",
                  cta: "ProofPress Creator",
                  href: "/offertacommerciale",
                  color: ORANGE,
                },
                {
                  icon: "📰",
                  label: "Editori",
                  // #7 — "al posto tua" → "accanto al tuo team"
                  title: "Una Redazione agentica che lavora accanto al tuo team.",
                  desc: "Riduci i costi di produzione fino all'80% senza sacrificare la qualità. ProofPress gestisce il flusso editoriale completo dalla fonte alla pubblicazione, con supervisione editoriale umana obbligatoria.",
                  cta: "Scopri il modello",
                  href: "/contatti",
                  color: BLUE,
                },
                {
                  icon: "🏢",
                  label: "Aziende",
                  title: "La tua Newsroom interna, certificata.",
                  desc: "Intelligence su mercati, competitor e trend. Report certificati per il board. Comunicazione istituzionale verificata a livello enterprise.",
                  cta: "Newsroom aziendale",
                  href: "/contatti",
                  color: GREEN,
                },
              ].map((c) => (
                <Link key={c.label} href={c.href}>
                  <div
                    className="group border border-[#0a0a0a]/8 rounded-2xl p-8 hover:border-[#0a0a0a]/20 hover:shadow-md transition-all duration-200 cursor-pointer h-full"
                    style={{ background: "#ffffff" }}
                  >
                    <div className="text-3xl mb-4">{c.icon}</div>
                    <div
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                      style={{ color: c.color, fontFamily: FONT }}
                    >
                      {c.label}
                    </div>
                    <h3
                      className="text-xl font-black mb-3 leading-tight"
                      style={{ fontFamily: FONT, color: "#0a0a0a" }}
                    >
                      {c.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-6"
                      style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                    >
                      {c.desc}
                    </p>
                    <div
                      className="text-sm font-bold transition-all duration-200 group-hover:underline"
                      style={{ color: c.color, fontFamily: FONT }}
                    >
                      {c.cta} →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              #6 — COSA INCLUDONO I PROGETTI (separato da "per chi")
              #8 — Numeri agenti allineati
              #9 — Stat 5 min con chiarimento
              #13 — Terminologia uniforme
          ═══════════════════════════════════════════════════════ */}
          <Section id="cosa-offriamo-dettaglio">
            <Label>Cosa includono i nostri progetti</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Sei servizi.{" "}
              <span style={{ color: ORANGE }}>Un ecosistema completo.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Ogni progetto ProofPress include una combinazione di questi sei servizi,
              configurata in base al tuo mercato, al tuo team e ai tuoi obiettivi editoriali.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  num: "01",
                  title: "Testata digitale chiavi in mano",
                  desc: "Progettiamo e lanciamo la tua testata digitale completa: identità editoriale, Redazione agentica, sito web e newsletter. Dal brief al primo articolo in meno di 30 giorni.",
                },
                {
                  num: "02",
                  // #8 — "12 Agent specializzati base" allineato con /piattaforma
                  title: "Newsroom AI-native",
                  desc: "12 Agent specializzati base che monitorano le tue fonti prioritarie, producono brief, articoli e report certificati in automatico. Il tuo team mantiene il controllo editoriale su ogni contenuto pubblicato.",
                },
                {
                  num: "03",
                  title: "Distribuzione multicanale",
                  desc: "Ogni contenuto distribuito automaticamente su sito, newsletter, social e API. Un unico repository, zero duplicazioni, massima coerenza del brand editoriale.",
                },
                {
                  num: "04",
                  title: "Intelligence certificata",
                  desc: "Report periodici su mercati, competitor e trend — prodotti dalla Redazione agentica e certificati con ProofPress Verify. Ideali per board e investor relations.",
                },
                {
                  num: "05",
                  title: "Licenza tecnologica",
                  desc: "Per chi vuole gestire la propria Newsroom in autonomia: licenza della Redazione agentica con supporto tecnico dedicato e aggiornamenti continui.",
                },
                {
                  num: "06",
                  title: "Formazione e onboarding",
                  desc: "Ogni progetto include onboarding del team editoriale: come lavorare con gli Agent, supervisionare la produzione automatica e usare ProofPress Verify.",
                },
              ].map((s) => (
                <div key={s.num} className="flex gap-6">
                  <div
                    className="text-[11px] font-bold tracking-[0.2em] text-[#0a0a0a]/25 pt-1 shrink-0 w-6"
                    style={{ fontFamily: FONT }}
                  >
                    {s.num}
                  </div>
                  <div>
                    <h4
                      className="text-lg font-bold mb-2"
                      style={{ fontFamily: FONT, color: "#0a0a0a" }}
                    >
                      {s.title}
                    </h4>
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* #9 — Stat 5 min con chiarimento "verifica inclusa" */}
            <div
              className="mt-12 border rounded-2xl px-8 py-6 flex flex-col md:flex-row items-start md:items-center gap-4"
              style={{ background: "#f0f7ff", borderColor: BLUE + "25" }}
            >
              <div
                className="text-4xl font-black shrink-0"
                style={{ color: BLUE, fontFamily: FONT }}
              >
                &lt; 5 min
              </div>
              <div>
                <div
                  className="text-base font-bold mb-1"
                  style={{ color: "#0a0a0a", fontFamily: FONT }}
                >
                  Dal segnale all'articolo pubblicato.
                </div>
                <div
                  className="text-sm"
                  style={{ color: "#0a0a0a", opacity: 0.55, fontFamily: FONT }}
                >
                  Inclusa la verifica multi-fonte, la generazione della prima bozza e l'ottimizzazione SEO.
                  La revisione editoriale umana richiede in media ulteriori 5–15 minuti.
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              #11 — MINI-BLOCCO CHI SIAMO / TEAM
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa">
            <Label>Il team</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Giornalismo, AI engineering{" "}
              <span style={{ color: ORANGE }}>e prodotto.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-10"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              ProofPress nasce dall'incontro tra competenze editoriali, ingegneria AI e strategia di prodotto.
              Un team multidisciplinare con radici nel giornalismo digitale italiano e nell'AI engineering
              applicato ai media — con sede a Milano.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: "📰",
                  area: "Giornalismo",
                  desc: "Editor, direttori e giornalisti con esperienza in testate nazionali e internazionali. Ogni contenuto AI è supervisionato da un professionista.",
                },
                {
                  icon: "🤖",
                  area: "AI Engineering",
                  desc: "Ingegneri specializzati in architetture multi-agente, LLM fine-tuning e pipeline editoriali automatizzate. La Redazione agentica è sviluppata interamente in-house.",
                },
                {
                  icon: "🚀",
                  area: "Prodotto & Strategia",
                  desc: "Product manager e strategist con esperienza in scale-up media e AI-native. Ogni progetto è gestito con metodologia agile e KPI editoriali misurabili.",
                },
              ].map((t) => (
                <div
                  key={t.area}
                  className="border border-[#0a0a0a]/8 rounded-2xl p-6"
                  style={{ background: "#ffffff" }}
                >
                  <div className="text-3xl mb-3">{t.icon}</div>
                  <div
                    className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                    style={{ color: ORANGE, fontFamily: FONT }}
                  >
                    {t.area}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#0a0a0a", opacity: 0.65, fontFamily: FONT }}
                  >
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>

            <Link href="/chi-siamo">
              <span
                className="inline-flex items-center gap-2 text-sm font-bold cursor-pointer hover:underline"
                style={{ color: ORANGE, fontFamily: FONT }}
              >
                Conosci il team completo →
              </span>
            </Link>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CTA FINALE — #10 una sola primaria + due link testuali
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label light>Inizia ora</Label>
              <h2
                className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
                style={{ fontFamily: FONT, color: "#ffffff" }}
              >
                Costruiamo insieme.{" "}
                <span style={{ color: ORANGE }}>Chiamaci.</span>
              </h2>
              <p
                className="text-lg md:text-xl leading-relaxed max-w-2xl mb-10"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT }}
              >
                Che tu voglia lanciare una testata, costruire una Newsroom aziendale o capire
                se ProofPress fa al caso tuo — scrivici. Risponderemo entro 24 ore.
              </p>

              {/* #10 — Una sola CTA primaria */}
              <div className="mb-6">
                <Link href="/contatti">
                  <span
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
                    style={{ background: ORANGE, color: "#ffffff", fontFamily: FONT }}
                  >
                    Parla con il team →
                  </span>
                </Link>
              </div>

              {/* Due link testuali secondari */}
              <div className="flex flex-wrap gap-4">
                <Link href="/piattaforma">
                  <span
                    className="text-sm font-semibold hover:underline cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.4)", fontFamily: FONT }}
                  >
                    oppure: esplora la piattaforma
                  </span>
                </Link>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                <Link href="/proofpress-verify">
                  <span
                    className="text-sm font-semibold hover:underline cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.4)", fontFamily: FONT }}
                  >
                    scopri Verify
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
