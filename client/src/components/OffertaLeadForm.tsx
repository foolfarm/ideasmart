import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Source = "creator" | "editori" | "aziende";

interface OffertaLeadFormProps {
  source: Source;
  title?: string;
  subtitle?: string;
}

const sourceConfig: Record<Source, { label: string; rolePlaceholder: string; color: string }> = {
  creator: {
    label: "Creator & Giornalisti",
    rolePlaceholder: "es. Giornalista freelance, Content creator, Blogger...",
    color: "#ff5500",
  },
  editori: {
    label: "Testate & Editori",
    rolePlaceholder: "es. Direttore editoriale, Publisher, Responsabile digitale...",
    color: "#d94f3d",
  },
  aziende: {
    label: "Aziende & Corporate",
    rolePlaceholder: "es. CEO, CMO, Responsabile comunicazione, Innovation Manager...",
    color: "#1a6b8a",
  },
};

export default function OffertaLeadForm({ source, title, subtitle }: OffertaLeadFormProps) {
  const config = sourceConfig[source];
  const [form, setForm] = useState({ name: "", email: "", role: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitLead = trpc.offerta.submitLead.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Inserisci il tuo nome (min. 2 caratteri)";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Inserisci un'email valida";
    if (!form.role.trim() || form.role.trim().length < 2) e.role = "Inserisci il tuo ruolo";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    submitLead.mutate({ ...form, source });
  };

  if (submitted) {
    return (
      <div style={{ background: "#f5f3ef", borderRadius: 12, padding: "48px 32px", textAlign: "center", border: "1px solid rgba(26,26,26,0.08)" }}>
        <div style={{ fontSize: 56, marginBottom: 16, color: config.color }}>✓</div>
        <h3 style={{ color: "#1a1a1a", fontSize: 24, fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          Richiesta inviata!
        </h3>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.7, margin: "0 0 8px" }}>
          Grazie <strong>{form.name}</strong>. Abbiamo ricevuto la tua richiesta per <strong>{config.label}</strong>.
        </p>
        <p style={{ color: "#888", fontSize: 14, margin: 0 }}>
          Ti contatteremo entro 24 ore all'indirizzo <strong>{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f3ef", borderRadius: 12, padding: "40px 32px", border: "1px solid rgba(26,26,26,0.08)" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-block", background: config.color, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 4, marginBottom: 12 }}>
          {config.label}
        </div>
        <h3 style={{ color: "#1a1a1a", fontSize: 22, fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          {title ?? "Richiedi informazioni"}
        </h3>
        <p style={{ color: "#666", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          {subtitle ?? "Compila il form e ti contatteremo entro 24 ore con tutti i dettagli sull'offerta."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Nome */}
          <div>
            <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Nome e cognome <span style={{ color: config.color }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Mario Rossi"
              style={{
                width: "100%", padding: "10px 14px", border: errors.name ? "1.5px solid #e53e3e" : "1.5px solid #d1d5db",
                borderRadius: 6, fontSize: 14, color: "#1a1a1a", background: "#fff", outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errors.name && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Email <span style={{ color: config.color }}>*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="mario@azienda.it"
              style={{
                width: "100%", padding: "10px 14px", border: errors.email ? "1.5px solid #e53e3e" : "1.5px solid #d1d5db",
                borderRadius: 6, fontSize: 14, color: "#1a1a1a", background: "#fff", outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errors.email && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{errors.email}</p>}
          </div>
        </div>

        {/* Ruolo */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Il tuo ruolo <span style={{ color: config.color }}>*</span>
          </label>
          <input
            type="text"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            placeholder={config.rolePlaceholder}
            style={{
              width: "100%", padding: "10px 14px", border: errors.role ? "1.5px solid #e53e3e" : "1.5px solid #d1d5db",
              borderRadius: 6, fontSize: 14, color: "#1a1a1a", background: "#fff", outline: "none",
              boxSizing: "border-box",
            }}
          />
          {errors.role && <p style={{ color: "#e53e3e", fontSize: 12, margin: "4px 0 0" }}>{errors.role}</p>}
        </div>

        {/* Messaggio */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Messaggio <span style={{ color: "#9ca3af", fontWeight: 400 }}>(opzionale)</span>
          </label>
          <textarea
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Raccontaci brevemente il tuo progetto o le tue esigenze..."
            rows={4}
            style={{
              width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db",
              borderRadius: 6, fontSize: 14, color: "#1a1a1a", background: "#fff", outline: "none",
              resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitLead.isPending}
          style={{
            width: "100%", padding: "14px 28px", background: submitLead.isPending ? "#9ca3af" : "#1a1a1a",
            color: "#fff", border: "none", borderRadius: 6, fontSize: 15, fontWeight: 700,
            cursor: submitLead.isPending ? "not-allowed" : "pointer", letterSpacing: "0.02em",
            transition: "background 0.2s",
          }}
        >
          {submitLead.isPending ? "Invio in corso..." : "Invia richiesta →"}
        </button>

        {submitLead.isError && (
          <p style={{ color: "#e53e3e", fontSize: 13, textAlign: "center", marginTop: 12 }}>
            Si è verificato un errore. Riprova o scrivici a info@proofpress.ai
          </p>
        )}

        <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 16, margin: "16px 0 0" }}>
          I tuoi dati sono trattati in conformità alla normativa GDPR. Non li condivideremo con terze parti.
        </p>
      </form>
    </div>
  );
}
