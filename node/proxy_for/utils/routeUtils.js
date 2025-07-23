const unzipper = require("unzipper");
const parse = require("csv-parse/sync").parse;

const typeMapper = {
  2: "3",
  3: "900",
  10: "100",
};

async function extractAndParseCSV(zipPath, fileName) {
  const directory = await unzipper.Open.file(zipPath);
  const file = directory.files.find((f) => f.path === fileName);
  if (!file) throw new Error(`${fileName} not found in ZIP`);
  let content = await file.buffer();
  let text = content.toString();
  // Remove BOM if present
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
  });
}

async function getRouteCoordinates(
  { line, destination, type },
  gtfsZipPath = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/GTFS_data/latest_gtfs.zip"
) {
  const [routes, trips, shapes] = await Promise.all([
    extractAndParseCSV(gtfsZipPath, "routes.txt"),
    extractAndParseCSV(gtfsZipPath, "trips.txt"),
    extractAndParseCSV(gtfsZipPath, "shapes.txt"),
  ]);
  type = typeMapper[type] || type;

  const route = routes.find(
    (r) => r.route_short_name === line && r.route_type === type
  );

  if (!route) throw new Error("Route not found");

  const matchingTrip = trips.find(
    (t) =>
      t.route_id === route.route_id &&
      t.trip_headsign.toLowerCase().includes(destination.toLowerCase())
  );

  if (!matchingTrip) throw new Error("Matching trip not found");

  const shapePoints = shapes.filter(
    (s) =>
      String(s.shape_id || s["﻿shape_id"])
        .replace(/^\uFEFF/, "")
        .trim() === String(matchingTrip.shape_id).trim()
  );

  const coordinates = shapePoints.map((s) => [
    parseFloat(s.shape_pt_lat),
    parseFloat(s.shape_pt_lon),
  ]);

  return coordinates;
}

module.exports = { getRouteCoordinates };
