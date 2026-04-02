/**
 * START HERE — Come usare IdeaSmart
 * Contenuto editoriale statico + guide per iniziare
 */
import ChannelPage from "@/components/ChannelPage";
import { Link } from "wouter";
import { BookOpen, ArrowRight, Zap, Copy, Brain, DollarSign, Wrench } from "lucide-react";

function StartHereContent() {
  return (
    <div className="space-y-10">
      {/* Intro */}
      <div className="max-w-2xl">
        <h2
          className="text-2xl md:text-3xl font-black leading-tight mb-4"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" }}
        >
          Benvenuto su IdeaSmart
        </h2>
        <p className="text-[15px] leading-relaxed text-[#1a1a1a]/75" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Georgia, serif" }}>
          IdeaSmart non è un altro sito di notizie sull'AI. È il tuo <strong>sistema operativo</strong> per trasformare l'intelligenza artificiale in risultati concreti. Ogni giorno trovi prompt pronti, automazioni reali, tool testati e opportunità di business — tutto verificato e pronto all'uso.
        </p>
      </div>

      {/* Quick Start Guide */}
      <div>
        <h3 className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2 border-[#1a1a1a]"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" }}>
          Da zero a produttivo in 30 minuti
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              step: "01",
              title: "Copia il tuo primo prompt",
              desc: "Vai su Copy & Paste AI, scegli un prompt dalla tua area (business, studio, marketing) e incollalo in ChatGPT, Claude o Gemini.",
              link: "/copy-paste-ai",
              icon: <Copy className="w-5 h-5" />,
            },
            {
              step: "02",
              title: "Automatizza un workflow",
              desc: "Esplora Automate with AI per trovare un'automazione step-by-step che puoi replicare in 15 minuti.",
              link: "/automate-with-ai",
              icon: <Zap className="w-5 h-5" />,
            },
            {
              step: "03",
              title: "Scopri un tool che ti serve davvero",
              desc: "Daily AI Tools ti mostra 1-3 strumenti al giorno, spiegati: cosa fa, quando usarlo, alternative.",
              link: "/daily-ai-tools",
              icon: <Wrench className="w-5 h-5" />,
            },
            {
              step: "04",
              title: "Trova la tua opportunità",
              desc: "AI Opportunities e Make Money with AI ti mostrano come monetizzare le tue competenze AI.",
              link: "/make-money-with-ai",
              icon: <DollarSign className="w-5 h-5" />,
            },
          ].map((item) => (
            <Link key={item.step} href={item.link}>
              <div className="group border border-[#1a1a1a]/10 rounded-sm p-5 hover:border-[#1a1a1a]/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <span className="text-3xl font-black text-[#1a1a1a]/15 leading-none">{item.step}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.icon}
                      <h4 className="font-bold text-[15px]">{item.title}</h4>
                    </div>
                    <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">{item.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold mt-2 text-[#1a1a1a]/50 group-hover:text-[#1a1a1a] transition-colors">
                      Vai al canale <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* I migliori prompt per iniziare */}
      <div>
        <h3 className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2 border-[#1a1a1a]"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" }}>
          5 prompt per iniziare subito
        </h3>
        <div className="space-y-4">
          {[
            {
              title: "Analisi SWOT del tuo business",
              prompt: "Agisci come un consulente strategico senior. Analizza il seguente business [DESCRIVI IL TUO BUSINESS] e produci un'analisi SWOT completa con: Punti di forza, Debolezze, Opportunità, Minacce. Per ogni punto, suggerisci un'azione concreta da implementare entro 30 giorni.",
              category: "Business",
            },
            {
              title: "Riassunto esecutivo di un documento",
              prompt: "Leggi il seguente documento e produci un riassunto esecutivo di massimo 200 parole. Struttura: 1) Contesto, 2) Punti chiave (max 5), 3) Implicazioni pratiche, 4) Azione raccomandata.",
              category: "Produttività",
            },
            {
              title: "Piano editoriale settimanale",
              prompt: "Crea un piano editoriale per [PIATTAFORMA] per la prossima settimana. Target: [AUDIENCE]. Obiettivo: [OBIETTIVO]. Per ogni giorno indica: hook, formato, CTA, hashtag. Includi un mix di contenuti educativi (40%), engagement (30%) e promozionali (30%).",
              category: "Marketing",
            },
            {
              title: "Revisione e miglioramento testo",
              prompt: "Rivedi il seguente testo migliorando: chiarezza, concisione, impatto. Mantieni il tono [FORMALE/INFORMALE]. Evidenzia le modifiche principali e spiega perché ogni cambio migliora il testo. Versione originale: [TESTO]",
              category: "Scrittura",
            },
            {
              title: "Brainstorming strutturato",
              prompt: "Genera 10 idee innovative per [PROBLEMA/OBIETTIVO]. Per ogni idea: titolo (max 5 parole), descrizione (2 righe), effort (basso/medio/alto), impatto potenziale (1-10). Ordina per rapporto impatto/effort decrescente.",
              category: "Creatività",
            },
          ].map((item, i) => (
            <div key={i} className="border border-[#1a1a1a]/10 rounded-sm overflow-hidden">
              <div className="p-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#1a1a1a]/8 text-[#1a1a1a] mb-2">
                  {item.category}
                </span>
                <h4 className="font-bold text-[15px] mb-2">{item.title}</h4>
                <div className="bg-[#1a1a1a] text-white rounded-md p-3">
                  <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-white/90">
                    {item.prompt}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 automazioni base */}
      <div>
        <h3 className="text-lg font-bold uppercase tracking-wide mb-4 pb-2 border-b-2 border-[#1a1a1a]"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" }}>
          5 automazioni base con AI
        </h3>
        <div className="space-y-3">
          {[
            { title: "Email → Riassunto automatico", desc: "Collega Gmail a ChatGPT via Zapier. Ogni email lunga viene riassunta in 3 bullet point e salvata in un Google Doc." },
            { title: "RSS → Newsletter curata", desc: "Usa n8n per raccogliere 50 articoli al giorno, filtrare i migliori 5 con AI e generare una newsletter pronta." },
            { title: "Meeting → Action items", desc: "Registra le riunioni con Otter.ai, passa la trascrizione a Claude per estrarre decisioni, task e deadline." },
            { title: "Social → Report settimanale", desc: "Automatizza la raccolta di metriche social con Make.com e genera un report PDF con insight e raccomandazioni." },
            { title: "Documenti → Knowledge base", desc: "Carica i tuoi documenti su NotebookLM o un RAG custom per avere un assistente che risponde basandosi sui tuoi dati." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-[#1a1a1a]/10 last:border-0">
              <span className="text-2xl font-black text-[#1a1a1a]/15 leading-none w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h4 className="font-bold text-[14px] mb-0.5">{item.title}</h4>
                <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Ebook */}
      <div className="bg-[#0a0f1e] text-white rounded-md p-6 md:p-8">
        <p className="text-[10px] uppercase tracking-widest text-[#ff5500] font-bold mb-2">RISORSA PREMIUM</p>
        <h3 className="text-xl md:text-2xl font-black mb-3">Collezione dei Migliori Prompt 2026</h3>
        <p className="text-sm text-white/70 mb-4 max-w-lg">
          99 prompt professionali organizzati in 5 macro-sezioni. Framework multi-paragrafo con ruolo, contesto, istruzioni e formato di output. Funziona con ChatGPT, Claude, Gemini e altri.
        </p>
        <a
          href="https://ideasmart.forum"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5500] text-white font-bold rounded-md hover:bg-[#e64d00] transition-colors text-sm"
        >
          Scopri la collezione <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function StartHere() {
  return (
    <ChannelPage
      slug="start-here"
      title="Start Here"
      subtitle="Da zero a produttivo con l'AI in 30 minuti"
      description="Guida completa per iniziare a usare IdeaSmart: prompt base, automazioni, workflow e risorse per trasformare l'AI in risultati concreti."
      icon={<BookOpen className="w-6 h-6" />}
      staticContent={<StartHereContent />}
    />
  );
}
