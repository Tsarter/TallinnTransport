/**
 * RoutePolyline component for displaying selected route on map
 * Shows route geometry as a blue polyline
 */

import { Polyline } from 'react-leaflet';
import { useRoute } from '../hooks/useRoute';

export function RoutePolyline() {
  const { routeCoordinates, hasRoute } = useRoute();

  if (!hasRoute || !routeCoordinates || routeCoordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={routeCoordinates}
      pathOptions={{
        color: '#0d00ffe3',
        weight: 5,
        opacity: 0.7,
      }}
    />
  );
}
