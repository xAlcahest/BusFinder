/**
 * Ukrainian dictionary. Shape and key order follow it.ts, the source of truth.
 * Ukrainian has one/few/many, so the plurals go through CLDR.
 */

import type { Dictionary } from "./it";
import { pluralRules } from "./plural";

const { pick, count: n } = pluralRules("uk");

export const uk: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, головна",
  },

  a11y: {
    skipToContent: "Перейти до вмісту",
  },

  common: {
    retry: "Спробувати ще раз",
    cancel: "Скасувати",
    save: "Зберегти",
    close: "Закрити",
    home: "Головна",
    back: "Назад",
    all: "Усі",
    loading: "Завантаження…",
    searching: "Пошук…",
    refresh: "Оновити",
    dash: "—",
    minutesShort: "хв",
    clearSearch: "Очистити пошук",
    searchInProgress: "Триває пошук",
  },

  nav: {
    primary: "Основна навігація",
    sidebar: "Бічна панель",
    sidebarNav: "Бічна навігація",
    openMenu: "Відкрити меню",
    closeMenu: "Закрити меню",
    sections: "Розділи",
    shortcuts: "Швидкі посилання",
    infoAria: "Відомості про застосунок",
    home: "Головна",
    nearbyShort: "Поруч",
    nearby: "Зупинки поруч",
    journey: "Маршрут",
    alerts: "Повідомлення",
    settings: "Налаштування",
    info: "Інфо",
    hintNearby: "Що ходить поблизу",
    hintJourney: "З точки в точку",
    hintAlerts: "Об'їзди та перебої",
    hintSettings: "Оновлення, тема, дані",
    hintInfo: "Джерела та правова інформація",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "трамвай";
        case 1:
          return "метро";
        case 2:
          return "потяг";
        case 4:
          return "пором";
        default:
          return "автобус";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Трамвай";
        case 1:
          return "Метро";
        case 2:
          return "Потяг";
        case 3:
          return "Автобус";
        default:
          return "Маршрут";
      }
    },
    named: (name: string): string => `Маршрут ${name}`,
    namedAria: (name: string): string => `Маршрут ${name}`,
    details: "подробиці",
    towards: (headsign: string): string => `у бік ${headsign}`,
    towardsCapital: (headsign: string): string => `У бік ${headsign}`,
    direction: "Напрямок",
    terminus: "кінцева",
    noHeadsign: "Пункт призначення не вказано",
  },

  stops: {
    code: (code: string): string => `Зупинка ${code}`,
    codeOnly: "Зупинка",
    pole: (code: string): string => `Стовп ${code}`,
    accessible: "Доступна зупинка",
    named: (name: string): string => `Зупинка ${name}`,
    countLabel: (count: number): string =>
      n(count, { one: "зупинка", few: "зупинки", other: "зупинок" }),
    involved: (count: number): string =>
      n(count, {
        one: "зупинка, якої це стосується",
        few: "зупинки, яких це стосується",
        other: "зупинок, яких це стосується",
      }),
  },

  home: {
    kicker: "Рим · громадський транспорт",
    title: "Коли приїде?",
    intro:
      "Знайдіть зупинку за номером або назвою, чи маршрут. Прибуття беруться з римського потоку даних у реальному часі.",
  },

  search: {
    inputAria: "Пошук зупинки або маршруту",
    placeholder: "Зупинка, вулиця або маршрут",
    searchingFor: (query: string): string => `Шукаю «${query}»…`,
    noResultsFor: (query: string): string => `Нічого не знайдено за запитом «${query}»`,
    noResultsHint:
      "Спробуйте номер зупинки (наприклад 70101), назву вулиці або номер маршруту.",
    resultsList: "Результати пошуку",
    keyboardHint: "↑ ↓ щоб гортати, Enter щоб відкрити, Esc щоб закрити",
  },

  favorites: {
    heading: "Обране",
    emptyTitle: "Поки нічого в обраному",
    emptyHint:
      "Натисніть на зірочку ★ біля зупинки або маршруту: у пошуку, у розділі «Зупинки поруч», на сторінці зупинки чи маршруту. Ви знайдете їх тут, не шукаючи щоразу.",
    reorder: "Змінити порядок",
    reorderDone: "Готово",
    reorderHint: "Переміщуйте зупинки стрілками. Порядок діє на цьому пристрої.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: позиція ${position} з ${total}.`,
    moveUp: (name: string): string => `Перемістити ${name} вгору`,
    moveDown: (name: string): string => `Перемістити ${name} вниз`,
    addStar: (name: string): string => `Додати зірочку зупинці ${name}`,
    removeStar: (name: string): string => `Прибрати зірочку із зупинки ${name}`,
    addStarLine: (name: string): string => `Додати зірочку маршруту ${name}`,
    removeStarLine: (name: string): string => `Прибрати зірочку з маршруту ${name}`,
    starredTitle: "Із зірочкою: в обраному",
    starTitle: "Додати зірочку",
    starredLabel: "Із зірочкою",
    starLabel: "Зірочка",
    editLabels: (name: string): string => `Змінити назву та маршрути для ${name}`,
    onlyLines: (labels: string): string => `лише ${labels}`,
    notUpdated: "не оновлено",
    noArrivalsOnPinned: "Немає прибуттів за вибраними маршрутами.",
    changeLines: "Змінити маршрути",
    noArrivalsSoon: "Найближчими хвилинами прибуттів немає.",
    openForTimes: "Відкрити розклад",
    vehiclesUnavailable: "Машини недоступні",
    lookingForVehicles: "Шукаю машини на лінії…",
    noVehiclesNow: "Зараз жодної машини на лінії",
    vehiclesInService: (count: number): string =>
      `${n(count, { one: "машина", few: "машини", other: "машин" })} зараз на лінії`,
    refreshArrivals: "Оновити прибуття",
    undoRemovedStop: "Зупинка без зірочки: її більше немає в обраному.",
    undoRemovedLine: "Маршрут без зірочки: його більше немає в обраному.",
    undoDismiss: "Закрити сповіщення",
    more: (count: number): string => `Ще ${count} в обраному`,
    sidebarEmptyBefore: "Натисніть на зірочку біля зупинки або маршруту, у пошуку, у ",
    sidebarEmptyAfter: " чи на сторінці, яку ви дивитеся. Ви знайдете їх тут.",
    nextDeparture: "найближче прибуття",
    noDeparture: "прибуттів немає",
    notAvailableShort: "н/д",
  },

  recents: {
    heading: "Нещодавно переглянуті",
    clear: "Очистити",
    emptyTitle: "Нещодавніх зупинок немає",
    emptyHint:
      "Зупинки, які ви відкриваєте, залишаються тут на кілька днів, щоб не шукати їх знову.",
    listAria: "Нещодавно переглянуті зупинки",
    justNow: "щойно",
    today: "сьогодні",
    yesterday: "учора",
  },

  arrivals: {
    due: "під'їжджає",
    live: "у реальному часі",
    scheduled: "за розкладом",
    scheduledTail: " за розкладом",
    scheduledSr: "час за розкладом",
    onTime: "вчасно",
    lateBy: (minutes: number): string => `+${minutes} хв`,
    earlyBy: (minutes: number): string => `−${minutes} хв`,
    lateSuffix: "запізнення",
    earlySuffix: "раніше",
    lateSr: (minutes: number): string =>
      `запізнення ${n(minutes, { one: "хвилина", few: "хвилини", other: "хвилин" })}`,
    earlySr: (minutes: number): string =>
      `на ${n(minutes, { one: "хвилину", few: "хвилини", other: "хвилин" })} раніше`,
    skipped: "скасовано",
    skippedSr: "рейс скасовано",
    atClock: (clock: string): string => `о ${clock}`,
    towardsSr: (headsign: string): string => `напрямок ${headsign}`,
    loadingAria: "Завантаження прибуттів",
    emptyTitle: "Прибуттів не очікується",
    emptyHint:
      "Жоден рейс не наближається. Подивіться розклад або спробуйте трохи пізніше.",
    frozenUnknown: "прогноз не оновлюється",
    frozenFor: (minutes: number): string => `стоїть ${minutes} хв`,
    frozenPrefix: (state: string): string => `прогноз ${state}`,
    frozenSr: (state: string): string => `прогноз ${state}, не оновлюється в реальному часі`,
    expectedSr: (relative: string, clock: string): string => `очікується ${relative}, о ${clock}`,
    bannerNoRealtimeStrong: "Реальний час недоступний.",
    bannerNoRealtime:
      " Показуємо розклад: машини можуть приїхати раніше або пізніше.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Реальний час зупинився." : `Реальний час стоїть ${minutes} хв.`,
    bannerFrozenBefore: " Прогнози нижче взяті",
    bannerFrozenLastUpdate: " з останнього оновлення",
    bannerFrozenAt: (clock: string): string => ` о ${clock}`,
    bannerFrozenAfter: " і не оновлюються: ставтеся до них обережно.",
    bannerPartialStrong: "Реальний час частково.",
    bannerPartial: " Частина даних не надійшла: деяких рейсів може бракувати.",
    showOnMap: (line: string): string => `Показати на карті машину маршруту ${line}`,
    hideOnMap: (line: string): string => `Прибрати виділення машини маршруту ${line}`,
  },

  dataAge: {
    prefix: "Оновлено",
    now: "зараз",
    secondsAgo: (seconds: number): string => `${seconds} с тому`,
    minutesAgo: (minutes: number): string => `${minutes} хв тому`,
    atClock: (clock: string): string => `о ${clock}`,
    never: "ніколи",
  },

  refreshFeedback: {
    updated: "Оновлено",
    unchanged: "Перевірено, нічого нового",
    failed: "Не вдалося оновити",
    updatedShort: "Оновлено",
    unchangedShort: "Нічого нового",
    failedShort: "Не оновлено",
    busy: "Оновлення…",
    busySpoken: "Триває оновлення",
  },

  stop: {
    tabArrivals: "Прибуття",
    tabTimetable: "Розклад",
    tabsAria: "Вигляд зупинки",
    editTag: "Змінити назву",
    addTag: "Назва",
    map: "Карта",
    realtimePrefix: "Реальний час",
    noRealtime: "Даних у реальному часі немає",
    pageNotUpdated: "Сторінку ще не оновлено",
    pageUpdatedAt: (clock: string): string => `Сторінку оновлено о ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Ви бачите останні отримані дані.`,
    arrivalsUnavailable: "Прибуття недоступні",
    emptyHint:
      "Зараз жоден рейс не наближається. Відкрийте розклад, щоб дізнатися, коли очікується наступне прибуття.",
    seeTimetable: "Дивитися розклад",
    linesHere: "Маршрути, що зупиняються тут",
  },

  tagDialog: {
    titleFavorite: "Обране",
    titleTag: "Назва зупинки",
    label: "Як ви її називаєте",
    placeholder: "Дім, робота, спортзал…",
    hint: (maxChars: number): string =>
      `Лише для вас: залишається на цьому пристрої, не більше ${maxChars} символів.`,
    linesLegend: "Які маршрути показувати",
    linesNone: "Нічого не вибрано: картка показує всі маршрути.",
    linesSome: (count: number): string =>
      `Лише ${n(count, { one: "маршрут", few: "маршрути", other: "маршрутів" })} на картці.`,
    showAllLines: "Показати всі маршрути",
    removeTag: "Прибрати назву",
  },

  timetable: {
    previousDay: "Попередній день",
    nextDay: "Наступний день",
    today: "сьогодні",
    scheduled: "розклад",
    jumpToNow: "Перейти до поточного часу",
    backToToday: "Повернутися до сьогодні",
    fromServiceStart: "Від початку руху",
    unavailableTitle: "Розклад недоступний",
    partialError: (error: string): string => `${error}. Ви бачите вже завантажені рейси.`,
    emptyTitle: "Далі рейсів немає",
    emptyFromNow:
      "Від цього часу прибуттів більше немає. Спробуйте від початку руху, інший день, або зніміть фільтр за маршрутом.",
    emptyWholeDay:
      "У цей день не заплановано жодного прибуття: спробуйте попередній або наступний день, чи зніміть фільтр за маршрутом.",
    loadMore: "Показати ще рейси",
    loadingMore: "Завантаження…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${n(count, { one: "рейс", few: "рейси", other: "рейсів" })} з ${from} до ${to}` +
      (complete ? ", до кінця руху" : "") +
      ". Це офіційний розклад дня руху, без реального часу.",
  },

  map: {
    fallbackAria: "Карта",
    vehiclesHeading: "Машини на карті",
    show: "Показати",
    hide: "Сховати",
    modeGroup: "Які машини показувати",
    modeApproaching: "Їдуть сюди",
    modeAllLines: "Усі маршрути",
    loadingStop: "Завантажую положення зупинки…",
    stopMapAria: (stopName: string): string => `Карта машин на зупинці ${stopName}`,
    centreOnStop: "Центрувати на зупинці",
    nearbyVehicles: "Машини поблизу",
    allVehicles: "Усі, навіть далекі",
    loadingVehicles: "Завантажую машини…",
    noneApproaching: "Жодна машина не наближається",
    approachingCount: (count: number): string =>
      n(count, {
        one: "машина в дорозі",
        few: "машини в дорозі",
        other: "машин у дорозі",
      }),
    onTheseLines: (count: number): string =>
      `${n(count, { one: "машина", few: "машини", other: "машин" })} на маршрутах цієї зупинки`,
    positionsAt: (clock: string): string => `положення на ${clock}`,
    positionsStale: "положення не оновлені",
    allLinesNote:
      "Яскраві машини їдуть до цієї зупинки, бліді йдуть тими самими маршрутами, але зараз тут не проїжджають.",
    approachingList: "Машини в дорозі",
    hereIn: (relative: string): string => `Тут ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Тут ${relative}, о ${clock}`,
    notInbound: "Іде цим маршрутом, але не до цієї зупинки",
    noBearing: " · напрямок не передано",
    follow: "Я в цій машині, стежити за нею",
    unfollow: "Перестати стежити",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Маршрут ${line}, тут ${relative}${followed ? ", ви стежите за нею" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Маршрут ${line}, на лінії, але не до цієї зупинки${followed ? ", ви стежите за нею" : ""}`,
    yourPosition: "Ваше положення",
    vehicleTitle: (vehicleId: string): string => `Машина ${vehicleId}`,
    showOnMap: (stopName: string): string => `Показати ${stopName} на карті`,
    divertedSuffix: " · поза маршрутом",
    divertedBadge: "Поза маршрутом",
    divertedNote: "Їде не запланованим шляхом.",
  },

  follow: {
    headlineLive: "Стежу за цією машиною",
    headlinePaused: "Стеження призупинено",
    headlineStale: "Положення не змінюється",
    headlineLost: "Машина більше не на лінії",
    detailLive: "Карта залишається на ній під час кожного оновлення.",
    detailPaused:
      "Ви зсунули карту, тому я її більше не рухаю. Натисніть «Продовжити», щоб повернутися до машини.",
    detailStaleUnknown: "Машина вже деякий час не передає своє положення.",
    detailStale: (age: string): string =>
      `Машина не передає дані вже ${age}: на карті її остання відома точка.`,
    detailLost:
      "Її положення більше не надходить. Можливо, рейс завершено або машина зійшла з лінії.",
    ageMinutes: (minutes: number): string =>
      n(minutes, { one: "хвилина", few: "хвилини", other: "хвилин" }),
    ageHours: (hours: number): string =>
      n(hours, { one: "година", few: "години", other: "годин" }),
    compact: "Стежу",
    compactSr: (line: string): string => ` за маршрутом ${line}`,
    lineSr: (line: string): string => `, маршрут ${line}`,
    resume: "Продовжити",
    exit: "Вийти",
    close: "Закрити",
    lostHint: "Якщо вона ще в дорозі, знайдете її, перемкнувшись на «Усі маршрути».",
  },

  nearby: {
    title: "Зупинки поруч",
    mapAria: "Карта зупинок поруч",
    searchHere: "Шукати в цій зоні",
    radius: "Радіус",
    locating: "Визначаю положення…",
    myPosition: "Моє положення",
    geoDenied:
      "Доступ до геолокації заборонено. Показуємо центр Рима: зсуньте карту й шукайте в потрібній зоні.",
    geoUnavailable:
      "Положення зараз недоступне. Показуємо центр Рима: зсуньте карту й шукайте в потрібній зоні.",
    geoTimeout:
      "Визначення положення тривало надто довго. Показуємо центр Рима: зсуньте карту й спробуйте ще раз.",
    geoUnsupported:
      "Цей браузер не підтримує геолокацію. Зсуньте карту, щоб знайти зупинки.",
    outsideRome: "Ви за межами Рима: показуємо центр міста.",
    outsideCoverage: "Ця зона поза покриттям. Зсуньте карту на Рим.",
    focusStopMissing: "Запитану зупинку не знайдено: показуємо вашу зону.",
    focusStopFailed: (error: string): string => `Запитану зупинку не завантажено (${error}).`,
    stopsFailed: (error: string): string => `Зупинки не завантажено: ${error}`,
    loadingStops: "Шукаю зупинки…",
    noStopsInRadius: (radius: string): string =>
      `У радіусі ${radius} зупинок немає. Спробуйте збільшити радіус або зсунути карту.`,
    onMapCap: (max: number): string => ` (перші ${max} на карті)`,
    noLines: "Маршрутів немає",
    arrivalsLink: "Прибуття",
    showMoreStops: "Показати ще зупинки",
  },

  line: {
    loading: "Завантажую маршрут…",
    loadFailed: (error: string): string => `Маршрут не завантажено: ${error}`,
    mapAria: (name: string): string => `Карта маршруту ${name}`,
    dataAt: (clock: string): string => `дані на ${clock}`,
    updatedAt: (clock: string): string => `оновлено о ${clock}`,
    vehiclesStale: (error: string): string => `Машини не оновлені: ${error}`,
    noPathForDirection: "Траса для цього напрямку недоступна",
    stopsHeading: (count: number): string => `Зупинки (${count})`,
    noStopsForDirection: "Для цього напрямку зупинок немає.",
    showAllStops: "Показати всі зупинки",
  },

  lineService: {
    inService: (count: number): string =>
      `${n(count, { one: "машина", few: "машини", other: "машин" })} на лінії`,
    loadingVehicles: "Завантажую машини…",
    checkingTimetable: "Перевіряю розклад…",
    feedDownTitle: "Положення в реальному часі недоступні",
    feedDownDetail:
      "Рух може бути звичайним: нам не вдається зчитати положення машин.",
    noneReporting: "Жодна машина не передає своє положення",
    unknownDetail:
      "Це не означає, що маршрут не працює: розклад є на сторінці зупинки.",
    scheduledDetail: (count: number): string =>
      `Рух заплановано: ${n(count, { one: "рейс", few: "рейси", other: "рейсів" })} до кінця дня.`,
    finishedTitle: "Рух на сьогодні завершено",
    finishedDetail: (count: number, clock: string): string =>
      `Сьогодні ${n(count, { one: "рейс за розкладом", few: "рейси за розкладом", other: "рейсів за розкладом" })}, останній о ${clock}.`,
    noneTodayTitle: "Сьогодні рейсів за розкладом немає",
    noneTodayDetail: "На цьому маршруті сьогодні немає рейсів за розкладом.",
    noneTodayFrom: (stopName: string): string =>
      `Від зупинки ${stopName} сьогодні немає рейсів за розкладом.`,
    nextDepartures: "Найближчі відправлення",
    nextDeparturesFrom: (stopName: string): string => ` від зупинки ${stopName}`,
    scheduledOnly: "Розклад, без реального часу.",
  },

  journey: {
    title: "Маршрут",
    subtitle: "З точки в точку по Риму автобусом, трамваєм і метро.",
    from: "Звідки",
    to: "Куди",
    placeholder: "Зупинка, адреса або місце",
    swap: "Поміняти місцями",
    whenLegend: "Коли",
    now: "Зараз",
    pickTime: "Вибрати час",
    timeLabel: "Дата й час відправлення",
    submit: "Знайти маршрут",
    resultsHeading: "Варіанти",
    emptyTitle: "Куди ви хочете поїхати?",
    emptyHint:
      "Вкажіть відправлення й прибуття: підберемо найкращий маршрут за офіційним розкладом.",
    searching: "Шукаю варіанти…",
    noResultsTitle: "Варіантів немає",
    noResultsHint:
      "Ми шукаємо лише прямі сполучення або з однією пересадкою. Спробуйте змінити точку відправлення чи час.",
    disclaimer:
      "Розклад, а не реальний час: фактичні затримки не враховуються. Пішохідні ділянки оцінені по прямій, тож реальна відстань вулицями більша.",
    searchedFrom: (when: string): string => ` Пошук починаючи з ${when}.`,
    mapAria: "Карта вибраного маршруту",
    mapCaption:
      "Ділянки на транспорті йдуть реальною трасою маршруту. Пунктирні оцінені по прямій: пішохідні пересадки та рідкісні маршрути без траси.",
    missingEndpoints: "Вкажіть і відправлення, і прибуття.",
    badDateTime: "Некоректні дата й час.",
    geoUnsupported: "Цей браузер не підтримує геолокацію.",
    geoUnavailable: "Положення зараз недоступне.",
    geoOutsideRome: "Ви за межами Рима: введіть адресу.",
    geoDenied: "Доступ до геолокації заборонено: введіть адресу.",
    geoTimeout: "Визначення положення тривало надто довго.",
    originMarker: (name: string): string => `Відправлення: ${name}`,
    destinationMarker: (name: string): string => `Прибуття: ${name}`,
    useMyPosition: "Використати моє положення",
    clearField: (label: string): string => `Очистити поле «${label.toLowerCase()}»`,
    suggestionsFor: (label: string): string => `Підказки для поля «${label.toLowerCase()}»`,
    placeStop: "Зупинка",
    placeCoord: "Координати",
    placeAddress: "Адреса",
    walkOnly: "Тільки пішки",
    walkOnlyShort: "пішки",
    noTransfers: "без пересадок",
    transfers: (count: number): string =>
      n(count, { one: "пересадка", few: "пересадки", other: "пересадок" }),
    walkDistance: (distance: string): string => `${distance} пішки`,
    walkLeg: (distance: string, duration: string): string =>
      `Пішки ${distance}, приблизно ${duration} до `,
    inService: "на лінії",
    stopCount: (count: number): string =>
      n(count, { one: "зупинка", few: "зупинки", other: "зупинок" }),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Варіант ${index}: відправлення ${departure}, прибуття ${arrival}`,
    lineDetailsAria: (line: string): string => `Маршрут ${line}, подробиці`,
    hours: (hours: number): string => `${hours} год`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} год ${minutes}`,
    noticeNoOriginStops:
      "Від початкової точки немає зупинки в пішій досяжності: спробуйте адресу ближче до якогось маршруту.",
    noticeNoDestinationStops:
      "Від пункту призначення немає зупинки в пішій досяжності: спробуйте адресу ближче до якогось маршруту.",
    noticeNoConnection:
      "У найближчі години сполучення між цими двома районами не знайдено.",
    noticeWalkOnlyLeft:
      "У найближчі години в розкладі немає сполучення: залишається тільки пішки.",
    noticeLaterDepartures:
      "Найближчі півтори години рейсів немає: показуємо перші після цього.",
  },

  alerts: {
    title: "Повідомлення про рух",
    subtitle: "Об'їзди, скасування та зміни, опубліковані в офіційному потоці даних.",
    loading: "Завантаження…",
    degraded:
      "Потік у реальному часі не відповідає або застарів: ці повідомлення можуть бути неактуальними.",
    loadFailed: "Не вдалося завантажити повідомлення.",
    refreshFailed: (error: string): string =>
      `Останнє оновлення не вдалося (${error}): ви бачите попередній список.`,
    searchPlaceholder: "Пошук: страйк, об'їзд, вулиця…",
    searchAria: "Пошук серед повідомлень",
    filterByLine: "Фільтр за маршрутом",
    allLines: (count: number): string => `Усі маршрути (${count})`,
    networkWide: "Загальні повідомлення",
    clearFilters: "Скинути",
    noMatch: "Жодне повідомлення не підходить під фільтри.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${pick(shown, { one: "повідомлення", few: "повідомлення", other: "повідомлень" })} з ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${pick(count, { one: "активне повідомлення", few: "активні повідомлення", other: "активних повідомлень" })} на ${lines} маршрутах.`,
    goToLine: "Перейти до маршруту",
    noneTitle: "Активних повідомлень немає",
    noneHint:
      "Зараз потік не повідомляє про перебої чи зміни в русі. Перевірте ще раз перед виходом.",
    noResultsTitle: "Нічого не знайдено",
    noResultsHint:
      "Спробуйте менше слів або скиньте фільтри, щоб знову побачити всі повідомлення.",
    noSelectionTitle: "Повідомлення не вибрано",
    noSelectionHint: "Виберіть повідомлення зі списку ліворуч, щоб прочитати його повністю.",
    showMoreLines: (count: number): string => `Показати ще маршрути (${count})`,
    goToLineShort: "перейти до маршруту",
    fallbackHeader: "Повідомлення про рух",
    noDetail: "Перевізник не опублікував подробиць.",
    operatorLink: "Подробиці на сайті перевізника",
    affectedLines: "Маршрути, яких це стосується",
    alsoOn: "Також на",
    contextHeading: (count: number): string =>
      `${count} ${pick(count, { one: "активне повідомлення", few: "активні повідомлення", other: "активних повідомлень" })}`,
    contextAria: "Повідомлення про рух",
    contextAll: "Усі",
    contextUnavailable: (error: string): string => `Повідомлення недоступні: ${error}`,
    contextMore: (count: number): string => `Ще ${count} повідомлень на `,
    contextMoreLink: "сторінці повідомлень",
    contextStale: (error: string): string =>
      `Останнє оновлення не вдалося (${error}): ці повідомлення можуть бути неактуальними.`,
    windowBetween: (from: string, until: string): string => `З ${from} до ${until}`,
    windowFrom: (from: string): string => `З ${from}, без указаного терміну завершення`,
    windowUntil: (until: string): string => `До ${until}`,
    windowUnknown: "Період дії не вказано",
    effect: (code: string): string | null => EFFECT_UK[code] ?? null,
    cause: (code: string): string | null => CAUSE_UK[code] ?? null,
  },

  settings: {
    title: "Налаштування",
    subtitle: "Усе залишається на цьому пристрої. Ні акаунта, ні сервера.",
    sectionArrivals: "Прибуття",
    autoRefresh: "Автоматичне оновлення",
    everySeconds: (seconds: number): string => `кожні ${seconds} секунд`,
    autoRefreshHint: "Інтервал між двома читаннями потоку в реальному часі.",
    maxArrivals: "Скільки прибуттів показувати на зупинку",
    showScheduled: "Показувати розклад",
    showScheduledHint:
      "Коли для зупинки немає даних у реальному часі, використовувати розклад.",
    sectionNearby: "Поруч зі мною",
    radius: "Радіус пошуку",
    radiusHint: "Діє і для швидких радіусів на карті зупинок поруч.",
    sectionAppearance: "Оформлення",
    themeLegend: "Тема",
    themeSystem: "Системна",
    themeLight: "Світла",
    themeDark: "Темна",
    sectionLanguage: "Мова",
    languageLegend: "Мова інтерфейсу",
    languageSystem: "Системна",
    languageHint: (resolved: string): string =>
      `З «Системною» ми йдемо за мовою браузера: зараз це ${resolved}.`,
    sectionBackup: "Резервна копія обраного",
    backupIntro:
      "Файл JSON на вашому пристрої: так обране переноситься в інший браузер, адже акаунта тут немає.",
    exportCount: (count: number): string => `Експортувати (${count})`,
    importFromFile: "Імпортувати з файлу",
    exported: (count: number): string => `Експортовано ${count} записів обраного.`,
    exportFailed: "Експорт у цьому браузері не вдався.",
    fileTooLarge: "Файл завеликий для резервної копії обраного.",
    fileUnreadable: "Не вдалося прочитати файл.",
    importEmpty: "Файл порожній.",
    importNotJson: "Файл не є коректним JSON.",
    importNoList: "У файлі немає списку обраного.",
    importNoneValid: "У файлі не знайдено жодного коректного запису.",
    importFound: (count: number): string => `Знайдено ${count} коректних записів`,
    importSkipped: (count: number): string => `, відкинуто ${count} записів.`,
    importFoundEnd: ".",
    importMerge: "Об'єднати",
    importReplace: "Замінити",
    replaced: (count: number): string => `Обране замінено: тепер записів ${count}.`,
    mergedNone: "Нових записів для додавання немає.",
    merged: (count: number): string => `Додано ${count} записів.`,
    sectionLocalData: "Локальні дані",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} в обраному, ${recents} зупинок в історії.`,
    confirmClearFavorites: "Видалити все обране? Дію не можна скасувати.",
    confirmClearFavoritesYes: "Так, очистити",
    clearFavorites: "Очистити обране",
    favoritesCleared: "Обране очищено.",
    confirmClearRecents: "Видалити історію переглянутих зупинок?",
    confirmClearRecentsYes: "Так, видалити",
    clearRecents: "Видалити історію",
    recentsCleared: "Історію видалено.",
    resetDefaults: "Відновити налаштування за замовчуванням",
    settingsReset: "Налаштування повернуто до значень за замовчуванням.",
    infoLink: "Відомості, джерела даних і часті запитання",
  },

  sync: {
    titleFull: "Синхронізація пристроїв",
    titleCollapsed: "Синхронізація",
    badgeOn: "увімкнена",
    summaryLoading: "…",
    summaryUnavailable: "Недоступна на цьому з'єднанні",
    summaryOff: "Вимкнена",
    summarySyncing: "Триває синхронізація…",
    summaryError: "Помилка синхронізації",
    summaryConflict: "Є конфлікт",
    summaryOn: (last: string): string => `Увімкнена · остання ${last}`,
    intro:
      "Перенесіть обране, нещодавні та налаштування на інший пристрій за допомогою коду. Дані шифруються тут: на сервері зберігається лише нечитабельне.",
    enable: "Увімкнути синхронізацію",
    haveCode: "У мене вже є код",
    codeLabel: "Код синхронізації",
    codeHint:
      "20 символів, як ви їх бачите на іншому пристрої. Регістр, дефіси та пробіли не важливі.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} символів`,
    join: "Підключити",
    onIntro:
      "Дані шифруються на цьому пристрої перед відправленням. Хто має код, той прочитає все ваше обране: використовуйте його лише на своїх пристроях.",
    code: "Код",
    showCode: "Показати код",
    hideCode: "Сховати код",
    copyCode: "Скопіювати код",
    copied: "Скопійовано",
    lastSync: "Остання синхронізація:",
    inProgress: " · триває…",
    syncNow: "Синхронізувати зараз",
    disconnect: "Відключити",
    disconnectNote:
      "Після відключення дані залишаться на цьому пристрої, а зашифрована копія — на сервері, доки ви її не видалите.",
    deleteWarning:
      "Видаляє зашифровану копію із сервера. Інші пристрої більше не знайдуть, що синхронізувати. Скасувати неможливо.",
    deleteConfirm: "Точно видалити",
    deleteRemote: "Видалити дані із сервера",
    justNow: "зараз",
    minutesAgo: (minutes: number): string => `${minutes} хв тому`,
    atClock: (clock: string): string => `о ${clock}`,
    errors: {
      aborted: "Операцію скасовано.",
      generic: "Не вдалося синхронізувати. Спробуйте за мить.",
      insecureContext:
        "Синхронізації потрібне захищене з'єднання: відкрийте сайт через https (або на localhost). Через звичайний http браузери вимикають шифрування, тож на цьому пристрої нічого зашифрувати не вдасться.",
      noBase64Encode: "Цей браузер не вміє кодувати дані синхронізації.",
      noBase64Decode: "Цей браузер не вміє декодувати дані синхронізації.",
      invalidSyncData: (what: string): string => `Некоректні дані синхронізації (${what}).`,
      codeRequired: "Введіть код синхронізації.",
      codeTooLong: (max: number): string =>
        `Цей код задовгий: у ньому має бути ${n(max, { one: "символ", few: "символи", other: "символів" })}.`,
      codeInvalidChars: (chars: string): string => `Код містить недопустимі символи: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Код має містити ${n(required, { one: "символ", few: "символи", other: "символів" })}, а ви ввели ${actual}.`,
      keyDerivationFailed: "Цей браузер не може створити ключі синхронізації.",
      preparePayloadFailed: "Не вдалося підготувати дані до синхронізації.",
      encryptFailed: "Не вдалося зашифрувати дані на цьому пристрої.",
      decryptFailed: "Код не підходить до цих даних, або дані на сервері пошкоджені.",
      invalidSyncId: "Некоректний ідентифікатор синхронізації.",
      responseTooLarge: "Сервер надіслав забагато даних.",
      timeout: "Сервер не відповів вчасно.",
      unreachable: "Сервер недоступний. Перевірте з'єднання.",
      invalidResponse: "Некоректна відповідь сервера.",
      invalidResponseField: (what: string): string =>
        `Некоректна відповідь сервера (${what}).`,
      unexpectedFormat: "Сервер відповів у неочікуваному форматі.",
      rateLimited: "Забагато синхронізацій поспіль. Спробуйте за хвилину.",
      pullRejected: (status: number): string =>
        `Сервер відхилив читання (помилка ${status}).`,
      payloadTooLarge: "Забагато даних для синхронізації.",
      pushRejected: (status: number): string =>
        `Сервер відхилив збереження (помилка ${status}).`,
      deleteRejected: (status: number): string =>
        `Сервер відхилив видалення (помилка ${status}).`,
      conflict:
        "Інший пристрій саме зараз записує ті самі дані. Ваші локальні дані в безпеці: спробуйте за кілька секунд.",
    },
    status: {
      deleted: "Дані видалено із сервера. Цей пристрій більше не синхронізується.",
      disconnected:
        "Синхронізацію на цьому пристрої вимкнено. Ваші дані залишаються тут, а зашифрована копія — на сервері, доки ви її не видалите.",
    },
  },

  info: {
    title: "Відомості",
    subtitle:
      "Розклад і прибуття громадського транспорту Рима за офіційними відкритими даними.",
    unofficialTitle: "Неофіційний застосунок",
    unofficialBody:
      "Цей сайт жодним чином не пов'язаний з ATAC S.p.A., Roma Servizi per la Mobilità чи Roma Capitale, не схвалений і не підтримується ними. Це незалежний проєкт, який лише читає відкриті дані, що їх публікують ці організації. За офіційною інформацією, квитками та зі скаргами звертайтеся на їхні канали.",
    whatTitle: "Що це",
    whatBody1:
      "Вебзастосунок, щоб дізнатися, за скільки приїде наступна машина на зупинці, де ви стоїте. Ви шукаєте зупинку або маршрут, зберігаєте в обране й знаходите на головній з актуальними прибуттями. Без акаунта, без реклами, без статистики використання.",
    whatBody2:
      "Коли потік у реальному часі покриває рейс, показаний час — це прогноз за положенням машини. Інакше застосунок повертається до розкладу і завжди про це каже, замість того щоб видавати старі дані за прогноз.",
    dataTitle: "Звідки беруться дані",
    dataBodyBefore:
      "Розклад, зупинки, маршрути, траси, положення машин і повідомлення про рух беруться з відкритих даних ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (потоки GTFS і GTFS-Realtime). Розклад оновлюється щодня, реальний час — приблизно кожні 30 секунд.",
    dataLink: "romamobilita.it — Відкриті дані",
    dataLicence:
      "Дані залишаються власністю їхніх правовласників і використовуються на умовах ліцензії, за якою вони опубліковані.",
    privacyTitle: "Конфіденційність",
    privacyBody:
      "Тут немає входу й немає профілю користувача. Обране, нещодавно переглянуті зупинки та налаштування зберігаються лише у вашому браузері й нікуди не надсилаються. Положення, якщо ви дозволите його для пошуку зупинок поруч, залишається на пристрої: воно потрібне для розрахунку відстаней і не зберігається.",
    faqTitle: "Часті запитання",
    faq1Q: "Чому маршрут або автобус не з'являється?",
    faq1A:
      "Ми показуємо лише те, що є в офіційних потоках. Якщо машина не передає своє положення або її рейсу немає в потоці реального часу, для нас її не існує: у кращому разі ви побачите розклад. Так часто буває з підмінними рейсами, шатлами та машинами зі зламаним навігатором.",
    faq2Q: "Чому час відрізняється від написаного на зупинці?",
    faq2A:
      "Табличка на стовпі показує розклад, який змінюється кілька разів на рік. Тут, коли машина передає дані, ви бачите прогноз за її реальним положенням, що враховує затори й запізнення. Коли ж написано «за розкладом», прогнозу немає і ми показуємо той самий час, що й табличка.",
    faq3Q: "Що відбувається вночі?",
    faq3A:
      "Уночі потік реального часу майже порожній, бо ходить мало машин. Застосунок продовжує працювати за розкладом нічних маршрутів. У GTFS день руху закінчується не опівночі, а о 04:00: рейс о першій ночі все ще належить до попереднього дня, і тому ви можете бачити час на кшталт 25:30, переведений у 01:30.",
    faq4Q: "Моє обране потрапляє на сервер?",
    faq4A:
      "Ні. Обране, історія та налаштування зберігаються в localStorage браузера. Якщо ви очистите дані сайту або зміните пристрій, вони зникнуть: у налаштуваннях їх можна експортувати у файл JSON і імпортувати в іншому місці.",
    settingsLink: "Перейти до налаштувань",
  },

  footer: {
    dataPrefix: "Дані про рух і розклад: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (відкриті дані GTFS).",
    independent:
      "Незалежний проєкт, не пов'язаний з ATAC чи Roma Servizi per la Mobilità. ",
    infoLink: "Відомості",
  },

  errors: {
    genericTitle: "Щось пішло не так",
    unexpected: "Непередбачена помилка",
    unexpectedDot: "Непередбачена помилка.",
    stopNotFound: "Зупинку не знайдено",
    serviceDown: "Сервіс не відповідає",
    requestFailed: (status: number): string => `Запит не виконано (${status})`,
    httpStatus: (status: number): string => `Помилка ${status}`,
    badResponse: "Некоректна відповідь сервера",
    badResponseDot: "Некоректна відповідь сервера.",
    timedOut: "Час запиту вичерпано",
    timedOutDot: "Час запиту вичерпано.",
    offline: "Немає з'єднання",
    connectionFailed: "Не вдалося встановити з'єднання.",
    tooManyRequests: "Забагато запитів",
    badRequest: "Некоректні параметри",
    lineNotFound: "Маршрут не знайдено",
    journeyOriginNotFound: "Початкову точку не знайдено",
    journeyDestinationNotFound: "Пункт призначення не знайдено",
    journeyPlaceHint: "Спробуйте вказати точнішу адресу.",
  },

  notFound: {
    kicker: "Помилка 404",
    title: "Зупинка не обслуговується",
    body:
      "Такої сторінки немає. Так буває зі старим посиланням або з кодом зупинки чи маршруту, яких більше немає в потоці даних.",
    searchCta: "Знайти зупинку",
    nearbyCta: "Зупинки поруч",
  },

  appError: {
    title: "Рейс перервано",
    body:
      "Цей екран не вдалося завантажити. Спробуйте ще раз: якщо проблема залишиться, найімовірніше не відповідає сервіс даних.",
    digest: (digest: string): string => `Код: ${digest}`,
    backHome: "Повернутися на головну",
    globalTitle: "Роботу призупинено",
    globalBody:
      "Застосунок зупинився через непередбачену помилку. Перезавантажте сторінку: ваше обране збережено на телефоні й не зникне.",
    reload: "Перезавантажити",
  },

  format: {
    due: "під'їжджає",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "дата недоступна",
    minutes: (minutes: number): string => `${minutes} хв`,
    metres: (metres: number): string => `${metres} м`,
    kilometres: (value: string): string => `${value} км`,
    ageUnknown: "час оновлення невідомий",
    ageSeconds: (seconds: number): string => `оновлено ${seconds} с тому`,
    ageMinutes: (minutes: number): string => `оновлено ${minutes} хв тому`,
    ageAt: (clock: string): string => `оновлено о ${clock}`,
    onTime: "вчасно",
    delayLate: (minutes: number): string => `+${minutes} хв`,
    delayEarly: (minutes: number): string => `${minutes} хв`,
  },

  meta: {
    appTitle: "BusFinder — відправлення в реальному часі",
    appDescription:
      "Розклад і відправлення автобусів, трамваїв і метро в Римі в реальному часі. Обране, зупинки поруч і повідомлення про зміни в русі, без акаунта й без реклами.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Найближчі до вас зупинки ATAC, з картою та маршрутами, що там зупиняються.",
    journeyDescription:
      "Прокладіть маршрут з однієї точки Рима в іншу автобусом, трамваєм і метро, за офіційним розкладом ATAC.",
    alertsDescription:
      "Об'їзди, скасування та зміни в русі, опубліковані в офіційному потоці даних.",
    settingsDescription: "Оновлення прибуттів, радіус пошуку, тема та керування обраним.",
    infoDescription:
      "Що це за застосунок, звідки беруться дані й чому він не пов'язаний з ATAC чи Roma Servizi per la Mobilità.",
    stopDescription: "Найближчі відправлення в реальному часі та розклад зупинки.",
    lineDescription: "Траса, зупинки та транспорт маршруту в реальному часі.",
  },

  skeleton: {
    loading: "Завантаження",
  },
};

