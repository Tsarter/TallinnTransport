# fetch_realtime_data.py

import requests
import os
from datetime import datetime
import time
from config import REALTIME_URL, REALTIME_DATA_DIR, LOCK_FILE
from lock import lock_file, unlock_file

def fetch_realtime_data():
    response = requests.get(REALTIME_URL)
    timestamp = datetime.now().strftime("%H-%M-%S")
    folder_path = f'{REALTIME_DATA_DIR}/{datetime.now().strftime("%Y-%m-%d")}'
    os.makedirs(folder_path, exist_ok=True)
    with open(f"{folder_path}/{timestamp}.json", "w") as file:
        file.write(response.text)

def main():
    lock_file_instance = lock_file(LOCK_FILE)
    if lock_file_instance:
        try:
            fetch_realtime_data()
        finally:
            unlock_file(lock_file_instance)


while True:
    start_time = time.time()
    main()
    elapsed_time = time.time() - start_time
    sleep_time = max(0, 30 - elapsed_time)
    time.sleep(sleep_time)