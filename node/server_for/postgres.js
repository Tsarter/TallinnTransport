/*
Important!

The routes are served over /api path defined in the nginx configuration file

*/

// Import necessary modules
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Create an Express application
const app = express();
app.use(cors());
const port = 3000;

// Configure the PostgreSQL connection
const pool = new Pool({
  user: process.env.PG_TANEL_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.PG_TANEL_PASSWORD,
  port: process.env.POSTGRES_PORT, // Default PostgreSQL port
});

function getQuery(type, filename) {
  return fs.readFileSync(
    path.join(__dirname + "/sql/" + type + "/", filename),
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
app.get("/speedsegments", async (req, res) => {
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

      //console.log(query);
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

app.get("/speedgraph", async (req, res) => {
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

app.get("/gridspeeds", async (req, res) => {
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
app.get("/stops", async (req, res) => {
  try {
    let select = getQuery("stops", "stops.sql");
    const query = `${select}`;
    const result = await pool.query(query);
    res.json(result.rows);
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
