WITH vehicle_movements AS (
    SELECT 
        vehicle_id,
        datetime,
        geom,
        line,
        type,
        LEAD(datetime) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_datetime,
        LEAD(geom) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_geom
    FROM realtimedata where 
