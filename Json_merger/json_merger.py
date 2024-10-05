import os
import json
from datetime import datetime

# Folder containing JSON files
folder = "C:/Users/Tanel/Documents/AA_PROJECTS/AA TalTech stuff/Bakatöö_TLT/iaib/example_data/2024-10-04/realtime_data/2024-10-04"

# List to store all features
all_features = []
i = 0
# Loop through all files in the folder
for filename in sorted(os.listdir(folder)):
    if i == 1000:
        break
    i += 1
    if filename.endswith(".json"):
        filepath = os.path.join(folder, filename)

        # Open and read the JSON file
        with open(filepath) as file:
            data = json.load(file)

            # Convert filename (e.g., 00-00-05.json) to a timestamp
            time_str = filename.replace(".json", "")
            timestamp = datetime.strptime(time_str, "%H-%M-%S").isoformat()

            # Update the timestamp in each feature
            for feature in data.get("features", []):
                feature["properties"]["timestamp"] = timestamp
                all_features.append(feature)

# Combine into a single GeoJSON structure
output = {"type": "FeatureCollection", "features": all_features}

# Save to a new file
with open("combined_bus_data.json", "w") as out_file:
    json.dump(output, out_file, indent=2)

print("Data combined and saved to combined_bus_data.json")
