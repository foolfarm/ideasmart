/**
 * Journalist Portal — Area privata per giornalisti accreditati ProofPress
 * Template visivo: /chi-siamo (LeftSidebar + SharedPageHeader + BreakingNewsTicker)
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import {
  PenLine, LogOut, Plus, FileText, CheckCircle2, Clock, XCircle,
  Shield, Eye, Trash2, ChevronLeft, Key, Lock, Award, Upload, FileUp, X as XIcon, Loader2
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

/* ── Import Document Drop Zone ── */
function ImportDropZone({ onImport }: { onImport: (text: string, filename: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importedFile, setImportedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const allowedExts = [".docx", ".doc", ".pdf"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowedExts.includes(ext)) {
      toast.error("Formato non supportato. Usa .docx, .doc o .pdf");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File troppo grande. Massimo 20MB.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/journalist/import-document", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore durante l'elaborazione");
      onImport(data.text, file.name);
      setImportedFile(file.name);
      toast.success(`Documento importato: ${file.name}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Errore durante l'importazione");
    } finally {
      setIsLoading(false);
    }
  }, [onImport]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept=".docx,.doc,.pdf" className="hidden" onChange={handleFileChange} />
      {importedFile ? (
        <div className="flex items-center gap-3 px-4 py-3 border border-green-200 bg-green-50 rounded-lg">
          <FileText size={16} className="text-green-600 shrink-0" />
          <span className="text-sm font-medium text-green-700 truncate flex-1">{importedFile} importato</span>
          <button
            onClick={() => { setImportedFile(null); }}
            className="text-green-500 hover:text-green-700 transition-colors shrink-0"
          >
            <XIcon size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#ff5500] bg-[#ff5500]/5"
              : "border-[#0a0a0a]/15 hover:border-[#ff5500]/50 hover:bg-[#ff5500]/3"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin" style={{ color: ORANGE }} />
              <p className="text-sm font-medium" style={{ color: "#0a0a0a", opacity: 0.6 }}>Elaborazione documento in corso...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                <FileUp size={22} style={{ color: ORANGE }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#0a0a0a" }}>Importa da Word o PDF</p>
                <p className="text-xs mt-1" style={{ color: "#0a0a0a", opacity: 0.5 }}>Trascina qui il file oppure clicca per selezionarlo</p>
                <p className="text-[11px] mt-1" style={{ color: "#0a0a0a", opacity: 0.35 }}>.docx · .doc · .pdf · max 20MB</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors hover:bg-[#0a0a0a]/5"
                style={{ color: ORANGE, borderColor: `${ORANGE}44` }}
              >
                <Upload size={12} />
                Seleziona file
              </button>
            </div>
          )}
        </div>
      )}
    </div>
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleImport = useCallback((text: string, filename: string) => {
    // Prova a estrarre il titolo dalla prima riga non vuota
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && !title) {
      const firstLine = lines[0];
      if (firstLine.length <= 200) {
        setTitle(firstLine);
        setBody(lines.slice(1).join("\n\n"));
      } else {
        setBody(text);
      }
    } else {
      // Appende al testo esistente se c'è già contenuto
      setBody(prev => prev ? `${prev}\n\n--- Importato da ${filename} ---\n\n${text}` : text);
    }
    // Scroll alla textarea
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [title]);

  const canSave = title.length >= 5 && body.length >= 50 && !!category;
  const canPublish = canSave && !!savedId && !!summary.trim();

  // Conta parole
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <PageWrapper title={`${articleId ? "Modifica" : "Nuovo"} Articolo — ProofPress`}>
      {/* Header editor sticky */}
      <div className="sticky top-0 z-20 border-b border-[#0a0a0a]/8 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between gap-4">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity shrink-0" style={{ color: "#0a0a0a", opacity: 0.5 }}>
            <ChevronLeft size={16} /><span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#0a0a0a", opacity: 0.4 }}>
            <span>{wordCount} parole</span>
            <span>·</span>
            <span>{readTime} min lettura</span>
            <span>·</span>
            <span>{body.length} caratteri</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => saveMutation.mutate({ id: savedId, title, body, summary, category, imageUrl })}
              disabled={!canSave || saveMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-[#0a0a0a]/15 hover:bg-[#0a0a0a]/5 transition-colors disabled:opacity-40"
              style={{ color: "#0a0a0a" }}
            >
              {saveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
              {saveMutation.isPending ? "Salvo..." : "💾 Salva"}
            </button>
            <button
              onClick={async () => {
                const saved = await saveMutation.mutateAsync({ id: savedId, title, body, summary, category, imageUrl });
                submitForReviewMutation.mutate({ articleId: saved.id });
              }}
              disabled={!canPublish || submitForReviewMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: ORANGE }}
            >
              {submitForReviewMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
              {submitForReviewMutation.isPending ? "Invio..." : "🔏 Invia in Revisione"}
            </button>
          </div>
        </div>
      </div>

      <section className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          {publishResult && (
            <div className="border border-amber-200 p-4 mb-6 flex items-start gap-3 rounded-lg" style={{ background: "#fffbeb" }}>
              <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-700">⏳ Articolo inviato in revisione</p>
                <p className="text-xs text-amber-600 mt-0.5">La redazione ProofPress esaminerà il tuo articolo e lo pubblicherà con bollino PP-Verify una volta approvato.</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
            {/* ── Colonna principale: editor ── */}
            <div className="flex flex-col gap-6">
              {/* Titolo grande */}
              <div>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo dell'articolo..."
                  rows={2}
                  maxLength={300}
                  className="w-full resize-none border-0 border-b-2 border-[#0a0a0a]/10 focus:border-[#ff5500] focus:outline-none bg-transparent text-3xl md:text-4xl font-black leading-tight pb-3 transition-colors"
                  style={{ color: "#0a0a0a", fontFamily: FONT }}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px]" style={{ color: "#0a0a0a", opacity: 0.3 }}>Titolo *</span>
                  <span className="text-[11px]" style={{ color: title.length < 5 ? "#dc2626" : "#0a0a0a", opacity: title.length < 5 ? 1 : 0.3 }}>{title.length}/300</span>
                </div>
              </div>

              {/* Sommario */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.4 }}>Sommario <span className="normal-case font-normal opacity-70">(richiesto per la pubblicazione, max 300 caratteri)</span></label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Breve sommario che apparirà in anteprima..."
                  rows={3}
                  maxLength={300}
                  className="border-[#0a0a0a]/15 bg-[#fafafa] focus:bg-white resize-none text-sm leading-relaxed transition-colors"
                  style={{ fontFamily: FONT }}
                />
                <p className="text-[11px] mt-1 text-right" style={{ color: summary.length > 280 ? "#d97706" : "#0a0a0a", opacity: summary.length > 280 ? 1 : 0.3 }}>{summary.length}/300</p>
              </div>

              {/* Import documento */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#0a0a0a", opacity: 0.4 }}>Importa documento <span className="normal-case font-normal opacity-70">(opzionale — pre-carica il testo nell'editor)</span></label>
                <ImportDropZone onImport={handleImport} />
              </div>

              {/* Corpo articolo */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#0a0a0a", opacity: 0.4 }}>Contenuto *</label>
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Scrivi il tuo articolo qui...&#10;&#10;Puoi anche importare un documento Word o PDF qui sopra per pre-caricare il testo."
                  className="w-full border border-[#0a0a0a]/12 bg-[#fafafa] focus:bg-white focus:border-[#0a0a0a]/25 focus:outline-none rounded-lg p-5 resize-y transition-colors"
                  style={{
                    fontFamily: FONT,
                    fontSize: "16px",
                    lineHeight: "1.8",
                    color: "#0a0a0a",
                    minHeight: "600px",
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px]" style={{ color: body.length < 50 ? "#dc2626" : "#0a0a0a", opacity: body.length < 50 ? 1 : 0.3 }}>
                    {body.length < 50 ? `Minimo 50 caratteri (mancano ${50 - body.length})` : `${body.length} caratteri`}
                  </span>
                  <span className="text-[11px]" style={{ color: "#0a0a0a", opacity: 0.3 }}>{wordCount} parole · ~{readTime} min</span>
                </div>
              </div>
            </div>

            {/* ── Sidebar destra: metadati + azioni ── */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-[57px]">
              {/* Metadati */}
              <div className="border border-[#0a0a0a]/8 bg-[#f9f9f9] rounded-xl p-5">
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
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="border-[#0a0a0a]/20 bg-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="border border-[#0a0a0a]/8 bg-[#f9f9f9] rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#0a0a0a", opacity: 0.45 }}>Azioni</p>
                <button
                  onClick={() => saveMutation.mutate({ id: savedId, title, body, summary, category, imageUrl })}
                  disabled={!canSave || saveMutation.isPending}
                  className="w-full py-3 text-sm font-bold border border-[#0a0a0a]/15 hover:bg-[#0a0a0a]/5 transition-colors disabled:opacity-40 rounded-lg flex items-center justify-center gap-2"
                  style={{ color: "#0a0a0a" }}
                >
                  {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  {saveMutation.isPending ? "Salvataggio..." : "💾 Salva Bozza"}
                </button>
                <button
                  onClick={async () => {
                    const saved = await saveMutation.mutateAsync({ id: savedId, title, body, summary, category, imageUrl });
                    submitForReviewMutation.mutate({ articleId: saved.id });
                  }}
                  disabled={!canPublish || submitForReviewMutation.isPending}
                  className="w-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-40 rounded-lg flex items-center justify-center gap-2"
                  style={{ background: ORANGE }}
                >
                  {submitForReviewMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  {submitForReviewMutation.isPending ? "Invio in corso..." : "🔏 Invia in Revisione"}
                </button>
                <p className="text-[11px] text-center" style={{ color: "#0a0a0a", opacity: 0.4 }}>
                  {!savedId ? "Salva prima la bozza per poter inviare" : "Sarà revisionato dalla redazione ProofPress"}
                </p>
              </div>

              {/* Stato validazione */}
              <div className="border border-[#0a0a0a]/8 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#0a0a0a", opacity: 0.45 }}>Stato</p>
                <div className="flex flex-col gap-2">
                  {[
                    { ok: title.length >= 5, label: "Titolo (min 5 caratteri)" },
                    { ok: body.length >= 50, label: "Contenuto (min 50 caratteri)" },
                    { ok: !!category, label: "Categoria selezionata" },
                    { ok: !!summary.trim(), label: "Sommario (per invio)" },
                  ].map(({ ok, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-green-100" : "bg-[#0a0a0a]/8"}`}>
                        {ok ? <CheckCircle2 size={10} className="text-green-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]/25" />}
                      </div>
                      <span className="text-[11px]" style={{ color: "#0a0a0a", opacity: ok ? 0.7 : 0.4 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ProofPress Verify */}
              <div className="border border-[#0a0a0a]/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={13} style={{ color: ORANGE }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#0a0a0a", opacity: 0.45 }}>ProofPress Verify</p>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "#0a0a0a", opacity: 0.5 }}>
                  All'approvazione, il sistema genera un hash SHA-256 con la tua Journalist Key. Il bollino <strong>PP-Verify</strong> certifica la paternità in modo crittograficamente immutabile.
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
