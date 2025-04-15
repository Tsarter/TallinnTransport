import xml.etree.ElementTree as ET
import psycopg2
import os

config_path = os.path.join(os.path.dirname(__file__), "..", "env.env")
db_config = {}
with open(config_path, "r") as config_file:
    for line in config_file:
        key, value = line.strip().split("=")
        db_config[key] = value

# Database connection
conn = psycopg2.connect(
    dbname=db_config["POSTGRES_DB"],
    user=db_config["PG_TANEL_USER"],
    password=db_config["PG_TANEL_PASSWORD"],
    host=db_config["POSTGRES_HOST"],
    port=db_config["POSTGRES_PORT"],
)
cur = conn.cursor()

# Parse XML file
tree = ET.parse("iaib/database/Insert/stops.xml")
root = tree.getroot()

# Insert stops
for stop in root.findall("stop"):
    stop_id = stop.get("id")
    id0 = int(stop.get("id0"))
    name = stop.get("name")
    lat = float(stop.get("lat"))
    lon = float(stop.get("lon"))

    # Insert into stops table
    cur.execute(
        "INSERT INTO stops (id, id0, name, location) VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326)) ON CONFLICT (id) DO NOTHING",
        (stop_id, id0, name, lon, lat),
    )

    # Insert routes
    for route in stop.findall("route"):
        transport = route.get("transport")
        num = route.get("num")
        direction = route.get("direction")
        direction_name = route.get("directionName")
        stop_num = int(route.get("stopNum"))

        cur.execute(
            "INSERT INTO routes (stop_id, transport, num, direction, direction_name, stop_num) VALUES (%s, %s, %s, %s, %s, %s)",
            (stop_id, transport, num, direction, direction_name, stop_num),
        )

# Commit changes and close connection
conn.commit()
cur.close()
conn.close()
