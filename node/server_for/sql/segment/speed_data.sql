WITH speed_data AS (
    SELECT 
        line,
        type,
        vehicle_id,
        geom AS point,
        datetime,
        LEAD(geom) OVER (PARTITION BY line, vehicle_id ORDER BY datetime) AS next_point,
        LEAD(datetime) OVER (PARTITION BY line, vehicle_id ORDER BY datetime) AS next_time
    FROM realtimedata
    WHERE
