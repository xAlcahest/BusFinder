/**
 * Hindi dictionary. Shape and key order follow it.ts, the source of truth.
 * The nouns used here stay unmarked after a numeral ("3 स्टॉप"), so counted
 * strings interpolate directly and need no plural helper.
 */

import type { Dictionary } from "./it";

export const hi: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, होम",
  },

  a11y: {
    skipToContent: "मुख्य सामग्री पर जाएँ",
  },

  common: {
    retry: "फिर कोशिश करें",
    cancel: "रद्द करें",
    save: "सहेजें",
    close: "बंद करें",
    home: "होम",
    back: "वापस",
    all: "सभी",
    loading: "लोड हो रहा है…",
    searching: "खोज रहे हैं…",
    refresh: "ताज़ा करें",
    dash: "—",
    minutesShort: "मिन",
    clearSearch: "खोज हटाएँ",
    searchInProgress: "खोज जारी है",
  },

  nav: {
    primary: "मुख्य नेविगेशन",
    sidebar: "साइडबार",
    sidebarNav: "साइड नेविगेशन",
    openMenu: "मेन्यू खोलें",
    closeMenu: "मेन्यू बंद करें",
    sections: "अनुभाग",
    shortcuts: "शॉर्टकट",
    infoAria: "ऐप के बारे में जानकारी",
    home: "होम",
    nearbyShort: "आसपास",
    nearby: "आसपास के स्टॉप",
    journey: "रास्ता",
    alerts: "सूचनाएँ",
    settings: "सेटिंग",
    info: "जानकारी",
    hintNearby: "यहाँ आसपास क्या चलता है",
    hintJourney: "एक जगह से दूसरी जगह",
    hintAlerts: "मार्ग परिवर्तन और रुकावटें",
    hintSettings: "अपडेट, थीम, डेटा",
    hintInfo: "स्रोत और कानूनी सूचना",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ट्राम";
        case 1:
          return "मेट्रो";
        case 2:
          return "ट्रेन";
        case 4:
          return "फ़ेरी";
        default:
          return "बस";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ट्राम";
        case 1:
          return "मेट्रो";
        case 2:
          return "ट्रेन";
        case 3:
          return "बस";
        default:
          return "रूट";
      }
    },
    named: (name: string): string => `रूट ${name}`,
    namedAria: (name: string): string => `रूट ${name}`,
    details: "विवरण",
    towards: (headsign: string): string => `${headsign} की ओर`,
    towardsCapital: (headsign: string): string => `${headsign} की ओर`,
    direction: "दिशा",
    terminus: "आख़िरी स्टॉप",
    noHeadsign: "गंतव्य नहीं बताया गया",
  },

  stops: {
    code: (code: string): string => `स्टॉप ${code}`,
    codeOnly: "स्टॉप",
    pole: (code: string): string => `खंभा ${code}`,
    accessible: "सुलभ स्टॉप",
    named: (name: string): string => `${name} स्टॉप`,
    countLabel: (count: number): string => `${count} स्टॉप`,
    involved: (count: number): string => `${count} स्टॉप प्रभावित`,
  },

  home: {
    kicker: "रोम · सार्वजनिक परिवहन",
    title: "अगली गाड़ी कब आएगी?",
    intro:
      "स्टॉप को नंबर या नाम से खोजें, या फिर कोई रूट खोजें। आने का समय रोम के रीयल-टाइम डेटा से आता है।",
  },

  search: {
    inputAria: "स्टॉप या रूट खोजें",
    placeholder: "स्टॉप, सड़क या रूट",
    searchingFor: (query: string): string => `«${query}» खोजा जा रहा है…`,
    noResultsFor: (query: string): string => `«${query}» के लिए कोई नतीजा नहीं`,
    noResultsHint:
      "स्टॉप नंबर (जैसे 70101), सड़क का नाम या रूट नंबर आज़माएँ।",
    resultsList: "खोज के नतीजे",
    keyboardHint: "↑ ↓ से घूमें, Enter से खोलें, Esc से बंद करें",
  },

  favorites: {
    heading: "पसंदीदा",
    emptyTitle: "अभी कोई पसंदीदा नहीं",
    emptyHint:
      "किसी स्टॉप या रूट के बगल में ★ तारे पर टैप करें: खोज में, आसपास के स्टॉप में, स्टॉप के पन्ने पर या रूट के पन्ने पर। फिर वह यहीं मिल जाएगा, हर बार खोजने की ज़रूरत नहीं।",
    reorder: "क्रम बदलें",
    reorderDone: "हो गया",
    reorderHint: "तीरों से स्टॉप को हिलाएँ। यह क्रम इसी डिवाइस पर लागू होता है।",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: ${total} में से ${position}वाँ।`,
    moveUp: (name: string): string => `${name} को ऊपर ले जाएँ`,
    moveDown: (name: string): string => `${name} को नीचे ले जाएँ`,
    addStar: (name: string): string => `${name} स्टॉप पर तारा लगाएँ`,
    removeStar: (name: string): string => `${name} स्टॉप से तारा हटाएँ`,
    addStarLine: (name: string): string => `रूट ${name} पर तारा लगाएँ`,
    removeStarLine: (name: string): string => `रूट ${name} से तारा हटाएँ`,
    starredTitle: "तारा लगा है: पसंदीदा में है",
    starTitle: "तारा लगाएँ",
    starredLabel: "तारा लगा",
    starLabel: "तारा",
    editLabels: (name: string): string => `${name} का लेबल और रूट बदलें`,
    onlyLines: (labels: string): string => `सिर्फ़ ${labels}`,
    notUpdated: "अपडेट नहीं हुआ",
    noArrivalsOnPinned: "चुने हुए रूटों पर कोई गाड़ी नहीं।",
    changeLines: "रूट बदलें",
    noArrivalsSoon: "अगले कुछ मिनटों में कोई गाड़ी नहीं।",
    openForTimes: "समय देखने के लिए खोलें",
    vehiclesUnavailable: "गाड़ियों की जानकारी उपलब्ध नहीं",
    lookingForVehicles: "चल रही गाड़ियाँ खोजी जा रही हैं…",
    noVehiclesNow: "अभी कोई गाड़ी नहीं चल रही",
    vehiclesInService: (count: number): string => `अभी ${count} गाड़ी चल रही है`,
    refreshArrivals: "आगमन ताज़ा करें",
    undoRemovedStop: "स्टॉप से तारा हटा: अब पसंदीदा में नहीं है।",
    undoRemovedLine: "रूट से तारा हटा: अब पसंदीदा में नहीं है।",
    undoDismiss: "सूचना बंद करें",
    more: (count: number): string => `${count} और पसंदीदा`,
    sidebarEmptyBefore: "किसी स्टॉप या रूट के बगल में तारे पर टैप करें, खोज में, ",
    sidebarEmptyAfter: " में, या जिस पन्ने को आप देख रहे हैं उस पर। फिर वह यहीं मिलेगा।",
    nextDeparture: "अगली गाड़ी",
    noDeparture: "कोई गाड़ी उपलब्ध नहीं",
    notAvailableShort: "—",
  },

  recents: {
    heading: "हाल में देखे गए",
    clear: "खाली करें",
    emptyTitle: "हाल में कोई स्टॉप नहीं देखा",
    emptyHint:
      "आप जो स्टॉप खोलते हैं वे कुछ दिन यहाँ रहते हैं, ताकि दोबारा खोजना न पड़े।",
    listAria: "हाल में देखे गए स्टॉप",
    justNow: "अभी-अभी",
    today: "आज",
    yesterday: "कल",
  },

  arrivals: {
    due: "पहुँचने वाली है",
    live: "रीयल-टाइम",
    scheduled: "समय-सारणी के अनुसार",
    scheduledTail: " निर्धारित",
    scheduledSr: "निर्धारित समय",
    onTime: "समय पर",
    lateBy: (minutes: number): string => `+${minutes} मिन`,
    earlyBy: (minutes: number): string => `−${minutes} मिन`,
    lateSuffix: "देरी",
    earlySuffix: "पहले",
    lateSr: (minutes: number): string => `${minutes} मिनट की देरी`,
    earlySr: (minutes: number): string => `${minutes} मिनट पहले`,
    skipped: "रद्द",
    skippedSr: "यह फेरा रद्द है",
    atClock: (clock: string): string => `${clock} बजे`,
    towardsSr: (headsign: string): string => `${headsign} दिशा`,
    loadingAria: "आगमन लोड हो रहे हैं",
    emptyTitle: "कोई गाड़ी अपेक्षित नहीं",
    emptyHint:
      "कोई गाड़ी पास नहीं आ रही। निर्धारित समय देखें या थोड़ी देर बाद फिर कोशिश करें।",
    frozenUnknown: "अनुमान अपडेट नहीं हुआ",
    frozenFor: (minutes: number): string => `${minutes} मिन से रुका है`,
    frozenPrefix: (state: string): string => `अनुमान ${state}`,
    frozenSr: (state: string): string => `अनुमान ${state}, रीयल-टाइम में अपडेट नहीं हो रहा`,
    expectedSr: (relative: string, clock: string): string =>
      `${relative} अपेक्षित, ${clock} बजे`,
    bannerNoRealtimeStrong: "रीयल-टाइम जानकारी उपलब्ध नहीं।",
    bannerNoRealtime:
      " हम निर्धारित समय दिखा रहे हैं: गाड़ियाँ जल्दी या देर से आ सकती हैं।",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "रीयल-टाइम जानकारी रुक गई है।" : `रीयल-टाइम जानकारी ${minutes} मिन से रुकी है।`,
    bannerFrozenBefore: " नीचे दिए अनुमान",
    bannerFrozenLastUpdate: " आख़िरी अपडेट",
    bannerFrozenAt: (clock: string): string => ` (${clock})`,
    bannerFrozenAfter: " के हैं और अपडेट नहीं हो रहे: इन्हें सावधानी से लें।",
    bannerPartialStrong: "रीयल-टाइम जानकारी अधूरी।",
    bannerPartial: " डेटा का कुछ हिस्सा नहीं पहुँचा: कुछ फेरे छूट सकते हैं।",
    showOnMap: (line: string): string => `रूट ${line} की गाड़ी नक्शे पर दिखाएँ`,
    hideOnMap: (line: string): string => `रूट ${line} की गाड़ी से हाइलाइट हटाएँ`,
  },

  dataAge: {
    prefix: "अपडेट",
    now: "अभी",
    secondsAgo: (seconds: number): string => `${seconds} सेकंड पहले`,
    minutesAgo: (minutes: number): string => `${minutes} मिन पहले`,
    atClock: (clock: string): string => `${clock} बजे`,
    never: "कभी नहीं",
  },

  refreshFeedback: {
    updated: "अपडेट हो गया",
    unchanged: "जाँच लिया, कुछ नया नहीं",
    failed: "अपडेट नहीं हो सका",
    updatedShort: "अपडेट हुआ",
    unchangedShort: "कुछ नया नहीं",
    failedShort: "अपडेट नहीं हुआ",
    busy: "अपडेट हो रहा है…",
    busySpoken: "अपडेट हो रहा है",
  },

  stop: {
    tabArrivals: "आगमन",
    tabTimetable: "समय-सारणी",
    tabsAria: "स्टॉप का दृश्य",
    editTag: "लेबल बदलें",
    addTag: "लेबल",
    map: "नक्शा",
    realtimePrefix: "रीयल-टाइम",
    noRealtime: "कोई रीयल-टाइम डेटा नहीं",
    pageNotUpdated: "पन्ना अभी अपडेट नहीं हुआ",
    pageUpdatedAt: (clock: string): string => `पन्ना ${clock} बजे अपडेट हुआ`,
    lastDataSuffix: (error: string): string => `${error}। आप आख़िरी मिला हुआ डेटा देख रहे हैं।`,
    arrivalsUnavailable: "आगमन की जानकारी उपलब्ध नहीं",
    emptyHint:
      "अभी कोई गाड़ी पास नहीं आ रही। अगली गाड़ी कब अपेक्षित है, यह जानने के लिए समय-सारणी खोलें।",
    seeTimetable: "समय-सारणी देखें",
    linesHere: "यहाँ रुकने वाले रूट",
  },

  tagDialog: {
    titleFavorite: "पसंदीदा",
    titleTag: "स्टॉप का लेबल",
    label: "आप इसे क्या कहते हैं",
    placeholder: "घर, दफ़्तर, जिम…",
    hint: (maxChars: number): string =>
      `सिर्फ़ आपके लिए: इसी डिवाइस पर रहेगा, ज़्यादा से ज़्यादा ${maxChars} अक्षर।`,
    linesLegend: "दिखाने के लिए रूट",
    linesNone: "कुछ नहीं चुना: कार्ड सारे रूट दिखाएगा।",
    linesSome: (count: number): string => `कार्ड पर सिर्फ़ ${count} रूट।`,
    showAllLines: "सारे रूट दिखाएँ",
    removeTag: "लेबल हटाएँ",
  },

  timetable: {
    previousDay: "पिछला दिन",
    nextDay: "अगला दिन",
    today: "आज",
    scheduled: "निर्धारित समय",
    jumpToNow: "अभी पर जाएँ",
    backToToday: "आज पर लौटें",
    fromServiceStart: "सेवा की शुरुआत से",
    unavailableTitle: "समय-सारणी उपलब्ध नहीं",
    partialError: (error: string): string => `${error}। आप पहले से लोड हुए फेरे देख रहे हैं।`,
    emptyTitle: "इसके बाद कोई फेरा नहीं",
    emptyFromNow:
      "इस समय के बाद कोई गाड़ी नहीं है। सेवा की शुरुआत से देखें, कोई और दिन चुनें, या रूट का फ़िल्टर हटाएँ।",
    emptyWholeDay:
      "इस दिन कोई गाड़ी निर्धारित नहीं है: पिछला या अगला दिन आज़माएँ, या रूट का फ़िल्टर हटाएँ।",
    loadMore: "और फेरे दिखाएँ",
    loadingMore: "लोड हो रहा है…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${from} से ${to} तक ${count} फेरे` +
      (complete ? ", सेवा के अंत तक" : "") +
      "। ये सेवा-दिवस के आधिकारिक समय हैं, रीयल-टाइम के बिना।",
  },

  map: {
    fallbackAria: "नक्शा",
    vehiclesHeading: "नक्शे पर गाड़ियाँ",
    show: "दिखाएँ",
    hide: "छिपाएँ",
    modeGroup: "कौन सी गाड़ियाँ दिखानी हैं",
    modeApproaching: "यहाँ आ रही हैं",
    modeAllLines: "सारे रूट",
    loadingStop: "स्टॉप की जगह लोड हो रही है…",
    stopMapAria: (stopName: string): string => `${stopName} स्टॉप पर गाड़ियों का नक्शा`,
    centreOnStop: "स्टॉप पर केंद्रित करें",
    nearbyVehicles: "यहाँ आसपास की गाड़ियाँ",
    allVehicles: "सभी, दूर वाली भी",
    loadingVehicles: "गाड़ियाँ लोड हो रही हैं…",
    noneApproaching: "कोई गाड़ी पास नहीं आ रही",
    approachingCount: (count: number): string => `${count} गाड़ी आ रही है`,
    onTheseLines: (count: number): string => `इस स्टॉप के रूटों पर ${count} गाड़ी`,
    positionsAt: (clock: string): string => `${clock} बजे की जगहें`,
    positionsStale: "जगहें अपडेट नहीं हुईं",
    allLinesNote:
      "गहरे रंग की गाड़ियाँ इसी स्टॉप की ओर आ रही हैं, फीकी वाली उन्हीं रूटों पर चल रही हैं पर अभी यहाँ से नहीं गुज़रतीं।",
    approachingList: "आ रही गाड़ियाँ",
    hereIn: (relative: string): string => `यहाँ ${relative}`,
    hereInAt: (relative: string, clock: string): string => `यहाँ ${relative}, ${clock} बजे`,
    notInbound: "इस रूट पर चल रही है, पर इस स्टॉप की ओर नहीं",
    noBearing: " · दिशा नहीं भेजी गई",
    follow: "मैं इसी गाड़ी में हूँ, इसे फ़ॉलो करें",
    unfollow: "फ़ॉलो करना बंद करें",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `रूट ${line}, यहाँ ${relative}${followed ? ", आप इसे फ़ॉलो कर रहे हैं" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `रूट ${line}, चल रही है, इस स्टॉप की ओर नहीं${followed ? ", आप इसे फ़ॉलो कर रहे हैं" : ""}`,
    yourPosition: "आपकी जगह",
    vehicleTitle: (vehicleId: string): string => `गाड़ी ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName} को नक्शे पर दिखाएँ`,
    divertedSuffix: " · रूट से बाहर",
    divertedBadge: "रूट से बाहर",
    divertedNote: "यह तय रास्ते से अलग रास्ते पर चल रही है।",
  },

  follow: {
    headlineLive: "मैं इस गाड़ी को फ़ॉलो कर रहा हूँ",
    headlinePaused: "फ़ॉलो करना रुका हुआ है",
    headlineStale: "जगह नहीं बदल रही",
    headlineLost: "गाड़ी अब रूट पर नहीं है",
    detailLive: "हर अपडेट पर नक्शा इसी पर केंद्रित रहता है।",
    detailPaused:
      "आपने नक्शा हिलाया है, इसलिए अब मैं इसे नहीं हिलाता। गाड़ी पर लौटने के लिए «जारी रखें» दबाएँ।",
    detailStaleUnknown: "यह गाड़ी कुछ समय से अपनी जगह नहीं भेज रही।",
    detailStale: (age: string): string =>
      `गाड़ी ${age} से कुछ नहीं भेज रही: नक्शे पर जो है वह आख़िरी ज्ञात जगह है।`,
    detailLost:
      "अब इसकी जगह नहीं मिल रही। शायद फेरा पूरा हो गया या यह सेवा से बाहर हो गई।",
    ageMinutes: (minutes: number): string => `${minutes} मिनट`,
    ageHours: (hours: number): string => `${hours} घंटे`,
    compact: "फ़ॉलो कर रहे हैं",
    compactSr: (line: string): string => ` रूट ${line}`,
    lineSr: (line: string): string => `, रूट ${line}`,
    resume: "जारी रखें",
    exit: "बाहर निकलें",
    close: "बंद करें",
    lostHint: "अगर वह अब भी चल रही है तो «सारे रूट» पर जाकर मिल जाएगी।",
  },

  nearby: {
    title: "आसपास के स्टॉप",
    mapAria: "आसपास के स्टॉप का नक्शा",
    searchHere: "इस इलाक़े में खोजें",
    radius: "दायरा",
    locating: "जगह पता की जा रही है…",
    myPosition: "मेरी जगह",
    geoDenied:
      "जगह की अनुमति नहीं मिली। हम रोम का केंद्र दिखा रहे हैं: नक्शा हिलाकर उस इलाक़े में खोजें।",
    geoUnavailable:
      "अभी जगह उपलब्ध नहीं है। हम रोम का केंद्र दिखा रहे हैं: नक्शा हिलाकर उस इलाक़े में खोजें।",
    geoTimeout:
      "जगह पता करने में बहुत समय लगा। हम रोम का केंद्र दिखा रहे हैं: नक्शा हिलाकर फिर कोशिश करें।",
    geoUnsupported:
      "यह ब्राउज़र जगह पता करना सपोर्ट नहीं करता। स्टॉप खोजने के लिए नक्शा हिलाएँ।",
    outsideRome: "आप रोम के इलाक़े से बाहर हैं: हम शहर का केंद्र दिखा रहे हैं।",
    outsideCoverage: "यह इलाक़ा हमारी सीमा से बाहर है। नक्शा रोम की ओर हिलाएँ।",
    focusStopMissing: "माँगा गया स्टॉप नहीं मिला: हम आपका इलाक़ा दिखा रहे हैं।",
    focusStopFailed: (error: string): string => `माँगा गया स्टॉप लोड नहीं हुआ (${error})।`,
    stopsFailed: (error: string): string => `स्टॉप लोड नहीं हुए: ${error}`,
    loadingStops: "स्टॉप खोजे जा रहे हैं…",
    noStopsInRadius: (radius: string): string =>
      `${radius} के भीतर कोई स्टॉप नहीं। दायरा बढ़ाएँ या नक्शा हिलाएँ।`,
    onMapCap: (max: number): string => ` (नक्शे पर पहले ${max})`,
    noLines: "कोई रूट नहीं",
    arrivalsLink: "आगमन",
    showMoreStops: "और स्टॉप दिखाएँ",
  },

  line: {
    loading: "रूट लोड हो रहा है…",
    loadFailed: (error: string): string => `रूट लोड नहीं हुआ: ${error}`,
    mapAria: (name: string): string => `रूट ${name} का नक्शा`,
    dataAt: (clock: string): string => `${clock} बजे का डेटा`,
    updatedAt: (clock: string): string => `${clock} बजे अपडेट हुआ`,
    vehiclesStale: (error: string): string => `गाड़ियाँ अपडेट नहीं हुईं: ${error}`,
    noPathForDirection: "इस दिशा के लिए रास्ता उपलब्ध नहीं",
    stopsHeading: (count: number): string => `स्टॉप (${count})`,
    noStopsForDirection: "इस दिशा के लिए कोई स्टॉप उपलब्ध नहीं।",
    showAllStops: "सारे स्टॉप दिखाएँ",
  },

  lineService: {
    inService: (count: number): string => `रूट पर ${count} गाड़ी`,
    loadingVehicles: "गाड़ियाँ लोड हो रही हैं…",
    checkingTimetable: "समय-सारणी जाँची जा रही है…",
    feedDownTitle: "रीयल-टाइम जगहें उपलब्ध नहीं",
    feedDownDetail:
      "सेवा सामान्य भी हो सकती है: हम बस गाड़ियों की जगह नहीं पढ़ पा रहे।",
    noneReporting: "कोई गाड़ी अपनी जगह नहीं भेज रही",
    unknownDetail:
      "इसका मतलब यह नहीं कि रूट बंद है: निर्धारित समय किसी स्टॉप के पन्ने पर मिलेंगे।",
    scheduledDetail: (count: number): string =>
      `सेवा निर्धारित है: अभी से दिन के अंत तक ${count} फेरे अपेक्षित हैं।`,
    finishedTitle: "आज की सेवा समाप्त",
    finishedDetail: (count: number, clock: string): string =>
      `आज ${count} निर्धारित फेरे थे, आख़िरी ${clock} बजे।`,
    noneTodayTitle: "आज कोई निर्धारित फेरा नहीं",
    noneTodayDetail: "इस रूट पर आज समय-सारणी में कोई फेरा नहीं है।",
    noneTodayFrom: (stopName: string): string =>
      `${stopName} से आज समय-सारणी में कोई फेरा नहीं है।`,
    nextDepartures: "अगले प्रस्थान",
    nextDeparturesFrom: (stopName: string): string => ` ${stopName} से`,
    scheduledOnly: "निर्धारित समय, रीयल-टाइम के बिना।",
  },

  journey: {
    title: "रास्ता",
    subtitle: "रोम में एक जगह से दूसरी जगह, बस, ट्राम और मेट्रो से।",
    from: "कहाँ से",
    to: "कहाँ तक",
    placeholder: "स्टॉप, पता या जगह",
    swap: "उलटें",
    whenLegend: "कब",
    now: "अभी",
    pickTime: "समय चुनें",
    timeLabel: "प्रस्थान की तारीख़ और समय",
    submit: "रास्ता खोजें",
    resultsHeading: "रास्ते",
    emptyTitle: "आपको कहाँ जाना है?",
    emptyHint:
      "शुरुआत और मंज़िल लिखें: हम आधिकारिक समय-सारणी के आधार पर सबसे अच्छा रास्ता खोजते हैं।",
    searching: "रास्ते खोजे जा रहे हैं…",
    noResultsTitle: "कोई रास्ता नहीं",
    noResultsHint:
      "हम सिर्फ़ सीधे या एक बदलाव वाले रास्ते खोजते हैं। शुरुआत की जगह या समय बदलकर देखें।",
    disclaimer:
      "निर्धारित समय, रीयल-टाइम नहीं: असली देरी शामिल नहीं है। पैदल हिस्सों का अनुमान सीधी रेखा में है, इसलिए सड़क पर असली दूरी ज़्यादा होगी।",
    searchedFrom: (when: string): string => ` ${when} से खोज।`,
    mapAria: "चुने हुए रास्ते का नक्शा",
    mapCaption:
      "गाड़ी वाले हिस्से रूट के असली रास्ते पर चलते हैं। बिंदीदार हिस्सों का अनुमान सीधी रेखा में है: बदलाव के पैदल हिस्से और वे कुछ रूट जिनका रास्ता उपलब्ध नहीं।",
    missingEndpoints: "शुरुआत और मंज़िल दोनों बताएँ।",
    badDateTime: "तारीख़ और समय सही नहीं हैं।",
    geoUnsupported: "यह ब्राउज़र जगह पता करना सपोर्ट नहीं करता।",
    geoUnavailable: "अभी जगह उपलब्ध नहीं है।",
    geoOutsideRome: "आप रोम के इलाक़े से बाहर हैं: कोई पता लिखें।",
    geoDenied: "जगह की अनुमति नहीं मिली: कोई पता लिखें।",
    geoTimeout: "जगह पता करने में बहुत समय लगा।",
    originMarker: (name: string): string => `शुरुआत: ${name}`,
    destinationMarker: (name: string): string => `मंज़िल: ${name}`,
    useMyPosition: "मेरी जगह इस्तेमाल करें",
    clearField: (label: string): string => `${label} खाली करें`,
    suggestionsFor: (label: string): string => `${label} के सुझाव`,
    placeStop: "स्टॉप",
    placeCoord: "निर्देशांक",
    placeAddress: "पता",
    walkOnly: "सिर्फ़ पैदल",
    walkOnlyShort: "पैदल",
    noTransfers: "बिना बदलाव",
    transfers: (count: number): string => `${count} बदलाव`,
    walkDistance: (distance: string): string => `${distance} पैदल`,
    walkLeg: (distance: string, duration: string): string =>
      `${distance} पैदल, लगभग ${duration} तक `,
    inService: "चालू",
    stopCount: (count: number): string => `${count} स्टॉप`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `रास्ता ${index}: प्रस्थान ${departure}, आगमन ${arrival}`,
    lineDetailsAria: (line: string): string => `रूट ${line}, विवरण`,
    hours: (hours: number): string => `${hours} घं`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} घं ${minutes}`,
    noticeNoOriginStops:
      "शुरुआती जगह से पैदल दूरी पर कोई स्टॉप नहीं: किसी रूट के पास का पता आज़माएँ।",
    noticeNoDestinationStops:
      "मंज़िल से पैदल दूरी पर कोई स्टॉप नहीं: किसी रूट के पास का पता आज़माएँ।",
    noticeNoConnection: "अगले कुछ घंटों में इन दोनों इलाक़ों के बीच कोई कनेक्शन नहीं मिला।",
    noticeWalkOnlyLeft:
      "अगले कुछ घंटों में समय-सारणी में कोई कनेक्शन नहीं: सिर्फ़ पैदल रास्ता बचा है।",
    noticeLaterDepartures:
      "अगले डेढ़ घंटे में कोई ट्रिप नहीं: उसके बाद की पहली ट्रिप दिखा रहे हैं।",
  },

  alerts: {
    title: "सेवा सूचनाएँ",
    subtitle: "आधिकारिक डेटा में प्रकाशित मार्ग परिवर्तन, निलंबन और बदलाव।",
    loading: "लोड हो रहा है…",
    degraded:
      "रीयल-टाइम डेटा जवाब नहीं दे रहा या पुराना है: ये सूचनाएँ शायद ताज़ा न हों।",
    loadFailed: "सूचनाएँ लोड नहीं हो सकीं।",
    refreshFailed: (error: string): string =>
      `आख़िरी अपडेट नहीं हो सका (${error}): आप पिछली सूची देख रहे हैं।`,
    searchPlaceholder: "खोजें: हड़ताल, मार्ग परिवर्तन, सड़क…",
    searchAria: "सूचनाओं में खोजें",
    filterByLine: "रूट के हिसाब से छाँटें",
    allLines: (count: number): string => `सारे रूट (${count})`,
    networkWide: "सामान्य सूचनाएँ",
    clearFilters: "रीसेट करें",
    noMatch: "किसी सूचना पर फ़िल्टर लागू नहीं होते।",
    filteredCount: (shown: number, total: number): string =>
      `${total} में से ${shown} सूचनाएँ।`,
    activeCount: (count: number, lines: number): string =>
      `${lines} रूटों पर ${count} सक्रिय सूचनाएँ।`,
    goToLine: "रूट पर जाएँ",
    noneTitle: "कोई सक्रिय सूचना नहीं",
    noneHint:
      "फ़िलहाल सेवा में किसी रुकावट या बदलाव की सूचना नहीं है। निकलने से पहले एक बार फिर देख लें।",
    noResultsTitle: "कोई नतीजा नहीं",
    noResultsHint:
      "कम शब्दों से कोशिश करें, या सारी सूचनाएँ फिर से देखने के लिए फ़िल्टर रीसेट करें।",
    noSelectionTitle: "कोई सूचना नहीं चुनी",
    noSelectionHint: "पूरी पढ़ने के लिए बाईं सूची से कोई सूचना चुनें।",
    showMoreLines: (count: number): string => `और रूट दिखाएँ (${count})`,
    goToLineShort: "रूट पर जाएँ",
    fallbackHeader: "सेवा सूचना",
    noDetail: "संचालक ने कोई विवरण नहीं दिया।",
    operatorLink: "संचालक की वेबसाइट पर विवरण",
    affectedLines: "प्रभावित रूट",
    alsoOn: "इन पर भी",
    contextHeading: (count: number): string => `${count} सक्रिय सूचनाएँ`,
    contextAria: "सेवा सूचनाएँ",
    contextAll: "सभी",
    contextUnavailable: (error: string): string => `सूचनाएँ उपलब्ध नहीं: ${error}`,
    contextMore: (count: number): string => `${count} और सूचनाएँ `,
    contextMoreLink: "सूचनाओं के पन्ने पर",
    contextStale: (error: string): string =>
      `आख़िरी अपडेट नहीं हो सका (${error}): ये सूचनाएँ शायद ताज़ा न हों।`,
    windowBetween: (from: string, until: string): string => `${from} से ${until} तक`,
    windowFrom: (from: string): string => `${from} से, समाप्ति नहीं बताई गई`,
    windowUntil: (until: string): string => `${until} तक`,
    windowUnknown: "वैधता की अवधि नहीं बताई गई",
    effect: (code: string): string | null => EFFECT_HI[code] ?? null,
    cause: (code: string): string | null => CAUSE_HI[code] ?? null,
  },

  settings: {
    title: "सेटिंग",
    subtitle: "सब कुछ इसी डिवाइस पर रहता है। न कोई खाता, न कोई सर्वर।",
    sectionArrivals: "आगमन",
    autoRefresh: "अपने आप ताज़ा करना",
    everySeconds: (seconds: number): string => `हर ${seconds} सेकंड`,
    autoRefreshHint: "रीयल-टाइम डेटा दो बार पढ़ने के बीच का अंतराल।",
    maxArrivals: "प्रति स्टॉप कितने आगमन दिखाएँ",
    showScheduled: "निर्धारित समय दिखाएँ",
    showScheduledHint:
      "जब किसी स्टॉप के लिए रीयल-टाइम में कुछ न हो, तब समय-सारणी इस्तेमाल करें।",
    sectionNearby: "मेरे आसपास",
    radius: "खोज का दायरा",
    radiusHint: "यह आसपास के स्टॉप वाले नक्शे के त्वरित दायरों पर भी लागू होता है।",
    sectionAppearance: "रूप",
    themeLegend: "थीम",
    themeSystem: "सिस्टम",
    themeLight: "हल्का",
    themeDark: "गहरा",
    sectionLanguage: "भाषा",
    languageLegend: "इंटरफ़ेस की भाषा",
    languageSystem: "सिस्टम",
    languageHint: (resolved: string): string =>
      `«सिस्टम» पर हम ब्राउज़र की भाषा मानते हैं: अभी यह ${resolved} है।`,
    sectionBackup: "पसंदीदा का बैकअप",
    backupIntro:
      "आपके डिवाइस पर एक JSON फ़ाइल: यहाँ कोई खाता नहीं है, इसलिए पसंदीदा को दूसरे ब्राउज़र में ले जाने का यही तरीका है।",
    exportCount: (count: number): string => `निर्यात करें (${count})`,
    importFromFile: "फ़ाइल से आयात करें",
    exported: (count: number): string => `${count} पसंदीदा निर्यात हुए।`,
    exportFailed: "इस ब्राउज़र पर निर्यात नहीं हो सका।",
    fileTooLarge: "फ़ाइल इतनी बड़ी है कि यह पसंदीदा का बैकअप नहीं लगती।",
    fileUnreadable: "फ़ाइल पढ़ी नहीं जा सकी।",
    importEmpty: "फ़ाइल ख़ाली है।",
    importNotJson: "फ़ाइल मान्य JSON नहीं है।",
    importNoList: "फ़ाइल में पसंदीदा की सूची नहीं है।",
    importNoneValid: "फ़ाइल में कोई मान्य पसंदीदा नहीं मिला।",
    importFound: (count: number): string => `${count} मान्य पसंदीदा मिले`,
    importSkipped: (count: number): string => `, ${count} प्रविष्टियाँ छोड़ी गईं।`,
    importFoundEnd: "।",
    importMerge: "मिलाएँ",
    importReplace: "बदलें",
    replaced: (count: number): string => `पसंदीदा बदल दिए गए: अब ${count} हैं।`,
    mergedNone: "जोड़ने के लिए कोई नया पसंदीदा नहीं।",
    merged: (count: number): string => `${count} पसंदीदा जोड़े गए।`,
    sectionLocalData: "स्थानीय डेटा",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} पसंदीदा, इतिहास में ${recents} स्टॉप।`,
    confirmClearFavorites: "सारे पसंदीदा हटा दें? यह वापस नहीं किया जा सकता।",
    confirmClearFavoritesYes: "हाँ, खाली करें",
    clearFavorites: "पसंदीदा खाली करें",
    favoritesCleared: "पसंदीदा खाली कर दिए गए।",
    confirmClearRecents: "देखे गए स्टॉप का इतिहास हटा दें?",
    confirmClearRecentsYes: "हाँ, हटाएँ",
    clearRecents: "इतिहास हटाएँ",
    recentsCleared: "इतिहास हटा दिया गया।",
    resetDefaults: "डिफ़ॉल्ट सेटिंग पर लौटें",
    settingsReset: "सेटिंग डिफ़ॉल्ट मानों पर लौटा दी गईं।",
    infoLink: "जानकारी, डेटा के स्रोत और आम सवाल",
  },

  sync: {
    titleFull: "डिवाइस सिंक करें",
    titleCollapsed: "सिंक",
    badgeOn: "चालू",
    summaryLoading: "…",
    summaryUnavailable: "इस कनेक्शन पर उपलब्ध नहीं",
    summaryOff: "बंद",
    summarySyncing: "सिंक हो रहा है…",
    summaryError: "सिंक में गड़बड़ी",
    summaryConflict: "सुलझाने के लिए टकराव है",
    summaryOn: (last: string): string => `चालू · आख़िरी ${last}`,
    intro:
      "एक कोड से पसंदीदा, हाल के स्टॉप और सेटिंग दूसरे डिवाइस पर ले जाएँ। डेटा यहीं एन्क्रिप्ट होता है: सर्वर पर सिर्फ़ न पढ़ा जा सकने वाला डेटा रहता है।",
    enable: "सिंक चालू करें",
    haveCode: "मेरे पास पहले से कोड है",
    codeLabel: "सिंक कोड",
    codeHint:
      "20 अक्षर, जैसे दूसरे डिवाइस पर दिख रहे हैं। छोटे-बड़े अक्षर, डैश और स्पेस से फ़र्क नहीं पड़ता।",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} अक्षर`,
    join: "जोड़ें",
    onIntro:
      "डेटा इस डिवाइस से निकलने से पहले एन्क्रिप्ट होता है। जिसके पास कोड होगा वह आपके सारे पसंदीदा पढ़ सकता है: इसे सिर्फ़ अपने ही डिवाइस पर इस्तेमाल करें।",
    code: "कोड",
    showCode: "कोड दिखाएँ",
    hideCode: "कोड छिपाएँ",
    copyCode: "कोड कॉपी करें",
    copied: "कॉपी हो गया",
    lastSync: "आख़िरी सिंक:",
    inProgress: " · चल रहा है…",
    syncNow: "अभी सिंक करें",
    disconnect: "डिस्कनेक्ट करें",
    disconnectNote:
      "डिस्कनेक्ट करने पर डेटा इसी डिवाइस पर रहता है, और एन्क्रिप्ट की गई कॉपी सर्वर पर तब तक रहती है जब तक आप उसे हटा न दें।",
    deleteWarning:
      "सर्वर से एन्क्रिप्ट की गई कॉपी हटा देता है। दूसरे डिवाइस को सिंक करने के लिए कुछ नहीं मिलेगा। यह वापस नहीं किया जा सकता।",
    deleteConfirm: "सच में हटाएँ",
    deleteRemote: "सर्वर से डेटा हटाएँ",
    justNow: "अभी",
    minutesAgo: (minutes: number): string => `${minutes} मिन पहले`,
    atClock: (clock: string): string => `${clock} बजे`,
    errors: {
      aborted: "कार्रवाई रद्द कर दी गई।",
      generic: "सिंक नहीं हो सका। थोड़ी देर बाद फिर कोशिश करें।",
      insecureContext:
        "सिंक के लिए सुरक्षित कनेक्शन चाहिए: साइट https पर खोलें (या localhost पर)। सादे http पर ब्राउज़र एन्क्रिप्शन बंद कर देते हैं, इसलिए इस डिवाइस पर कुछ भी एन्क्रिप्ट नहीं हो सकता।",
      noBase64Encode: "यह ब्राउज़र सिंक डेटा को एनकोड नहीं कर सकता।",
      noBase64Decode: "यह ब्राउज़र सिंक डेटा को डिकोड नहीं कर सकता।",
      invalidSyncData: (what: string): string => `सिंक डेटा सही नहीं है (${what})।`,
      codeRequired: "सिंक कोड डालें।",
      codeTooLong: (max: number): string => `यह कोड बहुत लंबा है: ${max} अक्षर होने चाहिए।`,
      codeInvalidChars: (chars: string): string =>
        `कोड में ऐसे अक्षर हैं जिनकी अनुमति नहीं है: ${chars}।`,
      codeWrongLength: (required: number, actual: number): string =>
        `कोड ${required} अक्षर का होता है, आपने ${actual} लिखे हैं।`,
      keyDerivationFailed: "यह ब्राउज़र सिंक की कुंजियाँ नहीं बना सकता।",
      preparePayloadFailed: "सिंक करने का डेटा तैयार नहीं हो सका।",
      encryptFailed: "इस डिवाइस पर डेटा एन्क्रिप्ट नहीं हो सका।",
      decryptFailed: "कोड इस डेटा से मेल नहीं खाता, या सर्वर पर रखा डेटा ख़राब है।",
      invalidSyncId: "सिंक पहचानकर्ता सही नहीं है।",
      responseTooLarge: "सर्वर ने ज़रूरत से ज़्यादा डेटा भेजा।",
      timeout: "सर्वर ने समय पर जवाब नहीं दिया।",
      unreachable: "सर्वर तक नहीं पहुँच सके। अपना कनेक्शन देखें।",
      invalidResponse: "सर्वर का जवाब सही नहीं।",
      invalidResponseField: (what: string): string => `सर्वर का जवाब सही नहीं (${what})।`,
      unexpectedFormat: "सर्वर ने अनपेक्षित रूप में जवाब दिया।",
      rateLimited: "लगातार बहुत ज़्यादा सिंक। एक मिनट बाद फिर कोशिश करें।",
      pullRejected: (status: number): string => `सर्वर ने पढ़ने से मना कर दिया (गड़बड़ी ${status})।`,
      payloadTooLarge: "सिंक करने के लिए डेटा बहुत ज़्यादा है।",
      pushRejected: (status: number): string =>
        `सर्वर ने सहेजने से मना कर दिया (गड़बड़ी ${status})।`,
      deleteRejected: (status: number): string =>
        `सर्वर ने हटाने से मना कर दिया (गड़बड़ी ${status})।`,
      conflict:
        "इसी डेटा में अभी दूसरा डिवाइस लिख रहा है। आपका स्थानीय डेटा सुरक्षित है: कुछ सेकंड बाद फिर कोशिश करें।",
    },
    status: {
      deleted: "सर्वर से डेटा हटा दिया गया। यह डिवाइस अब सिंक नहीं हो रहा।",
      disconnected:
        "इस डिवाइस पर सिंक बंद है। आपका डेटा यहीं रहेगा और एन्क्रिप्ट की गई कॉपी सर्वर पर तब तक रहेगी जब तक आप उसे हटा न दें।",
    },
  },

  info: {
    title: "जानकारी",
    subtitle:
      "आधिकारिक खुले डेटा से रोम के सार्वजनिक परिवहन की समय-सारणी और आगमन।",
    unofficialTitle: "ग़ैर-आधिकारिक ऐप",
    unofficialBody:
      "यह साइट ATAC S.p.A., Roma Servizi per la Mobilità या Roma Capitale से किसी भी तरह जुड़ी, संबद्ध, अधिकृत या समर्थित नहीं है। यह एक स्वतंत्र परियोजना है जो सिर्फ़ इन संस्थाओं द्वारा प्रकाशित खुला डेटा पढ़ती है। आधिकारिक जानकारी, टिकट और शिकायत के लिए उनके अपने माध्यमों से संपर्क करें।",
    whatTitle: "यह क्या है",
    whatBody1:
      "एक वेब ऐप, जिससे पता चले कि आप जिस स्टॉप पर हैं वहाँ अगली गाड़ी कितनी देर में आएगी। कोई स्टॉप या रूट खोजें, पसंदीदा में सहेजें, और होम पर ताज़ा आगमन के साथ वह मिल जाएगा। न खाता, न विज्ञापन, न इस्तेमाल के आँकड़े।",
    whatBody2:
      "जब रीयल-टाइम डेटा उस फेरे को कवर करता है, तो दिखाया गया समय गाड़ी की जगह पर आधारित अनुमान होता है। वरना ऐप निर्धारित समय पर लौट आता है और यह हमेशा बता देता है, पुराने डेटा को अनुमान बताकर नहीं चलाता।",
    dataTitle: "डेटा कहाँ से आता है",
    dataBodyBefore:
      "समय-सारणी, स्टॉप, रूट, रास्ते, गाड़ियों की जगह और सेवा सूचनाएँ इस संस्था के खुले डेटा से आती हैं: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS और GTFS-Realtime)। निर्धारित समय हर दिन अपडेट होते हैं, रीयल-टाइम लगभग हर 30 सेकंड।",
    dataLink: "romamobilita.it — खुला डेटा",
    dataLicence:
      "डेटा अपने-अपने स्वामियों का ही रहता है और उसी लाइसेंस की शर्तों पर इस्तेमाल होता है जिसके तहत वह प्रकाशित हुआ है।",
    privacyTitle: "निजता",
    privacyBody:
      "यहाँ न लॉगिन है, न कोई उपयोगकर्ता प्रोफ़ाइल। पसंदीदा, हाल में देखे गए स्टॉप और सेटिंग सिर्फ़ आपके ब्राउज़र में सहेजे जाते हैं और कहीं नहीं भेजे जाते। आसपास के स्टॉप खोजने के लिए अगर आप जगह की अनुमति देते हैं, तो वह डिवाइस में ही रहती है: दूरी नापने के काम आती है और सहेजी नहीं जाती।",
    faqTitle: "आम सवाल",
    faq1Q: "कोई रूट या बस क्यों नहीं दिखती?",
    faq1A:
      "हम सिर्फ़ वही दिखाते हैं जो आधिकारिक डेटा में है। अगर कोई गाड़ी अपनी जगह नहीं भेजती, या उसका फेरा रीयल-टाइम डेटा में नहीं है, तो हमारे लिए वह है ही नहीं: ज़्यादा से ज़्यादा आपको निर्धारित समय दिखेगा। यह अक्सर बदली वाली गाड़ियों, शटल बसों और ख़राब लोकेटर वाली गाड़ियों के साथ होता है।",
    faq2Q: "स्टॉप पर लिखे समय से यह अलग क्यों है?",
    faq2A:
      "खंभे पर लगा बोर्ड निर्धारित समय बताता है, जो साल में कुछ ही बार बदलता है। यहाँ, जब गाड़ी डेटा भेजती है, तो आप उसकी असली जगह से निकाला गया अनुमान देखते हैं, जिसमें ट्रैफ़िक और देरी शामिल होती है। जब «निर्धारित» लिखा हो, तो अनुमान नहीं है और हम बोर्ड वाला ही समय दिखा रहे होते हैं।",
    faq3Q: "रात में क्या होता है?",
    faq3A:
      "रात में रीयल-टाइम डेटा लगभग ख़ाली रहता है, क्योंकि गाड़ियाँ कम चलती हैं। ऐप रात के रूटों की निर्धारित समय-सारणी से काम करता रहता है। GTFS में सेवा-दिवस आधी रात को नहीं, 04:00 बजे ख़त्म होता है: रात एक बजे का फेरा अब भी पिछले दिन का माना जाता है, इसीलिए आपको 25:30 जैसा समय 01:30 में बदला हुआ दिख सकता है।",
    faq4Q: "क्या मेरे पसंदीदा किसी सर्वर पर जाते हैं?",
    faq4A:
      "नहीं। पसंदीदा, इतिहास और सेटिंग ब्राउज़र के localStorage में रहते हैं। अगर आप साइट का डेटा मिटा दें या डिवाइस बदल लें, तो वे चले जाएँगे: सेटिंग से आप उन्हें JSON फ़ाइल में निर्यात करके कहीं और आयात कर सकते हैं।",
    settingsLink: "सेटिंग पर जाएँ",
  },

  footer: {
    dataPrefix: "सेवा डेटा और समय-सारणी: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (GTFS खुला डेटा)।",
    independent:
      "स्वतंत्र परियोजना, ATAC या Roma Servizi per la Mobilità से संबद्ध नहीं। ",
    infoLink: "जानकारी",
  },

  errors: {
    genericTitle: "कुछ काम नहीं आया",
    unexpected: "अप्रत्याशित गड़बड़ी",
    unexpectedDot: "अप्रत्याशित गड़बड़ी।",
    stopNotFound: "स्टॉप नहीं मिला",
    serviceDown: "सेवा जवाब नहीं दे रही",
    requestFailed: (status: number): string => `अनुरोध पूरा नहीं हुआ (${status})`,
    httpStatus: (status: number): string => `गड़बड़ी ${status}`,
    badResponse: "सर्वर का जवाब सही नहीं",
    badResponseDot: "सर्वर का जवाब सही नहीं।",
    timedOut: "अनुरोध का समय ख़त्म",
    timedOutDot: "अनुरोध का समय ख़त्म।",
    offline: "कोई कनेक्शन नहीं",
    connectionFailed: "कनेक्शन नहीं बन सका।",
    tooManyRequests: "बहुत ज़्यादा अनुरोध",
    badRequest: "पैरामीटर सही नहीं",
    lineNotFound: "रूट नहीं मिला",
    journeyOriginNotFound: "चलने की जगह नहीं मिली",
    journeyDestinationNotFound: "मंज़िल नहीं मिली",
    journeyPlaceHint: "ज़्यादा साफ़ पता आज़माएँ।",
  },

  notFound: {
    kicker: "गड़बड़ी 404",
    title: "इस स्टॉप पर सेवा नहीं",
    body:
      "यह पन्ना मौजूद नहीं है। यह पुराने लिंक से हो सकता है, या ऐसे स्टॉप या रूट के कोड से जो अब डेटा में नहीं है।",
    searchCta: "स्टॉप खोजें",
    nearbyCta: "आसपास के स्टॉप",
  },

  appError: {
    title: "फेरा रुक गया",
    body:
      "यह स्क्रीन लोड नहीं हो सकी। फिर कोशिश करें: अगर दिक़्क़त बनी रहे, तो शायद डेटा सेवा ही जवाब नहीं दे रही।",
    digest: (digest: string): string => `कोड: ${digest}`,
    backHome: "होम पर लौटें",
    globalTitle: "सेवा रुकी हुई है",
    globalBody:
      "एक अप्रत्याशित गड़बड़ी की वजह से ऐप रुक गया। पन्ना फिर से लोड करें: आपके पसंदीदा फ़ोन में सहेजे हुए हैं और खोएँगे नहीं।",
    reload: "फिर लोड करें",
  },

  format: {
    due: "पहुँचने वाली है",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "तारीख़ उपलब्ध नहीं",
    minutes: (minutes: number): string => `${minutes} मिन`,
    metres: (metres: number): string => `${metres} मी`,
    kilometres: (value: string): string => `${value} किमी`,
    ageUnknown: "अपडेट का समय पता नहीं",
    ageSeconds: (seconds: number): string => `${seconds} सेकंड पहले अपडेट`,
    ageMinutes: (minutes: number): string => `${minutes} मिन पहले अपडेट`,
    ageAt: (clock: string): string => `${clock} बजे अपडेट`,
    onTime: "समय पर",
    delayLate: (minutes: number): string => `+${minutes} मिन`,
    delayEarly: (minutes: number): string => `${minutes} मिन`,
  },

  meta: {
    appTitle: "BusFinder — रीयल-टाइम प्रस्थान",
    appDescription:
      "रोम में बस, ट्राम और मेट्रो के रीयल-टाइम समय और प्रस्थान। सहेजे गए स्टॉप, आसपास के स्टॉप और सेवा सूचनाएँ, बिना खाते और बिना विज्ञापन के।",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "आपके सबसे नज़दीकी ATAC स्टॉप, नक्शे और वहाँ से गुज़रने वाले रूटों के साथ।",
    journeyDescription:
      "रोम में एक जगह से दूसरी जगह बस, ट्राम और मेट्रो से कैसे पहुँचें, आधिकारिक ATAC समय-सारणी पर।",
    alertsDescription: "आधिकारिक फ़ीड पर छपे मार्ग परिवर्तन, सेवा का बंद होना और सेवा में बदलाव।",
    settingsDescription: "आगमन का अपडेट, खोज का दायरा, थीम और सहेजी गई चीज़ों का प्रबंधन।",
    infoDescription:
      "यह ऐप क्या है, डेटा कहाँ से आता है, और यह ATAC या Roma Servizi per la Mobilità से संबद्ध क्यों नहीं है।",
    stopDescription: "स्टॉप के रीयल-टाइम प्रस्थान और निर्धारित समय-सारणी।",
    lineDescription: "रूट का रास्ता, स्टॉप और रीयल-टाइम गाड़ियाँ।",
  },

  skeleton: {
    loading: "लोड हो रहा है",
  },
};

