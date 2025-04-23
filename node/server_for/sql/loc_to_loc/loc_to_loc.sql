,
trip_geoms AS (
  SELECT
    vehicle_id,
    line,
    type,
    destination,
    unknown2,
    MIN(datetime) AS trip_start,
    MAX(datetime) AS trip_end,
    ST_MakeLine(geom::geometry ORDER BY datetime) AS geom_line
  FROM realtimedata
  WHERE datetime BETWEEN '2025-04-01' AND '2025-04-02' -- <-- adjust range
  GROUP BY vehicle_id, line, type, destination, unknown2
),
filtered AS (
  SELECT tg.*
  FROM trip_geoms tg, point_a, point_b
  WHERE
    ST_DWithin(tg.geom_line::geography, point_a.geom, 50) AND
    ST_DWithin(tg.geom_line::geography, point_b.geom, 50)
),
joined as (
SELECT f.*, r.datetime, r.geom::geometry FROM filtered f
JOIN realtimedata r on f.line = r.line and f.type = r.type and f.unknown2 = r.unknown2
where datetime BETWEEN '2025-04-01' AND '2025-04-02'
),
closest_to_a AS (
  SELECT DISTINCT ON (vehicle_id, line, type, destination, unknown2)
    datetime AS time_a,
    joined.geom AS geom_a,
    *,
    ST_Distance(joined.geom::geography, point_a.geom) AS dist
  FROM joined, point_a
  WHERE ST_DWithin(joined.geom::geography, point_a.geom, 250)
  ORDER BY vehicle_id, line, type, destination, unknown2, dist ASC
),
closest_to_b AS (
  SELECT DISTINCT ON (vehicle_id, line, type, destination, unknown2)
    datetime AS time_b,
    joined.geom AS geom_b,
    *,
    ST_Distance(joined.geom::geography, point_b.geom) AS dist
  FROM joined, point_b
  WHERE ST_DWithin(joined.geom::geography, point_b.geom, 250)
  ORDER BY vehicle_id, line, type, destination, unknown2, dist ASC
)

SELECT
  a.vehicle_id,
  a.line,
  a.type,
  a.unknown2,
  a.time_a,
  b.time_b,
  CASE
    WHEN a.time_a < b.time_b THEN 'A→B'
    ELSE 'B→A'
  END AS direction,
  ABS(EXTRACT(EPOCH FROM (b.time_b - a.time_a))) AS seconds_diff
FROM closest_to_a a
JOIN closest_to_b b
  ON a.vehicle_id = b.vehicle_id
  AND a.line = b.line
  AND a.type = b.type
  AND a.destination = b.destination
  AND a.unknown2 = b.unknown2
WHERE ABS(EXTRACT(EPOCH FROM (b.time_b - a.time_a))) < 3000
ORDER BY a.vehicle_id, a.line, LEAST(a.time_a, b.time_b);

