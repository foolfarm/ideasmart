/*
 * DEMO — Sandwich Club News
 * Pagina dimostrativa: notizie estratte da sandwichclub.it
 * presentate nello stile editoriale di IdeaSmart.
 * Accessibile solo via /demo/sandwichclub (fuori menu).
 */
import { useState } from "react";
import { ExternalLink, MapPin, Calendar, ArrowRight, ChevronDown, ChevronUp, Building2, Landmark, Cpu, Coins, Heart, TrendingUp, Globe, Briefcase, MessageCircle, Send, User } from "lucide-react";

/* ─── Dati articoli ──────────────────────────────────────────────────────────── */
interface Article {
  id: number;
  title: string;
  date: string;
  dateISO: string;
  city: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  sourceUrl: string;
  tags: string[];
}

interface Comment {
  id: number;
  articleId: number;
  name: string;
  text: string;
  date: string;
  avatar: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "Tech transfer e venture capital: a Milano un confronto sul futuro dell'innovazione",
    date: "30 Marzo 2026",
    dateISO: "2026-03-30",
    city: "Milano",
    category: "Innovazione",
    excerpt: "Confronto dedicato all'ecosistema dell'innovazione in Italia con focus su tech transfer, venture capital e proprietà intellettuale.",
    content: "Oggi al Sandwich Club di Milano si è tenuto un confronto dedicato all'ecosistema dell'innovazione in Italia. Durante l'incontro sono stati approfonditi temi centrali come tech transfer, venture capital, attrazione degli investimenti, proprietà intellettuale, analisi SWOT e prospettive future del sistema Paese. È stata un'occasione utile per riflettere sui punti di forza e sulle criticità del contesto italiano dell'innovazione, nonché sulle opportunità da sviluppare per rafforzare la connessione tra ricerca, impresa e capitale.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2026/03/gustavozini-milano-2362013_1920-1024x685.jpg",
    sourceUrl: "https://www.sandwichclub.it/2026/03/30/tech-transfer-e-venture-capital-a-milano-un-confronto-sul-futuro-dellinnovazione/",
    tags: ["Tech Transfer", "Venture Capital", "Innovazione", "Milano"],
  },
  {
    id: 2,
    title: "Golden Power: da strumento di difesa a politica industriale attiva",
    date: "24 Febbraio 2026",
    dateISO: "2026-02-24",
    city: "Roma",
    category: "Policy",
    excerpt: "Esperti, imprenditori e rappresentanti istituzionali analizzano l'evoluzione del golden power come leva di politica industriale strategica.",
    content: "Oggi a Roma si è tenuto il Sandwich Club dal titolo \"Golden power da strumento di difesa a politica industriale attiva\", che ha visto la partecipazione di esperti, imprenditori e rappresentanti istituzionali. Siamo in un momento storico in cui la competizione tecnologica, l'energia, i dati e le infrastrutture critiche stanno ridefinendo sia gli equilibri economici sia la sicurezza nazionale. L'incontro è stato caratterizzato da interventi che hanno analizzato l'evoluzione del golden power e la sua trasformazione in una leva sempre più centrale di politica industriale strategica.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2026/02/Depositphotos_354027706_XL-1024x575.jpg",
    sourceUrl: "https://www.sandwichclub.it/2026/02/24/al-sandwich-club-di-roma-si-parla-di-golden-power-da-strumento-di-difesa-a-politica-industriale-attiva/",
    tags: ["Golden Power", "Sicurezza Nazionale", "Policy", "Roma"],
  },
  {
    id: 3,
    title: "Trasformazione digitale al centro del Sandwich Club milanese",
    date: "16 Febbraio 2026",
    dateISO: "2026-02-16",
    city: "Milano",
    category: "AI & Digital",
    excerpt: "L'intelligenza artificiale come leva strategica per la crescita economica e la competitività dell'Europa.",
    content: "Nel Sandwich Club Milanese di oggi è stato affrontato il tema della trasformazione digitale, con un focus sull'intelligenza artificiale come leva strategica per la crescita economica e la competitività dell'Europa, evidenziando un potenziale ancora non pienamente valorizzato. Nonostante l'aumento degli investimenti ICT, permangono divari tra Paesi e rispetto ai principali leader globali. La sfida imminente che pone l'adozione diffusa dell'intelligenza artificiale è l'impatto su produttività, PIL e dinamiche industriali, insieme alle ricadute sul lavoro dove sono richieste nuove competenze, riqualificazione del personale e cambiamenti nei processi organizzativi.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2026/02/ChatGPT-Image-16-feb-2026-14_41_58-1024x683.png",
    sourceUrl: "https://www.sandwichclub.it/2026/02/16/trasformazione-digitale-al-centro-del-sandwich-club-milanese/",
    tags: ["AI", "Trasformazione Digitale", "Europa", "Milano"],
  },
  {
    id: 4,
    title: "From Banks to Blocks: la rivoluzione silenziosa della finanza",
    date: "19 Gennaio 2026",
    dateISO: "2026-01-19",
    city: "Genova",
    category: "Fintech",
    excerpt: "Trasformazione strutturale dei mercati finanziari: dal modello bancario tradizionale a tokenizzazione e smart contract.",
    content: "La ricerca \"From Banks to Blocks – La rivoluzione silenziosa della finanza\" presentata al Sandwich Club di Genova. Il gruppo di lavoro ha affrontato la trasformazione strutturale dei mercati finanziari, dal modello bancario tradizionale basato sugli intermediari a un paradigma fondato su infrastrutture digitali, tokenizzazione e smart contract. È stato analizzato come il passaggio \"from banks to blocks\" modifichi catene del valore, ruoli degli operatori e meccanismi di fiducia. Ampio spazio è stato dedicato al confronto regolatorio tra Unione Europea e Stati Uniti, evidenziando il ruolo del Regolamento MiCA rispetto ai framework statunitensi in evoluzione.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2026/01/genova-6029815_1280-1024x576.jpg",
    sourceUrl: "https://www.sandwichclub.it/2026/01/19/from-banks-to-blocks-la-rivoluzione-silenziosa-della-finanza-la-ricerca-presentata-al-sandwich-club-di-genova/",
    tags: ["Blockchain", "Fintech", "MiCA", "Genova"],
  },
  {
    id: 5,
    title: "THE SANDWICHER: longevità, vivremo più a lungo, ma come?",
    date: "9 Dicembre 2025",
    dateISO: "2025-12-09",
    city: "Pubblicazione",
    category: "Magazine",
    excerpt: "Il nuovo numero di THE SANDWICHER dedicato alla longevità: vivremo più a lungo, ma con quali soldi?",
    content: "È uscito il nuovo numero di THE SANDWICHER dedicato alla longevità! Il tema centrale: VIVREMO PIÙ A LUNGO. MA CON QUALI SOLDI? Questo numero analizza la longevità come la più grande sfida economica e sociale del nostro tempo, esplorando le implicazioni per i sistemi pensionistici, la sanità e il risparmio individuale.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2025/12/THESANDWICHER_AutunnoInverno_2025.png",
    sourceUrl: "https://www.sandwichclub.it/2025/12/09/e-uscito-il-nuovo-numero-di-the-sandwicher-autunno-inverno-2025-longevita-vivremo-piu-a-lungo-ma-come/",
    tags: ["Longevità", "Pensioni", "Sanità", "Magazine"],
  },
  {
    id: 6,
    title: "Comunicazione e fiducia: il vero motore della finanza",
    date: "20 Novembre 2025",
    dateISO: "2025-11-20",
    city: "Milano",
    category: "Finanza",
    excerpt: "Al Finance Day 2025 di Milano, il Sandwich Club affronta il tema della comunicazione e fiducia nel mondo finanziario.",
    content: "Oggi il Sandwich Club si è presentato al Finance Day 2025 di Milano, dove è stato affrontato un tema che, nel mondo della finanza, incide più di qualsiasi analisi tecnica: la comunicazione e la fiducia come vero motore delle relazioni finanziarie e degli investimenti.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2025/11/finance-day.jpg",
    sourceUrl: "https://www.sandwichclub.it/2025/11/20/comunicazione-e-fiducia-il-vero-motore-della-finanza-oggi-al-finance-day-2025-di-milano/",
    tags: ["Finanza", "Comunicazione", "Finance Day", "Milano"],
  },
  {
    id: 7,
    title: "Nuovo Testo Unico della Finanza: incentivi alla quotazione",
    date: "4 Novembre 2025",
    dateISO: "2025-11-04",
    city: "Roma",
    category: "Regolamentazione",
    excerpt: "Confronto su obiettivi e tempi del nuovo Testo Unico della Finanza per rilanciare il mercato degli investimenti.",
    content: "Nel corso dell'ultimo incontro del Sandwich Club, svoltosi a Roma, si è tenuto un approfondimento su obiettivi e tempi del nuovo Testo Unico della Finanza, con focus sugli incentivi alla quotazione per rilanciare il mercato degli investimenti in Italia.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2025/11/rome-231417_1280-400x400.jpg",
    sourceUrl: "https://www.sandwichclub.it/2025/11/04/al-sandwich-club-di-roma-un-confronto-su-obiettivi-e-tempi-del-nuovo-testo-unico-della-finanza-incentivi-alla-quotazione-per-rilanciare-il-mercato-degli-investimenti/",
    tags: ["Testo Unico", "Quotazione", "Investimenti", "Roma"],
  },
  {
    id: 8,
    title: "Mercati finanziari al centro del Sandwich Club di Milano",
    date: "27 Ottobre 2025",
    dateISO: "2025-10-27",
    city: "Milano",
    category: "Mercati",
    excerpt: "Analisi approfondita dei mercati finanziari nel nuovo incontro milanese del Sandwich Club.",
    content: "Si è tenuto oggi a Milano un nuovo incontro del Sandwich Club dedicato all'analisi dei mercati finanziari, con un focus sulle tendenze globali e le opportunità per gli investitori italiani.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2025/10/Milano_Tram-400x400.jpg",
    sourceUrl: "https://www.sandwichclub.it/2025/10/27/mercati-finanziari-al-centro-del-sandwich-club-di-milano/",
    tags: ["Mercati Finanziari", "Investimenti", "Milano"],
  },
  {
    id: 9,
    title: "Il ruolo del governo italiano nelle operazioni di M&A",
    date: "23 Settembre 2025",
    dateISO: "2025-09-23",
    city: "Londra",
    category: "M&A",
    excerpt: "Banks at play: the role of the Italian government in shaping the M&A — tappa londinese del Sandwich Club.",
    content: "\"Banks at play: the role of the Italian government in shaping the M&A\" è il tema affrontato nella tappa londinese del Sandwich Club, esplorando il ruolo strategico del governo italiano nell'accompagnare le operazioni di fusione e acquisizione a livello internazionale.",
    imageUrl: "https://www.sandwichclub.it/wp-content/uploads/2025/09/london-7965770_1280-400x400.jpg",
    sourceUrl: "https://www.sandwichclub.it/2025/09/23/il-ruolo-del-governo-italiano-nellaccompagnare-le-operazioni-di-ma-nella-tappa-londinese-del-sandwich-club/",
    tags: ["M&A", "Governo", "Londra", "Internazionale"],
  },
];

