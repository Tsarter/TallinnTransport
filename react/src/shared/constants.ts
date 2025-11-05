/**
 * Shared constants for both vanilla JS and React versions
 */

// Vehicle type mappings
export const VEHICLE_TYPES = {
  BUS: 2,
  REGIONAL_BUS: 7,
  TRAM: 3,
  TRAIN: 10,
} as const;

export const VEHICLE_TYPES_ESTONIAN: { [key: number]: string } = {
  2: 'Buss',
  3: 'Tramm',
  7: 'Buss',
  10: 'Rong',
};

export const VEHICLE_TYPES_ENGLISH_TO_ESTONIAN: { [key: string]: string } = {
  tram: 'Tramm',
  bus: 'Buss',
  regionalbus: 'Buss',
  train: 'Rong',
};

export const VEHICLE_TYPES_ENGLISH_TO_NUM: { [key: string]: number } = {
  tram: 3,
  bus: 2,
  regionalbus: 2,
  train: 10,
};

// Map configuration
export const MAP_CONFIG = {
  CENTER: [59.4372, 24.7454] as [number, number], // Tallinn
  DEFAULT_ZOOM: 13,
  USER_LOCATION_ZOOM: 15,
  MAX_ZOOM: 18,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

// Stop marker visibility thresholds
export const STOP_VISIBILITY = {
  DESKTOP_MIN_ZOOM: 15,
  MOBILE_MIN_ZOOM: 14,
};

// Update intervals (milliseconds)
export const UPDATE_INTERVALS = {
  GPS_FETCH: 6000, // 6 seconds
  ANIMATION_DURATION: 6000, // 6 seconds
};

// Device detection
export const DEVICE_TYPE = {
  MOBILE: 'Mobile',
  DESKTOP: 'Desktop',
} as const;

// API base URL and endpoints
export const API_BASE: string = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE
  : 'https://tallinn.simplytobo.eu';

export const API_PATHS = {
  PROXY: '/proxy',
  TRANSPORT_DATA: '/transport_data/transport_data',
};
