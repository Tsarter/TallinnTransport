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
require("dotenv").config()

// Create an Express application
const app = express();
app.use(cors());
const port = 3000;

// Configure the PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT, // Default PostgreSQL port
});

function getQuery(type, filename) {
  return fs.readFileSync(path.join(__dirname+"/sql/" + type + "/", filename), "utf8");
}
  
function validateParams(query) {
  const { type, line, date, startHour, tws,maxSpeed, disStops, vehicle_id, datetime } = query;
  
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

  if (datetime && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) {
    return "datetime must be in the format YYYY-MM-DD HH:MM:SS";
  }

  // Validate that startHour and endHour are integers
  if (startHour && (!Number.isInteger(Number(startHour)) || !Number.isInteger(Number(tws)) || Number(tws) > 124)) {
    return "startHour and endHour must be integers";
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

  if (type && !["","1","2","3"].includes(type)) {
    return "Type must be empty 1, 2 or 3";
  }

  if (disStops && (!Number.isInteger(Number(disStops)) || Number(disStops) > 1000)) {
    return "filter stops must be an integer"
  }

  if (vehicle_id && !Number.isInteger(Number(vehicle_id))) {
    return "vehicle_id must be an integer";
  }

  return "";
}

// Define a GET endpoint to query the table
app.get("/speedsegments", async (req, res) => {
  try{
  console.log(req.query);
  const isValidRes = validateParams(req.query);
  if (isValidRes !== "") {
    console.log(isValidRes);
    return res.status(400).json({ error: isValidRes });
  }

  const { type, line, date, startHour, tws,maxSpeed, disStops } = req.query;

  if (!date || !startHour || !tws) {
    return res.status(400).send("Date, startHour, and endHour are required");
  }

  try {

    // Put together query string
    let speed_data = getQuery("segment", "speed_data.sql");
    let segment_data =  getQuery("segment","segment_data.sql");
    let select_data =  getQuery("segment","select_data.sql");
    let not_within_stop =  getQuery("segment","not_within_stop.sql");

    const startTime = `${date} ${startHour}:00:00`;
    
    let endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + parseInt(tws));
    endTime.setMinutes(endTime.getMinutes() - endTime.getTimezoneOffset());
    endTime = endTime.toISOString().slice(0, 19).replace("T", " ");
    // Add the last line dynamically
    speed_data += `datetime BETWEEN '${startTime}' AND  '${endTime}' `;
    speed_data += line ? ` AND line = '${line}'` : '';
    speed_data += type ? ` AND type = ${type}` : '';
    speed_data += `AND NOT EXISTS (
      SELECT 1
      FROM depos
      WHERE ST_Within(geom::geometry, depos.location::geometry)
  )`;

    select_data += maxSpeed ? ` AND speed_kmh < ${maxSpeed}` : '';

    let query = "";
    if (disStops) {
      not_within_stop += disStops ? ` ${disStops}` : '';
      query = `${speed_data}), ${segment_data} ${select_data} ${not_within_stop}));`;
    }
    else{
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
  try{
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
        WHERE ST_Within(realtimedata2.geom::geometry, depos.location::geometry)
      )`;
    }
    const query = `${select} ), ${calculatins}`;
    //console.log(query);
    const result = await pool.query(query);
    res.json(result.rows);
  }catch (err) {
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
  try{
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
  }catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
}
);
app.get("/stops", async (req, res) => {
  try{
    let select = getQuery("stops", "stops.sql");
    const query = `${select}`;
    const result = await pool.query(query);
    res.json(result.rows);
  }catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
