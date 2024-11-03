from helper import *

vehicle_types = {1: "trol", 2: "bus", 3: "tram"}


def calc_closest_coord(coord, route: list):
    return min(
        map(
            lambda r_pair: distance_to_line_segment(coord, r_pair[0], r_pair[1]),
            zip(route[:-1], route[1:]),
        ),
        key=lambda x: x[0],
    )


def calc_closest_coord2(coord, route: list):
    return min(
        map(
            lambda r_coord: [haversine(coord, r_coord), r_coord],
            route,
        ),
        key=lambda x: x[0],
    )


def calc_closest_coord3(coord, route: list):
    return min(
        map(
            lambda r_pair: distance_point_to_line(coord, r_pair[0], r_pair[1]),
            zip(route[:-1], route[1:]),
        ),
        key=lambda x: x,
    )


def calc_speeds_w_routes(gps_data, routes):

    speeds = {}
    for time, vehicle_data in gps_data:
        print(time)
        for feature in vehicle_data:
            vehicle_id = feature["properties"]["id"]
            vehicle_line = feature["properties"]["line"]
            if any(
                [
                    not vehicle_line,
                    vehicle_line not in vehicle_types.keys(),
                ]
            ):
                continue
            vehicle_type = vehicle_types[feature["properties"]["type"]]
            vehicle_coords = feature["geometry"]["coordinates"][::-1]
            vehicle_id = f"{vehicle_type}_{vehicle_line}_{vehicle_id}"
            """ min = calc_closest_coord(
                vehicle_coords, routes[f"{vehicle_type}_{vehicle_line}"]
            ) """
            min_dist, closest_r_coord = calc_closest_coord2(
                vehicle_coords, routes[f"{vehicle_type}_{vehicle_line}"]
            )
            if min_dist > 100:
                continue
            # https://stackoverflow.com/questions/39840030/distance-between-point-and-a-line-from-two-points
            """ min_stackOverflow = calc_closest_coord3(
                vehicle_coords, routes[f"{vehicle_type}_{vehicle_line}"]
            ) """
            # Track speed data for each vehicle
            if vehicle_id not in speeds:
                speeds[vehicle_id] = {
                    "start": closest_r_coord,
                    "previous_coords": closest_r_coord,
                    "distances": [],
                    "coordinates": [],
                    "time": [],
                }
            # Add coordinates for debuging
            speeds[vehicle_id]["coordinates"].append(closest_r_coord)
            speeds[vehicle_id]["time"].append(time)
            # Calculate distance between previous and current point
            previous_coords = speeds[vehicle_id]["previous_coords"]
            distance = haversine(previous_coords, closest_r_coord)
            speeds[vehicle_id]["distances"].append(distance)
            speeds[vehicle_id]["previous_coords"] = closest_r_coord

            # Check if vehicle is at the start or end of route

    return speeds


DAY = "2024-10-04"
LINE = "BUS_1"


def main():

    # Take route
    routes: dict = load_routes_data(f"iaib/example_data/{DAY}/routes_data/{DAY}")

    # One day of bus coordinates
    gps_data: list = load_gps_data(f"iaib/example_data/{DAY}/realtime_data/{DAY}")

    # forEach coordinate take closest coordinate on the route
    speeds = calc_speeds_w_routes(gps_data, routes)
    print(speeds)
    # calc the distance with prev coordinate on the route
    # set new coordinate as prev
    # repeat


main()
