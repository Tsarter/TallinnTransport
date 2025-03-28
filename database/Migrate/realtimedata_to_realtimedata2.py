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
db_user = os.getenv("POSTGRES_USER")
db_password = os.getenv("POSTGRES_PASSWORD")
db_host = os.getenv("POSTGRES_HOST")
db_port = os.getenv("POSTGRES_PORT")

malformed_rows = []

def calculate_speed(prev_row, curr_row):
    if not prev_row or not curr_row:
        return None
    
    prev_time, prev_geom = prev_row
    curr_time, curr_geom = curr_row
    
    if not prev_geom or not curr_geom:
        return None
    
    distance = geodesic((prev_geom[1], prev_geom[0]), (curr_geom[1], curr_geom[0])).meters
    time_diff = (curr_time - prev_time).total_seconds()
    
    if 45 > time_diff > 0:
        speed = int(distance / time_diff * 3.6)  # Convert m/s to km/h
        return min(speed, 255)  # Limit to int2 max (PostgreSQL int2 max is 32767, but keeping it reasonable)
    else:
        # malformed_rows.append([prev_row,curr_row])
        return None

def migrate_data():
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port,
    )
    cur = conn.cursor()
    
    # Select distinct dates
    date = '2024-07-07'
    next_date = '2024-07-08'
    enddate = datetime.today().strftime('%Y-%m-%d')

    prev_data = {}
    performanceStart = time.time()
    prev_perf = 0
    print(f"Start time: {performanceStart}")
    totalRowsInserted = 0
    while date < enddate:
        print(f"Processing date: {date}")
        fetch_query = f"""
            SELECT datetime, line, vehicle_id, ST_X(geom::geometry) AS lon, ST_Y(geom::geometry) AS lat, direction, destination, type, unknown1, unknown2
            FROM realtimedata
            WHERE datetime >= '{date}' AND datetime < '{next_date}'
            ORDER BY vehicle_id, datetime;
        """
        
        cur.execute(fetch_query)
        rows = cur.fetchall()
        
        data_to_insert = []
        
        for row in rows:
            dt, line, vehicle_id, lon, lat, direction, destination, type_, unknown1, unknown2 = row
            
            speed = calculate_speed(prev_data.get(vehicle_id), (dt, (lon, lat)))
            prev_data[vehicle_id] = (dt, (lon, lat))
            
            data_to_insert.append((dt, type_, line, vehicle_id, direction, destination, f'SRID=4326;POINT({lon} {lat})', unknown1, unknown2, speed))
            #data_to_insert = np.append(data_to_insert, [[dt, type_, line, vehicle_id, direction, destination, f'SRID=4326;POINT({lon} {lat})', unknown1, unknown2, speed]], axis=0)

            if  len(data_to_insert) >= 10000:
                print(f"Batch inserting {len(data_to_insert)} rows")
                print("Time spent: ", time.time() - performanceStart)
                print("Delta: ",time.time() - performanceStart - prev_perf)
                totalRowsInserted += len(data_to_insert)
                print(f"Total rows inserted: {totalRowsInserted}")
                prev_perf = time.time() - performanceStart
                execute_values(cur, """
                    INSERT INTO realtimedata2 (datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2, speed)
                    VALUES %s
                    ON CONFLICT (datetime, vehicle_id) DO NOTHING;
                """, data_to_insert)
                conn.commit()
                data_to_insert = []
                print(f"Batch inserting done")

        if data_to_insert:
            execute_values(cur, """
                INSERT INTO realtimedata2 (datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2, speed)
                VALUES %s
                ON CONFLICT (datetime, vehicle_id) DO NOTHING;
            """, data_to_insert)
            conn.commit()

        date = next_date
        next_date = (datetime.strptime(date, '%Y-%m-%d') + timedelta(days=1)).strftime('%Y-%m-%d')
        print(f"Date updated to: {date}")
    
    performanceEnd = time.time()
    print("Time spended: ", performanceEnd - performanceStart)
    cur.close()
    conn.close()

if __name__ == "__main__":
    migrate_data()
