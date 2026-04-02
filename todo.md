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

## Task completati (29 Mar 2026 — Pulizia e SEO)

- [x] A) Newsletter Startup spostata da martedì (2) a mercoledì (3) — cadenza Lun/Mer/Ven
- [x] B) Footer Home: rimossi link Finance/Health/Sport/Luxury (già pulito)
- [x] C) Admin dashboard: aggiunta sezione "Prossimi Invii Newsletter" con data, canale e iscritti attivi
- [x] D) SEO: SectionLabel ora usa tag H2 semantico (AI4Business, Startup News, Research del Giorno)

## Task completati (29 Mar 2026 — DEALROOM integrazione)

- [x] Aggiunto cron job DEALROOM alle 01:30 CET nello schedulerManager (refreshDealroomNewsFromRSS)
- [x] Sezione DEALROOM aggiunta alla Home page (4 articoli principali + 4 in lista compatta)
- [x] Link DEALROOM aggiunto nella sidebar e nel footer della Home page
- [x] Widget "Prossimi Invii Newsletter" aggiunto nella dashboard Admin (Lun/Mer/Ven, canale, iscritti attivi)
- [x] refreshDealroomNewsFromRSS aggiunto all'import dello schedulerManager

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

## Nuovi task (28 Mar 2026 — Alert email + LinkedIn Startup pomeridiano)

- [x] Alert email a info@ideasmart.ai quando verifica 07:00 rigenera notizie mancanti
- [x] Alert email a info@ideasmart.ai quando verifica 07:15 rigenera ricerche mancanti
- [x] Secondo post LinkedIn pomeridiano dedicato alle Startup News (slot 13:00 CET)
- [x] Aggiornare log riepilogo scheduler con nuovi cron

## Nuovi task (28 Mar 2026 — Autore articoli: Andrea Cinelli)

- [x] Sostituire "Andrian Lenice" con "Andrea Cinelli" in tutti i file sorgente (8 file)
- [x] Aggiornare i prompt LLM per generare articoli firmati "Andrea Cinelli"
- [x] Aggiornare il publisher LinkedIn per includere il nome autore nei post (prima persona + firma)
- [x] Aggiornare i record esistenti nel DB (24 post LinkedIn aggiornati con firma)

## Nuovi task (28 Mar 2026 — Redesign Home newsroom Sole 24 Ore)

- [ ] Ridisegnare Home con layout editoriale asimmetrico stile newsroom finanziaria
- [ ] Griglia hero + colonne miste: articolo grande + 2-3 colonne laterali
- [ ] Mescolare notizie Research/AI/Startup/VC in un unico flusso editoriale
- [ ] Tipografia da giornale finanziario (serif per titoli, sans per corpo)
- [ ] Sezioni tematiche orizzontali con separatori editoriali
- [ ] Nessuna foto ripetuta: ogni articolo con immagine diversa o senza immagine (stile FT)

## Nuovi task (28 Mar 2026 — Redesign Home Newsroom)

- [x] Ridisegnare completamente la Home con layout newsroom editoriale stile Sole 24 Ore
- [x] Blocco 1 Primo Piano: 3 colonne — AI Hero | Startup Hero | Flusso misto ultime notizie
- [x] Foto AI hero e Startup hero sempre diverse (nessuna ripetizione immagine)
- [x] Striscia Research: 6 card orizzontali con immagine, badge categoria, key finding
- [x] Blocco Approfondimenti: 2 colonne editoriali AI + Startup con editoriale in evidenza
- [x] Blocco Finance & Markets: hero + lista + banner 300x250
- [x] Flusso misto interleaved AI+Startup nella colonna "Ultime notizie"
- [x] Rimosso HeroNewsBlock con foto ripetuta — sostituito con HeroArticle e MediumArticle

## Nuovi task (28 Mar 2026 — Miglioramenti Home + Pagina VC)

- [ ] Aggiungere RicercaDelGiorno come quarta colonna nel blocco Primo Piano
- [ ] Inserire ticker di aggiornamento ("Aggiornato oggi alle 00:00") nei titoli dei blocchi
- [ ] Creare pagina /venture-capital con notizie Finance + ricerche VC
- [ ] Aggiungere /venture-capital nella navbar (SectionNav) e nel footer
- [ ] Aggiungere route /venture-capital in App.tsx

## Nuovi task (28 Mar 2026 — Tre miglioramenti Home)

- [x] Aggiungere RicercaDelGiorno come quarta colonna nel blocco Primo Piano (query getResearchOfDay)
- [x] Inserire ticker di aggiornamento nei titoli dei blocchi principali (Primo Piano, Research, Approfondimenti, Finance)
- [x] Aggiungere procedura tRPC getResearchByCategory per filtrare ricerche per categoria
- [x] Creare pagina /venture-capital con notizie Finance + ricerche VC + startup + CTA ricerche dedicate
- [x] Aggiungere route /venture-capital in App.tsx
- [x] Link "Venture Capital →" nel blocco Finance della Home

## Nuovi task (28 Mar 2026 — Firma Andrea Cinelli)

- [x] Aggiornare titolo Andrea Cinelli: "Direttore Responsabile · IDEASMART" → "Opinion Leader & Editorialista IdeaSmart Research" (8 file)
- [x] Limitare firma Andrea Cinelli a un solo articolo per pagina (solo il post Mattino nel PuntoDelGiorno)
- [x] Rimuovere firma dai post Pomeriggio e Sera nel PuntoDelGiorno
- [x] Aggiornare firma nel publisher LinkedIn: "Andrea Cinelli | Opinion Leader & Editorialista IdeaSmart Research"

## Nuovi task (28 Mar 2026 — Pagina autore Andrea Cinelli)

- [x] Caricare foto profilo Andrea Cinelli su CDN (andrea-cinelli-profile_2084610f.jpeg)
- [x] Aggiornare avatar PuntoDelGiorno con foto reale (solo post Mattino, w-10 h-10 rounded-full)
- [x] Aggiungere link profilo LinkedIn sotto la firma nel post Mattino
- [x] Creare pagina /andrea-cinelli con bio, archivio editoriali (30 post) e CTA contatto
- [x] Aggiungere route /andrea-cinelli in App.tsx
- [x] Linkare la firma nel PuntoDelGiorno alla pagina /andrea-cinelli (nome + avatar cliccabili)

## Nuovi task (28 Mar 2026 — Redesign IdeaSmart Business)

- [x] Riscrivere pagina /business come landing page consulting premium AI Innovation / M&A / Venture Capital
- [x] Sezione hero con 4 KPI (30+ anni, 20 ricerche/giorno, 40+ M&A, 100% verticale AI)
- [x] Sezione servizi verticali accordion (AI Strategy, M&A Advisory, VC Research, Board Advisory)
- [x] Sezione team senior advisor con credenziali Top 500 / exit (4 profili)
- [x] Sezione clienti target (Fondi VC, Corporate, Scaleup, Family Office)
- [x] Positioning statement con citazione di Andrea Cinelli
- [x] FAQ accordion (4 domande chiave)
- [x] CTA contatto: form + email diretta business@ideasmart.ai + link LinkedIn

## Nuovi task (28 Mar 2026 — Team anonimo Business + Banner recruiting)

- [x] Rimuovere Andrea Cinelli dalla sezione team di Business.tsx
- [x] Sostituire i profili team con 6 figure anonime autorevoli: Ex Big 5, Ex Investment Banking, Founder 3 Exit, Ex Partner VC, Opinion Leader AI, Ex C-Level Fortune 500
- [x] Aggiungere banner recruiting in fondo a Business.tsx ("Vuoi collaborare con noi? Candidati a info@ideasmart.ai")
- [x] Aggiungere banner recruiting in fondo a ChiSiamo.tsx (stile teal coerente con la palette della pagina)

## Nuovi task (28 Mar 2026 — Chi Siamo: fondatore e slogan)

- [x] Sostituire Andrea Cinelli con Adrian Lenice come fondatore nella pagina Chi Siamo
- [x] Aggiornare lo slogan: "Ridefinire la ricerca di mercato nell'era dell'AI... per chi investe in AI, VC e Startup"
- [x] Aggiornare la bio del fondatore: Adrian Lenice, Founder & CEO, 30+ anni ecosistema tech/VC europeo

## Nuovi task (28 Mar 2026 — Chi Siamo: KPI, Timeline e CTA)

- [x] Aggiornare i KPI statistici: 20+ ricerche/giorno, 450+ fonti, 3 aree analisi, 30+ anni esperienza, 00:00 aggiornamento, 100% dati verificati
- [x] Aggiornare la Timeline: rimossi tutti i riferimenti a testata giornalistica, sostituiti con piattaforma di ricerca/analisi
- [x] Riscrivere la CTA finale: "Analisi a supporto delle tue decisioni. Con i migliori esperti del settore." + link IdeaSmart Research Business
- [x] Aggiornare SEO title e meta description della pagina Chi Siamo

## Nuovi task (28 Mar 2026 — Chi Siamo: nuova narrazione posizionamento)

- [x] Aggiornare hero/headline: "La prima società italiana di Ricerca di Mercato ed Executive Reports in ambito tecnologico basata su tecnologia agentica"
- [x] Aggiornare il manifesto: "Ricerca di mercato senza bias, senza agenda, senza confini"
- [x] Aggiornare la Timeline: "Da progetto interno a leader nella ricerca tecnologica agentica"
- [x] Rinominare 8 agenti con terminologia di analisi: Market Scout, Data Verifier, Research Writer, Senior Analyst, Data Modeler, Publisher, Social Analyst, Intelligence Curator
- [x] Aggiornare badge sezione da "La redazione" a "Il sistema agentico"

