/**
 * Urdu dictionary. Shape and key order follow it.ts, the source of truth.
 * The nouns used here stay unmarked after a numeral ("3 اسٹاپ"), so counted
 * strings interpolate directly and need no plural helper. This language renders
 * right-to-left; see directionFor() in locale.ts.
 */

import type { Dictionary } from "./it";

export const ur: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder، ہوم",
  },

  a11y: {
    skipToContent: "مواد پر جائیں",
  },

  common: {
    retry: "دوبارہ کوشش کریں",
    cancel: "منسوخ",
    save: "محفوظ کریں",
    close: "بند کریں",
    home: "ہوم",
    back: "واپس",
    all: "سب",
    loading: "لوڈ ہو رہا ہے…",
    searching: "تلاش جاری ہے…",
    refresh: "تازہ کریں",
    dash: "—",
    minutesShort: "منٹ",
    clearSearch: "تلاش صاف کریں",
    searchInProgress: "تلاش جاری ہے",
  },

  nav: {
    primary: "بنیادی نیویگیشن",
    sidebar: "سائیڈ بار",
    sidebarNav: "سائیڈ نیویگیشن",
    openMenu: "مینو کھولیں",
    closeMenu: "مینو بند کریں",
    sections: "حصے",
    shortcuts: "شارٹ کٹ",
    infoAria: "ایپ کے بارے میں معلومات",
    home: "ہوم",
    nearbyShort: "قریب",
    nearby: "قریبی اسٹاپ",
    journey: "راستہ",
    alerts: "اطلاعات",
    settings: "ترتیبات",
    info: "معلومات",
    hintNearby: "یہاں آس پاس کیا چلتا ہے",
    hintJourney: "ایک جگہ سے دوسری جگہ",
    hintAlerts: "راستے کی تبدیلی اور تعطل",
    hintSettings: "تازہ کاری، تھیم، ڈیٹا",
    hintInfo: "ذرائع اور قانونی معلومات",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ٹرام";
        case 1:
          return "میٹرو";
        case 2:
          return "ٹرین";
        case 4:
          return "فیری";
        default:
          return "بس";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ٹرام";
        case 1:
          return "میٹرو";
        case 2:
          return "ٹرین";
        case 3:
          return "بس";
        default:
          return "روٹ";
      }
    },
    named: (name: string): string => `روٹ ${name}`,
    namedAria: (name: string): string => `روٹ ${name}`,
    details: "تفصیل",
    towards: (headsign: string): string => `${headsign} کی طرف`,
    towardsCapital: (headsign: string): string => `${headsign} کی طرف`,
    direction: "سمت",
    terminus: "آخری اسٹاپ",
    noHeadsign: "منزل درج نہیں",
  },

  stops: {
    code: (code: string): string => `اسٹاپ ${code}`,
    codeOnly: "اسٹاپ",
    pole: (code: string): string => `کھمبا ${code}`,
    accessible: "قابلِ رسائی اسٹاپ",
    named: (name: string): string => `${name} اسٹاپ`,
    countLabel: (count: number): string => `${count} اسٹاپ`,
    involved: (count: number): string => `${count} اسٹاپ متاثر`,
  },

  home: {
    kicker: "روم · پبلک ٹرانسپورٹ",
    title: "اگلی گاڑی کب آئے گی؟",
    intro:
      "اسٹاپ کو نمبر یا نام سے تلاش کریں، یا کوئی روٹ۔ آنے کے اوقات روم کے براہِ راست ڈیٹا سے آتے ہیں۔",
  },

  search: {
    inputAria: "اسٹاپ یا روٹ تلاش کریں",
    placeholder: "اسٹاپ، سڑک یا روٹ",
    searchingFor: (query: string): string => `«${query}» تلاش کیا جا رہا ہے…`,
    noResultsFor: (query: string): string => `«${query}» کا کوئی نتیجہ نہیں`,
    noResultsHint:
      "اسٹاپ نمبر (مثلاً 70101)، سڑک کا نام یا روٹ نمبر آزمائیں۔",
    resultsList: "تلاش کے نتائج",
    keyboardHint: "↑ ↓ سے چلیں، Enter سے کھولیں، Esc سے بند کریں",
  },

  favorites: {
    heading: "پسندیدہ",
    emptyTitle: "ابھی کوئی پسندیدہ نہیں",
    emptyHint:
      "کسی اسٹاپ یا روٹ کے ساتھ بنے ★ ستارے کو چھوئیں: تلاش میں، قریبی اسٹاپ میں، اسٹاپ کے صفحے پر یا روٹ کے صفحے پر۔ پھر وہ آپ کو یہیں مل جائے گا، ہر بار ڈھونڈنا نہیں پڑے گا۔",
    reorder: "ترتیب بدلیں",
    reorderDone: "ہو گیا",
    reorderHint: "تیروں سے اسٹاپ کو حرکت دیں۔ یہ ترتیب اسی ڈیوائس پر لاگو ہوتی ہے۔",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: ${total} میں سے ${position} نمبر پر۔`,
    moveUp: (name: string): string => `${name} کو اوپر لے جائیں`,
    moveDown: (name: string): string => `${name} کو نیچے لے جائیں`,
    addStar: (name: string): string => `${name} اسٹاپ پر ستارہ لگائیں`,
    removeStar: (name: string): string => `${name} اسٹاپ سے ستارہ ہٹائیں`,
    addStarLine: (name: string): string => `روٹ ${name} پر ستارہ لگائیں`,
    removeStarLine: (name: string): string => `روٹ ${name} سے ستارہ ہٹائیں`,
    starredTitle: "ستارہ لگا ہے: پسندیدہ میں ہے",
    starTitle: "ستارہ لگائیں",
    starredLabel: "ستارہ لگا",
    starLabel: "ستارہ",
    editLabels: (name: string): string => `${name} کا لیبل اور روٹ بدلیں`,
    onlyLines: (labels: string): string => `صرف ${labels}`,
    notUpdated: "تازہ نہیں ہوا",
    noArrivalsOnPinned: "منتخب روٹوں پر کوئی گاڑی نہیں۔",
    changeLines: "روٹ بدلیں",
    noArrivalsSoon: "اگلے چند منٹوں میں کوئی گاڑی نہیں۔",
    openForTimes: "اوقات دیکھنے کے لیے کھولیں",
    vehiclesUnavailable: "گاڑیوں کی معلومات دستیاب نہیں",
    lookingForVehicles: "چلنے والی گاڑیاں تلاش کی جا رہی ہیں…",
    noVehiclesNow: "اس وقت کوئی گاڑی نہیں چل رہی",
    vehiclesInService: (count: number): string => `اس وقت ${count} گاڑی چل رہی ہے`,
    refreshArrivals: "آمد کے اوقات تازہ کریں",
    undoRemovedStop: "اسٹاپ سے ستارہ ہٹ گیا: اب پسندیدہ میں نہیں۔",
    undoRemovedLine: "روٹ سے ستارہ ہٹ گیا: اب پسندیدہ میں نہیں۔",
    undoDismiss: "اطلاع بند کریں",
    more: (count: number): string => `${count} اور پسندیدہ`,
    sidebarEmptyBefore: "کسی اسٹاپ یا روٹ کے ساتھ بنے ستارے کو چھوئیں، تلاش میں، ",
    sidebarEmptyAfter: " میں، یا جس صفحے کو آپ دیکھ رہے ہیں اس پر۔ پھر وہ یہیں مل جائے گا۔",
    nextDeparture: "اگلی گاڑی",
    noDeparture: "کوئی گاڑی دستیاب نہیں",
    notAvailableShort: "—",
  },

  recents: {
    heading: "حال ہی میں دیکھے گئے",
    clear: "خالی کریں",
    emptyTitle: "حال ہی میں کوئی اسٹاپ نہیں دیکھا",
    emptyHint:
      "آپ جو اسٹاپ کھولتے ہیں وہ چند دن یہاں رہتے ہیں، تاکہ دوبارہ ڈھونڈنا نہ پڑے۔",
    listAria: "حال ہی میں دیکھے گئے اسٹاپ",
    justNow: "ابھی ابھی",
    today: "آج",
    yesterday: "کل",
  },

  arrivals: {
    due: "پہنچنے والی ہے",
    live: "براہِ راست",
    scheduled: "شیڈول کے مطابق",
    scheduledTail: " شیڈول شدہ",
    scheduledSr: "شیڈول کا وقت",
    onTime: "وقت پر",
    lateBy: (minutes: number): string => `+${minutes} منٹ`,
    earlyBy: (minutes: number): string => `−${minutes} منٹ`,
    lateSuffix: "تاخیر",
    earlySuffix: "پہلے",
    lateSr: (minutes: number): string => `${minutes} منٹ کی تاخیر`,
    earlySr: (minutes: number): string => `${minutes} منٹ پہلے`,
    skipped: "منسوخ",
    skippedSr: "یہ پھیرا منسوخ ہے",
    atClock: (clock: string): string => `${clock} بجے`,
    towardsSr: (headsign: string): string => `${headsign} سمت`,
    loadingAria: "آمد کی معلومات لوڈ ہو رہی ہیں",
    emptyTitle: "کوئی گاڑی متوقع نہیں",
    emptyHint:
      "کوئی پھیرا قریب نہیں آ رہا۔ شیڈول کا وقت دیکھیں یا تھوڑی دیر بعد دوبارہ کوشش کریں۔",
    frozenUnknown: "اندازہ تازہ نہیں ہوا",
    frozenFor: (minutes: number): string => `${minutes} منٹ سے رکی ہوئی`,
    frozenPrefix: (state: string): string => `اندازہ ${state}`,
    frozenSr: (state: string): string => `اندازہ ${state}، براہِ راست تازہ نہیں ہو رہا`,
    expectedSr: (relative: string, clock: string): string =>
      `${relative} متوقع، ${clock} بجے`,
    bannerNoRealtimeStrong: "براہِ راست معلومات دستیاب نہیں۔",
    bannerNoRealtime:
      " ہم شیڈول کے اوقات دکھا رہے ہیں: گاڑیاں پہلے یا بعد میں گزر سکتی ہیں۔",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "براہِ راست معلومات رک گئی ہیں۔" : `براہِ راست معلومات ${minutes} منٹ سے رکی ہوئی ہیں۔`,
    bannerFrozenBefore: " نیچے دیے اندازے",
    bannerFrozenLastUpdate: " آخری تازہ کاری",
    bannerFrozenAt: (clock: string): string => ` (${clock})`,
    bannerFrozenAfter: " کے ہیں اور تازہ نہیں ہو رہے: احتیاط سے لیں۔",
    bannerPartialStrong: "براہِ راست معلومات ادھوری۔",
    bannerPartial: " ڈیٹا کا کچھ حصہ نہیں پہنچا: کچھ پھیرے چھوٹ سکتے ہیں۔",
    showOnMap: (line: string): string => `روٹ ${line} کی گاڑی نقشے پر دکھائیں`,
    hideOnMap: (line: string): string => `روٹ ${line} کی گاڑی سے نمایاں نشان ہٹائیں`,
  },

  dataAge: {
    prefix: "تازہ",
    now: "ابھی",
    secondsAgo: (seconds: number): string => `${seconds} سیکنڈ پہلے`,
    minutesAgo: (minutes: number): string => `${minutes} منٹ پہلے`,
    atClock: (clock: string): string => `${clock} بجے`,
    never: "کبھی نہیں",
  },

  refreshFeedback: {
    updated: "تازہ ہو گیا",
    unchanged: "دیکھ لیا، کچھ نیا نہیں",
    failed: "تازہ نہیں ہو سکا",
    updatedShort: "تازہ ہوا",
    unchangedShort: "کچھ نیا نہیں",
    failedShort: "تازہ نہیں ہوا",
    busy: "تازہ ہو رہا ہے…",
    busySpoken: "تازہ کاری جاری ہے",
  },

  stop: {
    tabArrivals: "آمد",
    tabTimetable: "شیڈول",
    tabsAria: "اسٹاپ کا منظر",
    editTag: "لیبل بدلیں",
    addTag: "لیبل",
    map: "نقشہ",
    realtimePrefix: "براہِ راست",
    noRealtime: "کوئی براہِ راست ڈیٹا نہیں",
    pageNotUpdated: "صفحہ ابھی تازہ نہیں ہوا",
    pageUpdatedAt: (clock: string): string => `صفحہ ${clock} بجے تازہ ہوا`,
    lastDataSuffix: (error: string): string => `${error}۔ آپ آخری موصولہ ڈیٹا دیکھ رہے ہیں۔`,
    arrivalsUnavailable: "آمد کی معلومات دستیاب نہیں",
    emptyHint:
      "ابھی کوئی پھیرا قریب نہیں آ رہا۔ اگلی گاڑی کب متوقع ہے، جاننے کے لیے شیڈول کھولیں۔",
    seeTimetable: "شیڈول دیکھیں",
    linesHere: "یہاں رکنے والے روٹ",
  },

  tagDialog: {
    titleFavorite: "پسندیدہ",
    titleTag: "اسٹاپ کا لیبل",
    label: "آپ اسے کیا کہتے ہیں",
    placeholder: "گھر، دفتر، جم…",
    hint: (maxChars: number): string =>
      `صرف آپ کے لیے: اسی ڈیوائس پر رہے گا، زیادہ سے زیادہ ${maxChars} حروف۔`,
    linesLegend: "دکھانے کے لیے روٹ",
    linesNone: "کچھ منتخب نہیں: کارڈ سارے روٹ دکھائے گا۔",
    linesSome: (count: number): string => `کارڈ پر صرف ${count} روٹ۔`,
    showAllLines: "سارے روٹ دکھائیں",
    removeTag: "لیبل ہٹائیں",
  },

  timetable: {
    previousDay: "پچھلا دن",
    nextDay: "اگلا دن",
    today: "آج",
    scheduled: "شیڈول کا وقت",
    jumpToNow: "ابھی پر جائیں",
    backToToday: "آج پر واپس",
    fromServiceStart: "سروس کے آغاز سے",
    unavailableTitle: "شیڈول دستیاب نہیں",
    partialError: (error: string): string => `${error}۔ آپ پہلے سے لوڈ ہوئے پھیرے دیکھ رہے ہیں۔`,
    emptyTitle: "اس کے بعد کوئی پھیرا نہیں",
    emptyFromNow:
      "اس وقت کے بعد کوئی گاڑی نہیں ہے۔ سروس کے آغاز سے دیکھیں، کوئی اور دن چنیں، یا روٹ کا فلٹر ہٹائیں۔",
    emptyWholeDay:
      "اس دن کوئی گاڑی شیڈول نہیں: پچھلا یا اگلا دن آزمائیں، یا روٹ کا فلٹر ہٹائیں۔",
    loadMore: "مزید پھیرے دکھائیں",
    loadingMore: "لوڈ ہو رہا ہے…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${from} سے ${to} تک ${count} پھیرے` +
      (complete ? "، سروس کے اختتام تک" : "") +
      "۔ یہ سروس کے دن کے سرکاری اوقات ہیں، براہِ راست ڈیٹا کے بغیر۔",
  },

  map: {
    fallbackAria: "نقشہ",
    vehiclesHeading: "نقشے پر گاڑیاں",
    show: "دکھائیں",
    hide: "چھپائیں",
    modeGroup: "کون سی گاڑیاں دکھانی ہیں",
    modeApproaching: "یہاں آ رہی ہیں",
    modeAllLines: "سارے روٹ",
    loadingStop: "اسٹاپ کی جگہ لوڈ ہو رہی ہے…",
    stopMapAria: (stopName: string): string => `${stopName} اسٹاپ پر گاڑیوں کا نقشہ`,
    centreOnStop: "اسٹاپ کو درمیان میں رکھیں",
    nearbyVehicles: "یہاں قریب کی گاڑیاں",
    allVehicles: "سب، دور والی بھی",
    loadingVehicles: "گاڑیاں لوڈ ہو رہی ہیں…",
    noneApproaching: "کوئی گاڑی قریب نہیں آ رہی",
    approachingCount: (count: number): string => `${count} گاڑی آ رہی ہے`,
    onTheseLines: (count: number): string => `اس اسٹاپ کے روٹوں پر ${count} گاڑی`,
    positionsAt: (clock: string): string => `${clock} بجے کی جگہیں`,
    positionsStale: "جگہیں تازہ نہیں ہوئیں",
    allLinesNote:
      "گہرے رنگ والی گاڑیاں اسی اسٹاپ کی طرف آ رہی ہیں، ہلکی والی انہی روٹوں پر چل رہی ہیں مگر ابھی یہاں سے نہیں گزرتیں۔",
    approachingList: "آ رہی گاڑیاں",
    hereIn: (relative: string): string => `یہاں ${relative}`,
    hereInAt: (relative: string, clock: string): string => `یہاں ${relative}، ${clock} بجے`,
    notInbound: "اس روٹ پر چل رہی ہے، مگر اس اسٹاپ کی طرف نہیں",
    noBearing: " · سمت نہیں بھیجی گئی",
    follow: "میں اسی گاڑی میں ہوں، اسے فالو کریں",
    unfollow: "فالو کرنا بند کریں",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `روٹ ${line}، یہاں ${relative}${followed ? "، آپ اسے فالو کر رہے ہیں" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `روٹ ${line}، چل رہی ہے، اس اسٹاپ کی طرف نہیں${followed ? "، آپ اسے فالو کر رہے ہیں" : ""}`,
    yourPosition: "آپ کی جگہ",
    vehicleTitle: (vehicleId: string): string => `گاڑی ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName} کو نقشے پر دکھائیں`,
    divertedSuffix: " · روٹ سے باہر",
    divertedBadge: "روٹ سے باہر",
    divertedNote: "یہ طے شدہ راستے سے ہٹ کر چل رہی ہے۔",
  },

  follow: {
    headlineLive: "میں اس گاڑی کو فالو کر رہا ہوں",
    headlinePaused: "فالو کرنا روکا ہوا ہے",
    headlineStale: "جگہ حرکت نہیں کر رہی",
    headlineLost: "گاڑی اب روٹ پر نہیں",
    detailLive: "ہر تازہ کاری پر نقشہ اسی پر مرکوز رہتا ہے۔",
    detailPaused:
      "آپ نے نقشہ ہلایا ہے، اس لیے اب میں اسے نہیں ہلاتا۔ گاڑی پر واپس جانے کے لیے «جاری رکھیں» دبائیں۔",
    detailStaleUnknown: "یہ گاڑی کچھ دیر سے اپنی جگہ نہیں بھیج رہی۔",
    detailStale: (age: string): string =>
      `گاڑی ${age} سے کچھ نہیں بھیج رہی: نقشے پر جو ہے وہ آخری معلوم جگہ ہے۔`,
    detailLost:
      "اب اس کی جگہ نہیں مل رہی۔ شاید پھیرا مکمل ہو گیا یا وہ سروس سے نکل گئی۔",
    ageMinutes: (minutes: number): string => `${minutes} منٹ`,
    ageHours: (hours: number): string => `${hours} گھنٹے`,
    compact: "فالو کر رہے ہیں",
    compactSr: (line: string): string => ` روٹ ${line}`,
    lineSr: (line: string): string => `، روٹ ${line}`,
    resume: "جاری رکھیں",
    exit: "باہر نکلیں",
    close: "بند کریں",
    lostHint: "اگر وہ اب بھی چل رہی ہے تو «سارے روٹ» پر جا کر مل جائے گی۔",
  },

  nearby: {
    title: "قریبی اسٹاپ",
    mapAria: "قریبی اسٹاپ کا نقشہ",
    searchHere: "اس علاقے میں تلاش کریں",
    radius: "دائرہ",
    locating: "جگہ معلوم کی جا رہی ہے…",
    myPosition: "میری جگہ",
    geoDenied:
      "جگہ کی اجازت نہیں ملی۔ ہم روم کا مرکز دکھا رہے ہیں: نقشہ ہلا کر اس علاقے میں تلاش کریں۔",
    geoUnavailable:
      "اس وقت جگہ دستیاب نہیں۔ ہم روم کا مرکز دکھا رہے ہیں: نقشہ ہلا کر اس علاقے میں تلاش کریں۔",
    geoTimeout:
      "جگہ معلوم کرنے میں بہت وقت لگا۔ ہم روم کا مرکز دکھا رہے ہیں: نقشہ ہلا کر دوبارہ کوشش کریں۔",
    geoUnsupported:
      "یہ براؤزر جگہ معلوم کرنے کی سہولت نہیں رکھتا۔ اسٹاپ ڈھونڈنے کے لیے نقشہ ہلائیں۔",
    outsideRome: "آپ روم کے علاقے سے باہر ہیں: ہم شہر کا مرکز دکھا رہے ہیں۔",
    outsideCoverage: "یہ علاقہ ہماری حد سے باہر ہے۔ نقشہ روم کی طرف ہلائیں۔",
    focusStopMissing: "مطلوبہ اسٹاپ نہیں ملا: ہم آپ کا علاقہ دکھا رہے ہیں۔",
    focusStopFailed: (error: string): string => `مطلوبہ اسٹاپ لوڈ نہیں ہوا (${error})۔`,
    stopsFailed: (error: string): string => `اسٹاپ لوڈ نہیں ہوئے: ${error}`,
    loadingStops: "اسٹاپ تلاش کیے جا رہے ہیں…",
    noStopsInRadius: (radius: string): string =>
      `${radius} کے اندر کوئی اسٹاپ نہیں۔ دائرہ بڑھائیں یا نقشہ ہلائیں۔`,
    onMapCap: (max: number): string => ` (نقشے پر پہلے ${max})`,
    noLines: "کوئی روٹ نہیں",
    arrivalsLink: "آمد",
    showMoreStops: "مزید اسٹاپ دکھائیں",
  },

  line: {
    loading: "روٹ لوڈ ہو رہا ہے…",
    loadFailed: (error: string): string => `روٹ لوڈ نہیں ہوا: ${error}`,
    mapAria: (name: string): string => `روٹ ${name} کا نقشہ`,
    dataAt: (clock: string): string => `${clock} بجے کا ڈیٹا`,
    updatedAt: (clock: string): string => `${clock} بجے تازہ ہوا`,
    vehiclesStale: (error: string): string => `گاڑیاں تازہ نہیں ہوئیں: ${error}`,
    noPathForDirection: "اس سمت کے لیے راستہ دستیاب نہیں",
    stopsHeading: (count: number): string => `اسٹاپ (${count})`,
    noStopsForDirection: "اس سمت کے لیے کوئی اسٹاپ دستیاب نہیں۔",
    showAllStops: "سارے اسٹاپ دکھائیں",
  },

  lineService: {
    inService: (count: number): string => `روٹ پر ${count} گاڑی`,
    loadingVehicles: "گاڑیاں لوڈ ہو رہی ہیں…",
    checkingTimetable: "شیڈول دیکھا جا رہا ہے…",
    feedDownTitle: "براہِ راست جگہیں دستیاب نہیں",
    feedDownDetail:
      "سروس معمول کے مطابق بھی ہو سکتی ہے: ہم بس گاڑیوں کی جگہ نہیں پڑھ پا رہے۔",
    noneReporting: "کوئی گاڑی اپنی جگہ نہیں بھیج رہی",
    unknownDetail:
      "اس کا مطلب یہ نہیں کہ روٹ بند ہے: شیڈول کے اوقات کسی اسٹاپ کے صفحے پر ملیں گے۔",
    scheduledDetail: (count: number): string =>
      `سروس شیڈول ہے: ابھی سے دن کے آخر تک ${count} پھیرے متوقع ہیں۔`,
    finishedTitle: "آج کی سروس ختم",
    finishedDetail: (count: number, clock: string): string =>
      `آج ${count} شیڈول پھیرے تھے، آخری ${clock} بجے۔`,
    noneTodayTitle: "آج کوئی شیڈول پھیرا نہیں",
    noneTodayDetail: "اس روٹ پر آج شیڈول میں کوئی پھیرا نہیں ہے۔",
    noneTodayFrom: (stopName: string): string =>
      `${stopName} سے آج شیڈول میں کوئی پھیرا نہیں ہے۔`,
    nextDepartures: "اگلی روانگیاں",
    nextDeparturesFrom: (stopName: string): string => ` ${stopName} سے`,
    scheduledOnly: "شیڈول کے اوقات، براہِ راست ڈیٹا کے بغیر۔",
  },

  journey: {
    title: "راستہ",
    subtitle: "روم میں ایک جگہ سے دوسری جگہ، بس، ٹرام اور میٹرو سے۔",
    from: "کہاں سے",
    to: "کہاں تک",
    placeholder: "اسٹاپ، پتہ یا جگہ",
    swap: "الٹ دیں",
    whenLegend: "کب",
    now: "ابھی",
    pickTime: "وقت چنیں",
    timeLabel: "روانگی کی تاریخ اور وقت",
    submit: "راستہ تلاش کریں",
    resultsHeading: "راستے",
    emptyTitle: "آپ کہاں جانا چاہتے ہیں؟",
    emptyHint:
      "آغاز اور منزل لکھیں: ہم سرکاری شیڈول کی بنیاد پر بہترین راستہ تلاش کرتے ہیں۔",
    searching: "راستے تلاش کیے جا رہے ہیں…",
    noResultsTitle: "کوئی راستہ نہیں",
    noResultsHint:
      "ہم صرف براہِ راست یا ایک تبدیلی والے راستے تلاش کرتے ہیں۔ آغاز کی جگہ یا وقت بدل کر دیکھیں۔",
    disclaimer:
      "شیڈول کے اوقات، براہِ راست نہیں: اصل تاخیر شامل نہیں۔ پیدل حصوں کا اندازہ سیدھی لکیر میں ہے، اس لیے سڑک پر اصل فاصلہ زیادہ ہوگا۔",
    searchedFrom: (when: string): string => ` ${when} سے تلاش۔`,
    mapAria: "منتخب راستے کا نقشہ",
    mapCaption:
      "گاڑی والے حصے روٹ کے اصل راستے پر چلتے ہیں۔ نقطہ دار حصوں کا اندازہ سیدھی لکیر میں ہے: تبدیلی کے پیدل حصے اور وہ چند روٹ جن کا راستہ دستیاب نہیں۔",
    missingEndpoints: "آغاز اور منزل دونوں بتائیں۔",
    badDateTime: "تاریخ اور وقت درست نہیں۔",
    geoUnsupported: "یہ براؤزر جگہ معلوم کرنے کی سہولت نہیں رکھتا۔",
    geoUnavailable: "اس وقت جگہ دستیاب نہیں۔",
    geoOutsideRome: "آپ روم کے علاقے سے باہر ہیں: کوئی پتہ لکھیں۔",
    geoDenied: "جگہ کی اجازت نہیں ملی: کوئی پتہ لکھیں۔",
    geoTimeout: "جگہ معلوم کرنے میں بہت وقت لگا۔",
    originMarker: (name: string): string => `آغاز: ${name}`,
    destinationMarker: (name: string): string => `منزل: ${name}`,
    useMyPosition: "میری جگہ استعمال کریں",
    clearField: (label: string): string => `${label} خالی کریں`,
    suggestionsFor: (label: string): string => `${label} کے لیے تجاویز`,
    placeStop: "اسٹاپ",
    placeCoord: "کوآرڈینیٹ",
    placeAddress: "پتہ",
    walkOnly: "صرف پیدل",
    walkOnlyShort: "پیدل",
    noTransfers: "بغیر تبدیلی",
    transfers: (count: number): string => `${count} تبدیلی`,
    walkDistance: (distance: string): string => `${distance} پیدل`,
    walkLeg: (distance: string, duration: string): string =>
      `${distance} پیدل، تقریباً ${duration} تک `,
    inService: "چل رہی ہے",
    stopCount: (count: number): string => `${count} اسٹاپ`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `راستہ ${index}: روانگی ${departure}، آمد ${arrival}`,
    lineDetailsAria: (line: string): string => `روٹ ${line}، تفصیل`,
    hours: (hours: number): string => `${hours} گھنٹے`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} گھنٹے ${minutes}`,
    noticeNoOriginStops:
      "روانگی کی جگہ سے پیدل فاصلے پر کوئی اسٹاپ نہیں: کسی روٹ کے قریب کا پتہ آزمائیں۔",
    noticeNoDestinationStops:
      "منزل سے پیدل فاصلے پر کوئی اسٹاپ نہیں: کسی روٹ کے قریب کا پتہ آزمائیں۔",
    noticeNoConnection: "اگلے چند گھنٹوں میں ان دونوں علاقوں کے درمیان کوئی رابطہ نہیں ملا۔",
    noticeWalkOnlyLeft: "اگلے چند گھنٹوں میں شیڈول میں کوئی رابطہ نہیں: صرف پیدل راستہ باقی ہے۔",
    noticeLaterDepartures:
      "اگلے ڈیڑھ گھنٹے میں کوئی سروس نہیں: اس کے بعد کی پہلی سروسز دکھا رہے ہیں۔",
  },

  alerts: {
    title: "سروس کی اطلاعات",
    subtitle: "سرکاری ڈیٹا میں شائع ہونے والی راستہ تبدیلیاں، معطلی اور ترامیم۔",
    loading: "لوڈ ہو رہا ہے…",
    degraded:
      "براہِ راست ڈیٹا جواب نہیں دے رہا یا پرانا ہے: یہ اطلاعات شاید تازہ نہ ہوں۔",
    loadFailed: "اطلاعات لوڈ نہیں ہو سکیں۔",
    refreshFailed: (error: string): string =>
      `آخری تازہ کاری نہیں ہو سکی (${error}): آپ پچھلی فہرست دیکھ رہے ہیں۔`,
    searchPlaceholder: "تلاش: ہڑتال، راستہ تبدیلی، سڑک…",
    searchAria: "اطلاعات میں تلاش کریں",
    filterByLine: "روٹ کے حساب سے چھانٹیں",
    allLines: (count: number): string => `سارے روٹ (${count})`,
    networkWide: "عمومی اطلاعات",
    clearFilters: "ری سیٹ",
    noMatch: "کوئی اطلاع فلٹر سے میل نہیں کھاتی۔",
    filteredCount: (shown: number, total: number): string =>
      `${total} میں سے ${shown} اطلاعات۔`,
    activeCount: (count: number, lines: number): string =>
      `${lines} روٹوں پر ${count} فعال اطلاعات۔`,
    goToLine: "روٹ پر جائیں",
    noneTitle: "کوئی فعال اطلاع نہیں",
    noneHint:
      "اس وقت سروس میں کسی تعطل یا تبدیلی کی اطلاع نہیں۔ نکلنے سے پہلے ایک بار پھر دیکھ لیں۔",
    noResultsTitle: "کوئی نتیجہ نہیں",
    noResultsHint:
      "کم الفاظ سے کوشش کریں، یا ساری اطلاعات دیکھنے کے لیے فلٹر ری سیٹ کریں۔",
    noSelectionTitle: "کوئی اطلاع منتخب نہیں",
    noSelectionHint: "پوری پڑھنے کے لیے بائیں فہرست سے کوئی اطلاع چنیں۔",
    showMoreLines: (count: number): string => `مزید روٹ دکھائیں (${count})`,
    goToLineShort: "روٹ پر جائیں",
    fallbackHeader: "سروس کی اطلاع",
    noDetail: "آپریٹر نے کوئی تفصیل شائع نہیں کی۔",
    operatorLink: "آپریٹر کی ویب سائٹ پر تفصیل",
    affectedLines: "متاثرہ روٹ",
    alsoOn: "ان پر بھی",
    contextHeading: (count: number): string => `${count} فعال اطلاعات`,
    contextAria: "سروس کی اطلاعات",
    contextAll: "سب",
    contextUnavailable: (error: string): string => `اطلاعات دستیاب نہیں: ${error}`,
    contextMore: (count: number): string => `${count} اور اطلاعات `,
    contextMoreLink: "اطلاعات کے صفحے پر",
    contextStale: (error: string): string =>
      `آخری تازہ کاری نہیں ہو سکی (${error}): یہ اطلاعات شاید تازہ نہ ہوں۔`,
    windowBetween: (from: string, until: string): string => `${from} سے ${until} تک`,
    windowFrom: (from: string): string => `${from} سے، اختتام درج نہیں`,
    windowUntil: (until: string): string => `${until} تک`,
    windowUnknown: "مدتِ نفاذ درج نہیں",
    effect: (code: string): string | null => EFFECT_UR[code] ?? null,
    cause: (code: string): string | null => CAUSE_UR[code] ?? null,
  },

  settings: {
    title: "ترتیبات",
    subtitle: "سب کچھ اسی ڈیوائس پر رہتا ہے۔ نہ کوئی اکاؤنٹ، نہ کوئی سرور۔",
    sectionArrivals: "آمد",
    autoRefresh: "خودکار تازہ کاری",
    everySeconds: (seconds: number): string => `ہر ${seconds} سیکنڈ`,
    autoRefreshHint: "براہِ راست ڈیٹا دو بار پڑھنے کے درمیان کا وقفہ۔",
    maxArrivals: "فی اسٹاپ کتنی آمد دکھائی جائیں",
    showScheduled: "شیڈول کے اوقات دکھائیں",
    showScheduledHint:
      "جب کسی اسٹاپ کے لیے براہِ راست کچھ نہ ہو، تو شیڈول استعمال کریں۔",
    sectionNearby: "میرے قریب",
    radius: "تلاش کا دائرہ",
    radiusHint: "یہ قریبی اسٹاپ والے نقشے کے فوری دائروں پر بھی لاگو ہوتا ہے۔",
    sectionAppearance: "ظاہری شکل",
    themeLegend: "تھیم",
    themeSystem: "سسٹم",
    themeLight: "ہلکا",
    themeDark: "گہرا",
    sectionLanguage: "زبان",
    languageLegend: "انٹرفیس کی زبان",
    languageSystem: "سسٹم",
    languageHint: (resolved: string): string =>
      `«سسٹم» پر ہم براؤزر کی زبان مانتے ہیں: ابھی وہ ${resolved} ہے۔`,
    sectionBackup: "پسندیدہ کا بیک اپ",
    backupIntro:
      "آپ کی ڈیوائس پر ایک JSON فائل: یہاں کوئی اکاؤنٹ نہیں، اس لیے پسندیدہ کو دوسرے براؤزر میں لے جانے کا یہی طریقہ ہے۔",
    exportCount: (count: number): string => `برآمد کریں (${count})`,
    importFromFile: "فائل سے درآمد کریں",
    exported: (count: number): string => `${count} پسندیدہ برآمد ہوئے۔`,
    exportFailed: "اس براؤزر پر برآمد نہیں ہو سکی۔",
    fileTooLarge: "فائل اتنی بڑی ہے کہ یہ پسندیدہ کا بیک اپ نہیں لگتی۔",
    fileUnreadable: "فائل پڑھی نہیں جا سکی۔",
    importEmpty: "فائل خالی ہے۔",
    importNotJson: "فائل درست JSON نہیں ہے۔",
    importNoList: "فائل میں پسندیدہ کی فہرست نہیں ہے۔",
    importNoneValid: "فائل میں کوئی درست پسندیدہ نہیں ملا۔",
    importFound: (count: number): string => `${count} درست پسندیدہ ملے`,
    importSkipped: (count: number): string => `، ${count} اندراج چھوڑ دیے گئے۔`,
    importFoundEnd: "۔",
    importMerge: "ملا دیں",
    importReplace: "بدل دیں",
    replaced: (count: number): string => `پسندیدہ بدل دیے گئے: اب ${count} ہیں۔`,
    mergedNone: "شامل کرنے کے لیے کوئی نیا پسندیدہ نہیں۔",
    merged: (count: number): string => `${count} پسندیدہ شامل ہوئے۔`,
    sectionLocalData: "مقامی ڈیٹا",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} پسندیدہ، تاریخ میں ${recents} اسٹاپ۔`,
    confirmClearFavorites: "سارے پسندیدہ مٹا دیں؟ یہ واپس نہیں ہو سکتا۔",
    confirmClearFavoritesYes: "ہاں، خالی کریں",
    clearFavorites: "پسندیدہ خالی کریں",
    favoritesCleared: "پسندیدہ خالی کر دیے گئے۔",
    confirmClearRecents: "دیکھے گئے اسٹاپ کی تاریخ مٹا دیں؟",
    confirmClearRecentsYes: "ہاں، مٹا دیں",
    clearRecents: "تاریخ مٹائیں",
    recentsCleared: "تاریخ مٹا دی گئی۔",
    resetDefaults: "طے شدہ ترتیبات پر واپس جائیں",
    settingsReset: "ترتیبات طے شدہ قدروں پر واپس آ گئیں۔",
    infoLink: "معلومات، ڈیٹا کے ذرائع اور عام سوالات",
  },

  sync: {
    titleFull: "ڈیوائس ہم آہنگ کریں",
    titleCollapsed: "ہم آہنگی",
    badgeOn: "فعال",
    summaryLoading: "…",
    summaryUnavailable: "اس کنکشن پر دستیاب نہیں",
    summaryOff: "غیر فعال",
    summarySyncing: "ہم آہنگی جاری ہے…",
    summaryError: "ہم آہنگی میں خرابی",
    summaryConflict: "حل کرنے کے لیے تصادم ہے",
    summaryOn: (last: string): string => `فعال · آخری ${last}`,
    intro:
      "ایک کوڈ کے ذریعے پسندیدہ، حالیہ اور ترتیبات دوسری ڈیوائس پر لے جائیں۔ ڈیٹا یہیں خفیہ ہوتا ہے: سرور پر صرف ناقابلِ مطالعہ ڈیٹا رہتا ہے۔",
    enable: "ہم آہنگی فعال کریں",
    haveCode: "میرے پاس پہلے سے کوڈ ہے",
    codeLabel: "ہم آہنگی کا کوڈ",
    codeHint:
      "20 حروف، جیسے دوسری ڈیوائس پر نظر آ رہے ہیں۔ چھوٹے بڑے حروف، ڈیش اور خالی جگہ سے فرق نہیں پڑتا۔",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} حروف`,
    join: "جوڑیں",
    onIntro:
      "ڈیٹا اس ڈیوائس سے نکلنے سے پہلے خفیہ ہو جاتا ہے۔ جس کے پاس کوڈ ہوگا وہ آپ کے سارے پسندیدہ پڑھ سکتا ہے: اسے صرف اپنی ڈیوائسوں پر استعمال کریں۔",
    code: "کوڈ",
    showCode: "کوڈ دکھائیں",
    hideCode: "کوڈ چھپائیں",
    copyCode: "کوڈ کاپی کریں",
    copied: "کاپی ہو گیا",
    lastSync: "آخری ہم آہنگی:",
    inProgress: " · جاری ہے…",
    syncNow: "ابھی ہم آہنگ کریں",
    disconnect: "منقطع کریں",
    disconnectNote:
      "منقطع کرنے پر ڈیٹا اسی ڈیوائس پر رہتا ہے، اور خفیہ کاپی سرور پر اُس وقت تک رہتی ہے جب تک آپ اسے مٹا نہ دیں۔",
    deleteWarning:
      "سرور سے خفیہ کاپی مٹا دیتا ہے۔ دوسری ڈیوائسوں کو ہم آہنگ کرنے کے لیے کچھ نہیں ملے گا۔ یہ واپس نہیں ہو سکتا۔",
    deleteConfirm: "واقعی مٹا دیں",
    deleteRemote: "سرور سے ڈیٹا مٹائیں",
    justNow: "ابھی",
    minutesAgo: (minutes: number): string => `${minutes} منٹ پہلے`,
    atClock: (clock: string): string => `${clock} بجے`,
    errors: {
      aborted: "کارروائی منسوخ کر دی گئی۔",
      generic: "ہم آہنگی نہیں ہو سکی۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔",
      insecureContext:
        "ہم آہنگی کے لیے محفوظ کنکشن چاہیے: سائٹ https پر کھولیں (یا localhost پر)۔ عام http پر براؤزر خفیہ کاری بند کر دیتے ہیں، اس لیے اس ڈیوائس پر کچھ بھی خفیہ نہیں کیا جا سکتا۔",
      noBase64Encode: "یہ براؤزر ہم آہنگی کے ڈیٹا کو انکوڈ نہیں کر سکتا۔",
      noBase64Decode: "یہ براؤزر ہم آہنگی کے ڈیٹا کو ڈی کوڈ نہیں کر سکتا۔",
      invalidSyncData: (what: string): string => `ہم آہنگی کا ڈیٹا درست نہیں (${what})۔`,
      codeRequired: "ہم آہنگی کا کوڈ درج کریں۔",
      codeTooLong: (max: number): string => `یہ کوڈ بہت لمبا ہے: ${max} حروف ہونے چاہئیں۔`,
      codeInvalidChars: (chars: string): string =>
        `کوڈ میں ایسے حروف ہیں جن کی اجازت نہیں: ${chars}۔`,
      codeWrongLength: (required: number, actual: number): string =>
        `کوڈ ${required} حروف کا ہوتا ہے، آپ نے ${actual} لکھے ہیں۔`,
      keyDerivationFailed: "یہ براؤزر ہم آہنگی کی کلیدیں نہیں بنا سکتا۔",
      preparePayloadFailed: "ہم آہنگ کرنے کا ڈیٹا تیار نہیں ہو سکا۔",
      encryptFailed: "اس ڈیوائس پر ڈیٹا خفیہ نہیں کیا جا سکا۔",
      decryptFailed: "کوڈ اس ڈیٹا سے میل نہیں کھاتا، یا سرور پر موجود ڈیٹا خراب ہے۔",
      invalidSyncId: "ہم آہنگی کا شناخت کنندہ درست نہیں۔",
      responseTooLarge: "سرور نے حد سے زیادہ ڈیٹا بھیجا۔",
      timeout: "سرور نے وقت پر جواب نہیں دیا۔",
      unreachable: "سرور تک نہیں پہنچا جا سکا۔ اپنا کنکشن دیکھیں۔",
      invalidResponse: "سرور کا جواب درست نہیں۔",
      invalidResponseField: (what: string): string => `سرور کا جواب درست نہیں (${what})۔`,
      unexpectedFormat: "سرور نے غیر متوقع شکل میں جواب دیا۔",
      rateLimited: "لگاتار بہت زیادہ ہم آہنگیاں۔ ایک منٹ بعد دوبارہ کوشش کریں۔",
      pullRejected: (status: number): string => `سرور نے پڑھنے سے انکار کیا (خرابی ${status})۔`,
      payloadTooLarge: "ہم آہنگ کرنے کے لیے ڈیٹا بہت زیادہ ہے۔",
      pushRejected: (status: number): string => `سرور نے محفوظ کرنے سے انکار کیا (خرابی ${status})۔`,
      deleteRejected: (status: number): string => `سرور نے مٹانے سے انکار کیا (خرابی ${status})۔`,
      conflict:
        "اسی ڈیٹا میں اِس وقت دوسری ڈیوائس لکھ رہی ہے۔ آپ کا مقامی ڈیٹا محفوظ ہے: چند سیکنڈ بعد دوبارہ کوشش کریں۔",
    },
    status: {
      deleted: "سرور سے ڈیٹا ہٹا دیا گیا۔ یہ ڈیوائس اب ہم آہنگ نہیں ہو رہی۔",
      disconnected:
        "اس ڈیوائس پر ہم آہنگی بند ہے۔ آپ کا ڈیٹا یہیں رہے گا اور خفیہ کاپی سرور پر اُس وقت تک رہے گی جب تک آپ اسے مٹا نہ دیں۔",
    },
  },

  info: {
    title: "معلومات",
    subtitle:
      "سرکاری کھلے ڈیٹا سے روم کی پبلک ٹرانسپورٹ کے شیڈول اور آمد کے اوقات۔",
    unofficialTitle: "غیر سرکاری ایپ",
    unofficialBody:
      "یہ سائٹ ATAC S.p.A.، Roma Servizi per la Mobilità یا Roma Capitale سے کسی بھی طرح وابستہ، منسلک، منظور شدہ یا اُن کی حمایت یافتہ نہیں۔ یہ ایک آزاد منصوبہ ہے جو صرف اُن ادارتی طور پر شائع شدہ کھلے ڈیٹا کو پڑھتا ہے۔ سرکاری معلومات، ٹکٹ اور شکایات کے لیے اُن کے اپنے ذرائع سے رابطہ کریں۔",
    whatTitle: "یہ کیا ہے",
    whatBody1:
      "ایک ویب ایپ، جس سے پتہ چلے کہ آپ جس اسٹاپ پر کھڑے ہیں وہاں اگلی گاڑی کتنی دیر میں آئے گی۔ کوئی اسٹاپ یا روٹ تلاش کریں، پسندیدہ میں محفوظ کریں، اور ہوم پر تازہ آمد کے ساتھ وہ مل جائے گا۔ نہ اکاؤنٹ، نہ اشتہار، نہ استعمال کے اعداد و شمار۔",
    whatBody2:
      "جب براہِ راست ڈیٹا میں وہ پھیرا شامل ہو، تو دکھایا گیا وقت گاڑی کی جگہ پر مبنی اندازہ ہوتا ہے۔ ورنہ ایپ شیڈول کے وقت پر واپس آ جاتی ہے اور یہ ہمیشہ بتا دیتی ہے، پرانے ڈیٹا کو اندازہ بنا کر پیش نہیں کرتی۔",
    dataTitle: "ڈیٹا کہاں سے آتا ہے",
    dataBodyBefore:
      "شیڈول، اسٹاپ، روٹ، راستے، گاڑیوں کی جگہیں اور سروس کی اطلاعات اس ادارے کے کھلے ڈیٹا سے آتی ہیں: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS اور GTFS-Realtime)۔ شیڈول کے اوقات روزانہ تازہ ہوتے ہیں، براہِ راست ڈیٹا تقریباً ہر 30 سیکنڈ میں۔",
    dataLink: "romamobilita.it — کھلا ڈیٹا",
    dataLicence:
      "ڈیٹا اپنے اپنے مالکان ہی کا رہتا ہے اور اُسی لائسنس کی شرائط پر استعمال ہوتا ہے جس کے تحت شائع ہوا ہے۔",
    privacyTitle: "رازداری",
    privacyBody:
      "یہاں نہ لاگ اِن ہے، نہ صارف کا کوئی پروفائل۔ پسندیدہ، حال ہی میں دیکھے گئے اسٹاپ اور ترتیبات صرف آپ کے براؤزر میں محفوظ ہوتے ہیں اور کہیں نہیں بھیجے جاتے۔ قریبی اسٹاپ تلاش کرنے کے لیے اگر آپ جگہ کی اجازت دیں تو وہ ڈیوائس ہی میں رہتی ہے: فاصلے ناپنے کے کام آتی ہے اور محفوظ نہیں کی جاتی۔",
    faqTitle: "عام سوالات",
    faq1Q: "کوئی روٹ یا بس کیوں نظر نہیں آتی؟",
    faq1A:
      "ہم صرف وہی دکھاتے ہیں جو سرکاری ڈیٹا میں ہے۔ اگر کوئی گاڑی اپنی جگہ نہ بھیجے، یا اُس کا پھیرا براہِ راست ڈیٹا میں نہ ہو، تو ہمارے لیے وہ ہے ہی نہیں: زیادہ سے زیادہ آپ کو شیڈول کا وقت نظر آئے گا۔ یہ اکثر متبادل پھیروں، شٹل بسوں اور خراب لوکیٹر والی گاڑیوں کے ساتھ ہوتا ہے۔",
    faq2Q: "اسٹاپ پر لکھے وقت سے یہ مختلف کیوں ہے؟",
    faq2A:
      "کھمبے پر لگا بورڈ شیڈول کا وقت بتاتا ہے، جو سال میں چند بار بدلتا ہے۔ یہاں، جب گاڑی ڈیٹا بھیجتی ہے، تو آپ اُس کی اصل جگہ سے نکالا گیا اندازہ دیکھتے ہیں، جس میں ٹریفک اور تاخیر شامل ہوتی ہے۔ اور جب «شیڈول شدہ» لکھا ہو، تو اندازہ نہیں ہوتا اور ہم بورڈ والا ہی وقت دکھا رہے ہوتے ہیں۔",
    faq3Q: "رات کو کیا ہوتا ہے؟",
    faq3A:
      "رات کو براہِ راست ڈیٹا تقریباً خالی ہوتا ہے، کیونکہ گاڑیاں کم چلتی ہیں۔ ایپ رات کے روٹوں کے شیڈول سے کام کرتی رہتی ہے۔ GTFS میں سروس کا دن آدھی رات کو نہیں، 04:00 بجے ختم ہوتا ہے: رات ایک بجے کا پھیرا ابھی بھی پچھلے دن کا ہے، اسی لیے آپ کو 25:30 جیسا وقت 01:30 میں بدلا ہوا نظر آ سکتا ہے۔",
    faq4Q: "کیا میرے پسندیدہ کسی سرور پر جاتے ہیں؟",
    faq4A:
      "نہیں۔ پسندیدہ، تاریخ اور ترتیبات براؤزر کے localStorage میں رہتے ہیں۔ اگر آپ سائٹ کا ڈیٹا مٹا دیں یا ڈیوائس بدل لیں تو وہ چلے جائیں گے: ترتیبات سے آپ انہیں JSON فائل میں برآمد کر کے کہیں اور درآمد کر سکتے ہیں۔",
    settingsLink: "ترتیبات پر جائیں",
  },

  footer: {
    dataPrefix: "سروس کا ڈیٹا اور شیڈول: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (GTFS کھلا ڈیٹا)۔",
    independent:
      "آزاد منصوبہ، ATAC یا Roma Servizi per la Mobilità سے وابستہ نہیں۔ ",
    infoLink: "معلومات",
  },

  errors: {
    genericTitle: "کچھ کام نہیں آیا",
    unexpected: "غیر متوقع خرابی",
    unexpectedDot: "غیر متوقع خرابی۔",
    stopNotFound: "اسٹاپ نہیں ملا",
    serviceDown: "سروس جواب نہیں دے رہی",
    requestFailed: (status: number): string => `درخواست پوری نہیں ہوئی (${status})`,
    httpStatus: (status: number): string => `خرابی ${status}`,
    badResponse: "سرور کا جواب درست نہیں",
    badResponseDot: "سرور کا جواب درست نہیں۔",
    timedOut: "درخواست کا وقت ختم",
    timedOutDot: "درخواست کا وقت ختم۔",
    offline: "کوئی کنکشن نہیں",
    connectionFailed: "کنکشن نہیں بن سکا۔",
    tooManyRequests: "بہت زیادہ درخواستیں",
    badRequest: "پیرامیٹر درست نہیں",
    lineNotFound: "روٹ نہیں ملا",
    journeyOriginNotFound: "روانگی کی جگہ نہیں ملی",
    journeyDestinationNotFound: "منزل نہیں ملی",
    journeyPlaceHint: "زیادہ واضح پتہ آزمائیں۔",
  },

  notFound: {
    kicker: "خرابی 404",
    title: "اس اسٹاپ پر سروس نہیں",
    body:
      "یہ صفحہ موجود نہیں۔ یہ پرانے لنک سے ہو سکتا ہے، یا ایسے اسٹاپ یا روٹ کے کوڈ سے جو اب ڈیٹا میں نہیں ہے۔",
    searchCta: "اسٹاپ تلاش کریں",
    nearbyCta: "قریبی اسٹاپ",
  },

  appError: {
    title: "پھیرا رک گیا",
    body:
      "یہ اسکرین لوڈ نہیں ہو سکی۔ دوبارہ کوشش کریں: اگر مسئلہ رہے تو غالباً ڈیٹا سروس ہی جواب نہیں دے رہی۔",
    digest: (digest: string): string => `کوڈ: ${digest}`,
    backHome: "ہوم پر واپس",
    globalTitle: "سروس رکی ہوئی ہے",
    globalBody:
      "ایک غیر متوقع خرابی کی وجہ سے ایپ رک گئی۔ صفحہ دوبارہ لوڈ کریں: آپ کے پسندیدہ فون میں محفوظ ہیں اور ضائع نہیں ہوں گے۔",
    reload: "دوبارہ لوڈ کریں",
  },

  format: {
    due: "پہنچنے والی ہے",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "تاریخ دستیاب نہیں",
    minutes: (minutes: number): string => `${minutes} منٹ`,
    metres: (metres: number): string => `${metres} میٹر`,
    kilometres: (value: string): string => `${value} کلومیٹر`,
    ageUnknown: "تازہ کاری کا وقت معلوم نہیں",
    ageSeconds: (seconds: number): string => `${seconds} سیکنڈ پہلے تازہ`,
    ageMinutes: (minutes: number): string => `${minutes} منٹ پہلے تازہ`,
    ageAt: (clock: string): string => `${clock} بجے تازہ`,
    onTime: "وقت پر",
    delayLate: (minutes: number): string => `+${minutes} منٹ`,
    delayEarly: (minutes: number): string => `${minutes} منٹ`,
  },

  meta: {
    appTitle: "BusFinder — براہِ راست روانگی کے اوقات",
    appDescription:
      "روم میں بس، ٹرام اور میٹرو کے براہِ راست اوقات اور روانگیاں۔ محفوظ اسٹاپ، قریبی اسٹاپ اور سروس کی اطلاعات، بغیر اکاؤنٹ اور بغیر اشتہار کے۔",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "آپ کے سب سے قریبی ATAC اسٹاپ، نقشے اور وہاں سے گزرنے والے روٹوں کے ساتھ۔",
    journeyDescription:
      "روم میں ایک جگہ سے دوسری جگہ بس، ٹرام اور میٹرو سے کیسے جائیں، سرکاری ATAC شیڈول کے مطابق۔",
    alertsDescription: "سرکاری فیڈ پر شائع ہونے والی راستے کی تبدیلیاں، بندش اور سروس میں ردوبدل۔",
    settingsDescription: "آمد کی تازہ کاری، تلاش کا دائرہ، تھیم اور محفوظ کردہ چیزوں کا انتظام۔",
    infoDescription:
      "یہ ایپ کیا ہے، ڈیٹا کہاں سے آتا ہے، اور یہ ATAC یا Roma Servizi per la Mobilità سے وابستہ کیوں نہیں۔",
    stopDescription: "اسٹاپ کی براہِ راست روانگیاں اور طے شدہ شیڈول۔",
    lineDescription: "روٹ کا راستہ، اسٹاپ اور براہِ راست گاڑیاں۔",
  },

  skeleton: {
    loading: "لوڈ ہو رہا ہے",
  },
};

