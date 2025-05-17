CREATE MATERIALIZED VIEW avg_speed_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', datetime) AS bucket,
    r.line,
    r.type,   -- Add the type for differentiation
    AVG(r.speed) AS avg_speed
FROM realtimedata2 r
LEFT JOIN depos d 
    ON ST_Within(r.geom::geometry, d.location::geometry) -- Match points inside depots
WHERE 
    r.speed BETWEEN 0 AND 249  -- Valid speed range
    AND d.location IS NULL     -- Exclude points that matched a depot
GROUP BY bucket, r.line, r.type;





-- Create a continuous aggregate policy to refresh the materialized view
SELECT add_continuous_aggregate_policy(
    'avg_speed_per_line_hourly',  -- The continuous aggregate to update
    start_offset => INTERVAL '2 days',  -- How far back to refresh
    end_offset => INTERVAL '1 hour',    -- How recent to update
    schedule_interval => INTERVAL '5 minutes'  -- How often the refresh runs
);