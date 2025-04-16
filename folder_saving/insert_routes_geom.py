"""
WARNING:
THIS file is used in iaib/folder_saving/fetch_daily_data.py
"""


import os
import psycopg2
from datetime import datetime
from polyline import decode as decode_polyline
from shapely.geometry import LineString, Point
from shapely.ops import transform
from pyproj import Transformer


# Constants
BASE_DIR = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/routes_data"
TRANSPORT_TYPE_MAP = {'bus': 2, 'tram': 3, 'trol': 1}
from dotenv import load_dotenv

# Load environment variables from .env file

load_dotenv(dotenv_path="/home/tanel/Documents/public_transport_project/iaib/database/env.env")

# Access the environment variables
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("PG_TANEL_USER")
db_password = os.getenv("PG_TANEL_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")
print("DB:", db_name)
print("USER:", db_user)
print("PASS:", db_password)
print("HOST:", db_host)
print("PORT:", db_port)

# Database connection settings
DB_CONFIG = {
    "dbname": db_name,
    "user": db_user,
    "password": db_password,
    "host": db_host,
    "port": db_port,
}
# Connect to DB
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# Transformers between 4326 (WGS84) and 3301 (Estonia)
to_3301 = Transformer.from_crs("EPSG:4326", "EPSG:3301", always_xy=True).transform
to_4326 = Transformer.from_crs("EPSG:3301", "EPSG:4326", always_xy=True).transform

def compute_buffers(geom):
    # Transform to 3301
    geom_3301 = transform(to_3301, geom)

    # Get start and end point in projected space
    start_point = Point(geom_3301.coords[0])
    end_point = Point(geom_3301.coords[-1])

    # Buffer 75 meters
    buf_start_3301 = start_point.buffer(75)
    buf_end_3301 = end_point.buffer(75)

    # Transform back to 4326
    buf_start_4326 = transform(to_4326, buf_start_3301)
    buf_end_4326 = transform(to_4326, buf_end_3301)

    return buf_start_4326.wkt, buf_end_4326.wkt

def parse_file(filepath, day, transport_type, transport_line):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.read().strip().split("\n")
    # Make 18a -> 18A
    transport_line = transport_line.upper()
    # if file contains "<!DOCTYPE then it is not a valid file
    if lines[0].startswith("<"):
        return []
    entries = []

    route = {
        "day": day,
        "line": transport_line,
        "type": transport_type,
    }

    # first is direction. second is geom, third is stops (ignore it)
    for i in range(0, len(lines)):
        # if i % 3 == 0: then its direction
        # if i % 3 == 1: then its geom
        # if i % 3 == 2: then its stops (ignore it)
        if i % 3 == 0:
            route["direction"] = lines[i].strip()
        elif i % 3 == 1:
            polyline = lines[i].strip()

            # switch lon and lat
            coords = [(lon, lat) for lat, lon in decode_polyline(polyline)]
            linestring = LineString(coords)
            buf_start, buf_end = compute_buffers(linestring)
            route["geom"] = linestring
            route["buf_start"] = buf_start
            route["buf_end"] = buf_end
            entries.append(route)
            route = {
            "day": day,
            "line": transport_line,
            "type": transport_type,
            }


    return entries

def insert_entry(entry):
    cur.execute("""
        INSERT INTO routes_geom (day, line, type, direction, geom, buf_start, buf_end)
        VALUES (%s, %s, %s, %s, ST_GeomFromText(%s, 4326), ST_GeomFromText(%s, 4326), ST_GeomFromText(%s, 4326))
        ON CONFLICT (day, line, type, direction) DO NOTHING;
    """, (
        entry["day"],
        entry["line"],
        entry["type"],
        entry["direction"],
        entry["geom"].wkt,
        entry["buf_start"],
        entry["buf_end"]
    ))
    conn.commit()

def insert_routes_geom():
    today_folder = datetime.now().strftime("%Y-%m-%d")
    full_path = os.path.join(BASE_DIR, today_folder)
    if not os.path.isdir(full_path):
        print(f"Today's folder {today_folder} does not exist.")
        return

    for fname in os.listdir(full_path):
        parts = fname.split("_")
        if len(parts) != 3 or not fname.endswith(".txt"):
            continue

        transport, line_num = parts[0], parts[1]
        transport_type = TRANSPORT_TYPE_MAP.get(transport)

        if not transport_type:
            continue
        
        full_file_path = os.path.join(full_path, fname)
        try:
            entries = parse_file(full_file_path, today_folder, transport_type, line_num)
            for entry in entries:
                insert_entry(entry)
        except Exception as e:
            print(f"Failed to parse {full_file_path}: {e}")
    print(f"Inserted routes for today's folder {today_folder} into the database.")
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    insert_routes_geom()
