/**
 * ProofPress Verify — Dashboard Cliente SaaS v2
 *
 * Tabs: Overview · Verifiche · Analytics · API Keys · Documentazione
 * Design: Apple Editorial — bianco/grigio, monochrome, clean.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Key, Copy, Trash2, Plus, CheckCircle, AlertCircle, Clock, Zap, Shield,
  FileText, ExternalLink, ChevronRight, Eye, EyeOff, BarChart3, Hash,
  Globe, TrendingUp, Database, Search, ArrowUpRight, BookOpen, Code2,
  RefreshCw, ChevronLeft, ChevronRight as ChevronR, Info, PenLine,
} from "lucide-react";
import { TabWhatIsVerify, TabEasyStart, TabEditor, TabMyPosts } from "./DashboardTabs";

// ── Constants ─────────────────────────────────────────────────────────────────
const SF = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";
const PAGE_SIZE = 15;

const PLAN_LABELS: Record<string, string> = {
  essential: "Verify Essential",
  premiere: "Verify Premiere",
  professional: "Verify Professional",
  custom: "Verify Custom",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Attivo", trial: "Trial", past_due: "Pagamento scaduto", cancelled: "Cancellato",
};
const GRADE_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: "#f0fdf4", text: "#16a34a", bar: "#22c55e" },
  B: { bg: "#eff6ff", text: "#2563eb", bar: "#3b82f6" },
  C: { bg: "#fefce8", text: "#ca8a04", bar: "#eab308" },
  D: { bg: "#fff7ed", text: "#ea580c", bar: "#f97316" },
  F: { bg: "#fef2f2", text: "#dc2626", bar: "#ef4444" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function UsageBar({ used, limit, percent }: { used: number; limit: number; percent: number }) {
  const color = percent >= 90 ? "#ef4444" : percent >= 70 ? "#f59e0b" : "#1d1d1f";
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[#6e6e73]">Articoli verificati questo mese</span>
        <span className="font-semibold text-[#1d1d1f]">
          {used.toLocaleString()} / {limit === -1 ? "∞" : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
      </div>
      {percent >= 80 && limit !== -1 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Hai usato il {percent}% del limite mensile.
        </p>
      )}
    </div>
  );
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-[#86868b] text-xs">—</span>;
  const c = GRADE_COLORS[grade] ?? { bg: "#f5f5f7", text: "#1d1d1f", bar: "#1d1d1f" };
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {grade}
    </span>
  );
}

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[#86868b] text-xs">—</span>;
  // score è in scala 0-1 nel DB, convertiamo a 0-100 per la visualizzazione
  const pct = score <= 1 ? Math.round(score * 100) : Math.round(score);
  const grade = pct >= 90 ? "A" : pct >= 75 ? "B" : pct >= 55 ? "C" : pct >= 35 ? "D" : "F";
  const c = GRADE_COLORS[grade];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.bar }} />
      </div>
      <span className="text-xs font-semibold" style={{ color: c.text }}>{pct}</span>
    </div>
  );
}

/** Calcola il breakdown dei criteri Trust Score dato un record articolo */
function computeBreakdown(row: {
  verifyHash?: string | null;
  ipfsCid?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  summary?: string | null;
}) {
  const criteria: { label: string; points: number; earned: number; ok: boolean }[] = [
    {
      label: "Hash SHA-256 certificato",
      points: 40,
      earned: row.verifyHash && row.verifyHash.length === 64 ? 40 : 0,
      ok: !!(row.verifyHash && row.verifyHash.length === 64),
    },
    {
      label: "Archiviazione IPFS",
      points: 25,
      earned: row.ipfsCid && row.ipfsCid.length > 10 ? 25 : 0,
      ok: !!(row.ipfsCid && row.ipfsCid.length > 10),
    },
    {
      label: "Fonte citata (nome)",
      points: 8,
      earned: row.sourceName && row.sourceName.trim().length > 0 ? 8 : 0,
      ok: !!(row.sourceName && row.sourceName.trim().length > 0),
    },
    {
      label: "Fonte citata (URL)",
      points: 7,
      earned: row.sourceUrl && row.sourceUrl.trim().length > 0 ? 7 : 0,
      ok: !!(row.sourceUrl && row.sourceUrl.trim().length > 0),
    },
    {
      label: "Contenuto ricco (>800 char)",
      points: 15,
      earned: (row.summary?.trim().length ?? 0) >= 800 ? 15
        : (row.summary?.trim().length ?? 0) >= 400 ? 10
        : (row.summary?.trim().length ?? 0) >= 150 ? 6
        : (row.summary?.trim().length ?? 0) >= 50 ? 3 : 0,
      ok: (row.summary?.trim().length ?? 0) >= 150,
    },
    {
      label: "Report AI Verify",
      points: 5,
      earned: 5, // se è in questa lista ha già il verifyReport
      ok: true,
    },
  ];
  const total = criteria.reduce((s, c) => s + c.earned, 0);
  return { criteria, total };
}

