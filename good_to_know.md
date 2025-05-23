Shows drive status
`systemctl status home-tanel-Documents-public_transport_project-HardDrive.mount`

Changed interruptions endpoint on 23.07.2024

Missing realtime data from 15:08:44 2024-09-04 until 9:24:52 2024-09-07

Added .lower() to routes. 6.10.2024
https://transport.tallinn.ee/data/tallinna-linn_bus_41B.txt This gave error before
https://transport.tallinn.ee/data/tallinna-linn_bus_41b.txt This works
This means all b lines are missing routes info.

Added announcments 22:10:2024 at 23:45

Interruptions are now scraped every 5min and in .json format 22:10:2024

Changed time when daily scraper runs. 31.10.2024 at 23:50
Previosuly at 01:00, now 04:00.
Week of data missing 08.11.2024-16.11.2024

17.11.2024 Added realtime endpoint from https://transport.tallinn.ee/gps.php -> https://transport.tallinn.ee/readfile.php?name=gps.txt
Now I have route direction also.


## 2025
## March
### Compression 2025-03-20
Before size: 28gb
After size: 3.8gb
Compressed data in postgres using
```sql
ALTER TABLE realtimedata SET (
    timescaledb.compress,
    timescaledb.compress_orderby = 'datetime DESC',
    timescaledb.compress_segmentby = 'line, vehicle_id'
);
```

Check if compressed
```sql
SELECT hypertable_name, chunk_name, is_compressed
FROM timescaledb_information.chunks
WHERE hypertable_name = 'realtimedata';
```

Check size
```sql
SELECT * FROM hypertable_approximate_detailed_size('realtimedata');
```

### Backup 2025-03-20
```bash
pg_basebackup -U postgres -D /home/tanel/Documents/public_transport_project/HardDrive/backup -Ft -z -P
```
use this command  ```bash python3 -m http.server``` in folder and then open browser and just download to pc

