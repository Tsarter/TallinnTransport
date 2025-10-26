import { db } from "./postgres.js";
export async function getStopsFromDB() {
    const stops = await db("stops").select("stop_id", "stop_name", "stop_code", "thoreb_id", db.raw("ST_Y(location) as lat"), db.raw("ST_X(location) as lon"));
    return stops;
}
export async function getNextDeparturesByStopId(stopId) {
    let now = new Date();
    let past = new Date();
    let future = new Date();
    past.setMinutes(now.getMinutes() - 30); // Deduct 30 minutes
    future.setMinutes(now.getMinutes() + 30); // Add 30 minutes
    const pastTime = past.toTimeString().slice(0, 8); // "HH:MM:SS"
    const futureTime = future.toTimeString().slice(0, 8); // "HH:MM:SS"
    const currentDay = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ][now.getDay()];
    const departures = await db("stop_times")
        .join("trips", "stop_times.trip_id", "trips.trip_id")
        .join("routes", "trips.route_id", "routes.route_id")
        .join("calendar", "trips.service_id", "calendar.service_id")
        .where("stop_times.stop_id", stopId)
        .whereBetween("stop_times.departure_time", [pastTime, futureTime])
        .where(`calendar.${currentDay}`, 1)
        .orderBy("stop_times.departure_time")
        .select("stop_times.departure_time as scheduled_time", "stop_times.departure_time", "routes.route_id", "routes.route_short_name", "routes.route_long_name", "trips.trip_id", "trips.trip_headsign", "routes.route_id");
    return departures;
}
// Same type mapper as in routeUtils.ts
const typeMapper = {
    "2": "3", // Bus
    "3": "900", // Tram
    "10": "100", // Train
};
export async function getStopsByRoute(params) {
    let { line, type, destination } = params;
    // Map type if needed (same as routeUtils)
    type = typeMapper[type] || type;
    // Get all stops for this route
    const stops = await db("routes")
        .join("trips", "routes.route_id", "trips.route_id")
        .join("stop_times", "trips.trip_id", "stop_times.trip_id")
        .join("stops", "stop_times.stop_id", "stops.stop_id")
        .where({ "routes.route_short_name": line, "routes.route_type": type })
        .whereRaw("LOWER(trips.trip_headsign) LIKE ?", [`%${destination.toLowerCase()}%`])
        .distinct("stops.stop_id", "stops.stop_name", db.raw("ST_Y(stops.location) as lat"), db.raw("ST_X(stops.location) as lon"), "stop_times.stop_sequence")
        .orderBy("stop_times.stop_sequence");
    return stops;
}
/* getNextDeparturesByStopId(1082); */
//# sourceMappingURL=stopsUtils.js.map