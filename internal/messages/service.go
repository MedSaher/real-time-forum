package messages

import (
	"fmt"
	"net/http"
	"strconv"
)

// Create the employee that will execute the message sevice interface:
type Service struct {
	MessageRepo MessageRepositoryLayer
}

// Instantiate the message service:
func NewService(messRep MessageRepositoryLayer) *Service {
	return &Service{
		MessageRepo: messRep,
	}
}


// Get all the messages between the client and the chosen user:
func (s *Service) GetChatHistoryService(id int, sessionValue string, offset int, limit int) ([]*Message, error) {
	// Get client ID from session token
	clientId, err := s.MessageRepo.GetUserIdBySession(sessionValue)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired session token")
	}
	// Retrieve chat history between client and selected user
	return s.MessageRepo.GetChatHistory(clientId, id, offset, limit)
}

// mark message as read service:
func (s *Service) MarkMessageAsRead(fromID, userId string) error {
	err := s.MessageRepo.MarkMessagesAsRead(fromID, userId)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) ParseLimitOffset(r *http.Request) (offset, limit int) {
	offsetStr := r.URL.Query().Get("offset")
	limitStr := r.URL.Query().Get("limit")

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	limit, err = strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}
	return offset, limit
}
