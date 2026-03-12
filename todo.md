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
