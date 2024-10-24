from helper import *


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
                    "coordinates": [],
                    "time": [],
                }
            # Add coordinates for debuging
            speeds[vehicle_id]["coordinates"].append(vehicle_coords)
            speeds[vehicle_id]["time"].append(vehicle_data[0])
            # Calculate distance between previous and current point
            previous_coords = speeds[vehicle_id]["previous_coords"]
            distance = haversine(previous_coords, vehicle_coords)
            speeds[vehicle_id]["distances"].append(distance)
            speeds[vehicle_id]["previous_coords"] = vehicle_coords

            # Check if vehicle is at the start or end of route

    return speeds


# Output the total distance traveled for each vehicle
def print_avg_speeds(speeds):
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
        if line not in total_average_speeds:
            total_average_speeds[line] = {
                "total_distance": total_distance,
                "total_time": total_time,
            }
        total_average_speeds[line]["total_distance"] += total_distance
        total_average_speeds[line]["total_time"] += total_time

    sorted_average_speeds = sorted(
        [
            [line, (data["total_distance"] / data["total_time"]) * 3.6]
            for line, data in total_average_speeds.items()
        ],
        key=lambda x: x[1],
    )
    for line, average_speed in sorted_average_speeds:
        print(f"Line {line} average speed was {average_speed:.2f} km/h")


def main():

    # Load your GPS data and route data
    gps_data = load_gps_data("iaib/example_data/2024-10-04/realtime_data/2024-10-04")

    """ route_data = load_route_data(
        f"iaib/example_data/2024-10-04/routes_data/2024-10-04/bus_{line}_routes.txt"
    ) """
    # Calculate the speeds
    speeds = calculate_speeds(gps_data)

    print_avg_speeds(speeds)

    # Get data for visulazing (debuging)
    """ line_busId = "12_3495"
    with open(f"bus_movement_{line_busId}.json", "w") as out_file:
        json.dump(
            {
                "coordinates": speeds[line_busId]["coordinates"],
                "distances": speeds[line_busId]["distances"],
                "times": speeds[line_busId]["time"],
            },
            out_file,
            indent=2,
            default=str,
        )
    """


main()
