package users

import (
	"real-time/internal/hub"
	"sort"
)

type Service struct {
	repo UsersRepository
}

func NewService(repo UsersRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetAllUsers(hub *hub.Hub) ([]*User, error) {
	users, err := s.repo.GetAllUsers()
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
	// sort by online
	sort.Slice(users, func(i, j int) bool {
		return users[i].Status && !users[j].Status
	})
	return users, nil
}
