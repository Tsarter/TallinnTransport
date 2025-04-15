segment_data AS (
    SELECT 
        line, 
        vehicle_id,
        point,
        next_point,
        type,
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