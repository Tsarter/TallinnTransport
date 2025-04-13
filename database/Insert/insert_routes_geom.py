import os
import psycopg2
from datetime import datetime
from polyline import decode as decode_polyline
from shapely.geometry import LineString

# Constants
BASE_DIR = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/routes_data"
TRANSPORT_TYPE_MAP = {'bus': 2, 'tram': 3, 'trol': 1}
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path="iaib/database/env.env")

# Access the environment variables
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")

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

def parse_file(filepath, day, transport_type, transport_line):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.read().strip().split("\n")
    
    # if file contains "<!DOCTYPE then it is not a valid file
    if lines[0].startswith("<!DOCTYPE"):
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
            route["geom"] = LineString(coords)
            entries.append(route)
            route = {
            "day": day,
            "line": transport_line,
            "type": transport_type,
            }


    return entries

def insert_entry(entry):
    cur.execute("""
        INSERT INTO routes_geom (day, line, type, direction, geom)
        VALUES (%s, %s, %s, %s, ST_GeomFromText(%s, 4326))
        ON CONFLICT (day, line, type, direction) DO NOTHING;
    """, (
        entry["day"],
        entry["line"],
        entry["type"],
        entry["direction"],
        entry["geom"].wkt
    ))
    conn.commit()

def main():
    for date_folder in sorted(os.listdir(BASE_DIR)):
        full_path = os.path.join(BASE_DIR, date_folder)
        if not os.path.isdir(full_path):
            continue
        
        try:
            date_obj = datetime.strptime(date_folder, "%Y-%m-%d").date()
        except ValueError:
            continue

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
                entries = parse_file(full_file_path, date_obj, transport_type, line_num)
                for entry in entries:
                    insert_entry(entry)
            except Exception as e:
                print(f"Failed to parse {full_file_path}: {e}")
        print(f"Inserted routes for {date_folder} into the database.")
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
