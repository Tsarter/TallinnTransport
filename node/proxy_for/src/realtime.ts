/*
Workaround for the cors.

Proxied from nginx 
*/

import express from "express";
import cors from "cors";

import apicache from "apicache";
apicache.options({ headers: { "Cache-Control": "public, max-age=10" } }); // Set default cache headers
let cache = apicache.middleware;
import { getRouteCoordinatesFromDB } from "./utils/routeUtils.js";
import {
  getStopsFromDB,
  getNextDeparturesByStopId,
  getStopsByRoute,
} from "./utils/stopsUtils.js";
import { mapTallinnLiveDeparturesResponseToJson, mapElronTrainsToCsv } from "./utils/mapper.js";
import type { ElronApiResponse } from "./utils/types.js";
import { error } from "console";

apicache.clear();
const app = express();
app.use(cors());

// Configure the proxy middleware
app.get(
  "/gps",

  cache("5 seconds"),
  async (req, res) => {
    try {
      const time = Date.now();
      const tltUrl = "https://transport.tallinn.ee/gps.txt?" + time;
      const elronUrl = "https://elron.ee/map_data.json?nocache=" + time;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      let errorMsg = "";
      //console.log(`Fetching GPS data from: ${url}`);
      const tltPromise = fetch(tltUrl, { signal: controller.signal });
      const elronPromise = fetch(elronUrl, { signal: controller.signal });
      let tltResponse, elronResponse;
      try {
        [tltResponse, elronResponse] = await Promise.all([
          tltPromise,
          elronPromise,
        ]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          errorMsg += `Fetch request timed out for ${req.url}`;
        } else {
          errorMsg += String(err);
        }
      } finally {
        clearTimeout(timeout);
      }

      if (!tltResponse?.ok && !elronResponse?.ok) {
        return res
          .status(tltResponse?.status || 500)
          .send("Error fetching GPS data for both TLT and Elron");
      }

      // Fetch TLT data (buses, trams, trolleys)
      let tltData = tltResponse?.ok ? await tltResponse.text() : "";

      // Fetch Elron data (trains) and convert to CSV format
      let elronCsv = "";
      if (elronResponse?.ok) {
        const elronJson = await elronResponse.json() as ElronApiResponse;
        if (elronJson.status === 1 && elronJson.data && elronJson.data.length > 0) {
          elronCsv = mapElronTrainsToCsv(elronJson.data);
        }
      }

      // Combine TLT and Elron data
      let combinedData = tltData;
      if (elronCsv) {
        combinedData = tltData ? `${tltData}\n${elronCsv}` : elronCsv;
      }

      res.send(combinedData);
    } catch (error) {
      console.error(`Error fetching GPS data:`, error);
      res.status(500).send("Internal server error");
    }
  }
);

app.get("/route", cache("6 hours"), async (req, res) => {
  const { line, destination, type } = req.query;

  if (!line || !destination || !type) {
    return res
      .status(400)
      .json({ error: "Missing line, destination, or type query param" });
  }

  try {
    const coords = await getRouteCoordinatesFromDB({
      line: String(line),
      destination: String(destination),
      type: String(type),
    });
    res.json(coords);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/stops", async (_, res) => {
  try {
    const stops = await getStopsFromDB();
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/route/stops", cache("6 hours"), async (req, res) => {
  const { line, destination, type } = req.query;

  if (!line || !destination || !type) {
    return res
      .status(400)
      .json({ error: "Missing line, destination, or type query param" });
  }

  try {
    const stops = await getStopsByRoute({
      line: String(line),
      destination: String(destination),
      type: String(type),
    });
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/stops/:stopId/departures", async (req, res) => {
  try {
    const stopId = parseInt(req.params.stopId, 10);
    req.query.limit = req.query.limit as string || "5";
    const limit = Math.min(parseInt(req.query.limit, 10), 20);
    if (isNaN(stopId)) {
      return res.status(400).json({ error: "Invalid or missing stopId" });
    }
    const url =
      "https://transport.tallinn.ee/siri-stop-departures.php?stopid=" + stopId;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    // After given time abort connection.
    let fetchPromise = fetch(url, { signal: controller.signal }).finally(() =>
      clearTimeout(timeout)
    );
    let dbPromise = getNextDeparturesByStopId(stopId);
    let response, departures;
    try {
      [response, departures] = await Promise.all([fetchPromise, dbPromise]);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        response = { ok: false, text: async () => "Fetch request timed out" };
        departures = await dbPromise;
      } else {
        throw err;
      }
    }
    let result = [];
    if (response.ok) {
      const text = await response.text();
      const realtimeDepartures = mapTallinnLiveDeparturesResponseToJson(text);
      result = departures
        .map((departure) => {
          const rt = realtimeDepartures.find(
            (rtDep) =>
              rtDep.scheduleTime === departure.departure_time &&
              rtDep.destination === departure.trip_headsign
          );
          return {
            ...departure,
            departure_time: rt ? rt.expectedTime : departure.departure_time,
            is_realtime: !!rt,
          };
        })
        .filter((dep) => {
          const [hours, minutes, seconds] = dep.departure_time.split(":");
          const now = new Date();
          const given = new Date();
          given.setHours(hours, minutes, seconds, 0);

          if (!dep.is_realtime && given < now) {
            
            return false;
          }
          return true;
        });
    } else {
      console.log("Response", await response.text());
      result = departures;
    }
    result = result.slice(0, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});


// Start the server
const port = 3001;
app.listen(port, '127.0.0.1', () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
