package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("/home/tanel/Documents/public_transport_project/iaib/database/env.env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("PG_TANEL_USER"), os.Getenv("PG_TANEL_PASSWORD"),
		os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_PORT"), os.Getenv("POSTGRES_DB"))

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	ctx := context.Background()

	startTime := time.Date(2024, 7, 6, 13, 0, 0, 0, time.UTC)
	endTime := startTime.Add(time.Hour)

	for {
		query := `
		WITH vehicle_movements AS (
			SELECT 
				vehicle_id,
				datetime,
				line,
				geom,
				LEAD(datetime) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_datetime,
				LEAD(geom) OVER (PARTITION BY vehicle_id ORDER BY datetime) AS next_geom
			FROM realtimedata 
			WHERE datetime >= $1 AND datetime < $2
			ORDER BY datetime
		),
		speed_calculation AS (
			SELECT 
				vehicle_id,
				datetime,
				line,
				next_datetime,
				ST_Distance(geom::geography, next_geom::geography) AS distance_meters,
				EXTRACT(EPOCH FROM (next_datetime - datetime)) AS time_seconds
			FROM vehicle_movements
			WHERE next_datetime IS NOT NULL
		)
		SELECT 
			vehicle_id,
			line,
			datetime,
			(distance_meters / time_seconds) * 3.6 AS speed_kmh
		FROM speed_calculation
		WHERE time_seconds > 15 AND time_seconds <= 40
		ORDER BY datetime;`

		rows, err := db.QueryContext(ctx, query, startTime, endTime)
		if err != nil {
			log.Fatalf("Query failed: %v", err)
		}
		defer rows.Close()

		var updates []struct {
			Speed     int
			Datetime  time.Time
			Line      string
			VehicleID string
		}

		for rows.Next() {
			var vehicleID string
			var line string
			var datetime time.Time
			var speedKmh float64
			if err := rows.Scan(&vehicleID, &line, &datetime, &speedKmh); err != nil {
				log.Fatalf("Row scan failed: %v", err)
			}

			speed := int(speedKmh)
			if speed <= 100 {
				updates = append(updates, struct {
					Speed     int
					Datetime  time.Time
					Line      string
					VehicleID string
				}{speed, datetime, line, vehicleID})
			}
		}

		if len(updates) == 0 {
			fmt.Printf("No results for the time range %v to %v.\n", startTime, endTime)
			break
		}

		fmt.Printf("Found %d speeds to insert for the hour %v to %v.\n", len(updates), startTime, endTime)

		// Batch update
		updateQuery := `
			UPDATE realtimedata
			SET speed = $1
			WHERE datetime = $2
			  AND line = $3
			  AND vehicle_id = $4;`

		for _, update := range updates {
			_, err := db.ExecContext(ctx, updateQuery, update.Speed, update.Datetime, update.Line, update.VehicleID)
			if err != nil {
				log.Fatalf("Update failed: %v", err)
			}
		}

		// Move to the next hour
		startTime = endTime
		endTime = startTime.Add(time.Hour)
	}
}
