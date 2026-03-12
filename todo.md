# IDEASMART — TODO

## Completati

- [x] Aggiungere pulsanti "Condividi su LinkedIn" e "Condividi su Twitter/X" per ogni notizia nella sezione Ultime News AI
- [x] Sezione notizie dinamica nella Home con dati dal DB (tRPC news.getLatest)
- [x] Aggiungere sezione advertising/sponsor nella Home (banner con CTA email)
- [x] Aggiornare newsScheduler per aggiornamento giornaliero (ogni 24h, check ogni 6h)
- [x] Tabella news_items con campi sourceName e sourceUrl (migrazione DB)
- [x] Router tRPC news.getLatest e news.getRefreshHistory
- [x] Admin dashboard: pulsante "Aggiorna News AI Ora" per refresh manuale
- [x] Admin dashboard: storico aggiornamenti news con data e conteggio
- [x] Cron job giornaliero avviato all'avvio del server (startNewsScheduler)
- [x] Newsletter settimanale automatica ogni lunedì 09:00 ora italiana
- [x] Sistema disiscrizione GDPR-compliant con token univoci
- [x] 1.857 iscritti importati nel database
- [x] Template newsletter dark ufficiale IDEASMART
- [x] Admin dashboard per gestione iscritti e invio newsletter
- [x] Test invio email confermato (ac@foolfarm.com)

## In sospeso

- [ ] Aggiungere secondo banner pubblicitario nella sezione startup (tra le card)
- [ ] Aggiungere pagina /advertise con media kit e prezzi
- [ ] Implementare scraping RSS feeds reali (opzionale, ora si usa LLM)
- [ ] Verificare mittente newsletter@ideasmart.it su SendGrid

## Nuovi task (12 Mar 2026)

- [x] Schema DB: tabella daily_editorial (editoriale AI giornaliero)
- [x] Schema DB: tabella startup_of_day (startup del giorno)
- [x] Generatore LLM editoriale giornaliero sui trend AI
- [x] Generatore LLM + ricerca web startup del giorno emergente
- [x] Cron job giornaliero per editoriale e startup del giorno (ogni 24h)
- [x] Home.tsx: sezione Editoriale dinamica (sostituisce testo statico)
- [x] Home.tsx: sezione Startup del Giorno (nuova sezione)
- [x] tRPC procedures: editorial.getLatest e startupOfDay.getLatest
- [x] Admin dashboard: pulsanti refresh manuale editoriale e startup del giorno

## Nuovi task (12 Mar 2026 — Hero update)

- [x] Hero: aggiornare sottotitolo "L'Analisi Mensile · AI for Business" → "Il tuo punto di riferimento sull'AI · News ogni giorno aggiornate"
- [x] Hero: aggiornare descrizione da mensile a quotidiana
- [x] Hero: sostituire "N° 03 Marzo 2026" con data dinamica aggiornata ogni giorno
- [x] Hero: aggiornare "4 Startup analizzate" e "Leggi l'analisi del mese" con testo aggiornato

## Nuovi task (12 Mar 2026 — Reportage automatici)

- [x] Schema DB: tabella weekly_reportage (4 reportage settimanali su startup AI italiane)
- [x] Generatore LLM: 4 reportage settimanali con struttura editoriale (titolo, categoria, testo, quote, features, stats, link)
- [x] Cron job: ogni lunedì 00:00 genera 4 nuovi reportage
- [x] Home.tsx: sezioni reportage dinamiche dal DB (sostituisce i 4 reportage statici)
- [x] tRPC procedure: reportage.getLatestWeek
- [x] Admin dashboard: pulsante refresh manuale reportage
- [x] Generazione immediata dei reportage di oggi (12 Mar 2026)

## Nuovi task (12 Mar 2026 — Reportage + rimozione FoolFarm)

- [x] Schema DB: tabella weekly_reportage con struttura editoriale completa
- [x] Funzioni DB: saveWeeklyReportage, getLatestWeeklyReportage
- [x] Generatore LLM: 4 reportage su startup AI italiane (titolo, categoria, testo, quote, features, stats)
- [x] Cron job: ogni lunedì alle 00:00 genera 4 nuovi reportage
- [x] tRPC procedure: reportage.getLatestWeek e admin.refreshReportage
- [x] Generazione immediata dei 4 reportage di oggi
- [x] Home.tsx: sezione reportage dinamica dal DB (sostituisce i 4 statici)
- [x] Home.tsx: rimozione sezione FoolFarm ("Da dove nasce l'innovazione")
