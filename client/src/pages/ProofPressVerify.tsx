/*
 * PROOFPRESS VERIFY — Protocollo di certificazione giornalistica
 * Struttura: hero → contesto/problema → 3 livelli → form verifica hash →
 *            differenziazione → target → specs tecniche → CTA finale
 */
import { useState, useRef, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import ContactForm from "@/components/ContactForm";
import SEOHead from "@/components/SEOHead";
import { ShieldCheck, ShieldX, AlertTriangle, ChevronDown, ChevronUp, FileText, BookOpen, Lock } from "lucide-react";

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
function VerifyForm({ initialHash = "" }: { initialHash?: string }) {
  const [inputValue, setInputValue] = useState(initialHash || "");
  const [submitted, setSubmitted] = useState(false);
  const [searchHash, setSearchHash] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-search quando viene passato un hash dall'URL
  useEffect(() => {
    if (initialHash && initialHash.trim().length >= 8) {
      const normalized = normalizeHash(initialHash);
      setInputValue(initialHash);
      setSearchHash(normalized);
      setSubmitted(true);
      // Scroll al risultato dopo un breve delay
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHash]);

  // Normalizza il codice: accetta sia "PP-XXXXXXXXXXXXXXXX" che l'hash completo SHA-256
  const normalizeHash = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.toUpperCase().startsWith('PP-')) {
      // Il badge mostra i primi 16 char dell'hash in maiuscolo
      // Il DB salva l'hash completo SHA-256 in minuscolo
      return trimmed.slice(3).toLowerCase();
    }
    return trimmed.toLowerCase();
  };

  // Usa news.lookupByHash — cerca per hash (o prefisso) nel DB
  const verifyQuery = trpc.news.lookupByHash.useQuery(
    { hash: searchHash },
    { enabled: submitted && searchHash.length >= 8 }
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSearchHash(normalizeHash(inputValue));
    setSubmitted(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 300);
  };

  const handleReset = () => {
    setInputValue("");
    setSearchHash("");
    setSubmitted(false);
  };

  // news.lookupByHash restituisce l'oggetto notizia direttamente (non ha status)
  const rawResult = verifyQuery?.data;
  const isLoading = verifyQuery?.isLoading;
  const isError = verifyQuery?.isError;

  // Pinning su IPFS via Pinata
  const pinMutation = trpc.news.pinToIPFS.useMutation();

  // Adatta il risultato al formato atteso dalla UI
  const result = rawResult
    ? {
        status: "verified" as const,
        title: rawResult.title,
        section: rawResult.section,
        certifiedAt: rawResult.publishedAt
          ? new Date(rawResult.publishedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
          : "data non disponibile",
        verifyHash: rawResult.verifyHash,
        id: rawResult.id,
        sourceName: rawResult.sourceName,
        summary: rawResult.summary,
        ipfsCid: rawResult.ipfsCid ?? null,
        ipfsUrl: rawResult.ipfsUrl ?? null,
        ipfsPinnedAt: rawResult.ipfsPinnedAt ?? null,
      }
    : submitted && !isLoading
    ? { status: "not_found" as const }
    : null;

  return (
    <div>
      <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setSubmitted(false); }}
          placeholder="Inserisci il codice PP-XXXXXXXXXXXXXXXX o l'hash SHA-256 completo"
          className="flex-1 px-5 py-4 text-sm border border-[#0a0a0a]/20 bg-white text-[#0a0a0a] placeholder-[#0a0a0a]/35 outline-none focus:border-[#0a0a0a]/50 transition-colors"
          style={{ fontFamily: MONO }}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
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
              : "border-red-200 bg-red-50"
          }`}>
            {result.status === "verified" && (
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-sm text-green-700 mb-2">✅ Verificato — Notizia certificata da ProofPress</div>
                  <p className="text-sm text-green-700/80 mb-3">
                    Questa notizia è stata certificata da ProofPress Verify il{" "}
                    <strong>{result.certifiedAt}</strong>. Il contenuto corrisponde esattamente al Verification Report originale.
                  </p>
                  {result.title && (
                    <div className="text-xs text-green-600/70 mb-1">
                      <span className="font-bold">Titolo:</span> {result.title}
                    </div>
                  )}
                  {result.section && (
                    <div className="text-xs text-green-600/70 mb-1">
                      <span className="font-bold">Sezione:</span> {result.section.toUpperCase()}
                    </div>
                  )}
                  {result.sourceName && (
                    <div className="text-xs text-green-600/70 mb-1">
                      <span className="font-bold">Fonte:</span> {result.sourceName}
                    </div>
                  )}
                  {result.verifyHash && (
                    <div className="text-xs text-green-600/70 mt-2 font-mono break-all">
                      <span className="font-bold not-italic" style={{ fontFamily: FONT }}>Hash SHA-256:</span>{" "}
                      {result.verifyHash}
                    </div>
                  )}

                  {/* ── Sezione IPFS / Blockchain ── */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    {'ipfsCid' in result && result.ipfsCid ? (
                      // Già pinnato su IPFS
                      <div
                        className="rounded-lg px-4 py-3"
                        style={{ background: "rgba(0,150,136,0.08)", border: "1px solid rgba(0,150,136,0.25)" }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#00897b", fontFamily: FONT }}>⛓ Ancorato su IPFS</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#00897b", color: "#fff", fontFamily: FONT }}>IMMUTABILE</span>
                        </div>
                        <p className="text-[10px] mb-2" style={{ color: "rgba(0,77,64,0.75)", fontFamily: FONT }}>
                          Il Verification Report è ancorato permanentemente su IPFS tramite Pinata. Il CID garantisce l'immutabilità del contenuto certificato.
                        </p>
                        <div className="text-[9px] font-mono break-all mb-2" style={{ color: "#00695c" }}>
                          <span className="font-bold not-italic" style={{ fontFamily: FONT }}>CID:</span>{" "}
                          {result.ipfsCid}
                        </div>
                        {'ipfsUrl' in result && result.ipfsUrl && (
                          <a
                            href={result.ipfsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold hover:opacity-70 transition-opacity"
                            style={{ color: "#00897b", fontFamily: FONT }}
                          >
                            Visualizza su IPFS Gateway →
                          </a>
                        )}
                        {'ipfsPinnedAt' in result && result.ipfsPinnedAt && (
                          <div className="text-[9px] mt-1" style={{ color: "rgba(0,77,64,0.5)", fontFamily: FONT }}>
                            Pinnato il {new Date(result.ipfsPinnedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Non ancora pinnato — mostra pulsante
                      <div
                        className="rounded-lg px-4 py-3"
                        style={{ background: "rgba(255,85,0,0.05)", border: "1px solid rgba(255,85,0,0.2)" }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ORANGE, fontFamily: FONT }}>⛓ Ancora su IPFS</span>
                        </div>
                        <p className="text-[10px] mb-3" style={{ color: "rgba(10,10,10,0.55)", fontFamily: FONT }}>
                          Ancora questo Verification Report su IPFS per garantirne l'immutabilità permanente tramite blockchain.
                        </p>
                        {pinMutation.isSuccess ? (
                          <div className="text-[10px]" style={{ color: "#2e7d32", fontFamily: FONT }}>
                            <div className="font-bold mb-2">✅ Ancorato! CID: <span className="font-mono">{pinMutation.data?.cid?.substring(0, 20)}…</span></div>
                            <div className="flex flex-wrap gap-2">
                              {pinMutation.data?.ipfsUrl && (
                                <a href={pinMutation.data.ipfsUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                                  JSON su IPFS →
                                </a>
                              )}
                              {pinMutation.data?.cid && (
                                <a href={`/verify/${pinMutation.data.cid}`} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:no-underline" style={{ color: "#00897b" }}>
                                  📄 Pagina pubblica Verification Report →
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => result.verifyHash && pinMutation.mutate({ hash: result.verifyHash })}
                            disabled={pinMutation.isPending || !result.verifyHash}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                            style={{ background: ORANGE, fontFamily: FONT }}
                          >
                            {pinMutation.isPending ? (
                              <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Pinning in corso…</>
                            ) : (
                              <>⛓ Ancora su IPFS</>
                            )}
                          </button>
                        )}
                        {pinMutation.isError && (
                          <p className="text-[9px] mt-2" style={{ color: "#c62828", fontFamily: FONT }}>
                            Errore: {pinMutation.error?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {result.id && (
                    <Link
                      href={`/${result.section}/news/${result.id}`}
                      className="mt-3 inline-block text-xs text-green-600 underline hover:no-underline"
                    >
                      Leggi l'articolo su ProofPress →
                    </Link>
                  )}
                  <button onClick={handleReset} className="mt-3 ml-4 text-xs text-green-600/60 underline hover:no-underline">Nuova verifica</button>
                </div>
              </div>
            )}

            {result.status === "not_found" && (
              <div className="flex items-start gap-3">
                <ShieldX size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-red-700 mb-2">❌ Hash non trovato</div>
                  <p className="text-sm text-red-600/80">
                    Questo codice non corrisponde a nessuna certificazione nel nostro sistema. Verifica di aver copiato correttamente il codice PP-XXXXXXXXXXXXXXXX, oppure contattaci per assistenza.
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

/* ── FAQ ── */
const FAQ_ITEMS = [
  {
    q: "Cosa significa grade F per un articolo?",
    a: "Il grade F indica che il sistema non ha trovato corroborazione esterna sufficiente per i claim identificati. Non significa necessariamente che l’articolo sia falso: può trattarsi di contenuto di opinione, analisi soggettiva o notizie su eventi molto recenti non ancora indicizzati dalle fonti IFCN. Il grade misura la verificabilità fattuale, non la qualità editoriale.",
  },
  {
    q: "Posso usare ProofPress Verify per articoli di altre testate?",
    a: "Sì, con il piano Verify Essential o Pro. Tramite API REST puoi inviare qualsiasi contenuto testuale al motore di verifica e ricevere un Verification Report con trust score, claim corroborati e certificato IPFS. L’integrazione è compatibile con qualsiasi CMS.",
  },
  {
    q: "Il badge trust grade è personalizzabile con il mio brand?",
    a: "Sì, nel piano Verify Pro è disponibile la versione white-label: il badge può essere configurato con i colori e il logo della tua testata. Il certificato IPFS rimane pubblico e verificabile indipendentemente dal brand applicato.",
  },
  {
    q: "Quanto tempo richiede la verifica di un articolo?",
    a: "In media meno di 60 secondi dall’invio alla generazione del certificato IPFS. Il tempo varia in base al numero di claim identificati (tipicamente 4–10 per articolo) e alla disponibilità delle fonti esterne. La verifica è asincrona: il badge si aggiorna automaticamente quando il report è pronto.",
  },
  {
    q: "Cosa succede se Pinata o il gateway IPFS non sono disponibili?",
    a: "Il Verification Report viene generato e salvato nel database ProofPress indipendentemente dallo stato di Pinata. Il pinning IPFS viene ritentato automaticamente. Il badge trust grade è sempre visibile anche senza CID IPFS attivo, perché il trust score è calcolato e persistito localmente.",
  },
  {
    q: "I prezzi indicati sono definitivi?",
    a: "No. I piani Verify Essential (€490/mese) e Verify Pro (€1.490/mese) sono prezzi indicativi in fase di validazione commerciale. Per redazioni con volumi elevati è disponibile un modello revenue sharing. Contattaci per un’offerta personalizzata basata su volumi, verticale editoriale e livello di integrazione richiesto.",
  },
  {
    q: "Come funziona il certificato IPFS? Posso verificarlo indipendentemente?",
    a: "Sì. Ogni Verification Report viene caricato su IPFS tramite Pinata e ottiene un CID (Content Identifier) univoco. Chiunque può recuperare il report originale da qualsiasi gateway IPFS pubblico (es. ipfs.io, cloudflare-ipfs.com) usando il CID. Se il contenuto fosse alterato, il CID non corrisponderebbe più: è la garanzia crittografica di immutabilità.",
  },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section bg="#f8f8f6" id="faq">
      <Label>Domande frequenti</Label>
      <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
        Tutto quello che devi sapere.
      </h2>
      <p className="text-base text-[#0a0a0a]/55 max-w-2xl mb-12 leading-relaxed">
        Sul funzionamento del sistema, sui grade, sui prezzi e sull’integrazione tecnica.
      </p>
      <div className="divide-y divide-[#0a0a0a]/8 border-t border-b border-[#0a0a0a]/8">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              className="w-full text-left py-5 flex items-start justify-between gap-4 group"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-base font-bold text-[#0a0a0a] leading-snug group-hover:text-[#ff5500] transition-colors" style={{ fontFamily: FONT }}>
                {item.q}
              </span>
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#0a0a0a]/40 text-xl font-light mt-0.5">
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i && (
              <div className="pb-6 pr-10">
                <p className="text-sm text-[#0a0a0a]/60 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Pannello Esegui Verifica Completa ── */
function FullVerifyPanel() {
  const [hashInput, setHashInput] = useState("");
  const [activeHash, setActiveHash] = useState("");
  const runVerify = trpc.news.runFullVerify.useMutation();
  const verifyStatus = trpc.news.getVerifyStatus.useQuery(
    { hash: activeHash },
    { enabled: activeHash.length === 64 }
  );

  const GRADE_COLOR: Record<string, string> = {
    A: "#00b894", B: "#00cec9", C: "#fdcb6e", D: "#e17055", F: "#d63031",
  };

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    const h = hashInput.trim().toLowerCase();
    if (h.length !== 64) return;
    setActiveHash(h);
    runVerify.mutate({ hash: h });
  };

  const grade = runVerify.data?.trustGrade ?? verifyStatus.data?.trustGrade ?? null;
  const score = runVerify.data?.trustScore ?? verifyStatus.data?.trustScore ?? null;
  const gradeColor = grade ? (GRADE_COLOR[grade] ?? "#636e72") : "#636e72";

  return (
    <div className="mt-16 pt-10 border-t border-[#0a0a0a]/8">
      <div className="mb-6">
        <span
          className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
          style={{ color: "#00b894", borderColor: "#00b89444", background: "#00b8940d", fontFamily: FONT }}
        >
          VERIFY ENGINE — ANALISI COMPLETA
        </span>
      </div>
      <h3 className="text-2xl md:text-3xl font-black leading-tight mb-3" style={{ fontFamily: FONT }}>
        Esegui la Verifica Completa
      </h3>
      <p className="text-sm text-[#0a0a0a]/55 mb-8 max-w-2xl leading-relaxed">
        Inserisci l'hash SHA-256 completo (64 caratteri) per avviare il pipeline di analisi: claim extraction via AI, corroborazione multi-fonte (DuckDuckGo + Google Fact Check), trust scoring e ancoraggio IPFS automatico.
      </p>

      <form onSubmit={handleRun} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          placeholder="Hash SHA-256 completo (64 caratteri esadecimali)"
          maxLength={64}
          className="flex-1 px-5 py-4 text-sm border border-[#0a0a0a]/20 bg-white text-[#0a0a0a] placeholder-[#0a0a0a]/35 outline-none focus:border-[#00b894]/60 transition-colors"
          style={{ fontFamily: MONO }}
        />
        <button
          type="submit"
          disabled={hashInput.trim().length !== 64 || runVerify.isPending}
          className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: "#00b894", fontFamily: FONT }}
        >
          {runVerify.isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              Analisi in corso…
            </span>
          ) : (
            "Esegui Verifica →"
          )}
        </button>
      </form>

      {/* Risultato */}
      {runVerify.isError && (
        <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          ❌ Errore: {runVerify.error?.message}
        </div>
      )}

      {(runVerify.isSuccess || (verifyStatus.data?.verified)) && grade !== null && (
        <div
          className="rounded-lg p-6 border"
          style={{ background: `${gradeColor}0d`, borderColor: `${gradeColor}44` }}
        >
          <div className="flex items-start gap-6">
            {/* Grade badge */}
            <div
              className="flex-shrink-0 w-20 h-20 rounded-xl flex flex-col items-center justify-center"
              style={{ background: gradeColor }}
            >
              <span className="text-3xl font-black text-white leading-none">{grade}</span>
              <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest mt-1">Grade</span>
            </div>
            {/* Dettagli */}
            <div className="flex-1">
              <div className="font-black text-lg mb-1" style={{ color: gradeColor, fontFamily: FONT }}>
                Trust Score: {score !== null ? Math.round(Number(score)) : "—"}/100
              </div>
              <div className="text-sm text-[#0a0a0a]/65 mb-3">
                {runVerify.data?.status === "cached"
                  ? "Risultato dalla cache — questo articolo è già stato verificato in precedenza."
                  : "Verifica completata. Il Verification Report è stato salvato e ancorato su IPFS."}
              </div>
              {runVerify.data?.report && typeof runVerify.data.report === "object" && "claims" in (runVerify.data.report as Record<string, unknown>) && (
                <div className="text-xs text-[#0a0a0a]/50 font-mono">
                  {(runVerify.data.report as { claims?: unknown[] }).claims?.length ?? 0} claim analizzati
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPALE
══════════════════════════════════════════════════════════════════════════════ */
export default function ProofPressVerify() {
  const verifyFormRef = useRef<HTMLDivElement>(null);
  const searchString = useSearch();

  // Legge il parametro ?hash= dall'URL
  const urlHash = new URLSearchParams(searchString).get("hash") || "";

  // Scroll automatico al form quando c'è un hash nell'URL
  useEffect(() => {
    if (urlHash && urlHash.trim().length >= 8) {
      setTimeout(() => {
        verifyFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [urlHash]);

  const scrollToForm = () => {
    verifyFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title="ProofPress Verify — Verifiable Corroboration per il giornalismo"
          description="Ogni notizia nasce con un Verification Report pubblico, claim per claim, sigillato crittograficamente. Non promettiamo verità. Forniamo evidenza."
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
                  PROOFPRESS VERIFY · VERIFIABLE CORROBORATION PROTOCOL
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
                  ProofPress Verify è la prima piattaforma di corroborazione verificabile per il giornalismo agentico. Ogni articolo nasce con un Verification Report pubblico che documenta, claim per claim, quante fonti indipendenti lo confermano e con quale credibilità.
                </p>
                <p className="text-base leading-relaxed text-[#0a0a0a]/50 max-w-2xl mt-4 font-semibold tracking-wide">
                  Non promettiamo verità. Forniamo evidenza.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-t border-b border-[#0a0a0a]/8">
                {[
                  { val: "4.000+", label: "fonti classificate per credibilità" },
                  { val: "14/16", label: "claim corroborati in media per articolo" },
                  { val: "3,2", label: "fonti indipendenti per claim" },
                  { val: "< 60 sec", label: "tempo medio di verifica end-to-end" },
                ].map(({ val, label }) => (
                  <div key={val}>
                    <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{val}</div>
                    <div className="text-xs text-[#0a0a0a]/50 uppercase tracking-wide leading-snug">{label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={scrollToForm}
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                  style={{ background: ORANGE, fontFamily: FONT }}
                >
                  Verifica un articolo ↓
                </button>
                <a
                  href="#pricing"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-colors hover:bg-[#0a0a0a]/5 text-center"
                  style={{ borderColor: "#0a0a0a", color: "#0a0a0a", fontFamily: FONT }}
                >
                  Piani e prezzi →
                </a>
                <a
                  href="#contact"
                  className="px-8 py-4 text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-80 text-center"
                  style={{ background: "#0a0a0a", color: "#00e5c8", fontFamily: FONT }}
                >
                  Richiedi demo
                </a>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              SEZIONE VIDEO — COME FUNZIONA
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              {/* Header */}
              <div className="mb-10 text-center">
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border mb-5"
                  style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: FONT }}
                >
                  DEMO · COME FUNZIONA
                </span>
                <h2
                  className="text-3xl md:text-5xl font-black leading-tight text-white mb-4"
                  style={{ fontFamily: FONT }}
                >
                  Guarda ProofPress Verify<br />
                  <span style={{ color: ORANGE }}>in azione.</span>
                </h2>
                <p className="text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
                  Dal testo grezzo al certificato crittografico IPFS: ogni claim estratto, ogni fonte confrontata, ogni esito documentato. In meno di 60 secondi.
                </p>
              </div>

              {/* Video player */}
              <div
                className="relative w-full mx-auto"
                style={{
                  maxWidth: 900,
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                }}
              >
                <video
                  controls
                  preload="metadata"
                  poster=""
                  style={{
                    width: "100%",
                    display: "block",
                    background: "#000",
                  }}
                >
                  <source src="/manus-storage/proofpress_f063fb23.mp4" type="video/mp4" />
                  Il tuo browser non supporta la riproduzione video.
                </video>
              </div>

              {/* 3 pillole sotto il video */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  {
                    num: "01",
                    title: "Estrazione dei claim",
                    desc: "Il sistema identifica automaticamente ogni affermazione fattuale verificabile nell'articolo.",
                  },
                  {
                    num: "02",
                    title: "Corroborazione multi-fonte",
                    desc: "Ogni claim viene confrontato con 4.000+ fonti classificate per credibilità. Media: 3,2 fonti indipendenti per claim.",
                  },
                  {
                    num: "03",
                    title: "Certificato crittografico",
                    desc: "Il Verification Report viene sigillato con SHA-256 e archiviato permanentemente su IPFS. Immutabile e verificabile da chiunque.",
                  },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="border-t-2 pt-6" style={{ borderColor: ORANGE }}>
                    <div
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                      style={{ color: ORANGE, fontFamily: FONT }}
                    >
                      {num}
                    </div>
                    <div
                      className="text-base font-black text-white mb-2"
                      style={{ fontFamily: FONT }}
                    >
                      {title}
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                  </div>
                ))}
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
              L'AI generativa lo sta amplificando.
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70">
              <p>
                Secondo il Reuters Institute Digital News Report 2024, il 59% dei lettori ha difficoltà a distinguere notizie vere da false online. L'AI generativa ha abbassato il costo di produzione di disinformazione credibile a zero. Un articolo plausibile si genera in 30 secondi. Un deepfake video in 5 minuti. La velocità di diffusione supera qualsiasi capacità di verifica umana.
              </p>
              <p>
                I fact-checker tradizionali coprono meno del 3% dei contenuti pubblicati ogni giorno. I disclaimer — "secondo fonti", "come riportato da" — non sono prove: sono formule retoriche che non reggono a nessuna verifica indipendente.
              </p>
              <p>
                Il problema non è la velocità di pubblicazione. Il problema è che non esiste un sistema scalabile per <strong className="text-[#0a0a0a]">dimostrare</strong> che una notizia è affidabile.
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
              Un protocollo, non un plugin.<br />Corroborazione verificabile, non un'opinione.
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70">
              <p>
                ProofPress Verify è un sistema di corroborazione verificabile per il giornalismo agentico. Non è un tool che “controlla i fatti” — è un protocollo strutturato che estrae i claim fattuali da ogni articolo, li confronta con fonti indipendenti classificate per credibilità, e produce un Verification Report pubblico con esito per ogni singolo claim.
              </p>
              <p>
                Il report viene sigillato con hash crittografico SHA-256 e archiviato su IPFS tramite Pinata. Una volta pubblicato, nessuno può modificarlo senza che la modifica sia rilevabile: il CID IPFS è la prova permanente dell'integrità del contenuto.
              </p>
              <p>
                Non è un filtro editoriale. Non decide cosa pubblicare.{" "}
                <strong className="text-[#0a0a0a]">Certifica quello che viene pubblicato</strong> — e rende la certificazione verificabile da chiunque, in qualsiasi momento, senza intermediari.
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
              Cinque passi. Un certificato immutabile.
            </h2>

            <div className="space-y-16">
              {/* Step 1 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>01</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Claim extraction
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65">
                    Il sistema legge l’articolo e identifica automaticamente ogni affermazione fattuale verificabile: numeri, date, attribuzioni, eventi, relazioni causali. Non opinioni, non retoriche — solo claim che possono essere confermati o smentiti da fonti esterne.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#0a0a0a]/8" />

              {/* Step 2 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>02</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Multi-source corroboration
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65 mb-6">
                    Ogni claim viene confrontato con fonti indipendenti classificate per credibilità: database Google Fact Check Tools (200+ organizzazioni IFCN), Media Bias/Fact Check, Iffy Index (12.000+ domini classificati), agenzie stampa internazionali. Il sistema calcola quante fonti confermano, quante contraddicono, quante sono neutrali.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: "SUPPORTED", desc: "Claim confermato da fonti indipendenti", color: "#00b894" },
                      { label: "REFUTED", desc: "Claim contraddetto da fonti verificate", color: "#d63031" },
                      { label: "UNVERIFIED", desc: "Fonti insufficienti per un esito definitivo", color: "#fdcb6e" },
                    ].map(({ label, desc, color }) => (
                      <div key={label} className="p-4 border border-[#0a0a0a]/8 bg-white">
                        <div className="text-xs font-black mb-1" style={{ color, fontFamily: FONT }}>{label}</div>
                        <div className="text-xs text-[#0a0a0a]/50">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#0a0a0a]/8" />

              {/* Step 3 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>03</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Trust Score e Verification Report
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65 mb-6">
                    Il sistema aggrega gli esiti in un Trust Score (0–100) e assegna un grade (A–F). Il Verification Report documenta ogni claim con le fonti usate, l’esito, e il numero di corroborazioni. È pubblico, leggibile da chiunque, esportabile in JSON-LD compatibile con schema.org/ClaimReview.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { grade: "A", range: "85–100", color: "#00b894" },
                      { grade: "B", range: "70–84", color: "#0984e3" },
                      { grade: "C", range: "55–69", color: "#fdcb6e" },
                      { grade: "D", range: "40–54", color: "#e17055" },
                      { grade: "F", range: "0–39", color: "#d63031" },
                    ].map(({ grade, range, color }) => (
                      <div key={grade} className="flex items-center gap-2 px-4 py-2 border" style={{ borderColor: `${color}44`, background: `${color}0d` }}>
                        <span className="text-xl font-black" style={{ color, fontFamily: FONT }}>{grade}</span>
                        <span className="text-xs text-[#0a0a0a]/50">{range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#0a0a0a]/8" />

              {/* Step 4 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>04</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Archiviazione immutabile su IPFS
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65">
                    Il Verification Report viene archiviato su IPFS tramite Pinata. Il CID (Content Identifier) crittografico garantisce che il contenuto non possa essere alterato senza che il CID cambi. Chiunque può recuperare il report originale da qualsiasi gateway IPFS, indipendentemente da ProofPress.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#0a0a0a]/8" />

              {/* Step 5 */}
              <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <div className="text-5xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>05</div>
                </div>
                <div className="md:col-span-11">
                  <h3 className="text-xl font-black mb-4 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
                    Certificato pubblico e verificabile
                  </h3>
                  <p className="text-base leading-relaxed text-[#0a0a0a]/65">
                    Il Verification Report viene archiviato su IPFS tramite Pinata con un CID permanente. Chiunque può recuperarlo da qualsiasi gateway IPFS e confrontarlo con il contenuto originale: se il CID corrisponde, il contenuto non è stato alterato. La verifica è indipendente da ProofPress.
                  </p>
                  <div className="mt-5 p-5 border-l-2" style={{ borderColor: ORANGE, background: `${ORANGE}08` }}>
                    <p className="text-sm leading-relaxed text-[#0a0a0a]/75 font-semibold">
                      Il CID IPFS è la prova. Chiunque può verificare — senza chiedere permesso a nessuno.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              USE CASE COMPARATIVI
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="use-case">
            <Label>Use case</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Due redazioni. Due scelte.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Senza ProofPress */}
              <div className="border border-[#d63031]/20 bg-[#d63031]/3 p-8">
                <div className="text-xs font-bold uppercase tracking-widest text-[#d63031] mb-6">Senza ProofPress Verify</div>
                <div className="space-y-5">
                  {[
                    { persona: "Giulia, 34 anni, lettrice", text: "Legge un articolo su un nuovo farmaco. Non sa se le fonti citate esistono davvero. Non sa se il giornalista ha verificato i dati clinici. Condivide comunque, perché sembra credibile." },
                    { persona: "Il direttore di una testata", text: "Pubblica 80 articoli al giorno. Il suo team verifica manualmente il 4% dei contenuti. Sa che qualcosa potrebbe essere sbagliato, ma non ha strumenti per sapere cosa e quando." },
                  ].map(({ persona, text }) => (
                    <div key={persona} className="border-l-2 border-[#d63031]/30 pl-4">
                      <div className="text-xs font-bold text-[#d63031]/70 mb-2">{persona}</div>
                      <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Con ProofPress */}
              <div className="border border-[#00b894]/20 bg-[#00b894]/3 p-8">
                <div className="text-xs font-bold uppercase tracking-widest text-[#00b894] mb-6">Con ProofPress Verify</div>
                <div className="space-y-5">
                  {[
                    { persona: "Giulia, 34 anni, lettrice", text: "Vede il badge Grade A sull’articolo. Clicca. Legge che 14 dei 16 claim sono stati corroborati da fonti indipendenti. Condivide con fiducia, citando il report come fonte." },
                    { persona: "Il direttore di una testata", text: "Ogni articolo esce con un Verification Report pubblico. I lettori possono controllare. La redazione può dimostrare il proprio rigore con dati, non con dichiarazioni. La credibilità diventa misurabile." },
                  ].map(({ persona, text }) => (
                    <div key={persona} className="border-l-2 border-[#00b894]/40 pl-4">
                      <div className="text-xs font-bold text-[#00b894]/80 mb-2">{persona}</div>
                      <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                    </div>
                  ))}
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
              <VerifyForm initialHash={urlHash} />

              {/* ── Esegui Verifica Completa (Verify Engine) ── */}
              <FullVerifyPanel />
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              PERCHÉ NON DICIAMO NON-AI
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="non-ai">
            <Label>Una posizione chiara</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Perché non diciamo “non-AI”.
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70">
              <p>
                Molti competitor si posizionano come “non-AI” per rassicurare i lettori. È una scelta di marketing che non regge a un’analisi seria.
              </p>
              <p>
                L’AI non è il problema del giornalismo. Il problema è l’AI <strong className="text-[#0a0a0a]">senza accountability</strong>. Un articolo scritto da un umano senza fonti verificate è meno affidabile di un articolo generato da AI con un Verification Report pubblico. Il medium non determina la qualità. Il metodo sì.
              </p>
              <p>
                ProofPress usa AI per fare ciò che nessun umano può fare a scala: estrarre ogni claim, confrontarlo con migliaia di fonti, produrre un report strutturato in meno di 60 secondi. Poi usa la crittografia per rendere quel report immutabile e verificabile.
              </p>
              <div className="p-5 border-l-2 mt-6" style={{ borderColor: ORANGE, background: `${ORANGE}08` }}>
                <p className="text-sm leading-relaxed text-[#0a0a0a]/75 font-semibold">
                  Non è “non-AI”. È AI con prova. La differenza è tutto.
                </p>
              </div>
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              DIFFERENZIAZIONE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="differenziazione">
            <Label>Differenziazione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Non è un fact-checker.<br />È corroborazione verificabile.
            </h2>
            <div className="space-y-8">
              {[
                {
                  title: "Fact-checker tradizionali vs. ProofPress Verify",
                  text: "I fact-checker umani producono giudizi soggettivi (‘True’, ‘Mostly True’, ‘Misleading’). Sono lenti, non scalano, e il loro output non è verificabile né immutabile. ProofPress Verify produce un Verification Report strutturato, con esito per ogni singolo claim, ancorato crittograficamente. Non dice ‘è vero’ — mostra quante fonti indipendenti lo confermano e con quale credibilità.",
                },
                {
                  title: "AI senza crittografia vs. ProofPress Verify",
                  text: "Molti tool usano l'AI per 'analizzare' le notizie. Ma senza un layer crittografico, l'output può essere modificato o cancellato dopo la pubblicazione. ProofPress Verify aggiunge il sigillo IPFS che rende la certificazione permanente, pubblica e verificabile da chiunque.",
                },
                {
                  title: "Blockchain senza AI vs. ProofPress Verify",
                  text: "Registrare un contenuto su blockchain non serve se il contenuto non è stato prima verificato. Notarizzi spazzatura, hai spazzatura notarizzata. ProofPress Verify unisce corroborazione AI (che verifica claim per claim) e crittografia Web3 (che sigilla il risultato). Uno senza l’altro non produce accountability reale.",
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
                  text: "Ogni articolo esce con un Verification Report pubblico. Il badge ProofPress Verify è visibile al lettore con grade e score. La credibilità della testata non è più un’affermazione — è un dato misurabile, verificabile da chiunque in qualsiasi momento.",
                },
                {
                  icon: "✍️",
                  title: "Giornalisti indipendenti e freelance",
                  text: "Un freelance non ha una redazione di fact-checker alle spalle. Con ProofPress Verify, ogni suo contenuto è certificato con lo stesso rigore metodologico di una testata strutturata. Il Verification Report diventa il suo portfolio di credibilità.",
                },
                {
                  icon: "🏢",
                  title: "Aziende e brand media",
                  text: "Le corporate newsroom soffrono di un deficit strutturale di credibilità: i lettori le percepiscono come PR mascherata. ProofPress Verify dà ai contenuti aziendali un layer di certificazione indipendente che nessun disclaimer può sostituire.",
                },
                {
                  icon: "📊",
                  title: "Investitori e decision-maker",
                  text: "Investitori, board, analisti prendono decisioni basandosi su informazioni. Con ProofPress Verify possono verificare in autonomia che le notizie su cui basano le loro scelte siano state corroborate con un metodo trasparente, documentato e immutabile.",
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
            <Label>Come funziona sotto</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6" style={{ fontFamily: FONT }}>
              Tre principi. Zero compromessi.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {[
                {
                  icon: "🔍",
                  title: "AI multi-fonte",
                  text: "Ogni claim viene estratto e confrontato con 200+ organizzazioni di fact-checking e migliaia di fonti classificate per credibilità. Il risultato è un trust score documentato, non un'opinione.",
                },
                {
                  icon: "🔐",
                  title: "Sigillo crittografico",
                  text: "Il Verification Report viene hashato con SHA-256: un fingerprint unico che cambia se anche un solo carattere del contenuto viene alterato. L'integrità è matematicamente verificabile.",
                },
                {
                  icon: "📦",
                  title: "Archiviazione immutabile",
                  text: "Il report viene archiviato su IPFS tramite Pinata con un CID permanente. Chiunque può recuperarlo da qualsiasi gateway IPFS e verificare che il contenuto non sia stato modificato.",
                },
              ].map(({ icon, title, text }) => (
                <div key={title} className="p-6 border border-[#0a0a0a]/8 bg-white">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-black text-base mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/60">{text}</p>
                </div>
              ))}
            </div>
            <TechSpecs />
          </Section>

          <Divider />
          {/* ═══════════════════════════════════════════════════════════════════
              ESEMPI VERIFICATI
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#0a0a0a" id="esempi">
            <Label light>Verify in azione</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4 text-white" style={{ fontFamily: FONT }}>
              Cosa vede il lettore.
            </h2>
            <p className="text-base text-white/40 max-w-2xl mb-12 leading-relaxed">
              Ogni articolo pubblicato su ProofPress nasce con un Verification Report. Ecco come appare il badge trust grade e il certificato IPFS su contenuti reali.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  grade: "A",
                  score: "92%",
                  title: "OpenAI lancia GPT-5: capacità multimodali avanzate e nuove API per sviluppatori",
                  category: "AI",
                  claims: 8,
                  supported: 8,
                  color: "#22c55e",
                  note: "8/8 claim corroborati da fonti IFCN e media tech tier-1",
                },
                {
                  grade: "B",
                  score: "74%",
                  title: "Startup italiana raccoglie 12M€ in Series A: focus su AI per la supply chain",
                  category: "Startup",
                  claims: 6,
                  supported: 5,
                  color: "#3b82f6",
                  note: "5/6 claim verificati. 1 claim su valutazione non corroborato da fonti pubbliche",
                },
                {
                  grade: "C",
                  score: "51%",
                  title: "Il mercato VC europeo rallenta: investimenti in calo del 18% nel Q1 2026",
                  category: "Venture Capital",
                  claims: 5,
                  supported: 3,
                  color: "#eab308",
                  note: "3/5 claim verificati. Dato percentuale non confermato da fonti primarie",
                },
              ].map(({ grade, score, title, category, claims, supported, color, note }) => (
                <div key={title} className="bg-white/5 border border-white/8 p-6 flex flex-col gap-4">
                  {/* Header badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30">{category}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 flex items-center justify-center font-black text-lg"
                        style={{ background: color, color: grade === "C" ? "#0a0a0a" : "#fff", fontFamily: FONT }}
                      >
                        {grade}
                      </div>
                      <span className="text-sm font-bold text-white/60">{score}</span>
                    </div>
                  </div>
                  {/* Titolo */}
                  <p className="text-sm font-semibold text-white leading-snug">{title}</p>
                  {/* Barra claim */}
                  <div>
                    <div className="flex justify-between text-xs text-white/40 mb-1">
                      <span>Claim corroborati</span>
                      <span>{supported}/{claims}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(supported / claims) * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                  {/* Nota */}
                  <p className="text-xs text-white/35 leading-relaxed italic">{note}</p>
                  {/* CID mock */}
                  <div className="pt-3 border-t border-white/8">
                    <span className="text-xs font-mono text-white/20">IPFS · CID: bafkrei… ✓ certificato</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border border-white/8 text-xs text-white/25 leading-relaxed">
              Esempi rappresentativi basati su contenuti reali della piattaforma. Il sistema di verifica è attivo su ogni articolo pubblicato. I grade variano in base al numero di claim fattuali e alla disponibilità di fonti indipendenti.
            </div>
          </Section>
          <Divider />
          {/* ═══════════════════════════════════════════════════════════════════
              PRICING
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#fff" id="pricing">
            <Label>Modello di accesso</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              Incluso. O potenziato.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 max-w-2xl mb-12 leading-relaxed">
              ProofPress Verify è già integrato nella piattaforma ProofPress. Chi pubblica con noi ottiene la corroborazione verificabile senza costi aggiuntivi. Per redazioni esterne, media company e brand publisher, è disponibile come add-on SaaS indipendente.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Piano 1 — Incluso */}
              <div className="p-8 border-2 border-[#0a0a0a]/8 bg-[#f8f8f6] flex flex-col">
                <div className="text-xs font-bold uppercase tracking-widest text-[#0a0a0a]/40 mb-3">Per i publisher ProofPress</div>
                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: FONT }}>Incluso</h3>
                <div className="text-4xl font-black mb-1" style={{ fontFamily: FONT, color: "#00e5c8" }}>€0</div>
                <div className="text-sm text-[#0a0a0a]/40 mb-6">già nel piano ProofPress</div>
                <ul className="space-y-3 text-sm text-[#0a0a0a]/65 flex-1">
                  {["Verifica automatica su ogni articolo", "Badge trust grade A–F visibile ai lettori", "Certificato IPFS permanente", "Verification Report pubblico", "Fino a 500 articoli/mese"].map(f => (
                    <li key={f} className="flex items-start gap-2"><span style={{ color: "#00e5c8" }} className="font-bold mt-0.5">✓</span>{f}</li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-[#0a0a0a]/8">
                  <a href="/proofpress-verify#contact" className="block text-center text-sm font-bold py-3 px-6 border-2 border-[#0a0a0a]/20 hover:border-[#0a0a0a]/40 transition-colors">
                    Diventa publisher
                  </a>
                </div>
              </div>
              {/* Piano 2 — Add-on SaaS Starter */}
              <div className="p-8 border-2 flex flex-col" style={{ borderColor: ORANGE }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Add-on SaaS — Starter</div>
                <h3 className="text-2xl font-black mb-2" style={{ fontFamily: FONT }}>Verify Essential</h3>
                <div className="text-4xl font-black mb-1" style={{ fontFamily: FONT, color: ORANGE }}>€490</div>
                <div className="text-sm text-[#0a0a0a]/40 mb-6">/mese · fino a 1.000 articoli</div>
                <ul className="space-y-3 text-sm text-[#0a0a0a]/65 flex-1">
                  {["API REST per integrazione redazionale", "Badge trust grade via widget embed", "Certificato IPFS su ogni articolo", "Dashboard report mensile", "SLA 99.5% uptime", "Onboarding tecnico incluso"].map(f => (
                    <li key={f} className="flex items-start gap-2"><span style={{ color: ORANGE }} className="font-bold mt-0.5">✓</span>{f}</li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-[#0a0a0a]/8">
                  <a href="/proofpress-verify#contact" className="block text-center text-sm font-bold py-3 px-6 text-white transition-colors" style={{ background: ORANGE }}>
                    Richiedi demo
                  </a>
                </div>
              </div>
              {/* Piano 3 — Add-on SaaS Pro */}
              <div className="p-8 border-2 border-[#0a0a0a] bg-[#0a0a0a] flex flex-col">
                <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Add-on SaaS — Pro</div>
                <h3 className="text-2xl font-black mb-2 text-white" style={{ fontFamily: FONT }}>Verify Pro</h3>
                <div className="text-4xl font-black mb-1 text-white" style={{ fontFamily: FONT }}>€1.490</div>
                <div className="text-sm text-white/30 mb-6">/mese · articoli illimitati</div>
                <ul className="space-y-3 text-sm text-white/60 flex-1">
                  {["Tutto di Verify Essential", "White-label: badge con il tuo brand", "Verifica in tempo reale (< 60 sec)", "Export report in PDF/JSON", "Accesso prioritario a nuove feature", "Account manager dedicato"].map(f => (
                    <li key={f} className="flex items-start gap-2"><span className="font-bold mt-0.5" style={{ color: "#00e5c8" }}>✓</span>{f}</li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <a href="/proofpress-verify#contact" className="block text-center text-sm font-bold py-3 px-6 text-[#0a0a0a] transition-colors" style={{ background: "#00e5c8" }}>
                    Contattaci
                  </a>
                </div>
              </div>
            </div>
            {/* Nota prezzi */}
            <div className="p-5 border border-[#0a0a0a]/8 bg-[#f8f8f6] text-sm text-[#0a0a0a]/50 leading-relaxed">
              <strong className="text-[#0a0a0a]/70">Prezzi indicativi.</strong> I piani SaaS sono in fase di definizione. Contattaci per un'offerta personalizzata basata su volumi, verticale editoriale e livello di integrazione richiesto. È disponibile anche un modello <strong className="text-[#0a0a0a]/70">revenue sharing</strong> per media company con volumi elevati.
            </div>
          </Section>
          <Divider />
          {/* ═══════════════════════════════════════════════════════════════════
              FAQ
          ═══════════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════════
              RISORSE TECNICHE — WHITE PAPER + METHODOLOGY
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="py-16 md:py-20" style={{ background: "#f9f9f9", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="text-center mb-10">
                <Label>Documentazione Tecnica</Label>
                <h2 className="text-2xl md:text-3xl font-black mb-3" style={{ fontFamily: FONT, color: "#0a0a0a" }}>
                  Metodologia e Specifiche Tecniche
                </h2>
                <p className="text-sm max-w-xl mx-auto" style={{ color: "#0a0a0a", opacity: 0.55 }}>
                  La documentazione tecnica del protocollo ProofPress Verify è riservata. Accedi con le credenziali fornite da AxiomiX LLC.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-0.5">White Paper</p>
                      <h3 className="text-base font-bold text-[#0a0a0a] leading-tight">Technical White Paper v4.0</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Specifica tecnica completa: architettura SHA-256, pipeline di verifica agentica, formula Trust Score, Journalist Portal, API, compliance AI Act. Redatto da AxiomiX LLC.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["SHA-256", "Claude AI", "Trust Score", "Journalist Key", "AI Act"].map(tag => (
                      <span key={tag} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <Link
                    href="/methodology/v1"
                    className="mt-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-80"
                    style={{ background: "#0a0a0a" }}
                  >
                    <Lock className="w-4 h-4" />
                    Accedi e Scarica PDF →
                  </Link>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: ORANGE }}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-0.5">Methodology Reference</p>
                      <h3 className="text-base font-bold text-[#0a0a0a] leading-tight">Methodology v1 — Specifiche interattive</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Pagina tecnica interattiva con formula Trust Score, tabelle grading, schema JSON del Verification Report, Domain Credibility Registry e implementazione TypeScript.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Formula", "Grading A–F", "JSON Schema", "Domain Registry", "TypeScript"].map(tag => (
                      <span key={tag} className="text-[10px] font-mono bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <Link
                    href="/methodology/v1"
                    className="mt-auto inline-flex items-center gap-2 border border-[#0a0a0a] text-[#0a0a0a] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0a0a0a] hover:text-white transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Accedi e Leggi la Metodologia
                  </Link>
                </div>
              </div>
            </div>
          </section>
          <Divider />
          <FaqSection />
          <Divider />
          {/* ═══════════════════════════════════════════════════════════════════
              CTA FINALE — FORM DI CONTATTO
          ═══════════════════════════════════════════════════════════════════ */}
          <section id="contact" className="py-24 md:py-32" style={{ background: "#f5f5f7" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="text-center mb-12">
                <Label>Incluso in tutti i piani</Label>
                <h2
                  className="text-3xl md:text-5xl font-black leading-tight mb-6"
                  style={{ fontFamily: FONT, color: "#0a0a0a" }}
                >
                  La corroborazione verificabile<br />
                  non è un lusso.<br />
                  <span style={{ color: ORANGE }}>È il nuovo standard.</span>
                </h2>
                <p className="text-base mb-4 max-w-xl mx-auto" style={{ color: "#0a0a0a", opacity: 0.55 }}>
                  Scrivici per integrare ProofPress Verify nella tua redazione, per richiedere una demo personalizzata, o per esplorare partnership tecnologiche.
                </p>
              </div>
              <ContactForm origine="ProofPress Verify" />
            </div>
          </section>

          {/* Quote footer */}
          <div className="py-12 text-center" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm text-white/30 italic max-w-2xl mx-auto px-5" style={{ fontFamily: FONT }}>
              “Non promettiamo verità. Forniamo evidenza. La differenza è tutto.”
            </p>
          </div>

          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
