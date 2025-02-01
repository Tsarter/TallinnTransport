/*
Workaround for the cors.
*/

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());

// Configure the proxy middleware
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://transport.tallinn.ee", // Forward requests to this URL
    changeOrigin: true, // Adjust the origin of requests
    pathRewrite: {
      "^/api": "", // Remove "/api" from the URL when forwarding
    },
    logLevel: "debug", // Optional: Logs the proxy details for debugging
  })
);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
