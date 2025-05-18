# Tallinna ühistranspordi reaalajaandmete kogumine, analüüsimine ja visualiseerimine 

## Overview

This repository contains various tools and scripts for working with public transport data. The project is focused on collecting, processing, and visualizing real-time and historical transport data for Tallinn. It includes components for scraping data, storing it in a database, and visualizing it on interactive maps.

## Key Components

### 1. Data Collection

- **Daily Scraper**: Fetches daily transport data from specified endpoints.
- **Realtime Scraper**: Continuously collects real-time transport data using systemd services.
- **Config**: Descripes from where data is collected

### 2. Data Storage

- **Database**: PostgreSQL with TimescaleDB is used for storing and managing transport data. Includes tables like `realtimedata`  for real-time data storage.
- **Compression**: Implements TimescaleDB compression policies to optimize storage.

### 3. Data Processing

- **Node server**: Does most of the data processing using SQL queries.
- **Website**: Some data processing is done on the websites.

### 4. Visualization

- **Visualizer**: Displays historical transport data on an interactive web map using the Leaflet library.
- **Visualizer Experiments**:
  - `fromAtoB.html`: Show speeds between any two geographical points.
  - `gridspees.html`: Show speeds in grids.
  - `segment_speeds.html`: Most developed tool, shows speeds for any hour.

### 5. Scripts

- **Backup and Maintenance**: Includes scripts for database backup, data migration, and system monitoring.
- **Systemd Services**: Configured for automating real-time data scraping and ensuring service reliability.

## How to Use

1. **Setup Database**: Download database copy https://tallinn.simplytobo.eu/transport_data/transport_data/realtime_database_copy and open `Read_this_file.txt` to setup database
2. **Run Scrapers**: Configure and run the daily and real-time scrapers to collect data.
3. **Visualize Data**: Use the Visualizer to explore the collected data on an interactive map.

## Additional Information

- **Lessons Learned**: Documented in `folder_saving/lessons_learned.md`.
- **Good to Know**: Additional notes and updates are in `good_to_know.md`.

## Dependencies

- PostgreSQL with TimescaleDB and Postgis
- Node.js for proxy and server scripts
- Python for data processing scripts

## Contact

Just contact me.
