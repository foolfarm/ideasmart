/**
 * Pagina /piattaforma — Landing page dedicata alla tecnologia agentica ProofPress
 * Design coerente con il resto del sito (font SF Pro, colori #1a1a1a + arancione #e74c3c)
 */

import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";

// ─── Sezione: Come funziona ──────────────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    title: "Monitoraggio 4.000+ fonti",
    description:
      "L'agente ProofPress analizza in tempo reale oltre 4.000 fonti certificate — RSS, API, database istituzionali, paper accademici — filtrando il rumore e selezionando solo i segnali rilevanti.",
  },
  {
    number: "02",
    title: "Verifica multi-fonte",
    description:
      "Ogni contenuto viene confrontato con almeno 3 fonti indipendenti. L'AI misura coerenza fattuale, obiettività e affidabilità della fonte, producendo un Verification Score da 0 a 100.",
  },
  {
    number: "03",
    title: "Certificazione crittografica",
    description:
      "Il Verification Report viene sigillato con un hash SHA-256 immutabile. Ogni articolo riceve un badge PP-[hash] univoco, verificabile pubblicamente su proofpress.ai/proofpress-verify.",
  },
  {
    number: "04",
    title: "Distribuzione certificata",
    description:
      "I contenuti certificati vengono distribuiti su ProofPress Magazine, newsletter, LinkedIn e canali partner — con firma digitale e tracciabilità completa della catena di verifica.",
  },
];

// ─── Sezione: Tecnologie core ────────────────────────────────────────────────
const TECH = [
  {
    icon: "⚡",
    title: "Agentic AI Engine",
    description:
      "Pipeline multi-agente che opera 24/7 con orchestrazione autonoma delle fasi di scraping, analisi, verifica e pubblicazione.",
  },
  {
    icon: "🔐",
    title: "ProofPress Verify",
    description:
      "Protocollo crittografico ispirato alla notarizzazione Web3. Ogni hash è immutabile, pubblicamente verificabile e timestampato.",
  },
  {
    icon: "🧠",
    title: "LLM Multi-Modello",
    description:
      "Architettura a modelli multipli specializzati per dominio (AI, Startup, Venture Capital, Research) con validazione incrociata.",
  },
  {
    icon: "📡",
    title: "RSS Intelligence",
    description:
      "Aggregazione e classificazione automatica da 4.000+ fonti con scoring di rilevanza, deduplicazione semantica e prioritizzazione.",
  },
  {
    icon: "📊",
    title: "Research Generator",
    description:
      "Generazione automatica di report di ricerca strutturati con key findings, fonti citate e dati verificabili da database istituzionali.",
  },
  {
    icon: "🔗",
    title: "API & Integrazioni",
    description:
      "Endpoint REST per integrare il flusso di contenuti certificati ProofPress in CMS, newsletter, app e piattaforme editoriali terze.",
  },
];

// ─── Sezione: Use case ───────────────────────────────────────────────────────
const USE_CASES = [
  {
    target: "Testate & Editori",
    icon: "🗞️",
    description:
      "Redazione AI autonoma che produce e certifica contenuti 24/7. Integrazione diretta nel CMS con badge di verifica visibile ai lettori.",
    cta: "Scopri il piano Editore →",
    href: "/offerta/editori",
  },
  {
    target: "Creator & Giornalisti",
    icon: "✍️",
    description:
      "Pubblica contenuti certificati ProofPress Verify e distribuiscili a 100k+ lettori. Monetizza la tua audience con newsletter AI-powered.",
    cta: "Scopri il piano Creator →",
    href: "/offerta/creator",
  },
  {
    target: "Aziende & Corporate",
    icon: "🏢",
    description:
      "Intelligence certificata per decisioni più rapide e sicure. Newsroom interno branded, report IR e competitor, content marketing affidabile.",
    cta: "Scopri il piano Azienda →",
    href: "/offerta/aziende",
  },
];

