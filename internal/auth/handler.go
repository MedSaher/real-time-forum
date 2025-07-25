package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"real-time/internal/hub"
	"real-time/internal/view"
)

type Handler struct {
	service *Service
	Hub     *hub.Hub
}

func NewHandler(service *Service, hub *hub.Hub) *Handler {
	return &Handler{service: service, Hub: hub}
}

var erro view.Error

// RegisterHandler handles user registration requests
func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		error := erro.ErrBroadCast(http.StatusMethodNotAllowed, "Method not allowed")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	var input RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		error := erro.ErrBroadCast(http.StatusBadRequest, "Bad Request")
		fmt.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	token, err := h.service.Register(input)
	if err != nil {
		error := erro.ErrBroadCast(http.StatusBadRequest, err.Error())
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		HttpOnly: true,  // Not accessible by JavaScript
		Secure:   false, // Set to true in HTTPS
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Now().Add(24 * time.Hour), // Adjust session duration
	})
}

// LoginHandler handles login requests
func (h *Handler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		error := erro.ErrBroadCast(http.StatusBadRequest, "Bad Request")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	token, err := h.service.Login(&input)
	if err != nil {
		error := erro.ErrBroadCast(http.StatusBadRequest, err.Error())
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		HttpOnly: true,  // Not accessible by JavaScript
		Secure:   false, // Set to true in HTTPS
		Path:     "/",
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Now().Add(24 * time.Hour), // Adjust session duration
	})
}

func (h *Handler) LoggedInHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	session_token, err := r.Cookie("session_token")
	if err != nil {
		error := erro.ErrBroadCast(http.StatusBadRequest, "Bad Request")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
		return
	}
	// Get the user Id to check if hr's connected
	userId, err := h.service.repo.GetUserIdBySession(session_token.Value)
	if err != nil {
		error := erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized access")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
		return
	}

	// after the user id we'll retrieve the user name

	userName, err := h.service.repo.GetUserNameById(userId)
	if err != nil {
		error := erro.ErrBroadCast(http.StatusInternalServerError, "Internal Server Error")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"state":    "true",
		"user_id":  userId,
		"nickname": userName,
	})
}

func (h *Handler) LogOutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	session_token, err := r.Cookie("session_token")
	if err != nil {
		error := erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized Access")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
		return
	}

	userId, err := h.service.repo.GetUserIdBySession(session_token.Value)
	if err != nil {
		error := erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized Access")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
		return
	}

	// Delete the session
	err = h.service.repo.DeleteSession(session_token.Value)
	if err != nil {
		error := erro.ErrBroadCast(http.StatusInternalServerError, "Internal Server Error")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
		return
	}

	// Broadcast logout to all clients (including other tabs of the same user)
	if h.Hub != nil {
		// Close all WebSocket connections for this user
		h.Hub.Mutex.Lock()
		if client, ok := h.Hub.Clients[userId]; ok {
			close(client.Send)
			delete(h.Hub.Clients, userId)
		}
		h.Hub.Mutex.Unlock()

		// Broadcast user offline status
		msg := hub.Message{
			Type: "online_users",
			Data: map[string]string{"user_id": userId},
		}
		msgBytes, err := json.Marshal(msg)
		if err == nil {
			h.Hub.Broadcast <- msgBytes
		}
	}

	// Clear the cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		HttpOnly: true,
		Secure:   false,
		Path:     "/",
		MaxAge:   -1, // Immediately expire the cookie
	})

	json.NewEncoder(w).Encode(map[string]interface{}{
		"state": "true",
	})
}

func (h *Handler) FormHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	view.Tmpl.ExecuteTemplate(w, "register.html", nil)
}

func (h *Handler) MainHandler(w http.ResponseWriter, r *http.Request) {
	view.Tmpl.ExecuteTemplate(w, "index.html", nil)
}
