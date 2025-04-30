WITH speed_data AS (
    SELECT
        datetime,
        geom,
        type,
        line,
        LEAD(geom) OVER (PARTITION BY type, line, vehicle_id ORDER BY datetime) AS next_point,
        LEAD(datetime) OVER (PARTITION BY type, line, vehicle_id ORDER BY datetime) AS next_time
    FROM realtimedata
    WHERE datetime >= '2025-03-01' -- Muidu liiga palju andmeid
    AND datetime < '2025-03-02'
),
segment_data AS (
    SELECT
        type,
        line,
        datetime,
        EXTRACT(EPOCH FROM (next_time - datetime)) AS time_diff_seconds, 
        ST_Distance(geom::GEOGRAPHY, next_point::GEOGRAPHY) AS distance_meters
    FROM speed_data
    WHERE next_point IS NOT NULL
)
SELECT 
    type,
    line,
    datetime,
    (distance_meters / time_diff_seconds) * 3.6 AS speed_kmh
FROM segment_data
WHERE time_diff_seconds <= 60;





