/**
 * MobileNav — Hamburger button + slide-in drawer per mobile
 * Visibile solo su schermi < lg (1024px)
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X, Menu, ChevronDown, ChevronRight } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

const INFO_LINKS = [
  { label: "Chi siamo",         icon: "🏗️", href: "/chi-siamo-story" },
  { label: "Pubblicizza",       icon: "📣", href: "/pubblicita" },
  { label: "Collezione Prompt", icon: "📋", href: "https://promptcollection2026.com/" },
  { label: "Contatti",          icon: "✉️", href: "mailto:info@proofpress.ai" },
];

const PIATTAFORMA_SUBMENU = [
  { label: "Piattaforma ProofPress", icon: "🚀", href: "/piattaforma",          external: false },
  { label: "Agentic Platform Demo",  icon: "🎯", href: "https://proofpress.tech/", external: true },
  { label: "ProofPress Verify",      icon: "✅", href: "/proofpress-verify",    external: false },
];

const OFFERTA_SUBMENU = [
  { label: "Creator & Giornalisti", icon: "✍️", href: "/offerta/creator" },
  { label: "Testate & Editori",     icon: "📰", href: "/offerta/editori" },
  { label: "Aziende & Corporate",   icon: "🏢", href: "/offerta/aziende" },
];

const CANALI = [
  { label: "AI News",   icon: "🤖", href: "/ai" },
  { label: "Startup",   icon: "🚀", href: "/startup" },
  { label: "Research",  icon: "🔬", href: "/research" },
  { label: "Dealroom",  icon: "💼", href: "/dealroom" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [offertaOpen, setOffertaOpen] = useState(false);
  const [piattaformaOpen, setPiattaformaOpen] = useState(false);
  const [location] = useLocation();

  // Chiude il drawer quando cambia la pagina
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Blocca lo scroll del body quando il drawer è aperto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
          onClick={() => setOpen(false)}
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
          <Link href="/">
            <span
              style={{ fontFamily: SF, fontSize: "22px", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em", cursor: "pointer" }}
            >
              Menu
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#1a1a1a]/8 transition-colors"
            aria-label="Chiudi menu"
          >
            <X size={18} strokeWidth={2} color="#1a1a1a" />
          </button>
        </div>

        {/* Tagline */}
        <div className="px-5 py-4 border-b border-[#e5e5ea]">
          <p style={{ fontSize: "13px", color: "rgba(26,26,26,0.65)", lineHeight: 1.6, fontFamily: SF }}>
            ProofPress Magazine nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificato.
          </p>
        </div>

        {/* Canali principali */}
        <div className="px-3 py-3 border-b border-[#e5e5ea]">
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#86868b", letterSpacing: "0.12em", fontFamily: SF, paddingLeft: "12px", marginBottom: "6px" }}>
            CANALI
          </p>
          {CANALI.map((c) => (
            <Link key={c.href} href={c.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                location.startsWith(c.href) ? "bg-[#1a1a1a] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
              }`}>
                <span className="text-[16px] w-5 text-center flex-shrink-0">{c.icon}</span>
                <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF }}>{c.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Nav principale */}
        <nav className="flex flex-col gap-0.5 px-3 py-3 border-b border-[#e5e5ea]">
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#86868b", letterSpacing: "0.12em", fontFamily: SF, paddingLeft: "12px", marginBottom: "6px" }}>
            PIATTAFORMA
          </p>

          {/* Piattaforma con submenu */}
          <div>
            <button
              onClick={() => setPiattaformaOpen(!piattaformaOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0">🖥️</span>
              <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF, flex: 1, textAlign: "left" }}>Piattaforma</span>
              {piattaformaOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
            </button>
            {piattaformaOpen && (
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-[#1a1a1a]/12 pl-3">
                {PIATTAFORMA_SUBMENU.map((sub) =>
                  sub.external ? (
                    <a key={sub.href} href={sub.href} target="_blank" rel="noopener noreferrer">
                      <div className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/65">
                        <span className="text-[13px] w-4 text-center flex-shrink-0">{sub.icon}</span>
                        <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: SF }}>{sub.label}</span>
                      </div>
                    </a>
                  ) : (
                    <Link key={sub.href} href={sub.href}>
                      <div className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/65">
                        <span className="text-[13px] w-4 text-center flex-shrink-0">{sub.icon}</span>
                        <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: SF }}>{sub.label}</span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          {/* Offerta con submenu */}
          <div>
            <button
              onClick={() => setOffertaOpen(!offertaOpen)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0">💼</span>
              <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF, flex: 1, textAlign: "left" }}>Offerta</span>
              {offertaOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
            </button>
            {offertaOpen && (
              <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l-2 border-[#1a1a1a]/12 pl-3">
                {OFFERTA_SUBMENU.map((sub) => (
                  <Link key={sub.href} href={sub.href}>
                    <div className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-[#1a1a1a]/6 text-[#1a1a1a]/65">
                      <span className="text-[13px] w-4 text-center flex-shrink-0">{sub.icon}</span>
                      <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: SF }}>{sub.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Info links */}
        <nav className="flex flex-col gap-0.5 px-3 py-3">
          <p style={{ fontSize: "10px", fontWeight: 700, color: "#86868b", letterSpacing: "0.12em", fontFamily: SF, paddingLeft: "12px", marginBottom: "6px" }}>
            INFO
          </p>
          {INFO_LINKS.map((link) =>
            link.href.startsWith("http") || link.href.startsWith("mailto") ? (
              <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#1a1a1a]/6 text-[#1a1a1a]">
                  <span className="text-[15px] w-5 text-center flex-shrink-0">{link.icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF }}>{link.label}</span>
                </div>
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#1a1a1a]/6 text-[#1a1a1a]">
                  <span className="text-[15px] w-5 text-center flex-shrink-0">{link.icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF }}>{link.label}</span>
                </div>
              </Link>
            )
          )}
        </nav>

        {/* LinkedIn */}
        <div className="px-4 pb-8">
          <a
            href="https://www.linkedin.com/company/proofpress/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#f0f7ff] transition-colors"
            style={{ border: "1px solid rgba(10,102,194,0.15)", background: "rgba(10,102,194,0.04)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
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
