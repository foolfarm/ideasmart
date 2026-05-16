/**
 * ProofPress — Admin Command Center
 * Homepage admin: performance newsletter 24h, iscritti, azioni rapide
 * Design: Apple monochrome — #f5f5f7 bg, #1d1d1f text
 */
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ChevronDown, TrendingUp, TrendingDown, Minus, Users, Mail, MousePointerClick, UserMinus, Send, RefreshCw, Linkedin, Zap } from "lucide-react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#f5f5f7",
  white: "#ffffff",
  black: "#1d1d1f",
  dark: "#3a3a3c",
  mid: "#6e6e73",
  light: "#aeaeb2",
  border: "#e5e5ea",
  borderDark: "#d1d1d6",
  cardBg: "#ffffff",
  blue: "#007aff",
  green: "#34c759",
  red: "#ff3b30",
  orange: "#ff9500",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

// ─── Menu Admin (4 gruppi puliti) ─────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Newsletter",
    items: [
      { label: "Performance & Iscritti", path: "/admin/newsletter-performance" },
      { label: "Promo Newsletter", path: "/admin/promo-newsletter" },
    ],
  },
  {
    label: "Contenuti",
    items: [
      { label: "Audit Contenuti", path: "/admin/audit" },
      { label: "Monitor RSS", path: "/admin/rss-monitor" },
      { label: "Amazon Deals", path: "/admin/amazon-deals" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Salute Sistema", path: "/admin/system-health" },
      { label: "Alert Log", path: "/admin/alert-log" },
    ],
  },
  {
    label: "Monetizzazione",
    items: [
      { label: "Pubblicità & Sponsor", path: "/admin/pubblicita" },
      { label: "Leads", path: "/admin/leads" },
      { label: "Verify Clienti", path: "/verify/admin" },
    ],
  },
];

