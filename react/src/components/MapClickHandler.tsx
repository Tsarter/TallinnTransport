/**
 * MapClickHandler component for handling map clicks
 * Implements double-click to deselect route (matches vanilla behavior)
 */

import { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useMapStore } from '../store/mapStore';

export function MapClickHandler() {
  const setSelectedRoute = useMapStore((state) => state.setSelectedRoute);
  const setSelectedStop = useMapStore((state) => state.setSelectedStop);
  const selectedRoute = useMapStore((state) => state.selectedRoute);

  const clickCountRef = useRef(0);

  useMapEvents({
    click: () => {
      // Only count clicks if a route is selected
      if (!selectedRoute.line) {
        clickCountRef.current = 0;
        return;
      }

      clickCountRef.current++;

      // Reset route selection after 2 clicks on the map
      if (clickCountRef.current >= 2) {
        clickCountRef.current = 0;
        setSelectedRoute({ type: null, line: null, destination: null });
        setSelectedStop(null);
      }
    },
    popupclose: () => {
      // Reset click counter when popup closes
      clickCountRef.current = 1;
    },
  });

  // Reset click counter when route changes
  useEffect(() => {
    clickCountRef.current = 0;
  }, [selectedRoute.line]);

  return null;
}
