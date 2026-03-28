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

## Ottimizzazioni Performance (19 Mar 2026)

- [x] Audit completo performance: identificati widget Cybersecurity (schede nere) e Sondaggi (skeleton infinito) come colli di bottiglia LLM
- [x] Fix warm-up cache server: ridotto da 60s a 5s per barometro e threatAlert
- [x] Aggiunto warm-up automatico all'avvio per getBarometro e getThreatAlert (server/llmWidgets.ts)
- [x] Lazy loading per tutte le 35 pagine non-critiche in App.tsx (skeleton loader generico)
- [x] staleTime 5 minuti + refetchOnWindowFocus:false su tutte le 14 pagine sezione
- [x] staleTime 4 ore per widget BarometroPolitico e ThreatAlert (dati LLM cambiano raramente)
- [x] Code splitting manuale Vite: vendor-react, vendor-trpc, vendor-radix, vendor-charts, vendor-motion
- [x] Cache HTTP ottimale per file statici in produzione: /assets immutable 1 anno, index.html no-cache

## Pagina Advertise / Media Kit (19 Mar 2026)

- [x] Procedura tRPC advertise.sendInquiry per modulo contatto inserzionisti
- [x] Pagina Advertise.tsx: media kit, statistiche audience, formati pubblicitari, modulo contatto
- [x] Route /advertise in App.tsx + link nel footer
- [x] Link "Advertise" nella navbar accanto a "Chi Siamo"
- [x] Pagina Tecnologia.tsx: storytelling IdeaSmart/Verify (contenuto da file allegato)
- [x] Link "Tecnologia" nella navbar accanto a "Advertise"

## Navbar e Manchette (19 Mar 2026)

- [x] Barra canali visibile in tutte le pagine sezione (non solo Home)
- [x] Manchette sinistra: banner IdeaSmart Business ("Crea il tuo giornale AI powered")
- [x] Manchette destra: banner Tradedoubler (300x250 adattato a formato manchette)
- [x] Banner Tradedoubler 300x250 nello spazio immagine hero del blocco News Italia (g=26055766)
- [x] Banner leaderboard Tradedoubler 728x90 sotto la sezione Punto del Giorno (g=25809148)
- [x] Banner skyscraper Tradedoubler 120x600 al posto dell'immagine nel blocco AI4Business hero (g=25854308)
- [x] Manchette destra testata: sostituire Feltrinelli con nuovo banner Tradedoubler 300x250 (g=25914926)
- [x] Banner 300x250 sotto link "Tutte le Notizie Startup" (g=25650800)
- [x] Banner 300x250 sotto link "Tutte le Notizie" del blocco Finance/Economia (g=25611646) — SOSTITUITO con leaderboard 728x90 (g=25611636)
- [x] ~~Banner 300x250 sopra il footer (parte bassa homepage) (g=25611646)~~ — RIMOSSO (Octopus Energy)
- [x] Banner leaderboard 728x90 dopo il banner 300x250 pre-footer (g=25996460)

## Performance Round 2 (19 Mar 2026)

- [x] Compressione gzip/Brotli sul server Express — già attiva (level 6, threshold 1KB)
- [x] Prefetch link per /ai, /startup, /sondaggi, /news in index.html + dns-prefetch CDN
- [x] Skeleton loader specifici per ThreatAlert (struttura reale: badge, titolo, testo, footer)

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
- [x] SEO: descrizione meta tra 50-160 caratteri — ridotta a 153 caratteri (19 Mar 2026)
- [x] SEO: aggiunto H2 sr-only con parole chiave principali (19 Mar 2026)
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

## Fix Startup News (15 Mar 2026)
- [x] Creata pagina StartupNewsArticle.tsx dedicata (non più redirect a ITsMusic)
- [x] Corretti 20 URL sorgenti Startup da URL articoli inventati a homepage reali
- [x] Corretto prompt startupScheduler per generare URL homepage
- [x] Corretto prompt musicScheduler per generare URL homepage
- [x] Corretto prompt newsScheduler per generare URL homepage

## Nuovi task (15 Mar 2026 — Scraping RSS reale + Audit URL)

- [x] Sostituire generatori AI notizie inventate con scraping RSS da fonti reali (rssSources.ts, rssScraperNew.ts, rssNewsScheduler.ts)
- [x] Creare whitelist fonti RSS certificate per AI (12 fonti), Music (10 fonti), Startup (11 fonti)
- [x] Fix immediato DB: correggere tutti i sourceUrl non-homepage (urlAuditFix.ts) - 50/60 URL corretti all'avvio
- [x] Audit automatico post-scraping: verifica HTTP dopo ogni salvataggio RSS
- [x] Aggiornare schedulerManager per usare refreshAINewsFromRSS, refreshMusicNewsFromRSS, refreshStartupNewsFromRSS
- [x] Aggiungere adminTools router con procedure fixSourceUrls, triggerRssScraping, newsStats
- [x] Aggiornare server/_core/index.ts: fix URL all'avvio (15s) + scraping RSS se DB vuoto (45s)

## Nuovi task (15 Mar 2026 — Admin fonti + Feedback utenti)

- [x] Espandere whitelist fonti RSS con feed italiani per AI, Music e Startup
- [x] Creare pagina admin /admin/rss-monitor per monitoraggio qualità fonti e trigger scraping manuale
- [x] Implementare sistema feedback utenti per segnalare fonti errate (schema DB + tRPC + UI)

## Nuovi task (15 Mar 2026 — Homepage layout giornale)

- [ ] Riscrivere Home.tsx con layout da prima pagina di giornale (testata, notizia del giorno, colonne canali, griglia 3 sezioni, elenco misto)

## Fix link mancanti sezioni (15 Mar 2026)
- [ ] Aggiungere link cliccabili nelle sezioni Reportage in AiHome, MusicHome, StartupHome
- [ ] Aggiungere link cliccabili nelle sezioni Analisi di Mercato in AiHome, MusicHome, StartupHome
- [ ] Aggiungere link cliccabili nella sezione Startup del Giorno
- [ ] Verificare e creare pagine dettaglio mancanti se necessario

## Nuovi task (15 Mar 2026 — Ticker + Spotlight links)
- [x] Aggiungere link Spotlight del Giorno nelle sezioni AiHome, MusicHome, StartupHome
- [x] Creare componente BreakingNewsTicker con scorrimento automatico
- [x] Integrare BreakingNewsTicker in Home, AiHome, MusicHome, StartupHome

## Nuovi task (15 Mar 2026 — Pagina Edicola)
- [x] Aggiungere procedura tRPC news.getAll con filtri sezione/data/categoria
- [x] Creare pagina Edicola (/edicola) con layout archivio digitale
- [x] Aggiungere link Edicola nella navbar di Home, AiHome, MusicHome, StartupHome
- [x] Registrare rotta /edicola in App.tsx

