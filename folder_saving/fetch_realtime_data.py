# fetch_realtime_data.py

import requests
import os
from datetime import datetime
import time
from config import REALTIME_URL, REALTIME_DATA_DIR


def fetch_realtime_data():
    response = requests.get(REALTIME_URL)
    timestamp = datetime.now().strftime("%H-%M-%S")
    folder_path = f'{REALTIME_DATA_DIR}/{datetime.now().strftime("%Y-%m-%d")}'
    os.makedirs(folder_path, exist_ok=True)
    with open(f"{folder_path}/{timestamp}.json", "w") as file:
        file.write(response.text)


while True:
    fetch_realtime_data()
    time.sleep(30)
