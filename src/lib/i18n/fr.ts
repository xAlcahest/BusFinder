/**
 * French dictionary. Shape and key order follow it.ts, the source of truth.
 * French counts 0 as singular, so the plurals go through CLDR rather than the
 * one-vs-rest helper.
 */

import type { Dictionary } from "./it";
import { pluralRules } from "./plural";

const { pick, count: n } = pluralRules("fr");

export const fr: Dictionary = {
  brand: {
    name: "BusFinder",
    homeAria: "BusFinder, accueil",
  },

  a11y: {
    skipToContent: "Aller au contenu",
  },

  common: {
    retry: "Réessayer",
    cancel: "Annuler",
    save: "Enregistrer",
    close: "Fermer",
    home: "Accueil",
    back: "Retour",
    all: "Toutes",
    loading: "Chargement…",
    searching: "Recherche…",
    refresh: "Actualiser",
    dash: "—",
    minutesShort: "min",
    clearSearch: "Effacer la recherche",
    searchInProgress: "Recherche en cours",
  },

  nav: {
    primary: "Navigation principale",
    sidebar: "Barre latérale",
    sidebarNav: "Navigation latérale",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    sections: "Sections",
    shortcuts: "Raccourcis",
    infoAria: "Informations sur l'application",
    home: "Accueil",
    nearbyShort: "À proximité",
    nearby: "Arrêts à proximité",
    journey: "Itinéraire",
    alerts: "Alertes",
    settings: "Réglages",
    info: "Infos",
    hintNearby: "Ce qui passe dans le coin",
    hintJourney: "D'un point à un autre",
    hintAlerts: "Déviations et interruptions",
    hintSettings: "Actualisation, thème, données",
    hintInfo: "Sources et mentions légales",
  },

  lines: {
    typeLower: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "tramway";
        case 1:
          return "métro";
        case 2:
          return "train";
        case 4:
          return "bateau";
        default:
          return "bus";
      }
    },
    typeShort: (routeType: number): string => {
      switch (routeType) {
        case 0:
          return "Tram";
        case 1:
          return "Métro";
        case 2:
          return "Train";
        case 3:
          return "Bus";
        default:
          return "Ligne";
      }
    },
    named: (name: string): string => `Ligne ${name}`,
    namedAria: (name: string): string => `Ligne ${name}`,
    details: "détails",
    towards: (headsign: string): string => `vers ${headsign}`,
    towardsCapital: (headsign: string): string => `Vers ${headsign}`,
    direction: "Direction",
    terminus: "terminus",
    noHeadsign: "Destination non indiquée",
  },

  stops: {
    code: (code: string): string => `Arrêt ${code}`,
    codeOnly: "Arrêt",
    pole: (code: string): string => `Poteau ${code}`,
    accessible: "Arrêt accessible",
    named: (name: string): string => `Arrêt ${name}`,
    countLabel: (count: number): string => n(count, { one: "arrêt", other: "arrêts" }),
    involved: (count: number): string =>
      n(count, { one: "arrêt concerné", other: "arrêts concernés" }),
  },

  home: {
    kicker: "Rome · transports publics",
    title: "C'est quand le prochain ?",
    intro:
      "Cherchez un arrêt par son numéro ou son nom, ou bien une ligne. Les passages viennent du flux temps réel de Rome.",
  },

  search: {
    inputAria: "Chercher un arrêt ou une ligne",
    placeholder: "Arrêt, rue ou ligne",
    searchingFor: (query: string): string => `Recherche de « ${query} »…`,
    noResultsFor: (query: string): string => `Aucun résultat pour « ${query} »`,
    noResultsHint:
      "Essayez avec le numéro de l'arrêt (par exemple 70101), le nom de la rue ou le numéro de la ligne.",
    resultsList: "Résultats de la recherche",
    keyboardHint: "↑ ↓ pour parcourir, Entrée pour ouvrir, Échap pour fermer",
  },

  favorites: {
    heading: "Favoris",
    emptyTitle: "Aucun favori pour l'instant",
    emptyHint:
      "Touchez l'étoile ★ à côté d'un arrêt ou d'une ligne : dans la recherche, dans Arrêts à proximité, sur la page de l'arrêt ou sur celle de la ligne. Vous la retrouverez ici, sans la chercher à chaque fois.",
    reorder: "Réorganiser",
    reorderDone: "Terminé",
    reorderHint: "Déplacez les arrêts avec les flèches. L'ordre vaut sur cet appareil.",
    movedTo: (name: string, position: number, total: number): string =>
      `${name} : position ${position} sur ${total}.`,
    moveUp: (name: string): string => `Monter ${name}`,
    moveDown: (name: string): string => `Descendre ${name}`,
    addStar: (name: string): string => `Mettre l'étoile à l'arrêt ${name}`,
    removeStar: (name: string): string => `Enlever l'étoile de l'arrêt ${name}`,
    addStarLine: (name: string): string => `Mettre l'étoile à la ligne ${name}`,
    removeStarLine: (name: string): string => `Enlever l'étoile de la ligne ${name}`,
    starredTitle: "Avec l'étoile : c'est dans les favoris",
    starTitle: "Mettre l'étoile",
    starredLabel: "Avec étoile",
    starLabel: "Étoile",
    editLabels: (name: string): string => `Modifier le libellé et les lignes de ${name}`,
    onlyLines: (labels: string): string => `seulement ${labels}`,
    notUpdated: "non actualisé",
    noArrivalsOnPinned: "Aucun passage sur les lignes choisies.",
    changeLines: "Changer de lignes",
    noArrivalsSoon: "Aucun passage dans les prochaines minutes.",
    openForTimes: "Ouvrir pour les horaires",
    vehiclesUnavailable: "Véhicules non disponibles",
    lookingForVehicles: "Recherche des véhicules en service…",
    noVehiclesNow: "Aucun véhicule en service en ce moment",
    vehiclesInService: (count: number): string =>
      `${n(count, { one: "véhicule", other: "véhicules" })} en service en ce moment`,
    refreshArrivals: "Actualiser les arrivées",
    undoRemovedStop: "Arrêt sans étoile : il n'est plus dans les favoris.",
    undoRemovedLine: "Ligne sans étoile : elle n'est plus dans les favoris.",
    undoDismiss: "Fermer l'avis",
    more: (count: number): string => `${count} autres favoris`,
    sidebarEmptyBefore:
      "Touchez l'étoile à côté d'un arrêt ou d'une ligne, dans la recherche, dans ",
    sidebarEmptyAfter: " ou sur la page que vous consultez. Vous la retrouverez ici.",
    nextDeparture: "prochain passage",
    noDeparture: "aucun passage disponible",
    notAvailableShort: "n/d",
  },

  recents: {
    heading: "Vus récemment",
    clear: "Vider",
    emptyTitle: "Aucun arrêt récent",
    emptyHint:
      "Les arrêts que vous ouvrez restent ici quelques jours, pour les retrouver sans les rechercher.",
    listAria: "Arrêts vus récemment",
    justNow: "à l'instant",
    today: "aujourd'hui",
    yesterday: "hier",
  },

  arrivals: {
    due: "à l'approche",
    live: "en temps réel",
    scheduled: "à l'horaire",
    scheduledTail: " prévu",
    scheduledSr: "horaire prévu",
    onTime: "à l'heure",
    lateBy: (minutes: number): string => `+${minutes} min`,
    earlyBy: (minutes: number): string => `−${minutes} min`,
    lateSuffix: "de retard",
    earlySuffix: "d'avance",
    lateSr: (minutes: number): string =>
      `${n(minutes, { one: "minute", other: "minutes" })} de retard`,
    earlySr: (minutes: number): string =>
      `${n(minutes, { one: "minute", other: "minutes" })} d'avance`,
    skipped: "supprimé",
    skippedSr: "course supprimée",
    atClock: (clock: string): string => `à ${clock}`,
    towardsSr: (headsign: string): string => `direction ${headsign}`,
    loadingAria: "Chargement des arrivées",
    emptyTitle: "Aucun passage prévu",
    emptyHint:
      "Aucune course à l'approche. Essayez l'horaire théorique ou réessayez dans un instant.",
    frozenUnknown: "prévision non actualisée",
    frozenFor: (minutes: number): string => `figée depuis ${minutes} min`,
    frozenPrefix: (state: string): string => `prévision ${state}`,
    frozenSr: (state: string): string => `prévision ${state}, non actualisée en temps réel`,
    expectedSr: (relative: string, clock: string): string => `prévue ${relative}, à ${clock}`,
    bannerNoRealtimeStrong: "Temps réel indisponible.",
    bannerNoRealtime:
      " Nous affichons les horaires théoriques : les véhicules peuvent passer en avance ou en retard.",
    bannerFrozenStrong: (minutes: number | null): string =>
      minutes === null ? "Temps réel figé." : `Temps réel figé depuis ${minutes} min.`,
    bannerFrozenBefore: " Les prévisions ci-dessous sont celles",
    bannerFrozenLastUpdate: " de la dernière actualisation",
    bannerFrozenAt: (clock: string): string => ` de ${clock}`,
    bannerFrozenAfter: " et elles ne se mettent plus à jour : à prendre avec prudence.",
    bannerPartialStrong: "Temps réel partiel.",
    bannerPartial: " Une partie des données n'est pas arrivée : certaines courses peuvent manquer.",
    showOnMap: (line: string): string => `Montrer sur la carte le véhicule de la ligne ${line}`,
    hideOnMap: (line: string): string => `Retirer la mise en évidence du véhicule de la ligne ${line}`,
  },

  dataAge: {
    prefix: "Actualisé",
    now: "maintenant",
    secondsAgo: (seconds: number): string => `il y a ${seconds} s`,
    minutesAgo: (minutes: number): string => `il y a ${minutes} min`,
    atClock: (clock: string): string => `à ${clock}`,
    never: "jamais",
  },

  refreshFeedback: {
    updated: "Actualisé",
    unchanged: "Vérifié, rien de nouveau",
    failed: "L'actualisation a échoué",
    updatedShort: "Actualisé",
    unchangedShort: "Rien de nouveau",
    failedShort: "Non actualisé",
    busy: "Actualisation…",
    busySpoken: "Actualisation en cours",
  },

  stop: {
    tabArrivals: "Arrivées",
    tabTimetable: "Horaires",
    tabsAria: "Vue de l'arrêt",
    editTag: "Modifier le libellé",
    addTag: "Libellé",
    map: "Carte",
    realtimePrefix: "Temps réel",
    noRealtime: "Aucune donnée en temps réel",
    pageNotUpdated: "Page pas encore actualisée",
    pageUpdatedAt: (clock: string): string => `Page actualisée à ${clock}`,
    lastDataSuffix: (error: string): string =>
      `${error}. Vous voyez la dernière donnée reçue.`,
    arrivalsUnavailable: "Arrivées non disponibles",
    emptyHint:
      "Aucune course à l'approche pour l'instant. Ouvrez les horaires pour savoir quand le prochain passage est prévu.",
    seeTimetable: "Voir les horaires",
    linesHere: "Lignes qui s'arrêtent ici",
  },

  tagDialog: {
    titleFavorite: "Favori",
    titleTag: "Libellé de l'arrêt",
    label: "Comment vous l'appelez",
    placeholder: "Maison, bureau, salle de sport…",
    hint: (maxChars: number): string =>
      `C'est juste pour vous : cela reste sur cet appareil, ${maxChars} caractères maximum.`,
    linesLegend: "Lignes à afficher",
    linesNone: "Aucun choix : la fiche affiche toutes les lignes.",
    linesSome: (count: number): string =>
      `${n(count, { one: "ligne", other: "lignes" })} seulement sur la fiche.`,
    showAllLines: "Afficher toutes les lignes",
    removeTag: "Supprimer le libellé",
  },

  timetable: {
    previousDay: "Jour précédent",
    nextDay: "Jour suivant",
    today: "aujourd'hui",
    scheduled: "horaire théorique",
    jumpToNow: "Aller à maintenant",
    backToToday: "Revenir à aujourd'hui",
    fromServiceStart: "Depuis le début du service",
    unavailableTitle: "Horaire non disponible",
    partialError: (error: string): string => `${error}. Vous voyez les courses déjà chargées.`,
    emptyTitle: "Aucune course à partir d'ici",
    emptyFromNow:
      "À partir de cette heure il n'y a plus de passages. Essayez depuis le début du service, un autre jour, ou retirez le filtre de ligne.",
    emptyWholeDay:
      "Ce jour-là aucun passage n'est prévu : essayez la veille ou le lendemain, ou retirez le filtre de ligne.",
    loadMore: "Afficher plus de courses",
    loadingMore: "Chargement…",
    summary: (count: number, from: string, to: string, complete: boolean): string =>
      `${n(count, { one: "course", other: "courses" })} de ${from} à ${to}` +
      (complete ? ", jusqu'à la fin du service" : "") +
      ". Ce sont les horaires officiels de la journée de service, sans temps réel.",
  },

  map: {
    fallbackAria: "Carte",
    vehiclesHeading: "Véhicules sur la carte",
    show: "Afficher",
    hide: "Masquer",
    modeGroup: "Quels véhicules afficher",
    modeApproaching: "En approche ici",
    modeAllLines: "Toutes les lignes",
    loadingStop: "Chargement de la position de l'arrêt…",
    stopMapAria: (stopName: string): string => `Carte des véhicules à l'arrêt ${stopName}`,
    centreOnStop: "Centrer sur l'arrêt",
    nearbyVehicles: "Véhicules à proximité",
    allVehicles: "Tous, même les lointains",
    loadingVehicles: "Chargement des véhicules…",
    noneApproaching: "Aucun véhicule en approche",
    approachingCount: (count: number): string =>
      n(count, { one: "véhicule en approche", other: "véhicules en approche" }),
    onTheseLines: (count: number): string =>
      `${n(count, { one: "véhicule", other: "véhicules" })} sur les lignes de cet arrêt`,
    positionsAt: (clock: string): string => `positions de ${clock}`,
    positionsStale: "positions non actualisées",
    allLinesNote:
      "Les véhicules pleins se dirigent vers cet arrêt, les estompés circulent sur les mêmes lignes mais ne passent pas ici pour l'instant.",
    approachingList: "Véhicules en approche",
    hereIn: (relative: string): string => `Ici ${relative}`,
    hereInAt: (relative: string, clock: string): string => `Ici ${relative}, à ${clock}`,
    notInbound: "En circulation sur cette ligne, ne se dirige pas vers cet arrêt",
    noBearing: " · direction non transmise",
    follow: "Je suis dans ce véhicule, suivez-le",
    unfollow: "Arrêter de suivre",
    vehicleTitleInbound: (line: string, relative: string, followed: boolean): string =>
      `Ligne ${line}, ici ${relative}${followed ? ", vous le suivez" : ""}`,
    vehicleTitleOnLine: (line: string, followed: boolean): string =>
      `Ligne ${line}, en circulation, ne se dirige pas vers cet arrêt${followed ? ", vous le suivez" : ""}`,
    yourPosition: "Votre position",
    vehicleTitle: (vehicleId: string): string => `Véhicule ${vehicleId}`,
    showOnMap: (stopName: string): string => `Afficher ${stopName} sur la carte`,
    divertedSuffix: " · hors itinéraire",
    divertedBadge: "Hors itinéraire",
    divertedNote: "Il suit un trajet différent de celui prévu.",
  },

  follow: {
    headlineLive: "Je suis ce véhicule",
    headlinePaused: "Suivi en pause",
    headlineStale: "Position figée",
    headlineLost: "Véhicule plus en ligne",
    detailLive: "La carte reste centrée sur lui à chaque actualisation.",
    detailPaused:
      "Vous avez déplacé la carte, donc je ne la bouge plus. Touchez Reprendre pour revenir sur le véhicule.",
    detailStaleUnknown: "Le véhicule ne transmet plus sa position depuis un moment.",
    detailStale: (age: string): string =>
      `Le véhicule ne transmet plus depuis ${age} : celui sur la carte est le dernier point connu.`,
    detailLost:
      "Je ne reçois plus sa position. Il a peut-être terminé sa course ou quitté le service.",
    ageMinutes: (minutes: number): string => n(minutes, { one: "minute", other: "minutes" }),
    ageHours: (hours: number): string => (hours === 1 ? "une heure" : `${hours} heures`),
    compact: "Suivi",
    compactSr: (line: string): string => ` de la ligne ${line}`,
    lineSr: (line: string): string => `, ligne ${line}`,
    resume: "Reprendre",
    exit: "Quitter",
    close: "Fermer",
    lostHint: "S'il circule encore, vous le trouverez en passant à « Toutes les lignes ».",
  },

  nearby: {
    title: "Arrêts à proximité",
    mapAria: "Carte des arrêts à proximité",
    searchHere: "Chercher dans cette zone",
    radius: "Rayon",
    locating: "Localisation…",
    myPosition: "Ma position",
    geoDenied:
      "Autorisation de localisation refusée. Nous affichons le centre de Rome : déplacez la carte et cherchez dans cette zone.",
    geoUnavailable:
      "Position indisponible pour le moment. Nous affichons le centre de Rome : déplacez la carte et cherchez dans cette zone.",
    geoTimeout:
      "La localisation a pris trop de temps. Nous affichons le centre de Rome : déplacez la carte et réessayez.",
    geoUnsupported:
      "Ce navigateur ne gère pas la géolocalisation. Déplacez la carte pour chercher les arrêts.",
    outsideRome: "Vous êtes hors de la zone de Rome : nous affichons le centre-ville.",
    outsideCoverage: "Cette zone est hors de la couverture. Déplacez la carte sur Rome.",
    focusStopMissing: "Arrêt demandé introuvable : nous affichons votre zone.",
    focusStopFailed: (error: string): string => `Arrêt demandé non chargé (${error}).`,
    stopsFailed: (error: string): string => `Arrêts non chargés : ${error}`,
    loadingStops: "Recherche des arrêts…",
    noStopsInRadius: (radius: string): string =>
      `Aucun arrêt à moins de ${radius}. Essayez d'élargir le rayon ou de déplacer la carte.`,
    onMapCap: (max: number): string => ` (les ${max} premiers sur la carte)`,
    noLines: "Aucune ligne",
    arrivalsLink: "Arrivées",
    showMoreStops: "Afficher plus d'arrêts",
  },

  line: {
    loading: "Chargement de la ligne…",
    loadFailed: (error: string): string => `Ligne non chargée : ${error}`,
    mapAria: (name: string): string => `Carte de la ligne ${name}`,
    dataAt: (clock: string): string => `données de ${clock}`,
    updatedAt: (clock: string): string => `actualisé à ${clock}`,
    vehiclesStale: (error: string): string => `Véhicules non actualisés : ${error}`,
    noPathForDirection: "Tracé non disponible pour cette direction",
    stopsHeading: (count: number): string => `Arrêts (${count})`,
    noStopsForDirection: "Aucun arrêt disponible pour cette direction.",
    showAllStops: "Afficher tous les arrêts",
  },

  lineService: {
    inService: (count: number): string =>
      `${n(count, { one: "véhicule", other: "véhicules" })} en ligne`,
    loadingVehicles: "Chargement des véhicules…",
    checkingTimetable: "Vérification des horaires…",
    feedDownTitle: "Positions en temps réel indisponibles",
    feedDownDetail:
      "Le service peut être normal : nous n'arrivons pas à lire la position des véhicules.",
    noneReporting: "Aucun véhicule ne transmet sa position",
    unknownDetail:
      "Cela ne veut pas dire que la ligne n'est pas en service : les horaires théoriques sont sur la page d'un arrêt.",
    scheduledDetail: (count: number): string =>
      `Le service est prévu : ${n(count, { one: "course prévue", other: "courses prévues" })} d'ici la fin de la journée.`,
    finishedTitle: "Service terminé pour aujourd'hui",
    finishedDetail: (count: number, clock: string): string =>
      `Aujourd'hui ${n(count, { one: "course prévue", other: "courses prévues" })}, la dernière à ${clock}.`,
    noneTodayTitle: "Aucune course prévue aujourd'hui",
    noneTodayDetail: "Sur cette ligne il n'y a pas de course à l'horaire pour aujourd'hui.",
    noneTodayFrom: (stopName: string): string =>
      `Depuis ${stopName} il n'y a pas de course à l'horaire pour aujourd'hui.`,
    nextDepartures: "Prochains départs",
    nextDeparturesFrom: (stopName: string): string => ` depuis ${stopName}`,
    scheduledOnly: "Horaires théoriques, sans temps réel.",
  },

  journey: {
    title: "Itinéraire",
    subtitle: "D'un point à un autre de Rome en bus, tram et métro.",
    from: "Départ",
    to: "Arrivée",
    placeholder: "Arrêt, adresse ou lieu",
    swap: "Inverser",
    whenLegend: "Quand",
    now: "Maintenant",
    pickTime: "Choisir l'heure",
    timeLabel: "Date et heure de départ",
    submit: "Chercher l'itinéraire",
    resultsHeading: "Itinéraires",
    emptyTitle: "Où voulez-vous aller ?",
    emptyHint:
      "Indiquez un départ et une arrivée : nous cherchons le meilleur itinéraire sur les horaires officiels.",
    searching: "Recherche des itinéraires…",
    noResultsTitle: "Aucun itinéraire",
    noResultsHint:
      "Nous ne cherchons que les liaisons directes ou avec une correspondance. Essayez de déplacer le départ ou l'heure.",
    disclaimer:
      "Horaires théoriques, pas en temps réel : les retards réels ne sont pas pris en compte. Les tronçons à pied sont estimés à vol d'oiseau, la distance réelle par la rue est donc plus grande.",
    searchedFrom: (when: string): string => ` Recherche à partir de ${when}.`,
    mapAria: "Carte de l'itinéraire sélectionné",
    mapCaption:
      "Les tronçons en véhicule suivent le tracé réel de la ligne. Les pointillés sont estimés à vol d'oiseau : les correspondances à pied et les rares lignes sans tracé.",
    missingEndpoints: "Indiquez le départ et l'arrivée.",
    badDateTime: "Date et heure non valides.",
    geoUnsupported: "Ce navigateur ne gère pas la géolocalisation.",
    geoUnavailable: "Position indisponible pour le moment.",
    geoOutsideRome: "Vous êtes hors de la zone de Rome : saisissez une adresse.",
    geoDenied: "Autorisation de localisation refusée : saisissez une adresse.",
    geoTimeout: "La localisation a pris trop de temps.",
    originMarker: (name: string): string => `Départ : ${name}`,
    destinationMarker: (name: string): string => `Arrivée : ${name}`,
    useMyPosition: "Utiliser ma position",
    clearField: (label: string): string => `Vider ${label.toLowerCase()}`,
    suggestionsFor: (label: string): string => `Suggestions pour ${label.toLowerCase()}`,
    placeStop: "Arrêt",
    placeCoord: "Coordonnées",
    placeAddress: "Adresse",
    walkOnly: "À pied uniquement",
    walkOnlyShort: "à pied",
    noTransfers: "sans correspondance",
    transfers: (count: number): string =>
      n(count, { one: "correspondance", other: "correspondances" }),
    walkDistance: (distance: string): string => `${distance} à pied`,
    walkLeg: (distance: string, duration: string): string =>
      `À pied ${distance}, environ ${duration} jusqu'à `,
    inService: "en service",
    stopCount: (count: number): string => n(count, { one: "arrêt", other: "arrêts" }),
    itinerarySr: (index: number, departure: string, arrival: string): string =>
      `Itinéraire ${index} : départ ${departure}, arrivée ${arrival}`,
    lineDetailsAria: (line: string): string => `Ligne ${line}, détails`,
    hours: (hours: number): string => `${hours} h`,
    hoursMinutes: (hours: number, minutes: string): string => `${hours} h ${minutes}`,
    /** journey.ts runs on the server and has no locale: it sends a slug. */
    noticeNoOriginStops:
      "Aucun arrêt à pied depuis le point de départ : essayez une adresse plus proche d'une ligne.",
    noticeNoDestinationStops:
      "Aucun arrêt à pied depuis le point d'arrivée : essayez une adresse plus proche d'une ligne.",
    noticeNoConnection: "Aucune liaison trouvée entre ces deux zones dans les prochaines heures.",
    noticeWalkOnlyLeft:
      "Aucune liaison prévue dans les prochaines heures : il ne reste que le trajet à pied.",
    noticeLaterDepartures:
      "Rien de prévu dans l'heure et demie qui vient : voici les premières courses d'après.",
  },

  alerts: {
    title: "Alertes de service",
    subtitle: "Déviations, suspensions et modifications publiées sur le flux officiel.",
    loading: "Chargement…",
    degraded:
      "Le flux temps réel ne répond pas ou est ancien : ces alertes pourraient ne pas être à jour.",
    loadFailed: "Impossible de charger les alertes.",
    refreshFailed: (error: string): string =>
      `La dernière actualisation a échoué (${error}) : vous voyez la liste précédente.`,
    searchPlaceholder: "Cherchez : grève, déviation, rue…",
    searchAria: "Chercher parmi les alertes",
    filterByLine: "Filtrer par ligne",
    allLines: (count: number): string => `Toutes les lignes (${count})`,
    networkWide: "Alertes générales",
    clearFilters: "Réinitialiser",
    noMatch: "Aucune alerte ne correspond aux filtres.",
    filteredCount: (shown: number, total: number): string =>
      `${shown} ${pick(shown, { one: "alerte", other: "alertes" })} sur ${total}.`,
    activeCount: (count: number, lines: number): string =>
      `${count} ${pick(count, { one: "alerte active", other: "alertes actives" })} sur ${lines} lignes.`,
    goToLine: "Aller à la ligne",
    noneTitle: "Aucune alerte active",
    noneHint:
      "Pour l'instant le flux ne signale aucune interruption ni modification du service. Revérifiez avant de partir.",
    noResultsTitle: "Aucun résultat",
    noResultsHint:
      "Essayez avec moins de mots, ou réinitialisez les filtres pour revoir toutes les alertes.",
    noSelectionTitle: "Aucune alerte sélectionnée",
    noSelectionHint: "Choisissez une alerte dans la liste à gauche pour la lire en entier.",
    showMoreLines: (count: number): string => `Afficher plus de lignes (${count})`,
    goToLineShort: "aller à la ligne",
    fallbackHeader: "Alerte de service",
    noDetail: "Aucun détail publié par l'exploitant.",
    operatorLink: "Détails sur le site de l'exploitant",
    affectedLines: "Lignes concernées",
    alsoOn: "Aussi sur",
    contextHeading: (count: number): string =>
      `${count} ${pick(count, { one: "alerte active", other: "alertes actives" })}`,
    contextAria: "Alertes de service",
    contextAll: "Toutes",
    contextUnavailable: (error: string): string => `Alertes non disponibles : ${error}`,
    contextMore: (count: number): string => `${count} autres alertes sur la `,
    contextMoreLink: "page des alertes",
    contextStale: (error: string): string =>
      `La dernière actualisation a échoué (${error}) : ces alertes pourraient ne plus être d'actualité.`,
    windowBetween: (from: string, until: string): string => `Du ${from} au ${until}`,
    windowFrom: (from: string): string => `À partir du ${from}, sans échéance indiquée`,
    windowUntil: (until: string): string => `Jusqu'au ${until}`,
    windowUnknown: "Période de validité non indiquée",
    effect: (code: string): string | null => EFFECT_FR[code] ?? null,
    cause: (code: string): string | null => CAUSE_FR[code] ?? null,
  },

  settings: {
    title: "Réglages",
    subtitle: "Tout reste sur cet appareil. Aucun compte, aucun serveur.",
    sectionArrivals: "Arrivées",
    autoRefresh: "Actualisation automatique",
    everySeconds: (seconds: number): string => `toutes les ${seconds} secondes`,
    autoRefreshHint: "Intervalle entre deux lectures du flux temps réel.",
    maxArrivals: "Arrivées affichées par arrêt",
    showScheduled: "Afficher les horaires théoriques",
    showScheduledHint:
      "Quand le temps réel n'a rien pour un arrêt, utiliser la fiche horaire.",
    sectionNearby: "Près de moi",
    radius: "Rayon de recherche",
    radiusHint: "Vaut aussi pour les rayons rapides sur la carte des arrêts à proximité.",
    sectionAppearance: "Apparence",
    themeLegend: "Thème",
    themeSystem: "Système",
    themeLight: "Clair",
    themeDark: "Sombre",
    sectionLanguage: "Langue",
    languageLegend: "Langue de l'interface",
    languageSystem: "Système",
    languageHint: (resolved: string): string =>
      `Avec « Système » nous suivons la langue du navigateur : c'est ${resolved} en ce moment.`,
    sectionBackup: "Sauvegarde des favoris",
    backupIntro:
      "Un fichier JSON sur votre appareil : c'est la façon de déplacer les favoris vers un autre navigateur, puisqu'il n'y a aucun compte ici.",
    exportCount: (count: number): string => `Exporter (${count})`,
    importFromFile: "Importer depuis un fichier",
    exported: (count: number): string => `${count} favoris exportés.`,
    exportFailed: "L'exportation a échoué sur ce navigateur.",
    fileTooLarge: "Le fichier est trop gros pour être une sauvegarde des favoris.",
    fileUnreadable: "Impossible de lire le fichier.",
    importEmpty: "Le fichier est vide.",
    importNotJson: "Le fichier n'est pas un JSON valide.",
    importNoList: "Le fichier ne contient pas de liste de favoris.",
    importNoneValid: "Aucun favori valide trouvé dans le fichier.",
    importFound: (count: number): string => `${count} favoris valides trouvés`,
    importSkipped: (count: number): string => `, ${count} entrées écartées.`,
    importFoundEnd: ".",
    importMerge: "Fusionner",
    importReplace: "Remplacer",
    replaced: (count: number): string => `Favoris remplacés : il y en a maintenant ${count}.`,
    mergedNone: "Aucun nouveau favori à ajouter.",
    merged: (count: number): string => `${count} favoris ajoutés.`,
    sectionLocalData: "Données locales",
    localDataSummary: (favorites: number, recents: number): string =>
      `${favorites} favoris, ${recents} arrêts dans l'historique.`,
    confirmClearFavorites: "Supprimer tous les favoris ? L'opération est irréversible.",
    confirmClearFavoritesYes: "Oui, vider",
    clearFavorites: "Vider les favoris",
    favoritesCleared: "Favoris vidés.",
    confirmClearRecents: "Supprimer l'historique des arrêts consultés ?",
    confirmClearRecentsYes: "Oui, supprimer",
    clearRecents: "Supprimer l'historique",
    recentsCleared: "Historique supprimé.",
    resetDefaults: "Rétablir les réglages par défaut",
    settingsReset: "Réglages rétablis aux valeurs par défaut.",
    infoLink: "Informations, sources des données et questions fréquentes",
  },

  sync: {
    titleFull: "Synchroniser les appareils",
    titleCollapsed: "Synchronisation",
    badgeOn: "active",
    summaryLoading: "…",
    summaryUnavailable: "Indisponible sur cette connexion",
    summaryOff: "Non active",
    summarySyncing: "Synchronisation en cours…",
    summaryError: "Erreur de synchronisation",
    summaryConflict: "Conflit à résoudre",
    summaryOn: (last: string): string => `Active · dernière ${last}`,
    intro:
      "Emportez favoris, récents et réglages sur un autre appareil avec un code. Les données sont chiffrées ici : le serveur ne conserve que des données illisibles.",
    enable: "Activer la synchronisation",
    haveCode: "J'ai déjà un code",
    codeLabel: "Code de synchronisation",
    codeHint:
      "20 caractères, tels que vous les lisez sur l'autre appareil. Majuscules, tirets et espaces ne comptent pas.",
    codeProgress: (typed: number, total: number): string => `${typed}/${total} caractères`,
    join: "Connecter",
    onIntro:
      "Les données sont chiffrées sur cet appareil avant de partir. Qui a le code peut lire tous vos favoris : ne l'utilisez que sur vos propres appareils.",
    code: "Code",
    showCode: "Afficher le code",
    hideCode: "Masquer le code",
    copyCode: "Copier le code",
    copied: "Copié",
    lastSync: "Dernière synchronisation :",
    inProgress: " · en cours…",
    syncNow: "Synchroniser maintenant",
    disconnect: "Déconnecter",
    disconnectNote:
      "En vous déconnectant, les données restent sur cet appareil et la copie chiffrée reste sur le serveur jusqu'à ce que vous la supprimiez.",
    deleteWarning:
      "Supprime la copie chiffrée du serveur. Les autres appareils ne trouveront plus rien à synchroniser. C'est irréversible.",
    deleteConfirm: "Supprimer vraiment",
    deleteRemote: "Supprimer les données du serveur",
    justNow: "maintenant",
    minutesAgo: (minutes: number): string => `il y a ${minutes} min`,
    atClock: (clock: string): string => `à ${clock}`,
    errors: {
      aborted: "Opération annulée.",
      generic: "La synchronisation a échoué. Réessayez dans un instant.",
      insecureContext:
        "La synchronisation exige une connexion sécurisée : ouvrez le site en https (ou sur localhost). En http les navigateurs coupent le chiffrement, donc rien ne peut être chiffré sur cet appareil.",
      noBase64Encode: "Ce navigateur ne sait pas encoder les données de synchronisation.",
      noBase64Decode: "Ce navigateur ne sait pas décoder les données de synchronisation.",
      invalidSyncData: (what: string): string =>
        `Données de synchronisation non valides (${what}).`,
      codeRequired: "Saisissez le code de synchronisation.",
      codeTooLong: (max: number): string =>
        `Ce code est trop long : il devrait faire ${n(max, { one: "caractère", other: "caractères" })}.`,
      codeInvalidChars: (chars: string): string =>
        `Le code contient des caractères non autorisés : ${chars}.`,
      codeWrongLength: (required: number, actual: number): string =>
        `Le code fait ${n(required, { one: "caractère", other: "caractères" })}, vous en avez saisi ${actual}.`,
      keyDerivationFailed: "Ce navigateur n'arrive pas à dériver les clés de synchronisation.",
      preparePayloadFailed: "Impossible de préparer les données à synchroniser.",
      encryptFailed: "Les données n'ont pas pu être chiffrées sur cet appareil.",
      decryptFailed:
        "Le code ne correspond pas à ces données, ou les données sur le serveur sont abîmées.",
      invalidSyncId: "Identifiant de synchronisation non valide.",
      responseTooLarge: "Le serveur a renvoyé trop de données.",
      timeout: "Le serveur n'a pas répondu à temps.",
      unreachable: "Serveur injoignable. Vérifiez votre connexion.",
      invalidResponse: "Réponse du serveur non valide.",
      invalidResponseField: (what: string): string =>
        `Réponse du serveur non valide (${what}).`,
      unexpectedFormat: "Le serveur a répondu dans un format inattendu.",
      rateLimited: "Trop de synchronisations coup sur coup. Réessayez dans une minute.",
      pullRejected: (status: number): string =>
        `Le serveur a refusé la lecture (erreur ${status}).`,
      payloadTooLarge: "Il y a trop de données à synchroniser.",
      pushRejected: (status: number): string =>
        `Le serveur a refusé l'enregistrement (erreur ${status}).`,
      deleteRejected: (status: number): string =>
        `Le serveur a refusé la suppression (erreur ${status}).`,
      conflict:
        "Un autre appareil écrit dans ces mêmes données en ce moment. Vos données locales sont en sécurité : réessayez dans quelques secondes.",
    },
    status: {
      deleted: "Données supprimées du serveur. Cet appareil n'est plus synchronisé.",
      disconnected:
        "La synchronisation est désactivée sur cet appareil. Vos données restent ici et la copie chiffrée reste sur le serveur jusqu'à ce que vous la supprimiez.",
    },
  },

  info: {
    title: "Informations",
    subtitle:
      "Horaires et arrivées des transports publics de Rome, à partir des données ouvertes officielles.",
    unofficialTitle: "Application non officielle",
    unofficialBody:
      "Ce site n'est ni affilié, ni associé, ni autorisé, ni soutenu de quelque manière que ce soit par ATAC S.p.A., par Roma Servizi per la Mobilità ou par Roma Capitale. C'est un projet indépendant qui se limite à lire les données ouvertes que ces organismes publient. Pour les informations officielles, les billets et les réclamations, adressez-vous à leurs canaux.",
    whatTitle: "Qu'est-ce que c'est",
    whatBody1:
      "Une application web pour savoir dans combien de temps passe le prochain véhicule à l'arrêt où vous êtes. Vous cherchez un arrêt ou une ligne, vous l'enregistrez dans les favoris et vous la retrouvez sur l'accueil avec les arrivées actualisées. Pas de compte, pas de publicité, pas de statistiques d'usage.",
    whatBody2:
      "Quand le flux temps réel couvre la course, l'heure affichée est une prévision basée sur la position du véhicule. Sinon l'application se rabat sur l'horaire théorique et vous le dit toujours, au lieu de faire passer une donnée ancienne pour une prévision.",
    dataTitle: "D'où viennent les données",
    dataBodyBefore:
      "Horaires, arrêts, lignes, tracés, positions des véhicules et alertes de service viennent des données ouvertes de ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataBodyAfter:
      " (flux GTFS et GTFS-Realtime). Les horaires théoriques sont mis à jour chaque jour, le temps réel toutes les 30 secondes environ.",
    dataLink: "romamobilita.it — Données ouvertes",
    dataLicence:
      "Les données restent la propriété de leurs titulaires et sont utilisées aux conditions de la licence sous laquelle elles sont publiées.",
    privacyTitle: "Confidentialité",
    privacyBody:
      "Il n'y a ni connexion ni profil utilisateur. Favoris, arrêts consultés récemment et réglages sont enregistrés uniquement dans votre navigateur et ne sont envoyés nulle part. La position, si vous l'accordez pour la recherche des arrêts à proximité, reste dans l'appareil : elle sert à calculer les distances et n'est pas conservée.",
    faqTitle: "Questions fréquentes",
    faq1Q: "Pourquoi une ligne ou un bus n'apparaît pas ?",
    faq1A:
      "Nous n'affichons que ce qui est dans les flux officiels. Si un véhicule ne transmet pas sa position, ou si sa course n'est pas dans le flux temps réel, pour nous il n'existe pas : au mieux vous verrez l'horaire théorique. Cela arrive souvent avec les courses de remplacement, les navettes et les véhicules dont le localisateur est en panne.",
    faq2Q: "Pourquoi les horaires diffèrent de ceux affichés à l'arrêt ?",
    faq2A:
      "Le panneau au poteau indique l'horaire théorique, qui change peu de fois par an. Ici, quand le véhicule transmet, vous voyez la prévision calculée sur sa position réelle, qui tient compte du trafic et des retards. En revanche, quand vous lisez « prévu », il n'y a pas de prévision et nous affichons le même horaire que le panneau.",
    faq3Q: "Que se passe-t-il la nuit ?",
    faq3A:
      "La nuit le flux temps réel est presque vide, car peu de véhicules circulent. L'application continue de fonctionner avec les horaires théoriques des lignes de nuit. Dans le GTFS la journée de service ne finit pas à minuit mais à 04:00 : une course d'une heure du matin appartient encore à la veille, et c'est pour cela que vous pouvez voir des horaires comme 25:30 traduits en 01:30.",
    faq4Q: "Mes favoris finissent-ils sur un serveur ?",
    faq4A:
      "Non. Favoris, historique et réglages sont dans le localStorage du navigateur. Si vous videz les données du site ou changez d'appareil, ils disparaissent : depuis les réglages vous pouvez les exporter dans un fichier JSON et les réimporter ailleurs.",
    settingsLink: "Aller aux réglages",
  },

  footer: {
    dataPrefix: "Données de service et horaires : ",
    dataProvider: "Roma Servizi per la Mobilità",
    dataSuffix: " (données ouvertes GTFS).",
    independent:
      "Projet indépendant, non affilié à ATAC ni à Roma Servizi per la Mobilità. ",
    infoLink: "Informations",
  },

  errors: {
    genericTitle: "Quelque chose n'a pas fonctionné",
    unexpected: "Erreur inattendue",
    unexpectedDot: "Erreur inattendue.",
    stopNotFound: "Arrêt introuvable",
    serviceDown: "Le service ne répond pas",
    requestFailed: (status: number): string => `La requête a échoué (${status})`,
    httpStatus: (status: number): string => `Erreur ${status}`,
    badResponse: "Réponse du serveur non valide",
    badResponseDot: "Réponse du serveur non valide.",
    timedOut: "Requête expirée",
    timedOutDot: "Requête expirée.",
    offline: "Pas de connexion",
    connectionFailed: "La connexion a échoué.",
    tooManyRequests: "Trop de requêtes",
    badRequest: "Paramètres non valides",
    lineNotFound: "Ligne introuvable",
    journeyOriginNotFound: "Départ introuvable",
    journeyDestinationNotFound: "Arrivée introuvable",
    journeyPlaceHint: "Essayez avec une adresse plus précise.",
  },

  notFound: {
    kicker: "Erreur 404",
    title: "Arrêt non desservi",
    body:
      "Cette page n'existe pas. Cela peut arriver avec un vieux lien, ou avec le code d'un arrêt ou d'une ligne qui n'est plus dans le flux.",
    searchCta: "Chercher un arrêt",
    nearbyCta: "Arrêts à proximité",
  },

  appError: {
    title: "Course interrompue",
    body:
      "Cet écran n'a pas réussi à se charger. Réessayez : si le problème persiste, c'est probablement le service de données qui ne répond pas.",
    digest: (digest: string): string => `Code : ${digest}`,
    backHome: "Revenir à l'accueil",
    globalTitle: "Service suspendu",
    globalBody:
      "L'application s'est arrêtée sur une erreur inattendue. Rechargez la page : vos favoris restent enregistrés sur le téléphone et ne sont pas perdus.",
    reload: "Recharger",
  },

  format: {
    due: "à l'approche",
    unavailable: "--",
    clockUnavailable: "--:--",
    dateUnavailable: "date non disponible",
    minutes: (minutes: number): string => `${minutes} min`,
    metres: (metres: number): string => `${metres} m`,
    kilometres: (value: string): string => `${value} km`,
    ageUnknown: "actualisation inconnue",
    ageSeconds: (seconds: number): string => `actualisé il y a ${seconds} s`,
    ageMinutes: (minutes: number): string => `actualisé il y a ${minutes} min`,
    ageAt: (clock: string): string => `actualisé à ${clock}`,
    onTime: "à l'heure",
    delayLate: (minutes: number): string => `+${minutes} min`,
    delayEarly: (minutes: number): string => `${minutes} min`,
  },

  meta: {
    appTitle: "BusFinder — départs en temps réel",
    appDescription:
      "Horaires et passages en temps réel des bus, trams et métros à Rome. Favoris, arrêts à proximité et alertes de service, sans compte et sans publicité.",
    titleTemplate: (title: string): string => `${title} · BusFinder`,
    nearbyDescription:
      "Les arrêts ATAC les plus proches de vous, avec la carte et les lignes qui les desservent.",
    journeyDescription:
      "Calculez comment aller d'un point à un autre de Rome en bus, tram et métro, sur les horaires officiels ATAC.",
    alertsDescription:
      "Déviations, suspensions et modifications de service publiées sur le flux officiel.",
    settingsDescription:
      "Actualisation des arrivées, rayon de recherche, thème et gestion des favoris.",
    infoDescription:
      "Ce qu'est cette app, d'où viennent les données et pourquoi elle n'est pas affiliée à ATAC ni à Roma Servizi per la Mobilità.",
    stopDescription: "Prochains passages en temps réel et horaire théorique de l'arrêt.",
    lineDescription: "Tracé, arrêts et véhicules en temps réel de la ligne.",
  },

  skeleton: {
    loading: "Chargement",
  },
};

