/**
 * Pagina /account — Il mio account
 * - Mostra username, email, data iscrizione
 * - Cambio password
 * - Lista di lettura personale (articoli salvati)
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import { toast } from "sonner";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

const SECTION_LABELS: Record<string, string> = {
  ai: "AI4Business",
  startup: "Startup News",
  research: "Research",
  finance: "Finance",
  health: "Health",
  sport: "Sport",
};

const TYPE_LABELS: Record<string, string> = {
  news: "Notizia",
  editorial: "Editoriale",
  reportage: "Reportage",
  analysis: "Analisi",
  startup: "Startup",
  research: "Ricerca",
};

const TYPE_PATHS: Record<string, string> = {
  news: "news",
  editorial: "editoriale",
  reportage: "reportage",
  analysis: "analisi",
  startup: "spotlight",
  research: "news",
};

export default function Account() {
  const [, navigate] = useLocation();
  const { user, isLoading, isAuthenticated, logout } = useSiteAuth();

  // Redirect se non loggato
  if (!isLoading && !isAuthenticated) {
    navigate("/accedi");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f3" }}>
        <div className="w-8 h-8 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf8f3", color: "#1a1a1a" }}>
      <SharedPageHeader />
      <main className="max-w-[900px] mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <p className="text-[10px] uppercase tracking-widest mb-8" style={{ color: "rgba(26,26,26,0.4)", fontFamily: SF }}>
          <Link href="/" className="hover:opacity-70">IDEASMART</Link>
          {" · "}
          <span>IL MIO ACCOUNT</span>
        </p>

        {/* Titolo */}
        <div className="border-t-[3px] border-[#1a1a1a] pt-6 mb-10">
          <h1 className="text-3xl font-black" style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.02em" }}>
            Il mio account
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(26,26,26,0.5)", fontFamily: SF }}>
            Benvenuto, <strong style={{ color: "#1a1a1a" }}>{user?.username}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonna sinistra: profilo + cambio password */}
          <div className="md:col-span-1 space-y-6">
            <ProfileCard user={user} />
            <ChangePasswordCard />
            <div className="border-t border-[#1a1a1a]/10 pt-4">
              <button
                onClick={logout}
                className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                style={{ color: "rgba(26,26,26,0.5)", fontFamily: SF }}
              >
                Esci dall'account →
              </button>
            </div>
          </div>

          {/* Colonna destra: lista di lettura */}
          <div className="md:col-span-2">
            <ReadingList />
          </div>
        </div>
      </main>
      <SharedPageFooter />
    </div>
  );
}

