speed_calculation AS (
    SELECT 
        vehicle_id,
        datetime,
        geom,
        line,
        type,
        next_datetime,
        ST_Distance(geom::geography, next_geom::geography) AS distance_meters,
        EXTRACT(EPOCH FROM (next_datetime - datetime)) AS time_seconds
    FROM vehicle_movements
    WHERE next_datetime IS NOT NULL
)
SELECT 
    vehicle_id,
    datetime,
    ST_X(speed_calculation.geom::geometry) AS lon,
    ST_Y(speed_calculation.geom::geometry) AS lat,
    (distance_meters / time_seconds ) * 3.6 AS speed_kmh
FROM speed_calculation
JOIN routes_geom ON DATE(speed_calculation.datetime) = routes_geom.day AND speed_calculation.line = routes_geom.line
    AND speed_calculation.type = routes_geom.type AND routes_geom.direction = 'a-b'
WHERE time_seconds > 0 AND time_seconds < 65 AND NOT (
      ST_Within(speed_calculation.geom :: geometry, routes_geom.buf_start)
      OR ST_Within(speed_calculation.geom :: geometry, routes_geom.buf_end)
    )
ORDER BY datetime;
