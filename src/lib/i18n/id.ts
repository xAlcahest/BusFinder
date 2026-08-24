/**
 * Indonesian dictionary. Shape and key order follow it.ts, the source of truth.
 * Indonesian has no plural inflection, so counted strings interpolate directly
 * and need no plural helper.
 */

import type { Dictionary } from "./it";

export const id: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, beranda",
  },

  a11y: {
    skipToContent: "Lompat ke konten",
  },

  common: {
    retry: "Coba lagi",
    cancel: "Batal",
    save: "Simpan",
    close: "Tutup",
    home: "Beranda",
    back: "Kembali",
    all: "Semua",
    loading: "Memuat…",
    searching: "Mencari…",
    refresh: "Perbarui",
    dash: "—",
    minutesShort: "mnt",
    clearSearch: "Hapus pencarian",
    searchInProgress: "Sedang mencari",
  },

  nav: {
    primary: "Navigasi utama",
    sidebar: "Bilah samping",
    sidebarNav: "Navigasi samping",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    sections: "Bagian",
    shortcuts: "Pintasan",
    infoAria: "Informasi tentang aplikasi",
    home: "Beranda",
    nearbyShort: "Terdekat",
    nearby: "Halte terdekat",
    journey: "Rute",
    alerts: "Pengumuman",
    settings: "Pengaturan",
    info: "Info",
    hintNearby: "Yang lewat di sekitar sini",
    hintJourney: "Dari satu titik ke titik lain",
    hintAlerts: "Pengalihan dan gangguan",
    hintSettings: "Pembaruan, tema, data",
    hintInfo: "Sumber dan catatan hukum",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "trem";
        case 1:
          return "kereta bawah tanah";
        case 2:
          return "kereta";
        case 4:
          return "kapal feri";
        default:
          return "bus";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Trem";
        case 1:
          return "Metro";
        case 2:
          return "Kereta";
        case 3:
          return "Bus";
        default:
          return "Trayek";
      }
    },
    named: (name: string): string => `Trayek ${name}`,
    namedAria: (name: string): string => `Trayek ${name}`,
    details: "detail",
    towards: (headsign: string): string => `menuju ${headsign}`,
    towardsCapital: (headsign: string): string => `Menuju ${headsign}`,
    direction: "Arah",
    terminus: "terminal akhir",
    noHeadsign: "Tujuan tidak dicantumkan",
  },

  stops: {
    code: (code: string): string => `Halte ${code}`,
    codeOnly: "Halte",
    pole: (code: string): string => `Tiang ${code}`,
    accessible: "Halte ramah difabel",
    named: (name: string): string => `Halte ${name}`,
    countLabel: (count: number): string => `${count} halte`,
    involved: (count: number): string => `${count} halte terdampak`,
  },

  home: {
    kicker: "Roma · transportasi umum",
    title: "Kapan lewatnya?",
    intro:
      "Cari halte berdasarkan nomor atau nama, atau cari trayek. Waktu kedatangan diambil dari data waktu nyata kota Roma.",
  },

  search: {
    inputAria: "Cari halte atau trayek",
    placeholder: "Halte, jalan, atau trayek",
    searchingFor: (query: string): string => `Mencari «${query}»…`,
    noResultsFor: (query: string): string => `Tidak ada hasil untuk «${query}»`,
    noResultsHint:
      "Coba dengan nomor halte (misalnya 70101), nama jalan, atau nomor trayek.",
    resultsList: "Hasil pencarian",
    keyboardHint: "↑ ↓ untuk menelusuri, Enter untuk membuka, Esc untuk menutup",
  },

  favorites: {
    heading: "Favorit",
    emptyTitle: "Belum ada favorit",
    emptyHint:
      "Ketuk bintang ★ di samping halte atau trayek: di pencarian, di Halte terdekat, di halaman halte, atau di halaman trayek. Nanti bisa ditemukan di sini tanpa mencari lagi setiap kali.",
    reorder: "Ubah urutan",
    reorderDone: "Selesai",
    reorderHint: "Pindahkan halte dengan panah. Urutan berlaku di perangkat ini.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: posisi ${position} dari ${total}.`,
    moveUp: (name: string): string => `Naikkan ${name}`,
    moveDown: (name: string): string => `Turunkan ${name}`,
    addStar: (name: string): string => `Beri bintang pada halte ${name}`,
    removeStar: (name: string): string => `Lepas bintang dari halte ${name}`,
    addStarLine: (name: string): string => `Beri bintang pada trayek ${name}`,
    removeStarLine: (name: string): string => `Lepas bintang dari trayek ${name}`,
    starredTitle: "Berbintang: ada di favorit",
    starTitle: "Beri bintang",
    starredLabel: "Berbintang",
    starLabel: "Bintang",
    editLabels: (name: string): string => `Ubah label dan trayek untuk ${name}`,
    onlyLines: (labels: string): string => `hanya ${labels}`,
    notUpdated: "belum diperbarui",
    noArrivalsOnPinned: "Tidak ada keberangkatan di trayek yang dipilih.",
    changeLines: "Ubah trayek",
    noArrivalsSoon: "Tidak ada keberangkatan dalam beberapa menit ke depan.",
    openForTimes: "Buka untuk melihat jadwal",
    vehiclesUnavailable: "Data kendaraan tidak tersedia",
    lookingForVehicles: "Mencari kendaraan yang beroperasi…",
    noVehiclesNow: "Saat ini tidak ada kendaraan yang beroperasi",
    vehiclesInService: (count: number): string => `${count} kendaraan beroperasi sekarang`,
    refreshArrivals: "Perbarui kedatangan",
    undoRemovedStop: "Halte tanpa bintang: sudah tidak ada di favorit.",
    undoRemovedLine: "Trayek tanpa bintang: sudah tidak ada di favorit.",
    undoDismiss: "Tutup pemberitahuan",
    more: (count: number): string => `${count} favorit lainnya`,
    sidebarEmptyBefore: "Ketuk bintang di samping halte atau trayek, di pencarian, di ",
    sidebarEmptyAfter: " atau di halaman yang sedang dibuka. Nanti bisa ditemukan di sini.",
    nextDeparture: "keberangkatan berikutnya",
    noDeparture: "tidak ada keberangkatan",
    notAvailableShort: "n/a",
  },

  recents: {
    heading: "Baru dilihat",
    clear: "Kosongkan",
    emptyTitle: "Belum ada halte yang dilihat",
    emptyHint:
      "Halte yang dibuka akan tersimpan di sini beberapa hari, jadi bisa ditemukan tanpa dicari lagi.",
    listAria: "Halte yang baru dilihat",
    justNow: "baru saja",
    today: "hari ini",
    yesterday: "kemarin",
  },

  arrivals: {
    due: "segera tiba",
    live: "waktu nyata",
    scheduled: "sesuai jadwal",
    scheduledTail: " terjadwal",
    scheduledSr: "jam terjadwal",
    onTime: "tepat waktu",
    lateBy: (minutes: number): string => `+${minutes} mnt`,
    earlyBy: (minutes: number): string => `−${minutes} mnt`,
    lateSuffix: "terlambat",
    earlySuffix: "lebih awal",
    lateSr: (minutes: number): string => `terlambat ${minutes} menit`,
    earlySr: (minutes: number): string => `lebih awal ${minutes} menit`,
    skipped: "dibatalkan",
    skippedSr: "perjalanan dibatalkan",
    atClock: (clock: string): string => `pukul ${clock}`,
    towardsSr: (headsign: string): string => `arah ${headsign}`,
    loadingAria: "Memuat kedatangan",
    emptyTitle: "Tidak ada keberangkatan yang diperkirakan",
    emptyHint:
      "Tidak ada perjalanan yang mendekat. Coba lihat jadwal atau ulangi sebentar lagi.",
    frozenUnknown: "perkiraan tidak diperbarui",
    frozenFor: (minutes: number): string => `berhenti ${minutes} mnt`,
    frozenPrefix: (state: string): string => `perkiraan ${state}`,
    frozenSr: (state: string): string => `perkiraan ${state}, tidak diperbarui secara waktu nyata`,
    expectedSr: (relative: string, clock: string): string =>
      `diperkirakan ${relative}, pukul ${clock}`,
    bannerNoRealtimeStrong: "Data waktu nyata tidak tersedia.",
    bannerNoRealtime:
      " Kami menampilkan jadwal: kendaraan bisa lewat lebih awal atau lebih lambat.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Data waktu nyata berhenti." : `Data waktu nyata berhenti ${minutes} mnt.`,
    bannerFrozenBefore: " Perkiraan di bawah ini berasal dari",
    bannerFrozenLastUpdate: " pembaruan terakhir",
    bannerFrozenAt: (clock: string): string => ` pukul ${clock}`,
    bannerFrozenAfter: " dan tidak sedang diperbarui: pakai dengan hati-hati.",
    bannerPartialStrong: "Data waktu nyata sebagian.",
    bannerPartial: " Sebagian data tidak sampai: beberapa perjalanan mungkin hilang.",
    showOnMap: (line: string): string => `Tampilkan kendaraan trayek ${line} di peta`,
    hideOnMap: (line: string): string => `Hilangkan sorotan pada kendaraan trayek ${line}`,
  },

  dataAge: {
    prefix: "Diperbarui",
    now: "sekarang",
    secondsAgo: (seconds: number): string => `${seconds} dtk lalu`,
    minutesAgo: (minutes: number): string => `${minutes} mnt lalu`,
    atClock: (clock: string): string => `pukul ${clock}`,
    never: "belum pernah",
  },

  refreshFeedback: {
    updated: "Diperbarui",
    unchanged: "Sudah dicek, tidak ada yang baru",
    failed: "Pembaruan gagal",
    updatedShort: "Diperbarui",
    unchangedShort: "Tidak ada yang baru",
    failedShort: "Tidak diperbarui",
    busy: "Memperbarui…",
    busySpoken: "Sedang memperbarui",
  },

  stop: {
    tabArrivals: "Kedatangan",
    tabTimetable: "Jadwal",
    tabsAria: "Tampilan halte",
    editTag: "Ubah label",
    addTag: "Label",
    map: "Peta",
    realtimePrefix: "Waktu nyata",
    noRealtime: "Tidak ada data waktu nyata",
    pageNotUpdated: "Halaman belum diperbarui",
    pageUpdatedAt: (clock: string): string => `Halaman diperbarui pukul ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Yang tampil adalah data terakhir.`,
    arrivalsUnavailable: "Kedatangan tidak tersedia",
    emptyHint:
      "Sekarang tidak ada perjalanan yang mendekat. Buka jadwal untuk tahu kapan keberangkatan berikutnya.",
    seeTimetable: "Lihat jadwal",
    linesHere: "Trayek yang berhenti di sini",
  },

  tagDialog: {
    titleFavorite: "Favorit",
    titleTag: "Label halte",
    label: "Sebutan versi kamu",
    placeholder: "Rumah, kantor, gym…",
    hint: (maxChars: number): string =>
      `Hanya untuk kamu: tersimpan di perangkat ini, maksimal ${maxChars} karakter.`,
    linesLegend: "Trayek yang ditampilkan",
    linesNone: "Belum dipilih: kartu menampilkan semua trayek.",
    linesSome: (count: number): string => `Hanya ${count} trayek di kartu.`,
    showAllLines: "Tampilkan semua trayek",
    removeTag: "Hapus label",
  },

  timetable: {
    previousDay: "Hari sebelumnya",
    nextDay: "Hari berikutnya",
    today: "hari ini",
    scheduled: "jadwal",
    jumpToNow: "Ke sekarang",
    backToToday: "Kembali ke hari ini",
    fromServiceStart: "Dari awal operasi",
    unavailableTitle: "Jadwal tidak tersedia",
    partialError: (error: string): string => `${error}. Yang tampil adalah perjalanan yang sudah dimuat.`,
    emptyTitle: "Tidak ada perjalanan setelah ini",
    emptyFromNow:
      "Dari jam ini tidak ada keberangkatan lagi. Coba dari awal operasi, hari lain, atau lepas saringan trayek.",
    emptyWholeDay:
      "Pada hari ini tidak ada keberangkatan yang dijadwalkan: coba hari sebelumnya atau sesudahnya, atau lepas saringan trayek.",
    loadMore: "Tampilkan perjalanan lain",
    loadingMore: "Memuat…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${count} perjalanan dari ${from} sampai ${to}` +
      (complete ? ", hingga akhir operasi" : "") +
      ". Ini jadwal resmi hari operasi, tanpa data waktu nyata.",
  },

  map: {
    fallbackAria: "Peta",
    vehiclesHeading: "Kendaraan di peta",
    show: "Tampilkan",
    hide: "Sembunyikan",
    modeGroup: "Kendaraan mana yang ditampilkan",
    modeApproaching: "Menuju ke sini",
    modeAllLines: "Semua trayek",
    loadingStop: "Memuat posisi halte…",
    stopMapAria: (stopName: string): string => `Peta kendaraan di halte ${stopName}`,
    centreOnStop: "Pusatkan ke halte",
    nearbyVehicles: "Kendaraan di dekat sini",
    allVehicles: "Semua, termasuk yang jauh",
    loadingVehicles: "Memuat kendaraan…",
    noneApproaching: "Tidak ada kendaraan yang mendekat",
    approachingCount: (count: number): string => `${count} kendaraan sedang menuju`,
    onTheseLines: (count: number): string => `${count} kendaraan di trayek halte ini`,
    positionsAt: (clock: string): string => `posisi pukul ${clock}`,
    positionsStale: "posisi tidak diperbarui",
    allLinesNote:
      "Kendaraan yang pekat sedang menuju halte ini, yang pudar beroperasi di trayek yang sama tapi sekarang tidak lewat sini.",
    approachingList: "Kendaraan yang mendekat",
    hereIn: (relative: string): string => `Di sini ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Di sini ${relative}, pukul ${clock}`,
    notInbound: "Beroperasi di trayek ini, tapi tidak menuju halte ini",
    noBearing: " · arah tidak dikirim",
    follow: "Saya di kendaraan ini, ikuti",
    unfollow: "Berhenti mengikuti",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Trayek ${line}, di sini ${relative}${followed ? ", sedang diikuti" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Trayek ${line}, beroperasi, tidak menuju halte ini${followed ? ", sedang diikuti" : ""}`,
    yourPosition: "Posisi kamu",
    vehicleTitle: (vehicleId: string): string => `Kendaraan ${vehicleId}`,
    showOnMap: (stopName: string): string => `Tampilkan ${stopName} di peta`,
    divertedSuffix: " · di luar rute",
    divertedBadge: "Di luar rute",
    divertedNote: "Sedang melewati jalur yang berbeda dari rencana.",
  },

  follow: {
    headlineLive: "Sedang mengikuti kendaraan ini",
    headlinePaused: "Pengikutan dijeda",
    headlineStale: "Posisi tidak bergerak",
    headlineLost: "Kendaraan sudah tidak di trayek",
    detailLive: "Peta tetap terpusat padanya setiap kali diperbarui.",
    detailPaused:
      "Peta digeser sendiri, jadi tidak saya gerakkan lagi. Ketuk Lanjutkan untuk kembali ke kendaraan.",
    detailStaleUnknown: "Kendaraan ini sudah beberapa saat tidak mengirim posisinya.",
    detailStale: (age: string): string =>
      `Kendaraan tidak mengirim data sejak ${age}: yang di peta adalah titik terakhir yang diketahui.`,
    detailLost:
      "Posisinya sudah tidak diterima. Mungkin perjalanannya selesai atau keluar dari operasi.",
    ageMinutes: (minutes: number): string => `${minutes} menit`,
    ageHours: (hours: number): string => `${hours} jam`,
    compact: "Mengikuti",
    compactSr: (line: string): string => ` trayek ${line}`,
    lineSr: (line: string): string => `, trayek ${line}`,
    resume: "Lanjutkan",
    exit: "Keluar",
    close: "Tutup",
    lostHint: "Kalau masih beroperasi, bisa ditemukan dengan beralih ke «Semua trayek».",
  },

  nearby: {
    title: "Halte terdekat",
    mapAria: "Peta halte terdekat",
    searchHere: "Cari di area ini",
    radius: "Radius",
    locating: "Menentukan lokasi…",
    myPosition: "Posisi saya",
    geoDenied:
      "Izin lokasi ditolak. Kami menampilkan pusat kota Roma: geser peta dan cari di area itu.",
    geoUnavailable:
      "Lokasi tidak tersedia saat ini. Kami menampilkan pusat kota Roma: geser peta dan cari di area itu.",
    geoTimeout:
      "Penentuan lokasi terlalu lama. Kami menampilkan pusat kota Roma: geser peta dan coba lagi.",
    geoUnsupported:
      "Peramban ini tidak mendukung geolokasi. Geser peta untuk mencari halte.",
    outsideRome: "Kamu di luar wilayah Roma: kami menampilkan pusat kota.",
    outsideCoverage: "Area ini di luar jangkauan. Geser peta ke Roma.",
    focusStopMissing: "Halte yang diminta tidak ditemukan: kami menampilkan area kamu.",
    focusStopFailed: (error: string): string => `Halte yang diminta gagal dimuat (${error}).`,
    stopsFailed: (error: string): string => `Halte gagal dimuat: ${error}`,
    loadingStops: "Mencari halte…",
    noStopsInRadius: (radius: string): string =>
      `Tidak ada halte dalam ${radius}. Coba perlebar radius atau geser peta.`,
    onMapCap: (max: number): string => ` (${max} pertama di peta)`,
    noLines: "Tidak ada trayek",
    arrivalsLink: "Kedatangan",
    showMoreStops: "Tampilkan halte lain",
  },

  line: {
    loading: "Memuat trayek…",
    loadFailed: (error: string): string => `Trayek gagal dimuat: ${error}`,
    mapAria: (name: string): string => `Peta trayek ${name}`,
    dataAt: (clock: string): string => `data pukul ${clock}`,
    updatedAt: (clock: string): string => `diperbarui pukul ${clock}`,
    vehiclesStale: (error: string): string => `Kendaraan tidak diperbarui: ${error}`,
    noPathForDirection: "Jalur tidak tersedia untuk arah ini",
    stopsHeading: (count: number): string => `Halte (${count})`,
    noStopsForDirection: "Tidak ada halte untuk arah ini.",
    showAllStops: "Tampilkan semua halte",
  },

  lineService: {
    inService: (count: number): string => `${count} kendaraan di trayek`,
    loadingVehicles: "Memuat kendaraan…",
    checkingTimetable: "Memeriksa jadwal…",
    feedDownTitle: "Posisi waktu nyata tidak tersedia",
    feedDownDetail:
      "Operasinya bisa jadi normal: kami hanya tidak bisa membaca posisi kendaraan.",
    noneReporting: "Tidak ada kendaraan yang mengirim posisinya",
    unknownDetail:
      "Bukan berarti trayeknya tidak beroperasi: jadwalnya ada di halaman salah satu halte.",
    scheduledDetail: (count: number): string =>
      `Operasi terjadwal: ${count} perjalanan direncanakan dari sekarang sampai akhir hari.`,
    finishedTitle: "Operasi hari ini sudah selesai",
    finishedDetail: (count: number, clock: string): string =>
      `Hari ini ada ${count} perjalanan terjadwal, yang terakhir pukul ${clock}.`,
    noneTodayTitle: "Tidak ada perjalanan terjadwal hari ini",
    noneTodayDetail: "Trayek ini tidak punya perjalanan dalam jadwal hari ini.",
    noneTodayFrom: (stopName: string): string =>
      `Dari ${stopName} tidak ada perjalanan dalam jadwal hari ini.`,
    nextDepartures: "Keberangkatan berikutnya",
    nextDeparturesFrom: (stopName: string): string => ` dari ${stopName}`,
    scheduledOnly: "Jadwal saja, tanpa data waktu nyata.",
  },

  journey: {
    title: "Rute",
    subtitle: "Dari satu titik ke titik lain di Roma dengan bus, trem, dan metro.",
    from: "Berangkat",
    to: "Tiba",
    placeholder: "Halte, alamat, atau tempat",
    swap: "Tukar",
    whenLegend: "Kapan",
    now: "Sekarang",
    pickTime: "Pilih jam",
    timeLabel: "Tanggal dan jam keberangkatan",
    submit: "Cari rute",
    resultsHeading: "Rute",
    emptyTitle: "Mau ke mana?",
    emptyHint:
      "Isi titik berangkat dan titik tiba: kami cari rute terbaik berdasarkan jadwal resmi.",
    searching: "Mencari rute…",
    noResultsTitle: "Tidak ada rute",
    noResultsHint:
      "Kami hanya mencari sambungan langsung atau dengan satu kali ganti. Coba ubah titik berangkat atau jamnya.",
    disclaimer:
      "Berdasarkan jadwal, bukan waktu nyata: keterlambatan sebenarnya tidak diperhitungkan. Bagian jalan kaki diperkirakan garis lurus, jadi jarak sebenarnya lewat jalan lebih jauh.",
    searchedFrom: (when: string): string => ` Pencarian mulai ${when}.`,
    mapAria: "Peta rute yang dipilih",
    mapCaption:
      "Bagian dalam kendaraan mengikuti jalur asli trayek. Bagian putus-putus diperkirakan garis lurus: jalan kaki saat ganti kendaraan dan sedikit trayek yang tidak punya data jalur.",
    missingEndpoints: "Isi titik berangkat dan titik tiba.",
    badDateTime: "Tanggal dan jam tidak valid.",
    geoUnsupported: "Peramban ini tidak mendukung geolokasi.",
    geoUnavailable: "Lokasi tidak tersedia saat ini.",
    geoOutsideRome: "Kamu di luar wilayah Roma: tulis sebuah alamat.",
    geoDenied: "Izin lokasi ditolak: tulis sebuah alamat.",
    geoTimeout: "Penentuan lokasi terlalu lama.",
    originMarker: (name: string): string => `Berangkat: ${name}`,
    destinationMarker: (name: string): string => `Tiba: ${name}`,
    useMyPosition: "Pakai posisi saya",
    clearField: (label: string): string => `Kosongkan ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Saran untuk ${label.toLowerCase()}`,
    placeStop: "Halte",
    placeCoord: "Koordinat",
    placeAddress: "Alamat",
    walkOnly: "Jalan kaki saja",
    walkOnlyShort: "jalan kaki",
    noTransfers: "tanpa ganti kendaraan",
    transfers: (count: number): string => `${count} kali ganti`,
    walkDistance: (distance: string): string => `${distance} jalan kaki`,
    walkLeg: (distance: string, duration: string): string =>
      `Jalan kaki ${distance}, sekitar ${duration} sampai `,
    inService: "beroperasi",
    stopCount: (count: number): string => `${count} halte`,
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Rute ${index}: berangkat ${departure}, tiba ${arrival}`,
    lineDetailsAria: (line: string): string => `Trayek ${line}, detail`,
    hours: (hours: number): string => `${hours} j`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} j ${minutes}`,
    noticeNoOriginStops:
      "Tidak ada halte yang bisa dijangkau dengan jalan kaki dari titik keberangkatan: coba alamat yang lebih dekat ke sebuah trayek.",
    noticeNoDestinationStops:
      "Tidak ada halte yang bisa dijangkau dengan jalan kaki dari titik tujuan: coba alamat yang lebih dekat ke sebuah trayek.",
    noticeNoConnection: "Tidak ada koneksi antara kedua wilayah ini dalam beberapa jam ke depan.",
    noticeWalkOnlyLeft:
      "Tidak ada koneksi terjadwal dalam beberapa jam ke depan: hanya rute jalan kaki yang tersisa.",
    noticeLaterDepartures:
      "Tidak ada keberangkatan dalam satu setengah jam ke depan: kami tampilkan yang pertama setelahnya.",
  },

  alerts: {
    title: "Pengumuman layanan",
    subtitle: "Pengalihan, penghentian, dan perubahan yang diumumkan di data resmi.",
    loading: "Memuat…",
    degraded:
      "Data waktu nyata tidak menjawab atau sudah lama: pengumuman ini mungkin bukan yang terbaru.",
    loadFailed: "Pengumuman tidak bisa dimuat.",
    refreshFailed: (error: string): string =>
      `Pembaruan terakhir gagal (${error}): yang tampil adalah daftar sebelumnya.`,
    searchPlaceholder: "Cari: mogok, pengalihan, jalan…",
    searchAria: "Cari di antara pengumuman",
    filterByLine: "Saring per trayek",
    allLines: (count: number): string => `Semua trayek (${count})`,
    networkWide: "Pengumuman umum",
    clearFilters: "Atur ulang",
    noMatch: "Tidak ada pengumuman yang cocok dengan saringan.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} dari ${total} pengumuman.`,
    activeCount: (count: number, lines: number): string =>
      `${count} pengumuman aktif di ${lines} trayek.`,
    goToLine: "Ke trayek",
    noneTitle: "Tidak ada pengumuman aktif",
    noneHint:
      "Saat ini tidak ada gangguan atau perubahan layanan yang dilaporkan. Cek lagi sebelum berangkat.",
    noResultsTitle: "Tidak ada hasil",
    noResultsHint:
      "Coba dengan lebih sedikit kata, atau atur ulang saringan untuk melihat semua pengumuman.",
    noSelectionTitle: "Belum ada pengumuman yang dipilih",
    noSelectionHint: "Pilih satu pengumuman dari daftar di kiri untuk membacanya utuh.",
    showMoreLines: (count: number): string => `Tampilkan trayek lain (${count})`,
    goToLineShort: "ke trayek",
    fallbackHeader: "Pengumuman layanan",
    noDetail: "Operator tidak menerbitkan detail.",
    operatorLink: "Detail di situs operator",
    affectedLines: "Trayek terdampak",
    alsoOn: "Juga di",
    contextHeading: (count: number): string => `${count} pengumuman aktif`,
    contextAria: "Pengumuman layanan",
    contextAll: "Semua",
    contextUnavailable: (error: string): string => `Pengumuman tidak tersedia: ${error}`,
    contextMore: (count: number): string => `${count} pengumuman lain di `,
    contextMoreLink: "halaman pengumuman",
    contextStale: (error: string): string =>
      `Pembaruan terakhir gagal (${error}): pengumuman ini mungkin sudah tidak berlaku.`,
    windowBetween: (from: string, until: string): string => `Dari ${from} sampai ${until}`,
    windowFrom: (from: string): string => `Mulai ${from}, tanpa batas akhir yang disebutkan`,
    windowUntil: (until: string): string => `Sampai ${until}`,
    windowUnknown: "Masa berlaku tidak disebutkan",
    effect: (code: string): string | null => EFFECT_ID[code] ?? null,
    cause: (code: string): string | null => CAUSE_ID[code] ?? null,
  },

  settings: {
    title: "Pengaturan",
    subtitle: "Semuanya tersimpan di perangkat ini. Tanpa akun, tanpa server.",
    sectionArrivals: "Kedatangan",
    autoRefresh: "Pembaruan otomatis",
    everySeconds: (seconds: number): string => `setiap ${seconds} detik`,
    autoRefreshHint: "Jeda antara dua pembacaan data waktu nyata.",
    maxArrivals: "Kedatangan yang ditampilkan per halte",
    showScheduled: "Tampilkan jadwal",
    showScheduledHint:
      "Kalau data waktu nyata tidak punya apa-apa untuk sebuah halte, pakai jadwal.",
    sectionNearby: "Di dekat saya",
    radius: "Radius pencarian",
    radiusHint: "Berlaku juga untuk radius cepat di peta halte terdekat.",
    sectionAppearance: "Tampilan",
    themeLegend: "Tema",
    themeSystem: "Sistem",
    themeLight: "Terang",
    themeDark: "Gelap",
    sectionLanguage: "Bahasa",
    languageLegend: "Bahasa antarmuka",
    languageSystem: "Sistem",
    languageHint: (resolved: string): string =>
      `Dengan «Sistem» kami mengikuti bahasa peramban: sekarang ${resolved}.`,
    sectionBackup: "Cadangan favorit",
    backupIntro:
      "Sebuah berkas JSON di perangkat kamu: karena di sini tidak ada akun, begitulah cara memindahkan favorit ke peramban lain.",
    exportCount: (count: number): string => `Ekspor (${count})`,
    importFromFile: "Impor dari berkas",
    exported: (count: number): string => `${count} favorit diekspor.`,
    exportFailed: "Ekspor gagal di peramban ini.",
    fileTooLarge: "Berkasnya terlalu besar untuk sebuah cadangan favorit.",
    fileUnreadable: "Berkas tidak bisa dibaca.",
    importEmpty: "Berkasnya kosong.",
    importNotJson: "Berkas bukan JSON yang valid.",
    importNoList: "Berkas tidak memuat daftar favorit.",
    importNoneValid: "Tidak ditemukan favorit yang valid di berkas.",
    importFound: (count: number): string => `Ditemukan ${count} favorit yang valid`,
    importSkipped: (count: number): string => `, ${count} entri dibuang.`,
    importFoundEnd: ".",
    importMerge: "Gabungkan",
    importReplace: "Ganti",
    replaced: (count: number): string => `Favorit diganti: sekarang ada ${count}.`,
    mergedNone: "Tidak ada favorit baru untuk ditambahkan.",
    merged: (count: number): string => `${count} favorit ditambahkan.`,
    sectionLocalData: "Data lokal",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} favorit, ${recents} halte di riwayat.`,
    confirmClearFavorites: "Hapus semua favorit? Tindakan ini tidak bisa dibatalkan.",
    confirmClearFavoritesYes: "Ya, kosongkan",
    clearFavorites: "Kosongkan favorit",
    favoritesCleared: "Favorit dikosongkan.",
    confirmClearRecents: "Hapus riwayat halte yang pernah dilihat?",
    confirmClearRecentsYes: "Ya, hapus",
    clearRecents: "Hapus riwayat",
    recentsCleared: "Riwayat dihapus.",
    resetDefaults: "Kembalikan ke pengaturan bawaan",
    settingsReset: "Pengaturan dikembalikan ke nilai bawaan.",
    infoLink: "Informasi, sumber data, dan pertanyaan umum",
  },

  sync: {
    titleFull: "Sinkronkan perangkat",
    titleCollapsed: "Sinkronisasi",
    badgeOn: "aktif",
    summaryLoading: "…",
    summaryUnavailable: "Tidak tersedia di koneksi ini",
    summaryOff: "Tidak aktif",
    summarySyncing: "Sedang menyinkronkan…",
    summaryError: "Kesalahan sinkronisasi",
    summaryConflict: "Ada konflik yang perlu diselesaikan",
    summaryOn: (last: string): string => `Aktif · terakhir ${last}`,
    intro:
      "Bawa favorit, riwayat, dan pengaturan ke perangkat lain dengan sebuah kode. Data dienkripsi di sini: server hanya menyimpan data yang tidak terbaca.",
    enable: "Aktifkan sinkronisasi",
    haveCode: "Saya sudah punya kode",
    codeLabel: "Kode sinkronisasi",
    codeHint:
      "20 karakter, persis seperti yang terlihat di perangkat satunya. Huruf besar-kecil, tanda hubung, dan spasi tidak berpengaruh.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} karakter`,
    join: "Hubungkan",
    onIntro:
      "Data dienkripsi di perangkat ini sebelum dikirim. Siapa pun yang punya kodenya bisa membaca semua favorit kamu: pakai hanya di perangkat sendiri.",
    code: "Kode",
    showCode: "Tampilkan kode",
    hideCode: "Sembunyikan kode",
    copyCode: "Salin kode",
    copied: "Tersalin",
    lastSync: "Sinkronisasi terakhir:",
    inProgress: " · sedang berjalan…",
    syncNow: "Sinkronkan sekarang",
    disconnect: "Putuskan",
    disconnectNote:
      "Setelah diputus, data tetap ada di perangkat ini dan salinan terenkripsi tetap di server sampai kamu menghapusnya.",
    deleteWarning:
      "Menghapus salinan terenkripsi dari server. Perangkat lain tidak akan menemukan apa pun untuk disinkronkan. Tidak bisa dibatalkan.",
    deleteConfirm: "Benar-benar hapus",
    deleteRemote: "Hapus data dari server",
    justNow: "sekarang",
    minutesAgo: (minutes: number): string => `${minutes} mnt lalu`,
    atClock: (clock: string): string => `pukul ${clock}`,
    errors: {
      aborted: "Operasi dibatalkan.",
      generic: "Sinkronisasi gagal. Coba lagi sebentar lagi.",
      insecureContext:
        "Sinkronisasi butuh koneksi aman: buka situs lewat https (atau di localhost). Di http biasa, peramban mematikan kriptografi, jadi tidak ada yang bisa dienkripsi di perangkat ini.",
      noBase64Encode: "Peramban ini tidak bisa menyandikan data sinkronisasi.",
      noBase64Decode: "Peramban ini tidak bisa membaca sandi data sinkronisasi.",
      invalidSyncData: (what: string): string => `Data sinkronisasi tidak valid (${what}).`,
      codeRequired: "Masukkan kode sinkronisasi.",
      codeTooLong: (max: number): string => `Kode itu terlalu panjang: seharusnya ${max} karakter.`,
      codeInvalidChars: (chars: string): string =>
        `Kode memuat karakter yang tidak diperbolehkan: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Kode harus ${required} karakter, kamu mengetik ${actual}.`,
      keyDerivationFailed: "Peramban ini tidak bisa membuat kunci sinkronisasi.",
      preparePayloadFailed: "Tidak bisa menyiapkan data untuk disinkronkan.",
      encryptFailed: "Data tidak bisa dienkripsi di perangkat ini.",
      decryptFailed: "Kode tidak cocok dengan data ini, atau data di server rusak.",
      invalidSyncId: "Identitas sinkronisasi tidak valid.",
      responseTooLarge: "Server mengirim balik terlalu banyak data.",
      timeout: "Server tidak menjawab tepat waktu.",
      unreachable: "Server tidak bisa dihubungi. Periksa koneksi kamu.",
      invalidResponse: "Server mengirim jawaban yang tidak valid.",
      invalidResponseField: (what: string): string =>
        `Server mengirim jawaban yang tidak valid (${what}).`,
      unexpectedFormat: "Server menjawab dengan format yang tidak terduga.",
      rateLimited: "Terlalu banyak sinkronisasi beruntun. Coba lagi semenit lagi.",
      pullRejected: (status: number): string => `Server menolak pembacaan (kesalahan ${status}).`,
      payloadTooLarge: "Datanya terlalu banyak untuk disinkronkan.",
      pushRejected: (status: number): string => `Server menolak penyimpanan (kesalahan ${status}).`,
      deleteRejected: (status: number): string => `Server menolak penghapusan (kesalahan ${status}).`,
      conflict:
        "Perangkat lain sedang menulis ke data yang sama saat ini. Data lokal kamu aman: coba lagi beberapa detik lagi.",
    },
    status: {
      deleted: "Data dihapus dari server. Perangkat ini tidak lagi disinkronkan.",
      disconnected:
        "Sinkronisasi mati di perangkat ini. Datamu tetap di sini dan salinan terenkripsi tetap di server sampai kamu menghapusnya.",
    },
  },

  info: {
    title: "Informasi",
    subtitle:
      "Jadwal dan kedatangan transportasi umum Roma, dari data terbuka resmi.",
    unofficialTitle: "Aplikasi tidak resmi",
    unofficialBody:
      "Situs ini tidak berafiliasi, tidak terkait, tidak diizinkan, dan tidak didukung dengan cara apa pun oleh ATAC S.p.A., Roma Servizi per la Mobilità, atau Roma Capitale. Ini proyek independen yang hanya membaca data terbuka yang diterbitkan lembaga-lembaga tersebut. Untuk informasi resmi, tiket, dan keluhan, hubungi kanal mereka.",
    whatTitle: "Ini apa",
    whatBody1:
      "Aplikasi web untuk tahu berapa lama lagi kendaraan berikutnya lewat di halte tempat kamu berada. Cari halte atau trayek, simpan ke favorit, lalu temukan di beranda dengan kedatangan terbaru. Tanpa akun, tanpa iklan, tanpa statistik penggunaan.",
    whatBody2:
      "Kalau data waktu nyata mencakup perjalanan itu, jam yang ditampilkan adalah perkiraan berdasarkan posisi kendaraan. Kalau tidak, aplikasi kembali ke jadwal dan selalu memberi tahu, alih-alih menyajikan data lama sebagai perkiraan.",
    dataTitle: "Dari mana datanya",
    dataBodyBefore:
      "Jadwal, halte, trayek, jalur, posisi kendaraan, dan pengumuman layanan berasal dari data terbuka ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS dan GTFS-Realtime). Jadwal diperbarui setiap hari, data waktu nyata sekitar setiap 30 detik.",
    dataLink: "romamobilita.it — Data terbuka",
    dataLicence:
      "Data tetap milik pemegang haknya masing-masing dan dipakai sesuai ketentuan lisensi saat diterbitkan.",
    privacyTitle: "Privasi",
    privacyBody:
      "Tidak ada login dan tidak ada profil pengguna. Favorit, halte yang baru dilihat, dan pengaturan hanya disimpan di peramban kamu dan tidak dikirim ke mana pun. Lokasi, kalau kamu izinkan untuk mencari halte terdekat, tetap di perangkat: dipakai untuk menghitung jarak dan tidak disimpan.",
    faqTitle: "Pertanyaan umum",
    faq1Q: "Kenapa ada trayek atau bus yang tidak muncul?",
    faq1A:
      "Kami hanya menampilkan yang ada di data resmi. Kalau sebuah kendaraan tidak mengirim posisinya, atau perjalanannya tidak ada di data waktu nyata, bagi kami kendaraan itu tidak ada: paling banter kamu melihat jadwalnya. Ini sering terjadi pada perjalanan pengganti, bus antar-jemput, dan kendaraan dengan pelacak rusak.",
    faq2Q: "Kenapa jamnya beda dengan yang tertulis di halte?",
    faq2A:
      'Papan di tiang menampilkan jadwal, yang berubah beberapa kali setahun. Di sini, kalau kendaraan mengirim data, kamu melihat perkiraan yang dihitung dari posisi aslinya, yang memperhitungkan lalu lintas dan keterlambatan. Sebaliknya, kalau tertulis "terjadwal", berarti tidak ada perkiraan dan kami menampilkan jam yang sama dengan papan.',
    faq3Q: "Bagaimana kalau malam hari?",
    faq3A:
      "Malam hari data waktu nyata hampir kosong karena kendaraan yang beroperasi sedikit. Aplikasi tetap jalan dengan jadwal trayek malam. Di GTFS, hari operasi tidak berakhir tengah malam melainkan pukul 04:00: perjalanan pukul satu dini hari masih milik hari sebelumnya, dan karena itu kamu bisa melihat jam seperti 25:30 diterjemahkan jadi 01:30.",
    faq4Q: "Apakah favorit saya berakhir di sebuah server?",
    faq4A:
      "Tidak. Favorit, riwayat, dan pengaturan ada di localStorage peramban. Kalau kamu menghapus data situs atau ganti perangkat, semuanya hilang: dari pengaturan kamu bisa mengekspornya ke berkas JSON dan mengimpornya lagi di tempat lain.",
    settingsLink: "Ke pengaturan",
  },

  footer: {
    dataPrefix: "Data layanan dan jadwal: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (data terbuka GTFS).",
    independent:
      "Proyek independen, tidak berafiliasi dengan ATAC atau Roma Servizi per la Mobilità. ",
    infoLink: "Informasi",
  },

  errors: {
    genericTitle: "Ada yang tidak beres",
    unexpected: "Kesalahan tak terduga",
    unexpectedDot: "Kesalahan tak terduga.",
    stopNotFound: "Halte tidak ditemukan",
    serviceDown: "Layanan tidak menjawab",
    requestFailed: (status: number): string => `Permintaan gagal (${status})`,
    httpStatus: (status: number): string => `Kesalahan ${status}`,
    badResponse: "Jawaban server tidak valid",
    badResponseDot: "Jawaban server tidak valid.",
    timedOut: "Permintaan kedaluwarsa",
    timedOutDot: "Permintaan kedaluwarsa.",
    offline: "Tidak ada koneksi",
    connectionFailed: "Koneksi gagal.",
    tooManyRequests: "Terlalu banyak permintaan",
    badRequest: "Parameter tidak valid",
    lineNotFound: "Trayek tidak ditemukan",
    journeyOriginNotFound: "Titik berangkat tidak ditemukan",
    journeyDestinationNotFound: "Tujuan tidak ditemukan",
    journeyPlaceHint: "Coba alamat yang lebih rinci.",
  },

  notFound: {
    kicker: "Kesalahan 404",
    title: "Halte tidak dilayani",
    body:
      "Halaman ini tidak ada. Bisa terjadi karena tautan lama, atau karena kode halte atau trayek yang sudah tidak ada di data.",
    searchCta: "Cari halte",
    nearbyCta: "Halte terdekat",
  },

  appError: {
    title: "Perjalanan terputus",
    body:
      "Layar ini gagal dimuat. Coba lagi: kalau masalahnya menetap, kemungkinan besar layanan datanya yang tidak menjawab.",
    digest: (digest: string): string => `Kode: ${digest}`,
    backHome: "Kembali ke beranda",
    globalTitle: "Layanan dihentikan",
    globalBody:
      "Aplikasi berhenti karena kesalahan tak terduga. Muat ulang halamannya: favorit kamu tetap tersimpan di ponsel dan tidak hilang.",
    reload: "Muat ulang",
  },

  format: {
    due: "segera tiba",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "tanggal tidak tersedia",
    minutes: (minutes: number): string => `${minutes} mnt`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "waktu pembaruan tidak diketahui",
    ageSeconds: (seconds: number): string => `diperbarui ${seconds} dtk lalu`,
    ageMinutes: (minutes: number): string => `diperbarui ${minutes} mnt lalu`,
    ageAt: (clock: string): string => `diperbarui pukul ${clock}`,
    onTime: "tepat waktu",
    delayLate: (minutes: number): string => `+${minutes} mnt`,
    delayEarly: (minutes: number): string => `${minutes} mnt`,
  },

  meta: {
    appTitle: "BusFinder — kedatangan waktu nyata",
    appDescription:
      "Jadwal dan kedatangan bus, trem, dan metro di Roma secara waktu nyata. Halte favorit, halte terdekat, dan info layanan, tanpa akun dan tanpa iklan.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Halte ATAC terdekat dari posisimu, lengkap dengan peta dan trayek yang lewat.",
    journeyDescription:
      "Cari cara pergi dari satu titik ke titik lain di Roma dengan bus, trem, dan metro, berdasarkan jadwal resmi ATAC.",
    alertsDescription:
      "Pengalihan, penghentian, dan perubahan layanan yang diumumkan di data resmi.",
    settingsDescription:
      "Pembaruan kedatangan, radius pencarian, tema, dan pengelolaan yang kamu simpan.",
    infoDescription:
      "Apa itu aplikasi ini, datanya dari mana, dan kenapa tidak berafiliasi dengan ATAC atau Roma Servizi per la Mobilità.",
    stopDescription: "Kedatangan waktu nyata dan jadwal resmi halte.",
    lineDescription: "Rute, halte, dan kendaraan trayek secara waktu nyata.",
  },

  skeleton: {
    loading: "Memuat",
  },
};

