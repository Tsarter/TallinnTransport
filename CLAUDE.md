# Tallinn Public Transport Data System - Architecture Guide

This document provides a comprehensive overview of the public transport data collection, processing, and visualization system for Tallinn. It's designed to help future developers quickly understand the codebase architecture and data flows.

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Data Flow](#data-flow)
4. [Key Technologies](#key-technologies)
5. [Database Schema](#database-schema)
6. [Backend Services](#backend-services)
7. [Frontend/Visualizer](#frontendvisualizer)
8. [Deployment & Operations](#deployment--operations)

---

## Project Overview

**Purpose:** Collect, store, analyze, and visualize real-time and historical public transport data for Tallinn (buses, trams, trolleys, trains).

**Core Goal:** Enable analysis of vehicle speeds, route patterns, and real-time departure information across Tallinn's public transport network.

**Key Data Sources:**
- Real-time GPS data from transport vehicles (every ~30 seconds)
- GTFS (General Transit Feed Specification) static data (daily updates)
- Stop locations and route information (daily)
- Service interruptions and announcements (continuous monitoring)

**Key Outputs:**
- Real-time vehicle tracking visualization
- Historical speed analysis by route/segment
- Departure prediction at stops
- Performance analytics

---

## System Architecture

### High-Level Component Overview

```
                          External APIs
                          /    |    \
                   TLT   /     |     \ Elron
                        /      |      \
                       v       v       v
    ┌─────────────────────────────────────────┐
    │     Python Data Collection Layer        │
    │  (folder_saving/)                       │
    │  - fetch_daily_data.py                  │
    │  - fetch_realtime_data.py               │
    │  - insert_gtfs.py                       │
    │  - insert_routes_geom.py                │
    └─────────────────────────────────────────┘
                       |
                       v
    ┌──────────────────────────────────────────┐
    │  PostgreSQL + TimescaleDB + PostGIS      │
    │  - Realtime data (hypertable)            │
    │  - GTFS tables (routes, stops, trips)    │
    │  - Route geometries                      │
    └──────────────────────────────────────────┘
                    /          \
                   /            \
                  v              v
        ┌──────────────┐    ┌──────────────┐
        │  Server      │    │  Proxy       │
        │  (port 3000) │    │  (port 3001) │
        │  Node.js     │    │  TypeScript  │
        └──────────────┘    └──────────────┘
                \                  /
                 \                /
                  v              v
        ┌──────────────────────────────┐
        │   Frontend / Visualizers     │
        │  (Visualizer/ folder)        │
        │  - realtime.html (live map)  │
        │  - speedgraph.html           │
        │  - gridspeeds.html           │
        │  - segments visualization    │
        └──────────────────────────────┘
```

### Directory Structure

```
/home/tanel/Documents/public_transport_project/iaib/
├── folder_saving/              # Python data collection & processing
│   ├── fetch_daily_data.py     # Downloads GTFS, stops, routes daily
│   ├── fetch_realtime_data.py  # Continuous GPS data collection (~30s interval)
│   ├── insert_gtfs.py          # Batch inserts GTFS data into DB
│   ├── insert_routes_geom.py   # Processes route geometries with buffers
│   ├── data_to_timescaledb.py  # GPS data -> TimescaleDB insertion
│   ├── notify_discord.py       # Sends status/error notifications
│   ├── config.py               # Configuration (data sources, URLs)
│   └── secret_config.py        # Secrets (Discord webhook, etc.)
│
├── database/                   # Database schemas and utilities
│   ├── Create/
│   │   ├── create_realtime.sql         # TimescaleDB hypertable for GPS
│   │   ├── create_stops.sql            # Stop locations (GTFS)
│   │   ├── create_routes.sql           # Route details (GTFS)
│   │   ├── create_routes_geom.sql      # Route geometries with buffers
│   │   └── create_avg_speed_view.sql   # Speed statistics views
│   ├── Insert/                 # SQL utilities for data insertion
│   ├── Migrate/                # Data migration scripts
│   └── Select/                 # Query templates
│
├── node/
│   ├── server_for/             # Express API server (port 3000)
│   │   ├── src/
│   │   │   ├── server.js       # Main API endpoints
│   │   │   └── postgres.js     # Knex DB connection
│   │   ├── sql/                # SQL query templates (organized by endpoint)
│   │   │   ├── segment/        # Speed segment analysis queries
│   │   │   ├── speedgraph/     # Vehicle speed over time queries
│   │   │   ├── points/         # Individual GPS point queries
│   │   │   ├── gridspeeds/     # Grid-based speed aggregation
│   │   │   ├── stops/          # Stop information queries
│   │   │   ├── loc_to_loc/     # Location-to-location speed queries
│   │   │   └── trips/          # Trip analysis queries
│   │   ├── knex/migrations/    # Database schema migrations (Knex)
│   │   └── package.json
│   │
│   └── proxy_for/              # TypeScript proxy server (port 3001)
│       ├── src/
│       │   ├── realtime.ts     # Main proxy endpoints
│       │   └── utils/
│       │       ├── postgres.ts # TypeScript DB connection
│       │       ├── stopsUtils.ts    # GTFS stop/departure queries
│       │       ├── routeUtils.ts    # Route geometry fetching
│       │       └── types.ts    # TypeScript type definitions
│       ├── dist/               # Compiled JavaScript
│       └── tsconfig.json
│
├── Visualizer/                 # Frontend visualization layer
│   ├── dist/                  # React production build output
│   │   ├── index.html         # Production HTML entry point
│   │   └── assets/            # Compiled JS/CSS bundles and SVG icons
│   ├── realtime/
│   │   ├── realtime.html      # Live vehicle tracking map (vanilla)
│   │   ├── realtime.js        # Leaflet map implementation (vanilla)
│   │   └── realtime.css       # Styling for realtime map
│   ├── speedgraph/            # Speed over time visualization
│   ├── gridspeeds/            # Grid-based speed heatmap
│   ├── points/                # Individual GPS points visualization
│   ├── fromAtoB/              # Point-to-point analysis
│   ├── trips/                 # Trip analysis visualization
│   ├── utils/                 # Shared frontend utilities
│   ├── timetableParser.js     # GTFS timetable parsing
│   ├── tallinn3.js            # Main Leaflet map implementation
│   ├── index.html             # Main entry page
│   └── assets/                # Icons and media
│
├── react/                     # React realtime visualizer (top-level)
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Map.tsx
│   │   │   ├── VehicleMarker.tsx
│   │   │   ├── VehiclesLayer.tsx
│   │   │   ├── StopMarker.tsx
│   │   │   ├── StopsLayer.tsx
│   │   │   ├── RoutePolyline.tsx
│   │   │   └── ...
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useVehicles.ts
│   │   │   ├── useStops.ts
│   │   │   ├── useRoute.ts
│   │   │   ├── useRouteStops.ts
│   │   │   ├── useAnimatedMarker.ts
│   │   │   └── useGeolocation.ts
│   │   ├── store/             # Zustand state management
│   │   │   └── mapStore.ts
│   │   ├── types/             # TypeScript type definitions
│   │   ├── styles/            # Component styles
│   │   └── App.tsx            # Main React app
│   ├── public/                # Static assets
│   │   └── assets/            # SVG vehicle icons
│   ├── package.json           # React dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── dev.sh                 # Development server script
│   └── build.sh               # Production build script
│
├── shared/                    # Shared code between vanilla and React
│   ├── api.js                 # API functions
│   ├── api.d.ts               # TypeScript declarations
│   ├── constants.js           # Shared constants
│   ├── constants.d.ts         # TypeScript declarations
│   ├── utils.js               # Utility functions
│   └── utils.d.ts             # TypeScript declarations
│
└── README.md                  # Project overview
```

---

## Data Flow

### 1. Real-Time Data Pipeline (30-second cycle)

**Flow:** External API → Python script → PostgreSQL TimescaleDB

**Details:**
- **Source:** `https://transport.tallinn.ee/readfile.php?name=gps.txt` (Tallinn) + `https://elron.ee/map_data.json` (Elron trains)
- **Collection:** `folder_saving/fetch_realtime_data.py` runs continuously in a loop
  - Fetches GPS data every 30 seconds
  - Parses comma-separated values (type, line, lon, lat, direction, vehicle_id, etc.)
  - Calculates speed based on previous location and time delta
  - Inserts into `realtimedata` hypertable in TimescaleDB
  - Also checks for service interruptions every 5 minutes
- **Processing:** `folder_saving/data_to_timescaledb.py`
  - Converts lat/lon from integer format (×1,000,000) to degrees
  - Calculates speed using geopy distance between consecutive points
  - Speed only calculated if time delta between 15-45 seconds (valid movement)
  - Maximum speed capped at 250 km/h
- **Storage:** TimescaleDB `realtimedata` table (compressed, partitioned by time)

**Data Format (GPS):**
```
type,line,longitude,latitude,direction,vehicle_id,unknown1,unknown2,destination
2,16,24751234,59431234,0,1002,x,x,destination_name
```

### 2. Daily Data Pipeline (runs ~04:00 daily)

**Flow:** External APIs → Downloaded files → Processing → Database

**Steps:**
1. **GTFS Download** (`fetch_daily_data.py`)
   - Fetches latest GTFS zip from `https://transport.tallinn.ee/data/gtfs.zip`
   - Checks Last-Modified header for incremental updates
   - Saves to `GTFS_data/latest_gtfs.zip` and dated backup

2. **GTFS Insertion** (`insert_gtfs.py`)
   - Extracts CSV files from GTFS zip
   - Converts route shapes to PostGIS LINESTRING geometries
   - Converts stop locations to PostGIS POINT geometries
   - Converts time strings (HH:MM:SS) to seconds for optimization
   - Batch inserts using psycopg2 execute_values (1000 rows/page)
   - Truncates and replaces tables:
     - `routes` - 100-150 rows
     - `stops` - 800-1000 rows
     - `trips` - 2000-3000 rows
     - `stop_times` - 50,000-100,000 rows
     - `shapes` - geometries for all routes
     - `calendar` - service schedules (weekday flags + date ranges)

3. **Route Geometry Processing** (`insert_routes_geom.py`)
   - Decodes polyline format from route files
   - Creates LINESTRING geometries for each route/direction
   - Adds buffer zones (75m) at route start/end points using Estonian CRS (EPSG:3301)
   - Stores in `routes_geom` table for stop filtering

4. **Additional Data** (`fetch_daily_data.py`)
   - Route coordinates: `https://transport.tallinn.ee/data/tallinna-linn_{type}_{number}.txt`
   - Bus times/schedules: `https://transport.tallinn.ee/data/routes.txt`
   - Stop locations: `https://transport.tallinn.ee/data/stops.xml`
   - Announcements: `https://transport.tallinn.ee/announcements.json`
   - Service interruptions (continuous, checked every 5 min)

5. **Notifications**
   - Discord webhook notifications sent with summary stats
   - Error notifications if any step fails

### 3. Query Execution Flow

**Frontend Request → Proxy/Server → Database Query → Response**

Example: User requests speed segments for route 2 on 2025-01-15 15:00-19:00
1. Frontend: `GET /api/speedsegments?startTime=2025-01-15%2015:00:00&endTime=2025-01-15%2019:00:00&line=2`
2. Server (`server.js`):
   - Validates parameters (date format, line format, time range)
   - Constructs multi-part SQL query from template files
   - Adds WHERE clauses and bindings
   - Executes against database
3. Database executes:
   ```
   speed_data CTE → calculates lead/lag for consecutive points
   segment_data CTE → creates LINESTRING segments between points
   select_data CTE → filters by speed, time, excludes depos locations
   Final SELECT → returns geojson segments with speed
   ```
4. Server caches result (60s for transient, persistent file cache for others)
5. Response sent to frontend as GeoJSON

---

## Key Technologies

### Backend
- **Python 3**: Data collection, processing, ETL
- **Node.js + Express**: REST API server for historical data queries
- **TypeScript**: Proxy server with type safety for real-time endpoints
- **Knex.js**: Query builder and migrations for PostgreSQL

### Database
- **PostgreSQL 12+**: Primary relational database
- **TimescaleDB**: Time-series extension for hypertable compression
- **PostGIS**: Spatial/geographic queries (POINT, LINESTRING geometries)

### Frontend
- **Leaflet.js**: Interactive maps
- **OpenStreetMap**: Map tiles
- **Vanilla JavaScript**: Map interactions, data visualization

### DevOps & Utilities
- **systemd**: Service management for continuous scripts
- **Tailscale**: Secure remote access
- **fail2ban**: DDoS/brute-force protection
- **msmtp**: Email notifications
- **Discord Webhooks**: Real-time notifications

---

## Database Schema

### Core Tables

#### 1. `realtimedata` (TimescaleDB Hypertable)
Stores continuous GPS tracking data for all vehicles.

```sql
CREATE TABLE realtimedata (
    datetime timestamptz NOT NULL,      -- Timestamp of GPS reading
    type int2,                          -- Vehicle type (2=bus, 3=tram, 10=train, etc.)
    line text NOT NULL,                 -- Route line number (e.g., "2", "3A")
    vehicle_id text NOT NULL,           -- Unique vehicle identifier
    direction int2,                     -- Direction (0/1 typically)
    destination text,                   -- Destination name/code
    geom geography(point, 4326),        -- GPS location (lon, lat)
    unknown1 text,                      -- Reserved fields
    unknown2 text,
    speed int2,                         -- Calculated speed in km/h
    PRIMARY KEY (datetime, vehicle_id)
);
-- Partitioned by datetime (TimescaleDB hypertable)
-- Compressed after 7 days
-- Size: ~3.8GB (after compression from 28GB)
```

**Indexes:**
- Primary key on (datetime, vehicle_id) - enables range queries
- Segment by: line, vehicle_id in compression

#### 2. GTFS Static Data Tables

**`routes`** - Transit lines/routes
```sql
route_id (PK), route_short_name, route_long_name, route_type, 
route_color, route_text_color, route_sort_order
```

**`stops`** - Transit stop locations
```sql
stop_id (PK), stop_code, stop_name, location GEOMETRY(Point, 4326), 
stop_desc, thoreb_id
```

**`trips`** - Individual vehicle trips/schedules
```sql
trip_id (PK), route_id (FK), service_id (FK), trip_headsign, 
direction_id, block_id, shape_id, wheelchair_accessible, 
vehicle_type, thoreb_id
```

**`stop_times`** - When trips arrive/depart at each stop
```sql
trip_id (FK, PK), stop_id (FK, PK), stop_sequence (PK),
arrival_time, departure_time, arrival_secs, departure_secs
-- Indexes: (stop_id, arrival_time), (trip_id, stop_sequence)
```

**`shapes`** - Route path geometries
```sql
shape_id (PK), shape_geom GEOMETRY(LINESTRING, 4326)
-- Each shape is a complete route path as a line string
```

**`calendar`** - Service schedules (when routes operate)
```sql
service_id (PK), monday, tuesday, wednesday, thursday, 
friday, saturday, sunday, start_date, end_date
-- Flags (0/1) indicate if service runs on each weekday
```

#### 3. Supporting Tables

**`routes_geom`** - Route geometries with spatial buffers
```sql
day DATE, line TEXT, type INT2, direction TEXT,
geom GEOMETRY(LINESTRING), buf_start GEOMETRY, buf_end GEOMETRY
-- 75m buffers at route start/end (in Estonian CRS 3301, then back to 4326)
-- Used to filter out GPS points at route terminus
```

**`depos`** - Bus depot locations
```sql
-- Stores locations of maintenance depots/garages
-- Used to filter out stationary vehicle GPS readings
```

### Database Relationships

```
routes
  ├─ has many → trips (via route_id)
  └─ has many → shapes (via routes.route_id = trips.shape_id indirectly)

trips
  ├─ belongs to → routes (route_id)
  ├─ has many → stop_times (trip_id)
  ├─ belongs to → calendar (service_id)
  └─ references → shapes (shape_id)

stop_times
  ├─ belongs to → trips (trip_id)
  └─ belongs to → stops (stop_id)

stops
  └─ has many → stop_times (stop_id)

shapes
  └─ referenced by → trips (shape_id)

realtimedata (hypertable)
  └─ cross-referenced with other tables via line, vehicle_id
```

---

## Backend Services

### Server: Express API (port 3000)

**File:** `/home/tanel/Documents/public_transport_project/iaib/node/server_for/src/server.js`

**Purpose:** Serve historical GPS analysis queries with caching

**Key Endpoints:**

#### 1. `/speedsegments`
Returns speed data for route segments over time period
- **Query Params:** `startTime`, `endTime`, `line` (optional), `type` (optional), `maxSpeed` (optional), `disStops` (optional)
- **Returns:** GeoJSON LineString features with speed in km/h
- **Cache:** 60 seconds (in-memory)
- **Processing:** Calculates speed between consecutive GPS points, filters by time window

#### 2. `/speedgraph`
Speed profile for a specific vehicle over time
- **Query Params:** `vehicle_id`, `startTime`, `line`, `tws` (time window in hours), `disableDepos` (optional)
- **Returns:** Array of {datetime, speed, location}
- **Cache:** 60 seconds
- **Use Case:** See how a bus's speed varies throughout a trip

#### 3. `/points`
Raw GPS point data (not segments)
- **Query Params:** `startTime`, `endTime`, `line` (optional), `type` (optional), `maxSpeed` (optional)
- **Returns:** Array of GeoJSON Point features
- **Cache:** 60 seconds

#### 4. `/gridspeeds`
Grid-based speed heatmap
- **Returns:** Grid cells with average speed
- **Cache:** Persistent file cache
- **Use Case:** See speed patterns across the city as a heatmap

#### 5. `/stops`
List of all transit stops with coordinates
- **Returns:** Array of {stop_id, stop_name, lat, lon}
- **Cache:** Persistent file cache

#### 6. `/loc_to_loc`
Speed statistics between two geographic points
- **Query Params:** `lat1`, `lon1`, `lat2`, `lon2`
- **Returns:** Speed statistics for trips passing near these locations
- **Processing:** Uses PostGIS geography distance calculations

#### 7. `/trips`
Trip data (collection of stop-to-stop journeys)
- **Returns:** Grouped trip data by vehicle, line, type
- **Cache:** Persistent file cache

**Caching Strategies:**
- **Temporary Cache (60s):** For endpoints that change frequently (`speedsegments`, `points`, `speedgraph`)
- **Persistent File Cache:** For static data (`stops`, `gridspeeds`, `trips`)
- Cache keys: Base64-encoded URL

**SQL Template Organization:**
Each endpoint has dedicated SQL queries in `/sql/{endpoint}/`:
- `speed_data.sql`: CTE that windows over GPS points
- `segment_data.sql`: CTE that creates segments with speed calculations
- `select_data.sql`: Main SELECT with filters
- Multiple CTEs composed into single query

### Proxy Server: TypeScript (port 3001)

**File:** `/home/tanel/Documents/public_transport_project/iaib/node/proxy_for/src/realtime.ts`

**Purpose:** Real-time endpoints (CORS workaround, departure times, route coordinates)

**Key Endpoints:**

#### 1. `/gps`
Live vehicle locations (proxied from TLT + Elron)
- **Returns:** Raw GPS text format from transport providers
- **Cache:** 5 seconds
- **Timeout:** 2 seconds per external call
- **Handles:** Parallel fetch to both TLT and Elron APIs

#### 2. `/stops`
All transit stop information
- **Query:** Joins `stops` table with GTFS data
- **Returns:** Array of {stop_id, stop_name, lat, lon, ...}

#### 3. `/stops/:stopId/departures`
Next departures from a specific stop
- **Query Params:** `limit` (default 5, max 20)
- **Returns:** Array of scheduled departures with realtime updates if available
- **Logic:**
  1. Query GTFS `stop_times`, `trips`, `routes`, `calendar` for next 30min
  2. Fetch realtime SIRI data from `https://transport.tallinn.ee/siri-stop-departures.php?stopid={id}`
  3. Merge: realtime expected time overwrites scheduled time if available
  4. Filter out past times (unless realtime)
- **Timeout:** 2 seconds (falls back to GTFS if realtime unavailable)

#### 4. `/route`
Route geometry/path for a specific line and direction
- **Query Params:** `line`, `destination`, `type`
- **Returns:** Array of [lat, lon] coordinate pairs (LINESTRING)
- **Cache:** 6 hours
- **Processing:**
  1. Look up route by `route_short_name` and `route_type`
  2. Find matching trip by headsign (destination match)
  3. Get shape geometry from `shapes` table
  4. Parse WKB hex to coordinate array

**DB Connection:** Knex.js with PostgreSQL

```typescript
const db = knex({
  client: 'postgresql',
  connection: { /* env vars */ },
  pool: { min: 2, max: 10 }
});
```

---

## Frontend/Visualizer

### Real-Time Map (`/Visualizer/realtime/`)

**Purpose:** Live vehicle tracking on interactive map

**Two Implementations:**

#### 1. Vanilla JavaScript (`realtime.html` + `realtime.js`)
- Production-ready implementation
- Leaflet-based with direct DOM manipulation
- 6-second GPS updates with smooth RAF animations

#### 2. React Implementation (`/react/` folder) - **✅ COMPLETE**
Modern React migration with TypeScript - full feature parity with vanilla version:

**Completed Features (All Phases 1-6):**
- ✅ React 19 + TypeScript + Vite 7 setup
- ✅ React-Leaflet map with geolocation
- ✅ Real-time vehicle tracking with smooth animations
  - TanStack Query for 6-second GPS updates
  - RAF-based 60fps position interpolation
  - Smooth rotation animations
- ✅ Stop markers with zoom-based visibility (desktop: 15+, mobile: 14+)
  - Bounds-based filtering for performance
  - Departure popups with real-time indicators
  - Next 3 departures per route
- ✅ Route selection and visualization
  - Click departure → route drawn on map
  - Click vehicle → show its route
  - Vehicle filtering by selected route
  - Hidden vehicles don't show popups
  - Double-click map to deselect
- ✅ Performance optimizations
  - Memoized components and calculations
  - Map event debouncing
  - Console logs removed for production
- ✅ Production build ready
  - Output to `/Visualizer/dist/` for deployment

**Tech Stack:**
- React 19 + TypeScript
- React-Leaflet + Leaflet
- TanStack Query (data fetching)
- Zustand (state management)
- Vite 7 (build tool)

**Data Sources:**
- Real-time: `/proxy/gps` endpoint (6s updates)
- Static: `/proxy/stops` endpoint
- Departures: `/proxy/stops/:stopId/departures`
- Routes: `/proxy/route?line={}&type={}&destination={}`
- Interruptions: `/transport_data/interruptions_data/ongoing.json`

**Key Components:**
- `VehiclesLayer` - Manages all vehicle markers with React Query
- `VehicleMarker` - Animated markers with RAF interpolation, conditional popup rendering
- `StopsLayer` - Zoom/bounds-based stop rendering
- `RoutePolyline` - Selected route visualization
- `MapClickHandler` - Route deselection logic
- `useRouteStops` - Route-specific stop data fetching

**Development:**
- Dev server: `cd react && npm run dev` (http://localhost:5173)
- Production build: `cd react && npm run build` (outputs to Visualizer/dist/)
- See `react/README.md` for detailed documentation

### Speed Visualization (`/Visualizer/speedgraph/speedgraph.html`)

**Purpose:** Show how vehicle speed varies over time for a specific trip

**Data Source:** `/speedgraph` endpoint
- Filters by `vehicle_id`, `line`, `startTime`
- Returns speed readings over time window

**Visualization:** Leaflet map with:
- Route line (color-coded by speed)
- Speed graph chart
- Timeline scrubber

### Grid Speed Heatmap (`/Visualizer/gridspeeds/gridspeeds.html`)

**Purpose:** City-wide average speeds in grid cells

**Data Source:** `/gridspeeds` endpoint
- Aggregates speed data into grid cells
- Returns average speed per cell

**Visualization:** Leaflet map with colored grid overlay

### Historical Speed Analysis (`/Visualizer/speeds_by_segments/segment_speeds.html`)

**Purpose:** Most developed tool - analyze speeds for any hour/route

**Features:**
- Date/time picker
- Route filter
- Vehicle type filter
- Speed filter (min/max)
- Interactive segment visualization

**Data Source:** `/speedsegments` endpoint

### Supporting Utilities

**`timetableParser.js`** (530KB)
- Parses GTFS timetable data
- Creates lookup tables for stops, routes, trips

**`tallinn3.js`** (232KB)
- Large Leaflet map implementation
- Likely legacy/original map code

---

## Deployment & Operations

### Python Services (systemd)

Real-time data collection runs as background service:

```bash
# Service: transport_realtime_data
# Runs: fetch_realtime_data.py
# Frequency: Continuous (~30s per cycle)
# Logs: journalctl -u transport_realtime_data -f
```

Daily scraper typically runs at 04:00 via cron or systemd timer

### Node Services

**Server (port 3000):**
```bash
cd /home/tanel/Documents/public_transport_project/iaib/node/server_for
npm install
npm start  # Runs src/server.js
```

**Proxy (port 3001):**
```bash
cd /home/tanel/Documents/public_transport_project/iaib/node/proxy_for
npm run build  # Compiles TypeScript
npm start      # Runs compiled realtime.js
```

### Nginx Reverse Proxy (implied)

Routes are served over `/api` path (see server.js comment)
- Likely nginx configuration handles path routing
- `/api/speedsegments` → localhost:3000/speedsegments
- Realtime endpoints → localhost:3001/...

### Database Maintenance

**Compression (TimescaleDB):**
```sql
ALTER TABLE realtimedata SET (
    timescaledb.compress,
    timescaledb.compress_orderby = 'datetime ASC',
    timescaledb.compress_segmentby = 'line, vehicle_id'
);
CALL add_columnstore_policy('realtimedata', after => INTERVAL '7 days');
```
- Reduced size from 28GB to 3.8GB
- Data older than 7 days automatically compressed

**Backups:**
```bash
pg_basebackup -U postgres -D /backup/location -Ft -z -P
```

### Security

- **Tailscale**: Secure remote access
- **fail2ban**: DDoS/brute-force protection
- **Unattended upgrades**: Automatic security patches
- **HTTPS**: Should be configured at nginx level

### Configuration & Secrets

**Location:** `/home/tanel/Documents/public_transport_project/iaib/database/env.env`

**Variables:**
```
POSTGRES_DB=transport
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
PG_TANEL_USER=...
PG_TANEL_PASSWORD=...
TRANSPORT_DB=...
```

**Secrets:** 
- `/folder_saving/secret_config.py` - Discord webhook URL

---

## Development Workflow

### Adding a New API Endpoint

1. **Create SQL Query:**
   - Add `.sql` file in `/node/server_for/sql/{feature}/`
   - Use CTEs for complex logic (speed_data → segment_data → select_data)

2. **Add Endpoint Handler:**
   - Edit `/node/server_for/src/server.js`
   - Add `app.get('/endpoint', ...)` handler
   - Use template pattern: read SQL files, build WHERE clauses, execute

3. **Add Caching:**
   - Use `tempCacheMiddleware(ttlSeconds)` for real-time data
   - Use `cacheMiddlewarePersistent()` for static data

4. **Test:**
   - Call endpoint via browser: `http://localhost:3000/endpoint?param=value`
   - Check database logs for query issues

### Modifying Database Schema

1. **Use Knex migrations:**
   ```bash
   npx knex migrate:make {migration_name}
   # Edit the generated file in knex/migrations/
   npx knex migrate:latest
   ```

2. **Or raw SQL** (for complex operations):
   - Execute directly against PostgreSQL
   - Document in git commit

### Running Data Collection Manually

```bash
# One-time daily data fetch
cd /home/tanel/Documents/public_transport_project/iaib/folder_saving
python3 fetch_daily_data.py

# Real-time data collection (runs continuously)
python3 fetch_realtime_data.py
```

### Debugging

**Check Service Status:**
```bash
systemctl status transport_realtime_data
journalctl -u transport_realtime_data -f
```

**Database Queries:**
```bash
psql -h localhost -U postgres -d transport
# Then use \dt to list tables, \x for expanded output
```

**API Calls:**
```bash
curl "http://localhost:3000/speedsegments?startTime=2025-01-15%2015:00:00&endTime=2025-01-15%2019:00:00"
```

---

## Key Metrics & Notes

### Data Volume
- **Real-time reads:** ~1-2 updates per second (vehicles × 30s interval)
- **Daily GTFS update:** 100-150 routes, 800-1000 stops, 2000-3000 trips, 50,000-100,000 stop times
- **Database size:** ~3.8GB (after compression, was 28GB)
- **Time-series data:** Continuous since 2024-06-06

### Performance Considerations
- Speed calculations use window functions (LEAD/LAG) for efficiency
- TimescaleDB compression critical for storage
- Caching essential for UI responsiveness (segment queries can be large)
- PostGIS operations cached where possible

### Known Issues/Gotchas
- Real-time feeds sometimes timeout (2s limit, falls back gracefully)
- Route data requires lowercase vehicle type matching (e.g., "bus_41b" not "bus_41B")
- Speed calculation only valid for 15-45 second intervals between readings
- Depot locations filtered via spatial queries (helps clean up stationary data)
- Destination names require fuzzy matching (lowercase LIKE in queries)

---

## Related Documentation

- **README.md** - Overview and setup instructions
- **good_to_know.md** - Operational notes and configuration tips
- **changelog.md** - Historical changes and deployment notes
- **folder_saving/lessons_learned.md** - (if exists) Past issues and solutions

---

*Last Updated: 2025-10-24*
*For questions or clarifications, refer to the main README or contact the project maintainer.*
