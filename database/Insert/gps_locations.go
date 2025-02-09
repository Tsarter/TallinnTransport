package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "github.com/lib/pq"
)

// Define the structure of the JSON file
type FeatureCollection struct {
	Type      string    `json:"type"`
	Timestamp string    `json:"timestamp"`
	Features  []Feature `json:"features"`
}

type Feature struct {
	Type       string     `json:"type"`
	Properties Properties `json:"properties"`
	Geometry   Geometry   `json:"geometry"`
}

type Properties struct {
	ID        int    `json:"id"`
	Type      int    `json:"type"`
	Line      string `json:"line"`
	Direction int    `json:"direction"`
}

type Geometry struct {
	Type        string    `json:"type"`
	Coordinates []float64 `json:"coordinates"`
}

const (
	dbHost     = "localhost"
	dbPort     = 5432
	dbUser     = "your_user"
	dbPassword = "your_password"
	dbName     = "your_database"
)

func main() {
	// Connect to PostgreSQL
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Define the path to your folder
	basePath := "realtime_data"
	err = filepath.Walk(basePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && filepath.Ext(path) == ".json" {
			fmt.Println("Processing:", path)
			processJSONFile(db, path)
		}
		return nil
	})

	if err != nil {
		log.Fatal(err)
	}
}

func processJSONFile(db *sql.DB, filePath string) {
	// Read the JSON file
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Println("Error reading file:", filePath, err)
		return
	}

	// Parse JSON
	var fc FeatureCollection
	err = json.Unmarshal(data, &fc)
	if err != nil {
		log.Println("Error parsing JSON:", filePath, err)
		return
	}

	// Convert timestamp to time.Time
	timestamp, err := time.Parse(time.RFC3339, fc.Timestamp)
	if err != nil {
		log.Println("Invalid timestamp:", filePath, err)
		return
	}

	// Insert each feature into the database
	for _, feature := range fc.Features {
		_, err := db.Exec(`
            INSERT INTO realtimedata (datetime, type, line, vehicle_id, direction, geom) 
            VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326))
            ON CONFLICT (datetime, line, vehicle_id) DO NOTHING;
        `, timestamp, feature.Properties.Type, feature.Properties.Line, feature.Properties.ID,
			feature.Properties.Direction, feature.Geometry.Coordinates[0], feature.Geometry.Coordinates[1])

		if err != nil {
			log.Println("Error inserting data:", err)
		}
	}
}
