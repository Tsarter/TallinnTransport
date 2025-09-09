let map = L.map("map").setView([59.4372, 24.7454], 13); // Centered on Tallinn

let userLocationMarker = null;
let userLat = null;
let userLon = null;
let userZoom = 15; // Default zoom level for user location
let userDevice = null; // Mobile or Desktop

if (/Mobi|Android/i.test(navigator.userAgent)) {
  userDevice = "Mobile";
} else {
  userDevice = "Desktop";
}

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

let selectedStop = null;
let selectedRoute = { type: null, line: null, destination: null };
const markers = {};
const textMarkers = {};
const popups = {};
const interruptions = {};
const gpsLocations = {};
let stops = {};
const stopMarkers = {};
let previousRoute = null;
const previousDestinations = {};
const previousZoom = userZoom;
const vehiclesInEstonian = {
  3: "Tramm",
  10: "Rong",
  2: "Buss",
  7: "Buss",
};
const vehiclesEnglishToEstonian = {
  tram: "Tramm",
  bus: "Buss",
  regionalbus: "Buss",
  train: "Rong",
};
const vehiclesEnglishToNum = {
  tram: 3,
  bus: 2,
  regionalbus: 2,
  train: 10,
};
let lastUpdate = 0;
function minutesUntilDeparture(hhmmss) {
  const [h, m, s] = hhmmss.split(":").map(Number);

  const now = new Date();
  const departure = new Date(now);

  departure.setHours(h, m, s, 0);

  let diffMs = departure - now;

  // If departure is "past midnight" (e.g. GTFS 24:xx:xx or tomorrow)
  if (diffMs < 0) {
    departure.setDate(departure.getDate() + 1);
    diffMs = departure - now;
  }

  return Math.floor(diffMs / 60000); // minutes
}

function formattedDepartureTime(hhmmss) {
  // Format departure time to show only hours and rounded minutes, no seconds
  let [h, m, s] = hhmmss.split(":").map(Number);
  if (s >= 30) m += 1;
  if (m === 60) {
    m = 0;
    h += 1;
  }
  const formattedTime = `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`;
  return formattedTime;
}

