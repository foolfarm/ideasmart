/**
 * Landing page: /fasteer-guida-legacy
 * ProofPress presenta "La Guida Definitiva alla Modernizzazione del Codice Legacy"
 * Stile: dark editorial ispirato a fasteer.ai/report
 * Funzione: bridge newsletter → fasteer.ai/report con redirect automatico dopo 8s
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";

const BANNER_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/fasteer_banner_ufficiale_guida.png";

const REPORT_URL =
  "https://fasteer.ai/report?utm_source=proofpress&utm_medium=landing&utm_campaign=fasteer_guida_legacy";

const STATS = [
  { value: "$2.41T", label: "costo annuo del debito tecnico negli USA" },
  { value: "79%", label: "dei progetti di modernizzazione fallisce gli obiettivi" },
  { value: "$67.9B", label: "mercato Legacy Modernization entro il 2031" },
  { value: "−87%", label: "riduzione dei costi di inferenza con FRIO™" },
];

const CHAPTERS = [
  {
    num: "01",
    title: "Il Debito Tecnico come Rischio Sistemico",
    text: "$2.41T/anno di tassa occulta che erode dal 10% al 20% dei budget IT e dal 23% al 42% della produttività dei team di sviluppo.",
  },
  {
    num: "02",
    title: "Un Mercato in Esplosione",
    text: "$24.98B nel 2025 → $67.91B entro il 2031. Le normative DORA e cybersecurity trasformano la modernizzazione da opzionale a obbligatoria.",
  },
  {
    num: "03",
    title: "Anatomia del Fallimento",
    text: "Il 79% manca gli obiettivi, il 74% non completa mai. $315K di sforamento medio per progetto. Le cause sono strutturali, non di budget.",
  },
  {
    num: "04",
    title: "L'Illusione del Fai-da-Te con gli LLM",
    text: "Cecità contestuale, allucinazioni a cascata, rischio IP. Il prompt è il 5% del lavoro — il restante 95% è orchestrazione, test, memoria e sicurezza.",
  },
  {
    num: "05",
    title: "L'Esplosione dei Costi LLM",
    text: "Nessuna economia di scala con prezzi API lineari a scala enterprise. Il costo reale esplode moltiplicato per le iterazioni effettive.",
  },
  {
    num: "06",
    title: "Perché Serve una Piattaforma Nativa",
    text: "Fasteer: la prima fabbrica agentica per la modernizzazione del codice. Analisi → Approvazione umana → Transcodifica → Validazione. Equivalenza funzionale garantita.",
  },
];

export default function FasteerGuidaLegacy() {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    document.title =
      "ProofPress presenta: La Guida Definitiva alla Modernizzazione del Codice Legacy — Fasteer";
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = REPORT_URL;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Top bar ProofPress */}
      <div className="border-b border-white/10 py-3 px-6 flex items-center justify-between">
        <Link href="/">
          <span className="text-[13px] font-bold tracking-[3px] text-white uppercase cursor-pointer hover:text-[#39ff14] transition-colors">
            PROOFPRESS
          </span>
        </Link>
        <span className="text-[11px] text-white/40 uppercase tracking-widest">
          SPECIAL REPORT
        </span>
      </div>

      {/* Hero section */}
      <section className="max-w-[960px] mx-auto px-6 pt-16 pb-12">
        <p className="text-[11px] tracking-[4px] text-[#39ff14] uppercase font-semibold mb-6">
          PROOFPRESS PRESENTA
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: testo */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight">
              La Guida Definitiva alla{" "}
              <span className="text-[#39ff14]">Modernizzazione del Codice Legacy.</span>
            </h1>
            <p className="text-[13px] text-white/50 uppercase tracking-widest mb-2">
              Fasteer Strategy Team · Executive Report · Maggio 2026
            </p>
            <div className="w-12 h-0.5 bg-[#39ff14] mb-6" />
            <p className="text-[16px] text-white/70 leading-relaxed mb-6">
              Perché la modernizzazione AI-driven è il nuovo imperativo strategico — e come evitare le trappole degli approcci fai-da-te. Analisi di mercato, valutazione del rischio, simulazione ROI.
            </p>
            <ul className="space-y-2 mb-8">
              {[
                "9 capitoli · 30+ pagine",
                "Analisi di mercato e dati",
                "Framework di valutazione del rischio",
                "Simulazione ROI motore FRIO™",
                "Download gratuito · IT e EN",
                "Nessuno spam · disiscrizione in qualsiasi momento",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[14px] text-white/60">
                  <span className="text-[#39ff14] text-[10px]">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA principale */}
            <a
              href={REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#39ff14] text-black text-[14px] font-bold px-7 py-3.5 rounded hover:bg-[#2de010] transition-colors"
            >
              Scarica gratis — IT / EN →
            </a>
            <p className="text-[11px] text-white/30 mt-3">
              Nessuno spam. Elaborato da Fasteer solo per questo download.
            </p>

            {/* Countdown redirect */}
            <div className="mt-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse" />
              <p className="text-[12px] text-white/40">
                Reindirizzamento automatico a fasteer.ai/report in{" "}
                <span className="text-[#39ff14] font-bold">{countdown}s</span>
              </p>
            </div>
          </div>

          {/* Right: banner ufficiale */}
          <div className="flex justify-center md:justify-end">
            <a href={REPORT_URL} target="_blank" rel="noopener noreferrer">
              <img
                src={BANNER_URL}
                alt="La Guida Definitiva alla Modernizzazione del Codice Legacy — Fasteer"
                className="w-full max-w-[380px] rounded-lg shadow-2xl hover:scale-[1.02] transition-transform duration-300"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Stat bar */}
      <section className="border-t border-b border-white/10 py-10 px-6">
        <div className="max-w-[960px] mx-auto">
          <p className="text-[10px] tracking-[4px] text-white/30 uppercase mb-8 text-center">
            KEY FINDINGS DAL REPORT
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-[#39ff14] mb-2">{s.value}</p>
                <p className="text-[12px] text-white/40 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cosa trovi dentro */}
      <section className="max-w-[960px] mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[4px] text-white/30 uppercase mb-2">INDICE</p>
        <h2 className="text-3xl font-black mb-10">
          Cosa trovi dentro.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CHAPTERS.map((ch, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-lg p-6 hover:border-[#39ff14]/30 transition-colors"
            >
              <p className="text-[11px] font-bold text-[#39ff14] tracking-widest mb-2">{ch.num}</p>
              <h3 className="text-[16px] font-bold text-white mb-2 leading-snug">{ch.title}</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">{ch.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA finale */}
      <section className="border-t border-white/10 py-16 px-6 text-center">
        <div className="max-w-[600px] mx-auto">
          <p className="text-[11px] tracking-[4px] text-white/30 uppercase mb-4">
            DOWNLOAD GRATUITO
          </p>
          <h2 className="text-3xl font-black mb-4">
            Scarica il report completo.
          </h2>
          <p className="text-[15px] text-white/50 mb-8">
            Disponibile in italiano e inglese. Richiede 30 secondi.
          </p>
          <a
            href={REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#39ff14] text-black text-[14px] font-bold px-8 py-4 rounded hover:bg-[#2de010] transition-colors"
          >
            Ottieni il report ora →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-[12px] font-bold tracking-[3px] text-white/60 uppercase cursor-pointer hover:text-white transition-colors">
                PROOFPRESS
              </span>
            </Link>
            <span className="text-white/20">·</span>
            <span className="text-[12px] font-bold tracking-[3px] text-white/60 uppercase">
              FASTEER
            </span>
          </div>
          <p className="text-[11px] text-white/30">
            © 2026 Fasteer — Milano · FoolFarm S.p.A.
          </p>
        </div>
      </footer>
    </div>
  );
}
