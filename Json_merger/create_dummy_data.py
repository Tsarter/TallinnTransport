import json
from datetime import datetime, timedelta
import os
import random

# Set up output directory
output_dir = "/home/tanel/Documents/public_transport_project/HardDrive/data/transport_data/realtime_data/2025-03-12"
os.makedirs(output_dir, exist_ok=True)

# Constants
start_time = datetime.strptime("00:00:00", "%H:%M:%S")
num_files = 2880
interval = timedelta(seconds=30)
location = [24.74673, 59.4372]  # Common dummy location

# Generate 300 unique ID-line-type-direction combos
id_combos = []
for i in range(300):
    id_combos.append({
        "id": i,
        "line": random.randint(1, 20),
        "type": random.choice([1, 2, 3]),
        "direction": random.randint(0, 359)
    })

# Generate files
for i in range(num_files):
    timestamp = (start_time + i * interval).strftime("2024-11-17T%H:%M:%S+02:00")
    features = []
    for item in id_combos:
        feature = {
            "type": "Feature",
            "properties": {
                "id": item["id"],
                "type": item["type"],
                "line": item["line"],
                "direction": item["direction"]
            },
            "geometry": {
                "type": "Point",
                "coordinates": location
            }
        }
        features.append(feature)
    
    feature_collection = {
        "type": "FeatureCollection",
        "timestamp": timestamp,
        "features": features
    }

    filename = (start_time + i * interval).strftime("%H-%M-%S.json")
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "w") as f:
        json.dump(feature_collection, f)