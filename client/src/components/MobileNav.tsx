/**
 * MobileNav — Hamburger button + slide-in drawer per mobile
 * Struttura menu: A) Chi Siamo | B) Cosa Facciamo | C) Pubblicizza | D) Contatti | E) Investi
 * Visibile solo su schermi < lg (1024px)
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X, Menu, ChevronDown, ChevronRight } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [chiSiamoOpen, setChiSiamoOpen] = useState(false);
  const [cosaFacciamoOpen, setCosaFacciamoOpen] = useState(false);
  const [location] = useLocation();

  // Chiude il drawer quando cambia la pagina
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Blocca lo scroll del body quando il drawer è aperto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);
  const isActive = (href: string) => location.startsWith(href);

  /* ── Sub-link helper ── */
  const SubLink = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
    <Link href={href}>
      <div
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
          isActive(href) ? "bg-[#1a1a1a] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/70"
        }`}
        onClick={close}
      >
        <span className="text-[13px] w-4 text-center flex-shrink-0">{icon}</span>
        <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: SF }}>{label}</span>
      </div>
    </Link>
  );

  return (
    <>
      {/* ── Hamburger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#1a1a1a]/8 transition-colors"
        aria-label="Apri menu"
      >
        <Menu size={20} strokeWidth={2} color="#1a1a1a" />
      </button>

      {/* ── Overlay scuro ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* ── Drawer laterale ── */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-white shadow-2xl lg:hidden transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#e5e5ea]">
          <Link href="/" onClick={close}>
            <span style={{ fontFamily: SF, fontSize: "22px", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em", cursor: "pointer" }}>
              Menu
            </span>
          </Link>
          <button
            onClick={close}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#1a1a1a]/8 transition-colors"
            aria-label="Chiudi menu"
          >
            <X size={18} strokeWidth={2} color="#1a1a1a" />
          </button>
        </div>

        {/* Tagline */}
        <div className="px-5 py-4 border-b border-[#e5e5ea]">
          <p style={{ fontSize: "13px", color: "rgba(26,26,26,0.55)", lineHeight: 1.6, fontFamily: SF }}>
            ProofPress Magazine nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificato.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            NAV PRINCIPALE — struttura A/B/C/D/E
        ══════════════════════════════════════════════════════════ */}
        <nav className="flex flex-col gap-0.5 px-3 py-4">

          {/* A) CHI SIAMO — dropdown */}
          <div>
            <button
              onClick={() => setChiSiamoOpen(!chiSiamoOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0">🏛️</span>
              <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: SF, flex: 1, textAlign: "left" }}>Chi Siamo</span>
              {chiSiamoOpen
                ? <ChevronDown size={14} className="opacity-40 flex-shrink-0" />
                : <ChevronRight size={14} className="opacity-40 flex-shrink-0" />}
            </button>
            {chiSiamoOpen && (
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-[#1a1a1a]/10 pl-3 pb-1">
                <SubLink href="/chi-siamo" icon="ℹ️" label="Chi Siamo" />
                <SubLink href="/storia" icon="📖" label="Storia" />
              </div>
            )}
          </div>

          {/* B) COSA FACCIAMO — dropdown */}
          <div>
            <button
              onClick={() => setCosaFacciamoOpen(!cosaFacciamoOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0">🖥️</span>
              <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: SF, flex: 1, textAlign: "left" }}>Cosa Facciamo</span>
              {cosaFacciamoOpen
                ? <ChevronDown size={14} className="opacity-40 flex-shrink-0" />
                : <ChevronRight size={14} className="opacity-40 flex-shrink-0" />}
            </button>
            {cosaFacciamoOpen && (
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-[#1a1a1a]/10 pl-3 pb-1">
                <SubLink href="/cosa-facciamo" icon="💡" label="Cosa Offriamo" />
                <SubLink href="/piattaforma" icon="🚀" label="Piattaforma Agentica" />
                <SubLink href="/proofpress-verify" icon="✅" label="Tecnologia Verify" />
              </div>
            )}
          </div>

          {/* C) PUBBLICIZZA */}
          <Link href="/pubblicita" onClick={close}>
            <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
              isActive("/pubblicita") ? "bg-[#1a1a1a] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
            }`}>
              <span className="text-[15px] w-5 text-center flex-shrink-0">📣</span>
              <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: SF }}>Pubblicizza</span>
            </div>
          </Link>

          {/* D) CONTATTI */}
          <Link href="/contatti" onClick={close}>
            <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
              isActive("/contatti") ? "bg-[#1a1a1a] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
            }`}>
              <span className="text-[15px] w-5 text-center flex-shrink-0">✉️</span>
              <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: SF }}>Contatti</span>
            </div>
          </Link>

          {/* E) INVESTI — badge arancio */}
          <Link href="/investor" onClick={close}>
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: "rgba(255,85,0,0.07)" }}
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0">💰</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ff5500", fontFamily: SF, lineHeight: 1.2 }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse mr-1.5 align-middle" />
                  Investi
                </div>
                <div style={{ fontSize: "10px", color: "#ff5500", opacity: 0.7, fontFamily: SF, lineHeight: 1.2 }}>Pre-Seed Open</div>
              </div>
            </div>
          </Link>

        </nav>

        {/* LinkedIn */}
        <div className="px-4 pb-8 border-t border-[#e5e5ea] pt-4 mt-2">
          <a
            href="https://www.linkedin.com/company/proofpress/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f0f7ff] transition-colors"
            style={{ border: "1px solid rgba(10,102,194,0.15)", background: "rgba(10,102,194,0.04)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#0a66c2", fontFamily: "system-ui, sans-serif" }}>ProofPress</div>
              <div style={{ fontSize: "10px", color: "rgba(26,26,26,0.5)", fontFamily: "system-ui, sans-serif" }}>Seguici su LinkedIn</div>
            </div>
          </a>
        </div>

      </div>
    </>
  );
}
