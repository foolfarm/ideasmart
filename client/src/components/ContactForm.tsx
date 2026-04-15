/**
 * ContactForm — form di contatto riutilizzabile
 * Design: Apple-style, sfondo bianco/grigio ghiaccio, palette monocromatica
 * Usato in: /chi-siamo-story, /proofpress-verify
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

interface ContactFormProps {
  origine?: string;
  /** Colore di sfondo del container (default bianco) */
  bgColor?: string;
  /** Colore testo principale (default #0a0a0a) */
  textColor?: string;
  /** Colore bottone submit (default #0a0a0a) */
  accentColor?: string;
  /** Colore testo bottone (default #ffffff) */
  accentTextColor?: string;
}

export default function ContactForm({
  origine = "ProofPress",
  bgColor = "#ffffff",
  textColor = "#0a0a0a",
  accentColor = "#0a0a0a",
  accentTextColor = "#ffffff",
}: ContactFormProps) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    azienda: "",
    ruolo: "",
    messaggio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const sendContact = trpc.contact.send.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => setErrors({ submit: err.message }),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim() || form.nome.trim().length < 2) e.nome = "Inserisci il tuo nome";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email non valida";
    if (!form.messaggio.trim() || form.messaggio.trim().length < 10) e.messaggio = "Messaggio troppo breve (min. 10 caratteri)";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    sendContact.mutate({
      nome: form.nome.trim(),
      email: form.email.trim(),
      azienda: form.azienda.trim() || undefined,
      ruolo: form.ruolo.trim() || undefined,
      messaggio: form.messaggio.trim(),
      origine,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: SF,
    color: textColor,
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: textColor,
    opacity: 0.6,
    marginBottom: 6,
    fontFamily: SF,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#c0392b",
    marginTop: 4,
    fontFamily: SF,
  };

  if (sent) {
    return (
      <div
        style={{
          background: bgColor,
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          padding: "48px 40px",
          textAlign: "center",
          fontFamily: SF,
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: textColor, marginBottom: 8 }}>
          Messaggio inviato.
        </h3>
        <p style={{ fontSize: 15, color: textColor, opacity: 0.6, lineHeight: 1.6 }}>
          Ti risponderemo entro 24 ore lavorative a <strong>{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: bgColor,
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: "40px",
        maxWidth: 560,
        margin: "0 auto",
        fontFamily: SF,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Nome */}
        <div>
          <label style={labelStyle}>Nome *</label>
          <input
            type="text"
            placeholder="Mario Rossi"
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            style={{ ...inputStyle, borderColor: errors.nome ? "#c0392b" : "rgba(0,0,0,0.15)" }}
          />
          {errors.nome && <p style={errorStyle}>{errors.nome}</p>}
        </div>
        {/* Email */}
        <div>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            placeholder="mario@azienda.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ ...inputStyle, borderColor: errors.email ? "#c0392b" : "rgba(0,0,0,0.15)" }}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Azienda */}
        <div>
          <label style={labelStyle}>Azienda</label>
          <input
            type="text"
            placeholder="Acme S.r.l."
            value={form.azienda}
            onChange={e => setForm(f => ({ ...f, azienda: e.target.value }))}
            style={inputStyle}
          />
        </div>
        {/* Ruolo */}
        <div>
          <label style={labelStyle}>Ruolo</label>
          <input
            type="text"
            placeholder="CEO, Editor, CTO…"
            value={form.ruolo}
            onChange={e => setForm(f => ({ ...f, ruolo: e.target.value }))}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Messaggio */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Messaggio *</label>
        <textarea
          rows={5}
          placeholder="Raccontaci il tuo progetto o la tua richiesta…"
          value={form.messaggio}
          onChange={e => setForm(f => ({ ...f, messaggio: e.target.value }))}
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: 120,
            borderColor: errors.messaggio ? "#c0392b" : "rgba(0,0,0,0.15)",
          }}
        />
        {errors.messaggio && <p style={errorStyle}>{errors.messaggio}</p>}
      </div>

      {errors.submit && (
        <p style={{ ...errorStyle, marginBottom: 16, textAlign: "center" }}>{errors.submit}</p>
      )}

      <button
        type="submit"
        disabled={sendContact.isPending}
        style={{
          width: "100%",
          padding: "14px 24px",
          background: sendContact.isPending ? "rgba(0,0,0,0.4)" : accentColor,
          color: accentTextColor,
          border: "none",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 700,
          fontFamily: SF,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: sendContact.isPending ? "not-allowed" : "pointer",
          transition: "opacity 0.15s",
        }}
      >
        {sendContact.isPending ? "Invio in corso…" : "Invia richiesta →"}
      </button>

      <p style={{ fontSize: 11, color: textColor, opacity: 0.4, textAlign: "center", marginTop: 14, fontFamily: SF }}>
        I tuoi dati non verranno condivisi con terze parti. Risposta entro 24h lavorative.
      </p>
    </form>
  );
}
