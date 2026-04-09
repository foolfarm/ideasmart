/**
 * ChannelPage — Layout editoriale magazine per tutti i canali IdeaSmart
 * Stile: giornale carta (#faf8f3), inchiostro (#1a1a1a), layout magazine con immagini
 * Hero card per il primo articolo + card con thumbnail per gli altri
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SectionNav from "@/components/SectionNav";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import LeftSidebar from "@/components/LeftSidebar";
import { trpc } from "@/lib/trpc";
import { Copy, Check, ExternalLink, ArrowRight, Loader2, ImageOff } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChannelSlug =
  | "start-here"
  | "copy-paste-ai"
  | "automate-with-ai"
  | "make-money-with-ai"
  | "daily-ai-tools"
  | "verified-ai-news"
  | "ai-opportunities";

interface ChannelPageProps {
  slug: ChannelSlug;
  title: string;
  subtitle: string;
  description: string;
  accentColor?: string;
  icon?: React.ReactNode;
  staticContent?: React.ReactNode;
  categories?: string[];
  showPrompt?: boolean;
  showExternalLink?: boolean;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaLink?: string;
  ctaLabel?: string;
}

type ContentItem = {
  id: number;
  title: string;
  subtitle?: string | null;
  body: string;
  category?: string | null;
  actionItem?: string | null;
  promptText?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  imageUrl?: string | null;
  externalUrl?: string | null;
  publishDate: string;
};

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const SF_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
const SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Georgia, serif";

// ─── Fallback images per canale (quando Pexels non ha ancora fornito un'immagine) ─
const CHANNEL_FALLBACK_IMAGES: Record<string, string[]> = {
  "copy-paste-ai": [
    "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "automate-with-ai": [
    "https://images.pexels.com/photos/3913025/pexels-photo-3913025.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "make-money-with-ai": [
    "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "daily-ai-tools": [
    "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "verified-ai-news": [
    "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "ai-opportunities": [
    "https://images.pexels.com/photos/7567460/pexels-photo-7567460.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  "start-here": [
    "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
};

function getFallbackImage(slug: string, index: number): string {
  const pool = CHANNEL_FALLBACK_IMAGES[slug] || CHANNEL_FALLBACK_IMAGES["start-here"];
  return pool[index % pool.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateIT(date: Date): string {
  return date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Divider({ thick = false }: { thick?: boolean }) {
  return <div className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`} />;
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm bg-[#1a1a1a]/8 text-[#1a1a1a]"
      style={{ fontFamily: SF }}
    >
      {label}
    </span>
  );
}

// ─── Prompt Copy Button ───────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
    >
      {copied ? <><Check className="w-3.5 h-3.5" /> Copiato!</> : <><Copy className="w-3.5 h-3.5" /> Copia Prompt</>}
    </button>
  );
}

// ─── Image with fallback ──────────────────────────────────────────────────────
function ArticleImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className={`bg-[#1a1a1a]/5 flex items-center justify-center ${className}`}>
        <ImageOff className="w-8 h-8 text-[#1a1a1a]/20" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={className}
    />
  );
}

// ─── Hero Card (primo articolo) ───────────────────────────────────────────────
function HeroCard({
  item,
  imageUrl,
  showPrompt,
  showExternalLink,
}: {
  item: ContentItem;
  imageUrl: string;
  showPrompt?: boolean;
  showExternalLink?: boolean;
}) {
  return (
    <article className="mb-8">
      {/* Hero Image */}
      <div className="relative overflow-hidden rounded-sm mb-4">
        <ArticleImage
          src={imageUrl}
          alt={item.title}
          className="w-full h-[280px] md:h-[400px] object-cover"
        />
        {item.category && (
          <div className="absolute top-4 left-4">
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 bg-white/95 text-[#1a1a1a] backdrop-blur-sm rounded-sm shadow-sm"
              style={{ fontFamily: SF }}
            >
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        <h2
          className="text-2xl md:text-3xl font-black leading-tight text-[#1a1a1a]"
          style={{ fontFamily: SF_DISPLAY }}
        >
          {item.title}
        </h2>

        {item.subtitle && (
          <p className="text-base text-[#1a1a1a]/60 italic" style={{ fontFamily: SERIF }}>
            {item.subtitle}
          </p>
        )}

        <div
          className="text-[15px] leading-relaxed text-[#1a1a1a]/80 whitespace-pre-line"
          style={{ fontFamily: SERIF }}
        >
          {item.body}
        </div>

        {/* Prompt */}
        {showPrompt && item.promptText && (
          <div className="mt-2 bg-[#1a1a1a] text-white rounded-md p-4">
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2 font-bold" style={{ fontFamily: SF }}>
              PROMPT PRONTO
            </p>
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-white/90">
              {item.promptText}
            </pre>
            <div className="mt-3 flex justify-end">
              <CopyButton text={item.promptText} />
            </div>
          </div>
        )}

        {/* Action Item */}
        {item.actionItem && (
          <div className="mt-2 bg-[#f0f7f3] border-l-4 border-[#1a4a2e] rounded-r-md p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#1a4a2e]/70 mb-1 font-bold" style={{ fontFamily: SF }}>
              COSA FARE ORA
            </p>
            <p className="text-sm leading-relaxed text-[#1a4a2e]" style={{ fontFamily: SERIF }}>
              {item.actionItem}
            </p>
          </div>
        )}

        {/* External Link */}
        {showExternalLink && item.externalUrl && (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] hover:underline mt-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Vai al sito
          </a>
        )}

        {item.sourceName && (
          <p className="text-[10px] text-[#1a1a1a]/35 mt-1" style={{ fontFamily: SF }}>
            Fonte: {item.sourceName}
          </p>
        )}
      </div>
    </article>
  );
}

