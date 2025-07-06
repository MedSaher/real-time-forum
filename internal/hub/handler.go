package hub

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time/internal/view"

	"github.com/gorilla/websocket"
)

type Handler struct {
	service *Service
	hub     *Hub
}

func NewHandler(service *Service, hubS *Hub) *Handler {
	return &Handler{service: service, hub: hubS}
}

var erro view.Error

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // for development only; allow all origins
	},
}

func (h *Handler) WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	// Check if user is logged in by reading the session cookie
	session, err := r.Cookie("session_token")

	if err != nil {
		error := erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	userId, err := h.service.wsRepo.GetUserIdBySession(session.Value)

	if err != nil {
		error := erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade failed:", err)
		return
	}

	log.Println("WS connection established for user:", userId)

	client := &Client{
		UserID: userId,
		Conn:   conn,
		Send:   make(chan []byte),
		Hub:    h.hub, // you need to pass the instance here
	}

	h.hub.Register <- client

	go client.ReadPump()
	go client.WritePump()

}
