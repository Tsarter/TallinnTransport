import sqlite3
import psycopg2
from datetime import datetime

# SQLite connection
sqlite_conn = sqlite3.connect('/home/tanel/Documents/public_transport_project/HardDrive/data.db')
sqlite_cursor = sqlite_conn.cursor()

# PostgreSQL connection
pg_conn = psycopg2.connect(
    dbname="transport_db",
    user="postgres",
    password="postgres",
    host="localhost",  
    port="5432" 
)
pg_cursor = pg_conn.cursor()

# Define chunk size to avoid memory overload (adjust as needed)
chunk_size = 1000000

# SQLite query to select all records
sqlite_cursor.execute("SELECT id, date, time, type, line, latitude, longitude, direction, vehicle_id, rowid FROM realtimejson ")

sqlite_cursor.fetchmany(450000) # rows in wrong order, skip first 450000 rows.
# Process data in chunks
while True:
    rows = sqlite_cursor.fetchmany(chunk_size)
    if not rows:
        break
    
    # Prepare data for TimescaleDB (convert date and time into datetime)
    records = []
    for row in rows:
        id_, date, time, type_, line, latitude, longitude, direction, vehicle_id, rowid = row
        datetime_str = f"{date} {time}"
        datetime_obj = datetime.strptime(datetime_str, "%Y-%m-%d %H-%M-%S")
        records.append((
            datetime_obj, type_, line, latitude, longitude, direction, vehicle_id
        ))
    
    # Insert data into TimescaleDB in batches
    print(f"last record time: {datetime_obj}")

    pg_cursor.executemany("""
        INSERT INTO realtimejson (time, type, line, latitude, longitude, direction, vehicle_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, records)
    pg_conn.commit()  # Commit after each batch
    print("database now has: ", pg_cursor.rowcount, " records")
 
# Close connections
sqlite_conn.close()
pg_conn.close()

print("Data transfer complete.")
