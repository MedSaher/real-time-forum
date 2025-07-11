package post

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

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
		error := erro.ErrBroadCast(http.StatusMethodNotAllowed, "Method not allowed")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": error.StatusCode,
			"error":       error.ErrMessage,
		})
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
	userId, err := h.Service.repo.GetUserIdBySession(session_token.Value)
	if err != nil {
		error := erro.ErrBroadCast(http.StatusUnauthorized, "Unauthorized Acess")
		w.WriteHeader(http.StatusUnauthorized)
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
	fmt.Println(post.Category)
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

func (h *Handler) FetchPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		erro.ErrBroadCast(http.StatusMethodNotAllowed, "Method not allowed")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status_code": erro.StatusCode,
			"error":       erro.ErrMessage,
		})
		return
	}

	session_token, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}
	_, err = h.Service.repo.GetUserIdBySession(session_token.Value)
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}

	posts, err := h.Service.repo.GetAllPosts()
	if err != nil {
		log.Fatal(err)
	}
	json.NewEncoder(w).Encode(&posts)
}

func (h *Handler) CommentHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	session_token, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}
	var comment Comment
	json.NewDecoder(r.Body).Decode(&comment)
	userId, err := h.Service.repo.GetUserIdBySession(session_token.Value)
	if err != nil {
		http.Error(w, "Unauthorized Access", http.StatusUnauthorized)
		return
	}
	comment.AuthorID = userId
	err = h.Service.repo.CreateComment(comment.PostId, comment.AuthorID, comment.Content)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

func (h *Handler) FetchCommentsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	queryParam := r.URL.Query()
	query := queryParam.Get("id")

	id, err := strconv.Atoi(query)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}
	
	comments, err := h.Service.repo.ShowComments(id)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(comments)
	for _, v := range comments {
		fmt.Println(v)
	}
}
