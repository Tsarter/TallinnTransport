import os
import json
import psycopg2
from datetime import datetime
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path="iaib/database/env.env")

# Access the environment variables
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("PG_TANEL_USER")
db_password = os.getenv("PG_TANEL_PASSWORD")
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

# Path to your main folder containing daily folders
BASE_FOLDER = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/realtime_data"

# Connect to PostgreSQL
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()


# Function to process a single JSON file and extract data
def process_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding JSON: {file_path}")
            return []

    timestamp = datetime.fromisoformat(data["timestamp"])
    rows = []

    for feature in data["features"]:
        props = feature["properties"]
        geom = feature["geometry"]["coordinates"]

        rows.append(
            (
                timestamp,  # datetime
                props.get("type"),  # type
                str(props["line"]),  # line
                str(props["id"]),  # vehicle_id
                props.get("direction"),  # direction
                None,  # destination (unknown)
                f"SRID=4326;POINT({geom[0]} {geom[1]})",  # geom
                None,
                None,  # unknown1, unknown2
            )
        )

    return rows

def process_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    day = file_path.split("/")[-2]
    time = file_path.split("/")[-1].split(".")[0].replace("-", ":")
    timestamp = datetime.fromisoformat(f"{day}T{time}")
    if timestamp < datetime(2025, 2, 15):
        return []
    rows = []

    for line in lines:
        parts = line.strip().split(",")
        if len(parts) != 10:
            continue
        lon = int(parts[2]) / 1000000
        lat = int(parts[3]) / 1000000
        rows.append(
            (
                timestamp,  # datetime
                parts[0],  # type
                parts[1],  # line
                parts[6],  # vehicle_id
                parts[5],  # direction
                parts[9],  # destination
                f"SRID=4326;POINT({lon} {lat})",  # geom
                parts[7],  # unknown1
                parts[8],  # unknown2
            )
        )

    return rows


stop = False
# Iterate through folders and process JSON files
for day_folder in sorted(os.listdir(BASE_FOLDER)):
    day_path = os.path.join(BASE_FOLDER, day_folder)

    if not os.path.isdir(day_path):
        continue  # Skip non-folder files

    print(f"Processing {day_folder}...")

    rows = []
    for file in sorted(os.listdir(day_path)):
        json_path = os.path.join(day_path, file)

        if file.endswith(".json"):
            # Stop if we encounter a non-JSON file
           rows.extend(process_json(json_path))
        
        elif file.endswith(".txt"):
            rows.extend(process_txt(json_path))

        if not rows:
            print(f"No data extracted from {file}")
            continue
        # Insert into PostgreSQL
        if stop == True:
            conn.commit()
            cur.close()
            conn.close()
            break

    insert_query = """
        INSERT INTO realtimedata (
            datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2
        ) VALUES %s
        ON CONFLICT DO NOTHING;
    """    
    execute_values(cur, insert_query, rows)
    conn.commit()
cur.close()
conn.close()
print("Data insertion complete.")
