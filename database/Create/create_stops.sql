CREATE TABLE stops (
    id TEXT PRIMARY KEY,
    id0 INTEGER,
    name TEXT,
    location GEOMETRY(Point, 4326) -- Using PostGIS for geolocation
);