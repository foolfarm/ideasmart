/*
 * IDEASMART Home Page — Light Editorial / Tech Magazine
 * Design: White (#fafafa) + Slate (#1a1f2e) + Teal (#00b4a0) + Orange (#e84f00)
 * Typography: Space Grotesk (display) + DM Sans (body) + JetBrains Mono (mono)
 * Layout: Asymmetric editorial with numbered sections
 */
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import AdUnit from "@/components/AdUnit";
import CommentSection from "@/components/CommentSection";
import SocialShare from "@/components/SocialShare";
import SEOHead from "@/components/SEOHead";

// ─── Image URLs (CDN) ────────────────────────────────────────────────────────
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_hero-6ZrdwCga3BYZbueso82C5j.webp";
const FOOLTALENT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_fooltalent-2nEN4eE9YHfFBW4qWKwTVs.webp";
const FOOLSHARE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_foolshare-UYNVhRWFTa6cBhUyxxwkEK.webp";
const FRAGMENTALIS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_fragmentalis-WqVpGnPxQvhf6bevxs5m6m.webp";
const POLLCAST_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ideasmart_pollcast-gLGMN8iojcFU6EWceVzvo5.webp";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  teal: "#00b4a0",
  tealLight: "#e6f7f5",
  orange: "#e84f00",
  orangeLight: "#fff2ec",
  blue: "#1a56db",
  blueLight: "#eff4ff",
  navy: "#1a1f2e",
  slate: "#374151",     /* aumentato contrasto: era #4b5563 */
  muted: "#6b7280",     /* aumentato contrasto: era #9ca3af — ora WCAG AA */
  border: "#d1d5db",   /* bordi leggermente più visibili */
  surface1: "#f8f9fc",
  surface2: "#f1f3f8",
};

// ─── Animation helpers ───────────────────────────────────────────────────────
// ─── Cookie Preferences Link (footer) ───────────────────────────────────────
function CookiePreferencesLink() {
  const { resetConsent } = useCookieConsent();
  return (
    <button
      onClick={resetConsent}
      className="text-sm transition-colors bg-transparent border-none p-0 cursor-pointer"
      style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}
      onMouseEnter={e => (e.currentTarget.style.color = C.teal)}
      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
    >
      Gestisci preferenze cookie
    </button>
  );
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function PollBar({ label, category, percentage, votes, color, bgColor }: {
  label: string; category: string; percentage: number; votes: number; color: string; bgColor: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="rounded-xl p-4 border transition-all hover:shadow-sm" style={{ borderColor: C.border, background: "#fff" }}>
      <p className="editorial-tag mb-2" style={{ color }}>{category}</p>
      <p className="text-sm font-semibold mb-3 leading-snug" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </p>
      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: bgColor }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-xs font-bold" style={{ color }}>{percentage}% Sì</span>
        <span className="text-xs" style={{ color: C.muted }}>{votes.toLocaleString()} voti</span>
      </div>
    </div>
  );
}

// ─── Feature check item ──────────────────────────────────────────────────────
function FeatureItem({ text, color, bgColor }: { text: string; color: string; bgColor: string }) {
  return (
    <div className="flex items-start gap-3 py-3 feature-item">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: bgColor }}
      >
        <span className="text-xs font-bold" style={{ color }}>✓</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: C.slate }}>{text}</p>
    </div>
  );
}