/* ─── Commenti demo pre-popolati ─────────────────────────────────────────────── */
const DEMO_COMMENTS: Comment[] = [
  { id: 1, articleId: 1, name: "Marco Bianchi", text: "Ottimo confronto. Il tech transfer in Italia ha un potenziale enorme, ma serve più connessione tra università e impresa.", date: "30 Mar 2026", avatar: "MB" },
  { id: 2, articleId: 1, name: "Laura Rossi", text: "Finalmente si parla di proprietà intellettuale come asset strategico. Tema cruciale per le startup deep-tech.", date: "30 Mar 2026", avatar: "LR" },
  { id: 3, articleId: 2, name: "Giuseppe Verdi", text: "Il golden power è uno strumento fondamentale, ma va usato con equilibrio per non scoraggiare gli investimenti esteri.", date: "25 Feb 2026", avatar: "GV" },
  { id: 4, articleId: 2, name: "Francesca Neri", text: "Interessante l'analisi sulla trasformazione da difesa a politica industriale attiva. L'Italia deve essere più proattiva.", date: "25 Feb 2026", avatar: "FN" },
  { id: 5, articleId: 3, name: "Alessandro Conti", text: "L'AI è la sfida del decennio. L'Europa deve investire di più in infrastrutture e competenze.", date: "17 Feb 2026", avatar: "AC" },
  { id: 6, articleId: 3, name: "Chiara Moretti", text: "Il gap con USA e Cina si sta allargando. Servono politiche industriali coordinate a livello UE.", date: "17 Feb 2026", avatar: "CM" },
  { id: 7, articleId: 4, name: "Roberto Ferrara", text: "La tokenizzazione cambierà radicalmente il modo in cui pensiamo agli asset finanziari. MiCA è un buon inizio.", date: "20 Gen 2026", avatar: "RF" },
  { id: 8, articleId: 6, name: "Silvia Marchetti", text: "La fiducia è il vero capitale della finanza. Senza comunicazione trasparente, non c'è crescita sostenibile.", date: "21 Nov 2025", avatar: "SM" },
  { id: 9, articleId: 7, name: "Paolo Romano", text: "Il nuovo TUF può essere una svolta per il mercato italiano. Speriamo che i tempi siano rispettati.", date: "5 Nov 2025", avatar: "PR" },
  { id: 10, articleId: 9, name: "Elena Colombo", text: "Il ruolo del governo nelle M&A è sempre più strategico. Bene il confronto internazionale a Londra.", date: "24 Set 2025", avatar: "EC" },
];