const EFFECT_HI: Record<string, string | undefined> = {
  NO_SERVICE: "सेवा बंद",
  REDUCED_SERVICE: "सेवा कम",
  SIGNIFICANT_DELAYS: "काफ़ी देरी",
  DETOUR: "मार्ग परिवर्तन",
  ADDITIONAL_SERVICE: "अतिरिक्त सेवा",
  MODIFIED_SERVICE: "सेवा में बदलाव",
  STOP_MOVED: "स्टॉप हटाया गया",
  NO_EFFECT: "सेवा पर कोई असर नहीं",
  ACCESSIBILITY_ISSUE: "सुलभता की समस्या",
  OTHER_EFFECT: "अन्य",
  UNKNOWN_EFFECT: "असर नहीं बताया गया",
};

const CAUSE_HI: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "तकनीकी ख़राबी",
  STRIKE: "हड़ताल",
  DEMONSTRATION: "प्रदर्शन",
  ACCIDENT: "दुर्घटना",
  HOLIDAY: "छुट्टी",
  WEATHER: "ख़राब मौसम",
  MAINTENANCE: "रखरखाव",
  CONSTRUCTION: "सड़क का काम",
  POLICE_ACTIVITY: "पुलिस कार्रवाई",
  MEDICAL_EMERGENCY: "चिकित्सा आपात",
  OTHER_CAUSE: "अन्य कारण",
  UNKNOWN_CAUSE: "कारण नहीं बताया गया",
};
