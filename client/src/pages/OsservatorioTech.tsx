/*
 * Osservatorio Tech — Base Alpha + Research | Coordinato da Andrea Cinelli | Direttore: Adrian Lenice
 * Layout: vera area editoriale magazine
 * Hero display enorme → Featured card oggi → Griglia 3 col editoriali → Grid articoli → LinkedIn feed
 * Palette: bianco #ffffff / nero #0a0a0a / rosso #dc2626
 */
import { useState } from "react";
import { toast } from "sonner";
import { trpc as trpcClient } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import VerifyBadge from "@/components/VerifyBadge";

// ─── Design tokens ────────────────────────────────────────────────────────────
const INK = "#0a0a0a";
const PAPER = "#ffffff";
const RED = "#dc2626";
const LINKEDIN_BLUE = "#0077b5";
const PROFILE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/andrea-cinelli-profile_2084610f.jpeg";
const LINKEDIN_URL = "https://www.linkedin.com/in/andreacinelli/";
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Label({ children, color = RED }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color }}>
      {children}
    </span>
  );
}

function formatDateIT(dateLabel: string): string {
  try {
    const parts = dateLabel.split("-").map(Number);
    let year: number, month: number, day: number;
    if (parts[0] > 31) { [year, month, day] = parts; } else { [day, month, year] = parts; }
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch { return dateLabel; }
}

// ─── Featured Punto del Giorno (oggi) ────────────────────────────────────────
function FeaturedPunto({ item }: {
  item: {
    id: number; dateLabel: string; title: string; subtitle: string | null;
    keyTrend: string | null; section: string | null; imageUrl: string | null; authorNote: string | null; createdAt: Date;
    titleEn?: string | null; subtitleEn?: string | null;
  }
}) {
  const [expanded, setExpanded] = useState(false);
  const { i18n } = useTranslation();
  const isEN = i18n.language === 'en';
  const displayTitle = isEN && item.titleEn ? item.titleEn : item.title;
  const displaySubtitle = isEN && item.subtitleEn ? item.subtitleEn : item.subtitle;
  const fallbackImg = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp";

  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-0" style={{ borderBottom: `1px solid ${INK}15` }}>
      {/* Immagine */}
      <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
        <img
          src={item.imageUrl || fallbackImg}
          alt={displayTitle}
          className="w-full h-full object-cover"
          style={{ minHeight: 320 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.15))" }} />
        <div className="absolute top-4 left-4">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase px-2.5 py-1" style={{ backgroundColor: RED, color: PAPER }}>
            Oggi
          </span>
        </div>
      </div>

      {/* Contenuto */}
      <div className="flex flex-col justify-between p-8 lg:p-10" style={{ backgroundColor: INK }}>
        <div>
          <div className="flex items-center gap-3 mb-4">
            {item.section && (
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: RED }}>
                {item.section}
              </span>
            )}
            <span className="text-[10px]" style={{ color: PAPER + "50", fontFamily: FONT }}>
              {formatDateIT(item.dateLabel)}
            </span>
          </div>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-black leading-[1.1] tracking-tight mb-4"
            style={{ color: PAPER, fontFamily: FONT }}
          >
            {displayTitle}
          </h2>
          {displaySubtitle && (
            <p className="text-base leading-relaxed mb-5" style={{ color: PAPER + "75", fontFamily: FONT }}>
              {displaySubtitle}
            </p>
          )}
          {item.keyTrend && (
            <div className="border-l-2 pl-4 mb-5" style={{ borderColor: RED }}>
              <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: RED }}>Key Trend</p>
              <p className="text-sm leading-relaxed" style={{ color: PAPER + "80", fontFamily: FONT }}>{item.keyTrend}</p>
            </div>
          )}
          {item.authorNote && (
            <>
              {!expanded ? (
                <button
                  onClick={() => setExpanded(true)}
                  className="text-[11px] font-bold tracking-wider uppercase"
                  style={{ color: RED }}
                >
                  Il punto di Andrea ↓
                </button>
              ) : (
                <div>
                  <p className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: RED }}>Il punto di Andrea</p>
                  <p className="text-sm leading-relaxed" style={{ color: PAPER + "70", fontFamily: FONT }}>{item.authorNote}</p>
                  <button onClick={() => setExpanded(false)} className="mt-2 text-[11px] font-bold tracking-wider uppercase" style={{ color: PAPER + "40" }}>
                    Chiudi ↑
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Firma */}
        <div className="flex items-center gap-3 mt-6 pt-6" style={{ borderTop: `1px solid ${PAPER}15` }}>
          <img src={PROFILE_IMG} alt="Andrea Cinelli" className="w-9 h-9 object-cover rounded-full" style={{ filter: "grayscale(20%)" }} />
          <div>
            <p className="text-xs font-black" style={{ color: PAPER }}>Andrea Cinelli</p>
            <p className="text-[10px]" style={{ color: PAPER + "50" }}>Tech Editor · ProofPress</p>
          </div>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="ml-auto text-[10px] font-bold tracking-wider uppercase" style={{ color: LINKEDIN_BLUE }}>
            LinkedIn →
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Punto del Giorno Card (griglia) ─────────────────────────────────────────
function PuntoCard({ item }: {
  item: {
    id: number; dateLabel: string; title: string; subtitle: string | null;
    keyTrend: string | null; section: string | null; imageUrl: string | null; authorNote: string | null; createdAt: Date;
    titleEn?: string | null; subtitleEn?: string | null;
  }
}) {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const isEN = i18n.language === 'en';
  const displayTitle = isEN && item.titleEn ? item.titleEn : item.title;
  const displaySubtitle = isEN && item.subtitleEn ? item.subtitleEn : item.subtitle;
  const fallbackImg = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp";

  return (
    <article
      className="flex flex-col cursor-pointer group"
      style={{ borderTop: `2px solid ${INK}12` }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Immagine */}
      <div className="overflow-hidden" style={{ height: 160 }}>
        <img
          src={item.imageUrl || fallbackImg}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Testo */}
      <div className="flex-1 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {item.section && (
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: RED }}>{item.section}</span>
          )}
          <span className="text-[10px]" style={{ color: INK + "40", fontFamily: FONT }}>
            {formatDateIT(item.dateLabel)}
          </span>
          {item.titleEn && (
            <span className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: '#2563eb18', color: '#2563eb', border: '1px solid #2563eb30' }}>EN</span>
          )}
        </div>
        <h3
          className="text-base font-black leading-snug tracking-tight group-hover:text-[#dc2626] transition-colors"
          style={{ color: INK, fontFamily: FONT }}
        >
          {displayTitle}
        </h3>
        {displaySubtitle && (
          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: INK + "60", fontFamily: FONT }}>
            {displaySubtitle}
          </p>
        )}

        {/* Espanso */}
        {open && (
          <div className="mt-3 space-y-2">
            {item.keyTrend && (
              <div className="border-l-2 pl-3" style={{ borderColor: RED }}>
                <p className="text-[9px] font-bold tracking-wider uppercase mb-0.5" style={{ color: RED }}>Key Trend</p>
                <p className="text-xs leading-relaxed" style={{ color: INK + "70", fontFamily: FONT }}>{item.keyTrend}</p>
              </div>
            )}
            {item.authorNote && (
              <div>
                <p className="text-[9px] font-bold tracking-wider uppercase mb-0.5" style={{ color: INK + "50" }}>Il punto di Andrea</p>
                <p className="text-xs leading-relaxed" style={{ color: INK + "65", fontFamily: FONT }}>{item.authorNote}</p>
              </div>
            )}
          </div>
        )}

        <button className="mt-2 text-[10px] font-bold tracking-wider uppercase" style={{ color: INK + "35" }}>
          {open ? "Chiudi ↑" : "Leggi ↓"}
        </button>
      </div>
    </article>
  );
}

