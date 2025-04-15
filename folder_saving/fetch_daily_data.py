# fetch_daily_data.py

import requests
import json
import os
from datetime import datetime
import time
import sys
from config import (
    ROUTE_URL,
    ROUTE_DATA_DIR,
    BUS_TIMES_URL,
    BUS_TIMES_DATA_DIR,
    STOPS_URL,
    STOPS_DATA_DIR,
    ANNOUNCEMENTS_URL,
    ANNOUNCEMENTS_DATA_DIR
)
from notify_discord import notify_discord, notify_error_discord
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from iaib.folder_saving.insert_routes_geom import insert_routes_geom
def get_routes_data(data):
    rows = data.split("\n")
    current_type = ""
    for row in rows:
        row = row.split(";")
        if len(row) < 4:
            continue
        if row[3] != "":
            current_type = row[3]

        # "(" means there is some extra info about line.
        # e.g (al 10.jun) or (10.jun - 12.jun)
        if row[0] != "" and "(" not in row[0]:
            if current_type in ["bus", "tram", "trol"]:
                fetch_route_data(current_type, row[0])
                time.sleep(1)


def fetch_route_data(type, nr):
    # Example: https://transport.tallinn.ee/data/tallinna-linn_bus_18.txt
    nr = nr.lower()
    response = requests.get(ROUTE_URL + f"{type}_{nr}.txt")
    today = datetime.now().strftime("%Y-%m-%d")
    os.makedirs(f"{ROUTE_DATA_DIR}/{today}", exist_ok=True)
    with open(
        f"{ROUTE_DATA_DIR}/{today}/{type}_{nr}_routes.txt", "w", encoding="utf-8"
    ) as file:
        file.write(response.text)
    


def fetch_bus_times_data():
    response = requests.get(BUS_TIMES_URL)
    today = datetime.now().strftime("%Y-%m-%d")
    os.makedirs(f"{BUS_TIMES_DATA_DIR}/{today}", exist_ok=True)
    with open(
        f"{BUS_TIMES_DATA_DIR}/{today}/routes.txt", "w", encoding="utf-8"
    ) as file:
        file.write(response.text)
    return response.text


def fetch_stops_data():
    response = requests.get(STOPS_URL)
    today = datetime.now().strftime("%Y-%m-%d")
    os.makedirs(f"{STOPS_DATA_DIR}/{today}", exist_ok=True)
    with open(f"{STOPS_DATA_DIR}/{today}/stops.xml", "w", encoding="utf-8") as file:
        file.write(response.text)
    return response.text

def fetch_announcements_data():
    response = requests.get(ANNOUNCEMENTS_URL)
    today = datetime.now().strftime("%Y-%m-%d")
    os.makedirs(f"{ANNOUNCEMENTS_DATA_DIR}/{today}", exist_ok=True)
    with open(f"{ANNOUNCEMENTS_DATA_DIR}/{today}/announcement.json", "w", encoding="utf-8") as file:
        json.dump(response.json(), file)
    return response.text

def fetch_daily_data():
        try:
            fetch_announcements_data()
            bus_time_data = fetch_bus_times_data()
            fetch_stops_data()
            get_routes_data(bus_time_data)
            print("done")
        except Exception as e:
            print(e + str(datetime.now()))
            notify_error_discord()
        finally:
            notify_discord()
            insert_routes_geom()

fetch_daily_data()
