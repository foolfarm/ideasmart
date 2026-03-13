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

## Nuovi task (12 Mar 2026 — Analisi di Mercato)

- [ ] Schema DB: tabella market_analysis (4 analisi settimanali da media AI)
- [ ] Generatore LLM: 4 analisi di mercato AI da CB Insights, Sifted, TechCrunch, The Information
- [ ] Cron job: ogni 7 giorni genera 4 nuove analisi di mercato
- [ ] tRPC procedure: marketAnalysis.getLatest e admin.refreshMarketAnalysis
- [ ] Generazione immediata delle prime 4 analisi di oggi
- [ ] Home.tsx: sezione "Le Ultime Analisi di Mercato" con design editoriale
- [ ] Footer: aggiornato con link alle analisi di mercato

## Nuovi task (12 Mar 2026 — SEO + Notifiche)

- [ ] SEO: titolo pagina tra 30-60 caratteri (attuale: 27)
- [ ] SEO: descrizione meta tra 50-160 caratteri (attuale: 209)
- [ ] SEO: ridurre parole chiave da 13 a 3-8 concentrate
- [ ] SEO: aggiornare index.html con meta tag ottimizzati
- [ ] Notifiche: sistema di notifiche personalizzate per utenti iscritti
- [ ] Notifiche: tabella DB per preferenze notifiche utenti
- [ ] Notifiche: UI per gestire le preferenze di notifica

## Nuovi task (13 Mar 2026 — Font e Responsiveness Mobile)

- [ ] Aumentare dimensioni font in tutte le sezioni della Home (body, titoli, tag, label)
- [ ] Ottimizzare la hero section per mobile (font, layout, spaziatura)
- [ ] Ottimizzare le card news per mobile (grid, font, padding)
- [ ] Ottimizzare editoriale, startup del giorno, reportage e analisi di mercato per mobile
- [ ] Ottimizzare newsletter section e footer per mobile
- [ ] Aggiornare index.css con font base più grandi

## Nuovi task (13 Mar 2026 — Newsletter iscrizione)

- [ ] Schema DB: tabella newsletter_subscribers (email, nome, stato, token conferma)
- [ ] Funzioni DB: saveSubscriber, getSubscriberByEmail, confirmSubscriber, unsubscribe
- [ ] tRPC procedure: newsletter.subscribe, newsletter.confirm, newsletter.unsubscribe
- [ ] Email di conferma iscrizione via SendGrid
- [ ] Sezione newsletter nella landing page con form email + nome
- [ ] Pagina di conferma iscrizione (/newsletter/confirm)
- [ ] Admin dashboard: lista iscritti newsletter con statistiche

## Nuovi task (13 Mar 2026 — Pagina /advertise)

- [ ] Pagina /advertise con media kit professionale
- [ ] Sezione hero con statistiche audience (iscritti, lettori, engagement)
- [ ] Sezione formati pubblicitari con prezzi (5 formati)
- [ ] Sezione "Perché IDEASMART" con dati editoriali
- [ ] Form di contatto per inserzionisti
- [ ] Rotta /advertise in App.tsx
- [ ] Link "Advertising" nel footer e nel Navbar

## Nuovi task (13 Mar 2026 — Titolo Hero)

- [x] Hero: cambia main title in "AI4Business News" con "by IDEASMART" più piccolo sotto

## Nuovi task (13 Mar 2026 — Newsletter branding)

- [x] Sezione newsletter Home: aggiorna titolo e testo con "AI4Business News by IDEASMART"
- [x] Template email newsletter: aggiorna header con nuovo branding

## Nuovi task (13 Mar 2026 — SEO)

- [x] SEO: aggiorna titolo pagina a 30-60 caratteri con document.title nella Home

## Nuovi task (13 Mar 2026 — Newsletter di prova)

- [ ] Creare template newsletter completo con news + reportage + editoriale + startup + analisi
- [ ] Aggiungere procedura tRPC admin sendTestNewsletter per inviare a email specifica
- [ ] Aggiungere pulsante "Invia Newsletter di Prova" nella dashboard admin
- [ ] Inviare newsletter di prova a ac@acinelli.com

