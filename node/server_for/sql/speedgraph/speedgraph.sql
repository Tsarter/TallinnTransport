WITH vehicle_movements AS (
    SELECT 
        vehicle_id,
        datetime,
        geom,
        LEAD(datetime) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_datetime,
        LEAD(geom) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_geom
    FROM realtimedata where vehicle_id = '131' limit 1000
),
speed_calculation AS (
    SELECT 
        vehicle_id,
        datetime,
        next_datetime,
        ST_Distance(geom::geography, next_geom::geography) AS distance_meters,
        EXTRACT(EPOCH FROM (next_datetime - datetime)) AS time_seconds
    FROM vehicle_movements
    WHERE next_datetime IS NOT NULL
)
SELECT 
    vehicle_id,
    datetime,
    (distance_meters / time_seconds ) * 3.6 AS speed_kmh
FROM speed_calculation
WHERE time_seconds > 0
ORDER BY datetime;
