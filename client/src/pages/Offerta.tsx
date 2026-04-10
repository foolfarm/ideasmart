/**
 * Pagina /offerta — Hub dei piani ProofPress
 * Tre card per i tre target: Creator, Editori, Aziende
 */
import { Link } from "wouter";
import { ArrowRight, Mic, Newspaper, Building2 } from "lucide-react";

const PLANS = [
  {
    icon: <Mic className="w-7 h-7" />,
    badge: "Creator & Giornalisti",
    badgeColor: "#ff5500",
    title: "La tua testata.\nLa tua firma.\nZero redazione.",
    description:
      "Sei un giornalista indipendente, un analista, un newsletter creator. ProofPress ti dà una redazione AI che scrive, verifica e pubblica per te. Tu mantieni la voce, il controllo e la firma. Ogni contenuto certificato.",
    highlights: [
      "15 articoli/giorno con 1 sola persona",
      "4.000+ fonti monitorate 24/7",
      "Badge ProofPress Verify su ogni pezzo",
      "Newsletter AI-powered inclusa",
    ],
    price: "Da €490/mese",
    setup: "+ €2.000 setup",
    cta: "Scopri l'offerta Creator →",
    href: "/offerta/creator",
    accent: "#ff5500",
    bg: "#fff8f5",
  },
  {
    icon: <Newspaper className="w-7 h-7" />,
    badge: "Testate & Editori",
    badgeColor: "#c0392b",
    title: "Più verticali.\nPiù contenuti.\nPiù ricavi.",
    description:
      "Aggiungi linee editoriali complete alla tua testata senza assumere. Ogni verticale ha agenti dedicati, fonti specializzate e certificazione ProofPress Verify. Triplica l'inventory pubblicitaria in 4 mesi.",
    highlights: [
      "Nuovi verticali senza assunzioni",
      "Produzione quotidiana automatica",
      "Paywall e newsletter per canale",
      "Revenue share disponibile",
    ],
    price: "Da €1.490/mese",
    setup: "+ €5.000 setup",
    cta: "Scopri l'offerta Testate →",
    href: "/offerta/editori",
    accent: "#c0392b",
    bg: "#fff5f5",
    featured: true,
  },
  {
    icon: <Building2 className="w-7 h-7" />,
    badge: "Aziende & Corporate",
    badgeColor: "#1a4a6b",
    title: "Corporate newsroom.\nIR attiva.\nIntelligence interna.",
    description:
      "Una redazione AI che costruisce la tua corporate newsroom, la tua sezione IR, il tuo intelligence feed interno. Contenuti certificati, automatici, multimediali. Senza assumere una redazione.",
    highlights: [
      "Corporate newsroom 24/7",
      "Daily Intelligence Brief per il C-level",
      "Canale dipendenti sulla intranet",
      "Feed dedicati per business unit",
    ],
    price: "Da €1.990/mese",
    setup: "+ €7.000 setup",
    cta: "Scopri l'offerta Corporate →",
    href: "/offerta/aziende",
    accent: "#1a4a6b",
    bg: "#f5f8ff",
  },
];

