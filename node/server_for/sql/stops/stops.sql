-- Tallinn locations
SELECT 
    id,
    name,
    ST_X(location::geometry) AS longitude,
    ST_Y(location::geometry) AS latitude
FROM stops
WHERE ST_DWithin('SRID=4326;POINT (24.7536 59.4370)'::geometry, stops.location::GEOGRAPHY, 11000)

