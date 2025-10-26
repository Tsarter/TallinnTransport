/**
 * Main Map component using React-Leaflet
 */

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center?: LatLngExpression;
  zoom?: number;
  onMapReady?: (map: L.Map) => void;
  children?: React.ReactNode;
}

// Helper component to access map instance
function MapController({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

export function Map({
  center = [59.4372, 24.7454], // Tallinn
  zoom = 13,
  onMapReady,
  children
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100vh', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={18}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapController onMapReady={onMapReady} />
      {children}
    </MapContainer>
  );
}
