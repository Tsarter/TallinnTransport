import os
import json
from datetime import datetime
import gzip

# Base folder containing the date folders
base_folder = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/realtime_data/"
# Base output folder
out_base_folder = "/home/tanel/Documents/public_transport_project/HardDrive/data/modified_data/combined_realtime/"

# List all date folders in the base folder
for date in os.listdir(base_folder):
    folder = os.path.join(base_folder, date)
    out_folder = os.path.join(out_base_folder, date)
    
    # Check if the current folder is indeed a directory
    if os.path.isdir(folder):
        # Create the output folder if it doesn't exist
        if not os.path.exists(out_folder):
            os.makedirs(out_folder)

        # Define the path for the combined output file
        combined_file_path = os.path.join(out_folder, "combined_bus_data.gz")
        
        # Check if the combined output file already exists
        if os.path.exists(combined_file_path):
            print(f"Combined data file already exists for date {date}. Skipping processing.")
            continue  # Skip to the next date folder if the file already exists

        # List to store all features for the current date folder
        all_features = []
        i = 0

        # Loop through all JSON files in the current date folder
        for filename in sorted(os.listdir(folder)):
            i += 1
            if i % 3000 == 0:
                print(f"{i} files processed from {date}.")
            if filename.endswith(".json"):
                filepath = os.path.join(folder, filename)

                # Open and read the JSON file with error handling
                try:
                    with open(filepath) as file:
                        data = json.load(file)

                        # Convert filename (e.g., 00-00-05.json) to a timestamp
                        time_str = filename.replace(".json", "")
                        timestamp = datetime.strptime(time_str, "%H-%M-%S").isoformat()

                        # Update the timestamp in each feature
                        for feature in data.get("features", []):
                            feature["properties"]["timestamp"] = timestamp
                            all_features.append(feature)
                except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
                    print(f"Error processing file {filepath}: {e}")

        # Combine into a single GeoJSON structure for the current date
        output = {"type": "FeatureCollection", "features": all_features}

        # Save to a new file in the output directory for the current date
        try:
            # GZIP COMPRESSES REAL GOOD. Like 150mb -> to 15mb
            with gzip.open(f"{combined_file_path}", "wt", encoding="utf-8") as out_file:
                json.dump(output, out_file, separators=(',', ':'))
            # print(f"Data zipped and saved")
        except Exception as e:
            print(f"Error saving combined data for date {date}: {e}")
