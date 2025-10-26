/**
 * StopMarker component for displaying stop markers with departure popups
 * Shows departure information when clicked
 */

import { Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import type { Popup as LeafletPopup } from 'leaflet';
import { memo, useMemo, useState, useCallback, useRef } from 'react';
import type { Stop } from '../types';
import { StopPopupContent } from './StopPopupContent';

interface StopMarkerProps {
  stop: Stop;
}

export const StopMarker = memo(function StopMarker({ stop }: StopMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<LeafletPopup | null>(null);

  // Create stop icon
  const icon = useMemo(() => {
    return new DivIcon({
      html: `<img class="stop-icon-img" src="/assets/StopIcon.svg" style="width: 14px; height: 14px;" />`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: 'stop-icon',
    });
  }, []);

  // Memoize position to prevent array recreation
  const position = useMemo<[number, number]>(() => [stop.lat, stop.lon], [stop.lat, stop.lon]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleRouteSelect = useCallback(() => {
    // Close the popup when a route is selected
    if (popupRef.current) {
      popupRef.current.close();
    }
    setIsOpen(false);
  }, []);

  // Memoize event handlers object to prevent recreation
  const eventHandlers = useMemo(
    () => ({
      click: handleOpen,
      popupclose: handleClose,
    }),
    [handleOpen, handleClose]
  );

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      <Popup autoPan={false} maxWidth={400} ref={popupRef}>
        {isOpen ? <StopPopupContent stop={stop} onRouteSelect={handleRouteSelect} /> : <div>{stop.stop_name}</div>}
      </Popup>
    </Marker>
  );
});