const EFFECT_UR: Record<string, string | undefined> = {
  NO_SERVICE: "سروس بند",
  REDUCED_SERVICE: "سروس کم",
  SIGNIFICANT_DELAYS: "نمایاں تاخیر",
  DETOUR: "راستہ تبدیل",
  ADDITIONAL_SERVICE: "اضافی سروس",
  MODIFIED_SERVICE: "سروس میں تبدیلی",
  STOP_MOVED: "اسٹاپ منتقل",
  NO_EFFECT: "سروس پر کوئی اثر نہیں",
  ACCESSIBILITY_ISSUE: "رسائی کا مسئلہ",
  OTHER_EFFECT: "دیگر",
  UNKNOWN_EFFECT: "اثر درج نہیں",
};

const CAUSE_UR: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "تکنیکی خرابی",
  STRIKE: "ہڑتال",
  DEMONSTRATION: "مظاہرہ",
  ACCIDENT: "حادثہ",
  HOLIDAY: "تعطیل",
  WEATHER: "خراب موسم",
  MAINTENANCE: "مرمت",
  CONSTRUCTION: "سڑک کا کام",
  POLICE_ACTIVITY: "پولیس کی کارروائی",
  MEDICAL_EMERGENCY: "طبی ہنگامی صورتحال",
  OTHER_CAUSE: "دوسری وجہ",
  UNKNOWN_CAUSE: "وجہ درج نہیں",
};
