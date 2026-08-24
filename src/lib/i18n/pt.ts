/**
 * Portuguese dictionary. Shape and key order follow it.ts, the source of truth.
 * Portuguese counts 0 as singular, so the plurals go through CLDR rather than
 * the one-vs-rest helper.
 */

import type { Dictionary } from "./it";
import { pluralRules } from "./plural";

const { pick, count: n } = pluralRules("pt");

export const pt: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, início",
  },

  a11y: {
    skipToContent: "Ir para o conteúdo",
  },

  common: {
    retry: "Tentar de novo",
    cancel: "Cancelar",
    save: "Guardar",
    close: "Fechar",
    home: "Início",
    back: "Voltar",
    all: "Todas",
    loading: "A carregar…",
    searching: "A procurar…",
    refresh: "Atualizar",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Limpar a pesquisa",
    searchInProgress: "Pesquisa em curso",
  },

  nav: {
    primary: "Navegação principal",
    sidebar: "Barra lateral",
    sidebarNav: "Navegação lateral",
    openMenu: "Abrir o menu",
    closeMenu: "Fechar o menu",
    sections: "Secções",
    shortcuts: "Atalhos",
    infoAria: "Informações sobre a aplicação",
    home: "Início",
    nearbyShort: "Perto",
    nearby: "Paragens próximas",
    journey: "Percurso",
    alerts: "Avisos",
    settings: "Definições",
    info: "Info",
    hintNearby: "O que passa aqui perto",
    hintJourney: "De um ponto ao outro",
    hintAlerts: "Desvios e interrupções",
    hintSettings: "Atualização, tema, dados",
    hintInfo: "Fontes e notas legais",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "elétrico";
        case 1:
          return "metro";
        case 2:
          return "comboio";
        case 4:
          return "barco";
        default:
          return "autocarro";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Elétrico";
        case 1:
          return "Metro";
        case 2:
          return "Comboio";
        case 3:
          return "Autocarro";
        default:
          return "Linha";
      }
    },
    named: (name: string): string => `Linha ${name}`,
    namedAria: (name: string): string => `Linha ${name}`,
    details: "detalhes",
    towards: (headsign: string): string => `para ${headsign}`,
    towardsCapital: (headsign: string): string => `Para ${headsign}`,
    direction: "Direção",
    terminus: "terminal",
    noHeadsign: "Destino não indicado",
  },

  stops: {
    code: (code: string): string => `Paragem ${code}`,
    codeOnly: "Paragem",
    pole: (code: string): string => `Poste ${code}`,
    accessible: "Paragem acessível",
    named: (name: string): string => `Paragem ${name}`,
    countLabel: (count: number): string => n(count, { one: "paragem", other: "paragens" }),
    involved: (count: number): string =>
      n(count, { one: "paragem afetada", other: "paragens afetadas" }),
  },

  home: {
    kicker: "Roma · transportes públicos",
    title: "Quando é que passa?",
    intro:
      "Procura uma paragem pelo número ou pelo nome, ou uma linha. As passagens vêm do feed em tempo real de Roma.",
  },

  search: {
    inputAria: "Procurar uma paragem ou uma linha",
    placeholder: "Paragem, rua ou linha",
    searchingFor: (query: string): string => `A procurar «${query}»…`,
    noResultsFor: (query: string): string => `Nenhum resultado para «${query}»`,
    noResultsHint:
      "Experimenta com o número da paragem (por exemplo 70101), o nome da rua ou o número da linha.",
    resultsList: "Resultados da pesquisa",
    keyboardHint: "↑ ↓ para percorrer, Enter para abrir, Esc para fechar",
  },

  favorites: {
    heading: "Favoritos",
    emptyTitle: "Ainda não há favoritos",
    emptyHint:
      "Toca na estrela ★ ao lado de uma paragem ou de uma linha: na pesquisa, em Paragens próximas, na página da paragem ou na da linha. Voltas a encontrá-la aqui, sem a procurar de cada vez.",
    reorder: "Reordenar",
    reorderDone: "Concluído",
    reorderHint: "Move as paragens com as setas. A ordem vale neste dispositivo.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name}: posição ${position} de ${total}.`,
    moveUp: (name: string): string => `Subir ${name}`,
    moveDown: (name: string): string => `Descer ${name}`,
    addStar: (name: string): string => `Pôr a estrela na paragem ${name}`,
    removeStar: (name: string): string => `Tirar a estrela da paragem ${name}`,
    addStarLine: (name: string): string => `Pôr a estrela na linha ${name}`,
    removeStarLine: (name: string): string => `Tirar a estrela da linha ${name}`,
    starredTitle: "Com estrela: está nos favoritos",
    starTitle: "Pôr a estrela",
    starredLabel: "Com estrela",
    starLabel: "Estrela",
    editLabels: (name: string): string => `Editar etiqueta e linhas de ${name}`,
    onlyLines: (labels: string): string => `só ${labels}`,
    notUpdated: "não atualizado",
    noArrivalsOnPinned: "Nenhuma passagem nas linhas escolhidas.",
    changeLines: "Mudar linhas",
    noArrivalsSoon: "Nenhuma passagem nos próximos minutos.",
    openForTimes: "Abrir para ver os horários",
    vehiclesUnavailable: "Veículos não disponíveis",
    lookingForVehicles: "À procura dos veículos em serviço…",
    noVehiclesNow: "Nenhum veículo em serviço agora",
    vehiclesInService: (count: number): string =>
      `${n(count, { one: "veículo", other: "veículos" })} em serviço agora`,
    refreshArrivals: "Atualizar as chegadas",
    undoRemovedStop: "Paragem sem estrela: já não está nos favoritos.",
    undoRemovedLine: "Linha sem estrela: já não está nos favoritos.",
    undoDismiss: "Fechar o aviso",
    more: (count: number): string => `Mais ${count} favoritos`,
    sidebarEmptyBefore: "Toca na estrela ao lado de uma paragem ou de uma linha, na pesquisa, em ",
    sidebarEmptyAfter: " ou na página que estás a ver. Voltas a encontrá-la aqui.",
    nextDeparture: "próxima passagem",
    noDeparture: "nenhuma passagem disponível",
    notAvailableShort: "n/d",
  },

  recents: {
    heading: "Vistas há pouco",
    clear: "Esvaziar",
    emptyTitle: "Nenhuma paragem recente",
    emptyHint:
      "As paragens que abres ficam aqui alguns dias, para as encontrares sem as procurar outra vez.",
    listAria: "Paragens vistas há pouco",
    justNow: "agora mesmo",
    today: "hoje",
    yesterday: "ontem",
  },

  arrivals: {
    due: "a chegar",
    live: "em tempo real",
    scheduled: "por horário",
    scheduledTail: " previsto",
    scheduledSr: "horário previsto",
    onTime: "à tabela",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "de atraso",
    earlySuffix: "de adianto",
    lateSr: (minutes: number): string =>
      `${n(minutes, { one: "minuto", other: "minutos" })} de atraso`,
    earlySr: (minutes: number): string =>
      `${n(minutes, { one: "minuto", other: "minutos" })} de adianto`,
    skipped: "suprimida",
    skippedSr: "viagem suprimida",
    atClock: (clock: string): string => `às ${clock}`,
    towardsSr: (headsign: string): string => `direção ${headsign}`,
    loadingAria: "A carregar chegadas",
    emptyTitle: "Nenhuma passagem prevista",
    emptyHint:
      "Não há viagens a aproximar-se. Experimenta o horário programado ou tenta outra vez daqui a pouco.",
    frozenUnknown: "previsão não atualizada",
    frozenFor: (minutes: number): string => `parada há ${minutes} min`,
    frozenPrefix: (state: string): string => `previsão ${state}`,
    frozenSr: (state: string): string => `previsão ${state}, não atualizada em tempo real`,
    expectedSr: (relative: string, clock: string): string => `prevista ${relative}, às ${clock}`,
    bannerNoRealtimeStrong: "Tempo real indisponível.",
    bannerNoRealtime:
      " Estamos a mostrar os horários programados: os veículos podem passar adiantados ou atrasados.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Tempo real parado." : `Tempo real parado há ${minutes} min.`,
    bannerFrozenBefore: " As previsões abaixo são as",
    bannerFrozenLastUpdate: " da última atualização",
    bannerFrozenAt: (clock: string): string => ` das ${clock}`,
    bannerFrozenAfter: " e não estão a ser atualizadas: leva-as com cautela.",
    bannerPartialStrong: "Tempo real parcial.",
    bannerPartial: " Parte dos dados não chegou: algumas viagens podem faltar.",
    showOnMap: (line: string): string => `Mostrar no mapa o veículo da linha ${line}`,
    hideOnMap: (line: string): string => `Tirar o destaque do veículo da linha ${line}`,
  },

  dataAge: {
    prefix: "Atualizado",
    now: "agora",
    secondsAgo: (seconds: number): string => `há ${seconds} s`,
    minutesAgo: (minutes: number): string => `há ${minutes} min`,
    atClock: (clock: string): string => `às ${clock}`,
    never: "nunca",
  },

  refreshFeedback: {
    updated: "Atualizado",
    unchanged: "Verificado, nada de novo",
    failed: "A atualização falhou",
    updatedShort: "Atualizado",
    unchangedShort: "Nada de novo",
    failedShort: "Não atualizado",
    busy: "A atualizar…",
    busySpoken: "Atualização em curso",
  },

  stop: {
    tabArrivals: "Chegadas",
    tabTimetable: "Horários",
    tabsAria: "Vista da paragem",
    editTag: "Editar etiqueta",
    addTag: "Etiqueta",
    map: "Mapa",
    realtimePrefix: "Tempo real",
    noRealtime: "Nenhum dado em tempo real",
    pageNotUpdated: "Página ainda não atualizada",
    pageUpdatedAt: (clock: string): string => `Página atualizada às ${clock}`,
    lastDataSuffix: (error: string): string => `${error}. Estás a ver o último dado recebido.`,
    arrivalsUnavailable: "Chegadas não disponíveis",
    emptyHint:
      "Nenhuma viagem a aproximar-se agora. Abre os horários para saber quando está prevista a próxima passagem.",
    seeTimetable: "Ver os horários",
    linesHere: "Linhas que param aqui",
  },

  tagDialog: {
    titleFavorite: "Favorito",
    titleTag: "Etiqueta da paragem",
    label: "Como lhe chamas",
    placeholder: "Casa, escritório, ginásio…",
    hint: (maxChars: number): string =>
      `Só serve para ti: fica neste dispositivo, no máximo ${maxChars} caracteres.`,
    linesLegend: "Linhas a mostrar",
    linesNone: "Nenhuma escolha: o cartão mostra todas as linhas.",
    linesSome: (count: number): string =>
      `Só ${n(count, { one: "linha", other: "linhas" })} no cartão.`,
    showAllLines: "Mostrar todas as linhas",
    removeTag: "Remover etiqueta",
  },

  timetable: {
    previousDay: "Dia anterior",
    nextDay: "Dia seguinte",
    today: "hoje",
    scheduled: "horário programado",
    jumpToNow: "Ir para agora",
    backToToday: "Voltar a hoje",
    fromServiceStart: "Desde o início do serviço",
    unavailableTitle: "Horário não disponível",
    partialError: (error: string): string => `${error}. Estás a ver as viagens já carregadas.`,
    emptyTitle: "Nenhuma viagem daqui para a frente",
    emptyFromNow:
      "A partir desta hora não há mais passagens. Experimenta desde o início do serviço, outro dia, ou tira o filtro da linha.",
    emptyWholeDay:
      "Neste dia não está programada nenhuma passagem: experimenta o dia anterior ou o seguinte, ou tira o filtro da linha.",
    loadMore: "Mostrar mais viagens",
    loadingMore: "A carregar…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${n(count, { one: "viagem", other: "viagens" })} das ${from} às ${to}` +
      (complete ? ", até ao fim do serviço" : "") +
      ". São os horários oficiais do dia de serviço, sem tempo real.",
  },

  map: {
    fallbackAria: "Mapa",
    vehiclesHeading: "Veículos no mapa",
    show: "Mostrar",
    hide: "Esconder",
    modeGroup: "Que veículos mostrar",
    modeApproaching: "A chegar aqui",
    modeAllLines: "Todas as linhas",
    loadingStop: "A carregar a posição da paragem…",
    stopMapAria: (stopName: string): string => `Mapa dos veículos na paragem ${stopName}`,
    centreOnStop: "Centrar na paragem",
    nearbyVehicles: "Veículos aqui perto",
    allVehicles: "Todos, mesmo os distantes",
    loadingVehicles: "A carregar os veículos…",
    noneApproaching: "Nenhum veículo a aproximar-se",
    approachingCount: (count: number): string =>
      n(count, { one: "veículo a chegar", other: "veículos a chegar" }),
    onTheseLines: (count: number): string =>
      `${n(count, { one: "veículo", other: "veículos" })} nas linhas desta paragem`,
    positionsAt: (clock: string): string => `posições das ${clock}`,
    positionsStale: "posições não atualizadas",
    allLinesNote:
      "Os veículos cheios vão para esta paragem, os esbatidos circulam nas mesmas linhas mas agora não passam por aqui.",
    approachingList: "Veículos a chegar",
    hereIn: (relative: string): string => `Aqui ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Aqui ${relative}, às ${clock}`,
    notInbound: "A circular nesta linha, não vai para esta paragem",
    noBearing: " · direção não transmitida",
    follow: "Estou neste veículo, segue-o",
    unfollow: "Deixar de seguir",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Linha ${line}, aqui ${relative}${followed ? ", estás a segui-lo" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Linha ${line}, a circular, não vai para esta paragem${followed ? ", estás a segui-lo" : ""}`,
    yourPosition: "A tua posição",
    vehicleTitle: (vehicleId: string): string => `Veículo ${vehicleId}`,
    showOnMap: (stopName: string): string => `Mostrar ${stopName} no mapa`,
    divertedSuffix: " · fora do percurso",
    divertedBadge: "Fora do percurso",
    divertedNote: "Está a seguir um trajeto diferente do previsto.",
  },

  follow: {
    headlineLive: "Estou a seguir este veículo",
    headlinePaused: "Seguimento em pausa",
    headlineStale: "Posição parada",
    headlineLost: "Veículo já não está em linha",
    detailLive: "O mapa fica centrado nele a cada atualização.",
    detailPaused:
      "Moveste o mapa, por isso já não o movo eu. Toca em Retomar para voltar ao veículo.",
    detailStaleUnknown: "O veículo não transmite a posição há algum tempo.",
    detailStale: (age: string): string =>
      `O veículo não transmite há ${age}: o que está no mapa é o último ponto conhecido.`,
    detailLost:
      "Já não recebo a posição dele. Pode ter terminado a viagem ou saído de serviço.",
    ageMinutes: (minutes: number): string => n(minutes, { one: "minuto", other: "minutos" }),
    ageHours: (hours: number): string => (hours === 1 ? "uma hora" : `${hours} horas`),
    compact: "A seguir",
    compactSr: (line: string): string => ` a linha ${line}`,
    lineSr: (line: string): string => `, linha ${line}`,
    resume: "Retomar",
    exit: "Sair",
    close: "Fechar",
    lostHint: "Se ainda andar por aí, encontra-lo passando a «Todas as linhas».",
  },

  nearby: {
    title: "Paragens próximas",
    mapAria: "Mapa das paragens próximas",
    searchHere: "Procurar nesta zona",
    radius: "Raio",
    locating: "A localizar…",
    myPosition: "A minha posição",
    geoDenied:
      "Permissão de localização recusada. Mostramos o centro de Roma: move o mapa e procura nessa zona.",
    geoUnavailable:
      "Posição não disponível neste momento. Mostramos o centro de Roma: move o mapa e procura nessa zona.",
    geoTimeout:
      "A localização demorou demasiado. Mostramos o centro de Roma: move o mapa e tenta outra vez.",
    geoUnsupported:
      "Este navegador não suporta a geolocalização. Move o mapa para procurar as paragens.",
    outsideRome: "Estás fora da área de Roma: mostramos o centro da cidade.",
    outsideCoverage: "Esta zona está fora da área coberta. Move o mapa para Roma.",
    focusStopMissing: "Paragem pedida não encontrada: mostramos a tua zona.",
    focusStopFailed: (error: string): string => `Paragem pedida não carregada (${error}).`,
    stopsFailed: (error: string): string => `Paragens não carregadas: ${error}`,
    loadingStops: "À procura das paragens…",
    noStopsInRadius: (radius: string): string =>
      `Nenhuma paragem dentro de ${radius}. Experimenta alargar o raio ou mover o mapa.`,
    onMapCap: (max: number): string => ` (as primeiras ${max} no mapa)`,
    noLines: "Nenhuma linha",
    arrivalsLink: "Chegadas",
    showMoreStops: "Mostrar mais paragens",
  },

  line: {
    loading: "A carregar a linha…",
    loadFailed: (error: string): string => `Linha não carregada: ${error}`,
    mapAria: (name: string): string => `Mapa da linha ${name}`,
    dataAt: (clock: string): string => `dados das ${clock}`,
    updatedAt: (clock: string): string => `atualizado às ${clock}`,
    vehiclesStale: (error: string): string => `Veículos não atualizados: ${error}`,
    noPathForDirection: "Percurso não disponível para esta direção",
    stopsHeading: (count: number): string => `Paragens (${count})`,
    noStopsForDirection: "Nenhuma paragem disponível para esta direção.",
    showAllStops: "Mostrar todas as paragens",
  },

  lineService: {
    inService: (count: number): string =>
      `${n(count, { one: "veículo", other: "veículos" })} em linha`,
    loadingVehicles: "A carregar os veículos…",
    checkingTimetable: "A verificar os horários…",
    feedDownTitle: "Posições em tempo real não disponíveis",
    feedDownDetail:
      "O serviço pode estar normal: não conseguimos ler a posição dos veículos.",
    noneReporting: "Nenhum veículo comunica a posição",
    unknownDetail:
      "Não quer dizer que a linha não esteja em serviço: os horários programados estão na página de uma paragem.",
    scheduledDetail: (count: number): string =>
      `O serviço está programado: ${n(count, { one: "viagem prevista", other: "viagens previstas" })} daqui até ao fim do dia.`,
    finishedTitle: "Serviço terminado por hoje",
    finishedDetail: (count: number, clock: string): string =>
      `Hoje ${n(count, { one: "viagem programada", other: "viagens programadas" })}, a última às ${clock}.`,
    noneTodayTitle: "Nenhuma viagem programada hoje",
    noneTodayDetail: "Nesta linha não há viagens no horário para o dia de hoje.",
    noneTodayFrom: (stopName: string): string =>
      `De ${stopName} não há viagens no horário para o dia de hoje.`,
    nextDepartures: "Próximas partidas",
    nextDeparturesFrom: (stopName: string): string => ` de ${stopName}`,
    scheduledOnly: "Horários programados, sem tempo real.",
  },

  journey: {
    title: "Percurso",
    subtitle: "De um ponto ao outro de Roma de autocarro, elétrico e metro.",
    from: "Partida",
    to: "Chegada",
    placeholder: "Paragem, morada ou local",
    swap: "Inverter",
    whenLegend: "Quando",
    now: "Agora",
    pickTime: "Escolher a hora",
    timeLabel: "Data e hora de partida",
    submit: "Procurar o percurso",
    resultsHeading: "Itinerários",
    emptyTitle: "Onde queres ir?",
    emptyHint:
      "Escreve uma partida e uma chegada: procuramos o melhor percurso nos horários oficiais.",
    searching: "À procura dos itinerários…",
    noResultsTitle: "Nenhum itinerário",
    noResultsHint:
      "Só procuramos ligações diretas ou com um transbordo. Experimenta mudar a partida ou a hora.",
    disclaimer:
      "Horários programados, não em tempo real: os atrasos efetivos não são considerados. Os troços a pé são estimados em linha reta, por isso a distância real na rua é maior.",
    searchedFrom: (when: string): string => ` Pesquisa a partir das ${when}.`,
    mapAria: "Mapa do itinerário selecionado",
    mapCaption:
      "Os troços em veículo seguem o percurso real da linha. Os tracejados são estimados em linha reta: os transbordos a pé e as raras linhas sem traçado.",
    missingEndpoints: "Indica tanto a partida como a chegada.",
    badDateTime: "Data e hora inválidas.",
    geoUnsupported: "Este navegador não suporta a geolocalização.",
    geoUnavailable: "Posição não disponível neste momento.",
    geoOutsideRome: "Estás fora da área de Roma: escreve uma morada.",
    geoDenied: "Permissão de localização recusada: escreve uma morada.",
    geoTimeout: "A localização demorou demasiado.",
    originMarker: (name: string): string => `Partida: ${name}`,
    destinationMarker: (name: string): string => `Chegada: ${name}`,
    useMyPosition: "Usar a minha posição",
    clearField: (label: string): string => `Esvaziar ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Sugestões para ${label.toLowerCase()}`,
    placeStop: "Paragem",
    placeCoord: "Coordenadas",
    placeAddress: "Morada",
    walkOnly: "Só a pé",
    walkOnlyShort: "a pé",
    noTransfers: "sem transbordos",
    transfers: (count: number): string =>
      n(count, { one: "transbordo", other: "transbordos" }),
    walkDistance: (distance: string): string => `${distance} a pé`,
    walkLeg: (distance: string, duration: string): string =>
      `A pé ${distance}, cerca de ${duration} até `,
    inService: "em serviço",
    stopCount: (count: number): string => n(count, { one: "paragem", other: "paragens" }),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Itinerário ${index}: partida ${departure}, chegada ${arrival}`,
    lineDetailsAria: (line: string): string => `Linha ${line}, detalhes`,
    hours: (hours: number): string => `${hours} h`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} h ${minutes}`,
    /** journey.ts runs on the server and has no locale: it sends a slug. */
    noticeNoOriginStops:
      "Nenhuma paragem a pé do ponto de partida: tenta uma morada mais perto de uma linha.",
    noticeNoDestinationStops:
      "Nenhuma paragem a pé do ponto de chegada: tenta uma morada mais perto de uma linha.",
    noticeNoConnection: "Nenhuma ligação entre estas duas zonas nas próximas horas.",
    noticeWalkOnlyLeft:
      "Nenhuma ligação com horário nas próximas horas: só resta o percurso a pé.",
    noticeLaterDepartures:
      "Nada previsto na próxima hora e meia: mostramos as primeiras viagens a seguir.",
  },

  alerts: {
    title: "Avisos de serviço",
    subtitle: "Desvios, suspensões e alterações publicados no feed oficial.",
    loading: "A carregar…",
    degraded:
      "O feed em tempo real não responde ou está velho: estes avisos podem não estar atualizados.",
    loadFailed: "Não foi possível carregar os avisos.",
    refreshFailed: (error: string): string =>
      `A última atualização falhou (${error}): estás a ver a lista anterior.`,
    searchPlaceholder: "Procura: greve, desvio, rua…",
    searchAria: "Procurar entre os avisos",
    filterByLine: "Filtrar por linha",
    allLines: (count: number): string => `Todas as linhas (${count})`,
    networkWide: "Avisos gerais",
    clearFilters: "Limpar",
    noMatch: "Nenhum aviso corresponde aos filtros.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${pick(shown, { one: "aviso", other: "avisos" })} de ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${pick(count, { one: "aviso ativo", other: "avisos ativos" })} em ${lines} linhas.`,
    goToLine: "Ir para a linha",
    noneTitle: "Nenhum aviso ativo",
    noneHint:
      "Neste momento o feed não assinala interrupções nem alterações ao serviço. Verifica outra vez antes de sair.",
    noResultsTitle: "Nenhum resultado",
    noResultsHint:
      "Experimenta com menos palavras, ou limpa os filtros para rever todos os avisos.",
    noSelectionTitle: "Nenhum aviso selecionado",
    noSelectionHint: "Escolhe um aviso na lista à esquerda para o ler por inteiro.",
    showMoreLines: (count: number): string => `Mostrar mais linhas (${count})`,
    goToLineShort: "ir para a linha",
    fallbackHeader: "Aviso de serviço",
    noDetail: "Nenhum detalhe publicado pelo operador.",
    operatorLink: "Detalhes no site do operador",
    affectedLines: "Linhas afetadas",
    alsoOn: "Também em",
    contextHeading: (count: number): string =>
      `${count} ${pick(count, { one: "aviso ativo", other: "avisos ativos" })}`,
    contextAria: "Avisos de serviço",
    contextAll: "Todos",
    contextUnavailable: (error: string): string => `Avisos não disponíveis: ${error}`,
    contextMore: (count: number): string => `Mais ${count} avisos na `,
    contextMoreLink: "página dos avisos",
    contextStale: (error: string): string =>
      `A última atualização falhou (${error}): estes avisos podem não estar atuais.`,
    windowBetween: (from: string, until: string): string => `De ${from} a ${until}`,
    windowFrom: (from: string): string => `A partir de ${from}, sem prazo indicado`,
    windowUntil: (until: string): string => `Até ${until}`,
    windowUnknown: "Período de validade não indicado",
    effect: (code: string): string | null => EFFECT_PT[code] ?? null,
    cause: (code: string): string | null => CAUSE_PT[code] ?? null,
  },

  settings: {
    title: "Definições",
    subtitle: "Fica tudo neste dispositivo. Nenhuma conta, nenhum servidor.",
    sectionArrivals: "Chegadas",
    autoRefresh: "Atualização automática",
    everySeconds: (seconds: number): string => `a cada ${seconds} segundos`,
    autoRefreshHint: "Intervalo entre duas leituras do feed em tempo real.",
    maxArrivals: "Chegadas mostradas por paragem",
    showScheduled: "Mostrar os horários programados",
    showScheduledHint:
      "Quando o tempo real não tem nada para uma paragem, usar o horário.",
    sectionNearby: "Perto de mim",
    radius: "Raio de pesquisa",
    radiusHint: "Vale também para os raios rápidos no mapa das paragens próximas.",
    sectionAppearance: "Aspeto",
    themeLegend: "Tema",
    themeSystem: "Sistema",
    themeLight: "Claro",
    themeDark: "Escuro",
    sectionLanguage: "Idioma",
    languageLegend: "Idioma da interface",
    languageSystem: "Sistema",
    languageHint: (resolved: string): string =>
      `Com «Sistema» seguimos o idioma do navegador: agora é ${resolved}.`,
    sectionBackup: "Cópia dos favoritos",
    backupIntro:
      "Um ficheiro JSON no teu dispositivo: é a forma de levar os favoritos para outro navegador, já que aqui não há nenhuma conta.",
    exportCount: (count: number): string => `Exportar (${count})`,
    importFromFile: "Importar de ficheiro",
    exported: (count: number): string => `Exportados ${count} favoritos.`,
    exportFailed: "A exportação falhou neste navegador.",
    fileTooLarge: "O ficheiro é demasiado grande para ser uma cópia dos favoritos.",
    fileUnreadable: "Não foi possível ler o ficheiro.",
    importEmpty: "O ficheiro está vazio.",
    importNotJson: "O ficheiro não é um JSON válido.",
    importNoList: "O ficheiro não contém uma lista de favoritos.",
    importNoneValid: "Nenhum favorito válido encontrado no ficheiro.",
    importFound: (count: number): string => `Encontrados ${count} favoritos válidos`,
    importSkipped: (count: number): string => `, ${count} entradas descartadas.`,
    importFoundEnd: ".",
    importMerge: "Juntar",
    importReplace: "Substituir",
    replaced: (count: number): string => `Favoritos substituídos: agora são ${count}.`,
    mergedNone: "Nenhum favorito novo para acrescentar.",
    merged: (count: number): string => `Acrescentados ${count} favoritos.`,
    sectionLocalData: "Dados locais",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} favoritos, ${recents} paragens no histórico.`,
    confirmClearFavorites: "Apagar todos os favoritos? A operação não é reversível.",
    confirmClearFavoritesYes: "Sim, esvaziar",
    clearFavorites: "Esvaziar favoritos",
    favoritesCleared: "Favoritos esvaziados.",
    confirmClearRecents: "Apagar o histórico das paragens vistas?",
    confirmClearRecentsYes: "Sim, apagar",
    clearRecents: "Apagar histórico",
    recentsCleared: "Histórico apagado.",
    resetDefaults: "Repor as definições predefinidas",
    settingsReset: "Definições repostas nos valores predefinidos.",
    infoLink: "Informações, fontes dos dados e perguntas frequentes",
  },

  sync: {
    titleFull: "Sincronizar dispositivos",
    titleCollapsed: "Sincronização",
    badgeOn: "ativa",
    summaryLoading: "…",
    summaryUnavailable: "Não disponível nesta ligação",
    summaryOff: "Não ativa",
    summarySyncing: "Sincronização em curso…",
    summaryError: "Erro de sincronização",
    summaryConflict: "Conflito por resolver",
    summaryOn: (last: string): string => `Ativa · última ${last}`,
    intro:
      "Leva favoritos, recentes e definições para outro dispositivo com um código. Os dados são cifrados aqui: o servidor guarda só dados ilegíveis.",
    enable: "Ativar sincronização",
    haveCode: "Já tenho um código",
    codeLabel: "Código de sincronização",
    codeHint:
      "20 caracteres, tal como os lês no outro dispositivo. Maiúsculas, hífenes e espaços não contam.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} caracteres`,
    join: "Ligar",
    onIntro:
      "Os dados são cifrados neste dispositivo antes de saírem. Quem tiver o código pode ler todos os teus favoritos: usa-o só em dispositivos teus.",
    code: "Código",
    showCode: "Mostrar código",
    hideCode: "Esconder código",
    copyCode: "Copiar código",
    copied: "Copiado",
    lastSync: "Última sincronização:",
    inProgress: " · em curso…",
    syncNow: "Sincronizar agora",
    disconnect: "Desligar",
    disconnectNote:
      "Ao desligar, os dados ficam neste dispositivo e a cópia cifrada fica no servidor até a apagares.",
    deleteWarning:
      "Apaga a cópia cifrada do servidor. Os outros dispositivos deixam de encontrar o que sincronizar. Não se pode anular.",
    deleteConfirm: "Apagar mesmo",
    deleteRemote: "Apagar os dados do servidor",
    justNow: "agora",
    minutesAgo: (minutes: number): string => `há ${minutes} min`,
    atClock: (clock: string): string => `às ${clock}`,
    errors: {
      aborted: "Operação cancelada.",
      generic: "A sincronização falhou. Tenta outra vez daqui a pouco.",
      insecureContext:
        "A sincronização precisa de uma ligação segura: abre o site em https (ou em localhost). Em http simples os browsers desligam a cifra, por isso nada pode ser cifrado neste dispositivo.",
      noBase64Encode: "Este browser não consegue codificar os dados de sincronização.",
      noBase64Decode: "Este browser não consegue descodificar os dados de sincronização.",
      invalidSyncData: (what: string): string =>
        `Dados de sincronização inválidos (${what}).`,
      codeRequired: "Escreve o código de sincronização.",
      codeTooLong: (max: number): string =>
        `Esse código é comprido demais: devia ter ${n(max, { one: "caractere", other: "caracteres" })}.`,
      codeInvalidChars: (chars: string): string =>
        `O código tem caracteres que não são permitidos: ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `O código tem ${n(required, { one: "caractere", other: "caracteres" })}, escreveste ${actual}.`,
      keyDerivationFailed: "Este browser não consegue derivar as chaves de sincronização.",
      preparePayloadFailed: "Não foi possível preparar os dados para sincronizar.",
      encryptFailed: "Não foi possível cifrar os dados neste dispositivo.",
      decryptFailed:
        "O código não corresponde a estes dados, ou os dados no servidor estão danificados.",
      invalidSyncId: "Identificador de sincronização inválido.",
      responseTooLarge: "O servidor devolveu dados a mais.",
      timeout: "O servidor não respondeu a tempo.",
      unreachable: "Não se chega ao servidor. Verifica a ligação.",
      invalidResponse: "Resposta do servidor inválida.",
      invalidResponseField: (what: string): string =>
        `Resposta do servidor inválida (${what}).`,
      unexpectedFormat: "O servidor respondeu num formato inesperado.",
      rateLimited: "Demasiadas sincronizações seguidas. Tenta outra vez daqui a um minuto.",
      pullRejected: (status: number): string =>
        `O servidor recusou a leitura (erro ${status}).`,
      payloadTooLarge: "Há dados a mais para sincronizar.",
      pushRejected: (status: number): string =>
        `O servidor recusou gravar (erro ${status}).`,
      deleteRejected: (status: number): string =>
        `O servidor recusou apagar (erro ${status}).`,
      conflict:
        "Outro dispositivo está a escrever nestes mesmos dados neste momento. Os teus dados locais estão seguros: tenta outra vez daqui a uns segundos.",
    },
    status: {
      deleted: "Dados removidos do servidor. Este dispositivo já não sincroniza.",
      disconnected:
        "A sincronização está desligada neste dispositivo. Os teus dados ficam aqui e a cópia cifrada fica no servidor até a apagares.",
    },
  },

  info: {
    title: "Informações",
    subtitle:
      "Horários e chegadas dos transportes públicos de Roma, a partir dos dados abertos oficiais.",
    unofficialTitle: "Aplicação não oficial",
    unofficialBody:
      "Este site não está afiliado, associado, autorizado nem apoiado de forma alguma pela ATAC S.p.A., pela Roma Servizi per la Mobilità ou pela Roma Capitale. É um projeto independente que se limita a ler os dados abertos que estas entidades publicam. Para informações oficiais, bilhetes e reclamações, dirige-te aos canais delas.",
    whatTitle: "O que é",
    whatBody1:
      "Uma aplicação web para saber daqui a quanto passa o próximo veículo na paragem onde estás. Procuras uma paragem ou uma linha, guarda-la nos favoritos e voltas a encontrá-la no início com as chegadas atualizadas. Sem conta, sem publicidade, sem estatísticas de utilização.",
    whatBody2:
      "Quando o feed em tempo real cobre a viagem, a hora mostrada é uma previsão baseada na posição do veículo. Caso contrário a aplicação recorre ao horário programado e diz-to sempre, em vez de fazer passar por previsão um dado velho.",
    dataTitle: "De onde vêm os dados",
    dataBodyBefore:
      "Horários, paragens, linhas, percursos, posições dos veículos e avisos de serviço vêm dos dados abertos da ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (feeds GTFS e GTFS-Realtime). Os horários programados são atualizados todos os dias, o tempo real cerca de cada 30 segundos.",
    dataLink: "romamobilita.it — Dados abertos",
    dataLicence:
      "Os dados continuam a ser propriedade dos respetivos titulares e são usados nas condições da licença com que são publicados.",
    privacyTitle: "Privacidade",
    privacyBody:
      "Não há início de sessão nem perfil de utilizador. Favoritos, paragens vistas há pouco e definições são guardados só no teu navegador e não são enviados para lado nenhum. A posição, se a concederes para a procura das paragens próximas, fica no dispositivo: serve para calcular as distâncias e não é armazenada.",
    faqTitle: "Perguntas frequentes",
    faq1Q: "Porque é que uma linha ou um autocarro não aparece?",
    faq1A:
      "Mostramos só o que está nos feeds oficiais. Se um veículo não transmite a posição, ou se a viagem dele não está no feed em tempo real, para nós não existe: no máximo vais ver o horário programado. Acontece muitas vezes com as viagens substitutivas, os autocarros de ligação e os veículos com o localizador avariado.",
    faq2Q: "Porque é que os horários são diferentes dos escritos na paragem?",
    faq2A:
      'O painel no poste indica o horário programado, que muda poucas vezes por ano. Aqui, quando o veículo transmite, vês a previsão calculada sobre a posição real dele, que tem em conta o trânsito e os atrasos. Já quando lês "previsto", não há previsão e estamos a mostrar o mesmo horário do painel.',
    faq3Q: "O que acontece de noite?",
    faq3A:
      "De noite o feed em tempo real está quase vazio, porque circulam poucos veículos. A aplicação continua a funcionar com os horários programados das linhas noturnas. No GTFS o dia de serviço não acaba à meia-noite mas às 04:00: uma viagem da uma da manhã pertence ainda ao dia anterior, e é por isso que podes ver horas como 25:30 traduzidas para 01:30.",
    faq4Q: "Os meus favoritos vão parar a um servidor?",
    faq4A:
      "Não. Favoritos, histórico e definições estão no localStorage do navegador. Se limpares os dados do site ou mudares de dispositivo, desaparecem: nas definições podes exportá-los para um ficheiro JSON e voltar a importá-los noutro lado.",
    settingsLink: "Ir para as definições",
  },

  footer: {
    dataPrefix: "Dados de serviço e horários: ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (dados abertos GTFS).",
    independent:
      "Projeto independente, não afiliado à ATAC nem à Roma Servizi per la Mobilità. ",
    infoLink: "Informações",
  },

  errors: {
    genericTitle: "Alguma coisa não funcionou",
    unexpected: "Erro inesperado",
    unexpectedDot: "Erro inesperado.",
    stopNotFound: "Paragem não encontrada",
    serviceDown: "O serviço não responde",
    requestFailed: (status: number): string => `O pedido falhou (${status})`,
    httpStatus: (status: number): string => `Erro ${status}`,
    badResponse: "Resposta do servidor inválida",
    badResponseDot: "Resposta do servidor inválida.",
    timedOut: "Pedido expirado",
    timedOutDot: "Pedido expirado.",
    offline: "Sem ligação",
    connectionFailed: "A ligação falhou.",
    tooManyRequests: "Demasiados pedidos",
    badRequest: "Parâmetros inválidos",
    lineNotFound: "Linha não encontrada",
    journeyOriginNotFound: "Partida não encontrada",
    journeyDestinationNotFound: "Chegada não encontrada",
    journeyPlaceHint: "Tenta com uma morada mais precisa.",
  },

  notFound: {
    kicker: "Erro 404",
    title: "Paragem não servida",
    body:
      "Esta página não existe. Pode acontecer com uma ligação antiga, ou com o código de uma paragem ou de uma linha que já não está no feed.",
    searchCta: "Procurar uma paragem",
    nearbyCta: "Paragens próximas",
  },

  appError: {
    title: "Viagem interrompida",
    body:
      "Este ecrã não conseguiu carregar. Tenta outra vez: se o problema continuar, provavelmente é o serviço de dados que não responde.",
    digest: (digest: string): string => `Código: ${digest}`,
    backHome: "Voltar ao início",
    globalTitle: "Serviço suspenso",
    globalBody:
      "A aplicação parou por um erro inesperado. Recarrega a página: os teus favoritos continuam guardados no telemóvel e não se perdem.",
    reload: "Recarregar",
  },

  format: {
    due: "a chegar",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "data não disponível",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "atualização desconhecida",
    ageSeconds: (seconds: number): string => `atualizado há ${seconds} s`,
    ageMinutes: (minutes: number): string => `atualizado há ${minutes} min`,
    ageAt: (clock: string): string => `atualizado às ${clock}`,
    onTime: "à tabela",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — partidas em tempo real",
    appDescription:
      "Horários e passagens em tempo real de autocarros, elétricos e metro em Roma. Favoritos, paragens próximas e avisos de serviço, sem conta e sem publicidade.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "As paragens da ATAC mais próximas de ti, com mapa e as linhas que por lá passam.",
    journeyDescription:
      "Calcula como ir de um ponto ao outro de Roma de autocarro, elétrico e metro, com os horários oficiais da ATAC.",
    alertsDescription:
      "Desvios, suspensões e alterações de serviço publicados no feed oficial.",
    settingsDescription:
      "Atualização das chegadas, raio de procura, tema e gestão dos favoritos.",
    infoDescription:
      "O que é esta app, de onde vêm os dados e porque não é afiliada à ATAC nem à Roma Servizi per la Mobilità.",
    stopDescription: "Próximas passagens em tempo real e horário programado da paragem.",
    lineDescription: "Percurso, paragens e veículos em tempo real da linha.",
  },

  skeleton: {
    loading: "A carregar",
  },
};

const EFFECT_PT: Record<string, string | undefined> = {
  NO_SERVICE: "Serviço suspenso",
  REDUCED_SERVICE: "Serviço reduzido",
  SIGNIFICANT_DELAYS: "Atrasos significativos",
  DETOUR: "Desvio",
  ADDITIONAL_SERVICE: "Serviço adicional",
  MODIFIED_SERVICE: "Serviço alterado",
  STOP_MOVED: "Paragem deslocada",
  NO_EFFECT: "Nenhum efeito no serviço",
  ACCESSIBILITY_ISSUE: "Problema de acessibilidade",
  OTHER_EFFECT: "Outro",
  UNKNOWN_EFFECT: "Efeito não especificado",
};

const CAUSE_PT: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Avaria técnica",
  STRIKE: "Greve",
  DEMONSTRATION: "Manifestação",
  ACCIDENT: "Acidente",
  HOLIDAY: "Feriado",
  WEATHER: "Mau tempo",
  MAINTENANCE: "Manutenção",
  CONSTRUCTION: "Obras",
  POLICE_ACTIVITY: "Intervenção policial",
  MEDICAL_EMERGENCY: "Emergência médica",
  OTHER_CAUSE: "Outra causa",
  UNKNOWN_CAUSE: "Causa não especificada",
};
