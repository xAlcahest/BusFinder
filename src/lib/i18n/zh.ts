/**
 * Simplified Chinese dictionary. Shape and key order follow it.ts, the source
 * of truth. Chinese has no plural inflection, so counted strings interpolate
 * directly and need no plural helper.
 */

import type { Dictionary } from "./it";

export const zh: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder，首页",
  },

  a11y: {
    skipToContent: "跳到主要内容",
  },

  common: {
    retry: "重试",
    cancel: "取消",
    save: "保存",
    close: "关闭",
    home: "首页",
    back: "返回",
    all: "全部",
    loading: "加载中…",
    searching: "搜索中…",
    refresh: "刷新",
    dash: "—",
    minutesShort: "分钟",
    clearSearch: "清除搜索",
    searchInProgress: "正在搜索",
  },

  nav: {
    primary: "主导航",
    sidebar: "侧边栏",
    sidebarNav: "侧边导航",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    sections: "分区",
    shortcuts: "快捷方式",
    infoAria: "关于本应用",
    home: "首页",
    nearbyShort: "附近",
    nearby: "附近站点",
    journey: "路线",
    alerts: "通告",
    settings: "设置",
    info: "信息",
    hintNearby: "附近有哪些车经过",
    hintJourney: "从一点到另一点",
    hintAlerts: "绕行与中断",
    hintSettings: "刷新、主题、数据",
    hintInfo: "数据来源与法律声明",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "有轨电车";
        case 1:
          return "地铁";
        case 2:
          return "火车";
        case 4:
          return "渡轮";
        default:
          return "公交车";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "电车";
        case 1:
          return "地铁";
        case 2:
          return "火车";
        case 3:
          return "公交";
        default:
          return "线路";
      }
    },
    named: (name: string): string => `${name} 路`,
    namedAria: (name: string): string => `${name} 路线`,
    details: "详情",
    towards: (headsign: string): string => `开往 ${headsign}`,
    towardsCapital: (headsign: string): string => `开往 ${headsign}`,
    direction: "方向",
    terminus: "终点站",
    noHeadsign: "未标明终点",
  },

  stops: {
    code: (code: string): string => `站点 ${code}`,
    codeOnly: "站点",
    pole: (code: string): string => `站牌 ${code}`,
    accessible: "无障碍站点",
    named: (name: string): string => `${name} 站`,
    countLabel: (count: number): string => `${count} 个站点`,
    involved: (count: number): string => `涉及 ${count} 个站点`,
  },

  home: {
    kicker: "罗马 · 公共交通",
    title: "下一班什么时候到？",
    intro:
      "按编号或名称搜索站点，也可以搜索线路。到站时间来自罗马的实时数据流。",
  },

  search: {
    inputAria: "搜索站点或线路",
    placeholder: "站点、街道或线路",
    searchingFor: (query: string): string => `正在搜索「${query}」…`,
    noResultsFor: (query: string): string => `没有找到「${query}」的结果`,
    noResultsHint:
      "试试站点编号（例如 70101）、街道名称或线路号。",
    resultsList: "搜索结果",
    keyboardHint: "↑ ↓ 浏览，Enter 打开，Esc 关闭",
  },

  favorites: {
    heading: "收藏",
    emptyTitle: "还没有收藏",
    emptyHint:
      "点一下站点或线路旁边的 ★ 星标：在搜索里、在附近站点里、在站点页面或线路页面上都可以。之后在这里就能找到，不用每次都搜。",
    reorder: "调整顺序",
    reorderDone: "完成",
    reorderHint: "用箭头移动站点。顺序只在本设备上生效。",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}：第 ${position} 位，共 ${total} 个。`,
    moveUp: (name: string): string => `把 ${name} 上移`,
    moveDown: (name: string): string => `把 ${name} 下移`,
    addStar: (name: string): string => `给站点 ${name} 加星标`,
    removeStar: (name: string): string => `取消站点 ${name} 的星标`,
    addStarLine: (name: string): string => `给线路 ${name} 加星标`,
    removeStarLine: (name: string): string => `取消线路 ${name} 的星标`,
    starredTitle: "已加星标：在收藏里",
    starTitle: "加星标",
    starredLabel: "已加星标",
    starLabel: "星标",
    editLabels: (name: string): string => `修改 ${name} 的标签和线路`,
    onlyLines: (labels: string): string => `仅 ${labels}`,
    notUpdated: "未更新",
    noArrivalsOnPinned: "所选线路暂无班次。",
    changeLines: "更改线路",
    noArrivalsSoon: "接下来几分钟没有班次。",
    openForTimes: "打开查看时刻",
    vehiclesUnavailable: "车辆信息不可用",
    lookingForVehicles: "正在查找运营中的车辆…",
    noVehiclesNow: "目前没有车辆在运营",
    vehiclesInService: (count: number): string => `目前有 ${count} 辆车在运营`,
    refreshArrivals: "刷新到站信息",
    undoRemovedStop: "站点已取消星标：不在收藏里了。",
    undoRemovedLine: "线路已取消星标：不在收藏里了。",
    undoDismiss: "关闭提示",
    more: (count: number): string => `另有 ${count} 个收藏`,
    sidebarEmptyBefore: "点一下站点或线路旁边的星标，在搜索里、在 ",
    sidebarEmptyAfter: " 里，或在你正在看的页面上。之后在这里就能找到。",
    nextDeparture: "下一班",
    noDeparture: "暂无班次",
    notAvailableShort: "无",
  },

  recents: {
    heading: "最近查看",
    clear: "清空",
    emptyTitle: "没有最近查看的站点",
    emptyHint:
      "你打开过的站点会在这里保留几天，方便再次找到，不用重新搜索。",
    listAria: "最近查看的站点",
    justNow: "刚刚",
    today: "今天",
    yesterday: "昨天",
  },

  arrivals: {
    due: "即将到站",
    live: "实时",
    scheduled: "按时刻表",
    scheduledTail: " 计划",
    scheduledSr: "计划时刻",
    onTime: "准点",
    lateBy: (minutes: number): string => `+${minutes} 分钟`,
    earlyBy: (minutes: number): string => `−${minutes} 分钟`,
    lateSuffix: "晚点",
    earlySuffix: "早到",
    lateSr: (minutes: number): string => `晚点 ${minutes} 分钟`,
    earlySr: (minutes: number): string => `早到 ${minutes} 分钟`,
    skipped: "已取消",
    skippedSr: "该班次已取消",
    atClock: (clock: string): string => `${clock}`,
    towardsSr: (headsign: string): string => `方向 ${headsign}`,
    loadingAria: "正在加载到站信息",
    emptyTitle: "没有预计班次",
    emptyHint:
      "目前没有正在接近的班次。可以查看计划时刻表，或稍后再试。",
    frozenUnknown: "预测未更新",
    frozenFor: (minutes: number): string => `已停滞 ${minutes} 分钟`,
    frozenPrefix: (state: string): string => `预测${state}`,
    frozenSr: (state: string): string => `预测${state}，未按实时更新`,
    expectedSr: (relative: string, clock: string): string => `预计 ${relative}，${clock}`,
    bannerNoRealtimeStrong: "实时数据不可用。",
    bannerNoRealtime:
      " 我们显示的是计划时刻：车辆可能提前或延后经过。",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "实时数据已停滞。" : `实时数据已停滞 ${minutes} 分钟。`,
    bannerFrozenBefore: " 下面的预测来自",
    bannerFrozenLastUpdate: "最后一次更新",
    bannerFrozenAt: (clock: string): string => `（${clock}）`,
    bannerFrozenAfter: "，之后没有再刷新：请谨慎参考。",
    bannerPartialStrong: "实时数据不完整。",
    bannerPartial: " 有一部分数据没有送达：可能缺少某些班次。",
    showOnMap: (line: string): string => `在地图上显示 ${line} 路的车辆`,
    hideOnMap: (line: string): string => `取消突出显示 ${line} 路的车辆`,
  },

  dataAge: {
    prefix: "更新于",
    now: "刚刚",
    secondsAgo: (seconds: number): string => `${seconds} 秒前`,
    minutesAgo: (minutes: number): string => `${minutes} 分钟前`,
    atClock: (clock: string): string => `${clock}`,
    never: "从未",
  },

  refreshFeedback: {
    updated: "已更新",
    unchanged: "已检查，没有新内容",
    failed: "更新失败",
    updatedShort: "已更新",
    unchangedShort: "没有新内容",
    failedShort: "未更新",
    busy: "正在更新…",
    busySpoken: "正在更新",
  },

  stop: {
    tabArrivals: "到站",
    tabTimetable: "时刻表",
    tabsAria: "站点视图",
    editTag: "修改标签",
    addTag: "标签",
    map: "地图",
    realtimePrefix: "实时",
    noRealtime: "没有实时数据",
    pageNotUpdated: "页面尚未更新",
    pageUpdatedAt: (clock: string): string => `页面于 ${clock} 更新`,
    lastDataSuffix: (error: string): string => `${error}。你看到的是最后收到的数据。`,
    arrivalsUnavailable: "到站信息不可用",
    emptyHint:
      "现在没有正在接近的班次。打开时刻表可以看到下一班预计什么时候来。",
    seeTimetable: "查看时刻表",
    linesHere: "在此停靠的线路",
  },

  tagDialog: {
    titleFavorite: "收藏",
    titleTag: "站点标签",
    label: "你怎么称呼它",
    placeholder: "家、公司、健身房…",
    hint: (maxChars: number): string =>
      `只给你自己看：保存在本设备上，最多 ${maxChars} 个字符。`,
    linesLegend: "要显示的线路",
    linesNone: "未选择：卡片会显示所有线路。",
    linesSome: (count: number): string => `卡片上只显示 ${count} 条线路。`,
    showAllLines: "显示所有线路",
    removeTag: "移除标签",
  },

  timetable: {
    previousDay: "前一天",
    nextDay: "后一天",
    today: "今天",
    scheduled: "计划时刻",
    jumpToNow: "跳到现在",
    backToToday: "回到今天",
    fromServiceStart: "从首班车开始",
    unavailableTitle: "时刻表不可用",
    partialError: (error: string): string => `${error}。你看到的是已加载的班次。`,
    emptyTitle: "从这里往后没有班次",
    emptyFromNow:
      "从这个时间起没有更多班次了。可以从首班车开始查看、换一天，或者取消线路筛选。",
    emptyWholeDay:
      "这一天没有安排任何班次：试试前一天或后一天，或者取消线路筛选。",
    loadMore: "显示更多班次",
    loadingMore: "加载中…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${from} 至 ${to} 共 ${count} 个班次` +
      (complete ? "，直到末班车" : "") +
      "。这是该运营日的官方时刻，不含实时数据。",
  },

  map: {
    fallbackAria: "地图",
    vehiclesHeading: "地图上的车辆",
    show: "显示",
    hide: "隐藏",
    modeGroup: "显示哪些车辆",
    modeApproaching: "开往这里",
    modeAllLines: "所有线路",
    loadingStop: "正在加载站点位置…",
    stopMapAria: (stopName: string): string => `${stopName} 站的车辆地图`,
    centreOnStop: "以站点为中心",
    nearbyVehicles: "附近的车辆",
    allVehicles: "全部，包括远处的",
    loadingVehicles: "正在加载车辆…",
    noneApproaching: "没有正在接近的车辆",
    approachingCount: (count: number): string => `${count} 辆车正在驶来`,
    onTheseLines: (count: number): string => `本站线路上共有 ${count} 辆车`,
    positionsAt: (clock: string): string => `${clock} 的位置`,
    positionsStale: "位置未更新",
    allLinesNote:
      "颜色饱满的车辆正开往本站，颜色浅的在同样的线路上运行，但目前不经过这里。",
    approachingList: "正在驶来的车辆",
    hereIn: (relative: string): string => `${relative}到这里`,
    hereInAt: (relative: string, clock: string): string => `${relative}到这里，${clock}`,
    notInbound: "在本线路上运行，但不开往本站",
    noBearing: " · 未传送方向",
    follow: "我在这辆车上，跟踪它",
    unfollow: "停止跟踪",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `${line} 路，${relative}到这里${followed ? "，正在跟踪" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `${line} 路，运行中，不开往本站${followed ? "，正在跟踪" : ""}`,
    yourPosition: "你的位置",
    vehicleTitle: (vehicleId: string): string => `车辆 ${vehicleId}`,
    showOnMap: (stopName: string): string => `在地图上显示 ${stopName}`,
    divertedSuffix: " · 偏离线路",
    divertedBadge: "偏离线路",
    divertedNote: "它正在走一条与计划不同的路线。",
  },

  follow: {
    headlineLive: "正在跟踪这辆车",
    headlinePaused: "跟踪已暂停",
    headlineStale: "位置停滞",
    headlineLost: "车辆已离线",
    detailLive: "每次更新时地图都会保持以它为中心。",
    detailPaused:
      "你移动了地图，所以我不再移动它了。点「继续」回到车辆位置。",
    detailStaleUnknown: "这辆车已经有一段时间没有传送位置了。",
    detailStale: (age: string): string =>
      `这辆车已有 ${age} 没有传送数据：地图上显示的是最后已知位置。`,
    detailLost:
      "已经收不到它的位置了。可能已经跑完这一班，或者退出运营了。",
    ageMinutes: (minutes: number): string => `${minutes} 分钟`,
    ageHours: (hours: number): string => `${hours} 小时`,
    compact: "跟踪中",
    compactSr: (line: string): string => ` ${line} 路`,
    lineSr: (line: string): string => `，${line} 路`,
    resume: "继续",
    exit: "退出",
    close: "关闭",
    lostHint: "如果它还在路上，切换到「所有线路」就能找到。",
  },

  nearby: {
    title: "附近站点",
    mapAria: "附近站点地图",
    searchHere: "搜索这一带",
    radius: "半径",
    locating: "正在定位…",
    myPosition: "我的位置",
    geoDenied:
      "定位权限被拒绝。我们显示罗马市中心：移动地图后在该区域搜索。",
    geoUnavailable:
      "目前无法获取位置。我们显示罗马市中心：移动地图后在该区域搜索。",
    geoTimeout:
      "定位耗时过长。我们显示罗马市中心：移动地图后再试一次。",
    geoUnsupported:
      "此浏览器不支持定位。请移动地图来查找站点。",
    outsideRome: "你在罗马地区之外：我们显示市中心。",
    outsideCoverage: "该区域超出覆盖范围。请把地图移到罗马。",
    focusStopMissing: "找不到请求的站点：我们显示你所在的区域。",
    focusStopFailed: (error: string): string => `请求的站点未加载（${error}）。`,
    stopsFailed: (error: string): string => `站点未加载：${error}`,
    loadingStops: "正在查找站点…",
    noStopsInRadius: (radius: string): string =>
      `${radius} 范围内没有站点。可以扩大半径，或者移动地图。`,
    onMapCap: (max: number): string => `（地图上显示前 ${max} 个）`,
    noLines: "没有线路",
    arrivalsLink: "到站",
    showMoreStops: "显示更多站点",
  },

  line: {
    loading: "正在加载线路…",
    loadFailed: (error: string): string => `线路未加载：${error}`,
    mapAria: (name: string): string => `${name} 路线路图`,
    dataAt: (clock: string): string => `${clock} 的数据`,
    updatedAt: (clock: string): string => `${clock} 更新`,
    vehiclesStale: (error: string): string => `车辆未更新：${error}`,
    noPathForDirection: "该方向没有可用的线路走向",
    stopsHeading: (count: number): string => `站点（${count}）`,
    noStopsForDirection: "该方向没有可用的站点。",
    showAllStops: "显示所有站点",
  },

  lineService: {
    inService: (count: number): string => `线路上有 ${count} 辆车`,
    loadingVehicles: "正在加载车辆…",
    checkingTimetable: "正在查看时刻表…",
    feedDownTitle: "实时位置不可用",
    feedDownDetail:
      "运营可能一切正常：只是我们读不到车辆的位置。",
    noneReporting: "没有车辆上报位置",
    unknownDetail:
      "这不代表线路停运：计划时刻在某个站点的页面上可以查到。",
    scheduledDetail: (count: number): string =>
      `运营已排班：从现在到今天结束还有 ${count} 个预计班次。`,
    finishedTitle: "今天的运营已结束",
    finishedDetail: (count: number, clock: string): string =>
      `今天共 ${count} 个计划班次，末班在 ${clock}。`,
    noneTodayTitle: "今天没有计划班次",
    noneTodayDetail: "这条线路今天没有按时刻表运行的班次。",
    noneTodayFrom: (stopName: string): string =>
      `从 ${stopName} 出发，今天没有按时刻表运行的班次。`,
    nextDepartures: "下面几班发车",
    nextDeparturesFrom: (stopName: string): string => `（从 ${stopName}）`,
    scheduledOnly: "计划时刻，不含实时数据。",
  },

  journey: {
    title: "路线",
    subtitle: "在罗马乘公交、电车和地铁从一点到另一点。",
    from: "出发",
    to: "到达",
    placeholder: "站点、地址或地点",
    swap: "对调",
    whenLegend: "时间",
    now: "现在",
    pickTime: "选择时间",
    timeLabel: "出发日期和时间",
    submit: "查找路线",
    resultsHeading: "路线方案",
    emptyTitle: "你想去哪里？",
    emptyHint:
      "填写出发地和目的地：我们会根据官方时刻表找出最合适的路线。",
    searching: "正在查找路线…",
    noResultsTitle: "没有路线",
    noResultsHint:
      "我们只查找直达或换乘一次的连接。可以试着改变出发地或时间。",
    disclaimer:
      "使用的是计划时刻而非实时数据：不考虑实际延误。步行段按直线距离估算，因此沿街道的实际距离会更长。",
    searchedFrom: (when: string): string => ` 从 ${when} 起搜索。`,
    mapAria: "所选路线的地图",
    mapCaption:
      "乘车段沿线路的实际走向绘制。虚线段按直线估算：换乘步行段，以及少数没有走向数据的线路。",
    missingEndpoints: "请同时填写出发地和目的地。",
    badDateTime: "日期和时间无效。",
    geoUnsupported: "此浏览器不支持定位。",
    geoUnavailable: "目前无法获取位置。",
    geoOutsideRome: "你在罗马地区之外：请输入一个地址。",
    geoDenied: "定位权限被拒绝：请输入一个地址。",
    geoTimeout: "定位耗时过长。",
    originMarker: (name: string): string => `出发：${name}`,
    destinationMarker: (name: string): string => `到达：${name}`,
    useMyPosition: "使用我的位置",
    clearField: (label: string): string => `清空${label}`,
    suggestionsFor: (label: string): string => `${label}的建议`,
    placeStop: "站点",
    placeCoord: "坐标",
    placeAddress: "地址",
    walkOnly: "全程步行",
    walkOnlyShort: "步行",
    noTransfers: "无需换乘",
    transfers: (count: number): string => `换乘 ${count} 次`,
    walkDistance: (distance: string): string => `步行 ${distance}`,
    walkLeg: (distance: string, duration: string): string =>
      `步行 ${distance}，约 ${duration} 到 `,
    inService: "运营中",
    stopCount: (count: number): string => `${count} 站`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `路线 ${index}：出发 ${departure}，到达 ${arrival}`,
    lineDetailsAria: (line: string): string => `${line} 路，详情`,
    hours: (hours: number): string => `${hours} 小时`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} 小时 ${minutes}`,
    noticeNoOriginStops: "出发点步行范围内没有站点：试试离线路更近的地址。",
    noticeNoDestinationStops: "到达点步行范围内没有站点：试试离线路更近的地址。",
    noticeNoConnection: "接下来几个小时内，这两个区域之间没有可用的连接。",
    noticeWalkOnlyLeft: "接下来几个小时内时刻表上没有班次：只剩下步行路线。",
    noticeLaterDepartures: "接下来一个半小时没有班次：显示之后最早的几班。",
  },

  alerts: {
    title: "运营通告",
    subtitle: "官方数据流发布的绕行、停运和变更。",
    loading: "加载中…",
    degraded:
      "实时数据流没有响应或者太旧：这些通告可能不是最新的。",
    loadFailed: "无法加载通告。",
    refreshFailed: (error: string): string =>
      `最后一次更新失败（${error}）：你看到的是之前的列表。`,
    searchPlaceholder: "搜索：罢工、绕行、街道…",
    searchAria: "在通告中搜索",
    filterByLine: "按线路筛选",
    allLines: (count: number): string => `所有线路（${count}）`,
    networkWide: "全网通告",
    clearFilters: "重置",
    noMatch: "没有符合筛选条件的通告。",
    filteredCount: (shown: number, total: number): string =>
      `共 ${total} 条，显示 ${shown} 条。`,
    activeCount: (count: number, lines: number): string =>
      `${lines} 条线路上有 ${count} 条生效中的通告。`,
    goToLine: "前往线路",
    noneTitle: "没有生效中的通告",
    noneHint:
      "目前数据流没有报告任何中断或运营变更。出门前建议再看一次。",
    noResultsTitle: "没有结果",
    noResultsHint:
      "试试少用几个词，或者重置筛选条件查看全部通告。",
    noSelectionTitle: "未选择通告",
    noSelectionHint: "从左边的列表里选一条通告，就能读到全文。",
    showMoreLines: (count: number): string => `显示更多线路（${count}）`,
    goToLineShort: "前往线路",
    fallbackHeader: "运营通告",
    noDetail: "运营方没有发布详情。",
    operatorLink: "在运营方网站查看详情",
    affectedLines: "受影响的线路",
    alsoOn: "另见",
    contextHeading: (count: number): string => `${count} 条生效中的通告`,
    contextAria: "运营通告",
    contextAll: "全部",
    contextUnavailable: (error: string): string => `通告不可用：${error}`,
    contextMore: (count: number): string => `另有 ${count} 条通告，见`,
    contextMoreLink: "通告页面",
    contextStale: (error: string): string =>
      `最后一次更新失败（${error}）：这些通告可能已经过时。`,
    windowBetween: (from: string, until: string): string => `${from} 至 ${until}`,
    windowFrom: (from: string): string => `自 ${from} 起，未注明结束时间`,
    windowUntil: (until: string): string => `截至 ${until}`,
    windowUnknown: "未注明有效期",
    effect: (code: string): string | null => EFFECT_ZH[code] ?? null,
    cause: (code: string): string | null => CAUSE_ZH[code] ?? null,
  },

  settings: {
    title: "设置",
    subtitle: "一切都留在本设备上。没有账号，也没有服务器。",
    sectionArrivals: "到站",
    autoRefresh: "自动刷新",
    everySeconds: (seconds: number): string => `每 ${seconds} 秒`,
    autoRefreshHint: "两次读取实时数据流之间的间隔。",
    maxArrivals: "每个站点显示的到站数量",
    showScheduled: "显示计划时刻",
    showScheduledHint:
      "当某个站点没有实时数据时，改用时刻表。",
    sectionNearby: "我附近",
    radius: "搜索半径",
    radiusHint: "对附近站点地图上的快捷半径同样有效。",
    sectionAppearance: "外观",
    themeLegend: "主题",
    themeSystem: "跟随系统",
    themeLight: "浅色",
    themeDark: "深色",
    sectionLanguage: "语言",
    languageLegend: "界面语言",
    languageSystem: "跟随系统",
    languageHint: (resolved: string): string =>
      `选择「跟随系统」时，我们使用浏览器的语言：现在是${resolved}。`,
    sectionBackup: "收藏备份",
    backupIntro:
      "一个存在你设备上的 JSON 文件：这里没有账号，所以这是把收藏搬到另一个浏览器的办法。",
    exportCount: (count: number): string => `导出（${count}）`,
    importFromFile: "从文件导入",
    exported: (count: number): string => `已导出 ${count} 个收藏。`,
    exportFailed: "在此浏览器上导出失败。",
    fileTooLarge: "文件太大，不像是收藏备份。",
    fileUnreadable: "无法读取文件。",
    importEmpty: "文件是空的。",
    importNotJson: "文件不是有效的 JSON。",
    importNoList: "文件里没有收藏列表。",
    importNoneValid: "文件里没有找到有效的收藏。",
    importFound: (count: number): string => `找到 ${count} 个有效收藏`,
    importSkipped: (count: number): string => `，丢弃了 ${count} 条。`,
    importFoundEnd: "。",
    importMerge: "合并",
    importReplace: "替换",
    replaced: (count: number): string => `收藏已替换：现在有 ${count} 个。`,
    mergedNone: "没有新的收藏可以添加。",
    merged: (count: number): string => `已添加 ${count} 个收藏。`,
    sectionLocalData: "本地数据",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} 个收藏，历史记录里有 ${recents} 个站点。`,
    confirmClearFavorites: "删除所有收藏？此操作无法撤销。",
    confirmClearFavoritesYes: "是的，清空",
    clearFavorites: "清空收藏",
    favoritesCleared: "收藏已清空。",
    confirmClearRecents: "删除已查看站点的历史记录？",
    confirmClearRecentsYes: "是的，删除",
    clearRecents: "删除历史记录",
    recentsCleared: "历史记录已删除。",
    resetDefaults: "恢复默认设置",
    settingsReset: "设置已恢复为默认值。",
    infoLink: "信息、数据来源与常见问题",
  },

  sync: {
    titleFull: "同步设备",
    titleCollapsed: "同步",
    badgeOn: "已开启",
    summaryLoading: "…",
    summaryUnavailable: "此连接下不可用",
    summaryOff: "未开启",
    summarySyncing: "正在同步…",
    summaryError: "同步出错",
    summaryConflict: "有冲突待解决",
    summaryOn: (last: string): string => `已开启 · 最近 ${last}`,
    intro:
      "用一个代码把收藏、最近记录和设置带到另一台设备上。数据在本机加密：服务器只保存无法读取的内容。",
    enable: "开启同步",
    haveCode: "我已经有代码了",
    codeLabel: "同步代码",
    codeHint:
      "20 个字符，照着另一台设备上显示的输入。大小写、连字符和空格都不影响。",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} 个字符`,
    join: "连接",
    onIntro:
      "数据在离开本设备之前就已加密。拿到代码的人可以读取你所有的收藏：只在自己的设备上使用它。",
    code: "代码",
    showCode: "显示代码",
    hideCode: "隐藏代码",
    copyCode: "复制代码",
    copied: "已复制",
    lastSync: "上次同步：",
    inProgress: " · 进行中…",
    syncNow: "立即同步",
    disconnect: "断开",
    disconnectNote:
      "断开后数据仍留在本设备上，加密副本会一直保存在服务器上，直到你把它删除。",
    deleteWarning:
      "从服务器删除加密副本。其他设备将再也找不到可同步的内容。此操作无法撤销。",
    deleteConfirm: "确认删除",
    deleteRemote: "删除服务器上的数据",
    justNow: "刚刚",
    minutesAgo: (minutes: number): string => `${minutes} 分钟前`,
    atClock: (clock: string): string => `${clock}`,
    errors: {
      aborted: "操作已取消。",
      generic: "同步失败。请稍后再试。",
      insecureContext:
        "同步需要安全连接：请用 https 打开本站（或在 localhost 上）。在普通 http 下浏览器会关闭加密功能，数据无法在本设备上加密。",
      noBase64Encode: "此浏览器无法编码同步数据。",
      noBase64Decode: "此浏览器无法解码同步数据。",
      invalidSyncData: (what: string): string => `同步数据无效（${what}）。`,
      codeRequired: "请输入同步代码。",
      codeTooLong: (max: number): string => `代码太长了：应该是 ${max} 个字符。`,
      codeInvalidChars: (chars: string): string => `代码里有不允许的字符：${chars}。`,
      codeWrongLength: (required: number, actual: number): string =>
        `代码应该是 ${required} 个字符，你输入了 ${actual} 个。`,
      keyDerivationFailed: "此浏览器无法生成同步密钥。",
      preparePayloadFailed: "无法准备要同步的数据。",
      encryptFailed: "无法在本设备上加密数据。",
      decryptFailed: "代码与这些数据不匹配，或者服务器上的数据已损坏。",
      invalidSyncId: "同步标识无效。",
      responseTooLarge: "服务器返回的数据太多了。",
      timeout: "服务器没有及时响应。",
      unreachable: "无法连接到服务器。请检查网络。",
      invalidResponse: "服务器返回无效。",
      invalidResponseField: (what: string): string => `服务器返回无效（${what}）。`,
      unexpectedFormat: "服务器返回的格式不符合预期。",
      rateLimited: "短时间内同步次数太多。请一分钟后再试。",
      pullRejected: (status: number): string => `服务器拒绝了读取（错误 ${status}）。`,
      payloadTooLarge: "数据太多，无法同步。",
      pushRejected: (status: number): string => `服务器拒绝了保存（错误 ${status}）。`,
      deleteRejected: (status: number): string => `服务器拒绝了删除（错误 ${status}）。`,
      conflict:
        "另一台设备正在写入同一份数据。本机数据是安全的：请过几秒再试。",
    },
    status: {
      deleted: "数据已从服务器删除。本设备不再同步。",
      disconnected:
        "本设备已关闭同步。收藏仍留在这里，加密副本会一直保存在服务器上，直到你把它删除。",
    },
  },

  info: {
    title: "信息",
    subtitle:
      "罗马公共交通的时刻与到站信息，来自官方开放数据。",
    unofficialTitle: "非官方应用",
    unofficialBody:
      "本网站与 ATAC S.p.A.、Roma Servizi per la Mobilità 或 Roma Capitale 没有任何隶属、关联、授权或支持关系。这是一个独立项目，只读取这些机构公开发布的开放数据。官方信息、车票和投诉请通过它们自己的渠道处理。",
    whatTitle: "这是什么",
    whatBody1:
      "一个网页应用，用来知道你所在的站点下一班车还有多久到。搜索一个站点或线路，收藏起来，就能在首页看到最新的到站时间。没有账号，没有广告，也不做使用统计。",
    whatBody2:
      "当实时数据流覆盖到这一班时，显示的时间是根据车辆位置算出的预测。否则应用会退回到计划时刻，并且总会明确告诉你，而不是把旧数据冒充成预测。",
    dataTitle: "数据从哪里来",
    dataBodyBefore:
      "时刻、站点、线路、走向、车辆位置和运营通告都来自以下机构的开放数据：",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      "（GTFS 与 GTFS-Realtime 数据流）。计划时刻每天更新，实时数据大约每 30 秒更新一次。",
    dataLink: "romamobilita.it — 开放数据",
    dataLicence:
      "数据仍归各自权利人所有，并按其发布时所附许可的条件使用。",
    privacyTitle: "隐私",
    privacyBody:
      "没有登录，也没有用户档案。收藏、最近查看的站点和设置只保存在你的浏览器里，不会发送到任何地方。如果你为查找附近站点授权了位置，它只留在设备上：用来计算距离，不会被保存。",
    faqTitle: "常见问题",
    faq1Q: "为什么有的线路或公交车没有出现？",
    faq1A:
      "我们只显示官方数据流里有的内容。如果一辆车不上报位置，或者它的班次不在实时数据流里，对我们来说它就不存在：最多只能看到计划时刻。这在替班车、接驳车和定位设备损坏的车辆上很常见。",
    faq2Q: "为什么时间和站牌上写的不一样？",
    faq2A:
      "站牌上写的是计划时刻，一年只改动几次。在这里，当车辆有数据传回时，你看到的是根据它真实位置算出的预测，会考虑路况和延误。而当你看到「计划」时，说明没有预测，我们显示的就是站牌上的同一个时间。",
    faq3Q: "夜间是什么情况？",
    faq3A:
      "夜间实时数据流几乎是空的，因为在跑的车很少。应用会继续用夜间线路的计划时刻工作。在 GTFS 里，运营日不是在午夜结束，而是在 04:00：凌晨一点的班次仍属于前一天，所以你可能会看到 25:30 这样的时间被换算成 01:30。",
    faq4Q: "我的收藏会上传到服务器吗？",
    faq4A:
      "不会。收藏、历史记录和设置都存在浏览器的 localStorage 里。如果你清除了网站数据或者换了设备，它们就没了：可以在设置里把它们导出成 JSON 文件，再在别处导入。",
    settingsLink: "前往设置",
  },

  footer: {
    dataPrefix: "运营数据与时刻：",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: "（GTFS 开放数据）。",
    independent:
      "独立项目，与 ATAC 或 Roma Servizi per la Mobilità 无关联。",
    infoLink: "信息",
  },

  errors: {
    genericTitle: "出了点问题",
    unexpected: "意外错误",
    unexpectedDot: "意外错误。",
    stopNotFound: "找不到站点",
    serviceDown: "服务没有响应",
    requestFailed: (status: number): string => `请求失败（${status}）`,
    httpStatus: (status: number): string => `错误 ${status}`,
    badResponse: "服务器返回无效",
    badResponseDot: "服务器返回无效。",
    timedOut: "请求超时",
    timedOutDot: "请求超时。",
    offline: "没有网络连接",
    connectionFailed: "连接失败。",
    tooManyRequests: "请求过于频繁",
    badRequest: "参数无效",
    lineNotFound: "找不到线路",
    journeyOriginNotFound: "找不到出发地",
    journeyDestinationNotFound: "找不到目的地",
    journeyPlaceHint: "试试更具体的地址。",
  },

  notFound: {
    kicker: "错误 404",
    title: "此站不停靠",
    body:
      "这个页面不存在。可能是一个旧链接，也可能是某个站点或线路的编号已经不在数据流里了。",
    searchCta: "搜索站点",
    nearbyCta: "附近站点",
  },

  appError: {
    title: "行程中断",
    body:
      "这个页面没能加载出来。请重试：如果问题还在，多半是数据服务没有响应。",
    digest: (digest: string): string => `代码：${digest}`,
    backHome: "回到首页",
    globalTitle: "服务已中止",
    globalBody:
      "应用因为一个意外错误停了下来。请重新加载页面：你的收藏仍保存在手机上，不会丢失。",
    reload: "重新加载",
  },

  format: {
    due: "即将到站",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "日期不可用",
    minutes: (minutes: number): string => `${minutes} 分钟`,
    metres: (metres: number): string => `${metres} 米`,
    kilometres: (value: string): string => `${value} 公里`,
    ageUnknown: "更新时间未知",
    ageSeconds: (seconds: number): string => `${seconds} 秒前更新`,
    ageMinutes: (minutes: number): string => `${minutes} 分钟前更新`,
    ageAt: (clock: string): string => `${clock} 更新`,
    onTime: "准点",
    delayLate: (minutes: number): string => `+${minutes} 分钟`,
    delayEarly: (minutes: number): string => `${minutes} 分钟`,
  },

  meta: {
    appTitle: "BusFinder — 实时发车信息",
    appDescription:
      "罗马公交、有轨电车和地铁的实时时刻与到站信息。收藏、附近站点和运营通告，无需账号，也没有广告。",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "离你最近的 ATAC 站点，附带地图和经过的线路。",
    journeyDescription:
      "按 ATAC 官方时刻，算出在罗马从一处到另一处怎么坐公交、有轨电车和地铁。",
    alertsDescription: "官方数据流发布的绕行、停运和运营调整。",
    settingsDescription: "到站刷新、搜索范围、主题，以及收藏的管理。",
    infoDescription:
      "这个应用是什么，数据从哪里来，以及为什么它与 ATAC 或 Roma Servizi per la Mobilità 无关。",
    stopDescription: "该站点的实时发车与计划时刻。",
    lineDescription: "该线路的走向、站点和实时车辆。",
  },

  skeleton: {
    loading: "加载中",
  },
};

const EFFECT_ZH: Record<string, string | undefined> = {
  NO_SERVICE: "停运",
  REDUCED_SERVICE: "减班运营",
  SIGNIFICANT_DELAYS: "严重延误",
  DETOUR: "绕行",
  ADDITIONAL_SERVICE: "加开班次",
  MODIFIED_SERVICE: "运营调整",
  STOP_MOVED: "站点迁移",
  NO_EFFECT: "对运营无影响",
  ACCESSIBILITY_ISSUE: "无障碍问题",
  OTHER_EFFECT: "其他",
  UNKNOWN_EFFECT: "影响未说明",
};

const CAUSE_ZH: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "技术故障",
  STRIKE: "罢工",
  DEMONSTRATION: "示威游行",
  ACCIDENT: "事故",
  HOLIDAY: "节假日",
  WEATHER: "恶劣天气",
  MAINTENANCE: "维护保养",
  CONSTRUCTION: "道路施工",
  POLICE_ACTIVITY: "警方行动",
  MEDICAL_EMERGENCY: "医疗急救",
  OTHER_CAUSE: "其他原因",
  UNKNOWN_CAUSE: "原因未说明",
};
