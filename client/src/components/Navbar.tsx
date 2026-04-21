/*
 * IDEASMART RESEARCH Navbar
 * Struttura menu: Chi Siamo (dropdown) | Cosa Facciamo (dropdown) | Pubblicizza | Contatti | Investi
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chiSiamoOpen, setChiSiamoOpen] = useState(false);
  const [cosaFacciamoOpen, setCosaFacciamoOpen] = useState(false);
  const [mobileChiSiamoOpen, setMobileChiSiamoOpen] = useState(false);
  const [mobileCosaFacciamoOpen, setMobileCosaFacciamoOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/" || location === "";
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setChiSiamoOpen(false);
        setCosaFacciamoOpen(false);
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

  const chiSiamoItems = [
    { label: "Chi Siamo", href: "/chi-siamo", desc: "La nostra storia e il team" },
    { label: "Storia", href: "/storia", desc: "Come è nata ProofPress" },
  ];

  const cosaFacciamoItems = [
    { label: "Cosa Offriamo", href: "/cosa-facciamo", desc: "Prodotti e servizi per editori e aziende" },
    { label: "Piattaforma Agentica", href: "/piattaforma", desc: "La tecnologia AI Journalism certificato" },
    { label: "Tecnologia Verify", href: "/proofpress-verify", desc: "Verifica e certificazione degli articoli" },
    { label: "Trust Score A–F", href: "/trust-score", desc: "Come valutiamo ogni articolo" },
    { label: "🎙 Ascolta il Podcast", href: "/proofpress-verify#podcast", desc: "DeepDive e intro rapida su ProofPress Verify" },
  ];

  const DropdownItem = ({
    item,
    onClose,
  }: {
    item: { label: string; href: string; desc: string };
    onClose: () => void;
  }) => (
    <Link
      href={item.href}
      onClick={onClose}
      className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div>
        <div
          className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-[#c0392b] transition-colors"
          style={{ fontFamily: SF }}
        >
          {item.label}
        </div>
        <div className="text-[12px] text-[#1a1a1a]/50 mt-0.5">{item.desc}</div>
      </div>
    </Link>
  );

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

          {/* Centro: menu desktop */}
          <div className="hidden sm:flex items-center gap-1" ref={dropdownRef}>

            {/* A) Chi Siamo dropdown */}
            <div className="relative">
              <button
                onClick={() => { setChiSiamoOpen(!chiSiamoOpen); setCosaFacciamoOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                Chi Siamo
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${chiSiamoOpen ? "rotate-180" : ""}`} />
              </button>
              {chiSiamoOpen && (
                <div className="absolute top-10 left-0 w-[300px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-2">
                    {chiSiamoItems.map((item) => (
                      <DropdownItem key={item.href} item={item} onClose={() => setChiSiamoOpen(false)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* B) Cosa Facciamo dropdown */}
            <div className="relative">
              <button
                onClick={() => { setCosaFacciamoOpen(!cosaFacciamoOpen); setChiSiamoOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                Cosa Facciamo
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${cosaFacciamoOpen ? "rotate-180" : ""}`} />
              </button>
              {cosaFacciamoOpen && (
                <div className="absolute top-10 left-0 w-[340px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-2">
                    {cosaFacciamoItems.map((item) => (
                      <DropdownItem key={item.href} item={item} onClose={() => setCosaFacciamoOpen(false)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pubblicizza */}
            <Link
              href="/pubblicita"
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Pubblicizza
            </Link>

            {/* Contatti */}
            <Link
              href="/contatti"
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Contatti
            </Link>

          </div>

          {/* Destra: Investi badge + Newsletter/Home + hamburger */}
          <div className="flex items-center gap-2">
            {/* Investi badge — desktop */}
            <Link
              href="/investor"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 hover:opacity-85"
              style={{ background: "#ff5500", color: "#ffffff", fontFamily: SF, letterSpacing: "0.07em" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse inline-block flex-shrink-0" />
              Investi
            </Link>

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
                style={{ background: "#1a1a1a", transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none" }}
              />
              <div
                className="w-5 h-0.5 mb-1.5 transition-all duration-300"
                style={{ background: "#1a1a1a", opacity: menuOpen ? 0 : 1 }}
              />
              <div
                className="w-5 h-0.5 transition-all duration-300 origin-center"
                style={{ background: "#1a1a1a", transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none" }}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: menuOpen ? "800px" : "0px" }}
        >
          <div className="border-t border-gray-100 py-3 bg-white">

            {/* Testo descrittivo */}
            <div className="px-5 pb-4 pt-1">
              <p className="text-sm text-[#1a1a1a]/60 leading-relaxed" style={{ fontFamily: SF }}>
                ProofPress Magazine nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificato.
                Crea la tua testata AI-native: scopri l'offerta per{" "}
                <Link href="/offerta/creator" onClick={() => setMenuOpen(false)} className="font-bold text-[#c0392b]">creator</Link>,{" "}
                <Link href="/offerta/aziende" onClick={() => setMenuOpen(false)} className="font-bold text-[#c0392b]">aziende</Link> ed{" "}
                <Link href="/offerta/editori" onClick={() => setMenuOpen(false)} className="font-bold text-[#c0392b]">editori</Link>.
              </p>
            </div>

            {/* A) Chi Siamo dropdown mobile */}
            <div className="px-2 mb-1">
              <button
                onClick={() => setMobileChiSiamoOpen(!mobileChiSiamoOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                <span>Chi Siamo</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileChiSiamoOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileChiSiamoOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {chiSiamoItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setMenuOpen(false); setMobileChiSiamoOpen(false); }}
                      className="flex flex-col px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-[#c0392b]">{item.label}</span>
                      <span className="text-[12px] text-[#1a1a1a]/50">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* B) Cosa Facciamo dropdown mobile */}
            <div className="px-2 mb-1">
              <button
                onClick={() => setMobileCosaFacciamoOpen(!mobileCosaFacciamoOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                <span>Cosa Facciamo</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCosaFacciamoOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileCosaFacciamoOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {cosaFacciamoItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setMenuOpen(false); setMobileCosaFacciamoOpen(false); }}
                      className="flex flex-col px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-[#c0392b]">{item.label}</span>
                      <span className="text-[12px] text-[#1a1a1a]/50">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* C) Pubblicizza — voce diretta */}
            <div className="px-2 mb-1">
              <Link
                href="/pubblicita"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                Pubblicizza
              </Link>
            </div>

            {/* D) Contatti — voce diretta */}
            <div className="px-2 mb-1">
              <Link
                href="/contatti"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                Contatti
              </Link>
            </div>

            {/* E) Investi — badge arancio */}
            <div className="px-2 mb-1">
              <Link
                href="/investor"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors"
                style={{ color: "#ff5500", fontFamily: SF }}
              >
                <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse inline-block flex-shrink-0" />
                Investi — Pre-Seed Open
              </Link>
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
