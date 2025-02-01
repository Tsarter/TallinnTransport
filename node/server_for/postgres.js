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
  host: "localhost",
  database: "transport_data",
  password: "postgres",
  port: 5432, // Default PostgreSQL port
});

// Define a GET endpoint to query the table
app.get("/speedsegments", async (req, res) => {
  const { type, line, date, hour } = req.query;

  console.log(date, hour);
  if (!date || !hour) {
    return res.status(400).send("Date and hour are required");
  }

  try {
    const startTime = `${date} ${hour}:00:00`;
    const endTime = `${date} ${hour}:59:59`;

    let query = fs.readFileSync(
      path.join(__dirname, "speed_segment.sql"),
      "utf8"
    );
    const queryParams = [date, startTime, endTime];

    // Execute the query
    const result = await pool.query(query, queryParams);
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