// ─── Stat block ─────────────────────────────────────────────────────────────
function StatBlock({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center p-4 rounded-xl stat-block">
      <div className="text-3xl font-black mb-1" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      <div className="editorial-tag" style={{ color: C.muted }}>{label}</div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ number, category, categoryColor, title, titleColor }: {
  number: string; category: string; categoryColor: string; title: string; titleColor?: string;
}) {
  return (
    <>
      <div className="border-b" style={{ borderColor: C.border, background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="editorial-tag" style={{ color: C.muted }}>{number} —</span>
          <span className="editorial-tag" style={{ color: categoryColor }}>{category}</span>
        </div>
      </div>
      <div className="border-b-2" style={{ borderColor: categoryColor, background: `${categoryColor}08` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h2
            className="text-3xl sm:text-4xl font-black leading-tight"
            style={{ color: titleColor || C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h2>
        </div>
      </div>
    </>
  );
}

// ─── NewsGrid Component (dynamic, reads from DB via tRPC) ──────────────────
const NEWS_COLORS = [
  { color: C.teal, bg: C.tealLight },
  { color: C.orange, bg: C.orangeLight },
  { color: C.blue, bg: C.blueLight },
];

function NewsGrid() {
  const { data: newsData, isLoading } = trpc.news.getLatest.useQuery({ limit: 20 });

  const fallbackNews = [
    { id: 1, title: "OpenAI lancia GPT-5.3 Instant: -26.8% di allucinazioni", summary: "Il modello più usato di OpenAI riceve un aggiornamento che riduce le allucinazioni del 26,8% sulle query web.", category: "Modelli Generativi", sourceUrl: "https://venturebeat.com", sourceName: "VentureBeat" },
    { id: 2, title: "Anthropic vs. Pentagono: Claude rifiuta le richieste militari", summary: "Anthropic entra in rotta di collisione con il Dipartimento della Difesa USA dopo aver rifiutato di adattare Claude per usi militari.", category: "AI & Difesa", sourceUrl: "https://cbsnews.com", sourceName: "CBS News" },
    { id: 3, title: "Agentic AI: nel 2026 il 40% delle app aziendali sarà AI-driven", summary: "Il report Deloitte certifica che le aziende stanno deployando agenti AI autonomi su funzioni critiche.", category: "AI Agentiva", sourceUrl: "https://deloitte.com", sourceName: "Deloitte" },
    { id: 4, title: "Google lancia Flash-Lite: Gemini 3.1 punta sull'enterprise scale", summary: "Google risponde a OpenAI con Flash-Lite, la versione enterprise di Gemini 3.1 ottimizzata per carichi di lavoro su scala.", category: "Big Tech", sourceUrl: "https://google.com", sourceName: "Google Blog" },
    { id: 5, title: "La Cina accelera: robot umanoidi e agenti AI nelle fabbriche", summary: "I leader tech cinesi chiedono di accelerare l'adozione industriale di robot umanoidi. Obiettivo: produzione di massa entro il 2027.", category: "Robot & AI Fisica", sourceUrl: "https://scmp.com", sourceName: "SCMP" },
    { id: 6, title: "Anthropic raggiunge $20 miliardi di revenue run rate", summary: "Anthropic supera i 20 miliardi di dollari di revenue run rate, trainata da Claude Code.", category: "Startup & Funding", sourceUrl: "https://anthropic.com", sourceName: "Analisi Finanziaria" },
    { id: 7, title: "Qualcomm al MWC 2026: l'AI ibrida arriva su ogni dispositivo", summary: "Qualcomm annuncia la nuova generazione Snapdragon con AI ibrida on-device/cloud per smartphone.", category: "AI & Hardware", sourceUrl: "https://qualcomm.com", sourceName: "La Repubblica" },
    { id: 8, title: "Deep Tech Revolution: 5 startup italiane ricevono €200k ciascuna", summary: "Il programma seleziona 5 startup italiane che riceveranno 200.000 euro ciascuna per sviluppare tecnologie deep tech con AI.", category: "AI & Startup Italiane", sourceUrl: "https://ilmessaggero.it", sourceName: "Il Messaggero" },
    { id: 9, title: "Call4Innovit 2026: startup italiane a Silicon Valley a fondo perduto", summary: "Innovit lancia il programma di accelerazione gratuito per portare startup e PMI italiane nella Silicon Valley.", category: "Internazionalizzazione", sourceUrl: "https://innovit.it", sourceName: "Incentivi Impresa" },
    { id: 10, title: "MIT Sloan: 'L'AI agentiva non è ancora pronta per il prime time'", summary: "Il MIT Sloan pubblica le action items per i decision maker AI nel 2026: l'AI agentiva è promettente ma instabile.", category: "Ricerca & Innovazione", sourceUrl: "https://mitsloan.mit.edu", sourceName: "MIT Sloan" },
    { id: 11, title: "EU AI Act: prime restrizioni per i sistemi ad alto rischio", summary: "L'UE attiva le prime disposizioni vincolanti dell'AI Act. Le aziende hanno 12 mesi per adeguarsi.", category: "Regolamentazione AI", sourceUrl: "https://ec.europa.eu", sourceName: "Il Sole 24 Ore" },
    { id: 12, title: "DeepMind: AlphaFold 3 accelera la scoperta di farmaci oncologici", summary: "AlphaFold 3 applicato alla ricerca oncologica: identificati 47 nuovi target proteici per terapie contro il cancro.", category: "AI & Salute", sourceUrl: "https://deepmind.google", sourceName: "Nature Medicine" },
    { id: 13, title: "BlackRock integra AI generativa nei portafogli: +12% di alpha", summary: "Il più grande gestore patrimoniale al mondo annuncia l'integrazione di modelli AI generativi nella gestione attiva.", category: "AI & Finanza", sourceUrl: "https://blackrock.com", sourceName: "Financial Times" },
    { id: 14, title: "Meta lancia Llama 4: open source e multimodale, sfida GPT-5", summary: "Meta rilascia Llama 4 con capacità multimodali avanzate e licenza open source commerciale. 405 miliardi di parametri.", category: "Modelli Generativi", sourceUrl: "https://ai.meta.com", sourceName: "TechCrunch" },
    { id: 15, title: "WEF: l'AI creerà 97 milioni di nuovi posti di lavoro entro il 2028", summary: "Il report WEF 2026 ribalta la narrativa: l'AI non distrugge lavoro, lo trasforma. Il 65% dei lavori del 2030 non esiste ancora.", category: "AI & Lavoro", sourceUrl: "https://weforum.org", sourceName: "World Economic Forum" },
    { id: 16, title: "CDP Venture Capital: €500M per startup AI italiane nel 2026", summary: "CDP Venture Capital annuncia un fondo dedicato da 500 milioni di euro per startup AI italiane.", category: "AI & Startup Italiane", sourceUrl: "https://cdpventurecapital.it", sourceName: "Corriere della Sera" },
    { id: 17, title: "Microsoft Copilot+ PC: l'AI on-device conquista il 30% del mercato", summary: "I PC con chip NPU dedicati all'AI raggiungono il 30% delle vendite enterprise in Europa.", category: "Big Tech", sourceUrl: "https://microsoft.com", sourceName: "IDC Research" },
    { id: 18, title: "Stanford HAI: l'Italia sale al 7° posto nell'AI Index 2026", summary: "L'AI Index 2026 di Stanford: l'Italia guadagna 3 posizioni, trainata dalla crescita di startup AI.", category: "Ricerca & Innovazione", sourceUrl: "https://aiindex.stanford.edu", sourceName: "Stanford HAI" },
    { id: 19, title: "Salesforce Agentforce 2.0: agenti AI autonomi per il CRM enterprise", summary: "Salesforce lancia Agentforce 2.0 con agenti AI che gestiscono autonomamente pipeline di vendita e supporto clienti.", category: "AI Agentiva", sourceUrl: "https://salesforce.com", sourceName: "Salesforce Blog" },
    { id: 20, title: "Gartner: il 45% delle violazioni dati nel 2026 coinvolge sistemi AI", summary: "Quasi la metà delle violazioni dati aziendali nel 2026 ha come vettore un sistema AI mal configurato.", category: "AI & Sicurezza", sourceUrl: "https://gartner.com", sourceName: "Gartner" },
  ];

  const items = (newsData ?? []) as Array<{
    id: number; title: string; summary: string; category: string; sourceUrl: string; sourceName: string; imageUrl?: string | null;
  }>;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="news-card p-5 animate-pulse" style={{ height: '120px' }}>
            <div className="h-3 rounded mb-3" style={{ background: C.surface2, width: "40%" }} />
            <div className="h-4 rounded mb-2" style={{ background: C.surface2, width: "90%" }} />
            <div className="h-3 rounded" style={{ background: C.surface2, width: "70%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: C.muted }}>
        <p className="text-lg font-semibold mb-2">Notizie in aggiornamento...</p>
        <p className="text-sm">I contenuti verranno caricati a breve.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.slice(0, 20).map((item, i) => {
        const colorSet = NEWS_COLORS[i % NEWS_COLORS.length];
        const num = String(i + 1).padStart(2, "0");
        return (
          <FadeUp key={item.id} delay={i * 0.03}>
            <div className="news-card group">
              {/* Layout: immagine sopra su mobile, affiancata su sm+ */}
              <div className="flex flex-col sm:flex-row gap-0">
                {/* Immagine — sopra su mobile, a sinistra su desktop */}
                <a
                  href={`/ai/news/${item.id}`}
                  className="flex-shrink-0 w-full sm:w-44 relative overflow-hidden rounded-t-xl sm:rounded-t-none sm:rounded-l-xl"
                  style={{ height: "180px", minHeight: "180px" }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ position: "absolute", inset: 0 }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${colorSet.bg} 0%, ${colorSet.color}20 100%)`, position: "absolute", inset: 0 }}
                    >
                      <span className="text-4xl font-black opacity-30" style={{ color: colorSet.color, fontFamily: "'Space Grotesk', sans-serif" }}>{num}</span>
                    </div>
                  )}
                </a>

                {/* Contenuto */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col min-w-0">
                  {/* Numero + categoria */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="editorial-tag flex-shrink-0" style={{ color: C.muted }}>{num}</span>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ background: colorSet.bg, color: colorSet.color }}
                    >
                      {item.category}
                    </span>
                  </div>

                  {/* Titolo + sommario */}
                  <a href={`/ai/news/${item.id}`} className="flex-1">
                    <h3
                      className="text-lg sm:text-xl font-bold leading-snug mb-2 transition-colors hover:text-[#00b4a0]"
                      style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed line-clamp-3" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                      {item.summary}
                    </p>
                  </a>

                  {/* Footer: fonte + condivisione */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
                    <span className="text-sm font-medium" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>{item.sourceName}</span>
                    <SocialShare
                      title={item.title + ' — via AI4Business News by IDEASMART'}
                      url={item.sourceUrl || undefined}
                      accentColor="cyan"
                      compact
                    />
                  </div>
                  {/* Sezione commenti */}
                  <CommentSection
                    section="ai"
                    articleType="news"
                    articleId={item.id}
                    accentColor="cyan"
                  />
                </div>
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}
// ─── Daily Editorial Section (dinamica, legge dal DB) ───────────────────────────────────────────────────────────────────────────────
function DailyEditorialSection() {
  const { data: editorial, isLoading } = trpc.editorial.getLatest.useQuery({ section: 'ai' });
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: 'ai' });

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Paragrafi dal corpo dell'editoriale
  const paragraphs = editorial?.body
    ? editorial.body.split(/\n+/).filter(p => p.trim().length > 0)
    : [];

  return (
    <section id="editoriale-dinamico" className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeUp>
          <div className="flex items-center gap-3 mb-4">
            <p className="editorial-tag" style={{ color: C.teal }}>◆ Editoriale del Giorno</p>
            <span className="editorial-tag" style={{ color: C.muted }}>|</span>
            <p className="editorial-tag capitalize" style={{ color: C.muted }}>{today}</p>
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 rounded mb-3" style={{ background: C.surface2, width: "70%" }} />
              <div className="h-5 rounded mb-8" style={{ background: C.surface2, width: "50%" }} />
            </div>
          ) : (
            <>
              <h2
                className="text-3xl sm:text-4xl font-black leading-tight mb-3 max-w-3xl"
                style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {editorial?.title ?? "L'AI italiana non è un fenomeno di nicchia."}
              </h2>
              {editorial?.subtitle && (
                <p className="text-lg font-medium mb-8" style={{ color: C.teal, fontFamily: "'DM Sans', sans-serif" }}>
                  {editorial.subtitle}
                </p>
              )}
              {editorial?.keyTrend && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ background: C.tealLight }}>
                  <span className="text-xs font-bold" style={{ color: C.teal }}>TREND DEL GIORNO</span>
                  <span className="text-xs font-semibold" style={{ color: C.navy }}>{editorial.keyTrend}</span>
                </div>
              )}
            </>
          )}
        </FadeUp>

        <div className="grid lg:grid-cols-3 gap-12">
          <FadeUp delay={0.1} className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-16 rounded" style={{ background: C.surface2 }} />)}
              </div>
            ) : (
              <div className="space-y-5 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {paragraphs.length > 0
                  ? paragraphs.map((p, i) => (
                      <p key={i} className="text-base sm:text-lg" style={{ color: C.slate }}>{p}</p>
                    ))
                  : (
                    <p className="text-base sm:text-lg" style={{ color: C.slate }}>
                      Dove sta succedendo davvero qualcosa di interessante nell'ecosistema AI italiano?
                      Non nei comunicati stampa, non nei convegni, ma nei prodotti concreti che le aziende
                      usano ogni giorno per assumere, proteggere dati, comunicare e prendere decisioni.
                    </p>
                  )
                }
                {editorial?.authorNote && (
                  <blockquote
                    className="border-l-4 pl-4 py-2 mt-6 italic text-base"
                    style={{ borderColor: C.teal, color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {editorial.authorNote}
                  </blockquote>
                )}
              </div>
            )}

            {/* Firma */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t" style={{ borderColor: C.border }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 text-white"
                style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.blue})` }}
              >
                IS
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                  La Redazione IDEASMART
                </p>
                <p className="text-sm" style={{ color: C.muted }}>Startup di Tecnologia &amp; Innovazione — AI for Business</p>
              </div>
            </div>
          </FadeUp>

          {/* Indice sezioni */}
          <FadeUp delay={0.2}>
            {editorial?.imageUrl && (
              <div className="w-full h-48 rounded-2xl overflow-hidden mb-4">
                <img
                  src={editorial.imageUrl}
                  alt={editorial.title ?? "Editoriale del giorno"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="rounded-2xl p-6 border" style={{ background: "#fff", borderColor: C.border }}>
              <p className="editorial-tag mb-5" style={{ color: C.muted }}>◆ In questo numero</p>
              <div className="space-y-1">
                {(reportageItems && reportageItems.length > 0 ? reportageItems : [
                  { position: 1, sectionNumber: "01", category: "Reportage", headline: "Reportage 1 in arrivo...", id: "reportage-1" },
                  { position: 2, sectionNumber: "02", category: "Analisi", headline: "Reportage 2 in arrivo...", id: "reportage-2" },
                  { position: 3, sectionNumber: "03", category: "Inchiesta", headline: "Reportage 3 in arrivo...", id: "reportage-3" },
                  { position: 4, sectionNumber: "04", category: "Focus", headline: "Reportage 4 in arrivo...", id: "reportage-4" },
                ]).map((item: { position: number; sectionNumber: string; category: string; headline: string }, idx: number) => {
                  const colors = [C.teal, C.blue, C.teal, C.orange];
                  const color = colors[idx % colors.length];
                  const sectionId = `reportage-${item.position}`;
                  return { n: item.sectionNumber, cat: item.category.split(' · ')[0], title: item.headline, id: sectionId, color };
                }).map((item: { n: string; cat: string; title: string; id: string; color: string }) => (
                  <button
                    key={item.id}
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full text-left p-3 rounded-xl transition-colors group"
                    style={{ background: "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surface1)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="flex items-start gap-3">
                      <span className="editorial-tag flex-shrink-0 mt-0.5" style={{ color: C.muted }}>{item.n}</span>
                      <div>
                        <p className="editorial-tag mb-1" style={{ color: item.color }}>{item.cat}</p>
                        <p className="text-sm leading-snug" style={{ color: C.slate }}>{item.title}</p>
                      </div>
                      <span className="ml-auto text-xs flex-shrink-0" style={{ color: item.color }}>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Startup of the Day Section (dinamica, legge dal DB) ───────────────────────────────────────────────────────────────────────────────
function StartupOfDaySection() {
  const { data: startup, isLoading } = trpc.startupOfDay.getLatest.useQuery({ section: 'ai' });

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <section id="startup-del-giorno" className="border-t" style={{ borderColor: C.border, background: "#fff" }}>
      <div className="border-b-2" style={{ borderColor: C.orange, background: `${C.orange}08` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <span className="editorial-tag" style={{ color: C.orange }}>◆ Startup del Giorno</span>
          <span className="editorial-tag" style={{ color: C.muted }}>|</span>
          <span className="editorial-tag capitalize" style={{ color: C.muted }}>{today}</span>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 rounded" style={{ background: C.surface2, width: "40%" }} />
            <div className="h-4 rounded" style={{ background: C.surface2, width: "60%" }} />
            <div className="h-32 rounded" style={{ background: C.surface2 }} />
          </div>
        ) : startup ? (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Colonna principale */}
            <FadeUp className="lg:col-span-2">
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar startup */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0 text-white"
                  style={{ background: `linear-gradient(135deg, ${C.orange}, #ff8c42)` }}
                >
                  {startup.name.charAt(0)}
                </div>
                <div>
                  <h2
                    className="text-3xl sm:text-4xl font-black leading-tight"
                    style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {startup.name}
                  </h2>
                  <p className="text-base font-medium mt-1" style={{ color: C.orange, fontFamily: "'DM Sans', sans-serif" }}>
                    {startup.tagline}
                  </p>
                </div>
              </div>

              {/* Badge info */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: C.orangeLight, color: C.orange }}>
                  {startup.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: C.surface2, color: C.slate }}>
                  🌍 {startup.country}
                </span>
                {startup.foundedYear && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: C.surface2, color: C.slate }}>
                    📅 Fondata {startup.foundedYear}
                  </span>
                )}
                {startup.funding && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: C.blueLight, color: C.blue }}>
                    💰 {startup.funding}
                  </span>
                )}
              </div>

              {/* Descrizione */}
              <div className="space-y-4 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {startup.description.split(/\n+/).filter(p => p.trim()).map((p, i) => (
                  <p key={i} className="text-base sm:text-lg" style={{ color: C.slate }}>{p}</p>
                ))}
              </div>

              {/* Perché oggi */}
              <div className="rounded-xl p-5 border-l-4" style={{ background: C.orangeLight, borderColor: C.orange }}>
                <p className="editorial-tag mb-2" style={{ color: C.orange }}>◆ Perché è rilevante oggi</p>
                <p className="text-base leading-relaxed" style={{ color: C.navy, fontFamily: "'DM Sans', sans-serif" }}>
                  {startup.whyToday}
                </p>
              </div>

              {/* Link */}
              <div className="flex items-center gap-3 mt-6">
                {startup.websiteUrl && (
                  <a
                    href={startup.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: C.orange, color: "#fff" }}
                  >
                    Visita il sito →
                  </a>
                )}
                {startup.linkedinUrl && (
                  <a
                    href={startup.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "#0077b5", color: "#fff" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </FadeUp>

            {/* Score card */}
            <FadeUp delay={0.15}>
              <div className="rounded-2xl p-6 border sticky top-24" style={{ background: C.surface1, borderColor: C.border }}>
                <p className="editorial-tag mb-4" style={{ color: C.muted }}>◆ AI Potential Score</p>
                <div className="text-center mb-6">
                  <div
                    className="text-6xl font-black mb-1"
                    style={{ color: C.orange, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {startup.aiScore}
                  </div>
                  <div className="text-xs" style={{ color: C.muted }}>su 100</div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 rounded-full" style={{ background: C.surface2 }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${startup.aiScore}%`, background: `linear-gradient(90deg, ${C.orange}, #ff8c42)` }}
                    />
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: C.muted }}>Categoria</span>
                    <span className="font-semibold" style={{ color: C.navy }}>{startup.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: C.muted }}>Paese</span>
                    <span className="font-semibold" style={{ color: C.navy }}>{startup.country}</span>
                  </div>
                  {startup.foundedYear && (
                    <div className="flex justify-between">
                      <span style={{ color: C.muted }}>Fondata</span>
                      <span className="font-semibold" style={{ color: C.navy }}>{startup.foundedYear}</span>
                    </div>
                  )}
                  {startup.funding && (
                    <div className="flex justify-between">
                      <span style={{ color: C.muted }}>Funding</span>
                      <span className="font-semibold" style={{ color: C.blue }}>{startup.funding}</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-4 border-t" style={{ borderColor: C.border }}>
                  <p className="text-sm" style={{ color: C.muted }}>Selezionata dalla redazione IDEASMART ogni giorno tramite analisi AI.</p>
                </div>
              </div>
            </FadeUp>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl font-semibold" style={{ color: C.navy }}>Startup del giorno in arrivo...</p>
            <p className="text-base mt-2" style={{ color: C.muted }}>Il nostro sistema AI sta analizzando le startup emergenti. Torna tra poco.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Weekly Reportage Section (dinamica, legge dal DB) ─────────────────────────────────────
const REPORTAGE_COLORS = [
  { color: C.teal, bg: C.tealLight },
  { color: C.blue, bg: C.blueLight },
  { color: C.teal, bg: C.tealLight },
  { color: C.orange, bg: C.orangeLight },
];

function WeeklyReportageSection() {
  const { data: reportageItems, isLoading } = trpc.reportage.getLatestWeek.useQuery({ section: 'ai' });

  const fallback = [
    { id: 1, position: 1, sectionNumber: "01", category: "Reportage · AI & Produttività", startupName: "Caricamento...", headline: "Reportage in arrivo", subheadline: "", bodyText: "", quote: "", feature1: "", feature2: "", feature3: "", feature4: "", stat1Value: "—", stat1Label: "Stat 1", stat2Value: "—", stat2Label: "Stat 2", stat3Value: "—", stat3Label: "Stat 3", ctaLabel: "Scopri di più →", ctaUrl: "#", websiteUrl: "#", weekLabel: "" },
  ];

  const items = (reportageItems && reportageItems.length > 0 ? reportageItems : fallback) as Array<{
    id: number; position: number; sectionNumber: string; category: string; startupName: string;
    headline: string; subheadline: string; bodyText: string; quote: string;
    feature1: string; feature2: string; feature3: string; feature4: string;
    stat1Value: string; stat1Label: string; stat2Value: string; stat2Label: string;
    stat3Value: string; stat3Label: string; ctaLabel: string; ctaUrl: string;
    websiteUrl: string; weekLabel: string; imageUrl?: string | null;
  }>;

  return (
    <>
      {isLoading ? (
        <section className="border-t" style={{ borderColor: C.border, background: "#fff" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="animate-pulse space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-32 rounded" style={{ background: C.surface2 }} />)}
            </div>
          </div>
        </section>
      ) : (
        items.map((item, idx) => {
          const colorSet = REPORTAGE_COLORS[idx % REPORTAGE_COLORS.length];
          const sectionId = `reportage-${item.position}`;
          const features = [item.feature1, item.feature2, item.feature3, item.feature4].filter(Boolean);
          const paragraphs = item.bodyText ? item.bodyText.split(/\n+/).filter(p => p.trim().length > 0) : [];
          return (
            <section key={item.id} id={sectionId} className="border-t" style={{ borderColor: C.border, background: idx % 2 === 0 ? "#fff" : C.surface1 }}>
              <SectionHeader
                number={item.sectionNumber}
                category={item.category}
                categoryColor={colorSet.color}
                title={item.headline}
              />
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  <FadeUp>
                    {item.subheadline && (
                      <p className="text-base font-semibold mb-4" style={{ color: colorSet.color, fontFamily: "'DM Sans', sans-serif" }}>
                        {item.subheadline}
                      </p>
                    )}
                    <div className="space-y-4 leading-relaxed mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {paragraphs.map((p, i) => (
                        <p key={i} className="text-base sm:text-lg" style={{ color: C.slate }}>{p}</p>
                      ))}
                    </div>
                    {item.quote && (
                      <blockquote
                        className="border-l-4 pl-4 py-2 italic text-base mb-6"
                        style={{ borderColor: colorSet.color, color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {item.quote}
                      </blockquote>
                    )}
                    {features.length > 0 && (
                      <div className="divide-y" style={{ borderColor: C.border }}>
                        {features.map((f, i) => (
                          <FeatureItem key={i} text={f} color={colorSet.color} bgColor={colorSet.bg} />
                        ))}
                      </div>
                    )}
                    <div className="mt-6">
                      <a
                        href={item.websiteUrl !== "#" ? item.websiteUrl : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                        style={{ background: colorSet.color, color: "#fff" }}
                      >
                        {item.ctaLabel}
                      </a>
                    </div>
                  </FadeUp>

                  <FadeUp delay={0.15}>
                    {/* Immagine AI */}
                    {item.imageUrl && (
                      <div className="w-full h-52 rounded-2xl overflow-hidden mb-4">
                        <img
                          src={item.imageUrl}
                          alt={item.headline}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {/* Stats card */}
                    <div className="rounded-2xl p-6 border" style={{ background: colorSet.bg, borderColor: `${colorSet.color}30` }}>
                      <p className="editorial-tag mb-4" style={{ color: colorSet.color }}>◆ {item.startupName} in numeri</p>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatBlock value={item.stat1Value} label={item.stat1Label} color={colorSet.color} />
                        <StatBlock value={item.stat2Value} label={item.stat2Label} color={colorSet.color} />
                        <StatBlock value={item.stat3Value} label={item.stat3Label} color={colorSet.color} />
                      </div>
                      <div className="pt-4 border-t" style={{ borderColor: `${colorSet.color}30` }}>
                        <p className="text-sm" style={{ color: C.muted }}>Reportage aggiornato ogni lunedì dalla redazione IDEASMART.</p>
                      </div>
                    </div>
                  </FadeUp>
                </div>
              </div>
            </section>
          );
        })
      )}
    </>
  );
}

// ─── Market Analysis Section ─────────────────────────────────────────────────────────────────────────────────────────────
function MarketAnalysisSection() {
  const { data: analyses, isLoading } = trpc.marketAnalysis.getLatest.useQuery({ section: 'ai' });

  const SOURCES = ["CB Insights", "Sifted", "TechCrunch", "The Information", "Dealroom", "PitchBook"];

  const SOURCE_COLORS: Record<string, string> = {
    "CB Insights": C.teal,
    "Sifted": C.blue,
    "TechCrunch": C.orange,
    "The Information": "#8b5cf6",
    "Dealroom": "#10b981",
    "PitchBook": "#f59e0b",
  };

  return (
    <section className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <FadeUp>
          <div className="flex items-start justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="editorial-tag" style={{ color: C.teal }}>Analisi di Mercato</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: C.tealLight, color: C.teal }}>Aggiornato ogni 7 giorni</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight" style={{ color: C.navy }}>
                Le Ultime Analisi di Mercato
              </h2>
              <p className="mt-3 text-base" style={{ color: C.muted }}>
                Sintesi delle analisi più rilevanti da CB Insights, Sifted, TechCrunch e altri media specializzati AI.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 mt-2">
              {SOURCES.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: `${SOURCE_COLORS[s] ?? C.teal}40`, color: SOURCE_COLORS[s] ?? C.teal, background: `${SOURCE_COLORS[s] ?? C.teal}10` }}>{s}</span>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border animate-pulse" style={{ borderColor: C.border, background: C.surface2, height: 280 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(analyses ?? []).map((item, idx) => {
              const accentColor = [C.teal, C.blue, C.orange, "#8b5cf6"][idx % 4];
              const accentLight = [`${C.teal}15`, `${C.blue}15`, `${C.orange}15`, "#8b5cf615"][idx % 4];
              return (
                <FadeUp key={item.id} delay={idx * 0.08}>
                  <div
                    className="rounded-2xl border p-6 flex flex-col gap-4 h-full hover:shadow-lg transition-shadow"
                    style={{ borderColor: C.border, background: "#fff", borderTop: `3px solid ${accentColor}` }}
                  >
                    {/* Source + Category */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: accentLight, color: accentColor }}>
                        {item.category}
                      </span>
                      <span className="text-xs" style={{ color: C.muted }}>{item.source}</span>
                    </div>

                    {/* Immagine AI */}
                    {(item as { imageUrl?: string | null }).imageUrl && (
                      <div className="w-full h-36 rounded-xl overflow-hidden -mx-0">
                        <img
                          src={(item as { imageUrl?: string | null }).imageUrl!}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-display text-xl font-bold leading-snug" style={{ color: C.navy }}>
                      {item.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-base leading-relaxed flex-1" style={{ color: C.slate }}>
                      {item.summary}
                    </p>

                    {/* Key Data */}
                    {(item.dataPoint1 || item.dataPoint2 || item.dataPoint3) && (
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: `${accentColor}20` }}>
                        {item.dataPoint1 && (
                          <div className="text-center">
                            <p className="text-base font-bold font-mono" style={{ color: accentColor }}>{item.dataPoint1}</p>
                          </div>
                        )}
                        {item.dataPoint2 && (
                          <div className="text-center">
                            <p className="text-base font-bold font-mono" style={{ color: accentColor }}>{item.dataPoint2}</p>
                          </div>
                        )}
                        {item.dataPoint3 && (
                          <div className="text-center">
                            <p className="text-base font-bold font-mono" style={{ color: accentColor }}>{item.dataPoint3}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Insight */}
                    {item.keyInsight && (
                      <blockquote className="text-base italic border-l-2 pl-3" style={{ borderColor: accentColor, color: C.slate }}>
                        "{item.keyInsight}"
                      </blockquote>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: C.border }}>
                      <span className="text-sm" style={{ color: C.muted }}>Fonte: {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: accentColor }}>{item.source}</a> : item.source}</span>
                      <span className="text-sm" style={{ color: C.muted }}>Analisi IDEASMART</span>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────────────────────────────────
export default function AiHome() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { data: reportageItems } = trpc.reportage.getLatestWeek.useQuery({ section: 'ai' });
  const { data: activeSubscriberCount } = trpc.newsletter.getActiveCount.useQuery();

  // SEO gestito da SEOHead

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if ((data as any).alreadySubscribed) {
        toast.info("Sei già iscritto alla newsletter IDEASMART!");
      } else {
        setSubscribed(true);
        toast.success("Iscrizione completata! Benvenuto in IDEASMART.");
      }
    },
    onError: (err) => {
      toast.error("Errore: " + err.message);
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate({ email, name: name || undefined });
    }
  };

  const aiSeoStructuredData = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "AI4Business News",
    "alternateName": "AI4Business",
    "url": "https://www.ideasmart.ai/ai",
    "description": "Il quotidiano italiano sull'intelligenza artificiale per il business. News, analisi di mercato, startup emergenti e reportage aggiornati ogni giorno.",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.ideasmart.ai/favicon.ico"
    },
    "publisher": {
      "@type": "Organization",
      "name": "IDEASMART",
      "url": "https://www.ideasmart.ai"
    },
    "sameAs": [
      "https://www.ideasmart.ai"
    ]
  };

  return (
    <div className="min-h-screen" style={{ background: "#fafafa" }}>
      <SEOHead
        title="AI4Business News — Il Quotidiano Italiano sull'Intelligenza Artificiale"
        description="News, analisi di mercato e startup AI aggiornate ogni giorno. Il tuo punto di riferimento sull'intelligenza artificiale per il business italiano: editoriali, reportage e newsletter settimanale."
        keywords="AI for business, intelligenza artificiale, startup AI italiane, analisi mercato AI, machine learning, LLM, ChatGPT, automazione, innovazione digitale, newsletter AI italiana"
        canonical="https://www.ideasmart.ai/ai"
        ogSiteName="AI4Business News"
        ogType="website"
        robots="index, follow"
        structuredData={aiSeoStructuredData}
      />
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: "#ffffff" }}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Rete neurale AI - Osservatorio sull'Innovazione AI Italiana" className="w-full h-full object-cover opacity-5" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #ffffff 0%, #f0f9f8 60%, #fafafa 100%)` }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-28 pb-14 sm:pb-20">
          <FadeUp>
            {/* Issue badge */}
            <div className="inline-flex flex-wrap items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 rounded-full border" style={{ borderColor: `${C.teal}40`, background: `${C.teal}12` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.teal }} />
              <span className="editorial-tag" style={{ color: C.teal }}>
                Osservatorio sull'Innovazione AI Italiana
              </span>
              <span className="editorial-tag hidden sm:inline" style={{ color: C.muted }}>Aggiornato ogni giorno — {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="editorial-tag sm:hidden" style={{ color: C.muted }}>{new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Main title */}
            <h1
              className="text-4xl sm:text-6xl lg:text-8xl font-black leading-none tracking-tight mb-2 sm:mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.navy }}
            >
              AI4Business <span style={{ color: C.teal }}>News</span>
            </h1>
            <p
              className="text-base sm:text-lg lg:text-xl font-semibold tracking-wide mb-6 sm:mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif", color: C.muted }}
            >
              by <span style={{ color: C.navy, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>IDEA<span style={{ color: C.teal }}>SMART</span></span>
            </p>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mb-8 sm:mb-10" style={{ fontFamily: "'DM Sans', sans-serif", color: C.slate }}>
              <strong style={{ color: C.navy }}>IDEASMART</strong> è il quotidiano di tecnologia e innovazione
              che ogni giorno analizza, testa e seleziona le realtà più promettenti
              dell'ecosistema AI per il business. La nostra redazione porta alla luce
              le soluzioni che stanno ridefinendo il modo di lavorare, investire e crescere.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 sm:gap-8 mb-10">
              {[
                { value: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).toUpperCase(), label: new Date().toLocaleDateString('it-IT', { year: 'numeric' }) },
                { value: "20+", label: "News al giorno" },
                { value: "100%", label: "AI-driven" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                  <span className="text-sm sm:text-base" style={{ color: C.muted }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => document.getElementById("editoriale")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-base font-bold transition-all duration-200 hover:scale-105 text-white"
                style={{ background: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Leggi le ultime news ↓
              </button>
              <button
                onClick={() => document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-base font-semibold transition-all duration-200"
                style={{ border: `1.5px solid ${C.border}`, color: C.slate, fontFamily: "'DM Sans', sans-serif", background: "#fff" }}
              >
                Abbonati alla newsletter →
              </button>
            </div>
          </FadeUp>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: C.muted }}>
          <span className="editorial-tag">SCORRI</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-0.5 h-8 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${C.teal}80, transparent)` }}
          />
        </div>
      </section>

      {/* ── ULTIME NEWS AI (dinamiche dal DB) ──────────────────────────── */}
      <section id="news" className="border-t" style={{ borderColor: C.border, background: "#fff" }}>
        {/* Category bar */}
        <div className="border-b" style={{ borderColor: C.border, background: C.surface1 }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.teal }} />
              <span className="editorial-tag" style={{ color: C.teal }}>◆ Ultime News AI</span>
              <span className="editorial-tag" style={{ color: C.muted }}>Aggiornato ogni giorno</span>
            </div>
            <span className="editorial-tag hidden sm:block" style={{ color: C.muted }}>Selezione editoriale IDEASMART</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
              I 20 eventi AI più significativi della settimana
            </h2>
            <p className="text-base sm:text-lg mb-8" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
              La selezione editoriale di IDEASMART sui fatti che stanno ridefinendo il panorama dell'intelligenza artificiale globale.
            </p>
          </FadeUp>

          <NewsGrid />

          {/* ── ADVERTISING BANNER ──────────────────────────────────────────────────────────────────────────── */}
          <div className="mt-12">
            <div
              className="relative rounded-2xl overflow-hidden border"
              style={{ borderColor: `${C.teal}30`, background: `linear-gradient(135deg, ${C.teal}08 0%, ${C.blue}08 100%)` }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.blue})` }}
                  >
                    <span className="text-white font-black text-lg">AD</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>Spazio Pubblicitario</p>
                    <p className="text-base font-bold" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                      La tua startup AI qui — Raggiungi {activeSubscriberCount ? activeSubscriberCount.toLocaleString("it-IT") : "5.491"} decision maker italiani
                    </p>
                    <p className="text-xs mt-1" style={{ color: C.slate }}>
                      Newsletter settimanale · Sito editoriale · Audience qualificata
                    </p>
                  </div>
                </div>
                <a
                  href="/advertise"
                  className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`, color: "#fff" }}
                >
                  Contattaci →
                </a>
              </div>
              {/* Decorative tag */}
              <div
                className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold"
                style={{ background: `${C.teal}20`, color: C.teal }}
              >
                Advertising
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BANNER ADSENSE 1 — tra News e Editoriale ──────────────────── */}
      <div className="border-t" style={{ borderColor: "#e2e5ed", background: "#f8f9fc" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdUnit
            slot=""
            format="auto"
            label="Pubblicità"
            style={{ margin: "0 auto", maxWidth: "970px" }}
          />
        </div>
      </div>

      {/* ── EDITORIALE DINAMICO ───────────────────────────────────────────────────────────────────────── */}
      <DailyEditorialSection />

      {/* ── STARTUP DEL GIORNO ───────────────────────────────────────────────────────────────────────── */}
      <StartupOfDaySection />

      {/* ── BANNER ADSENSE 2 — tra Startup e Reportage ────────────────── */}
      <div className="border-t" style={{ borderColor: "#e2e5ed", background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdUnit
            slot=""
            format="auto"
            label="Pubblicità"
            style={{ margin: "0 auto", maxWidth: "970px" }}
          />
        </div>
      </div>

      {/* ── REPORTAGE SETTIMANALI DINAMICI ────────────────────────────────────── */}
      <WeeklyReportageSection />

      {/* ── BANNER ADSENSE 3 — tra Reportage e Analisi ────────────────── */}
      <div className="border-t" style={{ borderColor: "#e2e5ed", background: "#f8f9fc" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdUnit
            slot=""
            format="auto"
            label="Pubblicità"
            style={{ margin: "0 auto", maxWidth: "970px" }}
          />
        </div>
      </div>

      {/* ── ANALISI DI MERCATO ──────────────────────────────────────── */}
      <MarketAnalysisSection />

      {/* ── BANNER ADSENSE 4 — prima della Newsletter ─────────────────── */}
      <div className="border-t" style={{ borderColor: "#e2e5ed", background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdUnit
            slot=""
            format="auto"
            label="Pubblicità"
            style={{ margin: "0 auto", maxWidth: "970px" }}
          />
        </div>
      </div>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────────── */}
      <section id="newsletter" style={{ background: C.navy, position: "relative", overflow: "hidden" }}>
        {/* Decorative background elements */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: `radial-gradient(ellipse at top right, ${C.teal}15 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "30%", height: "60%", background: `radial-gradient(ellipse at bottom left, ${C.orange}10 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left column: copy ── */}
            <FadeUp>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border" style={{ borderColor: `${C.teal}40`, background: `${C.teal}15` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.teal }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>Newsletter Gratuita</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-black mb-3 leading-tight" style={{ color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                AI4Business <span style={{ color: C.teal }}>News</span>
              </h2>
              <p className="text-base font-semibold mb-6" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
                by <span style={{ color: "#fff", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>IDEA<span style={{ color: C.teal }}>SMART</span></span>
              </p>

              <p className="text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "'DM Sans', sans-serif" }}>
                Unisciti a oltre <strong style={{ color: "#fff" }}>{activeSubscriberCount ? activeSubscriberCount.toLocaleString("it-IT") : "5.400"} professionisti</strong> che ogni settimana ricevono
                la selezione editoriale AI4Business News: news AI, startup emergenti, analisi di mercato e reportage esclusivi.
              </p>

              {/* What you get */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: "◆", label: "20+ news AI selezionate ogni giorno" },
                  { icon: "◆", label: "Editoriale sui trend AI più rilevanti" },
                  { icon: "◆", label: "Startup del giorno con AI Score" },
                  { icon: "◆", label: "4 reportage su startup italiane ogni settimana" },
                  { icon: "◆", label: "Analisi di mercato da CB Insights, Sifted e altri" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs flex-shrink-0" style={{ color: C.teal }}>✓</span>
                    <span className="text-base" style={{ color: "rgba(255,255,255,0.95)", fontFamily: "'DM Sans', sans-serif" }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Social proof stats */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-2xl font-black" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {activeSubscriberCount ? activeSubscriberCount.toLocaleString("it-IT") : "5.400"}+
                  </div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif" }}>Iscritti attivi</div>
                </div>
                <div>
                  <div className="text-2xl font-black" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>100%</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif" }}>Gratuita</div>
                </div>
                <div>
                  <div className="text-2xl font-black" style={{ color: C.teal, fontFamily: "'Space Grotesk', sans-serif" }}>0</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'DM Sans', sans-serif" }}>Spam</div>
                </div>
              </div>
            </FadeUp>

            {/* ── Right column: form ── */}
            <FadeUp delay={0.15}>
              <div className="rounded-2xl p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.12)`, backdropFilter: "blur(10px)" }}>

                {!subscribed ? (
                  <>
                    <h3 className="text-2xl font-black mb-2" style={{ color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                      Iscriviti gratis
                    </h3>
                    <p className="text-base mb-6" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}>
                      Nessuna carta di credito. Disiscrizione in un click.
                    </p>

                    <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif" }}>Nome</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Il tuo nome"
                          className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all"
                          style={{
                            borderColor: "rgba(255,255,255,0.2)",
                            background: "rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontFamily: "'DM Sans', sans-serif"
                          }}
                          onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.background = "rgba(255,255,255,0.12)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'DM Sans', sans-serif" }}>Email *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="la.tua@email.com"
                          required
                          className="w-full px-4 py-3.5 rounded-xl text-base border focus:outline-none transition-all"
                          style={{
                            borderColor: "rgba(255,255,255,0.2)",
                            background: "rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontFamily: "'DM Sans', sans-serif"
                          }}
                          onFocus={e => { e.target.style.borderColor = C.teal; e.target.style.background = "rgba(255,255,255,0.12)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={subscribeMutation.isPending}
                        className="w-full py-4 rounded-xl text-base font-black transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: C.teal, color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {subscribeMutation.isPending ? "Iscrizione in corso..." : "Iscriviti alla Newsletter →"}
                      </button>
                    </form>

                    <p className="text-xs mt-4 text-center" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
                      Cliccando accetti la nostra Privacy Policy. Nessuno spam, promesso.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${C.teal}20`, border: `2px solid ${C.teal}` }}>
                      <span className="text-2xl" style={{ color: C.teal }}>✓</span>
                    </div>
                    <h3 className="text-2xl font-black mb-2" style={{ color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                      Benvenuto in IDEASMART!
                    </h3>
                    <p className="text-base mb-6" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>
                      Iscrizione confermata. Riceverai la prossima newsletter nella tua inbox.
                    </p>
                    <a
                      href="/notifiche"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border transition-all hover:scale-105"
                      style={{ borderColor: `${C.teal}50`, color: C.teal, background: `${C.teal}15`, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Personalizza le tue preferenze →
                    </a>
                  </div>
                )}

                {/* Personalizza link */}
                {!subscribed && (
                  <div className="mt-5 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                    <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
                      Già iscritto?{" "}
                      <a href="/notifiche" className="underline transition-colors hover:opacity-80" style={{ color: C.teal }}>
                        Gestisci le tue preferenze
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: C.border, background: C.surface1 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="text-2xl font-black mb-2" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
                IDEA<span style={{ color: C.teal }}>SMART</span>
              </div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Startup di Tecnologia &amp; Innovazione</p>
              <p className="text-base leading-relaxed" style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}>
                L'Osservatorio sull'Innovazione AI Italiana. Ogni giorno analizziamo le startup AI
                più promettenti per il business.
              </p>
            </div>

            {/* Reportage della settimana */}
            <div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Reportage della settimana</p>
              <div className="space-y-2">
                {(reportageItems && reportageItems.length > 0 ? reportageItems : [
                  { position: 1, startupName: "Reportage 01", websiteUrl: "#" },
                  { position: 2, startupName: "Reportage 02", websiteUrl: "#" },
                  { position: 3, startupName: "Reportage 03", websiteUrl: "#" },
                  { position: 4, startupName: "Reportage 04", websiteUrl: "#" },
                ]).map((s: { position: number; startupName: string; websiteUrl: string | null }) => (
                  <a
                    key={s.position}
                    href={s.websiteUrl && s.websiteUrl !== "#" ? s.websiteUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-base transition-colors"
                    style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
                  >
                    {s.startupName} →
                  </a>
                ))}
              </div>
            </div>
            {/* Contatti */}
            <div>
              <p className="editorial-tag mb-4" style={{ color: C.muted }}>Contatti</p>
              <a
                href="mailto:info@ideasmart.ai?subject=IDEASMART"
                className="block text-base transition-colors mb-2"
                style={{ color: C.slate, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
              >
                info@ideasmart.ai
              </a>
              <a
                href="/advertise"
                className="block text-base transition-colors"
                style={{ color: C.teal, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
                onMouseLeave={e => (e.currentTarget.style.color = C.teal)}
              >
                Advertising →
              </a>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: C.border }}>
            <p className="text-sm" style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
              © 2026 IDEASMART — Startup di Tecnologia &amp; Innovazione. Tutti i diritti riservati.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/privacy"
                className="text-sm transition-colors"
                style={{ color: C.muted, fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.teal)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >
                Privacy Policy &amp; Disclaimer
              </a>
              <span style={{ color: C.border }}>·</span>
              <CookiePreferencesLink />
              <span style={{ color: C.border }}>·</span>
              <p className="text-sm" style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                AI for Business · Aggiornato il {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
