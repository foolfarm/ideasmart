/**
 * Journalist Portal — Area privata per giornalisti accreditati ProofPress
 * Template visivo: /chi-siamo (LeftSidebar + SharedPageHeader + BreakingNewsTicker)
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import LeftSidebar from "@/components/LeftSidebar";
import {
  PenLine, LogOut, Plus, FileText, CheckCircle2, Clock, XCircle,
  Shield, Eye, Trash2, ChevronLeft, Key, Lock, Award
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";
const MONO = "JetBrains Mono, 'Courier New', monospace";
const ORANGE = "#ff5500";

const CATEGORIES = [
  "AI & Tecnologia", "Startup & Innovazione", "Economia & Finanza",
  "Politica & Società", "Scienza & Ricerca", "Cultura & Media",
  "Cybersecurity", "Sostenibilità", "Salute & Biotech", "Altro"
];

type View = "login" | "dashboard" | "editor";
type DashTab = "articles" | "rejected";

function Divider() {
  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8">
      <div className="border-t border-[#0a0a0a]/8" />
    </div>
  );
}

function OrangeLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 border mb-4"
      style={{ color: ORANGE, borderColor: `${ORANGE}44`, background: `${ORANGE}0d` }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ color: "rgba(10,10,10,0.4)" }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { label: "Bozza", bg: "#f3f4f6", color: "#4b5563", Icon: Clock },
    review: { label: "In revisione", bg: "#fef3c7", color: "#d97706", Icon: Clock },
    published: { label: "Pubblicato", bg: "#d1fae5", color: "#059669", Icon: CheckCircle2 },
    rejected: { label: "Rifiutato", bg: "#fee2e2", color: "#dc2626", Icon: XCircle },
  }[status] ?? { label: status, bg: "#f3f4f6", color: "#6b7280", Icon: FileText };
  const { Icon } = config;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: config.bg, color: config.color, fontFamily: FONT }}
    >
      <Icon size={10} />
      {config.label}
    </span>
  );
}

/* ── Wrapper layout ── */
function PageWrapper({ children, title, description, canonical }: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  canonical?: string;
}) {
  return (
    <div className="flex min-h-screen" style={{ fontFamily: FONT }}>
      <LeftSidebar />
      <div className="flex-1 min-w-0">
        <SEOHead
          title={title ?? "Portale Giornalisti — ProofPress"}
          description={description ?? "Area privata per i giornalisti accreditati ProofPress."}
          canonical={canonical ?? "https://proofpress.ai/journalist-portal"}
          ogSiteName="Proof Press"
        />
        <div className="min-h-screen" style={{ background: "#ffffff", color: "#0a0a0a" }}>
          <SharedPageHeader />
          <BreakingNewsTicker />
          {children}
          <Divider />
          <SharedPageFooter />
        </div>
      </div>
    </div>
  );
}

