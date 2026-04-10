/*
 * PROOFPRESS VERIFY — Protocollo di certificazione giornalistica
 * Struttura: hero → contesto/problema → 3 livelli → form verifica hash →
 *            differenziazione → target → specs tecniche → CTA finale
 */
import { useState, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import SEOHead from "@/components/SEOHead";
import { ShieldCheck, ShieldX, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "JetBrains Mono, 'Courier New', monospace";
const ORANGE = "#ff5500";

/* ── Divider ── */
function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

/* ── Label ── */
function Label({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ color: light ? "rgba(255,255,255,0.4)" : "rgba(10,10,10,0.4)", fontFamily: FONT }}
    >
      {children}
    </span>
  );
}

/* ── Section wrapper ── */
function Section({ children, bg = "transparent", id, className = "" }: {
  children: React.ReactNode; bg?: string; id?: string; className?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`} style={{ background: bg }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}

/* ── Specifiche tecniche collapsable ── */
function TechSpecs() {
  const [open, setOpen] = useState(false);
  const specs = [
    { label: "Fonti certificate", value: "4.000+ fonti globali monitorate e aggiornate in continuo. Include agenzie stampa (Reuters, AP, ANSA), database istituzionali (SEC, BCE, Consob, ISTAT), pubblicazioni peer-reviewed, registri pubblici." },
    { label: "Tempo di certificazione", value: "Media < 3 minuti per articolo, dipende dalla complessità e dal numero di claim." },
    { label: "Punteggio di affidabilità", value: "Scala 0-100 basata su: coerenza fattuale (40%), qualità delle fonti (30%), assenza di bias (20%), freschezza dei dati (10%)." },
    { label: "Hash crittografico", value: "SHA-256, generato sul payload completo: contenuto + report + metadata + timestamp." },
    { label: "Immutabilità", value: "L'hash è registrato nel sistema ProofPress. Roadmap: pubblicazione su chain pubblica per verifica trustless completa." },
    { label: "API", value: "Disponibile per i piani Enterprise. Consente l'integrazione di ProofPress Verify in CMS e piattaforme terze." },
    { label: "Retention", value: "I Verification Report e gli hash sono conservati a tempo indefinito." },
  ];
  return (
    <div className="border border-[#0a0a0a]/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#0a0a0a]/3 transition-colors"
        style={{ fontFamily: FONT }}
      >
        <span className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]">Specifiche tecniche</span>
        {open ? <ChevronUp size={16} className="text-[#0a0a0a]/40" /> : <ChevronDown size={16} className="text-[#0a0a0a]/40" />}
      </button>
      {open && (
        <div className="border-t border-[#0a0a0a]/8 divide-y divide-[#0a0a0a]/6">
          {specs.map(({ label, value }) => (
            <div key={label} className="px-6 py-4 grid md:grid-cols-3 gap-3">
              <div className="text-xs font-bold text-[#0a0a0a]/50 uppercase tracking-wide">{label}</div>
              <div className="md:col-span-2 text-sm text-[#0a0a0a]/70 leading-relaxed">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Form di verifica hash ── */
function VerifyForm() {
  const [hash, setHash] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // La procedura verify.verifyHash è opzionale; se non disponibile mostra "non trovato"
  const verifyQuery = (trpc as any).verify?.verifyHash?.useQuery?.(
    { hash: hash.trim() },
    { enabled: submitted && hash.trim().length > 0 }
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    setSubmitted(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  };

  const handleReset = () => {
    setHash("");
    setSubmitted(false);
  };

  const result = verifyQuery?.data;
  const isLoading = verifyQuery?.isLoading;
  const isError = verifyQuery?.isError;

  return (
    <div>
      <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={hash}
          onChange={(e) => { setHash(e.target.value); setSubmitted(false); }}
          placeholder="Inserisci l'hash della notizia (es. 0x7f3a...)"
          className="flex-1 px-5 py-4 text-sm border border-[#0a0a0a]/20 bg-white text-[#0a0a0a] placeholder-[#0a0a0a]/35 outline-none focus:border-[#0a0a0a]/50 transition-colors"
          style={{ fontFamily: MONO }}
        />
        <button
          type="submit"
          disabled={!hash.trim()}
          className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: ORANGE, fontFamily: FONT }}
        >
          Verifica →
        </button>
      </form>

      <p className="text-xs text-[#0a0a0a]/45 mb-8 leading-relaxed">
        Ogni hash è collegato al Verification Report originale. Se il contenuto dell'articolo è stato modificato dopo la certificazione, il sistema lo rileva automaticamente.
      </p>

      {/* Risultato */}
      <div ref={resultRef}>
        {submitted && isLoading && (
          <div className="border border-[#0a0a0a]/10 p-6 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-[#0a0a0a]/20 border-t-[#0a0a0a]/60 rounded-full animate-spin" />
            <span className="text-sm text-[#0a0a0a]/60">Verifica in corso...</span>
          </div>
        )}

        {submitted && isError && (
          <div className="border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <ShieldX size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-red-700 mb-1">❌ Hash non trovato</div>
                <p className="text-sm text-red-600/80">
                  Questo hash non corrisponde a nessuna certificazione nel nostro sistema. Verifica di aver copiato correttamente il codice, oppure contattaci per assistenza.
                </p>
                <button onClick={handleReset} className="mt-3 text-xs text-red-500 underline hover:no-underline">Riprova</button>
              </div>
            </div>
          </div>
        )}

        {submitted && result && !isLoading && (
          <div className={`border p-6 ${
            result.status === "verified"
              ? "border-green-200 bg-green-50"
              : result.status === "modified"
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
          }`}>
            {result.status === "verified" && (
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-sm text-green-700 mb-2">✅ Verificato</div>
                  <p className="text-sm text-green-700/80 mb-3">
                    Questa notizia è stata certificata da ProofPress Verify il{" "}
                    <strong>{result.certifiedAt}</strong>. Il contenuto corrisponde esattamente al Verification Report originale.
                  </p>
                  {result.reliabilityScore !== undefined && (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-green-600/70 uppercase tracking-wide">Punteggio di affidabilità</span>
                      <span className="text-2xl font-black text-green-700">{result.reliabilityScore}/100</span>
                    </div>
                  )}
                  {result.title && (
                    <div className="text-xs text-green-600/70 mb-1">
                      <span className="font-bold">Titolo:</span> {result.title}
                    </div>
                  )}
                  {result.section && (
                    <div className="text-xs text-green-600/70">
                      <span className="font-bold">Sezione:</span> {result.section}
                    </div>
                  )}
                  {result.reportUrl && (
                    <a href={result.reportUrl} className="mt-3 inline-block text-xs text-green-600 underline hover:no-underline">
                      Vedi il report completo →
                    </a>
                  )}
                </div>
              </div>
            )}

            {result.status === "modified" && (
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-yellow-700 mb-2">⚠️ Contenuto modificato</div>
                  <p className="text-sm text-yellow-700/80">
                    L'articolo attuale non corrisponde al contenuto certificato. Il testo è stato alterato dopo la certificazione del{" "}
                    <strong>{result.certifiedAt}</strong>. L'hash originale rimane valido per la versione certificata.
                  </p>
                  <button onClick={handleReset} className="mt-3 text-xs text-yellow-600 underline hover:no-underline">Nuova verifica</button>
                </div>
              </div>
            )}

            {result.status === "not_found" && (
              <div className="flex items-start gap-3">
                <ShieldX size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-red-700 mb-2">❌ Hash non trovato</div>
                  <p className="text-sm text-red-600/80">
                    Questo hash non corrisponde a nessuna certificazione nel nostro sistema. Verifica di aver copiato correttamente il codice, oppure contattaci per assistenza.
                  </p>
                  <button onClick={handleReset} className="mt-3 text-xs text-red-500 underline hover:no-underline">Riprova</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPALE
══════════════════════════════════════════════════════════════════════════════ */
export default function ProofPressVerify() {
  const verifyFormRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    verifyFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="ProofPress Verify — Il protocollo di certificazione giornalistica"
          description="Non fidarti della notizia. Verificala. ProofPress Verify unisce AI e crittografia Web3 per certificare ogni notizia con hash immutabile. 4.000+ fonti, 100k+ verifiche/mese."
          canonical="https://proofpress.ai/proofpress-verify"
          ogSiteName="Proof Press"
        />

        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          <BreakingNewsTicker />

          {/* ═══════════════════════════════════════════════════════════════════
              HERO
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              {/* Badge */}
              <div className="mb-6">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: FONT }}
                >
                  PROOFPRESS VERIFY — PROTOCOLLO DI CERTIFICAZIONE
                </span>
              </div>

              <div className="max-w-3xl mb-10">
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                  style={{ fontFamily: FONT }}
                >
                  Non fidarti<br />
                  della notizia.<br />
                  <span style={{ color: ORANGE }}>Verificala.</span>
                </h1>
                <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-2xl">
                  ProofPress Verify è il primo protocollo di certificazione giornalistica che unisce intelligenza artificiale e crittografia Web3. Ogni notizia viene analizzata su fonti multiple, valutata per affidabilità e bias, e sigillata con un hash crittografico immutabile. Il risultato non è un'opinione — è una prova.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-t border-b border-[#0a0a0a]/8">
                {[
                  { val: "4.000+", label: "fonti monitorate in tempo reale" },
                  { val: "100k+", label: "verifiche eseguite ogni mese" },
                  { val: "< 3 min", label: "tempo medio di certificazione" },
                  { val: "100%", label: "contenuti ProofPress certificati" },
                ].map(({ val, label }) => (
                  <div key={val}>
                    <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{val}</div>
                    <div className="text-xs text-[#0a0a0a]/50 uppercase tracking-wide leading-snug">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToForm}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Verifica una notizia ↓
                </button>
                <Link href="/chi-siamo">
                  <button
                    className="px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-colors hover:bg-[#0a0a0a]/5"
                    style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: FONT }}
                  >
                    Scopri i piani →
                  </button>
                </Link>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              IL CONTESTO
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="contesto">
            <Label>Il contesto</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Il giornalismo ha un problema di fiducia.<br />
              E l'AI generativa lo sta peggiorando.
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70">
              <p>
                Nel 2025 sono stati generati più contenuti fake che in tutta la storia del giornalismo digitale. Un articolo credibile si produce in 30 secondi con un prompt. Un deepfake video in 5 minuti. I lettori non hanno strumenti per distinguere il reale dal fabbricato — e i giornalisti onesti non hanno modo di dimostrare che il loro lavoro è diverso.
              </p>
              <p>
                I fact-checker umani non scalano: una redazione media riesce a verificare il 5-10% di quello che pubblica. I disclaimer tipo "secondo fonti" o "come riportato da" non valgono nulla — sono formule vuote, non prove.
              </p>
              <p className="font-semibold text-[#0a0a0a]">
                Il problema non è la velocità di pubblicazione. Il problema è che non esiste un sistema scalabile per dimostrare che una notizia è vera.
              </p>
              <p>
                ProofPress Verify è quel sistema.
              </p>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              COS'È PROOFPRESS VERIFY
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="cose">
            <Label>Cos'è ProofPress Verify</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Un protocollo, non un plugin.<br />Un certificato, non un'opinione.
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70">
              <p>
                ProofPress Verify è un sistema proprietario di validazione e certificazione agentica delle notizie. Non è un tool che "controlla i fatti" — è un protocollo strutturato che analizza, valuta, documenta e sigilla ogni contenuto prima della pubblicazione.
              </p>
              <p>
                Ogni notizia che passa per ProofPress Verify viene sottoposta a tre livelli di analisi indipendenti, e il risultato viene registrato in modo permanente e non modificabile.
              </p>
              <p>
                Non è un filtro editoriale. Non decide cosa pubblicare.{" "}
                <strong className="text-[#0a0a0a]">Certifica quello che viene pubblicato</strong> — e rende la certificazione verificabile da chiunque, in qualsiasi momento.
              </p>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              3 LIVELLI DI VERIFICA
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="livelli">
            <Label>Come funziona</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-16" style={{ fontFamily: FONT }}>
              Tre livelli di verifica.<br />Zero margine di dubbio.
            </h2>

            <div className="space-y-16">
              {/* Livello 1 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>01</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Analisi multi-fonte AI
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65 mb-6">
                    Il sistema acquisisce il contenuto e lo confronta simultaneamente con un network di oltre 4.000 fonti certificate a livello globale: agenzie stampa, database istituzionali, registri pubblici, pubblicazioni scientifiche, report finanziari, fonti governative.
                  </p>
                  <div className="space-y-2">
                    {[
                      "Identifica le fonti primarie che confermano o contraddicono ogni claim",
                      "Misura il grado di coerenza fattuale tra fonti indipendenti",
                      "Rileva eventuali bias (politico, commerciale, emotivo)",
                      "Valuta la freschezza e l'autorevolezza di ogni fonte utilizzata",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-[#0a0a0a]/65">
                        <span style={{ color: ORANGE }} className="flex-shrink-0 mt-0.5 font-bold">—</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-[#0a0a0a]/50 mt-5 italic">
                    Non si tratta di "cercare su Google se è vero". È un'analisi strutturata, multi-dimensionale, che incrocia decine di fonti in parallelo in meno di 3 minuti.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#0a0a0a]/8" />

              {/* Livello 2 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>02</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Verification Report
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65 mb-6">
                    Al termine dell'analisi, il sistema genera un <strong className="text-[#0a0a0a]">Verification Report</strong> completo e strutturato — il "certificato di nascita" della notizia.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Punteggio di affidabilità (0-100)", desc: "Quanto il contenuto è supportato dalle fonti" },
                      { label: "Indice di bias", desc: "Misura dell'eventuale orientamento del testo" },
                      { label: "Mappa delle fonti", desc: "Elenco delle fonti incrociate, con peso e rilevanza" },
                      { label: "Flag di attenzione", desc: "Segnalazioni su claim non sufficientemente supportati" },
                      { label: "Criteri di analisi", desc: "Metodo esatto utilizzato per quella specifica verifica" },
                    ].map(({ label, desc }) => (
                      <div key={label} className="p-4 border border-[#0a0a0a]/8 bg-white">
                        <div className="text-xs font-bold text-[#0a0a0a] mb-1">{label}</div>
                        <div className="text-xs text-[#0a0a0a]/50">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#0a0a0a]/8" />

              {/* Livello 3 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>03</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Sigillo crittografico Web3
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65 mb-6">
                    Il Verification Report viene sigillato attraverso un <strong className="text-[#0a0a0a]">hash crittografico immutabile</strong>. L'hash registra:
                  </p>
                  <div className="space-y-2 mb-6">
                    {[
                      "Il contenuto esatto dell'articolo al momento della pubblicazione",
                      "Il Verification Report completo con tutti i parametri",
                      "Il timestamp preciso della certificazione",
                      "L'identità degli agenti AI che hanno eseguito la verifica",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-[#0a0a0a]/65">
                        <span style={{ color: ORANGE }} className="flex-shrink-0 mt-0.5 font-bold">—</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 border-l-2" style={{ borderColor: ORANGE, background: `${ORANGE}08` }}>
                    <p className="text-sm leading-relaxed text-[#0a0a0a]/75">
                      L'hash funziona come una notarizzazione digitale ispirata alla logica blockchain: una volta generato,{" "}
                      <strong className="text-[#0a0a0a]">nessuno può modificare il contenuto o il report senza che l'hash cambi</strong>. Né l'editore, né la piattaforma, né l'autore.
                    </p>
                    <p className="text-sm leading-relaxed text-[#0a0a0a]/65 mt-3">
                      Questo significa che un lettore, un investitore, un tribunale possono verificare in qualsiasi momento che quella notizia è esattamente come è stata certificata al momento della pubblicazione.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              FORM DI VERIFICA HASH
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="verifica" bg="#ffffff">
            <div ref={verifyFormRef}>
              <Label>Verifica pubblica</Label>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
                Verifica tu stesso.<br />Inserisci l'hash.
              </h2>
              <p className="text-base text-[#0a0a0a]/55 mb-10 max-w-2xl">
                Ogni articolo pubblicato su ProofPress porta un badge con un codice hash univoco. Inseriscilo qui per accedere al Verification Report originale e verificare che il contenuto non sia stato alterato.
              </p>
              <VerifyForm />
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              DIFFERENZIAZIONE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="differenziazione">
            <Label>Differenziazione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Non è un fact-checker.<br />È infrastruttura di fiducia.
            </h2>
            <div className="space-y-8">
              {[
                {
                  title: "Fact-checker tradizionali vs. ProofPress Verify",
                  text: "I fact-checker umani controllano una notizia alla volta, impiegano ore, e il risultato è un giudizio soggettivo ('True', 'Mostly True', 'Misleading'). Non è scalabile, non è verificabile, e non è immutabile. ProofPress Verify certifica migliaia di notizie al giorno, in tempo reale, con un metodo documentato e un output crittograficamente sigillato. Non dice 'è vero' — dimostra perché è affidabile e lo rende verificabile da chiunque.",
                },
                {
                  title: "AI senza crittografia vs. ProofPress Verify",
                  text: "Molti tool usano l'AI per \"analizzare\" le notizie. Ma senza un layer crittografico, l'output può essere modificato, cancellato o manipolato dopo la pubblicazione. ProofPress Verify aggiunge il sigillo che rende la certificazione permanente e trustless.",
                },
                {
                  title: "Blockchain senza AI vs. ProofPress Verify",
                  text: "Registrare un contenuto su blockchain non serve a niente se il contenuto stesso non è stato prima verificato. Notarizzi spazzatura, hai spazzatura notarizzata. ProofPress Verify unisce l'analisi AI (che verifica) e la crittografia Web3 (che sigilla). Uno senza l'altro non funziona.",
                },
              ].map(({ title, text }) => (
                <div key={title} className="border-l-2 pl-6" style={{ borderColor: ORANGE }}>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              PER CHI
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="per-chi">
            <Label>Per chi</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Per chi pubblica, per chi legge,<br />per chi deve decidere.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: "📰",
                  title: "Editori e redazioni",
                  text: "Ogni articolo esce con un certificato. Il badge ProofPress Verify è visibile al lettore. La credibilità della testata non è più un'affermazione — è un dato misurabile. I lettori possono controllare autonomamente ogni notizia.",
                },
                {
                  icon: "✍️",
                  title: "Giornalisti indipendenti e freelance",
                  text: "Un freelance non ha una redazione di fact-checker alle spalle. Con ProofPress Verify, ogni suo contenuto è certificato con lo stesso rigore di una testata strutturata. La certificazione diventa il suo biglietto da visita.",
                },
                {
                  icon: "🏢",
                  title: "Aziende e brand media",
                  text: "Le corporate newsroom soffrono di un deficit cronico di credibilità. I lettori le percepiscono come PR mascherata. ProofPress Verify dà ai contenuti aziendali un livello di certificazione indipendente che nessun disclaimer può sostituire.",
                },
                {
                  icon: "📊",
                  title: "Lettori e decision-maker",
                  text: "Investitori, manager, analisti prendono decisioni basandosi su informazioni. Con ProofPress Verify possono controllare in autonomia che le notizie su cui basano le loro scelte siano state verificate con un metodo trasparente e documentato.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="p-6 border border-[#0a0a0a]/8">
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              SPECIFICHE TECNICHE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="specs">
            <Label>Sotto il cofano</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Specifiche tecniche.
            </h2>
            <TechSpecs />
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              CTA FINALE
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="py-24 md:py-32" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
              <Label light>Incluso in tutti i piani</Label>
              <h2
                className="text-3xl md:text-5xl font-black leading-tight mb-6 text-white"
                style={{ fontFamily: FONT }}
              >
                L'informazione certificata<br />
                non è un lusso.<br />
                <span style={{ color: ORANGE }}>È il nuovo standard.</span>
              </h2>
              <p className="text-base text-white/55 mb-12 max-w-xl mx-auto">
                ProofPress Verify è incluso in ogni piano della piattaforma ProofPress. Ogni notizia pubblicata dalla tua redazione agentica viene automaticamente analizzata, verificata e sigillata. Zero configurazione, zero costi aggiuntivi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/chi-siamo">
                  <button
                    className="px-10 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                    style={{ background: ORANGE, fontFamily: FONT }}
                  >
                    Scopri i piani →
                  </button>
                </Link>
                <Link href="/demo">
                  <button
                    className="px-10 py-4 text-sm font-bold uppercase tracking-widest border text-white transition-colors hover:bg-white/10"
                    style={{ borderColor: "#ffffff33", fontFamily: FONT }}
                  >
                    Richiedi una demo
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30 uppercase tracking-widest">
                <span>Verifiche illimitate</span>
                <span>·</span>
                <span>Incluso in tutti i piani</span>
                <span>·</span>
                <span>Nessun setup aggiuntivo</span>
              </div>
            </div>
          </section>

          {/* Quote footer */}
          <div className="py-12 text-center" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm text-white/30 italic max-w-2xl mx-auto px-5" style={{ fontFamily: FONT }}>
              "In un mondo dove chiunque può generare una notizia, solo chi la certifica merita di essere letto."
            </p>
          </div>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
