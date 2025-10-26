/**
 * StopsLayer component manages all stop markers
 * Implements zoom-based visibility and bounds filtering for performance
 * Optimized to reduce re-renders during map movement
 */

import { useState, useMemo } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useStops } from '../hooks/useStops';
import { useRouteStops } from '../hooks/useRouteStops';
import { useMapStore } from '../store/mapStore';
import { StopMarker } from './StopMarker';
import { STOP_VISIBILITY } from '../../../shared/constants.js';

export function StopsLayer() {
  const { stops } = useStops();
  const { routeStops } = useRouteStops();
  const deviceType = useMapStore((state) => state.deviceType);
  const selectedStop = useMapStore((state) => state.selectedStop);
  const selectedRoute = useMapStore((state) => state.selectedRoute);

  const [zoom, setZoom] = useState(13);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  // Only update when movement/zoom stops - no intermediate updates
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
      setBounds(map.getBounds());
    },
    moveend: () => {
      setBounds(map.getBounds());
    },
  });

  // Initialize bounds on mount
  if (!bounds && map) {
    setBounds(map.getBounds());
  }

  // Determine minimum zoom for stop visibility
  const minZoom =
    deviceType === 'Desktop' ? STOP_VISIBILITY.DESKTOP_MIN_ZOOM : STOP_VISIBILITY.MOBILE_MIN_ZOOM;

  // Create a Set of route stop IDs for efficient lookup
  const routeStopIds = useMemo(() => {
    if (!routeStops) return null;
    return new Set(routeStops.map((stop) => stop.stop_id));
  }, [routeStops]);

  // Filter stops based on zoom, bounds, and selected route
  const visibleStops = useMemo(() => {
    // If a route is selected, show all stops for that route regardless of zoom
    if (selectedRoute.line && routeStopIds) {
      return stops.filter((stop) => routeStopIds.has(stop.stop_id));
    }

    // Don't show stops if zoom is too low (when no route selected)
    if (zoom < minZoom) {
      // Exception: always show selected stop
      if (selectedStop) {
        return [selectedStop];
      }
      return [];
    }

    if (!bounds) return [];

    // Filter stops within bounds (when no route selected)
    return stops.filter((stop) => {
      // Always show selected stop
      if (selectedStop && stop.stop_id === selectedStop.stop_id) {
        return true;
      }

      // Check if stop is within bounds
      return bounds.contains([stop.lat, stop.lon]);
    });
  }, [stops, zoom, minZoom, bounds, selectedStop, selectedRoute.line, routeStopIds]);

  return (
    <>
      {visibleStops.map((stop) => (
        <StopMarker key={stop.stop_id} stop={stop} />
      ))}
    </>
  );
}
