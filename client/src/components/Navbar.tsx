/*
 * IDEASMART Navbar — Light Editorial / Tech Magazine
 * Sticky top nav with logo, section links, and newsletter CTA
 * Migliorato: contrasto testo, font più grandi, hamburger animato, mobile menu fluido
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

  const navItems = [
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
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2">
              <span
                className="text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: "#1a1f2e", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                IDEA<span style={{ color: "#00b4a0" }}>SMART</span>
              </span>
            </button>
            <span
              className="hidden sm:block text-xs font-mono tracking-widest uppercase"
              style={{ color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}
            >
              AI FOR BUSINESS
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
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
            <a
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
            </a>
            <button
              onClick={() => scrollTo("newsletter")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 text-white"
              style={{
                background: "#1a1f2e",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Newsletter →
            </button>

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
                style={{
                  background: "#1a1f2e",
                  opacity: menuOpen ? 0 : 1,
                }}
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

        {/* Mobile menu — dropdown fluido */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? "400px" : "0px" }}
        >
          <div className="border-t border-gray-100 py-3 space-y-1 bg-white">
            {[
              ...navItems.map(i => ({ ...i, label: i.label === "News" ? "Ultime News AI" : i.label === "Editoriale" ? "Editoriale del Giorno" : i.label === "Startup" ? "Startup del Giorno" : i.label === "Reportage" ? "Reportage Settimanale" : "Analisi di Mercato" })),
              { label: "Newsletter", id: "newsletter" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left px-4 py-3.5 text-base font-semibold rounded-lg transition-colors hover:bg-gray-50"
                style={{ color: "#1a1f2e", fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.label}
              </button>
            ))}
            <a
              href="/advertise"
              className="block w-full text-left px-4 py-3.5 text-base font-bold rounded-lg transition-colors"
              style={{ color: "#e84f00", background: "#fff2ec", fontFamily: "'DM Sans', sans-serif" }}
              onClick={() => setMenuOpen(false)}
            >
              Advertising →
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
