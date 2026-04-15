/**
 * EbookPrompt.tsx — Landing page "Collezione dei migliori Prompt 2026"
 * Stile ispirato a TAAFT Prompt Pack, adattato per IdeaSmart in italiano
 */
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  Download,
  Sparkles,
  Zap,
  Brain,
  Briefcase,
  PenTool,
  Heart,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  Users,
  Palette,
  Coins,
} from "lucide-react";

const CATEGORIES = [
  { icon: Briefcase, label: "Business & Strategia", count: 12 },
  { icon: TrendingUp, label: "Produttività", count: 10 },
  { icon: PenTool, label: "Scrittura & Content", count: 11 },
  { icon: Palette, label: "Creatività & Design", count: 9 },
  { icon: Brain, label: "Decision-Making", count: 8 },
  { icon: GraduationCap, label: "Apprendimento", count: 10 },
  { icon: Coins, label: "Finanza & Investimenti", count: 8 },
  { icon: Heart, label: "Salute & Benessere", count: 7 },
  { icon: Users, label: "Relazioni & Networking", count: 6 },
  { icon: Lightbulb, label: "Innovazione & Startup", count: 10 },
  { icon: Zap, label: "Automazione & Workflow", count: 8 },
];

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/4gM5kFdoT5yS0FZ6SocbC07";

export default function EbookPrompt() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#111827] to-[#0a0f1e]" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#00e5c8]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ff5500]/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00e5c8]/10 text-[#00e5c8] text-xs font-bold tracking-wider uppercase mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                BY PROOF PRESS
              </div>

              <h1
                className="text-4xl md:text-5xl font-black text-white leading-tight mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Collezione dei
                <br />
                <span className="text-[#ff5500]">migliori Prompt 2026</span>
              </h1>

              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                I prompt più efficaci dalla newsletter Proof Press. Testati, perfezionati e pronti all'uso con ChatGPT, Claude, Gemini e tutti i principali modelli AI.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  "Funziona con ChatGPT, Claude, Gemini e altri",
                  "Copia-incolla pronto",
                  "Download PDF istantaneo",
                  "Nessuna competenza tecnica richiesta",
                ].map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-gray-300 text-xs font-medium border border-white/10"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#00e5c8]" />
                    {feat}
                  </span>
                ))}
              </div>

              <a href={STRIPE_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                <Button className="h-14 px-8 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-base rounded-xl">
                  <Download className="w-5 h-5 mr-2" />
                  Acquista il Prompt Pack — €9,90
                </Button>
              </a>
            </div>

            {/* Right — Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#1a1f3e] to-[#0d1117] rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#ff5500]/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#ff5500]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Proof Press</p>
                    <p className="text-gray-400 text-xs">Prompt Collection 2026</p>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Collezione dei
                  <br />migliori Prompt 2026
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  I prompt più efficaci dalla newsletter Proof Press
                </p>

                <div className="space-y-2">
                  {["99 prompt testati e perfezionati", "11 categorie professionali", "Framework multi-paragrafo", "Aggiornamento gratuito 2026"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00e5c8]" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-[#111827] border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Per anni, la domanda più frequente è stata una sola:
          </p>
          <p className="text-xl text-[#ff5500] font-semibold italic mb-8">
            "Dove trovo i prompt migliori?"
          </p>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Oggi rispondiamo con <strong className="text-white">la collezione definitiva dei prompt dalla newsletter Proof Press</strong>.
            Non sono prompt generici da una riga. Ogni prompt è un framework multi-paragrafo con ruolo, contesto, istruzioni e formato di output integrati.
            Copia, incolla, compila i tuoi dati e ottieni risultati strutturati in pochi secondi.
          </p>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-20 px-4 bg-[#0a0f1e]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Cosa trovi dentro
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              99 prompt organizzati in 11 categorie, ciascuno testato e perfezionato dal team Proof Press.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-[#ff5500]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#ff5500]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{cat.label}</p>
                    <p className="text-gray-500 text-xs">{cat.count} prompt</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#111827] to-[#0a0f1e]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl text-gray-300 mb-3">
            La tua AI è buona solo quanto i tuoi prompt.
          </p>
          <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ottieni il Prompt Pack ora
          </h2>
          <a href={STRIPE_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
            <Button className="h-14 px-10 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-lg rounded-xl">
              Acquista il Prompt Pack — €9,90 →
            </Button>
          </a>
          <p className="text-gray-500 text-sm mt-4">
            Download immediato in PDF. Pagamento sicuro via Stripe.
          </p>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="py-4 px-4 border-t border-white/5 text-center">
        <p className="text-gray-500 text-xs">
          ProofPress Magazine è parte del gruppo <span className="font-semibold">AxiomX</span>{" · "}
          <a href="/privacy" className="underline hover:opacity-70">Privacy</a>
        </p>
      </footer>
    </div>
  );
}
