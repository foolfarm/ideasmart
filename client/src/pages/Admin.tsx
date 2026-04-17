/**
 * ProofPress Admin Dashboard
 * Stile Apple monocromatico: #f5f5f7 background, #1d1d1f testo, scala di grigi
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─── Colori Apple ────────────────────────────────────────────────────────────
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
  rowHover: "#f5f5f7",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [testEmail, setTestEmail] = useState("ac@acinelli.com");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [sendingChannelPreview, setSendingChannelPreview] = useState(false);
  const [sendingChannelNewsletter, setSendingChannelNewsletter] = useState<string | null>(null);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [publishingLinkedIn, setPublishingLinkedIn] = useState(false);
  const [linkedInResult, setLinkedInResult] = useState<{
    published: number;
    total: number;
    posts: Array<{ section: string; title: string; success: boolean; error?: string }>;
  } | null>(null);

  // ─── Queries ────────────────────────────────────────────────────────────────
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
  const newsQuery = trpc.news.getLatest.useQuery({ limit: 20 }, { enabled: user?.role === "admin" });
  const newsRefreshHistoryQuery = trpc.news.getRefreshHistory.useQuery(undefined, { enabled: user?.role === "admin" });

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const deleteSubscriber = trpc.admin.deleteSubscriber.useMutation({
    onSuccess: () => { subscribersQuery.refetch(); toast.success("Iscritto rimosso"); },
    onError: (err) => toast.error("Errore: " + err.message),
  });
  const unsubscribeSubscriber = trpc.admin.unsubscribeSubscriber.useMutation({
    onSuccess: () => { subscribersQuery.refetch(); toast.success("Iscritto disattivato"); },
    onError: (err) => toast.error("Errore: " + err.message),
  });
  const sendTestMutation = trpc.admin.sendTestEmail.useMutation({
    onSuccess: (data) => {
      setSendingTest(false);
      setLastResult(`Email di test inviata a ${data.to} — ${data.newsCount} notizie (settimana ${data.week})`);
      toast.success(`Email di test inviata a ${data.to}!`);
      historyQuery.refetch();
    },
    onError: (err) => { setSendingTest(false); toast.error("Errore invio: " + err.message); },
  });
  const sendChannelPreviewMutation = trpc.admin.sendDailyChannelPreview.useMutation({
    onSuccess: (data) => {
      setSendingChannelPreview(false);
      setLastResult(`Preview ${data.channel} inviata — ${data.newsCount} notizie`);
      toast.success(`Preview ${data.channel} inviata!`);
    },
    onError: (err) => { setSendingChannelPreview(false); toast.error("Errore preview: " + err.message); },
  });
  const sendChannelNewsletterMutation = trpc.admin.sendChannelNewsletter.useMutation({
    onSuccess: (data) => {
      setSendingChannelNewsletter(null);
      setLastResult(`Newsletter ${data.channel} inviata a ${data.recipientCount} iscritti — ${data.newsCount} notizie`);
      toast.success(`${data.channel}: ${data.recipientCount} iscritti raggiunti!`);
      historyQuery.refetch();
    },
    onError: (err) => { setSendingChannelNewsletter(null); toast.error("Errore invio: " + err.message); },
  });
  const publishLinkedInMutation = trpc.admin.publishLinkedIn.useMutation({
    onSuccess: (data) => {
      setPublishingLinkedIn(false);
      setLinkedInResult({ published: data.published, total: data.total, posts: data.posts });
      setLastResult(`LinkedIn: ${data.published}/${data.total} post pubblicati`);
      toast.success(`${data.published}/${data.total} post LinkedIn pubblicati!`);
    },
    onError: (err) => { setPublishingLinkedIn(false); toast.error("Errore LinkedIn: " + err.message); },
  });
  const generateImagesMutation = trpc.admin.generateArticleImages.useMutation({
    onSuccess: (data) => {
      setGeneratingImages(false);
      setLastResult(`Immagini generate: ${data.generated} articoli aggiornati`);
      toast.success(`${data.generated} immagini AI generate!`);
    },
    onError: (err) => { setGeneratingImages(false); toast.error("Errore immagini: " + err.message); },
  });
  const refreshNewsMutation = trpc.admin.refreshNews.useMutation({
    onSuccess: (data) => {
      setRefreshingNews(false);
      setLastResult(`News aggiornate: ${data.count} notizie generate`);
      toast.success(`${data.count} notizie aggiornate!`);
      newsQuery.refetch();
      newsRefreshHistoryQuery.refetch();
    },
    onError: (err) => { setRefreshingNews(false); toast.error("Errore news: " + err.message); },
  });

  // ─── Loading / Auth guard ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
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

  const subscribers = subscribersQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const newSiteUsersData = newSiteUsersQuery.data;
  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const aiSubscribers = subscribers.filter(
    (s) => s.status === "active" && (s.newsletter === "ai4business" || s.newsletter === "both")
  ).length;

  // ─── Prossimi invii newsletter ───────────────────────────────────────────────
  // Lo scheduler invia SOLO lun(1), mer(3), ven(5) alle 11:00 CET
  const ALL_CHANNELS = [
    "AI NEWS", "PROMPT AI", "USE CASE AI", "FARE SOLDI", "AI TOOLS",
    "PROOFPRESS VERIFY", "AI INVEST", "AI RESEARCH", "AI VENTURE",
    "AI STARTUP NEWS", "AI DEALFLOW", "AI RADAR",
  ];
  const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const now = new Date();
  const upcomingSends: Array<{ date: Date; dayName: string; channel: string }> = [];
  for (let i = 0; i < 60 && upcomingSends.length < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(11, 0, 0, 0);
    const dow = d.getDay();
    // Solo lunedì (1), mercoledì (3), venerdì (5)
    if (dow !== 1 && dow !== 3 && dow !== 5) continue;
    if (d <= now) continue;
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    upcomingSends.push({ date: d, dayName: dayNames[dow], channel: ALL_CHANNELS[dayOfYear % ALL_CHANNELS.length] });
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.font }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => navigate("/")}
              className="text-sm transition-colors px-2 py-1 rounded-md hover:bg-[#f5f5f7]"
              style={{ color: C.mid }}
            >
              ← ProofPress
            </button>
            <span style={{ color: C.border }}>/</span>
            <span className="text-sm font-semibold px-2" style={{ color: C.black }}>Admin</span>

            {[
              { label: "Performance", path: "/admin/newsletter-performance" },
              { label: "Pubblicità", path: "/admin/pubblicita" },
              { label: "Audit Contenuti", path: "/admin/audit" },
              { label: "Monitor RSS", path: "/admin/rss-monitor" },
              { label: "Email Stats", path: "/admin/sendgrid-stats" },
              { label: "Salute Sistema", path: "/admin/system-health" },
              { label: "Alert Log", path: "/admin/alert-log" },
              { label: "Amazon Deals", path: "/admin/amazon-deals" },
              { label: "Giornalisti", path: "/admin/journalists" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-xs transition-colors px-2 py-1 rounded-md hover:bg-[#f5f5f7]"
                style={{ color: C.mid }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs" style={{ color: C.mid }}>{user.name ?? user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── KPI Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Iscritti newsletter", value: subscribers.length },
            { label: "Iscritti attivi", value: activeCount },
            { label: "Newsletter inviate", value: history.length },
            { label: "Utenti registrati", value: newSiteUsersData?.totalCount ?? "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5"
              style={{ background: C.white, border: `1px solid ${C.border}` }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: C.black }}>{stat.value}</div>
              <div className="text-xs uppercase tracking-wider" style={{ color: C.light }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Nuovi iscritti 24h ─────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: C.white, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.black }}>
                Nuovi Iscritti — Ultime 24 ore
              </p>
            </div>
            <span className="text-2xl font-bold" style={{ color: C.black }}>
              {newSiteUsersData?.newCount ?? 0}
            </span>
          </div>
          {newSiteUsersQuery.isLoading ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: C.light }}>
              <div className="w-4 h-4 border border-[#e5e5ea] border-t-[#1d1d1f] rounded-full animate-spin" />
              Caricamento...
            </div>
          ) : newSiteUsersData && newSiteUsersData.newUsers.length > 0 ? (
            <div className="space-y-2">
              {newSiteUsersData.newUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
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
            <p className="text-sm italic" style={{ color: C.light }}>Nessun nuovo iscritto nelle ultime 24 ore.</p>
          )}
        </div>

        {/* ── Prossimi invii newsletter ──────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: C.white, border: `1px solid ${C.border}` }}
        >
          <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: C.black }}>
            Prossimi Invii Newsletter
          </p>
          <div className="space-y-2">
            {upcomingSends.map((send, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex flex-col items-center justify-center w-10 h-10 rounded-xl"
                    style={{ background: C.white, border: `1px solid ${C.border}` }}
                  >
                    <span className="text-base font-bold leading-none" style={{ color: C.black }}>
                      {send.date.getDate()}
                    </span>
                    <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: C.light }}>
                      {send.date.toLocaleDateString("it-IT", { month: "short" }).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.black }}>{send.dayName}</p>
                    <p className="text-xs" style={{ color: C.light }}>
                      {send.date.toLocaleDateString("it-IT", { day: "numeric", month: "long" })} · ore 11:00
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                    style={{ background: C.bg, color: C.dark, border: `1px solid ${C.borderDark}` }}
                  >
                    {send.channel}
                  </span>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: C.black }}>{activeCount}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: C.light }}>iscritti</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-wider" style={{ color: C.light }}>
            Newsletter Lun–Ven · Preview 08:30 · Invio 11:00 CET
          </p>
        </div>

        {/* ── Result banner ──────────────────────────────────────────────────── */}
        {lastResult && (
          <div
            className="mb-6 p-4 rounded-xl flex items-start gap-3"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
          >
            <span className="text-green-600 mt-0.5">✓</span>
            <p className="text-sm" style={{ color: "#166534" }}>{lastResult}</p>
            <button onClick={() => setLastResult(null)} className="ml-auto text-xs" style={{ color: "#6e6e73" }}>✕</button>
          </div>
        )}

        {/* ── Griglia azioni + iscritti ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Colonna sinistra: azioni operative */}
          <div className="lg:col-span-1 space-y-4">

            {/* Test newsletter */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.black }}>
                Invio di Test
              </p>
              <p className="text-xs mb-3" style={{ color: C.mid }}>
                Genera le top 20 notizie AI e invia una email di test per verificare il template.
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
              <button
                onClick={() => { setSendingTest(true); sendTestMutation.mutate({ to: testEmail }); }}
                disabled={sendingTest}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: C.black, color: "#fff", fontFamily: C.font }}
              >
                {sendingTest ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Invio...
                  </span>
                ) : "Invia Email di Test →"}
              </button>
            </div>

            {/* Aggiorna news AI */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.black }}>
                Aggiorna News AI
              </p>
              <p className="text-xs mb-3" style={{ color: C.mid }}>
                Genera nuove notizie AI dalle fonti RSS. Lo scheduler parte automaticamente ogni notte.
              </p>
              <button
                onClick={() => { setRefreshingNews(true); refreshNewsMutation.mutate(); }}
                disabled={refreshingNews}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: C.black, color: "#fff", fontFamily: C.font }}
              >
                {refreshingNews ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generazione...
                  </span>
                ) : "Aggiorna News AI →"}
              </button>
            </div>

            {/* Genera immagini AI */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.black }}>
                Immagini AI Articoli
              </p>
              <p className="text-xs mb-3" style={{ color: C.mid }}>
                Genera immagini per news, reportage, analisi, editoriali e startup senza immagine (max 5 per tipo).
              </p>
              <button
                onClick={() => { setGeneratingImages(true); generateImagesMutation.mutate({ type: "all", limit: 5 }); }}
                disabled={generatingImages}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: C.black, color: "#fff", fontFamily: C.font }}
              >
                {generatingImages ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generazione immagini...
                  </span>
                ) : "Genera Immagini AI →"}
              </button>
            </div>

            {/* Newsletter canale */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.black }}>
                Newsletter Giornaliera
              </p>
              <p className="text-xs mb-3" style={{ color: C.mid }}>
                Lun–Ven · Preview 08:30 · Invio 11:00 CET
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => { setSendingChannelPreview(true); sendChannelPreviewMutation.mutate(); }}
                  disabled={sendingChannelPreview}
                  className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: C.bg, color: C.black, border: `1px solid ${C.border}`, fontFamily: C.font }}
                >
                  {sendingChannelPreview ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
                      Invio preview...
                    </span>
                  ) : "Invia Preview Canale di Oggi →"}
                </button>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "ai", label: "AI" },
                    { key: "startup", label: "Startup" },
                    { key: "dealroom", label: "Dealroom" },
                  ].map((ch) => (
                    <button
                      key={ch.key}
                      onClick={() => {
                        if (activeCount === 0) { toast.error("Nessun iscritto attivo"); return; }
                        setSendingChannelNewsletter(ch.key);
                        sendChannelNewsletterMutation.mutate({ channelKey: ch.key as "ai" | "startup", testOnly: false });
                      }}
                      disabled={sendingChannelNewsletter !== null}
                      className="px-2 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: C.bg, color: C.dark, border: `1px solid ${C.border}`, fontFamily: C.font }}
                    >
                      {sendingChannelNewsletter === ch.key ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        </span>
                      ) : ch.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* LinkedIn Autopost */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: C.black }}>
                LinkedIn Autopost
              </p>
              <p className="text-xs mb-3" style={{ color: C.mid }}>
                Pubblica 1 editoriale giornaliero su LinkedIn. Scheduler: ogni giorno alle 10:00 CET. Token scade ogni 2 mesi.
              </p>
              <button
                onClick={() => { setPublishingLinkedIn(true); setLinkedInResult(null); publishLinkedInMutation.mutate(); }}
                disabled={publishingLinkedIn}
                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 mb-3"
                style={{ background: "#0a66c2", color: "#fff", fontFamily: C.font }}
              >
                {publishingLinkedIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Pubblicazione...
                  </span>
                ) : "Pubblica Ora su LinkedIn →"}
              </button>
              {linkedInResult && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold" style={{ color: linkedInResult.published > 0 ? "#166534" : "#991b1b" }}>
                    {linkedInResult.published}/{linkedInResult.total} post pubblicati
                  </p>
                  {linkedInResult.posts.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span style={{ color: p.success ? "#166534" : "#991b1b" }}>{p.success ? "✓" : "✗"}</span>
                      <span style={{ color: C.mid }}>[{p.section.toUpperCase()}]</span>
                      <span className="truncate" style={{ color: C.dark }}>{p.title}</span>
                      {p.error && <span className="text-red-500 text-xs">{p.error.slice(0, 50)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Storico invii */}
            <div className="rounded-2xl p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.black }}>
                Storico Invii
              </p>
              {history.length === 0 ? (
                <p className="text-sm italic" style={{ color: C.light }}>Nessuna newsletter inviata ancora.</p>
              ) : (
                <div className="space-y-3">
                  {history.slice(-5).reverse().map((h) => (
                    <div key={h.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: "0.75rem" }} className="last:border-0 last:pb-0">
                      <p className="text-xs font-medium mb-1" style={{ color: C.dark }}>{h.subject}</p>
                      <div className="flex justify-between">
                        <span className="text-xs" style={{ color: C.light }}>{h.recipientCount} destinatari</span>
                        <span className="text-xs" style={{ color: C.light }}>
                          {h.sentAt ? new Date(h.sentAt).toLocaleDateString("it-IT") : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonna destra: tabella iscritti */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.white, border: `1px solid ${C.border}` }}
            >
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <p className="text-sm font-semibold" style={{ color: C.black }}>
                  Iscritti Newsletter ({subscribers.length})
                </p>
                <button
                  onClick={() => subscribersQuery.refetch()}
                  className="text-xs transition-colors"
                  style={{ color: C.light }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.dark)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.light)}
                >
                  ↻ Aggiorna
                </button>
              </div>

              {subscribersQuery.isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#e5e5ea] border-t-[#1d1d1f] rounded-full animate-spin mx-auto" />
                </div>
              ) : subscribers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm italic" style={{ color: C.light }}>Nessun iscritto ancora.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {["Email", "Nome", "Newsletter", "Stato", "Data", ""].map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${h === "" ? "text-right" : "text-left"}`}
                            style={{ color: C.light }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr
                          key={sub.id}
                          style={{ borderBottom: `1px solid ${C.border}` }}
                          className="transition-colors"
                          onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="px-4 py-3 text-sm" style={{ color: C.dark }}>{sub.email}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: C.mid }}>{sub.name ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: C.bg, color: C.dark, border: `1px solid ${C.border}` }}
                            >
                              {sub.newsletter ?? "Newsletter"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                background: sub.status === "active" ? "#e8f5e9" : "#fef2f2",
                                color: sub.status === "active" ? "#2e7d32" : "#991b1b",
                              }}
                            >
                              {sub.status === "active" ? "Attivo" : "Disattivato"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: C.light }}>
                            {new Date(sub.subscribedAt).toLocaleDateString("it-IT")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {sub.status === "active" && (
                                <button
                                  onClick={() => unsubscribeSubscriber.mutate({ email: sub.email })}
                                  className="text-xs transition-colors"
                                  style={{ color: C.light }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f57f17")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = C.light)}
                                >
                                  Disattiva
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Eliminare ${sub.email}?`)) deleteSubscriber.mutate({ id: sub.id });
                                }}
                                className="text-xs transition-colors"
                                style={{ color: C.light }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#991b1b")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = C.light)}
                              >
                                Elimina
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
