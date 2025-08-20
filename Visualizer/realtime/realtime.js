let map = L.map("map").setView([59.4372, 24.7454], 13); // Centered on Tallinn

let userLocationMarker = null;
let userLat = null;
let userLon = null;
let userZoom = 15; // Default zoom level for user location

function geolocationSuccessWatch(position) {
  userLat = position.coords.latitude;
  userLon = position.coords.longitude;
  console.log("User's location:", userLat, userLon);

  userLocationMarker.setLatLng([userLat, userLon]);
}
function geolocationSuccessGet(position) {
  userLat = position.coords.latitude;
  userLon = position.coords.longitude;

  map.setView([userLat, userLon], userZoom); // Centered on user's location
  if (!userLocationMarker) {
    userLocationMarker = L.circleMarker([userLat, userLon], {
      radius: 7,
      color: "white",
      fillColor: "blue",
      stroke: true,
      weight: 2,
      fillOpacity: 0.8,
    })
      .bindPopup("Sinu asukoht")
      .addTo(map);
    navigator.geolocation.watchPosition(
      geolocationSuccessWatch,
      geolocationError
    );
  }
}

function geolocationError(error) {
  console.error("Geolocation error:", error);
  alert("Asukoha määramine ebaõnnestus.");
  // Default Tallinn location is used for map, don't change view
}

// Center map to user location when button is clicked
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("center-user-btn");
  if (btn) {
    btn.addEventListener("click", function () {
      if (userLat && userLon) {
        map.setView([userLat, userLon], userZoom);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          geolocationSuccessGet,
          geolocationError
        );
      } else {
        alert("Asukoha määramine ei ole toetatud.");
      }
    });
  }
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(map);

const markers = {};
const textMarkers = {};
const popups = {};
const interruptions = {};
const gpsLocations = {};
let previousRoute = null;
const previousDestinations = {};
const vehiclesInEstonian = {
  3: "Tramm",
  10: "Rong",
  2: "Buss",
};
let lastUpdate = Date.now();

