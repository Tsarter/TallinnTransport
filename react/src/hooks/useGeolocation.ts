/**
 * Custom hook for browser geolocation
 * Provides user's current location and watch functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useMapStore } from '../store/mapStore';

interface UserLocation {
  lat: number;
  lon: number;
  heading: number | null; // Direction in degrees (0-360), null if unavailable
}

interface UseGeolocationReturn {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
  watchLocation: () => void;
  stopWatching: () => void;
  checkPermission: () => Promise<PermissionState | null>;
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
      heading: position.coords.heading, // null if not available
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
    setError(null); // Clear previous errors

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 second timeout
        maximumAge: 0 // Don't use cached position
      }
    );
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
    setError(null); // Clear previous errors

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 second timeout
        maximumAge: 0 // Don't use cached position
      }
    );
    setWatchId(id);
  }, [watchId, handleSuccess, handleError]);

  // Stop watching user's location
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Check geolocation permission status
  const checkPermission = useCallback(async (): Promise<PermissionState | null> => {
    if (!navigator.permissions) {
      // Permissions API not supported (older browsers)
      return null;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state; // 'granted', 'prompt', or 'denied'
    } catch (err) {
      console.error('Permission check error:', err);
      return null;
    }
  }, []);

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
    checkPermission,
  };
}
