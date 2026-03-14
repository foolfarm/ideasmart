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

## Nuovi task (13 Mar 2026 — Aggiornamento email footer)

- [x] Aggiornare email contatto nel footer da ac@foolfarm.com a info@ideasmart.ai
- [x] Verificare tutti i riferimenti obsoleti a ac@foolfarm.com nel codice (Home.tsx, Advertise.tsx, Admin.tsx, email.ts, scripts)

## Nuovi task (13 Mar 2026 — Primo invio newsletter a tutta la lista)

- [x] Inviare la prima newsletter a tutti i 1.859 iscritti attivi (1859/1859 consegnate, 0 fallimenti)
- [x] Configurare routine automatica newsletter ogni venerdì alle 10:00 CET

## Nuovi task (13 Mar 2026 — Pulizia lista bounce/spam)

- [x] Recuperare lista bounce e spam report da SendGrid API (44 bounce, 2 spam, 1 invalid)
- [x] Aggiornare iscritti con bounce/spam come unsubscribed nel DB (33 disattivati, 1821 attivi rimasti)

## Nuovi task (13 Mar 2026 — Importazione nuovi iscritti da CSV)

- [x] Leggere e analizzare il file email_nuove_da_contatti.valids.csv (2883 email valide)
- [x] Importare i nuovi indirizzi nel DB evitando duplicati (2883 aggiunti, 0 duplicati, 4704 attivi totali)

## Nuovi task (13 Mar 2026 — Google ads.txt)

- [ ] Creare file ads.txt con dichiarazione Google AdSense (google.com, pub-7185482526978993, DIRECT, f08c47fec0942fa0)
- [ ] Aggiungere meta tag google-adsense-account nell'head dell'index.html

## Nuovi task (13 Mar 2026 — Immagini articoli)

- [ ] Aggiungere colonna imageUrl a news, reportage, editoriale, analisi, startup nel DB
- [ ] Creare procedura tRPC admin per generare immagini AI per ogni articolo
- [ ] Aggiornare componenti frontend per mostrare immagini accanto agli articoli
- [ ] Generare immagini AI per gli articoli esistenti

## Nuovi task (14 Mar 2026 — Generazione automatica immagini AI)

- [x] Creare helper centralizzato imageAutoGen.ts con funzioni per ogni tipo di contenuto
- [x] Integrare genImageForNews in newsScheduler: ogni notizia riceve immagine al momento della creazione
- [x] Integrare genImageForEditorial in dailyContentScheduler: ogni editoriale riceve immagine automatica
- [x] Integrare genImageForStartup in dailyContentScheduler: ogni startup del giorno riceve immagine automatica
- [x] Integrare genImageForReportage in weeklyReportageScheduler: ogni reportage riceve immagine automatica
- [x] Integrare genImageForMarketAnalysis in marketAnalysisScheduler: ogni analisi riceve immagine automatica
- [x] Creare backfillImages.ts: genera immagini per tutti gli articoli esistenti senza immagine
- [x] Avviare backfill automatico 30 secondi dopo l'avvio del server (scheduleImageBackfill)
- [x] Backfill completato: 20 news + 3 editoriali + 3 startup + 4 reportage + 4 analisi = 34 immagini generate

## Nuovi task (14 Mar 2026 — AdSense ottimizzato)

- [x] Creare componente AdUnit.tsx riutilizzabile per le unità pubblicitarie AdSense
- [x] Creare file ads.txt con dichiarazione Google AdSense
- [x] Inserire banner AdSense responsive tra sezione News e Editoriale
- [x] Inserire banner AdSense tra sezione Startup e Reportage
- [x] Inserire banner AdSense tra sezione Reportage e Analisi di Mercato
- [x] Inserire banner AdSense prima della sezione Newsletter

## Nuovi task (14 Mar 2026 — Fix immagini e banner)

