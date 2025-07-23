const map = L.map("map").setView([59.437, 24.7535], 13); // Centered on Tallinn

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(map);

const markers = {};
const textMarkers = {};
const interruptions = {};
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
  console.log("Fetching data...");
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
        seen.add(key);

        const latNum = parseFloat(lat) / 1e6;
        const lonNum = parseFloat(lon) / 1e6;

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
          if (announcement) {
            announcement = "<br>" + announcement;
          }
          ongoingInterruption = true;
        }

        const vehicleType = vehiclesInEstonian[type];
        const label = `${vehicleType} ${lineNum} → ${destination} ${announcement}`;

        const iconType = vehicleType;
        const iconName = `${iconType}${
          ongoingInterruption ? "Warning" : ""
        }Icon.svg`;
        const vehicleIcon = L.divIcon({
          html: `<img src="../assets/${iconName}" style="width: 24px; height: 24px; transform: rotate(${direction}deg); transition: transform 1s ease;" />`,
          className: `vehicle-${key}`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Avoid animation after user returns to the page
        if (lastUpdate && Date.now() - lastUpdate > 30000) {
          console.log("Skipping animation");
          markers[key].setLatLng([lat, lng]);
          textMarkers[key].setLatLng([lat, lng]);
        } else if (markers[key]) {
          // Animate to new position
          const currentLatLng = markers[key].getLatLng();
          const newLatLng = L.latLng(latNum, lonNum);

          // Smooth movement animation
          let startTime = null;
          const duration = 6000; // 6 seconds

          function animateMarker(timestamp) {
            if (!markers[key] || !textMarkers[key]) return;
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            const lat =
              currentLatLng.lat +
              (newLatLng.lat - currentLatLng.lat) * progress;
            const lng =
              currentLatLng.lng +
              (newLatLng.lng - currentLatLng.lng) * progress;

            // Update rotation during animation using CSS
            const markerElement = markers[key].getElement();
            if (markerElement) {
              const imgElement = markerElement.querySelector("img");
              if (imgElement) {
                imgElement.style.transform = `rotate(${direction}deg)`;
              }
            }

            markers[key].setLatLng([lat, lng]);
            textMarkers[key].setLatLng([lat, lng]);

            if (progress < 1) {
              lastUpdate = Date.now();
              requestAnimationFrame(animateMarker);
            }
          }

          requestAnimationFrame(animateMarker);
        } else {
          console.log("Adding new marker for key:", key);
          markers[key] = L.marker([latNum, lonNum], {
            icon: vehicleIcon,
            riseOnHover: true,
            riseOffset: 100,
          })
            .addTo(map)
            .bindPopup(label);

          // Add line number text
          const divIcon = L.divIcon({
            html: `<div style="color: ${
              ongoingInterruption ? "yellow" : "white"
            }; font-weight: bold; font-size: 10px; text-align: center; line-height: 24px; transition: all 1s ease;">${lineNum}</div>`,
            className: "",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          textMarkers[key] = L.marker([latNum, lonNum], {
            icon: divIcon,
          })
            .addTo(map)
            .bindPopup(label);
        }
      });

      // Remove markers that weren't updated this cycle
      for (const key in markers) {
        if (!seen.has(key)) {
          console.log("Removing marker for key:", key);
          map.removeLayer(markers[key]);
          map.removeLayer(textMarkers[key]);
          delete markers[key];
          delete textMarkers[key];
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
fetchInterruptions();
fetchData();
setInterval(fetchData, 6000);
