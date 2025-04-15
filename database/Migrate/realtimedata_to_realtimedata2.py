""""
I have 190 million rows of data
it takes 500 seconds to insert 1 million rows
it takse 26 hours to insert 190 million rows
example measurment
Time spent:  50.22050380706787
Delta:  4.3641884326934814
Total rows inserted: 100000
Batch inserting done

Time spent:  252.70703768730164
Delta:  4.633598327636719
Total rows inserted: 520000
"""


import psycopg2
from psycopg2.extras import execute_values
from geopy.distance import geodesic
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv
import time
load_dotenv(dotenv_path="iaib/database/env.env")

# Access the environment variables
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("PG_TANEL_USER")
db_password = os.getenv("PG_TANEL_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")

     
# Database connection detail
source_db_params = {
    'dbname': db_name,
    'user': db_user,
    'password': db_password,
    'host': db_host,
    'port': db_port
}
target_db_params = {
    'dbname': db_name,
    'user': db_user,
    'password': db_password,
    'host': db_host,
    'port': db_port
}
start_datetime = datetime.strptime("2025-03-28 00:00:00", "%Y-%m-%d %H:%M:%S")
end_datetime = datetime.strptime("2025-03-29 00:00:00", "%Y-%m-%d %H:%M:%S")
# Function to calculate speed and insert into the target database
    # Create a connection to the source and target databases
conn_source = psycopg2.connect(**source_db_params)
conn_target = psycopg2.connect(**target_db_params)
    
# Create a cursor for the source and target connections
cursor_source = conn_source.cursor()
cursor_target = conn_target.cursor()

try:
    while True:
        try:
            # Calculate the start and end of the day for querying
            

            # Query to fetch vehicle movements for the specific day
            query = """
            WITH vehicle_movements AS ( 
                SELECT 
                    *,
                    LEAD(datetime) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_datetime,
                    LEAD(geom) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_geom
                FROM realtimedata
                WHERE datetime >= %s AND datetime < %s
            ), speed_calculation AS (
                SELECT 
                    *,
                    ST_Distance(geom::geography, next_geom::geography) AS distance_meters,
                    EXTRACT(EPOCH FROM (next_datetime - datetime)) AS time_seconds
                FROM vehicle_movements
                WHERE next_datetime IS NOT NULL
            )
            SELECT 
                datetime, LEAST(type, 1000), line, vehicle_id, LEAST(direction,400), destination, geom, unknown1, unknown2,
                LEAST(ROUND((distance_meters / time_seconds) * 3.6)::INT, 250) AS speed
            FROM speed_calculation
            WHERE time_seconds > 0;
            """
            
            cursor_source.execute(query, (start_datetime, end_datetime))
            
            # Fetch all results
            rows = cursor_source.fetchall()

            if not rows:
                print(f"No data found for {start_datetime.date()}.")
                start_datetime = start_datetime + timedelta(days=1)
                end_datetime = end_datetime + timedelta(days=1)
                if start_datetime.date() > datetime.today().date():
                    print("All data inserted successfully.")
                    break
                continue
            # Prepare the data for batch insert
            print(rows[0])
            
            # Insert data into realtimedata2 using batch insert
            insert_query = """
            INSERT INTO realtimedata2 (
                datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2, speed
            ) VALUES %s 
            ON CONFLICT (datetime, vehicle_id) DO NOTHING
            """
            
            execute_values(cursor_target, insert_query, rows)

            # Commit the transaction
            conn_target.commit()

            print(f"Data for {start_datetime.date()} inserted successfully.")
            start_datetime = start_datetime + timedelta(days=1)
            end_datetime = end_datetime + timedelta(days=1)
            if start_datetime.date() > datetime.today().date():
                print("All data inserted successfully.")
                break
        except Exception as e:
            print(f"Erro2: {e}")

except Exception as e:
    print(f"Error: {e}")
finally:
    # Close the cursors and connections
    cursor_source.close()
    cursor_target.close()
    conn_source.close()
    conn_target.close()