const EFFECT_UK: Record<string, string | undefined> = {
  NO_SERVICE: "Рух призупинено",
  REDUCED_SERVICE: "Рух скорочено",
  SIGNIFICANT_DELAYS: "Значні затримки",
  DETOUR: "Об'їзд",
  ADDITIONAL_SERVICE: "Додаткові рейси",
  MODIFIED_SERVICE: "Рух змінено",
  STOP_MOVED: "Зупинку перенесено",
  NO_EFFECT: "Без впливу на рух",
  ACCESSIBILITY_ISSUE: "Проблема з доступністю",
  OTHER_EFFECT: "Інше",
  UNKNOWN_EFFECT: "Наслідки не вказано",
};

const CAUSE_UK: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Технічна несправність",
  STRIKE: "Страйк",
  DEMONSTRATION: "Демонстрація",
  ACCIDENT: "ДТП",
  HOLIDAY: "Свято",
  WEATHER: "Негода",
  MAINTENANCE: "Обслуговування",
  CONSTRUCTION: "Дорожні роботи",
  POLICE_ACTIVITY: "Дії поліції",
  MEDICAL_EMERGENCY: "Медична допомога",
  OTHER_CAUSE: "Інша причина",
  UNKNOWN_CAUSE: "Причину не вказано",
};
