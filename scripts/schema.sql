-- SQLite schema for the Rome GTFS static feed.
-- Written by scripts/ingest.ts, read-only at runtime.
-- Times are stored as seconds after midnight of the service day, so values
-- above 86400 are legal and mean "after midnight" (GTFS allows 25:10:00).

PRAGMA journal_mode = OFF;
PRAGMA synchronous = OFF;

CREATE TABLE agencies (
  agency_id   TEXT PRIMARY KEY,
  agency_name TEXT NOT NULL,
  agency_url  TEXT
);

CREATE TABLE stops (
  stop_id     TEXT PRIMARY KEY,
  stop_code   TEXT,
  stop_name   TEXT NOT NULL,
  -- lowercase, accent-stripped copy of stop_name for LIKE searches
  stop_search TEXT NOT NULL,
  lat         REAL NOT NULL,
  lon         REAL NOT NULL,
  wheelchair  INTEGER
);
CREATE INDEX idx_stops_search ON stops(stop_search);
CREATE INDEX idx_stops_code ON stops(stop_code);
-- Bounding-box prefilter for the nearby query.
CREATE INDEX idx_stops_lat ON stops(lat);

CREATE TABLE routes (
  route_id   TEXT PRIMARY KEY,
  agency_id  TEXT,
  short_name TEXT NOT NULL,
  long_name  TEXT,
  route_type INTEGER NOT NULL,
  route_url  TEXT,
  color      TEXT,
  text_color TEXT,
  -- lowercase copy of short_name for LIKE searches
  route_search TEXT NOT NULL
);
CREATE INDEX idx_routes_search ON routes(route_search);

CREATE TABLE trips (
  trip_id      TEXT PRIMARY KEY,
  route_id     TEXT NOT NULL,
  service_id   TEXT NOT NULL,
  headsign     TEXT,
  direction_id INTEGER NOT NULL DEFAULT 0,
  shape_id     TEXT
);
CREATE INDEX idx_trips_route ON trips(route_id, direction_id);
CREATE INDEX idx_trips_service ON trips(service_id);

CREATE TABLE stop_times (
  trip_id       TEXT NOT NULL,
  stop_id       TEXT NOT NULL,
  arrival_sec   INTEGER NOT NULL,
  departure_sec INTEGER NOT NULL,
  stop_sequence INTEGER NOT NULL
);
-- Covering index for "next departures at this stop": the timetable hot path.
CREATE INDEX idx_st_stop ON stop_times(stop_id, departure_sec, trip_id, stop_sequence);
-- Ordered stop list for one trip: used to build line paths.
CREATE INDEX idx_st_trip ON stop_times(trip_id, stop_sequence);

-- This feed ships no calendar.txt: every operating day is an explicit
-- calendar_dates row with exception_type=1. Only those rows are imported.
CREATE TABLE calendar_dates (
  service_id TEXT NOT NULL,
  date       TEXT NOT NULL,
  PRIMARY KEY (service_id, date)
);
CREATE INDEX idx_caldates_date ON calendar_dates(date);

-- One encoded polyline per shape instead of millions of points.
CREATE TABLE shapes (
  shape_id TEXT PRIMARY KEY,
  polyline TEXT NOT NULL
);

-- Denormalised route<->stop map, built at ingest time. Answers
-- "which lines call at this stop" without touching stop_times at runtime.
CREATE TABLE route_stops (
  route_id     TEXT NOT NULL,
  direction_id INTEGER NOT NULL,
  stop_id      TEXT NOT NULL,
  -- median position of the stop along the route, for ordering
  stop_order   INTEGER NOT NULL,
  PRIMARY KEY (route_id, direction_id, stop_id)
);
CREATE INDEX idx_rs_stop ON route_stops(stop_id);
CREATE INDEX idx_rs_route ON route_stops(route_id, direction_id, stop_order);

-- The representative trip per route+direction, used to draw the line path.
CREATE TABLE route_patterns (
  route_id     TEXT NOT NULL,
  direction_id INTEGER NOT NULL,
  headsign     TEXT NOT NULL,
  trip_id      TEXT NOT NULL,
  shape_id     TEXT,
  trip_count   INTEGER NOT NULL,
  PRIMARY KEY (route_id, direction_id)
);

-- Single-row table describing the imported feed.
CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
