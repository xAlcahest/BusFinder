/** Dutch dictionary. Shape and key order follow it.ts, the source of truth. */

import type { Dictionary } from "./it";
import { counted, plural } from "./plural";

export const nl: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, start",
  },

  a11y: {
    skipToContent: "Naar de inhoud",
  },

  common: {
    retry: "Opnieuw proberen",
    cancel: "Annuleren",
    save: "Opslaan",
    close: "Sluiten",
    home: "Start",
    back: "Terug",
    all: "Alle",
    loading: "Laden…",
    searching: "Zoeken…",
    refresh: "Vernieuwen",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Zoekopdracht wissen",
    searchInProgress: "Bezig met zoeken",
  },

  nav: {
    primary: "Hoofdnavigatie",
    sidebar: "Zijbalk",
    sidebarNav: "Navigatie in de zijbalk",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten",
    sections: "Onderdelen",
    shortcuts: "Snelkoppelingen",
    infoAria: "Informatie over de app",
    home: "Start",
    nearbyShort: "Dichtbij",
    nearby: "Haltes in de buurt",
    journey: "Route",
    alerts: "Meldingen",
    settings: "Instellingen",
    info: "Info",
    hintNearby: "Wat hier in de buurt rijdt",
    hintJourney: "Van punt naar punt",
    hintAlerts: "Omleidingen en storingen",
    hintSettings: "Vernieuwen, thema, gegevens",
    hintInfo: "Bronnen en juridische informatie",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tram";
        case 1:
          return "metro";
        case 2:
          return "trein";
        case 4:
          return "veerboot";
        default:
          return "bus";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tram";
        case 1:
          return "Metro";
        case 2:
          return "Trein";
        case 3:
          return "Bus";
        default:
          return "Lijn";
      }
    },
    named: (name: string): string => `Lijn ${name}`,
    namedAria: (name: string): string => `Lijn ${name}`,
    details: "details",
    towards: (headsign: string): string => `richting ${headsign}`,
    towardsCapital: (headsign: string): string => `Richting ${headsign}`,
    direction: "Richting",
    terminus: "eindhalte",
    noHeadsign: "Bestemming niet vermeld",
  },

  stops: {
    code: (code: string): string => `Halte ${code}`,
    codeOnly: "Halte",
    pole: (code: string): string => `Paal ${code}`,
    accessible: "Toegankelijke halte",
    named: (name: string): string => `Halte ${name}`,
    countLabel: (count: number): string => counted(count, "halte", "haltes"),
    involved: (count: number): string =>
      `${count} ${plural(count, "betrokken halte", "betrokken haltes")}`,
  },

  home: {
    kicker: "Rome · openbaar vervoer",
    title: "Wanneer komt hij?",
    intro:
      "Zoek een halte op nummer of naam, of een lijn. De doorkomsten komen uit de realtimefeed van Rome.",
  },

  search: {
    inputAria: "Zoek een halte of een lijn",
    placeholder: "Halte, straat of lijn",
    searchingFor: (query: string): string => `Zoeken naar «${query}»…`,
    noResultsFor: (query: string): string => `Geen resultaat voor «${query}»`,
    noResultsHint:
      "Probeer het met het haltenummer (bijvoorbeeld 70101), de straatnaam of het lijnnummer.",
    resultsList: "Zoekresultaten",
    keyboardHint: "↑ ↓ om te bladeren, Enter om te openen, Esc om te sluiten",
  },

  favorites: {
    heading: "Favorieten",
    emptyTitle: "Nog geen favorieten",
    emptyHint:
      "Tik op de ster ★ naast een halte of een lijn: in het zoekveld, bij Haltes in de buurt, op de haltepagina of op die van de lijn. Je vindt hem hier terug, zonder elke keer te zoeken.",
    reorder: "Volgorde wijzigen",
    reorderDone: "Klaar",
    reorderHint: "Verplaats de haltes met de pijlen. De volgorde geldt op dit apparaat.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: positie ${position} van ${total}.`,
    moveUp: (name: string): string => `${name} omhoog`,
    moveDown: (name: string): string => `${name} omlaag`,
    addStar: (name: string): string => `Ster geven aan halte ${name}`,
    removeStar: (name: string): string => `Ster weghalen bij halte ${name}`,
    addStarLine: (name: string): string => `Ster geven aan lijn ${name}`,
    removeStarLine: (name: string): string => `Ster weghalen bij lijn ${name}`,
    starredTitle: "Met ster: staat in de favorieten",
    starTitle: "Ster geven",
    starredLabel: "Met ster",
    starLabel: "Ster",
    editLabels: (name: string): string => `Label en lijnen van ${name} bewerken`,
    onlyLines: (labels: string): string => `alleen ${labels}`,
    notUpdated: "niet bijgewerkt",
    noArrivalsOnPinned: "Geen doorkomst op de gekozen lijnen.",
    changeLines: "Lijnen wijzigen",
    noArrivalsSoon: "Geen doorkomst in de komende minuten.",
    openForTimes: "Openen voor de tijden",
    vehiclesUnavailable: "Voertuigen niet beschikbaar",
    lookingForVehicles: "Zoeken naar de rijdende voertuigen…",
    noVehiclesNow: "Nu geen voertuig in dienst",
    vehiclesInService: (count: number): string =>
      `${counted(count, "voertuig", "voertuigen")} nu in dienst`,
    refreshArrivals: "Aankomsten vernieuwen",
    undoRemovedStop: "Halte zonder ster: staat niet meer in de favorieten.",
    undoRemovedLine: "Lijn zonder ster: staat niet meer in de favorieten.",
    undoDismiss: "Melding sluiten",
    more: (count: number): string => `Nog ${count} favorieten`,
    sidebarEmptyBefore: "Tik op de ster naast een halte of een lijn, in het zoekveld, bij ",
    sidebarEmptyAfter: " of op de pagina die je bekijkt. Je vindt hem hier terug.",
    nextDeparture: "volgende doorkomst",
    noDeparture: "geen doorkomst beschikbaar",
    notAvailableShort: "n.v.t.",
  },

  recents: {
    heading: "Onlangs bekeken",
    clear: "Leegmaken",
    emptyTitle: "Geen recente halte",
    emptyHint:
      "De haltes die je opent blijven hier een paar dagen staan, zodat je ze terugvindt zonder opnieuw te zoeken.",
    listAria: "Onlangs bekeken haltes",
    justNow: "zojuist",
    today: "vandaag",
    yesterday: "gisteren",
  },

  arrivals: {
    due: "komt eraan",
    live: "realtime",
    scheduled: "volgens dienstregeling",
    scheduledTail: " volgens dienstregeling",
    scheduledSr: "geplande tijd",
    onTime: "op tijd",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "te laat",
    earlySuffix: "te vroeg",
    lateSr: (minutes: number): string =>
      `${minutes} ${plural(minutes, "minuut", "minuten")} te laat`,
    earlySr: (minutes: number): string =>
      `${minutes} ${plural(minutes, "minuut", "minuten")} te vroeg`,
    skipped: "vervalt",
    skippedSr: "rit vervalt",
    atClock: (clock: string): string => `om ${clock}`,
    towardsSr: (headsign: string): string => `richting ${headsign}`,
    loadingAria: "Aankomsten laden",
    emptyTitle: "Geen doorkomst verwacht",
    emptyHint:
      "Er nadert geen rit. Probeer de dienstregeling of kijk zo meteen nog eens.",
    frozenUnknown: "verwachting niet bijgewerkt",
    frozenFor: (minutes: number): string => `staat al ${minutes} min stil`,
    frozenPrefix: (state: string): string => `verwachting ${state}`,
    frozenSr: (state: string): string => `verwachting ${state}, niet realtime bijgewerkt`,
    expectedSr: (relative: string, clock: string): string => `verwacht ${relative}, om ${clock}`,
    bannerNoRealtimeStrong: "Realtime niet beschikbaar.",
    bannerNoRealtime:
      " We tonen de tijden uit de dienstregeling: voertuigen kunnen vroeger of later langskomen.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Realtime staat stil." : `Realtime staat al ${minutes} min stil.`,
    bannerFrozenBefore: " De verwachtingen hieronder zijn die",
    bannerFrozenLastUpdate: " van de laatste update",
    bannerFrozenAt: (clock: string): string => ` van ${clock}`,
    bannerFrozenAfter: " en worden niet bijgewerkt: neem ze met een korrel zout.",
    bannerPartialStrong: "Realtime gedeeltelijk.",
    bannerPartial: " Een deel van de gegevens is niet aangekomen: sommige ritten kunnen ontbreken.",
    showOnMap: (line: string): string => `Voertuig van lijn ${line} op de kaart tonen`,
    hideOnMap: (line: string): string => `Markering van het voertuig van lijn ${line} weghalen`,
  },

  dataAge: {
    prefix: "Bijgewerkt",
    now: "nu",
    secondsAgo: (seconds: number): string => `${seconds} s geleden`,
    minutesAgo: (minutes: number): string => `${minutes} min geleden`,
    atClock: (clock: string): string => `om ${clock}`,
    never: "nooit",
  },

  refreshFeedback: {
    updated: "Bijgewerkt",
    unchanged: "Gecontroleerd, niets nieuws",
    failed: "Bijwerken mislukt",
    updatedShort: "Bijgewerkt",
    unchangedShort: "Niets nieuws",
    failedShort: "Niet bijgewerkt",
    busy: "Bezig met bijwerken…",
    busySpoken: "Bezig met bijwerken",
  },

  stop: {
    tabArrivals: "Aankomsten",
    tabTimetable: "Dienstregeling",
    tabsAria: "Weergave van de halte",
    editTag: "Label bewerken",
    addTag: "Label",
    map: "Kaart",
    realtimePrefix: "Realtime",
    noRealtime: "Geen realtimegegevens",
    pageNotUpdated: "Pagina nog niet bijgewerkt",
    pageUpdatedAt: (clock: string): string => `Pagina bijgewerkt om ${clock}`,
    lastDataSuffix: (error: string): string =>
      `${error}. Je ziet de laatst ontvangen gegevens.`,
    arrivalsUnavailable: "Aankomsten niet beschikbaar",
    emptyHint:
      "Er nadert nu geen rit. Open de dienstregeling om te zien wanneer de volgende doorkomst gepland staat.",
    seeTimetable: "Dienstregeling bekijken",
    linesHere: "Lijnen die hier stoppen",
  },

  tagDialog: {
    titleFavorite: "Favoriet",
    titleTag: "Label van de halte",
    label: "Hoe jij hem noemt",
    placeholder: "Thuis, kantoor, sportschool…",
    hint: (maxChars: number): string =>
      `Alleen voor jou: blijft op dit apparaat, maximaal ${maxChars} tekens.`,
    linesLegend: "Te tonen lijnen",
    linesNone: "Geen keuze: de kaart toont alle lijnen.",
    linesSome: (count: number): string =>
      `Alleen ${counted(count, "lijn", "lijnen")} op de kaart.`,
    showAllLines: "Alle lijnen tonen",
    removeTag: "Label verwijderen",
  },

  timetable: {
    previousDay: "Vorige dag",
    nextDay: "Volgende dag",
    today: "vandaag",
    scheduled: "dienstregeling",
    jumpToNow: "Naar nu",
    backToToday: "Terug naar vandaag",
    fromServiceStart: "Vanaf het begin van de dienst",
    unavailableTitle: "Dienstregeling niet beschikbaar",
    partialError: (error: string): string => `${error}. Je ziet de al geladen ritten.`,
    emptyTitle: "Vanaf hier geen rit meer",
    emptyFromNow:
      "Vanaf dit tijdstip zijn er geen doorkomsten meer. Probeer vanaf het begin van de dienst, een andere dag, of haal het lijnfilter weg.",
    emptyWholeDay:
      "Op deze dag staat geen enkele doorkomst gepland: probeer de dag ervoor of erna, of haal het lijnfilter weg.",
    loadMore: "Meer ritten tonen",
    loadingMore: "Laden…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${counted(count, "rit", "ritten")} van ${from} tot ${to}` +
      (complete ? ", tot het einde van de dienst" : "") +
      ". Dit zijn de officiële tijden van de dienstdag, zonder realtime.",
  },

  map: {
    fallbackAria: "Kaart",
    vehiclesHeading: "Voertuigen op de kaart",
    show: "Tonen",
    hide: "Verbergen",
    modeGroup: "Welke voertuigen tonen",
    modeApproaching: "Onderweg hierheen",
    modeAllLines: "Alle lijnen",
    loadingStop: "Positie van de halte laden…",
    stopMapAria: (stopName: string): string => `Kaart van de voertuigen bij halte ${stopName}`,
    centreOnStop: "Op de halte centreren",
    nearbyVehicles: "Voertuigen hier in de buurt",
    allVehicles: "Alle, ook de verre",
    loadingVehicles: "Voertuigen laden…",
    noneApproaching: "Geen voertuig in aantocht",
    approachingCount: (count: number): string =>
      `${count} ${plural(count, "voertuig in aantocht", "voertuigen in aantocht")}`,
    onTheseLines: (count: number): string =>
      `${counted(count, "voertuig", "voertuigen")} op de lijnen van deze halte`,
    positionsAt: (clock: string): string => `posities van ${clock}`,
    positionsStale: "posities niet bijgewerkt",
    allLinesNote:
      "De volle voertuigen rijden naar deze halte, de vervaagde rijden op dezelfde lijnen maar komen hier nu niet langs.",
    approachingList: "Voertuigen in aantocht",
    hereIn: (relative: string): string => `Hier ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Hier ${relative}, om ${clock}`,
    notInbound: "Rijdt op deze lijn, maar niet naar deze halte",
    noBearing: " · richting niet doorgegeven",
    follow: "Ik zit in dit voertuig, volg het",
    unfollow: "Niet meer volgen",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Lijn ${line}, hier ${relative}${followed ? ", je volgt hem" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Lijn ${line}, onderweg, niet naar deze halte${followed ? ", je volgt hem" : ""}`,
    yourPosition: "Jouw positie",
    vehicleTitle: (vehicleId: string): string => `Voertuig ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName} op de kaart tonen`,
    divertedSuffix: " · buiten de route",
    divertedBadge: "Buiten de route",
    divertedNote: "Hij rijdt een andere route dan gepland.",
  },

  follow: {
    headlineLive: "Ik volg dit voertuig",
    headlinePaused: "Volgen gepauzeerd",
    headlineStale: "Positie staat stil",
    headlineLost: "Voertuig niet meer op de lijn",
    detailLive: "De kaart blijft bij elke update op hem gecentreerd.",
    detailPaused:
      "Je hebt de kaart verschoven, dus verplaats ik hem niet meer. Tik op Hervatten om terug te gaan naar het voertuig.",
    detailStaleUnknown: "Het voertuig geeft zijn positie al een tijdje niet meer door.",
    detailStale: (age: string): string =>
      `Het voertuig zendt al ${age} niet meer: wat je op de kaart ziet is het laatst bekende punt.`,
    detailLost:
      "Ik ontvang zijn positie niet meer. Hij kan de rit hebben beëindigd of uit dienst zijn.",
    ageMinutes: (minutes: number): string => `${minutes} ${plural(minutes, "minuut", "minuten")}`,
    ageHours: (hours: number): string => (hours === 1 ? "een uur" : `${hours} uur`),
    compact: "Ik volg",
    compactSr: (line: string): string => ` lijn ${line}`,
    lineSr: (line: string): string => `, lijn ${line}`,
    resume: "Hervatten",
    exit: "Stoppen",
    close: "Sluiten",
    lostHint: "Als hij nog rondrijdt, vind je hem via «Alle lijnen».",
  },

  nearby: {
    title: "Haltes in de buurt",
    mapAria: "Kaart van de haltes in de buurt",
    searchHere: "In dit gebied zoeken",
    radius: "Straal",
    locating: "Bezig met lokaliseren…",
    myPosition: "Mijn positie",
    geoDenied:
      "Toestemming voor locatie geweigerd. We tonen het centrum van Rome: verschuif de kaart en zoek in dat gebied.",
    geoUnavailable:
      "Positie op dit moment niet beschikbaar. We tonen het centrum van Rome: verschuif de kaart en zoek in dat gebied.",
    geoTimeout:
      "Het lokaliseren duurde te lang. We tonen het centrum van Rome: verschuif de kaart en probeer het opnieuw.",
    geoUnsupported:
      "Deze browser ondersteunt geen locatiebepaling. Verschuif de kaart om haltes te zoeken.",
    outsideRome: "Je bent buiten het gebied van Rome: we tonen het stadscentrum.",
    outsideCoverage: "Dit gebied valt buiten de dekking. Verschuif de kaart naar Rome.",
    focusStopMissing: "Gevraagde halte niet gevonden: we tonen jouw gebied.",
    focusStopFailed: (error: string): string => `Gevraagde halte niet geladen (${error}).`,
    stopsFailed: (error: string): string => `Haltes niet geladen: ${error}`,
    loadingStops: "Zoeken naar de haltes…",
    noStopsInRadius: (radius: string): string =>
      `Geen halte binnen ${radius}. Probeer de straal te vergroten of de kaart te verschuiven.`,
    onMapCap: (max: number): string => ` (de eerste ${max} op de kaart)`,
    noLines: "Geen lijn",
    arrivalsLink: "Aankomsten",
    showMoreStops: "Meer haltes tonen",
  },

  line: {
    loading: "Lijn laden…",
    loadFailed: (error: string): string => `Lijn niet geladen: ${error}`,
    mapAria: (name: string): string => `Kaart van lijn ${name}`,
    dataAt: (clock: string): string => `gegevens van ${clock}`,
    updatedAt: (clock: string): string => `bijgewerkt om ${clock}`,
    vehiclesStale: (error: string): string => `Voertuigen niet bijgewerkt: ${error}`,
    noPathForDirection: "Route niet beschikbaar voor deze richting",
    stopsHeading: (count: number): string => `Haltes (${count})`,
    noStopsForDirection: "Geen halte beschikbaar voor deze richting.",
    showAllStops: "Alle haltes tonen",
  },

  lineService: {
    inService: (count: number): string =>
      `${counted(count, "voertuig", "voertuigen")} op de lijn`,
    loadingVehicles: "Voertuigen laden…",
    checkingTimetable: "Dienstregeling controleren…",
    feedDownTitle: "Realtimeposities niet beschikbaar",
    feedDownDetail:
      "De dienst kan gewoon rijden: we kunnen de positie van de voertuigen niet uitlezen.",
    noneReporting: "Geen enkel voertuig geeft zijn positie door",
    unknownDetail:
      "Dat betekent niet dat de lijn niet rijdt: de tijden uit de dienstregeling staan op de pagina van een halte.",
    scheduledDetail: (count: number): string =>
      `De dienst staat gepland: ${count} ${plural(count, "geplande rit", "geplande ritten")} van nu tot het einde van de dag.`,
    finishedTitle: "Dienst voor vandaag afgelopen",
    finishedDetail: (count: number, clock: string): string =>
      `Vandaag ${counted(count, "geplande rit", "geplande ritten")}, de laatste om ${clock}.`,
    noneTodayTitle: "Vandaag geen geplande rit",
    noneTodayDetail: "Op deze lijn staat vandaag geen rit in de dienstregeling.",
    noneTodayFrom: (stopName: string): string =>
      `Vanaf ${stopName} staat vandaag geen rit in de dienstregeling.`,
    nextDepartures: "Volgende vertrektijden",
    nextDeparturesFrom: (stopName: string): string => ` vanaf ${stopName}`,
    scheduledOnly: "Tijden uit de dienstregeling, zonder realtime.",
  },

  journey: {
    title: "Route",
    subtitle: "Van punt naar punt door Rome met bus, tram en metro.",
    from: "Vertrek",
    to: "Aankomst",
    placeholder: "Halte, adres of plaats",
    swap: "Omdraaien",
    whenLegend: "Wanneer",
    now: "Nu",
    pickTime: "Tijd kiezen",
    timeLabel: "Datum en tijd van vertrek",
    submit: "Route zoeken",
    resultsHeading: "Routes",
    emptyTitle: "Waar wil je heen?",
    emptyHint:
      "Vul een vertrek- en aankomstpunt in: we zoeken de beste route op basis van de officiële dienstregeling.",
    searching: "Routes zoeken…",
    noResultsTitle: "Geen route",
    noResultsHint:
      "We zoeken alleen directe verbindingen of met één overstap. Probeer het vertrekpunt of de tijd te verschuiven.",
    disclaimer:
      "Tijden uit de dienstregeling, niet realtime: werkelijke vertragingen tellen niet mee. Looptrajecten zijn hemelsbreed geschat, de echte afstand over straat is dus groter.",
    searchedFrom: (when: string): string => ` Gezocht vanaf ${when}.`,
    mapAria: "Kaart van de gekozen route",
    mapCaption:
      "De trajecten in het voertuig volgen de echte lijnroute. De gestippelde zijn hemelsbreed geschat: de looptrajecten bij het overstappen en de zeldzame lijnen zonder tracé.",
    missingEndpoints: "Geef zowel het vertrek als de aankomst op.",
    badDateTime: "Datum en tijd ongeldig.",
    geoUnsupported: "Deze browser ondersteunt geen locatiebepaling.",
    geoUnavailable: "Positie op dit moment niet beschikbaar.",
    geoOutsideRome: "Je bent buiten het gebied van Rome: typ een adres.",
    geoDenied: "Toestemming voor locatie geweigerd: typ een adres.",
    geoTimeout: "Het lokaliseren duurde te lang.",
    originMarker: (name: string): string => `Vertrek: ${name}`,
    destinationMarker: (name: string): string => `Aankomst: ${name}`,
    useMyPosition: "Mijn positie gebruiken",
    clearField: (label: string): string => `${label} leegmaken`,
    suggestionsFor: (label: string): string => `Suggesties voor ${label.toLowerCase()}`,
    placeStop: "Halte",
    placeCoord: "Coördinaten",
    placeAddress: "Adres",
    walkOnly: "Alleen lopen",
    walkOnlyShort: "lopen",
    noTransfers: "zonder overstap",
    transfers: (count: number): string => `${counted(count, "overstap", "overstappen")}`,
    walkDistance: (distance: string): string => `${distance} lopen`,
    walkLeg: (distance: string, duration: string): string =>
      `${distance} lopen, ongeveer ${duration} tot `,
    inService: "in dienst",
    stopCount: (count: number): string => counted(count, "halte", "haltes"),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Route ${index}: vertrek ${departure}, aankomst ${arrival}`,
    lineDetailsAria: (line: string): string => `Lijn ${line}, details`,
    hours: (hours: number): string => `${hours} u`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} u ${minutes}`,
    noticeNoOriginStops:
      "Geen halte op loopafstand van het vertrekpunt: probeer een adres dichter bij een lijn.",
    noticeNoDestinationStops:
      "Geen halte op loopafstand van de bestemming: probeer een adres dichter bij een lijn.",
    noticeNoConnection:
      "Geen verbinding gevonden tussen deze twee gebieden in de komende uren.",
    noticeWalkOnlyLeft:
      "Geen verbinding in de dienstregeling in de komende uren: alleen de looproute blijft over.",
    noticeLaterDepartures:
      "Niets gepland in het komende anderhalf uur: we tonen de eerste ritten daarna.",
  },

  alerts: {
    title: "Dienstmeldingen",
    subtitle: "Omleidingen, opheffingen en wijzigingen uit de officiële feed.",
    loading: "Laden…",
    degraded:
      "De realtimefeed reageert niet of is oud: deze meldingen zijn mogelijk niet actueel.",
    loadFailed: "Meldingen konden niet worden geladen.",
    refreshFailed: (error: string): string =>
      `De laatste update is mislukt (${error}): je ziet de vorige lijst.`,
    searchPlaceholder: "Zoek: staking, omleiding, straat…",
    searchAria: "In de meldingen zoeken",
    filterByLine: "Op lijn filteren",
    allLines: (count: number): string => `Alle lijnen (${count})`,
    networkWide: "Algemene meldingen",
    clearFilters: "Wissen",
    noMatch: "Geen melding voldoet aan de filters.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${plural(shown, "melding", "meldingen")} van ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${plural(count, "actieve melding", "actieve meldingen")} op ${lines} lijnen.`,
    goToLine: "Naar de lijn",
    noneTitle: "Geen actieve melding",
    noneHint:
      "Op dit moment meldt de feed geen storingen of wijzigingen in de dienst. Kijk voor vertrek nog even.",
    noResultsTitle: "Geen resultaat",
    noResultsHint:
      "Probeer het met minder woorden, of wis de filters om alle meldingen weer te zien.",
    noSelectionTitle: "Geen melding geselecteerd",
    noSelectionHint: "Kies links een melding uit de lijst om hem helemaal te lezen.",
    showMoreLines: (count: number): string => `Meer lijnen tonen (${count})`,
    goToLineShort: "naar de lijn",
    fallbackHeader: "Dienstmelding",
    noDetail: "Geen details gepubliceerd door de vervoerder.",
    operatorLink: "Details op de site van de vervoerder",
    affectedLines: "Betrokken lijnen",
    alsoOn: "Ook op",
    contextHeading: (count: number): string =>
      `${count} ${plural(count, "actieve melding", "actieve meldingen")}`,
    contextAria: "Dienstmeldingen",
    contextAll: "Alle",
    contextUnavailable: (error: string): string => `Meldingen niet beschikbaar: ${error}`,
    contextMore: (count: number): string => `Nog ${count} meldingen op de `,
    contextMoreLink: "meldingenpagina",
    contextStale: (error: string): string =>
      `De laatste update is mislukt (${error}): deze meldingen zijn mogelijk niet actueel.`,
    windowBetween: (from: string, until: string): string => `Van ${from} tot ${until}`,
    windowFrom: (from: string): string => `Vanaf ${from}, zonder vermelde einddatum`,
    windowUntil: (until: string): string => `Tot ${until}`,
    windowUnknown: "Geldigheidsperiode niet vermeld",
    effect: (code: string): string | null => EFFECT_NL[code] ?? null,
    cause: (code: string): string | null => CAUSE_NL[code] ?? null,
  },

  settings: {
    title: "Instellingen",
    subtitle: "Alles blijft op dit apparaat. Geen account, geen server.",
    sectionArrivals: "Aankomsten",
    autoRefresh: "Automatisch vernieuwen",
    everySeconds: (seconds: number): string => `elke ${seconds} seconden`,
    autoRefreshHint: "Tijd tussen twee uitlezingen van de realtimefeed.",
    maxArrivals: "Getoonde aankomsten per halte",
    showScheduled: "Tijden uit de dienstregeling tonen",
    showScheduledHint:
      "Als realtime niets heeft voor een halte, de dienstregeling gebruiken.",
    sectionNearby: "Bij mij in de buurt",
    radius: "Zoekstraal",
    radiusHint: "Geldt ook voor de snelle stralen op de kaart met haltes in de buurt.",
    sectionAppearance: "Weergave",
    themeLegend: "Thema",
    themeSystem: "Systeem",
    themeLight: "Licht",
    themeDark: "Donker",
    sectionLanguage: "Taal",
    languageLegend: "Taal van de interface",
    languageSystem: "Systeem",
    languageHint: (resolved: string): string =>
      `Met «Systeem» volgen we de taal van de browser: dat is nu ${resolved}.`,
    sectionBackup: "Back-up van de favorieten",
    backupIntro:
      "Een JSON-bestand op je apparaat: zo verplaats je de favorieten naar een andere browser, want hier is geen account.",
    exportCount: (count: number): string => `Exporteren (${count})`,
    importFromFile: "Importeren uit bestand",
    exported: (count: number): string => `${count} favorieten geëxporteerd.`,
    exportFailed: "Exporteren is in deze browser niet gelukt.",
    fileTooLarge: "Het bestand is te groot om een back-up van de favorieten te zijn.",
    fileUnreadable: "Het bestand kon niet worden gelezen.",
    importEmpty: "Het bestand is leeg.",
    importNotJson: "Het bestand is geen geldige JSON.",
    importNoList: "Het bestand bevat geen lijst met favorieten.",
    importNoneValid: "Geen geldige favoriet in het bestand gevonden.",
    importFound: (count: number): string => `${count} geldige favorieten gevonden`,
    importSkipped: (count: number): string => `, ${count} items overgeslagen.`,
    importFoundEnd: ".",
    importMerge: "Samenvoegen",
    importReplace: "Vervangen",
    replaced: (count: number): string => `Favorieten vervangen: het zijn er nu ${count}.`,
    mergedNone: "Geen nieuwe favoriet om toe te voegen.",
    merged: (count: number): string => `${count} favorieten toegevoegd.`,
    sectionLocalData: "Lokale gegevens",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} favorieten, ${recents} haltes in de geschiedenis.`,
    confirmClearFavorites: "Alle favorieten verwijderen? Dat kan niet ongedaan worden gemaakt.",
    confirmClearFavoritesYes: "Ja, leegmaken",
    clearFavorites: "Favorieten leegmaken",
    favoritesCleared: "Favorieten leeggemaakt.",
    confirmClearRecents: "De geschiedenis van bekeken haltes verwijderen?",
    confirmClearRecentsYes: "Ja, verwijderen",
    clearRecents: "Geschiedenis verwijderen",
    recentsCleared: "Geschiedenis verwijderd.",
    resetDefaults: "Standaardinstellingen herstellen",
    settingsReset: "Instellingen teruggezet op de standaardwaarden.",
    infoLink: "Informatie, gegevensbronnen en veelgestelde vragen",
  },

  sync: {
    titleFull: "Apparaten synchroniseren",
    titleCollapsed: "Synchronisatie",
    badgeOn: "actief",
    summaryLoading: "…",
    summaryUnavailable: "Niet beschikbaar op deze verbinding",
    summaryOff: "Niet actief",
    summarySyncing: "Bezig met synchroniseren…",
    summaryError: "Synchronisatiefout",
    summaryConflict: "Conflict op te lossen",
    summaryOn: (last: string): string => `Actief · laatste ${last}`,
    intro:
      "Neem favorieten, recente haltes en instellingen mee naar een ander apparaat met een code. De gegevens worden hier versleuteld: de server bewaart alleen onleesbare gegevens.",
    enable: "Synchronisatie inschakelen",
    haveCode: "Ik heb al een code",
    codeLabel: "Synchronisatiecode",
    codeHint:
      "20 tekens, zoals je ze op het andere apparaat leest. Hoofdletters, streepjes en spaties tellen niet mee.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} tekens`,
    join: "Verbinden",
    onIntro:
      "De gegevens worden op dit apparaat versleuteld voordat ze vertrekken. Wie de code heeft, kan al je favorieten lezen: gebruik hem alleen op je eigen apparaten.",
    code: "Code",
    showCode: "Code tonen",
    hideCode: "Code verbergen",
    copyCode: "Code kopiëren",
    copied: "Gekopieerd",
    lastSync: "Laatste synchronisatie:",
    inProgress: " · bezig…",
    syncNow: "Nu synchroniseren",
    disconnect: "Verbinding verbreken",
    disconnectNote:
      "Als je de verbinding verbreekt, blijven de gegevens op dit apparaat en blijft de versleutelde kopie op de server tot je hem verwijdert.",
    deleteWarning:
      "Verwijdert de versleutelde kopie van de server. De andere apparaten vinden dan niets meer om te synchroniseren. Dit kan niet ongedaan worden gemaakt.",
    deleteConfirm: "Echt verwijderen",
    deleteRemote: "Gegevens van de server verwijderen",
    justNow: "nu",
    minutesAgo: (minutes: number): string => `${minutes} min geleden`,
    atClock: (clock: string): string => `om ${clock}`,
    errors: {
      aborted: "Bewerking geannuleerd.",
      generic: "Synchronisatie mislukt. Probeer het zo meteen opnieuw.",
      insecureContext:
        "Synchronisatie heeft een beveiligde verbinding nodig: open de site via https (of op localhost). Via gewoon http zetten browsers de versleuteling uit, en dan kan er op dit apparaat niets versleuteld worden.",
      noBase64Encode: "Deze browser kan de synchronisatiegegevens niet coderen.",
      noBase64Decode: "Deze browser kan de synchronisatiegegevens niet decoderen.",
      invalidSyncData: (what: string): string => `Ongeldige synchronisatiegegevens (${what}).`,
      codeRequired: "Voer de synchronisatiecode in.",
      codeTooLong: (max: number): string => `Die code is te lang: het moeten ${max} tekens zijn.`,
      codeInvalidChars: (chars: string): string =>
        `De code bevat tekens die niet zijn toegestaan: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `De code is ${required} tekens lang, je hebt er ${actual} ingevoerd.`,
      keyDerivationFailed: "Deze browser kan de synchronisatiesleutels niet afleiden.",
      preparePayloadFailed: "De gegevens om te synchroniseren konden niet worden voorbereid.",
      encryptFailed: "De gegevens konden op dit apparaat niet worden versleuteld.",
      decryptFailed:
        "De code hoort niet bij deze gegevens, of de gegevens op de server zijn beschadigd.",
      invalidSyncId: "Ongeldige synchronisatie-id.",
      responseTooLarge: "De server stuurde te veel gegevens terug.",
      timeout: "De server antwoordde niet op tijd.",
      unreachable: "Server niet bereikbaar. Controleer je verbinding.",
      invalidResponse: "Ongeldig antwoord van de server.",
      invalidResponseField: (what: string): string =>
        `Ongeldig antwoord van de server (${what}).`,
      unexpectedFormat: "De server antwoordde in een onverwacht formaat.",
      rateLimited: "Te veel synchronisaties achter elkaar. Probeer het over een minuut opnieuw.",
      pullRejected: (status: number): string => `De server weigerde het lezen (fout ${status}).`,
      payloadTooLarge: "Er zijn te veel gegevens om te synchroniseren.",
      pushRejected: (status: number): string => `De server weigerde het opslaan (fout ${status}).`,
      deleteRejected: (status: number): string =>
        `De server weigerde het verwijderen (fout ${status}).`,
      conflict:
        "Een ander apparaat schrijft op dit moment in dezelfde gegevens. Je lokale gegevens zijn veilig: probeer het over een paar seconden opnieuw.",
    },
    status: {
      deleted: "Gegevens van de server verwijderd. Dit apparaat synchroniseert niet meer.",
      disconnected:
        "Synchronisatie staat uit op dit apparaat. Je gegevens blijven hier en de versleutelde kopie blijft op de server tot je hem verwijdert.",
    },
  },

  info: {
    title: "Informatie",
    subtitle:
      "Dienstregeling en aankomsten van het openbaar vervoer in Rome, uit de officiële open data.",
    unofficialTitle: "Niet-officiële app",
    unofficialBody:
      "Deze site is op geen enkele manier verbonden met, geassocieerd met, goedgekeurd door of gesteund door ATAC S.p.A., Roma Servizi per la Mobilità of Roma Capitale. Het is een onafhankelijk project dat zich beperkt tot het lezen van de open data die deze instanties publiceren. Voor officiële informatie, vervoerbewijzen en klachten kun je bij hun kanalen terecht.",
    whatTitle: "Wat het is",
    whatBody1:
      "Een webapp om te zien over hoeveel tijd het volgende voertuig langskomt bij de halte waar je staat. Je zoekt een halte of een lijn, slaat hem op in de favorieten en vindt hem op de startpagina terug met bijgewerkte aankomsten. Geen account, geen advertenties, geen gebruiksstatistieken.",
    whatBody2:
      "Als de realtimefeed de rit dekt, is de getoonde tijd een verwachting op basis van de positie van het voertuig. Anders valt de app terug op de dienstregeling en zegt dat er altijd bij, in plaats van oude gegevens als verwachting te presenteren.",
    dataTitle: "Waar de gegevens vandaan komen",
    dataBodyBefore:
      "Dienstregeling, haltes, lijnen, routes, voertuigposities en dienstmeldingen komen uit de open data van ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS- en GTFS-Realtime-feeds). De dienstregeling wordt elke dag bijgewerkt, realtime ongeveer elke 30 seconden.",
    dataLink: "romamobilita.it — Open data",
    dataLicence:
      "De gegevens blijven eigendom van de rechthebbenden en worden gebruikt onder de voorwaarden van de licentie waaronder ze worden gepubliceerd.",
    privacyTitle: "Privacy",
    privacyBody:
      "Er is geen login en geen gebruikersprofiel. Favorieten, onlangs bekeken haltes en instellingen worden alleen in je browser bewaard en nergens naartoe gestuurd. De locatie blijft, als je die geeft voor het zoeken van haltes in de buurt, op het apparaat: die wordt gebruikt om afstanden te berekenen en wordt niet opgeslagen.",
    faqTitle: "Veelgestelde vragen",
    faq1Q: "Waarom verschijnt een lijn of een bus niet?",
    faq1A:
      "We tonen alleen wat in de officiële feeds staat. Als een voertuig zijn positie niet doorgeeft, of als zijn rit niet in de realtimefeed staat, bestaat het voor ons niet: hooguit zie je de tijd uit de dienstregeling. Dat gebeurt vaak bij vervangende ritten, pendelbussen en voertuigen met een kapotte tracker.",
    faq2Q: "Waarom wijken de tijden af van die op de halte?",
    faq2A:
      "Het bord aan de paal geeft de dienstregeling, die maar een paar keer per jaar verandert. Hier zie je, als het voertuig zendt, de verwachting berekend op zijn echte positie, die rekening houdt met verkeer en vertraging. Als er «volgens dienstregeling» staat, is er geen verwachting en tonen we dezelfde tijd als het bord.",
    faq3Q: "Wat gebeurt er 's nachts?",
    faq3A:
      "'s Nachts is de realtimefeed bijna leeg, omdat er weinig voertuigen rijden. De app blijft werken met de dienstregeling van de nachtlijnen. In GTFS eindigt de dienstdag niet om middernacht maar om 04:00: een rit van één uur 's nachts hoort nog bij de dag ervoor, en daarom kun je tijden als 25:30 zien die vertaald worden naar 01:30.",
    faq4Q: "Belanden mijn favorieten op een server?",
    faq4A:
      "Nee. Favorieten, geschiedenis en instellingen staan in de localStorage van de browser. Als je de sitegegevens wist of van apparaat wisselt, verdwijnen ze: bij de instellingen kun je ze exporteren naar een JSON-bestand en elders weer importeren.",
    settingsLink: "Naar de instellingen",
  },

  footer: {
    dataPrefix: "Dienstgegevens en dienstregeling: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (open data GTFS).",
    independent:
      "Onafhankelijk project, niet verbonden met ATAC of Roma Servizi per la Mobilità. ",
    infoLink: "Informatie",
  },

  errors: {
    genericTitle: "Er ging iets mis",
    unexpected: "Onverwachte fout",
    unexpectedDot: "Onverwachte fout.",
    stopNotFound: "Halte niet gevonden",
    serviceDown: "De dienst reageert niet",
    requestFailed: (status: number): string => `Verzoek mislukt (${status})`,
    httpStatus: (status: number): string => `Fout ${status}`,
    badResponse: "Ongeldig antwoord van de server",
    badResponseDot: "Ongeldig antwoord van de server.",
    timedOut: "Verzoek verlopen",
    timedOutDot: "Verzoek verlopen.",
    offline: "Geen verbinding",
    connectionFailed: "Verbinding mislukt.",
    tooManyRequests: "Te veel verzoeken",
    badRequest: "Ongeldige parameters",
    lineNotFound: "Lijn niet gevonden",
    journeyOriginNotFound: "Vertrekpunt niet gevonden",
    journeyDestinationNotFound: "Bestemming niet gevonden",
    journeyPlaceHint: "Probeer een nauwkeuriger adres.",
  },

  notFound: {
    kicker: "Fout 404",
    title: "Halte niet bediend",
    body:
      "Deze pagina bestaat niet. Dat kan gebeuren met een oude link, of met de code van een halte of lijn die niet meer in de feed staat.",
    searchCta: "Een halte zoeken",
    nearbyCta: "Haltes in de buurt",
  },

  appError: {
    title: "Rit onderbroken",
    body:
      "Dit scherm kon niet laden. Probeer het opnieuw: blijft het probleem, dan reageert waarschijnlijk de gegevensdienst niet.",
    digest: (digest: string): string => `Code: ${digest}`,
    backHome: "Terug naar start",
    globalTitle: "Dienst gestaakt",
    globalBody:
      "De applicatie is gestopt door een onverwachte fout. Laad de pagina opnieuw: je favorieten blijven op de telefoon bewaard en gaan niet verloren.",
    reload: "Opnieuw laden",
  },

  format: {
    due: "komt eraan",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "datum niet beschikbaar",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "update onbekend",
    ageSeconds: (seconds: number): string => `${seconds} s geleden bijgewerkt`,
    ageMinutes: (minutes: number): string => `${minutes} min geleden bijgewerkt`,
    ageAt: (clock: string): string => `bijgewerkt om ${clock}`,
    onTime: "op tijd",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — vertrektijden in realtime",
    appDescription:
      "Actuele tijden en vertrekken van bus, tram en metro in Rome. Favorieten, haltes in de buurt en storingsmeldingen, zonder account en zonder reclame.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "De ATAC-haltes het dichtst bij je, met kaart en de lijnen die er stoppen.",
    journeyDescription:
      "Bereken hoe je met bus, tram en metro van het ene punt in Rome naar het andere komt, op de officiële ATAC-dienstregeling.",
    alertsDescription:
      "Omleidingen, opheffingen en wijzigingen in de dienstregeling uit de officiële feed.",
    settingsDescription:
      "Verversen van aankomsten, zoekstraal, thema en beheer van wat je hebt opgeslagen.",
    infoDescription:
      "Wat deze app is, waar de gegevens vandaan komen en waarom hij niet verbonden is met ATAC of Roma Servizi per la Mobilità.",
    stopDescription: "Eerstvolgende vertrekken in realtime en de dienstregeling van de halte.",
    lineDescription: "Route, haltes en voertuigen van de lijn in realtime.",
  },

  skeleton: {
    loading: "Laden",
  },
};

const EFFECT_NL: Record<string, string | undefined> = {
  NO_SERVICE: "Dienst gestaakt",
  REDUCED_SERVICE: "Beperkte dienst",
  SIGNIFICANT_DELAYS: "Aanzienlijke vertraging",
  DETOUR: "Omleiding",
  ADDITIONAL_SERVICE: "Extra dienst",
  MODIFIED_SERVICE: "Gewijzigde dienst",
  STOP_MOVED: "Halte verplaatst",
  NO_EFFECT: "Geen gevolgen voor de dienst",
  ACCESSIBILITY_ISSUE: "Toegankelijkheidsprobleem",
  OTHER_EFFECT: "Overig",
  UNKNOWN_EFFECT: "Gevolg niet vermeld",
};

const CAUSE_NL: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Technisch defect",
  STRIKE: "Staking",
  DEMONSTRATION: "Demonstratie",
  ACCIDENT: "Ongeval",
  HOLIDAY: "Feestdag",
  WEATHER: "Slecht weer",
  MAINTENANCE: "Onderhoud",
  CONSTRUCTION: "Werkzaamheden",
  POLICE_ACTIVITY: "Politieoptreden",
  MEDICAL_EMERGENCY: "Medisch noodgeval",
  OTHER_CAUSE: "Andere oorzaak",
  UNKNOWN_CAUSE: "Oorzaak niet vermeld",
};
