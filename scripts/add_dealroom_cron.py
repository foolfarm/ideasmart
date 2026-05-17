#!/usr/bin/env python3
"""Aggiunge il cron dealroom-morning alle 11:00 in schedulerManager.ts"""

with open('server/schedulerManager.ts', 'r') as f:
    content = f.read()

# 1. Aggiorna il commento intestazione LINKEDIN AUTOPOST
old_header = """  // LINKEDIN AUTOPOST — 5 post giornalieri:
  //   10:00 CET — AI News (morning)
  //   12:30 CET — 2° Editoriale AI su ricerche di mercato (ai-research-morning)
  //   14:30 CET — 2° AI News (research)
  //   16:00 CET — 2° Ricerche di mercato (research-afternoon)
  //   18:00 CET — Startup News (startup-evening)"""
new_header = """  // LINKEDIN AUTOPOST — 6 post giornalieri:
  //   10:00 CET — AI News (morning)
  //   11:00 CET — Dealroom Funding & VC (dealroom-morning)
  //   12:30 CET — 2° Editoriale AI su ricerche di mercato (ai-research-morning)
  //   14:30 CET — Proof Press Research (research)
  //   16:00 CET — 2° Ricerche di mercato (research-afternoon)
  //   18:00 CET — Startup News (startup-evening)"""
assert old_header in content, "ERRORE: intestazione LINKEDIN AUTOPOST non trovata"
content = content.replace(old_header, new_header, 1)
print('1. Intestazione aggiornata OK')

# 2. Inserisce il cron 11:00 dopo il cron 10:00
old_cron_10 = """  // 2° Editoriale AI — 12:30 CET (ricerche di mercato AI di alto livello)
  cron.schedule("30 12 * * *", async () => {"""
new_cron_11_plus = """  // Dealroom Mattino — 11:00 CET (Funding & VC)
  cron.schedule("0 11 * * *", async () => {
    console.log("[SchedulerManager] ⏰ 11:00 CET — Pubblicazione LinkedIn DEALROOM MATTINO (Funding & VC)...");
    await withLock("linkedin-dealroom-morning", async () => {
      try {
        const result = await publishLinkedInPost("dealroom-morning");
        console.log(`[SchedulerManager] ✅ LinkedIn DEALROOM MATTINO: ${result.published}/1 post pubblicati`);
        if (result.errors.length > 0) {
          console.error("[SchedulerManager] ⚠️ LinkedIn DEALROOM MATTINO errori:", result.errors);
        }
        invalidateBySection("home");
      } catch (err) {
        console.error("[SchedulerManager] ❌ Errore LinkedIn DEALROOM MATTINO:", err);
      }
    });
  }, { timezone: TZ });
  // 2° Editoriale AI — 12:30 CET (ricerche di mercato AI di alto livello)
  cron.schedule("30 12 * * *", async () => {"""
assert old_cron_10 in content, "ERRORE: cron 12:30 non trovato per inserire 11:00"
content = content.replace(old_cron_10, new_cron_11_plus, 1)
print('2. Cron 11:00 aggiunto OK')

# 3. Aggiunge dealroom-morning al catch-up
old_catchup = '        ["morning", 10 * 60, "MATTINO (10:00)"],'
new_catchup = '        ["morning", 10 * 60, "MATTINO (10:00)"],\n        ["dealroom-morning", 11 * 60, "DEALROOM MATTINO (11:00)"],'
assert old_catchup in content, "ERRORE: catch-up morning non trovato"
content = content.replace(old_catchup, new_catchup, 1)
print('3. Catch-up dealroom-morning aggiunto OK')

# 4. Aggiorna il commento catch-up slot IT
old_catchup_comment = '  // Slot IT: morning (10:00), ai-research-morning (12:30), research (14:30), research-afternoon (16:00), startup-evening (18:00)'
new_catchup_comment = '  // Slot IT: morning (10:00), dealroom-morning (11:00), ai-research-morning (12:30), research (14:30), research-afternoon (16:00), startup-evening (18:00)'
if old_catchup_comment in content:
    content = content.replace(old_catchup_comment, new_catchup_comment, 1)
    print('4. Commento catch-up aggiornato OK')
else:
    print('4. Commento catch-up non trovato (non critico)')

# 5. Aggiorna il log di riepilogo
old_log = '  console.log("[SchedulerManager]   🤖 LinkedIn MATTINO       → ogni giorno alle 10:00 CET (AI News)");'
new_log = '  console.log("[SchedulerManager]   🤖 LinkedIn MATTINO       → ogni giorno alle 10:00 CET (AI News)");\n  console.log("[SchedulerManager]   💰 LinkedIn DEALROOM      → ogni giorno alle 11:00 CET (Funding & VC)");'
if old_log in content:
    content = content.replace(old_log, new_log, 1)
    print('5. Log riepilogo aggiornato OK')
else:
    # Prova con variante
    old_log2 = '  console.log("[SchedulerManager]   🤖 LinkedIn MATTINO'
    idx = content.find(old_log2)
    if idx >= 0:
        end_idx = content.find('\n', idx) + 1
        line = content[idx:end_idx]
        content = content[:end_idx] + '  console.log("[SchedulerManager]   💰 LinkedIn DEALROOM      → ogni giorno alle 11:00 CET (Funding & VC)");\n' + content[end_idx:]
        print('5. Log riepilogo aggiornato OK (variante)')
    else:
        print('5. Log riepilogo non trovato (non critico)')

with open('server/schedulerManager.ts', 'w') as f:
    f.write(content)
print('File salvato OK')