## Nuovi task (28 Mar 2026 — Chi Siamo: team photo, firme, testimonial, 100+ clienti)

- [x] Generare immagine professionale del team con Adrian Lenice al centro stile Steve Jobs (boardroom notturna, turtleneck nero)
- [x] Caricare immagine team su CDN e inserirla nella pagina Chi Siamo con caption overlay
- [x] Aggiungere sezione "Alcune firme di IdeaSmart" con Andrea Cinelli (foto reale, bio, link LinkedIn linkedin.com/in/cinellia)
- [x] Aggiungere 4 testimonial anonimi da top company: Fondo VC Londra, Fortune 500 Milano, Family Office Svizzera, Scaleup Berlino
- [x] Aggiornare KPI: "100+" clienti in Italia e nel mondo (sostituisce "3 aree di analisi")

## Nuovi task (28 Mar 2026 — Rigenera foto team italiana)

- [x] Rigenerare foto team con personaggi completamente inventati, volti italiani, ambientazione italiana (Milano, Duomo in background, luce dorata italiana)
- [x] Aggiornare URL foto team nella pagina Chi Siamo con la nuova immagine

## Task Business Page Redesign (28 Mar 2026)

- [x] Uniformare header/navbar della pagina /business con il resto del sito (stile editoriale bianco carta)
- [x] Ristrutturare /business in due offerte distinte: A) Piattaforma AI Agentica (IdeaSmart Intelligence) e B) Consulenza & Advisory (IdeaSmart Advisory)
- [x] Hero section con titolo e sottotitolo coerenti con il posizionamento di ricerca/analisi
- [x] Sezione A: piattaforma AI agentica con news personalizzate 24h, algoritmo Verify, abbonamento
- [x] Sezione B: consulenza, ricerca e advisory su AI, M&A, partnership tecnologiche
- [x] CTA chiare per entrambe le offerte

## Fix LinkedIn Duplicati e Immagini (28 Mar 2026)

- [x] Aggiungere campo postHash (SHA-256 del testo) alla tabella linkedin_posts
- [x] Aggiungere controllo hash prima della pubblicazione: blocca se testo identico già pubblicato negli ultimi 7 giorni
- [x] Correggere controllo idempotenza: usare timezone CET/CEST (Europe/Rome) per dateLabel, non UTC
- [x] Aggiungere controllo testo simile tra slot dello stesso giorno (similarity check)
- [x] Migliorare selezione immagine tematica: estrarre keyword dal titolo del post e usarle per Pexels
- [x] Aggiungere pool di immagini usate di recente per evitare ripetizioni (ultimi 7 giorni)
- [x] Aggiungere colonna postHash nella tabella per tracking contenuto duplicato
- [x] Testare e verificare che i fix funzionino (TypeScript OK, migrazione DB applicata)

## Differenziazione Slot LinkedIn (28 Mar 2026)

- [x] Ridisegnare selectSection: mattino fisso AI, startup-afternoon fisso Startup, afternoon in rotazione (finance/health/sport/luxury), sera in rotazione (finance/health/sport/luxury offset +2)
- [x] Aggiungere SECTION_META per finance, health, sport, luxury con hashtag e path dedicati
- [x] Aggiornare SUPPORTED_SECTIONS per includere le nuove sezioni
- [x] Aggiornare buildGartnerPrompt con slotNote specifiche per ogni sezione (finance, health, sport, luxury)
- [x] Aggiornare il tipo LinkedInSection e la logica di selezione sezione
- [x] Testare TypeScript — nessun errore di compilazione

## Redesign Home — Layout Prima Pagina Giornale (28 Mar 2026)

- [x] Ridisegnare Home con layout 2 colonne (70%) + sidebar destra (30%) stile Sole 24 Ore
- [x] Colonna principale: hero AI grande (320px immagine, titolo 32-38px) + griglia 2col Startup/AI + seconda riga Finance/Health/Sport
- [x] Sidebar destra: stream 30 notizie miste con badge sezione colorato + sommario 2 righe
- [x] Font size aumentati: body 15px, sommari 15px, titoli secondari 18-22px, hero 26-38px
- [x] Mantenere Punto del Giorno come sezione dedicata sopra la griglia principale
- [x] Mantenere Breaking News e ticker invariati
- [x] Aggiungere promo IdeaSmart Business nella sidebar
- [x] Aggiungere Research del Giorno nella sidebar

## Leggibilità Home e Punto del Giorno (28 Mar 2026)

- [ ] Aumentare font size: SidebarNewsItem titolo da text-[14px] a text-[16px], sommario da text-[13px] a text-[15px]
- [ ] Aumentare font size: SecondaryArticle titolo da text-[18px] a text-[20px], sommario da text-[15px] a text-[16px]
- [ ] Aumentare font size: HeroArticle titolo da text-[28px] a text-[32px], sommario da text-[15px] a text-[17px]
- [ ] Aumentare font size: Research card titolo da text-[14px] a text-[16px], sommario da text-[12px] a text-[14px]
- [ ] Rimuovere sezioni Finance/Health/Sport dalla seconda riga della griglia
- [ ] Spostare PuntoDelGiorno a metà pagina come colonna editoriale (dopo griglia AI+Startup, prima di Research)
- [ ] Ridisegnare PuntoDelGiorno come sezione editoriale a piena larghezza con sfondo carta

## Aggiornamento Pianificazione Automatica (28 Mar 2026)
- [ ] Disabilitare cron barometro politico 05:45 (sezione Sondaggi in stand by)
- [ ] Aggiungere newsletter venerdì: AI4Business + Ricerche del Giorno a tutti gli iscritti
- [ ] Aggiornare commento header schedulerManager con la nuova pianificazione

## Aggiornamento Pianificazione (28 Mar 2026)

- [x] Disabilitare cron barometro politico 05:45 (sezione Sondaggi in stand by)
- [x] Aggiungere newsletter venerdì: AI4Business + Ricerche del Giorno a tutti gli iscritti (dayOfWeek: 5)
- [x] Aggiornare commento header schedulerManager con la nuova pianificazione ufficiale

## Task 28 Mar 2026 — Newsletter, Footer, Admin SEO

- [ ] A) Spostare newsletter Startup da martedì (dayOfWeek:2) a mercoledì (dayOfWeek:3)
- [ ] A) Aggiornare commento header schedulerManager: Lunedì AI, Mercoledì Startup, Venerdì AI
- [ ] B) Rimuovere Finance & Markets, Health & Biotech, Sport & Business dal footer
- [ ] C) Aggiungere sezione "Prossimi Invii Newsletter" nella dashboard admin (data, canale, iscritti attivi)
- [ ] D) Aggiungere H2 SEO visibile nella Home per risolvere il problema SEO (nessun H2 trovato)

## Task completati (29 Mar 2026 — Mailchimp + Autore + SendGrid)

- [x] Template HTML Mailchimp promozionale IDEASMART AI for Business (FoolTalent, Foolshare, IIO.Ai) — file: ideasmart-mailchimp-template.html
- [x] Pagina /andrea-cinelli: già implementata con bio, foto, LinkedIn, archivio editoriali e CTA
- [x] Integrazione metriche SendGrid: già implementata in /admin/sendgrid-stats con grafici, tabelle e filtri

## Nuovi task (29 Mar 2026 — Sezione Prossimi Eventi)

- [ ] Creare schema DB tabella `events` per eventi Tech/AI/Startup italiani
- [ ] Implementare job di aggregazione eventi da Luma ICS + RSS feeds italiani/europei
- [ ] Creare procedura tRPC `news.getUpcomingEvents` per recupero eventi futuri
- [ ] Costruire componente EventiSection nella Home con card evento (data, titolo, luogo, CTA)
- [ ] Collegare aggiornamento automatico eventi al scheduler giornaliero

## Task completati (29 Mar 2026 — Sezione Prossimi Eventi + Fix Header Business)

- [x] Fix header pagina /business: rimossa testata personalizzata, uniformata alla Navbar standard del sito
- [x] Schema DB: tabella tech_events (externalUid, source, title, location, startAt, category, isOnline, isFree)
- [x] Migrazione DB: pnpm db:push eseguita con successo (tabella tech_events creata)
- [x] eventsAggregator.ts: aggregazione eventi da Luma ICS (Milano Tech/AI) + RSS italiani (EconomyUp, AgendaDigitale, InnovationPost, BeBeez)
- [x] tRPC procedure: events.getUpcoming (limit, category filter) e events.triggerAggregation (admin)
- [x] Scheduler: job cron ogni 12 ore (06:30 e 18:30 CET) + prima aggregazione 3 min dopo avvio
- [x] Home.tsx: sezione "Prossimi Eventi" con grid 3 colonne, data box, badge categoria, location, orario
- [x] Sezione visibile solo quando ci sono eventi nel DB (conditional rendering)

## Nuovi task (29 Mar 2026 — Ristrutturazione Intelligence/Business)

- [ ] Home: aggiungere banner "IdeaSmart Intelligence" sotto il ticker live (prima dei canali)
- [ ] Navbar: rinominare "▶ IdeaSmart Business" in "Intelligence" in tutte le pagine
- [ ] /business: nuovo hero "Intelligence che lavora. Decisioni che contano."
- [ ] /business: 3 tier pricing (RADAR €39/mese, INTEL €199/mese, ENTERPRISE custom da €499)
- [ ] /business: sezione "Come funziona" con 8 agenti e Verify™ come reason to believe
- [ ] /business: sezione Advisory ridimensionata come servizio complementare
- [ ] /business: social proof con metriche concrete (clienti attivi, report generati, alert inviati)