function GradeBadgeWithBreakdown({ grade, row }: {
  grade: string | null;
  row: {
    verifyHash?: string | null;
    ipfsCid?: string | null;
    sourceName?: string | null;
    sourceUrl?: string | null;
    summary?: string | null;
  };
}) {
  const [open, setOpen] = useState(false);
  if (!grade) return <span className="text-[#86868b] text-xs">—</span>;
  const c = GRADE_COLORS[grade] ?? { bg: "#f5f5f7", text: "#1d1d1f", bar: "#1d1d1f" };
  const { criteria, total } = computeBreakdown(row);
  const GRADE_LABELS: Record<string, string> = {
    A: "Certificazione Massima", B: "Alta Affidabilità",
    C: "Affidabilità Standard", D: "Verifica Parziale", F: "Non Verificato",
  };
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: c.bg, color: c.text }}
        title="Clicca per vedere il breakdown del Trust Score"
      >
        {grade}
      </button>
      {open && (
        <div
          className="absolute left-0 top-9 z-50 w-72 rounded-xl shadow-xl border border-[#e5e5e5] bg-white p-4"
          style={{ fontFamily: SF }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868b]">Trust Score Breakdown</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-black" style={{ color: c.text }}>Grade {grade}</span>
                <span className="text-xs text-[#86868b]">{GRADE_LABELS[grade]}</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#86868b] hover:text-[#1d1d1f] text-lg leading-none">×</button>
          </div>
          <div className="space-y-2 mb-3">
            {criteria.map(cr => (
              <div key={cr.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
                    cr.ok ? 'bg-green-100 text-green-700' : 'bg-[#f5f5f7] text-[#86868b]'
                  }`}>{cr.ok ? '✓' : '○'}</span>
                  <span className="text-[11px] text-[#1d1d1f] truncate">{cr.label}</span>
                </div>
                <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: cr.ok ? c.text : '#c7c7cc' }}>
                  +{cr.earned}/{cr.points}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#f0f0f0] pt-2 flex items-center justify-between">
            <span className="text-[11px] text-[#86868b]">Punteggio totale</span>
            <span className="text-sm font-black" style={{ color: c.text }}>{total}/100</span>
          </div>
          <p className="text-[9px] text-[#86868b] mt-2 leading-relaxed">
            Il Trust Score misura la qualità della certificazione, non la veridicità del contenuto.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="border-[#e5e5e5]">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-[#86868b] uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#1d1d1f]" style={{ fontFamily: SF }}>{value}</p>
            {sub && <p className="text-xs text-[#86868b] mt-1">{sub}</p>}
          </div>
          <div className="w-9 h-9 bg-[#f5f5f7] rounded-xl flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#6e6e73]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── TAB: Overview ─────────────────────────────────────────────────────────────
function TabOverview({ orgData, analytics }: { orgData: any; analytics: any }) {
  const { org, usage } = orgData ?? {};
  const planLabel = usage?.plan ? PLAN_LABELS[usage.plan] ?? usage.plan : "—";
  const statusLabel = usage?.status ? STATUS_LABELS[usage.status] ?? usage.status : "—";

  const gradeTotal = analytics
    ? Object.values(analytics.gradeDistribution as Record<string, number>).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Piano + Consumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#e5e5e5]">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-[#86868b] uppercase tracking-widest mb-2">Piano attivo</p>
            <p className="text-xl font-bold text-[#1d1d1f]">{planLabel}</p>
            <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${
              usage?.status === "trial" ? "bg-amber-50 text-amber-700 border-amber-200" :
              usage?.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
              "bg-gray-50 text-gray-700 border-gray-200"
            }`}>{statusLabel}</span>
          </CardContent>
        </Card>
        <Card className="border-[#e5e5e5] sm:col-span-2">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-[#86868b] uppercase tracking-widest mb-3">Consumo mensile</p>
            {usage ? (
              <>
                <UsageBar used={usage.articlesUsed} limit={usage.articlesLimit} percent={usage.percentUsed} />
                <p className="text-xs text-[#86868b] mt-2">
                  Periodo: {new Date(usage.periodStart).toLocaleDateString("it-IT")} →{" "}
                  {new Date(usage.periodEnd).toLocaleDateString("it-IT")}
                  {usage.status === "trial" && (
                    <span className="ml-2 text-amber-600 font-medium">
                      · {usage.daysRemaining} giorni al termine del trial
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#86868b]">Nessuna subscription attiva.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPI analytics */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle} label="Articoli verificati" value={analytics.totalVerified.toLocaleString()} />
          <StatCard icon={Database} label="Certificati IPFS" value={analytics.totalIpfs.toLocaleString()} />
          <StatCard icon={BarChart3} label="TrustGrade A" value={analytics.gradeDistribution.A} sub="articoli eccellenti" />
          <StatCard icon={TrendingUp} label="Tasso IPFS" value={analytics.totalVerified > 0 ? `${Math.round((analytics.totalIpfs / analytics.totalVerified) * 100)}%` : "—"} sub="articoli su blockchain" />
        </div>
      )}

      {/* Distribuzione TrustGrade */}
      {analytics && gradeTotal > 0 && (
        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1d1d1f]">Distribuzione TrustGrade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["A", "B", "C", "D", "F"] as const).map((g) => {
              const n = analytics.gradeDistribution[g] ?? 0;
              const pct = gradeTotal > 0 ? Math.round((n / gradeTotal) * 100) : 0;
              const c = GRADE_COLORS[g];
              return (
                <div key={g} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: c.bg, color: c.text }}>{g}</span>
                  <div className="flex-1 h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: c.bar }} />
                  </div>
                  <span className="text-xs text-[#6e6e73] w-20 text-right">{n.toLocaleString()} ({pct}%)</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      {/* Demo Live — card in evidenza */}
      <Link href="/verify/demo">
        <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#00897b] bg-[#f0fdf4] hover:bg-[#e6faf5] transition-colors cursor-pointer group mb-1">
          <div className="w-10 h-10 bg-[#00897b] rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#00897b]">Demo Live — Prova la Pipeline</p>
            <p className="text-xs text-[#6e6e73] mt-0.5">Incolla qualsiasi testo e vedi in tempo reale hash SHA-256, claim estratti e TrustGrade. Nessun login richiesto.</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#00897b] flex-shrink-0" />
        </div>
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Hash, label: "Registro Certificazioni", desc: "Tutti gli articoli su IPFS", href: "/verify/registry" },
          { icon: Globe, label: "Registro Pubblico", desc: "Verifica un hash esterno", href: "/proofpress-verify" },
          { icon: BookOpen, label: "Documentazione API", desc: "Integra nel tuo CMS", href: "#docs" },
        ].map(({ icon: Icon, label, desc, href }) => (
          <Link key={label} href={href}>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e5e5] bg-white hover:border-[#1d1d1f] transition-colors cursor-pointer group">
              <div className="w-9 h-9 bg-[#f5f5f7] rounded-xl flex items-center justify-center group-hover:bg-[#1d1d1f] transition-colors">
                <Icon className="w-4 h-4 text-[#6e6e73] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">{label}</p>
                <p className="text-xs text-[#86868b]">{desc}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#86868b] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── TAB: Verifiche ────────────────────────────────────────────────────────────
function TabVerifications() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, refetch } = trpc.verifyClient.myVerifications.useQuery(
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    { staleTime: 60_000 }
  );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      r.title?.toLowerCase().includes(q) ||
      r.verifyHash?.toLowerCase().includes(q) ||
      r.ipfsCid?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-4">
      {/* Search + refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <Input
            className="pl-9 bg-white border-[#e5e5e5] text-sm"
            placeholder="Cerca per titolo, hash SHA-256 o CID IPFS…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
          />
        </div>
        <Button variant="outline" size="sm" className="border-[#e5e5e5]" onClick={() => { setSearch(searchInput); }}>
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" className="border-[#e5e5e5]" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <Card className="border-[#e5e5e5] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_100px_160px_80px] gap-3 px-5 py-3 bg-[#f5f5f7] border-b border-[#e5e5e5]">
          {["Articolo", "Grade", "Score", "IPFS / Hash", "Data"].map(h => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">{h}</span>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Hash className="w-8 h-8 text-[#c7c7cc] mx-auto mb-3" />
            <p className="text-sm text-[#86868b]">Nessuna verifica trovata.</p>
          </div>
        ) : (
          filtered.map((row, idx) => (
            <div key={row.id}
              className={`grid grid-cols-[1fr_80px_100px_160px_80px] gap-3 px-5 py-4 items-center border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${idx === filtered.length - 1 ? "border-b-0" : ""}`}>
              {/* Titolo */}
              <div className="min-w-0">
                {row.sourceUrl ? (
                  <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-[#1d1d1f] hover:text-[#00897b] transition-colors line-clamp-2 leading-snug flex items-start gap-1">
                    {row.title}
                    <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-50" />
                  </a>
                ) : (
                  <p className="text-[13px] font-semibold text-[#1d1d1f] line-clamp-2 leading-snug">{row.title}</p>
                )}
                {row.sourceName && <p className="text-[11px] text-[#86868b] mt-0.5">{row.sourceName}</p>}
              </div>
              {/* Grade — clicca per vedere il breakdown */}
              <GradeBadgeWithBreakdown grade={row.trustGrade} row={row} />
              {/* Score */}
              <ScoreBar score={row.trustScore} />
              {/* IPFS / Hash */}
              <div className="min-w-0">
                {row.ipfsCid ? (
                  <div className="flex flex-col gap-0.5">
                    {/* Link principale: pagina report human-readable */}
                    <a href={`/verify/${row.ipfsCid}`}
                      className="text-[11px] font-mono text-[#00897b] hover:underline flex items-center gap-1 truncate"
                      title="Apri il Verification Report">
                      <Database className="w-3 h-3 flex-shrink-0" />
                      {row.ipfsCid.slice(0, 12)}…
                    </a>
                    {/* Link secondario: JSON raw su IPFS */}
                    <a href={row.ipfsUrl ?? `https://ipfs.io/ipfs/${row.ipfsCid}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-[9px] text-[#86868b] hover:underline flex items-center gap-0.5"
                      title="JSON raw su IPFS">
                      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      JSON raw
                    </a>
                  </div>
                ) : row.verifyHash ? (
                  <a href={`/verify/${row.verifyHash}`}
                    className="text-[11px] font-mono text-[#86868b] hover:text-[#00897b] hover:underline truncate flex items-center gap-1"
                    title="Apri il Verification Report">
                    <Hash className="w-3 h-3 flex-shrink-0" />
                    {row.verifyHash.slice(0, 12)}…
                  </a>
                ) : (
                  <span className="text-[11px] text-[#c7c7cc]">—</span>
                )}
              </div>
              {/* Data */}
              <span className="text-[11px] text-[#86868b]">
                {row.ipfsPinnedAt
                  ? new Date(row.ipfsPinnedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })
                  : row.publishedAt
                  ? new Date(row.publishedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })
                  : "—"}
              </span>
            </div>
          ))
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#86868b]">{total.toLocaleString()} articoli totali</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-[#e5e5e5]"
              disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-[#6e6e73]">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" className="border-[#e5e5e5]"
              disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronR className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: Analytics ────────────────────────────────────────────────────────────
function TabAnalytics({ analytics }: { analytics: any }) {
  if (!analytics) {
    return (
      <div className="py-16 text-center">
        <BarChart3 className="w-10 h-10 text-[#c7c7cc] mx-auto mb-3" />
        <p className="text-sm text-[#86868b]">Nessun dato analytics disponibile.</p>
      </div>
    );
  }

  const gradeTotal = Object.values(analytics.gradeDistribution as Record<string, number>).reduce((a, b) => a + b, 0);
  const monthlyMax = analytics.monthlyTrend.length > 0
    ? Math.max(...analytics.monthlyTrend.map((m: any) => m.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Totale verificati" value={analytics.totalVerified.toLocaleString()} />
        <StatCard icon={Database} label="Su IPFS" value={analytics.totalIpfs.toLocaleString()} sub="certificati blockchain" />
        <StatCard icon={BarChart3} label="TrustGrade A+B" value={(analytics.gradeDistribution.A + analytics.gradeDistribution.B).toLocaleString()} sub="alta affidabilità" />
        <StatCard icon={TrendingUp} label="Copertura IPFS" value={analytics.totalVerified > 0 ? `${Math.round((analytics.totalIpfs / analytics.totalVerified) * 100)}%` : "—"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Distribuzione TrustGrade */}
        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1d1d1f]">Distribuzione TrustGrade</CardTitle>
            <CardDescription className="text-xs">{gradeTotal.toLocaleString()} articoli analizzati</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["A", "B", "C", "D", "F"] as const).map(g => {
              const n = analytics.gradeDistribution[g] ?? 0;
              const pct = gradeTotal > 0 ? Math.round((n / gradeTotal) * 100) : 0;
              const c = GRADE_COLORS[g];
              return (
                <div key={g} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: c.bg, color: c.text }}>{g}</span>
                  <div className="flex-1">
                    <div className="h-5 bg-[#f5f5f7] rounded overflow-hidden">
                      <div className="h-full flex items-center pl-2 rounded transition-all duration-700"
                        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: c.bar }}>
                        {pct >= 10 && <span className="text-[10px] text-white font-bold">{pct}%</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#6e6e73] w-12 text-right font-mono">{n.toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Trend mensile */}
        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1d1d1f]">Trend mensile certificazioni</CardTitle>
            <CardDescription className="text-xs">Ultimi 6 mesi</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.monthlyTrend.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#86868b]">Nessun dato disponibile</div>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {[...analytics.monthlyTrend].reverse().map((m: any) => {
                  const pct = Math.round((m.count / monthlyMax) * 100);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-[#86868b] font-mono">{m.count}</span>
                      <div className="w-full bg-[#f5f5f7] rounded-t overflow-hidden" style={{ height: "80px" }}>
                        <div className="w-full bg-[#1d1d1f] rounded-t transition-all duration-700"
                          style={{ height: `${Math.max(pct, 2)}%`, marginTop: `${100 - Math.max(pct, 2)}%` }} />
                      </div>
                      <span className="text-[9px] text-[#86868b] font-mono">{m.month?.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top sezioni */}
      {analytics.topSections.length > 0 && (
        <Card className="border-[#e5e5e5]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1d1d1f]">Top sezioni per articoli verificati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topSections.map((s: any, i: number) => {
                const maxCount = analytics.topSections[0]?.count ?? 1;
                const pct = Math.round((s.count / maxCount) * 100);
                return (
                  <div key={s.section} className="flex items-center gap-3">
                    <span className="text-xs text-[#86868b] w-4">{i + 1}</span>
                    <span className="text-xs font-medium text-[#1d1d1f] w-24 capitalize">{s.section}</span>
                    <div className="flex-1 h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1d1d1f] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-[#6e6e73] font-mono w-10 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── TAB: API Keys ─────────────────────────────────────────────────────────────
function TabApiKeys({ apiKeys, keysLoading, refetchKeys, orgData }: any) {
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [showNewKeyValue, setShowNewKeyValue] = useState(false);
  const [revokeConfirmId, setRevokeConfirmId] = useState<number | null>(null);

  const createKey = trpc.verifyClient.createApiKey.useMutation({
    onSuccess: (data) => {
      setNewKeyValue(data.rawKey);
      setShowNewKeyValue(true);
      setNewKeyLabel("");
      refetchKeys();
      toast.success("Chiave API generata — salvala subito.");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const revokeKey = trpc.verifyClient.revokeApiKey.useMutation({
    onSuccess: () => {
      setRevokeConfirmId(null);
      refetchKeys();
      toast.success("Chiave revocata.");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  return (
    <div className="space-y-4">
      <Card className="border-[#e5e5e5]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2">
              <Key className="w-4 h-4" /> Chiavi API
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Usa le chiavi API per integrare ProofPress Verify nel tuo CMS o workflow redazionale.
            </CardDescription>
          </div>
          <Button size="sm" className="bg-[#1d1d1f] text-white hover:bg-[#333]"
            onClick={() => setShowNewKeyDialog(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nuova chiave
          </Button>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !apiKeys || apiKeys.length === 0 ? (
            <div className="py-8 text-center">
              <Key className="w-8 h-8 text-[#c7c7cc] mx-auto mb-2" />
              <p className="text-sm text-[#86868b]">Nessuna chiave API. Creane una per iniziare.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((k: any) => (
                <div key={k.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${k.isActive ? "border-[#e5e5e5] bg-white" : "border-[#f0f0f0] bg-[#fafafa] opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${k.isActive ? "bg-green-500" : "bg-[#c7c7cc]"}`} />
                    <div>
                      <p className="text-sm font-mono text-[#1d1d1f]">{k.keyPrefix}</p>
                      <p className="text-xs text-[#86868b]">
                        {k.label ?? "Senza etichetta"} · Creata {new Date(k.createdAt).toLocaleDateString("it-IT")}
                        {k.lastUsedAt && ` · Usata ${new Date(k.lastUsedAt).toLocaleDateString("it-IT")}`}
                      </p>
                    </div>
                  </div>
                  {k.isActive && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setRevokeConfirmId(k.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog nuova chiave */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova chiave API</DialogTitle>
            <DialogDescription>Assegna un'etichetta per identificarla facilmente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="key-label">Etichetta (opzionale)</Label>
              <Input id="key-label" placeholder="es. Produzione CMS, Staging…"
                value={newKeyLabel} onChange={e => setNewKeyLabel(e.target.value)} />
            </div>
            <Button className="w-full bg-[#1d1d1f] text-white"
              disabled={createKey.isPending}
              onClick={() => createKey.mutate({ label: newKeyLabel || undefined })}>
              {createKey.isPending ? "Generazione…" : "Genera chiave"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog mostra nuova chiave */}
      <Dialog open={!!newKeyValue} onOpenChange={() => { setNewKeyValue(null); setShowNewKeyDialog(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" /> Chiave generata
            </DialogTitle>
            <DialogDescription>
              Copia e salva questa chiave subito — non sarà più visibile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="relative">
              <Input readOnly value={showNewKeyValue ? (newKeyValue ?? "") : "•".repeat(40)}
                className="font-mono text-xs pr-20" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setShowNewKeyValue(v => !v)}>
                  {showNewKeyValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  navigator.clipboard.writeText(newKeyValue ?? "");
                  toast.success("Copiata!");
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Questa chiave non sarà più visibile dopo la chiusura di questa finestra.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog revoca */}
      <Dialog open={revokeConfirmId !== null} onOpenChange={() => setRevokeConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revocare la chiave?</DialogTitle>
            <DialogDescription>
              Questa azione è irreversibile. Tutte le integrazioni che usano questa chiave smetteranno di funzionare.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setRevokeConfirmId(null)}>Annulla</Button>
            <Button variant="destructive" className="flex-1"
              disabled={revokeKey.isPending}
              onClick={() => revokeConfirmId !== null && revokeKey.mutate({ id: revokeConfirmId })}>
              {revokeKey.isPending ? "Revoca…" : "Revoca chiave"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── TAB: Documentazione ───────────────────────────────────────────────────────
function TabDocs({ apiKeys }: { apiKeys: any[] }) {
  const exampleKey = apiKeys?.[0]?.keyPrefix ?? "ppv_live_xxxx...";
  const [copied, setCopied] = useState<string | null>(null);

  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const curlVerify = `curl -X POST https://proofpress.ai/api/verify/article \\
  -H "Authorization: Bearer ${exampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/articolo"}'`;

  const curlHash = `curl -X GET "https://proofpress.ai/api/verify/report?hash=SHA256_HASH" \\
  -H "Authorization: Bearer ${exampleKey}"`;

  const jsExample = `const response = await fetch('https://proofpress.ai/api/verify/article', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${exampleKey}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: 'https://example.com/articolo' }),
});
const { trustScore, trustGrade, report } = await response.json();`;

  return (
    <div className="space-y-6">
      <Card className="border-[#e5e5e5]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Endpoint: Verifica articolo
          </CardTitle>
          <CardDescription className="text-xs">
            <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[#1d1d1f]">POST /api/verify/article</code>
            {" "}— Invia un URL o un hash SHA-256 per ottenere TrustScore, TrustGrade e Verification Report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: "curl-verify", label: "cURL", code: curlVerify },
            { id: "js-verify", label: "JavaScript / Node.js", code: jsExample },
          ].map(({ id, label, code }) => (
            <div key={id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[#6e6e73]">{label}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                  onClick={() => copyCode(id, code)}>
                  {copied === id ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  {copied === id ? " Copiato" : " Copia"}
                </Button>
              </div>
              <pre className="bg-[#f5f5f7] rounded-xl p-4 text-xs font-mono text-[#1d1d1f] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {code}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-[#e5e5e5]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Hash className="w-4 h-4" /> Endpoint: Recupera report da hash
          </CardTitle>
          <CardDescription className="text-xs">
            <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[#1d1d1f]">GET /api/verify/report?hash=…</code>
            {" "}— Recupera il Verification Report completo da un hash SHA-256.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[#6e6e73]">cURL</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
              onClick={() => copyCode("curl-hash", curlHash)}>
              {copied === "curl-hash" ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copied === "curl-hash" ? " Copiato" : " Copia"}
            </Button>
          </div>
          <pre className="bg-[#f5f5f7] rounded-xl p-4 text-xs font-mono text-[#1d1d1f] overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {curlHash}
          </pre>
        </CardContent>
      </Card>

      <Card className="border-[#e5e5e5]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1d1d1f]">Risposta tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-[#f5f5f7] rounded-xl p-4 text-xs font-mono text-[#1d1d1f] overflow-x-auto leading-relaxed">
{`{
  "status": "verified",
  "trustScore": 87,
  "trustGrade": "A",
  "article": {
    "id": 12345,
    "title": "Titolo articolo",
    "verifyHash": "sha256:abc123...",
    "sourceUrl": "https://...",
    "proofpressUrl": "https://proofpress.ai/ai/news/12345"
  },
  "report": {
    "summary": "...",
    "claims": [...],
    "sources": [...],
    "ipfsCid": "Qm..."
  },
  "usage": { "articlesUsed": 12, "articlesLimit": 300 }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────
type Tab = "overview" | "verifiche" | "analytics" | "apikeys" | "docs" | "coseverify" | "easystart" | "editor" | "myposts" | "demo";

export default function VerifyDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: orgData, isLoading: orgLoading } = trpc.verifyClient.myOrg.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: apiKeys, isLoading: keysLoading, refetch: refetchKeys } = trpc.verifyClient.myApiKeys.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: analytics } = trpc.verifyClient.myAnalytics.useQuery(
    undefined, { enabled: isAuthenticated, staleTime: 5 * 60_000 }
  );

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-[#1d1d1f] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Accesso richiesto</CardTitle>
            <CardDescription>Accedi per visualizzare la tua dashboard Verify.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href={getLoginUrl()}>Accedi</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orgLoading && !orgData) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-[#1d1d1f] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Attiva ProofPress Verify</CardTitle>
            <CardDescription>Non hai ancora un'organizzazione. Avvia il trial gratuito di 14 giorni.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-[#1d1d1f] text-white" asChild>
              <Link href="/verify/join">Inizia il trial gratuito →</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/proofpress-verify">Scopri i piani</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { org } = orgData ?? {};

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "demo", label: "⚡ Demo Live", icon: Zap },
    { id: "coseverify", label: "Cos'è Verify", icon: Info },
    { id: "easystart", label: "Easy Start", icon: Zap },
    { id: "editor", label: "Scrivi & Prova Verify", icon: PenLine },
    { id: "verifiche", label: "Verifiche", icon: CheckCircle },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "apikeys", label: "API Keys", icon: Key },
    { id: "docs", label: "Documentazione", icon: BookOpen },
    { id: "myposts", label: "Post Pubblicati", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-[#1d1d1f] hover:opacity-70 transition-opacity">
              <div className="w-7 h-7 bg-[#1d1d1f] rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight">ProofPress Verify</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <span className="text-sm text-[#6e6e73]">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6e6e73] hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" className="border-[#00897b] text-[#00897b] hover:bg-[#00897b] hover:text-white transition-colors font-semibold" asChild>
              <Link href="/verify/demo">⚡ Demo Live</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/proofpress-verify">Piani</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Welcome ──────────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight" style={{ fontFamily: SF }}>
            {org?.name ?? "La tua organizzazione"}
          </h1>
          <p className="text-[#6e6e73] text-sm mt-1">{org?.domain ?? org?.contactEmail}</p>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-[#f0f0f0] p-1 rounded-xl w-fit overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? "bg-white text-[#1d1d1f] shadow-sm"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        {activeTab === "overview" && <TabOverview orgData={orgData} analytics={analytics} />}
        {activeTab === "demo" && (
          <div className="rounded-2xl overflow-hidden border-2 border-[#00897b] bg-white">
            <div className="flex items-center gap-3 px-5 py-3 bg-[#f0fdf4] border-b border-[#00897b]/20">
              <div className="w-7 h-7 bg-[#00897b] rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#00897b]">Demo Live — Pipeline Verify</p>
                <p className="text-xs text-[#6e6e73]">Pagina pubblica — nessun login richiesto, nessun dato salvato nel DB</p>
              </div>
              <a href="/verify/demo" target="_blank" rel="noopener noreferrer"
                className="ml-auto text-xs font-semibold text-[#00897b] hover:underline flex items-center gap-1">
                Apri in nuova tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              src="/verify/demo"
              className="w-full"
              style={{ height: '80vh', border: 'none' }}
              title="Demo Live ProofPress Verify"
            />
          </div>
        )}
        {activeTab === "coseverify" && <TabWhatIsVerify />}
        {activeTab === "easystart" && <TabEasyStart apiKeys={apiKeys ?? []} />}
        {activeTab === "editor" && <TabEditor />}
        {activeTab === "myposts" && <TabMyPosts />}
        {activeTab === "verifiche" && <TabVerifications />}
        {activeTab === "analytics" && <TabAnalytics analytics={analytics} />}
        {activeTab === "apikeys" && <TabApiKeys apiKeys={apiKeys} keysLoading={keysLoading} refetchKeys={refetchKeys} orgData={orgData} />}
        {activeTab === "docs" && <TabDocs apiKeys={apiKeys ?? []} />}
      </main>
    </div>
  );
}
