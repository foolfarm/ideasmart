/**
 * MobileNav — Hamburger button + slide-in drawer per mobile
 * Voci allineate alla sidebar desktop (LeftSidebar.tsx)
 * Visibile solo su schermi < lg (1024px)
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X, Menu, ChevronDown, ChevronRight } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const SF = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

/* ─── STRUTTURA MENU (specchio di LeftSidebar.tsx) ─────────────────── */
type NavItem =
  | { type: "link"; href: string; label: string; icon: string; external?: boolean }
  | { type: "group"; label: string; icon: string; children: { href: string; label: string; external?: boolean }[] };

const NAV_STRUCTURE: NavItem[] = [
  // Home con sottomenu canali
  {
    type: "group",
    label: "Home",
    icon: "🏠",
    children: [
      { href: "/",                  label: "Magazine" },
      { href: "/ai",                label: "AI" },
      { href: "/startup",           label: "Startup" },
      { href: "/dealroom",          label: "Dealroom" },
      { href: "/osservatorio-tech", label: "Osservatorio Tech" },
      { href: "/research",          label: "Research" },
      { href: "/dealflow",          label: "Dealflow" },
    ],
  },
  {
    type: "group",
    label: "Chi Siamo",
    icon: "ℹ️",
    children: [
      { href: "/cosa-facciamo",    label: "Chi Siamo" },
      { href: "/chi-siamo-story",  label: "Storia" },
    ],
  },
  { type: "link", href: "/offertacommerciale", label: "Crea il tuo Giornale AI →", icon: "🚀" },
  { type: "link", href: "https://proofpressverify.com/", label: "Scopri la Tecnologia Verify →", icon: "🔐", external: true },
  { type: "link", href: "/advertise", label: "Monetizza con ProofPress →", icon: "💰" },
  { type: "link", href: "/scrivi-per-noi", label: "Scrivi per noi", icon: "✍️" },
  { type: "link", href: "/contatti", label: "Contatti", icon: "✉️" },
]

/* ─── GRUPPO ESPANDIBILE ─────────────────────────────────────────────── */
function NavGroup({
  label, icon, children, isActive, close,
}: {
  label: string; icon: string;
  children: { href: string; label: string; external?: boolean }[];
  isActive: (href: string) => boolean;
  close: () => void;
}) {
  const anyActive = children.some(c => !c.external && isActive(c.href));
  const [open, setOpen] = useState(anyActive);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-[#1a1a1a]/6"
        style={{ background: anyActive ? "rgba(26,26,26,0.06)" : undefined }}
      >
        <span className="text-[15px] w-5 text-center flex-shrink-0">{icon}</span>
        <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF, flex: 1, textAlign: "left", color: "#1a1a1a" }}>{label}</span>
        {open
          ? <ChevronDown size={14} strokeWidth={2} color="rgba(26,26,26,0.4)" />
          : <ChevronRight size={14} strokeWidth={2} color="rgba(26,26,26,0.4)" />}
      </button>
      {open && (
        <div className="ml-8 flex flex-col gap-0.5 mt-0.5 mb-1">
          {children.map(({ href, label: childLabel, external }) => {
            const active = !external && isActive(href);
            const inner = (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  active ? "bg-[#1a1a1a] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
                }`}
              >
                <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: SF, flex: 1 }}>{childLabel}</span>
                {external && <span style={{ fontSize: "10px", color: "rgba(26,26,26,0.3)" }}>↗</span>}
              </div>
            );
            if (external) {
              return (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              );
            }
            return (
              <Link key={href} href={href} onClick={close}>
                {inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── COMPONENTE PRINCIPALE ─────────────────────────────────────────── */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => { setOpen(false); }, [location]);
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

      {/* ── Overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* ── Drawer ── */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-[290px] bg-white shadow-2xl lg:hidden transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        {/* Header */}
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
          <p style={{ fontSize: "12.5px", color: "rgba(26,26,26,0.55)", lineHeight: 1.65, fontFamily: SF }}>
            ProofPress è la piattaforma di AI Journalism che ti permette di creare, verificare e monetizzare contenuti certificati. Costruiamo un'informazione affidabile, scalabile e verificabile.
          </p>
        </div>

        {/* ── NAV PRINCIPALE ── */}
        <nav className="flex flex-col gap-0.5 px-3 py-4">
          {NAV_STRUCTURE.map((item, i) => {
            if (item.type === "link") {
              const { href, label, icon, external } = item;
              const active = !external && isActive(href);
              const inner = (
                <div
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    active ? "bg-[#1a1a1a] text-white" : "hover:bg-[#1a1a1a]/6 text-[#1a1a1a]"
                  }`}
                >
                  <span className="text-[15px] w-5 text-center flex-shrink-0">{icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: SF, flex: 1 }}>{label}</span>
                  {external && <span style={{ fontSize: "10px", color: "rgba(26,26,26,0.3)" }}>↗</span>}
                </div>
              );
              if (external) {
                return (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                );
              }
              return (
                <Link key={i} href={href} onClick={close}>
                  {inner}
                </Link>
              );
            }
            // group
            return (
              <NavGroup
                key={i}
                label={item.label}
                icon={item.icon}
                children={item.children}
                isActive={isActive}
                close={close}
              />
            );
          })}


        </nav>

        {/* ── Selettore lingua IT/EN ── */}
        <div className="px-5 py-3 border-t border-[#e5e5ea]">
          <p style={{ fontSize: "11px", color: "rgba(26,26,26,0.4)", fontFamily: SF, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Lingua / Language
          </p>
          <LanguageSwitcher variant="navbar" />
        </div>

        {/* ── LinkedIn ── */}
        <div className="px-4 pb-8 pt-3 border-t border-[#e5e5ea]">
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
