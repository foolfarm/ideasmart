/**
 * IDEASMART Navbar — Pivot Research Edition
 * Solo 2 canali attivi: AI4Business e Startup News
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";

const CHANNELS = [
  { label: "AI4Business", href: "/ai", color: "#00b4a0" },
  { label: "Startup News", href: "/startup", color: "#e84f00" },
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
                style={{ color: "#1a1f2e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                IDEA<span style={{ color: "#00b4a0" }}>SMART</span> <span style={{ color: "#0a6e5c", fontSize: "0.75em" }}>RESEARCH</span>
              </span>
            </Link>
            <span
              className="hidden sm:block text-xs font-mono tracking-widest uppercase"
              style={{ color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}
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
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
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

            {/* Link diretti AI4Business e Startup */}
            <Link
              href="/ai"
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100"
              style={{ color: "#00b4a0", fontFamily: "'DM Sans', sans-serif" }}
            >
              AI4Business
            </Link>
            <Link
              href="/startup"
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-gray-100"
              style={{ color: "#e84f00", fontFamily: "'DM Sans', sans-serif" }}
            >
              Startup News
            </Link>
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
              href="/research"
              className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 border"
              style={{
                color: "#00b8a0",
                borderColor: "#00e5c830",
                background: "#f0fdfb",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              🔬 Research
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
          style={{ maxHeight: menuOpen ? "400px" : "0px" }}
        >
          <div className="border-t border-gray-100 py-3 bg-white">
            {/* I 2 canali attivi */}
            <p className="px-4 py-1 text-xs font-mono tracking-widest uppercase text-gray-400 mb-1">I Canali</p>
            <div className="flex flex-col gap-1 px-2 mb-3">
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
            <div className="border-t border-gray-100 my-2" />
            <Link
              href="/research"
              className="block w-full text-left px-4 py-3 text-base font-bold rounded-lg transition-colors mb-1"
              style={{ color: "#00b8a0", background: "#f0fdfb", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              🔬 Research →
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