// ─── Articolo Card ────────────────────────────────────────────────────────────
function ArticleCard({ article }: {
  article: {
    id: number; title: string; excerpt: string | null; articleUrl: string;
    publication: string; tags: string | null; imageUrl: string | null; dateLabel: string;
    verifyHash?: string | null;
    ppvHash?: string | null;
    ppvIpfsUrl?: string | null;
    ppvTrustGrade?: string | null;
    ppvTrustScore?: number | null;
    ppvDocumentId?: number | null;
  }
}) {
  const tags = article.tags ? article.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const fallbackImg = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp";

  return (
    <div className="flex flex-col" style={{ borderTop: `1px solid ${INK}12` }}>
      {/* Immagine cliccabile */}
      <a
        href={article.articleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden group"
        style={{ height: 140 }}
      >
        <img
          src={article.imageUrl || fallbackImg}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </a>
      {/* Contenuto card */}
      <div className="pt-3 pb-3">
        {article.publication && (
          <p className="text-[9px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: RED }}>{article.publication}</p>
        )}
        <a
          href={article.articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-[#dc2626] transition-colors"
        >
          <h3 className="text-sm font-black leading-snug" style={{ color: INK, fontFamily: FONT }}>
            {article.title}
          </h3>
        </a>
        {article.excerpt && (
          <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: INK + "60", fontFamily: FONT }}>{article.excerpt}</p>
        )}
        {tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {tags.slice(0, 2).map(t => (
              <span key={t} className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5" style={{ backgroundColor: INK + "08", color: INK + "55" }}>{t}</span>
            ))}
          </div>
        )}
        {(article.verifyHash || article.ppvHash) && (
          <div className="mt-2">
            <VerifyBadge
              hash={article.ppvHash || article.verifyHash}
              size="sm"
              trustGrade={article.ppvTrustGrade}
              trustScore={article.ppvTrustScore}
              ppvHash={article.ppvHash}
              ppvIpfsUrl={article.ppvIpfsUrl}
              ppvTrustGrade={article.ppvTrustGrade}
              ppvDocumentId={article.ppvDocumentId}
            />
          </div>
        )}
      </div>
      {/* Commenti inline */}
      <InlineComments articleId={article.id} articleTitle={article.title} />
    </div>
  );
}

