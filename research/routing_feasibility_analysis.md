# A-to-B Routing Feasibility Analysis

**Date:** 2025-11-01
**Topic:** Adding fastest route functionality from point A to B using database and real-time vehicle data

---

## Current Advantages

Your system already has excellent foundations:

✅ **Data Infrastructure:**
- Complete GTFS dataset (routes, stops, stop_times, shapes)
- Real-time GPS positions (30s updates)
- Historical speed data in TimescaleDB
- Stop departures with real-time updates
- PostGIS spatial queries
- Existing `/loc_to_loc` endpoint

## Complexity Breakdown

### **EASY Components** (Already 80% there):

**1. Basic Graph Construction** - 1-2 days
- Use `stop_times` table to connect stops via routes
- Nodes = stops, Edges = route segments between stops
- This is straightforward with existing GTFS data

**2. Nearest Stop Finding** - Already solved
- PostGIS `ST_Distance` to find closest stops to lat/lon
- You already have this capability

**3. Simple Static Routing** - 2-3 days
- Dijkstra's algorithm on transit graph
- Use scheduled times from `stop_times` as weights
- Libraries like `graphlib` (JS) or NetworkX (Python) handle this

### **MEDIUM Difficulty:**

**4. Historical Speed Integration** - 3-5 days
- Query `realtimedata` for average speeds by route/time-of-day
- Replace scheduled times with empirical travel times
- SQL: `AVG(speed) GROUP BY line, hour_of_day, segment`
- Your existing speed analysis infrastructure makes this easier

**5. Walking Connections** - 2-3 days
- PostGIS to find stops within walking distance (300-500m)
- Add walking edges to graph (distance/walking_speed = time)
- Start point → nearest stops, transfers between nearby stops, last stop → destination

### **HARD Parts:**

**6. Time-Dependent Routing** - 1-2 weeks
- Problem: Edge weights change based on departure time
- Must consider: "If I arrive at 10:15, next bus is 10:22, so wait 7 minutes"
- Requires time-expanded graph or profile-based algorithms
- Not just "shortest path" but "fastest path departing at time T"

**7. Real-time Vehicle Position Integration** - 2-3 weeks
- Match vehicles to scheduled trips (vehicle_id → trip_id mapping)
- Predict arrival times: current position + speed → ETA
- Adjust downstream stop times based on delays
- Your `/proxy/stops/:stopId/departures` already does this per-stop, need system-wide

**8. Transfer Time Handling** - 3-5 days
- Minimum transfer time (can you make the connection?)
- Different times for same-platform vs cross-platform transfers
- Real-time: "Will I make this connection given current delay?"

### **VERY HARD:**

**9. Service Interruptions** - 1 week
- Block routes/segments from `ongoing.json`
- Dynamic graph updates when disruptions occur
- Reroute suggestions when planned route blocked

**10. Performance Optimization** - Ongoing
- 1000 stops × 20 avg connections = ~20k edges
- Time-dependent routing computationally expensive
- Need <1s response time for good UX
- Solutions: Precomputation, caching, spatial indexing

**11. Multiple Route Options** - 1 week
- Return 2-3 alternatives (fastest vs fewest transfers vs least walking)
- K-shortest paths with constraints
- Pareto-optimal routes

## Implementation Strategies

### **Option A: DIY Basic MVP (1-2 weeks)**

**Effort:** ~40-60 hours

```javascript
// Pseudocode
1. Build graph from stop_times
2. Implement Dijkstra with scheduled times
3. Find nearest stops (PostGIS)
4. Return route: [
     {stop_name, route_line, departure_time, arrival_time}
   ]
5. Simple UI overlay on existing map
```

