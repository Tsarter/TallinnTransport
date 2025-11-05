/**
 * UserLocationMarker component to display user's current location on the map
 * with directional indicator (like Google Maps / Apple Maps)
 */

import { CircleMarker, Popup, Polygon } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useMapStore } from "../store/mapStore";
import type { LatLngExpression } from "leaflet";

/**
 * Calculate cone/wedge points for directional indicator
 * @param lat Center latitude
 * @param lon Center longitude
 * @param heading Direction in degrees (0 = north, 90 = east, etc.)
 * @param radius Cone radius in meters
 * @param arcAngle Arc angle of the cone in degrees
 * @returns Array of [lat, lon] points forming the cone
 */
function calculateDirectionalCone(
  lat: number,
  lon: number,
  heading: number,
  radius: number = 150,
  arcAngle: number = 90
): LatLngExpression[] {
  // Convert to radians
  const headingRad = (heading * Math.PI) / 180;
  const halfArcRad = ((arcAngle / 2) * Math.PI) / 180;

  // Earth's radius in meters
  const earthRadius = 6371000;

  // Calculate offset in degrees for the radius
  const latOffset = (radius / earthRadius) * (180 / Math.PI);
  const lonOffset =
    (radius / (earthRadius * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI);

  // Create cone points
  const points: LatLngExpression[] = [];

  // Center point (apex of cone)
  points.push([lat, lon]);

  // Create arc points for the cone
  const numPoints = 20; // Number of points along the arc
  for (let i = 0; i <= numPoints; i++) {
    const angle = headingRad - halfArcRad + (i / numPoints) * (2 * halfArcRad);
    const pointLat = lat + latOffset * Math.cos(angle);
    const pointLon = lon + lonOffset * Math.sin(angle);
    points.push([pointLat, pointLon]);
  }

  // Close the polygon back to center
  points.push([lat, lon]);

  return points;
}

export function UserLocationMarker() {
  const { requestLocation, watchLocation, checkPermission } = useGeolocation();
  const location = useMapStore((state) => state.userLocation);

  useEffect(() => {
    // Only auto-request location if permission was previously granted
    const checkAndRequestLocation = async () => {
      const permission = await checkPermission();

      // Only auto-request if permission is 'granted'
      // If 'prompt' or 'denied', wait for user to click the LocationButton
      if (permission === "granted") {
        requestLocation();
      }
    };

    checkAndRequestLocation();
  }, [requestLocation, checkPermission]);

  useEffect(() => {
    // Start watching location updates after first successful location
    if (location) {
      watchLocation();
    }
  }, [location, watchLocation]);

  // Calculate directional cone points when heading is available
  const conePoints = useMemo(() => {
    if (!location) {
      return null;
    }
    // Use heading if available, otherwise don't show cone
    const heading = location.heading;
    if (heading === null) {
      return null;
    }
    return calculateDirectionalCone(
      location.lat,
      location.lon,
      heading,
      150, // larger radius for visibility (meters)
      90 // wider arc angle
    );
  }, [location]);

  if (!location) {
    return null;
  }

  return (
    <>
      {conePoints && (
        <Polygon
          positions={conePoints}
          pathOptions={{
            color: "#4285F4",
            fillColor: "#4285F4",
            fillOpacity: 0.3,
            weight: 0,
          }}
          pane="userLocationPane"
          interactive={false}
        />
      )}

      <CircleMarker
        center={[location.lat, location.lon]}
        radius={10}
        pathOptions={{
          color: "white",
          fillColor: "#4285F4",
          fillOpacity: 1,
          weight: 3,
        }}
        pane="userLocationPane"
      >
        <Popup>Sinu asukoht</Popup>
      </CircleMarker>
    </>
  );
}
