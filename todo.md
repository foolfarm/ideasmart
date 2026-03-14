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

## Nuovi task (14 Mar 2026 — Leggibilità, Font e Responsive Mobile)

- [x] AiHome: aumentare font titoli notizie, body text, tag categoria — contrasto testo scuro su sfondo chiaro
- [x] AiHome: aumentare spaziatura tra card news, padding interno, line-height
- [x] AiHome: correggere colori testo su sfondo chiaro (da grigio chiaro a grigio scuro/navy)
- [x] MusicHome: aumentare font e spaziature, migliorare leggibilità su sfondo scuro
- [x] MusicHome: card news responsive (immagine sopra su mobile, affiancata su desktop)
- [x] Responsive mobile: Navbar hamburger menu animato funzionante
- [x] Responsive mobile: card news a colonna singola su mobile con immagine sopra
- [x] Responsive mobile: sezioni editoriale, artista, reportage, analisi ottimizzate
- [ ] Home hub: aumentare font e spaziature sezioni
- [ ] Responsive mobile: Hero section ottimizzata (font, layout, CTA)

## Nuovi task (14 Mar 2026 — Home Hub Redesign)

- [x] Home: Navbar differenziata — hub con Canali/Chi siamo/Advertising, sezioni /ai e /music con News/Editoriale/Startup/Reportage/Analisi
- [x] Home: Sezione canali più grande con descrizioni estese e font aumentati
- [x] Home: Logo IDEASMART visibile ovunque nella home hub
- [x] Home: Ultime notizie in layout verticale con font grandi e alta leggibilità

## Nuovi task (14 Mar 2026 — SEO Indipendente per canali)

- [x] Creare componente SEOHead per gestione dinamica di title, description, OG, canonical
- [x] Homepage hub /: SEO IDEASMART — testata multicanale AI e Musica
- [x] Canale /ai: SEO AI4Business News — intelligenza artificiale, startup, business
- [x] Canale /music: SEO ITsMusic — rock, indie, industria musicale
- [x] index.html: meta tag di base, canonical, robots, sitemap hint
- [x] sitemap.xml con le 3 pagine principali
- [x] robots.txt con regole crawler e riferimento sitemap
- [x] JSON-LD structured data (Schema.org WebSite + NewsMediaOrganization) per ogni canale

## Nuovi task (14 Mar 2026 — Audit Coerenza Contenuti)

- [x] Analizzare schema DB notizie e struttura sourceUrl
- [x] Aggiungere tabella content_audit con campi status, coherenceScore, auditNote, extractedText, httpStatus
- [x] Creare server/auditContent.ts: helper fetch URL + estrazione testo + verifica LLM
- [x] Creare procedure tRPC audit.runBatch, audit.getResults, audit.getStats, audit.deleteResult
- [x] Creare pagina /admin/audit con dashboard notizie flaggate, filtri, score bar
- [x] Integrare audit automatico post-inserimento in newsScheduler.ts (background, non bloccante)
- [x] Aggiungere link Audit Contenuti nella navbar admin
- [x] TypeScript: 0 errori

## Nuovi task (14 Mar 2026 — Audit Automatico 24h + Reportage)

- [x] auditContent.ts: aggiungere auditReportage() per i reportage settimanali (ctaUrl/websiteUrl come fonte)
- [x] auditContent.ts: aggiungere runFullAudit() che copre news + analisi + reportage
- [x] Creare server/auditScheduler.ts con job automatico ogni 24 ore
- [x] auditScheduler: notifica email admin (info@andreacinelli.com) se >=2 errori o >=4 warning
- [x] Integrare startAuditScheduler() nell'avvio del server (_core/index.ts)
- [x] Aggiungere procedure tRPC: audit.getSchedulerStatus, audit.runFullAuditNow, audit.triggerScheduledAudit, audit.auditSingleReportage
- [x] Dashboard /admin/audit: stato scheduler live, filtro reportage, audit completo, pulsante esegui ora
- [x] TypeScript: 0 errori, server riavviato

## Nuovi task (14 Mar 2026 — Advertise + Hero Mobile + Audit)

- [x] Pagina /advertise con media kit professionale — già esistente e completa
- [x] Form contatto inserzionisti con invio email via SendGrid (tRPC advertise.contact + email admin + conferma inserzionista)
- [x] Rotta /advertise in App.tsx — già presente
- [x] Ottimizzare hero section homepage hub per mobile (font 5xl mobile, griglia 2x2 statistiche, CTA full-width)
- [x] Audit automatico avviato in background (scheduler ogni 24h attivo dal riavvio server)

## Nuovi task (14 Mar 2026 — Icona Mobile e PWA)

