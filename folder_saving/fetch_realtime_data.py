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
    INTERRUPTIONS_URL,
    INTERRUPTIONS_DATA_DIR,
    REALTIME_URL_TXT,
)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

print(os.getcwd())
from iaib.folder_saving.notify_discord import notify_error_discord
from iaib.folder_saving.data_to_timescaledb import save_to_database


def fetch_realtime_data(file_type="json", url=REALTIME_URL_TXT):
    response = requests.get(url)
    
    # Save to database
    if file_type == "txt":
        data = response.text
    if file_type == "json":
        data = response.json()
    

    timestamp2 = datetime.now()
    try:
        save_to_database(data, timestamp2)
    except Exception as e:
        print(f"Error saving to database: {e}")
        print(traceback.format_exc())
        notify_error_discord(e)

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

    last_data = get_last_interruption_state()

    # Only save if the state has changed
    if new_data != last_data:
        timestamp = datetime.now().strftime("%H-%M-%S")
        folder_path = f'{INTERRUPTIONS_DATA_DIR}/{datetime.now().strftime("%Y-%m-%d")}'
        os.makedirs(folder_path, exist_ok=True)
        with open(f"{folder_path}/{timestamp}.json", "w", encoding="utf-8") as file:
            json.dump(new_data, file, ensure_ascii=False, indent=2)
        
        # Save ongoing state to a separate file
        with open(f"{INTERRUPTIONS_DATA_DIR}/ongoing.json", "w", encoding="utf-8") as file:
            json.dump(new_data, file, ensure_ascii=False, indent=2)


def main():
    last_interruptions_time = 0
    print("Starting the data fetching loop...")
    while True:
        start_time = time.time()
        try:
            # Fetch realtime data every 30 seconds
            fetch_realtime_data(
                "txt", REALTIME_URL_TXT
            )  # More data with this url (route destination incl.)

            # Fetch interruptions every 300 seconds (5 minutes)
            if start_time - last_interruptions_time >= 300:
                check_and_save_interruptions()
                last_interruptions_time = start_time

        except requests.exceptions.RequestException as e:
            # Handle network-related errors
            # print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Network error: {e}", flush=True)
            notify_error_discord(e)
        except sqlite3.DatabaseError as e:
            # Handle database-related errors
            # print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Database error: {e}", flush=True)
            notify_error_discord(e)
        except Exception as e:
            # Catch-all for other exceptions
            # print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Unexpected error: {e}", flush=True)
            # print(traceback.format_exc(), flush=True)  # Print the full traceback for debugging
            notify_error_discord(e)


        # Sleep for 30 seconds before fetching realtime data again
        elapsed_time = time.time() - start_time
        sleep_time = max(0, 30 - elapsed_time)
        time.sleep(sleep_time)


if __name__ == "__main__":
    main()
