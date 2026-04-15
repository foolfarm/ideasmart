/**
 * Pagina /storia — La storia di ProofPress
 * Design: Apple-style · Sfondo bianco ghiaccio · Palette monocromatica
 * Contenuto: dal documento ProofPress_.docx — senza citare Andrea Cinelli
 */
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SEOHead from "@/components/SEOHead";
import LeftSidebar from "@/components/LeftSidebar";
import { Link } from "wouter";

// ─── Design tokens Apple-style ────────────────────────────────────────────────
const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

const BG        = "#f5f5f7";
const BG_CARD   = "#ffffff";
const BG_DARK   = "#1d1d1f";
const TEXT_PRI  = "#1d1d1f";
const TEXT_SEC  = "#6e6e73";
const TEXT_TER  = "#aeaeb2";
const BORDER_LT = "#e8e8ed";
const ACCENT    = "#ff5500";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", color: TEXT_SEC, fontFamily: SF, marginBottom: "12px",
    }}>{children}</p>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote style={{
      margin: "32px 0",
      padding: "24px 28px",
      background: BG_CARD,
      border: `1px solid ${BORDER_LT}`,
      borderLeft: `4px solid ${BG_DARK}`,
      borderRadius: "0 12px 12px 0",
    }}>
      <p style={{
        fontFamily: SF_DISPLAY,
        fontSize: "clamp(16px, 2vw, 19px)",
        fontWeight: 500,
        color: TEXT_PRI,
        lineHeight: 1.65,
        margin: 0,
        fontStyle: "italic",
      }}>{children}</p>
    </blockquote>
  );
}

function ChapterTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: SF_DISPLAY,
      fontSize: "clamp(20px, 3vw, 26px)",
      fontWeight: 700,
      color: TEXT_PRI,
      letterSpacing: "-0.015em",
      lineHeight: 1.25,
      margin: "56px 0 16px",
    }}>{children}</h2>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "clamp(15px, 1.8vw, 17px)",
      color: TEXT_SEC,
      lineHeight: 1.75,
      marginBottom: "20px",
      fontFamily: SF,
    }}>{children}</p>
  );
}

// ─── Dati timeline ────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    year: "2022",
    label: "L'origine",
    desc: "Adrian Lenice crea un bulletin board per una community globale di startupper, investitori e sviluppatori. Zero interfaccia, zero grafica: solo segnale puro.",
  },
  {
    year: "2022–25",
    label: "Ideasmart",
    desc: "Il progetto cresce sotto il radar per quasi quattro anni con il nome Ideasmart. Gli agenti monitorano migliaia di fonti globali e distribuiscono informazione certificata a una nicchia di insider.",
  },
  {
    year: "Aprile 2026",
    label: "ProofPress nasce",
    desc: "Il rebrand: Ideasmart diventa ProofPress. Un nome che è una dichiarazione d'intenti: la prova viene prima della notizia. Proof prima di Press.",
  },
  {
    year: "Oggi",
    label: "100K+ lettori",
    desc: "Il magazine raggiunge oltre 100.000 lettori mensili, 6.000+ iscritti alla newsletter con un open rate del 45%, gestito da un team editoriale di una sola persona.",
  },
];

// ─── Dati agenti ──────────────────────────────────────────────────────────────
const AGENTS = [
  { name: "Market Scout", role: "Monitora oltre 4.000 fonti globali in tempo reale" },
  { name: "Data Verifier", role: "Incrocia ogni dato su fonti multiple" },
  { name: "Research Writer", role: "Produce articoli approfonditi e contestualizzati" },
  { name: "Fact Checker", role: "Verifica ogni affermazione prima della pubblicazione" },
  { name: "Certification Engine", role: "Genera l'hash crittografico immutabile" },
  { name: "Distribution Agent", role: "Distribuisce su sito, newsletter e canali partner" },
  { name: "Source Curator", role: "Mantiene e aggiorna il database delle fonti certificate" },
  { name: "Editorial Coordinator", role: "Coordina il flusso tra gli agenti e il team umano" },
];

// ─── Pagina principale ────────────────────────────────────────────────────────