- [x] Generare icona IDEASMART 512x512px (sfondo navy #0a0f1e, testo IDEA+SMART teal)
- [x] Generare varianti 192px, 180px (apple-touch-icon), 32px favicon, 16px, .ico
- [x] Caricare icone su CDN webdev (5 file)
- [x] Creare manifest.json con nome, short_name, colori brand, icone, shortcuts AI/Music
- [x] Aggiornare index.html con meta tag PWA, apple-touch-icon, theme-color teal, manifest link
- [x] Favicon branded in tutte le dimensioni (16, 32, .ico)

## Nuovi task (14 Mar 2026 — Splash Screen iOS e Filtro Notizie)

- [x] Generare splash screen iOS 390x844 (iPhone 14/15)
- [x] Generare splash screen iOS 414x896 (iPhone 11/XR)
- [x] Generare splash screen iOS 428x926 (iPhone 14 Plus/13 Pro Max)
- [x] Caricare splash screen su CDN e aggiungere meta tag apple-touch-startup-image in index.html
- [x] Implementare filtro automatico: notizie con auditScore < 40 o URL non raggiungibili nascoste dalla homepage (getLatestNewsFiltered)
- [x] Sostituzione automatica: procedura tRPC news.replaceAllLowScore genera contenuto AI alternativo per notizie sotto soglia
- [x] Pannello sostituzione in /admin/audit con selezione sezione e pulsante sostituzione
- [x] TypeScript: 0 errori

## Nuovi task (14 Mar 2026 — Sostituzione notizie + Articolo singolo)

- [x] Eseguire sostituzione automatica notizie score<40 per AI4Business (20/20 sostituite) e ITsMusic (0 da sostituire)
- [x] Creare pagina /ai/news/[id] con sommario espanso, fonti, contenuti correlati, SEO, commenti
- [x] Creare pagina /music/news/[id] con design dark ITsMusic, correlati, SEO, commenti
- [x] Aggiornare App.tsx con le nuove route /ai/news/:id e /music/news/:id
- [x] Aggiornare link immagine e titolo in AiHome per puntare a /ai/news/[id]
- [x] Aggiornare link "Leggi" in MusicHome per puntare a /music/news/[id]
- [x] SEO: meta tag dinamici per ogni articolo (title, description, og:image, canonical, JSON-LD NewsArticle)
- [x] TypeScript: 0 errori

## Nuovi task (14 Mar 2026 — Bug Fix Notizie ITsMusic)

- [x] Diagnosticato: AiHome e MusicHome usavano fallback statico con ID 1-20 quando il DB era lento
- [x] Correggere AiHome: rimosso fallback statico, usa solo ID reali dal DB (150003-150022)
- [x] Correggere MusicHome: rimosso fallback statico, usa solo ID reali dal DB
- [x] Generare 20 notizie ITsMusic nel DB (ID 150023-150042) tramite script AI
- [x] Aggiunto empty state "Notizie in aggiornamento" quando il DB non ha ancora dati
- [x] TypeScript: 0 errori

## Nuovi task (14 Mar 2026 — Immagini Pexels, Scheduler Music, Banner dinamico)

- [ ] Aggiungere immagini Pexels alle 20 notizie Music esistenti nel DB (script batch)
- [ ] Aggiungere immagini Pexels alle notizie AI che ne sono prive
- [ ] Estendere newsScheduler per generare 20 notizie ITsMusic ogni 24h con immagini Pexels
- [ ] Banner advertising: numero iscritti dinamico dalla mailing list reale (trpc.newsletter.getActiveCount)
- [ ] Aggiornare AiHome: banner advertising con numero iscritti dinamico
- [ ] Aggiornare MusicHome: banner advertising con numero iscritti dinamico

## Nuovi task (14 Mar 2026 — Aggiornamento contatori iscritti)
- [x] Verificato: tutte le 20 notizie AI hanno già immagini Pexels (20/20)
- [x] Verificato: tutte le 20 notizie Music hanno già immagini Pexels (20/20)
- [x] Aggiornato Advertise.tsx: contatore dinamico dal DB (5.400+ iscritti), fallback aggiornato da 1800 a 5400
- [x] Aggiornato Advertise.tsx: AUDIENCE_STATS "Iscritti newsletter" aggiornato da 1.800+ a 5.400+
- [x] Aggiornato Advertise.tsx: impressions newsletter da ~1.800 a ~5.400 destinatari
- [x] Aggiornato AiHome.tsx: fallback iscritti da 4.700 a 5.400 in sezione newsletter e social proof
- [x] Verificato: MusicHome usa già activeSubscriberCount dinamico dal DB
- [x] Verificato: Home.tsx usa già subscriberCount dinamico dal DB
- [x] Verificato: "Chi siamo" è sezione nella homepage (#chi-siamo), non serve pagina separata

## Nuovi task (14 Mar 2026 — Aggiornamento contatori iscritti)
- [x] Verificato: tutte le 20 notizie AI hanno già immagini Pexels (20/20)
- [x] Verificato: tutte le 20 notizie Music hanno già immagini Pexels (20/20)
- [x] Aggiornato Advertise.tsx: contatore dinamico dal DB, fallback 5400
- [x] Aggiornato AiHome.tsx: fallback iscritti da 4.700 a 5.400

## Bug fix (14 Mar 2026 — Notizie AI scomparse)
- [x] Diagnosticato: audit automatico assegnava score 0 a tutte le notizie AI (verificava homepage giornali, non articoli specifici)
- [x] Corretto filtro getLatestNewsFiltered in db.ts: ora include notizie con status error (audit inaffidabile su homepage)
- [x] Notizie AI ora visibili correttamente (20/20 restituite dall'API)

## Nuovi task (14 Mar 2026 — Import CSV + AdSense + Bug fix AI news)
- [x] Bug fix: notizie AI scomparse dalla sezione /ai (audit score 0 su homepage giornali)
- [x] Corretto filtro getLatestNewsFiltered in db.ts: ora include notizie con status error
- [x] Importati 320 nuovi iscritti da contacts.valids(1).csv (91 duplicati saltati, 5.772 attivi totali)
- [x] Aggiunto AdUnit nella Home.tsx tra sezione notizie e Chi siamo
- [x] Verificato: AdUnit già presente in AiHome.tsx (4 banner) e MusicHome.tsx (4 banner)
- [x] Codice AdSense ca-pub-7185482526978993 già presente nell'index.html globale

## Nuovi task (14 Mar 2026 — Audit off + AdSense slots + Admin)
- [x] Disabilitato audit scheduler in server/_core/index.ts (commentato startAuditScheduler())
- [x] Aggiornato AdUnit.tsx con oggetto AD_SLOTS e 9 componenti nominati per posizione
- [x] Documentato come configurare gli slot AdSense nel pannello Google
- [x] Recuperate credenziali admin: ac@foolfarm.com (login via Manus OAuth)

## Nuovi task (14 Mar 2026 — Fix immagini Music)
- [x] Corretta logica findStockImage in stockImages.ts: keyword musicali per sezione Music, tecnologiche per AI
- [x] Aggiunto MUSIC_CATEGORIES set per rilevare automaticamente la sezione
- [x] Aggiunte MUSIC_TITLE_TRANSLATIONS (40+ termini IT→EN musicali)
- [x] Aggiornate 20/20 immagini notizie Music nel DB con immagini Pexels musicali
- [x] Creato script scripts/refresh-music-images.mjs per aggiornamenti futuri

## Nuovi task (14 Mar 2026 — Disabilitazione definitiva audit)
- [x] Rimosso import startAuditScheduler da server/_core/index.ts (non più importato)
- [x] Disabilitato invio email di alert in auditScheduler.ts (codice email sostituito con log)
- [x] Verificato: nessun log AuditScheduler dopo il riavvio del server alle 19:40 UTC

## Nuovi task (14 Mar 2026 — Sezione PollCast)
- [x] Aggiunta sezione "Partecipa ai sondaggi di IdeaSmart su PollCast Online" in Home.tsx sopra "Chi siamo"
- [x] Sezione con card dark, due CTA (Vai ai sondaggi / Scopri PollCast), statistiche decorative, link a https://pollcast.online/

## Nuovi task (14 Mar 2026 — Sezione Startup News)
- [x] Aggiunta sezione 'startup' alle enum DB in tutte le tabelle (schema.ts + db:push)
- [x] Creato startupScheduler.ts con generazione notizie, editoriale, startup settimana, reportage, analisi mercato
- [x] Aggiunto startupScheduler al schedulerManager (esecuzione automatica alle 00:00 ogni giorno)
- [x] Creata pagina StartupHome.tsx identica ad AiHome/MusicHome con palette verde startup
- [x] Aggiunto routing /startup in App.tsx
- [x] Aggiunto link "Startup News" nella HubNavbar (Home.tsx), MusicNavbar (MusicHome.tsx) e Navbar AI (Navbar.tsx)
- [x] Aggiunte procedure admin refreshStartupNews e refreshStartupContent nel router
- [x] Generate le prime 20 notizie + editoriale + startup settimana + 4 reportage + 4 analisi mercato nel DB
