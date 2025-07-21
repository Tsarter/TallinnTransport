/*
Important!

The routes are served over /api path defined in the nginx configuration file

*/

// Import necessary modules
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../.env")});
const db = require('./postgres');

// Create an Express application
const app = express();
app.use(cors());
const port = 3001;

function getQuery(type, filename) {
  return fs.readFileSync(
    path.join(__dirname.split("src")[0] + "/sql/" + type + "/", filename),
    "utf8"
  );
}

function validateParams(query) {
  const {
    type,
    line,
    date,
    startTime,
    maxSpeed,
    disStops,
    vehicle_id,
    endtime,
    lat1,
    lon1,
    lat2,
    lon2,
    datetime,
  } = query;

  // Validate that date is in YYYY-MM-DD
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Date must be in the format YYYY-MM-DD";
  }
  let inputDate = new Date(date);
  let startDate = new Date("2024-06-06");
  let today = new Date();

  if (inputDate < startDate || inputDate > today) {
    return "Date must be between 6 june 2024 and today";
  }

  for (const timestamp of [startTime, endtime, datetime]) {
    if (timestamp && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      return "Timestamp must be in the format YYYY-MM-DD HH:MM:SS";
    }
  }


  // Validate that lineparam is like this 1,2,3,10,18,84,18A,47B
  const lineRegex = /^(?:\d{1,3}[A-Z]?)$/;
  if (line && !lineRegex.test(line)) {
    return "Line must be a number between 1 and 999 or a number followed by a letter";
  }

  // Validate that maxSpeed is an integer
  if (maxSpeed && !Number.isInteger(Number(maxSpeed))) {
    return "maxSpeed must be an integer";
  }

  if (type && !["", "1", "2", "3"].includes(type)) {
    return "Type must be empty, 1, 2 or 3";
  }

  if (
    disStops &&
    (!Number.isInteger(Number(disStops)) || Number(disStops) > 1000)
  ) {
    return "filter stops is wrong";
  }

  if (vehicle_id && !Number.isInteger(Number(vehicle_id))) {
    return "vehicle_id is wrong";
  }

  // longitude and latitude must be in the format 1.234567
  for (const location in [lat1, lon1, lat2, lon2]) {
    if (location && !/^-?\d+(\.\d+)?$/.test(location)) {
      return "Location is wrong";
    }
  }

  return "";
}

// Define a GET endpoint to query the table
app.get("/speedsegments", tempCacheMiddleware(60),async (req, res) => {
  try {
    console.log(req.query);
    const isValidRes = validateParams(req.query);
    if (isValidRes !== "") {
      console.log(isValidRes);
      return res.status(400).json({ error: isValidRes });
    }

    const { type, line, startTime, endTime, maxSpeed, disStops } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).send("Missing required params");
    }

    try {
      // Put together query string
      let speed_data = getQuery("segment", "speed_data.sql");
      let segment_data = getQuery("segment", "segment_data.sql");
      let select_data = getQuery("segment", "select_data.sql");
      let not_within_stop = getQuery("segment", "not_within_stop.sql");

      // Add the last line dynamically
      speed_data += `datetime BETWEEN '${startTime}' AND  '${endTime}' `;
      speed_data += line ? ` AND line = '${line}' ` : "";
      speed_data += type ? ` AND type = ${type} ` : "";
      speed_data += `AND NOT EXISTS (
      SELECT 1
      FROM depos
      WHERE ST_Within(geom::geometry, depos.location::geometry)
  )`;

      select_data += maxSpeed ? ` AND speed_kmh < ${maxSpeed}` : "";

      let query = "";
      if (disStops) {
        not_within_stop += disStops ? ` ${disStops}` : "";
        query = `${speed_data}), ${segment_data} ${select_data} ${not_within_stop}));`;
      } else {
        // Combine all parts of the query
        query = `${speed_data}), ${segment_data} ${select_data};`;
      }

      console.log(query);
      // Execute the query
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error("Error querying the database:", err);
      res.status(500).send("Internal Server Error");
    }
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/points", tempCacheMiddleware(60),async (req, res) => {
  try {
    const isValidRes = validateParams(req.query);
    if (isValidRes !== "") {
      console.log(isValidRes);
      return res.status(400).json({ error: isValidRes });
    }
    const { type, line, startTime, endTime, maxSpeed } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).send("Missing required params");
    }

    let select = getQuery("points", "points.sql");
    select += `datetime BETWEEN '${startTime}' AND  '${endTime}' `;
    select += line ? ` AND line = '${line}' ` : "";
    select += type ? ` AND type = ${type} ` : "";
    select += maxSpeed ? ` AND speed_kmh < ${maxSpeed}` : "";

    const query = `${select};`;
    console.log(query);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
}
);

