/**
 * Romanian dictionary. Shape and key order follow it.ts, the source of truth.
 * Romanian has one/few/other — the "other" form takes "de" (20 de stații), so
 * the plurals go through CLDR.
 */

import type { Dictionary } from "./it";
import { pluralRules } from "./plural";

const { pick, count: n } = pluralRules("ro");

export const ro: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, acasă",
  },

  a11y: {
    skipToContent: "Sari la conținut",
  },

  common: {
    retry: "Încearcă din nou",
    cancel: "Anulează",
    save: "Salvează",
    close: "Închide",
    home: "Acasă",
    back: "Înapoi",
    all: "Toate",
    loading: "Se încarcă…",
    searching: "Se caută…",
    refresh: "Actualizează",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Șterge căutarea",
    searchInProgress: "Căutare în curs",
  },

  nav: {
    primary: "Navigare principală",
    sidebar: "Bară laterală",
    sidebarNav: "Navigare laterală",
    openMenu: "Deschide meniul",
    closeMenu: "Închide meniul",
    sections: "Secțiuni",
    shortcuts: "Scurtături",
    infoAria: "Informații despre aplicație",
    home: "Acasă",
    nearbyShort: "Aproape",
    nearby: "Stații din apropiere",
    journey: "Traseu",
    alerts: "Anunțuri",
    settings: "Setări",
    info: "Info",
    hintNearby: "Ce trece pe aici",
    hintJourney: "Dintr-un punct în altul",
    hintAlerts: "Devieri și întreruperi",
    hintSettings: "Actualizare, temă, date",
    hintInfo: "Surse și mențiuni legale",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tramvai";
        case 1:
          return "metrou";
        case 2:
          return "tren";
        case 4:
          return "feribot";
        default:
          return "autobuz";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tramvai";
        case 1:
          return "Metrou";
        case 2:
          return "Tren";
        case 3:
          return "Autobuz";
        default:
          return "Linie";
      }
    },
    named: (name: string): string => `Linia ${name}`,
    namedAria: (name: string): string => `Linia ${name}`,
    details: "detalii",
    towards: (headsign: string): string => `spre ${headsign}`,
    towardsCapital: (headsign: string): string => `Spre ${headsign}`,
    direction: "Direcție",
    terminus: "capăt de linie",
    noHeadsign: "Destinație neindicată",
  },

  stops: {
    code: (code: string): string => `Stația ${code}`,
    codeOnly: "Stație",
    pole: (code: string): string => `Stâlpul ${code}`,
    accessible: "Stație accesibilă",
    named: (name: string): string => `Stația ${name}`,
    countLabel: (count: number): string =>
      n(count, { one: "stație", few: "stații", other: "de stații" }),
    involved: (count: number): string =>
      n(count, {
        one: "stație afectată",
        few: "stații afectate",
        other: "de stații afectate",
      }),
  },

  home: {
    kicker: "Roma · transport public",
    title: "Când vine?",
    intro:
      "Caută o stație după număr sau după nume, ori o linie. Sosirile vin din fluxul în timp real al Romei.",
  },

  search: {
    inputAria: "Caută o stație sau o linie",
    placeholder: "Stație, stradă sau linie",
    searchingFor: (query: string): string => `Se caută „${query}”…`,
    noResultsFor: (query: string): string => `Niciun rezultat pentru „${query}”`,
    noResultsHint:
      "Încearcă cu numărul stației (de exemplu 70101), numele străzii sau numărul liniei.",
    resultsList: "Rezultatele căutării",
    keyboardHint: "↑ ↓ pentru a parcurge, Enter pentru a deschide, Esc pentru a închide",
  },

  favorites: {
    heading: "Favorite",
    emptyTitle: "Încă niciun favorit",
    emptyHint:
      "Atinge steluța ★ de lângă o stație sau o linie: în căutare, în Stații din apropiere, pe pagina stației sau pe cea a liniei. O regăsești aici, fără să o cauți de fiecare dată.",
    reorder: "Reordonează",
    reorderDone: "Gata",
    reorderHint: "Mută stațiile cu săgețile. Ordinea este valabilă pe acest dispozitiv.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: poziția ${position} din ${total}.`,
    moveUp: (name: string): string => `Mută ${name} mai sus`,
    moveDown: (name: string): string => `Mută ${name} mai jos`,
    addStar: (name: string): string => `Pune steluța la stația ${name}`,
    removeStar: (name: string): string => `Scoate steluța de la stația ${name}`,
    addStarLine: (name: string): string => `Pune steluța la linia ${name}`,
    removeStarLine: (name: string): string => `Scoate steluța de la linia ${name}`,
    starredTitle: "Cu steluță: este la favorite",
    starTitle: "Pune steluța",
    starredLabel: "Cu steluță",
    starLabel: "Steluță",
    editLabels: (name: string): string => `Modifică eticheta și liniile pentru ${name}`,
    onlyLines: (labels: string): string => `doar ${labels}`,
    notUpdated: "neactualizat",
    noArrivalsOnPinned: "Nicio sosire pe liniile alese.",
    changeLines: "Schimbă liniile",
    noArrivalsSoon: "Nicio sosire în următoarele minute.",
    openForTimes: "Deschide pentru orar",
    vehiclesUnavailable: "Vehicule indisponibile",
    lookingForVehicles: "Caut vehiculele aflate în circulație…",
    noVehiclesNow: "Niciun vehicul în circulație acum",
    vehiclesInService: (count: number): string =>
      `${n(count, { one: "vehicul", few: "vehicule", other: "de vehicule" })} în circulație acum`,
    refreshArrivals: "Actualizează sosirile",
    undoRemovedStop: "Stație fără steluță: nu mai este la favorite.",
    undoRemovedLine: "Linie fără steluță: nu mai este la favorite.",
    undoDismiss: "Închide anunțul",
    more: (count: number): string => `Încă ${count} favorite`,
    sidebarEmptyBefore: "Atinge steluța de lângă o stație sau o linie, în căutare, în ",
    sidebarEmptyAfter: " sau pe pagina pe care o vezi. O regăsești aici.",
    nextDeparture: "următoarea sosire",
    noDeparture: "nicio sosire disponibilă",
    notAvailableShort: "n/a",
  },

  recents: {
    heading: "Văzute recent",
    clear: "Golește",
    emptyTitle: "Nicio stație recentă",
    emptyHint:
      "Stațiile pe care le deschizi rămân aici câteva zile, ca să le regăsești fără să le cauți din nou.",
    listAria: "Stații văzute recent",
    justNow: "chiar acum",
    today: "azi",
    yesterday: "ieri",
  },

  arrivals: {
    due: "intră în stație",
    live: "în timp real",
    scheduled: "după orar",
    scheduledTail: " programat",
    scheduledSr: "oră programată",
    onTime: "la timp",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "întârziere",
    earlySuffix: "mai devreme",
    lateSr: (minutes: number): string =>
      `${n(minutes, { one: "minut", few: "minute", other: "de minute" })} întârziere`,
    earlySr: (minutes: number): string =>
      `cu ${n(minutes, { one: "minut", few: "minute", other: "de minute" })} mai devreme`,
    skipped: "anulată",
    skippedSr: "cursă anulată",
    atClock: (clock: string): string => `la ${clock}`,
    towardsSr: (headsign: string): string => `direcția ${headsign}`,
    loadingAria: "Se încarcă sosirile",
    emptyTitle: "Nicio sosire prevăzută",
    emptyHint:
      "Nu se apropie nicio cursă. Încearcă orarul programat sau revino peste puțin timp.",
    frozenUnknown: "estimare neactualizată",
    frozenFor: (minutes: number): string => `oprită de ${minutes} min`,
    frozenPrefix: (state: string): string => `estimare ${state}`,
    frozenSr: (state: string): string => `estimare ${state}, neactualizată în timp real`,
    expectedSr: (relative: string, clock: string): string => `prevăzută ${relative}, la ${clock}`,
    bannerNoRealtimeStrong: "Timp real indisponibil.",
    bannerNoRealtime:
      " Afișăm orarele programate: vehiculele pot trece mai devreme sau mai târziu.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Timpul real este oprit." : `Timpul real este oprit de ${minutes} min.`,
    bannerFrozenBefore: " Estimările de mai jos sunt cele",
    bannerFrozenLastUpdate: " de la ultima actualizare",
    bannerFrozenAt: (clock: string): string => ` de la ${clock}`,
    bannerFrozenAfter: " și nu se mai actualizează: ia-le cu prudență.",
    bannerPartialStrong: "Timp real parțial.",
    bannerPartial: " O parte din date nu a ajuns: unele curse pot lipsi.",
    showOnMap: (line: string): string => `Arată pe hartă vehiculul liniei ${line}`,
    hideOnMap: (line: string): string => `Scoate evidențierea vehiculului liniei ${line}`,
  },

  dataAge: {
    prefix: "Actualizat",
    now: "acum",
    secondsAgo: (seconds: number): string => `acum ${seconds} s`,
    minutesAgo: (minutes: number): string => `acum ${minutes} min`,
    atClock: (clock: string): string => `la ${clock}`,
    never: "niciodată",
  },

  refreshFeedback: {
    updated: "Actualizat",
    unchanged: "Verificat, nimic nou",
    failed: "Actualizarea a eșuat",
    updatedShort: "Actualizat",
    unchangedShort: "Nimic nou",
    failedShort: "Neactualizat",
    busy: "Se actualizează…",
    busySpoken: "Actualizare în curs",
  },

  stop: {
    tabArrivals: "Sosiri",
    tabTimetable: "Orar",
    tabsAria: "Vizualizarea stației",
    editTag: "Modifică eticheta",
    addTag: "Etichetă",
    map: "Hartă",
    realtimePrefix: "Timp real",
    noRealtime: "Nicio dată în timp real",
    pageNotUpdated: "Pagina încă neactualizată",
    pageUpdatedAt: (clock: string): string => `Pagină actualizată la ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Vezi ultima dată primită.`,
    arrivalsUnavailable: "Sosiri indisponibile",
    emptyHint:
      "Acum nu se apropie nicio cursă. Deschide orarul ca să afli când este prevăzută următoarea trecere.",
    seeTimetable: "Vezi orarul",
    linesHere: "Linii care opresc aici",
  },

  tagDialog: {
    titleFavorite: "Favorit",
    titleTag: "Eticheta stației",
    label: "Cum îi spui tu",
    placeholder: "Acasă, birou, sală…",
    hint: (maxChars: number): string =>
      `Doar pentru tine: rămâne pe acest dispozitiv, maximum ${maxChars} caractere.`,
    linesLegend: "Linii de afișat",
    linesNone: "Nicio alegere: cardul arată toate liniile.",
    linesSome: (count: number): string =>
      `Doar ${n(count, { one: "linie", few: "linii", other: "de linii" })} pe card.`,
    showAllLines: "Arată toate liniile",
    removeTag: "Elimină eticheta",
  },

  timetable: {
    previousDay: "Ziua precedentă",
    nextDay: "Ziua următoare",
    today: "azi",
    scheduled: "orar programat",
    jumpToNow: "Mergi la acum",
    backToToday: "Înapoi la azi",
    fromServiceStart: "De la începutul programului",
    unavailableTitle: "Orar indisponibil",
    partialError: (error: string): string => `${error}. Vezi cursele deja încărcate.`,
    emptyTitle: "Nicio cursă de aici înainte",
    emptyFromNow:
      "De la această oră nu mai sunt treceri. Încearcă de la începutul programului, în altă zi, sau scoate filtrul de linie.",
    emptyWholeDay:
      "În această zi nu este programată nicio trecere: încearcă ziua dinainte sau cea de după, ori scoate filtrul de linie.",
    loadMore: "Arată mai multe curse",
    loadingMore: "Se încarcă…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${n(count, { one: "cursă", few: "curse", other: "de curse" })} de la ${from} la ${to}` +
      (complete ? ", până la sfârșitul programului" : "") +
      ". Sunt orarele oficiale ale zilei de circulație, fără timp real.",
  },

  map: {
    fallbackAria: "Hartă",
    vehiclesHeading: "Vehicule pe hartă",
    show: "Arată",
    hide: "Ascunde",
    modeGroup: "Ce vehicule să arătăm",
    modeApproaching: "Care vin aici",
    modeAllLines: "Toate liniile",
    loadingStop: "Încarc poziția stației…",
    stopMapAria: (stopName: string): string => `Harta vehiculelor din stația ${stopName}`,
    centreOnStop: "Centrează pe stație",
    nearbyVehicles: "Vehicule pe aproape",
    allVehicles: "Toate, chiar și cele departe",
    loadingVehicles: "Încarc vehiculele…",
    noneApproaching: "Niciun vehicul care se apropie",
    approachingCount: (count: number): string =>
      n(count, {
        one: "vehicul care se apropie",
        few: "vehicule care se apropie",
        other: "de vehicule care se apropie",
      }),
    onTheseLines: (count: number): string =>
      `${n(count, { one: "vehicul", few: "vehicule", other: "de vehicule" })} pe liniile acestei stații`,
    positionsAt: (clock: string): string => `poziții de la ${clock}`,
    positionsStale: "poziții neactualizate",
    allLinesNote:
      "Vehiculele pline se îndreaptă spre această stație, cele estompate circulă pe aceleași linii, dar acum nu trec pe aici.",
    approachingList: "Vehicule care se apropie",
    hereIn: (relative: string): string => `Aici ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Aici ${relative}, la ${clock}`,
    notInbound: "Circulă pe această linie, dar nu se îndreaptă spre această stație",
    noBearing: " · direcție netransmisă",
    follow: "Sunt în acest vehicul, urmărește-l",
    unfollow: "Nu mai urmări",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Linia ${line}, aici ${relative}${followed ? ", îl urmărești" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Linia ${line}, în circulație, nu vine spre această stație${followed ? ", îl urmărești" : ""}`,
    yourPosition: "Poziția ta",
    vehicleTitle: (vehicleId: string): string => `Vehiculul ${vehicleId}`,
    showOnMap: (stopName: string): string => `Arată ${stopName} pe hartă`,
    divertedSuffix: " · în afara traseului",
    divertedBadge: "În afara traseului",
    divertedNote: "Merge pe un traseu diferit de cel prevăzut.",
  },

  follow: {
    headlineLive: "Urmăresc acest vehicul",
    headlinePaused: "Urmărire în pauză",
    headlineStale: "Poziție oprită",
    headlineLost: "Vehiculul nu mai este pe linie",
    detailLive: "Harta rămâne centrată pe el la fiecare actualizare.",
    detailPaused:
      "Ai mutat harta, așa că nu o mai mișc eu. Atinge Reia ca să revii la vehicul.",
    detailStaleUnknown: "Vehiculul nu își mai transmite poziția de ceva vreme.",
    detailStale: (age: string): string =>
      `Vehiculul nu mai transmite de ${age}: cel de pe hartă este ultimul punct cunoscut.`,
    detailLost:
      "Nu îi mai primesc poziția. Poate a terminat cursa sau a ieșit din circulație.",
    ageMinutes: (minutes: number): string =>
      n(minutes, { one: "minut", few: "minute", other: "de minute" }),
    ageHours: (hours: number): string =>
      n(hours, { one: "oră", few: "ore", other: "de ore" }),
    compact: "Urmăresc",
    compactSr: (line: string): string => ` linia ${line}`,
    lineSr: (line: string): string => `, linia ${line}`,
    resume: "Reia",
    exit: "Ieși",
    close: "Închide",
    lostHint: "Dacă tot mai circulă, îl găsești trecând la „Toate liniile”.",
  },

  nearby: {
    title: "Stații din apropiere",
    mapAria: "Harta stațiilor din apropiere",
    searchHere: "Caută în această zonă",
    radius: "Rază",
    locating: "Localizez…",
    myPosition: "Poziția mea",
    geoDenied:
      "Permisiunea de localizare a fost refuzată. Afișăm centrul Romei: mută harta și caută în acea zonă.",
    geoUnavailable:
      "Poziție indisponibilă în acest moment. Afișăm centrul Romei: mută harta și caută în acea zonă.",
    geoTimeout:
      "Localizarea a durat prea mult. Afișăm centrul Romei: mută harta și încearcă din nou.",
    geoUnsupported:
      "Acest browser nu acceptă geolocalizarea. Mută harta ca să cauți stațiile.",
    outsideRome: "Ești în afara zonei Romei: afișăm centrul orașului.",
    outsideCoverage: "Această zonă este în afara ariei acoperite. Mută harta pe Roma.",
    focusStopMissing: "Stația cerută nu a fost găsită: afișăm zona ta.",
    focusStopFailed: (error: string): string => `Stația cerută nu a fost încărcată (${error}).`,
    stopsFailed: (error: string): string => `Stațiile nu au fost încărcate: ${error}`,
    loadingStops: "Caut stațiile…",
    noStopsInRadius: (radius: string): string =>
      `Nicio stație pe o rază de ${radius}. Încearcă să mărești raza sau să muți harta.`,
    onMapCap: (max: number): string => ` (primele ${max} pe hartă)`,
    noLines: "Nicio linie",
    arrivalsLink: "Sosiri",
    showMoreStops: "Arată mai multe stații",
  },

  line: {
    loading: "Încarc linia…",
    loadFailed: (error: string): string => `Linia nu a fost încărcată: ${error}`,
    mapAria: (name: string): string => `Harta liniei ${name}`,
    dataAt: (clock: string): string => `date de la ${clock}`,
    updatedAt: (clock: string): string => `actualizat la ${clock}`,
    vehiclesStale: (error: string): string => `Vehicule neactualizate: ${error}`,
    noPathForDirection: "Traseu indisponibil pentru această direcție",
    stopsHeading: (count: number): string => `Stații (${count})`,
    noStopsForDirection: "Nicio stație disponibilă pentru această direcție.",
    showAllStops: "Arată toate stațiile",
  },

  lineService: {
    inService: (count: number): string =>
      `${n(count, { one: "vehicul", few: "vehicule", other: "de vehicule" })} pe linie`,
    loadingVehicles: "Încarc vehiculele…",
    checkingTimetable: "Verific orarul…",
    feedDownTitle: "Poziții în timp real indisponibile",
    feedDownDetail:
      "Circulația poate fi normală: nu reușim să citim poziția vehiculelor.",
    noneReporting: "Niciun vehicul nu își semnalează poziția",
    unknownDetail:
      "Asta nu înseamnă că linia nu circulă: orarele programate sunt pe pagina unei stații.",
    scheduledDetail: (count: number): string =>
      `Circulația este programată: ${n(count, { one: "cursă prevăzută", few: "curse prevăzute", other: "de curse prevăzute" })} de acum până la sfârșitul zilei.`,
    finishedTitle: "Program încheiat pentru azi",
    finishedDetail: (count: number, clock: string): string =>
      `Azi ${n(count, { one: "cursă programată", few: "curse programate", other: "de curse programate" })}, ultima la ${clock}.`,
    noneTodayTitle: "Nicio cursă programată azi",
    noneTodayDetail: "Pe această linie nu figurează curse în orar pentru ziua de azi.",
    noneTodayFrom: (stopName: string): string =>
      `Din ${stopName} nu figurează curse în orar pentru ziua de azi.`,
    nextDepartures: "Următoarele plecări",
    nextDeparturesFrom: (stopName: string): string => ` din ${stopName}`,
    scheduledOnly: "Orare programate, fără timp real.",
  },

  journey: {
    title: "Traseu",
    subtitle: "Dintr-un punct în altul al Romei cu autobuzul, tramvaiul și metroul.",
    from: "Plecare",
    to: "Sosire",
    placeholder: "Stație, adresă sau loc",
    swap: "Inversează",
    whenLegend: "Când",
    now: "Acum",
    pickTime: "Alege ora",
    timeLabel: "Data și ora plecării",
    submit: "Caută traseul",
    resultsHeading: "Trasee",
    emptyTitle: "Unde vrei să mergi?",
    emptyHint:
      "Scrie o plecare și o sosire: căutăm cel mai bun traseu pe baza orarelor oficiale.",
    searching: "Caut traseele…",
    noResultsTitle: "Niciun traseu",
    noResultsHint:
      "Căutăm doar legături directe sau cu o schimbare. Încearcă să muți plecarea sau ora.",
    disclaimer:
      "Orare programate, nu în timp real: întârzierile efective nu sunt luate în calcul. Porțiunile pe jos sunt estimate în linie dreaptă, deci distanța reală pe stradă este mai mare.",
    searchedFrom: (when: string): string => ` Căutare de la ${when}.`,
    mapAria: "Harta traseului selectat",
    mapCaption:
      "Porțiunile din vehicul urmează traseul real al liniei. Cele punctate sunt estimate în linie dreaptă: legăturile pe jos și rarele linii fără traseu.",
    missingEndpoints: "Indică atât plecarea, cât și sosirea.",
    badDateTime: "Dată și oră nevalide.",
    geoUnsupported: "Acest browser nu acceptă geolocalizarea.",
    geoUnavailable: "Poziție indisponibilă în acest moment.",
    geoOutsideRome: "Ești în afara zonei Romei: scrie o adresă.",
    geoDenied: "Permisiunea de localizare a fost refuzată: scrie o adresă.",
    geoTimeout: "Localizarea a durat prea mult.",
    originMarker: (name: string): string => `Plecare: ${name}`,
    destinationMarker: (name: string): string => `Sosire: ${name}`,
    useMyPosition: "Folosește poziția mea",
    clearField: (label: string): string => `Golește ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Sugestii pentru ${label.toLowerCase()}`,
    placeStop: "Stație",
    placeCoord: "Coordonate",
    placeAddress: "Adresă",
    walkOnly: "Doar pe jos",
    walkOnlyShort: "pe jos",
    noTransfers: "fără schimbări",
    transfers: (count: number): string =>
      n(count, { one: "schimbare", few: "schimbări", other: "de schimbări" }),
    walkDistance: (distance: string): string => `${distance} pe jos`,
    walkLeg: (distance: string, duration: string): string =>
      `Pe jos ${distance}, aproximativ ${duration} până la `,
    inService: "în circulație",
    stopCount: (count: number): string =>
      n(count, { one: "stație", few: "stații", other: "de stații" }),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Traseul ${index}: plecare ${departure}, sosire ${arrival}`,
    lineDetailsAria: (line: string): string => `Linia ${line}, detalii`,
    hours: (hours: number): string => `${hours} h`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} h ${minutes}`,
    /** journey.ts runs on the server and has no locale: it sends a slug. */
    noticeNoOriginStops:
      "Nicio stație la distanță de mers pe jos de punctul de plecare: încearcă o adresă mai aproape de o linie.",
    noticeNoDestinationStops:
      "Nicio stație la distanță de mers pe jos de punctul de sosire: încearcă o adresă mai aproape de o linie.",
    noticeNoConnection: "Nicio legătură între aceste două zone în orele următoare.",
    noticeWalkOnlyLeft:
      "Nicio legătură programată în orele următoare: rămâne doar traseul pe jos.",
    noticeLaterDepartures:
      "Nimic programat în ora și jumătate care vine: arătăm primele curse de după.",
  },

  alerts: {
    title: "Anunțuri de circulație",
    subtitle: "Devieri, suspendări și modificări publicate în fluxul oficial.",
    loading: "Se încarcă…",
    degraded:
      "Fluxul în timp real nu răspunde sau este vechi: aceste anunțuri ar putea să nu fie actualizate.",
    loadFailed: "Anunțurile nu au putut fi încărcate.",
    refreshFailed: (error: string): string =>
      `Ultima actualizare a eșuat (${error}): vezi lista precedentă.`,
    searchPlaceholder: "Caută: grevă, deviere, stradă…",
    searchAria: "Caută printre anunțuri",
    filterByLine: "Filtrează după linie",
    allLines: (count: number): string => `Toate liniile (${count})`,
    networkWide: "Anunțuri generale",
    clearFilters: "Resetează",
    noMatch: "Niciun anunț nu corespunde filtrelor.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${pick(shown, { one: "anunț", few: "anunțuri", other: "de anunțuri" })} din ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${pick(count, { one: "anunț activ", few: "anunțuri active", other: "de anunțuri active" })} pe ${lines} linii.`,
    goToLine: "Mergi la linie",
    noneTitle: "Niciun anunț activ",
    noneHint:
      "Momentan fluxul nu semnalează întreruperi sau modificări ale circulației. Mai verifică înainte de a pleca.",
    noResultsTitle: "Niciun rezultat",
    noResultsHint:
      "Încearcă cu mai puține cuvinte sau resetează filtrele ca să revezi toate anunțurile.",
    noSelectionTitle: "Niciun anunț selectat",
    noSelectionHint: "Alege un anunț din lista din stânga ca să îl citești în întregime.",
    showMoreLines: (count: number): string => `Arată mai multe linii (${count})`,
    goToLineShort: "mergi la linie",
    fallbackHeader: "Anunț de circulație",
    noDetail: "Niciun detaliu publicat de operator.",
    operatorLink: "Detalii pe site-ul operatorului",
    affectedLines: "Linii afectate",
    alsoOn: "Și pe",
    contextHeading: (count: number): string =>
      `${count} ${pick(count, { one: "anunț activ", few: "anunțuri active", other: "de anunțuri active" })}`,
    contextAria: "Anunțuri de circulație",
    contextAll: "Toate",
    contextUnavailable: (error: string): string => `Anunțuri indisponibile: ${error}`,
    contextMore: (count: number): string => `Încă ${count} anunțuri pe `,
    contextMoreLink: "pagina anunțurilor",
    contextStale: (error: string): string =>
      `Ultima actualizare a eșuat (${error}): aceste anunțuri ar putea să nu mai fie actuale.`,
    windowBetween: (from: string, until: string): string => `De la ${from} până la ${until}`,
    windowFrom: (from: string): string => `De la ${from}, fără termen indicat`,
    windowUntil: (until: string): string => `Până la ${until}`,
    windowUnknown: "Perioadă de valabilitate neindicată",
    effect: (code: string): string | null => EFFECT_RO[code] ?? null,
    cause: (code: string): string | null => CAUSE_RO[code] ?? null,
  },

  settings: {
    title: "Setări",
    subtitle: "Totul rămâne pe acest dispozitiv. Niciun cont, niciun server.",
    sectionArrivals: "Sosiri",
    autoRefresh: "Actualizare automată",
    everySeconds: (seconds: number): string => `la fiecare ${seconds} secunde`,
    autoRefreshHint: "Intervalul dintre două citiri ale fluxului în timp real.",
    maxArrivals: "Sosiri afișate pe stație",
    showScheduled: "Arată orarele programate",
    showScheduledHint:
      "Când timpul real nu are nimic pentru o stație, folosește orarul.",
    sectionNearby: "Aproape de mine",
    radius: "Raza de căutare",
    radiusHint: "Este valabilă și pentru razele rapide de pe harta stațiilor din apropiere.",
    sectionAppearance: "Aspect",
    themeLegend: "Temă",
    themeSystem: "Sistem",
    themeLight: "Luminoasă",
    themeDark: "Întunecată",
    sectionLanguage: "Limbă",
    languageLegend: "Limba interfeței",
    languageSystem: "Sistem",
    languageHint: (resolved: string): string =>
      `Cu „Sistem” urmăm limba browserului: acum este ${resolved}.`,
    sectionBackup: "Copie de siguranță a favoritelor",
    backupIntro:
      "Un fișier JSON pe dispozitivul tău: așa muți favoritele în alt browser, de vreme ce aici nu există niciun cont.",
    exportCount: (count: number): string => `Exportă (${count})`,
    importFromFile: "Importă din fișier",
    exported: (count: number): string => `Exportate ${count} favorite.`,
    exportFailed: "Exportul nu a reușit în acest browser.",
    fileTooLarge: "Fișierul este prea mare ca să fie o copie a favoritelor.",
    fileUnreadable: "Fișierul nu a putut fi citit.",
    importEmpty: "Fișierul este gol.",
    importNotJson: "Fișierul nu este un JSON valid.",
    importNoList: "Fișierul nu conține o listă de favorite.",
    importNoneValid: "Niciun favorit valid găsit în fișier.",
    importFound: (count: number): string => `Găsite ${count} favorite valide`,
    importSkipped: (count: number): string => `, ${count} intrări respinse.`,
    importFoundEnd: ".",
    importMerge: "Îmbină",
    importReplace: "Înlocuiește",
    replaced: (count: number): string => `Favorite înlocuite: acum sunt ${count}.`,
    mergedNone: "Niciun favorit nou de adăugat.",
    merged: (count: number): string => `Adăugate ${count} favorite.`,
    sectionLocalData: "Date locale",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} favorite, ${recents} stații în istoric.`,
    confirmClearFavorites: "Ștergi toate favoritele? Operațiunea nu poate fi anulată.",
    confirmClearFavoritesYes: "Da, golește",
    clearFavorites: "Golește favoritele",
    favoritesCleared: "Favorite golite.",
    confirmClearRecents: "Ștergi istoricul stațiilor văzute?",
    confirmClearRecentsYes: "Da, șterge",
    clearRecents: "Șterge istoricul",
    recentsCleared: "Istoric șters.",
    resetDefaults: "Restabilește setările implicite",
    settingsReset: "Setări readuse la valorile implicite.",
    infoLink: "Informații, surse ale datelor și întrebări frecvente",
  },

  sync: {
    titleFull: "Sincronizează dispozitivele",
    titleCollapsed: "Sincronizare",
    badgeOn: "activă",
    summaryLoading: "…",
    summaryUnavailable: "Indisponibilă pe această conexiune",
    summaryOff: "Inactivă",
    summarySyncing: "Sincronizare în curs…",
    summaryError: "Eroare de sincronizare",
    summaryConflict: "Conflict de rezolvat",
    summaryOn: (last: string): string => `Activă · ultima ${last}`,
    intro:
      "Mută favoritele, recentele și setările pe alt dispozitiv cu un cod. Datele sunt criptate aici: serverul păstrează doar date ilizibile.",
    enable: "Activează sincronizarea",
    haveCode: "Am deja un cod",
    codeLabel: "Cod de sincronizare",
    codeHint:
      "20 de caractere, așa cum le citești pe celălalt dispozitiv. Majusculele, liniuțele și spațiile nu contează.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} caractere`,
    join: "Conectează",
    onIntro:
      "Datele sunt criptate pe acest dispozitiv înainte să plece. Cine are codul poate citi toate favoritele tale: folosește-l doar pe dispozitivele tale.",
    code: "Cod",
    showCode: "Arată codul",
    hideCode: "Ascunde codul",
    copyCode: "Copiază codul",
    copied: "Copiat",
    lastSync: "Ultima sincronizare:",
    inProgress: " · în curs…",
    syncNow: "Sincronizează acum",
    disconnect: "Deconectează",
    disconnectNote:
      "La deconectare, datele rămân pe acest dispozitiv, iar copia criptată rămâne pe server până când o ștergi.",
    deleteWarning:
      "Șterge copia criptată de pe server. Celelalte dispozitive nu vor mai găsi nimic de sincronizat. Nu se poate anula.",
    deleteConfirm: "Șterge cu adevărat",
    deleteRemote: "Șterge datele de pe server",
    justNow: "acum",
    minutesAgo: (minutes: number): string => `acum ${minutes} min`,
    atClock: (clock: string): string => `la ${clock}`,
    errors: {
      aborted: "Operațiune anulată.",
      generic: "Sincronizarea nu a reușit. Încearcă din nou peste câteva momente.",
      insecureContext:
        "Sincronizarea are nevoie de o conexiune sigură: deschide site-ul pe https (sau pe localhost). Pe http simplu browserele opresc criptarea, așa că nimic nu poate fi criptat pe acest dispozitiv.",
      noBase64Encode: "Acest browser nu poate codifica datele de sincronizare.",
      noBase64Decode: "Acest browser nu poate decodifica datele de sincronizare.",
      invalidSyncData: (what: string): string => `Date de sincronizare nevalide (${what}).`,
      codeRequired: "Introdu codul de sincronizare.",
      codeTooLong: (max: number): string =>
        `Codul este prea lung: ar trebui să aibă ${n(max, { one: "caracter", few: "caractere", other: "de caractere" })}.`,
      codeInvalidChars: (chars: string): string =>
        `Codul conține caractere care nu sunt permise: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Codul are ${n(required, { one: "caracter", few: "caractere", other: "de caractere" })}, tu ai scris ${actual}.`,
      keyDerivationFailed: "Acest browser nu reușește să derive cheile de sincronizare.",
      preparePayloadFailed: "Nu s-au putut pregăti datele de sincronizat.",
      encryptFailed: "Datele nu au putut fi criptate pe acest dispozitiv.",
      decryptFailed:
        "Codul nu se potrivește cu aceste date sau datele de pe server sunt deteriorate.",
      invalidSyncId: "Identificator de sincronizare nevalid.",
      responseTooLarge: "Serverul a trimis înapoi prea multe date.",
      timeout: "Serverul nu a răspuns la timp.",
      unreachable: "Serverul nu poate fi contactat. Verifică conexiunea.",
      invalidResponse: "Răspuns nevalid de la server.",
      invalidResponseField: (what: string): string => `Răspuns nevalid de la server (${what}).`,
      unexpectedFormat: "Serverul a răspuns într-un format neașteptat.",
      rateLimited: "Prea multe sincronizări una după alta. Încearcă din nou peste un minut.",
      pullRejected: (status: number): string =>
        `Serverul a refuzat citirea (eroare ${status}).`,
      payloadTooLarge: "Sunt prea multe date pentru sincronizare.",
      pushRejected: (status: number): string =>
        `Serverul a refuzat salvarea (eroare ${status}).`,
      deleteRejected: (status: number): string =>
        `Serverul a refuzat ștergerea (eroare ${status}).`,
      conflict:
        "Alt dispozitiv scrie chiar acum în aceleași date. Datele tale locale sunt în siguranță: încearcă din nou peste câteva secunde.",
    },
    status: {
      deleted: "Date șterse de pe server. Acest dispozitiv nu mai este sincronizat.",
      disconnected:
        "Sincronizarea este oprită pe acest dispozitiv. Datele tale rămân aici, iar copia criptată rămâne pe server până când o ștergi.",
    },
  },

  info: {
    title: "Informații",
    subtitle:
      "Orare și sosiri ale transportului public din Roma, din datele deschise oficiale.",
    unofficialTitle: "Aplicație neoficială",
    unofficialBody:
      "Acest site nu este afiliat, asociat, autorizat sau susținut în niciun fel de ATAC S.p.A., de Roma Servizi per la Mobilità sau de Roma Capitale. Este un proiect independent care se limitează la a citi datele deschise pe care aceste instituții le publică. Pentru informații oficiale, bilete și reclamații adresează-te canalelor lor.",
    whatTitle: "Ce este",
    whatBody1:
      "O aplicație web ca să afli peste cât timp trece următorul vehicul în stația unde te afli. Cauți o stație sau o linie, o salvezi la favorite și o regăsești pe pagina principală cu sosirile actualizate. Fără cont, fără reclame, fără statistici de utilizare.",
    whatBody2:
      "Când fluxul în timp real acoperă cursa, ora afișată este o estimare bazată pe poziția vehiculului. Altfel aplicația revine la orarul programat și îți spune întotdeauna acest lucru, în loc să dea drept estimare o dată veche.",
    dataTitle: "De unde vin datele",
    dataBodyBefore:
      "Orarele, stațiile, liniile, traseele, pozițiile vehiculelor și anunțurile de circulație provin din datele deschise ale ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (fluxuri GTFS și GTFS-Realtime). Orarele programate sunt actualizate zilnic, timpul real aproximativ la fiecare 30 de secunde.",
    dataLink: "romamobilita.it — Date deschise",
    dataLicence:
      "Datele rămân proprietatea titularilor respectivi și sunt folosite în condițiile licenței sub care sunt publicate.",
    privacyTitle: "Confidențialitate",
    privacyBody:
      "Nu există autentificare și niciun profil de utilizator. Favoritele, stațiile văzute recent și setările sunt salvate doar în browserul tău și nu sunt trimise nicăieri. Poziția, dacă o acorzi pentru căutarea stațiilor din apropiere, rămâne pe dispozitiv: este folosită pentru a calcula distanțele și nu este stocată.",
    faqTitle: "Întrebări frecvente",
    faq1Q: "De ce nu apare o linie sau un autobuz?",
    faq1A:
      "Arătăm doar ce există în fluxurile oficiale. Dacă un vehicul nu își transmite poziția, sau dacă cursa lui nu este în fluxul în timp real, pentru noi nu există: cel mult vei vedea orarul programat. Se întâmplă des cu cursele de înlocuire, autobuzele navetă și vehiculele cu localizatorul defect.",
    faq2Q: "De ce orarele sunt diferite de cele scrise în stație?",
    faq2A:
      "Panoul din stație indică orarul programat, care se schimbă de câteva ori pe an. Aici, când vehiculul transmite, vezi estimarea calculată pe poziția lui reală, care ține cont de trafic și de întârzieri. Când în schimb citești „programat”, estimarea nu există și arătăm același orar ca panoul.",
    faq3Q: "Ce se întâmplă noaptea?",
    faq3A:
      "Noaptea fluxul în timp real este aproape gol, pentru că circulă puține vehicule. Aplicația funcționează în continuare cu orarele programate ale liniilor de noapte. În GTFS ziua de circulație nu se termină la miezul nopții, ci la 04:00: o cursă de la ora unu noaptea aparține încă zilei precedente, și de aceea poți vedea ore ca 25:30 traduse în 01:30.",
    faq4Q: "Favoritele mele ajung pe un server?",
    faq4A:
      "Nu. Favoritele, istoricul și setările stau în localStorage-ul browserului. Dacă golești datele site-ului sau schimbi dispozitivul, dispar: din setări le poți exporta într-un fișier JSON și le poți reimporta în altă parte.",
    settingsLink: "Mergi la setări",
  },

  footer: {
    dataPrefix: "Date de circulație și orare: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (date deschise GTFS).",
    independent:
      "Proiect independent, neafiliat cu ATAC sau cu Roma Servizi per la Mobilità. ",
    infoLink: "Informații",
  },

  errors: {
    genericTitle: "Ceva nu a funcționat",
    unexpected: "Eroare neașteptată",
    unexpectedDot: "Eroare neașteptată.",
    stopNotFound: "Stație negăsită",
    serviceDown: "Serviciul nu răspunde",
    requestFailed: (status: number): string => `Cererea a eșuat (${status})`,
    httpStatus: (status: number): string => `Eroare ${status}`,
    badResponse: "Răspuns nevalid de la server",
    badResponseDot: "Răspuns nevalid de la server.",
    timedOut: "Cerere expirată",
    timedOutDot: "Cerere expirată.",
    offline: "Fără conexiune",
    connectionFailed: "Conexiunea a eșuat.",
    tooManyRequests: "Prea multe cereri",
    badRequest: "Parametri nevalizi",
    lineNotFound: "Linie negăsită",
    journeyOriginNotFound: "Plecare negăsită",
    journeyDestinationNotFound: "Sosire negăsită",
    journeyPlaceHint: "Încearcă cu o adresă mai precisă.",
  },

  notFound: {
    kicker: "Eroare 404",
    title: "Stație nedeservită",
    body:
      "Această pagină nu există. Se poate întâmpla cu un link vechi sau cu codul unei stații ori al unei linii care nu mai este în flux.",
    searchCta: "Caută o stație",
    nearbyCta: "Stații din apropiere",
  },

  appError: {
    title: "Cursă întreruptă",
    body:
      "Acest ecran nu a reușit să se încarce. Încearcă din nou: dacă problema persistă, probabil serviciul de date nu răspunde.",
    digest: (digest: string): string => `Cod: ${digest}`,
    backHome: "Înapoi acasă",
    globalTitle: "Serviciu suspendat",
    globalBody:
      "Aplicația s-a oprit din cauza unei erori neașteptate. Reîncarcă pagina: favoritele tale rămân salvate pe telefon și nu se pierd.",
    reload: "Reîncarcă",
  },

  format: {
    due: "intră în stație",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "dată indisponibilă",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "actualizare necunoscută",
    ageSeconds: (seconds: number): string => `actualizat acum ${seconds} s`,
    ageMinutes: (minutes: number): string => `actualizat acum ${minutes} min`,
    ageAt: (clock: string): string => `actualizat la ${clock}`,
    onTime: "la timp",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — plecări în timp real",
    appDescription:
      "Orare și treceri în timp real ale autobuzelor, tramvaielor și metroului din Roma. Favorite, stații din apropiere și anunțuri de serviciu, fără cont și fără reclame.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Stațiile ATAC cele mai apropiate de tine, cu hartă și liniile care trec pe acolo.",
    journeyDescription:
      "Calculează cum ajungi dintr-un punct în altul al Romei cu autobuzul, tramvaiul și metroul, pe orarele oficiale ATAC.",
    alertsDescription:
      "Devieri, suspendări și modificări de serviciu publicate pe fluxul oficial.",
    settingsDescription:
      "Actualizarea sosirilor, raza de căutare, tema și gestionarea favoritelor.",
    infoDescription:
      "Ce este această aplicație, de unde vin datele și de ce nu este afiliată cu ATAC sau cu Roma Servizi per la Mobilità.",
    stopDescription: "Următoarele treceri în timp real și orarul programat al stației.",
    lineDescription: "Traseul, stațiile și vehiculele în timp real ale liniei.",
  },

  skeleton: {
    loading: "Se încarcă",
  },
};

