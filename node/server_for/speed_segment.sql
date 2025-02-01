WITH speed_data AS (
    SELECT 
        line,
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
        ST_MakeLine(point::GEOMETRY, next_point::GEOMETRY) AS segment, -- Create a segment (LINESTRING) for each pair of points
        EXTRACT(EPOCH FROM (next_time - datetime)) AS time_diff_seconds, -- Time difference in seconds
        ST_Distance(point::GEOGRAPHY, next_point::GEOGRAPHY) AS distance_meters, -- Distance in meters
        CASE 
            WHEN EXTRACT(EPOCH FROM (next_time - datetime)) > 0 THEN 
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
WHERE time_diff_seconds <= 60 and speed_kmh < 5; -- Only include points where the time difference is 1 minute or less
