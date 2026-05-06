/*
 * PROOFPRESS Navbar
 * Struttura menu: Home | Chi Siamo | Crea il tuo Giornale AI | Scopri Verify | Monetizza | Scrivi per noi | Contatti
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chiSiamoOpen, setChiSiamoOpen] = useState(false);
  const [offertaOpen, setOffertaOpen] = useState(false);
  const [scriviOpen, setScriviOpen] = useState(false);
  const [mobileChiSiamoOpen, setMobileChiSiamoOpen] = useState(false);
  const [mobileOffertaOpen, setMobileOffertaOpen] = useState(false);
  const [mobileScriviOpen, setMobileScriviOpen] = useState(false);
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
        setOffertaOpen(false);
        setScriviOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAll = () => {
    setChiSiamoOpen(false);
    setOffertaOpen(false);
    setScriviOpen(false);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

  // 1 — Chi Siamo (dropdown)
  const chiSiamoItems = [
    { label: "Chi Siamo", href: "/chi-siamo", desc: "La nostra missione e il team" },
    { label: "Storia", href: "/chi-siamo-story", desc: "Come è nata ProofPress" },
  ];

  // 2 — Voci principali menu (flat, no dropdown)
  const offertaItems = [
    { label: "Crea il tuo Giornale AI →", href: "/offertacommerciale", desc: "Crea il tuo giornale con Agenti AI — online in 24 ore" },
    { label: "Scopri la Tecnologia Verify →", href: "https://proofpressverify.com/", desc: "Il protocollo universale di certificazione crittografica", external: true },
    { label: "Monetizza con ProofPress →", href: "/advertise", desc: "Soluzioni pubblicitarie e di monetizzazione per editori" },
  ];

  // 4 — Scrivi per noi (dropdown)
  const scriviItems = [
    { label: "Scrivi per noi", href: "/scrivi-per-noi", desc: "Diventa contributor di ProofPress" },
    { label: "Portale Giornalisti", href: "/journalist-portal", desc: "Area riservata per giornalisti accreditati" },
  ];

  const DropdownItem = ({
    item,
    onClose,
  }: {
    item: { label: string; href: string; desc: string; external?: boolean };
    onClose: () => void;
  }) => (
    item.external ? (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <div>
          <div
            className="text-[14px] font-bold text-[#1a1a1a] group-hover:text-[#c0392b] transition-colors"
            style={{ fontFamily: SF }}
          >
            {item.label} ↗
          </div>
          <div className="text-[12px] text-[#1a1a1a]/50 mt-0.5">{item.desc}</div>
        </div>
      </a>
    ) : (
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
    )
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
          <div className="hidden sm:flex items-center gap-0.5" ref={dropdownRef}>

            {/* 1 — Chi Siamo dropdown */}
            <div className="relative">
              <button
                onClick={() => { setChiSiamoOpen(!chiSiamoOpen); setOffertaOpen(false); setScriviOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                Chi Siamo
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${chiSiamoOpen ? "rotate-180" : ""}`} />
              </button>
              {chiSiamoOpen && (
                <div className="absolute top-10 left-0 w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-2">
                    {chiSiamoItems.map((item) => (
                      <DropdownItem key={item.href} item={item} onClose={() => setChiSiamoOpen(false)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2 — Crea il tuo Giornale AI */}
            <Link
              href="/offertacommerciale"
              className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Crea il tuo Giornale AI →
            </Link>

            {/* 3 — Scopri la Tecnologia Verify */}
            <a
              href="https://proofpressverify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              ProofPress Verify™ ↗
            </a>

            {/* 4 — Monetizza con ProofPress */}
            <Link
              href="/advertise"
              className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Monetizza →
            </Link>



            {/* 6 — Scrivi per noi dropdown */}
            <div className="relative">
              <button
                onClick={() => { setScriviOpen(!scriviOpen); setChiSiamoOpen(false); setOffertaOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                Scrivi per noi
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${scriviOpen ? "rotate-180" : ""}`} />
              </button>
              {scriviOpen && (
                <div className="absolute top-10 left-0 w-[300px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-2">
                    {scriviItems.map((item) => (
                      <DropdownItem key={item.href} item={item} onClose={() => setScriviOpen(false)} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6 — Contatti */}
            <Link
              href="/contatti"
              className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-gray-50"
              style={{ color: "#1a1a1a", fontFamily: SF }}
            >
              Contatti
            </Link>
          </div>

          {/* Destra: Language + Investi badge + Newsletter/Home + hamburger */}
          <div className="flex items-center gap-2">
            {/* Language switcher — desktop */}
            <div className="hidden md:flex">
              <LanguageSwitcher variant="navbar" />
            </div>


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
          style={{ maxHeight: menuOpen ? "900px" : "0px" }}
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

            {/* 1 — Chi Siamo dropdown mobile */}
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

            {/* 2 — Offerta dropdown mobile */}
            <div className="px-2 mb-1">
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
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => { setMenuOpen(false); setMobileOffertaOpen(false); }}
                        className="flex flex-col px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-[#c0392b]">{item.label} ↗</span>
                        <span className="text-[12px] text-[#1a1a1a]/50">{item.desc}</span>
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => { setMenuOpen(false); setMobileOffertaOpen(false); }}
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

            {/* 3 — Advertise — voce diretta */}
            <div className="px-2 mb-1">
              <Link
                href="/pubblicita"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                Advertise
              </Link>
            </div>

            {/* 4 — Scrivi per noi dropdown mobile */}
            <div className="px-2 mb-1">
              <button
                onClick={() => setMobileScriviOpen(!mobileScriviOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                style={{ color: "#1a1a1a", fontFamily: SF }}
              >
                <span>Scrivi per noi</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileScriviOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileScriviOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {scriviItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setMenuOpen(false); setMobileScriviOpen(false); }}
                      className="flex flex-col px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-[#c0392b]">{item.label}</span>
                      <span className="text-[12px] text-[#1a1a1a]/50">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 5 — Contatti — voce diretta */}
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



            {/* Selettore lingua mobile */}
            <div className="px-2 mb-2">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50">
                <span className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wider" style={{ fontFamily: SF }}>Lingua / Language</span>
                <LanguageSwitcher variant="compact" />
              </div>
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
