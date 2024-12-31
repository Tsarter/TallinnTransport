import sqlite3

# Step 1: Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect("/home/tanel/Documents/public_transport_project/HardDrive/data.db")
cursor = conn.cursor()

# Step 2: Create the table structure (if it doesn't already exist)
cursor.execute("""
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
""")

conn.commit()
conn.close()