function stopPopupRowCallback(type, lineNum, destination) {
  addRouteToMap(type, lineNum, destination);
  selectedRoute = { type, line: lineNum, destination };
}
async function createStopMarkerPopUp(stopData, stopMarker) {
  let popupContent = `<div class="stop-popup-header">${stopData.stop_name}</div>`;
  try {
    const departures = await fetchStopDepartures(stopData.stop_id);

    if (departures && Array.isArray(departures) && departures.length > 0) {
      const grouped = {};
      departures.forEach((dep) => {
        if (!grouped[dep.route_id]) grouped[dep.route_id] = [];
        grouped[dep.route_id].push(dep);
      });

      for (const [_, deps] of Object.entries(grouped)) {
        deps.sort(
          (a, b) =>
            minutesUntilDeparture(a.departure_time) -
            minutesUntilDeparture(b.departure_time)
        );
        const top3 = deps.slice(0, 3);
        const first = top3[0];

        const vehicleTypeEstonian =
          vehiclesEnglishToEstonian[first.route_id.split("_")[1]];
        const vehcileTypeNum =
          vehiclesEnglishToNum[first.route_id.split("_")[1]];
        const { ongoingInterruption, announcement } = checkInterruption({
          lineNum: first.route_short_name,
          type: vehcileTypeNum,
          destination: first.trip_headsign,
          noLineBreaks: true,
        });
        console.log(
          "Ongoung interrupiton",
          ongoingInterruption,
          first.route_short_name,
          first.route_id.split("_")[1],
          vehiclesEnglishToNum[first.route_id.split("_")[1]],
          first.trip_headsign
        );
        const vehicleIconName = chooseVehicleIcon({
          iconType: vehicleTypeEstonian,
          ongoingInterruption,
        });
        const earliestTil = minutesUntilDeparture(first.departure_time);

        // format all times for this route
        const timesHtml = top3
          .map((d) => `${formattedDepartureTime(d.departure_time)}`)
          .join(" ");
        const isRealtime = first.scheduled_time !== first.departure_time;
        console.log(
          "isRealtime",
          first.route_short_name,
          isRealtime,
          first.scheduled_time,
          first.departure_time
        );
        const timeClass = isRealtime ? "realtime-time" : "scheduled-time";
        popupContent += `
            <div class="stop-popup-departure-row" onClick="stopPopupRowCallback('${vehcileTypeNum}', '${
          first.route_short_name
        }', '${first.trip_headsign}')">
              <div class="bus-icon-wrapper">
                <img src="../assets/${vehicleIconName}" class="bus-icon"/>
                <span class="bus-icon-text">${first.route_short_name}</span>
              </div>
              <div class="stop-popup-departure-info">
                <div style="font-weight: bolder">${first.trip_headsign}</div> 
                <div class="departure-times">${timesHtml}</div>
              </div>
              <div class="${timeClass}">
                ${earliestTil} min
              </div>
            </div>
            ${
              ongoingInterruption
                ? `<div class="stop-popup-interruption">${announcement}</div>`
                : ""
            }`;
      }
      popupContent += "</div>";
    } else {
      popupContent += "<br><br>Väljumisi ei leitud.";
    }
  } catch (e) {
    console.error("Error fetching stop departures:", e);
    popupContent += "<br><br>Väljumisi ei leitud.";
  }
  stopMarker.getPopup().setContent(popupContent);
  stopMarker.openPopup();

  let mapClickCounter = 0;
  stopMarker.getPopup().on("remove", () => {
    console.log(`Popup for stop ${stopData.stop_id} closed.`);
    mapClickCounter = 1;
  });
  map.on("click", function onMapClick() {
    if (mapClickCounter >= 2) {
      mapClickCounter = 0;
      selectedRoute = { type: null, line: null, destination: null };
      selectedStop = null;
      if (previousRoute) {
        map.removeLayer(previousRoute);
        previousRoute = null;
      }
      map.off("click", onMapClick);
    } else {
      mapClickCounter++;
    }
  });
}

function checkInterruption(options) {
  const { lineNum, type, destination, noLineBreaks } = options;

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
      announcement = noLineBreaks
        ? info + " " + announcement
        : "<br>" + info + "<br>" + announcement;
    }
    ongoingInterruption = true;
  }
  return { announcement, ongoingInterruption };
}

function chooseVehicleIcon(options) {
  const { iconType, ongoingInterruption } = options;
  const iconName = `${iconType}${ongoingInterruption ? "Warning" : ""}Icon.svg`;
  return iconName;
}

