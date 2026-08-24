/**
 * Italian dictionary. This file is the source of truth: `Dictionary` is derived
 * from it, so every other language must cover exactly these keys or the build
 * fails. Parameterised strings are plain functions, which keeps the arguments
 * type-checked instead of stringly-typed.
 *
 * Deliberately free of `as const`: literal types here would force every other
 * language to repeat the Italian words.
 */

import { counted, plural } from "./plural";

export const it = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, home",
  },

  a11y: {
    skipToContent: "Vai al contenuto",
  },

  common: {
    retry: "Riprova",
    cancel: "Annulla",
    save: "Salva",
    close: "Chiudi",
    home: "Home",
    back: "Indietro",
    all: "Tutte",
    loading: "Carico…",
    searching: "Cerco…",
    refresh: "Aggiorna",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Cancella la ricerca",
    searchInProgress: "Ricerca in corso",
  },

  nav: {
    primary: "Navigazione principale",
    sidebar: "Barra laterale",
    sidebarNav: "Navigazione laterale",
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
    sections: "Sezioni",
    shortcuts: "Scorciatoie",
    infoAria: "Informazioni sull'app",
    home: "Home",
    nearbyShort: "Vicino",
    nearby: "Fermate vicine",
    journey: "Percorso",
    alerts: "Avvisi",
    settings: "Impostazioni",
    info: "Info",
    hintNearby: "Cosa passa qui intorno",
    hintJourney: "Da un punto all'altro",
    hintAlerts: "Deviazioni e interruzioni",
    hintSettings: "Aggiornamento, tema, dati",
    hintInfo: "Fonti e note legali",
  },

  lines: {
    /** Lowercase, for a screen reader reading "autobus 64". */
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tram";
        case 1:
          return "metropolitana";
        case 2:
          return "treno";
        case 4:
          return "traghetto";
        default:
          return "autobus";
      }
    },
    /** Capitalised and short, for a line header. */
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tram";
        case 1:
          return "Metro";
        case 2:
          return "Treno";
        case 3:
          return "Bus";
        default:
          return "Linea";
      }
    },
    named: (name: string): string => `Linea ${name}`,
    namedAria: (name: string): string => `Linea ${name}`,
    details: "dettagli",
    towards: (headsign: string): string => `verso ${headsign}`,
    towardsCapital: (headsign: string): string => `Verso ${headsign}`,
    direction: "Direzione",
    terminus: "capolinea",
    noHeadsign: "Destinazione non indicata",
  },

  stops: {
    code: (code: string): string => `Fermata ${code}`,
    codeOnly: "Fermata",
    pole: (code: string): string => `Palina ${code}`,
    accessible: "Fermata accessibile",
    named: (name: string): string => `Fermata ${name}`,
    countLabel: (count: number): string => counted(count, "fermata", "fermate"),
    involved: (count: number): string =>
      `${count} ${plural(count, "fermata coinvolta", "fermate coinvolte")}`,
  },

  home: {
    kicker: "Roma · trasporto pubblico",
    title: "Quando passa?",
    intro:
      "Cerca una fermata dal numero o dal nome, oppure una linea. I passaggi arrivano dal feed in tempo reale di Roma.",
  },

  search: {
    inputAria: "Cerca una fermata o una linea",
    placeholder: "Fermata, via o linea",
    searchingFor: (query: string): string => `Cerco «${query}»…`,
    noResultsFor: (query: string): string => `Nessun risultato per «${query}»`,
    noResultsHint:
      "Prova con il numero della fermata (per esempio 70101), il nome della via oppure il numero della linea.",
    resultsList: "Risultati della ricerca",
    keyboardHint: "↑ ↓ per scorrere, Invio per aprire, Esc per chiudere",
  },

  favorites: {
    heading: "Preferiti",
    emptyTitle: "Ancora nessun preferito",
    emptyHint:
      "Tocca la stella ★ accanto a una fermata o a una linea: nella ricerca, in Fermate vicine, sulla pagina della fermata o su quella della linea. La ritrovi qui, senza cercarla ogni volta.",
    reorder: "Riordina",
    reorderDone: "Fine",
    reorderHint: "Sposta le fermate con le frecce. L'ordine vale su questo dispositivo.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: posizione ${position} di ${total}.`,
    moveUp: (name: string): string => `Sposta ${name} in alto`,
    moveDown: (name: string): string => `Sposta ${name} in basso`,
    addStar: (name: string): string => `Metti la stella alla fermata ${name}`,
    removeStar: (name: string): string => `Togli la stella alla fermata ${name}`,
    addStarLine: (name: string): string => `Metti la stella alla linea ${name}`,
    removeStarLine: (name: string): string => `Togli la stella alla linea ${name}`,
    starredTitle: "Con la stella: è nei preferiti",
    starTitle: "Metti la stella",
    starredLabel: "Con stella",
    starLabel: "Stella",
    editLabels: (name: string): string => `Modifica etichetta e linee di ${name}`,
    onlyLines: (labels: string): string => `solo ${labels}`,
    notUpdated: "non aggiornato",
    noArrivalsOnPinned: "Nessun passaggio sulle linee scelte.",
    changeLines: "Cambia linee",
    noArrivalsSoon: "Nessun passaggio nei prossimi minuti.",
    openForTimes: "Apri per gli orari",
    vehiclesUnavailable: "Mezzi non disponibili",
    lookingForVehicles: "Cerco i mezzi in servizio…",
    noVehiclesNow: "Nessun mezzo in servizio adesso",
    vehiclesInService: (count: number): string =>
      `${counted(count, "mezzo", "mezzi")} in servizio adesso`,
    refreshArrivals: "Aggiorna gli arrivi",
    undoRemovedStop: "Fermata senza stella: non è più tra i preferiti.",
    undoRemovedLine: "Linea senza stella: non è più tra i preferiti.",
    undoDismiss: "Chiudi l'avviso",
    more: (count: number): string => `Altri ${count} preferiti`,
    sidebarEmptyBefore: "Tocca la stella accanto a una fermata o a una linea, nella ricerca, in ",
    sidebarEmptyAfter: " o sulla pagina che stai guardando. La ritrovi qui.",
    nextDeparture: "prossimo passaggio",
    noDeparture: "nessun passaggio disponibile",
    notAvailableShort: "n/d",
  },

  recents: {
    heading: "Viste di recente",
    clear: "Svuota",
    emptyTitle: "Nessuna fermata recente",
    emptyHint:
      "Le fermate che apri restano qui per qualche giorno, così le ritrovi senza cercarle di nuovo.",
    listAria: "Fermate viste di recente",
    justNow: "poco fa",
    today: "oggi",
    yesterday: "ieri",
  },

  arrivals: {
    due: "in arrivo",
    live: "in tempo reale",
    scheduled: "da orario",
    scheduledTail: " programmato",
    scheduledSr: "orario previsto",
    onTime: "in orario",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "di ritardo",
    earlySuffix: "di anticipo",
    lateSr: (minutes: number): string => `${minutes} ${plural(minutes, "minuto", "minuti")} di ritardo`,
    earlySr: (minutes: number): string =>
      `${minutes} ${plural(minutes, "minuto", "minuti")} di anticipo`,
    skipped: "soppressa",
    skippedSr: "corsa soppressa",
    atClock: (clock: string): string => `alle ${clock}`,
    towardsSr: (headsign: string): string => `direzione ${headsign}`,
    loadingAria: "Caricamento arrivi",
    emptyTitle: "Nessun passaggio previsto",
    emptyHint:
      "Non risultano corse in avvicinamento. Prova con l'orario programmato o riprova tra poco.",
    frozenUnknown: "previsione non aggiornata",
    frozenFor: (minutes: number): string => `ferma da ${minutes} min`,
    frozenPrefix: (state: string): string => `previsione ${state}`,
    frozenSr: (state: string): string => `previsione ${state}, non aggiornata in tempo reale`,
    expectedSr: (relative: string, clock: string): string => `prevista ${relative}, alle ${clock}`,
    bannerNoRealtimeStrong: "Tempo reale non disponibile.",
    bannerNoRealtime:
      " Stiamo mostrando gli orari programmati: i mezzi possono passare in anticipo o in ritardo.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Tempo reale fermo." : `Tempo reale fermo da ${minutes} min.`,
    bannerFrozenBefore: " Le previsioni qui sotto sono quelle",
    bannerFrozenLastUpdate: " dell'ultimo aggiornamento",
    bannerFrozenAt: (clock: string): string => ` delle ${clock}`,
    bannerFrozenAfter: " e non si stanno aggiornando: prendile con cautela.",
    bannerPartialStrong: "Tempo reale parziale.",
    bannerPartial: " Una parte dei dati non è arrivata: alcune corse possono mancare.",
    showOnMap: (line: string): string => `Mostra sulla mappa il mezzo della linea ${line}`,
    hideOnMap: (line: string): string => `Togli l'evidenza dal mezzo della linea ${line}`,
  },

  dataAge: {
    prefix: "Aggiornato",
    now: "adesso",
    secondsAgo: (seconds: number): string => `${seconds} s fa`,
    minutesAgo: (minutes: number): string => `${minutes} min fa`,
    atClock: (clock: string): string => `alle ${clock}`,
    never: "mai",
  },

  refreshFeedback: {
    updated: "Aggiornato",
    unchanged: "Controllato, nessun aggiornamento nuovo",
    failed: "Aggiornamento non riuscito",
    updatedShort: "Aggiornato",
    unchangedShort: "Nessun aggiornamento",
    failedShort: "Non aggiornato",
    busy: "Aggiornamento in corso…",
    busySpoken: "Aggiornamento in corso",
  },

  stop: {
    tabArrivals: "In arrivo",
    tabTimetable: "Orari",
    tabsAria: "Vista della fermata",
    editTag: "Modifica etichetta",
    addTag: "Etichetta",
    map: "Mappa",
    realtimePrefix: "Tempo reale",
    noRealtime: "Nessun dato in tempo reale",
    pageNotUpdated: "Pagina non ancora aggiornata",
    pageUpdatedAt: (clock: string): string => `Pagina aggiornata alle ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Stai vedendo l'ultimo dato ricevuto.`,
    arrivalsUnavailable: "Arrivi non disponibili",
    emptyHint:
      "Nessuna corsa in avvicinamento adesso. Apri gli orari per sapere quando è previsto il prossimo passaggio.",
    seeTimetable: "Vedi gli orari",
    linesHere: "Linee che fermano qui",
  },

  tagDialog: {
    titleFavorite: "Preferito",
    titleTag: "Etichetta fermata",
    label: "Come la chiami tu",
    placeholder: "Casa, ufficio, palestra…",
    hint: (maxChars: number): string =>
      `Serve solo a te: resta su questo dispositivo, massimo ${maxChars} caratteri.`,
    linesLegend: "Linee da mostrare",
    linesNone: "Nessuna scelta: la scheda mostra tutte le linee.",
    linesSome: (count: number): string =>
      `Solo ${counted(count, "linea", "linee")} sulla scheda.`,
    showAllLines: "Mostra tutte le linee",
    removeTag: "Rimuovi etichetta",
  },

  timetable: {
    previousDay: "Giorno precedente",
    nextDay: "Giorno successivo",
    today: "oggi",
    scheduled: "orario programmato",
    jumpToNow: "Vai a adesso",
    backToToday: "Torna a oggi",
    fromServiceStart: "Dall'inizio del servizio",
    unavailableTitle: "Orario non disponibile",
    partialError: (error: string): string => `${error}. Stai vedendo le corse già caricate.`,
    emptyTitle: "Nessuna corsa da qui in avanti",
    emptyFromNow:
      "Da quest'ora non risultano altri passaggi. Prova dall'inizio del servizio, un altro giorno, oppure togli il filtro sulla linea.",
    emptyWholeDay:
      "In questo giorno non è programmato alcun passaggio: prova il giorno prima o quello dopo, oppure togli il filtro sulla linea.",
    loadMore: "Mostra altre corse",
    loadingMore: "Carico…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${counted(count, "corsa", "corse")} dalle ${from} alle ${to}` +
      (complete ? ", fino a fine servizio" : "") +
      ". Sono gli orari ufficiali del giorno di servizio, senza tempo reale.",
  },

  map: {
    fallbackAria: "Mappa",
    vehiclesHeading: "Mezzi sulla mappa",
    show: "Mostra",
    hide: "Nascondi",
    modeGroup: "Quali mezzi mostrare",
    modeApproaching: "In arrivo qui",
    modeAllLines: "Tutte le linee",
    loadingStop: "Carico la posizione della fermata…",
    stopMapAria: (stopName: string): string => `Mappa dei mezzi alla fermata ${stopName}`,
    centreOnStop: "Centra sulla fermata",
    nearbyVehicles: "Mezzi qui vicino",
    allVehicles: "Tutti, anche i lontani",
    loadingVehicles: "Carico i mezzi…",
    noneApproaching: "Nessun mezzo in avvicinamento",
    approachingCount: (count: number): string =>
      `${count} ${plural(count, "mezzo in arrivo", "mezzi in arrivo")}`,
    onTheseLines: (count: number): string =>
      `${counted(count, "mezzo", "mezzi")} sulle linee di questa fermata`,
    positionsAt: (clock: string): string => `posizioni delle ${clock}`,
    positionsStale: "posizioni non aggiornate",
    allLinesNote:
      "I mezzi pieni sono diretti a questa fermata, quelli sbiaditi sono in circolazione sulle stesse linee ma non passano di qui adesso.",
    approachingList: "Mezzi in arrivo",
    hereIn: (relative: string): string => `Qui ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Qui ${relative}, alle ${clock}`,
    notInbound: "In circolazione su questa linea, non diretto a questa fermata",
    noBearing: " · direzione non trasmessa",
    follow: "Sono su questo mezzo, seguilo",
    unfollow: "Smetti di seguire",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Linea ${line}, qui ${relative}${followed ? ", lo stai seguendo" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Linea ${line}, in circolazione, non diretta a questa fermata${followed ? ", lo stai seguendo" : ""}`,
    yourPosition: "La tua posizione",
    vehicleTitle: (vehicleId: string): string => `Mezzo ${vehicleId}`,
    showOnMap: (stopName: string): string => `Mostra ${stopName} sulla mappa`,
    divertedSuffix: " · fuori percorso",
    divertedBadge: "Fuori percorso",
    divertedNote: "Sta seguendo un tragitto diverso dal previsto.",
  },

  follow: {
    headlineLive: "Sto seguendo questo mezzo",
    headlinePaused: "Segui in pausa",
    headlineStale: "Posizione ferma",
    headlineLost: "Mezzo non più in linea",
    detailLive: "La mappa resta centrata su di lui a ogni aggiornamento.",
    detailPaused:
      "Hai spostato la mappa, quindi non la muovo più io. Tocca Riprendi per tornare sul mezzo.",
    detailStaleUnknown: "Il mezzo non trasmette la sua posizione da un po'.",
    detailStale: (age: string): string =>
      `Il mezzo non trasmette da ${age}: quello sulla mappa è l'ultimo punto noto.`,
    detailLost:
      "Non ricevo più la sua posizione. Può aver finito la corsa o essere uscito dal servizio.",
    ageMinutes: (minutes: number): string => `${minutes} ${plural(minutes, "minuto", "minuti")}`,
    ageHours: (hours: number): string => (hours === 1 ? "un'ora" : `${hours} ore`),
    compact: "Sto seguendo",
    compactSr: (line: string): string => ` la linea ${line}`,
    lineSr: (line: string): string => `, linea ${line}`,
    resume: "Riprendi",
    exit: "Esci",
    close: "Chiudi",
    lostHint: "Se è ancora in giro lo trovi passando a «Tutte le linee».",
  },

  nearby: {
    title: "Fermate vicine",
    mapAria: "Mappa delle fermate vicine",
    searchHere: "Cerca in questa zona",
    radius: "Raggio",
    locating: "Localizzo…",
    myPosition: "La mia posizione",
    geoDenied:
      "Permesso di localizzazione negato. Mostriamo il centro di Roma: sposta la mappa e cerca in quella zona.",
    geoUnavailable:
      "Posizione non disponibile in questo momento. Mostriamo il centro di Roma: sposta la mappa e cerca in quella zona.",
    geoTimeout:
      "La localizzazione ha impiegato troppo tempo. Mostriamo il centro di Roma: sposta la mappa e riprova.",
    geoUnsupported:
      "Questo browser non supporta la geolocalizzazione. Sposta la mappa per cercare le fermate.",
    outsideRome: "Sei fuori dall'area di Roma: mostriamo il centro città.",
    outsideCoverage: "Questa zona è fuori dall'area coperta. Sposta la mappa su Roma.",
    focusStopMissing: "Fermata richiesta non trovata: mostriamo la tua zona.",
    focusStopFailed: (error: string): string => `Fermata richiesta non caricata (${error}).`,
    stopsFailed: (error: string): string => `Fermate non caricate: ${error}`,
    loadingStops: "Cerco le fermate…",
    noStopsInRadius: (radius: string): string =>
      `Nessuna fermata entro ${radius}. Prova ad allargare il raggio o a spostare la mappa.`,
    onMapCap: (max: number): string => ` (le prime ${max} sulla mappa)`,
    noLines: "Nessuna linea",
    arrivalsLink: "Arrivi",
    showMoreStops: "Mostra altre fermate",
  },

  line: {
    loading: "Carico la linea…",
    loadFailed: (error: string): string => `Linea non caricata: ${error}`,
    mapAria: (name: string): string => `Mappa della linea ${name}`,
    dataAt: (clock: string): string => `dati delle ${clock}`,
    updatedAt: (clock: string): string => `aggiornato alle ${clock}`,
    vehiclesStale: (error: string): string => `Mezzi non aggiornati: ${error}`,
    noPathForDirection: "Percorso non disponibile per questa direzione",
    stopsHeading: (count: number): string => `Fermate (${count})`,
    noStopsForDirection: "Nessuna fermata disponibile per questa direzione.",
    showAllStops: "Mostra tutte le fermate",
  },

  lineService: {
    inService: (count: number): string => `${counted(count, "mezzo", "mezzi")} in linea`,
    loadingVehicles: "Carico i mezzi…",
    checkingTimetable: "Controllo gli orari…",
    feedDownTitle: "Posizioni in tempo reale non disponibili",
    feedDownDetail:
      "Il servizio può essere regolare: non riusciamo a leggere la posizione dei mezzi.",
    noneReporting: "Nessun mezzo segnala la posizione",
    unknownDetail:
      "Non vuol dire che la linea non è in servizio: gli orari programmati sono nella pagina di una fermata.",
    scheduledDetail: (count: number): string =>
      `Il servizio è programmato: ${count} ${plural(count, "corsa prevista", "corse previste")} da qui a fine giornata.`,
    finishedTitle: "Servizio terminato per oggi",
    finishedDetail: (count: number, clock: string): string =>
      `Oggi ${counted(count, "corsa programmata", "corse programmate")}, l'ultima alle ${clock}.`,
    noneTodayTitle: "Nessuna corsa programmata oggi",
    noneTodayDetail: "Su questa linea non risultano corse in orario per la giornata di oggi.",
    noneTodayFrom: (stopName: string): string =>
      `Da ${stopName} non risultano corse in orario per la giornata di oggi.`,
    nextDepartures: "Prossime partenze",
    nextDeparturesFrom: (stopName: string): string => ` da ${stopName}`,
    scheduledOnly: "Orari programmati, senza tempo reale.",
  },

  journey: {
    title: "Percorso",
    subtitle: "Da un punto all'altro di Roma con bus, tram e metro.",
    from: "Partenza",
    to: "Arrivo",
    placeholder: "Fermata, indirizzo o luogo",
    swap: "Inverti",
    whenLegend: "Quando",
    now: "Adesso",
    pickTime: "Scegli l'ora",
    timeLabel: "Data e ora di partenza",
    submit: "Cerca il percorso",
    resultsHeading: "Itinerari",
    emptyTitle: "Dove vuoi andare?",
    emptyHint:
      "Scrivi una partenza e un arrivo: cerchiamo il percorso migliore sugli orari ufficiali.",
    searching: "Cerco gli itinerari…",
    noResultsTitle: "Nessun itinerario",
    noResultsHint:
      "Cerchiamo solo collegamenti diretti o con un cambio. Prova a spostare la partenza o l'orario.",
    disclaimer:
      "Orari programmati, non in tempo reale: i ritardi effettivi non sono considerati. I tratti a piedi sono stimati in linea d'aria, quindi la distanza reale sulla strada è maggiore.",
    searchedFrom: (when: string): string => ` Ricerca dalle ${when}.`,
    mapAria: "Mappa dell'itinerario selezionato",
    mapCaption:
      "I tratti in vettura seguono il percorso reale della linea. Quelli tratteggiati sono stimati in linea d'aria: i trasferimenti a piedi e le rare linee senza tracciato.",
    missingEndpoints: "Indica sia la partenza sia l'arrivo.",
    badDateTime: "Data e ora non valide.",
    geoUnsupported: "Questo browser non supporta la geolocalizzazione.",
    geoUnavailable: "Posizione non disponibile in questo momento.",
    geoOutsideRome: "Sei fuori dall'area di Roma: scrivi un indirizzo.",
    geoDenied: "Permesso di localizzazione negato: scrivi un indirizzo.",
    geoTimeout: "La localizzazione ha impiegato troppo tempo.",
    originMarker: (name: string): string => `Partenza: ${name}`,
    destinationMarker: (name: string): string => `Arrivo: ${name}`,
    useMyPosition: "Usa la mia posizione",
    clearField: (label: string): string => `Svuota ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Suggerimenti per ${label.toLowerCase()}`,
    placeStop: "Fermata",
    placeCoord: "Coordinate",
    placeAddress: "Indirizzo",
    walkOnly: "Solo a piedi",
    walkOnlyShort: "a piedi",
    noTransfers: "senza cambi",
    transfers: (count: number): string => `${counted(count, "cambio", "cambi")}`,
    walkDistance: (distance: string): string => `${distance} a piedi`,
    walkLeg: (distance: string, duration: string): string =>
      `A piedi ${distance}, circa ${duration} fino a `,
    inService: "in servizio",
    stopCount: (count: number): string => counted(count, "fermata", "fermate"),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Itinerario ${index}: partenza ${departure}, arrivo ${arrival}`,
    lineDetailsAria: (line: string): string => `Linea ${line}, dettagli`,
    hours: (hours: number): string => `${hours} h`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} h ${minutes}`,
    /** journey.ts gira sul server e non conosce la lingua: manda uno slug. */
    noticeNoOriginStops:
      "Nessuna fermata a piedi dal punto di partenza: prova un indirizzo più vicino a una linea.",
    noticeNoDestinationStops:
      "Nessuna fermata a piedi dal punto di arrivo: prova un indirizzo più vicino a una linea.",
    noticeNoConnection: "Nessun collegamento trovato fra queste due zone nelle prossime ore.",
    noticeWalkOnlyLeft:
      "Nessun collegamento in orario nelle prossime ore: resta solo il percorso a piedi.",
    noticeLaterDepartures:
      "Nessuna corsa nell'ora e mezza successiva: mostriamo le prime disponibili dopo.",
  },

  alerts: {
    title: "Avvisi di servizio",
    subtitle: "Deviazioni, sospensioni e modifiche pubblicate sul feed ufficiale.",
    loading: "Caricamento…",
    degraded:
      "Il feed in tempo reale non risponde o è vecchio: questi avvisi potrebbero non essere aggiornati.",
    loadFailed: "Impossibile caricare gli avvisi.",
    refreshFailed: (error: string): string =>
      `Ultimo aggiornamento non riuscito (${error}): stai vedendo la lista precedente.`,
    searchPlaceholder: "Cerca: sciopero, deviazione, via…",
    searchAria: "Cerca fra gli avvisi",
    filterByLine: "Filtra per linea",
    allLines: (count: number): string => `Tutte le linee (${count})`,
    networkWide: "Avvisi generali",
    clearFilters: "Azzera",
    noMatch: "Nessun avviso corrisponde ai filtri.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${plural(shown, "avviso", "avvisi")} su ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${plural(count, "avviso attivo", "avvisi attivi")} su ${lines} linee.`,
    goToLine: "Vai alla linea",
    noneTitle: "Nessun avviso attivo",
    noneHint:
      "Al momento il feed non segnala interruzioni o modifiche al servizio. Ricontrolla prima di partire.",
    noResultsTitle: "Nessun risultato",
    noResultsHint: "Prova con meno parole, oppure azzera i filtri per rivedere tutti gli avvisi.",
    noSelectionTitle: "Nessun avviso selezionato",
    noSelectionHint: "Scegli un avviso dalla lista qui a sinistra per leggerlo per intero.",
    showMoreLines: (count: number): string => `Mostra altre linee (${count})`,
    goToLineShort: "vai alla linea",
    fallbackHeader: "Avviso di servizio",
    noDetail: "Nessun dettaglio pubblicato dall'operatore.",
    operatorLink: "Dettagli sul sito dell'operatore",
    affectedLines: "Linee coinvolte",
    alsoOn: "Anche su",
    contextHeading: (count: number): string =>
      `${count} ${plural(count, "avviso attivo", "avvisi attivi")}`,
    contextAria: "Avvisi di servizio",
    contextAll: "Tutti",
    contextUnavailable: (error: string): string => `Avvisi non disponibili: ${error}`,
    contextMore: (count: number): string => `Altri ${count} avvisi sulla `,
    contextMoreLink: "pagina degli avvisi",
    contextStale: (error: string): string =>
      `Ultimo aggiornamento non riuscito (${error}): questi avvisi potrebbero non essere attuali.`,
    windowBetween: (from: string, until: string): string => `Dal ${from} al ${until}`,
    windowFrom: (from: string): string => `Dal ${from}, senza scadenza indicata`,
    windowUntil: (until: string): string => `Fino al ${until}`,
    windowUnknown: "Periodo di validità non indicato",
    effect: (code: string): string | null => EFFECT_IT[code] ?? null,
    cause: (code: string): string | null => CAUSE_IT[code] ?? null,
  },

  settings: {
    title: "Impostazioni",
    subtitle: "Tutto resta su questo dispositivo. Nessun account, nessun server.",
    sectionArrivals: "Arrivi",
    autoRefresh: "Aggiornamento automatico",
    everySeconds: (seconds: number): string => `ogni ${seconds} secondi`,
    autoRefreshHint: "Intervallo fra due letture del feed in tempo reale.",
    maxArrivals: "Arrivi mostrati per fermata",
    showScheduled: "Mostra gli orari programmati",
    showScheduledHint:
      "Quando il tempo reale non ha nulla per una fermata, usa il timetable.",
    sectionNearby: "Vicino a me",
    radius: "Raggio di ricerca",
    radiusHint: "Vale anche per i raggi rapidi sulla mappa delle fermate vicine.",
    sectionAppearance: "Aspetto",
    themeLegend: "Tema",
    themeSystem: "Sistema",
    themeLight: "Chiaro",
    themeDark: "Scuro",
    sectionLanguage: "Lingua",
    languageLegend: "Lingua dell'interfaccia",
    languageSystem: "Sistema",
    languageHint: (resolved: string): string =>
      `Con «Sistema» seguiamo la lingua del browser: ora è ${resolved}.`,
    sectionBackup: "Backup dei preferiti",
    backupIntro:
      "Un file JSON sul tuo dispositivo: è il modo per spostare i preferiti su un altro browser, visto che qui non c'è nessun account.",
    exportCount: (count: number): string => `Esporta (${count})`,
    importFromFile: "Importa da file",
    exported: (count: number): string => `Esportati ${count} preferiti.`,
    exportFailed: "Esportazione non riuscita su questo browser.",
    fileTooLarge: "Il file è troppo grande per essere un backup dei preferiti.",
    fileUnreadable: "Impossibile leggere il file.",
    importEmpty: "Il file è vuoto.",
    importNotJson: "Il file non è un JSON valido.",
    importNoList: "Il file non contiene un elenco di preferiti.",
    importNoneValid: "Nessun preferito valido trovato nel file.",
    importFound: (count: number): string => `Trovati ${count} preferiti validi`,
    importSkipped: (count: number): string => `, ${count} voci scartate.`,
    importFoundEnd: ".",
    importMerge: "Unisci",
    importReplace: "Sostituisci",
    replaced: (count: number): string => `Preferiti sostituiti: ora sono ${count}.`,
    mergedNone: "Nessun preferito nuovo da aggiungere.",
    merged: (count: number): string => `Aggiunti ${count} preferiti.`,
    sectionLocalData: "Dati locali",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} preferiti, ${recents} fermate nella cronologia.`,
    confirmClearFavorites: "Cancellare tutti i preferiti? L'operazione non è reversibile.",
    confirmClearFavoritesYes: "Sì, svuota",
    clearFavorites: "Svuota preferiti",
    favoritesCleared: "Preferiti svuotati.",
    confirmClearRecents: "Cancellare la cronologia delle fermate viste?",
    confirmClearRecentsYes: "Sì, cancella",
    clearRecents: "Cancella cronologia",
    recentsCleared: "Cronologia cancellata.",
    resetDefaults: "Ripristina impostazioni predefinite",
    settingsReset: "Impostazioni riportate ai valori predefiniti.",
    infoLink: "Informazioni, fonti dei dati e domande frequenti",
  },

  sync: {
    titleFull: "Sincronizza dispositivi",
    titleCollapsed: "Sincronizzazione",
    badgeOn: "attiva",
    summaryLoading: "…",
    summaryUnavailable: "Non disponibile su questa connessione",
    summaryOff: "Non attiva",
    summarySyncing: "Sincronizzazione in corso…",
    summaryError: "Errore di sincronizzazione",
    summaryConflict: "Conflitto da risolvere",
    summaryOn: (last: string): string => `Attiva · ultima ${last}`,
    intro:
      "Porta preferiti, recenti e impostazioni su un altro dispositivo con un codice. I dati vengono cifrati qui: il server conserva solo dati illeggibili.",
    enable: "Attiva sincronizzazione",
    haveCode: "Ho già un codice",
    codeLabel: "Codice di sincronizzazione",
    codeHint:
      "20 caratteri, come li leggi sull'altro dispositivo. Maiuscole, trattini e spazi non contano.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} caratteri`,
    join: "Collega",
    onIntro:
      "I dati sono cifrati su questo dispositivo prima di partire. Chi ha il codice può leggere tutti i tuoi preferiti: usalo solo sui dispositivi tuoi.",
    code: "Codice",
    showCode: "Mostra codice",
    hideCode: "Nascondi codice",
    copyCode: "Copia codice",
    copied: "Copiato",
    lastSync: "Ultima sincronizzazione:",
    inProgress: " · in corso…",
    syncNow: "Sincronizza ora",
    disconnect: "Disconnetti",
    disconnectNote:
      "Disconnettendo, i dati restano su questo dispositivo e la copia cifrata resta sul server finché non la elimini.",
    deleteWarning:
      "Elimina la copia cifrata dal server. Gli altri dispositivi non troveranno più niente da sincronizzare. Non si può annullare.",
    deleteConfirm: "Elimina davvero",
    deleteRemote: "Elimina i dati dal server",
    justNow: "adesso",
    minutesAgo: (minutes: number): string => `${minutes} min fa`,
    atClock: (clock: string): string => `alle ${clock}`,
    /** Resolved at throw time, not at import time, or the language freezes. */
    errors: {
      aborted: "Operazione annullata.",
      generic: "Sincronizzazione non riuscita. Riprova tra qualche istante.",
      insecureContext:
        "La sincronizzazione richiede una connessione sicura: apri il sito in https (oppure su localhost). Su http i browser disattivano la crittografia e i dati non possono essere cifrati su questo dispositivo.",
      noBase64Encode: "Questo browser non supporta la codifica dei dati di sincronizzazione.",
      noBase64Decode: "Questo browser non supporta la decodifica dei dati di sincronizzazione.",
      invalidSyncData: (what: string): string => `Dati di sincronizzazione non validi (${what}).`,
      codeRequired: "Inserisci il codice di sincronizzazione.",
      codeTooLong: (max: number): string => `Il codice è troppo lungo: sono ${max} caratteri.`,
      codeInvalidChars: (chars: string): string =>
        `Il codice contiene caratteri non validi: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Il codice deve avere ${required} caratteri, ne hai inseriti ${actual}.`,
      keyDerivationFailed: "Questo browser non riesce a derivare le chiavi di sincronizzazione.",
      preparePayloadFailed: "Impossibile preparare i dati da sincronizzare.",
      encryptFailed: "Non è stato possibile cifrare i dati su questo dispositivo.",
      decryptFailed:
        "Il codice non corrisponde a questi dati, oppure i dati sul server sono danneggiati.",
      invalidSyncId: "Identificativo di sincronizzazione non valido.",
      responseTooLarge: "Il server ha risposto con troppi dati.",
      timeout: "Il server non ha risposto in tempo.",
      unreachable: "Server non raggiungibile. Controlla la connessione.",
      invalidResponse: "Risposta del server non valida.",
      invalidResponseField: (what: string): string => `Risposta del server non valida (${what}).`,
      unexpectedFormat: "Il server ha risposto in un formato inatteso.",
      rateLimited: "Troppe sincronizzazioni ravvicinate. Riprova tra un minuto.",
      pullRejected: (status: number): string =>
        `Il server ha rifiutato la lettura (errore ${status}).`,
      payloadTooLarge: "I dati sono troppi per essere sincronizzati.",
      pushRejected: (status: number): string =>
        `Il server ha rifiutato il salvataggio (errore ${status}).`,
      deleteRejected: (status: number): string =>
        `Il server ha rifiutato la cancellazione (errore ${status}).`,
      conflict:
        "Un altro dispositivo sta scrivendo negli stessi dati in questo momento. I dati locali sono al sicuro: riprova fra qualche secondo.",
    },
    status: {
      deleted: "Dati rimossi dal server. Questo dispositivo non è più sincronizzato.",
      disconnected:
        "Sincronizzazione disattivata su questo dispositivo. I preferiti restano qui e la copia cifrata resta sul server finché non la elimini.",
    },
  },

  info: {
    title: "Informazioni",
    subtitle: "Orari e arrivi del trasporto pubblico di Roma, dai dati aperti ufficiali.",
    unofficialTitle: "App non ufficiale",
    unofficialBody:
      "Questo sito non è affiliato, associato, autorizzato o sostenuto in alcun modo da ATAC S.p.A., da Roma Servizi per la Mobilità o da Roma Capitale. È un progetto indipendente che si limita a leggere i dati aperti che questi enti pubblicano. Per informazioni ufficiali, biglietti e reclami rivolgiti ai loro canali.",
    whatTitle: "Cos'è",
    whatBody1:
      "Un'app web per sapere fra quanto passa il prossimo mezzo alla fermata dove sei. Cerchi una fermata o una linea, la salvi fra i preferiti e la ritrovi in home con gli arrivi aggiornati. Niente account, niente pubblicità, niente statistiche di utilizzo.",
    whatBody2:
      "Quando il feed in tempo reale copre la corsa, l'orario mostrato è una previsione basata sulla posizione del mezzo. Altrimenti l'app ripiega sull'orario programmato e te lo dice sempre, invece di far passare per previsione un dato vecchio.",
    dataTitle: "Da dove arrivano i dati",
    dataBodyBefore:
      "Orari, fermate, linee, percorsi, posizioni dei mezzi e avvisi di servizio provengono dai dati aperti di ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (feed GTFS e GTFS-Realtime). Gli orari programmati vengono aggiornati ogni giorno, il tempo reale ogni 30 secondi circa.",
    dataLink: "romamobilita.it — Open data",
    dataLicence:
      "I dati restano di proprietà dei rispettivi titolari e sono usati alle condizioni della licenza con cui vengono pubblicati.",
    privacyTitle: "Privacy",
    privacyBody:
      "Non c'è login e non c'è nessun profilo utente. Preferiti, fermate viste di recente e impostazioni sono salvati solo nel tuo browser e non vengono inviati da nessuna parte. La posizione, se la concedi per la ricerca delle fermate vicine, resta nel dispositivo: viene usata per calcolare le distanze e non viene memorizzata.",
    faqTitle: "Domande frequenti",
    faq1Q: "Perché una linea o un autobus non compare?",
    faq1A:
      "Mostriamo solo quello che c'è nei feed ufficiali. Se un mezzo non trasmette la posizione, o se la sua corsa non è nel feed in tempo reale, per noi non esiste: al massimo vedrai l'orario programmato. Capita spesso con le corse sostitutive, i bus navetta e i mezzi con il localizzatore guasto.",
    faq2Q: "Perché gli orari sono diversi da quelli scritti alla fermata?",
    faq2A:
      'Il cartello alla palina riporta l\'orario programmato, che cambia poche volte l\'anno. Qui, quando il mezzo trasmette, vedi la previsione calcolata sulla sua posizione reale, che tiene conto di traffico e ritardi. Quando invece leggi "programmato", la previsione non c\'è e stiamo mostrando lo stesso orario del cartello.',
    faq3Q: "Cosa succede di notte?",
    faq3A:
      "Di notte il feed in tempo reale è quasi vuoto, perché circolano pochi mezzi. L'app continua a funzionare con gli orari programmati delle linee notturne. Nel GTFS la giornata di servizio non finisce a mezzanotte ma alle 04:00: una corsa dell'una di notte appartiene ancora al giorno prima, ed è per questo che puoi vedere orari come 25:30 tradotti in 01:30.",
    faq4Q: "I miei preferiti finiscono su un server?",
    faq4A:
      "No. Preferiti, cronologia e impostazioni stanno nel localStorage del browser. Se svuoti i dati del sito o cambi dispositivo, spariscono: dalle impostazioni puoi esportarli in un file JSON e reimportarli altrove.",
    settingsLink: "Vai alle impostazioni",
  },

  footer: {
    dataPrefix: "Dati di servizio e orari: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (open data GTFS).",
    independent:
      "Progetto indipendente, non affiliato ad ATAC o Roma Servizi per la Mobilità. ",
    infoLink: "Informazioni",
  },

  errors: {
    genericTitle: "Qualcosa non ha funzionato",
    unexpected: "Errore imprevisto",
    unexpectedDot: "Errore imprevisto.",
    stopNotFound: "Fermata non trovata",
    serviceDown: "Il servizio non risponde",
    requestFailed: (status: number): string => `Richiesta non riuscita (${status})`,
    httpStatus: (status: number): string => `Errore ${status}`,
    badResponse: "Risposta del server non valida",
    badResponseDot: "Risposta del server non valida.",
    timedOut: "Richiesta scaduta",
    timedOutDot: "Richiesta scaduta.",
    offline: "Connessione assente",
    connectionFailed: "Connessione non riuscita.",
    tooManyRequests: "Troppe richieste",
    badRequest: "Parametri non validi",
    lineNotFound: "Linea non trovata",
    journeyOriginNotFound: "Partenza non trovata",
    journeyDestinationNotFound: "Arrivo non trovato",
    journeyPlaceHint: "Prova con un indirizzo più preciso.",
  },

  notFound: {
    kicker: "Errore 404",
    title: "Fermata non servita",
    body:
      "Questa pagina non esiste. Può capitare con un vecchio link, oppure con il codice di una fermata o di una linea che non è più nel feed.",
    searchCta: "Cerca una fermata",
    nearbyCta: "Fermate vicine",
  },

  appError: {
    title: "Corsa interrotta",
    body:
      "Questa schermata non è riuscita a caricarsi. Riprova: se il problema resta, probabilmente è il servizio dati a non rispondere.",
    digest: (digest: string): string => `Codice: ${digest}`,
    backHome: "Torna alla home",
    globalTitle: "Servizio sospeso",
    globalBody:
      "L'applicazione si è fermata per un errore imprevisto. Ricarica la pagina: i tuoi preferiti restano salvati sul telefono e non vanno persi.",
    reload: "Ricarica",
  },

  format: {
    due: "in arrivo",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "data non disponibile",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "aggiornamento sconosciuto",
    ageSeconds: (seconds: number): string => `aggiornato ${seconds} s fa`,
    ageMinutes: (minutes: number): string => `aggiornato ${minutes} min fa`,
    ageAt: (clock: string): string => `aggiornato alle ${clock}`,
    onTime: "in orario",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  /**
   * Document title and meta description, rewritten client-side once the saved
   * language is known. Page titles reuse the labels already defined above.
   */
  meta: {
    appTitle: "BusFinder — partenze in tempo reale",
    appDescription:
      "Orari e passaggi in tempo reale di bus, tram e metro a Roma. Preferiti, fermate vicine e avvisi di servizio, senza account e senza pubblicità.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "Le fermate ATAC più vicine a te, con mappa e linee che ci passano.",
    journeyDescription:
      "Calcola il percorso da un punto all'altro di Roma con bus, tram e metro, sugli orari ufficiali ATAC.",
    alertsDescription:
      "Deviazioni, sospensioni e modifiche al servizio pubblicate sul feed ufficiale.",
    settingsDescription: "Aggiornamento arrivi, raggio di ricerca, tema e gestione dei preferiti.",
    infoDescription:
      "Cos'è questa app, da dove arrivano i dati e perché non è affiliata ad ATAC o a Roma Servizi per la Mobilità.",
    stopDescription: "Prossimi passaggi in tempo reale e orario programmato della fermata.",
    lineDescription: "Percorso, fermate e mezzi in tempo reale della linea.",
  },

  skeleton: {
    loading: "Caricamento",
  },
};