function ProfileCard({ user }: { user: any }) {
  return (
    <div className="border border-[#1a1a1a]/10 p-5" style={{ fontFamily: SF }}>
      <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(26,26,26,0.4)" }}>Profilo</p>
      <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "16px" }} />
      <div className="space-y-3">
        <div>
          <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(26,26,26,0.4)" }}>Username</p>
          <p className="text-sm font-bold" style={{ color: "#1a1a1a" }}>{user?.username}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(26,26,26,0.4)" }}>Email</p>
          <p className="text-sm" style={{ color: "#1a1a1a" }}>{user?.email}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(26,26,26,0.4)" }}>Stato</p>
          <p className="text-xs font-bold" style={{ color: "#1a1a1a" }}>
            ✓ Email verificata
          </p>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [open, setOpen] = useState(false);

  const changePwd = trpc.account.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password aggiornata con successo.");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error("Le password non coincidono."); return; }
    if (newPwd.length < 6) { toast.error("La nuova password deve avere almeno 6 caratteri."); return; }
    changePwd.mutate({ currentPassword: currentPwd, newPassword: newPwd });
  };

  return (
    <div className="border border-[#1a1a1a]/10 p-5" style={{ fontFamily: SF }}>
      <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(26,26,26,0.4)" }}>Sicurezza</p>
      <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "16px" }} />
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
          style={{ color: "#1a1a1a" }}
        >
          Cambia password →
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: "rgba(26,26,26,0.5)" }}>
              Password attuale
            </label>
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              required
              className="w-full border border-[#1a1a1a]/20 px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1a1a1a]"
              style={{ fontFamily: SF }}
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: "rgba(26,26,26,0.5)" }}>
              Nuova password
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              required
              minLength={6}
              className="w-full border border-[#1a1a1a]/20 px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1a1a1a]"
              style={{ fontFamily: SF }}
            />
          </div>
          <div>
            <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: "rgba(26,26,26,0.5)" }}>
              Conferma nuova password
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              required
              className="w-full border border-[#1a1a1a]/20 px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1a1a1a]"
              style={{ fontFamily: SF }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={changePwd.isPending}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
              style={{ background: "#1a1a1a", color: "#ffffff", fontFamily: SF }}
            >
              {changePwd.isPending ? "Salvo…" : "Salva"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-[#1a1a1a]/20 hover:border-[#1a1a1a] transition-colors"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Annulla
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ReadingList() {
  const { data: items, isLoading, refetch } = trpc.account.getReadingList.useQuery();
  const removeMutation = trpc.account.removeFromReadingList.useMutation({
    onSuccess: () => { refetch(); toast.success("Articolo rimosso dalla lista."); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div style={{ fontFamily: SF }}>
      <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(26,26,26,0.4)" }}>
        Lista di lettura
      </p>
      <div style={{ height: "2px", background: "#1a1a1a", marginBottom: "20px" }} />

      {isLoading && (
        <div className="flex items-center gap-2 py-8">
          <div className="w-5 h-5 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin" />
          <span className="text-xs" style={{ color: "rgba(26,26,26,0.4)" }}>Caricamento…</span>
        </div>
      )}

      {!isLoading && (!items || items.length === 0) && (
        <div className="py-12 text-center border border-dashed border-[#1a1a1a]/15">
          <p className="text-sm mb-2" style={{ color: "rgba(26,26,26,0.5)" }}>
            Nessun articolo salvato
          </p>
          <p className="text-xs" style={{ color: "rgba(26,26,26,0.35)" }}>
            Clicca il pulsante "Salva" su qualsiasi articolo per aggiungerlo qui.
          </p>
        </div>
      )}

      {!isLoading && items && items.length > 0 && (
        <div className="space-y-0">
          {items.map((item, i) => {
            const section = item.section ?? "ai";
            const typePath = TYPE_PATHS[item.contentType] ?? "news";
            const articleUrl = `/${section}/${typePath}/${item.contentId}`;
            const savedDate = new Date(item.savedAt).toLocaleDateString("it-IT", {
              day: "numeric", month: "short", year: "numeric"
            });

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 py-4 border-b border-[#1a1a1a]/8 hover:bg-[#1a1a1a]/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
                      style={{ background: "#1a1a1a", color: "#ffffff" }}
                    >
                      {TYPE_LABELS[item.contentType] ?? item.contentType}
                    </span>
                    {item.section && (
                      <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(26,26,26,0.4)" }}>
                        {SECTION_LABELS[item.section] ?? item.section}
                      </span>
                    )}
                    <span className="text-[9px]" style={{ color: "rgba(26,26,26,0.3)" }}>
                      {savedDate}
                    </span>
                  </div>
                  <Link href={articleUrl}>
                    <p
                      className="text-sm font-bold leading-snug cursor-pointer hover:opacity-70 transition-opacity truncate"
                      style={{ color: "#1a1a1a" }}
                    >
                      {item.title}
                    </p>
                  </Link>
                </div>
                <button
                  onClick={() => removeMutation.mutate({ id: item.id })}
                  disabled={removeMutation.isPending}
                  className="shrink-0 text-[10px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity disabled:opacity-30"
                  style={{ color: "rgba(26,26,26,0.4)" }}
                  title="Rimuovi dalla lista"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
