/*
 * Osservatorio Tech — A cura di Andrea Cinelli
 * Layout ristrutturato: intro grande + profilo sidebar destra + Punti del Giorno
 * Palette: bianco #ffffff / nero #0a0a0a / rosso #dc2626
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SEOHead from "@/components/SEOHead";
import SharedPageHeader from "@/components/SharedPageHeader";
import SharedPageFooter from "@/components/SharedPageFooter";
import LeftSidebar from "@/components/LeftSidebar";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";

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

function SectionDivider() {
  return <div className="border-t my-10" style={{ borderColor: INK + "15" }} />;
}

function formatDateIT(dateLabel: string): string {
  try {
    const parts = dateLabel.split("-").map(Number);
    let year: number, month: number, day: number;
    if (parts[0] > 31) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateLabel;
  }
}

// ─── Punto del Giorno Card ────────────────────────────────────────────────────
function PuntoDelGiornoCard({ item, index }: {
  item: {
    id: number;
    dateLabel: string;
    title: string;
    subtitle: string | null;
    keyTrend: string | null;
    section: string | null;
    imageUrl: string | null;
    authorNote: string | null;
    createdAt: Date;
  };
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const isToday = index === 0;

  return (
    <article
      className="border-t py-6 cursor-pointer group"
      style={{ borderColor: INK + "15" }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {isToday && (
              <span
                className="text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5"
                style={{ backgroundColor: RED, color: PAPER }}
              >
                Oggi
              </span>
            )}
            {item.section && (
              <span
                className="text-[9px] font-bold tracking-[0.15em] uppercase"
                style={{ color: RED }}
              >
                {item.section}
              </span>
            )}
            <span className="text-[10px]" style={{ color: INK + "45", fontFamily: FONT }}>
              {formatDateIT(item.dateLabel)}
            </span>
          </div>
          <h3
            className="text-lg md:text-xl font-black leading-snug tracking-tight group-hover:text-[#dc2626] transition-colors"
            style={{ color: INK, fontFamily: FONT }}
          >
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="mt-1 text-sm leading-relaxed" style={{ color: INK + "65", fontFamily: FONT }}>
              {item.subtitle}
            </p>
          )}
        </div>
        {item.imageUrl && !expanded && (
          <div className="flex-shrink-0 w-20 h-16 overflow-hidden hidden md:block">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}
        <span
          className="flex-shrink-0 text-[11px] font-bold tracking-wider uppercase mt-1 transition-transform"
          style={{ color: INK + "40", transform: expanded ? "rotate(180deg)" : "none" }}
        >
          ▾
        </span>
      </div>

      {expanded && (
        <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${INK}10` }}>
          {item.imageUrl && (
            <div className="mb-5 w-full max-h-64 overflow-hidden">
              <img src={item.imageUrl} alt={item.title} className="w-full object-cover" style={{ maxHeight: 256 }} />
            </div>
          )}
          {item.keyTrend && (
            <div
              className="mb-4 p-4"
              style={{ borderLeft: `3px solid ${RED}`, backgroundColor: INK + "04" }}
            >
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: RED }}>
                Key Trend
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "80", fontFamily: FONT }}>
                {item.keyTrend}
              </p>
            </div>
          )}
          {item.authorNote && (
            <div className="mt-3">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: INK + "50" }}>
                Il punto di Andrea
              </p>
              <p className="text-sm leading-relaxed" style={{ color: INK + "75", fontFamily: FONT }}>
                {item.authorNote}
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center gap-3">
            <Link
              href={`/editorial/${item.id}`}
              className="text-[11px] font-bold tracking-wider uppercase"
              style={{ color: RED }}
              onClick={e => e.stopPropagation()}
            >
              Leggi l'editoriale completo →
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Articolo Card ────────────────────────────────────────────────────────────
function ArticleCard({ article }: {
  article: {
    id: number;
    dateLabel: string;
    title: string;
    excerpt: string | null;
    articleUrl: string;
    publication: string;
    imageUrl: string | null;
    tags: string | null;
  }
}) {
  const tags = article.tags ? article.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  return (
    <article className="border-t py-5 grid grid-cols-1 md:grid-cols-4 gap-4 group" style={{ borderColor: INK + "15" }}>
      {article.imageUrl && (
        <div className="md:col-span-1 h-28 overflow-hidden">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
        </div>
      )}
      <div className={article.imageUrl ? "md:col-span-3" : "md:col-span-4"}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: RED }}>
            {article.publication}
          </span>
          <span className="text-[10px]" style={{ color: INK + "40" }}>
            {formatDateIT(article.dateLabel)}
          </span>
        </div>
        <a href={article.articleUrl} target="_blank" rel="noopener noreferrer">
          <h3 className="text-base font-black leading-snug tracking-tight hover:text-[#dc2626] transition-colors" style={{ color: INK, fontFamily: FONT }}>
            {article.title}
          </h3>
        </a>
        {article.excerpt && (
          <p className="mt-1 text-sm leading-relaxed line-clamp-2" style={{ color: INK + "65", fontFamily: FONT }}>
            {article.excerpt}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {tags.map(t => (
              <span key={t} className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5" style={{ backgroundColor: INK + "08", color: INK + "60" }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── LinkedIn Post Card ───────────────────────────────────────────────────────
function LinkedInPostCard({ post }: {
  post: {
    id: number;
    dateLabel: string;
    title: string | null;
    postText: string;
    linkedinUrl: string | null;
    section: string | null;
    imageUrl: string | null;
    hashtags: string | null;
    createdAt: Date;
  }
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = post.postText.slice(0, 220);
  const hasMore = post.postText.length > 220;

  return (
    <article className="border-t py-5" style={{ borderColor: LINKEDIN_BLUE + "25" }}>
      <div className="flex items-center gap-2 mb-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill={LINKEDIN_BLUE}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
        <span className="text-[10px]" style={{ color: INK + "45", fontFamily: FONT }}>
          {formatDateIT(post.dateLabel)}
        </span>
        {post.section && (
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: LINKEDIN_BLUE }}>
            {post.section}
          </span>
        )}
      </div>
      {post.title && (
        <h3 className="text-base font-black mb-2 leading-snug" style={{ color: INK, fontFamily: FONT }}>
          {post.title}
        </h3>
      )}
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: INK + "75", fontFamily: FONT }}>
        {expanded ? post.postText : preview}{hasMore && !expanded ? "…" : ""}
      </p>
      <div className="mt-3 flex items-center gap-4">
        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[11px] font-bold tracking-wider uppercase"
            style={{ color: INK + "50" }}
          >
            {expanded ? "Mostra meno ↑" : "Leggi tutto ↓"}
          </button>
        )}
        {post.linkedinUrl && (
          <a
            href={post.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold tracking-wider uppercase"
            style={{ color: LINKEDIN_BLUE }}
          >
            Vedi su LinkedIn →
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
    <form
      onSubmit={e => { e.preventDefault(); mutation.mutate(form); }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: "nome", label: "Nome *", type: "text", required: true },
          { key: "email", label: "Email *", type: "email", required: true },
          { key: "azienda", label: "Azienda", type: "text", required: false },
        ].map(({ key, label, type, required }) => (
          <div key={key}>
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>
              {label}
            </label>
            <input
              type={type}
              required={required}
              value={(form as Record<string, string>)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-3 py-2 text-sm border outline-none focus:border-[#0a0a0a] transition-colors"
              style={{ borderColor: INK + "25", backgroundColor: PAPER, color: INK, fontFamily: FONT, borderRadius: 0 }}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: INK + "60" }}>
          Messaggio *
        </label>
        <textarea
          required
          rows={4}
          value={form.messaggio}
          onChange={e => setForm(f => ({ ...f, messaggio: e.target.value }))}
          className="w-full px-3 py-2 text-sm border outline-none focus:border-[#0a0a0a] transition-colors resize-none"
          style={{ borderColor: INK + "25", backgroundColor: PAPER, color: INK, fontFamily: FONT, borderRadius: 0 }}
        />
      </div>
      {mutation.error && (
        <p className="text-sm" style={{ color: RED }}>{mutation.error.message}</p>
      )}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-8 py-3 text-[11px] font-black tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
        style={{ backgroundColor: mutation.isPending ? INK + "60" : INK, color: PAPER, cursor: mutation.isPending ? "not-allowed" : "pointer", borderRadius: 0 }}
      >
        {mutation.isPending ? "Invio in corso..." : "Invia messaggio →"}
      </button>
      <p className="text-[11px]" style={{ color: INK + "50" }}>
        Il messaggio arriverà direttamente ad Andrea Cinelli — ac@acinelli.com
      </p>
    </form>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function OsservatorioTech() {
  const { data: punti = [], isLoading: loadingPunti } = trpc.osservatorio.getPuntiDelGiorno.useQuery({ limit: 60 });
  const { data: articles = [], isLoading: loadingArticles } = trpc.osservatorio.getArticles.useQuery({ limit: 20 });
  const { data: linkedinPosts = [], isLoading: loadingPosts } = trpc.osservatorio.getLinkedinPosts.useQuery({ limit: 12 });

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER, color: INK }}>
      <SEOHead
        title="Osservatorio Tech — Andrea Cinelli | ProofPress"
        description="Analisi quotidiane di Andrea Cinelli su AI, startup, venture capital e trasformazione digitale. Aggiornato ogni giorno."
      />
      <SharedPageHeader />
      <BreakingNewsTicker />

      <div className="flex min-h-screen">
        <LeftSidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0 py-8" style={{ fontFamily: FONT }}>

          {/* ── HERO: intro grande + profilo piccolo a destra ─────────────── */}
          <div className="px-6 md:px-10 mb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-10" style={{ borderBottom: `2px solid ${RED}` }}>

              {/* Intro — occupa 2/3 */}
              <div className="md:col-span-2">
                <Label>Osservatorio Tech</Label>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mt-3 mb-5"
                  style={{ color: INK }}
                >
                  Il punto di vista<br />
                  di chi il digitale<br />
                  <span style={{ color: RED }}>lo ha costruito.</span>
                </h1>
                <p className="text-base md:text-lg leading-relaxed max-w-xl" style={{ color: INK + "70" }}>
                  Un'area editoriale curata da <strong style={{ color: INK }}>Andrea Cinelli</strong> — imprenditore seriale, AI pioneer e pioniere del digitale italiano. Ogni giorno, analisi e approfondimenti sui temi che contano: innovazione, intelligenza artificiale, startup, venture capital e trasformazione digitale. Un punto di vista qualificato, costruito su 30 anni di execution diretta, non su teoria.
                </p>
              </div>

              {/* Profilo — 1/3, piccolo, a destra */}
              <div className="md:col-span-1 flex flex-col items-start md:items-end gap-3 pt-2">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <img
                    src={PROFILE_IMG}
                    alt="Andrea Cinelli"
                    className="w-28 h-28 object-cover"
                    style={{ filter: "contrast(1.05) grayscale(10%)" }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 py-1 px-2"
                    style={{ backgroundColor: INK }}
                  >
                    <p className="text-[8px] font-bold tracking-wider uppercase" style={{ color: PAPER }}>
                      Tech Editor
                    </p>
                  </div>
                </div>
                <div className="text-right md:text-right">
                  <p className="text-sm font-black" style={{ color: INK }}>Andrea Cinelli</p>
                  <p className="text-[10px] font-bold tracking-wider uppercase mt-0.5" style={{ color: RED }}>
                    CEO FoolFarm · AI Pioneer
                  </p>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: INK + "65" }}>
                    Co-fondatore Libero.it · 12+ venture AI<br />25+ brevetti · 2 exit · Prof. Sole 24 Ore
                  </p>
                </div>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase py-1.5 px-3 transition-opacity hover:opacity-70"
                  style={{ backgroundColor: LINKEDIN_BLUE, color: PAPER }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Segui su LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* ── PUNTI DEL GIORNO ──────────────────────────────────────────── */}
          <section className="px-6 md:px-10 mt-10 mb-10" id="punti-del-giorno">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Label>Editoriale Quotidiano</Label>
                <h2
                  className="text-2xl md:text-3xl font-black mt-1 leading-none"
                  style={{ color: INK }}
                >
                  Il Punto del Giorno
                </h2>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: INK + "40" }}>
                {punti.length > 0 ? `${punti.length} editoriali` : ""}
              </span>
            </div>

            {loadingPunti ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="border-t py-6 animate-pulse" style={{ borderColor: INK + "15" }}>
                    <div className="h-3 w-24 mb-3 rounded" style={{ backgroundColor: INK + "12" }} />
                    <div className="h-5 w-3/4 mb-2 rounded" style={{ backgroundColor: INK + "08" }} />
                    <div className="h-3 w-full rounded" style={{ backgroundColor: INK + "06" }} />
                  </div>
                ))}
              </div>
            ) : punti.length === 0 ? (
              <div className="border-t py-12 text-center" style={{ borderColor: INK + "15" }}>
                <p className="text-sm" style={{ color: INK + "50" }}>
                  I Punti del Giorno verranno visualizzati qui non appena disponibili.
                </p>
              </div>
            ) : (
              <div>
                {punti.map((item, i) => (
                  <PuntoDelGiornoCard key={item.id} item={item} index={i} />
                ))}
              </div>
            )}
          </section>

          <div className="px-6 md:px-10"><SectionDivider /></div>

          {/* ── ARTICOLI PUBBLICATI ───────────────────────────────────────── */}
          <section className="px-6 md:px-10 mb-10" id="articoli">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Label>Archivio</Label>
                <h2 className="text-2xl font-black mt-1 leading-none" style={{ color: INK }}>
                  Articoli Pubblicati
                </h2>
              </div>
              <Link href="/" className="text-[11px] font-bold tracking-wider uppercase" style={{ color: RED }}>
                Tutti gli articoli →
              </Link>
            </div>

            {loadingArticles ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-t py-5 animate-pulse" style={{ borderColor: INK + "15" }}>
                    <div className="h-3 w-24 mb-2 rounded" style={{ backgroundColor: INK + "12" }} />
                    <div className="h-5 w-3/4 mb-2 rounded" style={{ backgroundColor: INK + "08" }} />
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="border-t py-10 text-center" style={{ borderColor: INK + "15" }}>
                <p className="text-sm" style={{ color: INK + "50" }}>
                  Gli articoli verranno pubblicati qui non appena disponibili.
                </p>
              </div>
            ) : (
              <div>{articles.map(a => <ArticleCard key={a.id} article={a} />)}</div>
            )}
          </section>

          <div className="px-6 md:px-10"><SectionDivider /></div>

          {/* ── POST LINKEDIN ─────────────────────────────────────────────── */}
          <section className="px-6 md:px-10 mb-10" id="linkedin">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Label color={LINKEDIN_BLUE}>LinkedIn</Label>
                <h2 className="text-2xl font-black mt-1 leading-none" style={{ color: INK }}>
                  Post LinkedIn
                </h2>
              </div>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-bold tracking-wider uppercase" style={{ color: LINKEDIN_BLUE }}>
                Segui su LinkedIn →
              </a>
            </div>

            {loadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-t py-5 animate-pulse" style={{ borderColor: INK + "15" }}>
                    <div className="h-3 w-20 mb-2 rounded" style={{ backgroundColor: LINKEDIN_BLUE + "25" }} />
                    <div className="h-4 w-2/3 mb-2 rounded" style={{ backgroundColor: INK + "08" }} />
                  </div>
                ))}
              </div>
            ) : linkedinPosts.length === 0 ? (
              <div className="border-t py-10 text-center" style={{ borderColor: INK + "15" }}>
                <p className="text-sm" style={{ color: INK + "50" }}>
                  I post LinkedIn verranno sincronizzati automaticamente ogni giorno.
                </p>
              </div>
            ) : (
              <div>{linkedinPosts.map(p => <LinkedInPostCard key={p.id} post={p} />)}</div>
            )}
          </section>

          <div className="px-6 md:px-10"><SectionDivider /></div>

          {/* ── TEMI TRATTATI ─────────────────────────────────────────────── */}
          <section className="px-6 md:px-10 mb-10">
            <Label>Focus tematici</Label>
            <h2 className="text-2xl font-black mt-1 mb-6 leading-none" style={{ color: INK }}>
              Di cosa scrive Andrea
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { tag: "AI & Generative AI", desc: "Impatto dell'intelligenza artificiale su prodotti, mercati e modelli di business. Dalle fondamenta tecnologiche alle implicazioni strategiche per il C-level." },
                { tag: "Startup & Venture", desc: "Ecosistema startup italiano ed europeo, deal flow, metriche di crescita e strategie di fundraising. Con il punto di vista di chi ha fondato e ceduto più volte." },
                { tag: "Digital Transformation", desc: "Come le organizzazioni si reinventano nell'era digitale. Casi reali, errori comuni e leve operative per accelerare la trasformazione." },
                { tag: "Giornalismo & Media", desc: "Il futuro dell'informazione nell'era agentica. Modelli editoriali sostenibili, qualità dei contenuti e il ruolo della verifica certificata." },
                { tag: "Leadership & Strategy", desc: "Decisioni ad alto impatto, gestione dell'incertezza e costruzione di team in contesti di discontinuità. Per chi guida, non per chi osserva." },
                { tag: "Innovation & IP", desc: "Brevetti, proprietà intellettuale e vantaggio competitivo nell'economia della conoscenza. 25+ brevetti depositati, inclusa IP fondamentale per SPID." },
              ].map(({ tag, desc }) => (
                <div key={tag} className="border p-4" style={{ borderColor: INK + "12" }}>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: RED }}>{tag}</p>
                  <p className="text-sm leading-relaxed" style={{ color: INK + "70" }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="px-6 md:px-10"><SectionDivider /></div>

          {/* ── CONTATTA ANDREA ───────────────────────────────────────────── */}
          <section className="px-6 md:px-10 mb-12" id="contatta">
            <Label>Contatti</Label>
            <h2 className="text-2xl font-black mt-1 mb-2 leading-none" style={{ color: INK }}>
              Vuoi contattare Andrea?
            </h2>
            <p className="text-sm mb-6" style={{ color: INK + "65" }}>
              Per collaborazioni editoriali, keynote, advisory, investimenti o semplicemente per scambiare idee. Andrea risponde personalmente.
            </p>
            <ContactAndreaForm />
          </section>

        </main>
      </div>

      <SharedPageFooter />
    </div>
  );
}
