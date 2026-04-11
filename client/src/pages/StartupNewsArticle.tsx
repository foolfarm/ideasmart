import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ExternalLink } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";

/**
 * StartupNewsArticle — redirect automatico alla fonte originale.
 * Non mostra una pagina intermedia: appena caricato il sourceUrl,
 * reindirizza l'utente direttamente all'articolo originale.
 */
export default function StartupNewsArticle() {
  const [, params] = useRoute("/startup/news/:id");
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
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#1a1a1a]/50" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            Apertura articolo…
          </p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
            Notizia non trovata
          </h1>
          <p className="text-sm text-[#1a1a1a]/60 mb-6"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
            La notizia che stai cercando non esiste o è stata rimossa.
          </p>
          <Link href="/startup" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            <ArrowLeft className="w-4 h-4" />
            Torna a STARTUP NEWS
          </Link>
        </div>
      </div>
    );
  }

  const sourceUrl = news.sourceUrl && news.sourceUrl !== "#" ? news.sourceUrl : null;

  return (
    <RequireAuth>
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
          {news.title}
        </h2>
        <p className="text-sm text-[#1a1a1a]/60 mb-6"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}>
          Reindirizzamento all'articolo originale…
        </p>
        {sourceUrl ? (
          <a href={sourceUrl}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            <ExternalLink className="w-4 h-4" />
            Apri articolo su {news.sourceName || "fonte originale"}
          </a>
        ) : (
          <Link href="/startup" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            <ArrowLeft className="w-4 h-4" />
            Torna a STARTUP NEWS
          </Link>
        )}
        <div className="mt-4">
          <Link href="/startup" className="text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 transition-colors"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
            ← Torna alla sezione Startup
          </Link>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
