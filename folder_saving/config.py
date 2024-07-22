# config.py

DATA_DIR = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data"

DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1258765586167758870/WgUJ-wPgZMFXnspyBDNdZQBGg7GVeBwjI0EsBM_Ofe8tJPVvj3qEzOq4gbCeuBrDRw6I"

# Realtime Location Data
REALTIME_URL = "https://gis.ee/tallinn/gps.php"
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
INTERRUPTIONS_URL = "https://transport.tallinn.ee/tabloconfig2021.php"
INTERRUPTIONS_DATA_DIR = DATA_DIR + "/interruptions_data"

# lock, Everythin got deleted, so I am trying to avoid it now
LOCK_FILE = "/home/tanel/Documents/public_transport_project/TransportInfoScraper/folder_saving/tmp/harddrive.lock"
