"""
Fix mobile layout per ProofPress:
1. Header Home: riduce il logo su mobile (clamp più aggressivo)
2. Banner Prompt Collection: nasconde il testo descrittivo su mobile, layout compatto
3. SectionNav: aggiunge overflow-x-auto per la barra canali su mobile
4. BreakingNewsSection: testo più corto su mobile
5. Pagine canali: padding ridotto su mobile
"""
import re

# ─── 1. Home.tsx — Header logo più piccolo su mobile ────────────────────────
home_path = "/home/ubuntu/ideasmart/client/src/pages/Home.tsx"
with open(home_path, "r") as f:
    content = f.read()

# Riduce il font del logo ProofPress su mobile
content = content.replace(
    'fontSize: "clamp(42px, 7vw, 88px)"',
    'fontSize: "clamp(28px, 7vw, 88px)"'
)

# Riduce il padding verticale dell'header su mobile
content = content.replace(
    '<header className="max-w-[1280px] mx-auto px-4 pt-5 pb-0">',
    '<header className="max-w-[1280px] mx-auto px-4 pt-3 pb-0 sm:pt-5">'
)

# Riduce il padding del blocco header centrale su mobile
content = content.replace(
    '<div className="py-4">',
    '<div className="py-2 sm:py-4">',
    1  # solo la prima occorrenza (header)
)

# Nasconde la descrizione sopra il logo su mobile
content = content.replace(
    '<p className="text-center uppercase tracking-[0.18em] text-[#1a1a1a]/40 font-medium whitespace-nowrap overflow-hidden text-ellipsis mb-3"',
    '<p className="hidden sm:block text-center uppercase tracking-[0.18em] text-[#1a1a1a]/40 font-medium whitespace-nowrap overflow-hidden text-ellipsis mb-3"'
)

# Nasconde il sottotitolo su mobile
content = content.replace(
    '<div className="mt-2 uppercase tracking-[0.2em] text-[#1a1a1a]/60 font-semibold"',
    '<div className="hidden sm:block mt-2 uppercase tracking-[0.2em] text-[#1a1a1a]/60 font-semibold"'
)

# Banner Prompt Collection: nasconde il testo descrittivo su mobile
content = content.replace(
    '<p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-0.5" style={{ color: "#86868b", fontFamily: "-apple-system, BlinkMacSystemFont, \'SF Pro Text\', Arial, sans-serif" }}>Collezione Proof Press</p>',
    '<p className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.12em] mb-0.5" style={{ color: "#86868b", fontFamily: "-apple-system, BlinkMacSystemFont, \'SF Pro Text\', Arial, sans-serif" }}>Collezione Proof Press</p>'
)

# Riduce il padding del banner Prompt Collection su mobile
content = content.replace(
    'className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-sm group"',
    'className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl transition-all duration-200 hover:shadow-sm group"'
)

# Riduce il testo del titolo del banner su mobile
content = content.replace(
    '<p className="text-[14px] font-bold leading-tight" style={{ color: "#1d1d1f", fontFamily: "-apple-system, BlinkMacSystemFont, \'SF Pro Display\', Arial, sans-serif" }}>Prompt da usare davvero nel lavoro quotidiano — 39€</p>',
    '<p className="text-[13px] sm:text-[14px] font-bold leading-tight" style={{ color: "#1d1d1f", fontFamily: "-apple-system, BlinkMacSystemFont, \'SF Pro Display\', Arial, sans-serif" }}>Prompt da usare davvero nel lavoro quotidiano — 39€</p>'
)

with open(home_path, "w") as f:
    f.write(content)
print("✅ Home.tsx aggiornato")

# ─── 2. SharedPageHeader.tsx — Header canali più compatto su mobile ──────────
header_path = "/home/ubuntu/ideasmart/client/src/components/SharedPageHeader.tsx"
with open(header_path, "r") as f:
    content = f.read()

# Riduce il font del logo su mobile
content = content.replace(
    'fontSize: "clamp(42px, 7vw, 88px)"',
    'fontSize: "clamp(28px, 7vw, 88px)"'
)

# Nasconde il sottotitolo su mobile
content = content.replace(
    '<div className="mt-2 uppercase tracking-[0.2em] text-[#1a1a1a]/60 font-semibold"',
    '<div className="hidden sm:block mt-2 uppercase tracking-[0.2em] text-[#1a1a1a]/60 font-semibold"'
)

# Riduce il padding verticale dell'header su mobile
content = content.replace(
    'className="py-4"',
    'className="py-2 sm:py-4"'
)

# Nasconde la descrizione sopra il logo su mobile
content = content.replace(
    'className="text-center uppercase tracking-[0.18em]',
    'className="hidden sm:block text-center uppercase tracking-[0.18em]'
)

with open(header_path, "w") as f:
    f.write(content)
print("✅ SharedPageHeader.tsx aggiornato")

# ─── 3. SectionNav.tsx — Barra navigazione scrollabile su mobile ─────────────
nav_path = "/home/ubuntu/ideasmart/client/src/components/SectionNav.tsx"
with open(nav_path, "r") as f:
    content = f.read()

# Aggiunge overflow-x-auto alla barra di navigazione
content = content.replace(
    'className="flex items-center bg-white border-b border-[#1a1a1a]/8"',
    'className="flex items-center bg-white border-b border-[#1a1a1a]/8 overflow-x-auto scrollbar-none"'
)

# Riduce il padding dei bottoni su mobile
content = content.replace(
    'className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 cursor-pointer border-r border-[#1a1a1a]/10 group"',
    'className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 cursor-pointer border-r border-[#1a1a1a]/10 group flex-shrink-0"'
)

with open(nav_path, "w") as f:
    f.write(content)
print("✅ SectionNav.tsx aggiornato")

# ─── 4. BreakingNewsSection.tsx — Testo più corto su mobile ─────────────────
breaking_path = "/home/ubuntu/ideasmart/client/src/components/BreakingNewsSection.tsx"
with open(breaking_path, "r") as f:
    content = f.read()

# Riduce il padding del contenuto su mobile
content = content.replace(
    'className="flex-1 flex items-center gap-3 px-4 overflow-hidden"',
    'className="flex-1 flex items-center gap-2 sm:gap-3 px-2 sm:px-4 overflow-hidden"'
)

with open(breaking_path, "w") as f:
    f.write(content)
print("✅ BreakingNewsSection.tsx aggiornato")

# ─── 5. index.css — Aggiunge scrollbar-none utility ─────────────────────────
css_path = "/home/ubuntu/ideasmart/client/src/index.css"
with open(css_path, "r") as f:
    content = f.read()

if "scrollbar-none" not in content:
    content += """
/* ── Mobile scrollbar hide ── */
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
"""

with open(css_path, "w") as f:
    f.write(content)
print("✅ index.css aggiornato con scrollbar-none")

print("\n✅ Tutti i fix mobile applicati con successo!")