// ─── Dropdown ────────────────────────────────────────────────────────────────
function NavDropdown({ group, navigate, currentPath }: {
  group: typeof NAV_GROUPS[0];
  navigate: (path: string) => void;
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = group.items.some(i => currentPath.startsWith(i.path));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:bg-[#f5f5f7]"
        style={{
          color: isActive ? C.black : open ? C.black : C.mid,
          fontFamily: C.font,
          fontWeight: isActive || open ? 600 : 500,
        }}
      >
        {group.label}
        <ChevronDown
          size={11}
          strokeWidth={2}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 150ms ease" }}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 py-1 rounded-xl shadow-xl z-50 min-w-[200px]"
          style={{ background: C.white, border: `1px solid ${C.border}` }}
        >
          {group.items.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setOpen(false); }}
              className="w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-[#f5f5f7]"
              style={{
                color: currentPath === item.path ? C.black : C.dark,
                fontFamily: C.font,
                fontWeight: currentPath === item.path ? 600 : 500,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color = C.black,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? C.green : trend === "down" ? C.red : C.light;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: C.white, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: C.bg }}
        >
          <Icon size={16} style={{ color: color }} strokeWidth={2} />
        </div>
        {trend && (
          <TrendIcon size={14} style={{ color: trendColor }} strokeWidth={2} />
        )}
      </div>
      <div>
        <div
          className="text-3xl font-black tabular-nums leading-none mb-1"
          style={{ color, fontFamily: C.font }}
        >
          {value}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.light }}>
          {label}
        </div>
        {sub && (
          <div className="text-xs mt-1" style={{ color: C.mid }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({
  icon: Icon,
  label,
  sub,
  onClick,
  loading,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  onClick: () => void;
  loading?: boolean;
  variant?: "default" | "primary" | "linkedin";
}) {
  const bg = variant === "primary" ? C.black : variant === "linkedin" ? "#0a66c2" : C.white;
  const fg = variant === "default" ? C.dark : "#fff";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
      style={{
        background: bg,
        border: variant === "default" ? `1px solid ${C.border}` : "none",
        fontFamily: C.font,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: variant === "default" ? C.bg : "rgba(255,255,255,0.15)" }}
      >
        {loading ? (
          <div
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: variant === "default" ? C.dark : "#fff" }}
          />
        ) : (
          <Icon size={15} style={{ color: fg }} strokeWidth={2} />
        )}
      </div>
      <div className="text-left flex-1">
        <div className="text-sm font-semibold" style={{ color: fg }}>{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: variant === "default" ? C.light : "rgba(255,255,255,0.6)" }}>{sub}</div>}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const [testEmail, setTestEmail] = useState("ac@acinelli.com");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingChannelPreview, setSendingChannelPreview] = useState(false);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [publishingLinkedIn, setPublishingLinkedIn] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // ─── Queries ─────────────────────────────────────────────────────────────────
  const subscribersQuery = trpc.admin.getSubscribers.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const historyQuery = trpc.admin.getNewsletterHistory.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const newSiteUsersQuery = trpc.admin.getNewSiteUsers.useQuery(undefined, {
    enabled: user?.role === "admin",
    refetchInterval: 60_000,
  });
  // SendGrid stats ultimi 2 giorni per KPI 24h
  const sgQuery = trpc.adminTools.getSendgridSummary.useQuery(
    { days: 2 },
    { enabled: user?.role === "admin", staleTime: 1000 * 60 * 5 }
  );
  const creditsQuery = trpc.adminTools.getSendgridCredits.useQuery(undefined, {
    enabled: user?.role === "admin",
    staleTime: 1000 * 60 * 30,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────────
  const sendTestMutation = trpc.admin.sendTestEmail.useMutation({
    onSuccess: (data) => {
      setSendingTest(false);
      setLastResult(`✓ Test inviato a ${data.to}`);
      toast.success(`Email di test inviata a ${data.to}!`);
      historyQuery.refetch();
    },
    onError: (err) => { setSendingTest(false); toast.error("Errore: " + err.message); },
  });
  const sendChannelPreviewMutation = trpc.admin.sendDailyChannelPreview.useMutation({
    onSuccess: (data) => {
      setSendingChannelPreview(false);
      setLastResult(`✓ Preview ${data.channel} inviata — ${data.newsCount} notizie`);
      toast.success(`Preview ${data.channel} inviata!`);
    },
    onError: (err) => { setSendingChannelPreview(false); toast.error("Errore: " + err.message); },
  });
  const refreshNewsMutation = trpc.admin.refreshNews.useMutation({
    onSuccess: (data) => {
      setRefreshingNews(false);
      setLastResult(`✓ ${data.count} notizie aggiornate`);
      toast.success(`${data.count} notizie aggiornate!`);
    },
    onError: (err) => { setRefreshingNews(false); toast.error("Errore: " + err.message); },
  });
  const generateImagesMutation = trpc.admin.generateArticleImages.useMutation({
    onSuccess: (data) => {
      setGeneratingImages(false);
      setLastResult(`✓ ${data.generated} immagini AI generate`);
      toast.success(`${data.generated} immagini generate!`);
    },
    onError: (err) => { setGeneratingImages(false); toast.error("Errore: " + err.message); },
  });
  const publishLinkedInMutation = trpc.admin.publishLinkedIn.useMutation({
    onSuccess: (data) => {
      setPublishingLinkedIn(false);
      setLastResult(`✓ LinkedIn: ${data.published}/${data.total} post pubblicati`);
      toast.success(`${data.published}/${data.total} post LinkedIn pubblicati!`);
    },
    onError: (err) => { setPublishingLinkedIn(false); toast.error("Errore LinkedIn: " + err.message); },
  });
  const linkedinTokenQuery = trpc.admin.getLinkedInTokenStatus.useQuery(undefined, {
    enabled: user?.role === "admin",
    staleTime: 1000 * 60 * 60, // 1 ora
  });
  const refreshLinkedInTokenMutation = trpc.admin.refreshLinkedInToken.useMutation({
    onSuccess: (data) => {
      toast[data.success ? "success" : "error"](data.message);
      linkedinTokenQuery.refetch();
    },
    onError: (err) => toast.error("Refresh token fallito: " + err.message),
  });

  // ─── Auth guard ───────────────────────────────────────────────────────────────
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
          <p className="text-sm mb-4" style={{ color: C.mid, fontFamily: C.font }}>Accesso riservato agli amministratori.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: C.black, color: "#fff", fontFamily: C.font }}
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Dati elaborati ───────────────────────────────────────────────────────────
  const subscribers = subscribersQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const newSiteUsersData = newSiteUsersQuery.data;
  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubCount = subscribers.filter((s) => s.status !== "active").length;
  const sg = sgQuery.data;
  const credits = creditsQuery.data;

  // Nuovi iscritti ultime 24h
  const newSubs24h = newSiteUsersData?.newCount ?? 0;

  // Ultimi 5 invii
  const recentHistory = [...history].reverse().slice(0, 5);

  // Prossimo invio (Lun–Ven ore 08:30)
  const now = new Date();
  let nextSend: Date | null = null;
  for (let i = 0; i < 10; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(8, 30, 0, 0);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    if (d > now) { nextSend = d; break; }
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.font }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="text-sm transition-colors px-2 py-1 rounded-md hover:bg-[#f5f5f7]"
              style={{ color: C.mid, fontFamily: C.font }}
            >
              ← ProofPress
            </button>
            <span style={{ color: C.border }}>/</span>
            <span
              className="text-sm font-bold px-2 cursor-pointer"
              style={{ color: C.black, fontFamily: C.font }}
              onClick={() => navigate("/admin")}
            >
              Admin
            </span>
            <span style={{ color: C.border, margin: "0 4px" }}>·</span>
            {NAV_GROUPS.map((group) => (
              <NavDropdown key={group.label} group={group} navigate={navigate} currentPath={location} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs" style={{ color: C.mid, fontFamily: C.font }}>{user.name ?? user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black mb-1" style={{ color: C.black }}>Command Center</h1>
            <p className="text-sm" style={{ color: C.mid }}>
              {now.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {nextSend && (
                <span style={{ color: C.light }}>
                  {" "}· Prossimo invio: {nextSend.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })} ore 08:30
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => { subscribersQuery.refetch(); sgQuery.refetch(); historyQuery.refetch(); newSiteUsersQuery.refetch(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[#e5e5ea]"
            style={{ color: C.mid, border: `1px solid ${C.border}`, background: C.white }}
          >
            <RefreshCw size={12} />
            Aggiorna
          </button>
        </div>

        {/* ── Result Banner ────────────────────────────────────────────────────── */}
        {lastResult && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
          >
            <p className="text-sm flex-1" style={{ color: "#166534" }}>{lastResult}</p>
            <button onClick={() => setLastResult(null)} className="text-xs" style={{ color: "#6e6e73" }}>✕</button>
          </div>
        )}

        {/* ── KPI Row 1: Iscritti ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <KpiCard
            icon={Users}
            label="Iscritti attivi"
            value={activeCount.toLocaleString("it-IT")}
            sub="Newsletter totale"
            color={C.blue}
          />
          <KpiCard
            icon={TrendingUp}
            label="Nuovi iscritti 24h"
            value={newSubs24h}
            sub="Ultime 24 ore"
            trend={newSubs24h > 0 ? "up" : "neutral"}
            color={newSubs24h > 0 ? C.green : C.black}
          />
          <KpiCard
            icon={UserMinus}
            label="Disiscritti totali"
            value={unsubCount.toLocaleString("it-IT")}
            sub={sg?.unsubscribes != null ? `${sg.unsubscribes} ultimi 2gg` : undefined}
            trend={sg?.unsubscribes != null && sg.unsubscribes > 5 ? "down" : "neutral"}
          />
          <KpiCard
            icon={Mail}
            label="Newsletter inviate"
            value={history.length}
            sub="Storico totale"
          />
        </div>

        {/* ── KPI Row 2: Performance SendGrid ─────────────────────────────────── */}
        {sg && sg.success && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <KpiCard
              icon={Send}
              label="Email consegnate"
              value={sg.delivered.toLocaleString("it-IT")}
              sub={`Ultimi ${sg.days} giorni`}
            />
            <KpiCard
              icon={MousePointerClick}
              label="Aperture uniche"
              value={sg.uniqueOpens.toLocaleString("it-IT")}
              sub={`Open rate: ${sg.openRate}%`}
              trend={sg.openRate >= 20 ? "up" : sg.openRate >= 15 ? "neutral" : "down"}
              color={sg.openRate >= 20 ? C.green : C.black}
            />
            <KpiCard
              icon={TrendingUp}
              label="Click unici"
            value={sg.clickRate != null ? `${sg.clickRate}%` : "—"}
            sub="Click-through rate"
            trend={sg.clickRate != null && sg.clickRate >= 3 ? "up" : "neutral"}
            />
            <KpiCard
              icon={TrendingDown}
              label="Bounce + Spam"
              value={(sg.bounces + sg.spamReports).toLocaleString("it-IT")}
              sub={`Bounce: ${sg.bounces} · Spam: ${sg.spamReports}`}
              trend={(sg.bounces + sg.spamReports) > 10 ? "down" : "neutral"}
            />
          </div>
        )}

        {/* ── SendGrid quota bar ───────────────────────────────────────────────── */}
        {credits && credits.success && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: C.white, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.mid }}>
                  SendGrid — Quota mensile
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#e3f2fd", color: "#1565c0" }}
                >
                  {credits.plan?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span style={{ color: C.mid }}>
                  <span className="font-bold" style={{ color: C.black }}>{(credits.usedCredits ?? 0).toLocaleString("it-IT")}</span>
                  <span style={{ color: C.light }}> / {(credits.totalCredits ?? 0).toLocaleString("it-IT")}</span>
                </span>
                <span className="text-xs" style={{ color: C.light }}>
                  Reset: {credits.nextReset ?? "—"}
                </span>
              </div>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: C.border }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(credits.usagePercent ?? 0, 100)}%`,
                  background: (credits.usagePercent ?? 0) > 80 ? C.red : (credits.usagePercent ?? 0) > 60 ? C.orange : C.green,
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: C.light }}>
              {credits.usagePercent ?? 0}% utilizzato · Rep. {credits.reputation}%
            </p>
          </div>
        )}

        {/* ── Layout 2 colonne: Storico + Azioni ──────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Storico invii recenti ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Ultimi invii */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.white, border: `1px solid ${C.border}` }}
            >
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p className="text-sm font-semibold" style={{ color: C.black }}>Ultimi invii newsletter</p>
                <button
                  onClick={() => navigate("/admin/newsletter-performance")}
                  className="text-xs font-medium transition-colors hover:opacity-70"
                  style={{ color: C.blue }}
                >
                  Vedi tutti →
                </button>
              </div>
              {recentHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm italic" style={{ color: C.light }}>Nessuna newsletter inviata ancora.</p>
                </div>
              ) : (
                <div>
                  {recentHistory.map((h, i) => (
                    <div
                      key={h.id}
                      className="px-6 py-4 flex items-center justify-between transition-colors hover:bg-[#f5f5f7]"
                      style={{ borderBottom: i < recentHistory.length - 1 ? `1px solid ${C.border}` : "none" }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: C.bg }}
                        >
                          <Mail size={14} style={{ color: C.mid }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: C.dark }}>{h.subject}</p>
                          <p className="text-xs" style={{ color: C.light }}>
                            {h.sentAt ? new Date(h.sentAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: C.bg, color: C.dark, border: `1px solid ${C.border}` }}
                        >
                          {h.recipientCount?.toLocaleString("it-IT") ?? "—"} dest.
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "#e8f5e9", color: "#2e7d32" }}
                        >
                          ✓ Inviata
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nuovi iscritti 24h */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.white, border: `1px solid ${C.border}` }}
            >
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-semibold" style={{ color: C.black }}>
                    Nuovi iscritti — Ultime 24 ore
                  </p>
                </div>
                <span className="text-xl font-black" style={{ color: newSubs24h > 0 ? C.green : C.black }}>
                  +{newSubs24h}
                </span>
              </div>
              {newSiteUsersQuery.isLoading ? (
                <div className="p-6 flex items-center gap-2 text-xs" style={{ color: C.light }}>
                  <div className="w-4 h-4 border border-[#e5e5ea] border-t-[#1d1d1f] rounded-full animate-spin" />
                  Caricamento...
                </div>
              ) : newSiteUsersData && newSiteUsersData.newUsers.length > 0 ? (
                <div>
                  {newSiteUsersData.newUsers.map((u, i) => (
                    <div
                      key={u.id}
                      className="px-6 py-3 flex items-center justify-between transition-colors hover:bg-[#f5f5f7]"
                      style={{ borderBottom: i < newSiteUsersData.newUsers.length - 1 ? `1px solid ${C.border}` : "none" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: C.bg, color: C.dark }}
                        >
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: C.black }}>{u.username}</p>
                          <p className="text-xs" style={{ color: C.light }}>{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: u.emailVerified ? "#e8f5e9" : "#fff8e1",
                            color: u.emailVerified ? "#2e7d32" : "#f57f17",
                          }}
                        >
                          {u.emailVerified ? "Verificato" : "In attesa"}
                        </span>
                        <span className="text-xs" style={{ color: C.light }}>
                          {new Date(u.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-sm italic" style={{ color: C.light }}>Nessun nuovo iscritto nelle ultime 24 ore.</p>
                </div>
              )}
            </div>

          </div>

          {/* ── Azioni rapide ─────────────────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Test newsletter */}
            <div
              className="rounded-2xl p-5"
              style={{ background: C.white, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.mid }}>
                Invio di Test
              </p>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  color: C.black,
                  fontFamily: C.font,
                }}
                placeholder="email@esempio.com"
              />
              <ActionBtn
                icon={Send}
                label={sendingTest ? "Invio in corso..." : "Invia Test Newsletter"}
                sub="Genera notizie e invia preview"
                onClick={() => { setSendingTest(true); sendTestMutation.mutate({ to: testEmail }); }}
                loading={sendingTest}
                variant="primary"
              />
            </div>

            {/* Azioni operative */}
            <div
              className="rounded-2xl p-5 space-y-2"
              style={{ background: C.white, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.mid }}>
                Azioni Rapide
              </p>
              <ActionBtn
                icon={Mail}
                label={sendingChannelPreview ? "Invio preview..." : "Invia Preview 08:30"}
                sub="Preview canale di oggi"
                onClick={() => { setSendingChannelPreview(true); sendChannelPreviewMutation.mutate(); }}
                loading={sendingChannelPreview}
              />
              <ActionBtn
                icon={RefreshCw}
                label={refreshingNews ? "Aggiornamento..." : "Aggiorna News RSS"}
                sub="Fetch notizie da tutte le fonti"
                onClick={() => { setRefreshingNews(true); refreshNewsMutation.mutate(); }}
                loading={refreshingNews}
              />
              <ActionBtn
                icon={Zap}
                label={generatingImages ? "Generazione..." : "Genera Immagini AI"}
                sub="Max 5 articoli senza immagine"
                onClick={() => { setGeneratingImages(true); generateImagesMutation.mutate({ type: "all", limit: 5 }); }}
                loading={generatingImages}
              />
              <ActionBtn
                icon={Linkedin}
                label={publishingLinkedIn ? "Pubblicazione..." : "Pubblica su LinkedIn"}
                sub="1 editoriale · Token ogni 2 mesi"
                onClick={() => { setPublishingLinkedIn(true); publishLinkedInMutation.mutate(); }}
                loading={publishingLinkedIn}
                variant="linkedin"
              />
              {/* LinkedIn Token Status Badge */}
              {linkedinTokenQuery.data && (
                <div
                  className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-2"
                  style={{
                    background: linkedinTokenQuery.data.warningLevel === "expired" ? "#fef2f2"
                      : linkedinTokenQuery.data.warningLevel === "critical" ? "#fff7ed"
                      : linkedinTokenQuery.data.warningLevel === "warning" ? "#fefce8"
                      : "#f0fdf4",
                    border: `1px solid ${
                      linkedinTokenQuery.data.warningLevel === "expired" ? "#fca5a5"
                      : linkedinTokenQuery.data.warningLevel === "critical" ? "#fdba74"
                      : linkedinTokenQuery.data.warningLevel === "warning" ? "#fde047"
                      : "#86efac"
                    }`,
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold" style={{
                      color: linkedinTokenQuery.data.warningLevel === "expired" ? "#dc2626"
                        : linkedinTokenQuery.data.warningLevel === "critical" ? "#ea580c"
                        : linkedinTokenQuery.data.warningLevel === "warning" ? "#ca8a04"
                        : "#16a34a",
                    }}>
                      {linkedinTokenQuery.data.warningLevel === "expired" ? "🚨 Token SCADUTO"
                        : linkedinTokenQuery.data.warningLevel === "critical" ? `⚠️ Scade tra ${linkedinTokenQuery.data.daysUntilExpiry}gg`
                        : linkedinTokenQuery.data.warningLevel === "warning" ? `⏰ Scade tra ${linkedinTokenQuery.data.daysUntilExpiry}gg`
                        : `✅ Token valido (${linkedinTokenQuery.data.daysUntilExpiry}gg)`}
                    </span>
                    <span className="text-xs" style={{ color: C.mid }}>
                      Scadenza: {linkedinTokenQuery.data.expiresAtFormatted}
                    </span>
                  </div>
                  {(linkedinTokenQuery.data.warningLevel === "critical" || linkedinTokenQuery.data.warningLevel === "expired") && (
                    <button
                      onClick={() => refreshLinkedInTokenMutation.mutate()}
                      disabled={refreshLinkedInTokenMutation.isPending}
                      className="text-xs font-semibold px-2 py-1 rounded-lg transition-all"
                      style={{
                        background: "#0a66c2",
                        color: "white",
                        opacity: refreshLinkedInTokenMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      {refreshLinkedInTokenMutation.isPending ? "..." : "Rinnova"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Link rapidi sezioni */}
            <div
              className="rounded-2xl p-5"
              style={{ background: C.white, border: `1px solid ${C.border}` }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.mid }}>
                Sezioni Admin
              </p>
              <div className="space-y-1">
                {[
                  { label: "Performance & Iscritti", path: "/admin/newsletter-performance", icon: "📊" },
                  { label: "Monitor RSS", path: "/admin/rss-monitor", icon: "📡" },
                  { label: "Audit Contenuti", path: "/admin/audit", icon: "🔍" },
                  { label: "Salute Sistema", path: "/admin/system-health", icon: "🩺" },
                  { label: "Pubblicità & Sponsor", path: "/admin/pubblicita", icon: "💰" },
                  { label: "Alert Log", path: "/admin/alert-log", icon: "🚨" },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-[#f5f5f7] text-left"
                    style={{ color: C.dark, fontFamily: C.font }}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-auto text-xs" style={{ color: C.light }}>→</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