// ─── Content Card con thumbnail laterale ──────────────────────────────────────
function ContentCard({
  item,
  imageUrl,
  showPrompt,
  showExternalLink,
  isExpanded,
  onToggle,
}: {
  item: ContentItem;
  imageUrl: string;
  showPrompt?: boolean;
  showExternalLink?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="py-5">
      {/* Card layout: immagine a sinistra + contenuto a destra */}
      <div className="flex gap-4 cursor-pointer" onClick={onToggle}>
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-[120px] h-[90px] md:w-[180px] md:h-[120px] overflow-hidden rounded-sm">
          <ArticleImage
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Text preview */}
        <div className="flex-1 min-w-0">
          {item.category && <CategoryBadge label={item.category} />}
          <h3
            className="text-base md:text-lg font-bold leading-snug text-[#1a1a1a] mt-1 line-clamp-2 hover:underline"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {item.title}
          </h3>
          {!isExpanded && (
            <p
              className="text-sm text-[#1a1a1a]/55 mt-1 line-clamp-2 hidden md:block"
              style={{ fontFamily: SERIF }}
            >
              {item.body.slice(0, 150)}...
            </p>
          )}
          {item.sourceName && (
            <p className="text-[10px] text-[#1a1a1a]/30 mt-1.5" style={{ fontFamily: SF }}>
              {item.sourceName}
            </p>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pl-0 md:pl-[196px] flex flex-col gap-3">
          {item.subtitle && (
            <p className="text-sm text-[#1a1a1a]/60 italic" style={{ fontFamily: SERIF }}>
              {item.subtitle}
            </p>
          )}

          <div
            className="text-[15px] leading-relaxed text-[#1a1a1a]/80 whitespace-pre-line"
            style={{ fontFamily: SERIF }}
          >
            {item.body}
          </div>

          {showPrompt && item.promptText && (
            <div className="mt-2 bg-[#1a1a1a] text-white rounded-md p-4">
              <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2 font-bold" style={{ fontFamily: SF }}>
                PROMPT PRONTO
              </p>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-white/90">
                {item.promptText}
              </pre>
              <div className="mt-3 flex justify-end">
                <CopyButton text={item.promptText} />
              </div>
            </div>
          )}

          {item.actionItem && (
            <div className="mt-2 bg-[#f0f7f3] border-l-4 border-[#1a4a2e] rounded-r-md p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#1a4a2e]/70 mb-1 font-bold" style={{ fontFamily: SF }}>
                COSA FARE ORA
              </p>
              <p className="text-sm leading-relaxed text-[#1a4a2e]" style={{ fontFamily: SERIF }}>
                {item.actionItem}
              </p>
            </div>
          )}

          {showExternalLink && item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] hover:underline mt-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Vai al sito
            </a>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChannelPage({
  slug,
  title,
  subtitle,
  description,
  icon,
  staticContent,
  categories,
  showPrompt = false,
  showExternalLink = false,
  ctaTitle,
  ctaDescription,
  ctaLink,
  ctaLabel,
}: ChannelPageProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const today = new Date();

  const { data: items, isLoading } = trpc.channels.getRecent.useQuery(
    { channel: slug, limit: 30 },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items;
  }, [items]);

  // Assegna immagini: usa imageUrl dal DB oppure fallback
  const getImageForItem = (item: ContentItem, index: number): string => {
    if (item.imageUrl) return item.imageUrl;
    return getFallbackImage(slug, index);
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f3] text-[#1a1a1a]">
      <SEOHead title={`${title} — Proof Press`} description={description} />
      <LeftSidebar />
      <div className="flex-1 min-w-0">
      <div className="max-w-[1200px] mx-auto px-4">
        <SharedPageHeader />
        <div className="sticky top-0 z-50 border-b border-[#1a1a1a]/15" style={{ background: "#faf8f3" }}>
          <SectionNav />
        </div>

        {/* ── Section Header ──────────────────────────────────────────── */}
        <div className="mt-6 mb-2">
          <Divider thick />
          <div className="py-4 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {icon}
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: SF_DISPLAY }}>
                  {title}
                </h1>
              </div>
              <p className="text-sm text-[#1a1a1a]/60" style={{ fontFamily: SERIF }}>
                {subtitle}
              </p>
            </div>
            <p className="text-xs text-[#1a1a1a]/40 uppercase tracking-widest" style={{ fontFamily: SF }}>
              {formatDateIT(today)}
            </p>
          </div>
          <Divider />
        </div>

        {/* ── Static Content (Start Here) ─────────────────────────────── */}
        {staticContent && <div className="py-6">{staticContent}</div>}

        {/* ── Banner Promo Collezione Prompt ──────────────────────────── */}
        {!staticContent && (
          <a
            href="https://ideasmart.forum/"
            className="block my-4 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] hover:-translate-y-0.5 group"
            style={{ textDecoration: "none" }}
          >
            <div className="flex flex-col md:flex-row items-stretch rounded-lg overflow-hidden" style={{ background: "#f0ede6", border: "1px solid rgba(26,26,26,0.08)" }}>
              <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                <p className="text-[16px] md:text-[20px] font-black leading-tight mb-2"
                  style={{ color: "#1a1a1a", fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif", letterSpacing: "-0.02em" }}>
                  La collezione Proof Press di prompt da usare davvero nel lavoro quotidiano.
                </p>
                <p className="text-[11px] md:text-[12px] leading-relaxed mb-3"
                  style={{ color: "rgba(26,26,26,0.55)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Un funnel semplice e concreto: arrivi dalla newsletter, acquisti a <strong style={{ color: "#1a1a1a" }}>39 €</strong> e ottieni accesso alla libreria ricercabile con il PDF completo incluso.
                </p>
                <span className="inline-block text-center text-[10px] font-bold uppercase tracking-wider py-2 px-6 rounded group-hover:opacity-90 transition-opacity self-start"
                  style={{ background: "#e74c3c", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}>
                  Scopri la collezione →
                </span>
              </div>
            </div>
          </a>
        )}

        {/* Sottosezioni rimosse — tutti i contenuti in una sola lista */}

        {/* ── Content List — Magazine Layout ──────────────────────────── */}
        {!staticContent && (
          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-[#1a1a1a]/30" />
                <span className="ml-2 text-sm text-[#1a1a1a]/40">Caricamento contenuti...</span>
              </div>
            ) : filteredItems.length > 0 ? (
              <div>
                {/* Hero: primo articolo grande */}
                <HeroCard
                  item={filteredItems[0]}
                  imageUrl={getImageForItem(filteredItems[0], 0)}
                  showPrompt={showPrompt}
                  showExternalLink={showExternalLink}
                />

                <Divider />

                {/* Griglia 2 colonne per articoli 2-3 */}
                {filteredItems.length > 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                      {filteredItems.slice(1, 3).map((item, idx) => {
                        const imgUrl = getImageForItem(item, idx + 1);
                        return (
                          <article key={item.id} className="group cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                            <div className="overflow-hidden rounded-sm mb-3">
                              <ArticleImage
                                src={imgUrl}
                                alt={item.title}
                                className="w-full h-[180px] object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            {item.category && <CategoryBadge label={item.category} />}
                            <h3
                              className="text-lg font-bold leading-snug text-[#1a1a1a] mt-1.5 group-hover:underline"
                              style={{ fontFamily: SF_DISPLAY }}
                            >
                              {item.title}
                            </h3>
                            <p className="text-sm text-[#1a1a1a]/55 mt-1 line-clamp-2" style={{ fontFamily: SERIF }}>
                              {item.body.slice(0, 120)}...
                            </p>

                            {/* Expanded */}
                            {expandedId === item.id && (
                              <div className="mt-3 flex flex-col gap-3">
                                <div className="text-[15px] leading-relaxed text-[#1a1a1a]/80 whitespace-pre-line" style={{ fontFamily: SERIF }}>
                                  {item.body}
                                </div>
                                {showPrompt && item.promptText && (
                                  <div className="bg-[#1a1a1a] text-white rounded-md p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-white/50 mb-2 font-bold" style={{ fontFamily: SF }}>PROMPT PRONTO</p>
                                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-white/90">{item.promptText}</pre>
                                    <div className="mt-3 flex justify-end"><CopyButton text={item.promptText} /></div>
                                  </div>
                                )}
                                {item.actionItem && (
                                  <div className="bg-[#f0f7f3] border-l-4 border-[#1a4a2e] rounded-r-md p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-[#1a4a2e]/70 mb-1 font-bold" style={{ fontFamily: SF }}>COSA FARE ORA</p>
                                    <p className="text-sm leading-relaxed text-[#1a4a2e]" style={{ fontFamily: SERIF }}>{item.actionItem}</p>
                                  </div>
                                )}
                                {showExternalLink && item.externalUrl && (
                                  <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] hover:underline">
                                    <ExternalLink className="w-3.5 h-3.5" /> Vai al sito
                                  </a>
                                )}
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    {filteredItems.length > 3 && <Divider />}
                  </>
                )}

                {/* Lista con thumbnail per il resto + banner Amazon inline */}
                {filteredItems.length > 3 && (
                  <div className="divide-y divide-[#1a1a1a]/10">
                    {filteredItems.slice(3).map((item, idx) => (
                      <div key={item.id}>
                        <ContentCard
                          item={item}
                          imageUrl={getImageForItem(item, idx + 3)}
                          showPrompt={showPrompt}
                          showExternalLink={showExternalLink}
                          isExpanded={expandedId === item.id}
                          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        />
                        {/* Banner Amazon inline dopo il 3° articolo della lista (posizione 6 totale) */}
                        {idx === 2 && (
                          <div className="py-5 border-t border-[#1a1a1a]/10">
                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-white border border-[#1a1a1a]/8 hover:shadow-lg transition-shadow duration-300">
                              <a
                                href="https://amzn.to/4s8n0wI"
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                className="flex items-center gap-3 group flex-1 min-w-0"
                              >
                                <img
                                  src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/amazon_cambridge_audio_p100_fe7baf21.webp"
                                  alt="Cambridge Audio P100 SE"
                                  className="w-[70px] h-[70px] object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="min-w-0">
                                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#e63946] font-bold">Consigliato</span>
                                  <p className="text-sm font-bold text-[#1a1a1a] leading-tight">Cambridge Audio P100 SE</p>
                                  <p className="text-[10px] text-[#1a1a1a]/50 mt-0.5">Cuffie wireless premium — Amazon.it</p>
                                </div>
                              </a>
                              <div className="hidden sm:block w-px h-12 bg-[#1a1a1a]/10" />
                              <a
                                href="https://amzn.to/3PYgBXA"
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                className="flex items-center gap-3 group flex-1 min-w-0"
                              >
                                <img
                                  src="https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/amazon_plaud_notepin_03f935aa.webp"
                                  alt="Plaud NotePin S"
                                  className="w-[70px] h-[70px] object-contain flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="min-w-0">
                                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#e63946] font-bold">Consigliato</span>
                                  <p className="text-sm font-bold text-[#1a1a1a] leading-tight">Plaud NotePin S</p>
                                  <p className="text-[10px] text-[#1a1a1a]/50 mt-0.5">AI Voice Recorder — Amazon.it</p>
                                </div>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg font-semibold text-[#1a1a1a]/50">Contenuti in arrivo</p>
                <p className="text-sm text-[#1a1a1a]/35 mt-2">
                  I contenuti di questo canale vengono aggiornati quotidianamente.<br />
                  Iscriviti alla newsletter per non perdere nulla.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── CTA Section ─────────────────────────────────────────────── */}
        {ctaTitle && (
          <>
            <Divider />
            <div className="py-8 text-center">
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: SF_DISPLAY }}>
                {ctaTitle}
              </h3>
              {ctaDescription && (
                <p className="text-sm text-[#1a1a1a]/60 mb-4 max-w-lg mx-auto">{ctaDescription}</p>
              )}
              {ctaLink && ctaLabel && (
                <a
                  href={ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white font-semibold rounded-md hover:bg-[#333] transition-colors"
                >
                  {ctaLabel} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </>
        )}

        {/* ── Newsletter ──────────────────────────────────────────────── */}
        <Divider />
        <div className="py-8">
          <NewsletterSubscribeForm defaultChannel="ai" accentColor="#1a1a1a" />
        </div>

        <SharedPageFooter />
      </div>
      </div>
    </div>
  );
}
