# Deploy

Due comandi. `release.sh` costruisce e pubblica l'immagine, `deploy.sh` la porta
sul server e la collauda. Il server non compila e non vede mai i sorgenti:
scarica un'immagine già pronta, la stessa che hai provato qui.

```
./scripts/release.sh     # costruisce, pubblica, e fissa PROBUS_TAG in .env
./scripts/deploy.sh      # aggiorna il server, aspetta healthy, collauda, e in caso rimette indietro
```

---

## I file

| file | a cosa serve |
|---|---|
| `docker-compose.yml` | lo stack. Stesso file qui e sul server; cambia solo il `.env` |
| `docker-compose.build.yml` | overlay per costruire in locale invece di scaricare |
| `Caddyfile` | HTTPS con certificato automatico. Serve solo sul server |
| `.env` | questa macchina |
| `.env.server` | il server. `deploy.sh` lo copia là come `.env` |
| `.env.example` | tutte le variabili, spiegate |

`.env` e `.env.server` non entrano nell'immagine: `.dockerignore` li esclude.

---

## Preparazione, una volta sola

**1. Il registry.** Serve un posto da cui il server scarica. Con GitHub
Container Registry basta un token con permesso `write:packages`:

```
echo "$TOKEN" | docker login ghcr.io -u TUO_UTENTE --password-stdin
```

Poi in `.env.server` metti `PROBUS_IMAGE=ghcr.io/TUO_UTENTE/busfinder`, e la
stessa riga in `.env` perché `release.sh` legge da lì dove pubblicare.

Un pacchetto su GHCR nasce privato: o lo rendi pubblico dalle impostazioni del
pacchetto, oppure fai `docker login ghcr.io` anche sul server.

**2. L'architettura del server.** `PROBUS_PLATFORM` in `.env` deve descrivere
il **server**, non questa macchina. Un VPS Ampere o Graviton è `linux/arm64` e
un'immagine amd64 lì non parte. Nel dubbio:

```
ssh TUO_SERVER uname -m     # x86_64 → linux/amd64 · aarch64 → linux/arm64
```

**3. Il DNS.** Il record A (e AAAA se hai IPv6) del dominio deve già puntare al
server, e le porte 80 e 443 devono essere raggiungibili, prima del primo
deploy: Caddy prende il certificato all'avvio e Let's Encrypt concede cinque
tentativi a settimana per dominio.

**4. `.env.server`.** Compila `PROBUS_IMAGE`, `PROBUS_DOMAIN`,
`PROBUS_ACME_EMAIL` e `PROBUS_CONTACT`. `deploy.sh` si rifiuta di partire se
trovi ancora i segnaposto `CHANGEME`.

**5. Il server.** Servono solo Docker e il plugin compose. `deploy.sh` crea da
sé `PROBUS_REMOTE_DIR` e ci copia dentro configurazione e `.env`. L'accesso SSH
deve essere a chiave: lo script è non interattivo e non chiede password.

---

## Cosa succede a ogni deploy

`deploy.sh` in ordine:

1. rifiuta di partire se `.env.server` ha ancora dei `CHANGEME`;
2. annota quale immagine sta girando adesso, per poterci tornare;
3. copia `docker-compose.yml`, `Caddyfile` e `.env.server` sul server — solo
   configurazione, mai sorgenti;
4. scarica la nuova immagine e riavvia;
5. aspetta fino a cinque minuti che il container diventi `healthy`;
6. lancia `scripts/smoke.ts` contro l'URL pubblico: diciotto controlli su tutte
   le route, compreso un giro completo di scrittura e cancellazione sulla
   sincronizzazione;
7. se il container non diventa sano o il collaudo fallisce, **rimette
   l'immagine precedente** e esce con errore.

Il primo deploy non ha nulla da ripristinare e lo dice.

---

## Il primo avvio è lento

Al primo boot, o dopo aver svuotato `data/`, l'entrypoint ingerisce il GTFS
prima ancora di mettersi in ascolto: circa 214 MB di `stop_times.txt`, diversi
minuti. Per questo l'healthcheck ha uno `start-period` di dieci minuti e
`deploy.sh` aspetta fino a cinque. Su un VPS piccolo può volerci di più: se il
primo deploy fallisce per timeout, il container probabilmente sta ancora
ingerendo. Guarda `docker logs -f busfinder` prima di concludere che è rotto.

Il limite di memoria è `2g`. Sotto circa `1.5g` l'ingest rischia di essere
ucciso per OOM a metà.

---

## I dati

Tre database in `${PROBUS_DATA}`, montati come bind mount e non come volume
Docker, apposta: così `docker compose down -v` non può cancellarli.

| file | se lo perdi |
|---|---|
| `gtfs.db` | si ricostruisce da solo al riavvio, ~400 MB |
| `motion.db` | si ricostruisce solo osservando il traffico per settimane |
| `sync.db` | **non si recupera.** Nessun upstream, nessun backup. Contiene i dati cifrati di ogni dispositivo sincronizzato |

`sync.db` è l'unico che merita un backup vero. È minuscolo:

```
ssh TUO_SERVER "cd /opt/busfinder && tar czf - data/sync.db" > sync-$(date +%F).tar.gz
```

---

## HTTPS non è un vezzo

`crypto.subtle` esiste solo in contesto sicuro. Su HTTP semplice il browser lo
toglie, e la sincronizzazione fra dispositivi si disattiva da sola mostrando
"Non disponibile su questa connessione". È il motivo per cui davanti all'app
c'è Caddy.

Il profilo `tls` avvia Caddy; senza profilo parte la sola app, che è come gira
questa macchina in LAN.

---

## In locale

```
docker compose up -d                                              # usa l'immagine già costruita
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build   # ricostruisce
docker compose logs -f app
```

Qui `PROBUS_BIND` è `0.0.0.0:3200` perché l'accesso dalla LAN è voluto. Sul
server è `127.0.0.1:3200`: dall'esterno si passa da Caddy, mai dritti sull'app.

---

## Se qualcosa va storto

**Il collaudo fallisce e il rollback riparte.** L'immagine vecchia torna su da
sola. Guarda cosa dice il collaudo: se si lamenta di `/api/vehicles` o
`/api/alerts` probabilmente è il feed di Roma a non rispondere, non il tuo
deploy.

**Il certificato non arriva.** `docker compose logs caddy`. Quasi sempre è il
DNS che non punta ancora qui, o la 80 chiusa dal firewall del provider.

**Rollback a mano**, se ti serve una versione specifica:

```
ssh TUO_SERVER "cd /opt/busfinder && sed -i 's|^PROBUS_TAG=.*|PROBUS_TAG=LA_VERSIONE|' .env && docker compose --profile tls up -d"
```

I tag sono `AAAAMMGG-hhmm-<impronta>`: l'impronta è dei sorgenti, quindi due
build identiche danno lo stesso hash e si riconoscono a colpo d'occhio.

---

## Una cosa che manca

Non c'è controllo di versione: questa cartella non è un repository git. Il
deploy non ne ha bisogno, ma senza git non esiste storia delle modifiche né un
modo di tornare indietro nel codice — solo alle immagini già pubblicate.