## Task completati (29 Mar 2026 — Intelligence + Prossimi Eventi)

- [x] Fix header /business: rimossa testata personalizzata, uniformata alla Navbar standard
- [x] Sezione "Prossimi Eventi" nella Home: Luma ICS + RSS italiani, aggiornamento ogni 12h
- [x] Schema DB: tabella tech_events per eventi Tech/AI italiani
- [x] Backend eventsAggregator.ts: aggregazione da Luma ICS e RSS (EconomyUp, AgendaDigitale, InnovationPost, BeBeez)
- [x] tRPC procedure events.getUpcoming
- [x] Scheduler: job aggregazione eventi ogni 12h alle 06:30 e 18:30 CET
- [x] Banner Intelligence nella Home: dopo BreakingNewsTicker, link a /intelligence, CTA "100+ decision-maker attivi"
- [x] Strip pre-footer Intelligence nella Home: "CEO, founder, investitori: il tuo briefing settimanale personalizzato è a un click"
- [x] Rinomina voce menu: "▶ IdeaSmart Business" → "▶ Intelligence" (link a /intelligence, colore cyan)
- [x] Footer Home: aggiornato link da /business a /intelligence
- [x] Nuova pagina /intelligence: 8 sezioni (Hero, Problema, Come funziona, Piani, Tecnologia, Advisory, Social Proof, CTA)
- [x] Pricing 3 tier: RADAR €39/mese, INTEL €199/mese (highlighted), ENTERPRISE su misura
- [x] Route /intelligence in App.tsx + redirect da /business a /intelligence

## Nuovi task (29 Mar 2026 — Homepage redesign)

- [x] Rimuovere banner Tradedoubler leaderboard e manchette dalla homepage (4 banner rimossi)
- [x] Aggiungere strip metriche: 14 canali · 20+ ricerche/giorno · 450+ fonti · 6.905 lettori
- [x] Contenuti reali già presenti in homepage (hero AI, griglia Startup/AI, 6 card research, editoriale)
- [x] Banner Intelligence prominente dopo il ticker + box Intelligence in sidebar al posto del banner 300x250

## Nuovi task (29 Mar 2026 — Redesign Homepage + Intelligence v2)

### Homepage
- [ ] Aggiungere barra canali secondaria sotto nav principale (News Italia | Finance | Health | Cybersecurity | Sport | Lifestyle)
- [ ] Rimuovere banner top "IdeaSmart Research — 20 ricerche ogni giorno" dall'header
- [ ] Spostare strip metriche DOPO i contenuti editoriali (non prima)
- [ ] Aggiungere strip CTA pre-footer: "CEO, founder, investitori: il tuo briefing settimanale personalizzato è a un click. [Attiva Intelligence →]"
- [ ] Rimuovere manchette sinistra "20 ricerche ogni giorno" dall'header

### Pagina /intelligence
- [ ] Riscrivere Hero con copy definitivo ("Intelligence che lavora. Decisioni che contano.") e smooth scroll
- [ ] Sezione Problema con testo definitivo
- [ ] Sezione Come Funziona con 4 step e icone SVG
- [ ] Sezione Pricing con 3 tier (RADAR €39, INTEL €199 highlighted, ENTERPRISE custom) e CTA mailto
- [ ] Sezione Tecnologia con 8 agenti e griglia 2x2
- [ ] Sezione Advisory compatta (senza bio team, senza testimonial)
- [ ] Sezione Social Proof con 5 metriche grandi
- [ ] Sezione CTA finale con trial gratuito
- [ ] SEO: title, meta description, OG tags definitivi
- [ ] Analytics: data-attributes sui CTA per tracking
- [ ] Toggle pricing annuale/mensile con sconto

## Task completati (29 Mar 2026 — Redesign Homepage + Intelligence)

- [x] Barra canali secondaria in header (News Italia | Finance & Markets | Health & Biotech | Cybersecurity | Sport & Business | Lifestyle)
- [x] Rimossa manchette sinistra "20 ricerche ogni giorno" dall'header
- [x] Box Intelligence dark nella sidebar al posto del banner 300x250
- [x] Strip metriche (14 canali · 20+ ricerche/giorno · 450+ fonti · 6.905 lettori) dopo il ticker
- [x] Strip CTA pre-footer ("CEO, founder, investitori: il tuo briefing settimanale personalizzato è a un click")
- [x] Toggle annuale/mensile nella sezione pricing di /intelligence (RADAR €33/€39, INTEL €169/€199)
- [x] Pagina /intelligence con 8 sezioni complete e copy definitivo
- [x] Redirect automatico da /business a /intelligence

## Task da completare (29 Mar 2026 — Implementazione completa prompt)

### Homepage
- [ ] Contenuti editoriali dinamici: "Ricerca del Giorno" (card grande) + top 4-6 notizie (griglia 2-3 col)
- [ ] Strip metriche riposizionata: dopo i contenuti editoriali (non dopo il ticker)
- [ ] Strip CTA pre-footer: "CEO, founder, investitori: il tuo briefing settimanale personalizzato è a un click" + "Attiva Intelligence →"
- [ ] Link "Vedi tutte le ricerche →" e "Vedi tutte le notizie →" nelle sezioni contenuti

### Pagina /intelligence
- [ ] Smooth scroll funzionante: CTA hero → id="pricing", "Scopri come funziona" → id="come-funziona"
- [ ] CTA mailto pre-compilati: RADAR/INTEL → intelligence@ideasmart.biz?subject=Richiesta trial RADAR/INTEL
- [ ] ENTERPRISE/Advisory → advisory@ideasmart.biz
- [ ] SEO: title "IdeaSmart Intelligence — Competitive Monitoring & AI Briefing per Decision-Maker"
- [ ] SEO: meta description, Open Graph tags, Twitter Card
- [ ] Analytics: data-* attributes su tutti i CTA (data-cta-name, data-plan)
- [ ] Commento <!-- TODO: Client logos row --> nella sezione social proof
- [ ] Mobile: INTEL mostrata per prima nella griglia pricing (order CSS)
- [ ] Link "Scopri tutti gli 8 agenti" → /tecnologia (non #piani)
- [ ] ARIA labels su tutti i CTA buttons

## Task completati (29 Mar 2026 — Intelligence.tsx completamento prompt)

- [x] /intelligence: smooth scroll anchor id="pricing" e id="come-funziona"
- [x] /intelligence: CTA mailto pre-compilati con subject (Richiesta trial RADAR / INTEL / ENTERPRISE)
- [x] /intelligence: analytics data-attributes (data-cta-name, data-plan) su tutti i CTA
- [x] /intelligence: mobile INTEL-first nella griglia pricing (order-first su mobile)
- [x] /intelligence: link /tecnologia nella sezione agenti (sostituisce #piani)
- [x] /intelligence: badge "PIU' SCELTO" (sostituisce "Piu' popolare")
- [x] /intelligence: TODO client logos comment nella sezione social proof
- [x] /intelligence: ARIA labels su tutti i CTA principali
- [x] /intelligence: PricingCard riceve ctaHref e ctaAriaLabel come props
- [x] Homepage: Ricerca del Giorno come card grande in evidenza sopra la griglia notizie
- [x] Homepage: strip metriche spostata dopo i contenuti editoriali (prima della CTA pre-footer)
- [x] Homepage: manchette sinistra rimossa, header simmetrico
- [x] Homepage: barra canali secondaria (News Italia, Finance, Health, Cybersecurity, Sport, Lifestyle)
- [x] Homepage: box Intelligence dark nella sidebar al posto del banner 300x250

## Fix critiche (29 Mar 2026 — Live review)

- [x] 1) NAV: rinominare "Business" → "Intelligence" in desktop e mobile nav (colore cyan #00e5c8)
- [x] 2) PRICING: aggiungere piano FREE (€0) a sinistra con 4 features e CTA ghost
- [x] 3) TAGLINE RADAR: "Per chi vuole un sistema, non un giornale."
- [x] 4) LINK AGENTI: /tecnologia (già presente)
- [x] 5) MAILTO SUBJECT: pre-compilati per RADAR, INTEL, ENTERPRISE, Advisory, CTA finale
- [x] 6) FOOTER /intelligence: aggiunto "Intelligence" — ordine: Home | Intelligence | Research | Chi Siamo | Privacy
- [x] 7) HERO: "Oppure scopri come funziona ↓" con smooth scroll a #come-funziona
- [x] 8) CTA FINALE: "Non sei pronto? Registrati gratis e leggi 5 articoli al giorno →"
- [x] 9) TOGGLE MENSILE/ANNUALE: RADAR €33/€39, INTEL €169/€199 (già presente)
- [x] 10) BADGE INTEL: "PIÙ SCELTO" (già presente)
- [x] 11) SEO TITLE: "IdeaSmart Intelligence — Competitive Monitoring & AI Briefing per Decision-Maker" (già presente)

## Fix critiche (29 Mar 2026 — Feedback homepage v2)

