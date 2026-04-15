/**
 * NewsletterView — Visualizza una newsletter nel browser
 * Route: /newsletter/:id
 * Recupera l'HTML completo della newsletter dal DB tramite tRPC e lo renderizza.
 */
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function NewsletterView() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data, isLoading, error } = trpc.newsletter.getById.useQuery(
    { id },
    { enabled: id > 0 }
  );

  if (!id || isNaN(id)) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "60px 20px",
          color: "#333",
        }}
      >
        <h2>Newsletter non trovata</h2>
        <p>L'ID della newsletter non è valido.</p>
        <a href="https://proofpress.ai" style={{ color: "#00c4ae" }}>
          ← Torna a ProofPress.ai
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "60px 20px",
          color: "#333",
        }}
      >
        <p>Caricamento newsletter in corso…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "60px 20px",
          color: "#333",
        }}
      >
        <h2>Newsletter non disponibile</h2>
        <p>
          {error?.message === "Newsletter non trovata"
            ? "Questa newsletter non esiste o è stata rimossa."
            : "Si è verificato un errore nel caricamento della newsletter."}
        </p>
        <a href="https://proofpress.ai" style={{ color: "#00c4ae" }}>
          ← Torna a ProofPress.ai
        </a>
      </div>
    );
  }

  // Renderizza l'HTML completo della newsletter
  return (
    <div
      dangerouslySetInnerHTML={{ __html: data.htmlContent }}
      style={{ margin: 0, padding: 0 }}
    />
  );
}
