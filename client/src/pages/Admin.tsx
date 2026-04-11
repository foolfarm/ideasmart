/**
 * IDEASMART Admin Dashboard
 * Gestione iscritti newsletter + invio newsletter settimanale
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [testEmail, setTestEmail] = useState("ac@acinelli.com");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Queries
  const subscribersQuery = trpc.admin.getSubscribers.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const historyQuery = trpc.admin.getNewsletterHistory.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const newSiteUsersQuery = trpc.admin.getNewSiteUsers.useQuery(undefined, {
    enabled: user?.role === "admin",
    refetchInterval: 60_000, // aggiorna ogni minuto
  });

  // Mutations
  const deleteSubscriber = trpc.admin.deleteSubscriber.useMutation({
    onSuccess: () => {
      subscribersQuery.refetch();
      toast.success("Iscritto rimosso");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const unsubscribeSubscriber = trpc.admin.unsubscribeSubscriber.useMutation({
    onSuccess: () => {
      subscribersQuery.refetch();
      toast.success("Iscritto disattivato");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const sendTestMutation = trpc.admin.sendTestEmail.useMutation({
    onSuccess: (data) => {
      setSendingTest(false);
      setLastResult(`✓ Email di test inviata a ${data.to} — ${data.newsCount} notizie generate per la settimana ${data.week}`);
      toast.success(`Email di test inviata a ${data.to}!`);
      historyQuery.refetch();
    },
    onError: (err) => {
      setSendingTest(false);
      toast.error("Errore invio: " + err.message);
    },
  });

  const [sendingDark, setSendingDark] = useState(false);
  const [sendingChannelPreview, setSendingChannelPreview] = useState(false);
  const [sendingChannelNewsletter, setSendingChannelNewsletter] = useState<string | null>(null);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [publishingLinkedIn, setPublishingLinkedIn] = useState(false);
  const [linkedInResult, setLinkedInResult] = useState<{ published: number; total: number; posts: Array<{ section: string; title: string; success: boolean; error?: string }> } | null>(null);

  const sendChannelPreviewMutation = trpc.admin.sendDailyChannelPreview.useMutation({
    onSuccess: (data) => {
      setSendingChannelPreview(false);
      setLastResult(`✓ Preview ${data.channel} inviata a ac@acinelli.com — ${data.newsCount} notizie`);
      toast.success(`👁️ Preview ${data.channel} inviata!`);
    },
    onError: (err) => {
      setSendingChannelPreview(false);
      toast.error("Errore preview: " + err.message);
    },
  });

  const sendChannelNewsletterMutation = trpc.admin.sendChannelNewsletter.useMutation({
    onSuccess: (data) => {
      setSendingChannelNewsletter(null);
      setLastResult(`✓ Newsletter ${data.channel} inviata a ${data.recipientCount} iscritti — ${data.newsCount} notizie`);
      toast.success(`📧 ${data.channel}: ${data.recipientCount} iscritti raggiunti!`);
      historyQuery.refetch();
    },
    onError: (err) => {
      setSendingChannelNewsletter(null);
      toast.error("Errore invio: " + err.message);
    },
  });


  const publishLinkedInMutation = trpc.admin.publishLinkedIn.useMutation({
    onSuccess: (data) => {
      setPublishingLinkedIn(false);
      setLinkedInResult({ published: data.published, total: data.total, posts: data.posts });
      setLastResult(`✓ LinkedIn: ${data.published}/${data.total} post pubblicati`);
      toast.success(`💼 ${data.published}/${data.total} post LinkedIn pubblicati!`);
    },
    onError: (err) => {
      setPublishingLinkedIn(false);
      toast.error("Errore LinkedIn: " + err.message);
    },
  });


  const generateImagesMutation = trpc.admin.generateArticleImages.useMutation({
    onSuccess: (data) => {
      setGeneratingImages(false);
      setLastResult(`✓ Immagini generate: ${data.generated} articoli aggiornati`);
      toast.success(`${data.generated} immagini AI generate con successo!`);
    },
    onError: (err) => {
      setGeneratingImages(false);
      toast.error("Errore generazione immagini: " + err.message);
    },
  });

  // News management
  const newsQuery = trpc.news.getLatest.useQuery({ limit: 20 }, { enabled: user?.role === "admin" });
  const newsRefreshHistoryQuery = trpc.news.getRefreshHistory.useQuery(undefined, { enabled: user?.role === "admin" });

  const refreshNewsMutation = trpc.admin.refreshNews.useMutation({
    onSuccess: (data) => {
      setRefreshingNews(false);
      setLastResult(`✓ News aggiornate: ${data.count} notizie generate dall'AI`);
      toast.success(`${data.count} notizie AI aggiornate con successo!`);
      newsQuery.refetch();
      newsRefreshHistoryQuery.refetch();
    },
    onError: (err) => {
      setRefreshingNews(false);
      toast.error("Errore aggiornamento news: " + err.message);
    },
  });



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <div className="text-center">
          <p className="text-white/60 mb-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            Accesso riservato agli amministratori.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: "#1a1a1a", color: "#0f0f0f" }}
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
  const aiSubscribers = subscribers.filter((s) => s.status === "active" && (s.newsletter === "ai4business" || s.newsletter === "both")).length;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      {/* Header */}
      <div className="border-b border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-white/40 hover:text-white transition-colors text-sm">
              ← Proof Press
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-bold" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              Admin Dashboard
            </span>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/newsletter-performance")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1a1a1a")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              📊 Performance
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/audit")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f59e0b")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              🔍 Audit Contenuti
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/rss-monitor")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1a1a1a")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              📡 Monitor RSS
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/newsletter-content")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              🛒 Contenuti NL
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/sendgrid-stats")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#22c55e")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              📧 Email Stats
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/tools-feedback")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#06b6d4")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              🛠️ Tools & Feedback
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/system-health")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f97316")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              🟠 Salute Sistema
            </button>
            <span className="text-white/20">·</span>
            <button
              onClick={() => navigate("/admin/alert-log")}
              className="text-xs font-bold transition-colors"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fb923c")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              🔔 Alert Log
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">{user.name ?? user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Iscritti newsletter", value: subscribers.length, color: "#ffffff" },
            { label: "AI NEWS attivi", value: aiSubscribers, color: "#ffffff" },
            { label: "Newsletter inviate", value: history.length, color: "#60a5fa" },
            { label: "Utenti registrati", value: newSiteUsersData?.totalCount ?? "—", color: "#34d399" }
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-3xl font-black mb-1" style={{ color: stat.color, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Widget Nuovi Iscritti 24h */}
        <div className="rounded-2xl border border-emerald-500/30 p-6 mb-8" style={{ background: "rgba(52,211,153,0.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#34d399", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Nuovi Iscritti — Ultime 24 ore
              </p>
            </div>
            <span className="text-2xl font-black" style={{ color: "#34d399", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
              {newSiteUsersData?.newCount ?? 0}
            </span>
          </div>
          {newSiteUsersQuery.isLoading ? (
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
              Caricamento...
            </div>
          ) : newSiteUsersData && newSiteUsersData.newUsers.length > 0 ? (
            <div className="space-y-2">
              {newSiteUsersData.newUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{u.username}</p>
                      <p className="text-xs text-white/40">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.emailVerified ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>✓ Verificato</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>In attesa</span>
                    )}
                    <span className="text-[10px] text-white/30">
                      {new Date(u.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 italic">Nessun nuovo iscritto nelle ultime 24 ore.</p>
          )}
        </div>

        {/* Widget Prossimi Invii Newsletter — Lun/Mer/Ven con Canale Rotante */}
        {(() => {
          const ALL_CHANNELS = [
            { slug: "ai", label: "AI NEWS", color: "#1a1a1a" },
            { slug: "copy-paste-ai", label: "PROMPT AI", color: "#7c3aed" },
            { slug: "automate-with-ai", label: "USE CASE AI", color: "#d97706" },
            { slug: "make-money-with-ai", label: "FARE SOLDI", color: "#16a34a" },
            { slug: "daily-ai-tools", label: "AI TOOLS", color: "#2563eb" },
            { slug: "verified-ai-news", label: "PROOFPRESS VERIFY", color: "#dc2626" },
            { slug: "ai-opportunities", label: "AI INVEST", color: "#16a34a" },
            { slug: "research", label: "AI RESEARCH", color: "#2563eb" },
            { slug: "dealroom", label: "AI VENTURE", color: "#7c3aed" },
            { slug: "ai-invest", label: "AI INVEST", color: "#16a34a" },
            { slug: "startup", label: "AI STARTUP NEWS", color: "#ea580c" },
            { slug: "dealflow", label: "AI DEALFLOW", color: "#0891b2" },
            { slug: "ai-radar", label: "AI RADAR", color: "#dc2626" },
          ];
          const now = new Date();
          const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
          const upcomingSends: Array<{ date: Date; dayName: string; channel: typeof ALL_CHANNELS[0] }> = [];
          for (let i = 0; i < 30 && upcomingSends.length < 6; i++) {
            const candidate = new Date(now);
            candidate.setDate(now.getDate() + i);
            candidate.setHours(10, 30, 0, 0);
            const dow = candidate.getDay();
            if (dow !== 1 && dow !== 3 && dow !== 5) continue; // solo lun/mer/ven
            if (candidate <= now) continue;
            const dayOfYear = Math.floor((candidate.getTime() - new Date(candidate.getFullYear(), 0, 0).getTime()) / 86400000);
            const chIdx = dayOfYear % ALL_CHANNELS.length;
            upcomingSends.push({
              date: candidate,
              dayName: dayNames[dow],
              channel: ALL_CHANNELS[chIdx],
            });
          }
          return (
            <div className="rounded-2xl border border-blue-500/30 p-6 mb-8" style={{ background: "rgba(59,130,246,0.05)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#60a5fa", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Prossimi Invii Newsletter
                </p>
              </div>
              <div className="space-y-3">
                {upcomingSends.map((send, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg" style={{ background: "rgba(59,130,246,0.2)" }}>
                        <span className="text-[16px] font-black leading-none" style={{ color: "#60a5fa" }}>
                          {send.date.getDate()}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: "rgba(96,165,250,0.7)" }}>
                          {send.date.toLocaleDateString("it-IT", { month: "short" }).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          {send.dayName}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          {send.date.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })} alle 10:30
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded" style={{ background: send.channel.color, color: "#fff" }}>
                        {send.channel.label}
                      </span>
                      <div className="text-right">
                        <p className="text-lg font-black" style={{ color: "#60a5fa", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                          {activeCount}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>iscritti</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Newsletter Lun/Mer/Ven · Preview: 08:30 CET · Invio: 10:30 CET · 13 canali in rotazione
              </p>
            </div>
          );
        })()}

        {/* Result banner */}
        {lastResult && (
          <div className="mb-6 p-4 rounded-xl border border-[#1a1a1a]/30" style={{ background: "rgba(0,229,200,0.06)" }}>
            <p className="text-sm font-medium" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>{lastResult}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Send newsletter */}
          <div className="lg:col-span-1 space-y-6">

            {/* Test send */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                ◆ Invio di Test
              </p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Genera le top 20 notizie AI della settimana con l'AI e invia una email di test per verificare il template.
              </p>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Email destinatario test"
                className="w-full px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#1a1a1a] transition-colors mb-3"
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              />
              <button
                onClick={() => {
                  if (!testEmail) return;
                  setSendingTest(true);
                  sendTestMutation.mutate({ to: testEmail });
                }}
                disabled={sendingTest || !testEmail}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#1a1a1a", color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                {sendingTest ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0f0f0f] border-t-transparent rounded-full animate-spin" />
                    Generazione notizie AI...
                  </span>
                ) : (
                  "Invia Email di Test →"
                )}
              </button>
            </div>

            {/* Refresh News */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(0,102,255,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#0066ff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                ◆ Aggiornamento News AI
              </p>
              <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Aggiornamento giornaliero automatico</p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Genera 20 nuove notizie AI con LLM e aggiorna il sito. L'aggiornamento automatico avviene ogni 24 ore. Usa questo pulsante per un aggiornamento manuale immediato.
              </p>
              {newsRefreshHistoryQuery.data && newsRefreshHistoryQuery.data.length > 0 && (
                <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Ultimo aggiornamento: {new Date(newsRefreshHistoryQuery.data[0].createdAt).toLocaleString("it-IT")}
                  {" — "}{newsRefreshHistoryQuery.data[0].itemCount} notizie
                </p>
              )}
              <button
                onClick={() => {
                  setRefreshingNews(true);
                  refreshNewsMutation.mutate();
                }}
                disabled={refreshingNews}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#0066ff", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                {refreshingNews ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generazione notizie AI...
                  </span>
                ) : (
                  `Aggiorna News AI Ora →`
                )}
              </button>
            </div>

            {/* Genera Immagini AI */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(139,92,246,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                ◆ Immagini AI Articoli
              </p>
              <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Genera immagini per tutti i tipi di articolo</p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Genera immagini AI per news, reportage, analisi, editoriali e startup senza immagine (max 5 per tipo). Le immagini vengono salvate automaticamente nel database.
              </p>
              <button
                onClick={() => {
                  setGeneratingImages(true);
                  generateImagesMutation.mutate({ type: "all", limit: 5 });
                }}
                disabled={generatingImages}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#2a2a2a", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                {generatingImages ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generazione immagini AI...
                  </span>
                ) : (
                  `Genera Immagini AI →`
                )}
              </button>
            </div>

            {/* Newsletter Giornaliera Unificata */}
            <div className="rounded-2xl border border-[#1a1a1a]/20 p-6" style={{ background: "rgba(0,229,200,0.03)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                📧 Newsletter Giornaliera Unificata
              </p>
              <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Lun/Mer/Ven — Preview 08:30 · Invio 10:30 CET · 13 canali in rotazione</p>
              {/* Prossimi Invii Newsletter con canale rotante */}
              {(() => {
                const ALL_CH = [
                  { label: "AI NEWS", color: "#1a1a1a" },
                  { label: "PROMPT AI", color: "#7c3aed" },
                  { label: "USE CASE AI", color: "#d97706" },
                  { label: "FARE SOLDI", color: "#16a34a" },
                  { label: "AI TOOLS", color: "#2563eb" },
                  { label: "PROOFPRESS VERIFY", color: "#dc2626" },
                  { label: "AI INVEST", color: "#16a34a" },
                  { label: "AI RESEARCH", color: "#2563eb" },
                  { label: "AI VENTURE", color: "#7c3aed" },
                  { label: "AI INVEST", color: "#16a34a" },
                  { label: "AI STARTUP NEWS", color: "#ea580c" },
                  { label: "AI DEALFLOW", color: "#0891b2" },
                  { label: "AI RADAR", color: "#dc2626" },
                ];
                const now = new Date();
                const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
                const upcoming: Array<{ label: string; dateStr: string; isToday: boolean; channel: typeof ALL_CH[0] }> = [];
                for (let i = 0; i < 30 && upcoming.length < 4; i++) {
                  const d = new Date(now);
                  d.setDate(now.getDate() + i);
                  d.setHours(10, 30, 0, 0);
                  const dow = d.getDay();
                  if (dow !== 1 && dow !== 3 && dow !== 5) continue;
                  if (d <= now) continue;
                  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
                  const chIdx = dayOfYear % ALL_CH.length;
                  upcoming.push({
                    label: i === 0 ? "Oggi" : i === 1 ? "Domani" : dayNames[dow],
                    dateStr: d.toLocaleDateString("it-IT", { day: "numeric", month: "short" }),
                    isToday: i === 0,
                    channel: ALL_CH[chIdx],
                  });
                }
                return (
                  <div className="mb-4 rounded-lg border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="px-3 py-2 border-b border-white/8">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Prossimi Invii</span>
                      <span className="text-[10px] text-white/20 ml-2">· Preview 08:30 · Invio 10:30 CET</span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/8">
                          <th className="px-3 py-2 text-left text-white/30 font-bold uppercase tracking-wider">Data</th>
                          <th className="px-3 py-2 text-left text-white/30 font-bold uppercase tracking-wider">Canale</th>
                          <th className="px-3 py-2 text-right text-white/30 font-bold uppercase tracking-wider">Iscritti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcoming.map((row, i) => (
                          <tr key={i} className={`border-b border-white/4 last:border-0 ${row.isToday ? "bg-white/5" : ""}`}>
                            <td className="px-3 py-2">
                              <span className={`font-bold ${row.isToday ? "text-yellow-400" : "text-white/70"}`}>{row.label}</span>
                              <span className="text-white/30 ml-1">{row.dateStr}</span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: row.channel.color, color: "#fff" }}>
                                {row.channel.label}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="font-bold text-white/80">{activeCount}</span>
                              <span className="text-white/30 ml-1">attivi</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSendingChannelPreview(true);
                    sendChannelPreviewMutation.mutate();
                  }}
                  disabled={sendingChannelPreview}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: "rgba(0,229,200,0.15)", color: "#1a1a1a", border: "1px solid rgba(0,229,200,0.3)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  {sendingChannelPreview ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                      Invio preview...
                    </span>
                  ) : (
                    "👁️ Invia Preview Canale di Oggi →"
                  )}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "ai", label: "AI", color: "#1a1a1a" },
                    { key: "startup", label: "Startup", color: "#2a2a2a" },
                    { key: "dealroom", label: "DEALROOM", color: "#2a2a2a" }
                  ].map((ch) => (
                    <button
                      key={ch.key}
                      onClick={() => {
                        if (activeCount === 0) { toast.error("Nessun iscritto attivo"); return; }
                        setSendingChannelNewsletter(ch.key);
                        sendChannelNewsletterMutation.mutate({ channelKey: ch.key as "ai" | "startup", testOnly: false });
                      }}
                      disabled={sendingChannelNewsletter !== null}
                      className="px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      style={{ background: `${ch.color}22`, color: ch.color, border: `1px solid ${ch.color}44`, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {sendingChannelNewsletter === ch.key ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ...
                        </span>
                      ) : (
                        `📧 ${ch.label}`
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* LinkedIn Autopost */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(0,102,255,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#0a66c2", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                ◆ LinkedIn Autopost
              </p>
              <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>Pubblica 1 editoriale giornaliero su LinkedIn — tono HumanLess, analisi da senior analyst</p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                Genera un post thought leader dall'editoriale AI o Startup del giorno (alternanza automatica).
                Testo con dati da fonti autorevoli (McKinsey, Gartner, CBInsights), immagine pertinente, link verso Proof Press.
                Lo scheduler parte ogni giorno alle <strong className="text-white">10:00 CET</strong>. Token scade ogni 2 mesi.
              </p>
              <button
                onClick={() => {
                  setPublishingLinkedIn(true);
                  setLinkedInResult(null);
                  publishLinkedInMutation.mutate();
                }}
                disabled={publishingLinkedIn}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                style={{ background: "#0a66c2", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                {publishingLinkedIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Pubblicazione in corso...
                  </span>
                ) : (
                  `💼 Pubblica Ora su LinkedIn →`
                )}
              </button>
              {linkedInResult && (
                <div className="space-y-2">
                  <p className="text-xs font-bold" style={{ color: linkedInResult.published > 0 ? "#1a1a1a" : "#2a2a2a" }}>
                    {linkedInResult.published}/{linkedInResult.total} post pubblicati
                  </p>
                  {linkedInResult.posts.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span style={{ color: p.success ? "#1a1a1a" : "#2a2a2a" }}>{p.success ? "✓" : "✗"}</span>
                      <span className="text-white/60">[{p.section.toUpperCase()}]</span>
                      <span className="text-white/80 truncate">{p.title}</span>
                      {p.error && <span className="text-red-400 text-xs">{p.error.slice(0, 50)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send history */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#0066ff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                ◆ Storico Invii
              </p>
              {history.length === 0 ? (
                <p className="text-xs text-white/30 italic">Nessuna newsletter inviata ancora.</p>
              ) : (
                <div className="space-y-3">
                  {history.slice(-5).reverse().map((h) => (
                    <div key={h.id} className="border-b border-white/6 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-white/80 leading-snug mb-1" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                        {h.subject}
                      </p>
                      <div className="flex justify-between">
                        <span className="text-xs text-white/30">{h.recipientCount} destinatari</span>
                        <span className="text-xs text-white/25">
                          {h.sentAt ? new Date(h.sentAt).toLocaleDateString("it-IT") : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Subscribers table */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  ◆ Iscritti Newsletter ({subscribers.length})
                </p>
                <button
                  onClick={() => subscribersQuery.refetch()}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  ↻ Aggiorna
                </button>
              </div>

              {subscribersQuery.isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : subscribers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white/30 text-sm">Nessun iscritto ancora.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/6">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Newsletter</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Stato</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Data</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-white/30">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3 text-sm text-white/80" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                            {sub.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/50">{sub.name ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: "rgba(0,102,255,0.15)",
                                color: "#60a5fa",
                              }}
                            >
                              {sub.newsletter ?? "Newsletter"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: sub.status === "active" ? "rgba(0,229,200,0.15)" : "rgba(255,85,0,0.15)",
                                color: sub.status === "active" ? "#1a1a1a" : "#2a2a2a",
                              }}
                            >
                              {sub.status === "active" ? "Attivo" : "Disattivato"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-white/30">
                            {new Date(sub.subscribedAt).toLocaleDateString("it-IT")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.status === "active" && (
                                <button
                                  onClick={() => unsubscribeSubscriber.mutate({ email: sub.email })}
                                  className="text-xs text-white/30 hover:text-orange-400 transition-colors"
                                  title="Disattiva"
                                >
                                  Disattiva
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Eliminare ${sub.email}?`)) {
                                    deleteSubscriber.mutate({ id: sub.id });
                                  }
                                }}
                                className="text-xs text-white/30 hover:text-red-400 transition-colors"
                                title="Elimina"
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
