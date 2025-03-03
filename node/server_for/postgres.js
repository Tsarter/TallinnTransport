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

function getQuery(filename) {
  return fs.readFileSync(path.join(__dirname, filename), "utf8");
}
  
function validateParams(query) {
  const { type, line, date, startHour, tws,maxSpeed, disStops } = query;
  
  let inputDate = new Date(date);
  let startDate = new Date("2024-06-06");
  let today = new Date();
  
  if (inputDate < startDate || inputDate > today) {
    return "Date must be between 6 june 2024 and today";
  }

  // Validate that startHour and endHour are integers
  if (!Number.isInteger(Number(startHour)) || !Number.isInteger(Number(tws)) || Number(tws) > 124) {
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

  if (!["","1","2","3"].includes(type)) {
    return "Type must be empty 1, 2 or 3";
  }

  if (disStops && (!Number.isInteger(Number(disStops)) || Number(disStops) > 1000)) {
    return "filter stops must be an integer"
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
    let speed_data = getQuery("speed_data.sql");
    let segment_data = getQuery("segment_data.sql");
    let select_data = getQuery("select_data.sql");
    let not_within_stop = getQuery("not_within_stop.sql");

    const startTime = `${date} ${startHour}:00:00`;
    
    let endTime = new Date(startTime);
    console.log(endTime, endTime.getHours() + tws);
    endTime.setHours(endTime.getHours() + parseInt(tws));
    console.log(endTime);
    endTime.setMinutes(endTime.getMinutes() - endTime.getTimezoneOffset());
    console.log(endTime);
    endTime = endTime.toISOString().slice(0, 19).replace("T", " ");
    console.log(endTime);
    // Add the last line dynamically
    speed_data += `datetime BETWEEN '${startTime}' AND  '${endTime}' `;
    speed_data += line ? ` AND line = '${line}'` : '';
    speed_data += type ? ` AND type = ${type}` : '';

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



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
