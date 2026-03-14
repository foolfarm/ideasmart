import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import SocialShare from "@/components/SocialShare";
import CommentSection from "@/components/CommentSection";
import Navbar from "@/components/Navbar";
import { ArrowLeft, ExternalLink, Calendar, Tag, Clock } from "lucide-react";

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

export default function NewsArticle() {
  const [, params] = useRoute("/ai/news/:id");
  const newsId = params?.id ? parseInt(params.id, 10) : null;

  const { data: news, isLoading } = trpc.news.getById.useQuery(
    { id: newsId! },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  const { data: related } = trpc.news.getRelated.useQuery(
    { id: newsId!, section: "ai", limit: 4 },
    { enabled: !!newsId && !isNaN(newsId!) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-10 bg-gray-200 rounded w-full mb-3" />
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-8" />
          <div className="h-64 bg-gray-200 rounded-xl mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-4">Notizia non trovata</h1>
          <p className="text-gray-500 mb-8">La notizia che stai cercando non esiste o è stata rimossa.</p>
          <Link href="/ai" className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Torna ad AI4Business
          </Link>
        </div>
      </div>
    );
  }

  const readTime = estimateReadTime(news.summary);
  const articleUrl = typeof window !== "undefined" ? window.location.href : `https://ideasmart.ai/ai/news/${news.id}`;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${news.title} — AI4Business News`}
        description={news.summary}
        ogImage={news.imageUrl ?? undefined}
        ogType="article"
        canonical={`https://ideasmart.ai/ai/news/${news.id}`}
        ogSiteName="AI4Business News"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": news.title,
          "description": news.summary,
          "image": news.imageUrl ?? undefined,
          "datePublished": news.publishedAt,
          "publisher": {
            "@type": "NewsMediaOrganization",
            "name": "AI4Business News",
            "url": "https://ideasmart.ai/ai"
          },
          "author": {
            "@type": "Organization",
            "name": "AI4Business News"
          }
        }}
      />

      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-teal-600 transition-colors">IDEASMART</Link>
            <span>/</span>
            <Link href="/ai" className="hover:text-teal-600 transition-colors">AI4Business</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate max-w-xs">{news.title}</span>
          </nav>
        </div>
      </div>

      {/* Articolo */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: "#e6faf8", color: "#00b4a0" }}
          >
            <Tag className="w-3 h-3" />
            {news.category}
          </span>
          {news.publishedAt && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatDate(news.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {readTime} min di lettura
          </span>
        </div>

        {/* Titolo */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
          {news.title}
        </h1>

        {/* Immagine hero */}
        {news.imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover"
            />
          </div>
        )}

        {/* Sommario espanso */}
        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-xl text-gray-700 leading-relaxed font-medium border-l-4 border-teal-400 pl-5 mb-6">
            {news.summary}
          </p>

          {/* Contenuto espanso generato */}
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Questa notizia riguarda un'evoluzione significativa nel settore dell'intelligenza artificiale applicata al business.
              Il tema trattato — <strong>{news.category}</strong> — è tra i più rilevanti per i professionisti e le aziende
              che operano nell'ecosistema tecnologico italiano ed europeo.
            </p>
            <p>
              L'analisi di AI4Business News si concentra sulle implicazioni pratiche per le organizzazioni:
              quali opportunità emergono, quali rischi vanno considerati e come i decision maker possono
              posizionarsi al meglio rispetto a questi sviluppi.
            </p>
            <p>
              Per approfondire questa notizia con i dati originali e le dichiarazioni dirette delle fonti,
              consulta l'articolo completo tramite il link alla fonte qui sotto.
            </p>
          </div>
        </div>

        {/* Fonte */}
        {news.sourceName && news.sourceUrl && news.sourceUrl !== "#" && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Fonte originale</p>
            <a
              href={news.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-600 font-bold text-lg hover:text-teal-700 transition-colors"
            >
              {news.sourceName}
              <ExternalLink className="w-5 h-5" />
            </a>
            <p className="text-sm text-gray-400 mt-1 break-all">{news.sourceUrl}</p>
          </div>
        )}

        {/* Social Share */}
        <div className="mb-10">
          <SocialShare
            title={news.title}
            url={articleUrl}
          />
        </div>

        {/* Notizie correlate */}
        {related && related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Notizie correlate
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/ai/news/${item.id}`}
                  className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-teal-300"
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
                      style={{ background: "#e6faf8", color: "#00b4a0" }}
                    >
                      {item.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-teal-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.summary}</p>
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
          section="ai"
        />

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link
            href="/ai"
            className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna ad AI4Business News
          </Link>
        </div>
      </article>
    </div>
  );
}
