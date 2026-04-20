/**
 * PromptLibraryLanding — Pagina di vendita della Prompt Library
 * Design: editoriale premium, sfondo crema, CTA rosso, serif bold
 * Target: manager, founder, marketer, consulenti
 */
import { useState } from "react";
import { ArrowRight, Check, Lock, Star, Users, Zap, BookOpen, Download } from "lucide-react";
import SharedPageHeader from "@/components/SharedPageHeader";

const PRODUCT_URL = "https://promptcollection2026.com/";

// ─── Dati ────────────────────────────────────────────────────────────────────
const TARGETS = [
  {
    icon: "👔",
    role: "Manager e Dirigenti",
    pain: "Passi ore ad analizzare report, preparare presentazioni e scrivere email strategiche.",
    prompt: '"Sei un consulente McKinsey. Analizza questo report trimestrale e identificami i 3 rischi principali con piano d\'azione concreto per ciascuno, in formato executive summary."',
    result: "2 ore di analisi → 10 minuti di lavoro ad alto valore.",
    color: "#1a1a1a",
  },
  {
    icon: "🚀",
    role: "Founder e Imprenditori",
    pain: "Hai bisogno di strategie, pitch, analisi competitive — ma non hai un team di consulenti.",
    prompt: '"Sei un esperto di go-to-market B2B SaaS con 15 anni di esperienza. Costruisci una strategia di lancio per [prodotto] con budget €5.000, includendo canali, messaggi chiave e metriche di successo."',
    result: "Output strutturato da consulente senior, in 60 secondi.",
    color: "#d94f3d",
  },
  {
    icon: "✍️",
    role: "Marketer e Content Creator",
    pain: "Scrivi contenuti ogni giorno. Trovare l'angolo giusto, il tono, la struttura — richiede tempo.",
    prompt: '"Scrivi 5 subject line email per [prodotto] usando la formula AIDA, tono professionale ma diretto, max 50 caratteri ciascuna. Per ogni subject line spiega perché funziona."',
    result: "30 secondi invece di 30 minuti. Ogni volta.",
    color: "#2563eb",
  },
  {
    icon: "💼",
    role: "Consulenti e Freelance",
    pain: "I clienti ti pagano per il tuo giudizio. Ma preparare brief, analisi e proposte richiede ore.",
    prompt: '"Sei un consulente senior con esperienza in [settore]. Analizza questo brief del cliente e identificami le domande che non ha fatto ma che determinano il successo del progetto. Poi suggerisci 3 approcci alternativi."',
    result: "Il prompt che impressiona i clienti e giustifica la tariffa.",
    color: "#7c3aed",
  },
];

const BEFORE_AFTER = [
  {
    before: "\"Dimmi come fare una strategia di marketing\"",
    after: "\"Sei un CMO B2B con 10 anni di esperienza. Costruisci una strategia di content marketing per [azienda SaaS] con ICP [profilo], budget mensile €2.000, obiettivo: 50 MQL in 90 giorni. Includi canali, calendario editoriale e KPI.\"",
    improvement: "Risposta 10x più specifica e utilizzabile",
  },
  {
    before: "\"Scrivi un'email di follow-up\"",
    after: "\"Sei un sales coach esperto in B2B enterprise. Scrivi un'email di follow-up per un prospect che ha visto la demo ma non ha risposto da 5 giorni. Tono: diretto ma non aggressivo. Includi un hook di apertura, un riferimento specifico alla demo e una CTA chiara. Max 150 parole.\"",
    improvement: "Tasso di risposta stimato: +40%",
  },
];

