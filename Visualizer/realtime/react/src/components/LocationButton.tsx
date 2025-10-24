/**
 * LocationButton component for centering map on user's location
 */

import { useGeolocation } from '../hooks/useGeolocation';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

interface LocationButtonProps {
  zoom?: number;
}

export function LocationButton({ zoom = 15 }: LocationButtonProps) {
  const map = useMap();
  const { location, error, requestLocation } = useGeolocation();

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleClick = () => {
    if (location) {
      // If we already have location, just center the map
      map.setView([location.lat, location.lon], zoom);
    } else {
      // Request location first
      requestLocation();
    }
  };

  // Center map when location is first received
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lon], zoom);
    }
  }, [location, map, zoom]);

  return (
    <button
      id="center-user-btn"
      onClick={handleClick}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 1000,
        cursor: 'pointer',
        background: 'none',
        border: 'none',
      }}
    >
      <img
        src="/assets/PosIcon.svg"
        alt="Center to My Location"
        style={{ width: '55px', height: '55px', display: 'block' }}
      />
    </button>
  );
}
