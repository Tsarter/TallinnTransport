from helper import *

vehicle_types = {1: "trol", 2: "bus", 3: "tram"}


def in_tallinn(latitude, longitude):
    min_lat, max_lat = 59.317, 59.746
    min_lon, max_lon = 24.511, 25.000

    return min_lat <= latitude <= max_lat and min_lon <= longitude <= max_lon


# Main function to calculate speed
def calculate_speeds(gps_data):
    speeds = {}

    for time, vehicle_data in gps_data:
        # print(time)
        for feature in vehicle_data:
            vehicle_id = feature["properties"]["id"]
            vehicle_line = feature["properties"]["line"]
            vehicle_coords = feature["geometry"]["coordinates"][::-1]
            vehicle_type = "unknown"
            if feature["properties"]["type"] in vehicle_types:
                vehicle_type = vehicle_types[feature["properties"]["type"]]
            if not vehicle_line:
                continue
            vehicle_id = f"{vehicle_type}_{vehicle_line}_{vehicle_id}"
            if (
                not in_tallinn(vehicle_coords[0], vehicle_coords[1])
                and vehicle_line in vehicle_types.keys()
            ):
                print(f"vehicle coord messed up {vehicle_coords}")
                continue
            # Track speed data for each vehicle
            if vehicle_id not in speeds:
                speeds[vehicle_id] = {
                    "previous_coords": vehicle_coords,
                    "distances": [],
                    "coordinates": [],
                    "time": [],
                }
            # Add coordinates for debuging
            speeds[vehicle_id]["coordinates"].append(vehicle_coords)
            speeds[vehicle_id]["time"].append(time)
            debug = speeds[vehicle_id]
            if vehicle_id == "bus_13_1442" and str(time) == "2024-10-04 09:27:04":
                print("hey")
            # Calculate distance between previous and current point 59.40839 24.74844 59.405 24.73856
            previous_coords = speeds[vehicle_id]["previous_coords"]
            distance = haversine(previous_coords, vehicle_coords)
            speeds[vehicle_id]["distances"].append(distance)
            speeds[vehicle_id]["previous_coords"] = vehicle_coords

            # Check if vehicle is at the start or end of route

    return speeds


def get_data_on_line(vehicle_id, data):
    on_line_data = []
    vehicle_type, line = vehicle_id.split("_")[0:2]
    route = load_route_data(
        f"iaib/example_data/2024-10-04/routes_data/2024-10-04/{vehicle_type}_{line}_routes.txt"
    )
    start = route[0]
    end = route[-1]
    on_line = False
    endpoint_range = 300  # m
    for data in zip(data["coordinates"], data["time"], data["distances"]):
        coord = data[0]
        dist_from_start = haversine(coord, start)
        dist_from_end = haversine(coord, end)
        # Reached end of line
        if on_line and (
            dist_from_start < endpoint_range or dist_from_end < endpoint_range
        ):
            on_line = False

        # Went on the line from the end or start
        elif not on_line and (
            endpoint_range * 2 > dist_from_start > endpoint_range
            or endpoint_range * 2 > dist_from_end > endpoint_range
        ):
            on_line = True

        if on_line:
            on_line_data.append(data)
    return on_line_data


html_options = []


# Output the total distance traveled for each vehicle
def print_avg_speeds(speeds):
    total_average_speeds = {}

    for vehicle_id, data in speeds.items():
        if vehicle_id.split("_")[0] == "unknown":
            continue
        on_line_data = get_data_on_line(vehicle_id, data)

        if len(on_line_data) > 1000:
            # global html_options
            # html_options.append(f'<option value="{vehicle_id}">{vehicle_id}</option> ')
            with open(f"movements/bus_movement_{vehicle_id}.json", "w") as out_file:
                json.dump(
                    {
                        "coordinates": list(
                            map(lambda x: [x[0][1], x[0][0]], on_line_data)
                        ),
                        "times": list(map(lambda x: x[1], on_line_data)),
                        "distances": list(map(lambda x: x[2], on_line_data)),
                    },
                    out_file,
                    indent=2,
                    default=str,
                )

        total_distance = sum([x[2] for x in on_line_data])  # in meters
        total_time = (data["time"][-1] - data["time"][0]).total_seconds()
        average_speed = (
            (total_distance / total_time) * 3.6 if total_distance > 0 else 0
        )  # convert m/s to km/h
        line: str = vehicle_id.split("_")[1]
        if (
            average_speed > 100
            or len(line) == 0
            or int(line.replace("A", "").replace("B", "")) > 100
        ):
            continue
        if line not in total_average_speeds:
            total_average_speeds[line] = {
                "total_distance": total_distance,
                "total_time": total_time,
            }
        else:
            total_average_speeds[line]["total_distance"] += total_distance
            total_average_speeds[line]["total_time"] += total_time
    # sorted_html_options = "".join(sorted(html_options))
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
