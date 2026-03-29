/**
 * ArchiveSection — Sezione Archivio riutilizzabile per tutte le pagine di canale.
 * Mostra le notizie dei giorni precedenti con paginazione "Carica altro".
 * Usa trpc.news.getAll con section + offset per il lazy loading.
 */
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

type Section = 'ai' | 'music' | 'startup' | 'finance' | 'health' | 'sport' | 'luxury' | 'news' | 'motori' | 'tennis' | 'basket' | 'gossip' | 'cybersecurity' | 'sondaggi';

interface ArchiveSectionProps {
  section: Section;
  accentColor: string;
  /** Quante notizie già mostrate nella pagina principale (da saltare nell'archivio) */
  skipCount?: number;
  fontMono?: string;
  fontSerif?: string;
}

const PAGE_SIZE = 12;

export default function ArchiveSection({
  section,
  accentColor,
  skipCount = 10,
  fontMono = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
  fontSerif = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Georgia, serif",
}: ArchiveSectionProps) {
  const [offset, setOffset] = useState(skipCount);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchEnabled, setFetchEnabled] = useState(false);

  const { data, isFetching } = trpc.news.getAll.useQuery(
    { section, offset, limit: PAGE_SIZE },
    { enabled: fetchEnabled }
  );

  // Quando arrivano nuovi dati, appendili alla lista
  useEffect(() => {
    if (!data) return;
    setAllItems(prev => {
      const existingIds = new Set(prev.map((i: any) => i.id));
      const newItems = data.items.filter((i: any) => !existingIds.has(i.id));
      return [...prev, ...newItems];
    });
    if (data.items.length < PAGE_SIZE) setHasMore(false);
    // Disabilita la query dopo aver ricevuto i dati (verrà riabilitata al prossimo click)
    setFetchEnabled(false);
  }, [data]);

  const handleLoadMore = () => {
    if (!isExpanded) setIsExpanded(true);
    // Aggiorna l'offset prima di abilitare la query
    if (allItems.length > 0) {
      setOffset(skipCount + allItems.length);
    }
    setFetchEnabled(true);
  };

  if (!isExpanded && allItems.length === 0) {
    return (
      <div className="mt-8">
        <div className="w-full border-t-4 border-[#1a1a1a]" />
        <div className="py-3 flex items-center gap-4">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: accentColor, fontFamily: fontMono }}
          >
            Archivio
          </span>
          <div className="flex-1 border-t border-[#1a1a1a]/20" />
        </div>
        <div className="py-4">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-2 transition-all hover:opacity-80 disabled:opacity-40"
            style={{
              borderColor: accentColor,
              color: accentColor,
              fontFamily: fontMono,
            }}
          >
            {isFetching ? (
              <><span className="animate-spin inline-block">⟳</span> Caricamento…</>
            ) : (
              <>Sfoglia l&apos;archivio</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="w-full border-t-4 border-[#1a1a1a]" />
      <div className="py-3 flex items-center gap-4">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: accentColor, fontFamily: fontMono }}
        >
          Archivio
        </span>
        <div className="flex-1 border-t border-[#1a1a1a]/20" />
        <span
          className="text-[10px] text-[#1a1a1a]/40"
          style={{ fontFamily: fontMono }}
        >
          {allItems.length} articoli
        </span>
      </div>

      {/* Griglia archivio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
        {allItems.map((item: any, i: number) => (
          <div key={item.id}>
            <div className="py-4">
              {/* Categoria */}
              <p
                className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                style={{ color: accentColor, fontFamily: fontMono }}
              >
                {item.category || section.toUpperCase()}
              </p>
              {/* Titolo */}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:opacity-70 transition-opacity"
              >
                <h3
                  className="text-base font-bold leading-snug text-[#1a1a1a] line-clamp-3"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  {item.title}
                </h3>
              </a>
              {/* Summary */}
              {item.summary && (
                <p
                  className="mt-1 text-xs leading-relaxed text-[#1a1a1a]/60 line-clamp-2"
                  style={{ fontFamily: fontSerif }}
                >
                  {item.summary}
                </p>
              )}
              {/* Meta */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-[#1a1a1a]/40" style={{ fontFamily: fontMono }}>
                  {item.sourceName}
                </span>
                {item.publishedAt && (
                  <>
                    <span className="text-[10px] text-[#1a1a1a]/20">·</span>
                    <span className="text-[10px] text-[#1a1a1a]/40" style={{ fontFamily: fontMono }}>
                      {new Date(item.publishedAt).toLocaleDateString('it-IT', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
            {i < allItems.length - 1 && (
              <div className="w-full border-t border-[#1a1a1a]/10" />
            )}
          </div>
        ))}
      </div>

      {/* Carica altro */}
      {hasMore && (
        <div className="mt-6 pb-4">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest border-2 transition-all hover:opacity-80 disabled:opacity-40"
            style={{
              borderColor: accentColor,
              color: accentColor,
              fontFamily: fontMono,
            }}
          >
            {isFetching ? (
              <><span className="animate-spin inline-block">⟳</span> Caricamento…</>
            ) : (
              <>Carica altri articoli</>
            )}
          </button>
        </div>
      )}

      {!hasMore && allItems.length > 0 && (
        <p className="mt-4 pb-4 text-xs text-[#1a1a1a]/30" style={{ fontFamily: fontMono }}>
          — Fine archivio —
        </p>
      )}
    </div>
  );
}
