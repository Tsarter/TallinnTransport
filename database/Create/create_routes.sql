CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    stop_id TEXT REFERENCES stops(id),
    transport TEXT,
    num TEXT,
    direction TEXT,
    direction_name TEXT,
    stop_num INTEGER
);