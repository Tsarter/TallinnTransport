-- Stores the geometry of the routes
-- Table created at 13.04.2025 to try to filter out gps locations on route ends

CREATE TABLE routes_geom (
    day DATE NOT NULL,
    line TEXT NOT NULL,
    type INT2 NOT NULL,
    direction TEXT NOT NULL,
    geom GEOMETRY(LINESTRING, 4326) NOT NULL,
    PRIMARY KEY (day, line,type, direction)
);