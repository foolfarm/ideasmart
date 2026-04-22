/**
 * ProofPress Verify — Onboarding Self-Service
 *
 * Flusso: scegli piano → inserisci dati organizzazione → trial 14 giorni attivato.
 * Design: Apple Editorial — monochrome, clean.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { Shield, CheckCircle, Zap, Clock, ChevronRight } from "lucide-react";

const PLANS = [
  {
    id: "essential" as const,
    name: "Verify Essential",
    price: "€490",
    period: "/mese",
    articles: "100 articoli/mese",
    seats: "2 licenze portale",
    highlight: false,
  },
  {
    id: "premiere" as const,
    name: "Verify Premiere",
    price: "€990",
    period: "/mese",
    articles: "300 articoli/mese",
    seats: "5 licenze portale",
    highlight: true,
  },
  {
    id: "professional" as const,
    name: "Verify Professional",
    price: "€1.470",
    period: "/mese",
    articles: "500 articoli/mese",
    seats: "10 licenze portale",
    highlight: false,
  },
];

const FEATURES = [
  "API REST per integrazione redazionale",
  "Badge trust grade via widget embed",
  "Certificato IPFS su ogni articolo",
  "Dashboard report mensile",
  "SLA 99.5% uptime",
];

export default function VerifyJoin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [selectedPlan, setSelectedPlan] = useState<"essential" | "premiere" | "professional">("premiere");
  const [orgName, setOrgName] = useState("");
  const [domain, setDomain] = useState("");
  const [step, setStep] = useState<"plan" | "details" | "done">("plan");

  const startTrial = trpc.verifyClient.registerTrial.useMutation({
    onSuccess: () => {
      setStep("done");
    },
    onError: (err: { message: string }) => {
      toast.error("Errore: " + err.message);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-[#1d1d1f] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Accedi per iniziare</CardTitle>
            <CardDescription>
              Crea un account gratuito per attivare il trial di 14 giorni di ProofPress Verify.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href={getLoginUrl()}>Accedi o registrati</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Step: Done ────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1d1d1f]">Trial attivato!</h2>
              <p className="text-[#6e6e73] text-sm mt-1">
                Hai 14 giorni per esplorare ProofPress Verify. La tua prima chiave API è pronta nella dashboard.
              </p>
            </div>
            <div className="bg-[#f5f5f7] rounded-lg p-3 text-left space-y-1.5">
              {[
                "Genera la tua prima chiave API",
                "Integra l'endpoint nel tuo CMS",
                "Verifica il primo articolo",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                  <span className="w-5 h-5 bg-[#1d1d1f] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => navigate("/verify/dashboard")}>
              Vai alla dashboard <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#1d1d1f] hover:opacity-70 transition-opacity">
            <div className="w-7 h-7 bg-[#1d1d1f] rounded-md flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">ProofPress Verify</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#86868b]">
            <Clock className="w-3.5 h-3.5" />
            Trial gratuito 14 giorni · Nessuna carta richiesta
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <span className={step === "plan" ? "font-semibold text-[#1d1d1f]" : "text-[#86868b]"}>
            1. Scegli piano
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#d2d2d7]" />
          <span className={step === "details" ? "font-semibold text-[#1d1d1f]" : "text-[#86868b]"}>
            2. Dati organizzazione
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#d2d2d7]" />
          <span className="text-[#86868b]">3. Attivazione</span>
        </div>

        {/* ── Step 1: Piano ─────────────────────────────────────────────────── */}
        {step === "plan" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
                Scegli il piano per il tuo trial
              </h1>
              <p className="text-[#6e6e73] text-sm mt-1">
                Puoi cambiare piano in qualsiasi momento. Nessuna carta di credito richiesta per il trial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`text-left rounded-xl border-2 p-5 transition-all ${
                    selectedPlan === plan.id
                      ? "border-[#1d1d1f] bg-white shadow-md"
                      : "border-[#e5e5e5] bg-white hover:border-[#d2d2d7]"
                  } ${plan.highlight ? "relative" : ""}`}
                >
                  {plan.highlight && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs">
                      Più scelto
                    </Badge>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-semibold text-[#1d1d1f]">{plan.name}</p>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="w-4 h-4 text-[#1d1d1f] flex-shrink-0" />
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-[#1d1d1f]">{plan.price}</span>
                    <span className="text-xs text-[#86868b]">{plan.period}</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#6e6e73]">
                    <p className="font-medium text-[#1d1d1f]">{plan.articles}</p>
                    <p>{plan.seats}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Feature list */}
            <Card className="border-[#e5e5e5]">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3">
                  Incluso in tutti i piani
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1 sm:flex-none sm:px-8" onClick={() => setStep("details")}>
                Continua con {PLANS.find((p) => p.id === selectedPlan)?.name} →
              </Button>
              <Button variant="outline" asChild>
                <Link href="/proofpress-verify">Torna ai piani</Link>
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Dati organizzazione ───────────────────────────────────── */}
        {step === "details" && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
                Dati della tua organizzazione
              </h1>
              <p className="text-[#6e6e73] text-sm mt-1">
                Piano selezionato:{" "}
                <span className="font-semibold text-[#1d1d1f]">
                  {PLANS.find((p) => p.id === selectedPlan)?.name}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="org-name">Nome testata / organizzazione *</Label>
                <Input
                  id="org-name"
                  placeholder="es. Corriere della Sera Digital"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="domain">Dominio principale (opzionale)</Label>
                <Input
                  id="domain"
                  placeholder="es. corriere.it"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
                <p className="text-xs text-[#86868b]">
                  Usato per il badge di verifica sul tuo sito.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Email di contatto</Label>
                <Input value={user?.email ?? ""} disabled className="bg-[#f5f5f7]" />
                <p className="text-xs text-[#86868b]">
                  Riceverai la chiave API e le notifiche su questo indirizzo.
                </p>
              </div>
            </div>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-3 pb-3 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  <strong>Trial gratuito 14 giorni.</strong> Nessun addebito automatico.
                  Al termine del trial riceverai un link per attivare il piano scelto.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                className="flex-1 sm:flex-none sm:px-8"
                disabled={!orgName.trim() || startTrial.isPending}
                onClick={() =>
                  startTrial.mutate({
                    plan: selectedPlan,
                    orgName: orgName.trim(),
                    domain: domain.trim() || undefined,
                  })
                }
              >
                {startTrial.isPending ? "Attivazione..." : "Attiva trial gratuito →"}
              </Button>
              <Button variant="outline" onClick={() => setStep("plan")}>
                Indietro
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
