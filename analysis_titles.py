"""Analisi duplicati e similarità titoli editoriali morning di Andrea Cinelli"""
from difflib import SequenceMatcher

titles = [
    ("2026-04-08", "AI Autonoma: La Nuova Frontiera del Business Italiano"),
    ("2026-04-07", "AI: La Rivoluzione Silenziosa che Modella il Futuro Aziendale Italiano"),
    ("2026-04-06", "L'AI Autonoma Ridefinisce il Lavoro: Siete Pronti, Italia?"),
    ("2026-04-05", "AI: La Rivoluzione Silenziosa che Ridefinisce il Business Italiano"),
    ("2026-04-04", "AI: La Rivoluzione Silenziosa che Ridefinisce il Business Italiano"),
    ("2026-04-03", "AI: Dalla Visione alla Valutazione. È Tempo di Misurare il Ritorno"),
    ("2026-04-02", "L'AI Autonoma: La Nuova Frontiera per il Business Italiano"),
    ("2026-04-01", "AI: La Rivoluzione Autonoma che Ridisegna il Business Italiano"),
    ("2026-03-31", "AI Autonoma: La Nuova Frontiera che Ridefinisce il Business Italiano"),
    ("2026-03-30", "Agenti Autonomi: La Rivoluzione Silenziosa che Ridefinisce il Lavoro"),
    ("2026-03-29", "AI: La Rivoluzione Silenziosa che Ridefinisce il Business Italiano"),
    ("2026-03-28", "Deeptech: Il Futuro dell'Italia tra Innovazione e Capitali"),
    ("2026-03-27", "AI Autonoma: La Rivoluzione Silenziosa Che Ridisegna il Lavoro"),
    ("2026-03-26", "Deeptech Italiano: Dalla Promessa alla Leadership Globale"),
    ("2026-03-25", "L'AI Autonoma: La Nuova Frontiera del Business Italiano"),
    ("2026-03-24", "AI e il Rinascimento delle Startup Italiane: Oltre l'Hype"),
    ("2026-03-23", "AI: La Nuova Normalità del Business Italiano"),
    ("2026-03-22", "AI: Il Futuro Autonomo è Già Qui, Pronti a Navigare?"),
    ("2026-03-21", "AI Generativa: Il Nuovo Acceleratore per le Startup Italiane"),
    ("2026-03-20", "Agenti Autonomi: La Nuova Frontiera dell'AI per il Business Italiano"),
    ("2026-03-19", "Deeptech: Il Futuro dell'Italia tra Ricerca e Mercato Globale"),
    ("2026-03-18", "AI Autonoma: Il Nuovo Imperativo per la Competitività Italiana"),
    ("2026-03-17", "AI nel Core Business: Il 72% delle Startup Europee ha Fatto il Salto Qualitativo"),
]

print(f"Totale editoriali morning: {len(titles)}\n")

# 1. Titoli identici
print("=" * 70)
print("1. TITOLI IDENTICI (100% uguali)")
print("=" * 70)
seen = {}
for date, title in titles:
    key = title.strip().lower()
    if key in seen:
        print(f"  DUPLICATO: \"{title}\"")
        print(f"    → {seen[key]} e {date}")
    else:
        seen[key] = date

# 2. Titoli molto simili (>70% similarità)
print("\n" + "=" * 70)
print("2. TITOLI MOLTO SIMILI (>70% similarità)")
print("=" * 70)
pairs = []
for i in range(len(titles)):
    for j in range(i + 1, len(titles)):
        ratio = SequenceMatcher(None, titles[i][1].lower(), titles[j][1].lower()).ratio()
        if ratio > 0.70:
            pairs.append((ratio, titles[i], titles[j]))

pairs.sort(key=lambda x: -x[0])
for ratio, (d1, t1), (d2, t2) in pairs:
    print(f"\n  Similarità: {ratio:.0%}")
    print(f"    [{d1}] {t1}")
    print(f"    [{d2}] {t2}")

# 3. Raggruppamento per tema ricorrente
print("\n" + "=" * 70)
print("3. RAGGRUPPAMENTO PER TEMA RICORRENTE")
print("=" * 70)
themes = {
    "AI Autonoma / Nuova Frontiera": [],
    "Rivoluzione Silenziosa / Ridefinisce": [],
    "Deeptech": [],
    "Agenti Autonomi": [],
    "Altro (unici)": [],
}
for date, title in titles:
    tl = title.lower()
    if "autonoma" in tl and ("frontiera" in tl or "imperativo" in tl):
        themes["AI Autonoma / Nuova Frontiera"].append((date, title))
    elif "rivoluzione silenziosa" in tl or ("ridefinisce" in tl and "rivoluzione" in tl):
        themes["Rivoluzione Silenziosa / Ridefinisce"].append((date, title))
    elif "deeptech" in tl:
        themes["Deeptech"].append((date, title))
    elif "agenti autonomi" in tl:
        themes["Agenti Autonomi"].append((date, title))
    else:
        themes["Altro (unici)"].append((date, title))

for theme, items in themes.items():
    print(f"\n  {theme} ({len(items)} articoli):")
    for date, title in items:
        print(f"    [{date}] {title}")

print("\n" + "=" * 70)
print("RIEPILOGO")
print("=" * 70)
print(f"  Totale editoriali: {len(titles)}")
print(f"  Titoli identici trovati: {sum(1 for d, t in titles if sum(1 for d2, t2 in titles if t2.strip().lower() == t.strip().lower()) > 1)}")
print(f"  Coppie con similarità >70%: {len(pairs)}")
