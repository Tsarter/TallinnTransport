import sqlite3
import psycopg2
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from psycopg2.extras import execute_values

load_dotenv(dotenv_path="iaib/database/env.env")

# Access the environment variables
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")

# Connect to SQLite
sqlite_conn = sqlite3.connect(
    "C:/home/tanel\Documents/public_transport_project/HardDrive/data.db"
)
sqlite_cursor = sqlite_conn.cursor()

# Connect to PostgreSQL
pg_conn = psycopg2.connect(
    dbname=db_name,
    user=db_user,
    password=db_password,
    host=db_host,
    port=db_port,
)
pg_cursor = pg_conn.cursor()

# Get the start date
start_date = "2024-10-07"
start_date = datetime.strptime(start_date, "%Y-%m-%d")

# Loop through days
current_date = start_date
while True:
    date_str = current_date.strftime("%Y-%m-%d")
    print(f"Processing data for: {date_str}")
    # if date is 2024-11-17, break the loop
    if date_str == "2024-11-17":
        print("Data transfer complete.")
        break

    # Fetch data for the current day
    sqlite_cursor.execute(
        "SELECT id, date, time, type, line, latitude, longitude, direction, vehicle_id FROM realtimejson WHERE date = ? ORDER BY time",
        (date_str,),
    )
    rows = sqlite_cursor.fetchall()

    if not rows:
        print("No more data to process.")
        break

    # Transform and insert data
    insert_query = """
            INSERT INTO realtimedata (
                datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2
            ) VALUES %s
            ON CONFLICT DO NOTHING;
        """

    transformed_rows = []

    for row in rows:
        transformed_rows.append(
            (
                datetime.strptime(
                    row[1] + " " + row[2].replace("-", ":"), "%Y-%m-%d %H:%M:%S"
                ),  # datetime
                row[3],
                row[4],
                row[8],  # vehicle_id
                row[7],  # direction
                None,  # destination (unknown)
                f"SRID=4326;POINT({row[6]} {row[5]})",  # geom
                None,
                None,  # unknown1, unknown2
            )
        )
    execute_values(pg_cursor, insert_query, transformed_rows)
    pg_conn.commit()

    print(f"Inserted {len(rows)} records for {date_str}")

    # Move to the next day
    current_date += timedelta(days=1)

# Close connections
sqlite_conn.close()
pg_conn.close()
print("Data transfer complete.")
