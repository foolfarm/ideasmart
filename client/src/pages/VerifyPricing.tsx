/**
 * ProofPress Verify — Pagina Prezzi
 *
 * Presenta i 4 piani Verify (Essential, Premiere, Professional, Custom).
 * I piani sono attivati manualmente dal team ProofPress.
 * CTA: "Richiedi accesso" → mailto verify@proofpress.ai
 */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Check, Zap, Shield, Building2, Sparkles, ArrowRight, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";

// ── Dati piani ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    key: "essential",
    name: "Essential",
    price: "€490",
    period: "/mese",
    description: "Per testate piccole, blog e creator. Verifica fino a 100 articoli al mese con hash crittografico immutabile.",
    icon: <Zap className="w-5 h-5" />,
    color: "from-blue-500 to-blue-600",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-400",
    popular: false,
    features: [
      "100 articoli verificati/mese",
      "2 account giornalista",
      "Verification Report PDF",
      "Hash crittografico immutabile",
      "API REST (ppv_live_...)",
      "Dashboard analytics base",
    ],
  },
  {
    key: "premiere",
    name: "Premiere",
    price: "€990",
    period: "/mese",
    description: "Per redazioni medie e agenzie stampa. 300 articoli al mese con badge verificato sul tuo sito.",
    icon: <Shield className="w-5 h-5" />,
    color: "from-cyan-500 to-cyan-600",
    borderColor: "border-cyan-500/50",
    badgeColor: "bg-cyan-500/10 text-cyan-400",
    popular: true,
    features: [
      "300 articoli verificati/mese",
      "5 account giornalista",
      "Verification Report PDF",
      "Hash crittografico immutabile",
      "API REST (ppv_live_...)",
      "Dashboard analytics avanzata",
      "Badge ProofPress Verified sul sito",
      "Supporto email prioritario",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    price: "€1.470",
    period: "/mese",
    description: "Per grandi testate e gruppi editoriali. 500 articoli, white-label e SLA garantito.",
    icon: <Building2 className="w-5 h-5" />,
    color: "from-violet-500 to-violet-600",
    borderColor: "border-violet-500/30",
    badgeColor: "bg-violet-500/10 text-violet-400",
    popular: false,
    features: [
      "500 articoli verificati/mese",
      "10 account giornalista",
      "Verification Report PDF",
      "Hash crittografico immutabile",
      "API REST (ppv_live_...)",
      "Dashboard analytics avanzata",
      "Badge ProofPress Verified sul sito",
      "White-label report opzionale",
      "Supporto dedicato (Slack/email)",
      "SLA 99.5% uptime",
    ],
  },
  {
    key: "custom",
    name: "Custom",
    price: "Su preventivo",
    period: "",
    description: "Per grandi gruppi editoriali, agenzie di comunicazione e media company. Volume illimitato, integrazione dedicata.",
    icon: <Sparkles className="w-5 h-5" />,
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-400",
    popular: false,
    features: [
      "Articoli verificati illimitati",
      "Seat giornalisti illimitati",
      "Verification Report PDF",
      "Hash crittografico immutabile",
      "API REST dedicata",
      "Dashboard white-label",
      "Integrazione CMS personalizzata",
      "Account manager dedicato",
      "SLA 99.9% uptime",
      "Formazione team inclusa",
    ],
  },
];

function buildMailto(planName: string) {
  const subject = encodeURIComponent(`Richiesta accesso ProofPress Verify — Piano ${planName}`);
  const body = encodeURIComponent(
    `Salve,\n\nSono interessato al piano ${planName} di ProofPress Verify.\n\nOrganizzazione: \nNome contatto: \nEmail: \nSito web: \n\nGrazie.`
  );
  return `mailto:verify@proofpress.ai?subject=${subject}&body=${body}`;
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function VerifyPricing() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">ProofPress Verify Technology</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Certifica le tue notizie.<br />
            <span className="text-cyan-400">Costruisci fiducia.</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-2">
            Notizie di Innovazione, Investimenti e Tecnologia Esclusive e 100% Verificate con tecnologia ProofPress Verify.
          </p>
          <p className="text-sm text-white/40 max-w-xl mx-auto">
            Ogni articolo genera un Verification Report con hash crittografico immutabile. Trasparenza totale, tracciabilità permanente.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Accesso pilota disponibile — attivazione manuale entro 24h</span>
          </div>
        </div>
      </section>

      {/* ── Piani ── */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.key}
                className={`relative bg-white/5 border ${plan.borderColor} rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/8 hover:scale-[1.02] ${
                  plan.popular ? "ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/10" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
                )}
                {plan.popular && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5">
                      PIÙ SCELTO
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`inline-flex items-center gap-2 ${plan.badgeColor} rounded-lg px-3 py-1.5 w-fit mb-3`}>
                    {plan.icon}
                    <span className="text-xs font-bold uppercase tracking-wider">{plan.name}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-white/40 ml-1">{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="text-white/50 text-sm leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* CTA — tutti i piani: mailto */}
                  <Button
                    asChild
                    className={`w-full mb-5 font-semibold bg-gradient-to-r ${plan.color} text-white border-0 hover:opacity-90`}
                  >
                    <a href={buildMailto(plan.name)}>
                      <Mail className="w-4 h-4 mr-2" />
                      Richiedi accesso
                    </a>
                  </Button>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Come funziona ── */}
      <section className="pb-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto pt-16">
          <h2 className="text-2xl font-bold text-center text-white mb-12">
            Come funziona ProofPress Verify
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Richiedi accesso",
                desc: "Scrivi a verify@proofpress.ai con il nome della tua testata. Il team attiva il tuo account entro 24 ore.",
              },
              {
                step: "02",
                title: "Analisi AI multi-fonte",
                desc: "Il sistema confronta il contenuto con fonti primarie, misura affidabilità, coerenza fattuale e obiettività.",
              },
              {
                step: "03",
                title: "Report certificato",
                desc: "Ricevi un Verification Report con trust score, grade e hash crittografico immutabile. Tracciabile per sempre.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-black text-cyan-500/30 mb-3">{item.step}</div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-10">Domande frequenti</h2>
          <div className="space-y-4">
            {[
              {
                q: "Come viene attivato il mio account?",
                a: "Scrivi a verify@proofpress.ai con il nome della tua organizzazione. Il team ProofPress ti contatta entro 24 ore, crea il tuo profilo e ti invia la chiave API ppv_live_... via email.",
              },
              {
                q: "Come funziona il conteggio degli articoli?",
                a: "Ogni chiamata POST /api/verify/article che produce un nuovo Verification Report conta come 1 articolo. Le letture di report già esistenti (GET /api/verify/report/:hash) non consumano quota.",
              },
              {
                q: "Posso cambiare piano in corso d'opera?",
                a: "Sì. Scrivi a verify@proofpress.ai per richiedere upgrade o downgrade. Il cambio viene applicato entro 24 ore.",
              },
              {
                q: "L'hash crittografico è davvero immutabile?",
                a: "Sì. Ogni Verification Report viene sigillato con SHA-256 e il digest viene registrato su IPFS (Pinata). Una volta pubblicato, il report non può essere alterato retroattivamente.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="pb-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-white/40 text-sm mb-2">
            Hai domande? Scrivici a{" "}
            <a href="mailto:verify@proofpress.ai" className="text-cyan-400 hover:underline">
              verify@proofpress.ai
            </a>
          </p>
          <p className="text-white/25 text-xs">
            I piani sono attivati manualmente dal team ProofPress entro 24 ore dalla richiesta.
          </p>
        </div>
      </section>
    </div>
  );
}
