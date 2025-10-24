/**
 * StopMarker component for displaying stop markers with departure popups
 * Shows departure information when clicked
 */

import { Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { memo, useMemo, useState, useCallback } from 'react';
import type { Stop } from '../types';
import { StopPopupContent } from './StopPopupContent';

interface StopMarkerProps {
  stop: Stop;
}

export const StopMarker = memo(function StopMarker({ stop }: StopMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Create stop icon
  const icon = useMemo(() => {
    return new DivIcon({
      html: `<img class="stop-icon-img" src="/assets/StopIcon.svg" style="width: 14px; height: 14px;" />`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: 'stop-icon',
    });
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Marker
      position={[stop.lat, stop.lon]}
      icon={icon}
      eventHandlers={{
        click: handleOpen,
        popupclose: handleClose,
      }}
    >
      <Popup autoPan={false} maxWidth={400}>
        {isOpen ? <StopPopupContent stop={stop} /> : <div>{stop.stop_name}</div>}
      </Popup>
    </Marker>
  );
});
