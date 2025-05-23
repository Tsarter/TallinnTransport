import os
import sqlite3
from dotenv import load_dotenv
import psycopg2
from datetime import datetime

from psycopg2.extras import execute_values

# SQLite connection
sqlite_conn = sqlite3.connect("D:/Transport_baka/Backup_02_02-2025/data.db")
sqlite_cursor = sqlite_conn.cursor()

load_dotenv(dotenv_path="iaib/database/env.env")
# Access the environment variables
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("PG_TANEL_USER")
db_password = os.getenv("PG_TANEL_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")
# Connect to PostgreSQL
pg_conn = psycopg2.connect(
    dbname=db_name,
    user=db_user,
    host=db_host,
    port=db_port,
)
pg_cursor = pg_conn.cursor()

# Define chunk size to avoid memory overload (adjust as needed)
chunk_size = 100000

# SQLite query to select all records
sqlite_cursor.execute(
    "SELECT id, date, time, type, line, latitude, longitude, direction,unknown1, unknown2, destination, vehicle_id FROM features where date > '2024-12-26'  ORDER BY date, time ;"
)

# rows in wrong order, skip first 450000 rows.
# Process data in chunks
while True:
    rows = sqlite_cursor.fetchmany(chunk_size)
    if not rows:
        break

    # Prepare data for TimescaleDB (convert date and time into datetime)
    records = []
    for row in rows:
        (
            id_,
            date,
            time,
            type_,
            line,
            latitude,
            longitude,
            direction,
            unknown1,
            unknown2,
            destination,
            vehicle_id,
        ) = row
        datetime_str = f"{date} {time}"
        datetime_obj = datetime.strptime(datetime_str, "%Y-%m-%d %H-%M-%S")
        # split longitude so that 59437530.0 becomes 59.437530
        latitude = latitude / 1000000
        longitude = longitude / 1000000
        if (
            datetime_obj
            and isinstance(type_, int)
            and isinstance(line, str)
            and isinstance(latitude, float)
            and isinstance(longitude, float)
            and isinstance(direction, int)
            and isinstance(destination, str)
            and isinstance(vehicle_id, int)
            and isinstance(unknown1, str)
            and isinstance(unknown2, int)
        ):
            geom = f"SRID=4326;POINT({longitude} {latitude})"
            records.append(
                (
                    datetime_obj,
                    type_,
                    line,
                    vehicle_id,
                    direction,
                    destination,
                    geom,
                    unknown1,
                    unknown2,
                )
            )
        else:
            print("Invalid record:", row)

    # Insert data into TimescaleDB in batches
    print(f"last record time: {datetime_obj}")
    insert_query = """
        INSERT INTO realtimedata (datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2)
        VALUES %s
        ON CONFLICT DO NOTHING;
    """

    """ pg_cursor.executemany(
        insert_query,
        records,
    ) """
    execute_values(pg_cursor, insert_query, records)
    pg_conn.commit()  # Commit after each batch
    print("database now has: ", pg_cursor.rowcount, " records")

# Close connections
sqlite_conn.close()
pg_conn.close()

print("Data transfer complete.")
