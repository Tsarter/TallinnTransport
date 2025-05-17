CREATE TABLE depos (
    depot_id SERIAL PRIMARY KEY,
    depot_name VARCHAR(255),
    location GEOGRAPHY(POLYGON, 4326)
);