import os
import sqlite3
import json

# SQLite database file path
DB_PATH = "/home/tanel/Documents/public_transport_project/HardDrive/data.db"

# Directory containing subfolders with name as year-month-day, each folder contains data for the day
DATA_DIR = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/realtime_data/2025-01-02"


def convert_txt(data, timestamp):
    rows = data.split("\n")
    date = timestamp.split("_")[0]
    time = timestamp.split("_")[1]

    # Prepare a list to store all data for batch insert
    insert_data = []

    for row in rows:
        fields = row.split(",")
        if len(fields) != 10:
            continue

        # Extract fields
        vehicle_type = fields[0]
        line = fields[1]
        longitude = fields[2]
        latitude = fields[3]
        empty = fields[4]
        direction = fields[5]
        vehicle_id = fields[6]
        unknown1 = fields[7]
        unknown2 = fields[8]
        destination = fields[9]

        # Composite ID: timestamp-vehicle_id-line (ensure it's unique)
        composite_id = f"{timestamp}-{vehicle_id}-{line}"

        # Append data to the list for batch insertion
        insert_data.append(
            (
                composite_id,
                date,
                time,
                vehicle_type,
                line,
                latitude,
                longitude,
                direction,
                unknown1,
                unknown2,
                destination,
                vehicle_id,
            )
        )
    return insert_data


def convert_json(data, timestamp):

    insert_data = []
    date = timestamp.split("_")[0]
    time = timestamp.split("_")[1]

    for row in data.get("features", []):
        properties = row.get("properties", {})
        coordinates = row.get("geometry", {}).get("coordinates", [])

        vehicle_type = properties.get("type", "")
        line = properties.get("line", "")
        longitude = coordinates[0]
        latitude = coordinates[1]
        direction = properties.get("direction", "")
        vehicle_id = properties.get("id", "")

        composite_id = f"{timestamp}_{vehicle_id}_{line}"

        insert_data.append(
            (
                composite_id,
                date,
                time,
                vehicle_type,
                line,
                latitude,
                longitude,
                direction,
                vehicle_id,
            )
        )
    return insert_data


def save_to_database(data, timestamp):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")

    if type(data) == str:

        insert_data = convert_txt(data, timestamp)
        cursor.executemany(
            """
            INSERT OR IGNORE INTO features (
                id, date,time, type, line, latitude, longitude, direction, unknown1, unknown2, destination, vehicle_id
            ) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            insert_data,
        )
    if type(data) == dict:
        insert_data = convert_json(data, timestamp)
        cursor.executemany(
            """
            INSERT OR IGNORE INTO realtimejson (
                id, date,time, type, line, latitude, longitude, direction, vehicle_id
            ) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?)
            """,
            insert_data,
        )

    conn.commit()
    conn.close()


def process_files_in_directory(directory):
    # Loop through all files and subdirectories in the directory
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            # Check if the file is a .txt file
            if filename.endswith(".txt") or filename.endswith(".json"):
                file_path = os.path.join(dirpath, filename)

                head_tail = os.path.split(dirpath)
                timestamp = head_tail[1] + "_" + filename.split(".")[0]

                try:
                    # Open and read the .txt file
                    with open(file_path, "r", encoding="utf-8") as file:
                        data = file.read()
                        if filename.endswith(".json"):
                            data = json.loads(data)
                        save_to_database(data, timestamp)
                        print(f"Processed {file_path}")
                except Exception as e:

                    print(f"Error processing {file_path}: {e}")


if __name__ == "__main__":
    process_files_in_directory(DATA_DIR)