// ─── LinkedIn Post Card ───────────────────────────────────────────────────────
function LinkedInCard({ post }: {
  post: {
    id: number; dateLabel: string; title: string | null; postText: string;
    linkedinUrl: string | null; section: string | null; imageUrl: string | null; hashtags: string | null; createdAt: Date;
  }
}) {
  const [exp, setExp] = useState(false);
  const preview = post.postText.slice(0, 200);
  const hasMore = post.postText.length > 200;

  return (
    <article className="p-5" style={{ border: `1px solid ${LINKEDIN_BLUE}20`, backgroundColor: "#f8fbff" }}>
      <div className="flex items-center gap-2 mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill={LINKEDIN_BLUE}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        <span className="text-[10px] font-bold" style={{ color: LINKEDIN_BLUE }}>LinkedIn</span>
        <span className="text-[10px]" style={{ color: INK + "40", fontFamily: FONT }}>{formatDateIT(post.dateLabel)}</span>
      </div>
      {post.title && (
        <h3 className="text-sm font-black mb-2 leading-snug" style={{ color: INK, fontFamily: FONT }}>{post.title}</h3>
      )}
      <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: INK + "70", fontFamily: FONT }}>
        {exp ? post.postText : preview}{hasMore && !exp ? "…" : ""}
      </p>
      <div className="mt-3 flex items-center gap-4">
        {hasMore && (
          <button onClick={() => setExp(e => !e)} className="text-[10px] font-bold tracking-wider uppercase" style={{ color: INK + "45" }}>
            {exp ? "Meno ↑" : "Tutto ↓"}
          </button>
        )}
        {post.linkedinUrl && (
          <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold tracking-wider uppercase" style={{ color: LINKEDIN_BLUE }}>
            Vedi →
          </a>
        )}
      </div>
    </article>
  );
}

