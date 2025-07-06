package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"real-time/internal/view"
	"sync"
	"time"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// RegisterHandler handles user registration requests
func (h *Handler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		error := h.errBroadCast(http.StatusMethodNotAllowed, "Method not allowed")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	var input RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		error := h.errBroadCast(http.StatusBadRequest, "Bad Request")
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
		error := h.errBroadCast(http.StatusBadRequest, err.Error())
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
		error := h.errBroadCast(http.StatusBadRequest, "Bad Request")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	token, err := h.service.Login(&input)
	if err != nil {
		error := h.errBroadCast(http.StatusBadRequest, err.Error())
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
	session_token, err := r.Cookie("session_token")

	if err != nil {
		error := h.errBroadCast(http.StatusUnauthorized, "Unauthorized access")
		w.WriteHeader(http.StatusUnauthorized)
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
		error := h.errBroadCast(http.StatusUnauthorized, "Unauthorized access")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
	}

	// after the user id we'll retrieve the user name

	userName, err := h.service.repo.GetUserNameById(userId)

	if err != nil {
		error := h.errBroadCast(http.StatusInternalServerError, "Internal Server Error")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
			"state":       "false",
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"state": "true",
		"user_id": userId,
		"nickname": userName,
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

func (h *Handler) errBroadCast(status int, errMsg string) *view.Error {
	errorMsg := view.Error{
		Mutex: &sync.Mutex{},
	}
	errorMsg.Mutex.Lock()
	errorMsg.StatusCode = status
	errorMsg.ErrMessage = errMsg
	errorMsg.Mutex.Unlock()

	return &errorMsg

}
