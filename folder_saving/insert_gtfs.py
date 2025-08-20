import os
import psycopg2
import zipfile
import pandas as pd
from dotenv import load_dotenv
from io import TextIOWrapper
from shapely.geometry import LineString
from shapely import wkb

gtfs_zip_path = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/GTFS_data/latest_gtfs.zip"


load_dotenv(dotenv_path="/home/tanel/Documents/public_transport_project/iaib/database/env.env")

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
# Connect to DB
conn = psycopg2.connect(**DB_CONFIG)


def read_gtfs_file(zip_file, filename):
    """Extract a specific GTFS file from the zip and return a pandas DataFrame."""
    with zip_file.open(filename) as file:
        return pd.read_csv(TextIOWrapper(file, encoding='utf-8'))
    
def insert_dataframe(df, table_name, cursor, connection):
    """Insert dataframe rows into PostgreSQL table."""
    if df.empty:
        print(f"⚠️ {table_name} is empty.")
        return
    columns = ','.join(df.columns)
    values = ','.join([f"%({col})s" for col in df.columns])
    query = f"INSERT INTO {table_name} ({columns}) VALUES ({values})"

    for _, row in df.iterrows():
        try:
            ructor = row.to_dict()
            cursor.execute(query, ructor)
        except psycopg2.errors.UniqueViolation:
            pass  # Skip duplicates
        except Exception as e:
            print(f"❌ Error inserting into {table_name}: {e}")
            connection.rollback()
            continue

def truncate_table(cursor, table_name):
    try:
        cursor.execute(f"TRUNCATE TABLE {table_name} RESTART IDENTITY CASCADE;")
        print(f"🧹 Truncated {table_name}")
    except Exception as e:
        print(f"❌ Failed to truncate {table_name}: {e}")

def main():
    with zipfile.ZipFile(gtfs_zip_path, 'r') as zip_file:
        routes_df = read_gtfs_file(zip_file, "routes.txt")
        shapes_df = read_gtfs_file(zip_file, "shapes.txt")
        trips_df  = read_gtfs_file(zip_file, "trips.txt")
        stops_df = read_gtfs_file(zip_file, "stops.txt")

    # Clean up GTFS data to match your schema
    routes_df = routes_df[[
        "route_id", "route_short_name", "route_long_name", "route_desc",
        "route_type", "route_url", "route_color", "route_text_color", "route_sort_order"
    ]]

    shapes_df = shapes_df[[
        "shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"
    ]]

    trips_df = trips_df[[
        "trip_id", "route_id", "service_id", "trip_headsign", "direction_id",
        "block_id", "shape_id", "wheelchair_accessible", "block_code",
        "vehicle_type", "thoreb_id"
    ]]
    stops_df = stops_df[["stop_id", "stop_code", "stop_name", "stop_desc", "stop_lat", "stop_lon", "thoreb_id"]]

    routes_df = routes_df.where(pd.notnull(routes_df), None)
    trips_df = trips_df.where(pd.notnull(trips_df), None)
    trips_df["wheelchair_accessible"] = trips_df["wheelchair_accessible"].fillna(-1)

    def create_linestring(group):
        points = group.sort_values("shape_pt_sequence")[["shape_pt_lon", "shape_pt_lat"]].values
        return LineString(points)

    shapes_df = shapes_df.groupby("shape_id").apply(create_linestring).reset_index()
    shapes_df.columns = ["shape_id", "shape_geom"]
    shapes_df["shape_geom"] = shapes_df["shape_geom"].apply(lambda geom: wkb.dumps(geom, hex=True, srid=4326))

    from shapely import wkt

    stops_df["location"] = stops_df.apply(
        lambda row: f"POINT({row['stop_lon']} {row['stop_lat']})", axis=1
    )
    stops_df["location"] = stops_df["location"].apply(
        lambda loc: wkb.dumps(wkt.loads(loc), hex=True, srid=4326)
    )
    stops_df = stops_df.drop(columns=["stop_lat", "stop_lon"])
    stops_df["id"] = stops_df["stop_id"].astype(str)

    # Connect and insert into DB
    with psycopg2.connect(**DB_CONFIG) as conn:
        conn.autocommit = True
        with conn.cursor() as cur:
            print("⬇️ Inserting into stops...")
            truncate_table(cur, "stops")
            insert_dataframe(stops_df, "stops", cur, conn)
            print("✅ Stops inserted successfully.")

            print("⬇️ Inserting into trips...")
            truncate_table(cur, "trips")
            insert_dataframe(trips_df, "trips", cur, conn)
            print("✅ Trips inserted successfully.")

            print("⬇️ Inserting into routes...")
            truncate_table(cur, "routes")
            insert_dataframe(routes_df, "routes", cur, conn)
            print("✅ Routes inserted successfully.")

            print("⬇️ Inserting into shapes...")
            truncate_table(cur, "shapes")
            insert_dataframe(shapes_df, "shapes", cur, conn)
            print("✅ Shapes inserted successfully.")

            

    print("✅ GTFS data imported successfully.")

if __name__ == "__main__":
    main()