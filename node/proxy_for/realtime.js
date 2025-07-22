/*
Workaround for the cors.

Proxied from nginx 
*/

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const apicache = require("apicache");
apicache.options({ headers: { "Cache-Control": "public, max-age=10" } }); // Set default cache headers
let cache = apicache.middleware;

const app = express();
app.use(cors());

let counter = 0;
let timeSinceLastRequest = Date.now();
// Configure the proxy middleware
app.get(
  "/gps",

  cache("10 seconds"),
  async (req, res) => {
    // let timeNow = Date.now();
    /* console.log(
      `Time since last request: ${parseInt(
        Math.floor((timeNow - timeSinceLastRequest) / 1000)
      )} s`
    ); */
    // timeSinceLastRequest = timeNow;
    // console.log(`Cache MISS for GPS: ${req.method} ${req.url}`);
    try {
      const response = await fetch("https://gis.ee/tallinn/gps.php");
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
/* app.use(
  "/",
  (req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url} (${++counter})`);
    next();
  },
  cache("30 seconds"),
  (req, res, next) => {
    const isCacheHit = res.getHeader("apicache-store") || res.locals.apicache;
    if (isCacheHit) {
      console.log(`Cache HIT for: ${req.method} ${req.url}`);
    } else {
      console.log(`Cache MISS for: ${req.method} ${req.url}`);
    }
    next();
  },
  createProxyMiddleware({
    target: "https://transport.tallinn.ee", // Forward requests to this URL
    changeOrigin: true, // Adjust the origin of requests
    pathRewrite: {
      "^/api/realtime": "", // Remove "/api" from the URL when forwarding
    },
    logLevel: "debug", // Optional: Logs the proxy details for debugging
    onProxyRes: (proxyRes, req) => {
      if (proxyRes.statusCode !== 200) {
        console.log(`Non-200 response: ${proxyRes.statusCode} for ${req.url}`);
      } else {
        console.log(`Proxying request: ${req.method} ${req.url}`);
      }
    },
  })
);
 */
// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
