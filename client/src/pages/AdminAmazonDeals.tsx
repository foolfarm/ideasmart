/**
 * AdminAmazonDeals — Gestione Amazon Deals
 * - Aggiunta singola deal via URL
 * - Upload massivo da file TXT/RTF (un URL per riga)
 * - Lista deals con toggle attivo/inattivo, ri-scraping, eliminazione
 * - Preview deal con immagine, prezzo, rating
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Upload, RefreshCw, Trash2, ToggleLeft, ToggleRight,
  ShoppingCart, Star, AlertCircle, CheckCircle, Clock, Loader2,
  Package, TrendingUp, Eye, EyeOff, Link2
} from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

// ─── Estrae URL da testo (TXT / RTF) ─────────────────────────────────────────
function extractUrlsFromText(text: string): string[] {
  // Rimuovi markup RTF se presente
  const clean = text
    .replace(/\{\\rtf[^}]*\}/g, "")
    .replace(/\\[a-z]+\d*\s?/g, "")
    .replace(/[{}]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const urls: string[] = [];
  const lines = clean.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Cerca URL Amazon (amzn.to, amazon.it, amazon.com, ecc.)
    const urlMatch = trimmed.match(/(https?:\/\/[^\s,;]+)/g);
    if (urlMatch) {
      for (const url of urlMatch) {
        const cleaned = url.replace(/[.,;)\]>]+$/, "");
        if (cleaned.includes("amazon") || cleaned.includes("amzn")) {
          urls.push(cleaned);
        }
      }
    }
  }
  return Array.from(new Set(urls)); // Deduplicazione
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "done") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
      <CheckCircle size={10} /> Completato
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
      <Clock size={10} /> In elaborazione
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
      <AlertCircle size={10} /> Errore scraping
    </span>
  );
}

export default function AdminAmazonDeals() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // ── Form singolo ──────────────────────────────────────────────────────────
  const [singleUrl, setSingleUrl] = useState("");
  const [singleCategory, setSingleCategory] = useState("");
  const [singleDate, setSingleDate] = useState("");

  // ── Upload massivo ────────────────────────────────────────────────────────
  const [bulkText, setBulkText] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [parsedUrls, setParsedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Queries & Mutations ───────────────────────────────────────────────────
  const { data: deals, isLoading, refetch } = trpc.amazonDeals.adminGetAll.useQuery();

  const createDeal = trpc.amazonDeals.adminCreate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSingleUrl("");
      setSingleCategory("");
      setSingleDate("");
      utils.amazonDeals.adminGetAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const bulkCreate = trpc.amazonDeals.adminBulkCreate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setBulkText("");
      setParsedUrls([]);
      setBulkCategory("");
      utils.amazonDeals.adminGetAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleDeal = trpc.amazonDeals.adminToggle.useMutation({
    onSuccess: () => utils.amazonDeals.adminGetAll.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const deleteDeal = trpc.amazonDeals.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Deal eliminato");
      utils.amazonDeals.adminGetAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rescrape = trpc.amazonDeals.adminRescrape.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => utils.amazonDeals.adminGetAll.invalidate(), 5000);
    },
    onError: (e) => toast.error(e.message),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setBulkText(text);
      const urls = extractUrlsFromText(text);
      setParsedUrls(urls);
      toast.info(`${urls.length} URL Amazon trovati nel file`);
    };
    reader.readAsText(file);
  };

  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    const urls = extractUrlsFromText(text);
    setParsedUrls(urls);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUrl.trim()) return;
    createDeal.mutate({
      affiliateUrl: singleUrl.trim(),
      category: singleCategory || undefined,
      scheduledDate: singleDate || undefined,
    });
  };

  const handleBulkSubmit = () => {
    if (parsedUrls.length === 0) {
      toast.error("Nessun URL trovato. Incolla i link Amazon o carica un file TXT/RTF");
      return;
    }
    bulkCreate.mutate({ urls: parsedUrls, category: bulkCategory || undefined });
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalDeals = deals?.length ?? 0;
  const activeDeals = deals?.filter(d => d.active).length ?? 0;
  const doneDeals = deals?.filter(d => d.scrapingStatus === "done").length ?? 0;
  const pendingDeals = deals?.filter(d => d.scrapingStatus === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ff9900] flex items-center justify-center">
              <ShoppingCart size={20} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ fontFamily: SF, fontSize: '24px', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
                Amazon Deals
              </h1>
              <p style={{ fontFamily: SF, fontSize: '13px', color: '#6e6e73' }}>
                Gestisci le offerte Amazon per il sito e la newsletter
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Totale deals", value: totalDeals, icon: Package, color: "#1d1d1f" },
            { label: "Attivi", value: activeDeals, icon: TrendingUp, color: "#34c759" },
            { label: "Completati", value: doneDeals, icon: CheckCircle, color: "#007aff" },
            { label: "In elaborazione", value: pendingDeals, icon: Clock, color: "#ff9900" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-[#e5e5ea]">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} color={color} strokeWidth={2} />
                <span style={{ fontFamily: SF, fontSize: '11px', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              </div>
              <p style={{ fontFamily: SF, fontSize: '28px', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* ── Form Singolo ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6">
            <h2 style={{ fontFamily: SF, fontSize: '16px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px' }}>
              Aggiungi Deal Singolo
            </h2>
            <form onSubmit={handleSingleSubmit} className="flex flex-col gap-3">
              <div>
                <label style={{ fontFamily: SF, fontSize: '12px', fontWeight: 600, color: '#3a3a3c', display: 'block', marginBottom: '4px' }}>
                  Link Amazon (affiliato) *
                </label>
                <Input
                  type="url"
                  placeholder="https://amzn.to/xxxxx o https://www.amazon.it/..."
                  value={singleUrl}
                  onChange={e => setSingleUrl(e.target.value)}
                  required
                  style={{ fontFamily: SF, fontSize: '13px' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontFamily: SF, fontSize: '12px', fontWeight: 600, color: '#3a3a3c', display: 'block', marginBottom: '4px' }}>
                    Categoria (opzionale)
                  </label>
                  <Input
                    placeholder="Tech, Casa, Libri..."
                    value={singleCategory}
                    onChange={e => setSingleCategory(e.target.value)}
                    style={{ fontFamily: SF, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: SF, fontSize: '12px', fontWeight: 600, color: '#3a3a3c', display: 'block', marginBottom: '4px' }}>
                    Data programmata
                  </label>
                  <Input
                    type="date"
                    value={singleDate}
                    onChange={e => setSingleDate(e.target.value)}
                    style={{ fontFamily: SF, fontSize: '13px' }}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={createDeal.isPending || !singleUrl.trim()}
                className="w-full bg-[#ff9900] hover:bg-[#e68900] text-white font-bold"
                style={{ fontFamily: SF }}
              >
                {createDeal.isPending ? (
                  <><Loader2 size={14} className="animate-spin mr-2" /> Aggiunta in corso...</>
                ) : (
                  <><Plus size={14} className="mr-2" /> Aggiungi Deal</>
                )}
              </Button>
              <p style={{ fontFamily: SF, fontSize: '11px', color: '#aeaeb2' }}>
                I metadati (titolo, immagine, prezzo) vengono recuperati automaticamente da Amazon.
              </p>
            </form>
          </div>

          {/* ── Upload Massivo ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6">
            <h2 style={{ fontFamily: SF, fontSize: '16px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px' }}>
              Caricamento Massivo
            </h2>
            <div className="flex flex-col gap-3">
              {/* Upload file */}
              <div
                className="border-2 border-dashed border-[#e5e5ea] rounded-xl p-4 text-center cursor-pointer hover:border-[#ff9900] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} color="#aeaeb2" className="mx-auto mb-2" strokeWidth={1.5} />
                <p style={{ fontFamily: SF, fontSize: '13px', fontWeight: 600, color: '#3a3a3c' }}>
                  Carica file TXT o RTF
                </p>
                <p style={{ fontFamily: SF, fontSize: '11px', color: '#aeaeb2', marginTop: '2px' }}>
                  Un URL Amazon per riga
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.rtf,.csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div style={{ fontFamily: SF, fontSize: '11px', color: '#aeaeb2', textAlign: 'center' }}>
                oppure incolla i link direttamente
              </div>

              {/* Textarea */}
              <textarea
                className="w-full border border-[#e5e5ea] rounded-xl p-3 resize-none focus:outline-none focus:border-[#ff9900] transition-colors"
                style={{ fontFamily: SF, fontSize: '12px', color: '#1d1d1f', minHeight: '100px' }}
                placeholder={"https://amzn.to/abc123\nhttps://amzn.to/def456\nhttps://www.amazon.it/..."}
                value={bulkText}
                onChange={e => handleBulkTextChange(e.target.value)}
              />

              {parsedUrls.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle size={14} color="#34c759" />
                  <span style={{ fontFamily: SF, fontSize: '12px', fontWeight: 600, color: '#1d7a3a' }}>
                    {parsedUrls.length} URL Amazon trovati
                  </span>
                </div>
              )}

              <Input
                placeholder="Categoria comune (opzionale)"
                value={bulkCategory}
                onChange={e => setBulkCategory(e.target.value)}
                style={{ fontFamily: SF, fontSize: '13px' }}
              />

              <Button
                onClick={handleBulkSubmit}
                disabled={bulkCreate.isPending || parsedUrls.length === 0}
                className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-bold"
                style={{ fontFamily: SF }}
              >
                {bulkCreate.isPending ? (
                  <><Loader2 size={14} className="animate-spin mr-2" /> Caricamento in corso...</>
                ) : (
                  <><Upload size={14} className="mr-2" /> Carica {parsedUrls.length > 0 ? `${parsedUrls.length} deal` : "deals"}</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Lista Deals ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#e5e5ea]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
            <h2 style={{ fontFamily: SF, fontSize: '16px', fontWeight: 700, color: '#1d1d1f' }}>
              Tutti i Deal ({totalDeals})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              style={{ fontFamily: SF, fontSize: '12px' }}
            >
              <RefreshCw size={12} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#aeaeb2]" />
            </div>
          ) : !deals || deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ShoppingCart size={32} color="#aeaeb2" strokeWidth={1.5} />
              <p style={{ fontFamily: SF, fontSize: '14px', color: '#aeaeb2' }}>
                Nessun deal ancora. Aggiungi il primo link Amazon!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f5f5f7]">
              {deals.map((deal) => (
                <div key={deal.id} className={`flex gap-4 p-4 hover:bg-[#fafafa] transition-colors ${!deal.active ? 'opacity-50' : ''}`}>
                  {/* Immagine */}
                  <div className="flex-shrink-0 rounded-lg overflow-hidden border border-[#f0f0f0] bg-white" style={{ width: '64px', height: '64px' }}>
                    {deal.imageUrl ? (
                      <img src={deal.imageUrl} alt={deal.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f5f5f7]">
                        <ShoppingCart size={20} color="#aeaeb2" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <StatusBadge status={deal.scrapingStatus} />
                      {deal.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f5f7] text-[#6e6e73] border border-[#e5e5ea]">
                          {deal.category}
                        </span>
                      )}
                      {deal.scheduledDate && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          📅 {deal.scheduledDate}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: SF, fontSize: '13px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1.3 }} className="line-clamp-1 mb-1">
                      {deal.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {deal.price && deal.price !== '...' && (
                        <span style={{ fontFamily: SF, fontSize: '14px', fontWeight: 800, color: '#ff9900' }}>{deal.price}</span>
                      )}
                      {deal.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={10} fill="#ff9900" color="#ff9900" />
                          <span style={{ fontFamily: SF, fontSize: '11px', color: '#6e6e73' }}>{deal.rating}</span>
                        </div>
                      )}
                      <span style={{ fontFamily: SF, fontSize: '11px', color: '#aeaeb2' }}>
                        {deal.clickCount ?? 0} click
                      </span>
                      <a
                        href={deal.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#007aff] hover:underline"
                        style={{ fontFamily: SF, fontSize: '11px' }}
                      >
                        <Link2 size={10} />
                        Link
                      </a>
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Toggle attivo */}
                    <button
                      onClick={() => toggleDeal.mutate({ id: deal.id, active: !deal.active })}
                      disabled={toggleDeal.isPending}
                      className="p-1.5 rounded-lg hover:bg-[#f5f5f7] transition-colors"
                      title={deal.active ? "Disattiva" : "Attiva"}
                    >
                      {deal.active ? (
                        <Eye size={16} color="#34c759" strokeWidth={2} />
                      ) : (
                        <EyeOff size={16} color="#aeaeb2" strokeWidth={2} />
                      )}
                    </button>

                    {/* Re-scraping */}
                    <button
                      onClick={() => rescrape.mutate({ id: deal.id })}
                      disabled={rescrape.isPending}
                      className="p-1.5 rounded-lg hover:bg-[#f5f5f7] transition-colors"
                      title="Ri-scarica metadati da Amazon"
                    >
                      <RefreshCw size={16} color="#007aff" strokeWidth={2} className={rescrape.isPending ? 'animate-spin' : ''} />
                    </button>

                    {/* Elimina */}
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare il deal "${deal.title}"?`)) {
                          deleteDeal.mutate({ id: deal.id });
                        }
                      }}
                      disabled={deleteDeal.isPending}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Elimina deal"
                    >
                      <Trash2 size={16} color="#ff3b30" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info rotazione ──────────────────────────────────────────────── */}
        <div className="mt-6 p-4 bg-[#fff8ee] border border-[#ff9900]/30 rounded-xl">
          <p style={{ fontFamily: SF, fontSize: '12px', fontWeight: 700, color: '#1d1d1f', marginBottom: '4px' }}>
            Come funziona la rotazione automatica
          </p>
          <p style={{ fontFamily: SF, fontSize: '12px', color: '#6e6e73', lineHeight: 1.6 }}>
            I deal attivi vengono ruotati automaticamente ogni giorno su tutto il sito (manchette header, sidebar, banner inline) e nella newsletter.
            La rotazione è round-robin basata sul giorno dell'anno. Se un deal ha una <strong>data programmata</strong>, viene mostrato esattamente in quel giorno.
            I metadati (titolo, immagine, prezzo, rating) vengono recuperati automaticamente da Amazon dopo l'inserimento.
          </p>
        </div>

      </div>
    </div>
  );
}
