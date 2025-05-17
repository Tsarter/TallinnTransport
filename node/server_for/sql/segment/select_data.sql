SELECT 
    line,
    vehicle_id,
    segment,
    speed_kmh,
    type
FROM segment_data
WHERE time_diff_seconds <= 60