// ─── Form contatto Andrea ─────────────────────────────────────────────────────
function ContactAndreaForm() {
  const [form, setForm] = useState({ nome: "", email: "", azienda: "", messaggio: "" });
  const [sent, setSent] = useState(false);
  const mutation = trpc.osservatorio.contactAndrea.useMutation({ onSuccess: () => setSent(true) });

  if (sent) {
    return (
      <div className="py-8 text-center border" style={{ borderColor: RED }}>
        <p className="text-base font-black" style={{ color: INK, fontFamily: FONT }}>Messaggio inviato.</p>
        <p className="text-sm mt-1" style={{ color: INK + "60" }}>Andrea risponde personalmente entro 48h.</p>
      </div>
    );
  }

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: "nome", label: "Nome *", type: "text", required: true },
          { key: "email", label: "Email *", type: "email", required: true },
          { key: "azienda", label: "Azienda", type: "text", required: false },
        ].map(({ key, label, type, required }) => (
          <div key={key}>
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>{label}</label>
            <input
              type={type} required={required}
              value={(form as Record<string, string>)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-3 py-2 text-sm border outline-none focus:border-[#0a0a0a] transition-colors"
              style={{ borderColor: INK + "25", backgroundColor: PAPER, color: INK, fontFamily: FONT, borderRadius: 0 }}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>Messaggio *</label>
        <textarea
          required rows={4}
          value={form.messaggio}
          onChange={e => setForm(f => ({ ...f, messaggio: e.target.value }))}
          className="w-full px-3 py-2 text-sm border outline-none focus:border-[#0a0a0a] transition-colors resize-none"
          style={{ borderColor: INK + "25", backgroundColor: PAPER, color: INK, fontFamily: FONT, borderRadius: 0 }}
        />
      </div>
      <button
        type="submit" disabled={mutation.isPending}
        className="px-8 py-3 text-[11px] font-black tracking-[0.15em] uppercase transition-opacity hover:opacity-80"
        style={{ backgroundColor: INK, color: PAPER }}
      >
        {mutation.isPending ? "Invio in corso…" : "Invia messaggio →"}
      </button>
    </form>
  );
}

// ─── Commenti inline per singolo articolo ───────────────────────────────────
function InlineComments({ articleId, articleTitle }: { articleId: number; articleTitle: string }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [sent, setSent] = useState(false);

  const { data: comments = [], refetch } = trpc.osservatorio.getComments.useQuery(
    { articleId },
    { enabled: open }
  );

  const addComment = trpc.osservatorio.addComment.useMutation({
    onSuccess: () => { setSent(true); setCommentBody(""); refetch(); },
  });

  return (
    <div style={{ borderTop: `1px solid ${INK}10` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-black/3"
        style={{ fontFamily: FONT }}
      >
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: INK + "50" }}>
          {open ? "▲ Chiudi commenti" : `💬 Commenti${comments.length > 0 ? ` (${comments.length})` : ""}`}
        </span>
        {!open && !isAuthenticated && (
          <span className="text-[9px]" style={{ color: INK + "30" }}>Accedi per commentare</span>
        )}
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-4">
          {/* Lista commenti approvati */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="p-3" style={{ backgroundColor: INK + "03", borderLeft: `2px solid ${INK}15` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black" style={{ color: INK }}>{c.authorName}</span>
                    <span className="text-[9px]" style={{ color: INK + "35" }}>
                      {new Date(c.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: INK + "65" }}>{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Form o login prompt */}
          {!isAuthenticated ? (
            <div className="py-3 text-center" style={{ border: `1px dashed ${INK}15` }}>
              <p className="text-xs mb-2" style={{ color: INK + "50" }}>Accedi per lasciare un commento</p>
              <a
                href="/api/oauth/login"
                className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color: RED }}
              >
                Accedi →
              </a>
            </div>
          ) : sent ? (
            <div className="py-3 text-center" style={{ border: `1px solid ${RED}20`, backgroundColor: RED + "04" }}>
              <p className="text-xs font-black" style={{ color: INK }}>Commento inviato. Pubblicato dopo moderazione.</p>
              <button onClick={() => setSent(false)} className="mt-1 text-[9px] font-bold uppercase" style={{ color: RED }}>Scrivi un altro →</button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); addComment.mutate({ articleId, body: commentBody }); }}>
              <p className="text-[9px] font-bold mb-1.5" style={{ color: INK + "50" }}>Commenta come {user?.name}</p>
              <textarea
                required rows={3}
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                placeholder="Il tuo commento..."
                className="w-full px-3 py-2 text-xs border outline-none focus:border-[#0a0a0a] transition-colors resize-none"
                style={{ borderColor: INK + "20", backgroundColor: PAPER, color: INK, fontFamily: FONT, borderRadius: 0 }}
              />
              <button
                type="submit" disabled={addComment.isPending || !commentBody.trim()}
                className="mt-2 px-5 py-2 text-[10px] font-black tracking-[0.12em] uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: INK, color: PAPER }}
              >
                {addComment.isPending ? "Invio…" : "Pubblica →"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sezione Commenti Lettori (dropdown legacy — non usata) ─────────────────────
function CommentsSection() {
  const { user, isAuthenticated } = useAuth();
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [sent, setSent] = useState(false);

  const { data: articles = [] } = trpc.osservatorio.getArticles.useQuery({ limit: 20 });
  const { data: comments = [], refetch } = trpc.osservatorio.getComments.useQuery(
    { articleId: selectedArticleId! },
    { enabled: selectedArticleId !== null }
  );

  const addComment = trpc.osservatorio.addComment.useMutation({
    onSuccess: () => { setSent(true); setCommentBody(""); refetch(); },
  });

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  if (!isAuthenticated) {
    return (
      <div className="py-8 px-6 text-center" style={{ border: `1px solid ${INK}10`, backgroundColor: INK + "03" }}>
        <p className="text-sm font-black mb-2" style={{ color: INK }}>Accedi per commentare</p>
        <p className="text-xs mb-4" style={{ color: INK + "55" }}>I commenti sono riservati agli utenti registrati. Accedi con il tuo account ProofPress.</p>
        <a
          href="/api/oauth/login"
          className="inline-block px-6 py-2.5 text-[11px] font-black tracking-[0.15em] uppercase transition-opacity hover:opacity-80"
          style={{ backgroundColor: INK, color: PAPER }}
        >
          Accedi →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Seleziona articolo */}
      <div>
        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: INK + "60" }}>
          Seleziona l'articolo su cui vuoi commentare
        </label>
        <select
          value={selectedArticleId ?? ""}
          onChange={e => { setSelectedArticleId(Number(e.target.value) || null); setSent(false); }}
          className="w-full px-3 py-2 text-sm border outline-none focus:border-[#0a0a0a] transition-colors"
          style={{ borderColor: INK + "25", backgroundColor: PAPER, color: INK, fontFamily: FONT, borderRadius: 0 }}
        >
          <option value="">— Scegli un articolo —</option>
          {articles.map(a => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>

      {/* Commenti esistenti */}
      {selectedArticleId && (
        <div>
          {selectedArticle && (
            <p className="text-xs font-bold mb-4" style={{ color: RED }}>
              Commenti su: {selectedArticle.title}
            </p>
          )}
          {comments.length === 0 ? (
            <p className="text-xs py-4" style={{ color: INK + "40" }}>Nessun commento ancora. Sii il primo.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map(c => (
                <div key={c.id} className="p-4" style={{ border: `1px solid ${INK}10`, backgroundColor: INK + "02" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black" style={{ color: INK }}>{c.authorName}</span>
                    <span className="text-[9px]" style={{ color: INK + "35" }}>
                      {new Date(c.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: INK + "70" }}>{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Form commento */}
          {sent ? (
            <div className="py-4 px-4 text-center" style={{ border: `1px solid ${RED}30`, backgroundColor: RED + "05" }}>
              <p className="text-sm font-black" style={{ color: INK }}>Commento inviato.</p>
              <p className="text-xs mt-1" style={{ color: INK + "55" }}>Sarà pubblicato dopo moderazione. Grazie per il contributo.</p>
              <button onClick={() => setSent(false)} className="mt-3 text-[10px] font-bold tracking-wider uppercase" style={{ color: RED }}>Scrivi un altro →</button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (selectedArticleId) addComment.mutate({ articleId: selectedArticleId, body: commentBody }); }}>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: INK + "60" }}>
                Il tuo commento — {user?.name}
              </label>
              <textarea
                required rows={4}
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                placeholder="Scrivi il tuo commento..."
                className="w-full px-3 py-2 text-sm border outline-none focus:border-[#0a0a0a] transition-colors resize-none"
                style={{ borderColor: INK + "25", backgroundColor: PAPER, color: INK, fontFamily: FONT, borderRadius: 0 }}
              />
              <button
                type="submit" disabled={addComment.isPending || !commentBody.trim()}
                className="mt-3 px-8 py-3 text-[11px] font-black tracking-[0.15em] uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: INK, color: PAPER }}
              >
                {addComment.isPending ? "Invio…" : "Pubblica commento →"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
// ─── Centro Studi Mini Form (inline nella sezione) ────────────────────────────
function CentroStudiMiniForm({ fontFamily, paperColor, redColor }: { fontFamily: string; paperColor: string; redColor: string }) {
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("abbonamento_report");
  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpcClient.centroStudi.submitLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Richiesta inviata ✓ — Ti risponderemo entro 24 ore lavorative.");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  if (submitted) {
    return (
      <div className="mt-6 p-4 border border-white/10 text-center">
        <p className="text-sm font-bold" style={{ color: paperColor, fontFamily }}>✓ Richiesta ricevuta — risposta entro 24h</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-5 border border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
      <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: redColor, fontFamily }}>
        CONTATTO DIRETTO
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          type="text"
          placeholder="Nome e Cognome *"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none"
          style={{ color: paperColor, fontFamily }}
        />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 focus:border-red-500 focus:outline-none"
          style={{ color: paperColor, fontFamily }}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={interest}
          onChange={e => setInterest(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-white/10 focus:border-red-500 focus:outline-none"
          style={{ color: paperColor, fontFamily, backgroundColor: "#1a1f2e" }}
        >
          <option value="abbonamento_report">Abbonamento Report Settimanali</option>
          <option value="report_custom">Report Custom su Commissione</option>
          <option value="osservatorio">Osservatorio Tematico</option>
          <option value="informazioni">Informazioni Generali</option>
        </select>
        <button
          onClick={() => {
            if (!name.trim() || !email.trim()) {
              toast.error("Compila nome e email");
              return;
            }
            submitLead.mutate({ name, email, interest: interest as any, source: "osservatorio-tech" });
          }}
          disabled={submitLead.isPending}
          className="px-6 py-2 text-sm font-bold transition-opacity hover:opacity-85 disabled:opacity-50 whitespace-nowrap"
          style={{ backgroundColor: redColor, color: paperColor, fontFamily }}
        >
          {submitLead.isPending ? "Invio..." : "Invia →"}
        </button>
      </div>
      <p className="text-[10px]" style={{ color: paperColor + "40", fontFamily }}>
        Report ad hoc, costruiti su fonti verificate con ProofPress Verify™ — personalizzati per settore e audience.
        <a href="/centro-studi" className="ml-2 underline" style={{ color: redColor }}>Scopri tutti i servizi →</a>
      </p>
    </div>
  );
}


export default function OsservatorioTech() {
  const { data: punti = [], isLoading: loadingPunti } = trpc.osservatorio.getPuntiDelGiorno.useQuery({ limit: 60 });
  const { data: articles = [], isLoading: loadingArticles } = trpc.osservatorio.getArticles.useQuery({ limit: 20 });
  const { data: linkedinPosts = [], isLoading: loadingPosts } = trpc.osservatorio.getLinkedinPosts.useQuery({ limit: 12 });

  const featured = punti[0] ?? null;
  const rest = punti.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER, color: INK }}>
      <SEOHead
        title="Base Alpha + — Osservatorio & Centro Studi | ProofPress"
        description="Base Alpha + è l'Osservatorio e Centro Studi di ProofPress. Coordinato da Andrea Cinelli, diretto da Adrian Lenice. Report verticali verificati su commissione per 200+ clienti."
      />
      <SharedPageHeader />
      {/* ── BANNER BASE ALPHA ─────────────────────────────────────────────── */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(201,162,39,0.3)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5" style={{ background: "#c9a227", color: "#0a0a0a" }}>
              NUOVO
            </span>
            <p className="text-[12px] font-semibold" style={{ color: "rgba(250,250,248,0.75)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>
              <strong style={{ color: "#c9a227" }}>Base Alpha +</strong> — Osservatorio Intelligence Premium: report pre-pubblici certificati PPV su 10 settori verticali
            </p>
          </div>
          <Link href="/base-alpha">
            <span className="text-[10px] font-black tracking-[0.15em] uppercase px-4 py-1.5 cursor-pointer transition-all hover:opacity-90 whitespace-nowrap" style={{ background: "#c9a227", color: "#0a0a0a" }}>
              Scopri Base Alpha + →
            </span>
          </Link>
        </div>
      </div>
            <div className="flex min-h-screen">
        <LeftSidebar />

        <main className="flex-1 min-w-0" style={{ fontFamily: FONT }}>

          {/* ══════════════════════════════════════════════════════════════════
              HERO — display enorme + profilo sidebar
          ══════════════════════════════════════════════════════════════════ */}
          <div style={{ borderBottom: `3px solid ${INK}` }}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">

              {/* Titolo display — 3/4 */}
              <div className="lg:col-span-3 px-8 md:px-12 py-12 md:py-16" style={{ borderRight: `1px solid ${INK}15` }}>
                <p className="text-sm font-black tracking-[0.12em] uppercase mb-2" style={{ color: "#c9a227", fontFamily: FONT }}>a cura di Andrea Cinelli</p>
                <p className="text-base font-black tracking-[-0.02em] mb-1" style={{ color: INK, fontFamily: FONT }}>Base Alpha</p>
                <h1
                  className="mt-2 font-black leading-[0.95] tracking-[-0.03em]"
                  style={{
                    color: INK,
                    fontFamily: FONT,
                    fontSize: "clamp(3.5rem, 8vw, 7.5rem)",
                    lineHeight: 0.93,
                  }}
                >
                  Osservatorio Tech
                </h1>
                <p
                  className="mt-6 font-bold leading-snug max-w-2xl"
                  style={{ color: INK, fontSize: "clamp(1.15rem, 1.9vw, 1.45rem)", fontFamily: FONT }}
                >
                  Il punto di vista di chi il digitale<br />
                  <span style={{ color: RED }}>lo ha costruito.</span>
                </p>
                <p
                  className="mt-6 leading-relaxed max-w-2xl"
                  style={{ color: INK + "70", fontSize: "clamp(1rem, 1.5vw, 1.2rem)", fontFamily: FONT }}
                >
                  Base Alpha + è l’osservatorio dedicato a tecnologia, venture capital, investimenti e innovazione, curato da <strong style={{ color: INK }}>Andrea Cinelli</strong> — imprenditore seriale e tra i pionieri del digitale in Italia.
                  <br /><br />
                  Ogni giorno pubblica analisi e approfondimenti verificati sui temi che contano: intelligenza artificiale, startup, venture capital e trasformazione digitale, condivisi anche attraverso il suo profilo LinkedIn.
                  <br /><br />
                  Un punto di vista qualificato, costruito su oltre 30 anni di execution diretta — non teoria.
                  <br /><br />
                  Andrea contribuisce inoltre a Base Alpha +, un osservatorio tecnologico internazionale guidato da <strong style={{ color: INK }}>Adrian Lenice</strong> e supportato da un team globale di analisti.
                </p>

                {/* Temi */}
                <div className="flex flex-wrap gap-2 mt-8">
                  {["AI & Generative AI", "Startup & Venture", "Digital Transformation", "Leadership", "Innovation & IP", "Media & Giornalismo"].map(t => (
                    <span key={t} className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5" style={{ border: `1px solid ${INK}20`, color: INK + "60" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team — 1/4: Andrea Cinelli — sfondo bianco, immagine grande */}
              <div className="lg:col-span-1 flex flex-col bg-white border-l border-zinc-100">
                {/* Andrea Cinelli */}
                <div className="flex flex-col">
                  {/* Immagine grande a tutta larghezza */}
                  <div className="relative">
                    <img
                      src={PROFILE_IMG}
                      alt="Andrea Cinelli"
                      className="w-full object-cover object-top"
                      style={{ aspectRatio: "3/4", maxHeight: "320px" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-[#0a0a0a]">
                      <p className="text-[9px] font-black tracking-[0.2em] uppercase text-[#dc2626]">Autore</p>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="px-5 py-5 flex flex-col gap-3 border-b border-zinc-100">
                    <div>
                      <p className="text-base font-black text-[#0a0a0a]">Andrea Cinelli</p>
                      <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-1 text-[#dc2626]">
                        Senior Tech Editor
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Co-fondatore Libero.it</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">12+ venture AI · 25+ brevetti</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Prof. Sole 24 Ore BS</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Membro Advisory Board Deloitte CM</p>
                    </div>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center text-[10px] font-black tracking-wider uppercase py-3 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: LINKEDIN_BLUE, color: PAPER }}
                    >
                      SEGUI SU LINKEDIN
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ BANNER BASE ALPHA — compatto promozionale ══════════════════ */}
          <section className="mx-6 md:mx-8 my-6 border-l-4 border-[#c9a227] bg-amber-50 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 bg-[#c9a227] text-black">BASE ALPHA +</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Osservatorio Intelligence Premium</span>
              </div>
              <p className="text-sm font-bold text-[#111] leading-snug">
                Report su misura certificati PPV™ — analisi pre-pubblica da 4.000+ fonti su AI, VC, Startup, Fintech e altri 6 settori verticali.
              </p>
            </div>
            <Link
              href="/base-alpha"
              className="flex-shrink-0 bg-[#111] text-white text-xs font-black tracking-wider uppercase px-5 py-3 hover:bg-zinc-800 transition-colors whitespace-nowrap"
            >
              SCOPRI BASE ALPHA + →
            </Link>
          </section>
          <section id="punti-del-giorno">
            {/* Header sezione */}
            <div className="px-8 md:px-12 py-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}10` }}>
              <div className="flex items-center gap-4">
                <div className="w-1 h-8" style={{ backgroundColor: RED }} />
                <div>
                  <Label>Editoriale Quotidiano</Label>
                  <h2 className="text-2xl md:text-3xl font-black leading-none mt-0.5" style={{ color: INK }}>
                    Il Punto del Giorno
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase hidden md:block" style={{ color: INK + "35" }}>
                {punti.length > 0 ? `${punti.length} editoriali` : ""}
              </span>
            </div>

            {loadingPunti ? (
              <div className="px-8 md:px-12 py-12 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 w-2/3 rounded" style={{ backgroundColor: INK + "08" }} />
                  <div className="h-4 w-full rounded" style={{ backgroundColor: INK + "06" }} />
                </div>
              </div>
            ) : punti.length === 0 ? (
              <div className="px-8 md:px-12 py-16 text-center">
                <p className="text-sm" style={{ color: INK + "40" }}>I Punti del Giorno verranno pubblicati qui ogni mattina.</p>
              </div>
            ) : (
              <>
                {/* Featured card — oggi */}
                {featured && (
                  <div className="px-8 md:px-12 py-8" style={{ borderBottom: `1px solid ${INK}10` }}>
                    <FeaturedPunto item={featured} />
                  </div>
                )}

                {/* Griglia 3 colonne — precedenti */}
                {rest.length > 0 && (
                  <div className="px-8 md:px-12 py-8">
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-6" style={{ color: INK + "40" }}>
                      Archivio editoriali
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {rest.map(item => (
                        <PuntoCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              ARTICOLI PUBBLICATI — griglia 4 colonne
          ══════════════════════════════════════════════════════════════════ */}
          <section id="articoli" style={{ borderTop: `3px solid ${INK}` }}>
            <div className="px-8 md:px-12 py-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}10` }}>
              <div className="flex items-center gap-4">
                <div className="w-1 h-8" style={{ backgroundColor: INK }} />
                <div>
                  <Label color={INK + "60"}>Archivio</Label>
                  <h2 className="text-2xl md:text-3xl font-black leading-none mt-0.5" style={{ color: INK }}>
                    Articoli Pubblicati
                  </h2>
                </div>
              </div>
              <Link href="/" className="text-[11px] font-bold tracking-wider uppercase" style={{ color: RED }}>
                Tutti →
              </Link>
            </div>

            <div className="px-8 md:px-12 py-8">
              {loadingArticles ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-36 rounded mb-3" style={{ backgroundColor: INK + "08" }} />
                      <div className="h-3 w-3/4 rounded mb-2" style={{ backgroundColor: INK + "06" }} />
                      <div className="h-3 w-1/2 rounded" style={{ backgroundColor: INK + "04" }} />
                    </div>
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: INK + "40" }}>
                  Gli articoli verranno pubblicati qui non appena disponibili.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              POST LINKEDIN — griglia 3 colonne
          ══════════════════════════════════════════════════════════════════ */}
          <section id="linkedin" style={{ borderTop: `3px solid ${INK}` }}>
            <div className="px-8 md:px-12 py-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}10` }}>
              <div className="flex items-center gap-4">
                <div className="w-1 h-8" style={{ backgroundColor: LINKEDIN_BLUE }} />
                <div>
                  <Label color={LINKEDIN_BLUE}>LinkedIn</Label>
                  <h2 className="text-2xl md:text-3xl font-black leading-none mt-0.5" style={{ color: INK }}>
                    Post LinkedIn
                  </h2>
                </div>
              </div>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-bold tracking-wider uppercase" style={{ color: LINKEDIN_BLUE }}>
                Segui →
              </a>
            </div>

            <div className="px-8 md:px-12 py-8">
              {loadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse p-5" style={{ border: `1px solid ${LINKEDIN_BLUE}20` }}>
                      <div className="h-3 w-20 mb-3 rounded" style={{ backgroundColor: LINKEDIN_BLUE + "20" }} />
                      <div className="h-4 w-3/4 mb-2 rounded" style={{ backgroundColor: INK + "08" }} />
                    </div>
                  ))}
                </div>
              ) : linkedinPosts.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: INK + "40" }}>
                  I post LinkedIn verranno sincronizzati automaticamente ogni giorno.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {linkedinPosts.map(p => <LinkedInCard key={p.id} post={p} />)}
                </div>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              TEMI TRATTATI
          ══════════════════════════════════════════════════════════════════ */}
          <section style={{ borderTop: `3px solid ${INK}` }}>
            <div className="px-8 md:px-12 py-6" style={{ borderBottom: `1px solid ${INK}10` }}>
              <div className="flex items-center gap-4">
                <div className="w-1 h-8" style={{ backgroundColor: INK + "30" }} />
                <div>
                  <Label color={INK + "50"}>Focus tematici</Label>
                  <h2 className="text-2xl md:text-3xl font-black leading-none mt-0.5" style={{ color: INK }}>
                    Di cosa scrive Andrea
                  </h2>
                </div>
              </div>
            </div>
            <div className="px-8 md:px-12 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {[
                { tag: "AI & Generative AI", desc: "Impatto dell'intelligenza artificiale su prodotti, mercati e modelli di business. Dalle fondamenta tecnologiche alle implicazioni strategiche per il C-level." },
                { tag: "Startup & Venture", desc: "Ecosistema startup italiano ed europeo, deal flow, metriche di crescita e strategie di fundraising. Con il punto di vista di chi ha fondato e ceduto più volte." },
                { tag: "Digital Transformation", desc: "Come le organizzazioni si reinventano nell'era digitale. Casi reali, errori comuni e leve operative per accelerare la trasformazione." },
                { tag: "Giornalismo & Media", desc: "Il futuro dell'informazione nell'era agentica. Modelli editoriali sostenibili, qualità dei contenuti e il ruolo della verifica certificata." },
                { tag: "Leadership & Strategy", desc: "Decisioni ad alto impatto, gestione dell'incertezza e costruzione di team in contesti di discontinuità. Per chi guida, non per chi osserva." },
                { tag: "Innovation & IP", desc: "Brevetti, proprietà intellettuale e vantaggio competitivo nell'economia della conoscenza. 25+ brevetti depositati, inclusa IP fondamentale per SPID." },
              ].map(({ tag, desc }, i) => (
                <div
                  key={tag}
                  className="p-6"
                  style={{
                    borderTop: `1px solid ${INK}10`,
                    borderRight: i % 3 !== 2 ? `1px solid ${INK}10` : "none",
                  }}
                >
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-3" style={{ color: RED }}>{tag}</p>
                  <p className="text-sm leading-relaxed" style={{ color: INK + "65" }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>



          {/* ══════════════════════════════════════════════════════════════════
              CONTATTA ANDREA
          ══════════════════════════════════════════════════════════════════ */}
          <section id="contatta" style={{ borderTop: `3px solid ${INK}` }}>
            <div className="px-8 md:px-12 py-6" style={{ borderBottom: `1px solid ${INK}10` }}>
              <div className="flex items-center gap-4">
                <div className="w-1 h-8" style={{ backgroundColor: RED }} />
                <div>
                  <Label>Contatti</Label>
                  <h2 className="text-2xl md:text-3xl font-black leading-none mt-0.5" style={{ color: INK }}>
                    Vuoi contattare Andrea?
                  </h2>
                </div>
              </div>
            </div>
            <div className="px-8 md:px-12 py-10">
              <p className="text-sm mb-8 max-w-xl" style={{ color: INK + "60" }}>
                Per collaborazioni editoriali, keynote, advisory, investimenti o semplicemente per scambiare idee. Andrea risponde personalmente entro 48h.
              </p>
              <ContactAndreaForm />
            </div>
          </section>

        </main>
      </div>

      <SharedPageFooter />
    </div>
  );
}
