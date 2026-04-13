/**
 * Admin Newsletter Content — Gestione Amazon Deals e Sponsor Newsletter
 * Permette di inserire/modificare/eliminare prodotti Amazon e sponsor,
 * con rotazione giornaliera automatica nella newsletter.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

// ── Amazon Deal Form ────────────────────────────────────────────────────────
function AmazonDealForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", price: "", affiliateUrl: "",
    imageUrl: "", rating: "", reviewCount: "", category: "",
    scheduledDate: new Date().toISOString().split("T")[0],
  });
  const createMutation = trpc.admin.createAmazonDeal.useMutation({
    onSuccess: () => { toast.success("Amazon Deal aggiunto!"); setForm({ title: "", description: "", price: "", affiliateUrl: "", imageUrl: "", rating: "", reviewCount: "", category: "", scheduledDate: new Date().toISOString().split("T")[0] }); onSuccess(); },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Titolo prodotto *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400 transition-colors" style={{ fontFamily: FONT }} />
        <input placeholder="Prezzo (es. €399,00) *" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400" style={{ fontFamily: FONT }} />
        <input placeholder="Categoria" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400" style={{ fontFamily: FONT }} />
        <input placeholder="URL affiliato Amazon *" value={form.affiliateUrl} onChange={e => setForm(f => ({ ...f, affiliateUrl: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400" style={{ fontFamily: FONT }} />
        <input placeholder="URL immagine (CDN)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400" style={{ fontFamily: FONT }} />
        <input placeholder="Valutazione (es. 4.7/5)" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400" style={{ fontFamily: FONT }} />
        <input placeholder="N. recensioni (es. 1.200+)" value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400" style={{ fontFamily: FONT }} />
      </div>
      <textarea placeholder="Descrizione breve *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-orange-400 resize-none" style={{ fontFamily: FONT }} />
      <div className="flex items-center gap-3">
        <label className="text-xs" style={{ fontFamily: FONT }}>Data programmata:</label>
        <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} className="px-3 py-1.5 rounded-lg text-sm border border-white/15 bg-white/5 text-white focus:outline-none focus:border-orange-400" style={{ fontFamily: FONT }} />
      </div>
      <button
        onClick={() => {
          if (!form.title || !form.price || !form.affiliateUrl || !form.description) { toast.error("Compila i campi obbligatori"); return; }
          createMutation.mutate(form);
        }}
        disabled={createMutation.isPending}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
        style={{ background: "#f97316", color: "#fff", fontFamily: FONT }}
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
    imageUrl: "", features: "", ctaText: "Scopri di piu \u2192",
    placement: "primary" as "primary" | "spotlight",
    weight: 1,
  });
  const createMutation = trpc.admin.createSponsor.useMutation({
    onSuccess: () => { toast.success("Sponsor aggiunto!"); setForm({ name: "", headline: "", description: "", url: "", imageUrl: "", features: "", ctaText: "Scopri di piu \u2192", placement: "primary", weight: 1 }); onSuccess(); },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Nome sponsor *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400" style={{ fontFamily: FONT }} />
        <input placeholder="Headline *" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400" style={{ fontFamily: FONT }} />
        <input placeholder="URL sito sponsor *" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400" style={{ fontFamily: FONT }} />
        <input placeholder="URL immagine (CDN)" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400" style={{ fontFamily: FONT }} />
        <input placeholder="Testo CTA" value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400" style={{ fontFamily: FONT }} />
        <select value={form.placement} onChange={e => setForm(f => ({ ...f, placement: e.target.value as "primary" | "spotlight" }))} className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white focus:outline-none focus:border-cyan-400" style={{ fontFamily: FONT }}>
          <option value="primary">Primary (in alto)</option>
          <option value="spotlight">Spotlight (a meta)</option>
        </select>
      </div>
      <textarea placeholder="Descrizione breve *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 resize-none" style={{ fontFamily: FONT }} />
      <textarea placeholder='Features (una per riga, es: "Data Room con NDA")' value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 resize-none" style={{ fontFamily: FONT }} />
      <div className="flex items-center gap-3">
        <label className="text-xs" style={{ fontFamily: FONT }}>Peso rotazione:</label>
        <input type="number" min={1} max={10} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: parseInt(e.target.value) || 1 }))} className="w-20 px-3 py-1.5 rounded-lg text-sm border border-white/15 bg-white/5 text-white focus:outline-none focus:border-cyan-400" style={{ fontFamily: FONT }} />
        <span className="text-xs text-[#aeaeb2]" style={{ fontFamily: FONT }}>Piu alto = appare piu spesso</span>
      </div>
      <button
        onClick={() => {
          if (!form.name || !form.headline || !form.description || !form.url) { toast.error("Compila i campi obbligatori"); return; }
          const featuresJson = form.features.trim() ? JSON.stringify(form.features.split("\n").map(f => f.trim()).filter(Boolean)) : undefined;
          createMutation.mutate({ ...form, features: featuresJson, active: true });
        }}
        disabled={createMutation.isPending}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
        style={{ background: "#06b6d4", color: "#fff", fontFamily: FONT }}
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <p className="text-[#6e6e73] text-sm" style={{ fontFamily: FONT }}>Accesso riservato agli amministratori.</p>
      </div>
    );
  }

  const deals = dealsQuery.data ?? [];
  const sponsors = sponsorsQuery.data ?? [];
  const activeDeals = deals.filter((d: any) => d.active);
  const activeSponsors = sponsors.filter((s: any) => s.active);

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      {/* Header */}
      <div className="border-b" style={{ background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="text-sm transition-colors">
              &larr; Admin
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-bold text-white" style={{ fontFamily: FONT }}>
              Contenuti Newsletter
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}>
              {activeDeals.length} deal attivi
            </span>
            <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}>
              {activeSponsors.length} sponsor attivi
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── AMAZON DEALS ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "rgba(249,115,22,0.15)" }}>
                  🛒
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white" style={{ fontFamily: FONT }}>Amazon Deals</h2>
                  <p className="text-xs" style={{ fontFamily: FONT }}>Rotazione giornaliera automatica nella newsletter</p>
                </div>
              </div>
              <button
                onClick={() => setShowDealForm(!showDealForm)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: showDealForm ? "rgba(249,115,22,0.3)" : "rgba(249,115,22,0.15)", color: "#f97316", fontFamily: FONT }}
              >
                {showDealForm ? "Chiudi" : "+ Nuovo Deal"}
              </button>
            </div>

            {showDealForm && (
              <div className="rounded-2xl border border-orange-500/20 p-5 mb-4" style={{ background: "rgba(249,115,22,0.05)" }}>
                <AmazonDealForm onSuccess={() => { dealsQuery.refetch(); setShowDealForm(false); }} />
              </div>
            )}

            {/* Deals list */}
            <div className="space-y-3">
              {dealsQuery.isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto" />
                </div>
              ) : deals.length === 0 ? (
                <div className="rounded-2xl border border-[#e5e5ea] p-8 text-center" style={{ background: "#ffffff" }}>
                  <p className="text-[#aeaeb2] text-sm" style={{ fontFamily: FONT }}>Nessun Amazon Deal inserito.</p>
                  <p className="text-white/20 text-xs mt-1" style={{ fontFamily: FONT }}>Clicca "+ Nuovo Deal" per aggiungerne uno.</p>
                </div>
              ) : (
                deals.map((deal: any) => (
                  <div key={deal.id} className={`rounded-xl border p-4 transition-all ${deal.active ? "border-orange-500/20" : "border-[#e5e5ea] opacity-50"}`} style={{ background: deal.active ? "rgba(249,115,22,0.04)" : "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-start gap-3">
                      {deal.imageUrl && (
                        <img src={deal.imageUrl} alt={deal.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-white truncate" style={{ fontFamily: FONT }}>{deal.title}</p>
                            <p className="text-xs mt-0.5" style={{ fontFamily: FONT }}>{deal.category}</p>
                          </div>
                          <span className="text-sm font-black flex-shrink-0" style={{ color: "#f97316", fontFamily: FONT }}>{deal.price}</span>
                        </div>
                        <p className="text-xs text-[#6e6e73] mt-1 line-clamp-2" style={{ fontFamily: FONT }}>{deal.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {deal.rating && <span className="text-xs text-yellow-400">{deal.rating}</span>}
                          {deal.reviewCount && <span className="text-xs text-[#aeaeb2]">{deal.reviewCount} recensioni</span>}
                          <span className="text-xs text-white/20">Programmato: {deal.scheduledDate}</span>
                          <span className="text-xs text-white/20">Click: {deal.clickCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/5">
                      <button
                        onClick={() => toggleDealMutation.mutate({ id: deal.id, active: !deal.active })}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ color: deal.active ? "#f97316" : "#6b7280" }}
                      >
                        {deal.active ? "Disattiva" : "Attiva"}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Eliminare "${deal.title}"?`)) deleteDealMutation.mutate({ id: deal.id }); }}
                        className="text-xs px-2 py-1 rounded text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-white/20 mt-4 italic" style={{ fontFamily: FONT }}>
              I deal attivi ruotano automaticamente nella newsletter giornaliera. Se un deal ha una data programmata, viene mostrato quel giorno specifico. Altrimenti, la rotazione avviene in base all'ordine di inserimento.
            </p>
          </div>

          {/* ── SPONSOR NEWSLETTER ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "rgba(6,182,212,0.15)" }}>
                  💎
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white" style={{ fontFamily: FONT }}>Sponsor Newsletter</h2>
                  <p className="text-xs" style={{ fontFamily: FONT }}>Primary (in alto) e Spotlight (a meta) — rotazione pesata</p>
                </div>
              </div>
              <button
                onClick={() => setShowSponsorForm(!showSponsorForm)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: showSponsorForm ? "rgba(6,182,212,0.3)" : "rgba(6,182,212,0.15)", color: "#06b6d4", fontFamily: FONT }}
              >
                {showSponsorForm ? "Chiudi" : "+ Nuovo Sponsor"}
              </button>
            </div>

            {showSponsorForm && (
              <div className="rounded-2xl border border-cyan-500/20 p-5 mb-4" style={{ background: "rgba(6,182,212,0.05)" }}>
                <SponsorForm onSuccess={() => { sponsorsQuery.refetch(); setShowSponsorForm(false); }} />
              </div>
            )}

            {/* Sponsors list */}
            <div className="space-y-3">
              {sponsorsQuery.isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                </div>
              ) : sponsors.length === 0 ? (
                <div className="rounded-2xl border border-[#e5e5ea] p-8 text-center" style={{ background: "#ffffff" }}>
                  <p className="text-[#aeaeb2] text-sm" style={{ fontFamily: FONT }}>Nessuno sponsor inserito.</p>
                  <p className="text-white/20 text-xs mt-1" style={{ fontFamily: FONT }}>Clicca "+ Nuovo Sponsor" per aggiungerne uno.</p>
                </div>
              ) : (
                sponsors.map((sponsor) => (
                  <div key={sponsor.id} className={`rounded-xl border p-4 transition-all ${sponsor.active ? "border-cyan-500/20" : "border-[#e5e5ea] opacity-50"}`} style={{ background: sponsor.active ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-start gap-3">
                      {sponsor.imageUrl && (
                        <img src={sponsor.imageUrl} alt={sponsor.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-white" style={{ fontFamily: FONT }}>{sponsor.name}</p>
                            <p className="text-xs text-[#6e6e73] mt-0.5" style={{ fontFamily: FONT }}>{sponsor.headline}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${sponsor.placement === "primary" ? "bg-cyan-500/15 text-cyan-400" : "bg-purple-500/15 text-purple-400"}`}>
                            {sponsor.placement === "primary" ? "Primary" : "Spotlight"}
                          </span>
                        </div>
                        <p className="text-xs mt-1 line-clamp-2" style={{ fontFamily: FONT }}>{sponsor.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#aeaeb2]">Peso: {sponsor.weight}</span>
                          <span className="text-xs text-[#aeaeb2]">Invii: {sponsor.sendCount}</span>
                          <span className="text-xs text-[#aeaeb2]">CTA: {sponsor.ctaText}</span>
                          {sponsor.lastSentAt && <span className="text-xs text-white/20">Ultimo: {new Date(sponsor.lastSentAt).toLocaleDateString("it-IT")}</span>}
                        </div>
                        {sponsor.features && (() => {
                          try {
                            const feats = JSON.parse(sponsor.features);
                            if (Array.isArray(feats) && feats.length > 0) {
                              return (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {feats.map((f: string, i: number) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{f}</span>
                                  ))}
                                </div>
                              );
                            }
                          } catch { /* ignore */ }
                          return null;
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/5">
                      <button
                        onClick={() => toggleSponsorMutation.mutate({ id: sponsor.id, active: !sponsor.active })}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ color: sponsor.active ? "#06b6d4" : "#6b7280" }}
                      >
                        {sponsor.active ? "Disattiva" : "Attiva"}
                      </button>
                      <button
                        onClick={() => { if (confirm(`Eliminare "${sponsor.name}"?`)) deleteSponsorMutation.mutate({ id: sponsor.id }); }}
                        className="text-xs px-2 py-1 rounded text-red-400/60 hover:text-red-400 transition-colors"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-white/20 mt-4 italic" style={{ fontFamily: FONT }}>
              Gli sponsor attivi ruotano nella newsletter in base al peso. "Primary" appare in alto nella newsletter, "Spotlight" appare a meta. Piu alto il peso, piu frequentemente lo sponsor viene selezionato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
