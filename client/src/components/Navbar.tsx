/*
 * IDEASMART Navbar — Light Editorial / Tech Magazine
 * Sticky top nav con logo, link canali e CTA newsletter
 * Aggiornato: aggiunto dropdown Canali con tutti i 11 canali
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";

const CHANNELS = [
  { label: "AI4Business", href: "/ai", color: "#00b4a0" },
  { label: "ITsMusic", href: "/music", color: "#7c3aed" },
  { label: "Startup News", href: "/startup", color: "#e84f00" },
  { label: "Finance & Markets", href: "/finance", color: "#16a34a" },
  { label: "Health & Biotech", href: "/health", color: "#0891b2" },
  { label: "Sport & Business", href: "/sport", color: "#dc2626" },
  { label: "Lifestyle & Luxury", href: "/luxury", color: "#b45309" },
  { label: "News Italia", href: "/news", color: "#1a1f2e" },
  { label: "Motori", href: "/motori", color: "#ef4444" },
  { label: "Tennis", href: "/tennis", color: "#65a30d" },
  { label: "Basket", href: "/basket", color: "#ea580c" },
  { label: "Business Gossip", href: "/gossip", color: "#db2777" },
  { label: "Cybersecurity", href: "/cybersecurity", color: "#0ea5e9" },
  { label: "Sondaggi", href: "/sondaggi", color: "#8b5cf6" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = location === "/" || location === "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setChannelsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const homeNavItems = [
    { label: "News", id: "news" },
    { label: "Editoriale", id: "editoriale-dinamico" },
    { label: "Startup", id: "startup-del-giorno" },
    { label: "Reportage", id: "reportage-1" },
    { label: "Analisi", id: "analisi-mercato" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/97 backdrop-blur-md border-b border-gray-200 shadow-md"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: "#1a1f2e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                IDEA<span style={{ color: "#00b4a0" }}>SMART</span>
              </span>
            </Link>
            <span
              className="hidden sm:block text-xs font-mono tracking-widest uppercase"
              style={{ color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}
            >
              AI FOR BUSINESS
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Dropdown Canali */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setChannelsOpen(!channelsOpen)}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100 flex items-center gap-1"
                style={{ color: "#374151", fontFamily: "'DM Sans', sans-serif" }}
              >
                I Canali
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${channelsOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {channelsOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {CHANNELS.map((ch) => (
                    <Link
                      key={ch.href}
                      href={ch.href}
                      onClick={() => setChannelsOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      style={{ color: "#1a1f2e", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                      {ch.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Home scroll items — solo sulla home */}
            {isHome && homeNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100"
                style={{ color: "#374151", fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA + mobile menu */}
          <div className="flex items-center gap-2">
            <Link
              href="/chi-siamo"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-gray-100"
              style={{ color: "#374151", fontFamily: "'DM Sans', sans-serif" }}
            >
              Chi Siamo
            </Link>
            <Link
              href="/business"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 border"
              style={{
                color: "#ff5500",
                borderColor: "#ff550030",
                background: "#fff4f0",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              🚀 Business
            </Link>
            <Link
              href="/advertise"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 border"
              style={{
                color: "#e84f00",
                borderColor: "#e84f0030",
                background: "#fff2ec",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Advertising
            </Link>
            {isHome ? (
              <button
                onClick={() => scrollTo("newsletter")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 text-white"
                style={{ background: "#1a1f2e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Newsletter →
              </button>
            ) : (
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 text-white"
                style={{ background: "#1a1f2e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ← Home
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <div
                className="w-6 h-0.5 mb-1.5 transition-all duration-300 origin-center"
                style={{
                  background: "#1a1f2e",
                  transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
                }}
              />
              <div
                className="w-6 h-0.5 mb-1.5 transition-all duration-300"
                style={{ background: "#1a1f2e", opacity: menuOpen ? 0 : 1 }}
              />
              <div
                className="w-6 h-0.5 transition-all duration-300 origin-center"
                style={{
                  background: "#1a1f2e",
                  transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? "600px" : "0px" }}
        >
          <div className="border-t border-gray-100 py-3 bg-white">
            {/* Sezione canali nel mobile */}
            <p className="px-4 py-1 text-xs font-mono tracking-widest uppercase text-gray-400 mb-1">I Canali</p>
            <div className="grid grid-cols-2 gap-1 px-2 mb-3">
              {CHANNELS.map((ch) => (
                <Link
                  key={ch.href}
                  href={ch.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: "#1a1f2e", fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                  {ch.label}
                </Link>
              ))}
            </div>
            {/* Sezione scroll home (solo se sulla home) */}
            {isHome && (
              <>
                <div className="border-t border-gray-100 my-2" />
                <p className="px-4 py-1 text-xs font-mono tracking-widest uppercase text-gray-400 mb-1">Sezioni</p>
                {homeNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="block w-full text-left px-4 py-3 text-base font-semibold rounded-lg transition-colors hover:bg-gray-50"
                    style={{ color: "#1a1f2e", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {item.label}
                  </button>
                ))}
              </>
            )}
            <div className="border-t border-gray-100 my-2" />
            <Link
              href="/tecnologia"
              className="block w-full text-left px-4 py-3 text-base font-semibold rounded-lg transition-colors hover:bg-gray-50 mb-1"
              style={{ color: "#1a1f2e", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              Tecnologia →
            </Link>
            <Link
              href="/chi-siamo"
              className="block w-full text-left px-4 py-3 text-base font-semibold rounded-lg transition-colors hover:bg-gray-50 mb-1"
              style={{ color: "#1a1f2e", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              Chi Siamo →
            </Link>
            <Link
              href="/business"
              className="block w-full text-left px-4 py-3 text-base font-bold rounded-lg transition-colors mb-1"
              style={{ color: "#ff5500", background: "#fff4f0", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              🚀 IdeaSmart Business →
            </Link>
            <Link
              href="/advertise"
              className="block w-full text-left px-4 py-3 text-base font-bold rounded-lg transition-colors"
              style={{ color: "#e84f00", background: "#fff2ec", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              Advertising →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
