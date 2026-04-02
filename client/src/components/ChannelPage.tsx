/**
 * ChannelPage — Layout editoriale condiviso per tutti i nuovi canali IdeaSmart
 * Stile: giornale carta (#faf8f3), inchiostro (#1a1a1a), layout asimmetrico
 * Ogni contenuto chiude con "Cosa fare ORA" + prompt/azione
 */
import { useState } from "react";
import { Link } from "wouter";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import SectionNav from "@/components/SectionNav";
import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { Copy, Check, ExternalLink, ArrowRight, ChevronDown, Loader2 } from "lucide-react";

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
  /** Contenuto statico per Start Here (non usa DB) */
  staticContent?: React.ReactNode;
  /** Categorie per filtro (es. business, studio, marketing) */
  categories?: string[];
  /** Mostra il prompt text con copy button */
  showPrompt?: boolean;
  /** Mostra il link esterno */
  showExternalLink?: boolean;
  /** CTA in fondo alla pagina */
  ctaTitle?: string;
  ctaDescription?: string;
  ctaLink?: string;
  ctaLabel?: string;
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
  return (
    <div
      className={`w-full ${thick ? "border-t-[3px]" : "border-t"} border-[#1a1a1a]`}
    />
  );
}

function ThinDivider() {
  return <div className="w-full border-t border-[#1a1a1a]/15" />;
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm bg-[#1a1a1a]/8 text-[#1a1a1a]"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
      }}
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
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" /> Copiato!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" /> Copia Prompt
        </>
      )}
    </button>
  );
}

// ─── Content Card ─────────────────────────────────────────────────────────────
function ContentCard({
  item,
  showPrompt,
  showExternalLink,
}: {
  item: {
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
  showPrompt?: boolean;
  showExternalLink?: boolean;
}) {
  return (
    <article className="py-6">
      <div className="flex flex-col gap-3">
        {/* Category */}
        {item.category && <CategoryBadge label={item.category} />}

        {/* Title */}
        <h2
          className="text-xl md:text-2xl font-bold leading-tight text-[#1a1a1a]"
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {item.title}
        </h2>

        {/* Subtitle */}
        {item.subtitle && (
          <p
            className="text-sm text-[#1a1a1a]/60 italic"
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Georgia, serif",
            }}
          >
            {item.subtitle}
          </p>
        )}

        {/* Image */}
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-48 md:h-56 object-cover rounded-sm grayscale-[10%]"
            style={{ border: "1px solid rgba(26,26,26,0.1)" }}
          />
        )}

        {/* Body */}
        <div
          className="text-[15px] leading-relaxed text-[#1a1a1a]/80 whitespace-pre-line"
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
          }}
        >
          {item.body}
        </div>

        {/* Prompt Text (Copy & Paste AI) */}
        {showPrompt && item.promptText && (
          <div className="mt-2 bg-[#1a1a1a] text-white rounded-md p-4 relative">
            <p
              className="text-[10px] uppercase tracking-widest text-white/50 mb-2 font-bold"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
              }}
            >
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
            <p
              className="text-[10px] uppercase tracking-widest text-[#1a4a2e]/70 mb-1 font-bold"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
              }}
            >
              COSA FARE ORA
            </p>
            <p
              className="text-sm leading-relaxed text-[#1a4a2e]"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Georgia, serif",
              }}
            >
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
            <ExternalLink className="w-3.5 h-3.5" />
            Vai al sito
          </a>
        )}

        {/* Source */}
        {item.sourceName && (
          <p
            className="text-[10px] text-[#1a1a1a]/35 mt-1"
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
            }}
          >
            Fonte: {item.sourceName}
          </p>
        )}
      </div>
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const today = new Date();

  // Fetch contenuti recenti per questo canale
  const { data: items, isLoading } = trpc.channels.getRecent.useQuery(
    { channel: slug, limit: 30 },
    { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  // Filtra per categoria se attiva
  const filteredItems = activeCategory
    ? items?.filter((i) => i.category === activeCategory)
    : items;

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#1a1a1a]">
      <SEOHead
        title={`${title} — IDEASMART`}
        description={description}
      />
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
                <h1
                  className="text-3xl md:text-4xl font-black uppercase tracking-tight"
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {title}
                </h1>
              </div>
              <p
                className="text-sm text-[#1a1a1a]/60"
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Georgia, serif",
                }}
              >
                {subtitle}
              </p>
            </div>
            <p
              className="text-xs text-[#1a1a1a]/40 uppercase tracking-widest"
              style={{
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Arial, sans-serif",
              }}
            >
              {formatDateIT(today)}
            </p>
          </div>
          <Divider />
        </div>

        {/* ── Static Content (Start Here) ─────────────────────────────── */}
        {staticContent && <div className="py-6">{staticContent}</div>}

        {/* ── Category Filter ─────────────────────────────────────────── */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 py-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
                !activeCategory
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#1a1a1a]/8 text-[#1a1a1a] hover:bg-[#1a1a1a]/15"
              }`}
            >
              Tutti
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
                  activeCategory === cat
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-[#1a1a1a]/8 text-[#1a1a1a] hover:bg-[#1a1a1a]/15"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Content List ────────────────────────────────────────────── */}
        {!staticContent && (
          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-[#1a1a1a]/30" />
                <span className="ml-2 text-sm text-[#1a1a1a]/40">
                  Caricamento contenuti...
                </span>
              </div>
            ) : filteredItems && filteredItems.length > 0 ? (
              <div className="divide-y divide-[#1a1a1a]/10">
                {filteredItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    showPrompt={showPrompt}
                    showExternalLink={showExternalLink}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg font-semibold text-[#1a1a1a]/50">
                  Contenuti in arrivo
                </p>
                <p className="text-sm text-[#1a1a1a]/35 mt-2">
                  I contenuti di questo canale vengono aggiornati quotidianamente.
                  <br />
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
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
                }}
              >
                {ctaTitle}
              </h3>
              {ctaDescription && (
                <p className="text-sm text-[#1a1a1a]/60 mb-4 max-w-lg mx-auto">
                  {ctaDescription}
                </p>
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
  );
}
