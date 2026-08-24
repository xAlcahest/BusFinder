/**
 * Bengali dictionary. Shape and key order follow it.ts, the source of truth.
 * The nouns used here stay unmarked after a numeral ("৩ স্টপ"), so counted
 * strings interpolate directly and need no plural helper.
 */

import type { Dictionary } from "./it";

export const bn: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, হোম",
  },

  a11y: {
    skipToContent: "মূল অংশে যান",
  },

  common: {
    retry: "আবার চেষ্টা করুন",
    cancel: "বাতিল",
    save: "সংরক্ষণ",
    close: "বন্ধ",
    home: "হোম",
    back: "ফিরে যান",
    all: "সব",
    loading: "লোড হচ্ছে…",
    searching: "খোঁজা হচ্ছে…",
    refresh: "নতুন করে দেখুন",
    dash: "—",
    minutesShort: "মিন",
    clearSearch: "খোঁজা মুছুন",
    searchInProgress: "খোঁজা চলছে",
  },

  nav: {
    primary: "মূল নেভিগেশন",
    sidebar: "সাইডবার",
    sidebarNav: "পাশের নেভিগেশন",
    openMenu: "মেনু খুলুন",
    closeMenu: "মেনু বন্ধ করুন",
    sections: "বিভাগ",
    shortcuts: "শর্টকাট",
    infoAria: "অ্যাপ সম্পর্কে তথ্য",
    home: "হোম",
    nearbyShort: "কাছাকাছি",
    nearby: "কাছের স্টপ",
    journey: "পথ",
    alerts: "ঘোষণা",
    settings: "সেটিংস",
    info: "তথ্য",
    hintNearby: "এখানে আশেপাশে কী চলে",
    hintJourney: "এক জায়গা থেকে আরেক জায়গায়",
    hintAlerts: "রুট বদল ও বিঘ্ন",
    hintSettings: "হালনাগাদ, থিম, তথ্য",
    hintInfo: "উৎস ও আইনি তথ্য",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ট্রাম";
        case 1:
          return "মেট্রো";
        case 2:
          return "ট্রেন";
        case 4:
          return "ফেরি";
        default:
          return "বাস";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ট্রাম";
        case 1:
          return "মেট্রো";
        case 2:
          return "ট্রেন";
        case 3:
          return "বাস";
        default:
          return "রুট";
      }
    },
    named: (name: string): string => `রুট ${name}`,
    namedAria: (name: string): string => `রুট ${name}`,
    details: "বিস্তারিত",
    towards: (headsign: string): string => `${headsign} অভিমুখে`,
    towardsCapital: (headsign: string): string => `${headsign} অভিমুখে`,
    direction: "দিক",
    terminus: "শেষ স্টপ",
    noHeadsign: "গন্তব্য দেওয়া নেই",
  },

  stops: {
    code: (code: string): string => `স্টপ ${code}`,
    codeOnly: "স্টপ",
    pole: (code: string): string => `খুঁটি ${code}`,
    accessible: "প্রবেশযোগ্য স্টপ",
    named: (name: string): string => `${name} স্টপ`,
    countLabel: (count: number): string => `${count} স্টপ`,
    involved: (count: number): string => `${count} স্টপ ক্ষতিগ্রস্ত`,
  },

  home: {
    kicker: "রোম · গণপরিবহন",
    title: "পরেরটা কখন আসবে?",
    intro:
      "নম্বর বা নাম দিয়ে স্টপ খুঁজুন, কিংবা কোনো রুট। আসার সময় রোমের রিয়েল-টাইম তথ্য থেকে নেওয়া।",
  },

  search: {
    inputAria: "স্টপ বা রুট খুঁজুন",
    placeholder: "স্টপ, রাস্তা বা রুট",
    searchingFor: (query: string): string => `«${query}» খোঁজা হচ্ছে…`,
    noResultsFor: (query: string): string => `«${query}»-এর জন্য কিছু পাওয়া যায়নি`,
    noResultsHint:
      "স্টপের নম্বর (যেমন 70101), রাস্তার নাম বা রুট নম্বর দিয়ে দেখুন।",
    resultsList: "খোঁজার ফল",
    keyboardHint: "↑ ↓ দিয়ে ঘুরুন, Enter দিয়ে খুলুন, Esc দিয়ে বন্ধ করুন",
  },

  favorites: {
    heading: "প্রিয়",
    emptyTitle: "এখনো কিছু প্রিয় নেই",
    emptyHint:
      "কোনো স্টপ বা রুটের পাশের ★ তারায় চাপ দিন: খোঁজার ফলে, কাছের স্টপে, স্টপের পাতায় বা রুটের পাতায়। এরপর সেটা এখানেই পাবেন, বারবার খুঁজতে হবে না।",
    reorder: "ক্রম বদলান",
    reorderDone: "হয়ে গেছে",
    reorderHint: "তির চিহ্ন দিয়ে স্টপ সরান। এই ক্রম শুধু এই ডিভাইসে খাটে।",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: ${total}-এর মধ্যে ${position} নম্বরে।`,
    moveUp: (name: string): string => `${name} উপরে সরান`,
    moveDown: (name: string): string => `${name} নিচে সরান`,
    addStar: (name: string): string => `${name} স্টপে তারা দিন`,
    removeStar: (name: string): string => `${name} স্টপ থেকে তারা সরান`,
    addStarLine: (name: string): string => `রুট ${name}-এ তারা দিন`,
    removeStarLine: (name: string): string => `রুট ${name} থেকে তারা সরান`,
    starredTitle: "তারা দেওয়া: প্রিয়তে আছে",
    starTitle: "তারা দিন",
    starredLabel: "তারা দেওয়া",
    starLabel: "তারা",
    editLabels: (name: string): string => `${name}-এর নাম ও রুট বদলান`,
    onlyLines: (labels: string): string => `শুধু ${labels}`,
    notUpdated: "হালনাগাদ হয়নি",
    noArrivalsOnPinned: "বেছে নেওয়া রুটে কোনো গাড়ি নেই।",
    changeLines: "রুট বদলান",
    noArrivalsSoon: "পরের কয়েক মিনিটে কোনো গাড়ি নেই।",
    openForTimes: "সময় দেখতে খুলুন",
    vehiclesUnavailable: "গাড়ির তথ্য নেই",
    lookingForVehicles: "চলন্ত গাড়ি খোঁজা হচ্ছে…",
    noVehiclesNow: "এখন কোনো গাড়ি চলছে না",
    vehiclesInService: (count: number): string => `এখন ${count} গাড়ি চলছে`,
    refreshArrivals: "আসার সময় নতুন করে দেখুন",
    undoRemovedStop: "স্টপ থেকে তারা সরানো হলো: আর প্রিয়তে নেই।",
    undoRemovedLine: "রুট থেকে তারা সরানো হলো: আর প্রিয়তে নেই।",
    undoDismiss: "ঘোষণা বন্ধ করুন",
    more: (count: number): string => `আরও ${count} প্রিয়`,
    sidebarEmptyBefore: "কোনো স্টপ বা রুটের পাশের তারায় চাপ দিন, খোঁজার ফলে, ",
    sidebarEmptyAfter: "-এ, বা যে পাতাটা দেখছেন সেখানে। এরপর এখানেই পাবেন।",
    nextDeparture: "পরের গাড়ি",
    noDeparture: "কোনো গাড়ি নেই",
    notAvailableShort: "—",
  },

  recents: {
    heading: "সম্প্রতি দেখা",
    clear: "খালি করুন",
    emptyTitle: "সম্প্রতি কোনো স্টপ দেখা হয়নি",
    emptyHint:
      "যে স্টপগুলো খোলেন সেগুলো কয়েক দিন এখানে থাকে, যাতে আবার খুঁজতে না হয়।",
    listAria: "সম্প্রতি দেখা স্টপ",
    justNow: "এইমাত্র",
    today: "আজ",
    yesterday: "গতকাল",
  },

  arrivals: {
    due: "চলে আসছে",
    live: "রিয়েল-টাইম",
    scheduled: "সময়সূচি অনুযায়ী",
    scheduledTail: " নির্ধারিত",
    scheduledSr: "নির্ধারিত সময়",
    onTime: "সময়মতো",
    lateBy: (minutes: number): string => `+${minutes} মিন`,
    earlyBy: (minutes: number): string => `−${minutes} মিন`,
    lateSuffix: "দেরি",
    earlySuffix: "আগে",
    lateSr: (minutes: number): string => `${minutes} মিনিট দেরি`,
    earlySr: (minutes: number): string => `${minutes} মিনিট আগে`,
    skipped: "বাতিল",
    skippedSr: "এই যাত্রা বাতিল",
    atClock: (clock: string): string => `${clock}-এ`,
    towardsSr: (headsign: string): string => `${headsign} দিক`,
    loadingAria: "আসার তথ্য লোড হচ্ছে",
    emptyTitle: "কোনো গাড়ি আসার কথা নেই",
    emptyHint:
      "কোনো যাত্রা কাছে আসছে না। নির্ধারিত সময় দেখুন, বা একটু পরে আবার দেখুন।",
    frozenUnknown: "অনুমান হালনাগাদ হয়নি",
    frozenFor: (minutes: number): string => `${minutes} মিন ধরে থেমে আছে`,
    frozenPrefix: (state: string): string => `অনুমান ${state}`,
    frozenSr: (state: string): string => `অনুমান ${state}, রিয়েল-টাইমে হালনাগাদ হচ্ছে না`,
    expectedSr: (relative: string, clock: string): string =>
      `${relative} আসার কথা, ${clock}-এ`,
    bannerNoRealtimeStrong: "রিয়েল-টাইম তথ্য নেই।",
    bannerNoRealtime:
      " আমরা নির্ধারিত সময় দেখাচ্ছি: গাড়ি আগে বা পরে আসতে পারে।",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "রিয়েল-টাইম তথ্য থেমে গেছে।" : `রিয়েল-টাইম তথ্য ${minutes} মিন ধরে থেমে আছে।`,
    bannerFrozenBefore: " নিচের অনুমানগুলো",
    bannerFrozenLastUpdate: " শেষ হালনাগাদের",
    bannerFrozenAt: (clock: string): string => ` (${clock})`,
    bannerFrozenAfter: " সময়ের, আর হালনাগাদ হচ্ছে না: সাবধানে দেখুন।",
    bannerPartialStrong: "রিয়েল-টাইম তথ্য আংশিক।",
    bannerPartial: " তথ্যের কিছু অংশ আসেনি: কিছু যাত্রা বাদ পড়তে পারে।",
    showOnMap: (line: string): string => `রুট ${line}-এর গাড়ি মানচিত্রে দেখান`,
    hideOnMap: (line: string): string => `রুট ${line}-এর গাড়ির চিহ্ন সরান`,
  },

  dataAge: {
    prefix: "হালনাগাদ",
    now: "এখন",
    secondsAgo: (seconds: number): string => `${seconds} সেকেন্ড আগে`,
    minutesAgo: (minutes: number): string => `${minutes} মিন আগে`,
    atClock: (clock: string): string => `${clock}-এ`,
    never: "কখনো নয়",
  },

  refreshFeedback: {
    updated: "হালনাগাদ হয়েছে",
    unchanged: "দেখা হয়েছে, নতুন কিছু নেই",
    failed: "হালনাগাদ হয়নি",
    updatedShort: "হালনাগাদ হয়েছে",
    unchangedShort: "নতুন কিছু নেই",
    failedShort: "হালনাগাদ হয়নি",
    busy: "হালনাগাদ হচ্ছে…",
    busySpoken: "হালনাগাদ চলছে",
  },

  stop: {
    tabArrivals: "আসছে",
    tabTimetable: "সময়সূচি",
    tabsAria: "স্টপের চেহারা",
    editTag: "নাম বদলান",
    addTag: "নাম",
    map: "মানচিত্র",
    realtimePrefix: "রিয়েল-টাইম",
    noRealtime: "রিয়েল-টাইম তথ্য নেই",
    pageNotUpdated: "পাতা এখনো হালনাগাদ হয়নি",
    pageUpdatedAt: (clock: string): string => `পাতা ${clock}-এ হালনাগাদ হয়েছে`,
    lastDataSuffix: (error: string): string => `${error}। আপনি শেষ পাওয়া তথ্য দেখছেন।`,
    arrivalsUnavailable: "আসার তথ্য নেই",
    emptyHint:
      "এখন কোনো যাত্রা কাছে আসছে না। পরের গাড়ি কখন আসার কথা জানতে সময়সূচি খুলুন।",
    seeTimetable: "সময়সূচি দেখুন",
    linesHere: "যে রুটগুলো এখানে থামে",
  },

  tagDialog: {
    titleFavorite: "প্রিয়",
    titleTag: "স্টপের নাম",
    label: "আপনি একে কী বলেন",
    placeholder: "বাসা, অফিস, জিম…",
    hint: (maxChars: number): string =>
      `শুধু আপনার জন্য: এই ডিভাইসেই থাকবে, সর্বোচ্চ ${maxChars} অক্ষর।`,
    linesLegend: "যে রুটগুলো দেখাবে",
    linesNone: "কিছু বাছা হয়নি: কার্ডে সব রুট দেখাবে।",
    linesSome: (count: number): string => `কার্ডে শুধু ${count} রুট।`,
    showAllLines: "সব রুট দেখান",
    removeTag: "নাম মুছুন",
  },

  timetable: {
    previousDay: "আগের দিন",
    nextDay: "পরের দিন",
    today: "আজ",
    scheduled: "নির্ধারিত সময়",
    jumpToNow: "এখনে যান",
    backToToday: "আজে ফিরুন",
    fromServiceStart: "চলাচলের শুরু থেকে",
    unavailableTitle: "সময়সূচি নেই",
    partialError: (error: string): string => `${error}। আপনি আগে থেকে লোড হওয়া যাত্রাগুলো দেখছেন।`,
    emptyTitle: "এরপর আর কোনো যাত্রা নেই",
    emptyFromNow:
      "এই সময়ের পর আর কোনো গাড়ি নেই। চলাচলের শুরু থেকে দেখুন, অন্য দিন বেছে নিন, বা রুটের ছাঁকনি সরান।",
    emptyWholeDay:
      "এই দিনে কোনো গাড়ি নির্ধারিত নেই: আগের বা পরের দিন দেখুন, বা রুটের ছাঁকনি সরান।",
    loadMore: "আরও যাত্রা দেখান",
    loadingMore: "লোড হচ্ছে…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${from} থেকে ${to} পর্যন্ত ${count} যাত্রা` +
      (complete ? ", চলাচলের শেষ পর্যন্ত" : "") +
      "। এগুলো চলাচলের দিনের সরকারি সময়, রিয়েল-টাইম ছাড়া।",
  },

  map: {
    fallbackAria: "মানচিত্র",
    vehiclesHeading: "মানচিত্রে গাড়ি",
    show: "দেখান",
    hide: "লুকান",
    modeGroup: "কোন গাড়িগুলো দেখাবে",
    modeApproaching: "এখানে আসছে",
    modeAllLines: "সব রুট",
    loadingStop: "স্টপের অবস্থান লোড হচ্ছে…",
    stopMapAria: (stopName: string): string => `${stopName} স্টপের গাড়ির মানচিত্র`,
    centreOnStop: "স্টপকে মাঝখানে রাখুন",
    nearbyVehicles: "এখানে কাছের গাড়ি",
    allVehicles: "সব, দূরেরগুলোও",
    loadingVehicles: "গাড়ি লোড হচ্ছে…",
    noneApproaching: "কোনো গাড়ি কাছে আসছে না",
    approachingCount: (count: number): string => `${count} গাড়ি আসছে`,
    onTheseLines: (count: number): string => `এই স্টপের রুটগুলোতে ${count} গাড়ি`,
    positionsAt: (clock: string): string => `${clock}-এর অবস্থান`,
    positionsStale: "অবস্থান হালনাগাদ হয়নি",
    allLinesNote:
      "গাঢ় রঙের গাড়িগুলো এই স্টপের দিকেই আসছে, ফিকেগুলো একই রুটে চলছে কিন্তু এখন এখান দিয়ে যাচ্ছে না।",
    approachingList: "আসছে এমন গাড়ি",
    hereIn: (relative: string): string => `এখানে ${relative}`,
    hereInAt: (relative: string, clock: string): string => `এখানে ${relative}, ${clock}-এ`,
    notInbound: "এই রুটে চলছে, কিন্তু এই স্টপের দিকে নয়",
    noBearing: " · দিক পাঠানো হয়নি",
    follow: "আমি এই গাড়িতেই আছি, একে অনুসরণ করুন",
    unfollow: "অনুসরণ বন্ধ করুন",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `রুট ${line}, এখানে ${relative}${followed ? ", আপনি একে অনুসরণ করছেন" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `রুট ${line}, চলছে, এই স্টপের দিকে নয়${followed ? ", আপনি একে অনুসরণ করছেন" : ""}`,
    yourPosition: "আপনার অবস্থান",
    vehicleTitle: (vehicleId: string): string => `গাড়ি ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName} মানচিত্রে দেখান`,
    divertedSuffix: " · রুটের বাইরে",
    divertedBadge: "রুটের বাইরে",
    divertedNote: "নির্ধারিত পথের বদলে অন্য পথে চলছে।",
  },

  follow: {
    headlineLive: "আমি এই গাড়িটা অনুসরণ করছি",
    headlinePaused: "অনুসরণ থামানো",
    headlineStale: "অবস্থান নড়ছে না",
    headlineLost: "গাড়ি আর রুটে নেই",
    detailLive: "প্রতিবার হালনাগাদে মানচিত্র একেই মাঝখানে রাখে।",
    detailPaused:
      "আপনি মানচিত্র সরিয়েছেন, তাই আমি আর সরাচ্ছি না। গাড়িতে ফিরতে «চালিয়ে যান» চাপুন।",
    detailStaleUnknown: "গাড়িটা কিছুক্ষণ ধরে নিজের অবস্থান পাঠাচ্ছে না।",
    detailStale: (age: string): string =>
      `গাড়ি ${age} ধরে কিছু পাঠাচ্ছে না: মানচিত্রে যেটা আছে সেটা শেষ জানা জায়গা।`,
    detailLost:
      "আর অবস্থান পাচ্ছি না। হয়তো যাত্রা শেষ হয়েছে বা এটা চলাচল থেকে সরে গেছে।",
    ageMinutes: (minutes: number): string => `${minutes} মিনিট`,
    ageHours: (hours: number): string => `${hours} ঘণ্টা`,
    compact: "অনুসরণ করছি",
    compactSr: (line: string): string => ` রুট ${line}`,
    lineSr: (line: string): string => `, রুট ${line}`,
    resume: "চালিয়ে যান",
    exit: "বেরিয়ে যান",
    close: "বন্ধ",
    lostHint: "এখনো চললে «সব রুট»-এ গিয়ে খুঁজে পাবেন।",
  },

  nearby: {
    title: "কাছের স্টপ",
    mapAria: "কাছের স্টপের মানচিত্র",
    searchHere: "এই এলাকায় খুঁজুন",
    radius: "ব্যাসার্ধ",
    locating: "অবস্থান বের করা হচ্ছে…",
    myPosition: "আমার অবস্থান",
    geoDenied:
      "অবস্থানের অনুমতি দেওয়া হয়নি। আমরা রোমের কেন্দ্র দেখাচ্ছি: মানচিত্র সরিয়ে সেই এলাকায় খুঁজুন।",
    geoUnavailable:
      "এখন অবস্থান পাওয়া যাচ্ছে না। আমরা রোমের কেন্দ্র দেখাচ্ছি: মানচিত্র সরিয়ে সেই এলাকায় খুঁজুন।",
    geoTimeout:
      "অবস্থান বের করতে অনেক সময় লেগেছে। আমরা রোমের কেন্দ্র দেখাচ্ছি: মানচিত্র সরিয়ে আবার চেষ্টা করুন।",
    geoUnsupported:
      "এই ব্রাউজার অবস্থান বের করা সমর্থন করে না। স্টপ খুঁজতে মানচিত্র সরান।",
    outsideRome: "আপনি রোমের এলাকার বাইরে: আমরা শহরের কেন্দ্র দেখাচ্ছি।",
    outsideCoverage: "এই এলাকা আমাদের সীমার বাইরে। মানচিত্র রোমের দিকে সরান।",
    focusStopMissing: "চাওয়া স্টপ পাওয়া যায়নি: আমরা আপনার এলাকা দেখাচ্ছি।",
    focusStopFailed: (error: string): string => `চাওয়া স্টপ লোড হয়নি (${error})।`,
    stopsFailed: (error: string): string => `স্টপ লোড হয়নি: ${error}`,
    loadingStops: "স্টপ খোঁজা হচ্ছে…",
    noStopsInRadius: (radius: string): string =>
      `${radius}-এর মধ্যে কোনো স্টপ নেই। ব্যাসার্ধ বাড়ান বা মানচিত্র সরান।`,
    onMapCap: (max: number): string => ` (মানচিত্রে প্রথম ${max}টি)`,
    noLines: "কোনো রুট নেই",
    arrivalsLink: "আসছে",
    showMoreStops: "আরও স্টপ দেখান",
  },

  line: {
    loading: "রুট লোড হচ্ছে…",
    loadFailed: (error: string): string => `রুট লোড হয়নি: ${error}`,
    mapAria: (name: string): string => `রুট ${name}-এর মানচিত্র`,
    dataAt: (clock: string): string => `${clock}-এর তথ্য`,
    updatedAt: (clock: string): string => `${clock}-এ হালনাগাদ`,
    vehiclesStale: (error: string): string => `গাড়ি হালনাগাদ হয়নি: ${error}`,
    noPathForDirection: "এই দিকের জন্য পথ পাওয়া যায়নি",
    stopsHeading: (count: number): string => `স্টপ (${count})`,
    noStopsForDirection: "এই দিকের জন্য কোনো স্টপ নেই।",
    showAllStops: "সব স্টপ দেখান",
  },

  lineService: {
    inService: (count: number): string => `রুটে ${count} গাড়ি`,
    loadingVehicles: "গাড়ি লোড হচ্ছে…",
    checkingTimetable: "সময়সূচি দেখা হচ্ছে…",
    feedDownTitle: "রিয়েল-টাইম অবস্থান পাওয়া যাচ্ছে না",
    feedDownDetail:
      "চলাচল স্বাভাবিকও হতে পারে: আমরা শুধু গাড়ির অবস্থান পড়তে পারছি না।",
    noneReporting: "কোনো গাড়ি নিজের অবস্থান পাঠাচ্ছে না",
    unknownDetail:
      "এর মানে এই নয় যে রুট বন্ধ: নির্ধারিত সময় কোনো স্টপের পাতায় পাবেন।",
    scheduledDetail: (count: number): string =>
      `চলাচল নির্ধারিত আছে: এখন থেকে দিনের শেষ পর্যন্ত ${count} যাত্রার কথা আছে।`,
    finishedTitle: "আজকের চলাচল শেষ",
    finishedDetail: (count: number, clock: string): string =>
      `আজ ${count} নির্ধারিত যাত্রা ছিল, শেষটা ${clock}-এ।`,
    noneTodayTitle: "আজ কোনো নির্ধারিত যাত্রা নেই",
    noneTodayDetail: "এই রুটে আজকের সময়সূচিতে কোনো যাত্রা নেই।",
    noneTodayFrom: (stopName: string): string =>
      `${stopName} থেকে আজকের সময়সূচিতে কোনো যাত্রা নেই।`,
    nextDepartures: "পরের ছাড়ার সময়",
    nextDeparturesFrom: (stopName: string): string => ` ${stopName} থেকে`,
    scheduledOnly: "নির্ধারিত সময়, রিয়েল-টাইম ছাড়া।",
  },

  journey: {
    title: "পথ",
    subtitle: "বাস, ট্রাম আর মেট্রোয় রোমের এক জায়গা থেকে আরেক জায়গায়।",
    from: "কোথা থেকে",
    to: "কোথায়",
    placeholder: "স্টপ, ঠিকানা বা জায়গা",
    swap: "উল্টে দিন",
    whenLegend: "কখন",
    now: "এখন",
    pickTime: "সময় বেছে নিন",
    timeLabel: "ছাড়ার তারিখ ও সময়",
    submit: "পথ খুঁজুন",
    resultsHeading: "পথ",
    emptyTitle: "কোথায় যেতে চান?",
    emptyHint:
      "শুরু আর গন্তব্য লিখুন: সরকারি সময়সূচি ধরে আমরা সবচেয়ে ভালো পথ খুঁজি।",
    searching: "পথ খোঁজা হচ্ছে…",
    noResultsTitle: "কোনো পথ নেই",
    noResultsHint:
      "আমরা শুধু সরাসরি বা এক বার বদলের যোগাযোগ খুঁজি। শুরুর জায়গা বা সময় বদলে দেখুন।",
    disclaimer:
      "নির্ধারিত সময়, রিয়েল-টাইম নয়: আসল দেরি ধরা হয়নি। হাঁটার অংশ সরলরেখায় হিসাব করা, তাই রাস্তায় আসল দূরত্ব বেশি হবে।",
    searchedFrom: (when: string): string => ` ${when} থেকে খোঁজা।`,
    mapAria: "বেছে নেওয়া পথের মানচিত্র",
    mapCaption:
      "গাড়িতে চলার অংশগুলো রুটের আসল পথ ধরে চলে। বিন্দু-রেখাগুলো সরলরেখায় হিসাব করা: বদলের সময় হাঁটার অংশ আর যে কয়েকটা রুটের পথ জানা নেই।",
    missingEndpoints: "শুরু আর গন্তব্য দুটোই লিখুন।",
    badDateTime: "তারিখ ও সময় ঠিক নেই।",
    geoUnsupported: "এই ব্রাউজার অবস্থান বের করা সমর্থন করে না।",
    geoUnavailable: "এখন অবস্থান পাওয়া যাচ্ছে না।",
    geoOutsideRome: "আপনি রোমের এলাকার বাইরে: একটা ঠিকানা লিখুন।",
    geoDenied: "অবস্থানের অনুমতি দেওয়া হয়নি: একটা ঠিকানা লিখুন।",
    geoTimeout: "অবস্থান বের করতে অনেক সময় লেগেছে।",
    originMarker: (name: string): string => `শুরু: ${name}`,
    destinationMarker: (name: string): string => `গন্তব্য: ${name}`,
    useMyPosition: "আমার অবস্থান ব্যবহার করুন",
    clearField: (label: string): string => `${label} খালি করুন`,
    suggestionsFor: (label: string): string => `${label}-এর জন্য পরামর্শ`,
    placeStop: "স্টপ",
    placeCoord: "স্থানাঙ্ক",
    placeAddress: "ঠিকানা",
    walkOnly: "শুধু হেঁটে",
    walkOnlyShort: "হেঁটে",
    noTransfers: "বদল ছাড়া",
    transfers: (count: number): string => `${count} বার বদল`,
    walkDistance: (distance: string): string => `${distance} হেঁটে`,
    walkLeg: (distance: string, duration: string): string =>
      `${distance} হেঁটে, প্রায় ${duration} লেগে `,
    inService: "চলছে",
    stopCount: (count: number): string => `${count} স্টপ`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `পথ ${index}: ছাড়ে ${departure}, পৌঁছায় ${arrival}`,
    lineDetailsAria: (line: string): string => `রুট ${line}, বিস্তারিত`,
    hours: (hours: number): string => `${hours} ঘ`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} ঘ ${minutes}`,
    noticeNoOriginStops:
      "যাত্রা শুরুর জায়গা থেকে হেঁটে যাওয়ার মতো কোনো স্টপ নেই: কোনো রুটের কাছাকাছি ঠিকানা দিন।",
    noticeNoDestinationStops:
      "গন্তব্য থেকে হেঁটে যাওয়ার মতো কোনো স্টপ নেই: কোনো রুটের কাছাকাছি ঠিকানা দিন।",
    noticeNoConnection: "আগামী কয়েক ঘণ্টায় এই দুই এলাকার মধ্যে কোনো সংযোগ পাওয়া যায়নি।",
    noticeWalkOnlyLeft:
      "আগামী কয়েক ঘণ্টায় সময়সূচিতে কোনো সংযোগ নেই: শুধু হেঁটে যাওয়ার পথটাই বাকি।",
    noticeLaterDepartures: "পরের দেড় ঘণ্টায় কোনো ট্রিপ নেই: তার পরের প্রথম ট্রিপগুলো দেখাচ্ছি।",
  },

  alerts: {
    title: "চলাচলের ঘোষণা",
    subtitle: "সরকারি তথ্যে প্রকাশিত রুট বদল, বন্ধ থাকা আর পরিবর্তন।",
    loading: "লোড হচ্ছে…",
    degraded:
      "রিয়েল-টাইম তথ্য সাড়া দিচ্ছে না বা পুরোনো: এই ঘোষণাগুলো হালনাগাদ নাও হতে পারে।",
    loadFailed: "ঘোষণা লোড করা যায়নি।",
    refreshFailed: (error: string): string =>
      `শেষ হালনাগাদ হয়নি (${error}): আপনি আগের তালিকা দেখছেন।`,
    searchPlaceholder: "খুঁজুন: ধর্মঘট, রুট বদল, রাস্তা…",
    searchAria: "ঘোষণার মধ্যে খুঁজুন",
    filterByLine: "রুট ধরে ছাঁকুন",
    allLines: (count: number): string => `সব রুট (${count})`,
    networkWide: "সাধারণ ঘোষণা",
    clearFilters: "রিসেট",
    noMatch: "কোনো ঘোষণা ছাঁকনির সঙ্গে মেলে না।",
    filteredCount: (shown: number, total: number): string =>
      `${total}-এর মধ্যে ${shown}টি ঘোষণা।`,
    activeCount: (count: number, lines: number): string =>
      `${lines}টি রুটে ${count}টি সক্রিয় ঘোষণা।`,
    goToLine: "রুটে যান",
    noneTitle: "কোনো সক্রিয় ঘোষণা নেই",
    noneHint:
      "এই মুহূর্তে চলাচলে কোনো বিঘ্ন বা পরিবর্তনের খবর নেই। বেরোনোর আগে আরেকবার দেখে নিন।",
    noResultsTitle: "কিছু পাওয়া যায়নি",
    noResultsHint:
      "কম শব্দ দিয়ে দেখুন, বা সব ঘোষণা দেখতে ছাঁকনি রিসেট করুন।",
    noSelectionTitle: "কোনো ঘোষণা বাছা হয়নি",
    noSelectionHint: "পুরোটা পড়তে বাঁ পাশের তালিকা থেকে একটা ঘোষণা বেছে নিন।",
    showMoreLines: (count: number): string => `আরও রুট দেখান (${count})`,
    goToLineShort: "রুটে যান",
    fallbackHeader: "চলাচলের ঘোষণা",
    noDetail: "পরিচালক কোনো বিস্তারিত দেননি।",
    operatorLink: "পরিচালকের সাইটে বিস্তারিত",
    affectedLines: "ক্ষতিগ্রস্ত রুট",
    alsoOn: "এগুলোতেও",
    contextHeading: (count: number): string => `${count}টি সক্রিয় ঘোষণা`,
    contextAria: "চলাচলের ঘোষণা",
    contextAll: "সব",
    contextUnavailable: (error: string): string => `ঘোষণা পাওয়া যাচ্ছে না: ${error}`,
    contextMore: (count: number): string => `আরও ${count}টি ঘোষণা `,
    contextMoreLink: "ঘোষণার পাতায়",
    contextStale: (error: string): string =>
      `শেষ হালনাগাদ হয়নি (${error}): এই ঘোষণাগুলো হালনাগাদ নাও হতে পারে।`,
    windowBetween: (from: string, until: string): string => `${from} থেকে ${until} পর্যন্ত`,
    windowFrom: (from: string): string => `${from} থেকে, শেষ কবে বলা নেই`,
    windowUntil: (until: string): string => `${until} পর্যন্ত`,
    windowUnknown: "কার্যকর থাকার সময় বলা নেই",
    effect: (code: string): string | null => EFFECT_BN[code] ?? null,
    cause: (code: string): string | null => CAUSE_BN[code] ?? null,
  },

  settings: {
    title: "সেটিংস",
    subtitle: "সব কিছু এই ডিভাইসেই থাকে। কোনো অ্যাকাউন্ট নেই, কোনো সার্ভার নেই।",
    sectionArrivals: "আসছে",
    autoRefresh: "নিজে থেকে হালনাগাদ",
    everySeconds: (seconds: number): string => `প্রতি ${seconds} সেকেন্ডে`,
    autoRefreshHint: "রিয়েল-টাইম তথ্য দুবার পড়ার মাঝের সময়।",
    maxArrivals: "প্রতি স্টপে কতগুলো আসার সময় দেখাবে",
    showScheduled: "নির্ধারিত সময় দেখান",
    showScheduledHint:
      "কোনো স্টপের জন্য রিয়েল-টাইমে কিছু না থাকলে সময়সূচি ব্যবহার করুন।",
    sectionNearby: "আমার কাছে",
    radius: "খোঁজার ব্যাসার্ধ",
    radiusHint: "কাছের স্টপের মানচিত্রের দ্রুত ব্যাসার্ধেও এটা খাটে।",
    sectionAppearance: "চেহারা",
    themeLegend: "থিম",
    themeSystem: "সিস্টেম",
    themeLight: "হালকা",
    themeDark: "গাঢ়",
    sectionLanguage: "ভাষা",
    languageLegend: "ইন্টারফেসের ভাষা",
    languageSystem: "সিস্টেম",
    languageHint: (resolved: string): string =>
      `«সিস্টেম» দিলে আমরা ব্রাউজারের ভাষা মানি: এখন সেটা ${resolved}।`,
    sectionBackup: "প্রিয়র ব্যাকআপ",
    backupIntro:
      "আপনার ডিভাইসে একটা JSON ফাইল: এখানে কোনো অ্যাকাউন্ট নেই, তাই প্রিয়গুলো অন্য ব্রাউজারে নেওয়ার এটাই উপায়।",
    exportCount: (count: number): string => `রপ্তানি (${count})`,
    importFromFile: "ফাইল থেকে আনুন",
    exported: (count: number): string => `${count}টি প্রিয় রপ্তানি হয়েছে।`,
    exportFailed: "এই ব্রাউজারে রপ্তানি হয়নি।",
    fileTooLarge: "ফাইলটা এত বড় যে এটা প্রিয়র ব্যাকআপ মনে হচ্ছে না।",
    fileUnreadable: "ফাইল পড়া যায়নি।",
    importEmpty: "ফাইলটা খালি।",
    importNotJson: "ফাইলটা ঠিক JSON নয়।",
    importNoList: "ফাইলে প্রিয়র কোনো তালিকা নেই।",
    importNoneValid: "ফাইলে কোনো বৈধ প্রিয় পাওয়া যায়নি।",
    importFound: (count: number): string => `${count}টি বৈধ প্রিয় পাওয়া গেছে`,
    importSkipped: (count: number): string => `, ${count}টি বাদ দেওয়া হয়েছে।`,
    importFoundEnd: "।",
    importMerge: "মিলিয়ে নিন",
    importReplace: "বদলে দিন",
    replaced: (count: number): string => `প্রিয় বদলে গেছে: এখন ${count}টি।`,
    mergedNone: "যোগ করার মতো নতুন প্রিয় নেই।",
    merged: (count: number): string => `${count}টি প্রিয় যোগ হয়েছে।`,
    sectionLocalData: "স্থানীয় তথ্য",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites}টি প্রিয়, ইতিহাসে ${recents}টি স্টপ।`,
    confirmClearFavorites: "সব প্রিয় মুছে দেবেন? এটা আর ফেরানো যাবে না।",
    confirmClearFavoritesYes: "হ্যাঁ, খালি করুন",
    clearFavorites: "প্রিয় খালি করুন",
    favoritesCleared: "প্রিয় খালি করা হয়েছে।",
    confirmClearRecents: "দেখা স্টপের ইতিহাস মুছে দেবেন?",
    confirmClearRecentsYes: "হ্যাঁ, মুছুন",
    clearRecents: "ইতিহাস মুছুন",
    recentsCleared: "ইতিহাস মুছে গেছে।",
    resetDefaults: "আগের সেটিংসে ফিরুন",
    settingsReset: "সেটিংস আগের মানে ফিরিয়ে দেওয়া হয়েছে।",
    infoLink: "তথ্য, তথ্যের উৎস আর সাধারণ প্রশ্ন",
  },

  sync: {
    titleFull: "ডিভাইস মেলান",
    titleCollapsed: "মেলানো",
    badgeOn: "চালু",
    summaryLoading: "…",
    summaryUnavailable: "এই সংযোগে পাওয়া যাচ্ছে না",
    summaryOff: "বন্ধ",
    summarySyncing: "মেলানো চলছে…",
    summaryError: "মেলাতে সমস্যা",
    summaryConflict: "মেটানোর মতো অমিল আছে",
    summaryOn: (last: string): string => `চালু · শেষ ${last}`,
    intro:
      "একটা কোড দিয়ে প্রিয়, সম্প্রতি দেখা আর সেটিংস অন্য ডিভাইসে নিয়ে যান। তথ্য এখানেই এনক্রিপ্ট হয়: সার্ভারে শুধু অপাঠ্য তথ্যই থাকে।",
    enable: "মেলানো চালু করুন",
    haveCode: "আমার কাছে কোড আছে",
    codeLabel: "মেলানোর কোড",
    codeHint:
      "২০ অক্ষর, অন্য ডিভাইসে যেমন দেখছেন ঠিক তেমন। বড়-ছোট হরফ, ড্যাশ আর ফাঁকা জায়গায় কিছু যায় আসে না।",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} অক্ষর`,
    join: "যুক্ত করুন",
    onIntro:
      "তথ্য এই ডিভাইস ছাড়ার আগেই এনক্রিপ্ট হয়। কোড যার কাছে থাকবে সে আপনার সব প্রিয় পড়তে পারবে: শুধু নিজের ডিভাইসেই ব্যবহার করুন।",
    code: "কোড",
    showCode: "কোড দেখান",
    hideCode: "কোড লুকান",
    copyCode: "কোড কপি করুন",
    copied: "কপি হয়েছে",
    lastSync: "শেষ মেলানো:",
    inProgress: " · চলছে…",
    syncNow: "এখনই মেলান",
    disconnect: "সংযোগ কাটুন",
    disconnectNote:
      "সংযোগ কাটলে তথ্য এই ডিভাইসেই থাকে, আর এনক্রিপ্ট করা কপি সার্ভারে থাকে যতক্ষণ না আপনি সেটা মুছে দেন।",
    deleteWarning:
      "সার্ভার থেকে এনক্রিপ্ট করা কপি মুছে দেয়। অন্য ডিভাইস আর মেলানোর মতো কিছু পাবে না। এটা ফেরানো যাবে না।",
    deleteConfirm: "সত্যিই মুছুন",
    deleteRemote: "সার্ভার থেকে তথ্য মুছুন",
    justNow: "এখন",
    minutesAgo: (minutes: number): string => `${minutes} মিন আগে`,
    atClock: (clock: string): string => `${clock}-এ`,
    errors: {
      aborted: "কাজটা বাতিল করা হয়েছে।",
      generic: "মেলানো যায়নি। একটু পরে আবার চেষ্টা করুন।",
      insecureContext:
        "মেলানোর জন্য নিরাপদ সংযোগ লাগে: সাইটটা https-এ খুলুন (বা localhost-এ)। সাধারণ http-এ ব্রাউজার এনক্রিপশন বন্ধ করে দেয়, তাই এই ডিভাইসে কিছুই এনক্রিপ্ট করা যায় না।",
      noBase64Encode: "এই ব্রাউজার মেলানোর তথ্য এনকোড করতে পারে না।",
      noBase64Decode: "এই ব্রাউজার মেলানোর তথ্য ডিকোড করতে পারে না।",
      invalidSyncData: (what: string): string => `মেলানোর তথ্য ঠিক নয় (${what})।`,
      codeRequired: "মেলানোর কোড লিখুন।",
      codeTooLong: (max: number): string => `কোডটা খুব লম্বা: ${max} অক্ষর হওয়ার কথা।`,
      codeInvalidChars: (chars: string): string => `কোডে এমন অক্ষর আছে যা চলবে না: ${chars}।`,
      codeWrongLength: (required: number, actual: number): string =>
        `কোড ${required} অক্ষরের, আপনি ${actual}টা লিখেছেন।`,
      keyDerivationFailed: "এই ব্রাউজার মেলানোর চাবি তৈরি করতে পারে না।",
      preparePayloadFailed: "মেলানোর তথ্য তৈরি করা গেল না।",
      encryptFailed: "এই ডিভাইসে তথ্য এনক্রিপ্ট করা গেল না।",
      decryptFailed: "কোডটা এই তথ্যের সঙ্গে মেলে না, নয়তো সার্ভারের তথ্য নষ্ট হয়ে গেছে।",
      invalidSyncId: "মেলানোর শনাক্তকারী ঠিক নয়।",
      responseTooLarge: "সার্ভার দরকারের চেয়ে অনেক বেশি তথ্য পাঠিয়েছে।",
      timeout: "সার্ভার সময়মতো উত্তর দেয়নি।",
      unreachable: "সার্ভারে পৌঁছানো যাচ্ছে না। সংযোগ দেখে নিন।",
      invalidResponse: "সার্ভারের উত্তর ঠিক নয়।",
      invalidResponseField: (what: string): string => `সার্ভারের উত্তর ঠিক নয় (${what})।`,
      unexpectedFormat: "সার্ভার অপ্রত্যাশিত ধরনে উত্তর দিয়েছে।",
      rateLimited: "পরপর অনেকবার মেলানো হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।",
      pullRejected: (status: number): string => `সার্ভার পড়তে দেয়নি (সমস্যা ${status})।`,
      payloadTooLarge: "মেলানোর জন্য তথ্য অনেক বেশি।",
      pushRejected: (status: number): string => `সার্ভার সংরক্ষণ করতে দেয়নি (সমস্যা ${status})।`,
      deleteRejected: (status: number): string => `সার্ভার মুছতে দেয়নি (সমস্যা ${status})।`,
      conflict:
        "এই একই তথ্যে এখন অন্য একটা ডিভাইস লিখছে। আপনার এখানকার তথ্য নিরাপদ: কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।",
    },
    status: {
      deleted: "সার্ভার থেকে তথ্য সরানো হয়েছে। এই ডিভাইস আর মিলছে না।",
      disconnected:
        "এই ডিভাইসে মেলানো বন্ধ। আপনার তথ্য এখানেই থাকবে আর এনক্রিপ্ট করা কপি সার্ভারে থাকবে যতক্ষণ না আপনি সেটা মুছে দেন।",
    },
  },

  info: {
    title: "তথ্য",
    subtitle:
      "সরকারি উন্মুক্ত তথ্য থেকে রোমের গণপরিবহনের সময়সূচি আর আসার সময়।",
    unofficialTitle: "বেসরকারি অ্যাপ",
    unofficialBody:
      "এই সাইটটি ATAC S.p.A., Roma Servizi per la Mobilità বা Roma Capitale-র সঙ্গে কোনোভাবেই যুক্ত, সম্পর্কিত, অনুমোদিত বা সমর্থিত নয়। এটা একটা স্বাধীন প্রকল্প, যা শুধু এই সংস্থাগুলোর প্রকাশ করা উন্মুক্ত তথ্য পড়ে। সরকারি তথ্য, টিকিট আর অভিযোগের জন্য তাদের নিজস্ব মাধ্যমে যোগাযোগ করুন।",
    whatTitle: "এটা কী",
    whatBody1:
      "আপনি যে স্টপে দাঁড়িয়ে আছেন সেখানে পরের গাড়ি কত পরে আসবে, তা জানার জন্য একটা ওয়েব অ্যাপ। কোনো স্টপ বা রুট খুঁজে প্রিয়তে রাখুন, আর হোমে হালনাগাদ আসার সময়সহ সেটা পেয়ে যান। কোনো অ্যাকাউন্ট নেই, বিজ্ঞাপন নেই, ব্যবহারের হিসাব রাখা নেই।",
    whatBody2:
      "রিয়েল-টাইম তথ্যে যাত্রাটা থাকলে দেখানো সময়টা গাড়ির অবস্থান থেকে করা অনুমান। না থাকলে অ্যাপ নির্ধারিত সময়ে ফিরে যায় আর সেটা সবসময় জানিয়ে দেয়, পুরোনো তথ্যকে অনুমান বলে চালায় না।",
    dataTitle: "তথ্য কোথা থেকে আসে",
    dataBodyBefore:
      "সময়সূচি, স্টপ, রুট, পথ, গাড়ির অবস্থান আর চলাচলের ঘোষণা আসে এই সংস্থার উন্মুক্ত তথ্য থেকে: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS আর GTFS-Realtime)। নির্ধারিত সময় প্রতিদিন হালনাগাদ হয়, রিয়েল-টাইম প্রায় প্রতি ৩০ সেকেন্ডে।",
    dataLink: "romamobilita.it — উন্মুক্ত তথ্য",
    dataLicence:
      "তথ্য যার যার মালিকেরই থাকে আর যে লাইসেন্সে প্রকাশিত সেই শর্তেই ব্যবহার করা হয়।",
    privacyTitle: "গোপনীয়তা",
    privacyBody:
      "এখানে লগইন নেই, ব্যবহারকারীর কোনো প্রোফাইলও নেই। প্রিয়, সম্প্রতি দেখা স্টপ আর সেটিংস শুধু আপনার ব্রাউজারেই থাকে, কোথাও পাঠানো হয় না। কাছের স্টপ খোঁজার জন্য অবস্থানের অনুমতি দিলেও সেটা ডিভাইসেই থাকে: দূরত্ব হিসাব করতে লাগে, জমা রাখা হয় না।",
    faqTitle: "সাধারণ প্রশ্ন",
    faq1Q: "কোনো রুট বা বাস কেন দেখা যায় না?",
    faq1A:
      "আমরা শুধু সরকারি তথ্যে যা আছে তাই দেখাই। কোনো গাড়ি অবস্থান না পাঠালে, বা তার যাত্রা রিয়েল-টাইম তথ্যে না থাকলে, আমাদের কাছে সেটা নেই: বড়জোর নির্ধারিত সময় দেখবেন। বদলি যাত্রা, শাটল বাস আর নষ্ট লোকেটরওয়ালা গাড়ির ক্ষেত্রে এটা প্রায়ই হয়।",
    faq2Q: "স্টপে লেখা সময়ের সঙ্গে মেলে না কেন?",
    faq2A:
      "খুঁটির বোর্ডে নির্ধারিত সময় লেখা থাকে, যা বছরে কয়েকবার বদলায়। এখানে গাড়ি তথ্য পাঠালে আপনি তার আসল অবস্থান থেকে করা অনুমান দেখেন, যাতে যানজট আর দেরি ধরা থাকে। আর যখন «নির্ধারিত» লেখা থাকে, তখন অনুমান নেই আর আমরা বোর্ডের সময়টাই দেখাই।",
    faq3Q: "রাতে কী হয়?",
    faq3A:
      "রাতে রিয়েল-টাইম তথ্য প্রায় ফাঁকা থাকে, কারণ গাড়ি কম চলে। অ্যাপ রাতের রুটের নির্ধারিত সময় নিয়ে চলতে থাকে। GTFS-এ চলাচলের দিন মধ্যরাতে শেষ হয় না, হয় ০৪:০০-এ: রাত একটার যাত্রা এখনো আগের দিনেরই, তাই ২৫:৩০-এর মতো সময় ০১:৩০ হয়ে দেখাতে পারে।",
    faq4Q: "আমার প্রিয়গুলো কি কোনো সার্ভারে যায়?",
    faq4A:
      "না। প্রিয়, ইতিহাস আর সেটিংস ব্রাউজারের localStorage-এ থাকে। সাইটের তথ্য মুছলে বা ডিভাইস বদলালে সেগুলো চলে যাবে: সেটিংস থেকে JSON ফাইলে রপ্তানি করে অন্য জায়গায় আবার আনতে পারবেন।",
    settingsLink: "সেটিংসে যান",
  },

  footer: {
    dataPrefix: "চলাচলের তথ্য আর সময়সূচি: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (GTFS উন্মুক্ত তথ্য)।",
    independent:
      "স্বাধীন প্রকল্প, ATAC বা Roma Servizi per la Mobilità-র সঙ্গে যুক্ত নয়। ",
    infoLink: "তথ্য",
  },

  errors: {
    genericTitle: "কিছু একটা কাজ করেনি",
    unexpected: "অপ্রত্যাশিত সমস্যা",
    unexpectedDot: "অপ্রত্যাশিত সমস্যা।",
    stopNotFound: "স্টপ পাওয়া যায়নি",
    serviceDown: "সেবা সাড়া দিচ্ছে না",
    requestFailed: (status: number): string => `অনুরোধ সফল হয়নি (${status})`,
    httpStatus: (status: number): string => `সমস্যা ${status}`,
    badResponse: "সার্ভারের উত্তর ঠিক নয়",
    badResponseDot: "সার্ভারের উত্তর ঠিক নয়।",
    timedOut: "অনুরোধের সময় শেষ",
    timedOutDot: "অনুরোধের সময় শেষ।",
    offline: "সংযোগ নেই",
    connectionFailed: "সংযোগ হয়নি।",
    tooManyRequests: "অনেক বেশি অনুরোধ",
    badRequest: "প্যারামিটার ঠিক নয়",
    lineNotFound: "রুট পাওয়া যায়নি",
    journeyOriginNotFound: "যাত্রা শুরুর জায়গা পাওয়া যায়নি",
    journeyDestinationNotFound: "গন্তব্য পাওয়া যায়নি",
    journeyPlaceHint: "আরও নির্দিষ্ট ঠিকানা দিয়ে দেখুন।",
  },

  notFound: {
    kicker: "সমস্যা ৪০৪",
    title: "এই স্টপে সেবা নেই",
    body:
      "এই পাতাটা নেই। পুরোনো লিঙ্কে, বা এমন স্টপ বা রুটের কোডে এটা হতে পারে যা আর তথ্যে নেই।",
    searchCta: "স্টপ খুঁজুন",
    nearbyCta: "কাছের স্টপ",
  },

  appError: {
    title: "যাত্রা থেমে গেছে",
    body:
      "এই পর্দাটা লোড হয়নি। আবার চেষ্টা করুন: সমস্যা থাকলে সম্ভবত তথ্যসেবাই সাড়া দিচ্ছে না।",
    digest: (digest: string): string => `কোড: ${digest}`,
    backHome: "হোমে ফিরুন",
    globalTitle: "সেবা বন্ধ",
    globalBody:
      "একটা অপ্রত্যাশিত সমস্যায় অ্যাপ থেমে গেছে। পাতাটা আবার লোড করুন: আপনার প্রিয়গুলো ফোনে সংরক্ষিত আছে, হারাবে না।",
    reload: "আবার লোড করুন",
  },

  format: {
    due: "চলে আসছে",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "তারিখ নেই",
    minutes: (minutes: number): string => `${minutes} মিন`,
    metres: (metres: number): string => `${metres} মি`,
    kilometres: (value: string): string => `${value} কিমি`,
    ageUnknown: "হালনাগাদের সময় জানা নেই",
    ageSeconds: (seconds: number): string => `${seconds} সেকেন্ড আগে হালনাগাদ`,
    ageMinutes: (minutes: number): string => `${minutes} মিন আগে হালনাগাদ`,
    ageAt: (clock: string): string => `${clock}-এ হালনাগাদ`,
    onTime: "সময়মতো",
    delayLate: (minutes: number): string => `+${minutes} মিন`,
    delayEarly: (minutes: number): string => `${minutes} মিন`,
  },

  meta: {
    appTitle: "BusFinder — রিয়েল-টাইম ছাড়ার সময়",
    appDescription:
      "রোমে বাস, ট্রাম আর মেট্রোর রিয়েল-টাইম সময় আর ছাড়ার সময়। প্রিয় স্টপ, কাছের স্টপ আর চলাচলের ঘোষণা, অ্যাকাউন্ট ছাড়াই, বিজ্ঞাপন ছাড়াই।",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "আপনার সবচেয়ে কাছের ATAC স্টপ, মানচিত্র আর সেখান দিয়ে যাওয়া রুটসহ।",
    journeyDescription:
      "রোমের এক জায়গা থেকে আরেক জায়গায় বাস, ট্রাম আর মেট্রোয় কীভাবে যাবেন, সরকারি ATAC সময়সূচি ধরে।",
    alertsDescription: "সরকারি ফিডে প্রকাশিত রুট বদল, চলাচল বন্ধ আর অন্যান্য পরিবর্তন।",
    settingsDescription: "আসার সময় হালনাগাদ, খোঁজার পরিধি, থিম আর যা রেখেছেন তার ব্যবস্থাপনা।",
    infoDescription:
      "এই অ্যাপটা কী, তথ্য কোথা থেকে আসে, আর কেন এটা ATAC বা Roma Servizi per la Mobilità-র সঙ্গে যুক্ত নয়।",
    stopDescription: "স্টপের রিয়েল-টাইম ছাড়ার সময় আর নির্ধারিত সময়সূচি।",
    lineDescription: "রুটের পথ, স্টপ আর রিয়েল-টাইম গাড়ি।",
  },

  skeleton: {
    loading: "লোড হচ্ছে",
  },
};

