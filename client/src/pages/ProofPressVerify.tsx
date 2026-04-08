/**
 * PROOFPRESS VERIFY — Pagina dedicata con white paper e demo interattiva
 * 
 * Struttura:
 * 1. Hero con branding ProofPress
 * 2. Abstract
 * 3. Il Problema
 * 4. Obiettivo del protocollo
 * 5. Architettura del sistema
 * 6. Flusso operativo (8 step con diagramma)
 * 7. Modello di verifica
 * 8. Verification Report — struttura tecnica
 * 9. Certificazione crittografica
 * 10. Demo interattiva (verifica hash)
 * 11. Use Case
 * 12. Modello di integrazione
 * 13. Limitazioni (trasparenza)
 * 14. Visione
 * 15. Conclusione + CTA
 */
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import {
  ShieldCheck, ShieldX, Search, ExternalLink,
  Clock, Globe, Copy, CheckCheck, Info,
  Layers, Cpu, FileCheck, Lock, Eye,
  Building2, GraduationCap, Newspaper, Bot,
  ArrowRight, ChevronDown, Hash, Database,
  Network, Fingerprint, CheckCircle2, XCircle,
  AlertTriangle, Zap, Globe2, Code2
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const SFText = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const MONO = "JetBrains Mono, 'Courier New', monospace";

function formatDateIT(str: string | Date | null | undefined): string {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("it-IT", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return String(str); }
}

const SECTION_LABELS: Record<string, string> = {
  ai: "AI NEWS",
  startup: "STARTUP NEWS",
  research: "AI RESEARCH",
  dealroom: "AI DEALROOM",
};

// ── Sezione numerata del white paper ─────────────────────────────────────────
function WPSection({ number, title, children, id }: {
  number: string; title: string; children: React.ReactNode; id?: string;
}) {
  return (
    <section id={id} className="mb-14">
      <div className="flex items-baseline gap-3 mb-4">
        <span
          className="text-[11px] font-bold text-[#0d6e3f] tracking-widest"
          style={{ fontFamily: MONO }}
        >
          {number}
        </span>
        <h2
          className="text-2xl md:text-3xl font-black text-[#1a1a1a] leading-tight"
          style={{ fontFamily: SF }}
        >
          {title}
        </h2>
      </div>
      <div className="pl-0 md:pl-10">{children}</div>
    </section>
  );
}

// ── Paragrafo white paper ────────────────────────────────────────────────────
function WPText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[15px] text-[#1a1a1a]/70 leading-[1.8] mb-4"
      style={{ fontFamily: SFText }}
    >
      {children}
    </p>
  );
}

