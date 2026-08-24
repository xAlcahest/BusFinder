/**
 * Korean dictionary. Shape and key order follow it.ts, the source of truth.
 * Korean has no plural inflection, so counted strings interpolate directly and
 * need no plural helper.
 */

import type { Dictionary } from "./it";

export const ko: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, 홈",
  },

  a11y: {
    skipToContent: "본문으로 건너뛰기",
  },

  common: {
    retry: "다시 시도",
    cancel: "취소",
    save: "저장",
    close: "닫기",
    home: "홈",
    back: "뒤로",
    all: "전체",
    loading: "불러오는 중…",
    searching: "검색 중…",
    refresh: "새로고침",
    dash: "—",
    minutesShort: "분",
    clearSearch: "검색어 지우기",
    searchInProgress: "검색 중",
  },

  nav: {
    primary: "주요 내비게이션",
    sidebar: "사이드바",
    sidebarNav: "사이드 내비게이션",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    sections: "섹션",
    shortcuts: "바로가기",
    infoAria: "앱 정보",
    home: "홈",
    nearbyShort: "주변",
    nearby: "주변 정류장",
    journey: "경로",
    alerts: "운행 공지",
    settings: "설정",
    info: "정보",
    hintNearby: "이 근처를 지나는 노선",
    hintJourney: "한 지점에서 다른 지점으로",
    hintAlerts: "우회와 중단",
    hintSettings: "새로고침, 테마, 데이터",
    hintInfo: "출처와 법적 고지",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "트램";
        case 1:
          return "지하철";
        case 2:
          return "기차";
        case 4:
          return "페리";
        default:
          return "버스";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "트램";
        case 1:
          return "지하철";
        case 2:
          return "기차";
        case 3:
          return "버스";
        default:
          return "노선";
      }
    },
    named: (name: string): string => `${name}번 노선`,
    namedAria: (name: string): string => `${name}번 노선`,
    details: "상세",
    towards: (headsign: string): string => `${headsign} 방면`,
    towardsCapital: (headsign: string): string => `${headsign} 방면`,
    direction: "방향",
    terminus: "종점",
    noHeadsign: "행선지 표시 없음",
  },

  stops: {
    code: (code: string): string => `${code}번 정류장`,
    codeOnly: "정류장",
    pole: (code: string): string => `${code}번 승강장`,
    accessible: "무장애 정류장",
    named: (name: string): string => `${name} 정류장`,
    countLabel: (count: number): string => `정류장 ${count}곳`,
    involved: (count: number): string => `정류장 ${count}곳 해당`,
  },

  home: {
    kicker: "로마 · 대중교통",
    title: "다음 차는 언제 오나요?",
    intro:
      "정류장을 번호나 이름으로, 또는 노선으로 검색하세요. 도착 정보는 로마의 실시간 데이터에서 가져옵니다.",
  },

  search: {
    inputAria: "정류장 또는 노선 검색",
    placeholder: "정류장, 거리 또는 노선",
    searchingFor: (query: string): string => `「${query}」 검색 중…`,
    noResultsFor: (query: string): string => `「${query}」에 대한 결과가 없습니다`,
    noResultsHint:
      "정류장 번호(예: 70101), 거리 이름 또는 노선 번호로 시도해 보세요.",
    resultsList: "검색 결과",
    keyboardHint: "↑ ↓ 로 이동, Enter 로 열기, Esc 로 닫기",
  },

  favorites: {
    heading: "즐겨찾기",
    emptyTitle: "아직 즐겨찾기가 없습니다",
    emptyHint:
      "정류장이나 노선 옆의 ★ 별을 누르세요. 검색 결과, 주변 정류장, 정류장 페이지, 노선 페이지 어디서든 됩니다. 이후에는 매번 찾지 않아도 여기서 열 수 있습니다.",
    reorder: "순서 변경",
    reorderDone: "완료",
    reorderHint: "화살표로 정류장을 옮기세요. 순서는 이 기기에서만 적용됩니다.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: ${total}개 중 ${position}번째.`,
    moveUp: (name: string): string => `${name} 위로 이동`,
    moveDown: (name: string): string => `${name} 아래로 이동`,
    addStar: (name: string): string => `${name} 정류장에 별 표시`,
    removeStar: (name: string): string => `${name} 정류장의 별 표시 해제`,
    addStarLine: (name: string): string => `${name} 노선에 별 표시`,
    removeStarLine: (name: string): string => `${name} 노선의 별 표시 해제`,
    starredTitle: "별 표시됨: 즐겨찾기에 있음",
    starTitle: "별 표시하기",
    starredLabel: "별 표시됨",
    starLabel: "별",
    editLabels: (name: string): string => `${name}의 이름표와 노선 편집`,
    onlyLines: (labels: string): string => `${labels}만`,
    notUpdated: "업데이트되지 않음",
    noArrivalsOnPinned: "선택한 노선에 운행 정보가 없습니다.",
    changeLines: "노선 변경",
    noArrivalsSoon: "앞으로 몇 분간 도착 예정이 없습니다.",
    openForTimes: "열어서 시간 보기",
    vehiclesUnavailable: "차량 정보를 가져올 수 없습니다",
    lookingForVehicles: "운행 중인 차량을 찾는 중…",
    noVehiclesNow: "현재 운행 중인 차량이 없습니다",
    vehiclesInService: (count: number): string => `현재 ${count}대 운행 중`,
    refreshArrivals: "도착 정보 새로고침",
    undoRemovedStop: "정류장 별 표시 해제: 더 이상 즐겨찾기에 없습니다.",
    undoRemovedLine: "노선 별 표시 해제: 더 이상 즐겨찾기에 없습니다.",
    undoDismiss: "알림 닫기",
    more: (count: number): string => `즐겨찾기 ${count}개 더`,
    sidebarEmptyBefore: "정류장이나 노선 옆의 별을 누르세요. 검색 결과, ",
    sidebarEmptyAfter: " 또는 지금 보고 있는 페이지에서요. 이후 여기서 찾을 수 있습니다.",
    nextDeparture: "다음 차",
    noDeparture: "운행 정보 없음",
    notAvailableShort: "—",
  },

  recents: {
    heading: "최근 본 정류장",
    clear: "비우기",
    emptyTitle: "최근 본 정류장이 없습니다",
    emptyHint:
      "연 정류장은 며칠간 여기에 남아 있어서 다시 검색하지 않아도 찾을 수 있습니다.",
    listAria: "최근 본 정류장",
    justNow: "방금",
    today: "오늘",
    yesterday: "어제",
  },

  arrivals: {
    due: "곧 도착",
    live: "실시간",
    scheduled: "시간표 기준",
    scheduledTail: " 예정",
    scheduledSr: "시간표상 시각",
    onTime: "정시",
    lateBy: (minutes: number): string => `+${minutes}분`,
    earlyBy: (minutes: number): string => `−${minutes}분`,
    lateSuffix: "지연",
    earlySuffix: "빠름",
    lateSr: (minutes: number): string => `${minutes}분 지연`,
    earlySr: (minutes: number): string => `${minutes}분 빠름`,
    skipped: "결행",
    skippedSr: "해당 운행 결행",
    atClock: (clock: string): string => `${clock}`,
    towardsSr: (headsign: string): string => `${headsign} 방면`,
    loadingAria: "도착 정보 불러오는 중",
    emptyTitle: "예정된 운행이 없습니다",
    emptyHint:
      "접근 중인 차량이 없습니다. 시간표를 확인하거나 잠시 후 다시 시도해 보세요.",
    frozenUnknown: "예측이 갱신되지 않음",
    frozenFor: (minutes: number): string => `${minutes}분째 멈춤`,
    frozenPrefix: (state: string): string => `예측 ${state}`,
    frozenSr: (state: string): string => `예측 ${state}, 실시간으로 갱신되지 않음`,
    expectedSr: (relative: string, clock: string): string => `${relative} 도착 예정, ${clock}`,
    bannerNoRealtimeStrong: "실시간 정보를 사용할 수 없습니다.",
    bannerNoRealtime:
      " 시간표를 표시하고 있습니다. 차량이 더 일찍 오거나 늦을 수 있습니다.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "실시간 정보가 멈췄습니다." : `실시간 정보가 ${minutes}분째 멈춰 있습니다.`,
    bannerFrozenBefore: " 아래 예측은",
    bannerFrozenLastUpdate: " 마지막 갱신",
    bannerFrozenAt: (clock: string): string => `(${clock})`,
    bannerFrozenAfter: " 시점의 것이며 갱신되지 않습니다. 참고용으로만 보세요.",
    bannerPartialStrong: "실시간 정보가 일부만 있습니다.",
    bannerPartial: " 데이터 일부가 도착하지 않았습니다. 일부 운행이 빠질 수 있습니다.",
    showOnMap: (line: string): string => `${line}번 노선 차량을 지도에 표시`,
    hideOnMap: (line: string): string => `${line}번 노선 차량 강조 해제`,
  },

  dataAge: {
    prefix: "업데이트",
    now: "방금",
    secondsAgo: (seconds: number): string => `${seconds}초 전`,
    minutesAgo: (minutes: number): string => `${minutes}분 전`,
    atClock: (clock: string): string => `${clock}`,
    never: "없음",
  },

  refreshFeedback: {
    updated: "업데이트됨",
    unchanged: "확인함, 새로운 내용 없음",
    failed: "업데이트 실패",
    updatedShort: "업데이트됨",
    unchangedShort: "새로운 내용 없음",
    failedShort: "업데이트 안 됨",
    busy: "업데이트 중…",
    busySpoken: "업데이트 중",
  },

  stop: {
    tabArrivals: "도착",
    tabTimetable: "시간표",
    tabsAria: "정류장 보기",
    editTag: "이름표 수정",
    addTag: "이름표",
    map: "지도",
    realtimePrefix: "실시간",
    noRealtime: "실시간 데이터 없음",
    pageNotUpdated: "페이지가 아직 갱신되지 않음",
    pageUpdatedAt: (clock: string): string => `${clock}에 페이지 갱신`,
    lastDataSuffix: (error: string): string => `${error}. 마지막으로 받은 데이터를 보고 있습니다.`,
    arrivalsUnavailable: "도착 정보를 사용할 수 없습니다",
    emptyHint:
      "지금은 접근 중인 차량이 없습니다. 다음 차가 언제 오는지는 시간표에서 확인하세요.",
    seeTimetable: "시간표 보기",
    linesHere: "이곳에 서는 노선",
  },

  tagDialog: {
    titleFavorite: "즐겨찾기",
    titleTag: "정류장 이름표",
    label: "직접 부르는 이름",
    placeholder: "집, 회사, 헬스장…",
    hint: (maxChars: number): string =>
      `본인만 볼 수 있습니다. 이 기기에 남으며 최대 ${maxChars}자입니다.`,
    linesLegend: "표시할 노선",
    linesNone: "선택 없음: 카드에 모든 노선이 표시됩니다.",
    linesSome: (count: number): string => `카드에 ${count}개 노선만 표시.`,
    showAllLines: "모든 노선 표시",
    removeTag: "이름표 삭제",
  },

  timetable: {
    previousDay: "이전 날",
    nextDay: "다음 날",
    today: "오늘",
    scheduled: "시간표",
    jumpToNow: "지금으로 이동",
    backToToday: "오늘로 돌아가기",
    fromServiceStart: "첫차부터",
    unavailableTitle: "시간표를 사용할 수 없습니다",
    partialError: (error: string): string => `${error}. 이미 불러온 운행만 보고 있습니다.`,
    emptyTitle: "이후 운행이 없습니다",
    emptyFromNow:
      "이 시각 이후로는 운행이 없습니다. 첫차부터 보거나 다른 날을 선택하거나 노선 필터를 해제해 보세요.",
    emptyWholeDay:
      "이 날에는 예정된 운행이 없습니다. 전날이나 다음 날을 보거나 노선 필터를 해제해 보세요.",
    loadMore: "운행 더 보기",
    loadingMore: "불러오는 중…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${from}부터 ${to}까지 ${count}회 운행` +
      (complete ? ", 막차까지" : "") +
      ". 해당 운행일의 공식 시간표이며 실시간 정보는 포함되지 않습니다.",
  },

  map: {
    fallbackAria: "지도",
    vehiclesHeading: "지도 위 차량",
    show: "표시",
    hide: "숨기기",
    modeGroup: "표시할 차량",
    modeApproaching: "이곳으로 오는 차량",
    modeAllLines: "모든 노선",
    loadingStop: "정류장 위치를 불러오는 중…",
    stopMapAria: (stopName: string): string => `${stopName} 정류장의 차량 지도`,
    centreOnStop: "정류장을 중심으로",
    nearbyVehicles: "이 근처 차량",
    allVehicles: "멀리 있는 것까지 전부",
    loadingVehicles: "차량을 불러오는 중…",
    noneApproaching: "접근 중인 차량이 없습니다",
    approachingCount: (count: number): string => `${count}대 접근 중`,
    onTheseLines: (count: number): string => `이 정류장의 노선에 ${count}대`,
    positionsAt: (clock: string): string => `${clock} 기준 위치`,
    positionsStale: "위치가 갱신되지 않음",
    allLinesNote:
      "진하게 표시된 차량은 이 정류장으로 오고 있고, 흐린 차량은 같은 노선을 달리지만 지금은 여기를 지나지 않습니다.",
    approachingList: "접근 중인 차량",
    hereIn: (relative: string): string => `${relative} 후 도착`,
    hereInAt: (relative: string, clock: string): string => `${relative} 후 도착, ${clock}`,
    notInbound: "이 노선을 운행 중이지만 이 정류장으로 오지는 않습니다",
    noBearing: " · 방향 정보 없음",
    follow: "이 차량에 타고 있습니다. 추적하기",
    unfollow: "추적 중지",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `${line}번 노선, ${relative} 후 도착${followed ? ", 추적 중" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `${line}번 노선, 운행 중, 이 정류장으로 오지 않음${followed ? ", 추적 중" : ""}`,
    yourPosition: "내 위치",
    vehicleTitle: (vehicleId: string): string => `차량 ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName}을(를) 지도에 표시`,
    divertedSuffix: " · 경로 이탈",
    divertedBadge: "경로 이탈",
    divertedNote: "예정과 다른 경로로 가고 있습니다.",
  },

  follow: {
    headlineLive: "이 차량을 추적 중입니다",
    headlinePaused: "추적 일시 중지",
    headlineStale: "위치가 멈춰 있음",
    headlineLost: "차량이 노선에서 사라짐",
    detailLive: "갱신할 때마다 지도가 이 차량을 중심에 유지합니다.",
    detailPaused:
      "지도를 직접 움직이셔서 더 이상 자동으로 옮기지 않습니다. 차량으로 돌아가려면 「계속」을 누르세요.",
    detailStaleUnknown: "이 차량이 한동안 위치를 보내지 않고 있습니다.",
    detailStale: (age: string): string =>
      `이 차량은 ${age}째 신호가 없습니다. 지도에 표시된 곳은 마지막으로 확인된 지점입니다.`,
    detailLost:
      "더 이상 위치가 오지 않습니다. 운행을 마쳤거나 영업에서 빠졌을 수 있습니다.",
    ageMinutes: (minutes: number): string => `${minutes}분`,
    ageHours: (hours: number): string => `${hours}시간`,
    compact: "추적 중",
    compactSr: (line: string): string => ` ${line}번 노선`,
    lineSr: (line: string): string => `, ${line}번 노선`,
    resume: "계속",
    exit: "종료",
    close: "닫기",
    lostHint: "아직 운행 중이라면 「모든 노선」으로 바꾸면 찾을 수 있습니다.",
  },

  nearby: {
    title: "주변 정류장",
    mapAria: "주변 정류장 지도",
    searchHere: "이 지역에서 검색",
    radius: "반경",
    locating: "위치 확인 중…",
    myPosition: "내 위치",
    geoDenied:
      "위치 권한이 거부되었습니다. 로마 중심부를 표시합니다. 지도를 옮겨 그 지역에서 검색하세요.",
    geoUnavailable:
      "지금은 위치를 가져올 수 없습니다. 로마 중심부를 표시합니다. 지도를 옮겨 그 지역에서 검색하세요.",
    geoTimeout:
      "위치 확인에 너무 오래 걸렸습니다. 로마 중심부를 표시합니다. 지도를 옮기고 다시 시도하세요.",
    geoUnsupported:
      "이 브라우저는 위치 확인을 지원하지 않습니다. 지도를 옮겨 정류장을 찾으세요.",
    outsideRome: "로마 지역 밖에 있습니다. 도심을 표시합니다.",
    outsideCoverage: "이 지역은 서비스 범위 밖입니다. 지도를 로마로 옮기세요.",
    focusStopMissing: "요청한 정류장을 찾지 못했습니다. 현재 지역을 표시합니다.",
    focusStopFailed: (error: string): string => `요청한 정류장을 불러오지 못했습니다 (${error}).`,
    stopsFailed: (error: string): string => `정류장을 불러오지 못했습니다: ${error}`,
    loadingStops: "정류장을 찾는 중…",
    noStopsInRadius: (radius: string): string =>
      `${radius} 이내에 정류장이 없습니다. 반경을 넓히거나 지도를 옮겨 보세요.`,
    onMapCap: (max: number): string => ` (지도에는 처음 ${max}개)`,
    noLines: "노선 없음",
    arrivalsLink: "도착",
    showMoreStops: "정류장 더 보기",
  },

  line: {
    loading: "노선을 불러오는 중…",
    loadFailed: (error: string): string => `노선을 불러오지 못했습니다: ${error}`,
    mapAria: (name: string): string => `${name}번 노선 지도`,
    dataAt: (clock: string): string => `${clock} 기준 데이터`,
    updatedAt: (clock: string): string => `${clock}에 갱신`,
    vehiclesStale: (error: string): string => `차량 정보가 갱신되지 않음: ${error}`,
    noPathForDirection: "이 방향의 경로 정보가 없습니다",
    stopsHeading: (count: number): string => `정류장 (${count})`,
    noStopsForDirection: "이 방향에 표시할 정류장이 없습니다.",
    showAllStops: "모든 정류장 표시",
  },

  lineService: {
    inService: (count: number): string => `노선에 ${count}대`,
    loadingVehicles: "차량을 불러오는 중…",
    checkingTimetable: "시간표 확인 중…",
    feedDownTitle: "실시간 위치를 사용할 수 없습니다",
    feedDownDetail:
      "운행 자체는 정상일 수 있습니다. 차량의 위치를 읽지 못하는 것뿐입니다.",
    noneReporting: "위치를 보내는 차량이 없습니다",
    unknownDetail:
      "노선이 운행하지 않는다는 뜻은 아닙니다. 시간표는 정류장 페이지에서 볼 수 있습니다.",
    scheduledDetail: (count: number): string =>
      `운행이 예정되어 있습니다. 지금부터 오늘이 끝날 때까지 ${count}회 예정입니다.`,
    finishedTitle: "오늘 운행이 끝났습니다",
    finishedDetail: (count: number, clock: string): string =>
      `오늘 예정 운행은 ${count}회였고, 마지막은 ${clock}였습니다.`,
    noneTodayTitle: "오늘 예정된 운행이 없습니다",
    noneTodayDetail: "이 노선에는 오늘 시간표상 운행이 없습니다.",
    noneTodayFrom: (stopName: string): string =>
      `${stopName}에서 출발하는 오늘 시간표상 운행이 없습니다.`,
    nextDepartures: "다음 출발",
    nextDeparturesFrom: (stopName: string): string => ` (${stopName} 출발)`,
    scheduledOnly: "시간표 기준이며 실시간 정보는 없습니다.",
  },

  journey: {
    title: "경로",
    subtitle: "버스, 트램, 지하철로 로마 한 지점에서 다른 지점까지.",
    from: "출발",
    to: "도착",
    placeholder: "정류장, 주소 또는 장소",
    swap: "바꾸기",
    whenLegend: "시각",
    now: "지금",
    pickTime: "시각 선택",
    timeLabel: "출발 날짜와 시각",
    submit: "경로 찾기",
    resultsHeading: "경로 목록",
    emptyTitle: "어디로 가시나요?",
    emptyHint:
      "출발지와 도착지를 입력하세요. 공식 시간표를 바탕으로 가장 좋은 경로를 찾아 드립니다.",
    searching: "경로를 찾는 중…",
    noResultsTitle: "경로가 없습니다",
    noResultsHint:
      "직통이나 한 번 환승하는 연결만 찾습니다. 출발지나 시각을 바꿔 보세요.",
    disclaimer:
      "실시간이 아니라 시간표 기준입니다. 실제 지연은 반영되지 않습니다. 도보 구간은 직선거리로 추정하므로 실제 도로 거리는 더 깁니다.",
    searchedFrom: (when: string): string => ` ${when} 이후로 검색.`,
    mapAria: "선택한 경로의 지도",
    mapCaption:
      "차량 구간은 노선의 실제 경로를 따릅니다. 점선은 직선거리로 추정한 구간으로, 환승 도보와 경로 정보가 없는 일부 노선입니다.",
    missingEndpoints: "출발지와 도착지를 모두 입력하세요.",
    badDateTime: "날짜와 시각이 올바르지 않습니다.",
    geoUnsupported: "이 브라우저는 위치 확인을 지원하지 않습니다.",
    geoUnavailable: "지금은 위치를 가져올 수 없습니다.",
    geoOutsideRome: "로마 지역 밖에 있습니다. 주소를 입력하세요.",
    geoDenied: "위치 권한이 거부되었습니다. 주소를 입력하세요.",
    geoTimeout: "위치 확인에 너무 오래 걸렸습니다.",
    originMarker: (name: string): string => `출발: ${name}`,
    destinationMarker: (name: string): string => `도착: ${name}`,
    useMyPosition: "내 위치 사용",
    clearField: (label: string): string => `${label} 비우기`,
    suggestionsFor: (label: string): string => `${label} 추천`,
    placeStop: "정류장",
    placeCoord: "좌표",
    placeAddress: "주소",
    walkOnly: "도보만",
    walkOnlyShort: "도보",
    noTransfers: "환승 없음",
    transfers: (count: number): string => `환승 ${count}회`,
    walkDistance: (distance: string): string => `도보 ${distance}`,
    walkLeg: (distance: string, duration: string): string =>
      `도보 ${distance}, 약 ${duration} 걸려 `,
    inService: "운행 중",
    stopCount: (count: number): string => `정류장 ${count}곳`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `경로 ${index}: 출발 ${departure}, 도착 ${arrival}`,
    lineDetailsAria: (line: string): string => `${line}번 노선, 상세`,
    hours: (hours: number): string => `${hours}시간`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours}시간 ${minutes}`,
    noticeNoOriginStops: "출발 지점에서 도보 거리 안에 정류장이 없습니다. 노선에 더 가까운 주소를 입력해 보세요.",
    noticeNoDestinationStops: "도착 지점에서 도보 거리 안에 정류장이 없습니다. 노선에 더 가까운 주소를 입력해 보세요.",
    noticeNoConnection: "앞으로 몇 시간 동안 두 지역을 잇는 연결편이 없습니다.",
    noticeWalkOnlyLeft: "앞으로 몇 시간 동안 운행 예정인 연결편이 없습니다. 도보 경로만 남았습니다.",
    noticeLaterDepartures: "앞으로 한 시간 반 동안 운행이 없습니다. 그 이후 가장 이른 편을 보여 드립니다.",
  },

  alerts: {
    title: "운행 공지",
    subtitle: "공식 데이터에 게시된 우회, 운휴, 변경 사항.",
    loading: "불러오는 중…",
    degraded:
      "실시간 데이터가 응답하지 않거나 오래되었습니다. 이 공지는 최신이 아닐 수 있습니다.",
    loadFailed: "공지를 불러오지 못했습니다.",
    refreshFailed: (error: string): string =>
      `마지막 갱신에 실패했습니다 (${error}). 이전 목록을 보고 있습니다.`,
    searchPlaceholder: "검색: 파업, 우회, 거리…",
    searchAria: "공지 검색",
    filterByLine: "노선으로 거르기",
    allLines: (count: number): string => `모든 노선 (${count})`,
    networkWide: "전체 공지",
    clearFilters: "초기화",
    noMatch: "조건에 맞는 공지가 없습니다.",
    filteredCount: (shown: number, total: number): string =>
      `${total}건 중 ${shown}건.`,
    activeCount: (count: number, lines: number): string =>
      `${lines}개 노선에 ${count}건의 공지가 유효합니다.`,
    goToLine: "노선으로 이동",
    noneTitle: "유효한 공지가 없습니다",
    noneHint:
      "현재 운행 중단이나 변경 사항이 올라와 있지 않습니다. 출발 전에 한 번 더 확인하세요.",
    noResultsTitle: "결과가 없습니다",
    noResultsHint:
      "단어를 줄여 보거나, 필터를 초기화해 모든 공지를 다시 확인하세요.",
    noSelectionTitle: "선택한 공지가 없습니다",
    noSelectionHint: "왼쪽 목록에서 공지를 선택하면 전문을 읽을 수 있습니다.",
    showMoreLines: (count: number): string => `노선 더 보기 (${count})`,
    goToLineShort: "노선으로 이동",
    fallbackHeader: "운행 공지",
    noDetail: "운영사가 상세 내용을 게시하지 않았습니다.",
    operatorLink: "운영사 사이트에서 상세 보기",
    affectedLines: "해당 노선",
    alsoOn: "다음에도",
    contextHeading: (count: number): string => `${count}건의 공지`,
    contextAria: "운행 공지",
    contextAll: "전체",
    contextUnavailable: (error: string): string => `공지를 사용할 수 없습니다: ${error}`,
    contextMore: (count: number): string => `공지 ${count}건 더 보기: `,
    contextMoreLink: "공지 페이지",
    contextStale: (error: string): string =>
      `마지막 갱신에 실패했습니다 (${error}). 이 공지는 최신이 아닐 수 있습니다.`,
    windowBetween: (from: string, until: string): string => `${from}부터 ${until}까지`,
    windowFrom: (from: string): string => `${from}부터, 종료 시점 미표시`,
    windowUntil: (until: string): string => `${until}까지`,
    windowUnknown: "유효 기간 미표시",
    effect: (code: string): string | null => EFFECT_KO[code] ?? null,
    cause: (code: string): string | null => CAUSE_KO[code] ?? null,
  },

  settings: {
    title: "설정",
    subtitle: "모든 것이 이 기기에 남습니다. 계정도 서버도 없습니다.",
    sectionArrivals: "도착",
    autoRefresh: "자동 새로고침",
    everySeconds: (seconds: number): string => `${seconds}초마다`,
    autoRefreshHint: "실시간 데이터를 두 번 읽는 사이의 간격입니다.",
    maxArrivals: "정류장당 표시할 도착 수",
    showScheduled: "시간표 표시",
    showScheduledHint:
      "어떤 정류장에 실시간 정보가 없을 때 시간표를 사용합니다.",
    sectionNearby: "내 주변",
    radius: "검색 반경",
    radiusHint: "주변 정류장 지도의 빠른 반경에도 적용됩니다.",
    sectionAppearance: "화면",
    themeLegend: "테마",
    themeSystem: "시스템",
    themeLight: "밝게",
    themeDark: "어둡게",
    sectionLanguage: "언어",
    languageLegend: "인터페이스 언어",
    languageSystem: "시스템",
    languageHint: (resolved: string): string =>
      `「시스템」에서는 브라우저 언어를 따릅니다. 현재는 ${resolved}입니다.`,
    sectionBackup: "즐겨찾기 백업",
    backupIntro:
      "기기에 저장하는 JSON 파일입니다. 계정이 없으므로 즐겨찾기를 다른 브라우저로 옮기는 방법은 이것뿐입니다.",
    exportCount: (count: number): string => `내보내기 (${count})`,
    importFromFile: "파일에서 가져오기",
    exported: (count: number): string => `즐겨찾기 ${count}개를 내보냈습니다.`,
    exportFailed: "이 브라우저에서는 내보내기에 실패했습니다.",
    fileTooLarge: "파일이 너무 커서 즐겨찾기 백업으로 보기 어렵습니다.",
    fileUnreadable: "파일을 읽지 못했습니다.",
    importEmpty: "파일이 비어 있습니다.",
    importNotJson: "파일이 올바른 JSON이 아닙니다.",
    importNoList: "파일에 즐겨찾기 목록이 없습니다.",
    importNoneValid: "파일에서 유효한 즐겨찾기를 찾지 못했습니다.",
    importFound: (count: number): string => `유효한 즐겨찾기 ${count}개를 찾았습니다`,
    importSkipped: (count: number): string => `, ${count}개 항목은 제외했습니다.`,
    importFoundEnd: ".",
    importMerge: "합치기",
    importReplace: "바꾸기",
    replaced: (count: number): string => `즐겨찾기를 교체했습니다: 이제 ${count}개입니다.`,
    mergedNone: "추가할 새 즐겨찾기가 없습니다.",
    merged: (count: number): string => `즐겨찾기 ${count}개를 추가했습니다.`,
    sectionLocalData: "로컬 데이터",
    localDataSummary: (favorites: number, recents: number): string =>
      `즐겨찾기 ${favorites}개, 기록에 정류장 ${recents}곳.`,
    confirmClearFavorites: "모든 즐겨찾기를 삭제할까요? 되돌릴 수 없습니다.",
    confirmClearFavoritesYes: "네, 비웁니다",
    clearFavorites: "즐겨찾기 비우기",
    favoritesCleared: "즐겨찾기를 비웠습니다.",
    confirmClearRecents: "본 정류장 기록을 삭제할까요?",
    confirmClearRecentsYes: "네, 삭제합니다",
    clearRecents: "기록 삭제",
    recentsCleared: "기록을 삭제했습니다.",
    resetDefaults: "기본 설정으로 되돌리기",
    settingsReset: "설정을 기본값으로 되돌렸습니다.",
    infoLink: "정보, 데이터 출처, 자주 묻는 질문",
  },

  sync: {
    titleFull: "기기 동기화",
    titleCollapsed: "동기화",
    badgeOn: "사용 중",
    summaryLoading: "…",
    summaryUnavailable: "이 연결에서는 사용할 수 없습니다",
    summaryOff: "사용 안 함",
    summarySyncing: "동기화 중…",
    summaryError: "동기화 오류",
    summaryConflict: "해결할 충돌이 있습니다",
    summaryOn: (last: string): string => `사용 중 · 마지막 ${last}`,
    intro:
      "코드 하나로 즐겨찾기, 최근 기록, 설정을 다른 기기로 옮길 수 있습니다. 데이터는 이 기기에서 암호화되며, 서버에는 읽을 수 없는 형태만 저장됩니다.",
    enable: "동기화 켜기",
    haveCode: "이미 코드가 있습니다",
    codeLabel: "동기화 코드",
    codeHint:
      "20자입니다. 다른 기기에 표시된 그대로 입력하세요. 대소문자, 하이픈, 공백은 구분하지 않습니다.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total}자`,
    join: "연결",
    onIntro:
      "데이터는 기기를 떠나기 전에 암호화됩니다. 코드를 아는 사람은 즐겨찾기를 모두 읽을 수 있으니 본인 기기에서만 사용하세요.",
    code: "코드",
    showCode: "코드 표시",
    hideCode: "코드 숨기기",
    copyCode: "코드 복사",
    copied: "복사됨",
    lastSync: "마지막 동기화:",
    inProgress: " · 진행 중…",
    syncNow: "지금 동기화",
    disconnect: "연결 해제",
    disconnectNote:
      "연결을 해제해도 데이터는 이 기기에 남고, 암호화된 사본은 직접 삭제할 때까지 서버에 남습니다.",
    deleteWarning:
      "서버의 암호화 사본을 삭제합니다. 다른 기기는 더 이상 동기화할 것을 찾지 못합니다. 되돌릴 수 없습니다.",
    deleteConfirm: "정말 삭제",
    deleteRemote: "서버의 데이터 삭제",
    justNow: "방금",
    minutesAgo: (minutes: number): string => `${minutes}분 전`,
    atClock: (clock: string): string => `${clock}`,
    errors: {
      aborted: "작업이 취소되었습니다.",
      generic: "동기화에 실패했습니다. 잠시 후 다시 시도하세요.",
      insecureContext:
        "동기화하려면 보안 연결이 필요합니다. https(또는 localhost)로 사이트를 여세요. 일반 http에서는 브라우저가 암호화 기능을 꺼 버려서 이 기기에서 데이터를 암호화할 수 없습니다.",
      noBase64Encode: "이 브라우저는 동기화 데이터를 인코딩할 수 없습니다.",
      noBase64Decode: "이 브라우저는 동기화 데이터를 디코딩할 수 없습니다.",
      invalidSyncData: (what: string): string => `동기화 데이터가 올바르지 않습니다 (${what}).`,
      codeRequired: "동기화 코드를 입력하세요.",
      codeTooLong: (max: number): string => `코드가 너무 깁니다. ${max}자여야 합니다.`,
      codeInvalidChars: (chars: string): string => `코드에 쓸 수 없는 문자가 있습니다: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `코드는 ${required}자인데 ${actual}자를 입력했습니다.`,
      keyDerivationFailed: "이 브라우저에서는 동기화 키를 만들 수 없습니다.",
      preparePayloadFailed: "동기화할 데이터를 준비하지 못했습니다.",
      encryptFailed: "이 기기에서 데이터를 암호화하지 못했습니다.",
      decryptFailed: "코드가 이 데이터와 맞지 않거나, 서버의 데이터가 손상되었습니다.",
      invalidSyncId: "동기화 식별자가 올바르지 않습니다.",
      responseTooLarge: "서버가 너무 많은 데이터를 보냈습니다.",
      timeout: "서버가 제때 응답하지 않았습니다.",
      unreachable: "서버에 연결할 수 없습니다. 연결 상태를 확인하세요.",
      invalidResponse: "서버 응답이 올바르지 않습니다.",
      invalidResponseField: (what: string): string => `서버 응답이 올바르지 않습니다 (${what}).`,
      unexpectedFormat: "서버가 예상하지 못한 형식으로 응답했습니다.",
      rateLimited: "짧은 시간에 너무 많이 동기화했습니다. 1분 뒤에 다시 시도하세요.",
      pullRejected: (status: number): string => `서버가 읽기를 거부했습니다 (오류 ${status}).`,
      payloadTooLarge: "데이터가 너무 많아 동기화할 수 없습니다.",
      pushRejected: (status: number): string => `서버가 저장을 거부했습니다 (오류 ${status}).`,
      deleteRejected: (status: number): string => `서버가 삭제를 거부했습니다 (오류 ${status}).`,
      conflict:
        "다른 기기가 지금 같은 데이터를 쓰고 있습니다. 이 기기의 데이터는 안전하니 몇 초 뒤에 다시 시도하세요.",
    },
    status: {
      deleted: "서버에서 데이터가 삭제되었습니다. 이 기기는 더 이상 동기화되지 않습니다.",
      disconnected:
        "이 기기에서는 동기화가 꺼져 있습니다. 즐겨찾기는 여기에 남고, 암호화된 사본은 직접 삭제할 때까지 서버에 남습니다.",
    },
  },

  info: {
    title: "정보",
    subtitle:
      "공식 공개 데이터를 바탕으로 한 로마 대중교통의 시간표와 도착 정보.",
    unofficialTitle: "비공식 앱",
    unofficialBody:
      "이 사이트는 ATAC S.p.A., Roma Servizi per la Mobilità, Roma Capitale와 어떤 제휴, 연관, 승인, 후원 관계도 없습니다. 이들 기관이 공개하는 데이터를 읽기만 하는 독립 프로젝트입니다. 공식 안내, 승차권, 민원은 각 기관의 채널을 이용하세요.",
    whatTitle: "무엇인가요",
    whatBody1:
      "지금 서 있는 정류장에 다음 차가 몇 분 뒤에 오는지 알려 주는 웹 앱입니다. 정류장이나 노선을 검색해 즐겨찾기에 넣으면 홈에서 최신 도착 정보와 함께 볼 수 있습니다. 계정도, 광고도, 이용 통계도 없습니다.",
    whatBody2:
      "실시간 데이터가 해당 운행을 포함하고 있으면 표시되는 시각은 차량 위치를 바탕으로 한 예측입니다. 그렇지 않으면 시간표로 돌아가며, 그 사실을 항상 알려 드립니다. 오래된 데이터를 예측인 척 내놓지 않습니다.",
    dataTitle: "데이터 출처",
    dataBodyBefore:
      "시간표, 정류장, 노선, 경로, 차량 위치, 운행 공지는 다음 기관의 공개 데이터에서 가져옵니다: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS 및 GTFS-Realtime). 시간표는 매일, 실시간 정보는 약 30초마다 갱신됩니다.",
    dataLink: "romamobilita.it — 공개 데이터",
    dataLicence:
      "데이터의 권리는 각 권리자에게 있으며, 공개 시 적용된 라이선스 조건에 따라 사용합니다.",
    privacyTitle: "개인정보",
    privacyBody:
      "로그인도 사용자 프로필도 없습니다. 즐겨찾기, 최근 본 정류장, 설정은 브라우저에만 저장되며 어디로도 전송되지 않습니다. 주변 정류장 검색을 위해 위치를 허용하더라도 위치는 기기 안에 머무릅니다. 거리 계산에만 쓰이고 저장되지 않습니다.",
    faqTitle: "자주 묻는 질문",
    faq1Q: "왜 어떤 노선이나 버스가 보이지 않나요?",
    faq1A:
      "공식 데이터에 있는 것만 표시합니다. 차량이 위치를 보내지 않거나 그 운행이 실시간 데이터에 없으면 저희 쪽에서는 존재하지 않는 것과 같습니다. 잘해야 시간표만 보입니다. 대체 운행, 셔틀버스, 위치 장치가 고장 난 차량에서 자주 생깁니다.",
    faq2Q: "왜 정류장에 적힌 시각과 다른가요?",
    faq2A:
      "승강장 안내판은 시간표상 시각으로, 일 년에 몇 번만 바뀝니다. 여기서는 차량이 데이터를 보낼 때 실제 위치로 계산한 예측을 보여 주며, 교통 상황과 지연이 반영됩니다. 반대로 「예정」이라고 적혀 있으면 예측이 없어 안내판과 같은 시각을 표시하는 것입니다.",
    faq3Q: "밤에는 어떻게 되나요?",
    faq3A:
      "밤에는 운행 차량이 적어 실시간 데이터가 거의 비어 있습니다. 앱은 심야 노선의 시간표로 계속 작동합니다. GTFS에서는 운행일이 자정이 아니라 04:00에 끝납니다. 새벽 1시 운행은 아직 전날에 속하며, 그래서 25:30 같은 시각이 01:30으로 바뀌어 표시될 수 있습니다.",
    faq4Q: "제 즐겨찾기가 서버로 가나요?",
    faq4A:
      "아닙니다. 즐겨찾기, 기록, 설정은 브라우저의 localStorage에 있습니다. 사이트 데이터를 지우거나 기기를 바꾸면 사라집니다. 설정에서 JSON 파일로 내보낸 뒤 다른 곳에서 다시 가져올 수 있습니다.",
    settingsLink: "설정으로 이동",
  },

  footer: {
    dataPrefix: "운행 데이터와 시간표: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (GTFS 공개 데이터).",
    independent:
      "독립 프로젝트이며 ATAC나 Roma Servizi per la Mobilità와 관련이 없습니다. ",
    infoLink: "정보",
  },

  errors: {
    genericTitle: "문제가 발생했습니다",
    unexpected: "예기치 않은 오류",
    unexpectedDot: "예기치 않은 오류.",
    stopNotFound: "정류장을 찾을 수 없습니다",
    serviceDown: "서비스가 응답하지 않습니다",
    requestFailed: (status: number): string => `요청에 실패했습니다 (${status})`,
    httpStatus: (status: number): string => `오류 ${status}`,
    badResponse: "서버 응답이 올바르지 않습니다",
    badResponseDot: "서버 응답이 올바르지 않습니다.",
    timedOut: "요청 시간이 초과되었습니다",
    timedOutDot: "요청 시간이 초과되었습니다.",
    offline: "연결 없음",
    connectionFailed: "연결에 실패했습니다.",
    tooManyRequests: "요청이 너무 많습니다",
    badRequest: "잘못된 매개변수",
    lineNotFound: "노선을 찾을 수 없습니다",
    journeyOriginNotFound: "출발지를 찾을 수 없습니다",
    journeyDestinationNotFound: "도착지를 찾을 수 없습니다",
    journeyPlaceHint: "좀 더 정확한 주소로 시도해 보세요.",
  },

  notFound: {
    kicker: "오류 404",
    title: "정차하지 않는 정류장",
    body:
      "이 페이지는 없습니다. 오래된 링크이거나, 데이터에서 이미 사라진 정류장 또는 노선 번호일 수 있습니다.",
    searchCta: "정류장 검색",
    nearbyCta: "주변 정류장",
  },

  appError: {
    title: "운행 중단",
    body:
      "이 화면을 불러오지 못했습니다. 다시 시도해 보세요. 문제가 계속되면 데이터 서비스가 응답하지 않는 것일 가능성이 큽니다.",
    digest: (digest: string): string => `코드: ${digest}`,
    backHome: "홈으로 돌아가기",
    globalTitle: "서비스 중단",
    globalBody:
      "예기치 않은 오류로 앱이 멈췄습니다. 페이지를 다시 불러오세요. 즐겨찾기는 기기에 저장된 채로 남아 사라지지 않습니다.",
    reload: "다시 불러오기",
  },

  format: {
    due: "곧 도착",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "날짜 없음",
    minutes: (minutes: number): string => `${minutes}분`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "갱신 시각 알 수 없음",
    ageSeconds: (seconds: number): string => `${seconds}초 전 갱신`,
    ageMinutes: (minutes: number): string => `${minutes}분 전 갱신`,
    ageAt: (clock: string): string => `${clock}에 갱신`,
    onTime: "정시",
    delayLate: (minutes: number): string => `+${minutes}분`,
    delayEarly: (minutes: number): string => `${minutes}분`,
  },

  meta: {
    appTitle: "BusFinder — 실시간 출발 정보",
    appDescription:
      "로마 버스, 트램, 지하철의 실시간 시간과 출발 정보. 즐겨찾기, 주변 정류장, 운행 공지까지. 계정도 광고도 없습니다.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "현재 위치에서 가장 가까운 ATAC 정류장을 지도와 지나는 노선과 함께 보여 줍니다.",
    journeyDescription:
      "ATAC 공식 시간표를 바탕으로 로마 안에서 버스, 트램, 지하철로 가는 길을 찾습니다.",
    alertsDescription: "공식 데이터에 올라온 우회, 운행 중지, 운행 변경 안내.",
    settingsDescription: "도착 정보 갱신, 검색 반경, 테마, 저장한 항목 관리.",
    infoDescription:
      "이 앱이 무엇인지, 데이터는 어디서 오는지, 그리고 왜 ATAC나 Roma Servizi per la Mobilità와 관련이 없는지.",
    stopDescription: "정류장의 실시간 출발 정보와 시간표.",
    lineDescription: "노선의 경로, 정류장, 실시간 차량.",
  },

  skeleton: {
    loading: "불러오는 중",
  },
};

const EFFECT_KO: Record<string, string | undefined> = {
  NO_SERVICE: "운행 중단",
  REDUCED_SERVICE: "감축 운행",
  SIGNIFICANT_DELAYS: "심한 지연",
  DETOUR: "우회",
  ADDITIONAL_SERVICE: "증회 운행",
  MODIFIED_SERVICE: "운행 변경",
  STOP_MOVED: "정류장 이전",
  NO_EFFECT: "운행에 영향 없음",
  ACCESSIBILITY_ISSUE: "접근성 문제",
  OTHER_EFFECT: "기타",
  UNKNOWN_EFFECT: "영향 미표시",
};

const CAUSE_KO: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "기술 고장",
  STRIKE: "파업",
  DEMONSTRATION: "집회",
  ACCIDENT: "사고",
  HOLIDAY: "공휴일",
  WEATHER: "악천후",
  MAINTENANCE: "정비",
  CONSTRUCTION: "도로 공사",
  POLICE_ACTIVITY: "경찰 조치",
  MEDICAL_EMERGENCY: "응급 상황",
  OTHER_CAUSE: "기타 사유",
  UNKNOWN_CAUSE: "사유 미표시",
};
