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

-- added these to hopefully speed up things (buffers for end and start of line)
ALTER TABLE routes_geom ADD COLUMN buf_start geometry;
ALTER TABLE routes_geom ADD COLUMN buf_end geometry;

-- used estonian 3301 to make projections correct
UPDATE routes_geom
SET 
  buf_start = ST_Transform(
    ST_Buffer(ST_Transform(ST_StartPoint(geom), 3301), 75),
    4326
  ),
  buf_end = ST_Transform(
    ST_Buffer(ST_Transform(ST_EndPoint(geom), 3301), 75),
    4326
  );
UPDATE 44707