/**
 * AdminJournalists — Gestione Account Giornalisti + Coda di Moderazione
 * Tab 1: Account giornalisti (crea, attiva/disattiva, reset pwd, elimina)
 * Tab 2: Coda revisione (approva/rifiuta articoli in stato "review")
 * Stile Apple monocromatico coerente con Admin.tsx
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
  orange: "#ff5500",
  green: "#34c759",
  red: "#ff3b30",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
};

// ─── Tipi ────────────────────────────────────────────────────────────────────
type Journalist = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
  journalistKey: string;
  isActive: boolean;
  totalArticles: number;
  createdAt: Date;
  lastLoginAt: Date | null;
};

type PendingArticle = {
  id: number;
  journalistId: number;
  title: string;
  body: string;
  summary: string | null;
  category: string;
  imageUrl: string | null;
  status: string;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  journalistDisplayName: string;
  journalistUsername: string;
  journalistKey: string;
};

const EMPTY_FORM = {
  username: "",
  password: "",
  displayName: "",
  email: "",
  bio: "",
  linkedinUrl: "",
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
function AdminNavbar({ user, navigate }: { user: any; navigate: (p: string) => void }) {
  return (
    <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => navigate("/")} className="text-sm transition-colors px-2 py-1 rounded-md hover:bg-[#f5f5f7]" style={{ color: C.mid }}>← ProofPress</button>
          <span style={{ color: C.border }}>/</span>
          <button onClick={() => navigate("/admin")} className="text-sm transition-colors px-2 py-1 rounded-md hover:bg-[#f5f5f7]" style={{ color: C.mid }}>Admin</button>
          <span style={{ color: C.border }}>/</span>
          <span className="text-sm font-semibold px-2" style={{ color: C.black }}>Giornalisti</span>
          {[
            { label: "Performance", path: "/admin/newsletter-performance" },
            { label: "Pubblicità", path: "/admin/pubblicita" },
            { label: "Audit Contenuti", path: "/admin/audit" },
            { label: "Monitor RSS", path: "/admin/rss-monitor" },
            { label: "Email Stats", path: "/admin/sendgrid-stats" },
            { label: "Salute Sistema", path: "/admin/system-health" },
            { label: "Alert Log", path: "/admin/alert-log" },
            { label: "Amazon Deals", path: "/admin/amazon-deals" },
          ].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className="text-xs transition-colors px-2 py-1 rounded-md hover:bg-[#f5f5f7]" style={{ color: C.mid }}>{item.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs" style={{ color: C.mid }}>{user.name ?? user.email}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Accounts ─────────────────────────────────────────────────────────────
function AccountsTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showKey, setShowKey] = useState<number | null>(null);

  const journalistsQuery = trpc.journalistAdmin.list.useQuery();

  const createMutation = trpc.journalistAdmin.create.useMutation({
    onSuccess: (data) => {
      setCreating(false);
      setShowCreateForm(false);
      setForm(EMPTY_FORM);
      journalistsQuery.refetch();
      toast.success(`Account "${data.username}" creato! Key: ${data.journalistKey.substring(0, 8)}...`);
    },
    onError: (err) => { setCreating(false); toast.error("Errore: " + err.message); },
  });

  const toggleActiveMutation = trpc.journalistAdmin.toggleActive.useMutation({
    onSuccess: (_, vars) => { journalistsQuery.refetch(); toast.success(vars.isActive ? "Account attivato" : "Account disattivato"); },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const resetPasswordMutation = trpc.journalistAdmin.resetPassword.useMutation({
    onSuccess: () => { setResettingPassword(false); setResetPasswordId(null); setNewPassword(""); toast.success("Password aggiornata"); },
    onError: (err) => { setResettingPassword(false); toast.error("Errore: " + err.message); },
  });

  const deleteMutation = trpc.journalistAdmin.delete.useMutation({
    onSuccess: () => { setDeleteConfirmId(null); journalistsQuery.refetch(); toast.success("Account eliminato"); },
    onError: (err) => { setDeleteConfirmId(null); toast.error("Errore: " + err.message); },
  });

  const journalists: Journalist[] = (journalistsQuery.data ?? []) as Journalist[];
  const activeCount = journalists.filter((j) => j.isActive).length;
  const totalArticles = journalists.reduce((sum, j) => sum + j.totalArticles, 0);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.password || !form.displayName || !form.email) { toast.error("Compila tutti i campi obbligatori"); return; }
    setCreating(true);
    createMutation.mutate({ username: form.username, password: form.password, displayName: form.displayName, email: form.email, bio: form.bio || undefined, linkedinUrl: form.linkedinUrl || undefined });
  }

  function handleResetPassword(id: number) {
    if (!newPassword || newPassword.length < 6) { toast.error("La password deve essere di almeno 6 caratteri"); return; }
    setResettingPassword(true);
    resetPasswordMutation.mutate({ id, newPassword });
  }

  return (
    <div>
      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: "Account totali", value: journalists.length }, { label: "Account attivi", value: activeCount }, { label: "Articoli pubblicati", value: totalArticles }].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl p-5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <p className="text-3xl font-semibold mb-1" style={{ color: C.black }}>{kpi.value}</p>
            <p className="text-xs" style={{ color: C.mid }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Bottone crea */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ background: showCreateForm ? C.border : C.black, color: showCreateForm ? C.black : "#fff" }}>
          {showCreateForm ? "✕ Annulla" : "+ Nuovo Giornalista"}
        </button>
      </div>

      {/* Form creazione */}
      {showCreateForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: C.cardBg, border: `1px solid ${C.borderDark}` }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: C.black }}>Crea Nuovo Account Giornalista</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                { key: "username", label: "Username", placeholder: "es. mario.rossi", type: "text", required: true },
                { key: "password", label: "Password", placeholder: "Min. 6 caratteri", type: "password", required: true },
                { key: "displayName", label: "Nome visualizzato", placeholder: "es. Mario Rossi", type: "text", required: true },
                { key: "email", label: "Email", placeholder: "mario@esempio.it", type: "email", required: true },
              ].map(({ key, label, placeholder, type, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>{label} {required && <span style={{ color: C.red }}>*</span>}</label>
                  <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.black, fontFamily: C.font }} required={required} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>Bio (opzionale)</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.black, fontFamily: C.font }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>LinkedIn URL (opzionale)</label>
                <input type="url" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.black, fontFamily: C.font }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={creating} className="px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: C.black, color: "#fff" }}>{creating ? "Creazione..." : "Crea Account"}</button>
              <button type="button" onClick={() => { setShowCreateForm(false); setForm(EMPTY_FORM); }} className="px-5 py-2 rounded-lg text-sm" style={{ background: C.border, color: C.black }}>Annulla</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabella */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h2 className="text-sm font-semibold" style={{ color: C.black }}>Account Giornalisti ({journalists.length})</h2>
        </div>
        {journalistsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>
        ) : journalists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-2xl">👤</span>
            <p className="text-sm font-medium" style={{ color: C.dark }}>Nessun giornalista accreditato</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: C.border }}>
            {journalists.map((j) => (
              <div key={j.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: C.black }}>{j.displayName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: j.isActive ? "#d1fae5" : "#fee2e2", color: j.isActive ? "#065f46" : "#991b1b" }}>{j.isActive ? "Attivo" : "Disattivato"}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.bg, color: C.mid }}>{j.totalArticles} articoli</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: C.mid }}>
                      <span>@{j.username}</span><span>·</span><span>{j.email}</span><span>·</span>
                      <span>Creato: {new Date(j.createdAt).toLocaleDateString("it-IT")}</span>
                      {j.lastLoginAt && (<><span>·</span><span>Ultimo login: {new Date(j.lastLoginAt).toLocaleDateString("it-IT")}</span></>)}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: C.mid }}>Key:</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: C.bg, color: C.dark }}>
                        {showKey === j.id ? j.journalistKey : `${j.journalistKey.substring(0, 8)}••••••••••••`}
                      </span>
                      <button onClick={() => setShowKey(showKey === j.id ? null : j.id)} className="text-xs" style={{ color: C.mid }}>{showKey === j.id ? "Nascondi" : "Mostra"}</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActiveMutation.mutate({ id: j.id, isActive: !j.isActive })} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: j.isActive ? "#fee2e2" : "#d1fae5", color: j.isActive ? "#991b1b" : "#065f46" }}>{j.isActive ? "Disattiva" : "Attiva"}</button>
                    <button onClick={() => { setResetPasswordId(resetPasswordId === j.id ? null : j.id); setNewPassword(""); }} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: C.bg, color: C.dark, border: `1px solid ${C.border}` }}>Reset pwd</button>
                    <button onClick={() => setDeleteConfirmId(deleteConfirmId === j.id ? null : j.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "#fee2e2", color: "#991b1b" }}>Elimina</button>
                  </div>
                </div>
                {resetPasswordId === j.id && (
                  <div className="mt-3 p-3 rounded-xl flex items-center gap-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nuova password (min. 6 caratteri)" className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none" style={{ background: C.white, border: `1px solid ${C.border}`, color: C.black }} />
                    <button onClick={() => handleResetPassword(j.id)} disabled={resettingPassword} className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50" style={{ background: C.black, color: "#fff" }}>{resettingPassword ? "..." : "Conferma"}</button>
                    <button onClick={() => { setResetPasswordId(null); setNewPassword(""); }} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: C.border, color: C.dark }}>Annulla</button>
                  </div>
                )}
                {deleteConfirmId === j.id && (
                  <div className="mt-3 p-3 rounded-xl flex items-center gap-3" style={{ background: "#fff5f5", border: `1px solid #fecaca` }}>
                    <p className="flex-1 text-xs" style={{ color: "#991b1b" }}>
                      Eliminare <strong>@{j.username}</strong>?{j.totalArticles > 0 && " Ha articoli pubblicati: non può essere eliminato."}
                    </p>
                    {j.totalArticles === 0 && <button onClick={() => deleteMutation.mutate({ id: j.id })} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: C.red, color: "#fff" }}>Elimina</button>}
                    <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: C.border, color: C.dark }}>Annulla</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab Coda Revisione ───────────────────────────────────────────────────────
