/*
Workaround for the cors.

Proxied from nginx 
*/

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const apicache = require("apicache");
let cache = apicache.middleware;

const app = express();
app.use(cors());

let counter = 0;
// Configure the proxy middleware
app.use(
  "/",
  (req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url} `);
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
    onProxyRes: (proxyRes, req, res) => {
      if (proxyRes.statusCode !== 200) {
        console.log(`Non-200 response: ${proxyRes.statusCode} for ${req.url}`);
      } else {
        console.log(`Proxying request: ${req.method} ${req.url}`);
      }
    },
  })
);

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
