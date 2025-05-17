WITH realtime_filtered AS (
  SELECT
    rtd.datetime,
    rtd.geom,
    rtd.type,
    rtd.line,
    rtd.direction,
    rtd.vehicle_id,
    rtd.speed,
    grid.geom AS grid_geom
  FROM
    realtimedata rtd
    JOIN routes_geom mr ON DATE(rtd.datetime) = mr.day AND rtd.line = mr.line
    AND rtd.type = mr.type AND mr.direction = 'a-b'
    JOIN LATERAL ST_HexagonGrid(0.0003, rtd.geom :: geometry) AS grid ON true
  WHERE
    rtd.datetime >= '2025-03-03'
    AND rtd.datetime < '2025-03-04'
    --AND rtd.type = '3' 
    AND NOT EXISTS (
      SELECT
        1
      FROM
        depos
      WHERE
        ST_Within(rtd.geom :: geometry, depos.location :: geometry)
    )
    AND NOT (
      ST_Within(rtd.geom :: geometry, mr.buf_start)
      OR ST_Within(rtd.geom :: geometry, mr.buf_end)
    )
)
SELECT
  AVG(realtime_filtered.speed) AS avg_speed,
  ST_AsGeoJSON(realtime_filtered.grid_geom) AS grid_geom,
  COUNT(realtime_filtered.speed) AS count
from realtime_filtered
GROUP BY
  grid_geom
HAVING
  COUNT(realtime_filtered.speed) > 2
ORDER BY
  avg_speed;