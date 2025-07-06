package post

import (
	"errors"
	"fmt"
	"strings"
)

type Service struct {
	repo PostRepository
}

func NewService(repo PostRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) AddPost(post *Post) (*PostDTO, error) {
	// Retrieve form values
	title := strings.TrimSpace(post.Title)
	content := strings.TrimSpace(post.Content)
	categories := post.Categories // Retrieves multiple values
	if title == "" || content == "" {
		fmt.Println("here 1")
		return nil, errors.New("please fill in all the fields")
	}

	for _, cat := range categories {
		cat = strings.TrimSpace(cat)
		if cat == "" {
			fmt.Println("here 2")

			return nil, errors.New("please fill in all the fields")
		}
	}

	postDTO, err := s.repo.CreatePost(post)
	if err != nil {
		fmt.Println("here 3")

	}
	return postDTO, nil
}