## Nuovi task (13 Mar 2026 — Fix Unsubscribe)

- [x] Fix: il link "Annulla iscrizione" nella newsletter non funziona — diagnosticare e correggere il flusso unsubscribe
- [x] Generati token unsubscribe per tutti i 1.857 iscritti importati
- [x] Aggiornato newsletterScheduler per inviare link unsubscribe personalizzato per ogni iscritto
- [x] Aggiornato script send-test-newsletter.mjs con link unsubscribe personalizzato
- [x] Inviata newsletter di prova a ac@acinelli.com con link unsubscribe funzionante
- [x] Aggiornato mittente email a info@foolfarm.com (verificato SendGrid)

## Nuovi task (13 Mar 2026 — Cambio mittente)

- [x] Aggiornare SENDGRID_FROM_EMAIL a info@ideasmart.ai

## Nuovi task (13 Mar 2026 — Google AdSense)

- [x] Inserire codice Google AdSense (ca-pub-7185482526978993) nell'head del sito

## Nuovi task (13 Mar 2026 — Ridisegno Newsletter Dark)

- [x] Riscrivere template HTML newsletter con stile dark navy identico alla landing page
- [x] Inviare email di prova con nuovo template a ac@acinelli.com

## Nuovi task (13 Mar 2026 — Newsletter Chiara)

- [x] Riscrivere template newsletter con sfondo bianco/chiaro stile editoriale landing page
- [x] Inviare email di prova newsletter chiara a ac@acinelli.com

## Nuovi task (13 Mar 2026 — Fix Newsletter Chiara definitivo)

- [x] Identificato problema: script di prova usava template HTML inline scuro separato da buildFullNewsletterHtml
- [x] Riscritto completamente scripts/send-test-newsletter.mjs con palette chiara (sfondo bianco, testo navy)
- [x] Inviata nuova email di prova chiara a ac@acinelli.com

## Nuovi task (13 Mar 2026 — Email Tracking & Admin Dashboard)

- [ ] Schema DB: tabella newsletter_sends (invii newsletter con statistiche per campagna)
- [ ] Schema DB: aggiungere colonne tracking a subscribers (openCount, lastOpenedAt, lastSentAt, totalSent)
- [ ] Endpoint GET /api/track/open?sid=TOKEN per pixel di tracciamento 1x1 px
- [ ] Aggiornare template email (script prova + buildFullNewsletterHtml) con pixel di tracciamento
- [ ] tRPC procedure: admin.getSubscribersWithStats (lista iscritti con stato apertura)
- [ ] Admin dashboard: tabella iscritti con colonne email, stato, aperture, ultima apertura, data iscrizione
- [ ] Admin dashboard: statistiche campagna (totale inviati, aperti, % apertura, disiscritti)

## Nuovi task (13 Mar 2026 — Dashboard Performance Newsletter)

- [x] Aggiungere procedure tRPC admin: getNewsletterCampaignStats, getSubscribersWithTracking
- [x] Creare pagina admin /admin/newsletter-performance con statistiche campagne e tabella iscritti
- [x] Aggiungere link "Performance" nell'header della dashboard admin

## Nuovi task (13 Mar 2026 — Privacy, GDPR, Mittente)

- [x] Aggiornare SENDGRID_FROM_NAME a "AI4Business News by IDEASMART"
- [x] Creare pagina /privacy con Privacy Policy e Disclaimer GDPR completi
- [x] Aggiungere link /privacy nel footer della landing page
- [x] Aggiungere link /privacy nel footer delle email newsletter
- [x] Inviare newsletter di prova con tracking attivo a ac@acinelli.com

## Nuovi task (13 Mar 2026 — Banner Cookie GDPR)

- [x] Creare hook useCookieConsent con persistenza localStorage
- [x] Creare componente CookieBanner con pannello preferenze per categoria
- [x] Integrare banner in App.tsx
- [x] Bloccare Google AdSense finché non c'è consenso ai cookie pubblicitari
- [x] Aggiungere link "Gestisci preferenze cookie" nel footer della landing page