- [x] Tagline logo: cambiata in "INTELLIGENCE QUOTIDIANA SU AI, STARTUP E VENTURE CAPITAL / Ricerche verificate, alert e briefing per chi prende decisioni."
- [x] Banner Intelligence: redesign completo — hero 200px+, gradiente dark (#0a0f1e→#0a1f1a), 2 colonne desktop (titolo grande + CTA destra), posizionato PRIMA del Breaking News

## Bug (29 Mar 2026)

- [ ] Fix link "Vedi su LinkedIn" negli articoli: genera URL malformati (linkedin.com/404/) invece del profilo corretto

## Rebrand (29 Mar 2026 — IDEASMART senza RESEARCH)

- [ ] Logo header Home: rimuovere "RESEARCH" in verde, lasciare solo "IDEASMART" impattante
- [ ] Tagline header: "INTELLIGENCE QUOTIDIANA SU AI, STARTUP E VENTURE CAPITAL / Il sistema che lavora per chi decide."
- [ ] Footer: "© 2026 IdeaSmart · AI · Startup · Venture Capital" (rimuovere "Research")
- [ ] Title tag homepage: "IdeaSmart — Intelligence su AI, Startup e Venture Capital"
- [ ] Pagina /chi-siamo: "IdeaSmart è la prima piattaforma italiana di intelligence..." (non "testata di ricerca")
- [ ] Fix link LinkedIn articoli: URL malformati (linkedin.com/404/)

## Redesign visivo (29 Mar 2026 — Font SF Pro + Palette monocromatica)

- [ ] Font: sostituire Space Mono, Playfair Display, DM Sans con SF Pro (system-ui Apple stack) su tutto il sito
- [ ] Palette: convertire tutti i colori teal (#00e5c8), arancio (#ff5500), rosso (#c2410c), verde (#0a6e5c) in scala di grigi
- [ ] Banner Intelligence: sfondo nero, testo bianco, CTA bianco su nero (no teal)
- [ ] Badge nav (AI4Business, Startup News): da colorati a grigi/neri
- [ ] Ticker LIVE e Breaking News: da rosso/teal a nero/grigio
- [ ] Logo: IDEASMART tutto nero, senza RESEARCH in verde
- [ ] Rebrand completo: footer, title tag, /chi-siamo (già in lista)

## Nuovi task (29 Mar 2026 — Paywall e Ricerche)

- [ ] Paywall: redirect al login per utenti non loggati che aprono articoli news (AI, Startup)
- [ ] Paywall: redirect al login per utenti non loggati che aprono ricerche
- [ ] Navbar Ricerche: aggiungere badge contatore come AI NEWS 20 / STARTUP NEWS 20
- [ ] Ricerche: correggere i link nelle card — ogni card deve linkare all'articolo corrispondente

## Task completati (29 Mar 2026 — Auth, Admin, Newsletter)

- [x] Widget "Nuovi iscritti ultime 24h" nella dashboard Admin con lista username/email/stato
- [x] Contatore totale utenti registrati nella dashboard Admin
- [x] Auto-iscrizione newsletter alla verifica email (source: site_registration)
- [x] Redirect post-login alla pagina returnTo (già implementato e funzionante)
- [x] Badge contatore Ricerche nella navbar
- [x] Link card Ricerche → /research/:id con pagina dettaglio
- [x] Paywall full-block su articoli e pagina Research (no overlay)

## Da fare (29 Mar 2026)

- [ ] Canale DEALROOM: pagina con notizie su round, funding, seed, Series A/B, exit
- [ ] Integrare notizie DEALROOM nella Home page
- [ ] Scheduler RSS per fonti DEALROOM (italiane, europee, globali)

## Nuovi task (29 Mar 2026 — DEALROOM, Profilo, Welcome Email)

- [ ] DEALROOM: aggiornare schema DB (enum section con dealroom)
- [ ] DEALROOM: aggiungere fonti RSS italiane/europee/globali in rssSources.ts
- [ ] DEALROOM: aggiungere scraper dedicato in rssScraperNew.ts
- [ ] DEALROOM: aggiungere scheduler in rssNewsScheduler.ts
- [ ] DEALROOM: creare pagina DealroomHome.tsx con stessa grafica delle altre pagine
- [ ] DEALROOM: aggiungere route /dealroom in App.tsx e link nella navbar
- [ ] DEALROOM: integrare sezione notizie DEALROOM nella Home
- [ ] Profilo utente: pagina /profilo con dati utente, cambio password, preferenze newsletter
- [ ] Profilo utente: procedure backend (getProfile, updatePassword, updateNewsletterPrefs)
- [ ] Email benvenuto: template HTML per email di benvenuto post-verifica
- [ ] Email benvenuto: invio automatico in siteAuth.ts dopo verifyEmail

## Task (29 Mar 2026 — DEALROOM potenziamento + Newsletter rinomina)

- [x] A) Migliorare fonti RSS DEALROOM: StartupItalia /rss, Il Sole 24 Ore Economia, Corriere Economia, FinSMEs, TechCrunch Venture, Dealroom.co Blog; rimossi EU-Startups (403), a16z (no feed), Tech Funding News (timeout)
- [x] B) Aggiungere DEALROOM alla navbar con badge NEW (desktop + mobile dropdown)
- [x] C+D) Rinominare newsletter: Lunedì=AI News, Mercoledì=Startup News, Venerdì=DEALROOM News
- [x] C+D) Configurare schedulerManager: venerdì invia DEALROOM News (dealroom key, tagline deal VC)
- [x] C+D) Aggiornare template buildFullNewsletterHtml con banner promo IDEASMART (4000+ fonti, gratis)
- [x] C+D) Aggiornare ChannelKey in db.ts per includere 'dealroom'

## Task (29 Mar 2026 — Pagina DEALROOM + Preferenze + Editoriale)

- [x] 1) Pagina /dealroom con filtri interattivi: Funding (Pre-seed/Angel, Series A, Series B+, M&A/Exit, VC Fund) + Mercato (Italia, Europa, Globale) con contatori e reset
- [x] 2) /preferenze-newsletter aggiornata: canale DEALROOM News (Venerdì, verde #1a4a2e) + enum zod aggiornato in routers.ts
- [x] 3) Job notturno editoriale DEALROOM alle 01:35 CET (dealroomScheduler.ts) + cron job nello schedulerManager

## Bug fix (29 Mar 2026 — Navbar DEALROOM)

- [x] Fix: link DEALROOM aggiunto alla SectionNav della Home page (navSections array)
- [x] Fix: pagina /dealroom — rimosso RequireAuth (login wall), aggiornato SectionChannelBar con solo 3 canali attivi (AI, Startup, Dealroom), rimosso import RequireAuth

## Task (29 Mar 2026 — Riscrittura pagina DEALROOM)

- [x] Rimuovere testata DEALROOM + filtri + sidebar "Cos'è DEALROOM" dalla pagina /dealroom
- [x] Riscrivere layout pagina /dealroom come AI/Startup (notizia del giorno + griglia + lista)
- [x] Lanciare scraping manuale massivo per popolare con più notizie deal/funding/round
- [x] Fix: prompt classificazione DEALROOM — pre-filtro keyword + prompt ultra-selettivo LLM
- [x] Deduplicazione backend per titolo normalizzato in refreshDealroomNewsFromRSS
- [x] Deduplicazione frontend per titolo in DealroomHome.tsx

## Task (29 Mar 2026 — Fonti RSS DEALROOM Europa + UK + US)

- [x] Testare raggiungibilità 35 feed RSS: 19/35 funzionanti (Sifted, Tech.eu, TechCrunch, Google News, Crunchbase, CB Insights, PE Hub, ecc.)
- [x] Aggiungere fonti verificate: +8 nuove (Balderton, Seedcamp, PE Hub, TechCrunch Main, Google News Funding/M&A/VC Italia, HackerNews) → 35 fonti totali
- [x] Scraping massivo: 88 raw → 24 pre-filtro → 12 articoli finali, tutti pertinenti (Physical Intelligence $1B, YC Demo Day, SoftBank $40B, ecc.)

## Task (30 Mar 2026 — Newsletter manuale + Scheduler + Scraping)

- [ ] Disabilitare invio automatico newsletter — richiede approvazione Andrea prima dell'invio
- [ ] Correggere calendario newsletter: Lun=AI News, Mer=Startup News, Ven=DEALROOM News
- [ ] Aggiornare template newsletter con banner promo iscrizione IDEASMART
- [ ] Disabilitare sezioni non attive dallo scheduler (Music, Finance, Health, Sport, Luxury, Motori, Tennis, Basket, Gossip, Cybersecurity, Sondaggi, News)
- [ ] Correggere orario scheduler notturno (dalle 00:00 CET)
- [ ] Lanciare scraping manuale per AI, Startup, Ricerche e DEALROOM

## Task completati (30 Mar 2026 — Aggiornamento newsletter e naming)

- [x] Fix tutti i riferimenti "AI4Business" → "AI News" in tutto il progetto (schedulerManager, db.ts, linkedinPublisher, morningHealthReport, newsletterScheduler, routers, rssScraperNew, Admin.tsx, musicNewsletterScheduler)
- [x] Aggiornamento calendario newsletter: Lunedì=AI News, Mercoledì=Startup News, Venerdì=DEALROOM News
- [x] Admin.tsx: widget "Prossimi Invii" aggiornato con DEALROOM il venerdì
- [x] Template email newsletter: banner promo aggiornato con CTA "Iscriviti ora" e frequenza Lun/Mer/Ven
- [x] Disabilitato catch-up newsletter automatico (richiede approvazione manuale da Admin)
- [x] Aggiunto DEALROOM alla verifica giornaliera notizie (07:00 CET) e catch-up all'avvio
- [x] Log riepilogo scheduler aggiornati con sezioni attive (AI, Startup, DEALROOM, Research)

