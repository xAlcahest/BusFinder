/**
 * Polish dictionary. Shape and key order follow it.ts, the source of truth.
 * Polish has one/few/many, so the plurals go through CLDR.
 */

import type { Dictionary } from "./it";
import { pluralRules } from "./plural";

const { pick, count: n } = pluralRules("pl");

export const pl: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, strona główna",
  },

  a11y: {
    skipToContent: "Przejdź do treści",
  },

  common: {
    retry: "Spróbuj ponownie",
    cancel: "Anuluj",
    save: "Zapisz",
    close: "Zamknij",
    home: "Start",
    back: "Wstecz",
    all: "Wszystkie",
    loading: "Wczytywanie…",
    searching: "Szukam…",
    refresh: "Odśwież",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Wyczyść wyszukiwanie",
    searchInProgress: "Trwa wyszukiwanie",
  },

  nav: {
    primary: "Nawigacja główna",
    sidebar: "Panel boczny",
    sidebarNav: "Nawigacja boczna",
    openMenu: "Otwórz menu",
    closeMenu: "Zamknij menu",
    sections: "Sekcje",
    shortcuts: "Skróty",
    infoAria: "Informacje o aplikacji",
    home: "Start",
    nearbyShort: "W pobliżu",
    nearby: "Przystanki w pobliżu",
    journey: "Trasa",
    alerts: "Komunikaty",
    settings: "Ustawienia",
    info: "Info",
    hintNearby: "Co jeździ tu w pobliżu",
    hintJourney: "Z punktu do punktu",
    hintAlerts: "Objazdy i utrudnienia",
    hintSettings: "Odświeżanie, motyw, dane",
    hintInfo: "Źródła i informacje prawne",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tramwaj";
        case 1:
          return "metro";
        case 2:
          return "pociąg";
        case 4:
          return "prom";
        default:
          return "autobus";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tramwaj";
        case 1:
          return "Metro";
        case 2:
          return "Pociąg";
        case 3:
          return "Autobus";
        default:
          return "Linia";
      }
    },
    named: (name: string): string => `Linia ${name}`,
    namedAria: (name: string): string => `Linia ${name}`,
    details: "szczegóły",
    towards: (headsign: string): string => `w kierunku ${headsign}`,
    towardsCapital: (headsign: string): string => `W kierunku ${headsign}`,
    direction: "Kierunek",
    terminus: "pętla",
    noHeadsign: "Kierunek nieokreślony",
  },

  stops: {
    code: (code: string): string => `Przystanek ${code}`,
    codeOnly: "Przystanek",
    pole: (code: string): string => `Słupek ${code}`,
    accessible: "Przystanek dostępny",
    named: (name: string): string => `Przystanek ${name}`,
    countLabel: (count: number): string =>
      n(count, { one: "przystanek", few: "przystanki", other: "przystanków" }),
    involved: (count: number): string =>
      n(count, {
        one: "przystanek objęty zmianą",
        few: "przystanki objęte zmianą",
        other: "przystanków objętych zmianą",
      }),
  },

  home: {
    kicker: "Rzym · transport publiczny",
    title: "Kiedy przyjedzie?",
    intro:
      "Wyszukaj przystanek po numerze lub nazwie, albo linię. Odjazdy pochodzą z rzymskiego strumienia danych w czasie rzeczywistym.",
  },

  search: {
    inputAria: "Szukaj przystanku lub linii",
    placeholder: "Przystanek, ulica lub linia",
    searchingFor: (query: string): string => `Szukam „${query}”…`,
    noResultsFor: (query: string): string => `Brak wyników dla „${query}”`,
    noResultsHint:
      "Spróbuj z numerem przystanku (na przykład 70101), nazwą ulicy albo numerem linii.",
    resultsList: "Wyniki wyszukiwania",
    keyboardHint: "↑ ↓ aby przewijać, Enter aby otworzyć, Esc aby zamknąć",
  },

  favorites: {
    heading: "Ulubione",
    emptyTitle: "Jeszcze nie ma ulubionych",
    emptyHint:
      "Dotknij gwiazdki ★ obok przystanku lub linii: w wyszukiwarce, w Przystankach w pobliżu, na stronie przystanku albo linii. Znajdziesz je tutaj, bez szukania za każdym razem.",
    reorder: "Zmień kolejność",
    reorderDone: "Gotowe",
    reorderHint: "Przesuwaj przystanki strzałkami. Kolejność obowiązuje na tym urządzeniu.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: pozycja ${position} z ${total}.`,
    moveUp: (name: string): string => `Przesuń ${name} w górę`,
    moveDown: (name: string): string => `Przesuń ${name} w dół`,
    addStar: (name: string): string => `Dodaj gwiazdkę do przystanku ${name}`,
    removeStar: (name: string): string => `Usuń gwiazdkę z przystanku ${name}`,
    addStarLine: (name: string): string => `Dodaj gwiazdkę do linii ${name}`,
    removeStarLine: (name: string): string => `Usuń gwiazdkę z linii ${name}`,
    starredTitle: "Z gwiazdką: jest w ulubionych",
    starTitle: "Dodaj gwiazdkę",
    starredLabel: "Z gwiazdką",
    starLabel: "Gwiazdka",
    editLabels: (name: string): string => `Edytuj etykietę i linie dla ${name}`,
    onlyLines: (labels: string): string => `tylko ${labels}`,
    notUpdated: "nieaktualne",
    noArrivalsOnPinned: "Brak odjazdów na wybranych liniach.",
    changeLines: "Zmień linie",
    noArrivalsSoon: "Brak odjazdów w najbliższych minutach.",
    openForTimes: "Otwórz, aby zobaczyć godziny",
    vehiclesUnavailable: "Pojazdy niedostępne",
    lookingForVehicles: "Szukam pojazdów w ruchu…",
    noVehiclesNow: "Teraz żaden pojazd nie jest w ruchu",
    vehiclesInService: (count: number): string =>
      `${n(count, { one: "pojazd", few: "pojazdy", other: "pojazdów" })} teraz w ruchu`,
    refreshArrivals: "Odśwież odjazdy",
    undoRemovedStop: "Przystanek bez gwiazdki: nie ma go już w ulubionych.",
    undoRemovedLine: "Linia bez gwiazdki: nie ma jej już w ulubionych.",
    undoDismiss: "Zamknij powiadomienie",
    more: (count: number): string => `Jeszcze ${count} ulubionych`,
    sidebarEmptyBefore: "Dotknij gwiazdki obok przystanku lub linii, w wyszukiwarce, w ",
    sidebarEmptyAfter: " albo na stronie, którą właśnie oglądasz. Znajdziesz je tutaj.",
    nextDeparture: "najbliższy odjazd",
    noDeparture: "brak dostępnych odjazdów",
    notAvailableShort: "b.d.",
  },

  recents: {
    heading: "Ostatnio oglądane",
    clear: "Wyczyść",
    emptyTitle: "Brak ostatnich przystanków",
    emptyHint:
      "Przystanki, które otwierasz, zostają tu przez kilka dni, żebyś znalazł je bez ponownego szukania.",
    listAria: "Ostatnio oglądane przystanki",
    justNow: "przed chwilą",
    today: "dzisiaj",
    yesterday: "wczoraj",
  },

  arrivals: {
    due: "wjeżdża",
    live: "na żywo",
    scheduled: "wg rozkładu",
    scheduledTail: " wg rozkładu",
    scheduledSr: "godzina rozkładowa",
    onTime: "punktualnie",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "opóźnienia",
    earlySuffix: "przed czasem",
    lateSr: (minutes: number): string =>
      `${n(minutes, { one: "minuta", few: "minuty", other: "minut" })} opóźnienia`,
    earlySr: (minutes: number): string =>
      `${n(minutes, { one: "minuta", few: "minuty", other: "minut" })} przed czasem`,
    skipped: "odwołany",
    skippedSr: "kurs odwołany",
    atClock: (clock: string): string => `o ${clock}`,
    towardsSr: (headsign: string): string => `kierunek ${headsign}`,
    loadingAria: "Wczytywanie odjazdów",
    emptyTitle: "Brak przewidzianych odjazdów",
    emptyHint:
      "Żaden kurs się nie zbliża. Sprawdź rozkład jazdy albo spróbuj za chwilę.",
    frozenUnknown: "prognoza nieaktualna",
    frozenFor: (minutes: number): string => `stoi od ${minutes} min`,
    frozenPrefix: (state: string): string => `prognoza ${state}`,
    frozenSr: (state: string): string => `prognoza ${state}, nieaktualizowana na żywo`,
    expectedSr: (relative: string, clock: string): string =>
      `przewidywany ${relative}, o ${clock}`,
    bannerNoRealtimeStrong: "Dane na żywo niedostępne.",
    bannerNoRealtime:
      " Pokazujemy godziny rozkładowe: pojazdy mogą przyjechać wcześniej lub później.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Dane na żywo stoją." : `Dane na żywo stoją od ${minutes} min.`,
    bannerFrozenBefore: " Prognozy poniżej pochodzą",
    bannerFrozenLastUpdate: " z ostatniej aktualizacji",
    bannerFrozenAt: (clock: string): string => ` o ${clock}`,
    bannerFrozenAfter: " i nie są odświeżane: traktuj je ostrożnie.",
    bannerPartialStrong: "Dane na żywo częściowe.",
    bannerPartial: " Część danych nie dotarła: niektórych kursów może brakować.",
    showOnMap: (line: string): string => `Pokaż na mapie pojazd linii ${line}`,
    hideOnMap: (line: string): string => `Usuń wyróżnienie pojazdu linii ${line}`,
  },

  dataAge: {
    prefix: "Zaktualizowano",
    now: "teraz",
    secondsAgo: (seconds: number): string => `${seconds} s temu`,
    minutesAgo: (minutes: number): string => `${minutes} min temu`,
    atClock: (clock: string): string => `o ${clock}`,
    never: "nigdy",
  },

  refreshFeedback: {
    updated: "Zaktualizowano",
    unchanged: "Sprawdzono, nic nowego",
    failed: "Aktualizacja nie powiodła się",
    updatedShort: "Zaktualizowano",
    unchangedShort: "Nic nowego",
    failedShort: "Nie zaktualizowano",
    busy: "Aktualizowanie…",
    busySpoken: "Trwa aktualizacja",
  },

  stop: {
    tabArrivals: "Odjazdy",
    tabTimetable: "Rozkład",
    tabsAria: "Widok przystanku",
    editTag: "Edytuj etykietę",
    addTag: "Etykieta",
    map: "Mapa",
    realtimePrefix: "Na żywo",
    noRealtime: "Brak danych na żywo",
    pageNotUpdated: "Strona jeszcze nieodświeżona",
    pageUpdatedAt: (clock: string): string => `Strona odświeżona o ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Widzisz ostatnie otrzymane dane.`,
    arrivalsUnavailable: "Odjazdy niedostępne",
    emptyHint:
      "Teraz żaden kurs się nie zbliża. Otwórz rozkład, żeby zobaczyć, kiedy przewidziany jest następny odjazd.",
    seeTimetable: "Zobacz rozkład",
    linesHere: "Linie zatrzymujące się tutaj",
  },

  tagDialog: {
    titleFavorite: "Ulubiony",
    titleTag: "Etykieta przystanku",
    label: "Jak go nazywasz",
    placeholder: "Dom, biuro, siłownia…",
    hint: (maxChars: number): string =>
      `Tylko dla ciebie: zostaje na tym urządzeniu, maksymalnie ${maxChars} znaków.`,
    linesLegend: "Linie do pokazania",
    linesNone: "Brak wyboru: karta pokazuje wszystkie linie.",
    linesSome: (count: number): string =>
      `Tylko ${n(count, { one: "linia", few: "linie", other: "linii" })} na karcie.`,
    showAllLines: "Pokaż wszystkie linie",
    removeTag: "Usuń etykietę",
  },

  timetable: {
    previousDay: "Poprzedni dzień",
    nextDay: "Następny dzień",
    today: "dzisiaj",
    scheduled: "rozkład jazdy",
    jumpToNow: "Przejdź do teraz",
    backToToday: "Wróć do dzisiaj",
    fromServiceStart: "Od początku kursowania",
    unavailableTitle: "Rozkład niedostępny",
    partialError: (error: string): string => `${error}. Widzisz już wczytane kursy.`,
    emptyTitle: "Od tej pory brak kursów",
    emptyFromNow:
      "Od tej godziny nie ma już odjazdów. Spróbuj od początku kursowania, w innym dniu, albo usuń filtr linii.",
    emptyWholeDay:
      "W tym dniu nie zaplanowano żadnego odjazdu: spróbuj dzień wcześniej lub później, albo usuń filtr linii.",
    loadMore: "Pokaż więcej kursów",
    loadingMore: "Wczytywanie…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${n(count, { one: "kurs", few: "kursy", other: "kursów" })} od ${from} do ${to}` +
      (complete ? ", do końca kursowania" : "") +
      ". To oficjalne godziny dnia kursowania, bez danych na żywo.",
  },

  map: {
    fallbackAria: "Mapa",
    vehiclesHeading: "Pojazdy na mapie",
    show: "Pokaż",
    hide: "Ukryj",
    modeGroup: "Które pojazdy pokazać",
    modeApproaching: "Jadące tutaj",
    modeAllLines: "Wszystkie linie",
    loadingStop: "Wczytuję położenie przystanku…",
    stopMapAria: (stopName: string): string => `Mapa pojazdów na przystanku ${stopName}`,
    centreOnStop: "Wyśrodkuj na przystanku",
    nearbyVehicles: "Pojazdy w pobliżu",
    allVehicles: "Wszystkie, także dalekie",
    loadingVehicles: "Wczytuję pojazdy…",
    noneApproaching: "Żaden pojazd się nie zbliża",
    approachingCount: (count: number): string =>
      n(count, {
        one: "pojazd w drodze",
        few: "pojazdy w drodze",
        other: "pojazdów w drodze",
      }),
    onTheseLines: (count: number): string =>
      `${n(count, { one: "pojazd", few: "pojazdy", other: "pojazdów" })} na liniach tego przystanku`,
    positionsAt: (clock: string): string => `położenia z ${clock}`,
    positionsStale: "położenia nieaktualne",
    allLinesNote:
      "Pełne pojazdy jadą do tego przystanku, wyblakłe kursują na tych samych liniach, ale teraz tędy nie przejeżdżają.",
    approachingList: "Pojazdy w drodze",
    hereIn: (relative: string): string => `Tutaj ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Tutaj ${relative}, o ${clock}`,
    notInbound: "Kursuje na tej linii, ale nie jedzie do tego przystanku",
    noBearing: " · kierunek nieprzekazany",
    follow: "Jestem w tym pojeździe, śledź go",
    unfollow: "Przestań śledzić",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Linia ${line}, tutaj ${relative}${followed ? ", śledzisz go" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Linia ${line}, w ruchu, nie jedzie do tego przystanku${followed ? ", śledzisz go" : ""}`,
    yourPosition: "Twoje położenie",
    vehicleTitle: (vehicleId: string): string => `Pojazd ${vehicleId}`,
    showOnMap: (stopName: string): string => `Pokaż ${stopName} na mapie`,
    divertedSuffix: " · poza trasą",
    divertedBadge: "Poza trasą",
    divertedNote: "Jedzie inną trasą niż przewidziana.",
  },

  follow: {
    headlineLive: "Śledzę ten pojazd",
    headlinePaused: "Śledzenie wstrzymane",
    headlineStale: "Położenie zatrzymane",
    headlineLost: "Pojazd zniknął z linii",
    detailLive: "Mapa pozostaje wyśrodkowana na nim przy każdej aktualizacji.",
    detailPaused:
      "Przesunąłeś mapę, więc już jej nie ruszam. Dotknij Wznów, aby wrócić do pojazdu.",
    detailStaleUnknown: "Pojazd od jakiegoś czasu nie przekazuje swojego położenia.",
    detailStale: (age: string): string =>
      `Pojazd nie nadaje od ${age}: to na mapie jest ostatnim znanym punktem.`,
    detailLost:
      "Nie odbieram już jego położenia. Mógł zakończyć kurs albo zjechać z trasy.",
    ageMinutes: (minutes: number): string =>
      n(minutes, { one: "minuta", few: "minuty", other: "minut" }),
    ageHours: (hours: number): string =>
      n(hours, { one: "godzina", few: "godziny", other: "godzin" }),
    compact: "Śledzę",
    compactSr: (line: string): string => ` linię ${line}`,
    lineSr: (line: string): string => `, linia ${line}`,
    resume: "Wznów",
    exit: "Wyjdź",
    close: "Zamknij",
    lostHint: "Jeśli nadal jeździ, znajdziesz go po przejściu na „Wszystkie linie”.",
  },

  nearby: {
    title: "Przystanki w pobliżu",
    mapAria: "Mapa przystanków w pobliżu",
    searchHere: "Szukaj w tym rejonie",
    radius: "Promień",
    locating: "Lokalizuję…",
    myPosition: "Moje położenie",
    geoDenied:
      "Odmówiono dostępu do lokalizacji. Pokazujemy centrum Rzymu: przesuń mapę i szukaj w tym rejonie.",
    geoUnavailable:
      "Położenie w tej chwili niedostępne. Pokazujemy centrum Rzymu: przesuń mapę i szukaj w tym rejonie.",
    geoTimeout:
      "Lokalizacja trwała zbyt długo. Pokazujemy centrum Rzymu: przesuń mapę i spróbuj ponownie.",
    geoUnsupported:
      "Ta przeglądarka nie obsługuje geolokalizacji. Przesuń mapę, aby wyszukać przystanki.",
    outsideRome: "Jesteś poza obszarem Rzymu: pokazujemy centrum miasta.",
    outsideCoverage: "Ten rejon jest poza obsługiwanym obszarem. Przesuń mapę na Rzym.",
    focusStopMissing: "Nie znaleziono żądanego przystanku: pokazujemy twój rejon.",
    focusStopFailed: (error: string): string => `Nie wczytano żądanego przystanku (${error}).`,
    stopsFailed: (error: string): string => `Nie wczytano przystanków: ${error}`,
    loadingStops: "Szukam przystanków…",
    noStopsInRadius: (radius: string): string =>
      `Brak przystanku w promieniu ${radius}. Spróbuj zwiększyć promień albo przesunąć mapę.`,
    onMapCap: (max: number): string => ` (pierwsze ${max} na mapie)`,
    noLines: "Brak linii",
    arrivalsLink: "Odjazdy",
    showMoreStops: "Pokaż więcej przystanków",
  },

  line: {
    loading: "Wczytuję linię…",
    loadFailed: (error: string): string => `Nie wczytano linii: ${error}`,
    mapAria: (name: string): string => `Mapa linii ${name}`,
    dataAt: (clock: string): string => `dane z ${clock}`,
    updatedAt: (clock: string): string => `zaktualizowano o ${clock}`,
    vehiclesStale: (error: string): string => `Pojazdy nieaktualne: ${error}`,
    noPathForDirection: "Trasa niedostępna dla tego kierunku",
    stopsHeading: (count: number): string => `Przystanki (${count})`,
    noStopsForDirection: "Brak przystanków dostępnych dla tego kierunku.",
    showAllStops: "Pokaż wszystkie przystanki",
  },

  lineService: {
    inService: (count: number): string =>
      `${n(count, { one: "pojazd", few: "pojazdy", other: "pojazdów" })} na linii`,
    loadingVehicles: "Wczytuję pojazdy…",
    checkingTimetable: "Sprawdzam rozkład…",
    feedDownTitle: "Położenia na żywo niedostępne",
    feedDownDetail:
      "Kursowanie może być normalne: nie udaje nam się odczytać położenia pojazdów.",
    noneReporting: "Żaden pojazd nie przekazuje swojego położenia",
    unknownDetail:
      "To nie znaczy, że linia nie kursuje: godziny rozkładowe są na stronie przystanku.",
    scheduledDetail: (count: number): string =>
      `Kursowanie jest zaplanowane: ${n(count, { one: "przewidziany kurs", few: "przewidziane kursy", other: "przewidzianych kursów" })} do końca dnia.`,
    finishedTitle: "Kursowanie na dziś zakończone",
    finishedDetail: (count: number, clock: string): string =>
      `Dzisiaj ${n(count, { one: "zaplanowany kurs", few: "zaplanowane kursy", other: "zaplanowanych kursów" })}, ostatni o ${clock}.`,
    noneTodayTitle: "Dzisiaj brak zaplanowanych kursów",
    noneTodayDetail: "Na tej linii nie ma dziś kursów w rozkładzie.",
    noneTodayFrom: (stopName: string): string =>
      `Z przystanku ${stopName} nie ma dziś kursów w rozkładzie.`,
    nextDepartures: "Najbliższe odjazdy",
    nextDeparturesFrom: (stopName: string): string => ` z przystanku ${stopName}`,
    scheduledOnly: "Godziny rozkładowe, bez danych na żywo.",
  },

  journey: {
    title: "Trasa",
    subtitle: "Z punktu do punktu po Rzymie autobusem, tramwajem i metrem.",
    from: "Skąd",
    to: "Dokąd",
    placeholder: "Przystanek, adres lub miejsce",
    swap: "Zamień",
    whenLegend: "Kiedy",
    now: "Teraz",
    pickTime: "Wybierz godzinę",
    timeLabel: "Data i godzina odjazdu",
    submit: "Szukaj trasy",
    resultsHeading: "Trasy",
    emptyTitle: "Dokąd chcesz jechać?",
    emptyHint:
      "Wpisz punkt początkowy i końcowy: szukamy najlepszej trasy na podstawie oficjalnych rozkładów.",
    searching: "Szukam tras…",
    noResultsTitle: "Brak tras",
    noResultsHint:
      "Szukamy tylko połączeń bezpośrednich albo z jedną przesiadką. Spróbuj zmienić punkt początkowy albo godzinę.",
    disclaimer:
      "Godziny rozkładowe, nie na żywo: rzeczywiste opóźnienia nie są uwzględnione. Odcinki piesze są szacowane w linii prostej, więc faktyczna droga ulicami jest dłuższa.",
    searchedFrom: (when: string): string => ` Wyszukiwanie od ${when}.`,
    mapAria: "Mapa wybranej trasy",
    mapCaption:
      "Odcinki w pojeździe biegną rzeczywistą trasą linii. Przerywane są szacowane w linii prostej: dojścia piesze przy przesiadkach i rzadkie linie bez przebiegu.",
    missingEndpoints: "Podaj zarówno punkt początkowy, jak i końcowy.",
    badDateTime: "Nieprawidłowa data i godzina.",
    geoUnsupported: "Ta przeglądarka nie obsługuje geolokalizacji.",
    geoUnavailable: "Położenie w tej chwili niedostępne.",
    geoOutsideRome: "Jesteś poza obszarem Rzymu: wpisz adres.",
    geoDenied: "Odmówiono dostępu do lokalizacji: wpisz adres.",
    geoTimeout: "Lokalizacja trwała zbyt długo.",
    originMarker: (name: string): string => `Skąd: ${name}`,
    destinationMarker: (name: string): string => `Dokąd: ${name}`,
    useMyPosition: "Użyj mojego położenia",
    clearField: (label: string): string => `Wyczyść pole ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Podpowiedzi dla pola ${label.toLowerCase()}`,
    placeStop: "Przystanek",
    placeCoord: "Współrzędne",
    placeAddress: "Adres",
    walkOnly: "Tylko pieszo",
    walkOnlyShort: "pieszo",
    noTransfers: "bez przesiadek",
    transfers: (count: number): string =>
      n(count, { one: "przesiadka", few: "przesiadki", other: "przesiadek" }),
    walkDistance: (distance: string): string => `${distance} pieszo`,
    walkLeg: (distance: string, duration: string): string =>
      `Pieszo ${distance}, około ${duration} do `,
    inService: "w ruchu",
    stopCount: (count: number): string =>
      n(count, { one: "przystanek", few: "przystanki", other: "przystanków" }),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Trasa ${index}: odjazd ${departure}, przyjazd ${arrival}`,
    lineDetailsAria: (line: string): string => `Linia ${line}, szczegóły`,
    hours: (hours: number): string => `${hours} godz.`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} godz. ${minutes}`,
    noticeNoOriginStops:
      "Brak przystanku w zasięgu spaceru od miejsca startu: spróbuj adresu bliżej jakiejś linii.",
    noticeNoDestinationStops:
      "Brak przystanku w zasięgu spaceru od celu: spróbuj adresu bliżej jakiejś linii.",
    noticeNoConnection:
      "Nie znaleziono połączenia między tymi dwoma rejonami w najbliższych godzinach.",
    noticeWalkOnlyLeft:
      "Brak połączenia w rozkładzie na najbliższe godziny: zostaje tylko trasa piesza.",
    noticeLaterDepartures:
      "Nic nie kursuje przez najbliższe półtorej godziny: pokazujemy pierwsze kursy po tym czasie.",
  },

  alerts: {
    title: "Komunikaty o kursowaniu",
    subtitle: "Objazdy, zawieszenia i zmiany opublikowane w oficjalnym strumieniu danych.",
    loading: "Wczytywanie…",
    degraded:
      "Strumień na żywo nie odpowiada albo jest stary: te komunikaty mogą być nieaktualne.",
    loadFailed: "Nie udało się wczytać komunikatów.",
    refreshFailed: (error: string): string =>
      `Ostatnia aktualizacja nie powiodła się (${error}): widzisz poprzednią listę.`,
    searchPlaceholder: "Szukaj: strajk, objazd, ulica…",
    searchAria: "Szukaj wśród komunikatów",
    filterByLine: "Filtruj po linii",
    allLines: (count: number): string => `Wszystkie linie (${count})`,
    networkWide: "Komunikaty ogólne",
    clearFilters: "Wyczyść",
    noMatch: "Żaden komunikat nie pasuje do filtrów.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${pick(shown, { one: "komunikat", few: "komunikaty", other: "komunikatów" })} z ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${pick(count, { one: "aktywny komunikat", few: "aktywne komunikaty", other: "aktywnych komunikatów" })} na ${lines} liniach.`,
    goToLine: "Przejdź do linii",
    noneTitle: "Brak aktywnych komunikatów",
    noneHint:
      "W tej chwili strumień nie zgłasza utrudnień ani zmian w kursowaniu. Sprawdź jeszcze raz przed wyjściem.",
    noResultsTitle: "Brak wyników",
    noResultsHint:
      "Spróbuj z mniejszą liczbą słów albo wyczyść filtry, żeby zobaczyć wszystkie komunikaty.",
    noSelectionTitle: "Nie wybrano komunikatu",
    noSelectionHint: "Wybierz komunikat z listy po lewej, żeby przeczytać go w całości.",
    showMoreLines: (count: number): string => `Pokaż więcej linii (${count})`,
    goToLineShort: "przejdź do linii",
    fallbackHeader: "Komunikat o kursowaniu",
    noDetail: "Przewoźnik nie opublikował szczegółów.",
    operatorLink: "Szczegóły na stronie przewoźnika",
    affectedLines: "Linie objęte zmianą",
    alsoOn: "Także na",
    contextHeading: (count: number): string =>
      `${count} ${pick(count, { one: "aktywny komunikat", few: "aktywne komunikaty", other: "aktywnych komunikatów" })}`,
    contextAria: "Komunikaty o kursowaniu",
    contextAll: "Wszystkie",
    contextUnavailable: (error: string): string => `Komunikaty niedostępne: ${error}`,
    contextMore: (count: number): string => `Jeszcze ${count} komunikatów na `,
    contextMoreLink: "stronie komunikatów",
    contextStale: (error: string): string =>
      `Ostatnia aktualizacja nie powiodła się (${error}): te komunikaty mogą być nieaktualne.`,
    windowBetween: (from: string, until: string): string => `Od ${from} do ${until}`,
    windowFrom: (from: string): string => `Od ${from}, bez podanego terminu końcowego`,
    windowUntil: (until: string): string => `Do ${until}`,
    windowUnknown: "Okres obowiązywania niepodany",
    effect: (code: string): string | null => EFFECT_PL[code] ?? null,
    cause: (code: string): string | null => CAUSE_PL[code] ?? null,
  },

  settings: {
    title: "Ustawienia",
    subtitle: "Wszystko zostaje na tym urządzeniu. Żadnego konta, żadnego serwera.",
    sectionArrivals: "Odjazdy",
    autoRefresh: "Automatyczne odświeżanie",
    everySeconds: (seconds: number): string => `co ${seconds} sekund`,
    autoRefreshHint: "Odstęp między dwoma odczytami strumienia na żywo.",
    maxArrivals: "Odjazdy pokazywane na przystanek",
    showScheduled: "Pokazuj godziny rozkładowe",
    showScheduledHint:
      "Kiedy dane na żywo nie mają nic dla przystanku, użyj rozkładu.",
    sectionNearby: "W pobliżu mnie",
    radius: "Promień wyszukiwania",
    radiusHint: "Dotyczy też szybkich promieni na mapie przystanków w pobliżu.",
    sectionAppearance: "Wygląd",
    themeLegend: "Motyw",
    themeSystem: "Systemowy",
    themeLight: "Jasny",
    themeDark: "Ciemny",
    sectionLanguage: "Język",
    languageLegend: "Język interfejsu",
    languageSystem: "Systemowy",
    languageHint: (resolved: string): string =>
      `Przy „Systemowym” idziemy za językiem przeglądarki: teraz to ${resolved}.`,
    sectionBackup: "Kopia ulubionych",
    backupIntro:
      "Plik JSON na twoim urządzeniu: tak przeniesiesz ulubione do innej przeglądarki, skoro nie ma tu żadnego konta.",
    exportCount: (count: number): string => `Eksportuj (${count})`,
    importFromFile: "Importuj z pliku",
    exported: (count: number): string => `Wyeksportowano ${count} ulubionych.`,
    exportFailed: "Eksport nie powiódł się w tej przeglądarce.",
    fileTooLarge: "Plik jest za duży jak na kopię ulubionych.",
    fileUnreadable: "Nie udało się odczytać pliku.",
    importEmpty: "Plik jest pusty.",
    importNotJson: "Plik nie jest prawidłowym JSON-em.",
    importNoList: "Plik nie zawiera listy ulubionych.",
    importNoneValid: "Nie znaleziono w pliku żadnego prawidłowego ulubionego.",
    importFound: (count: number): string => `Znaleziono ${count} prawidłowych ulubionych`,
    importSkipped: (count: number): string => `, odrzucono ${count} pozycji.`,
    importFoundEnd: ".",
    importMerge: "Połącz",
    importReplace: "Zastąp",
    replaced: (count: number): string => `Ulubione zastąpione: teraz jest ich ${count}.`,
    mergedNone: "Brak nowych ulubionych do dodania.",
    merged: (count: number): string => `Dodano ${count} ulubionych.`,
    sectionLocalData: "Dane lokalne",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} ulubionych, ${recents} przystanków w historii.`,
    confirmClearFavorites: "Usunąć wszystkie ulubione? Tej operacji nie da się cofnąć.",
    confirmClearFavoritesYes: "Tak, wyczyść",
    clearFavorites: "Wyczyść ulubione",
    favoritesCleared: "Ulubione wyczyszczone.",
    confirmClearRecents: "Usunąć historię oglądanych przystanków?",
    confirmClearRecentsYes: "Tak, usuń",
    clearRecents: "Usuń historię",
    recentsCleared: "Historia usunięta.",
    resetDefaults: "Przywróć ustawienia domyślne",
    settingsReset: "Ustawienia przywrócone do wartości domyślnych.",
    infoLink: "Informacje, źródła danych i najczęstsze pytania",
  },

  sync: {
    titleFull: "Synchronizuj urządzenia",
    titleCollapsed: "Synchronizacja",
    badgeOn: "aktywna",
    summaryLoading: "…",
    summaryUnavailable: "Niedostępna na tym połączeniu",
    summaryOff: "Nieaktywna",
    summarySyncing: "Trwa synchronizacja…",
    summaryError: "Błąd synchronizacji",
    summaryConflict: "Konflikt do rozwiązania",
    summaryOn: (last: string): string => `Aktywna · ostatnia ${last}`,
    intro:
      "Przenieś ulubione, ostatnie i ustawienia na inne urządzenie za pomocą kodu. Dane są szyfrowane tutaj: serwer przechowuje tylko nieczytelne dane.",
    enable: "Włącz synchronizację",
    haveCode: "Mam już kod",
    codeLabel: "Kod synchronizacji",
    codeHint:
      "20 znaków, tak jak je czytasz na drugim urządzeniu. Wielkość liter, myślniki i spacje nie mają znaczenia.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} znaków`,
    join: "Połącz",
    onIntro:
      "Dane są szyfrowane na tym urządzeniu, zanim je opuszczą. Kto ma kod, może przeczytać wszystkie twoje ulubione: używaj go tylko na własnych urządzeniach.",
    code: "Kod",
    showCode: "Pokaż kod",
    hideCode: "Ukryj kod",
    copyCode: "Kopiuj kod",
    copied: "Skopiowano",
    lastSync: "Ostatnia synchronizacja:",
    inProgress: " · w toku…",
    syncNow: "Synchronizuj teraz",
    disconnect: "Rozłącz",
    disconnectNote:
      "Po rozłączeniu dane zostają na tym urządzeniu, a zaszyfrowana kopia zostaje na serwerze, dopóki jej nie usuniesz.",
    deleteWarning:
      "Usuwa zaszyfrowaną kopię z serwera. Pozostałe urządzenia nie znajdą już nic do zsynchronizowania. Tego nie da się cofnąć.",
    deleteConfirm: "Usuń na pewno",
    deleteRemote: "Usuń dane z serwera",
    justNow: "teraz",
    minutesAgo: (minutes: number): string => `${minutes} min temu`,
    atClock: (clock: string): string => `o ${clock}`,
    errors: {
      aborted: "Operacja anulowana.",
      generic: "Synchronizacja nie powiodła się. Spróbuj za chwilę.",
      insecureContext:
        "Synchronizacja wymaga bezpiecznego połączenia: otwórz stronę przez https (albo na localhost). Przez zwykły http przeglądarki wyłączają szyfrowanie, więc na tym urządzeniu nic nie da się zaszyfrować.",
      noBase64Encode: "Ta przeglądarka nie potrafi zakodować danych synchronizacji.",
      noBase64Decode: "Ta przeglądarka nie potrafi odkodować danych synchronizacji.",
      invalidSyncData: (what: string): string => `Nieprawidłowe dane synchronizacji (${what}).`,
      codeRequired: "Wpisz kod synchronizacji.",
      codeTooLong: (max: number): string =>
        `Ten kod jest za długi: powinien mieć ${n(max, { one: "znak", few: "znaki", other: "znaków" })}.`,
      codeInvalidChars: (chars: string): string => `Kod zawiera niedozwolone znaki: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Kod musi mieć ${n(required, { one: "znak", few: "znaki", other: "znaków" })}, a wpisano ${actual}.`,
      keyDerivationFailed: "Ta przeglądarka nie potrafi wyprowadzić kluczy synchronizacji.",
      preparePayloadFailed: "Nie udało się przygotować danych do synchronizacji.",
      encryptFailed: "Nie udało się zaszyfrować danych na tym urządzeniu.",
      decryptFailed: "Kod nie pasuje do tych danych albo dane na serwerze są uszkodzone.",
      invalidSyncId: "Nieprawidłowy identyfikator synchronizacji.",
      responseTooLarge: "Serwer odesłał zbyt dużo danych.",
      timeout: "Serwer nie odpowiedział na czas.",
      unreachable: "Serwer nieosiągalny. Sprawdź połączenie.",
      invalidResponse: "Nieprawidłowa odpowiedź serwera.",
      invalidResponseField: (what: string): string =>
        `Nieprawidłowa odpowiedź serwera (${what}).`,
      unexpectedFormat: "Serwer odpowiedział w nieoczekiwanym formacie.",
      rateLimited: "Zbyt wiele synchronizacji pod rząd. Spróbuj za minutę.",
      pullRejected: (status: number): string => `Serwer odrzucił odczyt (błąd ${status}).`,
      payloadTooLarge: "Za dużo danych do zsynchronizowania.",
      pushRejected: (status: number): string => `Serwer odrzucił zapis (błąd ${status}).`,
      deleteRejected: (status: number): string => `Serwer odrzucił usunięcie (błąd ${status}).`,
      conflict:
        "Inne urządzenie zapisuje właśnie te same dane. Dane na tym urządzeniu są bezpieczne: spróbuj za kilka sekund.",
    },
    status: {
      deleted: "Dane usunięte z serwera. To urządzenie nie jest już synchronizowane.",
      disconnected:
        "Synchronizacja jest wyłączona na tym urządzeniu. Dane zostają tutaj, a zaszyfrowana kopia zostaje na serwerze, dopóki jej nie usuniesz.",
    },
  },

  info: {
    title: "Informacje",
    subtitle:
      "Rozkłady i odjazdy komunikacji miejskiej w Rzymie, na podstawie oficjalnych danych otwartych.",
    unofficialTitle: "Aplikacja nieoficjalna",
    unofficialBody:
      "Ta strona nie jest w żaden sposób powiązana, stowarzyszona, autoryzowana ani wspierana przez ATAC S.p.A., Roma Servizi per la Mobilità ani Roma Capitale. To niezależny projekt, który ogranicza się do czytania danych otwartych publikowanych przez te podmioty. Po oficjalne informacje, bilety i reklamacje zwróć się do ich kanałów.",
    whatTitle: "Co to jest",
    whatBody1:
      "Aplikacja internetowa, żeby wiedzieć, za ile przyjedzie następny pojazd na przystanku, na którym stoisz. Szukasz przystanku albo linii, zapisujesz ją w ulubionych i znajdujesz na stronie głównej z aktualnymi odjazdami. Bez konta, bez reklam, bez statystyk użytkowania.",
    whatBody2:
      "Kiedy strumień na żywo obejmuje kurs, pokazana godzina jest prognozą opartą na położeniu pojazdu. W przeciwnym razie aplikacja wraca do rozkładu i zawsze o tym mówi, zamiast podawać stare dane jako prognozę.",
    dataTitle: "Skąd pochodzą dane",
    dataBodyBefore:
      "Rozkłady, przystanki, linie, przebiegi tras, położenia pojazdów i komunikaty o kursowaniu pochodzą z danych otwartych ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (strumienie GTFS i GTFS-Realtime). Rozkłady są aktualizowane codziennie, dane na żywo mniej więcej co 30 sekund.",
    dataLink: "romamobilita.it — Dane otwarte",
    dataLicence:
      "Dane pozostają własnością odpowiednich podmiotów i są używane na warunkach licencji, na jakiej są publikowane.",
    privacyTitle: "Prywatność",
    privacyBody:
      "Nie ma logowania ani profilu użytkownika. Ulubione, ostatnio oglądane przystanki i ustawienia są zapisywane tylko w twojej przeglądarce i nigdzie nie są wysyłane. Położenie, jeśli je udostępnisz do wyszukiwania przystanków w pobliżu, zostaje na urządzeniu: służy do obliczania odległości i nie jest przechowywane.",
    faqTitle: "Najczęstsze pytania",
    faq1Q: "Dlaczego linia albo autobus się nie pojawia?",
    faq1A:
      "Pokazujemy tylko to, co jest w oficjalnych strumieniach. Jeśli pojazd nie przekazuje położenia albo jego kursu nie ma w strumieniu na żywo, dla nas nie istnieje: najwyżej zobaczysz godzinę rozkładową. Zdarza się to często przy kursach zastępczych, autobusach dowozowych i pojazdach z zepsutym lokalizatorem.",
    faq2Q: "Dlaczego godziny różnią się od tych na przystanku?",
    faq2A:
      "Tabliczka na słupku podaje godzinę rozkładową, która zmienia się kilka razy w roku. Tutaj, kiedy pojazd nadaje, widzisz prognozę wyliczoną na podstawie jego rzeczywistego położenia, uwzględniającą ruch i opóźnienia. Kiedy natomiast czytasz „wg rozkładu”, prognozy nie ma i pokazujemy tę samą godzinę co tabliczka.",
    faq3Q: "Co się dzieje w nocy?",
    faq3A:
      "W nocy strumień na żywo jest prawie pusty, bo jeździ niewiele pojazdów. Aplikacja działa dalej na godzinach rozkładowych linii nocnych. W GTFS dzień kursowania nie kończy się o północy, tylko o 04:00: kurs z pierwszej w nocy należy jeszcze do dnia poprzedniego i dlatego możesz zobaczyć godziny w rodzaju 25:30 przetłumaczone na 01:30.",
    faq4Q: "Czy moje ulubione trafiają na serwer?",
    faq4A:
      "Nie. Ulubione, historia i ustawienia są w localStorage przeglądarki. Jeśli wyczyścisz dane strony albo zmienisz urządzenie, znikną: w ustawieniach możesz je wyeksportować do pliku JSON i zaimportować gdzie indziej.",
    settingsLink: "Przejdź do ustawień",
  },

  footer: {
    dataPrefix: "Dane o kursowaniu i rozkłady: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (dane otwarte GTFS).",
    independent:
      "Projekt niezależny, niepowiązany z ATAC ani z Roma Servizi per la Mobilità. ",
    infoLink: "Informacje",
  },

  errors: {
    genericTitle: "Coś nie zadziałało",
    unexpected: "Nieoczekiwany błąd",
    unexpectedDot: "Nieoczekiwany błąd.",
    stopNotFound: "Nie znaleziono przystanku",
    serviceDown: "Usługa nie odpowiada",
    requestFailed: (status: number): string => `Żądanie nie powiodło się (${status})`,
    httpStatus: (status: number): string => `Błąd ${status}`,
    badResponse: "Nieprawidłowa odpowiedź serwera",
    badResponseDot: "Nieprawidłowa odpowiedź serwera.",
    timedOut: "Przekroczono czas żądania",
    timedOutDot: "Przekroczono czas żądania.",
    offline: "Brak połączenia",
    connectionFailed: "Połączenie nie powiodło się.",
    tooManyRequests: "Zbyt wiele żądań",
    badRequest: "Nieprawidłowe parametry",
    lineNotFound: "Nie znaleziono linii",
    journeyOriginNotFound: "Nie znaleziono miejsca startu",
    journeyDestinationNotFound: "Nie znaleziono celu",
    journeyPlaceHint: "Spróbuj podać dokładniejszy adres.",
  },

  notFound: {
    kicker: "Błąd 404",
    title: "Przystanek nieobsługiwany",
    body:
      "Ta strona nie istnieje. Może się to zdarzyć przy starym linku albo przy numerze przystanku lub linii, których nie ma już w strumieniu danych.",
    searchCta: "Szukaj przystanku",
    nearbyCta: "Przystanki w pobliżu",
  },

  appError: {
    title: "Kurs przerwany",
    body:
      "Tego ekranu nie udało się wczytać. Spróbuj ponownie: jeśli problem się utrzyma, prawdopodobnie nie odpowiada usługa danych.",
    digest: (digest: string): string => `Kod: ${digest}`,
    backHome: "Wróć na stronę główną",
    globalTitle: "Kursowanie wstrzymane",
    globalBody:
      "Aplikacja zatrzymała się z powodu nieoczekiwanego błędu. Odśwież stronę: twoje ulubione zostają zapisane w telefonie i nie przepadną.",
    reload: "Odśwież",
  },

  format: {
    due: "wjeżdża",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "data niedostępna",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "aktualizacja nieznana",
    ageSeconds: (seconds: number): string => `zaktualizowano ${seconds} s temu`,
    ageMinutes: (minutes: number): string => `zaktualizowano ${minutes} min temu`,
    ageAt: (clock: string): string => `zaktualizowano o ${clock}`,
    onTime: "punktualnie",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — odjazdy na żywo",
    appDescription:
      "Rozkłady i odjazdy autobusów, tramwajów i metra w Rzymie na żywo. Ulubione, przystanki w pobliżu i komunikaty o utrudnieniach, bez konta i bez reklam.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Najbliższe przystanki ATAC, z mapą i liniami, które się na nich zatrzymują.",
    journeyDescription:
      "Sprawdź, jak dojechać z jednego punktu Rzymu do drugiego autobusem, tramwajem i metrem, według oficjalnych rozkładów ATAC.",
    alertsDescription:
      "Objazdy, zawieszenia kursów i zmiany w kursowaniu publikowane w oficjalnym strumieniu danych.",
    settingsDescription:
      "Odświeżanie odjazdów, promień wyszukiwania, motyw i zarządzanie ulubionymi.",
    infoDescription:
      "Czym jest ta aplikacja, skąd pochodzą dane i dlaczego nie jest powiązana z ATAC ani z Roma Servizi per la Mobilità.",
    stopDescription: "Najbliższe odjazdy na żywo i rozkład jazdy przystanku.",
    lineDescription: "Trasa, przystanki i pojazdy linii na żywo.",
  },

  skeleton: {
    loading: "Wczytywanie",
  },
};

