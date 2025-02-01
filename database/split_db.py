import sqlite3
import os

# Paths
source_db = "C:/home/tanel/Documents/public_transport_project/HardDrive/data.db"
output_dir = "C:/home/tanel/Documents/public_transport_project/HardDrive"

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Open the source database
conn = sqlite3.connect(source_db)
cursor = conn.cursor()

# Query to fetch unique year-month combinations
cursor.execute(
    """
SELECT DISTINCT strftime('%Y', date) AS year, strftime('%m', date) AS month
FROM features
ORDER BY year, month;
"""
)
months = cursor.fetchall()  # List of (year, month) tuples

# Split the data into subdatabases
for year, month in months:
    # Create the new database file for the year and month
    sub_db_name = f"{year}-{month}.db"
    sub_db_path = os.path.join(output_dir, sub_db_name)
    sub_conn = sqlite3.connect(sub_db_path)
    sub_cursor = sub_conn.cursor()

    # Copy the schema from the source database and rename the table
    cursor.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='features';"
    )
    create_table_sql = cursor.fetchone()[0]
    create_table_sql = create_table_sql.replace(
        "features", "realtimetxt"
    )  # Rename the table
    sub_cursor.execute(create_table_sql)

    # Insert rows for the specific year and month
    sub_cursor.execute(
        """
    INSERT INTO realtimetxt
    SELECT *
    FROM features
    WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ?;
    """,
        (year, month),
    )

    # Commit and close the subdatabase
    sub_conn.commit()
    sub_conn.close()

    print(f"Data for {year}-{month} saved to {sub_db_path}")

# Close the source database
conn.close()
