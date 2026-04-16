/**
 * Pagina /cosa-facciamo — Struttura B del menu
 * Tre sezioni con link interni:
 *   1. Cosa Offriamo      → anchor #cosa-offriamo
 *   2. Piattaforma Agentica → /piattaforma
 *   3. Tecnologia Verify  → /proofpress-verify
 */
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

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

/* ── Card voce B del menu ─────────────────────────────────────────── */
function MenuBCard({
  index,
  tag,
  title,
  description,
  href,
  cta,
  accent,
  dark = false,
}: {
  index: string;
  tag: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: string;
  dark?: boolean;
}) {
  const isExternal = href.startsWith("http");
  const inner = (
    <div
      className="group relative border rounded-2xl p-8 md:p-10 transition-all duration-200 hover:shadow-lg cursor-pointer"
      style={{
        background: dark ? "#0a0a0a" : "#fafafa",
        borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.08)",
      }}
    >
      {/* Numero */}
      <div
        className="text-[11px] font-bold tracking-[0.2em] mb-6"
        style={{ color: dark ? "rgba(255,255,255,0.25)" : "rgba(10,10,10,0.25)", fontFamily: FONT }}
      >
        {index}
      </div>

      {/* Tag */}
      <div
        className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] mb-4 px-2.5 py-1 rounded-full"
        style={{ background: accent + "18", color: accent, fontFamily: FONT }}
      >
        {tag}
      </div>

      {/* Titolo */}
      <h3
        className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
        style={{ fontFamily: FONT, color: dark ? "#ffffff" : "#0a0a0a" }}
      >
        {title}
      </h3>

      {/* Descrizione */}
      <p
        className="text-base md:text-lg leading-relaxed mb-8"
        style={{ color: dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.6)", fontFamily: FONT }}
      >
        {description}
      </p>

      {/* CTA */}
      <div
        className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
        style={{ color: accent, fontFamily: FONT }}
      >
        {cta}
        <span className="text-base">→</span>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <Link href={href}>{inner}</Link>;
}

