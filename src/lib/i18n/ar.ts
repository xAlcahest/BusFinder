/**
 * Arabic dictionary. Shape and key order follow it.ts, the source of truth.
 * Arabic uses all six CLDR categories (zero/one/two/few/many/other), so the
 * plurals go through CLDR. This language renders right-to-left; see
 * directionFor() in locale.ts.
 */

import type { Dictionary } from "./it";
import { pluralRules } from "./plural";

const { pick, count: n } = pluralRules("ar");

export const ar: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder، الرئيسية",
  },

  a11y: {
    skipToContent: "انتقل إلى المحتوى",
  },

  common: {
    retry: "أعد المحاولة",
    cancel: "إلغاء",
    save: "حفظ",
    close: "إغلاق",
    home: "الرئيسية",
    back: "رجوع",
    all: "الكل",
    loading: "جارٍ التحميل…",
    searching: "جارٍ البحث…",
    refresh: "تحديث",
    dash: "—",
    minutesShort: "د",
    clearSearch: "مسح البحث",
    searchInProgress: "البحث جارٍ",
  },

  nav: {
    primary: "التنقل الرئيسي",
    sidebar: "الشريط الجانبي",
    sidebarNav: "التنقل الجانبي",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    sections: "الأقسام",
    shortcuts: "اختصارات",
    infoAria: "معلومات عن التطبيق",
    home: "الرئيسية",
    nearbyShort: "قريب",
    nearby: "المحطات القريبة",
    journey: "المسار",
    alerts: "التنبيهات",
    settings: "الإعدادات",
    info: "معلومات",
    hintNearby: "ما الذي يمر من هنا",
    hintJourney: "من نقطة إلى أخرى",
    hintAlerts: "التحويلات والانقطاعات",
    hintSettings: "التحديث والمظهر والبيانات",
    hintInfo: "المصادر والملاحظات القانونية",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ترام";
        case 1:
          return "مترو";
        case 2:
          return "قطار";
        case 4:
          return "عبّارة";
        default:
          return "حافلة";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "ترام";
        case 1:
          return "مترو";
        case 2:
          return "قطار";
        case 3:
          return "حافلة";
        default:
          return "خط";
      }
    },
    named: (name: string): string => `الخط ${name}`,
    namedAria: (name: string): string => `الخط ${name}`,
    details: "التفاصيل",
    towards: (headsign: string): string => `باتجاه ${headsign}`,
    towardsCapital: (headsign: string): string => `باتجاه ${headsign}`,
    direction: "الاتجاه",
    terminus: "المحطة الأخيرة",
    noHeadsign: "الوجهة غير مذكورة",
  },

  stops: {
    code: (code: string): string => `المحطة ${code}`,
    codeOnly: "محطة",
    pole: (code: string): string => `العمود ${code}`,
    accessible: "محطة مهيّأة لذوي الإعاقة",
    named: (name: string): string => `محطة ${name}`,
    countLabel: (count: number): string =>
      n(count, { two: "محطتان", few: "محطات", other: "محطة" }),
    involved: (count: number): string =>
      n(count, { two: "محطتان متأثرتان", few: "محطات متأثرة", other: "محطة متأثرة" }),
  },

  home: {
    kicker: "روما · النقل العام",
    title: "متى تمر؟",
    intro:
      "ابحث عن محطة برقمها أو باسمها، أو عن خط. مواعيد الوصول تأتي من بث روما الآني.",
  },

  search: {
    inputAria: "ابحث عن محطة أو خط",
    placeholder: "محطة أو شارع أو خط",
    searchingFor: (query: string): string => `جارٍ البحث عن «${query}»…`,
    noResultsFor: (query: string): string => `لا نتائج لـ «${query}»`,
    noResultsHint:
      "جرّب رقم المحطة (مثلاً 70101) أو اسم الشارع أو رقم الخط.",
    resultsList: "نتائج البحث",
    keyboardHint: "↑ ↓ للتنقل، Enter للفتح، Esc للإغلاق",
  },

  favorites: {
    heading: "المفضلة",
    emptyTitle: "لا مفضلة بعد",
    emptyHint:
      "المس النجمة ★ بجانب محطة أو خط: في البحث، في المحطات القريبة، في صفحة المحطة أو صفحة الخط. ستجدها هنا من دون البحث عنها في كل مرة.",
    reorder: "إعادة الترتيب",
    reorderDone: "تم",
    reorderHint: "حرّك المحطات بالأسهم. الترتيب يسري على هذا الجهاز.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: الموضع ${position} من ${total}.`,
    moveUp: (name: string): string => `تحريك ${name} للأعلى`,
    moveDown: (name: string): string => `تحريك ${name} للأسفل`,
    addStar: (name: string): string => `ضع نجمة على محطة ${name}`,
    removeStar: (name: string): string => `أزل النجمة عن محطة ${name}`,
    addStarLine: (name: string): string => `ضع نجمة على الخط ${name}`,
    removeStarLine: (name: string): string => `أزل النجمة عن الخط ${name}`,
    starredTitle: "عليها نجمة: في المفضلة",
    starTitle: "ضع نجمة",
    starredLabel: "عليها نجمة",
    starLabel: "نجمة",
    editLabels: (name: string): string => `عدّل التسمية والخطوط لـ ${name}`,
    onlyLines: (labels: string): string => `فقط ${labels}`,
    notUpdated: "غير محدَّث",
    noArrivalsOnPinned: "لا مرور على الخطوط المختارة.",
    changeLines: "غيّر الخطوط",
    noArrivalsSoon: "لا مرور في الدقائق القادمة.",
    openForTimes: "افتح لرؤية المواعيد",
    vehiclesUnavailable: "بيانات المركبات غير متاحة",
    lookingForVehicles: "جارٍ البحث عن المركبات العاملة…",
    noVehiclesNow: "لا مركبة عاملة الآن",
    vehiclesInService: (count: number): string =>
      `${n(count, { two: "مركبتان", few: "مركبات", other: "مركبة" })} تعمل الآن`,
    refreshArrivals: "حدّث مواعيد الوصول",
    undoRemovedStop: "محطة بلا نجمة: لم تعد في المفضلة.",
    undoRemovedLine: "خط بلا نجمة: لم يعد في المفضلة.",
    undoDismiss: "إغلاق التنبيه",
    more: (count: number): string => `${count} مفضلة أخرى`,
    sidebarEmptyBefore: "المس النجمة بجانب محطة أو خط، في البحث، في ",
    sidebarEmptyAfter: " أو في الصفحة التي تنظر إليها. ستجدها هنا.",
    nextDeparture: "المرور القادم",
    noDeparture: "لا مرور متاح",
    notAvailableShort: "—",
  },

  recents: {
    heading: "شوهدت مؤخراً",
    clear: "تفريغ",
    emptyTitle: "لا محطات حديثة",
    emptyHint:
      "المحطات التي تفتحها تبقى هنا بضعة أيام، لتجدها من دون البحث عنها من جديد.",
    listAria: "المحطات التي شوهدت مؤخراً",
    justNow: "قبل قليل",
    today: "اليوم",
    yesterday: "أمس",
  },

  arrivals: {
    due: "على وشك الوصول",
    live: "آني",
    scheduled: "حسب الجدول",
    scheduledTail: " مجدول",
    scheduledSr: "الموعد المجدول",
    onTime: "في موعده",
    lateBy: (minutes: number): string => `+${minutes} د`,
    earlyBy: (minutes: number): string => `−${minutes} د`,
    lateSuffix: "تأخير",
    earlySuffix: "تبكير",
    lateSr: (minutes: number): string =>
      `تأخير ${n(minutes, { two: "دقيقتان", few: "دقائق", other: "دقيقة" })}`,
    earlySr: (minutes: number): string =>
      `تبكير ${n(minutes, { two: "دقيقتان", few: "دقائق", other: "دقيقة" })}`,
    skipped: "ملغاة",
    skippedSr: "الرحلة ملغاة",
    atClock: (clock: string): string => `في ${clock}`,
    towardsSr: (headsign: string): string => `اتجاه ${headsign}`,
    loadingAria: "جارٍ تحميل مواعيد الوصول",
    emptyTitle: "لا مرور متوقع",
    emptyHint:
      "لا رحلة تقترب. جرّب الموعد المجدول أو أعد المحاولة بعد قليل.",
    frozenUnknown: "التوقع غير محدَّث",
    frozenFor: (minutes: number): string => `متوقف منذ ${minutes} د`,
    frozenPrefix: (state: string): string => `التوقع ${state}`,
    frozenSr: (state: string): string => `التوقع ${state}، ولا يُحدَّث آنياً`,
    expectedSr: (relative: string, clock: string): string => `متوقع ${relative}، في ${clock}`,
    bannerNoRealtimeStrong: "البيانات الآنية غير متاحة.",
    bannerNoRealtime:
      " نعرض المواعيد المجدولة: قد تمر المركبات مبكراً أو متأخراً.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "البيانات الآنية متوقفة." : `البيانات الآنية متوقفة منذ ${minutes} د.`,
    bannerFrozenBefore: " التوقعات أدناه هي توقعات",
    bannerFrozenLastUpdate: " آخر تحديث",
    bannerFrozenAt: (clock: string): string => ` في ${clock}`,
    bannerFrozenAfter: " ولم تعد تُحدَّث: خذها بحذر.",
    bannerPartialStrong: "البيانات الآنية جزئية.",
    bannerPartial: " لم يصل جزء من البيانات: قد تنقص بعض الرحلات.",
    showOnMap: (line: string): string => `أظهر مركبة الخط ${line} على الخريطة`,
    hideOnMap: (line: string): string => `أزل تمييز مركبة الخط ${line}`,
  },

  dataAge: {
    prefix: "حُدِّث",
    now: "الآن",
    secondsAgo: (seconds: number): string => `قبل ${seconds} ث`,
    minutesAgo: (minutes: number): string => `قبل ${minutes} د`,
    atClock: (clock: string): string => `في ${clock}`,
    never: "أبداً",
  },

  refreshFeedback: {
    updated: "حُدِّث",
    unchanged: "تم الفحص، لا جديد",
    failed: "لم ينجح التحديث",
    updatedShort: "حُدِّث",
    unchangedShort: "لا جديد",
    failedShort: "لم يُحدَّث",
    busy: "جارٍ التحديث…",
    busySpoken: "التحديث جارٍ",
  },

  stop: {
    tabArrivals: "الوصول",
    tabTimetable: "الجدول",
    tabsAria: "عرض المحطة",
    editTag: "تعديل التسمية",
    addTag: "تسمية",
    map: "خريطة",
    realtimePrefix: "آني",
    noRealtime: "لا بيانات آنية",
    pageNotUpdated: "الصفحة لم تُحدَّث بعد",
    pageUpdatedAt: (clock: string): string => `حُدِّثت الصفحة في ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. أنت ترى آخر بيانات وصلت.`,
    arrivalsUnavailable: "مواعيد الوصول غير متاحة",
    emptyHint:
      "لا رحلة تقترب الآن. افتح الجدول لتعرف متى يُتوقع المرور القادم.",
    seeTimetable: "اطّلع على الجدول",
    linesHere: "الخطوط التي تقف هنا",
  },

  tagDialog: {
    titleFavorite: "مفضلة",
    titleTag: "تسمية المحطة",
    label: "ماذا تسمّيها أنت",
    placeholder: "البيت، المكتب، النادي…",
    hint: (maxChars: number): string =>
      `لك وحدك: تبقى على هذا الجهاز، بحد أقصى ${maxChars} حرفاً.`,
    linesLegend: "الخطوط المعروضة",
    linesNone: "لا اختيار: البطاقة تعرض كل الخطوط.",
    linesSome: (count: number): string =>
      `فقط ${n(count, { two: "خطان", few: "خطوط", other: "خط" })} على البطاقة.`,
    showAllLines: "أظهر كل الخطوط",
    removeTag: "إزالة التسمية",
  },

  timetable: {
    previousDay: "اليوم السابق",
    nextDay: "اليوم التالي",
    today: "اليوم",
    scheduled: "الموعد المجدول",
    jumpToNow: "انتقل إلى الآن",
    backToToday: "العودة إلى اليوم",
    fromServiceStart: "من بداية الخدمة",
    unavailableTitle: "الجدول غير متاح",
    partialError: (error: string): string => `${error}. أنت ترى الرحلات المحمَّلة بالفعل.`,
    emptyTitle: "لا رحلات من هنا فصاعداً",
    emptyFromNow:
      "لا مرور بعد هذه الساعة. جرّب من بداية الخدمة، أو يوماً آخر، أو أزل مرشّح الخط.",
    emptyWholeDay:
      "لا مرور مجدول في هذا اليوم: جرّب اليوم السابق أو التالي، أو أزل مرشّح الخط.",
    loadMore: "أظهر رحلات أخرى",
    loadingMore: "جارٍ التحميل…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${n(count, { two: "رحلتان", few: "رحلات", other: "رحلة" })} من ${from} إلى ${to}` +
      (complete ? "، حتى نهاية الخدمة" : "") +
      ". هذه المواعيد الرسمية ليوم الخدمة، من دون بيانات آنية.",
  },

  map: {
    fallbackAria: "خريطة",
    vehiclesHeading: "المركبات على الخريطة",
    show: "إظهار",
    hide: "إخفاء",
    modeGroup: "أي المركبات نعرض",
    modeApproaching: "قادمة إلى هنا",
    modeAllLines: "كل الخطوط",
    loadingStop: "جارٍ تحميل موقع المحطة…",
    stopMapAria: (stopName: string): string => `خريطة المركبات في محطة ${stopName}`,
    centreOnStop: "توسيط على المحطة",
    nearbyVehicles: "المركبات القريبة من هنا",
    allVehicles: "الكل، حتى البعيدة",
    loadingVehicles: "جارٍ تحميل المركبات…",
    noneApproaching: "لا مركبة تقترب",
    approachingCount: (count: number): string =>
      n(count, { two: "مركبتان قادمتان", few: "مركبات قادمة", other: "مركبة قادمة" }),
    onTheseLines: (count: number): string =>
      `${n(count, { two: "مركبتان", few: "مركبات", other: "مركبة" })} على خطوط هذه المحطة`,
    positionsAt: (clock: string): string => `مواقع الساعة ${clock}`,
    positionsStale: "مواقع غير محدَّثة",
    allLinesNote:
      "المركبات الواضحة متجهة إلى هذه المحطة، والباهتة تسير على الخطوط نفسها لكنها لا تمر من هنا الآن.",
    approachingList: "المركبات القادمة",
    hereIn: (relative: string): string => `هنا ${relative}`,
    hereInAt: (relative: string, clock: string): string => `هنا ${relative}، في ${clock}`,
    notInbound: "تسير على هذا الخط، لكنها ليست متجهة إلى هذه المحطة",
    noBearing: " · الاتجاه غير مُرسَل",
    follow: "أنا في هذه المركبة، تابعها",
    unfollow: "أوقف المتابعة",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `الخط ${line}، هنا ${relative}${followed ? "، أنت تتابعها" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `الخط ${line}، تسير، وليست متجهة إلى هذه المحطة${followed ? "، أنت تتابعها" : ""}`,
    yourPosition: "موقعك",
    vehicleTitle: (vehicleId: string): string => `المركبة ${vehicleId}`,
    showOnMap: (stopName: string): string => `أظهر ${stopName} على الخريطة`,
    divertedSuffix: " · خارج المسار",
    divertedBadge: "خارج المسار",
    divertedNote: "تسلك طريقاً مختلفاً عن المقرر.",
  },

  follow: {
    headlineLive: "أتابع هذه المركبة",
    headlinePaused: "المتابعة متوقفة مؤقتاً",
    headlineStale: "الموقع لا يتحرك",
    headlineLost: "المركبة لم تعد على الخط",
    detailLive: "تبقى الخريطة متمركزة عليها مع كل تحديث.",
    detailPaused:
      "أنت حرّكت الخريطة، فلم أعد أحرّكها. المس «استئناف» للعودة إلى المركبة.",
    detailStaleUnknown: "المركبة لم ترسل موقعها منذ فترة.",
    detailStale: (age: string): string =>
      `المركبة لم ترسل شيئاً منذ ${age}: ما على الخريطة هو آخر نقطة معروفة.`,
    detailLost:
      "لم أعد أستقبل موقعها. ربما أنهت رحلتها أو خرجت من الخدمة.",
    ageMinutes: (minutes: number): string =>
      n(minutes, { two: "دقيقتان", few: "دقائق", other: "دقيقة" }),
    ageHours: (hours: number): string =>
      n(hours, { two: "ساعتان", few: "ساعات", other: "ساعة" }),
    compact: "أتابع",
    compactSr: (line: string): string => ` الخط ${line}`,
    lineSr: (line: string): string => `، الخط ${line}`,
    resume: "استئناف",
    exit: "خروج",
    close: "إغلاق",
    lostHint: "إن كانت ما زالت تسير، ستجدها بالانتقال إلى «كل الخطوط».",
  },

  nearby: {
    title: "المحطات القريبة",
    mapAria: "خريطة المحطات القريبة",
    searchHere: "ابحث في هذه المنطقة",
    radius: "نصف القطر",
    locating: "جارٍ تحديد الموقع…",
    myPosition: "موقعي",
    geoDenied:
      "رُفض إذن تحديد الموقع. نعرض وسط روما: حرّك الخريطة وابحث في تلك المنطقة.",
    geoUnavailable:
      "الموقع غير متاح الآن. نعرض وسط روما: حرّك الخريطة وابحث في تلك المنطقة.",
    geoTimeout:
      "استغرق تحديد الموقع وقتاً طويلاً. نعرض وسط روما: حرّك الخريطة وأعد المحاولة.",
    geoUnsupported:
      "هذا المتصفح لا يدعم تحديد الموقع. حرّك الخريطة للبحث عن المحطات.",
    outsideRome: "أنت خارج نطاق روما: نعرض وسط المدينة.",
    outsideCoverage: "هذه المنطقة خارج نطاق التغطية. حرّك الخريطة نحو روما.",
    focusStopMissing: "لم يُعثر على المحطة المطلوبة: نعرض منطقتك.",
    focusStopFailed: (error: string): string => `لم تُحمَّل المحطة المطلوبة (${error}).`,
    stopsFailed: (error: string): string => `لم تُحمَّل المحطات: ${error}`,
    loadingStops: "جارٍ البحث عن المحطات…",
    noStopsInRadius: (radius: string): string =>
      `لا محطة ضمن ${radius}. جرّب توسيع نصف القطر أو تحريك الخريطة.`,
    onMapCap: (max: number): string => ` (أول ${max} على الخريطة)`,
    noLines: "لا خطوط",
    arrivalsLink: "الوصول",
    showMoreStops: "أظهر محطات أخرى",
  },

  line: {
    loading: "جارٍ تحميل الخط…",
    loadFailed: (error: string): string => `لم يُحمَّل الخط: ${error}`,
    mapAria: (name: string): string => `خريطة الخط ${name}`,
    dataAt: (clock: string): string => `بيانات الساعة ${clock}`,
    updatedAt: (clock: string): string => `حُدِّث في ${clock}`,
    vehiclesStale: (error: string): string => `المركبات غير محدَّثة: ${error}`,
    noPathForDirection: "المسار غير متاح لهذا الاتجاه",
    stopsHeading: (count: number): string => `المحطات (${count})`,
    noStopsForDirection: "لا محطات متاحة لهذا الاتجاه.",
    showAllStops: "أظهر كل المحطات",
  },

  lineService: {
    inService: (count: number): string =>
      `${n(count, { two: "مركبتان", few: "مركبات", other: "مركبة" })} على الخط`,
    loadingVehicles: "جارٍ تحميل المركبات…",
    checkingTimetable: "جارٍ فحص الجدول…",
    feedDownTitle: "المواقع الآنية غير متاحة",
    feedDownDetail:
      "قد تكون الخدمة طبيعية: نحن فقط لا نستطيع قراءة مواقع المركبات.",
    noneReporting: "لا مركبة تُبلّغ عن موقعها",
    unknownDetail:
      "هذا لا يعني أن الخط متوقف: المواعيد المجدولة موجودة في صفحة إحدى المحطات.",
    scheduledDetail: (count: number): string =>
      `الخدمة مجدولة: ${n(count, { two: "رحلتان متوقعتان", few: "رحلات متوقعة", other: "رحلة متوقعة" })} من الآن حتى نهاية اليوم.`,
    finishedTitle: "انتهت الخدمة لهذا اليوم",
    finishedDetail: (count: number, clock: string): string =>
      `اليوم ${n(count, { two: "رحلتان مجدولتان", few: "رحلات مجدولة", other: "رحلة مجدولة" })}، آخرها في ${clock}.`,
    noneTodayTitle: "لا رحلات مجدولة اليوم",
    noneTodayDetail: "لا توجد على هذا الخط رحلات في جدول اليوم.",
    noneTodayFrom: (stopName: string): string =>
      `من ${stopName} لا توجد رحلات في جدول اليوم.`,
    nextDepartures: "المغادرات القادمة",
    nextDeparturesFrom: (stopName: string): string => ` من ${stopName}`,
    scheduledOnly: "مواعيد مجدولة، من دون بيانات آنية.",
  },

  journey: {
    title: "المسار",
    subtitle: "من نقطة إلى أخرى في روما بالحافلة والترام والمترو.",
    from: "المغادرة",
    to: "الوصول",
    placeholder: "محطة أو عنوان أو مكان",
    swap: "عكس",
    whenLegend: "متى",
    now: "الآن",
    pickTime: "اختر الوقت",
    timeLabel: "تاريخ ووقت المغادرة",
    submit: "ابحث عن المسار",
    resultsHeading: "المسارات",
    emptyTitle: "إلى أين تريد الذهاب؟",
    emptyHint:
      "اكتب نقطة المغادرة والوصول: نبحث عن أفضل مسار اعتماداً على الجداول الرسمية.",
    searching: "جارٍ البحث عن المسارات…",
    noResultsTitle: "لا مسار",
    noResultsHint:
      "نبحث فقط عن الوصلات المباشرة أو بتبديل واحد. جرّب تغيير نقطة المغادرة أو الوقت.",
    disclaimer:
      "مواعيد مجدولة لا آنية: التأخيرات الفعلية غير محسوبة. المقاطع سيراً تُقدَّر بخط مستقيم، فالمسافة الحقيقية في الشارع أطول.",
    searchedFrom: (when: string): string => ` بحث بدءاً من ${when}.`,
    mapAria: "خريطة المسار المختار",
    mapCaption:
      "المقاطع داخل المركبة تتبع المسار الحقيقي للخط. المتقطعة مقدَّرة بخط مستقيم: التنقلات سيراً والخطوط النادرة التي لا مسار لها.",
    missingEndpoints: "حدّد المغادرة والوصول معاً.",
    badDateTime: "التاريخ والوقت غير صالحين.",
    geoUnsupported: "هذا المتصفح لا يدعم تحديد الموقع.",
    geoUnavailable: "الموقع غير متاح الآن.",
    geoOutsideRome: "أنت خارج نطاق روما: اكتب عنواناً.",
    geoDenied: "رُفض إذن تحديد الموقع: اكتب عنواناً.",
    geoTimeout: "استغرق تحديد الموقع وقتاً طويلاً.",
    originMarker: (name: string): string => `المغادرة: ${name}`,
    destinationMarker: (name: string): string => `الوصول: ${name}`,
    useMyPosition: "استخدم موقعي",
    clearField: (label: string): string => `أفرغ ${label}`,
    suggestionsFor: (label: string): string => `اقتراحات لـ ${label}`,
    placeStop: "محطة",
    placeCoord: "إحداثيات",
    placeAddress: "عنوان",
    walkOnly: "سيراً فقط",
    walkOnlyShort: "سيراً",
    noTransfers: "بلا تبديل",
    transfers: (count: number): string =>
      n(count, { two: "تبديلان", few: "تبديلات", other: "تبديل" }),
    walkDistance: (distance: string): string => `${distance} سيراً`,
    walkLeg: (distance: string, duration: string): string =>
      `سيراً ${distance}، نحو ${duration} حتى `,
    inService: "في الخدمة",
    stopCount: (count: number): string =>
      n(count, { two: "محطتان", few: "محطات", other: "محطة" }),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `المسار ${index}: المغادرة ${departure}، الوصول ${arrival}`,
    lineDetailsAria: (line: string): string => `الخط ${line}، التفاصيل`,
    hours: (hours: number): string => `${hours} س`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} س ${minutes}`,
    noticeNoOriginStops:
      "لا توجد محطة على مسافة سير من نقطة المغادرة: جرّب عنواناً أقرب إلى أحد الخطوط.",
    noticeNoDestinationStops:
      "لا توجد محطة على مسافة سير من نقطة الوصول: جرّب عنواناً أقرب إلى أحد الخطوط.",
    noticeNoConnection: "لا توجد وصلة بين هاتين المنطقتين في الساعات القادمة.",
    noticeWalkOnlyLeft: "لا توجد وصلة مجدولة في الساعات القادمة: لم يبقَ سوى المسار سيراً.",
    noticeLaterDepartures: "لا رحلات في الساعة والنصف القادمة: نعرض أول الرحلات المتاحة بعدها.",
  },

  alerts: {
    title: "تنبيهات الخدمة",
    subtitle: "التحويلات والتعليقات والتغييرات المنشورة في البث الرسمي.",
    loading: "جارٍ التحميل…",
    degraded:
      "البث الآني لا يستجيب أو قديم: قد لا تكون هذه التنبيهات محدَّثة.",
    loadFailed: "تعذّر تحميل التنبيهات.",
    refreshFailed: (error: string): string =>
      `لم ينجح آخر تحديث (${error}): أنت ترى القائمة السابقة.`,
    searchPlaceholder: "ابحث: إضراب، تحويل، شارع…",
    searchAria: "ابحث بين التنبيهات",
    filterByLine: "تصفية حسب الخط",
    allLines: (count: number): string => `كل الخطوط (${count})`,
    networkWide: "تنبيهات عامة",
    clearFilters: "إعادة ضبط",
    noMatch: "لا تنبيه يطابق المرشّحات.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${pick(shown, { two: "تنبيهان", few: "تنبيهات", other: "تنبيه" })} من ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${pick(count, { two: "تنبيهان نشطان", few: "تنبيهات نشطة", other: "تنبيه نشط" })} على ${lines} خطوط.`,
    goToLine: "اذهب إلى الخط",
    noneTitle: "لا تنبيهات نشطة",
    noneHint:
      "لا يُبلّغ البث حالياً عن أي انقطاع أو تغيير في الخدمة. تحقّق مرة أخرى قبل الخروج.",
    noResultsTitle: "لا نتائج",
    noResultsHint:
      "جرّب كلمات أقل، أو أعد ضبط المرشّحات لرؤية كل التنبيهات من جديد.",
    noSelectionTitle: "لم يُختر أي تنبيه",
    noSelectionHint: "اختر تنبيهاً من القائمة على اليسار لقراءته كاملاً.",
    showMoreLines: (count: number): string => `أظهر خطوطاً أخرى (${count})`,
    goToLineShort: "اذهب إلى الخط",
    fallbackHeader: "تنبيه خدمة",
    noDetail: "لم ينشر المشغّل أي تفاصيل.",
    operatorLink: "التفاصيل على موقع المشغّل",
    affectedLines: "الخطوط المتأثرة",
    alsoOn: "وأيضاً على",
    contextHeading: (count: number): string =>
      `${count} ${pick(count, { two: "تنبيهان نشطان", few: "تنبيهات نشطة", other: "تنبيه نشط" })}`,
    contextAria: "تنبيهات الخدمة",
    contextAll: "الكل",
    contextUnavailable: (error: string): string => `التنبيهات غير متاحة: ${error}`,
    contextMore: (count: number): string => `${count} تنبيهات أخرى في `,
    contextMoreLink: "صفحة التنبيهات",
    contextStale: (error: string): string =>
      `لم ينجح آخر تحديث (${error}): قد لا تكون هذه التنبيهات سارية.`,
    windowBetween: (from: string, until: string): string => `من ${from} إلى ${until}`,
    windowFrom: (from: string): string => `من ${from}، من دون تاريخ انتهاء محدد`,
    windowUntil: (until: string): string => `حتى ${until}`,
    windowUnknown: "مدة السريان غير محددة",
    effect: (code: string): string | null => EFFECT_AR[code] ?? null,
    cause: (code: string): string | null => CAUSE_AR[code] ?? null,
  },

  settings: {
    title: "الإعدادات",
    subtitle: "كل شيء يبقى على هذا الجهاز. لا حساب ولا خادم.",
    sectionArrivals: "الوصول",
    autoRefresh: "التحديث التلقائي",
    everySeconds: (seconds: number): string => `كل ${seconds} ثانية`,
    autoRefreshHint: "الفاصل بين قراءتين للبث الآني.",
    maxArrivals: "عدد مواعيد الوصول المعروضة لكل محطة",
    showScheduled: "أظهر المواعيد المجدولة",
    showScheduledHint:
      "عندما لا تتوفر بيانات آنية لمحطة، استخدم الجدول.",
    sectionNearby: "قربي",
    radius: "نصف قطر البحث",
    radiusHint: "يسري أيضاً على أنصاف الأقطار السريعة في خريطة المحطات القريبة.",
    sectionAppearance: "المظهر",
    themeLegend: "السمة",
    themeSystem: "النظام",
    themeLight: "فاتح",
    themeDark: "داكن",
    sectionLanguage: "اللغة",
    languageLegend: "لغة الواجهة",
    languageSystem: "النظام",
    languageHint: (resolved: string): string =>
      `مع «النظام» نتبع لغة المتصفح: وهي الآن ${resolved}.`,
    sectionBackup: "نسخة احتياطية من المفضلة",
    backupIntro:
      "ملف JSON على جهازك: بما أنه لا حساب هنا، فهذه طريقة نقل المفضلة إلى متصفح آخر.",
    exportCount: (count: number): string => `تصدير (${count})`,
    importFromFile: "استيراد من ملف",
    exported: (count: number): string => `صُدِّرت ${count} مفضلة.`,
    exportFailed: "لم ينجح التصدير على هذا المتصفح.",
    fileTooLarge: "الملف أكبر من أن يكون نسخة احتياطية للمفضلة.",
    fileUnreadable: "تعذّرت قراءة الملف.",
    importEmpty: "الملف فارغ.",
    importNotJson: "الملف ليس JSON صالحاً.",
    importNoList: "الملف لا يحتوي على قائمة مفضلة.",
    importNoneValid: "لم يُعثر على أي مفضلة صالحة في الملف.",
    importFound: (count: number): string => `عُثر على ${count} مفضلة صالحة`,
    importSkipped: (count: number): string => `، واستُبعد ${count} مدخلاً.`,
    importFoundEnd: ".",
    importMerge: "دمج",
    importReplace: "استبدال",
    replaced: (count: number): string => `استُبدلت المفضلة: صارت الآن ${count}.`,
    mergedNone: "لا مفضلة جديدة لإضافتها.",
    merged: (count: number): string => `أُضيفت ${count} مفضلة.`,
    sectionLocalData: "البيانات المحلية",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} مفضلة، و${recents} محطة في السجل.`,
    confirmClearFavorites: "حذف كل المفضلة؟ لا يمكن التراجع عن هذه العملية.",
    confirmClearFavoritesYes: "نعم، أفرغها",
    clearFavorites: "تفريغ المفضلة",
    favoritesCleared: "أُفرغت المفضلة.",
    confirmClearRecents: "حذف سجل المحطات التي شوهدت؟",
    confirmClearRecentsYes: "نعم، احذف",
    clearRecents: "حذف السجل",
    recentsCleared: "حُذف السجل.",
    resetDefaults: "استعادة الإعدادات الافتراضية",
    settingsReset: "أُعيدت الإعدادات إلى القيم الافتراضية.",
    infoLink: "معلومات ومصادر البيانات وأسئلة شائعة",
  },

  sync: {
    titleFull: "مزامنة الأجهزة",
    titleCollapsed: "المزامنة",
    badgeOn: "مفعّلة",
    summaryLoading: "…",
    summaryUnavailable: "غير متاحة على هذا الاتصال",
    summaryOff: "غير مفعّلة",
    summarySyncing: "المزامنة جارية…",
    summaryError: "خطأ في المزامنة",
    summaryConflict: "هناك تعارض يحتاج حلاً",
    summaryOn: (last: string): string => `مفعّلة · آخر مرة ${last}`,
    intro:
      "انقل المفضلة والمحطات الأخيرة والإعدادات إلى جهاز آخر برمز واحد. تُشفَّر البيانات هنا: الخادم يحتفظ ببيانات غير قابلة للقراءة فقط.",
    enable: "تفعيل المزامنة",
    haveCode: "لديّ رمز بالفعل",
    codeLabel: "رمز المزامنة",
    codeHint:
      "20 حرفاً، كما تقرأها على الجهاز الآخر. حالة الأحرف والشرطات والمسافات لا تهم.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} حرفاً`,
    join: "اتصال",
    onIntro:
      "تُشفَّر البيانات على هذا الجهاز قبل أن تغادره. من يملك الرمز يستطيع قراءة كل مفضلتك: استخدمه على أجهزتك وحدها.",
    code: "الرمز",
    showCode: "إظهار الرمز",
    hideCode: "إخفاء الرمز",
    copyCode: "نسخ الرمز",
    copied: "نُسخ",
    lastSync: "آخر مزامنة:",
    inProgress: " · جارية…",
    syncNow: "زامن الآن",
    disconnect: "قطع الاتصال",
    disconnectNote:
      "عند قطع الاتصال تبقى البيانات على هذا الجهاز، وتبقى النسخة المشفّرة على الخادم حتى تحذفها.",
    deleteWarning:
      "يحذف النسخة المشفّرة من الخادم. لن تجد الأجهزة الأخرى ما تزامنه. لا يمكن التراجع.",
    deleteConfirm: "احذف فعلاً",
    deleteRemote: "حذف البيانات من الخادم",
    justNow: "الآن",
    minutesAgo: (minutes: number): string => `قبل ${minutes} د`,
    atClock: (clock: string): string => `في ${clock}`,
    errors: {
      aborted: "أُلغيت العملية.",
      generic: "لم تنجح المزامنة. أعد المحاولة بعد قليل.",
      insecureContext:
        "تحتاج المزامنة إلى اتصال آمن: افتح الموقع عبر https (أو على localhost). على http العادي تعطّل المتصفحات التشفير، فلا يمكن تشفير أي شيء على هذا الجهاز.",
      noBase64Encode: "هذا المتصفح لا يستطيع ترميز بيانات المزامنة.",
      noBase64Decode: "هذا المتصفح لا يستطيع فكّ ترميز بيانات المزامنة.",
      invalidSyncData: (what: string): string => `بيانات المزامنة غير صالحة (${what}).`,
      codeRequired: "أدخل رمز المزامنة.",
      codeTooLong: (max: number): string => `الرمز طويل جداً: يجب أن يكون ${max} حرفاً.`,
      codeInvalidChars: (chars: string): string =>
        `الرمز يحتوي على حروف غير مسموح بها: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `طول الرمز ${required} حرفاً، وقد أدخلت ${actual}.`,
      keyDerivationFailed: "هذا المتصفح لا يستطيع اشتقاق مفاتيح المزامنة.",
      preparePayloadFailed: "تعذّر تجهيز البيانات المراد مزامنتها.",
      encryptFailed: "تعذّر تشفير البيانات على هذا الجهاز.",
      decryptFailed: "الرمز لا يطابق هذه البيانات، أو أن البيانات على الخادم تالفة.",
      invalidSyncId: "معرّف المزامنة غير صالح.",
      responseTooLarge: "أرسل الخادم بيانات أكثر من اللازم.",
      timeout: "لم يردّ الخادم في الوقت المحدد.",
      unreachable: "تعذّر الوصول إلى الخادم. تحقق من الاتصال.",
      invalidResponse: "رد الخادم غير صالح.",
      invalidResponseField: (what: string): string => `رد الخادم غير صالح (${what}).`,
      unexpectedFormat: "ردّ الخادم بصيغة غير متوقعة.",
      rateLimited: "مزامنات كثيرة متتالية. أعد المحاولة بعد دقيقة.",
      pullRejected: (status: number): string => `رفض الخادم القراءة (خطأ ${status}).`,
      payloadTooLarge: "البيانات أكثر من أن تُزامن.",
      pushRejected: (status: number): string => `رفض الخادم الحفظ (خطأ ${status}).`,
      deleteRejected: (status: number): string => `رفض الخادم الحذف (خطأ ${status}).`,
      conflict:
        "جهاز آخر يكتب في البيانات نفسها الآن. بياناتك المحلية بأمان: أعد المحاولة بعد ثوانٍ.",
    },
    status: {
      deleted: "حُذفت البيانات من الخادم. لم يعد هذا الجهاز يزامن.",
      disconnected:
        "المزامنة غير مفعّلة على هذا الجهاز. تبقى بياناتك هنا وتبقى النسخة المشفّرة على الخادم حتى تحذفها.",
    },
  },

  info: {
    title: "معلومات",
    subtitle:
      "جداول ومواعيد وصول النقل العام في روما، من البيانات المفتوحة الرسمية.",
    unofficialTitle: "تطبيق غير رسمي",
    unofficialBody:
      "هذا الموقع غير تابع لـ ATAC S.p.A. أو Roma Servizi per la Mobilità أو Roma Capitale، وغير مرتبط بها ولا مُرخَّص أو مدعوم منها بأي شكل. إنه مشروع مستقل يكتفي بقراءة البيانات المفتوحة التي تنشرها هذه الجهات. للمعلومات الرسمية والتذاكر والشكاوى راجع قنواتها.",
    whatTitle: "ما هذا",
    whatBody1:
      "تطبيق ويب لتعرف بعد كم تمر المركبة القادمة في المحطة التي تقف فيها. تبحث عن محطة أو خط، تحفظه في المفضلة، فتجده في الصفحة الرئيسية مع مواعيد وصول محدَّثة. لا حساب ولا إعلانات ولا إحصاءات استخدام.",
    whatBody2:
      "عندما يغطي البث الآني الرحلة، يكون الوقت المعروض توقعاً مبنياً على موقع المركبة. وإلا يعود التطبيق إلى الموعد المجدول ويخبرك بذلك دائماً، بدل أن يمرّر بيانات قديمة على أنها توقع.",
    dataTitle: "من أين تأتي البيانات",
    dataBodyBefore:
      "الجداول والمحطات والخطوط والمسارات ومواقع المركبات وتنبيهات الخدمة تأتي من البيانات المفتوحة لـ ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (بثّا GTFS وGTFS-Realtime). تُحدَّث المواعيد المجدولة يومياً، والبيانات الآنية كل 30 ثانية تقريباً.",
    dataLink: "romamobilita.it — بيانات مفتوحة",
    dataLicence:
      "تبقى البيانات ملكاً لأصحابها وتُستخدم وفق شروط الرخصة التي نُشرت بها.",
    privacyTitle: "الخصوصية",
    privacyBody:
      "لا يوجد تسجيل دخول ولا ملف مستخدم. المفضلة والمحطات التي شوهدت مؤخراً والإعدادات محفوظة في متصفحك وحده ولا تُرسل إلى أي مكان. أما الموقع، إن سمحت به للبحث عن المحطات القريبة، فيبقى في الجهاز: يُستخدم لحساب المسافات ولا يُخزَّن.",
    faqTitle: "أسئلة شائعة",
    faq1Q: "لماذا لا يظهر خط أو حافلة؟",
    faq1A:
      "نعرض فقط ما هو موجود في البثوث الرسمية. إذا لم ترسل مركبة موقعها، أو لم تكن رحلتها في البث الآني، فهي بالنسبة لنا غير موجودة: أقصى ما ستراه هو الموعد المجدول. يحدث هذا كثيراً مع الرحلات البديلة وحافلات النقل المكوكي والمركبات المعطّل جهاز تتبعها.",
    faq2Q: "لماذا تختلف المواعيد عمّا هو مكتوب في المحطة؟",
    faq2A:
      "اللوحة على العمود تذكر الموعد المجدول، وهو يتغير بضع مرات في السنة. هنا، حين ترسل المركبة بياناتها، ترى توقعاً محسوباً على موقعها الحقيقي، يأخذ الازدحام والتأخير في الحسبان. أما حين تقرأ «مجدول» فلا يوجد توقع ونعرض الموعد نفسه المكتوب على اللوحة.",
    faq3Q: "ماذا يحدث ليلاً؟",
    faq3A:
      "ليلاً يكون البث الآني شبه فارغ، لأن المركبات العاملة قليلة. يواصل التطبيق العمل بالمواعيد المجدولة للخطوط الليلية. في GTFS لا ينتهي يوم الخدمة عند منتصف الليل بل عند الساعة 04:00: رحلة الواحدة ليلاً تنتمي إلى اليوم السابق، ولهذا قد ترى مواعيد مثل 25:30 مترجمة إلى 01:30.",
    faq4Q: "هل تنتهي مفضلتي على خادم؟",
    faq4A:
      "لا. المفضلة والسجل والإعدادات موجودة في localStorage الخاص بالمتصفح. إن مسحت بيانات الموقع أو غيّرت الجهاز فستختفي: من الإعدادات يمكنك تصديرها إلى ملف JSON واستيرادها في مكان آخر.",
    settingsLink: "اذهب إلى الإعدادات",
  },

  footer: {
    dataPrefix: "بيانات الخدمة والجداول: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (بيانات GTFS المفتوحة).",
    independent:
      "مشروع مستقل، غير تابع لـ ATAC ولا لـ Roma Servizi per la Mobilità. ",
    infoLink: "معلومات",
  },

  errors: {
    genericTitle: "حدث خلل ما",
    unexpected: "خطأ غير متوقع",
    unexpectedDot: "خطأ غير متوقع.",
    stopNotFound: "لم يُعثر على المحطة",
    serviceDown: "الخدمة لا تستجيب",
    requestFailed: (status: number): string => `لم ينجح الطلب (${status})`,
    httpStatus: (status: number): string => `خطأ ${status}`,
    badResponse: "رد الخادم غير صالح",
    badResponseDot: "رد الخادم غير صالح.",
    timedOut: "انتهت مهلة الطلب",
    timedOutDot: "انتهت مهلة الطلب.",
    offline: "لا اتصال",
    connectionFailed: "لم ينجح الاتصال.",
    tooManyRequests: "طلبات كثيرة جداً",
    badRequest: "معطيات غير صالحة",
    lineNotFound: "لم يُعثر على الخط",
    journeyOriginNotFound: "لم يُعثر على نقطة الانطلاق",
    journeyDestinationNotFound: "لم يُعثر على الوجهة",
    journeyPlaceHint: "جرّب عنواناً أدقّ.",
  },

  notFound: {
    kicker: "خطأ 404",
    title: "محطة غير مخدومة",
    body:
      "هذه الصفحة غير موجودة. قد يحدث ذلك مع رابط قديم، أو مع رمز محطة أو خط لم يعد في البث.",
    searchCta: "ابحث عن محطة",
    nearbyCta: "المحطات القريبة",
  },

  appError: {
    title: "توقفت الرحلة",
    body:
      "لم تنجح هذه الشاشة في التحميل. أعد المحاولة: إن بقيت المشكلة فالأرجح أن خدمة البيانات هي التي لا تستجيب.",
    digest: (digest: string): string => `الرمز: ${digest}`,
    backHome: "العودة إلى الرئيسية",
    globalTitle: "الخدمة متوقفة",
    globalBody:
      "توقف التطبيق بسبب خطأ غير متوقع. أعد تحميل الصفحة: مفضلتك محفوظة على الهاتف ولن تضيع.",
    reload: "إعادة التحميل",
  },

  format: {
    due: "على وشك الوصول",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "التاريخ غير متاح",
    minutes: (minutes: number): string => `${minutes} د`,
    metres: (metres: number): string => `${metres} م`,
    kilometres: (value: string): string => `${value} كم`,
    ageUnknown: "وقت التحديث غير معروف",
    ageSeconds: (seconds: number): string => `حُدِّث قبل ${seconds} ث`,
    ageMinutes: (minutes: number): string => `حُدِّث قبل ${minutes} د`,
    ageAt: (clock: string): string => `حُدِّث في ${clock}`,
    onTime: "في موعده",
    delayLate: (minutes: number): string => `+${minutes} د`,
    delayEarly: (minutes: number): string => `${minutes} د`,
  },

  meta: {
    appTitle: "BusFinder — مواعيد المغادرة الآنية",
    appDescription:
      "مواعيد الحافلات والترام والمترو في روما لحظة بلحظة. محطات مفضلة ومحطات قريبة وتنبيهات الخدمة، بلا حساب وبلا إعلانات.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "أقرب محطات ATAC إليك، مع خريطة والخطوط التي تمر بها.",
    journeyDescription:
      "احسب كيف تنتقل من مكان إلى آخر في روما بالحافلة والترام والمترو، وفق جداول ATAC الرسمية.",
    alertsDescription: "التحويلات وتوقّف الخدمة وتغييراتها كما تُنشر في البث الرسمي.",
    settingsDescription: "تحديث مواعيد الوصول ونطاق البحث والمظهر وإدارة ما حفظته.",
    infoDescription:
      "ما هذا التطبيق، ومن أين تأتي البيانات، ولماذا هو غير تابع لـ ATAC أو Roma Servizi per la Mobilità.",
    stopDescription: "مواعيد المغادرة الآنية والجدول المقرر للمحطة.",
    lineDescription: "المسار والمحطات والمركبات الآنية للخط.",
  },

  skeleton: {
    loading: "جارٍ التحميل",
  },
};

const EFFECT_AR: Record<string, string | undefined> = {
  NO_SERVICE: "الخدمة متوقفة",
  REDUCED_SERVICE: "خدمة مخفّضة",
  SIGNIFICANT_DELAYS: "تأخيرات كبيرة",
  DETOUR: "تحويل",
  ADDITIONAL_SERVICE: "خدمة إضافية",
  MODIFIED_SERVICE: "خدمة معدَّلة",
  STOP_MOVED: "نُقلت المحطة",
  NO_EFFECT: "لا أثر على الخدمة",
  ACCESSIBILITY_ISSUE: "مشكلة في إمكانية الوصول",
  OTHER_EFFECT: "أخرى",
  UNKNOWN_EFFECT: "الأثر غير محدد",
};

const CAUSE_AR: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "عطل فني",
  STRIKE: "إضراب",
  DEMONSTRATION: "مظاهرة",
  ACCIDENT: "حادث",
  HOLIDAY: "عطلة رسمية",
  WEATHER: "سوء الأحوال الجوية",
  MAINTENANCE: "صيانة",
  CONSTRUCTION: "أشغال",
  POLICE_ACTIVITY: "تدخل الشرطة",
  MEDICAL_EMERGENCY: "حالة طبية طارئة",
  OTHER_CAUSE: "سبب آخر",
  UNKNOWN_CAUSE: "السبب غير محدد",
};
