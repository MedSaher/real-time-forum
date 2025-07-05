package main

import (
	"log"
	"os"
	database "real-time/internal/db"
)

func main() {
	// check if there is database file, if not create it
	if _, err := os.Stat("forum_db.db"); os.IsNotExist(err) {
		file, err := os.Create("forum_db.db")
		if err != nil {
			log.Fatal(err)
		}
		err = database.CreateSchema()
		if err != nil {
			file.Close()
			log.Fatal(err)
		}
	}

}
