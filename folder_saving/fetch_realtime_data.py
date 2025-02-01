# fetch_realtime_data.py
import json
import requests
import os
import sys
import sqlite3
from datetime import datetime
import time
import traceback
from config import (
    REALTIME_URL,
    REALTIME_DATA_DIR,
    INTERRUPTIONS_URL,
    INTERRUPTIONS_DATA_DIR,
    REALTIME_URL_TXT,
)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

print(os.getcwd())
from iaib.database.data_to_db import save_to_database


def fetch_realtime_data(file_type="json", url=REALTIME_URL):
    response = requests.get(url)
    timestamp = datetime.now().strftime("%H-%M-%S")
    folder_path = f'{REALTIME_DATA_DIR}/{datetime.now().strftime("%Y-%m-%d")}'
    os.makedirs(folder_path, exist_ok=True)
    with open(f"{folder_path}/{timestamp}.{file_type}", "w", encoding="utf-8") as file:
        file.write(response.text)
    
    # Save to database
    if file_type == "txt":
        data = response.text
    if file_type == "json":
        data = response.json()
    date = datetime.now().strftime("%Y-%m-%d")
    time = datetime.now().strftime("%H-%M-%S")
    save_to_database(data, f"{date}_{time}")

# Function to fetch the current interruptions data
def fetch_interruptions():
    response = requests.get(INTERRUPTIONS_URL)
    return response.json()  # Assuming the response is in JSON format


# Function to get the last saved interruption state (empty or not)
def get_last_interruption_state():
    folder_path = f'{INTERRUPTIONS_DATA_DIR}/{datetime.now().strftime("%Y-%m-%d")}'
    if not os.path.exists(folder_path):
        return None

    files = sorted(os.listdir(folder_path))  # Get the latest file in the folder
    if not files:
        return None  # No files yet

    last_file = os.path.join(folder_path, files[-1])
    with open(last_file, "r") as file:
        last_data = json.load(file)
        return last_data  # Return last saved interruption data


# Function to save the interruption data if state has changed
def check_and_save_interruptions():
    new_data = fetch_interruptions()
    new_is_empty = len(new_data) == 0  # Check if new interruption data is empty

    last_data = get_last_interruption_state()
    last_is_empty = (
        len(last_data) == 0 if last_data is not None else True
    )  # Check if last interruption data was empty

    # Only save if the state has changed
    if new_is_empty != last_is_empty:
        timestamp = datetime.now().strftime("%H-%M-%S")
        folder_path = f'{INTERRUPTIONS_DATA_DIR}/{datetime.now().strftime("%Y-%m-%d")}'
        os.makedirs(folder_path, exist_ok=True)
        with open(f"{folder_path}/{timestamp}.json", "w", encoding="utf-8") as file:
            json.dump(new_data, file)
        if new_is_empty:
            print(f"Interruption ended at {timestamp}")
        else:
            print(f"New interruption started at {timestamp}")


def main():
    last_interruptions_time = 0
    while True:
        
        start_time = time.time()
        try:
            # Fetch realtime data every 30 seconds
            # fetch_realtime_data()
            fetch_realtime_data(
                "txt", REALTIME_URL_TXT
            )  # More data with this url (route destination incl.)

            # Fetch interruptions every 300 seconds (5 minutes)
            if start_time - last_interruptions_time >= 300:
                check_and_save_interruptions()
                last_interruptions_time = start_time

        except requests.exceptions.RequestException as e:
            # Handle network-related errors
            print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Network error: {e}")
        except sqlite3.DatabaseError as e:
            # Handle database-related errors
            print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Database error: {e}")
        except Exception as e:
            # Catch-all for other exceptions
            print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Unexpected error: {e}")
            print(traceback.format_exc())  # Print the full traceback for debugging


        # Sleep for 30 seconds before fetching realtime data again
        elapsed_time = time.time() - start_time
        sleep_time = max(0, 30 - elapsed_time)
        time.sleep(sleep_time)


if __name__ == "__main__":
    main()
