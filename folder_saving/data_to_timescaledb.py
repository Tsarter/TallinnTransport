import os
from dotenv import load_dotenv
from psycopg2 import pool
from psycopg2.extras import execute_values
from geopy.distance import geodesic

load_dotenv(dotenv_path="/home/tanel/Documents/public_transport_project/iaib/database/env.env")
# Access the environment variables
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")

# Initialize the connection pool (minconn=1, maxconn=5)
pg_pool = pool.SimpleConnectionPool(
    1, 5,  # Minimum 1, Maximum 5 connections
    dbname=db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port,
)

def get_connection():
    """Get a database connection from the pool."""
    return pg_pool.getconn()

def release_connection(conn):
    """Return a connection back to the pool."""
    pg_pool.putconn(conn)

prev_locations = {}


def calculate_speed(row, datetime):
    global prev_locations
    vehicle_id = row[6]
    longitude = int(row[2]) / 1000000
    latitude = int(row[3]) / 1000000
    current_location = (latitude, longitude)
    speed = -1 # default speed
    if vehicle_id in prev_locations:
        prev_location, prev_datetime = prev_locations[vehicle_id]
        distance = geodesic(prev_location, current_location).meters
        time_diff = (datetime - prev_datetime).total_seconds()
        if 15 < time_diff < 45:
            speed =  min(250, distance / time_diff * 3.6) # max speed 250 km/h
    prev_locations[vehicle_id] = (current_location, datetime)
    return speed

def save_to_database(data, datetime):
    # Connect to PostgreSQL
    # Prepare data for TimescaleDB (convert date and time into datetime)
    try:
        pg_conn = get_connection()
        pg_cursor = pg_conn.cursor()
        records = []
        for row in data.split("\n"):
            row = row.split(",")
            if len(row) != 10:
                continue
            (
                type,
                line,
                longitude,
                latitude,
                _,
                direction,
                vehicle_id,
                unknown1,
                unknown2,
                destination,
            ) = row
            
            try:
                type_ = int(type)
                line_ = str(line)
                latitude_ = int(latitude) / 1000000
                longitude_ = int(longitude) / 1000000
                direction_ = int(direction)
                destination_ = str(destination)
                vehicle_id_ = int(vehicle_id)
                unknown1_ = str(unknown1)
                unknown2_ = str(unknown2)
                speed = int(calculate_speed(row, datetime))
            except ValueError:
                print("Invalid record:",datetime, row, flush=True)
                continue
            except ZeroDivisionError:
                # datetime also in logs
                print("Invalid record:",datetime, row, flush=True)
                continue

            geom = f"SRID=4326;POINT({longitude_} {latitude_})"
            records.append(
                (
                    datetime,
                    type_,
                    line_,
                    vehicle_id_,
                    direction_,
                    destination_,
                    geom,
                    unknown1_,
                    unknown2_,
                    speed
                )
            )

        insert_query = """
            INSERT INTO realtimedata2 (datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2, speed)
            VALUES %s
            ON CONFLICT DO NOTHING;
        """
        execute_values(pg_cursor, insert_query, records)
        pg_conn.commit()  # Commit after each batch
    except Exception as e:
        print("Database error:", e, flush=True)
    finally:
        if pg_cursor:
            pg_cursor.close()
        if pg_conn:
            release_connection(pg_conn)  # Return the connection to the pool
