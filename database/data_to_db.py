import os
import sqlite3

# SQLite database file path
DB_PATH = "/home/tanel/Documents/public_transport_project/HardDrive/data.db"

# Directory containing the text files
DATA_DIR = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/realtime_data/2024-12-28"  # Change this to your folder path

def save_to_database(data, timestamp):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    rows = data.split("\n")

    # '3,2,24729150,59441910,,115,96,Z,29,Suur-Paala'
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

        composite_id = f"{timestamp}{vehicle_id}{line}"

        # Insert into the database
        cursor.execute(
            """
            INSERT INTO features (
                id, timestamp, type, line, latitude, longitude, direction, unknown1, unknown2, destination, vehicle_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (composite_id, timestamp, vehicle_type, line, latitude, longitude, direction, unknown1, unknown2, destination, vehicle_id),
        )

    conn.commit()
    conn.close()


def process_files_in_directory(directory):
    # Loop through all files in the directory
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)

        # Check if the file is a .txt file
        if os.path.isfile(file_path) and filename.endswith('.txt'):
            # Extract timestamp from the filename or from file content (if needed)
            timestamp = filename.split('.')[0]  # Assuming timestamp is in the filename
            
            # Open and read the .txt file
            with open(file_path, 'r', encoding="utf-8") as file:
                data = file.read()
                save_to_database(data, timestamp)
                print(f"Processed {filename}")

if __name__ == "__main__":
    process_files_in_directory(DATA_DIR)
