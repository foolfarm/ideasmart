/*
 * PROOFPRESS VERIFY™ — Pagina hub del protocollo universale di certificazione
 * Logica: Verify come protocollo crittografico applicabile a qualsiasi contenuto
 *         (giornalismo, informazione aziendale, email)
 * Le 3 estensioni (News Verify, Info Verify, Email Verify) sono verticali applicative
 * Struttura: hero protocollo → problema universale → come funziona il protocollo →
 *            3 estensioni → specs tecniche → form verifica hash → CTA
 */
import { useState, useRef, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import ContactForm from "@/components/ContactForm";
import SEOHead from "@/components/SEOHead";
import { ShieldCheck, ShieldX, AlertTriangle, ChevronDown, ChevronUp, Lock, BookOpen, FileText } from "lucide-react";

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
    { label: "Tempo di certificazione", value: "Media < 3 minuti per contenuto, dipende dalla complessità e dal numero di claim." },
    { label: "Punteggio di affidabilità", value: "Scala 0-100 basata su: coerenza fattuale (40%), qualità delle fonti (30%), assenza di bias (20%), freschezza dei dati (10%)." },
    { label: "Hash crittografico", value: "SHA-256, generato sul payload completo: contenuto + report + metadata + timestamp." },
    { label: "Archiviazione", value: "IPFS tramite Pinata. CID pubblico e verificabile su qualsiasi gateway IPFS, indipendente da ProofPress." },
    { label: "Codice di verifica", value: "PP-XXXXXXXXXXXXXXXX — 16 caratteri alfanumerici. Inseribile su proofpress.ai/proofpress-verify per accedere al Verification Report originale." },
    { label: "AI engine", value: "Claude (Anthropic) per l'estrazione e classificazione dei claim. Pipeline proprietaria per il confronto multi-fonte e il calcolo del Trust Score." },
    { label: "Compliance", value: "Conforme AI Act (EU) Titolo IV. Il Verification Report documenta il processo di verifica in modo trasparente e auditabile." },
  ];
  return (
    <div className="border border-[#0a0a0a]/10 mt-10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#0a0a0a]/3 transition-colors"
        style={{ fontFamily: FONT }}
      >
        <span className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a]/60">Specifiche tecniche complete</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#0a0a0a]/40" /> : <ChevronDown className="w-4 h-4 text-[#0a0a0a]/40" />}
      </button>
      {open && (
        <div className="border-t border-[#0a0a0a]/8">
          {specs.map(({ label, value }) => (
            <div key={label} className="grid md:grid-cols-3 gap-4 px-6 py-4 border-b border-[#0a0a0a]/5 last:border-0">
              <div className="text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>{label}</div>
              <div className="md:col-span-2 text-sm leading-relaxed text-[#0a0a0a]/70" style={{ fontFamily: FONT }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Form verifica hash ── */
function VerifyHashForm({ formRef }: { formRef: React.RefObject<HTMLDivElement | null> }) {
  const [inputHash, setInputHash] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifyMutation = (trpc as any).verify?.verifyHash?.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHash.trim()) return;
    verifyMutation.mutate({ hash: inputHash.trim() });
  };

  const result = verifyMutation?.data;

  return (
    <div ref={formRef} className="border-2 border-[#0a0a0a]/10 p-8 md:p-10" style={{ background: "#fafafa" }}>
      <Label>Verifica un certificato</Label>
      <h3 className="text-2xl font-black mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>
        Hai un codice PP-XXXXXXXXXXXXXXXX?
      </h3>
      <p className="text-sm text-[#0a0a0a]/55 mb-8 leading-relaxed">
        Inserisci il codice di verifica ProofPress o l'hash SHA-256 del documento per accedere al Verification Report originale e verificarne l'integrità crittografica.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={inputHash}
          onChange={e => setInputHash(e.target.value)}
          placeholder="PP-XXXXXXXXXXXXXXXX oppure hash SHA-256..."
          className="flex-1 px-4 py-3 border border-[#0a0a0a]/15 text-sm focus:outline-none focus:border-[#0a0a0a]/40 bg-white"
          style={{ fontFamily: MONO }}
        />
        <button
          type="submit"
          disabled={verifyMutation.isPending || !inputHash.trim()}
          className="px-8 py-3 text-sm font-bold uppercase tracking-widest text-white disabled:opacity-40 transition-opacity hover:opacity-80"
          style={{ background: ORANGE, fontFamily: FONT }}
        >
          {verifyMutation.isPending ? "Verifica..." : "Verifica →"}
        </button>
      </form>

      {verifyMutation.isError && (
        <div className="mt-6 p-5 border border-red-200 bg-red-50 flex items-start gap-3">
          <ShieldX className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 mb-1">Certificato non trovato</p>
            <p className="text-xs text-red-600">Il codice inserito non corrisponde a nessun certificato nel registro ProofPress. Verifica che il codice sia corretto.</p>
          </div>
        </div>
      )}

      {result && submitted && (
        <div className="mt-6 space-y-4">
          <div className={`p-5 border flex items-start gap-3 ${result.verified ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            {result.verified
              ? <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              : <ShieldX className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-sm font-bold mb-1 ${result.verified ? "text-green-700" : "text-red-700"}`}>
                {result.verified ? "Certificato verificato — integrità confermata" : "Certificato non valido — integrità compromessa"}
              </p>
              {result.verified && (
                <p className="text-xs text-green-600">Il contenuto non è stato modificato dopo la certificazione. Il CID IPFS è verificabile su qualsiasi gateway pubblico.</p>
              )}
            </div>
          </div>
          {result.report && (
            <div className="p-5 border border-[#0a0a0a]/10 bg-white space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Trust Score", value: `${result.report.trustScore}/100` },
                  { label: "Grade", value: result.report.grade },
                  { label: "Claim verificati", value: result.report.claimsVerified },
                  { label: "Tipo", value: result.report.contentType ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xl font-black text-[#0a0a0a]" style={{ fontFamily: FONT }}>{value}</div>
                    <div className="text-[10px] uppercase tracking-wide text-[#0a0a0a]/40 mt-1" style={{ fontFamily: FONT }}>{label}</div>
                  </div>
                ))}
              </div>
              {result.report.ipfsCid && (
                <div className="pt-3 border-t border-[#0a0a0a]/8">
                  <p className="text-[10px] uppercase tracking-wide text-[#0a0a0a]/40 mb-1" style={{ fontFamily: FONT }}>CID IPFS</p>
                  <p className="text-xs font-mono text-[#0a0a0a]/60 break-all">{result.report.ipfsCid}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPALE
═══════════════════════════════════════════════════════════════════════════ */
export default function ProofPressVerify() {
  const verifyFormRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const search = useSearch();
  const urlHash = new URLSearchParams(search).get("hash") ?? "";

  const AUDIO_SCOPRI_URL = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ProofPress_Verify_scopri_di_piu_d4b2c0f5.mp4";

  useEffect(() => {
    if (urlHash && urlHash.trim().length >= 8) {
      setTimeout(() => {
        verifyFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [urlHash]);

  const scrollToForm = () => verifyFormRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="flex min-h-screen">
      
      <div className="flex-1 min-w-0">
        <SEOHead
          title="ProofPress Verify™ — Il protocollo di certificazione crittografica per qualsiasi contenuto"
          description="ProofPress Verify™ è il protocollo universale di corroborazione verificabile. Certifica notizie, documenti aziendali e comunicazioni email con hash SHA-256 e IPFS. Tre estensioni: News Verify, Info Verify, Email Verify."
          canonical="https://proofpress.ai/proofpress-verify"
          ogSiteName="Proof Press"
        />

        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a", fontFamily: FONT }}>
          <SharedPageHeader />
          {/* ═══════════════════════════════════════════════════════════════════
              HERO — PROTOCOLLO UNIVERSALE
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                {/* Testo hero */}
                <div className="flex-1 min-w-0">
                  <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <span
                      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border"
                      style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d`, fontFamily: FONT }}
                    >
                      Protocollo di Certificazione
                    </span>
                    <span
                      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border border-[#0a0a0a]/15"
                      style={{ color: "#0a0a0a", opacity: 0.45, fontFamily: FONT }}
                    >
                      3 Estensioni
                    </span>
                  </div>
                  <div className="mb-10">
                    <h1
                      className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-[#0a0a0a] mb-6"
                      style={{ fontFamily: FONT }}
                    >
                      <span style={{ color: ORANGE }}>ProofPress</span> Verify™<br />
                      <span className="text-[#0a0a0a]/25">Qualsiasi contenuto.<br />Certificato.</span>
                    </h1>
                    <p className="text-lg md:text-xl leading-relaxed text-[#0a0a0a]/65 max-w-4xl">
                      ProofPress Verify™ è un <strong className="text-[#0a0a0a]">protocollo universale di corroborazione verificabile</strong>. Analizza qualsiasi contenuto — notizie, documenti aziendali, comunicazioni email — claim per claim, lo certifica con hash crittografico SHA-256 e lo archivia su IPFS. Immutabile, pubblico, verificabile da chiunque senza intermediari. Disponibile in 3 estensioni specializzate per settore.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                    <button
                      onClick={scrollToContact}
                      className="px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                      style={{ background: ORANGE, fontFamily: FONT }}
                    >
                      Richiedi una demo →
                    </button>
                    <button
                      onClick={scrollToForm}
                      className="px-8 py-4 text-sm font-bold uppercase tracking-widest border border-[#0a0a0a]/20 hover:border-[#0a0a0a]/50 transition-colors"
                      style={{ fontFamily: FONT }}
                    >
                      Verifica un certificato ↓
                    </button>
                  </div>
                  {/* Audio player */}
                  <div
                    className="mt-8 p-5 border"
                    style={{ background: "#f0f4ff", borderColor: "#1a3a6b22" }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#1a3a6b" }}>
                        <span className="text-white text-lg">🎤</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a3a6b", fontFamily: FONT }}>ProofPress Verify™</p>
                        <p className="text-sm font-semibold" style={{ color: "#0a0a0a", fontFamily: FONT }}>Il protocollo di certificazione universale</p>
                      </div>
                    </div>
                    <audio controls preload="none" className="w-full" style={{ accentColor: ORANGE }}>
                      <source src={AUDIO_SCOPRI_URL} type="audio/mp4" />
                      Il tuo browser non supporta la riproduzione audio.
                    </audio>
                    <p className="mt-3 text-xs leading-relaxed" style={{ color: "#1a3a6b", opacity: 0.7, fontFamily: FONT }}>
                      Ascolta come ProofPress Verify™ certifica qualsiasi contenuto in meno di 3 minuti — dall'estrazione dei claim al certificato crittografico IPFS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              SEZIONE VIDEO
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="py-16 md:py-20" style={{ background: "#0a0a0a" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <div className="mb-8 text-center">
                <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: FONT }}>
                  ProofPress Verify™ · In pochi secondi
                </span>
                <h2 className="mt-3 text-2xl md:text-3xl font-black text-white" style={{ fontFamily: FONT }}>
                  Il protocollo in azione.
                </h2>
              </div>
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9", background: "#1a1a1a" }}>
                <video className="w-full h-full object-cover" controls preload="metadata" style={{ display: "block" }}>
                  <source src="/manus-storage/ProofPress__Prova_nell_IA_37d6d1c7.mp4" type="video/mp4" />
                  Il tuo browser non supporta la riproduzione video.
                </video>
              </div>
              <p className="mt-4 text-center text-[13px] text-white/35" style={{ fontFamily: FONT }}>
                ProofPress Verify™ — Certificazione crittografica di qualsiasi contenuto nell'era dell'AI
              </p>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              IL PROBLEMA UNIVERSALE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="problema">
            <Label>Il problema</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              L'informazione ha un problema di fiducia.<br />
              Non solo il giornalismo.
            </h2>
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-[#0a0a0a]/70">
              <p>
                Il problema non riguarda solo le notizie. Riguarda qualsiasi contenuto che circola nell'ecosistema digitale: comunicati stampa alterati dopo la pubblicazione, report aziendali modificati senza traccia, newsletter con dati cambiati in transito, white paper con claim non verificabili.
              </p>
              <p>
                L'AI generativa ha abbassato il costo di produzione di contenuti plausibili a zero. Un articolo si genera in 30 secondi. Un comunicato stampa convincente in 2 minuti. Un report finanziario credibile in 5. La velocità di produzione supera qualsiasi capacità di verifica umana — in qualsiasi settore.
              </p>
              <p>
                Il problema non è la velocità di produzione. Il problema è che non esiste un sistema scalabile per <strong className="text-[#0a0a0a]">dimostrare</strong> che un contenuto è integro, verificato e non alterato — indipendentemente dal settore in cui opera chi lo produce.
              </p>
              <p>
                ProofPress Verify™ è quel sistema.
              </p>
            </div>

            {/* 3 contesti del problema */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: "📰",
                  context: "Giornalismo",
                  text: "59% dei lettori non distingue notizie vere da false (Reuters Institute 2024). I fact-checker coprono meno del 3% dei contenuti pubblicati ogni giorno.",
                },
                {
                  icon: "🏢",
                  context: "Informazione aziendale",
                  text: "Comunicati stampa, report e white paper vengono distribuiti su canali non controllati. Non esiste un modo standard per verificare che il documento ricevuto sia identico all'originale.",
                },
                {
                  icon: "✉️",
                  context: "Comunicazioni email",
                  text: "Le email possono essere intercettate e modificate in transito. Per newsletter editoriali, comunicazioni finanziarie o aggiornamenti regolatori, l'integrità del contenuto è un requisito non negoziabile.",
                },
              ].map(({ icon, context, text }) => (
                <div key={context} className="p-6 border border-[#0a0a0a]/8 bg-white">
                  <div className="text-2xl mb-3">{icon}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#0a0a0a]/40 mb-2" style={{ fontFamily: FONT }}>{context}</div>
                  <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              COME FUNZIONA IL PROTOCOLLO
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="protocollo">
            <Label>Il protocollo</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
              Un protocollo, non un plugin.<br />Corroborazione verificabile, non un'opinione.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-12 max-w-2xl leading-relaxed">
              ProofPress Verify™ funziona allo stesso modo per qualsiasi tipo di contenuto. La pipeline è identica — cambia solo il contesto applicativo.
            </p>
            <div className="space-y-10">
              {[
                {
                  step: "01",
                  title: "Acquisizione del contenuto",
                  text: "Il protocollo accetta qualsiasi contenuto testuale: articoli, comunicati stampa, report, white paper, email, post social. L'input può avvenire via API, integrazione diretta con la piattaforma di produzione, o upload manuale.",
                },
                {
                  step: "02",
                  title: "Estrazione e classificazione dei claim",
                  text: "Il sistema AI (Claude, Anthropic) analizza il testo e identifica tutti i claim fattuali verificabili: dati numerici, attribuzioni, eventi, dichiarazioni, proiezioni. Ogni claim viene isolato e classificato per tipologia e verificabilità.",
                },
                {
                  step: "03",
                  title: "Corroborazione multi-fonte",
                  text: "Ogni claim viene confrontato con 4.000+ fonti classificate per credibilità: agenzie stampa, database istituzionali, pubblicazioni peer-reviewed, registri pubblici. Il sistema calcola un trust score per ogni claim e un punteggio aggregato per il contenuto.",
                },
                {
                  step: "04",
                  title: "Verification Report",
                  text: "Il sistema genera un Verification Report strutturato con esito per ogni singolo claim: corroborato, non corroborato, parzialmente corroborato. Il report include le fonti usate per ogni verifica e il trust score complessivo (0–100, grade A–F).",
                },
                {
                  step: "05",
                  title: "Certificato crittografico SHA-256 + IPFS",
                  text: "Il contenuto originale e il Verification Report vengono hashati con SHA-256 e archiviati su IPFS tramite Pinata. Il CID crittografico è la prova permanente che il contenuto non è stato alterato. La verifica è indipendente da ProofPress — il protocollo crittografico è la garanzia.",
                },
                {
                  step: "06",
                  title: "Codice di verifica pubblico",
                  text: "Il contenuto riceve il codice PP-XXXXXXXXXXXXXXXX. Chiunque — lettori, investitori, regolatori, destinatari — può inserire il codice su proofpress.ai/proofpress-verify per accedere al Verification Report originale e verificare l'integrità del contenuto in autonomia.",
                },
              ].map(({ step, title, text }) => (
                <div key={step} className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-1">
                    <div className="text-4xl font-black leading-none" style={{ color: `${ORANGE}33`, fontFamily: FONT }}>{step}</div>
                  </div>
                  <div className="md:col-span-11 border-l-2 pl-6" style={{ borderColor: `${ORANGE}33` }}>
                    <h3 className="text-lg font-black mb-3 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                    <p className="text-base leading-relaxed text-[#0a0a0a]/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <TechSpecs />
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              LE 3 ESTENSIONI
          ═══════════════════════════════════════════════════════════════════ */}
          <section className="py-20 md:py-28" style={{ background: "#f8f8f6" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8">
              <Label>Le 3 Estensioni</Label>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ fontFamily: FONT }}>
                Un protocollo.<br />Tre applicazioni verticali.
              </h2>
              <p className="text-base text-[#0a0a0a]/55 mb-12 max-w-2xl leading-relaxed">
                ProofPress Verify™ si declina in tre estensioni specializzate per settore. La tecnologia crittografica è identica — cambia il contesto di applicazione, l'integrazione con le piattaforme di settore e il tipo di contenuto certificato.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {/* News Verify */}
                <a
                  href="/proofpress-verify/news"
                  className="group block p-8 border-2 border-[#0a0a0a]/10 bg-white hover:border-[#ff5500] transition-all duration-200 hover:shadow-lg"
                >
                  <div className="mb-5">
                    <div className="w-12 h-12 flex items-center justify-center text-2xl mb-4" style={{ background: `${ORANGE}12` }}>
                      📰
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: ORANGE, fontFamily: FONT }}>Estensione 01 · Giornalismo</div>
                    <h3 className="text-xl font-black text-[#0a0a0a] mb-3 group-hover:text-[#ff5500] transition-colors" style={{ fontFamily: FONT }}>
                      News Verify
                    </h3>
                    <p className="text-sm leading-relaxed text-[#0a0a0a]/60">
                      Certifica ogni articolo pubblicato dalla tua redazione. Ogni notizia esce con un Verification Report pubblico, claim per claim, sigillato con hash SHA-256 e archiviato su IPFS. Il badge trust grade è visibile al lettore.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {["Redazioni", "Freelance", "Brand Media"].map(t => (
                      <span key={t} className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 bg-[#0a0a0a]/5 text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>{t}</span>
                    ))}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest group-hover:text-[#ff5500] transition-colors" style={{ color: "#0a0a0a", fontFamily: FONT }}>
                    Scopri News Verify →
                  </div>
                </a>

                {/* Info Verify */}
                <a
                  href="/proofpress-verify/info"
                  className="group block p-8 border-2 border-[#0a0a0a]/10 bg-white hover:border-[#0984e3] transition-all duration-200 hover:shadow-lg"
                >
                  <div className="mb-5">
                    <div className="w-12 h-12 flex items-center justify-center text-2xl mb-4" style={{ background: "#0984e312" }}>
                      ℹ️
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#0984e3", fontFamily: FONT }}>Estensione 02 · Informazione Aziendale</div>
                    <h3 className="text-xl font-black text-[#0a0a0a] mb-3 group-hover:text-[#0984e3] transition-colors" style={{ fontFamily: FONT }}>
                      Info Verify
                    </h3>
                    <p className="text-sm leading-relaxed text-[#0a0a0a]/60">
                      Verifica e certifica qualsiasi contenuto informativo: comunicati stampa, report aziendali, white paper, post sui social. Trasforma ogni documento in un asset certificato con prova crittografica di integrità.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {["Aziende", "PR & Comms", "Istituzioni"].map(t => (
                      <span key={t} className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 bg-[#0a0a0a]/5 text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>{t}</span>
                    ))}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest group-hover:text-[#0984e3] transition-colors" style={{ color: "#0a0a0a", fontFamily: FONT }}>
                    Scopri Info Verify →
                  </div>
                </a>

                {/* Email Verify */}
                <a
                  href="/proofpress-verify/email"
                  className="group block p-8 border-2 border-[#0a0a0a]/10 bg-white hover:border-[#00b894] transition-all duration-200 hover:shadow-lg"
                >
                  <div className="mb-5">
                    <div className="w-12 h-12 flex items-center justify-center text-2xl mb-4" style={{ background: "#00b89412" }}>
                      ✉️
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#00b894", fontFamily: FONT }}>Estensione 03 · Email & Newsletter</div>
                    <h3 className="text-xl font-black text-[#0a0a0a] mb-3 group-hover:text-[#00b894] transition-colors" style={{ fontFamily: FONT }}>
                      Email Verify
                    </h3>
                    <p className="text-sm leading-relaxed text-[#0a0a0a]/60">
                      Certifica newsletter e comunicazioni email prima dell'invio. Ogni messaggio riceve un hash crittografico che prova che il contenuto non è stato alterato dopo la certificazione. Ideale per newsletter editoriali e comunicazioni istituzionali.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {["Newsletter", "Email Marketing", "Comunicazioni"].map(t => (
                      <span key={t} className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 bg-[#0a0a0a]/5 text-[#0a0a0a]/50" style={{ fontFamily: FONT }}>{t}</span>
                    ))}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest group-hover:text-[#00b894] transition-colors" style={{ color: "#0a0a0a", fontFamily: FONT }}>
                    Scopri Email Verify →
                  </div>
                </a>
              </div>
            </div>
          </section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              TRUST GRADE — SISTEMA DI GRADING
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="grading">
            <Label>Il sistema di grading</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-8" style={{ fontFamily: FONT }}>
              Da A a F.<br />La credibilità diventa un numero.
            </h2>
            <p className="text-base text-[#0a0a0a]/55 mb-10 max-w-2xl leading-relaxed">
              Il trust score (0–100) viene calcolato su 4 dimensioni, indipendentemente dal tipo di contenuto certificato. Il grade sintetizza il score in una lettera leggibile da chiunque.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
              {[
                { grade: "A", range: "90–100", color: "#22c55e", desc: "Eccellente corroborazione" },
                { grade: "B", range: "75–89", color: "#3b82f6", desc: "Buona corroborazione" },
                { grade: "C", range: "55–74", color: "#eab308", desc: "Corroborazione parziale" },
                { grade: "D", range: "40–54", color: "#f97316", desc: "Corroborazione debole" },
                { grade: "F", range: "0–39", color: "#ef4444", desc: "Non corroborato" },
              ].map(({ grade, range, color, desc }) => (
                <div key={grade} className="p-5 border-2 text-center" style={{ borderColor: `${color}44`, background: `${color}08` }}>
                  <div className="text-4xl font-black mb-1" style={{ color, fontFamily: FONT }}>{grade}</div>
                  <div className="text-xs font-mono text-[#0a0a0a]/50 mb-2">{range}</div>
                  <div className="text-xs text-[#0a0a0a]/60 leading-tight">{desc}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { dim: "Coerenza fattuale", pct: "40%", desc: "I claim sono supportati da fonti indipendenti classificate per credibilità." },
                { dim: "Qualità delle fonti", pct: "30%", desc: "Peso delle fonti usate per la corroborazione: agenzie primarie, database istituzionali, peer-reviewed." },
                { dim: "Assenza di bias", pct: "20%", desc: "Analisi del linguaggio e della struttura per identificare framing unilaterale o claim non verificabili." },
                { dim: "Freschezza dei dati", pct: "10%", desc: "Le fonti usate per la corroborazione sono aggiornate e pertinenti al periodo di riferimento del contenuto." },
              ].map(({ dim, pct, desc }) => (
                <div key={dim} className="p-5 border border-[#0a0a0a]/8">
                  <div className="text-2xl font-black mb-1" style={{ color: ORANGE, fontFamily: FONT }}>{pct}</div>
                  <div className="text-xs font-bold uppercase tracking-wide text-[#0a0a0a]/60 mb-2" style={{ fontFamily: FONT }}>{dim}</div>
                  <p className="text-xs leading-relaxed text-[#0a0a0a]/50">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              NON È AI — DIFFERENZIAZIONE
          ═══════════════════════════════════════════════════════════════════ */}
          <Section bg="#f8f8f6" id="non-ai">
            <Label>Cosa non è</Label>
            <h2 className="text-3xl md:text-4xl font-black leading-tight mb-12" style={{ fontFamily: FONT }}>
              Non è un fact-checker.<br />Non è un filtro editoriale.<br />Non è un'opinione.
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "✗",
                  color: "#ef4444",
                  title: "Non decide cosa è vero",
                  text: "ProofPress Verify™ non produce verdetti di verità. Documenta quante fonti indipendenti corroborano ogni claim e con quale credibilità. La valutazione finale rimane al lettore, all'investitore, al regolatore.",
                },
                {
                  icon: "✗",
                  color: "#ef4444",
                  title: "Non è un filtro editoriale",
                  text: "Il protocollo non decide cosa pubblicare o distribuire. Certifica quello che viene prodotto — e rende la certificazione verificabile da chiunque, in qualsiasi momento, senza intermediari.",
                },
                {
                  icon: "✓",
                  color: "#22c55e",
                  title: "È un protocollo di accountability",
                  text: "ProofPress Verify™ crea un layer di accountability crittografica su qualsiasi contenuto. Chi produce il contenuto è responsabile di quello che certifica. Chi lo riceve può verificare l'integrità in autonomia.",
                },
                {
                  icon: "✓",
                  color: "#22c55e",
                  title: "È indipendente da ProofPress",
                  text: "La verifica non richiede di fidarsi di ProofPress. Il CID IPFS è pubblico e verificabile su qualsiasi gateway IPFS. Il protocollo crittografico SHA-256 è uno standard aperto. L'indipendenza è strutturale.",
                },
              ].map(({ icon, color, title, text }) => (
                <div key={title} className="p-6 border border-[#0a0a0a]/8 bg-white flex gap-4">
                  <div className="text-xl font-black shrink-0 mt-0.5" style={{ color, fontFamily: FONT }}>{icon}</div>
                  <div>
                    <h3 className="font-black text-base mb-2 text-[#0a0a0a]" style={{ fontFamily: FONT }}>{title}</h3>
                    <p className="text-sm leading-relaxed text-[#0a0a0a]/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              FORM VERIFICA HASH
          ═══════════════════════════════════════════════════════════════════ */}
          <Section id="verifica">
            <Label>Verifica un certificato</Label>
            <VerifyHashForm formRef={verifyFormRef} />
          </Section>

          <Divider />

          {/* ═══════════════════════════════════════════════════════════════════
              CTA FINALE
          ═══════════════════════════════════════════════════════════════════ */}
          <section id="contact" className="py-24 md:py-32" style={{ background: "#f5f5f7" }}>
            <div className="max-w-5xl mx-auto px-5 md:px-8" ref={contactRef}>
              <div className="text-center mb-12">
                <Label>Inizia con ProofPress Verify™</Label>
                <h2
                  className="text-3xl md:text-5xl font-black leading-tight mb-6"
                  style={{ fontFamily: FONT, color: "#0a0a0a" }}
                >
                  La corroborazione verificabile<br />
                  non è un lusso.<br />
                  <span style={{ color: ORANGE }}>È il nuovo standard.</span>
                </h2>
                <p className="text-base mb-4 max-w-xl mx-auto" style={{ color: "#0a0a0a", opacity: 0.55 }}>
                  Scrivici per integrare ProofPress Verify™ nella tua organizzazione, per richiedere una demo personalizzata, o per esplorare partnership tecnologiche.
                </p>
              </div>
              <ContactForm origine="ProofPress Verify" />
            </div>
          </section>

          <div className="py-12 text-center" style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-sm text-white/30 italic max-w-2xl mx-auto px-5" style={{ fontFamily: FONT }}>
              "Non promettiamo verità. Forniamo evidenza. La differenza è tutto."
            </p>
          </div>
          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}
