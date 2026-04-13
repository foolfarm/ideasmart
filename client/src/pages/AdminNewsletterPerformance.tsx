/**
 * IDEASMART — Admin Newsletter Performance
 * Statistiche reali da SendGrid API + tabella iscritti con tracking
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import AdminHeader from "@/components/AdminHeader";

const C = {
  bg: "#f5f5f7",
  white: "#ffffff",
  black: "#1d1d1f",
  gray1: "#6e6e73",
  gray2: "#aeaeb2",
  border: "#e5e5ea",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

function fmt(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtFull(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function KpiCard({ icon, label, value, sub, highlight = false }: {
  icon: string; label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl p-5 border" style={{ background: C.white, borderColor: C.border }}>
      <div className="text-2xl mb-2">{icon}</div>
      <div
        className="text-3xl font-black mb-1 tabular-nums"
        style={{ color: highlight ? "#007aff" : C.black, fontFamily: C.font }}
      >
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray1 }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: C.gray2 }}>{sub}</div>}
    </div>
  );
}

export default function AdminNewsletterPerformance() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "unsubscribed">("all");
  const [filterOpened, setFilterOpened] = useState<"all" | "opened" | "never">("all");
  const [filterChannel, setFilterChannel] = useState<"all" | "ai" | "startup">("all");
  const [tab, setTab] = useState<"sendgrid" | "campaigns" | "subscribers">("sendgrid");
  const [sgDays, setSgDays] = useState(90);

  const sgQuery = trpc.adminTools.getSendgridSummary.useQuery(
    { days: sgDays },
    { enabled: user?.role === "admin" }
  );
  const creditsQuery = trpc.adminTools.getSendgridCredits.useQuery(undefined, {
    enabled: user?.role === "admin",
    staleTime: 1000 * 60 * 30, // 30 min cache
  });
  const campaignsQuery = trpc.admin.getNewsletterCampaignStats.useQuery(undefined, {
    enabled: user?.role === "admin"
  });
  const subscribersQuery = trpc.admin.getSubscribersWithTracking.useQuery(undefined, {
    enabled: user?.role === "admin"
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
          <p className="mb-4 text-sm" style={{ color: C.gray1, fontFamily: C.font }}>Accesso riservato agli amministratori.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: C.black, color: C.white }}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const sg = sgQuery.data;
  const credits = creditsQuery.data;
  const campaigns = campaignsQuery.data ?? [];
  const allSubs = subscribersQuery.data ?? [];

  // Statistiche iscritti per canale
  const CHANNELS = [
    { key: "ai", label: "AI" },
    { key: "startup", label: "Startup" },
  ] as const;
  const channelStats = CHANNELS.map(ch => ({
    ...ch,
    count: allSubs.filter(s => s.status === "active" && (s.parsedChannels as string[] ?? []).includes(ch.key)).length
  }));

  // Filtra iscritti
  const filtered = allSubs.filter(s => {
    const matchSearch = !search || s.email.toLowerCase().includes(search.toLowerCase()) || (s.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchOpened = filterOpened === "all"
      || (filterOpened === "opened" && s.totalOpened && s.totalOpened > 0)
      || (filterOpened === "never" && (!s.totalOpened || s.totalOpened === 0));
    const matchChannel = filterChannel === "all" || (s.parsedChannels as string[] ?? []).includes(filterChannel);
    return matchSearch && matchStatus && matchOpened && matchChannel;
  });

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.font }}>

      <AdminHeader title="Performance Newsletter" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Iscritti per canale */}
        <div className="rounded-2xl border p-5 mb-6" style={{ background: C.white, borderColor: C.border }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.gray1 }}>Iscritti attivi per canale</p>
          <div className="flex gap-4">
            {channelStats.map(ch => (
              <div key={ch.key} className="text-center">
                <div className="text-3xl font-black" style={{ color: C.black, fontFamily: C.font }}>{ch.count.toLocaleString("it-IT")}</div>
                <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: C.gray1 }}>{ch.label}</div>
              </div>
            ))}
            <div className="text-center ml-4">
              <div className="text-3xl font-black" style={{ color: C.black, fontFamily: C.font }}>
                {allSubs.filter(s => s.status === "active").length.toLocaleString("it-IT")}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: C.gray1 }}>Totale attivi</div>
            </div>
          </div>
        </div>

        {/* Piano SendGrid */}
        {credits && credits.success && (
          <div className="rounded-2xl border p-5 mb-6" style={{ background: C.white, borderColor: C.border }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.gray1 }}>Piano SendGrid — Utilizzo Mensile</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#e3f2fd', color: '#1565c0' }}>
                {credits.plan?.toUpperCase()} · Rep. {credits.reputation}%
              </span>
            </div>
            <div className="flex items-center gap-6 mb-3">
              <div>
                <div className="text-3xl font-black" style={{ color: C.black }}>{(credits.usedCredits ?? 0).toLocaleString('it-IT')}</div>
                <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: C.gray1 }}>Email usate</div>
              </div>
              <div>
                <div className="text-3xl font-black" style={{ color: '#34c759' }}>{(credits.remainCredits ?? 0).toLocaleString('it-IT')}</div>
                <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: C.gray1 }}>Rimanenti</div>
              </div>
              <div>
                <div className="text-3xl font-black" style={{ color: C.black }}>{(credits.totalCredits ?? 0).toLocaleString('it-IT')}</div>
                <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: C.gray1 }}>Incluse nel piano</div>
              </div>
              {(credits.overage ?? 0) > 0 && (
                <div>
                  <div className="text-3xl font-black" style={{ color: '#ff3b30' }}>{(credits.overage ?? 0).toLocaleString('it-IT')}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: C.gray1 }}>Overage</div>
                </div>
              )}
            </div>
            {/* Barra utilizzo */}
            <div className="w-full rounded-full h-2 mb-2" style={{ background: C.border }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(credits.usagePercent ?? 0, 100)}%`,
                  background: (credits.usagePercent ?? 0) > 80 ? '#ff3b30' : (credits.usagePercent ?? 0) > 60 ? '#ff9500' : '#34c759'
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: C.gray2 }}>{credits.usagePercent ?? 0}% utilizzato</p>
              <p className="text-xs" style={{ color: C.gray2 }}>Reset: {credits.nextReset ?? '—'} · {credits.resetFrequency === 'monthly' ? 'mensile' : credits.resetFrequency}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b" style={{ borderColor: C.border }}>
          {[
            { id: "sendgrid", label: "📊 Statistiche SendGrid" },
            { id: "campaigns", label: `📧 Campagne (${campaigns.length})` },
            { id: "subscribers", label: `👥 Iscritti (${allSubs.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className="px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px"
              style={{
                color: tab === t.id ? C.black : C.gray1,
                borderBottomColor: tab === t.id ? C.black : "transparent",
                background: "transparent",
                fontFamily: C.font,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: SENDGRID STATS ─────────────────────────────────────────────── */}
        {tab === "sendgrid" && (
          <div>
            {/* Selettore periodo */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium" style={{ color: C.gray1 }}>Periodo:</span>
              {[30, 60, 90, 180, 365].map(d => (
                <button
                  key={d}
                  onClick={() => setSgDays(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: sgDays === d ? C.black : C.white,
                    color: sgDays === d ? C.white : C.gray1,
                    border: `1px solid ${sgDays === d ? C.black : C.border}`,
                  }}
                >
                  {d === 365 ? "1 anno" : `${d}gg`}
                </button>
              ))}
              <button
                onClick={() => sgQuery.refetch()}
                className="ml-auto text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: C.gray1 }}
              >
                ↻ Aggiorna
              </button>
            </div>

            {sgQuery.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.black }} />
              </div>
            ) : !sg || !sg.success ? (
              <div className="rounded-2xl border p-8 text-center" style={{ background: C.white, borderColor: C.border }}>
                <p className="text-sm" style={{ color: C.gray1 }}>Impossibile recuperare le statistiche SendGrid.</p>
              </div>
            ) : (
              <>
                {/* KPI principali */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <KpiCard
                    icon="📤"
                    label="Email consegnate"
                    value={sg.delivered.toLocaleString("it-IT")}
                    sub={`Ultimi ${sg.days} giorni`}
                  />
                  <KpiCard
                    icon="👁"
                    label="Aperture uniche"
                    value={sg.uniqueOpens.toLocaleString("it-IT")}
                    highlight
                  />
                  <KpiCard
                    icon="📊"
                    label="Open Rate"
                    value={`${sg.openRate}%`}
                    sub={sg.openRate >= 20 ? "✅ Ottimo" : sg.openRate >= 15 ? "⚠️ Nella media" : "❌ Sotto media"}
                    highlight={sg.openRate >= 20}
                  />
                  <KpiCard
                    icon="🚫"
                    label="Disiscrizioni"
                    value={sg.unsubscribes.toLocaleString("it-IT")}
                    sub={`Bounce: ${sg.bounces} · Spam: ${sg.spamReports}`}
                  />
                </div>

                {/* Statistiche secondarie */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-2xl border p-4" style={{ background: C.white, borderColor: C.border }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: C.gray1 }}>Aperture totali (incl. riaperture)</div>
                    <div className="text-2xl font-black" style={{ color: C.black, fontFamily: C.font }}>{sg.opens.toLocaleString("it-IT")}</div>
                  </div>
                  <div className="rounded-2xl border p-4" style={{ background: C.white, borderColor: C.border }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: C.gray1 }}>Click Rate</div>
                    <div className="text-2xl font-black" style={{ color: C.black, fontFamily: C.font }}>{sg.clickRate}%</div>
                  </div>
                  <div className="rounded-2xl border p-4" style={{ background: C.white, borderColor: C.border }}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: C.gray1 }}>Aggiornato il</div>
                    <div className="text-sm font-semibold" style={{ color: C.black }}>{fmtFull(sg.fetchedAt)}</div>
                  </div>
                </div>

                {/* Trend giornaliero */}
                {sg.dailyStats && sg.dailyStats.length > 0 && (
                  <div className="rounded-2xl border p-5" style={{ background: C.white, borderColor: C.border }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: C.gray1 }}>Trend aperture — ultimi 30 giorni</p>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b" style={{ borderColor: C.border }}>
                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Data</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Consegnate</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Aperture uniche</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Open Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...sg.dailyStats].reverse().filter(d => d.delivered > 0).map(d => (
                            <tr key={d.date} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: C.border }}>
                              <td className="px-3 py-2.5 text-sm" style={{ color: C.black }}>{fmt(d.date)}</td>
                              <td className="px-3 py-2.5 text-sm text-right tabular-nums" style={{ color: C.gray1 }}>{d.delivered.toLocaleString("it-IT")}</td>
                              <td className="px-3 py-2.5 text-sm text-right tabular-nums font-semibold" style={{ color: "#007aff" }}>{d.uniqueOpens.toLocaleString("it-IT")}</td>
                              <td className="px-3 py-2.5 text-right">
                                <span
                                  className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                                  style={{
                                    background: d.openRate >= 25 ? "#e8f5e9" : d.openRate >= 15 ? "#fff8e1" : "#fce4ec",
                                    color: d.openRate >= 25 ? "#2e7d32" : d.openRate >= 15 ? "#f57f17" : "#c62828",
                                  }}
                                >
                                  {d.openRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TAB: CAMPAGNE ─────────────────────────────────────────────────── */}
        {tab === "campaigns" && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: C.white, borderColor: C.border }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.gray1 }}>Storico campagne newsletter</p>
              <button onClick={() => campaignsQuery.refetch()} className="text-xs transition-colors hover:opacity-70" style={{ color: C.gray2 }}>↻ Aggiorna</button>
            </div>
            <div className="px-6 py-3 border-b" style={{ borderColor: C.border, background: "#f9f9fb" }}>
              <p className="text-xs" style={{ color: C.gray1 }}>
                ℹ️ Le aperture per campagna vengono tracciate tramite pixel di tracking interno. Per le statistiche aggregate reali, usa la tab "Statistiche SendGrid".
              </p>
            </div>
            {campaignsQuery.isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: C.black }} />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm" style={{ color: C.gray1 }}>Nessuna campagna newsletter inviata ancora.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: C.border }}>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Oggetto</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Data invio</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Inviati</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Aperture (pixel)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...campaigns].reverse().map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: C.border }}>
                        <td className="px-5 py-4 text-sm max-w-xs" style={{ color: C.black, fontFamily: C.font }}>
                          <span className="line-clamp-2">{c.subject}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-center whitespace-nowrap" style={{ color: C.gray1 }}>
                          {fmt(c.sentAt)}
                        </td>
                        <td className="px-5 py-4 text-sm text-center font-mono" style={{ color: C.gray1 }}>
                          {(c.recipientCount ?? 0).toLocaleString("it-IT")}
                        </td>
                        <td className="px-5 py-4 text-sm text-center font-mono" style={{ color: C.black }}>
                          {(c.openedCount ?? 0).toLocaleString("it-IT")}
                        </td>
                      </tr>
                    ))}
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
                className="px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors w-64"
                style={{ border: `1px solid ${C.border}`, background: C.white, color: C.black, fontFamily: C.font }}
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ border: `1px solid ${C.border}`, background: C.white, color: C.black }}
              >
                <option value="all">Tutti gli stati</option>
                <option value="active">Solo attivi</option>
                <option value="unsubscribed">Solo disiscritti</option>
              </select>
              <select
                value={filterOpened}
                onChange={e => setFilterOpened(e.target.value as typeof filterOpened)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ border: `1px solid ${C.border}`, background: C.white, color: C.black }}
              >
                <option value="all">Tutte le aperture</option>
                <option value="opened">Ha aperto almeno 1 volta</option>
                <option value="never">Non ha mai aperto</option>
              </select>
              <select
                value={filterChannel}
                onChange={e => setFilterChannel(e.target.value as typeof filterChannel)}
                className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ border: `1px solid ${C.border}`, background: C.white, color: C.black }}
              >
                <option value="all">Tutti i canali</option>
                <option value="ai">AI</option>
                <option value="startup">Startup</option>
              </select>
              <span className="ml-auto text-xs self-center" style={{ color: C.gray2 }}>
                {filtered.length} / {allSubs.length} iscritti
              </span>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: C.white, borderColor: C.border }}>
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.gray1 }}>
                  Iscritti con tracking ({filtered.length})
                </p>
                <button onClick={() => subscribersQuery.refetch()} className="text-xs transition-colors hover:opacity-70" style={{ color: C.gray2 }}>↻ Aggiorna</button>
              </div>

              {subscribersQuery.isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: C.black }} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm" style={{ color: C.gray1 }}>Nessun iscritto trovato con i filtri selezionati.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: C.border }}>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Nome</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Stato</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Inviati</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Aperture</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Ultima apertura</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Iscritto il</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: C.gray2 }}>Canali</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((sub) => {
                        const hasOpened = sub.totalOpened && sub.totalOpened > 0;
                        const isUnsub = sub.status === "unsubscribed";
                        return (
                          <tr key={sub.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: C.border }}>
                            <td className="px-4 py-3 text-sm" style={{ color: C.black, fontFamily: C.font }}>{sub.email}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: C.gray1 }}>{sub.name ?? "—"}</td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{
                                  background: isUnsub ? "#fce4ec" : "#e8f5e9",
                                  color: isUnsub ? "#c62828" : "#2e7d32",
                                }}
                              >
                                {isUnsub ? "Disattivato" : "Attivo"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-mono" style={{ color: C.gray1 }}>{sub.totalSent ?? 0}</td>
                            <td className="px-4 py-3 text-center">
                              {hasOpened ? (
                                <span className="text-sm font-bold" style={{ color: "#007aff" }}>👁 {sub.totalOpened}</span>
                              ) : (
                                <span className="text-xs" style={{ color: C.gray2 }}>—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-xs whitespace-nowrap" style={{ color: C.gray1 }}>
                              {fmtFull(sub.lastOpenedAt)}
                            </td>
                            <td className="px-4 py-3 text-center text-xs whitespace-nowrap" style={{ color: C.gray2 }}>
                              {fmt(sub.subscribedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(sub.parsedChannels as string[] ?? []).map((ch: string) => {
                                  const chInfo = [
                                    { key: "ai", label: "AI" },
                                    { key: "startup", label: "ST" },
                                  ].find(c => c.key === ch);
                                  if (!chInfo) return null;
                                  return (
                                    <span
                                      key={ch}
                                      className="inline-block px-1.5 py-0.5 rounded font-bold"
                                      style={{ background: "#f0f0f5", color: C.black, fontSize: "10px" }}
                                    >
                                      {chInfo.label}
                                    </span>
                                  );
                                })}
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
          </div>
        )}

      </div>
    </div>
  );
}
