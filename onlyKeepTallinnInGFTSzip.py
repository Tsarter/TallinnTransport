import zipfile
import pandas as pd
import os
import tempfile
import shutil


def filter_gtfs_by_agency(zip_path, target_agency_id, output_zip_path):
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(tmpdir)

        # Read required GTFS files
        agency = pd.read_csv(os.path.join(tmpdir, "agency.txt"))
        routes = pd.read_csv(os.path.join(tmpdir, "routes.txt"))
        trips = pd.read_csv(os.path.join(tmpdir, "trips.txt"))
        stop_times = pd.read_csv(os.path.join(tmpdir, "stop_times.txt"))
        stops = pd.read_csv(os.path.join(tmpdir, "stops.txt"))
        shapes_path = os.path.join(tmpdir, "shapes.txt")
        shapes = (
            pd.read_csv(shapes_path) if os.path.exists(shapes_path) else pd.DataFrame()
        )

        # Filter agency
        agency_filtered = agency[agency["agency_id"] == target_agency_id]

        # Filter routes by agency_id
        routes_filtered = routes[routes["agency_id"] == target_agency_id]
        route_ids = set(routes_filtered["route_id"])

        # Filter trips by route_id
        trips_filtered = trips[trips["route_id"].isin(route_ids)]
        trip_ids = set(trips_filtered["trip_id"])

        # Filter stop_times by trip_id
        stop_times_filtered = stop_times[stop_times["trip_id"].isin(trip_ids)]
        stop_ids = set(stop_times_filtered["stop_id"])

        # Filter stops by stop_id
        stops_filtered = stops[stops["stop_id"].isin(stop_ids)]

        # Filter shapes by shape_id used in filtered trips
        if not shapes.empty and "shape_id" in trips_filtered.columns:
            shape_ids = set(trips_filtered["shape_id"].dropna())
            shapes_filtered = shapes[shapes["shape_id"].isin(shape_ids)]
        else:
            shapes_filtered = pd.DataFrame()

        # Output directory
        filtered_dir = os.path.join(tmpdir, "filtered")
        os.makedirs(filtered_dir)

        # Save filtered data
        agency_filtered.to_csv(os.path.join(filtered_dir, "agency.txt"), index=False)
        routes_filtered.to_csv(os.path.join(filtered_dir, "routes.txt"), index=False)
        trips_filtered.to_csv(os.path.join(filtered_dir, "trips.txt"), index=False)
        stop_times_filtered.to_csv(
            os.path.join(filtered_dir, "stop_times.txt"), index=False
        )
        stops_filtered.to_csv(os.path.join(filtered_dir, "stops.txt"), index=False)
        if not shapes_filtered.empty:
            shapes_filtered.to_csv(
                os.path.join(filtered_dir, "shapes.txt"), index=False
            )

        # Optionally copy other GTFS files if needed
        optional_files = [
            "calendar.txt",
            "calendar_dates.txt",
            "fare_attributes.txt",
            "fare_rules.txt",
            "frequencies.txt",
        ]
        for fname in optional_files:
            src = os.path.join(tmpdir, fname)
            if os.path.exists(src):
                shutil.copy(src, os.path.join(filtered_dir, fname))

        # Write to new zip
        with zipfile.ZipFile(
            output_zip_path, "w", compression=zipfile.ZIP_DEFLATED
        ) as new_zip:
            for root, _, files in os.walk(filtered_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    new_zip.write(file_path, arcname=file)


# Example usage
filter_gtfs_by_agency(
    "C:/Users/Tanel/Downloads/gtfs1.zip",
    56,
    "C:/Users/Tanel/Downloads/GTFS_filtered5.zip",
)
