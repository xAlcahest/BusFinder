/**
 * Japanese dictionary. Shape and key order follow it.ts, the source of truth.
 * Japanese has no plural inflection, so counted strings interpolate directly
 * and need no plural helper.
 */

import type { Dictionary } from "./it";

export const ja: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder、ホーム",
  },

  a11y: {
    skipToContent: "本文へ移動",
  },

  common: {
    retry: "再試行",
    cancel: "キャンセル",
    save: "保存",
    close: "閉じる",
    home: "ホーム",
    back: "戻る",
    all: "すべて",
    loading: "読み込み中…",
    searching: "検索中…",
    refresh: "更新",
    dash: "—",
    minutesShort: "分",
    clearSearch: "検索をクリア",
    searchInProgress: "検索中",
  },

  nav: {
    primary: "メインナビゲーション",
    sidebar: "サイドバー",
    sidebarNav: "サイドナビゲーション",
    openMenu: "メニューを開く",
    closeMenu: "メニューを閉じる",
    sections: "セクション",
    shortcuts: "ショートカット",
    infoAria: "アプリについて",
    home: "ホーム",
    nearbyShort: "近く",
    nearby: "近くの停留所",
    journey: "ルート",
    alerts: "運行情報",
    settings: "設定",
    info: "情報",
    hintNearby: "この辺りを走っている便",
    hintJourney: "ある地点から別の地点へ",
    hintAlerts: "迂回と運休",
    hintSettings: "更新、テーマ、データ",
    hintInfo: "データ元と法的事項",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "路面電車";
        case 1:
          return "地下鉄";
        case 2:
          return "鉄道";
        case 4:
          return "フェリー";
        default:
          return "バス";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "トラム";
        case 1:
          return "地下鉄";
        case 2:
          return "鉄道";
        case 3:
          return "バス";
        default:
          return "路線";
      }
    },
    named: (name: string): string => `${name} 系統`,
    namedAria: (name: string): string => `${name} 系統`,
    details: "詳細",
    towards: (headsign: string): string => `${headsign} 方面`,
    towardsCapital: (headsign: string): string => `${headsign} 方面`,
    direction: "方向",
    terminus: "終点",
    noHeadsign: "行き先の表示なし",
  },

  stops: {
    code: (code: string): string => `停留所 ${code}`,
    codeOnly: "停留所",
    pole: (code: string): string => `のりば ${code}`,
    accessible: "バリアフリー対応の停留所",
    named: (name: string): string => `${name} 停留所`,
    countLabel: (count: number): string => `${count} 停留所`,
    involved: (count: number): string => `${count} 停留所が対象`,
  },

  home: {
    kicker: "ローマ · 公共交通",
    title: "次はいつ来る？",
    intro:
      "停留所を番号か名前で、あるいは路線で検索してください。到着時刻はローマのリアルタイム配信から取得しています。",
  },

  search: {
    inputAria: "停留所または路線を検索",
    placeholder: "停留所、通り、または路線",
    searchingFor: (query: string): string => `「${query}」を検索中…`,
    noResultsFor: (query: string): string => `「${query}」に該当する結果はありません`,
    noResultsHint:
      "停留所番号（例：70101）、通りの名前、または系統番号でお試しください。",
    resultsList: "検索結果",
    keyboardHint: "↑ ↓ で移動、Enter で開く、Esc で閉じる",
  },

  favorites: {
    heading: "お気に入り",
    emptyTitle: "まだお気に入りはありません",
    emptyHint:
      "停留所や路線の横にある ★ をタップしてください。検索結果、近くの停留所、停留所のページ、路線のページのどこからでも登録できます。以後は毎回探さなくてもここから開けます。",
    reorder: "並べ替え",
    reorderDone: "完了",
    reorderHint: "矢印で停留所を移動します。並び順はこの端末でのみ有効です。",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}：${total} 件中 ${position} 番目。`,
    moveUp: (name: string): string => `${name} を上へ`,
    moveDown: (name: string): string => `${name} を下へ`,
    addStar: (name: string): string => `停留所 ${name} に星を付ける`,
    removeStar: (name: string): string => `停留所 ${name} の星を外す`,
    addStarLine: (name: string): string => `路線 ${name} に星を付ける`,
    removeStarLine: (name: string): string => `路線 ${name} の星を外す`,
    starredTitle: "星付き：お気に入りに登録済み",
    starTitle: "星を付ける",
    starredLabel: "星付き",
    starLabel: "星",
    editLabels: (name: string): string => `${name} のラベルと路線を編集`,
    onlyLines: (labels: string): string => `${labels} のみ`,
    notUpdated: "未更新",
    noArrivalsOnPinned: "選択した路線に便がありません。",
    changeLines: "路線を変更",
    noArrivalsSoon: "この先数分間は便がありません。",
    openForTimes: "開いて時刻を見る",
    vehiclesUnavailable: "車両情報を取得できません",
    lookingForVehicles: "運行中の車両を探しています…",
    noVehiclesNow: "現在運行中の車両はありません",
    vehiclesInService: (count: number): string => `現在 ${count} 台が運行中`,
    refreshArrivals: "到着情報を更新",
    undoRemovedStop: "停留所の星を外しました：お気に入りから削除されました。",
    undoRemovedLine: "路線の星を外しました：お気に入りから削除されました。",
    undoDismiss: "通知を閉じる",
    more: (count: number): string => `他 ${count} 件のお気に入り`,
    sidebarEmptyBefore: "停留所や路線の横にある星をタップしてください。検索結果、",
    sidebarEmptyAfter: "、または今見ているページから登録できます。以後はここから開けます。",
    nextDeparture: "次の便",
    noDeparture: "利用できる便がありません",
    notAvailableShort: "—",
  },

  recents: {
    heading: "最近見た停留所",
    clear: "消去",
    emptyTitle: "最近見た停留所はありません",
    emptyHint:
      "開いた停留所は数日間ここに残るので、もう一度検索しなくても見つけられます。",
    listAria: "最近見た停留所",
    justNow: "たった今",
    today: "今日",
    yesterday: "昨日",
  },

  arrivals: {
    due: "まもなく到着",
    live: "リアルタイム",
    scheduled: "時刻表",
    scheduledTail: " 予定",
    scheduledSr: "時刻表の時間",
    onTime: "定刻",
    lateBy: (minutes: number): string => `+${minutes} 分`,
    earlyBy: (minutes: number): string => `−${minutes} 分`,
    lateSuffix: "遅れ",
    earlySuffix: "早発",
    lateSr: (minutes: number): string => `${minutes} 分の遅れ`,
    earlySr: (minutes: number): string => `${minutes} 分早い`,
    skipped: "運休",
    skippedSr: "この便は運休",
    atClock: (clock: string): string => `${clock}`,
    towardsSr: (headsign: string): string => `${headsign} 方面`,
    loadingAria: "到着情報を読み込み中",
    emptyTitle: "予定されている便はありません",
    emptyHint:
      "近づいている便はありません。時刻表を見るか、少し経ってからもう一度お試しください。",
    frozenUnknown: "予測が更新されていません",
    frozenFor: (minutes: number): string => `${minutes} 分間停止`,
    frozenPrefix: (state: string): string => `予測${state}`,
    frozenSr: (state: string): string => `予測${state}、リアルタイムでは更新されていません`,
    expectedSr: (relative: string, clock: string): string => `${relative}に到着予定、${clock}`,
    bannerNoRealtimeStrong: "リアルタイム情報を利用できません。",
    bannerNoRealtime:
      " 時刻表を表示しています。車両は早く来ることも遅れることもあります。",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "リアルタイム情報が停止しています。" : `リアルタイム情報が ${minutes} 分間停止しています。`,
    bannerFrozenBefore: " 以下の予測は",
    bannerFrozenLastUpdate: "最後の更新",
    bannerFrozenAt: (clock: string): string => `（${clock}）`,
    bannerFrozenAfter: "の時点のもので、更新は止まっています。参考程度にご覧ください。",
    bannerPartialStrong: "リアルタイム情報が一部のみです。",
    bannerPartial: " データの一部が届いていません。一部の便が欠けている可能性があります。",
    showOnMap: (line: string): string => `${line} 系統の車両を地図に表示`,
    hideOnMap: (line: string): string => `${line} 系統の車両の強調を解除`,
  },

  dataAge: {
    prefix: "更新",
    now: "たった今",
    secondsAgo: (seconds: number): string => `${seconds} 秒前`,
    minutesAgo: (minutes: number): string => `${minutes} 分前`,
    atClock: (clock: string): string => `${clock}`,
    never: "なし",
  },

  refreshFeedback: {
    updated: "更新しました",
    unchanged: "確認しました。新しい情報はありません",
    failed: "更新できませんでした",
    updatedShort: "更新済み",
    unchangedShort: "新着なし",
    failedShort: "未更新",
    busy: "更新中…",
    busySpoken: "更新中",
  },

  stop: {
    tabArrivals: "到着",
    tabTimetable: "時刻表",
    tabsAria: "停留所の表示",
    editTag: "ラベルを編集",
    addTag: "ラベル",
    map: "地図",
    realtimePrefix: "リアルタイム",
    noRealtime: "リアルタイムのデータがありません",
    pageNotUpdated: "ページはまだ更新されていません",
    pageUpdatedAt: (clock: string): string => `ページは ${clock} に更新`,
    lastDataSuffix: (error: string): string => `${error}。最後に受信したデータを表示しています。`,
    arrivalsUnavailable: "到着情報を利用できません",
    emptyHint:
      "今のところ近づいている便はありません。次の便がいつ来る予定かは時刻表で確認できます。",
    seeTimetable: "時刻表を見る",
    linesHere: "ここに停まる路線",
  },

  tagDialog: {
    titleFavorite: "お気に入り",
    titleTag: "停留所のラベル",
    label: "あなたの呼び方",
    placeholder: "自宅、職場、ジム…",
    hint: (maxChars: number): string =>
      `あなただけのものです。この端末に残り、最大 ${maxChars} 文字までです。`,
    linesLegend: "表示する路線",
    linesNone: "未選択：カードにはすべての路線が表示されます。",
    linesSome: (count: number): string => `カードには ${count} 路線のみ表示。`,
    showAllLines: "すべての路線を表示",
    removeTag: "ラベルを削除",
  },

  timetable: {
    previousDay: "前の日",
    nextDay: "次の日",
    today: "今日",
    scheduled: "時刻表",
    jumpToNow: "現在時刻へ",
    backToToday: "今日に戻る",
    fromServiceStart: "始発から",
    unavailableTitle: "時刻表を利用できません",
    partialError: (error: string): string => `${error}。読み込み済みの便を表示しています。`,
    emptyTitle: "これ以降の便はありません",
    emptyFromNow:
      "この時刻以降に便はありません。始発から見る、別の日を選ぶ、または路線の絞り込みを外してみてください。",
    emptyWholeDay:
      "この日は便が設定されていません。前日か翌日を試すか、路線の絞り込みを外してください。",
    loadMore: "さらに便を表示",
    loadingMore: "読み込み中…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${from} から ${to} まで ${count} 便` +
      (complete ? "、終発まで" : "") +
      "。運行日の公式時刻で、リアルタイム情報は含みません。",
  },

  map: {
    fallbackAria: "地図",
    vehiclesHeading: "地図上の車両",
    show: "表示",
    hide: "非表示",
    modeGroup: "表示する車両",
    modeApproaching: "ここへ向かう便",
    modeAllLines: "すべての路線",
    loadingStop: "停留所の位置を読み込み中…",
    stopMapAria: (stopName: string): string => `${stopName} 停留所の車両地図`,
    centreOnStop: "停留所を中心にする",
    nearbyVehicles: "この近くの車両",
    allVehicles: "遠くのものも含めてすべて",
    loadingVehicles: "車両を読み込み中…",
    noneApproaching: "近づいている車両はありません",
    approachingCount: (count: number): string => `${count} 台が接近中`,
    onTheseLines: (count: number): string => `この停留所の路線に ${count} 台`,
    positionsAt: (clock: string): string => `${clock} 時点の位置`,
    positionsStale: "位置情報が更新されていません",
    allLinesNote:
      "はっきり表示されている車両はこの停留所へ向かっています。薄い車両は同じ路線を走っていますが、今はここを通りません。",
    approachingList: "接近中の車両",
    hereIn: (relative: string): string => `${relative}にここへ`,
    hereInAt: (relative: string, clock: string): string => `${relative}にここへ、${clock}`,
    notInbound: "この路線を走行中ですが、この停留所へは向かっていません",
    noBearing: " · 進行方向の送信なし",
    follow: "この車両に乗っています。追跡する",
    unfollow: "追跡をやめる",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `${line} 系統、${relative}にここへ${followed ? "、追跡中" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `${line} 系統、走行中、この停留所へは向かっていません${followed ? "、追跡中" : ""}`,
    yourPosition: "現在地",
    vehicleTitle: (vehicleId: string): string => `車両 ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName} を地図に表示`,
    divertedSuffix: " · 経路外",
    divertedBadge: "経路外",
    divertedNote: "予定とは異なる経路を走行しています。",
  },

  follow: {
    headlineLive: "この車両を追跡しています",
    headlinePaused: "追跡を一時停止中",
    headlineStale: "位置が動いていません",
    headlineLost: "車両が路線から外れました",
    detailLive: "更新のたびに地図はこの車両を中心に保たれます。",
    detailPaused:
      "地図を動かしたので、こちらからは動かしません。車両に戻るには「再開」をタップしてください。",
    detailStaleUnknown: "この車両はしばらく位置を送信していません。",
    detailStale: (age: string): string =>
      `この車両は ${age} 送信がありません。地図上の位置は最後に確認できた地点です。`,
    detailLost:
      "位置を受信できなくなりました。運行を終えたか、営業から外れた可能性があります。",
    ageMinutes: (minutes: number): string => `${minutes} 分`,
    ageHours: (hours: number): string => `${hours} 時間`,
    compact: "追跡中",
    compactSr: (line: string): string => ` ${line} 系統`,
    lineSr: (line: string): string => `、${line} 系統`,
    resume: "再開",
    exit: "終了",
    close: "閉じる",
    lostHint: "まだ走っていれば「すべての路線」に切り替えると見つかります。",
  },

  nearby: {
    title: "近くの停留所",
    mapAria: "近くの停留所の地図",
    searchHere: "このエリアで検索",
    radius: "半径",
    locating: "位置を取得中…",
    myPosition: "現在地",
    geoDenied:
      "位置情報の許可が拒否されました。ローマ中心部を表示しています。地図を動かしてそのエリアで検索してください。",
    geoUnavailable:
      "現在位置を取得できません。ローマ中心部を表示しています。地図を動かしてそのエリアで検索してください。",
    geoTimeout:
      "位置の取得に時間がかかりすぎました。ローマ中心部を表示しています。地図を動かしてもう一度お試しください。",
    geoUnsupported:
      "このブラウザは位置情報に対応していません。地図を動かして停留所を探してください。",
    outsideRome: "ローマの範囲外です。市の中心部を表示しています。",
    outsideCoverage: "このエリアは対象範囲外です。地図をローマへ動かしてください。",
    focusStopMissing: "指定された停留所が見つかりません。あなたのエリアを表示しています。",
    focusStopFailed: (error: string): string => `指定された停留所を読み込めませんでした（${error}）。`,
    stopsFailed: (error: string): string => `停留所を読み込めませんでした：${error}`,
    loadingStops: "停留所を探しています…",
    noStopsInRadius: (radius: string): string =>
      `${radius} 以内に停留所はありません。半径を広げるか、地図を動かしてみてください。`,
    onMapCap: (max: number): string => `（地図には最初の ${max} 件）`,
    noLines: "路線なし",
    arrivalsLink: "到着",
    showMoreStops: "さらに停留所を表示",
  },

  line: {
    loading: "路線を読み込み中…",
    loadFailed: (error: string): string => `路線を読み込めませんでした：${error}`,
    mapAria: (name: string): string => `${name} 系統の地図`,
    dataAt: (clock: string): string => `${clock} 時点のデータ`,
    updatedAt: (clock: string): string => `${clock} 更新`,
    vehiclesStale: (error: string): string => `車両情報が未更新：${error}`,
    noPathForDirection: "この方向の経路データはありません",
    stopsHeading: (count: number): string => `停留所（${count}）`,
    noStopsForDirection: "この方向に利用できる停留所はありません。",
    showAllStops: "すべての停留所を表示",
  },

  lineService: {
    inService: (count: number): string => `${count} 台が路線上`,
    loadingVehicles: "車両を読み込み中…",
    checkingTimetable: "時刻表を確認中…",
    feedDownTitle: "リアルタイムの位置情報を利用できません",
    feedDownDetail:
      "運行自体は正常な場合もあります。車両の位置が読み取れないだけです。",
    noneReporting: "位置を送信している車両がありません",
    unknownDetail:
      "路線が運休しているという意味ではありません。時刻表は停留所のページで確認できます。",
    scheduledDetail: (count: number): string =>
      `運行は予定されています。今から今日の終わりまでに ${count} 便の予定です。`,
    finishedTitle: "本日の運行は終了しました",
    finishedDetail: (count: number, clock: string): string =>
      `本日は ${count} 便の予定で、最終は ${clock} でした。`,
    noneTodayTitle: "本日の予定便はありません",
    noneTodayDetail: "この路線には本日の時刻表上の便がありません。",
    noneTodayFrom: (stopName: string): string =>
      `${stopName} からは本日の時刻表上の便がありません。`,
    nextDepartures: "次の発車",
    nextDeparturesFrom: (stopName: string): string => `（${stopName} 発）`,
    scheduledOnly: "時刻表のみ、リアルタイム情報はありません。",
  },

  journey: {
    title: "ルート",
    subtitle: "ローマの街を、バス・トラム・地下鉄で目的地まで。",
    from: "出発",
    to: "到着",
    placeholder: "停留所、住所、または場所",
    swap: "入れ替え",
    whenLegend: "時刻",
    now: "今すぐ",
    pickTime: "時刻を選ぶ",
    timeLabel: "出発の日時",
    submit: "ルートを検索",
    resultsHeading: "ルート候補",
    emptyTitle: "どこへ行きますか？",
    emptyHint:
      "出発地と到着地を入力してください。公式の時刻表をもとに最適なルートを探します。",
    searching: "ルートを検索中…",
    noResultsTitle: "ルートが見つかりません",
    noResultsHint:
      "直通、または乗り換え 1 回までの経路のみを探しています。出発地か時刻を変えてみてください。",
    disclaimer:
      "リアルタイムではなく時刻表に基づいています。実際の遅れは反映されません。徒歩区間は直線距離での概算なので、実際の道のりはこれより長くなります。",
    searchedFrom: (when: string): string => ` ${when} 以降で検索。`,
    mapAria: "選択したルートの地図",
    mapCaption:
      "乗車区間は路線の実際の経路に沿っています。破線は直線距離での概算で、乗り換えの徒歩区間と、経路データのない一部の路線です。",
    missingEndpoints: "出発地と到着地の両方を入力してください。",
    badDateTime: "日付と時刻が正しくありません。",
    geoUnsupported: "このブラウザは位置情報に対応していません。",
    geoUnavailable: "現在位置を取得できません。",
    geoOutsideRome: "ローマの範囲外です。住所を入力してください。",
    geoDenied: "位置情報の許可が拒否されました。住所を入力してください。",
    geoTimeout: "位置の取得に時間がかかりすぎました。",
    originMarker: (name: string): string => `出発：${name}`,
    destinationMarker: (name: string): string => `到着：${name}`,
    useMyPosition: "現在地を使う",
    clearField: (label: string): string => `${label}を消去`,
    suggestionsFor: (label: string): string => `${label}の候補`,
    placeStop: "停留所",
    placeCoord: "座標",
    placeAddress: "住所",
    walkOnly: "徒歩のみ",
    walkOnlyShort: "徒歩",
    noTransfers: "乗り換えなし",
    transfers: (count: number): string => `乗り換え ${count} 回`,
    walkDistance: (distance: string): string => `徒歩 ${distance}`,
    walkLeg: (distance: string, duration: string): string =>
      `徒歩 ${distance}、約 ${duration} で `,
    inService: "運行中",
    stopCount: (count: number): string => `${count} 停留所`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `ルート ${index}：出発 ${departure}、到着 ${arrival}`,
    lineDetailsAria: (line: string): string => `${line} 系統、詳細`,
    hours: (hours: number): string => `${hours} 時間`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} 時間 ${minutes}`,
    noticeNoOriginStops: "出発地点から徒歩圏内に停留所がありません。系統に近い住所を試してください。",
    noticeNoDestinationStops: "到着地点から徒歩圏内に停留所がありません。系統に近い住所を試してください。",
    noticeNoConnection: "この 2 つのエリアを結ぶ便が、今後数時間は見つかりません。",
    noticeWalkOnlyLeft: "今後数時間はダイヤ上の接続がありません。徒歩ルートだけが残ります。",
    noticeLaterDepartures: "この先 1 時間半は運行がありません。その後の最も早い便を表示します。",
  },

  alerts: {
    title: "運行情報",
    subtitle: "公式配信に掲載された迂回、運休、変更のお知らせ。",
    loading: "読み込み中…",
    degraded:
      "リアルタイム配信が応答しないか古くなっています。この運行情報は最新でない可能性があります。",
    loadFailed: "運行情報を読み込めませんでした。",
    refreshFailed: (error: string): string =>
      `最後の更新に失敗しました（${error}）。以前の一覧を表示しています。`,
    searchPlaceholder: "検索：ストライキ、迂回、通り…",
    searchAria: "運行情報を検索",
    filterByLine: "路線で絞り込む",
    allLines: (count: number): string => `すべての路線（${count}）`,
    networkWide: "全線のお知らせ",
    clearFilters: "リセット",
    noMatch: "条件に合う運行情報はありません。",
    filteredCount: (shown: number, total: number): string =>
      `${total} 件中 ${shown} 件。`,
    activeCount: (count: number, lines: number): string =>
      `${lines} 路線で ${count} 件の運行情報が有効です。`,
    goToLine: "路線へ移動",
    noneTitle: "有効な運行情報はありません",
    noneHint:
      "現在、運休や運行変更の情報は配信されていません。出かける前にもう一度ご確認ください。",
    noResultsTitle: "結果がありません",
    noResultsHint:
      "語数を減らして試すか、絞り込みをリセットしてすべての運行情報を表示してください。",
    noSelectionTitle: "運行情報が選択されていません",
    noSelectionHint: "左の一覧から運行情報を選ぶと全文が読めます。",
    showMoreLines: (count: number): string => `さらに路線を表示（${count}）`,
    goToLineShort: "路線へ移動",
    fallbackHeader: "運行情報",
    noDetail: "事業者からの詳細の掲載はありません。",
    operatorLink: "事業者のサイトで詳細を見る",
    affectedLines: "対象の路線",
    alsoOn: "他にも",
    contextHeading: (count: number): string => `${count} 件の運行情報`,
    contextAria: "運行情報",
    contextAll: "すべて",
    contextUnavailable: (error: string): string => `運行情報を利用できません：${error}`,
    contextMore: (count: number): string => `他 ${count} 件の運行情報は`,
    contextMoreLink: "運行情報のページへ",
    contextStale: (error: string): string =>
      `最後の更新に失敗しました（${error}）。この運行情報は最新でない可能性があります。`,
    windowBetween: (from: string, until: string): string => `${from} から ${until} まで`,
    windowFrom: (from: string): string => `${from} から、終了日の記載なし`,
    windowUntil: (until: string): string => `${until} まで`,
    windowUnknown: "有効期間の記載なし",
    effect: (code: string): string | null => EFFECT_JA[code] ?? null,
    cause: (code: string): string | null => CAUSE_JA[code] ?? null,
  },

  settings: {
    title: "設定",
    subtitle: "すべてこの端末に残ります。アカウントもサーバーもありません。",
    sectionArrivals: "到着",
    autoRefresh: "自動更新",
    everySeconds: (seconds: number): string => `${seconds} 秒ごと`,
    autoRefreshHint: "リアルタイム配信を読み取る間隔です。",
    maxArrivals: "停留所ごとに表示する到着数",
    showScheduled: "時刻表を表示する",
    showScheduledHint:
      "ある停留所にリアルタイムの情報がないときは時刻表を使います。",
    sectionNearby: "現在地の周辺",
    radius: "検索半径",
    radiusHint: "近くの停留所の地図にあるクイック半径にも適用されます。",
    sectionAppearance: "外観",
    themeLegend: "テーマ",
    themeSystem: "システム",
    themeLight: "ライト",
    themeDark: "ダーク",
    sectionLanguage: "言語",
    languageLegend: "インターフェースの言語",
    languageSystem: "システム",
    languageHint: (resolved: string): string =>
      `「システム」ではブラウザの言語に従います。現在は${resolved}です。`,
    sectionBackup: "お気に入りのバックアップ",
    backupIntro:
      "端末に保存する JSON ファイルです。アカウントがないので、お気に入りを別のブラウザへ移す手段はこれになります。",
    exportCount: (count: number): string => `書き出し（${count}）`,
    importFromFile: "ファイルから読み込む",
    exported: (count: number): string => `${count} 件のお気に入りを書き出しました。`,
    exportFailed: "このブラウザでは書き出しに失敗しました。",
    fileTooLarge: "ファイルが大きすぎて、お気に入りのバックアップとは考えられません。",
    fileUnreadable: "ファイルを読み取れませんでした。",
    importEmpty: "ファイルが空です。",
    importNotJson: "ファイルが正しい JSON ではありません。",
    importNoList: "ファイルにお気に入りの一覧が含まれていません。",
    importNoneValid: "ファイルに有効なお気に入りが見つかりませんでした。",
    importFound: (count: number): string => `有効なお気に入りが ${count} 件見つかりました`,
    importSkipped: (count: number): string => `、${count} 件を除外しました。`,
    importFoundEnd: "。",
    importMerge: "統合",
    importReplace: "置き換え",
    replaced: (count: number): string => `お気に入りを置き換えました：現在 ${count} 件です。`,
    mergedNone: "追加する新しいお気に入りはありません。",
    merged: (count: number): string => `${count} 件のお気に入りを追加しました。`,
    sectionLocalData: "ローカルデータ",
    localDataSummary: (favorites: number, recents: number): string =>
      `お気に入り ${favorites} 件、履歴の停留所 ${recents} 件。`,
    confirmClearFavorites: "すべてのお気に入りを削除しますか？この操作は元に戻せません。",
    confirmClearFavoritesYes: "はい、削除します",
    clearFavorites: "お気に入りを空にする",
    favoritesCleared: "お気に入りを空にしました。",
    confirmClearRecents: "見た停留所の履歴を削除しますか？",
    confirmClearRecentsYes: "はい、削除します",
    clearRecents: "履歴を削除",
    recentsCleared: "履歴を削除しました。",
    resetDefaults: "初期設定に戻す",
    settingsReset: "設定を初期値に戻しました。",
    infoLink: "情報、データ元、よくある質問",
  },

  sync: {
    titleFull: "端末を同期",
    titleCollapsed: "同期",
    badgeOn: "有効",
    summaryLoading: "…",
    summaryUnavailable: "この接続では利用できません",
    summaryOff: "無効",
    summarySyncing: "同期中…",
    summaryError: "同期エラー",
    summaryConflict: "解決が必要な競合があります",
    summaryOn: (last: string): string => `有効 · 最終 ${last}`,
    intro:
      "コードを使って、お気に入り・履歴・設定を別の端末に持っていけます。データはこの端末で暗号化され、サーバーには読めない状態のものだけが保存されます。",
    enable: "同期を有効にする",
    haveCode: "コードを持っています",
    codeLabel: "同期コード",
    codeHint:
      "20 文字。もう一方の端末に表示されているとおりに入力してください。大文字・小文字、ハイフン、スペースは区別しません。",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} 文字`,
    join: "接続",
    onIntro:
      "データは端末を出る前に暗号化されます。コードを持つ人はあなたのお気に入りをすべて読めます。自分の端末だけで使ってください。",
    code: "コード",
    showCode: "コードを表示",
    hideCode: "コードを隠す",
    copyCode: "コードをコピー",
    copied: "コピーしました",
    lastSync: "最終同期：",
    inProgress: " · 実行中…",
    syncNow: "今すぐ同期",
    disconnect: "接続を解除",
    disconnectNote:
      "接続を解除してもデータはこの端末に残り、暗号化されたコピーは削除するまでサーバーに残ります。",
    deleteWarning:
      "サーバー上の暗号化コピーを削除します。他の端末は同期する対象を見つけられなくなります。元に戻せません。",
    deleteConfirm: "本当に削除する",
    deleteRemote: "サーバーのデータを削除",
    justNow: "たった今",
    minutesAgo: (minutes: number): string => `${minutes} 分前`,
    atClock: (clock: string): string => `${clock}`,
    errors: {
      aborted: "操作をキャンセルしました。",
      generic: "同期に失敗しました。少し待ってからもう一度お試しください。",
      insecureContext:
        "同期には安全な接続が必要です。https（または localhost）でサイトを開いてください。通常の http ではブラウザが暗号化機能を無効にするため、この端末でデータを暗号化できません。",
      noBase64Encode: "このブラウザは同期データをエンコードできません。",
      noBase64Decode: "このブラウザは同期データをデコードできません。",
      invalidSyncData: (what: string): string => `同期データが正しくありません（${what}）。`,
      codeRequired: "同期コードを入力してください。",
      codeTooLong: (max: number): string => `コードが長すぎます。${max} 文字です。`,
      codeInvalidChars: (chars: string): string =>
        `コードに使えない文字が含まれています：${chars}。`,
      codeWrongLength: (required: number, actual: number): string =>
        `コードは ${required} 文字です。入力されたのは ${actual} 文字です。`,
      keyDerivationFailed: "このブラウザでは同期キーを生成できません。",
      preparePayloadFailed: "同期するデータを準備できませんでした。",
      encryptFailed: "この端末でデータを暗号化できませんでした。",
      decryptFailed: "コードがこのデータと一致しないか、サーバー上のデータが壊れています。",
      invalidSyncId: "同期 ID が正しくありません。",
      responseTooLarge: "サーバーの応答データが大きすぎます。",
      timeout: "サーバーから時間内に応答がありませんでした。",
      unreachable: "サーバーに接続できません。通信状況を確認してください。",
      invalidResponse: "サーバーの応答が正しくありません。",
      invalidResponseField: (what: string): string =>
        `サーバーの応答が正しくありません（${what}）。`,
      unexpectedFormat: "サーバーの応答が予期しない形式でした。",
      rateLimited: "短時間に同期しすぎです。1 分ほど待ってからお試しください。",
      pullRejected: (status: number): string =>
        `サーバーが読み取りを拒否しました（エラー ${status}）。`,
      payloadTooLarge: "データが多すぎて同期できません。",
      pushRejected: (status: number): string =>
        `サーバーが保存を拒否しました（エラー ${status}）。`,
      deleteRejected: (status: number): string =>
        `サーバーが削除を拒否しました（エラー ${status}）。`,
      conflict:
        "別の端末が今この同じデータを書き込んでいます。この端末のデータは無事です。数秒後にもう一度お試しください。",
    },
    status: {
      deleted: "サーバーからデータが削除されました。この端末はもう同期していません。",
      disconnected:
        "この端末では同期が無効です。お気に入りはここに残り、暗号化されたコピーは削除するまでサーバーに残ります。",
    },
  },

  info: {
    title: "情報",
    subtitle:
      "公式のオープンデータにもとづく、ローマの公共交通の時刻と到着案内。",
    unofficialTitle: "非公式アプリ",
    unofficialBody:
      "このサイトは ATAC S.p.A.、Roma Servizi per la Mobilità、Roma Capitale とは一切関係がなく、承認も後援も受けていません。これらの機関が公開しているオープンデータを読み取るだけの独立したプロジェクトです。公式の案内、乗車券、苦情については各機関の窓口をご利用ください。",
    whatTitle: "これは何か",
    whatBody1:
      "今いる停留所に次の便があと何分で来るかを知るためのウェブアプリです。停留所や路線を検索してお気に入りに登録すると、ホームで最新の到着情報とともに見られます。アカウントも広告も利用統計もありません。",
    whatBody2:
      "リアルタイム配信がその便を捉えているとき、表示される時刻は車両の位置にもとづく予測です。そうでないときは時刻表に切り替え、それを必ず明示します。古いデータを予測のように見せることはしません。",
    dataTitle: "データの出どころ",
    dataBodyBefore:
      "時刻、停留所、路線、経路、車両の位置、運行情報は次の機関のオープンデータによるものです：",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      "（GTFS および GTFS-Realtime 配信）。時刻表は毎日、リアルタイム情報はおよそ 30 秒ごとに更新されます。",
    dataLink: "romamobilita.it — オープンデータ",
    dataLicence:
      "データはそれぞれの権利者に帰属し、公開時のライセンス条件のもとで利用しています。",
    privacyTitle: "プライバシー",
    privacyBody:
      "ログインもユーザープロフィールもありません。お気に入り、最近見た停留所、設定はブラウザの中だけに保存され、どこにも送信されません。近くの停留所を探すために位置情報を許可した場合も、位置は端末内にとどまります。距離の計算に使うだけで、保存はしません。",
    faqTitle: "よくある質問",
    faq1Q: "路線やバスが表示されないのはなぜですか？",
    faq1A:
      "公式配信にあるものだけを表示しています。車両が位置を送信していない場合や、その便がリアルタイム配信に含まれていない場合、こちらからは存在しないのと同じです。せいぜい時刻表が見えるだけになります。代替便、シャトルバス、位置情報機器が故障した車両でよく起こります。",
    faq2Q: "停留所に書かれた時刻と違うのはなぜですか？",
    faq2A:
      "のりばの掲示は時刻表の時間で、年に数回しか変わりません。ここでは、車両がデータを送っているときは、その実際の位置から計算した予測を表示します。渋滞や遅れが反映されます。一方「予定」と表示されているときは予測がなく、掲示と同じ時刻を出しています。",
    faq3Q: "夜間はどうなりますか？",
    faq3A:
      "夜間は走っている車両が少ないため、リアルタイム配信はほとんど空になります。アプリは夜間路線の時刻表で動き続けます。GTFS では運行日は深夜 0 時ではなく 04:00 に終わります。午前 1 時の便はまだ前日に属しており、そのため 25:30 のような時刻が 01:30 に変換されて表示されることがあります。",
    faq4Q: "お気に入りはサーバーに送られますか？",
    faq4A:
      "いいえ。お気に入り、履歴、設定はブラウザの localStorage にあります。サイトのデータを消したり端末を変えたりすると失われます。設定から JSON ファイルに書き出し、別の場所で読み込み直せます。",
    settingsLink: "設定へ",
  },

  footer: {
    dataPrefix: "運行データと時刻：",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: "（GTFS オープンデータ）。",
    independent:
      "独立したプロジェクトであり、ATAC や Roma Servizi per la Mobilità とは関係ありません。",
    infoLink: "情報",
  },

  errors: {
    genericTitle: "うまくいきませんでした",
    unexpected: "予期しないエラー",
    unexpectedDot: "予期しないエラー。",
    stopNotFound: "停留所が見つかりません",
    serviceDown: "サービスが応答しません",
    requestFailed: (status: number): string => `リクエストに失敗しました（${status}）`,
    httpStatus: (status: number): string => `エラー ${status}`,
    badResponse: "サーバーの応答が正しくありません",
    badResponseDot: "サーバーの応答が正しくありません。",
    timedOut: "リクエストがタイムアウトしました",
    timedOutDot: "リクエストがタイムアウトしました。",
    offline: "接続がありません",
    connectionFailed: "接続に失敗しました。",
    tooManyRequests: "リクエストが多すぎます",
    badRequest: "パラメーターが正しくありません",
    lineNotFound: "路線が見つかりません",
    journeyOriginNotFound: "出発地が見つかりません",
    journeyDestinationNotFound: "目的地が見つかりません",
    journeyPlaceHint: "もう少し詳しい住所でお試しください。",
  },

  notFound: {
    kicker: "エラー 404",
    title: "この停留所には停まりません",
    body:
      "このページは存在しません。古いリンクや、配信からすでに消えた停留所・路線の番号で起こることがあります。",
    searchCta: "停留所を検索",
    nearbyCta: "近くの停留所",
  },

  appError: {
    title: "運行が中断されました",
    body:
      "この画面を読み込めませんでした。もう一度お試しください。問題が続く場合は、データ提供側が応答していない可能性が高いです。",
    digest: (digest: string): string => `コード：${digest}`,
    backHome: "ホームに戻る",
    globalTitle: "サービス停止",
    globalBody:
      "予期しないエラーでアプリが停止しました。ページを再読み込みしてください。お気に入りは端末に保存されたままで、失われることはありません。",
    reload: "再読み込み",
  },

  format: {
    due: "まもなく到着",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "日付を取得できません",
    minutes: (minutes: number): string => `${minutes} 分`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "更新時刻は不明",
    ageSeconds: (seconds: number): string => `${seconds} 秒前に更新`,
    ageMinutes: (minutes: number): string => `${minutes} 分前に更新`,
    ageAt: (clock: string): string => `${clock} に更新`,
    onTime: "定刻",
    delayLate: (minutes: number): string => `+${minutes} 分`,
    delayEarly: (minutes: number): string => `${minutes} 分`,
  },

  meta: {
    appTitle: "BusFinder — リアルタイムの発車案内",
    appDescription:
      "ローマのバス・トラム・地下鉄の時刻とリアルタイムの発車案内。お気に入り、近くの停留所、運行情報。アカウント不要、広告なし。",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "現在地にいちばん近い ATAC の停留所を、地図と通る路線とあわせて表示します。",
    journeyDescription:
      "ATAC の公式時刻表をもとに、ローマの目的地までバス・トラム・地下鉄での行き方を調べます。",
    alertsDescription: "公式配信で公開された迂回、運休、運行変更の情報。",
    settingsDescription: "到着情報の更新、検索範囲、テーマ、お気に入りの管理。",
    infoDescription:
      "このアプリについて、データの出どころ、そして ATAC や Roma Servizi per la Mobilità とは無関係である理由。",
    stopDescription: "停留所のリアルタイムの発車案内と時刻表。",
    lineDescription: "路線の経路、停留所、走行中の車両。",
  },

  skeleton: {
    loading: "読み込み中",
  },
};

const EFFECT_JA: Record<string, string | undefined> = {
  NO_SERVICE: "運休",
  REDUCED_SERVICE: "減便",
  SIGNIFICANT_DELAYS: "大幅な遅れ",
  DETOUR: "迂回",
  ADDITIONAL_SERVICE: "臨時増便",
  MODIFIED_SERVICE: "運行変更",
  STOP_MOVED: "停留所の移設",
  NO_EFFECT: "運行への影響なし",
  ACCESSIBILITY_ISSUE: "バリアフリーに関する問題",
  OTHER_EFFECT: "その他",
  UNKNOWN_EFFECT: "影響の記載なし",
};

const CAUSE_JA: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "機器故障",
  STRIKE: "ストライキ",
  DEMONSTRATION: "デモ",
  ACCIDENT: "事故",
  HOLIDAY: "祝日",
  WEATHER: "悪天候",
  MAINTENANCE: "保守作業",
  CONSTRUCTION: "道路工事",
  POLICE_ACTIVITY: "警察の活動",
  MEDICAL_EMERGENCY: "救急対応",
  OTHER_CAUSE: "その他の理由",
  UNKNOWN_CAUSE: "理由の記載なし",
};
