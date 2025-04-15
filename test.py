from datetime import timedelta

# Each entry: (duration in minutes, distance in km)
trips1 = [
    (28, 8.12),
    (28, 8.12),
    (32.5, 8.12),
    (32, 8.12),
    (32, 8.12),
    (29.5, 8.12),
    (35, 8.12),
    (29.5, 8.12),
    (33.5, 8.12),
    (30, 8.12),     # No distance given
    (33, 8.12),
    (30, 8.12),
]
trips3 = [
    (6.5,2.1)
]
trips = trips1 + trips3
total_minutes = 0
total_distance = 0
distance_count = 0

for duration, distance in trips:
    total_minutes += duration
    if distance is not None:
        total_distance += distance
        distance_count += 1
total_distance -= 0.25 * distance_count
# Average speed = total distance / total time in hours
total_time_hours = total_minutes / 60
average_speed = total_distance / total_time_hours if total_time_hours > 0 else 0

# Pretty formatting
total_time = timedelta(minutes=total_minutes)

print(f"Total time: {total_time}")
print(f"Total distance: {total_distance:.2f} km")
print(f"Average speed: {average_speed:.2f} km/h")