const CITIES = ["Tutte", "Milano", "Roma", "Genova", "Londra", "Pubblicazione"];

function getCategoryIcon(category: string) {
  switch (category) {
    case "Innovazione": return <TrendingUp className="w-4 h-4" />;
    case "Policy": return <Landmark className="w-4 h-4" />;
    case "AI & Digital": return <Cpu className="w-4 h-4" />;
    case "Fintech": return <Coins className="w-4 h-4" />;
    case "Magazine": return <Heart className="w-4 h-4" />;
    case "Finanza": return <Building2 className="w-4 h-4" />;
    case "Regolamentazione": return <Landmark className="w-4 h-4" />;
    case "Mercati": return <TrendingUp className="w-4 h-4" />;
    case "M&A": return <Briefcase className="w-4 h-4" />;
    default: return <Globe className="w-4 h-4" />;
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Innovazione": return "bg-emerald-600";
    case "Policy": return "bg-amber-600";
    case "AI & Digital": return "bg-cyan-600";
    case "Fintech": return "bg-violet-600";
    case "Magazine": return "bg-rose-600";
    case "Finanza": return "bg-blue-600";
    case "Regolamentazione": return "bg-orange-600";
    case "Mercati": return "bg-indigo-600";
    case "M&A": return "bg-slate-700";
    default: return "bg-gray-600";
  }
}