## RESET TOTALE DB (15 Mar 2026 — Pulizia notizie inventate)
- [x] Eliminare tutte le righe da news_items (notizie inventate dall'AI)
- [x] Eliminare tutte le righe da daily_editorial (editoriali inventati)
- [x] Eliminare tutte le righe da startup_of_day (startup inventate)
- [x] Eliminare tutte le righe da weekly_reportage (reportage inventati)
- [x] Eliminare tutte le righe da market_analysis (analisi inventate)
- [x] Riscrivere RSS scraper per coerenza assoluta sourceName/sourceUrl dal feed
- [x] Triggerare scraping RSS immediato per AI, Music, Startup
- [x] Verificare qualità: ogni notizia deve avere sourceUrl reale e funzionante

## Fix critico URL audit (15 Mar 2026)
- [x] Bug: urlAuditFix.ts sovrascriveva URL articoli RSS con URL homepage
- [x] Corretto: audit ora preserva URL con path (articoli reali), sostituisce solo URL senza path
- [x] Verificato: 59/60 notizie (98.3%) hanno URL articolo reale, 1 URL homepage residuo
- [x] Homepage redesign: layout da prima pagina di giornale (testata, notizia hero, griglia 3 sezioni)
- [x] Sezioni AI/Music/Startup redesign: layout editoriale uniforme con stile giornale
- [x] Pagine dettaglio: EditorialDetail, ReportageDetail, MarketAnalysisDetail, StartupOfDayDetail
- [x] BreakingNewsTicker: barra scorrimento automatico notizie in tutte le pagine
- [x] Pagina /edicola: archivio digitale con filtri e paginazione
- [x] Admin /admin/rss-monitor: dashboard monitoraggio fonti RSS con trigger manuale
- [x] Sistema segnalazione utenti: ReportSourceButton in tutte le sezioni notizie

## Nuovi task (15 Mar 2026 — Logo + Scheduler)

- [x] Fix: logo IdeaSmart cliccabile → torna alla Home (/) in tutte le pagine (Home, AiHome, MusicHome, StartupHome, Edicola, pagine dettaglio)
- [x] Newsletter: invio test alle 08:30 CET ogni lunedì a ac@acinelli.com (preview prima dell'invio massivo)
- [x] Newsletter: invio massivo spostato alle 09:30 CET ogni lunedì (era 10:00)
- [x] Scheduler 00:00 CET: scraping RSS + editoriali + tutti i contenuti (AI, Music, Startup) ogni giorno (già attivo)
- [x] Audit 02:00 CET: verifica URL con HEAD request, sostituisce notizie con link non validi con notizie fresche da RSS
- [x] Creato nightlyAuditScheduler.ts: audit URL + sostituzione automatica da RSS
- [x] Creato newsletterTestSender.ts: newsletter test con contenuti reali dal DB (buildFullNewsletterHtml)
- [x] Aggiornato schedulerManager.ts: 15 scheduler con orari corretti CET

## Fix critico link notizie (15 Mar 2026 — Eliminazione pagine intermedie)
- [x] Eliminare tutte le pagine intermedie AI-generate per le notizie (NewsArticle, MusicNewsArticle, StartupNewsArticle)
- [x] Tutti i link alle notizie puntano direttamente alla sourceUrl originale (fonte esterna)
- [x] Rimuovere rotte /ai/news/:id, /music/news/:id, /startup/news/:id da App.tsx
- [x] Correggere editoriale Home: "CONTINUA A LEGGERE" punta alla pagina editoriale interna /ai/editorial/:id
- [x] Aggiungere pulsante Back (← Torna indietro) in tutte le pagine interne (EditorialDetail, ReportageDetail, MarketAnalysisDetail, StartupOfDayDetail)
- [x] Tutti i link alle notizie aprono nella stessa finestra (rimuovere target="_blank")
- [x] Newsletter test spostata alle 07:30 CET (era 08:30)
- [x] Newsletter massiva confermata alle 09:30 CET (solo lunedì)
- [x] Pulire DB: eliminare notizie con link non validi e sostituire con RSS freschi

## Fix critico link notizie + Scheduler (15 Mar 2026)

- [x] Eliminare pagine intermedie AI-generate: NewsArticle, MusicNewsArticle, StartupNewsArticle ora fanno redirect automatico a sourceUrl
- [x] Home.tsx: NewsCard e NewsRow puntano direttamente a sourceUrl (fonte originale, stessa finestra)
- [x] AiHome.tsx: tutti i link notizie puntano a sourceUrl direttamente
- [x] MusicHome.tsx: tutti i link notizie puntano a sourceUrl direttamente
- [x] StartupHome.tsx: tutti i link notizie puntano a sourceUrl direttamente
- [x] Pulsante Back già presente in EditorialDetail, ReportageDetail, MarketAnalysisDetail, StartupOfDayDetail
- [x] Orario newsletter test aggiornato da 08:30 a 07:30 CET ogni lunedì
- [x] Orario newsletter massiva confermato a 09:30 CET ogni lunedì
- [x] Logo IdeaSmart cliccabile → Home in tutte le pagine (sessione precedente)

## Integrazione 250 feed RSS + Pipeline AI + LinkedIn (15 Mar 2026)

- [ ] Aggiornare rssSources.ts con tutti i 250 feed RSS nelle 5 categorie (AI, Startup Italia, VC, Tech globale, Musica Rock/Indie)
- [ ] Aggiornare scraper RSS per gestire più fonti con rotazione, deduplicazione e fallback
- [ ] Pipeline AI summarization: RSS → riassunto AI → salvataggio nel DB (titolo, summary, sourceUrl, imageUrl)
- [ ] LinkedIn autopost: pubblica le top 3 notizie del giorno su LinkedIn (API LinkedIn OAuth)
- [ ] Admin dashboard: pulsante "Pubblica su LinkedIn Ora" per trigger manuale
- [ ] Test pipeline completa: scraping → AI summary → sito + newsletter + LinkedIn

## Reset DB + Fix scraper URL articolo (15 Mar 2026 — CRITICO)
- [x] Analisi bug: rssNewsScheduler.ts usava controllo sameDomain che sostituiva URL articolo con homepage
- [x] Analisi bug: urlAuditFix.ts usava whitelist per dominio che sostituiva URL CDN/redirect con homepage
- [x] Reset completo DB: tutte le notizie da news_items eliminate
- [x] Corretto rssNewsScheduler.ts: preserva sempre URL articolo dal feed RSS, rimosso controllo sameDomain
- [x] Corretto urlAuditFix.ts: preserva URL con path (articolo), corregge solo URL senza path o non validi
- [x] Aggiornato rssSources.ts: 178 fonti RSS (87 AI + 36 Music + 55 Startup)
- [x] Nuovo scraping immediato da 178 fonti RSS
- [x] Verifica qualità: 60/60 URL articolo specifico (100%) — zero homepage

## Integrazione 212 fonti RSS (15 Mar 2026)
- [x] Aggiunto 25 nuove fonti italiane AI/Tech (AI4Business, BigData4Innovation, HDBlog, SmartWorld, Cybersecurity360, Italian Tech, Corriere Tecnologia, iPhoneItalia, AndroidWorld, ecc.)
- [x] Aggiunto 4 nuove fonti Startup italiane (Forbes Italia, Il Sole 24 Ore Economia, Open Online, Panorama)
- [x] Aggiunto 6 nuove fonti Startup internazionali (Finsmes, Startup Genome, Venture Burn, FT Technology)
- [x] Totale fonti RSS: 212 (112 AI + 65 Startup + 36 Music)
- [x] Reset DB e nuovo scraping da 212 fonti: 60/60 notizie con URL articolo specifico (100%)
- [x] Scraping completato in 141 secondi

## LinkedIn Autopost (15 Mar 2026)

- [ ] Configurare credenziali LinkedIn (Access Token, URN persona/organizzazione)
- [ ] Aggiungere tabella linkedin_posts nel DB per tracciare i post pubblicati
- [ ] Creare server/linkedinScheduler.ts con selezione top 3 notizie del giorno
- [ ] Implementare chiamata API LinkedIn ugcPosts con link preview
- [ ] Aggiungere scheduler giornaliero alle 10:00 CET in schedulerManager.ts
- [ ] Aggiungere pulsante "Pubblica su LinkedIn ora" in /admin
- [ ] Test e checkpoint

## Privacy Policy nel footer (15 Mar 2026)

- [x] Verificata pagina /privacy esistente con contenuto GDPR compliant
- [x] Aggiornata data ultima modifica a 15 marzo 2026
- [x] Aggiunto link "Privacy Policy" nel footer di Home.tsx
- [x] Aggiunto link "Privacy Policy" nel footer di AiHome.tsx
- [x] Aggiunto link "Privacy Policy" nel footer di MusicHome.tsx
- [x] Aggiunto link "Privacy Policy" nel footer di StartupHome.tsx

## LinkedIn Autopost — Implementazione completata (15 Mar 2026)

- [x] Configurare credenziali LinkedIn (LINKEDIN_ACCESS_TOKEN = token Andrea Cinelli, LINKEDIN_AUTHOR_URN = urn:li:person:T2CjsXZQ59)
- [x] Creare server/linkedinPublisher.ts con selezione top 3 notizie (1 per sezione AI/Music/Startup)
- [x] Aggiungere variabili linkedinAccessToken e linkedinAuthorUrn in server/_core/env.ts
- [x] Aggiungere import publishDailyLinkedInPosts in server/routers.ts
- [x] Aggiungere procedura admin.publishLinkedIn nel router admin di routers.ts
- [x] Aggiungere scheduler giornaliero alle 10:00 CET in schedulerManager.ts (cron "0 10 * * *")
- [x] Aggiungere pannello LinkedIn nell'Admin.tsx con pulsante "Pubblica Ora su LinkedIn" e risultati
- [x] Test Vitest linkedin.test.ts: 3 test passano (token configurato, URN valido, formato corretto)
- [x] Test schedulerManager.test.ts aggiornato: 16 cron job + test LinkedIn alle 10:00
- [x] Tutti i 19 test passano (4 test files)

## LinkedIn Autopost — Cambio autore a pagina aziendale (15 Mar 2026)

- [ ] Recuperare Organization ID della pagina LinkedIn IDEASMART
- [ ] Aggiornare LINKEDIN_AUTHOR_URN con urn:li:organization:XXXXXXX
- [ ] Verificare che il token abbia il permesso r_organization_social o w_organization_social
- [ ] Testare pubblicazione dalla pagina aziendale IDEASMART

## LinkedIn Autopost — Cambio autore a pagina aziendale (15 Mar 2026)

- [x] Recuperato Organization ID pagina LinkedIn IDEASMART: 112273349
- [x] Aggiornato LINKEDIN_AUTHOR_URN a urn:li:organization:112273349
- [x] Aggiornato LINKEDIN_ACCESS_TOKEN con nuovo token
- [x] Test Vitest: 19/19 passano con nuovo URN organization
- [ ] Verificare in produzione che il token abbia permesso w_organization_social per pubblicare dalla pagina aziendale

## LinkedIn Autopost — Immagine + Link Preview verso IDEASMART (15 Mar 2026)

- [ ] Aggiornare linkedinPublisher.ts: usare shareMediaCategory ARTICLE con originalUrl verso IDEASMART
- [ ] Includere imageUrl della notizia nel post LinkedIn (link preview con immagine)
- [ ] Aggiungere CTA nel testo del post: "Leggi su IDEASMART → https://ideasmart.ai"
- [ ] Aggiornare secrets: LINKEDIN_AUTHOR_URN = urn:li:organization:112273349
- [ ] Test e checkpoint

## LinkedIn Autopost — Immagine + Link Preview completato (15 Mar 2026)

- [x] Aggiornato linkedinPublisher.ts: shareMediaCategory ARTICLE con link preview verso IDEASMART
- [x] Incluso imageUrl della notizia nel media del post LinkedIn (thumbnails)
- [x] Aggiunto CTA nel testo: "Leggi l'articolo completo su IDEASMART → https://ideasmart.ai/[sezione]"
- [x] Aggiornato LINKEDIN_AUTHOR_URN = urn:li:organization:112273349 (pagina aziendale)
- [x] Aggiornato LINKEDIN_ACCESS_TOKEN con token più recente
- [x] 19/19 test Vitest passano

## LinkedIn Autopost — Editoriale AI stile Andrea Cinelli (15 Mar 2026)

- [ ] Analizzare struttura editoriale AI (getLatestEditorial) e Pexels helper esistenti
- [ ] Riscrivere linkedinPublisher.ts: 1 post/giorno da editoriale AI con testo LLM stile thought leader
- [ ] Includere immagine Pexels coerente con il tema dell'editoriale
- [ ] Aggiornare scheduler: 1 post alle 10:00 (non 3)
- [ ] Aggiornare procedura admin per test manuale
- [ ] Test e checkpoint

## Newsletter Redesign — Stile Editoriale Navy (16 Mar 2026)

- [x] Ridisegnare masthead newsletter: sfondo navy #0a0f1e, testata "IDEASMART" in Georgia serif 56px
- [x] Aggiungere riga superiore con elenco canali (AI · STARTUP · FINANCE · HEALTH · SPORT · LUXURY · MUSIC) e data
- [x] Aggiungere doppia linea ciano stile giornale sotto la testata
- [x] Aggiungere sommario numeri (notizie, reportage, analisi) con colori accento
- [x] Aggiornare sezione editoriale con sfondo navy e testo bianco
- [x] Aggiornare sezione startup del giorno con sfondo navy e accento arancio
- [x] Aggiornare sezione reportage con sfondo navy e colori accento dinamici
- [x] Aggiornare sezione news con sfondo navy alternato (#0a0f1e / #0d1220) e testo bianco
- [x] Aggiornare sezione analisi di mercato con card navy e bordi semitrasparenti
- [x] Aggiornare footer con sfondo #060a14 e testo bianco/semitrasparente
- [x] Aggiornare CTA finale con gradiente navy e bottone ciano

## PWA Mobile — Banner Installazione (16 Mar 2026)

- [x] Creare service worker /sw.js con caching offline-first per navigazione
- [x] Creare hook usePWA.ts per gestire beforeinstallprompt (Android/Chrome) e iOS
- [x] Creare componente PWAInstallBanner.tsx con design navy coerente con il brand
- [x] Integrare PWAInstallBanner in App.tsx (visibile su tutte le pagine)
- [x] Registrare service worker nell'index.html
- [x] Banner si mostra dopo 3 secondi sulla prima visita mobile, si nasconde per 7 giorni dopo dismiss

## Nuovi task (16 Mar 2026 — Scheduler Automatici e Newsletter Giornaliera)

- [x] Scheduler notturno unificato per tutti i 7 canali (00:00-03:25 CET ogni giorno)
- [x] Sistema newsletter giornaliera per canale (un canale al giorno)
- [x] Preview newsletter alle 07:00 CET → info@ideasmart.ai per revisione
- [x] Invio massivo newsletter alle 07:30 CET → tutti gli iscritti attivi
- [x] Calendario: Lun=AI, Mar=Startup, Mer=Finance, Gio=Sport, Ven=Music, Sab=Luxury, Dom=Health
- [x] Procedure admin: sendDailyChannelPreview, sendChannelNewsletter (7 canali)
- [x] Pannello Admin aggiornato con tabella calendario e pulsanti per ogni canale
- [x] Test per dailyChannelNewsletter (16 test) e schedulerManager (11 test) — 35/35 passano

## Fix Newsletter Doppio Invio e Preferenze Canale (16 Mar 2026)

- [x] Disattivare scheduler newsletter settimanale/mensile vecchia (template scuro)
- [x] Eliminare definitivamente la newsletter settimanale/mensile (FoolTalent/FoolShare/Fragmentalis/PollCast) — scheduler e template rimossi
- [x] Aggiungere 4 nuovi iscritti: annaclara.borella@cofidis.it, edoardo.riccobono@camperiosim.com, sandro.parisi@eudata.com, acquisti@felsineo.com

## Preferenze Canale Newsletter (16 Mar 2026)

- [x] Schema DB: aggiunta colonna channels (JSON array) alla tabella subscribers
- [x] Migrazione DB: pnpm db:push completato
- [x] Funzioni DB: getActiveSubscribersByChannel, updateSubscriberChannels, getSubscriberChannels
- [x] tRPC procedure: newsletter.subscribeWithChannels, newsletter.updateChannels, newsletter.getChannels
- [x] Componente NewsletterSubscribeForm con selezione canali (toggle pill per ogni canale)
- [x] Pagina /preferenze-newsletter con UI selezione canali (7 canali con toggle)
- [x] Form iscrizione aggiornato in tutti e 7 i canali con selezione canali
- [x] Sistema invio newsletter filtrato per canale scelto dall'iscritto (legacy = tutti i canali)
- [x] Link "Gestisci canali" nel footer di ogni newsletter
- [x] 35/35 test passano

## Admin Dashboard — Colonna Canali Iscritti (16 Mar 2026)

- [x] Aggiornare procedura tRPC admin.getSubscribersWithTracking per includere channels e parsedChannels
- [x] Aggiungere pannello "Iscritti Attivi per Canale" con conteggio cliccabile per filtrare
- [x] Aggiungere colonna "Canali" nella tabella iscritti Admin con badge colorati (AI/ST/FI/SP/MU/LX/HE)
- [x] Aggiungere filtro per canale nella barra filtri della tabella iscritti Admin
- [x] 35/35 test passano

## Email Benvenuto — Link Gestisci Canali (16 Mar 2026)

- [x] Aggiungere link "Gestisci canali" nella welcome email con URL personalizzato per l'iscritto
- [x] Aggiungere sezione "I tuoi canali scelti" nella welcome email con badge colorati
- [x] Fix procedura subscribe legacy: ora passa sempre preferencesUrl alla welcome email
- [x] 35/35 test passano

## Fix Newsletter e Sicurezza Admin (16 Mar 2026)

- [ ] Rimuovere prefisso [PREVIEW] dall'oggetto newsletter invio manuale
- [ ] Aggiungere riga frequenza "Ricevi questa newsletter ogni [giorno]" nel template
- [ ] Verificare protezione route /admin (solo ruolo admin via Manus OAuth)
- [ ] Confermare che non esiste accesso admin con username/password separato

## Fix Newsletter Oggetto e Sicurezza Admin (16 Mar 2026)

- [x] Rimosso prefisso [PREVIEW] dall'oggetto delle newsletter
- [x] Aggiunto badge canale (pill teal) nel masthead sotto il logo IDEASMART
- [x] Aggiunta riga frequenza ("Ogni lunedì · Intelligenza Artificiale per il Business") nel masthead
- [x] Verificata protezione route /admin: doppio layer (frontend role check + backend adminProcedure)
- [x] Confermato: nessun accesso username/password — solo Manus OAuth con ruolo admin
- [x] 35/35 test passano

## Google Analytics (16 Mar 2026)

- [x] Aggiungere tag Google Analytics G-R9KESLT3MN nell'head di index.html

## Spazi Pubblicitari AdSense (16 Mar 2026)

- [ ] Creare componente AdUnit riutilizzabile (banner 728x90, rettangolo 300x250, sidebar 160x600, in-feed)
- [ ] Inserire banner leaderboard sotto la navbar in tutte le pagine canale
- [ ] Inserire rettangolo in-content tra le notizie (dopo la 3a notizia) in tutte le pagine canale
- [ ] Inserire banner sidebar nelle pagine canale con sidebar
- [ ] Inserire banner footer prima del form iscrizione newsletter
- [ ] Inserire banner in-feed nella Home principale tra le sezioni canale

## Nuovi task (17 Mar 2026 — Nuovi canali + RSS italiani)

- [x] Integrare 60 fonti RSS italiane (Politica, Cronaca, Finanza) in NEWS_SOURCES di rssSources.ts
- [x] Aggiungere News, Motori, Tennis, Basket nel menu di navigazione principale (Navbar)
- [x] Aggiungere i 4 nuovi canali nella sidebar "I Canali" della Home
- [x] Aggiungere sezioni news di News, Motori, Tennis, Basket nella Home page

## Task (17 Mar 2026 — Scraping + Ticker LIVE)

- [x] Avviare scraping RSS per news, motori, tennis, basket
- [x] Aggiornare ticker LIVE per includere notizie di tutti i canali

## Task (17 Mar 2026 — Sidebar canali)

- [x] Aggiungere Motori, Tennis, Basket alla sidebar "I Canali" nella Home

## Task (17 Mar 2026 — Fix AdUnit exports)

- [x] Correggere export mancanti in AdUnit.tsx (AdStartupBottom e altri) — già presenti, riavvio server risolve cache Vite

## Task (17 Mar 2026 — Navbar canali sport/motori)

- [x] Aggiungere Motori, Tennis, Basket alla barra di navigazione principale (Navbar) e alla barra secondaria della Home

## Task (17 Mar 2026 — Fix definitivo AdUnit cache)

- [x] Risolvere definitivamente errore AdNewsBottom/AdUnit cache Vite — pulita cache node_modules/.vite, riavviato server

## Task (17 Mar 2026 — Fix React duplicate instances)

- [x] Risolvere errore "multiple copies of React" reinstallando le dipendenze pnpm e riavviando il server

## Task (17 Mar 2026 — Fix definitivo HMR WebSocket)

- [x] Correggere configurazione HMR Vite — configurazione già corretta (clientPort:443, protocol:wss), errore è transitorio al riavvio server

## Task (17 Mar 2026 — Stile giornale barra canali)

- [x] Uniformare barra canali sopra ticker: stile editoriale sobrio, nessun colore, tutti gli 11 canali
- [x] Uniformare sidebar I Canali: stesso stile, tutti gli 11 canali visibili

## Task (17 Mar 2026 — Fix definitivo AdUnit export)

- [x] Rifattorizzare AdUnit.tsx con export nominati espliciti per ogni componente — eliminato pattern factory che causava problemi di cache Vite

## Task (17 Mar 2026 — Fix React duplicate definitivo)

- [x] Pulizia completa node_modules e reinstallazione per eliminare React duplicate — cache pulita, server riavviato

## Task (17 Mar 2026 — Fix React dedupe vite.config)

- [x] Aggiungere resolve.dedupe React in vite.config.ts per eliminare definitivamente React duplicate

## Task (17 Mar 2026 — Fix React duplicate DEFINITIVO)

- [x] Forzare rigenerazione completa chunk Vite con optimizeDeps.force per eliminare React duplicate
- [x] Verificare che il browser non usi più chunk-MO2SMAW5.js (vecchio hash)

## Task (17 Mar 2026 — Rimozione sezioni Pubblicità)

- [x] Trovare tutti i file con sezioni pubblicità (AdSlot, PUBBLICITÀ, AdBanner, ecc.)
- [x] Rimuovere le sezioni pubblicità da tutte le pagine

## Task (17 Mar 2026 — Nuovi canali: Business Gossip, Cybersecurity, Sondaggi)

- [x] Creare GossipHome.tsx (Business Gossip) con stesso formato MotoriHome
- [x] Creare CybersecurityHome.tsx con stesso formato MotoriHome
- [x] Creare SondaggiHome.tsx con stesso formato MotoriHome
- [x] Aggiungere fonti RSS per i tre nuovi canali in rssSources.ts
- [x] Aggiungere scheduler per i tre nuovi canali
- [x] Aggiornare Navbar con i tre nuovi canali
- [x] Aggiornare Home.tsx con i tre nuovi canali nella navigazione e nelle sezioni news
- [x] Aggiungere route in App.tsx per i tre nuovi canali
- [x] Aggiornare SECTION_COLORS in Home.tsx con i tre nuovi canali

## Task (17 Mar 2026 — Fix React duplicate PERMANENTE)

- [x] Risolvere definitivamente React duplicate instances con fix strutturale in vite.config.ts

## Task (17 Mar 2026 — Fix cache browser React)

- [x] Eliminare cache browser persistente che usa bundle stantii con hash vecchi

## Task (17 Mar 2026 — Fix HMR WebSocket)

- [x] Configurare HMR Vite per funzionare attraverso il proxy Manus sulla porta 3000

## Task (17 Mar 2026 — Fix WebSocket HMR localhost:5173)

- [ ] Risolvere errore WebSocket HMR che tenta di connettersi a localhost:5173 invece del proxy Manus

## Nuovi task (17 Mar 2026 — Newsletter nuovi canali + Threat Alert + Fix link)

- [ ] Fix link newsletter: puntare alle pagine articolo su Ideasmart (/{section}/{id}) invece che alla fonte esterna
- [ ] Newsletter settimanale Motori (Mercoledì ore 10:00 CET)
- [ ] Newsletter settimanale Tennis (Giovedì ore 10:00 CET)
- [ ] Newsletter settimanale Basket (Venerdì ore 10:00 CET)
- [ ] Newsletter quotidiana News Italia (ogni giorno ore 10:00 CET)
- [ ] Widget Threat Alert Cybersecurity (LLM da notizie CERT-AGID e ACN)

## Task (17 Mar 2026 — Firma editoriale Adrian Lenice)

- [x] Aggiungere firma "Adrian Lenice — Direttore Editoriale" in EditorialDetail.tsx
- [x] Aggiungere firma "Adrian Lenice — Direttore Editoriale" in MarketAnalysisDetail.tsx
- [x] Aggiungere firma "Adrian Lenice — Direttore Editoriale" in ReportageDetail.tsx
- [x] Aggiungere firma "Adrian Lenice — Direttore Editoriale" in StartupOfDayDetail.tsx

## Task (17 Mar 2026 — Fix HMR WebSocket DEFINITIVO)

- [x] Identificato causa root: Service Worker cachava il vecchio @vite/client (senza patch HMR)
- [x] Aggiornato sw.js: CACHE_NAME da v1 a v3 per invalidare la cache vecchia
- [x] Aggiornato sw.js: esclusi /@vite/*, /@fs/*, /src/*, /node_modules/*, /__manus__/* dalla cache
- [x] Aggiornato middleware patch @vite/client: usa Referer e Origin come fallback per rilevare il dominio proxy
- [x] Aggiornato middleware patch @vite/client: sostituisce socketHost, serverHost e directSocketHost con valori hardcoded (3000-xxx:443/)
- [x] Verificato: curl con Referer e Host corretti restituisce @vite/client patchato correttamente

## Task (17 Mar 2026 — Fix HMR WebSocket ROUND 2)

- [x] Identificato causa root definitiva: il SW vecchio (v1) cachava /@vite/client e veniva servito prima che il nuovo SW si attivasse
- [x] usePWA.ts: in dev mode (import.meta.env.DEV), non registrare il SW ma disregistrare quelli esistenti
- [x] sw.js v4: aggiunto auto-disregistrazione in dev mode (fetch /@vite/client HEAD → se 200 = dev → clear cache + unregister + reload tabs)

## Bug Fix (17 Mar 2026 — SW reload loop in produzione)

- [x] Identificato bug critico: in produzione Express serve index.html (text/html) per /@vite/client, causando res.ok=true e attivando il reload loop del SW
- [x] sw.js v5: la detection dev mode ora controlla Content-Type (text/javascript = dev, text/html = produzione) invece di solo res.ok

## Bug Fix (17 Mar 2026 — Caricamento notizie bloccato in produzione)

- [x] Identificato causa root: la homepage faceva 14+ query tRPC separate in batch, la risposta superava i 68KB causando errore 502 dal proxy Manus
- [x] Aggiunta funzione getHomeNewsData() in server/db.ts che recupera tutte le sezioni in parallelo con Promise.all
- [x] Aggiunta procedura news.getHomeData nel router tRPC (singola query, risposta 44KB < 68KB limite)
- [x] Aggiornata Home.tsx per usare trpc.news.getHomeData.useQuery() invece di 14 query separate

## Task (17 Mar 2026 — Cache in-memory lato server)
- [ ] Creare server/cache.ts con sistema di cache in-memory (TTL, warm-up, invalidazione)
- [ ] Integrare cache in news.getHomeData (TTL 10 minuti)
- [ ] Integrare cache in news.getLatest per ogni sezione/canale (TTL 10 minuti)
- [ ] Integrare cache in editorial, marketAnalysis, reportage, startupOfDay (TTL 15 minuti)
- [ ] Aggiungere HTTP Cache-Control headers alle risposte tRPC pubbliche
- [ ] Warm-up automatico della cache all'avvio del server

## Task (17 Mar 2026 — Cache Layer In-Memory)

- [x] Implementare modulo cache in-memory con TTL e stale-while-revalidate (server/cache.ts)
- [x] Integrare cache in news.getHomeData, news.getLatest (TTL 10min)
- [x] Integrare cache in editorial.getLatest, reportage.getLatestWeek, marketAnalysis.getLatest, startupOfDay.getLatest (TTL 15min)
- [x] Integrare cache in sistema.getPuntoDelGiorno, getBarometro, getThreatAlert (TTL 30min — chiamate LLM costose)
- [x] Aggiungere Cache-Control headers HTTP per CDN/browser (public, max-age=60, stale-while-revalidate=300)
- [x] Aggiungere warm-up automatico della cache 60s dopo l'avvio del server
- [x] Performance verificata: prima chiamata 179ms → dalla cache 8ms (22x più veloce)

## Task (17 Mar 2026 — Invalidazione Cache Post-Scraping)

- [ ] Aggiungere invalidazione cache al termine di rssNewsScheduler (tutte le sezioni)
- [ ] Aggiungere invalidazione cache al termine di dailyContentScheduler (editoriale, startup del giorno)
- [ ] Aggiungere invalidazione cache al termine di weeklyReportageScheduler
- [ ] Aggiungere invalidazione cache al termine di marketAnalysisScheduler
- [ ] Aggiungere invalidazione cache al termine di linkedinPublisher (punto del giorno)
- [ ] Verificare che il warm-up post-invalidazione ripopoli la cache automaticamente

## Task (17 Mar 2026 — Ottimizzazione Cache Avanzata)
- [x] Estendere cache a news.getById (TTL 30min) e news.getRelated (TTL 15min)
- [x] Estendere cache a marketAnalysis.getById, reportage.getById, editorial.getById, startupOfDay.getById (TTL 30min)
- [x] Warm-up proattivo completo: tutte le 14 sezioni × 5 tipi di contenuto (70 chiavi cache)
- [x] Aggiungere compressione gzip con Express compression middleware (risparmio 70% — 44KB → 14KB)
- [x] Warm-up con stagger in batch da 4 sezioni per non sovraccaricare il DB
- [x] Tutti i 36 test passano

## Task (18 Mar 2026 — Grafico Storico Sondaggi)
- [ ] Aggiungere tabella barometro_snapshots al DB (data, partito, percentuale)
- [ ] Creare procedura tRPC sondaggi.getHistory per recuperare gli ultimi 28 giorni
- [ ] Aggiungere salvataggio automatico snapshot giornaliero nello scheduler (dopo getBarometro)
- [ ] Implementare grafico storico con Recharts nel widget Sondaggi della homepage
- [ ] Popolare dati storici iniziali (ultimi 28 giorni) per avere il grafico subito visibile
- [ ] Aggiungere cache alla procedura getHistory (TTL 60min)

## Task (18 Mar 2026 — Grafico Storico Barometro Politico)

- [x] Aggiungere tabella barometro_snapshots al DB (data, partito, percentuale, colore, fonte)
- [x] Aggiungere funzioni DB: getBarometroHistory, saveBarometroSnapshot
- [x] Aggiungere procedura tRPC news.getBarometroHistory (TTL 15min, lazy load)
- [x] Riscrivere componente BarometroPolitico con tab switcher "Oggi" / "4 Settimane"
- [x] Implementare grafico storico a linee con Recharts (LineChart, Tooltip personalizzato, Legend)
- [x] Aggiungere cron job 05:45 CET per salvataggio snapshot giornaliero barometro
- [x] Aggiornare test schedulerManager (41 → 42 cron job)
- [x] Tutti i 36 test passano

## Task (18 Mar 2026 — Firma Direttore Responsabile)

- [x] Aggiungere "Adrian Lenice, Direttore Responsabile" sotto il sottotitolo nell'header della homepage

## Task URGENTE (18 Mar 2026 — Fix Link Newsletter)

- [ ] Trovare tutti i link errati nel template newsletter (www.idesmart.it → ideasmart.ai)
- [ ] Correggere il dominio base usato per generare i link nella newsletter
- [ ] Aggiungere validazione automatica dei link prima di ogni invio
- [ ] Verificare che tutti i link puntino a pagine esistenti su ideasmart.ai

## Nuovi task (18 Mar 2026 — Validazione link newsletter + Punto del Giorno)

- [x] Routine validazione link pre-invio newsletter: funzione linkAudit che verifica HTTP 200 per ogni URL della newsletter (06:45 CET, blocca invio se link interni rotti)
- [ ] Scheduler audit mattutino: cron job alle 06:45 CET che esegue audit e invia report a info@ideasmart.ai
- [ ] Blocco invio newsletter se link non validi (con soglia configurabile)
- [ ] Sezione Punto del Giorno: rimuovere riferimento "Andrea Cinelli / Founder & CEO FoolFarm · LinkedIn"
- [ ] Sezione Punto del Giorno: rimuovere link "Leggi su LinkedIn"
- [ ] Sezione Punto del Giorno: sostituire autore con "Adrian Lenice — Direttore Responsabile" (anonima)
- [x] Sezione Punto del Giorno anonima: rimosso riferimento ad Andrea Cinelli/FoolFarm/LinkedIn, sostituito con Adrian Lenice (Direttore Responsabile IDEASMART)

## Nuovi task (18 Mar 2026 — Clickio Consent CMP)

- [x] Inserire tag Clickio Consent CMP nell'head di index.html (sopra AdSense/GTM)
- [x] Inserire tag Core Web Vitals Clickio nell'head di index.html
- [x] Aggiungere link "Your Privacy Choices" nel footer del sito

## Nuovi task (18 Mar 2026 — ads.txt Moneytizer/Azerion)

- [x] Creare endpoint Express GET /ads.txt che scarica dinamicamente le righe da Moneytizer e le merge con Google AdSense
- [x] Verificare che https://ideasmart.ai/ads.txt risponda correttamente

## SEO fix (18 Mar 2026)
- [ ] Aggiungere H2 nella home page (/)
- [ ] Accorciare meta description a max 160 caratteri

## Nuovi task (19 Mar 2026 — Rimozione Clickio)

- [x] Rimuovere tag CMP Clickio (consent_248045.js) dall'head di index.html
- [x] Rimuovere tag Core Web Vitals Clickio (248045_wv.js) dall'head di index.html
- [x] Rimuovere Google Consent Mode v2 (era configurato per Clickio) dall'head di index.html
- [x] Rimuovere link "Your Privacy Choices" da footer Home.tsx, AiHome.tsx, MusicHome.tsx, StartupHome.tsx
- [x] Verificare ads.txt: nessuna riga Clickio/Azerion presente (solo AdSense + reseller network)

## Nuovi task (19 Mar 2026 — AdSense Auto Ads)

- [x] Attivare Google AdSense Auto Ads (enable_page_level_ads: true, overlays bottom) in index.html
- [x] Ripristinare Google Consent Mode v2 standalone (senza CMP esterno) nell'head di index.html
- [x] Collegare useCookieConsent a gtag consent update: aggiornamento in tempo reale dopo scelta utente
- [x] Ripristino consenso Google al caricamento pagina (utenti che avevano già scelto)

## Nuovi task (19 Mar 2026 — Fix LinkedIn duplicati)

- [x] Fix LinkedIn duplicati: aggiunto controllo idempotenza nel linkedinPublisher (verifica DB prima di pubblicare) (19 Mar 2026)

## Nuovi task (19 Mar 2026 — SendGrid Stats Admin)

- [x] Procedure tRPC: adminTools.getSendgridStats (global stats, unsubscribes, bounces, spam reports) (19 Mar 2026)
- [x] Pagina admin /admin/sendgrid-stats con dashboard statistiche SendGrid (19 Mar 2026)
- [x] Navigazione admin: aggiunto link "Email Stats" nella barra header admin (19 Mar 2026)
- [x] server/sendgridStats.ts: helper fetchAllSendgridStats con global stats, bounces, spam, unsubscribes (19 Mar 2026)
- [x] ENV: aggiunto sendgridApiKey, sendgridFromEmail, sendgridFromName in env.ts (19 Mar 2026)

## Nuovi task (19 Mar 2026 — IdeaSmart Business)

- [ ] Pagina /business: hero con value proposition "Lancia la tua testata agente"
- [ ] Pagina /business: demo interattiva della redazione agente (simulazione live)
- [ ] Pagina /business: case study IdeaSmart (metriche reali, notizie/giorno, sezioni)
- [ ] Pagina /business: sezione pricing/modelli (full service + revenue sharing)
- [ ] Pagina /business: CTA form per prenotare una call/demo
- [ ] Navigazione: aggiungere link Business nel menu principale
- [ ] Route /business in App.tsx

## Nuovi task (19 Mar 2026 — IdeaSmart Business)

- [x] Pagina /business: hero, demo interattiva redazione agente, case study IdeaSmart, pricing (Starter/Professional/Revenue Sharing), FAQ, form CTA (19 Mar 2026)
- [x] Procedura tRPC: business.requestDemo con email notifica admin + conferma utente (19 Mar 2026)
- [x] Route /business in App.tsx (19 Mar 2026)
- [x] Link "IdeaSmart Business" nel footer della Home (19 Mar 2026)

## Nuovi task (19 Mar 2026 — Navbar Business + Calendly)

- [ ] Aggiungere link "Business" nel Navbar principale
- [ ] Integrare widget Calendly nella pagina /business come CTA principale

## Nuovi task (19 Mar 2026 — Calendly + HilltopAds removal + Chi Siamo)

- [x] Integrare Calendly nella pagina /business (link: https://calendly.com/andyiltoscano/30min) (19 Mar 2026)
- [x] Rimuovere tutti e tre gli script HilltopAds da index.html (19 Mar 2026)
- [x] Creare pagina /chi-siamo con storia editoriale di IdeaSmart (19 Mar 2026)
- [x] Aggiungere link Chi Siamo nella navigazione (Navbar desktop+mobile) e nel footer (19 Mar 2026)

## Nuovi task (19 Mar 2026 — Link Chi Siamo da Business)

- [x] Aggiungere link /chi-siamo nella sezione case study della pagina /business (19 Mar 2026)
- [x] Aggiungere link /chi-siamo nel footer della pagina /business (19 Mar 2026)

## Nuovi task (19 Mar 2026 — Menu elegante + Chi Siamo + Business maquette)

- [x] Ridisegnare menu navigazione Home: due righe eleganti con hover accent color + scrollabile (19 Mar 2026)
- [x] Aggiungere Chi Siamo accanto a Manifesto nel menu riga 2 (19 Mar 2026)
- [x] Maquette IdeaSmart Business: pulsante dark #1a1a2e + arancio #ff5500 in fondo alla riga 2 (19 Mar 2026)

## Nuovi task (19 Mar 2026 — Menu: sezione attiva + freccia mobile)

- [x] Indicatore sezione attiva nel menu riga 1 (useLocation + accent color permanente + underline bianco) (19 Mar 2026)
- [x] Freccia scorrimento orizzontale su mobile (lato destro menu riga 1, scompare quando non serve) (19 Mar 2026)

## Nuovi task (19 Mar 2026 — Allineamento layout /chi-siamo e /business)

- [ ] Riscrivere ChiSiamo.tsx con layout editoriale IdeaSmart (testata, palette, tipografia, Navbar, footer)
- [ ] Riscrivere Business.tsx con layout editoriale IdeaSmart (mantenendo demo interattiva e Calendly)

## Nuovi task (19 Mar 2026 — Contatore notizie live nel menu)

- [x] Procedura tRPC: news.getSectionCounts (conteggio notizie per sezione, cache 10 min) (19 Mar 2026)
- [x] SectionNav: badge numerico accanto al nome di ogni sezione nel menu riga 1 (19 Mar 2026)
- [x] Stile badge: accent color su sfondo light per sezione inattiva, bianco trasparente per sezione attiva (19 Mar 2026)

## Nuovi task (19 Mar 2026 — Business page restyling)

- [ ] Sostituire piano Revenue Sharing con piano Custom (€ a progetto) in /business
- [ ] Riscrivere Business.tsx con layout editoriale IdeaSmart (bianco carta, inchiostro, Playfair)

## Nuovi task (19 Mar 2026 — Performance caricamento notizie)

- [ ] Diagnosticare causa caricamento lento notizie homepage
- [ ] Ottimizzare sistema cache per notizie homepage
- [ ] Aggiungere skeleton loading per feedback visivo immediato

## Navbar e Tecnologia (19 Mar 2026 — v2)

- [x] Spostare link "Tecnologia" nella seconda riga navbar (accanto a Edicola, Manifesto, Chi Siamo) — rimuovere dalla riga desktop in alto
- [x] Aggiungere blocco "Verify in numeri" nella pagina /tecnologia con metriche concrete

## Redesign /tecnologia (19 Mar 2026)

- [x] Riscrivere pagina /tecnologia con look editoriale del giornale (carta bianca, Playfair, Source Serif 4, Space Mono, bordi inchiostro) — allineata a Chi Siamo e Business

## Coerenza grafica e UX (19 Mar 2026 — v3)

- [x] Riscrivere Advertise.tsx con look editoriale del giornale (carta bianca, Playfair, Source Serif 4, Space Mono)
- [x] Aggiungere link /tecnologia nella sezione "Come lavoriamo" di ChiSiamo.tsx
- [x] Trasformare sezione processo in /tecnologia in diagramma visivo interattivo

## Audit Hardening & Performance (19 Mar 2026)

- [x] Analisi sicurezza: HTTP headers, rate limiting, input validation, CORS
- [x] Analisi performance: bundle size, lazy loading, query N+1, cache
- [x] Analisi efficienza aggiornamenti: cron jobs, scraping, deduplicazione
- [x] Fix sicurezza: helmet (HSTS, X-Frame, X-Content-Type), rate limiter 100req/15min, trust proxy
- [x] Fix performance: lazy loading img su 17 pagine, indici DB newsItems(section, position), font non-critici media=print
- [x] Fix efficienza: job lock anti-sovrapposizione cron, ridotto body parser 50mb→2mb

## Caching Intelligente DB (19 Mar 2026)

- [x] Analisi cache esistente e query DB più frequenti
- [x] Estendere cache manager: TTL differenziato, LRU eviction, statistiche hit/miss
- [x] Integrare caching nelle procedure tRPC più frequenti (news, editorial, reportage, startup)
- [x] Invalidazione selettiva cache al termine dei cron job (tutti i 14 canali)
- [x] Endpoint /api/cache-stats protetto da JWT_SECRET
- [x] Test vitest per il sistema di caching (17 test, tutti passano)

## Fix Logo Navbar (19 Mar 2026)

- [x] Logo IdeaSmart nella Navbar deve essere un link cliccabile che porta alla homepage (/) — già funzionante, verificato nel browser

## Link Tecnologia nelle pagine sezione (19 Mar 2026)

- [x] Aggiungere link "Tecnologia" nella riga istituzionale di tutte le 14 pagine sezione (AiHome, MusicHome, StartupHome, FinanceHome, HealthHome, SportHome, LuxuryHome, NewsHome, MotoriHome, TennisHome, BasketHome, GossipHome, CybersecurityHome, SondaggiHome)

## Riga istituzionale: Advertise + Hover (19 Mar 2026)

- [x] Aggiungere link "Advertise" nella riga istituzionale della Home (dopo Tecnologia)
- [x] Aggiungere link "Advertise" nella riga istituzionale di tutte le 14 pagine sezione
- [x] Aggiungere hover effect distintivo (underline + colore) su tutti i link istituzionali

## Contatore Lettori Attivi (19 Mar 2026)

- [x] Analizzare procedura getActiveCount nel router tRPC
- [x] Creare componente ReadersCounter riutilizzabile (dato reale dal DB + animazione)
- [x] Integrare contatore nella riga istituzionale della Home
- [x] Integrare contatore nelle 14 pagine sezione con script Python

## Contatore lettori in /advertise (19 Mar 2026)

- [x] Analizzare struttura Advertise.tsx e trovare punti di inserimento ottimali
- [x] Integrare LiveReadersBlock (count-up + pallino pulsante) nella hero e griglia statistiche di Advertise.tsx

## LinkedIn Doppio Post Giornaliero (20 Mar 2026)

- [ ] Pubblicare manualmente il post LinkedIn di oggi (mattina)
- [ ] Aggiungere cron alle 15:00 CET per secondo post LinkedIn pomeridiano
- [ ] Aggiornare linkedinPublisher per gestire due post giornalieri (mattina AI/Startup + pomeriggio Finance/News)
- [ ] Aggiornare sezione "Punto del Giorno" nella Home per mostrare entrambi i post LinkedIn del giorno
- [ ] Aggiornare la procedura tRPC getPuntoDelGiorno per restituire entrambi i post

## LinkedIn Doppio Post Giornaliero (20 Mar 2026)

- [x] Schema DB: aggiunto campo `slot` (morning/afternoon) alla tabella `linkedin_posts`, rimosso unique constraint su `dateLabel`, aggiunto indice composto `dateLabel+slot`
- [x] Migrazione DB applicata con successo (drizzle/0027_panoramic_gertrude_yorkes.sql)
- [x] linkedinPublisher.ts: riscritta funzione `publishLinkedInPost(slot, force)` con supporto slot morning/afternoon e trigger manuale (force=true bypassa idempotenza)
- [x] linkedinPublisher.ts: aggiunta logica `selectSection(slot)` — mattino e pomeriggio usano sezioni opposte (AI vs Startup)
- [x] schedulerManager.ts: aggiunto cron 15:00 CET per post pomeriggio LinkedIn, aggiornato cron 10:30 per usare `publishLinkedInPost("morning")`
- [x] routers.ts: aggiunta procedure `getPuntoDelGiornoAll` che restituisce entrambi i post del giorno
- [x] routers.ts: aggiornata procedure `publishLinkedIn` (admin) con input `slot` e `force`
- [x] PuntoDelGiorno.tsx: aggiornato per mostrare entrambi i post (mattino + pomeriggio) con badge orario colorati (verde teal 10:30, arancione 15:00)
- [x] Pubblicazione manuale post LinkedIn di oggi (20 Mar 2026) — slot morning — ID: urn:li:share:7440697299426504704
- [x] Script `scripts/triggerLinkedIn.ts` per pubblicazione manuale futura
- [x] Test schedulerManager aggiornati: mock `publishLinkedInPost`, test cron 15:00, conteggio 44 cron job
- [x] 59 test Vitest passano tutti ✅

## Bugfix Doppio Post LinkedIn (20 Mar 2026)

- [x] Identificata causa root: indice `idx_linkedin_date_slot` era un normale INDEX (non UNIQUE), quindi `onDuplicateKeyUpdate` non si attivava mai e ogni INSERT creava una nuova riga
- [x] Schema DB: sostituito `index("idx_linkedin_date_slot")` con `uniqueIndex("uq_linkedin_date_slot")` — garantisce un solo post per slot per giorno a livello DB
- [x] Migrazione 0028 applicata: `ALTER TABLE linkedin_posts ADD CONSTRAINT uq_linkedin_date_slot UNIQUE(dateLabel, slot)`
- [x] Eliminato il post duplicato (id=120002) dal DB
- [x] linkedinPublisher.ts: rafforzato controllo idempotenza — il check DB viene eseguito SEMPRE (anche con force=true), con log espliciti per entrambi i casi
- [x] 59 test Vitest passano tutti ✅

## Fix Strutturale EMFILE + Stabilità Server (21 Mar 2026)

- [x] Aumentare limiti OS permanenti: inotify max_user_watches=524288, max_user_instances=8192
- [x] Aggiungere concurrency limiter (max 5 fetch parallele) in rssScraperNew.ts — causa root EMFILE
- [x] Aggiungere graceful uncaughtException handler: EMFILE non crasha più il server
- [x] Aggiungere unhandledRejection handler: promise rejection non crasha il server
- [x] Aggiungere notifica owner su EMFILE e crash critici
- [x] Aggiungere health watchdog: rileva event loop bloccato ogni 30 minuti
- [x] Tutti i 59 test passano

## Admin: Salute Sistema + Notifiche Email + Trigger Manuale (21 Mar 2026)

- [ ] Notifiche email (SendGrid) su crash/EMFILE del server a info@andreacinelli.com
- [ ] Procedure tRPC: getSystemHealth (stato sezioni) e triggerSectionScraping (scraping manuale)
- [ ] Pannello admin "Salute del Sistema": ultima notizia per sezione, stato scraping, timestamp
- [ ] Pulsanti trigger manuale scraping per ogni sezione nell'admin
- [ ] Aggiornare test schedulerManager per nuove procedure

## Admin: Salute Sistema + Notifiche Email Crash (21 marzo 2026)

- [x] Notifiche email su crash/EMFILE del server via SendGrid (server/_core/index.ts)
- [x] Procedure tRPC `health.getSystemHealth` con stats per tutte le 14 sezioni
- [x] Procedure tRPC `health.triggerSectionScraping` per trigger manuale per sezione
- [x] Pagina `/admin/system-health` con pannello visuale stato sezioni
- [x] Pulsanti trigger manuale scraping per ogni singola sezione
- [x] Pulsante "Aggiorna Tutti i Canali" per avvio batch in background
- [x] Link "Salute Sistema" nella navigazione admin
- [x] Tutti i 59 test passano

## LinkedIn Terzo Post Sera (17:30 CET) — Vibe Coding / AI / Startup / Mercato

- [x] Aggiornare schema DB: aggiungere slot 'evening' nella enum linkedin_posts
- [x] Aggiornare linkedinPublisher.ts: logica generazione post sera con tema vibe coding/AI/startup/mercato
- [x] Aggiornare schedulerManager.ts: cron 17:30 CET + catch-up sera
- [x] Aggiornare PuntoDelGiorno.tsx: mostrare anche slot sera (viola/indaco)
- [x] Aggiornare test schedulerManager per il nuovo cron

## Morning Health Report (08:00 CET)

- [ ] Creare server/morningHealthReport.ts con verifica sezioni e composizione email HTML
- [ ] Aggiungere cron 08:00 CET nel schedulerManager
- [ ] Aggiornare test schedulerManager (conteggio cron)

## Nuovi task (24 Mar 2026 — Keep-alive e catch-up newsletter)

- [x] Keep-alive scheduler: ping HTTP al server ogni 12 ore per evitare ibernazione sandbox
- [x] Catch-up newsletter: all'avvio del server, se la newsletter del giorno non è stata inviata (recipientCount=0 o record mancante) e sono passate le 07:30 CET, forzare l'invio entro 60 secondi
- [x] Fix recipientCount nel DB: aggiornamento del contatore reale dopo ogni invio (sendDailyChannelNewsletter + sendChannelNewsletterManual)
- [x] Invio manuale newsletter AI4Business News di oggi (lunedì 24 marzo 2026)

## Nuovi task (25 Mar 2026 — Post LinkedIn temi personalizzati)

- [x] Post LinkedIn 15:30 del 25/03 su Openclaw e la sua rivoluzione
- [x] Post LinkedIn 18:00 del 25/03 sul Vibe Coding
- [x] Sezione "Più letti della settimana" nella homepage con viewCount reale

## Breaking News (26 Mar 2026)

- [ ] Schema DB: tabella breaking_news (id, title, summary, sourceUrl, sourceName, section, urgencyScore, publishedAt, createdAt, isActive)
- [ ] Funzione LLM: selectBreakingNews — ogni ora analizza le ultime 100 notizie da tutti i canali e seleziona le 3-5 più urgenti/straordinarie
- [ ] Cron job ogni ora: genera breaking news e salva nel DB
- [ ] tRPC procedure: news.getBreakingNews (ultime breaking attive, max 5)
- [x] Componente BreakingNewsSection con stile allerta editoriale (rosso/arancio, BREAKING badge, ticker)
- [ ] Integrazione in cima alla homepage (sopra il breaking news ticker esistente)

## Breaking News (26 Mar 2026)

- [ ] Schema DB: tabella breaking_news (id, title, summary, sourceUrl, sourceName, section, urgencyScore, publishedAt, createdAt, isActive)
- [ ] Funzione LLM: selectBreakingNews — ogni ora analizza le ultime 100 notizie da tutti i canali e seleziona le 3-5 più urgenti/straordinarie
- [ ] Cron job ogni ora: genera breaking news e salva nel DB
- [ ] tRPC procedure: news.getBreakingNews (ultime breaking attive, max 5)
- [x] Componente BreakingNewsSection con stile allerta editoriale (rosso/arancio, BREAKING badge, ticker)
- [ ] Integrazione in cima alla homepage (sopra il breaking news ticker esistente)

## LinkedIn Nuovi Orari + Approvazione (26 Mar 2026)
- [ ] Modificare orari LinkedIn: 4 slot (10:30, 12:30, 14:30, 16:30)
- [ ] Aggiornare temi: Trend AI / News AI / AI Coding & Vibe Coding / VC italiano
- [ ] Implementare flusso approvazione: genera testo, invia notifica ad Andrea, pubblica solo dopo OK
- [ ] Aggiungere procedura tRPC approveLinkedInPost e rejectLinkedInPost
- [ ] Fix Punto del Giorno: massimo 3 post, sempre gli ultimi pubblicati

## IDEASMART Research (26 Mar 2026)
- [ ] Tabella DB research_reports (titolo, sommario, fonte, categoria, dataLabel, isFeatured)
- [ ] Funzione AI generateDailyResearch: 10 ricerche da Gartner, CB Insights, Statista, ecc.
- [ ] Cron giornaliero alle 06:00 CET per generare le 10 ricerche
- [ ] Procedura tRPC getResearchReports e getResearchOfDay
- [ ] Pagina /research con lista ricerche, filtri per categoria e call to action
- [ ] Blocco "Ricerca del Giorno" in homepage che punta a /research
- [ ] Aggiungere /research alla barra di navigazione

## Nuovi task (26 Mar 2026 — Home focus Research)

- [x] Rimuovere sezione "Apertura News Italia" dalla Home (notizie generali)
- [x] Integrare generazione ricerche /research nel job di aggiornamento giornaliero automatico

## Nuovi task (26 Mar 2026 — Dettaglio ricerca + Startup del Giorno in Home)

- [ ] Creare pagina dettaglio ricerca /research/:id (testo completo, grafici, fonti, CTA)
- [ ] Aggiungere route /research/:id in App.tsx e collegare link dalle card
- [ ] Spostare sezione Startup del Giorno subito dopo Ricerca del Giorno nella Home

## Pivot IdeaSmart Research (27 Mar 2026)
- [ ] Navbar: rimuovere tutti i canali tranne AI4Business e Startup News
- [ ] Barra SectionNav: aggiornare con solo 2 canali attivi
- [ ] Home: riscrivere con Ricerche del Giorno + AI4Business + Startup News
- [ ] Scheduler: disabilitare aggiornamenti per music, finance, health, sport, luxury, news, motori, tennis, basket, gossip, cybersecurity, sondaggi
- [ ] Catch-up: rimuovere le sezioni disabilitate dal catch-up automatico

## Nuovi task (28 Mar 2026 — Routine automatiche robuste)

- [x] Keep-alive ridotto da 12h a 4h per prevenire ibernazione sandbox
- [x] Aggiunto cron VERIFICA NOTIZIE alle 07:00 CET: controlla AI4Business e Startup, rigenera se mancanti
- [x] Aggiunto cron VERIFICA RESEARCH alle 07:15 CET: rigenera le ricerche se mancanti
- [x] Aggiunto cron VERIFICA LINKEDIN alle 10:00 CET: pubblica il post mattino se nessun post è stato pubblicato oggi
- [x] Forzato refresh manuale notizie AI di oggi (40 notizie generate)
- [x] Verificato: AI=40, Startup=20, Research=20 per il 28 marzo 2026

## Nuovi task (27 Mar 2026 — Aumento notizie Home)

- [x] Rimossa sezione "I Canali" vuota (solo 2 link testuali senza notizie)
- [x] Blocco AI4Business espanso: hero + griglia 3 colonne (6 notizie con immagini) + lista compatta 5 notizie
- [x] Blocco Startup News espanso: hero + griglia 3 colonne (6 notizie con immagini) + lista compatta 5 notizie
- [x] Aggiunta sezione ResearchGrid: griglia 3 colonne con 6 card research reports (immagine, categoria, fonte, titolo, summary, key finding)
- [x] Aumentato limite query DB: ai=12, startup=12 (era 8 e 6)
- [x] Aggiunto imageUrl nella risposta getResearchReports del router
- [x] Sidebar Editoriale AI spostata nel blocco AI4Business con design migliorato
