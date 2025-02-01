import sqlite3

conn = sqlite3.connect(
    "/home/tanel/Documents/public_transport_project/HardDrive/data.db"
)
cursor = conn.cursor()
# cursor.execute("PRAGMA journal_mode=WAL;")

# Set the batch size for each fetch
batch_size = 10000
offset = 0

while True:
    cursor.execute("""
    SELECT * FROM features
    WHERE line = "3" AND destination = "Kadriorg" AND type = "3"
    LIMIT ? OFFSET ?;
    """, (batch_size, offset))
    
    results = cursor.fetchall()
    
    if not results:
        break
    
    # Process the current batch of results
    print(len(results))
    
    # Increment the offset for the next batch
    offset += batch_size

conn.commit()
conn.close()

conn.commit()
conn.close()