/* ── Login ── */
function LoginView({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password.trim()) return;
    setIsPending(true);
    try {
      const res = await fetch("/api/journalist/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Errore di accesso");
      } else {
        toast.success("Accesso effettuato");
        onSuccess();
      }
    } catch {
      toast.error("Errore di rete. Riprova.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-28" style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="mb-6"><OrangeLabel>AREA RISERVATA</OrangeLabel></div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6" style={{ color: "#0a0a0a" }}>
                Portale<br />
                <span style={{ color: ORANGE }}>Giornalisti</span><br />
                ProofPress
              </h1>
              <p className="text-base md:text-lg leading-relaxed mb-8" style={{ color: "#0a0a0a", opacity: 0.6 }}>
                Scrivi il tuo articolo, pubblicalo su ProofPress e ottieni automaticamente il bollino di certificazione crittografica con la tua firma digitale.
              </p>
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-[#0a0a0a]/8">
                {[
                  { Icon: Shield, label: "Certificazione", val: "SHA-256" },
                  { Icon: Key, label: "Firma digitale", val: "Journalist Key" },
                  { Icon: Award, label: "Bollino", val: "PP-Verify" },
                ].map(({ Icon, label, val }) => (
                  <div key={label} className="text-center">
                    <Icon size={20} className="mx-auto mb-1" style={{ color: ORANGE }} />
                    <div className="text-xs font-black" style={{ color: "#0a0a0a" }}>{val}</div>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: "#0a0a0a", opacity: 0.45 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Login card */}
            <div className="border border-[#0a0a0a]/10 bg-[#f9f9f9] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0a0a0a", opacity: 0.45 }}>Accesso riservato</p>
                  <p className="text-sm font-bold" style={{ color: "#0a0a0a" }}>Inserisci le tue credenziali</p>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.5 }}>Username</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="il tuo username" className="border-[#0a0a0a]/20 bg-white" style={{ fontFamily: MONO }} autoComplete="username" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.5 }}>Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="border-[#0a0a0a]/20 bg-white" autoComplete="current-password" />
                </div>
                <button type="submit" disabled={isPending || !username.trim() || !password.trim()} className="w-full py-3 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80 disabled:opacity-40" style={{ background: "#0a0a0a" }}>
                  {isPending ? "Accesso in corso..." : "Accedi al Portale →"}
                </button>
              </form>
              <p className="text-xs mt-4 text-center" style={{ color: "#0a0a0a", opacity: 0.4 }}>
                Non hai le credenziali?{" "}
                <Link href="/contatti" className="underline hover:no-underline" style={{ color: ORANGE }}>Contattaci</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* Come funziona */}
      <section className="py-20 md:py-28" style={{ background: "#f9f9f9" }}>
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="mb-12">
            <SectionLabel>Come funziona</SectionLabel>
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: "#0a0a0a" }}>Dal testo al bollino certificato in 4 passi</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Accedi", desc: "Entra nel portale con le credenziali fornite dalla redazione ProofPress." },
              { n: "02", title: "Scrivi", desc: "Usa l'editor integrato. Salva come bozza in qualsiasi momento." },
              { n: "03", title: "Pubblica", desc: "Con un click, il tuo articolo va live su ProofPress.ai." },
              { n: "04", title: "Certifica", desc: "Il sistema genera l'hash SHA-256 con la tua Journalist Key. Il bollino PP-Verify è tuo." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="border border-[#0a0a0a]/8 bg-white p-6">
                <div className="text-4xl font-black mb-3" style={{ color: ORANGE, fontFamily: MONO }}>{n}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#0a0a0a" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

/* ── Dashboard ── */
function DashboardView({
  journalist,
  onNewArticle,
  onEditArticle,
  onLogout,
}: {
  journalist: { id: number; displayName: string; username: string; bio?: string | null; journalistKey: string; totalArticles: number; avgTrustScore?: number | null };
  onNewArticle: () => void;
  onEditArticle: (id: number) => void;
  onLogout: () => void;
}) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DashTab>("articles");
  const [resubmitId, setResubmitId] = useState<number | null>(null);
  const [resubmitTitle, setResubmitTitle] = useState("");
  const [resubmitBody, setResubmitBody] = useState("");
  const [resubmitSummary, setResubmitSummary] = useState("");
  const [resubmitCategory, setResubmitCategory] = useState("");
  const [resubmitImageUrl, setResubmitImageUrl] = useState("");

  const articlesQuery = trpc.journalist.myArticles.useQuery();
  const rejectedQuery = trpc.journalist.getRejectedArticles.useQuery();
  const deleteMutation = trpc.journalist.deleteDraft.useMutation({
    onSuccess: () => { toast.success("Bozza eliminata"); articlesQuery.refetch(); setDeleteId(null); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const resubmitMutation = trpc.journalist.resubmitForReview.useMutation({
    onSuccess: () => {
      toast.success("Articolo reinviato in revisione!");
      rejectedQuery.refetch();
      setResubmitId(null);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const articles = articlesQuery.data ?? [];
  const rejected = rejectedQuery.data ?? [];

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-28 md:pb-20" style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="mb-3"><OrangeLabel>PORTALE GIORNALISTI</OrangeLabel></div>
              <h1 className="text-3xl md:text-4xl font-black mb-1" style={{ color: "#0a0a0a" }}>
                Benvenuto, <span style={{ color: ORANGE }}>{journalist.displayName}</span>
              </h1>
              <p className="text-sm" style={{ color: "#0a0a0a", opacity: 0.5 }}>@{journalist.username}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={onNewArticle} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80" style={{ background: ORANGE }}>
                <Plus size={16} />Nuovo Articolo
              </button>
              <button onClick={onLogout} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-[#0a0a0a]/15 hover:bg-[#0a0a0a]/5 transition-colors" style={{ color: "#0a0a0a" }}>
                <LogOut size={14} />Esci
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-[#0a0a0a]/8 mb-10">
            {[
              { val: articles.length.toString(), label: "Articoli totali", Icon: FileText },
              { val: articles.filter(a => a.status === "draft").length.toString(), label: "Bozze", Icon: Clock },
              { val: articles.filter((a: { status: string }) => a.status === "published").length.toString(), label: "Pubblicati", Icon: CheckCircle2 },
              { val: rejected.length.toString(), label: "Rifiutati", Icon: XCircle },
            ].map(({ val, label, Icon }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} style={{ color: ORANGE }} />
                  <span className="text-xs uppercase tracking-wide" style={{ color: "#0a0a0a", opacity: 0.45 }}>{label}</span>
                </div>
                <div className="text-3xl font-black" style={{ color: "#0a0a0a" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Journalist Key */}
          <div className="border border-[#0a0a0a]/8 bg-[#f9f9f9] p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#0a0a0a" }}>
              <Key size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0a0a0a", opacity: 0.45 }}>La tua Journalist Key</p>
              <p className="text-sm font-mono truncate" style={{ color: "#0a0a0a" }}>{journalist.journalistKey}</p>
              <p className="text-xs mt-1" style={{ color: "#0a0a0a", opacity: 0.45 }}>
                Incorporata nell'hash SHA-256 di ogni tuo articolo pubblicato — certifica la tua paternità in modo crittograficamente verificabile.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* Articoli */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          {/* Tab navigation */}
          <div className="flex items-center gap-0 mb-8 border-b border-[#0a0a0a]/8">
            <button
              onClick={() => setActiveTab("articles")}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "articles"
                  ? "border-[#0a0a0a] text-[#0a0a0a]"
                  : "border-transparent text-[#0a0a0a]/40 hover:text-[#0a0a0a]/70"
              }`}
            >
              I miei articoli
              {articles.length > 0 && (
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#4b5563" }}>{articles.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "rejected"
                  ? "border-[#dc2626] text-[#dc2626]"
                  : "border-transparent text-[#0a0a0a]/40 hover:text-[#0a0a0a]/70"
              }`}
            >
              Rifiutati
              {rejected.length > 0 && (
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#dc2626" }}>{rejected.length}</span>
              )}
            </button>
            <div className="ml-auto">
              <button onClick={onNewArticle} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#0a0a0a]/15 hover:bg-[#0a0a0a]/5 transition-colors" style={{ color: "#0a0a0a" }}>
                <Plus size={14} />Nuovo articolo
              </button>
            </div>
          </div>

          {/* Tab: I miei articoli */}
          {activeTab === "articles" && (
            articlesQuery.isLoading ? (
              <div className="py-16 text-center">
                <div className="w-6 h-6 border-2 border-[#0a0a0a]/20 border-t-[#0a0a0a]/60 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm" style={{ color: "#0a0a0a", opacity: 0.45 }}>Caricamento...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="border border-[#0a0a0a]/8 py-16 text-center">
                <PenLine size={32} className="mx-auto mb-4" style={{ color: "#0a0a0a", opacity: 0.2 }} />
                <p className="text-base font-bold mb-2" style={{ color: "#0a0a0a" }}>Nessun articolo ancora</p>
                <p className="text-sm mb-6" style={{ color: "#0a0a0a", opacity: 0.5 }}>Scrivi il tuo primo articolo e ottieni il bollino ProofPress Verify.</p>
                <button onClick={onNewArticle} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white" style={{ background: ORANGE }}>
                  <Plus size={16} />Scrivi il primo articolo
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#0a0a0a]/6 border border-[#0a0a0a]/8">
                {articles.map((article) => (
                  <div key={article.id} className="p-5 hover:bg-[#f9f9f9] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={article.status} />
                          {article.category && (
                            <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: "#0a0a0a", opacity: 0.4 }}>{article.category}</span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold mb-1 truncate" style={{ color: "#0a0a0a" }}>
                          {article.title || <span style={{ opacity: 0.4 }}>Senza titolo</span>}
                        </h3>
                        {article.summary && (
                          <p className="text-xs line-clamp-2 mb-2" style={{ color: "#0a0a0a", opacity: 0.55 }}>{article.summary}</p>
                        )}
                        {article.verifyBadge && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold" style={{ background: "#d1fae5", color: "#059669" }}>
                            <Shield size={10} />{article.verifyBadge}
                          </div>
                        )}
                        <p className="text-[10px] mt-2" style={{ color: "#0a0a0a", opacity: 0.35 }}>
                          {new Date(article.createdAt).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {article.status !== "published" && (
                          <>
                            <button onClick={() => onEditArticle(article.id)} className="p-2 border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/5 transition-colors" title="Modifica">
                              <PenLine size={14} style={{ color: "#0a0a0a", opacity: 0.6 }} />
                            </button>
                            <button onClick={() => setDeleteId(article.id)} className="p-2 border border-[#0a0a0a]/10 hover:bg-red-50 hover:border-red-200 transition-colors" title="Elimina">
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </>
                        )}
                        {article.status === "published" && (
                          <Link href="/">
                            <button className="p-2 border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/5 transition-colors" title="Visualizza">
                              <Eye size={14} style={{ color: "#0a0a0a", opacity: 0.6 }} />
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Tab: Rifiutati */}
          {activeTab === "rejected" && (
            rejectedQuery.isLoading ? (
              <div className="py-16 text-center">
                <div className="w-6 h-6 border-2 border-[#0a0a0a]/20 border-t-[#0a0a0a]/60 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm" style={{ color: "#0a0a0a", opacity: 0.45 }}>Caricamento...</p>
              </div>
            ) : rejected.length === 0 ? (
              <div className="border border-[#0a0a0a]/8 py-16 text-center">
                <CheckCircle2 size={32} className="mx-auto mb-4" style={{ color: "#059669", opacity: 0.5 }} />
                <p className="text-base font-bold mb-2" style={{ color: "#0a0a0a" }}>Nessun articolo rifiutato</p>
                <p className="text-sm" style={{ color: "#0a0a0a", opacity: 0.5 }}>Ottimo! Tutti i tuoi articoli sono stati approvati o sono in attesa di revisione.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="border border-[#dc2626]/20 bg-[#fef2f2] px-5 py-3 flex items-center gap-3">
                  <XCircle size={16} style={{ color: "#dc2626" }} />
                  <p className="text-sm" style={{ color: "#dc2626" }}>
                    {rejected.length} articol{rejected.length === 1 ? "o" : "i"} rifiutat{rejected.length === 1 ? "o" : "i"} — leggi le note della redazione e modifica prima di reinviare.
                  </p>
                </div>
                {rejected.map((article) => (
                  <div key={article.id} className="border border-[#0a0a0a]/8 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusBadge status="rejected" />
                            {article.category && (
                              <span className="text-[10px] font-mono uppercase tracking-wide" style={{ color: "#0a0a0a", opacity: 0.4 }}>{article.category}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold" style={{ color: "#0a0a0a" }}>{article.title}</h3>
                          <p className="text-[10px] mt-1" style={{ color: "#0a0a0a", opacity: 0.35 }}>
                            Rifiutato il {article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Note della redazione */}
                      {article.reviewNotes && (
                        <div className="border-l-4 border-[#dc2626] bg-[#fef2f2] px-4 py-3 mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#dc2626" }}>Note della redazione</p>
                          <p className="text-sm leading-relaxed" style={{ color: "#1a1a1a" }}>{article.reviewNotes}</p>
                        </div>
                      )}

                      {/* Editor inline per reinvio */}
                      {resubmitId === article.id ? (
                        <div className="border border-[#0a0a0a]/8 bg-[#f9f9f9] p-4 mt-3">
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#0a0a0a", opacity: 0.45 }}>Modifica e reinvia</p>
                          <div className="flex flex-col gap-3">
                            <Input
                              value={resubmitTitle}
                              onChange={(e) => setResubmitTitle(e.target.value)}
                              placeholder="Titolo"
                              className="border-[#0a0a0a]/20 bg-white font-bold"
                            />
                            <Textarea
                              value={resubmitSummary}
                              onChange={(e) => setResubmitSummary(e.target.value)}
                              placeholder="Sommario (opzionale)"
                              rows={2}
                              className="border-[#0a0a0a]/20 bg-white resize-none"
                            />
                            <Textarea
                              value={resubmitBody}
                              onChange={(e) => setResubmitBody(e.target.value)}
                              placeholder="Contenuto dell'articolo"
                              rows={10}
                              className="border-[#0a0a0a]/20 bg-white resize-none"
                            />
                            <Select value={resubmitCategory} onValueChange={setResubmitCategory}>
                              <SelectTrigger className="border-[#0a0a0a]/20 bg-white">
                                <SelectValue placeholder="Categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input
                              value={resubmitImageUrl}
                              onChange={(e) => setResubmitImageUrl(e.target.value)}
                              placeholder="URL immagine (opzionale)"
                              className="border-[#0a0a0a]/20 bg-white"
                            />
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                onClick={() => {
                                  if (!resubmitTitle.trim() || resubmitBody.length < 50 || !resubmitCategory) {
                                    toast.error("Compila titolo, contenuto (min 50 caratteri) e categoria.");
                                    return;
                                  }
                                  resubmitMutation.mutate({
                                    articleId: article.id,
                                    title: resubmitTitle,
                                    body: resubmitBody,
                                    summary: resubmitSummary || undefined,
                                    category: resubmitCategory,
                                    imageUrl: resubmitImageUrl || undefined,
                                  });
                                }}
                                disabled={resubmitMutation.isPending}
                                className="px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                                style={{ background: ORANGE }}
                              >
                                {resubmitMutation.isPending ? "Invio..." : "🔏 Reinvia in revisione"}
                              </button>
                              <button
                                onClick={() => setResubmitId(null)}
                                className="px-4 py-2.5 text-sm font-medium border border-[#0a0a0a]/15 hover:bg-[#0a0a0a]/5 transition-colors"
                                style={{ color: "#0a0a0a" }}
                              >
                                Annulla
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setResubmitId(article.id);
                            setResubmitTitle(article.title);
                            setResubmitBody(article.body);
                            setResubmitSummary(article.summary ?? "");
                            setResubmitCategory(article.category);
                            setResubmitImageUrl(article.imageUrl ?? "");
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
                          style={{ background: ORANGE }}
                        >
                          <PenLine size={14} />Modifica e reinvia
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la bozza?</AlertDialogTitle>
            <AlertDialogDescription>Questa azione è irreversibile. La bozza verrà eliminata definitivamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

/* ── Editor ── */
function EditorView({
  articleId,
  onBack,
  onPublished,
}: {
  articleId?: number;
  onBack: () => void;
  onPublished: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [savedId, setSavedId] = useState<number | undefined>(articleId);
  const [publishResult, setPublishResult] = useState<{ verifyBadge: string; verifyHash: string } | null>(null);

  const { data: existing } = trpc.journalist.getArticle.useQuery({ id: articleId! }, { enabled: !!articleId });

  useEffect(() => {
    if (existing) {
      setTitle(existing.title ?? "");
      setBody(existing.body ?? "");
      setSummary(existing.summary ?? "");
      setCategory(existing.category ?? "");
      setImageUrl(existing.imageUrl ?? "");
    }
  }, [existing]);

  const saveMutation = trpc.journalist.saveDraft.useMutation({
    onSuccess: (data) => { setSavedId(data.id); toast.success("Bozza salvata"); },
    onError: (e) => toast.error(e.message),
  });

  const submitForReviewMutation = trpc.journalist.submitForReview.useMutation({
    onSuccess: () => {
      setPublishResult({ verifyBadge: "IN_REVISIONE", verifyHash: "" });
      toast.success("Articolo inviato in revisione! La redazione ProofPress lo esaminerà a breve.");
      onPublished();
    },
    onError: (e) => toast.error(e.message),
  });

  const canSave = title.length >= 5 && body.length >= 50 && !!category;
  const canPublish = canSave && !!savedId && !!summary.trim();

  return (
    <PageWrapper title={`${articleId ? "Modifica" : "Nuovo"} Articolo — ProofPress`}>
      <section className="pt-24 pb-20 md:pt-28 md:pb-24">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity" style={{ color: "#0a0a0a", opacity: 0.5 }}>
            <ChevronLeft size={16} />Torna alla dashboard
          </button>

          <div className="mb-6"><OrangeLabel>{articleId ? "MODIFICA ARTICOLO" : "NUOVO ARTICOLO"}</OrangeLabel></div>
          <h1 className="text-3xl md:text-4xl font-black mb-8" style={{ color: "#0a0a0a" }}>
            {articleId ? "Modifica il tuo articolo" : "Scrivi un nuovo articolo"}
          </h1>

          {publishResult && (
            <div className="border border-[#0a0a0a]/8 p-6 mb-8 flex items-start gap-4" style={{ background: "#fffbeb" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#d97706" }}>
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: "#d97706" }}>⏳ Articolo inviato in revisione</p>
                <p className="text-xs" style={{ color: "#92400e" }}>La redazione ProofPress esaminerà il tuo articolo e lo pubblicherà con bollino PP-Verify una volta approvato.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.5 }}>Titolo *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Il titolo del tuo articolo" className="border-[#0a0a0a]/20 bg-white text-lg font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.5 }}>Sommario * <span className="normal-case font-normal">(richiesto per la pubblicazione)</span></label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Breve sommario (max 300 caratteri)" rows={3} maxLength={300} className="border-[#0a0a0a]/20 bg-white resize-none" />
                <p className="text-[10px] mt-1" style={{ color: "#0a0a0a", opacity: 0.35 }}>{summary.length}/300</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.5 }}>Contenuto *</label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Scrivi il tuo articolo qui..." rows={18} className="border-[#0a0a0a]/20 bg-white resize-none" style={{ fontFamily: FONT, lineHeight: 1.7 }} />
                <p className="text-[10px] mt-1" style={{ color: "#0a0a0a", opacity: 0.35 }}>{body.length} caratteri</p>
              </div>
            </div>
            {/* Sidebar metadati */}
            <div className="flex flex-col gap-5">
              <div className="border border-[#0a0a0a]/8 bg-[#f9f9f9] p-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#0a0a0a", opacity: 0.45 }}>Metadati</p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.5 }}>Categoria *</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="border-[#0a0a0a]/20 bg-white">
                        <SelectValue placeholder="Seleziona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.5 }}>URL Immagine</label>
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="border-[#0a0a0a]/20 bg-white" />
                  </div>
                </div>
              </div>

              <div className="border border-[#0a0a0a]/8 bg-[#f9f9f9] p-5 flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0a0a0a", opacity: 0.45 }}>Azioni</p>
                <button
                  onClick={() => saveMutation.mutate({ id: savedId, title, body, summary, category, imageUrl })}
                  disabled={!canSave || saveMutation.isPending}
                  className="w-full py-2.5 text-sm font-bold border border-[#0a0a0a]/15 hover:bg-[#0a0a0a]/5 transition-colors disabled:opacity-40"
                  style={{ color: "#0a0a0a" }}
                >
                  {saveMutation.isPending ? "Salvataggio..." : "💾 Salva Bozza"}
                </button>
                <button
                  onClick={async () => {
                    // Prima salva la bozza aggiornata, poi invia in revisione
                    const saved = await saveMutation.mutateAsync({ id: savedId, title, body, summary, category, imageUrl });
                    submitForReviewMutation.mutate({ articleId: saved.id });
                  }}
                  disabled={!canPublish || submitForReviewMutation.isPending}
                  className="w-full py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ background: ORANGE }}
                >
                  {submitForReviewMutation.isPending ? "Invio in corso..." : "🔏 Invia in Revisione"}
                </button>
                <p className="text-[10px] text-center" style={{ color: "#0a0a0a", opacity: 0.4 }}>
                  {!savedId ? "Salva prima la bozza per poter inviare" : "L'articolo sarà revisionato dalla redazione ProofPress"}
                </p>
              </div>

              <div className="border border-[#0a0a0a]/8 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} style={{ color: ORANGE }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0a0a0a", opacity: 0.45 }}>ProofPress Verify</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.55 }}>
                  Al momento della pubblicazione, il sistema genera un hash SHA-256 che include il contenuto e la tua Journalist Key univoca. Il bollino <strong>PP-XXXXXXXXXXXXXXXX</strong> certifica la paternità in modo crittograficamente immutabile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

/* ── Main Component ── */
export default function JournalistPortal() {
  const [view, setView] = useState<View>("login");
  const [editingArticleId, setEditingArticleId] = useState<number | undefined>();
  const utils = trpc.useUtils();
  const { data: journalist, isLoading } = trpc.journalist.me.useQuery();

  useEffect(() => {
    if (journalist) setView("dashboard");
  }, [journalist]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen" style={{ fontFamily: FONT }}>
        <LeftSidebar />
        <div className="flex-1 min-w-0">
          <SharedPageHeader />
          <BreakingNewsTicker />
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-[#0a0a0a]/20 border-t-[#0a0a0a]/60 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm" style={{ color: "#0a0a0a", opacity: 0.45 }}>Caricamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!journalist || view === "login") {
    return <LoginView onSuccess={() => { utils.journalist.me.invalidate(); }} />;
  }

  if (view === "editor") {
    return (
      <EditorView
        articleId={editingArticleId}
        onBack={() => { setEditingArticleId(undefined); setView("dashboard"); utils.journalist.myArticles.invalidate(); }}
        onPublished={() => { utils.journalist.myArticles.invalidate(); utils.journalist.me.invalidate(); }}
      />
    );
  }

  return (
    <DashboardView
      journalist={journalist}
      onNewArticle={() => { setEditingArticleId(undefined); setView("editor"); }}
      onEditArticle={(id) => { setEditingArticleId(id); setView("editor"); }}
      onLogout={async () => {
        try {
          await fetch("/api/journalist/logout", { method: "POST", credentials: "include" });
        } catch { /* ignora errori di rete */ }
        utils.journalist.me.invalidate();
        setView("login");
      }}
    />
  );
}
