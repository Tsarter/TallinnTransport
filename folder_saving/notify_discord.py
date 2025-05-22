import requests
import os
from datetime import datetime, timedelta

from config import (
    DATA_DIR,
    ROUTE_DATA_DIR,
    BUS_TIMES_DATA_DIR,
    STOPS_DATA_DIR,
    INTERRUPTIONS_DATA_DIR,
    REALTIME_DATA_DIR,
)

from secret_config import DISCORD_WEBHOOK_URL




def get_folder_size(path):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for file in filenames:
            file_path = os.path.join(dirpath, file)
            total_size += os.path.getsize(file_path)
    return total_size / (1024 * 1024)  # Convert bytes to MB

def get_file_count(path):
    total_count = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for file in filenames:
            total_count += 1
    return total_count

def main():
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    
    TOTAL_size =  get_folder_size(f"{DATA_DIR}")
    ROUTE_DATA_size = get_folder_size(f"{ROUTE_DATA_DIR}/{today}")
    BUS_TIMES_DATA_size = get_folder_size(f"{BUS_TIMES_DATA_DIR}/{today}")
    STOPS_DATA_size = get_folder_size(f"{STOPS_DATA_DIR}/{today}")
    INTERRUPTIONS_DATA_size = get_folder_size(f"{INTERRUPTIONS_DATA_DIR}/{today}")
    REALTIME_DATA_count_yesterday = get_file_count(f"{REALTIME_DATA_DIR}/{yesterday}")
    
    message = {
        "content": f"""TOTAl size: {TOTAL_size:.2f} MB \n 
REALTIME DATA count (yesterday): {REALTIME_DATA_count_yesterday} \n
ROUTE DATA size: {ROUTE_DATA_size:.2f} MB \n
STOPS DATA size :  {STOPS_DATA_size:.2f} MB \n
INTERRUPTIONS DATA size: {INTERRUPTIONS_DATA_size:.2f} MB \n
BUS TIMES DATA size: {BUS_TIMES_DATA_size:.2f} MB \n
        """
    }
    response = requests.post(DISCORD_WEBHOOK_URL, json=message)
    if response.status_code != 204:
        print(f"Failed to send message to Discord: {response.status_code}, {response.text}")

def main_error(error):
    message = {
        "content": f"""Error: {error} \n
        """
    }

    response = requests.post(DISCORD_WEBHOOK_URL, json=message)
    if response.status_code != 204:
        print(f"Failed to send message to Discord: {response.status_code}, {response.text}")

def notify_discord():
    main()

def notify_error_discord(error=""):
    main_error(error)
