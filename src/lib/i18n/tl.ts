/**
 * Filipino dictionary. Shape and key order follow it.ts, the source of truth.
 * Filipino nouns stay unmarked after a numeral ("3 hintuan"), so counted
 * strings interpolate directly and need no plural helper.
 */

import type { Dictionary } from "./it";

export const tl: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, home",
  },

  a11y: {
    skipToContent: "Pumunta sa nilalaman",
  },

  common: {
    retry: "Subukan ulit",
    cancel: "Kanselahin",
    save: "I-save",
    close: "Isara",
    home: "Home",
    back: "Bumalik",
    all: "Lahat",
    loading: "Naglo-load…",
    searching: "Naghahanap…",
    refresh: "I-refresh",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Burahin ang hinahanap",
    searchInProgress: "Naghahanap",
  },

  nav: {
    primary: "Pangunahing nabigasyon",
    sidebar: "Sidebar",
    sidebarNav: "Nabigasyon sa gilid",
    openMenu: "Buksan ang menu",
    closeMenu: "Isara ang menu",
    sections: "Mga seksyon",
    shortcuts: "Mga shortcut",
    infoAria: "Impormasyon tungkol sa app",
    home: "Home",
    nearbyShort: "Malapit",
    nearby: "Mga hintuan malapit dito",
    journey: "Ruta",
    alerts: "Mga abiso",
    settings: "Mga setting",
    info: "Info",
    hintNearby: "Anong dumadaan dito sa paligid",
    hintJourney: "Mula sa isang punto papunta sa isa pa",
    hintAlerts: "Mga liko at putol na biyahe",
    hintSettings: "Pag-update, tema, datos",
    hintInfo: "Pinagkunan at legal na paalala",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tram";
        case 1:
          return "metro";
        case 2:
          return "tren";
        case 4:
          return "ferry";
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
          return "Tren";
        case 3:
          return "Bus";
        default:
          return "Ruta";
      }
    },
    named: (name: string): string => `Ruta ${name}`,
    namedAria: (name: string): string => `Ruta ${name}`,
    details: "detalye",
    towards: (headsign: string): string => `papuntang ${headsign}`,
    towardsCapital: (headsign: string): string => `Papuntang ${headsign}`,
    direction: "Direksyon",
    terminus: "dulong hintuan",
    noHeadsign: "Walang nakasaad na patutunguhan",
  },

  stops: {
    code: (code: string): string => `Hintuan ${code}`,
    codeOnly: "Hintuan",
    pole: (code: string): string => `Poste ${code}`,
    accessible: "Hintuang accessible",
    named: (name: string): string => `Hintuang ${name}`,
    countLabel: (count: number): string => `${count} hintuan`,
    involved: (count: number): string => `${count} hintuan ang apektado`,
  },

  home: {
    kicker: "Roma · pampublikong transportasyon",
    title: "Kailan dadaan?",
    intro:
      "Maghanap ng hintuan sa numero o pangalan, o kaya ng ruta. Ang mga oras ng pagdating ay galing sa real-time na datos ng Roma.",
  },

  search: {
    inputAria: "Maghanap ng hintuan o ruta",
    placeholder: "Hintuan, kalye o ruta",
    searchingFor: (query: string): string => `Hinahanap ang «${query}»…`,
    noResultsFor: (query: string): string => `Walang resulta para sa «${query}»`,
    noResultsHint:
      "Subukan ang numero ng hintuan (halimbawa 70101), ang pangalan ng kalye, o ang numero ng ruta.",
    resultsList: "Mga resulta ng paghahanap",
    keyboardHint: "↑ ↓ para maglakad, Enter para buksan, Esc para isara",
  },

  favorites: {
    heading: "Mga paborito",
    emptyTitle: "Wala pang paborito",
    emptyHint:
      "Pindutin ang bituin ★ sa tabi ng isang hintuan o ruta: sa paghahanap, sa Mga hintuan malapit dito, sa pahina ng hintuan o sa pahina ng ruta. Makikita mo rito, hindi mo na kailangang hanapin palagi.",
    reorder: "Ayusin ang pagkakasunod",
    reorderDone: "Tapos na",
    reorderHint: "Ilipat ang mga hintuan gamit ang mga arrow. Ang pagkakasunod ay para sa device na ito.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: pwesto ${position} sa ${total}.`,
    moveUp: (name: string): string => `Iakyat ang ${name}`,
    moveDown: (name: string): string => `Ibaba ang ${name}`,
    addStar: (name: string): string => `Lagyan ng bituin ang hintuang ${name}`,
    removeStar: (name: string): string => `Alisin ang bituin sa hintuang ${name}`,
    addStarLine: (name: string): string => `Lagyan ng bituin ang rutang ${name}`,
    removeStarLine: (name: string): string => `Alisin ang bituin sa rutang ${name}`,
    starredTitle: "May bituin: nasa mga paborito",
    starTitle: "Lagyan ng bituin",
    starredLabel: "May bituin",
    starLabel: "Bituin",
    editLabels: (name: string): string => `Baguhin ang label at mga ruta ng ${name}`,
    onlyLines: (labels: string): string => `${labels} lang`,
    notUpdated: "hindi na-update",
    noArrivalsOnPinned: "Walang biyahe sa mga napiling ruta.",
    changeLines: "Palitan ang mga ruta",
    noArrivalsSoon: "Walang biyahe sa susunod na ilang minuto.",
    openForTimes: "Buksan para sa mga oras",
    vehiclesUnavailable: "Walang datos ng sasakyan",
    lookingForVehicles: "Hinahanap ang mga sasakyang bumibiyahe…",
    noVehiclesNow: "Walang sasakyang bumibiyahe ngayon",
    vehiclesInService: (count: number): string => `${count} sasakyan ang bumibiyahe ngayon`,
    refreshArrivals: "I-refresh ang mga pagdating",
    undoRemovedStop: "Hintuang walang bituin: wala na sa mga paborito.",
    undoRemovedLine: "Rutang walang bituin: wala na sa mga paborito.",
    undoDismiss: "Isara ang abiso",
    more: (count: number): string => `${count} pang paborito`,
    sidebarEmptyBefore: "Pindutin ang bituin sa tabi ng hintuan o ruta, sa paghahanap, sa ",
    sidebarEmptyAfter: " o sa pahinang tinitingnan mo. Makikita mo rito.",
    nextDeparture: "susunod na biyahe",
    noDeparture: "walang biyaheng makikita",
    notAvailableShort: "wala",
  },

  recents: {
    heading: "Kamakailang tiningnan",
    clear: "Linisin",
    emptyTitle: "Walang kamakailang hintuan",
    emptyHint:
      "Ang mga hintuang binubuksan mo ay mananatili rito nang ilang araw, para hindi mo na kailangang hanapin ulit.",
    listAria: "Mga hintuang kamakailang tiningnan",
    justNow: "kanina lang",
    today: "ngayon",
    yesterday: "kahapon",
  },

  arrivals: {
    due: "paparating na",
    live: "real-time",
    scheduled: "ayon sa iskedyul",
    scheduledTail: " nakaiskedyul",
    scheduledSr: "oras sa iskedyul",
    onTime: "nasa oras",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "huli",
    earlySuffix: "maaga",
    lateSr: (minutes: number): string => `${minutes} minutong huli`,
    earlySr: (minutes: number): string => `${minutes} minutong maaga`,
    skipped: "kanselado",
    skippedSr: "kanseladong biyahe",
    atClock: (clock: string): string => `alas-${clock}`,
    towardsSr: (headsign: string): string => `direksyong ${headsign}`,
    loadingAria: "Naglo-load ng mga pagdating",
    emptyTitle: "Walang inaasahang biyahe",
    emptyHint:
      "Walang biyaheng papalapit. Subukan ang nakaiskedyul na oras o balikan mamaya.",
    frozenUnknown: "hindi na-update ang tantiya",
    frozenFor: (minutes: number): string => `${minutes} min nang nakatigil`,
    frozenPrefix: (state: string): string => `tantiyang ${state}`,
    frozenSr: (state: string): string => `tantiyang ${state}, hindi na-update nang real-time`,
    expectedSr: (relative: string, clock: string): string =>
      `inaasahan ${relative}, alas-${clock}`,
    bannerNoRealtimeStrong: "Walang real-time na datos.",
    bannerNoRealtime:
      " Ipinapakita namin ang nakaiskedyul na oras: puwedeng mas maaga o mas huli dumaan ang sasakyan.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Nakatigil ang real-time na datos." : `${minutes} min nang nakatigil ang real-time na datos.`,
    bannerFrozenBefore: " Ang mga tantiya sa ibaba ay galing sa",
    bannerFrozenLastUpdate: " huling pag-update",
    bannerFrozenAt: (clock: string): string => ` alas-${clock}`,
    bannerFrozenAfter: " at hindi na-a-update: pag-ingatan.",
    bannerPartialStrong: "Bahagi lang ang real-time na datos.",
    bannerPartial: " May bahagi ng datos na hindi dumating: puwedeng may kulang na biyahe.",
    showOnMap: (line: string): string => `Ipakita sa mapa ang sasakyan ng rutang ${line}`,
    hideOnMap: (line: string): string => `Alisin ang highlight sa sasakyan ng rutang ${line}`,
  },

  dataAge: {
    prefix: "Na-update",
    now: "ngayon",
    secondsAgo: (seconds: number): string => `${seconds} seg ang nakalipas`,
    minutesAgo: (minutes: number): string => `${minutes} min ang nakalipas`,
    atClock: (clock: string): string => `alas-${clock}`,
    never: "kailanman",
  },

  refreshFeedback: {
    updated: "Na-update",
    unchanged: "Nasuri, walang bago",
    failed: "Hindi na-update",
    updatedShort: "Na-update",
    unchangedShort: "Walang bago",
    failedShort: "Hindi na-update",
    busy: "Ina-update…",
    busySpoken: "Ina-update",
  },

  stop: {
    tabArrivals: "Mga pagdating",
    tabTimetable: "Iskedyul",
    tabsAria: "Tanawin ng hintuan",
    editTag: "Baguhin ang label",
    addTag: "Label",
    map: "Mapa",
    realtimePrefix: "Real-time",
    noRealtime: "Walang real-time na datos",
    pageNotUpdated: "Hindi pa na-update ang pahina",
    pageUpdatedAt: (clock: string): string => `Na-update ang pahina alas-${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Ang nakikita mo ay ang huling natanggap na datos.`,
    arrivalsUnavailable: "Walang datos ng pagdating",
    emptyHint:
      "Walang biyaheng papalapit ngayon. Buksan ang iskedyul para malaman kung kailan ang susunod na biyahe.",
    seeTimetable: "Tingnan ang iskedyul",
    linesHere: "Mga rutang humihinto rito",
  },

  tagDialog: {
    titleFavorite: "Paborito",
    titleTag: "Label ng hintuan",
    label: "Ano ang tawag mo rito",
    placeholder: "Bahay, opisina, gym…",
    hint: (maxChars: number): string =>
      `Para sa iyo lang: mananatili sa device na ito, hanggang ${maxChars} karakter.`,
    linesLegend: "Mga rutang ipapakita",
    linesNone: "Walang napili: ipapakita ng card ang lahat ng ruta.",
    linesSome: (count: number): string => `${count} ruta lang sa card.`,
    showAllLines: "Ipakita ang lahat ng ruta",
    removeTag: "Alisin ang label",
  },

  timetable: {
    previousDay: "Nakaraang araw",
    nextDay: "Susunod na araw",
    today: "ngayon",
    scheduled: "nakaiskedyul na oras",
    jumpToNow: "Pumunta sa ngayon",
    backToToday: "Balik sa ngayon",
    fromServiceStart: "Mula sa simula ng biyahe",
    unavailableTitle: "Walang iskedyul",
    partialError: (error: string): string => `${error}. Ang nakikita mo ay ang mga biyaheng na-load na.`,
    emptyTitle: "Wala nang biyahe mula rito",
    emptyFromNow:
      "Mula sa oras na ito, wala nang biyahe. Subukan mula sa simula ng biyahe, ibang araw, o alisin ang salaan sa ruta.",
    emptyWholeDay:
      "Sa araw na ito ay walang nakaiskedyul na biyahe: subukan ang araw bago o pagkatapos, o alisin ang salaan sa ruta.",
    loadMore: "Magpakita ng iba pang biyahe",
    loadingMore: "Naglo-load…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${count} biyahe mula alas-${from} hanggang alas-${to}` +
      (complete ? ", hanggang sa huling biyahe" : "") +
      ". Ito ang opisyal na oras ng araw ng biyahe, walang real-time.",
  },

  map: {
    fallbackAria: "Mapa",
    vehiclesHeading: "Mga sasakyan sa mapa",
    show: "Ipakita",
    hide: "Itago",
    modeGroup: "Aling mga sasakyan ang ipapakita",
    modeApproaching: "Papunta rito",
    modeAllLines: "Lahat ng ruta",
    loadingStop: "Naglo-load ng lokasyon ng hintuan…",
    stopMapAria: (stopName: string): string => `Mapa ng mga sasakyan sa hintuang ${stopName}`,
    centreOnStop: "Isentro sa hintuan",
    nearbyVehicles: "Mga sasakyan malapit dito",
    allVehicles: "Lahat, pati ang malayo",
    loadingVehicles: "Naglo-load ng mga sasakyan…",
    noneApproaching: "Walang sasakyang papalapit",
    approachingCount: (count: number): string => `${count} sasakyan ang papalapit`,
    onTheseLines: (count: number): string => `${count} sasakyan sa mga ruta ng hintuang ito`,
    positionsAt: (clock: string): string => `mga lokasyon noong alas-${clock}`,
    positionsStale: "hindi na-update ang mga lokasyon",
    allLinesNote:
      "Ang mga sasakyang malinaw ang kulay ay papunta sa hintuang ito, ang mga malabo ay nasa parehong ruta pero hindi dumadaan dito ngayon.",
    approachingList: "Mga sasakyang papalapit",
    hereIn: (relative: string): string => `Narito ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Narito ${relative}, alas-${clock}`,
    notInbound: "Bumibiyahe sa rutang ito, pero hindi papunta sa hintuang ito",
    noBearing: " · walang ipinadalang direksyon",
    follow: "Nasa sasakyang ito ako, sundan mo",
    unfollow: "Itigil ang pagsunod",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Ruta ${line}, narito ${relative}${followed ? ", sinusundan mo" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Ruta ${line}, bumibiyahe, hindi papunta sa hintuang ito${followed ? ", sinusundan mo" : ""}`,
    yourPosition: "Ang lokasyon mo",
    vehicleTitle: (vehicleId: string): string => `Sasakyan ${vehicleId}`,
    showOnMap: (stopName: string): string => `Ipakita ang ${stopName} sa mapa`,
    divertedSuffix: " · labas sa ruta",
    divertedBadge: "Labas sa ruta",
    divertedNote: "Ibang daan ang tinatahak, hindi ang nakaplano.",
  },

  follow: {
    headlineLive: "Sinusundan ko ang sasakyang ito",
    headlinePaused: "Naka-pause ang pagsunod",
    headlineStale: "Hindi gumagalaw ang lokasyon",
    headlineLost: "Wala na sa ruta ang sasakyan",
    detailLive: "Nananatiling nakasentro sa kanya ang mapa sa bawat pag-update.",
    detailPaused:
      "Ikaw ang gumalaw ng mapa, kaya hindi ko na ito ginagalaw. Pindutin ang Ituloy para bumalik sa sasakyan.",
    detailStaleUnknown: "Matagal-tagal nang hindi nagpapadala ng lokasyon ang sasakyan.",
    detailStale: (age: string): string =>
      `${age} nang hindi nagpapadala ang sasakyan: ang nasa mapa ay ang huling alam na lokasyon.`,
    detailLost:
      "Wala na akong natatanggap na lokasyon. Baka tapos na ang biyahe o lumabas na ito sa serbisyo.",
    ageMinutes: (minutes: number): string => `${minutes} minuto`,
    ageHours: (hours: number): string => `${hours} oras`,
    compact: "Sinusundan",
    compactSr: (line: string): string => ` ang rutang ${line}`,
    lineSr: (line: string): string => `, ruta ${line}`,
    resume: "Ituloy",
    exit: "Lumabas",
    close: "Isara",
    lostHint: "Kung bumibiyahe pa ito, makikita mo sa «Lahat ng ruta».",
  },

  nearby: {
    title: "Mga hintuan malapit dito",
    mapAria: "Mapa ng mga hintuan malapit dito",
    searchHere: "Maghanap sa lugar na ito",
    radius: "Radyus",
    locating: "Hinahanap ang lokasyon…",
    myPosition: "Ang lokasyon ko",
    geoDenied:
      "Tinanggihan ang pahintulot sa lokasyon. Ipinapakita namin ang sentro ng Roma: igalaw ang mapa at maghanap sa lugar na iyon.",
    geoUnavailable:
      "Walang lokasyon sa ngayon. Ipinapakita namin ang sentro ng Roma: igalaw ang mapa at maghanap sa lugar na iyon.",
    geoTimeout:
      "Masyadong natagalan ang paghahanap ng lokasyon. Ipinapakita namin ang sentro ng Roma: igalaw ang mapa at subukan ulit.",
    geoUnsupported:
      "Hindi sinusuportahan ng browser na ito ang geolocation. Igalaw ang mapa para maghanap ng hintuan.",
    outsideRome: "Nasa labas ka ng Roma: ipinapakita namin ang sentro ng lungsod.",
    outsideCoverage: "Nasa labas ng saklaw ang lugar na ito. Igalaw ang mapa papuntang Roma.",
    focusStopMissing: "Hindi nakita ang hinihinging hintuan: ipinapakita namin ang lugar mo.",
    focusStopFailed: (error: string): string => `Hindi na-load ang hinihinging hintuan (${error}).`,
    stopsFailed: (error: string): string => `Hindi na-load ang mga hintuan: ${error}`,
    loadingStops: "Hinahanap ang mga hintuan…",
    noStopsInRadius: (radius: string): string =>
      `Walang hintuan sa loob ng ${radius}. Subukang palakihin ang radyus o igalaw ang mapa.`,
    onMapCap: (max: number): string => ` (unang ${max} sa mapa)`,
    noLines: "Walang ruta",
    arrivalsLink: "Mga pagdating",
    showMoreStops: "Magpakita ng iba pang hintuan",
  },

  line: {
    loading: "Naglo-load ng ruta…",
    loadFailed: (error: string): string => `Hindi na-load ang ruta: ${error}`,
    mapAria: (name: string): string => `Mapa ng rutang ${name}`,
    dataAt: (clock: string): string => `datos noong alas-${clock}`,
    updatedAt: (clock: string): string => `na-update alas-${clock}`,
    vehiclesStale: (error: string): string => `Hindi na-update ang mga sasakyan: ${error}`,
    noPathForDirection: "Walang daanan para sa direksyong ito",
    stopsHeading: (count: number): string => `Mga hintuan (${count})`,
    noStopsForDirection: "Walang hintuan para sa direksyong ito.",
    showAllStops: "Ipakita ang lahat ng hintuan",
  },

  lineService: {
    inService: (count: number): string => `${count} sasakyan sa ruta`,
    loadingVehicles: "Naglo-load ng mga sasakyan…",
    checkingTimetable: "Sinusuri ang iskedyul…",
    feedDownTitle: "Walang real-time na lokasyon",
    feedDownDetail:
      "Puwedeng normal naman ang biyahe: hindi lang namin mabasa ang lokasyon ng mga sasakyan.",
    noneReporting: "Walang sasakyang nagpapadala ng lokasyon",
    unknownDetail:
      "Hindi ibig sabihin nito na walang biyahe ang ruta: ang nakaiskedyul na oras ay nasa pahina ng isang hintuan.",
    scheduledDetail: (count: number): string =>
      `Nakaiskedyul ang biyahe: ${count} biyahe ang inaasahan mula ngayon hanggang matapos ang araw.`,
    finishedTitle: "Tapos na ang biyahe para ngayong araw",
    finishedDetail: (count: number, clock: string): string =>
      `Ngayong araw ay ${count} nakaiskedyul na biyahe, ang huli alas-${clock}.`,
    noneTodayTitle: "Walang nakaiskedyul na biyahe ngayon",
    noneTodayDetail: "Walang biyahe sa iskedyul ang rutang ito para ngayong araw.",
    noneTodayFrom: (stopName: string): string =>
      `Mula sa ${stopName} ay walang biyahe sa iskedyul para ngayong araw.`,
    nextDepartures: "Mga susunod na alis",
    nextDeparturesFrom: (stopName: string): string => ` mula sa ${stopName}`,
    scheduledOnly: "Nakaiskedyul na oras, walang real-time.",
  },

  journey: {
    title: "Ruta",
    subtitle: "Mula sa isang punto papunta sa isa pa sa Roma sakay ng bus, tram at metro.",
    from: "Alis",
    to: "Dating",
    placeholder: "Hintuan, address o lugar",
    swap: "Baligtarin",
    whenLegend: "Kailan",
    now: "Ngayon",
    pickTime: "Pumili ng oras",
    timeLabel: "Petsa at oras ng pag-alis",
    submit: "Maghanap ng ruta",
    resultsHeading: "Mga ruta",
    emptyTitle: "Saan ka pupunta?",
    emptyHint:
      "Isulat ang pinanggalingan at patutunguhan: hahanapin namin ang pinakamainam na ruta batay sa opisyal na iskedyul.",
    searching: "Naghahanap ng ruta…",
    noResultsTitle: "Walang ruta",
    noResultsHint:
      "Diretsong koneksyon lang o may isang lipat ang hinahanap namin. Subukang baguhin ang pinanggalingan o ang oras.",
    disclaimer:
      "Nakaiskedyul na oras, hindi real-time: hindi kasama ang tunay na pagkaantala. Ang mga bahaging naglalakad ay tinatantiya nang tuwid na linya, kaya mas mahaba ang totoong distansya sa kalsada.",
    searchedFrom: (when: string): string => ` Paghahanap mula alas-${when}.`,
    mapAria: "Mapa ng napiling ruta",
    mapCaption:
      "Ang mga bahaging nakasakay ay sumusunod sa tunay na daanan ng ruta. Ang mga putol-putol ay tinatantiya nang tuwid na linya: ang paglalakad sa paglipat at ang ilang rutang walang datos ng daanan.",
    missingEndpoints: "Ilagay ang pinanggalingan at ang patutunguhan.",
    badDateTime: "Hindi wasto ang petsa at oras.",
    geoUnsupported: "Hindi sinusuportahan ng browser na ito ang geolocation.",
    geoUnavailable: "Walang lokasyon sa ngayon.",
    geoOutsideRome: "Nasa labas ka ng Roma: magsulat ng address.",
    geoDenied: "Tinanggihan ang pahintulot sa lokasyon: magsulat ng address.",
    geoTimeout: "Masyadong natagalan ang paghahanap ng lokasyon.",
    originMarker: (name: string): string => `Alis: ${name}`,
    destinationMarker: (name: string): string => `Dating: ${name}`,
    useMyPosition: "Gamitin ang lokasyon ko",
    clearField: (label: string): string => `Linisin ang ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Mga mungkahi para sa ${label.toLowerCase()}`,
    placeStop: "Hintuan",
    placeCoord: "Koordinado",
    placeAddress: "Address",
    walkOnly: "Naglalakad lang",
    walkOnlyShort: "naglalakad",
    noTransfers: "walang lipat",
    transfers: (count: number): string => `${count} lipat`,
    walkDistance: (distance: string): string => `${distance} naglalakad`,
    walkLeg: (distance: string, duration: string): string =>
      `Maglakad ng ${distance}, mga ${duration} papuntang `,
    inService: "bumibiyahe",
    stopCount: (count: number): string => `${count} hintuan`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Ruta ${index}: alis ${departure}, dating ${arrival}`,
    lineDetailsAria: (line: string): string => `Ruta ${line}, detalye`,
    hours: (hours: number): string => `${hours} oras`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} oras ${minutes}`,
    noticeNoOriginStops:
      "Walang hintuan na kayang lakarin mula sa pinanggalingan: subukan ang address na mas malapit sa isang ruta.",
    noticeNoDestinationStops:
      "Walang hintuan na kayang lakarin mula sa patutunguhan: subukan ang address na mas malapit sa isang ruta.",
    noticeNoConnection:
      "Walang koneksyon sa pagitan ng dalawang lugar na ito sa mga susunod na oras.",
    noticeWalkOnlyLeft:
      "Walang naka-iskedyul na koneksyon sa mga susunod na oras: naglalakad na lang ang natitira.",
    noticeLaterDepartures:
      "Walang biyahe sa loob ng isa't kalahating oras: ipinapakita namin ang mga pinakaunang biyahe pagkatapos.",
  },

  alerts: {
    title: "Mga abiso sa serbisyo",
    subtitle: "Mga liko, suspensyon at pagbabagong inilathala sa opisyal na datos.",
    loading: "Naglo-load…",
    degraded:
      "Hindi sumasagot o luma na ang real-time na datos: baka hindi na napapanahon ang mga abisong ito.",
    loadFailed: "Hindi na-load ang mga abiso.",
    refreshFailed: (error: string): string =>
      `Hindi nagtagumpay ang huling pag-update (${error}): ang nakikita mo ay ang naunang listahan.`,
    searchPlaceholder: "Maghanap: welga, liko, kalye…",
    searchAria: "Maghanap sa mga abiso",
    filterByLine: "Salain ayon sa ruta",
    allLines: (count: number): string => `Lahat ng ruta (${count})`,
    networkWide: "Pangkalahatang abiso",
    clearFilters: "I-reset",
    noMatch: "Walang abisong tumutugma sa mga salaan.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} sa ${total} abiso.`,
    activeCount: (count: number, lines: number): string =>
      `${count} aktibong abiso sa ${lines} ruta.`,
    goToLine: "Pumunta sa ruta",
    noneTitle: "Walang aktibong abiso",
    noneHint:
      "Sa ngayon ay walang iniuulat na putol o pagbabago sa serbisyo. Tingnan ulit bago umalis.",
    noResultsTitle: "Walang resulta",
    noResultsHint:
      "Subukan ang mas kaunting salita, o i-reset ang mga salaan para makita ulit ang lahat ng abiso.",
    noSelectionTitle: "Walang napiling abiso",
    noSelectionHint: "Pumili ng abiso sa listahan sa kaliwa para mabasa nang buo.",
    showMoreLines: (count: number): string => `Magpakita ng iba pang ruta (${count})`,
    goToLineShort: "pumunta sa ruta",
    fallbackHeader: "Abiso sa serbisyo",
    noDetail: "Walang inilathalang detalye ang operator.",
    operatorLink: "Mga detalye sa website ng operator",
    affectedLines: "Mga apektadong ruta",
    alsoOn: "Pati sa",
    contextHeading: (count: number): string => `${count} aktibong abiso`,
    contextAria: "Mga abiso sa serbisyo",
    contextAll: "Lahat",
    contextUnavailable: (error: string): string => `Walang abisong makukuha: ${error}`,
    contextMore: (count: number): string => `${count} pang abiso sa `,
    contextMoreLink: "pahina ng mga abiso",
    contextStale: (error: string): string =>
      `Hindi nagtagumpay ang huling pag-update (${error}): baka hindi na napapanahon ang mga abisong ito.`,
    windowBetween: (from: string, until: string): string => `Mula ${from} hanggang ${until}`,
    windowFrom: (from: string): string => `Mula ${from}, walang nakasaad na katapusan`,
    windowUntil: (until: string): string => `Hanggang ${until}`,
    windowUnknown: "Walang nakasaad na panahon ng bisa",
    effect: (code: string): string | null => EFFECT_TL[code] ?? null,
    cause: (code: string): string | null => CAUSE_TL[code] ?? null,
  },

  settings: {
    title: "Mga setting",
    subtitle: "Lahat ay nananatili sa device na ito. Walang account, walang server.",
    sectionArrivals: "Mga pagdating",
    autoRefresh: "Awtomatikong pag-update",
    everySeconds: (seconds: number): string => `bawat ${seconds} segundo`,
    autoRefreshHint: "Ang pagitan ng dalawang pagbasa ng real-time na datos.",
    maxArrivals: "Mga pagdating na ipinapakita bawat hintuan",
    showScheduled: "Ipakita ang nakaiskedyul na oras",
    showScheduledHint:
      "Kapag walang real-time na datos para sa isang hintuan, gamitin ang iskedyul.",
    sectionNearby: "Malapit sa akin",
    radius: "Radyus ng paghahanap",
    radiusHint: "Sakop din nito ang mabilisang radyus sa mapa ng mga hintuan malapit dito.",
    sectionAppearance: "Hitsura",
    themeLegend: "Tema",
    themeSystem: "System",
    themeLight: "Maliwanag",
    themeDark: "Madilim",
    sectionLanguage: "Wika",
    languageLegend: "Wika ng interface",
    languageSystem: "System",
    languageHint: (resolved: string): string =>
      `Sa «System» ay sinusunod namin ang wika ng browser: ngayon ay ${resolved}.`,
    sectionBackup: "Backup ng mga paborito",
    backupIntro:
      "Isang JSON file sa device mo: dahil walang account dito, ganito mo mailipat ang mga paborito sa ibang browser.",
    exportCount: (count: number): string => `I-export (${count})`,
    importFromFile: "Mag-import mula sa file",
    exported: (count: number): string => `${count} paborito ang na-export.`,
    exportFailed: "Hindi nagtagumpay ang pag-export sa browser na ito.",
    fileTooLarge: "Masyadong malaki ang file para maging backup ng mga paborito.",
    fileUnreadable: "Hindi mabasa ang file.",
    importEmpty: "Walang laman ang file.",
    importNotJson: "Hindi wastong JSON ang file.",
    importNoList: "Walang listahan ng paborito sa file.",
    importNoneValid: "Walang wastong paboritong nakita sa file.",
    importFound: (count: number): string => `${count} wastong paborito ang nakita`,
    importSkipped: (count: number): string => `, ${count} entry ang itinapon.`,
    importFoundEnd: ".",
    importMerge: "Pagsamahin",
    importReplace: "Palitan",
    replaced: (count: number): string => `Napalitan ang mga paborito: ${count} na ngayon.`,
    mergedNone: "Walang bagong paboritong maidaragdag.",
    merged: (count: number): string => `${count} paborito ang naidagdag.`,
    sectionLocalData: "Lokal na datos",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} paborito, ${recents} hintuan sa kasaysayan.`,
    confirmClearFavorites: "Burahin ang lahat ng paborito? Hindi na ito maibabalik.",
    confirmClearFavoritesYes: "Oo, linisin",
    clearFavorites: "Linisin ang mga paborito",
    favoritesCleared: "Nalinis ang mga paborito.",
    confirmClearRecents: "Burahin ang kasaysayan ng mga hintuang tiningnan?",
    confirmClearRecentsYes: "Oo, burahin",
    clearRecents: "Burahin ang kasaysayan",
    recentsCleared: "Nabura ang kasaysayan.",
    resetDefaults: "Ibalik sa mga default na setting",
    settingsReset: "Naibalik ang mga setting sa default na halaga.",
    infoLink: "Impormasyon, pinagkunan ng datos at madalas na tanong",
  },

  sync: {
    titleFull: "I-sync ang mga device",
    titleCollapsed: "Sync",
    badgeOn: "aktibo",
    summaryLoading: "…",
    summaryUnavailable: "Hindi magagamit sa koneksyong ito",
    summaryOff: "Hindi aktibo",
    summarySyncing: "Nagsi-sync…",
    summaryError: "Error sa pag-sync",
    summaryConflict: "May salungatang aayusin",
    summaryOn: (last: string): string => `Aktibo · huli ${last}`,
    intro:
      "Dalhin ang mga paborito, kamakailan at setting sa ibang device gamit ang isang code. Naka-encrypt ang datos dito: ang server ay may hawak lang ng hindi mabasang datos.",
    enable: "Buksan ang pag-sync",
    haveCode: "May code na ako",
    codeLabel: "Code ng pag-sync",
    codeHint:
      "20 karakter, gaya ng nakikita mo sa kabilang device. Hindi mahalaga ang malalaking titik, gitling at espasyo.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} karakter`,
    join: "Ikonekta",
    onIntro:
      "Naka-encrypt ang datos sa device na ito bago ito umalis. Sinumang may code ay makakabasa ng lahat ng paborito mo: gamitin lang sa sarili mong device.",
    code: "Code",
    showCode: "Ipakita ang code",
    hideCode: "Itago ang code",
    copyCode: "Kopyahin ang code",
    copied: "Nakopya",
    lastSync: "Huling pag-sync:",
    inProgress: " · ginagawa…",
    syncNow: "Mag-sync ngayon",
    disconnect: "Idiskonekta",
    disconnectNote:
      "Kapag nadiskonekta, mananatili ang datos sa device na ito at ang naka-encrypt na kopya ay mananatili sa server hanggang burahin mo.",
    deleteWarning:
      "Buburahin ang naka-encrypt na kopya sa server. Wala nang makikitang i-sync ang ibang device. Hindi na ito maibabalik.",
    deleteConfirm: "Talagang burahin",
    deleteRemote: "Burahin ang datos sa server",
    justNow: "ngayon",
    minutesAgo: (minutes: number): string => `${minutes} min ang nakalipas`,
    atClock: (clock: string): string => `alas-${clock}`,
    errors: {
      aborted: "Kanselado ang operasyon.",
      generic: "Hindi nagtagumpay ang pag-sync. Subukan ulit maya-maya.",
      insecureContext:
        "Kailangan ng ligtas na koneksyon ang pag-sync: buksan ang site sa https (o sa localhost). Sa payak na http, pinapatay ng mga browser ang pag-encrypt, kaya walang maie-encrypt sa device na ito.",
      noBase64Encode: "Hindi ma-encode ng browser na ito ang datos ng pag-sync.",
      noBase64Decode: "Hindi ma-decode ng browser na ito ang datos ng pag-sync.",
      invalidSyncData: (what: string): string => `Hindi wasto ang datos ng pag-sync (${what}).`,
      codeRequired: "Ilagay ang code ng pag-sync.",
      codeTooLong: (max: number): string =>
        `Masyadong mahaba ang code na iyan: dapat ${max} karakter lang.`,
      codeInvalidChars: (chars: string): string =>
        `May karakter sa code na hindi pinapayagan: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Dapat ${required} karakter ang code, ${actual} ang na-type mo.`,
      keyDerivationFailed: "Hindi makagawa ng mga susi sa pag-sync ang browser na ito.",
      preparePayloadFailed: "Hindi naihanda ang datos na isi-sync.",
      encryptFailed: "Hindi na-encrypt ang datos sa device na ito.",
      decryptFailed: "Hindi tugma ang code sa datos na ito, o sira ang datos sa server.",
      invalidSyncId: "Hindi wastong identifier ng pag-sync.",
      responseTooLarge: "Sobrang dami ng datos na ibinalik ng server.",
      timeout: "Hindi sumagot sa oras ang server.",
      unreachable: "Hindi maabot ang server. Tingnan ang koneksyon mo.",
      invalidResponse: "Hindi wastong sagot ang ipinadala ng server.",
      invalidResponseField: (what: string): string =>
        `Hindi wastong sagot ang ipinadala ng server (${what}).`,
      unexpectedFormat: "Hindi inaasahan ang format ng sagot ng server.",
      rateLimited: "Masyadong maraming sunud-sunod na pag-sync. Subukan ulit pagkalipas ng isang minuto.",
      pullRejected: (status: number): string =>
        `Tinanggihan ng server ang pagbasa (error ${status}).`,
      payloadTooLarge: "Masyadong maraming datos para ma-sync.",
      pushRejected: (status: number): string =>
        `Tinanggihan ng server ang pag-save (error ${status}).`,
      deleteRejected: (status: number): string =>
        `Tinanggihan ng server ang pagbura (error ${status}).`,
      conflict:
        "May ibang device na nagsusulat sa parehong datos ngayon. Ligtas ang datos mo rito: subukan ulit pagkalipas ng ilang segundo.",
    },
    status: {
      deleted: "Binura ang datos sa server. Hindi na nagsi-sync ang device na ito.",
      disconnected:
        "Nakapatay ang pag-sync sa device na ito. Nananatili rito ang datos mo at nasa server pa rin ang naka-encrypt na kopya hanggang burahin mo ito.",
    },
  },

  info: {
    title: "Impormasyon",
    subtitle:
      "Iskedyul at pagdating ng pampublikong transportasyon sa Roma, mula sa opisyal na bukas na datos.",
    unofficialTitle: "Hindi opisyal na app",
    unofficialBody:
      "Ang site na ito ay walang kaugnayan, hindi kaanib, hindi awtorisado at hindi sinusuportahan sa anumang paraan ng ATAC S.p.A., ng Roma Servizi per la Mobilità o ng Roma Capitale. Isa itong malayang proyektong nagbabasa lang ng bukas na datos na inilalathala ng mga ahensyang ito. Para sa opisyal na impormasyon, tiket at reklamo, dumulog sa kanilang mga channel.",
    whatTitle: "Ano ito",
    whatBody1:
      "Isang web app para malaman kung ilang minuto pa bago dumaan ang susunod na sasakyan sa hintuang kinaroroonan mo. Maghanap ng hintuan o ruta, i-save sa mga paborito, at makikita mo sa home kasama ang napapanahong pagdating. Walang account, walang ad, walang istatistika ng paggamit.",
    whatBody2:
      "Kapag saklaw ng real-time na datos ang biyahe, ang ipinapakitang oras ay tantiya batay sa lokasyon ng sasakyan. Kung hindi, babalik ang app sa nakaiskedyul na oras at palagi nitong sinasabi iyon, sa halip na ipasa ang lumang datos bilang tantiya.",
    dataTitle: "Saan galing ang datos",
    dataBodyBefore:
      "Ang mga iskedyul, hintuan, ruta, daanan, lokasyon ng sasakyan at abiso sa serbisyo ay galing sa bukas na datos ng ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS at GTFS-Realtime). Ina-update ang nakaiskedyul na oras araw-araw, ang real-time ay mga bawat 30 segundo.",
    dataLink: "romamobilita.it — Bukas na datos",
    dataLicence:
      "Nananatiling pag-aari ng kani-kanilang may hawak ang datos at ginagamit ayon sa kondisyon ng lisensyang pinaglathalaan nito.",
    privacyTitle: "Privacy",
    privacyBody:
      "Walang login at walang profile ng user. Ang mga paborito, hintuang kamakailang tiningnan at setting ay nakatago lang sa browser mo at hindi ipinapadala kahit saan. Ang lokasyon, kung papayagan mo para sa paghahanap ng malalapit na hintuan, ay nananatili sa device: ginagamit lang ito para sa pagkuwenta ng distansya at hindi itinatago.",
    faqTitle: "Madalas na tanong",
    faq1Q: "Bakit may rutang o bus na hindi lumalabas?",
    faq1A:
      "Ang ipinapakita lang namin ay ang nasa opisyal na datos. Kung hindi nagpapadala ng lokasyon ang isang sasakyan, o kung wala ang biyahe nito sa real-time na datos, para sa amin ay wala ito: ang makikita mo na lang ay ang nakaiskedyul na oras. Madalas itong mangyari sa mga pamalit na biyahe, shuttle bus at sasakyang sira ang tracker.",
    faq2Q: "Bakit iba ang oras sa nakasulat sa hintuan?",
    faq2A:
      'Ang karatula sa poste ay nagpapakita ng nakaiskedyul na oras, na ilang beses lang nagbabago bawat taon. Dito, kapag nagpapadala ang sasakyan, ang nakikita mo ay tantiyang kinuwenta mula sa totoong lokasyon nito, kasama ang trapiko at pagkaantala. Kapag naman "nakaiskedyul" ang nababasa mo, walang tantiya at ipinapakita namin ang parehong oras ng karatula.',
    faq3Q: "Ano ang nangyayari sa gabi?",
    faq3A:
      "Sa gabi ay halos walang laman ang real-time na datos, dahil kakaunti ang sasakyang bumibiyahe. Patuloy na gumagana ang app gamit ang nakaiskedyul na oras ng mga rutang pang-gabi. Sa GTFS, ang araw ng biyahe ay hindi natatapos sa hatinggabi kundi sa 04:00: ang biyaheng ala-una ng madaling araw ay pag-aari pa rin ng nakaraang araw, kaya makakakita ka ng oras na gaya ng 25:30 na isinasalin sa 01:30.",
    faq4Q: "Napupunta ba sa server ang mga paborito ko?",
    faq4A:
      "Hindi. Ang mga paborito, kasaysayan at setting ay nasa localStorage ng browser. Kung buburahin mo ang datos ng site o magpapalit ng device, mawawala ang mga ito: mula sa mga setting, puwede mong i-export ang mga ito sa isang JSON file at i-import ulit sa ibang lugar.",
    settingsLink: "Pumunta sa mga setting",
  },

  footer: {
    dataPrefix: "Datos ng serbisyo at iskedyul: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (bukas na datos GTFS).",
    independent:
      "Malayang proyekto, walang kaugnayan sa ATAC o sa Roma Servizi per la Mobilità. ",
    infoLink: "Impormasyon",
  },

  errors: {
    genericTitle: "May hindi gumana",
    unexpected: "Hindi inaasahang error",
    unexpectedDot: "Hindi inaasahang error.",
    stopNotFound: "Hindi nakita ang hintuan",
    serviceDown: "Hindi sumasagot ang serbisyo",
    requestFailed: (status: number): string => `Hindi nagtagumpay ang kahilingan (${status})`,
    httpStatus: (status: number): string => `Error ${status}`,
    badResponse: "Hindi wasto ang sagot ng server",
    badResponseDot: "Hindi wasto ang sagot ng server.",
    timedOut: "Nag-expire ang kahilingan",
    timedOutDot: "Nag-expire ang kahilingan.",
    offline: "Walang koneksyon",
    connectionFailed: "Hindi nagtagumpay ang koneksyon.",
    tooManyRequests: "Masyadong maraming kahilingan",
    badRequest: "Hindi wastong parameter",
    lineNotFound: "Hindi nakita ang ruta",
    journeyOriginNotFound: "Hindi nakita ang pinanggalingan",
    journeyDestinationNotFound: "Hindi nakita ang patutunguhan",
    journeyPlaceHint: "Subukan ang mas tiyak na address.",
  },

  notFound: {
    kicker: "Error 404",
    title: "Hindi dinadaanan ang hintuan",
    body:
      "Wala ang pahinang ito. Nangyayari ito sa lumang link, o sa code ng hintuan o rutang wala na sa datos.",
    searchCta: "Maghanap ng hintuan",
    nearbyCta: "Mga hintuan malapit dito",
  },

  appError: {
    title: "Naputol ang biyahe",
    body:
      "Hindi na-load ang screen na ito. Subukan ulit: kung nagpapatuloy ang problema, malamang na hindi sumasagot ang serbisyo ng datos.",
    digest: (digest: string): string => `Code: ${digest}`,
    backHome: "Bumalik sa home",
    globalTitle: "Suspendido ang serbisyo",
    globalBody:
      "Huminto ang app dahil sa hindi inaasahang error. I-reload ang pahina: nananatiling naka-save sa telepono ang mga paborito mo at hindi ito mawawala.",
    reload: "I-reload",
  },

  format: {
    due: "paparating na",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "walang petsa",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "hindi alam ang pag-update",
    ageSeconds: (seconds: number): string => `na-update ${seconds} seg ang nakalipas`,
    ageMinutes: (minutes: number): string => `na-update ${minutes} min ang nakalipas`,
    ageAt: (clock: string): string => `na-update alas-${clock}`,
    onTime: "nasa oras",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — pagdating nang real time",
    appDescription:
      "Mga oras at pagdating ng bus, tram at metro sa Roma nang real time. Mga naka-save na hintuan, hintuan malapit sa iyo at abiso sa serbisyo, walang account at walang ad.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Ang pinakamalapit na hintuan ng ATAC sa iyo, may mapa at mga rutang dumadaan doon.",
    journeyDescription:
      "Alamin kung paano pumunta mula sa isang bahagi ng Roma papunta sa iba sakay ng bus, tram at metro, batay sa opisyal na iskedyul ng ATAC.",
    alertsDescription:
      "Mga liko, suspensyon at pagbabago sa serbisyong inilathala sa opisyal na datos.",
    settingsDescription:
      "Pag-update ng pagdating, radyus ng paghahanap, tema at pamamahala ng mga na-save mo.",
    infoDescription:
      "Ano ang app na ito, saan nanggagaling ang datos, at bakit wala itong kaugnayan sa ATAC o sa Roma Servizi per la Mobilità.",
    stopDescription: "Pagdating nang real time at nakatakdang iskedyul ng hintuan.",
    lineDescription: "Ruta, mga hintuan at mga sasakyan ng linya nang real time.",
  },

  skeleton: {
    loading: "Naglo-load",
  },
};

