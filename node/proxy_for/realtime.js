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
import { getStopsFromDB, getNextDeparturesByStopId } from "./utils/stopsUtils.js";

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
      const url = "https://transport.tallinn.ee/gps.txt?" + time;

      //console.log(`Fetching GPS data from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Non-200 GPS response: ${response.status} for ${req.url}`);
        return res.status(response.status).send("Error fetching GPS data");
      }

      const data = await response.text();
      //console.log(`GPS request successful: ${req.method} ${req.url}`);
      res.send(data);
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
      line,
      destination,
      type,
    });
    res.json(coords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
app.get("/stops", async (_, res) => {
  try {
    const stops = await getStopsFromDB();
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/stops/:stopId/departures", async (req, res) => {
  try {
    const stopId = parseInt(req.params.stopId, 10);
    const limit = parseInt(req.query.limit, 10) || 5;
    if (isNaN(stopId)) {
      return res.status(400).json({ error: "Invalid or missing stopId" });
    }

    const departures = await getNextDeparturesByStopId(stopId, limit);
    res.json(departures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
