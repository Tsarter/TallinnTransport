/**
 * Type declarations for shared constants module
 */

export const VEHICLE_TYPES: {
  BUS: number;
  REGIONAL_BUS: number;
  TRAM: number;
  TRAIN: number;
};

export const VEHICLE_TYPES_ESTONIAN: {
  [key: number]: string;
};

export const VEHICLE_TYPES_ENGLISH_TO_ESTONIAN: {
  [key: string]: string;
};

export const VEHICLE_TYPES_ENGLISH_TO_NUM: {
  [key: string]: number;
};

export const MAP_CONFIG: {
  CENTER: [number, number];
  DEFAULT_ZOOM: number;
  USER_LOCATION_ZOOM: number;
  MAX_ZOOM: number;
  TILE_LAYER: string;
};

export const STOP_VISIBILITY: {
  DESKTOP_MIN_ZOOM: number;
  MOBILE_MIN_ZOOM: number;
};

export const UPDATE_INTERVALS: {
  GPS_FETCH: number;
  ANIMATION_DURATION: number;
};

export const DEVICE_TYPE: {
  MOBILE: string;
  DESKTOP: string;
};

export const API_BASE: string;

export const API_PATHS: {
  PROXY: string;
  TRANSPORT_DATA: string;
};