const EFFECT_ID: Record<string, string | undefined> = {
  NO_SERVICE: "Layanan dihentikan",
  REDUCED_SERVICE: "Layanan dikurangi",
  SIGNIFICANT_DELAYS: "Keterlambatan besar",
  DETOUR: "Pengalihan",
  ADDITIONAL_SERVICE: "Layanan tambahan",
  MODIFIED_SERVICE: "Layanan diubah",
  STOP_MOVED: "Halte dipindah",
  NO_EFFECT: "Tidak berdampak pada layanan",
  ACCESSIBILITY_ISSUE: "Masalah aksesibilitas",
  OTHER_EFFECT: "Lainnya",
  UNKNOWN_EFFECT: "Dampak tidak disebutkan",
};

const CAUSE_ID: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Kerusakan teknis",
  STRIKE: "Mogok kerja",
  DEMONSTRATION: "Unjuk rasa",
  ACCIDENT: "Kecelakaan",
  HOLIDAY: "Hari libur",
  WEATHER: "Cuaca buruk",
  MAINTENANCE: "Perawatan",
  CONSTRUCTION: "Pekerjaan jalan",
  POLICE_ACTIVITY: "Tindakan kepolisian",
  MEDICAL_EMERGENCY: "Keadaan darurat medis",
  OTHER_CAUSE: "Penyebab lain",
  UNKNOWN_CAUSE: "Penyebab tidak disebutkan",
};
