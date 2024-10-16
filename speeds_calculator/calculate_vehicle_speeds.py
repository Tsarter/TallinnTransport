import os
import json
from datetime import datetime
from math import radians, sin, cos, sqrt, atan2


# Haversine formula to calculate the distance between two lat/long points
def haversine(coord1, coord2):
    R = 6371000  # Earth radius in meters
    lat1, lon1 = radians(coord1[1]), radians(coord1[0])
    lat2, lon2 = radians(coord2[1]), radians(coord2[0])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c  # Distance in meters


def decode_polyline(encoded):
    points = []
    index = 0
    lat = 0
    lng = 0
    length = len(encoded)

    while index < length:
        shift = 0
        result = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if result & 1 else (result >> 1)
        lat += dlat

        shift = 0
        result = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if result & 1 else (result >> 1)
        lng += dlng

        points.append((lat * 1e-5, lng * 1e-5))

    return points


# Load GPS data
def load_gps_data(directory):
    gps_data = []
    for file_name in sorted(os.listdir(directory)):
        if file_name.endswith(".json"):
            with open(os.path.join(directory, file_name)) as f:
                data = json.load(f)
                timestamp = datetime.fromisoformat(data["timestamp"][:-6])
                gps_data.append((timestamp, data["features"]))
    return gps_data


# Load route data (mockup, you will need to parse the polyline correctly)
def load_route_data(file_path):
    route_decoded = []
    with open(file_path, "r") as file:
        route = file.read().strip()
        route_split = route.split("\n")
        route_decoded = decode_polyline(route_split[1])

    # Parse the route into coordinates (this is a simplified assumption, might need to decode polyline)
    return route_decoded  # Example coordinates from a-b or b-a


# Main function to calculate speed
def calculate_speeds(gps_data):
    speeds = {}

    for vehicle_data in gps_data:
        for feature in vehicle_data[1]:
            vehicle_id = feature["properties"]["id"]
            vehicle_line = feature["properties"]["line"]
            vehicle_coords = feature["geometry"]["coordinates"]
            vehicle_id = f"{vehicle_line}_{vehicle_id}"
            # Track speed data for each vehicle
            if vehicle_id not in speeds:
                speeds[vehicle_id] = {
                    "start": vehicle_coords,
                    "previous_coords": vehicle_coords,
                    "distances": [],
                }

            # Calculate distance between previous and current point
            previous_coords = speeds[vehicle_id]["previous_coords"]
            distance = haversine(previous_coords, vehicle_coords)
            speeds[vehicle_id]["distances"].append(distance)
            speeds[vehicle_id]["previous_coords"] = vehicle_coords

            # Check if vehicle is at the start or end of route

    return speeds


# Example usage:

# Load your GPS data and route data
gps_data = load_gps_data("iaib/example_data/2024-10-04/realtime_data/2024-10-04")

""" route_data = load_route_data(
    f"iaib/example_data/2024-10-04/routes_data/2024-10-04/bus_{line}_routes.txt"
) """
# Calculate the speeds
speeds = calculate_speeds(gps_data)

# Output the total distance traveled for each vehicle
total_average_speeds = {}

for vehicle_id, data in speeds.items():
    distances_when_moving = list(filter(lambda x: x != 0.0, data["distances"]))
    total_distance = sum(distances_when_moving)  # in meters
    total_time = len(data["distances"]) * 30  # time in seconds (30s intervals)
    average_speed = (total_distance / total_time) * 3.6  # convert m/s to km/h
    line: str = vehicle_id.split("_")[0]
    if (
        average_speed > 100
        or total_distance < 10000
        or len(line) == 0
        or int(line.replace("A", "").replace("B", "")) > 100
    ):
        continue
    if line == "17":
        print("17")
    if line not in total_average_speeds:
        total_average_speeds[line] = {
            "total_distance": total_distance,
            "total_time": total_time,
        }
    total_average_speeds[line]["total_distance"] += total_distance
    total_average_speeds[line]["total_time"] += total_time

    """ print(
        f"Vehicle {vehicle_id} traveled {int(total_distance / 1000)}km at an average speed of {average_speed:.2f} km/h"
    ) """

sorted_average_speeds = sorted(
    [
        [line, (data["total_distance"] / data["total_time"]) * 3.6]
        for line, data in total_average_speeds.items()
    ],
    key=lambda x: x[1],
)
for line, average_speed in sorted_average_speeds:
    print(f"Line {line} average speed was {average_speed:.2f} km/h")
