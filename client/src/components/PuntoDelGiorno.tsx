/**
 * PuntoDelGiorno — Sezione Home che mostra il post LinkedIn giornaliero di Andrea Cinelli
 * Stile: editoriale, carta/inchiostro, con link al post LinkedIn originale
 */
import { trpc } from "@/lib/trpc";

const INK = "#0a0f1e";
const ACCENT = "#00e5c8";
const ACCENT_LIGHT = "#e6fff9";
const LINKEDIN_BLUE = "#0a66c2";

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

export default function PuntoDelGiorno() {
  const { data: post, isLoading } = trpc.news.getPuntoDelGiorno.useQuery(undefined, {
    staleTime: 1000 * 60 * 30, // 30 minuti di cache
    refetchOnWindowFocus: false,
  });

  // Non mostrare nulla se non ci sono dati e non sta caricando
  if (!isLoading && !post) return null;

  // Formatta il testo del post: divide in paragrafi
  const paragraphs = post?.postText
    ? post.postText
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
    : [];

  // Separa l'ultimo paragrafo (hashtags) dal corpo
  const hashtagLine = paragraphs.findIndex(p => p.startsWith("#") || p.match(/^[📊🔗]/));
  const bodyParagraphs = hashtagLine > 0 ? paragraphs.slice(0, hashtagLine) : paragraphs;
  const ctaLine = paragraphs.find(p => p.includes("IDEASMART →") || p.includes("ideasmart.ai"));
  const hashtagText = post?.hashtags || paragraphs.find(p => p.startsWith("#")) || "";

  return (
    <section className="mt-10">
      {/* Header sezione */}
      <div className="w-full border-t-4" style={{ borderColor: INK }} />
      <div className="py-3 flex items-center gap-4">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.25em]"
          style={{ color: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Punto del Giorno
        </span>
        <div className="flex-1 border-t" style={{ borderColor: INK + "20" }} />
        {post?.dateLabel && (
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: INK + "60", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {formatDateIT(post.dateLabel)}
          </span>
        )}
      </div>

      {/* Card principale */}
      <div
        className="rounded-lg overflow-hidden border"
        style={{ borderColor: INK + "15", background: "#fafaf8" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Immagine (se presente) */}
          {post?.imageUrl && (
            <div className="md:col-span-1 h-48 md:h-auto overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title ?? "Punto del Giorno"}
                className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-500"
              />
            </div>
          )}

          {/* Contenuto */}
          <div className={`p-6 md:p-8 ${post?.imageUrl ? "md:col-span-2" : "md:col-span-3"}`}>
            {isLoading ? (
              <PuntoSkeleton />
            ) : (
              <>
                {/* Firma autore */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: LINKEDIN_BLUE }}
                  >
                    AC
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold"
                      style={{ color: INK, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Andrea Cinelli
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: INK + "55", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Founder & CEO FoolFarm · LinkedIn
                    </p>
                  </div>
                  {/* Badge sezione */}
                  {post?.section && (
                    <span
                      className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest"
                      style={{ background: ACCENT_LIGHT, color: "#0a6e5c", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {post.section === "ai" ? "AI4Business" : post.section === "startup" ? "Startup" : post.section}
                    </span>
                  )}
                </div>

                {/* Titolo */}
                {post?.title && (
                  <h2
                    className="text-xl md:text-2xl font-black leading-tight mb-4"
                    style={{ color: INK, fontFamily: "'Space Grotesk', sans-serif" }}
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
                      style={{ color: INK + "cc", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {para}
                    </p>
                  ))}
                  {bodyParagraphs.length > 3 && (
                    <p
                      className="text-sm italic"
                      style={{ color: INK + "55", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      …continua su LinkedIn
                    </p>
                  )}
                </div>

                {/* CTA e hashtags */}
                <div className="mt-5 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ borderColor: INK + "12" }}>
                  {/* Hashtags */}
                  {hashtagText && (
                    <p
                      className="text-[10px] flex-1"
                      style={{ color: LINKEDIN_BLUE, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {hashtagText.slice(0, 120)}{hashtagText.length > 120 ? "…" : ""}
                    </p>
                  )}

                  {/* Link al post LinkedIn */}
                  {post?.linkedinUrl && (
                    <a
                      href={post.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded font-bold text-xs uppercase tracking-widest transition-all hover:opacity-80"
                      style={{
                        background: LINKEDIN_BLUE,
                        color: "#fff",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      Leggi su LinkedIn
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
