from math import radians, sin, cos, sqrt, atan2
import os
import json
from datetime import datetime


# MATH functions
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


def haversine(coord1, coord2):
    R = 6371000  # Earth radius in meters
    lat1, lon1 = radians(coord1[1]), radians(coord1[0])
    lat2, lon2 = radians(coord2[1]), radians(coord2[0])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c  # Distance in meters


def euclidean_distance(coord1, coord2):
    x1, y1 = coord1
    x2, y2 = coord2

    dx = x2 - x1
    dy = y2 - y1
    R = 6371000
    distance = sqrt(dx**2 + dy**2)
    return distance * R


def vector_subtract(v1, v2):
    """Subtract two vectors (v1 - v2)."""
    return (v1[0] - v2[0], v1[1] - v2[1])


def cross_product_2d(v1, v2):
    """Calculate the 2D cross product of two vectors.

    This returns the scalar value representing the magnitude of the cross product.
    """
    return v1[0] * v2[1] - v1[1] * v2[0]


def norm(v):
    """Calculate the Euclidean norm (magnitude) of a 2D vector."""
    return sqrt(v[0] ** 2 + v[1] ** 2)


def distance_point_to_line(p1, p2, p3):
    """
    Calculate the perpendicular distance from point p3 to the line segment p1-p2.

    :param p1: First point on the line (x, y)
    :param p2: Second point on the line (x, y)
    :param p3: The point to calculate the distance to (x, y)
    :return: The perpendicular distance from p3 to the line through p1 and p2
    """
    # Vector from p1 to p2
    v1 = vector_subtract(p2, p1)
    # Vector from p1 to p3
    v2 = vector_subtract(p1, p3)

    # Cross product of the two vectors (in 2D, it's a scalar)
    cross_prod = cross_product_2d(v1, v2)

    # Distance = |cross_prod| / |v1| (length of line segment)
    distance = abs(cross_prod)
    R = 6371000
    return distance * R


def distance_to_line_segment(bus, A, B):
    """
    Calculate the shortest distance from a point (bus) to a line segment AB.

    :param bus: Tuple representing the bus coordinates (x, y)
    :param A: Tuple representing the first point of the line segment (x, y)
    :param B: Tuple representing the second point of the line segment (x, y)
    :return: Shortest distance from the bus to the line segment
    """
    # Unpack the coordinates
    x0, y0 = bus
    x1, y1 = A
    x2, y2 = B

    # Vector AB
    dx = x2 - x1
    dy = y2 - y1

    # If A and B are the same point, return the distance to A
    if dx == 0 and dy == 0:
        return sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)

    # Calculate the projection factor t of the point on the line AB
    t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx**2 + dy**2)

    # Clamp t to the range [0, 1] to keep the projection within the segment
    t = max(0, min(1, t))

    # Find the projection point on the line AB
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy

    R = 6371000
    # Return the distance between the bus and the projection point
    return [sqrt((x0 - proj_x) ** 2 + (y0 - proj_y) ** 2), proj_x, proj_y]


# FILE SYSTEM functions
def load_route_data(directory):
    routes_decoded = {}
    for file_name in sorted(os.listdir(directory)):
        if file_name.endswith("routes.txt"):
            with open(os.path.join(directory, file_name)) as file:
                route = file.read().strip()
                route_split = route.split("\n")
                route_decoded = decode_polyline(route_split[1])
                routes_decoded[file_name[:-11]] = route_decoded

    return routes_decoded


def load_gps_data(directory):
    gps_data = []
    for file_name in sorted(os.listdir(directory)):
        if file_name.endswith(".json"):
            with open(os.path.join(directory, file_name)) as f:
                data = json.load(f)
                timestamp = datetime.fromisoformat(data["timestamp"][:-6])
                gps_data.append((timestamp, data["features"]))
    return gps_data
