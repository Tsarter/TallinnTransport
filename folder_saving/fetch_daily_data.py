# fetch_daily_data.py

import requests
import os
from datetime import datetime
import time
from config import (
    ROUTE_URL,
    ROUTE_DATA_DIR,
    BUS_TIMES_URL,
    BUS_TIMES_DATA_DIR,
    STOPS_URL,
    STOPS_DATA_DIR,
    INTERRUPTIONS_URL,
    INTERRUPTIONS_DATA_DIR,
)


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
    response = requests.get(ROUTE_URL)
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


def fetch_interruptions_data():
    response = requests.get(INTERRUPTIONS_URL)
    today = datetime.now().strftime("%Y-%m-%d")
    os.makedirs(f"{INTERRUPTIONS_DATA_DIR}/{today}", exist_ok=True)
    with open(
        f"{INTERRUPTIONS_DATA_DIR}/{today}/interruptions.txt", "w", encoding="utf-8"
    ) as file:
        file.write(response.text)


def fetch_daily_data():

    bus_time_data = fetch_bus_times_data()
    fetch_stops_data()
    fetch_interruptions_data()
    get_routes_data(bus_time_data)


fetch_daily_data()
