import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv
import os

from datetime import datetime, timedelta

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
    password=db_password
)
pg_cursor = pg_conn.cursor()


# Define the start time and end time for the one-hour window
start_time = datetime(2024, 7, 6, 13, 0, 0)  # Example start time: '2025-02-02 00:00:00'
end_time = start_time + timedelta(hours=1)

runLoop = True

while runLoop:
    # Execute the query to find vehicle speeds for the current hour's data
    pg_cursor.execute("""
    WITH vehicle_movements AS (
        SELECT 
            vehicle_id,
            datetime,
            line,
            geom,
            LEAD(datetime) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_datetime,
            LEAD(geom) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_geom
        FROM realtimedata 
        WHERE datetime >= %s AND datetime < %s
        ORDER BY datetime
    ),
    speed_calculation AS (
        SELECT 
            vehicle_id,
            datetime,
            line,
            next_datetime,
            ST_Distance(geom::geography, next_geom::geography) AS distance_meters,
            EXTRACT(EPOCH FROM (next_datetime - datetime)) AS time_seconds
        FROM vehicle_movements
        WHERE next_datetime IS NOT NULL
    )
    SELECT 
        vehicle_id,
        line,
        datetime,
        (distance_meters / time_seconds) * 3.6 AS speed_kmh
    FROM speed_calculation
    WHERE time_seconds > 15 AND time_seconds <= 40
    ORDER BY datetime;
    """, (start_time, end_time))

    results = pg_cursor.fetchall()

    if not results:
        # If no results, break out of the loop
        print(f"No results for the time range {start_time} to {end_time}.")
        break

    # Process the current batch of results
    print(f"Found {len(results)} speeds to insert for the hour {start_time} to {end_time}.")
    
    # Insert the results into the realtimedata table (inserting into the speed column)
    # Prepare a list of tuples for bulk update
    update_data = [
        (int(result[3]), result[2], result[1], result[0])  # (speed_kmh, datetime, line, vehicle_id)
        for result in results if int(result[3]) <= 100  # Filter out speeds greater than 100
    ]
    # Update the data row by row using execute_batch
    
    execute_batch(pg_cursor, """
        UPDATE realtimedata
        SET speed = %s
        WHERE datetime = %s
          AND line = %s
          AND vehicle_id = %s;
        """, update_data)
    # Commit the transaction to apply the updates

    # Commit the transaction to apply the updates
    pg_conn.commit()

    # Move to the next hour
    start_time = end_time
    end_time = start_time + timedelta(hours=1)

# Close the connection when done  2024-07-11 02:59:56+03
pg_conn.close()
