/**
 * Landing page: /fasteer-guida-legacy
 * Promuove "La Guida Definitiva al Codice Legacy" di Fasteer
 * Funziona da bridge tra newsletter ProofPress e fasteer.ai/report
 */

import { useEffect } from "react";
import { Link } from "wouter";

const BANNER_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/fasteer_guida_definitiva_banner-Vn45h2fx6kUeqj85uQPZwt.png";

const REPORT_URL =
  "https://fasteer.ai/report?utm_source=proofpress&utm_medium=landing&utm_campaign=fasteer_guida_legacy";

const FINDINGS = [
  {
    label: "IL COSTO NASCOSTO",
    text: "Mantenere sistemi legacy scritti in COBOL, RPG o vecchie versioni di Java significa operare con un freno a mano tirato. La riscrittura manuale tramite System Integrator richiede 3–5 anni e costa tra €5 e €15 milioni per milione di righe di codice. Il fai-da-te con LLM generici fallisce nel 70% dei casi per mancanza di contesto architetturale.",
  },
  {
    label: "LA SOLUZIONE AGENTICA — FASTEER",
    text: "Fasteer non è un assistente alla scrittura. È una catena di montaggio industriale: Agent Orchestrator che scansiona l'intera codebase, mappa le dipendenze, genera un PRD approvato dal CTO, poi traduce e valida il codice con unit test automatici. Equivalenza funzionale garantita.",
  },
  {
    label: "FRIO — ABBATTIMENTO DEI COSTI -87%",
    text: "Il motore FRIO instrada l'85% dei task su modelli open-source locali (Qwen, DeepSeek), riservando solo il 15% più complesso alle API commerciali. Il costo di inferenza scende da $15 a $2 per milione di token (-87%). Più si usa Fasteer, meno si paga: il Super RAG memorizza le correzioni e sposta progressivamente il carico sui modelli gratuiti.",
  },
  {
    label: "AIDAMASK — SOVRANITÀ DEL CODICE",
    text: "Il codice sorgente è l'asset più prezioso di un'azienda. AidaMask anonimizza e tokenizza nomi di variabili, logiche di business e IP proprietario prima che escano dal perimetro aziendale. Architettura On-Premise / Private Cloud, certificata GDPR + ISO 27001. L'unica soluzione accettabile per banche, assicurazioni e settori regolamentati.",
  },
];

const STATS = [
  { value: "$2.41T", label: "Costo annuo debito tecnico USA" },
  { value: "-87%", label: "Riduzione costi inferenza FRIO" },
  { value: "$67.9B", label: "Mercato Legacy Mod. 2031" },
  { value: "90gg", label: "Time to modernize" },
];

