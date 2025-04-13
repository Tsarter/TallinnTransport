SELECT 
  AVG(realtimedata2.speed) AS avg_speed, 
  ST_AsGeoJSON(grid.geom) AS grid_geom,
  COUNT(realtimedata2.speed) AS count
FROM realtimedata2, 
LATERAL ST_HexagonGrid(0.0001, realtimedata2.geom::geometry) AS grid 
WHERE datetime >= '2025-03-03' 
  AND datetime < '2025-03-04'
  --AND type = '3'
  --AND line = '4'
  AND NOT EXISTS (
        SELECT 1
        FROM depos
        WHERE ST_Within(realtimedata2.geom::geometry, depos.location::geometry)
      )
-- AND NOT EXISTS (
--    SELECT 1
--    FROM stops
--    WHERE ST_DWithin(realtimedata2.geom::GEOGRAPHY, stops.location::GEOGRAPHY, 20)
--  )
GROUP BY grid_geom
HAVING COUNT(realtimedata2.speed) > 2
ORDER BY avg_speed;