app.get("/speedgraph", tempCacheMiddleware(60), async (req, res) => {
  const isValidRes = validateParams(req.query);
  if (isValidRes !== "") {
    console.log(isValidRes);
    return res.status(400).json({ error: isValidRes });
  }
  const { vehicle_id, startTime, tws, disableDepos, line } = req.query;
  if (!vehicle_id || !startTime) {
    return res.status(400).send("vehicle_id and date are required");
  }
  if (!tws) {
    tws = 15;
  }
  try {
    let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + parseInt(tws));
    endTime.setMinutes(endTime.getMinutes() - endTime.getTimezoneOffset());
    endTime = endTime.toISOString().slice(0, 19).replace("T", " ");

    let select = getQuery("speedgraph", "speedgraph.sql");
    let calculatins = getQuery("speedgraph", "speed_calculations.sql");
    select += `vehicle_id = '${vehicle_id}' AND datetime >= '${startTime}' AND datetime < '${endTime}' AND line = '${line}'`;
    if (disableDepos === "true") {
      select += ` AND NOT EXISTS (
        SELECT 1
        FROM depos
        WHERE ST_Within(realtimedata.geom::geometry, depos.location::geometry)
      )`;
    }
    const query = `${select} ), ${calculatins}`;
    console.log(query);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/gridspeeds",cacheMiddlewarePersistent(), async (req, res) => {
  const isValidRes = validateParams(req.query);
  if (isValidRes !== "") {
    console.log(isValidRes);
    return res.status(400).json({ error: isValidRes });
  }
  /* const { vehicle_id, startTime, tws } = req.query;
  if (!vehicle_id || !startTime) {
    return res.status(400).send("vehicle_id and date are required");
  }
  if (!tws) {
    tws = 15;
  } */
  try {
    /* let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + parseInt(tws));
    endTime.setMinutes(endTime.getMinutes() - endTime.getTimezoneOffset());
    endTime = endTime.toISOString().slice(0, 19).replace("T", " "); */

    let select = getQuery("gridspeeds", "grid_speeds.sql");
    // select += `vehicle_id = '${vehicle_id}' AND datetime >= '${startTime}' AND datetime < '${endTime}'`;
    const query = `${select}`;
    console.log(query);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/stops", cacheMiddlewarePersistent(), async (req, res) => {
  try {
    let select = getQuery("stops", "stops.sql");
    const query = `${select}`;
    const result = await db.raw(query);
    res.json(result.rows);
    console.log("Stops query executed successfully");
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/loc_to_loc", async (req, res) => {
  try {
    const isValidRes = validateParams(req.query);
    if (isValidRes !== "") {
      console.log(isValidRes);
      return res.status(400).json({ error: isValidRes });
    }
    const { lat1, lon1, lat2, lon2 } = req.query;
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).send("lat1, lon1, lat2 and lon2 are required");
    }
    let points = `WITH point_a AS (
        SELECT ST_SetSRID(ST_MakePoint(${lon1},${lat1} ), 4326)::geography AS geom
      ),
      point_b AS (
        SELECT ST_SetSRID(ST_MakePoint(${lon2},${lat2}), 4326)::geography AS geom
      )`;
    let select = getQuery("loc_to_loc", "loc_to_loc.sql");
    const query = `${points} ${select}`;
    console.log(query);
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/trips",cacheMiddlewarePersistent(), async (req, res) => {

  const filters = {
    startDate: '2025-04-02 15:00:00',
    endDate: '2025-04-02 19:00:00',
    // line: '3', // optional
    // type: '3' // optional
  };
  try {
    const isValidRes = validateParams(req.query);
    if (isValidRes !== "") {
      console.log(isValidRes);
      return res.status(400).json({ error: isValidRes });
    }
    let query = getQuery("trips", "trips.sql");
    const values = [filters.startDate, filters.endDate];
    
    if (filters.line) {
      query += ' AND line = ?';
      values.push(filters.line);
    }
    if (filters.type) {
      query += ' AND type = ?';
      values.push(filters.type);
    }
    
    query += ' GROUP BY vehicle_id, type, line';
    
    const result = await db.raw(query, values);

    console.log(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
}
);
    

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


/**
 * Persistent cache for latest request per endpoint.
 * Caches the latest response to a file and serves it for identical requests.
 */

const CACHE_DIR = path.join(__dirname, "cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

function getCacheFilePath(key) {
  // Use a hash or base64 to avoid invalid filename chars
  const safeKey = Buffer.from(key).toString("base64");
  return path.join(CACHE_DIR, safeKey + ".json");
}

function cacheMiddlewarePersistent() {
  return (req, res, next) => {
    const key = req.originalUrl;
    const filePath = getCacheFilePath(key);

    // Try to serve from file cache
    if (fs.existsSync(filePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return res.json(cached.data);
      } catch (e) {
        // If cache is corrupted, ignore and proceed
      }
    }

    // Monkey-patch res.json to store response in file cache
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      try {
        fs.writeFileSync(filePath, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (e) {
        // Ignore write errors
      }
      return originalJson(data);
    };
    next();
  };
}

/**
 * Temporary in-memory cache for latest request per endpoint.
 * Caches the latest response in memory and serves it for identical requests.
 * Accepts a TTL (time-to-live) in seconds.
 */

const tempCache = {};

/**
 * @param {number} ttlSeconds - Time to live in seconds (default: 60 seconds)
 */
function tempCacheMiddleware(ttlSeconds = 60) {
  const ttl = ttlSeconds * 1000;
  return (req, res, next) => {
    const key = req.originalUrl;

    if (tempCache[key] && (Date.now() - tempCache[key].timestamp < ttl)) {
      return res.json(tempCache[key].data);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      tempCache[key] = { data, timestamp: Date.now() };
      return originalJson(data);
    };
    next();
  };
}
