/**
 * ReportSourceButton — IDEASMART
 * Componente per segnalare una fonte errata su un articolo.
 * Appare come piccolo link discreto sotto la fonte di ogni notizia.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReportSourceButtonProps {
  section: "ai" | "music" | "startup";
  articleType: "news" | "editorial" | "startup" | "reportage" | "analysis";
  articleId: number;
  sourceUrl?: string;
  /** Colore accent della sezione (es. "#00e5c8") */
  accentColor?: string;
}

const REASON_LABELS: Record<string, string> = {
  not_found: "Pagina non trovata (404)",
  wrong_content: "Contenuto non pertinente",
  broken_link: "Link non funzionante",
  spam: "Spam o contenuto inappropriato",
  other: "Altro",
};

export default function ReportSourceButton({
  section,
  articleType,
  articleId,
  sourceUrl,
  accentColor = "#00e5c8",
}: ReportSourceButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<"not_found" | "wrong_content" | "broken_link" | "spam" | "other">("not_found");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reportMutation = trpc.adminTools.reportSource.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setOpen(false);
      toast.success("Segnalazione inviata. Grazie!");
    },
    onError: (err) => {
      toast.error("Errore nell'invio: " + err.message);
    },
  });

  if (submitted) {
    return (
      <span className="text-xs" style={{ color: accentColor, opacity: 0.7 }}>
        ✓ Segnalato
      </span>
    );
  }

  return (
    <span className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs transition-colors"
        style={{ color: "rgba(255,255,255,0.25)" }}
        onMouseEnter={e => (e.currentTarget.style.color = accentColor)}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
        title="Segnala fonte errata"
        aria-label="Segnala fonte errata"
      >
        ⚑ Segnala fonte
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Popup */}
          <div
            className="absolute bottom-full left-0 mb-2 z-50 rounded-xl border p-4 shadow-xl"
            style={{
              background: "#0d1528",
              borderColor: "rgba(255,255,255,0.12)",
              minWidth: "280px",
              maxWidth: "320px",
            }}
          >
            <p
              className="text-xs font-bold mb-3 uppercase tracking-wider"
              style={{ color: accentColor, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Segnala fonte errata
            </p>

            {/* Motivo */}
            <div className="space-y-1.5 mb-3">
              {Object.entries(REASON_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name={`reason-${articleId}`}
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value as typeof reason)}
                    className="accent-current"
                    style={{ accentColor }}
                  />
                  <span
                    className="text-xs transition-colors"
                    style={{ color: reason === value ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>

            {/* Nota opzionale */}
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Nota opzionale (max 200 caratteri)..."
              maxLength={200}
              rows={2}
              className="w-full text-xs rounded-lg px-3 py-2 mb-3 resize-none outline-none border"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)",
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  reportMutation.mutate({
                    section,
                    articleType,
                    articleId,
                    reportedUrl: sourceUrl,
                    reason,
                    note: note.trim() || undefined,
                  });
                }}
                disabled={reportMutation.isPending}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-opacity disabled:opacity-50"
                style={{ background: accentColor, color: "#0a0f1e" }}
              >
                {reportMutation.isPending ? "Invio..." : "Invia segnalazione"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
              >
                Annulla
              </button>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
