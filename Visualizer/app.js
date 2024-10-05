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

    // Initialize the array if it doesn't exist
    if (!preparedData[timestamp]) {
      preparedData[timestamp] = [];
    }

    // Push the coordinates into the array for the timestamp
    preparedData[timestamp].push({ lat, lng });
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

      // Add markers for all buses at the current timestamp
      positions.forEach(({ lat, lng }) => {
        const marker = L.circleMarker([lat, lng], {
          radius: 5,
          color: "red",
          fillOpacity: 0.8,
        }).addTo(map);

        // Bind a popup with the timestamp
        marker.bindPopup(`Time: ${new Date(timestamp).toLocaleString()}`);
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
