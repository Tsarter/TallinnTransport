/**
 * VehicleMarker component for displaying animated vehicle markers
 * Includes rotation, line number overlay, and smooth animations
 * Matches vanilla implementation by directly manipulating Leaflet marker
 */

import { Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import { useMemo, memo, useRef, useEffect, useCallback } from 'react';
import { useMapStore } from '../store/mapStore';
import type { Vehicle } from '../types';
import { VEHICLE_TYPES_ESTONIAN } from '../shared/constants';
import { checkInterruption, getVehicleIconName } from '../shared/utils';
import '../styles/stopPopup.css';

interface VehicleMarkerProps {
  vehicle: Vehicle;
  shouldAnimate: boolean;
}

const ANIMATION_DURATION = 5500;
const TRAIN_ANIMATION_DURATION = 10500;

export const VehicleMarker = memo(function VehicleMarker({
  vehicle,
  shouldAnimate,
}: VehicleMarkerProps) {
  const interruptions = useMapStore((state) => state.interruptions);
  const selectedRoute = useMapStore((state) => state.selectedRoute);
  const setSelectedRoute = useMapStore((state) => state.setSelectedRoute);
  const markerRef = useRef<LeafletMarker | null>(null);
  const animationRef = useRef<number | null>(null);
  // Store initial position to keep position prop stable
  const initialPositionRef = useRef<[number, number]>([vehicle.lat, vehicle.lon]);

  // Validate coordinates before rendering
  if (!vehicle.lat || !vehicle.lon || isNaN(vehicle.lat) || isNaN(vehicle.lon)) {
    console.warn('Invalid vehicle coordinates:', vehicle);
    return null;
  }

  // Check for service interruptions (memoized to prevent recalculation)
  const vehicleTypeEstonian = useMemo(
    () => VEHICLE_TYPES_ESTONIAN[vehicle.type] || 'Buss',
    [vehicle.type]
  );

  const { announcement, ongoingInterruption } = useMemo(
    () =>
      checkInterruption(
        interruptions,
        vehicle.lineNum,
        vehicleTypeEstonian,
        vehicle.destination,
        false
      ),
    [interruptions, vehicle.lineNum, vehicleTypeEstonian, vehicle.destination]
  );

  // Get appropriate icon based on interruption status
  const iconFileName = useMemo(
    () => getVehicleIconName(vehicleTypeEstonian, ongoingInterruption),
    [vehicleTypeEstonian, ongoingInterruption]
  );

  // Animate marker when vehicle position changes
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const newLatLng = [vehicle.lat, vehicle.lon] as [number, number];

    if (!shouldAnimate) {
      // If we shouldn't animate, update immediately
      marker.setLatLng(newLatLng);
      return;
    }

    // Get current position of marker (wherever it is in its animation)
    const currentLatLng = marker.getLatLng();

    // Smooth movement animation - matches vanilla implementation
    let startTime: number | null = null;

    function animateMarker(timestamp: number) {
      const marker = markerRef.current;
      if (!marker) return;

      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      // if vehicle is train, use longer duration
      const duration =
        vehicleTypeEstonian.toLowerCase() === 'rong'
          ? TRAIN_ANIMATION_DURATION
          : ANIMATION_DURATION;
      
      const progress = Math.min(elapsed / duration, 1);

          
      // Linear interpolation
      const lat = currentLatLng.lat + (newLatLng[0] - currentLatLng.lat) * progress;
      const lng = currentLatLng.lng + (newLatLng[1] - currentLatLng.lng) * progress;

      // Update marker position directly (like vanilla)
      marker.setLatLng([lat, lng]);

      // Update rotation during animation
      const markerElement = marker.getElement();
      if (markerElement) {
        const imgElement = markerElement.querySelector('img');
        if (imgElement) {
          const currentTransform = imgElement.style.transform || "rotate(0deg)";
          const match = currentTransform.match(/-?\d+(\.\d+)?/);
          const currentRotation = match ? parseFloat(match[0]) : 0;
          const newRotation = vehicle.direction;

          // Compute shortest angular difference (-180 to +180)
          let delta = ((newRotation - currentRotation + 540) % 360) - 180;
          const smoothedRotation = currentRotation + delta;
          imgElement.style.transform = `rotate(${smoothedRotation}deg)`;
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateMarker);
      } else {
        animationRef.current = null;
      }
    }

    animationRef.current = requestAnimationFrame(animateMarker);

    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vehicle.lat, vehicle.lon, vehicle.direction, shouldAnimate]);

  // Create custom icon with rotation and line number
  const icon = useMemo(() => {
    const textColor = ongoingInterruption ? 'yellow' : 'white';

    return new DivIcon({
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <img
            src="/assets/${iconFileName}"
            style="
              width: 24px;
              height: 24px;
              transform: rotate(0deg);
              transition: transform 1s ease;
              display: block;
            "
          />
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 24px;
            height: 24px;
            color: ${textColor};
            font-weight: bold;
            font-size: 10px;
            text-align: center;
            line-height: 24px;
            pointer-events: none;
          ">${vehicle.lineNum}</div>
        </div>
      `,
      className: `vehicle-${vehicle.key}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, [vehicle.lineNum, vehicle.key, iconFileName, ongoingInterruption]);

  // Popup content (memoized JSX)
  const popupContent = useMemo(
    () => (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {vehicleTypeEstonian} {vehicle.lineNum} → {vehicle.destination}
        </div>
        {ongoingInterruption && announcement && (
          <div className="stop-popup-interruption">{announcement}</div>
        )}
      </div>
    ),
    [vehicleTypeEstonian, vehicle.lineNum, vehicle.destination, ongoingInterruption, announcement]
  );

  // Check if this vehicle should be hidden based on route selection (memoized)
  const isHidden = useMemo(
    () => {
      if (!selectedRoute.line) return false;
      // Filter by both line number AND vehicle type
      return (
        selectedRoute.line !== vehicle.lineNum ||
        (selectedRoute.type !== null && selectedRoute.type !== vehicle.type)
      );
    },
    [selectedRoute.line, selectedRoute.type, vehicle.lineNum, vehicle.type]
  );

  // Handle marker click to show route (matches vanilla behavior)
  const handleMarkerClick = useCallback(() => {
    setSelectedRoute({
      type: vehicle.type,
      line: vehicle.lineNum,
      destination: vehicle.destination,
    });
  }, [vehicle.type, vehicle.lineNum, vehicle.destination, setSelectedRoute]);

  // Memoize event handlers - only add if marker is visible
  const eventHandlers = useMemo(
    () => (isHidden ? {} : { click: handleMarkerClick }),
    [handleMarkerClick, isHidden]
  );

  return (
    <Marker
      position={initialPositionRef.current}
      icon={icon}
      opacity={isHidden ? 0 : 1}
      ref={markerRef}
      eventHandlers={eventHandlers}
      interactive={!isHidden}
    >
      {!isHidden && <Popup autoPan={false}>{popupContent}</Popup>}
    </Marker>
  );
});
