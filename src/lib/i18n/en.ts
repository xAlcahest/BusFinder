/**
 * English dictionary. Typed as `Dictionary`, so a key missing here (or one that
 * does not exist in Italian) is a compile error, not a runtime surprise.
 *
 * Written as transit English, not as a word-for-word tracing of the Italian.
 */

import type { Dictionary } from "./it";
import { counted, plural } from "./plural";

export const en: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, home",
  },

  a11y: {
    skipToContent: "Skip to content",
  },

  common: {
    retry: "Try again",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    home: "Home",
    back: "Back",
    all: "All",
    loading: "Loading…",
    searching: "Searching…",
    refresh: "Refresh",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Clear search",
    searchInProgress: "Searching",
  },

  nav: {
    primary: "Main navigation",
    sidebar: "Sidebar",
    sidebarNav: "Sidebar navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    sections: "Sections",
    shortcuts: "Shortcuts",
    infoAria: "About this app",
    home: "Home",
    nearbyShort: "Nearby",
    nearby: "Nearby stops",
    journey: "Directions",
    alerts: "Alerts",
    settings: "Settings",
    info: "About",
    hintNearby: "What runs around here",
    hintJourney: "From one place to another",
    hintAlerts: "Diversions and disruptions",
    hintSettings: "Refresh, theme, data",
    hintInfo: "Sources and legal notes",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tram";
        case 1:
          return "metro";
        case 2:
          return "train";
        case 4:
          return "ferry";
        default:
          return "bus";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tram";
        case 1:
          return "Metro";
        case 2:
          return "Train";
        case 3:
          return "Bus";
        default:
          return "Line";
      }
    },
    named: (name: string): string => `Line ${name}`,
    namedAria: (name: string): string => `Line ${name}`,
    details: "details",
    towards: (headsign: string): string => `towards ${headsign}`,
    towardsCapital: (headsign: string): string => `Towards ${headsign}`,
    direction: "Direction",
    terminus: "terminus",
    noHeadsign: "No destination shown",
  },

  stops: {
    code: (code: string): string => `Stop ${code}`,
    codeOnly: "Stop",
    pole: (code: string): string => `Stop ${code}`,
    accessible: "Step-free stop",
    named: (name: string): string => `${name} stop`,
    countLabel: (count: number): string => counted(count, "stop", "stops"),
    involved: (count: number): string => `${counted(count, "stop", "stops")} affected`,
  },

  home: {
    kicker: "Rome · public transport",
    title: "When is it coming?",
    intro:
      "Search for a stop by number or name, or for a line. Departures come from Rome's live feed.",
  },

  search: {
    inputAria: "Search for a stop or a line",
    placeholder: "Stop, street or line",
    searchingFor: (query: string): string => `Searching for “${query}”…`,
    noResultsFor: (query: string): string => `No results for “${query}”`,
    noResultsHint:
      "Try the stop number (70101, for example), the street name, or the line number.",
    resultsList: "Search results",
    keyboardHint: "↑ ↓ to move, Enter to open, Esc to close",
  },

  favorites: {
    heading: "Saved",
    emptyTitle: "Nothing saved yet",
    emptyHint:
      "Tap the ★ next to a stop or a line: in search, in Nearby stops, on a stop page or on a line page. It will be waiting here, so you never have to look it up twice.",
    reorder: "Reorder",
    reorderDone: "Done",
    reorderHint: "Move stops with the arrows. The order applies to this device only.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: position ${position} of ${total}.`,
    moveUp: (name: string): string => `Move ${name} up`,
    moveDown: (name: string): string => `Move ${name} down`,
    addStar: (name: string): string => `Save the stop ${name}`,
    removeStar: (name: string): string => `Unsave the stop ${name}`,
    addStarLine: (name: string): string => `Save line ${name}`,
    removeStarLine: (name: string): string => `Unsave line ${name}`,
    starredTitle: "Saved",
    starTitle: "Save",
    starredLabel: "Saved",
    starLabel: "Save",
    editLabels: (name: string): string => `Edit label and lines for ${name}`,
    onlyLines: (labels: string): string => `${labels} only`,
    notUpdated: "not updating",
    noArrivalsOnPinned: "Nothing due on the lines you picked.",
    changeLines: "Change lines",
    noArrivalsSoon: "Nothing due in the next few minutes.",
    openForTimes: "Open for times",
    vehiclesUnavailable: "Vehicles unavailable",
    lookingForVehicles: "Looking for vehicles in service…",
    noVehiclesNow: "No vehicle in service right now",
    vehiclesInService: (count: number): string =>
      `${counted(count, "vehicle", "vehicles")} in service right now`,
    refreshArrivals: "Refresh departures",
    undoRemovedStop: "Stop removed from your saved list.",
    undoRemovedLine: "Line removed from your saved list.",
    undoDismiss: "Dismiss",
    more: (count: number): string => `${count} more saved`,
    sidebarEmptyBefore: "Tap the star next to a stop or a line, in search, in ",
    sidebarEmptyAfter: ", or on the page you are looking at. You will find it here.",
    nextDeparture: "next departure",
    noDeparture: "no departure available",
    notAvailableShort: "n/a",
  },

  recents: {
    heading: "Recently viewed",
    clear: "Clear",
    emptyTitle: "No recent stops",
    emptyHint:
      "Stops you open stay here for a few days, so you can get back to them without searching again.",
    listAria: "Recently viewed stops",
    justNow: "just now",
    today: "today",
    yesterday: "yesterday",
  },

  arrivals: {
    due: "due",
    live: "live",
    scheduled: "scheduled",
    scheduledTail: " time",
    scheduledSr: "scheduled time",
    onTime: "on time",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "late",
    earlySuffix: "early",
    lateSr: (minutes: number): string => `${minutes} ${plural(minutes, "minute", "minutes")} late`,
    earlySr: (minutes: number): string => `${minutes} ${plural(minutes, "minute", "minutes")} early`,
    skipped: "cancelled",
    skippedSr: "trip cancelled",
    atClock: (clock: string): string => `at ${clock}`,
    towardsSr: (headsign: string): string => `towards ${headsign}`,
    loadingAria: "Loading departures",
    emptyTitle: "Nothing due",
    emptyHint:
      "No trip is approaching right now. Check the timetable, or try again in a few minutes.",
    frozenUnknown: "prediction not updating",
    frozenFor: (minutes: number): string => `frozen for ${minutes} min`,
    frozenPrefix: (state: string): string => `prediction ${state}`,
    frozenSr: (state: string): string => `prediction ${state}, no longer updating live`,
    expectedSr: (relative: string, clock: string): string => `expected ${relative}, at ${clock}`,
    bannerNoRealtimeStrong: "Live data unavailable.",
    bannerNoRealtime:
      " These are timetable times: vehicles may run early or late.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Live data frozen." : `Live data frozen for ${minutes} min.`,
    bannerFrozenBefore: " The predictions below are the ones",
    bannerFrozenLastUpdate: " from the last update",
    bannerFrozenAt: (clock: string): string => ` from ${clock}`,
    bannerFrozenAfter: " and they are not refreshing: treat them with care.",
    bannerPartialStrong: "Live data is partial.",
    bannerPartial: " Some of it did not arrive, so a few trips may be missing.",
    showOnMap: (line: string): string => `Show the line ${line} vehicle on the map`,
    hideOnMap: (line: string): string => `Stop highlighting the line ${line} vehicle`,
  },

  dataAge: {
    prefix: "Updated",
    now: "just now",
    secondsAgo: (seconds: number): string => `${seconds}s ago`,
    minutesAgo: (minutes: number): string => `${minutes} min ago`,
    atClock: (clock: string): string => `at ${clock}`,
    never: "never",
  },

  refreshFeedback: {
    updated: "Updated",
    unchanged: "Checked, nothing new",
    failed: "Refresh failed",
    updatedShort: "Updated",
    unchangedShort: "Nothing new",
    failedShort: "Not updated",
    busy: "Refreshing…",
    busySpoken: "Refreshing",
  },

  stop: {
    tabArrivals: "Departures",
    tabTimetable: "Timetable",
    tabsAria: "Stop view",
    editTag: "Edit label",
    addTag: "Label",
    map: "Map",
    realtimePrefix: "Live",
    noRealtime: "No live data",
    pageNotUpdated: "Page not refreshed yet",
    pageUpdatedAt: (clock: string): string => `Page refreshed at ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Showing the last data received.`,
    arrivalsUnavailable: "Departures unavailable",
    emptyHint:
      "Nothing is approaching right now. Open the timetable to see when the next one is due.",
    seeTimetable: "See the timetable",
    linesHere: "Lines calling here",
  },

  tagDialog: {
    titleFavorite: "Saved item",
    titleTag: "Stop label",
    label: "What you call it",
    placeholder: "Home, work, gym…",
    hint: (maxChars: number): string =>
      `Just for you: it stays on this device, ${maxChars} characters max.`,
    linesLegend: "Lines to show",
    linesNone: "Nothing picked: the card shows every line.",
    linesSome: (count: number): string =>
      `${counted(count, "line", "lines")} only on the card.`,
    showAllLines: "Show every line",
    removeTag: "Remove label",
  },

  timetable: {
    previousDay: "Previous day",
    nextDay: "Next day",
    today: "today",
    scheduled: "timetable",
    jumpToNow: "Jump to now",
    backToToday: "Back to today",
    fromServiceStart: "From the first departure",
    unavailableTitle: "Timetable unavailable",
    partialError: (error: string): string => `${error}. Showing the trips already loaded.`,
    emptyTitle: "No more trips from here on",
    emptyFromNow:
      "Nothing else is scheduled from this time. Try from the first departure, another day, or drop the line filter.",
    emptyWholeDay:
      "Nothing at all is scheduled on this day: try the day before or after, or drop the line filter.",
    loadMore: "Show more trips",
    loadingMore: "Loading…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${counted(count, "trip", "trips")} from ${from} to ${to}` +
      (complete ? ", through to the end of service" : "") +
      ". These are the official times for the service day, with no live data.",
  },

  map: {
    fallbackAria: "Map",
    vehiclesHeading: "Vehicles on the map",
    show: "Show",
    hide: "Hide",
    modeGroup: "Which vehicles to show",
    modeApproaching: "Coming here",
    modeAllLines: "All lines",
    loadingStop: "Loading the stop location…",
    stopMapAria: (stopName: string): string => `Map of vehicles at ${stopName}`,
    centreOnStop: "Centre on the stop",
    nearbyVehicles: "Vehicles nearby",
    allVehicles: "All of them, far ones too",
    loadingVehicles: "Loading vehicles…",
    noneApproaching: "No vehicle approaching",
    approachingCount: (count: number): string =>
      `${counted(count, "vehicle", "vehicles")} approaching`,
    onTheseLines: (count: number): string =>
      `${counted(count, "vehicle", "vehicles")} on the lines serving this stop`,
    positionsAt: (clock: string): string => `positions from ${clock}`,
    positionsStale: "positions not updating",
    allLinesNote:
      "Solid vehicles are heading for this stop; faded ones are running on the same lines but are not calling here right now.",
    approachingList: "Vehicles approaching",
    hereIn: (relative: string): string => `Here ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Here ${relative}, at ${clock}`,
    notInbound: "Running on this line, but not heading for this stop",
    noBearing: " · heading not reported",
    follow: "I'm on this one, follow it",
    unfollow: "Stop following",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Line ${line}, here ${relative}${followed ? ", you are following it" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Line ${line}, running but not heading for this stop${followed ? ", you are following it" : ""}`,
    yourPosition: "Your location",
    vehicleTitle: (vehicleId: string): string => `Vehicle ${vehicleId}`,
    showOnMap: (stopName: string): string => `Show ${stopName} on the map`,
    divertedSuffix: " · off route",
    divertedBadge: "Off route",
    divertedNote: "It is running a different path than scheduled.",
  },

  follow: {
    headlineLive: "Following this vehicle",
    headlinePaused: "Following paused",
    headlineStale: "Position frozen",
    headlineLost: "Vehicle no longer on the line",
    detailLive: "The map stays centred on it at every update.",
    detailPaused:
      "You moved the map, so I stopped moving it. Tap Resume to go back to the vehicle.",
    detailStaleUnknown: "The vehicle has not reported its position for a while.",
    detailStale: (age: string): string =>
      `No position for ${age}: what you see on the map is its last known point.`,
    detailLost:
      "Its position is no longer coming through. It may have finished the trip or left service.",
    ageMinutes: (minutes: number): string => `${minutes} ${plural(minutes, "minute", "minutes")}`,
    ageHours: (hours: number): string => (hours === 1 ? "an hour" : `${hours} hours`),
    compact: "Following",
    compactSr: (line: string): string => ` line ${line}`,
    lineSr: (line: string): string => `, line ${line}`,
    resume: "Resume",
    exit: "Exit",
    close: "Close",
    lostHint: "If it is still out there, switch to “All lines” to find it.",
  },

  nearby: {
    title: "Nearby stops",
    mapAria: "Map of nearby stops",
    searchHere: "Search this area",
    radius: "Radius",
    locating: "Locating…",
    myPosition: "My location",
    geoDenied:
      "Location permission denied. Showing central Rome: move the map and search that area.",
    geoUnavailable:
      "Location unavailable right now. Showing central Rome: move the map and search that area.",
    geoTimeout:
      "Locating took too long. Showing central Rome: move the map and try again.",
    geoUnsupported:
      "This browser cannot do geolocation. Move the map to look for stops.",
    outsideRome: "You are outside Rome: showing the city centre.",
    outsideCoverage: "This area is outside the covered zone. Move the map over Rome.",
    focusStopMissing: "That stop was not found: showing your area instead.",
    focusStopFailed: (error: string): string => `That stop could not be loaded (${error}).`,
    stopsFailed: (error: string): string => `Stops not loaded: ${error}`,
    loadingStops: "Looking for stops…",
    noStopsInRadius: (radius: string): string =>
      `No stop within ${radius}. Try a wider radius, or move the map.`,
    onMapCap: (max: number): string => ` (first ${max} on the map)`,
    noLines: "No lines",
    arrivalsLink: "Departures",
    showMoreStops: "Show more stops",
  },

  line: {
    loading: "Loading the line…",
    loadFailed: (error: string): string => `Line not loaded: ${error}`,
    mapAria: (name: string): string => `Map of line ${name}`,
    dataAt: (clock: string): string => `data from ${clock}`,
    updatedAt: (clock: string): string => `updated at ${clock}`,
    vehiclesStale: (error: string): string => `Vehicles not updating: ${error}`,
    noPathForDirection: "No route shape for this direction",
    stopsHeading: (count: number): string => `Stops (${count})`,
    noStopsForDirection: "No stops available for this direction.",
    showAllStops: "Show every stop",
  },

  lineService: {
    inService: (count: number): string =>
      `${counted(count, "vehicle", "vehicles")} on the line`,
    loadingVehicles: "Loading vehicles…",
    checkingTimetable: "Checking the timetable…",
    feedDownTitle: "Live positions unavailable",
    feedDownDetail:
      "The service may well be running: we just cannot read where the vehicles are.",
    noneReporting: "No vehicle reporting its position",
    unknownDetail:
      "That does not mean the line is not running: timetable times are on any stop page.",
    scheduledDetail: (count: number): string =>
      `Service is scheduled: ${counted(count, "trip", "trips")} left today.`,
    finishedTitle: "Service has finished for today",
    finishedDetail: (count: number, clock: string): string =>
      `${counted(count, "trip", "trips")} scheduled today, the last one at ${clock}.`,
    noneTodayTitle: "No trips scheduled today",
    noneTodayDetail: "This line has no timetabled trips for today.",
    noneTodayFrom: (stopName: string): string =>
      `No timetabled trips from ${stopName} today.`,
    nextDepartures: "Next departures",
    nextDeparturesFrom: (stopName: string): string => ` from ${stopName}`,
    scheduledOnly: "Timetable times, no live data.",
  },

  journey: {
    title: "Directions",
    subtitle: "Across Rome by bus, tram and metro.",
    from: "From",
    to: "To",
    placeholder: "Stop, address or place",
    swap: "Swap",
    whenLegend: "When",
    now: "Now",
    pickTime: "Pick a time",
    timeLabel: "Departure date and time",
    submit: "Find a route",
    resultsHeading: "Routes",
    emptyTitle: "Where are you going?",
    emptyHint: "Enter a start and a destination: we will find the best route on official times.",
    searching: "Finding routes…",
    noResultsTitle: "No route found",
    noResultsHint:
      "We only look for direct trips or one change. Try moving the start point or the time.",
    disclaimer:
      "Timetable times, not live: actual delays are not taken into account. Walking legs are straight-line estimates, so the real distance on the street is longer.",
    searchedFrom: (when: string): string => ` Searched from ${when}.`,
    mapAria: "Map of the selected route",
    mapCaption:
      "Riding legs follow the line's real path. Dashed legs are straight-line estimates: walking transfers and the few lines with no shape.",
    missingEndpoints: "Enter both a start and a destination.",
    badDateTime: "That date and time are not valid.",
    geoUnsupported: "This browser cannot do geolocation.",
    geoUnavailable: "Location unavailable right now.",
    geoOutsideRome: "You are outside Rome: type an address instead.",
    geoDenied: "Location permission denied: type an address instead.",
    geoTimeout: "Locating took too long.",
    originMarker: (name: string): string => `From: ${name}`,
    destinationMarker: (name: string): string => `To: ${name}`,
    useMyPosition: "Use my location",
    clearField: (label: string): string => `Clear ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Suggestions for ${label.toLowerCase()}`,
    placeStop: "Stop",
    placeCoord: "Coordinates",
    placeAddress: "Address",
    walkOnly: "Walk all the way",
    walkOnlyShort: "on foot",
    noTransfers: "no changes",
    transfers: (count: number): string => `${counted(count, "change", "changes")}`,
    walkDistance: (distance: string): string => `${distance} walking`,
    walkLeg: (distance: string, duration: string): string =>
      `Walk ${distance}, about ${duration}, to `,
    inService: "in service",
    stopCount: (count: number): string => counted(count, "stop", "stops"),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Route ${index}: leaves ${departure}, arrives ${arrival}`,
    lineDetailsAria: (line: string): string => `Line ${line}, details`,
    hours: (hours: number): string => `${hours} hr`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} hr ${minutes}`,
    /** journey.ts runs on the server and has no locale: it sends a slug. */
    noticeNoOriginStops:
      "No stop within walking distance of the starting point: try an address closer to a line.",
    noticeNoDestinationStops:
      "No stop within walking distance of the destination: try an address closer to a line.",
    noticeNoConnection: "No connection found between these two areas in the next few hours.",
    noticeWalkOnlyLeft:
      "No scheduled connection in the next few hours: only the walking route is left.",
    noticeLaterDepartures:
      "Nothing scheduled for the next hour and a half: showing the earliest runs after that.",
  },

  alerts: {
    title: "Service alerts",
    subtitle: "Diversions, suspensions and service changes from the official feed.",
    loading: "Loading…",
    degraded:
      "The live feed is not responding or is old: these alerts may not be current.",
    loadFailed: "Could not load the alerts.",
    refreshFailed: (error: string): string =>
      `Last refresh failed (${error}): you are seeing the previous list.`,
    searchPlaceholder: "Search: strike, diversion, street…",
    searchAria: "Search the alerts",
    filterByLine: "Filter by line",
    allLines: (count: number): string => `All lines (${count})`,
    networkWide: "Network-wide alerts",
    clearFilters: "Clear",
    noMatch: "No alert matches the filters.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} of ${total} ${plural(total, "alert", "alerts")}.`,
    activeCount: (count: number, lines: number): string =>
      `${counted(count, "active alert", "active alerts")} across ${lines} lines.`,
    goToLine: "Go to the line",
    noneTitle: "No active alerts",
    noneHint:
      "The feed reports no disruption or service change right now. Check again before you set off.",
    noResultsTitle: "No results",
    noResultsHint: "Try fewer words, or clear the filters to see every alert again.",
    noSelectionTitle: "No alert selected",
    noSelectionHint: "Pick an alert from the list on the left to read it in full.",
    showMoreLines: (count: number): string => `Show more lines (${count})`,
    goToLineShort: "go to the line",
    fallbackHeader: "Service alert",
    noDetail: "The operator published no details.",
    operatorLink: "Details on the operator's site",
    affectedLines: "Lines affected",
    alsoOn: "Also on",
    contextHeading: (count: number): string =>
      counted(count, "active alert", "active alerts"),
    contextAria: "Service alerts",
    contextAll: "All",
    contextUnavailable: (error: string): string => `Alerts unavailable: ${error}`,
    contextMore: (count: number): string => `${count} more alerts on the `,
    contextMoreLink: "alerts page",
    contextStale: (error: string): string =>
      `Last refresh failed (${error}): these alerts may not be current.`,
    windowBetween: (from: string, until: string): string => `From ${from} to ${until}`,
    windowFrom: (from: string): string => `From ${from}, no end date given`,
    windowUntil: (until: string): string => `Until ${until}`,
    windowUnknown: "No validity period given",
    effect: (code: string): string | null => EFFECT_EN[code] ?? null,
    cause: (code: string): string | null => CAUSE_EN[code] ?? null,
  },

  settings: {
    title: "Settings",
    subtitle: "Everything stays on this device. No account, no server.",
    sectionArrivals: "Departures",
    autoRefresh: "Auto refresh",
    everySeconds: (seconds: number): string => `every ${seconds} seconds`,
    autoRefreshHint: "How long between two reads of the live feed.",
    maxArrivals: "Departures shown per stop",
    showScheduled: "Show timetable times",
    showScheduledHint:
      "When the live feed has nothing for a stop, fall back to the timetable.",
    sectionNearby: "Near me",
    radius: "Search radius",
    radiusHint: "Also used by the quick radius buttons on the nearby map.",
    sectionAppearance: "Appearance",
    themeLegend: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    sectionLanguage: "Language",
    languageLegend: "Interface language",
    languageSystem: "System",
    languageHint: (resolved: string): string =>
      `With “System” we follow the browser language: right now that is ${resolved}.`,
    sectionBackup: "Saved items backup",
    backupIntro:
      "A JSON file on your device: it is how you move your saved stops to another browser, since there is no account here.",
    exportCount: (count: number): string => `Export (${count})`,
    importFromFile: "Import from file",
    exported: (count: number): string => `Exported ${count} saved items.`,
    exportFailed: "Export did not work in this browser.",
    fileTooLarge: "That file is too large to be a saved-items backup.",
    fileUnreadable: "The file could not be read.",
    importEmpty: "The file is empty.",
    importNotJson: "The file is not valid JSON.",
    importNoList: "The file contains no list of saved items.",
    importNoneValid: "No valid saved item found in the file.",
    importFound: (count: number): string => `Found ${count} valid saved items`,
    importSkipped: (count: number): string => `, ${count} entries discarded.`,
    importFoundEnd: ".",
    importMerge: "Merge",
    importReplace: "Replace",
    replaced: (count: number): string => `Saved items replaced: now ${count}.`,
    mergedNone: "Nothing new to add.",
    merged: (count: number): string => `Added ${count} saved items.`,
    sectionLocalData: "Local data",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} saved, ${recents} stops in history.`,
    confirmClearFavorites: "Delete everything you saved? This cannot be undone.",
    confirmClearFavoritesYes: "Yes, clear",
    clearFavorites: "Clear saved items",
    favoritesCleared: "Saved items cleared.",
    confirmClearRecents: "Delete the history of stops you viewed?",
    confirmClearRecentsYes: "Yes, delete",
    clearRecents: "Clear history",
    recentsCleared: "History cleared.",
    resetDefaults: "Reset to defaults",
    settingsReset: "Settings reset to their defaults.",
    infoLink: "About, data sources and frequent questions",
  },

  sync: {
    titleFull: "Sync devices",
    titleCollapsed: "Sync",
    badgeOn: "on",
    summaryLoading: "…",
    summaryUnavailable: "Not available on this connection",
    summaryOff: "Off",
    summarySyncing: "Syncing…",
    summaryError: "Sync error",
    summaryConflict: "Conflict to resolve",
    summaryOn: (last: string): string => `On · last ${last}`,
    intro:
      "Carry your saved stops, history and settings to another device with a code. Everything is encrypted here: the server only ever holds data it cannot read.",
    enable: "Turn on sync",
    haveCode: "I already have a code",
    codeLabel: "Sync code",
    codeHint:
      "20 characters, exactly as they read on the other device. Case, dashes and spaces do not matter.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} characters`,
    join: "Connect",
    onIntro:
      "Data is encrypted on this device before it leaves. Anyone with the code can read all of your saved stops: only use it on your own devices.",
    code: "Code",
    showCode: "Show code",
    hideCode: "Hide code",
    copyCode: "Copy code",
    copied: "Copied",
    lastSync: "Last sync:",
    inProgress: " · in progress…",
    syncNow: "Sync now",
    disconnect: "Disconnect",
    disconnectNote:
      "After disconnecting, your data stays on this device and the encrypted copy stays on the server until you delete it.",
    deleteWarning:
      "Delete the encrypted copy from the server. Other devices will find nothing left to sync. This cannot be undone.",
    deleteConfirm: "Yes, delete it",
    deleteRemote: "Delete the data from the server",
    justNow: "just now",
    minutesAgo: (minutes: number): string => `${minutes} min ago`,
    atClock: (clock: string): string => `at ${clock}`,
    errors: {
      aborted: "Operation cancelled.",
      generic: "Sync failed. Try again in a moment.",
      insecureContext:
        "Sync needs a secure connection: open the site over https (or on localhost). Over plain http browsers switch cryptography off, so nothing can be encrypted on this device.",
      noBase64Encode: "This browser cannot encode the sync data.",
      noBase64Decode: "This browser cannot decode the sync data.",
      invalidSyncData: (what: string): string => `Sync data is not valid (${what}).`,
      codeRequired: "Enter the sync code.",
      codeTooLong: (max: number): string => `That code is too long: it should be ${max} characters.`,
      codeInvalidChars: (chars: string): string =>
        `The code contains characters that are not allowed: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `The code is ${required} characters long, you typed ${actual}.`,
      keyDerivationFailed: "This browser cannot derive the sync keys.",
      preparePayloadFailed: "Could not prepare the data to sync.",
      encryptFailed: "The data could not be encrypted on this device.",
      decryptFailed: "The code does not match this data, or the data on the server is damaged.",
      invalidSyncId: "Invalid sync identifier.",
      responseTooLarge: "The server sent back too much data.",
      timeout: "The server did not answer in time.",
      unreachable: "Cannot reach the server. Check your connection.",
      invalidResponse: "The server sent an invalid response.",
      invalidResponseField: (what: string): string =>
        `The server sent an invalid response (${what}).`,
      unexpectedFormat: "The server answered in an unexpected format.",
      rateLimited: "Too many syncs in a row. Try again in a minute.",
      pullRejected: (status: number): string => `The server refused the read (error ${status}).`,
      payloadTooLarge: "There is too much data to sync.",
      pushRejected: (status: number): string => `The server refused to save (error ${status}).`,
      deleteRejected: (status: number): string =>
        `The server refused the deletion (error ${status}).`,
      conflict:
        "Another device is writing to the same data right now. Your local data is safe: try again in a few seconds.",
    },
    status: {
      deleted: "Data removed from the server. This device is no longer syncing.",
      disconnected:
        "Sync is off on this device. Your data stays here and the encrypted copy stays on the server until you delete it.",
    },
  },

  info: {
    title: "About",
    subtitle: "Rome public transport times and departures, from the official open data.",
    unofficialTitle: "Unofficial app",
    unofficialBody:
      "This site is not affiliated with, associated with, authorised by or endorsed by ATAC S.p.A., Roma Servizi per la Mobilità or Roma Capitale in any way. It is an independent project that simply reads the open data those bodies publish. For official information, tickets and complaints, use their own channels.",
    whatTitle: "What this is",
    whatBody1:
      "A web app that tells you how long until the next vehicle at the stop you are standing at. Search for a stop or a line, save it, and find it on the home screen with live departures. No account, no ads, no usage tracking.",
    whatBody2:
      "When the live feed covers a trip, the time shown is a prediction based on where the vehicle actually is. Otherwise the app falls back to the timetable and always says so, rather than passing off old data as a prediction.",
    dataTitle: "Where the data comes from",
    dataBodyBefore:
      "Times, stops, lines, routes, vehicle positions and service alerts all come from the open data published by ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (GTFS and GTFS-Realtime feeds). Timetables are refreshed daily, live data roughly every 30 seconds.",
    dataLink: "romamobilita.it — Open data",
    dataLicence:
      "The data remains the property of its respective owners and is used under the terms of the licence it is published with.",
    privacyTitle: "Privacy",
    privacyBody:
      "There is no login and no user profile. Saved stops, recently viewed stops and settings live only in your browser and are never sent anywhere. Your location, if you grant it for the nearby search, stays on the device: it is used to work out distances and is never stored.",
    faqTitle: "Frequent questions",
    faq1Q: "Why is a line or a bus missing?",
    faq1A:
      "We only show what is in the official feeds. If a vehicle is not reporting its position, or its trip is not in the live feed, it does not exist as far as we are concerned: at best you will see the timetable time. This happens a lot with replacement services, shuttle buses and vehicles whose tracker is broken.",
    faq2Q: "Why are the times different from the ones on the stop sign?",
    faq2A:
      'The sign at the stop shows the timetable, which changes a few times a year. Here, when the vehicle is reporting, you see a prediction worked out from its real position, which accounts for traffic and delays. When it says "scheduled", there is no prediction and we are showing the same time as the sign.',
    faq3Q: "What happens at night?",
    faq3A:
      "At night the live feed is nearly empty, because very few vehicles are out. The app keeps working from the timetable of the night lines. In GTFS a service day does not end at midnight but at 04:00: a trip at one in the morning still belongs to the previous day, which is why you may see times like 25:30 shown as 01:30.",
    faq4Q: "Do my saved stops end up on a server?",
    faq4A:
      "No. Saved stops, history and settings live in the browser's localStorage. If you clear the site data or switch device they are gone: from settings you can export them to a JSON file and import them elsewhere.",
    settingsLink: "Go to settings",
  },

  footer: {
    dataPrefix: "Service data and timetables: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (GTFS open data).",
    independent:
      "Independent project, not affiliated with ATAC or Roma Servizi per la Mobilità. ",
    infoLink: "About",
  },

  errors: {
    genericTitle: "Something went wrong",
    unexpected: "Unexpected error",
    unexpectedDot: "Unexpected error.",
    stopNotFound: "Stop not found",
    serviceDown: "The service is not responding",
    requestFailed: (status: number): string => `Request failed (${status})`,
    httpStatus: (status: number): string => `Error ${status}`,
    badResponse: "Invalid response from the server",
    badResponseDot: "Invalid response from the server.",
    timedOut: "Request timed out",
    timedOutDot: "Request timed out.",
    offline: "No connection",
    connectionFailed: "Connection failed.",
    tooManyRequests: "Too many requests",
    badRequest: "Invalid parameters",
    lineNotFound: "Line not found",
    journeyOriginNotFound: "Starting point not found",
    journeyDestinationNotFound: "Destination not found",
    journeyPlaceHint: "Try a more precise address.",
  },

  notFound: {
    kicker: "Error 404",
    title: "Stop not served",
    body:
      "This page does not exist. It happens with an old link, or with the code of a stop or a line that is no longer in the feed.",
    searchCta: "Search for a stop",
    nearbyCta: "Nearby stops",
  },

  appError: {
    title: "Trip interrupted",
    body:
      "This screen failed to load. Try again: if it keeps happening, the data service is probably down.",
    digest: (digest: string): string => `Code: ${digest}`,
    backHome: "Back to home",
    globalTitle: "Service suspended",
    globalBody:
      "The app stopped because of an unexpected error. Reload the page: your saved stops are still on the phone and are not lost.",
    reload: "Reload",
  },

  format: {
    due: "due",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "date unavailable",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "last update unknown",
    ageSeconds: (seconds: number): string => `updated ${seconds}s ago`,
    ageMinutes: (minutes: number): string => `updated ${minutes} min ago`,
    ageAt: (clock: string): string => `updated at ${clock}`,
    onTime: "on time",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — real-time departures",
    appDescription:
      "Live times and departures for buses, trams and the metro in Rome. Saved stops, nearby stops and service alerts, with no account and no ads.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "The ATAC stops closest to you, with a map and the lines that serve them.",
    journeyDescription:
      "Work out how to get from one part of Rome to another by bus, tram and metro, on the official ATAC timetables.",
    alertsDescription:
      "Diversions, suspensions and service changes published on the official feed.",
    settingsDescription: "Arrival refresh, search radius, theme and managing what you saved.",
    infoDescription:
      "What this app is, where the data comes from, and why it is not affiliated with ATAC or Roma Servizi per la Mobilità.",
    stopDescription: "Live departures and the scheduled timetable for the stop.",
    lineDescription: "Route, stops and live vehicles for the line.",
  },

  skeleton: {
    loading: "Loading",
  },
};

const EFFECT_EN: Record<string, string | undefined> = {
  NO_SERVICE: "No service",
  REDUCED_SERVICE: "Reduced service",
  SIGNIFICANT_DELAYS: "Significant delays",
  DETOUR: "Diversion",
  ADDITIONAL_SERVICE: "Extra service",
  MODIFIED_SERVICE: "Modified service",
  STOP_MOVED: "Stop moved",
  NO_EFFECT: "No effect on service",
  ACCESSIBILITY_ISSUE: "Accessibility issue",
  OTHER_EFFECT: "Other",
  UNKNOWN_EFFECT: "Effect not specified",
};

const CAUSE_EN: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Technical fault",
  STRIKE: "Strike",
  DEMONSTRATION: "Demonstration",
  ACCIDENT: "Accident",
  HOLIDAY: "Public holiday",
  WEATHER: "Weather",
  MAINTENANCE: "Maintenance",
  CONSTRUCTION: "Roadworks",
  POLICE_ACTIVITY: "Police operation",
  MEDICAL_EMERGENCY: "Medical emergency",
  OTHER_CAUSE: "Other cause",
  UNKNOWN_CAUSE: "Cause not specified",
};
