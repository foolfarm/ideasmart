/**
 * SaveArticleButton — pulsante toggle "Salva / Salvato"
 * Usato nelle pagine articolo per aggiungere/rimuovere dalla lista di lettura.
 * Se l'utente non è loggato, reindirizza a /registrati.
 */
import { trpc } from "@/lib/trpc";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

type ContentType = "news" | "editorial" | "reportage" | "analysis" | "startup" | "research";

interface SaveArticleButtonProps {
  contentType: ContentType;
  contentId: number;
  title: string;
  section?: string;
}

export default function SaveArticleButton({ contentType, contentId, title, section }: SaveArticleButtonProps) {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useSiteAuth();

  const { data, refetch } = trpc.account.isSaved.useQuery(
    { contentType, contentId },
    { enabled: isAuthenticated, staleTime: 60_000, refetchOnWindowFocus: false }
  );

  const isSaved = data?.saved ?? false;

  const saveMutation = trpc.account.saveArticle.useMutation({
    onSuccess: (result) => {
      refetch();
      toast.success(result.saved ? "Articolo salvato nella tua lista di lettura." : "Articolo rimosso dalla lista.");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate(`/registrati`);
      return;
    }
    saveMutation.mutate({ contentType, contentId, title, section });
  };

  return (
    <button
      onClick={handleClick}
      disabled={saveMutation.isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all disabled:opacity-50"
      style={{
        fontFamily: SF,
        background: isSaved ? "#1a1a1a" : "transparent",
        color: isSaved ? "#ffffff" : "#1a1a1a",
        borderColor: isSaved ? "#1a1a1a" : "rgba(26,26,26,0.25)",
      }}
      title={isSaved ? "Rimuovi dalla lista di lettura" : "Salva nella lista di lettura"}
    >
      <span style={{ fontSize: "12px" }}>{isSaved ? "★" : "☆"}</span>
      {isSaved ? "Salvato" : "Salva"}
    </button>
  );
}
