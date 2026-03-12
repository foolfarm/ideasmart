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
  const [testEmail, setTestEmail] = useState("ac@foolfarm.com");
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
  const [refreshingNews, setRefreshingNews] = useState(false);

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

  const triggerWeeklyMutation = trpc.admin.triggerWeeklyNewsletter.useMutation({
    onSuccess: (data) => {
      setSendingDark(false);
      setLastResult(`✓ Newsletter DARK inviata a ${data.recipientCount} iscritti — ${data.newsCount} notizie generate con template ufficiale`);
      toast.success(`Newsletter inviata a ${data.recipientCount} iscritti con template dark!`);
      historyQuery.refetch();
    },
    onError: (err) => {
      setSendingDark(false);
      toast.error("Errore invio: " + err.message);
    },
  });

  const sendWeeklyMutation = trpc.admin.sendWeeklyNewsletter.useMutation({
    onSuccess: (data) => {
      setSendingAll(false);
      setLastResult(`✓ Newsletter inviata a ${data.recipientCount} iscritti — ${data.newsCount} notizie per la settimana ${data.week}`);
      toast.success(`Newsletter inviata a ${data.recipientCount} iscritti!`);
      historyQuery.refetch();
    },
    onError: (err) => {
      setSendingAll(false);
      toast.error("Errore invio: " + err.message);
    },
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
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: "#00e5c8", color: "#0a0f1e" }}
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const subscribers = subscribersQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const activeCount = subscribers.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen" style={{ background: "#0a0f1e" }}>
      {/* Header */}
      <div className="border-b border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-white/40 hover:text-white transition-colors text-sm">
              ← IDEASMART
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-bold" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">{user.name ?? user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Iscritti totali", value: subscribers.length, color: "#00e5c8" },
            { label: "Iscritti attivi", value: activeCount, color: "#00e5c8" },
            { label: "Disattivati", value: subscribers.length - activeCount, color: "#ff5500" },
            { label: "Newsletter inviate", value: history.length, color: "#0066ff" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-3xl font-black mb-1" style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Result banner */}
        {lastResult && (
          <div className="mb-6 p-4 rounded-xl border border-[#00e5c8]/30" style={{ background: "rgba(0,229,200,0.06)" }}>
            <p className="text-sm font-medium" style={{ color: "#00e5c8", fontFamily: "'DM Sans', sans-serif" }}>{lastResult}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Send newsletter */}
          <div className="lg:col-span-1 space-y-6">

            {/* Test send */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
                ◆ Invio di Test
              </p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Genera le top 20 notizie AI della settimana con l'AI e invia una email di test per verificare il template.
              </p>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Email destinatario test"
                className="w-full px-3 py-2 rounded-lg text-sm border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#00e5c8] transition-colors mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <button
                onClick={() => {
                  if (!testEmail) return;
                  setSendingTest(true);
                  sendTestMutation.mutate({ to: testEmail });
                }}
                disabled={sendingTest || !testEmail}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {sendingTest ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                    Generazione notizie AI...
                  </span>
                ) : (
                  "Invia Email di Test →"
                )}
              </button>
            </div>

            {/* Send with dark template (official) */}
            <div className="rounded-2xl border border-[#00e5c8]/20 p-6" style={{ background: "rgba(0,229,200,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
                ◆ Invio Automatico — Template Dark
              </p>
              <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Routine settimanale ufficiale</p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Usa il <strong className="text-[#00e5c8]">template dark ufficiale</strong> IDEASMART. Genera 10 notizie AI con LLM e invia a tutti i <strong className="text-white">{activeCount} iscritti attivi</strong>. Questa è la stessa routine che parte automaticamente ogni lunedì alle 09:00.
              </p>
              <button
                onClick={() => {
                  if (activeCount === 0) { toast.error("Nessun iscritto attivo"); return; }
                  setSendingDark(true);
                  triggerWeeklyMutation.mutate();
                }}
                disabled={sendingDark || activeCount === 0}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#00e5c8", color: "#0a0f1e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {sendingDark ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                    Generazione notizie AI...
                  </span>
                ) : (
                  `Invia Newsletter Dark a ${activeCount} Iscritti →`
                )}
              </button>
            </div>

            {/* Send to all */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,85,0,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#ff5500", fontFamily: "'Space Grotesk', sans-serif" }}>
                ◆ Invio a Tutti gli Iscritti
              </p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Genera le top 20 notizie AI della settimana e invia la newsletter a tutti i <strong className="text-white">{activeCount} iscritti attivi</strong>.
              </p>
              <button
                onClick={() => {
                  if (activeCount === 0) { toast.error("Nessun iscritto attivo"); return; }
                  setSendingAll(true);
                  sendWeeklyMutation.mutate();
                }}
                disabled={sendingAll || activeCount === 0}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#ff5500]/40"
                style={{ background: "rgba(255,85,0,0.15)", color: "#ff5500", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {sendingAll ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
                    Invio in corso...
                  </span>
                ) : (
                  `Invia a ${activeCount} Iscritti →`
                )}
              </button>
            </div>

            {/* Refresh News */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(0,102,255,0.04)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#0066ff", fontFamily: "'Space Grotesk', sans-serif" }}>
                ◆ Aggiornamento News AI
              </p>
              <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Aggiornamento giornaliero automatico</p>
              <p className="text-xs text-white/50 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Genera 20 nuove notizie AI con LLM e aggiorna il sito. L'aggiornamento automatico avviene ogni 24 ore. Usa questo pulsante per un aggiornamento manuale immediato.
              </p>
              {newsRefreshHistoryQuery.data && newsRefreshHistoryQuery.data.length > 0 && (
                <p className="text-xs text-white/30 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
                style={{ background: "#0066ff", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}
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

            {/* Send history */}
            <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#0066ff", fontFamily: "'Space Grotesk', sans-serif" }}>
                ◆ Storico Invii
              </p>
              {history.length === 0 ? (
                <p className="text-xs text-white/30 italic">Nessuna newsletter inviata ancora.</p>
              ) : (
                <div className="space-y-3">
                  {history.slice(-5).reverse().map((h) => (
                    <div key={h.id} className="border-b border-white/6 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-white/80 leading-snug mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#00e5c8", fontFamily: "'Space Grotesk', sans-serif" }}>
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
                  <div className="w-6 h-6 border-2 border-[#00e5c8] border-t-transparent rounded-full animate-spin mx-auto" />
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
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Stato</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-white/30">Data</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-white/30">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3 text-sm text-white/80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {sub.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/50">{sub.name ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: sub.status === "active" ? "rgba(0,229,200,0.15)" : "rgba(255,85,0,0.15)",
                                color: sub.status === "active" ? "#00e5c8" : "#ff5500",
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
