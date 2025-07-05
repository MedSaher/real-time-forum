package router

import (
	"database/sql"
	"net/http"
	"real-time/internal/auth"
)

// SetupRoutes initializes and returns the HTTP router with all API routes registered.
func SetupRoutes(db *sql.DB) *http.ServeMux {
	mux := http.NewServeMux()

	// Serve static files from "./public" directory
	cssFileServer := http.FileServer(http.Dir("./public/css"))
	jsFileServer := http.FileServer(http.Dir("./public/js"))

	// Strip / from the request path and serve matching files
	mux.Handle("/public/css/", http.StripPrefix("/public/css", cssFileServer))
	mux.Handle("/public/js/", http.StripPrefix("/public/js", jsFileServer))

	// Initialize the auth layer components
	userRepo := auth.NewUserRepository(db)
	authService := auth.NewService(userRepo)
	authHandler := auth.NewHandler(authService)

	// Auth routes
	mux.HandleFunc("/api/register", authHandler.RegisterHandler)
	mux.HandleFunc("/api/login", authHandler.LoginHandler)
	mux.HandleFunc("/auth", authHandler.FormHandler)
	mux.HandleFunc("/", authHandler.MainHandler)

	// Other module routes would be registered similarly
	// mux.HandleFunc("/api/posts", postsHandler.PostsHandler)
	// mux.HandleFunc("/api/chat/ws", chatHandler.WebSocketHandler)

	return mux
}
