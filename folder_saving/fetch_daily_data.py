# fetch_daily_data.py

import requests
import json
import os
from datetime import datetime
import time
import sys
from email.utils import parsedate_to_datetime

from config import (
    GFTS_TALLINNA_LINNATRANSPORDI_AS_ID,
    GTFS_DATA_DIR,
    GTFS_URL,
    ROUTE_URL,
    ROUTE_DATA_DIR,
    BUS_TIMES_URL,
    BUS_TIMES_DATA_DIR,
    STOPS_URL,
    STOPS_DATA_DIR,
    ANNOUNCEMENTS_URL,
    ANNOUNCEMENTS_DATA_DIR
)
from onlyKeepTallinnInGFTSzip import filter_gtfs_by_agency
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

def fetch_gfts_data():
    remote_modified = get_remote_last_modified(GTFS_URL)
    if remote_modified is None:
        raise Exception("Failed to fetch remote last modified date.")
    
    # Save the remote_modified timestamp to a file for persistence
    remote_modified_file = f"{GTFS_DATA_DIR}/remote_modified.txt"
    if os.path.exists(remote_modified_file):
        with open(remote_modified_file, "r") as file:
            saved_remote_modified = datetime.fromisoformat(file.read().strip())
    else:
        saved_remote_modified = None

    if saved_remote_modified is None or remote_modified > saved_remote_modified:
        # Download the file if no saved timestamp or a newer version is available
        
        with open(remote_modified_file, "w") as file:
            file.write(remote_modified.isoformat())
        zipFile = download_file(GTFS_URL)
        today = datetime.now().strftime("%Y-%m-%d")
        output_zip_path = os.path.join(GTFS_DATA_DIR, today + "_gtfs.zip") 
        # Save the downloaded file
        with open(output_zip_path, "wb") as f:
            f.write(zipFile)
        with open(os.path.join(GTFS_DATA_DIR,  "latest_gtfs.zip") , "wb") as f:
            f.write(zipFile)
        # Use this when using https://peatus.ee/gtfs/gtfs.zip to only keep Tallinna Linnatranspordi AS data
        # filter_gtfs_by_agency(zipFile, GFTS_TALLINNA_LINNATRANSPORDI_AS_ID, output_zip_path)
        

def get_remote_last_modified(url):
    try:
        response = requests.head(url, allow_redirects=True)
        if response.status_code == 200:
            last_modified = response.headers.get('Last-Modified')
            if last_modified:
                return parsedate_to_datetime(last_modified)
            else:
                print("No 'Last-Modified' header found in the response.")
                return None
        else:
            print(f"Failed to fetch headers. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching remote headers: {e}")
        return None

def get_local_last_modified(file_path):
    if os.path.exists(file_path):
        timestamp = os.path.getmtime(file_path)
        return datetime.fromtimestamp(timestamp)
    else:
        return None
    
def download_file(url):
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            return response.content
        else:
            print(f"Failed to download file. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error downloading file: {e}")
    

def fetch_daily_data():
        try:
            fetch_gfts_data()
            fetch_announcements_data()
            bus_time_data = fetch_bus_times_data()
            fetch_stops_data()
            get_routes_data(bus_time_data)
            print("done")
            insert_routes_geom()
            notify_discord()
        except Exception as e:
            print(e)
            notify_error_discord(e)
            

fetch_daily_data()
