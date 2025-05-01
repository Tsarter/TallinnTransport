,
trip_geoms AS (
  SELECT
    vehicle_id,
    line,
    type,
    destination,
    unknown2,
    ST_MakeLine(geom::geometry ORDER BY datetime) AS geom_line
  FROM realtimedata
  WHERE datetime BETWEEN '2025-04-01' AND '2025-04-02'
  GROUP BY vehicle_id, line, type, destination, unknown2
),
filtered AS (
  SELECT tg.*
  FROM trip_geoms tg, point_a, point_b
  WHERE
    ST_DWithin(tg.geom_line::geography, point_a.geom, 50) AND
    ST_DWithin(tg.geom_line::geography, point_b.geom, 50)
),
joined AS (
  SELECT f.*, r.datetime, r.geom::geometry 
  FROM filtered f
  JOIN realtimedata r 
    ON f.line = r.line 
    AND f.type = r.type 
    AND f.unknown2 = r.unknown2 
    AND f.destination = r.destination
  WHERE r.datetime BETWEEN '2025-04-01' AND '2025-04-02'
),
points_near_a AS (
  SELECT
    joined.*,
    'A' AS point_label
  FROM joined, point_a
  WHERE ST_DWithin(joined.geom::geography, point_a.geom, 50)
),
points_near_b AS (
  SELECT
    joined.*,
    'B' AS point_label
  FROM joined, point_b
  WHERE ST_DWithin(joined.geom::geography, point_b.geom, 50)
),
all_points AS (
  SELECT * FROM points_near_a
  UNION ALL
  SELECT * FROM points_near_b
),
preliminary_direction AS (
  SELECT
    vehicle_id,
    line,
    type,
    destination,
    unknown2,
    MIN(CASE WHEN point_label = 'A' THEN datetime END) AS earliest_a,
    MIN(CASE WHEN point_label = 'B' THEN datetime END) AS earliest_b
  FROM all_points
  GROUP BY vehicle_id, line, type, destination, unknown2
),
final_selection AS (
  SELECT
    ap.vehicle_id,
    ap.line,
    ap.type,
    ap.destination,
    ap.unknown2,
    ap.geom_line,

    pd.earliest_a,
    pd.earliest_b,
    CASE
      WHEN pd.earliest_a < pd.earliest_b THEN 'A→B'
      ELSE 'B→A'
    END AS direction,
    ap.datetime,
    ap.geom,
    ap.point_label
  FROM all_points ap
  JOIN preliminary_direction pd
    ON ap.vehicle_id = pd.vehicle_id
    AND ap.line = pd.line
    AND ap.type = pd.type
    AND ap.destination = pd.destination
    AND ap.unknown2 = pd.unknown2
),
ranked_points AS (
  SELECT
    ST_LineLocatePoint(geom_line, geom) as line_frac,
    *,
    ROW_NUMBER() OVER (
  PARTITION BY vehicle_id, line, type, destination, unknown2, point_label, direction
  ORDER BY
    CASE 
      WHEN direction = 'A→B' AND point_label = 'A' THEN -EXTRACT(EPOCH FROM datetime) 
      WHEN direction = 'A→B' AND point_label = 'B' THEN  EXTRACT(EPOCH FROM datetime) 
      WHEN direction = 'B→A' AND point_label = 'B' THEN -EXTRACT(EPOCH FROM datetime)
      WHEN direction = 'B→A' AND point_label = 'A' THEN  EXTRACT(EPOCH FROM datetime)
    END
) AS rn
  FROM final_selection
)
SELECT
  a.vehicle_id,
  a.line,
  a.type,
  a.unknown2,
  a.direction,
  ST_AsGeoJSON(ST_LineSubstring(
  a.geom_line,
  LEAST(a.line_frac, b.line_frac),
  GREATEST(a.line_frac, b.line_frac)
  )) as geom_line_geojson,
  a.datetime AS time_a,
  b.datetime AS time_b,
  ABS(EXTRACT(EPOCH FROM (b.datetime - a.datetime))) AS seconds_diff
FROM ranked_points a
JOIN ranked_points b
  ON a.vehicle_id = b.vehicle_id
  AND a.line = b.line
  AND a.type = b.type
  AND a.destination = b.destination
  AND a.unknown2 = b.unknown2
  AND a.direction = b.direction
WHERE a.point_label = 'A' AND b.point_label = 'B'
  AND a.rn = 1
  AND b.rn = 1
  AND ABS(EXTRACT(EPOCH FROM (b.datetime - a.datetime))) < 3000
ORDER BY a.vehicle_id, a.line, LEAST(a.datetime, b.datetime) ASC;