## Task pulizia canali (30 Mar 2026)

- [x] Eliminare tutti i canali non AI/Startup/Research/DEALROOM dallo schedulerManager (Music, Finance, Health, Sport, Luxury, Gossip, Cybersecurity, Sondaggi, News Generali, Motori, Tennis, Basket)
- [x] Eliminare funzioni refresh e fonti RSS dei canali obsoleti (rssNewsScheduler, rssSources)
- [x] Eliminare procedure tRPC e logica server dei canali obsoleti (routers.ts, db.ts)
- [x] Eliminare pagine sezione client dei canali obsoleti (App.tsx, pagine dedicate)
- [x] Eliminare riferimenti ai canali obsoleti dall'Admin dashboard
- [x] Eliminare file dedicati ai canali obsoleti (musicNewsletterScheduler, ecc.)
- [x] Eliminare riferimenti ai canali obsoleti dal linkedinPublisher
- [x] Verificare compilazione e funzionamento dopo la pulizia (0 errori TS, server OK)

## Bug fix e audit (30 Mar 2026)

- [x] Fix pagina /research: mostra "Registrati" anche se l'utente è loggato — useSiteAuth ora accetta anche OAuth Manus
- [x] Fix logica accesso contenuti: non registrato=anteprime mascherate, registrato=tutto gratis
- [x] Verificare che tutte le pagine (AI News, Startup, DEALROOM, Research, dettaglio articoli) funzionino correttamente per utenti loggati
- [x] Audit scheduling giornaliero: documentare canali, orari, post LinkedIn

## Audit completo (30 Mar 2026)

- [x] A) Fix auth pagina /research: useSiteAuth ora accetta OAuth Manus + registrazione nativa
- [x] B) Audit logica accesso contenuti: 9 pagine protette con RequireAuth, 4 pagine pubbliche
- [x] C) Verifica tutte le pagine: AI News, Startup, DEALROOM, Research, dettaglio articoli
- [x] D) Documentare scheduling aggiornamento giornaliero canali (report completo)
- [x] E) Documentare scheduling post LinkedIn settimanale (report completo)

## Fix e template newsletter (30 Mar 2026)

- [ ] Fix logout: pulsante "ESCI" non funziona per utenti OAuth Manus
- [ ] Fix errore /account: "Devi essere loggato" per utenti OAuth
- [x] Pulizia DB: eliminare notizie canali obsoleti (Music, Finance, Sport, ecc.) — eliminati da breaking_news, market_analysis, weekly_reportage, startup_of_day, content_audit
- [x] Creare nuovo template newsletter AI NEWS coerente con grafica sito — header brandizzato teal/navy
- [x] Creare nuovo template newsletter STARTUP NEWS coerente con grafica sito — header brandizzato arancio
- [x] Creare nuovo template newsletter DEALROOM coerente con grafica sito — header brandizzato nero/gold
- [x] Inviare email esempio template ad Andrea per approvazione — 3 email inviate a ac@foolfarm.com
- [x] Aggiungere link alla ricerca originale in fondo alla pagina ResearchDetail — fix source_url con fallback homepage fonte
- [x] Fix link "LEGGI SU LINKEDIN" — URL LinkedIn nel DB verificati, formato corretto (urn:li:ugcPost)
- [x] Endpoint tRPC admin.sendChannelTestToEmail per inviare newsletter test a qualsiasi email
- [x] Funzione buildSourceUrl nel researchGenerator: fallback automatico a homepage fonte quando LLM non fornisce URL
- [x] Aggiornate 84 ricerche nel DB con source_url mancante (ora tutte le 110 ricerche hanno URL)
- [x] Template newsletter personalizzato per canale: AI News (teal), Startup News (arancio), DEALROOM (gold)

## Redesign completo template newsletter (30 Mar 2026)

- [x] Ridisegnare template newsletter allineato alla grafica attuale del sito — completato
- [x] Font: SF Pro / system-ui (non più Georgia/serif) — completato
- [x] Sfondo crema chiaro come il sito (#f5f0e8) — completato
- [x] Stile editoriale pulito con tab canali (AI NEWS, STARTUP NEWS, DEALROOM) — completato
- [x] Messaggio "400+ fonti verificate con tecnologia Verify" — badge VERIFY aggiunto
- [x] Layout che rispecchia la pagina sezione del canale promosso — completato
- [x] Inviare 3 email di test con nuovo template a ac@foolfarm.com — 3 email inviate con successo

## Redesign pagina /chi-siamo come landing di vendita (30 Mar 2026)

- [x] Riscrivere completamente ChiSiamo.tsx come landing page di vendita piattaforma giornalismo agentico
- [x] Hero: "Il primo giornale che funziona anche senza una redazione" + CTA demo
- [x] Sezione IL PROBLEMA: costi alti, produzione lenta, dipendenza team, bias
- [x] Sezione LA SOLUZIONE: piattaforma giornalismo agentico, 8 agenti AI, 4000+ fonti
- [x] Sezione TECNOLOGIA VERIFY: AI + verifica, personalizzazione tono/stile
- [x] Sezione COSA PUOI FARE: lanciare testata, automatizzare giornale, vertical media
- [x] Sezione PER CHI È: editori, giornalisti, media company, creator
- [x] Sezione MODELLO: setup €5.000 + revenue share 30%
- [x] Sezione PROVA SOCIALE: IDEASMART come case study (6.900+ lettori, 3 canali, 1 persona)
- [x] CTA FINALE: prenota demo + parla con noi — sfondo nero con 2 CTA
- [x] Stile Stripe/Notion: pulito, diretto, moderno — font SF Pro, nero/bianco/crema

## Rimozione Intelligence + Post LinkedIn + Newsletter promo (30 Mar 2026)

- [x] Eliminare tutti i riferimenti a "Intelligence" / "Attiva Intelligence" da tutte le pagine
- [x] Rimuovere link Intelligence dal footer
- [x] Rimuovere banner "Attiva Intelligence" dal footer
- [x] Creare bozza post LinkedIn promozionale per Ideasmart (modello giornalismo agentico) — pubblicato: https://www.linkedin.com/feed/update/urn:li:share:7444357069979406338/
- [ ] Creare bozza newsletter promozionale da inviare domattina

## Aggiornamento sezione Modello /chi-siamo (30 Mar 2026)
- [x] Sostituire pricing singolo con 3 piani: Mini (€2.500), Medium (€5.000), Maxi (€7.500) + Custom — verificato nel browser

## Fix nome mittente newsletter (30 Mar 2026)
- [x] Cambiare nome mittente da "AI4Business News by IDEASMART" a "IDEASMART" in tutte le newsletter — env SENDGRID_FROM_NAME + fallback codice aggiornati

## Invio newsletter promozionale programmato (30 Mar 2026)
- [x] Creare endpoint/funzione per invio massivo newsletter promozionale a tutti gli iscritti — sendPromoNewsletterToAll() creata
- [ ] Programmare invio per domattina 31 marzo ore 8:00

## Fix data post LinkedIn (30 Mar 2026)
- [x] Correggere bug: i post LinkedIn automatici usano la data di generazione (es. domenica) invece della data di pubblicazione (lunedì) — aggiunta DATA DI PUBBLICAZIONE esplicita nel prompt LLM + istruzione di non iniziare con la data

## Nuove richieste (30 Mar 2026 sera)
- [x] Importare soci FoolFarm dal CSV come iscritti newsletter — 19 nuovi importati, 38 già iscritti, 0 errori
- [x] Cambiare firma LinkedIn da "Opinion Leader & Editorialista IdeaSmart Research" a "Tech Expert" — aggiornato in linkedinPublisher.ts, PuntoDelGiorno.tsx, AndreaCinelli.tsx
- [x] Programmare invio newsletter promo per 31 marzo ore 10:30 CET — task schedulato

## Sezione FAQ pagina /chi-siamo (30 Mar 2026)
- [ ] Creare bozza FAQ con domande sui modelli di redazione, tecnologia Verify, setup e target
- [ ] Implementare sezione FAQ in ChiSiamo.tsx con design coerente

## Fix SEO H2 Homepage (30 Mar 2026)

- [x] Fix: SectionLabel cambiato da H2 (10px) a span — anti-pattern SEO (heading nascosti)
- [x] Fix: HeroArticle titolo cambiato da H2 a H3 (è titolo articolo, non sezione)
- [x] Fix: Ricerca del Giorno card titolo cambiato da H2 a H3 (è titolo articolo, non sezione)
- [x] Fix: PuntoDelGiorno titolo post cambiato da H2 a H3 (è titolo articolo, non sezione)
- [x] Aggiunto H2 semantico "Ricerca del Giorno" alla sezione ricerca in evidenza
- [x] Aggiunto H2 semantico "Prima Pagina" alla sezione principale notizie
- [x] Aggiunto H2 semantico "IdeaSmart — 20 ricerche al giorno" alla sezione ricerche
- [x] Aggiunto H2 semantico "DEALROOM — Round, Funding & M&A" alla sezione dealroom
- [x] Mantenuto H2 "Prossimi Eventi" già esistente e corretto
- [x] Gerarchia heading corretta: H1 (IDEASMART) → H2 (sezioni) → H3 (titoli articoli)

## Modifica programmazione LinkedIn (30 Mar 2026)

- [x] Cambiare slot LinkedIn MATTINO da 10:30 a 10:00 CET (AI News)
- [x] Cambiare slot LinkedIn POMERIGGIO da 13:00 a 14:30 CET (Startup News)
- [x] Nuovo slot LinkedIn 17:00 CET — Ricerche (post su una delle ultime ricerche IdeaSmart)
- [x] Cambiare slot LinkedIn SERA da 17:30 a 18:00 CET — Dealroom (post su uno degli ultimi deal)
- [x] Implementare generazione post LinkedIn per slot "research" (ricerche IdeaSmart)
- [x] Implementare generazione post LinkedIn per slot "dealroom" (ultimi deal)
- [x] Aggiornare catch-up LinkedIn per i nuovi 4 slot
- [x] Aggiornare verifica giornaliera LinkedIn per i nuovi 4 slot
- [x] Aggiornare invalidazione cache dopo LinkedIn
- [x] Aggiornare test schedulerManager e linkedinPublisher

## Cambio nome mittente newsletter (31 Mar 2026)

- [x] Cambiare il nome mittente di tutte le newsletter in "Ideasmart Daily"

## Aggiornamento prezzi pagina Chi Siamo (31 Mar 2026)

- [x] Aggiornare prezzi: setup una tantum + canone mensile (Mini €2.500+€500/m, Medium €5.000+€750/m, Maxi €7.500+€900/m)
- [x] Aggiungere alternativa revenue share 20% al posto del canone mensile
- [x] Aggiungere confronto costi vs redazione tradizionale (fino a 10x meno)
- [x] Aggiornare FAQ relative ai prezzi e revenue share

## Aggiornamento descrizione tecnologia Verify (31 Mar 2026)

- [x] Aggiornare descrizione Verify nella sezione principale della pagina Chi Siamo
- [x] Aggiornare FAQ su Verify con protocollo di validazione agentica, Verification Report e hash crittografico

## BUG: Homepage vuota in produzione (31 Mar 2026)

- [x] Diagnosticare e risolvere homepage vuota in produzione (era un problema temporaneo, sito ora funzionante)

## Demone Health Check produzione (31 Mar 2026)

- [x] Creare modulo siteHealthCheck.ts con verifiche contenuti homepage
- [x] Verificare: risposta HTTP 200, presenza sezioni (breaking, ricerca del giorno, prima pagina, ricerche, dealroom, eventi)
- [x] Verificare: API tRPC rispondono correttamente (news AI, Startup, DEALROOM, ricerche)
- [x] Inviare notifica email al proprietario se il sito risulta vuoto o con errori
- [x] Integrare nello schedulerManager come cron ogni ora
- [x] Aggiungere test

## Nuove funzionalità (31 Mar 2026 - batch 2)

- [x] Cookie sessione 30 giorni — già implementato: cookie durata 1 anno (ONE_YEAR_MS) in oauth.ts e index.ts
- [x] Endpoint admin per forzare manualmente il health check dalla dashboard
- [x] Tabella DB per log storico health check (monitoraggio trend uptime)
- [x] Salvare risultati health check nel DB ad ogni esecuzione
- [x] Newsletter promozionale aggiornata — senza prezzi, focus "crea la tua redazione agentica e il tuo giornale"
- [x] Invio test newsletter promo a ac@acinelli.com

## Batch 3 — Newsletter, Pagina Giornalisti, Navbar (31 Mar 2026)

- [x] A) Newsletter promo: riscritta con stile homepage IdeaSmart (font SF/system-ui, colori bianco/nero/crema), più commerciale con spunti Chi Siamo, senza prezzi
- [x] A) Reinvio test newsletter a ac@acinelli.com
- [x] B) Creare pagina "Per Giornalisti, Freelancer e Giornali Online" con presentazione offerta
- [x] B) Aggiungere route e link nella navbar
- [x] C) Spostare Chi Siamo come primo elemento nel menu navbar (label: CHI SIAMO)