const EFFECT_BN: Record<string, string | undefined> = {
  NO_SERVICE: "চলাচল বন্ধ",
  REDUCED_SERVICE: "চলাচল কমানো",
  SIGNIFICANT_DELAYS: "উল্লেখযোগ্য দেরি",
  DETOUR: "রুট বদল",
  ADDITIONAL_SERVICE: "বাড়তি চলাচল",
  MODIFIED_SERVICE: "চলাচলে পরিবর্তন",
  STOP_MOVED: "স্টপ সরানো হয়েছে",
  NO_EFFECT: "চলাচলে কোনো প্রভাব নেই",
  ACCESSIBILITY_ISSUE: "প্রবেশযোগ্যতার সমস্যা",
  OTHER_EFFECT: "অন্যান্য",
  UNKNOWN_EFFECT: "প্রভাব বলা নেই",
};

const CAUSE_BN: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "যান্ত্রিক ত্রুটি",
  STRIKE: "ধর্মঘট",
  DEMONSTRATION: "বিক্ষোভ",
  ACCIDENT: "দুর্ঘটনা",
  HOLIDAY: "ছুটি",
  WEATHER: "খারাপ আবহাওয়া",
  MAINTENANCE: "রক্ষণাবেক্ষণ",
  CONSTRUCTION: "রাস্তার কাজ",
  POLICE_ACTIVITY: "পুলিশি ব্যবস্থা",
  MEDICAL_EMERGENCY: "চিকিৎসা জরুরি অবস্থা",
  OTHER_CAUSE: "অন্য কারণ",
  UNKNOWN_CAUSE: "কারণ বলা নেই",
};
