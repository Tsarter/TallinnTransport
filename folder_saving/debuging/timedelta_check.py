import os
import json
from datetime import datetime, timedelta
# Set the path to the folder containing the date folders
base_folder = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/realtime_data"


# Get today's date folder
today_folder = os.path.join(base_folder, "2024-07-23")

def get_files_sorted_by_time(folder):
    try:
        files = [f for f in os.listdir(folder) if f.endswith('.json')]
        files.sort(key=lambda f: datetime.strptime(f[:-5], '%H-%M-%S'))
        return files
    except FileNotFoundError:
        return []

def check_time_deltas(files):
    missing_places = []
    for i in range(1, len(files)):
        current_file_time = datetime.strptime(files[i][:-5], '%H-%M-%S')
        previous_file_time = datetime.strptime(files[i-1][:-5], '%H-%M-%S')
        delta = current_file_time - previous_file_time

        if delta > timedelta(seconds=31):
            missing_places.append((files[i-1], files[i], delta))

    return missing_places

def main():
    files = get_files_sorted_by_time(today_folder)
    if not files:
        print("No files found for today.")
        return

    missing_places = check_time_deltas(files)
    if not missing_places:
        print("No missing places. All files are within 30 seconds apart.")
    else:
        print("Missing places (file gaps greater than 30 seconds):")
        for previous_file, current_file, delta in missing_places:
            print(f"Between {previous_file} and {current_file}: {delta}")

if __name__ == '__main__':
    main()