function createVehicleIcon(options) {
  const { key, ongoingInterruption, style } = options;
  const iconType = vehiclesInEstonian[gpsLocations[key].type] || "Buss";
  const iconName = chooseVehicleIcon({ iconType, ongoingInterruption });
  const vehicleIcon = L.divIcon({
    html: `<img src="../assets/${iconName}" style="${style}" />`,
    className: `vehicle-${key}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  return vehicleIcon;
}

function createStopMarker(stopData) {
  const stopIcon = L.divIcon({
    html: `<img class="stop-icon-img" src="../assets/StopIcon.svg" style="width: 14px; height: 14px;" />`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: "stop-icon",
  });

  const stopMarker = L.marker([stopData.lat, stopData.lon], {
    icon: stopIcon,
  }).bindPopup(`${stopData.stop_name}`);

  stopMarker.on("click", async () => {
    if (!selectedStop || selectedStop.stop_id !== stopData.stop_id) {
      if (previousRoute) {
        map.removeLayer(previousRoute);
        previousRoute = null;
      }
      selectedRoute = { type: null, line: null, destination: null };
    }
    selectedStop = stopData;
    createStopMarkerPopUp(stopData, stopMarker);
  });

  stopMarkers[stopData.stop_code] = stopMarker;
}

function createStopMarkers(stopsArray) {
  stopsArray.forEach((stop) => {
    createStopMarker(stop);
  });
}

function updateVisibleStopMarkers() {
  const bounds = map.getBounds();
  const zoom = map.getZoom();
  Object.values(stops).forEach((stop) => {
    if (selectedStop && stop.stop_id === selectedStop.stop_id) {
      return;
    }
    const latlng = L.latLng(stop.lat, stop.lon);
    if (
      bounds.contains(latlng) &&
      ((userDevice == "Desktop" && zoom >= 15) ||
        (userDevice == "Mobile" && zoom >= 14))
    ) {
      stopMarkers[stop.stop_code].addTo(map);
    } else if (map.hasLayer(stopMarkers[stop.stop_code])) {
      map.removeLayer(stopMarkers[stop.stop_code]);
    }
  });
}

function fetchStops() {
  fetch("/proxy/stops")
    .then((res) => res.json())
    .then((data) => {
      stops = data;
      createStopMarkers(stops);
    })
    .catch((error) => {
      console.error("Error fetching stops:", error);
    });
}

async function fetchStopDepartures(stopId) {
  let stopDepartures = [];
  await fetch(`/proxy/stops/${stopId}/departures?limit=10`)
    .then((res) => res.json())
    .then((data) => {
      stopDepartures = data;
    })
    .catch((error) => {
      console.error("Error fetching stop departures:", error);
    });
  return stopDepartures;
}

async function fetchRealtimeStopDepartures(stopId) {
  let realtimeStopDepartures = [];
  await fetch(`/proxy/stops/${stopId}/departures/realtime?limit=10`)
    .then((res) => res.json())
    .then((data) => {
      realtimeStopDepartures = data;
    })
    .catch((error) => {
      console.error("Error fetching stop departures:", error);
    });
  return realtimeStopDepartures;
}

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

/**
 * Generates a unique key string by combining the vehicle type and vehicle ID.
 *
 * @param {number} type
 * @param {number} vehicleId
 * @returns {string}
 */
function getKey(type, vehicleId) {
  return `${type}-${vehicleId}`;
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
        const key = getKey(type, vehicleId);

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
        const { announcement, ongoingInterruption } = checkInterruption({
          lineNum,
          type,
          destination,
        });

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

async function addRouteToMap(type, lineNum, destination) {
  if (previousRoute) {
    map.removeLayer(previousRoute);
    previousRoute = null;
  }
  const routeCoordinates = await fetchRouteData(type, lineNum, destination);
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

    const markerElement = markers[key].getElement();
    const textMarkerElement = textMarkers[key].getElement();

    if (selectedRoute.line && selectedRoute.line != gpsLocations[key].lineNum) {
      if (markerElement) {
        markerElement.style.display = "none"; // Hide marker using CSS
      }
      if (textMarkerElement) {
        textMarkerElement.style.display = "none"; // Hide text marker using CSS
      }
    } else {
      if (markerElement) {
        markerElement.style.display = "block"; // Show marker using CSS
      }
      if (textMarkerElement) {
        textMarkerElement.style.display = "block"; // Show text marker using CSS
      }
    }
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);

    const lat =
      currentLatLng.lat + (newLatLng.lat - currentLatLng.lat) * progress;
    const lng =
      currentLatLng.lng + (newLatLng.lng - currentLatLng.lng) * progress;

    // Update rotation during animation using CSS
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

  const vehicleIconStyle = `width: 24px; height: 24px; transform: rotate(${gpsLocations[key].direction}deg); transition: transform 1s ease;`;
  const vehicleIcon = createVehicleIcon({
    key,
    ongoingInterruption,
    style: vehicleIconStyle,
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
      addRouteToMap(
        gpsLocations[key].type,
        gpsLocations[key].lineNum,
        gpsLocations[key].destination,
        close
      );
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

fetchStops();
fetchInterruptions();
fetchData();
setInterval(fetchData, 6000);
updateVisibleStopMarkers();
map.on("moveend", updateVisibleStopMarkers);
