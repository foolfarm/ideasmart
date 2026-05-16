/**
 * AdminPubblicita — Gestione manchette pubblicitarie dinamiche
 * Route: /admin/pubblicita
 * Funzioni: lista banner, upload immagine O URL esterna, toggle attivo,
 *           modifica banner esistente, statistiche, impostazioni rotazione
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Trash2, Eye, EyeOff, BarChart2, Settings2,
  Upload, ExternalLink, RefreshCw, Image as ImageIcon,
  Pencil, X, Check, Link as LinkIcon, TrendingUp
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ── Tipi ──────────────────────────────────────────────────────────────────────
interface Banner {
  id: number;
  name: string;
  imageUrl: string;
  clickUrl: string;
  slot: "left" | "right" | "both" | "sidebar" | "horizontal" | "all";
  weight: number;
  active: boolean;
  sortOrder: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
}
interface BannerStats {
  id: number;
  name: string;
  slot: string;
  active: boolean;
  impressions: number;
  clicks: number;
  newsletterClicks?: number;
  ctr: number | string;
  totalNewsletterClicks?: number;
}

const SLOT_LABELS: Record<string, string> = {
  left: "Manchette Sinistra",
  right: "Manchette Destra",
  both: "Entrambe le manchette",
  sidebar: "Sidebar Destra (300x250)",
  horizontal: "Orizzontale sotto Research (728x90)",
};
const SLOT_COLORS: Record<string, string> = {
  left: "bg-blue-100 text-blue-700",
  right: "bg-purple-100 text-purple-700",
  both: "bg-green-100 text-green-700",
  sidebar: "bg-orange-100 text-orange-700",
  horizontal: "bg-teal-100 text-teal-700",
};

// ── Componente principale ─────────────────────────────────────────────────────
export default function AdminPubblicita() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (!loading && (!user || user.role !== "admin")) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="bg-white border-b border-[#e5e5ea] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Gestione Pubblicita</h1>
            <p className="text-sm text-[#6e6e73] mt-0.5">
              Manchette dinamiche ProofPress — rotazione automatica con tracking impression/click
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            Torna Admin
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="banners">
          <TabsList className="mb-6">
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <ImageIcon size={14} /> Banner
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart2 size={14} /> Statistiche
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings2 size={14} /> Impostazioni
            </TabsTrigger>
          </TabsList>
          <TabsContent value="banners"><BannersTab /></TabsContent>
          <TabsContent value="stats"><StatsTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Tab Banner ────────────────────────────────────────────────────────────────
function BannersTab() {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const { data: banners, isLoading } = trpc.banners.list.useQuery();
  const toggleMut = trpc.banners.toggle.useMutation({
    onSuccess: () => utils.banners.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.banners.delete.useMutation({
    onSuccess: () => { utils.banners.list.invalidate(); toast.success("Banner eliminato"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-center py-12 text-[#6e6e73]">Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-[#6e6e73]">
          {banners?.length ?? 0} banner configurati — rotazione automatica in base al peso
        </p>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? <><X size={14} /> Annulla</> : <><Plus size={14} /> Nuovo Banner</>}
        </Button>
      </div>

      {showForm && (
        <BannerForm
          mode="create"
          onSuccess={() => { setShowForm(false); utils.banners.list.invalidate(); toast.success("Banner aggiunto"); }}
        />
      )}

      {!banners?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e5ea]">
          <ImageIcon size={40} className="mx-auto text-[#aeaeb2] mb-3" />
          <p className="text-[#6e6e73] font-medium">Nessun banner configurato</p>
          <p className="text-sm text-[#aeaeb2] mt-1">Aggiungi il primo banner per iniziare la rotazione</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {(banners as Banner[]).map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onToggle={(active) => toggleMut.mutate({ id: banner.id, active })}
              onDelete={() => { if (confirm(`Eliminare "${banner.name}"?`)) deleteMut.mutate({ id: banner.id }); }}
              onUpdated={() => utils.banners.list.invalidate()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card singolo banner con modifica inline ───────────────────────────────────
function BannerCard({ banner, onToggle, onDelete, onUpdated }: {
  banner: Banner;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <BannerForm
        mode="edit"
        initialData={banner}
        onSuccess={() => { setEditing(false); onUpdated(); toast.success("Banner aggiornato"); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className={`bg-white rounded-2xl border ${banner.active ? "border-[#e5e5ea]" : "border-[#e5e5ea] opacity-60"} p-4 flex items-center gap-4`}>
      <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-[#f5f5f7] border border-[#e5e5ea]">
        <img src={banner.imageUrl} alt={banner.name} className="w-full h-full object-contain p-1" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-semibold text-[#1d1d1f] truncate">{banner.name}</p>
          <Badge className={`text-[10px] px-2 py-0 ${SLOT_COLORS[banner.slot] ?? "bg-gray-100 text-gray-700"}`}>
            {SLOT_LABELS[banner.slot] ?? banner.slot}
          </Badge>
          {(banner as any).siteTarget === "it" && (
            <Badge className="text-[10px] px-2 py-0 bg-green-100 text-green-700">🇮🇹 Solo IT</Badge>
          )}
          {(banner as any).siteTarget === "en" && (
            <Badge className="text-[10px] px-2 py-0 bg-blue-100 text-blue-700">🇬🇧 Solo EN</Badge>
          )}
          {!banner.active && <Badge variant="secondary" className="text-[10px]">Disattivo</Badge>}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6e6e73] flex-wrap">
          <span>Peso: <strong>{banner.weight}/10</strong></span>
          <a href={banner.clickUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#1d1d1f] transition-colors">
            <ExternalLink size={10} />
            {(() => { try { return new URL(banner.clickUrl).hostname; } catch { return banner.clickUrl; } })()}
          </a>
          {banner.startsAt && <span>Dal {new Date(banner.startsAt).toLocaleDateString("it-IT")}</span>}
          {banner.endsAt && <span>Al {new Date(banner.endsAt).toLocaleDateString("it-IT")}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}
          className="text-[#007aff] hover:text-[#0056b3] hover:bg-blue-50 p-2" title="Modifica">
          <Pencil size={14} />
        </Button>
        <div className="flex items-center gap-1">
          {banner.active ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-[#aeaeb2]" />}
          <Switch checked={banner.active} onCheckedChange={onToggle} />
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2" title="Elimina">
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

// ── Form unificato: crea o modifica banner ────────────────────────────────────
type ImageMode = "upload" | "url";

function BannerForm({ mode, initialData, onSuccess, onCancel }: {
  mode: "create" | "edit";
  initialData?: Banner;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [preview, setPreview] = useState<string | null>(initialData?.imageUrl ?? null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageMime, setImageMime] = useState<string>("image/png");
  const [externalUrl, setExternalUrl] = useState<string>("");

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    clickUrl: initialData?.clickUrl ?? "",
    slot: (initialData?.slot ?? "both") as "left" | "right" | "both" | "sidebar" | "horizontal" | "all",
    weight: initialData?.weight ?? 5,
    active: initialData?.active ?? true,
    startsAt: initialData?.startsAt ? new Date(initialData.startsAt).toISOString().split("T")[0] : "",
    endsAt: initialData?.endsAt ? new Date(initialData.endsAt).toISOString().split("T")[0] : "",
    siteTarget: ((initialData as any)?.siteTarget ?? "both") as "it" | "en" | "both",
  });

  const createMut = trpc.banners.create.useMutation({ onSuccess, onError: (e) => toast.error(e.message) });
  const updateMut = trpc.banners.update.useMutation({ onSuccess, onError: (e) => toast.error(e.message) });

  // Auto-resize: ridimensiona l'immagine via canvas prima dell'upload
  // Mantiene le proporzioni originali, max 1600px su lato lungo
  const resizeImage = (file: File, maxPx = 1600): Promise<{ base64: string; mime: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const { naturalWidth: w, naturalHeight: h } = img;
          const scale = Math.min(1, maxPx / Math.max(w, h));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
          const quality = mime === "image/jpeg" ? 0.88 : undefined;
          const base64 = canvas.toDataURL(mime, quality);
          resolve({ base64, mime });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Immagine troppo grande (max 10MB)"); return; }
    toast.info("Ridimensionamento immagine in corso...");
    try {
      const { base64, mime } = await resizeImage(file);
      setImageMime(mime);
      setPreview(base64);
      setImageBase64(base64);
      // Mostra dimensioni finali
      const kb = Math.round(base64.length * 0.75 / 1024);
      toast.success(`Immagine pronta (${kb} KB dopo resize)`);
    } catch {
      toast.error("Errore nel processare l'immagine");
    }
  };

  const handleExternalUrlChange = (url: string) => {
    setExternalUrl(url);
    if (url.startsWith("http")) setPreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasUpload = imageMode === "upload" && imageBase64;
    const hasExtUrl = imageMode === "url" && externalUrl.startsWith("http");
    const hasExistingImage = mode === "edit" && initialData?.imageUrl;
    if (!hasUpload && !hasExtUrl && !hasExistingImage) {
      toast.error("Carica un'immagine o inserisci un URL immagine");
      return;
    }
    if (mode === "create") {
      createMut.mutate({
        ...form,
        imageBase64: hasUpload ? imageBase64 : undefined,
        imageMime: hasUpload ? imageMime : undefined,
        imageUrl: hasExtUrl ? externalUrl : undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      });
    } else {
      updateMut.mutate({
        id: initialData!.id,
        ...form,
        imageBase64: hasUpload ? imageBase64 : undefined,
        imageMime: hasUpload ? imageMime : undefined,
        imageUrl: hasExtUrl ? externalUrl : undefined,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const isEdit = mode === "edit";

  return (
    <Card className={`border-2 ${isEdit ? "border-[#ff9500]/30 bg-[#ff9500]/5" : "border-dashed border-[#007aff]/30 bg-[#007aff]/5"}`}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {isEdit ? <><Pencil size={16} /> Modifica: {initialData?.name}</> : <><Plus size={16} /> Nuovo Banner</>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Sezione immagine */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Immagine banner *</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setImageMode("upload")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${imageMode === "upload" ? "bg-[#007aff] text-white" : "bg-white border border-[#e5e5ea] text-[#6e6e73] hover:border-[#007aff]"}`}>
                <Upload size={12} /> Carica file
              </button>
              <button type="button" onClick={() => setImageMode("url")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${imageMode === "url" ? "bg-[#007aff] text-white" : "bg-white border border-[#e5e5ea] text-[#6e6e73] hover:border-[#007aff]"}`}>
                <LinkIcon size={12} /> URL esterna
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {imageMode === "upload" ? (
                  <div>
                    <div className="border-2 border-dashed border-[#e5e5ea] rounded-xl p-4 text-center cursor-pointer hover:border-[#007aff] transition-colors bg-white min-h-[120px] flex items-center justify-center"
                      onClick={() => fileRef.current?.click()}>
                      {preview && imageBase64 ? (
                        <img src={preview} alt="Preview" className="max-h-28 mx-auto rounded object-contain" />
                      ) : (
                        <div>
                          <Upload size={24} className="mx-auto text-[#aeaeb2] mb-2" />
                          <p className="text-sm text-[#6e6e73]">Clicca per caricare</p>
                          <p className="text-xs text-[#aeaeb2]">PNG, JPG, WebP — max 10MB</p>
                          <p className="text-xs text-[#aeaeb2]">Auto-resize a 1600px</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                    {imageBase64 && (
                      <button type="button" className="mt-1 text-xs text-[#aeaeb2] hover:text-red-500"
                        onClick={() => { setImageBase64(""); setPreview(isEdit ? initialData?.imageUrl ?? null : null); }}>
                        Rimuovi
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input placeholder="https://cdn.example.com/banner.png" value={externalUrl}
                      onChange={(e) => handleExternalUrlChange(e.target.value)} type="url" />
                    <p className="text-xs text-[#6e6e73]">Incolla l'URL dell'immagine gia ospitata su CDN o server esterno</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-center">
                {preview ? (
                  <div className="text-center">
                    <p className="text-xs text-[#6e6e73] mb-2 uppercase tracking-wide">Preview</p>
                    <img src={preview} alt="Preview banner"
                      className="max-h-36 max-w-full rounded-xl border border-[#e5e5ea] object-contain bg-white p-2" />
                  </div>
                ) : (
                  <div className="text-center text-[#aeaeb2]">
                    <ImageIcon size={32} className="mx-auto mb-1" />
                    <p className="text-xs">Anteprima</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Campi testo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome banner *</Label>
              <Input placeholder="es. Tradedoubler Q2 2026" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>URL destinazione (click) *</Label>
              <Input placeholder="https://..." type="url" value={form.clickUrl}
                onChange={(e) => setForm({ ...form, clickUrl: e.target.value })} required className="mt-1" />
            </div>
          </div>

          {/* Slot e peso */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label>Posizione slot</Label>
              <Select value={form.slot} onValueChange={(v) => setForm({ ...form, slot: v as "left" | "right" | "both" | "sidebar" | "horizontal" | "all" })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Entrambe le manchette (header sx + dx)</SelectItem>
                  <SelectItem value="all">Entrambe manchette + Sidebar 300x250</SelectItem>
                  <SelectItem value="left">Solo manchette sinistra</SelectItem>
                  <SelectItem value="right">Solo manchette destra</SelectItem>
                  <SelectItem value="sidebar">Sidebar destra 300x250</SelectItem>
                  <SelectItem value="horizontal">Orizzontale sotto Research 728x90</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6e6e73] mt-1">
                {form.slot === "both" && "Apparirà in entrambe le manchette dell'header (sx + dx)"}
                {form.slot === "all" && "Manchette sx + dx (header) E sidebar destra 300x250 — massima visibilità"}
                {form.slot === "left" && "Manchette sinistra dell'header (160x160)"}
                {form.slot === "right" && "Manchette destra dell'header (160x160)"}
                {form.slot === "sidebar" && "Colonna destra della home, sotto ProofPress Verify (300x250)"}
                {form.slot === "horizontal" && "Banner orizzontale sotto la sezione Research (720x90)"}
              </p>
            </div>
            <div>
              <Label>Peso rotazione (1-10)</Label>
              <Input type="number" min={1} max={10} value={form.weight}
                onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 5 })} className="mt-1" />
              <p className="text-xs text-[#6e6e73] mt-1">Peso piu alto = appare piu spesso</p>
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2 pb-1">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>{form.active ? "Attivo" : "Disattivo"}</Label>
              </div>
            </div>
          </div>

          {/* Targeting sito */}
          <div className="col-span-2">
            <Label className="flex items-center gap-1.5">
              <span>🌍</span> Targeting sito
            </Label>
            <Select value={form.siteTarget} onValueChange={(v) => setForm({ ...form, siteTarget: v as "it" | "en" | "both" })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">🌍 Entrambi i siti (proofpress.ai + proofpress.biz)</SelectItem>
                <SelectItem value="it">🇮🇹 Solo sito italiano (proofpress.ai)</SelectItem>
                <SelectItem value="en">🇬🇧 Solo sito inglese (proofpress.biz)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#6e6e73] mt-1">
              {form.siteTarget === "both" && "Il banner apparirà su proofpress.ai (IT) e proofpress.biz (EN)"}
              {form.siteTarget === "it" && "Il banner apparirà solo su proofpress.ai — sito in italiano"}
              {form.siteTarget === "en" && "Il banner apparirà solo su proofpress.biz — sito in inglese"}
            </p>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data inizio (opzionale)</Label>
              <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Data fine (opzionale)</Label>
              <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className="mt-1" />
            </div>
          </div>

          {/* Pulsanti */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e5e5ea]">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
                <X size={14} /> Annulla
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex items-center gap-2">
              {isPending ? <RefreshCw size={14} className="animate-spin" /> : isEdit ? <Check size={14} /> : <Plus size={14} />}
              {isEdit ? "Salva Modifiche" : "Aggiungi Banner"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─// ── Colori per le linee del grafico ────────────────────────────────────────────────
const LINE_COLORS = ["#af52de", "#007aff", "#34c759", "#ff9500", "#ff3b30", "#5856d6", "#ff2d55", "#00c7be"];

// ── Grafico click newsletter per giorno ──────────────────────────────────────────────
function BannerClicksChart({ days }: { days: number }) {
  const { data: perDay, isLoading } = trpc.banners.statsPerDay.useQuery({ days });

  if (isLoading) return <div className="text-center py-8 text-[#6e6e73] text-sm">Caricamento grafico...</div>;
  if (!perDay || perDay.length === 0) {
    return (
      <div className="text-center py-10 text-[#aeaeb2]">
        <TrendingUp size={32} className="mx-auto mb-2" />
        <p className="text-sm">Nessun click newsletter registrato nel periodo</p>
        <p className="text-xs mt-1">I dati appariranno dopo il primo invio massivo</p>
      </div>
    );
  }

  // Costruisce dataset unificato per giorno (asse X)
  const allDays = Array.from(
    new Set(perDay.flatMap((b) => b.data.map((d) => d.day)))
  ).sort();

  const chartData = allDays.map((day) => {
    const row: Record<string, string | number> = { day };
    perDay.forEach((b) => {
      const found = b.data.find((d) => d.day === day);
      row[b.bannerName] = found?.clicks ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6e6e73" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6e6e73" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#fff", border: "1px solid #e5e5ea", borderRadius: 8, fontSize: 12 }}
          formatter={(value: number, name: string) => [value, name]}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {perDay.map((b, i) => (
          <Line
            key={b.bannerId}
            type="monotone"
            dataKey={b.bannerName}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Tab Statistiche ───────────────────────────────────────────────────
function StatsTab() {
  const [days, setDays] = useState(30);
  const { data: stats, isLoading, refetch } = trpc.banners.stats.useQuery({ days });
  const { data: banners } = trpc.banners.list.useQuery();
  const bannerMap = new Map((banners as Banner[] | undefined)?.map((b) => [b.id, b]) ?? []);

  return (
    <div className="space-y-4">
      {/* Grafico click newsletter per giorno */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
            <TrendingUp size={16} className="text-[#af52de]" />
            Click Banner Newsletter per Giorno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BannerClicksChart days={days} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1d1d1f]">Performance Banner</h2>
        <div className="flex items-center gap-3">
          <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimi 7 giorni</SelectItem>
              <SelectItem value="30">Ultimi 30 giorni</SelectItem>
              <SelectItem value="90">Ultimi 90 giorni</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="flex items-center gap-2">
            <RefreshCw size={14} /> Aggiorna
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#6e6e73]">Caricamento statistiche...</div>
      ) : !stats?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e5ea]">
          <BarChart2 size={40} className="mx-auto text-[#aeaeb2] mb-3" />
          <p className="text-[#6e6e73] font-medium">Nessun dato disponibile</p>
          <p className="text-sm text-[#aeaeb2] mt-1">Le statistiche appariranno dopo le prime impression</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {(stats as BannerStats[]).map((s) => {
            const banner = bannerMap.get(s.id);
            const ctrNum = typeof s.ctr === "string" ? parseFloat(s.ctr) : s.ctr;
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {banner && (
                      <img src={banner.imageUrl} alt={banner.name}
                        className="w-16 h-16 rounded-xl object-contain bg-[#f5f5f7] p-1 flex-shrink-0 border border-[#e5e5ea]" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-[#1d1d1f]">{banner?.name ?? `Banner #${s.id}`}</p>
                        <Badge className={`text-[10px] px-2 py-0 ${SLOT_COLORS[s.slot] ?? "bg-gray-100 text-gray-700"}`}>
                          {SLOT_LABELS[s.slot] ?? s.slot}
                        </Badge>
                        {!s.active && <Badge variant="secondary" className="text-[10px]">Disattivo</Badge>}
                      </div>
                      <div className="flex gap-6 flex-wrap">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#007aff]">{s.impressions.toLocaleString("it-IT")}</p>
                          <p className="text-xs text-[#6e6e73] uppercase tracking-wide">Impression</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#34c759]">{s.clicks.toLocaleString("it-IT")}</p>
                          <p className="text-xs text-[#6e6e73] uppercase tracking-wide">Click Web</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#af52de]">{(s.newsletterClicks ?? 0).toLocaleString("it-IT")}</p>
                          <p className="text-xs text-[#6e6e73] uppercase tracking-wide">Click Newsletter</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#ff9500]">{ctrNum.toFixed(2)}%</p>
                          <p className="text-xs text-[#6e6e73] uppercase tracking-wide">CTR</p>
                        </div>
                        {(s.totalNewsletterClicks ?? 0) > 0 && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-[#af52de]">{(s.totalNewsletterClicks ?? 0).toLocaleString("it-IT")}</p>
                            <p className="text-xs text-[#6e6e73] uppercase tracking-wide">Tot. NL Click</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab Impostazioni ──────────────────────────────────────────────────────────
function SettingsTab() {
  const { data: settings, isLoading } = trpc.banners.getSettings.useQuery();
  const utils = trpc.useUtils();
  const updateMut = trpc.banners.updateSettings.useMutation({
    onSuccess: () => { utils.banners.getSettings.invalidate(); toast.success("Impostazioni salvate"); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    rotationIntervalMs: 15000,
    transition: "fade" as "fade" | "slide" | "none",
    transitionDurationMs: 400,
  });

  if (settings && form.rotationIntervalMs === 15000 && settings.rotationIntervalMs !== 15000) {
    setForm({
      rotationIntervalMs: settings.rotationIntervalMs,
      transition: settings.transition as "fade" | "slide" | "none",
      transitionDurationMs: settings.transitionDurationMs,
    });
  }

  if (isLoading) return <div className="text-center py-12 text-[#6e6e73]">Caricamento...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impostazioni Rotazione Automatica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>Intervallo rotazione (secondi)</Label>
          <div className="flex items-center gap-3 mt-1">
            <Input type="number" min={5} max={120}
              value={Math.round(form.rotationIntervalMs / 1000)}
              onChange={(e) => setForm({ ...form, rotationIntervalMs: (parseInt(e.target.value) || 15) * 1000 })}
              className="w-28" />
            <span className="text-sm text-[#6e6e73]">secondi tra un banner e l'altro</span>
          </div>
        </div>
        <div>
          <Label>Tipo di transizione</Label>
          <Select value={form.transition} onValueChange={(v) => setForm({ ...form, transition: v as "fade" | "slide" | "none" })}>
            <SelectTrigger className="w-48 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade (dissolvenza)</SelectItem>
              <SelectItem value="slide">Slide (scorrimento)</SelectItem>
              <SelectItem value="none">Nessuna transizione</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Durata transizione (millisecondi)</Label>
          <Input type="number" min={100} max={2000} value={form.transitionDurationMs}
            onChange={(e) => setForm({ ...form, transitionDurationMs: parseInt(e.target.value) || 400 })}
            className="w-28 mt-1" />
        </div>
        <Button onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending} className="flex items-center gap-2">
          {updateMut.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Settings2 size={14} />}
          Salva Impostazioni
        </Button>
      </CardContent>
    </Card>
  );
}
