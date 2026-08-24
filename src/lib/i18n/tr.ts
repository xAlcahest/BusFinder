/**
 * Turkish dictionary. Shape and key order follow it.ts, the source of truth.
 * Turkish nouns stay singular after a numeral ("3 durak", never "3 duraklar"),
 * so counted strings interpolate directly and need no plural helper.
 */

import type { Dictionary } from "./it";

export const tr: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, ana sayfa",
  },

  a11y: {
    skipToContent: "İçeriğe geç",
  },

  common: {
    retry: "Yeniden dene",
    cancel: "İptal",
    save: "Kaydet",
    close: "Kapat",
    home: "Ana sayfa",
    back: "Geri",
    all: "Tümü",
    loading: "Yükleniyor…",
    searching: "Aranıyor…",
    refresh: "Yenile",
    dash: "—",
    minutesShort: "dk",
    clearSearch: "Aramayı temizle",
    searchInProgress: "Arama sürüyor",
  },

  nav: {
    primary: "Ana gezinme",
    sidebar: "Yan çubuk",
    sidebarNav: "Yan gezinme",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    sections: "Bölümler",
    shortcuts: "Kısayollar",
    infoAria: "Uygulama hakkında bilgi",
    home: "Ana sayfa",
    nearbyShort: "Yakında",
    nearby: "Yakındaki duraklar",
    journey: "Güzergâh",
    alerts: "Duyurular",
    settings: "Ayarlar",
    info: "Bilgi",
    hintNearby: "Buralardan ne geçiyor",
    hintJourney: "Bir noktadan diğerine",
    hintAlerts: "Sapmalar ve kesintiler",
    hintSettings: "Yenileme, tema, veriler",
    hintInfo: "Kaynaklar ve yasal notlar",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tramvay";
        case 1:
          return "metro";
        case 2:
          return "tren";
        case 4:
          return "vapur";
        default:
          return "otobüs";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tramvay";
        case 1:
          return "Metro";
        case 2:
          return "Tren";
        case 3:
          return "Otobüs";
        default:
          return "Hat";
      }
    },
    named: (name: string): string => `${name} hattı`,
    namedAria: (name: string): string => `${name} hattı`,
    details: "ayrıntılar",
    towards: (headsign: string): string => `${headsign} yönüne`,
    towardsCapital: (headsign: string): string => `${headsign} yönüne`,
    direction: "Yön",
    terminus: "son durak",
    noHeadsign: "Varış noktası belirtilmemiş",
  },

  stops: {
    code: (code: string): string => `${code} numaralı durak`,
    codeOnly: "Durak",
    pole: (code: string): string => `${code} numaralı direk`,
    accessible: "Erişilebilir durak",
    named: (name: string): string => `${name} durağı`,
    countLabel: (count: number): string => `${count} durak`,
    involved: (count: number): string => `${count} durak etkileniyor`,
  },

  home: {
    kicker: "Roma · toplu taşıma",
    title: "Ne zaman geçiyor?",
    intro:
      "Numarasından ya da adından bir durak arayın, veya bir hat. Geçiş saatleri Roma'nın gerçek zamanlı veri akışından geliyor.",
  },

  search: {
    inputAria: "Durak veya hat ara",
    placeholder: "Durak, sokak veya hat",
    searchingFor: (query: string): string => `«${query}» aranıyor…`,
    noResultsFor: (query: string): string => `«${query}» için sonuç yok`,
    noResultsHint:
      "Durak numarasıyla (örneğin 70101), sokak adıyla ya da hat numarasıyla deneyin.",
    resultsList: "Arama sonuçları",
    keyboardHint: "Gezinmek için ↑ ↓, açmak için Enter, kapatmak için Esc",
  },

  favorites: {
    heading: "Sık kullanılanlar",
    emptyTitle: "Henüz sık kullanılan yok",
    emptyHint:
      "Bir durağın veya hattın yanındaki ★ yıldıza dokunun: aramada, Yakındaki duraklarda, durak sayfasında ya da hat sayfasında. Her seferinde aramadan burada bulursunuz.",
    reorder: "Sırala",
    reorderDone: "Bitti",
    reorderHint: "Durakları oklarla taşıyın. Sıralama bu cihazda geçerlidir.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: ${total} içinde ${position}. sıra.`,
    moveUp: (name: string): string => `${name} yukarı taşı`,
    moveDown: (name: string): string => `${name} aşağı taşı`,
    addStar: (name: string): string => `${name} durağına yıldız ekle`,
    removeStar: (name: string): string => `${name} durağından yıldızı kaldır`,
    addStarLine: (name: string): string => `${name} hattına yıldız ekle`,
    removeStarLine: (name: string): string => `${name} hattından yıldızı kaldır`,
    starredTitle: "Yıldızlı: sık kullanılanlarda",
    starTitle: "Yıldız ekle",
    starredLabel: "Yıldızlı",
    starLabel: "Yıldız",
    editLabels: (name: string): string => `${name} için etiketi ve hatları düzenle`,
    onlyLines: (labels: string): string => `yalnızca ${labels}`,
    notUpdated: "güncellenmedi",
    noArrivalsOnPinned: "Seçilen hatlarda geçiş yok.",
    changeLines: "Hatları değiştir",
    noArrivalsSoon: "Önümüzdeki dakikalarda geçiş yok.",
    openForTimes: "Saatler için aç",
    vehiclesUnavailable: "Araçlar kullanılamıyor",
    lookingForVehicles: "Seferdeki araçlar aranıyor…",
    noVehiclesNow: "Şu anda seferde araç yok",
    vehiclesInService: (count: number): string => `${count} araç şu anda seferde`,
    refreshArrivals: "Varışları yenile",
    undoRemovedStop: "Yıldızsız durak: artık sık kullanılanlarda değil.",
    undoRemovedLine: "Yıldızsız hat: artık sık kullanılanlarda değil.",
    undoDismiss: "Bildirimi kapat",
    more: (count: number): string => `${count} sık kullanılan daha`,
    sidebarEmptyBefore: "Bir durağın veya hattın yanındaki yıldıza dokunun, aramada, ",
    sidebarEmptyAfter: " içinde ya da baktığınız sayfada. Burada bulursunuz.",
    nextDeparture: "sonraki geçiş",
    noDeparture: "geçiş bilgisi yok",
    notAvailableShort: "yok",
  },

  recents: {
    heading: "Son bakılanlar",
    clear: "Temizle",
    emptyTitle: "Son durak yok",
    emptyHint:
      "Açtığınız duraklar birkaç gün burada kalır, böylece yeniden aramadan bulursunuz.",
    listAria: "Son bakılan duraklar",
    justNow: "az önce",
    today: "bugün",
    yesterday: "dün",
  },

  arrivals: {
    due: "geliyor",
    live: "gerçek zamanlı",
    scheduled: "tarifeye göre",
    scheduledTail: " tarifeli",
    scheduledSr: "tarifedeki saat",
    onTime: "zamanında",
    lateBy: (minutes: number): string => `+${minutes} dk`,
    earlyBy: (minutes: number): string => `−${minutes} dk`,
    lateSuffix: "gecikme",
    earlySuffix: "erken",
    lateSr: (minutes: number): string => `${minutes} dakika gecikme`,
    earlySr: (minutes: number): string => `${minutes} dakika erken`,
    skipped: "iptal",
    skippedSr: "sefer iptal edildi",
    atClock: (clock: string): string => `saat ${clock}`,
    towardsSr: (headsign: string): string => `${headsign} yönü`,
    loadingAria: "Varışlar yükleniyor",
    emptyTitle: "Beklenen geçiş yok",
    emptyHint:
      "Yaklaşan sefer görünmüyor. Tarifeli saati deneyin ya da birazdan tekrar bakın.",
    frozenUnknown: "tahmin güncel değil",
    frozenFor: (minutes: number): string => `${minutes} dk'dır duruyor`,
    frozenPrefix: (state: string): string => `tahmin ${state}`,
    frozenSr: (state: string): string => `tahmin ${state}, gerçek zamanlı güncellenmiyor`,
    expectedSr: (relative: string, clock: string): string =>
      `${relative} bekleniyor, saat ${clock}`,
    bannerNoRealtimeStrong: "Gerçek zamanlı veri yok.",
    bannerNoRealtime:
      " Tarifeli saatleri gösteriyoruz: araçlar erken ya da geç geçebilir.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Gerçek zamanlı veri durdu." : `Gerçek zamanlı veri ${minutes} dk'dır duruyor.`,
    bannerFrozenBefore: " Aşağıdaki tahminler",
    bannerFrozenLastUpdate: " son güncellemeye",
    bannerFrozenAt: (clock: string): string => ` saat ${clock}`,
    bannerFrozenAfter: " ait ve güncellenmiyor: temkinli yaklaşın.",
    bannerPartialStrong: "Gerçek zamanlı veri kısmi.",
    bannerPartial: " Verilerin bir kısmı gelmedi: bazı seferler eksik olabilir.",
    showOnMap: (line: string): string => `${line} hattının aracını haritada göster`,
    hideOnMap: (line: string): string => `${line} hattının aracındaki vurguyu kaldır`,
  },

  dataAge: {
    prefix: "Güncellendi",
    now: "şimdi",
    secondsAgo: (seconds: number): string => `${seconds} sn önce`,
    minutesAgo: (minutes: number): string => `${minutes} dk önce`,
    atClock: (clock: string): string => `saat ${clock}`,
    never: "hiç",
  },

  refreshFeedback: {
    updated: "Güncellendi",
    unchanged: "Kontrol edildi, yeni bir şey yok",
    failed: "Güncelleme başarısız",
    updatedShort: "Güncellendi",
    unchangedShort: "Yeni bir şey yok",
    failedShort: "Güncellenmedi",
    busy: "Güncelleniyor…",
    busySpoken: "Güncelleme sürüyor",
  },

  stop: {
    tabArrivals: "Varışlar",
    tabTimetable: "Tarife",
    tabsAria: "Durak görünümü",
    editTag: "Etiketi düzenle",
    addTag: "Etiket",
    map: "Harita",
    realtimePrefix: "Gerçek zamanlı",
    noRealtime: "Gerçek zamanlı veri yok",
    pageNotUpdated: "Sayfa henüz güncellenmedi",
    pageUpdatedAt: (clock: string): string => `Sayfa saat ${clock} güncellendi`,
    lastDataSuffix: (error: string): string => `${error}. Alınan son veriyi görüyorsunuz.`,
    arrivalsUnavailable: "Varışlar kullanılamıyor",
    emptyHint:
      "Şu anda yaklaşan sefer yok. Sonraki geçişin ne zaman beklendiğini öğrenmek için tarifeyi açın.",
    seeTimetable: "Tarifeyi gör",
    linesHere: "Burada duran hatlar",
  },

  tagDialog: {
    titleFavorite: "Sık kullanılan",
    titleTag: "Durak etiketi",
    label: "Siz nasıl adlandırıyorsunuz",
    placeholder: "Ev, ofis, spor salonu…",
    hint: (maxChars: number): string =>
      `Yalnızca size özel: bu cihazda kalır, en fazla ${maxChars} karakter.`,
    linesLegend: "Gösterilecek hatlar",
    linesNone: "Seçim yok: kart tüm hatları gösterir.",
    linesSome: (count: number): string => `Kartta yalnızca ${count} hat.`,
    showAllLines: "Tüm hatları göster",
    removeTag: "Etiketi kaldır",
  },

  timetable: {
    previousDay: "Önceki gün",
    nextDay: "Sonraki gün",
    today: "bugün",
    scheduled: "tarifeli saat",
    jumpToNow: "Şimdiye git",
    backToToday: "Bugüne dön",
    fromServiceStart: "Sefer başlangıcından itibaren",
    unavailableTitle: "Tarife kullanılamıyor",
    partialError: (error: string): string => `${error}. Zaten yüklenmiş seferleri görüyorsunuz.`,
    emptyTitle: "Buradan sonra sefer yok",
    emptyFromNow:
      "Bu saatten sonra başka geçiş yok. Sefer başlangıcından, başka bir günden deneyin ya da hat filtresini kaldırın.",
    emptyWholeDay:
      "Bu gün için planlanmış geçiş yok: önceki ya da sonraki günü deneyin, veya hat filtresini kaldırın.",
    loadMore: "Daha fazla sefer göster",
    loadingMore: "Yükleniyor…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${from} - ${to} arasında ${count} sefer` +
      (complete ? ", sefer sonuna kadar" : "") +
      ". Bunlar sefer gününün resmi saatleridir, gerçek zamanlı veri içermez.",
  },

  map: {
    fallbackAria: "Harita",
    vehiclesHeading: "Haritadaki araçlar",
    show: "Göster",
    hide: "Gizle",
    modeGroup: "Hangi araçlar gösterilsin",
    modeApproaching: "Buraya gelenler",
    modeAllLines: "Tüm hatlar",
    loadingStop: "Durağın konumu yükleniyor…",
    stopMapAria: (stopName: string): string => `${stopName} durağındaki araçların haritası`,
    centreOnStop: "Durağa ortala",
    nearbyVehicles: "Buraya yakın araçlar",
    allVehicles: "Uzaktakiler dahil tümü",
    loadingVehicles: "Araçlar yükleniyor…",
    noneApproaching: "Yaklaşan araç yok",
    approachingCount: (count: number): string => `${count} araç geliyor`,
    onTheseLines: (count: number): string => `Bu durağın hatlarında ${count} araç`,
    positionsAt: (clock: string): string => `saat ${clock} konumları`,
    positionsStale: "konumlar güncel değil",
    allLinesNote:
      "Dolu görünen araçlar bu durağa geliyor, soluk olanlar aynı hatlarda seferde ama şu anda buradan geçmiyor.",
    approachingList: "Gelen araçlar",
    hereIn: (relative: string): string => `Burada ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Burada ${relative}, saat ${clock}`,
    notInbound: "Bu hatta seferde, ama bu durağa gelmiyor",
    noBearing: " · yön bildirilmedi",
    follow: "Bu araçtayım, takip et",
    unfollow: "Takibi bırak",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `${line} hattı, burada ${relative}${followed ? ", takip ediyorsunuz" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `${line} hattı, seferde, bu durağa gelmiyor${followed ? ", takip ediyorsunuz" : ""}`,
    yourPosition: "Konumunuz",
    vehicleTitle: (vehicleId: string): string => `Araç ${vehicleId}`,
    showOnMap: (stopName: string): string => `${stopName} durağını haritada göster`,
    divertedSuffix: " · güzergâh dışı",
    divertedBadge: "Güzergâh dışı",
    divertedNote: "Planlanandan farklı bir yol izliyor.",
  },

  follow: {
    headlineLive: "Bu aracı takip ediyorum",
    headlinePaused: "Takip duraklatıldı",
    headlineStale: "Konum sabit",
    headlineLost: "Araç artık hatta değil",
    detailLive: "Harita her güncellemede ona ortalanmış kalıyor.",
    detailPaused:
      "Haritayı siz kaydırdınız, ben artık oynatmıyorum. Araca dönmek için Devam et'e dokunun.",
    detailStaleUnknown: "Araç bir süredir konumunu bildirmiyor.",
    detailStale: (age: string): string =>
      `Araç ${age} önce bildirim yapmayı bıraktı: haritadaki son bilinen noktadır.`,
    detailLost:
      "Konumunu artık almıyorum. Seferi bitirmiş ya da hattan çıkmış olabilir.",
    ageMinutes: (minutes: number): string => `${minutes} dakika`,
    ageHours: (hours: number): string => `${hours} saat`,
    compact: "Takipte",
    compactSr: (line: string): string => ` ${line} hattı`,
    lineSr: (line: string): string => `, ${line} hattı`,
    resume: "Devam et",
    exit: "Çık",
    close: "Kapat",
    lostHint: "Hâlâ seferdeyse «Tüm hatlar»a geçerek bulabilirsiniz.",
  },

  nearby: {
    title: "Yakındaki duraklar",
    mapAria: "Yakındaki durakların haritası",
    searchHere: "Bu bölgede ara",
    radius: "Yarıçap",
    locating: "Konum belirleniyor…",
    myPosition: "Konumum",
    geoDenied:
      "Konum izni reddedildi. Roma'nın merkezini gösteriyoruz: haritayı kaydırıp o bölgede arayın.",
    geoUnavailable:
      "Konum şu anda kullanılamıyor. Roma'nın merkezini gösteriyoruz: haritayı kaydırıp o bölgede arayın.",
    geoTimeout:
      "Konum belirleme çok uzun sürdü. Roma'nın merkezini gösteriyoruz: haritayı kaydırıp tekrar deneyin.",
    geoUnsupported:
      "Bu tarayıcı konum belirlemeyi desteklemiyor. Durakları aramak için haritayı kaydırın.",
    outsideRome: "Roma bölgesinin dışındasınız: şehir merkezini gösteriyoruz.",
    outsideCoverage: "Bu bölge kapsama alanı dışında. Haritayı Roma'ya kaydırın.",
    focusStopMissing: "İstenen durak bulunamadı: sizin bölgenizi gösteriyoruz.",
    focusStopFailed: (error: string): string => `İstenen durak yüklenemedi (${error}).`,
    stopsFailed: (error: string): string => `Duraklar yüklenemedi: ${error}`,
    loadingStops: "Duraklar aranıyor…",
    noStopsInRadius: (radius: string): string =>
      `${radius} içinde durak yok. Yarıçapı genişletmeyi ya da haritayı kaydırmayı deneyin.`,
    onMapCap: (max: number): string => ` (haritada ilk ${max} tanesi)`,
    noLines: "Hat yok",
    arrivalsLink: "Varışlar",
    showMoreStops: "Daha fazla durak göster",
  },

  line: {
    loading: "Hat yükleniyor…",
    loadFailed: (error: string): string => `Hat yüklenemedi: ${error}`,
    mapAria: (name: string): string => `${name} hattının haritası`,
    dataAt: (clock: string): string => `saat ${clock} verileri`,
    updatedAt: (clock: string): string => `saat ${clock} güncellendi`,
    vehiclesStale: (error: string): string => `Araçlar güncellenmedi: ${error}`,
    noPathForDirection: "Bu yön için güzergâh yok",
    stopsHeading: (count: number): string => `Duraklar (${count})`,
    noStopsForDirection: "Bu yön için durak yok.",
    showAllStops: "Tüm durakları göster",
  },

  lineService: {
    inService: (count: number): string => `Hatta ${count} araç`,
    loadingVehicles: "Araçlar yükleniyor…",
    checkingTimetable: "Tarife kontrol ediliyor…",
    feedDownTitle: "Gerçek zamanlı konumlar kullanılamıyor",
    feedDownDetail:
      "Sefer normal olabilir: araçların konumunu okuyamıyoruz.",
    noneReporting: "Hiçbir araç konumunu bildirmiyor",
    unknownDetail:
      "Bu, hattın seferde olmadığı anlamına gelmez: tarifeli saatler bir durağın sayfasında.",
    scheduledDetail: (count: number): string =>
      `Sefer planlanmış: gün sonuna kadar ${count} sefer bekleniyor.`,
    finishedTitle: "Bugünkü seferler bitti",
    finishedDetail: (count: number, clock: string): string =>
      `Bugün ${count} planlı sefer, sonuncusu saat ${clock}.`,
    noneTodayTitle: "Bugün planlı sefer yok",
    noneTodayDetail: "Bu hatta bugün için tarifeli sefer görünmüyor.",
    noneTodayFrom: (stopName: string): string =>
      `${stopName} durağından bugün için tarifeli sefer görünmüyor.`,
    nextDepartures: "Sonraki kalkışlar",
    nextDeparturesFrom: (stopName: string): string => ` ${stopName} durağından`,
    scheduledOnly: "Tarifeli saatler, gerçek zamanlı veri yok.",
  },

  journey: {
    title: "Güzergâh",
    subtitle: "Roma'da bir noktadan diğerine otobüs, tramvay ve metroyla.",
    from: "Kalkış",
    to: "Varış",
    placeholder: "Durak, adres veya yer",
    swap: "Ters çevir",
    whenLegend: "Ne zaman",
    now: "Şimdi",
    pickTime: "Saati seç",
    timeLabel: "Kalkış tarihi ve saati",
    submit: "Güzergâh ara",
    resultsHeading: "Güzergâhlar",
    emptyTitle: "Nereye gitmek istiyorsunuz?",
    emptyHint:
      "Bir kalkış ve bir varış yazın: resmi tarifelere göre en iyi güzergâhı arıyoruz.",
    searching: "Güzergâhlar aranıyor…",
    noResultsTitle: "Güzergâh yok",
    noResultsHint:
      "Yalnızca doğrudan ya da tek aktarmalı bağlantıları arıyoruz. Kalkış noktasını veya saati değiştirmeyi deneyin.",
    disclaimer:
      "Tarifeli saatler, gerçek zamanlı değil: fiili gecikmeler hesaba katılmaz. Yürüme bölümleri kuş uçuşu tahmin edilir, dolayısıyla sokaktaki gerçek mesafe daha uzundur.",
    searchedFrom: (when: string): string => ` ${when} itibarıyla arama.`,
    mapAria: "Seçilen güzergâhın haritası",
    mapCaption:
      "Araçtaki bölümler hattın gerçek güzergâhını izler. Kesikli olanlar kuş uçuşu tahmin edilmiştir: yürüyerek aktarmalar ve güzergâhı olmayan ender hatlar.",
    missingEndpoints: "Hem kalkışı hem varışı belirtin.",
    badDateTime: "Tarih ve saat geçersiz.",
    geoUnsupported: "Bu tarayıcı konum belirlemeyi desteklemiyor.",
    geoUnavailable: "Konum şu anda kullanılamıyor.",
    geoOutsideRome: "Roma bölgesinin dışındasınız: bir adres yazın.",
    geoDenied: "Konum izni reddedildi: bir adres yazın.",
    geoTimeout: "Konum belirleme çok uzun sürdü.",
    originMarker: (name: string): string => `Kalkış: ${name}`,
    destinationMarker: (name: string): string => `Varış: ${name}`,
    useMyPosition: "Konumumu kullan",
    clearField: (label: string): string => `${label} alanını temizle`,
    suggestionsFor: (label: string): string => `${label} alanı için öneriler`,
    placeStop: "Durak",
    placeCoord: "Koordinatlar",
    placeAddress: "Adres",
    walkOnly: "Sadece yürüyerek",
    walkOnlyShort: "yürüyerek",
    noTransfers: "aktarmasız",
    transfers: (count: number): string => `${count} aktarma`,
    walkDistance: (distance: string): string => `${distance} yürüyerek`,
    walkLeg: (distance: string, duration: string): string =>
      `${distance} yürüyerek, yaklaşık ${duration} şuraya kadar: `,
    inService: "seferde",
    stopCount: (count: number): string => `${count} durak`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Güzergâh ${index}: kalkış ${departure}, varış ${arrival}`,
    lineDetailsAria: (line: string): string => `${line} hattı, ayrıntılar`,
    hours: (hours: number): string => `${hours} sa`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} sa ${minutes}`,
    noticeNoOriginStops:
      "Kalkış noktasından yürüme mesafesinde durak yok: bir hatta daha yakın bir adres deneyin.",
    noticeNoDestinationStops:
      "Varış noktasından yürüme mesafesinde durak yok: bir hatta daha yakın bir adres deneyin.",
    noticeNoConnection: "Önümüzdeki birkaç saatte bu iki bölge arasında bağlantı bulunamadı.",
    noticeWalkOnlyLeft:
      "Önümüzdeki birkaç saatte tarifeli bağlantı yok: yalnızca yürüme güzergâhı kalıyor.",
    noticeLaterDepartures:
      "Önümüzdeki bir buçuk saatte sefer yok: sonraki ilk seferleri gösteriyoruz.",
  },

  alerts: {
    title: "Sefer duyuruları",
    subtitle: "Resmi veri akışında yayımlanan sapmalar, iptaller ve değişiklikler.",
    loading: "Yükleniyor…",
    degraded:
      "Gerçek zamanlı akış yanıt vermiyor ya da eski: bu duyurular güncel olmayabilir.",
    loadFailed: "Duyurular yüklenemedi.",
    refreshFailed: (error: string): string =>
      `Son güncelleme başarısız oldu (${error}): önceki listeyi görüyorsunuz.`,
    searchPlaceholder: "Ara: grev, sapma, sokak…",
    searchAria: "Duyurular arasında ara",
    filterByLine: "Hatta göre süz",
    allLines: (count: number): string => `Tüm hatlar (${count})`,
    networkWide: "Genel duyurular",
    clearFilters: "Sıfırla",
    noMatch: "Filtrelere uyan duyuru yok.",
    filteredCount: (shown: number, total: number): string =>
      `${total} duyurudan ${shown} tanesi.`,
    activeCount: (count: number, lines: number): string =>
      `${lines} hatta ${count} etkin duyuru.`,
    goToLine: "Hatta git",
    noneTitle: "Etkin duyuru yok",
    noneHint:
      "Şu anda akış, seferlerde kesinti ya da değişiklik bildirmiyor. Yola çıkmadan önce tekrar bakın.",
    noResultsTitle: "Sonuç yok",
    noResultsHint:
      "Daha az kelimeyle deneyin, ya da tüm duyuruları görmek için filtreleri sıfırlayın.",
    noSelectionTitle: "Seçili duyuru yok",
    noSelectionHint: "Tamamını okumak için soldaki listeden bir duyuru seçin.",
    showMoreLines: (count: number): string => `Daha fazla hat göster (${count})`,
    goToLineShort: "hatta git",
    fallbackHeader: "Sefer duyurusu",
    noDetail: "İşletmeci ayrıntı yayımlamadı.",
    operatorLink: "İşletmecinin sitesinde ayrıntılar",
    affectedLines: "Etkilenen hatlar",
    alsoOn: "Ayrıca şurada",
    contextHeading: (count: number): string => `${count} etkin duyuru`,
    contextAria: "Sefer duyuruları",
    contextAll: "Tümü",
    contextUnavailable: (error: string): string => `Duyurular kullanılamıyor: ${error}`,
    contextMore: (count: number): string => `${count} duyuru daha `,
    contextMoreLink: "duyurular sayfasında",
    contextStale: (error: string): string =>
      `Son güncelleme başarısız oldu (${error}): bu duyurular güncel olmayabilir.`,
    windowBetween: (from: string, until: string): string => `${from} - ${until} arası`,
    windowFrom: (from: string): string => `${from} tarihinden itibaren, bitiş belirtilmemiş`,
    windowUntil: (until: string): string => `${until} tarihine kadar`,
    windowUnknown: "Geçerlilik süresi belirtilmemiş",
    effect: (code: string): string | null => EFFECT_TR[code] ?? null,
    cause: (code: string): string | null => CAUSE_TR[code] ?? null,
  },

  settings: {
    title: "Ayarlar",
    subtitle: "Her şey bu cihazda kalır. Hesap yok, sunucu yok.",
    sectionArrivals: "Varışlar",
    autoRefresh: "Otomatik yenileme",
    everySeconds: (seconds: number): string => `her ${seconds} saniyede`,
    autoRefreshHint: "Gerçek zamanlı akışın iki okuması arasındaki süre.",
    maxArrivals: "Durak başına gösterilen varış sayısı",
    showScheduled: "Tarifeli saatleri göster",
    showScheduledHint:
      "Gerçek zamanlı veride bir durak için bir şey yoksa tarifeyi kullan.",
    sectionNearby: "Yakınımda",
    radius: "Arama yarıçapı",
    radiusHint: "Yakındaki duraklar haritasındaki hızlı yarıçaplar için de geçerlidir.",
    sectionAppearance: "Görünüm",
    themeLegend: "Tema",
    themeSystem: "Sistem",
    themeLight: "Açık",
    themeDark: "Koyu",
    sectionLanguage: "Dil",
    languageLegend: "Arayüz dili",
    languageSystem: "Sistem",
    languageHint: (resolved: string): string =>
      `«Sistem» ile tarayıcının dilini izliyoruz: şu anda ${resolved}.`,
    sectionBackup: "Sık kullanılanların yedeği",
    backupIntro:
      "Cihazınızda bir JSON dosyası: burada hesap olmadığı için sık kullanılanları başka bir tarayıcıya taşımanın yolu budur.",
    exportCount: (count: number): string => `Dışa aktar (${count})`,
    importFromFile: "Dosyadan içe aktar",
    exported: (count: number): string => `${count} sık kullanılan dışa aktarıldı.`,
    exportFailed: "Bu tarayıcıda dışa aktarma başarısız oldu.",
    fileTooLarge: "Dosya, sık kullanılanların yedeği olamayacak kadar büyük.",
    fileUnreadable: "Dosya okunamadı.",
    importEmpty: "Dosya boş.",
    importNotJson: "Dosya geçerli bir JSON değil.",
    importNoList: "Dosyada sık kullanılan listesi yok.",
    importNoneValid: "Dosyada geçerli sık kullanılan bulunamadı.",
    importFound: (count: number): string => `${count} geçerli sık kullanılan bulundu`,
    importSkipped: (count: number): string => `, ${count} kayıt atlandı.`,
    importFoundEnd: ".",
    importMerge: "Birleştir",
    importReplace: "Değiştir",
    replaced: (count: number): string => `Sık kullanılanlar değiştirildi: şimdi ${count} tane.`,
    mergedNone: "Eklenecek yeni sık kullanılan yok.",
    merged: (count: number): string => `${count} sık kullanılan eklendi.`,
    sectionLocalData: "Yerel veriler",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} sık kullanılan, geçmişte ${recents} durak.`,
    confirmClearFavorites: "Tüm sık kullanılanlar silinsin mi? Bu işlem geri alınamaz.",
    confirmClearFavoritesYes: "Evet, temizle",
    clearFavorites: "Sık kullanılanları temizle",
    favoritesCleared: "Sık kullanılanlar temizlendi.",
    confirmClearRecents: "Bakılan durakların geçmişi silinsin mi?",
    confirmClearRecentsYes: "Evet, sil",
    clearRecents: "Geçmişi sil",
    recentsCleared: "Geçmiş silindi.",
    resetDefaults: "Varsayılan ayarlara dön",
    settingsReset: "Ayarlar varsayılan değerlere döndürüldü.",
    infoLink: "Bilgiler, veri kaynakları ve sık sorulan sorular",
  },

  sync: {
    titleFull: "Cihazları eşitle",
    titleCollapsed: "Eşitleme",
    badgeOn: "etkin",
    summaryLoading: "…",
    summaryUnavailable: "Bu bağlantıda kullanılamıyor",
    summaryOff: "Etkin değil",
    summarySyncing: "Eşitleme sürüyor…",
    summaryError: "Eşitleme hatası",
    summaryConflict: "Çözülecek çakışma var",
    summaryOn: (last: string): string => `Etkin · son ${last}`,
    intro:
      "Sık kullanılanları, son bakılanları ve ayarları bir kodla başka bir cihaza taşıyın. Veriler burada şifrelenir: sunucu yalnızca okunamayan veri tutar.",
    enable: "Eşitlemeyi etkinleştir",
    haveCode: "Zaten bir kodum var",
    codeLabel: "Eşitleme kodu",
    codeHint:
      "Diğer cihazda okuduğunuz gibi 20 karakter. Büyük harf, tire ve boşluk önemli değil.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} karakter`,
    join: "Bağlan",
    onIntro:
      "Veriler çıkmadan önce bu cihazda şifrelenir. Kodu olan kişi tüm sık kullanılanlarınızı okuyabilir: yalnızca kendi cihazlarınızda kullanın.",
    code: "Kod",
    showCode: "Kodu göster",
    hideCode: "Kodu gizle",
    copyCode: "Kodu kopyala",
    copied: "Kopyalandı",
    lastSync: "Son eşitleme:",
    inProgress: " · sürüyor…",
    syncNow: "Şimdi eşitle",
    disconnect: "Bağlantıyı kes",
    disconnectNote:
      "Bağlantıyı kestiğinizde veriler bu cihazda kalır, şifreli kopya ise siz silene kadar sunucuda durur.",
    deleteWarning:
      "Şifreli kopyayı sunucudan siler. Diğer cihazlar eşitlenecek bir şey bulamaz. Geri alınamaz.",
    deleteConfirm: "Gerçekten sil",
    deleteRemote: "Verileri sunucudan sil",
    justNow: "şimdi",
    minutesAgo: (minutes: number): string => `${minutes} dk önce`,
    atClock: (clock: string): string => `saat ${clock}`,
    errors: {
      aborted: "İşlem iptal edildi.",
      generic: "Eşitleme başarısız oldu. Birazdan tekrar deneyin.",
      insecureContext:
        "Eşitleme için güvenli bir bağlantı gerekiyor: siteyi https ile (ya da localhost üzerinde) açın. Düz http'de tarayıcılar şifrelemeyi kapatır, bu yüzden bu cihazda hiçbir şey şifrelenemez.",
      noBase64Encode: "Bu tarayıcı eşitleme verisini kodlayamıyor.",
      noBase64Decode: "Bu tarayıcı eşitleme verisinin kodunu çözemiyor.",
      invalidSyncData: (what: string): string => `Eşitleme verisi geçersiz (${what}).`,
      codeRequired: "Eşitleme kodunu girin.",
      codeTooLong: (max: number): string => `Bu kod fazla uzun: ${max} karakter olmalı.`,
      codeInvalidChars: (chars: string): string => `Kodda izin verilmeyen karakterler var: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Kod ${required} karakter olmalı, siz ${actual} karakter yazdınız.`,
      keyDerivationFailed: "Bu tarayıcı eşitleme anahtarlarını üretemiyor.",
      preparePayloadFailed: "Eşitlenecek veriler hazırlanamadı.",
      encryptFailed: "Veriler bu cihazda şifrelenemedi.",
      decryptFailed: "Kod bu verilere uymuyor ya da sunucudaki veriler bozulmuş.",
      invalidSyncId: "Eşitleme kimliği geçersiz.",
      responseTooLarge: "Sunucu çok fazla veri gönderdi.",
      timeout: "Sunucu zamanında yanıt vermedi.",
      unreachable: "Sunucuya ulaşılamıyor. Bağlantınızı kontrol edin.",
      invalidResponse: "Sunucu geçersiz bir yanıt gönderdi.",
      invalidResponseField: (what: string): string =>
        `Sunucu geçersiz bir yanıt gönderdi (${what}).`,
      unexpectedFormat: "Sunucu beklenmeyen bir biçimde yanıt verdi.",
      rateLimited: "Arka arkaya çok fazla eşitleme yapıldı. Bir dakika sonra tekrar deneyin.",
      pullRejected: (status: number): string => `Sunucu okumayı reddetti (hata ${status}).`,
      payloadTooLarge: "Eşitlenemeyecek kadar çok veri var.",
      pushRejected: (status: number): string => `Sunucu kaydetmeyi reddetti (hata ${status}).`,
      deleteRejected: (status: number): string => `Sunucu silmeyi reddetti (hata ${status}).`,
      conflict:
        "Şu anda başka bir cihaz aynı verilere yazıyor. Buradaki verileriniz güvende: birkaç saniye sonra tekrar deneyin.",
    },
    status: {
      deleted: "Veriler sunucudan silindi. Bu cihaz artık eşitlenmiyor.",
      disconnected:
        "Bu cihazda eşitleme kapalı. Verileriniz burada kalır, şifreli kopya ise siz silene kadar sunucuda durur.",
    },
  },

  info: {
    title: "Bilgiler",
    subtitle:
      "Resmi açık verilerden Roma toplu taşımasının tarifeleri ve varışları.",
    unofficialTitle: "Resmi olmayan uygulama",
    unofficialBody:
      "Bu site ATAC S.p.A., Roma Servizi per la Mobilità veya Roma Capitale ile hiçbir şekilde bağlantılı, ilişkili, onaylı ya da desteklenmiş değildir. Bu kurumların yayımladığı açık verileri okumakla yetinen bağımsız bir projedir. Resmi bilgi, bilet ve şikâyetler için onların kanallarına başvurun.",
    whatTitle: "Bu nedir",
    whatBody1:
      "Bulunduğunuz durakta bir sonraki aracın kaç dakika sonra geçeceğini öğrenmek için bir web uygulaması. Bir durak ya da hat arayıp sık kullanılanlara kaydedersiniz, ana sayfada güncel varışlarla bulursunuz. Hesap yok, reklam yok, kullanım istatistiği yok.",
    whatBody2:
      "Gerçek zamanlı akış seferi kapsıyorsa gösterilen saat, aracın konumuna dayalı bir tahmindir. Aksi hâlde uygulama tarifeli saate döner ve eski bir veriyi tahmin diye sunmak yerine bunu size her zaman söyler.",
    dataTitle: "Veriler nereden geliyor",
    dataBodyBefore:
      "Tarifeler, duraklar, hatlar, güzergâhlar, araç konumları ve sefer duyuruları şu kurumun açık verilerinden gelir: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS ve GTFS-Realtime akışları). Tarifeli saatler her gün, gerçek zamanlı veriler yaklaşık 30 saniyede bir güncellenir.",
    dataLink: "romamobilita.it — Açık veri",
    dataLicence:
      "Veriler ilgili hak sahiplerinin mülkiyetinde kalır ve yayımlandıkları lisansın koşullarıyla kullanılır.",
    privacyTitle: "Gizlilik",
    privacyBody:
      "Giriş yok, kullanıcı profili yok. Sık kullanılanlar, son bakılan duraklar ve ayarlar yalnızca tarayıcınızda saklanır ve hiçbir yere gönderilmez. Konum, yakındaki durakları aramak için izin verirseniz, cihazda kalır: mesafeleri hesaplamak için kullanılır ve saklanmaz.",
    faqTitle: "Sık sorulan sorular",
    faq1Q: "Neden bir hat ya da otobüs görünmüyor?",
    faq1A:
      "Yalnızca resmi akışlarda olanı gösteriyoruz. Bir araç konumunu bildirmiyorsa ya da seferi gerçek zamanlı akışta yoksa, bizim için yoktur: en fazla tarifeli saati görürsünüz. Bu, ikame seferlerde, servis otobüslerinde ve takip cihazı bozuk araçlarda sık olur.",
    faq2Q: "Saatler neden durakta yazanlardan farklı?",
    faq2A:
      "Direkteki levha, yılda birkaç kez değişen tarifeli saati gösterir. Burada, araç veri gönderdiğinde, trafiği ve gecikmeleri hesaba katan, gerçek konumuna göre hesaplanmış tahmini görürsünüz. «Tarifeli» yazdığındaysa tahmin yoktur ve levhadakiyle aynı saati gösteriyoruz.",
    faq3Q: "Geceleri ne oluyor?",
    faq3A:
      "Geceleri gerçek zamanlı akış neredeyse boştur, çünkü az araç seferdedir. Uygulama gece hatlarının tarifeli saatleriyle çalışmayı sürdürür. GTFS'te sefer günü gece yarısında değil 04:00'te biter: gece birdeki bir sefer hâlâ önceki güne aittir, bu yüzden 01:30'a çevrilmiş 25:30 gibi saatler görebilirsiniz.",
    faq4Q: "Sık kullanılanlarım bir sunucuya gidiyor mu?",
    faq4A:
      "Hayır. Sık kullanılanlar, geçmiş ve ayarlar tarayıcının localStorage'ında durur. Site verilerini temizler ya da cihaz değiştirirseniz kaybolurlar: ayarlardan bir JSON dosyasına aktarıp başka yerde geri yükleyebilirsiniz.",
    settingsLink: "Ayarlara git",
  },

  footer: {
    dataPrefix: "Sefer verileri ve tarifeler: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (GTFS açık veri).",
    independent:
      "Bağımsız proje, ATAC veya Roma Servizi per la Mobilità ile bağlantılı değildir. ",
    infoLink: "Bilgiler",
  },

  errors: {
    genericTitle: "Bir şeyler ters gitti",
    unexpected: "Beklenmeyen hata",
    unexpectedDot: "Beklenmeyen hata.",
    stopNotFound: "Durak bulunamadı",
    serviceDown: "Servis yanıt vermiyor",
    requestFailed: (status: number): string => `İstek başarısız (${status})`,
    httpStatus: (status: number): string => `Hata ${status}`,
    badResponse: "Sunucu yanıtı geçersiz",
    badResponseDot: "Sunucu yanıtı geçersiz.",
    timedOut: "İstek zaman aşımına uğradı",
    timedOutDot: "İstek zaman aşımına uğradı.",
    offline: "Bağlantı yok",
    connectionFailed: "Bağlantı kurulamadı.",
    tooManyRequests: "Çok fazla istek",
    badRequest: "Geçersiz parametreler",
    lineNotFound: "Hat bulunamadı",
    journeyOriginNotFound: "Kalkış noktası bulunamadı",
    journeyDestinationNotFound: "Varış noktası bulunamadı",
    journeyPlaceHint: "Daha ayrıntılı bir adres deneyin.",
  },

  notFound: {
    kicker: "Hata 404",
    title: "Durağa hizmet verilmiyor",
    body:
      "Bu sayfa yok. Eski bir bağlantıda, ya da akışta artık bulunmayan bir durak veya hat kodunda olabilir.",
    searchCta: "Durak ara",
    nearbyCta: "Yakındaki duraklar",
  },

  appError: {
    title: "Sefer kesildi",
    body:
      "Bu ekran yüklenemedi. Tekrar deneyin: sorun sürerse büyük olasılıkla veri servisi yanıt vermiyordur.",
    digest: (digest: string): string => `Kod: ${digest}`,
    backHome: "Ana sayfaya dön",
    globalTitle: "Servis durduruldu",
    globalBody:
      "Uygulama beklenmeyen bir hata yüzünden durdu. Sayfayı yeniden yükleyin: sık kullanılanlarınız telefonda kayıtlı kalır ve kaybolmaz.",
    reload: "Yeniden yükle",
  },

  format: {
    due: "geliyor",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "tarih yok",
    minutes: (minutes: number): string => `${minutes} dk`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "güncelleme bilinmiyor",
    ageSeconds: (seconds: number): string => `${seconds} sn önce güncellendi`,
    ageMinutes: (minutes: number): string => `${minutes} dk önce güncellendi`,
    ageAt: (clock: string): string => `saat ${clock} güncellendi`,
    onTime: "zamanında",
    delayLate: (minutes: number): string => `+${minutes} dk`,
    delayEarly: (minutes: number): string => `${minutes} dk`,
  },

  meta: {
    appTitle: "BusFinder — anlık kalkışlar",
    appDescription:
      "Roma'daki otobüs, tramvay ve metronun anlık saatleri ve kalkışları. Sık kullanılan duraklar, yakındaki duraklar ve servis duyuruları; hesap yok, reklam yok.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Size en yakın ATAC durakları; haritayla ve oradan geçen hatlarla birlikte.",
    journeyDescription:
      "Roma'nın bir ucundan diğerine otobüs, tramvay ve metroyla nasıl gidileceğini resmi ATAC tarifelerine göre hesaplayın.",
    alertsDescription: "Resmi akışta yayımlanan sapmalar, durdurmalar ve sefer değişiklikleri.",
    settingsDescription:
      "Varış yenileme, arama yarıçapı, tema ve kaydettiklerinizin yönetimi.",
    infoDescription:
      "Bu uygulama nedir, veriler nereden geliyor ve neden ATAC ya da Roma Servizi per la Mobilità ile bağlantılı değil.",
    stopDescription: "Durağın anlık kalkışları ve planlanan tarifesi.",
    lineDescription: "Hattın güzergâhı, durakları ve anlık araçları.",
  },

  skeleton: {
    loading: "Yükleniyor",
  },
};

