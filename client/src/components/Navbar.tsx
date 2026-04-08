/**
 * IDEASMART RESEARCH Navbar — Semplificata
 * Solo logo a sinistra + pulsante Newsletter/utente a destra
 * La navigazione canali è nella SectionChannelBar sotto la hero
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/" || location === "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/97 backdrop-blur-md border-b border-gray-200 shadow-md"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-lg sm:text-xl font-black tracking-tight"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              IDEASMART{" "}
              <span style={{ color: "#dc2626", fontSize: "0.62em", letterSpacing: "0.18em", fontWeight: 900 }}>
                RESEARCH
              </span>
            </span>
          </Link>

          {/* Destra: Newsletter CTA + mobile hamburger */}
          <div className="flex items-center gap-2">
            {isHome ? (
              <button
                onClick={() => scrollTo("newsletter")}
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 text-white"
                style={{ background: "#1a1a1a", fontFamily: SF }}
              >
                Newsletter →
              </button>
            ) : (
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 text-white"
                style={{ background: "#1a1a1a", fontFamily: SF }}
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
                className="w-5 h-0.5 mb-1.5 transition-all duration-300 origin-center"
                style={{
                  background: "#1a1a1a",
                  transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none",
                }}
              />
              <div
                className="w-5 h-0.5 mb-1.5 transition-all duration-300"
                style={{ background: "#1a1a1a", opacity: menuOpen ? 0 : 1 }}
              />
              <div
                className="w-5 h-0.5 transition-all duration-300 origin-center"
                style={{
                  background: "#1a1a1a",
                  transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu — canali principali */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? "500px" : "0px" }}
        >
          <div className="border-t border-gray-100 py-3 bg-white">
            <p className="px-4 py-1 text-xs font-mono tracking-widest uppercase text-gray-400 mb-2">Canali</p>
            <div className="flex flex-col gap-1 px-2">
              {[
                { label: "▷ Start Here", href: "/start-here" },
                { label: "AI News", href: "/ai" },
                { label: "Copy & Paste AI", href: "/copy-paste-ai" },
                { label: "Automate", href: "/automate-with-ai" },
                { label: "Make Money", href: "/make-money-with-ai" },
                { label: "Daily AI Tools", href: "/daily-ai-tools" },
                { label: "Verified News", href: "/verified-ai-news" },
                { label: "AI Opportunities", href: "/ai-opportunities" },
                { label: "AI Research", href: "/research" },
                { label: "AI Venture", href: "/dealroom" },
                { label: "AI Invest", href: "/dealflow" },
                { label: "Startup News", href: "/startup" },
                { label: "Chi Siamo", href: "/chi-siamo" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: "#1a1a1a", fontFamily: SF }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 px-2">
              {isHome ? (
                <button
                  onClick={() => scrollTo("newsletter")}
                  className="w-full text-center px-4 py-3 text-base font-bold rounded-lg text-white"
                  style={{ background: "#1a1a1a", fontFamily: SF }}
                >
                  Newsletter →
                </button>
              ) : (
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-base font-bold rounded-lg text-white"
                  style={{ background: "#1a1a1a", fontFamily: SF }}
                >
                  ← Home
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
