/**
 * Russian dictionary. Shape and key order follow it.ts, the source of truth.
 * Russian has one/few/many, so the plurals go through CLDR.
 */

import type { Dictionary } from "./it";
import { pluralRules } from "./plural";

const { pick, count: n } = pluralRules("ru");

export const ru: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, главная",
  },

  a11y: {
    skipToContent: "Перейти к содержимому",
  },

  common: {
    retry: "Повторить",
    cancel: "Отмена",
    save: "Сохранить",
    close: "Закрыть",
    home: "Главная",
    back: "Назад",
    all: "Все",
    loading: "Загрузка…",
    searching: "Поиск…",
    refresh: "Обновить",
    dash: "—",
    minutesShort: "мин",
    clearSearch: "Очистить поиск",
    searchInProgress: "Идёт поиск",
  },

  nav: {
    primary: "Основная навигация",
    sidebar: "Боковая панель",
    sidebarNav: "Боковая навигация",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    sections: "Разделы",
    shortcuts: "Быстрые ссылки",
    infoAria: "Сведения о приложении",
    home: "Главная",
    nearbyShort: "Рядом",
    nearby: "Остановки рядом",
    journey: "Маршрут",
    alerts: "Сообщения",
    settings: "Настройки",
    info: "Инфо",
    hintNearby: "Что ходит поблизости",
    hintJourney: "Из точки в точку",
    hintAlerts: "Объезды и перебои",
    hintSettings: "Обновление, тема, данные",
    hintInfo: "Источники и правовая информация",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "трамвай";
        case 1:
          return "метро";
        case 2:
          return "поезд";
        case 4:
          return "паром";
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
          return "Поезд";
        case 3:
          return "Автобус";
        default:
          return "Маршрут";
      }
    },
    named: (name: string): string => `Маршрут ${name}`,
    namedAria: (name: string): string => `Маршрут ${name}`,
    details: "подробности",
    towards: (headsign: string): string => `в сторону ${headsign}`,
    towardsCapital: (headsign: string): string => `В сторону ${headsign}`,
    direction: "Направление",
    terminus: "конечная",
    noHeadsign: "Пункт назначения не указан",
  },

  stops: {
    code: (code: string): string => `Остановка ${code}`,
    codeOnly: "Остановка",
    pole: (code: string): string => `Столб ${code}`,
    accessible: "Доступная остановка",
    named: (name: string): string => `Остановка ${name}`,
    countLabel: (count: number): string =>
      n(count, { one: "остановка", few: "остановки", other: "остановок" }),
    involved: (count: number): string =>
      n(count, {
        one: "затронутая остановка",
        few: "затронутые остановки",
        other: "затронутых остановок",
      }),
  },

  home: {
    kicker: "Рим · общественный транспорт",
    title: "Когда приедет?",
    intro:
      "Найдите остановку по номеру или названию, либо маршрут. Прибытия берутся из римского потока данных в реальном времени.",
  },

  search: {
    inputAria: "Поиск остановки или маршрута",
    placeholder: "Остановка, улица или маршрут",
    searchingFor: (query: string): string => `Ищу «${query}»…`,
    noResultsFor: (query: string): string => `Ничего не найдено по запросу «${query}»`,
    noResultsHint:
      "Попробуйте номер остановки (например 70101), название улицы или номер маршрута.",
    resultsList: "Результаты поиска",
    keyboardHint: "↑ ↓ для перехода, Enter чтобы открыть, Esc чтобы закрыть",
  },

  favorites: {
    heading: "Избранное",
    emptyTitle: "Пока ничего в избранном",
    emptyHint:
      "Нажмите на звёздочку ★ рядом с остановкой или маршрутом: в поиске, в разделе «Остановки рядом», на странице остановки или маршрута. Вы найдёте их здесь, не разыскивая каждый раз.",
    reorder: "Изменить порядок",
    reorderDone: "Готово",
    reorderHint: "Перемещайте остановки стрелками. Порядок действует на этом устройстве.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: позиция ${position} из ${total}.`,
    moveUp: (name: string): string => `Переместить ${name} вверх`,
    moveDown: (name: string): string => `Переместить ${name} вниз`,
    addStar: (name: string): string => `Добавить звёздочку остановке ${name}`,
    removeStar: (name: string): string => `Убрать звёздочку у остановки ${name}`,
    addStarLine: (name: string): string => `Добавить звёздочку маршруту ${name}`,
    removeStarLine: (name: string): string => `Убрать звёздочку у маршрута ${name}`,
    starredTitle: "Со звёздочкой: в избранном",
    starTitle: "Добавить звёздочку",
    starredLabel: "Со звёздочкой",
    starLabel: "Звёздочка",
    editLabels: (name: string): string => `Изменить название и маршруты для ${name}`,
    onlyLines: (labels: string): string => `только ${labels}`,
    notUpdated: "не обновлено",
    noArrivalsOnPinned: "Нет прибытий по выбранным маршрутам.",
    changeLines: "Изменить маршруты",
    noArrivalsSoon: "В ближайшие минуты прибытий нет.",
    openForTimes: "Открыть расписание",
    vehiclesUnavailable: "Машины недоступны",
    lookingForVehicles: "Ищу машины на линии…",
    noVehiclesNow: "Сейчас ни одной машины на линии",
    vehiclesInService: (count: number): string =>
      `${n(count, { one: "машина", few: "машины", other: "машин" })} сейчас на линии`,
    refreshArrivals: "Обновить прибытия",
    undoRemovedStop: "Остановка без звёздочки: её больше нет в избранном.",
    undoRemovedLine: "Маршрут без звёздочки: его больше нет в избранном.",
    undoDismiss: "Закрыть уведомление",
    more: (count: number): string => `Ещё ${count} в избранном`,
    sidebarEmptyBefore: "Нажмите на звёздочку рядом с остановкой или маршрутом, в поиске, в ",
    sidebarEmptyAfter: " или на странице, которую смотрите. Вы найдёте их здесь.",
    nextDeparture: "ближайшее прибытие",
    noDeparture: "прибытий нет",
    notAvailableShort: "н/д",
  },

  recents: {
    heading: "Недавно просмотренные",
    clear: "Очистить",
    emptyTitle: "Недавних остановок нет",
    emptyHint:
      "Остановки, которые вы открываете, остаются здесь на несколько дней, чтобы не искать их заново.",
    listAria: "Недавно просмотренные остановки",
    justNow: "только что",
    today: "сегодня",
    yesterday: "вчера",
  },

  arrivals: {
    due: "подъезжает",
    live: "в реальном времени",
    scheduled: "по расписанию",
    scheduledTail: " по расписанию",
    scheduledSr: "время по расписанию",
    onTime: "вовремя",
    lateBy: (minutes: number): string => `+${minutes} мин`,
    earlyBy: (minutes: number): string => `−${minutes} мин`,
    lateSuffix: "опоздания",
    earlySuffix: "раньше",
    lateSr: (minutes: number): string =>
      `опоздание ${n(minutes, { one: "минута", few: "минуты", other: "минут" })}`,
    earlySr: (minutes: number): string =>
      `на ${n(minutes, { one: "минуту", few: "минуты", other: "минут" })} раньше`,
    skipped: "отменён",
    skippedSr: "рейс отменён",
    atClock: (clock: string): string => `в ${clock}`,
    towardsSr: (headsign: string): string => `направление ${headsign}`,
    loadingAria: "Загрузка прибытий",
    emptyTitle: "Прибытий не ожидается",
    emptyHint:
      "Ни один рейс не приближается. Посмотрите расписание или попробуйте чуть позже.",
    frozenUnknown: "прогноз не обновляется",
    frozenFor: (minutes: number): string => `стоит ${minutes} мин`,
    frozenPrefix: (state: string): string => `прогноз ${state}`,
    frozenSr: (state: string): string => `прогноз ${state}, не обновляется в реальном времени`,
    expectedSr: (relative: string, clock: string): string => `ожидается ${relative}, в ${clock}`,
    bannerNoRealtimeStrong: "Реальное время недоступно.",
    bannerNoRealtime:
      " Показываем расписание: машины могут прийти раньше или позже.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Реальное время остановилось." : `Реальное время стоит ${minutes} мин.`,
    bannerFrozenBefore: " Прогнозы ниже взяты",
    bannerFrozenLastUpdate: " из последнего обновления",
    bannerFrozenAt: (clock: string): string => ` в ${clock}`,
    bannerFrozenAfter: " и не обновляются: относитесь к ним осторожно.",
    bannerPartialStrong: "Реальное время частично.",
    bannerPartial: " Часть данных не пришла: некоторых рейсов может не хватать.",
    showOnMap: (line: string): string => `Показать на карте машину маршрута ${line}`,
    hideOnMap: (line: string): string => `Убрать выделение машины маршрута ${line}`,
  },

  dataAge: {
    prefix: "Обновлено",
    now: "сейчас",
    secondsAgo: (seconds: number): string => `${seconds} с назад`,
    minutesAgo: (minutes: number): string => `${minutes} мин назад`,
    atClock: (clock: string): string => `в ${clock}`,
    never: "никогда",
  },

  refreshFeedback: {
    updated: "Обновлено",
    unchanged: "Проверено, ничего нового",
    failed: "Обновить не удалось",
    updatedShort: "Обновлено",
    unchangedShort: "Ничего нового",
    failedShort: "Не обновлено",
    busy: "Обновление…",
    busySpoken: "Идёт обновление",
  },

  stop: {
    tabArrivals: "Прибытия",
    tabTimetable: "Расписание",
    tabsAria: "Вид остановки",
    editTag: "Изменить название",
    addTag: "Название",
    map: "Карта",
    realtimePrefix: "Реальное время",
    noRealtime: "Данных в реальном времени нет",
    pageNotUpdated: "Страница ещё не обновлена",
    pageUpdatedAt: (clock: string): string => `Страница обновлена в ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Вы видите последние полученные данные.`,
    arrivalsUnavailable: "Прибытия недоступны",
    emptyHint:
      "Сейчас ни один рейс не приближается. Откройте расписание, чтобы узнать, когда ожидается следующее прибытие.",
    seeTimetable: "Смотреть расписание",
    linesHere: "Маршруты, останавливающиеся здесь",
  },

  tagDialog: {
    titleFavorite: "Избранное",
    titleTag: "Название остановки",
    label: "Как вы её называете",
    placeholder: "Дом, работа, спортзал…",
    hint: (maxChars: number): string =>
      `Только для вас: остаётся на этом устройстве, не более ${maxChars} символов.`,
    linesLegend: "Какие маршруты показывать",
    linesNone: "Ничего не выбрано: карточка показывает все маршруты.",
    linesSome: (count: number): string =>
      `Только ${n(count, { one: "маршрут", few: "маршрута", other: "маршрутов" })} на карточке.`,
    showAllLines: "Показать все маршруты",
    removeTag: "Убрать название",
  },

  timetable: {
    previousDay: "Предыдущий день",
    nextDay: "Следующий день",
    today: "сегодня",
    scheduled: "расписание",
    jumpToNow: "Перейти к текущему времени",
    backToToday: "Вернуться к сегодня",
    fromServiceStart: "С начала движения",
    unavailableTitle: "Расписание недоступно",
    partialError: (error: string): string => `${error}. Вы видите уже загруженные рейсы.`,
    emptyTitle: "Дальше рейсов нет",
    emptyFromNow:
      "С этого времени прибытий больше нет. Попробуйте с начала движения, другой день, либо снимите фильтр по маршруту.",
    emptyWholeDay:
      "В этот день не запланировано ни одного прибытия: попробуйте предыдущий или следующий день, либо снимите фильтр по маршруту.",
    loadMore: "Показать ещё рейсы",
    loadingMore: "Загрузка…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${n(count, { one: "рейс", few: "рейса", other: "рейсов" })} с ${from} до ${to}` +
      (complete ? ", до конца движения" : "") +
      ". Это официальное расписание дня движения, без реального времени.",
  },

  map: {
    fallbackAria: "Карта",
    vehiclesHeading: "Машины на карте",
    show: "Показать",
    hide: "Скрыть",
    modeGroup: "Какие машины показывать",
    modeApproaching: "Едут сюда",
    modeAllLines: "Все маршруты",
    loadingStop: "Загружаю положение остановки…",
    stopMapAria: (stopName: string): string => `Карта машин на остановке ${stopName}`,
    centreOnStop: "Центрировать на остановке",
    nearbyVehicles: "Машины поблизости",
    allVehicles: "Все, даже далёкие",
    loadingVehicles: "Загружаю машины…",
    noneApproaching: "Ни одна машина не приближается",
    approachingCount: (count: number): string =>
      n(count, {
        one: "машина в пути",
        few: "машины в пути",
        other: "машин в пути",
      }),
    onTheseLines: (count: number): string =>
      `${n(count, { one: "машина", few: "машины", other: "машин" })} на маршрутах этой остановки`,
    positionsAt: (clock: string): string => `положения на ${clock}`,
    positionsStale: "положения не обновлены",
    allLinesNote:
      "Яркие машины едут к этой остановке, бледные идут по тем же маршрутам, но сейчас здесь не проезжают.",
    approachingList: "Машины в пути",
    hereIn: (relative: string): string => `Здесь ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Здесь ${relative}, в ${clock}`,
    notInbound: "Идёт по этому маршруту, но не к этой остановке",
    noBearing: " · направление не передано",
    follow: "Я в этой машине, следить за ней",
    unfollow: "Перестать следить",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Маршрут ${line}, здесь ${relative}${followed ? ", вы следите за ней" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Маршрут ${line}, на линии, но не к этой остановке${followed ? ", вы следите за ней" : ""}`,
    yourPosition: "Ваше положение",
    vehicleTitle: (vehicleId: string): string => `Машина ${vehicleId}`,
    showOnMap: (stopName: string): string => `Показать ${stopName} на карте`,
    divertedSuffix: " · вне маршрута",
    divertedBadge: "Вне маршрута",
    divertedNote: "Едет не по запланированному пути.",
  },

  follow: {
    headlineLive: "Слежу за этой машиной",
    headlinePaused: "Слежение приостановлено",
    headlineStale: "Положение не меняется",
    headlineLost: "Машина больше не на линии",
    detailLive: "Карта остаётся на ней при каждом обновлении.",
    detailPaused:
      "Вы сдвинули карту, поэтому я её больше не двигаю. Нажмите «Продолжить», чтобы вернуться к машине.",
    detailStaleUnknown: "Машина уже некоторое время не передаёт своё положение.",
    detailStale: (age: string): string =>
      `Машина не передаёт данные уже ${age}: на карте её последняя известная точка.`,
    detailLost:
      "Её положение больше не приходит. Возможно, рейс закончен или машина сошла с линии.",
    ageMinutes: (minutes: number): string =>
      n(minutes, { one: "минута", few: "минуты", other: "минут" }),
    ageHours: (hours: number): string =>
      n(hours, { one: "час", few: "часа", other: "часов" }),
    compact: "Слежу",
    compactSr: (line: string): string => ` за маршрутом ${line}`,
    lineSr: (line: string): string => `, маршрут ${line}`,
    resume: "Продолжить",
    exit: "Выйти",
    close: "Закрыть",
    lostHint: "Если она ещё в пути, найдёте её, переключившись на «Все маршруты».",
  },

  nearby: {
    title: "Остановки рядом",
    mapAria: "Карта остановок рядом",
    searchHere: "Искать в этой зоне",
    radius: "Радиус",
    locating: "Определяю положение…",
    myPosition: "Моё положение",
    geoDenied:
      "Доступ к геолокации запрещён. Показываем центр Рима: сдвиньте карту и ищите в нужной зоне.",
    geoUnavailable:
      "Положение сейчас недоступно. Показываем центр Рима: сдвиньте карту и ищите в нужной зоне.",
    geoTimeout:
      "Определение положения заняло слишком много времени. Показываем центр Рима: сдвиньте карту и попробуйте снова.",
    geoUnsupported:
      "Этот браузер не поддерживает геолокацию. Сдвиньте карту, чтобы найти остановки.",
    outsideRome: "Вы за пределами Рима: показываем центр города.",
    outsideCoverage: "Эта зона вне покрытия. Сдвиньте карту на Рим.",
    focusStopMissing: "Запрошенная остановка не найдена: показываем вашу зону.",
    focusStopFailed: (error: string): string => `Запрошенная остановка не загружена (${error}).`,
    stopsFailed: (error: string): string => `Остановки не загружены: ${error}`,
    loadingStops: "Ищу остановки…",
    noStopsInRadius: (radius: string): string =>
      `В радиусе ${radius} остановок нет. Попробуйте увеличить радиус или сдвинуть карту.`,
    onMapCap: (max: number): string => ` (первые ${max} на карте)`,
    noLines: "Маршрутов нет",
    arrivalsLink: "Прибытия",
    showMoreStops: "Показать ещё остановки",
  },

  line: {
    loading: "Загружаю маршрут…",
    loadFailed: (error: string): string => `Маршрут не загружен: ${error}`,
    mapAria: (name: string): string => `Карта маршрута ${name}`,
    dataAt: (clock: string): string => `данные на ${clock}`,
    updatedAt: (clock: string): string => `обновлено в ${clock}`,
    vehiclesStale: (error: string): string => `Машины не обновлены: ${error}`,
    noPathForDirection: "Трасса для этого направления недоступна",
    stopsHeading: (count: number): string => `Остановки (${count})`,
    noStopsForDirection: "Для этого направления остановок нет.",
    showAllStops: "Показать все остановки",
  },

  lineService: {
    inService: (count: number): string =>
      `${n(count, { one: "машина", few: "машины", other: "машин" })} на линии`,
    loadingVehicles: "Загружаю машины…",
    checkingTimetable: "Проверяю расписание…",
    feedDownTitle: "Положения в реальном времени недоступны",
    feedDownDetail:
      "Движение может быть обычным: нам не удаётся считать положение машин.",
    noneReporting: "Ни одна машина не передаёт своё положение",
    unknownDetail:
      "Это не значит, что маршрут не работает: расписание есть на странице остановки.",
    scheduledDetail: (count: number): string =>
      `Движение запланировано: ${n(count, { one: "рейс", few: "рейса", other: "рейсов" })} до конца дня.`,
    finishedTitle: "Движение на сегодня закончено",
    finishedDetail: (count: number, clock: string): string =>
      `Сегодня ${n(count, { one: "рейс по расписанию", few: "рейса по расписанию", other: "рейсов по расписанию" })}, последний в ${clock}.`,
    noneTodayTitle: "Сегодня рейсов по расписанию нет",
    noneTodayDetail: "На этом маршруте сегодня нет рейсов по расписанию.",
    noneTodayFrom: (stopName: string): string =>
      `От остановки ${stopName} сегодня нет рейсов по расписанию.`,
    nextDepartures: "Ближайшие отправления",
    nextDeparturesFrom: (stopName: string): string => ` от остановки ${stopName}`,
    scheduledOnly: "Расписание, без реального времени.",
  },

  journey: {
    title: "Маршрут",
    subtitle: "Из точки в точку по Риму на автобусе, трамвае и метро.",
    from: "Откуда",
    to: "Куда",
    placeholder: "Остановка, адрес или место",
    swap: "Поменять местами",
    whenLegend: "Когда",
    now: "Сейчас",
    pickTime: "Выбрать время",
    timeLabel: "Дата и время отправления",
    submit: "Найти маршрут",
    resultsHeading: "Варианты",
    emptyTitle: "Куда вы хотите поехать?",
    emptyHint:
      "Укажите отправление и прибытие: подберём лучший маршрут по официальному расписанию.",
    searching: "Ищу варианты…",
    noResultsTitle: "Вариантов нет",
    noResultsHint:
      "Мы ищем только прямые связи или с одной пересадкой. Попробуйте сдвинуть точку отправления или время.",
    disclaimer:
      "Расписание, а не реальное время: фактические задержки не учитываются. Пешие участки оценены по прямой, поэтому реальное расстояние по улицам больше.",
    searchedFrom: (when: string): string => ` Поиск начиная с ${when}.`,
    mapAria: "Карта выбранного маршрута",
    mapCaption:
      "Участки на транспорте идут по реальной трассе маршрута. Пунктирные оценены по прямой: пешие пересадки и редкие маршруты без трассы.",
    missingEndpoints: "Укажите и отправление, и прибытие.",
    badDateTime: "Некорректные дата и время.",
    geoUnsupported: "Этот браузер не поддерживает геолокацию.",
    geoUnavailable: "Положение сейчас недоступно.",
    geoOutsideRome: "Вы за пределами Рима: введите адрес.",
    geoDenied: "Доступ к геолокации запрещён: введите адрес.",
    geoTimeout: "Определение положения заняло слишком много времени.",
    originMarker: (name: string): string => `Отправление: ${name}`,
    destinationMarker: (name: string): string => `Прибытие: ${name}`,
    useMyPosition: "Использовать моё положение",
    clearField: (label: string): string => `Очистить поле «${label.toLowerCase()}»`,
    suggestionsFor: (label: string): string => `Подсказки для поля «${label.toLowerCase()}»`,
    placeStop: "Остановка",
    placeCoord: "Координаты",
    placeAddress: "Адрес",
    walkOnly: "Только пешком",
    walkOnlyShort: "пешком",
    noTransfers: "без пересадок",
    transfers: (count: number): string =>
      n(count, { one: "пересадка", few: "пересадки", other: "пересадок" }),
    walkDistance: (distance: string): string => `${distance} пешком`,
    walkLeg: (distance: string, duration: string): string =>
      `Пешком ${distance}, примерно ${duration} до `,
    inService: "на линии",
    stopCount: (count: number): string =>
      n(count, { one: "остановка", few: "остановки", other: "остановок" }),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Вариант ${index}: отправление ${departure}, прибытие ${arrival}`,
    lineDetailsAria: (line: string): string => `Маршрут ${line}, подробности`,
    hours: (hours: number): string => `${hours} ч`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} ч ${minutes}`,
    noticeNoOriginStops:
      "От точки отправления пешком не добраться ни до одной остановки: попробуйте адрес ближе к маршруту.",
    noticeNoDestinationStops:
      "От точки прибытия пешком не добраться ни до одной остановки: попробуйте адрес ближе к маршруту.",
    noticeNoConnection: "В ближайшие часы между этими двумя районами нет ни одного варианта.",
    noticeWalkOnlyLeft:
      "В ближайшие часы нет ни одного рейса по расписанию: остаётся только маршрут пешком.",
    noticeLaterDepartures: "В ближайшие полтора часа рейсов нет: показываем первые после этого.",
  },

  alerts: {
    title: "Сообщения о движении",
    subtitle: "Объезды, отмены и изменения, опубликованные в официальном потоке данных.",
    loading: "Загрузка…",
    degraded:
      "Поток в реальном времени не отвечает или устарел: эти сообщения могут быть неактуальными.",
    loadFailed: "Не удалось загрузить сообщения.",
    refreshFailed: (error: string): string =>
      `Последнее обновление не удалось (${error}): вы видите предыдущий список.`,
    searchPlaceholder: "Поиск: забастовка, объезд, улица…",
    searchAria: "Поиск среди сообщений",
    filterByLine: "Фильтр по маршруту",
    allLines: (count: number): string => `Все маршруты (${count})`,
    networkWide: "Общие сообщения",
    clearFilters: "Сбросить",
    noMatch: "Ни одно сообщение не подходит под фильтры.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${pick(shown, { one: "сообщение", few: "сообщения", other: "сообщений" })} из ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${pick(count, { one: "активное сообщение", few: "активных сообщения", other: "активных сообщений" })} на ${lines} маршрутах.`,
    goToLine: "Перейти к маршруту",
    noneTitle: "Активных сообщений нет",
    noneHint:
      "Сейчас поток не сообщает о перебоях или изменениях в движении. Проверьте ещё раз перед выходом.",
    noResultsTitle: "Ничего не найдено",
    noResultsHint:
      "Попробуйте меньше слов или сбросьте фильтры, чтобы снова увидеть все сообщения.",
    noSelectionTitle: "Сообщение не выбрано",
    noSelectionHint: "Выберите сообщение из списка слева, чтобы прочитать его целиком.",
    showMoreLines: (count: number): string => `Показать ещё маршруты (${count})`,
    goToLineShort: "перейти к маршруту",
    fallbackHeader: "Сообщение о движении",
    noDetail: "Перевозчик не опубликовал подробностей.",
    operatorLink: "Подробности на сайте перевозчика",
    affectedLines: "Затронутые маршруты",
    alsoOn: "Также на",
    contextHeading: (count: number): string =>
      `${count} ${pick(count, { one: "активное сообщение", few: "активных сообщения", other: "активных сообщений" })}`,
    contextAria: "Сообщения о движении",
    contextAll: "Все",
    contextUnavailable: (error: string): string => `Сообщения недоступны: ${error}`,
    contextMore: (count: number): string => `Ещё ${count} сообщений на `,
    contextMoreLink: "странице сообщений",
    contextStale: (error: string): string =>
      `Последнее обновление не удалось (${error}): эти сообщения могут быть неактуальными.`,
    windowBetween: (from: string, until: string): string => `С ${from} по ${until}`,
    windowFrom: (from: string): string => `С ${from}, без указанного срока окончания`,
    windowUntil: (until: string): string => `До ${until}`,
    windowUnknown: "Период действия не указан",
    effect: (code: string): string | null => EFFECT_RU[code] ?? null,
    cause: (code: string): string | null => CAUSE_RU[code] ?? null,
  },

  settings: {
    title: "Настройки",
    subtitle: "Всё остаётся на этом устройстве. Ни аккаунта, ни сервера.",
    sectionArrivals: "Прибытия",
    autoRefresh: "Автоматическое обновление",
    everySeconds: (seconds: number): string => `каждые ${seconds} секунд`,
    autoRefreshHint: "Интервал между двумя чтениями потока в реальном времени.",
    maxArrivals: "Сколько прибытий показывать на остановку",
    showScheduled: "Показывать расписание",
    showScheduledHint:
      "Когда для остановки нет данных в реальном времени, использовать расписание.",
    sectionNearby: "Рядом со мной",
    radius: "Радиус поиска",
    radiusHint: "Действует и для быстрых радиусов на карте остановок рядом.",
    sectionAppearance: "Оформление",
    themeLegend: "Тема",
    themeSystem: "Системная",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    sectionLanguage: "Язык",
    languageLegend: "Язык интерфейса",
    languageSystem: "Системный",
    languageHint: (resolved: string): string =>
      `С «Системным» мы следуем языку браузера: сейчас это ${resolved}.`,
    sectionBackup: "Резервная копия избранного",
    backupIntro:
      "Файл JSON на вашем устройстве: так избранное переносится в другой браузер, ведь аккаунта здесь нет.",
    exportCount: (count: number): string => `Экспортировать (${count})`,
    importFromFile: "Импортировать из файла",
    exported: (count: number): string => `Экспортировано ${count} записей избранного.`,
    exportFailed: "Экспорт в этом браузере не удался.",
    fileTooLarge: "Файл слишком большой для резервной копии избранного.",
    fileUnreadable: "Не удалось прочитать файл.",
    importEmpty: "Файл пуст.",
    importNotJson: "Файл не является корректным JSON.",
    importNoList: "В файле нет списка избранного.",
    importNoneValid: "В файле не найдено ни одной корректной записи.",
    importFound: (count: number): string => `Найдено ${count} корректных записей`,
    importSkipped: (count: number): string => `, отброшено ${count} записей.`,
    importFoundEnd: ".",
    importMerge: "Объединить",
    importReplace: "Заменить",
    replaced: (count: number): string => `Избранное заменено: теперь записей ${count}.`,
    mergedNone: "Новых записей для добавления нет.",
    merged: (count: number): string => `Добавлено ${count} записей.`,
    sectionLocalData: "Локальные данные",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} в избранном, ${recents} остановок в истории.`,
    confirmClearFavorites: "Удалить всё избранное? Действие необратимо.",
    confirmClearFavoritesYes: "Да, очистить",
    clearFavorites: "Очистить избранное",
    favoritesCleared: "Избранное очищено.",
    confirmClearRecents: "Удалить историю просмотренных остановок?",
    confirmClearRecentsYes: "Да, удалить",
    clearRecents: "Удалить историю",
    recentsCleared: "История удалена.",
    resetDefaults: "Восстановить настройки по умолчанию",
    settingsReset: "Настройки возвращены к значениям по умолчанию.",
    infoLink: "Сведения, источники данных и частые вопросы",
  },

  sync: {
    titleFull: "Синхронизация устройств",
    titleCollapsed: "Синхронизация",
    badgeOn: "включена",
    summaryLoading: "…",
    summaryUnavailable: "Недоступна на этом соединении",
    summaryOff: "Выключена",
    summarySyncing: "Идёт синхронизация…",
    summaryError: "Ошибка синхронизации",
    summaryConflict: "Есть конфликт",
    summaryOn: (last: string): string => `Включена · последняя ${last}`,
    intro:
      "Перенесите избранное, недавние и настройки на другое устройство с помощью кода. Данные шифруются здесь: на сервере хранится только нечитаемое.",
    enable: "Включить синхронизацию",
    haveCode: "У меня уже есть код",
    codeLabel: "Код синхронизации",
    codeHint:
      "20 символов, как вы их видите на другом устройстве. Регистр, дефисы и пробелы не важны.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} символов`,
    join: "Подключить",
    onIntro:
      "Данные шифруются на этом устройстве перед отправкой. У кого есть код, тот прочитает всё ваше избранное: используйте его только на своих устройствах.",
    code: "Код",
    showCode: "Показать код",
    hideCode: "Скрыть код",
    copyCode: "Скопировать код",
    copied: "Скопировано",
    lastSync: "Последняя синхронизация:",
    inProgress: " · идёт…",
    syncNow: "Синхронизировать сейчас",
    disconnect: "Отключить",
    disconnectNote:
      "После отключения данные останутся на этом устройстве, а зашифрованная копия — на сервере, пока вы её не удалите.",
    deleteWarning:
      "Удаляет зашифрованную копию с сервера. Другие устройства больше не найдут, что синхронизировать. Отменить нельзя.",
    deleteConfirm: "Точно удалить",
    deleteRemote: "Удалить данные с сервера",
    justNow: "сейчас",
    minutesAgo: (minutes: number): string => `${minutes} мин назад`,
    atClock: (clock: string): string => `в ${clock}`,
    errors: {
      aborted: "Операция отменена.",
      generic: "Синхронизация не удалась. Попробуйте ещё раз через несколько секунд.",
      insecureContext:
        "Для синхронизации нужно защищённое соединение: откройте сайт по https (или на localhost). По обычному http браузеры отключают шифрование, и зашифровать данные на этом устройстве нечем.",
      noBase64Encode: "Этот браузер не умеет кодировать данные синхронизации.",
      noBase64Decode: "Этот браузер не умеет декодировать данные синхронизации.",
      invalidSyncData: (what: string): string => `Некорректные данные синхронизации (${what}).`,
      codeRequired: "Введите код синхронизации.",
      codeTooLong: (max: number): string =>
        `Код слишком длинный: в нём должно быть ${n(max, { one: "символ", few: "символа", other: "символов" })}.`,
      codeInvalidChars: (chars: string): string => `В коде есть недопустимые символы: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `В коде должно быть ${n(required, { one: "символ", few: "символа", other: "символов" })}, а вы ввели ${actual}.`,
      keyDerivationFailed: "Этот браузер не может создать ключи синхронизации.",
      preparePayloadFailed: "Не удалось подготовить данные к синхронизации.",
      encryptFailed: "Не удалось зашифровать данные на этом устройстве.",
      decryptFailed: "Код не подходит к этим данным, либо данные на сервере повреждены.",
      invalidSyncId: "Некорректный идентификатор синхронизации.",
      responseTooLarge: "Сервер прислал слишком много данных.",
      timeout: "Сервер не ответил вовремя.",
      unreachable: "Сервер недоступен. Проверьте соединение.",
      invalidResponse: "Некорректный ответ сервера.",
      invalidResponseField: (what: string): string => `Некорректный ответ сервера (${what}).`,
      unexpectedFormat: "Сервер ответил в неожиданном формате.",
      rateLimited: "Слишком много синхронизаций подряд. Попробуйте через минуту.",
      pullRejected: (status: number): string => `Сервер отклонил чтение (ошибка ${status}).`,
      payloadTooLarge: "Данных слишком много для синхронизации.",
      pushRejected: (status: number): string => `Сервер отклонил сохранение (ошибка ${status}).`,
      deleteRejected: (status: number): string => `Сервер отклонил удаление (ошибка ${status}).`,
      conflict:
        "Прямо сейчас в эти же данные пишет другое устройство. Локальные данные в безопасности: повторите через несколько секунд.",
    },
    status: {
      deleted: "Данные удалены с сервера. Это устройство больше не синхронизируется.",
      disconnected:
        "Синхронизация на этом устройстве выключена. Избранное остаётся здесь, а зашифрованная копия — на сервере, пока вы её не удалите.",
    },
  },

  info: {
    title: "Сведения",
    subtitle:
      "Расписание и прибытия общественного транспорта Рима по официальным открытым данным.",
    unofficialTitle: "Неофициальное приложение",
    unofficialBody:
      "Этот сайт никак не связан с ATAC S.p.A., Roma Servizi per la Mobilità или Roma Capitale, не одобрен и не поддерживается ими. Это независимый проект, который лишь читает открытые данные, публикуемые этими организациями. За официальной информацией, билетами и по жалобам обращайтесь на их каналы.",
    whatTitle: "Что это",
    whatBody1:
      "Веб-приложение, чтобы узнать, через сколько придёт следующая машина на остановке, где вы стоите. Вы ищете остановку или маршрут, сохраняете в избранное и находите на главной с актуальными прибытиями. Без аккаунта, без рекламы, без статистики использования.",
    whatBody2:
      "Когда поток в реальном времени покрывает рейс, показанное время — это прогноз по положению машины. Иначе приложение возвращается к расписанию и всегда об этом говорит, вместо того чтобы выдавать старые данные за прогноз.",
    dataTitle: "Откуда берутся данные",
    dataBodyBefore:
      "Расписание, остановки, маршруты, трассы, положения машин и сообщения о движении берутся из открытых данных ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (потоки GTFS и GTFS-Realtime). Расписание обновляется ежедневно, реальное время — примерно каждые 30 секунд.",
    dataLink: "romamobilita.it — Открытые данные",
    dataLicence:
      "Данные остаются собственностью их правообладателей и используются на условиях лицензии, под которой они опубликованы.",
    privacyTitle: "Конфиденциальность",
    privacyBody:
      "Здесь нет входа и нет профиля пользователя. Избранное, недавно просмотренные остановки и настройки хранятся только в вашем браузере и никуда не отправляются. Положение, если вы разрешите его для поиска остановок рядом, остаётся на устройстве: оно нужно для расчёта расстояний и не сохраняется.",
    faqTitle: "Частые вопросы",
    faq1Q: "Почему маршрут или автобус не появляется?",
    faq1A:
      "Мы показываем только то, что есть в официальных потоках. Если машина не передаёт своё положение или её рейса нет в потоке реального времени, для нас её не существует: в лучшем случае вы увидите расписание. Так часто бывает с подменными рейсами, шаттлами и машинами со сломанным навигатором.",
    faq2Q: "Почему время отличается от написанного на остановке?",
    faq2A:
      "Табличка на столбе показывает расписание, которое меняется несколько раз в год. Здесь, когда машина передаёт данные, вы видите прогноз по её реальному положению, учитывающий пробки и опоздания. Когда же написано «по расписанию», прогноза нет и мы показываем то же время, что и табличка.",
    faq3Q: "Что происходит ночью?",
    faq3A:
      "Ночью поток реального времени почти пуст, потому что ходит мало машин. Приложение продолжает работать по расписанию ночных маршрутов. В GTFS день движения заканчивается не в полночь, а в 04:00: рейс в час ночи всё ещё относится к предыдущему дню, и поэтому вы можете видеть время вроде 25:30, переведённое в 01:30.",
    faq4Q: "Моё избранное попадает на сервер?",
    faq4A:
      "Нет. Избранное, история и настройки хранятся в localStorage браузера. Если вы очистите данные сайта или смените устройство, они исчезнут: в настройках их можно экспортировать в файл JSON и импортировать в другом месте.",
    settingsLink: "Перейти к настройкам",
  },

  footer: {
    dataPrefix: "Данные о движении и расписание: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (открытые данные GTFS).",
    independent:
      "Независимый проект, не связанный с ATAC или Roma Servizi per la Mobilità. ",
    infoLink: "Сведения",
  },

  errors: {
    genericTitle: "Что-то пошло не так",
    unexpected: "Непредвиденная ошибка",
    unexpectedDot: "Непредвиденная ошибка.",
    stopNotFound: "Остановка не найдена",
    serviceDown: "Сервис не отвечает",
    requestFailed: (status: number): string => `Запрос не выполнен (${status})`,
    httpStatus: (status: number): string => `Ошибка ${status}`,
    badResponse: "Некорректный ответ сервера",
    badResponseDot: "Некорректный ответ сервера.",
    timedOut: "Время запроса истекло",
    timedOutDot: "Время запроса истекло.",
    offline: "Нет соединения",
    connectionFailed: "Не удалось установить соединение.",
    tooManyRequests: "Слишком много запросов",
    badRequest: "Некорректные параметры",
    lineNotFound: "Маршрут не найден",
    journeyOriginNotFound: "Отправление не найдено",
    journeyDestinationNotFound: "Назначение не найдено",
    journeyPlaceHint: "Попробуйте указать адрес точнее.",
  },

  notFound: {
    kicker: "Ошибка 404",
    title: "Остановка не обслуживается",
    body:
      "Такой страницы нет. Так бывает со старой ссылкой или с кодом остановки либо маршрута, которых больше нет в потоке данных.",
    searchCta: "Найти остановку",
    nearbyCta: "Остановки рядом",
  },

  appError: {
    title: "Рейс прерван",
    body:
      "Этот экран не удалось загрузить. Попробуйте снова: если проблема останется, скорее всего не отвечает сервис данных.",
    digest: (digest: string): string => `Код: ${digest}`,
    backHome: "Вернуться на главную",
    globalTitle: "Работа приостановлена",
    globalBody:
      "Приложение остановилось из-за непредвиденной ошибки. Перезагрузите страницу: ваше избранное сохранено на телефоне и не пропадёт.",
    reload: "Перезагрузить",
  },

  format: {
    due: "подъезжает",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "дата недоступна",
    minutes: (minutes: number): string => `${minutes} мин`,
    metres: (metres: number): string => `${metres} м`,
    kilometres: (value: string): string => `${value} км`,
    ageUnknown: "время обновления неизвестно",
    ageSeconds: (seconds: number): string => `обновлено ${seconds} с назад`,
    ageMinutes: (minutes: number): string => `обновлено ${minutes} мин назад`,
    ageAt: (clock: string): string => `обновлено в ${clock}`,
    onTime: "вовремя",
    delayLate: (minutes: number): string => `+${minutes} мин`,
    delayEarly: (minutes: number): string => `${minutes} мин`,
  },

  meta: {
    appTitle: "BusFinder — прибытия в реальном времени",
    appDescription:
      "Расписание и прибытия автобусов, трамваев и метро в Риме в реальном времени. Избранное, остановки рядом и сообщения о движении — без аккаунта и без рекламы.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Ближайшие к вам остановки ATAC — на карте и с маршрутами, которые через них проходят.",
    journeyDescription:
      "Постройте маршрут из одной точки Рима в другую на автобусе, трамвае и метро по официальному расписанию ATAC.",
    alertsDescription:
      "Объезды, приостановки и изменения в движении, опубликованные в официальном потоке.",
    settingsDescription:
      "Обновление прибытий, радиус поиска, тема оформления и управление избранным.",
    infoDescription:
      "Что это за приложение, откуда берутся данные и почему оно не связано с ATAC или Roma Servizi per la Mobilità.",
    stopDescription: "Ближайшие прибытия в реальном времени и расписание остановки.",
    lineDescription: "Трасса, остановки и машины маршрута в реальном времени.",
  },

  skeleton: {
    loading: "Загрузка",
  },
};

const EFFECT_RU: Record<string, string | undefined> = {
  NO_SERVICE: "Движение приостановлено",
  REDUCED_SERVICE: "Движение сокращено",
  SIGNIFICANT_DELAYS: "Значительные задержки",
  DETOUR: "Объезд",
  ADDITIONAL_SERVICE: "Дополнительные рейсы",
  MODIFIED_SERVICE: "Движение изменено",
  STOP_MOVED: "Остановка перенесена",
  NO_EFFECT: "Без влияния на движение",
  ACCESSIBILITY_ISSUE: "Проблема с доступностью",
  OTHER_EFFECT: "Другое",
  UNKNOWN_EFFECT: "Последствия не указаны",
};

const CAUSE_RU: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Техническая неисправность",
  STRIKE: "Забастовка",
  DEMONSTRATION: "Демонстрация",
  ACCIDENT: "ДТП",
  HOLIDAY: "Праздник",
  WEATHER: "Непогода",
  MAINTENANCE: "Обслуживание",
  CONSTRUCTION: "Дорожные работы",
  POLICE_ACTIVITY: "Действия полиции",
  MEDICAL_EMERGENCY: "Медицинская помощь",
  OTHER_CAUSE: "Другая причина",
  UNKNOWN_CAUSE: "Причина не указана",
};
