/**
 * ProofPress Verify — Pagina Prezzi
 *
 * Presenta i 4 piani Verify (Essential, Premiere, Professional, Custom)
 * con CTA di checkout Stripe per i piani a pagamento e form contatto per Custom.
 */
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Zap, Shield, Building2, Sparkles, ArrowRight, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";

// ── Dati piani (mirror di server/verify/stripeVerify.ts) ─────────────────────
const PLANS = [
  {
    key: "essential" as const,
    name: "Essential",
    price: "€490",
    period: "/mese",
    description: "Per testate piccole, blog e creator. Verifica fino a 100 articoli al mese con hash crittografico immutabile.",
    articlesLimit: "100 articoli/mese",
    seats: "2 account giornalista",
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
    key: "premiere" as const,
    name: "Premiere",
    price: "€990",
    period: "/mese",
    description: "Per redazioni medie e agenzie stampa. 300 articoli al mese con badge verificato sul tuo sito.",
    articlesLimit: "300 articoli/mese",
    seats: "5 account giornalista",
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
    key: "professional" as const,
    name: "Professional",
    price: "€1.470",
    period: "/mese",
    description: "Per grandi testate e gruppi editoriali. 500 articoli, white-label e SLA garantito.",
    articlesLimit: "500 articoli/mese",
    seats: "10 account giornalista",
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
    key: "custom" as const,
    name: "Custom",
    price: "Su preventivo",
    period: "",
    description: "Per grandi gruppi editoriali, agenzie di comunicazione e media company. Volume illimitato, integrazione dedicata.",
    articlesLimit: "Articoli illimitati",
    seats: "Seat illimitati",
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

// ── Componente principale ─────────────────────────────────────────────────────
export default function VerifyPricing() {
  const { user, isAuthenticated } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const createCheckout = trpc.verifyStripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Reindirizzamento al checkout", {
          description: "Apertura della pagina di pagamento Stripe...",
        });
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => {
      toast.error("Errore checkout", {
        description: err.message,
      });
    },
    onSettled: () => setLoadingPlan(null),
  });

  function handlePlanClick(planKey: "essential" | "premiere" | "professional") {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingPlan(planKey);
    createCheckout.mutate({
      plan: planKey,
      origin: window.location.origin,
    });
  }

  function handleCustomClick() {
    window.location.href = "mailto:verify@proofpress.ai?subject=Piano Custom ProofPress Verify&body=Salve, sono interessato al piano Custom di ProofPress Verify. Ecco i dettagli della mia testata: ...";
  }

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
                  {/* CTA */}
                  {plan.key === "custom" ? (
                    <Button
                      onClick={handleCustomClick}
                      variant="outline"
                      className="w-full mb-5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60 font-semibold"
                    >
                      Contattaci
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePlanClick(plan.key as "essential" | "premiere" | "professional")}
                      disabled={loadingPlan === plan.key}
                      className={`w-full mb-5 font-semibold bg-gradient-to-r ${plan.color} text-white border-0 hover:opacity-90`}
                    >
                      {loadingPlan === plan.key ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Apertura checkout...
                        </span>
                      ) : !isAuthenticated ? (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Accedi per acquistare
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Inizia con {plan.name}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  )}

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
                title: "Invia l'articolo",
                desc: "Chiama l'API REST con la tua chiave ppv_live_... e l'hash SHA-256 o l'URL dell'articolo.",
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
                q: "Posso provare prima di acquistare?",
                a: "Sì. Registrando la tua organizzazione ottieni un trial gratuito di 14 giorni con 20 verifiche incluse.",
              },
              {
                q: "Come funziona il conteggio degli articoli?",
                a: "Ogni chiamata POST /api/verify/article che produce un nuovo Verification Report conta come 1 articolo. Le letture di report già esistenti (GET /api/verify/report/:hash) non consumano quota.",
              },
              {
                q: "Posso cambiare piano in corso d'opera?",
                a: "Sì. Puoi fare upgrade o downgrade in qualsiasi momento dalla dashboard. Il cambio è immediato e il credito residuo viene proporzionalmente applicato.",
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
            I pagamenti sono gestiti in modo sicuro da Stripe. ProofPress non memorizza dati di pagamento.
          </p>
        </div>
      </section>
    </div>
  );
}
