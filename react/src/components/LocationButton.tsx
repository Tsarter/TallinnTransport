/**
 * LocationButton component for centering map on user's location
 */

import { useGeolocation } from '../hooks/useGeolocation';
import { useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';
import { useMapStore } from '../store/mapStore';

interface LocationButtonProps {
  zoom?: number;
}

export function LocationButton({ zoom = 15 }: LocationButtonProps) {
  const map = useMap();
  const { error, loading, requestLocation } = useGeolocation();
  const [isRequesting, setIsRequesting] = useState(false);
  const userLocation = useMapStore((state) => state.userLocation);

  const requestTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (error) {
      alert(error);
      setIsRequesting(false);
    }
  }, [error]);

  const handleClick = () => {
    if (userLocation && !isRequesting) {
      // If we already have location, just center the map
      map.setView([userLocation.lat, userLocation.lon], zoom);
    } else if (!loading) {
      // Request location and mark timestamp
      setIsRequesting(true);
      requestTimestampRef.current = Date.now();
      requestLocation();
    }
  };

  // Center map when location is received (only if we just requested it)
  useEffect(() => {
    if (userLocation && isRequesting) {
      // Only center if this location was received after our request
      const timeSinceRequest = Date.now() - requestTimestampRef.current;
      if (timeSinceRequest < 15000) { // Within 15 seconds of request
        map.setView([userLocation.lat, userLocation.lon], zoom);
      }
      setIsRequesting(false);
    }
  }, [userLocation, isRequesting, map, zoom]);

  return (
    <button
      id="center-user-btn"
      onClick={handleClick}
      disabled={loading || isRequesting}
      title={loading ? "Asukoha määramine..." : "Tsentreeri kaart minu asukohale"}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 1000,
        cursor: loading || isRequesting ? 'wait' : 'pointer',
        background: 'none',
        border: 'none',
        opacity: loading || isRequesting ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <img
        src="/assets/PosIcon.svg"
        alt="Center to My Location"
        style={{
          width: '55px',
          height: '55px',
          display: 'block',
          animation: loading || isRequesting ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />
    </button>
  );
}
