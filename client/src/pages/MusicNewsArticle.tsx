import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import SocialShare from "@/components/SocialShare";
import CommentSection from "@/components/CommentSection";
import Navbar from "@/components/Navbar";
import { ArrowLeft, ExternalLink, Calendar, Tag, Clock } from "lucide-react";
import ReportSourceButton from "@/components/ReportSourceButton";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function MusicNewsArticle() {
  const [, params] = useRoute("/music/news/:id");
  const newsId = params?.id ? parseInt(params.id, 10) : null;

  const { data: news, isLoading } = trpc.news.getById.useQuery(
    { id: newsId! },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  const { data: related } = trpc.news.getRelated.useQuery(
    { id: newsId!, section: "music", limit: 4 },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/4 mb-4" />
          <div className="h-10 bg-white/10 rounded w-full mb-3" />
          <div className="h-10 bg-white/10 rounded w-3/4 mb-8" />
          <div className="h-64 bg-white/10 rounded-xl mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-black text-white mb-4">Notizia non trovata</h1>
          <p className="text-white/50 mb-8">La notizia che stai cercando non esiste o è stata rimossa.</p>
          <Link href="/music" className="inline-flex items-center gap-2 text-purple-400 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Torna a ITsMusic
          </Link>
        </div>
      </div>
    );
  }

  const readTime = estimateReadTime(news.summary);
  const articleUrl = typeof window !== "undefined" ? window.location.href : `https://ideasmart.ai/music/news/${news.id}`;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <SEOHead
        title={`${news.title} — ITsMusic`}
        description={news.summary}
        ogImage={news.imageUrl ?? undefined}
        ogType="article"
        canonical={`https://ideasmart.ai/music/news/${news.id}`}
        ogSiteName="ITsMusic"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": news.title,
          "description": news.summary,
          "image": news.imageUrl ?? undefined,
          "datePublished": news.publishedAt,
          "publisher": {
            "@type": "NewsMediaOrganization",
            "name": "ITsMusic",
            "url": "https://ideasmart.ai/music"
          },
          "author": {
            "@type": "Organization",
            "name": "ITsMusic"
          }
        }}
      />

      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-[#161b22] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-white/40">
            <Link href="/" className="hover:text-purple-400 transition-colors">IDEASMART</Link>
            <span>/</span>
            <Link href="/music" className="hover:text-purple-400 transition-colors">ITsMusic</Link>
            <span>/</span>
            <span className="text-white/70 font-medium truncate max-w-xs">{news.title}</span>
          </nav>
        </div>
      </div>

      {/* Articolo */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: "rgba(147,51,234,0.15)", color: "#c084fc" }}
          >
            <Tag className="w-3 h-3" />
            {news.category}
          </span>
          {news.publishedAt && (
            <span className="flex items-center gap-1.5 text-sm text-white/50">
              <Calendar className="w-4 h-4" />
              {formatDate(news.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-white/50">
            <Clock className="w-4 h-4" />
            {readTime} min di lettura
          </span>
        </div>

        {/* Titolo */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
          {news.title}
        </h1>

        {/* Immagine hero */}
        {news.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover"
            />
          </div>
        )}

        {/* Sommario espanso */}
        <div className="mb-8">
          <p className="text-xl text-white/80 leading-relaxed font-medium border-l-4 border-purple-500 pl-5 mb-6">
            {news.summary}
          </p>

          <div className="space-y-4 text-white/70 text-lg leading-relaxed">
            <p>
              Questa notizia rappresenta un momento significativo nel panorama musicale contemporaneo.
              Il tema trattato — <strong className="text-white">{news.category}</strong> — è al centro
              dell'attenzione di artisti, label e appassionati di musica rock, indie e AI music in Italia e nel mondo.
            </p>
            <p>
              L'analisi di ITsMusic si concentra sulle implicazioni per l'industria musicale:
              come questi sviluppi influenzano la produzione, la distribuzione e il consumo di musica,
              e quali nuove opportunità emergono per artisti emergenti e label indipendenti.
            </p>
            <p>
              Per approfondire questa notizia con i dati originali e le dichiarazioni dirette delle fonti,
              consulta l'articolo completo tramite il link alla fonte qui sotto.
            </p>
          </div>
        </div>

        {/* Fonte */}
        {news.sourceName && news.sourceUrl && news.sourceUrl !== "#" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Fonte originale</p>
            <a
              href={news.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 font-bold text-lg hover:text-purple-300 transition-colors"
            >
              {news.sourceName}
              <ExternalLink className="w-5 h-5" />
            </a>
            <p className="text-sm text-white/30 mt-1 break-all">{news.sourceUrl}</p>
            <div className="mt-3 pt-3 border-t border-white/8">
              <ReportSourceButton
                section="music"
                articleType="news"
                articleId={news.id}
                sourceUrl={news.sourceUrl ?? undefined}
                accentColor="#8b5cf6"
              />
            </div>
          </div>
        )}

        {/* Social Share */}
        <div className="mb-10">
          <SocialShare
            title={news.title}
            url={articleUrl}
            accentColor="purple"
          />
        </div>

        {/* Notizie correlate */}
        {related && related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-white mb-6 pb-3 border-b border-white/10">
              Notizie correlate
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/music/news/${item.id}`}
                  className="group block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:shadow-lg hover:border-purple-500/40 transition-all"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ background: "rgba(147,51,234,0.15)", color: "#c084fc" }}
                    >
                      {item.category}
                    </span>
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-purple-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/50 mt-1 line-clamp-2">{item.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Commenti */}
        <CommentSection
          articleType="news"
          articleId={news.id}
          section="music"
        />

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <Link
            href="/music"
            className="inline-flex items-center gap-2 text-purple-400 font-semibold hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna a ITsMusic
          </Link>
        </div>
      </article>
    </div>
  );
}