function ReviewQueueTab() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const pendingQuery = trpc.journalistAdmin.listPendingReview.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const approveMutation = trpc.journalistAdmin.approveArticle.useMutation({
    onSuccess: (_, vars) => {
      pendingQuery.refetch();
      toast.success("Articolo approvato e pubblicato su ProofPress");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const rejectMutation = trpc.journalistAdmin.rejectArticle.useMutation({
    onSuccess: () => {
      setRejectId(null);
      setRejectNotes("");
      pendingQuery.refetch();
      toast.success("Articolo rifiutato con note di feedback");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const articles: PendingArticle[] = (pendingQuery.data ?? []) as PendingArticle[];

  return (
    <div>
      {/* Header coda */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl px-5 py-4" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <p className="text-3xl font-semibold" style={{ color: C.black }}>{articles.length}</p>
            <p className="text-xs mt-1" style={{ color: C.mid }}>Articoli in attesa</p>
          </div>
        </div>
        <button onClick={() => pendingQuery.refetch()} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: C.bg, color: C.mid, border: `1px solid ${C.border}` }}>
          ↻ Aggiorna
        </button>
      </div>

      {pendingQuery.isLoading ? (
        <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 gap-3" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
          <span className="text-3xl">✅</span>
          <p className="text-sm font-semibold" style={{ color: C.dark }}>Coda vuota</p>
          <p className="text-xs" style={{ color: C.mid }}>Nessun articolo in attesa di revisione</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((a) => (
            <div key={a.id} className="rounded-2xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
              {/* Header articolo */}
              <div className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#fef3c7", color: "#d97706" }}>In revisione</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.bg, color: C.mid }}>{a.category}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug mb-1" style={{ color: C.black }}>{a.title}</h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.mid }}>
                    <span>di <strong style={{ color: C.dark }}>{a.journalistDisplayName}</strong> (@{a.journalistUsername})</span>
                    <span>·</span>
                    <span>Inviato: {new Date(a.updatedAt).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    <span>·</span>
                    <span>{Math.round(a.body.length / 5)} parole ca.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: C.bg, color: C.dark, border: `1px solid ${C.border}` }}>
                    {expandedId === a.id ? "Chiudi" : "Leggi"}
                  </button>
                  <button
                    onClick={() => approveMutation.mutate({ articleId: a.id })}
                    disabled={approveMutation.isPending}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                    style={{ background: "#d1fae5", color: "#065f46" }}
                  >
                    ✓ Approva
                  </button>
                  <button
                    onClick={() => { setRejectId(rejectId === a.id ? null : a.id); setRejectNotes(""); }}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{ background: "#fee2e2", color: "#991b1b" }}
                  >
                    ✕ Rifiuta
                  </button>
                </div>
              </div>

              {/* Testo articolo espanso */}
              {expandedId === a.id && (
                <div className="px-6 pb-5">
                  <div className="rounded-xl p-4 text-sm leading-relaxed" style={{ background: C.bg, color: C.dark, fontFamily: C.font, whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto" }}>
                    {a.body}
                  </div>
                  {a.imageUrl && (
                    <div className="mt-3">
                      <img src={a.imageUrl} alt="Immagine articolo" className="rounded-xl max-h-48 object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Form rifiuto */}
              {rejectId === a.id && (
                <div className="px-6 pb-5">
                  <div className="rounded-xl p-4" style={{ background: "#fff5f5", border: `1px solid #fecaca` }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#991b1b" }}>Note di feedback per il giornalista:</p>
                    <textarea
                      value={rejectNotes}
                      onChange={(e) => setRejectNotes(e.target.value)}
                      placeholder="Spiega perché l'articolo viene rifiutato e cosa deve essere migliorato..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-3"
                      style={{ background: C.white, border: `1px solid #fecaca`, color: C.black, fontFamily: C.font }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { if (!rejectNotes.trim()) { toast.error("Inserisci una nota di feedback"); return; } rejectMutation.mutate({ articleId: a.id, notes: rejectNotes.trim() }); }}
                        disabled={rejectMutation.isPending}
                        className="text-xs px-4 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                        style={{ background: C.red, color: "#fff" }}
                      >
                        {rejectMutation.isPending ? "..." : "Conferma rifiuto"}
                      </button>
                      <button onClick={() => { setRejectId(null); setRejectNotes(""); }} className="text-xs px-4 py-1.5 rounded-lg" style={{ background: C.border, color: C.dark }}>Annulla</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nota workflow */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-semibold mb-2" style={{ color: C.black }}>Workflow di moderazione</h3>
        <p className="text-xs leading-relaxed" style={{ color: C.mid }}>
          Il giornalista scrive l'articolo nel portale e lo invia in revisione (stato <strong style={{ color: C.dark }}>review</strong>).
          L'admin approva o rifiuta. Se approvato, l'articolo viene pubblicato su ProofPress con hash SHA-256 e bollino PP-Verify generati automaticamente.
          Se rifiutato, il giornalista riceve le note di feedback e può modificare e reinviare.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminJournalists() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"accounts" | "review">("accounts");

  // Badge contatore articoli in revisione
  const pendingQuery = trpc.journalistAdmin.listPendingReview.useQuery(undefined, {
    enabled: user?.role === "admin",
    refetchInterval: 60_000,
  });
  const pendingCount = pendingQuery.data?.length ?? 0;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}><div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: C.mid }}>Accesso riservato agli amministratori.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: C.black, color: "#fff" }}>Torna alla Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: C.font }}>
      <AdminNavbar user={user} navigate={navigate} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: C.black }}>Gestione Giornalisti</h1>
          <p className="text-sm mt-1" style={{ color: C.mid }}>Account accreditati e coda di moderazione articoli ProofPress</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: C.border }}>
          {[
            { id: "accounts" as const, label: "Account Giornalisti" },
            { id: "review" as const, label: "Coda Revisione", badge: pendingCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? C.white : "transparent",
                color: activeTab === tab.id ? C.black : C.mid,
                boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold" style={{ background: C.orange, color: "#fff" }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenuto tab */}
        {activeTab === "accounts" ? <AccountsTab /> : <ReviewQueueTab />}
      </div>
    </div>
  );
}