function fetchInterruptions() {
  fetch("/transport_data/transport_data/interruptions_data/ongoing.json")
    .then((res) => res.json())
    .then((rawInterruptions) => {
      for (const data of rawInterruptions) {
        console.log("data", data);
        for (const route of data.routes.split(",")) {
          let cleanedRoute = "";
          let destination = "";
          if (route.includes("->")) {
            [cleanedRoute, destination] = route
              .split("->")
              .map((s) => s.trim());
          } else {
            cleanedRoute = route.trim();
            destination = "both";
          }
          const interruption = {
            transport: data.transport,
            route: cleanedRoute,
            destination: destination,
            start_time: data.start_time,
            announcement: data.announcement,
            info: data.info,
          };

          const key = `${cleanedRoute}-${data.transport}-${destination}`;
          console.log("Key:", key);
          interruptions[key] = interruption;
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching interruptions:", error);
    });
}

function fetchData() {
  if (document.hidden) {
    console.log("Window is not active, skipping data fetch.");
    return;
  }
  console.log("Current time:", new Date().toLocaleTimeString());
  fetch(`/proxy/gps`)
    .then((res) => res.text())
    .then((data) => {
      const lines = data.trim().split("\n");

      const seen = new Set();

      lines.forEach((line) => {
        const [
          type,
          lineNum,
          lon,
          lat,
          ,
          direction,
          vehicleId,
          ,
          tripId,
          destination,
        ] = line.split(",");

        const key = `${type}-${vehicleId}`;

        const latNum = parseFloat(lat) / 1e6;
        const lonNum = parseFloat(lon) / 1e6;

        gpsLocations[key] = {
          type,
          lineNum,
          lonNum,
          latNum,
          direction,
          vehicleId,
          tripId,
          destination,
        };

        seen.add(key);

        // Check if interruption for this type and line
        const wholeInterruptionKey = `${lineNum}-${vehiclesInEstonian[type]}-both`;
        const partialInterruptionKey = `${lineNum}-${vehiclesInEstonian[type]}-${destination}`;

        let announcement = "";
        let ongoingInterruption = false;
        if (
          wholeInterruptionKey in interruptions ||
          partialInterruptionKey in interruptions
        ) {
          const interruption =
            wholeInterruptionKey in interruptions
              ? interruptions[wholeInterruptionKey]
              : interruptions[partialInterruptionKey];
          const info = interruption.info || "";
          announcement = interruption.announcement || "";
          if (info) {
            announcement = "<br>" + info + "<br>" + announcement;
          }
          ongoingInterruption = true;
        }

        if (markers[key]) {
          if (lastUpdate && Date.now() - lastUpdate > 15000) {
            // Avoid animation after user returns to the page
            markers[key].setLatLng([latNum, lonNum]);
            textMarkers[key].setLatLng([latNum, lonNum]);
            popups[key].setLatLng([latNum, lonNum]);
          } else {
            const options = {
              key,
              announcement,
            };
            markerAnimation(options);
          }
        } else {
          const options = {
            key,
            ongoingInterruption,
            announcement,
          };
          markerCreation(options);
        }
      });
      lastUpdate = Date.now();

      // Remove data that is no longer seen
      for (const key in markers) {
        if (!seen.has(key)) {
          map.removeLayer(markers[key]);
          map.removeLayer(textMarkers[key]);
          delete markers[key];
          delete textMarkers[key];
          delete gpsLocations[key];
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

async function vehicleLabelCallback(key) {
  if (previousRoute) {
    map.removeLayer(previousRoute);
    previousRoute = null;
  }
  const routeCoordinates = await fetchRouteData(
    gpsLocations[key].type,
    gpsLocations[key].lineNum,
    gpsLocations[key].destination
  );
  previousRoute = drawRoute(map, routeCoordinates);
}

function markerAnimation(options) {
  const { key, announcement } = options;
  // Animate to new position
  const currentLatLng = markers[key].getLatLng();
  const newLatLng = L.latLng(
    gpsLocations[key].latNum,
    gpsLocations[key].lonNum
  );

  // Smooth movement animation
  let startTime = null;
  const duration = 6000; // 6 seconds

  // if popups content does not contain current destination, update it
  if (!popups[key].getContent().includes(gpsLocations[key].destination)) {
    console.log(
      `Updating popup content from ${popups[key].getContent()} to ${
        gpsLocations[key].destination
      }, ${announcement}, ${gpsLocations[key].type}, ${
        gpsLocations[key].lineNum
      }`
    );
    // Update popup content
    popups[key].setContent(
      `${vehiclesInEstonian[gpsLocations[key].type]} ${
        gpsLocations[key].lineNum
      } → ${gpsLocations[key].destination} ${announcement}`
    );
  }

  function animateMarker(timestamp) {
    if (!markers[key] || !textMarkers[key]) return;
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);

    const lat =
      currentLatLng.lat + (newLatLng.lat - currentLatLng.lat) * progress;
    const lng =
      currentLatLng.lng + (newLatLng.lng - currentLatLng.lng) * progress;

    // Update rotation during animation using CSS
    const markerElement = markers[key].getElement();
    if (markerElement) {
      const imgElement = markerElement.querySelector("img");
      if (imgElement) {
        imgElement.style.transform = `rotate(${gpsLocations[key].direction}deg)`;
      }
    }

    markers[key].setLatLng([lat, lng]);
    textMarkers[key].setLatLng([lat, lng]);
    popups[key].setLatLng([lat, lng]);

    if (progress < 1) {
      requestAnimationFrame(animateMarker);
    }
  }
  requestAnimationFrame(animateMarker);
  lastUpdate = Date.now();
}

function markerCreation(options) {
  const { key, ongoingInterruption, announcement } = options;

  const vehicleType = vehiclesInEstonian[gpsLocations[key].type] || "Muu";
  const label = `${vehicleType} ${gpsLocations[key].lineNum} → ${gpsLocations[key].destination} ${announcement}`;

  const iconType = vehicleType;
  const iconName = `${iconType}${ongoingInterruption ? "Warning" : ""}Icon.svg`;
  const vehicleIcon = L.divIcon({
    html: `<img src="../assets/${iconName}" style="width: 24px; height: 24px; transform: rotate(${gpsLocations[key].direction}deg); transition: transform 1s ease;" />`,
    className: `vehicle-${key}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  const popup = L.popup({ autoPan: false })
    .setLatLng([gpsLocations[key].latNum, gpsLocations[key].lonNum])
    .setContent(label);
  popups[key] = popup;
  markers[key] = L.marker(
    [gpsLocations[key].latNum, gpsLocations[key].lonNum],
    {
      icon: vehicleIcon,
    }
  ).addTo(map);

  popup.on("remove", () => {
    console.log(`Popup for ${key} closed.`);
    map.removeLayer(previousRoute);
    previousRoute = null;
  });
  // Add line number text
  const divIcon = L.divIcon({
    html: `<div style="color: ${
      ongoingInterruption ? "yellow" : "white"
    }; font-weight: bold; font-size: 10px; text-align: center; line-height: 24px; transition: all 1s ease;">${
      gpsLocations[key].lineNum
    }</div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  textMarkers[key] = L.marker(
    [gpsLocations[key].latNum, gpsLocations[key].lonNum],
    {
      icon: divIcon,
    }
  )
    .addTo(map)
    .on("click", () => {
      map.closePopup(); // optional: close previous popup
      popup.openOn(map);
      vehicleLabelCallback(key);
    });
}

async function fetchRouteData(vehicleType, lineNumber, destination) {
  const response = await fetch(
    `/proxy/route?line=${lineNumber}&type=${vehicleType}&destination=${destination}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const routeCoordinates = await response.json();
  return routeCoordinates;
}

function drawRoute(map, routePoints) {
  const polyline = L.polyline(routePoints, {
    color: "#0d00ffe3",
    weight: 5,
    opacity: 0.7,
  }).addTo(map);
  return polyline;
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    console.log("Window is active, fetching data again.");
    fetchData();
  }
});

fetchInterruptions();
fetchData();
setInterval(fetchData, 6000);
