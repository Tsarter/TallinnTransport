import unittest
from datetime import datetime, timedelta
from geopy.distance import geodesic
from data_to_timescaledb import calculate_speed, prev_locations

class TestCalculateSpeed(unittest.TestCase):
    def setUp(self):
        # Clear the global prev_locations dictionary before each test
        global prev_locations
        prev_locations = {}
    
    def test_calculate_speed_no_previous_location(self):
        row = ["", "", "24000000", "6000000", "", "", "1", "", "", ""]
        current_time = datetime.now()
        speed = calculate_speed(row, current_time)
        self.assertEqual(speed, -1)  # Default speed when no previous location exists

    def test_calculate_speed_with_previous_location_valid_time_diff(self):
        vehicle_id = "2"
        prev_row = ["", "", "24000000", "6000000", "", "", vehicle_id, "", "", ""]
        current_time = datetime.now()
        calculate_speed(prev_row, datetime.now() - timedelta(seconds=30))
        row = ["", "", "24000100", "6000010", "", "", vehicle_id, "", "", ""]
        speed = int(calculate_speed(row, current_time))
        distance = geodesic((6.0, 24.0), (6.00001, 24.0001)).meters
        expected_speed = min(250, distance / 30 * 3.6)
        self.assertAlmostEqual(speed, expected_speed, places=2)

    def test_calculate_speed_with_previous_location_invalid_time_diff(self):
        vehicle_id = "3"
        prev_row = ["", "", "24000000", "6000000", "", "", vehicle_id, "", "", ""]
        calculate_speed(prev_row, datetime.now() - timedelta(seconds=400))
        row = ["", "", "24000100", "6000010", "", "", vehicle_id, "", "", ""]
        current_time = datetime.now()
        speed = calculate_speed(row, current_time)
        self.assertEqual(speed, -1)  # Speed should be -1 due to invalid time difference
        
    def test_calculate_speed_with_previous_location_exceeds_max_speed(self):
        vehicle_id = "4"
        prev_row = ["", "", "24000000", "6000000", "", "", vehicle_id, "", "", ""]
        calculate_speed(prev_row, datetime.now() - timedelta(seconds=30))
        row = ["", "", "25000100", "6000010", "", "", vehicle_id, "", "", ""]
        current_time = datetime.now()
        speed = int(calculate_speed(row, current_time))
        distance = geodesic((6.0, 24.0), (6.00001, 25.0001)).meters
        expected_speed = min(250, distance / 30 * 3.6)
        self.assertAlmostEqual(speed, expected_speed, places=2)
       
if __name__ == "__main__":
    unittest.main()