const FEATURES = [
  { icon: <BookOpen className="w-5 h-5" />, label: "99 prompt in archivio", sub: "Classificati per categoria e uso" },
  { icon: <Zap className="w-5 h-5" />, label: "5 macro-sezioni tematiche", sub: "Business, Marketing, Analisi, Creatività, Produttività" },
  { icon: <Download className="w-5 h-5" />, label: "PDF scaricabile incluso", sub: "Sempre con te, anche offline" },
  { icon: <Users className="w-5 h-5" />, label: "Compatibile con tutti gli LLM", sub: "ChatGPT, Claude, Gemini, Perplexity" },
  { icon: <Lock className="w-5 h-5" />, label: "Accesso permanente", sub: "Paghi una volta, usi per sempre" },
  { icon: <Star className="w-5 h-5" />, label: "Fonti metodologiche ufficiali", sub: "OpenAI, Anthropic, Claude Code, Perplexity" },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PromptLibraryLanding() {
  const [activeTarget, setActiveTarget] = useState(0);

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <SharedPageHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a1a] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-[#d94f3d] text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-6">
            OFFERTA LIMITATA · PROMPT LIBRARY
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#f5f3ef] leading-tight mb-6">
            L'AI che usi ogni giorno<br />potrebbe fare 10 volte di più.
          </h1>
          <p className="text-[#f5f3ef]/70 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
            99 prompt selezionati da professionisti reali — non da tutorial YouTube.
            Per manager, founder, marketer e consulenti che vogliono risultati concreti.
          </p>
          <a
            href={PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#d94f3d] text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-[#c0392b] transition-colors"
          >
            🔓 Accedi subito per €39 <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-[#f5f3ef]/40 text-sm mt-3">
            Pagamento unico · Nessun abbonamento · Accesso permanente · PDF incluso
          </p>
        </div>
      </section>

      {/* ── PROBLEMA ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-4 text-center">IL PROBLEMA</p>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] text-center mb-8 leading-tight">
            La maggior parte delle persone usa l'AI come un motore di ricerca glorificato.
          </h2>
          <div className="bg-white rounded-xl p-8 border border-[#e8e4dc]">
            <p className="text-[#1a1a1a]/70 text-base leading-relaxed mb-4">
              Scrive <em>"dimmi come fare X"</em>, ottiene una risposta generica, rimane delusa.
              Pensa che l'AI non sia abbastanza brava. Ma il problema non è l'AI — <strong>è il prompt.</strong>
            </p>
            <p className="text-[#1a1a1a]/70 text-base leading-relaxed">
              Con i prompt giusti, lo stesso strumento diventa un consulente strategico, un copywriter senior,
              un analista finanziario. La differenza tra un prompt mediocre e uno professionale
              è la differenza tra una risposta inutile e un output che puoi usare subito.
            </p>
          </div>
        </div>
      </section>

      {/* ── A CHI SERVE ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-4 text-center">A CHI SERVE</p>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] text-center mb-10 leading-tight">
            Scegli il tuo profilo. Vedi l'esempio.
          </h2>

          {/* Tab selector */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {TARGETS.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTarget(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  activeTarget === i
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-transparent text-[#1a1a1a] border-[#e8e4dc] hover:border-[#1a1a1a]"
                }`}
              >
                <span>{t.icon}</span> {t.role}
              </button>
            ))}
          </div>

          {/* Active target card */}
          <div className="bg-[#f5f3ef] rounded-2xl p-8 border border-[#e8e4dc]">
            <div className="mb-6">
              <p className="text-sm text-[#1a1a1a]/50 mb-2 font-medium">Il tuo problema quotidiano:</p>
              <p className="text-[#1a1a1a] text-base leading-relaxed italic">"{TARGETS[activeTarget].pain}"</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-[#d94f3d] mb-3 font-bold uppercase tracking-wide">Esempio di prompt dalla libreria:</p>
              <div className="bg-[#1a1a1a] rounded-xl p-5">
                <p className="text-[#f5f3ef] text-sm leading-relaxed font-mono">{TARGETS[activeTarget].prompt}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-[#e8e4dc]">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-[#1a1a1a] font-semibold text-sm">{TARGETS[activeTarget].result}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRIMA / DOPO ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-4 text-center">PRIMA / DOPO</p>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] text-center mb-10 leading-tight">
            La differenza che fa un prompt professionale.
          </h2>
          <div className="space-y-6">
            {BEFORE_AFTER.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#e8e4dc]">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e8e4dc]">
                  <div className="p-6">
                    <p className="text-xs font-bold tracking-widest uppercase text-[#1a1a1a]/30 mb-3">PRIMA</p>
                    <p className="text-[#1a1a1a]/60 text-sm leading-relaxed italic">{item.before}</p>
                  </div>
                  <div className="p-6 bg-[#f5f3ef]">
                    <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-3">DOPO (dalla libreria)</p>
                    <p className="text-[#1a1a1a] text-sm leading-relaxed font-mono">{item.after}</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] px-6 py-3">
                  <p className="text-[#f5f3ef] text-xs font-bold">✓ {item.improvement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COSA INCLUDE ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-4 text-center">COSA INCLUDE</p>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] text-center mb-10 leading-tight">
            Tutto quello che ottieni per €39.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-[#e8e4dc] bg-[#f5f3ef]">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-bold text-[#1a1a1a] text-sm">{f.label}</p>
                  <p className="text-[#1a1a1a]/50 text-xs mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA PRINCIPALE ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#1a1a1a]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#f5f3ef]/50 text-sm mb-2">Un investimento una tantum</p>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="font-serif text-6xl font-bold text-[#f5f3ef]">€39</span>
            <div className="text-left">
              <p className="text-[#f5f3ef]/70 text-sm">Accesso permanente</p>
              <p className="text-[#f5f3ef]/70 text-sm">PDF incluso</p>
            </div>
          </div>
          <a
            href={PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#d94f3d] text-white font-bold text-xl px-10 py-5 rounded-xl hover:bg-[#c0392b] transition-colors mb-4"
          >
            🔓 Accedi subito <ArrowRight className="w-6 h-6" />
          </a>
          <p className="text-[#f5f3ef]/40 text-sm">
            Pagamento unico · Nessun abbonamento · Accesso permanente · PDF incluso
          </p>
          <div className="mt-8 bg-white/5 rounded-xl p-5 border border-white/10">
            <p className="text-[#f5f3ef]/80 text-sm leading-relaxed">
              <strong className="text-[#f5f3ef]">Garanzia soddisfatti o rimborsati 7 giorni.</strong>{" "}
              Se entro 7 giorni dall'acquisto non sei soddisfatto, ti rimborsiamo senza domande.
              Rischio zero.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-[#d94f3d] mb-4 text-center">FAQ</p>
          <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] text-center mb-8">Domande frequenti</h2>
          <div className="space-y-4">
            {[
              {
                q: "È un abbonamento?",
                a: "No. Paghi €39 una sola volta e ottieni accesso permanente alla libreria online e al PDF scaricabile. Nessun rinnovo, nessuna sorpresa.",
              },
              {
                q: "Funziona con ChatGPT, Claude e Gemini?",
                a: "Sì. Tutti i prompt sono compatibili con i principali modelli LLM: ChatGPT (GPT-4o), Claude 3.5, Gemini 1.5 Pro, Perplexity. Puoi usarli subito senza modifiche.",
              },
              {
                q: "Cosa ricevo esattamente?",
                a: "Accesso immediato all'area membri con 99 prompt ricercabili per categoria, filtrabili per uso professionale, più il PDF completo da scaricare e conservare.",
              },
              {
                q: "E se non mi serve?",
                a: "Se usi l'AI nel lavoro almeno una volta a settimana, ti serve. Se non sei soddisfatto entro 7 giorni, ti rimborsiamo senza domande.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-[#e8e4dc]">
                <p className="font-bold text-[#1a1a1a] mb-2">{item.q}</p>
                <p className="text-[#1a1a1a]/60 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ───────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[#d94f3d]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/80 text-sm mb-3">Smetti di usare l'AI come un motore di ricerca.</p>
          <h2 className="font-serif text-3xl font-bold text-white mb-6">
            99 prompt. €39. Accesso permanente.
          </h2>
          <a
            href={PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#d94f3d] font-bold text-lg px-8 py-4 rounded-xl hover:bg-[#f5f3ef] transition-colors"
          >
            🔓 Accedi subito per €39 <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
