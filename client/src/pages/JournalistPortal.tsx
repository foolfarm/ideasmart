/**
 * Journalist Portal — Area privata per giornalisti accreditati ProofPress
 * Login con username + password → dashboard articoli → editor → pubblica con bollino Verify
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  PenLine, LogOut, Plus, FileText, CheckCircle2, Clock, XCircle,
  Shield, Eye, Trash2, Send, ChevronLeft, User, Hash, Award, BarChart3,
  BookOpen, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORIES = [
  "AI & Tecnologia", "Startup & Innovazione", "Economia & Finanza",
  "Politica & Società", "Scienza & Ricerca", "Cultura & Media",
  "Cybersecurity", "Sostenibilità", "Salute & Biotech", "Altro"
];

type View = "login" | "dashboard" | "editor" | "published";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { label: "Bozza", color: "bg-gray-100 text-gray-600", icon: Clock },
    review: { label: "In revisione", color: "bg-amber-100 text-amber-700", icon: Clock },
    published: { label: "Pubblicato", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    rejected: { label: "Rifiutato", color: "bg-red-100 text-red-700", icon: XCircle },
  }[status] ?? { label: status, color: "bg-gray-100 text-gray-500", icon: FileText };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

// ── Verify Badge ──────────────────────────────────────────────────────────────
function VerifyBadgeDisplay({ badge, hash }: { badge: string; hash: string }) {
  return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
      <Shield size={16} className="text-emerald-600 shrink-0" />
      <div>
        <p className="text-xs font-bold text-emerald-700">{badge}</p>
        <p className="text-[10px] text-emerald-600 font-mono">{hash.substring(0, 32)}...</p>
      </div>
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.journalist.login.useMutation({
    onSuccess: () => {
      toast.success("Accesso effettuato");
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
              <PenLine size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-[#0a0a0a]">ProofPress</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0a0a0a] mb-1">Portale Giornalisti</h1>
          <p className="text-sm text-gray-500">Accedi con le credenziali fornite dalla redazione</p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="il-tuo-username"
                className="border-gray-200"
                onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate({ username, password })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-gray-200"
                onKeyDown={(e) => e.key === "Enter" && loginMutation.mutate({ username, password })}
              />
            </div>
            <Button
              className="w-full bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white"
              onClick={() => loginMutation.mutate({ username, password })}
              disabled={loginMutation.isPending || !username || !password}
            >
              {loginMutation.isPending ? "Accesso in corso..." : "Accedi al Portale"}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">Accesso riservato</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Il portale è accessibile solo ai giornalisti accreditati da ProofPress.
                Per richiedere l'accreditamento, visita{" "}
                <Link href="/contatti" className="underline">la pagina Contatti</Link>.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">← Torna a ProofPress</Link>
        </p>
      </div>
    </div>
  );
}

// ── Article Editor ────────────────────────────────────────────────────────────
function ArticleEditor({
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
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    verifyBadge: string; verifyHash: string; publishedAt: Date;
  } | null>(null);

  const { data: existingArticle } = trpc.journalist.getArticle.useQuery(
    { id: articleId! },
    { enabled: !!articleId }
  );

  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setBody(existingArticle.body);
      setSummary(existingArticle.summary ?? "");
      setCategory(existingArticle.category);
      setImageUrl(existingArticle.imageUrl ?? "");
    }
  }, [existingArticle]);

  const saveMutation = trpc.journalist.saveDraft.useMutation({
    onSuccess: (data) => {
      setSavedId(data.id);
      toast.success("Bozza salvata");
    },
    onError: (e) => toast.error(e.message),
  });

  const publishMutation = trpc.journalist.publish.useMutation({
    onSuccess: (data) => {
      setPublishResult({
        verifyBadge: data.verifyBadge,
        verifyHash: data.verifyHash,
        publishedAt: data.publishedAt,
      });
      toast.success("Articolo pubblicato e certificato con ProofPress Verify!");
      onPublished();
    },
    onError: (e) => toast.error(e.message),
  });

  const canSave = title.length >= 5 && body.length >= 50 && category;
  const canPublish = canSave && !!savedId;

  if (publishResult) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Articolo Pubblicato!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Il tuo articolo è ora live su ProofPress, certificato e firmato con la tua chiave giornalista.
          </p>
          <VerifyBadgeDisplay badge={publishResult.verifyBadge} hash={publishResult.verifyHash} />
          <p className="text-xs text-gray-400 mt-3 mb-6">
            Pubblicato il {new Date(publishResult.publishedAt).toLocaleString("it-IT")}
          </p>
          <Button onClick={onBack} className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]">
            Torna alla Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft size={16} />
          Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveMutation.mutate({ id: savedId, title, body, summary, category, imageUrl })}
            disabled={!canSave || saveMutation.isPending}
          >
            {saveMutation.isPending ? "Salvataggio..." : "Salva bozza"}
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setShowPublishConfirm(true)}
            disabled={!canPublish || publishMutation.isPending}
          >
            <Send size={14} className="mr-1.5" />
            Pubblica e Certifica
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Verify info */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
          <Shield size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Certificazione ProofPress Verify</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Al momento della pubblicazione, il tuo articolo riceverà un hash SHA-256 che include la tua chiave giornalista.
              Questo certifica in modo crittografico che sei l'autore e che il contenuto non è stato alterato.
            </p>
          </div>
        </div>

        {/* Titolo */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
            Titolo *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Il titolo del tuo articolo..."
            className="text-lg font-semibold border-gray-200"
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/500 caratteri</p>
        </div>

        {/* Categoria */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
            Categoria *
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-gray-200">
              <SelectValue placeholder="Seleziona una categoria..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
            Sommario <span className="text-gray-400 font-normal">(opzionale — max 500 caratteri)</span>
          </label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Una breve descrizione dell'articolo per i lettori..."
            rows={2}
            maxLength={500}
            className="border-gray-200 resize-none"
          />
        </div>

        {/* URL immagine */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
            URL Immagine <span className="text-gray-400 font-normal">(opzionale)</span>
          </label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="border-gray-200"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
            Testo dell'articolo *
          </label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Scrivi qui il tuo articolo..."
            rows={20}
            className="border-gray-200 font-serif text-base leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1">{body.length} caratteri · min 50</p>
        </div>
      </div>

      {/* Confirm publish dialog */}
      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pubblica e certifica l'articolo?</AlertDialogTitle>
            <AlertDialogDescription>
              L'articolo verrà pubblicato su ProofPress e riceverà un bollino di certificazione
              ProofPress Verify con la tua firma digitale. Una volta pubblicato, non potrà essere
              modificato. Sei sicuro di voler procedere?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setShowPublishConfirm(false);
                if (savedId) publishMutation.mutate({ articleId: savedId });
              }}
            >
              Pubblica e Certifica
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({
  journalist,
  onNewArticle,
  onEditArticle,
  onLogout,
}: {
  journalist: { displayName: string; username: string; journalistKey: string; totalArticles: number; avgTrustScore?: number | null };
  onNewArticle: () => void;
  onEditArticle: (id: number) => void;
  onLogout: () => void;
}) {
  const { data: articles, refetch } = trpc.journalist.myArticles.useQuery();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = trpc.journalist.deleteDraft.useMutation({
    onSuccess: () => {
      toast.success("Bozza eliminata");
      refetch();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const logoutMutation = trpc.journalist.logout.useMutation({
    onSuccess: onLogout,
  });

  const drafts = articles?.filter((a) => a.status !== "published") ?? [];
  const published = articles?.filter((a) => a.status === "published") ?? [];

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
              <PenLine size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0a0a0a]">ProofPress — Portale Giornalisti</p>
              <p className="text-xs text-gray-500">Benvenuto, {journalist.displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-500"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut size={14} className="mr-1.5" />
              Esci
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Articoli</span>
              </div>
              <p className="text-2xl font-bold text-[#0a0a0a]">{journalist.totalArticles}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Bozze</span>
              </div>
              <p className="text-2xl font-bold text-[#0a0a0a]">{drafts.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Trust Score</span>
              </div>
              <p className="text-2xl font-bold text-[#0a0a0a]">
                {journalist.avgTrustScore ? `${Math.round(journalist.avgTrustScore * 100)}%` : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-emerald-500" />
                <span className="text-xs text-gray-500 uppercase tracking-wide">Certificati</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{published.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Journalist Key */}
        <Card className="border-0 shadow-sm mb-8 bg-[#0a0a0a] text-white">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Hash size={18} className="text-[#ff5500] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">La tua Journalist Key</p>
                <p className="font-mono text-sm text-white break-all">{journalist.journalistKey}</p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Questa chiave viene inclusa nell'hash SHA-256 di ogni tuo articolo pubblicato,
                  certificando crittograficamente la tua paternità in modo immutabile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nuovo articolo */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0a0a0a]">I tuoi articoli</h2>
          <Button
            className="bg-[#ff5500] hover:bg-[#e04a00] text-white"
            onClick={onNewArticle}
          >
            <Plus size={16} className="mr-1.5" />
            Nuovo articolo
          </Button>
        </div>

        {/* Lista articoli */}
        {!articles ? (
          <div className="text-center py-12 text-gray-400">Caricamento...</div>
        ) : articles.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <PenLine size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nessun articolo ancora</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                Inizia a scrivere il tuo primo articolo certificato ProofPress.
              </p>
              <Button onClick={onNewArticle} className="bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]">
                Scrivi il primo articolo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <Card key={article.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge status={article.status} />
                        <span className="text-xs text-gray-400">{article.category}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(article.createdAt).toLocaleDateString("it-IT")}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#0a0a0a] text-sm leading-snug mb-1 truncate">
                        {article.title}
                      </h3>
                      {article.status === "published" && article.verifyBadge && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Shield size={12} className="text-emerald-600" />
                          <span className="text-xs font-mono text-emerald-700 font-semibold">{article.verifyBadge}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {article.status !== "published" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-[#0a0a0a]"
                            onClick={() => onEditArticle(article.id)}
                          >
                            <PenLine size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => setDeleteId(article.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                      {article.status === "published" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-600"
                          asChild
                        >
                          <Link href="/">
                            <Eye size={14} />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la bozza?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. La bozza verrà eliminata definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Login
  if (!journalist || view === "login") {
    return <LoginForm onSuccess={() => { utils.journalist.me.invalidate(); }} />;
  }

  // Editor
  if (view === "editor") {
    return (
      <ArticleEditor
        articleId={editingArticleId}
        onBack={() => {
          setEditingArticleId(undefined);
          setView("dashboard");
          utils.journalist.myArticles.invalidate();
        }}
        onPublished={() => {
          utils.journalist.myArticles.invalidate();
          utils.journalist.me.invalidate();
        }}
      />
    );
  }

  // Dashboard
  return (
    <Dashboard
      journalist={journalist}
      onNewArticle={() => {
        setEditingArticleId(undefined);
        setView("editor");
      }}
      onEditArticle={(id) => {
        setEditingArticleId(id);
        setView("editor");
      }}
      onLogout={() => {
        utils.journalist.me.invalidate();
        setView("login");
      }}
    />
  );
}