const EFFECT_TL: Record<string, string | undefined> = {
  NO_SERVICE: "Suspendido ang serbisyo",
  REDUCED_SERVICE: "Nabawasang serbisyo",
  SIGNIFICANT_DELAYS: "Malaking pagkaantala",
  DETOUR: "Liko",
  ADDITIONAL_SERVICE: "Dagdag na serbisyo",
  MODIFIED_SERVICE: "Binagong serbisyo",
  STOP_MOVED: "Inilipat ang hintuan",
  NO_EFFECT: "Walang epekto sa serbisyo",
  ACCESSIBILITY_ISSUE: "Problema sa accessibility",
  OTHER_EFFECT: "Iba pa",
  UNKNOWN_EFFECT: "Hindi tinukoy ang epekto",
};

const CAUSE_TL: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Teknikal na sira",
  STRIKE: "Welga",
  DEMONSTRATION: "Demonstrasyon",
  ACCIDENT: "Aksidente",
  HOLIDAY: "Pista opisyal",
  WEATHER: "Masamang panahon",
  MAINTENANCE: "Pagpapanatili",
  CONSTRUCTION: "Konstruksyon",
  POLICE_ACTIVITY: "Aksyon ng pulisya",
  MEDICAL_EMERGENCY: "Emerhensiyang medikal",
  OTHER_CAUSE: "Ibang dahilan",
  UNKNOWN_CAUSE: "Hindi tinukoy ang dahilan",
};
