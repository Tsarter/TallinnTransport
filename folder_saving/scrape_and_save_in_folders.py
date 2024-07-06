import requests
import os
from datetime import datetime
import time


def fetch_realtime_data():
    url = "https://gis.ee/tallinn/gps.php"
    response = requests.get(url)
    timestamp = datetime.now().strftime("%H-%M-%S")
    folder_path = f'realtime_data/{datetime.now().strftime("%Y-%m-%d")}'
    os.makedirs(folder_path, exist_ok=True)
    with open(f"{folder_path}/{timestamp}.json", "w") as file:
        file.write(response.text)


def fetch_daily_data():
    today = datetime.now().strftime("%Y-%m-%d")
    # Route Coordinates
    url = "https://transport.tallinn.ee/data/tallinna-linn_bus_18.txt"
    response = requests.get(url)
    os.makedirs(f"routes_data/{today}", exist_ok=True)
    with open(f"routes_data/{today}/bus_18_routes.txt", "w") as file:
        file.write(response.text)

    # Bus Times
    url = "https://transport.tallinn.ee/data/routes.txt"
    response = requests.get(url)
    os.makedirs(f"bus_times_data/{today}", exist_ok=True)
    with open(f"bus_times_data/{today}/routes.txt", "w") as file:
        file.write(response.text)

    # Stop Locations
    url = "https://transport.tallinn.ee/data/stops.xml"
    response = requests.get(url)
    os.makedirs(f"stops_data/{today}", exist_ok=True)
    with open(f"stops_data/{today}/stops.xml", "w") as file:
        file.write(response.text)

    # Interruptions
    url = "https://transport.tallinn.ee/tabloconfig2021.php"
    response = requests.get(url)
    os.makedirs(f"interruptions_data/{today}", exist_ok=True)
    with open(f"interruptions_data/{today}/interruptions.txt", "w") as file:
        file.write(response.text)


# Fetch realtime data every 30 seconds
while True:
    fetch_realtime_data()
    time.sleep(30)

# Call fetch_daily_data function once every day in the morning
# e.g., you can use a cron job or schedule library to run this part
fetch_daily_data()
