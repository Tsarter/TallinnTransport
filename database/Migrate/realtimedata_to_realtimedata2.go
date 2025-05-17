package main

import (
	"database/sql"
	"fmt"
	"log"
	"math"
	"os"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

type DataRow struct {
	Datetime    time.Time
	Line        string
	VehicleID   string
	Lon         float64
	Lat         float64
	Direction   sql.NullInt32
	Destination sql.NullString
	Type        sql.NullInt32
	Unknown1    sql.NullString
	Unknown2    sql.NullString
}

type PrevData struct {
	Datetime time.Time
	Lon      float64
	Lat      float64
}

func calculateSpeed(prev PrevData, curr DataRow) sql.NullInt32 {
	if prev.Datetime.IsZero() {
		return sql.NullInt32{}
	}
	distance := haversine(prev.Lat, prev.Lon, curr.Lat, curr.Lon)
	timeDiff := curr.Datetime.Sub(prev.Datetime).Seconds()
	if timeDiff > 0 && timeDiff < 45 {
		speed := int32(math.Min((distance/timeDiff)*3.6, 255))
		return sql.NullInt32{Int32: speed, Valid: true}
	}
	return sql.NullInt32{}
}

func haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371000 // Earth radius in meters
	dLat := (lat2 - lat1) * (math.Pi / 180)
	dLon := (lon2 - lon1) * (math.Pi / 180)
	lat1 = lat1 * (math.Pi / 180)
	lat2 = lat2 * (math.Pi / 180)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1)*math.Cos(lat2)*math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

	
	func insertRow(db *sql.DB, row []interface{}) error {
		// Prepare SQL query to insert a single row
		query := `
			INSERT INTO realtimedata2 (datetime, type, line, vehicle_id, direction, destination, geom, unknown1, unknown2, speed)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			ON CONFLICT (datetime, vehicle_id) DO NOTHING;
		`
	
		// Execute the query with the row data
		_, err := db.Exec(query, row...)
		if err != nil {
			return fmt.Errorf("failed to insert row: %v", err)
		}
		return nil
	}
	
	func migrateData() {
		// Establish connection to the PostgreSQL database
		_ = godotenv.Load("/home/tanel/Documents/public_transport_project/iaib/database/env.env")
		db, err := sql.Open("pgx", fmt.Sprintf("postgres://%s:%s@%s:%s/%s",
			os.Getenv("PG_TANEL_USER"),
			os.Getenv("PG_TANEL_PASSWORD"),
			os.Getenv("POSTGRES_HOST"),
			os.Getenv("POSTGRES_PORT"),
			os.Getenv("POSTGRES_DB"),
		))
		if err != nil {
			log.Fatalf("Error connecting to the database: %v", err)
		}
		defer db.Close()
	
		// Process data row by row
		date := "2024-07-07"
		nextDate := "2024-07-08"
		endDate := time.Now().Format("2006-01-02")
		prevData := make(map[string]time.Time)
	
		performanceStart := time.Now()
	
		// Loop over dates to process
		for date < endDate {
			log.Printf("Processing date: %s", date)
	
			// Query for a single day of data
			query := fmt.Sprintf(`
				SELECT datetime, line, vehicle_id, ST_X(geom::geometry) AS lon, ST_Y(geom::geometry) AS lat, direction, destination, type, unknown1, unknown2
				FROM realtimedata
				WHERE datetime >= '%s' AND datetime < '%s'
				ORDER BY vehicle_id, datetime;
			`, date, nextDate)
	
			rows, err := db.Query(query)
			if err != nil {
				log.Fatalf("Error executing query: %v", err)
			}
			defer rows.Close()
	
			// Process each row one by one
			for rows.Next() {
				var dt time.Time
				var line, vehicleID string
				var unknown1, unknown2, destination sql.NullString
				var lon, lat float64
				var type_, direction int
	
				err := rows.Scan(&dt, &line, &vehicleID, &lon, &lat, &direction, &destination, &type_, &unknown1, &unknown2)
				if err != nil {
					log.Fatalf("Error scanning row: %v", err)
				}
	
				// Calculate speed
				// Construct PrevData from prevData map
				prev := PrevData{}
				if prevTime, exists := prevData[vehicleID]; exists {
					prev = PrevData{
						Datetime: prevTime,
						Lon:      lon,
						Lat:      lat,
					}
				}

				// Construct DataRow for the current row
				curr := DataRow{
					Datetime:  dt,
					Line:      line,
					VehicleID: vehicleID,
					Lon:       lon,
					Direction: sql.NullInt32{}, // Adjust as needed
					Destination: sql.NullString{}, // Adjust as needed
					Type:        sql.NullInt32{}, // Adjust as needed
					Unknown1:    sql.NullString{}, // Adjust as needed
					Unknown2:    sql.NullString{}, // Adjust as needed
				}

				// Calculate speed
				speed := calculateSpeed(prev, curr)
				prevData[vehicleID] = dt
	
				// Create the row data to be inserted
				row := []interface{}{dt, type_, line, vehicleID, direction, destination, fmt.Sprintf("SRID=4326;POINT(%f %f)", lon, lat), unknown1, unknown2, speed}
	
				// Insert the row into the database
				err = insertRow(db, row)
				if err != nil {
					log.Printf("Error inserting row for vehicle %s: %v", vehicleID, err)
				}
			}
	
			// Handle potential row iteration error
			if err := rows.Err(); err != nil {
				log.Fatalf("Error iterating over rows: %v", err)
			}
	
			// Move to the next day
			date = nextDate
			// Assume we are using "YYYY-MM-DD" format, so increment the date by 1
			nextDate = time.Now().AddDate(0, 0, 1).Format("2006-01-02")
		}
	
		performanceEnd := time.Now()
		log.Printf("Total time spent: %v", performanceEnd.Sub(performanceStart))
	}
	
	func main() {
		// Start the migration process
		migrateData()
	}