const EFFECT_PL: Record<string, string | undefined> = {
  NO_SERVICE: "Kursowanie wstrzymane",
  REDUCED_SERVICE: "Kursowanie ograniczone",
  SIGNIFICANT_DELAYS: "Znaczne opóźnienia",
  DETOUR: "Objazd",
  ADDITIONAL_SERVICE: "Kursy dodatkowe",
  MODIFIED_SERVICE: "Kursowanie zmienione",
  STOP_MOVED: "Przystanek przeniesiony",
  NO_EFFECT: "Bez wpływu na kursowanie",
  ACCESSIBILITY_ISSUE: "Problem z dostępnością",
  OTHER_EFFECT: "Inne",
  UNKNOWN_EFFECT: "Skutek nieokreślony",
};

const CAUSE_PL: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Awaria techniczna",
  STRIKE: "Strajk",
  DEMONSTRATION: "Manifestacja",
  ACCIDENT: "Wypadek",
  HOLIDAY: "Święto",
  WEATHER: "Zła pogoda",
  MAINTENANCE: "Konserwacja",
  CONSTRUCTION: "Roboty drogowe",
  POLICE_ACTIVITY: "Działania policji",
  MEDICAL_EMERGENCY: "Nagły przypadek medyczny",
  OTHER_CAUSE: "Inna przyczyna",
  UNKNOWN_CAUSE: "Przyczyna nieokreślona",
};