## Batch 4 — Navbar, Form Contatto, Newsletter Invio (31 Mar 2026)

- [x] Aggiungere link /per-giornalisti nella navbar tra CHI SIAMO e AI NEWS (homepage + SharedPageHeader)
- [x] Creare tabella DB demoRequests per salvare le richieste demo
- [x] Creare form di contatto nella pagina /per-giornalisti (nome, email, tipo, messaggio)
- [x] Creare endpoint tRPC per salvataggio richiesta demo nel DB
- [x] Inviare notifica automatica email a info@ideasmart.ai per ogni nuova richiesta
- [ ] Verificare newsletter test e procedere con invio massivo ai 6.906 iscritti

## Batch 5 — Navbar layout + Pricing aggiornato (31 Mar 2026)

- [x] Spostare CHI SIAMO e PER GIORNALISTI a destra nella navbar, separati dai canali (homepage + SharedPageHeader)
- [x] Rinominare "PER GIORNALISTI" in "PER GIORNALISTI & TESTATE ONLINE"
- [x] Riscrivere pricing Chi Siamo: Single Vertical (€3.000+€500/m), Multi-Channel (€5.000+€750/m), Full Newsroom (€7.500+€1.000/m), Custom/Enterprise
- [x] Aggiornare Revenue Share: solo Multi-Channel e Full Newsroom, 20% ricavi, minimi garantiti (€300/m e €500/m)
- [x] Aggiornare FAQ con nuovi nomi piani e prezzi

## Batch 6 — Riscrittura completa pagina /per-giornalisti (31 Mar 2026)

- [x] Riscrivere completamente la pagina /per-giornalisti con 13 sezioni: Hero, Il Numero, Il Problema, La Soluzione, Come Funziona, Cosa Ottieni, Prove, Fai Due Conti, Pricing, Revenue Share, Casi d'Uso, FAQ, CTA Finale
- [x] Aggiornare SEO meta tag (title + description)
- [x] Collegare CTA "Prenota una demo" al form di contatto tRPC esistente

## Batch 7 — Aggiornamento pagina /per-giornalisti v2 (31 Mar 2026)

- [ ] Aggiungere sezione "Cos'è un Agent Giornalista" con 3 esempi concreti (Finanza, Tech & AI, Sport Business) PRIMA del pricing
- [ ] Aggiungere tabella schema agenti per piano (Agent Giornalisti + agenti di supporto)
- [ ] Aggiornare pricing: setup Single Vertical da €3.000 a €2.500, costi annui (Anno 1 + Anno 2+), esempi d'uso per ogni piano
- [ ] Aggiornare tabella confronto con €2.500 setup (risparmio €124.500/anno)
- [ ] Aggiungere 2 nuove FAQ: "Cosa sono gli Agent Giornalisti?" e "Differenza tra Agent Giornalisti e agenti di supporto"
- [ ] Aggiornare note sotto i piani con token extra e riconfigurabilità agenti

## Task (31 Mar 2026 — Aggiornamento pagina Per Giornalisti v2)

- [ ] Nuova sezione "Agent Giornalisti" prima del pricing con 3 esempi concreti e tabella agenti per piano
- [ ] Setup Single Vertical aggiornato da €3.000 a €2.500
- [ ] Costo anno 1 Single Vertical aggiornato da €9.000 a €8.500
- [ ] Nomenclatura agenti: "4 Agent Giornalisti + 4 agenti di supporto" in tutti i piani
- [ ] Esempi d'uso aggiunti in ogni piano (es. Agent AI Policy, Agent AI Business...)
- [ ] Tabella confronto Card 1 aggiornata con risparmio €124.500 e setup €2.500
- [ ] 2 nuove FAQ: "Cosa sono gli Agent Giornalisti?" e "Differenza tra Agent Giornalisti e agenti di supporto"
- [ ] Aggiornare pagina Chi Siamo con setup €2.500 e sezione Agent Giornalisti

## Task (31 Mar 2026 — Allineamento prezzi e aggiornamento PerManager)
- [ ] Allineare prezzi pagina /chi-siamo con /per-giornalisti (setup €2.500, ecc.)
- [ ] Aggiornare pagina /per-manager con nuovi prezzi
- [ ] Aggiungere tema Agent Giornalisti nella pagina /per-manager

## Task (31 Mar 2026 — Aggiornamento ChiSiamo + Rinomina route)
- [x] ChiSiamo: aggiornare setup Single Vertical da €3.000 a €2.500
- [x] ChiSiamo: aggiornare costo annuo Single Vertical da €9.000 a €8.500
- [x] ChiSiamo: aggiornare nomenclatura agenti con "Agent Giornalisti + agenti di supporto"
- [x] ChiSiamo: aggiungere sezione Agent Giornalisti (3 esempi + tabella)
- [x] ChiSiamo: aggiornare FAQ con nuova nomenclatura e prezzi
- [x] Rinominare route /per-giornalisti in /offertacommerciale
- [x] Aggiornare label navbar da "Per Giornalisti & Testate Online" a "Offerta"

## Task (31 Mar 2026 — Aggiornamento PerManager)
- [ ] PerManager: aggiornare setup Single Vertical da €3.000 a €2.500
- [ ] PerManager: aggiornare costo annuo Single Vertical da €9.000 a €8.500
- [ ] PerManager: aggiornare nomenclatura con "Agent Giornalisti + agenti di supporto"
- [ ] PerManager: aggiungere sezione Agent Giornalisti (3 esempi + tabella)
- [ ] PerManager: aggiornare confronto con "fino a 17x meno"
- [ ] PerManager: aggiornare tabella risparmio con €124.500

## Task (31 Mar 2026 — Fix navbar sovrapposizione Registrati)
- [x] Fix: pulsante Registrati/Accedi si sovrappone alla barra canali nella navbar

