AND NOT EXISTS (
    SELECT 1
    FROM stops
    WHERE ST_DWithin(point::GEOGRAPHY, stops.location::GEOGRAPHY, 