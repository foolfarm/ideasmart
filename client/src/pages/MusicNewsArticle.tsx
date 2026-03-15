import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink } from "lucide-react";

/**
 * MusicNewsArticle — redirect automatico alla fonte originale.
 * Non mostra una pagina intermedia: appena caricato il sourceUrl,
 * reindirizza l'utente direttamente all'articolo originale.
 */
export default function MusicNewsArticle() {
  const [, params] = useRoute("/music/news/:id");
  const newsId = params?.id ? parseInt(params.id, 10) : null;

  const { data: news, isLoading } = trpc.news.getById.useQuery(
    { id: newsId! },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  useEffect(() => {
    if (news?.sourceUrl && news.sourceUrl !== "#") {
      window.location.href = news.sourceUrl;
    }
  }, [news]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#1a1a2e]/50" style={{ fontFamily: "'Space Mono', monospace" }}>
            Apertura articolo…
          </p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Notizia non trovata
          </h1>
          <p className="text-sm text-[#1a1a2e]/60 mb-6"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            La notizia che stai cercando non esiste o è stata rimossa.
          </p>
          <Link href="/music" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#7c3aed", fontFamily: "'Space Mono', monospace" }}>
            <ArrowLeft className="w-4 h-4" />
            Torna a ITsMusic
          </Link>
        </div>
      </div>
    );
  }

  const sourceUrl = news.sourceUrl && news.sourceUrl !== "#" ? news.sourceUrl : null;

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-[#1a1a2e] mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {news.title}
        </h2>
        <p className="text-sm text-[#1a1a2e]/60 mb-6"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Reindirizzamento all'articolo originale…
        </p>
        {sourceUrl ? (
          <a href={sourceUrl}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#7c3aed", fontFamily: "'Space Mono', monospace" }}>
            <ExternalLink className="w-4 h-4" />
            Apri articolo su {news.sourceName || "fonte originale"}
          </a>
        ) : (
          <Link href="/music" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#7c3aed", fontFamily: "'Space Mono', monospace" }}>
            <ArrowLeft className="w-4 h-4" />
            Torna a ITsMusic
          </Link>
        )}
        <div className="mt-4">
          <Link href="/music" className="text-xs text-[#1a1a2e]/40 hover:text-[#1a1a2e]/70 transition-colors"
            style={{ fontFamily: "'Space Mono', monospace" }}>
            ← Torna alla sezione Music
          </Link>
        </div>
      </div>
    </div>
  );
}