/* ── Componente principale ────────────────────────────────────────── */
export default function CosaFacciamo() {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Cosa Facciamo — ProofPress"
          description="ProofPress: Cosa Offriamo, Piattaforma Agentica e Tecnologia Verify. Giornali AI-native certificati per Creator, Editori e Aziende."
          canonical="https://proofpress.ai/cosa-facciamo"
          ogSiteName="Proof Press"
        />
        <div
          className="min-h-screen"
          style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}
        >
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* ═══════════════════════════════════════════════════════
              HERO
          ═══════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-16 md:pt-32 md:pb-24" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label>Cosa Facciamo</Label>
              <h1
                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-8"
                style={{ fontFamily: FONT, color: "#0a0a0a" }}
              >
                Tre pilastri.<br />
                <span style={{ color: ORANGE }}>Un'unica missione.</span>
              </h1>
              <p
                className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-12"
                style={{ color: "#0a0a0a", opacity: 0.6 }}
              >
                ProofPress costruisce giornali AI-native certificati attraverso tre componenti
                integrati: un'offerta di prodotti e servizi, una piattaforma agentica proprietaria
                e una tecnologia di verifica crittografica unica nel settore.
              </p>

              {/* Anchor nav — link rapidi alle 3 sezioni */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Cosa Offriamo", href: "#cosa-offriamo" },
                  { label: "Piattaforma Agentica", href: "/piattaforma" },
                  { label: "Tecnologia Verify", href: "/proofpress-verify" },
                ].map((item) =>
                  item.href.startsWith("#") ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a]"
                      style={{
                        fontFamily: FONT,
                        color: "#0a0a0a",
                        borderColor: "rgba(10,10,10,0.2)",
                      }}
                    >
                      {item.label} ↓
                    </a>
                  ) : (
                    <Link key={item.label} href={item.href}>
                      <span
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a] cursor-pointer"
                        style={{
                          fontFamily: FONT,
                          color: "#0a0a0a",
                          borderColor: "rgba(10,10,10,0.2)",
                        }}
                      >
                        {item.label} →
                      </span>
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              LE TRE VOCI B — CARD NAVIGABILI
          ═══════════════════════════════════════════════════════ */}
          <Section id="cosa-offriamo">
            <Label>Struttura B — Menu Cosa Facciamo</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Esplora ogni<br />
              <span style={{ color: ORANGE }}>componente.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Ogni voce del menu corrisponde a una dimensione distinta della proposta ProofPress:
              prodotti e servizi, tecnologia agentica e certificazione. Tre livelli di profondità,
              un unico ecosistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MenuBCard
                index="B.1"
                tag="Prodotti & Servizi"
                title="Cosa Offriamo"
                description="Testate digitali chiavi in mano, Newsroom AI-native, distribuzione multicanale, intelligence certificata e licenze tecnologiche per Creator, Editori e Aziende."
                href="#offerta-dettaglio"
                cta="Scopri l'offerta"
                accent={ORANGE}
              />
              <MenuBCard
                index="B.2"
                tag="Tecnologia"
                title="Piattaforma Agentica"
                description="12 agenti AI specializzati che monitorano 4.000+ fonti, producono contenuti certificati e li distribuiscono in automatico su tutti i canali — 24/7, senza interruzioni."
                href="/piattaforma"
                cta="Vai alla piattaforma"
                accent="#0071e3"
              />
              <MenuBCard
                index="B.3"
                tag="Certificazione"
                title="Tecnologia Verify"
                description="Protocollo di validazione agentica con hash crittografico SHA-256. Ogni contenuto genera un Verification Report immutabile, ispirato alla notarizzazione del Web3."
                href="/proofpress-verify"
                cta="Scopri Verify"
                accent="#00c853"
                dark
              />
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              COSA OFFRIAMO — DETTAGLIO
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa" id="offerta-dettaglio">
            <Label>B.1 — Cosa Offriamo</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Giornali completi.<br />
              <span style={{ color: ORANGE }}>Newsroom su misura.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Tre mercati, un'unica piattaforma. Che tu sia un creator, un editore o un'azienda,
              ProofPress ha un modello operativo costruito per le tue esigenze specifiche.
            </p>

            {/* Tre target */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
              {[
                {
                  icon: "✍️",
                  label: "Creator",
                  title: "La tua newsletter diventa una testata.",
                  desc: "Hai una community, un'expertise, una voce. ProofPress ti dà la tecnologia per trasformarla in un giornale digitale completo con verifica automatica dei fatti.",
                },
                {
                  icon: "📰",
                  label: "Editori",
                  title: "Una redazione AI-native al posto tua.",
                  desc: "Riduci i costi di produzione fino all'80% senza sacrificare la qualità. ProofPress gestisce il flusso editoriale completo dalla fonte alla pubblicazione.",
                },
                {
                  icon: "🏢",
                  label: "Aziende",
                  title: "La tua Newsroom interna, certificata.",
                  desc: "Intelligence su mercati, competitor e trend. Report certificati per il board. Comunicazione istituzionale verificata a livello enterprise.",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="border border-[#0a0a0a]/8 rounded-2xl p-8 hover:border-[#0a0a0a]/20 transition-colors"
                  style={{ background: "#ffffff" }}
                >
                  <div className="text-3xl mb-4">{c.icon}</div>
                  <div
                    className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                    style={{ color: ORANGE, fontFamily: FONT }}
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
                    className="text-sm leading-relaxed"
                    style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                  >
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* 6 servizi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { num: "01", title: "Testata digitale chiavi in mano", desc: "Progettiamo e lanciamo la tua testata digitale completa: identità editoriale, pipeline AI, sito web e newsletter. Dal brief al primo articolo in meno di 30 giorni." },
                { num: "02", title: "Newsroom AI-native", desc: "12 agenti AI che monitorano le tue fonti prioritarie, producono brief, articoli e report certificati in automatico. Il tuo team mantiene il controllo editoriale." },
                { num: "03", title: "Distribuzione multicanale", desc: "Ogni contenuto distribuito automaticamente su sito, newsletter, social e API. Un unico repository, zero duplicazioni, massima coerenza del brand editoriale." },
                { num: "04", title: "Intelligence certificata", desc: "Report periodici su mercati, competitor e trend — prodotti dalla piattaforma agentica e certificati con ProofPress Verify. Ideali per board e investor relations." },
                { num: "05", title: "Licenza tecnologica", desc: "Per chi vuole gestire la propria Newsroom in autonomia: licenza della pipeline agentica con supporto tecnico dedicato e aggiornamenti continui." },
                { num: "06", title: "Formazione e onboarding", desc: "Ogni progetto include onboarding del team editoriale: come lavorare con gli agenti AI, supervisionare la produzione automatica e usare ProofPress Verify." },
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
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              LINK ALLE SOTTOPAGINE B.2 e B.3
          ═══════════════════════════════════════════════════════ */}
          <Section>
            <Label>Approfondisci</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Tecnologia e<br />
              <span style={{ color: ORANGE }}>certificazione.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-14"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Dietro ogni contenuto ProofPress ci sono due infrastrutture proprietarie che
              definiscono lo standard del giornalismo AI-native certificato.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* B.2 — Piattaforma Agentica */}
              <Link href="/piattaforma">
                <div
                  className="group relative border border-[#0a0a0a]/8 rounded-2xl p-10 hover:border-[#0071e3]/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  style={{ background: "#f0f7ff" }}
                >
                  <div
                    className="text-[11px] font-bold tracking-[0.2em] mb-4"
                    style={{ color: "#0071e3", fontFamily: FONT }}
                  >
                    B.2 — PIATTAFORMA AGENTICA
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    12 agenti AI.<br />4.000+ fonti.<br />24/7.
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
                  >
                    La pipeline agentica end-to-end: dal monitoraggio delle fonti alla pubblicazione
                    certificata. Architettura modulare, scalabile, enterprise-ready.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { num: "12", label: "Agenti specializzati" },
                      { num: "4.000+", label: "Fonti monitorate" },
                      { num: "< 5 min", label: "Dal segnale all'articolo" },
                      { num: "24/7", label: "Produzione continua" },
                    ].map((s) => (
                      <div key={s.label}>
                        <div
                          className="text-2xl font-black"
                          style={{ fontFamily: FONT, color: "#0071e3" }}
                        >
                          {s.num}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "#0a0a0a", opacity: 0.5, fontFamily: FONT }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
                    style={{ color: "#0071e3", fontFamily: FONT }}
                  >
                    Esplora la piattaforma →
                  </div>
                </div>
              </Link>

              {/* B.3 — Tecnologia Verify */}
              <Link href="/proofpress-verify">
                <div
                  className="group relative border border-white/10 rounded-2xl p-10 hover:border-[#00c853]/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  style={{ background: "#0a0a0a" }}
                >
                  <div
                    className="text-[11px] font-bold tracking-[0.2em] mb-4"
                    style={{ color: "#00c853", fontFamily: FONT }}
                  >
                    B.3 — TECNOLOGIA VERIFY
                  </div>
                  <h3
                    className="text-2xl md:text-3xl font-black leading-tight tracking-tight mb-4"
                    style={{ fontFamily: FONT, color: "#ffffff" }}
                  >
                    La certificazione<br />che non si<br />può falsificare.
                  </h3>
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: "rgba(255,255,255,0.55)", fontFamily: FONT }}
                  >
                    Protocollo di validazione agentica con hash SHA-256. Ogni contenuto genera
                    un Verification Report immutabile, ispirato alla notarizzazione del Web3.
                    Compliance-ready per l'AI Act europeo.
                  </p>
                  <div className="flex flex-col gap-2 mb-8">
                    {[
                      "Analisi multi-fonte con score 0–100",
                      "Verification Report strutturato",
                      "Hash crittografico SHA-256 immutabile",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <span style={{ color: "#00c853", fontSize: "12px" }}>✓</span>
                        <span
                          className="text-sm"
                          style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all duration-200 group-hover:gap-3"
                    style={{ color: "#00c853", fontFamily: FONT }}
                  >
                    Scopri Verify →
                  </div>
                </div>
              </Link>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CTA FINALE
          ═══════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label light>Inizia ora</Label>
              <h2
                className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
                style={{ fontFamily: FONT, color: "#ffffff" }}
              >
                Costruiamo insieme.<br />
                <span style={{ color: ORANGE }}>Chiamaci.</span>
              </h2>
              <p
                className="text-lg md:text-xl leading-relaxed max-w-2xl mb-10"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT }}
              >
                Che tu voglia lanciare una testata, costruire una Newsroom aziendale o capire
                se ProofPress fa al caso tuo — scrivici. Risponderemo entro 24 ore.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contatti">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 cursor-pointer"
                    style={{ background: ORANGE, color: "#ffffff", fontFamily: FONT }}
                  >
                    Parla con il team →
                  </span>
                </Link>
                <Link href="/piattaforma">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-white/20 transition-all duration-200 hover:border-white/40 cursor-pointer"
                    style={{ color: "#ffffff", fontFamily: FONT }}
                  >
                    Esplora la piattaforma
                  </span>
                </Link>
                <Link href="/proofpress-verify">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-white/20 transition-all duration-200 hover:border-white/40 cursor-pointer"
                    style={{ color: "#ffffff", fontFamily: FONT }}
                  >
                    Scopri Verify
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