export default function FasteerGuidaLegacy() {
  useEffect(() => {
    document.title = "La Guida Definitiva al Codice Legacy — ProofPress × Fasteer";
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Header ProofPress */}
      <header className="bg-[#0a0f1e] border-b-4 border-[#cc0000] py-5 px-4 text-center">
        <p className="text-[11px] tracking-[3px] text-gray-400 uppercase mb-1">PROOFPRESS MAGAZINE</p>
        <Link href="/">
          <h1 className="text-4xl font-bold text-white font-serif tracking-tight cursor-pointer hover:opacity-90 transition-opacity inline-block">
            ProofPress
          </h1>
        </Link>
        <p className="text-[11px] tracking-[4px] text-[#cc0000] uppercase font-semibold mt-1">
          SPECIAL EDITION × FASTEER
        </p>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-8">

        {/* Banner quadrato */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <a href={REPORT_URL} target="_blank" rel="noopener noreferrer">
            <img
              src={BANNER_URL}
              alt="La Guida Definitiva al Codice Legacy — Fasteer"
              className="w-full block"
            />
          </a>
        </div>

        {/* Intro editoriale */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <p className="text-[11px] tracking-[3px] text-[#cc0000] uppercase font-semibold mb-2">
            PROOFPRESS SPECIAL — REPORT ESCLUSIVO
          </p>
          <h2 className="text-2xl font-bold text-[#0a0f1e] font-serif leading-tight mb-4">
            La Guida Definitiva al Codice Legacy.<br />
            Come l'AI Azzera il Debito Tecnico in 90 Giorni.
          </h2>
          <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
            Il codice legacy non è un problema IT. È un freno strutturale alla competitività aziendale. Ogni anno, le aziende statunitensi bruciano <strong>$2.41 trilioni</strong> in debito tecnico — una tassa occulta che erode dal 10% al 20% del budget IT e riduce la produttività dei team di sviluppo fino al 42%.
          </p>
          <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
            Il mercato della Legacy Modernization vale <strong>$24.98 miliardi nel 2025</strong> e crescerà fino a <strong>$67.91 miliardi entro il 2031</strong> (CAGR 19.86%). La domanda supera l'offerta. I System Integrator tradizionali non riescono a scalare. Solo l'AI può risolvere il collo di bottiglia.
          </p>
          <p className="text-[15px] text-gray-700 leading-relaxed">
            Fasteer ha costruito la guida operativa che mancava al mercato: non un white paper teorico, ma un manuale d'esecuzione con dati, benchmark e roadmap per CTO e CEO.{" "}
            <a href={REPORT_URL} target="_blank" rel="noopener noreferrer" className="text-[#cc0000] font-semibold hover:underline">
              Scarica gratuitamente su fasteer.ai/report →
            </a>
          </p>
        </div>

        {/* Stat bar */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-[#cc0000] font-serif">{s.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <p className="text-[11px] tracking-[3px] text-gray-400 uppercase font-semibold mb-5">
            KEY FINDINGS — FASTEER REPORT 2026
          </p>
          <div className="space-y-5">
            {FINDINGS.map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1 flex-shrink-0 bg-[#cc0000] rounded-full" />
                <div>
                  <p className="text-[12px] font-bold text-[#cc0000] uppercase tracking-wide mb-1">{f.label}</p>
                  <p className="text-[14px] text-gray-700 leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fasteer Sponsor Block */}
        <div className="bg-[#0a0f1e] rounded-lg p-8 mb-6">
          <p className="text-[10px] tracking-[3px] text-gray-500 uppercase mb-1">PARTNER SPOTLIGHT</p>
          <div className="w-8 h-px bg-[#cc0000] mb-5" />
          <p className="text-[13px] font-bold text-[#cc0000] tracking-[2px] uppercase mb-2">FASTEER</p>
          <h3 className="text-2xl font-bold text-white font-serif leading-tight mb-4">
            Da Spesa ad Asset.<br />
            Il Fai-da-Te è una Tassa.<br />
            Fasteer è un Investimento.
          </h3>
          <p className="text-[14px] text-gray-300 leading-relaxed mb-6">
            In 48 ore analizziamo un campione del tuo codice legacy e consegniamo una stima precisa di costi, tempi e ROI rispetto alle alternative tradizionali.{" "}
            <span className="text-white font-semibold">Assessment gratuito, nessun impegno.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#cc0000] text-white text-[13px] font-bold tracking-wide uppercase text-center px-6 py-3 rounded hover:bg-red-700 transition-colors"
            >
              SCARICA LA GUIDA GRATIS →
            </a>
            <a
              href="https://fasteer.ai?utm_source=proofpress&utm_medium=landing&utm_campaign=fasteer_guida_assessment"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-gray-600 text-gray-300 text-[13px] font-semibold text-center px-5 py-3 rounded hover:border-gray-400 hover:text-white transition-colors"
            >
              Prenota Assessment →
            </a>
          </div>
          <p className="text-[11px] text-gray-600 mt-4">
            ✉ hello@fasteer.ai · www.fasteer.ai · FoolFarm S.p.A. — 2026
          </p>
        </div>

        {/* ProofPress Verify block */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <p className="text-[11px] tracking-[3px] text-gray-400 uppercase font-semibold mb-2">
            PROOFPRESS VERIFY™
          </p>
          <p className="text-[17px] font-bold text-[#0a0f1e] font-serif leading-snug mb-3">
            Il futuro dell'informazione è la notizia certificata.
          </p>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
            Ogni contenuto pubblicato su ProofPress porta un codice crittografico verificabile. La certificazione è l'unico antidoto alla disinformazione nell'era dei modelli generativi.
          </p>
          <a
            href="https://proofpressverify.com?utm_source=proofpress&utm_medium=landing&utm_campaign=fasteer_guida_verify"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#cc0000] text-white text-[12px] font-bold tracking-wide uppercase px-5 py-2.5 rounded hover:bg-red-700 transition-colors"
          >
            Scopri come funziona →
          </a>
        </div>

        {/* Back to ProofPress */}
        <div className="text-center pb-4">
          <Link href="/">
            <span className="text-[13px] text-gray-500 hover:text-[#cc0000] transition-colors cursor-pointer">
              ← Torna a ProofPress.ai
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0f1e] border-t border-gray-800 py-6 px-4 text-center">
        <p className="text-[12px] text-gray-500">
          © 2026 ProofPress — Il primo sito di informazione con notizie certificate.
          Contenuto sponsorizzato da{" "}
          <a href="https://fasteer.ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            Fasteer
          </a>
          {" "}· FoolFarm S.p.A.
        </p>
      </footer>
    </div>
  );
}
