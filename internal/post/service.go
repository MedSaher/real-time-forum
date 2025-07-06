package post

import (
	"errors"
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
		return nil, errors.New("please fill in all the fields")
	}

	for _, cat := range categories {
		cat = strings.TrimSpace(cat)
		if cat == "" {

			return nil, errors.New("please fill in all the fields")
		}
	}

	postDTO, err := s.repo.CreatePost(post)
	if err != nil {
		return nil, err
	}
	return postDTO, nil
}