- [ ] Fix: le immagini non appaiono nelle card news (imageUrl presente nel DB ma non mostrata nel layout)
- [ ] Fix: i banner AdSense non sono visibili (il componente AdUnit richiede consenso cookie ma l'utente non ha ancora accettato)
- [ ] Aggiungere placeholder visivo per i banner AdSense quando non c'è consenso

## Nuovi task (14 Mar 2026 — Immagini stock Unsplash, zero costi AI)

- [ ] Rimuovere imageAutoGen.ts e backfillImages.ts (generazione AI immagini)
- [ ] Creare helper unsplashImages.ts con ricerca per parole chiave (API Unsplash gratuita)
- [ ] Aggiornare tutti gli scheduler per usare Unsplash invece di AI
- [ ] Fix: includere imageUrl nella risposta tRPC news.getLatest
- [ ] Aggiornare layout card news per mostrare immagine accanto al testo
- [ ] Backfill immagini Unsplash per tutti gli articoli esistenti
- [ ] Fix banner AdSense: mostrare placeholder visivo anche senza consenso cookie

## Nuovi task (14 Mar 2026 — Immagini stock Pexels + layout card news)

- [x] Sostituire generazione AI immagini con immagini stock Pexels gratuite (zero costi)
- [x] Creare helper stockImages.ts con ricerca Pexels multi-keyword per categoria
- [x] Aggiornare tutti gli scheduler per usare findNewsImage/findEditorialImage/findStartupImage/findReportageImage/findMarketAnalysisImage
- [x] Aggiornare tRPC news.getLatest per includere imageUrl nella risposta
- [x] Nuovo layout card news: immagine a sinistra + testo a destra (layout editoriale orizzontale)
- [x] Placeholder colorato per articoli senza immagine
- [x] Backfill immagini Pexels per tutti gli articoli esistenti (20 news + 3 editoriali + 3 startup + 4 reportage + 4 analisi = 34/34)
- [x] Correggere AdUnit: mostrare banner AdSense sempre (senza blocco consenso cookie)

## Nuovi task (14 Mar 2026 — Contatore iscritti dinamico)

- [x] Aggiungere procedura tRPC newsletter.getActiveCount per contare iscritti attivi dal DB
- [x] Aggiornare sezione newsletter nella Home con numero esatto iscritti attivi (dinamico)

## Nuovi task (14 Mar 2026 — Routine automatiche)

- [x] Verificare e centralizzare tutti gli scheduler nel file schedulerManager.ts
- [x] News: aggiornamento ogni giorno alle 00:00 CET
- [x] Editoriale + Startup del giorno: ogni giorno alle 00:05 CET
- [x] Reportage: ogni lunedì alle 00:15 CET
- [x] Analisi di mercato: ogni lunedì alle 00:20 CET
- [x] Newsletter: ogni lunedì e venerdì alle 10:00 CET
- [x] Immagini stock: generate automaticamente per ogni nuovo contenuto (Pexels)

## Nuovi task (14 Mar 2026 — Importazione nuovi iscritti)

- [x] Importare lista_contatti_email.valids.csv (897 email valide): 750 nuovi aggiunti, 147 duplicati saltati, 5.452 iscritti attivi totali

## Refactoring Multisettore (14 Mar 2026)

### Fase 1 — Schema DB e architettura
- [ ] Aggiungere colonna `section` ('ai'|'music') a tutte le tabelle contenuto
- [ ] Aggiungere colonna `newsletter` ('ai4business'|'itsmusic') alla tabella subscribers
- [ ] Eseguire migrazione DB (pnpm db:push)

### Fase 2 — Sezione /ai
- [ ] Spostare la Home attuale su /ai (AI4Business News)
- [ ] Aggiornare tutti i router tRPC per filtrare per section='ai'
- [ ] Aggiornare tutti gli scheduler AI per salvare con section='ai'
- [ ] Aggiornare la navbar con link /ai

### Fase 3 — Sezione /music (ITsMusic)
- [ ] Creare musicNewsScheduler.ts per news Rock/Indie/AI Music
- [ ] Creare musicDailyContentScheduler.ts per editoriale + artista del giorno
- [ ] Creare musicReportageScheduler.ts per reportage settimanali
- [ ] Creare musicMarketAnalysisScheduler.ts per analisi mercato musicale
- [ ] Creare pagina /music con design viola/magenta
- [ ] Aggiungere route /music in App.tsx

### Fase 4 — Homepage Hub
- [ ] Creare nuova homepage / con mix notizie AI + Music
- [ ] Design hub multitematico con sezioni distinte per ogni area
- [ ] Link a /ai e /music dalle rispettive sezioni

### Fase 5 — Newsletter ITsMusic
- [ ] Creare musicNewsletterScheduler.ts per ITsMusic
- [ ] Aggiornare schedulerManager.ts con newsletter ITsMusic (lun+ven 10:00)
- [ ] Aggiornare form iscrizione con scelta newsletter

### Fase 6 — Admin unificato
- [ ] Aggiornare dashboard admin con tab AI / Music
- [ ] Aggiungere trigger manuale per scheduler music

### Fase 7 — Test e deploy
- [ ] TypeScript 0 errori
- [ ] Test vitest passano
- [ ] Checkpoint finale

## Refactoring Multisettore (14 Mar 2026)

- [x] Schema DB: aggiunta colonna section a tutte le tabelle contenuto (news, editorial, startup, reportage, analisi)
- [x] Schema DB: aggiunta colonna newsletter agli iscritti (ai4business, itsmusic, both)
- [x] Migrazione DB eseguita con pnpm db:push
- [x] Aggiornati tutti i record esistenti con section='ai'
- [x] Aggiornate tutte le procedure tRPC per filtrare per section
- [x] Aggiornati tutti gli scheduler AI per salvare con section='ai'
- [x] Creata pagina AiHome.tsx per la sezione /ai (clone della Home AI)
- [x] Creata pagina MusicHome.tsx per la sezione /music (design viola/magenta)
- [x] Creato musicScheduler.ts con scheduler Rock/Indie/AI Music
- [x] Creato musicNewsletterScheduler.ts per la newsletter ITsMusic
- [x] Aggiornato schedulerManager.ts con tutti gli scheduler musicali
- [x] Riscritta Home.tsx come homepage hub multitematica di IDEASMART
- [x] Aggiornata Admin dashboard con sezioni ITsMusic e statistiche separate
- [x] Aggiornate route in App.tsx: / (hub), /ai (AI4Business), /music (ITsMusic)

## Nuovi task (14 Mar 2026 — Commenti, Social Sharing, Popolamento /music)

- [ ] Schema DB: tabella article_comments (id, articleType, articleId, section, authorName, authorEmail, content, createdAt, approved)
- [ ] Procedure tRPC: comments.add, comments.getByArticle, comments.approve (admin)
- [ ] Componente CommentSection.tsx riutilizzabile per /ai e /music
- [ ] Pulsanti social sharing (LinkedIn, Twitter/X, WhatsApp, Copia link) su ogni articolo
- [ ] Popolare /music: 20 notizie Rock/Indie/AI Music
- [ ] Popolare /music: editoriale della settimana
- [ ] Popolare /music: artista della settimana = Bark Psychosis
- [ ] Popolare /music: 4 reportage ultime novità Indie e AI Music
- [ ] Popolare /music: analisi di mercato musicale Indie e AI Music

## Nuovi task (14 Mar 2026 — Commenti, Social Sharing, Sezione Music)

- [x] Schema DB: tabella article_comments per commenti su articoli
- [x] Procedure tRPC: comments.add e comments.getByArticle
- [x] Componente CommentSection.tsx riutilizzabile (sezione commenti sotto ogni articolo)
- [x] Componente SocialShare.tsx riutilizzabile (pulsanti LinkedIn, X, WhatsApp, copia link)
- [x] Integrazione CommentSection e SocialShare in AiHome.tsx
- [x] Integrazione CommentSection e SocialShare in MusicHome.tsx
- [x] Seed /music: 20 notizie Rock/Indie/AI Music con immagini Pexels
- [x] Seed /music: editoriale della settimana (AI e Musica)
- [x] Seed /music: artista della settimana — Bark Psychosis
- [x] Seed /music: 4 reportage Indie/AI Music (Bark Psychosis, Suno AI, Indie Italia, Mubert)
- [x] Seed /music: 4 analisi di mercato musicale (IFPI, Goldman Sachs, Spotify, Pollstar)
