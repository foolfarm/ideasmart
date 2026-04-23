/**
 * ProofPress Verify — Pannello Admin
 *
 * Gestione manuale dei clienti pilota:
 *   - Lista organizzazioni con stato, piano e consumo
 *   - Creazione nuova organizzazione (trial manuale)
 *   - Generazione API key per organizzazione
 *   - Revoca API key
 *   - Cambio piano / stato
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Key,
  Plus,
  RefreshCw,
  ShieldOff,
  Copy,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Users,
  Database,
  ExternalLink,
  Link2,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";

// ── Helpers ───────────────────────────────────────────────────────────────────
const PLAN_LABELS: Record<string, string> = {
  essential: "Essential",
  premiere: "Premiere",
  professional: "Professional",
  custom: "Custom",
};

const STATUS_COLORS: Record<string, string> = {
  trial: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  active: "bg-green-500/15 text-green-600 border-green-500/30",
  suspended: "bg-red-500/15 text-red-600 border-red-500/30",
  cancelled: "bg-gray-500/15 text-gray-500 border-gray-500/30",
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copiato negli appunti");
  });
}

// ── Componente Registro Certificazioni IPFS ─────────────────────────────────
function IpfsCertificationRegistry() {
  const { data, isLoading, refetch } = trpc.verifyOrg.listCertifications.useQuery({ limit: 100, offset: 0 });

  const gradeColor = (grade: string | null) => {
    if (!grade) return "bg-gray-100 text-gray-500";
    if (grade === "A") return "bg-green-100 text-green-700";
    if (grade === "B") return "bg-blue-100 text-blue-700";
    if (grade === "C") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <Card className="border-[#e5e5e5] shadow-none">
        <CardHeader className="pb-3 border-b border-[#f0f0f0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#6e6e73]" />
              <CardTitle className="text-sm font-bold">Registro Certificazioni IPFS</CardTitle>
              {data && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {data.pinned} pinnati
                  </span>
                  {data.pending > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      {data.pending} in attesa
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => refetch()}>
              <RefreshCw className="w-3 h-3" />
              Aggiorna
            </Button>
          </div>
          <p className="text-xs text-[#6e6e73] mt-1">
            Ogni verifica è sigillata con un hash crittografico e pinnata su IPFS via Pinata. Il CID è immutabile: garantisce che il report non sia stato alterato dopo la certificazione.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-[#6e6e73] text-center">Caricamento registro...</div>
          ) : !data || data.rows.length === 0 ? (
            <div className="p-6 text-sm text-[#6e6e73] text-center">Nessuna certificazione disponibile.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#f0f0f0]">
                    <TableHead className="text-xs text-[#6e6e73] font-medium w-8">#</TableHead>
                    <TableHead className="text-xs text-[#6e6e73] font-medium">Titolo articolo</TableHead>
                    <TableHead className="text-xs text-[#6e6e73] font-medium">Grade</TableHead>
                    <TableHead className="text-xs text-[#6e6e73] font-medium">Verify Hash</TableHead>
                    <TableHead className="text-xs text-[#6e6e73] font-medium">IPFS CID</TableHead>
                    <TableHead className="text-xs text-[#6e6e73] font-medium">Pinnato il</TableHead>
                    <TableHead className="text-xs text-[#6e6e73] font-medium">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row, i) => (
                    <TableRow key={row.id} className="border-[#f0f0f0] hover:bg-[#fafafa]">
                      <TableCell className="text-xs text-[#6e6e73]">{i + 1}</TableCell>
                      <TableCell className="text-xs text-[#1d1d1f] max-w-xs">
                        <span className="line-clamp-2">{row.title || "—"}</span>
                      </TableCell>
                      <TableCell>
                        {row.trustGrade ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeColor(row.trustGrade)}`}>
                            {row.trustGrade}
                          </span>
                        ) : <span className="text-xs text-[#6e6e73]">—</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <code className="text-xs font-mono text-[#6e6e73] bg-[#f5f5f7] px-1.5 py-0.5 rounded">
                            {row.verifyHash ? row.verifyHash.slice(0, 12) + "..." : "—"}
                          </code>
                          {row.verifyHash && (
                            <button
                              className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                              onClick={() => copyToClipboard(row.verifyHash!)}
                              title="Copia hash completo"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.ipfsCid ? (
                          <div className="flex items-center gap-1">
                            <code className="text-xs font-mono text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                              {row.ipfsCid.slice(0, 12) + "..."}
                            </code>
                            <button
                              className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
                              onClick={() => copyToClipboard(row.ipfsCid!)}
                              title="Copia CID completo"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">In attesa</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.ipfsPinnedAt ? (
                          <div className="flex items-center gap-1 text-xs text-[#6e6e73]">
                            <Clock className="w-3 h-3" />
                            {new Date(row.ipfsPinnedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        ) : <span className="text-xs text-[#6e6e73]">—</span>}
                      </TableCell>
                      <TableCell>
                        {row.ipfsCid ? (
                          <div className="flex flex-col gap-0.5">
                            {/* Link principale: pagina verifica human-readable su ProofPress */}
                            <a
                              href={`/verify/${row.ipfsCid}`}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                              title={`Apri il Verification Report su ProofPress · CID: ${row.ipfsCid}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              IPFS
                            </a>
                            {/* Link secondario: JSON raw su gateway Pinata */}
                            {row.ipfsUrl && (
                              <a
                                href={row.ipfsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#86868b] hover:underline"
                                title="JSON raw su IPFS Gateway"
                              >
                                raw JSON
                              </a>
                            )}
                          </div>
                        ) : row.ipfsUrl ? (
                          <a
                            href={row.ipfsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            title="Apri su IPFS Gateway"
                          >
                            <ExternalLink className="w-3 h-3" />
                            IPFS
                          </a>
                        ) : <span className="text-xs text-[#6e6e73]">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function AdminVerify() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect se non admin
  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  // Form stati
  const [orgForm, setOrgForm] = useState({
    name: "",
    contactEmail: "",
    contactName: "",
    domain: "",
    plan: "essential" as "essential" | "premiere" | "professional" | "custom",
    notes: "",
  });
  const [keyForm, setKeyForm] = useState({
    label: "",
    rateLimit: 100,
    expiresInDays: undefined as number | undefined,
  });
  const [updateForm, setUpdateForm] = useState({
    plan: "" as string,
    status: "" as string,
  });

  // Queries
  const { data: orgs, isLoading: orgsLoading, refetch: refetchOrgs } = trpc.verifyOrg.list.useQuery();
  const { data: stats } = trpc.verifyOrg.stats.useQuery();
  const { data: usageOverview } = trpc.verifyUsage.overview.useQuery();
  const { data: orgKeys, refetch: refetchKeys } = trpc.verifyApiKey.list.useQuery(
    { organizationId: selectedOrgId! },
    { enabled: !!selectedOrgId }
  );
  const { data: orgDetail } = trpc.verifyOrg.get.useQuery(
    { id: selectedOrgId! },
    { enabled: !!selectedOrgId }
  );

  // Mutations
  const createOrg = trpc.verifyOrg.create.useMutation({
    onSuccess: () => {
      toast.success("Organizzazione creata con trial di 14 giorni");
      setShowCreateOrg(false);
      setOrgForm({ name: "", contactEmail: "", contactName: "", domain: "", plan: "essential", notes: "" });
      refetchOrgs();
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const updateOrg = trpc.verifyOrg.update.useMutation({
    onSuccess: () => {
      toast.success("Organizzazione aggiornata");
      refetchOrgs();
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const createKey = trpc.verifyApiKey.create.useMutation({
    onSuccess: (data) => {
      setNewRawKey(data.rawKey);
      setShowCreateKey(false);
      setShowKeyDialog(true);
      setKeyForm({ label: "", rateLimit: 100, expiresInDays: undefined });
      refetchKeys();
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const revokeKey = trpc.verifyApiKey.revoke.useMutation({
    onSuccess: () => {
      toast.success("Chiave revocata");
      refetchKeys();
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const selectedOrg = orgs?.find((o) => o.id === selectedOrgId);
  const selectedUsage = usageOverview?.find((u) => u.organizationId === selectedOrgId);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e5] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f]">← Admin</a>
            <span className="text-[#d1d1d6]">/</span>
            <h1 className="text-lg font-bold text-[#1d1d1f]">ProofPress Verify — Gestione Clienti</h1>
          </div>
          <Button
            onClick={() => setShowCreateOrg(true)}
            className="bg-[#1d1d1f] text-white hover:bg-[#333] text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo cliente pilota
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Totale organizzazioni", value: stats.total, icon: <Building2 className="w-4 h-4" /> },
              { label: "Trial attivi", value: stats.byStatus?.trial ?? 0, icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
              { label: "Subscription attive", value: stats.byStatus?.active ?? 0, icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
              { label: "Piani Essential", value: stats.byPlan?.essential ?? 0, icon: <BarChart3 className="w-4 h-4" /> },
            ].map((s) => (
              <Card key={s.label} className="bg-white border-[#e5e5e5]">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 text-[#6e6e73] text-xs mb-1">
                    {s.icon}
                    {s.label}
                  </div>
                  <div className="text-2xl font-black text-[#1d1d1f]">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lista organizzazioni */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-[#e5e5e5]">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold">Organizzazioni</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => refetchOrgs()} className="h-7 w-7 p-0">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {orgsLoading ? (
                  <div className="p-4 text-sm text-[#6e6e73]">Caricamento...</div>
                ) : !orgs || orgs.length === 0 ? (
                  <div className="p-6 text-center">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-[#d1d1d6]" />
                    <p className="text-sm text-[#6e6e73]">Nessun cliente ancora.</p>
                    <p className="text-xs text-[#a1a1a6] mt-1">Clicca "Nuovo cliente pilota" per iniziare.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f0f0f0]">
                    {orgs.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => setSelectedOrgId(org.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-[#f5f5f7] transition-colors ${
                          selectedOrgId === org.id ? "bg-[#f0f0f5] border-l-2 border-[#1d1d1f]" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-[#1d1d1f] truncate">{org.name}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 border ${STATUS_COLORS[org.status] || ""}`}>
                            {org.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6e6e73]">{org.contactEmail}</span>
                          <span className="text-xs text-[#a1a1a6]">· {PLAN_LABELS[org.plan] || org.plan}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dettaglio organizzazione */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedOrgId ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-[#e5e5e5]">
                <div className="text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 text-[#d1d1d6]" />
                  <p className="text-sm text-[#6e6e73]">Seleziona un'organizzazione</p>
                </div>
              </div>
            ) : (
              <>
                {/* Info org + modifica */}
                <Card className="bg-white border-[#e5e5e5]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {selectedOrg?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[#6e6e73] text-xs">Email</span>
                        <p className="font-medium">{selectedOrg?.contactEmail}</p>
                      </div>
                      <div>
                        <span className="text-[#6e6e73] text-xs">Piano attuale</span>
                        <p className="font-medium">{PLAN_LABELS[selectedOrg?.plan || ""] || selectedOrg?.plan}</p>
                      </div>
                      {selectedUsage && (
                        <>
                          <div>
                            <span className="text-[#6e6e73] text-xs">Articoli usati</span>
                            <p className="font-medium">{selectedUsage.articlesUsed} / {selectedUsage.articlesLimit === -1 ? "∞" : selectedUsage.articlesLimit}</p>
                          </div>
                          <div>
                            <span className="text-[#6e6e73] text-xs">Scadenza periodo</span>
                            <p className="font-medium">{new Date(selectedUsage.periodEnd).toLocaleDateString("it-IT")}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Modifica piano/stato */}
                    <div className="flex gap-2 pt-2 border-t border-[#f0f0f0]">
                      <Select
                        value={updateForm.plan || selectedOrg?.plan || ""}
                        onValueChange={(v) => setUpdateForm((f) => ({ ...f, plan: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="Piano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="essential">Essential</SelectItem>
                          <SelectItem value="premiere">Premiere</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={updateForm.status || selectedOrg?.status || ""}
                        onValueChange={(v) => setUpdateForm((f) => ({ ...f, status: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="Stato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="active">Attivo</SelectItem>
                          <SelectItem value="suspended">Sospeso</SelectItem>
                          <SelectItem value="cancelled">Cancellato</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-[#1d1d1f] text-white"
                        onClick={() => {
                          if (!selectedOrgId) return;
                          updateOrg.mutate({
                            id: selectedOrgId,
                            plan: (updateForm.plan || undefined) as any,
                            status: (updateForm.status || undefined) as any,
                          });
                        }}
                        disabled={updateOrg.isPending}
                      >
                        Salva
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* API Keys */}
                <Card className="bg-white border-[#e5e5e5]">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Keys
                    </CardTitle>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-[#1d1d1f] text-white"
                      onClick={() => setShowCreateKey(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Genera chiave
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!orgKeys || orgKeys.length === 0 ? (
                      <div className="px-4 py-5 text-center">
                        <Key className="w-6 h-6 mx-auto mb-2 text-[#d1d1d6]" />
                        <p className="text-xs text-[#6e6e73]">Nessuna chiave API. Generane una per il cliente.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#f0f0f0]">
                            <TableHead className="text-xs text-[#6e6e73] font-medium">Chiave</TableHead>
                            <TableHead className="text-xs text-[#6e6e73] font-medium">Etichetta</TableHead>
                            <TableHead className="text-xs text-[#6e6e73] font-medium">Stato</TableHead>
                            <TableHead className="text-xs text-[#6e6e73] font-medium">Ultimo uso</TableHead>
                            <TableHead className="text-xs text-[#6e6e73] font-medium"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orgKeys.map((k) => (
                            <TableRow key={k.id} className="border-[#f0f0f0]">
                              <TableCell className="font-mono text-xs text-[#1d1d1f]">{k.keyPrefix}</TableCell>
                              <TableCell className="text-xs text-[#6e6e73]">{k.label || "—"}</TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] px-1.5 py-0 border ${k.isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
                                  {k.isActive ? "attiva" : "revocata"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-[#6e6e73]">
                                {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString("it-IT") : "mai"}
                              </TableCell>
                              <TableCell>
                                {k.isActive && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => revokeKey.mutate({ id: k.id })}
                                    title="Revoca chiave"
                                  >
                                    <ShieldOff className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── REGISTRO CERTIFICAZIONI IPFS ── */}
      <IpfsCertificationRegistry />

      {/* ── Dialog: Crea organizzazione ── */}
      <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Nuovo cliente pilota</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-medium">Nome organizzazione *</Label>
              <Input
                className="mt-1 h-8 text-sm"
                placeholder="es. La Repubblica"
                value={orgForm.name}
                onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Email contatto *</Label>
              <Input
                className="mt-1 h-8 text-sm"
                type="email"
                placeholder="editor@testata.it"
                value={orgForm.contactEmail}
                onChange={(e) => setOrgForm((f) => ({ ...f, contactEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Nome contatto</Label>
              <Input
                className="mt-1 h-8 text-sm"
                placeholder="Mario Rossi"
                value={orgForm.contactName}
                onChange={(e) => setOrgForm((f) => ({ ...f, contactName: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Dominio</Label>
              <Input
                className="mt-1 h-8 text-sm"
                placeholder="testata.it"
                value={orgForm.domain}
                onChange={(e) => setOrgForm((f) => ({ ...f, domain: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Piano</Label>
              <Select
                value={orgForm.plan}
                onValueChange={(v) => setOrgForm((f) => ({ ...f, plan: v as any }))}
              >
                <SelectTrigger className="mt-1 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essential">Essential (100 art/mese)</SelectItem>
                  <SelectItem value="premiere">Premiere (300 art/mese)</SelectItem>
                  <SelectItem value="professional">Professional (500 art/mese)</SelectItem>
                  <SelectItem value="custom">Custom (illimitato)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Note interne</Label>
              <Input
                className="mt-1 h-8 text-sm"
                placeholder="es. Cliente referral di Andrea"
                value={orgForm.notes}
                onChange={(e) => setOrgForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreateOrg(false)}>Annulla</Button>
            <Button
              size="sm"
              className="bg-[#1d1d1f] text-white"
              disabled={!orgForm.name || !orgForm.contactEmail || createOrg.isPending}
              onClick={() => createOrg.mutate(orgForm)}
            >
              {createOrg.isPending ? "Creazione..." : "Crea con trial 14 giorni"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Genera API key ── */}
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Genera API key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-medium">Etichetta</Label>
              <Input
                className="mt-1 h-8 text-sm"
                placeholder="es. Produzione"
                value={keyForm.label}
                onChange={(e) => setKeyForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Rate limit (articoli/mese)</Label>
              <Input
                className="mt-1 h-8 text-sm"
                type="number"
                min={1}
                max={10000}
                value={keyForm.rateLimit}
                onChange={(e) => setKeyForm((f) => ({ ...f, rateLimit: parseInt(e.target.value) || 100 }))}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Scadenza (giorni, opzionale)</Label>
              <Input
                className="mt-1 h-8 text-sm"
                type="number"
                min={1}
                placeholder="es. 30 (lascia vuoto = nessuna scadenza)"
                value={keyForm.expiresInDays ?? ""}
                onChange={(e) =>
                  setKeyForm((f) => ({
                    ...f,
                    expiresInDays: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreateKey(false)}>Annulla</Button>
            <Button
              size="sm"
              className="bg-[#1d1d1f] text-white"
              disabled={createKey.isPending || !selectedOrgId}
              onClick={() =>
                createKey.mutate({
                  organizationId: selectedOrgId!,
                  label: keyForm.label || undefined,
                  rateLimit: keyForm.rateLimit,
                  expiresInDays: keyForm.expiresInDays,
                })
              }
            >
              {createKey.isPending ? "Generazione..." : "Genera chiave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Mostra API key generata ── */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Chiave API generata
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Salvala subito — non sarà più visibile</p>
              <p className="text-xs text-amber-600">Questa è l'unica volta in cui la chiave viene mostrata in chiaro. Copiala e inviala al cliente.</p>
            </div>
            <div className="bg-[#1d1d1f] rounded-lg p-3 flex items-center gap-2">
              <code className="text-green-400 text-xs font-mono flex-1 break-all">{newRawKey}</code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white hover:bg-white/10"
                onClick={() => newRawKey && copyToClipboard(newRawKey)}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-xs text-[#6e6e73] mt-3">
              Il cliente dovrà usarla nell'header: <code className="bg-[#f5f5f7] px-1 rounded">Authorization: Bearer {newRawKey?.slice(0, 20)}...</code>
            </p>
          </div>
          <DialogFooter>
            <Button
              className="bg-[#1d1d1f] text-white w-full"
              onClick={() => {
                if (newRawKey) copyToClipboard(newRawKey);
                setShowKeyDialog(false);
                setNewRawKey(null);
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copia e chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
