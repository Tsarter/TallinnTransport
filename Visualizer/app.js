const map = L.map("map").setView([59.46194, 24.66775], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let busData = [];
let currentIndex = 0; // Keep track of the current index
let playbackInterval; // To store the playback interval

// Fetch the combined bus data
fetch("combined_bus_data.json")
  .then((response) => response.json())
  .then((data) => {
    busData = preparePlaybackData(data);
    startPlayback(); // Start the playback after data is prepared
  })
  .catch((error) => {
    console.error("Error loading bus data:", error);
  });

// Prepare data for playback
function preparePlaybackData(data) {
  const preparedData = {};

  // Group buses by timestamp
  data.features.forEach((feature) => {
    const timestamp = feature.properties.timestamp;
    const lat = feature.geometry.coordinates[1];
    const lng = feature.geometry.coordinates[0];
    const type = feature.properties.type;
    const line = feature.properties.line;

    // Initialize the array if it doesn't exist
    if (!preparedData[timestamp]) {
      preparedData[timestamp] = [];
    }

    // Push the coordinates into the array for the timestamp
    preparedData[timestamp].push({ lat, lng, type, line });
  });

  // Convert the object back to an array of timestamps and positions
  return Object.entries(preparedData).map(([timestamp, positions]) => ({
    timestamp,
    positions,
  }));
}

// Start the playback
function startPlayback() {
  // Clear any existing intervals
  if (playbackInterval) {
    clearInterval(playbackInterval);
  }

  // Set an interval to update the map every second
  playbackInterval = setInterval(() => {
    if (currentIndex < busData.length) {
      const { positions, timestamp } = busData[currentIndex];

      // Clear existing markers from the previous time step
      clearMarkers();
      // Initialize markers and bind click event
      positions.forEach(({ lat, lng, type, line }) => {
        let color;
        if (type === 1) {
          color = "red"; // Trams
        } else if (type === 2) {
          color = "green"; // Buses
        } else if (type === 3) {
          color = "blue"; // Trolleys
        }
        const marker = L.circleMarker([lat, lng], {
          radius: 5,
          color: color,
          fillOpacity: 0.8,
        }).addTo(map);

        // Attach click event to marker to fetch and display route
        marker.on("click", (e) => onMarkerClick(e, type, line));
      });

      // Update the current timestamp display
      document.getElementById(
        "current-time"
      ).textContent = `Current Time: ${new Date(timestamp).toLocaleString()}`;

      // Increment the index for the next time step
      currentIndex++;
    } else {
      // Stop playback if we reached the end
      clearInterval(playbackInterval);
      currentIndex = 0; // Reset index if you want to loop again
    }
  }, 1000); // Update every second (1000 ms)
}

// Clear existing markers from the map
function clearMarkers() {
  map.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      map.removeLayer(layer);
    }
  });
}
// Clear existing Polylines from the map
function clearPolylines() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
}

// Additional functions for play, pause, and reset
document.getElementById("play").onclick = startPlayback;
document.getElementById("pause").onclick = pausePlayback;
document.getElementById("reset").onclick = resetPlayback;

function pausePlayback() {
  clearInterval(playbackInterval);
}

function resetPlayback() {
  clearInterval(playbackInterval);
  currentIndex = 0; // Reset index
  clearMarkers(); // Clear markers from the map
  document.getElementById("current-time").textContent = ""; // Clear the displayed time
}

// Function to decode the encoded polyline
function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat * 1e-5, lng * 1e-5]);
  }

  return points;
}

// Function to fetch and display the route when a marker is clicked
function fetchAndDisplayRoute(type, lineNumber, marker) {
  let vehicleType;
  if (type === 1) vehicleType = "trol";
  else if (type === 2) vehicleType = "bus";
  else if (type === 3) vehicleType = "tram";

  const routeFileName = `${vehicleType}_${lineNumber}_routes.txt`;

  fetch(`routes_folder/${routeFileName}`)
    .then((response) => response.text())
    .then((routeData) => {
      // Assuming the route data has the encoded polyline after each a-b, b-a block
      const route = routeData.split("\n")[1]; // Simplified: using second line

      // Decode the route
      const routePoints = decodePolyline(route);

      // Draw the route on the map
      const polyline = L.polyline(routePoints, {
        color: "blue",
        weight: 5,
        opacity: 0.7,
      }).addTo(map);

      // Optionally, bind popup to show route details
      marker.bindPopup(`Route: ${vehicleType} ${lineNumber}`).openPopup();
    })
    .catch((error) => {
      console.error("Error loading route data:", error);
      marker.bindPopup("Route not available").openPopup();
    });
}

// Marker click event handler
function onMarkerClick(e, type, lineNumber) {
  clearPolylines();
  const marker = e.target;

  // Fetch and display the route for this bus/tram/trolley line
  fetchAndDisplayRoute(type, lineNumber, marker);
}
