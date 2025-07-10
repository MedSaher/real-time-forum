package router

import (
	"database/sql"
	"net/http"
	"real-time/internal/auth"
	"real-time/internal/hub"
	"real-time/internal/messages"
	"real-time/internal/post"
	"real-time/internal/users"
)

// SetupRoutes initializes and returns the HTTP router with all API routes registered.
func SetupRoutes(db *sql.DB) *http.ServeMux {
	mux := http.NewServeMux()

	// ws handler
	// a hub
	hubS := hub.NewHub()
	go hubS.Run()

	wsRepo := hub.NewWSRepository(db)
	wsService := hub.NewService(wsRepo)
	wsHandler := hub.NewHandler(wsService, hubS)

	mux.HandleFunc("/ws", wsHandler.WebSocketHandler)
	// Serve static files from "./public" directory
	cssFileServer := http.FileServer(http.Dir("./public/css"))
	jsFileServer := http.FileServer(http.Dir("./public/js"))

	// Strip / from the request path and serve matching files
	mux.Handle("/public/css/", http.StripPrefix("/public/css", cssFileServer))
	mux.Handle("/public/js/", http.StripPrefix("/public/js", jsFileServer))

	// Initialize the auth layer components
	userRepo := auth.NewUserRepository(db)
	authService := auth.NewService(userRepo)
	authHandler := auth.NewHandler(authService, hubS)

	// Auth routes
	mux.HandleFunc("/api/register", authHandler.RegisterHandler)
	mux.HandleFunc("/api/session", authHandler.LoggedInHandler)
	mux.HandleFunc("/api/login", authHandler.LoginHandler)
	mux.HandleFunc("/auth", authHandler.FormHandler)
	mux.HandleFunc("/", authHandler.MainHandler)

	// Initialize the post layer components
	postRepo := post.NewPostRepository(db)
	postService := post.NewService(postRepo)
	postHandler := post.NewHandler(postService, hubS)

	// Post routes
	mux.HandleFunc("/api/add_post", postHandler.CreatePost)
	mux.HandleFunc("/api/fetch_posts", postHandler.FetchPosts)

	// initialize users layers
	usersRepo := users.NewRepository(db)
	usersService := users.NewService(usersRepo)
	usersHandler := users.NewHandler(usersService, hubS)

	// users routes
	mux.HandleFunc("/api/users", usersHandler.UsersHandler)

	// initialize messages layers
	msgsRepo := messages.NewRepository(db)
	msgsService := messages.NewService(msgsRepo)
	msgsHandler := messages.NewHandler(msgsService)

	mux.HandleFunc("/api/send_message", msgsHandler.InsertMessage)

	// Other module routes would be registered similarly
	// mux.HandleFunc("/api/posts", postsHandler.PostsHandler)
	// mux.HandleFunc("/api/chat/ws", chatHandler.WebSocketHandler)

	return mux
}
