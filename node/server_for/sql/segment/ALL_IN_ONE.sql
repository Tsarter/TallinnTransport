WITH speed_data AS (
    SELECT 
        line,
        type
        vehicle_id,
        geom AS point,
        datetime,
        LEAD(geom) OVER (PARTITION BY line, vehicle_id ORDER BY datetime) AS next_point,
        LEAD(datetime) OVER (PARTITION BY line, vehicle_id ORDER BY datetime) AS next_time
    FROM realtimedata
    WHERE DATE(datetime) = $1 and datetime BETWEEN $2 AND $3 
),
segment_data AS (
    SELECT 
        line, 
        vehicle_id,
        point,
        next_point,
        ST_AsGeoJSON(ST_MakeLine(point::GEOMETRY, next_point::GEOMETRY)) AS segment, -- Create a segment (LINESTRING) for each pair of points
        EXTRACT(EPOCH FROM (next_time - datetime)) AS time_diff_seconds, -- Time difference in seconds
        ST_Distance(point::GEOGRAPHY, next_point::GEOGRAPHY) AS distance_meters, -- Distance in meters
        CASE 
            WHEN EXTRACT(EPOCH FROM (next_time - datetime)) > 1 THEN 
                ST_Distance(point::GEOGRAPHY, next_point::GEOGRAPHY) / EXTRACT(EPOCH FROM (next_time - datetime)) * 3.6 -- Speed in km/h
            ELSE 
                NULL
        END AS speed_kmh -- Speed in km/h
    FROM speed_data
    WHERE next_point IS NOT NULL
)
SELECT 
    line,
    vehicle_id,
    segment,
    speed_kmh
FROM segment_data
WHERE time_diff_seconds <= 60 and speed_kmh < $4; -- Only include points where the time difference is 1 minute or less
/* 
tallinn_stops AS (
    SELECT 
        id,
        name,
        location
    FROM stops
    WHERE ST_DWithin('SRID=4326;POINT (24.7536 59.4370)'::geometry, stops.location::GEOGRAPHY, 5000)
)

AND NOT EXISTS (
    SELECT 1
    FROM tallinn_stops
    WHERE ST_DWithin(point::GEOGRAPHY, tallinn_stops.location::GEOGRAPHY, 25)
);
 */