export default function Offerta() {
  return (
    <div
      className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* NAV BREADCRUMB */}
      <div className="border-b border-[#1a1a1a]/8 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">
            ← ProofPress
          </Link>
          <a href="mailto:info@proofpress.ai" className="text-[11px] font-medium tracking-[0.1em] uppercase text-[#1a1a1a]/40 hover:text-[#c0392b] transition-colors">
            info@proofpress.ai
          </a>
        </div>
      </div>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase bg-[#1a1a1a] text-white px-3 py-1.5 rounded-sm mb-6">
          Piani e Prezzi
        </span>
        <h1 className="text-[40px] md:text-[56px] font-black leading-[1.05] tracking-[-0.02em] mb-5 max-w-3xl mx-auto">
          Scegli il piano ProofPress per il tuo progetto.
        </h1>
        <p className="text-[17px] text-[#1a1a1a]/60 leading-relaxed max-w-2xl mx-auto mb-4">
          Tre soluzioni per tre profili diversi — tutti con la stessa tecnologia di AI Journalism certificato, lo stesso standard di verifica ProofPress Verify e lo stesso impegno sulla qualità.
        </p>
        <p className="text-[13px] text-[#1a1a1a]/40 tracking-[0.08em] uppercase">
          Setup in pochi giorni · Disdici quando vuoi · Revenue share disponibile
        </p>
      </section>

      {/* CARDS */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.badge}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: plan.bg,
                border: plan.featured ? `2px solid ${plan.accent}` : "1px solid rgba(26,26,26,0.10)",
                position: "relative",
              }}
            >
              {plan.featured && (
                <div
                  className="text-center text-[10px] font-bold tracking-[0.2em] uppercase py-2"
                  style={{ background: plan.accent, color: "#fff" }}
                >
                  Più scelto
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Icon + Badge */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${plan.accent}15`, color: plan.accent }}
                  >
                    {plan.icon}
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-[0.18em] uppercase"
                    style={{ color: plan.accent }}
                  >
                    {plan.badge}
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="text-[22px] font-black leading-tight mb-4 tracking-[-0.01em]"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {plan.title}
                </h2>

                {/* Description */}
                <p className="text-[14px] text-[#1a1a1a]/60 leading-relaxed mb-5">
                  {plan.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-[13px] text-[#1a1a1a]/70">
                      <span style={{ color: plan.accent, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="border-t border-[#1a1a1a]/8 pt-5 mb-5">
                  <div
                    className="text-[26px] font-black tracking-[-0.02em]"
                    style={{ color: plan.accent }}
                  >
                    {plan.price}
                  </div>
                  <div className="text-[12px] text-[#1a1a1a]/40 mt-1">{plan.setup}</div>
                </div>

                {/* CTA */}
                <Link href={plan.href}>
                  <div
                    className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-lg font-bold text-[14px] cursor-pointer transition-opacity hover:opacity-85"
                    style={{
                      background: plan.featured ? plan.accent : "#1a1a1a",
                      color: "#fff",
                    }}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEZIONE CONFRONTO / GARANZIE */}
      <section className="border-t border-[#1a1a1a]/8 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-[24px] font-black mb-8 tracking-[-0.01em] text-center">
            Incluso in tutti i piani
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🔐", title: "ProofPress Verify", desc: "Certificazione crittografica su ogni contenuto pubblicato" },
              { icon: "📡", title: "4.000+ fonti", desc: "Monitoraggio 24/7 di fonti certificate in italiano e inglese" },
              { icon: "⚡", title: "Setup rapido", desc: "Operativo in 5-10 giorni lavorativi dalla firma" },
              { icon: "🔄", title: "Disdici quando vuoi", desc: "Nessun vincolo pluriennale, massima flessibilità" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-[32px] mb-3">{item.icon}</div>
                <h3 className="text-[14px] font-bold mb-1">{item.title}</h3>
                <p className="text-[12px] text-[#1a1a1a]/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="max-w-5xl mx-auto px-6 py-14 text-center">
        <h2 className="text-[28px] font-black mb-4 tracking-[-0.01em]">
          Non sai quale piano fa per te?
        </h2>
        <p className="text-[15px] text-[#1a1a1a]/55 mb-6 max-w-lg mx-auto">
          Scrivici e ti aiutiamo a scegliere la soluzione giusta per il tuo progetto. Risposta garantita entro 24 ore.
        </p>
        <a
          href="mailto:info@proofpress.ai"
          className="inline-flex items-center gap-2 px-8 py-3 font-bold text-[14px] rounded-lg transition-opacity hover:opacity-85"
          style={{ background: "#1a1a1a", color: "#fff" }}
        >
          Scrivici a info@proofpress.ai →
        </a>
        <p className="text-[12px] text-[#1a1a1a]/35 tracking-[0.08em] uppercase mt-4">
          Oppure guarda la{" "}
          <a
            href="https://ideasmart.technology"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#c0392b] transition-colors"
          >
            demo live della piattaforma ↗
          </a>
        </p>
      </section>
    </div>
  );
}