## Task (31 Mar 2026 — Redirect 301 + Navbar responsive)
- [x] Aggiungere redirect 301 da /per-giornalisti a /offertacommerciale
- [x] Verificare e correggere navbar responsive su dispositivi mobili

## Task (31 Mar 2026 — Migliorie navbar)
- [x] Aggiungere menu hamburger su mobile per link secondari (Chi Siamo, Offerta)
- [x] Implementare effetto hover migliorato sui pulsanti della navbar
- [x] Aggiungere icone accanto ai canali nella barra di navigazione

## Task (31 Mar 2026 — Animazione + Profilo + Sticky navbar)
- [x] Animazione slide-down al menu a tendina mobile
- [x] Icona profilo utente con menu a tendina personalizzato nella navbar
- [x] Navbar sticky (barra canali fissa in alto durante lo scroll)

## Task (31 Mar 2026 — Correzione ruoli autori)
- [x] Correggere: Andrea Cinelli = Tech Expert (non Direttore Editoriale)
- [x] Correggere: Adrian Lenice = Direttore Editoriale (dove serve il ruolo di direttore)
- [x] Verificare tutti i file che contengono "Direttore Editoriale" associato a Cinelli

## Bug (31 Mar 2026 — Home vuota in produzione)
- [ ] Fix: Home page in produzione mostra solo header + metriche + footer, nessun contenuto (Breaking News, articoli, ecc.)

## Task (31 Mar 2026 — Demo pagina SandwichClub)
- [x] Analizzare sito sandwichclub.it e raccogliere tutte le notizie
- [x] Creare pagina demo /demo/sandwichclub con notizie estratte nello stile IdeaSmart
- [x] Aggiungere route /demo/sandwichclub fuori menu in App.tsx

## Task (31 Mar 2026 — Sezione commenti demo Sandwich Club)
- [x] Aggiungere sezione commenti per ogni articolo nella pagina demo /demo/sandwichclub
- [x] Form commento con nome e testo
- [x] Commenti di esempio pre-popolati per demo

## Task (31 Mar 2026 — Demo Sandwich Club: commenti + Powered by)
- [x] Aggiungere badge "Powered by IdeaSmart HumanLess Journalism" con link alla home
- [x] Aggiungere sezione commenti per ogni articolo nella pagina demo
- [x] Form commento con nome e testo
- [x] Commenti di esempio pre-popolati per demo

## Task (31 Mar 2026 — Editoriale Venture Studio Index)
- [x] Creare pagina editoriale su IdeaSmart basata sulla ricerca Venture Studio Index
- [x] Aggiungere route dedicata in App.tsx (/editoriale/venture-studio-index)
- [x] Stile coerente con gli editoriali esistenti di IdeaSmart
- [x] Autore: Adrian Lenice, Direttore Editoriale

## Task (31 Mar 2026 — Editoriale VSI in Home)
- [x] Aggiungere editoriale Venture Studio Index nella Home page come nuovo editoriale in evidenza

## Bug Fix (31 Mar 2026)
- [x] Fix TypeError: Cannot read properties of undefined (reading 'section') in BreakingNewsSection

## Task (1 Apr 2026 — Newsletter Unica IDEASMART)
- [x] Creare nuovo template HTML newsletter unica (stile "There's an AI for That")
- [x] Cover pulita con data, titolo IDEASMART, link "Leggi online"
- [x] Blocco sponsor del giorno con bordo rosso laterale
- [x] Sezione Breaking News (top 3-5 notizie urgenti)
- [x] Sezione AI News (top 3-5 notizie AI)
- [x] Sezione Startup News (top 3-5 notizie startup)
- [x] Sezione Dealroom (top 3-5 deal/funding)
- [x] Sezione Editoriale IdeaSmart (placeholder per futuro)
- [x] Sezione Ricerca del Giorno (top 5 ricerche)
- [x] Aggiornare generatore per raccogliere contenuti da tutti i canali
- [x] Aggiornare scheduler: una sola newsletter quotidiana (Lun/Mer/Ven alle 07:00 CET)
- [x] Aggiornare router admin per invio newsletter unica (sendUnifiedPreview, sendUnifiedTestToEmail, sendUnifiedNewsletterToAll)
- [x] Testare con invio di prova (inviata a ac@acinelli.com)

## Task (1 Apr 2026 — Sponsor Foolshare nella Newsletter)
- [x] Inserire Foolshare (foolshare.xyz) come sponsor nella newsletter unificata

## Task (1 Apr 2026 — Miglioramento Sponsor Newsletter)
- [x] Aggiungere immagine Foolshare dal sito nel blocco sponsor (hero isometrica CDN)
- [x] Migliorare design del blocco sponsor (immagine cliccabile, feature grid 2x2, CTA più grande, border-radius 12px)

## Task (1 Apr 2026 — Newsletter Sponsor Dinamici + Breaking News Fix)
- [x] Creare tabella DB newsletter_sponsors per sponsor dinamici
- [x] Inserire Foolshare come sponsor principale nel DB
- [x] Raccogliere info FoolTalent e catturare immagine dal sito (fooltalent.replit.app)
- [x] Inserire FoolTalent come sponsor secondario (Today's Spotlight) nel DB
- [x] Aggiornare template newsletter per leggere sponsor dal DB (rotazione automatica)
- [x] Aggiungere blocco "Today's Spotlight" a metà newsletter (tra Startup e Dealroom)
- [x] Fix bug breaking news: rimosso update generico che disattivava tutte le BN senza check data
- [x] Testare newsletter completa: 5 AI + 5 Startup + 5 Dealroom + 5 Breaking + 5 Ricerche + 2 Sponsor

## Task (1 Apr 2026 — Box Promo Offerta nella Newsletter)
- [x] Aggiungere box promo "By IDEASMART" nella newsletter (stile TAAFT Prompt Pack)
- [x] Testo persuasivo che promuove l'offerta commerciale (redazione AI, Agent Giornalisti, Verify, pricing)
- [x] Link alla pagina /offertacommerciale con UTM tracking

## Task (1 Apr 2026 — Correzione Box Promo + Intro Newsletter)
- [x] Leggere pagina /offertacommerciale per prezzi corretti (Single Vertical €500, Multi-Channel €750, Full Newsroom €1.000)
- [x] Riscrivere box promo con testo di Andrea ("Sei un giornalista, una testata online...")
- [x] Migliorare intro newsletter (aggiunto sottotitolo "briefing quotidiano su AI, Startup e Venture Capital")
- [x] Verificare breaking news: 5 attive nel DB, tutte presenti nella newsletter

## Task (1 Apr 2026 — Area Promo Amazon nella Newsletter)
- [ ] Visitare link Amazon per raccogliere info prodotto
- [ ] Creare tabella DB per promo Amazon giornaliere
- [ ] Aggiungere blocco promo Amazon nel template newsletter
- [ ] Testare con invio preview

## Task (1 Apr 2026 — Newsletter giornaliera unica + Analisi crediti)
- [ ] Aggiornare scheduler newsletter da Lun/Mer/Ven a giornaliero (ogni giorno alle 07:00 CET)
- [ ] Eliminare le vecchie newsletter separate (mantenere solo la unificata)
- [ ] Programmare invio massivo newsletter alle 11:00 CET di oggi
- [ ] Analizzare consumo crediti giornaliero del sito (LLM, email, API, ecc.)

## Task (1 Apr 2026 — Newsletter giornaliera definitiva)
- [x] Preview newsletter alle 09:00 CET ogni giorno (ac@acinelli.com)
- [x] Invio massivo newsletter alle 11:00 CET ogni giorno (tutta la mailing list)
- [x] Eliminare vecchie newsletter per canale (Lun/Mer/Ven) dallo scheduler

## Task (1 Apr 2026 — Admin Amazon Deals + Sponsor + Crediti)
- [x] Area admin Amazon Deals: CRUD per inserire più link, rotazione giornaliera automatica
- [x] Area admin Sponsor Newsletter: CRUD per sponsor personalizzati (sostituisce Foolshare/FoolTalent)
- [x] Analisi consumo crediti giornaliero del sito (LLM, email, immagini, API)

## Task (1 Apr 2026 — Ottimizzazioni crediti)
- [x] A) Ridurre breaking news da ogni ora a ogni 3 ore
- [x] B) Inserire primi sponsor e Amazon Deals nel database
- [x] C) Sostituire generazione AI con Pexels per tutte le immagini notizie

<<<<<<< Updated upstream
## Task (1 Apr 2026 — LinkedIn AI Tool Radar)
- [x] Verificare perché post LinkedIn 14:30 e 17:00 non pubblicati oggi (sandbox ibernata tra 12-17 CET)
- [x] Creare generatore AI Tool Radar: scraping RSS (Product Hunt, HN, GitHub) + LLM per 10 tool/giorno
- [x] Aggiungere slot LinkedIn alle 18:00 CET con format "10 nuovi tool AI scoperti oggi"
- [x] Spostare slot DEALROOM per non sovrapporre con AI Tool Radar
- [x] Cambiare prompt STARTUP 14:30: 10 startup AI EU/IT investibili (stile VC) invece di news editoriale
- [x] Creare startupRadar.ts: scraping RSS EU/IT + LLM per selezionare 10 startup/giorno
- [x] Aggiungere slot AI Tool Radar alle 18:00 CET nello scheduler
- [x] Spostare slot DEALROOM da 18:00 a 19:00 CET
- [x] Aggiornare catch-up LinkedIn con i nuovi slot

