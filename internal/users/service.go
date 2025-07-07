package users

import (
	"fmt"
	"real-time/internal/hub"
)

type Service struct {
	repo UsersRepository
}

func NewService(repo UsersRepository) *Service{
	return &Service{repo: repo}
}

func (s *Service) GetAllUsers(hub *hub.Hub) ([]*User, error) {
	users, err := s.repo.GetAllUsers()
	if err != nil {
		return nil, err
	}
	for _, user := range users {
		fmt.Println(user.Nickname)
	}
	fmt.Println("===========")
	for _, user := range hub.Clients {
		fmt.Println(user.UserID)
	}
	return nil, nil
}