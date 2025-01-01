import sqlite3

# Outdated
conn = sqlite3.connect(
    "/home/tanel/Documents/public_transport_project/HardDrive/data.db"
)
cursor = conn.cursor()

cursor.execute(
    """
CREATE TABLE IF NOT EXISTS features (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    type INTEGER,
    line TEXT,
    latitude REAL,
    longitude REAL,
    direction INTEGER,
    unknown1 TEXT,
    unknown2 INTEGER,
    destination TEXT,
    vehicle_id INTEGER);
"""
)

cursor.execute(
    """
CREATE TABLE IF NOT EXISTS realtimejson (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    type INTEGER,
    line TEXT,
    latitude REAL,
    longitude REAL,
    direction INTEGER,
    vehicle_id INTEGER);
"""
)
conn.commit()
conn.close()
