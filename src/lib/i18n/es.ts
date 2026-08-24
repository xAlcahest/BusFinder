/** Spanish dictionary. Shape and key order follow it.ts, the source of truth. */

import type { Dictionary } from "./it";
import { counted, plural } from "./plural";

export const es: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, inicio",
  },

  a11y: {
    skipToContent: "Ir al contenido",
  },

  common: {
    retry: "Reintentar",
    cancel: "Cancelar",
    save: "Guardar",
    close: "Cerrar",
    home: "Inicio",
    back: "Atrás",
    all: "Todas",
    loading: "Cargando…",
    searching: "Buscando…",
    refresh: "Actualizar",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Borrar la búsqueda",
    searchInProgress: "Búsqueda en curso",
  },

  nav: {
    primary: "Navegación principal",
    sidebar: "Barra lateral",
    sidebarNav: "Navegación lateral",
    openMenu: "Abrir el menú",
    closeMenu: "Cerrar el menú",
    sections: "Secciones",
    shortcuts: "Accesos rápidos",
    infoAria: "Información sobre la app",
    home: "Inicio",
    nearbyShort: "Cerca",
    nearby: "Paradas cercanas",
    journey: "Itinerario",
    alerts: "Avisos",
    settings: "Ajustes",
    info: "Info",
    hintNearby: "Qué pasa por aquí cerca",
    hintJourney: "De un punto a otro",
    hintAlerts: "Desvíos e interrupciones",
    hintSettings: "Actualización, tema, datos",
    hintInfo: "Fuentes y notas legales",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tranvía";
        case 1:
          return "metro";
        case 2:
          return "tren";
        case 4:
          return "ferry";
        default:
          return "autobús";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tranvía";
        case 1:
          return "Metro";
        case 2:
          return "Tren";
        case 3:
          return "Bus";
        default:
          return "Línea";
      }
    },
    named: (name: string): string => `Línea ${name}`,
    namedAria: (name: string): string => `Línea ${name}`,
    details: "detalles",
    towards: (headsign: string): string => `hacia ${headsign}`,
    towardsCapital: (headsign: string): string => `Hacia ${headsign}`,
    direction: "Dirección",
    terminus: "final de línea",
    noHeadsign: "Destino no indicado",
  },

  stops: {
    code: (code: string): string => `Parada ${code}`,
    codeOnly: "Parada",
    pole: (code: string): string => `Poste ${code}`,
    accessible: "Parada accesible",
    named: (name: string): string => `Parada ${name}`,
    countLabel: (count: number): string => counted(count, "parada", "paradas"),
    involved: (count: number): string =>
      `${count} ${plural(count, "parada afectada", "paradas afectadas")}`,
  },

  home: {
    kicker: "Roma · transporte público",
    title: "¿Cuándo pasa?",
    intro:
      "Busca una parada por número o por nombre, o una línea. Los pasos vienen del feed en tiempo real de Roma.",
  },

  search: {
    inputAria: "Busca una parada o una línea",
    placeholder: "Parada, calle o línea",
    searchingFor: (query: string): string => `Buscando «${query}»…`,
    noResultsFor: (query: string): string => `Ningún resultado para «${query}»`,
    noResultsHint:
      "Prueba con el número de la parada (por ejemplo 70101), el nombre de la calle o el número de la línea.",
    resultsList: "Resultados de la búsqueda",
    keyboardHint: "↑ ↓ para desplazarte, Intro para abrir, Esc para cerrar",
  },

  favorites: {
    heading: "Favoritos",
    emptyTitle: "Todavía no hay favoritos",
    emptyHint:
      "Toca la estrella ★ junto a una parada o a una línea: en la búsqueda, en Paradas cercanas, en la página de la parada o en la de la línea. La encontrarás aquí, sin buscarla cada vez.",
    reorder: "Reordenar",
    reorderDone: "Listo",
    reorderHint: "Mueve las paradas con las flechas. El orden vale en este dispositivo.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: posición ${position} de ${total}.`,
    moveUp: (name: string): string => `Subir ${name}`,
    moveDown: (name: string): string => `Bajar ${name}`,
    addStar: (name: string): string => `Marcar con estrella la parada ${name}`,
    removeStar: (name: string): string => `Quitar la estrella de la parada ${name}`,
    addStarLine: (name: string): string => `Marcar con estrella la línea ${name}`,
    removeStarLine: (name: string): string => `Quitar la estrella de la línea ${name}`,
    starredTitle: "Con estrella: está en favoritos",
    starTitle: "Marcar con estrella",
    starredLabel: "Con estrella",
    starLabel: "Estrella",
    editLabels: (name: string): string => `Editar etiqueta y líneas de ${name}`,
    onlyLines: (labels: string): string => `solo ${labels}`,
    notUpdated: "no actualizado",
    noArrivalsOnPinned: "Ningún paso en las líneas elegidas.",
    changeLines: "Cambiar líneas",
    noArrivalsSoon: "Ningún paso en los próximos minutos.",
    openForTimes: "Abrir para ver los horarios",
    vehiclesUnavailable: "Vehículos no disponibles",
    lookingForVehicles: "Buscando los vehículos en servicio…",
    noVehiclesNow: "Ningún vehículo en servicio ahora",
    vehiclesInService: (count: number): string =>
      `${counted(count, "vehículo", "vehículos")} en servicio ahora`,
    refreshArrivals: "Actualizar las llegadas",
    undoRemovedStop: "Parada sin estrella: ya no está en favoritos.",
    undoRemovedLine: "Línea sin estrella: ya no está en favoritos.",
    undoDismiss: "Cerrar el aviso",
    more: (count: number): string => `Otros ${count} favoritos`,
    sidebarEmptyBefore: "Toca la estrella junto a una parada o a una línea, en la búsqueda, en ",
    sidebarEmptyAfter: " o en la página que estás viendo. La encontrarás aquí.",
    nextDeparture: "próximo paso",
    noDeparture: "ningún paso disponible",
    notAvailableShort: "n/d",
  },

  recents: {
    heading: "Vistas hace poco",
    clear: "Vaciar",
    emptyTitle: "Ninguna parada reciente",
    emptyHint:
      "Las paradas que abres se quedan aquí unos días, así las encuentras sin volver a buscarlas.",
    listAria: "Paradas vistas hace poco",
    justNow: "hace un momento",
    today: "hoy",
    yesterday: "ayer",
  },

  arrivals: {
    due: "llegando",
    live: "en tiempo real",
    scheduled: "según horario",
    scheduledTail: " previsto",
    scheduledSr: "horario previsto",
    onTime: "puntual",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "de retraso",
    earlySuffix: "de adelanto",
    lateSr: (minutes: number): string =>
      `${minutes} ${plural(minutes, "minuto", "minutos")} de retraso`,
    earlySr: (minutes: number): string =>
      `${minutes} ${plural(minutes, "minuto", "minutos")} de adelanto`,
    skipped: "suprimido",
    skippedSr: "viaje suprimido",
    atClock: (clock: string): string => `a las ${clock}`,
    towardsSr: (headsign: string): string => `dirección ${headsign}`,
    loadingAria: "Cargando llegadas",
    emptyTitle: "Ningún paso previsto",
    emptyHint:
      "No hay viajes acercándose. Prueba con el horario programado o vuelve a intentarlo dentro de poco.",
    frozenUnknown: "previsión no actualizada",
    frozenFor: (minutes: number): string => `parada desde hace ${minutes} min`,
    frozenPrefix: (state: string): string => `previsión ${state}`,
    frozenSr: (state: string): string => `previsión ${state}, no actualizada en tiempo real`,
    expectedSr: (relative: string, clock: string): string =>
      `prevista ${relative}, a las ${clock}`,
    bannerNoRealtimeStrong: "Tiempo real no disponible.",
    bannerNoRealtime:
      " Estamos mostrando los horarios programados: los vehículos pueden pasar antes o después.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Tiempo real detenido." : `Tiempo real detenido desde hace ${minutes} min.`,
    bannerFrozenBefore: " Las previsiones de abajo son las",
    bannerFrozenLastUpdate: " de la última actualización",
    bannerFrozenAt: (clock: string): string => ` de las ${clock}`,
    bannerFrozenAfter: " y no se están actualizando: tómalas con cautela.",
    bannerPartialStrong: "Tiempo real parcial.",
    bannerPartial: " Una parte de los datos no ha llegado: pueden faltar algunos viajes.",
    showOnMap: (line: string): string => `Mostrar en el mapa el vehículo de la línea ${line}`,
    hideOnMap: (line: string): string => `Quitar el resalte del vehículo de la línea ${line}`,
  },

  dataAge: {
    prefix: "Actualizado",
    now: "ahora",
    secondsAgo: (seconds: number): string => `hace ${seconds} s`,
    minutesAgo: (minutes: number): string => `hace ${minutes} min`,
    atClock: (clock: string): string => `a las ${clock}`,
    never: "nunca",
  },

  refreshFeedback: {
    updated: "Actualizado",
    unchanged: "Comprobado, ninguna novedad",
    failed: "La actualización no ha funcionado",
    updatedShort: "Actualizado",
    unchangedShort: "Sin novedades",
    failedShort: "No actualizado",
    busy: "Actualizando…",
    busySpoken: "Actualización en curso",
  },

  stop: {
    tabArrivals: "Llegadas",
    tabTimetable: "Horarios",
    tabsAria: "Vista de la parada",
    editTag: "Editar etiqueta",
    addTag: "Etiqueta",
    map: "Mapa",
    realtimePrefix: "Tiempo real",
    noRealtime: "Ningún dato en tiempo real",
    pageNotUpdated: "Página todavía sin actualizar",
    pageUpdatedAt: (clock: string): string => `Página actualizada a las ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Estás viendo el último dato recibido.`,
    arrivalsUnavailable: "Llegadas no disponibles",
    emptyHint:
      "Ningún viaje acercándose ahora. Abre los horarios para saber cuándo está previsto el próximo paso.",
    seeTimetable: "Ver los horarios",
    linesHere: "Líneas que paran aquí",
  },

  tagDialog: {
    titleFavorite: "Favorito",
    titleTag: "Etiqueta de la parada",
    label: "Cómo la llamas tú",
    placeholder: "Casa, oficina, gimnasio…",
    hint: (maxChars: number): string =>
      `Solo es para ti: se queda en este dispositivo, máximo ${maxChars} caracteres.`,
    linesLegend: "Líneas que mostrar",
    linesNone: "Ninguna elección: la tarjeta muestra todas las líneas.",
    linesSome: (count: number): string =>
      `Solo ${counted(count, "línea", "líneas")} en la tarjeta.`,
    showAllLines: "Mostrar todas las líneas",
    removeTag: "Quitar etiqueta",
  },

  timetable: {
    previousDay: "Día anterior",
    nextDay: "Día siguiente",
    today: "hoy",
    scheduled: "horario programado",
    jumpToNow: "Ir a ahora",
    backToToday: "Volver a hoy",
    fromServiceStart: "Desde el inicio del servicio",
    unavailableTitle: "Horario no disponible",
    partialError: (error: string): string => `${error}. Estás viendo los viajes ya cargados.`,
    emptyTitle: "Ningún viaje de aquí en adelante",
    emptyFromNow:
      "Desde esta hora no hay más pasos. Prueba desde el inicio del servicio, otro día, o quita el filtro de línea.",
    emptyWholeDay:
      "Este día no hay ningún paso programado: prueba el día anterior o el siguiente, o quita el filtro de línea.",
    loadMore: "Mostrar más viajes",
    loadingMore: "Cargando…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${counted(count, "viaje", "viajes")} de las ${from} a las ${to}` +
      (complete ? ", hasta el final del servicio" : "") +
      ". Son los horarios oficiales del día de servicio, sin tiempo real.",
  },

  map: {
    fallbackAria: "Mapa",
    vehiclesHeading: "Vehículos en el mapa",
    show: "Mostrar",
    hide: "Ocultar",
    modeGroup: "Qué vehículos mostrar",
    modeApproaching: "Llegando aquí",
    modeAllLines: "Todas las líneas",
    loadingStop: "Cargando la posición de la parada…",
    stopMapAria: (stopName: string): string => `Mapa de los vehículos en la parada ${stopName}`,
    centreOnStop: "Centrar en la parada",
    nearbyVehicles: "Vehículos cerca de aquí",
    allVehicles: "Todos, también los lejanos",
    loadingVehicles: "Cargando los vehículos…",
    noneApproaching: "Ningún vehículo acercándose",
    approachingCount: (count: number): string =>
      `${count} ${plural(count, "vehículo llegando", "vehículos llegando")}`,
    onTheseLines: (count: number): string =>
      `${counted(count, "vehículo", "vehículos")} en las líneas de esta parada`,
    positionsAt: (clock: string): string => `posiciones de las ${clock}`,
    positionsStale: "posiciones no actualizadas",
    allLinesNote:
      "Los vehículos llenos van hacia esta parada, los atenuados circulan por las mismas líneas pero ahora no pasan por aquí.",
    approachingList: "Vehículos llegando",
    hereIn: (relative: string): string => `Aquí ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Aquí ${relative}, a las ${clock}`,
    notInbound: "Circulando por esta línea, no se dirige a esta parada",
    noBearing: " · dirección no transmitida",
    follow: "Estoy en este vehículo, síguelo",
    unfollow: "Dejar de seguir",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Línea ${line}, aquí ${relative}${followed ? ", lo estás siguiendo" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Línea ${line}, circulando, no se dirige a esta parada${followed ? ", lo estás siguiendo" : ""}`,
    yourPosition: "Tu posición",
    vehicleTitle: (vehicleId: string): string => `Vehículo ${vehicleId}`,
    showOnMap: (stopName: string): string => `Mostrar ${stopName} en el mapa`,
    divertedSuffix: " · fuera de ruta",
    divertedBadge: "Fuera de ruta",
    divertedNote: "Está siguiendo un trayecto distinto del previsto.",
  },

  follow: {
    headlineLive: "Estoy siguiendo este vehículo",
    headlinePaused: "Seguimiento en pausa",
    headlineStale: "Posición detenida",
    headlineLost: "El vehículo ya no está en línea",
    detailLive: "El mapa sigue centrado en él en cada actualización.",
    detailPaused:
      "Has movido el mapa, así que ya no lo muevo yo. Toca Reanudar para volver al vehículo.",
    detailStaleUnknown: "El vehículo lleva un rato sin transmitir su posición.",
    detailStale: (age: string): string =>
      `El vehículo no transmite desde hace ${age}: lo que ves en el mapa es el último punto conocido.`,
    detailLost:
      "Ya no recibo su posición. Puede haber terminado el viaje o haber salido de servicio.",
    ageMinutes: (minutes: number): string => `${minutes} ${plural(minutes, "minuto", "minutos")}`,
    ageHours: (hours: number): string => (hours === 1 ? "una hora" : `${hours} horas`),
    compact: "Siguiendo",
    compactSr: (line: string): string => ` la línea ${line}`,
    lineSr: (line: string): string => `, línea ${line}`,
    resume: "Reanudar",
    exit: "Salir",
    close: "Cerrar",
    lostHint: "Si todavía anda por ahí, lo encuentras pasando a «Todas las líneas».",
  },

  nearby: {
    title: "Paradas cercanas",
    mapAria: "Mapa de las paradas cercanas",
    searchHere: "Buscar en esta zona",
    radius: "Radio",
    locating: "Localizando…",
    myPosition: "Mi posición",
    geoDenied:
      "Permiso de localización denegado. Mostramos el centro de Roma: mueve el mapa y busca en esa zona.",
    geoUnavailable:
      "Posición no disponible en este momento. Mostramos el centro de Roma: mueve el mapa y busca en esa zona.",
    geoTimeout:
      "La localización ha tardado demasiado. Mostramos el centro de Roma: mueve el mapa y vuelve a intentarlo.",
    geoUnsupported:
      "Este navegador no admite la geolocalización. Mueve el mapa para buscar las paradas.",
    outsideRome: "Estás fuera del área de Roma: mostramos el centro de la ciudad.",
    outsideCoverage: "Esta zona está fuera del área cubierta. Mueve el mapa hacia Roma.",
    focusStopMissing: "Parada solicitada no encontrada: mostramos tu zona.",
    focusStopFailed: (error: string): string => `Parada solicitada no cargada (${error}).`,
    stopsFailed: (error: string): string => `Paradas no cargadas: ${error}`,
    loadingStops: "Buscando las paradas…",
    noStopsInRadius: (radius: string): string =>
      `Ninguna parada dentro de ${radius}. Prueba a ampliar el radio o a mover el mapa.`,
    onMapCap: (max: number): string => ` (las primeras ${max} en el mapa)`,
    noLines: "Ninguna línea",
    arrivalsLink: "Llegadas",
    showMoreStops: "Mostrar más paradas",
  },

  line: {
    loading: "Cargando la línea…",
    loadFailed: (error: string): string => `Línea no cargada: ${error}`,
    mapAria: (name: string): string => `Mapa de la línea ${name}`,
    dataAt: (clock: string): string => `datos de las ${clock}`,
    updatedAt: (clock: string): string => `actualizado a las ${clock}`,
    vehiclesStale: (error: string): string => `Vehículos no actualizados: ${error}`,
    noPathForDirection: "Recorrido no disponible para esta dirección",
    stopsHeading: (count: number): string => `Paradas (${count})`,
    noStopsForDirection: "Ninguna parada disponible para esta dirección.",
    showAllStops: "Mostrar todas las paradas",
  },

  lineService: {
    inService: (count: number): string => `${counted(count, "vehículo", "vehículos")} en línea`,
    loadingVehicles: "Cargando los vehículos…",
    checkingTimetable: "Comprobando los horarios…",
    feedDownTitle: "Posiciones en tiempo real no disponibles",
    feedDownDetail:
      "El servicio puede ser normal: no conseguimos leer la posición de los vehículos.",
    noneReporting: "Ningún vehículo transmite su posición",
    unknownDetail:
      "No quiere decir que la línea no esté en servicio: los horarios programados están en la página de una parada.",
    scheduledDetail: (count: number): string =>
      `El servicio está programado: ${count} ${plural(count, "viaje previsto", "viajes previstos")} de aquí al final del día.`,
    finishedTitle: "Servicio terminado por hoy",
    finishedDetail: (count: number, clock: string): string =>
      `Hoy ${counted(count, "viaje programado", "viajes programados")}, el último a las ${clock}.`,
    noneTodayTitle: "Ningún viaje programado hoy",
    noneTodayDetail: "En esta línea no hay viajes en horario para el día de hoy.",
    noneTodayFrom: (stopName: string): string =>
      `Desde ${stopName} no hay viajes en horario para el día de hoy.`,
    nextDepartures: "Próximas salidas",
    nextDeparturesFrom: (stopName: string): string => ` desde ${stopName}`,
    scheduledOnly: "Horarios programados, sin tiempo real.",
  },

  journey: {
    title: "Itinerario",
    subtitle: "De un punto a otro de Roma en bus, tranvía y metro.",
    from: "Salida",
    to: "Llegada",
    placeholder: "Parada, dirección o lugar",
    swap: "Invertir",
    whenLegend: "Cuándo",
    now: "Ahora",
    pickTime: "Elegir la hora",
    timeLabel: "Fecha y hora de salida",
    submit: "Buscar el itinerario",
    resultsHeading: "Itinerarios",
    emptyTitle: "¿A dónde quieres ir?",
    emptyHint:
      "Escribe una salida y una llegada: buscamos el mejor itinerario sobre los horarios oficiales.",
    searching: "Buscando los itinerarios…",
    noResultsTitle: "Ningún itinerario",
    noResultsHint:
      "Solo buscamos conexiones directas o con un transbordo. Prueba a mover la salida o la hora.",
    disclaimer:
      "Horarios programados, no en tiempo real: no se tienen en cuenta los retrasos reales. Los tramos a pie se estiman en línea recta, así que la distancia real por la calle es mayor.",
    searchedFrom: (when: string): string => ` Búsqueda desde las ${when}.`,
    mapAria: "Mapa del itinerario seleccionado",
    mapCaption:
      "Los tramos en vehículo siguen el recorrido real de la línea. Los discontinuos se estiman en línea recta: los transbordos a pie y las raras líneas sin trazado.",
    missingEndpoints: "Indica tanto la salida como la llegada.",
    badDateTime: "Fecha y hora no válidas.",
    geoUnsupported: "Este navegador no admite la geolocalización.",
    geoUnavailable: "Posición no disponible en este momento.",
    geoOutsideRome: "Estás fuera del área de Roma: escribe una dirección.",
    geoDenied: "Permiso de localización denegado: escribe una dirección.",
    geoTimeout: "La localización ha tardado demasiado.",
    originMarker: (name: string): string => `Salida: ${name}`,
    destinationMarker: (name: string): string => `Llegada: ${name}`,
    useMyPosition: "Usar mi posición",
    clearField: (label: string): string => `Vaciar ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Sugerencias para ${label.toLowerCase()}`,
    placeStop: "Parada",
    placeCoord: "Coordenadas",
    placeAddress: "Dirección",
    walkOnly: "Solo a pie",
    walkOnlyShort: "a pie",
    noTransfers: "sin transbordos",
    transfers: (count: number): string => `${counted(count, "transbordo", "transbordos")}`,
    walkDistance: (distance: string): string => `${distance} a pie`,
    walkLeg: (distance: string, duration: string): string =>
      `A pie ${distance}, unos ${duration} hasta `,
    inService: "en servicio",
    stopCount: (count: number): string => counted(count, "parada", "paradas"),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Itinerario ${index}: salida ${departure}, llegada ${arrival}`,
    lineDetailsAria: (line: string): string => `Línea ${line}, detalles`,
    hours: (hours: number): string => `${hours} h`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} h ${minutes}`,
    /** journey.ts runs on the server and has no locale: it sends a slug. */
    noticeNoOriginStops:
      "Ninguna parada a pie desde el punto de salida: prueba una dirección más cerca de una línea.",
    noticeNoDestinationStops:
      "Ninguna parada a pie desde el punto de llegada: prueba una dirección más cerca de una línea.",
    noticeNoConnection: "Ninguna conexión entre estas dos zonas en las próximas horas.",
    noticeWalkOnlyLeft:
      "Ninguna conexión con horario en las próximas horas: solo queda el recorrido a pie.",
    noticeLaterDepartures:
      "Nada previsto en la próxima hora y media: mostramos los primeros viajes que hay después.",
  },

  alerts: {
    title: "Avisos de servicio",
    subtitle: "Desvíos, suspensiones y cambios publicados en el feed oficial.",
    loading: "Cargando…",
    degraded:
      "El feed en tiempo real no responde o está viejo: estos avisos podrían no estar actualizados.",
    loadFailed: "No se han podido cargar los avisos.",
    refreshFailed: (error: string): string =>
      `La última actualización no ha funcionado (${error}): estás viendo la lista anterior.`,
    searchPlaceholder: "Busca: huelga, desvío, calle…",
    searchAria: "Buscar entre los avisos",
    filterByLine: "Filtrar por línea",
    allLines: (count: number): string => `Todas las líneas (${count})`,
    networkWide: "Avisos generales",
    clearFilters: "Borrar",
    noMatch: "Ningún aviso coincide con los filtros.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${plural(shown, "aviso", "avisos")} de ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${plural(count, "aviso activo", "avisos activos")} en ${lines} líneas.`,
    goToLine: "Ir a la línea",
    noneTitle: "Ningún aviso activo",
    noneHint:
      "Por ahora el feed no señala interrupciones ni cambios en el servicio. Vuelve a comprobarlo antes de salir.",
    noResultsTitle: "Ningún resultado",
    noResultsHint:
      "Prueba con menos palabras, o borra los filtros para volver a ver todos los avisos.",
    noSelectionTitle: "Ningún aviso seleccionado",
    noSelectionHint: "Elige un aviso de la lista de la izquierda para leerlo entero.",
    showMoreLines: (count: number): string => `Mostrar más líneas (${count})`,
    goToLineShort: "ir a la línea",
    fallbackHeader: "Aviso de servicio",
    noDetail: "Ningún detalle publicado por el operador.",
    operatorLink: "Detalles en la web del operador",
    affectedLines: "Líneas afectadas",
    alsoOn: "También en",
    contextHeading: (count: number): string =>
      `${count} ${plural(count, "aviso activo", "avisos activos")}`,
    contextAria: "Avisos de servicio",
    contextAll: "Todos",
    contextUnavailable: (error: string): string => `Avisos no disponibles: ${error}`,
    contextMore: (count: number): string => `Otros ${count} avisos en la `,
    contextMoreLink: "página de los avisos",
    contextStale: (error: string): string =>
      `La última actualización no ha funcionado (${error}): estos avisos podrían no estar al día.`,
    windowBetween: (from: string, until: string): string => `Del ${from} al ${until}`,
    windowFrom: (from: string): string => `Desde el ${from}, sin fecha de fin indicada`,
    windowUntil: (until: string): string => `Hasta el ${until}`,
    windowUnknown: "Periodo de validez no indicado",
    effect: (code: string): string | null => EFFECT_ES[code] ?? null,
    cause: (code: string): string | null => CAUSE_ES[code] ?? null,
  },

  settings: {
    title: "Ajustes",
    subtitle: "Todo se queda en este dispositivo. Ninguna cuenta, ningún servidor.",
    sectionArrivals: "Llegadas",
    autoRefresh: "Actualización automática",
    everySeconds: (seconds: number): string => `cada ${seconds} segundos`,
    autoRefreshHint: "Intervalo entre dos lecturas del feed en tiempo real.",
    maxArrivals: "Llegadas mostradas por parada",
    showScheduled: "Mostrar los horarios programados",
    showScheduledHint:
      "Cuando el tiempo real no tiene nada para una parada, usa el horario.",
    sectionNearby: "Cerca de mí",
    radius: "Radio de búsqueda",
    radiusHint: "Vale también para los radios rápidos en el mapa de las paradas cercanas.",
    sectionAppearance: "Aspecto",
    themeLegend: "Tema",
    themeSystem: "Sistema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    sectionLanguage: "Idioma",
    languageLegend: "Idioma de la interfaz",
    languageSystem: "Sistema",
    languageHint: (resolved: string): string =>
      `Con «Sistema» seguimos el idioma del navegador: ahora es ${resolved}.`,
    sectionBackup: "Copia de los favoritos",
    backupIntro:
      "Un archivo JSON en tu dispositivo: es la forma de llevar los favoritos a otro navegador, ya que aquí no hay ninguna cuenta.",
    exportCount: (count: number): string => `Exportar (${count})`,
    importFromFile: "Importar desde archivo",
    exported: (count: number): string => `Exportados ${count} favoritos.`,
    exportFailed: "La exportación no ha funcionado en este navegador.",
    fileTooLarge: "El archivo es demasiado grande para ser una copia de los favoritos.",
    fileUnreadable: "No se ha podido leer el archivo.",
    importEmpty: "El archivo está vacío.",
    importNotJson: "El archivo no es un JSON válido.",
    importNoList: "El archivo no contiene una lista de favoritos.",
    importNoneValid: "Ningún favorito válido encontrado en el archivo.",
    importFound: (count: number): string => `Encontrados ${count} favoritos válidos`,
    importSkipped: (count: number): string => `, ${count} entradas descartadas.`,
    importFoundEnd: ".",
    importMerge: "Combinar",
    importReplace: "Sustituir",
    replaced: (count: number): string => `Favoritos sustituidos: ahora son ${count}.`,
    mergedNone: "Ningún favorito nuevo que añadir.",
    merged: (count: number): string => `Añadidos ${count} favoritos.`,
    sectionLocalData: "Datos locales",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} favoritos, ${recents} paradas en el historial.`,
    confirmClearFavorites: "¿Borrar todos los favoritos? La operación no se puede deshacer.",
    confirmClearFavoritesYes: "Sí, vaciar",
    clearFavorites: "Vaciar favoritos",
    favoritesCleared: "Favoritos vaciados.",
    confirmClearRecents: "¿Borrar el historial de las paradas vistas?",
    confirmClearRecentsYes: "Sí, borrar",
    clearRecents: "Borrar historial",
    recentsCleared: "Historial borrado.",
    resetDefaults: "Restablecer los ajustes predeterminados",
    settingsReset: "Ajustes devueltos a los valores predeterminados.",
    infoLink: "Información, fuentes de los datos y preguntas frecuentes",
  },

  sync: {
    titleFull: "Sincronizar dispositivos",
    titleCollapsed: "Sincronización",
    badgeOn: "activa",
    summaryLoading: "…",
    summaryUnavailable: "No disponible en esta conexión",
    summaryOff: "No activa",
    summarySyncing: "Sincronización en curso…",
    summaryError: "Error de sincronización",
    summaryConflict: "Conflicto por resolver",
    summaryOn: (last: string): string => `Activa · última ${last}`,
    intro:
      "Lleva favoritos, recientes y ajustes a otro dispositivo con un código. Los datos se cifran aquí: el servidor solo guarda datos ilegibles.",
    enable: "Activar sincronización",
    haveCode: "Ya tengo un código",
    codeLabel: "Código de sincronización",
    codeHint:
      "20 caracteres, tal como los lees en el otro dispositivo. Mayúsculas, guiones y espacios no cuentan.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} caracteres`,
    join: "Conectar",
    onIntro:
      "Los datos se cifran en este dispositivo antes de salir. Quien tenga el código puede leer todos tus favoritos: úsalo solo en dispositivos tuyos.",
    code: "Código",
    showCode: "Mostrar código",
    hideCode: "Ocultar código",
    copyCode: "Copiar código",
    copied: "Copiado",
    lastSync: "Última sincronización:",
    inProgress: " · en curso…",
    syncNow: "Sincronizar ahora",
    disconnect: "Desconectar",
    disconnectNote:
      "Al desconectar, los datos se quedan en este dispositivo y la copia cifrada permanece en el servidor hasta que la elimines.",
    deleteWarning:
      "Elimina la copia cifrada del servidor. Los demás dispositivos ya no encontrarán nada que sincronizar. No se puede deshacer.",
    deleteConfirm: "Eliminar de verdad",
    deleteRemote: "Eliminar los datos del servidor",
    justNow: "ahora",
    minutesAgo: (minutes: number): string => `hace ${minutes} min`,
    atClock: (clock: string): string => `a las ${clock}`,
    errors: {
      aborted: "Operación cancelada.",
      generic: "La sincronización no ha funcionado. Vuelve a intentarlo dentro de un momento.",
      insecureContext:
        "La sincronización necesita una conexión segura: abre el sitio en https (o en localhost). En http normal los navegadores desactivan el cifrado, así que aquí no se puede cifrar nada.",
      noBase64Encode: "Este navegador no sabe codificar los datos de sincronización.",
      noBase64Decode: "Este navegador no sabe descodificar los datos de sincronización.",
      invalidSyncData: (what: string): string =>
        `Datos de sincronización no válidos (${what}).`,
      codeRequired: "Escribe el código de sincronización.",
      codeTooLong: (max: number): string =>
        `Ese código es demasiado largo: debería tener ${counted(max, "carácter", "caracteres")}.`,
      codeInvalidChars: (chars: string): string =>
        `El código contiene caracteres que no se admiten: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `El código tiene ${counted(required, "carácter", "caracteres")}, y has escrito ${actual}.`,
      keyDerivationFailed: "Este navegador no puede derivar las claves de sincronización.",
      preparePayloadFailed: "No se han podido preparar los datos que hay que sincronizar.",
      encryptFailed: "No se han podido cifrar los datos en este dispositivo.",
      decryptFailed:
        "El código no corresponde a estos datos, o los datos del servidor están dañados.",
      invalidSyncId: "Identificador de sincronización no válido.",
      responseTooLarge: "El servidor ha devuelto demasiados datos.",
      timeout: "El servidor no ha respondido a tiempo.",
      unreachable: "No se puede contactar con el servidor. Comprueba la conexión.",
      invalidResponse: "Respuesta del servidor no válida.",
      invalidResponseField: (what: string): string =>
        `Respuesta del servidor no válida (${what}).`,
      unexpectedFormat: "El servidor ha respondido en un formato inesperado.",
      rateLimited:
        "Demasiadas sincronizaciones seguidas. Vuelve a intentarlo dentro de un minuto.",
      pullRejected: (status: number): string =>
        `El servidor ha rechazado la lectura (error ${status}).`,
      payloadTooLarge: "Hay demasiados datos para sincronizar.",
      pushRejected: (status: number): string =>
        `El servidor ha rechazado el guardado (error ${status}).`,
      deleteRejected: (status: number): string =>
        `El servidor ha rechazado la eliminación (error ${status}).`,
      conflict:
        "Otro dispositivo está escribiendo en estos mismos datos ahora mismo. Tus datos locales están a salvo: vuelve a intentarlo dentro de unos segundos.",
    },
    status: {
      deleted: "Datos eliminados del servidor. Este dispositivo ya no se sincroniza.",
      disconnected:
        "La sincronización está desactivada en este dispositivo. Tus datos se quedan aquí y la copia cifrada permanece en el servidor hasta que la elimines.",
    },
  },

  info: {
    title: "Información",
    subtitle:
      "Horarios y llegadas del transporte público de Roma, a partir de los datos abiertos oficiales.",
    unofficialTitle: "App no oficial",
    unofficialBody:
      "Este sitio no está afiliado, asociado, autorizado ni respaldado de ninguna manera por ATAC S.p.A., por Roma Servizi per la Mobilità ni por Roma Capitale. Es un proyecto independiente que se limita a leer los datos abiertos que estas entidades publican. Para información oficial, billetes y reclamaciones dirígete a sus canales.",
    whatTitle: "Qué es",
    whatBody1:
      "Una app web para saber dentro de cuánto pasa el próximo vehículo en la parada donde estás. Buscas una parada o una línea, la guardas en favoritos y la encuentras en el inicio con las llegadas actualizadas. Sin cuenta, sin publicidad, sin estadísticas de uso.",
    whatBody2:
      "Cuando el feed en tiempo real cubre el viaje, la hora mostrada es una previsión basada en la posición del vehículo. Si no, la app recurre al horario programado y te lo dice siempre, en lugar de hacer pasar por previsión un dato viejo.",
    dataTitle: "De dónde vienen los datos",
    dataBodyBefore:
      "Horarios, paradas, líneas, recorridos, posiciones de los vehículos y avisos de servicio vienen de los datos abiertos de ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (feeds GTFS y GTFS-Realtime). Los horarios programados se actualizan cada día, el tiempo real cada 30 segundos aproximadamente.",
    dataLink: "romamobilita.it — Datos abiertos",
    dataLicence:
      "Los datos siguen siendo propiedad de sus titulares y se usan en las condiciones de la licencia con la que se publican.",
    privacyTitle: "Privacidad",
    privacyBody:
      "No hay inicio de sesión ni perfil de usuario. Favoritos, paradas vistas hace poco y ajustes se guardan solo en tu navegador y no se envían a ninguna parte. La posición, si la concedes para buscar las paradas cercanas, se queda en el dispositivo: se usa para calcular las distancias y no se almacena.",
    faqTitle: "Preguntas frecuentes",
    faq1Q: "¿Por qué no aparece una línea o un autobús?",
    faq1A:
      "Mostramos solo lo que hay en los feeds oficiales. Si un vehículo no transmite su posición, o si su viaje no está en el feed en tiempo real, para nosotros no existe: como mucho verás el horario programado. Pasa a menudo con los viajes sustitutivos, los buses lanzadera y los vehículos con el localizador averiado.",
    faq2Q: "¿Por qué los horarios son distintos de los escritos en la parada?",
    faq2A:
      'El cartel del poste indica el horario programado, que cambia pocas veces al año. Aquí, cuando el vehículo transmite, ves la previsión calculada sobre su posición real, que tiene en cuenta el tráfico y los retrasos. En cambio, cuando lees "previsto", no hay previsión y estamos mostrando el mismo horario del cartel.',
    faq3Q: "¿Qué pasa de noche?",
    faq3A:
      "De noche el feed en tiempo real está casi vacío, porque circulan pocos vehículos. La app sigue funcionando con los horarios programados de las líneas nocturnas. En el GTFS el día de servicio no acaba a medianoche sino a las 04:00: un viaje de la una de la madrugada pertenece todavía al día anterior, y por eso puedes ver horas como 25:30 traducidas a 01:30.",
    faq4Q: "¿Mis favoritos acaban en un servidor?",
    faq4A:
      "No. Favoritos, historial y ajustes están en el localStorage del navegador. Si vacías los datos del sitio o cambias de dispositivo, desaparecen: desde los ajustes puedes exportarlos a un archivo JSON y volver a importarlos en otro sitio.",
    settingsLink: "Ir a los ajustes",
  },

  footer: {
    dataPrefix: "Datos de servicio y horarios: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (datos abiertos GTFS).",
    independent:
      "Proyecto independiente, no afiliado a ATAC ni a Roma Servizi per la Mobilità. ",
    infoLink: "Información",
  },

  errors: {
    genericTitle: "Algo no ha funcionado",
    unexpected: "Error inesperado",
    unexpectedDot: "Error inesperado.",
    stopNotFound: "Parada no encontrada",
    serviceDown: "El servicio no responde",
    requestFailed: (status: number): string => `La petición no ha funcionado (${status})`,
    httpStatus: (status: number): string => `Error ${status}`,
    badResponse: "Respuesta del servidor no válida",
    badResponseDot: "Respuesta del servidor no válida.",
    timedOut: "Petición caducada",
    timedOutDot: "Petición caducada.",
    offline: "Sin conexión",
    connectionFailed: "La conexión no ha funcionado.",
    tooManyRequests: "Demasiadas peticiones",
    badRequest: "Parámetros no válidos",
    lineNotFound: "Línea no encontrada",
    journeyOriginNotFound: "Salida no encontrada",
    journeyDestinationNotFound: "Llegada no encontrada",
    journeyPlaceHint: "Prueba con una dirección más precisa.",
  },

  notFound: {
    kicker: "Error 404",
    title: "Parada sin servicio",
    body:
      "Esta página no existe. Puede pasar con un enlace viejo, o con el código de una parada o de una línea que ya no está en el feed.",
    searchCta: "Buscar una parada",
    nearbyCta: "Paradas cercanas",
  },

  appError: {
    title: "Viaje interrumpido",
    body:
      "Esta pantalla no ha conseguido cargarse. Vuelve a intentarlo: si el problema sigue, probablemente sea el servicio de datos el que no responde.",
    digest: (digest: string): string => `Código: ${digest}`,
    backHome: "Volver al inicio",
    globalTitle: "Servicio suspendido",
    globalBody:
      "La aplicación se ha detenido por un error inesperado. Recarga la página: tus favoritos siguen guardados en el teléfono y no se pierden.",
    reload: "Recargar",
  },

  format: {
    due: "llegando",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "fecha no disponible",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "actualización desconocida",
    ageSeconds: (seconds: number): string => `actualizado hace ${seconds} s`,
    ageMinutes: (minutes: number): string => `actualizado hace ${minutes} min`,
    ageAt: (clock: string): string => `actualizado a las ${clock}`,
    onTime: "puntual",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — salidas en tiempo real",
    appDescription:
      "Horarios y pasos en tiempo real de autobuses, tranvías y metro en Roma. Favoritos, paradas cercanas y avisos de servicio, sin cuenta y sin publicidad.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription: "Las paradas de ATAC más cercanas a ti, con mapa y las líneas que pasan.",
    journeyDescription:
      "Calcula cómo ir de un punto a otro de Roma en autobús, tranvía y metro, con los horarios oficiales de ATAC.",
    alertsDescription:
      "Desvíos, suspensiones y cambios de servicio publicados en el feed oficial.",
    settingsDescription:
      "Actualización de las llegadas, radio de búsqueda, tema y gestión de los favoritos.",
    infoDescription:
      "Qué es esta app, de dónde vienen los datos y por qué no está afiliada a ATAC ni a Roma Servizi per la Mobilità.",
    stopDescription: "Próximos pasos en tiempo real y horario programado de la parada.",
    lineDescription: "Recorrido, paradas y vehículos en tiempo real de la línea.",
  },

  skeleton: {
    loading: "Cargando",
  },
};

const EFFECT_ES: Record<string, string | undefined> = {
  NO_SERVICE: "Servicio suspendido",
  REDUCED_SERVICE: "Servicio reducido",
  SIGNIFICANT_DELAYS: "Retrasos significativos",
  DETOUR: "Desvío",
  ADDITIONAL_SERVICE: "Servicio adicional",
  MODIFIED_SERVICE: "Servicio modificado",
  STOP_MOVED: "Parada trasladada",
  NO_EFFECT: "Ningún efecto sobre el servicio",
  ACCESSIBILITY_ISSUE: "Problema de accesibilidad",
  OTHER_EFFECT: "Otro",
  UNKNOWN_EFFECT: "Efecto no especificado",
};

const CAUSE_ES: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Avería técnica",
  STRIKE: "Huelga",
  DEMONSTRATION: "Manifestación",
  ACCIDENT: "Accidente",
  HOLIDAY: "Festivo",
  WEATHER: "Mal tiempo",
  MAINTENANCE: "Mantenimiento",
  CONSTRUCTION: "Obras",
  POLICE_ACTIVITY: "Intervención policial",
  MEDICAL_EMERGENCY: "Emergencia sanitaria",
  OTHER_CAUSE: "Otra causa",
  UNKNOWN_CAUSE: "Causa no especificada",
};
