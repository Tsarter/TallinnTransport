// Import necessary modules
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Create an Express application
const app = express();
app.use(cors());
const port = 3000;

// Configure the PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "transport_data",
  password: "Ni@sfg7wgp",
  port: 5432, // Default PostgreSQL port
});


// Define a GET endpoint to query the table
app.get("/speedsegments", async (req, res) => {
  try{
  console.log(req.query);
  const { type, line, date, startHour, endHour,maxSpeed } = req.query;

  if (!date || !startHour || !endHour) {
    return res.status(400).send("Date, startHour, and endHour are required");
  }

  const lineParam = line === "" ? null : line;

  try {
    const startTime = `${date} ${startHour}:00:00`;
    const endTime = `${date} ${endHour}:00:00`;
    let query = fs.readFileSync(
      path.join(__dirname, "speed_segment.sql"),
      "utf8"
    );
    const queryParams = [date, startTime, endTime, maxSpeed];

    // Execute the query
    const result = await pool.query(query, queryParams);
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