// ── Card flusso operativo ────────────────────────────────────────────────────
function FlowStep({ step, title, desc, icon: Icon }: {
  step: string; title: string; desc: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div className="relative group">
      <div className="border border-[#1a1a1a]/10 bg-white p-5 hover:border-[#0d6e3f]/40 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#0d6e3f]/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-[#0d6e3f]" strokeWidth={1.5} />
          </div>
          <span
            className="text-[10px] font-bold text-[#0d6e3f] tracking-widest"
            style={{ fontFamily: MONO }}
          >
            STEP {step}
          </span>
        </div>
        <h4
          className="text-[14px] font-bold text-[#1a1a1a] mb-1.5"
          style={{ fontFamily: SF }}
        >
          {title}
        </h4>
        <p
          className="text-[12px] text-[#1a1a1a]/55 leading-relaxed"
          style={{ fontFamily: SFText }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

// ── Use Case Card ────────────────────────────────────────────────────────────
function UseCaseCard({ icon: Icon, title, desc }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string; desc: string;
}) {
  return (
    <div className="border border-[#1a1a1a]/10 bg-white p-6 hover:border-[#0d6e3f]/30 transition-all">
      <Icon className="w-6 h-6 text-[#0d6e3f] mb-3" strokeWidth={1.5} />
      <h4
        className="text-[14px] font-bold text-[#1a1a1a] mb-2"
        style={{ fontFamily: SF }}
      >
        {title}
      </h4>
      <p
        className="text-[12px] text-[#1a1a1a]/55 leading-relaxed"
        style={{ fontFamily: SFText }}
      >
        {desc}
      </p>
    </div>
  );
}

// ── Risultato verifica (riuso dalla pagina Verify) ───────────────────────────
function VerifyResult({ article }: {
  article: {
    id: number;
    title: string;
    summary: string;
    sourceName: string | null;
    sourceUrl: string | null;
    section: string;
    publishedAt: string | Date | null;
    verifyHash: string | null;
  } | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!article) {
    return (
      <div className="border-2 border-[#dc2626]/30 bg-[#fef2f2] p-8 text-center">
        <ShieldX className="w-12 h-12 text-[#dc2626] mx-auto mb-4" strokeWidth={1.5} />
        <h3 className="text-xl font-black text-[#dc2626] mb-2" style={{ fontFamily: SF }}>
          Hash non trovato
        </h3>
        <p className="text-[14px] text-[#1a1a1a]/60 max-w-md mx-auto leading-relaxed" style={{ fontFamily: SFText }}>
          Nessun articolo corrisponde a questo hash nel database IDEASMART.
          L'articolo potrebbe non essere stato pubblicato su questa piattaforma,
          oppure l'hash potrebbe essere errato o alterato.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#dc2626]/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#dc2626]" style={{ fontFamily: SFText }}>
            Verifica fallita
          </span>
        </div>
      </div>
    );
  }

  const sectionLabel = SECTION_LABELS[article.section] ?? article.section.toUpperCase();
  const handleCopy = () => {
    if (article.verifyHash) {
      navigator.clipboard.writeText(article.verifyHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-2 border-[#0d6e3f]/30 overflow-hidden">
      <div className="bg-[#0d6e3f] px-6 py-4 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-white flex-shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70" style={{ fontFamily: SFText }}>
            Articolo verificato
          </p>
          <p className="text-[15px] font-black text-white" style={{ fontFamily: SF }}>
            Contenuto autentico — certificato da ProofPress Verify
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white" style={{ fontFamily: SFText }}>
            Verifica OK
          </span>
        </div>
      </div>

      <div className="p-6 bg-[#f5f2ec]">
        <div className="mb-4">
          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 bg-[#1a1a1a] text-white" style={{ fontFamily: SFText }}>
            {sectionLabel}
          </span>
        </div>
        <h3 className="text-2xl font-black text-[#1a1a1a] leading-snug mb-3" style={{ fontFamily: SF }}>
          {article.title}
        </h3>
        <p className="text-[15px] text-[#1a1a1a]/65 leading-relaxed mb-5" style={{ fontFamily: SFText, lineHeight: 1.7 }}>
          {article.summary}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="flex items-start gap-2.5 p-3 border border-[#1a1a1a]/10 bg-white">
            <Globe className="w-4 h-4 text-[#1a1a1a]/40 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-0.5" style={{ fontFamily: SFText }}>Fonte originale</p>
              <p className="text-[13px] font-semibold text-[#1a1a1a]" style={{ fontFamily: SFText }}>{article.sourceName}</p>
              {article.sourceUrl && (
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-[#0066cc] hover:underline mt-0.5" style={{ fontFamily: SFText }}>
                  Visita fonte <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 border border-[#1a1a1a]/10 bg-white">
            <Clock className="w-4 h-4 text-[#1a1a1a]/40 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#1a1a1a]/40 mb-0.5" style={{ fontFamily: SFText }}>Data pubblicazione</p>
              <p className="text-[13px] font-semibold text-[#1a1a1a]" style={{ fontFamily: SFText }}>{formatDateIT(article.publishedAt)}</p>
            </div>
          </div>
        </div>

        <div className="border border-[#1a1a1a]/15 p-4 bg-white">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40 mb-2" style={{ fontFamily: SFText }}>
            Hash ProofPress Verify (SHA-256)
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] text-[#1a1a1a]/70 break-all leading-relaxed" style={{ fontFamily: MONO }}>
              {article.verifyHash}
            </code>
            <button onClick={handleCopy} className="flex-shrink-0 p-1.5 hover:bg-[#f5f2ec] transition-colors rounded" title="Copia hash">
              {copied ? <CheckCheck className="w-4 h-4 text-[#0d6e3f]" /> : <Copy className="w-4 h-4 text-[#1a1a1a]/40" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGINA PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function ProofPressVerify() {
  const [location] = useLocation();
  const [inputHash, setInputHash] = useState("");
  const [searchHash, setSearchHash] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get("hash");
    if (hashParam) {
      setInputHash(hashParam);
      setSearchHash(hashParam);
      // Scroll alla demo
      setTimeout(() => {
        document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location]);

  const { data: article, isLoading, isFetching } = trpc.news.lookupByHash.useQuery(
    { hash: searchHash! },
    { enabled: !!searchHash && searchHash.length >= 8 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputHash.trim();
    if (trimmed.length < 8) return;
    setSearchHash(trimmed);
    const url = new URL(window.location.href);
    url.searchParams.set("hash", trimmed);
    window.history.pushState({}, "", url.toString());
  };

  const isSearching = isLoading || isFetching;

  const tocItems = [
    { id: "abstract", label: "Abstract" },
    { id: "problema", label: "Il Problema" },
    { id: "obiettivo", label: "Obiettivo" },
    { id: "architettura", label: "Architettura" },
    { id: "flusso", label: "Flusso Operativo" },
    { id: "modello", label: "Modello di Verifica" },
    { id: "report", label: "Verification Report" },
    { id: "certificazione", label: "Certificazione" },
    { id: "demo", label: "Demo Interattiva" },
    { id: "usecase", label: "Use Case" },
    { id: "integrazione", label: "Integrazione" },
    { id: "limitazioni", label: "Limitazioni" },
    { id: "visione", label: "Visione" },
    { id: "conclusione", label: "Conclusione" },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#faf8f3", color: "#1a1a1a" }}>
      <LeftSidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <SharedPageHeader />

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a1628 0%, #0d2137 50%, #0f2d45 100%)" }}>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

          <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#0d6e3f]/40 bg-[#0d6e3f]/10 mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4ade80]" style={{ fontFamily: SFText }}>
                White Paper
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] mb-4" style={{ fontFamily: SF }}>
              ProofPress<br />
              <span className="text-[#4ade80]">Verify</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] md:text-[16px] text-white/50 max-w-2xl mx-auto leading-relaxed mb-8" style={{ fontFamily: SFText }}>
              Protocollo di Validazione e Certificazione Agentica dell'Informazione
            </p>

            {/* Key metrics */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8">
              {[
                { label: "Fonti verificate", value: "3+" },
                { label: "Hash crittografico", value: "SHA-256" },
                { label: "Notarizzazione", value: "Ethereum" },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: MONO }}>{m.value}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1" style={{ fontFamily: SFText }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d6e3f] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#0d6e3f]/90 transition-colors"
                style={{ fontFamily: SFText }}
              >
                Prova la demo <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowToc(!showToc)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white/70 text-[12px] font-bold uppercase tracking-widest hover:border-white/40 hover:text-white transition-colors"
                style={{ fontFamily: SFText }}
              >
                Indice <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showToc ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* TOC dropdown */}
            {showToc && (
              <div className="mt-6 max-w-md mx-auto border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-left">
                {tocItems.map((item, i) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setShowToc(false)}
                    className="flex items-center gap-3 py-1.5 text-[12px] text-white/60 hover:text-[#4ade80] transition-colors"
                    style={{ fontFamily: SFText }}
                  >
                    <span className="text-[10px] text-white/30 w-5 text-right" style={{ fontFamily: MONO }}>{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══ CONTENUTO WHITE PAPER ═══════════════════════════════════════ */}
        <main className="max-w-3xl mx-auto px-4 py-12 md:py-16">

          {/* ── 1. Abstract ──────────────────────────────────────────────── */}
          <WPSection number="01" title="Abstract" id="abstract">
            <WPText>
              ProofPress Verify è un protocollo di validazione delle notizie basato su un sistema agentico di intelligenza artificiale che confronta ogni contenuto con almeno tre fonti indipendenti per valutarne la veridicità.
            </WPText>
            <WPText>
              Il risultato della verifica viene formalizzato in un <strong>Verification Report</strong> strutturato e successivamente sigillato tramite un hash crittografico registrato su Ethereum, garantendo immutabilità, tracciabilità e verificabilità nel tempo.
            </WPText>
            <div className="border-l-4 border-[#0d6e3f] pl-5 py-3 bg-[#0d6e3f]/5 my-6">
              <p className="text-[15px] font-semibold text-[#1a1a1a]/80 italic leading-relaxed" style={{ fontFamily: SFText }}>
                La verità dell'informazione diventa computabile, certificabile e verificabile pubblicamente.
              </p>
            </div>
          </WPSection>

          {/* ── 2. Il Problema ───────────────────────────────────────────── */}
          <WPSection number="02" title="Il Problema" id="problema">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                {
                  icon: Zap,
                  title: "Sovrapproduzione",
                  desc: "L'AI generativa ha abbattuto le barriere di produzione, causando un aumento esponenziale di contenuti non verificati."
                },
                {
                  icon: AlertTriangle,
                  title: "Assenza di standard",
                  desc: "Non esiste un sistema oggettivo, scalabile e automatizzato per valutare la qualità delle notizie."
                },
                {
                  icon: XCircle,
                  title: "Erosione della fiducia",
                  desc: "Fake news, manipolazione narrativa e bias sistemici. L'utente non ha strumenti per distinguere contenuti affidabili."
                },
              ].map((item) => (
                <div key={item.title} className="border border-[#dc2626]/20 bg-[#fef2f2] p-5">
                  <item.icon className="w-5 h-5 text-[#dc2626] mb-3" strokeWidth={1.5} />
                  <h4 className="text-[13px] font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: SF }}>{item.title}</h4>
                  <p className="text-[12px] text-[#1a1a1a]/55 leading-relaxed" style={{ fontFamily: SFText }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </WPSection>

          {/* ── 3. Obiettivo ─────────────────────────────────────────────── */}
          <WPSection number="03" title="Obiettivo del Protocollo" id="obiettivo">
            <WPText>
              ProofPress Verify persegue tre obiettivi chiave:
            </WPText>
            <div className="space-y-3 mb-4">
              {[
                { n: "01", text: "Rendere la verità misurabile", desc: "Attraverso un sistema di scoring basato sulla convergenza multi-fonte" },
                { n: "02", text: "Rendere la verifica trasparente", desc: "Con report strutturati accessibili pubblicamente" },
                { n: "03", text: "Rendere il risultato immutabile", desc: "Tramite hash crittografico e notarizzazione su blockchain" },
              ].map((obj) => (
                <div key={obj.n} className="flex items-start gap-4 p-4 border border-[#1a1a1a]/8 bg-white">
                  <span className="text-[20px] font-black text-[#0d6e3f]/20" style={{ fontFamily: MONO }}>{obj.n}</span>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a1a1a]" style={{ fontFamily: SF }}>{obj.text}</p>
                    <p className="text-[12px] text-[#1a1a1a]/50 mt-0.5" style={{ fontFamily: SFText }}>{obj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </WPSection>

          {/* ── 4. Architettura ──────────────────────────────────────────── */}
          <WPSection number="04" title="Architettura del Sistema" id="architettura">
            <WPText>
              Il sistema è composto da due layer principali che operano in sequenza per garantire sia l'analisi intelligente che la certificazione immutabile dei contenuti.
            </WPText>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-[#0d6e3f]/20 bg-[#0d6e3f]/5 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-5 h-5 text-[#0d6e3f]" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d6e3f]" style={{ fontFamily: SFText }}>
                    Layer 1
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: SF }}>
                  Agentic Verification Layer
                </h4>
                <p className="text-[12px] text-[#1a1a1a]/55 leading-relaxed" style={{ fontFamily: SFText }}>
                  Sistema multi-agente AI che analizza contenuti, estrae fatti, confronta fonti e valuta coerenza. Opera in modo autonomo e scalabile.
                </p>
              </div>
              <div className="border border-[#1a1a1a]/15 bg-[#1a1a1a] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-[#4ade80]" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4ade80]" style={{ fontFamily: SFText }}>
                    Layer 2
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-white mb-2" style={{ fontFamily: SF }}>
                  Certification Layer
                </h4>
                <p className="text-[12px] text-white/55 leading-relaxed" style={{ fontFamily: SFText }}>
                  Sistema che genera il report strutturato, crea l'hash crittografico SHA-256 e registra la proof su Ethereum per garantire immutabilità.
                </p>
              </div>
            </div>
          </WPSection>

          {/* ── 5. Flusso Operativo ──────────────────────────────────────── */}
          <WPSection number="05" title="Flusso Operativo" id="flusso">
            <WPText>
              Il protocollo opera in 8 step sequenziali, dall'ingestione della notizia alla verifica pubblica dell'hash.
            </WPText>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <FlowStep step="01" title="Ingestione" desc="La notizia entra nel sistema. Parsing del contenuto e generazione ID univoco." icon={Database} />
              <FlowStep step="02" title="Fact Extraction" desc="Estrazione entità, identificazione affermazioni verificabili, costruzione fact map." icon={Search} />
              <FlowStep step="03" title="Source Discovery" desc="Selezione di almeno 3 fonti indipendenti: media affidabili, database verificati, fonti pubbliche." icon={Globe2} />
              <FlowStep step="04" title="Cross-Source Validation" desc="Ogni affermazione viene confrontata: match → conferma, mismatch → contraddizione, null → assenza." icon={Network} />
              <FlowStep step="05" title="Decision Engine" desc="Basato su convergenza: alta convergenza → Verified, bassa convergenza → Not Verified." icon={Cpu} />
              <FlowStep step="06" title="Verification Report" desc="Generazione report strutturato: content_id, timestamp, fonti, esito, sintesi." icon={FileCheck} />
              <FlowStep step="07" title="Hashing e Notarizzazione" desc="Report serializzato, hashato (SHA-256) e registrato su Ethereum. Produce una proof immutabile." icon={Fingerprint} />
              <FlowStep step="08" title="Verifica Pubblica" desc="Accesso via endpoint /proofpress-verify. L'utente può inserire l'hash e verificare l'autenticità." icon={Eye} />
            </div>
          </WPSection>

          {/* ── 6. Modello di Verifica ───────────────────────────────────── */}
          <WPSection number="06" title="Modello di Verifica" id="modello">
            <WPText>
              Il protocollo si basa sul <strong>Principio di Convergenza Informativa</strong>: una notizia è considerata affidabile se più fonti indipendenti convergono e non emergono contraddizioni significative.
            </WPText>
            <div className="border border-[#1a1a1a]/10 bg-white p-6 my-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 border border-[#0d6e3f]/30 bg-[#0d6e3f]/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#0d6e3f]" style={{ fontFamily: MONO }}>S{i}</span>
                    </div>
                  ))}
                </div>
                <ArrowRight className="w-4 h-4 text-[#1a1a1a]/30" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0d6e3f]" />
                  <span className="text-[12px] font-bold text-[#0d6e3f]" style={{ fontFamily: SF }}>Convergenza → Verified</span>
                </div>
              </div>
              <p className="text-[12px] text-[#1a1a1a]/50 leading-relaxed" style={{ fontFamily: SFText }}>
                S1, S2, S3 = fonti indipendenti. Se almeno 2 su 3 convergono senza contraddizioni significative, il contenuto riceve lo status "Verified".
              </p>
            </div>
          </WPSection>

          {/* ── 7. Verification Report ───────────────────────────────────── */}
          <WPSection number="07" title="Verification Report" id="report">
            <WPText>
              Ogni verifica produce un report strutturato con i seguenti campi:
            </WPText>
            <div className="border border-[#1a1a1a]/15 bg-[#1a1a1a] p-5 my-4 overflow-x-auto">
              <pre className="text-[12px] text-[#4ade80] leading-relaxed" style={{ fontFamily: MONO }}>
{`{
  content_id:          string,
  timestamp:           datetime,
  sources:             [array],
  verification_status: boolean,
  summary:             string,
  engine_version:      string
}`}
              </pre>
            </div>
            <WPText>
              Il report contiene l'identificativo univoco del contenuto, il timestamp della verifica, l'elenco delle fonti consultate, l'esito della verifica, una sintesi dell'analisi e la versione del motore di verifica utilizzato.
            </WPText>
          </WPSection>

          {/* ── 8. Certificazione Crittografica ──────────────────────────── */}
          <WPSection number="08" title="Certificazione Crittografica" id="certificazione">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                {
                  icon: Hash,
                  title: "Hash Univoco",
                  desc: "Il report genera un hash SHA-256 univoco. Qualsiasi modifica al contenuto produce un hash completamente diverso."
                },
                {
                  icon: Lock,
                  title: "Immutabilità",
                  desc: "Una volta generato, l'hash non può essere alterato. Qualsiasi tentativo di modifica è immediatamente rilevabile."
                },
                {
                  icon: Layers,
                  title: "Notarizzazione",
                  desc: "Registrazione su Ethereum per decentralizzazione, indipendenza e permanenza. Modello trustless."
                },
              ].map((item) => (
                <div key={item.title} className="border border-[#1a1a1a]/10 bg-white p-5">
                  <item.icon className="w-5 h-5 text-[#0d6e3f] mb-3" strokeWidth={1.5} />
                  <h4 className="text-[13px] font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: SF }}>{item.title}</h4>
                  <p className="text-[12px] text-[#1a1a1a]/55 leading-relaxed" style={{ fontFamily: SFText }}>{item.desc}</p>
                </div>
              ))}
            </div>
            <WPText>
              Il sistema consente la verifica indipendente dell'hash, il confronto con il report originale e un audit pubblico completo. Un modello <strong>trustless</strong> dove la fiducia è garantita dalla matematica, non dall'autorità.
            </WPText>
          </WPSection>

          {/* ══ 9. DEMO INTERATTIVA ═══════════════════════════════════════ */}
          <WPSection number="09" title="Demo Interattiva" id="demo">
            <WPText>
              Prova il protocollo ProofPress Verify in tempo reale. Incolla l'hash SHA-256 di un articolo pubblicato su IDEASMART per verificarne l'autenticità.
            </WPText>

            <div className="border-2 border-[#0d6e3f] p-6 bg-white my-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#0d6e3f]" strokeWidth={1.5} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d6e3f]" style={{ fontFamily: SFText }}>
                  Verifica un articolo
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-0 border-2 border-[#1a1a1a] overflow-hidden">
                  <div className="flex items-center pl-4 text-[#1a1a1a]/30">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={inputHash}
                    onChange={(e) => setInputHash(e.target.value)}
                    placeholder="Incolla l'hash ProofPress Verify (es. a3f9c2d1...)"
                    className="flex-1 px-3 py-3.5 text-[13px] bg-white outline-none text-[#1a1a1a] placeholder-[#1a1a1a]/30"
                    style={{ fontFamily: MONO }}
                  />
                  <button
                    type="submit"
                    disabled={inputHash.trim().length < 8 || isSearching}
                    className="px-5 py-3.5 bg-[#0d6e3f] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0d6e3f]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ fontFamily: SFText }}
                  >
                    {isSearching ? "Verifica..." : "Verifica"}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-[#1a1a1a]/35 uppercase tracking-widest" style={{ fontFamily: SFText }}>
                  L'hash è visibile sotto ogni articolo come "ProofPress Verify #XXXXXXXX"
                </p>
              </form>

              {isSearching && (
                <div className="border border-[#1a1a1a]/10 p-8 text-center bg-[#f5f2ec]">
                  <div className="w-6 h-6 border-2 border-[#1a1a1a]/20 border-t-[#0d6e3f] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[12px] text-[#1a1a1a]/40 uppercase tracking-widest" style={{ fontFamily: SFText }}>
                    Ricerca nel database...
                  </p>
                </div>
              )}

              {!isSearching && searchHash && (
                <VerifyResult article={article ?? null} />
              )}
            </div>
          </WPSection>

          {/* ── 10. Use Case ─────────────────────────────────────────────── */}
          <WPSection number="10" title="Use Case" id="usecase">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <UseCaseCard
                icon={Newspaper}
                title="Media"
                desc="Certificazione dei contenuti editoriali. Ogni articolo pubblicato riceve un sigillo di autenticità verificabile da lettori e partner."
              />
              <UseCaseCard
                icon={Bot}
                title="AI Publishing"
                desc="Controllo qualità automatico per contenuti generati da AI. Validazione multi-fonte prima della pubblicazione."
              />
              <UseCaseCard
                icon={Building2}
                title="Corporate"
                desc="Validazione di comunicati stampa, report finanziari e documenti aziendali. Compliance e trasparenza certificata."
              />
              <UseCaseCard
                icon={GraduationCap}
                title="Education"
                desc="Contenuti didattici verificati. Garanzia di accuratezza per materiali formativi e risorse accademiche."
              />
            </div>
          </WPSection>

          {/* ── 11. Modello di Integrazione ──────────────────────────────── */}
          <WPSection number="11" title="Modello di Integrazione" id="integrazione">
            <WPText>
              ProofPress Verify è progettato per essere integrato in qualsiasi piattaforma editoriale o sistema di gestione dei contenuti.
            </WPText>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { icon: Code2, label: "API", desc: "RESTful API per integrazione diretta" },
                { icon: Globe, label: "SaaS", desc: "Piattaforma cloud gestita" },
                { icon: Layers, label: "White-label", desc: "Personalizzazione completa del brand" },
                { icon: Cpu, label: "Embedded", desc: "Widget integrabile in qualsiasi sito" },
              ].map((item) => (
                <div key={item.label} className="border border-[#1a1a1a]/10 bg-white p-4 text-center">
                  <item.icon className="w-5 h-5 text-[#0d6e3f] mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[12px] font-bold text-[#1a1a1a] mb-1" style={{ fontFamily: SF }}>{item.label}</p>
                  <p className="text-[10px] text-[#1a1a1a]/45" style={{ fontFamily: SFText }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </WPSection>

          {/* ── 12. Limitazioni ──────────────────────────────────────────── */}
          <WPSection number="12" title="Limitazioni" id="limitazioni">
            <WPText>
              Per credibilità e trasparenza, è fondamentale riconoscere i limiti attuali del protocollo:
            </WPText>
            <div className="border border-[#f59e0b]/20 bg-[#fffbeb] p-5 my-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="space-y-2">
                  <p className="text-[13px] text-[#1a1a1a]/70 leading-relaxed" style={{ fontFamily: SFText }}>
                    <strong>Dipendenza dalla qualità delle fonti:</strong> la verifica è tanto affidabile quanto le fonti disponibili.
                  </p>
                  <p className="text-[13px] text-[#1a1a1a]/70 leading-relaxed" style={{ fontFamily: SFText }}>
                    <strong>Eventi breaking:</strong> notizie in tempo reale potrebbero non avere fonti sufficienti per una verifica immediata.
                  </p>
                  <p className="text-[13px] text-[#1a1a1a]/70 leading-relaxed" style={{ fontFamily: SFText }}>
                    <strong>Bias sistemici:</strong> possibili distorsioni nelle fonti di riferimento.
                  </p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]/80 mt-3 italic" style={{ fontFamily: SFText }}>
                    ProofPress Verify misura affidabilità, non verità assoluta.
                  </p>
                </div>
              </div>
            </div>
          </WPSection>

          {/* ── 13. Visione ──────────────────────────────────────────────── */}
          <WPSection number="13" title="Visione" id="visione">
            <WPText>
              ProofPress Verify introduce uno standard globale di certificazione dell'informazione.
            </WPText>
            <div className="border-l-4 border-[#0d6e3f] pl-5 py-3 bg-[#0d6e3f]/5 my-6">
              <p className="text-[17px] font-bold text-[#1a1a1a]/80 leading-relaxed" style={{ fontFamily: SF }}>
                Come HTTPS ha reso sicuro il web,<br />
                ProofPress Verify può rendere affidabile l'informazione digitale.
              </p>
            </div>
          </WPSection>

          {/* ── 14. Conclusione ──────────────────────────────────────────── */}
          <WPSection number="14" title="Conclusione" id="conclusione">
            <WPText>
              ProofPress Verify non si limita a verificare le notizie. Certifica il processo di verifica. E lo rende trasparente, verificabile e immutabile.
            </WPText>

            {/* Chiusura forte */}
            <div className="border-2 border-[#1a1a1a] bg-[#1a1a1a] p-8 text-center my-8">
              <p className="text-2xl md:text-3xl font-black text-white leading-tight mb-3" style={{ fontFamily: SF }}>
                La fiducia non è più un'opinione.
              </p>
              <p className="text-2xl md:text-3xl font-black text-[#4ade80] leading-tight" style={{ fontFamily: SF }}>
                È una proof.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d6e3f] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#0d6e3f]/90 transition-colors"
                  style={{ fontFamily: SFText }}
                >
                  Prova la demo <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <Link href="/">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white/70 text-[12px] font-bold uppercase tracking-widest hover:border-white/40 hover:text-white transition-colors cursor-pointer"
                    style={{ fontFamily: SFText }}
                  >
                    Torna a IDEASMART
                  </span>
                </Link>
              </div>
            </div>
          </WPSection>

        </main>

        <SharedPageFooter />
      </div>
    </div>
  );
}