const EFFECT_RO: Record<string, string | undefined> = {
  NO_SERVICE: "Circulație suspendată",
  REDUCED_SERVICE: "Circulație redusă",
  SIGNIFICANT_DELAYS: "Întârzieri semnificative",
  DETOUR: "Deviere",
  ADDITIONAL_SERVICE: "Curse suplimentare",
  MODIFIED_SERVICE: "Circulație modificată",
  STOP_MOVED: "Stație mutată",
  NO_EFFECT: "Niciun efect asupra circulației",
  ACCESSIBILITY_ISSUE: "Problemă de accesibilitate",
  OTHER_EFFECT: "Altul",
  UNKNOWN_EFFECT: "Efect nespecificat",
};

const CAUSE_RO: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Defecțiune tehnică",
  STRIKE: "Grevă",
  DEMONSTRATION: "Manifestație",
  ACCIDENT: "Accident",
  HOLIDAY: "Sărbătoare",
  WEATHER: "Vreme rea",
  MAINTENANCE: "Întreținere",
  CONSTRUCTION: "Lucrări",
  POLICE_ACTIVITY: "Intervenția poliției",
  MEDICAL_EMERGENCY: "Urgență medicală",
  OTHER_CAUSE: "Altă cauză",
  UNKNOWN_CAUSE: "Cauză nespecificată",
};
