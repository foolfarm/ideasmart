import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";

/**
 * GenericNewsArticle — pagina articolo generica per tutti i canali.
 * Riceve l'id dalla URL /:section/news/:id, carica la notizia dal DB
 * e reindirizza automaticamente alla fonte originale.
 * Questo garantisce traffico interno su Proof Press prima del redirect esterno.
 */
export default function GenericNewsArticle() {
  const [, params] = useRoute("/:section/news/:id");
  const section = params?.section ?? "";
  const newsId = params?.id ? parseInt(params.id, 10) : null;

  const { data: news, isLoading } = trpc.news.getById.useQuery(
    { id: newsId! },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  useEffect(() => {
    if (news?.sourceUrl && news.sourceUrl !== "#") {
      // Piccolo delay per permettere al browser di registrare la visita
      const timer = setTimeout(() => {
        window.location.href = news.sourceUrl!;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [news]);

  // Mappa sezione → label e percorso di ritorno
  const sectionLabels: Record<string, { label: string; path: string }> = {
    ai: { label: "AI NEWS", path: "/ai" },
    startup: { label: "STARTUP NEWS", path: "/startup" },
    health: { label: "Health & Biotech", path: "/health" }
  };

  const sectionInfo = sectionLabels[section] ?? { label: "Proof Press", path: "/" };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0a7ea4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p
            className="text-sm text-[#1a1a1a]/50"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
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
          <h1
            className="text-2xl font-bold text-[#1a1a1a] mb-3"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
          >
            Notizia non trovata
          </h1>
          <p
            className="text-sm text-[#1a1a1a]/60 mb-6"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
          >
            La notizia che stai cercando non esiste o è stata rimossa.
          </p>
          <Link
            href={sectionInfo.path}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "#0a7ea4", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Torna a {sectionInfo.label}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-8 h-8 border-2 border-[#0a7ea4] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p
          className="text-xs uppercase tracking-widest text-[#1a1a1a]/40 mb-3"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {news.category}
        </p>
        <h1
          className="text-xl font-bold text-[#1a1a1a] mb-3 leading-tight"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {news.title}
        </h1>
        <p
          className="text-sm text-[#1a1a1a]/60 mb-6"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif" }}
        >
          Apertura articolo su {news.sourceName ?? "fonte originale"}…
        </p>
        <Link
          href={sectionInfo.path}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
          style={{ color: "#0a7ea4", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Torna a {sectionInfo.label}
        </Link>
      </div>
    </div>
    </RequireAuth>
  );
}
