package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	database "real-time/internal/db"
	router "real-time/internal/router"
	view "real-time/internal/view"
)

func main() {
	var err error
	// check if there is database file, if not create it
	if _, err = os.Stat("forum_db.db"); os.IsNotExist(err) {
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

	view.Tmpl, err = template.ParseGlob("./public/*.html")

	if err != nil {
		log.Fatal(err)
	}

	// open the db 
	db, err := sql.Open("sqlite3", "forum_db.db")
	
	if err != nil {
		log.Fatal(err)
	}

	mux := router.SetupRoutes(db)
	fmt.Println("server started on http://localhost:8080")
	http.ListenAndServe(":8080", mux)

}
