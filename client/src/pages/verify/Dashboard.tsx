/**
 * ProofPress Verify — Dashboard Cliente SaaS
 *
 * Pagina protetta per l'editore che ha acquistato un piano Verify.
 * Mostra: piano attivo, consumo articoli, API key manager, documentazione rapida.
 *
 * Design: Apple Editorial — bianco/nero, monochrome, clean.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Key,
  Copy,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  FileText,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const PLAN_LABELS: Record<string, string> = {
  essential: "Verify Essential",
  premiere: "Verify Premiere",
  professional: "Verify Professional",
  custom: "Verify Custom",
};

const PLAN_COLORS: Record<string, string> = {
  essential: "bg-blue-50 text-blue-700 border-blue-200",
  premiere: "bg-orange-50 text-orange-700 border-orange-200",
  professional: "bg-purple-50 text-purple-700 border-purple-200",
  custom: "bg-gray-50 text-gray-700 border-gray-200",
  trial: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Attivo",
  trial: "Trial",
  past_due: "Pagamento scaduto",
  cancelled: "Cancellato",
};

function UsageBar({ used, limit, percent }: { used: number; limit: number; percent: number }) {
  const color =
    percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-amber-500" : "bg-[#1d1d1f]";
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[#6e6e73]">Articoli verificati questo mese</span>
        <span className="font-semibold text-[#1d1d1f]">
          {used.toLocaleString()} / {limit === -1 ? "∞" : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {percent >= 80 && limit !== -1 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Hai usato l&apos;{percent}% del tuo limite mensile.
        </p>
      )}
    </div>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function VerifyDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();


  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [showNewKeyValue, setShowNewKeyValue] = useState(false);
  const [revokeConfirmId, setRevokeConfirmId] = useState<number | null>(null);

  // ── tRPC queries ──────────────────────────────────────────────────────────
  const { data: orgData, isLoading: orgLoading, refetch: refetchOrg } = trpc.verifyClient.myOrg.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: apiKeys, isLoading: keysLoading, refetch: refetchKeys } = trpc.verifyClient.myApiKeys.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createKey = trpc.verifyClient.createApiKey.useMutation({
    onSuccess: (data) => {
      setNewKeyValue(data.rawKey);
      setShowNewKeyValue(true);
      setNewKeyLabel("");
      refetchKeys();
      toast.success("Chiave API generata — salvala subito: non sarà più visibile.");
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  const revokeKey = trpc.verifyClient.revokeApiKey.useMutation({
    onSuccess: () => {
      setRevokeConfirmId(null);
      refetchKeys();
      toast.success("Chiave revocata — non è più utilizzabile.");
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  // ── Auth guard ────────────────────────────────────────────────────────────
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
            <CardTitle>Accesso richiesto</CardTitle>
            <CardDescription>Accedi per visualizzare la tua dashboard Verify.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href={getLoginUrl()}>Accedi</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── No org: redirect to onboarding ───────────────────────────────────────
  if (!orgLoading && !orgData) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-[#1d1d1f] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Attiva ProofPress Verify</CardTitle>
            <CardDescription>
              Non hai ancora un&apos;organizzazione Verify. Avvia il trial gratuito di 14 giorni.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href="/verify/join">Inizia il trial gratuito →</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/proofpress-verify">Scopri i piani</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { org, usage } = orgData ?? {};
  const planLabel = usage?.plan ? PLAN_LABELS[usage.plan] ?? usage.plan : "—";
  const statusLabel = usage?.status ? STATUS_LABELS[usage.status] ?? usage.status : "—";
  const planColorClass = usage?.plan
    ? PLAN_COLORS[usage.status === "trial" ? "trial" : usage.plan] ?? ""
    : "";

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[#1d1d1f] hover:opacity-70 transition-opacity">
              <div className="w-7 h-7 bg-[#1d1d1f] rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight">ProofPress Verify</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <span className="text-sm text-[#6e6e73]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6e6e73] hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/proofpress-verify">Piani</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* ── Welcome ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            {org?.name ?? "La tua organizzazione"}
          </h1>
          <p className="text-[#6e6e73] text-sm mt-1">{org?.domain ?? org?.contactEmail}</p>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Piano */}
          <Card className="border-[#e5e5e5]">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-[#86868b] uppercase tracking-widest mb-2">Piano attivo</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#1d1d1f]">{planLabel}</span>
              </div>
              <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${planColorClass}`}>
                {statusLabel}
              </span>
            </CardContent>
          </Card>

          {/* Consumo */}
          <Card className="border-[#e5e5e5] sm:col-span-2">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-[#86868b] uppercase tracking-widest mb-3">Consumo mensile</p>
              {usage ? (
                <UsageBar
                  used={usage.articlesUsed}
                  limit={usage.articlesLimit}
                  percent={usage.percentUsed}
                />
              ) : (
                <p className="text-sm text-[#86868b]">Nessuna subscription attiva.</p>
              )}
              {usage && (
                <p className="text-xs text-[#86868b] mt-2">
                  Periodo:{" "}
                  {new Date(usage.periodStart).toLocaleDateString("it-IT")} →{" "}
                  {new Date(usage.periodEnd).toLocaleDateString("it-IT")}
                  {usage.status === "trial" && (
                    <span className="ml-2 text-amber-600 font-medium">
                      · {usage.daysRemaining} giorni al termine del trial
                    </span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── API Key Manager ───────────────────────────────────────────────── */}
        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#1d1d1f]" />
                <CardTitle className="text-base">Chiavi API</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={() => setShowNewKeyDialog(true)}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuova chiave
              </Button>
            </div>
            <CardDescription className="text-xs">
              Usa le chiavi API per integrare ProofPress Verify nel tuo CMS o workflow redazionale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {keysLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-[#f5f5f7] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !apiKeys || apiKeys.length === 0 ? (
              <div className="text-center py-8 text-[#86868b]">
                <Key className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nessuna chiave API. Creane una per iniziare.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      key.isActive ? "border-[#e5e5e5] bg-white" : "border-[#f0f0f0] bg-[#fafafa] opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${key.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-[#1d1d1f] bg-[#f5f5f7] px-2 py-0.5 rounded">
                            {key.keyPrefix}
                          </code>
                          {key.label && (
                            <span className="text-xs text-[#6e6e73] truncate">{key.label}</span>
                          )}
                        </div>
                        <p className="text-xs text-[#86868b] mt-0.5">
                          Creata {new Date(key.createdAt).toLocaleDateString("it-IT")}
                          {key.lastUsedAt && (
                            <> · Usata {new Date(key.lastUsedAt).toLocaleDateString("it-IT")}</>
                          )}
                          {!key.isActive && key.revokedAt && (
                            <> · Revocata {new Date(key.revokedAt).toLocaleDateString("it-IT")}</>
                          )}
                        </p>
                      </div>
                    </div>
                    {key.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        onClick={() => setRevokeConfirmId(key.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Quick Start ───────────────────────────────────────────────────── */}
        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1d1d1f]" />
              <CardTitle className="text-base">Integrazione rapida</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Invia un articolo all&apos;API REST per ottenere il trust score e il certificato IPFS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-[#1d1d1f] rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono leading-relaxed whitespace-pre">{`curl -X POST https://proofpress.ai/api/verify/article \\
  -H "Authorization: Bearer ppv_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Titolo articolo",
    "content": "Testo completo...",
    "url": "https://tuodominio.it/articolo"
  }'`}</pre>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Zap, label: "Risposta in < 60s", desc: "Trust score + claim analysis" },
                { icon: Shield, label: "Certificato IPFS", desc: "Hash crittografico immutabile" },
                { icon: CheckCircle, label: "Badge embed", desc: "Widget per il tuo sito" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-2 p-3 bg-[#f5f5f7] rounded-lg">
                  <Icon className="w-4 h-4 text-[#1d1d1f] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1d1d1f]">{label}</p>
                    <p className="text-xs text-[#86868b]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Upgrade CTA (se trial) ────────────────────────────────────────── */}
        {usage?.status === "trial" && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-5 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Trial attivo — {usage.daysRemaining} giorni rimanenti
                  </p>
                  <p className="text-xs text-amber-700">
                    Attiva un piano per continuare a usare ProofPress Verify dopo il trial.
                  </p>
                </div>
              </div>
              <Button size="sm" asChild className="flex-shrink-0">
                <Link href="/proofpress-verify#pricing">
                  Scegli un piano <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* ── Dialog: Nuova chiave API ──────────────────────────────────────────── */}
      <Dialog open={showNewKeyDialog} onOpenChange={(open) => {
        if (!open) { setShowNewKeyDialog(false); setNewKeyValue(null); setShowNewKeyValue(false); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Genera nuova chiave API</DialogTitle>
            <DialogDescription>
              La chiave verrà mostrata una sola volta. Salvala in un posto sicuro.
            </DialogDescription>
          </DialogHeader>
          {!newKeyValue ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="key-label">Etichetta (opzionale)</Label>
                <Input
                  id="key-label"
                  placeholder="es. Integrazione WordPress"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => createKey.mutate({ label: newKeyLabel || undefined })}
                  disabled={createKey.isPending}
                >
                  {createKey.isPending ? "Generazione..." : "Genera chiave"}
                </Button>
                <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 font-medium mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Copia e salva questa chiave subito — non sarà più visibile.
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-white border border-amber-200 rounded px-2 py-1.5 flex-1 break-all">
                    {showNewKeyValue ? newKeyValue : "ppv_live_" + "•".repeat(20)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewKeyValue(!showNewKeyValue)}
                  >
                    {showNewKeyValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(newKeyValue!);
                      toast.success("Copiata negli appunti");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => { setShowNewKeyDialog(false); setNewKeyValue(null); setShowNewKeyValue(false); }}>
                Ho salvato la chiave
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Conferma revoca ───────────────────────────────────────────── */}
      <Dialog open={revokeConfirmId !== null} onOpenChange={(open) => { if (!open) setRevokeConfirmId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Revocare la chiave?</DialogTitle>
            <DialogDescription>
              La chiave verrà disattivata immediatamente. Tutte le integrazioni che la usano smetteranno di funzionare.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => revokeConfirmId && revokeKey.mutate({ id: revokeConfirmId })}
              disabled={revokeKey.isPending}
            >
              {revokeKey.isPending ? "Revoca..." : "Sì, revoca"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setRevokeConfirmId(null)}>
              Annulla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
