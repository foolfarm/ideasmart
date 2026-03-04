/*
 * IDEASMART Navbar — Dark Editorial / Tech Magazine
 * Sticky top nav with logo, section links, and newsletter CTA
 */
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2">
              <span
                className="text-xl font-black tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                IDEA<span style={{ color: "#00e5c8" }}>SMART</span>
              </span>
            </button>
            <span
              className="hidden sm:block text-xs font-mono tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              AI FOR BUSINESS
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: "FoolTalent", id: "fooltalent" },
              { label: "FoolShare", id: "foolshare" },
              { label: "Fragmentalis", id: "fragmentalis" },
              { label: "PollCast", id: "pollcast" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA + mobile menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo("newsletter")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: "#00e5c8",
                color: "#0a0f1e",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Newsletter →
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-white/60 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
              <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
              <div className="w-5 h-0.5 bg-current transition-all" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/8 py-4 space-y-2">
            {[
              { label: "01 — FoolTalent", id: "fooltalent" },
              { label: "02 — FoolShare", id: "foolshare" },
              { label: "03 — Fragmentalis", id: "fragmentalis" },
              { label: "04 — PollCast", id: "pollcast" },
              { label: "Newsletter", id: "newsletter" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
