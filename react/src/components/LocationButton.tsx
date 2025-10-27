/**
 * LocationButton component for centering map on user's location
 */

import { useGeolocation } from '../hooks/useGeolocation';
import { useMap } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';

interface LocationButtonProps {
  zoom?: number;
}

export function LocationButton({ zoom = 15 }: LocationButtonProps) {
  const map = useMap();
  const { location, error, loading, requestLocation } = useGeolocation();
  const [isRequesting, setIsRequesting] = useState(false);
  const requestTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (error) {
      alert(error);
      setIsRequesting(false);
    }
  }, [error]);

  const handleClick = () => {
    if (location && !isRequesting) {
      // If we already have location, just center the map
      map.setView([location.lat, location.lon], zoom);
    } else if (!loading) {
      // Request location and mark timestamp
      setIsRequesting(true);
      requestTimestampRef.current = Date.now();
      requestLocation();
    }
  };

  // Center map when location is received (only if we just requested it)
  useEffect(() => {
    if (location && isRequesting) {
      // Only center if this location was received after our request
      const timeSinceRequest = Date.now() - requestTimestampRef.current;
      if (timeSinceRequest < 15000) { // Within 15 seconds of request
        map.setView([location.lat, location.lon], zoom);
      }
      setIsRequesting(false);
    }
  }, [location, isRequesting, map, zoom]);

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