**Limitations:**
- No real-time vehicle positions
- No historical speed data
- Single route only
- Fixed schedule (doesn't consider actual departure time)

**Difficulty: 5/10** - Well-understood problem, existing data structure supports it

---

### **Option B: OpenTripPlanner Integration (2-3 weeks)**

**Effort:** ~60-80 hours

OpenTripPlanner (OTP) is the industry standard for transit routing:

✅ Reads GTFS natively
✅ Time-dependent routing built-in
✅ Real-time updates (GTFS-RT)
✅ Multi-modal (walk + transit)
✅ Multiple route alternatives
✅ Well-tested, used by major cities

**Steps:**
1. Docker container for OTP (1 day)
2. Configure GTFS feed (your daily update script) (1 day)
3. Create GTFS-RT feed from your real-time data (3-5 days)
4. API wrapper in proxy server (2-3 days)
5. Frontend integration (3-5 days)

**Difficulty: 6/10** - Integration complexity, but OTP handles hard parts

---

### **Option C: Custom with Historical Data (4-6 weeks)**

**Effort:** ~120-180 hours

Build tailored solution leveraging your unique historical speed data:

**Advantages:**
- Use actual observed travel times (not schedules)
- Time-of-day patterns (rush hour vs off-peak)
- Seasonal adjustments
- Route-specific reliability data

**Steps:**
1. Graph construction (2 days)
2. Historical speed aggregation queries (3-5 days)
3. Time-dependent routing algorithm (1-2 weeks)
4. Real-time prediction model (1-2 weeks)
5. Multi-modal integration (3-5 days)
6. Frontend (1 week)

**Difficulty: 8/10** - Algorithm complexity, real-time prediction

## Critical Challenges

### **1. Vehicle-to-Trip Matching**
- Real-time data has `vehicle_id` + `line`, but not `trip_id`
- Need heuristics: current location + direction + time → which scheduled trip?
- Without this, can't predict arrival times accurately

### **2. Delay Propagation**
- If bus is 5 minutes late at stop 3, is it still 5 min late at stop 10?
- Drivers may speed up, hit traffic, etc.
- Need historical patterns or real-time prediction

### **3. Transfer Coordination**
- Buses don't wait for connections in Tallinn (usually)
- Missing a connection = 10-20 min wait
- Reliability matters: fast route with risky transfer vs slower but reliable

## Recommended Approach

### **Phase 1: Proof of Concept (1 week)**
Build basic static routing to validate:
```sql
-- Example: Build graph from stop_times
SELECT
  t1.stop_id as from_stop,
  t2.stop_id as to_stop,
  t2.arrival_secs - t1.departure_secs as travel_time_secs,
  tr.route_short_name,
  t1.trip_id
FROM stop_times t1
JOIN stop_times t2 ON t1.trip_id = t2.trip_id
  AND t2.stop_sequence = t1.stop_sequence + 1
JOIN trips tr ON t1.trip_id = tr.trip_id
```

Simple Dijkstra's on this graph = working route planner

### **Phase 2: Add Historical Speed (1 week)**
```sql
-- Replace scheduled times with observed times
WITH avg_speeds AS (
  SELECT line,
    ST_MakeLine(lag_geom, geom) as segment,
    AVG(speed) as avg_speed,
    EXTRACT(hour FROM datetime) as hour
  FROM realtimedata
  WHERE datetime > NOW() - INTERVAL '30 days'
  GROUP BY line, segment, hour
)
-- Use this to weight graph edges
```

### **Phase 3: Real-time Integration (2 weeks)**
- Use `/proxy/stops/:stopId/departures` for next departures
- Adjust route based on current vehicle positions
- Show "Bus 23 is 3 minutes away" instead of schedule

### **Phase 4: Polish (1 week)**
- Multiple route options
- Walking optimization
- UI refinement

## Final Verdict

**Difficulty: 6-7/10** for working solution
**Difficulty: 8-9/10** for production-quality

**Timeline:**
- **Basic MVP:** 1-2 weeks (worth doing!)
- **With historical speeds:** 3-4 weeks (your unique advantage)
- **Full real-time:** 6-8 weeks (complex but feasible)
- **OpenTripPlanner route:** 2-3 weeks (faster to production)

**Biggest Insight:** You already have 70% of what you need. The "easy" parts are done (data collection, storage, real-time updates). The remaining 30% is algorithm implementation, which is well-understood computer science.

**My recommendation:** Start with Phase 1 (1 week) to see if it's useful, then decide whether to continue DIY or integrate OTP based on requirements. The hardest part isn't the code—it's deciding how to balance accuracy, performance, and development time.

## Next Steps

If you decide to proceed:

1. **Week 1:** Build basic graph + Dijkstra implementation
2. **Test:** Try routing between 5-10 common origin-destination pairs
3. **Evaluate:** Is scheduled-time routing useful enough, or do you need real-time?
4. **Decision point:** Continue DIY vs switch to OpenTripPlanner

## Additional Resources

- [OpenTripPlanner Documentation](http://docs.opentripplanner.org/)
- [GTFS Realtime Specification](https://developers.google.com/transit/gtfs-realtime)
- Dijkstra's Algorithm: Any graph theory textbook or Wikipedia
- Time-Dependent Shortest Path: Academic papers (e.g., "Round-Based Public Transit Routing")

---

**Status:** Feasibility analysis complete. Ready for implementation decision.
