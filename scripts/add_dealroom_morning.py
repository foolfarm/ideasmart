#!/usr/bin/env python3
"""Aggiunge lo slot dealroom-morning a linkedinPublisher.ts"""

with open('server/linkedinPublisher.ts', 'r') as f:
    content = f.read()

# 1. Aggiungo dealroom-morning al tipo LinkedInSlot
old_type = 'export type LinkedInSlot = "morning" | "ai-research-morning" | "research" | "research-afternoon" | "dealroom" | "startup-afternoon" | "startup-evening" | "ai-tool-radar" | "afternoon" | "evening" | "en-evening-news" | "en-ai-research" | "en-research" | "en-research-late" | "weekend-digest" | "thought-leadership";'
new_type = 'export type LinkedInSlot = "morning" | "ai-research-morning" | "dealroom-morning" | "research" | "research-afternoon" | "dealroom" | "startup-afternoon" | "startup-evening" | "ai-tool-radar" | "afternoon" | "evening" | "en-evening-news" | "en-ai-research" | "en-research" | "en-research-late" | "weekend-digest" | "thought-leadership";'
assert old_type in content, "ERRORE: tipo LinkedInSlot non trovato"
content = content.replace(old_type, new_type, 1)
print('1. Tipo LinkedInSlot aggiornato OK')

# 2. Aggiungo dealroom-morning alla funzione selectSection
old_select = '  if (slot === "dealroom") return "dealroom";'
new_select = '  if (slot === "dealroom-morning") return "dealroom";\n  if (slot === "dealroom") return "dealroom";'
assert old_select in content, "ERRORE: selectSection dealroom non trovato"
content = content.replace(old_select, new_select, 1)
print('2. selectSection aggiornato OK')

# 3. Aggiungo prompt per dealroom-morning (prima del blocco dealroom esistente)
old_prompt_marker = '  } else if (slot === "dealroom") {\n    slotNote = `Questo è il POST DEALROOM (18:00)'
new_prompt_block = '''  } else if (slot === "dealroom-morning") {
    slotNote = `Questo è il POST DEALROOM MATTINO (11:00) — Sezione Funding & VC.
Tono: insider del mondo VC e degli investimenti. Il tuo pubblico è composto da founder, investitori e manager che leggono la mattina per aggiornarsi sui deal della notte.
Focus: analizza il round/deal di investimento più rilevante delle ultime 24 ore — chi ha raccolto, quanto, da chi, e perché è strategicamente importante per l'ecosistema italiano ed europeo.
Struttura:
1. APERTURA (2-3 righe): inizia con il dato concreto del deal (es. "X ha chiuso un Series B da Y milioni guidato da Z"). Non iniziare con "Oggi", "Ho analizzato".
2. SVILUPPO (2 paragrafi): contestualizza il deal — settore, posizionamento competitivo, trend di mercato che lo spiega. Usa dati (valuation, ARR, crescita) se disponibili.
3. IMPLICAZIONE (1 paragrafo): cosa significa per l'ecosistema italiano/europeo? Chi sono i vincitori e i perdenti?
4. CHIUSURA (1-2 righe): una domanda o provocazione per chi investe o fonda startup.
5. FIRMA: NON aggiungere firma — viene inserita automaticamente dal sistema
6. CTA: NON aggiungere CTA o link — vengono inseriti automaticamente dal sistema
7. HASHTAG: #Dealroom #Funding #VentureCapital #Startup #Investment #ProofPress #StartupItalia #VC
LUNGHEZZA: MASSIMO 3000 caratteri. Target 1500-2200 caratteri.
EVITA: asterischi per formattazione, frasi in seconda persona ("puoi", "devi"), tono da consulente teorico.`;
  } else if (slot === "dealroom") {
    slotNote = `Questo è il POST DEALROOM (18:00)'''

assert old_prompt_marker in content, "ERRORE: marker prompt dealroom non trovato"
content = content.replace(old_prompt_marker, new_prompt_block, 1)
print('3. Prompt dealroom-morning aggiunto OK')

# 4. Aggiungo dealroom-morning alla SLOT_LABELS
old_labels = '    dealroom: "DEALROOM (legacy)",'
new_labels = '    "dealroom-morning": "DEALROOM MATTINO (11:00)",\n    dealroom: "DEALROOM (legacy)",'
assert old_labels in content, "ERRORE: SLOT_LABELS dealroom non trovato"
content = content.replace(old_labels, new_labels, 1)
print('4. SLOT_LABELS aggiornato OK')

# 5. Aggiungo dealroom-morning nel blocco di selezione contenuto
old_content_block = '  } else if (slot === "dealroom") {\n    // Slot Dealroom: recupera uno degli ultimi deal\n    const deal = await getDealForLinkedIn(recentPostTitles);'
new_content_block = '''  } else if (slot === "dealroom-morning") {
    // Slot Dealroom Mattino (11:00): recupera il deal più rilevante delle ultime 24h
    const deal = await getDealForLinkedIn(recentPostTitles);
    if (!deal) {
      console.warn(`[LinkedIn] ⚠️ Nessun deal disponibile per slot ${slotLabel}. Pubblicazione saltata.`);
      return {
        published: 0,
        errors: ["Nessun deal disponibile per il post LinkedIn Dealroom Mattino"],
        posts: []
      };
    }
    contentTitle = deal.title;
    contentBody = deal.body;
    contentKeyTrend = deal.keyTrend;
    contentImageUrl = deal.imageUrl;
    console.log(`[LinkedIn] 💰 Deal mattino selezionato: "${contentTitle.slice(0, 60)}..."`);
  } else if (slot === "dealroom") {
    // Slot Dealroom: recupera uno degli ultimi deal
    const deal = await getDealForLinkedIn(recentPostTitles);'''
assert old_content_block in content, "ERRORE: content block dealroom non trovato"
content = content.replace(old_content_block, new_content_block, 1)
print('5. Content block dealroom-morning aggiunto OK')

with open('server/linkedinPublisher.ts', 'w') as f:
    f.write(content)
print('File salvato OK')
