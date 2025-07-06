package post

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time/internal/hub"
	"real-time/internal/view"
)

type Handler struct {
	Service *Service
	hub     *hub.Hub
}

var erro view.Error

func NewHandler(service *Service, hub *hub.Hub) *Handler {
	return &Handler{Service: service, hub: hub}
}
func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		erro.ErrBroadCast(http.StatusMethodNotAllowed, "Method not allowed")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": erro.StatusCode,
			"error":       erro.ErrMessage,
		})
	}

	session_token, err := r.Cookie("session_token")
	if err != nil {
		erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized Acess")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": erro.StatusCode,
			"error":       erro.ErrMessage,
		})
		return
	}
	userId, err := h.Service.repo.GetUserIdBySession(session_token.Value)
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
	var post Post
	post.AuthorID = userId
	json.NewDecoder(r.Body).Decode(&post)
	postDTO, err := h.Service.AddPost(&post)
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
	json.NewEncoder(w).Encode(postDTO)
	go func() {
		msg := hub.Message{
			Type: "new_post",
			Data: postDTO,
		}
		data, err := json.Marshal(msg)
		if err != nil {
			log.Println("Failed to marshal WS message:", err)
			return
		}

		h.hub.Broadcast <- data
	}()

}
