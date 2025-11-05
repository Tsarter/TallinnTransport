/**
 * Configuration constants for the proxy server
 */

export const SERVER_CONFIG = {
  PORT: 3001,
  HOST: '127.0.0.1',
} as const;

export const CACHE_DURATIONS = {
  GPS: '5 seconds',
  ROUTE: '6 hours',
  ROUTE_STOPS: '6 hours',
  ELRON: 10000, // milliseconds
} as const;

export const TIMEOUTS = {
  TLT_FETCH: 2000, // milliseconds
  ELRON_FETCH: 5000, // milliseconds
  DEPARTURE_FETCH: 2000, // milliseconds
} as const;

export const EXTERNAL_URLS = {
  TLT_GPS: 'https://transport.tallinn.ee/gps.txt',
  ELRON_API: 'https://elron.ee/map_data.json',
  TALLINN_DEPARTURES: 'https://transport.tallinn.ee/siri-stop-departures.php',
  INTERRUPTIONS: 'http://localhost/transport_data/transport_data/interruptions_data/ongoing.json',
} as const;

export const LIMITS = {
  MAX_DEPARTURES: 20,
  DEFAULT_DEPARTURES: 5,
} as const;
