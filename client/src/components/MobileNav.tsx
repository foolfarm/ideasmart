/**
 * MobileNav — Hamburger button + slide-in drawer per mobile
 * Struttura menu: 10 voci flat (Platform, Demo, Verify, Magazine, Advertise,
 *                 Contribute, Journalists Portal, About, Contact, Invest)
 * Visibile solo su schermi < lg (1024px)
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X, Menu } from "lucide-react";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

/* ─── VOCI MENU ─────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/piattaforma",             label: "Platform",            icon: "🖥️",  external: false },
  { href: "https://proofpress.tech/", label: "Demo Platform",       icon: "🚀",  external: true  },
  { href: "/proofpress-verify",       label: "Verify",              icon: "✅",  external: false },
  { href: "/",                        label: "Magazine",            icon: "📰",  external: false },
  { href: "/pubblicita",              label: "Advertise",           icon: "📣",  external: false },
  { href: "/scrivi-per-noi",          label: "Contribute",          icon: "✍️",  external: false },
  { href: "/journalist-portal",       label: "Journalists Portal",  icon: "🔑",  external: false },
  { href: "/cosa-facciamo",           label: "About",               icon: "ℹ️",  external: false },
  { href: "https://d2xsxph8kpxj0f.cloudfront.net/99304667/UyPaon6i3Ec4nvfPz6kUfg/ProofPress_Brochure_a9cc5247.pdf", label: "Download Brochure", icon: "📄", external: true  },
  { href: "/contatti",                label: "Contact",             icon: "✉️",  external: false },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
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
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    if (href.startsWith("http")) return false;
    return location.startsWith(href);
  };

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
        className={`fixed top-0 left-0 z-50 h-full w-[290px] bg-white shadow-2xl lg:hidden transition-transform duration-300 ease-in-out ${
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

        {/* Tagline istituzionale */}
        <div className="px-5 py-4 border-b border-[#e5e5ea]">
          <p style={{ fontSize: "12.5px", color: "rgba(26,26,26,0.55)", lineHeight: 1.65, fontFamily: SF }}>
            ProofPress Magazine nato in California come un bulletin board privato nasce dalla piattaforma ProofPress, la prima tecnologia di AI Journalism certificata con hash crittografico SHA-256 e archiviata su IPFS. Vogliamo costruire un mondo con informazione certa e sicura.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            NAV PRINCIPALE — 9 voci flat + 1 Invest
        ══════════════════════════════════════════════════════════ */}
        <nav className="flex flex-col gap-0.5 px-3 py-4">

          {NAV_ITEMS.map(({ href, label, icon, external }) =>
            external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
              >
                <span className="text-[15px] w-5 text-center flex-shrink-0">{icon}</span>
                <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF, flex: 1 }}>{label}</span>
                <span style={{ fontSize: "10px", color: "rgba(26,26,26,0.3)", fontFamily: SF }}>↗</span>
              </a>
            ) : (
              <Link key={href} href={href} onClick={close}>
                <div
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isActive(href) ? "bg-[#1a1a1a] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
                  }`}
                >
                  <span className="text-[15px] w-5 text-center flex-shrink-0">{icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF }}>{label}</span>
                </div>
              </Link>
            )
          )}

          {/* INVEST — voce speciale arancio */}
          <Link href="/investor" onClick={close}>
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: "rgba(255,85,0,0.07)" }}
            >
              <span className="text-[15px] w-5 text-center flex-shrink-0">💰</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#ff5500", fontFamily: SF, lineHeight: 1.2 }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse mr-1.5 align-middle" />
                  Invest
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