const EFFECT_FR: Record<string, string | undefined> = {
  NO_SERVICE: "Service suspendu",
  REDUCED_SERVICE: "Service réduit",
  SIGNIFICANT_DELAYS: "Retards importants",
  DETOUR: "Déviation",
  ADDITIONAL_SERVICE: "Service supplémentaire",
  MODIFIED_SERVICE: "Service modifié",
  STOP_MOVED: "Arrêt déplacé",
  NO_EFFECT: "Aucun effet sur le service",
  ACCESSIBILITY_ISSUE: "Problème d'accessibilité",
  OTHER_EFFECT: "Autre",
  UNKNOWN_EFFECT: "Effet non précisé",
};

const CAUSE_FR: Record<string, string | undefined> = {
  TECHNICAL_PROBLEM: "Panne technique",
  STRIKE: "Grève",
  DEMONSTRATION: "Manifestation",
  ACCIDENT: "Accident",
  HOLIDAY: "Jour férié",
  WEATHER: "Intempéries",
  MAINTENANCE: "Maintenance",
  CONSTRUCTION: "Travaux",
  POLICE_ACTIVITY: "Intervention des forces de l'ordre",
  MEDICAL_EMERGENCY: "Urgence médicale",
  OTHER_CAUSE: "Autre cause",
  UNKNOWN_CAUSE: "Cause non précisée",
};
