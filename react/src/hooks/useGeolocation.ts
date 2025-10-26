/**
 * Custom hook for browser geolocation
 * Provides user's current location and watch functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useMapStore } from '../store/mapStore';

interface UserLocation {
  lat: number;
  lon: number;
}

interface UseGeolocationReturn {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
  watchLocation: () => void;
  stopWatching: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const setUserLocation = useMapStore((state) => state.setUserLocation);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const coords = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
    setLocation(coords);
    setUserLocation(coords);
    setError(null);
    setLoading(false);
  }, [setUserLocation]);

  const handleError = useCallback((err: GeolocationPositionError) => {
    console.error('Geolocation error:', err);
    let errorMessage = 'Asukoha määramine ebaõnnestus.';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Asukoha luba keelatud.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Asukoha informatsioon pole saadaval.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Asukoha päring aegus.';
        break;
    }

    setError(errorMessage);
    setLoading(false);
  }, []);

  // Request user's current location (one-time)
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Asukoha määramine ei ole toetatud.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, [handleSuccess, handleError]);

  // Start watching user's location (continuous updates)
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Asukoha määramine ei ole toetatud.');
      return;
    }

    if (watchId !== null) {
      // Already watching
      return;
    }

    setLoading(true);

    const id = navigator.geolocation.watchPosition(handleSuccess, handleError);
    setWatchId(id);
  }, [watchId, handleSuccess, handleError]);

  // Stop watching user's location
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    loading,
    requestLocation,
    watchLocation,
    stopWatching,
  };
}
