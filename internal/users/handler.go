package users

import (
	"encoding/json"
	"net/http"
	"real-time/internal/hub"
	"real-time/internal/view"
)

type Handler struct {
	Service *Service
	Hub     *hub.Hub
}

func NewHandler(service *Service, hub *hub.Hub) *Handler {
	return &Handler{Service: service, Hub: hub}
}

func (h *Handler) UsersHandler(w http.ResponseWriter, r *http.Request) {
	var erro view.Error
	if r.Method != http.MethodPost {
		error := erro.ErrBroadCast(http.StatusMethodNotAllowed, "Method not allowed")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	session_token, err := r.Cookie("session_token")
	if err != nil {
		error := erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized Acess")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
		return
	}

	_, err = h.Service.repo.GetUserIdBySession(session_token.Value)
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
	users, err := h.Service.GetAllUsers(h.Hub)
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
	json.NewEncoder(w).Encode(users)

}
