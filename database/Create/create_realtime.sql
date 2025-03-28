CREATE TABLE realtimedata (
	datetime timestamptz NOT NULL,
	type int4 NULL,
	line text NOT NULL,
	vehicle_id text NOT NULL,
	direction int4 NULL,
    destination text NULL,
	geom geography(point, 4326) NULL,
    unknown1 text NULL,
    unknown2 text NULL,
	PRIMARY KEY (datetime, line, vehicle_id)
);


CREATE TABLE realtimedata2 (
	datetime timestamptz NOT NULL,
	type int2 NULL,
	line text NOT NULL,
	vehicle_id text NOT NULL,
	direction int2 NULL,
    destination text NULL,
	geom geography(point, 4326) NULL,
    unknown1 text NULL,
    unknown2 text NULL,
	speed int2 NULL,
	PRIMARY KEY (datetime, vehicle_id)
);
