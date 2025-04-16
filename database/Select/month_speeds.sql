-- Slow but returns avg speed for every line

WITH vehicle_movements AS (
  SELECT
    vehicle_id,
    datetime,
    geom,
    line,
    type,
    LEAD(datetime) OVER (
      PARTITION BY vehicle_id
      ORDER BY
        datetime
    ) AS next_datetime,
    LEAD(geom) OVER (
      PARTITION BY vehicle_id
      ORDER BY
        datetime
    ) AS next_geom
  FROM
    realtimedata2
  WHERE
    --vehicle_id = '535'
    datetime >= '2025-03-01'
    AND datetime < '2025-04-01'
    --AND type = '3'
    AND datetime :: time BETWEEN '06:00:00'
    AND '23:00:00'
    AND NOT EXISTS (
      SELECT
        1
      FROM
        depos
      WHERE
        ST_Within(
          realtimedata2.geom :: geometry,
          depos.location :: geometry
        )
    )
),
speed_calculation AS (
  SELECT
    vehicle_id,
    datetime,
    geom,
    line,
    type,
    next_datetime,
    ST_Distance(geom :: geography, next_geom :: geography) AS distance_meters,
    EXTRACT(
      EPOCH
      FROM
        (next_datetime - datetime)
    ) AS time_seconds
  FROM
    vehicle_movements
  WHERE
    next_datetime IS NOT NULL
),
filtered_speeds AS (
  SELECT
    datetime,
    (distance_meters / time_seconds) * 3.6 AS speed_kmh,
    speed_calculation.line,
    speed_calculation.type
  FROM
    speed_calculation
    JOIN routes_geom ON DATE(speed_calculation.datetime) = routes_geom.day
    AND speed_calculation.line = routes_geom.line
    AND speed_calculation.type = routes_geom.type
    AND routes_geom.direction = 'a-b'
  WHERE
    time_seconds > 0
    AND time_seconds < 65
    AND distance_meters < 1500
    AND NOT (
      ST_Within(
        speed_calculation.geom :: geometry,
        routes_geom.buf_start
      )
      OR ST_Within(
        speed_calculation.geom :: geometry,
        routes_geom.buf_end
      )
    )
)
SELECT
  AVG(speed_kmh) AS avg_speed_kmh,
  line,
  type
FROM
  filtered_speeds
GROUP BY
  line, type  
ORDER BY
  avg_speed_kmh;