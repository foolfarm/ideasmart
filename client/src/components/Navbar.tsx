/*
 * IDEASMART RESEARCH Navbar
 * Logo a sinistra + dropdown Offerta + pulsante Newsletter/utente a destra
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [offertaOpen, setOffertaOpen] = useState(false);
  const [mobileOffertaOpen, setMobileOffertaOpen] = useState(false);
  const [piattaformaOpen, setPiattaformaOpen] = useState(false);
  const [mobilePiattaformaOpen, setMobilePiattaformaOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/" || location === "";
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Chiudi dropdown se si clicca fuori
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOffertaOpen(false);
        setPiattaformaOpen(false);
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

  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  const offertaItems = [
    { label: "Per Creator", href: "/offerta/creator", desc: "Newsletter, social, monetizzazione" },
    { label: "Per Testate & Editori", href: "/offerta/editori", desc: "Nuovi verticali, più inventory" },
    { label: "Per Aziende", href: "/offerta/aziende", desc: "Newsroom, IR, intelligence interna" },
  ];

  const piattaformaItems = [
    { label: "Piattaforma ProofPress", href: "/piattaforma", desc: "Scopri la tecnologia agentica", external: false },
    { label: "Agentic Platform Demo", href: "https://ideasmart.technology", desc: "Prova la piattaforma live", external: true },
    { label: "ProofPress Verify", href: "/proofpress-verify", desc: "Verifica l'autenticità degli articoli", external: false },
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
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-lg sm:text-xl font-black tracking-tight"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Proof Press
            </span>
          </Link>

          {/* Centro: dropdown Piattaforma + Offerta (desktop) */}
          <div className="hidden sm:flex items-center gap-1" ref={dropdownRef}>

            {/* Dropdown Piattaforma */}
            <button
              onClick={() => { setPiattaformaOpen(!piattaformaOpen); setOffertaOpen(false); }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Piattaforma
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${piattaformaOpen ? "rotate-180" : ""}`}
              />
            </button>

            {piattaformaOpen && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[380px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-2">
                  {piattaformaItems.map((item) => (
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setPiattaformaOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div>
                          <div className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-[#c0392b] transition-colors" style={{ fontFamily: SF }}>
                            {item.label} ↗
                          </div>
                          <div className="text-[12px] text-[#1a1a1a]/50 mt-0.5">{item.desc}</div>
                        </div>
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setPiattaformaOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div>
                          <div className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-[#c0392b] transition-colors" style={{ fontFamily: SF }}>
                            {item.label}
                          </div>
                          <div className="text-[12px] text-[#1a1a1a]/50 mt-0.5">{item.desc}</div>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Dropdown Offerta */}
            <button
              onClick={() => { setOffertaOpen(!offertaOpen); setPiattaformaOpen(false); }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Offerta
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${offertaOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {offertaOpen && (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[420px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-2">
                  {offertaItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOffertaOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <div className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-[#c0392b] transition-colors" style={{ fontFamily: SF }}>
                          {item.label}
                        </div>
                        <div className="text-[12px] text-[#1a1a1a]/50 mt-0.5">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                  <Link
                    href="/chi-siamo"
                    onClick={() => setOffertaOpen(false)}
                    className="text-[12px] font-semibold text-[#1a1a1a]/50 hover:text-[#c0392b] transition-colors"
                  >
                    Chi siamo →
                  </Link>
                </div>
              </div>
            )}
          </div>

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

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? "700px" : "0px" }}
        >
          <div className="border-t border-gray-100 py-3 bg-white">

            {/* Piattaforma dropdown mobile */}
            <div className="px-2 mb-2">
              <button
                onClick={() => setMobilePiattaformaOpen(!mobilePiattaformaOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                <span>Piattaforma</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobilePiattaformaOpen ? "rotate-180" : ""}`} />
              </button>
              {mobilePiattaformaOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {piattaformaItems.map((item) => (
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => { setMenuOpen(false); setMobilePiattaformaOpen(false); }}
                        className="flex flex-col px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-[#c0392b]">{item.label} ↗</span>
                        <span className="text-[12px] text-[#1a1a1a]/50">{item.desc}</span>
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => { setMenuOpen(false); setMobilePiattaformaOpen(false); }}
                        className="flex flex-col px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-[#c0392b]">{item.label}</span>
                        <span className="text-[12px] text-[#1a1a1a]/50">{item.desc}</span>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Offerta dropdown mobile */}
            <div className="px-2 mb-2">
              <button
                onClick={() => setMobileOffertaOpen(!mobileOffertaOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                <span>Offerta</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileOffertaOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileOffertaOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {offertaItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setMenuOpen(false); setMobileOffertaOpen(false); }}
                      className="flex flex-col px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-[#c0392b]">{item.label}</span>
                      <span className="text-[12px] text-[#1a1a1a]/50">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <p className="px-4 py-1 text-xs font-mono tracking-widest uppercase text-gray-400 mb-2">Canali</p>
            <div className="flex flex-col gap-1 px-2">
              {[
                { label: "Chi Siamo", href: "/chi-siamo" },
                { label: "AI News", href: "/ai" },
                { label: "Copy & Paste AI", href: "/copy-paste-ai" },
                { label: "Automate", href: "/automate-with-ai" },
                { label: "Make Money", href: "/make-money-with-ai" },
                { label: "Daily AI Tools", href: "/daily-ai-tools" },
                { label: "ProofPress Verify", href: "/verified-ai-news" },
                { label: "AI Opportunities", href: "/ai-opportunities" },
                { label: "AI Research", href: "/research" },
                { label: "AI Venture", href: "/dealroom" },
                { label: "AI Invest", href: "/dealflow" },
                { label: "Startup News", href: "/startup" },
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