const EFFECT_TR: Record<string, string | undefined> = {
  NO_SERVICE: "Sefer durduruldu",
  REDUCED_SERVICE: "Sefer azaltıldı",
  SIGNIFICANT_DELAYS: "Önemli gecikmeler",
  DETOUR: "Sapma",
  ADDITIONAL_SERVICE: "Ek sefer",
  MODIFIED_SERVICE: "Sefer değiştirildi",
  STOP_MOVED: "Durak taşındı",
  NO_EFFECT: "Seferlere etkisi yok",
  ACCESSIBILITY_ISSUE: "Erişilebilirlik sorunu",
  OTHER_EFFECT: "Diğer",
  UNKNOWN_EFFECT: "Etki belirtilmemiş",
};

const CAUSE_TR: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Teknik arıza",
  STRIKE: "Grev",
  DEMONSTRATION: "Gösteri",
  ACCIDENT: "Kaza",
  HOLIDAY: "Resmi tatil",
  WEATHER: "Kötü hava",
  MAINTENANCE: "Bakım",
  CONSTRUCTION: "Yol çalışması",
  POLICE_ACTIVITY: "Polis müdahalesi",
  MEDICAL_EMERGENCY: "Sağlık acil durumu",
  OTHER_CAUSE: "Başka bir neden",
  UNKNOWN_CAUSE: "Neden belirtilmemiş",
};
