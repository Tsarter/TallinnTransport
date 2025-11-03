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

// Helper component to set up custom panes
function MapPaneSetup() {
  const map = useMap();

  useEffect(() => {
    // Create custom pane for user location marker with high z-index
    // Default markerPane is 600, so we set this to 650 to be on top
    if (!map.getPane('userLocationPane')) {
      const pane = map.createPane('userLocationPane');
      pane.style.zIndex = '650';
    }
  }, [map]);

  return null;
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
      <MapPaneSetup />
      <MapController onMapReady={onMapReady} />
      {children}
    </MapContainer>
  );
}