const EFFECT_IT: Record<string, string | undefined> = {
  NO_SERVICE: "Servizio sospeso",
  REDUCED_SERVICE: "Servizio ridotto",
  SIGNIFICANT_DELAYS: "Ritardi significativi",
  DETOUR: "Deviazione",
  ADDITIONAL_SERVICE: "Servizio aggiuntivo",
  MODIFIED_SERVICE: "Servizio modificato",
  STOP_MOVED: "Fermata spostata",
  NO_EFFECT: "Nessun effetto sul servizio",
  ACCESSIBILITY_ISSUE: "Problema di accessibilità",
  OTHER_EFFECT: "Altro",
  UNKNOWN_EFFECT: "Effetto non specificato",
};

const CAUSE_IT: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Guasto tecnico",
  STRIKE: "Sciopero",
  DEMONSTRATION: "Manifestazione",
  ACCIDENT: "Incidente",
  HOLIDAY: "Festività",
  WEATHER: "Maltempo",
  MAINTENANCE: "Manutenzione",
  CONSTRUCTION: "Lavori",
  POLICE_ACTIVITY: "Intervento delle forze dell'ordine",
  MEDICAL_EMERGENCY: "Emergenza sanitaria",
  OTHER_CAUSE: "Altra causa",
  UNKNOWN_CAUSE: "Causa non specificata",
};

/**
 * The shape every language must satisfy. Derived from Italian, so adding a key
 * here is a compile error in every other dictionary until it is translated.
 */
export type Dictionary = typeof it;
