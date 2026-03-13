/**
 * IDEASMART — Admin Newsletter Performance
 * Statistiche aperture per campagna + tabella iscritti con tracking
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtFull(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminNewsletterPerformance() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "unsubscribed">("all");
  const [filterOpened, setFilterOpened] = useState<"all" | "opened" | "never">("all");
  const [tab, setTab] = useState<"campaigns" | "subscribers">("campaigns");

  const campaignsQuery = trpc.admin.getNewsletterCampaignStats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const subscribersQuery = trpc.admin.getSubscribersWithTracking.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0f1e" }}>
        <div className="w-8 h-8 border-2 border-[#00e5c8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0f1e" }}>
        <div className="text-center">
          <p className="text-white/60 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Accesso riservato agli amministratori.
          </p>
          <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: "#00e5c8", color: "#0a0f1e" }}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const campaigns = campaignsQuery.data ?? [];
  const allSubs = subscribersQuery.data ?? [];

  // Statistiche globali
  const totalSent = campaigns.reduce((s, c) => s + (c.recipientCount ?? 0), 0);
  const totalOpened = campaigns.reduce((s, c) => s + (c.openedCount ?? 0), 0);
  const avgOpenRate = campaigns.length > 0
    ? Math.round(campaigns.reduce((s, c) => s + (c.openRate ?? 0), 0) / campaigns.length)
    : 0;
  const totalUnsubscribed = allSubs.filter(s => s.status === "unsubscribed").length;

  // Filtra iscritti
  const filtered = allSubs.filter(s => {
    const matchSearch = !search || s.email.toLowerCase().includes(search.toLowerCase()) || (s.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchOpened = filterOpened === "all"
      || (filterOpened === "opened" && s.totalOpened && s.totalOpened > 0)
      || (filterOpened === "never" && (!s.totalOpened || s.totalOpened === 0));
    return matchSearch && matchStatus && matchOpened;
  });

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e" }}>

      {/* Header */}
      <div className="border-b border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="text-white/40 hover:text-white transition-colors text-sm">
              ← Admin
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-bold" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
              Performance Newsletter
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">{user.name ?? user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Email totali inviate", value: totalSent.toLocaleString("it-IT"), color: "#00e5c8", icon: "📤" },
            { label: "Aperture totali", value: totalOpened.toLocaleString("it-IT"), color: "#00e5c8", icon: "👁" },
            { label: "Tasso apertura medio", value: `${avgOpenRate}%`, color: avgOpenRate >= 20 ? "#00e5c8" : avgOpenRate >= 10 ? "#ff9900" : "#ff5500", icon: "📊" },
            { label: "Disiscrizioni totali", value: totalUnsubscribed.toLocaleString("it-IT"), color: "#ff5500", icon: "🚫" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-black mb-1" style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/8 pb-0">
          {[
            { id: "campaigns", label: `Campagne (${campaigns.length})` },
            { id: "subscribers", label: `Iscritti (${allSubs.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "campaigns" | "subscribers")}
              className="px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: tab === t.id ? "#00e5c8" : "rgba(255,255,255,0.35)",
                borderBottomColor: tab === t.id ? "#00e5c8" : "transparent",
                background: "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: CAMPAGNE ─────────────────────────────────────────────────── */}
        {tab === "campaigns" && (
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
                ◆ Storico Campagne Newsletter
              </p>
              <button onClick={() => campaignsQuery.refetch()} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                ↻ Aggiorna
              </button>
            </div>

            {campaignsQuery.isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-[#00e5c8] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-white/30 text-sm">Nessuna campagna newsletter inviata ancora.</p>
                <p className="text-white/20 text-xs mt-2">Le statistiche appariranno dopo il primo invio.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Oggetto</th>
                      <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Data invio</th>
                      <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Inviati</th>
                      <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Aperti</th>
                      <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Tasso apertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...campaigns].reverse().map((c) => {
                      const rate = c.openRate ?? 0;
                      const rateColor = rate >= 25 ? "#00e5c8" : rate >= 15 ? "#ff9900" : rate >= 5 ? "#ffcc00" : "#ff5500";
                      return (
                        <tr key={c.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                          <td className="px-5 py-4 text-sm text-white/80 max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            <span className="line-clamp-2">{c.subject}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-white/40 text-center whitespace-nowrap">
                            {fmt(c.sentAt)}
                          </td>
                          <td className="px-5 py-4 text-sm text-white/70 text-center font-mono">
                            {(c.recipientCount ?? 0).toLocaleString("it-IT")}
                          </td>
                          <td className="px-5 py-4 text-sm text-center font-mono" style={{ color: "#00e5c8" }}>
                            {(c.openedCount ?? 0).toLocaleString("it-IT")}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-black" style={{ color: rateColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                                {rate}%
                              </span>
                              {/* Barra visuale */}
                              <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(rate, 100)}%`, background: rateColor }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ISCRITTI ─────────────────────────────────────────────────── */}
        {tab === "subscribers" && (
          <div>
            {/* Filtri */}
            <div className="flex flex-wrap gap-3 mb-5">
              <input
                type="text"
                placeholder="Cerca per email o nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#00e5c8] transition-colors w-64"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as "all" | "active" | "unsubscribed")}
                className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white focus:outline-none focus:border-[#00e5c8] transition-colors"
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Solo attivi</option>
                <option value="unsubscribed">Solo disiscritti</option>
              </select>
              <select
                value={filterOpened}
                onChange={e => setFilterOpened(e.target.value as "all" | "opened" | "never")}
                className="px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white focus:outline-none focus:border-[#00e5c8] transition-colors"
              >
                <option value="all">Tutte le aperture</option>
                <option value="opened">Ha aperto almeno 1 volta</option>
                <option value="never">Non ha mai aperto</option>
              </select>
              <span className="ml-auto text-xs text-white/30 self-center">
                {filtered.length} / {allSubs.length} iscritti
              </span>
            </div>

            <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
                  ◆ Iscritti con Tracking ({filtered.length})
                </p>
                <button onClick={() => subscribersQuery.refetch()} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                  ↻ Aggiorna
                </button>
              </div>

              {subscribersQuery.isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#00e5c8] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white/30 text-sm">Nessun iscritto trovato con i filtri selezionati.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/6">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Nome</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Stato</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Inviati</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Aperture</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Ultima apertura</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/30">Iscritto il</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((sub) => {
                        const hasOpened = sub.totalOpened && sub.totalOpened > 0;
                        const isUnsub = sub.status === "unsubscribed";
                        return (
                          <tr key={sub.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                            <td className="px-4 py-3 text-sm text-white/80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              {sub.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-white/40">{sub.name ?? "—"}</td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{
                                  background: isUnsub ? "rgba(255,85,0,0.15)" : "rgba(0,229,200,0.15)",
                                  color: isUnsub ? "#ff5500" : "#00e5c8",
                                }}
                              >
                                {isUnsub ? "Disattivato" : "Attivo"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-mono text-white/50">
                              {sub.totalSent ?? 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {hasOpened ? (
                                <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: "#00e5c8" }}>
                                  <span>👁</span>
                                  <span>{sub.totalOpened}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-white/20">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-white/35 whitespace-nowrap">
                              {fmtFull(sub.lastOpenedAt)}
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-white/30 whitespace-nowrap">
                              {fmt(sub.subscribedAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
