import { db } from "./postgres.js";
import wkx from "wkx";
const typeMapper = {
    "2": "3",
    "3": "900",
    "10": "100",
};
async function getRouteCoordinatesFromDB({ line, destination, type }) {
    // Map type if needed
    type = typeMapper[type] || type;
    // 1. Find the route
    const route = await db("routes")
        .where({ route_short_name: line, route_type: type })
        .first();
    if (!route)
        throw new Error("Route not found");
    // 2. Find the matching trip (destination match, case-insensitive)
    const trip = await db("trips")
        .where({ route_id: route.route_id })
        .whereRaw("LOWER(trip_headsign) LIKE ?", [`%${destination.toLowerCase()}%`])
        .first();
    if (!trip)
        throw new Error("Matching trip not found");
    // 3. Get the shape geometry (PostGIS LINESTRING)
    const shape = await db("shapes").where({ shape_id: trip.shape_id }).first();
    if (!shape)
        throw new Error("Shape not found");
    // 4. Convert LINESTRING to array of [lat, lon] coordinates
    // PostGIS returns WKT: "LINESTRING(lon lat, lon lat, ...)"
    // You may need to use ST_AsText or ST_AsGeoJSON in your query for proper parsing
    let coordinates = [];
    if (shape.shape_geom) {
        // If using ST_AsGeoJSON:
        // const geojson = JSON.parse(shape.shape_geom);
        // coordinates = geojson.coordinates.map(([lon, lat]) => [lat, lon]);
        // If using WKT:
        const wkt = shape.shape_geom; // e.g. "LINESTRING(24.75912 59.43907, ...)"
        // Handle EWKB/HEX WKB format (starts with '01' and is much longer than WKT)
        if (/^[0-9A-Fa-f]+$/.test(wkt.trim())) {
            // Use 'wkx' package to parse WKB hex to coordinates
            const geom = wkx.Geometry.parse(Buffer.from(wkt, "hex"));
            if (geom && geom.points) {
                coordinates = geom.points.map((pt) => [pt.y, pt.x]);
            }
        }
        else {
            // Fallback to WKT parsing
            const matches = wkt.match(/\(([^)]+)\)/);
            if (matches) {
                coordinates = matches[1]
                    .split(",")
                    .map((pt) => pt.trim().split(" ").map(Number))
                    .map(([lon, lat]) => [lat, lon]);
            }
        }
    }
    return coordinates;
}
export async function getRouteStops(line, destination, type) {
    type = typeMapper[type] || type;
    // 1. Find the route
    const route = await db("routes")
        .where({ route_short_name: line, route_type: type })
        .first();
    if (!route)
        throw new Error("Route not found");
}
//getRouteCoordinatesFromDB({ line: "9", destination: "Priisle", type: "2" });
export { getRouteCoordinatesFromDB };
//# sourceMappingURL=routeUtils.js.map