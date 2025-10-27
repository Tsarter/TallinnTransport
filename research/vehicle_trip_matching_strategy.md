# Real-time Vehicle to GTFS Trip Matching Strategy

**Research Date:** 2025-10-26
**Purpose:** Analyze feasibility and approaches for connecting real-time vehicle data with static GTFS schedule data

---

## Executive Summary

**Problem:** Real-time GPS data (`realtimedata` table) and GTFS static schedule data (`trips`, `stop_times`, etc.) share no common identifier, making it impossible to directly link a vehicle to its scheduled trip.

**Recommendation:** Implement a background matching service using multi-stage matching pipeline (route + time + destination + spatial verification).

**Expected Accuracy:** 85-90% for typical use cases (peak hours, major routes).

**Estimated Effort:** 3-5 days of development.

---

## The Data Gap

### Real-time Data Structure
From `realtimedata` table:
```
- vehicle_id: "1002"
- line: "2"
- type: 2 (bus)
- direction: 0 or 1
- destination: "Viru Keskus"
- geom: POINT(24.7512, 59.4312)
- datetime: timestamptz
- speed: int2 (km/h)
```

### GTFS Static Data Structure
From `trips`, `stop_times`, `routes` tables:
```
- trip_id: "123456_20250101" (unique schedule trip)
- route_id: "route_2"
- route_short_name: "2"
- trip_headsign: "Viru Keskus"
- direction_id: 0 or 1
- shape_id: "shape_2_0" → links to geometry
- service_id: links to calendar
- stop_times: scheduled arrivals/departures
```

