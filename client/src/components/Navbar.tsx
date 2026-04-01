/**
 * IDEASMART Navbar — Pivot Research Edition
 * Solo 2 canali attivi: AI NEWS e STARTUP NEWS
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";

const CHANNELS = [
  { label: "AI NEWS", href: "/ai", color: "#1a1a1a" },
  { label: "STARTUP NEWS", href: "/startup", color: "#2a2a2a" },
  { label: "DEALROOM", href: "/dealroom", color: "#0f0f0f" },
  { label: "AI DEALFLOW", href: "/dealflow", color: "#0d6e3f" }
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
                style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                IDEASMART
              </span>
            </Link>
            <span
              className="hidden sm:block text-xs font-mono tracking-widest uppercase"
              style={{ color: "#6b7280", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              AI · Startup · Venture Capital
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Dropdown Canali */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setChannelsOpen(!channelsOpen)}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100 flex items-center gap-1"
                style={{ color: "#374151", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
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
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {CHANNELS.map((ch) => (
                    <Link
                      key={ch.href}
                      href={ch.href}
                      onClick={() => setChannelsOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                      {ch.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Link diretti AI NEWS, Startup e DEALROOM */}
            <Link
              href="/ai"
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100"
              style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              AI NEWS
            </Link>
            <Link
              href="/startup"
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100"
              style={{ color: "#2a2a2a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              STARTUP NEWS
            </Link>
            <Link
              href="/dealroom"
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100 flex items-center gap-1.5"
              style={{ color: "#0f0f0f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              DEALROOM
            </Link>
            <Link
              href="/dealflow"
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-emerald-50 flex items-center gap-1.5"
              style={{ color: "#0d6e3f", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              AI DEALFLOW
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded" style={{ background: "#0d6e3f", color: "#ffffff" }}>NEW</span>
            </Link>
          </div>

          {/* CTA + mobile menu */}
          <div className="flex items-center gap-2">
            <Link
              href="/chi-siamo"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-gray-100"
              style={{ color: "#374151", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
            >
              Chi Siamo
            </Link>
            <Link
              href="/research"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 border"
              style={{
                color: "#00b8a0",
                borderColor: "#1a1a1a30",
                background: "#f0fdfb",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              🔬 Research
            </Link>

            <Link
              href="/advertise"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 border"
              style={{
                color: "#2a2a2a",
                borderColor: "#2a2a2a30",
                background: "#fff2ec",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Advertising
            </Link>
            {isHome ? (
              <button
                onClick={() => scrollTo("newsletter")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 text-white"
                style={{ background: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              >
                Newsletter →
              </button>
            ) : (
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 text-white"
                style={{ background: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
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
                  background: "#1a1a1a",
                  transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
                }}
              />
              <div
                className="w-6 h-0.5 mb-1.5 transition-all duration-300"
                style={{ background: "#1a1a1a", opacity: menuOpen ? 0 : 1 }}
              />
              <div
                className="w-6 h-0.5 transition-all duration-300 origin-center"
                style={{
                  background: "#1a1a1a",
                  transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? "400px" : "0px" }}
        >
          <div className="border-t border-gray-100 py-3 bg-white">
            {/* I 3 canali attivi */}
            <p className="px-4 py-1 text-xs font-mono tracking-widest uppercase text-gray-400 mb-1">I Canali</p>
            <div className="flex flex-col gap-1 px-2 mb-3">
              {CHANNELS.map((ch) => (
                <Link
                  key={ch.href}
                  href={ch.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                  {ch.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 my-2" />
            <Link
              href="/research"
              className="block w-full text-left px-4 py-3 text-base font-bold rounded-lg transition-colors mb-1"
              style={{ color: "#00b8a0", background: "#f0fdfb", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              🔬 Research →
            </Link>
            <Link
              href="/chi-siamo"
              className="block w-full text-left px-4 py-3 text-base font-semibold rounded-lg transition-colors hover:bg-gray-50 mb-1"
              style={{ color: "#1a1a1a", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              Chi Siamo →
            </Link>

            <Link
              href="/advertise"
              className="block w-full text-left px-4 py-3 text-base font-bold rounded-lg transition-colors"
              style={{ color: "#2a2a2a", background: "#fff2ec", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" }}
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
