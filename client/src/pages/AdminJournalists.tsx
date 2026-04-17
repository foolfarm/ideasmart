/**
 * AdminJournalists — Gestione Account Giornalisti
 * Pannello admin per creare, attivare/disattivare e gestire i giornalisti accreditati ProofPress.
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
  rowHover: "#f5f5f7",
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

// ─── Form creazione ───────────────────────────────────────────────────────────
const EMPTY_FORM = {
  username: "",
  password: "",
  displayName: "",
  email: "",
  bio: "",
  linkedinUrl: "",
};

export default function AdminJournalists() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  // UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showKey, setShowKey] = useState<number | null>(null);

  // ─── tRPC ────────────────────────────────────────────────────────────────
  const journalistsQuery = trpc.journalistAdmin.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const createMutation = trpc.journalistAdmin.create.useMutation({
    onSuccess: (data) => {
      setCreating(false);
      setShowCreateForm(false);
      setForm(EMPTY_FORM);
      journalistsQuery.refetch();
      toast.success(`Account "${data.username}" creato con successo! Journalist Key: ${data.journalistKey.substring(0, 8)}...`);
    },
    onError: (err) => {
      setCreating(false);
      toast.error("Errore: " + err.message);
    },
  });

  const toggleActiveMutation = trpc.journalistAdmin.toggleActive.useMutation({
    onSuccess: (_, vars) => {
      journalistsQuery.refetch();
      toast.success(vars.isActive ? "Account attivato" : "Account disattivato");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const resetPasswordMutation = trpc.journalistAdmin.resetPassword.useMutation({
    onSuccess: () => {
      setResettingPassword(false);
      setResetPasswordId(null);
      setNewPassword("");
      toast.success("Password aggiornata con successo");
    },
    onError: (err) => {
      setResettingPassword(false);
      toast.error("Errore: " + err.message);
    },
  });

  const deleteMutation = trpc.journalistAdmin.delete.useMutation({
    onSuccess: () => {
      setDeleteConfirmId(null);
      journalistsQuery.refetch();
      toast.success("Account eliminato");
    },
    onError: (err) => {
      setDeleteConfirmId(null);
      toast.error("Errore: " + err.message);
    },
  });

  // ─── Guard ───────────────────────────────────────────────────────────────
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

  const journalists: Journalist[] = (journalistsQuery.data ?? []) as Journalist[];
  const activeCount = journalists.filter((j) => j.isActive).length;
  const totalArticles = journalists.reduce((sum, j) => sum + j.totalArticles, 0);

  // ─── Handlers ────────────────────────────────────────────────────────────
  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.password || !form.displayName || !form.email) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    setCreating(true);
    createMutation.mutate({
      username: form.username,
      password: form.password,
      displayName: form.displayName,
      email: form.email,
      bio: form.bio || undefined,
      linkedinUrl: form.linkedinUrl || undefined,
    });
  }

  function handleResetPassword(id: number) {
    if (!newPassword || newPassword.length < 6) {
      toast.error("La password deve essere di almeno 6 caratteri");
      return;
    }
    setResettingPassword(true);
    resetPasswordMutation.mutate({ id, newPassword });
  }

  // ─── Render ──────────────────────────────────────────────────────────────
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
            <button
              onClick={() => navigate("/admin")}
              className="text-sm transition-colors px-2 py-1 rounded-md hover:bg-[#f5f5f7]"
              style={{ color: C.mid }}
            >
              Admin
            </button>
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

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: C.black }}>Gestione Giornalisti</h1>
            <p className="text-sm mt-1" style={{ color: C.mid }}>
              Account accreditati per il Portale Giornalisti ProofPress
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: showCreateForm ? C.border : C.black,
              color: showCreateForm ? C.black : "#fff",
            }}
          >
            {showCreateForm ? "✕ Annulla" : "+ Nuovo Giornalista"}
          </button>
        </div>

        {/* ── KPI ────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Account totali", value: journalists.length },
            { label: "Account attivi", value: activeCount },
            { label: "Articoli pubblicati", value: totalArticles },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl p-5"
              style={{ background: C.cardBg, border: `1px solid ${C.border}` }}
            >
              <p className="text-3xl font-semibold mb-1" style={{ color: C.black }}>{kpi.value}</p>
              <p className="text-xs" style={{ color: C.mid }}>{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* ── Form Creazione ─────────────────────────────────────────────────── */}
        {showCreateForm && (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: C.cardBg, border: `1px solid ${C.borderDark}` }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: C.black }}>
              Crea Nuovo Account Giornalista
            </h2>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>
                    Username <span style={{ color: C.red }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="es. mario.rossi"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.black,
                      fontFamily: C.font,
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>
                    Password <span style={{ color: C.red }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 caratteri"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.black,
                      fontFamily: C.font,
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>
                    Nome visualizzato <span style={{ color: C.red }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    placeholder="es. Mario Rossi"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.black,
                      fontFamily: C.font,
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>
                    Email <span style={{ color: C.red }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="mario@esempio.it"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.black,
                      fontFamily: C.font,
                    }}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>
                    Bio (opzionale)
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Breve presentazione del giornalista..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all resize-none"
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.black,
                      fontFamily: C.font,
                    }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: C.mid }}>
                    LinkedIn URL (opzionale)
                  </label>
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/mario-rossi"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      color: C.black,
                      fontFamily: C.font,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ background: C.black, color: "#fff", fontFamily: C.font }}
                >
                  {creating ? "Creazione in corso..." : "Crea Account"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setForm(EMPTY_FORM); }}
                  className="px-5 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: C.border, color: C.black, fontFamily: C.font }}
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tabella Giornalisti ─────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: C.cardBg, border: `1px solid ${C.border}` }}
        >
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <h2 className="text-sm font-semibold" style={{ color: C.black }}>
              Account Giornalisti ({journalists.length})
            </h2>
          </div>

          {journalistsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : journalists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.bg }}>
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-sm font-medium" style={{ color: C.dark }}>Nessun giornalista accreditato</p>
              <p className="text-xs" style={{ color: C.mid }}>Crea il primo account con il pulsante "Nuovo Giornalista"</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: C.border }}>
              {journalists.map((j) => (
                <div key={j.id} className="px-6 py-4" style={{ background: C.cardBg }}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Info principale */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: C.black }}>
                          {j.displayName}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: j.isActive ? "#d1fae5" : "#fee2e2",
                            color: j.isActive ? "#065f46" : "#991b1b",
                          }}
                        >
                          {j.isActive ? "Attivo" : "Disattivato"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.bg, color: C.mid }}>
                          {j.totalArticles} articoli
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: C.mid }}>
                        <span>@{j.username}</span>
                        <span>·</span>
                        <span>{j.email}</span>
                        <span>·</span>
                        <span>
                          Creato: {new Date(j.createdAt).toLocaleDateString("it-IT")}
                        </span>
                        {j.lastLoginAt && (
                          <>
                            <span>·</span>
                            <span>
                              Ultimo login: {new Date(j.lastLoginAt).toLocaleDateString("it-IT")}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Journalist Key */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: C.mid }}>
                          Journalist Key:
                        </span>
                        {showKey === j.id ? (
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{ background: C.bg, color: C.dark, letterSpacing: "0.05em" }}
                          >
                            {j.journalistKey}
                          </span>
                        ) : (
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{ background: C.bg, color: C.mid }}
                          >
                            {j.journalistKey.substring(0, 8)}••••••••••••••••••••••••
                          </span>
                        )}
                        <button
                          onClick={() => setShowKey(showKey === j.id ? null : j.id)}
                          className="text-xs transition-colors"
                          style={{ color: C.mid }}
                        >
                          {showKey === j.id ? "Nascondi" : "Mostra"}
                        </button>
                      </div>

                      {/* Bio */}
                      {j.bio && (
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: C.mid }}>
                          {j.bio}
                        </p>
                      )}
                    </div>

                    {/* Azioni */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Attiva/Disattiva */}
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: j.id, isActive: !j.isActive })}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                        style={{
                          background: j.isActive ? "#fee2e2" : "#d1fae5",
                          color: j.isActive ? "#991b1b" : "#065f46",
                        }}
                      >
                        {j.isActive ? "Disattiva" : "Attiva"}
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => {
                          setResetPasswordId(resetPasswordId === j.id ? null : j.id);
                          setNewPassword("");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                        style={{ background: C.bg, color: C.dark, border: `1px solid ${C.border}` }}
                      >
                        Reset pwd
                      </button>

                      {/* Elimina */}
                      <button
                        onClick={() => setDeleteConfirmId(deleteConfirmId === j.id ? null : j.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                        style={{ background: "#fee2e2", color: "#991b1b" }}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>

                  {/* Reset Password inline */}
                  {resetPasswordId === j.id && (
                    <div
                      className="mt-3 p-3 rounded-xl flex items-center gap-3"
                      style={{ background: C.bg, border: `1px solid ${C.border}` }}
                    >
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nuova password (min. 6 caratteri)"
                        className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                        style={{
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          color: C.black,
                          fontFamily: C.font,
                        }}
                      />
                      <button
                        onClick={() => handleResetPassword(j.id)}
                        disabled={resettingPassword}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                        style={{ background: C.black, color: "#fff" }}
                      >
                        {resettingPassword ? "..." : "Conferma"}
                      </button>
                      <button
                        onClick={() => { setResetPasswordId(null); setNewPassword(""); }}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: C.border, color: C.dark }}
                      >
                        Annulla
                      </button>
                    </div>
                  )}

                  {/* Conferma eliminazione inline */}
                  {deleteConfirmId === j.id && (
                    <div
                      className="mt-3 p-3 rounded-xl flex items-center gap-3"
                      style={{ background: "#fff5f5", border: `1px solid #fecaca` }}
                    >
                      <p className="flex-1 text-xs" style={{ color: "#991b1b" }}>
                        Sei sicuro di voler eliminare l'account <strong>@{j.username}</strong>?
                        {j.totalArticles > 0 && " Questo account ha articoli pubblicati e non può essere eliminato."}
                      </p>
                      {j.totalArticles === 0 && (
                        <button
                          onClick={() => deleteMutation.mutate({ id: j.id })}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: C.red, color: "#fff" }}
                        >
                          Elimina
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: C.border, color: C.dark }}
                      >
                        Annulla
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Note tecniche ───────────────────────────────────────────────────── */}
        <div
          className="mt-6 rounded-2xl p-5"
          style={{ background: C.cardBg, border: `1px solid ${C.border}` }}
        >
          <h3 className="text-xs font-semibold mb-3" style={{ color: C.black }}>Note tecniche</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs" style={{ color: C.mid }}>
            <div>
              <strong style={{ color: C.dark }}>Journalist Key</strong> — Chiave crittografica univoca inclusa nel payload SHA-256 per certificare la paternità di ogni articolo. Non modificabile dopo la creazione.
            </div>
            <div>
              <strong style={{ color: C.dark }}>Bollino ProofPress Verify</strong> — Ogni articolo pubblicato genera un hash PP-J-XXXXXXXXXXXXXXXX che include la Journalist Key. Immutabile e verificabile pubblicamente.
            </div>
            <div>
              <strong style={{ color: C.dark }}>Reset password</strong> — Il reset invalida automaticamente la sessione attiva del giornalista. Il giornalista dovrà effettuare un nuovo login.
            </div>
            <div>
              <strong style={{ color: C.dark }}>Eliminazione account</strong> — Solo gli account senza articoli pubblicati possono essere eliminati. Per gli altri, usa la disattivazione.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
