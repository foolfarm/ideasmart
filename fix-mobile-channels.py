"""
Fix mobile layout per le pagine canali di ProofPress:
- Riduce le altezze delle immagini hero su mobile
- Riduce il padding delle sezioni su mobile
- Ottimizza le griglie per mobile
"""
import os
import re

pages = [
    "/home/ubuntu/ideasmart/client/src/pages/AiHome.tsx",
    "/home/ubuntu/ideasmart/client/src/pages/StartupHome.tsx",
    "/home/ubuntu/ideasmart/client/src/pages/DealroomHome.tsx",
    "/home/ubuntu/ideasmart/client/src/pages/Research.tsx",
    "/home/ubuntu/ideasmart/client/src/components/ChannelPage.tsx",
]

for path in pages:
    if not os.path.exists(path):
        print(f"⚠️  Non trovato: {path}")
        continue
    
    with open(path, "r") as f:
        content = f.read()
    
    original = content
    
    # Riduce le immagini hero su mobile: h-56 → h-40 sm:h-56, h-52 → h-36 sm:h-52
    content = content.replace(
        'className={`w-full ${large ? "h-56" : "h-40"} object-cover',
        'className={`w-full ${large ? "h-40 sm:h-56" : "h-32 sm:h-40"} object-cover'
    )
    content = content.replace(
        'className="w-full h-52 object-cover',
        'className="w-full h-36 sm:h-52 object-cover'
    )
    content = content.replace(
        'className="w-full h-56 object-cover',
        'className="w-full h-40 sm:h-56 object-cover'
    )
    content = content.replace(
        'className="w-full h-48 object-cover',
        'className="w-full h-36 sm:h-48 object-cover'
    )
    
    # Riduce il padding del main su mobile
    content = content.replace(
        'className="max-w-6xl mx-auto px-4 pb-12"',
        'className="max-w-6xl mx-auto px-3 sm:px-4 pb-12"'
    )
    content = content.replace(
        'className="max-w-[1200px] mx-auto px-4"',
        'className="max-w-[1200px] mx-auto px-3 sm:px-4"'
    )
    
    if content != original:
        with open(path, "w") as f:
            f.write(content)
        print(f"✅ {os.path.basename(path)} aggiornato")
    else:
        print(f"ℹ️  {os.path.basename(path)} — nessuna modifica necessaria")

# ─── Fix Home.tsx: immagine hero principale su mobile ───────────────────────
home_path = "/home/ubuntu/ideasmart/client/src/pages/Home.tsx"
with open(home_path, "r") as f:
    content = f.read()

original = content

# Riduce l'altezza dell'immagine hero principale su mobile
content = content.replace(
    'style={{ height: "420px", borderRadius: "10px"',
    'style={{ height: "clamp(200px, 50vw, 420px)", borderRadius: "10px"'
)

# Riduce il font del titolo hero su mobile
content = content.replace(
    'fontSize: "clamp(30px, 4vw, 42px)"',
    'fontSize: "clamp(22px, 4vw, 42px)"'
)

# Riduce il testo del summary su mobile
content = content.replace(
    'className="mt-3 text-[17px] leading-relaxed text-[#1a1a1a]/75"',
    'className="mt-3 text-[15px] sm:text-[17px] leading-relaxed text-[#1a1a1a]/75"'
)

if content != original:
    with open(home_path, "w") as f:
        f.write(content)
    print("✅ Home.tsx aggiornato (immagini e font mobile)")
else:
    print("ℹ️  Home.tsx — nessuna modifica necessaria")

print("\n✅ Fix mobile canali completato!")