/* ─── Componente Commenti ────────────────────────────────────────────────────── */
function ArticleComments({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>(
    DEMO_COMMENTS.filter(c => c.articleId === articleId)
  );
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      articleId,
      name: name.trim(),
      text: text.trim(),
      date: "Adesso",
      avatar: name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
    };
    setComments(prev => [...prev, newComment]);
    setName("");
    setText("");
    setShowForm(false);
  };

  return (
    <div className="mt-6 pt-6 border-t border-[#1a1a1a]/10">
      {/* Intestazione commenti */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#1a1a1a]/40" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#1a1a1a]/60">
            Commenti ({comments.length})
          </span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[10px] tracking-[0.15em] uppercase font-semibold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            <Send className="w-3 h-3" /> Commenta
          </button>
        )}
      </div>

      {/* Lista commenti */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a]/10 flex items-center justify-center">
                <span className="text-[9px] font-bold text-[#1a1a1a]/50">{comment.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#1a1a1a]">{comment.name}</span>
                  <span className="text-[10px] text-[#1a1a1a]/30">{comment.date}</span>
                </div>
                <p className="text-sm text-[#1a1a1a]/70 leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && !showForm && (
        <p className="text-xs text-[#1a1a1a]/30 italic mb-4">Nessun commento. Sii il primo a commentare.</p>
      )}

      {/* Form nuovo commento */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#1a1a1a]/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center">
              <User className="w-4 h-4 text-[#1a1a1a]/30" />
            </div>
            <input
              type="text"
              placeholder="Il tuo nome"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 text-sm border-b border-[#1a1a1a]/10 pb-1 bg-transparent outline-none focus:border-red-600 transition-colors placeholder:text-[#1a1a1a]/25"
            />
          </div>
          <textarea
            placeholder="Scrivi un commento..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            className="w-full text-sm border border-[#1a1a1a]/10 rounded-md p-3 bg-transparent outline-none focus:border-red-600 transition-colors placeholder:text-[#1a1a1a]/25 resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[10px] tracking-[0.15em] uppercase text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !text.trim()}
              className="bg-[#1a1a1a] text-white text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" /> Pubblica
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ─── Componente principale ──────────────────────────────────────────────────── */
export default function DemoSandwichClub() {
  const [selectedCity, setSelectedCity] = useState("Tutte");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = selectedCity === "Tutte"
    ? ARTICLES
    : ARTICLES.filter(a => a.city === selectedCity);

  const featured = ARTICLES[0]; // Articolo più recente in evidenza

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      {/* ─── Header con Powered by ──────────────────────────────────────── */}
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">Demo</span>
            <span className="text-[10px] text-white/30">|</span>
            <a
              href="/"
              className="text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors"
            >
              Powered by <span className="text-red-500 font-semibold">IdeaSmart</span> HumanLess Journalism
            </a>
          </div>
          <a href="/" className="text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors">
            Torna a IdeaSmart
          </a>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="border-b-2 border-[#1a1a1a]">
        <div className="max-w-[1200px] mx-auto px-4 py-10 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#1a1a1a]/50 mb-3">Private Business Club</p>
          <h1 className="font-['Space_Grotesk',sans-serif] text-5xl md:text-7xl font-bold tracking-tight text-[#1a1a1a] mb-4">
            SANDWICH CLUB
          </h1>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#1a1a1a]/60 mb-2">
            Comunità, confronto e visione globale con radici locali
          </p>
          <p className="text-sm text-[#1a1a1a]/50 italic max-w-xl mx-auto">
            I Sandwich Clubbers credono nelle comunità quali pilastro e propulsore della Società
          </p>
        </div>
      </section>

      {/* ─── Barra filtri per città ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#1a1a1a]/10 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase whitespace-nowrap rounded-full transition-all ${
                  selectedCity === city
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/5 hover:text-[#1a1a1a]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {city}
                </span>
              </button>
            ))}
            <div className="ml-auto pl-4 text-xs text-[#1a1a1a]/40">
              {filtered.length} articol{filtered.length === 1 ? "o" : "i"}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Articolo in evidenza ────────────────────────────────────────── */}
      {selectedCity === "Tutte" && (
        <section className="max-w-[1200px] mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-8 h-[2px] bg-red-600" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-red-600">In evidenza</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-lg group">
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="w-full h-[350px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <span className={`${getCategoryColor(featured.category)} text-white text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full flex items-center gap-1.5`}>
                  {getCategoryIcon(featured.category)}
                  {featured.category}
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4 text-xs text-[#1a1a1a]/50">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{featured.city}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{featured.date}</span>
              </div>
              <h2 className="font-['Space_Grotesk',sans-serif] text-2xl md:text-3xl font-bold text-[#1a1a1a] leading-tight mb-4">
                {featured.title}
              </h2>
              <p className="text-[#1a1a1a]/70 leading-relaxed mb-6">
                {featured.content}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {featured.tags.map(tag => (
                  <span key={tag} className="text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 border border-[#1a1a1a]/15 rounded-full text-[#1a1a1a]/60">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={featured.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold text-[#1a1a1a] hover:text-red-600 transition-colors"
              >
                Leggi su Sandwich Club <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─── Griglia articoli ────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-8 h-[2px] bg-[#1a1a1a]" />
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#1a1a1a]">
            {selectedCity === "Tutte" ? "Tutti gli incontri" : `Incontri a ${selectedCity}`}
          </span>
        </div>

        <div className="space-y-0">
          {filtered.map((article, idx) => {
            const isExpanded = expandedId === article.id;
            return (
              <article
                key={article.id}
                className={`border-t border-[#1a1a1a]/10 ${idx === filtered.length - 1 ? "border-b" : ""}`}
              >
                <div
                  className="py-6 cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : article.id)}
                >
                  <div className="flex items-start gap-6">
                    {/* Numero */}
                    <div className="hidden md:flex flex-shrink-0 w-10 h-10 items-center justify-center">
                      <span className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-[#1a1a1a]/10">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Contenuto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`${getCategoryColor(article.category)} text-white text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full flex items-center gap-1`}>
                          {getCategoryIcon(article.category)}
                          {article.category}
                        </span>
                        <span className="text-[10px] text-[#1a1a1a]/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{article.city}
                        </span>
                        <span className="text-[10px] text-[#1a1a1a]/40">{article.date}</span>
                        {/* Contatore commenti */}
                        {DEMO_COMMENTS.filter(c => c.articleId === article.id).length > 0 && (
                          <span className="text-[10px] text-[#1a1a1a]/40 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {DEMO_COMMENTS.filter(c => c.articleId === article.id).length}
                          </span>
                        )}
                      </div>
                      <h3 className="font-['Space_Grotesk',sans-serif] text-lg font-bold text-[#1a1a1a] group-hover:text-red-600 transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[#1a1a1a]/60 mt-1 line-clamp-1">{article.excerpt}</p>
                    </div>

                    {/* Immagine miniatura */}
                    <div className="hidden lg:block flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt=""
                        className="w-24 h-16 object-cover rounded"
                      />
                    </div>

                    {/* Chevron */}
                    <div className="flex-shrink-0 pt-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#1a1a1a]/30" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#1a1a1a]/30" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenuto espanso + Commenti */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-[1200px] opacity-100 pb-6" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pl-0 md:pl-16">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[#1a1a1a]/70 leading-relaxed mb-4">{article.content}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map(tag => (
                            <span key={tag} className="text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border border-[#1a1a1a]/15 rounded-full text-[#1a1a1a]/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold text-red-600 hover:text-red-700 transition-colors"
                        >
                          Leggi l'articolo completo <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Sezione commenti */}
                    <ArticleComments articleId={article.id} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#1a1a1a]/40 text-sm">Nessun articolo trovato per questa città.</p>
          </div>
        )}
      </section>

      {/* ─── Statistiche ─────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-['Space_Grotesk',sans-serif] text-3xl font-bold">5</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">Città</p>
            </div>
            <div>
              <p className="font-['Space_Grotesk',sans-serif] text-3xl font-bold">9</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">Incontri</p>
            </div>
            <div>
              <p className="font-['Space_Grotesk',sans-serif] text-3xl font-bold">7</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">Temi trattati</p>
            </div>
            <div>
              <p className="font-['Space_Grotesk',sans-serif] text-3xl font-bold">1</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/50 mt-1">Magazine</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#1a1a1a]/40 mb-4">Questa è una demo</p>
        <h2 className="font-['Space_Grotesk',sans-serif] text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-4">
          Vuoi una pagina come questa per la tua testata?
        </h2>
        <p className="text-[#1a1a1a]/60 max-w-lg mx-auto mb-8">
          IdeaSmart crea redazioni AI personalizzate che monitorano, analizzano e pubblicano notizie automaticamente — come questa pagina, ma aggiornata in tempo reale.
        </p>
        <a
          href="/offertacommerciale"
          className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold hover:bg-red-600 transition-colors"
        >
          Scopri l'offerta <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* ─── Footer con Powered by ───────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a]/10 py-6">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-[#1a1a1a]/40">
            <p>Demo generata da IdeaSmart — Contenuti estratti da sandwichclub.it</p>
            <div className="flex items-center gap-4">
              <a href="https://www.sandwichclub.it/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition-colors">
                sandwichclub.it
              </a>
              <a href="/" className="hover:text-[#1a1a1a] transition-colors">
                ideasmart.ai
              </a>
            </div>
          </div>
          {/* Badge Powered by */}
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]/5 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 transition-colors"
            >
              Powered by <span className="font-bold text-[#1a1a1a]/50">IdeaSmart</span>
              <span className="text-red-500">HumanLess Journalism</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
