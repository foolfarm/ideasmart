/**
 * IDEASMART — Admin: SendGrid Email Statistics
 * Dashboard con statistiche di performance newsletter da SendGrid API.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Mail,
  TrendingUp,
  TrendingDown,
  Users,
  MousePointerClick,
  Eye,
  AlertTriangle,
  Ban,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function fmtTs(unixTs: number) {
  return new Date(unixTs * 1000).toLocaleDateString("it-IT", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function AdminSendgridStats() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [days, setDays] = useState(30);

  const statsQuery = trpc.adminTools.getSendgridStats.useQuery(
    { days },
    {
      enabled: user?.role === "admin",
      staleTime: 1000 * 60 * 15, // 15 min cache
      retry: 1,
    }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Accesso riservato agli amministratori.</p>
      </div>
    );
  }

  const data = statsQuery.data?.data;
  const totals = data?.totals;
  const chartData = data?.stats
    .slice(-14) // ultimi 14 giorni nel grafico
    .map((d: { date: string; delivered: number; unique_opens: number; unique_clicks: number; bounces: number; spam_reports: number; unsubscribes: number }) => ({
      date: fmtDate(d.date),
      Consegnate: d.delivered,
      Aperture: d.unique_opens,
      Click: d.unique_clicks,
      Bounce: d.bounces,
      Spam: d.spam_reports,
      Disiscritti: d.unsubscribes,
    })) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Admin
            </Button>
            <div className="h-5 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold">Email Stats — SendGrid</h1>
              <p className="text-xs text-muted-foreground">
                Performance newsletter · aggiornato in tempo reale da SendGrid API
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Ultimi 7 giorni</SelectItem>
                <SelectItem value="14">Ultimi 14 giorni</SelectItem>
                <SelectItem value="30">Ultimi 30 giorni</SelectItem>
                <SelectItem value="60">Ultimi 60 giorni</SelectItem>
                <SelectItem value="90">Ultimi 90 giorni</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => statsQuery.refetch()}
              disabled={statsQuery.isFetching}
              className="gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${statsQuery.isFetching ? "animate-spin" : ""}`} />
              Aggiorna
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stato fetch */}
        {statsQuery.isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Recupero statistiche da SendGrid...
          </div>
        )}

        {statsQuery.isError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="pt-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Errore recupero statistiche</p>
                  <p className="text-sm text-muted-foreground mt-1">{statsQuery.error?.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Verifica che la chiave API SendGrid sia valida e che il piano includa accesso alle statistiche.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data && totals && (
          <>
            {/* Timestamp aggiornamento */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Dati aggiornati: {new Date(data.fetchedAt).toLocaleString("it-IT")}
              <span className="ml-2 text-muted-foreground/60">· Periodo: ultimi {days} giorni</span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={Mail}
                label="Email consegnate"
                value={totals.delivered.toLocaleString("it-IT")}
                sub={`${totals.requests.toLocaleString("it-IT")} richieste totali`}
                color="text-blue-500"
              />
              <StatCard
                icon={Eye}
                label="Tasso apertura"
                value={`${totals.open_rate}%`}
                sub={`${totals.unique_opens.toLocaleString("it-IT")} aperture uniche`}
                color={totals.open_rate >= 20 ? "text-green-500" : "text-yellow-500"}
              />
              <StatCard
                icon={MousePointerClick}
                label="Tasso click"
                value={`${totals.click_rate}%`}
                sub={`${totals.unique_clicks.toLocaleString("it-IT")} click unici`}
                color={totals.click_rate >= 2 ? "text-green-500" : "text-yellow-500"}
              />
              <StatCard
                icon={Users}
                label="Disiscritti"
                value={totals.unsubscribes.toLocaleString("it-IT")}
                sub={`${data.unsubscribes.length} in lista soppressione`}
                color="text-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={TrendingDown}
                label="Bounce"
                value={totals.bounces.toLocaleString("it-IT")}
                sub={`${data.bounces.length} in lista bounce`}
                color="text-red-500"
              />
              <StatCard
                icon={AlertTriangle}
                label="Spam report"
                value={totals.spam_reports.toLocaleString("it-IT")}
                sub={`${data.spamReports.length} segnalazioni totali`}
                color={totals.spam_reports > 5 ? "text-red-500" : "text-muted-foreground"}
              />
              <StatCard
                icon={Ban}
                label="Bloccate"
                value={totals.blocks.toLocaleString("it-IT")}
                sub="email bloccate dal provider"
                color="text-muted-foreground"
              />
              <StatCard
                icon={TrendingUp}
                label="Email non valide"
                value={totals.invalid_emails.toLocaleString("it-IT")}
                sub="indirizzi non validi"
                color="text-muted-foreground"
              />
            </div>

            {/* Grafico consegne + aperture (ultimi 14 gg) */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Andamento consegne e aperture (ultimi 14 giorni)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line type="monotone" dataKey="Consegnate" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Aperture" stroke="#22c55e" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Click" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Grafico problemi (bounce, spam, disiscritti) */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Problemi di deliverability (ultimi 14 giorni)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="Bounce" fill="#ef4444" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Spam" fill="#f97316" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Disiscritti" fill="#a855f7" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Tabella giornaliera */}
            {data.stats.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Dettaglio giornaliero</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Data</TableHead>
                          <TableHead className="text-xs text-right">Consegnate</TableHead>
                          <TableHead className="text-xs text-right">Aperture</TableHead>
                          <TableHead className="text-xs text-right">% Apertura</TableHead>
                          <TableHead className="text-xs text-right">Click</TableHead>
                          <TableHead className="text-xs text-right">% Click</TableHead>
                          <TableHead className="text-xs text-right">Bounce</TableHead>
                          <TableHead className="text-xs text-right">Spam</TableHead>
                          <TableHead className="text-xs text-right">Disiscr.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...data.stats].reverse().map((row) => (
                          <TableRow key={row.date} className="text-xs">
                            <TableCell className="font-medium">{fmtDate(row.date)}</TableCell>
                            <TableCell className="text-right">{row.delivered.toLocaleString("it-IT")}</TableCell>
                            <TableCell className="text-right">{row.unique_opens.toLocaleString("it-IT")}</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={row.open_rate >= 20 ? "default" : "secondary"}
                                className="text-xs font-normal"
                              >
                                {row.open_rate}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{row.unique_clicks.toLocaleString("it-IT")}</TableCell>
                            <TableCell className="text-right">{row.click_rate}%</TableCell>
                            <TableCell className="text-right text-red-500">{row.bounces || "—"}</TableCell>
                            <TableCell className="text-right text-orange-500">{row.spam_reports || "—"}</TableCell>
                            <TableCell className="text-right text-purple-500">{row.unsubscribes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabella disiscritti recenti */}
            {data.unsubscribes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    Disiscritti recenti ({data.unsubscribes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs text-right">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.unsubscribes.slice(0, 50).map((u: { email: string; created: number }, i: number) => (
                          <TableRow key={i} className="text-xs">
                            <TableCell className="font-mono">{u.email}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{fmtTs(u.created)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabella bounce recenti */}
            {data.bounces.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    Bounce recenti ({data.bounces.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">Motivo</TableHead>
                          <TableHead className="text-xs text-right">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.bounces.slice(0, 50).map((b: { email: string; created: number; reason?: string }, i: number) => (
                          <TableRow key={i} className="text-xs">
                            <TableCell className="font-mono">{b.email}</TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">{b.reason ?? "—"}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{fmtTs(b.created)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabella spam report */}
            {data.spamReports.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Spam report ({data.spamReports.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs text-right">Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.spamReports.slice(0, 30).map((s: { email: string; created: number }, i: number) => (
                          <TableRow key={i} className="text-xs">
                            <TableCell className="font-mono">{s.email}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{fmtTs(s.created)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
