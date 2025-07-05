package auth

import (
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"math/rand/v2"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo UserRepository
}

func NewService(repo UserRepository) *Service {
	return &Service{repo: repo}
}

// Register a new user after validating inputs and hashing password.
func (s *Service) Register(input RegisterInput) error {
	// Basic validation (can be expanded)
	if input.Nickname == "" || input.Email == "" || input.Password == "" {
		return errors.New("nickname, email and password are required")
	}
	// Check if user already exists
	if _, err := s.repo.FindByEmail(input.Email); err == nil {
		return errors.New("email already registered")
	}
	if _, err := s.repo.FindByNickname(input.Nickname); err == nil {
		return errors.New("nickname already taken")
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user := &User{
		ID:           uuid.NewString(),
		Nickname:     input.Nickname,
		Age:          input.Age,
		Gender:       input.Gender,
		FirstName:    input.FirstName,
		LastName:     input.LastName,
		Email:        strings.ToLower(input.Email),
		PasswordHash: string(hashed),
	}

	return s.repo.CreateUser(user)
}

// Authenticate user by identifier (email or nickname) and password
func (s *Service) Login(input *LoginInput) (string, error) {
	user, err := s.repo.FindByIdentifier(strings.ToLower(input.Identifier))
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	token, err := s.GenerateToken(user.ID)

	if err != nil {
		return "", err
	}

	token, err = s.repo.CreateSession(token, user.ID)

	if err != nil {
		return "", err
	}

	return token, nil
}


func (s *Service) GenerateToken(userId string) (string, error) {
	intUserId, err := strconv.Atoi(userId)
	if err != nil {
		return "", err
	}

	now := time.Now().UnixNano()
	randNum := rand.Uint64()
	plainToken := fmt.Sprintf("%d%d%d", randNum, intUserId, now)

	hasher := sha256.New()
	hasher.Write([]byte(plainToken))
	hashedToken := hasher.Sum(nil)

	// Encode as base64 string
	hashedTokenBase64 := base64.StdEncoding.EncodeToString(hashedToken)

	return hashedTokenBase64, nil
}
