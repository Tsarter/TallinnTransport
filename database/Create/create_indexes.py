import sqlite3

conn = sqlite3.connect(
    "/home/tanel/Documents/public_transport_project/HardDrive/data.db"
)
cursor = conn.cursor()

#cursor.execute(
#    """
#CREATE INDEX idx_type_line_destination ON features(line, destination,type);
#"""
#)

cursor.execute(
    """
CREATE INDEX idx_datetime ON features(date, time);
"""
)


conn.commit()
conn.close()
