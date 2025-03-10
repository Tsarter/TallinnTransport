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

# Path to your main folder containing daily folders
BASE_FOLDER = "D:/Transport_baka/Backup_05_10_2024/transport_data/realtime_data"

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


stop = False
# Iterate through folders and process JSON files
for day_folder in sorted(os.listdir(BASE_FOLDER)):
    day_path = os.path.join(BASE_FOLDER, day_folder)

    if not os.path.isdir(day_path):
        continue  # Skip non-folder files

    print(f"Processing {day_folder}...")

    for json_file in sorted(os.listdir(day_path)):
        json_path = os.path.join(day_path, json_file)

        if not json_file.endswith(".json"):
            # Stop if we encounter a non-JSON file
            print(f"Skipping {json_file}...")
            continue

        rows = process_json(json_path)
        if not rows:
            print(f"No data extracted from {json_file}")
            continue
        # Insert into PostgreSQL
        insert_query = """
            INSERT INTO realtimedata (
                datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2
            ) VALUES %s
            ON CONFLICT DO NOTHING;
        """
        execute_values(cur, insert_query, rows)
        if stop == True:
            conn.commit()
            cur.close()
            conn.close()
            break
    conn.commit()
cur.close()
conn.close()
print("Data insertion complete.")