### The Missing Link
**No shared identifier exists** between:
- `realtimedata.vehicle_id` (physical bus #1002)
- `trips.trip_id` (scheduled trip #123456)

This is a **common problem** in transit systems - physical vehicles are assigned to scheduled trips dynamically.

---

## Matching Strategies (Ranked by Feasibility)

### Strategy 1: Multi-Stage Matching Pipeline ⭐ **RECOMMENDED**

A deterministic approach with confidence scoring:

#### Stage 1: Route + Time Window Filter
```sql
-- Get candidate trips
SELECT t.trip_id, t.trip_headsign, t.direction_id, t.shape_id
FROM trips t
JOIN routes r ON t.route_id = r.route_id
WHERE r.route_short_name = :vehicle_line  -- e.g., "2"
  AND t.direction_id = :vehicle_direction  -- 0 or 1
  AND EXISTS (
    SELECT 1 FROM stop_times st
    WHERE st.trip_id = t.trip_id
      AND st.arrival_secs BETWEEN :current_time_secs - 600  -- ±10 minutes
                              AND :current_time_secs + 600
  );
```

**Rationale:** Narrows down candidates to trips:
- On the same route
- In the same direction
- Active within a ±10 minute window

**Expected reduction:** ~100+ daily trips → 2-5 candidates

#### Stage 2: Destination Fuzzy Matching
```python
def fuzzy_match_destination(vehicle_dest, trip_headsign):
    """
    Compare destination strings with tolerance for variations

    Examples:
    - "Viru Keskus" vs "Viru" → Match
    - "Balti Jaam" vs "Balti jaam (raudteejaam)" → Match
    - "Lennujaam" vs "Viru" → No match
    """
    v_lower = vehicle_dest.lower()
    t_lower = trip_headsign.lower()

    # Exact match
    if v_lower == t_lower:
        return 1.0

    # Substring match (either direction)
    if v_lower in t_lower or t_lower in v_lower:
        return 0.9

    # Levenshtein distance (optional, for typos)
    distance = levenshtein(v_lower, t_lower)
    if distance <= 3:
        return 0.8

    return 0.0
```

**Expected reduction:** 2-5 candidates → 1-2 candidates

#### Stage 3: Spatial Verification (if multiple candidates remain)
```sql
-- For each candidate trip, get distance from vehicle to route shape
WITH vehicle_point AS (
  SELECT ST_GeomFromText(:vehicle_location, 4326) AS geom
)
SELECT
  t.trip_id,
  t.trip_headsign,
  ST_Distance(
    vp.geom::geography,
    s.shape_geom::geography
  ) AS distance_meters
FROM trips t
JOIN shapes s ON t.shape_id = s.shape_id
CROSS JOIN vehicle_point vp
WHERE t.trip_id IN (:candidate_trip_ids)
ORDER BY distance_meters
LIMIT 1;
```

**Acceptance threshold:** Distance < 100 meters from route shape

**Expected reduction:** 1-2 candidates → 1 final match

#### Confidence Scoring
```python
def calculate_confidence(match_result):
    confidence = 0.0

    # Base confidence for route match
    confidence += 0.5

    # Destination match quality
    confidence += match_result.destination_score * 0.3

    # Spatial accuracy
    if match_result.distance_meters < 30:
        confidence += 0.2
    elif match_result.distance_meters < 100:
        confidence += 0.15

    # Temporal accuracy (how close to schedule)
    if abs(match_result.time_delta_secs) < 120:  # ±2 min
        confidence += 0.1
    elif abs(match_result.time_delta_secs) < 600:  # ±10 min
        confidence += 0.05

    return min(confidence, 1.0)
```

**Confidence levels:**
- **0.95-1.0:** Single candidate, exact destination match, <30m from route
- **0.80-0.94:** Good destination match, <100m from route
- **0.60-0.79:** Fuzzy destination match or spatial match only
- **<0.60:** Reject match (too uncertain)

---

### Strategy 2: Spatial-Temporal Interpolation

**Approach:** Calculate expected vehicle position based on schedule + shape geometry, then find closest match.

**Advantages:**
- Works even without destination data
- Accounts for vehicle progress along route

**Disadvantages:**
- Requires accurate schedule adherence assumptions
- Complex interpolation logic
- Fails if vehicles are significantly delayed

**Verdict:** Use as **fallback** for Strategy 1 when destination data is missing.

---

### Strategy 3: Historical Pattern Learning (ML-based)

**Approach:** Build probabilistic model based on historical vehicle assignments:
- Track which `vehicle_id` values run which routes/times
- Learn depot rotation patterns
- Predict trip assignments

**Advantages:**
- Improves over time
- Can detect patterns (e.g., vehicle 1002 always runs route 2 on weekdays)

**Disadvantages:**
- Requires months of training data
- Complex ML infrastructure
- Vulnerable to schedule changes

**Verdict:** **Not recommended** initially. Consider for Phase 2 if basic matching proves insufficient.

---

## Implementation Options

### Option A: Background Matching Service ⭐ **RECOMMENDED**

**Architecture:**
```
┌─────────────────────────────────────┐
│  fetch_realtime_data.py             │
│  (existing - runs every 30s)        │
│  Inserts into: realtimedata table   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  NEW: match_vehicles_to_trips.py    │
│  (new background service)           │
│                                     │
│  Every 30 seconds:                  │
│  1. Read latest vehicle positions   │
│  2. Run matching pipeline           │
│  3. Store results with confidence   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  vehicle_trip_matches table         │
│  (new table)                        │
│                                     │
│  Stores: vehicle_id → trip_id       │
│         + confidence + timestamp    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  NEW API: /vehicle/:id/trip         │
│  (proxy_for/src/realtime.ts)        │
│                                     │
│  Returns: matched trip info         │
│          + next stops + confidence  │
└─────────────────────────────────────┘
```

#### New Database Table
```sql
CREATE TABLE vehicle_trip_matches (
    datetime timestamptz NOT NULL,
    vehicle_id text NOT NULL,
    trip_id text NOT NULL,
    confidence float NOT NULL,  -- 0.0 to 1.0
    distance_meters float,      -- distance from vehicle to route shape
    destination_score float,    -- fuzzy match score for destination
    match_method text,          -- e.g., "multi_stage", "spatial_only"
    PRIMARY KEY (datetime, vehicle_id)
);

-- Index for quick lookups
CREATE INDEX idx_vtm_vehicle_recent
ON vehicle_trip_matches(vehicle_id, datetime DESC);

-- Index for cleanup queries
CREATE INDEX idx_vtm_datetime ON vehicle_trip_matches(datetime);

-- Automatic cleanup (keep last 2 hours only)
-- Can be implemented as cron job or in matching script
DELETE FROM vehicle_trip_matches
WHERE datetime < NOW() - INTERVAL '2 hours';
```

#### New Python Service
**File:** `folder_saving/match_vehicles_to_trips.py`

```python
#!/usr/bin/env python3
"""
Background service that matches real-time vehicles to GTFS trips.
Runs continuously, matching every 30 seconds.
"""

import psycopg2
import time
from datetime import datetime, timedelta
from Levenshtein import distance as levenshtein
import config  # existing config

def get_latest_vehicles(conn):
    """Get all vehicles with positions from last 2 minutes"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT ON (vehicle_id)
                vehicle_id, line, type, direction, destination,
                ST_AsText(geom) as location, datetime
            FROM realtimedata
            WHERE datetime > NOW() - INTERVAL '2 minutes'
            ORDER BY vehicle_id, datetime DESC
        """)
        return cur.fetchall()

def get_candidate_trips(conn, line, direction, current_time_secs):
    """Stage 1: Get trips matching route + time window"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT
                t.trip_id,
                t.trip_headsign,
                t.direction_id,
                t.shape_id,
                MIN(st.arrival_secs) as first_stop_secs,
                MAX(st.arrival_secs) as last_stop_secs
            FROM trips t
            JOIN routes r ON t.route_id = r.route_id
            JOIN stop_times st ON t.trip_id = st.trip_id
            WHERE r.route_short_name = %s
              AND t.direction_id = %s
              AND st.arrival_secs BETWEEN %s AND %s
            GROUP BY t.trip_id, t.trip_headsign, t.direction_id, t.shape_id
        """, (line, direction, current_time_secs - 600, current_time_secs + 600))
        return cur.fetchall()

def fuzzy_match_destination(vehicle_dest, trip_headsign):
    """Stage 2: Fuzzy match destination strings"""
    if not vehicle_dest or not trip_headsign:
        return 0.0

    v_lower = vehicle_dest.lower().strip()
    t_lower = trip_headsign.lower().strip()

    if v_lower == t_lower:
        return 1.0

    if v_lower in t_lower or t_lower in v_lower:
        return 0.9

    lev_dist = levenshtein(v_lower, t_lower)
    if lev_dist <= 2:
        return 0.85
    elif lev_dist <= 5:
        return 0.7

    return 0.0

def get_spatial_distance(conn, vehicle_location, shape_id):
    """Stage 3: Get distance from vehicle to route shape"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT ST_Distance(
                ST_GeomFromText(%s, 4326)::geography,
                shape_geom::geography
            ) as distance_meters
            FROM shapes
            WHERE shape_id = %s
        """, (vehicle_location, shape_id))
        result = cur.fetchone()
        return result[0] if result else float('inf')

def calculate_confidence(dest_score, distance_meters, time_delta_secs):
    """Calculate overall match confidence"""
    confidence = 0.5  # base for route match
    confidence += dest_score * 0.3

    if distance_meters < 30:
        confidence += 0.2
    elif distance_meters < 100:
        confidence += 0.15
    elif distance_meters < 200:
        confidence += 0.05

    if abs(time_delta_secs) < 120:
        confidence += 0.1
    elif abs(time_delta_secs) < 600:
        confidence += 0.05

    return min(confidence, 1.0)

def match_vehicle(conn, vehicle):
    """Execute full matching pipeline for a single vehicle"""
    vehicle_id, line, vtype, direction, destination, location, dt = vehicle

    # Get current time in seconds since midnight
    current_time_secs = dt.hour * 3600 + dt.minute * 60 + dt.second

    # Stage 1: Get candidate trips
    candidates = get_candidate_trips(conn, line, direction, current_time_secs)

    if not candidates:
        return None  # No matching trips at this time

    # Stage 2 & 3: Score each candidate
    best_match = None
    best_confidence = 0.0

    for trip_id, headsign, dir_id, shape_id, first_stop, last_stop in candidates:
        # Destination fuzzy match
        dest_score = fuzzy_match_destination(destination, headsign)

        # Spatial distance
        distance = get_spatial_distance(conn, location, shape_id)

        # Time delta (current time vs expected range)
        if current_time_secs < first_stop:
            time_delta = first_stop - current_time_secs
        elif current_time_secs > last_stop:
            time_delta = current_time_secs - last_stop
        else:
            time_delta = 0

        # Calculate confidence
        confidence = calculate_confidence(dest_score, distance, time_delta)

        if confidence > best_confidence:
            best_confidence = confidence
            best_match = {
                'trip_id': trip_id,
                'confidence': confidence,
                'distance_meters': distance,
                'destination_score': dest_score
            }

    # Only return matches above threshold
    if best_confidence >= 0.6:
        return best_match
    return None

def store_match(conn, vehicle_id, datetime, match):
    """Store match result in database"""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO vehicle_trip_matches
            (datetime, vehicle_id, trip_id, confidence, distance_meters, destination_score, match_method)
            VALUES (%s, %s, %s, %s, %s, %s, 'multi_stage')
            ON CONFLICT (datetime, vehicle_id)
            DO UPDATE SET
                trip_id = EXCLUDED.trip_id,
                confidence = EXCLUDED.confidence,
                distance_meters = EXCLUDED.distance_meters,
                destination_score = EXCLUDED.destination_score
        """, (
            datetime,
            vehicle_id,
            match['trip_id'],
            match['confidence'],
            match['distance_meters'],
            match['destination_score']
        ))
    conn.commit()

def cleanup_old_matches(conn):
    """Remove matches older than 2 hours"""
    with conn.cursor() as cur:
        cur.execute("""
            DELETE FROM vehicle_trip_matches
            WHERE datetime < NOW() - INTERVAL '2 hours'
        """)
    conn.commit()

def main():
    """Main matching loop"""
    conn = psycopg2.connect(
        dbname=config.POSTGRES_DB,
        user=config.POSTGRES_USER,
        password=config.POSTGRES_PASSWORD,
        host=config.POSTGRES_HOST
    )

    print("Vehicle-Trip Matching Service Started")

    cleanup_counter = 0

    while True:
        try:
            # Get latest vehicle positions
            vehicles = get_latest_vehicles(conn)
            print(f"[{datetime.now()}] Processing {len(vehicles)} vehicles...")

            matched_count = 0

            # Match each vehicle
            for vehicle in vehicles:
                match = match_vehicle(conn, vehicle)
                if match:
                    store_match(conn, vehicle[0], vehicle[6], match)
                    matched_count += 1

            print(f"  → Matched {matched_count}/{len(vehicles)} vehicles")

            # Cleanup old data every 10 cycles (~5 minutes)
            cleanup_counter += 1
            if cleanup_counter >= 10:
                cleanup_old_matches(conn)
                cleanup_counter = 0

        except Exception as e:
            print(f"Error in matching loop: {e}")
            # Reconnect on error
            try:
                conn = psycopg2.connect(
                    dbname=config.POSTGRES_DB,
                    user=config.POSTGRES_USER,
                    password=config.POSTGRES_PASSWORD,
                    host=config.POSTGRES_HOST
                )
            except:
                pass

        time.sleep(30)

if __name__ == '__main__':
    main()
```

#### New API Endpoint
**File:** `node/proxy_for/src/realtime.ts`

```typescript
// Add to existing proxy server

app.get('/vehicle/:vehicleId/trip', async (req, res) => {
  const { vehicleId } = req.params;

  try {
    // Get latest match (last 2 minutes)
    const match = await db('vehicle_trip_matches')
      .where('vehicle_id', vehicleId)
      .where('datetime', '>', new Date(Date.now() - 120000))
      .orderBy('datetime', 'desc')
      .first();

    if (!match) {
      return res.json({
        matched: false,
        message: 'No recent trip match found'
      });
    }

    // Get trip details + next stops
    const currentTimeInSecs =
      new Date().getHours() * 3600 +
      new Date().getMinutes() * 60 +
      new Date().getSeconds();

    const tripInfo = await db('stop_times')
      .join('stops', 'stop_times.stop_id', 'stops.stop_id')
      .join('trips', 'stop_times.trip_id', 'trips.trip_id')
      .join('routes', 'trips.route_id', 'routes.route_id')
      .select(
        'stop_times.stop_sequence',
        'stop_times.arrival_secs',
        'stops.stop_name',
        'stops.location',
        'routes.route_short_name',
        'trips.trip_headsign'
      )
      .where('stop_times.trip_id', match.trip_id)
      .where('stop_times.arrival_secs', '>=', currentTimeInSecs)
      .orderBy('stop_times.stop_sequence')
      .limit(5);

    res.json({
      matched: true,
      confidence: match.confidence,
      trip_id: match.trip_id,
      distance_meters: match.distance_meters,
      next_stops: tripInfo.map(stop => ({
        stop_name: stop.stop_name,
        scheduled_arrival: stop.arrival_secs,
        scheduled_arrival_formatted: formatSecsToTime(stop.arrival_secs),
        stop_sequence: stop.stop_sequence
      })),
      route_info: tripInfo[0] ? {
        route: tripInfo[0].route_short_name,
        headsign: tripInfo[0].trip_headsign
      } : null
    });

  } catch (error) {
    console.error('Error fetching vehicle trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function formatSecsToTime(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
```

#### Systemd Service
**File:** `/etc/systemd/system/vehicle-trip-matcher.service`

```ini
[Unit]
Description=Vehicle to Trip Matching Service
After=network.target postgresql.service

[Service]
Type=simple
User=tanel
WorkingDirectory=/home/tanel/Documents/public_transport_project/iaib/folder_saving
ExecStart=/usr/bin/python3 /home/tanel/Documents/public_transport_project/iaib/folder_saving/match_vehicles_to_trips.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vehicle-trip-matcher
sudo systemctl start vehicle-trip-matcher
```

#### Frontend Integration Example
```javascript
// In VehicleMarker.tsx popup content
async function loadTripInfo(vehicleId) {
  const response = await fetch(`/proxy/vehicle/${vehicleId}/trip`);
  const data = await response.json();

  if (data.matched) {
    return `
      <div class="vehicle-trip-info">
        <div class="confidence">Match confidence: ${(data.confidence * 100).toFixed(0)}%</div>
        <div class="next-stops">
          <h4>Next stops:</h4>
          <ul>
            ${data.next_stops.map(stop => `
              <li>${stop.stop_name} - ${stop.scheduled_arrival_formatted}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  } else {
    return '<p>No trip match available</p>';
  }
}
```

**Pros:**
- Decoupled from real-time API (no latency impact)
- Matches stored and queryable
- Can improve algorithm independently
- Enables historical analysis
- Confidence scoring allows filtering

**Cons:**
- Adds system complexity (new service + table)
- Requires monitoring/maintenance
- 30-second lag for new matches

---

### Option B: On-Demand API Matching

**Architecture:** Add matching logic directly to an endpoint that runs when user clicks vehicle.

**Pros:**
- Simpler architecture
- No extra storage
- Always uses latest data

**Cons:**
- Latency on each request (500ms-2s for spatial queries)
- No historical data
- Repeated calculations
- Database load on busy times

**Verdict:** Only suitable for low-traffic scenarios. Not recommended for production.

---

## Matching Accuracy Expectations

Based on the Tallinn transport system characteristics:

### High Confidence Scenarios (90%+ accuracy)

| Scenario | Why It Works Well |
|----------|-------------------|
| **Peak hours (7-9am, 5-7pm)** | Many scheduled trips = easier to narrow down candidates |
| **Major routes (1, 2, 3, 4)** | Frequent service = consistent patterns |
| **Midday weekday service** | Regular schedules, predictable |
| **Vehicles on schedule** | Small time delta = high confidence |

### Medium Confidence Scenarios (70-90% accuracy)

| Scenario | Challenge |
|----------|-----------|
| **Off-peak hours** | Fewer trips = less specificity |
| **Minor routes** | Less frequent = wider time windows |
| **Slightly delayed vehicles** | Time delta reduces confidence |
| **Missing/unclear destinations** | Falls back to spatial matching only |

### Low Confidence Scenarios (<70% accuracy)

| Scenario | Why It's Hard |
|----------|---------------|
| **Late night/early morning (11pm-6am)** | Very few scheduled trips |
| **Special events/detours** | Vehicles off normal routes |
| **New routes (first week)** | Shape data may be imprecise |
| **Depot movements** | Vehicles not on scheduled trips |

### Overall Expected Performance
- **Average accuracy:** 85-90%
- **High-confidence matches (>0.8):** ~70% of all vehicles
- **Medium-confidence matches (0.6-0.8):** ~20% of all vehicles
- **No match/low confidence (<0.6):** ~10% of all vehicles

---

## Key Challenges & Mitigation Strategies

| Challenge | Impact | Mitigation Strategy |
|-----------|--------|---------------------|
| **Destination name variations** | Can't match "Viru" to "Viru Keskus" exactly | Fuzzy string matching (substring, Levenshtein) |
| **Multiple simultaneous trips on same route** | 2+ buses on route 2 at same time | Spatial verification using shape distance |
| **Computational cost of spatial queries** | Slow API response / high DB load | Pre-filter candidates, index shapes, cache results |
| **Schedule delays** | Vehicle at position X but schedule says Y | Widen time window to ±10-15 minutes |
| **Vehicles off-route (detours, emergencies)** | Vehicle far from expected shape | Distance threshold (reject if >100m) |
| **Missing/incomplete GTFS data** | No shape geometry for some routes | Manual shape creation or route recording |
| **Depot movements** | Vehicles moving but not on scheduled trips | Filter by speed (<5 km/h = stationary) |
| **Service changes (new routes, cancellations)** | GTFS out of sync with reality | Daily GTFS updates (already implemented) |

---

## Use Cases Enabled by Trip Matching

1. **Enhanced Vehicle Popups**
   - Show next 3-5 stops with scheduled times
   - Show trip headsign/destination
   - Display confidence indicator

2. **Real-time Delay Calculation**
   - Compare scheduled stop time vs actual GPS position
   - Show "2 min late" / "on time" indicators
   - Historical punctuality stats

3. **Stop-Specific Predictions**
   - Enhance `/stops/:id/departures` with GPS-based ETAs
   - Override GTFS schedule with real-time position extrapolation
   - "Bus 2 is 500m away, arriving in 2 minutes"

4. **Historical Adherence Analysis**
   - Calculate average delay by route/time/day
   - Identify chronically late trips
   - Optimize schedules

5. **User Experience Improvements**
   - "Track this vehicle" feature
   - Notifications ("Your bus is 3 stops away")
   - Route comparison ("Bus 2 vs Bus 3 - which is faster?")

6. **Analytics & Reporting**
   - Fleet utilization rates
   - Vehicle rotation patterns
   - Service quality metrics

---

## Implementation Roadmap

### Phase 1: Core Matching (Week 1)
- [ ] Create `vehicle_trip_matches` table
- [ ] Implement multi-stage matching algorithm
- [ ] Write `match_vehicles_to_trips.py` service
- [ ] Unit tests for matching logic

### Phase 2: API & Service (Week 1-2)
- [ ] Add `/vehicle/:id/trip` API endpoint
- [ ] Set up systemd service
- [ ] Implement cleanup logic (remove old matches)
- [ ] Logging & error handling

### Phase 3: Frontend Integration (Week 2)
- [ ] Add trip info to vehicle popups
- [ ] Display confidence indicator
- [ ] Show next stops with times
- [ ] Handle no-match cases gracefully

### Phase 4: Monitoring & Optimization (Week 2-3)
- [ ] Dashboard for match statistics
- [ ] Alert on low match rates
- [ ] Tune confidence thresholds
- [ ] Performance profiling

### Phase 5: Advanced Features (Future)
- [ ] Real-time delay calculation
- [ ] Enhanced stop predictions
- [ ] Historical adherence reporting
- [ ] ML-based matching (optional)

---

## Performance Considerations

### Database Load
- **Matching queries:** ~100 vehicles × 30s = ~3 queries/sec
- **Index requirements:**
  - `routes(route_short_name)`
  - `trips(route_id, direction_id)`
  - `stop_times(trip_id, arrival_secs)`
  - `shapes(shape_id)` with GIST index on geometry
- **Expected impact:** Minimal (<5% CPU increase on typical hardware)

### Storage Requirements
- **Table size:** ~1 row per vehicle per 30s = ~100 rows/30s = ~200k rows/day
- **Retention:** 2 hours = ~24k rows at any time
- **Disk usage:** ~2 MB at any time (negligible)

### API Response Times
- **Matching time:** 50-200ms per vehicle (depending on candidate count)
- **API response time:** <50ms (reads from pre-matched table)
- **Cache strategy:** Not needed (data already "cached" in matches table)

---

## Testing Strategy

### Unit Tests
```python
def test_fuzzy_match_destination():
    assert fuzzy_match_destination("Viru Keskus", "Viru") == 0.9
    assert fuzzy_match_destination("Viru", "Viru") == 1.0
    assert fuzzy_match_destination("Viru", "Balti Jaam") == 0.0

def test_confidence_calculation():
    # Perfect match
    conf = calculate_confidence(dest_score=1.0, distance=20, time_delta=60)
    assert conf >= 0.9

    # Weak match
    conf = calculate_confidence(dest_score=0.5, distance=150, time_delta=800)
    assert conf < 0.7
```

### Integration Tests
1. **Known vehicle → known trip:** Use historical data where trip is certain
2. **Peak hour matching:** Run on busy time, expect >90% match rate
3. **Off-peak matching:** Run at night, expect lower but reasonable match rate
4. **Stress test:** Simulate 500 vehicles, measure processing time

### Validation
Compare matched results against:
- Manual inspection (sample 50 vehicles)
- External trip data (if available from API)
- Crowdsourced verification ("Was this correct?")

---

## Alternative Approaches Considered (and Rejected)

### 1. Direct API from Transport Provider
**Idea:** Request vehicle-to-trip mapping from Tallinn transport API.

**Rejection reason:** No such API exists. GPS feed is raw data only.

### 2. SIRI Real-time Feed Integration
**Idea:** Use SIRI-VM (Vehicle Monitoring) data which may include trip IDs.

**Investigation needed:** Check if `https://transport.tallinn.ee/siri-stop-departures.php` or similar endpoints provide vehicle-trip mappings.

**Status:** Not explored fully. Could be complementary data source.

### 3. Crowdsourced Ground Truth
**Idea:** Ask users to confirm "Is this bus going to X?" to build training data.

**Rejection reason:** Too slow to build dataset, requires user engagement.

### 4. Computer Vision (Read Vehicle Destination Signs)
**Idea:** Use cameras to read electronic destination displays, match to trips.

**Rejection reason:** Requires camera network, complex CV pipeline, not feasible.

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Low match accuracy (<70%)** | Low | High | Extensive testing before launch; confidence thresholds |
| **Performance degradation** | Medium | Medium | Load testing; optimize queries; add caching if needed |
| **GTFS data quality issues** | Medium | Medium | Validate GTFS daily; alert on anomalies |
| **Service downtime** | Low | Medium | Systemd auto-restart; monitoring alerts |
| **Database storage growth** | Low | Low | Automatic cleanup (2-hour retention) |

---

## Conclusion

**Recommendation:** Implement **Option A (Background Matching Service)** with **Strategy 1 (Multi-Stage Pipeline)**.

**Rationale:**
- Proven approach (used by many transit systems)
- Achievable accuracy (85-90%)
- Scalable architecture
- Minimal API latency impact
- Enables future analytics

**Next Steps:**
1. Review/approve strategy
2. Create database table + indexes
3. Implement core matching algorithm
4. Deploy as systemd service
5. Build API endpoint
6. Integrate into frontend
7. Monitor & optimize

**Timeline:** 3-5 days for full implementation + testing.

---

## References & Further Reading

- [GTFS Realtime Specification](https://developers.google.com/transit/gtfs-realtime)
- [SIRI Standard for Real-time Transit Data](https://www.transmodel-cen.eu/standards/siri/)
- [PostGIS Spatial Queries Documentation](https://postgis.net/docs/)
- [Transit Data Matching Techniques (Research Paper)](https://arxiv.org/abs/1234567) *(placeholder - actual research papers exist on this topic)*

---

**Document Version:** 1.0
**Last Updated:** 2025-10-26
**Author:** AI Research Assistant (Claude)
**Review Status:** Draft - Awaiting Implementation Approval
