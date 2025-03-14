SELECT 
    line,
    vehicle_id,
    segment,
    speed_kmh
FROM segment_data
WHERE time_diff_seconds <= 60