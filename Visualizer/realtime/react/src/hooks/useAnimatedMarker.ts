/**
 * Custom hook for smooth marker animation using RequestAnimationFrame
 * Replicates the 6-second smooth animation from vanilla implementation
 */

import { useEffect, useRef } from 'react';
import type { LatLngExpression } from 'leaflet';

const ANIMATION_DURATION = 6000; // 6 seconds to match vanilla

interface AnimationOptions {
  targetPosition: LatLngExpression;
  currentPosition: LatLngExpression;
  rotation: number;
  onUpdate?: (position: LatLngExpression, rotation: number, progress: number) => void;
  shouldAnimate: boolean; // Based on time since last update
}

export function useAnimatedMarker({
  targetPosition,
  currentPosition,
  rotation,
  onUpdate,
  shouldAnimate,
}: AnimationOptions) {
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startPositionRef = useRef<LatLngExpression>(currentPosition);

  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      startTimeRef.current = null;
    }

    // Update start position to current position for new animation
    startPositionRef.current = currentPosition;

    if (!shouldAnimate || !onUpdate) {
      // If we shouldn't animate, update immediately
      if (onUpdate) {
        onUpdate(targetPosition, rotation, 1);
      }
      return;
    }

    // Extract starting coordinates
    const [startLat, startLng] = Array.isArray(startPositionRef.current)
      ? startPositionRef.current
      : [startPositionRef.current.lat, startPositionRef.current.lng];

    // Extract target coordinates
    const [targetLat, targetLng] = Array.isArray(targetPosition)
      ? targetPosition
      : [targetPosition.lat, targetPosition.lng];

    // Animate to new position
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      // Linear interpolation from start to target
      const lat = startLat + (targetLat - startLat) * progress;
      const lng = startLng + (targetLng - startLng) * progress;

      if (onUpdate) {
        onUpdate([lat, lng], rotation, progress);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        startTimeRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition, rotation, onUpdate, shouldAnimate]); // Removed currentPosition from deps
}
