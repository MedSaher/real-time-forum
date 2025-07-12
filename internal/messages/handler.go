package messages

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time/internal/hub"
	"strconv"
)

// Create a struct to represent the:
type Handler struct {
	Service *Service
	Hub     *hub.Hub
}

// Instantiate a new Messages handler:
func NewHandler(messSer *Service, hub *hub.Hub) *Handler {
	return &Handler{Service: messSer, Hub: hub}
}

func (h *Handler) InsertMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	session_token, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}
	userId, err := h.Service.MessageRepo.GetUserIdBySession(session_token.Value)
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}
	var Msg Message
	Msg.SenderId = userId

	json.NewDecoder(r.Body).Decode(&Msg)
	// check if receiever exists and skip sending message to himself
	if userId == Msg.RecieverId {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	if h.Service.MessageRepo.GetUserById(Msg.RecieverId) {
		h.Service.MessageRepo.InsertMessage(&Msg)
		if h.Hub.Clients[Msg.RecieverId] != nil {
			msg := hub.Message{Type: "new_message", Data: Msg.SenderId}
			data, err := json.Marshal(msg)
			if err != nil {
				http.Error(w, "Internal Server error", http.StatusInternalServerError)
				return
			}
			h.Hub.Broadcast <- data

		}
	} else {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

}

// Get chat history between the client and the chosen user:
func (h *Handler) GetChatHistoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userIDParam := r.URL.Query().Get("user_id")
	if userIDParam == "" {
		http.Error(w, "Missing user_id parameter", http.StatusBadRequest)
		return
	}

	guestId, err := strconv.Atoi(userIDParam)
	if err != nil {
		http.Error(w, "Invalid user_id format", http.StatusBadRequest)
		return
	}

	// Handle offset and limit
	offset, limit := h.Service.ParseLimitOffset(r)

	// Session check
	cookie, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Unauthorized: missing session token", http.StatusUnauthorized)
		return
	}
	sessionToken := cookie.Value

	// Get messages
	messages, err := h.Service.GetChatHistoryService(guestId, sessionToken, offset, limit)

	if err != nil {
		if err.Error() == "user has no session" {
			http.Error(w, err.Error(), http.StatusUnauthorized)
		} else {
			http.Error(w, "Failed to retrieve messages", http.StatusInternalServerError)
		}
		return
	}

	// Send proper JSON response even when messages are empty
	w.Header().Set("Content-Type", "application/json")
	if messages == nil {
		messages = []*Message{}
	}
	json.NewEncoder(w).Encode(messages)
}

func (h *Handler) NotifsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	session_token, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}
	userId, err := h.Service.MessageRepo.GetUserIdBySession(session_token.Value)
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}

	messages, err := h.Service.MessageRepo.GetUnreadMessages(userId)

	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(&messages)
}

// Mark a message as read:
func (h *Handler) MarkMessageAsRead(w http.ResponseWriter, r *http.Request) {
	fromIDStr := r.URL.Query().Get("from_id")
	fromID, err := strconv.Atoi(fromIDStr)
	if err != nil || fromID <= 0 {
		http.Error(w, "Invalid sender ID", http.StatusBadRequest)
		return
	}

	cookie, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Unauthorized access", http.StatusUnauthorized)
		return
	}

	userID, err := h.Service.MessageRepo.GetUserIdBySession(cookie.Value)
	if err != nil {
		http.Error(w, "Unauthorized access", http.StatusUnauthorized)
		return
	}

	err = h.Service.MarkMessageAsRead(fromIDStr, userID)
	if err != nil {
		http.Error(w, "Failed to mark as read", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
	})
}
