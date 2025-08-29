import { db } from "./postgres.js";
export async function getStopsFromDB() {
  const stops = await db("stops").select(
    "stop_id",
    "stop_name",
    "stop_code",
    "thoreb_id",
    db.raw("ST_Y(location) as lat"),
    db.raw("ST_X(location) as lon")
  );
  return stops;
}

export async function getNextDeparturesByStopId(stopId, limit) {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 8); // "HH:MM:SS"
  const currentDay = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][now.getDay()];

  const departures = await db("stop_times")
    .join("trips", "stop_times.trip_id", "trips.trip_id")
    .join("routes", "trips.route_id", "routes.route_id")
    .join("calendar", "trips.service_id", "calendar.service_id")
    .where("stop_times.stop_id", stopId)
    .where("stop_times.departure_time", ">", currentTime)
    .where(`calendar.${currentDay}`, 1)
    .orderBy("stop_times.departure_time")
    .select(
      "stop_times.departure_time",
      "routes.route_id",
      "routes.route_short_name",
      "routes.route_long_name",
      "trips.trip_id",
      "trips.trip_headsign"
    )
    .limit(limit);

  return departures;
}

getNextDeparturesByStopId(1082)