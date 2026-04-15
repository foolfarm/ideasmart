/**
 * AdminPubblicita — Gestione manchette pubblicitarie dinamiche
 * Route: /admin/pubblicita
 * Funzioni: lista banner, upload immagine, toggle attivo, statistiche, impostazioni rotazione
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
  Upload, ExternalLink, RefreshCw, Image as ImageIcon
} from "lucide-react";

// ── Tipi ──────────────────────────────────────────────────────────────────────
interface Banner {
  id: number;
  name: string;
  imageUrl: string;
  clickUrl: string;
  slot: "left" | "right" | "both" | "sidebar";
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
  ctr: number | string;
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function AdminPubblicita() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  // Redirect se non admin
  if (!loading && (!user || user.role !== "admin")) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5ea] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Gestione Pubblicità</h1>
            <p className="text-sm text-[#6e6e73] mt-0.5">Manchette dinamiche ProofPress — rotazione automatica con tracking</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            ← Admin
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

          <TabsContent value="banners">
            <BannersTab />
          </TabsContent>
          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Tab Banner ────────────────────────────────────────────────────────────────
function BannersTab() {
  const utils = trpc.useUtils();
  const { data: banners, isLoading } = trpc.banners.list.useQuery();
  const toggleMut = trpc.banners.toggle.useMutation({
    onSuccess: () => utils.banners.list.invalidate(),
  });
  const deleteMut = trpc.banners.delete.useMutation({
    onSuccess: () => {
      utils.banners.list.invalidate();
      toast.success("Banner eliminato");
    },
  });

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6e6e73]">{banners?.length ?? 0} banner configurati</p>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="flex items-center gap-2">
          <Plus size={14} /> Aggiungi Banner
        </Button>
      </div>

      {showForm && (
        <AddBannerForm
          onSuccess={() => {
            setShowForm(false);
            utils.banners.list.invalidate();
            toast.success("Banner aggiunto con successo");
          }}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 text-[#6e6e73]">Caricamento...</div>
      ) : !banners?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e5ea]">
          <ImageIcon size={40} className="mx-auto text-[#aeaeb2] mb-3" />
          <p className="text-[#6e6e73] font-medium">Nessun banner configurato</p>
          <p className="text-sm text-[#aeaeb2] mt-1">Aggiungi il primo banner per iniziare la rotazione</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner: Banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onToggle={(active) => toggleMut.mutate({ id: banner.id, active })}
              onDelete={() => {
                if (confirm(`Eliminare "${banner.name}"?`)) {
                  deleteMut.mutate({ id: banner.id });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card singolo banner ───────────────────────────────────────────────────────
function BannerCard({
  banner,
  onToggle,
  onDelete,
}: {
  banner: Banner;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}) {
  const slotLabels: Record<string, string> = { left: "Manchette Sx", right: "Manchette Dx", both: "Entrambe manchette", sidebar: "Sidebar Dx" };
  const slotColors: Record<string, string> = { left: "bg-blue-100 text-blue-700", right: "bg-purple-100 text-purple-700", both: "bg-green-100 text-green-700", sidebar: "bg-orange-100 text-orange-700" };
  const slotLabel = slotLabels[banner.slot] ?? banner.slot;
  const slotColor = slotColors[banner.slot] ?? "bg-gray-100 text-gray-700";

  return (
    <div className={`bg-white rounded-2xl border ${banner.active ? "border-[#e5e5ea]" : "border-[#e5e5ea] opacity-60"} p-4 flex items-center gap-4`}>
      {/* Preview immagine */}
      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#f5f5f7] border border-[#e5e5ea]">
        <img src={banner.imageUrl} alt={banner.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-[#1d1d1f] truncate">{banner.name}</p>
          <Badge className={`text-[10px] px-2 py-0 ${slotColor}`}>{slotLabel}</Badge>
          {!banner.active && <Badge variant="secondary" className="text-[10px]">Disattivo</Badge>}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6e6e73]">
          <span>Peso: <strong>{banner.weight}/10</strong></span>
          <a href={banner.clickUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#1d1d1f] transition-colors">
            <ExternalLink size={10} /> {new URL(banner.clickUrl).hostname}
          </a>
          {banner.startsAt && <span>Dal {new Date(banner.startsAt).toLocaleDateString("it-IT")}</span>}
          {banner.endsAt && <span>Al {new Date(banner.endsAt).toLocaleDateString("it-IT")}</span>}
        </div>
      </div>

      {/* Azioni */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {banner.active ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-[#aeaeb2]" />}
          <Switch
            checked={banner.active}
            onCheckedChange={onToggle}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

// ── Form aggiunta banner ──────────────────────────────────────────────────────
function AddBannerForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageMime, setImageMime] = useState<string>("image/png");
  const [form, setForm] = useState({
    name: "",
    clickUrl: "",
    slot: "both" as "left" | "right" | "both" | "sidebar",
    weight: 5,
    active: true,
    startsAt: "",
    endsAt: "",
  });

  const createMut = trpc.banners.create.useMutation({
    onSuccess,
    onError: (e) => toast.error(e.message),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageBase64) {
      toast.error("Carica un'immagine");
      return;
    }
    createMut.mutate({
      ...form,
      imageBase64,
      imageMime,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
    });
  };

  return (
    <Card className="border-2 border-dashed border-[#007aff]/30 bg-[#007aff]/5">
      <CardHeader>
        <CardTitle className="text-base">Nuovo Banner</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload immagine */}
            <div className="space-y-2">
              <Label>Immagine banner *</Label>
              <div
                className="border-2 border-dashed border-[#e5e5ea] rounded-xl p-4 text-center cursor-pointer hover:border-[#007aff] transition-colors bg-white"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded object-contain" />
                ) : (
                  <div className="py-4">
                    <Upload size={24} className="mx-auto text-[#aeaeb2] mb-2" />
                    <p className="text-sm text-[#6e6e73]">Clicca per caricare</p>
                    <p className="text-xs text-[#aeaeb2]">PNG, JPG, WebP — max 2MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            {/* Campi */}
            <div className="space-y-3">
              <div>
                <Label>Nome banner *</Label>
                <Input
                  placeholder="es. Tradedoubler Q2 2026"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>URL destinazione *</Label>
                <Input
                  placeholder="https://..."
                  type="url"
                  value={form.clickUrl}
                  onChange={(e) => setForm({ ...form, clickUrl: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Posizione</Label>
                  <Select value={form.slot} onValueChange={(v) => setForm({ ...form, slot: v as "left" | "right" | "both" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Entrambe</SelectItem>
                      <SelectItem value="left">Solo sinistra</SelectItem>
                      <SelectItem value="right">Solo destra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Peso (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data inizio</Label>
                  <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
                </div>
                <div>
                  <Label>Data fine</Label>
                  <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>Attivo subito</Label>
            </div>
            <Button type="submit" disabled={createMut.isPending} className="flex items-center gap-2">
              {createMut.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              Aggiungi Banner
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Tab Statistiche ───────────────────────────────────────────────────────────
function StatsTab() {
  const [days, setDays] = useState(30);
  const { data: stats, isLoading } = trpc.banners.stats.useQuery({ days });
  const { data: banners } = trpc.banners.list.useQuery();

  const bannerMap = new Map((banners ?? []).map((b: Banner) => [b.id, b]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Label>Periodo:</Label>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Ultimi 7 giorni</SelectItem>
            <SelectItem value="30">Ultimi 30 giorni</SelectItem>
            <SelectItem value="90">Ultimi 90 giorni</SelectItem>
          </SelectContent>
        </Select>
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
            const ctrNum = typeof s.ctr === 'string' ? parseFloat(s.ctr) : s.ctr;
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {banner && (
                      <img src={banner.imageUrl} alt={banner.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-[#1d1d1f]">{banner?.name ?? `Banner #${s.id}`}</p>
                      <div className="flex gap-6 mt-2">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#007aff]">{s.impressions.toLocaleString("it-IT")}</p>
                          <p className="text-xs text-[#6e6e73] uppercase tracking-wide">Impression</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#34c759]">{s.clicks.toLocaleString("it-IT")}</p>
                          <p className="text-xs text-[#6e6e73] uppercase tracking-wide">Click</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#ff9500]">{ctrNum.toFixed(2)}%</p>
                          <p className="text-xs text-[#6e6e73] uppercase tracking-wide">CTR</p>
                        </div>
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
    onSuccess: () => {
      utils.banners.getSettings.invalidate();
      toast.success("Impostazioni salvate");
    },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    rotationIntervalMs: 15000,
    transition: "fade" as "fade" | "slide" | "none",
    transitionDurationMs: 400,
  });

  // Sync con dati DB
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
        <CardTitle>Impostazioni Rotazione</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>Intervallo rotazione (secondi)</Label>
          <div className="flex items-center gap-3 mt-1">
            <Input
              type="number"
              min={5}
              max={120}
              value={Math.round(form.rotationIntervalMs / 1000)}
              onChange={(e) => setForm({ ...form, rotationIntervalMs: (parseInt(e.target.value) || 15) * 1000 })}
              className="w-28"
            />
            <span className="text-sm text-[#6e6e73]">secondi tra un banner e l'altro</span>
          </div>
        </div>

        <div>
          <Label>Tipo di transizione</Label>
          <Select value={form.transition} onValueChange={(v) => setForm({ ...form, transition: v as "fade" | "slide" | "none" })}>
            <SelectTrigger className="w-40 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="none">Nessuna</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Durata transizione (ms)</Label>
          <Input
            type="number"
            min={100}
            max={2000}
            value={form.transitionDurationMs}
            onChange={(e) => setForm({ ...form, transitionDurationMs: parseInt(e.target.value) || 400 })}
            className="w-28 mt-1"
          />
        </div>

        <Button
          onClick={() => updateMut.mutate(form)}
          disabled={updateMut.isPending}
          className="flex items-center gap-2"
        >
          {updateMut.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Settings2 size={14} />}
          Salva Impostazioni
        </Button>
      </CardContent>
    </Card>
  );
}
