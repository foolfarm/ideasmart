/**
 * PuntoDelGiorno — Sezione Home con le analisi editoriali giornaliere di IDEASMART
 * Mostra i 3 post LinkedIn del giorno: mattino (10:30), pomeriggio (15:00), sera (17:30)
 * Stile: editoriale, carta/inchiostro — autore: Andrea Cinelli, Direttore Responsabile
 */
import { trpc } from "@/lib/trpc";

const INK = "#0a0f1e";
const ACCENT = "#00e5c8";

function formatDateIT(dateLabel: string): string {
  try {
    const [year, month, day] = dateLabel.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateLabel;
  }
}

function PuntoSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 rounded w-1/3" style={{ background: INK + "15" }} />
      <div className="h-6 rounded w-2/3" style={{ background: INK + "20" }} />
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-3 rounded" style={{ background: INK + "10", width: i === 4 ? "60%" : "100%" }} />
        ))}
      </div>
    </div>
  );
}

type PostItem = {
  id: number;
  dateLabel: string;
  slot: string;
  postText: string;
  linkedinUrl: string | null;
  title: string | null;
  section: string;
  imageUrl: string | null;
  hashtags: string | null;
  createdAt: Date;
};

function PostCard({ post, isLoading }: { post?: PostItem; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <PuntoSkeleton />
      </div>
    );
  }
  if (!post) return null;

  const paragraphs = post.postText
    ? post.postText
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
    : [];

  const hashtagLine = paragraphs.findIndex(p => p.startsWith("#") || p.match(/^[📊🔗]/));
  const bodyParagraphs = hashtagLine > 0 ? paragraphs.slice(0, hashtagLine) : paragraphs;
  const hashtagText = post.hashtags || paragraphs.find(p => p.startsWith("#")) || "";

  const slotLabel = post.slot === "morning" ? "10:30" : post.slot === "afternoon" ? "15:00" : "17:30";
  const slotColor = post.slot === "morning" ? "#00b89a" : post.slot === "afternoon" ? "#ff5500" : "#7c3aed";

  return (
    <div
      className="overflow-hidden border-t border-b"
      style={{ borderColor: INK + "20", background: "#faf8f3" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Immagine (se presente) */}
        {post.imageUrl && (
          <div className="md:col-span-1 h-48 md:h-auto overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title ?? "Punto del Giorno"}
              className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-500"
              loading="lazy"
            />
          </div>
        )}

        {/* Contenuto */}
        <div className={`p-6 md:p-8 ${post.imageUrl ? "md:col-span-2" : "md:col-span-3"}`}>
          {/* Firma autore + badge slot */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: ACCENT }}
            >
              AL
            </div>
            <div>
              <p
                className="text-xs font-bold"
                style={{ color: INK, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Andrea Cinelli
              </p>
              <p
                className="text-[10px]"
                style={{ color: INK + "55", fontFamily: "'Space Mono', monospace" }}
              >
                Direttore Responsabile · IDEASMART
              </p>
            </div>
            {/* Badge orario slot */}
            <span
              className="ml-auto px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border"
              style={{
                color: slotColor,
                borderColor: slotColor + "40",
                fontFamily: "'Space Mono', monospace",
                background: slotColor + "08",
              }}
            >
              {slotLabel}
            </span>
            {/* Badge sezione */}
            {post.section && (
              <span
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "#0a6e5c", fontFamily: "'Space Mono', monospace" }}
              >
                {post.section === "ai" ? "AI4Business" : post.section === "startup" ? "Startup" : post.section}
              </span>
            )}
          </div>

          {/* Titolo */}
          {post.title && (
            <h2
              className="text-xl md:text-2xl font-bold leading-tight mb-4"
              style={{ color: INK, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {post.title}
            </h2>
          )}

          {/* Corpo del post — primi 3 paragrafi */}
          <div className="space-y-3">
            {bodyParagraphs.slice(0, 3).map((para, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{ color: INK + "cc", fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {para}
              </p>
            ))}
            {bodyParagraphs.length > 3 && (
              <p
                className="text-sm italic"
                style={{ color: INK + "55", fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                …continua
              </p>
            )}
          </div>

          {/* Footer: hashtags + link LinkedIn */}
          <div className="mt-5 pt-4 border-t flex items-center justify-between gap-4" style={{ borderColor: INK + "12" }}>
            {hashtagText && (
              <p
                className="text-[10px] flex-1 min-w-0 truncate"
                style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {hashtagText.slice(0, 120)}{hashtagText.length > 120 ? "…" : ""}
              </p>
            )}
            {post.linkedinUrl && (
              <a
                href={post.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest hover:underline"
                style={{ color: "#0077b5", fontFamily: "'Space Mono', monospace" }}
              >
                LinkedIn →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PuntoDelGiorno() {
  const { data: posts, isLoading } = trpc.news.getPuntoDelGiornoAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 30, // 30 minuti di cache
    refetchOnWindowFocus: false,
  });

  // Non mostrare nulla se non ci sono dati e non sta caricando
  if (!isLoading && (!posts || posts.length === 0)) return null;

  // Separa i post per slot — ogni slot è unico grazie alla deduplicazione server-side
  const displayMorning = posts?.find(p => p.slot === "morning");
  const displayAfternoon = posts?.find(p => p.slot === "afternoon");
  const displayEvening = posts?.find(p => p.slot === "evening");

  // Data di riferimento (dal post più recente)
  const dateLabel = displayMorning?.dateLabel ?? displayAfternoon?.dateLabel ?? displayEvening?.dateLabel ?? "";

  return (
    <section className="mt-8">
      {/* Header sezione */}
      <div className="w-full border-t-4" style={{ borderColor: INK }} />
      <div className="py-3 flex items-center gap-4">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.25em]"
          style={{ color: "#1a1a2e", fontFamily: "'Space Mono', monospace" }}
        >
          Punto del Giorno
        </span>
        <div className="flex-1 border-t" style={{ borderColor: INK + "20" }} />
        {dateLabel && (
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: INK + "60", fontFamily: "'Space Mono', monospace" }}
          >
            {formatDateIT(dateLabel)}
          </span>
        )}
      </div>

      {/* Post mattino */}
      {(isLoading || displayMorning) && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
              style={{ color: "#00b89a", background: "#00b89a12", fontFamily: "'Space Mono', monospace" }}
            >
              ● Mattino
            </span>
          </div>
          <PostCard post={displayMorning} isLoading={isLoading && !posts} />
        </div>
      )}

      {/* Post pomeriggio (solo se presente) */}
      {displayAfternoon && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
              style={{ color: "#ff5500", background: "#ff550012", fontFamily: "'Space Mono', monospace" }}
            >
              ● Pomeriggio
            </span>
          </div>
          <PostCard post={displayAfternoon} isLoading={false} />
        </div>
      )}

      {/* Post sera (solo se presente) — Vibe Coding / AI / Mercato */}
      {displayEvening && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
              style={{ color: "#7c3aed", background: "#7c3aed12", fontFamily: "'Space Mono', monospace" }}
            >
              ● Sera — Vibe Coding &amp; AI
            </span>
          </div>
          <PostCard post={displayEvening} isLoading={false} />
        </div>
      )}
    </section>
  );
}
