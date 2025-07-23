# config.py

DATA_DIR = (
    "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data"
)

# Realtime Location Data
# https://gis.ee/tallinn/gps.php | https://transport.tallinn.ee/readfile.php?name=gps.txt | https://gis.ee/tallinn/gps.txt
REALTIME_URL = "https://gis.ee/tallinn/gps.php"
REALTIME_URL_TXT = "https://transport.tallinn.ee/readfile.php?name=gps.txt"
REALTIME_DATA_DIR = DATA_DIR + "/realtime_data"

# Route Coordinates Data
ROUTE_URL = "https://transport.tallinn.ee/data/tallinna-linn_"
ROUTE_DATA_DIR = DATA_DIR + "/routes_data"

# Bus Leaving Times and Stops
BUS_TIMES_URL = "https://transport.tallinn.ee/data/routes.txt"
BUS_TIMES_DATA_DIR = DATA_DIR + "/bus_times_data"

# Stop Locations and Bus Information
STOPS_URL = "https://transport.tallinn.ee/data/stops.xml"
STOPS_DATA_DIR = DATA_DIR + "/stops_data"

# Interruptions Data
INTERRUPTIONS_URL = "https://transport.tallinn.ee/interruptions.json"
INTERRUPTIONS_DATA_DIR = DATA_DIR + "/interruptions_data"

# Announcements Data
ANNOUNCEMENTS_URL = "https://transport.tallinn.ee/announcements.json"
ANNOUNCEMENTS_DATA_DIR = DATA_DIR + "/announcements_data"

# GFTS Data
GTFS_URL = "https://transport.tallinn.ee/data/gtfs.zip"
GFTS_URL = "https://peatus.ee/gtfs/gtfs.zip"
GTFS_DATA_DIR = DATA_DIR + "/GTFS_data"
GFTS_TALLINNA_LINNATRANSPORDI_AS_ID = "56"