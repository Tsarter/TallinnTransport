"""

IMPORTANT!!!

This file is redundant. Its not needed bc gtfs can be directly downloaded fromt transport.tallinn.ee
no need for whole Estonia and then filter like this file does.
"""

import zipfile
import pandas as pd
import os
import tempfile
import shutil
import io

def filter_gtfs_by_agency(zipFile, target_agency_id, output_zip_path):
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Handle bytes input by wrapping it in a BytesIO object
        if isinstance(zipFile, bytes):
            zipFile = io.BytesIO(zipFile)

        # Unzip the GTFS file
        with zipfile.ZipFile(zipFile, "r") as zip_ref:
            zip_ref.extractall(tmpdir)

        # Read required GTFS files
        agency_path = os.path.join(tmpdir, "agency.txt")
        if not os.path.exists(agency_path):
            raise FileNotFoundError("agency.txt not found in the extracted files.")
        agency = pd.read_csv(agency_path)
        if "agency_id" not in agency.columns:
            raise KeyError("'agency_id' column not found in agency.txt.")
        routes = pd.read_csv(os.path.join(tmpdir, "routes.txt"))
        trips = pd.read_csv(os.path.join(tmpdir, "trips.txt"))
        stop_times = pd.read_csv(os.path.join(tmpdir, "stop_times.txt"))
        stops = pd.read_csv(os.path.join(tmpdir, "stops.txt"))
        shapes_path = os.path.join(tmpdir, "shapes.txt")
        shapes = (
            pd.read_csv(shapes_path) if os.path.exists(shapes_path) else pd.DataFrame()
        )
        fare_rules_path = os.path.join(tmpdir, "fare_rules.txt")
        fare_rules = (
            pd.read_csv(fare_rules_path)
            if os.path.exists(fare_rules_path)
            else pd.DataFrame()
        )
        calendar_dates_path = os.path.join(tmpdir, "calendar_dates.txt")
        calendar_dates = (
            pd.read_csv(calendar_dates_path)
            if os.path.exists(calendar_dates_path)
            else pd.DataFrame()
        )
        calendar_path = os.path.join(tmpdir, "calendar.txt")
        calendar = (
            pd.read_csv(calendar_path)
            if os.path.exists(calendar_path)
            else pd.DataFrame()
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

        # Filter fare_rules by route_id
        if not fare_rules.empty and "route_id" in fare_rules.columns:
            fare_rules_filtered = fare_rules[fare_rules["route_id"].isin(route_ids)]
        else:
            fare_rules_filtered = pd.DataFrame()

        # Filter calendar_dates by service_id used in filtered trips
        if not calendar_dates.empty and "service_id" in calendar_dates.columns:
            service_ids = set(trips_filtered["service_id"].dropna())
            calendar_dates_filtered = calendar_dates[
                calendar_dates["service_id"].isin(service_ids)
            ]
        else:
            calendar_dates_filtered = pd.DataFrame()

        # Filter calendar by service_id used in filtered trips
        if not calendar.empty and "service_id" in calendar.columns:
            service_ids = set(trips_filtered["service_id"].dropna())
            calendar_filtered = calendar[calendar["service_id"].isin(service_ids)]
        else:
            calendar_filtered = pd.DataFrame()

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
        if not fare_rules_filtered.empty:
            fare_rules_filtered.to_csv(
                os.path.join(filtered_dir, "fare_rules.txt"), index=False
            )
        if not calendar_dates_filtered.empty:
            calendar_dates_filtered.to_csv(
                os.path.join(filtered_dir, "calendar_dates.txt"), index=False
            )
        if not calendar_filtered.empty:
            calendar_filtered.to_csv(
                os.path.join(filtered_dir, "calendar.txt"), index=False
            )

        # Optionally copy other GTFS files if needed
        optional_files = [
            "fare_attributes.txt",
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
""" filter_gtfs_by_agency(
    "C:/Users/Tanel/Downloads/gtfs1.zip",
    56,
    "C:/Users/Tanel/Downloads/GTFS_filtered6.zip",
)
 """