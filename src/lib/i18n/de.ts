/** German dictionary. Shape and key order follow it.ts, the source of truth. */

import type { Dictionary } from "./it";
import { counted, plural } from "./plural";

export const de: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, Startseite",
  },

  a11y: {
    skipToContent: "Zum Inhalt springen",
  },

  common: {
    retry: "Erneut versuchen",
    cancel: "Abbrechen",
    save: "Speichern",
    close: "Schließen",
    home: "Start",
    back: "Zurück",
    all: "Alle",
    loading: "Lädt…",
    searching: "Suche…",
    refresh: "Aktualisieren",
    dash: "—",
    minutesShort: "Min",
    clearSearch: "Suche löschen",
    searchInProgress: "Suche läuft",
  },

  nav: {
    primary: "Hauptnavigation",
    sidebar: "Seitenleiste",
    sidebarNav: "Navigation in der Seitenleiste",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    sections: "Bereiche",
    shortcuts: "Kurzbefehle",
    infoAria: "Informationen zur App",
    home: "Start",
    nearbyShort: "In der Nähe",
    nearby: "Haltestellen in der Nähe",
    journey: "Verbindung",
    alerts: "Meldungen",
    settings: "Einstellungen",
    info: "Info",
    hintNearby: "Was hier in der Nähe fährt",
    hintJourney: "Von A nach B",
    hintAlerts: "Umleitungen und Störungen",
    hintSettings: "Aktualisierung, Design, Daten",
    hintInfo: "Quellen und rechtliche Hinweise",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Straßenbahn";
        case 1:
          return "U-Bahn";
        case 2:
          return "Zug";
        case 4:
          return "Fähre";
        default:
          return "Bus";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tram";
        case 1:
          return "Metro";
        case 2:
          return "Zug";
        case 3:
          return "Bus";
        default:
          return "Linie";
      }
    },
    named: (name: string): string => `Linie ${name}`,
    namedAria: (name: string): string => `Linie ${name}`,
    details: "Details",
    towards: (headsign: string): string => `Richtung ${headsign}`,
    towardsCapital: (headsign: string): string => `Richtung ${headsign}`,
    direction: "Richtung",
    terminus: "Endhaltestelle",
    noHeadsign: "Ziel nicht angegeben",
  },

  stops: {
    code: (code: string): string => `Haltestelle ${code}`,
    codeOnly: "Haltestelle",
    pole: (code: string): string => `Mast ${code}`,
    accessible: "Barrierefreie Haltestelle",
    named: (name: string): string => `Haltestelle ${name}`,
    countLabel: (count: number): string => counted(count, "Haltestelle", "Haltestellen"),
    involved: (count: number): string =>
      `${count} ${plural(count, "betroffene Haltestelle", "betroffene Haltestellen")}`,
  },

  home: {
    kicker: "Rom · öffentlicher Nahverkehr",
    title: "Wann kommt der nächste?",
    intro:
      "Suche eine Haltestelle nach Nummer oder Name, oder eine Linie. Die Abfahrten kommen aus dem Echtzeit-Feed von Rom.",
  },

  search: {
    inputAria: "Haltestelle oder Linie suchen",
    placeholder: "Haltestelle, Straße oder Linie",
    searchingFor: (query: string): string => `Suche nach „${query}“…`,
    noResultsFor: (query: string): string => `Kein Ergebnis für „${query}“`,
    noResultsHint:
      "Versuche es mit der Haltestellennummer (zum Beispiel 70101), dem Straßennamen oder der Liniennummer.",
    resultsList: "Suchergebnisse",
    keyboardHint: "↑ ↓ zum Blättern, Enter zum Öffnen, Esc zum Schließen",
  },

  favorites: {
    heading: "Favoriten",
    emptyTitle: "Noch keine Favoriten",
    emptyHint:
      "Tippe auf den Stern ★ neben einer Haltestelle oder einer Linie: in der Suche, unter Haltestellen in der Nähe, auf der Haltestellen- oder der Linienseite. Du findest sie hier wieder, ohne jedes Mal zu suchen.",
    reorder: "Sortieren",
    reorderDone: "Fertig",
    reorderHint:
      "Verschiebe die Haltestellen mit den Pfeilen. Die Reihenfolge gilt auf diesem Gerät.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: Position ${position} von ${total}.`,
    moveUp: (name: string): string => `${name} nach oben`,
    moveDown: (name: string): string => `${name} nach unten`,
    addStar: (name: string): string => `Haltestelle ${name} mit Stern markieren`,
    removeStar: (name: string): string => `Stern von Haltestelle ${name} entfernen`,
    addStarLine: (name: string): string => `Linie ${name} mit Stern markieren`,
    removeStarLine: (name: string): string => `Stern von Linie ${name} entfernen`,
    starredTitle: "Mit Stern: in den Favoriten",
    starTitle: "Mit Stern markieren",
    starredLabel: "Mit Stern",
    starLabel: "Stern",
    editLabels: (name: string): string => `Bezeichnung und Linien von ${name} bearbeiten`,
    onlyLines: (labels: string): string => `nur ${labels}`,
    notUpdated: "nicht aktualisiert",
    noArrivalsOnPinned: "Keine Abfahrt auf den gewählten Linien.",
    changeLines: "Linien ändern",
    noArrivalsSoon: "Keine Abfahrt in den nächsten Minuten.",
    openForTimes: "Für die Zeiten öffnen",
    vehiclesUnavailable: "Fahrzeuge nicht verfügbar",
    lookingForVehicles: "Suche die Fahrzeuge im Betrieb…",
    noVehiclesNow: "Gerade kein Fahrzeug im Betrieb",
    vehiclesInService: (count: number): string =>
      `${counted(count, "Fahrzeug", "Fahrzeuge")} gerade im Betrieb`,
    refreshArrivals: "Abfahrten aktualisieren",
    undoRemovedStop: "Haltestelle ohne Stern: nicht mehr in den Favoriten.",
    undoRemovedLine: "Linie ohne Stern: nicht mehr in den Favoriten.",
    undoDismiss: "Hinweis schließen",
    more: (count: number): string => `${count} weitere Favoriten`,
    sidebarEmptyBefore:
      "Tippe auf den Stern neben einer Haltestelle oder einer Linie, in der Suche, unter ",
    sidebarEmptyAfter: " oder auf der Seite, die du gerade ansiehst. Du findest sie hier wieder.",
    nextDeparture: "nächste Abfahrt",
    noDeparture: "keine Abfahrt verfügbar",
    notAvailableShort: "k. A.",
  },

  recents: {
    heading: "Zuletzt angesehen",
    clear: "Leeren",
    emptyTitle: "Keine kürzlich besuchte Haltestelle",
    emptyHint:
      "Die Haltestellen, die du öffnest, bleiben ein paar Tage hier, damit du sie ohne neue Suche wiederfindest.",
    listAria: "Zuletzt angesehene Haltestellen",
    justNow: "gerade eben",
    today: "heute",
    yesterday: "gestern",
  },

  arrivals: {
    due: "kommt gleich",
    live: "in Echtzeit",
    scheduled: "nach Fahrplan",
    scheduledTail: " laut Fahrplan",
    scheduledSr: "geplante Zeit",
    onTime: "pünktlich",
    lateBy: (minutes: number): string => `+${minutes} Min`,
    earlyBy: (minutes: number): string => `−${minutes} Min`,
    lateSuffix: "Verspätung",
    earlySuffix: "zu früh",
    lateSr: (minutes: number): string =>
      `${minutes} ${plural(minutes, "Minute", "Minuten")} Verspätung`,
    earlySr: (minutes: number): string =>
      `${minutes} ${plural(minutes, "Minute", "Minuten")} zu früh`,
    skipped: "entfällt",
    skippedSr: "Fahrt entfällt",
    atClock: (clock: string): string => `um ${clock}`,
    towardsSr: (headsign: string): string => `Richtung ${headsign}`,
    loadingAria: "Abfahrten werden geladen",
    emptyTitle: "Keine Abfahrt vorgesehen",
    emptyHint:
      "Es nähert sich keine Fahrt. Versuche es mit dem Fahrplan oder in Kürze noch einmal.",
    frozenUnknown: "Prognose nicht aktuell",
    frozenFor: (minutes: number): string => `steht seit ${minutes} Min`,
    frozenPrefix: (state: string): string => `Prognose ${state}`,
    frozenSr: (state: string): string => `Prognose ${state}, nicht in Echtzeit aktualisiert`,
    expectedSr: (relative: string, clock: string): string => `erwartet ${relative}, um ${clock}`,
    bannerNoRealtimeStrong: "Echtzeit nicht verfügbar.",
    bannerNoRealtime:
      " Wir zeigen die Fahrplanzeiten: die Fahrzeuge können früher oder später kommen.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Echtzeit steht still." : `Echtzeit steht seit ${minutes} Min still.`,
    bannerFrozenBefore: " Die Prognosen unten sind die",
    bannerFrozenLastUpdate: " der letzten Aktualisierung",
    bannerFrozenAt: (clock: string): string => ` von ${clock}`,
    bannerFrozenAfter: " und werden nicht aktualisiert: mit Vorsicht zu genießen.",
    bannerPartialStrong: "Echtzeit nur teilweise.",
    bannerPartial: " Ein Teil der Daten fehlt: einzelne Fahrten können fehlen.",
    showOnMap: (line: string): string => `Fahrzeug der Linie ${line} auf der Karte zeigen`,
    hideOnMap: (line: string): string => `Hervorhebung des Fahrzeugs der Linie ${line} entfernen`,
  },

  dataAge: {
    prefix: "Aktualisiert",
    now: "jetzt",
    secondsAgo: (seconds: number): string => `vor ${seconds} s`,
    minutesAgo: (minutes: number): string => `vor ${minutes} Min`,
    atClock: (clock: string): string => `um ${clock}`,
    never: "nie",
  },

  refreshFeedback: {
    updated: "Aktualisiert",
    unchanged: "Geprüft, nichts Neues",
    failed: "Aktualisierung fehlgeschlagen",
    updatedShort: "Aktualisiert",
    unchangedShort: "Nichts Neues",
    failedShort: "Nicht aktualisiert",
    busy: "Wird aktualisiert…",
    busySpoken: "Aktualisierung läuft",
  },

  stop: {
    tabArrivals: "Abfahrten",
    tabTimetable: "Fahrplan",
    tabsAria: "Ansicht der Haltestelle",
    editTag: "Bezeichnung bearbeiten",
    addTag: "Bezeichnung",
    map: "Karte",
    realtimePrefix: "Echtzeit",
    noRealtime: "Keine Echtzeitdaten",
    pageNotUpdated: "Seite noch nicht aktualisiert",
    pageUpdatedAt: (clock: string): string => `Seite um ${clock} aktualisiert`,
    lastDataSuffix: (error: string): string => `${error}. Du siehst die zuletzt empfangenen Daten.`,
    arrivalsUnavailable: "Abfahrten nicht verfügbar",
    emptyHint:
      "Gerade nähert sich keine Fahrt. Öffne den Fahrplan, um zu sehen, wann die nächste Abfahrt vorgesehen ist.",
    seeTimetable: "Fahrplan ansehen",
    linesHere: "Linien, die hier halten",
  },

  tagDialog: {
    titleFavorite: "Favorit",
    titleTag: "Bezeichnung der Haltestelle",
    label: "Wie du sie nennst",
    placeholder: "Zuhause, Büro, Fitnessstudio…",
    hint: (maxChars: number): string =>
      `Nur für dich: bleibt auf diesem Gerät, höchstens ${maxChars} Zeichen.`,
    linesLegend: "Anzuzeigende Linien",
    linesNone: "Keine Auswahl: die Karte zeigt alle Linien.",
    linesSome: (count: number): string =>
      `Nur ${counted(count, "Linie", "Linien")} auf der Karte.`,
    showAllLines: "Alle Linien anzeigen",
    removeTag: "Bezeichnung entfernen",
  },

  timetable: {
    previousDay: "Vorheriger Tag",
    nextDay: "Nächster Tag",
    today: "heute",
    scheduled: "Fahrplanzeit",
    jumpToNow: "Zu jetzt springen",
    backToToday: "Zurück zu heute",
    fromServiceStart: "Ab Betriebsbeginn",
    unavailableTitle: "Fahrplan nicht verfügbar",
    partialError: (error: string): string => `${error}. Du siehst die bereits geladenen Fahrten.`,
    emptyTitle: "Ab hier keine Fahrt mehr",
    emptyFromNow:
      "Ab dieser Uhrzeit gibt es keine weiteren Abfahrten. Versuche es ab Betriebsbeginn, an einem anderen Tag, oder entferne den Linienfilter.",
    emptyWholeDay:
      "An diesem Tag ist keine Abfahrt vorgesehen: versuche den Tag davor oder danach, oder entferne den Linienfilter.",
    loadMore: "Weitere Fahrten anzeigen",
    loadingMore: "Lädt…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${counted(count, "Fahrt", "Fahrten")} von ${from} bis ${to}` +
      (complete ? ", bis Betriebsschluss" : "") +
      ". Das sind die offiziellen Zeiten des Betriebstags, ohne Echtzeit.",
  },

  map: {
    fallbackAria: "Karte",
    vehiclesHeading: "Fahrzeuge auf der Karte",
    show: "Anzeigen",
    hide: "Ausblenden",
    modeGroup: "Welche Fahrzeuge anzeigen",
    modeApproaching: "Hierher unterwegs",
    modeAllLines: "Alle Linien",
    loadingStop: "Lade die Position der Haltestelle…",
    stopMapAria: (stopName: string): string => `Karte der Fahrzeuge an der Haltestelle ${stopName}`,
    centreOnStop: "Auf die Haltestelle zentrieren",
    nearbyVehicles: "Fahrzeuge hier in der Nähe",
    allVehicles: "Alle, auch die weit entfernten",
    loadingVehicles: "Lade die Fahrzeuge…",
    noneApproaching: "Kein Fahrzeug im Anmarsch",
    approachingCount: (count: number): string =>
      `${count} ${plural(count, "Fahrzeug im Anmarsch", "Fahrzeuge im Anmarsch")}`,
    onTheseLines: (count: number): string =>
      `${counted(count, "Fahrzeug", "Fahrzeuge")} auf den Linien dieser Haltestelle`,
    positionsAt: (clock: string): string => `Positionen von ${clock}`,
    positionsStale: "Positionen nicht aktuell",
    allLinesNote:
      "Die kräftig gezeichneten Fahrzeuge fahren zu dieser Haltestelle, die blassen sind auf denselben Linien unterwegs, kommen aber gerade nicht hier vorbei.",
    approachingList: "Fahrzeuge im Anmarsch",
    hereIn: (relative: string): string => `Hier ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Hier ${relative}, um ${clock}`,
    notInbound: "Auf dieser Linie unterwegs, aber nicht zu dieser Haltestelle",
    noBearing: " · Richtung nicht übermittelt",
    follow: "Ich bin in diesem Fahrzeug, folge ihm",
    unfollow: "Nicht mehr folgen",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Linie ${line}, hier ${relative}${followed ? ", du folgst ihm" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Linie ${line}, unterwegs, nicht zu dieser Haltestelle${followed ? ", du folgst ihm" : ""}`,
    yourPosition: "Deine Position",
    vehicleTitle: (vehicleId: string): string => `Fahrzeug ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName} auf der Karte zeigen`,
    divertedSuffix: " · abseits der Route",
    divertedBadge: "Abseits der Route",
    divertedNote: "Es fährt eine andere Strecke als vorgesehen.",
  },

  follow: {
    headlineLive: "Ich folge diesem Fahrzeug",
    headlinePaused: "Verfolgung pausiert",
    headlineStale: "Position steht still",
    headlineLost: "Fahrzeug nicht mehr auf der Linie",
    detailLive: "Die Karte bleibt bei jeder Aktualisierung auf ihm zentriert.",
    detailPaused:
      "Du hast die Karte verschoben, also bewege ich sie nicht mehr. Tippe auf Fortsetzen, um zum Fahrzeug zurückzukehren.",
    detailStaleUnknown: "Das Fahrzeug übermittelt seit einer Weile keine Position mehr.",
    detailStale: (age: string): string =>
      `Das Fahrzeug sendet seit ${age} nicht mehr: das auf der Karte ist der letzte bekannte Punkt.`,
    detailLost:
      "Ich empfange seine Position nicht mehr. Es kann die Fahrt beendet haben oder aus dem Betrieb sein.",
    ageMinutes: (minutes: number): string => `${minutes} ${plural(minutes, "Minute", "Minuten")}`,
    ageHours: (hours: number): string => (hours === 1 ? "eine Stunde" : `${hours} Stunden`),
    compact: "Ich folge",
    compactSr: (line: string): string => ` der Linie ${line}`,
    lineSr: (line: string): string => `, Linie ${line}`,
    resume: "Fortsetzen",
    exit: "Beenden",
    close: "Schließen",
    lostHint: "Wenn es noch unterwegs ist, findest du es unter „Alle Linien“.",
  },

  nearby: {
    title: "Haltestellen in der Nähe",
    mapAria: "Karte der Haltestellen in der Nähe",
    searchHere: "In diesem Bereich suchen",
    radius: "Umkreis",
    locating: "Wird geortet…",
    myPosition: "Meine Position",
    geoDenied:
      "Standortfreigabe verweigert. Wir zeigen das Zentrum von Rom: verschiebe die Karte und suche in diesem Bereich.",
    geoUnavailable:
      "Position im Moment nicht verfügbar. Wir zeigen das Zentrum von Rom: verschiebe die Karte und suche in diesem Bereich.",
    geoTimeout:
      "Die Ortung hat zu lange gedauert. Wir zeigen das Zentrum von Rom: verschiebe die Karte und versuche es erneut.",
    geoUnsupported:
      "Dieser Browser unterstützt keine Standortbestimmung. Verschiebe die Karte, um Haltestellen zu suchen.",
    outsideRome: "Du bist außerhalb des Gebiets von Rom: wir zeigen das Stadtzentrum.",
    outsideCoverage:
      "Dieser Bereich liegt außerhalb des abgedeckten Gebiets. Verschiebe die Karte nach Rom.",
    focusStopMissing: "Angeforderte Haltestelle nicht gefunden: wir zeigen deinen Bereich.",
    focusStopFailed: (error: string): string =>
      `Angeforderte Haltestelle nicht geladen (${error}).`,
    stopsFailed: (error: string): string => `Haltestellen nicht geladen: ${error}`,
    loadingStops: "Suche die Haltestellen…",
    noStopsInRadius: (radius: string): string =>
      `Keine Haltestelle innerhalb von ${radius}. Vergrößere den Umkreis oder verschiebe die Karte.`,
    onMapCap: (max: number): string => ` (die ersten ${max} auf der Karte)`,
    noLines: "Keine Linie",
    arrivalsLink: "Abfahrten",
    showMoreStops: "Weitere Haltestellen anzeigen",
  },

  line: {
    loading: "Lade die Linie…",
    loadFailed: (error: string): string => `Linie nicht geladen: ${error}`,
    mapAria: (name: string): string => `Karte der Linie ${name}`,
    dataAt: (clock: string): string => `Daten von ${clock}`,
    updatedAt: (clock: string): string => `aktualisiert um ${clock}`,
    vehiclesStale: (error: string): string => `Fahrzeuge nicht aktualisiert: ${error}`,
    noPathForDirection: "Streckenverlauf für diese Richtung nicht verfügbar",
    stopsHeading: (count: number): string => `Haltestellen (${count})`,
    noStopsForDirection: "Keine Haltestelle für diese Richtung verfügbar.",
    showAllStops: "Alle Haltestellen anzeigen",
  },

  lineService: {
    inService: (count: number): string =>
      `${counted(count, "Fahrzeug", "Fahrzeuge")} auf der Linie`,
    loadingVehicles: "Lade die Fahrzeuge…",
    checkingTimetable: "Prüfe den Fahrplan…",
    feedDownTitle: "Echtzeitpositionen nicht verfügbar",
    feedDownDetail:
      "Der Betrieb kann normal laufen: wir können die Position der Fahrzeuge nicht auslesen.",
    noneReporting: "Kein Fahrzeug meldet seine Position",
    unknownDetail:
      "Das heißt nicht, dass die Linie nicht fährt: die Fahrplanzeiten stehen auf der Seite einer Haltestelle.",
    scheduledDetail: (count: number): string =>
      `Der Betrieb ist geplant: ${count} ${plural(count, "vorgesehene Fahrt", "vorgesehene Fahrten")} von jetzt bis zum Tagesende.`,
    finishedTitle: "Betrieb für heute beendet",
    finishedDetail: (count: number, clock: string): string =>
      `Heute ${counted(count, "geplante Fahrt", "geplante Fahrten")}, die letzte um ${clock}.`,
    noneTodayTitle: "Heute keine geplante Fahrt",
    noneTodayDetail: "Auf dieser Linie gibt es heute keine Fahrt nach Fahrplan.",
    noneTodayFrom: (stopName: string): string =>
      `Ab ${stopName} gibt es heute keine Fahrt nach Fahrplan.`,
    nextDepartures: "Nächste Abfahrten",
    nextDeparturesFrom: (stopName: string): string => ` ab ${stopName}`,
    scheduledOnly: "Fahrplanzeiten, ohne Echtzeit.",
  },

  journey: {
    title: "Verbindung",
    subtitle: "Von A nach B in Rom mit Bus, Tram und Metro.",
    from: "Start",
    to: "Ziel",
    placeholder: "Haltestelle, Adresse oder Ort",
    swap: "Tauschen",
    whenLegend: "Wann",
    now: "Jetzt",
    pickTime: "Uhrzeit wählen",
    timeLabel: "Datum und Uhrzeit der Abfahrt",
    submit: "Verbindung suchen",
    resultsHeading: "Verbindungen",
    emptyTitle: "Wohin möchtest du?",
    emptyHint:
      "Gib Start und Ziel ein: wir suchen die beste Verbindung anhand der offiziellen Fahrpläne.",
    searching: "Suche die Verbindungen…",
    noResultsTitle: "Keine Verbindung",
    noResultsHint:
      "Wir suchen nur direkte Verbindungen oder solche mit einem Umstieg. Verschiebe den Start oder die Uhrzeit.",
    disclaimer:
      "Fahrplanzeiten, nicht in Echtzeit: tatsächliche Verspätungen sind nicht berücksichtigt. Fußwege sind in Luftlinie geschätzt, die reale Strecke auf der Straße ist also länger.",
    searchedFrom: (when: string): string => ` Suche ab ${when}.`,
    mapAria: "Karte der ausgewählten Verbindung",
    mapCaption:
      "Die Abschnitte im Fahrzeug folgen dem echten Linienverlauf. Die gestrichelten sind in Luftlinie geschätzt: die Fußwege beim Umsteigen und die seltenen Linien ohne Streckenverlauf.",
    missingEndpoints: "Gib sowohl Start als auch Ziel an.",
    badDateTime: "Datum und Uhrzeit ungültig.",
    geoUnsupported: "Dieser Browser unterstützt keine Standortbestimmung.",
    geoUnavailable: "Position im Moment nicht verfügbar.",
    geoOutsideRome: "Du bist außerhalb des Gebiets von Rom: gib eine Adresse ein.",
    geoDenied: "Standortfreigabe verweigert: gib eine Adresse ein.",
    geoTimeout: "Die Ortung hat zu lange gedauert.",
    originMarker: (name: string): string => `Start: ${name}`,
    destinationMarker: (name: string): string => `Ziel: ${name}`,
    useMyPosition: "Meine Position verwenden",
    clearField: (label: string): string => `${label} leeren`,
    suggestionsFor: (label: string): string => `Vorschläge für ${label.toLowerCase()}`,
    placeStop: "Haltestelle",
    placeCoord: "Koordinaten",
    placeAddress: "Adresse",
    walkOnly: "Nur zu Fuß",
    walkOnlyShort: "zu Fuß",
    noTransfers: "ohne Umstieg",
    transfers: (count: number): string => `${counted(count, "Umstieg", "Umstiege")}`,
    walkDistance: (distance: string): string => `${distance} zu Fuß`,
    walkLeg: (distance: string, duration: string): string =>
      `Zu Fuß ${distance}, etwa ${duration} bis `,
    inService: "im Betrieb",
    stopCount: (count: number): string => counted(count, "Haltestelle", "Haltestellen"),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Verbindung ${index}: Abfahrt ${departure}, Ankunft ${arrival}`,
    lineDetailsAria: (line: string): string => `Linie ${line}, Details`,
    hours: (hours: number): string => `${hours} Std`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} Std ${minutes}`,
    noticeNoOriginStops:
      "Keine Haltestelle zu Fuß vom Startpunkt erreichbar: versuche eine Adresse näher an einer Linie.",
    noticeNoDestinationStops:
      "Keine Haltestelle zu Fuß vom Ziel erreichbar: versuche eine Adresse näher an einer Linie.",
    noticeNoConnection:
      "In den nächsten Stunden keine Verbindung zwischen diesen beiden Gegenden gefunden.",
    noticeWalkOnlyLeft:
      "In den nächsten Stunden keine Verbindung im Fahrplan: es bleibt nur der Fußweg.",
    noticeLaterDepartures:
      "In den nächsten anderthalb Stunden ist nichts geplant: wir zeigen die ersten Fahrten danach.",
  },

  alerts: {
    title: "Betriebsmeldungen",
    subtitle: "Umleitungen, Ausfälle und Änderungen aus dem offiziellen Feed.",
    loading: "Wird geladen…",
    degraded:
      "Der Echtzeit-Feed antwortet nicht oder ist alt: diese Meldungen sind womöglich nicht aktuell.",
    loadFailed: "Meldungen konnten nicht geladen werden.",
    refreshFailed: (error: string): string =>
      `Letzte Aktualisierung fehlgeschlagen (${error}): du siehst die vorherige Liste.`,
    searchPlaceholder: "Suche: Streik, Umleitung, Straße…",
    searchAria: "In den Meldungen suchen",
    filterByLine: "Nach Linie filtern",
    allLines: (count: number): string => `Alle Linien (${count})`,
    networkWide: "Allgemeine Meldungen",
    clearFilters: "Zurücksetzen",
    noMatch: "Keine Meldung passt zu den Filtern.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${plural(shown, "Meldung", "Meldungen")} von ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${plural(count, "aktive Meldung", "aktive Meldungen")} auf ${lines} Linien.`,
    goToLine: "Zur Linie",
    noneTitle: "Keine aktive Meldung",
    noneHint:
      "Im Moment meldet der Feed keine Störung und keine Änderung des Betriebs. Prüfe es vor der Abfahrt noch einmal.",
    noResultsTitle: "Kein Ergebnis",
    noResultsHint:
      "Versuche es mit weniger Wörtern, oder setze die Filter zurück, um alle Meldungen zu sehen.",
    noSelectionTitle: "Keine Meldung ausgewählt",
    noSelectionHint: "Wähle links eine Meldung aus der Liste, um sie ganz zu lesen.",
    showMoreLines: (count: number): string => `Weitere Linien anzeigen (${count})`,
    goToLineShort: "zur Linie",
    fallbackHeader: "Betriebsmeldung",
    noDetail: "Kein Detail vom Betreiber veröffentlicht.",
    operatorLink: "Details auf der Website des Betreibers",
    affectedLines: "Betroffene Linien",
    alsoOn: "Auch auf",
    contextHeading: (count: number): string =>
      `${count} ${plural(count, "aktive Meldung", "aktive Meldungen")}`,
    contextAria: "Betriebsmeldungen",
    contextAll: "Alle",
    contextUnavailable: (error: string): string => `Meldungen nicht verfügbar: ${error}`,
    contextMore: (count: number): string => `${count} weitere Meldungen auf der `,
    contextMoreLink: "Meldungsseite",
    contextStale: (error: string): string =>
      `Letzte Aktualisierung fehlgeschlagen (${error}): diese Meldungen könnten überholt sein.`,
    windowBetween: (from: string, until: string): string => `Vom ${from} bis ${until}`,
    windowFrom: (from: string): string => `Ab ${from}, ohne angegebenes Ende`,
    windowUntil: (until: string): string => `Bis ${until}`,
    windowUnknown: "Gültigkeitszeitraum nicht angegeben",
    effect: (code: string): string | null => EFFECT_DE[code] ?? null,
    cause: (code: string): string | null => CAUSE_DE[code] ?? null,
  },

  settings: {
    title: "Einstellungen",
    subtitle: "Alles bleibt auf diesem Gerät. Kein Konto, kein Server.",
    sectionArrivals: "Abfahrten",
    autoRefresh: "Automatische Aktualisierung",
    everySeconds: (seconds: number): string => `alle ${seconds} Sekunden`,
    autoRefreshHint: "Abstand zwischen zwei Abfragen des Echtzeit-Feeds.",
    maxArrivals: "Angezeigte Abfahrten pro Haltestelle",
    showScheduled: "Fahrplanzeiten anzeigen",
    showScheduledHint:
      "Wenn die Echtzeit für eine Haltestelle nichts hat, den Fahrplan verwenden.",
    sectionNearby: "In meiner Nähe",
    radius: "Suchradius",
    radiusHint:
      "Gilt auch für die Schnellradien auf der Karte der Haltestellen in der Nähe.",
    sectionAppearance: "Darstellung",
    themeLegend: "Design",
    themeSystem: "System",
    themeLight: "Hell",
    themeDark: "Dunkel",
    sectionLanguage: "Sprache",
    languageLegend: "Sprache der Oberfläche",
    languageSystem: "System",
    languageHint: (resolved: string): string =>
      `Mit „System“ folgen wir der Browsersprache: gerade ist das ${resolved}.`,
    sectionBackup: "Sicherung der Favoriten",
    backupIntro:
      "Eine JSON-Datei auf deinem Gerät: so bringst du die Favoriten in einen anderen Browser, denn hier gibt es kein Konto.",
    exportCount: (count: number): string => `Exportieren (${count})`,
    importFromFile: "Aus Datei importieren",
    exported: (count: number): string => `${count} Favoriten exportiert.`,
    exportFailed: "Der Export hat in diesem Browser nicht funktioniert.",
    fileTooLarge: "Die Datei ist zu groß für eine Sicherung der Favoriten.",
    fileUnreadable: "Die Datei konnte nicht gelesen werden.",
    importEmpty: "Die Datei ist leer.",
    importNotJson: "Die Datei ist kein gültiges JSON.",
    importNoList: "Die Datei enthält keine Liste von Favoriten.",
    importNoneValid: "Kein gültiger Favorit in der Datei gefunden.",
    importFound: (count: number): string => `${count} gültige Favoriten gefunden`,
    importSkipped: (count: number): string => `, ${count} Einträge verworfen.`,
    importFoundEnd: ".",
    importMerge: "Zusammenführen",
    importReplace: "Ersetzen",
    replaced: (count: number): string => `Favoriten ersetzt: jetzt sind es ${count}.`,
    mergedNone: "Kein neuer Favorit zum Hinzufügen.",
    merged: (count: number): string => `${count} Favoriten hinzugefügt.`,
    sectionLocalData: "Lokale Daten",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} Favoriten, ${recents} Haltestellen im Verlauf.`,
    confirmClearFavorites: "Alle Favoriten löschen? Das lässt sich nicht rückgängig machen.",
    confirmClearFavoritesYes: "Ja, leeren",
    clearFavorites: "Favoriten leeren",
    favoritesCleared: "Favoriten geleert.",
    confirmClearRecents: "Den Verlauf der angesehenen Haltestellen löschen?",
    confirmClearRecentsYes: "Ja, löschen",
    clearRecents: "Verlauf löschen",
    recentsCleared: "Verlauf gelöscht.",
    resetDefaults: "Standardeinstellungen wiederherstellen",
    settingsReset: "Einstellungen auf die Standardwerte zurückgesetzt.",
    infoLink: "Informationen, Datenquellen und häufige Fragen",
  },

  sync: {
    titleFull: "Geräte synchronisieren",
    titleCollapsed: "Synchronisierung",
    badgeOn: "aktiv",
    summaryLoading: "…",
    summaryUnavailable: "Über diese Verbindung nicht verfügbar",
    summaryOff: "Nicht aktiv",
    summarySyncing: "Synchronisierung läuft…",
    summaryError: "Fehler bei der Synchronisierung",
    summaryConflict: "Konflikt zu lösen",
    summaryOn: (last: string): string => `Aktiv · zuletzt ${last}`,
    intro:
      "Bringe Favoriten, zuletzt Angesehenes und Einstellungen mit einem Code auf ein anderes Gerät. Die Daten werden hier verschlüsselt: der Server speichert nur Unlesbares.",
    enable: "Synchronisierung aktivieren",
    haveCode: "Ich habe schon einen Code",
    codeLabel: "Synchronisierungscode",
    codeHint:
      "20 Zeichen, so wie du sie auf dem anderen Gerät liest. Groß- und Kleinschreibung, Bindestriche und Leerzeichen zählen nicht.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} Zeichen`,
    join: "Verbinden",
    onIntro:
      "Die Daten werden auf diesem Gerät verschlüsselt, bevor sie es verlassen. Wer den Code hat, kann alle deine Favoriten lesen: nutze ihn nur auf deinen eigenen Geräten.",
    code: "Code",
    showCode: "Code anzeigen",
    hideCode: "Code verbergen",
    copyCode: "Code kopieren",
    copied: "Kopiert",
    lastSync: "Letzte Synchronisierung:",
    inProgress: " · läuft…",
    syncNow: "Jetzt synchronisieren",
    disconnect: "Trennen",
    disconnectNote:
      "Beim Trennen bleiben die Daten auf diesem Gerät, und die verschlüsselte Kopie bleibt auf dem Server, bis du sie löschst.",
    deleteWarning:
      "Löscht die verschlüsselte Kopie vom Server. Die anderen Geräte finden dann nichts mehr zum Synchronisieren. Das lässt sich nicht rückgängig machen.",
    deleteConfirm: "Wirklich löschen",
    deleteRemote: "Daten vom Server löschen",
    justNow: "jetzt",
    minutesAgo: (minutes: number): string => `vor ${minutes} Min`,
    atClock: (clock: string): string => `um ${clock}`,
    errors: {
      aborted: "Vorgang abgebrochen.",
      generic: "Synchronisierung fehlgeschlagen. Versuche es gleich noch einmal.",
      insecureContext:
        "Die Synchronisierung braucht eine sichere Verbindung: öffne die Seite über https (oder auf localhost). Über einfaches http schalten Browser die Verschlüsselung ab, und dann lässt sich auf diesem Gerät nichts verschlüsseln.",
      noBase64Encode: "Dieser Browser kann die Synchronisierungsdaten nicht kodieren.",
      noBase64Decode: "Dieser Browser kann die Synchronisierungsdaten nicht dekodieren.",
      invalidSyncData: (what: string): string => `Ungültige Synchronisierungsdaten (${what}).`,
      codeRequired: "Gib den Synchronisierungscode ein.",
      codeTooLong: (max: number): string =>
        `Dieser Code ist zu lang: es sollten ${max} Zeichen sein.`,
      codeInvalidChars: (chars: string): string =>
        `Der Code enthält unzulässige Zeichen: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Der Code hat ${required} Zeichen, du hast ${actual} eingegeben.`,
      keyDerivationFailed: "Dieser Browser kann die Synchronisierungsschlüssel nicht ableiten.",
      preparePayloadFailed: "Die zu synchronisierenden Daten konnten nicht vorbereitet werden.",
      encryptFailed: "Die Daten konnten auf diesem Gerät nicht verschlüsselt werden.",
      decryptFailed:
        "Der Code passt nicht zu diesen Daten, oder die Daten auf dem Server sind beschädigt.",
      invalidSyncId: "Ungültige Synchronisierungskennung.",
      responseTooLarge: "Der Server hat mit zu vielen Daten geantwortet.",
      timeout: "Der Server hat nicht rechtzeitig geantwortet.",
      unreachable: "Server nicht erreichbar. Prüfe deine Verbindung.",
      invalidResponse: "Ungültige Antwort vom Server.",
      invalidResponseField: (what: string): string => `Ungültige Antwort vom Server (${what}).`,
      unexpectedFormat: "Der Server hat in einem unerwarteten Format geantwortet.",
      rateLimited:
        "Zu viele Synchronisierungen hintereinander. Versuche es in einer Minute noch einmal.",
      pullRejected: (status: number): string =>
        `Der Server hat das Lesen abgelehnt (Fehler ${status}).`,
      payloadTooLarge: "Es sind zu viele Daten zum Synchronisieren.",
      pushRejected: (status: number): string =>
        `Der Server hat das Speichern abgelehnt (Fehler ${status}).`,
      deleteRejected: (status: number): string =>
        `Der Server hat das Löschen abgelehnt (Fehler ${status}).`,
      conflict:
        "Ein anderes Gerät schreibt gerade in dieselben Daten. Deine lokalen Daten sind sicher: versuche es in ein paar Sekunden noch einmal.",
    },
    status: {
      deleted: "Daten vom Server entfernt. Dieses Gerät synchronisiert nicht mehr.",
      disconnected:
        "Die Synchronisierung ist auf diesem Gerät aus. Deine Daten bleiben hier, und die verschlüsselte Kopie bleibt auf dem Server, bis du sie löschst.",
    },
  },

  info: {
    title: "Informationen",
    subtitle:
      "Fahrpläne und Abfahrten des öffentlichen Nahverkehrs in Rom, aus den offiziellen offenen Daten.",
    unofficialTitle: "Inoffizielle App",
    unofficialBody:
      "Diese Website ist in keiner Weise mit ATAC S.p.A., Roma Servizi per la Mobilità oder Roma Capitale verbunden, von ihnen genehmigt oder unterstützt. Es ist ein unabhängiges Projekt, das lediglich die offenen Daten liest, die diese Stellen veröffentlichen. Für offizielle Auskünfte, Fahrscheine und Beschwerden wende dich an ihre Kanäle.",
    whatTitle: "Was das ist",
    whatBody1:
      "Eine Web-App, um zu sehen, in wie vielen Minuten das nächste Fahrzeug an deiner Haltestelle kommt. Du suchst eine Haltestelle oder eine Linie, speicherst sie in den Favoriten und findest sie auf der Startseite mit aktuellen Abfahrten wieder. Kein Konto, keine Werbung, keine Nutzungsstatistiken.",
    whatBody2:
      "Wenn der Echtzeit-Feed die Fahrt abdeckt, ist die angezeigte Zeit eine Prognose auf Basis der Fahrzeugposition. Sonst greift die App auf die Fahrplanzeit zurück und sagt es dir immer, statt einen alten Wert als Prognose auszugeben.",
    dataTitle: "Woher die Daten kommen",
    dataBodyBefore:
      "Fahrpläne, Haltestellen, Linien, Streckenverläufe, Fahrzeugpositionen und Betriebsmeldungen stammen aus den offenen Daten von ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS- und GTFS-Realtime-Feeds). Die Fahrplanzeiten werden täglich aktualisiert, die Echtzeit etwa alle 30 Sekunden.",
    dataLink: "romamobilita.it — Offene Daten",
    dataLicence:
      "Die Daten bleiben Eigentum der jeweiligen Inhaber und werden zu den Bedingungen der Lizenz genutzt, unter der sie veröffentlicht werden.",
    privacyTitle: "Datenschutz",
    privacyBody:
      "Es gibt keine Anmeldung und kein Nutzerprofil. Favoriten, zuletzt angesehene Haltestellen und Einstellungen werden nur in deinem Browser gespeichert und nirgendwohin gesendet. Der Standort bleibt, wenn du ihn für die Suche nach Haltestellen in der Nähe freigibst, auf dem Gerät: er dient der Entfernungsberechnung und wird nicht gespeichert.",
    faqTitle: "Häufige Fragen",
    faq1Q: "Warum erscheint eine Linie oder ein Bus nicht?",
    faq1A:
      "Wir zeigen nur, was in den offiziellen Feeds steht. Wenn ein Fahrzeug seine Position nicht sendet oder seine Fahrt nicht im Echtzeit-Feed steht, existiert es für uns nicht: höchstens siehst du die Fahrplanzeit. Das passiert oft bei Ersatzfahrten, Shuttlebussen und Fahrzeugen mit defektem Ortungsgerät.",
    faq2Q: "Warum weichen die Zeiten von denen am Haltestellenschild ab?",
    faq2A:
      "Das Schild am Mast nennt die Fahrplanzeit, die sich nur wenige Male im Jahr ändert. Hier siehst du, wenn das Fahrzeug sendet, die Prognose aus seiner echten Position, die Verkehr und Verspätungen berücksichtigt. Wenn dagegen „laut Fahrplan“ steht, gibt es keine Prognose und wir zeigen dieselbe Zeit wie das Schild.",
    faq3Q: "Was passiert nachts?",
    faq3A:
      "Nachts ist der Echtzeit-Feed fast leer, weil kaum Fahrzeuge unterwegs sind. Die App funktioniert weiter mit den Fahrplanzeiten der Nachtlinien. Im GTFS endet der Betriebstag nicht um Mitternacht, sondern um 04:00: eine Fahrt um ein Uhr nachts gehört noch zum Vortag, und deshalb kannst du Zeiten wie 25:30 sehen, die zu 01:30 werden.",
    faq4Q: "Landen meine Favoriten auf einem Server?",
    faq4A:
      "Nein. Favoriten, Verlauf und Einstellungen liegen im localStorage des Browsers. Wenn du die Websitedaten löschst oder das Gerät wechselst, sind sie weg: in den Einstellungen kannst du sie in eine JSON-Datei exportieren und anderswo wieder importieren.",
    settingsLink: "Zu den Einstellungen",
  },

  footer: {
    dataPrefix: "Betriebsdaten und Fahrpläne: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (offene GTFS-Daten).",
    independent:
      "Unabhängiges Projekt, nicht mit ATAC oder Roma Servizi per la Mobilità verbunden. ",
    infoLink: "Informationen",
  },

  errors: {
    genericTitle: "Etwas hat nicht funktioniert",
    unexpected: "Unerwarteter Fehler",
    unexpectedDot: "Unerwarteter Fehler.",
    stopNotFound: "Haltestelle nicht gefunden",
    serviceDown: "Der Dienst antwortet nicht",
    requestFailed: (status: number): string => `Anfrage fehlgeschlagen (${status})`,
    httpStatus: (status: number): string => `Fehler ${status}`,
    badResponse: "Ungültige Antwort vom Server",
    badResponseDot: "Ungültige Antwort vom Server.",
    timedOut: "Zeitüberschreitung der Anfrage",
    timedOutDot: "Zeitüberschreitung der Anfrage.",
    offline: "Keine Verbindung",
    connectionFailed: "Verbindung fehlgeschlagen.",
    tooManyRequests: "Zu viele Anfragen",
    badRequest: "Ungültige Parameter",
    lineNotFound: "Linie nicht gefunden",
    journeyOriginNotFound: "Startpunkt nicht gefunden",
    journeyDestinationNotFound: "Ziel nicht gefunden",
    journeyPlaceHint: "Versuche es mit einer genaueren Adresse.",
  },

  notFound: {
    kicker: "Fehler 404",
    title: "Haltestelle nicht bedient",
    body:
      "Diese Seite gibt es nicht. Das kann bei einem alten Link passieren, oder bei der Nummer einer Haltestelle oder Linie, die nicht mehr im Feed steht.",
    searchCta: "Eine Haltestelle suchen",
    nearbyCta: "Haltestellen in der Nähe",
  },

  appError: {
    title: "Fahrt unterbrochen",
    body:
      "Diese Ansicht konnte nicht geladen werden. Versuche es erneut: bleibt das Problem, antwortet wahrscheinlich der Datendienst nicht.",
    digest: (digest: string): string => `Code: ${digest}`,
    backHome: "Zurück zur Startseite",
    globalTitle: "Betrieb eingestellt",
    globalBody:
      "Die Anwendung ist wegen eines unerwarteten Fehlers stehen geblieben. Lade die Seite neu: deine Favoriten bleiben auf dem Telefon gespeichert und gehen nicht verloren.",
    reload: "Neu laden",
  },

  format: {
    due: "kommt gleich",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "Datum nicht verfügbar",
    minutes: (minutes: number): string => `${minutes} Min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "Aktualisierung unbekannt",
    ageSeconds: (seconds: number): string => `vor ${seconds} s aktualisiert`,
    ageMinutes: (minutes: number): string => `vor ${minutes} Min aktualisiert`,
    ageAt: (clock: string): string => `um ${clock} aktualisiert`,
    onTime: "pünktlich",
    delayLate: (minutes: number): string => `+${minutes} Min`,
    delayEarly: (minutes: number): string => `${minutes} Min`,
  },

  meta: {
    appTitle: "BusFinder — Abfahrten in Echtzeit",
    appDescription:
      "Fahrpläne und Echtzeit-Abfahrten von Bus, Tram und Metro in Rom. Favoriten, Haltestellen in der Nähe und Betriebsmeldungen, ohne Konto und ohne Werbung.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Die ATAC-Haltestellen in deiner Nähe, mit Karte und den Linien, die dort halten.",
    journeyDescription:
      "Berechne die Verbindung von einem Punkt Roms zum anderen mit Bus, Tram und Metro, nach den offiziellen ATAC-Fahrplänen.",
    alertsDescription:
      "Umleitungen, Ausfälle und Änderungen im Betrieb aus dem offiziellen Feed.",
    settingsDescription:
      "Aktualisierung der Abfahrten, Suchradius, Design und Verwaltung der Favoriten.",
    infoDescription:
      "Was diese App ist, woher die Daten kommen und warum sie nicht mit ATAC oder Roma Servizi per la Mobilità verbunden ist.",
    stopDescription: "Nächste Abfahrten in Echtzeit und Fahrplanzeiten der Haltestelle.",
    lineDescription: "Streckenverlauf, Haltestellen und Fahrzeuge der Linie in Echtzeit.",
  },

  skeleton: {
    loading: "Wird geladen",
  },
};

const EFFECT_DE: Record<string, string | undefined> = {
  NO_SERVICE: "Betrieb eingestellt",
  REDUCED_SERVICE: "Eingeschränkter Betrieb",
  SIGNIFICANT_DELAYS: "Erhebliche Verspätungen",
  DETOUR: "Umleitung",
  ADDITIONAL_SERVICE: "Zusätzlicher Betrieb",
  MODIFIED_SERVICE: "Geänderter Betrieb",
  STOP_MOVED: "Haltestelle verlegt",
  NO_EFFECT: "Keine Auswirkung auf den Betrieb",
  ACCESSIBILITY_ISSUE: "Problem mit der Barrierefreiheit",
  OTHER_EFFECT: "Sonstiges",
  UNKNOWN_EFFECT: "Auswirkung nicht angegeben",
};

const CAUSE_DE: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Technische Störung",
  STRIKE: "Streik",
  DEMONSTRATION: "Demonstration",
  ACCIDENT: "Unfall",
  HOLIDAY: "Feiertag",
  WEATHER: "Unwetter",
  MAINTENANCE: "Wartung",
  CONSTRUCTION: "Bauarbeiten",
  POLICE_ACTIVITY: "Polizeieinsatz",
  MEDICAL_EMERGENCY: "Medizinischer Notfall",
  OTHER_CAUSE: "Andere Ursache",
  UNKNOWN_CAUSE: "Ursache nicht angegeben",
};
