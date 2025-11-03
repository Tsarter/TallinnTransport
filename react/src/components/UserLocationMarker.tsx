/**
 * UserLocationMarker component to display user's current location on the map
 */

import { CircleMarker, Popup } from "react-leaflet";
import { useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";

export function UserLocationMarker() {
  const { location, requestLocation, watchLocation } = useGeolocation();

  useEffect(() => {
    // Request location once on mount
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    // Start watching location updates after first successful location
    if (location) {
      watchLocation();
    }
  }, [location, watchLocation]);

  if (!location) {
    return null;
  }

  return (
    <CircleMarker
      center={[location.lat, location.lon]}
      radius={10}
      pathOptions={{
        color: "white",
        fillColor: "blue",
        fillOpacity: 0.8,
        weight: 2,
      }}
      pane="userLocationPane"
    >
      <Popup>Sinu asukoht</Popup>
    </CircleMarker>
  );
}
