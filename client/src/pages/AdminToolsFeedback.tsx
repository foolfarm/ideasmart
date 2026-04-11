/**
 * Admin — Tool Submissions & Newsletter Feedback
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminToolsFeedback() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"tools" | "feedback" | "opensource">("tools");

  // Queries
  const toolsQuery = trpc.toolSubmissions.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const feedbackQuery = trpc.newsletterFeedback.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const osToolsQuery = trpc.openSourceTools.getActive.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Mutations
  const updateToolStatus = trpc.toolSubmissions.updateStatus.useMutation({
    onSuccess: () => {
      toolsQuery.refetch();
      toast.success("Stato tool aggiornato");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // New OS tool form
  const [newOsTool, setNewOsTool] = useState({
    name: "",
    description: "",
    repoUrl: "",
    stars: 0,
    category: "",
  });

  const createOsTool = trpc.openSourceTools.add.useMutation({
    onSuccess: () => {
      osToolsQuery.refetch();
      setNewOsTool({ name: "", description: "", repoUrl: "", stars: 0, category: "" });
      toast.success("Tool OS aggiunto");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <p className="text-white/60 text-sm">Accesso riservato agli amministratori.</p>
      </div>
    );
  }

  const tools = toolsQuery.data ?? [];
  const feedbacks = feedbackQuery.data ?? [];
  const osTools = osToolsQuery.data ?? [];

  const pendingTools = tools.filter((t) => t.status === "pending");
  const approvedTools = tools.filter((t) => t.status === "approved" || t.status === "featured");

  // Feedback stats
  const feedbackStats = {
    great: feedbacks.filter((f) => f.rating === "great").length,
    good: feedbacks.filter((f) => f.rating === "good").length,
    meh: feedbacks.filter((f) => f.rating === "meh").length,
    bad: feedbacks.filter((f) => f.rating === "bad").length,
  };

  const F = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      {/* Header */}
      <div className="border-b border-white/8" style={{ background: "#060a14" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="text-white/40 hover:text-white transition-colors text-sm">
              ← Admin
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm font-bold text-white/80" style={{ fontFamily: F }}>
              Tool Submissions & Feedback
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">{user.name ?? user.email}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "tools" as const, label: "🛠️ Tool Submissions", count: pendingTools.length },
            { key: "feedback" as const, label: "📊 Feedback Newsletter", count: feedbacks.length },
            { key: "opensource" as const, label: "📦 Open Source Tools", count: osTools.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                fontFamily: F,
                background: tab === t.key ? "#ffffff" : "rgba(255,255,255,0.05)",
                color: tab === t.key ? "#0f0f0f" : "rgba(255,255,255,0.5)",
              }}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Tool Submissions Tab */}
        {tab === "tools" && (
          <div>
            {/* Pending */}
            <h2 className="text-lg font-bold text-white/80 mb-4" style={{ fontFamily: F }}>
              In attesa di approvazione ({pendingTools.length})
            </h2>
            {pendingTools.length === 0 ? (
              <div className="rounded-xl p-8 text-center mb-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white/40 text-sm">Nessun tool in attesa</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {pendingTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-xl p-5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-base" style={{ fontFamily: F }}>{tool.toolName}</h3>
                        <a href={tool.toolUrl} target="_blank" rel="noopener" className="text-xs text-cyan-400 hover:underline break-all">{tool.toolUrl}</a>
                        <p className="text-white/50 text-sm mt-2 leading-relaxed">{tool.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-white/30">
                          {tool.submitterName && <span>Da: {tool.submitterName}</span>}
                          {tool.submitterEmail && <span>{tool.submitterEmail}</span>}
                          <span>{new Date(tool.createdAt).toLocaleDateString("it-IT")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            const date = prompt("Data per la newsletter (YYYY-MM-DD):", new Date().toISOString().slice(0, 10));
                            if (date) {
                              updateToolStatus.mutate({ id: tool.id, status: "approved", featuredDate: date });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: "#22c55e", color: "#fff" }}
                        >
                          ✓ Approva
                        </button>
                        <button
                          onClick={() => updateToolStatus.mutate({ id: tool.id, status: "rejected" })}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}
                        >
                          ✗ Rifiuta
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved */}
            <h2 className="text-lg font-bold text-white/80 mb-4" style={{ fontFamily: F }}>
              Approvati ({approvedTools.length})
            </h2>
            {approvedTools.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white/40 text-sm">Nessun tool approvato</p>
              </div>
            ) : (
              <div className="space-y-2">
                {approvedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-lg p-4 flex items-center justify-between"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <span className="text-white font-bold text-sm">{tool.toolName}</span>
                      <span className="text-white/30 text-xs ml-2">— {tool.featuredDate ?? "non programmato"}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                      {tool.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {tab === "feedback" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { emoji: "😍", label: "Fantastica", count: feedbackStats.great, color: "#22c55e" },
                { emoji: "😊", label: "Buona", count: feedbackStats.good, color: "#3b82f6" },
                { emoji: "😐", label: "Così così", count: feedbackStats.meh, color: "#f59e0b" },
                { emoji: "😞", label: "Da migliorare", count: feedbackStats.bad, color: "#ef4444" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-5 text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: F }}>{s.count}</div>
                  <div className="text-xs text-white/40 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Feedback list */}
            <h2 className="text-lg font-bold text-white/80 mb-4" style={{ fontFamily: F }}>
              Feedback recenti ({feedbacks.length})
            </h2>
            {feedbacks.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white/40 text-sm">Nessun feedback ricevuto</p>
              </div>
            ) : (
              <div className="space-y-2">
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="rounded-lg p-4 flex items-center gap-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-2xl">
                      {fb.rating === "great" ? "😍" : fb.rating === "good" ? "😊" : fb.rating === "meh" ? "😐" : "😞"}
                    </span>
                    <div className="flex-1">
                      <div className="text-white/80 text-sm font-medium">{fb.newsletterDate ?? "—"}</div>
                      {fb.comment && <div className="text-white/50 text-xs mt-1">{fb.comment}</div>}
                      {fb.email && <div className="text-white/30 text-xs mt-1">{fb.email}</div>}
                    </div>
                    <span className="text-xs text-white/30">{new Date(fb.createdAt).toLocaleDateString("it-IT")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Open Source Tools Tab */}
        {tab === "opensource" && (
          <div>
            {/* Add new OS tool form */}
            <div
              className="rounded-xl p-6 mb-8"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h3 className="text-white font-bold text-sm mb-4" style={{ fontFamily: F }}>Aggiungi Open Source Tool</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newOsTool.name}
                  onChange={(e) => setNewOsTool((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nome (es. Ollama)"
                  className="rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <input
                  value={newOsTool.repoUrl}
                  onChange={(e) => setNewOsTool((p) => ({ ...p, repoUrl: e.target.value }))}
                  placeholder="URL repo (es. https://github.com/...)"
                  className="rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <input
                  value={newOsTool.description}
                  onChange={(e) => setNewOsTool((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descrizione breve"
                  className="rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 col-span-2"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <input
                  value={newOsTool.stars || ""}
                  onChange={(e) => setNewOsTool((p) => ({ ...p, stars: parseInt(e.target.value) || 0 }))}
                  placeholder="Stars GitHub"
                  type="number"
                  className="rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <input
                  value={newOsTool.category}
                  onChange={(e) => setNewOsTool((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Categoria (es. LLM, NLP, Vision)"
                  className="rounded-lg px-3 py-2 text-sm text-white placeholder-white/30"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <button
                onClick={() => {
                  if (!newOsTool.name || !newOsTool.repoUrl || !newOsTool.description) {
                    toast.error("Compila nome, URL e descrizione");
                    return;
                  }
                  createOsTool.mutate(newOsTool);
                }}
                disabled={createOsTool.isPending}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ background: "#ffffff", color: "#0f0f0f" }}
              >
                {createOsTool.isPending ? "Salvataggio..." : "Aggiungi Tool"}
              </button>
            </div>

            {/* OS Tools list */}
            <h2 className="text-lg font-bold text-white/80 mb-4" style={{ fontFamily: F }}>
              Open Source Tools ({osTools.length})
            </h2>
            {osTools.length === 0 ? (
              <div className="rounded-xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-white/40 text-sm">Nessun tool OS inserito</p>
              </div>
            ) : (
              <div className="space-y-2">
                {osTools.map((tool: any) => (
                  <div
                    key={tool.id}
                    className="rounded-lg p-4 flex items-center justify-between"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tool.emoji ?? "📦"}</span>
                      <div>
                        <a href={tool.repoUrl} target="_blank" rel="noopener" className="text-white font-bold text-sm hover:underline">{tool.name}</a>
                        <div className="text-white/40 text-xs mt-0.5">{tool.description?.slice(0, 80)}...</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {tool.stars ? <span className="text-xs text-white/40">⭐ {tool.stars.toLocaleString()}</span> : null}
                      <span className="text-xs px-2 py-1 rounded" style={{ background: tool.active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: tool.active ? "#22c55e" : "#ef4444" }}>
                        {tool.active ? "attivo" : "disattivo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