export default function Storia() {
  return (
    <>
      <SEOHead
        title="La nostra storia | ProofPress Magazine"
        description="Come ProofPress è nata da un bulletin board clandestino nella Silicon Valley e ha ridefinito il giornalismo digitale con AI agentica e certificazione crittografica."
        canonical="https://proofpress.ai/storia"
        ogSiteName="ProofPress"
      />
      <div className="flex min-h-screen" style={{ background: BG }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <SharedPageHeader />

          <main style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 24px 96px", fontFamily: SF }}>

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "72px" }}>
              <SectionLabel>La nostra storia</SectionLabel>
              <h1 style={{
                fontFamily: SF_DISPLAY,
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: TEXT_PRI,
                marginBottom: "24px",
              }}>
                Nata per certificare<br />la verità nell'era dell'AI.
              </h1>
              <p style={{ fontSize: "clamp(17px, 2.5vw, 21px)", color: TEXT_SEC, lineHeight: 1.55, maxWidth: "600px" }}>
                ProofPress non è nata in una sala conferenze. È nata da un bulletin board clandestino,
                da una community globale di insider, e da un'ossessione: che l'informazione verificata
                sia il vero vantaggio competitivo nell'era dell'AI.
              </p>
            </div>

            {/* ── TIMELINE ─────────────────────────────────────────────────── */}
            <div style={{ marginBottom: "80px" }}>
              <SectionLabel>Cronologia</SectionLabel>
              <div style={{ position: "relative" }}>
                {/* Linea verticale */}
                <div style={{
                  position: "absolute", left: "20px", top: "24px", bottom: "24px",
                  width: "1px", background: BORDER_LT,
                }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {TIMELINE.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "24px", paddingBottom: "36px" }}>
                      {/* Dot */}
                      <div style={{ flexShrink: 0, width: "40px", display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                        <div style={{
                          width: "10px", height: "10px", borderRadius: "50%",
                          background: i === TIMELINE.length - 1 ? ACCENT : BG_DARK,
                          border: `2px solid ${i === TIMELINE.length - 1 ? ACCENT : BG_DARK}`,
                          position: "relative", zIndex: 1,
                        }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
                          <span style={{
                            fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
                            fontSize: "11px", fontWeight: 700,
                            color: i === TIMELINE.length - 1 ? ACCENT : TEXT_TER,
                            letterSpacing: "0.05em",
                          }}>{item.year}</span>
                          <span style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "16px", color: TEXT_PRI }}>{item.label}</span>
                        </div>
                        <p style={{ fontSize: "15px", color: TEXT_SEC, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── CAPITOLO 1: IL PARADOSSO ─────────────────────────────────── */}
            <div style={{ marginBottom: "16px" }}>
              <ChapterTitle>Il paradosso del 2026</ChapterTitle>
              <BodyText>
                C'è un paradosso che attraversa il mondo dell'informazione digitale nel 2026, e riguarda
                proprio il rapporto fra quantità e qualità. Da un lato, la produzione di contenuti è esplosa:
                chiunque, con un modello di intelligenza artificiale generativa e una connessione internet,
                può pubblicare decine di articoli al giorno. Dall'altro, la fiducia dei lettori verso ciò
                che leggono online è ai minimi storici. Più informazione c'è, meno ci si fida. E il motivo
                è semplice: nell'economia dell'attenzione, la velocità ha mangiato la verifica.
              </BodyText>
              <BodyText>
                In questo scenario si inserisce ProofPress, una piattaforma di giornalismo agentico che
                non si limita a generare contenuti con l'AI ma li certifica, sigillando ogni notizia con
                un hash crittografico immutabile. Un approccio che, nel panorama attuale degli strumenti
                per l'editoria digitale, rappresenta un unicum.
              </BodyText>
            </div>

            {/* ── CAPITOLO 2: LE ORIGINI ───────────────────────────────────── */}
            <ChapterTitle>Nato come un bulletin board per nerd</ChapterTitle>
            <BodyText>
              La storia di ProofPress assomiglia, per certi versi, a quella della blockchain: nasce dal
              basso, da una community, senza un business plan e senza interfaccia. A metterla in moto è
              stato Adrian Lenice, una figura che nel circuito tech internazionale è tanto stimata quanto
              sfuggente. Di lui si sa che ha trascorso oltre un decennio al crocevia fra tecnologia, media
              e venture capital fra Europa e Silicon Valley. Non rilascia interviste, non compare ai panel,
              non ha un profilo pubblico riconoscibile. Chi lo conosce lo descrive come un tecnologo con
              un'ossessione sola: che l'informazione verificata sia il vero vantaggio competitivo nell'era
              dell'AI.
            </BodyText>
            <BodyText>
              Quello che Lenice aveva costruito, inizialmente, non era una piattaforma editoriale. Era un
              bulletin board — un sistema di agenti senza UX, senza grafica, senza alcuna pretesa di
              prodotto — che recapitava informazioni di prima mano a una community internazionale di
              startupper, investitori e sviluppatori sparsi per il mondo. Un sottobosco globale di addetti
              ai lavori che lo usava per scambiarsi notizie prima che uscissero, segnalazioni su deal in
              corso, analisi riservate prossime alla pubblicazione.
            </BodyText>
            <BodyText>
              I team condividevano informazioni che altrove non circolavano, e quel bulletin board — grezzo,
              essenziale, quasi clandestino — è diventato nel giro di pochi mesi un punto di riferimento
              silenzioso per un ecosistema di insider che ci trovava qualcosa che non esisteva altrove:
              segnale puro, zero rumore.
            </BodyText>

            {/* ── CAPITOLO 3: LO SPIN-OFF ──────────────────────────────────── */}
            <ChapterTitle>Da Ideasmart a ProofPress</ChapterTitle>
            <BodyText>
              Da lì, l'intuizione dello spin-off. Se quegli agenti erano già in grado di raccogliere,
              filtrare e distribuire informazione certificata a una nicchia globale, perché non farne una
              piattaforma per rivoluzionare il giornalismo? La prima testata agentica con informazione
              certificata. Basta fake news, basta notizie camuffate, solo verità verificabile.
            </BodyText>
            <BodyText>
              Il progetto prende il nome di Ideasmart, cresce sotto il radar per quasi quattro anni, e
              nell'aprile 2026 si trasforma in ProofPress — un nome che è una dichiarazione d'intenti.
              Oggi la piattaforma monitora oltre 4.000 fonti globali e attinge a decine di quei bulletin
              originari che continuano a fornirle informazione certa e di prima mano, un asset che nessun
              competitor può replicare.
            </BodyText>

            {/* ── CAPITOLO 4: L'ARCHITETTURA ───────────────────────────────── */}
            <ChapterTitle>Otto agenti, un'unica catena editoriale</ChapterTitle>
            <BodyText>
              La piattaforma si regge su un'architettura multi-agente che replica l'intero flusso di lavoro
              di una redazione. Otto agenti AI specializzati operano in parallelo, 24 ore su 24,
              coordinandosi come un team editoriale autonomo.
            </BodyText>

            {/* Grid agenti */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "12px",
              margin: "28px 0 32px",
            }}>
              {AGENTS.map((agent, i) => (
                <div key={i} style={{
                  background: BG_CARD,
                  border: `1px solid ${BORDER_LT}`,
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "8px",
                    background: BG_DARK, display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: TEXT_PRI, marginBottom: "3px" }}>{agent.name}</div>
                    <div style={{ fontSize: "12px", color: TEXT_SEC, lineHeight: 1.5 }}>{agent.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <BodyText>
              Ma il vero elemento differenziante è ProofPress Verify, il protocollo proprietario di
              certificazione. Il meccanismo funziona in tre passaggi: l'AI analizza ogni contenuto
              confrontandolo con fonti certificate, genera un Verification Report strutturato che documenta
              affidabilità, coerenza fattuale e grado di oggettività, e infine sigilla il report con un
              hash crittografico immutabile, secondo una logica di notarizzazione ispirata al Web3.
            </BodyText>
            <BodyText>
              Ogni articolo pubblicato porta un badge verificabile: il lettore può risalire alle fonti,
              al metodo di analisi, al punteggio di affidabilità. Non deve più fidarsi della testata.
              Può controllare da solo.
            </BodyText>

            <Blockquote>
              «ProofPress è un nuovo modo di fare giornalismo e la nuova frontiera dell'informazione.
              Porta la possibilità di creare una testata giornalistica alla portata di tutti, dal freelance
              all'editore strutturato. E certificando ogni informazione con un hash crittografico, rende
              la notizia vera, trasparente e a prova di fake. L'umano è sempre al centro e coordina tutto:
              decide la linea editoriale, il tono, le fonti. Gli agenti eseguono, verificano e certificano.»
            </Blockquote>

            {/* ── CAPITOLO 5: IL CONTESTO ──────────────────────────────────── */}
            <ChapterTitle>Perché adesso</ChapterTitle>
            <BodyText>
              Il timing non è casuale. Secondo il rapporto Capgemini Research Institute sull'AI agentica,
              il 21% delle aziende con fatturato superiore al miliardo di dollari utilizza già soluzioni
              di AI agentica e sistemi multi-agente, quasi il doppio rispetto all'anno precedente.
              Bloomberg ha sviluppato un LLM proprietario per l'analisi finanziaria, l'Associated Press
              usa l'AI per automatizzare gli earnings report, Semafor ha collaborato con Microsoft e
              OpenAI per costruire Signals, un feed di breaking news multi-fonte.
            </BodyText>
            <BodyText>
              Ma tutte queste iniziative sono strumenti interni di grandi organizzazioni editoriali,
              pensati per potenziare redazioni già esistenti. Nessuna è disponibile come piattaforma per
              terzi. E nessuna integra un layer di certificazione crittografica.
            </BodyText>

            <Blockquote>
              «La vera innovazione è creare un sistema in cui ogni notizia è tracciabile, verificabile
              e non alterabile. In un mondo dove la disinformazione cresce più velocemente della capacità
              umana di verificarla, la certificazione diventa il nuovo vantaggio competitivo. Per un
              editore, per un'azienda, per un professionista. ProofPress non sostituisce il giornalista:
              gli dà una redazione che lavora 24 ore su 24, con un livello di verifica che nessuna
              redazione tradizionale potrebbe sostenere.»
            </Blockquote>

            {/* ── CAPITOLO 6: UN NUOVO MODO ────────────────────────────────── */}
            <ChapterTitle>Un nuovo modo di fare giornalismo</ChapterTitle>
            <BodyText>
              Ma sarebbe riduttivo inquadrare ProofPress come un semplice strumento tecnologico. Quello
              che la piattaforma propone è, nei fatti, un nuovo modo di fare giornalismo: un modello in
              cui la redazione agentica — con la sua capacità di monitorare, verificare, scrivere,
              certificare e distribuire in modo autonomo — diventa accessibile a chiunque, non più solo
              alle grandi organizzazioni editoriali con budget milionari e decine di giornalisti sotto
              contratto.
            </BodyText>
            <BodyText>
              La testata stessa ne è la prova operativa: il magazine ProofPress su AI, startup e venture
              capital raggiunge oggi oltre 100.000 lettori mensili, conta più di 6.000 iscritti alla
              newsletter con un open rate del 45 per cento, e viene gestita da un team editoriale di una
              sola persona. Numeri che, in un contesto editoriale tradizionale, richiederebbero una
              redazione di almeno cinque o sei professionisti.
            </BodyText>

            {/* ── TRE MERCATI ──────────────────────────────────────────────── */}
            <div style={{ margin: "40px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  num: "01",
                  title: "Creator e freelance",
                  text: "Chiunque abbia qualcosa da dire può avviare una testata agentica certificata, senza una redazione, senza budget milionari.",
                },
                {
                  num: "02",
                  title: "Editori esistenti",
                  text: "Un editore che copre tre verticali può attivare nuovi canali tematici — finanza, healthcare, sport, energia, legal — moltiplicando l'inventory pubblicitaria e la base lettori senza un'assunzione.",
                },
                {
                  num: "03",
                  title: "Corporate newsroom",
                  text: "Aziende e scaleup possono costruire corporate newsroom, canali di Investor Relations attivi, daily intelligence brief per il management e feed informativi interni certificati.",
                },
              ].map((item) => (
                <div key={item.num} style={{
                  background: BG_CARD, border: `1px solid ${BORDER_LT}`,
                  borderRadius: "16px", padding: "24px 28px",
                  display: "grid", gridTemplateColumns: "48px 1fr", gap: "16px", alignItems: "start",
                }}>
                  <div style={{
                    fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
                    fontSize: "13px", fontWeight: 700, color: TEXT_TER,
                    paddingTop: "3px",
                  }}>{item.num}</div>
                  <div>
                    <div style={{ fontFamily: SF_DISPLAY, fontWeight: 700, fontSize: "17px", color: TEXT_PRI, marginBottom: "8px" }}>{item.title}</div>
                    <div style={{ fontSize: "15px", color: TEXT_SEC, lineHeight: 1.6 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <BodyText>
              Non a caso, la piattaforma è attualmente in fase di test presso due tra i principali editori
              e testate giornalistiche italiane — i cui nomi non sono ancora stati resi pubblici — che la
              stanno valutando come infrastruttura per estendere la propria offerta editoriale con verticali
              agentici certificati. Un segnale significativo, che conferma come il modello non interessi
              soltanto i creator indipendenti ma anche i player consolidati del settore.
            </BodyText>

            {/* ── CITAZIONE FINALE ─────────────────────────────────────────── */}
            <Blockquote>
              «Adrian ha costruito qualcosa che va oltre la tecnologia. Ha costruito un principio: la prova
              viene prima della notizia. Proof prima di Press. Il fatto che due tra i principali editori
              italiani lo stiano già testando conferma che il mercato è pronto. Il giornalismo digitale non
              sarà più lo stesso: non perché l'AI scrive al posto dei giornalisti — questo è il capitolo
              vecchio — ma perché per la prima volta ogni singola informazione può essere certificata,
              sigillata e resa trasparente. Con l'umano che resta al centro, a dirigere l'orchestra.
              È un cambio di paradigma, non un'evoluzione tecnologica.»
            </Blockquote>

            {/* ── CONCLUSIONE ──────────────────────────────────────────────── */}
            <ChapterTitle>Il percorso è appena iniziato</ChapterTitle>
            <BodyText>
              Il percorso di ProofPress è in piena accelerazione. La demo live è già accessibile, la
              piattaforma è operativa, i test con gli editori italiani sono in corso, e il modello —
              che combina ricavi pubblicitari, abbonamenti e licensing della tecnologia — punta a scalare
              oltre il mercato italiano entro la fine dell'anno.
            </BodyText>
            <BodyText>
              Quello che si profila non è un semplice strumento in più nella cassetta degli attrezzi
              dell'editoria digitale, ma un nuovo modo di concepire il giornalismo: aperto a chiunque
              abbia qualcosa da dire, ma blindato da un sistema di certificazione che non ammette
              scorciatoie. Il nodo, come sempre quando si parla di AI agentica e informazione, resta
              culturale: accettare che un sistema di agenti possa non solo scrivere ma anche verificare
              meglio e più velocemente di una redazione umana. È una scommessa audace. Ma nell'aprile
              2026, con il rumore digitale che cresce a ritmi esponenziali e con i primi grandi editori
              italiani che bussano alla porta, potrebbe essere anche l'unica scommessa rimasta.
            </BodyText>

            {/* ── CTA FINALE ───────────────────────────────────────────────── */}
            <div style={{
              marginTop: "72px",
              background: BG_DARK,
              borderRadius: "20px",
              padding: "48px 40px",
              textAlign: "center",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px", fontFamily: SF }}>
                Proof prima di Press
              </p>
              <h3 style={{ fontFamily: SF_DISPLAY, fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                Vuoi portare ProofPress nella tua organizzazione?
              </h3>
              <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "32px", maxWidth: "480px", margin: "0 auto 32px" }}>
                Scopri come la piattaforma può trasformare la tua redazione, la tua azienda o il tuo progetto editoriale.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/piattaforma">
                  <button style={{
                    background: "#fff", color: BG_DARK, border: "none",
                    padding: "14px 28px", borderRadius: "980px",
                    fontWeight: 700, fontSize: "15px", cursor: "pointer",
                    fontFamily: SF, letterSpacing: "-0.01em",
                  }}>
                    Scopri la piattaforma
                  </button>
                </Link>
                <Link href="/chi-siamo-story">
                  <button style={{
                    background: "rgba(255,255,255,0.1)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "14px 28px", borderRadius: "980px",
                    fontWeight: 600, fontSize: "15px", cursor: "pointer",
                    fontFamily: SF, letterSpacing: "-0.01em",
                  }}>
                    Il team
                  </button>
                </Link>
              </div>
            </div>

          </main>
          <SharedPageFooter />
        </div>
      </div>
    </>
  );
}
