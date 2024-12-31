import os

# Path to your SQLite database file
db_path = "/home/tanel/Documents/public_transport_project/HardDrive/data.db"

# Get the size of the database file in bytes
db_size = os.path.getsize(db_path)

# Convert the size to a human-readable format (KB, MB, GB)
def format_size(size_in_bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.2f} {unit}"
        size_in_bytes /= 1024.0

# Print the formatted database size
print(f"Database size: {format_size(db_size)}")