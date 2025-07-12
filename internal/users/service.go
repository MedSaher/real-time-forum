package users

import (
	"real-time/internal/hub"
)

type Service struct {
	repo UsersRepository
}

func NewService(repo UsersRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetAllUsers(hub *hub.Hub, userId string) ([]*User, error) {
	users, err := s.repo.GetAllUsers(userId)
	if err != nil {
		return nil, err
	}
	// mark users as online
	for _, client := range hub.Clients {
		for _, user := range users {
			if client.UserID == user.UserId {
				user.Status = true

			}
		}
	}
	return users, nil
}
