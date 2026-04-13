/**
 * AdminLeads.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Pagina admin per visualizzare e gestire i lead dai form /offerta
 * Funzionalità:
 * - Tabella leads con filtri per source e status
 * - Cambio stato lead (new → contacted → closed)
 * - Export CSV
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import AdminHeader from "@/components/AdminHeader";

const INK = "#0f0f0f";
const PAPER = "#ffffff";
const ACCENT = "#ff5500";

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  creator:  { label: "Creator & Giornalisti", color: "#7c3aed" },
  editori:  { label: "Testate & Editori",     color: "#0077b5" },
  aziende:  { label: "Aziende & Corporate",   color: "#d97706" },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: "Nuovo",      color: "#dc2626", bg: "#fee2e2" },
  contacted: { label: "Contattato", color: "#d97706", bg: "#fef3c7" },
  closed:    { label: "Chiuso",     color: "#16a34a", bg: "#dcfce7" },
};

function formatDateIT(d: Date | string | null): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportToCSV(leads: any[]) {
  const headers = ["ID", "Data", "Fonte", "Nome", "Email", "Ruolo", "Azienda/Testata", "Messaggio", "Stato"];
  const rows = leads.map(l => [
    l.id,
    formatDateIT(l.createdAt),
    SOURCE_LABELS[l.source]?.label ?? l.source,
    l.name,
    l.email,
    l.role,
    l.org ?? "",
    (l.message ?? "").replace(/\n/g, " ").replace(/,/g, ";"),
    STATUS_LABELS[l.status]?.label ?? l.status,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `proofpress-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminLeads() {
  const { user, loading } = useAuth();
  const [filterSource, setFilterSource] = useState<"creator" | "editori" | "aziende" | "">("");
  const [filterStatus, setFilterStatus] = useState<"new" | "contacted" | "closed" | "">("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const leadsQuery = trpc.offerta.getLeads.useQuery(
    {
      source: filterSource || undefined,
      status: filterStatus || undefined,
      limit: 200,
      offset: 0,
    },
    {
      enabled: user?.role === "admin",
      staleTime: 30_000,
    }
  );

  const updateStatus = trpc.offerta.updateLeadStatus.useMutation({
    onSuccess: () => {
      leadsQuery.refetch();
      toast.success("Stato aggiornato");
    },
    onError: (err) => toast.error("Errore: " + err.message),
  });

  const leads = leadsQuery.data?.leads ?? [];
  const total = leadsQuery.data?.total ?? 0;

  // Conteggi per badge
  const counts = useMemo(() => {
    const all = leads;
    return {
      new: all.filter(l => l.status === "new").length,
      contacted: all.filter(l => l.status === "contacted").length,
      closed: all.filter(l => l.status === "closed").length,
    };
  }, [leads]);

  if (loading) {
    return (
      <div style={{ background: PAPER, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: INK + "60", fontFamily: "system-ui, sans-serif" }}>Caricamento...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div style={{ background: PAPER, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#dc2626", fontFamily: "system-ui, sans-serif", fontWeight: 700 }}>Accesso negato</p>
          <a href="/admin" style={{ color: "#007aff", fontSize: 13 }}>← Torna all'admin</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f5f7", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" }}>
      <AdminHeader title="Leads" />
      {/* Export bar */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px 0", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        <span style={{ color: "#6e6e73", fontSize: 12 }}>{total} lead totali</span>
        <button
          onClick={() => exportToCSV(leads)}
          disabled={leads.length === 0}
          style={{
            padding: "6px 16px",
            background: leads.length === 0 ? "#e5e5ea" : "#1d1d1f",
            color: leads.length === 0 ? "#aeaeb2" : "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: leads.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          ↓ Export CSV
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { key: "new",       label: "Nuovi",       count: counts.new,       color: "#dc2626" },
            { key: "contacted", label: "Contattati",  count: counts.contacted, color: "#d97706" },
            { key: "closed",    label: "Chiusi",      count: counts.closed,    color: "#16a34a" },
          ].map(s => (
            <div
              key={s.key}
              onClick={() => setFilterStatus(filterStatus === s.key ? "" : s.key as any)}
              style={{
                padding: "16px 20px",
                background: filterStatus === s.key ? s.color + "15" : "#fff",
                border: `1px solid ${filterStatus === s.key ? s.color : "#e8e8e8"}`,
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: s.color }}>{s.count}</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtri */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", alignSelf: "center", marginRight: 4 }}>Fonte:</span>
          {["", "creator", "editori", "aziende"].map(s => (
            <button
              key={s}
              onClick={() => setFilterSource(s as any)}
              style={{
                padding: "4px 12px",
                background: filterSource === s ? INK : "transparent",
                color: filterSource === s ? "#fff" : INK + "80",
                border: `1px solid ${filterSource === s ? INK : "#ddd"}`,
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {s === "" ? "Tutti" : SOURCE_LABELS[s]?.label ?? s}
            </button>
          ))}
        </div>

        {/* Tabella */}
        {leadsQuery.isLoading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <p style={{ color: INK + "60", fontSize: 14 }}>Caricamento lead...</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", border: "1px dashed #ddd", borderRadius: 8 }}>
            <p style={{ color: INK + "40", fontSize: 14 }}>Nessun lead trovato</p>
            {(filterSource || filterStatus) && (
              <button
                onClick={() => { setFilterSource(""); setFilterStatus(""); }}
                style={{ marginTop: 8, color: ACCENT, fontSize: 12, background: "none", border: "none", cursor: "pointer" }}
              >
                Rimuovi filtri
              </button>
            )}
          </div>
        ) : (
          <div style={{ border: "1px solid #e8e8e8", borderRadius: 6, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: INK }}>
                  {["Data", "Fonte", "Nome", "Email", "Ruolo / Azienda", "Stato", "Azioni"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => {
                  const src = SOURCE_LABELS[lead.source] ?? { label: lead.source, color: "#666" };
                  const st = STATUS_LABELS[lead.status] ?? { label: lead.status, color: "#666", bg: "#f5f5f5" };
                  const isExpanded = expandedId === lead.id;

                  return (
                    <>
                      <tr
                        key={lead.id}
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#fafafa",
                          borderBottom: "1px solid #f0f0f0",
                          cursor: lead.message ? "pointer" : "default",
                        }}
                        onClick={() => lead.message && setExpandedId(isExpanded ? null : lead.id)}
                      >
                        <td style={{ padding: "10px 14px", fontSize: 12, color: INK + "70", whiteSpace: "nowrap" }}>
                          {formatDateIT(lead.createdAt)}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: src.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {src.label}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: INK }}>
                          {lead.name}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <a href={`mailto:${lead.email}`} style={{ fontSize: 13, color: "#0077b5", textDecoration: "none" }}>
                            {lead.email}
                          </a>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: INK + "80" }}>
                          {lead.role}
                          {lead.org && <span style={{ display: "block", fontSize: 11, color: INK + "50" }}>{lead.org}</span>}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 700,
                            color: st.color,
                            background: st.bg,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {lead.status !== "contacted" && (
                              <button
                                onClick={() => updateStatus.mutate({ id: lead.id, status: "contacted" })}
                                disabled={updateStatus.isPending}
                                style={{ padding: "3px 8px", fontSize: 10, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}
                              >
                                Contattato
                              </button>
                            )}
                            {lead.status !== "closed" && (
                              <button
                                onClick={() => updateStatus.mutate({ id: lead.id, status: "closed" })}
                                disabled={updateStatus.isPending}
                                style={{ padding: "3px 8px", fontSize: 10, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}
                              >
                                Chiudi
                              </button>
                            )}
                            {lead.status !== "new" && (
                              <button
                                onClick={() => updateStatus.mutate({ id: lead.id, status: "new" })}
                                disabled={updateStatus.isPending}
                                style={{ padding: "3px 8px", fontSize: 10, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}
                              >
                                Riapri
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && lead.message && (
                        <tr key={`${lead.id}-msg`} style={{ background: "#ffffff" }}>
                          <td colSpan={7} style={{ padding: "12px 14px 16px 14px", borderBottom: "1px solid #f0f0f0" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999" }}>Messaggio</p>
                            <p style={{ margin: 0, fontSize: 13, color: INK + "cc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{lead.message}</p>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#999" }}>
            {leads.length} lead visualizzati su {total} totali
            {(filterSource || filterStatus) && " (filtro attivo)"}
          </p>
          {leads.length > 0 && (
            <button
              onClick={() => exportToCSV(leads)}
              style={{ fontSize: 11, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
            >
              ↓ Scarica CSV ({leads.length} righe)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