// ─── Componente principale ───────────────────────────────────────────────────
export default function Piattaforma() {
  const fontSans =
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
  const fontDisplay =
    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div
      className="min-h-screen"
      style={{ background: "#f5f5f7", fontFamily: fontSans }}
    >
      <SharedPageHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-4"
        style={{ borderBottom: "2px solid #1a1a1a" }}
      >
        <div className="max-w-[900px] mx-auto">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: "#1a1a1a", opacity: 0.4, fontFamily: fontSans }}
          >
            Piattaforma · Tecnologia
          </p>
          <h1
            className="leading-tight mb-6"
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 900,
              color: "#1a1a1a",
              lineHeight: 1.05,
            }}
          >
            La prima piattaforma
            <br />
            di AI Journalism
            <br />
            <span style={{ color: "#e74c3c" }}>Certificato.</span>
          </h1>
          <p
            className="text-[18px] leading-relaxed mb-8 max-w-[640px]"
            style={{ color: "#1a1a1a", opacity: 0.7, fontFamily: fontSans }}
          >
            ProofPress è un sistema agentico che analizza, verifica e certifica
            contenuti editoriali in tempo reale — combinando AI multi-modello,
            confronto multi-fonte e certificazione crittografica immutabile.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://proofpress.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[13px] uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{
                background: "#1a1a1a",
                color: "#fff",
                fontFamily: fontSans,
              }}
            >
              Demo Live ↗
            </a>
            <Link href="/proofpress-verify">
              <span
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[13px] uppercase tracking-wider cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  background: "transparent",
                  color: "#1a1a1a",
                  border: "2px solid #1a1a1a",
                  fontFamily: fontSans,
                }}
              >
                ProofPress Verify →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COME FUNZIONA ────────────────────────────────────────────────── */}
      <section className="py-14 px-4" style={{ background: "#fff" }}>
        <div className="max-w-[900px] mx-auto">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: "#e74c3c", fontFamily: fontSans }}
          >
            Come funziona
          </p>
          <h2
            className="text-[28px] font-black mb-10"
            style={{ fontFamily: fontDisplay, color: "#1a1a1a" }}
          >
            Il flusso agentico in 4 fasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-5">
                <div
                  className="flex-shrink-0 text-[32px] font-black leading-none"
                  style={{ color: "#e74c3c", fontFamily: fontDisplay }}
                >
                  {step.number}
                </div>
                <div>
                  <h3
                    className="text-[16px] font-bold mb-2"
                    style={{ fontFamily: fontDisplay, color: "#1a1a1a" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-[14px] leading-relaxed"
                    style={{ color: "#1a1a1a", opacity: 0.65, fontFamily: fontSans }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECNOLOGIE CORE ──────────────────────────────────────────────── */}
      <section
        className="py-14 px-4"
        style={{ background: "#f5f5f7", borderTop: "1px solid rgba(26,26,26,0.12)" }}
      >
        <div className="max-w-[900px] mx-auto">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: "#e74c3c", fontFamily: fontSans }}
          >
            Architettura
          </p>
          <h2
            className="text-[28px] font-black mb-10"
            style={{ fontFamily: fontDisplay, color: "#1a1a1a" }}
          >
            Tecnologie core
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH.map((t) => (
              <div
                key={t.title}
                className="p-5 rounded-lg"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(26,26,26,0.10)",
                }}
              >
                <div className="text-[28px] mb-3">{t.icon}</div>
                <h3
                  className="text-[14px] font-bold mb-2"
                  style={{ fontFamily: fontDisplay, color: "#1a1a1a" }}
                >
                  {t.title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "#1a1a1a", opacity: 0.6, fontFamily: fontSans }}
                >
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASE ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-4" style={{ background: "#1a1a1a" }}>
        <div className="max-w-[900px] mx-auto">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: "#e74c3c", fontFamily: fontSans }}
          >
            Per chi è pensata
          </p>
          <h2
            className="text-[28px] font-black mb-10"
            style={{ fontFamily: fontDisplay, color: "#fff" }}
          >
            Tre modelli d'uso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {USE_CASES.map((uc) => (
              <div
                key={uc.target}
                className="p-6 rounded-lg flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="text-[32px] mb-3">{uc.icon}</div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                  style={{ color: "#e74c3c", fontFamily: fontSans }}
                >
                  {uc.target}
                </p>
                <p
                  className="text-[14px] leading-relaxed mb-4 flex-1"
                  style={{ color: "rgba(255,255,255,0.7)", fontFamily: fontSans }}
                >
                  {uc.description}
                </p>
                <Link href={uc.href}>
                  <span
                    className="text-[12px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: "#e74c3c", fontFamily: fontSans }}
                  >
                    {uc.cta}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ───────────────────────────────────────────────────── */}
      <section
        className="py-14 px-4 text-center"
        style={{ background: "#fff", borderTop: "2px solid #1a1a1a" }}
      >
        <div className="max-w-[600px] mx-auto">
          <h2
            className="text-[28px] font-black mb-4"
            style={{ fontFamily: fontDisplay, color: "#1a1a1a" }}
          >
            Vuoi integrare ProofPress nella tua organizzazione?
          </h2>
          <p
            className="text-[15px] leading-relaxed mb-8"
            style={{ color: "#1a1a1a", opacity: 0.65, fontFamily: fontSans }}
          >
            Contattaci per una demo personalizzata o scrivi a{" "}
            <a
              href="mailto:info@proofpress.ai"
              style={{ color: "#e74c3c", textDecoration: "underline" }}
            >
              info@proofpress.ai
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://ideasmart.technology"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[13px] uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{
                background: "#e74c3c",
                color: "#fff",
                fontFamily: fontSans,
              }}
            >
              Prova la Demo ↗
            </a>
            <Link href="/contatti">
              <span
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[13px] uppercase tracking-wider cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  background: "transparent",
                  color: "#1a1a1a",
                  border: "2px solid #1a1a1a",
                  fontFamily: fontSans,
                }}
              >
                Contattaci →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
