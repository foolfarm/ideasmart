/**
 * Pagina /cosa-facciamo — Cosa Facciamo
 * Layout identico a /chi-siamo-story: LeftSidebar + SharedPageHeader + BreakingNewsTicker + SharedPageFooter
 * Target: Creator, Editori, Aziende — Giornali completi e Newsroom su tecnologia ProofPress
 */
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import ContactForm from "@/components/ContactForm";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ORANGE = "#ff5500";

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-4"
      style={{ fontFamily: FONT }}
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

function NumberedCard({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 md:gap-8">
      <div
        className="text-[11px] font-bold tracking-[0.2em] text-[#0a0a0a]/25 pt-1 shrink-0 w-6"
        style={{ fontFamily: FONT }}
      >
        {num}
      </div>
      <div>
        <h3
          className="text-xl md:text-2xl font-bold mb-3"
          style={{ fontFamily: FONT, color: "#0a0a0a" }}
        >
          {title}
        </h3>
        <p
          className="text-base md:text-lg leading-relaxed"
          style={{ color: "#0a0a0a", opacity: 0.6, fontFamily: FONT }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

function AudienceCard({
  icon,
  label,
  title,
  description,
  detail,
}: {
  icon: string;
  label: string;
  title: string;
  description: string;
  detail: string;
}) {
  return (
    <div
      className="border border-[#0a0a0a]/8 rounded-2xl p-8 md:p-10 hover:border-[#0a0a0a]/20 transition-colors"
      style={{ background: "#fafafa" }}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <div
        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
        style={{ color: ORANGE, fontFamily: FONT }}
      >
        {label}
      </div>
      <h3
        className="text-2xl md:text-3xl font-black mb-4 leading-tight"
        style={{ fontFamily: FONT, color: "#0a0a0a" }}
      >
        {title}
      </h3>
      <p
        className="text-base md:text-lg leading-relaxed mb-4"
        style={{ color: "#0a0a0a", opacity: 0.65, fontFamily: FONT }}
      >
        {description}
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "#0a0a0a", opacity: 0.45, fontFamily: FONT }}
      >
        {detail}
      </p>
    </div>
  );
}

export default function CosaFacciamo() {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="Cosa Facciamo — ProofPress"
          description="ProofPress costruisce giornali completi e Newsroom AI-native per Creator, Editori e Aziende. Tecnologia agentica certificata, distribuzione multicanale, ProofPress Verify."
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
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label>Cosa Facciamo</Label>
              <h1
                className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight mb-8"
                style={{ fontFamily: FONT, color: "#0a0a0a" }}
              >
                Costruiamo giornali.<br />
                <span style={{ color: ORANGE }}>Con l'AI.</span><br />
                Per te.
              </h1>
              <p
                className="text-xl md:text-2xl leading-relaxed max-w-3xl"
                style={{ color: "#0a0a0a", opacity: 0.6 }}
              >
                ProofPress progetta e gestisce testate digitali complete e Newsroom AI-native
                per Creator, Editori e Aziende. Dalla produzione dei contenuti alla distribuzione
                certificata — tutto su un'unica piattaforma agentica.
              </p>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              A CHI CI RIVOLGIAMO
          ═══════════════════════════════════════════════════════ */}
          <Section id="audience">
            <Label>A chi ci rivolgiamo</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Tre mercati.<br />
              <span style={{ color: ORANGE }}>Un'unica piattaforma.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-16"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Che tu sia un creator con una community da monetizzare, un editore che vuole
              ridurre i costi di produzione o un'azienda che ha bisogno di una Newsroom
              interna certificata, ProofPress ha un modello costruito per te.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AudienceCard
                icon="✍️"
                label="Creator"
                title="La tua newsletter diventa una testata."
                description="Hai una community, un'expertise, una voce. ProofPress ti dà la tecnologia per trasformarla in un giornale digitale completo: articoli, newsletter, verifica automatica dei fatti."
                detail="Ideale per creator con 1.000+ follower, autori di newsletter, podcaster e divulgatori che vogliono monetizzare la propria audience con contenuti di qualità editoriale."
              />
              <AudienceCard
                icon="📰"
                label="Editori"
                title="Una redazione AI-native al posto tua."
                description="Riduci i costi di produzione fino all'80% senza sacrificare la qualità. ProofPress gestisce il flusso editoriale completo: monitoraggio fonti, scrittura, titolazione, pubblicazione e distribuzione."
                detail="Pensato per testate digitali, media company, agenzie editoriali e publisher che vogliono scalare la produzione senza aumentare il team."
              />
              <AudienceCard
                icon="🏢"
                label="Aziende"
                title="La tua Newsroom interna, certificata."
                description="Intelligence su mercati, competitor e trend. Report certificati per il board. Comunicazione istituzionale verificata. ProofPress porta il giornalismo aziendale a un livello enterprise."
                detail="Adatto a corporate communication, investor relations, compliance, uffici legali e C-suite che necessitano di informazione verificata per decisioni strategiche."
              />
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              COSA OFFRIAMO
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#fafafa" id="offerta">
            <Label>Cosa offriamo</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-16"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Giornali completi.<br />
              <span style={{ color: ORANGE }}>Newsroom su misura.</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              <div className="space-y-10">
                <NumberedCard num="01" title="Testata digitale chiavi in mano">
                  Progettiamo e lanciamo la tua testata digitale completa: identità editoriale,
                  architettura dei contenuti, pipeline di produzione AI, sito web e newsletter.
                  Dalla strategia al primo articolo pubblicato in meno di 30 giorni.
                </NumberedCard>
                <NumberedCard num="02" title="Newsroom AI-native">
                  Implementiamo una Newsroom interna basata sulla tecnologia ProofPress:
                  12 agenti AI che monitorano le tue fonti prioritarie, producono brief,
                  articoli e report certificati in automatico. Il tuo team mantiene il controllo editoriale.
                </NumberedCard>
                <NumberedCard num="03" title="Distribuzione multicanale">
                  Ogni contenuto prodotto viene distribuito automaticamente su tutti i canali:
                  sito web, newsletter, social, API. Un unico repository, zero duplicazioni,
                  massima coerenza del brand editoriale.
                </NumberedCard>
              </div>
              <div className="space-y-10">
                <NumberedCard num="04" title="Intelligence certificata">
                  Report periodici su mercati, competitor, trend e normative — prodotti dalla
                  piattaforma agentica e certificati con ProofPress Verify. Ideali per board,
                  investor relations e decisioni strategiche che richiedono fonti verificabili.
                </NumberedCard>
                <NumberedCard num="05" title="Licenza tecnologica">
                  Per chi vuole gestire la propria Newsroom in autonomia: licenza della pipeline
                  agentica ProofPress, con dashboard self-service, API Verify e supporto dedicato.
                  Da €690/mese, scalabile sul volume di contenuti.
                </NumberedCard>
                <NumberedCard num="06" title="Formazione e onboarding">
                  Ogni progetto include un percorso di onboarding del team editoriale:
                  come lavorare con gli agenti AI, come supervisionare la produzione automatica,
                  come usare ProofPress Verify per la verifica dei fatti.
                </NumberedCard>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              COME FUNZIONA LA TECNOLOGIA
          ═══════════════════════════════════════════════════════ */}
          <Section id="tecnologia">
            <Label>La tecnologia</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Come funziona<br />
              <span style={{ color: ORANGE }}>la piattaforma ProofPress.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-16"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Una pipeline agentica end-to-end: dal monitoraggio delle fonti alla pubblicazione
              certificata. Dodici agenti AI specializzati lavorano in parallelo 24 ore su 24,
              7 giorni su 7, senza interruzioni.
            </p>

            {/* Flow visivo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
              {[
                {
                  step: "01",
                  title: "Monitoraggio",
                  desc: "4.000+ fonti analizzate in tempo reale: siti, feed RSS, social, database accademici e istituzionali.",
                },
                {
                  step: "02",
                  title: "Selezione",
                  desc: "Agenti di selezione filtrano i segnali rilevanti per il tuo verticale editoriale, eliminando il rumore.",
                },
                {
                  step: "03",
                  title: "Produzione",
                  desc: "Agenti di scrittura producono articoli, brief, titoli e sommari ottimizzati per web e newsletter.",
                },
                {
                  step: "04",
                  title: "Certificazione",
                  desc: "ProofPress Verify analizza ogni contenuto e genera un Verification Report sigillato con hash SHA-256.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border border-[#0a0a0a]/8 rounded-xl p-6"
                  style={{ background: "#fafafa" }}
                >
                  <div
                    className="text-[11px] font-bold tracking-[0.2em] mb-3"
                    style={{ color: ORANGE, fontFamily: FONT }}
                  >
                    {item.step}
                  </div>
                  <h4
                    className="text-lg font-bold mb-2"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#0a0a0a", opacity: 0.55, fontFamily: FONT }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Stat bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#0a0a0a]/8 pt-12">
              {[
                { num: "12", label: "Agenti AI specializzati" },
                { num: "4.000+", label: "Fonti monitorate" },
                { num: "24/7", label: "Produzione continua" },
                { num: "< 5 min", label: "Dal segnale all'articolo" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="text-4xl md:text-5xl font-black mb-2"
                    style={{ fontFamily: FONT, color: "#0a0a0a" }}
                  >
                    {s.num}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "#0a0a0a", opacity: 0.45, fontFamily: FONT }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              PROOFPRESS VERIFY
          ═══════════════════════════════════════════════════════ */}
          <Section bg="#0a0a0a" id="verify">
            <div className="max-w-3xl">
              <Label>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>ProofPress Verify</span>
              </Label>
              <h2
                className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-6"
                style={{ fontFamily: FONT, color: "#ffffff" }}
              >
                La certificazione<br />
                <span style={{ color: ORANGE }}>che non si può falsificare.</span>
              </h2>
              <p
                className="text-lg md:text-xl leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: FONT }}
              >
                ProofPress Verify è il protocollo di validazione agentica integrato in ogni
                contenuto prodotto dalla piattaforma. Non è un badge. È un sistema crittografico
                di certificazione ispirato alla notarizzazione del Web3.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Analisi multi-fonte",
                  desc: "Ogni contenuto viene confrontato con fonti primarie, secondarie e database accademici. Il sistema misura affidabilità, coerenza fattuale e obiettività su scala 0–100.",
                },
                {
                  title: "Verification Report",
                  desc: "Ogni notizia genera un Verification Report strutturato con gli esiti dell'analisi: fonti consultate, score di affidabilità, segnalazioni di incongruenze e raccomandazioni editoriali.",
                },
                {
                  title: "Hash crittografico SHA-256",
                  desc: "Il report viene sigillato con un hash crittografico immutabile. Contenuto, esiti e criteri di analisi sono tracciabili, verificabili nel tempo e impossibili da alterare retroattivamente.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <h4
                    className="text-lg font-bold mb-3"
                    style={{ fontFamily: FONT, color: "#ffffff" }}
                  >
                    {card.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: FONT }}
                  >
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="mt-12 border border-white/10 rounded-2xl p-8 md:p-10"
              style={{ background: "rgba(255,85,0,0.08)" }}
            >
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{ color: "rgba(255,255,255,0.7)", fontFamily: FONT }}
              >
                <span style={{ color: ORANGE, fontWeight: 700 }}>Takeaway per il board:</span>{" "}
                nell'era dell'AI Act europeo e della disinformazione sistemica, la certificazione
                crittografica dei contenuti non è un differenziale — è un requisito di compliance.
                Chi la adotta ora costruisce un moat difendibile. Chi aspetta, insegue.
              </p>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════
              CTA — CONTATTACI
          ═══════════════════════════════════════════════════════ */}
          <Section id="contatti">
            <Label>Inizia ora</Label>
            <h2
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4"
              style={{ fontFamily: FONT, color: "#0a0a0a" }}
            >
              Chiamaci.<br />
              <span style={{ color: ORANGE }}>Costruiamo insieme.</span>
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-2xl mb-12"
              style={{ color: "#0a0a0a", opacity: 0.6 }}
            >
              Che tu voglia lanciare una testata, costruire una Newsroom aziendale o semplicemente
              capire se ProofPress fa al caso tuo — scrivici. Risponderemo entro 24 ore con
              una proposta su misura.
            </p>
            <ContactForm origine="Cosa Facciamo — ProofPress" />
          </Section>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
