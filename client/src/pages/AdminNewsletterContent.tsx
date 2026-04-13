/**
 * Admin Newsletter Content — Amazon Deals & Sponsor Newsletter
 * Stile Apple monocromatico con AdminHeader condiviso
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import AdminHeader from "@/components/AdminHeader";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const C = {
  bg: "#f5f5f7",
  white: "#ffffff",
  black: "#1d1d1f",
  mid: "#6e6e73",
  light: "#aeaeb2",
  border: "#e5e5ea",
};

// ── Amazon Deal Form ────────────────────────────────────────────────────────
function AmazonDealForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", price: "", affiliateUrl: "",
    imageUrl: "", rating: "", reviewCount: "", category: "",
    scheduledDate: new Date().toISOString().split("T")[0],
  });
  const createMutation = trpc.admin.createAmazonDeal.useMutation({
    onSuccess: () => {
      toast.success("Amazon Deal aggiunto!");
      setForm({ title: "", description: "", price: "", affiliateUrl: "", imageUrl: "", rating: "", reviewCount: "", category: "", scheduledDate: new Date().toISOString().split("T")[0] });
      onSuccess();
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const inputCls = "px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-black/10 transition-all";
  const inputStyle = { background: C.bg, borderColor: C.border, color: C.black, fontFamily: FONT };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Titolo prodotto *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={`col-span-2 ${inputCls}`} style={inputStyle} />
        <input placeholder="Prezzo (es. €399,00) *" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls} style={inputStyle} />
        <input placeholder="Categoria" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls} style={inputStyle} />
        <input placeholder="URL affiliato Amazon *" value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} className={`col-span-2 ${inputCls}`} style={inputStyle} />
        <input placeholder="URL immagine (CDN, opzionale)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className={`col-span-2 ${inputCls}`} style={inputStyle} />
        <input placeholder="Valutazione (es. 4.7/5)" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className={inputCls} style={inputStyle} />
        <input placeholder="N. recensioni (es. 1.200+)" value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} className={inputCls} style={inputStyle} />
      </div>
      <textarea placeholder="Descrizione breve *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`w-full ${inputCls} resize-none`} style={inputStyle} />
      <div className="flex items-center gap-3">
        <label className="text-xs" style={{ color: C.mid, fontFamily: FONT }}>Data programmata:</label>
        <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} className={inputCls} style={inputStyle} />
      </div>
      <button
        onClick={() => {
          if (!form.title || !form.price || !form.affiliateUrl || !form.description) { toast.error("Compila i campi obbligatori"); return; }
          createMutation.mutate(form);
        }}
        disabled={createMutation.isPending}
        className="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        style={{ background: C.black, color: C.white, fontFamily: FONT }}
      >
        {createMutation.isPending ? "Salvataggio..." : "Aggiungi Amazon Deal"}
      </button>
    </div>
  );
}

// ── Sponsor Form ────────────────────────────────────────────────────────────
function SponsorForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", headline: "", description: "", url: "",
    imageUrl: "", features: "", ctaText: "Scopri di più →",
    placement: "primary" as "primary" | "spotlight",
    weight: 1,
  });
  const createMutation = trpc.admin.createSponsor.useMutation({
    onSuccess: () => {
      toast.success("Sponsor aggiunto!");
      setForm({ name: "", headline: "", description: "", url: "", imageUrl: "", features: "", ctaText: "Scopri di più →", placement: "primary", weight: 1 });
      onSuccess();
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const inputCls = "px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-black/10 transition-all";
  const inputStyle = { background: C.bg, borderColor: C.border, color: C.black, fontFamily: FONT };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Nome sponsor *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} style={inputStyle} />
        <input placeholder="Headline *" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} className={inputCls} style={inputStyle} />
        <input placeholder="URL sito sponsor *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className={`col-span-2 ${inputCls}`} style={inputStyle} />
        <input placeholder="URL immagine (CDN)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className={`col-span-2 ${inputCls}`} style={inputStyle} />
        <input placeholder="Testo CTA" value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} className={inputCls} style={inputStyle} />
        <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value as "primary" | "spotlight" }))} className={inputCls} style={inputStyle}>
          <option value="primary">Primary (in alto)</option>
          <option value="spotlight">Spotlight (a metà)</option>
        </select>
        <input placeholder="Feature 1, Feature 2, ..." value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className={`col-span-2 ${inputCls}`} style={inputStyle} />
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: C.mid, fontFamily: FONT }}>Peso rotazione:</label>
          <input type="number" min={1} max={10} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))} className={`w-20 ${inputCls}`} style={inputStyle} />
        </div>
      </div>
      <textarea placeholder="Descrizione breve *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`w-full ${inputCls} resize-none`} style={inputStyle} />
      <button
        onClick={() => {
          if (!form.name || !form.headline || !form.url || !form.description) { toast.error("Compila i campi obbligatori"); return; }
          const featuresJson = form.features ? JSON.stringify(form.features.split(",").map(f => f.trim()).filter(Boolean)) : "[]";
          createMutation.mutate({ ...form, features: featuresJson });
        }}
        disabled={createMutation.isPending}
        className="w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        style={{ background: C.black, color: C.white, fontFamily: FONT }}
      >
        {createMutation.isPending ? "Salvataggio..." : "Aggiungi Sponsor"}
      </button>
    </div>
  );
}

export default function AdminNewsletterContent() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showDealForm, setShowDealForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);

  const dealsQuery = trpc.admin.getAmazonDeals.useQuery(undefined, { enabled: user?.role === "admin" });
  const sponsorsQuery = trpc.admin.listSponsors.useQuery(undefined, { enabled: user?.role === "admin" });

  const deleteDealMutation = trpc.admin.deleteAmazonDeal.useMutation({
    onSuccess: () => { toast.success("Deal eliminato"); dealsQuery.refetch(); },
    onError: (err) => toast.error("Errore: " + err.message),
  });
  const toggleDealMutation = trpc.admin.updateAmazonDeal.useMutation({
    onSuccess: () => { dealsQuery.refetch(); },
    onError: (err) => toast.error("Errore: " + err.message),
  });
  const deleteSponsorMutation = trpc.admin.deleteSponsor.useMutation({
    onSuccess: () => { toast.success("Sponsor eliminato"); sponsorsQuery.refetch(); },
    onError: (err) => toast.error("Errore: " + err.message),
  });
  const toggleSponsorMutation = trpc.admin.updateSponsor.useMutation({
    onSuccess: () => { sponsorsQuery.refetch(); },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.black }} />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: C.mid, fontFamily: FONT }}>Accesso riservato agli amministratori.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: C.black, color: C.white, fontFamily: FONT }}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const deals = dealsQuery.data ?? [];
  const sponsors = sponsorsQuery.data ?? [];
  const activeDeals = deals.filter((d: any) => d.active);
  const activeSponsors = sponsors.filter((s: any) => s.active);

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: FONT }}>
      <AdminHeader title="Contenuti Newsletter" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* KPI bar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="rounded-xl px-4 py-2 border flex items-center gap-2" style={{ background: C.white, borderColor: C.border }}>
            <span className="text-lg">🛒</span>
            <div>
              <span className="text-xl font-black" style={{ color: C.black }}>{activeDeals.length}</span>
              <span className="text-xs ml-1" style={{ color: C.mid }}>deal attivi</span>
            </div>
          </div>
          <div className="rounded-xl px-4 py-2 border flex items-center gap-2" style={{ background: C.white, borderColor: C.border }}>
            <span className="text-lg">💎</span>
            <div>
              <span className="text-xl font-black" style={{ color: C.black }}>{activeSponsors.length}</span>
              <span className="text-xs ml-1" style={{ color: C.mid }}>sponsor attivi</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── AMAZON DEALS ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#fff3e0", border: `1px solid #ffe0b2` }}>
                  🛒
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: C.black, fontFamily: FONT }}>Amazon Deals</h2>
                  <p className="text-xs" style={{ color: C.mid, fontFamily: FONT }}>Rotazione giornaliera automatica</p>
                </div>
              </div>
              <button
                onClick={() => setShowDealForm(!showDealForm)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
                style={{ background: showDealForm ? "#1d1d1f" : C.white, color: showDealForm ? C.white : C.black, borderColor: C.border, fontFamily: FONT }}
              >
                {showDealForm ? "Chiudi" : "+ Nuovo Deal"}
              </button>
            </div>

            {showDealForm && (
              <div className="rounded-2xl border p-5 mb-4" style={{ background: C.white, borderColor: C.border }}>
                <AmazonDealForm onSuccess={() => { dealsQuery.refetch(); setShowDealForm(false); }} />
              </div>
            )}

            {/* Deals list */}
            <div className="space-y-3">
              {dealsQuery.isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: C.black }} />
                </div>
              ) : deals.length === 0 ? (
                <div className="rounded-2xl border p-8 text-center" style={{ background: C.white, borderColor: C.border }}>
                  <p className="text-sm" style={{ color: C.mid, fontFamily: FONT }}>Nessun Amazon Deal inserito.</p>
                  <p className="text-xs mt-1" style={{ color: C.light, fontFamily: FONT }}>Clicca "+ Nuovo Deal" per aggiungerne uno.</p>
                </div>
              ) : (
                deals.map((deal: any) => (
                  <div key={deal.id} className={`rounded-xl border p-4 transition-all ${!deal.active ? "opacity-50" : ""}`} style={{ background: C.white, borderColor: C.border }}>
                    <div className="flex items-start gap-3">
                      {deal.imageUrl && (
                        <img src={deal.imageUrl} alt={deal.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold truncate" style={{ color: C.black, fontFamily: FONT }}>{deal.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: C.mid, fontFamily: FONT }}>{deal.category}</p>
                          </div>
                          <span className="text-sm font-black flex-shrink-0" style={{ color: "#007aff", fontFamily: FONT }}>{deal.price}</span>
                        </div>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: C.mid, fontFamily: FONT }}>{deal.description}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {deal.rating && <span className="text-xs" style={{ color: "#f59e0b" }}>★ {deal.rating}</span>}
                          {deal.reviewCount && <span className="text-xs" style={{ color: C.light }}>{deal.reviewCount} recensioni</span>}
                          <span className="text-xs" style={{ color: C.light }}>Prog: {deal.scheduledDate}</span>
                          <span className="text-xs" style={{ color: C.light }}>Click: {deal.clickCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t" style={{ borderColor: C.border }}>
                      <button
                        onClick={() => toggleDealMutation.mutate({ id: deal.id, active: !deal.active })}
                        className="text-xs px-2 py-1 rounded-lg border transition-colors"
                        style={{ color: deal.active ? C.black : C.mid, borderColor: C.border, background: C.bg }}
                      >
                        {deal.active ? "Disattiva" : "Attiva"}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Eliminare "${deal.title}"?`)) deleteDealMutation.mutate({ id: deal.id }); }}
                        className="text-xs px-2 py-1 rounded-lg border transition-colors"
                        style={{ color: "#ef4444", borderColor: "#fecaca", background: "#fef2f2" }}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs mt-4 italic" style={{ color: C.light, fontFamily: FONT }}>
              I deal attivi ruotano automaticamente nella newsletter giornaliera. Se un deal ha una data programmata, viene mostrato quel giorno specifico.
            </p>
          </div>

          {/* ── SPONSOR NEWSLETTER ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#e8f5e9", border: `1px solid #c8e6c9` }}>
                  💎
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: C.black, fontFamily: FONT }}>Sponsor Newsletter</h2>
                  <p className="text-xs" style={{ color: C.mid, fontFamily: FONT }}>Primary e Spotlight — rotazione pesata</p>
                </div>
              </div>
              <button
                onClick={() => setShowSponsorForm(!showSponsorForm)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
                style={{ background: showSponsorForm ? "#1d1d1f" : C.white, color: showSponsorForm ? C.white : C.black, borderColor: C.border, fontFamily: FONT }}
              >
                {showSponsorForm ? "Chiudi" : "+ Nuovo Sponsor"}
              </button>
            </div>

            {showSponsorForm && (
              <div className="rounded-2xl border p-5 mb-4" style={{ background: C.white, borderColor: C.border }}>
                <SponsorForm onSuccess={() => { sponsorsQuery.refetch(); setShowSponsorForm(false); }} />
              </div>
            )}

            {/* Sponsors list */}
            <div className="space-y-3">
              {sponsorsQuery.isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: C.black }} />
                </div>
              ) : sponsors.length === 0 ? (
                <div className="rounded-2xl border p-8 text-center" style={{ background: C.white, borderColor: C.border }}>
                  <p className="text-sm" style={{ color: C.mid, fontFamily: FONT }}>Nessuno sponsor inserito.</p>
                  <p className="text-xs mt-1" style={{ color: C.light, fontFamily: FONT }}>Clicca "+ Nuovo Sponsor" per aggiungerne uno.</p>
                </div>
              ) : (
                sponsors.map((sponsor) => (
                  <div key={sponsor.id} className={`rounded-xl border p-4 transition-all ${!sponsor.active ? "opacity-50" : ""}`} style={{ background: C.white, borderColor: C.border }}>
                    <div className="flex items-start gap-3">
                      {sponsor.imageUrl && (
                        <img src={sponsor.imageUrl} alt={sponsor.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold" style={{ color: C.black, fontFamily: FONT }}>{sponsor.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: C.mid, fontFamily: FONT }}>{sponsor.headline}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0`} style={{
                            background: sponsor.placement === "primary" ? "#e3f2fd" : "#f3e5f5",
                            color: sponsor.placement === "primary" ? "#1565c0" : "#7b1fa2"
                          }}>
                            {sponsor.placement === "primary" ? "Primary" : "Spotlight"}
                          </span>
                        </div>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: C.mid, fontFamily: FONT }}>{sponsor.description}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs" style={{ color: C.light }}>Peso: {sponsor.weight}</span>
                          <span className="text-xs" style={{ color: C.light }}>Invii: {sponsor.sendCount}</span>
                          <span className="text-xs" style={{ color: C.light }}>CTA: {sponsor.ctaText}</span>
                          {sponsor.lastSentAt && <span className="text-xs" style={{ color: C.light }}>Ultimo: {new Date(sponsor.lastSentAt).toLocaleDateString("it-IT")}</span>}
                        </div>
                        {sponsor.features && (() => {
                          try {
                            const feats = JSON.parse(sponsor.features);
                            if (Array.isArray(feats) && feats.length > 0) {
                              return (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {feats.map((f: string, i: number) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-lg border" style={{ background: C.bg, borderColor: C.border, color: C.mid }}>{f}</span>
                                  ))}
                                </div>
                              );
                            }
                          } catch { /* ignore */ }
                          return null;
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t" style={{ borderColor: C.border }}>
                      <button
                        onClick={() => toggleSponsorMutation.mutate({ id: sponsor.id, active: !sponsor.active })}
                        className="text-xs px-2 py-1 rounded-lg border transition-colors"
                        style={{ color: sponsor.active ? C.black : C.mid, borderColor: C.border, background: C.bg }}
                      >
                        {sponsor.active ? "Disattiva" : "Attiva"}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Eliminare "${sponsor.name}"?`)) deleteSponsorMutation.mutate({ id: sponsor.id }); }}
                        className="text-xs px-2 py-1 rounded-lg border transition-colors"
                        style={{ color: "#ef4444", borderColor: "#fecaca", background: "#fef2f2" }}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs mt-4 italic" style={{ color: C.light, fontFamily: FONT }}>
              Gli sponsor attivi ruotano nella newsletter in base al peso. "Primary" appare in alto, "Spotlight" a metà. Più alto il peso, più frequentemente viene selezionato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