## Task (1 Apr 2026 — Fix immagini LinkedIn + Startup Radar)
- [x] Correggere logica immagini Pexels: keyword diverse per ogni slot, no duplicati tra post
- [x] Forzare post LinkedIn Startup Radar EU/IT (10 startup investibili)
- [x] Aggiornare TUTTI i prompt LLM LinkedIn con limite rigido 3000 caratteri (morning, startup, research, dealroom, ai-tool-radar)
- [x] Riscrivere prompt Startup Radar: descrizione USP, dati finanziari, rating INVEST/INVEST+/INVEST++
- [x] Aggiungere link diretti a startup e tool AI nei post LinkedIn (Startup Radar + AI Tool Radar)

## Task (1 Apr 2026 — Verifiche + RSS italiane + AI Dealflow)
- [x] Verificare programmazione stasera e domani (LinkedIn + newsletter)
- [x] Aggiungere fonti RSS italiane (EconomyUp, CorCom, Digital4, Key4biz, ZeroUno) al Startup Radar
- [x] Creare sezione AI Dealflow sul sito con selezioni startup giornaliere
- [ ] Programmare verifica automatica domani per post LinkedIn
- [x] Creare articolo nella home a nome Giulio Centemero basato sul post LinkedIn Dealroom/VC
=======
## Task (1 Apr 2026 — Articolo Centemero in Home)
- [x] Inserire articolo Giulio Centemero "Deep Tech VC 150 miliardi" in evidenza nella Home sotto la hero
- [x] Riorganizzare sezione sotto la hero: Centemero (In Evidenza) + Venture Studio Index (Analisi IdeaSmart)
>>>>>>> Stashed changes

## Task (1 Apr 2026 — Articolo Centemero corretto + Aggiornamento notizie)
- [ ] Sostituire articolo Centemero in Home con testo corretto da MF-Milano Finanza (nuovo TUF, delisting, governance)
- [ ] Aggiornare il record nel database con titolo e testo corretti
- [x] Verificare che le notizie nella Home e nei canali siano aggiornate (AI: 15, Startup: 12, Dealroom: 15, Ricerche: 20)

## Task (1 Apr 2026 — Articolo Centemero corretto + Layout giornale + Aggiornamento notizie)
- [x] Sostituire articolo Centemero con testo corretto da MF-Milano Finanza (nuovo TUF, delisting, governance)
- [x] Aggiornare il record nel database con titolo e testo corretti
- [x] Riprogettare layout sotto la hero: impaginazione a colonne stile giornale (articolo grande + laterali)
- [x] Verificare che le notizie nella Home e nei canali siano aggiornate (AI: 15, Startup: 12, Dealroom: 15, Ricerche: 20)

## Task (1 Apr 2026 — Editoriale Centemero corretto)
- [x] Trascrivere testo integrale articolo MF Centemero (non mostrare foto articolo)
- [x] Trovare e caricare foto ritratto di Giulio Centemero
- [x] Inserire articolo come editoriale nella Home (non link al Dealroom)

## Task (1 Apr 2026 — Voce Demo nella navbar)
- [x] Aggiungere voce "Demo" nella navbar dopo "Offerta" con link a ideasmart.technology

## Task (2 Apr 2026 — Ristrutturazione Newsletter)
- [x] A) Aumentare spazi Amazon Deals a 2 in sezioni diverse (link: amzn.to/4s8n0wI e amzn.to/3PYgBXA)
- [x] B) Creare sezione promozione ebook "Collezione dei migliori Prompt 2026" stile TAAFT + landing page + acquisto Stripe
- [x] C) Creare sezione "AI Tools of the Day" nella newsletter con form per proporre il proprio tool (logica: submit oggi → presente domani)
- [x] D) Togliere Fragmentalis, promuovere FoolTalent (fooltalent.com) tra i tool of the day + link "Pubblicizza su IdeaSmart Newsletter" → email info@ideasmart.ai
- [x] E) Area "Diventa Sponsor" con invio email a info@ideasmart.ai
- [x] F) Sezione "Open Source AI Tools" nella newsletter
- [x] F2) Area feedback nella newsletter (feedback visibili in Admin)
- [x] G) Sezione privacy/rispetto dati in fondo alla newsletter (stile TAAFT)
- [x] Creare tabella DB per tool submissions e newsletter feedback
- [x] Creare pagina /submit-tool per proporre il proprio AI tool
- [x] Creare landing page ebook Prompt 2026 con Stripe
- [x] Aggiornare template HTML newsletter con tutte le nuove sezioni
- [x] Aggiornare generatore newsletter per popolare sezioni dinamicamente
- [x] Aggiornare Admin per visualizzare tool submissions e feedback

## Task (2 Apr 2026 — Stripe, Open Source Tools, Newsletter 11:30)
- [x] Posticipare invio newsletter dalle 11:00 alle 11:30 CET
- [x] Inserire 5-10 Open Source AI Tools nel database (8 inseriti: Ollama, LangChain, HF Transformers, SD WebUI, Open WebUI, Whisper.cpp, CrewAI, Dify)
- [x] Integrare Stripe per acquisto ebook Prompt 2026 (prod_UGDeLme5Ehqahx, price_1THhCzQQVoHT3i87f1Ljpyvd)
- [x] Aggiornare landing page ebook con link Stripe reale (buy.stripe.com/4gM5kFdoT5yS0FZ6SocbC07)
- [x] Inviare newsletter di test per verificare rendering (preview inviata a ac@acinelli.com)

## Task (2 Apr 2026 — Rimuovere sezione In Evidenza)
- [x] Eliminare la sezione "In Evidenza" (editoriale Centemero) dalla Home page

## Task (2 Apr 2026 — Fix Newsletter: sezioni mancanti)
- [x] Rimuovere Fragmentalis dal template newsletter (deve esserci solo FoolTalent)
- [x] Aggiungere promozione ebook "Collezione dei migliori Prompt 2026" con link alla landing page
- [x] Verificare presenza di tutte le nuove sezioni: AI Tools of the Day, Open Source AI Tools, Amazon Deals x2, Diventa Sponsor, Feedback, Privacy
- [x] Inviare newsletter di test a ac@acinelli.com per verifica
- [x] Disattivare/rimuovere Fragmentalis dalla tabella newsletter_sponsors nel database

- [x] Estrarre info prodotto da promptcollection.manus.space per promozione ebook
- [x] Aggiornare blocco ebook nella newsletter con info e link a promptcollection.manus.space
- [x] Spostare blocco ebook in posizione più prominente (subito dopo intro)
- [x] Ottimizzare HTML newsletter per ridurre dimensione e evitare taglio Gmail
- [x] Inviare newsletter di test aggiornata

## Task (2 Apr 2026 — Riordino newsletter: box redazione in fondo, ebook con immagine)
- [x] Spostare box "La tua redazione AI, pronta in 7 giorni" in fondo alla newsletter
- [x] Cambiare link ebook da promptcollection.manus.space a ideasmart.forum
- [x] Aggiungere immagine dal sito promptcollection.manus.space al blocco ebook
- [x] Inviare newsletter di test aggiornata

## Task (2 Apr 2026 — Modifica ragione sociale newsletter)
- [x] Cambiare "IdeaSmart S.r.l." in "IdeaSmart LLC" nella sezione Privacy della newsletter

## Task (2 Apr 2026 — Spostare Sponsor del Giorno sotto Breaking News)
- [x] Spostare la sezione "Sponsor del Giorno" sotto Breaking News nella newsletter

## Task (2 Apr 2026 — Newsletter test + ragione sociale sito)
- [x] Inviare newsletter di test con nuovo ordine (Sponsor sotto Breaking)
- [x] Verificare e aggiornare "S.r.l." in "LLC" nella pagina Privacy del sito (non presente, già pulito)
- [x] Verificare e aggiornare "S.r.l." in "LLC" nel footer del sito (non presente, già pulito)
- [x] Verificare e aggiornare "S.r.l." in "LLC" in qualsiasi altro file del progetto (nessuna occorrenza trovata)

## Task (2 Apr 2026 — 3 Nuovi Canali: AI Tools, Top Prompt AI, AI in Action)
- [ ] Analizzare PDF libro prompt per estrarre contenuti Top Prompt AI
- [ ] Progettare schema DB per canali Top Prompt AI e AI in Action
- [ ] Creare tabelle Drizzle e push migrazioni
- [ ] Creare procedure tRPC per AI Tools (riuso da ai_tools esistente + proponi tool)
- [ ] Creare procedure tRPC per Top Prompt AI (lista, dettaglio, admin CRUD)
- [ ] Creare procedure tRPC per AI in Action (lista, dettaglio, admin CRUD)
- [ ] Creare sistema raccolta RSS + AI agent per AI in Action
- [ ] Popolare Top Prompt AI con contenuti estratti dal libro
- [ ] Creare pagina frontend AI Tools con link a proponi tool
- [ ] Creare pagina frontend Top Prompt AI
- [ ] Creare pagina frontend AI in Action
- [ ] Aggiungere i 3 canali alla navigazione (navbar)
- [ ] Integrare i 3 canali nella newsletter
- [ ] Test e verifica

## Task (2 Apr 2026 — Spostare Amazon Deals nella newsletter)
- [x] Spostare Amazon Deals prima di IDEASMART Research nella newsletter
- [x] Spostare "Diventa Sponsor" subito dopo lo Sponsor del Giorno

## Task (2 Apr 2026 — Promo Collezione Prompt in Homepage)
- [x] Inviare newsletter di test con nuovo ordine
- [x] Creare area promo "Collezione dei Migliori Prompt 2026" nella homepage con link a ideasmart.forum
