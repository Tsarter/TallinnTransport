speed_calculation AS (
    SELECT 
        vehicle_id,
        datetime,
        geom,
        next_datetime,
        ST_Distance(geom::geography, next_geom::geography) AS distance_meters,
        EXTRACT(EPOCH FROM (next_datetime - datetime)) AS time_seconds
    FROM vehicle_movements
    WHERE next_datetime IS NOT NULL
)
SELECT 
    vehicle_id,
    datetime,
    ST_X(geom::geometry) AS lon,
    ST_Y(geom::geometry) AS lat,
    (distance_meters / time_seconds ) * 3.6 AS speed_kmh
FROM speed_calculation
WHERE time_seconds > 0
ORDER BY datetime;